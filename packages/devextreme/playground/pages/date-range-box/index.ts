import '../../../js/ui/date_range_box';
import $ from 'jquery';
import { getCalendar, getCalendarFirstDayOfWeek } from '../../../js/common/core/localization/calendar';
import {
  actionButton, actionGroup, actionSegmented, actionToggle,
} from '../../shell/actions';
import type { CalendarId } from '../../shell/constants/calendar-ids';
import { Languages } from '../../shell/constants/languages';
import {
  addCalendarMonths, addDays, calendarMonthRange, calendarWeekRange, calendarYearRange, toIsoDate,
} from '../../shell/date-info';
import { requireElement } from '../../shell/dom';
import { formatDate, localDigits } from '../../shell/format';
import { t } from '../../shell/i18n';
import { renderInspector, renderOptions } from '../../shell/inspector';
import type { InspectorRow } from '../../shell/inspector-row';
import { mountPage } from '../../shell/page';
import type { PageContext } from '../../shell/page-context';
import { setState } from '../../shell/state';
import en from './en.json';
import fa from './fa.json';

const ApplyModes = ['instantly', 'useButtons'] as const;
type ApplyMode = typeof ApplyModes[number];
type RangeValue = [Date | null, Date | null];

const EventNames = {
  valueChanged: 'valueChanged',
  opened: 'opened',
  closed: 'closed',
} as const;

const OptionNames = {
  multiView: 'multiView',
  applyValueMode: 'applyValueMode',
  calendar: 'calendar',
} as const;

const PresetIds = ['thisWeek', 'thisMonth', 'lastMonth', 'thisYear', 'nextNights'] as const;
type PresetId = typeof PresetIds[number];

const SHOWN_FORMAT = 'longdate';
const NIGHTS_AHEAD = 7;
const SUNDAY = 0;
const WIDGET_WIDTH = 380;
const MS_PER_DAY = 864e5;
// A short range around today, so no preset equals the starting value.
const INITIAL_BEFORE_DAYS = 2;
const INITIAL_AFTER_DAYS = 3;

interface DateRangeBoxInstance {
  option: {
    (name: string): unknown;
    (name: string, value: unknown): void;
  };
}

const today = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Page settings survive rebuilds (calendar, language or theme changes).
const settings = {
  value: [addDays(today(), -INITIAL_BEFORE_DAYS), addDays(today(), INITIAL_AFTER_DAYS)] as RangeValue,
  multiView: true,
  applyValueMode: 'instantly' as ApplyMode,
};

// Every preset is computed in the active calendar; the results are Gregorian Dates.
function presetRange(id: PresetId, calendar: CalendarId): [Date, Date] {
  const now = today();
  const presets: Record<PresetId, () => [Date, Date]> = {
    thisWeek: () => calendarWeekRange(now, getCalendarFirstDayOfWeek(calendar) ?? SUNDAY),
    thisMonth: () => calendarMonthRange(now, calendar),
    lastMonth: () => calendarMonthRange(addCalendarMonths(now, -1, calendar), calendar),
    thisYear: () => calendarYearRange(now, calendar),
    nextNights: () => [now, addDays(now, NIGHTS_AHEAD)],
  };
  return presets[id]();
}

// Counts the calendar months the range touches, both ends included.
function monthsSpanned(start: Date, end: Date, calendar: CalendarId): number {
  const system = getCalendar(calendar);
  const first = system.toParts(start);
  const last = system.toParts(end);
  let { year, month } = first;
  let count = 1;
  while (year < last.year || (year === last.year && month < last.month)) {
    month += 1;
    if (month >= system.getMonthsInYear(year)) {
      month = 0;
      year += 1;
    }
    count += 1;
  }
  return count;
}

function widgetOptions(calendar: CalendarId): Record<string, unknown> {
  return {
    value: settings.value,
    calendar,
    multiView: settings.multiView,
    applyValueMode: settings.applyValueMode,
    calendarOptions: { showTodayButton: true },
  };
}

const rowFor = (label: string, date: Date | null): InspectorRow => (date
  ? { label, value: toIsoDate(date), tone: 'accent', ltr: true }
  : { label, value: t('inspector.none'), tone: 'muted' });

function inspectorRows(calendar: CalendarId): InspectorRow[] {
  const [start, end] = settings.value;
  const rows: InspectorRow[] = [
    rowFor(t('dateRangeBox.inspector.start'), start),
    rowFor(t('dateRangeBox.inspector.end'), end),
  ];
  if (start && end) {
    rows.push(
      {
        label: t('inspector.shown'),
        value: `${formatDate(start, calendar, SHOWN_FORMAT)} — ${formatDate(end, calendar, SHOWN_FORMAT)}`,
        tone: 'ok',
      },
      { label: t('dateRangeBox.inspector.nights'), value: localDigits(Math.round((end.getTime() - start.getTime()) / MS_PER_DAY)) },
      { label: t('dateRangeBox.inspector.months'), value: localDigits(monthsSpanned(start, end, calendar)) },
    );
  }
  rows.push({ label: t('dateRangeBox.inspector.apply'), value: settings.applyValueMode, tone: 'muted', ltr: true });
  return rows;
}

function build({
  state, rtl, log, widgets,
}: PageContext): void {
  const { calendar } = state;
  const inspector = requireElement('#inspector');
  const optionsHost = requireElement('#options');
  const actions = requireElement('#actions');

  const refresh = (): void => {
    renderInspector(inspector, inspectorRows(calendar));
    renderOptions(optionsHost, widgetOptions(calendar));
  };

  const instance = widgets.add($('#daterangebox').dxDateRangeBox({
    ...widgetOptions(calendar),
    rtlEnabled: rtl,
    width: WIDGET_WIDTH,
    onValueChanged: (e: { value: RangeValue }): void => {
      const [start = null, end = null] = e.value ?? [];
      settings.value = [start, end];
      if (start && end) {
        log.log(EventNames.valueChanged, t('dateRangeBox.log.value', {
          start: formatDate(start, calendar, SHOWN_FORMAT),
          end: formatDate(end, calendar, SHOWN_FORMAT),
          startIso: toIsoDate(start),
          endIso: toIsoDate(end),
        }));
      } else log.log(EventNames.valueChanged, t('dateRangeBox.log.cleared'));
      refresh();
    },
    onOpened: (): void => log.log(EventNames.opened, t('dateRangeBox.log.opened')),
    onClosed: (): void => log.log(EventNames.closed, t('dateRangeBox.log.closed')),
    onOptionChanged: (e: { name: string; value: unknown }): void => {
      if (e.name === OptionNames.calendar && e.value !== calendar) {
        // The in-widget picker changed the calendar: make it the site-wide one.
        setState({ calendar: e.value as CalendarId });
      }
    },
  }).dxDateRangeBox('instance')) as DateRangeBoxInstance;

  actions.replaceChildren();

  actionButton(
    actionGroup(actions, t('dateRangeBox.group.value')),
    t('dateRangeBox.action.clear'),
    () => instance.option('value', [null, null]),
  );

  const presets = actionGroup(actions, t('dateRangeBox.group.presets'));
  PresetIds.forEach((id, index) => actionButton(
    presets,
    t(`dateRangeBox.preset.${id}`),
    () => instance.option('value', presetRange(id, calendar)),
    index === 0 ? 'primary' : 'secondary',
  ));

  const view = actionGroup(actions, t('dateRangeBox.group.view'));
  view.classList.add('db-actions__row--column');
  actionToggle(view, t('dateRangeBox.option.multiView'), settings.multiView, (multiView) => {
    settings.multiView = multiView;
    instance.option(OptionNames.multiView, multiView);
    log.log(OptionNames.multiView, String(multiView));
    refresh();
  });

  actionSegmented(
    actionGroup(actions, t('dateRangeBox.group.apply')),
    t('dateRangeBox.group.apply'),
    ApplyModes.map((value) => ({ value, text: t(`dateRangeBox.apply.${value}`) })),
    settings.applyValueMode,
    (applyValueMode) => {
      settings.applyValueMode = applyValueMode;
      instance.option(OptionNames.applyValueMode, applyValueMode);
      log.log(OptionNames.applyValueMode, applyValueMode);
      refresh();
    },
  );

  refresh();
}

mountPage({ pageId: 'dateRangeBox', messages: { [Languages.en]: en, [Languages.fa]: fa }, build });
