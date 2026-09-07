import dateLocalization from '@js/common/core/localization/date';
import { getGlobalFormatByDataType } from '@ts/core/global_format_config';

const isValidDate = (date: unknown): date is Date => date instanceof Date
  && !Number.isNaN(date.getTime());

export const formatImplicitSchedulerDate = (date: Date): string => {
  if (!isValidDate(date)) {
    return '';
  }
  const globalDateFormat = getGlobalFormatByDataType('date');

  if (globalDateFormat) {
    return dateLocalization.format(date, globalDateFormat) as string;
  }

  return `${dateLocalization.format(date, 'monthAndDay')}, ${dateLocalization.format(date, 'year')}`;
};

export const formatImplicitSchedulerMonth = (date: Date): string => {
  if (!isValidDate(date)) {
    return '';
  }
  const globalDateFormat = getGlobalFormatByDataType('date');

  if (globalDateFormat) {
    return dateLocalization.format(date, globalDateFormat) as string;
  }

  return String(dateLocalization.format(date, 'monthAndYear'));
};

export const formatImplicitSchedulerTime = (date: Date): string => {
  if (!isValidDate(date)) {
    return '';
  }
  const globalTimeFormat = getGlobalFormatByDataType('time');

  return dateLocalization.format(date, globalTimeFormat || 'shorttime') as string;
};
