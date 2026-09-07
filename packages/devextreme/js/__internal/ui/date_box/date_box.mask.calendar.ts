import type { CalendarType } from '@ts/core/localization/calendar';
import { getCalendar } from '@ts/core/localization/calendar';
import {
  createCalendarDateParts,
  formatDateInCalendar,
  parseDateInCalendar,
} from '@ts/core/localization/calendar/date_format';

/**
 * Calendar-aware typed-input support for the DateBox mask.
 *
 * Formatting/parsing is shared with the date-localization layer
 * (`@ts/core/localization/calendar/date_format`). This module adds the
 * UI-specific per-part getter/setter/limits used while editing.
 */

// Re-export the shared format/parse helpers for the mask widget.
export { createCalendarDateParts, formatDateInCalendar, parseDateInCalendar };

export interface CalendarPartLimits {
  min: number;
  max: number;
}

/** Writes calendar parts onto a Gregorian `Date` in place, preserving time. */
function applyCalendarParts(
  date: Date,
  calendar: ReturnType<typeof getCalendar>,
  year: number,
  month: number,
  day: number,
): void {
  const gregorian = calendar.fromParts({ year, month, day });
  date.setFullYear(gregorian.getFullYear(), gregorian.getMonth(), gregorian.getDate());
}

export function getCalendarPartLimits(
  patternChar: string,
  calendarType: CalendarType,
  date: Date,
  forcedPattern?: string,
): CalendarPartLimits {
  const calendar = getCalendar(calendarType);
  const parts = calendar.toParts(date);
  const effective = forcedPattern ?? patternChar;

  switch (effective) {
    case 'y':
      return { min: 0, max: 9999 };
    case 'M':
    case 'L':
      return { min: 1, max: calendar.getMonthsInYear(parts.year) };
    case 'd':
      return { min: 1, max: calendar.getDaysInMonth(parts.year, parts.month) };
    case 'dM':
      return { min: 1, max: calendar.getDaysInMonth(parts.year, parts.month) };
    default:
      return { min: 0, max: 0 };
  }
}

export function getCalendarPartGetter(
  patternChar: string,
  calendarType: CalendarType,
): ((date: Date) => number) | null {
  const calendar = getCalendar(calendarType);

  switch (patternChar) {
    case 'y':
      return (date: Date): number => calendar.toParts(date).year;
    case 'M':
    case 'L':
      return (date: Date): number => calendar.toParts(date).month + 1;
    case 'd':
      return (date: Date): number => calendar.toParts(date).day;
    default:
      return null;
  }
}

export function getCalendarPartSetter(
  patternChar: string,
  calendarType: CalendarType,
): ((date: Date, value: number | string) => void) | null {
  const calendar = getCalendar(calendarType);

  switch (patternChar) {
    case 'y':
      return (date: Date, value: number | string): void => {
        const parts = calendar.toParts(date);
        const maxLimitLength = 4;
        const valueLength = String(value).length;
        const yearPrefix = String(parts.year).substr(0, maxLimitLength - valueLength);
        const newYear = parseInt(yearPrefix + value, 10);
        applyCalendarParts(date, calendar, newYear, parts.month, parts.day);
      };
    case 'M':
    case 'L':
      return (date: Date, value: number | string): void => {
        const parts = calendar.toParts(date);
        const monthsInYear = calendar.getMonthsInYear(parts.year);
        const newMonth = Math.min(Math.max(+value, 1), monthsInYear) - 1;
        applyCalendarParts(date, calendar, parts.year, newMonth, parts.day);
      };
    case 'd':
      return (date: Date, value: number | string): void => {
        const parts = calendar.toParts(date);
        applyCalendarParts(date, calendar, parts.year, parts.month, +value);
      };
    default:
      return null;
  }
}
