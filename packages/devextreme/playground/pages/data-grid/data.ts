// The task list behind the DataGrid page. Dates are generated around today so
// "this calendar month" always finds rows, whichever calendar is active. Titles
// come from the page's dictionary, so the caller passes a lookup.
import { addDays } from '../../shell/date-info';

export const OwnerIds = ['ali', 'sara', 'reza', 'mina', 'omid'] as const;
export const StatusIds = ['todo', 'doing', 'review', 'done'] as const;
export type OwnerId = typeof OwnerIds[number];
export type StatusId = typeof StatusIds[number];

export interface TaskRow {
  id: number;
  task: string;
  owner: OwnerId;
  status: StatusId;
  start: Date;
  due: Date;
  created: Date;
}

export const TASK_COUNT = 30;

const DAYS_PER_STEP = 3;
const FIRST_OFFSET = -36;
const DONE_BEFORE = -15;
const REVIEW_BEFORE = 0;
const DOING_BEFORE = 20;
const OWNER_STRIDE = 7;
const MIN_DURATION = 2;
const DURATION_SPREAD = 12;
const DURATION_STRIDE = 5;
const CREATED_LEAD_DAYS = 3;
const CREATED_LEAD_SPREAD = 6;
const FIRST_HOUR = 9;
const HOUR_SPREAD = 8;
const MINUTE_STRIDE = 7;
const MINUTES_PER_HOUR = 60;
const JITTER_SPREAD = 4;

function statusFor(offset: number): StatusId {
  if (offset < DONE_BEFORE) return 'done';
  if (offset < REVIEW_BEFORE) return 'review';
  if (offset < DOING_BEFORE) return 'doing';
  return 'todo';
}

// `titleOf` receives the 1-based task number.
export function buildTasks(today: Date, titleOf: (number: number) => string): TaskRow[] {
  return Array.from({ length: TASK_COUNT }, (_, index): TaskRow => {
    const offset = FIRST_OFFSET + index * DAYS_PER_STEP + (index % JITTER_SPREAD);
    const start = addDays(today, offset);
    const created = addDays(start, -(CREATED_LEAD_DAYS + (index % CREATED_LEAD_SPREAD)));
    created.setHours(FIRST_HOUR + (index % HOUR_SPREAD), (index * MINUTE_STRIDE) % MINUTES_PER_HOUR);
    return {
      id: index + 1,
      task: titleOf(index + 1),
      owner: OwnerIds[(index * OWNER_STRIDE) % OwnerIds.length],
      status: statusFor(offset),
      start,
      due: addDays(start, MIN_DURATION + ((index * DURATION_STRIDE) % DURATION_SPREAD)),
      created,
    };
  });
}
