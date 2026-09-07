/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';

import GanttMultiCalendar from './widget';

const dataSource = [
  {
    id: 1, parentId: null, title: 'Phase 1', start: new Date(2024, 2, 20), end: new Date(2024, 3, 20), progress: 40,
  },
  {
    id: 2, parentId: 1, title: 'Task A', start: new Date(2024, 2, 25), end: new Date(2024, 3, 10), progress: 60,
  },
];

describe('dxGanttMultiCalendar widget', () => {
  it('mounts a tree list + calendar-aware timeline and exposes the scale model', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (GanttMultiCalendar as any)(element, {
      tasks: { dataSource },
      scaleType: 'months',
      calendar: 'persian',
    });

    expect(element.classList.contains('dx-gantt')).toBe(true);
    expect(element.classList.contains('dx-gantt-mc')).toBe(true);
    expect(element.querySelector('.dx-gantt-treelist-wrapper')).not.toBeNull();
    expect(element.querySelector('.dx-gantt-view .dx-gantt-header')).not.toBeNull();
    expect(instance.getScaleModel()?.calendar).toBe('persian');

    instance.dispose();
    document.body.removeChild(element);
  });

  it('writes a committed drag back to the data source and raises onTaskUpdated', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const localData = [
      {
        id: 1, parentId: null, title: 'Phase 1', start: new Date(2024, 2, 20), end: new Date(2024, 3, 20), progress: 40,
      },
    ];
    const updates: { key: unknown }[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (GanttMultiCalendar as any)(element, {
      tasks: { dataSource: localData },
      scaleType: 'months',
      calendar: 'persian',
      editing: { enabled: true },
      onTaskUpdated: (e: { key: unknown }): void => { updates.push(e); },
    });

    const newStart = new Date(2024, 4, 1);
    const newEnd = new Date(2024, 5, 1);
    instance._onTaskCommitted({ id: 1, start: newStart, end: newEnd });

    expect(localData[0].start).toBe(newStart);
    expect(localData[0].end).toBe(newEnd);
    expect(updates).toHaveLength(1);
    expect(updates[0].key).toBe(1);

    instance.dispose();
    document.body.removeChild(element);
  });

  it('commits a real pointer drag from the rendered bar (regression: field-init clobber)', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const localData = [
      {
        id: 1, parentId: null, title: 'A', start: new Date(2024, 0, 3), end: new Date(2024, 0, 5), progress: 0,
      },
    ];
    const updates: { key: unknown }[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (GanttMultiCalendar as any)(element, {
      tasks: { dataSource: localData },
      scaleType: 'days',
      cellWidth: 50,
      editing: { enabled: true },
      onTaskUpdated: (e: { key: unknown }): void => { updates.push(e); },
    });

    // Render state produced inside super()'s render must survive construction.
    // (The bug was class-field initializers resetting these to [] after super,
    // leaving the interaction controller's getContext() empty.)
    expect(instance._rects.length).toBe(1);
    expect(instance._tasks.length).toBe(1);

    const rect = instance._rects[0];
    const wrapper = element.querySelector('[data-task-id="1"]') as HTMLElement;
    expect(wrapper).not.toBeNull();

    // Grab the bar body and drag it two day-cells (100px) later.
    const bodyX = rect.left + 25;
    wrapper.dispatchEvent(new MouseEvent('mousedown', { clientX: bodyX, button: 0, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: bodyX + 100, button: 0, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: bodyX + 100, button: 0, bubbles: true }));

    expect(updates.length).toBeGreaterThanOrEqual(1);
    expect(localData[0].start.getTime()).toBe(new Date(2024, 0, 5).getTime());
    expect(localData[0].end.getTime()).toBe(new Date(2024, 0, 7).getTime());

    instance.dispose();
    document.body.removeChild(element);
  });

  it('commits a tree-list date edit back to the task and cascades successors', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const localData = [
      {
        id: 1, title: 'A', start: new Date(2024, 0, 1), end: new Date(2024, 0, 3),
      },
      {
        id: 2, title: 'B', start: new Date(2024, 0, 3), end: new Date(2024, 0, 5),
      },
    ];
    const updates: { key: unknown }[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (GanttMultiCalendar as any)(element, {
      tasks: { dataSource: localData },
      dependencies: {
        dataSource: [{
          id: 'd', predecessorId: 1, successorId: 2, type: 0,
        }],
      },
      scaleType: 'days',
      editing: { enabled: true, autoUpdateSuccessors: true },
      onTaskUpdated: (e: { key: unknown }): void => { updates.push(e); },
    });

    // Simulate the dxTreeList committing an edit that pushed A's finish to Jan 5.
    localData[0].end = new Date(2024, 0, 5);
    instance._onTreeListRowUpdated({ key: 1, data: localData[0] });

    // The FS successor B is pushed to start at A's new finish, keeping its length.
    expect(localData[1].start.getTime()).toBe(new Date(2024, 0, 5).getTime());
    expect(localData[1].end.getTime()).toBe(new Date(2024, 0, 7).getTime());
    expect(updates.length).toBeGreaterThanOrEqual(1);

    instance.dispose();
    document.body.removeChild(element);
  });

  it('auto-schedules a finish-to-start successor when its predecessor is moved', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const localData = [
      {
        id: 1, title: 'A', start: new Date(2024, 0, 1), end: new Date(2024, 0, 3),
      },
      {
        id: 2, title: 'B', start: new Date(2024, 0, 3), end: new Date(2024, 0, 5),
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (GanttMultiCalendar as any)(element, {
      tasks: { dataSource: localData },
      dependencies: {
        dataSource: [{
          id: 'd', predecessorId: 1, successorId: 2, type: 0,
        }],
      },
      scaleType: 'days',
      editing: { enabled: true, autoUpdateSuccessors: true },
    });

    // Move A later so it overruns B's start.
    instance._onTaskCommitted({ id: 1, start: new Date(2024, 0, 2), end: new Date(2024, 0, 5) });

    // B (the successor) is pushed to start at A's new end, keeping its duration.
    expect(localData[1].start.getTime()).toBe(new Date(2024, 0, 5).getTime());
    expect(localData[1].end.getTime()).toBe(new Date(2024, 0, 7).getTime());

    instance.dispose();
    document.body.removeChild(element);
  });

  it('inserts a drawn dependency into the data source and cascades the successor', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const taskData = [
      {
        id: 1, title: 'A', start: new Date(2024, 0, 1), end: new Date(2024, 0, 6),
      },
      {
        id: 2, title: 'B', start: new Date(2024, 0, 2), end: new Date(2024, 0, 4),
      },
    ];
    const depData: Record<string, unknown>[] = [];
    const inserted: { predecessorId: unknown; successorId: unknown }[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (GanttMultiCalendar as any)(element, {
      tasks: { dataSource: taskData },
      dependencies: { dataSource: depData },
      scaleType: 'days',
      editing: { enabled: true, allowDependencyAdding: true, autoUpdateSuccessors: true },
      onDependencyInserted: (e: { predecessorId: unknown; successorId: unknown }): void => {
        inserted.push(e);
      },
    });

    // Draw a finish-to-start link A -> B.
    instance._onDependencyCreated({ predecessorId: 1, successorId: 2, type: 0 });

    expect(depData).toHaveLength(1);
    expect(depData[0].predecessorId).toBe(1);
    expect(depData[0].successorId).toBe(2);
    expect(inserted).toHaveLength(1);
    // B must now start no earlier than A's finish (Jan 6), keeping 2-day length.
    expect(taskData[1].start.getTime()).toBe(new Date(2024, 0, 6).getTime());
    expect(taskData[1].end.getTime()).toBe(new Date(2024, 0, 8).getTime());

    instance.dispose();
    document.body.removeChild(element);
  });

  it('deletes a dependency on connector click and raises onDependencyDeleted', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const depData = [{
      id: 'd1', predecessorId: 1, successorId: 2, type: 0,
    }];
    const deleted: { key: unknown }[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (GanttMultiCalendar as any)(element, {
      tasks: {
        dataSource: [
          {
            id: 1, title: 'A', start: new Date(2024, 0, 1), end: new Date(2024, 0, 3),
          },
          {
            id: 2, title: 'B', start: new Date(2024, 0, 5), end: new Date(2024, 0, 7),
          },
        ],
      },
      dependencies: { dataSource: depData },
      scaleType: 'days',
      editing: { enabled: true, allowDependencyDeleting: true },
      onDependencyDeleted: (e: { key: unknown }): void => { deleted.push(e); },
    });

    instance._onDependencyDeleteRequested('d1');

    expect(depData).toHaveLength(0);
    expect(deleted).toHaveLength(1);
    expect(deleted[0].key).toBe('d1');

    instance.dispose();
    document.body.removeChild(element);
  });

  it('respects a cancelled onDependencyDeleting event', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const depData = [{
      id: 'd1', predecessorId: 1, successorId: 2, type: 0,
    }];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (GanttMultiCalendar as any)(element, {
      tasks: {
        dataSource: [
          {
            id: 1, title: 'A', start: new Date(2024, 0, 1), end: new Date(2024, 0, 3),
          },
          {
            id: 2, title: 'B', start: new Date(2024, 0, 5), end: new Date(2024, 0, 7),
          },
        ],
      },
      dependencies: { dataSource: depData },
      scaleType: 'days',
      onDependencyDeleting: (e: { cancel: boolean }): void => { e.cancel = true; },
    });

    instance._onDependencyDeleteRequested('d1');

    expect(depData).toHaveLength(1); // not removed

    instance.dispose();
    document.body.removeChild(element);
  });
});
