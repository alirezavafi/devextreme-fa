/* eslint-disable spellcheck/spell-checker */
import type { CalendarSystem, DateParts, MonthNameFormat } from './core';
import { mod } from './core';

/*
 * Hijri (Islamic) conversion.
 *
 * Uses the arithmetic / tabular Islamic calendar (civil epoch) implemented with
 * the classic Julian Day formulas. This is fully offline and deterministic.
 *
 * NOTE: the tabular calendar can differ by +/-1 day from the observational
 * Umm al-Qura calendar (`Intl` locale extension `-u-ca-islamic-umalqura`).
 * Month *names* below are stable; for exact Umm al-Qura day numbering a lookup
 * table or `Intl` should be layered on top in a future iteration.
 */

const ISLAMIC_EPOCH = 1948439.5;
const GREGORIAN_EPOCH = 1721425.5;

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

function isLeapIslamicYear(year: number): boolean {
  return ((year * 11) + 14) % 30 < 11;
}

function isLeapGregorianYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

// Adjustment applied when converting Gregorian dates after February.
function gregorianMonthOffset(year: number, month: number): number {
  if (month <= 2) {
    return 0;
  }
  return isLeapGregorianYear(year) ? -1 : -2;
}

// Leap-day adjustment used when reconstructing the Gregorian month from a Julian Day.
function gregorianLeapAdjustment(year: number): number {
  return isLeapGregorianYear(year) ? 1 : 2;
}

// Islamic (y, m 1-based, d) -> Julian Day.
function islamicToJd(year: number, month: number, day: number): number {
  return (day
    + Math.ceil(29.5 * (month - 1))
    + (year - 1) * 354
    + Math.floor((3 + 11 * year) / 30)
    + ISLAMIC_EPOCH) - 1;
}

// Julian Day -> Islamic (y, m 1-based, d).
function jdToIslamic(jdInput: number): { year: number; month: number; day: number } {
  const jd = Math.floor(jdInput) + 0.5;
  const year = Math.floor(((30 * (jd - ISLAMIC_EPOCH)) + 10646) / 10631);
  const month = Math.min(
    12,
    Math.ceil((jd - (29 + islamicToJd(year, 1, 1))) / 29.5) + 1,
  );
  const day = (jd - islamicToJd(year, month, 1)) + 1;
  return { year, month, day };
}

// Gregorian (y, m 1-based, d) -> Julian Day.
function gregorianToJd(year: number, month: number, day: number): number {
  return (GREGORIAN_EPOCH - 1)
    + 365 * (year - 1)
    + Math.floor((year - 1) / 4)
    - Math.floor((year - 1) / 100)
    + Math.floor((year - 1) / 400)
    + Math.floor((((367 * month) - 362) / 12)
      + gregorianMonthOffset(year, month)
      + day);
}

// Julian Day -> Gregorian (y, m 1-based, d).
function jdToGregorian(jd: number): { year: number; month: number; day: number } {
  const wjd = Math.floor(jd - 0.5) + 0.5;
  const depoch = wjd - GREGORIAN_EPOCH;
  const quadricent = Math.floor(depoch / 146097);
  const dqc = mod(depoch, 146097);
  const cent = Math.floor(dqc / 36524);
  const dcent = mod(dqc, 36524);
  const quad = Math.floor(dcent / 1461);
  const dquad = mod(dcent, 1461);
  const yindex = Math.floor(dquad / 365);
  let year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;
  if (!(cent === 4 || yindex === 4)) {
    year += 1;
  }
  const yearday = wjd - gregorianToJd(year, 1, 1);
  const leapadj = wjd < gregorianToJd(year, 3, 1)
    ? 0
    : gregorianLeapAdjustment(year);
  const month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);
  const day = (wjd - gregorianToJd(year, month, 1)) + 1;
  return { year, month, day };
}

function islamicMonthLength(year: number, month: number): number {
  if (month % 2 === 1) {
    return 30;
  }
  if (month === 12) {
    return isLeapIslamicYear(year) ? 30 : 29;
  }
  return 29;
}

const hijriCalendar: CalendarSystem = {
  type: 'hijri',

  // Islamic week conventionally starts on Saturday.
  firstDayOfWeek: 6,
  defaultDateFormat: 'yyyy/MM/dd',

  toParts(date: Date): DateParts {
    const jd = gregorianToJd(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const { year, month, day } = jdToIslamic(jd);
    return { year, month: month - 1, day };
  },

  fromParts(parts: DateParts): Date {
    const totalMonths = parts.year * 12 + parts.month;
    const year = Math.floor(totalMonths / 12);
    const month = mod(totalMonths, 12) + 1;
    const monthLength = islamicMonthLength(year, month);
    let { day } = parts;

    if (day < 1) {
      day = 1;
    } else if (day > monthLength) {
      day = monthLength;
    }

    const jd = islamicToJd(year, month, day);
    const { year: gy, month: gm, day: gd } = jdToGregorian(jd);
    return new Date(gy, gm - 1, gd);
  },

  getDaysInMonth(year: number, month: number): number {
    return islamicMonthLength(year, month + 1);
  },

  getMonthsInYear(): number {
    return 12;
  },

  isLeapYear(year: number): boolean {
    return isLeapIslamicYear(year);
  },

  getMonthNames(format: MonthNameFormat = 'wide', locale?: string): string[] {
    const localized = pickLocalizedMonthNames(locale);
    const table = localized ?? MONTH_NAMES;
    return [...(table[format] ?? table.wide)];
  },
};

export default hijriCalendar;
