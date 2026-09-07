import dateLocalization from '@js/common/core/localization/date';

const isValidDate = (d: unknown): d is Date => d instanceof Date && !Number.isNaN(d.getTime());

export const formatWeekday = (date: Date): string => {
  if (!isValidDate(date)) return '';
  return dateLocalization.getDayNames('abbreviated')[date.getDay()] ?? '';
};

export const formatWeekdayAndDay = (date: Date): string => {
  if (!isValidDate(date)) return '';
  const weekday = formatWeekday(date);
  const day = dateLocalization.format(date, 'day') ?? '';
  return `${weekday} ${day}`;
};
