import type { CalendarType } from '@ts/core/localization/calendar';
import { getCalendar, getCalendarMonthNamesInActiveLocale } from '@ts/core/localization/calendar';

/**
 * Calendar-system support for the Calendar widget's month view.
 *
 * The widget keeps a Gregorian `Date` as its value/currentDate; this module
 * derives the month-grid layout, cell labels, navigation and caption in the
 * selected civil calendar (Persian, Hijri, ...). Time-of-day is irrelevant for
 * the grid and is not preserved here (navigation mirrors the Gregorian path,
 * which works on date-only values).
 *
 * `formatNumber` is injected so this module stays free of the localization/CLDR
 * import chain and is unit-testable; the default emits plain ASCII digits.
 */

export type NumberFormatter = (value: number) => string;

const DAYS_IN_WEEK = 7;
const defaultFormatNumber: NumberFormatter = (value: number): string => String(value);

/** First Gregorian date of the calendar month that contains `date`. */
export function getFirstCalendarMonthDate(date: Date, calendarType: CalendarType): Date {
  const calendar = getCalendar(calendarType);
  const { year, month } = calendar.toParts(date);
  return calendar.fromParts({ year, month, day: 1 });
}

/** Last Gregorian date of the calendar month that contains `date`. */
export function getLastCalendarMonthDate(date: Date, calendarType: CalendarType): Date {
  const calendar = getCalendar(calendarType);
  const { year, month } = calendar.toParts(date);
  const lastDay = calendar.getDaysInMonth(year, month);
  return calendar.fromParts({ year, month, day: lastDay });
}

/**
 * First visible cell of the month grid: the start of the calendar month,
 * shifted back to `firstDayOfWeek` (always at least one row of leading days,
 * matching the Gregorian month view).
 */
export function getMonthViewFirstCellData(
  date: Date,
  calendarType: CalendarType,
  firstDayOfWeek = 0,
): Date {
  const firstDay = getFirstCalendarMonthDate(date, calendarType);
  let offset = firstDayOfWeek - firstDay.getDay();

  if (offset >= 0) {
    offset -= DAYS_IN_WEEK;
  }

  firstDay.setDate(firstDay.getDate() + offset);
  return firstDay;
}

/** Whether `cellDate` belongs to a different calendar month than `date`. */
export function isOtherCalendarMonth(
  cellDate: Date,
  date: Date,
  calendarType: CalendarType,
): boolean {
  const calendar = getCalendar(calendarType);
  const cell = calendar.toParts(cellDate);
  const current = calendar.toParts(date);

  return cell.year !== current.year || cell.month !== current.month;
}

/** Cell label: the calendar day-of-month number. */
export function getCalendarCellText(
  cellDate: Date,
  calendarType: CalendarType,
  formatNumber: NumberFormatter = defaultFormatNumber,
): string {
  const calendar = getCalendar(calendarType);
  return formatNumber(calendar.toParts(cellDate).day);
}

/** Navigator caption: calendar month name + calendar year. */
export function getCalendarMonthCaption(
  date: Date,
  calendarType: CalendarType,
  formatNumber: NumberFormatter = defaultFormatNumber,
): string {
  const calendar = getCalendar(calendarType);
  const { year, month } = calendar.toParts(date);
  const monthName = getCalendarMonthNamesInActiveLocale(calendarType, 'wide')[month];

  return `${monthName} ${formatNumber(year)}`;
}

/** Adds `count` calendar months to `date`, clamping the day to the new month. */
export function addCalendarMonths(
  date: Date,
  calendarType: CalendarType,
  count: number,
): Date {
  const calendar = getCalendar(calendarType);
  const parts = calendar.toParts(date);

  const totalMonths = parts.year * 12 + parts.month + count;
  const year = Math.floor(totalMonths / 12);
  const month = ((totalMonths % 12) + 12) % 12;
  const daysInMonth = calendar.getDaysInMonth(year, month);
  const day = Math.min(parts.day, daysInMonth);

  return calendar.fromParts({ year, month, day });
}

/** Difference in calendar months between two dates (end - start). */
export function getCalendarMonthsOffset(
  startDate: Date,
  endDate: Date,
  calendarType: CalendarType,
): number {
  const calendar = getCalendar(calendarType);
  const start = calendar.toParts(startDate);
  const end = calendar.toParts(endDate);

  return (end.year - start.year) * 12 + (end.month - start.month);
}

/** Whether `date` is in the same calendar month/year as `boundaryDate`. */
export function isSameCalendarMonth(
  date: Date,
  boundaryDate: Date,
  calendarType: CalendarType,
): boolean {
  const calendar = getCalendar(calendarType);
  const a = calendar.toParts(date);
  const b = calendar.toParts(boundaryDate);

  return a.year === b.year && a.month === b.month;
}
