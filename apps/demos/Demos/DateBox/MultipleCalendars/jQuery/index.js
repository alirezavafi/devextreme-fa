$(() => {
  const value = new Date(2024, 2, 20);

  const calendars = [
    { id: 'gregorian', text: 'Gregorian' },
    { id: 'persian', text: 'Persian (Jalali)' },
    { id: 'hijri', text: 'Hijri (tabular)' },
    { id: 'hijri-umalqura', text: 'Hijri (Umm al-Qura)' },
  ];

  const editors = [];

  function registerEditor(selector, options) {
    const instance = $(selector).dxDateBox($.extend({
      value,
      calendar: 'gregorian',
      inputAttr: { 'aria-label': 'Date' },
    }, options)).dxDateBox('instance');
    editors.push(instance);
    return instance;
  }

  $('#calendar-selector').dxSelectBox({
    items: calendars,
    valueExpr: 'id',
    displayExpr: 'text',
    value: 'gregorian',
    inputAttr: { 'aria-label': 'Calendar' },
    onValueChanged(e) {
      editors.forEach((editor) => editor.option('calendar', e.value));
    },
  });

  registerEditor('#rollers', { pickerType: 'rollers' });
  registerEditor('#calendar-picker', { pickerType: 'calendar' });
  registerEditor('#mask', {
    pickerType: 'calendar',
    useMaskBehavior: true,
    displayFormat: 'yyyy/MM/dd',
  });
});
