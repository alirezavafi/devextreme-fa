"use client"
import * as React from "react";
import { memo, forwardRef, useImperativeHandle, useRef, useMemo, ForwardedRef, Ref, ReactElement } from "react";
import dxGanttMultiCalendar, {
    Properties
} from "devextreme/ui/gantt_multi_calendar";

import { Component as BaseComponent, IHtmlOptions, ComponentRef, NestedComponentMeta } from "./core/component";
import NestedOption from "./core/nested-option";

import type { DependencyDeletedEvent, DependencyDeletingEvent, DependencyInsertedEvent, TaskUpdatedEvent } from "devextreme/ui/gantt_multi_calendar";
import type { AIIntegration } from "devextreme/common/ai-integration";
import type { dxTextBoxOptions, TextBoxType, ChangeEvent, ContentReadyEvent, CopyEvent, CutEvent, DisposingEvent, EnterKeyEvent, FocusInEvent, FocusOutEvent, InitializedEvent, InputEvent, KeyDownEvent, KeyUpEvent, OptionChangedEvent, PasteEvent, ValueChangedEvent } from "devextreme/ui/text_box";
import type { AIColumnMode, ColumnAIOptions, FilterOperation, FilterType, FixedPosition, ColumnHeaderFilter, SelectedFilterOperation, HeaderFilterGroupInterval, ColumnHeaderFilterSearchConfig } from "devextreme/common/grids";
import type { ValidationRuleType, template, TextEditorButtonLocation, HorizontalAlignment, DataType, Format as CommonFormat, SortOrder, ComparisonOperator, TextBoxPredefinedButton, TextEditorButton, LabelMode, MaskMode, EditorStyle, ValidationMessageMode, Position, ValidationStatus, SearchMode, ButtonStyle, ButtonType } from "devextreme/common";
import type { dxTreeListColumn, dxTreeListRowObject, TreeListPredefinedColumnButton, ColumnButtonClickEvent, dxTreeListColumnButton, TreeListCommandColumnType } from "devextreme/ui/tree_list";
import type { dxButtonOptions, ContentReadyEvent as ButtonContentReadyEvent, DisposingEvent as ButtonDisposingEvent, InitializedEvent as ButtonInitializedEvent, OptionChangedEvent as ButtonOptionChangedEvent, ClickEvent } from "devextreme/ui/button";
import type { Format as LocalizationFormat } from "devextreme/common/core/localization";
import type { dxFormSimpleItem, FormItemComponent, FormItemType, LabelLocation } from "devextreme/ui/form";
import type { DataSourceOptions } from "devextreme/data/data_source";
import type { Store } from "devextreme/data/store";

import type dxTreeList from "devextreme/ui/tree_list";
import type DataSource from "devextreme/data/data_source";
import type dxForm from "devextreme/ui/form";

import type * as CommonTypes from "devextreme/common";

type ReplaceFieldTypes<TSource, TReplacement> = {
  [P in keyof TSource]: P extends keyof TReplacement ? TReplacement[P] : TSource[P];
}

type IGanttMultiCalendarOptionsNarrowedEvents = {
  onDependencyDeleted?: ((e: DependencyDeletedEvent) => void);
  onDependencyDeleting?: ((e: DependencyDeletingEvent) => void);
  onDependencyInserted?: ((e: DependencyInsertedEvent) => void);
  onTaskUpdated?: ((e: TaskUpdatedEvent) => void);
}

type IGanttMultiCalendarOptions = React.PropsWithChildren<ReplaceFieldTypes<Properties, IGanttMultiCalendarOptionsNarrowedEvents> & IHtmlOptions>

interface GanttMultiCalendarRef {
  instance: () => dxGanttMultiCalendar;
}

const GanttMultiCalendar = memo(
  forwardRef(
    (props: React.PropsWithChildren<IGanttMultiCalendarOptions>, ref: ForwardedRef<GanttMultiCalendarRef>) => {
      const baseRef = useRef<ComponentRef>(null);

      useImperativeHandle(ref, () => (
        {
          instance() {
            return baseRef.current?.getInstance();
          }
        }
      ), []);

      const independentEvents = useMemo(() => (["onContentReady","onDependencyDeleted","onDependencyDeleting","onDependencyInserted","onDisposing","onInitialized","onTaskUpdated"]), []);

      const expectedChildren = useMemo(() => ({
        column: { optionName: "columns", isCollectionItem: true },
        dependencies: { optionName: "dependencies", isCollectionItem: false },
        editing: { optionName: "editing", isCollectionItem: false },
        tasks: { optionName: "tasks", isCollectionItem: false }
      }), []);

      return (
        React.createElement(BaseComponent<React.PropsWithChildren<IGanttMultiCalendarOptions>>, {
          WidgetClass: dxGanttMultiCalendar,
          ref: baseRef,
          independentEvents,
          expectedChildren,
          ...props,
        })
      );
    },
  ),
) as (props: React.PropsWithChildren<IGanttMultiCalendarOptions> & { ref?: Ref<GanttMultiCalendarRef> }) => ReactElement | null;


// owners:
// Column
type IAIProps = React.PropsWithChildren<{
  aiIntegration?: AIIntegration | undefined;
  editorOptions?: dxTextBoxOptions<any>;
  emptyText?: string;
  mode?: AIColumnMode;
  noDataText?: string;
  popup?: Record<string, any>;
  prompt?: string;
  showHeaderMenu?: boolean;
}>
const _componentAI = (props: IAIProps) => {
  return React.createElement(NestedOption<IAIProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "ai",
      ExpectedChildren: {
        editorOptions: { optionName: "editorOptions", isCollectionItem: false }
      },
    },
  });
};

const AI = Object.assign<typeof _componentAI, NestedComponentMeta>(_componentAI, {
  componentType: "option",
});

// owners:
// FormItem
type IAIOptionsProps = React.PropsWithChildren<{
  disabled?: boolean;
  instruction?: string | undefined;
}>
const _componentAIOptions = (props: IAIOptionsProps) => {
  return React.createElement(NestedOption<IAIOptionsProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "aiOptions",
    },
  });
};

const AIOptions = Object.assign<typeof _componentAIOptions, NestedComponentMeta>(_componentAIOptions, {
  componentType: "option",
});

// owners:
// FormItem
// Column
type IAsyncRuleProps = React.PropsWithChildren<{
  ignoreEmptyValue?: boolean;
  message?: string;
  reevaluate?: boolean;
  type?: ValidationRuleType;
  validationCallback?: ((options: { column: Record<string, any>, data: Record<string, any>, formItem: Record<string, any>, rule: Record<string, any>, validator: Record<string, any>, value: any }) => any);
}>
const _componentAsyncRule = (props: IAsyncRuleProps) => {
  return React.createElement(NestedOption<IAsyncRuleProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "validationRules",
      IsCollectionItem: true,
      PredefinedProps: {
        type: "async"
      },
    },
  });
};

const AsyncRule = Object.assign<typeof _componentAsyncRule, NestedComponentMeta>(_componentAsyncRule, {
  componentType: "option",
});

// owners:
// Column
// EditorOptions
type IButtonProps = React.PropsWithChildren<{
  cssClass?: string;
  disabled?: boolean | ((options: { column: dxTreeListColumn, component: dxTreeList, row: dxTreeListRowObject }) => boolean);
  hint?: string;
  icon?: string;
  name?: string | TreeListPredefinedColumnButton | undefined;
  onClick?: ((e: ColumnButtonClickEvent) => void);
  template?: ((cellElement: any, cellInfo: { column: dxTreeListColumn, columnIndex: number, component: dxTreeList, data: Record<string, any>, key: any, row: dxTreeListRowObject, rowIndex: number, rowType: string }) => string | any) | template;
  text?: string;
  visible?: boolean | ((options: { column: dxTreeListColumn, component: dxTreeList, row: dxTreeListRowObject }) => boolean);
  location?: TextEditorButtonLocation;
  options?: dxButtonOptions | undefined;
  render?: (...params: any) => React.ReactNode;
  component?: React.ComponentType<any>;
}>
const _componentButton = (props: IButtonProps) => {
  return React.createElement(NestedOption<IButtonProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "buttons",
      IsCollectionItem: true,
      ExpectedChildren: {
        options: { optionName: "options", isCollectionItem: false }
      },
      TemplateProps: [{
        tmplOption: "template",
        render: "render",
        component: "component"
      }],
    },
  });
};

const Button = Object.assign<typeof _componentButton, NestedComponentMeta>(_componentButton, {
  componentType: "option",
});

// owners:
// GanttMultiCalendar
type IColumnProps = React.PropsWithChildren<{
  ai?: ColumnAIOptions;
  alignment?: HorizontalAlignment | undefined;
  allowEditing?: boolean;
  allowFiltering?: boolean;
  allowFixing?: boolean;
  allowHeaderFiltering?: boolean;
  allowHiding?: boolean;
  allowReordering?: boolean;
  allowResizing?: boolean;
  allowSearch?: boolean;
  allowSorting?: boolean;
  buttons?: Array<dxTreeListColumnButton | TreeListPredefinedColumnButton>;
  calculateCellValue?: ((rowData: any) => any);
  calculateDisplayValue?: ((rowData: any) => any) | string;
  calculateFilterExpression?: ((filterValue: any, selectedFilterOperation: string | null, target: string) => string | (() => any) | Array<any>);
  calculateSortValue?: ((rowData: any) => any) | string;
  caption?: string | undefined;
  cellTemplate?: ((cellElement: any, cellInfo: { column: dxTreeListColumn, columnIndex: number, component: dxTreeList, data: Record<string, any>, displayValue: any, oldValue: any, row: dxTreeListRowObject, rowIndex: number, rowType: string, text: string, value: any, watch: (() => void) }) => any) | template;
  columns?: Array<dxTreeListColumn | string>;
  cssClass?: string | undefined;
  customizeText?: ((cellInfo: { groupInterval: string | number, target: string, value: any, valueText: string }) => string);
  dataField?: string | undefined;
  dataType?: DataType | undefined;
  editCellTemplate?: ((cellElement: any, cellInfo: { column: dxTreeListColumn, columnIndex: number, component: dxTreeList, data: Record<string, any>, displayValue: any, row: dxTreeListRowObject, rowIndex: number, rowType: string, setValue(newValue, newText): any, text: string, value: any, watch: (() => void) }) => any) | template;
  editorOptions?: any;
  encodeHtml?: boolean;
  falseText?: string;
  filterOperations?: Array<FilterOperation | string>;
  filterType?: FilterType;
  filterValue?: any | undefined;
  filterValues?: Array<any>;
  fixed?: boolean;
  fixedPosition?: FixedPosition | undefined;
  format?: LocalizationFormat;
  formItem?: dxFormSimpleItem;
  headerCellTemplate?: ((columnHeader: any, headerInfo: { column: dxTreeListColumn, columnIndex: number, component: dxTreeList }) => any) | template;
  headerFilter?: ColumnHeaderFilter | undefined;
  hidingPriority?: number | undefined;
  isBand?: boolean | undefined;
  lookup?: Record<string, any> | {
    allowClearing?: boolean;
    calculateCellValue?: ((rowData: any) => any);
    dataSource?: Array<any> | DataSourceOptions | ((options: { data: Record<string, any>, key: any }) => Array<any> | Store | DataSourceOptions) | null | Store | undefined;
    displayExpr?: ((data: any) => string) | string | undefined;
    valueExpr?: string | undefined;
  };
  minWidth?: number | undefined;
  name?: string | undefined;
  ownerBand?: number | undefined;
  renderAsync?: boolean;
  selectedFilterOperation?: SelectedFilterOperation | undefined;
  setCellValue?: ((newData: any, value: any, currentRowData: any) => any);
  showEditorAlways?: boolean;
  showInColumnChooser?: boolean;
  sortIndex?: number | undefined;
  sortingMethod?: ((value1: any, value2: any) => number) | undefined;
  sortOrder?: SortOrder | undefined;
  trueText?: string;
  type?: TreeListCommandColumnType;
  validationRules?: Array<CommonTypes.ValidationRule>;
  visible?: boolean;
  visibleIndex?: number | undefined;
  width?: number | string | undefined;
  defaultFilterValue?: any | undefined;
  onFilterValueChange?: (value: any | undefined) => void;
  defaultFilterValues?: Array<any>;
  onFilterValuesChange?: (value: Array<any>) => void;
  defaultSelectedFilterOperation?: SelectedFilterOperation | undefined;
  onSelectedFilterOperationChange?: (value: SelectedFilterOperation | undefined) => void;
  defaultSortIndex?: number | undefined;
  onSortIndexChange?: (value: number | undefined) => void;
  defaultSortOrder?: SortOrder | undefined;
  onSortOrderChange?: (value: SortOrder | undefined) => void;
  defaultVisible?: boolean;
  onVisibleChange?: (value: boolean) => void;
  defaultVisibleIndex?: number | undefined;
  onVisibleIndexChange?: (value: number | undefined) => void;
  cellRender?: (...params: any) => React.ReactNode;
  cellComponent?: React.ComponentType<any>;
  editCellRender?: (...params: any) => React.ReactNode;
  editCellComponent?: React.ComponentType<any>;
  headerCellRender?: (...params: any) => React.ReactNode;
  headerCellComponent?: React.ComponentType<any>;
}>
const _componentColumn = (props: IColumnProps) => {
  return React.createElement(NestedOption<IColumnProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "columns",
      IsCollectionItem: true,
      DefaultsProps: {
        defaultFilterValue: "filterValue",
        defaultFilterValues: "filterValues",
        defaultSelectedFilterOperation: "selectedFilterOperation",
        defaultSortIndex: "sortIndex",
        defaultSortOrder: "sortOrder",
        defaultVisible: "visible",
        defaultVisibleIndex: "visibleIndex"
      },
      ExpectedChildren: {
        ai: { optionName: "ai", isCollectionItem: false },
        AsyncRule: { optionName: "validationRules", isCollectionItem: true },
        button: { optionName: "buttons", isCollectionItem: true },
        columnButton: { optionName: "buttons", isCollectionItem: true },
        CompareRule: { optionName: "validationRules", isCollectionItem: true },
        CustomRule: { optionName: "validationRules", isCollectionItem: true },
        EmailRule: { optionName: "validationRules", isCollectionItem: true },
        format: { optionName: "format", isCollectionItem: false },
        formItem: { optionName: "formItem", isCollectionItem: false },
        headerFilter: { optionName: "headerFilter", isCollectionItem: false },
        lookup: { optionName: "lookup", isCollectionItem: false },
        NumericRule: { optionName: "validationRules", isCollectionItem: true },
        PatternRule: { optionName: "validationRules", isCollectionItem: true },
        RangeRule: { optionName: "validationRules", isCollectionItem: true },
        RequiredRule: { optionName: "validationRules", isCollectionItem: true },
        StringLengthRule: { optionName: "validationRules", isCollectionItem: true },
        validationRule: { optionName: "validationRules", isCollectionItem: true }
      },
      TemplateProps: [{
        tmplOption: "cellTemplate",
        render: "cellRender",
        component: "cellComponent"
      }, {
        tmplOption: "editCellTemplate",
        render: "editCellRender",
        component: "editCellComponent"
      }, {
        tmplOption: "headerCellTemplate",
        render: "headerCellRender",
        component: "headerCellComponent"
      }],
    },
  });
};

const Column = Object.assign<typeof _componentColumn, NestedComponentMeta>(_componentColumn, {
  componentType: "option",
});

// owners:
// Column
type IColumnButtonProps = React.PropsWithChildren<{
  cssClass?: string;
  disabled?: boolean | ((options: { column: dxTreeListColumn, component: dxTreeList, row: dxTreeListRowObject }) => boolean);
  hint?: string;
  icon?: string;
  name?: string | TreeListPredefinedColumnButton;
  onClick?: ((e: ColumnButtonClickEvent) => void);
  template?: ((cellElement: any, cellInfo: { column: dxTreeListColumn, columnIndex: number, component: dxTreeList, data: Record<string, any>, key: any, row: dxTreeListRowObject, rowIndex: number, rowType: string }) => string | any) | template;
  text?: string;
  visible?: boolean | ((options: { column: dxTreeListColumn, component: dxTreeList, row: dxTreeListRowObject }) => boolean);
  render?: (...params: any) => React.ReactNode;
  component?: React.ComponentType<any>;
}>
const _componentColumnButton = (props: IColumnButtonProps) => {
  return React.createElement(NestedOption<IColumnButtonProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "buttons",
      IsCollectionItem: true,
      TemplateProps: [{
        tmplOption: "template",
        render: "render",
        component: "component"
      }],
    },
  });
};

const ColumnButton = Object.assign<typeof _componentColumnButton, NestedComponentMeta>(_componentColumnButton, {
  componentType: "option",
});

// owners:
// FormItem
// Column
type ICompareRuleProps = React.PropsWithChildren<{
  comparisonTarget?: (() => any);
  comparisonType?: ComparisonOperator;
  ignoreEmptyValue?: boolean;
  message?: string;
  type?: ValidationRuleType;
}>
const _componentCompareRule = (props: ICompareRuleProps) => {
  return React.createElement(NestedOption<ICompareRuleProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "validationRules",
      IsCollectionItem: true,
      PredefinedProps: {
        type: "compare"
      },
    },
  });
};

const CompareRule = Object.assign<typeof _componentCompareRule, NestedComponentMeta>(_componentCompareRule, {
  componentType: "option",
});

// owners:
// FormItem
// Column
type ICustomRuleProps = React.PropsWithChildren<{
  ignoreEmptyValue?: boolean;
  message?: string;
  reevaluate?: boolean;
  type?: ValidationRuleType;
  validationCallback?: ((options: { column: Record<string, any>, data: Record<string, any>, formItem: Record<string, any>, rule: Record<string, any>, validator: Record<string, any>, value: any }) => boolean);
}>
const _componentCustomRule = (props: ICustomRuleProps) => {
  return React.createElement(NestedOption<ICustomRuleProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "validationRules",
      IsCollectionItem: true,
      PredefinedProps: {
        type: "custom"
      },
    },
  });
};

const CustomRule = Object.assign<typeof _componentCustomRule, NestedComponentMeta>(_componentCustomRule, {
  componentType: "option",
});

// owners:
// GanttMultiCalendar
type IDependenciesProps = React.PropsWithChildren<{
  dataSource?: Array<any> | DataSource | DataSourceOptions | null | Store | string;
  keyExpr?: string;
  predecessorIdExpr?: string;
  successorIdExpr?: string;
  typeExpr?: string;
}>
const _componentDependencies = (props: IDependenciesProps) => {
  return React.createElement(NestedOption<IDependenciesProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "dependencies",
    },
  });
};

const Dependencies = Object.assign<typeof _componentDependencies, NestedComponentMeta>(_componentDependencies, {
  componentType: "option",
});

// owners:
// GanttMultiCalendar
type IEditingProps = React.PropsWithChildren<{
  allowDependencyAdding?: boolean;
  allowDependencyDeleting?: boolean;
  allowTaskMove?: boolean;
  allowTaskResize?: boolean;
  autoUpdateSuccessors?: boolean;
  enabled?: boolean;
}>
const _componentEditing = (props: IEditingProps) => {
  return React.createElement(NestedOption<IEditingProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "editing",
    },
  });
};

const Editing = Object.assign<typeof _componentEditing, NestedComponentMeta>(_componentEditing, {
  componentType: "option",
});

// owners:
// AI
type IEditorOptionsProps = React.PropsWithChildren<{
  accessKey?: string | undefined;
  activeStateEnabled?: boolean;
  buttons?: Array<string | TextBoxPredefinedButton | TextEditorButton> | undefined;
  disabled?: boolean;
  elementAttr?: Record<string, any>;
  focusStateEnabled?: boolean;
  height?: number | string | undefined;
  hint?: string | undefined;
  hoverStateEnabled?: boolean;
  inputAttr?: any;
  isDirty?: boolean;
  isValid?: boolean;
  label?: string;
  labelMode?: LabelMode;
  mask?: string;
  maskChar?: string;
  maskInvalidMessage?: string;
  maskRules?: any;
  maxLength?: null | number | string;
  mode?: TextBoxType;
  name?: string;
  onChange?: ((e: ChangeEvent) => void);
  onContentReady?: ((e: ContentReadyEvent) => void);
  onCopy?: ((e: CopyEvent) => void);
  onCut?: ((e: CutEvent) => void);
  onDisposing?: ((e: DisposingEvent) => void);
  onEnterKey?: ((e: EnterKeyEvent) => void);
  onFocusIn?: ((e: FocusInEvent) => void);
  onFocusOut?: ((e: FocusOutEvent) => void);
  onInitialized?: ((e: InitializedEvent) => void);
  onInput?: ((e: InputEvent) => void);
  onKeyDown?: ((e: KeyDownEvent) => void);
  onKeyUp?: ((e: KeyUpEvent) => void);
  onOptionChanged?: ((e: OptionChangedEvent) => void);
  onPaste?: ((e: PasteEvent) => void);
  onValueChanged?: ((e: ValueChangedEvent) => void);
  placeholder?: string;
  readOnly?: boolean;
  rtlEnabled?: boolean;
  showClearButton?: boolean;
  showMaskMode?: MaskMode;
  spellcheck?: boolean;
  stylingMode?: EditorStyle;
  tabIndex?: number;
  text?: string;
  useMaskedValue?: boolean;
  validationError?: any | null;
  validationErrors?: Array<any> | null;
  validationMessageMode?: ValidationMessageMode;
  validationMessagePosition?: Position;
  validationStatus?: ValidationStatus;
  value?: string;
  valueChangeEvent?: string;
  visible?: boolean;
  width?: number | string | undefined;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}>
const _componentEditorOptions = (props: IEditorOptionsProps) => {
  return React.createElement(NestedOption<IEditorOptionsProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "editorOptions",
      DefaultsProps: {
        defaultValue: "value"
      },
      ExpectedChildren: {
        button: { optionName: "buttons", isCollectionItem: true },
        editorOptionsButton: { optionName: "buttons", isCollectionItem: true }
      },
    },
  });
};

const EditorOptions = Object.assign<typeof _componentEditorOptions, NestedComponentMeta>(_componentEditorOptions, {
  componentType: "option",
});

// owners:
// EditorOptions
type IEditorOptionsButtonProps = React.PropsWithChildren<{
  location?: TextEditorButtonLocation;
  name?: string | undefined;
  options?: dxButtonOptions | undefined;
}>
const _componentEditorOptionsButton = (props: IEditorOptionsButtonProps) => {
  return React.createElement(NestedOption<IEditorOptionsButtonProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "buttons",
      IsCollectionItem: true,
      ExpectedChildren: {
        options: { optionName: "options", isCollectionItem: false }
      },
    },
  });
};

const EditorOptionsButton = Object.assign<typeof _componentEditorOptionsButton, NestedComponentMeta>(_componentEditorOptionsButton, {
  componentType: "option",
});

// owners:
// FormItem
// Column
type IEmailRuleProps = React.PropsWithChildren<{
  ignoreEmptyValue?: boolean;
  message?: string;
  type?: ValidationRuleType;
}>
const _componentEmailRule = (props: IEmailRuleProps) => {
  return React.createElement(NestedOption<IEmailRuleProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "validationRules",
      IsCollectionItem: true,
      PredefinedProps: {
        type: "email"
      },
    },
  });
};

const EmailRule = Object.assign<typeof _componentEmailRule, NestedComponentMeta>(_componentEmailRule, {
  componentType: "option",
});

// owners:
// Column
type IFormatProps = React.PropsWithChildren<{
  calendar?: "gregorian" | "persian" | "hijri" | "hijri-umalqura";
  currency?: string;
  formatter?: ((value: number | Date) => string);
  parser?: ((value: string) => number | Date);
  precision?: number;
  type?: CommonFormat | string;
  useCurrencyAccountingStyle?: boolean;
}>
const _componentFormat = (props: IFormatProps) => {
  return React.createElement(NestedOption<IFormatProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "format",
    },
  });
};

const Format = Object.assign<typeof _componentFormat, NestedComponentMeta>(_componentFormat, {
  componentType: "option",
});

// owners:
// Column
type IFormItemProps = React.PropsWithChildren<{
  aiOptions?: Record<string, any> | {
    disabled?: boolean;
    instruction?: string | undefined;
  };
  colSpan?: number | undefined;
  cssClass?: string | undefined;
  dataField?: string | undefined;
  editorOptions?: any | undefined;
  editorType?: FormItemComponent;
  helpText?: string | undefined;
  isRequired?: boolean | undefined;
  itemType?: FormItemType;
  label?: Record<string, any> | {
    alignment?: HorizontalAlignment;
    location?: LabelLocation;
    showColon?: boolean;
    template?: ((itemData: { component: dxForm, dataField: string, editorOptions: any, editorType: string, name: string, text: string }, itemElement: any) => string | any) | template;
    text?: string | undefined;
    visible?: boolean;
  };
  name?: string | undefined;
  template?: ((data: { component: dxForm, dataField: string, editorOptions: Record<string, any>, editorType: string, name: string }, itemElement: any) => string | any) | template;
  validationRules?: Array<CommonTypes.ValidationRule>;
  visible?: boolean;
  visibleIndex?: number | undefined;
  render?: (...params: any) => React.ReactNode;
  component?: React.ComponentType<any>;
}>
const _componentFormItem = (props: IFormItemProps) => {
  return React.createElement(NestedOption<IFormItemProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "formItem",
      ExpectedChildren: {
        aiOptions: { optionName: "aiOptions", isCollectionItem: false },
        AsyncRule: { optionName: "validationRules", isCollectionItem: true },
        CompareRule: { optionName: "validationRules", isCollectionItem: true },
        CustomRule: { optionName: "validationRules", isCollectionItem: true },
        EmailRule: { optionName: "validationRules", isCollectionItem: true },
        label: { optionName: "label", isCollectionItem: false },
        NumericRule: { optionName: "validationRules", isCollectionItem: true },
        PatternRule: { optionName: "validationRules", isCollectionItem: true },
        RangeRule: { optionName: "validationRules", isCollectionItem: true },
        RequiredRule: { optionName: "validationRules", isCollectionItem: true },
        StringLengthRule: { optionName: "validationRules", isCollectionItem: true },
        validationRule: { optionName: "validationRules", isCollectionItem: true }
      },
      TemplateProps: [{
        tmplOption: "template",
        render: "render",
        component: "component"
      }],
    },
  });
};

const FormItem = Object.assign<typeof _componentFormItem, NestedComponentMeta>(_componentFormItem, {
  componentType: "option",
});

// owners:
// Column
type IHeaderFilterProps = React.PropsWithChildren<{
  allowSearch?: boolean;
  allowSelectAll?: boolean;
  dataSource?: Array<any> | DataSourceOptions | ((options: { component: Record<string, any>, dataSource: DataSourceOptions | null }) => void) | null | Store | undefined;
  groupInterval?: Array<number | string> | HeaderFilterGroupInterval | number | undefined;
  height?: number | string | undefined;
  search?: ColumnHeaderFilterSearchConfig;
  searchMode?: SearchMode;
  width?: number | string | undefined;
}>
const _componentHeaderFilter = (props: IHeaderFilterProps) => {
  return React.createElement(NestedOption<IHeaderFilterProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "headerFilter",
      ExpectedChildren: {
        search: { optionName: "search", isCollectionItem: false }
      },
    },
  });
};

const HeaderFilter = Object.assign<typeof _componentHeaderFilter, NestedComponentMeta>(_componentHeaderFilter, {
  componentType: "option",
});

// owners:
// FormItem
type ILabelProps = React.PropsWithChildren<{
  alignment?: HorizontalAlignment;
  location?: LabelLocation;
  showColon?: boolean;
  template?: ((itemData: { component: dxForm, dataField: string, editorOptions: any, editorType: string, name: string, text: string }, itemElement: any) => string | any) | template;
  text?: string | undefined;
  visible?: boolean;
  render?: (...params: any) => React.ReactNode;
  component?: React.ComponentType<any>;
}>
const _componentLabel = (props: ILabelProps) => {
  return React.createElement(NestedOption<ILabelProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "label",
      TemplateProps: [{
        tmplOption: "template",
        render: "render",
        component: "component"
      }],
    },
  });
};

const Label = Object.assign<typeof _componentLabel, NestedComponentMeta>(_componentLabel, {
  componentType: "option",
});

// owners:
// Column
type ILookupProps = React.PropsWithChildren<{
  allowClearing?: boolean;
  calculateCellValue?: ((rowData: any) => any);
  dataSource?: Array<any> | DataSourceOptions | ((options: { data: Record<string, any>, key: any }) => Array<any> | Store | DataSourceOptions) | null | Store | undefined;
  displayExpr?: ((data: any) => string) | string | undefined;
  valueExpr?: string | undefined;
}>
const _componentLookup = (props: ILookupProps) => {
  return React.createElement(NestedOption<ILookupProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "lookup",
    },
  });
};

const Lookup = Object.assign<typeof _componentLookup, NestedComponentMeta>(_componentLookup, {
  componentType: "option",
});

// owners:
// FormItem
// Column
type INumericRuleProps = React.PropsWithChildren<{
  ignoreEmptyValue?: boolean;
  message?: string;
  type?: ValidationRuleType;
}>
const _componentNumericRule = (props: INumericRuleProps) => {
  return React.createElement(NestedOption<INumericRuleProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "validationRules",
      IsCollectionItem: true,
      PredefinedProps: {
        type: "numeric"
      },
    },
  });
};

const NumericRule = Object.assign<typeof _componentNumericRule, NestedComponentMeta>(_componentNumericRule, {
  componentType: "option",
});

// owners:
// EditorOptionsButton
type IOptionsProps = React.PropsWithChildren<{
  accessKey?: string | undefined;
  activeStateEnabled?: boolean;
  disabled?: boolean;
  elementAttr?: Record<string, any>;
  focusStateEnabled?: boolean;
  height?: number | string | undefined;
  hint?: string | undefined;
  hoverStateEnabled?: boolean;
  icon?: string;
  onClick?: ((e: ClickEvent) => void) | undefined;
  onContentReady?: ((e: ButtonContentReadyEvent) => void);
  onDisposing?: ((e: ButtonDisposingEvent) => void);
  onInitialized?: ((e: ButtonInitializedEvent) => void);
  onOptionChanged?: ((e: ButtonOptionChangedEvent) => void);
  rtlEnabled?: boolean;
  stylingMode?: ButtonStyle;
  tabIndex?: number;
  template?: ((buttonData: { icon: string, text: string }, contentElement: any) => string | any) | template;
  text?: string;
  type?: ButtonType | string;
  useSubmitBehavior?: boolean;
  validationGroup?: string | undefined;
  visible?: boolean;
  width?: number | string | undefined;
  render?: (...params: any) => React.ReactNode;
  component?: React.ComponentType<any>;
}>
const _componentOptions = (props: IOptionsProps) => {
  return React.createElement(NestedOption<IOptionsProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "options",
      TemplateProps: [{
        tmplOption: "template",
        render: "render",
        component: "component"
      }],
    },
  });
};

const Options = Object.assign<typeof _componentOptions, NestedComponentMeta>(_componentOptions, {
  componentType: "option",
});

// owners:
// FormItem
// Column
type IPatternRuleProps = React.PropsWithChildren<{
  ignoreEmptyValue?: boolean;
  message?: string;
  pattern?: RegExp | string;
  type?: ValidationRuleType;
}>
const _componentPatternRule = (props: IPatternRuleProps) => {
  return React.createElement(NestedOption<IPatternRuleProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "validationRules",
      IsCollectionItem: true,
      PredefinedProps: {
        type: "pattern"
      },
    },
  });
};

const PatternRule = Object.assign<typeof _componentPatternRule, NestedComponentMeta>(_componentPatternRule, {
  componentType: "option",
});

// owners:
// FormItem
// Column
type IRangeRuleProps = React.PropsWithChildren<{
  ignoreEmptyValue?: boolean;
  max?: Date | number | string;
  message?: string;
  min?: Date | number | string;
  reevaluate?: boolean;
  type?: ValidationRuleType;
}>
const _componentRangeRule = (props: IRangeRuleProps) => {
  return React.createElement(NestedOption<IRangeRuleProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "validationRules",
      IsCollectionItem: true,
      PredefinedProps: {
        type: "range"
      },
    },
  });
};

const RangeRule = Object.assign<typeof _componentRangeRule, NestedComponentMeta>(_componentRangeRule, {
  componentType: "option",
});

// owners:
// FormItem
// Column
type IRequiredRuleProps = React.PropsWithChildren<{
  message?: string;
  trim?: boolean;
  type?: ValidationRuleType;
}>
const _componentRequiredRule = (props: IRequiredRuleProps) => {
  return React.createElement(NestedOption<IRequiredRuleProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "validationRules",
      IsCollectionItem: true,
      PredefinedProps: {
        type: "required"
      },
    },
  });
};

const RequiredRule = Object.assign<typeof _componentRequiredRule, NestedComponentMeta>(_componentRequiredRule, {
  componentType: "option",
});

// owners:
// HeaderFilter
type ISearchProps = React.PropsWithChildren<{
  editorOptions?: any;
  enabled?: boolean;
  mode?: SearchMode;
  searchExpr?: Array<(() => any) | string> | (() => any) | string | undefined;
  timeout?: number;
}>
const _componentSearch = (props: ISearchProps) => {
  return React.createElement(NestedOption<ISearchProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "search",
    },
  });
};

const Search = Object.assign<typeof _componentSearch, NestedComponentMeta>(_componentSearch, {
  componentType: "option",
});

// owners:
// FormItem
// Column
type IStringLengthRuleProps = React.PropsWithChildren<{
  ignoreEmptyValue?: boolean;
  max?: number;
  message?: string;
  min?: number;
  trim?: boolean;
  type?: ValidationRuleType;
}>
const _componentStringLengthRule = (props: IStringLengthRuleProps) => {
  return React.createElement(NestedOption<IStringLengthRuleProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "validationRules",
      IsCollectionItem: true,
      PredefinedProps: {
        type: "stringLength"
      },
    },
  });
};

const StringLengthRule = Object.assign<typeof _componentStringLengthRule, NestedComponentMeta>(_componentStringLengthRule, {
  componentType: "option",
});

// owners:
// GanttMultiCalendar
type ITasksProps = React.PropsWithChildren<{
  colorExpr?: string;
  dataSource?: Array<any> | DataSource | DataSourceOptions | null | Store | string;
  endExpr?: string;
  keyExpr?: string;
  parentIdExpr?: string;
  progressExpr?: string;
  startExpr?: string;
  titleExpr?: string;
}>
const _componentTasks = (props: ITasksProps) => {
  return React.createElement(NestedOption<ITasksProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "tasks",
    },
  });
};

const Tasks = Object.assign<typeof _componentTasks, NestedComponentMeta>(_componentTasks, {
  componentType: "option",
});

// owners:
// FormItem
// Column
type IValidationRuleProps = React.PropsWithChildren<{
  message?: string;
  trim?: boolean;
  type?: ValidationRuleType;
  ignoreEmptyValue?: boolean;
  max?: Date | number | string;
  min?: Date | number | string;
  reevaluate?: boolean;
  validationCallback?: ((options: { column: Record<string, any>, data: Record<string, any>, formItem: Record<string, any>, rule: Record<string, any>, validator: Record<string, any>, value: any }) => boolean);
  comparisonTarget?: (() => any);
  comparisonType?: ComparisonOperator;
  pattern?: RegExp | string;
}>
const _componentValidationRule = (props: IValidationRuleProps) => {
  return React.createElement(NestedOption<IValidationRuleProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "validationRules",
      IsCollectionItem: true,
      PredefinedProps: {
        type: "required"
      },
    },
  });
};

const ValidationRule = Object.assign<typeof _componentValidationRule, NestedComponentMeta>(_componentValidationRule, {
  componentType: "option",
});

export default GanttMultiCalendar;
export {
  GanttMultiCalendar,
  IGanttMultiCalendarOptions,
  GanttMultiCalendarRef,
  AI,
  IAIProps,
  AIOptions,
  IAIOptionsProps,
  AsyncRule,
  IAsyncRuleProps,
  Button,
  IButtonProps,
  Column,
  IColumnProps,
  ColumnButton,
  IColumnButtonProps,
  CompareRule,
  ICompareRuleProps,
  CustomRule,
  ICustomRuleProps,
  Dependencies,
  IDependenciesProps,
  Editing,
  IEditingProps,
  EditorOptions,
  IEditorOptionsProps,
  EditorOptionsButton,
  IEditorOptionsButtonProps,
  EmailRule,
  IEmailRuleProps,
  Format,
  IFormatProps,
  FormItem,
  IFormItemProps,
  HeaderFilter,
  IHeaderFilterProps,
  Label,
  ILabelProps,
  Lookup,
  ILookupProps,
  NumericRule,
  INumericRuleProps,
  Options,
  IOptionsProps,
  PatternRule,
  IPatternRuleProps,
  RangeRule,
  IRangeRuleProps,
  RequiredRule,
  IRequiredRuleProps,
  Search,
  ISearchProps,
  StringLengthRule,
  IStringLengthRuleProps,
  Tasks,
  ITasksProps,
  ValidationRule,
  IValidationRuleProps
};
import type * as GanttMultiCalendarTypes from 'devextreme/ui/gantt_multi_calendar_types';
export { GanttMultiCalendarTypes };

