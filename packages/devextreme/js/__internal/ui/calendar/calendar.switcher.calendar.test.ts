// ensure built-in calendars are registered
import {
  beforeAll, describe, expect, it,
} from '@jest/globals';
import { registerCalendar } from '@ts/core/localization/calendar';

import {
  getCalendarDisplayName,
  getCalendarDisplayNameInLocale,
  getCalendarSwitcherItems,
  normalizeSwitcherValue,
} from './calendar.switcher.calendar';

describe('calendar switcher model', () => {
  beforeAll(() => {
    // a minimal custom calendar to verify custom-type handling
    registerCalendar({
      type: 'test-cal',
      toParts: (date) => ({
        year: date.getFullYear(), month: date.getMonth(), day: date.getDate(),
      }),
      fromParts: ({ year, month, day }) => new Date(year, month, day),
      getDaysInMonth: () => 30,
      getMonthsInYear: () => 12,
      isLeapYear: () => false,
      getMonthNames: () => Array.from({ length: 12 }, (_, i) => `M${i + 1}`),
    });
  });

  describe('getCalendarDisplayName', () => {
    it('returns friendly names for built-ins', () => {
      expect(getCalendarDisplayName('gregorian')).toBe('Gregorian');
      expect(getCalendarDisplayName('persian')).toBe('Persian');
      expect(getCalendarDisplayName('hijri')).toBe('Hijri');
      expect(getCalendarDisplayName('hijri-umalqura')).toBe('Hijri (Umm al-Qura)');
    });

    it('falls back to the raw type for unknown calendars', () => {
      expect(getCalendarDisplayName('test-cal')).toBe('test-cal');
    });
  });

  describe('getCalendarDisplayNameInLocale', () => {
    it('returns Persian-script names for fa', () => {
      expect(getCalendarDisplayNameInLocale('gregorian', 'fa')).toBe('میلادی');
      expect(getCalendarDisplayNameInLocale('persian', 'fa')).toBe('شمسی (جلالی)');
      expect(getCalendarDisplayNameInLocale('hijri', 'fa')).toBe('هجری قمری');
    });

    it('returns Arabic-script names for ar', () => {
      expect(getCalendarDisplayNameInLocale('gregorian', 'ar')).toBe('ميلادي');
      expect(getCalendarDisplayNameInLocale('hijri', 'ar')).toBe('هجري');
    });

    it('honors region tags (fa-IR -> fa)', () => {
      expect(getCalendarDisplayNameInLocale('persian', 'fa-IR')).toBe('شمسی (جلالی)');
    });

    it('falls back to English for unknown locales', () => {
      expect(getCalendarDisplayNameInLocale('persian', 'de')).toBe('Persian');
      expect(getCalendarDisplayNameInLocale('persian')).toBe('Persian');
    });

    it('falls back to the raw type for unknown calendars', () => {
      expect(getCalendarDisplayNameInLocale('test-cal', 'fa')).toBe('test-cal');
    });
  });

  describe('getCalendarSwitcherItems', () => {
    it('lists every registered calendar when no filter is given', () => {
      const items = getCalendarSwitcherItems();
      const types = items.map((i) => i.type);

      expect(types).toContain('gregorian');
      expect(types).toContain('persian');
      expect(types).toContain('hijri');
      expect(types).toContain('test-cal');
    });

    it('restricts to the requested types and preserves order', () => {
      const items = getCalendarSwitcherItems(['persian', 'gregorian']);

      expect(items).toEqual([
        { type: 'persian', text: 'Persian' },
        { type: 'gregorian', text: 'Gregorian' },
      ]);
    });

    it('drops unregistered types', () => {
      const items = getCalendarSwitcherItems(['gregorian', 'does-not-exist']);

      expect(items.map((i) => i.type)).toEqual(['gregorian']);
    });

    it('removes duplicates', () => {
      const items = getCalendarSwitcherItems(['gregorian', 'gregorian', 'persian']);

      expect(items.map((i) => i.type)).toEqual(['gregorian', 'persian']);
    });

    it('honors a custom display-name resolver', () => {
      const items = getCalendarSwitcherItems(['gregorian'], (t) => t.toUpperCase());

      expect(items[0].text).toBe('GREGORIAN');
    });
  });

  describe('normalizeSwitcherValue', () => {
    const items = getCalendarSwitcherItems(['gregorian', 'persian']);

    it('keeps the requested value when present', () => {
      expect(normalizeSwitcherValue('persian', items)).toBe('persian');
    });

    it('falls back to the first item when the request is absent', () => {
      expect(normalizeSwitcherValue('hijri', items)).toBe('gregorian');
      expect(normalizeSwitcherValue(undefined, items)).toBe('gregorian');
    });

    it('returns undefined when there are no items', () => {
      expect(normalizeSwitcherValue('gregorian', [])).toBeUndefined();
    });
  });
});
