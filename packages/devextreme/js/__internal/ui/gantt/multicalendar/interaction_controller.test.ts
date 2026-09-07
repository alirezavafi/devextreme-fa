/* eslint-disable @typescript-eslint/no-non-null-assertion -- fixtures guarantee presence */
/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';

import type { DraggableTask, DragResult } from './interaction';
import { InteractionController } from './interaction_controller';
import { renderTimeline } from './renderer';
import { buildScaleModel } from './scale_model';
import { layoutTasks } from './task_layout';

const tuple = (date: Date): [number, number, number] => [
  date.getFullYear(), date.getMonth(), date.getDate(),
];

function mouse(type: string, clientX: number): MouseEvent {
  return new MouseEvent(type, { clientX, button: 0, bubbles: true });
}

function setup(options = {}, rtl = false) {
  const scale = buildScaleModel({
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 11),
    scaleType: 'days',
    cellWidth: 50,
  });
  const tasks: DraggableTask[] = [{ id: 'a', start: new Date(2024, 0, 3), end: new Date(2024, 0, 5) }];
  const rects = layoutTasks(
    tasks.map((t) => ({ ...t })),
    scale,
    { order: ['a'] },
  );

  const host = document.createElement('div');
  document.body.appendChild(host);
  renderTimeline(host, scale, rects, [], { rtl });

  let committed: DragResult | null = null;
  const controller = new InteractionController(
    host,
    () => ({
      scale, rects, tasks, rtl,
    }),
    (result) => { committed = result; },
    options,
  );
  controller.enable();

  return {
    host,
    controller,
    scale,
    rects,
    getCommitted: (): DragResult | null => committed,
    teardown: (): void => { controller.dispose(); document.body.removeChild(host); },
  };
}

describe('InteractionController', () => {
  it('commits a move gesture as snapped dates preserving duration', () => {
    const ctx = setup();
    const wrapper = ctx.host.querySelector('[data-task-id="a"]') as HTMLElement;
    const rect = ctx.rects[0];

    wrapper.dispatchEvent(mouse('mousedown', rect.left + 50)); // body -> move
    document.dispatchEvent(mouse('mousemove', rect.left + 50 + 100)); // +2 day-cells
    document.dispatchEvent(mouse('mouseup', rect.left + 50 + 100));

    const committed = ctx.getCommitted()!;
    expect(committed).not.toBeNull();
    expect(tuple(committed.start)).toEqual([2024, 0, 5]);
    expect(tuple(committed.end)).toEqual([2024, 0, 7]);
    ctx.teardown();
  });

  it('commits a resize of the end edge only', () => {
    const ctx = setup();
    const wrapper = ctx.host.querySelector('[data-task-id="a"]') as HTMLElement;
    const rect = ctx.rects[0];

    wrapper.dispatchEvent(mouse('mousedown', rect.left + rect.width - 2)); // right edge
    document.dispatchEvent(mouse('mousemove', rect.left + rect.width - 2 + 50));
    document.dispatchEvent(mouse('mouseup', rect.left + rect.width - 2 + 50));

    const committed = ctx.getCommitted()!;
    expect(tuple(committed.start)).toEqual([2024, 0, 3]); // unchanged
    expect(tuple(committed.end)).toEqual([2024, 0, 6]);
    ctx.teardown();
  });

  it('does not start a resize when resizing is disallowed', () => {
    const ctx = setup({ allowResize: false });
    const wrapper = ctx.host.querySelector('[data-task-id="a"]') as HTMLElement;
    const rect = ctx.rects[0];

    wrapper.dispatchEvent(mouse('mousedown', rect.left + 1)); // start edge
    document.dispatchEvent(mouse('mousemove', rect.left + 1 + 50));
    document.dispatchEvent(mouse('mouseup', rect.left + 1 + 50));

    expect(ctx.getCommitted()).toBeNull();
    ctx.teardown();
  });

  it('uses an explicit resize grip to force end-resize regardless of grab position', () => {
    const ctx = setup();
    const grip = ctx.host.querySelector('[data-resize-edge="end"]') as HTMLElement;
    expect(grip).not.toBeNull();
    const rect = ctx.rects[0];

    // Grab the grip but report a clientX in the bar BODY (where edge detection
    // would resolve to "move") to prove the grip overrides the resolved mode.
    const mid = rect.left + rect.width / 2;
    grip.dispatchEvent(mouse('mousedown', mid));
    document.dispatchEvent(mouse('mousemove', mid + 100));
    document.dispatchEvent(mouse('mouseup', mid + 100));

    const committed = ctx.getCommitted()!;
    expect(tuple(committed.start)).toEqual([2024, 0, 3]); // unchanged -> it was a resize
    expect(tuple(committed.end)).toEqual([2024, 0, 7]); // +2 day-cells
    ctx.teardown();
  });

  it('mirrors pointer coordinates so a move commits correctly in RTL', () => {
    const ctx = setup({}, true);
    const wrapper = ctx.host.querySelector('[data-task-id="a"]') as HTMLElement;
    const rect = ctx.rects[0];
    const { totalWidth } = ctx.scale;

    // The body center in LTR content space is rect.left + 50; in RTL the visual
    // clientX that maps to it is mirrored around totalWidth.
    const downVisual = totalWidth - (rect.left + 50);
    // Dragging the bar visually LEFT (smaller clientX) moves it LATER in time,
    // equivalent to a +100px LTR delta (two day-cells).
    const moveVisual = downVisual - 100;

    wrapper.dispatchEvent(mouse('mousedown', downVisual));
    document.dispatchEvent(mouse('mousemove', moveVisual));
    document.dispatchEvent(mouse('mouseup', moveVisual));

    const committed = ctx.getCommitted()!;
    expect(committed).not.toBeNull();
    expect(tuple(committed.start)).toEqual([2024, 0, 5]);
    expect(tuple(committed.end)).toEqual([2024, 0, 7]);
    ctx.teardown();
  });
});
