// The DevBox header: `devbox / devextreme`, the site-wide calendar, language and
// theme controls, and the page nav.
import { CALENDAR_ID_LIST } from './constants/calendar-ids';
import { LANGUAGE_LIST } from './constants/languages';
import { PAGE_ID_LIST, Pages } from './constants/pages';
import type { PageId } from './constants/pages';
import { ThemeModes } from './constants/theme-modes';
import { el } from './dom';
import { t } from './i18n';
import { getState, setState, withState } from './state';

function segmented<T extends string>(
  label: string,
  values: readonly T[],
  active: T,
  textOf: (value: T) => string,
  onPick: (value: T) => void,
): HTMLElement {
  const group = el('div', 'db-seg', undefined, { role: 'group', 'aria-label': label });
  values.forEach((value) => {
    const button = el('button', 'db-seg__item', textOf(value), {
      type: 'button',
      'aria-pressed': String(value === active),
      'data-value': value,
    });
    button.addEventListener('click', () => onPick(value));
    group.appendChild(button);
  });
  return group;
}

export function renderHeader(pageId: PageId): HTMLElement {
  const state = getState();
  const header = el('header', 'db-header');

  const bar = el('div', 'db-header__bar db-container');
  const brand = el('a', 'db-brand', undefined, { href: withState(Pages.home.href) });
  brand.append(
    el('span', 'db-brand__name', 'devbox'),
    el('span', 'db-brand__slash', '/'),
    el('span', 'db-brand__tool', t('brand.tool')),
  );

  const controls = el('div', 'db-header__controls');
  controls.append(
    segmented(t('controls.calendar'), CALENDAR_ID_LIST, state.calendar, (id) => t(`calendar.${id}`), (calendar) => setState({ calendar })),
    segmented(t('controls.language'), LANGUAGE_LIST, state.lang, (lang) => t(`language.${lang}`), (lang) => setState({ lang })),
  );

  const nextTheme = state.theme === ThemeModes.dark ? ThemeModes.light : ThemeModes.dark;
  const themeLabel = t(`controls.theme.${nextTheme}`);
  const themeToggle = el('button', 'db-icon-btn', state.theme === ThemeModes.dark ? '☀' : '☾', {
    type: 'button', title: themeLabel, 'aria-label': themeLabel,
  });
  themeToggle.addEventListener('click', () => setState({ theme: nextTheme }));
  controls.appendChild(themeToggle);

  bar.append(brand, el('span', 'db-spacer'), controls);

  const nav = el('nav', 'db-nav db-container', undefined, { 'aria-label': t('nav.label') });
  PAGE_ID_LIST.forEach((id) => {
    nav.appendChild(el('a', 'db-nav__link', t(Pages[id].labelKey), {
      href: withState(Pages[id].href),
      'aria-current': id === pageId ? 'page' : undefined,
    }));
  });

  header.append(bar, nav);
  return header;
}

export function renderFooter(): HTMLElement {
  const footer = el('footer', 'db-footer db-container');
  const source = el('a', undefined, 'github.com/alirezavafi/devextreme-fa', {
    href: 'https://github.com/alirezavafi/devextreme-fa', dir: 'ltr',
  });
  footer.append(el('span', undefined, t('footer.note')), source);
  return footer;
}
