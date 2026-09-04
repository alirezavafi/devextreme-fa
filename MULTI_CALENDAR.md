# Multi-Calendar Support

DevExtreme widgets can **display and accept dates in non-Gregorian calendars**
(Persian/Jalali, Hijri/Islamic, Umm al-Qura, and app-registered custom calendars)
while the underlying data never changes.

> **Core invariant:** stored values stay native (proleptic Gregorian) `Date`
> objects. A calendar only affects **display, placement, input, and grouping**.
> Sorting, filtering expressions, serialization, and round-tripping are all
> calendar-independent, so there is **no data migration** when you switch calendars.

This file is the top-level index. Deeper docs live next to the code:

- Developer guide / public API: `packages/devextreme/js/__internal/core/localization/calendar/README.md`
- Step-by-step visual guide: `packages/devextreme/js/__internal/core/localization/calendar/VISUAL_TESTING.md`
- Implementation tracking checklist: `packages/devextreme/js/__internal/core/localization/calendar/TASKS.md`

---

## Supported calendars

| Type string         | Calendar                                  | Notes |
|---------------------|-------------------------------------------|-------|
| `gregorian`         | Gregorian (default)                       | Unchanged code path; the default for every widget. |
| `persian`           | Persian / Jalali                          | Borkowski/jalaali arithmetic, years -61..3177. |
| `hijri`             | Hijri / Islamic (tabular)                 | Julian-Day formulas. |
| `hijri-umalqura`    | Hijri / Umm al-Qura                       | Day-accurate via `Intl` ICU data; registered only when the runtime's `Intl` supports it. |
| *(custom)*          | Anything you register                     | Implement the `CalendarSystem` contract and call `registerCalendar(...)`. |

Each calendar can also advertise a preferred **first day of week** (Persian/Hijri =
Saturday) and a **default date format** (`yyyy/MM/dd`), used when the app hasn't set
its own.

---

## Architecture (one paragraph)

A small `CalendarSystem` abstraction (`js/__internal/core/localization/calendar/`)
converts a stored `Date` to/from calendar parts (`toParts`/`fromParts`,
`getDaysInMonth`, `getMonthsInYear`, `getMonthNames`, ...) behind a registry
(`getCalendar(type)`). The localization layer understands a `calendar` field on a
date format, so `dateLocalization.format(date, { type, calendar })` and
`formatHelper.format(...)` render in the chosen calendar. A shared helper
`applyCalendarToFormat(format, calendar)` merges a calendar selection into any
widget's date `format`, which is how most display-only consumers became
calendar-aware with one guarded transformation. **Every calendar branch is guarded
so the Gregorian path is byte-for-byte unchanged.**

---

## Components & features with multi-calendar support

### Editors

**dxDateBox**
- Rollers picker — calendar year/month/day rollers (Persian month names, correct
  day counts, calendar-aware roller order Day→Month→Year for non-Gregorian).
- Calendar-grid picker — month/year/decade/century views in the calendar; navigation
  moves by calendar month/year.
- Typed input (mask) — type/edit/paste dates in the calendar; per-part increment and
  day-clamping to the calendar month length.
- Input value display matches the picker.
- Optional in-picker **calendar switcher** (`calendarSwitcher`).
- Public option: `calendar`, `calendarSwitcher`.

**dxDateRangeBox**
- Both start/end editors and the dropdown render in the selected calendar; forwards
  `calendar` / `calendarSwitcher` to both inner date boxes.

**dxCalendar**
- All zoom levels (month / year / decade / century) render in the calendar.
- Uses the calendar's default first-day-of-week / format when unset.
- Optional in-picker **calendar switcher** (`boolean | { items: [...] }`) hosted as a
  `dxSelectBox`; the stored value stays a Gregorian `Date`.

### Data widgets

**dxDataGrid / dxTreeList**
- Date column **display** via `format: { type, calendar }`.
- Inline **editing** via `editorOptions: { calendar }` (uses dxDateBox).
- **Filter row** date editor in the selected calendar.
- **Header filter** funnel: Year → Month → Day tree grouped and labeled in the
  calendar (e.g. Persian `1403 → فروردین → 1`); the resulting filter still matches the
  stored Gregorian dates.
- **Filter panel / filter builder** text: date filter values are formatted in the
  calendar, via the field `format: { type, calendar }` or a `calendar` shorthand on
  the filter-builder field / grid column.
- Sorting/filtering unaffected (value stays a Gregorian `Date`).

**dxPivotGrid**
- Row/column date dimension grouping by **calendar year and month** (via the public
  field `selector` + `customizeText`); no core change, no data migration.

**dxFilterBuilder** (standalone)
- Condition value text for `date`/`datetime` fields renders in the calendar
  (`format: { type, calendar }` or the `calendar` field shorthand).

### Scheduler (dxScheduler)
- Day/Week/Timeline **header day numbers** in the calendar.
- **Navigator caption** (toolbar range) in the calendar (e.g. `1 Farvardin 1403`,
  `Farvardin 1403`).
- **Month view**: calendar day numbers, the grid **starts on the 1st of the calendar
  month**, month-name on the 1st, calendar-aligned boundaries.
- `agenda` and `timelineWeek` day labels.
- Appointment **tooltip** and appointment-body **date text** (time-of-day is
  calendar-independent).
- **Appointment popup** start/end and recurrence date editors render/parse in the
  calendar; the form rebuilds when `calendar` changes at runtime.
- **Recurrence**: MONTHLY/YEARLY recur on the same *calendar* day-of-month /
  month-and-day, including single/multiple/negative `BYMONTHDAY`, BYDAY-monthly
  (`1MO`, `-1FR`, `MO,WE`), and `YEARLY;BYMONTH;BYDAY`; composes with `timeZone` /
  per-appointment `startDateTimeZone`. (Daily/weekly/hourly and `YEARLY;BYDAY`
  without `BYMONTH` delegate to the Gregorian RRULE engine.)
- Public option: `calendar`.

### Visualization

**dxChart**
- Datetime argument/value axis **labels** render in the calendar (via the
  `smartFormatter` + `label.calendar` / `label.format`).
- Datetime tick **placement**: year/quarter/month ticks land on calendar boundaries
  for 12-month calendars; day/week/time ticks delegate to Gregorian.

**dxRangeSelector**
- Scale labels are calendar-aware (`scale.label.calendar` / `scale.label.format`);
  reuses the same `smartFormatter` path, so no separate placement logic was needed.

### Communication

**dxChat**
- Day-group **headers** render in the calendar (`calendar` option). Message
  timestamps stay time-of-day (calendar-independent).

### Project management

**dxGanttMultiCalendar** *(separate widget)*
- A native, calendar-aware Gantt (two-tier timeline scale, bars, dependencies,
  drag/resize, dependency draw/delete, dependency-aware auto-scheduling) registered as
  `dxGanttMultiCalendar`, composing `dxTreeList`. Built from scratch because the
  stock `dxGantt` timeline is rendered by the closed-source `devexpress-gantt` engine,
  which exposes **no per-tick scale hook** — so the stock Gantt timeline scale cannot
  be made calendar-aware from the DevExtreme side (see *Known limitations*).
- Public option: `calendar`, plus `scaleType`, editing/dependency options.

---

## How to view it visually

There are three interactive **Vite playground** pages. The playground imports the
TypeScript source directly (via `@js` / `@ts` aliases), so it reflects local changes
with **no bundle build**.

### 1. One-time prerequisites

The repo pins **Node 24.15.0**. With that active, from the **repo root**:

```bash
pnpm install                                    # deps + builds the nx infra plugin
pnpm nx build:localization:generate devextreme  # generates CLDR data (REQUIRED)
```

Build the theme CSS once (needed for the playground theme selector). This gulp task
lives in the `devextreme-scss` package, so run it **from that directory** (running it
from the repo root fails with "Local gulp not found"):

```bash
cd packages/devextreme-scss
pnpm exec gulp style-compiler-themes-ci         # 12 dev themes + fonts/icons
```

> Without the CLDR step, the source imports `@ts/core/localization/cldr-data/*`
> fail to resolve. Without the theme CSS, widgets render unstyled (the page logs
> "No theme CSS found ..." instead of throwing).

### 2. Start the dev server

```bash
cd packages/devextreme
pnpm dev:playground        # http://localhost:3000  — run in your OWN terminal
```

> A Vite dev server is long-running. Start it in your own terminal/background task,
> not as a blocking one-shot command.

### 3. Open a page

| Page | URL | Widgets exercised |
|------|-----|-------------------|
| Editors + data + scheduler | `http://localhost:3000/calendar-multi.html` | DateBox (rollers/grid/mask), DateRangeBox, Calendar, DataGrid (display/edit/filter row/header filter), PivotGrid, Scheduler |
| Chart + Chat | `http://localhost:3000/viz-chat-multi.html` | dxChart (datetime axis ticks + labels), dxChat (day headers) |
| Gantt | `http://localhost:3000/gantt-multi-calendar.html` | dxGanttMultiCalendar (timeline scale, bars, dependencies, drag/resize) |

Each page has a **Calendar** dropdown (Gregorian / Persian / Hijri tabular / Hijri
Umm al-Qura) that rebuilds the widgets so you can compare side by side, plus a
**Language** selector (English / Persian) that loads the shipped `fa` messages,
switches the locale, flips to RTL, and applies a Persian web font. The
`calendar-multi.html` page also shows a **stored-value readout** table (each widget's
underlying Gregorian `Date` next to its calendar rendering) so the true dataset is
always visible.

### What to look for

Anchor date: **2024-03-20** = `1 Farvardin 1403` (Persian) / `1446-01-01` (Umm al-Qura).

- **DateBox rollers**: switch to Persian — year shows `1403`, months are Farvardin…
  Esfand; scroll across Esfand and the day roller resizes to 29/30.
- **DateBox grid**: header reads `Farvardin 1403`; drill up month → year → decade →
  century in the calendar. The in-picker calendar switcher changes the calendar from
  inside the dropdown.
- **DateBox mask**: shows `1403/01/01`; Up/Down on each part increments in the
  calendar and clamps the day; paste `1403/02/15` round-trips to the right `Date`.
- **DataGrid**: the date column shows calendar dates; click to edit (inline dxDateBox
  in the calendar); use the filter row + header-filter tree (`1403 → فروردین → 1`).
- **Scheduler**: header day numbers and navigator caption in the calendar; switch
  `currentView` to `month` to see the grid start on the 1st of the calendar month;
  open the appointment popup to see calendar date editors.
- **Chart**: the datetime axis labels *and* the tick positions move to calendar
  month/quarter/year boundaries.
- **Chat**: day-group headers show the calendar date; message times are unchanged.
- **Gantt**: drag bars/edges, draw dependencies from the hover handles, switch the
  calendar/scale to see the timeline re-label while stored dates stay Gregorian.

### Add your own scenario

Edit the corresponding `playground/*.ts`. Every widget is a normal jQuery call with
the public `calendar` option / `format`:

```ts
$('#datebox').dxDateBox({ value: new Date(), calendar: 'persian', pickerType: 'calendar' });
$('#grid').dxDataGrid({ columns: [{ dataField: 'd', dataType: 'date',
  format: { type: 'shortdate', calendar: 'hijri-umalqura' },
  editorOptions: { calendar: 'hijri-umalqura' } }] });
$('#sched').dxScheduler({ calendar: 'persian', views: ['day','week'], currentView: 'week' });
$('#chart').dxChart({ argumentAxis: { label: { calendar: 'persian' } } });
$('#chat').dxChat({ calendar: 'persian' });
```

Register a custom calendar:

```ts
import { registerCalendar } from 'devextreme/common/core/localization/calendar';
registerCalendar({ type: 'mycal', toParts, fromParts, getDaysInMonth,
  getMonthsInYear, isLeapYear, getMonthNames });
```

---

## Formal per-framework demos (apps/demos)

`MultipleCalendars` demos exercise the public `calendar` option in **jQuery, React,
ReactJs, Angular, and Vue**:

- `apps/demos/Demos/DateBox/MultipleCalendars`
- `apps/demos/Demos/Calendar/MultipleCalendars`
- `apps/demos/Demos/DateRangeBox/MultipleCalendars`
- `apps/demos/Demos/DataGrid/MultipleCalendars`
- `apps/demos/Demos/Scheduler/MultipleCalendars`

These run against the **built** `devextreme-dist` bundle, so rebuild the package
first for them to reflect source changes:

```bash
cd packages/devextreme
pnpm build
```

For live-source iteration without a bundle build, prefer the Vite playground above.

---

## Automated tests (fast, no browser)

The unit tests run in the jsdom Jest project and need no browser:

```bash
cd packages/devextreme
pnpm test-jest -- --testPathPattern calendar
```

This covers calendar conversions (incl. Umm al-Qura), DateView rollers, mask typed
input, Calendar grids, `localization/date` format/parse, the DataGrid display path
(`format_helper`), the header-filter date tree, the filter-builder/filter-panel value
text, the Scheduler header/caption/month boundary/recurrence, the chart smartFormatter
+ tick generator, the range-selector scale, and the chat day headers.

Browser-level coverage (karma/QUnit, not part of the jsdom Jest project):

- `testing/tests/DevExpress.ui.widgets.editors/calendar.calendarSystem.tests.js`
- `testing/tests/.../dataGrid.calendarSystem.tests.js`
- `testing/tests/.../integration.calendarSystem.tests.js` (Scheduler)
- `testing/tests/DevExpress.ui.widgets/gantt.multiCalendar.tests.js`

---

## Public API quick reference

| Widget | Option(s) |
|--------|-----------|
| dxDateBox, dxDateRangeBox | `calendar`, `calendarSwitcher` |
| dxCalendar | `calendar`, `calendarSwitcher` |
| dxScheduler | `calendar` |
| dxChat | `calendar` |
| dxChart, dxRangeSelector | axis/scale `label: { calendar }` (or `label.format: { type, calendar }`) |
| dxDataGrid / dxTreeList | column `format: { type, calendar }`, `editorOptions: { calendar }`; filter-builder field `calendar` |
| dxFilterBuilder | field `calendar` or `format: { type, calendar }` |
| dxGanttMultiCalendar | `calendar`, `scaleType` |

Calendar registry (`devextreme/common/core/localization/calendar`):
`registerCalendar`, `getCalendar`, `isCalendarRegistered`,
`getRegisteredCalendarTypes`, `getCalendarFirstDayOfWeek`,
`getCalendarDefaultDateFormat`, `getCalendarMonthNamesInActiveLocale`.

---

## Known limitations

- **Stock dxGantt timeline scale**: the timeline is rendered by the external
  closed-source `devexpress-gantt` engine, which exposes no per-tick scale-text hook,
  so its day/month/year tick numbers cannot be made calendar-aware from the
  DevExtreme side. The separate **`dxGanttMultiCalendar`** widget exists to provide a
  fully calendar-aware Gantt.
- **Scheduler recurrence**: `YEARLY;BYDAY` without `BYMONTH` delegates to the
  Gregorian engine. DST transitions that change the UTC offset mid-series are a
  pre-existing Gregorian-shared limitation (a single offset is applied per series).
- **Chart `label.calendar` shorthand** works at runtime but the publicly-typed path
  is `label.format: { type, calendar }`.
- **Remote/server-side** grouping paths (e.g. remote header-filter grouping) stay
  Gregorian — only client-side grouping/formatting is calendar-aware.
- Framework wrappers, the `dx.all.d.ts` bundle, and theme/demo builds are CI-bound
  steps; verify generation rather than hand-editing generated artifacts.
