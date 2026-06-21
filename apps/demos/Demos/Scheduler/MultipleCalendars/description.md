Set the **calendar** property to render the Scheduler in a non-Gregorian calendar system. Header day numbers, the navigator caption, month-view cell numbers and month boundaries, agenda/timeline labels, and appointment tooltips all display in the selected calendar.
<!--split-->

Use the **Calendar** drop-down to switch between the built-in `"gregorian"`, `"persian"` (Jalali), `"hijri"` (tabular), and `"hijri-umalqura"` systems. Switch `currentView` to **month** to see the grid start on the first day of the calendar month with a localized caption (for example `Farvardin 1403`).

Recurring appointments recur on the corresponding *calendar* day. The "Monthly Team Sync" appointment uses `FREQ=MONTHLY;BYMONTHDAY=28`, which in a non-Gregorian calendar repeats on the 28th day of each calendar month.

All appointment values stay native Gregorian `Date` objects, so data, time zones, and existing recurrence rules keep working. You can also register a custom calendar through `registerCalendar` in `devextreme/common/core/localization/calendar`.
