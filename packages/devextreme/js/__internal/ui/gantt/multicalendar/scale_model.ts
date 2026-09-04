/* eslint-disable spellcheck/spell-checker */
/**
 * Calendar-aware Gantt timeline scale model.
 *
 * This is the piece the closed `devexpress-gantt` engine does not expose: a
 * pure, dependency-light builder that turns a date range + a scale type into
 * two tiers of equal-width header cells whose *boundaries and labels* are
 * computed in the selected civil calendar (Gregorian, Persian/Jalali,
 * Hijri/Islamic, or any custom calendar registered through the DevExtreme
 * calendar abstraction).
 *
 * The stored task values stay native Gregorian `Date`s; the calendar only
 * affects how the scale is divided (month/year boundaries) and how cells are
 * labelled (day-of-month, month name, year number). Equal-width columns per
 * bottom-tier unit match the standard Gantt look and gracefully absorb the
 * variable length of calendar months.
 */

import type { CalendarType } from '@ts/core/localization/calendar';
import { getCalendar } from '@ts/core/localization/calendar';

export type GanttScaleType = 'days' | 'weeks' | 'months' | 'quarters' | 'years';

export interface ScaleTick {
  /** Inclusive start instant of the cell (local midnight at a boundary). */
  start: Date;
  /** Exclusive end instant of the cell (== start of the next cell). */
  end: Date;
  /** Display text, already localized for the active calendar. */
  text: string;
  /** Left offset in pixels from the timeline origin. */
  left: number;
  /** Width in pixels. */
  width: number;
}

export interface ScaleModelOptions {
  /** Range start. The first cell is the calendar unit containing this date. */
  startDate: Date;
  /** Range end. The last cell is the calendar unit containing this date. */
  endDate: Date;
  /** Bottom-tier unit. */
  scaleType: GanttScaleType;
  /** Calendar system; defaults to `'gregorian'`. */
  calendar?: CalendarType;
  /** Width in px allotted to each bottom-tier cell. Default 100. */
  cellWidth?: number;
  /**
   * First day of week (0 = Sunday .. 6 = Saturday) used by the `'weeks'` scale.
   * Falls back to the calendar's own preference, then Sunday.
   */
  firstDayOfWeek?: number;
  /** Locale for month names; falls back to the calendar's transliteration. */
  locale?: string;
  /** Numeral formatter (e.g. Persian digit shaping). Default `String`. */
  formatNumber?: (value: number) => string;
}

export interface ScaleModel {
  scaleType: GanttScaleType;
  calendar: CalendarType;
  /** Coarser grouping tier (e.g. months above days, years above months). */
  topTier: ScaleTick[];
  /** The scale-type tier (days / weeks / months / quarters / years). */
  bottomTier: ScaleTick[];
  /** Total timeline width in pixels (`bottomTier.length * cellWidth`). */
  totalWidth: number;
  startDate: Date;
  endDate: Date;
  /** Map a date to its horizontal pixel position on the timeline. */
  dateToPixel: (date: Date) => number;
  /** Map a horizontal pixel position back to a date. */
  pixelToDate: (pixel: number) => Date;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_CELL_WIDTH = 100;
const MONTHS_PER_QUARTER = 3;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

interface RawCell {
  start: Date;
  end: Date;
  text: string;
}

/**
 * Returns the start of the calendar month that contains `date`, then advances
 * by `monthOffset` calendar months. Uses the calendar registry so non-Gregorian
 * month boundaries are honored.
 */
function calendarMonthStart(
  calendar: CalendarType | undefined,
  date: Date,
  monthOffset: number,
): Date {
  const cal = getCalendar(calendar);
  const parts = cal.toParts(date);
  const monthsInYear = cal.getMonthsInYear(parts.year) || 12;

  // Re-derive year/month after the offset. `Math.floor` keeps `month` in
  // [0, monthsInYear) for both positive and negative totals.
  const total = parts.year * monthsInYear + parts.month + monthOffset;
  const year = Math.floor(total / monthsInYear);
  const month = total - year * monthsInYear;

  return cal.fromParts({ year, month, day: 1 });
}

function calendarYearStart(
  calendar: CalendarType | undefined,
  date: Date,
  yearOffset: number,
): Date {
  const cal = getCalendar(calendar);
  const parts = cal.toParts(date);
  return cal.fromParts({ year: parts.year + yearOffset, month: 0, day: 1 });
}

function resolveFirstDayOfWeek(options: ScaleModelOptions): number {
  if (typeof options.firstDayOfWeek === 'number') {
    return options.firstDayOfWeek;
  }
  const calendarPreference = getCalendar(options.calendar).firstDayOfWeek;
  return typeof calendarPreference === 'number' ? calendarPreference : 0;
}

function monthName(
  calendar: CalendarType | undefined,
  monthIndex: number,
  locale: string | undefined,
): string {
  const names = getCalendar(calendar).getMonthNames('abbreviated', locale);
  return names[monthIndex] ?? '';
}

function buildDayCells(options: ScaleModelOptions, fmt: (n: number) => string): RawCell[] {
  const cells: RawCell[] = [];
  let cursor = startOfDay(options.startDate);
  const limit = options.endDate.getTime();

  do {
    const next = addDays(cursor, 1);
    const { day } = getCalendar(options.calendar).toParts(cursor);
    cells.push({ start: cursor, end: next, text: fmt(day) });
    cursor = next;
  } while (cursor.getTime() < limit);

  return cells;
}

function buildWeekCells(options: ScaleModelOptions, fmt: (n: number) => string): RawCell[] {
  const firstDayOfWeek = resolveFirstDayOfWeek(options);
  const cells: RawCell[] = [];

  let cursor = startOfDay(options.startDate);
  // Align the first cell to the week boundary.
  const shift = (cursor.getDay() - firstDayOfWeek + 7) % 7;
  cursor = addDays(cursor, -shift);
  const limit = options.endDate.getTime();

  do {
    const next = addDays(cursor, 7);
    const { day } = getCalendar(options.calendar).toParts(cursor);
    cells.push({ start: cursor, end: next, text: fmt(day) });
    cursor = next;
  } while (cursor.getTime() < limit);

  return cells;
}

function buildMonthCells(options: ScaleModelOptions, locale: string | undefined): RawCell[] {
  const cells: RawCell[] = [];
  let cursor = calendarMonthStart(options.calendar, options.startDate, 0);
  const limit = options.endDate.getTime();
  let guard = 0;

  do {
    const next = calendarMonthStart(options.calendar, cursor, 1);
    const { month } = getCalendar(options.calendar).toParts(cursor);
    cells.push({ start: cursor, end: next, text: monthName(options.calendar, month, locale) });
    cursor = next;
    guard += 1;
  } while (cursor.getTime() < limit && guard < 100000);

  return cells;
}

function buildQuarterCells(options: ScaleModelOptions, fmt: (n: number) => string): RawCell[] {
  const cells: RawCell[] = [];
  // Align to the quarter boundary of the calendar month.
  const cal = getCalendar(options.calendar);
  const startParts = cal.toParts(options.startDate);
  const quarterStartMonth = startParts.month - (startParts.month % MONTHS_PER_QUARTER);
  let cursor = cal.fromParts({ year: startParts.year, month: quarterStartMonth, day: 1 });
  const limit = options.endDate.getTime();
  let guard = 0;

  do {
    const next = calendarMonthStart(options.calendar, cursor, MONTHS_PER_QUARTER);
    const { month } = cal.toParts(cursor);
    const quarter = Math.floor(month / MONTHS_PER_QUARTER) + 1;
    cells.push({ start: cursor, end: next, text: `Q${fmt(quarter)}` });
    cursor = next;
    guard += 1;
  } while (cursor.getTime() < limit && guard < 100000);

  return cells;
}

function buildYearCells(options: ScaleModelOptions, fmt: (n: number) => string): RawCell[] {
  const cells: RawCell[] = [];
  let cursor = calendarYearStart(options.calendar, options.startDate, 0);
  const limit = options.endDate.getTime();
  let guard = 0;

  do {
    const next = calendarYearStart(options.calendar, cursor, 1);
    const { year } = getCalendar(options.calendar).toParts(cursor);
    cells.push({ start: cursor, end: next, text: fmt(year) });
    cursor = next;
    guard += 1;
  } while (cursor.getTime() < limit && guard < 100000);

  return cells;
}

function buildBottomCells(
  options: ScaleModelOptions,
  fmt: (n: number) => string,
  locale: string | undefined,
): RawCell[] {
  switch (options.scaleType) {
    case 'days':
      return buildDayCells(options, fmt);
    case 'weeks':
      return buildWeekCells(options, fmt);
    case 'months':
      return buildMonthCells(options, locale);
    case 'quarters':
      return buildQuarterCells(options, fmt);
    case 'years':
      return buildYearCells(options, fmt);
    default:
      return buildDayCells(options, fmt);
  }
}

/**
 * The coarser tier groups the bottom cells. The label of a group is derived
 * from the calendar so it reads e.g. `Farvardin 1403` (Persian) above day
 * columns, or `1403` above month columns.
 */
function topTierLabel(
  scaleType: GanttScaleType,
  calendar: CalendarType | undefined,
  cellStart: Date,
  locale: string | undefined,
  fmt: (n: number) => string,
): { key: string; text: string } {
  const parts = getCalendar(calendar).toParts(cellStart);
  switch (scaleType) {
    case 'days':
    case 'weeks': {
      const key = `${parts.year}-${parts.month}`;
      return { key, text: `${monthName(calendar, parts.month, locale)} ${fmt(parts.year)}` };
    }
    case 'months':
    case 'quarters': {
      const key = `${parts.year}`;
      return { key, text: fmt(parts.year) };
    }
    case 'years':
    default: {
      const decade = Math.floor(parts.year / 10) * 10;
      return { key: `${decade}`, text: `${fmt(decade)} - ${fmt(decade + 9)}` };
    }
  }
}

function buildTopTier(
  bottom: ScaleTick[],
  options: ScaleModelOptions,
  locale: string | undefined,
  fmt: (n: number) => string,
): ScaleTick[] {
  const groups: ScaleTick[] = [];
  const { scaleType, calendar } = options;
  let currentKey: string | null = null;

  bottom.forEach((cell) => {
    const { key, text } = topTierLabel(scaleType, calendar, cell.start, locale, fmt);
    const last = groups[groups.length - 1];
    if (key !== currentKey || !last) {
      groups.push({
        start: cell.start,
        end: cell.end,
        text,
        left: cell.left,
        width: cell.width,
      });
      currentKey = key;
    } else {
      last.width += cell.width;
      last.end = cell.end;
    }
  });

  return groups;
}

/** Greatest index whose cell start is <= time, via binary search. */
function findCellIndex(cells: ScaleTick[], time: number): number {
  let lo = 0;
  let hi = cells.length - 1;
  let result = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (cells[mid].start.getTime() <= time) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}

/**
 * Builds the timeline scale model for the given range, scale type and calendar.
 * All cells share `cellWidth`; positions interpolate linearly *within* a cell by
 * time, which keeps date<->pixel mapping accurate even for variable-length
 * calendar months.
 */
export function buildScaleModel(options: ScaleModelOptions): ScaleModel {
  const calendar = options.calendar ?? 'gregorian';
  const cellWidth = options.cellWidth ?? DEFAULT_CELL_WIDTH;
  const fmt = options.formatNumber ?? ((n: number): string => String(n));
  const { locale } = options;

  const normalized: ScaleModelOptions = { ...options, calendar };
  const rawCells = buildBottomCells(normalized, fmt, locale);

  const bottomTier: ScaleTick[] = rawCells.map((cell, index) => ({
    start: cell.start,
    end: cell.end,
    text: cell.text,
    left: index * cellWidth,
    width: cellWidth,
  }));

  const totalWidth = bottomTier.length * cellWidth;
  const topTier = buildTopTier(bottomTier, normalized, locale, fmt);

  const firstStart = bottomTier[0]?.start ?? startOfDay(options.startDate);
  const lastEnd = bottomTier[bottomTier.length - 1]?.end ?? addDays(firstStart, 1);

  const dateToPixel = (date: Date): number => {
    const time = date.getTime();
    if (time <= firstStart.getTime()) {
      return 0;
    }
    if (time >= lastEnd.getTime()) {
      return totalWidth;
    }
    const index = findCellIndex(bottomTier, time);
    const cell = bottomTier[index];
    const span = cell.end.getTime() - cell.start.getTime();
    const fraction = span > 0 ? (time - cell.start.getTime()) / span : 0;
    return cell.left + fraction * cell.width;
  };

  const pixelToDate = (pixel: number): Date => {
    if (bottomTier.length === 0) {
      return new Date(firstStart);
    }
    const clamped = Math.max(0, Math.min(pixel, totalWidth));
    let index = Math.floor(clamped / cellWidth);
    if (index >= bottomTier.length) {
      index = bottomTier.length - 1;
    }
    const cell = bottomTier[index];
    const fraction = (clamped - cell.left) / cell.width;
    const span = cell.end.getTime() - cell.start.getTime();
    return new Date(cell.start.getTime() + fraction * span);
  };

  return {
    scaleType: options.scaleType,
    calendar,
    topTier,
    bottomTier,
    totalWidth,
    startDate: firstStart,
    endDate: lastEnd,
    dateToPixel,
    pixelToDate,
  };
}

export { MS_PER_DAY };
