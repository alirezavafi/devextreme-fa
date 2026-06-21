$(() => {
  const initialValue = [new Date(2024, 2, 20), new Date(2024, 3, 10)];

  const calendars = [
    { id: 'gregorian', text: 'Gregorian' },
    { id: 'persian', text: 'Persian (Jalali)' },
    { id: 'hijri', text: 'Hijri (tabular)' },
    { id: 'hijri-umalqura', text: 'Hijri (Umm al-Qura)' },
  ];

  const rangeBox = $('#range-box').dxDateRangeBox({
    value: initialValue,
    calendar: 'gregorian',
  }).dxDateRangeBox('instance');

  $('#calendar-selector').dxSelectBox({
    items: calendars,
    valueExpr: 'id',
    displayExpr: 'text',
    value: 'gregorian',
    inputAttr: { 'aria-label': 'Calendar' },
    onValueChanged(e) {
      rangeBox.option('calendar', e.value);
    },
  });
});
