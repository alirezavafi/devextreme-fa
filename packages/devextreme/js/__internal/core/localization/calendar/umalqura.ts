/* eslint-disable spellcheck/spell-checker */
import type { CalendarSystem, DateParts, MonthNameFormat } from './core';

/*
 * Umm al-Qura (observational Hijri) calendar.
 *
 * Day numbering follows the Saudi Umm al-Qura calendar via `Intl`
 * (`-u-ca-islamic-umalqura`), which can differ by +/-1 day from the arithmetic
 * `hijri` calendar. The Gregorian conversion is exact (uses the platform ICU
 * data); the inverse (`fromParts`) is a monotonic binary search.
 *
 * Requires `Intl` with Umm al-Qura support (all evergreen engines / Node ICU).
 * If unavailable, callers should fall back to the arithmetic `hijri` calendar.
 */

const MONTH_NAMES: Record<MonthNameFormat, string[]> = {
  wide: [
    'Muharram', 'Safar', "Rabi' al-awwal", "Rabi' al-thani",
    'Jumada al-awwal', 'Jumada al-thani', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
  ],
  abbreviated: [
    'Muh', 'Saf', 'Rb1', 'Rb2', 'Jm1', 'Jm2',
    'Raj', 'Shb', 'Ram', 'Shw', 'DhQ', 'DhH',
  ],
  narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
};

const LOCALIZED_MONTH_NAMES: Record<string, Record<MonthNameFormat, string[]>> = {
  ar: {
    wide: [
      'مُحَرَّم', 'صَفَر', 'رَبيع الأوّل', 'رَبيع الثاني',
      'جُمادى الأولى', 'جُمادى الآخرة', 'رَجَب', 'شَعْبان',
      'رَمَضان', 'شَوّال', 'ذو القعدة', 'ذو الحجة',
    ],
    abbreviated: [
      'مح', 'صف', 'رب١', 'رب٢', 'جم١', 'جم٢',
      'رج', 'شع', 'رم', 'شو', 'ذق', 'ذح',
    ],
    narrow: ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١', '١٢'],
  },
  fa: {
    wide: [
      'محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی',
      'جمادی‌الاول', 'جمادی‌الثانی', 'رجب', 'شعبان',
      'رمضان', 'شوال', 'ذیقعده', 'ذیحجه',
    ],
    abbreviated: [
      'مح', 'صف', 'رب۱', 'رب۲', 'جم۱', 'جم۲',
      'رج', 'شع', 'رم', 'شو', 'ذق', 'ذح',
    ],
    narrow: ['۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '۱۰', '۱۱', '۱۲'],
  },
};

function pickLocalizedMonthNames(locale?: string): Record<MonthNameFormat, string[]> | null {
  if (!locale) return null;
  if (LOCALIZED_MONTH_NAMES[locale]) return LOCALIZED_MONTH_NAMES[locale];
  const base = locale.split('-')[0];
  return LOCALIZED_MONTH_NAMES[base] ?? null;
}

const DAY_MS = 86400000;

const hasUmalquraIntl = (): boolean => {
  try {
    return typeof Intl !== 'undefined'
      && Intl.DateTimeFormat.supportedLocalesOf('en-u-ca-islamic-umalqura').length > 0;
  } catch {
    return false;
  }
};

// eslint-disable-next-line @typescript-eslint/init-declarations
let formatter: Intl.DateTimeFormat | undefined;
const getFormatter = (): Intl.DateTimeFormat => {
  formatter ??= new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return formatter;
};

// Parts (zero-based month) for the UTC instant at noon of `utcMs`.
function partsFromUtc(utcMs: number): DateParts {
  const result = getFormatter().formatToParts(new Date(utcMs));
  let year = 0;
  let month = 1;
  let day = 1;

  result.forEach((part) => {
    const value = parseInt(part.value, 10);
    if (part.type === 'year') { year = value; }
    if (part.type === 'month') { month = value; }
    if (part.type === 'day') { day = value; }
  });

  return { year, month: month - 1, day };
}

// Monotonic sort key for (year, month, day).
const partsKey = (parts: DateParts): number => (parts.year * 12 + parts.month) * 32 + parts.day;

// Day index (days since Unix epoch) -> UTC noon milliseconds.
const dayToUtcNoon = (dayIndex: number): number => dayIndex * DAY_MS + DAY_MS / 2;

function dateToLocal(dayIndex: number): Date {
  const utc = new Date(dayToUtcNoon(dayIndex));
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

// Binary search for the day index whose Umm al-Qura parts match `target`.
function findDayIndex(target: DateParts): number {
  const targetKey = partsKey(target);
  // Search bounds: ~622 CE .. ~2200 CE in day indices.
  let lo = Math.floor(Date.UTC(700, 0, 1) / DAY_MS);
  let hi = Math.floor(Date.UTC(2200, 0, 1) / DAY_MS);

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const key = partsKey(partsFromUtc(dayToUtcNoon(mid)));
    if (key < targetKey) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  return lo;
}

function getDaysInMonth(year: number, month: number): number {
  const first = findDayIndex({ year, month, day: 1 });
  const nextMonth = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
  const next = findDayIndex({ ...nextMonth, day: 1 });
  return next - first;
}

const umalquraCalendar: CalendarSystem = {
  type: 'hijri-umalqura',

  // Islamic week conventionally starts on Saturday.
  firstDayOfWeek: 6,
  defaultDateFormat: 'yyyy/MM/dd',

  toParts(date: Date): DateParts {
    const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12);
    return partsFromUtc(utc);
  },

  fromParts(parts: DateParts): Date {
    const totalMonths = parts.year * 12 + parts.month;
    const year = Math.floor(totalMonths / 12);
    const month = ((totalMonths % 12) + 12) % 12;
    const monthLength = getDaysInMonth(year, month);
    let { day } = parts;

    if (day < 1) {
      day = 1;
    } else if (day > monthLength) {
      day = monthLength;
    }

    return dateToLocal(findDayIndex({ year, month, day }));
  },

  getDaysInMonth(year: number, month: number): number {
    return getDaysInMonth(year, month);
  },

  getMonthsInYear(): number {
    return 12;
  },

  isLeapYear(year: number): boolean {
    // Umm al-Qura common years have 354 days, leap years 355.
    let total = 0;
    for (let month = 0; month < 12; month += 1) {
      total += getDaysInMonth(year, month);
    }
    return total === 355;
  },

  getMonthNames(format: MonthNameFormat = 'wide', locale?: string): string[] {
    const localized = pickLocalizedMonthNames(locale);
    const table = localized ?? MONTH_NAMES;
    return [...(table[format] ?? table.wide)];
  },
};

export { hasUmalquraIntl };
export default umalquraCalendar;
