import {
  afterEach, describe, expect, it,
} from '@jest/globals';
import { locale } from '@ts/core/localization';
import DateBox from '@ts/ui/date_box/date_box';

describe('DateBox configured like a DataGrid inline date editor', () => {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let host: HTMLDivElement;

  afterEach(() => {
    locale('en');
    document.body.innerHTML = '';
  });

  const make = (opts: Record<string, unknown>): any => {
    document.body.innerHTML = '';
    host = document.createElement('div');
    document.body.appendChild(host);

    return new DateBox(host, opts);
  };

  it('renders the value in the selected calendar when the grid passes a format object as displayFormat', () => {
    locale('fa');

    // This mirrors what `prepareDateBox` builds for a column with
    // format: { type: 'shortdate', calendar: 'persian' }, editorOptions: { calendar: 'persian' }
    const dateBox = make({
      value: new Date(2024, 2, 20), // 1 Farvardin 1403
      type: 'date',
      displayFormat: { type: 'shortdate', calendar: 'persian' },
      calendar: 'persian',
      dateSerializationFormat: null,
    });

    const text = dateBox.option('text') as string;
    // The Persian year for 2024-03-20 is 1403. The displayed text must contain
    // the Persian-calendar year (1403 in Persian digits), NOT the Gregorian
    // year 2024 nor a "100 years off" year.
    const normalized = text.replace(/[\u06F0-\u06F9]/gu, (d) => String(d.charCodeAt(0) - 0x06F0));
    expect(normalized).toContain('1403');
    expect(normalized).not.toContain('2024');
  });

  it('round-trips typed text in the selected calendar (no 100-year drift)', () => {
    locale('fa');
    const dateBox = make({
      value: new Date(2024, 2, 20),
      type: 'date',
      displayFormat: { type: 'shortdate', calendar: 'persian' },
      calendar: 'persian',
      dateSerializationFormat: null,
    });

    const text = dateBox.option('text') as string;
    // Feed the displayed text back as input; the parsed Gregorian Date should
    // equal the original (year within 1 day).
    const parsed = (dateBox)._getParsedDate(text) as Date | undefined;
    expect(parsed).toBeInstanceOf(Date);
    expect(parsed?.getFullYear()).toBe(2024);
    expect(parsed?.getMonth()).toBe(2);
    expect(parsed?.getDate()).toBe(20);
  });
});
