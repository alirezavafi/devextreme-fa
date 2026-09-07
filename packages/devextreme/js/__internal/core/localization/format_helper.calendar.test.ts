import { describe, expect, it } from '@jest/globals';
import formatHelper from '@js/format_helper';

// format_helper.format is the path DataGrid/charts use to render cell values.
describe('format_helper.format with calendar', () => {
  const date = new Date(2024, 2, 20); // 1 Farvardin 1403

  it('formats a date cell in the persian calendar', () => {
    expect(formatHelper.format(date, { type: 'yyyy/MM/dd', calendar: 'persian' })).toBe('1403/01/01');
  });

  it('formats a preset date cell in the persian calendar', () => {
    expect(formatHelper.format(date, { type: 'shortdate', calendar: 'persian' })).toBe('1/1/1403');
  });

  it('formats a date cell in the hijri calendar', () => {
    expect(formatHelper.format(new Date(2024, 6, 7), { type: 'yyyy/MM/dd', calendar: 'hijri' })).toBe('1445/12/30');
  });

  it('leaves gregorian date cells unchanged', () => {
    const withCalendar = formatHelper.format(date, { type: 'shortdate', calendar: 'gregorian' });
    const withoutCalendar = formatHelper.format(date, { type: 'shortdate' });
    expect(withCalendar).toBe(withoutCalendar);
  });
});
