import { describe, expect, it } from '@jest/globals';

import { parseByDayEntries } from './byday_entries';

describe('parseByDayEntries', () => {
  it('returns null for empty/undefined', () => {
    expect(parseByDayEntries(undefined)).toBeNull();
    expect(parseByDayEntries('')).toBeNull();
  });

  it('parses a plain weekday', () => {
    expect(parseByDayEntries('MO')).toEqual([{ ordinal: null, weekday: 1 }]);
  });

  it('parses a positive ordinal', () => {
    expect(parseByDayEntries('1MO')).toEqual([{ ordinal: 1, weekday: 1 }]);
    expect(parseByDayEntries('2WE')).toEqual([{ ordinal: 2, weekday: 3 }]);
  });

  it('parses a negative ordinal', () => {
    expect(parseByDayEntries('-1FR')).toEqual([{ ordinal: -1, weekday: 5 }]);
  });

  it('parses multiple entries', () => {
    expect(parseByDayEntries('MO,WE,FR')).toEqual([
      { ordinal: null, weekday: 1 },
      { ordinal: null, weekday: 3 },
      { ordinal: null, weekday: 5 },
    ]);
  });

  it('returns null for an invalid value', () => {
    expect(parseByDayEntries('XX')).toBeNull();
    expect(parseByDayEntries('MO,XX')).toBeNull();
  });
});
