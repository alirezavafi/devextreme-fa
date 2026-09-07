/* eslint-disable spellcheck/spell-checker */
/**
 * Dependency-aware auto-scheduling for the Gantt timeline.
 *
 * When a task moves or resizes, its successors may violate their dependency
 * constraints (Finish-to-Start, Start-to-Start, Finish-to-Finish,
 * Start-to-Finish). This module propagates the change through the dependency
 * graph and returns the minimal set of *forward* shifts needed to restore the
 * constraints, preserving each shifted task's duration.
 *
 * It only pushes successors later (never pulls them earlier when slack exists),
 * which matches the intuitive "nudge what's now too early" behaviour and avoids
 * surprising rescheduling. Dates are plain `Date`s and calendar-independent:
 * a constraint is a time ordering, so this works identically under any calendar.
 *
 * Pure and side-effect-free.
 */

import type { DependencyType, GanttDependencyInput } from './task_layout';

export interface ScheduleTask {
  id: string | number;
  start: Date;
  end: Date;
}

export interface ScheduleUpdate {
  id: string | number;
  start: Date;
  end: Date;
}

export interface AutoScheduleOptions {
  /** Safety cap on propagation steps (cycle guard). Default derived from size. */
  maxSteps?: number;
}

interface WorkingTask {
  start: number;
  end: number;
}

/**
 * Returns the minimum start (for FS/SS) or end (for FF/SF) the successor must
 * have, given the predecessor's current position. `null` means the type does
 * not constrain that edge.
 */
function requiredBound(
  type: DependencyType,
  predecessor: WorkingTask,
): { edge: 'start' | 'end'; min: number } {
  switch (type) {
    case 1: // Start-to-Start
      return { edge: 'start', min: predecessor.start };
    case 2: // Finish-to-Finish
      return { edge: 'end', min: predecessor.end };
    case 3: // Start-to-Finish
      return { edge: 'end', min: predecessor.start };
    case 0: // Finish-to-Start
    default:
      return { edge: 'start', min: predecessor.end };
  }
}

/**
 * Propagates the move of `changedIds` through `dependencies`, pushing
 * successors forward to satisfy their constraints. Returns one update per task
 * that was shifted (the initiators are not included unless they are themselves
 * downstream of another initiator).
 */
export function autoSchedule(
  tasks: ScheduleTask[],
  dependencies: GanttDependencyInput[],
  changedIds: (string | number)[],
  options: AutoScheduleOptions = {},
): ScheduleUpdate[] {
  const working = new Map<string | number, WorkingTask>();
  tasks.forEach((task) => {
    working.set(task.id, { start: task.start.getTime(), end: task.end.getTime() });
  });

  // predecessorId -> dependencies that flow out of it.
  const outgoing = new Map<string | number, GanttDependencyInput[]>();
  dependencies.forEach((dep) => {
    const list = outgoing.get(dep.predecessorId) ?? [];
    list.push(dep);
    outgoing.set(dep.predecessorId, list);
  });

  const shifted = new Set<string | number>();
  const queue: (string | number)[] = [...changedIds];
  const maxSteps = options.maxSteps ?? (tasks.length + 1) * (dependencies.length + 1) + 1;
  let steps = 0;

  while (queue.length > 0) {
    steps += 1;
    if (steps > maxSteps) {
      break; // cycle / pathological graph guard
    }

    const predId = queue.shift() as string | number;
    const predecessor = working.get(predId);
    if (predecessor) {
      const deps = outgoing.get(predId) ?? [];
      deps.forEach((dep) => {
        const successor = working.get(dep.successorId);
        if (!successor || dep.successorId === predId) {
          return;
        }

        const { edge, min } = requiredBound(dep.type ?? 0, predecessor);
        const current = edge === 'start' ? successor.start : successor.end;
        const delta = min - current;
        if (delta > 0) {
          successor.start += delta;
          successor.end += delta;
          shifted.add(dep.successorId);
          queue.push(dep.successorId);
        }
      });
    }
  }

  const updates: ScheduleUpdate[] = [];
  shifted.forEach((id) => {
    const work = working.get(id);
    if (work) {
      updates.push({ id, start: new Date(work.start), end: new Date(work.end) });
    }
  });
  return updates;
}
