Set the **calendar** property to let users select a date range in a non-Gregorian calendar system. Both the start and end editors, the dropdown calendars, and (with `useMaskBehavior`) typed input render in the selected system.
<!--split-->

Use the **Calendar** drop-down to switch between the built-in `"gregorian"`, `"persian"` (Jalali), `"hijri"` (tabular), and `"hijri-umalqura"` systems, or register a custom calendar through `registerCalendar` in `devextreme/common/core/localization/calendar`.

The start/end value stays an array of native Gregorian `Date` objects, so range validation, `min`/`max` limits, and `disableOutOfRangeSelection` continue to work, and you can change the calendar at runtime without converting data.
