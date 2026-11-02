import {
  describe, expect, it,
} from '@jest/globals';

import { getCalendar } from '../../../js/common/core/localization/calendar';
import { CalendarIds } from '../constants/calendar-ids';
import {
  addCalendarMonths,
  calendarMonthRange,
  calendarWeekRange,
  calendarYearRange,
  describeDate,
  startOfCalendarYear,
  toIsoDate,
  toIsoDateTime,
} from '../date-info';

const ymd = (date: Date): string => toIsoDate(date);

describe('toIsoDate / toIsoDateTime', () => {
  it('pads month, day, hours and minutes using local time', () => {
    expect(toIsoDate(new Date(2024, 2, 5))).toBe('2024-03-05');
    expect(toIsoDateTime(new Date(2024, 2, 5, 7, 4))).toBe('2024-03-05 07:04');
  });
});

describe('describeDate', () => {
  it('describes 1 Farvardin 1403 in the Persian calendar', () => {
    const d = describeDate(new Date(2024, 2, 20), CalendarIds.persian);

    expect(d).toMatchObject({
      iso: '2024-03-20', year: 1403, month: 0, day: 1, daysInMonth: 31, isLeapYear: true, weekday: 3,
    });
    expect(d.monthName).toBe('Farvardin');
  });

  it('describes the same day as Ramadan 1445 in the Hijri calendar', () => {
    const d = describeDate(new Date(2024, 2, 20), CalendarIds.hijri);

    expect(d.year).toBe(1445);
    expect(d.month).toBe(8);
  });

  it('describes a Gregorian leap February', () => {
    expect(describeDate(new Date(2024, 1, 10), CalendarIds.gregorian))
      .toMatchObject({ year: 2024, month: 1, day: 10, daysInMonth: 29, isLeapYear: true });
  });
});

describe('addCalendarMonths', () => {
  it('clamps 31 Shahrivar to 30 Mehr', () => {
    expect(ymd(addCalendarMonths(new Date(2024, 8, 21), 1, CalendarIds.persian))).toBe('2024-10-21');
  });

  it('crosses the Persian year boundary from Esfand 30 of a leap year', () => {
    expect(ymd(addCalendarMonths(new Date(2025, 2, 20), 1, CalendarIds.persian))).toBe('2025-04-19');
  });

  it('goes back across the year boundary', () => {
    const farvardin15 = getCalendar(CalendarIds.persian).fromParts({ year: 1403, month: 0, day: 15 });
    const back = addCalendarMonths(farvardin15, -1, CalendarIds.persian);

    expect(getCalendar(CalendarIds.persian).toParts(back)).toEqual({ year: 1402, month: 11, day: 15 });
  });

  it('clamps 31 January to 29 February in a Gregorian leap year', () => {
    expect(ymd(addCalendarMonths(new Date(2024, 0, 31), 1, CalendarIds.gregorian))).toBe('2024-02-29');
  });

  it('keeps the time of day', () => {
    const moved = addCalendarMonths(new Date(2024, 2, 20, 14, 30), 2, CalendarIds.hijri);

    expect([moved.getHours(), moved.getMinutes()]).toEqual([14, 30]);
  });
});

describe('calendar ranges', () => {
  it('returns the Persian month Farvardin 1403', () => {
    expect(calendarMonthRange(new Date(2024, 3, 1), CalendarIds.persian).map(ymd))
      .toEqual(['2024-03-20', '2024-04-19']);
  });

  it('returns a Gregorian leap February', () => {
    expect(calendarMonthRange(new Date(2024, 1, 15), CalendarIds.gregorian).map(ymd))
      .toEqual(['2024-02-01', '2024-02-29']);
  });

  it('returns the leap Persian year 1403', () => {
    expect(calendarYearRange(new Date(2024, 5, 1), CalendarIds.persian).map(ymd))
      .toEqual(['2024-03-20', '2025-03-20']);
  });

  it('returns a Hijri month that starts and ends inside Ramadan', () => {
    const [start, end] = calendarMonthRange(new Date(2024, 2, 20), CalendarIds.hijri);
    const hijri = getCalendar(CalendarIds.hijri);

    expect(hijri.toParts(start)).toMatchObject({ year: 1445, month: 8, day: 1 });
    expect(hijri.toParts(end)).toMatchObject({ year: 1445, month: 8, day: hijri.getDaysInMonth(1445, 8) });
  });

  it('starts the week on the given day', () => {
    expect(calendarWeekRange(new Date(2024, 2, 20), 6).map(ymd)).toEqual(['2024-03-16', '2024-03-22']);
    expect(calendarWeekRange(new Date(2024, 2, 20), 0).map(ymd)).toEqual(['2024-03-17', '2024-03-23']);
    expect(calendarWeekRange(new Date(2024, 2, 16), 6).map(ymd)).toEqual(['2024-03-16', '2024-03-22']);
  });

  it('finds the start of the calendar year the day falls in', () => {
    expect(ymd(startOfCalendarYear(new Date(2024, 2, 19), CalendarIds.persian))).toBe('2023-03-21');
    expect(ymd(startOfCalendarYear(new Date(2024, 2, 20), CalendarIds.persian))).toBe('2024-03-20');
    expect(ymd(startOfCalendarYear(new Date(2024, 6, 4), CalendarIds.gregorian))).toBe('2024-01-01');
  });

  it('returns dates at midnight', () => {
    const [start, end] = calendarMonthRange(new Date(2024, 2, 20, 15, 45), CalendarIds.persian);

    expect([start.getHours(), end.getHours(), end.getMinutes()]).toEqual([0, 0, 0]);
  });
});
