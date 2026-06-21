import { describe, expect, it } from '@jest/globals';

import type { ViewType } from '../../types';
import { ViewDataGeneratorMonth } from './view_data_generator_month';

const toTuple = (date: Date): [number, number, number] => [
  date.getFullYear(), date.getMonth(), date.getDate(),
];

const baseOptions = {
  currentDate: new Date(2024, 3, 10), // 22 Farvardin 1403 (Persian)
  startDayHour: 0,
  endDayHour: 24,
  startDate: undefined,
  intervalCount: 1,
  firstDayOfWeek: 0, // Sunday
};

describe('ViewDataGeneratorMonth calendar-month alignment', () => {
  const makeGen = (): ViewDataGeneratorMonth => {
    const gen = new ViewDataGeneratorMonth('month' as ViewType);
    gen.skippedDays = [];
    return gen;
  };

  it('starts the grid on the persian month, aligned to the first day of week', () => {
    // Farvardin 1403 starts 2024-03-20 (Wed); Sunday-aligned grid starts 2024-03-17.
    const start = makeGen().getStartViewDate({ ...baseOptions, calendar: 'persian' });
    expect(toTuple(start)).toEqual([2024, 2, 17]);
  });

  it('leaves the gregorian grid start unchanged', () => {
    // April 2024 starts Mon 2024-04-01; Sunday-aligned grid starts 2024-03-31.
    const gregorian = makeGen().getStartViewDate({ ...baseOptions, calendar: 'gregorian' });
    const noCalendar = makeGen().getStartViewDate(baseOptions);

    expect(toTuple(gregorian)).toEqual([2024, 2, 31]);
    expect(toTuple(gregorian)).toEqual(toTuple(noCalendar));
  });

  it('computes a sensible row count for the persian month', () => {
    const rows = makeGen().getRowCount({ ...baseOptions, calendar: 'persian' });
    // Farvardin spans 5 aligned weeks for a Sunday start.
    expect(rows).toBeGreaterThanOrEqual(5);
    expect(rows).toBeLessThanOrEqual(6);
  });

  it('starts the grid on the hijri month', () => {
    // 1 Muharram 1446 (Umm al-Qura/tabular) is around 2024-07-07/08.
    const gen = makeGen();
    const start = gen.getStartViewDate({
      ...baseOptions,
      currentDate: new Date(2024, 6, 20), // mid Muharram 1446
      calendar: 'hijri',
    });
    // The grid start must be on/just before the first day of the hijri month
    // and on the first day of week (Sunday).
    expect(start.getDay()).toBe(0);
    expect(start.getTime()).toBeLessThanOrEqual(new Date(2024, 6, 8).getTime());
  });
});
