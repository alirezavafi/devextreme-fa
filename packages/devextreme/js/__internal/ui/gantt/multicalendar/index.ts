/**
 * Public entry point for the calendar-aware Gantt (`dxGanttMultiCalendar`).
 *
 * Importing this module registers the `dxGanttMultiCalendar` component (jQuery
 * plugin + `new GanttMultiCalendar(element, options)`), and re-exports the
 * option/event types consumers need. The standalone, framework-light
 * {@link GanttTimeline} is also exported for embedding without the widget shell.
 */

import GanttMultiCalendar from './widget';

export type {
  GanttDependenciesOption,
  GanttTasksOption,
} from './data_adapter';
export type { NewDependency, TaskEdge } from './dependency_draw';
export type { GanttScaleType } from './scale_model';
export type { DependencyType, GanttDependencyInput, GanttTaskInput } from './task_layout';
export type { GanttTimelineOptions } from './timeline';
export { GanttTimeline } from './timeline';
export type {
  GanttEditingOptions,
  GanttMultiCalendarProperties,
} from './widget';
export type { CalendarType } from '@ts/core/localization/calendar';

export { GanttMultiCalendar };
export default GanttMultiCalendar;
