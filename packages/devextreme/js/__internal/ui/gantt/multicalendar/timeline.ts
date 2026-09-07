/**
 * `GanttTimeline` — a framework-light orchestrator that wires the calendar-aware
 * scale model, the task/dependency layout and the themeable DOM renderer into a
 * single, self-contained component.
 *
 * It is deliberately not a DevExtreme `Widget` subclass so it can be unit-tested
 * in jsdom and embedded by any host (including a thin DevExtreme widget shell).
 * The root element is tagged `.dx-gantt` and the inner view `.dx-gantt-view`, so
 * the existing theme SCSS applies unchanged. The public `calendar` option can be
 * switched at runtime; task values remain native Gregorian `Date`s throughout.
 */

import type { CalendarType } from '@ts/core/localization/calendar';

import { renderTimeline } from './renderer';
import type { GanttScaleType, ScaleModel } from './scale_model';
import { buildScaleModel } from './scale_model';
import type {
  DependencyLine, GanttDependencyInput, GanttTaskInput, TaskRect,
} from './task_layout';
import { layoutDependencies, layoutTasks } from './task_layout';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_ROW_HEIGHT = 34;
const DEFAULT_BAR_HEIGHT = 22;
const DEFAULT_CELL_WIDTH = 100;

export interface GanttTimelineOptions {
  tasks: GanttTaskInput[];
  dependencies?: GanttDependencyInput[];
  scaleType?: GanttScaleType;
  calendar?: CalendarType;
  /** Explicit range; auto-derived from tasks (with padding) when omitted. */
  startDate?: Date;
  endDate?: Date;
  rowHeight?: number;
  barHeight?: number;
  cellWidth?: number;
  headerRowHeight?: number;
  locale?: string;
  formatNumber?: (value: number) => string;
  selectedTaskId?: string | number | null;
  showDependencies?: boolean;
}

type OptionName = keyof GanttTimelineOptions;

const DEFAULTS: Partial<GanttTimelineOptions> = {
  dependencies: [],
  scaleType: 'months',
  calendar: 'gregorian',
  rowHeight: DEFAULT_ROW_HEIGHT,
  barHeight: DEFAULT_BAR_HEIGHT,
  cellWidth: DEFAULT_CELL_WIDTH,
  showDependencies: true,
  selectedTaskId: null,
};

export class GanttTimeline {
  private readonly root: HTMLElement;

  private readonly view: HTMLElement;

  private options: GanttTimelineOptions;

  private scaleModel!: ScaleModel;

  private rects: TaskRect[] = [];

  private lines: DependencyLine[] = [];

  constructor(container: HTMLElement, options: GanttTimelineOptions) {
    this.root = container;
    this.root.classList.add('dx-gantt');
    // `dx-gantt-mc` scopes the renderer's *structural* CSS so it never affects
    // the engine-rendered dxGantt, while the shared `dx-gantt` class still picks
    // up the theme's colors/borders.
    this.root.classList.add('dx-gantt-mc');

    this.view = document.createElement('div');
    this.view.className = 'dx-gantt-view';
    this.root.appendChild(this.view);

    this.options = { ...DEFAULTS, ...options };
    this.render();
  }

  /** Returns the resolved [start, end) range, padded one day around the tasks. */
  private resolveRange(): { startDate: Date; endDate: Date } {
    if (this.options.startDate && this.options.endDate) {
      return { startDate: this.options.startDate, endDate: this.options.endDate };
    }

    const { tasks } = this.options;
    if (!tasks.length) {
      const now = new Date();
      return { startDate: now, endDate: new Date(now.getTime() + 30 * MS_PER_DAY) };
    }

    let min = tasks[0].start.getTime();
    let max = tasks[0].end.getTime();
    tasks.forEach((task) => {
      min = Math.min(min, task.start.getTime());
      max = Math.max(max, task.end.getTime());
    });

    return {
      startDate: this.options.startDate ?? new Date(min - MS_PER_DAY),
      endDate: this.options.endDate ?? new Date(max + MS_PER_DAY),
    };
  }

  private buildModel(): ScaleModel {
    const { startDate, endDate } = this.resolveRange();
    return buildScaleModel({
      startDate,
      endDate,
      scaleType: this.options.scaleType ?? 'months',
      calendar: this.options.calendar,
      cellWidth: this.options.cellWidth,
      locale: this.options.locale,
      formatNumber: this.options.formatNumber,
    });
  }

  /** Rebuilds the scale model, layout and DOM from the current options. */
  render(): void {
    this.scaleModel = this.buildModel();
    this.rects = layoutTasks(this.options.tasks, this.scaleModel, {
      rowHeight: this.options.rowHeight,
      barHeight: this.options.barHeight,
    });
    this.lines = layoutDependencies(this.options.dependencies ?? [], this.rects);

    renderTimeline(this.view, this.scaleModel, this.rects, this.lines, {
      rowHeight: this.options.rowHeight,
      headerRowHeight: this.options.headerRowHeight,
      selectedTaskId: this.options.selectedTaskId,
      showDependencies: this.options.showDependencies,
    });
  }

  /** Gets an option value. */
  option<K extends OptionName>(name: K): GanttTimelineOptions[K];

  /** Sets an option value and re-renders. */
  option<K extends OptionName>(name: K, value: GanttTimelineOptions[K]): void;

  option<K extends OptionName>(
    name: K,
    value?: GanttTimelineOptions[K],
  ): GanttTimelineOptions[K] | void {
    if (arguments.length === 1) {
      return this.options[name];
    }
    this.options = { ...this.options, [name]: value };
    this.render();
    return undefined;
  }

  /** The active scale model (calendar-aware), for inspection/testing. */
  getScaleModel(): ScaleModel {
    return this.scaleModel;
  }

  /** The laid-out task rectangles, for inspection/testing. */
  getTaskRects(): TaskRect[] {
    return this.rects;
  }

  /** The root `.dx-gantt` element. */
  element(): HTMLElement {
    return this.root;
  }

  dispose(): void {
    this.view.innerHTML = '';
    this.root.classList.remove('dx-gantt');
    this.root.classList.remove('dx-gantt-mc');
    if (this.view.parentNode === this.root) {
      this.root.removeChild(this.view);
    }
  }
}
