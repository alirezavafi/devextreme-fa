/* eslint-disable spellcheck/spell-checker */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/**
 * `dxGanttMultiCalendar` — a DevExtreme widget that composes the framework's own
 * `dxTreeList` (left task grid) with the calendar-aware timeline renderer
 * (right pane). It is a real registered component, so it participates in the
 * theme pipeline, RTL, dimension handling and option system like any other
 * DevExtreme widget.
 *
 * The widget root carries `dx-gantt` (theme colors) + `dx-gantt-mc` (renderer
 * structure). Task values stay native Gregorian `Date`s; the `calendar` option
 * only changes how the timeline scale is divided and labelled.
 */

import registerComponent from '@js/core/component_registrator';
import type { dxElementWrapper } from '@js/core/renderer';
import $ from '@js/core/renderer';
import { extend } from '@js/core/utils/extend';
import { isDefined } from '@js/core/utils/type';
import TreeList from '@js/ui/tree_list';
import type { CalendarType } from '@ts/core/localization/calendar';
import type { WidgetProperties } from '@ts/core/widget/widget';
import Widget from '@ts/core/widget/widget';

import { autoSchedule } from './auto_schedule';
import type {
  GanttDependenciesOption, GanttTasksOption, ResolvedTaskExprs,
} from './data_adapter';
import {
  deriveRange,
  getDefaultColumns,
  mapDependencies,
  mapTasks,
  removeDependencyRow,
  resolveDependencyExprs,
  resolveTaskExprs,
} from './data_adapter';
import type { NewDependency } from './dependency_draw';
import { DependencyDrawController } from './dependency_draw_controller';
import type { DragResult } from './interaction';
import { InteractionController } from './interaction_controller';
import { renderTimeline } from './renderer';
import type { GanttScaleType, ScaleModel } from './scale_model';
import { buildScaleModel } from './scale_model';
import type {
  DependencyLine, GanttDependencyInput, GanttTaskInput, TaskRect,
} from './task_layout';
import { layoutDependencies, layoutTasks } from './task_layout';

const GANTT_CLASS = 'dx-gantt';
const GANTT_MC_CLASS = 'dx-gantt-mc';
const GANTT_MAIN_WRAPPER = 'dx-gantt-main-wrapper';
const GANTT_TREE_LIST_WRAPPER = 'dx-gantt-treelist-wrapper';
const GANTT_VIEW_CLASS = 'dx-gantt-view';

const DEFAULT_ROW_HEIGHT = 34;

export interface GanttEditingOptions {
  enabled?: boolean;
  allowTaskMove?: boolean;
  allowTaskResize?: boolean;
  /** Push dependent successors forward to keep constraints valid. Default true. */
  autoUpdateSuccessors?: boolean;
  /** Allow drawing new dependencies between tasks. Default true. */
  allowDependencyAdding?: boolean;
  /** Allow deleting dependencies by clicking their connector. Default true. */
  allowDependencyDeleting?: boolean;
}

/**
 * Public options for the `dxGanttMultiCalendar` widget. Task values are always
 * native Gregorian `Date`s; the `calendar` option only affects how the timeline
 * scale is divided and labelled.
 */
export interface GanttMultiCalendarProperties extends WidgetProperties {
  /** Task data and the field mapping used by both the tree list and timeline. */
  tasks?: GanttTasksOption;
  /** Dependency (link) data and its field mapping. */
  dependencies?: GanttDependenciesOption;
  /** Tree-list columns. Defaults to Task/Start/End derived from `tasks`. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns?: any[];
  /**
   * Calendar system: `'gregorian'` (default), `'persian'`, `'hijri'`, or a
   * custom registered type.
   */
  calendar?: CalendarType;
  /** Timeline scale unit: days / weeks / months (default) / quarters / years. */
  scaleType?: GanttScaleType;
  /** Width of the left tree-list pane in pixels. Default 300. */
  taskListWidth?: number;
  /** Row height in pixels. Default 34. */
  rowHeight?: number;
  /** Header tier height in pixels. Default 30. */
  headerRowHeight?: number;
  /** Width of each scale column in pixels. Default 100. */
  cellWidth?: number;
  /** Whether to render dependency connectors. Default true. */
  showDependencies?: boolean;
  /** Currently selected task key. */
  selectedRowKey?: string | number | null;
  /** Explicit timeline start; auto-derived from tasks when omitted. */
  startDate?: Date;
  /** Explicit timeline end; auto-derived from tasks when omitted. */
  endDate?: Date;
  /** Locale used for calendar month names (e.g. `'fa'`). */
  locale?: string;
  /** Numeral formatter for scale labels (e.g. Persian digit shaping). */
  formatNumber?: (value: number) => string;
  /** Interactive editing configuration. */
  editing?: GanttEditingOptions;
  /** Fired after a task's dates change (drag/resize or auto-schedule). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTaskUpdated?: ((e: any) => void) | null;
  /** Fired after a dependency is drawn. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDependencyInserted?: ((e: any) => void) | null;
  /** Fired before a dependency is deleted; set `e.cancel = true` to prevent it. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDependencyDeleting?: ((e: any) => void) | null;
  /** Fired after a dependency is deleted. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDependencyDeleted?: ((e: any) => void) | null;
}

class GanttMultiCalendar extends Widget<GanttMultiCalendarProperties> {
  _$mainWrapper!: dxElementWrapper;

  _$treeListWrapper!: dxElementWrapper;

  _$treeList!: dxElementWrapper;

  _$view!: dxElementWrapper;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _treeList?: any;

  _scaleModel?: ScaleModel;

  // NOTE: these are intentionally declared WITHOUT class-field initializers and
  // are set in `_init()` instead. DevExtreme's base `Widget` constructor runs the
  // full render (`_initMarkup` -> `_renderTimeline`, which assigns `_rects`/
  // `_tasks`/etc.) synchronously inside `super()`. A class-field initializer such
  // as `_rects: TaskRect[] = []` would run AFTER `super()` returns and clobber the
  // rendered state back to empty, leaving the interaction controllers'
  // `getContext()` empty and silently breaking drag/resize and dependency draw.
  _rects!: TaskRect[];

  _lines!: DependencyLine[];

  _tasks!: GanttTaskInput[];

  _dependencies!: GanttDependencyInput[];

  _taskExprs?: ResolvedTaskExprs;

  _interaction?: InteractionController;

  _dependencyDraw?: DependencyDrawController;

  _depIdSeq!: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onTaskUpdated?: ((e: any) => void) | null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onDependencyInserted?: ((e: any) => void) | null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onDependencyDeleting?: ((e: any) => void) | null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onDependencyDeleted?: ((e: any) => void) | null;

  _init(): void {
    super._init();
    // Initialize mutable render state here (NOT as class-field initializers),
    // because field initializers run after `super()` and would clobber the
    // state produced by the render that `super()` triggers. See the field
    // declarations above.
    this._rects = [];
    this._lines = [];
    this._tasks = [];
    this._dependencies = [];
    this._depIdSeq = 0;
    this._onTaskUpdated = this._createActionByOption('onTaskUpdated');
    this._onDependencyInserted = this._createActionByOption('onDependencyInserted');
    this._onDependencyDeleting = this._createActionByOption('onDependencyDeleting');
    this._onDependencyDeleted = this._createActionByOption('onDependencyDeleted');
  }

  _getDefaultOptions(): GanttMultiCalendarProperties {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return extend(super._getDefaultOptions(), {
      tasks: {
        dataSource: [],
        keyExpr: 'id',
        parentIdExpr: 'parentId',
        titleExpr: 'title',
        startExpr: 'start',
        endExpr: 'end',
        progressExpr: 'progress',
      },
      dependencies: {
        dataSource: [],
        keyExpr: 'id',
        predecessorIdExpr: 'predecessorId',
        successorIdExpr: 'successorId',
        typeExpr: 'type',
      },
      columns: undefined,
      calendar: 'gregorian',
      scaleType: 'months',
      taskListWidth: 300,
      rowHeight: DEFAULT_ROW_HEIGHT,
      headerRowHeight: 30,
      cellWidth: 100,
      showDependencies: true,
      selectedRowKey: null,
      startDate: undefined,
      endDate: undefined,
      locale: undefined,
      editing: {
        enabled: true,
        allowTaskMove: true,
        allowTaskResize: true,
        autoUpdateSuccessors: true,
        allowDependencyAdding: true,
        allowDependencyDeleting: true,
      },
      onTaskUpdated: null,
      onDependencyInserted: null,
      onDependencyDeleting: null,
      onDependencyDeleted: null,
    });
  }

  _initMarkup(): void {
    super._initMarkup();
    this.$element().addClass(GANTT_CLASS).addClass(GANTT_MC_CLASS);

    this._$mainWrapper = $('<div>').addClass(GANTT_MAIN_WRAPPER).appendTo(this.$element());
    this._$treeListWrapper = $('<div>')
      .addClass(GANTT_TREE_LIST_WRAPPER)
      .appendTo(this._$mainWrapper);
    this._$treeList = $('<div>').appendTo(this._$treeListWrapper);
    this._$view = $('<div>').addClass(GANTT_VIEW_CLASS).appendTo(this._$mainWrapper);

    this._bindViewScroll();
    this._bindDependencyClick();
    this._renderTreeList();
    this._renderTimeline();
    this._setupInteraction();
  }

  _renderTreeList(): void {
    const {
      tasks, columns, taskListWidth, selectedRowKey, calendar,
    } = this.option();
    const exprs = resolveTaskExprs(tasks);
    const resolvedColumns = columns ?? getDefaultColumns(exprs, calendar);
    const editingEnabled = this.option().editing?.enabled !== false;

    this._treeList = this._createComponent(this._$treeList, TreeList, {
      dataSource: tasks?.dataSource ?? [],
      keyExpr: exprs.keyExpr,
      parentIdExpr: exprs.parentIdExpr,
      columns: resolvedColumns,
      autoExpandAll: true,
      showRowLines: true,
      showBorders: true,
      width: taskListWidth,
      height: '100%',
      scrolling: { mode: 'virtual', showScrollbar: 'onHover' },
      selection: { mode: 'single' },
      selectedRowKeys: isDefined(selectedRowKey) ? [selectedRowKey] : [],
      editing: { mode: 'cell', allowUpdating: editingEnabled },
      rtlEnabled: !!this.option('rtlEnabled'),
      onSelectionChanged: (e): void => this._onTreeListSelectionChanged(e),
      onRowUpdated: (e): void => this._onTreeListRowUpdated(e),
      onContentReady: (): void => this._setupScrollSync(),
      _disableDeprecationWarnings: true,
    });
  }

  // Reapply the default (calendar-aware) columns after a `calendar` change, but
  // only when the app hasn't supplied its own `columns`.
  _applyCalendarToColumns(): void {
    if (this.option().columns) {
      return;
    }
    const exprs = resolveTaskExprs(this.option().tasks);
    this._treeList?.option('columns', getDefaultColumns(exprs, this.option().calendar));
  }

  // A tree-list cell edit (start/end date or title) is committed back to the
  // task data; date edits also cascade to dependent successors and re-render the
  // timeline, mirroring a bar drag.
  _onTreeListRowUpdated(e): void {
    const { tasks, dependencies, editing } = this.option();
    const exprs = this._taskExprs ?? resolveTaskExprs(tasks);
    const row = e?.data;
    const key = e?.key;
    if (!row || key === undefined || key === null) {
      return;
    }

    const start = row[exprs.startExpr];
    const end = row[exprs.endExpr];
    const changes: DragResult[] = [];

    if (start instanceof Date && end instanceof Date) {
      changes.push({ id: key, start, end });
      if (editing?.autoUpdateSuccessors !== false) {
        const depExprs = resolveDependencyExprs(dependencies);
        const mappedTasks = mapTasks(tasks?.dataSource, exprs);
        const mappedDeps = mapDependencies(dependencies?.dataSource, depExprs);
        autoSchedule(mappedTasks, mappedDeps, [key]).forEach((update) => {
          this._writeTaskDates(update, exprs);
          changes.push(update);
        });
      }
    }

    // Reflect the edit (date and/or title) on the timeline.
    this._renderTimeline();
    // Show cascaded successor dates in the tree (the edited cell is already
    // committed by the time onRowUpdated fires).
    if (changes.length > 1) {
      this._treeList?.refresh();
    }
    changes.forEach((change) => this._onTaskUpdated?.({
      key: change.id, start: change.start, end: change.end,
    }));
  }

  _onTreeListSelectionChanged(e): void {
    const key = e.selectedRowKeys?.[0] ?? null;
    this._setOptionWithoutOptionChange('selectedRowKey', key);
    this._renderTimeline();
  }

  // Vertical scroll: timeline -> tree list (bound once in markup).
  _bindViewScroll(): void {
    const view = this._$view.get(0) as HTMLElement | undefined;
    if (!view) {
      return;
    }
    view.addEventListener('scroll', (): void => {
      const scrollable = this._treeList?.getScrollable?.();
      if (!scrollable) {
        return;
      }
      const top = view.scrollTop;
      if (scrollable.scrollTop() !== top) {
        scrollable.scrollTo({ top });
      }
    });
  }

  // Vertical scroll: tree list -> timeline (bound on tree list content ready).
  _setupScrollSync(): void {
    const scrollable = this._treeList?.getScrollable?.();
    const view = this._$view.get(0) as HTMLElement | undefined;
    if (!scrollable || !view) {
      return;
    }
    scrollable.off('scroll.ganttmc');
    scrollable.on('scroll.ganttmc', (e): void => {
      const top = e?.scrollOffset?.top ?? scrollable.scrollTop();
      if (view.scrollTop !== top) {
        view.scrollTop = top;
      }
    });
  }

  _renderTimeline(): void {
    const view = this._$view?.get(0) as HTMLElement | undefined;
    if (!view) {
      return;
    }

    const options = this.option();
    const taskExprs = resolveTaskExprs(options.tasks);
    const depExprs = resolveDependencyExprs(options.dependencies);
    const tasks = mapTasks(options.tasks?.dataSource, taskExprs);
    const dependencies = mapDependencies(options.dependencies?.dataSource, depExprs);

    this._taskExprs = taskExprs;
    this._tasks = tasks;
    this._dependencies = dependencies;

    const { startDate, endDate } = deriveRange(tasks, {
      startDate: options.startDate,
      endDate: options.endDate,
    });

    const rowHeight = options.rowHeight ?? DEFAULT_ROW_HEIGHT;

    this._scaleModel = buildScaleModel({
      startDate,
      endDate,
      scaleType: options.scaleType ?? 'months',
      calendar: options.calendar,
      cellWidth: options.cellWidth,
      locale: options.locale,
      formatNumber: options.formatNumber,
    });

    this._rects = layoutTasks(tasks, this._scaleModel, { rowHeight });
    this._lines = layoutDependencies(dependencies, this._rects);

    renderTimeline(view, this._scaleModel, this._rects, this._lines, {
      rowHeight,
      headerRowHeight: options.headerRowHeight,
      selectedTaskId: options.selectedRowKey,
      showDependencies: options.showDependencies,
      rtl: !!this.option('rtlEnabled'),
    });
  }

  _refreshData(): void {
    const { tasks } = this.option();
    this._treeList?.option('dataSource', tasks?.dataSource ?? []);
    this._renderTimeline();
  }

  _getInteractionOptions(): { allowMove: boolean; allowResize: boolean; snap: 'day' } {
    const editing = this.option().editing ?? {};
    return {
      allowMove: editing.allowTaskMove !== false,
      allowResize: editing.allowTaskResize !== false,
      snap: 'day',
    };
  }

  _setupInteraction(): void {
    const view = this._$view?.get(0) as HTMLElement | undefined;
    if (!view) {
      return;
    }
    this._interaction = new InteractionController(
      view,
      () => ({
        // Only invoked on a pointer gesture over a rendered bar, which implies
        // _renderTimeline has already built the scale model.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        scale: this._scaleModel!,
        rects: this._rects,
        tasks: this._tasks,
        rtl: !!this.option('rtlEnabled'),
      }),
      (result): void => this._onTaskCommitted(result),
      this._getInteractionOptions(),
    );
    this._dependencyDraw = new DependencyDrawController(
      view,
      () => ({
        rects: this._rects,
        dependencies: this._dependencies,
        rtl: !!this.option('rtlEnabled'),
        totalWidth: this._scaleModel?.totalWidth ?? 0,
      }),
      (dependency): void => this._onDependencyCreated(dependency),
    );
    this._updateEditingState();
  }

  _updateEditingState(): void {
    const editing = this.option().editing ?? {};
    const enabled = editing.enabled !== false;

    this._treeList?.option('editing.allowUpdating', enabled);

    if (this._interaction) {
      this._interaction.setOptions(this._getInteractionOptions());
      if (enabled) {
        this._interaction.enable();
      } else {
        this._interaction.disable();
      }
    }

    if (this._dependencyDraw) {
      if (enabled && editing.allowDependencyAdding !== false) {
        this._dependencyDraw.enable();
      } else {
        this._dependencyDraw.disable();
      }
    }
  }

  _writeTaskDates(update: DragResult, exprs: ResolvedTaskExprs): void {
    const { tasks } = this.option();
    const row = tasks?.dataSource?.find(
      (item) => String(item[exprs.keyExpr]) === String(update.id),
    );
    if (row) {
      row[exprs.startExpr] = update.start;
      row[exprs.endExpr] = update.end;
    }
  }

  _onTaskCommitted(result: DragResult): void {
    const { tasks, dependencies, editing } = this.option();
    const exprs = this._taskExprs ?? resolveTaskExprs(tasks);

    // 1. Persist the directly-edited task.
    this._writeTaskDates(result, exprs);
    const changes: DragResult[] = [result];

    // 2. Cascade to successors so dependency constraints stay valid.
    if (editing?.autoUpdateSuccessors !== false) {
      const depExprs = resolveDependencyExprs(dependencies);
      const mappedTasks = mapTasks(tasks?.dataSource, exprs);
      const mappedDeps = mapDependencies(dependencies?.dataSource, depExprs);
      autoSchedule(mappedTasks, mappedDeps, [result.id]).forEach((update) => {
        this._writeTaskDates(update, exprs);
        changes.push(update);
      });
    }

    // 3. Reflect everything once.
    this._treeList?.refresh();
    this._renderTimeline();
    changes.forEach((change) => this._onTaskUpdated?.({
      key: change.id, start: change.start, end: change.end,
    }));
  }

  _generateDependencyId(): string {
    this._depIdSeq += 1;
    return `mc-dep-${this._depIdSeq}-${Date.now()}`;
  }

  _onDependencyCreated(dependency: NewDependency): void {
    const { tasks, dependencies, editing } = this.option();
    const depExprs = resolveDependencyExprs(dependencies);
    const dataSource = dependencies?.dataSource;
    if (!dataSource) {
      return;
    }

    dataSource.push({
      [depExprs.keyExpr]: this._generateDependencyId(),
      [depExprs.predecessorIdExpr]: dependency.predecessorId,
      [depExprs.successorIdExpr]: dependency.successorId,
      [depExprs.typeExpr]: dependency.type,
    });

    // A new constraint may require pushing the successor; cascade it.
    const taskExprs = this._taskExprs ?? resolveTaskExprs(tasks);
    const shifts: DragResult[] = [];
    if (editing?.autoUpdateSuccessors !== false) {
      const mappedTasks = mapTasks(tasks?.dataSource, taskExprs);
      const mappedDeps = mapDependencies(dataSource, depExprs);
      autoSchedule(mappedTasks, mappedDeps, [dependency.predecessorId]).forEach((update) => {
        this._writeTaskDates(update, taskExprs);
        shifts.push(update);
      });
    }

    this._treeList?.refresh();
    this._renderTimeline();
    this._onDependencyInserted?.({
      predecessorId: dependency.predecessorId,
      successorId: dependency.successorId,
      type: dependency.type,
    });
    shifts.forEach((shift) => this._onTaskUpdated?.({
      key: shift.id, start: shift.start, end: shift.end,
    }));
  }

  // Click on a dependency connector requests its deletion.
  _bindDependencyClick(): void {
    const view = this._$view.get(0) as HTMLElement | undefined;
    if (!view) {
      return;
    }
    view.addEventListener('click', (e): void => {
      const target = e.target as HTMLElement | null;
      const group = target?.closest('[data-dependency-id]') as HTMLElement | null;
      if (!group) {
        return;
      }
      const editing = this.option().editing ?? {};
      if (editing.enabled === false || editing.allowDependencyDeleting === false) {
        return;
      }
      const id = group.dataset.dependencyId;
      if (id !== undefined) {
        this._onDependencyDeleteRequested(id);
      }
    });
  }

  _onDependencyDeleteRequested(id: string): void {
    const { dependencies } = this.option();
    const depExprs = resolveDependencyExprs(dependencies);
    const row = dependencies?.dataSource?.find(
      (item) => String(item[depExprs.keyExpr]) === String(id),
    );
    if (!row) {
      return;
    }

    const key = row[depExprs.keyExpr];
    const event = { key, cancel: false };
    this._onDependencyDeleting?.(event);
    if (event.cancel) {
      return;
    }

    removeDependencyRow(dependencies?.dataSource, depExprs.keyExpr, key as string | number);
    this._renderTimeline();
    this._onDependencyDeleted?.({ key });
  }

  _optionChanged(args): void {
    switch (args.name) {
      case 'tasks':
        this._refreshData();
        break;
      case 'dependencies':
        this._renderTimeline();
        break;
      case 'columns':
        this._treeList?.option(
          'columns',
          args.value ?? getDefaultColumns(resolveTaskExprs(this.option().tasks)),
        );
        break;
      case 'taskListWidth':
        this._treeList?.option('width', args.value);
        break;
      case 'selectedRowKey':
        this._treeList?.option('selectedRowKeys', isDefined(args.value) ? [args.value] : []);
        this._renderTimeline();
        break;
      case 'calendar':
        this._applyCalendarToColumns();
        this._renderTimeline();
        break;
      case 'scaleType':
      case 'cellWidth':
      case 'rowHeight':
      case 'headerRowHeight':
      case 'showDependencies':
      case 'startDate':
      case 'endDate':
      case 'locale':
      case 'formatNumber':
        this._renderTimeline();
        break;
      case 'editing':
        this._updateEditingState();
        break;
      case 'rtlEnabled':
        super._optionChanged(args);
        this._treeList?.option('rtlEnabled', !!args.value);
        this._renderTimeline();
        break;
      case 'onTaskUpdated':
        this._onTaskUpdated = this._createActionByOption('onTaskUpdated');
        break;
      case 'onDependencyInserted':
        this._onDependencyInserted = this._createActionByOption('onDependencyInserted');
        break;
      case 'onDependencyDeleting':
        this._onDependencyDeleting = this._createActionByOption('onDependencyDeleting');
        break;
      case 'onDependencyDeleted':
        this._onDependencyDeleted = this._createActionByOption('onDependencyDeleted');
        break;
      default:
        super._optionChanged(args);
    }
  }

  _dispose(): void {
    this._interaction?.dispose();
    this._dependencyDraw?.dispose();
    super._dispose();
  }

  /** The active calendar-aware scale model (for inspection/tests). */
  getScaleModel(): ScaleModel | undefined {
    return this._scaleModel;
  }

  /** The inner dxTreeList instance. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTreeList(): any {
    return this._treeList;
  }
}

registerComponent('dxGanttMultiCalendar', GanttMultiCalendar);

export default GanttMultiCalendar;
