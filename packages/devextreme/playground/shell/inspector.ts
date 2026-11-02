// Renders the kit's key/value table into a card body.
import { toIsoDate, toIsoDateTime } from './date-info';
import { el } from './dom';
import type { InspectorRow } from './inspector-row';

// Dates print as local ISO; JSON.stringify would print UTC and shift the day.
function toPlain(value: unknown): unknown {
  if (value instanceof Date) {
    return value.getHours() || value.getMinutes() ? toIsoDateTime(value) : toIsoDate(value);
  }
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, toPlain(v)]));
  }
  return value;
}

export function renderInspector(container: HTMLElement, rows: InspectorRow[]): void {
  const table = el('dl', 'db-kv');
  rows.forEach((row) => {
    const value = el('dd', `db-kv__value${row.tone ? ` db-kv__value--${row.tone}` : ''}`, row.value, {
      dir: row.ltr ? 'ltr' : undefined,
    });
    table.append(el('dt', 'db-kv__key', row.label), value);
  });
  container.replaceChildren(table);
}

// Shows the options the page changed from the widget defaults, as code.
export function renderOptions(container: HTMLElement, options: Record<string, unknown>): void {
  const json = JSON.stringify(toPlain(options), (_key, value: unknown) => (
    typeof value === 'function' ? '[function]' : value
  ), 2);
  container.replaceChildren(el('pre', 'db-code', json, { dir: 'ltr' }));
}
