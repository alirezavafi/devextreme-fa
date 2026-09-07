import { describe, expect, it } from '@jest/globals';

import { getCaption, getCaptionInterval, getNextIntervalDate } from './utils';

describe('calendar-aware navigator caption', () => {
  it('renders a day-view caption in the persian calendar', () => {
    // 2024-03-20 == 1 Farvardin 1403
    const result = getCaption({
      date: new Date(2024, 2, 20),
      step: 'day',
      intervalCount: 1,
      skippedDays: [],
      calendar: 'persian',
    }, false);

    expect(result.text).toBe('1 Farvardin 1403');
  });

  it('leaves the gregorian caption unchanged', () => {
    const optionsBase = {
      date: new Date(2024, 2, 20),
      step: 'day' as const,
      intervalCount: 1,
      skippedDays: [],
    };

    const gregorian = getCaption({ ...optionsBase, calendar: 'gregorian' }, false);
    const noCalendar = getCaption(optionsBase, false);

    expect(gregorian.text).toBe(noCalendar.text);
  });

  it('renders a hijri day-view caption', () => {
    // 2024-07-07 tabular hijri == 30 Dhu al-Hijjah 1445
    const result = getCaption({
      date: new Date(2024, 6, 7),
      step: 'day',
      intervalCount: 1,
      skippedDays: [],
      calendar: 'hijri',
    }, false);

    expect(result.text).toBe('30 Dhu al-Hijjah 1445');
  });

  it('renders a month-view caption as a single persian month', () => {
    // currentDate 2024-04-10 is in Farvardin 1403; the month interval aligns to
    // the calendar month, so the caption is a single "Farvardin 1403".
    const result = getCaption({
      date: new Date(2024, 3, 10),
      step: 'month',
      intervalCount: 1,
      skippedDays: [],
      calendar: 'persian',
    }, false);

    expect(result.text).toBe('Farvardin 1403');
  });
});

describe('agenda hiddenWeekDays support in header utils', () => {
  const skippedDays: number[] = [0, 6];
  const options = {
    date: new Date(2026, 3, 11),
    step: 'agenda' as const,
    intervalCount: 1,
    agendaDuration: 3,
    skippedDays,
  };

  it('should build caption interval by calendar days', () => {
    expect(getCaptionInterval(options)).toEqual({
      startDate: new Date(2026, 3, 11),
      endDate: new Date(2026, 3, 13, 23, 59, 59, 999),
    });
  });

  it('should navigate to next agenda interval by calendar days', () => {
    expect(getNextIntervalDate(options, 1)).toEqual(new Date(2026, 3, 14));
  });

  it('should navigate to previous agenda interval by calendar days', () => {
    expect(getNextIntervalDate(options, -1)).toEqual(new Date(2026, 3, 8));
  });
});

describe('day hiddenWeekDays support in header utils', () => {
  it('should shift day caption to the next visible day', () => {
    expect(getCaptionInterval({
      date: new Date(2026, 3, 11), // Saturday
      step: 'day',
      intervalCount: 1,
      skippedDays: [0, 6],
    })).toEqual({
      startDate: new Date(2026, 3, 13),
      endDate: new Date(2026, 3, 13, 23, 59, 59, 999),
    });
  });

  it('should navigate to the next visible day interval', () => {
    expect(getNextIntervalDate({
      date: new Date(2026, 3, 10), // Friday
      step: 'day',
      intervalCount: 3,
      skippedDays: [0, 6],
    }, 1)).toEqual(new Date(2026, 3, 15));
  });

  it('should navigate from a hidden day based on the visible interval', () => {
    expect(getNextIntervalDate({
      date: new Date(2026, 3, 11), // Saturday
      step: 'day',
      intervalCount: 1,
      skippedDays: [0, 6],
    }, 1)).toEqual(new Date(2026, 3, 14));
  });
});

describe('week hiddenWeekDays support in header utils', () => {
  it('should keep Mon-Fri caption for weekend skippedDays', () => {
    expect(getCaptionInterval({
      date: new Date(2026, 3, 8), // Wednesday
      step: 'week',
      intervalCount: 1,
      skippedDays: [0, 6],
      firstDayOfWeek: 0,
    })).toEqual({
      startDate: new Date(2026, 3, 6),
      endDate: new Date(2026, 3, 10, 23, 59, 59, 999),
    });
  });

  it('should use full week caption when skippedDays override is empty', () => {
    expect(getCaptionInterval({
      date: new Date(2026, 3, 8), // Wednesday
      step: 'week',
      intervalCount: 1,
      skippedDays: [],
      firstDayOfWeek: 0,
    })).toEqual({
      startDate: new Date(2026, 3, 5),
      endDate: new Date(2026, 3, 11, 23, 59, 59, 999),
    });
  });

  it('should use first and last visible days for custom skippedDays', () => {
    expect(getCaptionInterval({
      date: new Date(2026, 3, 8), // Wednesday
      step: 'week',
      intervalCount: 1,
      skippedDays: [1, 2],
      firstDayOfWeek: 0,
    })).toEqual({
      startDate: new Date(2026, 3, 5),
      endDate: new Date(2026, 3, 11, 23, 59, 59, 999),
    });
  });
  it('should use first and last visible day for week caption', () => {
    expect(getCaptionInterval({
      date: new Date(2026, 3, 8), // Wednesday
      step: 'week',
      intervalCount: 1,
      skippedDays: [0, 1],
      firstDayOfWeek: 1, // Monday
    })).toEqual({
      startDate: new Date(2026, 3, 7),
      endDate: new Date(2026, 3, 11, 23, 59, 59, 999),
    });
  });
});
