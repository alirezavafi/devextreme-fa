import '../../../js/ui/pivot_grid';
import $ from 'jquery';
import { getCalendar, getCalendarMonthNamesInActiveLocale } from '../../../js/common/core/localization/calendar';
import { actionButton, actionGroup, actionToggle } from '../../shell/actions';
import type { CalendarId } from '../../shell/constants/calendar-ids';
import { Languages } from '../../shell/constants/languages';
import {
  calendarMonthRange, calendarYearRange, toIsoDate,
} from '../../shell/date-info';
import { requireElement } from '../../shell/dom';
import { formatDate, localDigits } from '../../shell/format';
import { t } from '../../shell/i18n';
import { renderInspector, renderOptions } from '../../shell/inspector';
import type { InspectorRow } from '../../shell/inspector-row';
import { mountPage } from '../../shell/page';
import type { PageContext } from '../../shell/page-context';
import { buildSales } from './data';
import en from './en.json';
import fa from './fa.json';

const Levels = { year: 'year', quarter: 'quarter', month: 'month' } as const;
type Level = typeof Levels[keyof typeof Levels];

const Areas = {
  row: 'row', column: 'column', data: 'data',
} as const;

const MONTHS_PER_QUARTER = 3;
const MS_PER_DAY = 864e5;
const PIVOT_HEIGHT = 520;
const FIELD_CHOOSER_HEIGHT = 480;
const FIRST_DAY = 1;
const FIELD_CHOOSER_LOG_NAME = 'fieldChooser';

const sales = buildSales();
const saleDates = sales.map((s) => s.date.getTime());
const SALES_RANGE: [Date, Date] = [new Date(Math.min(...saleDates)), new Date(Math.max(...saleDates))];

// Page settings survive rebuilds. The clicked cell does not: its period belongs
// to the calendar that was active when it was clicked.
const settings = { quarterLevel: true };

interface Period {
  label: string;
  level: Level | null;
  from: Date;
  to: Date;
}

interface PivotCell {
  type?: string;
  text?: string;
  path?: unknown[];
  rowPath?: unknown[];
  columnPath?: unknown[];
}

interface CellClickEvent {
  area: string;
  cell: PivotCell;
}

interface HeaderItem {
  children?: HeaderItem[];
}

const rowLevels = (): Level[] => (settings.quarterLevel
  ? [Levels.year, Levels.quarter, Levels.month]
  : [Levels.year, Levels.month]);

const countItems = (items: HeaderItem[] = []): number => items
  .reduce((sum, item) => sum + 1 + countItems(item.children), 0);

function periodOf(path: unknown[], calendar: CalendarId): Period {
  if (!path.length) return { label: t('pivotGrid.period.all'), level: null, from: SALES_RANGE[0], to: SALES_RANGE[1] };
  const system = getCalendar(calendar);
  const levels = rowLevels();
  const level = levels[path.length - 1];
  const year = Number(path[0]);
  const monthNames = getCalendarMonthNamesInActiveLocale(calendar, 'wide');
  const monthStart = (month: number): Date => system.fromParts({ year, month, day: FIRST_DAY });
  if (level === Levels.year) {
    const [from, to] = calendarYearRange(monthStart(0), calendar);
    return { label: localDigits(year), level, from, to };
  }
  if (level === Levels.quarter) {
    const first = Number(path[1]) * MONTHS_PER_QUARTER;
    return {
      label: `${t('pivotGrid.quarter', { n: localDigits(Number(path[1]) + 1) })} ${localDigits(year)}`,
      level,
      from: calendarMonthRange(monthStart(first), calendar)[0],
      to: calendarMonthRange(monthStart(first + MONTHS_PER_QUARTER - 1), calendar)[1],
    };
  }
  const month = Number(path[path.length - 1]);
  const [from, to] = calendarMonthRange(monthStart(month), calendar);
  return { label: `${monthNames[month]} ${localDigits(year)}`, level, from, to };
}

function cellRows(event: CellClickEvent, calendar: CalendarId): InspectorRow[] {
  const { area, cell } = event;
  const rowPath = (area === Areas.row ? cell.path : cell.rowPath) ?? [];
  const columnPath = (area === Areas.column ? cell.path : cell.columnPath) ?? [];
  const period = area === Areas.column ? periodOf([], calendar) : periodOf(rowPath, calendar);
  const region = columnPath.length ? t(`pivotGrid.region.${String(columnPath[0])}`) : t('pivotGrid.region.all');
  const rows: InspectorRow[] = [
    { label: t('pivotGrid.inspector.gregorian'), value: `${toIsoDate(period.from)} → ${toIsoDate(period.to)}`, tone: 'accent', ltr: true },
    { label: t('inspector.shown'), value: `${formatDate(period.from, calendar)} — ${formatDate(period.to, calendar)}`, tone: 'ok' },
    { label: t('pivotGrid.inspector.period'), value: period.label },
    { label: t('pivotGrid.inspector.level'), value: period.level ? t(`pivotGrid.level.${period.level}`) : t('pivotGrid.period.all') },
    { label: t('pivotGrid.inspector.region'), value: region },
    { label: t('pivotGrid.inspector.cell'), value: t(`pivotGrid.area.${area}`) },
    {
      label: t('pivotGrid.inspector.days'),
      value: localDigits(Math.round((period.to.getTime() - period.from.getTime()) / MS_PER_DAY) + 1),
    },
  ];
  if (area === Areas.data) rows.push({ label: t('pivotGrid.field.amount'), value: cell.text ?? '', tone: 'ok' });
  return rows;
}

function buildFields(calendar: CalendarId): Record<string, unknown>[] {
  const system = getCalendar(calendar);
  const monthNames = getCalendarMonthNamesInActiveLocale(calendar, 'wide');
  const partsOf = (data: { date: Date }): { year: number; month: number } => system.toParts(data.date);
  const asNumber = (info: { value?: string | number | Date }): number => Number(info.value);
  return [
    {
      name: Levels.year,
      caption: t('pivotGrid.field.year'),
      area: Areas.row,
      areaIndex: 0,
      expanded: true,
      // The calendar year of the stored Gregorian date.
      selector: (data: { date: Date }): number => partsOf(data).year,
      customizeText: (info: { value?: string | number | Date }): string => localDigits(asNumber(info)),
    },
    {
      name: Levels.quarter,
      caption: t('pivotGrid.field.quarter'),
      area: settings.quarterLevel ? Areas.row : undefined,
      areaIndex: 1,
      selector: (data: { date: Date }): number => Math.floor(partsOf(data).month / MONTHS_PER_QUARTER),
      customizeText: (info: { value?: string | number | Date }): string => t('pivotGrid.quarter', { n: localDigits(asNumber(info) + 1) }),
    },
    {
      name: Levels.month,
      caption: t('pivotGrid.field.month'),
      area: Areas.row,
      areaIndex: 2,
      // The 0-based calendar month; sorting by it keeps the months in order.
      selector: (data: { date: Date }): number => partsOf(data).month,
      customizeText: (info: { value?: string | number | Date }): string => monthNames[asNumber(info)],
      sortBy: 'value',
    },
    {
      name: 'region',
      dataField: 'region',
      caption: t('pivotGrid.field.region'),
      area: Areas.column,
      customizeText: (info: { value?: string | number | Date }): string => t(`pivotGrid.region.${String(info.value)}`),
    },
    {
      dataField: 'amount',
      caption: t('pivotGrid.field.amount'),
      dataType: 'number',
      summaryType: 'sum',
      format: { type: 'fixedPoint', precision: 0 },
      area: Areas.data,
    },
  ];
}

const sourceFor = (calendar: CalendarId): Record<string, unknown> => ({ store: sales, retrieveFields: false, fields: buildFields(calendar) });

function build({
  state, rtl, log, widgets,
}: PageContext): void {
  const { calendar } = state;
  const inspector = requireElement('#inspector');
  const optionsHost = requireElement('#options');
  const actions = requireElement('#actions');

  const refreshOptions = (): void => renderOptions(optionsHost, {
    allowExpandAll: true,
    fieldChooser: { enabled: true },
    rowFields: rowLevels(),
    columnFields: ['region'],
    dataFields: [{ dataField: 'amount', summaryType: 'sum' }],
    calendar,
  });
  const showPrompt = (): void => renderInspector(inspector, [
    { label: t('card.inspector'), value: t('pivotGrid.inspector.empty'), tone: 'muted' },
  ]);

  const pivot = widgets.add($('#pivot').dxPivotGrid({
    rtlEnabled: rtl,
    height: PIVOT_HEIGHT,
    showBorders: true,
    allowExpandAll: true,
    allowSortingBySummary: true,
    wordWrapEnabled: false,
    fieldChooser: { enabled: true, height: FIELD_CHOOSER_HEIGHT, allowSearch: true },
    dataSource: sourceFor(calendar),
    onCellClick: (e: CellClickEvent): void => {
      const rows = cellRows(e, calendar);
      renderInspector(inspector, rows);
      log.log('cellClick', `${t(`pivotGrid.area.${e.area}`)} · ${e.cell.text ?? ''}`);
    },
    onContentReady: (e: { component: { getDataSource: () => { getData: () => { rows: HeaderItem[]; columns: HeaderItem[] } } } }): void => {
      const data = e.component.getDataSource().getData();
      log.log('contentReady', t('pivotGrid.log.ready', {
        rows: localDigits(countItems(data.rows)), columns: localDigits(countItems(data.columns)),
      }));
    },
  } as never).dxPivotGrid('instance'));

  const source = (): { expandAll: (id: string) => void; collapseAll: (id: string) => void; field: (id: string, options: object) => void } => pivot
    .getDataSource() as never;

  actions.replaceChildren();
  const levels = actionGroup(actions, t('pivotGrid.group.levels'));
  actionButton(levels, t('pivotGrid.action.expandAll'), () => {
    rowLevels().forEach((level) => source().expandAll(level));
    log.log('expandAll', t('pivotGrid.log.expanded'));
  }, 'primary');
  actionButton(levels, t('pivotGrid.action.collapseAll'), () => {
    [...rowLevels()].reverse().forEach((level) => source().collapseAll(level));
    log.log('collapseAll', t('pivotGrid.log.collapsed'));
  });
  const options = actionGroup(actions, t('pivotGrid.group.options'));
  options.classList.add('db-actions__row--column');
  actionToggle(options, t('pivotGrid.option.quarter'), settings.quarterLevel, (quarterLevel) => {
    settings.quarterLevel = quarterLevel;
    pivot.option('dataSource', sourceFor(calendar));
    log.log('dataSource.fields', t(quarterLevel ? 'pivotGrid.log.quarterOn' : 'pivotGrid.log.quarterOff'));
    refreshOptions();
  });
  const chooser = actionGroup(actions, t('pivotGrid.group.chooser'));
  actionButton(chooser, t('pivotGrid.action.fieldChooser'), () => {
    pivot.getFieldChooserPopup().show();
    log.log(FIELD_CHOOSER_LOG_NAME, t('pivotGrid.log.chooserOpen'));
  });

  showPrompt();
  refreshOptions();
}

mountPage({ pageId: 'pivotGrid', messages: { [Languages.en]: en, [Languages.fa]: fa }, build });
