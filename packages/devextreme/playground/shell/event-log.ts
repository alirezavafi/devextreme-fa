// The kit's "Output log": newest first, mono timestamps, survives page rebuilds.
import { el } from './dom';
import { t } from './i18n';

const MAX_ENTRIES = 50;

interface LogEntry {
  time: Date;
  name: string;
  detail: string;
}

export class EventLog {
  private readonly entries: LogEntry[] = [];

  private readonly body: HTMLElement;

  private readonly title: HTMLElement;

  private readonly clearButton: HTMLButtonElement;

  constructor(container: HTMLElement) {
    container.classList.add('db-card');
    const head = el('div', 'db-card__head');
    this.title = el('span', 'db-card__title');
    this.clearButton = el('button', 'db-btn db-btn--sm', undefined, { type: 'button' });
    this.clearButton.addEventListener('click', () => this.clear());
    head.append(this.title, el('span', 'db-spacer'), this.clearButton);
    this.body = el('div', 'db-log', undefined, { role: 'log', 'aria-live': 'polite' });
    container.replaceChildren(head, this.body);
    this.render();
  }

  // `name` is the DevExtreme event or option name, shown verbatim; `detail` is
  // composed by the page from localized text and values.
  log(name: string, detail = ''): void {
    this.entries.unshift({ time: new Date(), name, detail });
    this.entries.length = Math.min(this.entries.length, MAX_ENTRIES);
    this.render();
  }

  clear(): void {
    this.entries.length = 0;
    this.render();
  }

  render(): void {
    this.title.textContent = t('card.log');
    this.clearButton.textContent = t('log.clear');
    if (!this.entries.length) {
      this.body.replaceChildren(el('div', 'db-log__empty', t('log.empty')));
      return;
    }
    this.body.replaceChildren(...this.entries.map((entry) => {
      const line = el('div', 'db-log__line');
      line.append(
        el('span', 'db-log__time', entry.time.toTimeString().slice(0, 8), { dir: 'ltr' }),
        el('span', 'db-log__name', entry.name, { dir: 'ltr' }),
        el('bdi', 'db-log__detail', entry.detail),
      );
      return line;
    }));
  }
}
