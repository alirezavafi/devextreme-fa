/* eslint-disable spellcheck/spell-checker */
import { getCalendar } from '@ts/core/localization/calendar';

import type { ProcessorOptions, Rule } from './types';

/**
 * Calendar-aware recurrence for MONTHLY / YEARLY frequencies.
 *
 * The standard RRULE engine (`rrule` library) is Gregorian. Daily/weekly/hourly
 * recurrences are calendar-independent (a day/week is the same span in every
 * supported calendar), so only MONTHLY and YEARLY need calendar handling: a
 * monthly rule should recur on the same day of each *calendar* month, a yearly
 * rule on the same calendar month/day each *calendar* year.
 *
 * This generator handles the common cases (optional INTERVAL / COUNT / UNTIL /
 * a single positive BYMONTHDAY, and BYMONTH for yearly). For anything it cannot
 * represent (BYDAY, negative/multiple BYMONTHDAY, ...) it returns `null` so the
 * caller falls back to the Gregorian RRULE engine.
 */

const MAX_ITERATIONS = 10000;

const isCustomCalendar = (calendar?: string): boolean => !!calendar && calendar !== 'gregorian';

type CalendarSystem = ReturnType<typeof getCalendar>;

/**
 * Builds a concrete occurrence for the given calendar (year, month, day),
 * carrying over the time-of-day from `start`. Returns `null` when the day does
 * not exist in that calendar month or the occurrence falls before `start`.
 */
function evaluateOccurrence(
  calendarSystem: CalendarSystem,
  ctx: { year: number; month: number; day: number; start: Date },
): { occurrence: Date; time: number } | null {
  const daysInMonth = calendarSystem.getDaysInMonth(ctx.year, ctx.month);
  if (ctx.day > daysInMonth) {
    return null;
  }

  const occurrence = calendarSystem.fromParts({ year: ctx.year, month: ctx.month, day: ctx.day });
  occurrence.setHours(
    ctx.start.getHours(),
    ctx.start.getMinutes(),
    ctx.start.getSeconds(),
    ctx.start.getMilliseconds(),
  );

  const time = occurrence.getTime();
  if (time < ctx.start.getTime()) {
    return null;
  }

  return { occurrence, time };
}

const parseSinglePositiveInt = (value: string | undefined): number | null | undefined => {
  if (value === undefined) {
    return undefined;
  }
  const parts = value.split(',');
  if (parts.length !== 1) {
    return null;
  }
  const parsed = parseInt(parts[0], 10);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Returns the calendar-aware occurrence dates, or `null` if the rule is not a
 * calendar-handleable MONTHLY/YEARLY rule (caller should delegate to RRULE).
 */
export function generateCalendarRecurrenceDates(
  options: ProcessorOptions,
  rule: Rule,
): Date[] | null {
  const { calendar } = options;
  if (!isCustomCalendar(calendar)) {
    return null;
  }

  const freq = (rule.freq ?? '').toUpperCase();
  if (freq !== 'MONTHLY' && freq !== 'YEARLY') {
    return null;
  }

  // Complex rules are delegated to the Gregorian engine.
  if (rule.byday) {
    return null;
  }

  const byMonthDay = parseSinglePositiveInt(rule.bymonthday);
  if (byMonthDay === null || (byMonthDay !== undefined && byMonthDay < 1)) {
    return null;
  }

  const byMonth = parseSinglePositiveInt(rule.bymonth);
  if (byMonth === null) {
    return null;
  }
  // BYMONTH only has meaning for YEARLY here.
  if (freq === 'MONTHLY' && byMonth !== undefined) {
    return null;
  }

  const calendarSystem = getCalendar(calendar as string);
  const interval = rule.interval && rule.interval > 0 ? rule.interval : 1;
  const { start } = options;
  const startParts = calendarSystem.toParts(start);
  const day = byMonthDay ?? startParts.day;

  const until = rule.until ?? null;
  const { count } = rule;

  const duration = options.end ? options.end.getTime() - start.getTime() : 0;
  const minTime = options.min.getTime();
  const maxTime = options.max.getTime();

  const result: Date[] = [];
  let produced = 0;

  for (let i = 0; i < MAX_ITERATIONS; i += 1) {
    let year = 0;
    let month = 0;

    if (freq === 'MONTHLY') {
      const totalMonths = startParts.year * 12 + startParts.month + i * interval;
      year = Math.floor(totalMonths / 12);
      month = ((totalMonths % 12) + 12) % 12;
    } else {
      year = startParts.year + i * interval;
      month = byMonth !== undefined ? byMonth - 1 : startParts.month;
    }

    // Stop once the whole period is past the view range / UNTIL (when not bounded by COUNT).
    const periodStart = calendarSystem.fromParts({ year, month, day: 1 });
    if (count === undefined) {
      if (until && periodStart.getTime() > until.getTime()) {
        break;
      }
      if (!until && periodStart.getTime() > maxTime) {
        break;
      }
    }

    const evaluated = evaluateOccurrence(calendarSystem, {
      year, month, day, start,
    });
    if (evaluated) {
      const { occurrence, time } = evaluated;
      if (until && time > until.getTime()) {
        break;
      }

      produced += 1;
      if (count !== undefined && produced > count) {
        break;
      }

      if (time <= maxTime && time + duration >= minTime) {
        result.push(occurrence);
      }
    }
  }

  return result;
}
