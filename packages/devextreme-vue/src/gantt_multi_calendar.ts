import { PropType } from "vue";
import { defineComponent } from "vue";
import { prepareComponentConfig } from "./core/index";
import GanttMultiCalendar, { Properties } from "devextreme/ui/gantt_multi_calendar";
import DataSource from "devextreme/data/data_source";
import {
 ContentReadyEvent,
 DependencyDeletedEvent,
 DependencyDeletingEvent,
 DependencyInsertedEvent,
 DisposingEvent,
 InitializedEvent,
 OptionChangedEvent,
 TaskUpdatedEvent,
 GanttMultiCalendarScaleType,
 GanttMultiCalendarCalendarType,
} from "devextreme/ui/gantt_multi_calendar";
import {
 DataType,
} from "devextreme/common";
import {
 DataSourceOptions,
} from "devextreme/common/data";
import {
 Store,
} from "devextreme/data/store";
import { prepareConfigurationComponentConfig } from "./core/index";

type AccessibleOptions = Pick<Properties,
  "accessKey" |
  "activeStateEnabled" |
  "calendar" |
  "cellWidth" |
  "columns" |
  "dependencies" |
  "disabled" |
  "editing" |
  "elementAttr" |
  "endDate" |
  "focusStateEnabled" |
  "headerRowHeight" |
  "height" |
  "hint" |
  "hoverStateEnabled" |
  "locale" |
  "onContentReady" |
  "onDependencyDeleted" |
  "onDependencyDeleting" |
  "onDependencyInserted" |
  "onDisposing" |
  "onInitialized" |
  "onOptionChanged" |
  "onTaskUpdated" |
  "rowHeight" |
  "rtlEnabled" |
  "scaleType" |
  "selectedRowKey" |
  "showDependencies" |
  "startDate" |
  "tabIndex" |
  "taskListWidth" |
  "tasks" |
  "visible" |
  "width"
>;

interface DxGanttMultiCalendar extends AccessibleOptions {
  readonly instance?: GanttMultiCalendar;
}

const componentConfig = {
  props: {
    accessKey: String,
    activeStateEnabled: Boolean,
    calendar: String as PropType<GanttMultiCalendarCalendarType>,
    cellWidth: Number,
    columns: Array as PropType<Array<any | string>>,
    dependencies: Object as PropType<Record<string, any>>,
    disabled: Boolean,
    editing: Object as PropType<Record<string, any>>,
    elementAttr: Object as PropType<Record<string, any>>,
    endDate: Date,
    focusStateEnabled: Boolean,
    headerRowHeight: Number,
    height: [Number, String],
    hint: String,
    hoverStateEnabled: Boolean,
    locale: String,
    onContentReady: Function as PropType<((e: ContentReadyEvent) => void)>,
    onDependencyDeleted: Function as PropType<((e: DependencyDeletedEvent) => void)>,
    onDependencyDeleting: Function as PropType<((e: DependencyDeletingEvent) => void)>,
    onDependencyInserted: Function as PropType<((e: DependencyInsertedEvent) => void)>,
    onDisposing: Function as PropType<((e: DisposingEvent) => void)>,
    onInitialized: Function as PropType<((e: InitializedEvent) => void)>,
    onOptionChanged: Function as PropType<((e: OptionChangedEvent) => void)>,
    onTaskUpdated: Function as PropType<((e: TaskUpdatedEvent) => void)>,
    rowHeight: Number,
    rtlEnabled: Boolean,
    scaleType: String as PropType<GanttMultiCalendarScaleType>,
    selectedRowKey: {},
    showDependencies: Boolean,
    startDate: Date,
    tabIndex: Number,
    taskListWidth: Number,
    tasks: Object as PropType<Record<string, any>>,
    visible: Boolean,
    width: [Number, String]
  },
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:accessKey": null,
    "update:activeStateEnabled": null,
    "update:calendar": null,
    "update:cellWidth": null,
    "update:columns": null,
    "update:dependencies": null,
    "update:disabled": null,
    "update:editing": null,
    "update:elementAttr": null,
    "update:endDate": null,
    "update:focusStateEnabled": null,
    "update:headerRowHeight": null,
    "update:height": null,
    "update:hint": null,
    "update:hoverStateEnabled": null,
    "update:locale": null,
    "update:onContentReady": null,
    "update:onDependencyDeleted": null,
    "update:onDependencyDeleting": null,
    "update:onDependencyInserted": null,
    "update:onDisposing": null,
    "update:onInitialized": null,
    "update:onOptionChanged": null,
    "update:onTaskUpdated": null,
    "update:rowHeight": null,
    "update:rtlEnabled": null,
    "update:scaleType": null,
    "update:selectedRowKey": null,
    "update:showDependencies": null,
    "update:startDate": null,
    "update:tabIndex": null,
    "update:taskListWidth": null,
    "update:tasks": null,
    "update:visible": null,
    "update:width": null,
  },
  computed: {
    instance(): GanttMultiCalendar {
      return (this as any).$_instance;
    }
  },
  beforeCreate() {
    (this as any).$_WidgetClass = GanttMultiCalendar;
    (this as any).$_hasAsyncTemplate = true;
    (this as any).$_expectedChildren = {
      column: { isCollectionItem: true, optionName: "columns" },
      dependencies: { isCollectionItem: false, optionName: "dependencies" },
      editing: { isCollectionItem: false, optionName: "editing" },
      tasks: { isCollectionItem: false, optionName: "tasks" }
    };
  }
};

prepareComponentConfig(componentConfig);

const DxGanttMultiCalendar = defineComponent(componentConfig);


const DxColumnConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:caption": null,
    "update:dataField": null,
    "update:dataType": null,
    "update:visible": null,
    "update:width": null,
  },
  props: {
    caption: String,
    dataField: String,
    dataType: String as PropType<DataType>,
    visible: Boolean,
    width: [Number, String]
  }
};

prepareConfigurationComponentConfig(DxColumnConfig);

const DxColumn = defineComponent(DxColumnConfig);

(DxColumn as any).$_optionName = "columns";
(DxColumn as any).$_isCollectionItem = true;

const DxDependenciesConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:dataSource": null,
    "update:keyExpr": null,
    "update:predecessorIdExpr": null,
    "update:successorIdExpr": null,
    "update:typeExpr": null,
  },
  props: {
    dataSource: [Array, Object, String] as PropType<Array<any> | DataSource | DataSourceOptions | null | Store | string | Record<string, any>>,
    keyExpr: String,
    predecessorIdExpr: String,
    successorIdExpr: String,
    typeExpr: String
  }
};

prepareConfigurationComponentConfig(DxDependenciesConfig);

const DxDependencies = defineComponent(DxDependenciesConfig);

(DxDependencies as any).$_optionName = "dependencies";

const DxEditingConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:allowDependencyAdding": null,
    "update:allowDependencyDeleting": null,
    "update:allowTaskMove": null,
    "update:allowTaskResize": null,
    "update:autoUpdateSuccessors": null,
    "update:enabled": null,
  },
  props: {
    allowDependencyAdding: Boolean,
    allowDependencyDeleting: Boolean,
    allowTaskMove: Boolean,
    allowTaskResize: Boolean,
    autoUpdateSuccessors: Boolean,
    enabled: Boolean
  }
};

prepareConfigurationComponentConfig(DxEditingConfig);

const DxEditing = defineComponent(DxEditingConfig);

(DxEditing as any).$_optionName = "editing";

const DxTasksConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:colorExpr": null,
    "update:dataSource": null,
    "update:endExpr": null,
    "update:keyExpr": null,
    "update:parentIdExpr": null,
    "update:progressExpr": null,
    "update:startExpr": null,
    "update:titleExpr": null,
  },
  props: {
    colorExpr: String,
    dataSource: [Array, Object, String] as PropType<Array<any> | DataSource | DataSourceOptions | null | Store | string | Record<string, any>>,
    endExpr: String,
    keyExpr: String,
    parentIdExpr: String,
    progressExpr: String,
    startExpr: String,
    titleExpr: String
  }
};

prepareConfigurationComponentConfig(DxTasksConfig);

const DxTasks = defineComponent(DxTasksConfig);

(DxTasks as any).$_optionName = "tasks";

export default DxGanttMultiCalendar;
export {
  DxGanttMultiCalendar,
  DxColumn,
  DxDependencies,
  DxEditing,
  DxTasks
};
import type * as DxGanttMultiCalendarTypes from "devextreme/ui/gantt_multi_calendar_types";
export { DxGanttMultiCalendarTypes };
