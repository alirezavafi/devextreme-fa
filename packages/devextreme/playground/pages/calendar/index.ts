import '../../../js/ui/calendar';
import $ from 'jquery';
import dateLocalization from '../../../js/common/core/localization/date';
import {
  actionButton, actionGroup, actionSegmented, actionToggle,
} from '../../shell/actions';
import { CALENDAR_SWITCHER } from '../../shell/constants/calendar-ids';
import type { CalendarId } from '../../shell/constants/calendar-ids';
import { Languages } from '../../shell/constants/languages';
import {
  addCalendarMonths, addDays, calendarYearRange, startOfCalendarYear, toIsoDate,
} from '../../shell/date-info';
import { dateRows } from '../../shell/date-rows';
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

const ZoomLevels = ['month', 'year', 'decade', 'century'] as const;
const SelectionModes = ['single', 'multiple', 'range'] as const;
type ZoomLevel = typeof ZoomLevels[number];
type SelectionMode = typeof SelectionModes[number];

const AUTO_FIRST_DAY = 'auto';
const FRIDAY = 5;
const DEFAULT_RANGE_DAYS = 7;
// Wide enough for Persian weekday names, which have no short form.
const CALENDAR_WIDTH = 360;
const MS_PER_DAY = 864e5;
const MAX_LISTED_DATES = 6;
// dxCalendar's own min/max defaults, restored when the year limit is switched off.
const UNBOUNDED_MIN = new Date(1000, 0);
const UNBOUNDED_MAX = new Date(3000, 0);
const FIRST_DAY_CHOICES = [AUTO_FIRST_DAY, '6', '0', '1'] as const;
type FirstDayChoice = typeof FIRST_DAY_CHOICES[number];

const today = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Page settings survive rebuilds (calendar, language or theme changes).
const settings = {
  value: today() as Date | Date[] | null,
  currentDate: today(),
  zoomLevel: 'month' as ZoomLevel,
  firstDay: AUTO_FIRST_DAY as FirstDayChoice,
  selectionMode: 'single' as SelectionMode,
  weekNumbers: false,
  disableFridays: false,
  limitYear: false,
  switcher: false,
};

const asDates = (value: Date | Date[] | null): Date[] => {
  if (Array.isArray(value)) return value.filter((d): d is Date => d instanceof Date);
  return value instanceof Date ? [value] : [];
};

function valueFor(mode: SelectionMode, dates: Date[]): Date | Date[] | null {
  const first = dates[0] ?? today();
  if (mode === 'single') return first;
  if (mode === 'multiple') return dates.length ? dates : [first];
  return [first, dates[1] ?? addDays(first, DEFAULT_RANGE_DAYS - 1)];
}

function widgetOptions(calendar: CalendarId): Record<string, unknown> {
  const options: Record<string, unknown> = {
    value: settings.value,
    currentDate: settings.currentDate,
    calendar,
    zoomLevel: settings.zoomLevel,
    selectionMode: settings.selectionMode,
    showTodayButton: true,
    showWeekNumbers: settings.weekNumbers,
  };
  if (settings.firstDay !== AUTO_FIRST_DAY) options.firstDayOfWeek = Number(settings.firstDay);
  if (settings.disableFridays) {
    options.disabledDates = (args: { date: Date; view: string }): boolean => args.view === 'month' && args.date.getDay() === FRIDAY;
  }
  if (settings.limitYear) {
    const [min, max] = calendarYearRange(today(), calendar);
    Object.assign(options, { min, max });
  }
  if (settings.switcher) options.calendarSwitcher = CALENDAR_SWITCHER;
  return options;
}

function inspectorRows(calendar: CalendarId, view: Date, zoom: string): InspectorRow[] {
  const dates = asDates(settings.value);
  const rows: InspectorRow[] = [];
  if (settings.selectionMode === 'single' || dates.length <= 1) {
    rows.push(...dateRows(dates[0], calendar));
  } else if (settings.selectionMode === 'range') {
    const [start, end = start] = dates;
    rows.push(
      { label: t('calendar.inspector.start'), value: toIsoDate(start), tone: 'accent', ltr: true },
      { label: t('calendar.inspector.end'), value: toIsoDate(end), tone: 'accent', ltr: true },
      { label: t('inspector.shown'), value: `${formatDate(start, calendar)} — ${formatDate(end, calendar)}`, tone: 'ok' },
      { label: t('calendar.inspector.days'), value: localDigits(Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1) },
    );
  } else {
    rows.push(
      { label: t('calendar.inspector.count'), value: localDigits(dates.length) },
      ...dates.slice(0, MAX_LISTED_DATES).map((d): InspectorRow => ({ label: toIsoDate(d), value: formatDate(d, calendar) })),
    );
  }
  rows.push(
    { label: t('calendar.inspector.view'), value: formatDate(view, calendar, 'monthandyear') },
    { label: t('calendar.inspector.zoom'), value: t(`calendar.zoom.${zoom}`) },
  );
  return rows;
}

function build({
  state, rtl, log, widgets, rebuild,
}: PageContext): void {
  const { calendar } = state;
  const inspector = requireElement('#inspector');
  const optionsHost = requireElement('#options');
  const actions = requireElement('#actions');

  const refresh = (): void => {
    renderInspector(inspector, inspectorRows(calendar, settings.currentDate, settings.zoomLevel));
    renderOptions(optionsHost, widgetOptions(calendar));
  };

  const instance = widgets.add($('#calendar').dxCalendar({
    ...widgetOptions(calendar),
    rtlEnabled: rtl,
    width: CALENDAR_WIDTH,
    onValueChanged: (e: { value: Date | Date[] | null }): void => {
      settings.value = e.value;
      const dates = asDates(e.value);
      if (!dates.length) log.log('valueChanged', t('calendar.log.cleared'));
      else if (dates.length === 1) {
        log.log('valueChanged', t('calendar.log.selected', { shown: formatDate(dates[0], calendar), iso: toIsoDate(dates[0]) }));
      } else log.log('valueChanged', t('calendar.log.selectedMany', { count: dates.length }));
      refresh();
    },
    onOptionChanged: (e: { name: string; value: unknown }): void => {
      if (e.name === 'currentDate' && e.value instanceof Date) {
        settings.currentDate = e.value;
        log.log('currentDate', t('calendar.log.view', { view: formatDate(e.value, calendar, 'monthandyear') }));
        refresh();
      } else if (e.name === 'zoomLevel') {
        settings.zoomLevel = e.value as ZoomLevel;
        log.log('zoomLevel', t(`calendar.zoom.${String(e.value)}`));
        refresh();
      } else if (e.name === 'calendar' && e.value !== calendar) {
        // The in-widget picker changed the calendar: make it the site-wide one.
        setState({ calendar: e.value as CalendarId });
      }
    },
  }).dxCalendar('instance'));

  const set = (patch: Partial<typeof settings>): void => {
    Object.assign(settings, patch);
    const { selectionMode, value, ...rest } = widgetOptions(calendar);
    instance.option(rest);
    // A selectionMode change resets the value, so the value goes in after it.
    instance.option('selectionMode', selectionMode);
    instance.option('value', value);
    refresh();
  };

  actions.replaceChildren();
  const navigate = actionGroup(actions, t('calendar.group.navigate'));
  actionButton(navigate, t('calendar.action.today'), () => set({
    value: valueFor(settings.selectionMode, [today()]), currentDate: today(), zoomLevel: 'month',
  }), 'primary');
  actionButton(navigate, t('calendar.action.prevMonth'), () => set({ currentDate: addCalendarMonths(settings.currentDate, -1, calendar) }));
  actionButton(navigate, t('calendar.action.nextMonth'), () => set({ currentDate: addCalendarMonths(settings.currentDate, 1, calendar) }));
  actionButton(navigate, t('calendar.action.startOfYear'), () => {
    const start = startOfCalendarYear(asDates(settings.value)[0] ?? today(), calendar);
    set({ value: valueFor(settings.selectionMode, [start]), currentDate: start, zoomLevel: 'month' });
  });

  actionSegmented(
    actionGroup(actions, t('calendar.group.zoom')),
    t('calendar.group.zoom'),
    ZoomLevels.map((value) => ({ value, text: t(`calendar.zoom.${value}`) })),
    settings.zoomLevel,
    (zoomLevel) => set({ zoomLevel }),
  );

  const dayNames = dateLocalization.getDayNames('abbreviated');
  actionSegmented(
    actionGroup(actions, t('calendar.group.firstDay')),
    t('calendar.group.firstDay'),
    FIRST_DAY_CHOICES.map((value) => ({
      value, text: value === AUTO_FIRST_DAY ? t('calendar.firstDay.auto') : dayNames[Number(value)],
    })),
    settings.firstDay,
    (firstDay) => {
      settings.firstDay = firstDay;
      log.log('firstDayOfWeek', firstDay === AUTO_FIRST_DAY ? t('calendar.firstDay.auto') : dayNames[Number(firstDay)]);
      // firstDayOfWeek cannot be reset to the calendar's default at runtime.
      rebuild();
    },
  );

  actionSegmented(
    actionGroup(actions, t('calendar.group.selection')),
    t('calendar.group.selection'),
    SelectionModes.map((value) => ({ value, text: t(`calendar.selection.${value}`) })),
    settings.selectionMode,
    (selectionMode) => set({ selectionMode, value: valueFor(selectionMode, asDates(settings.value)) }),
  );

  const toggles = actionGroup(actions, t('calendar.group.options'));
  toggles.classList.add('db-actions__row--column');
  actionToggle(toggles, t('calendar.option.weekNumbers'), settings.weekNumbers, (weekNumbers) => {
    set({ weekNumbers });
    log.log('showWeekNumbers', String(weekNumbers));
  });
  actionToggle(toggles, t('calendar.option.disableFridays'), settings.disableFridays, (disableFridays) => {
    settings.disableFridays = disableFridays;
    instance.option('disabledDates', widgetOptions(calendar).disabledDates ?? null);
    log.log('disabledDates', disableFridays ? t('calendar.log.fridays') : t('calendar.log.noLimit'));
    refresh();
  });
  actionToggle(toggles, t('calendar.option.limitYear'), settings.limitYear, (limitYear) => {
    settings.limitYear = limitYear;
    const { min, max } = widgetOptions(calendar) as { min?: Date; max?: Date };
    instance.option({ min: min ?? UNBOUNDED_MIN, max: max ?? UNBOUNDED_MAX });
    log.log('min / max', min && max
      ? `${formatDate(min, calendar)} … ${formatDate(max, calendar)}`
      : t('calendar.log.noLimit'));
    refresh();
  });
  actionToggle(toggles, t('calendar.option.switcher'), settings.switcher, (switcher) => {
    settings.switcher = switcher;
    instance.option('calendarSwitcher', widgetOptions(calendar).calendarSwitcher ?? false);
    log.log('calendarSwitcher', switcher ? JSON.stringify(CALENDAR_SWITCHER) : String(false));
    refresh();
  });

  refresh();
}

mountPage({ pageId: 'calendar', messages: { [Languages.en]: en, [Languages.fa]: fa }, build });
