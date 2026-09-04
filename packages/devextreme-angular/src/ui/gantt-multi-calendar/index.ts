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
    SimpleChanges
} from '@angular/core';


import type { ContentReadyEvent, DependencyDeletedEvent, DependencyDeletingEvent, DependencyInsertedEvent, DisposingEvent, InitializedEvent, OptionChangedEvent, TaskUpdatedEvent, GanttMultiCalendarScaleType, GanttMultiCalendarCalendarType } from 'devextreme/ui/gantt_multi_calendar';
import type { default as DataSource, DataSourceOptions } from 'devextreme/data/data_source';
import type { Store } from 'devextreme/data/store';

import DxGanttMultiCalendar from 'devextreme/ui/gantt_multi_calendar';


import {
    DxComponent,
    DxTemplateHost,
    DxIntegrationModule,
    DxTemplateModule,
    NestedOptionHost,
    IterableDifferHelper,
    WatcherHelper,
} from 'devextreme-angular/core';


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
    get calendar(): GanttMultiCalendarCalendarType {
        return this._getOption('calendar');
    }
    set calendar(value: GanttMultiCalendarCalendarType) {
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
    get columns(): Array<any | string> {
        return this._getOption('columns');
    }
    set columns(value: Array<any | string>) {
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
     * [descr:WidgetOptions.rtlEnabled]
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
     * [descr:dxGanttMultiCalendarOptions.onContentReady]
     */
    @Output() onContentReady: EventEmitter<ContentReadyEvent>;

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
     * [descr:dxGanttMultiCalendarOptions.onDisposing]
     */
    @Output() onDisposing: EventEmitter<DisposingEvent>;

    /**
     * [descr:dxGanttMultiCalendarOptions.onInitialized]
     */
    @Output() onInitialized: EventEmitter<InitializedEvent>;

    /**
     * [descr:dxGanttMultiCalendarOptions.onOptionChanged]
     */
    @Output() onOptionChanged: EventEmitter<OptionChangedEvent>;

    /**
     * [descr:dxGanttMultiCalendarOptions.onTaskUpdated]
     */
    @Output() onTaskUpdated: EventEmitter<TaskUpdatedEvent>;

    /** @internal */
    @Output() calendarChange: EventEmitter<GanttMultiCalendarCalendarType>;
    /** @internal */
    @Output() scaleTypeChange: EventEmitter<GanttMultiCalendarScaleType>;
    /** @internal */
    @Output() selectedRowKeyChange: EventEmitter<any | undefined>;
    /** @internal */
    @Output() tasksChange: EventEmitter<any>;
    /** @internal */
    @Output() dependenciesChange: EventEmitter<any>;
    /** @internal */
    @Output() editingChange: EventEmitter<any>;

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
            { emit: 'calendarChange' },
            { emit: 'scaleTypeChange' },
            { emit: 'selectedRowKeyChange' },
            { emit: 'tasksChange' },
            { emit: 'dependenciesChange' },
            { emit: 'editingChange' }
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
    }

    ngDoCheck() {
        this._watcherHelper.checkWatchers();
        super.ngDoCheck();
        super.clearChangedOptions();
    }
}

@NgModule({
  imports: [
    DxGanttMultiCalendarComponent,
    DxIntegrationModule,
    DxTemplateModule
  ],
  exports: [
    DxGanttMultiCalendarComponent,
    DxTemplateModule
  ]
})
export class DxGanttMultiCalendarModule { }

import type * as DxGanttMultiCalendarTypes from "devextreme/ui/gantt_multi_calendar_types";
export { DxGanttMultiCalendarTypes };
