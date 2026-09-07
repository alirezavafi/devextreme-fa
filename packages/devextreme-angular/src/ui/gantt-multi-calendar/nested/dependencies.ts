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
    selector: 'dxo-gantt-multi-calendar-dependencies',
    template: '',
    styles: [''],
    imports: [ DxIntegrationModule ],
    providers: [NestedOptionHost]
})
export class DxoGanttMultiCalendarDependenciesComponent extends NestedOption implements OnDestroy, OnInit  {
    @Input()
    get dataSource(): Array<any> | DataSource | DataSourceOptions | null | Store | string {
        return this._getOption('dataSource');
    }
    set dataSource(value: Array<any> | DataSource | DataSourceOptions | null | Store | string) {
        this._setOption('dataSource', value);
    }

    @Input()
    get keyExpr(): string {
        return this._getOption('keyExpr');
    }
    set keyExpr(value: string) {
        this._setOption('keyExpr', value);
    }

    @Input()
    get predecessorIdExpr(): string {
        return this._getOption('predecessorIdExpr');
    }
    set predecessorIdExpr(value: string) {
        this._setOption('predecessorIdExpr', value);
    }

    @Input()
    get successorIdExpr(): string {
        return this._getOption('successorIdExpr');
    }
    set successorIdExpr(value: string) {
        this._setOption('successorIdExpr', value);
    }

    @Input()
    get typeExpr(): string {
        return this._getOption('typeExpr');
    }
    set typeExpr(value: string) {
        this._setOption('typeExpr', value);
    }


    protected get _optionPath() {
        return 'dependencies';
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
    DxoGanttMultiCalendarDependenciesComponent
  ],
  exports: [
    DxoGanttMultiCalendarDependenciesComponent
  ],
})
export class DxoGanttMultiCalendarDependenciesModule { }
