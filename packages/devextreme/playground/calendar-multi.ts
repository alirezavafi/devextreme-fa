import '../js/__internal/integration/jquery';
import '../js/ui/date_box';
import '../js/ui/date_range_box';
import '../js/ui/calendar';
import '../js/ui/data_grid';
import '../js/ui/pivot_grid';
import '../js/ui/scheduler';
import '../js/ui/select_box';
import $ from 'jquery';
import { locale, loadMessages } from '../js/localization';
import { getCalendar, getCalendarDefaultDateFormat, getCalendarMonthNamesInActiveLocale } from '../js/common/core/localization/calendar';
import dateLocalization from '../js/common/core/localization/date';
import config from '../js/core/config';
import faMessages from '../js/localization/messages/fa.json';
import { setupThemeSelector } from './themeSelector.ts';

const initialValue = new Date(2024, 2, 20); // 1 Farvardin 1403 / 30 Dhu al-Hijjah 1445
const rangeEnd = new Date(2024, 4, 1);

let currentCalendar = 'gregorian';
let currentLang: 'en' | 'fa' = 'en';
let currentGridEditMode: 'cell' | 'popup' = 'popup';

// Guards a one-shot mirror from an in-picker calendar switch up to the toolbar
// SelectBox so it does not bounce back and rebuild every widget on the page.
let mirroringCalendarFromInPicker = false;

// All editors are kept in a registry so the calendar switcher can update them live.
const editors: { el: string; instance: any }[] = [];

// --- localized calendar/language picker labels -------------------------------

const CALENDAR_LABELS: Record<string, Record<string, string>> = {
  en: {
    gregorian: 'Gregorian',
    persian: 'Persian (Jalali)',
    hijri: 'Hijri (tabular)',
    'hijri-umalqura': 'Hijri (Umm al-Qura)',
  },
  fa: {
    gregorian: 'میلادی',
    persian: 'شمسی (جلالی)',
    hijri: 'هجری قمری',
    'hijri-umalqura': 'هجری قمری (ام‌القری)',
  },
};

const TOOLBAR_LABELS: Record<string, Record<string, string>> = {
  en: {
    calendar: 'Calendar:', language: 'Language:', theme: 'Theme:', gridEdit: 'Grid edit:', stored: 'Stored', shown: 'Shown',
  },
  fa: {
    calendar: 'تقویم:', language: 'زبان:', theme: 'پوسته:', gridEdit: 'ویرایش جدول:', stored: 'ذخیره‌شده', shown: 'نمایش',
  },
};

const GRID_EDIT_LABELS: Record<string, Record<string, string>> = {
  en: { cell: 'Inline (cell)', popup: 'Popup (form)' },
  fa: { cell: 'درون‌خطی (سلولی)', popup: 'پنجره (فرم)' },
};

const gridEditItems = (lang: string): { id: string; text: string }[] => Object
  .keys(GRID_EDIT_LABELS[lang])
  .map((id) => ({ id, text: GRID_EDIT_LABELS[lang][id] }));

const LANGUAGES = [
  { id: 'en', text: 'English' },
  { id: 'fa', text: 'فارسی (Persian, RTL)' },
];

const calendarItems = (lang: string): { id: string; text: string }[] => Object
  .keys(CALENDAR_LABELS[lang])
  .map((id) => ({ id, text: CALENDAR_LABELS[lang][id] }));

// --- value readout: stored Gregorian value vs the selected calendar ---------

// Editors whose readout should include the time-of-day (date & time pickers).
const DATETIME_ELS = new Set(['#datebox-datetime', '#datebox-datetime-mask']);

function pad(n: number): string { return String(n).padStart(2, '0'); }

function formatGregorian(date: Date, withTime = false): string {
  const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return withTime ? `${datePart} ${pad(date.getHours())}:${pad(date.getMinutes())}` : datePart;
}

function formatInCalendar(date: Date, calendar: string, withTime = false): string {
  const timePart = withTime ? `, ${pad(date.getHours())}:${pad(date.getMinutes())}` : '';

  if (calendar === 'gregorian') {
    // Use the locale-aware Gregorian formatter so the rendering follows the
    // active language (Persian Gregorian month names when locale='fa', etc.).
    const type = withTime ? 'shortdateshorttime' : 'shortdate';
    return dateLocalization.format(date, { type, calendar: 'gregorian' }) as string;
  }
  const parts = getCalendar(calendar).toParts(date);
  const monthName = getCalendarMonthNamesInActiveLocale(calendar, 'abbreviated')[parts.month];
  return `${parts.year}/${pad(parts.month + 1)}/${pad(parts.day)}${timePart} (${monthName})`;
}

function readDates(el: string): Date[] {
  const value = editors.find((e) => e.el === el)?.instance?.option('value');
  if (Array.isArray(value)) return value.filter((v) => v instanceof Date) as Date[];
  return value instanceof Date ? [value] : [];
}

function renderReadoutFor(el: string): void {
  const target = document.querySelector<HTMLElement>(`[data-readout-for="${el}"]`);
  if (!target) return;
  const dates = readDates(el);
  const labels = TOOLBAR_LABELS[currentLang];
  const withTime = DATETIME_ELS.has(el);

  if (!dates.length) {
    target.innerHTML = `<span class="label">${labels.stored}:</span>—`;
    return;
  }

  const stored = dates.map((d) => formatGregorian(d, withTime)).join(' .. ');
  const shown = dates.map((d) => formatInCalendar(d, currentCalendar, withTime)).join(' .. ');
  target.innerHTML = `<div><span class="label">${labels.stored}:</span><span class="greg">${stored}</span></div>`
    + `<div><span class="label">${labels.shown}:</span><span class="cal">${shown}</span></div>`;
}

function renderAllReadouts(): void {
  document.querySelectorAll<HTMLElement>('[data-readout-for]').forEach((node) => {
    const el = node.getAttribute('data-readout-for');
    if (el) renderReadoutFor(el);
  });
}

// --- build / dispose --------------------------------------------------------

// Grid editing config for the current toolbar selection. Both modes share the
// same allow* flags so the difference is purely the editing UI (inline cell
// editor vs. the native popup edit form).
function getGridEditingConfig(rtlEnabled: boolean): Record<string, unknown> {
  const base = {
    allowUpdating: true,
    allowAdding: true,
    allowDeleting: true,
  };

  if (currentGridEditMode === 'popup') {
    return {
      ...base,
      mode: 'popup',
      popup: {
        title: 'Task',
        showTitle: true,
        width: 360,
        height: 'auto',
        rtlEnabled,
      },
      form: { items: ['task', 'start'] },
    };
  }

  return { ...base, mode: 'cell' };
}

function buildEditors(calendar: string): void {
  editors.length = 0;
  const rtlEnabled = currentLang === 'fa';

  const push = (el: string, instance: any): void => {
    editors.push({ el, instance });
    // Re-render this editor's inline readout when its value changes.
    instance.on?.('optionChanged', (e: { name: string }) => {
      if (e.name === 'value') renderReadoutFor(el);
    });
  };

  push('#datebox-rollers', $('#datebox-rollers').dxDateBox({
    value: initialValue, pickerType: 'rollers', calendar, rtlEnabled,
  }).dxDateBox('instance'));

  push('#datebox-calendar', $('#datebox-calendar').dxDateBox({
    value: initialValue,
    pickerType: 'calendar',
    calendar,
    calendarSwitcher: true,
    rtlEnabled,
    calendarOptions: { showTodayButton: true },
  }).dxDateBox('instance'));

  // No explicit displayFormat: the calendar's defaultDateFormat (yyyy/MM/dd for
  // Persian/Hijri) is applied automatically.
  push('#datebox-mask', $('#datebox-mask').dxDateBox({
    value: initialValue,
    pickerType: 'calendar',
    calendar,
    useMaskBehavior: true,
    rtlEnabled,
    calendarOptions: { showTodayButton: true },
  }).dxDateBox('instance'));

  // Date & time picker: type 'datetime' shows a calendar grid plus a time
  // section. The calendar part follows the selected calendar; the stored value
  // stays a Gregorian Date with the chosen time-of-day.
  push('#datebox-datetime', $('#datebox-datetime').dxDateBox({
    value: initialValue,
    type: 'datetime',
    pickerType: 'calendar',
    calendar,
    calendarSwitcher: true,
    rtlEnabled,
    calendarOptions: { showTodayButton: true },
  }).dxDateBox('instance'));

  // Date & time with typed-input mask: no explicit displayFormat, so the
  // calendar's default date format (yyyy/MM/dd for Persian/Hijri) is combined
  // with the short time and both the date and time become editable in place.
  push('#datebox-datetime-mask', $('#datebox-datetime-mask').dxDateBox({
    value: initialValue,
    type: 'datetime',
    pickerType: 'calendar',
    calendar,
    useMaskBehavior: true,
    rtlEnabled,
    calendarOptions: { showTodayButton: true },
  }).dxDateBox('instance'));

  push('#daterangebox', $('#daterangebox').dxDateRangeBox({
    value: [initialValue, rangeEnd],
    calendar,
    rtlEnabled,
    calendarOptions: { showTodayButton: true },
  }).dxDateRangeBox('instance'));

  // No explicit firstDayOfWeek: the calendar's preferred first day (Saturday for
  // Persian/Hijri) is applied automatically.
  push('#calendar', $('#calendar').dxCalendar({
    value: initialValue,
    calendar,
    calendarSwitcher: true,
    rtlEnabled,
    showTodayButton: true,
  }).dxCalendar('instance'));

  const gridData = [
    { id: 1, task: 'Design', start: new Date(2024, 2, 20) },
    { id: 2, task: 'Develop', start: new Date(2024, 4, 1) },
    { id: 3, task: 'Test', start: new Date(2024, 6, 7) },
  ];

  // Use the calendar's own default date format (yyyy/MM/dd for Persian/Hijri),
  // falling back to the locale shortdate for Gregorian.
  const gridDateFormatType = getCalendarDefaultDateFormat(calendar) ?? 'shortdate';

  push('#datagrid', $('#datagrid').dxDataGrid({
    dataSource: gridData,
    keyExpr: 'id',
    rtlEnabled,
    // Editing mode is switchable from the toolbar (inline cell vs popup form).
    // The `start` column's editor inherits the column's calendar via
    // `editorOptions`, so the editor renders/parses in the selected calendar
    // (cell editor or popup form alike) while the stored value stays Gregorian.
    editing: getGridEditingConfig(rtlEnabled),
    // Filtering demo for localized dates: the filter-row editor and the
    // header-filter use the same calendar-aware date editor / format as the
    // column, so a Persian user filters in Persian-calendar dates while the
    // stored values stay Gregorian.
    filterRow: { visible: true },
    headerFilter: { visible: true },
    columns: [
      'task',
      {
        dataField: 'start',
        dataType: 'date',
        format: { type: gridDateFormatType, calendar },
        editorOptions: { calendar },
        // The filter-row date editor renders/parses in the selected calendar.
        filterOperations: ['=', '<>', '<', '>', '<=', '>='],
      },
    ],
  }).dxDataGrid('instance'));

  push('#scheduler', $('#scheduler').dxScheduler({
    dataSource: [
      { text: 'Standup', startDate: new Date(2024, 2, 20, 9, 30), endDate: new Date(2024, 2, 20, 10, 0) },
      { text: 'Review', startDate: new Date(2024, 2, 21, 14, 0), endDate: new Date(2024, 2, 21, 15, 0) },
      {
        text: 'Monthly report (recurs)',
        startDate: new Date(2024, 2, 20, 11, 0),
        endDate: new Date(2024, 2, 20, 12, 0),
        recurrenceRule: 'FREQ=MONTHLY',
      },
    ],
    currentDate: initialValue,
    views: ['day', 'week', 'month', 'timelineWeek', 'agenda'],
    currentView: 'week',
    height: 480,
    calendar,
    rtlEnabled,
  }).dxScheduler('instance'));

  // PivotGrid — the date dimension is grouped by *calendar* year and month while
  // the underlying records stay Gregorian `Date`s. We do this with the public
  // field `selector` (group key = calendar year / month index) + `customizeText`
  // (calendar month name), so a Persian pivot rolls up by 1402/1403 and Farvardin…
  // Esfand without any data migration. Gregorian uses the same code path.
  const cal = getCalendar(calendar);
  const pivotMonthNames = getCalendarMonthNamesInActiveLocale(calendar, 'wide');

  const pivotData = [
    { date: new Date(2023, 11, 25), region: 'North', amount: 1200 },
    { date: new Date(2024, 0, 15), region: 'South', amount: 800 },
    { date: new Date(2024, 2, 20), region: 'North', amount: 1500 },
    { date: new Date(2024, 2, 28), region: 'South', amount: 600 },
    { date: new Date(2024, 4, 1), region: 'North', amount: 900 },
    { date: new Date(2024, 6, 7), region: 'South', amount: 1100 },
  ];

  push('#pivotgrid', $('#pivotgrid').dxPivotGrid({
    rtlEnabled,
    allowExpandAll: true,
    height: 360,
    fieldChooser: { enabled: false },
    dataSource: {
      store: pivotData,
      fields: [
        {
          caption: 'Year',
          area: 'row',
          expanded: true,
          // Calendar year of the stored Gregorian date.
          selector: (data: { date: Date }): number => cal.toParts(data.date).year,
          // Plain year number (no thousands separator).
          customizeText: (cellInfo: { value?: string | number | Date }): string => String(cellInfo.value),
        },
        {
          caption: 'Month',
          area: 'row',
          // Calendar month index (0-based); sort chronologically by that value.
          selector: (data: { date: Date }): number => cal.toParts(data.date).month,
          customizeText: (cellInfo: { value?: string | number | Date }): string => pivotMonthNames[Number(cellInfo.value)],
          sortBy: 'value',
        },
        { caption: 'Region', dataField: 'region', area: 'column' },
        {
          caption: 'Amount',
          dataField: 'amount',
          dataType: 'number',
          summaryType: 'sum',
          format: 'currency',
          area: 'data',
        },
      ],
    },
  }).dxPivotGrid('instance'));

  // The in-picker calendar switcher (inside #calendar and #datebox-calendar)
  // mutates the widget's `calendar` option directly. Mirror the toolbar
  // SelectBox value to reflect the change visually, but suppress its
  // onValueChanged-driven rebuildAll so other widgets are not affected.
  const mirrorCalendarToToolbar = (next: string): void => {
    if (mirroringCalendarFromInPicker || next === currentCalendar) return;
    mirroringCalendarFromInPicker = true;
    try {
      currentCalendar = next;
      const sel = ($('#calendar-selector').dxSelectBox('instance')) as any;
      sel?.option('value', currentCalendar);
    } finally {
      mirroringCalendarFromInPicker = false;
    }
    // Refresh readouts so the "Shown" column matches the new active calendar
    // for the widget that changed.
    renderAllReadouts();
  };

  ['#calendar', '#datebox-calendar', '#datebox-datetime'].forEach((el) => {
    editors.find((x) => x.el === el)?.instance?.on(
      'optionChanged',
      (e: { name: string; value: unknown }) => {
        if (e.name === 'calendar') mirrorCalendarToToolbar(e.value as string);
      },
    );
  });

  renderAllReadouts();
}

function disposeEditors(): void {
  editors.forEach(({ el }) => {
    const $el = $(el);
    const instance = $el.data('dxDateBox') || $el.data('dxDateRangeBox')
      || $el.data('dxCalendar') || $el.data('dxDataGrid') || $el.data('dxScheduler')
      || $el.data('dxPivotGrid');
    instance?.dispose?.();
    $el.empty();
  });
}

function rebuildAll(): void {
  disposeEditors();
  buildEditors(currentCalendar);
}

function applyLanguage(lang: 'en' | 'fa'): void {
  currentLang = lang;
  config({ rtlEnabled: lang === 'fa' });
  locale(lang);
  document.documentElement.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
  document.body.classList.toggle('lang-fa', lang === 'fa');

  // Update the toolbar labels (the static ones in HTML are decorative; the
  // dxSelectBox items are rebuilt with localized text).
  const labels = TOOLBAR_LABELS[lang];
  const calItems = calendarItems(lang);
  const calSelectBox = ($('#calendar-selector').dxSelectBox('instance')) as any;
  if (calSelectBox) {
    calSelectBox.option({
      items: calItems,
      rtlEnabled: lang === 'fa',
      value: currentCalendar,
    });
  }
  const langSelectBox = ($('#lang-selector').dxSelectBox('instance')) as any;
  if (langSelectBox) {
    langSelectBox.option({ rtlEnabled: lang === 'fa', value: lang });
  }
  const themeSelectBox = ($('#theme-selector').dxSelectBox('instance')) as any;
  if (themeSelectBox) {
    themeSelectBox.option('rtlEnabled', lang === 'fa');
  }
  const gridEditSelectBox = ($('#grid-edit-selector').dxSelectBox('instance')) as any;
  if (gridEditSelectBox) {
    gridEditSelectBox.option({
      items: gridEditItems(lang),
      rtlEnabled: lang === 'fa',
      value: currentGridEditMode,
    });
  }
  // Update visible HTML labels — they are positioned in toolbar field order:
  // [theme, calendar, language, gridEdit].
  const fields = document.querySelectorAll<HTMLElement>('.toolbar .field label');
  if (fields.length >= 4) {
    fields[0].textContent = labels.theme;
    fields[1].textContent = labels.calendar;
    fields[2].textContent = labels.language;
    fields[3].textContent = labels.gridEdit;
  }
}

window.addEventListener('load', () => {
  loadMessages(faMessages as Record<string, Record<string, string>>);

  setupThemeSelector('theme-selector')
    .catch((err) => console.error('Theme loading failed:', err))
    .then(() => {
      // Mount the dxSelectBox toolbar pickers.
      $('#calendar-selector').dxSelectBox({
        items: calendarItems(currentLang),
        valueExpr: 'id',
        displayExpr: 'text',
        value: currentCalendar,
        width: 220,
        onValueChanged: (e: any): void => {
          // When the value change originates from an in-picker calendar
          // switcher mirror, skip the page-wide rebuild — only the widget
          // whose user changed it should re-render itself.
          if (mirroringCalendarFromInPicker) return;
          currentCalendar = e.value as string;
          rebuildAll();
        },
      });

      $('#lang-selector').dxSelectBox({
        items: LANGUAGES,
        valueExpr: 'id',
        displayExpr: 'text',
        value: currentLang,
        width: 220,
        onValueChanged: (e: any): void => {
          applyLanguage(e.value as 'en' | 'fa');
          rebuildAll();
        },
      });

      $('#grid-edit-selector').dxSelectBox({
        items: gridEditItems(currentLang),
        valueExpr: 'id',
        displayExpr: 'text',
        value: currentGridEditMode,
        width: 220,
        onValueChanged: (e: any): void => {
          currentGridEditMode = e.value as 'cell' | 'popup';
          // Apply the new editing mode live to the existing grid instance so
          // the rest of the page (and the grid's data/filter state) is kept.
          const grid = editors.find((x) => x.el === '#datagrid')?.instance;
          grid?.option('editing', getGridEditingConfig(currentLang === 'fa'));
        },
      });

      buildEditors(currentCalendar);
    });
});
