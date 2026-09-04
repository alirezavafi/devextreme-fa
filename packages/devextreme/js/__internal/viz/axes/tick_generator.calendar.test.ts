/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';
import { getCalendar } from '@ts/core/localization/calendar';

import { tickGenerator } from './tick_generator';

function generateMonthlyTicks(calendar?: string): Date[] {
  const gen = tickGenerator({
    axisType: 'continuous',
    dataType: 'datetime',
    calendar,
    axisDivisionFactor: 50,
    minorAxisDivisionFactor: 15,
    calculateMinors: false,
    allowDecimals: true,
    endOnTick: false,
    firstDayOfWeek: 0,
    skipTickGeneration: false,
    rangeIsEmpty: false,
    generateExtraTick: false,
    incidentOccurred: (): void => {},
  });

  const data = { min: new Date(2024, 2, 1), max: new Date(2024, 6, 1), isSpacedMargin: false };
  // forceTickInterval = true so the monthly interval is used as-is.
  return gen(data, 600, { months: 1 }, true).ticks as Date[];
}

describe('tickGenerator calendar-aware datetime placement', () => {
  it('places monthly ticks on Persian month boundaries', () => {
    const ticks = generateMonthlyTicks('persian');
    const persian = getCalendar('persian');

    expect(ticks.length).toBeGreaterThan(2);
    ticks.forEach((tick) => {
      // Each tick is the first day of a Persian month...
      expect(persian.toParts(tick).day).toBe(1);
      // ...which is NOT the first of a Gregorian month (proves calendar alignment).
      expect(tick.getDate()).not.toBe(1);
    });

    // Consecutive ticks advance exactly one Persian month.
    for (let i = 0; i < ticks.length - 1; i += 1) {
      const cur = persian.toParts(ticks[i]);
      const next = persian.toParts(ticks[i + 1]);
      expect((cur.month + 1) % 12).toBe(next.month);
    }
  });

  it('keeps Gregorian month boundaries by default', () => {
    const ticks = generateMonthlyTicks('gregorian');
    expect(ticks.length).toBeGreaterThan(2);
    ticks.forEach((tick) => {
      expect(tick.getDate()).toBe(1); // first of each Gregorian month
    });
  });

  it('places yearly ticks on Persian year boundaries', () => {
    const gen = tickGenerator({
      axisType: 'continuous',
      dataType: 'datetime',
      calendar: 'persian',
      axisDivisionFactor: 50,
      minorAxisDivisionFactor: 15,
      calculateMinors: false,
      allowDecimals: true,
      endOnTick: false,
      firstDayOfWeek: 0,
      skipTickGeneration: false,
      rangeIsEmpty: false,
      generateExtraTick: false,
      incidentOccurred: (): void => {},
    });
    const data = { min: new Date(2022, 0, 1), max: new Date(2026, 0, 1), isSpacedMargin: false };
    const ticks = gen(data, 600, { years: 1 }, true).ticks as Date[];
    const persian = getCalendar('persian');

    expect(ticks.length).toBeGreaterThan(2);
    ticks.forEach((tick) => {
      const parts = persian.toParts(tick);
      expect(parts.month).toBe(0); // 1 Farvardin
      expect(parts.day).toBe(1);
    });
  });
});
