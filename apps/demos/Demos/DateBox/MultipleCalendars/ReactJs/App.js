import React, { useCallback, useState } from 'react';
import DateBox from 'devextreme-react/date-box';
import SelectBox from 'devextreme-react/select-box';

const date = new Date(2024, 2, 20);
const dateLabel = { 'aria-label': 'Date' };
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
    <div>
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
          <div className="dx-field-label">Rollers picker</div>
          <div className="dx-field-value">
            <DateBox
              defaultValue={date}
              calendar={calendar}
              pickerType="rollers"
              inputAttr={dateLabel}
            />
          </div>
        </div>
        <div className="dx-field">
          <div className="dx-field-label">Calendar grid picker</div>
          <div className="dx-field-value">
            <DateBox
              defaultValue={date}
              calendar={calendar}
              pickerType="calendar"
              inputAttr={dateLabel}
            />
          </div>
        </div>
        <div className="dx-field">
          <div className="dx-field-label">Typed input (mask)</div>
          <div className="dx-field-value">
            <DateBox
              defaultValue={date}
              calendar={calendar}
              pickerType="calendar"
              useMaskBehavior={true}
              displayFormat="yyyy/MM/dd"
              inputAttr={dateLabel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
