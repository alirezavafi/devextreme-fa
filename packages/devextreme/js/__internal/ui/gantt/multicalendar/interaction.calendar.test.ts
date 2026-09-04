/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';
import { getCalendar } from '@ts/core/localization/calendar';

import {
  applyMove,
  applyResizeEnd,
  applyResizeStart,
  resolveDragMode,
  snapDate,
} from './interaction';
import { buildScaleModel } from './scale_model';
import type { TaskRect } from './task_layout';

const tuple = (date: Date): [number, number, number] => [
  date.getFullYear(), date.getMonth(), date.getDate(),
];

function daysScale() {
  return buildScaleModel({
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 11),
    scaleType: 'days',
    cellWidth: 50,
  });
}

const barRect: TaskRect = {
  id: 't', rowIndex: 0, left: 100, width: 80, top: 6, height: 22, progressWidth: 0, isMilestone: false, isParent: false, title: '',
};

describe('snapDate', () => {
  it('snaps to the nearest midnight', () => {
    expect(tuple(snapDate(new Date(2024, 0, 3, 10, 0)))).toEqual([2024, 0, 3]);
    expect(tuple(snapDate(new Date(2024, 0, 3, 13, 0)))).toEqual([2024, 0, 4]);
  });
});

describe('resolveDragMode', () => {
  it('detects resize edges and the move body', () => {
    expect(resolveDragMode(barRect, 102)).toBe('resizeStart');
    expect(resolveDragMode(barRect, 178)).toBe('resizeEnd');
    expect(resolveDragMode(barRect, 140)).toBe('move');
  });

  it('always moves milestones', () => {
    expect(resolveDragMode({ ...barRect, isMilestone: true }, 100)).toBe('move');
  });
});

describe('applyMove / applyResize (gregorian)', () => {
  const task = { id: 't', start: new Date(2024, 0, 3), end: new Date(2024, 0, 5) };

  it('moves the bar and preserves duration', () => {
    const result = applyMove(task, 100, daysScale()); // +2 day-cells
    expect(tuple(result.start)).toEqual([2024, 0, 5]);
    expect(tuple(result.end)).toEqual([2024, 0, 7]);
    expect(result.end.getTime() - result.start.getTime())
      .toBe(task.end.getTime() - task.start.getTime());
  });

  it('resizes the end edge only', () => {
    const result = applyResizeEnd(task, 50, daysScale());
    expect(tuple(result.start)).toEqual([2024, 0, 3]);
    expect(tuple(result.end)).toEqual([2024, 0, 6]);
  });

  it('clamps the start edge to keep a minimum duration', () => {
    const result = applyResizeStart(task, 400, daysScale()); // far past the end
    expect(result.start.getTime()).toBe(task.end.getTime() - 24 * 60 * 60 * 1000);
    expect(tuple(result.end)).toEqual([2024, 0, 5]);
  });

  it('clamps the end edge to keep a minimum duration', () => {
    const result = applyResizeEnd(task, -400, daysScale());
    expect(result.end.getTime()).toBe(task.start.getTime() + 24 * 60 * 60 * 1000);
  });
});

describe('applyMove (persian, calendar-aware)', () => {
  it('drags one column to the next persian month while storing a Gregorian date', () => {
    const start = new Date(2024, 2, 20); // Farvardin 1, 1403
    const scale = buildScaleModel({
      startDate: start,
      endDate: new Date(2024, 5, 20),
      scaleType: 'months',
      calendar: 'persian',
      cellWidth: 100,
    });
    const persian = getCalendar('persian');
    const startMonth = persian.toParts(start).month;

    const result = applyMove(
      { id: 't', start, end: new Date(2024, 2, 25) },
      100, // one month column
      scale,
    );

    const parts = persian.toParts(result.start);
    expect(parts.month).toBe(startMonth + 1); // advanced one Persian month
    expect(parts.day).toBe(1);
    expect(result.start).toBeInstanceOf(Date); // value remains Gregorian
  });
});
