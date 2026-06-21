/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';
import { getCalendar } from '@ts/core/localization/calendar';

import {
  addCalendarYears,
  getCenturyViewCaption,
  getCenturyViewCellText,
  getCenturyViewFirstCellData,
  getCenturyViewNextCellData,
  getDecadeViewCaption,
  getDecadeViewCellText,
  getDecadeViewFirstCellData,
  getDecadeViewNextCellData,
  getFirstCalendarDecadeInCentury,
  getFirstCalendarYearInDecade,
  getYearViewCaption,
  getYearViewCellText,
  getYearViewFirstCellData,
  getYearViewNextCellData,
  isOtherCalendarCentury,
  isOtherCalendarDecade,
  isSameCalendarDecade,
  isSameCalendarMonthAndYear,
  isSameCalendarYear,
} from './calendar.views.calendar';

const persian = getCalendar('persian');
const yearOf = (date: Date): number => persian.toParts(date).year;
const monthOf = (date: Date): number => persian.toParts(date).month;

// 2024-03-20 == 1 Farvardin 1403
const DATE = new Date(2024, 2, 20);

describe('decade/century arithmetic', () => {
  it('finds the first year in a calendar decade', () => {
    expect(getFirstCalendarYearInDecade(1403)).toBe(1400);
    expect(getFirstCalendarYearInDecade(1409)).toBe(1400);
    expect(getFirstCalendarYearInDecade(1410)).toBe(1410);
  });

  it('finds the first decade in a calendar century', () => {
    expect(getFirstCalendarDecadeInCentury(1403)).toBe(1400);
    expect(getFirstCalendarDecadeInCentury(1499)).toBe(1400);
  });
});

describe('addCalendarYears', () => {
  it('moves by calendar years keeping the calendar month', () => {
    const next = addCalendarYears(DATE, 'persian', 5);
    expect(yearOf(next)).toBe(1408);
    expect(monthOf(next)).toBe(0);
  });
});

describe('year view', () => {
  it('starts at the first month of the calendar year', () => {
    const first = getYearViewFirstCellData(DATE, 'persian');
    expect(monthOf(first)).toBe(0);
    expect(yearOf(first)).toBe(1403);
  });

  it('steps month by month', () => {
    const first = getYearViewFirstCellData(DATE, 'persian');
    const second = getYearViewNextCellData(first, 'persian');
    expect(monthOf(second)).toBe(1);
  });

  it('labels cells with calendar month names', () => {
    expect(getYearViewCellText(DATE, 'persian')).toBe('Far');
  });

  it('captions with the calendar year', () => {
    expect(getYearViewCaption(DATE, 'persian')).toBe('1403');
  });

  it('detects same calendar month/year', () => {
    expect(isSameCalendarMonthAndYear(DATE, new Date(2024, 3, 1), 'persian')).toBe(true);
    expect(isSameCalendarMonthAndYear(DATE, new Date(2024, 3, 20), 'persian')).toBe(false);
  });
});

describe('decade view', () => {
  it('starts one year before the calendar decade', () => {
    const first = getDecadeViewFirstCellData(DATE, 'persian');
    expect(yearOf(first)).toBe(1399); // 1400 - 1
  });

  it('steps year by year', () => {
    const first = getDecadeViewFirstCellData(DATE, 'persian');
    const second = getDecadeViewNextCellData(first, 'persian');
    expect(yearOf(second)).toBe(1400);
  });

  it('labels cells with the calendar year and captions the decade', () => {
    expect(getDecadeViewCellText(DATE, 'persian')).toBe('1403');
    expect(getDecadeViewCaption(DATE, 'persian')).toBe('1400-1409');
  });

  it('detects same/other calendar decade', () => {
    expect(isSameCalendarDecade(DATE, addCalendarYears(DATE, 'persian', 5), 'persian')).toBe(true);
    expect(isOtherCalendarDecade(addCalendarYears(DATE, 'persian', 10), DATE, 'persian')).toBe(true);
    expect(isSameCalendarYear(DATE, new Date(2024, 5, 1), 'persian')).toBe(true);
  });
});

describe('century view', () => {
  it('starts one decade before the calendar century', () => {
    const first = getCenturyViewFirstCellData(DATE, 'persian');
    expect(yearOf(first)).toBe(1390); // 1400 - 10
  });

  it('steps decade by decade', () => {
    const first = getCenturyViewFirstCellData(DATE, 'persian');
    const second = getCenturyViewNextCellData(first, 'persian');
    expect(yearOf(second)).toBe(1400);
  });

  it('labels cells with the decade range and captions the century', () => {
    expect(getCenturyViewCellText(DATE, 'persian')).toBe('1400 - 1409');
    expect(getCenturyViewCaption(DATE, 'persian')).toBe('1400-1499');
  });

  it('detects other calendar century', () => {
    expect(isOtherCalendarCentury(addCalendarYears(DATE, 'persian', 100), DATE, 'persian')).toBe(true);
  });
});
