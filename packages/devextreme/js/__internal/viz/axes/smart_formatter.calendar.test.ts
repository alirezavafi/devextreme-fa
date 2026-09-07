/* eslint-disable spellcheck/spell-checker */
import '@ts/core/localization/calendar'; // registers persian/hijri

import { describe, expect, it } from '@jest/globals';

import { smartFormatter } from './smart_formatter';

// 2024-03-20 = 1 Farvardin 1403 (Persian).
const DATE = new Date(2024, 2, 20);

function format(labelOptions: Record<string, unknown>): string {
  return String(smartFormatter(DATE, {
    labelOptions,
    ticks: [],
    tickInterval: undefined,
    dataType: 'datetime',
    type: 'continuous',
  }));
}

describe('smartFormatter calendar support', () => {
  it('renders a datetime axis label in the selected calendar', () => {
    expect(format({ format: 'month', calendar: 'persian' })).toContain('Farvardin');
    expect(format({ format: 'year', calendar: 'persian' })).toContain('1403');
  });

  it('leaves Gregorian labels unchanged when no calendar is set', () => {
    expect(format({ format: 'month' })).toContain('March');
    expect(format({ format: 'year' })).toContain('2024');
  });

  it('honors a calendar already embedded in an object format', () => {
    expect(format({ format: { type: 'month', calendar: 'persian' } })).toContain('Farvardin');
  });

  it('ignores calendar for non-datetime axes', () => {
    const numericOpts = {
      ticks: [], tickInterval: 1, dataType: 'numeric', type: 'continuous',
    };
    const withCalendar = String(smartFormatter(1234, { ...numericOpts, labelOptions: { calendar: 'persian' } }));
    const withoutCalendar = String(smartFormatter(1234, { ...numericOpts, labelOptions: {} }));
    expect(withCalendar).toBe(withoutCalendar);
    expect(withCalendar).toContain('234');
  });
});
