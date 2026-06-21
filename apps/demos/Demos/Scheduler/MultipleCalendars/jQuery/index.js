$(() => {
  const calendars = [
    { id: 'gregorian', text: 'Gregorian' },
    { id: 'persian', text: 'Persian (Jalali)' },
    { id: 'hijri', text: 'Hijri (tabular)' },
    { id: 'hijri-umalqura', text: 'Hijri (Umm al-Qura)' },
  ];

  const scheduler = $('.scheduler').dxScheduler({
    dataSource: data,
    views: ['week', 'month'],
    currentView: 'month',
    currentDate: new Date(2024, 2, 25),
    calendar: 'gregorian',
    startDayHour: 8,
    endDayHour: 18,
    height: 600,
  }).dxScheduler('instance');

  $('#calendar-selector').dxSelectBox({
    items: calendars,
    valueExpr: 'id',
    displayExpr: 'text',
    value: 'gregorian',
    inputAttr: { 'aria-label': 'Calendar' },
    onValueChanged(e) {
      scheduler.option('calendar', e.value);
    },
  });
});
