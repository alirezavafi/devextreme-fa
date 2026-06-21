import React, { useCallback, useMemo, useState } from 'react';
import DataGrid, { Column, Editing } from 'devextreme-react/data-grid';
import SelectBox from 'devextreme-react/select-box';

import { orders } from './data.js';

const calendarLabel = { 'aria-label': 'Calendar' };

const calendars = [
  { id: 'gregorian', text: 'Gregorian' },
  { id: 'persian', text: 'Persian (Jalali)' },
  { id: 'hijri', text: 'Hijri (tabular)' },
  { id: 'hijri-umalqura', text: 'Hijri (Umm al-Qura)' },
];

export default function App() {
  const [calendar, setCalendar] = useState('gregorian');

  const onCalendarChanged = useCallback((e) => {
    setCalendar(e.value);
  }, []);

  const dateFormat = useMemo(() => ({ type: 'shortdate', calendar }), [calendar]);
  const editorOptions = useMemo(() => ({ calendar }), [calendar]);

  return (
    <div className="demo-container">
      <div className="options">
        <span>Calendar</span>
        <SelectBox
          items={calendars}
          valueExpr="id"
          displayExpr="text"
          value={calendar}
          inputAttr={calendarLabel}
          onValueChanged={onCalendarChanged}
        />
      </div>
      <DataGrid
        dataSource={orders}
        keyExpr="ID"
        showBorders={true}
      >
        <Editing mode="cell" allowUpdating={true} />
        <Column dataField="ProductName" caption="Product" />
        <Column
          dataField="OrderDate"
          dataType="date"
          format={dateFormat}
          editorOptions={editorOptions}
        />
        <Column dataField="Amount" format="currency" />
      </DataGrid>
    </div>
  );
}
