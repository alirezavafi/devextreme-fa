$(() => {
  const calendars = [
    { id: 'gregorian', text: 'Gregorian' },
    { id: 'persian', text: 'Persian (Jalali)' },
    { id: 'hijri', text: 'Hijri (tabular)' },
    { id: 'hijri-umalqura', text: 'Hijri (Umm al-Qura)' },
  ];

  const calendar = $('#calendar').dxCalendar({
    value: new Date(2024, 2, 20),
    calendar: 'gregorian',
  }).dxCalendar('instance');

  $('#calendar-selector').dxSelectBox({
    items: calendars,
    valueExpr: 'id',
    displayExpr: 'text',
    value: 'gregorian',
    inputAttr: { 'aria-label': 'Calendar' },
    onValueChanged(e) {
      calendar.option('calendar', e.value);
    },
  });
});
