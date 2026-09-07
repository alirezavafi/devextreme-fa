/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';
import { getCalendar } from '@ts/core/localization/calendar';

import { buildScaleModel } from './scale_model';

const tuple = (date: Date): [number, number, number] => [
  date.getFullYear(), date.getMonth(), date.getDate(),
];

describe('buildScaleModel - gregorian', () => {
  it('builds equal-width day cells with day-of-month labels (end-exclusive at midnight)', () => {
    const model = buildScaleModel({
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 0, 5),
      scaleType: 'days',
      cellWidth: 50,
    });

    expect(model.bottomTier.map((cell) => cell.text)).toEqual(['1', '2', '3', '4']);
    expect(model.totalWidth).toBe(200);
    expect(model.bottomTier[0].left).toBe(0);
    expect(model.bottomTier[3].left).toBe(150);
  });

  it('maps dates to pixels and back within a cell', () => {
    const model = buildScaleModel({
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 0, 5),
      scaleType: 'days',
      cellWidth: 50,
    });

    expect(model.dateToPixel(new Date(2024, 0, 1))).toBe(0);
    expect(model.dateToPixel(new Date(2024, 0, 3))).toBe(100);
    expect(tuple(model.pixelToDate(100))).toEqual([2024, 0, 3]);
  });

  it('clamps out-of-range dates to the timeline bounds', () => {
    const model = buildScaleModel({
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 0, 5),
      scaleType: 'days',
      cellWidth: 50,
    });

    expect(model.dateToPixel(new Date(2023, 11, 31))).toBe(0);
    expect(model.dateToPixel(new Date(2024, 1, 1))).toBe(200);
  });

  it('builds month cells aligned to gregorian month starts with a year top tier', () => {
    const model = buildScaleModel({
      startDate: new Date(2024, 0, 15),
      endDate: new Date(2024, 3, 10),
      scaleType: 'months',
      cellWidth: 80,
    });

    expect(model.bottomTier.map((cell) => cell.text)).toEqual(['Jan', 'Feb', 'Mar', 'Apr']);
    expect(tuple(model.bottomTier[0].start)).toEqual([2024, 0, 1]);
    expect(model.topTier).toHaveLength(1);
    expect(model.topTier[0].text).toBe('2024');
    expect(model.topTier[0].width).toBe(320);
  });

  it('groups years into a decade top tier', () => {
    const model = buildScaleModel({
      startDate: new Date(2020, 5, 1),
      endDate: new Date(2024, 5, 1),
      scaleType: 'years',
      cellWidth: 60,
    });

    expect(model.bottomTier.map((cell) => cell.text)).toEqual(['2020', '2021', '2022', '2023', '2024']);
    expect(model.topTier).toHaveLength(1);
    expect(model.topTier[0].text).toBe('2020 - 2029');
  });

  it('applies an injected numeral formatter to labels', () => {
    const model = buildScaleModel({
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 0, 3),
      scaleType: 'days',
      formatNumber: (value) => `#${value}`,
    });

    expect(model.bottomTier.map((cell) => cell.text)).toEqual(['#1', '#2']);
  });
});

describe('buildScaleModel - persian (calendar-aware boundaries)', () => {
  const persian = getCalendar('persian');

  it('aligns month cells to persian month starts, not gregorian ones', () => {
    const startDate = new Date(2024, 2, 20); // Farvardin 1, 1403
    const model = buildScaleModel({
      startDate,
      endDate: new Date(2024, 5, 20),
      scaleType: 'months',
      calendar: 'persian',
      cellWidth: 100,
    });

    // Every cell begins on the first day of a *Persian* month.
    model.bottomTier.forEach((cell) => {
      expect(persian.toParts(cell.start).day).toBe(1);
    });

    // Persian months are consecutive starting from the month containing start.
    const months = model.bottomTier.map((cell) => persian.toParts(cell.start).month);
    expect(months[0]).toBe(persian.toParts(startDate).month);
    for (let i = 0; i < months.length - 1; i += 1) {
      expect((months[i] + 1) % 12).toBe(months[i + 1]);
    }

    // Labels are the abbreviated Persian (transliterated) month names.
    const names = persian.getMonthNames('abbreviated');
    expect(model.bottomTier.map((cell) => cell.text)).toEqual(months.map((m) => names[m]));

    // Proof the boundary is calendar-driven: a Persian month start is not a
    // Gregorian 1st-of-month.
    expect(model.bottomTier[0].start.getDate()).not.toBe(1);

    // Top tier is the Persian year.
    expect(model.topTier).toHaveLength(1);
    expect(model.topTier[0].text).toBe(String(persian.toParts(startDate).year));
  });

  it('labels day cells with persian day numbers and a persian month+year top tier', () => {
    const startDate = new Date(2024, 2, 20);
    const model = buildScaleModel({
      startDate,
      endDate: new Date(2024, 2, 23),
      scaleType: 'days',
      calendar: 'persian',
      cellWidth: 40,
    });

    const startParts = persian.toParts(startDate);
    expect(model.bottomTier.map((cell) => cell.text)).toEqual([
      String(startParts.day),
      String(startParts.day + 1),
      String(startParts.day + 2),
    ]);

    const monthName = persian.getMonthNames('abbreviated')[startParts.month];
    expect(model.topTier[0].text).toBe(`${monthName} ${startParts.year}`);
  });
});
