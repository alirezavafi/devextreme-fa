/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';

import type { GanttTaskInput } from './task_layout';
import { GanttTimeline } from './timeline';

const tasks: GanttTaskInput[] = [
  {
    id: 'a', start: new Date(2024, 2, 20), end: new Date(2024, 3, 5), progress: 50, title: 'Design',
  },
  {
    id: 'b', parentId: 'a', start: new Date(2024, 3, 10), end: new Date(2024, 4, 1), title: 'Build',
  },
  {
    id: 'm', start: new Date(2024, 4, 1), end: new Date(2024, 4, 1), title: 'Ship',
  },
];

function headerLabels(gt: GanttTimeline): (string | null)[] {
  const tiers = gt.element().querySelectorAll('.dx-gantt-header > .dx-gantt-tsa');
  const bottom = tiers[tiers.length - 1];
  return Array.from(bottom.querySelectorAll('.dx-gantt-si')).map((cell) => cell.textContent);
}

describe('GanttTimeline', () => {
  it('mounts a themeable .dx-gantt > .dx-gantt-view structure', () => {
    const container = document.createElement('div');
    // eslint-disable-next-line no-new
    new GanttTimeline(container, { tasks, scaleType: 'months' });

    expect(container.classList.contains('dx-gantt')).toBe(true);
    expect(container.querySelector('.dx-gantt-view')).not.toBeNull();
    expect(container.querySelector('.dx-gantt-header')).not.toBeNull();
    expect(container.querySelectorAll('.dx-gantt-taskWrapper')).toHaveLength(2);
    expect(container.querySelectorAll('.dx-gantt-milestone')).toHaveLength(1);
  });

  it('switches calendar at runtime and re-labels the header (value stays Gregorian)', () => {
    const container = document.createElement('div');
    const gt = new GanttTimeline(container, {
      tasks, dependencies: [{ id: 'd1', predecessorId: 'a', successorId: 'b' }], scaleType: 'months',
    });

    expect(gt.getScaleModel().calendar).toBe('gregorian');
    expect(headerLabels(gt)).toContain('Mar');

    gt.option('calendar', 'persian');

    expect(gt.getScaleModel().calendar).toBe('persian');
    const persianLabels = headerLabels(gt);
    expect(persianLabels).toContain('Far');
    expect(persianLabels).not.toContain('Mar');

    // The stored task values are untouched by the calendar switch.
    expect(gt.option('tasks')[0].start.getTime()).toBe(new Date(2024, 2, 20).getTime());
  });

  it('renders a selection band when selectedTaskId is set', () => {
    const container = document.createElement('div');
    const gt = new GanttTimeline(container, { tasks, scaleType: 'months' });

    expect(container.querySelectorAll('.dx-gantt-sel')).toHaveLength(0);
    gt.option('selectedTaskId', 'a');
    expect(container.querySelectorAll('.dx-gantt-sel')).toHaveLength(1);
  });

  it('re-renders cleanly on scale-type change without leaking headers', () => {
    const container = document.createElement('div');
    const gt = new GanttTimeline(container, { tasks, scaleType: 'months' });
    gt.option('scaleType', 'days');
    expect(container.querySelectorAll('.dx-gantt-header')).toHaveLength(1);
    expect(container.querySelectorAll('.dx-gantt-view')).toHaveLength(1);
  });
});
