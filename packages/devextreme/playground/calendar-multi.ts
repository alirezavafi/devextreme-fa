import '../js/ui/date_box';
import '../js/ui/date_range_box';
import '../js/ui/calendar';
import '../js/ui/data_grid';
import '../js/ui/pivot_grid';
import '../js/ui/scheduler';
import $ from 'jquery';
import {
  getCalendar, getCalendarDefaultDateFormat, getCalendarFirstDayOfWeek, getCalendarMonthNamesInActiveLocale,
} from '../js/common/core/localization/calendar';
import dateLocalization from '../js/common/core/localization/date';
import { actionGroup, actionSegmented } from './shell/actions';
import type { CalendarId } from './shell/constants/calendar-ids';
import { Languages } from './shell/constants/languages';
import { toIsoDate, toIsoDateTime } from './shell/date-info';
import { storedRow } from './shell/date-rows';
import { requireElement } from './shell/dom';
import { formatDate, localDigits } from './shell/format';
import { t } from './shell/i18n';
import { renderInspector } from './shell/inspector';
import type { InspectorRow } from './shell/inspector-row';
import { mountPage } from './shell/page';
import type { PageContext } from './shell/page-context';
import { setState } from './shell/state';
import en from './pages/all/en.json';
import fa from './pages/all/fa.json';

// 1 Farvardin 1403 / 30 Dhu al-Hijjah 1445
const INITIAL_VALUE = new Date(2024, 2, 20);
const RANGE_END = new Date(2024, 4, 1);

const GridEditModes = ['cell', 'popup'] as const;
type GridEditMode = typeof GridEditModes[number];

const EventNames = { valueChanged: 'valueChanged', editingMode: 'editing.mode' } as const;
const CALENDAR_OPTION = 'calendar';
const RANGE_SEPARATOR = ' .. ';
const POPUP_WIDTH = 360;
const SCHEDULER_HEIGHT = 480;
const PIVOT_HEIGHT = 360;

// Each editor card: its mount point (also the readout key) and whether its value
// carries a time of day.
const Editors = {
  dateBoxRollers: { selector: '#datebox-rollers', withTime: false },
  dateBoxCalendar: { selector: '#datebox-calendar', withTime: false },
  dateBoxMask: { selector: '#datebox-mask', withTime: false },
  dateBoxDatetime: { selector: '#datebox-datetime', withTime: true },
  dateBoxDatetimeMask: { selector: '#datebox-datetime-mask', withTime: true },
  dateRangeBox: { selector: '#daterangebox', withTime: false },
  calendar: { selector: '#calendar', withTime: false },
} as const;
type EditorId = keyof typeof Editors;
type EditorValue = Date | (Date | null)[] | null;

// Page settings survive rebuilds (calendar, language or theme changes).
const settings = {
  gridEdit: 'popup' as GridEditMode,
  values: {
    dateBoxRollers: INITIAL_VALUE,
    dateBoxCalendar: INITIAL_VALUE,
    dateBoxMask: INITIAL_VALUE,
    dateBoxDatetime: INITIAL_VALUE,
    dateBoxDatetimeMask: INITIAL_VALUE,
    dateRangeBox: [INITIAL_VALUE, RANGE_END],
    calendar: INITIAL_VALUE,
  } as Record<EditorId, EditorValue>,
};

const asDates = (value: EditorValue): Date[] => {
  if (Array.isArray(value)) return value.filter((d): d is Date => d instanceof Date);
  return value instanceof Date ? [value] : [];
};

function renderReadout(id: EditorId, calendar: CalendarId): void {
  const { selector, withTime } = Editors[id];
  const target = document.querySelector<HTMLElement>(`[data-readout-for="${selector}"]`);
  if (!target) return;
  const dates = asDates(settings.values[id]);
  const rows: InspectorRow[] = dates.length
    ? [
      {
        label: t('inspector.stored'),
        value: dates.map((d) => (withTime ? toIsoDateTime(d) : toIsoDate(d))).join(RANGE_SEPARATOR),
        tone: 'accent',
        ltr: true,
      },
      {
        label: t('inspector.shown'),
        value: dates.map((d) => formatDate(d, calendar, withTime ? 'shortdateshorttime' : 'shortdate')).join(RANGE_SEPARATOR),
        tone: 'ok',
      },
    ]
    : [storedRow(null)];
  renderInspector(target, rows);
}

// Grid editing config for the chosen mode. Both modes share the same allow*
// flags, so the difference is purely the editing UI (inline cell editor vs. the
// native popup edit form).
function gridEditing(rtlEnabled: boolean): Record<string, unknown> {
  const base = { allowUpdating: true, allowAdding: true, allowDeleting: true };
  if (settings.gridEdit === 'popup') {
    return {
      ...base,
      mode: 'popup',
      popup: {
        title: t('all.grid.task'), showTitle: true, width: POPUP_WIDTH, height: 'auto', rtlEnabled,
      },
      form: { items: ['task', 'start'] },
    };
  }
  return { ...base, mode: 'cell' };
}

function build({
  state, rtl, log, widgets,
}: PageContext): void {
  const { calendar } = state;
  const rtlEnabled = rtl;

  // Mounts one editor with its readout and event-log line.
  const mountEditor = (id: EditorId, mount: (options: Record<string, unknown>) => unknown, options: Record<string, unknown>): void => {
    const instance = mount({
      value: settings.values[id],
      calendar,
      rtlEnabled,
      ...options,
      onValueChanged: (e: { value: EditorValue }): void => {
        settings.values[id] = e.value;
        renderReadout(id, calendar);
        log.log(EventNames.valueChanged, t(`all.card.${id}`));
      },
    });
    widgets.add(instance);
    renderReadout(id, calendar);
  };

  // The in-picker calendar switcher changes the widget's own `calendar` option:
  // make it the site-wide one, which rebuilds the page.
  const followPicker = (e: { name: string; value: unknown }): void => {
    if (e.name === CALENDAR_OPTION && e.value !== calendar) setState({ calendar: e.value as CalendarId });
  };
  const dateBox = (id: EditorId, options: Record<string, unknown>): void => mountEditor(
    id,
    (opts) => $(Editors[id].selector).dxDateBox(opts).dxDateBox('instance'),
    options,
  );
  const calendarOptions = { showTodayButton: true };

  dateBox('dateBoxRollers', { pickerType: 'rollers' });
  dateBox('dateBoxCalendar', {
    pickerType: 'calendar', calendarOptions, onOptionChanged: followPicker,
  });
  // No explicit displayFormat: the calendar's defaultDateFormat (yyyy/MM/dd for
  // Persian/Hijri) is applied automatically.
  dateBox('dateBoxMask', { pickerType: 'calendar', useMaskBehavior: true, calendarOptions });
  // Date & time: a calendar grid plus a time section. The calendar part follows
  // the selected calendar; the stored value stays a Gregorian Date with the time.
  dateBox('dateBoxDatetime', {
    type: 'datetime', pickerType: 'calendar', calendarOptions, onOptionChanged: followPicker,
  });
  // Date & time typed in place: the calendar's default date format joins the
  // short time, and both parts are editable.
  dateBox('dateBoxDatetimeMask', {
    type: 'datetime', pickerType: 'calendar', useMaskBehavior: true, calendarOptions,
  });

  mountEditor(
    'dateRangeBox',
    (opts) => $(Editors.dateRangeBox.selector).dxDateRangeBox(opts).dxDateRangeBox('instance'),
    { calendarOptions },
  );

  // No explicit firstDayOfWeek: the calendar's preferred first day (Saturday for
  // Persian/Hijri) is applied automatically.
  mountEditor(
    'calendar',
    (opts) => $(Editors.calendar.selector).dxCalendar(opts).dxCalendar('instance'),
    { showTodayButton: true, onOptionChanged: followPicker },
  );

  const gridData = [
    { id: 1, task: t('all.grid.design'), start: new Date(2024, 2, 20) },
    { id: 2, task: t('all.grid.develop'), start: new Date(2024, 4, 1) },
    { id: 3, task: t('all.grid.test'), start: new Date(2024, 6, 7) },
  ];
  // The calendar's own default date format (yyyy/MM/dd for Persian/Hijri),
  // falling back to the locale shortdate for Gregorian.
  const gridDateFormatType = getCalendarDefaultDateFormat(calendar) ?? 'shortdate';

  const grid = widgets.add($('#datagrid').dxDataGrid({
    dataSource: gridData,
    keyExpr: 'id',
    rtlEnabled,
    // The `start` column's editor inherits the column's calendar via
    // `editorOptions`, so cell editor, popup form and filter row all render and
    // parse in the selected calendar while the stored value stays Gregorian.
    editing: gridEditing(rtlEnabled),
    filterRow: { visible: true },
    headerFilter: { visible: true },
    columns: [
      { dataField: 'task', caption: t('all.grid.task') },
      {
        dataField: 'start',
        caption: t('all.grid.start'),
        dataType: 'date',
        format: { type: gridDateFormatType, calendar },
        editorOptions: { calendar },
        filterOperations: ['=', '<>', '<', '>', '<=', '>='],
      },
    ],
  }).dxDataGrid('instance'));

  widgets.add($('#scheduler').dxScheduler({
    dataSource: [
      { text: t('all.scheduler.standup'), startDate: new Date(2024, 2, 20, 9, 30), endDate: new Date(2024, 2, 20, 10, 0) },
      { text: t('all.scheduler.review'), startDate: new Date(2024, 2, 21, 14, 0), endDate: new Date(2024, 2, 21, 15, 0) },
      {
        text: t('all.scheduler.report'),
        startDate: new Date(2024, 2, 20, 11, 0),
        endDate: new Date(2024, 2, 20, 12, 0),
        recurrenceRule: 'FREQ=MONTHLY',
      },
    ],
    currentDate: INITIAL_VALUE,
    views: ['day', 'week', 'month', 'timelineWeek', 'agenda'],
    currentView: 'week',
    height: SCHEDULER_HEIGHT,
    calendar,
    // Explicit, because the week views apply neither the calendar's default
    // first day nor the locale's, while the navigator caption uses the locale's.
    firstDayOfWeek: getCalendarFirstDayOfWeek(calendar) ?? dateLocalization.firstDayOfWeekIndex(),
    rtlEnabled,
  }).dxScheduler('instance'));

  // The date dimension is grouped by calendar year and month while the records
  // stay Gregorian Dates: the field `selector` returns the calendar year / month
  // index and `customizeText` the calendar month name. Gregorian takes the same path.
  const system = getCalendar(calendar);
  const monthNames = getCalendarMonthNamesInActiveLocale(calendar, 'wide');
  const north = t('all.pivot.north');
  const south = t('all.pivot.south');
  const pivotData = [
    { date: new Date(2023, 11, 25), region: north, amount: 1200 },
    { date: new Date(2024, 0, 15), region: south, amount: 800 },
    { date: new Date(2024, 2, 20), region: north, amount: 1500 },
    { date: new Date(2024, 2, 28), region: south, amount: 600 },
    { date: new Date(2024, 4, 1), region: north, amount: 900 },
    { date: new Date(2024, 6, 7), region: south, amount: 1100 },
  ];

  widgets.add($('#pivotgrid').dxPivotGrid({
    rtlEnabled,
    allowExpandAll: true,
    height: PIVOT_HEIGHT,
    fieldChooser: { enabled: false },
    dataSource: {
      store: pivotData,
      fields: [
        {
          caption: t('all.pivot.year'),
          area: 'row',
          expanded: true,
          selector: (data: { date: Date }): number => system.toParts(data.date).year,
          // A plain year number, without a thousands separator.
          customizeText: (cellInfo: { value?: string | number | Date }): string => localDigits(String(cellInfo.value)),
        },
        {
          caption: t('all.pivot.month'),
          area: 'row',
          selector: (data: { date: Date }): number => system.toParts(data.date).month,
          customizeText: (cellInfo: { value?: string | number | Date }): string => monthNames[Number(cellInfo.value)],
          sortBy: 'value',
        },
        { caption: t('all.pivot.region'), dataField: 'region', area: 'column' },
        {
          caption: t('all.pivot.amount'),
          dataField: 'amount',
          dataType: 'number',
          summaryType: 'sum',
          format: 'currency',
          area: 'data',
        },
      ],
    },
  }).dxPivotGrid('instance'));

  const actions = requireElement('#actions');
  actions.replaceChildren();
  actionSegmented(
    actionGroup(actions, t('all.group.gridEdit')),
    t('all.group.gridEdit'),
    GridEditModes.map((value) => ({ value, text: t(`all.edit.${value}`) })),
    settings.gridEdit,
    (gridEdit) => {
      settings.gridEdit = gridEdit;
      // Applied live, so the rest of the page and the grid's data and filter state are kept.
      grid.option('editing', gridEditing(rtlEnabled));
      log.log(EventNames.editingMode, t(`all.edit.${gridEdit}`));
    },
  );
}

mountPage({ pageId: 'all', messages: { [Languages.en]: en, [Languages.fa]: fa }, build });
