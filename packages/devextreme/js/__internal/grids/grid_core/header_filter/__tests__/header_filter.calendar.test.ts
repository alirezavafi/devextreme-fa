/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';
import filterUtils from '@js/ui/shared/filtering';
import { getCalendar } from '@ts/core/localization/calendar';

import gridCoreUtils from '../../m_utils';

type GroupSelectors = ((data: unknown) => unknown)[];

// Column configured like a DataGrid date column with a Persian calendar.
const persianColumn = {
  dataField: 'start',
  dataType: 'date',
  format: { type: 'yyyy/MM/dd', calendar: 'persian' },
  calculateCellValue: (data: { start: Date }): Date => data.start,
  calculateFilterExpression: filterUtils.defaultCalculateFilterExpression,
};

const gregorianColumn = {
  dataField: 'start',
  dataType: 'date',
  calculateCellValue: (data: { start: Date }): Date => data.start,
  calculateFilterExpression: filterUtils.defaultCalculateFilterExpression,
};

describe('Header filter date tree — calendar-aware', () => {
  it('exposes getColumnCalendarType on the gridCoreUtils default export', () => {
    // Regression: m_header_filter.ts calls `gridCoreUtils.getColumnCalendarType`
    // via the default export object, not the named export.
    expect(typeof gridCoreUtils.getColumnCalendarType).toBe('function');
    expect(gridCoreUtils.getColumnCalendarType(persianColumn)).toBe('persian');
    expect(gridCoreUtils.getColumnCalendarType(gregorianColumn)).toBeUndefined();
  });

  describe('interval selectors group by calendar parts', () => {
    it('produces calendar year/month/day for the persian column', () => {
      const group = gridCoreUtils.getHeaderFilterGroupParameters(persianColumn) as GroupSelectors;
      // year/month/day selectors, bound to the column.
      const data = { start: new Date(2024, 2, 20) }; // 1 Farvardin 1403
      expect(group[0](data)).toBe(1403); // calendar year
      expect(group[1](data)).toBe(1); // calendar month (1-based) -> Farvardin
      expect(group[2](data)).toBe(1); // calendar day
    });

    it('keeps Gregorian parts for a column without a calendar', () => {
      const group = gridCoreUtils.getHeaderFilterGroupParameters(gregorianColumn) as GroupSelectors;
      const data = { start: new Date(2024, 2, 20) };
      expect(group[0](data)).toBe(2024);
      expect(group[1](data)).toBe(3); // March, 1-based
      expect(group[2](data)).toBe(20);
    });
  });

  describe('filter expression rebuilds the Gregorian range from calendar parts', () => {
    const persian = getCalendar('persian');

    it('builds a day range that matches the stored Gregorian date', () => {
      // Path "1403/1/1" selected in the tree (year/month/day, month 1-based).
      const filter = persianColumn.calculateFilterExpression.call(
        persianColumn,
        '1403/1/1',
        undefined,
        'headerFilter',
      ) as [[string, string, Date], string, [string, string, Date]];

      const start = filter[0][2];
      const end = filter[2][2];

      // 1 Farvardin 1403 == 2024-03-20; the day range is [2024-03-20, 2024-03-21).
      expect(start.getFullYear()).toBe(2024);
      expect(start.getMonth()).toBe(2);
      expect(start.getDate()).toBe(20);
      expect(end.getTime() - start.getTime()).toBe(24 * 60 * 60 * 1000);
    });

    it('builds a month range aligned to the calendar month', () => {
      // Path "1403/1" -> whole month of Farvardin 1403.
      const filter = persianColumn.calculateFilterExpression.call(
        persianColumn,
        '1403/1',
        undefined,
        'headerFilter',
      ) as [[string, string, Date], string, [string, string, Date]];

      const start = filter[0][2];
      const end = filter[2][2];

      expect(start.getTime()).toBe(persian.fromParts({ year: 1403, month: 0, day: 1 }).getTime());
      // Farvardin has 31 days, so the next month starts 31 days later.
      expect(end.getTime()).toBe(persian.fromParts({ year: 1403, month: 1, day: 1 }).getTime());
    });

    it('builds a year range aligned to the calendar year', () => {
      const filter = persianColumn.calculateFilterExpression.call(
        persianColumn,
        '1403',
        undefined,
        'headerFilter',
      ) as [[string, string, Date], string, [string, string, Date]];

      const start = filter[0][2];
      const end = filter[2][2];

      expect(start.getTime()).toBe(persian.fromParts({ year: 1403, month: 0, day: 1 }).getTime());
      expect(end.getTime()).toBe(persian.fromParts({ year: 1404, month: 0, day: 1 }).getTime());
    });

    it('leaves the Gregorian filter expression unchanged', () => {
      const filter = gregorianColumn.calculateFilterExpression.call(
        gregorianColumn,
        '2024/3/20',
        undefined,
        'headerFilter',
      ) as [[string, string, Date], string, [string, string, Date]];

      const start = filter[0][2];
      const end = filter[2][2];
      expect(start.getFullYear()).toBe(2024);
      expect(start.getMonth()).toBe(2);
      expect(start.getDate()).toBe(20);
      expect(end.getDate()).toBe(21);
    });
  });
});
