/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';

import {
  getCalendar,
  getCalendarDefaultDateFormat,
  getCalendarFirstDayOfWeek,
  getRegisteredCalendarTypes,
  isCalendarRegistered,
  registerCalendar,
} from './index';

const toTuple = (date: Date): [number, number, number] => [
  date.getFullYear(), date.getMonth(), date.getDate(),
];

describe('calendar metadata (first day of week / default format)', () => {
  it('persian starts the week on Saturday and uses yyyy/MM/dd', () => {
    expect(getCalendarFirstDayOfWeek('persian')).toBe(6);
    expect(getCalendarDefaultDateFormat('persian')).toBe('yyyy/MM/dd');
  });

  it('hijri calendars start the week on Saturday', () => {
    expect(getCalendarFirstDayOfWeek('hijri')).toBe(6);
    expect(getCalendarFirstDayOfWeek('hijri-umalqura')).toBe(6);
  });

  it('gregorian has no calendar-specific preference (locale default applies)', () => {
    expect(getCalendarFirstDayOfWeek('gregorian')).toBeUndefined();
    expect(getCalendarDefaultDateFormat('gregorian')).toBeUndefined();
  });

  it('falls back to gregorian (undefined) for unknown types', () => {
    expect(getCalendarFirstDayOfWeek('nope')).toBeUndefined();
    expect(getCalendarDefaultDateFormat('nope')).toBeUndefined();
  });
});

describe('localized month names', () => {
  it('persian returns Persian-script names for fa', () => {
    const wide = getCalendar('persian').getMonthNames('wide', 'fa');
    expect(wide[0]).toBe('فروردین');
    expect(wide[5]).toBe('شهریور');
    expect(wide[11]).toBe('اسفند');
  });

  it('persian falls back to transliteration when locale is missing or unknown', () => {
    expect(getCalendar('persian').getMonthNames('wide')[0]).toBe('Farvardin');
    expect(getCalendar('persian').getMonthNames('wide', 'de')[0]).toBe('Farvardin');
  });

  it('persian honors region tags (fa-IR -> fa)', () => {
    expect(getCalendar('persian').getMonthNames('wide', 'fa-IR')[0]).toBe('فروردین');
  });

  it('hijri returns Arabic-script names for ar', () => {
    const wide = getCalendar('hijri').getMonthNames('wide', 'ar');
    expect(wide[0]).toBe('مُحَرَّم');
    expect(wide[8]).toBe('رَمَضان');
  });

  it('hijri returns Persian-script names for fa', () => {
    const wide = getCalendar('hijri').getMonthNames('wide', 'fa');
    expect(wide[0]).toBe('محرم');
    expect(wide[8]).toBe('رمضان');
  });

  it('gregorian ignores the locale (the localization layer handles that)', () => {
    const wide = getCalendar('gregorian').getMonthNames('wide', 'fa');
    expect(wide[0]).toBe('January');
  });
});

describe('calendar registry', () => {
  it('registers the three built-in calendars', () => {
    const types = getRegisteredCalendarTypes();

    expect(types).toContain('gregorian');
    expect(types).toContain('persian');
    expect(types).toContain('hijri');
  });

  it('returns the requested calendar by type', () => {
    expect(getCalendar('persian').type).toBe('persian');
    expect(getCalendar('hijri').type).toBe('hijri');
    expect(getCalendar('gregorian').type).toBe('gregorian');
  });

  it('falls back to gregorian for unknown or missing type', () => {
    expect(getCalendar().type).toBe('gregorian');
    expect(getCalendar('klingon').type).toBe('gregorian');
  });

  it('reports registration state', () => {
    expect(isCalendarRegistered('persian')).toBe(true);
    expect(isCalendarRegistered('klingon')).toBe(false);
  });

  it('allows registering a custom calendar', () => {
    const stub = getCalendar('gregorian');
    registerCalendar({ ...stub, type: 'custom-test' });

    expect(isCalendarRegistered('custom-test')).toBe(true);
    expect(getCalendar('custom-test').type).toBe('custom-test');
  });
});

describe('gregorian calendar', () => {
  const cal = getCalendar('gregorian');

  it('maps parts straight onto native Date fields', () => {
    expect(cal.toParts(new Date(2024, 2, 20))).toEqual({ year: 2024, month: 2, day: 20 });
    expect(toTuple(cal.fromParts({ year: 2024, month: 2, day: 20 }))).toEqual([2024, 2, 20]);
  });

  it('computes days in month and leap years', () => {
    expect(cal.getDaysInMonth(2024, 1)).toBe(29); // Feb 2024 (leap)
    expect(cal.getDaysInMonth(2023, 1)).toBe(28); // Feb 2023
    expect(cal.isLeapYear(2024)).toBe(true);
    expect(cal.isLeapYear(2023)).toBe(false);
    expect(cal.isLeapYear(1900)).toBe(false);
    expect(cal.isLeapYear(2000)).toBe(true);
  });
});

describe('persian (jalali) calendar', () => {
  const cal = getCalendar('persian');

  it('converts Nowruz anchors correctly', () => {
    // Nowruz 1403 fell on 2024-03-20.
    expect(cal.toParts(new Date(2024, 2, 20))).toEqual({ year: 1403, month: 0, day: 1 });
    // Nowruz 1400 fell on 2021-03-21.
    expect(cal.toParts(new Date(2021, 2, 21))).toEqual({ year: 1400, month: 0, day: 1 });
  });

  it('round-trips fromParts/toParts', () => {
    expect(toTuple(cal.fromParts({ year: 1403, month: 0, day: 1 }))).toEqual([2024, 2, 20]);
    const parts = { year: 1399, month: 11, day: 15 };
    expect(cal.toParts(cal.fromParts(parts))).toEqual(parts);
  });

  it('handles month lengths and leap years', () => {
    expect(cal.getDaysInMonth(1403, 0)).toBe(31); // Farvardin (first 6 months: 31)
    expect(cal.getDaysInMonth(1403, 6)).toBe(30); // Mehr (months 7-11: 30)
    expect(cal.getDaysInMonth(1403, 11)).toBe(30); // Esfand in a leap year
    expect(cal.getDaysInMonth(1404, 11)).toBe(29); // Esfand in a common year
    expect(cal.isLeapYear(1403)).toBe(true);
    expect(cal.isLeapYear(1404)).toBe(false);
  });

  it('exposes 12 transliterated month names', () => {
    const names = cal.getMonthNames();
    expect(names).toHaveLength(12);
    expect(names[0]).toBe('Farvardin');
    expect(names[11]).toBe('Esfand');
  });
});

describe('hijri (tabular islamic) calendar', () => {
  const cal = getCalendar('hijri');

  it('maps the islamic epoch to proleptic Gregorian 622-07-19', () => {
    expect(toTuple(cal.fromParts({ year: 1, month: 0, day: 1 }))).toEqual([622, 6, 19]);
  });

  it('round-trips fromParts/toParts', () => {
    const parts = { year: 1445, month: 8, day: 10 }; // Ramadan 1445
    expect(cal.toParts(cal.fromParts(parts))).toEqual(parts);
  });

  it('handles month lengths and leap years', () => {
    expect(cal.getDaysInMonth(1445, 0)).toBe(30); // odd months -> 30
    expect(cal.getDaysInMonth(1445, 1)).toBe(29); // even months -> 29
    expect(cal.isLeapYear(1445)).toBe(true); // 1445 % 30 == 5 -> leap
    expect(cal.isLeapYear(1443)).toBe(false); // 1443 % 30 == 3 -> common
    expect(cal.getDaysInMonth(1445, 11)).toBe(30); // Dhu al-Hijjah in a leap year
    expect(cal.getDaysInMonth(1443, 11)).toBe(29); // Dhu al-Hijjah in a common year
  });

  it('exposes 12 month names', () => {
    const names = cal.getMonthNames();
    expect(names).toHaveLength(12);
    expect(names[0]).toBe('Muharram');
    expect(names[8]).toBe('Ramadan');
  });
});

describe('exhaustive round-trip stability', () => {
  it('round-trips every week from 1950 to 2100 for persian and hijri', () => {
    const persian = getCalendar('persian');
    const hijri = getCalendar('hijri');
    let failures = 0;

    for (let t = Date.UTC(1950, 0, 1); t <= Date.UTC(2100, 0, 1); t += 86400000 * 7) {
      const utc = new Date(t);
      const local = new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());

      const p = persian.fromParts(persian.toParts(local));
      const h = hijri.fromParts(hijri.toParts(local));

      if (toTuple(p).join() !== toTuple(local).join()) { failures += 1; }
      if (toTuple(h).join() !== toTuple(local).join()) { failures += 1; }
    }

    expect(failures).toBe(0);
  });
});
