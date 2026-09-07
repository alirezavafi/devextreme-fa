/**
 * Pure data mapping between the public `dxGanttMultiCalendar` option shapes and
 * the internal layout inputs. Kept DOM-free and framework-free so it can be
 * unit-tested in isolation; the widget shell consumes these helpers.
 */

import type { CalendarType } from '@ts/core/localization/calendar';
import { getCalendarDefaultDateFormat } from '@ts/core/localization/calendar';

import type { GanttScaleType } from './scale_model';
import type {
  DependencyType, GanttDependencyInput, GanttTaskInput,
} from './task_layout';

export interface GanttTasksOption {
  dataSource?: Record<string, unknown>[];
  keyExpr?: string;
  parentIdExpr?: string;
  titleExpr?: string;
  startExpr?: string;
  endExpr?: string;
  progressExpr?: string;
  colorExpr?: string;
}

export interface GanttDependenciesOption {
  dataSource?: Record<string, unknown>[];
  keyExpr?: string;
  predecessorIdExpr?: string;
  successorIdExpr?: string;
  typeExpr?: string;
}

export interface ResolvedTaskExprs {
  keyExpr: string;
  parentIdExpr: string;
  titleExpr: string;
  startExpr: string;
  endExpr: string;
  progressExpr: string;
  colorExpr: string;
}

export interface ResolvedDependencyExprs {
  keyExpr: string;
  predecessorIdExpr: string;
  successorIdExpr: string;
  typeExpr: string;
}

export interface GanttColumn {
  dataField: string;
  caption: string;
  dataType?: 'string' | 'date' | 'number' | 'object';
  /** Display format; date columns carry `{ type, calendar }` for non-Gregorian calendars. */
  format?: unknown;
  /** Editor options forwarded to the inline cell editor (e.g. `{ calendar }`). */
  editorOptions?: Record<string, unknown>;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const TASK_DEFAULTS: ResolvedTaskExprs = {
  keyExpr: 'id',
  parentIdExpr: 'parentId',
  titleExpr: 'title',
  startExpr: 'start',
  endExpr: 'end',
  progressExpr: 'progress',
  colorExpr: 'color',
};

const DEPENDENCY_DEFAULTS: ResolvedDependencyExprs = {
  keyExpr: 'id',
  predecessorIdExpr: 'predecessorId',
  successorIdExpr: 'successorId',
  typeExpr: 'type',
};

export function resolveTaskExprs(option: GanttTasksOption | undefined): ResolvedTaskExprs {
  return {
    keyExpr: option?.keyExpr ?? TASK_DEFAULTS.keyExpr,
    parentIdExpr: option?.parentIdExpr ?? TASK_DEFAULTS.parentIdExpr,
    titleExpr: option?.titleExpr ?? TASK_DEFAULTS.titleExpr,
    startExpr: option?.startExpr ?? TASK_DEFAULTS.startExpr,
    endExpr: option?.endExpr ?? TASK_DEFAULTS.endExpr,
    progressExpr: option?.progressExpr ?? TASK_DEFAULTS.progressExpr,
    colorExpr: option?.colorExpr ?? TASK_DEFAULTS.colorExpr,
  };
}

export function resolveDependencyExprs(
  option: GanttDependenciesOption | undefined,
): ResolvedDependencyExprs {
  return {
    keyExpr: option?.keyExpr ?? DEPENDENCY_DEFAULTS.keyExpr,
    predecessorIdExpr: option?.predecessorIdExpr ?? DEPENDENCY_DEFAULTS.predecessorIdExpr,
    successorIdExpr: option?.successorIdExpr ?? DEPENDENCY_DEFAULTS.successorIdExpr,
    typeExpr: option?.typeExpr ?? DEPENDENCY_DEFAULTS.typeExpr,
  };
}

function toDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }
  return new Date(value as string | number);
}

function toNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

/** Maps the raw task data array into the layout's task input shape. */
export function mapTasks(
  data: Record<string, unknown>[] | undefined,
  exprs: ResolvedTaskExprs,
): GanttTaskInput[] {
  if (!data) {
    return [];
  }
  return data.map((row) => ({
    id: row[exprs.keyExpr] as string | number,
    parentId: (row[exprs.parentIdExpr] ?? null) as string | number | null,
    title: (row[exprs.titleExpr] ?? '') as string,
    start: toDate(row[exprs.startExpr]),
    end: toDate(row[exprs.endExpr]),
    progress: toNumber(row[exprs.progressExpr]),
    color: row[exprs.colorExpr] as string | undefined,
  }));
}

/** Maps the raw dependency data array into the layout's dependency shape. */
export function mapDependencies(
  data: Record<string, unknown>[] | undefined,
  exprs: ResolvedDependencyExprs,
): GanttDependencyInput[] {
  if (!data) {
    return [];
  }
  return data.map((row) => ({
    id: row[exprs.keyExpr] as string | number,
    predecessorId: row[exprs.predecessorIdExpr] as string | number,
    successorId: row[exprs.successorIdExpr] as string | number,
    type: (toNumber(row[exprs.typeExpr]) as DependencyType),
  }));
}

/**
 * Default TreeList columns derived from the task field mapping. Date columns are
 * rendered (and edited) in the selected calendar by attaching a
 * `{ type, calendar }` format and matching editor options; the Gregorian path is
 * left unchanged (no explicit format, locale default applies).
 */
export function getDefaultColumns(
  exprs: ResolvedTaskExprs,
  calendar?: CalendarType,
): GanttColumn[] {
  const isCustomCalendar = !!calendar && calendar !== 'gregorian';
  // Use the calendar's own preferred pattern (e.g. Persian/Hijri => 'yyyy/MM/dd')
  // so dates read naturally for that calendar, falling back to the locale short
  // date. The Gregorian path stays unchanged (no explicit format).
  const calendarPattern = isCustomCalendar
    ? (getCalendarDefaultDateFormat(calendar) ?? 'shortDate')
    : undefined;
  const dateFormat = isCustomCalendar ? { type: calendarPattern, calendar } : undefined;
  const dateEditorOptions = isCustomCalendar ? { calendar } : undefined;

  return [
    { dataField: exprs.titleExpr, caption: 'Task', dataType: 'string' },
    {
      dataField: exprs.startExpr,
      caption: 'Start',
      dataType: 'date',
      format: dateFormat,
      editorOptions: dateEditorOptions,
    },
    {
      dataField: exprs.endExpr,
      caption: 'End',
      dataType: 'date',
      format: dateFormat,
      editorOptions: dateEditorOptions,
    },
  ];
}

/**
 * Resolves the timeline [start, end) range from the tasks (padded by a day) or
 * from explicit overrides. Returns a 30-day window around "now" when empty.
 */
export function deriveRange(
  tasks: GanttTaskInput[],
  explicit: { startDate?: Date; endDate?: Date } = {},
): { startDate: Date; endDate: Date } {
  if (explicit.startDate && explicit.endDate) {
    return { startDate: explicit.startDate, endDate: explicit.endDate };
  }
  if (!tasks.length) {
    const now = new Date();
    return {
      startDate: explicit.startDate ?? now,
      endDate: explicit.endDate ?? new Date(now.getTime() + 30 * MS_PER_DAY),
    };
  }

  let min = tasks[0].start.getTime();
  let max = tasks[0].end.getTime();
  tasks.forEach((task) => {
    min = Math.min(min, task.start.getTime());
    max = Math.max(max, task.end.getTime());
  });

  return {
    startDate: explicit.startDate ?? new Date(min - MS_PER_DAY),
    endDate: explicit.endDate ?? new Date(max + MS_PER_DAY),
  };
}

export type { GanttScaleType };

/**
 * Removes the dependency row whose key matches `id` from `dataSource` (mutates
 * the array) and returns the removed row, or `null` when not found.
 */
export function removeDependencyRow(
  dataSource: Record<string, unknown>[] | undefined,
  keyExpr: string,
  id: string | number,
): Record<string, unknown> | null {
  if (!dataSource) {
    return null;
  }
  const index = dataSource.findIndex((row) => String(row[keyExpr]) === String(id));
  if (index === -1) {
    return null;
  }
  const [removed] = dataSource.splice(index, 1);
  return removed;
}
