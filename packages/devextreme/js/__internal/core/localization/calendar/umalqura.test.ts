import { describe, expect, it } from '@jest/globals';

import { getCalendar, isCalendarRegistered } from './index';

const toTuple = (date: Date): [number, number, number] => [
  date.getFullYear(), date.getMonth(), date.getDate(),
];

describe('umm al-qura calendar', () => {
  it('is registered when Intl supports it (node ICU)', () => {
    expect(isCalendarRegistered('hijri-umalqura')).toBe(true);
  });

  const cal = getCalendar('hijri-umalqura');

  it('converts the known UAQ anchor (1 Muharram 1446 == 2024-07-07)', () => {
    expect(cal.toParts(new Date(2024, 6, 7))).toEqual({ year: 1446, month: 0, day: 1 });
  });

  it('differs from the arithmetic hijri calendar by ~1 day on the anchor', () => {
    const tabular = getCalendar('hijri').toParts(new Date(2024, 6, 7));
    // tabular: 1445/12/30, umalqura: 1446/01/01
    expect(tabular.year).toBe(1445);
    expect(cal.toParts(new Date(2024, 6, 7)).year).toBe(1446);
  });

  it('round-trips fromParts/toParts', () => {
    const parts = { year: 1446, month: 0, day: 1 };
    expect(cal.toParts(cal.fromParts(parts))).toEqual(parts);
    expect(toTuple(cal.fromParts(parts))).toEqual([2024, 6, 7]);
  });

  it('round-trips a sample of dates 2000-2050', () => {
    let failures = 0;
    for (let t = Date.UTC(2000, 0, 1); t <= Date.UTC(2050, 0, 1); t += 86400000 * 11) {
      const utc = new Date(t);
      const local = new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
      const back = cal.fromParts(cal.toParts(local));
      if (toTuple(back).join() !== toTuple(local).join()) { failures += 1; }
    }
    expect(failures).toBe(0);
  });

  it('reports month lengths of 29 or 30 days', () => {
    for (let month = 0; month < 12; month += 1) {
      const len = cal.getDaysInMonth(1446, month);
      expect(len === 29 || len === 30).toBe(true);
    }
  });

  it('exposes 12 month names', () => {
    expect(cal.getMonthNames()).toHaveLength(12);
    expect(cal.getMonthNames()[0]).toBe('Muharram');
  });
});
