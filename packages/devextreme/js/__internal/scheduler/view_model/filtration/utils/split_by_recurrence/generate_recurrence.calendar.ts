/* eslint-disable spellcheck/spell-checker */
import { getCalendar } from '@ts/core/localization/calendar';

import { parseRecurrenceRule } from '../../../../recurrence/base';
import { parseByDayEntries } from '../../../../recurrence/byday_entries';

/**
 * Calendar-aware MONTHLY / YEARLY recurrence for the active filtration engine.
 *
 * Works in the same "pseudo-UTC" millisecond space as `generateRecurrenceUTCDates`
 * (dates are represented by their UTC fields), so it composes with the existing
 * timezone-offset handling.
 *
 * Handles within the selected calendar:
 *  - INTERVAL / COUNT / UNTIL,
 *  - BYMONTHDAY (single, multiple, and negative like -1 = last day of the calendar month),
 *  - BYDAY for MONTHLY and for YEARLY;BYMONTH (e.g. "1MO", "-1FR", "MO,WE"),
 *  - BYMONTH for YEARLY (single or multiple).
 *
 * Returns `null` for rules it cannot represent (e.g. YEARLY;BYDAY without BYMONTH,
 * unparseable values), letting the caller fall back to the Gregorian RRULE engine.
 */

const MAX_ITERATIONS = 10000;

interface YearMonthDay { year: number; month: number; day: number }

const isCustomCalendar = (calendar?: string): boolean => !!calendar && calendar !== 'gregorian';

// Parses a comma list of integers; returns undefined if absent, null if invalid.
const parseIntList = (value: string | undefined): number[] | null | undefined => {
  if (value === undefined) {
    return undefined;
  }
  const parts = value.split(',').map((part) => parseInt(part.trim(), 10));
  if (parts.some((value2) => Number.isNaN(value2))) {
    return null;
  }
  return parts;
};

const partsFromUtcMs = (ms: number, calendarType: string): YearMonthDay => {
  const date = new Date(ms);
  const proxy = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return getCalendar(calendarType).toParts(proxy);
};

interface CalendarRecurrenceParams {
  rule: string;
  calendar: string;
  startMs: number;
  minMs: number;
  maxMs: number;
}

export const generateCalendarRecurrenceTimestamps = (
  params: CalendarRecurrenceParams,
): number[] | null => {
  const {
    rule: ruleString, calendar, startMs, minMs, maxMs,
  } = params;

  if (!isCustomCalendar(calendar)) {
    return null;
  }

  const rule = parseRecurrenceRule(ruleString);
  const freq = (rule.freq ?? '').toUpperCase();
  if (freq !== 'MONTHLY' && freq !== 'YEARLY') {
    return null;
  }

  const byDayEntries = parseByDayEntries(rule.byday);
  if (rule.byday && byDayEntries === null) {
    return null; // unparseable BYDAY -> delegate
  }

  const byMonthDays = parseIntList(rule.bymonthday);
  if (byMonthDays === null || (byMonthDays?.some((value) => value === 0))) {
    return null;
  }

  const byMonths = parseIntList(rule.bymonth);
  if (byMonths === null) {
    return null;
  }
  if (freq === 'MONTHLY' && byMonths) {
    return null; // BYMONTH not handled for MONTHLY here -> delegate
  }
  // YEARLY;BYDAY without BYMONTH (nth weekday of the whole year) is rare -> delegate.
  if (freq === 'YEARLY' && byDayEntries && !byMonths) {
    return null;
  }

  const calendarSystem = getCalendar(calendar);
  const interval = rule.interval && rule.interval > 0 ? rule.interval : 1;

  const startParts = partsFromUtcMs(startMs, calendar);
  const fallbackDay = startParts.day;

  const startDate = new Date(startMs);
  const timeMs = startMs - Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  );

  const until = rule.until ? rule.until.getTime() : null;
  const { count } = rule;

  const toUtcMs = (year: number, month: number, dayOfMonth: number): number => {
    const gregorian = calendarSystem.fromParts({ year, month, day: dayOfMonth });
    return Date.UTC(
      gregorian.getFullYear(),
      gregorian.getMonth(),
      gregorian.getDate(),
    ) + timeMs;
  };

  // Calendar-day numbers (sorted) that match the rule within one calendar month.
  const getDaysForMonth = (year: number, month: number): number[] => {
    const daysInMonth = calendarSystem.getDaysInMonth(year, month);

    if (byDayEntries) {
      const days: number[] = [];
      byDayEntries.forEach((entry) => {
        const weekdayDays: number[] = [];
        for (let d = 1; d <= daysInMonth; d += 1) {
          if (new Date(toUtcMs(year, month, d)).getUTCDay() === entry.weekday) {
            weekdayDays.push(d);
          }
        }
        if (entry.ordinal === null) {
          days.push(...weekdayDays);
        } else if (entry.ordinal > 0) {
          const picked = weekdayDays[entry.ordinal - 1];
          if (picked !== undefined) { days.push(picked); }
        } else {
          const picked = weekdayDays[weekdayDays.length + entry.ordinal];
          if (picked !== undefined) { days.push(picked); }
        }
      });
      return [...new Set(days)].sort((a, b) => a - b);
    }

    if (byMonthDays) {
      const days = byMonthDays
        .map((value) => (value > 0 ? value : daysInMonth + value + 1))
        .filter((d) => d >= 1 && d <= daysInMonth);
      return [...new Set(days)].sort((a, b) => a - b);
    }

    return fallbackDay <= daysInMonth ? [fallbackDay] : [];
  };

  // (year, month) sub-periods for iteration step i.
  const getSubPeriods = (i: number): { year: number; month: number }[] => {
    if (freq === 'MONTHLY') {
      const totalMonths = startParts.year * 12 + startParts.month + i * interval;
      return [{
        year: Math.floor(totalMonths / 12),
        month: ((totalMonths % 12) + 12) % 12,
      }];
    }

    const year = startParts.year + i * interval;
    const months = byMonths ? byMonths.map((m) => m - 1) : [startParts.month];
    return months
      .filter((m) => m >= 0 && m <= 11)
      .map((month) => ({ year, month }));
  };

  const result: number[] = [];
  let produced = 0;

  // Emits matching occurrences from one sorted month list. Returns true when
  // iteration should stop (past UNTIL or COUNT reached).
  const collectOccurrences = (occurrenceMsList: number[]): boolean => {
    for (const occurrenceMs of occurrenceMsList) {
      if (occurrenceMs >= startMs) {
        if (until !== null && occurrenceMs > until) {
          return true;
        }

        produced += 1;
        if (count !== undefined && produced > count) {
          return true;
        }

        if (occurrenceMs >= minMs && occurrenceMs <= maxMs) {
          result.push(occurrenceMs);
        }
      }
    }
    return false;
  };

  for (let i = 0; i < MAX_ITERATIONS; i += 1) {
    const subPeriods = getSubPeriods(i);
    if (!subPeriods.length) {
      break;
    }

    const earliestPeriodMs = Math.min(...subPeriods.map((s) => toUtcMs(s.year, s.month, 1)));
    if (count === undefined) {
      if (until !== null && earliestPeriodMs > until) {
        break;
      }
      if (until === null && earliestPeriodMs > maxMs) {
        break;
      }
    }

    const occurrenceMsList: number[] = [];
    subPeriods.forEach((s) => {
      getDaysForMonth(s.year, s.month).forEach((d) => {
        occurrenceMsList.push(toUtcMs(s.year, s.month, d));
      });
    });
    occurrenceMsList.sort((a, b) => a - b);

    if (collectOccurrences(occurrenceMsList)) {
      break;
    }
  }

  return result;
};
