import dateLocalization from '@js/common/core/localization/date';
import numberLocalization from '@js/common/core/localization/number';
import type { CalendarType } from '@ts/core/localization/calendar';
import { getCalendar } from '@ts/core/localization/calendar';

/**
 * Calendar-aware Scheduler date labels.
 *
 * The Scheduler stores Gregorian dates; these helpers render the day-of-month
 * number (and weekday + day header) in the selected calendar. Weekday names are
 * calendar-independent and reuse the existing locale day names.
 *
 * Scope note: this covers the day/week/timeline *header day numbers* (via the
 * workspace `getFormat()` injection). Month-view cell numbering and the
 * navigator caption depend on month-boundary math and are tracked separately.
 */

export function isCustomCalendar(calendarType?: CalendarType): boolean {
  return !!calendarType && calendarType !== 'gregorian';
}

/** Day-of-month in the selected calendar for a Gregorian date. */
export function getCalendarDayNumber(date: Date, calendarType: CalendarType): number {
  return getCalendar(calendarType).toParts(date).day;
}

/** Abbreviated weekday name + calendar day number (drop-in for formatWeekdayAndDay). */
export function formatWeekdayAndDayInCalendar(date: Date, calendarType: CalendarType): string {
  const weekday = dateLocalization.getDayNames('abbreviated')[date.getDay()];
  const day = numberLocalization.convertDigits(
    String(getCalendarDayNumber(date, calendarType)),
  ) as string;

  return `${weekday} ${day}`;
}

/**
 * Returns a `getFormat()`-compatible formatter: the calendar-aware weekday+day
 * formatter when `calendarType` is non-Gregorian, otherwise `undefined` so the
 * caller keeps its default Gregorian formatter.
 */
export function getCalendarHeaderFormatter(
  calendarType?: CalendarType,
): ((date: Date) => string) | undefined {
  if (!isCustomCalendar(calendarType)) {
    return undefined;
  }

  return (date: Date): string => formatWeekdayAndDayInCalendar(date, calendarType as CalendarType);
}
