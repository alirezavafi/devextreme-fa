/* eslint-disable spellcheck/spell-checker */
import '@ts/core/localization/calendar'; // registers persian/hijri

import { describe, expect, it } from '@jest/globals';

import { formatValue } from './common';

const DATE = new Date(2024, 2, 20); // 1 Farvardin 1403

const tickInfo = { ticks: [], tickInterval: undefined };

describe('range selector scale label calendar support', () => {
  it('formats a datetime scale label in the selected calendar', () => {
    const text = formatValue(DATE, { format: 'month', calendar: 'persian' }, tickInfo, 'datetime', 'continuous');
    expect(text).toContain('Farvardin');
  });

  it('keeps the Gregorian label by default', () => {
    const text = formatValue(DATE, { format: 'month' }, tickInfo, 'datetime', 'continuous');
    expect(text).toContain('March');
  });
});
