// A stored Gregorian Date read in one calendar. `month` is zero-based.
export interface DateDescription {
  iso: string;
  year: number;
  month: number;
  day: number;
  monthName: string;
  weekday: number;
  daysInMonth: number;
  isLeapYear: boolean;
}
