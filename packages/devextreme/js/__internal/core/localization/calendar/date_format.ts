/* eslint-disable spellcheck/spell-checker */
import localizationCore from '@ts/core/localization/core';
import { getFormatter as getLDMLDateFormatter } from '@ts/core/localization/ldml/date.formatter';
import type { LdlmDateLocalization } from '@ts/core/localization/ldml/date.parser';
import { getRegExpInfo } from '@ts/core/localization/ldml/date.parser';

import type { CalendarSystem, CalendarType } from './index';
import { getCalendar } from './index';

/**
 * Calendar-aware LDML formatting/parsing shared by the date-localization layer
 * and the DateBox mask.
 *
 * The stored value is always a Gregorian `Date`. We reuse the existing LDML
 * formatter/parser by formatting through a proxy date whose year/month/day
 * getters return the selected calendar's fields, and by supplying a `dateParts`
 * adapter that returns the calendar's month names.
 *
 * `baseDateParts` (the date-localization object) is injected so this module
 * stays free of the localization/CLDR import chain and remains unit-testable.
 */

type Format = 'abbreviated' | 'wide' | 'narrow' | 'short';

const MONTH_NAME_FORMATS: Record<Format, 'wide' | 'abbreviated' | 'narrow'> = {
  abbreviated: 'abbreviated',
  wide: 'wide',
  narrow: 'narrow',
  short: 'abbreviated',
};

/**
 * Builds a `dateParts` adapter that returns the calendar's month names while
 * delegating day/period/quarter names and the time separator to the base
 * (locale) date-parts object.
 */
export function createCalendarDateParts(
  calendar: CalendarSystem,
  baseDateParts: LdlmDateLocalization,
  locale?: string,
): LdlmDateLocalization {
  const effectiveLocale = locale ?? (localizationCore.locale() as string | undefined);
  return {
    getMonthNames: (format: Format): string[] => calendar
      .getMonthNames(MONTH_NAME_FORMATS[format] ?? 'wide', effectiveLocale),
    getDayNames: (format, type?: string): string[] => baseDateParts.getDayNames(format, type),
    getQuarterNames: (format, type?: string): string[] => baseDateParts
      .getQuarterNames(format, type),
    getPeriodNames: (format, type?: string): string[] => baseDateParts
      .getPeriodNames(format, type),
    getTimeSeparator: (): string => baseDateParts.getTimeSeparator?.() ?? ':',
  };
}

/**
 * Wraps a Gregorian `Date` so the year/month/day getters return the calendar
 * fields. All other methods delegate to the real date. The result is consumed
 * only by the LDML formatter, so we cast it to `Date`.
 */
export function createCalendarDateProxy(date: Date, calendar: CalendarSystem): Date {
  const parts = calendar.toParts(date);

  const proxy = {
    getFullYear: (): number => parts.year,
    getUTCFullYear: (): number => parts.year,
    getMonth: (): number => parts.month,
    getUTCMonth: (): number => parts.month,
    getDate: (): number => parts.day,
    getUTCDate: (): number => parts.day,
    getDay: (): number => date.getDay(),
    getUTCDay: (): number => date.getUTCDay(),
    getHours: (): number => date.getHours(),
    getUTCHours: (): number => date.getUTCHours(),
    getMinutes: (): number => date.getMinutes(),
    getUTCMinutes: (): number => date.getUTCMinutes(),
    getSeconds: (): number => date.getSeconds(),
    getUTCSeconds: (): number => date.getUTCSeconds(),
    getMilliseconds: (): number => date.getMilliseconds(),
    getUTCMilliseconds: (): number => date.getUTCMilliseconds(),
    getTimezoneOffset: (): number => date.getTimezoneOffset(),
  };

  return proxy as unknown as Date;
}

/** Formats a Gregorian `Date` into text using the selected calendar. */
export function formatDateInCalendar(
  date: Date,
  calendarType: CalendarType,
  pattern: string,
  baseDateParts: LdlmDateLocalization,
): string {
  const calendar = getCalendar(calendarType);
  const dateParts = createCalendarDateParts(calendar, baseDateParts);
  const proxy = createCalendarDateProxy(date, calendar);

  return getLDMLDateFormatter(pattern, dateParts)(proxy) as string;
}

/**
 * Parses calendar-formatted text into a Gregorian `Date`.
 * Returns null when the text does not match the pattern.
 */
export function parseDateInCalendar(
  text: string,
  calendarType: CalendarType,
  pattern: string,
  baseDateParts: LdlmDateLocalization,
  referenceDate: Date = new Date(),
): Date | null {
  const calendar = getCalendar(calendarType);
  const dateParts = createCalendarDateParts(calendar, baseDateParts);
  const regExpInfo = getRegExpInfo(pattern, dateParts);
  const match = regExpInfo.regexp.exec(text);

  if (!match) {
    return null;
  }

  const effectiveLocale = localizationCore.locale() as string | undefined;
  const base = calendar.toParts(referenceDate);
  let { year } = base;
  let { month } = base;
  let { day } = base;
  let hours = referenceDate.getHours();
  let minutes = referenceDate.getMinutes();
  let seconds = referenceDate.getSeconds();
  // 12-hour parsing state: the raw hour and the AM/PM period are applied
  // together after the loop, since either token can appear first.
  let is12HourClock = false;
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let period: number | undefined;

  regExpInfo.patterns.forEach((rawPattern, index) => {
    const partText = match[index + 1];
    const char = rawPattern.replace(/^'|'$/g, '')[0];
    const numeric = parseInt(partText, 10);

    switch (char) {
      case 'y':
        year = numeric;
        break;
      case 'M':
      case 'L': {
        const names = calendar.getMonthNames(rawPattern.length > 2 ? 'wide' : 'abbreviated', effectiveLocale);
        const nameIndex = names
          .map((name) => name.toLowerCase())
          .indexOf(partText.toLowerCase());
        month = nameIndex >= 0 ? nameIndex : numeric - 1;
        break;
      }
      case 'd':
        day = numeric;
        break;
      case 'h':
        hours = numeric;
        is12HourClock = true;
        break;
      case 'H':
        hours = numeric;
        break;
      case 'm':
        minutes = numeric;
        break;
      case 's':
        seconds = numeric;
        break;
      case 'a': {
        const periodNames = dateParts.getPeriodNames('abbreviated', 'format');
        const periodIndex = periodNames
          .map((name) => name.toLowerCase())
          .indexOf(partText.toLowerCase());
        if (periodIndex >= 0) {
          period = periodIndex;
        }
        break;
      }
      default:
        break;
    }
  });

  // Resolve the 12-hour clock against the parsed AM/PM marker (AM 12 -> 0,
  // PM 1..11 -> 13..23). When no period token is present, the hour is used as-is.
  if (is12HourClock && period !== undefined) {
    if (period === 0 && hours === 12) {
      hours = 0;
    } else if (period === 1 && hours !== 12) {
      hours += 12;
    }
  }

  if ([year, month, day].some((part) => Number.isNaN(part))) {
    return null;
  }

  const result = calendar.fromParts({ year, month, day });
  result.setHours(hours, minutes, seconds, 0);
  return result;
}
