import React, { useCallback, useState } from 'react';
import DateRangeBox from 'devextreme-react/date-range-box';
import SelectBox from 'devextreme-react/select-box';

const initialValue: [Date, Date] = [new Date(2024, 2, 20), new Date(2024, 3, 10)];
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
    <div className="dx-fieldset">
      <div className="dx-field">
        <div className="dx-field-label">Calendar</div>
        <div className="dx-field-value">
          <SelectBox
            items={calendars}
            valueExpr="id"
            displayExpr="text"
            value={calendar}
            inputAttr={calendarLabel}
            onValueChanged={onCalendarChanged}
          />
        </div>
      </div>
      <div className="dx-field">
        <div className="dx-field-label">Date range</div>
        <div className="dx-field-value">
          <DateRangeBox defaultValue={initialValue} calendar={calendar} />
        </div>
      </div>
    </div>
  );
}
