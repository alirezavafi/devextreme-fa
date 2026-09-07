/**
 * Calendar-system abstraction.
 *
 * Every DevExtreme date component stores its value as a native (proleptic
 * Gregorian) `Date`. A `CalendarSystem` describes how that stored `Date` is
 * decomposed into and recomposed from the year/month/day fields of a particular
 * civil calendar (Gregorian, Persian/Jalali, Hijri/Islamic, ...).
 *
 * The contract is intentionally date-only: time-of-day is preserved by the
 * calling component and is independent of the calendar system. This keeps the
 * abstraction small while covering everything the pickers, the masked input and
 * the Calendar grid need.
 */

export type CalendarType = 'gregorian' | 'persian' | 'hijri' | string;

export type MonthNameFormat = 'wide' | 'abbreviated' | 'narrow';

export interface DateParts {
  /** Calendar year. */
  year: number;
  /** Zero-based month index (0..monthsInYear-1), matching `Date.getMonth`. */
  month: number;
  /** One-based day of month. */
  day: number;
}

export interface CalendarSystem {
  /** Unique identifier used by the registry and component options. */
  readonly type: CalendarType;

  /**
   * Preferred first day of the week for this calendar (0 = Sunday .. 6 = Saturday).
   * When omitted, components keep their locale-based default. Persian/Hijri
   * calendars conventionally start the week on Saturday (6).
   */
  readonly firstDayOfWeek?: number;

  /**
   * Preferred LDML display format for this calendar (e.g. `'yyyy/MM/dd'` for
   * Persian). When omitted, components keep their locale-based default.
   */
  readonly defaultDateFormat?: string;

  /** Decompose a Gregorian `Date` into this calendar's date parts. */
  toParts: (date: Date) => DateParts;

  /**
   * Recompose calendar date parts into a Gregorian `Date` at local midnight.
   * Out-of-range parts (e.g. month 13, day 40) roll over the same way the
   * native `Date` constructor does.
   */
  fromParts: (parts: DateParts) => Date;

  /** Number of days in the given calendar month (month is zero-based). */
  getDaysInMonth: (year: number, month: number) => number;

  /** Number of months in the given calendar year (12 for all built-ins). */
  getMonthsInYear: (year: number) => number;

  /** Whether the given calendar year is a leap year. */
  isLeapYear: (year: number) => boolean;

  /**
   * Localized/transliterated month names for the calendar. The optional
   * `locale` argument lets implementations return script-localized names (e.g.
   * Persian-script names for `'fa'`, Arabic-script names for `'ar'`); when it
   * is omitted or unsupported, an English transliteration is returned.
   */
  getMonthNames: (format?: MonthNameFormat, locale?: string) => string[];
}

const registry: Record<string, CalendarSystem> = {};

const DEFAULT_CALENDAR: CalendarType = 'gregorian';

export function registerCalendar(calendar: CalendarSystem): void {
  registry[calendar.type] = calendar;
}

export function isCalendarRegistered(type: CalendarType): boolean {
  return Object.prototype.hasOwnProperty.call(registry, type);
}

export function getRegisteredCalendarTypes(): CalendarType[] {
  return Object.keys(registry);
}

/**
 * Returns the calendar system for `type`, falling back to the Gregorian
 * calendar when `type` is omitted or not registered. The fallback guarantees
 * that consuming components never throw for an unknown `calendar` option.
 */
export function getCalendar(type?: CalendarType): CalendarSystem {
  if (type && registry[type]) {
    return registry[type];
  }

  return registry[DEFAULT_CALENDAR];
}

/**
 * Preferred first day of week for the calendar (0 = Sunday .. 6 = Saturday), or
 * `undefined` when the calendar has no preference (use the locale default).
 */
export function getCalendarFirstDayOfWeek(type?: CalendarType): number | undefined {
  return getCalendar(type).firstDayOfWeek;
}

/**
 * Preferred LDML display format for the calendar, or `undefined` when it has no
 * preference (use the locale default).
 */
export function getCalendarDefaultDateFormat(type?: CalendarType): string | undefined {
  return getCalendar(type).defaultDateFormat;
}

// --- shared conversion helpers ---------------------------------------------

/** Integer floor division. */
export function div(a: number, b: number): number {
  return Math.floor(a / b);
}

/** Mathematical modulo (always non-negative for positive `b`). */
export function mod(a: number, b: number): number {
  return a - Math.floor(a / b) * b;
}
