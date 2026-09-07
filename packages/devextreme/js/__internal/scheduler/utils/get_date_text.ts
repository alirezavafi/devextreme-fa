import dateLocalization from '@js/common/core/localization/date';
import dateUtils from '@js/core/utils/date';
import { getGlobalFormatByDataType } from '@ts/core/global_format_config';

import type { ViewType } from '../types';

const formatTooltipDatePart = (date: Date, calendar?: string): string => {
  const globalFormat = getGlobalFormatByDataType('date');
  const useCalendar = !!calendar && calendar !== 'gregorian';

  if (globalFormat) {
    return dateLocalization.format(
      date,
      useCalendar && typeof globalFormat === 'string'
        ? { type: globalFormat, calendar }
        : globalFormat,
    ) as string;
  }

  return String(dateLocalization.format(
    date,
    useCalendar ? { type: 'monthandday', calendar } : 'monthandday',
  ));
};

const formatTooltipTimePart = (date: Date): string => {
  const globalFormat = getGlobalFormatByDataType('time');

  if (globalFormat) {
    return dateLocalization.format(date, globalFormat) as string;
  }

  return String(dateLocalization.format(date, 'shorttime'));
};

export enum DateFormatType {
  DATETIME = 'DATETIME',
  TIME = 'TIME',
  DATE = 'DATE',
}

export const getDateFormatType = (
  startDate: Date,
  endDate: Date,
  isAllDay?: boolean,
  viewType?: ViewType,
): DateFormatType => {
  if (isAllDay) {
    return DateFormatType.DATE;
  }
  if (viewType !== 'month' && dateUtils.sameDate(startDate, endDate)) {
    return DateFormatType.TIME;
  }
  return DateFormatType.DATETIME;
};

export const getDateText = (
  startDate: Date,
  endDate: Date,
  formatType: DateFormatType,
  calendar?: string,
): string => {
  const isSameDate = dateUtils.sameDate(startDate, endDate);

  switch (formatType) {
    case DateFormatType.DATETIME:
      return [
        formatTooltipDatePart(startDate, calendar),
        formatTooltipTimePart(startDate),
        '-',
        !isSameDate && formatTooltipDatePart(endDate, calendar),
        formatTooltipTimePart(endDate),
      ].filter(Boolean).join(' ');
    case DateFormatType.TIME:
      return `${formatTooltipTimePart(startDate)} - ${formatTooltipTimePart(endDate)}`;
    case DateFormatType.DATE:
      return `${formatTooltipDatePart(startDate, calendar)}${isSameDate ? '' : ` - ${formatTooltipDatePart(endDate, calendar)}`}`;
    default:
      return '';
  }
};
