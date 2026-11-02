import '../../../js/ui/date_box';
import $ from 'jquery';
import {
  actionButton, actionGroup, actionSegmented, actionToggle,
} from '../../shell/actions';
import { CALENDAR_SWITCHER } from '../../shell/constants/calendar-ids';
import type { CalendarId } from '../../shell/constants/calendar-ids';
import { Languages } from '../../shell/constants/languages';
import { addCalendarMonths, addDays, toIsoDate } from '../../shell/date-info';
import { dateRows, storedRow } from '../../shell/date-rows';
import { requireElement } from '../../shell/dom';
import { formatDate } from '../../shell/format';
import { t } from '../../shell/i18n';
import { renderInspector, renderOptions } from '../../shell/inspector';
import type { InspectorRow } from '../../shell/inspector-row';
import { mountPage } from '../../shell/page';
import type { PageContext } from '../../shell/page-context';
import { setState } from '../../shell/state';
import en from './en.json';
import fa from './fa.json';

const DateBoxTypes = ['date', 'datetime', 'time'] as const;
const PickerTypes = ['calendar', 'rollers'] as const;
const FormatChoices = ['default', 'long'] as const;
type DateBoxType = typeof DateBoxTypes[number];
type PickerType = typeof PickerTypes[number];
type FormatChoice = typeof FormatChoices[number];

const EventNames = {
  valueChanged: 'valueChanged',
  opened: 'opened',
  closed: 'closed',
  focusIn: 'focusIn',
  focusOut: 'focusOut',
} as const;

const OptionNames = {
  type: 'type',
  pickerType: 'pickerType',
  useMaskBehavior: 'useMaskBehavior',
  displayFormat: 'displayFormat',
  text: 'text',
  calendar: 'calendar',
  calendarSwitcher: 'calendarSwitcher',
} as const;

// The display formats the widget falls back to per type when displayFormat is unset.
const DEFAULT_FORMATS: Record<DateBoxType, string> = {
  date: 'shortdate',
  datetime: 'shortdateshorttime',
  time: 'shorttime',
};
const LONG_FORMATS: Record<DateBoxType, string> = {
  date: 'longdate',
  datetime: 'longdatelongtime',
  time: 'longtime',
};
// Shown in the inspector's "Shown" row, per type.
const SHOWN_FORMATS: Record<DateBoxType, string> = {
  date: 'longdate',
  datetime: 'longdatelongtime',
  time: 'longtime',
};

const WIDGET_WIDTH = 320;
const INITIAL_VALUE = new Date(2024, 2, 20, 10, 30);

interface DateBoxInstance {
  option: {
    (name: string): unknown;
    (name: string, value: unknown): void;
  };
  open: () => void;
  // The format the widget really applies, calendar default included.
  _getEffectiveDisplayFormatOption?: () => unknown;
}

const today = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const nowToMinute = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
};

// Page settings survive rebuilds (calendar, language or theme changes).
const settings = {
  value: INITIAL_VALUE as Date | null,
  type: 'date' as DateBoxType,
  pickerType: 'calendar' as PickerType,
  useMaskBehavior: false,
  format: 'default' as FormatChoice,
  // Off by default: the library labels the Arabic calendar "Hijri" in the switcher.
  switcher: false,
};

const displayFormatOption = (): string | null => (settings.format === 'long' ? LONG_FORMATS[settings.type] : null);

function widgetOptions(calendar: CalendarId): Record<string, unknown> {
  const options: Record<string, unknown> = {
    value: settings.value,
    type: settings.type,
    pickerType: settings.pickerType,
    calendar,
    calendarSwitcher: settings.switcher ? CALENDAR_SWITCHER : false,
    useMaskBehavior: settings.useMaskBehavior,
    calendarOptions: { showTodayButton: true },
  };
  const displayFormat = displayFormatOption();
  if (displayFormat) options.displayFormat = displayFormat;
  return options;
}

function inspectorRows(calendar: CalendarId, instance: DateBoxInstance | undefined): InspectorRow[] {
  const { value, type } = settings;
  const rows: InspectorRow[] = type === 'time'
    ? [
      storedRow(value, true),
      ...(value ? [{ label: t('inspector.shown'), value: formatDate(value, calendar, SHOWN_FORMATS.time), tone: 'ok' as const }] : []),
    ]
    : dateRows(value, calendar, type === 'datetime');
  const effective = instance?._getEffectiveDisplayFormatOption?.();
  const text = String(instance?.option(OptionNames.text) ?? '');
  rows.push(
    { label: t('dateBox.inspector.type'), value: t(`dateBox.type.${type}`) },
    { label: t('dateBox.inspector.text'), value: text || t('inspector.none'), tone: text ? 'ok' : 'muted' },
    {
      label: t('dateBox.inspector.format'),
      value: typeof effective === 'string' ? effective : DEFAULT_FORMATS[type],
      tone: 'muted',
      ltr: true,
    },
  );
  return rows;
}

function build({
  state, rtl, log, widgets,
}: PageContext): void {
  const { calendar } = state;
  const inspector = requireElement('#inspector');
  const optionsHost = requireElement('#options');
  const actions = requireElement('#actions');
  let instance: DateBoxInstance | undefined;

  const refresh = (): void => {
    renderInspector(inspector, inspectorRows(calendar, instance));
    renderOptions(optionsHost, widgetOptions(calendar));
  };

  instance = widgets.add($('#datebox').dxDateBox({
    ...widgetOptions(calendar),
    rtlEnabled: rtl,
    width: WIDGET_WIDTH,
    onValueChanged: (e: { value: Date | null }): void => {
      settings.value = e.value ?? null;
      if (e.value) {
        log.log(EventNames.valueChanged, t('dateBox.log.value', {
          shown: formatDate(e.value, calendar, SHOWN_FORMATS[settings.type]),
          iso: toIsoDate(e.value),
        }));
      } else log.log(EventNames.valueChanged, t('dateBox.log.cleared'));
      refresh();
    },
    onOpened: (): void => log.log(EventNames.opened, t('dateBox.log.opened')),
    onClosed: (): void => log.log(EventNames.closed, t('dateBox.log.closed')),
    onFocusIn: (): void => log.log(EventNames.focusIn, t('dateBox.log.focusIn')),
    onFocusOut: (): void => log.log(EventNames.focusOut, t('dateBox.log.focusOut')),
    onOptionChanged: (e: { name: string; value: unknown }): void => {
      if (e.name === OptionNames.text) refresh();
      else if (e.name === OptionNames.calendar && e.value !== calendar) {
        // The in-widget picker changed the calendar: make it the site-wide one.
        setState({ calendar: e.value as CalendarId });
      }
    },
  }).dxDateBox('instance')) as DateBoxInstance;

  const setValue = (value: Date | null): void => instance?.option('value', value);
  const valueBase = (): Date => settings.value ?? today();

  actions.replaceChildren();

  actionSegmented(
    actionGroup(actions, t('dateBox.group.type')),
    t('dateBox.group.type'),
    DateBoxTypes.map((value) => ({ value, text: t(`dateBox.type.${value}`) })),
    settings.type,
    (type) => {
      settings.type = type;
      // The mode goes in first; the format that matches it follows, then the value.
      instance?.option(OptionNames.type, type);
      instance?.option(OptionNames.displayFormat, displayFormatOption());
      log.log(OptionNames.type, t(`dateBox.type.${type}`));
      refresh();
    },
  );

  actionSegmented(
    actionGroup(actions, t('dateBox.group.picker')),
    t('dateBox.group.picker'),
    PickerTypes.map((value) => ({ value, text: t(`dateBox.picker.${value}`) })),
    settings.pickerType,
    (pickerType) => {
      settings.pickerType = pickerType;
      instance?.option(OptionNames.pickerType, pickerType);
      log.log(OptionNames.pickerType, t(`dateBox.picker.${pickerType}`));
      refresh();
    },
  );

  actionSegmented(
    actionGroup(actions, t('dateBox.group.format')),
    t('dateBox.group.format'),
    FormatChoices.map((value) => ({ value, text: t(`dateBox.format.${value}`) })),
    settings.format,
    (format) => {
      settings.format = format;
      instance?.option(OptionNames.displayFormat, displayFormatOption());
      log.log(OptionNames.displayFormat, displayFormatOption() ?? t('dateBox.format.default'));
      refresh();
    },
  );

  const input = actionGroup(actions, t('dateBox.group.input'));
  input.classList.add('db-actions__row--column');
  actionToggle(input, t('dateBox.option.mask'), settings.useMaskBehavior, (useMaskBehavior) => {
    settings.useMaskBehavior = useMaskBehavior;
    instance?.option(OptionNames.useMaskBehavior, useMaskBehavior);
    log.log(OptionNames.useMaskBehavior, String(useMaskBehavior));
    refresh();
  });
  actionToggle(input, t('dateBox.option.switcher'), settings.switcher, (switcher) => {
    settings.switcher = switcher;
    instance?.option(OptionNames.calendarSwitcher, widgetOptions(calendar).calendarSwitcher);
    log.log(OptionNames.calendarSwitcher, switcher ? JSON.stringify(CALENDAR_SWITCHER) : String(false));
    refresh();
  });

  const values = actionGroup(actions, t('dateBox.group.value'));
  actionButton(values, t('dateBox.action.clear'), () => setValue(null));
  actionButton(values, t('dateBox.action.today'), () => setValue(settings.type === 'date' ? today() : nowToMinute()), 'primary');
  actionButton(values, t('dateBox.action.plusDay'), () => setValue(addDays(valueBase(), 1)));
  actionButton(values, t('dateBox.action.plusMonth'), () => setValue(addCalendarMonths(valueBase(), 1, calendar)));

  actionButton(actionGroup(actions, t('dateBox.group.popup')), t('dateBox.action.open'), () => instance?.open());

  refresh();
}

mountPage({ pageId: 'dateBox', messages: { [Languages.en]: en, [Languages.fa]: fa }, build });
