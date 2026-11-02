// The calendars the demo site offers. Umm al-Qura stays registered in the
// library but is not offered here.
export const CalendarIds = {
  gregorian: 'gregorian',
  persian: 'persian',
  hijri: 'hijri',
} as const;

export type CalendarId = typeof CalendarIds[keyof typeof CalendarIds];

export const CALENDAR_ID_LIST: readonly CalendarId[] = Object.values(CalendarIds);

// The in-picker calendar switcher. `calendarSwitcher: true` would list every
// registered calendar, Umm al-Qura included.
export const CALENDAR_SWITCHER = { items: [...CALENDAR_ID_LIST] };
