import dateLocalization from '@js/common/core/localization/date';
import numberLocalization from '@js/common/core/localization/number';
import dateUtils from '@js/core/utils/date';
import { getCalendar, getCalendarMonthNamesInActiveLocale } from '@ts/core/localization/calendar';

import type { CalculateCellIndex } from '../../types';
import {
  getCalculatedFirstDayOfWeek,
  isDateInRange,
  isFirstCellInMonthWithIntervalCount,
  setOptionHour,
} from './base';

const isCustomCalendar = (calendar?: string): boolean => !!calendar && calendar !== 'gregorian';

export const calculateCellIndex: CalculateCellIndex = (
  rowIndex,
  columnIndex,
  _,
  columnCount,
) => rowIndex * columnCount + columnIndex;

export const getViewStartByOptions = (
  startDate: Date | undefined,
  currentDate: Date,
  intervalCount: number,
  startViewDate?: Date,
): Date => {
  if (!startDate || !startViewDate) {
    return new Date(currentDate);
  }
  let currentStartDate = new Date(startViewDate);
  const validStartViewDate = new Date(startViewDate);

  const diff = currentStartDate.getTime() <= currentDate.getTime() ? 1 : -1;
  let endDate = new Date(new Date(
    validStartViewDate.setMonth(validStartViewDate.getMonth() + diff * intervalCount),
  ));

  while (!isDateInRange(currentDate, currentStartDate, endDate, diff)) {
    currentStartDate = new Date(endDate);

    if (diff > 0) {
      currentStartDate.setDate(1);
    }

    endDate = new Date(new Date(endDate.setMonth(endDate.getMonth() + diff * intervalCount)));
  }

  return diff > 0 ? currentStartDate : endDate;
};

export const getCellText = (date: Date, intervalCount: number, calendar?: string): string => {
  // Guard against invalid Date objects (e.g. from transient view rebuilds) so
  // the cell renders blank instead of "NaN".
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  if (isCustomCalendar(calendar)) {
    const parts = getCalendar(calendar as string).toParts(date);
    const day = numberLocalization.convertDigits(String(parts.day)) as string;

    if (parts.day === 1) {
      const monthName = getCalendarMonthNamesInActiveLocale(calendar as string, 'abbreviated')[parts.month];
      return [monthName, day].join(' ');
    }

    return numberLocalization.convertDigits(String(parts.day).padStart(2, '0')) as string;
  }

  if (isFirstCellInMonthWithIntervalCount(date, intervalCount)) {
    const monthName = dateLocalization.getMonthNames('abbreviated')[date.getMonth()];
    return [monthName, dateLocalization.format(date, 'day')].join(' ');
  }

  return dateLocalization.format(date, 'dd') as string;
};

export const calculateStartViewDate = (
  currentDate: Date,
  startDayHour: number,
  startDate: Date | undefined,
  intervalCount: number,
  firstDayOfWeekOption: number | undefined,
): Date => {
  const viewStart = getViewStartByOptions(
    startDate,
    currentDate,
    intervalCount,
    dateUtils.getFirstMonthDate(startDate) as Date,
  );
  const firstMonthDate = dateUtils.getFirstMonthDate(viewStart);
  const firstDayOfWeek = getCalculatedFirstDayOfWeek(firstDayOfWeekOption);

  const firstViewDate = dateUtils.getFirstWeekDate(firstMonthDate, firstDayOfWeek);

  return setOptionHour(firstViewDate, startDayHour);
};
