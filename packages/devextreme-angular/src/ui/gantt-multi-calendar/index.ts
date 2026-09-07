/* tslint:disable:max-line-length */


import {
    TransferState,
    Component,
    NgModule,
    ElementRef,
    NgZone,
    PLATFORM_ID,
    Inject,

    Input,
    Output,
    OnDestroy,
    EventEmitter,
    OnChanges,
    DoCheck,
    SimpleChanges,
    ContentChildren,
    QueryList
} from '@angular/core';


import type { dxTreeListColumn } from 'devextreme/ui/tree_list';
import type { default as DataSource, DataSourceOptions } from 'devextreme/data/data_source';
import type { Store } from 'devextreme/data/store';
import type { EventInfo } from 'devextreme/common/core/events';
import type { DependencyDeletedEvent, DependencyDeletingEvent, DependencyInsertedEvent, TaskUpdatedEvent, GanttMultiCalendarScaleType } from 'devextreme/ui/gantt_multi_calendar';

import DxGanttMultiCalendar from 'devextreme/ui/gantt_multi_calendar';


import {
    DxComponent,
    DxTemplateHost,
    DxIntegrationModule,
    DxTemplateModule,
    NestedOptionHost,
    IterableDifferHelper,
    WatcherHelper,
    CollectionNestedOption,
} from 'devextreme-angular/core';

import { DxiColumnModule } from 'devextreme-angular/ui/nested';
import { DxiButtonModule } from 'devextreme-angular/ui/nested';
import { DxoLookupModule } from 'devextreme-angular/ui/nested';
import { DxoFormatModule } from 'devextreme-angular/ui/nested';
import { DxoFormItemModule } from 'devextreme-angular/ui/nested';
import { DxoLabelModule } from 'devextreme-angular/ui/nested';
import { DxiValidationRuleModule } from 'devextreme-angular/ui/nested';
import { DxoHeaderFilterModule } from 'devextreme-angular/ui/nested';
import { DxoSearchModule } from 'devextreme-angular/ui/nested';
import { DxoDependenciesModule } from 'devextreme-angular/ui/nested';
import { DxoEditingModule } from 'devextreme-angular/ui/nested';
import { DxoTasksModule } from 'devextreme-angular/ui/nested';

import { DxoGanttMultiCalendarAIModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxoGanttMultiCalendarAIOptionsModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxiGanttMultiCalendarAsyncRuleModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxiGanttMultiCalendarButtonModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxiGanttMultiCalendarColumnModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxiGanttMultiCalendarColumnButtonModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxiGanttMultiCalendarCompareRuleModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxiGanttMultiCalendarCustomRuleModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxoGanttMultiCalendarDependenciesModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxoGanttMultiCalendarEditingModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxoGanttMultiCalendarEditorOptionsModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxiGanttMultiCalendarEditorOptionsButtonModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxiGanttMultiCalendarEmailRuleModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxoGanttMultiCalendarFormatModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxoGanttMultiCalendarFormItemModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxoGanttMultiCalendarHeaderFilterModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxoGanttMultiCalendarLabelModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxoGanttMultiCalendarLookupModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxiGanttMultiCalendarNumericRuleModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxoGanttMultiCalendarOptionsModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxiGanttMultiCalendarPatternRuleModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxiGanttMultiCalendarRangeRuleModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxiGanttMultiCalendarRequiredRuleModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxoGanttMultiCalendarSearchModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxiGanttMultiCalendarStringLengthRuleModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxoGanttMultiCalendarTasksModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { DxiGanttMultiCalendarValidationRuleModule } from 'devextreme-angular/ui/gantt-multi-calendar/nested';
import { 
           PROPERTY_TOKEN_validationRules,
           PROPERTY_TOKEN_buttons,
           PROPERTY_TOKEN_columns,
     } from 'devextreme-angular/core/tokens';


/**
 * [descr:dxGanttMultiCalendar]

 */
@Component({
    selector: 'dx-gantt-multi-calendar',
    template: '',
    host: { ngSkipHydration: 'true' },
    imports: [ DxIntegrationModule ],
    providers: [
        DxTemplateHost,
        WatcherHelper,
        NestedOptionHost,
        IterableDifferHelper
    ]
})
export class DxGanttMultiCalendarComponent extends DxComponent implements OnDestroy, OnChanges, DoCheck {

    @ContentChildren(PROPERTY_TOKEN_validationRules)
    set _validationRulesContentChildren(value: QueryList<CollectionNestedOption>) {
        this.setChildren('validationRules', value);
    }

    @ContentChildren(PROPERTY_TOKEN_buttons)
    set _buttonsContentChildren(value: QueryList<CollectionNestedOption>) {
        this.setChildren('buttons', value);
    }

    @ContentChildren(PROPERTY_TOKEN_columns)
    set _columnsContentChildren(value: QueryList<CollectionNestedOption>) {
        this.setChildren('columns', value);
    }

    instance: DxGanttMultiCalendar = null;

    /**
     * [descr:WidgetOptions.accessKey]
    
     */
    @Input()
    get accessKey(): string | undefined {
        return this._getOption('accessKey');
    }
    set accessKey(value: string | undefined) {
        this._setOption('accessKey', value);
    }


    /**
     * [descr:WidgetOptions.activeStateEnabled]
    
     */
    @Input()
    get activeStateEnabled(): boolean {
        return this._getOption('activeStateEnabled');
    }
    set activeStateEnabled(value: boolean) {
        this._setOption('activeStateEnabled', value);
    }


    /**
     * [descr:dxGanttMultiCalendarOptions.calendar]
    
     */
    @Input()
    get calendar(): "gregorian" | "persian" | "hijri" {
        return this._getOption('calendar');
    }
    set calendar(value: "gregorian" | "persian" | "hijri") {
        this._setOption('calendar', value);
    }


    /**
     * [descr:dxGanttMultiCalendarOptions.cellWidth]
    
     */
    @Input()
    get cellWidth(): number {
        return this._getOption('cellWidth');
    }
    set cellWidth(value: number) {
        this._setOption('cellWidth', value);
    }


    /**
     * [descr:dxGanttMultiCalendarOptions.columns]
    
     */
    @Input()
    get columns(): Array<dxTreeListColumn | string> {
        return this._getOption('columns');
    }
    set columns(value: Array<dxTreeListColumn | string>) {
        this._setOption('columns', value);
    }


    /**
     * [descr:dxGanttMultiCalendarOptions.dependencies]
    
     */
    @Input()
    get dependencies(): { dataSource?: Array<any> | DataSource | DataSourceOptions | null | Store | string, keyExpr?: string, predecessorIdExpr?: string, successorIdExpr?: string, typeExpr?: string } {
        return this._getOption('dependencies');
    }
    set dependencies(value: { dataSource?: Array<any> | DataSource | DataSourceOptions | null | Store | string, keyExpr?: string, predecessorIdExpr?: string, successorIdExpr?: string, typeExpr?: string }) {
        this._setOption('dependencies', value);
    }


    /**
     * [descr:WidgetOptions.disabled]
    
     */
    @Input()
    get disabled(): boolean {
        return this._getOption('disabled');
    }
    set disabled(value: boolean) {
        this._setOption('disabled', value);
    }


    /**
     * [descr:dxGanttMultiCalendarOptions.editing]
    
     */
    @Input()
    get editing(): { allowDependencyAdding?: boolean, allowDependencyDeleting?: boolean, allowTaskMove?: boolean, allowTaskResize?: boolean, autoUpdateSuccessors?: boolean, enabled?: boolean } {
        return this._getOption('editing');
    }
    set editing(value: { allowDependencyAdding?: boolean, allowDependencyDeleting?: boolean, allowTaskMove?: boolean, allowTaskResize?: boolean, autoUpdateSuccessors?: boolean, enabled?: boolean }) {
        this._setOption('editing', value);
    }


    /**
     * [descr:DOMComponentOptions.elementAttr]
    
     */
    @Input()
    get elementAttr(): Record<string, any> {
        return this._getOption('elementAttr');
    }
    set elementAttr(value: Record<string, any>) {
        this._setOption('elementAttr', value);
    }


    /**
     * [descr:dxGanttMultiCalendarOptions.endDate]
    
     */
    @Input()
    get endDate(): Date | undefined {
        return this._getOption('endDate');
    }
    set endDate(value: Date | undefined) {
        this._setOption('endDate', value);
    }


    /**
     * [descr:WidgetOptions.focusStateEnabled]
    
     */
    @Input()
    get focusStateEnabled(): boolean {
        return this._getOption('focusStateEnabled');
    }
    set focusStateEnabled(value: boolean) {
        this._setOption('focusStateEnabled', value);
    }


    /**
     * [descr:dxGanttMultiCalendarOptions.headerRowHeight]
    
     */
    @Input()
    get headerRowHeight(): number {
        return this._getOption('headerRowHeight');
    }
    set headerRowHeight(value: number) {
        this._setOption('headerRowHeight', value);
    }


    /**
     * [descr:DOMComponentOptions.height]
    
     */
    @Input()
    get height(): number | string | undefined {
        return this._getOption('height');
    }
    set height(value: number | string | undefined) {
        this._setOption('height', value);
    }


    /**
     * [descr:WidgetOptions.hint]
    
     */
    @Input()
    get hint(): string | undefined {
        return this._getOption('hint');
    }
    set hint(value: string | undefined) {
        this._setOption('hint', value);
    }


    /**
     * [descr:WidgetOptions.hoverStateEnabled]
    
     */
    @Input()
    get hoverStateEnabled(): boolean {
        return this._getOption('hoverStateEnabled');
    }
    set hoverStateEnabled(value: boolean) {
        this._setOption('hoverStateEnabled', value);
    }


    /**
     * [descr:dxGanttMultiCalendarOptions.locale]
    
     */
    @Input()
    get locale(): string | undefined {
        return this._getOption('locale');
    }
    set locale(value: string | undefined) {
        this._setOption('locale', value);
    }


    /**
     * [descr:dxGanttMultiCalendarOptions.rowHeight]
    
     */
    @Input()
    get rowHeight(): number {
        return this._getOption('rowHeight');
    }
    set rowHeight(value: number) {
        this._setOption('rowHeight', value);
    }


    /**
     * [descr:DOMComponentOptions.rtlEnabled]
    
     */
    @Input()
    get rtlEnabled(): boolean {
        return this._getOption('rtlEnabled');
    }
    set rtlEnabled(value: boolean) {
        this._setOption('rtlEnabled', value);
    }


    /**
     * [descr:dxGanttMultiCalendarOptions.scaleType]
    
     */
    @Input()
    get scaleType(): GanttMultiCalendarScaleType {
        return this._getOption('scaleType');
    }
    set scaleType(value: GanttMultiCalendarScaleType) {
        this._setOption('scaleType', value);
    }


    /**
     * [descr:dxGanttMultiCalendarOptions.selectedRowKey]
    
     */
    @Input()
    get selectedRowKey(): any | undefined {
        return this._getOption('selectedRowKey');
    }
    set selectedRowKey(value: any | undefined) {
        this._setOption('selectedRowKey', value);
    }


    /**
     * [descr:dxGanttMultiCalendarOptions.showDependencies]
    
     */
    @Input()
    get showDependencies(): boolean {
        return this._getOption('showDependencies');
    }
    set showDependencies(value: boolean) {
        this._setOption('showDependencies', value);
    }


    /**
     * [descr:dxGanttMultiCalendarOptions.startDate]
    
     */
    @Input()
    get startDate(): Date | undefined {
        return this._getOption('startDate');
    }
    set startDate(value: Date | undefined) {
        this._setOption('startDate', value);
    }


    /**
     * [descr:WidgetOptions.tabIndex]
    
     */
    @Input()
    get tabIndex(): number {
        return this._getOption('tabIndex');
    }
    set tabIndex(value: number) {
        this._setOption('tabIndex', value);
    }


    /**
     * [descr:dxGanttMultiCalendarOptions.taskListWidth]
    
     */
    @Input()
    get taskListWidth(): number {
        return this._getOption('taskListWidth');
    }
    set taskListWidth(value: number) {
        this._setOption('taskListWidth', value);
    }


    /**
     * [descr:dxGanttMultiCalendarOptions.tasks]
    
     */
    @Input()
    get tasks(): { colorExpr?: string, dataSource?: Array<any> | DataSource | DataSourceOptions | null | Store | string, endExpr?: string, keyExpr?: string, parentIdExpr?: string, progressExpr?: string, startExpr?: string, titleExpr?: string } {
        return this._getOption('tasks');
    }
    set tasks(value: { colorExpr?: string, dataSource?: Array<any> | DataSource | DataSourceOptions | null | Store | string, endExpr?: string, keyExpr?: string, parentIdExpr?: string, progressExpr?: string, startExpr?: string, titleExpr?: string }) {
        this._setOption('tasks', value);
    }


    /**
     * [descr:WidgetOptions.visible]
    
     */
    @Input()
    get visible(): boolean {
        return this._getOption('visible');
    }
    set visible(value: boolean) {
        this._setOption('visible', value);
    }


    /**
     * [descr:DOMComponentOptions.width]
    
     */
    @Input()
    get width(): number | string | undefined {
        return this._getOption('width');
    }
    set width(value: number | string | undefined) {
        this._setOption('width', value);
    }

    /**
    
     * [descr:WidgetOptions.onContentReady]
    
    
     */
    @Output() onContentReady: EventEmitter<EventInfo<any>>;

    /**
    
     * [descr:dxGanttMultiCalendarOptions.onDependencyDeleted]
    
    
     */
    @Output() onDependencyDeleted: EventEmitter<DependencyDeletedEvent>;

    /**
    
     * [descr:dxGanttMultiCalendarOptions.onDependencyDeleting]
    
    
     */
    @Output() onDependencyDeleting: EventEmitter<DependencyDeletingEvent>;

    /**
    
     * [descr:dxGanttMultiCalendarOptions.onDependencyInserted]
    
    
     */
    @Output() onDependencyInserted: EventEmitter<DependencyInsertedEvent>;

    /**
    
     * [descr:DOMComponentOptions.onDisposing]
    
    
     */
    @Output() onDisposing: EventEmitter<EventInfo<any>>;

    /**
    
     * [descr:ComponentOptions.onInitialized]
    
    
     */
    @Output() onInitialized: EventEmitter<Object>;

    /**
    
     * [descr:DOMComponentOptions.onOptionChanged]
    
    
     */
    @Output() onOptionChanged: EventEmitter<Object>;

    /**
    
     * [descr:dxGanttMultiCalendarOptions.onTaskUpdated]
    
    
     */
    @Output() onTaskUpdated: EventEmitter<TaskUpdatedEvent>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() accessKeyChange: EventEmitter<string | undefined>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() activeStateEnabledChange: EventEmitter<boolean>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() calendarChange: EventEmitter<"gregorian" | "persian" | "hijri">;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() cellWidthChange: EventEmitter<number>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() columnsChange: EventEmitter<Array<dxTreeListColumn | string>>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() dependenciesChange: EventEmitter<{ dataSource?: Array<any> | DataSource | DataSourceOptions | null | Store | string, keyExpr?: string, predecessorIdExpr?: string, successorIdExpr?: string, typeExpr?: string }>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() disabledChange: EventEmitter<boolean>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() editingChange: EventEmitter<{ allowDependencyAdding?: boolean, allowDependencyDeleting?: boolean, allowTaskMove?: boolean, allowTaskResize?: boolean, autoUpdateSuccessors?: boolean, enabled?: boolean }>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() elementAttrChange: EventEmitter<Record<string, any>>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() endDateChange: EventEmitter<Date | undefined>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() focusStateEnabledChange: EventEmitter<boolean>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() headerRowHeightChange: EventEmitter<number>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() heightChange: EventEmitter<number | string | undefined>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() hintChange: EventEmitter<string | undefined>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() hoverStateEnabledChange: EventEmitter<boolean>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() localeChange: EventEmitter<string | undefined>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() rowHeightChange: EventEmitter<number>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() rtlEnabledChange: EventEmitter<boolean>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() scaleTypeChange: EventEmitter<GanttMultiCalendarScaleType>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() selectedRowKeyChange: EventEmitter<any | undefined>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() showDependenciesChange: EventEmitter<boolean>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() startDateChange: EventEmitter<Date | undefined>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() tabIndexChange: EventEmitter<number>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() taskListWidthChange: EventEmitter<number>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() tasksChange: EventEmitter<{ colorExpr?: string, dataSource?: Array<any> | DataSource | DataSourceOptions | null | Store | string, endExpr?: string, keyExpr?: string, parentIdExpr?: string, progressExpr?: string, startExpr?: string, titleExpr?: string }>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() visibleChange: EventEmitter<boolean>;

    /**
    
     * This member supports the internal infrastructure and is not intended to be used directly from your code.
    
     */
    @Output() widthChange: EventEmitter<number | string | undefined>;




    constructor(elementRef: ElementRef, ngZone: NgZone, templateHost: DxTemplateHost,
            private _watcherHelper: WatcherHelper,
            private _idh: IterableDifferHelper,
            optionHost: NestedOptionHost,
            transferState: TransferState,
            @Inject(PLATFORM_ID) platformId: any) {

        super(elementRef, ngZone, templateHost, _watcherHelper, transferState, platformId);

        this._createEventEmitters([
            { subscribe: 'contentReady', emit: 'onContentReady' },
            { subscribe: 'dependencyDeleted', emit: 'onDependencyDeleted' },
            { subscribe: 'dependencyDeleting', emit: 'onDependencyDeleting' },
            { subscribe: 'dependencyInserted', emit: 'onDependencyInserted' },
            { subscribe: 'disposing', emit: 'onDisposing' },
            { subscribe: 'initialized', emit: 'onInitialized' },
            { subscribe: 'optionChanged', emit: 'onOptionChanged' },
            { subscribe: 'taskUpdated', emit: 'onTaskUpdated' },
            { emit: 'accessKeyChange' },
            { emit: 'activeStateEnabledChange' },
            { emit: 'calendarChange' },
            { emit: 'cellWidthChange' },
            { emit: 'columnsChange' },
            { emit: 'dependenciesChange' },
            { emit: 'disabledChange' },
            { emit: 'editingChange' },
            { emit: 'elementAttrChange' },
            { emit: 'endDateChange' },
            { emit: 'focusStateEnabledChange' },
            { emit: 'headerRowHeightChange' },
            { emit: 'heightChange' },
            { emit: 'hintChange' },
            { emit: 'hoverStateEnabledChange' },
            { emit: 'localeChange' },
            { emit: 'rowHeightChange' },
            { emit: 'rtlEnabledChange' },
            { emit: 'scaleTypeChange' },
            { emit: 'selectedRowKeyChange' },
            { emit: 'showDependenciesChange' },
            { emit: 'startDateChange' },
            { emit: 'tabIndexChange' },
            { emit: 'taskListWidthChange' },
            { emit: 'tasksChange' },
            { emit: 'visibleChange' },
            { emit: 'widthChange' }
        ]);

        this._idh.setHost(this);
        optionHost.setHost(this);
    }

    protected _createInstance(element, options) {

        return new DxGanttMultiCalendar(element, options);
    }


    ngOnDestroy() {
        this._destroyWidget();
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
        this.setupChanges('columns', changes);
    }

    setupChanges(prop: string, changes: SimpleChanges) {
        if (!(prop in this._optionsToUpdate)) {
            this._idh.setup(prop, changes);
        }
    }

    ngDoCheck() {
        this._idh.doCheck('columns');
        this._watcherHelper.checkWatchers();
        super.ngDoCheck();
        super.clearChangedOptions();
    }

    _setOption(name: string, value: any) {
        let isSetup = this._idh.setupSingle(name, value);
        let isChanged = this._idh.getChanges(name, value) !== null;

        if (isSetup || isChanged) {
            super._setOption(name, value);
        }
    }
}

@NgModule({
  imports: [
    DxGanttMultiCalendarComponent,
    DxiColumnModule,
    DxiButtonModule,
    DxoLookupModule,
    DxoFormatModule,
    DxoFormItemModule,
    DxoLabelModule,
    DxiValidationRuleModule,
    DxoHeaderFilterModule,
    DxoSearchModule,
    DxoDependenciesModule,
    DxoEditingModule,
    DxoTasksModule,
    DxoGanttMultiCalendarAIModule,
    DxoGanttMultiCalendarAIOptionsModule,
    DxiGanttMultiCalendarAsyncRuleModule,
    DxiGanttMultiCalendarButtonModule,
    DxiGanttMultiCalendarColumnModule,
    DxiGanttMultiCalendarColumnButtonModule,
    DxiGanttMultiCalendarCompareRuleModule,
    DxiGanttMultiCalendarCustomRuleModule,
    DxoGanttMultiCalendarDependenciesModule,
    DxoGanttMultiCalendarEditingModule,
    DxoGanttMultiCalendarEditorOptionsModule,
    DxiGanttMultiCalendarEditorOptionsButtonModule,
    DxiGanttMultiCalendarEmailRuleModule,
    DxoGanttMultiCalendarFormatModule,
    DxoGanttMultiCalendarFormItemModule,
    DxoGanttMultiCalendarHeaderFilterModule,
    DxoGanttMultiCalendarLabelModule,
    DxoGanttMultiCalendarLookupModule,
    DxiGanttMultiCalendarNumericRuleModule,
    DxoGanttMultiCalendarOptionsModule,
    DxiGanttMultiCalendarPatternRuleModule,
    DxiGanttMultiCalendarRangeRuleModule,
    DxiGanttMultiCalendarRequiredRuleModule,
    DxoGanttMultiCalendarSearchModule,
    DxiGanttMultiCalendarStringLengthRuleModule,
    DxoGanttMultiCalendarTasksModule,
    DxiGanttMultiCalendarValidationRuleModule,
    DxIntegrationModule,
    DxTemplateModule
  ],
  exports: [
    DxGanttMultiCalendarComponent,
    DxiColumnModule,
    DxiButtonModule,
    DxoLookupModule,
    DxoFormatModule,
    DxoFormItemModule,
    DxoLabelModule,
    DxiValidationRuleModule,
    DxoHeaderFilterModule,
    DxoSearchModule,
    DxoDependenciesModule,
    DxoEditingModule,
    DxoTasksModule,
    DxoGanttMultiCalendarAIModule,
    DxoGanttMultiCalendarAIOptionsModule,
    DxiGanttMultiCalendarAsyncRuleModule,
    DxiGanttMultiCalendarButtonModule,
    DxiGanttMultiCalendarColumnModule,
    DxiGanttMultiCalendarColumnButtonModule,
    DxiGanttMultiCalendarCompareRuleModule,
    DxiGanttMultiCalendarCustomRuleModule,
    DxoGanttMultiCalendarDependenciesModule,
    DxoGanttMultiCalendarEditingModule,
    DxoGanttMultiCalendarEditorOptionsModule,
    DxiGanttMultiCalendarEditorOptionsButtonModule,
    DxiGanttMultiCalendarEmailRuleModule,
    DxoGanttMultiCalendarFormatModule,
    DxoGanttMultiCalendarFormItemModule,
    DxoGanttMultiCalendarHeaderFilterModule,
    DxoGanttMultiCalendarLabelModule,
    DxoGanttMultiCalendarLookupModule,
    DxiGanttMultiCalendarNumericRuleModule,
    DxoGanttMultiCalendarOptionsModule,
    DxiGanttMultiCalendarPatternRuleModule,
    DxiGanttMultiCalendarRangeRuleModule,
    DxiGanttMultiCalendarRequiredRuleModule,
    DxoGanttMultiCalendarSearchModule,
    DxiGanttMultiCalendarStringLengthRuleModule,
    DxoGanttMultiCalendarTasksModule,
    DxiGanttMultiCalendarValidationRuleModule,
    DxTemplateModule
  ]
})
export class DxGanttMultiCalendarModule { }

export * from 'devextreme-angular/ui/gantt-multi-calendar/nested';

import type * as DxGanttMultiCalendarTypes from "devextreme/ui/gantt_multi_calendar_types";
export { DxGanttMultiCalendarTypes };


