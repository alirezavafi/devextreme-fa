/* tslint:disable:max-line-length */


import {
    Component,
    OnInit,
    OnDestroy,
    NgModule,
    Host,
    SkipSelf,
    Input
} from '@angular/core';




import type { default as DataSource, DataSourceOptions } from 'devextreme/data/data_source';
import type { Store } from 'devextreme/data/store';

import {
    DxIntegrationModule,
    NestedOptionHost,
} from 'devextreme-angular/core';
import { NestedOption } from 'devextreme-angular/core';


@Component({
    selector: 'dxo-gantt-multi-calendar-tasks',
    template: '',
    styles: [''],
    imports: [ DxIntegrationModule ],
    providers: [NestedOptionHost]
})
export class DxoGanttMultiCalendarTasksComponent extends NestedOption implements OnDestroy, OnInit  {
    @Input()
    get colorExpr(): string {
        return this._getOption('colorExpr');
    }
    set colorExpr(value: string) {
        this._setOption('colorExpr', value);
    }

    @Input()
    get dataSource(): Array<any> | DataSource | DataSourceOptions | null | Store | string {
        return this._getOption('dataSource');
    }
    set dataSource(value: Array<any> | DataSource | DataSourceOptions | null | Store | string) {
        this._setOption('dataSource', value);
    }

    @Input()
    get endExpr(): string {
        return this._getOption('endExpr');
    }
    set endExpr(value: string) {
        this._setOption('endExpr', value);
    }

    @Input()
    get keyExpr(): string {
        return this._getOption('keyExpr');
    }
    set keyExpr(value: string) {
        this._setOption('keyExpr', value);
    }

    @Input()
    get parentIdExpr(): string {
        return this._getOption('parentIdExpr');
    }
    set parentIdExpr(value: string) {
        this._setOption('parentIdExpr', value);
    }

    @Input()
    get progressExpr(): string {
        return this._getOption('progressExpr');
    }
    set progressExpr(value: string) {
        this._setOption('progressExpr', value);
    }

    @Input()
    get startExpr(): string {
        return this._getOption('startExpr');
    }
    set startExpr(value: string) {
        this._setOption('startExpr', value);
    }

    @Input()
    get titleExpr(): string {
        return this._getOption('titleExpr');
    }
    set titleExpr(value: string) {
        this._setOption('titleExpr', value);
    }


    protected get _optionPath() {
        return 'tasks';
    }


    constructor(@SkipSelf() @Host() parentOptionHost: NestedOptionHost,
            @Host() optionHost: NestedOptionHost) {
        super();
        parentOptionHost.setNestedOption(this);
        optionHost.setHost(this, this._fullOptionPath.bind(this));
    }


    ngOnInit() {
        this._addRecreatedComponent();
    }

    ngOnDestroy() {
        this._addRemovedOption(this._getOptionPath());
    }


}

@NgModule({
  imports: [
    DxoGanttMultiCalendarTasksComponent
  ],
  exports: [
    DxoGanttMultiCalendarTasksComponent
  ],
})
export class DxoGanttMultiCalendarTasksModule { }
