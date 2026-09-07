/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';

import {
  deriveRange,
  getDefaultColumns,
  mapDependencies,
  mapTasks,
  removeDependencyRow,
  resolveDependencyExprs,
  resolveTaskExprs,
} from './data_adapter';

describe('resolveTaskExprs', () => {
  it('falls back to default field names', () => {
    const exprs = resolveTaskExprs(undefined);
    expect(exprs.keyExpr).toBe('id');
    expect(exprs.parentIdExpr).toBe('parentId');
    expect(exprs.startExpr).toBe('start');
  });

  it('honors custom field names', () => {
    const exprs = resolveTaskExprs({ keyExpr: 'taskId', startExpr: 'from' });
    expect(exprs.keyExpr).toBe('taskId');
    expect(exprs.startExpr).toBe('from');
    expect(exprs.endExpr).toBe('end'); // unspecified -> default
  });
});

describe('mapTasks', () => {
  const exprs = resolveTaskExprs(undefined);

  it('maps rows and coerces dates and progress', () => {
    const rows = [
      {
        id: 1, parentId: null, title: 'A', start: '2024-01-01', end: new Date(2024, 0, 5), progress: '40',
      },
    ];
    const [task] = mapTasks(rows, exprs);

    expect(task.id).toBe(1);
    expect(task.title).toBe('A');
    expect(task.start).toBeInstanceOf(Date);
    expect(task.start.getTime()).toBe(new Date('2024-01-01').getTime());
    expect(task.end).toBeInstanceOf(Date);
    expect(task.progress).toBe(40);
  });

  it('defaults missing parentId to null and empty for no data', () => {
    expect(mapTasks(undefined, exprs)).toEqual([]);
    const [task] = mapTasks([{ id: 2, start: new Date(), end: new Date() }], exprs);
    expect(task.parentId).toBeNull();
  });
});

describe('mapDependencies', () => {
  it('maps with defaults and coerces the type to a number', () => {
    const exprs = resolveDependencyExprs(undefined);
    const [dep] = mapDependencies(
      [{
        id: 'd1', predecessorId: 1, successorId: 2, type: '2',
      }],
      exprs,
    );
    expect(dep.predecessorId).toBe(1);
    expect(dep.successorId).toBe(2);
    expect(dep.type).toBe(2);
  });
});

describe('getDefaultColumns', () => {
  it('builds title/start/end columns with date types', () => {
    const columns = getDefaultColumns(resolveTaskExprs(undefined));
    expect(columns).toHaveLength(3);
    expect(columns[0].dataField).toBe('title');
    expect(columns[1].dataType).toBe('date');
    expect(columns[2].dataType).toBe('date');
  });

  it('leaves date columns unformatted for the Gregorian (or omitted) calendar', () => {
    const omitted = getDefaultColumns(resolveTaskExprs(undefined));
    const gregorian = getDefaultColumns(resolveTaskExprs(undefined), 'gregorian');
    [omitted, gregorian].forEach((columns) => {
      expect(columns[1].format).toBeUndefined();
      expect(columns[1].editorOptions).toBeUndefined();
    });
  });

  it('formats and edits date columns in a non-Gregorian calendar', () => {
    const columns = getDefaultColumns(resolveTaskExprs(undefined), 'persian');
    // The title column stays a plain string column.
    expect(columns[0].format).toBeUndefined();
    // Start + end use the calendar's own pattern (Persian => yyyy/MM/dd) and
    // carry the calendar-aware editor options.
    [columns[1], columns[2]].forEach((col) => {
      expect(col.format).toEqual({ type: 'yyyy/MM/dd', calendar: 'persian' });
      expect(col.editorOptions).toEqual({ calendar: 'persian' });
    });
  });
});

describe('deriveRange', () => {
  it('pads one day around the task extents', () => {
    const tasks = mapTasks(
      [
        { id: 1, start: new Date(2024, 0, 10), end: new Date(2024, 0, 12) },
        { id: 2, start: new Date(2024, 0, 8), end: new Date(2024, 0, 20) },
      ],
      resolveTaskExprs(undefined),
    );
    const range = deriveRange(tasks);
    expect(range.startDate.getTime()).toBe(new Date(2024, 0, 8).getTime() - 24 * 3600 * 1000);
    expect(range.endDate.getTime()).toBe(new Date(2024, 0, 20).getTime() + 24 * 3600 * 1000);
  });

  it('honors explicit overrides', () => {
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 1, 1);
    const range = deriveRange([], { startDate: start, endDate: end });
    expect(range.startDate).toBe(start);
    expect(range.endDate).toBe(end);
  });
});

describe('removeDependencyRow', () => {
  it('removes a row by key and returns it', () => {
    const ds = [{ id: 'a' }, { id: 'b' }];
    const removed = removeDependencyRow(ds, 'id', 'a');
    expect(removed).toEqual({ id: 'a' });
    expect(ds).toHaveLength(1);
    expect(ds[0].id).toBe('b');
  });

  it('returns null when the row is missing or there is no data', () => {
    expect(removeDependencyRow([{ id: 'a' }], 'id', 'z')).toBeNull();
    expect(removeDependencyRow(undefined, 'id', 'a')).toBeNull();
  });
});
