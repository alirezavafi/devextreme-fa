// Kit-styled controls for a page's Actions card: labelled groups of buttons,
// segmented controls and switches. Plain HTML, so they match the UI kit exactly.
import { el } from './dom';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface SegmentItem<T extends string> {
  value: T;
  text: string;
}

export function actionGroup(container: HTMLElement, label: string): HTMLElement {
  const row = el('div', 'db-actions__row');
  container.append(el('div', 'db-mini-label', label), row);
  return row;
}

export function actionButton(
  row: HTMLElement,
  text: string,
  onClick: () => void,
  variant: ButtonVariant = 'secondary',
): HTMLButtonElement {
  const button = el('button', `db-btn db-btn--${variant}`, text, { type: 'button' });
  button.addEventListener('click', onClick);
  row.appendChild(button);
  return button;
}

export function actionSegmented<T extends string>(
  row: HTMLElement,
  label: string,
  items: SegmentItem<T>[],
  value: T,
  onChange: (value: T) => void,
): void {
  const group = el('div', 'db-seg', undefined, { role: 'group', 'aria-label': label });
  const buttons = items.map((item) => {
    const button = el('button', 'db-seg__item', item.text, {
      type: 'button', 'aria-pressed': String(item.value === value), 'data-value': item.value,
    });
    button.addEventListener('click', () => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      onChange(item.value);
    });
    return button;
  });
  group.append(...buttons);
  row.appendChild(group);
}

export function actionToggle(
  row: HTMLElement,
  text: string,
  checked: boolean,
  onChange: (checked: boolean) => void,
): void {
  const label = el('label', 'db-switch');
  const input = el('input', 'db-switch__input', undefined, { type: 'checkbox', role: 'switch' });
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  label.append(input, el('span', 'db-switch__track'), el('span', 'db-switch__text', text));
  row.appendChild(label);
}
