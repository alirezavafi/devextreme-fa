import type { CalendarSystem, CalendarType, DateParts } from '@ts/core/localization/calendar';
import { getCalendar, getCalendarMonthNamesInActiveLocale } from '@ts/core/localization/calendar';

/**
 * Pure (DOM-free) construction of DateView roller configurations for an
 * arbitrary calendar system. `date_view.ts` delegates here when a non-Gregorian
 * calendar is selected; the Gregorian path keeps its original implementation.
 *
 * Time-of-day rollers (hours/minutes/...) are independent of the calendar and
 * are handled by the existing Gregorian logic, so this module only covers the
 * year/month/day fields.
 *
 * Number rendering is injected (`formatNumber`) so this module stays free of
 * the localization/CLDR dependency chain and remains trivially unit-testable.
 * The default formatter emits plain ASCII digits; `date_view.ts` passes a
 * locale-aware digit shaper.
 */

export type CalendarRollerType = 'year' | 'month' | 'day';

export type NumberFormatter = (value: number) => string;

const defaultFormatNumber: NumberFormatter = (value: number): string => String(value);

export interface CalendarRollerConfig {
  type: CalendarRollerType;
  /** Calendar field values for each roller item. */
  valueItems: number[];
  /** Localized strings shown in the roller. */
  displayItems: string[];
  selectedIndex: number;
  /** Index of `date` within `valueItems` (calendar-aware). */
  getIndex: (date: Date) => number;
}

const clampDay = (
  calendar: CalendarSystem,
  parts: DateParts,
): number => {
  const maxDay = calendar.getDaysInMonth(parts.year, parts.month);
  return Math.min(Math.max(parts.day, 1), maxDay);
};

export function buildCalendarRollerConfig(
  componentName: CalendarRollerType,
  calendarType: CalendarType,
  currentDate: Date,
  minDate: Date,
  maxDate: Date,
  formatNumber: NumberFormatter = defaultFormatNumber,
): CalendarRollerConfig {
  const calendar = getCalendar(calendarType);
  const current = calendar.toParts(currentDate);
  const min = calendar.toParts(minDate);
  const max = calendar.toParts(maxDate);

  const valueItems: number[] = [];
  const displayItems: string[] = [];
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let getIndex: (date: Date) => number;

  switch (componentName) {
    case 'year': {
      const startYear = min.year;
      const endYear = max.year;
      for (let y = startYear; y <= endYear; y += 1) {
        valueItems.push(y);
        displayItems.push(formatNumber(y));
      }
      getIndex = (date: Date): number => calendar.toParts(date).year - startYear;
      break;
    }
    case 'month': {
      const monthsInYear = calendar.getMonthsInYear(current.year);
      const monthNames = getCalendarMonthNamesInActiveLocale(calendarType, 'wide');
      const sameMinYear = current.year === min.year;
      const sameMaxYear = current.year === max.year;
      const startMonth = sameMinYear ? min.month : 0;
      const endMonth = sameMaxYear ? max.month : monthsInYear - 1;
      for (let m = startMonth; m <= endMonth; m += 1) {
        valueItems.push(m);
        displayItems.push(monthNames[m] ?? formatNumber(m + 1));
      }
      getIndex = (date: Date): number => calendar.toParts(date).month - startMonth;
      break;
    }
    case 'day':
    default: {
      const daysInMonth = calendar.getDaysInMonth(current.year, current.month);
      const sameMinYear = current.year === min.year;
      const sameMaxYear = current.year === max.year;
      const sameMinMonth = sameMinYear && current.month === min.month;
      const sameMaxMonth = sameMaxYear && current.month === max.month;
      const startDay = sameMinMonth ? min.day : 1;
      const endDay = sameMaxMonth ? max.day : daysInMonth;
      for (let d = startDay; d <= endDay; d += 1) {
        valueItems.push(d);
        displayItems.push(formatNumber(d));
      }
      getIndex = (date: Date): number => calendar.toParts(date).day - startDay;
      break;
    }
  }

  return {
    type: componentName,
    valueItems,
    displayItems,
    selectedIndex: getIndex(currentDate),
    getIndex,
  };
}

/**
 * Returns a new Gregorian `Date` produced by setting one calendar field
 * (year/month/day) on `currentDate` to `rollerValue`, clamping the day to the
 * resulting month length. Time-of-day is preserved.
 */
export function applyCalendarRollerValue(
  componentName: CalendarRollerType,
  calendarType: CalendarType,
  currentDate: Date,
  rollerValue: number,
): Date {
  const calendar = getCalendar(calendarType);
  const parts = calendar.toParts(currentDate);

  const nextParts: DateParts = { ...parts };
  if (componentName === 'year') {
    nextParts.year = rollerValue;
  } else if (componentName === 'month') {
    nextParts.month = rollerValue;
  } else {
    nextParts.day = rollerValue;
  }

  if (componentName !== 'day') {
    nextParts.day = clampDay(calendar, nextParts);
  }

  const result = calendar.fromParts(nextParts);
  // Preserve the time-of-day from the original value.
  result.setHours(
    currentDate.getHours(),
    currentDate.getMinutes(),
    currentDate.getSeconds(),
    currentDate.getMilliseconds(),
  );
  return result;
}
