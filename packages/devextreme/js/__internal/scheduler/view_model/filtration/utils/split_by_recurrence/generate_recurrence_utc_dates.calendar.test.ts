/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';
import { getCalendar } from '@ts/core/localization/calendar';

import { generateRecurrenceUTCDates } from './generate_recurrence_utc_dates';

const persian = getCalendar('persian');

// Calendar parts from a UTC-fields timestamp (the engine works in pseudo-UTC space).
const partsFromUtc = (ms: number): { year: number; month: number; day: number } => {
  const date = new Date(ms);
  const local = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return persian.toParts(local);
};

const makeAppointment = (rule: string): any => ({
  // 1 Farvardin 1403
  source: { startDate: Date.UTC(2024, 2, 20), endDate: Date.UTC(2024, 2, 20, 1) },
  recurrenceRule: rule,
  hasRecurrenceRule: true,
});

const baseOptions = {
  interval: { min: Date.UTC(2023, 0, 1), max: Date.UTC(2026, 0, 1) },
  timeZone: '',
};

describe('generateRecurrenceUTCDates - calendar-aware (active engine)', () => {
  it('MONTHLY recurs on the same persian day each persian month', () => {
    const dates = generateRecurrenceUTCDates(
      makeAppointment('FREQ=MONTHLY;COUNT=3'),
      { ...baseOptions, calendar: 'persian' },
    );

    expect(dates).toHaveLength(3);
    dates.forEach((ms) => expect(partsFromUtc(ms).day).toBe(1));
    expect(dates.map((ms) => partsFromUtc(ms).month)).toEqual([0, 1, 2]);
  });

  it('MONTHLY;BYMONTHDAY=15 recurs on the 15th of each persian month', () => {
    const dates = generateRecurrenceUTCDates(
      makeAppointment('FREQ=MONTHLY;BYMONTHDAY=15;COUNT=2'),
      { ...baseOptions, calendar: 'persian' },
    );

    expect(dates).toHaveLength(2);
    dates.forEach((ms) => expect(partsFromUtc(ms).day).toBe(15));
  });

  it('YEARLY recurs on the same persian month/day each persian year', () => {
    const dates = generateRecurrenceUTCDates(
      makeAppointment('FREQ=YEARLY;COUNT=2'),
      { ...baseOptions, calendar: 'persian' },
    );

    expect(partsFromUtc(dates[0])).toEqual({ year: 1403, month: 0, day: 1 });
    expect(partsFromUtc(dates[1])).toEqual({ year: 1404, month: 0, day: 1 });
  });

  it('MONTHLY;BYDAY=1MO recurs on the first Monday of each persian month', () => {
    const dates = generateRecurrenceUTCDates(
      makeAppointment('FREQ=MONTHLY;BYDAY=1MO;COUNT=3'),
      { ...baseOptions, calendar: 'persian' },
    );

    expect(dates).toHaveLength(3);
    dates.forEach((ms) => {
      expect(new Date(ms).getUTCDay()).toBe(1); // Monday
      expect(partsFromUtc(ms).day).toBeLessThanOrEqual(7); // first week of the calendar month
    });
  });

  it('MONTHLY;BYDAY=-1FR recurs on the last Friday of each persian month', () => {
    const dates = generateRecurrenceUTCDates(
      makeAppointment('FREQ=MONTHLY;BYDAY=-1FR;COUNT=3'),
      { ...baseOptions, calendar: 'persian' },
    );

    expect(dates).toHaveLength(3);
    dates.forEach((ms) => {
      expect(new Date(ms).getUTCDay()).toBe(5); // Friday
      // last Friday is within the final week of the (29-31 day) calendar month
      expect(partsFromUtc(ms).day).toBeGreaterThan(22);
    });
  });

  it('MONTHLY;BYDAY=MO recurs on every Monday of each persian month', () => {
    const dates = generateRecurrenceUTCDates(
      makeAppointment('FREQ=MONTHLY;BYDAY=MO;COUNT=6'),
      { ...baseOptions, calendar: 'persian' },
    );

    expect(dates).toHaveLength(6);
    dates.forEach((ms) => expect(new Date(ms).getUTCDay()).toBe(1));
  });

  it('MONTHLY;BYMONTHDAY=-1 recurs on the last day of each persian month', () => {
    const dates = generateRecurrenceUTCDates(
      makeAppointment('FREQ=MONTHLY;BYMONTHDAY=-1;COUNT=3'),
      { ...baseOptions, calendar: 'persian' },
    );

    expect(dates).toHaveLength(3);
    dates.forEach((ms) => {
      const parts = partsFromUtc(ms);
      expect(parts.day).toBe(persian.getDaysInMonth(parts.year, parts.month));
    });
  });

  it('MONTHLY;BYMONTHDAY=1,15 recurs on both days of each persian month', () => {
    const dates = generateRecurrenceUTCDates(
      makeAppointment('FREQ=MONTHLY;BYMONTHDAY=1,15;COUNT=4'),
      { ...baseOptions, calendar: 'persian' },
    );

    expect(dates.map((ms) => partsFromUtc(ms).day)).toEqual([1, 15, 1, 15]);
  });

  it('YEARLY;BYMONTH=1;BYDAY=1MO recurs on the first Monday of Farvardin each persian year', () => {
    const dates = generateRecurrenceUTCDates(
      makeAppointment('FREQ=YEARLY;BYMONTH=1;BYDAY=1MO;COUNT=2'),
      { ...baseOptions, calendar: 'persian' },
    );

    expect(dates).toHaveLength(2);
    dates.forEach((ms) => {
      expect(new Date(ms).getUTCDay()).toBe(1);
      expect(partsFromUtc(ms).month).toBe(0); // Farvardin
      expect(partsFromUtc(ms).day).toBeLessThanOrEqual(7);
    });
    expect(partsFromUtc(dates[0]).year).toBe(1403);
    expect(partsFromUtc(dates[1]).year).toBe(1404);
  });

  it('delegates YEARLY;BYDAY without BYMONTH to the Gregorian engine', () => {
    const withCalendar = generateRecurrenceUTCDates(
      makeAppointment('FREQ=YEARLY;BYDAY=1MO;COUNT=2'),
      { ...baseOptions, calendar: 'persian' },
    );
    const withoutCalendar = generateRecurrenceUTCDates(
      makeAppointment('FREQ=YEARLY;BYDAY=1MO;COUNT=2'),
      baseOptions,
    );

    expect(withCalendar).toEqual(withoutCalendar);
  });

  it('delegates DAILY to the Gregorian engine (calendar-independent)', () => {
    const withCalendar = generateRecurrenceUTCDates(
      makeAppointment('FREQ=DAILY;COUNT=3'),
      { ...baseOptions, calendar: 'persian' },
    );
    const withoutCalendar = generateRecurrenceUTCDates(
      makeAppointment('FREQ=DAILY;COUNT=3'),
      baseOptions,
    );

    expect(withCalendar).toEqual(withoutCalendar);
  });

  it('leaves Gregorian MONTHLY unchanged', () => {
    const gregorian = generateRecurrenceUTCDates(
      makeAppointment('FREQ=MONTHLY;COUNT=3'),
      { ...baseOptions, calendar: 'gregorian' },
    );
    const noCalendar = generateRecurrenceUTCDates(
      makeAppointment('FREQ=MONTHLY;COUNT=3'),
      baseOptions,
    );

    expect(gregorian).toEqual(noCalendar);
  });

  describe('with per-appointment time zones', () => {
    // Iran abolished DST in 2022, so Asia/Tehran is a constant +03:30 for 2024+
    // (deterministic, no DST transition within the series).
    const TZ = 'Asia/Tehran';

    it('a target timeZone offset composes transparently (still persian day 1)', () => {
      const dates = generateRecurrenceUTCDates(
        makeAppointment('FREQ=MONTHLY;COUNT=4'),
        { ...baseOptions, calendar: 'persian', timeZone: TZ },
      );

      expect(dates).toHaveLength(4);
      dates.forEach((ms) => expect(partsFromUtc(ms).day).toBe(1));
      expect(dates.map((ms) => partsFromUtc(ms).month)).toEqual([0, 1, 2, 3]);
    });

    it('a per-appointment startDateTimeZone still recurs on the right persian day', () => {
      const dates = generateRecurrenceUTCDates(
        makeAppointment('FREQ=MONTHLY;BYMONTHDAY=15;COUNT=3'),
        {
          ...baseOptions,
          calendar: 'persian',
          timeZone: TZ,
          startDateTimeZone: 'Asia/Tehran',
        },
      );

      expect(dates).toHaveLength(3);
      dates.forEach((ms) => expect(partsFromUtc(ms).day).toBe(15));
    });

    it('YEARLY composes with a target timeZone (same persian month/day)', () => {
      const dates = generateRecurrenceUTCDates(
        makeAppointment('FREQ=YEARLY;COUNT=2'),
        { ...baseOptions, calendar: 'persian', timeZone: TZ },
      );

      expect(partsFromUtc(dates[0])).toEqual({ year: 1403, month: 0, day: 1 });
      expect(partsFromUtc(dates[1])).toEqual({ year: 1404, month: 0, day: 1 });
    });

    it('offset handling matches the Gregorian engine (same composition mechanism)', () => {
      // DAILY delegates to the RRULE engine; the calendar MONTHLY path applies the
      // same startDateOffsetBase shift, so a fixed-offset zone leaves day numbers intact.
      const persianTz = generateRecurrenceUTCDates(
        makeAppointment('FREQ=MONTHLY;COUNT=3'),
        { ...baseOptions, calendar: 'persian', timeZone: TZ },
      );
      const persianNoTz = generateRecurrenceUTCDates(
        makeAppointment('FREQ=MONTHLY;COUNT=3'),
        { ...baseOptions, calendar: 'persian' },
      );

      // The calendar day-of-month is preserved whether or not a fixed-offset
      // time zone is supplied.
      expect(persianTz.map((ms) => partsFromUtc(ms).day))
        .toEqual(persianNoTz.map((ms) => partsFromUtc(ms).day));
    });
  });
});
