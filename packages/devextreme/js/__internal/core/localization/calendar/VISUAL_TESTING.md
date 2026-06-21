# Visual testing & exploration guide — multi-calendar

How to see and interact with the Gregorian / Persian (Jalali) / Hijri (tabular) /
Hijri (Umm al-Qura) calendar support across DateBox, DateRangeBox, Calendar,
DataGrid and Scheduler.

## 1. Prerequisites (one-time)

The repo pins **Node 24.15.0**. With that active:

```bash
# from the repo root
pnpm install                                  # deps + builds the nx infra plugin
pnpm nx build:localization:generate devextreme # generates CLDR data (required)

# build the theme CSS once (outputs to packages/devextreme/artifacts/css)
cd packages/devextreme-scss
pnpm exec gulp style-compiler-themes-ci       # 12 dev themes incl. fluent.blue.light + fonts/icons
```

> The CLDR generation step is required. Without it the source imports
> `@ts/core/localization/cldr-data/*` fail to resolve in both the Vite
> playground and the localization Jest tests.
>
> The theme build is required for the playground's theme selector. Without it,
> `../artifacts/css/dx.*.css` is empty and the page logs
> "No theme CSS found ..." and renders widgets unstyled (it no longer throws).
> Use `gulp style-compiler-themes` instead to build *all* themes (slower).

## 2. Run the playground (live source, recommended)

The Vite playground imports the TypeScript source directly (via `@js` / `@ts`
aliases), so it reflects local changes with no bundle build.

```bash
cd packages/devextreme
pnpm dev:playground          # http://localhost:3000  (run in your OWN terminal)
```

Open: **`http://localhost:3000/calendar-multi.html`**

> A Vite dev server is long-running — start it in your own terminal/background
> task, never as a blocking one-shot command.

The page has a **Calendar** dropdown (Gregorian / Persian / Hijri tabular /
Hijri Umm al-Qura) that rebuilds every widget, so you can compare side by side.
It also has:

- A **Language** selector (English / Persian) that loads the shipped `fa` messages,
  switches the locale, and flips the page to RTL — so you can see full Persian
  localization alongside the Persian calendar.
- A **stored-value readout** table showing each component's underlying Gregorian
  `Date` next to its selected-calendar rendering, so the true dataset is always visible.
- The mask DateBox and Calendar omit explicit `displayFormat` / `firstDayOfWeek`,
  demonstrating the calendar's own defaults (Saturday week start, `yyyy/MM/dd`).

## 3. What to explore per component

Anchor date used by the page: **2024-03-20** = `1 Farvardin 1403` (Persian) /
`1446-01-01` Umm al-Qura. For Hijri tabular, `2024-07-07` = `1445-12-30`.

### DateBox — rollers picker (`#datebox-rollers`)
- Switch to Persian: the year/month/day rollers show calendar years
  (e.g. 1403), Persian month names (Farvardin…Esfand), and 1–31 / 1–30 days.
- Scroll the month roller across Esfand → the day roller resizes to 29/30.

### DateBox — calendar grid picker (`#datebox-calendar`)
- Persian: the grid header reads `Farvardin 1403`; day cells are calendar days.
- Navigate months with the arrows — moves one *calendar* month.
- Click the caption to drill up: month → year (Persian months) → decade
  (Persian years) → century (Persian decade ranges).
- The picker also shows the in-picker calendar switcher (`calendarSwitcher: true`),
  so the calendar can be changed from inside the dropdown. DateRangeBox forwards the
  same option to both inner date boxes.

### DateBox — typed input / mask (`#datebox-mask`)
- Click into the input (format `yyyy/MM/dd`). It shows `1403/01/01` in Persian.
- Type digits and use Up/Down arrows on the year/month/day parts — they
  increment in the calendar; the day clamps to the calendar month length.
- Paste `1403/02/15` — parses to the right Gregorian date.

### DateRangeBox (`#daterangebox`)
- Both start/end editors and the dropdown render in the selected calendar.

### Calendar widget (`#calendar`)
- Same as the grid picker, standalone. Try all four calendars; compare Hijri
  tabular vs Umm al-Qura (they can differ by one day).
- Set `calendarSwitcher: true` (or `{ items: ['gregorian', 'persian'] }`) to render
  an in-picker control that changes the active calendar at runtime. The stored value
  stays a Gregorian `Date`, so nothing migrates:
  `$('#calendar').dxCalendar({ value: new Date(), calendarSwitcher: true });`

### DataGrid (`#datagrid`)
- The `start` column displays dates in the selected calendar
  (`format: { type: 'shortdate', calendar }`).
- Click a date cell to edit — the inline `dxDateBox` uses the calendar
  (`editorOptions: { calendar }`). Sorting/filtering still work (the stored
  value stays a Gregorian `Date`).
- The **filter row** (top of the grid) and the **header filter** let you filter the
  date column in the selected calendar. Type a date in the filter-row editor (e.g.
  `1403/01/01` for Persian) — it parses to the right Gregorian date and filters
  correctly. The displayed value matches the calendar (no ~100-year drift).
- The **header-filter** funnel (column filter button) shows a Year → Month → Day tree
  grouped and labeled in the selected calendar (Persian `1403 → فروردین → 1`), and the
  resulting filter still matches the stored Gregorian dates. The grid column itself uses
  the calendar's default `yyyy/MM/dd` format for Persian/Hijri.

### PivotGrid (`#pivotgrid`)
- The row dimension groups the `date` field by **calendar year** and **calendar month**
  (Persian rolls up by `1402` / `1403` and Farvardin…Esfand), while the stored records stay
  Gregorian `Date`s. This is done with the public field `selector` (group key = the
  calendar year / month index from `getCalendar(calendar).toParts(...)`) plus `customizeText`
  (the calendar month name from `getCalendarMonthNamesInActiveLocale`), so no core PivotGrid
  change or data migration is needed — Gregorian uses the same code path.
- Switch the calendar dropdown: the year/month grouping re-rolls in the selected calendar.

### Scheduler (`#scheduler`)
- Day/Week/Timeline header cells show calendar **day numbers**.
- The **navigator caption** (toolbar date range) renders in the calendar,
  e.g. a day view shows `1 Farvardin 1403`.
- Switch `currentView` to `month`: cell numbers are calendar days (the calendar
  month name appears on its 1st), the grid **starts on the 1st of the calendar
  month**, and the navigator caption reads e.g. `Farvardin 1403`. `agenda` and
  `timelineWeek` day labels are also calendar-aware.
- Click an appointment: the tooltip (and appointment body) date text is in the calendar.
- Double-click a cell to add a new appointment: the **appointment popup**'s start/end and
  recurrence date editors render and parse in the selected calendar (e.g. `1403/01/01` for
  Persian). The stored value is still a Gregorian `Date`.

## 4. Add your own scenario

Edit `playground/calendar-multi.ts`. Every widget is a normal jQuery call with
the new `calendar` option / format, e.g.:

```ts
$('#datebox').dxDateBox({ value: new Date(), calendar: 'persian', pickerType: 'calendar' });
$('#grid').dxDataGrid({ columns: [{ dataField: 'd', dataType: 'date',
  format: { type: 'shortdate', calendar: 'hijri-umalqura' }, editorOptions: { calendar: 'hijri-umalqura' } }] });
$('#sched').dxScheduler({ calendar: 'persian', views: ['day','week'], currentView: 'week' });
```

Register a custom calendar:

```ts
import { registerCalendar } from 'devextreme/common/core/localization/calendar';
registerCalendar({ type: 'mycal', toParts, fromParts, getDaysInMonth, getMonthsInYear, isLeapYear, getMonthNames });
```

## 5. Automated tests (fast, no browser)

```bash
cd packages/devextreme
pnpm test-jest -- --testPathPattern calendar
```

Covers calendar conversions (incl. Umm al-Qura), DateView rollers, mask typed
input, Calendar month + year/decade/century grids, `localization/date` format/parse,
DataGrid display path (`format_helper`), and the Scheduler header + navigator caption.

Also includes `scheduler/__tests__/month_view.locale.test.ts` — a regression test that
locks down the fix for the **`locale('fa') + calendar: 'persian'` month view bug** (cells
rendered empty / `NaN` because the calendar-aware boundary code received `firstDayOfWeek:
undefined` and propagated `NaN` through `getFirstWeekDate`). It instantiates a real
Scheduler under `jsdom`, asserts every Persian month-view cell renders a digit (Latin or
Persian), no `NaN`/`undefined` text, and the day-of-week column headers are non-empty.

## 6. Formal per-framework demos (apps/demos)

Two demos exercise the public `calendar` option in each framework (jQuery, React,
ReactJs, Angular, Vue):

- `apps/demos/Demos/DateBox/MultipleCalendars` — a calendar switcher driving the
  rollers picker, the calendar grid picker, and the typed mask input.
- `apps/demos/Demos/Calendar/MultipleCalendars` — a calendar switcher driving the
  standalone Calendar widget across all zoom levels.
- `apps/demos/Demos/DateRangeBox/MultipleCalendars` — start/end editors and dropdown
  calendars in the selected system.
- `apps/demos/Demos/DataGrid/MultipleCalendars` — a date column whose `format` and
  `editorOptions` follow the selected calendar (display + inline editing).
- `apps/demos/Demos/Scheduler/MultipleCalendars` — header day numbers, navigator caption,
  month boundaries, and calendar-aware monthly recurrence.

These run inside the demos host against the built `devextreme-dist` bundle, so rebuild
the package first for them to reflect the source changes:

```bash
cd packages/devextreme
pnpm build      # produces devextreme-dist consumed by apps/demos
```

For live-source iteration without a bundle build, prefer the Vite playground above.

## 7. Known gaps (do NOT expect these to be calendar-aware yet)
- **Scheduler recurrence**: MONTHLY/YEARLY (incl. single/multiple/negative BYMONTHDAY,
  BYDAY-monthly like `1MO`/`-1FR`, and `YEARLY;BYMONTH;BYDAY`) recur in the calendar, and
  compose with `timeZone` / per-appointment `startDateTimeZone` (same offset mechanism as the
  Gregorian engine). `YEARLY;BYDAY` without BYMONTH still delegates to the Gregorian engine, and
  DST transitions that change the offset mid-series are a pre-existing Gregorian-shared limitation.
- **Gantt timeline scale** is rendered by the external `devexpress-gantt` engine
  and cannot be made calendar-aware from the DevExtreme side (no scale-text hook).
- These need deeper work plus browser (QUnit/TestCafe) tests.
