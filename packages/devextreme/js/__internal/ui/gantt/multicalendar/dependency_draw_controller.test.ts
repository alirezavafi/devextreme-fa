/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';

import type { NewDependency } from './dependency_draw';
import { DependencyDrawController } from './dependency_draw_controller';
import { renderTimeline } from './renderer';
import { buildScaleModel } from './scale_model';
import type { GanttTaskInput } from './task_layout';
import { layoutTasks } from './task_layout';

function mouse(type: string, clientX: number, clientY: number, target?: EventTarget): MouseEvent {
  const e = new MouseEvent(type, {
    clientX, clientY, button: 0, bubbles: true,
  });
  if (target) {
    Object.defineProperty(e, 'target', { value: target, enumerable: true });
  }
  return e;
}

function setup() {
  const scale = buildScaleModel({
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 21),
    scaleType: 'days',
    cellWidth: 30,
  });
  const tasks: GanttTaskInput[] = [
    { id: 'a', start: new Date(2024, 0, 2), end: new Date(2024, 0, 5) },
    { id: 'b', start: new Date(2024, 0, 10), end: new Date(2024, 0, 14) },
  ];
  const rects = layoutTasks(tasks, scale, { order: ['a', 'b'] });

  const host = document.createElement('div');
  document.body.appendChild(host);
  renderTimeline(host, scale, rects, []);

  let created: NewDependency | null = null;
  const controller = new DependencyDrawController(
    host,
    () => ({ rects, dependencies: [] }),
    (dep) => { created = dep; },
  );
  controller.enable();

  return {
    host,
    rects,
    getCreated: (): NewDependency | null => created,
    teardown: (): void => { controller.dispose(); document.body.removeChild(host); },
  };
}

describe('DependencyDrawController', () => {
  it('creates a finish-to-start dependency by dragging from a finish handle to a target start', () => {
    const ctx = setup();
    const handle = ctx.host.querySelector(
      '[data-task-id="a"][data-dep-handle="finish"]',
    ) as HTMLElement;
    const b = ctx.rects[1];

    handle.dispatchEvent(mouse('mousedown', 0, 0, handle));
    document.dispatchEvent(mouse('mousemove', b.left + 2, b.top + 5));
    document.dispatchEvent(mouse('mouseup', b.left + 2, b.top + 5)); // near b's start

    expect(ctx.getCreated()).toEqual({ predecessorId: 'a', successorId: 'b', type: 0 });
    ctx.teardown();
  });

  it('does not create a link when released over empty space', () => {
    const ctx = setup();
    const handle = ctx.host.querySelector(
      '[data-task-id="a"][data-dep-handle="start"]',
    ) as HTMLElement;

    handle.dispatchEvent(mouse('mousedown', 0, 0, handle));
    document.dispatchEvent(mouse('mousemove', 1000, 1000));
    document.dispatchEvent(mouse('mouseup', 1000, 1000));

    expect(ctx.getCreated()).toBeNull();
    ctx.teardown();
  });
});
