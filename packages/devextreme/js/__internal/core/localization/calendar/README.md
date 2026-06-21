<!-- eslint-disable spellcheck/spell-checker -->
# Calendar systems (non-Gregorian calendars)

DevExtreme date components can display and accept dates in non-Gregorian calendar
systems — Persian/Jalali, Hijri (tabular), and Hijri (Umm al-Qura) — while always
storing the value as a native (proleptic Gregorian) `Date`. Switching the calendar
only changes how a date is shown and entered; it never migrates the stored value,
so binding, sorting, filtering, validation, and time zones keep working unchanged.

## Public API

```ts
import {
  registerCalendar,
  getCalendar,
  isCalendarRegistered,
  getRegisteredCalendarTypes,
  getCalendarFirstDayOfWeek,
  getCalendarDefaultDateFormat,
} from 'devextreme/common/core/localization/calendar';
```

Built-in calendar types (registered automatically):

| Type               | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `gregorian`        | Default. Output is byte-for-byte unchanged.              |
| `persian`          | Jalali calendar (Borkowski/jalaali arithmetic).          |
| `hijri`            | Islamic tabular calendar (Julian-Day formulas).          |
| `hijri-umalqura`   | Umm al-Qura via `Intl` ICU data (day-accurate).          |

> `hijri-umalqura` is registered only when the runtime's `Intl` supports
> `-u-ca-islamic-umalqura` (all evergreen browsers and Node with full ICU). When it
> is unavailable, use the arithmetic `hijri` calendar instead.

## Using a calendar per widget

```ts
// DateBox / DateRangeBox — picker, typed mask, and value display
$('#db').dxDateBox({ value: new Date(), calendar: 'persian', pickerType: 'calendar' });
$('#dr').dxDateRangeBox({ value: [start, end], calendar: 'hijri' });

// Calendar widget — all zoom levels (month/year/decade/century)
$('#cal').dxCalendar({ value: new Date(), calendar: 'persian' });

// Optional in-picker switcher (Calendar, DateBox, DateRangeBox)
$('#cal').dxCalendar({ calendarSwitcher: true });
$('#cal').dxCalendar({ calendarSwitcher: { items: ['gregorian', 'persian'] } });

// DataGrid — column display + inline editor
columns: [{
  dataField: 'orderDate',
  dataType: 'date',
  format: { type: 'shortdate', calendar: 'persian' },
  editorOptions: { calendar: 'persian' },
}];

// Scheduler — header labels, navigator caption, month boundaries, recurrence
$('#sch').dxScheduler({ calendar: 'persian', views: ['day', 'week', 'month'] });
```

## Registering a custom calendar

Implement the `CalendarSystem` contract (date-only; time-of-day is handled by the
calling component and is calendar-independent):

```ts
import { registerCalendar } from 'devextreme/common/core/localization/calendar';

registerCalendar({
  type: 'my-calendar',
  toParts(date) { /* Gregorian Date -> { year, month /* 0-based *​/, day } */ },
  fromParts({ year, month, day }) { /* -> Gregorian Date at local midnight */ },
  getDaysInMonth(year, month) { /* number */ },
  getMonthsInYear(year) { /* number */ },
  isLeapYear(year) { /* boolean */ },
  getMonthNames(format) { /* string[] for 'wide' | 'abbreviated' | 'narrow' */ },
});
```

Once registered, the `type` can be passed to any `calendar` option above and it
appears in the in-picker switcher.

## Calendar metadata (first day of week & default format)

A calendar may declare a preferred week start and display format. The built-in
Persian and Hijri calendars start the week on **Saturday** (`firstDayOfWeek: 6`)
and use **`yyyy/MM/dd`** (`defaultDateFormat`). These are applied automatically:

- The Calendar widget uses the calendar's first day of week when the consumer
  has not set `firstDayOfWeek` explicitly.
- DateBox/DateRangeBox use the calendar's default format when `displayFormat` is
  not set (for display, parsing, and the typed mask).

A custom calendar can opt in by adding `firstDayOfWeek` / `defaultDateFormat` to
its definition; omitting them keeps the locale-based defaults. Gregorian declares
neither, so default behavior is unchanged.

## Localization (Persian / fa)

DevExtreme ships a Persian message dictionary (`js/localization/messages/fa.json`).
Combine it with a non-Gregorian `calendar` for a fully localized RTL experience:

```ts
import { locale, loadMessages } from 'devextreme/localization';
import faMessages from 'devextreme/localization/messages/fa.json';

loadMessages(faMessages);
locale('fa'); // widgets created afterwards use Persian strings (set rtlEnabled for RTL)
```

The built-in Persian and Hijri calendars also carry locale-aware month names —
Persian-script for `fa`, Arabic-script for `ar` (Hijri only). When the active
DevExtreme locale matches, `getMonthNames` returns the localized names
automatically; otherwise it falls back to the English transliteration. Region
tags like `fa-IR` are normalized to `fa`. Use
`getCalendarMonthNamesInActiveLocale(type, format)` to retrieve names that
follow the active locale.

## What is calendar-aware

- DateBox/DateRangeBox: rollers picker, calendar-grid picker (all zoom levels),
  typed input mask, and the displayed value text.
- Calendar widget: month/year/decade/century grids, captions, navigation, and the
  optional in-picker switcher.
- DataGrid: date-column display (`format`) and inline editing (`editorOptions`).
- Scheduler: day/week/timeline header day numbers, navigator caption, month-view
  cell numbers and month boundaries, agenda/timeline labels, appointment tooltips,
  and MONTHLY/YEARLY recurrence (incl. BYMONTHDAY, BYDAY-monthly, negative/multiple
  BYMONTHDAY, and `YEARLY;BYMONTH;BYDAY`).

## Known limitations

- `YEARLY;BYDAY` without `BYMONTH`, and calendar recurrence combined with
  per-appointment time zones, still use the Gregorian engine.
- The Gantt timeline scale is rendered by the external `devexpress-gantt` engine,
  which exposes no per-tick date-format hook, so its scale cannot be made
  calendar-aware from the DevExtreme side.

See `VISUAL_TESTING.md` for how to explore each component, and `TASKS.md` for the
full implementation status.
