Set a date column's **format** to `{ type, calendar }` and its **editorOptions** to `{ calendar }` to display and edit dates in a non-Gregorian calendar system, without changing the stored value.
<!--split-->

Use the **Calendar** drop-down to switch between the built-in `"gregorian"`, `"persian"` (Jalali), `"hijri"` (tabular), and `"hijri-umalqura"` systems. The `OrderDate` column re-renders in the selected calendar, and the inline cell editor (a `dxDateBox`) lets users pick or type the date in that calendar.

Because each cell value remains a native Gregorian `Date`, sorting, filtering, grouping, and summaries continue to work unchanged. You can also register a custom calendar through `registerCalendar` in `devextreme/common/core/localization/calendar`.
