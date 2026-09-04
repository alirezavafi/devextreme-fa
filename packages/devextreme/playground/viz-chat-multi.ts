import '../js/__internal/integration/jquery';
import '../js/ui/select_box';
import '../js/viz/chart';
import '../js/ui/chat';

import $ from 'jquery';

// Importing the calendar registry registers persian/hijri so the chart axis
// labels and chat day headers can render in them.
import '../js/common/core/localization/calendar';
import { locale, loadMessages } from '../js/localization';
import faMessages from '../js/localization/messages/fa.json';
import { setupThemeSelector } from './themeSelector.ts';

// Monthly time series across 2024 (stored as Gregorian Dates).
const chartData = [
  { date: new Date(2024, 0, 1), value: 30 },
  { date: new Date(2024, 1, 1), value: 45 },
  { date: new Date(2024, 2, 1), value: 38 },
  { date: new Date(2024, 3, 1), value: 52 },
  { date: new Date(2024, 4, 1), value: 60 },
  { date: new Date(2024, 5, 1), value: 48 },
];

const chatItems = [
  { author: { id: 'u1', name: 'Sara' }, text: 'Kickoff done.', timestamp: new Date(2024, 2, 20, 9, 5) },
  { author: { id: 'me' }, text: 'Great, starting design.', timestamp: new Date(2024, 2, 20, 9, 7) },
  { author: { id: 'u1', name: 'Sara' }, text: 'Wireframes ready.', timestamp: new Date(2024, 3, 10, 14, 30) },
];

const calendarItems = [
  { id: 'gregorian', text: 'Gregorian' },
  { id: 'persian', text: 'Persian (Jalali)' },
  { id: 'hijri', text: 'Hijri (tabular)' },
];

const languageItems = [
  { id: 'en', text: 'English' },
  { id: 'fa', text: 'فارسی (Persian, RTL)' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chart = (): any => ($('#chart') as any).dxChart('instance');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chat = (): any => ($('#chat') as any).dxChat('instance');

setupThemeSelector('theme-selector').then(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ($('#chart') as any).dxChart({
    dataSource: chartData,
    series: [{ argumentField: 'date', valueField: 'value', type: 'line' }],
    legend: { visible: false },
    argumentAxis: {
      argumentType: 'datetime',
      tickInterval: { months: 1 },
      label: { calendar: 'gregorian', format: 'month' },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ($('#chat') as any).dxChat({
    items: chatItems,
    user: { id: 'me' },
    showDayHeaders: true,
    dayHeaderFormat: 'monthAndDay',
    calendar: 'gregorian',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ($('#calendar-selector') as any).dxSelectBox({
    items: calendarItems,
    valueExpr: 'id',
    displayExpr: 'text',
    value: 'gregorian',
    width: 220,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onValueChanged: (e: any): void => {
      chart().option('argumentAxis.label.calendar', e.value);
      chat().option('calendar', e.value);
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ($('#lang-selector') as any).dxSelectBox({
    items: languageItems,
    valueExpr: 'id',
    displayExpr: 'text',
    value: 'en',
    width: 220,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onValueChanged: (e: any): void => {
      const fa = e.value === 'fa';
      document.body.classList.toggle('lang-fa', fa);
      if (fa) {
        loadMessages(faMessages);
      }
      locale(fa ? 'fa' : 'en');
      chart().render();
      chat().repaint();
    },
  });
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});
