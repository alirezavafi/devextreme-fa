import {
    EventInfo,
    InitializedEventInfo,
    ChangedOptionInfo,
    Cancelable,
} from '../events';

import {
    DataSourceLike,
} from '../data/data_source';

import Widget, {
    WidgetOptions,
} from './widget/ui.widget';

import dxTreeList, {
    Column as TreeListColumn,
} from './tree_list';

/**
 * @docid
 * @public
 */
export type GanttMultiCalendarScaleType = 'days' | 'weeks' | 'months' | 'quarters' | 'years';

/**
 * @docid
 * @public
 */
export type GanttMultiCalendarCalendarType = 'gregorian' | 'persian' | 'hijri' | string;

/**
 * @docid
 * @public
 */
export type GanttMultiCalendarDependencyType = 0 | 1 | 2 | 3;

/**
 * @docid _ui_gantt_multi_calendar_ContentReadyEvent
 * @public
 * @type object
 * @inherits EventInfo
 */
export type ContentReadyEvent = EventInfo<dxGanttMultiCalendar>;

/**
 * @docid _ui_gantt_multi_calendar_DisposingEvent
 * @public
 * @type object
 * @inherits EventInfo
 */
export type DisposingEvent = EventInfo<dxGanttMultiCalendar>;

/**
 * @docid _ui_gantt_multi_calendar_InitializedEvent
 * @public
 * @type object
 * @inherits InitializedEventInfo
 */
export type InitializedEvent = InitializedEventInfo<dxGanttMultiCalendar>;

/**
 * @docid _ui_gantt_multi_calendar_OptionChangedEvent
 * @public
 * @type object
 * @inherits EventInfo,ChangedOptionInfo
 */
export type OptionChangedEvent = EventInfo<dxGanttMultiCalendar> & ChangedOptionInfo;

/**
 * @docid _ui_gantt_multi_calendar_TaskUpdatedEvent
 * @public
 * @type object
 * @inherits EventInfo
 */
export type TaskUpdatedEvent = EventInfo<dxGanttMultiCalendar> & {
    readonly key: any;
    readonly start: Date;
    readonly end: Date;
};

/**
 * @docid _ui_gantt_multi_calendar_DependencyInsertedEvent
 * @public
 * @type object
 * @inherits EventInfo
 */
export type DependencyInsertedEvent = EventInfo<dxGanttMultiCalendar> & {
    readonly predecessorId: any;
    readonly successorId: any;
    readonly type: GanttMultiCalendarDependencyType;
};

/**
 * @docid _ui_gantt_multi_calendar_DependencyDeletingEvent
 * @public
 * @type object
 * @inherits Cancelable,EventInfo
 */
export type DependencyDeletingEvent = Cancelable & EventInfo<dxGanttMultiCalendar> & {
    readonly key: any;
};

/**
 * @docid _ui_gantt_multi_calendar_DependencyDeletedEvent
 * @public
 * @type object
 * @inherits EventInfo
 */
export type DependencyDeletedEvent = EventInfo<dxGanttMultiCalendar> & {
    readonly key: any;
};

/**
 * @docid
 * @namespace DevExpress.ui
 * @public
 */
export interface dxGanttMultiCalendarOptions extends WidgetOptions<dxGanttMultiCalendar> {
    /**
     * @docid
     * @default null
     * @public
     */
    tasks?: {
      /**
       * @docid
       * @default null
       * @type Store|DataSource|DataSourceOptions|string|Array<any>|null
       */
      dataSource?: DataSourceLike<any> | null;
      /**
       * @docid
       * @default "id"
       */
      keyExpr?: string;
      /**
       * @docid
       * @default "parentId"
       */
      parentIdExpr?: string;
      /**
       * @docid
       * @default "title"
       */
      titleExpr?: string;
      /**
       * @docid
       * @default "start"
       */
      startExpr?: string;
      /**
       * @docid
       * @default "end"
       */
      endExpr?: string;
      /**
       * @docid
       * @default "progress"
       */
      progressExpr?: string;
      /**
       * @docid
       * @default "color"
       */
      colorExpr?: string;
    };
    /**
     * @docid
     * @default null
     * @public
     */
    dependencies?: {
      /**
       * @docid
       * @default null
       * @type Store|DataSource|DataSourceOptions|string|Array<any>|null
       */
      dataSource?: DataSourceLike<any> | null;
      /**
       * @docid
       * @default "id"
       */
      keyExpr?: string;
      /**
       * @docid
       * @default "predecessorId"
       */
      predecessorIdExpr?: string;
      /**
       * @docid
       * @default "successorId"
       */
      successorIdExpr?: string;
      /**
       * @docid
       * @default "type"
       */
      typeExpr?: string;
    };
    /**
     * @docid
     * @type Array<dxTreeListColumn|string>
     * @default undefined
     * @public
     */
    columns?: Array<TreeListColumn | string> | undefined;
    /**
     * @docid
     * @default "gregorian"
     * @public
     */
    calendar?: 'gregorian' | 'persian' | 'hijri' | string;
    /**
     * @docid
     * @default "months"
     * @public
     */
    scaleType?: GanttMultiCalendarScaleType;
    /**
     * @docid
     * @default 300
     * @public
     */
    taskListWidth?: number;
    /**
     * @docid
     * @default 34
     * @public
     */
    rowHeight?: number;
    /**
     * @docid
     * @default 30
     * @public
     */
    headerRowHeight?: number;
    /**
     * @docid
     * @default 100
     * @public
     */
    cellWidth?: number;
    /**
     * @docid
     * @default true
     * @public
     */
    showDependencies?: boolean;
    /**
     * @docid
     * @default undefined
     * @public
     */
    selectedRowKey?: any | undefined;
    /**
     * @docid
     * @default undefined
     * @public
     */
    startDate?: Date | undefined;
    /**
     * @docid
     * @default undefined
     * @public
     */
    endDate?: Date | undefined;
    /**
     * @docid
     * @default undefined
     * @public
     */
    locale?: string | undefined;
    /**
     * @docid
     * @public
     */
    editing?: {
      /**
       * @docid
       * @default true
       */
      enabled?: boolean;
      /**
       * @docid
       * @default true
       */
      allowTaskMove?: boolean;
      /**
       * @docid
       * @default true
       */
      allowTaskResize?: boolean;
      /**
       * @docid
       * @default true
       */
      autoUpdateSuccessors?: boolean;
      /**
       * @docid
       * @default true
       */
      allowDependencyAdding?: boolean;
      /**
       * @docid
       * @default true
       */
      allowDependencyDeleting?: boolean;
    };
    /**
     * @docid
     * @default null
     * @type_function_param1 e:{ui/gantt_multi_calendar:TaskUpdatedEvent}
     * @action
     * @public
     */
    onTaskUpdated?: ((e: TaskUpdatedEvent) => void);
    /**
     * @docid
     * @default null
     * @type_function_param1 e:{ui/gantt_multi_calendar:DependencyInsertedEvent}
     * @action
     * @public
     */
    onDependencyInserted?: ((e: DependencyInsertedEvent) => void);
    /**
     * @docid
     * @default null
     * @type_function_param1 e:{ui/gantt_multi_calendar:DependencyDeletingEvent}
     * @action
     * @public
     */
    onDependencyDeleting?: ((e: DependencyDeletingEvent) => void);
    /**
     * @docid
     * @default null
     * @type_function_param1 e:{ui/gantt_multi_calendar:DependencyDeletedEvent}
     * @action
     * @public
     */
    onDependencyDeleted?: ((e: DependencyDeletedEvent) => void);
}
/**
 * @docid
 * @inherits Widget
 * @namespace DevExpress.ui
 * @public
 */
export default class dxGanttMultiCalendar extends Widget<dxGanttMultiCalendarOptions> {
    /**
     * @docid
     * @publicName getTreeList()
     * @return dxTreeList
     * @public
     */
    getTreeList(): dxTreeList;
}

/** @public */
export type Properties = dxGanttMultiCalendarOptions;

/** @deprecated use Properties instead */
export type Options = dxGanttMultiCalendarOptions;
