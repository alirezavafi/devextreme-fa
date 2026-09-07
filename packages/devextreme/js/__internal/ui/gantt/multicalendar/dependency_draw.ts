/* eslint-disable spellcheck/spell-checker */
/**
 * Pure logic for the "draw a dependency" gesture.
 *
 * The user drags from an edge handle of a predecessor task to a successor task.
 * The pair of edges (start/finish on each side) determines the dependency type,
 * matching DevExtreme's numeric ordering (FS / SS / FF / SF). This module owns
 * the type resolution, the geometric hit-testing, and the validation rules; it
 * is DOM-free and fully unit-testable.
 */

import type { DependencyType, GanttDependencyInput, TaskRect } from './task_layout';

export type TaskEdge = 'start' | 'finish';

export interface NewDependency {
  predecessorId: string | number;
  successorId: string | number;
  type: DependencyType;
}

/**
 * Maps a (predecessor edge -> successor edge) pair to a dependency type:
 * finish->start = FS(0), start->start = SS(1), finish->finish = FF(2),
 * start->finish = SF(3).
 */
export function resolveDependencyType(sourceEdge: TaskEdge, targetEdge: TaskEdge): DependencyType {
  if (sourceEdge === 'finish' && targetEdge === 'start') {
    return 0;
  }
  if (sourceEdge === 'start' && targetEdge === 'start') {
    return 1;
  }
  if (sourceEdge === 'finish' && targetEdge === 'finish') {
    return 2;
  }
  return 3; // start -> finish
}

/** Returns the topmost task rectangle containing the content point, or null. */
export function hitTestTask(rects: TaskRect[], x: number, y: number): TaskRect | null {
  for (let i = rects.length - 1; i >= 0; i -= 1) {
    const rect = rects[i];
    if (x >= rect.left && x <= rect.left + rect.width
      && y >= rect.top && y <= rect.top + rect.height) {
      return rect;
    }
  }
  return null;
}

/** Which edge of `rect` the x-coordinate is closest to. */
export function nearestEdge(rect: TaskRect, x: number): TaskEdge {
  return x < rect.left + rect.width / 2 ? 'start' : 'finish';
}

/**
 * Validates a prospective link: no self-link, no duplicate, and no direct
 * 2-cycle (a reverse link already exists). Longer cycles are tolerated because
 * the auto-scheduler terminates safely on them.
 */
export function canCreateDependency(
  predecessorId: string | number,
  successorId: string | number,
  existing: GanttDependencyInput[],
): boolean {
  if (String(predecessorId) === String(successorId)) {
    return false;
  }
  return !existing.some((dep) => {
    const forward = String(dep.predecessorId) === String(predecessorId)
      && String(dep.successorId) === String(successorId);
    const reverse = String(dep.predecessorId) === String(successorId)
      && String(dep.successorId) === String(predecessorId);
    return forward || reverse;
  });
}

/**
 * Builds a new dependency from a drag that started on `sourceEdge` of
 * `sourceId` and was released over `targetRect` at content-x `targetX`.
 * Returns `null` when the link is invalid.
 */
export function buildDependency(
  sourceId: string | number,
  sourceEdge: TaskEdge,
  targetRect: TaskRect,
  targetX: number,
  existing: GanttDependencyInput[],
): NewDependency | null {
  if (!canCreateDependency(sourceId, targetRect.id, existing)) {
    return null;
  }
  const targetEdge = nearestEdge(targetRect, targetX);
  return {
    predecessorId: sourceId,
    successorId: targetRect.id,
    type: resolveDependencyType(sourceEdge, targetEdge),
  };
}
