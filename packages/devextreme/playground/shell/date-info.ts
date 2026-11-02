// Calendar arithmetic for the demo pages, built on the public calendar registry.
// Every input and output is a native Gregorian Date; the calendar only decides
// where months and years begin and end.
import {
  getCalendar,
  getCalendarMonthNamesInActiveLocale,
} from '../../js/common/core/localization/calendar';
import type { CalendarId } from './constants/calendar-ids';
import type { DateDescription } from './date-description';

const pad = (n: number): string => String(n).padStart(2, '0');

const atMidnight = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const toIsoDate = (date: Date): string => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const toIsoDateTime = (date: Date): string => `${toIsoDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export function describeDate(date: Date, calendar: CalendarId): DateDescription {
  const system = getCalendar(calendar);
  const { year, month, day } = system.toParts(date);
  return {
    iso: toIsoDate(date),
    year,
    month,
    day,
    monthName: getCalendarMonthNamesInActiveLocale(calendar, 'wide')[month],
    weekday: date.getDay(),
    daysInMonth: system.getDaysInMonth(year, month),
    isLeapYear: system.isLeapYear(year),
  };
}

export function addCalendarMonths(date: Date, months: number, calendar: CalendarId): Date {
  const system = getCalendar(calendar);
  let { year, month } = system.toParts(date);
  const { day } = system.toParts(date);

  month += months;
  while (month < 0) {
    year -= 1;
    month += system.getMonthsInYear(year);
  }
  while (month >= system.getMonthsInYear(year)) {
    month -= system.getMonthsInYear(year);
    year += 1;
  }

  const result = system.fromParts({ year, month, day: Math.min(day, system.getDaysInMonth(year, month)) });
  result.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
  return result;
}

export function calendarMonthRange(date: Date, calendar: CalendarId): [Date, Date] {
  const system = getCalendar(calendar);
  const { year, month } = system.toParts(date);
  return [
    atMidnight(system.fromParts({ year, month, day: 1 })),
    atMidnight(system.fromParts({ year, month, day: system.getDaysInMonth(year, month) })),
  ];
}

export function calendarYearRange(date: Date, calendar: CalendarId): [Date, Date] {
  const system = getCalendar(calendar);
  const { year } = system.toParts(date);
  const lastMonth = system.getMonthsInYear(year) - 1;
  return [
    atMidnight(system.fromParts({ year, month: 0, day: 1 })),
    atMidnight(system.fromParts({ year, month: lastMonth, day: system.getDaysInMonth(year, lastMonth) })),
  ];
}

export const startOfCalendarYear = (date: Date, calendar: CalendarId): Date => calendarYearRange(date, calendar)[0];

// Weeks are seven days in every calendar; only the first day differs.
export function calendarWeekRange(date: Date, firstDayOfWeek: number): [Date, Date] {
  const start = addDays(atMidnight(date), -((date.getDay() - firstDayOfWeek + 7) % 7));
  return [start, addDays(start, 6)];
}
