/* eslint-disable spellcheck/spell-checker */
/**
 * DOM renderer for the calendar-aware Gantt timeline.
 *
 * The renderer is intentionally framework-light: it builds plain DOM and tags
 * every element with the same `.dx-gantt-*` class names the closed engine emits,
 * so the existing DevExtreme theme SCSS (Generic / Material / Fluent and
 * ThemeBuilder) styles it with no theme changes. Dynamic geometry (left / width
 * / top, derived from the calendar-aware scale and layout) is applied as inline
 * styles; appearance (colors, borders, radii) comes entirely from the theme.
 *
 * Pure presentation: it receives an already-built {@link ScaleModel} and the
 * laid-out rectangles/connectors and never touches dates or calendars itself.
 */

import type { ScaleModel, ScaleTick } from './scale_model';
import type { DependencyLine, TaskRect } from './task_layout';
import { ARROW_LENGTH } from './task_layout';

export interface RenderOptions {
  /** Full row height (must match the value passed to `layoutTasks`). */
  rowHeight?: number;
  /** Height of each header tier row. Default 30. */
  headerRowHeight?: number;
  /** Currently selected task id (renders a `.dx-gantt-sel` row band). */
  selectedTaskId?: string | number | null;
  /** Whether to render dependency connectors. Default true. */
  showDependencies?: boolean;
  /** Number of rows to size the task area for (defaults to max row + 1). */
  rowCount?: number;
  /** Mirror the timeline horizontally for right-to-left layouts. Default false. */
  rtl?: boolean;
}

const DEFAULT_ROW_HEIGHT = 34;
const DEFAULT_HEADER_ROW_HEIGHT = 30;

/* RTL mirrors: a temporal edge keeps its meaning, only the visual side flips. */
const RESIZE_EDGE_MIRROR = { start: 'end', end: 'start' } as const;
const DEP_HANDLE_MIRROR = { start: 'finish', finish: 'start' } as const;
const ARROW_DIRECTION_MIRROR = { left: 'right', right: 'left' } as const;

/**
 * Mirrors a horizontal `[left, left+width]` span around `totalWidth` for RTL.
 * In LTR (`rtl` false) it is the identity, so the Gregorian/LTR path is
 * byte-for-byte unchanged.
 */
function mirrorX(left: number, width: number, rtl: boolean, totalWidth: number): number {
  return rtl ? totalWidth - left - width : left;
}

function px(value: number): string {
  return `${value}px`;
}

function el(tag: string, className: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

function positioned(
  tag: string,
  className: string,
  rect: { left: number; top: number; width: number; height: number },
): HTMLElement {
  const node = el(tag, className);
  node.style.position = 'absolute';
  node.style.left = px(rect.left);
  node.style.top = px(rect.top);
  node.style.width = px(rect.width);
  node.style.height = px(rect.height);
  return node;
}

function renderTier(
  ticks: ScaleTick[],
  containerClass: string,
  rowHeight: number,
  top: number,
  totalWidth: number,
  rtl: boolean,
): HTMLElement {
  const tier = el('div', containerClass);
  tier.style.position = 'absolute';
  tier.style.top = px(top);
  tier.style.left = '0';
  tier.style.height = px(rowHeight);
  tier.style.width = px(totalWidth);

  ticks.forEach((tick) => {
    const cell = positioned('div', 'dx-gantt-si dx-gantt-vb', {
      left: mirrorX(tick.left, tick.width, rtl, totalWidth),
      top: 0,
      width: tick.width,
      height: rowHeight,
    });
    cell.style.overflow = 'hidden';
    cell.style.whiteSpace = 'nowrap';
    cell.style.lineHeight = px(rowHeight);
    cell.textContent = tick.text;
    tier.appendChild(cell);
  });

  return tier;
}

function renderHeader(
  model: ScaleModel,
  headerRowHeight: number,
  rtl: boolean,
  totalWidth: number,
): HTMLElement {
  const header = el('div', 'dx-gantt-header dx-gantt-tsac');
  header.style.position = 'relative';
  header.style.height = px(headerRowHeight * 2);
  header.style.width = px(totalWidth);

  header.appendChild(
    renderTier(model.topTier, 'dx-gantt-tsa', headerRowHeight, 0, totalWidth, rtl),
  );
  header.appendChild(
    renderTier(model.bottomTier, 'dx-gantt-tsa', headerRowHeight, headerRowHeight, totalWidth, rtl),
  );

  return header;
}

function classForTask(rect: TaskRect): string {
  const classes = ['dx-gantt-task'];
  if (rect.isParent) {
    classes.push('dx-gantt-parent');
  }
  if (rect.width <= rect.height) {
    classes.push('dx-gantt-smallTask');
  }
  if (rect.progressWidth <= 0) {
    classes.push('dx-gantt-noPrg');
  }
  if (rect.progressWidth >= rect.width) {
    classes.push('dx-gantt-cmpl');
  }
  return classes.join(' ');
}

function renderTask(rect: TaskRect, rtl: boolean, totalWidth: number): HTMLElement {
  const mirroredLeft = mirrorX(rect.left, rect.width, rtl, totalWidth);

  if (rect.isMilestone) {
    const milestone = positioned('div', 'dx-gantt-milestone', { ...rect, left: mirroredLeft });
    milestone.dataset.taskId = String(rect.id);
    if (rect.title) {
      milestone.setAttribute('title', rect.title);
    }
    return milestone;
  }

  const wrapper = positioned('div', 'dx-gantt-taskWrapper', { ...rect, left: mirroredLeft });
  wrapper.dataset.taskId = String(rect.id);

  const bar = el('div', classForTask(rect));
  bar.style.position = 'relative';
  bar.style.width = px(rect.width);
  bar.style.height = px(rect.height);
  if (rect.color) {
    bar.style.backgroundColor = rect.color;
  }

  const progress = el('div', 'dx-gantt-tPrg');
  progress.style.width = px(rect.progressWidth);
  progress.style.height = '100%';
  bar.appendChild(progress);

  if (rect.title) {
    const title = el('div', 'dx-gantt-titleIn');
    title.textContent = rect.title;
    bar.appendChild(title);
  }

  wrapper.appendChild(bar);

  // Resize grips at the bar edges (shown with an ew-resize cursor). The
  // `data-resize-edge` attribute carries the temporal edge; in RTL the visual
  // side is swapped so the temporal-start grip stays on the bar's start edge.
  (['start', 'end'] as const).forEach((edge) => {
    const visualEdge = rtl ? RESIZE_EDGE_MIRROR[edge] : edge;
    const grip = el('div', `dx-gantt-task-resize dx-gantt-task-resize-${visualEdge}`);
    grip.dataset.resizeEdge = edge;
    wrapper.appendChild(grip);
  });

  // Dependency-draw handles (start/finish). Hidden until hover via theme CSS.
  // `data-dep-handle` carries the temporal edge; in RTL the visual side is
  // swapped so the temporal-start handle still sits on the bar's start edge.
  (['start', 'finish'] as const).forEach((edge) => {
    const visualEdge = rtl ? DEP_HANDLE_MIRROR[edge] : edge;
    const handle = el('div', `dx-gantt-dep-handle dx-gantt-dep-handle-${visualEdge}`);
    handle.dataset.depHandle = edge;
    handle.dataset.taskId = String(rect.id);
    wrapper.appendChild(handle);
  });

  return wrapper;
}

function renderSelection(
  rect: TaskRect,
  rowHeight: number,
  totalWidth: number,
): HTMLElement {
  return positioned('div', 'dx-gantt-sel', {
    left: 0,
    top: rect.rowIndex * rowHeight,
    width: totalWidth,
    height: rowHeight,
  });
}

function renderDependency(line: DependencyLine, rtl: boolean, totalWidth: number): HTMLElement {
  const group = el('div', 'dx-gantt-dependency');
  group.dataset.dependencyId = String(line.id);

  line.segments.forEach((segment) => {
    const isVertical = segment.height >= segment.width;
    const connector = positioned(
      'div',
      isVertical ? 'dx-gantt-conn-v' : 'dx-gantt-conn-h',
      { ...segment, left: mirrorX(segment.left, segment.width, rtl, totalWidth) },
    );
    group.appendChild(connector);
  });

  // The connector points at a bar edge; mirroring flips which edge, so the
  // arrowhead direction flips too.
  const direction = rtl ? ARROW_DIRECTION_MIRROR[line.arrow.direction] : line.arrow.direction;
  const arrow = el('div', `dx-gantt-arrow dx-gantt-arrow-${direction}`);
  arrow.style.position = 'absolute';
  // Both arrowhead boxes are ARROW_LENGTH wide with the tip on the side facing
  // the bar, so reflecting the box also reflects the tip onto the mirrored edge.
  arrow.style.left = px(mirrorX(line.arrow.left, ARROW_LENGTH, rtl, totalWidth));
  arrow.style.top = px(line.arrow.top);
  group.appendChild(arrow);

  return group;
}

/**
 * Renders the whole timeline (header + task area + dependencies) into `host`,
 * replacing any previous content. `host` itself becomes the `.dx-gantt-view`
 * scroll surface.
 */
export function renderTimeline(
  host: HTMLElement,
  model: ScaleModel,
  rects: TaskRect[],
  dependencies: DependencyLine[],
  options: RenderOptions = {},
): void {
  const rowHeight = options.rowHeight ?? DEFAULT_ROW_HEIGHT;
  const headerRowHeight = options.headerRowHeight ?? DEFAULT_HEADER_ROW_HEIGHT;
  const showDependencies = options.showDependencies ?? true;
  const rtl = options.rtl ?? false;
  // Lay the content out to at least the visible width so it fills the view; in
  // RTL we then mirror around this width, which keeps a short timeline flush to
  // the right edge (instead of floating at the left). `clientWidth` is 0 under
  // jsdom, so tests mirror around the pure content width.
  const layoutWidth = Math.max(model.totalWidth, host.clientWidth || 0);
  const rowCount = options.rowCount
    ?? rects.reduce((max, rect) => Math.max(max, rect.rowIndex + 1), 0);

  host.innerHTML = '';
  if (!host.classList.contains('dx-gantt-view')) {
    host.classList.add('dx-gantt-view');
  }
  // The timeline is positioned with explicit `left` offsets that we mirror
  // manually for RTL, so keep the scroll container itself LTR to avoid the
  // browser's RTL `scrollLeft` differences (which the interaction math relies on).
  host.style.direction = 'ltr';

  host.appendChild(renderHeader(model, headerRowHeight, rtl, layoutWidth));

  const body = el('div', 'dx-gantt-tasks');
  body.style.position = 'relative';
  body.style.width = px(layoutWidth);
  body.style.height = px(rowCount * rowHeight);

  if (options.selectedTaskId !== undefined && options.selectedTaskId !== null) {
    const selected = rects.find((rect) => rect.id === options.selectedTaskId);
    if (selected) {
      // The selection band spans the full width, so it needs no mirroring.
      body.appendChild(renderSelection(selected, rowHeight, layoutWidth));
    }
  }

  if (showDependencies && dependencies.length) {
    const depLayer = el('div', 'dx-gantt-dependencies');
    depLayer.style.position = 'absolute';
    depLayer.style.left = '0';
    depLayer.style.top = '0';
    dependencies.forEach((line) => depLayer.appendChild(renderDependency(line, rtl, layoutWidth)));
    body.appendChild(depLayer);
  }

  rects.forEach((rect) => body.appendChild(renderTask(rect, rtl, layoutWidth)));

  host.appendChild(body);
}

export { DEFAULT_HEADER_ROW_HEIGHT };
