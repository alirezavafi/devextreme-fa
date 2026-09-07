/**
 * @docid
 * @namespace DevExpress.localization
 * @public
 */
export type CalendarType = 'gregorian' | 'persian' | 'hijri' | string;

/**
 * @docid
 * @public
 */
export type CalendarMonthNameFormat = 'wide' | 'abbreviated' | 'narrow';

/**
 * @docid
 * @public
 */
export interface CalendarDateParts {
  /** Calendar year. */
  year: number;
  /** Zero-based month index. */
  month: number;
  /** One-based day of month. */
  day: number;
}

/**
 * @docid
 * @public
 */
export interface CalendarSystem {
  readonly type: CalendarType;
  readonly firstDayOfWeek?: number;
  readonly defaultDateFormat?: string;
  toParts: (date: Date) => CalendarDateParts;
  fromParts: (parts: CalendarDateParts) => Date;
  getDaysInMonth: (year: number, month: number) => number;
  getMonthsInYear: (year: number) => number;
  isLeapYear: (year: number) => boolean;
  getMonthNames: (format?: CalendarMonthNameFormat) => string[];
}

/**
 * @docid
 * @publicName registerCalendar(calendar)
 * @public
 */
export function registerCalendar(calendar: CalendarSystem): void;

/**
 * @docid
 * @publicName getCalendar(type)
 * @public
 */
export function getCalendar(type?: CalendarType): CalendarSystem;

/**
 * @docid
 * @publicName getCalendarFirstDayOfWeek(type)
 * @public
 */
export function getCalendarFirstDayOfWeek(type?: CalendarType): number | undefined;

/**
 * @docid
 * @publicName getCalendarDefaultDateFormat(type)
 * @public
 */
export function getCalendarDefaultDateFormat(type?: CalendarType): string | undefined;

/**
 * @docid
 * @publicName getCalendarMonthNamesInActiveLocale(type, format)
 * @public
 */
export function getCalendarMonthNamesInActiveLocale(
  type?: CalendarType,
  format?: CalendarMonthNameFormat,
): string[];

/**
 * @docid
 * @publicName isCalendarRegistered(type)
 * @public
 */
export function isCalendarRegistered(type: CalendarType): boolean;

/**
 * @docid
 * @publicName getRegisteredCalendarTypes()
 * @public
 */
export function getRegisteredCalendarTypes(): CalendarType[];
