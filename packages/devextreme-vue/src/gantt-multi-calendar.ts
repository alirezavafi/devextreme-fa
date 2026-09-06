import { PropType } from "vue";
import { defineComponent } from "vue";
import { prepareComponentConfig } from "./core/index";
import GanttMultiCalendar, { Properties } from "devextreme/ui/gantt_multi_calendar";
import  DOMComponent from "devextreme/core/dom_component";
import  dxTreeList from "devextreme/ui/tree_list";
import  DataSource from "devextreme/data/data_source";
import {
 dxTreeListColumn,
 dxTreeListRowObject,
 TreeListPredefinedColumnButton,
 ColumnButtonClickEvent,
 dxTreeListColumnButton,
 TreeListCommandColumnType,
} from "devextreme/ui/tree_list";
import {
 EventInfo,
} from "devextreme/common/core/events";
import {
 DependencyDeletedEvent,
 DependencyDeletingEvent,
 DependencyInsertedEvent,
 TaskUpdatedEvent,
 GanttMultiCalendarScaleType,
} from "devextreme/ui/gantt_multi_calendar";
import {
 Component,
} from "devextreme/core/component";
import {
 AIIntegration,
} from "devextreme/common/ai-integration";
import {
 dxTextBoxOptions,
 TextBoxType,
 ChangeEvent,
 ContentReadyEvent,
 CopyEvent,
 CutEvent,
 DisposingEvent,
 EnterKeyEvent,
 FocusInEvent,
 FocusOutEvent,
 InitializedEvent,
 InputEvent,
 KeyDownEvent,
 KeyUpEvent,
 OptionChangedEvent,
 PasteEvent,
 ValueChangedEvent,
} from "devextreme/ui/text_box";
import {
 AIColumnMode,
 ColumnAIOptions,
 FilterOperation,
 FilterType,
 FixedPosition,
 ColumnHeaderFilter,
 SelectedFilterOperation,
 HeaderFilterGroupInterval,
 ColumnHeaderFilterSearchConfig,
 HeaderFilterSearchConfig,
} from "devextreme/common/grids";
import {
 ValidationRuleType,
 TextEditorButtonLocation,
 HorizontalAlignment,
 DataType,
 Format as CommonFormat,
 SortOrder,
 ComparisonOperator,
 TextBoxPredefinedButton,
 TextEditorButton,
 LabelMode,
 MaskMode,
 EditorStyle,
 ValidationMessageMode,
 Position,
 ValidationStatus,
 SearchMode,
 ButtonStyle,
 ButtonType,
} from "devextreme/common";
import {
 dxButtonOptions,
 ClickEvent,
 ContentReadyEvent as ButtonContentReadyEvent,
 DisposingEvent as ButtonDisposingEvent,
 InitializedEvent as ButtonInitializedEvent,
 OptionChangedEvent as ButtonOptionChangedEvent,
} from "devextreme/ui/button";
import {
 Format,
} from "devextreme/common/core/localization";
import {
 dxFormSimpleItem,
 FormItemComponent,
 FormItemType,
 LabelLocation,
} from "devextreme/ui/form";
import {
 DataSourceOptions,
} from "devextreme/common/data";
import {
 Store,
} from "devextreme/data/store";
import  * as CommonTypes from "devextreme/common";
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
    calendar: String as PropType<"gregorian" | "persian" | "hijri">,
    cellWidth: Number,
    columns: Array as PropType<Array<dxTreeListColumn | string>>,
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
    onContentReady: Function as PropType<((e: EventInfo<any>) => void)>,
    onDependencyDeleted: Function as PropType<((e: DependencyDeletedEvent) => void)>,
    onDependencyDeleting: Function as PropType<((e: DependencyDeletingEvent) => void)>,
    onDependencyInserted: Function as PropType<((e: DependencyInsertedEvent) => void)>,
    onDisposing: Function as PropType<((e: EventInfo<any>) => void)>,
    onInitialized: Function as PropType<((e: { component: Component<any>, element: any }) => void)>,
    onOptionChanged: Function as PropType<((e: { component: DOMComponent, element: any, fullName: string, model: any, name: string, previousValue: any, value: any }) => void)>,
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


const DxAIConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:aiIntegration": null,
    "update:editorOptions": null,
    "update:emptyText": null,
    "update:mode": null,
    "update:noDataText": null,
    "update:popup": null,
    "update:prompt": null,
    "update:showHeaderMenu": null,
  },
  props: {
    aiIntegration: Object as PropType<AIIntegration>,
    editorOptions: Object as PropType<dxTextBoxOptions<any> | Record<string, any>>,
    emptyText: String,
    mode: String as PropType<AIColumnMode>,
    noDataText: String,
    popup: Object as PropType<Record<string, any>>,
    prompt: String,
    showHeaderMenu: Boolean
  }
};

prepareConfigurationComponentConfig(DxAIConfig);

const DxAI = defineComponent(DxAIConfig);

(DxAI as any).$_optionName = "ai";
(DxAI as any).$_expectedChildren = {
  editorOptions: { isCollectionItem: false, optionName: "editorOptions" }
};

const DxAIOptionsConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:disabled": null,
    "update:instruction": null,
  },
  props: {
    disabled: Boolean,
    instruction: String
  }
};

prepareConfigurationComponentConfig(DxAIOptionsConfig);

const DxAIOptions = defineComponent(DxAIOptionsConfig);

(DxAIOptions as any).$_optionName = "aiOptions";

const DxAsyncRuleConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:ignoreEmptyValue": null,
    "update:message": null,
    "update:reevaluate": null,
    "update:type": null,
    "update:validationCallback": null,
  },
  props: {
    ignoreEmptyValue: Boolean,
    message: String,
    reevaluate: Boolean,
    type: String as PropType<ValidationRuleType>,
    validationCallback: Function as PropType<((options: { column: Record<string, any>, data: Record<string, any>, formItem: Record<string, any>, rule: Record<string, any>, validator: Record<string, any>, value: any }) => any)>
  }
};

prepareConfigurationComponentConfig(DxAsyncRuleConfig);

const DxAsyncRule = defineComponent(DxAsyncRuleConfig);

(DxAsyncRule as any).$_optionName = "validationRules";
(DxAsyncRule as any).$_isCollectionItem = true;
(DxAsyncRule as any).$_predefinedProps = {
  type: "async"
};

const DxButtonConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:cssClass": null,
    "update:disabled": null,
    "update:hint": null,
    "update:icon": null,
    "update:location": null,
    "update:name": null,
    "update:onClick": null,
    "update:options": null,
    "update:template": null,
    "update:text": null,
    "update:visible": null,
  },
  props: {
    cssClass: String,
    disabled: [Boolean, Function] as PropType<boolean | (((options: { column: dxTreeListColumn, component: dxTreeList, row: dxTreeListRowObject }) => boolean))>,
    hint: String,
    icon: String,
    location: String as PropType<TextEditorButtonLocation>,
    name: String as PropType<string | TreeListPredefinedColumnButton>,
    onClick: Function as PropType<((e: ColumnButtonClickEvent) => void)>,
    options: Object as PropType<dxButtonOptions | Record<string, any>>,
    template: {},
    text: String,
    visible: [Boolean, Function] as PropType<boolean | (((options: { column: dxTreeListColumn, component: dxTreeList, row: dxTreeListRowObject }) => boolean))>
  }
};

prepareConfigurationComponentConfig(DxButtonConfig);

const DxButton = defineComponent(DxButtonConfig);

(DxButton as any).$_optionName = "buttons";
(DxButton as any).$_isCollectionItem = true;
(DxButton as any).$_expectedChildren = {
  options: { isCollectionItem: false, optionName: "options" }
};

const DxColumnConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:ai": null,
    "update:alignment": null,
    "update:allowEditing": null,
    "update:allowFiltering": null,
    "update:allowFixing": null,
    "update:allowHeaderFiltering": null,
    "update:allowHiding": null,
    "update:allowReordering": null,
    "update:allowResizing": null,
    "update:allowSearch": null,
    "update:allowSorting": null,
    "update:buttons": null,
    "update:calculateCellValue": null,
    "update:calculateDisplayValue": null,
    "update:calculateFilterExpression": null,
    "update:calculateSortValue": null,
    "update:caption": null,
    "update:cellTemplate": null,
    "update:columns": null,
    "update:cssClass": null,
    "update:customizeText": null,
    "update:dataField": null,
    "update:dataType": null,
    "update:editCellTemplate": null,
    "update:editorOptions": null,
    "update:encodeHtml": null,
    "update:falseText": null,
    "update:filterOperations": null,
    "update:filterType": null,
    "update:filterValue": null,
    "update:filterValues": null,
    "update:fixed": null,
    "update:fixedPosition": null,
    "update:format": null,
    "update:formItem": null,
    "update:headerCellTemplate": null,
    "update:headerFilter": null,
    "update:hidingPriority": null,
    "update:isBand": null,
    "update:lookup": null,
    "update:minWidth": null,
    "update:name": null,
    "update:ownerBand": null,
    "update:renderAsync": null,
    "update:selectedFilterOperation": null,
    "update:setCellValue": null,
    "update:showEditorAlways": null,
    "update:showInColumnChooser": null,
    "update:sortIndex": null,
    "update:sortingMethod": null,
    "update:sortOrder": null,
    "update:trueText": null,
    "update:type": null,
    "update:validationRules": null,
    "update:visible": null,
    "update:visibleIndex": null,
    "update:width": null,
  },
  props: {
    ai: Object as PropType<ColumnAIOptions | Record<string, any>>,
    alignment: String as PropType<HorizontalAlignment>,
    allowEditing: Boolean,
    allowFiltering: Boolean,
    allowFixing: Boolean,
    allowHeaderFiltering: Boolean,
    allowHiding: Boolean,
    allowReordering: Boolean,
    allowResizing: Boolean,
    allowSearch: Boolean,
    allowSorting: Boolean,
    buttons: Array as PropType<Array<dxTreeListColumnButton | TreeListPredefinedColumnButton>>,
    calculateCellValue: Function as PropType<((rowData: any) => any)>,
    calculateDisplayValue: [Function, String] as PropType<(((rowData: any) => any)) | string>,
    calculateFilterExpression: Function as PropType<((filterValue: any, selectedFilterOperation: string | null, target: string) => string | (() => any) | Array<any>)>,
    calculateSortValue: [Function, String] as PropType<(((rowData: any) => any)) | string>,
    caption: String,
    cellTemplate: {},
    columns: Array as PropType<Array<dxTreeListColumn | string>>,
    cssClass: String,
    customizeText: Function as PropType<((cellInfo: { groupInterval: string | number, target: string, value: any, valueText: string }) => string)>,
    dataField: String,
    dataType: String as PropType<DataType>,
    editCellTemplate: {},
    editorOptions: {},
    encodeHtml: Boolean,
    falseText: String,
    filterOperations: Array as PropType<Array<FilterOperation | string>>,
    filterType: String as PropType<FilterType>,
    filterValue: {},
    filterValues: Array as PropType<Array<any>>,
    fixed: Boolean,
    fixedPosition: String as PropType<FixedPosition>,
    format: [Object, String, Function] as PropType<Format | CommonFormat | (((value: number | Date) => string)) | Record<string, any> | string>,
    formItem: Object as PropType<dxFormSimpleItem | Record<string, any>>,
    headerCellTemplate: {},
    headerFilter: Object as PropType<ColumnHeaderFilter | Record<string, any>>,
    hidingPriority: Number,
    isBand: Boolean,
    lookup: Object as PropType<Record<string, any>>,
    minWidth: Number,
    name: String,
    ownerBand: Number,
    renderAsync: Boolean,
    selectedFilterOperation: String as PropType<SelectedFilterOperation>,
    setCellValue: Function as PropType<((newData: any, value: any, currentRowData: any) => any)>,
    showEditorAlways: Boolean,
    showInColumnChooser: Boolean,
    sortIndex: Number,
    sortingMethod: Function as PropType<((value1: any, value2: any) => number)>,
    sortOrder: String as PropType<SortOrder>,
    trueText: String,
    type: String as PropType<TreeListCommandColumnType>,
    validationRules: Array as PropType<Array<CommonTypes.ValidationRule>>,
    visible: Boolean,
    visibleIndex: Number,
    width: [Number, String]
  }
};

prepareConfigurationComponentConfig(DxColumnConfig);

const DxColumn = defineComponent(DxColumnConfig);

(DxColumn as any).$_optionName = "columns";
(DxColumn as any).$_isCollectionItem = true;
(DxColumn as any).$_expectedChildren = {
  ai: { isCollectionItem: false, optionName: "ai" },
  AsyncRule: { isCollectionItem: true, optionName: "validationRules" },
  button: { isCollectionItem: true, optionName: "buttons" },
  columnButton: { isCollectionItem: true, optionName: "buttons" },
  CompareRule: { isCollectionItem: true, optionName: "validationRules" },
  CustomRule: { isCollectionItem: true, optionName: "validationRules" },
  EmailRule: { isCollectionItem: true, optionName: "validationRules" },
  format: { isCollectionItem: false, optionName: "format" },
  formItem: { isCollectionItem: false, optionName: "formItem" },
  headerFilter: { isCollectionItem: false, optionName: "headerFilter" },
  lookup: { isCollectionItem: false, optionName: "lookup" },
  NumericRule: { isCollectionItem: true, optionName: "validationRules" },
  PatternRule: { isCollectionItem: true, optionName: "validationRules" },
  RangeRule: { isCollectionItem: true, optionName: "validationRules" },
  RequiredRule: { isCollectionItem: true, optionName: "validationRules" },
  StringLengthRule: { isCollectionItem: true, optionName: "validationRules" },
  validationRule: { isCollectionItem: true, optionName: "validationRules" }
};

const DxColumnButtonConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:cssClass": null,
    "update:disabled": null,
    "update:hint": null,
    "update:icon": null,
    "update:name": null,
    "update:onClick": null,
    "update:template": null,
    "update:text": null,
    "update:visible": null,
  },
  props: {
    cssClass: String,
    disabled: [Boolean, Function] as PropType<boolean | (((options: { column: dxTreeListColumn, component: dxTreeList, row: dxTreeListRowObject }) => boolean))>,
    hint: String,
    icon: String,
    name: String as PropType<string | TreeListPredefinedColumnButton>,
    onClick: Function as PropType<((e: ColumnButtonClickEvent) => void)>,
    template: {},
    text: String,
    visible: [Boolean, Function] as PropType<boolean | (((options: { column: dxTreeListColumn, component: dxTreeList, row: dxTreeListRowObject }) => boolean))>
  }
};

prepareConfigurationComponentConfig(DxColumnButtonConfig);

const DxColumnButton = defineComponent(DxColumnButtonConfig);

(DxColumnButton as any).$_optionName = "buttons";
(DxColumnButton as any).$_isCollectionItem = true;

const DxCompareRuleConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:comparisonTarget": null,
    "update:comparisonType": null,
    "update:ignoreEmptyValue": null,
    "update:message": null,
    "update:type": null,
  },
  props: {
    comparisonTarget: Function as PropType<(() => any)>,
    comparisonType: String as PropType<ComparisonOperator>,
    ignoreEmptyValue: Boolean,
    message: String,
    type: String as PropType<ValidationRuleType>
  }
};

prepareConfigurationComponentConfig(DxCompareRuleConfig);

const DxCompareRule = defineComponent(DxCompareRuleConfig);

(DxCompareRule as any).$_optionName = "validationRules";
(DxCompareRule as any).$_isCollectionItem = true;
(DxCompareRule as any).$_predefinedProps = {
  type: "compare"
};

const DxCustomRuleConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:ignoreEmptyValue": null,
    "update:message": null,
    "update:reevaluate": null,
    "update:type": null,
    "update:validationCallback": null,
  },
  props: {
    ignoreEmptyValue: Boolean,
    message: String,
    reevaluate: Boolean,
    type: String as PropType<ValidationRuleType>,
    validationCallback: Function as PropType<((options: { column: Record<string, any>, data: Record<string, any>, formItem: Record<string, any>, rule: Record<string, any>, validator: Record<string, any>, value: any }) => boolean)>
  }
};

prepareConfigurationComponentConfig(DxCustomRuleConfig);

const DxCustomRule = defineComponent(DxCustomRuleConfig);

(DxCustomRule as any).$_optionName = "validationRules";
(DxCustomRule as any).$_isCollectionItem = true;
(DxCustomRule as any).$_predefinedProps = {
  type: "custom"
};

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

const DxEditorOptionsConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:accessKey": null,
    "update:activeStateEnabled": null,
    "update:buttons": null,
    "update:disabled": null,
    "update:elementAttr": null,
    "update:focusStateEnabled": null,
    "update:height": null,
    "update:hint": null,
    "update:hoverStateEnabled": null,
    "update:inputAttr": null,
    "update:isDirty": null,
    "update:isValid": null,
    "update:label": null,
    "update:labelMode": null,
    "update:mask": null,
    "update:maskChar": null,
    "update:maskInvalidMessage": null,
    "update:maskRules": null,
    "update:maxLength": null,
    "update:mode": null,
    "update:name": null,
    "update:onChange": null,
    "update:onContentReady": null,
    "update:onCopy": null,
    "update:onCut": null,
    "update:onDisposing": null,
    "update:onEnterKey": null,
    "update:onFocusIn": null,
    "update:onFocusOut": null,
    "update:onInitialized": null,
    "update:onInput": null,
    "update:onKeyDown": null,
    "update:onKeyUp": null,
    "update:onOptionChanged": null,
    "update:onPaste": null,
    "update:onValueChanged": null,
    "update:placeholder": null,
    "update:readOnly": null,
    "update:rtlEnabled": null,
    "update:showClearButton": null,
    "update:showMaskMode": null,
    "update:spellcheck": null,
    "update:stylingMode": null,
    "update:tabIndex": null,
    "update:text": null,
    "update:useMaskedValue": null,
    "update:validationError": null,
    "update:validationErrors": null,
    "update:validationMessageMode": null,
    "update:validationMessagePosition": null,
    "update:validationStatus": null,
    "update:value": null,
    "update:valueChangeEvent": null,
    "update:visible": null,
    "update:width": null,
  },
  props: {
    accessKey: String,
    activeStateEnabled: Boolean,
    buttons: Array as PropType<Array<string | TextBoxPredefinedButton | TextEditorButton>>,
    disabled: Boolean,
    elementAttr: Object as PropType<Record<string, any>>,
    focusStateEnabled: Boolean,
    height: [Number, String],
    hint: String,
    hoverStateEnabled: Boolean,
    inputAttr: {},
    isDirty: Boolean,
    isValid: Boolean,
    label: String,
    labelMode: String as PropType<LabelMode>,
    mask: String,
    maskChar: String,
    maskInvalidMessage: String,
    maskRules: {},
    maxLength: [Number, String] as PropType<null | number | string>,
    mode: String as PropType<TextBoxType>,
    name: String,
    onChange: Function as PropType<((e: ChangeEvent) => void)>,
    onContentReady: Function as PropType<((e: ContentReadyEvent) => void)>,
    onCopy: Function as PropType<((e: CopyEvent) => void)>,
    onCut: Function as PropType<((e: CutEvent) => void)>,
    onDisposing: Function as PropType<((e: DisposingEvent) => void)>,
    onEnterKey: Function as PropType<((e: EnterKeyEvent) => void)>,
    onFocusIn: Function as PropType<((e: FocusInEvent) => void)>,
    onFocusOut: Function as PropType<((e: FocusOutEvent) => void)>,
    onInitialized: Function as PropType<((e: InitializedEvent) => void)>,
    onInput: Function as PropType<((e: InputEvent) => void)>,
    onKeyDown: Function as PropType<((e: KeyDownEvent) => void)>,
    onKeyUp: Function as PropType<((e: KeyUpEvent) => void)>,
    onOptionChanged: Function as PropType<((e: OptionChangedEvent) => void)>,
    onPaste: Function as PropType<((e: PasteEvent) => void)>,
    onValueChanged: Function as PropType<((e: ValueChangedEvent) => void)>,
    placeholder: String,
    readOnly: Boolean,
    rtlEnabled: Boolean,
    showClearButton: Boolean,
    showMaskMode: String as PropType<MaskMode>,
    spellcheck: Boolean,
    stylingMode: String as PropType<EditorStyle>,
    tabIndex: Number,
    text: String,
    useMaskedValue: Boolean,
    validationError: {},
    validationErrors: Array as PropType<Array<any> | null>,
    validationMessageMode: String as PropType<ValidationMessageMode>,
    validationMessagePosition: String as PropType<Position>,
    validationStatus: String as PropType<ValidationStatus>,
    value: String,
    valueChangeEvent: String,
    visible: Boolean,
    width: [Number, String]
  }
};

prepareConfigurationComponentConfig(DxEditorOptionsConfig);

const DxEditorOptions = defineComponent(DxEditorOptionsConfig);

(DxEditorOptions as any).$_optionName = "editorOptions";
(DxEditorOptions as any).$_expectedChildren = {
  button: { isCollectionItem: true, optionName: "buttons" },
  editorOptionsButton: { isCollectionItem: true, optionName: "buttons" }
};

const DxEditorOptionsButtonConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:location": null,
    "update:name": null,
    "update:options": null,
  },
  props: {
    location: String as PropType<TextEditorButtonLocation>,
    name: String,
    options: Object as PropType<dxButtonOptions | Record<string, any>>
  }
};

prepareConfigurationComponentConfig(DxEditorOptionsButtonConfig);

const DxEditorOptionsButton = defineComponent(DxEditorOptionsButtonConfig);

(DxEditorOptionsButton as any).$_optionName = "buttons";
(DxEditorOptionsButton as any).$_isCollectionItem = true;
(DxEditorOptionsButton as any).$_expectedChildren = {
  options: { isCollectionItem: false, optionName: "options" }
};

const DxEmailRuleConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:ignoreEmptyValue": null,
    "update:message": null,
    "update:type": null,
  },
  props: {
    ignoreEmptyValue: Boolean,
    message: String,
    type: String as PropType<ValidationRuleType>
  }
};

prepareConfigurationComponentConfig(DxEmailRuleConfig);

const DxEmailRule = defineComponent(DxEmailRuleConfig);

(DxEmailRule as any).$_optionName = "validationRules";
(DxEmailRule as any).$_isCollectionItem = true;
(DxEmailRule as any).$_predefinedProps = {
  type: "email"
};

const DxFormatConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:calendar": null,
    "update:currency": null,
    "update:formatter": null,
    "update:parser": null,
    "update:precision": null,
    "update:type": null,
    "update:useCurrencyAccountingStyle": null,
  },
  props: {
    calendar: String as PropType<"gregorian" | "persian" | "hijri" | "hijri-umalqura">,
    currency: String,
    formatter: Function as PropType<((value: number | Date) => string)>,
    parser: Function as PropType<((value: string) => number | Date)>,
    precision: Number,
    type: String as PropType<CommonFormat | string>,
    useCurrencyAccountingStyle: Boolean
  }
};

prepareConfigurationComponentConfig(DxFormatConfig);

const DxFormat = defineComponent(DxFormatConfig);

(DxFormat as any).$_optionName = "format";

const DxFormItemConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:aiOptions": null,
    "update:colSpan": null,
    "update:cssClass": null,
    "update:dataField": null,
    "update:editorOptions": null,
    "update:editorType": null,
    "update:helpText": null,
    "update:isRequired": null,
    "update:itemType": null,
    "update:label": null,
    "update:name": null,
    "update:template": null,
    "update:validationRules": null,
    "update:visible": null,
    "update:visibleIndex": null,
  },
  props: {
    aiOptions: Object as PropType<Record<string, any>>,
    colSpan: Number,
    cssClass: String,
    dataField: String,
    editorOptions: {},
    editorType: String as PropType<FormItemComponent>,
    helpText: String,
    isRequired: Boolean,
    itemType: String as PropType<FormItemType>,
    label: Object as PropType<Record<string, any>>,
    name: String,
    template: {},
    validationRules: Array as PropType<Array<CommonTypes.ValidationRule>>,
    visible: Boolean,
    visibleIndex: Number
  }
};

prepareConfigurationComponentConfig(DxFormItemConfig);

const DxFormItem = defineComponent(DxFormItemConfig);

(DxFormItem as any).$_optionName = "formItem";
(DxFormItem as any).$_expectedChildren = {
  aiOptions: { isCollectionItem: false, optionName: "aiOptions" },
  AsyncRule: { isCollectionItem: true, optionName: "validationRules" },
  CompareRule: { isCollectionItem: true, optionName: "validationRules" },
  CustomRule: { isCollectionItem: true, optionName: "validationRules" },
  EmailRule: { isCollectionItem: true, optionName: "validationRules" },
  label: { isCollectionItem: false, optionName: "label" },
  NumericRule: { isCollectionItem: true, optionName: "validationRules" },
  PatternRule: { isCollectionItem: true, optionName: "validationRules" },
  RangeRule: { isCollectionItem: true, optionName: "validationRules" },
  RequiredRule: { isCollectionItem: true, optionName: "validationRules" },
  StringLengthRule: { isCollectionItem: true, optionName: "validationRules" },
  validationRule: { isCollectionItem: true, optionName: "validationRules" }
};

const DxHeaderFilterConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:allowSearch": null,
    "update:allowSelectAll": null,
    "update:dataSource": null,
    "update:groupInterval": null,
    "update:height": null,
    "update:search": null,
    "update:searchMode": null,
    "update:width": null,
  },
  props: {
    allowSearch: Boolean,
    allowSelectAll: Boolean,
    dataSource: [Array, Object, Function] as PropType<Array<any> | DataSourceOptions | (((options: { component: Record<string, any>, dataSource: DataSourceOptions | null }) => void)) | null | Store | Record<string, any>>,
    groupInterval: [Array, String, Number] as PropType<(Array<number | string>) | HeaderFilterGroupInterval | number>,
    height: [Number, String],
    search: Object as PropType<ColumnHeaderFilterSearchConfig | HeaderFilterSearchConfig | Record<string, any>>,
    searchMode: String as PropType<SearchMode>,
    width: [Number, String]
  }
};

prepareConfigurationComponentConfig(DxHeaderFilterConfig);

const DxHeaderFilter = defineComponent(DxHeaderFilterConfig);

(DxHeaderFilter as any).$_optionName = "headerFilter";
(DxHeaderFilter as any).$_expectedChildren = {
  search: { isCollectionItem: false, optionName: "search" }
};

const DxLabelConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:alignment": null,
    "update:location": null,
    "update:showColon": null,
    "update:template": null,
    "update:text": null,
    "update:visible": null,
  },
  props: {
    alignment: String as PropType<HorizontalAlignment>,
    location: String as PropType<LabelLocation>,
    showColon: Boolean,
    template: {},
    text: String,
    visible: Boolean
  }
};

prepareConfigurationComponentConfig(DxLabelConfig);

const DxLabel = defineComponent(DxLabelConfig);

(DxLabel as any).$_optionName = "label";

const DxLookupConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:allowClearing": null,
    "update:calculateCellValue": null,
    "update:dataSource": null,
    "update:displayExpr": null,
    "update:valueExpr": null,
  },
  props: {
    allowClearing: Boolean,
    calculateCellValue: Function as PropType<((rowData: any) => any)>,
    dataSource: [Array, Object, Function] as PropType<Array<any> | DataSourceOptions | (((options: { data: Record<string, any>, key: any }) => Array<any> | Store | DataSourceOptions)) | null | Store | Record<string, any>>,
    displayExpr: [Function, String] as PropType<(((data: any) => string)) | string>,
    valueExpr: String
  }
};

prepareConfigurationComponentConfig(DxLookupConfig);

const DxLookup = defineComponent(DxLookupConfig);

(DxLookup as any).$_optionName = "lookup";

const DxNumericRuleConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:ignoreEmptyValue": null,
    "update:message": null,
    "update:type": null,
  },
  props: {
    ignoreEmptyValue: Boolean,
    message: String,
    type: String as PropType<ValidationRuleType>
  }
};

prepareConfigurationComponentConfig(DxNumericRuleConfig);

const DxNumericRule = defineComponent(DxNumericRuleConfig);

(DxNumericRule as any).$_optionName = "validationRules";
(DxNumericRule as any).$_isCollectionItem = true;
(DxNumericRule as any).$_predefinedProps = {
  type: "numeric"
};

const DxOptionsConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:accessKey": null,
    "update:activeStateEnabled": null,
    "update:disabled": null,
    "update:elementAttr": null,
    "update:focusStateEnabled": null,
    "update:height": null,
    "update:hint": null,
    "update:hoverStateEnabled": null,
    "update:icon": null,
    "update:onClick": null,
    "update:onContentReady": null,
    "update:onDisposing": null,
    "update:onInitialized": null,
    "update:onOptionChanged": null,
    "update:rtlEnabled": null,
    "update:stylingMode": null,
    "update:tabIndex": null,
    "update:template": null,
    "update:text": null,
    "update:type": null,
    "update:useSubmitBehavior": null,
    "update:validationGroup": null,
    "update:visible": null,
    "update:width": null,
  },
  props: {
    accessKey: String,
    activeStateEnabled: Boolean,
    disabled: Boolean,
    elementAttr: Object as PropType<Record<string, any>>,
    focusStateEnabled: Boolean,
    height: [Number, String],
    hint: String,
    hoverStateEnabled: Boolean,
    icon: String,
    onClick: Function as PropType<((e: ClickEvent) => void)>,
    onContentReady: Function as PropType<((e: ButtonContentReadyEvent) => void)>,
    onDisposing: Function as PropType<((e: ButtonDisposingEvent) => void)>,
    onInitialized: Function as PropType<((e: ButtonInitializedEvent) => void)>,
    onOptionChanged: Function as PropType<((e: ButtonOptionChangedEvent) => void)>,
    rtlEnabled: Boolean,
    stylingMode: String as PropType<ButtonStyle>,
    tabIndex: Number,
    template: {},
    text: String,
    type: String as PropType<ButtonType | string>,
    useSubmitBehavior: Boolean,
    validationGroup: String,
    visible: Boolean,
    width: [Number, String]
  }
};

prepareConfigurationComponentConfig(DxOptionsConfig);

const DxOptions = defineComponent(DxOptionsConfig);

(DxOptions as any).$_optionName = "options";

const DxPatternRuleConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:ignoreEmptyValue": null,
    "update:message": null,
    "update:pattern": null,
    "update:type": null,
  },
  props: {
    ignoreEmptyValue: Boolean,
    message: String,
    pattern: [RegExp, String],
    type: String as PropType<ValidationRuleType>
  }
};

prepareConfigurationComponentConfig(DxPatternRuleConfig);

const DxPatternRule = defineComponent(DxPatternRuleConfig);

(DxPatternRule as any).$_optionName = "validationRules";
(DxPatternRule as any).$_isCollectionItem = true;
(DxPatternRule as any).$_predefinedProps = {
  type: "pattern"
};

const DxRangeRuleConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:ignoreEmptyValue": null,
    "update:max": null,
    "update:message": null,
    "update:min": null,
    "update:reevaluate": null,
    "update:type": null,
  },
  props: {
    ignoreEmptyValue: Boolean,
    max: [Date, Number, String],
    message: String,
    min: [Date, Number, String],
    reevaluate: Boolean,
    type: String as PropType<ValidationRuleType>
  }
};

prepareConfigurationComponentConfig(DxRangeRuleConfig);

const DxRangeRule = defineComponent(DxRangeRuleConfig);

(DxRangeRule as any).$_optionName = "validationRules";
(DxRangeRule as any).$_isCollectionItem = true;
(DxRangeRule as any).$_predefinedProps = {
  type: "range"
};

const DxRequiredRuleConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:message": null,
    "update:trim": null,
    "update:type": null,
  },
  props: {
    message: String,
    trim: Boolean,
    type: String as PropType<ValidationRuleType>
  }
};

prepareConfigurationComponentConfig(DxRequiredRuleConfig);

const DxRequiredRule = defineComponent(DxRequiredRuleConfig);

(DxRequiredRule as any).$_optionName = "validationRules";
(DxRequiredRule as any).$_isCollectionItem = true;
(DxRequiredRule as any).$_predefinedProps = {
  type: "required"
};

const DxSearchConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:editorOptions": null,
    "update:enabled": null,
    "update:mode": null,
    "update:searchExpr": null,
    "update:timeout": null,
  },
  props: {
    editorOptions: {},
    enabled: Boolean,
    mode: String as PropType<SearchMode>,
    searchExpr: [Array, Function, String] as PropType<(Array<(() => any) | string>) | ((() => any)) | string>,
    timeout: Number
  }
};

prepareConfigurationComponentConfig(DxSearchConfig);

const DxSearch = defineComponent(DxSearchConfig);

(DxSearch as any).$_optionName = "search";

const DxStringLengthRuleConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:ignoreEmptyValue": null,
    "update:max": null,
    "update:message": null,
    "update:min": null,
    "update:trim": null,
    "update:type": null,
  },
  props: {
    ignoreEmptyValue: Boolean,
    max: Number,
    message: String,
    min: Number,
    trim: Boolean,
    type: String as PropType<ValidationRuleType>
  }
};

prepareConfigurationComponentConfig(DxStringLengthRuleConfig);

const DxStringLengthRule = defineComponent(DxStringLengthRuleConfig);

(DxStringLengthRule as any).$_optionName = "validationRules";
(DxStringLengthRule as any).$_isCollectionItem = true;
(DxStringLengthRule as any).$_predefinedProps = {
  type: "stringLength"
};

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

const DxValidationRuleConfig = {
  emits: {
    "update:isActive": null,
    "update:hoveredElement": null,
    "update:comparisonTarget": null,
    "update:comparisonType": null,
    "update:ignoreEmptyValue": null,
    "update:max": null,
    "update:message": null,
    "update:min": null,
    "update:pattern": null,
    "update:reevaluate": null,
    "update:trim": null,
    "update:type": null,
    "update:validationCallback": null,
  },
  props: {
    comparisonTarget: Function as PropType<(() => any)>,
    comparisonType: String as PropType<ComparisonOperator>,
    ignoreEmptyValue: Boolean,
    max: [Date, Number, String],
    message: String,
    min: [Date, Number, String],
    pattern: [RegExp, String],
    reevaluate: Boolean,
    trim: Boolean,
    type: String as PropType<ValidationRuleType>,
    validationCallback: Function as PropType<((options: { column: Record<string, any>, data: Record<string, any>, formItem: Record<string, any>, rule: Record<string, any>, validator: Record<string, any>, value: any }) => boolean)>
  }
};

prepareConfigurationComponentConfig(DxValidationRuleConfig);

const DxValidationRule = defineComponent(DxValidationRuleConfig);

(DxValidationRule as any).$_optionName = "validationRules";
(DxValidationRule as any).$_isCollectionItem = true;
(DxValidationRule as any).$_predefinedProps = {
  type: "required"
};

export default DxGanttMultiCalendar;
export {
  DxGanttMultiCalendar,
  DxAI,
  DxAIOptions,
  DxAsyncRule,
  DxButton,
  DxColumn,
  DxColumnButton,
  DxCompareRule,
  DxCustomRule,
  DxDependencies,
  DxEditing,
  DxEditorOptions,
  DxEditorOptionsButton,
  DxEmailRule,
  DxFormat,
  DxFormItem,
  DxHeaderFilter,
  DxLabel,
  DxLookup,
  DxNumericRule,
  DxOptions,
  DxPatternRule,
  DxRangeRule,
  DxRequiredRule,
  DxSearch,
  DxStringLengthRule,
  DxTasks,
  DxValidationRule
};
import type * as DxGanttMultiCalendarTypes from "devextreme/ui/gantt_multi_calendar_types";
export { DxGanttMultiCalendarTypes };
