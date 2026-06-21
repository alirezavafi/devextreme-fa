$(() => {
  const calendars = [
    { id: 'gregorian', text: 'Gregorian' },
    { id: 'persian', text: 'Persian (Jalali)' },
    { id: 'hijri', text: 'Hijri (tabular)' },
    { id: 'hijri-umalqura', text: 'Hijri (Umm al-Qura)' },
  ];

  const grid = $('#grid').dxDataGrid({
    dataSource: orders,
    keyExpr: 'ID',
    showBorders: true,
    editing: {
      mode: 'cell',
      allowUpdating: true,
    },
    columns: [
      { dataField: 'ProductName', caption: 'Product' },
      {
        dataField: 'OrderDate',
        dataType: 'date',
        format: { type: 'shortdate', calendar: 'gregorian' },
        editorOptions: { calendar: 'gregorian' },
      },
      { dataField: 'Amount', format: 'currency' },
    ],
  }).dxDataGrid('instance');

  $('#calendar-selector').dxSelectBox({
    items: calendars,
    valueExpr: 'id',
    displayExpr: 'text',
    value: 'gregorian',
    inputAttr: { 'aria-label': 'Calendar' },
    onValueChanged(e) {
      grid.beginUpdate();
      grid.columnOption('OrderDate', 'format', { type: 'shortdate', calendar: e.value });
      grid.columnOption('OrderDate', 'editorOptions', { calendar: e.value });
      grid.endUpdate();
      grid.refresh();
    },
  });
});
