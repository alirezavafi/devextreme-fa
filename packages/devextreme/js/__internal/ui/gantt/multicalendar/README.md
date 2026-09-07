# dxGanttMultiCalendar

A calendar-aware, theme-compatible Gantt widget built entirely from DevExtreme
primitives. It composes the framework's own `dxTreeList` (left task grid) with a
self-contained timeline renderer (right pane) and supports displaying / editing
the schedule in **non-Gregorian calendars** (Persian/Jalali, Hijri/Islamic, or a
custom calendar) while always storing native Gregorian `Date` values.

It is an alternative to the engine-based `dxGantt` (whose timeline is rendered by
the closed-source `devexpress-gantt` package and cannot be made calendar-aware).
`dxGanttMultiCalendar` owns its rendering and date math, so the calendar flows
through every layer: scale labels, bar positions, editing, and auto-scheduling.

## Quick start

### jQuery
```js
import 'devextreme/ui/gantt_multi_calendar';

$('#gantt').dxGanttMultiCalendar({
  tasks: { dataSource: tasks },          // [{ id, parentId, title, start, end, progress }]
  dependencies: { dataSource: deps },    // [{ id, predecessorId, successorId, type }]
  calendar: 'persian',                   // 'gregorian' | 'persian' | 'hijri' | custom
  scaleType: 'months',                   // 'days' | 'weeks' | 'months' | 'quarters' | 'years'
  height: 420,
});
```

### Angular
```ts
import { DxGanttMultiCalendarModule } from 'devextreme-angular/ui/gantt-multi-calendar';
```
```html
<dx-gantt-multi-calendar
  [tasks]="{ dataSource: tasks }"
  [dependencies]="{ dataSource: deps }"
  calendar="persian"
  scaleType="months"
  [height]="420"
  (onTaskUpdated)="log($event)">
</dx-gantt-multi-calendar>
```

### React
```tsx
import GanttMultiCalendar from 'devextreme-react/gantt_multi_calendar';

<GanttMultiCalendar
  tasks={{ dataSource: tasks }}
  dependencies={{ dataSource: deps }}
  calendar="persian"
  scaleType="months"
  height={420}
  onTaskUpdated={log}
/>
```

### Vue
```vue
<script setup>
import DxGanttMultiCalendar from 'devextreme-vue/gantt_multi_calendar';
</script>
<template>
  <DxGanttMultiCalendar
    :tasks="{ dataSource: tasks }"
    :dependencies="{ dataSource: deps }"
    calendar="persian"
    scale-type="months"
    :height="420"
    @task-updated="log" />
</template>
```

### Without the widget shell
The timeline renderer is also usable standalone (no `dxTreeList`, no DevExtreme
widget lifecycle) via `GanttTimeline`:
```ts
import { GanttTimeline } from '@ts/ui/gantt/multicalendar';

const gantt = new GanttTimeline(container, { tasks, dependencies, calendar: 'persian' });
gantt.option('calendar', 'hijri'); // re-renders
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `tasks` | `{ dataSource, keyExpr, parentIdExpr, titleExpr, startExpr, endExpr, progressExpr, colorExpr }` | `{}` | Task data + field mapping. |
| `dependencies` | `{ dataSource, keyExpr, predecessorIdExpr, successorIdExpr, typeExpr }` | `{}` | Link data + field mapping. |
| `columns` | `Array<Column \| string>` | auto (Task/Start/End) | Tree-list columns. |
| `calendar` | `'gregorian' \| 'persian' \| 'hijri' \| string` | `'gregorian'` | Calendar system for the scale. |
| `scaleType` | `'days' \| 'weeks' \| 'months' \| 'quarters' \| 'years'` | `'months'` | Timeline scale unit. |
| `taskListWidth` | `number` | `300` | Width of the tree-list pane (px). |
| `rowHeight` | `number` | `34` | Row height (px). |
| `headerRowHeight` | `number` | `30` | Header tier height (px). |
| `cellWidth` | `number` | `100` | Scale column width (px). |
| `showDependencies` | `boolean` | `true` | Render dependency connectors. |
| `selectedRowKey` | `any` | `undefined` | Selected task key. |
| `startDate` / `endDate` | `Date` | auto (from tasks) | Explicit timeline range. |
| `locale` | `string` | active locale | Locale for calendar month names (e.g. `'fa'`). |
| `editing` | `{ enabled, allowTaskMove, allowTaskResize, autoUpdateSuccessors, allowDependencyAdding, allowDependencyDeleting }` | all `true` | Interactive editing. |

### Events
| Event | Payload |
| --- | --- |
| `onTaskUpdated` | `{ key, start, end }` after a drag/resize or auto-schedule shift. |
| `onDependencyInserted` | `{ predecessorId, successorId, type }` after a link is drawn. |
| `onDependencyDeleting` | `{ key, cancel }` — set `cancel = true` to prevent deletion. |
| `onDependencyDeleted` | `{ key }` after a link is removed. |

## Editing

- **Move**: drag a bar body. **Resize**: drag its start/finish edge. Dates snap
  to the nearest day; bar duration is preserved on move.
- **Draw a dependency**: hover a bar and drag from its round start/finish handle
  onto another task. The edge pair determines the type (FS/SS/FF/SF).
- **Delete a dependency**: click its connector line (cancelable via
  `onDependencyDeleting`).
- **Auto-scheduling**: when a task moves or a link is added, successors are
  pushed forward to keep dependency constraints valid (never pulled earlier;
  durations preserved; cyclic graphs terminate safely). Toggle with
  `editing.autoUpdateSuccessors`.

## Calendars

The `calendar` option only affects how the timeline scale is divided and
labelled — **task values are always native Gregorian `Date`s**, so sorting,
filtering, storage and round-tripping are calendar-independent. Calendars come
from the shared registry (`@ts/core/localization/calendar`): `gregorian`,
`persian`, `hijri`, `hijri-umalqura` (when `Intl` supports it), and any custom
calendar registered via `registerCalendar`.

## Theming

The widget reuses the existing `.dx-gantt-*` theme classes, so Generic / Material
/ Fluent (and ThemeBuilder) style it with no theme changes. Colors/borders come
from the per-theme `.dx-gantt` SCSS; the renderer's *structural* CSS is scoped
under `.dx-gantt-mc` (in `devextreme-scss/scss/widgets/base/gantt/_index.scss`)
so the engine-based `dxGantt` is never affected.

## Architecture

Pure, DOM-free logic (unit-tested in isolation):
- `scale_model.ts` — calendar-aware two-tier scale; `dateToPixel`/`pixelToDate`.
- `task_layout.ts` — bar rectangles, milestones, dependency connector geometry.
- `interaction.ts` — drag/resize math (snap, clamp, FS/SS/FF/SF edge mapping).
- `auto_schedule.ts` — dependency constraint propagation.
- `dependency_draw.ts` — link type resolution, hit-testing, validation.
- `data_adapter.ts` — option-shape ↔ layout-input mapping.

DOM / widget layers:
- `renderer.ts` — emits the themeable `.dx-gantt-*` DOM.
- `interaction_controller.ts` / `dependency_draw_controller.ts` — pointer wiring.
- `timeline.ts` — `GanttTimeline` orchestrator (framework-light).
- `widget.ts` — the registered `dxGanttMultiCalendar` DevExtreme widget.
- `index.ts` — public barrel (registers the component + re-exports types).

## Testing

- Unit (jsdom Jest): `cd packages/devextreme && pnpm test-jest -- --testPathPattern multicalendar`
- Browser (karma/QUnit): `testing/tests/DevExpress.ui.widgets/gantt.multiCalendar.tests.js`

## Playground

`packages/devextreme/playground/gantt-multi-calendar.html` (run with
`pnpm dev:playground`) — calendar/scale/theme switchers, live editing, and an
event log.

## Known limitations

Not yet implemented: progress-handle dragging, a toolbar, row virtualization for
very large task sets, and the generated nested-option directives for the Angular
wrapper (options are supported via inputs). The public TS bundle (`dx.all.d.ts`)
and docs are produced by the standard generation pipeline.
