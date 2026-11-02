import '../../../js/ui/data_grid';
import $ from 'jquery';
import { getCalendar, getCalendarDefaultDateFormat, getCalendarMonthNamesInActiveLocale } from '../../../js/common/core/localization/calendar';
import { actionButton, actionGroup, actionSegmented, actionToggle } from '../../shell/actions';
import type { CalendarId } from '../../shell/constants/calendar-ids';
import { Languages } from '../../shell/constants/languages';
import type { Language } from '../../shell/constants/languages';
import { calendarMonthRange, toIsoDate, toIsoDateTime } from '../../shell/date-info';
import { requireElement } from '../../shell/dom';
import { formatDate, localDigits } from '../../shell/format';
import { t } from '../../shell/i18n';
import { renderInspector, renderOptions } from '../../shell/inspector';
import type { InspectorRow } from '../../shell/inspector-row';
import { mountPage } from '../../shell/page';
import type { PageContext } from '../../shell/page-context';
import {
  OwnerIds, StatusIds, buildTasks,
} from './data';
import type { TaskRow } from './data';
import en from './en.json';
import fa from './fa.json';

const EditModes = ['cell', 'row', 'popup'] as const;
type EditMode = typeof EditModes[number];

const Fields = {
  task: 'task',
  owner: 'owner',
  status: 'status',
  start: 'start',
  due: 'due',
  created: 'created',
  startMonth: 'startMonth',
} as const;

const FALLBACK_DATE_FORMAT = 'shortdate';
const DATE_TIME_FORMAT = 'shortdateshorttime';
const TIME_PATTERN = 'HH:mm';
const LONG_DATE = 'longdate';
const LONG_DATE_TIME = 'longdatelongtime';
const BETWEEN_OPERATIONS = ['=', '<>', '<', '>', '<=', '>='];
const GRID_HEIGHT = 560;
const PAGE_SIZE = 10;
const POPUP_WIDTH = 420;
const MONTH_KEY_FACTOR = 100;
const SELECTED_ROW_INDEX = 4;

const today = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Page settings survive rebuilds (calendar, language or theme changes), so the
// grid keeps its rows, edits, selection and filter.
const settings = {
  rows: [] as TaskRow[],
  rowsLanguage: '' as Language | '',
  nextId: 1,
  selectedId: null as number | null,
  editMode: 'cell' as EditMode,
  filterPanel: false,
  groupByMonth: false,
  filterValue: null as unknown,
};

// Task titles are localized text, so the rows are generated again when the
// language changes.
function ensureRows(lang: Language): void {
  if (settings.rowsLanguage === lang) return;
  settings.rowsLanguage = lang;
  settings.rows.splice(0, settings.rows.length, ...buildTasks(today(), (n) => t(`dataGrid.task.${n}`)));
  settings.nextId = settings.rows.length + 1;
  settings.selectedId = settings.rows[SELECTED_ROW_INDEX].id;
  settings.filterValue = null;
}

const lookupItems = (kind: 'owner' | 'status', ids: readonly string[]): { id: string; text: string }[] => ids
  .map((id) => ({ id, text: t(`dataGrid.${kind}.${id}`) }));

// A filter expression as readable text; dates print as stored ISO.
function plainFilter(value: unknown): unknown {
  if (value instanceof Date) return toIsoDate(value);
  if (Array.isArray(value)) return value.map(plainFilter);
  return value;
}

const describeFilter = (value: unknown): string => (value
  ? JSON.stringify(plainFilter(value))
  : t('dataGrid.log.noFilter'));

function dateRowsFor(row: TaskRow, calendar: CalendarId): InspectorRow[] {
  const field = (caption: string, date: Date, withTime: boolean): InspectorRow[] => [
    {
      label: `${caption} · ${t('inspector.stored')}`,
      value: withTime ? toIsoDateTime(date) : toIsoDate(date),
      tone: 'accent',
      ltr: true,
    },
    {
      label: `${caption} · ${t('inspector.shown')}`,
      value: formatDate(date, calendar, withTime ? LONG_DATE_TIME : LONG_DATE),
      tone: 'ok',
    },
  ];
  return [
    ...field(t('dataGrid.col.start'), row.start, false),
    ...field(t('dataGrid.col.due'), row.due, false),
    ...field(t('dataGrid.col.created'), row.created, true),
  ];
}

function inspectorRows(calendar: CalendarId): InspectorRow[] {
  const row = settings.rows.find((r) => r.id === settings.selectedId);
  if (!row) return [{ label: t('card.inspector'), value: t('dataGrid.inspector.empty'), tone: 'muted' }];
  return [
    ...dateRowsFor(row, calendar),
    { label: t('dataGrid.inspector.task'), value: row.task },
    { label: t('dataGrid.inspector.owner'), value: t(`dataGrid.owner.${row.owner}`) },
    { label: t('dataGrid.inspector.status'), value: t(`dataGrid.status.${row.status}`) },
  ];
}

// Group key for "calendar month": year * 100 + month number in the calendar.
function monthKey(date: Date, calendar: CalendarId): number {
  const { year, month } = getCalendar(calendar).toParts(date);
  return year * MONTH_KEY_FACTOR + month + 1;
}

function monthKeyText(key: number, calendar: CalendarId): string {
  const year = Math.floor(key / MONTH_KEY_FACTOR);
  const month = (key % MONTH_KEY_FACTOR) - 1;
  return `${getCalendarMonthNamesInActiveLocale(calendar, 'wide')[month]} ${localDigits(year)}`;
}

function gridOptions(calendar: CalendarId, rtl: boolean): Record<string, unknown> {
  const calendarDefault = getCalendarDefaultDateFormat(calendar);
  const dateFormat = calendarDefault ?? FALLBACK_DATE_FORMAT;
  // The column format and the editors share the calendar; the stored value
  // stays a Gregorian Date.
  const dateColumn = (dataField: string, dataType: 'date' | 'datetime', type: string): Record<string, unknown> => ({
    dataField,
    dataType,
    caption: t(`dataGrid.col.${dataField}`),
    format: { type, calendar },
    editorOptions: { calendar },
    filterOperations: BETWEEN_OPERATIONS,
  });
  return {
    keyExpr: 'id',
    rtlEnabled: rtl,
    height: GRID_HEIGHT,
    showBorders: true,
    columnAutoWidth: true,
    rowAlternationEnabled: true,
    hoverStateEnabled: true,
    filterRow: { visible: true },
    headerFilter: { visible: true },
    filterSyncEnabled: true,
    filterPanel: { visible: settings.filterPanel },
    selection: { mode: 'single' },
    paging: { pageSize: PAGE_SIZE },
    pager: { visible: true, showInfo: true },
    editing: {
      mode: settings.editMode,
      allowAdding: true,
      allowUpdating: true,
      allowDeleting: true,
      popup: {
        title: t('dataGrid.popup.title'), showTitle: true, width: POPUP_WIDTH, height: 'auto', rtlEnabled: rtl,
      },
      form: { items: Object.values(Fields).filter((f) => f !== Fields.startMonth) },
    },
    columns: [
      { dataField: Fields.task, caption: t('dataGrid.col.task'), minWidth: 200 },
      {
        dataField: Fields.owner,
        caption: t('dataGrid.col.owner'),
        lookup: { dataSource: lookupItems('owner', OwnerIds), valueExpr: 'id', displayExpr: 'text' },
      },
      {
        dataField: Fields.status,
        caption: t('dataGrid.col.status'),
        lookup: { dataSource: lookupItems('status', StatusIds), valueExpr: 'id', displayExpr: 'text' },
      },
      dateColumn(Fields.start, 'date', dateFormat),
      dateColumn(Fields.due, 'date', dateFormat),
      dateColumn(Fields.created, 'datetime', calendarDefault ? `${calendarDefault} ${TIME_PATTERN}` : DATE_TIME_FORMAT),
      {
        name: Fields.startMonth,
        caption: t('dataGrid.col.startMonth'),
        dataType: 'number',
        visible: false,
        showInColumnChooser: false,
        allowEditing: false,
        allowFiltering: false,
        allowHeaderFiltering: false,
        groupIndex: settings.groupByMonth ? 0 : undefined,
        calculateCellValue: (row: TaskRow): number => monthKey(row.start, calendar),
        customizeText: (info: { value?: number }): string => (info.value === undefined ? '' : monthKeyText(info.value, calendar)),
      },
    ],
  };
}

function build({
  state, rtl, log, widgets,
}: PageContext): void {
  const { calendar } = state;
  ensureRows(state.lang);
  const inspector = requireElement('#inspector');
  const optionsHost = requireElement('#options');
  const actions = requireElement('#actions');
  const options = gridOptions(calendar, rtl);

  const refresh = (): void => {
    renderInspector(inspector, inspectorRows(calendar));
    renderOptions(optionsHost, {
      ...options,
      editing: { ...(options.editing as object), mode: settings.editMode, popup: undefined, form: undefined },
      columns: undefined,
      filterValue: settings.filterValue ?? undefined,
    });
  };

  const grid = widgets.add($('#grid').dxDataGrid({
    ...options,
    dataSource: { store: { type: 'array', key: 'id', data: settings.rows } },
    selectedRowKeys: settings.selectedId === null ? [] : [settings.selectedId],
    filterValue: settings.filterValue ?? null,
    onSelectionChanged: (e: { selectedRowsData: TaskRow[] }): void => {
      const [row] = e.selectedRowsData;
      settings.selectedId = row?.id ?? null;
      log.log('selectionChanged', row ? t('dataGrid.log.selected', { task: row.task }) : t('dataGrid.log.deselected'));
      refresh();
    },
    onInitNewRow: (e: { data: Partial<TaskRow> }): void => {
      Object.assign(e.data, {
        id: settings.nextId,
        owner: OwnerIds[0],
        status: StatusIds[0],
        start: today(),
        due: today(),
        created: new Date(),
      });
      settings.nextId += 1;
      log.log('initNewRow', t('dataGrid.log.newRow', { shown: formatDate(today(), calendar) }));
    },
    onRowInserted: (e: { data: TaskRow }): void => {
      settings.selectedId = e.data.id;
      log.log('rowInserted', t('dataGrid.log.inserted', { task: e.data.task ?? '', iso: toIsoDate(e.data.start) }));
      refresh();
    },
    onRowUpdated: (e: { data: TaskRow }): void => {
      log.log('rowUpdated', t('dataGrid.log.updated', { task: e.data.task ?? '' }));
      refresh();
    },
    onRowRemoved: (e: { data: TaskRow }): void => {
      if (settings.selectedId === e.data.id) settings.selectedId = null;
      log.log('rowRemoved', t('dataGrid.log.removed', { task: e.data.task ?? '' }));
      refresh();
    },
    onOptionChanged: (e: { name: string; value: unknown }): void => {
      if (e.name !== 'filterValue') return;
      settings.filterValue = e.value ?? null;
      log.log('optionChanged', `filterValue · ${describeFilter(e.value)}`);
      refresh();
    },
  } as never).dxDataGrid('instance'));

  actions.replaceChildren();
  actionSegmented(
    actionGroup(actions, t('dataGrid.group.edit')),
    t('dataGrid.group.edit'),
    EditModes.map((value) => ({ value, text: t(`dataGrid.edit.${value}`) })),
    settings.editMode,
    (editMode) => {
      settings.editMode = editMode;
      grid.option('editing.mode', editMode);
      log.log('editing.mode', t(`dataGrid.edit.${editMode}`));
      refresh();
    },
  );
  const editRow = actionGroup(actions, '');
  actionButton(editRow, t('dataGrid.action.addRow'), () => grid.addRow(), 'primary');

  const filters = actionGroup(actions, t('dataGrid.group.filter'));
  actionButton(filters, t('dataGrid.action.thisMonth'), () => {
    const [from, to] = calendarMonthRange(today(), calendar);
    grid.option('filterValue', [[Fields.start, '>=', from], 'and', [Fields.start, '<=', to]]);
    log.log('filterValue', t('dataGrid.log.monthFilter', { from: formatDate(from, calendar), to: formatDate(to, calendar) }));
  });
  actionButton(filters, t('dataGrid.action.clearFilters'), () => {
    grid.clearFilter();
    log.log('clearFilter', t('dataGrid.log.cleared'));
  });
  const toggles = actionGroup(actions, t('dataGrid.group.group'));
  toggles.classList.add('db-actions__row--column');
  actionToggle(toggles, t('dataGrid.option.filterPanel'), settings.filterPanel, (visible) => {
    settings.filterPanel = visible;
    grid.option('filterPanel.visible', visible);
    log.log('filterPanel.visible', t(visible ? 'dataGrid.log.on' : 'dataGrid.log.off'));
    refresh();
  });
  actionToggle(toggles, t('dataGrid.option.groupByMonth'), settings.groupByMonth, (grouped) => {
    settings.groupByMonth = grouped;
    grid.columnOption(Fields.startMonth, 'groupIndex', grouped ? 0 : undefined);
    log.log('groupIndex', t(grouped ? 'dataGrid.log.grouped' : 'dataGrid.log.ungrouped'));
    refresh();
  });

  refresh();
}

mountPage({ pageId: 'dataGrid', messages: { [Languages.en]: en, [Languages.fa]: fa }, build });
