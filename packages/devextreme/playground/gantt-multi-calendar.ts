// Registers the dxGanttMultiCalendar component (and pulls in dxTreeList).
import '../js/__internal/ui/gantt/multicalendar/index';
import $ from 'jquery';
import { actionButton, actionGroup, actionSegmented } from './shell/actions';
import type { CalendarId } from './shell/constants/calendar-ids';
import { Languages } from './shell/constants/languages';
import { addDays, toIsoDate } from './shell/date-info';
import { dateRows } from './shell/date-rows';
import { requireElement } from './shell/dom';
import { formatDate, localDigits } from './shell/format';
import { t } from './shell/i18n';
import { renderInspector, renderOptions } from './shell/inspector';
import type { InspectorRow } from './shell/inspector-row';
import { mountPage } from './shell/page';
import type { PageContext } from './shell/page-context';
import en from './pages/gantt/en.json';
import fa from './pages/gantt/fa.json';

const ScaleTypes = ['days', 'weeks', 'months', 'quarters', 'years'] as const;
type ScaleType = typeof ScaleTypes[number];

const TaskKeys = {
  kickoff: 'kickoff',
  design: 'design',
  wireframes: 'wireframes',
  visual: 'visual',
  development: 'development',
  testing: 'testing',
  launch: 'launch',
} as const;
type TaskKey = typeof TaskKeys[keyof typeof TaskKeys];

// Gantt dependency types (finish-to-start is 0).
const FINISH_TO_START = 0;

const EventNames = {
  taskUpdated: 'taskUpdated',
  tasks: 'tasks',
  selectionChanged: 'selectionChanged',
  dependencyInserted: 'dependencyInserted',
  dependencyDeleted: 'dependencyDeleted',
  scaleType: 'scaleType',
} as const;

const DateTypes = { shortDate: 'shortdate', longDate: 'longdate' } as const;

const GANTT_HEIGHT = 460;
// The widget's horizontally scrolling timeline.
const GANTT_VIEW_SELECTOR = '#gantt .dx-gantt-view';
const TASK_LIST_WIDTH = 380;
const DATE_COLUMN_WIDTH = 95;
// Pixels per scale column: a wider cell for a coarser scale keeps bars readable.
const CellWidths: Record<ScaleType, number> = {
  days: 44, weeks: 120, months: 240, quarters: 300, years: 400,
};
const NEW_TASK_START_OFFSET = 3;
const NEW_TASK_LENGTH_DAYS = 6;
const FA_LOCALE = 'fa';
const MS_PER_DAY = 864e5;
const CALENDAR_ROWS_SHOWN = 5;

interface Task {
  id: number;
  parentId: number | null;
  title: string;
  titleKey?: TaskKey;
  start: Date;
  end: Date;
  progress: number;
}

interface Dependency {
  id: number;
  predecessorId: number;
  successorId: number;
  type: number;
}

const today = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const task = (
  id: number,
  parentId: number | null,
  titleKey: TaskKey,
  startOffset: number,
  endOffset: number,
  progress: number,
): Task => ({
  id,
  parentId,
  title: '',
  titleKey,
  start: addDays(today(), startOffset),
  end: addDays(today(), endOffset),
  progress,
});

// A plan relative to today, so the timeline always shows work in progress.
const seedTasks = (): Task[] => [
  task(1, null, TaskKeys.kickoff, -12, -7, 100),
  task(2, null, TaskKeys.design, -7, 8, 60),
  task(3, 2, TaskKeys.wireframes, -7, 0, 80),
  task(4, 2, TaskKeys.visual, 0, 8, 40),
  task(5, null, TaskKeys.development, 8, 33, 10),
  task(6, null, TaskKeys.testing, 33, 43, 0),
  task(7, null, TaskKeys.launch, 44, 44, 0),
];

const link = (id: number, predecessorId: number, successorId: number): Dependency => ({
  id, predecessorId, successorId, type: FINISH_TO_START,
});

// Page settings survive rebuilds (calendar, language or theme changes). The
// widget edits the task and dependency rows in place, so edits persist too.
const settings = {
  scaleType: 'weeks' as ScaleType,
  tasks: seedTasks(),
  dependencies: [link(1, 1, 2), link(2, 3, 4), link(3, 2, 5), link(4, 5, 6), link(5, 6, 7)],
  selectedId: 3 as number | null,
};

const findTask = (id: number | null): Task | undefined => settings.tasks.find((item) => item.id === id);

function inspectorRows(calendar: CalendarId): InspectorRow[] {
  const selected = findTask(settings.selectedId);
  if (!selected) return dateRows(undefined, calendar);
  const [stored, shown, ...calendars] = dateRows(selected.start, calendar).slice(0, CALENDAR_ROWS_SHOWN);
  const days = Math.round((selected.end.getTime() - selected.start.getTime()) / MS_PER_DAY);
  return [
    { ...stored, label: t('gantt.inspector.startStored') },
    { ...shown, label: t('gantt.inspector.startShown') },
    {
      label: t('gantt.inspector.endStored'), value: toIsoDate(selected.end), tone: 'accent', ltr: true,
    },
    { label: t('gantt.inspector.endShown'), value: formatDate(selected.end, calendar, DateTypes.longDate), tone: 'ok' },
    ...calendars,
    { label: t('gantt.inspector.title'), value: selected.title },
    { label: t('gantt.inspector.duration'), value: t('gantt.inspector.days', { count: localDigits(days) }) },
    { label: t('gantt.inspector.progress'), value: `${localDigits(selected.progress)}%` },
    { label: t('gantt.inspector.scale'), value: t(`gantt.scale.${settings.scaleType}`) },
  ];
}

function widgetOptions(calendar: CalendarId, rtl: boolean): Record<string, unknown> {
  const dateColumn = { width: DATE_COLUMN_WIDTH, dataType: 'date', format: { type: DateTypes.shortDate, calendar }, editorOptions: { calendar } };
  return {
    calendar,
    scaleType: settings.scaleType,
    cellWidth: CellWidths[settings.scaleType],
    taskListWidth: TASK_LIST_WIDTH,
    selectedRowKey: settings.selectedId,
    locale: rtl ? FA_LOCALE : undefined,
    columns: [
      { dataField: 'title', caption: t('gantt.column.task'), dataType: 'string' },
      { dataField: 'start', caption: t('gantt.column.start'), ...dateColumn },
      { dataField: 'end', caption: t('gantt.column.end'), ...dateColumn },
    ],
  };
}

const describeTask = (item: Task, calendar: CalendarId): string => t('gantt.log.task', {
  title: item.title,
  start: formatDate(item.start, calendar, DateTypes.shortDate),
  end: formatDate(item.end, calendar, DateTypes.shortDate),
  isoStart: toIsoDate(item.start),
  isoEnd: toIsoDate(item.end),
});

function build({
  state, rtl, log, widgets,
}: PageContext): void {
  const { calendar } = state;
  const inspector = requireElement('#inspector');
  const optionsHost = requireElement('#options');
  const actions = requireElement('#actions');

  settings.tasks.forEach((item) => {
    if (item.titleKey) item.title = t(`gantt.task.${item.titleKey}`);
  });

  const refresh = (): void => {
    renderInspector(inspector, inspectorRows(calendar));
    renderOptions(optionsHost, widgetOptions(calendar, rtl));
  };

  // In RTL the widget mirrors the timeline inside an LTR scroll container and
  // leaves it at scrollLeft 0, which is the project's end; start at its beginning.
  const showTimelineStart = (): void => {
    if (!rtl) return;
    requestAnimationFrame(() => {
      const view = document.querySelector<HTMLElement>(GANTT_VIEW_SELECTOR);
      if (view) view.scrollLeft = view.scrollWidth - view.clientWidth;
    });
  };

  const instance = widgets.add($('#gantt').dxGanttMultiCalendar({
    ...widgetOptions(calendar, rtl),
    tasks: { dataSource: settings.tasks },
    dependencies: { dataSource: settings.dependencies },
    formatNumber: localDigits,
    rtlEnabled: rtl,
    height: GANTT_HEIGHT,
    editing: { enabled: true },
    onTaskUpdated: (e: { key: number }): void => {
      const updated = findTask(e.key);
      if (updated) log.log(EventNames.taskUpdated, describeTask(updated, calendar));
      refresh();
    },
    onDependencyInserted: (e: { predecessorId: number; successorId: number }): void => {
      log.log(EventNames.dependencyInserted, t('gantt.log.dependencyInserted', {
        from: findTask(e.predecessorId)?.title ?? e.predecessorId,
        to: findTask(e.successorId)?.title ?? e.successorId,
      }));
      refresh();
    },
    onDependencyDeleted: (e: { key: number | string }): void => {
      log.log(EventNames.dependencyDeleted, t('gantt.log.dependencyDeleted', { key: e.key }));
      refresh();
    },
  }).dxGanttMultiCalendar('instance'));

  // The widget keeps the selection inside its tree list and raises no event of
  // its own, so listen on the tree list.
  const logSelection = (): void => {
    const selected = findTask(settings.selectedId);
    log.log(
      EventNames.selectionChanged,
      selected ? t('gantt.log.selected', { title: selected.title }) : t('gantt.log.cleared'),
    );
    refresh();
  };
  instance.getTreeList().on('selectionChanged', (e: { selectedRowKeys: number[] }): void => {
    const [key] = e.selectedRowKeys;
    if ((key ?? null) === settings.selectedId) return;
    settings.selectedId = key ?? null;
    logSelection();
  });

  actions.replaceChildren();
  actionSegmented(
    actionGroup(actions, t('gantt.group.scale')),
    t('gantt.group.scale'),
    ScaleTypes.map((value) => ({ value, text: t(`gantt.scale.${value}`) })),
    settings.scaleType,
    (scaleType) => {
      settings.scaleType = scaleType;
      instance.option({ [EventNames.scaleType]: scaleType, cellWidth: CellWidths[scaleType] });
      showTimelineStart();
      log.log(EventNames.scaleType, t('gantt.log.scale', { scale: t(`gantt.scale.${scaleType}`) }));
      refresh();
    },
  );

  actionButton(actionGroup(actions, t('gantt.group.tasks')), t('gantt.action.addTask'), () => {
    const id = Math.max(0, ...settings.tasks.map((item) => item.id)) + 1;
    const start = addDays(today(), NEW_TASK_START_OFFSET);
    const added: Task = {
      id,
      parentId: null,
      title: t('gantt.newTask', { n: localDigits(id) }),
      start,
      end: addDays(start, NEW_TASK_LENGTH_DAYS),
      progress: 0,
    };
    settings.tasks = [...settings.tasks, added];
    instance.option('tasks', { ...instance.option('tasks'), dataSource: settings.tasks });
    log.log(EventNames.tasks, describeTask(added, calendar));
    settings.selectedId = id;
    instance.option('selectedRowKey', id);
    logSelection();
  }, 'primary');

  showTimelineStart();
  refresh();
}

mountPage({ pageId: 'gantt', messages: { [Languages.en]: en, [Languages.fa]: fa }, build });
