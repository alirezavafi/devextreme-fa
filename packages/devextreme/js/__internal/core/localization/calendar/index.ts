/* eslint-disable spellcheck/spell-checker */
import localizationCore from '@ts/core/localization/core';

import type {
  CalendarSystem, CalendarType, DateParts, MonthNameFormat,
} from './core';
import {
  getCalendar,
  getCalendarDefaultDateFormat,
  getCalendarFirstDayOfWeek,
  getRegisteredCalendarTypes,
  isCalendarRegistered,
  registerCalendar,
} from './core';
import gregorianCalendar from './gregorian';
import hijriCalendar from './hijri';
import persianCalendar from './persian';
import umalquraCalendar, { hasUmalquraIntl } from './umalqura';

registerCalendar(gregorianCalendar);
registerCalendar(persianCalendar);
registerCalendar(hijriCalendar);
if (hasUmalquraIntl()) {
  registerCalendar(umalquraCalendar);
}

/**
 * Returns the calendar's month names in the active DevExtreme locale (e.g.
 * Persian-script names when `locale('fa')` is active). Falls back to the
 * calendar's English transliteration when the active locale has no localized
 * table.
 */
function getCalendarMonthNamesInActiveLocale(
  type: CalendarType | undefined,
  format?: MonthNameFormat,
): string[] {
  const locale = localizationCore.locale() as string | undefined;
  return getCalendar(type).getMonthNames(format, locale);
}

export type {
  CalendarSystem, CalendarType, DateParts, MonthNameFormat,
};

export {
  getCalendar,
  getCalendarDefaultDateFormat,
  getCalendarFirstDayOfWeek,
  getCalendarMonthNamesInActiveLocale,
  getRegisteredCalendarTypes,
  isCalendarRegistered,
  registerCalendar,
};
