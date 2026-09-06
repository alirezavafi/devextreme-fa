import { describe, expect, it } from '@jest/globals';

import { DateFormatType, getDateText } from './get_date_text';

// 2024-03-20 == 1 Farvardin 1403 (Persian)
const START = new Date(2024, 2, 20, 9, 0);
const END = new Date(2024, 2, 20, 10, 0);

describe('getDateText with calendar', () => {
  it('renders the date part in the persian calendar (DATE)', () => {
    expect(getDateText(START, START, DateFormatType.DATE, 'persian')).toBe('Farvardin 1');
  });

  it('renders the date part in the persian calendar (DATETIME)', () => {
    const text = getDateText(START, END, DateFormatType.DATETIME, 'persian');
    expect(text.startsWith('Farvardin 1')).toBe(true);
  });

  it('leaves the time-only format unchanged (calendar-independent)', () => {
    expect(getDateText(START, END, DateFormatType.TIME, 'persian'))
      .toBe(getDateText(START, END, DateFormatType.TIME));
  });

  it('leaves gregorian unchanged', () => {
    expect(getDateText(START, START, DateFormatType.DATE, 'gregorian'))
      .toBe(getDateText(START, START, DateFormatType.DATE));
  });
});
