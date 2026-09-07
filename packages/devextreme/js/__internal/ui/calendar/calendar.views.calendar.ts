import type { CalendarType } from '@ts/core/localization/calendar';
import { getCalendar, getCalendarMonthNamesInActiveLocale } from '@ts/core/localization/calendar';

/**
 * Calendar-system support for the Calendar widget's drill-up views
 * (year / decade / century). Mirrors the Gregorian view logic but operates on
 * the selected calendar's year/month fields.
 *
 * `formatNumber` is injected to keep this module free of the localization/CLDR
 * chain; the default emits plain ASCII digits.
 */

export type NumberFormatter = (value: number) => string;

const defaultFormatNumber: NumberFormatter = (value: number): string => String(value);

const calendarYear = (date: Date, calendarType: CalendarType): number => getCalendar(calendarType)
  .toParts(date).year;

const calendarMonth = (date: Date, calendarType: CalendarType): number => getCalendar(calendarType)
  .toParts(date).month;

export const getFirstCalendarYearInDecade = (year: number): number => (
  year - (((year % 10) + 10) % 10)
);

export const getFirstCalendarDecadeInCentury = (year: number): number => (
  year - (((year % 100) + 100) % 100)
);

/** Adds `count` calendar years to `date`, clamping the day to the new month. */
export function addCalendarYears(
  date: Date,
  calendarType: CalendarType,
  count: number,
): Date {
  const calendar = getCalendar(calendarType);
  const parts = calendar.toParts(date);
  const year = parts.year + count;
  const daysInMonth = calendar.getDaysInMonth(year, parts.month);
  const day = Math.min(parts.day, daysInMonth);

  return calendar.fromParts({ year, month: parts.month, day });
}

// --- year view (cells = months of a calendar year) ------------------------

export function getYearViewFirstCellData(date: Date, calendarType: CalendarType): Date {
  const calendar = getCalendar(calendarType);
  return calendar.fromParts({ year: calendar.toParts(date).year, month: 0, day: 1 });
}

export function getYearViewNextCellData(date: Date, calendarType: CalendarType): Date {
  const calendar = getCalendar(calendarType);
  const parts = calendar.toParts(date);
  const totalMonths = parts.year * 12 + parts.month + 1;
  return calendar.fromParts({
    year: Math.floor(totalMonths / 12),
    month: ((totalMonths % 12) + 12) % 12,
    day: 1,
  });
}

export function getYearViewCellText(
  cellDate: Date,
  calendarType: CalendarType,
): string {
  const calendar = getCalendar(calendarType);
  return getCalendarMonthNamesInActiveLocale(calendarType, 'abbreviated')[calendar.toParts(cellDate).month];
}

export function getYearViewCaption(
  date: Date,
  calendarType: CalendarType,
  formatNumber: NumberFormatter = defaultFormatNumber,
): string {
  return formatNumber(calendarYear(date, calendarType));
}

export function isSameCalendarMonthAndYear(
  a: Date,
  b: Date,
  calendarType: CalendarType,
): boolean {
  const calendar = getCalendar(calendarType);
  const pa = calendar.toParts(a);
  const pb = calendar.toParts(b);
  return pa.year === pb.year && pa.month === pb.month;
}

export function isSameCalendarYear(a: Date, b: Date, calendarType: CalendarType): boolean {
  return calendarYear(a, calendarType) === calendarYear(b, calendarType);
}

// --- decade view (cells = years of a calendar decade) ----------------------

export function getDecadeViewFirstCellData(date: Date, calendarType: CalendarType): Date {
  const calendar = getCalendar(calendarType);
  const year = getFirstCalendarYearInDecade(calendar.toParts(date).year) - 1;
  return calendar.fromParts({ year, month: 0, day: 1 });
}

export function getDecadeViewNextCellData(date: Date, calendarType: CalendarType): Date {
  const calendar = getCalendar(calendarType);
  return calendar.fromParts({ year: calendar.toParts(date).year + 1, month: 0, day: 1 });
}

export function getDecadeViewCellText(
  cellDate: Date,
  calendarType: CalendarType,
  formatNumber: NumberFormatter = defaultFormatNumber,
): string {
  return formatNumber(calendarYear(cellDate, calendarType));
}

export function getDecadeViewCaption(
  date: Date,
  calendarType: CalendarType,
  formatNumber: NumberFormatter = defaultFormatNumber,
): string {
  const first = getFirstCalendarYearInDecade(calendarYear(date, calendarType));
  return `${formatNumber(first)}-${formatNumber(first + 9)}`;
}

export function isSameCalendarDecade(a: Date, b: Date, calendarType: CalendarType): boolean {
  return getFirstCalendarYearInDecade(calendarYear(a, calendarType))
    === getFirstCalendarYearInDecade(calendarYear(b, calendarType));
}

export function isOtherCalendarDecade(
  cellDate: Date,
  date: Date,
  calendarType: CalendarType,
): boolean {
  return !isSameCalendarDecade(cellDate, date, calendarType);
}

// --- century view (cells = decades of a calendar century) ------------------

export function getCenturyViewFirstCellData(date: Date, calendarType: CalendarType): Date {
  const calendar = getCalendar(calendarType);
  const year = getFirstCalendarDecadeInCentury(calendar.toParts(date).year) - 10;
  return calendar.fromParts({ year, month: 0, day: 1 });
}

export function getCenturyViewNextCellData(date: Date, calendarType: CalendarType): Date {
  const calendar = getCalendar(calendarType);
  return calendar.fromParts({ year: calendar.toParts(date).year + 10, month: 0, day: 1 });
}

export function getCenturyViewCellText(
  cellDate: Date,
  calendarType: CalendarType,
  formatNumber: NumberFormatter = defaultFormatNumber,
): string {
  const first = getFirstCalendarYearInDecade(calendarYear(cellDate, calendarType));
  return `${formatNumber(first)} - ${formatNumber(first + 9)}`;
}

export function getCenturyViewCaption(
  date: Date,
  calendarType: CalendarType,
  formatNumber: NumberFormatter = defaultFormatNumber,
): string {
  const first = getFirstCalendarDecadeInCentury(calendarYear(date, calendarType));
  return `${formatNumber(first)}-${formatNumber(first + 99)}`;
}

export function isSameCalendarCentury(a: Date, b: Date, calendarType: CalendarType): boolean {
  return getFirstCalendarDecadeInCentury(calendarYear(a, calendarType))
    === getFirstCalendarDecadeInCentury(calendarYear(b, calendarType));
}

export function isOtherCalendarCentury(
  cellDate: Date,
  date: Date,
  calendarType: CalendarType,
): boolean {
  return !isSameCalendarCentury(cellDate, date, calendarType);
}

// --- shared range checks ---------------------------------------------------

/** Month ordinal (year*12 + month) for year-view range comparisons. */
export function getCalendarMonthOrdinal(date: Date, calendarType: CalendarType): number {
  return calendarYear(date, calendarType) * 12 + calendarMonth(date, calendarType);
}

export { calendarYear };
