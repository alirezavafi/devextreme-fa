/* eslint-disable spellcheck/spell-checker */
// Registers the built-in calendar systems (gregorian/persian/hijri/umalqura).
import '@ts/core/localization/calendar';

import { describe, expect, it } from '@jest/globals';
import type { Field } from '@js/ui/filter_builder';

import { getCurrentValueText } from '../m_utils';

// June 23, 2024 is comfortably inside Persian year 1403 (Nowruz ~Mar 21),
// so the Persian calendar must render "1403" while Gregorian renders "2024".
const DATE = new Date(2024, 5, 23, 14, 30, 0);

describe('Calendar-aware value text', () => {
  it('Gregorian baseline (no calendar) is unchanged', () => {
    const field: Field = { dataType: 'date', format: 'shortDate' };

    expect(getCurrentValueText(field, DATE, null)).toBe('6/23/2024');
  });

  it('field.calendar shorthand renders the Persian year', () => {
    const field: Field = { dataType: 'date', format: 'shortDate', calendar: 'persian' };

    const text = getCurrentValueText(field, DATE, null) as string;
    expect(text).toContain('1403');
    expect(text).not.toContain('2024');
  });

  it('format object { type, calendar } renders the Persian year', () => {
    const field: Field = { dataType: 'date', format: { type: 'shortDate', calendar: 'persian' } as any };

    const text = getCurrentValueText(field, DATE, null) as string;
    expect(text).toContain('1403');
    expect(text).not.toContain('2024');
  });

  it("calendar: 'gregorian' is a no-op", () => {
    const field: Field = { dataType: 'date', format: 'shortDate', calendar: 'gregorian' };

    expect(getCurrentValueText(field, DATE, null)).toBe('6/23/2024');
  });

  it('datetime default format honors the calendar (date part only)', () => {
    const gregorian: Field = { dataType: 'datetime' };
    const persian: Field = { dataType: 'datetime', calendar: 'persian' };

    const gregorianText = getCurrentValueText(gregorian, DATE, null) as string;
    const persianText = getCurrentValueText(persian, DATE, null) as string;

    expect(gregorianText).toContain('2024');
    expect(persianText).toContain('1403');
    // Time-of-day is calendar-independent and must be preserved.
    expect(persianText).toContain('2:30');
  });

  it('string date value is parsed and rendered in the calendar', () => {
    const field: Field = { dataType: 'date', format: 'shortDate', calendar: 'persian' };

    const text = getCurrentValueText(field, '2024-06-23', null) as string;
    expect(text).toContain('1403');
  });
});
