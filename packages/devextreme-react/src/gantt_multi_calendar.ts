"use client"
import * as React from "react";
import { memo, forwardRef, useImperativeHandle, useRef, useMemo, ForwardedRef, Ref, ReactElement } from "react";
import dxGanttMultiCalendar, {
    Properties
} from "devextreme/ui/gantt_multi_calendar";

import { Component as BaseComponent, IHtmlOptions, ComponentRef, NestedComponentMeta } from "./core/component";
import NestedOption from "./core/nested-option";

import type { ContentReadyEvent, DependencyDeletedEvent, DependencyDeletingEvent, DependencyInsertedEvent, DisposingEvent, InitializedEvent, OptionChangedEvent, TaskUpdatedEvent } from "devextreme/ui/gantt_multi_calendar";
import type { DataType } from "devextreme/common";
import type { DataSourceOptions } from "devextreme/data/data_source";
import type { Store } from "devextreme/data/store";
import type DataSource from "devextreme/data/data_source";

type ReplaceFieldTypes<TSource, TReplacement> = {
  [P in keyof TSource]: P extends keyof TReplacement ? TReplacement[P] : TSource[P];
}

type IGanttMultiCalendarOptionsNarrowedEvents = {
  onContentReady?: ((e: ContentReadyEvent) => void);
  onDependencyDeleted?: ((e: DependencyDeletedEvent) => void);
  onDependencyDeleting?: ((e: DependencyDeletingEvent) => void);
  onDependencyInserted?: ((e: DependencyInsertedEvent) => void);
  onDisposing?: ((e: DisposingEvent) => void);
  onInitialized?: ((e: InitializedEvent) => void);
  onOptionChanged?: ((e: OptionChangedEvent) => void);
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

      const independentEvents = useMemo(() => (["onContentReady","onDependencyDeleted","onDependencyDeleting","onDependencyInserted","onDisposing","onInitialized","onOptionChanged","onTaskUpdated"]), []);

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
// GanttMultiCalendar
type IColumnProps = React.PropsWithChildren<{
  caption?: string | undefined;
  dataField?: string | undefined;
  dataType?: DataType | undefined;
  visible?: boolean;
  width?: number | string | undefined;
}>
const _componentColumn = (props: IColumnProps) => {
  return React.createElement(NestedOption<IColumnProps>, {
    ...props,
    elementDescriptor: {
      OptionName: "columns",
      IsCollectionItem: true,
    },
  });
};

const Column = Object.assign<typeof _componentColumn, NestedComponentMeta>(_componentColumn, {
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

export default GanttMultiCalendar;
export {
  GanttMultiCalendar,
  IGanttMultiCalendarOptions,
  GanttMultiCalendarRef,
  Column,
  IColumnProps,
  Dependencies,
  IDependenciesProps,
  Editing,
  IEditingProps,
  Tasks,
  ITasksProps
};
import type * as GanttMultiCalendarTypes from 'devextreme/ui/gantt_multi_calendar_types';
export { GanttMultiCalendarTypes };
