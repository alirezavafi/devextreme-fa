/* eslint-disable spellcheck/spell-checker */
import type { CalendarSystem, DateParts, MonthNameFormat } from './core';

/*
 * Persian (Jalali / Solar Hijri) conversion.
 *
 * The arithmetic algorithm is based on the work of Kazimierz M. Borkowski and
 * the `jalaali-js` library (MIT License). It is purely arithmetic, requires no
 * astronomical tables and is accurate for Jalaali years -61..3177.
 *
 * IMPORTANT: this algorithm requires integer division that truncates toward
 * zero (the original uses the `~~` operator), which differs from `Math.floor`
 * for negative operands. The local `div`/`mod` below preserve that semantics,
 * so they intentionally do not reuse the floor-based helpers in `./core`.
 */

function div(a: number, b: number): number {
  return Math.trunc(a / b);
}

function mod(a: number, b: number): number {
  return a - Math.trunc(a / b) * b;
}

const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210,
  1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178,
];

const MONTH_NAMES: Record<MonthNameFormat, string[]> = {
  wide: [
    'Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar',
    'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand',
  ],
  abbreviated: [
    'Far', 'Ord', 'Kho', 'Tir', 'Mor', 'Sha',
    'Meh', 'Aba', 'Aza', 'Dey', 'Bah', 'Esf',
  ],
  narrow: ['F', 'O', 'K', 'T', 'M', 'S', 'M', 'A', 'A', 'D', 'B', 'E'],
};

// Locale-specific month names. The base 'en' transliteration is used for any
// locale without an entry below (and for callers that don't supply a locale).
const LOCALIZED_MONTH_NAMES: Record<string, Record<MonthNameFormat, string[]>> = {
  fa: {
    wide: [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
    ],
    abbreviated: [
      'فرو', 'ارد', 'خرد', 'تیر', 'مرد', 'شهر',
      'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف',
    ],
    narrow: ['ف', 'ا', 'خ', 'ت', 'م', 'ش', 'م', 'آ', 'آ', 'د', 'ب', 'ا'],
  },
};

// Resolve `'fa-IR'` -> `'fa'` -> base. Returns null when no localized table exists.
function pickLocalizedMonthNames(locale?: string): Record<MonthNameFormat, string[]> | null {
  if (!locale) return null;
  if (LOCALIZED_MONTH_NAMES[locale]) return LOCALIZED_MONTH_NAMES[locale];
  const base = locale.split('-')[0];
  return LOCALIZED_MONTH_NAMES[base] ?? null;
}

interface JalCalResult {
  leap: number;
  gy: number;
  march: number;
}

// Gregorian (y, m 1-based, d) -> Julian Day Number.
function g2d(gy: number, gm: number, gd: number): number {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
    + div(153 * mod(gm + 9, 12) + 2, 5)
    + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

// Julian Day Number -> Gregorian (y, m 1-based, d).
function d2g(jdn: number): { gy: number; gm: number; gd: number } {
  let j = 4 * jdn + 139361631;
  j += div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function jalCal(jy: number, withoutLeap: boolean): JalCalResult {
  const bl = BREAKS.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];
  let jm = 0;
  let jump = 0;
  let leap = 0;
  let n = 0;

  if (jy < jp || jy >= BREAKS[bl - 1]) {
    throw new Error(`Invalid Jalaali year ${jy}`);
  }

  for (let i = 1; i < bl; i += 1) {
    jm = BREAKS[i];
    jump = jm - jp;
    if (jy < jm) {
      break;
    }
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  n = jy - jp;

  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) {
    leapJ += 1;
  }

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (!withoutLeap) {
    if (jump - n < 6) {
      n = n - jump + div(jump + 4, 33) * 33;
    }
    leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) {
      leap = 4;
    }
  }

  return { leap, gy, march };
}

function isLeapJalaaliYear(jy: number): boolean {
  return jalCal(jy, false).leap === 0;
}

function jalaaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) {
    return 31;
  }
  if (jm <= 11) {
    return 30;
  }
  return isLeapJalaaliYear(jy) ? 30 : 29;
}

// Jalaali (y, m 1-based, d) -> Julian Day Number.
function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy, true);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

// Julian Day Number -> Jalaali (y, m 1-based, d).
function d2j(jdn: number): { jy: number; jm: number; jd: number } {
  const { gy } = d2g(jdn);
  let jy = gy - 621;
  const r = jalCal(jy, false);
  const jdn1f = g2d(gy, 3, r.march);
  let jm = 0;
  let jd = 0;

  let k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + div(k, 31);
      jd = mod(k, 31) + 1;
      return { jy, jm, jd };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) {
      k += 1;
    }
  }
  jm = 7 + div(k, 30);
  jd = mod(k, 30) + 1;
  return { jy, jm, jd };
}

const persianCalendar: CalendarSystem = {
  type: 'persian',

  // Persian (Solar Hijri) week starts on Saturday; dates are written yyyy/MM/dd.
  firstDayOfWeek: 6,
  defaultDateFormat: 'yyyy/MM/dd',

  toParts(date: Date): DateParts {
    const jdn = g2d(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const { jy, jm, jd } = d2j(jdn);
    return { year: jy, month: jm - 1, day: jd };
  },

  fromParts(parts: DateParts): Date {
    // Normalize potential roll-over (e.g. month 12 -> next year, day 0 -> prev).
    const totalMonths = parts.year * 12 + parts.month;
    const jy = div(totalMonths, 12);
    const jm = mod(totalMonths, 12) + 1;
    const monthLength = jalaaliMonthLength(jy, jm);
    let jd = parts.day;

    // Clamp the day into the valid range for the (possibly normalized) month.
    if (jd < 1) {
      jd = 1;
    } else if (jd > monthLength) {
      jd = monthLength;
    }

    const jdn = j2d(jy, jm, jd);
    const { gy, gm, gd } = d2g(jdn);
    return new Date(gy, gm - 1, gd);
  },

  getDaysInMonth(year: number, month: number): number {
    return jalaaliMonthLength(year, month + 1);
  },

  getMonthsInYear(): number {
    return 12;
  },

  isLeapYear(year: number): boolean {
    return isLeapJalaaliYear(year);
  },

  getMonthNames(format: MonthNameFormat = 'wide', locale?: string): string[] {
    const localized = pickLocalizedMonthNames(locale);
    const table = localized ?? MONTH_NAMES;
    return [...(table[format] ?? table.wide)];
  },
};

export default persianCalendar;
