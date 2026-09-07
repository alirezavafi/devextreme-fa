import type { CalendarType } from '@ts/core/localization/calendar';
import { formatWeekdayAndDay, getCalendarHeaderFormatter } from '@ts/scheduler/r1/utils/index';

import type { ViewDataProviderOptions } from './view_model/types';
import SchedulerWorkSpaceIndicator from './work_space_indicator';

class SchedulerWorkspaceVertical extends SchedulerWorkSpaceIndicator {
  protected override getFormat(): (date: Date) => string {
    const calendar = this.option('calendar') as CalendarType | undefined;
    return getCalendarHeaderFormatter(calendar) ?? formatWeekdayAndDay;
  }

  generateRenderOptions(): ViewDataProviderOptions {
    const options = super.generateRenderOptions();

    return {
      ...options,
      isGenerateTimePanelData: true,
    };
  }

  protected override isRenderHeaderPanelEmptyCell(): boolean {
    return true;
  }
}

export default SchedulerWorkspaceVertical;
