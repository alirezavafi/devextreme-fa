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





import {
    DxIntegrationModule,
    NestedOptionHost,
} from 'devextreme-angular/core';
import { NestedOption } from 'devextreme-angular/core';


@Component({
    selector: 'dxo-gantt-multi-calendar-editing',
    template: '',
    styles: [''],
    imports: [ DxIntegrationModule ],
    providers: [NestedOptionHost]
})
export class DxoGanttMultiCalendarEditingComponent extends NestedOption implements OnDestroy, OnInit  {
    @Input()
    get allowDependencyAdding(): boolean {
        return this._getOption('allowDependencyAdding');
    }
    set allowDependencyAdding(value: boolean) {
        this._setOption('allowDependencyAdding', value);
    }

    @Input()
    get allowDependencyDeleting(): boolean {
        return this._getOption('allowDependencyDeleting');
    }
    set allowDependencyDeleting(value: boolean) {
        this._setOption('allowDependencyDeleting', value);
    }

    @Input()
    get allowTaskMove(): boolean {
        return this._getOption('allowTaskMove');
    }
    set allowTaskMove(value: boolean) {
        this._setOption('allowTaskMove', value);
    }

    @Input()
    get allowTaskResize(): boolean {
        return this._getOption('allowTaskResize');
    }
    set allowTaskResize(value: boolean) {
        this._setOption('allowTaskResize', value);
    }

    @Input()
    get autoUpdateSuccessors(): boolean {
        return this._getOption('autoUpdateSuccessors');
    }
    set autoUpdateSuccessors(value: boolean) {
        this._setOption('autoUpdateSuccessors', value);
    }

    @Input()
    get enabled(): boolean {
        return this._getOption('enabled');
    }
    set enabled(value: boolean) {
        this._setOption('enabled', value);
    }


    protected get _optionPath() {
        return 'editing';
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
    DxoGanttMultiCalendarEditingComponent
  ],
  exports: [
    DxoGanttMultiCalendarEditingComponent
  ],
})
export class DxoGanttMultiCalendarEditingModule { }
