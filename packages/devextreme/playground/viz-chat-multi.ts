import '../js/viz/chart';
import '../js/ui/chat';
import $ from 'jquery';
import { actionButton, actionGroup, actionSegmented } from './shell/actions';
import type { CalendarId } from './shell/constants/calendar-ids';
import { Languages } from './shell/constants/languages';
import { ThemeModes } from './shell/constants/theme-modes';
import type { ThemeMode } from './shell/constants/theme-modes';
import { addCalendarMonths, addDays, toIsoDate, toIsoDateTime } from './shell/date-info';
import { dateRows } from './shell/date-rows';
import { requireElement } from './shell/dom';
import { formatDate, localDigits } from './shell/format';
import { t } from './shell/i18n';
import { renderInspector, renderOptions } from './shell/inspector';
import type { InspectorRow } from './shell/inspector-row';
import { mountPage } from './shell/page';
import type { PageContext } from './shell/page-context';
import en from './pages/vizChat/en.json';
import fa from './pages/vizChat/fa.json';

const TickIntervals = {
  month: { months: 1 },
  quarter: { quarters: 1 },
  year: { years: 1 },
} as const;
type TickName = keyof typeof TickIntervals;
const TICK_NAME_LIST = Object.keys(TickIntervals) as TickName[];

// The label format that reads best for each tick interval.
const TickFormats: Record<TickName, string> = {
  month: 'monthandyear',
  quarter: 'quarterandyear',
  year: 'year',
};

// The widget theme is Fluent Blue recoloured by the DevBox kit, so the chart
// takes the matching Fluent variant.
const ChartThemes: Record<ThemeMode, string> = {
  [ThemeModes.dark]: 'fluent.blue.dark',
  [ThemeModes.light]: 'fluent.blue.light',
};

const MessageDates = {
  yesterday: 'yesterday',
  lastWeek: 'lastWeek',
  lastMonth: 'lastMonth',
} as const;
type MessageDate = keyof typeof MessageDates;
const MESSAGE_DATE_LIST = Object.keys(MessageDates) as MessageDate[];

const EventNames = {
  pointClick: 'pointClick',
  messageEntered: 'messageEntered',
  tickInterval: 'argumentAxis.tickInterval',
  items: 'items',
} as const;

const Focus = { point: 'point', message: 'message' } as const;
type FocusSource = typeof Focus[keyof typeof Focus];

const ChatUsers = {
  me: { id: 'me' },
  sara: { id: 'sara' },
} as const;

const DateTypes = { longDate: 'longdate', longDateTime: 'longdatelongtime' } as const;

const POINT_COUNT = 56;
const POINT_STEP_DAYS = 7;
const WIDGET_HEIGHT = 520;
const CHAT_DAY_HEADER_FORMAT = 'longdate';
const MESSAGE_HOUR = 10;

const SeedMessageKeys = {
  kickoff: 'kickoff',
  design: 'design',
  wireframes: 'wireframes',
} as const;
type SeedMessageKey = typeof SeedMessageKeys[keyof typeof SeedMessageKeys];

interface ChatMessage {
  seedKey?: SeedMessageKey;
  author: { id: string; name?: string };
  text: string;
  timestamp: Date;
}

interface ChartPoint {
  date: Date;
  value: number;
}

const today = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Weekly visits for the last year, with a gentle rise and a seasonal wave.
// Dates are Gregorian and independent of the calendar, so the stored value of a
// clicked point is the same whichever calendar draws the axis.
const buildChartData = (): ChartPoint[] => {
  const first = addDays(today(), -(POINT_COUNT - 1) * POINT_STEP_DAYS);
  return Array.from({ length: POINT_COUNT }, (_, index) => ({
    date: addDays(first, index * POINT_STEP_DAYS),
    value: Math.round(120 + index * 2.4 + 38 * Math.sin(index / 4.5)),
  }));
};

const seedMessages = (): ChatMessage[] => {
  const at = (offset: number, hour: number, minute: number): Date => {
    const date = addDays(today(), offset);
    date.setHours(hour, minute);
    return date;
  };
  const sara = { ...ChatUsers.sara };
  return [
    {
      seedKey: SeedMessageKeys.kickoff, author: sara, text: '', timestamp: at(-40, 9, 5),
    },
    {
      seedKey: SeedMessageKeys.design, author: { ...ChatUsers.me }, text: '', timestamp: at(-40, 9, 7),
    },
    {
      seedKey: SeedMessageKeys.wireframes, author: sara, text: '', timestamp: at(-9, 14, 30),
    },
  ];
};

// The sample messages and the other user's name follow the page language.
function localizeMessages(messages: ChatMessage[]): void {
  messages.forEach((message) => {
    if (message.seedKey) message.text = t(`vizChat.seed.${message.seedKey}`);
    if (message.author.id === ChatUsers.sara.id) message.author.name = t('vizChat.user.sara');
  });
}

// Page settings survive rebuilds (calendar, language or theme changes).
const settings = {
  tick: 'month' as TickName,
  chartData: buildChartData(),
  messages: seedMessages(),
  focusSource: Focus.point as FocusSource,
  focusDate: null as Date | null,
  focusValue: null as number | null,
  focusText: '',
};

function messageDate(kind: MessageDate, calendar: CalendarId): Date {
  const base = today();
  const date = {
    [MessageDates.yesterday]: addDays(base, -1),
    [MessageDates.lastWeek]: addDays(base, -7),
    [MessageDates.lastMonth]: addCalendarMonths(base, -1, calendar),
  }[kind];
  date.setHours(MESSAGE_HOUR, 0, 0, 0);
  return date;
}

function inspectorRows(calendar: CalendarId): InspectorRow[] {
  const { focusDate } = settings;
  const withTime = settings.focusSource === Focus.message;
  const rows = dateRows(focusDate, calendar, withTime);
  if (!focusDate) return rows;
  rows.push({
    label: t('vizChat.inspector.source'),
    value: t(`vizChat.inspector.${settings.focusSource}`),
    tone: 'ok',
  });
  if (settings.focusSource === Focus.point && settings.focusValue !== null) {
    rows.push({ label: t('vizChat.inspector.value'), value: localDigits(settings.focusValue) });
  } else {
    rows.push({ label: t('vizChat.inspector.text'), value: settings.focusText });
  }
  rows.push({ label: t('vizChat.inspector.tick'), value: t(`vizChat.tick.${settings.tick}`) });
  return rows;
}

function chartOptions(calendar: CalendarId, theme: ThemeMode): Record<string, unknown> {
  return {
    theme: ChartThemes[theme],
    series: [{
      argumentField: 'date', valueField: 'value', type: 'line', name: t('vizChat.series'),
    }],
    legend: { visible: false },
    argumentAxis: {
      argumentType: 'datetime',
      tickInterval: TickIntervals[settings.tick],
      label: { calendar, format: TickFormats[settings.tick] },
    },
  };
}

function chatOptions(calendar: CalendarId): Record<string, unknown> {
  return {
    user: ChatUsers.me,
    showDayHeaders: true,
    dayHeaderFormat: CHAT_DAY_HEADER_FORMAT,
    calendar,
  };
}

function build({
  state, rtl, log, widgets,
}: PageContext): void {
  const { calendar, theme } = state;
  const inspector = requireElement('#inspector');
  const optionsHost = requireElement('#options');
  const actions = requireElement('#actions');

  localizeMessages(settings.messages);
  if (!settings.focusDate) {
    settings.focusDate = settings.chartData[Math.floor(POINT_COUNT / 2)].date;
    settings.focusValue = settings.chartData[Math.floor(POINT_COUNT / 2)].value;
  }

  const refresh = (): void => {
    renderInspector(inspector, inspectorRows(calendar));
    renderOptions(optionsHost, { chart: chartOptions(calendar, theme), chat: chatOptions(calendar) });
  };

  const chart = widgets.add($('#chart').dxChart({
    ...chartOptions(calendar, theme),
    dataSource: settings.chartData,
    rtlEnabled: rtl,
    height: WIDGET_HEIGHT,
    tooltip: {
      enabled: true,
      customizeTooltip: (info: { argument: Date; valueText: string }): { text: string } => ({
        text: `${formatDate(info.argument, calendar, DateTypes.longDate)}: ${localDigits(info.valueText)}`,
      }),
    },
    onPointClick: (e: { target: { originalArgument: Date; originalValue: number } }): void => {
      const { originalArgument: date, originalValue: value } = e.target;
      Object.assign(settings, {
        focusSource: Focus.point, focusDate: date, focusValue: value, focusText: '',
      });
      log.log(EventNames.pointClick, t('vizChat.log.point', {
        shown: formatDate(date, calendar, DateTypes.longDate), value: localDigits(value), iso: toIsoDate(date),
      }));
      refresh();
    },
  }).dxChart('instance'));

  const chat = widgets.add($('#chat').dxChat({
    ...chatOptions(calendar),
    items: [...settings.messages],
    rtlEnabled: rtl,
    height: WIDGET_HEIGHT,
    onMessageEntered: (e: { message: ChatMessage }): void => {
      const { message } = e;
      if (!settings.messages.includes(message)) settings.messages.push(message);
      Object.assign(settings, {
        focusSource: Focus.message, focusDate: message.timestamp, focusValue: null, focusText: message.text,
      });
      log.log(EventNames.messageEntered, t('vizChat.log.message', {
        text: message.text, shown: formatDate(message.timestamp, calendar, DateTypes.longDate), iso: toIsoDateTime(message.timestamp),
      }));
      refresh();
    },
  }).dxChat('instance'));

  actions.replaceChildren();
  actionSegmented(
    actionGroup(actions, t('vizChat.group.tickInterval')),
    t('vizChat.group.tickInterval'),
    TICK_NAME_LIST.map((value) => ({ value, text: t(`vizChat.tick.${value}`) })),
    settings.tick,
    (tick) => {
      settings.tick = tick;
      chart.option({
        'argumentAxis.tickInterval': TickIntervals[tick],
        'argumentAxis.label.format': TickFormats[tick],
      });
      log.log(EventNames.tickInterval, t('vizChat.log.tick', { tick: t(`vizChat.tick.${tick}`) }));
      refresh();
    },
  );

  const messages = actionGroup(actions, t('vizChat.group.messages'));
  MESSAGE_DATE_LIST.forEach((kind) => {
    actionButton(messages, t(`vizChat.message.${kind}`), () => {
      const timestamp = messageDate(kind, calendar);
      const message: ChatMessage = { author: ChatUsers.me, text: t(`vizChat.messageText.${kind}`), timestamp };
      settings.messages = [...settings.messages, message]
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      chat.option(EventNames.items, [...settings.messages]);
      Object.assign(settings, {
        focusSource: Focus.message, focusDate: timestamp, focusValue: null, focusText: message.text,
      });
      log.log(EventNames.items, t('vizChat.log.message', {
        text: t(`vizChat.message.${kind}`), shown: formatDate(timestamp, calendar, DateTypes.longDate), iso: toIsoDateTime(timestamp),
      }));
      refresh();
    });
  });

  refresh();
}

mountPage({ pageId: 'vizChat', messages: { [Languages.en]: en, [Languages.fa]: fa }, build });
