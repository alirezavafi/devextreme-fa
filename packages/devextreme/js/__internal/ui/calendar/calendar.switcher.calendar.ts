/* eslint-disable spellcheck/spell-checker */
import type { CalendarType } from '@ts/core/localization/calendar';
import { getRegisteredCalendarTypes, isCalendarRegistered } from '@ts/core/localization/calendar';

/**
 * Pure model builders for the Calendar widget's optional in-picker calendar
 * switcher. The switcher lets the user change the active calendar system at
 * runtime; because every component stores a native Gregorian `Date`, switching
 * only changes the display/entry calendar and never migrates the value.
 *
 * These helpers are intentionally DOM-free so they can be unit-tested in
 * isolation; the widget renders the items and wires the change handler.
 */

export interface CalendarSwitcherItem {
  /** Registered calendar type (the value written to the `calendar` option). */
  type: CalendarType;
  /** Human-readable label shown in the switcher. */
  text: string;
}

export type CalendarDisplayNameResolver = (type: CalendarType) => string;

const DEFAULT_DISPLAY_NAMES: Record<string, string> = {
  gregorian: 'Gregorian',
  persian: 'Persian',
  hijri: 'Hijri',
  'hijri-umalqura': 'Hijri (Umm al-Qura)',
};

/**
 * Locale-localized display names for the built-in calendars. The base 'en'
 * transliteration is used for any locale without an entry below (and for callers
 * that don't supply a locale).
 */
const LOCALIZED_DISPLAY_NAMES: Record<string, Record<string, string>> = {
  fa: {
    gregorian: 'میلادی',
    persian: 'شمسی (جلالی)',
    hijri: 'هجری قمری',
    'hijri-umalqura': 'هجری قمری (ام‌القری)',
  },
  ar: {
    gregorian: 'ميلادي',
    persian: 'فارسي (جلالي)',
    hijri: 'هجري',
    'hijri-umalqura': 'هجري (أم القرى)',
  },
};

function pickLocalizedDisplayName(type: CalendarType, locale?: string): string | undefined {
  if (!locale) return undefined;
  const exact = LOCALIZED_DISPLAY_NAMES[locale];
  if (exact && exact[type]) return exact[type];
  const base = locale.split('-')[0];
  return LOCALIZED_DISPLAY_NAMES[base]?.[type];
}

/** Friendly label for a calendar type, falling back to the raw type string. */
export const getCalendarDisplayName: CalendarDisplayNameResolver = (
  type: CalendarType,
): string => DEFAULT_DISPLAY_NAMES[type] ?? String(type);

/** Friendly label for a calendar type in the given locale (with English fallback). */
export function getCalendarDisplayNameInLocale(type: CalendarType, locale?: string): string {
  return pickLocalizedDisplayName(type, locale) ?? getCalendarDisplayName(type);
}

/**
 * Builds the switcher item list. When `types` is provided, only those (that are
 * actually registered) are used, preserving the given order; otherwise every
 * registered calendar is offered. Duplicates are removed.
 */
export function getCalendarSwitcherItems(
  types?: CalendarType[],
  resolveName: CalendarDisplayNameResolver = getCalendarDisplayName,
): CalendarSwitcherItem[] {
  const source = types?.length ? types : getRegisteredCalendarTypes();
  const seen: Record<string, boolean> = {};
  const result: CalendarSwitcherItem[] = [];

  source.forEach((type) => {
    if (!seen[type] && isCalendarRegistered(type)) {
      seen[type] = true;
      result.push({ type, text: resolveName(type) });
    }
  });

  return result;
}

/**
 * Resolves which item should be selected: the requested type when it is present
 * in `items`, otherwise the first item (or `undefined` when there are none).
 */
export function normalizeSwitcherValue(
  requested: CalendarType | undefined,
  items: CalendarSwitcherItem[],
): CalendarType | undefined {
  if (requested !== undefined && items.some((item) => item.type === requested)) {
    return requested;
  }

  return items.length ? items[0].type : undefined;
}
