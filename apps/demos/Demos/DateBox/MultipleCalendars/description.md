Use the **calendar** property to let users view and enter dates in a non-Gregorian calendar system (Persian/Jalali, Hijri tabular, or Hijri Umm al-Qura) while the DateBox keeps storing a native Gregorian `Date` value.
<!--split-->

This demo lets you switch the active calendar from the **Calendar** drop-down. Every editor below updates to the selected calendar:

- **Rollers picker**
The year, month, and day rollers show calendar years, localized month names (for example Farvardin–Esfand in Persian), and the correct number of days per calendar month.

- **Calendar grid picker**
The grid header caption, day cells, and month/year/decade/century navigation all use the selected calendar. Stored values stay Gregorian, so binding, sorting, and validation are unaffected.

- **Typed input (mask)**
With [useMaskBehavior](/Documentation/ApiReference/UI_Widgets/dxDateBox/Configuration/#useMaskBehavior) enabled, you can type or use the arrow keys to edit each part of the date in the selected calendar. The day part clamps to the calendar month length.

The **calendar** value can be one of the built-in systems (`"gregorian"`, `"persian"`, `"hijri"`, `"hijri-umalqura"`) or a custom calendar registered through `registerCalendar` in `devextreme/common/core/localization/calendar`. Because the underlying value is always a Gregorian `Date`, you can change the calendar at runtime without migrating data.
