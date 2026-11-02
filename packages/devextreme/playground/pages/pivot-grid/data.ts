// Two years of sales for the PivotGrid page: two sales a month in each region.
// Every date is a Gregorian Date; the page rolls them up by calendar period.
export const RegionIds = ['north', 'south', 'east', 'west'] as const;
export type RegionId = typeof RegionIds[number];

export interface SaleRow {
  date: Date;
  region: RegionId;
  amount: number;
}

export const FIRST_YEAR = 2025;
export const YEAR_COUNT = 2;

const MONTHS_PER_YEAR = 12;
const SALE_DAYS = [6, 21] as const;
const BASE_AMOUNT = 1200;
const AMOUNT_STEP = 25;
const AMOUNT_SPREAD = 60;
const MONTH_FACTOR = 37;
const REGION_FACTOR = 53;
const DAY_FACTOR = 11;
// Regions sell more in the second half of the year.
const SECOND_HALF_BONUS = 400;

export function buildSales(): SaleRow[] {
  const sales: SaleRow[] = [];
  for (let month = 0; month < YEAR_COUNT * MONTHS_PER_YEAR; month += 1) {
    RegionIds.forEach((region, regionIndex) => {
      SALE_DAYS.forEach((day) => {
        const noise = (month * MONTH_FACTOR + regionIndex * REGION_FACTOR + day * DAY_FACTOR) % AMOUNT_SPREAD;
        const bonus = month % MONTHS_PER_YEAR >= MONTHS_PER_YEAR / 2 ? SECOND_HALF_BONUS : 0;
        sales.push({
          date: new Date(FIRST_YEAR, month, day),
          region,
          amount: BASE_AMOUNT + noise * AMOUNT_STEP + bonus + regionIndex * AMOUNT_STEP * 4,
        });
      });
    });
  }
  return sales;
}
