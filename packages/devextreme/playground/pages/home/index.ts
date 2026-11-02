import { CALENDAR_ID_LIST } from '../../shell/constants/calendar-ids';
import { Languages } from '../../shell/constants/languages';
import { PAGE_ID_LIST, Pages } from '../../shell/constants/pages';
import type { PageId } from '../../shell/constants/pages';
import { toIsoDate } from '../../shell/date-info';
import { el, requireElement } from '../../shell/dom';
import { formatDate } from '../../shell/format';
import { t } from '../../shell/i18n';
import { mountPage } from '../../shell/page';
import type { PageContext } from '../../shell/page-context';
import { withState } from '../../shell/state';
import en from './en.json';
import fa from './fa.json';

const HOME: PageId = 'home';

function renderToday(host: HTMLElement, { state }: PageContext): void {
  const now = new Date();
  host.replaceChildren(...CALENDAR_ID_LIST.map((id) => {
    const tile = el('section', `db-card db-today__tile${id === state.calendar ? ' db-today__tile--active' : ''}`);
    tile.append(
      el('div', 'db-mini-label', t(`calendar.${id}`)),
      el('div', 'db-today__date', formatDate(now, id)),
      el('div', 'db-today__iso', toIsoDate(now), { dir: 'ltr' }),
    );
    return tile;
  }));
}

function renderPages(host: HTMLElement): void {
  host.replaceChildren(...PAGE_ID_LIST.filter((id) => id !== HOME).map((id) => {
    const card = el('a', 'db-link-card', undefined, { href: withState(Pages[id].href) });
    card.append(
      el('span', 'db-link-card__title', t(Pages[id].labelKey)),
      el('span', 'db-link-card__text', t(Pages[id].summaryKey)),
    );
    return card;
  }));
}

mountPage({
  pageId: HOME,
  messages: { [Languages.en]: en, [Languages.fa]: fa },
  build: (context) => {
    renderToday(requireElement('#today'), context);
    renderPages(requireElement('#pages'));
  },
});
