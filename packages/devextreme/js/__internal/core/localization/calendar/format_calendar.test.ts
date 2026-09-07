/* eslint-disable spellcheck/spell-checker */
import './index'; // registers persian/hijri so dateLocalization can use them

import { describe, expect, it } from '@jest/globals';
import dateLocalization from '@js/common/core/localization/date';

import { applyCalendarToFormat } from './format_calendar';

describe('applyCalendarToFormat', () => {
  it('returns the format unchanged for gregorian / missing calendar', () => {
    expect(applyCalendarToFormat('shortdate', 'gregorian')).toBe('shortdate');
    expect(applyCalendarToFormat('shortdate', undefined)).toBe('shortdate');
    expect(applyCalendarToFormat(undefined, 'persian')).toBeUndefined();
  });

  it('wraps a string format into a typed object carrying the calendar', () => {
    expect(applyCalendarToFormat('month', 'persian')).toEqual({ type: 'month', calendar: 'persian' });
  });

  it('adds the calendar to an object format (without overwriting an existing one)', () => {
    expect(applyCalendarToFormat({ type: 'shortdate' }, 'persian'))
      .toEqual({ type: 'shortdate', calendar: 'persian' });
    expect(applyCalendarToFormat({ type: 'shortdate', calendar: 'hijri' }, 'persian'))
      .toEqual({ type: 'shortdate', calendar: 'hijri' });
  });

  it('passes a function formatter through unchanged', () => {
    const fn = (d: Date): string => d.toISOString();
    expect(applyCalendarToFormat(fn, 'persian')).toBe(fn);
  });

  it('drives a calendar-aware render through dateLocalization.format', () => {
    // 2024-03-20 is 1 Farvardin 1403 (Persian).
    const date = new Date(2024, 2, 20);
    const fmt = applyCalendarToFormat('yyyy', 'persian') as Record<string, unknown>;
    const text = String(dateLocalization.format(date, fmt));
    expect(text).toContain('1403');
    expect(text).not.toContain('2024');
  });
});
