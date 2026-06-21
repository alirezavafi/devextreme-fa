import type { CalendarType } from '@ts/core/localization/calendar';
import { getCalendar } from '@ts/core/localization/calendar';

/**
 * Calendar-month boundary helpers for the Scheduler month view.
 *
 * The month grid is aligned to the *calendar* month (e.g. it starts on
 * 1 Farvardin, not 1 March) when a non-Gregorian calendar is selected. These
 * pure helpers compute the Gregorian dates of the calendar-month edges so the
 * existing week/row machinery keeps working on real `Date`s.
 */

export const isCustomCalendar = (calendar?: CalendarType): boolean => !!calendar && calendar !== 'gregorian';

/** First Gregorian date of the calendar month containing `date`. */
export function getCalendarMonthStart(date: Date, calendar: CalendarType): Date {
  const calendarSystem = getCalendar(calendar);
  const { year, month } = calendarSystem.toParts(date);
  return calendarSystem.fromParts({ year, month, day: 1 });
}

/** Last Gregorian date of the calendar month containing `date`. */
export function getCalendarMonthEnd(date: Date, calendar: CalendarType): Date {
  const calendarSystem = getCalendar(calendar);
  const { year, month } = calendarSystem.toParts(date);
  const lastDay = calendarSystem.getDaysInMonth(year, month);
  return calendarSystem.fromParts({ year, month, day: lastDay });
}

/** Adds `count` calendar months to `date`, clamping the day to the new month. */
export function addCalendarMonthsToDate(
  date: Date,
  calendar: CalendarType,
  count: number,
): Date {
  const calendarSystem = getCalendar(calendar);
  const { year, month, day } = calendarSystem.toParts(date);
  const totalMonths = year * 12 + month + count;
  const newYear = Math.floor(totalMonths / 12);
  const newMonth = ((totalMonths % 12) + 12) % 12;
  const daysInMonth = calendarSystem.getDaysInMonth(newYear, newMonth);
  return calendarSystem.fromParts({
    year: newYear,
    month: newMonth,
    day: Math.min(day, daysInMonth),
  });
}

/**
 * End of an `intervalCount`-month calendar span starting at the calendar month
 * of `date` (used for multi-month month views).
 */
export function getCalendarSpanEnd(
  date: Date,
  calendar: CalendarType,
  intervalCount: number,
): Date {
  const lastMonthDate = addCalendarMonthsToDate(date, calendar, Math.max(intervalCount - 1, 0));
  return getCalendarMonthEnd(lastMonthDate, calendar);
}
