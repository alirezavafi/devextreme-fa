import { describe, expect, it } from '@jest/globals';

import { getCellText } from './month';

describe('month-view getCellText with calendar', () => {
  it('shows the calendar month name on the first calendar day', () => {
    // 2024-03-20 == 1 Farvardin 1403
    expect(getCellText(new Date(2024, 2, 20), 1, 'persian')).toBe('Far 1');
  });

  it('shows a padded calendar day on other days', () => {
    // 2024-03-21 == 2 Farvardin 1403
    expect(getCellText(new Date(2024, 2, 21), 1, 'persian')).toBe('02');
  });

  it('shows the hijri month name on the first hijri day', () => {
    // 2024-07-08 tabular hijri == 1 Muharram 1446
    expect(getCellText(new Date(2024, 6, 8), 1, 'hijri')).toBe('Muh 1');
  });

  it('leaves gregorian cell text unchanged', () => {
    expect(getCellText(new Date(2024, 2, 1), 1)).toBe(getCellText(new Date(2024, 2, 1), 1, 'gregorian'));
    expect(getCellText(new Date(2024, 2, 15), 1)).toBe('15');
  });
});
