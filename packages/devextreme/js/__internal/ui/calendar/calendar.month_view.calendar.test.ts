/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';

import {
  addCalendarMonths,
  getCalendarCellText,
  getCalendarMonthCaption,
  getCalendarMonthsOffset,
  getFirstCalendarMonthDate,
  getLastCalendarMonthDate,
  getMonthViewFirstCellData,
  isOtherCalendarMonth,
  isSameCalendarMonth,
} from './calendar.month_view.calendar';

const toTuple = (date: Date): [number, number, number] => [
  date.getFullYear(), date.getMonth(), date.getDate(),
];

// 2024-03-20 == 1 Farvardin 1403 (Persian)
const PERSIAN_DATE = new Date(2024, 2, 20);

describe('month-view calendar helper - persian', () => {
  it('finds the first/last Gregorian date of the calendar month', () => {
    expect(toTuple(getFirstCalendarMonthDate(PERSIAN_DATE, 'persian'))).toEqual([2024, 2, 20]);
    // Farvardin has 31 days -> last day is 2024-04-19.
    expect(toTuple(getLastCalendarMonthDate(PERSIAN_DATE, 'persian'))).toEqual([2024, 3, 19]);
  });

  it('computes the first grid cell aligned to the first day of week', () => {
    // First of Farvardin 1403 is Wed 2024-03-20; with Sunday start the grid
    // begins on Sun 2024-03-17.
    const firstCell = getMonthViewFirstCellData(PERSIAN_DATE, 'persian', 0);
    expect(toTuple(firstCell)).toEqual([2024, 2, 17]);
    expect(firstCell.getDay()).toBe(0);
  });

  it('detects cells in another calendar month', () => {
    expect(isOtherCalendarMonth(new Date(2024, 2, 17), PERSIAN_DATE, 'persian')).toBe(true);
    expect(isOtherCalendarMonth(new Date(2024, 2, 25), PERSIAN_DATE, 'persian')).toBe(false);
  });

  it('renders the calendar day number as cell text', () => {
    expect(getCalendarCellText(PERSIAN_DATE, 'persian')).toBe('1');
    expect(getCalendarCellText(new Date(2024, 3, 19), 'persian')).toBe('31');
  });

  it('builds the navigator caption from calendar month and year', () => {
    expect(getCalendarMonthCaption(PERSIAN_DATE, 'persian')).toBe('Farvardin 1403');
  });

  it('navigates by calendar months, clamping the day', () => {
    expect(toTuple(addCalendarMonths(PERSIAN_DATE, 'persian', 1))).toEqual([2024, 3, 20]); // Ordibehesht 1
    expect(toTuple(addCalendarMonths(PERSIAN_DATE, 'persian', -1))).toEqual([2024, 1, 20]); // Esfand 1402
  });

  it('computes the offset in calendar months', () => {
    const next = addCalendarMonths(PERSIAN_DATE, 'persian', 3);
    expect(getCalendarMonthsOffset(PERSIAN_DATE, next, 'persian')).toBe(3);
  });

  it('checks same calendar month', () => {
    expect(isSameCalendarMonth(PERSIAN_DATE, new Date(2024, 3, 19), 'persian')).toBe(true);
    expect(isSameCalendarMonth(PERSIAN_DATE, new Date(2024, 3, 20), 'persian')).toBe(false);
  });

  it('uses the injected number formatter', () => {
    const toFa = (n: number): string => `#${n}`;
    expect(getCalendarCellText(PERSIAN_DATE, 'persian', toFa)).toBe('#1');
    expect(getCalendarMonthCaption(PERSIAN_DATE, 'persian', toFa)).toBe('Farvardin #1403');
  });
});

describe('month-view calendar helper - hijri', () => {
  // 2024-07-07 == 30 Dhu al-Hijjah 1445 (tabular)
  const hijriDate = new Date(2024, 6, 7);

  it('renders hijri cell text and caption', () => {
    expect(getCalendarCellText(hijriDate, 'hijri')).toBe('30');
    expect(getCalendarMonthCaption(hijriDate, 'hijri')).toBe('Dhu al-Hijjah 1445');
  });

  it('navigates hijri months', () => {
    const next = addCalendarMonths(hijriDate, 'hijri', 1);
    expect(isSameCalendarMonth(next, hijriDate, 'hijri')).toBe(false);
    expect(Number.isNaN(next.getTime())).toBe(false);
  });
});
