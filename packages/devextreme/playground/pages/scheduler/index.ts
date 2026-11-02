import '../../../js/ui/scheduler';
import $ from 'jquery';
import { getCalendarFirstDayOfWeek } from '../../../js/common/core/localization/calendar';
import dateLocalization from '../../../js/common/core/localization/date';
import {
  actionButton, actionGroup, actionSegmented, actionToggle,
} from '../../shell/actions';
import { CALENDAR_ID_LIST } from '../../shell/constants/calendar-ids';
import type { CalendarId } from '../../shell/constants/calendar-ids';
import { Languages } from '../../shell/constants/languages';
import { describeDate, startOfCalendarYear, toIsoDateTime } from '../../shell/date-info';
import { requireElement } from '../../shell/dom';
import { formatDate, localDigits } from '../../shell/format';
import { t } from '../../shell/i18n';
import { renderInspector, renderOptions } from '../../shell/inspector';
import type { InspectorRow } from '../../shell/inspector-row';
import { mountPage } from '../../shell/page';
import type { PageContext } from '../../shell/page-context';
import type { Appointment, SeedKey } from './data';
import {
  Recurrence, refreshSeeds, SeedKeys, seedAppointments, seedTexts, today,
} from './data';
import en from './en.json';
import fa from './fa.json';

const Views = ['day', 'week', 'workWeek', 'month', 'timelineWeek', 'agenda'] as const;
type SchedulerView = typeof Views[number];

const AUTO_FIRST_DAY = 'auto';
const FIRST_DAY_CHOICES = [AUTO_FIRST_DAY, '6', '0', '1'] as const;
type FirstDayChoice = typeof FIRST_DAY_CHOICES[number];

// The kit's pressed look for the active view button.
const CURRENT_VIEW_CLASS = 'db-btn--primary';
const SCHEDULER_HEIGHT = 720;
const FIRST_VISIBLE_HOUR = 7;
const LAST_VISIBLE_HOUR = 21;
const NEW_APPOINTMENT_HOUR = 10;
const MS_PER_HOUR = 36e5;
const DateTypes = {
  dateTime: 'shortdateshorttime',
  longDateTime: 'longdatelongtime',
  shortDate: 'shortdate',
  longDate: 'longdate',
} as const;
const OptionNames = {
  currentView: 'currentView',
  currentDate: 'currentDate',
  showAllDayPanel: 'showAllDayPanel',
  firstDayOfWeek: 'firstDayOfWeek',
} as const;
const EventNames = {
  added: 'appointmentAdded',
  updated: 'appointmentUpdated',
  deleted: 'appointmentDeleted',
  click: 'appointmentClick',
  popup: 'showAppointmentPopup',
} as const;

// Page settings survive rebuilds (calendar, language or theme changes).
const settings = {
  currentView: 'week' as SchedulerView,
  currentDate: today(),
  firstDay: AUTO_FIRST_DAY as FirstDayChoice,
  showAllDayPanel: true,
  appointments: null as Appointment[] | null,
  selected: null as Appointment | null,
  occurrence: null as Date | null,
  seedTexts: new Map<SeedKey, string>(),
};

interface AppointmentEvent {
  appointmentData: Appointment;
  targetedAppointmentData?: Appointment;
}

// "Auto" is resolved here rather than left unset: the week views draw their grid
// from Sunday and the navigator caption from the locale's first day, and neither
// applies the calendar's own default (Saturday for Persian and Hijri). Passing the
// resolved day keeps the grid and the caption in step.
const resolveFirstDay = (calendar: CalendarId): number => (settings.firstDay === AUTO_FIRST_DAY
  ? getCalendarFirstDayOfWeek(calendar) ?? dateLocalization.firstDayOfWeekIndex()
  : Number(settings.firstDay));

function widgetOptions(calendar: CalendarId): Record<string, unknown> {
  return {
    views: [...Views],
    currentView: settings.currentView,
    currentDate: settings.currentDate,
    showAllDayPanel: settings.showAllDayPanel,
    startDayHour: FIRST_VISIBLE_HOUR,
    endDayHour: LAST_VISIBLE_HOUR,
    firstDayOfWeek: resolveFirstDay(calendar),
  };
}

function appointmentRows(calendar: CalendarId): InspectorRow[] {
  const appointment = settings.selected;
  if (!appointment) return [{ label: t('inspector.stored'), value: t('inspector.none'), tone: 'muted' }];
  const { startDate, endDate, recurrenceRule } = appointment;
  const rows: InspectorRow[] = [
    {
      label: t('scheduler.inspector.startStored'), value: toIsoDateTime(startDate), tone: 'accent', ltr: true,
    },
    {
      label: t('scheduler.inspector.startShown'), value: formatDate(startDate, calendar, DateTypes.longDateTime), tone: 'ok',
    },
    { label: t('scheduler.inspector.endStored'), value: toIsoDateTime(endDate), ltr: true },
    { label: t('scheduler.inspector.endShown'), value: formatDate(endDate, calendar, DateTypes.longDateTime) },
    ...CALENDAR_ID_LIST.map((id): InspectorRow => ({
      label: t('scheduler.inspector.startIn', { calendar: t(`inspector.${id}`) }),
      value: formatDate(startDate, id, DateTypes.shortDate),
      tone: id === calendar ? undefined : 'muted',
    })),
    { label: t('scheduler.inspector.title'), value: appointment.text },
    { label: t('scheduler.inspector.allDay'), value: t(appointment.allDay ? 'inspector.yes' : 'inspector.no') },
    recurrenceRule
      ? {
        label: t('scheduler.inspector.recurrence'), value: recurrenceRule, tone: 'accent', ltr: true,
      }
      : { label: t('scheduler.inspector.recurrence'), value: t('scheduler.inspector.noRecurrence'), tone: 'muted' },
  ];
  if (recurrenceRule === Recurrence.monthly) {
    rows.push({
      label: t('scheduler.inspector.recursOn'),
      value: t('scheduler.inspector.recursOnDay', { day: localDigits(describeDate(startDate, calendar).day) }),
      tone: 'ok',
    });
  }
  if (settings.occurrence && settings.occurrence.getTime() !== startDate.getTime()) {
    rows.push({
      label: t('scheduler.inspector.occurrence'),
      value: `${formatDate(settings.occurrence, calendar, DateTypes.longDate)} (${toIsoDateTime(settings.occurrence)})`,
    });
  }
  return rows;
}

function inspectorRows(calendar: CalendarId): InspectorRow[] {
  return [
    ...appointmentRows(calendar),
    { label: t('scheduler.inspector.view'), value: t(`scheduler.view.${settings.currentView}`) },
    { label: t('scheduler.inspector.date'), value: formatDate(settings.currentDate, calendar, DateTypes.longDate) },
  ];
}

const describeAppointment = (appointment: Appointment, calendar: CalendarId): string => t('scheduler.log.appointment', {
  text: appointment.text,
  shown: formatDate(appointment.startDate, calendar, DateTypes.dateTime),
  iso: toIsoDateTime(appointment.startDate),
});

function build({
  state, rtl, log, widgets, rebuild,
}: PageContext): void {
  const { calendar } = state;
  const inspector = requireElement('#inspector');
  const optionsHost = requireElement('#options');
  const actions = requireElement('#actions');

  if (!settings.appointments) {
    settings.appointments = seedAppointments(calendar);
    settings.selected = settings.appointments.find((a) => a.seedKey === SeedKeys.designReview) ?? null;
  } else {
    refreshSeeds(settings.appointments, calendar, settings.seedTexts);
  }
  settings.seedTexts = seedTexts();
  const appointments = settings.appointments;

  const refresh = (): void => {
    renderInspector(inspector, inspectorRows(calendar));
    renderOptions(optionsHost, { calendar, ...widgetOptions(calendar) });
  };

  // Option changes made by an action are logged by the action itself.
  let changingFromAction = false;

  const instance = widgets.add($('#scheduler').dxScheduler({
    ...widgetOptions(calendar),
    dataSource: appointments,
    calendar,
    rtlEnabled: rtl,
    height: SCHEDULER_HEIGHT,
    editing: true,
    onAppointmentClick: (e: AppointmentEvent): void => {
      settings.selected = e.appointmentData;
      settings.occurrence = e.targetedAppointmentData?.startDate ?? null;
      log.log(EventNames.click, t('scheduler.log.click', { text: e.appointmentData.text }));
      refresh();
    },
    onAppointmentAdded: (e: AppointmentEvent): void => {
      settings.selected = e.appointmentData;
      settings.occurrence = null;
      log.log(EventNames.added, describeAppointment(e.appointmentData, calendar));
      refresh();
    },
    onAppointmentUpdated: (e: AppointmentEvent): void => {
      if (settings.selected === e.appointmentData) settings.occurrence = null;
      log.log(EventNames.updated, describeAppointment(e.appointmentData, calendar));
      refresh();
    },
    onAppointmentDeleted: (e: AppointmentEvent): void => {
      if (settings.selected === e.appointmentData) settings.selected = null;
      log.log(EventNames.deleted, e.appointmentData.text);
      refresh();
    },
    onOptionChanged: (e: { name: string; value: unknown }): void => {
      if (changingFromAction) return;
      if (e.name === OptionNames.currentView) {
        settings.currentView = e.value as SchedulerView;
        log.log(OptionNames.currentView, t('scheduler.log.view', { view: t(`scheduler.view.${settings.currentView}`) }));
        refresh();
      } else if (e.name === OptionNames.currentDate && e.value instanceof Date) {
        settings.currentDate = e.value;
        log.log(OptionNames.currentDate, formatDate(e.value, calendar, DateTypes.longDate));
        refresh();
      }
    },
  }).dxScheduler('instance'));

  const setOption = (name: string, value: unknown, detail: string): void => {
    changingFromAction = true;
    instance.option(name, value);
    changingFromAction = false;
    log.log(name, detail);
    refresh();
  };

  const goToDate = (date: Date): void => {
    settings.currentDate = date;
    setOption(OptionNames.currentDate, date, formatDate(date, calendar, DateTypes.longDate));
  };

  actions.replaceChildren();
  // Six segments do not fit the actions card, so the views are a row of buttons.
  const viewRow = actionGroup(actions, t('scheduler.group.view'));
  const viewButtons = Views.map((view) => {
    const button = actionButton(viewRow, t(`scheduler.view.${view}`), () => {
      settings.currentView = view;
      viewButtons.forEach((other, index) => other.classList.toggle(CURRENT_VIEW_CLASS, Views[index] === view));
      setOption(OptionNames.currentView, view, t(`scheduler.view.${view}`));
    });
    button.classList.toggle(CURRENT_VIEW_CLASS, view === settings.currentView);
    return button;
  });

  const navigate = actionGroup(actions, t('scheduler.group.navigate'));
  actionButton(navigate, t('scheduler.action.today'), () => goToDate(today()), 'primary');
  actionButton(navigate, t('scheduler.action.startOfYear'), () => goToDate(startOfCalendarYear(today(), calendar)));

  const appointmentsGroup = actionGroup(actions, t('scheduler.group.appointments'));
  actionButton(appointmentsGroup, t('scheduler.action.addAppointment'), () => {
    const start = new Date(settings.currentDate);
    start.setHours(NEW_APPOINTMENT_HOUR, 0, 0, 0);
    const end = new Date(start.getTime() + MS_PER_HOUR);
    instance.showAppointmentPopup({ text: t('scheduler.newAppointment'), startDate: start, endDate: end }, true);
    log.log(EventNames.popup, t('scheduler.log.popup', { shown: formatDate(start, calendar, DateTypes.dateTime) }));
  });

  const dayNames = dateLocalization.getDayNames('abbreviated');
  actionSegmented(
    actionGroup(actions, t('scheduler.group.firstDay')),
    t('scheduler.group.firstDay'),
    FIRST_DAY_CHOICES.map((value) => ({
      value, text: value === AUTO_FIRST_DAY ? t('scheduler.firstDay.auto') : dayNames[Number(value)],
    })),
    settings.firstDay,
    (firstDay) => {
      settings.firstDay = firstDay;
      log.log(OptionNames.firstDayOfWeek, firstDay === AUTO_FIRST_DAY ? t('scheduler.firstDay.auto') : dayNames[Number(firstDay)]);
      // firstDayOfWeek cannot be reset to the calendar's default at runtime.
      rebuild();
    },
  );

  const toggles = actionGroup(actions, t('scheduler.group.options'));
  toggles.classList.add('db-actions__row--column');
  actionToggle(toggles, t('scheduler.option.allDayPanel'), settings.showAllDayPanel, (showAllDayPanel) => {
    settings.showAllDayPanel = showAllDayPanel;
    setOption(OptionNames.showAllDayPanel, showAllDayPanel, String(showAllDayPanel));
  });

  refresh();
}

mountPage({ pageId: 'scheduler', messages: { [Languages.en]: en, [Languages.fa]: fa }, build });
