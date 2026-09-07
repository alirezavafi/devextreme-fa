import type { CalendarSystem, DateParts, MonthNameFormat } from './core';

const MONTH_NAMES: Record<MonthNameFormat, string[]> = {
  wide: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  abbreviated: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ],
  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
};

export function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Identity calendar. Date parts map straight onto the native `Date` fields, so
 * default DevExtreme behaviour is unchanged when this calendar is selected.
 */
const gregorianCalendar: CalendarSystem = {
  type: 'gregorian',

  toParts(date: Date): DateParts {
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
    };
  },

  fromParts(parts: DateParts): Date {
    return new Date(parts.year, parts.month, parts.day);
  },

  getDaysInMonth(year: number, month: number): number {
    // Day 0 of the next month is the last day of the requested month.
    return new Date(year, month + 1, 0).getDate();
  },

  getMonthsInYear(): number {
    return 12;
  },

  isLeapYear(year: number): boolean {
    return isGregorianLeapYear(year);
  },

  getMonthNames(format: MonthNameFormat = 'wide'): string[] {
    return [...(MONTH_NAMES[format] ?? MONTH_NAMES.wide)];
  },
};

export default gregorianCalendar;
