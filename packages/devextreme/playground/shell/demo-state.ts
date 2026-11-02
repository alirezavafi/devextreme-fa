import type { CalendarId } from './constants/calendar-ids';
import type { Language } from './constants/languages';
import type { ThemeMode } from './constants/theme-modes';

// The site-wide choices the header controls; every page rebuilds from it.
export interface DemoState {
  calendar: CalendarId;
  lang: Language;
  theme: ThemeMode;
}
