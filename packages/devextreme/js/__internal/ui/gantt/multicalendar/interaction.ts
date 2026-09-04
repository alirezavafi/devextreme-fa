/**
 * Pure interaction math for the calendar-aware Gantt timeline.
 *
 * Drag/resize gestures are expressed as horizontal pixel deltas. They are
 * translated back into native Gregorian `Date`s through the {@link ScaleModel}
 * (`pixelToDate`/`dateToPixel`), then snapped to a day boundary. Because all
 * conversion goes through the scale, editing is automatically correct under any
 * calendar: dragging a bar one column on a Persian month scale lands it on the
 * next Persian month, while the stored value is still a Gregorian `Date`.
 *
 * DOM-free and side-effect-free, so it is exhaustively unit-testable.
 */

import type { ScaleModel } from './scale_model';
import type { TaskRect } from './task_layout';

export type DragMode = 'move' | 'resizeStart' | 'resizeEnd';
export type SnapUnit = 'day' | 'none';

export interface DraggableTask {
  id: string | number;
  start: Date;
  end: Date;
}

export interface DragResult {
  id: string | number;
  start: Date;
  end: Date;
}

export interface DragOptions {
  /** Snap target for committed dates. Default `'day'`. */
  snap?: SnapUnit;
  /** Minimum task duration in ms when resizing. Default one day. */
  minDurationMs?: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_EDGE = 8;

/** Snaps a date to the nearest local-midnight day boundary. */
export function snapDate(date: Date, snap: SnapUnit = 'day'): Date {
  if (snap === 'none') {
    return new Date(date);
  }
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  const middle = dayStart.getTime() + (nextDay.getTime() - dayStart.getTime()) / 2;
  return date.getTime() >= middle ? nextDay : dayStart;
}

/**
 * Decides which gesture a pointer-down begins, based on where (in content
 * pixels) it lands within the task rectangle. Edges resize, the body moves;
 * milestones always move.
 */
export function resolveDragMode(
  rect: TaskRect,
  contentX: number,
  edge: number = DEFAULT_EDGE,
): DragMode {
  if (rect.isMilestone) {
    return 'move';
  }
  if (contentX <= rect.left + edge) {
    return 'resizeStart';
  }
  if (contentX >= rect.left + rect.width - edge) {
    return 'resizeEnd';
  }
  return 'move';
}

/** Moves the whole bar by `deltaPx`, preserving its (Gregorian) duration. */
export function applyMove(
  task: DraggableTask,
  deltaPx: number,
  scale: ScaleModel,
  options: DragOptions = {},
): DragResult {
  const snap = options.snap ?? 'day';
  const startPx = scale.dateToPixel(task.start);
  const durationMs = task.end.getTime() - task.start.getTime();
  const newStart = snapDate(scale.pixelToDate(startPx + deltaPx), snap);
  const newEnd = new Date(newStart.getTime() + durationMs);
  return { id: task.id, start: newStart, end: newEnd };
}

/** Moves the start edge only, keeping at least `minDurationMs` of duration. */
export function applyResizeStart(
  task: DraggableTask,
  deltaPx: number,
  scale: ScaleModel,
  options: DragOptions = {},
): DragResult {
  const snap = options.snap ?? 'day';
  const minMs = options.minDurationMs ?? MS_PER_DAY;
  const startPx = scale.dateToPixel(task.start);
  let newStart = snapDate(scale.pixelToDate(startPx + deltaPx), snap);
  const maxStartMs = task.end.getTime() - minMs;
  if (newStart.getTime() > maxStartMs) {
    newStart = new Date(maxStartMs);
  }
  return { id: task.id, start: newStart, end: task.end };
}

/** Moves the end edge only, keeping at least `minDurationMs` of duration. */
export function applyResizeEnd(
  task: DraggableTask,
  deltaPx: number,
  scale: ScaleModel,
  options: DragOptions = {},
): DragResult {
  const snap = options.snap ?? 'day';
  const minMs = options.minDurationMs ?? MS_PER_DAY;
  const endPx = scale.dateToPixel(task.end);
  let newEnd = snapDate(scale.pixelToDate(endPx + deltaPx), snap);
  const minEndMs = task.start.getTime() + minMs;
  if (newEnd.getTime() < minEndMs) {
    newEnd = new Date(minEndMs);
  }
  return { id: task.id, start: task.start, end: newEnd };
}

/** Dispatches to the per-mode handler. */
export function applyDrag(
  mode: DragMode,
  task: DraggableTask,
  deltaPx: number,
  scale: ScaleModel,
  options: DragOptions = {},
): DragResult {
  switch (mode) {
    case 'resizeStart':
      return applyResizeStart(task, deltaPx, scale, options);
    case 'resizeEnd':
      return applyResizeEnd(task, deltaPx, scale, options);
    default:
      return applyMove(task, deltaPx, scale, options);
  }
}

export { DEFAULT_EDGE, MS_PER_DAY };
