Set the **calendar** property to display the Calendar in a non-Gregorian calendar system. The component supports the built-in `"gregorian"`, `"persian"` (Jalali), `"hijri"` (tabular), and `"hijri-umalqura"` systems, plus any custom calendar registered through `registerCalendar` in `devextreme/common/core/localization/calendar`.
<!--split-->

Use the **Calendar** drop-down to switch the active system. All zoom levels update: the month grid shows calendar day numbers and a localized caption, the year view lists calendar month names, and the decade/century views show calendar year ranges. Navigation moves by a calendar month/year/decade.

The selected value remains a native Gregorian `Date`, so you can change the calendar at runtime without converting stored data, and value binding, range limits (`min`/`max`), and disabled-date logic continue to work unchanged.
