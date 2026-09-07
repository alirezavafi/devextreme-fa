import {
  afterEach, describe, expect, it,
} from '@jest/globals';
import { locale } from '@ts/core/localization';

import { createScheduler } from './__mock__/create_scheduler';

describe('Scheduler month view with non-en locale', () => {
  afterEach(() => {
    locale('en');
  });

  const expectMonthCellsValid = (container: HTMLElement): void => {
    const cells = container.querySelectorAll('.dx-scheduler-date-table-cell');
    expect(cells.length).toBeGreaterThan(0);

    let cellsWithDigits = 0;
    let nanCells = 0;
    cells.forEach((cell) => {
      const text = cell.textContent?.trim() ?? '';
      // Latin or Persian digits
      if (/[0-9۰-۹]/u.test(text)) cellsWithDigits += 1;
      if (text.includes('NaN') || text.toLowerCase().includes('undefined')) nanCells += 1;
    });

    expect(nanCells).toBe(0);
    expect(cellsWithDigits).toBeGreaterThan(0);
  };

  it('renders day numbers (not NaN/empty) when locale is fa and calendar is gregorian', async () => {
    locale('fa');

    const { container } = await createScheduler({
      currentDate: new Date(2024, 2, 20),
      currentView: 'month',
      views: ['month'],
      height: 400,
      calendar: 'gregorian',
    });

    expectMonthCellsValid(container);
  });

  it('renders day numbers when locale is fa and calendar is persian', async () => {
    locale('fa');

    const { container } = await createScheduler({
      currentDate: new Date(2024, 2, 20),
      currentView: 'month',
      views: ['month'],
      height: 400,
      calendar: 'persian',
    });

    expectMonthCellsValid(container);
  });

  it('renders day-of-week column headers in fa', async () => {
    locale('fa');

    const { container } = await createScheduler({
      currentDate: new Date(2024, 2, 20),
      currentView: 'month',
      views: ['month'],
      height: 400,
      calendar: 'gregorian',
    });

    const headerCells = container.querySelectorAll('.dx-scheduler-header-panel-cell');
    expect(headerCells.length).toBeGreaterThan(0);

    let nonEmptyHeaders = 0;
    headerCells.forEach((cell) => {
      const text = cell.textContent?.trim() ?? '';
      if (text.length > 0 && !text.includes('undefined') && !text.includes('NaN')) {
        nonEmptyHeaders += 1;
      }
    });
    expect(nonEmptyHeaders).toBeGreaterThan(0);
  });
});
