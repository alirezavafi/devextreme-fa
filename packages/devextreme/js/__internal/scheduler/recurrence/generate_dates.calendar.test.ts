/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';
import { getCalendar } from '@ts/core/localization/calendar';

import { generateDates } from './generate_dates';

const persian = getCalendar('persian');
const partsOf = (date: Date): { year: number; month: number; day: number } => persian.toParts(date);

// 2024-03-20 == 1 Farvardin 1403
const START = new Date(2024, 2, 20);
const MIN = new Date(2023, 0, 1);
const MAX = new Date(2027, 0, 1);

const base = {
  start: START,
  min: MIN,
  max: MAX,
  appointmentTimezoneOffset: 0,
};

describe('calendar-aware recurrence (persian)', () => {
  it('MONTHLY recurs on the same calendar day each calendar month', () => {
    const dates = generateDates({ ...base, rule: 'FREQ=MONTHLY;COUNT=3', calendar: 'persian' });

    expect(dates).toHaveLength(3);
    dates.forEach((date) => expect(partsOf(date).day).toBe(1));
    expect(dates.map((d) => partsOf(d).month)).toEqual([0, 1, 2]);
    expect(dates.every((d) => partsOf(d).year === 1403)).toBe(true);
  });

  it('MONTHLY;BYMONTHDAY=15 recurs on the 15th of each calendar month', () => {
    const dates = generateDates({ ...base, rule: 'FREQ=MONTHLY;BYMONTHDAY=15;COUNT=3', calendar: 'persian' });

    expect(dates).toHaveLength(3);
    dates.forEach((date) => expect(partsOf(date).day).toBe(15));
  });

  it('MONTHLY;INTERVAL=2 steps two calendar months', () => {
    const dates = generateDates({ ...base, rule: 'FREQ=MONTHLY;INTERVAL=2;COUNT=3', calendar: 'persian' });

    expect(dates.map((d) => partsOf(d).month)).toEqual([0, 2, 4]);
  });

  it('YEARLY recurs on the same calendar month/day each calendar year', () => {
    const dates = generateDates({ ...base, rule: 'FREQ=YEARLY;COUNT=2', calendar: 'persian' });

    expect(dates).toHaveLength(2);
    expect(partsOf(dates[0])).toEqual({ year: 1403, month: 0, day: 1 });
    expect(partsOf(dates[1])).toEqual({ year: 1404, month: 0, day: 1 });
  });

  it('respects UNTIL', () => {
    // UNTIL ~ 2 calendar months after start.
    const dates = generateDates({
      ...base,
      rule: 'FREQ=MONTHLY;UNTIL=20240525T000000',
      calendar: 'persian',
    });
    // 1 Farvardin (2024-03-20) and 1 Ordibehesht (2024-04-20) are <= 2024-05-25;
    // Khordad (2024-05-21) too.
    expect(dates.length).toBeGreaterThanOrEqual(2);
    const untilLimit = new Date(2024, 4, 25).getTime();
    dates.forEach((date) => expect(date.getTime()).toBeLessThanOrEqual(untilLimit));
  });

  it('preserves the start time of day', () => {
    const dates = generateDates({
      ...base,
      start: new Date(2024, 2, 20, 9, 30),
      rule: 'FREQ=MONTHLY;COUNT=2',
      calendar: 'persian',
    });

    dates.forEach((date) => {
      expect(date.getHours()).toBe(9);
      expect(date.getMinutes()).toBe(30);
    });
  });

  it('delegates DAILY recurrence to the Gregorian engine (calendar-independent)', () => {
    const withCalendar = generateDates({
      ...base,
      min: new Date(2024, 2, 20),
      max: new Date(2024, 2, 25),
      rule: 'FREQ=DAILY',
      calendar: 'persian',
    });
    const withoutCalendar = generateDates({
      ...base,
      min: new Date(2024, 2, 20),
      max: new Date(2024, 2, 25),
      rule: 'FREQ=DAILY',
    });

    expect(withCalendar.map((d) => d.getTime())).toEqual(withoutCalendar.map((d) => d.getTime()));
  });

  it('delegates BYDAY monthly rules to the Gregorian engine', () => {
    const withCalendar = generateDates({ ...base, rule: 'FREQ=MONTHLY;BYDAY=MO;COUNT=3', calendar: 'persian' });
    const withoutCalendar = generateDates({ ...base, rule: 'FREQ=MONTHLY;BYDAY=MO;COUNT=3' });

    expect(withCalendar.map((d) => d.getTime())).toEqual(withoutCalendar.map((d) => d.getTime()));
  });

  it('leaves Gregorian recurrence unchanged', () => {
    const gregorian = generateDates({ ...base, rule: 'FREQ=MONTHLY;COUNT=3', calendar: 'gregorian' });
    const noCalendar = generateDates({ ...base, rule: 'FREQ=MONTHLY;COUNT=3' });

    expect(gregorian.map((d) => d.getTime())).toEqual(noCalendar.map((d) => d.getTime()));
  });
});
