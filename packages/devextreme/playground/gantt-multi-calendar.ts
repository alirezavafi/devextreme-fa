import '../js/__internal/integration/jquery';
import '../js/ui/select_box';
// Registers the dxGanttMultiCalendar component (and pulls in dxTreeList).
import '../js/__internal/ui/gantt/multicalendar/index';

import $ from 'jquery';

import { locale, loadMessages } from '../js/localization';
import faMessages from '../js/localization/messages/fa.json';
import { setupThemeSelector } from './themeSelector.ts';

const GANTT = '#gantt';

// Persian (Eastern Arabic) digit shaping for scale labels.
const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toFaDigits = (value: number): string => String(value).replace(/[0-9]/g, (d) => FA_DIGITS[+d]);

// Sample plan. All dates are native Gregorian Dates; the calendar option only
// changes how the timeline scale is rendered.
const tasks = [
  {
    id: 1, parentId: null, title: 'Project kickoff', start: new Date(2024, 2, 20), end: new Date(2024, 2, 25), progress: 100,
  },
  {
    id: 2, parentId: null, title: 'Design', start: new Date(2024, 2, 25), end: new Date(2024, 3, 10), progress: 60,
  },
  {
    id: 3, parentId: 2, title: 'Wireframes', start: new Date(2024, 2, 25), end: new Date(2024, 3, 2), progress: 80,
  },
  {
    id: 4, parentId: 2, title: 'Visual design', start: new Date(2024, 3, 2), end: new Date(2024, 3, 10), progress: 40,
  },
  {
    id: 5, parentId: null, title: 'Development', start: new Date(2024, 3, 10), end: new Date(2024, 4, 5), progress: 10,
  },
  {
    id: 6, parentId: null, title: 'Launch', start: new Date(2024, 4, 6), end: new Date(2024, 4, 6), progress: 0,
  },
];

const dependencies = [
  {
    id: 1, predecessorId: 1, successorId: 2, type: 0,
  },
  {
    id: 2, predecessorId: 3, successorId: 4, type: 0,
  },
  {
    id: 3, predecessorId: 2, successorId: 5, type: 0,
  },
  {
    id: 4, predecessorId: 5, successorId: 6, type: 0,
  },
];

const calendarItems = [
  { id: 'gregorian', text: 'Gregorian' },
  { id: 'persian', text: 'Persian (Jalali)' },
  { id: 'hijri', text: 'Hijri (tabular)' },
];

const scaleItems = [
  { id: 'days', text: 'Days' },
  { id: 'weeks', text: 'Weeks' },
  { id: 'months', text: 'Months' },
  { id: 'quarters', text: 'Quarters' },
  { id: 'years', text: 'Years' },
];

const languageItems = [
  { id: 'en', text: 'English' },
  { id: 'fa', text: 'فارسی (Persian, RTL)' },
];

function log(message: string): void {
  const el = document.getElementById('events');
  if (el) {
    el.textContent = `[${new Date().toLocaleTimeString()}] ${message}\n${el.textContent ?? ''}`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function gantt(): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ($(GANTT) as any).dxGanttMultiCalendar('instance');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fmtDate = (d: Date): string => d.toDateString();

setupThemeSelector('theme-selector').then(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ($(GANTT) as any).dxGanttMultiCalendar({
    tasks: { dataSource: tasks },
    dependencies: { dataSource: dependencies },
    calendar: 'gregorian',
    scaleType: 'months',
    taskListWidth: 280,
    height: 420,
    editing: { enabled: true },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onTaskUpdated: (e: any): void => log(`Task ${e.key}: ${fmtDate(e.start)} -> ${fmtDate(e.end)}`),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onDependencyInserted: (e: any): void => log(`Dependency added ${e.predecessorId} -> ${e.successorId} (type ${e.type})`),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onDependencyDeleted: (e: any): void => log(`Dependency ${e.key} deleted`),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ($('#calendar-selector') as any).dxSelectBox({
    items: calendarItems,
    valueExpr: 'id',
    displayExpr: 'text',
    value: 'gregorian',
    width: 220,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onValueChanged: (e: any): void => gantt().option('calendar', e.value),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ($('#scale-selector') as any).dxSelectBox({
    items: scaleItems,
    valueExpr: 'id',
    displayExpr: 'text',
    value: 'months',
    width: 220,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onValueChanged: (e: any): void => gantt().option('scaleType', e.value),
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

      const instance = gantt();
      instance.beginUpdate();
      // RTL flips the whole widget: the tree-list moves to the right, and the
      // timeline scale/bars mirror horizontally so the earliest date sits on the
      // right and time flows right-to-left.
      instance.option('rtlEnabled', fa);
      instance.option('locale', fa ? 'fa' : undefined);
      instance.option('formatNumber', fa ? toFaDigits : undefined);
      instance.endUpdate();
      instance.repaint();
    },
  });
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});
