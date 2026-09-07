import React, { useCallback, useState } from 'react';
import Calendar from 'devextreme-react/calendar';
import SelectBox from 'devextreme-react/select-box';

const date = new Date(2024, 2, 20);
const calendarLabel = { 'aria-label': 'Calendar' };

const calendars = [
  { id: 'gregorian', text: 'Gregorian' },
  { id: 'persian', text: 'Persian (Jalali)' },
  { id: 'hijri', text: 'Hijri (tabular)' },
  { id: 'hijri-umalqura', text: 'Hijri (Umm al-Qura)' },
];

function App() {
  const [calendar, setCalendar] = useState('gregorian');

  const onCalendarChanged = useCallback((e) => {
    setCalendar(e.value);
  }, []);

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
      <div className="calendar-container">
        <Calendar defaultValue={date} calendar={calendar} />
      </div>
    </div>
  );
}

export default App;
