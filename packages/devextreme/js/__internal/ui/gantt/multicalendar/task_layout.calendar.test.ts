/* eslint-disable @typescript-eslint/no-non-null-assertion -- fixtures guarantee presence */
/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';

import { buildScaleModel } from './scale_model';
import type { GanttTaskInput } from './task_layout';
import { layoutDependencies, layoutTasks } from './task_layout';

function daysScale() {
  return buildScaleModel({
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 11),
    scaleType: 'days',
    cellWidth: 50,
  });
}

const tasks: GanttTaskInput[] = [
  {
    id: 'a', start: new Date(2024, 0, 1), end: new Date(2024, 0, 3), progress: 50,
  },
  {
    id: 'b', parentId: 'a', start: new Date(2024, 0, 5), end: new Date(2024, 0, 6),
  },
  { id: 'm', start: new Date(2024, 0, 6), end: new Date(2024, 0, 6) },
];

describe('layoutTasks', () => {
  it('positions bars from the scale with progress and row offsets', () => {
    const rects = layoutTasks(tasks, daysScale(), { order: ['a', 'b', 'm'] });
    const a = rects.find((r) => r.id === 'a')!;

    expect(a.left).toBe(0);
    expect(a.width).toBe(100);
    expect(a.progressWidth).toBe(50);
    expect(a.top).toBe(6); // (rowHeight 34 - barHeight 22) / 2
    expect(a.height).toBe(22);
    expect(a.isMilestone).toBe(false);
  });

  it('marks a task referenced as a parentId as a parent', () => {
    const rects = layoutTasks(tasks, daysScale(), { order: ['a', 'b', 'm'] });
    expect(rects.find((r) => r.id === 'a')!.isParent).toBe(true);
    expect(rects.find((r) => r.id === 'b')!.isParent).toBe(false);
  });

  it('stacks rows by order', () => {
    const rects = layoutTasks(tasks, daysScale(), { order: ['a', 'b', 'm'] });
    expect(rects.find((r) => r.id === 'b')!.top).toBe(40); // row 1 -> 34 + 6
    expect(rects.find((r) => r.id === 'b')!.left).toBe(200);
    expect(rects.find((r) => r.id === 'b')!.width).toBe(50);
  });

  it('collapses zero-duration tasks to a milestone square', () => {
    const rects = layoutTasks(tasks, daysScale(), { order: ['a', 'b', 'm'] });
    const milestone = rects.find((r) => r.id === 'm')!;

    expect(milestone.isMilestone).toBe(true);
    expect(milestone.width).toBe(22); // barHeight
    expect(milestone.left).toBe(239); // centered on the start pixel (250 - 11)
    expect(milestone.progressWidth).toBe(0);
    expect(milestone.top).toBe(74); // row 2 -> 2 * 34 + 6
  });

  it('uses the calendar-aware scale for bar positions (persian)', () => {
    const startDate = new Date(2024, 2, 20); // Farvardin 1, 1403
    const scale = buildScaleModel({
      startDate,
      endDate: new Date(2024, 5, 20),
      scaleType: 'months',
      calendar: 'persian',
      cellWidth: 100,
    });
    // A task starting on the Persian month boundary lands at the cell origin.
    const rects = layoutTasks(
      [{ id: 't', start: startDate, end: new Date(2024, 4, 1) }],
      scale,
    );
    expect(rects[0].left).toBe(0);
    expect(rects[0].width).toBeGreaterThan(0);
  });
});

describe('layoutDependencies', () => {
  it('routes a finish-to-start connector with an arrow into the successor start', () => {
    const rects = layoutTasks(tasks, daysScale(), { order: ['a', 'b', 'm'] });
    const lines = layoutDependencies(
      [{
        id: 'd1', predecessorId: 'a', successorId: 'b', type: 0,
      }],
      rects,
    );

    expect(lines).toHaveLength(1);
    const line = lines[0];
    expect(line.segments).toHaveLength(4);
    // Leaves the predecessor finish edge (x = 100) at its vertical center.
    expect(line.segments[0].left).toBe(100);
    // Vertical riser bridges the two row centers (y 17 -> 51).
    expect(line.segments[2]).toEqual({
      left: 189.5, top: 17, width: 1, height: 34,
    });
    // Arrow points right into the successor's left edge.
    expect(line.arrow).toEqual({ left: 195, top: 46, direction: 'right' });
  });

  it('routes a finish-to-finish connector with a left-pointing arrow', () => {
    const rects = layoutTasks(tasks, daysScale(), { order: ['a', 'b', 'm'] });
    const lines = layoutDependencies(
      [{
        id: 'd2', predecessorId: 'a', successorId: 'b', type: 2,
      }],
      rects,
    );

    expect(lines[0].arrow.direction).toBe('left');
    expect(lines[0].arrow.left).toBe(250); // successor finish edge (200 + 50)
  });

  it('keeps the riser clear of the predecessor when tasks are back-to-back', () => {
    // 'a' finishes on Jan 3 exactly where 'c' starts, so `to.x - gutter` would
    // land inside 'a' and the riser would be drawn underneath the bar.
    const backToBack: GanttTaskInput[] = [
      { id: 'a', start: new Date(2024, 0, 1), end: new Date(2024, 0, 3) },
      { id: 'c', start: new Date(2024, 0, 3), end: new Date(2024, 0, 5) },
    ];
    const rects = layoutTasks(backToBack, daysScale(), { order: ['a', 'c'] });
    const lines = layoutDependencies(
      [{
        id: 'd', predecessorId: 'a', successorId: 'c', type: 0,
      }],
      rects,
    );

    const a = rects.find((r) => r.id === 'a')!;
    const riser = lines[0].segments[2];
    // Riser stands on the shared boundary (100), grazing both bars, not at 190.
    expect(riser.left).toBe(99.5);
    expect(riser.left + riser.width / 2).toBe(a.left + a.width);
  });

  it('steps through the row gap when the bars overlap', () => {
    // 'c' starts before 'a' finishes, so no riser column clears both bars.
    const overlapping: GanttTaskInput[] = [
      { id: 'a', start: new Date(2024, 0, 1), end: new Date(2024, 0, 3) },
      { id: 'c', start: new Date(2024, 0, 2), end: new Date(2024, 0, 4) },
    ];
    const rects = layoutTasks(overlapping, daysScale(), { order: ['a', 'c'] });
    const lines = layoutDependencies(
      [{
        id: 'd', predecessorId: 'a', successorId: 'c', type: 0,
      }],
      rects,
    );

    expect(lines[0].segments).toHaveLength(5);
    // The crossing runs on the centreline between the two row centers (17 -> 51);
    // `top` is that centreline less half the connector thickness.
    expect(lines[0].segments[2].top + 0.5).toBe(34);
  });

  it('skips dependencies whose endpoints are not laid out', () => {
    const rects = layoutTasks(tasks, daysScale(), { order: ['a', 'b', 'm'] });
    const lines = layoutDependencies(
      [{ id: 'd3', predecessorId: 'a', successorId: 'missing' }],
      rects,
    );
    expect(lines).toHaveLength(0);
  });
});
