import { describe, expect, it } from '@jest/globals';
import dateLocalization from '@js/common/core/localization/date';

// 2024-03-20 == 1 Farvardin 1403 (Persian)
const DATE = new Date(2024, 2, 20);

describe('dateLocalization.format with calendar', () => {
  it('formats a date in the persian calendar via a pattern', () => {
    expect(dateLocalization.format(DATE, { type: 'yyyy/MM/dd', calendar: 'persian' })).toBe('1403/01/01');
  });

  it('formats a preset (shortdate) in the persian calendar', () => {
    expect(dateLocalization.format(DATE, { type: 'shortdate', calendar: 'persian' })).toBe('1/1/1403');
  });

  it('formats with persian month names', () => {
    expect(dateLocalization.format(DATE, { type: 'MMMM yyyy', calendar: 'persian' })).toBe('Farvardin 1403');
  });

  it('formats a date in the hijri calendar', () => {
    expect(dateLocalization.format(new Date(2024, 6, 7), { type: 'yyyy/MM/dd', calendar: 'hijri' })).toBe('1445/12/30');
  });

  it('leaves gregorian formatting unchanged', () => {
    const withCalendar = dateLocalization.format(DATE, { type: 'shortdate', calendar: 'gregorian' });
    const withoutCalendar = dateLocalization.format(DATE, 'shortdate');
    expect(withCalendar).toBe(withoutCalendar);
  });
});

describe('dateLocalization.parse with calendar', () => {
  it('parses a persian date back to a Gregorian Date', () => {
    const result = dateLocalization.parse('1403/01/01', { type: 'yyyy/MM/dd', calendar: 'persian' }) as Date;
    expect(result).not.toBeNull();
    expect([result.getFullYear(), result.getMonth(), result.getDate()]).toEqual([2024, 2, 20]);
  });

  it('parses a persian preset (shortdate)', () => {
    const result = dateLocalization.parse('1/1/1403', { type: 'shortdate', calendar: 'persian' }) as Date;
    expect([result.getFullYear(), result.getMonth(), result.getDate()]).toEqual([2024, 2, 20]);
  });

  it('round-trips format then parse for persian', () => {
    const original = new Date(2023, 5, 15);
    const text = dateLocalization.format(original, { type: 'yyyy/MM/dd', calendar: 'persian' });
    const parsed = dateLocalization.parse(text as string, { type: 'yyyy/MM/dd', calendar: 'persian' }) as Date;
    expect([parsed.getFullYear(), parsed.getMonth(), parsed.getDate()])
      .toEqual([original.getFullYear(), original.getMonth(), original.getDate()]);
  });
});

describe('dateLocalization with calendar — date & time', () => {
  it('formats a persian date with the 24-hour time portion preserved', () => {
    const date = new Date(2024, 2, 20, 14, 30);
    expect(dateLocalization.format(date, { type: 'yyyy/MM/dd, HH:mm', calendar: 'persian' }))
      .toBe('1403/01/01, 14:30');
  });

  it('formats a persian date with the 12-hour AM/PM time portion preserved', () => {
    const date = new Date(2024, 2, 20, 14, 30);
    expect(dateLocalization.format(date, { type: 'yyyy/MM/dd, h:mm a', calendar: 'persian' }))
      .toBe('1403/01/01, 2:30 PM');
  });

  it('parses a persian date & 12-hour PM time back to the right Gregorian instant', () => {
    const result = dateLocalization.parse('1403/01/01, 2:30 PM', { type: 'yyyy/MM/dd, h:mm a', calendar: 'persian' }) as Date;
    expect(result).not.toBeNull();
    expect([
      result.getFullYear(), result.getMonth(), result.getDate(),
      result.getHours(), result.getMinutes(),
    ]).toEqual([2024, 2, 20, 14, 30]);
  });

  it('parses a persian date & 12-hour AM time (12 AM -> 0h)', () => {
    const result = dateLocalization.parse('1403/01/01, 12:15 AM', { type: 'yyyy/MM/dd, h:mm a', calendar: 'persian' }) as Date;
    expect([result.getHours(), result.getMinutes()]).toEqual([0, 15]);
  });

  it('round-trips a persian date & time (12-hour)', () => {
    const original = new Date(2023, 5, 15, 9, 5);
    const text = dateLocalization.format(original, { type: 'yyyy/MM/dd, h:mm a', calendar: 'persian' });
    const parsed = dateLocalization.parse(text as string, { type: 'yyyy/MM/dd, h:mm a', calendar: 'persian' }) as Date;
    expect([
      parsed.getFullYear(), parsed.getMonth(), parsed.getDate(),
      parsed.getHours(), parsed.getMinutes(),
    ]).toEqual([2023, 5, 15, 9, 5]);
  });
});
