// The scheduler page's sample appointments. Every date is relative to today, so
// the page always has something to show. Stored values are Gregorian Dates; the
// monthly report is the one entry anchored to the active calendar's 1st.
import type { CalendarId } from '../../shell/constants/calendar-ids';
import { addDays, calendarMonthRange } from '../../shell/date-info';
import { t } from '../../shell/i18n';

export const Recurrence = {
  monthly: 'FREQ=MONTHLY',
  weekly: 'FREQ=WEEKLY',
  weekdays: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
} as const;

export const SeedKeys = {
  standup: 'standup',
  planning: 'planning',
  workshop: 'workshop',
  holiday: 'holiday',
  weeklySync: 'weeklySync',
  gym: 'gym',
  lunch: 'lunch',
  call: 'call',
  designReview: 'designReview',
  oneOnOne: 'oneOnOne',
  dentist: 'dentist',
  deadline: 'deadline',
  conference: 'conference',
  release: 'release',
  retro: 'retro',
  monthlyReport: 'monthlyReport',
} as const;

export type SeedKey = typeof SeedKeys[keyof typeof SeedKeys];

export interface Appointment {
  seedKey?: SeedKey;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  recurrenceRule?: string;
}

interface SeedSpec {
  key: SeedKey;
  dayOffset: number;
  hour: number;
  minute?: number;
  minutes: number;
  allDay?: boolean;
  recurrenceRule?: string;
}

const MINUTES_PER_HOUR = 60;
const MS_PER_MINUTE = 6e4;
const STANDUP_START_OFFSET = -7;

const SEEDS: readonly SeedSpec[] = [
  {
    key: SeedKeys.standup, dayOffset: STANDUP_START_OFFSET, hour: 9, minute: 30, minutes: 15, recurrenceRule: Recurrence.weekdays,
  },
  {
    key: SeedKeys.planning, dayOffset: -4, hour: 9, minutes: 2 * MINUTES_PER_HOUR,
  },
  {
    key: SeedKeys.workshop, dayOffset: -1, hour: 10, minutes: 3 * MINUTES_PER_HOUR,
  },
  {
    key: SeedKeys.holiday, dayOffset: -6, hour: 0, minutes: 0, allDay: true,
  },
  {
    key: SeedKeys.weeklySync, dayOffset: -2, hour: 15, minutes: 45, recurrenceRule: Recurrence.weekly,
  },
  {
    key: SeedKeys.gym, dayOffset: -3, hour: 18, minutes: MINUTES_PER_HOUR,
  },
  {
    key: SeedKeys.lunch, dayOffset: 0, hour: 12, minute: 30, minutes: MINUTES_PER_HOUR,
  },
  {
    key: SeedKeys.call, dayOffset: 0, hour: 16, minute: 30, minutes: 30,
  },
  {
    key: SeedKeys.designReview, dayOffset: 1, hour: 14, minutes: 90,
  },
  {
    key: SeedKeys.oneOnOne, dayOffset: 2, hour: 11, minutes: 30,
  },
  {
    key: SeedKeys.dentist, dayOffset: 3, hour: 16, minutes: MINUTES_PER_HOUR,
  },
  {
    key: SeedKeys.deadline, dayOffset: 4, hour: 0, minutes: 0, allDay: true,
  },
  {
    key: SeedKeys.conference, dayOffset: 5, hour: 0, minutes: 3 * 24 * MINUTES_PER_HOUR, allDay: true,
  },
  {
    key: SeedKeys.release, dayOffset: 8, hour: 17, minutes: MINUTES_PER_HOUR,
  },
  {
    key: SeedKeys.retro, dayOffset: 10, hour: 13, minutes: 90,
  },
  {
    key: SeedKeys.monthlyReport, dayOffset: 0, hour: 11, minutes: MINUTES_PER_HOUR, recurrenceRule: Recurrence.monthly,
  },
];

const MONTHLY_REPORT_HOUR = 11;

export const today = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const seedText = (key: SeedKey): string => t(`scheduler.seed.${key}`);

// The first day of the active calendar's current month, at the report's hour.
function monthlyStart(calendar: CalendarId): Date {
  const first = calendarMonthRange(today(), calendar)[0];
  first.setHours(MONTHLY_REPORT_HOUR);
  return first;
}

function fromSpec(spec: SeedSpec, calendar: CalendarId): Appointment {
  const start = spec.key === SeedKeys.monthlyReport
    ? monthlyStart(calendar)
    : addDays(today(), spec.dayOffset);
  if (spec.key !== SeedKeys.monthlyReport) start.setHours(spec.hour, spec.minute ?? 0);
  const end = spec.allDay
    ? addDays(start, Math.max(1, spec.minutes / (24 * MINUTES_PER_HOUR)))
    : new Date(start.getTime() + spec.minutes * MS_PER_MINUTE);
  return {
    seedKey: spec.key,
    text: seedText(spec.key),
    startDate: start,
    endDate: end,
    allDay: spec.allDay,
    recurrenceRule: spec.recurrenceRule,
  };
}

export const seedAppointments = (calendar: CalendarId): Appointment[] => SEEDS.map((spec) => fromSpec(spec, calendar));

// After a language or calendar change: relabel the sample appointments and move
// the monthly report to the new calendar's 1st. Appointments the user renamed keep
// their text.
export function refreshSeeds(appointments: Appointment[], calendar: CalendarId, previousText: Map<SeedKey, string>): void {
  appointments.forEach((appointment) => {
    const { seedKey } = appointment;
    if (!seedKey) return;
    if (previousText.get(seedKey) === appointment.text) appointment.text = seedText(seedKey);
    if (seedKey === SeedKeys.monthlyReport) {
      const start = monthlyStart(calendar);
      const duration = appointment.endDate.getTime() - appointment.startDate.getTime();
      appointment.startDate = start;
      appointment.endDate = new Date(start.getTime() + duration);
    }
  });
}

// The text each sample appointment shows in the current language.
export const seedTexts = (): Map<SeedKey, string> => new Map(
  (Object.values(SeedKeys) as SeedKey[]).map((key) => [key, seedText(key)]),
);
