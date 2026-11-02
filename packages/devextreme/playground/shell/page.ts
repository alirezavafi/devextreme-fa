// Mounts a demo page: localization, theme, header and footer, then the page's
// build(). Any change of calendar, language or theme disposes the page's widgets
// and builds them again; the event log is kept.
import '../../js/__internal/integration/jquery';
import config from '../../js/core/config';
import { loadMessages, locale } from '../../js/localization';
import faMessages from '../../js/localization/messages/fa.json';
import { Languages } from './constants/languages';
import type { Language } from './constants/languages';
import type { PageId } from './constants/pages';
import { requireElement } from './dom';
import { EventLog } from './event-log';
import { renderFooter, renderHeader } from './header';
import { applyStaticTexts, registerMessages, t } from './i18n';
import type { PageContext } from './page-context';
import { getState, subscribe } from './state';
import { applyTheme } from './theme';
import { WidgetBag } from './widget-bag';
import './fonts.css';
import './shell.css';

type Build = (context: PageContext) => void;

interface MountOptions {
  pageId: PageId;
  messages: Record<Language, Record<string, string>>;
  build: Build;
}

function applyLanguage(lang: Language): void {
  const rtl = lang === Languages.fa;
  locale(lang);
  config({ rtlEnabled: rtl });
  document.documentElement.lang = lang;
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
}

function renderChrome(pageId: PageId): void {
  document.querySelector('.db-header')?.remove();
  document.querySelector('.db-footer')?.remove();
  document.body.prepend(renderHeader(pageId));
  document.body.append(renderFooter());
  applyStaticTexts();
}

export function mountPage({ pageId, messages, build }: MountOptions): void {
  loadMessages(faMessages as Record<string, Record<string, string>>);
  registerMessages(messages);
  applyLanguage(getState().lang);
  renderChrome(pageId);

  const logHost = document.querySelector<HTMLElement>('[data-db-log]');
  const log = new EventLog(logHost ?? document.createElement('section'));
  const widgets = new WidgetBag();
  let generation = 0;

  const rebuild = (): void => {
    widgets.dispose();
    build({
      state: getState(), rtl: getState().lang === Languages.fa, log, widgets, rebuild,
    });
  };

  const start = (themeReady: Promise<void>): void => {
    generation += 1;
    const mine = generation;
    themeReady
      .catch((error) => console.error(error))
      .then(() => {
        // A newer state change superseded this one while the theme loaded.
        if (mine === generation) rebuild();
      });
  };

  subscribe((next, previous) => {
    if (next.lang !== previous.lang) applyLanguage(next.lang);
    renderChrome(pageId);
    log.render();
    if (next.calendar !== previous.calendar) {
      log.log('calendar', `${t(`calendar.${previous.calendar}`)} → ${t(`calendar.${next.calendar}`)}`);
    }
    start(next.theme !== previous.theme ? applyTheme(next.theme) : Promise.resolve());
  });

  requireElement('main');
  start(applyTheme(getState().theme));
}
