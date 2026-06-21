/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';

import {
  formatDateInCalendar,
  getCalendarPartGetter,
  getCalendarPartLimits,
  getCalendarPartSetter,
  parseDateInCalendar,
} from './date_box.mask.calendar';

// Minimal LDML date-parts stub. Month names come from the calendar system, so
// only the time-related names need stubbing for numeric patterns.
const baseDateParts = {
  getMonthNames: (): string[] => [],
  getDayNames: (): string[] => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  getQuarterNames: (): string[] => ['Q1', 'Q2', 'Q3', 'Q4'],
  getPeriodNames: (): string[] => ['AM', 'PM'],
  getTimeSeparator: (): string => ':',
};

const toTuple = (date: Date): [number, number, number] => [
  date.getFullYear(), date.getMonth(), date.getDate(),
];

describe('formatDateInCalendar', () => {
  it('formats a Gregorian date in the persian calendar', () => {
    // 2024-03-20 == 1 Farvardin 1403
    const text = formatDateInCalendar(new Date(2024, 2, 20), 'persian', 'yyyy/MM/dd', baseDateParts);
    expect(text).toBe('1403/01/01');
  });

  it('formats with persian month names', () => {
    const text = formatDateInCalendar(new Date(2024, 2, 20), 'persian', 'MMMM yyyy', baseDateParts);
    expect(text).toBe('Farvardin 1403');
  });

  it('formats a Gregorian date in the hijri calendar', () => {
    // 2024-07-07 == 30 Dhu al-Hijjah 1445 (tabular)
    const text = formatDateInCalendar(new Date(2024, 6, 7), 'hijri', 'yyyy/MM/dd', baseDateParts);
    expect(text).toBe('1445/12/30');
  });

  it('preserves time-of-day fields', () => {
    const text = formatDateInCalendar(new Date(2024, 2, 20, 14, 5), 'persian', 'HH:mm', baseDateParts);
    expect(text).toBe('14:05');
  });
});

describe('calendar part getters', () => {
  const date = new Date(2024, 2, 20); // 1 Farvardin 1403

  it('reads persian year/month/day', () => {
    expect(getCalendarPartGetter('y', 'persian')?.(date)).toBe(1403);
    expect(getCalendarPartGetter('M', 'persian')?.(date)).toBe(1); // 1-based
    expect(getCalendarPartGetter('d', 'persian')?.(date)).toBe(1);
  });

  it('returns null for unsupported part chars', () => {
    expect(getCalendarPartGetter('H', 'persian')).toBeNull();
  });
});

describe('calendar part limits', () => {
  const date = new Date(2024, 2, 20); // Farvardin 1403 (31 days)

  it('limits month to the calendar year length', () => {
    expect(getCalendarPartLimits('M', 'persian', date)).toEqual({ min: 1, max: 12 });
  });

  it('limits day to the calendar month length', () => {
    expect(getCalendarPartLimits('d', 'persian', date)).toEqual({ min: 1, max: 31 });
    // Mehr (month index 6) has 30 days.
    const mehr = new Date(2024, 9, 1); // within Mehr 1403
    expect(getCalendarPartLimits('d', 'persian', mehr).max).toBe(30);
  });
});

describe('calendar part setters', () => {
  it('sets the persian month and recomputes the Gregorian date', () => {
    const date = new Date(2024, 2, 20); // Farvardin 1, 1403
    getCalendarPartSetter('M', 'persian')?.(date, 7); // -> Mehr (index 6)
    expect(getCalendarPartGetter('M', 'persian')?.(date)).toBe(7);
    expect(Number.isNaN(date.getTime())).toBe(false);
  });

  it('sets the persian day', () => {
    const date = new Date(2024, 2, 20);
    getCalendarPartSetter('d', 'persian')?.(date, 15);
    expect(getCalendarPartGetter('d', 'persian')?.(date)).toBe(15);
  });

  it('sets the persian year via prefix logic', () => {
    const date = new Date(2024, 2, 20); // year 1403
    getCalendarPartSetter('y', 'persian')?.(date, '1404');
    expect(getCalendarPartGetter('y', 'persian')?.(date)).toBe(1404);
  });

  it('preserves time when setting a part', () => {
    const date = new Date(2024, 2, 20, 9, 30, 15);
    getCalendarPartSetter('d', 'persian')?.(date, 10);
    expect([date.getHours(), date.getMinutes(), date.getSeconds()]).toEqual([9, 30, 15]);
  });
});

describe('parseDateInCalendar', () => {
  it('parses a persian numeric date into a Gregorian Date', () => {
    const date = parseDateInCalendar('1403/01/01', 'persian', 'yyyy/MM/dd', baseDateParts);
    expect(date).not.toBeNull();
    expect(toTuple(date as Date)).toEqual([2024, 2, 20]);
  });

  it('parses a persian date with a month name', () => {
    const date = parseDateInCalendar('Farvardin 1403', 'persian', 'MMMM yyyy', baseDateParts);
    expect(date).not.toBeNull();
    expect((date as Date).getFullYear()).toBe(2024);
  });

  it('parses a hijri numeric date', () => {
    const date = parseDateInCalendar('1445/12/30', 'hijri', 'yyyy/MM/dd', baseDateParts);
    expect(date).not.toBeNull();
    expect(toTuple(date as Date)).toEqual([2024, 6, 7]);
  });

  it('returns null for text that does not match the pattern', () => {
    expect(parseDateInCalendar('not-a-date', 'persian', 'yyyy/MM/dd', baseDateParts)).toBeNull();
  });

  it('round-trips format then parse', () => {
    const original = new Date(2023, 5, 15);
    const text = formatDateInCalendar(original, 'persian', 'yyyy/MM/dd', baseDateParts);
    const parsed = parseDateInCalendar(text, 'persian', 'yyyy/MM/dd', baseDateParts);
    expect(toTuple(parsed as Date)).toEqual(toTuple(original));
  });
});
