// Every user-facing string on the site comes from an en/fa dictionary: the
// shell's own (i18n/*.json) plus the one each page registers.
import { Languages } from './constants/languages';
import type { Language } from './constants/languages';
import en from './i18n/en.json';
import fa from './i18n/fa.json';
import { getState } from './state';

type Dictionary = Record<string, string>;

const dictionaries: Record<Language, Dictionary> = {
  [Languages.en]: { ...en },
  [Languages.fa]: { ...fa },
};

export function registerMessages(messages: Record<Language, Dictionary>): void {
  Object.assign(dictionaries[Languages.en], messages[Languages.en]);
  Object.assign(dictionaries[Languages.fa], messages[Languages.fa]);
}

// `{name}` placeholders are filled from `values`. A missing key renders as the
// key itself so it is visible on screen rather than silently blank.
export function t(key: string, values: Record<string, string | number> = {}): string {
  const text = dictionaries[getState().lang][key] ?? dictionaries[Languages.en][key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}

// Fills every [data-i18n] element under `root` from the active dictionary.
export function applyStaticTexts(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n ?? '');
  });
}
