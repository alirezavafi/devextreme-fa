/* eslint-disable spellcheck/spell-checker */
/**
 * Pointer controller for drawing new dependencies. A drag that starts on a task
 * edge handle (`[data-dep-handle]`) draws a guide line to the cursor; releasing
 * over another task creates a typed link via the pure {@link buildDependency}.
 *
 * Like the move/resize controller it works in content coordinates
 * (`clientX - hostLeft + scrollLeft`) so it is unit-testable in jsdom.
 */

import type { NewDependency, TaskEdge } from './dependency_draw';
import { buildDependency, hitTestTask } from './dependency_draw';
import type { GanttDependencyInput, TaskRect } from './task_layout';

export interface DependencyDrawContext {
  rects: TaskRect[];
  dependencies: GanttDependencyInput[];
  /** Mirror horizontal coordinates for right-to-left layouts. Default false. */
  rtl?: boolean;
  /** Timeline total width in pixels, required to mirror coordinates in RTL. */
  totalWidth?: number;
}

interface DrawState {
  sourceId: string | number;
  sourceEdge: TaskEdge;
  startX: number;
  startY: number;
  line: HTMLElement;
}

export class DependencyDrawController {
  private readonly host: HTMLElement;

  private readonly getContext: () => DependencyDrawContext;

  private readonly onCreate: (dependency: NewDependency) => void;

  private enabled = true;

  private draw: DrawState | null = null;

  constructor(
    host: HTMLElement,
    getContext: () => DependencyDrawContext,
    onCreate: (dependency: NewDependency) => void,
  ) {
    this.host = host;
    this.getContext = getContext;
    this.onCreate = onCreate;
  }

  private readonly onMouseDown = (e: MouseEvent): void => this.handleMouseDown(e);

  private readonly onMouseMove = (e: MouseEvent): void => this.handleMouseMove(e);

  private readonly onMouseUp = (e: MouseEvent): void => this.handleMouseUp(e);

  enable(): void {
    this.enabled = true;
    this.host.addEventListener('mousedown', this.onMouseDown);
  }

  disable(): void {
    this.enabled = false;
    this.host.removeEventListener('mousedown', this.onMouseDown);
    this.endGesture();
  }

  dispose(): void {
    this.disable();
  }

  // The task bars live inside the `.dx-gantt-tasks` body, which sits BELOW the
  // sticky header. Coordinates and the guide line must therefore be measured
  // relative to that body (not the scroll host) so they line up with the rects.
  private getBody(): HTMLElement {
    return (this.host.querySelector('.dx-gantt-tasks')) ?? this.host;
  }

  // Raw pointer position in visual content coordinates (matches the rendered,
  // possibly-mirrored DOM). Use `toLtrX` to convert to the LTR space the rects
  // live in for hit-testing.
  private contentX(e: MouseEvent): number {
    return e.clientX - this.getBody().getBoundingClientRect().left;
  }

  private contentY(e: MouseEvent): number {
    return e.clientY - this.getBody().getBoundingClientRect().top;
  }

  private geometry(): { rtl: boolean; totalWidth: number } {
    const ctx = this.getContext();
    // Mirror around the laid-out width (matches the renderer's `layoutWidth`),
    // so a short timeline that fills the view still flips flush-right.
    const contentWidth = ctx.totalWidth ?? 0;
    return { rtl: !!ctx.rtl, totalWidth: Math.max(contentWidth, this.host.clientWidth || 0) };
  }

  // Visual x -> LTR x (the space task rects use). Identity in LTR.
  private toLtrX(visualX: number): number {
    const { rtl, totalWidth } = this.geometry();
    return rtl ? totalWidth - visualX : visualX;
  }

  private handleMouseDown(e: MouseEvent): void {
    if (e.button !== 0 || !this.enabled) {
      return;
    }
    const target = e.target as HTMLElement | null;
    const handle = target?.closest('[data-dep-handle]') as HTMLElement | null;
    if (!handle) {
      return;
    }

    const { rects } = this.getContext();
    const sourceRect = rects.find((r) => String(r.id) === handle.dataset.taskId);
    if (!sourceRect) {
      return;
    }
    const sourceEdge = handle.dataset.depHandle as TaskEdge;
    const edgeLtrX = sourceEdge === 'start' ? sourceRect.left : sourceRect.left + sourceRect.width;
    const { rtl, totalWidth } = this.geometry();
    // The guide line lives in visual space, so place its origin at the mirrored
    // edge in RTL.
    const startX = rtl ? totalWidth - edgeLtrX : edgeLtrX;
    const startY = sourceRect.top + sourceRect.height / 2;

    const line = document.createElement('div');
    line.className = 'dx-gantt-dep-draw';
    line.style.position = 'absolute';
    line.style.transformOrigin = '0 0';
    line.style.left = `${startX}px`;
    line.style.top = `${startY}px`;
    // Append to the task body so the guide line shares the rects' coordinate space.
    this.getBody().appendChild(line);

    this.draw = {
      sourceId: sourceRect.id, sourceEdge, startX, startY, line,
    };
    const doc = this.host.ownerDocument;
    doc.addEventListener('mousemove', this.onMouseMove);
    doc.addEventListener('mouseup', this.onMouseUp);
    e.preventDefault();
    e.stopPropagation();
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.draw) {
      return;
    }
    const dx = this.contentX(e) - this.draw.startX;
    const dy = this.contentY(e) - this.draw.startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    this.draw.line.style.width = `${length}px`;
    this.draw.line.style.transform = `rotate(${angle}deg)`;
  }

  private handleMouseUp(e: MouseEvent): void {
    if (!this.draw) {
      return;
    }
    const { sourceId, sourceEdge } = this.draw;
    // Hit-testing and edge resolution happen in LTR space (where the rects live).
    const x = this.toLtrX(this.contentX(e));
    const y = this.contentY(e);
    const { rects, dependencies } = this.getContext();
    const target = hitTestTask(rects, x, y);
    const dependency = target
      ? buildDependency(sourceId, sourceEdge, target, x, dependencies)
      : null;

    this.endGesture();
    if (dependency) {
      this.onCreate(dependency);
    }
  }

  private endGesture(): void {
    if (!this.draw) {
      return;
    }
    if (this.draw.line.parentNode) {
      this.draw.line.parentNode.removeChild(this.draw.line);
    }
    const doc = this.host.ownerDocument;
    doc.removeEventListener('mousemove', this.onMouseMove);
    doc.removeEventListener('mouseup', this.onMouseUp);
    this.draw = null;
  }
}
