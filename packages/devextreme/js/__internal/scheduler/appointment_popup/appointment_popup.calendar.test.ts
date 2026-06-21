import {
  afterEach, describe, expect, it,
} from '@jest/globals';

import {
  createAppointmentPopup,
  disposeAppointmentPopups,
} from '../__tests__/__mock__/create_appointment_popup';

describe('AppointmentPopup × calendar option', () => {
  afterEach(() => {
    disposeAppointmentPopups();
  });

  it('forwards `calendar` to startDate / endDate / recurrence-start dxDateBox editors', async () => {
    const { POM } = await createAppointmentPopup({
      appointmentData: {
        text: 'app',
        startDate: new Date(2024, 2, 20, 9, 30),
        endDate: new Date(2024, 2, 20, 11, 0),
      },
      firstDayOfWeek: 6,
      calendar: 'persian',
    });

    POM.selectRepeatValue('weekly');

    const startDateEditor = POM.dxForm.getEditor('startDateEditor');
    const endDateEditor = POM.dxForm.getEditor('endDateEditor');
    const recurrenceStartEditor = POM.dxForm.getEditor('recurrenceStartDateEditor');

    expect(startDateEditor?.option('calendar')).toBe('persian');
    expect(endDateEditor?.option('calendar')).toBe('persian');
    expect(recurrenceStartEditor?.option('calendar')).toBe('persian');

    // The internal Calendar widget (open it via the editor's calendarOptions
    // path) also receives the calendar so the in-popup grid renders correctly.
    expect(startDateEditor?.option('calendarOptions.calendar')).toBe('persian');
    expect(endDateEditor?.option('calendarOptions.calendar')).toBe('persian');
  });

  it('leaves the Gregorian path unchanged when no calendar is specified', async () => {
    const { POM } = await createAppointmentPopup({
      appointmentData: {
        text: 'app',
        startDate: new Date(2024, 2, 20, 9, 30),
        endDate: new Date(2024, 2, 20, 11, 0),
      },
      firstDayOfWeek: 1,
    });

    const startDateEditor = POM.dxForm.getEditor('startDateEditor');
    const endDateEditor = POM.dxForm.getEditor('endDateEditor');

    // When no calendar is specified, the DateBox sees its own default
    // ('gregorian') and we do not write `calendar` into calendarOptions.
    const startCalendar = startDateEditor?.option('calendar') as string | undefined;
    expect(['gregorian', undefined]).toContain(startCalendar);
    const endCalendar = endDateEditor?.option('calendar') as string | undefined;
    expect(['gregorian', undefined]).toContain(endCalendar);
    expect(startDateEditor?.option('calendarOptions.calendar')).toBeUndefined();
  });
});
