// Site-wide state. The URL query wins (so links are shareable), then the last
// choice saved in localStorage, then the defaults.
import { CALENDAR_ID_LIST, CalendarIds } from './constants/calendar-ids';
import { LANGUAGE_LIST, Languages } from './constants/languages';
import { QueryParams } from './constants/query-params';
import { StorageKeys } from './constants/storage-keys';
import { THEME_MODE_LIST, ThemeModes } from './constants/theme-modes';
import type { DemoState } from './demo-state';

type Listener = (next: DemoState, previous: DemoState) => void;

const DEFAULT_STATE: DemoState = {
  calendar: CalendarIds.gregorian,
  lang: Languages.en,
  theme: ThemeModes.dark,
};

const pick = <T extends string>(list: readonly T[], ...candidates: unknown[]): T | undefined => candidates
  .find((c): c is T => typeof c === 'string' && (list as readonly string[]).includes(c));

function readSaved(): Partial<DemoState> {
  try {
    return JSON.parse(window.localStorage.getItem(StorageKeys.state) ?? '{}') as Partial<DemoState>;
  } catch {
    return {};
  }
}

function readInitial(): DemoState {
  const query = new URLSearchParams(window.location.search);
  const saved = readSaved();
  return {
    calendar: pick(CALENDAR_ID_LIST, query.get(QueryParams.calendar), saved.calendar) ?? DEFAULT_STATE.calendar,
    lang: pick(LANGUAGE_LIST, query.get(QueryParams.lang), saved.lang) ?? DEFAULT_STATE.lang,
    theme: pick(THEME_MODE_LIST, query.get(QueryParams.theme), saved.theme) ?? DEFAULT_STATE.theme,
  };
}

let current = readInitial();
const listeners = new Set<Listener>();

export const getState = (): DemoState => current;

export function stateQuery(state: DemoState = current): string {
  const query = new URLSearchParams();
  query.set(QueryParams.calendar, state.calendar);
  query.set(QueryParams.lang, state.lang);
  query.set(QueryParams.theme, state.theme);
  return `?${query.toString()}`;
}

// Carries the current state onto an internal link.
export const withState = (href: string): string => `${href}${stateQuery()}`;

function persist(state: DemoState): void {
  try {
    window.localStorage.setItem(StorageKeys.state, JSON.stringify(state));
  } catch {
    // Private mode or blocked storage: the URL still carries the state.
  }
  window.history.replaceState(null, '', `${window.location.pathname}${stateQuery(state)}${window.location.hash}`);
}

export function setState(patch: Partial<DemoState>): void {
  const previous = current;
  const next = { ...current, ...patch };
  if (next.calendar === previous.calendar && next.lang === previous.lang && next.theme === previous.theme) return;
  current = next;
  persist(next);
  listeners.forEach((listener) => listener(next, previous));
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

persist(current);
