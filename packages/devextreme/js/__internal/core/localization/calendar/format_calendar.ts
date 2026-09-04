/**
 * Merges a calendar selection into a DevExtreme date `format` so that
 * `dateLocalization.format(date, withCalendar)` (and `formatHelper.format`,
 * which delegates to it) renders the date in the chosen civil calendar.
 *
 * The stored value is unaffected — only the format object gains a `calendar`
 * field, which the localization layer already understands (see
 * `intl/date.ts` → `formatDateInCalendar`). This keeps every consumer
 * (chat day headers, chart axis labels, ...) calendar-aware with one guarded
 * transformation.
 *
 * Behaviour:
 * - `undefined`/`'gregorian'` calendar, or a nullish format → returned unchanged.
 * - function formatter → returned unchanged (a custom formatter owns its output).
 * - string format (e.g. `'shortdate'`, `'month'`) → `{ type, calendar }`.
 * - object format → a copy with `calendar` added (unless it already has one).
 */

import type { Format } from '@js/common/core/localization';

import type { CalendarType } from './core';

export function applyCalendarToFormat(
  format: Format | undefined,
  calendar: CalendarType | undefined,
): Format | undefined {
  if (!calendar || calendar === 'gregorian' || format === undefined || format === null) {
    return format;
  }
  if (typeof format === 'function') {
    return format;
  }
  if (typeof format === 'object') {
    return (format as { calendar?: unknown }).calendar
      ? format
      : { ...format, calendar } as Format;
  }
  return { type: format, calendar } as Format;
}
