/* eslint-disable spellcheck/spell-checker */
/**
 * Pure geometry for the calendar-aware Gantt timeline.
 *
 * Given a {@link ScaleModel} (which owns all calendar/date math) this module
 * turns task and dependency records into absolute-positioned rectangles and
 * orthogonal connector polylines. It is deliberately free of DOM and of any
 * calendar knowledge: dates are mapped to pixels exclusively through
 * `scale.dateToPixel`, so a Persian or Hijri scale yields correct bar positions
 * with no extra work here.
 */

import type { ScaleModel } from './scale_model';

export type DependencyType = 0 | 1 | 2 | 3; // FS, SS, FF, SF (DevExtreme order)

export interface GanttTaskInput {
  id: string | number;
  parentId?: string | number | null;
  start: Date;
  end: Date;
  /** Completion percentage 0..100. */
  progress?: number;
  title?: string;
  color?: string;
}

export interface GanttDependencyInput {
  id: string | number;
  predecessorId: string | number;
  successorId: string | number;
  /** Defaults to Finish-to-Start (0). */
  type?: DependencyType;
}

export interface TaskRect {
  id: string | number;
  rowIndex: number;
  left: number;
  width: number;
  top: number;
  height: number;
  /** Width of the progress overlay in pixels (0 when no progress). */
  progressWidth: number;
  isMilestone: boolean;
  isParent: boolean;
  title: string;
  color?: string;
}

export interface TaskLayoutOptions {
  /** Height of a full row including padding. Default 34. */
  rowHeight?: number;
  /** Height of a task bar within the row. Default 22. */
  barHeight?: number;
  /** Minimum bar width so very short tasks stay visible. Default 4. */
  minBarWidth?: number;
  /**
   * A task is a milestone when `end - start <= milestoneThresholdMs`.
   * Default 0 (start === end).
   */
  milestoneThresholdMs?: number;
  /** Explicit row order by task id; defaults to input order. */
  order?: (string | number)[];
}

export interface ConnectorSegment {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ConnectorArrow {
  left: number;
  top: number;
  direction: 'left' | 'right';
}

export interface DependencyLine {
  id: string | number;
  predecessorId: string | number;
  successorId: string | number;
  type: DependencyType;
  segments: ConnectorSegment[];
  arrow: ConnectorArrow;
}

const DEFAULT_ROW_HEIGHT = 34;
const DEFAULT_BAR_HEIGHT = 22;
const DEFAULT_MIN_BAR_WIDTH = 4;
const CONNECTOR_THICKNESS = 1;
/** Half-height of the CSS arrowhead triangle; mirrors its border-top/bottom. */
const ARROW_SIZE = 5;
/** Tip-to-base length of the arrowhead; mirrors its border-left/right. */
const ARROW_LENGTH = 8;
/** Horizontal stub length leaving/entering a bar edge. */
const CONNECTOR_GUTTER = 10;

function resolveRowIndex(
  tasks: GanttTaskInput[],
  order: (string | number)[] | undefined,
): Map<string | number, number> {
  const rowByid = new Map<string | number, number>();
  const sequence = order ?? tasks.map((task) => task.id);
  sequence.forEach((id, index) => rowByid.set(id, index));
  // Any task missing from an explicit order is appended in input order.
  let next = sequence.length;
  tasks.forEach((task) => {
    if (!rowByid.has(task.id)) {
      rowByid.set(task.id, next);
      next += 1;
    }
  });
  return rowByid;
}

function collectParentIds(tasks: GanttTaskInput[]): Set<string | number> {
  const parents = new Set<string | number>();
  tasks.forEach((task) => {
    if (task.parentId !== undefined && task.parentId !== null) {
      parents.add(task.parentId);
    }
  });
  return parents;
}

/**
 * Lays out task bars. Milestones collapse to a square (rotated to a diamond by
 * CSS); parents are tasks referenced as a `parentId` by another task.
 */
export function layoutTasks(
  tasks: GanttTaskInput[],
  scale: ScaleModel,
  options: TaskLayoutOptions = {},
): TaskRect[] {
  const rowHeight = options.rowHeight ?? DEFAULT_ROW_HEIGHT;
  const barHeight = options.barHeight ?? DEFAULT_BAR_HEIGHT;
  const minBarWidth = options.minBarWidth ?? DEFAULT_MIN_BAR_WIDTH;
  const milestoneThreshold = options.milestoneThresholdMs ?? 0;

  const rowByid = resolveRowIndex(tasks, options.order);
  const parentIds = collectParentIds(tasks);
  const verticalPadding = Math.max(0, (rowHeight - barHeight) / 2);

  return tasks.map((task) => {
    const rowIndex = rowByid.get(task.id) ?? 0;
    const startPx = scale.dateToPixel(task.start);
    const endPx = scale.dateToPixel(task.end);
    const isMilestone = task.end.getTime() - task.start.getTime() <= milestoneThreshold;

    const top = rowIndex * rowHeight + verticalPadding;
    let left = startPx;
    let width = Math.max(endPx - startPx, minBarWidth);

    if (isMilestone) {
      width = barHeight;
      left = startPx - barHeight / 2;
    }

    const progress = Math.max(0, Math.min(task.progress ?? 0, 100));
    const progressWidth = isMilestone ? 0 : (width * progress) / 100;

    return {
      id: task.id,
      rowIndex,
      left,
      width,
      top,
      height: barHeight,
      progressWidth,
      isMilestone,
      isParent: parentIds.has(task.id),
      title: task.title ?? '',
      color: task.color,
    };
  });
}

interface Anchor {
  x: number;
  y: number;
  /** Whether the anchor is on the right edge of its bar. */
  isRightEdge: boolean;
}

function predecessorAnchor(rect: TaskRect, type: DependencyType): Anchor {
  const y = rect.top + rect.height / 2;
  // FS (0) and FF (2) leave from the predecessor's finish (right) edge.
  const fromFinish = type === 0 || type === 2;
  return {
    x: fromFinish ? rect.left + rect.width : rect.left,
    y,
    isRightEdge: fromFinish,
  };
}

function successorAnchor(rect: TaskRect, type: DependencyType): Anchor {
  const y = rect.top + rect.height / 2;
  // FS (0) and SS (1) enter the successor's start (left) edge.
  const toStart = type === 0 || type === 1;
  return {
    x: toStart ? rect.left : rect.left + rect.width,
    y,
    isRightEdge: !toStart,
  };
}

function horizontalSegment(x1: number, x2: number, y: number): ConnectorSegment {
  const left = Math.min(x1, x2);
  return {
    left,
    top: y - CONNECTOR_THICKNESS / 2,
    width: Math.max(Math.abs(x2 - x1), CONNECTOR_THICKNESS),
    height: CONNECTOR_THICKNESS,
  };
}

function verticalSegment(y1: number, y2: number, x: number): ConnectorSegment {
  const top = Math.min(y1, y2);
  return {
    left: x - CONNECTOR_THICKNESS / 2,
    top,
    width: CONNECTOR_THICKNESS,
    height: Math.max(Math.abs(y2 - y1), CONNECTOR_THICKNESS),
  };
}

/**
 * The arrow points toward the bar: into a left edge => pointing right.
 * Both boxes are ARROW_LENGTH wide and anchored so the tip lands exactly on
 * the bar edge -- a right-pointing tip sits at the box's right side, a
 * left-pointing one at its left.
 */
function buildArrow(to: Anchor): ConnectorArrow {
  return {
    left: to.x - (to.isRightEdge ? 0 : ARROW_LENGTH),
    top: to.y - ARROW_SIZE,
    direction: to.isRightEdge ? 'left' : 'right',
  };
}

/**
 * Routes an orthogonal connector from the predecessor's exit edge to the
 * successor's entry edge.
 *
 * The riser (vertical run) normally stands a gutter outside the successor's
 * entry edge. That column is only usable while it stays clear of the
 * predecessor's own bar: for back-to-back tasks, where the predecessor finishes
 * exactly where the successor starts, `to.x - gutter` falls *inside* the
 * predecessor, so the riser would be drawn underneath it and the connector
 * would appear to break off at the bar's edge. When that happens the riser
 * moves out to the predecessor's exit edge, which is the shared boundary
 * between the two bars and clear of both. If the tasks overlap, no such column
 * exists and the connector steps through the row gap instead.
 */
function routeConnector(
  from: Anchor,
  to: Anchor,
  fromRect: TaskRect,
  toRect: TaskRect,
): { segments: ConnectorSegment[]; arrow: ConnectorArrow } {
  const fromStubX = from.x + (from.isRightEdge ? CONNECTOR_GUTTER : -CONNECTOR_GUTTER);
  const toStubX = to.x + (to.isRightEdge ? CONNECTOR_GUTTER : -CONNECTOR_GUTTER);

  const isInside = (x: number, rect: TaskRect): boolean => (
    x > rect.left && x < rect.left + rect.width
  );

  let elbowX = toStubX;
  let stepsThroughRowGap = false;
  if (isInside(elbowX, fromRect)) {
    if (isInside(from.x, toRect)) {
      stepsThroughRowGap = true;
    } else {
      elbowX = from.x;
    }
  }

  if (stepsThroughRowGap) {
    // The bars overlap, so no riser column clears both. Drop into the gap
    // between the two rows, cross there, then drop into the successor.
    const gapY = (from.y + to.y) / 2;
    return {
      segments: [
        horizontalSegment(from.x, fromStubX, from.y),
        verticalSegment(from.y, gapY, fromStubX),
        horizontalSegment(fromStubX, toStubX, gapY),
        verticalSegment(gapY, to.y, toStubX),
        horizontalSegment(toStubX, to.x, to.y),
      ],
      arrow: buildArrow(to),
    };
  }

  const segments: ConnectorSegment[] = [
    horizontalSegment(from.x, fromStubX, from.y),
    horizontalSegment(fromStubX, elbowX, from.y),
    verticalSegment(from.y, to.y, elbowX),
    horizontalSegment(elbowX, to.x, to.y),
  ];

  return { segments, arrow: buildArrow(to) };
}

/**
 * Builds orthogonal connectors for each dependency whose endpoints are both
 * present in the laid-out task set. Endpoints derive from the dependency type
 * (FS/SS/FF/SF), matching DevExtreme's numeric ordering.
 */
export function layoutDependencies(
  dependencies: GanttDependencyInput[],
  rects: TaskRect[],
): DependencyLine[] {
  const rectById = new Map<string | number, TaskRect>();
  rects.forEach((rect) => rectById.set(rect.id, rect));

  const lines: DependencyLine[] = [];
  dependencies.forEach((dependency) => {
    const predecessor = rectById.get(dependency.predecessorId);
    const successor = rectById.get(dependency.successorId);
    if (!predecessor || !successor) {
      return;
    }
    const type = dependency.type ?? 0;
    const from = predecessorAnchor(predecessor, type);
    const to = successorAnchor(successor, type);
    const { segments, arrow } = routeConnector(from, to, predecessor, successor);

    lines.push({
      id: dependency.id,
      predecessorId: dependency.predecessorId,
      successorId: dependency.successorId,
      type,
      segments,
      arrow,
    });
  });

  return lines;
}

export {
  ARROW_LENGTH,
  ARROW_SIZE,
  DEFAULT_BAR_HEIGHT,
  DEFAULT_ROW_HEIGHT,
};
