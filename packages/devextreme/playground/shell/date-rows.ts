// Inspector rows for one stored date: the Gregorian value it really is, what the
// active calendar shows, and the same day in every offered calendar.
import { CALENDAR_ID_LIST } from './constants/calendar-ids';
import type { CalendarId } from './constants/calendar-ids';
import { describeDate, toIsoDate, toIsoDateTime } from './date-info';
import { formatDate, localDigits, weekdayName } from './format';
import { t } from './i18n';
import type { InspectorRow } from './inspector-row';

export function storedRow(date: Date | null | undefined, withTime = false): InspectorRow {
  if (!date) return { label: t('inspector.stored'), value: t('inspector.none'), tone: 'muted' };
  return {
    label: t('inspector.stored'), value: withTime ? toIsoDateTime(date) : toIsoDate(date), tone: 'accent', ltr: true,
  };
}

export function dateRows(date: Date | null | undefined, calendar: CalendarId, withTime = false): InspectorRow[] {
  if (!date) return [storedRow(date)];
  const info = describeDate(date, calendar);
  return [
    storedRow(date, withTime),
    { label: t('inspector.shown'), value: formatDate(date, calendar, withTime ? 'longdatelongtime' : 'longdate'), tone: 'ok' },
    ...CALENDAR_ID_LIST.map((id): InspectorRow => ({
      label: t(`inspector.${id}`), value: formatDate(date, id, 'shortdate'), tone: id === calendar ? undefined : 'muted',
    })),
    { label: t('inspector.parts'), value: `${localDigits(`${info.year} / ${info.month + 1} / ${info.day}`)} · ${info.monthName}` },
    { label: t('inspector.weekday'), value: weekdayName(date) },
    { label: t('inspector.daysInMonth'), value: localDigits(info.daysInMonth) },
    { label: t('inspector.leapYear'), value: t(info.isLeapYear ? 'inspector.yes' : 'inspector.no') },
  ];
}
