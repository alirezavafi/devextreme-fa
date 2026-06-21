# Multi-calendar support — tracking

Goal: let DevExtreme date components display/enter dates in non-Gregorian calendars
(Persian/Jalali, Hijri/Islamic, and custom) while still storing native Gregorian `Date`
values. Users can switch calendars and pick from the UI or type the date.

This is a tracking checklist, not a formal spec (no requirements/design docs).

## Done (implemented + unit-tested with Jest)
- [x] Calendar-system abstraction: `CalendarSystem` interface + registry
      (`core.ts`: `registerCalendar`/`getCalendar`/`isCalendarRegistered`/`getRegisteredCalendarTypes`,
      Gregorian fallback).
- [x] Gregorian calendar (`gregorian.ts`).
- [x] Persian/Jalali calendar (`persian.ts`, Borkowski/jalaali-js arithmetic, years -61..3177).
- [x] Hijri/Islamic tabular calendar (`hijri.ts`, Julian-Day formulas).
- [x] Public re-export: `js/common/core/localization/calendar.{js,d.ts}`
      (lets apps register custom calendars).
- [x] Picker (rollers) integration:
      - `date_view.calendar.ts` — pure roller-config builders (DI for digit shaping).
      - `date_view.ts` — `calendar` option; delegates only when calendar !== 'gregorian'
        (default path unchanged).
      - DateView strategy → `DateBox` and `DateRangeBox` option plumbing + runtime change.
- [x] Public typings: `calendar` on `DateBoxBaseOptions` (DateBox + DateRangeBox + wrappers),
      `DateBoxCalendar` type.
- [x] Tests: `calendar.test.ts` (16) + `date_view.calendar.test.ts` (9) — 25 passing,
      including exhaustive weekly round-trip 1950–2100.
- [x] **Typed input ("type a date") in the selected calendar** —
      `date_box.mask.calendar.ts` provides calendar-aware format/parse and per-part
      getter/setter/limits, reusing the LDML formatter via a proxy date + calendar
      month-name adapter. Wired into `date_box.mask.ts` (`_getDisplayedText`,
      `_prepareRegExpInfo`, paste) and `date_box.mask.parts.ts` (`renderDateParts`),
      guarded so the Gregorian path is unchanged. Tests: `date_box.mask.calendar.test.ts`
      (17). Supports numeric and month-name patterns; live editing + paste round-trip.
- [x] **DateBox value display (non-mask)** — the input text for the rollers/calendar-grid
      pickers now renders the value in the selected calendar too (base `_getDisplayedText`
      passes `{ type, calendar }`), so the input matches the picker. Guarded; Gregorian
      unchanged.
- [x] **Calendar grid picker — month view** (`pickerType: 'calendar'`, `ui/calendar.js`) —
      `calendar.month_view.calendar.ts` provides the month grid layout, cell labels,
      other-month detection, navigator caption, and calendar-month navigation. Wired into
      `MonthView` (`calendar.views.ts`), the Calendar widget month-zoom navigation
      (`_getDateByOffset`/`_getViewsOffset`), the `calendar` option (+ public `calendar.d.ts`),
      and the DateBox calendar strategy. Guarded so Gregorian is unchanged.
      Tests: `calendar.month_view.calendar.test.ts` (11).
- [x] **Calendar grid picker — drill-up views** (year / decade / century) —
      `calendar.views.calendar.ts` provides calendar-aware first/next cell data, cell
      labels, captions, today/other-view/boundary checks for all three zoom levels.
      Wired into `YearView`/`DecadeView`/`CenturyView` (`calendar.views.ts`), shared
      `_getCalendarType`/`_isCustomCalendar` on `BaseView`, and non-month zoom navigation
      (`_getDateByOffset`/`_getViewsOffset`). Tests: `calendar.views.calendar.test.ts` (16).
- [x] **Visual testing**: Vite playground page `playground/calendar-multi.html` +
      `calendar-multi.ts` with a calendar switcher. See `VISUAL_TESTING.md`.
- [x] **Build/env unblocked**: full `pnpm install` (Node 24) + nx plugin build +
      `pnpm nx build:localization:generate devextreme` generate the CLDR data; the
      localization Jest suite (49) and the Vite playground now run.
- [x] **Localized display/parse via `localization/date.ts`** — `FormatObject.calendar`
      makes `dateLocalization.format(date, { type, calendar })` and `parse(...)` use the
      selected calendar (numeric + month-name patterns). Implemented in both the base
      (`date.ts`) and the injected `intl/date.ts` (the active one when `Intl` exists), via
      the shared core `calendar/date_format.ts`. Gregorian output unchanged.
      Tests: `date.calendar.test.ts` (8). This unlocks DataGrid display.
- [x] **DataGrid** — display via column `format: { type, calendar }` flows through
      `format_helper.format` → `dateLocalization.format` (confirmed by
      `format_helper.calendar.test.ts`, 4 tests); inline editing via
      `editorOptions: { calendar }` (dxDateBox). Sorting/filtering unaffected (value stays a
      Gregorian `Date`). Demoed in the playground (`#datagrid` case).
- [x] **Scheduler — header day labels** — `r1/utils/calendar_format.ts` renders the
      day/week/timeline header day numbers in the selected calendar; wired via the workspace
      `getFormat()` (vertical + timeline_month), the `calendar` option threaded through
      `workSpaceConfig`/`optionChanged`, plus public typing + default. Guarded.
      Tests: `r1/utils/calendar_format.test.ts` (5).
- [x] **Scheduler — month-view cell numbers, agenda, timeline week-row header** —
      `month.ts getCellText` (calendar month name on the 1st calendar day, padded calendar
      day otherwise), the agenda cell date number, and the timeline week-row header
      (`m_date_header_data_generator.ts`) are calendar-aware; `calendar` threaded through the
      workspace render options. Guarded. Tests: `r1/utils/month.calendar.test.ts` (4).

- [x] **Exact Umm al-Qura (Hijri)** — `umalqura.ts` registers calendar type
      `hijri-umalqura` (Intl `-u-ca-islamic-umalqura`, monotonic binary-search inverse,
      registered only when `Intl` supports it). Day-accurate vs the arithmetic `hijri`.
      Works everywhere the calendar abstraction is consumed. Public type unions updated.
      Tests: `umalqura.test.ts` (7).
- [x] **Scheduler navigator caption** — `header/utils.ts` caption formatters are
      calendar-aware (day/week/month captions: calendar day, month names, year). `calendar`
      threaded via `HeaderOptions`/`IntervalOptions` and the scheduler header config.
      Guarded so Gregorian is unchanged. Tests added to `header/utils.test.ts` (3).
- [x] **Range/multiple selection (display)** — selection is a set of Gregorian dates and is
      calendar-independent at the data layer; cell display already uses the calendar-aware
      `MonthView`. No code change required; verified by design (data stays Gregorian).

- [x] **Scheduler — month-view boundary + navigator caption** — the month grid now aligns to
      the *calendar* month (`view_data_generator_month.ts` `calculateStartViewDate` /
      `setVisibilityDates` / `getRowCount` via `month_boundary.calendar.ts`), and the
      navigator caption month interval aligns too (`header/utils.ts`), so a Persian month view
      starts on 1 Farvardin and the caption reads `Farvardin 1403`. Guarded; Gregorian
      unchanged. Tests: `view_data_generator_month.calendar.test.ts` (4) +
      `header/utils.test.ts` month-caption case. Full scheduler suite (1692) regression-free.
- [x] **Scheduler — calendar-aware recurrence (MONTHLY / YEARLY)** — recurring appointments
      recur on the same *calendar* day-of-month / month-and-day each calendar month / year.
      Bounded generator (INTERVAL / COUNT / UNTIL / single positive BYMONTHDAY / BYMONTH for
      yearly) in `recurrence/generate_dates.calendar.ts` (legacy engine) and
      `.../split_by_recurrence/generate_recurrence.calendar.ts` (active engine, pseudo-UTC
      space), wired into both and threaded through the filtration pipeline (`FilterOptions` →
      `splitByRecurrence` → `getAppointmentRecurrenceOccurrences` → `generateRecurrenceUTCDates`)
      from the scheduler `calendar` option. Daily/weekly/hourly and BYDAY/negative/multiple
      BYMONTHDAY delegate to the Gregorian RRULE engine. Tests: `generate_dates.calendar.test.ts`
      (9) + `generate_recurrence_utc_dates.calendar.test.ts` (5). Full scheduler suite (1706)
      regression-free.
- [x] **Scheduler — appointment tooltips & appointment date text** — the date part of tooltip
      and appointment-body date text (`appointments_new/utils/get_date_text.ts`) is rendered in
      the selected calendar (time part is calendar-independent). `calendar` threaded via the
      tooltip subscribe (`m_subscribes`) and the appointment view-item options
      (`appointments.ts` → `base_appointment.ts`, `getCalendar`). Guarded.
      Tests: `get_date_text.calendar.test.ts` (4). appointments_new suite (203) regression-free.
- [x] **Scheduler — calendar-aware BYDAY-monthly recurrence** — `FREQ=MONTHLY;BYDAY=1MO`
      (first Monday of each calendar month), `-1FR` (last Friday), `MO` (every Monday), and
      lists like `MO,WE` resolve within each *calendar* month. Ordinal-aware parser
      `recurrence/byday_entries.ts`; enumeration added to the active engine
      `generate_recurrence.calendar.ts`. Tests: `byday_entries.test.ts` (6) + BYDAY cases in
      `generate_recurrence_utc_dates.calendar.test.ts`. Full scheduler suite regression-free.
- [x] **Scheduler — recurrence edge cases** — negative BYMONTHDAY (`-1` = last calendar-month
      day), multiple BYMONTHDAY (`1,15`), and `YEARLY;BYMONTH=M;BYDAY=ordinal` now resolve in
      the selected calendar (generalized `generate_recurrence.calendar.ts`). `YEARLY;BYDAY`
      without BYMONTH still delegates to the Gregorian engine. Tests added to
      `generate_recurrence_utc_dates.calendar.test.ts` (12 calendar cases total).

- [x] **Scheduler — month view + locale 'fa' Invalid-Date crash fix** — under `locale('fa')`
      with a non-Gregorian `calendar` option, the month view rendered all cells empty (and in
      some flows threw `RangeError: Invalid time value`) because the calendar-aware
      `calculateStartViewDate` / `getRowCount` resolved `firstDayOfWeek` via
      `this.getFirstDayOfWeek(option)` — the base method just returns the option as-is. When
      the option is unset (the default), `undefined` propagated into `getFirstWeekDate`, where
      `(date.getDay() - undefined + 7) % 7` is `NaN` and `setDate(date - NaN)` produces an
      Invalid Date. Every per-cell date then derived from that invalid start.
      Fixed in `view_data_generator_month.ts` with a small helper
      `getCalendarFirstDayOfWeekFallback` that resolves the effective first-day-of-week as
      *explicit option → calendar's own default (Persian/Hijri = Saturday) → locale default*,
      mirroring the Gregorian path's `getCalculatedFirstDayOfWeek`. Defensive guards remain in
      `getCellText`, `formatImplicitSchedulerDate/Month/Time`, and the navigator caption to
      keep the UI from crashing if any future code path produces an invalid date.
      Tests: `__tests__/month_view.locale.test.ts` (3 cases — Gregorian and Persian under
      `locale('fa')` plus column headers); full calendar suite (158) regression-free.

- [x] **DataGrid header-filter date tree — calendar-aware** — the column header-filter (the
      funnel/filter button) builds a Year → Month → Day tree. It now groups and labels by the
      *selected calendar* (e.g. Persian `1403 → فروردین → 1`) instead of always Gregorian, and
      the resulting filter still matches the stored Gregorian dates. Three coordinated,
      calendar-guarded changes keep the tree and the filter internally consistent:
      `m_utils.ts` `DATE_INTERVAL_SELECTORS` group by calendar year/month/day (driven by
      `getColumnCalendarType(column)`, read from the column `format.calendar`);
      `header_filter/m_header_filter.ts` formats the year/month level text via the calendar
      (`getCalendarMonthNamesInActiveLocale`); and `ui/shared/filtering.ts`
      `getFilterExpressionForDate` rebuilds the Gregorian `[start, end)` range from the calendar
      parts via `calendar.fromParts` / `getDaysInMonth`. Time-of-day levels and the
      remote-grouping UTC path stay Gregorian (remote is out of scope). Guarded so the Gregorian
      path is byte-for-byte unchanged. Tests:
      `header_filter/__tests__/header_filter.calendar.test.ts` (6 cases — calendar
      year/month/day grouping, day/month/year filter ranges matching stored Gregorian dates,
      and the Gregorian baseline). Full grid_core suite (1827) regression-free.

- [x] **Playground — DataGrid uses the calendar default `yyyy/MM/dd` + localized filtering** —
      `calendar-multi.ts` now formats the date column with the calendar's own default date
      format (`getCalendarDefaultDateFormat(calendar) ?? 'shortdate'`), so a Persian grid shows
      `1403/01/01` rather than the locale shortdate, and enables `filterRow` + `headerFilter`
      to demonstrate calendar-aware filtering.


      inline edit `dxDateBox` (and the filter-row date editor) showed a wrong localized date
      (year drifted ~100 years, e.g. `1303` instead of `1403`, and a scrambled field order)
      under a non-Gregorian calendar. Root cause: the grid's editor factory
      (`ui.editor_factory_mixin.ts.prepareDateBox`) passes the column `format` object
      (`{ type: 'shortdate', calendar }`) as the DateBox `displayFormat`. The DateBox mask's
      `_getFormatPattern` only treated *string* display formats as LDML patterns; for a format
      *object* it fell back to `getFormat()`, which reverse-engineers an LDML pattern by
      sampling dates through `dateLocalization.format(...)` — but that formats in the
      *calendar*, so the inferred Gregorian pattern was corrupted (the 100-year drift). Fixed
      in `date_box.mask.ts._getFormatPattern`: when the active calendar is custom, resolve the
      pattern directly from the format *type* via `dateLocalization._getPatternByFormat(type)
      ?? type` (handling both a format object's `.type` and a bare type/LDML string), exactly
      like the calendar format/parse path. Guarded so the Gregorian path is byte-for-byte
      unchanged. Tests: `date_box/__tests__/datebox.grid_editor.calendar.test.ts` (2 cases —
      grid-style `displayFormat` object renders `1403` not `2024`/`1303`, and the displayed
      text round-trips back to the original Gregorian `Date`). Full date_box + calendar suite
      (161) regression-free.

- [x] **Playground — DataGrid localized-date filtering sample** — `calendar-multi.ts` enables
      `filterRow: { visible: true }` and `headerFilter: { visible: true }` on the DataGrid so
      the date column can be filtered using the selected calendar (the filter-row date editor
      reuses the column's calendar-aware `format` / `editorOptions`, and benefits from the mask
      pattern fix above). Stored filter values stay Gregorian `Date`s.


      double-clicks a cell (or otherwise opens the appointment popup), the start/end-date
      `dxDateBox` editors and the recurrence start/until editors now display and parse in the
      scheduler's selected calendar. `calendar` flows from the Scheduler `calendar` option →
      `AppointmentFormConfig.calendar` (`m_scheduler.ts.createAppointmentForm`) →
      `getStartDateCommonConfig(firstDayOfWeek, calendar)` (which writes both
      `editorOptions.calendar` and `editorOptions.calendarOptions.calendar`, guarded so the
      Gregorian default path is byte-for-byte unchanged) → start/end/recurrence editors. The
      recurrence "until" date editor was wired the same way. Also runtime: changing the
      Scheduler's `calendar` option now rebuilds the popup form so the next open reflects the
      new calendar (`m_scheduler.ts._optionChanged`). Time-of-day editors keep their default
      configuration (calendar is irrelevant to hour/minute selection). The appointment value
      stays a Gregorian `Date` end-to-end. Tests:
      `appointment_popup/appointment_popup.calendar.test.ts` (2 cases — Persian → all editors
      including recurrence have `calendar: 'persian'`; default → Gregorian baseline preserved).
      Full appointment-popup suite (241) regression-free.

- [x] **Playground — Today button visible in calendar pickers** — `calendar-multi.ts` now
      sets `showTodayButton: true` on the standalone Calendar widget and passes
      `calendarOptions: { showTodayButton: true }` to the calendar-grid DateBox, mask DateBox,
      and DateRangeBox so each picker dropdown shows a localized "Today" button (Persian
      "امروز" already shipped in `messages/fa.json`).


      two related bugs surfaced together when the user changed calendar from inside the
      DateBox calendar grid picker. (1) The DateBox popup did not close on its own when the
      SelectBox dropdown was clicked — the inner-overlay machinery already covered the click,
      and `propagateOutsideClick: false` (default) prevents the parent overlay from even
      receiving the event. The behavior is locked down by `calendar.switcher.dom.test.ts`
      (2 cases: dropdown carries `dx-inner-overlay`, and synthesized
      input/dropdown clicks leave `dateBox.option('opened')` true). (2) The Vite playground
      `calendar-multi.ts` mirrored the in-picker calendar change up to the toolbar SelectBox
      via `option('value', ...)`, but the toolbar's `onValueChanged` handler unconditionally
      called `rebuildAll()` — which disposed and re-created every other widget on the page,
      making it look like every component switched calendar. Now a `mirroringCalendarFromInPicker`
      flag is honored both at the source (the mirror) and at the destination (the toolbar
      `onValueChanged` early-returns), so an in-picker switch only re-renders the originating
      widget. The toolbar selection still rebuilds everything when the user picks it directly.

## Remaining

- [x] **Intl Gregorian-by-default fix** — `intl/date.ts.getFormatter` now passes
      `calendar: 'gregory'` to `Intl.DateTimeFormat` whenever the caller hasn't
      explicitly specified a calendar. Without this, locales whose Intl defaults to a
      non-Gregorian calendar (`fa` → Persian, `th` → Buddhist, `ar-SA` → Islamic) silently
      formatted Gregorian Date inputs as their default calendar, producing dates like
      `"۱/۱/۱۴۰۳"` for `new Date(2024, 2, 20)` under `locale('fa')`. That mismatch caused
      the scheduler month view to render `NaN` cells (round-trip parses failed) and the
      DateBox readouts to show Persian-calendar dates when Gregorian was selected.
      The `calendar: 'persian' | 'hijri'` widget option still routes through the
      explicit `formatDateInCalendar` path. Also fixed the `shortdateshorttime`
      resolver to query Intl with `calendar: 'gregory'` so the inferred Y/M/D
      options match Gregorian inputs. All 183 calendar/date_box/localization tests
      pass.
- [x] **Calendar-aware roller order** — `date_view.ts._createRollerConfigs` now uses a
      fixed Day → Month → Year order for non-Gregorian calendars (Persian/Hijri). Time
      parts (when `type='datetime'`) are appended from the locale's pattern after the
      DMY date parts. Gregorian is unaffected.
- [x] **In-picker switcher propagates to DateBox** — `m_date_box.strategy.calendar.ts`
      hooks `onOptionChanged` on the inner Calendar widget; when the in-picker switcher
      changes `calendar` on the inner widget, the strategy mirrors it to the parent
      DateBox's `calendar` option so the change persists after the dropdown closes.
- [x] **Calendar metadata: first day of week + default date format** — `CalendarSystem` now
      carries optional `firstDayOfWeek` (Persian/Hijri = Saturday = 6) and `defaultDateFormat`
      (Persian/Hijri = `yyyy/MM/dd`), with `getCalendarFirstDayOfWeek` / `getCalendarDefaultDateFormat`
      accessors (re-exported publicly). The Calendar widget uses the calendar's first day when the
      user hasn't set `firstDayOfWeek` (`_viewConfig`), and DateBox/DateRangeBox use the calendar's
      default format when `displayFormat` is unset (`_getEffectiveDisplayFormatOption`, applied to
      display, parse, and the typed mask). The unset check uses `isDefined` so the DateBox internal
      default `displayFormat: null` does not block it. Gregorian is unaffected (no metadata → locale
      default). Tests: metadata cases in `calendar.test.ts` (4); full calendar suite (150) green.
- [x] **Locale-aware calendar month names** — `CalendarSystem.getMonthNames(format, locale?)`
      now accepts a locale; Persian and Hijri carry Persian-script (`fa`) and (for Hijri) Arabic-script
      (`ar`) tables, with region-tag fallback (`fa-IR` → `fa`) and English transliteration as the
      ultimate fallback. A new `getCalendarMonthNamesInActiveLocale` helper resolves the active
      DevExtreme locale and is wired into the Calendar widget month/year captions, the DateView
      rollers, and the Scheduler month/header. Tests: `localized month names` describe in
      `calendar.test.ts` (6 cases); full calendar suite (150) green.
- [x] **Playground — stored-vs-calendar readout + language selector + Persian font** —
      `calendar-multi.html/.ts` shows a table of each component's stored Gregorian value next to its
      selected-calendar rendering, and a Language selector that loads the shipped `fa` messages,
      switches `locale('fa')`, enables RTL, and toggles a `lang-fa` body class that applies the
      Vazirmatn web font (loaded from a CDN) for proper Persian rendering. The mask DateBox and
      Calendar omit explicit `displayFormat`/`firstDayOfWeek` to showcase the calendar defaults.
      Verified the page transforms via Vite.
- [x] **Scheduler — recurrence × per-appointment time zones** — calendar MONTHLY/YEARLY
      recurrence composes with `timeZone` / per-appointment `startDateTimeZone` using the *same*
      `startDateOffsetBase` shift mechanism as the Gregorian RRULE path (the offset is added to
      `start`/`min`/`max` before generation in `generate_recurrence_utc_dates.ts` and removed
      from each result), so occurrences land on the correct *calendar* day regardless of time
      zone. Verified deterministically with a fixed-offset zone (Asia/Tehran, no DST since 2022)
      in `generate_recurrence_utc_dates.calendar.test.ts` (4 timezone cases). The only residual
      is DST-transition behavior when the offset changes *mid-series* — a pre-existing limitation
      shared with the Gregorian engine (a single offset is applied to the whole series), not
      specific to calendars, and best confirmed in a browser/TZ harness.
- [x] **Formal per-framework demos** (apps/demos for jQuery/React/ReactJs/Angular/Vue).
      Added `MultipleCalendars` demos for **DateBox** (rollers + calendar grid + typed mask),
      **Calendar** (all zoom levels), **DateRangeBox** (start/end + dropdown), **DataGrid**
      (date column `format`/`editorOptions` + inline editing), and **Scheduler** (header,
      caption, month boundaries, calendar recurrence), each with a calendar switcher across all
      five frameworks. Registered in `apps/demos/menuMeta.json`. They bind the public
      `calendar` option and run against the built `devextreme-dist` bundle (rebuild the package
      to pick up the source changes). The Vite playground (`calendar-multi.html`) remains the
      live-source interactive demo.
- [~] **Browser QUnit/TestCafe UI tests** — a QUnit test
      (`testing/tests/DevExpress.ui.widgets.editors/calendar.calendarSystem.tests.js`) covers
      the registry, dxCalendar caption, dxDateBox input in the selected calendar, and the
      in-picker calendar switcher (render/visibility, configured `items`, selecting a calendar,
      option sync, toggle off, and the dxDateBox dropdown switcher). Written to repo conventions;
      runs in the karma/browser harness, not the local jsdom Jest project. DateRangeBox /
      DataGrid / full Scheduler still need broader browser coverage.
- [~] **DataGrid / Scheduler browser QUnit tests** — added
      `dataGrid.calendarSystem.tests.js` (date column display in the selected calendar,
      Gregorian baseline unchanged, inline `dxDateBox` editor receives the calendar, stored
      value stays a Gregorian `Date`) and `integration.calendarSystem.tests.js` (navigator
      caption in day/month views, Gregorian baseline, runtime `calendar` change, appointment
      value stays Gregorian). Auto-discovered by the constellation harness (`explicit: false`);
      run in karma/browser, not the local jsdom Jest project.
- [x] **In-picker calendar switcher UI** — the Calendar widget has an optional
      `calendarSwitcher` option (`boolean | { items?: CalendarSystemType[] }`). When enabled,
      a styled **`dxSelectBox`** is rendered in the widget that lets the user change the active
      calendar at runtime; the stored value stays a Gregorian `Date`, so there is no data
      migration. The dropdown overlay is anchored to `body` (`dropDownOptions.container: 'body'`),
      so the switcher works correctly when the Calendar is itself inside a popup (e.g. a DateBox
      dropdown). Pure model builders live in `calendar.switcher.calendar.ts`
      (`getCalendarSwitcherItems`/`normalizeSwitcherValue`/`getCalendarDisplayName`); the widget
      hosts the SelectBox via `_createComponent` (`_renderCalendarSwitcher`, guarded so the
      default `calendarSwitcher: false` path is unchanged) and re-syncs on `calendar`/
      `calendarSwitcher` option changes (with a re-entrancy guard). Public `CalendarSwitcher`
      type + option added. Also threaded through **DateBox** (calendar picker, via the calendar
      strategy `_getWidgetOptions` — and the strategy mirrors in-picker `calendar` changes back
      to the parent DateBox via `onOptionChanged`) and **DateRangeBox** (forwarded to both
      inner date boxes), with public `calendarSwitcher` on `DateBoxBaseOptions`.
      Tests: `calendar.switcher.calendar.test.ts` (10) + QUnit
      `calendar.calendarSystem.tests.js` (~10 switcher cases incl. in-picker propagation).
      Full date_box + calendar suite (150) regression-free.
- [ ] **Gantt** — BLOCKED for the timeline scale. The timeline is rendered by the external
      `devexpress-gantt` engine (loaded via `getGanttViewCore()` in `ui.gantt.view.ts`).
      Its constructor accepts `cultureInfo` (month/day *names*) but exposes **no per-tick
      date-format / scale-text hook**, and the day-of-month / year numbers are computed
      inside the engine from Gregorian dates. Making the scale calendar-aware therefore
      requires calendar support inside `devexpress-gantt` itself (separate package).
      Feasible DevExtreme-side slice (not yet done, and inconsistent on its own): route the
      task-edit dialog's `dxDateBox` editors + dialog date display through a `calendar`
      option. Deferred to avoid a Persian-dialog / Gregorian-timeline mismatch until the
      engine can match.
- [x] **Exact Umm al-Qura** — done via `Intl` ICU data (`-u-ca-islamic-umalqura`) in
      `umalqura.ts` (calendar type `hijri-umalqura`), which is the same day-accurate source a
      hand-maintained month-length table would encode. Day-accurate vs the arithmetic `hijri`;
      verified by `umalqura.test.ts` (7, incl. anchor + round-trips 2000–2050). Registered only
      when the runtime's `Intl` supports it. A static lookup-table fallback for runtimes
      *without* Intl UAQ is intentionally out of scope (large data, marginal value; such
      runtimes fall back to the arithmetic `hijri` calendar).
- [x] **Demos + docs** — per-framework demos for all five widgets (see above), each with a
      `description.md`; public API JSDoc (`@docid`/`@public`) on `calendar`, `calendarSwitcher`,
      `CalendarSystemType`, `CalendarSwitcher`/`CalendarSwitcherConfig`, `DateBoxCalendar`;
      a developer guide `README.md` (public API, per-widget usage, custom-calendar contract,
      calendar-aware feature list, known limitations); and `VISUAL_TESTING.md` for exploration.
- [x] **QUnit/TestCafe UI tests for DateBox/DateRangeBox/Calendar** — covered by
      `calendar.calendarSystem.tests.js`: dxCalendar caption + in-picker switcher, dxDateBox
      input + dropdown switcher, and dxDateRangeBox (both inputs in the selected calendar,
      Gregorian baseline, runtime `calendar` change, value stays a Gregorian `Date` array).
      Browser/karma harness (not the local jsdom Jest project).

## Notes / environment

- Repo pins Node 24.15.0; Jest project `jsdom-tests` runs `js/__internal/**/*.test.ts`.
- Run feature tests: `cd packages/devextreme && pnpm test-jest -- --testPathPattern calendar`.
- The broader `localization` Jest suite needs generated CLDR data
  (`pnpm nx build:localization:generate devextreme`, which itself needs the nx plugin built).
  These calendar modules intentionally avoid that chain so they test in isolation.
