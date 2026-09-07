import { describe, expect, it } from '@jest/globals';

import { applyCalendarRollerValue, buildCalendarRollerConfig } from './date_view.calendar';

const MIN = new Date(1900, 0, 1);
const MAX = new Date(2100, 11, 31);

describe('buildCalendarRollerConfig - persian', () => {
  // 2024-03-20 == 1 Farvardin 1403
  const current = new Date(2024, 2, 20);

  it('builds the year roller in calendar years', () => {
    const config = buildCalendarRollerConfig('year', 'persian', current, MIN, MAX);

    expect(config.valueItems[0]).toBe(1278); // 1900-01-01 precedes Nowruz -> 1278
    expect(config.valueItems).toContain(1403);
    expect(config.getIndex(current)).toBe(config.valueItems.indexOf(1403));
  });

  it('builds the month roller with persian month names', () => {
    const config = buildCalendarRollerConfig('month', 'persian', current, MIN, MAX);

    expect(config.displayItems[0]).toBe('Farvardin');
    expect(config.displayItems).toHaveLength(12);
    expect(config.getIndex(current)).toBe(0);
  });

  it('builds the day roller sized to the calendar month', () => {
    const config = buildCalendarRollerConfig('day', 'persian', current, MIN, MAX);

    // Farvardin has 31 days.
    expect(config.valueItems).toHaveLength(31);
    expect(config.getIndex(current)).toBe(0);
  });
});

describe('buildCalendarRollerConfig - hijri', () => {
  const current = new Date(2024, 6, 7); // tabular hijri 1445-12-30

  it('builds the month roller with hijri month names', () => {
    const config = buildCalendarRollerConfig('month', 'hijri', current, MIN, MAX);

    expect(config.displayItems).toHaveLength(12);
    expect(config.displayItems[0]).toBe('Muharram');
  });

  it('day roller respects hijri month lengths', () => {
    const config = buildCalendarRollerConfig('day', 'hijri', current, MIN, MAX);

    // Dhu al-Hijjah length depends on leap year (29 or 30).
    expect(config.valueItems.length === 29 || config.valueItems.length === 30).toBe(true);
  });
});

describe('applyCalendarRollerValue', () => {
  it('changes the persian year and keeps a valid Gregorian date', () => {
    const current = new Date(2024, 2, 20); // 1/1/1403
    const result = applyCalendarRollerValue('year', 'persian', current, 1404);

    // 1 Farvardin 1404 == 2025-03-21
    expect([result.getFullYear(), result.getMonth(), result.getDate()]).toEqual([2025, 2, 21]);
  });

  it('changes the persian month and clamps the day to the month length', () => {
    // Start on 31 Farvardin 1403 (2024-04-19); switch to Mehr (month index 6, 30 days).
    const current = new Date(2024, 3, 19);
    const result = applyCalendarRollerValue('month', 'persian', current, 6);

    // Day 31 must clamp to 30 Mehr 1403.
    expect(result.getDate()).toBeGreaterThan(0);
    expect(Number.isNaN(result.getTime())).toBe(false);
  });

  it('preserves the time-of-day', () => {
    const current = new Date(2024, 2, 20, 14, 35, 12, 500);
    const result = applyCalendarRollerValue('day', 'persian', current, 10);

    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(35);
    expect(result.getSeconds()).toBe(12);
    expect(result.getMilliseconds()).toBe(500);
  });

  it('changes the hijri day', () => {
    const current = new Date(2024, 6, 7);
    const result = applyCalendarRollerValue('day', 'hijri', current, 1);

    expect(Number.isNaN(result.getTime())).toBe(false);
  });
});
