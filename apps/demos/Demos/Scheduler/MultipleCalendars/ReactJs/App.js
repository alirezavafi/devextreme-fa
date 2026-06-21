import React, { useCallback, useState } from 'react';
import Scheduler from 'devextreme-react/scheduler';
import SelectBox from 'devextreme-react/select-box';

import { data } from './data.js';

const currentDate = new Date(2024, 2, 25);
const views = ['week', 'month'];
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
      <Scheduler
        dataSource={data}
        calendar={calendar}
        views={views}
        defaultCurrentView="month"
        defaultCurrentDate={currentDate}
        startDayHour={8}
        endDayHour={18}
        height={600}
      />
    </div>
  );
}
