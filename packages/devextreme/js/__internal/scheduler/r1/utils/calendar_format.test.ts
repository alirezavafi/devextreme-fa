import { describe, expect, it } from '@jest/globals';

import {
  formatWeekdayAndDayInCalendar,
  getCalendarDayNumber,
  getCalendarHeaderFormatter,
  isCustomCalendar,
} from './calendar_format';

// 2024-03-20 == 1 Farvardin 1403 (Persian); 30 Dhu al-Hijjah 1445 (Hijri, tabular)
const DATE = new Date(2024, 2, 20);

describe('isCustomCalendar', () => {
  it('treats gregorian/undefined as non-custom', () => {
    expect(isCustomCalendar()).toBe(false);
    expect(isCustomCalendar('gregorian')).toBe(false);
    expect(isCustomCalendar('persian')).toBe(true);
  });
});

describe('getCalendarDayNumber', () => {
  it('returns the calendar day-of-month', () => {
    expect(getCalendarDayNumber(DATE, 'persian')).toBe(1);
    expect(getCalendarDayNumber(new Date(2024, 6, 7), 'hijri')).toBe(30);
  });
});

describe('formatWeekdayAndDayInCalendar', () => {
  it('renders weekday + calendar day number', () => {
    // 2024-03-20 is a Wednesday; persian day is 1.
    const text = formatWeekdayAndDayInCalendar(DATE, 'persian');
    expect(text.endsWith(' 1')).toBe(true);
  });
});

describe('getCalendarHeaderFormatter', () => {
  it('returns undefined for gregorian (caller keeps default)', () => {
    expect(getCalendarHeaderFormatter('gregorian')).toBeUndefined();
    expect(getCalendarHeaderFormatter()).toBeUndefined();
  });

  it('returns a formatter for a custom calendar', () => {
    const formatter = getCalendarHeaderFormatter('persian');
    expect(typeof formatter).toBe('function');
    expect(formatter?.(DATE).endsWith(' 1')).toBe(true);
  });
});
