/* eslint-disable spellcheck/spell-checker */

/**
 * Parses an RRULE BYDAY value into ordinal/weekday entries.
 *
 * Examples: "MO" -> [{ordinal:null, weekday:1}], "1MO" -> [{ordinal:1, weekday:1}],
 * "-1FR" -> [{ordinal:-1, weekday:5}], "MO,WE" -> two entries.
 *
 * Returns `null` for an empty/unparseable value.
 */

const WEEKDAY_MAP: Record<string, number> = {
  SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
};

export interface ByDayEntry {
  ordinal: number | null;
  weekday: number;
}

export const parseByDayEntries = (byday: string | undefined): ByDayEntry[] | null => {
  if (!byday) {
    return null;
  }

  const parts = byday.split(',');
  const entries: ByDayEntry[] = [];

  for (const part of parts) {
    const match = /^([+-]?\d+)?(SU|MO|TU|WE|TH|FR|SA)$/i.exec(part.trim());
    if (!match) {
      return null;
    }
    entries.push({
      ordinal: match[1] !== undefined ? parseInt(match[1], 10) : null,
      weekday: WEEKDAY_MAP[match[2].toUpperCase()],
    });
  }

  return entries.length ? entries : null;
};
