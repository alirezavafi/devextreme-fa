/* eslint-disable spellcheck/spell-checker */
import '@ts/core/localization/calendar'; // registers persian/hijri

import { describe, expect, it } from '@jest/globals';

import Chat from './chat';

const ITEMS = [{ author: { id: 'u1' }, text: 'Hello', timestamp: new Date(2024, 2, 20) }];

function dayHeaderText(element: HTMLElement): string {
  return element.querySelector('.dx-chat-messagelist-day-header')?.textContent ?? '';
}

describe('dxChat calendar', () => {
  it('renders the day header in the selected calendar', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (Chat as any)(element, {
      items: ITEMS,
      user: { id: 'u1' },
      showDayHeaders: true,
      dayHeaderFormat: 'yyyy',
      calendar: 'persian',
    });

    const text = dayHeaderText(element);
    expect(text).toContain('1403'); // Persian year for 2024-03-20
    expect(text).not.toContain('2024');

    instance.dispose();
    document.body.removeChild(element);
  });

  it('keeps a Gregorian day header by default', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (Chat as any)(element, {
      items: ITEMS,
      user: { id: 'u1' },
      showDayHeaders: true,
      dayHeaderFormat: 'yyyy',
    });

    expect(dayHeaderText(element)).toContain('2024');

    instance.dispose();
    document.body.removeChild(element);
  });
});
