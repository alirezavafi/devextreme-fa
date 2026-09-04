/**
 * Pointer/mouse controller that turns drag gestures on rendered task bars into
 * calendar-snapped date changes. It is the thin DOM-bound layer over the pure
 * {@link applyDrag} math: it tracks a gesture, gives live visual feedback, and
 * on release reports the committed `{ id, start, end }` through `onCommit`.
 *
 * Content coordinates (relative to the scrollable timeline content) are derived
 * as `clientX - hostLeft + scrollLeft`, which keeps the math independent of the
 * page layout and unit-testable in jsdom (where layout rects are zero).
 */

import type {
  DraggableTask, DragMode, DragOptions, DragResult,
} from './interaction';
import { applyDrag, resolveDragMode } from './interaction';
import type { ScaleModel } from './scale_model';
import type { TaskRect } from './task_layout';

export interface InteractionContext {
  scale: ScaleModel;
  rects: TaskRect[];
  tasks: DraggableTask[];
  /** Mirror horizontal coordinates for right-to-left layouts. Default false. */
  rtl?: boolean;
}

export interface InteractionOptions extends DragOptions {
  edge?: number;
  allowMove?: boolean;
  allowResize?: boolean;
}

interface DragState {
  element: HTMLElement;
  rect: TaskRect;
  task: DraggableTask;
  mode: DragMode;
  startContentX: number;
}

const MIN_PREVIEW_WIDTH = 4;

const resizeGripMode = (grip: HTMLElement): DragMode => (
  grip.dataset.resizeEdge === 'start' ? 'resizeStart' : 'resizeEnd'
);

export class InteractionController {
  private readonly host: HTMLElement;

  private readonly getContext: () => InteractionContext;

  private readonly onCommit: (result: DragResult) => void;

  private options: InteractionOptions;

  private drag: DragState | null = null;

  constructor(
    host: HTMLElement,
    getContext: () => InteractionContext,
    onCommit: (result: DragResult) => void,
    options: InteractionOptions = {},
  ) {
    this.host = host;
    this.getContext = getContext;
    this.onCommit = onCommit;
    this.options = { allowMove: true, allowResize: true, ...options };
  }

  private readonly onMouseDown = (e: MouseEvent): void => this.handleMouseDown(e);

  private readonly onMouseMove = (e: MouseEvent): void => this.handleMouseMove(e);

  private readonly onMouseUp = (e: MouseEvent): void => this.handleMouseUp(e);

  setOptions(options: InteractionOptions): void {
    this.options = { ...this.options, ...options };
  }

  enable(): void {
    this.host.addEventListener('mousedown', this.onMouseDown);
  }

  disable(): void {
    this.host.removeEventListener('mousedown', this.onMouseDown);
    this.endGesture();
  }

  dispose(): void {
    this.disable();
  }

  private geometry(): { rtl: boolean; totalWidth: number } {
    const ctx = this.getContext();
    // Mirror around the laid-out width, which fills the view when the timeline
    // is shorter than it (must match the renderer's `layoutWidth`).
    const contentWidth = ctx.scale?.totalWidth ?? 0;
    return { rtl: !!ctx.rtl, totalWidth: Math.max(contentWidth, this.host.clientWidth || 0) };
  }

  // Returns the pointer position in LTR content coordinates (the space the
  // scale model and task rects live in). In RTL the raw visual x is mirrored
  // around the total width, so all downstream drag math is calendar-/direction-
  // agnostic. In LTR this is the identity.
  private contentX(e: MouseEvent): number {
    const hostLeft = this.host.getBoundingClientRect().left;
    const raw = e.clientX - hostLeft + this.host.scrollLeft;
    const { rtl, totalWidth } = this.geometry();
    return rtl ? totalWidth - raw : raw;
  }

  private handleMouseDown(e: MouseEvent): void {
    if (e.button !== 0) {
      return;
    }
    const target = e.target as HTMLElement | null;
    // Dependency-draw handles are managed by the DependencyDrawController.
    if (target?.closest('[data-dep-handle]')) {
      return;
    }
    const element = target?.closest('[data-task-id]') as HTMLElement | null;
    if (!element) {
      return;
    }
    const id = element.dataset.taskId;
    const { rects, tasks } = this.getContext();
    const rect = rects.find((r) => String(r.id) === id);
    const task = tasks.find((t) => String(t.id) === id);
    if (!rect || !task) {
      return;
    }

    const startContentX = this.contentX(e);
    // An explicit resize grip forces the resize mode (and gives an ew-resize
    // cursor); otherwise fall back to edge detection within the bar.
    const grip = target?.closest('[data-resize-edge]') as HTMLElement | null;
    const mode: DragMode = grip && !rect.isMilestone
      ? resizeGripMode(grip)
      : resolveDragMode(rect, startContentX, this.options.edge);
    if (mode === 'move' && this.options.allowMove === false) {
      return;
    }
    if (mode !== 'move' && this.options.allowResize === false) {
      return;
    }

    this.drag = {
      element, rect, task, mode, startContentX,
    };
    const doc = this.host.ownerDocument;
    doc.addEventListener('mousemove', this.onMouseMove);
    doc.addEventListener('mouseup', this.onMouseUp);
    e.preventDefault();
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.drag) {
      return;
    }
    this.preview(this.contentX(e) - this.drag.startContentX);
  }

  private preview(deltaPx: number): void {
    if (!this.drag) {
      return;
    }
    const { element, rect, mode } = this.drag;
    const { rtl, totalWidth } = this.geometry();

    // Compute the new geometry in LTR content space first, then mirror the
    // final `left` for RTL. In LTR this matches the previous behaviour exactly.
    let ltrLeft = rect.left;
    let { width } = rect;
    if (mode === 'move') {
      ltrLeft = rect.left + deltaPx;
    } else if (mode === 'resizeStart') {
      ltrLeft = rect.left + deltaPx;
      width = Math.max(rect.width - deltaPx, MIN_PREVIEW_WIDTH);
    } else {
      width = Math.max(rect.width + deltaPx, MIN_PREVIEW_WIDTH);
    }

    element.style.left = `${rtl ? totalWidth - ltrLeft - width : ltrLeft}px`;
    element.style.width = `${width}px`;
  }

  private handleMouseUp(e: MouseEvent): void {
    if (!this.drag) {
      return;
    }
    const { task, mode, startContentX } = this.drag;
    const deltaPx = this.contentX(e) - startContentX;
    const { scale } = this.getContext();
    const dragOptions: DragOptions = {
      snap: this.options.snap,
      minDurationMs: this.options.minDurationMs,
    };
    const result = applyDrag(mode, task, deltaPx, scale, dragOptions);
    this.endGesture();
    this.onCommit(result);
  }

  private endGesture(): void {
    if (!this.drag) {
      return;
    }
    const doc = this.host.ownerDocument;
    doc.removeEventListener('mousemove', this.onMouseMove);
    doc.removeEventListener('mouseup', this.onMouseUp);
    this.drag = null;
  }
}
