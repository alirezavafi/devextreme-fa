// Display formatting in the active locale and a chosen calendar. The format
// object's `calendar` field is what the fork's localization layer reads.
import dateLocalization from '../../js/common/core/localization/date';
import numberLocalization from '../../js/common/core/localization/number';
import type { CalendarId } from './constants/calendar-ids';

// Locale digits (Persian digits under `fa`) without grouping, so years stay 1405.
export const localDigits = (value: string | number): string => numberLocalization
  .convertDigits(String(value)) as string;

export const formatDate = (date: Date, calendar: CalendarId, type = 'longdate'): string => dateLocalization
  .format(date, { type, calendar } as never) as string;

// The .d.ts types the argument as Format; the implementation takes a name width.
export const weekdayName = (date: Date): string => dateLocalization.getDayNames('wide' as never)[date.getDay()];
