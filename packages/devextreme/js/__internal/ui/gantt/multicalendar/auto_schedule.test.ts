/* eslint-disable @typescript-eslint/no-non-null-assertion -- fixtures guarantee presence */
/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';

import type { ScheduleTask } from './auto_schedule';
import { autoSchedule } from './auto_schedule';
import type { GanttDependencyInput } from './task_layout';

const day = (d: number): Date => new Date(2024, 0, d);
const tuple = (date: Date): [number, number, number] => [
  date.getFullYear(), date.getMonth(), date.getDate(),
];
const find = (
  updates: { id: string | number }[],
  id: string | number,
) => updates.find((u) => u.id === id);

describe('autoSchedule', () => {
  it('pushes a finish-to-start successor forward when the predecessor overruns it', () => {
    const tasks: ScheduleTask[] = [
      { id: 'A', start: day(2), end: day(5) }, // moved later
      { id: 'B', start: day(3), end: day(5) },
    ];
    const deps: GanttDependencyInput[] = [{
      id: 'd', predecessorId: 'A', successorId: 'B', type: 0,
    }];

    const updates = autoSchedule(tasks, deps, ['A']);
    const b = find(updates, 'B')!;
    expect(tuple(b.start)).toEqual([2024, 0, 5]);
    expect(tuple(b.end)).toEqual([2024, 0, 7]); // duration (2 days) preserved
  });

  it('does nothing when the successor already satisfies the constraint', () => {
    const tasks: ScheduleTask[] = [
      { id: 'A', start: day(1), end: day(5) },
      { id: 'B', start: day(10), end: day(12) },
    ];
    const deps: GanttDependencyInput[] = [{
      id: 'd', predecessorId: 'A', successorId: 'B', type: 0,
    }];
    expect(autoSchedule(tasks, deps, ['A'])).toEqual([]);
  });

  it('propagates through a multi-hop chain A -> B -> C', () => {
    const tasks: ScheduleTask[] = [
      { id: 'A', start: day(1), end: day(5) }, // moved later
      { id: 'B', start: day(2), end: day(4) },
      { id: 'C', start: day(4), end: day(6) },
    ];
    const deps: GanttDependencyInput[] = [
      {
        id: 'd1', predecessorId: 'A', successorId: 'B', type: 0,
      },
      {
        id: 'd2', predecessorId: 'B', successorId: 'C', type: 0,
      },
    ];

    const updates = autoSchedule(tasks, deps, ['A']);
    expect(tuple(find(updates, 'B')!.start)).toEqual([2024, 0, 5]);
    expect(tuple(find(updates, 'B')!.end)).toEqual([2024, 0, 7]);
    expect(tuple(find(updates, 'C')!.start)).toEqual([2024, 0, 7]);
    expect(tuple(find(updates, 'C')!.end)).toEqual([2024, 0, 9]);
  });

  it('enforces start-to-start', () => {
    const tasks: ScheduleTask[] = [
      { id: 'A', start: day(5), end: day(7) },
      { id: 'B', start: day(1), end: day(3) },
    ];
    const deps: GanttDependencyInput[] = [{
      id: 'd', predecessorId: 'A', successorId: 'B', type: 1,
    }];
    const b = find(autoSchedule(tasks, deps, ['A']), 'B')!;
    expect(tuple(b.start)).toEqual([2024, 0, 5]);
    expect(tuple(b.end)).toEqual([2024, 0, 7]);
  });

  it('enforces finish-to-finish', () => {
    const tasks: ScheduleTask[] = [
      { id: 'A', start: day(1), end: day(10) },
      { id: 'B', start: day(1), end: day(3) },
    ];
    const deps: GanttDependencyInput[] = [{
      id: 'd', predecessorId: 'A', successorId: 'B', type: 2,
    }];
    const b = find(autoSchedule(tasks, deps, ['A']), 'B')!;
    expect(tuple(b.end)).toEqual([2024, 0, 10]);
    expect(b.end.getTime() - b.start.getTime()).toBe(day(3).getTime() - day(1).getTime());
  });

  it('terminates on a cyclic dependency graph', () => {
    const tasks: ScheduleTask[] = [
      { id: 'A', start: day(5), end: day(7) },
      { id: 'B', start: day(1), end: day(3) },
    ];
    const deps: GanttDependencyInput[] = [
      {
        id: 'd1', predecessorId: 'A', successorId: 'B', type: 0,
      },
      {
        id: 'd2', predecessorId: 'B', successorId: 'A', type: 0,
      },
    ];
    const updates = autoSchedule(tasks, deps, ['A']);
    expect(Array.isArray(updates)).toBe(true);
  });
});
