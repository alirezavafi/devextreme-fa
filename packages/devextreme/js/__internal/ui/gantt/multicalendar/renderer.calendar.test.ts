/* eslint-disable @typescript-eslint/no-non-null-assertion -- fixtures guarantee presence */
/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';

import { renderTimeline } from './renderer';
import type { ScaleModel } from './scale_model';
import { buildScaleModel } from './scale_model';
import type {
  DependencyLine, DependencyType, GanttTaskInput, TaskRect,
} from './task_layout';
import { layoutDependencies, layoutTasks } from './task_layout';

const tasks: GanttTaskInput[] = [
  {
    id: 'a', start: new Date(2024, 0, 1), end: new Date(2024, 0, 3), progress: 50, title: 'Design',
  },
  {
    id: 'b', parentId: 'a', start: new Date(2024, 0, 5), end: new Date(2024, 0, 6), title: 'Build',
  },
  {
    id: 'm', start: new Date(2024, 0, 6), end: new Date(2024, 0, 6), title: 'Ship',
  },
];

function render(host: HTMLElement, calendar?: 'gregorian' | 'persian', selectedTaskId?: string): void {
  const startDate = calendar === 'persian' ? new Date(2024, 2, 20) : new Date(2024, 0, 1);
  const endDate = calendar === 'persian' ? new Date(2024, 5, 20) : new Date(2024, 0, 11);
  const scale = buildScaleModel({
    startDate,
    endDate,
    scaleType: calendar === 'persian' ? 'months' : 'days',
    calendar,
    cellWidth: 50,
  });
  const rects = layoutTasks(tasks, scale, { order: ['a', 'b', 'm'] });
  const lines = layoutDependencies(
    [{
      id: 'd1', predecessorId: 'a', successorId: 'b', type: 0,
    }],
    rects,
  );
  renderTimeline(host, scale, rects, lines, { selectedTaskId });
}

describe('renderTimeline', () => {
  it('tags the host as the themeable gantt view with a two-tier header', () => {
    const host = document.createElement('div');
    render(host);

    expect(host.classList.contains('dx-gantt-view')).toBe(true);
    expect(host.querySelector('.dx-gantt-header')).not.toBeNull();
    // Two header tiers, each made of scale items with the themed border class.
    const tiers = host.querySelectorAll('.dx-gantt-header > .dx-gantt-tsa');
    expect(tiers).toHaveLength(2);
    expect(host.querySelectorAll('.dx-gantt-si.dx-gantt-vb').length).toBeGreaterThan(0);
  });

  it('renders task bars with progress and title, and a milestone', () => {
    const host = document.createElement('div');
    render(host);

    const wrappers = host.querySelectorAll('.dx-gantt-taskWrapper');
    expect(wrappers).toHaveLength(2); // a and b (m is a milestone)

    const bar = host.querySelector('.dx-gantt-task') as HTMLElement;
    expect(bar).not.toBeNull();
    expect(bar.querySelector('.dx-gantt-tPrg')).not.toBeNull();
    expect((bar.querySelector('.dx-gantt-titleIn') as HTMLElement).textContent).toBe('Design');

    // 'a' is a parent (b.parentId === 'a').
    expect(host.querySelector('.dx-gantt-task.dx-gantt-parent')).not.toBeNull();

    // 'm' is a milestone.
    expect(host.querySelectorAll('.dx-gantt-milestone')).toHaveLength(1);
  });

  it('renders a dependency connector with directional arrow', () => {
    const host = document.createElement('div');
    render(host);

    expect(host.querySelector('.dx-gantt-dependencies')).not.toBeNull();
    expect(host.querySelectorAll('.dx-gantt-conn-h').length).toBeGreaterThan(0);
    expect(host.querySelectorAll('.dx-gantt-conn-v').length).toBeGreaterThan(0);
    expect(host.querySelector('.dx-gantt-arrow.dx-gantt-arrow-right')).not.toBeNull();
  });

  it('renders a selection band for the selected task', () => {
    const host = document.createElement('div');
    render(host, 'gregorian', 'b');
    expect(host.querySelectorAll('.dx-gantt-sel')).toHaveLength(1);
  });

  it('labels header cells in the selected calendar (persian months)', () => {
    const host = document.createElement('div');
    render(host, 'persian');

    const bottomTier = host.querySelectorAll('.dx-gantt-header > .dx-gantt-tsa')[1];
    const labels = Array.from(bottomTier.querySelectorAll('.dx-gantt-si'))
      .map((cell) => cell.textContent);
    // Persian month abbreviations, not Gregorian ones.
    expect(labels).toContain('Far');
    expect(labels).not.toContain('Jan');
  });

  it('clears previous content on re-render (calendar switch)', () => {
    const host = document.createElement('div');
    render(host, 'gregorian');
    const firstHeaderCount = host.querySelectorAll('.dx-gantt-header').length;
    render(host, 'persian');
    expect(host.querySelectorAll('.dx-gantt-header')).toHaveLength(firstHeaderCount);
  });

  it('mirrors task and header geometry horizontally in RTL', () => {
    const scale = buildScaleModel({
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 0, 11),
      scaleType: 'days',
      cellWidth: 50,
    });
    const rects = layoutTasks(tasks, scale, { order: ['a', 'b', 'm'] });
    const lines = layoutDependencies(
      [{
        id: 'd1', predecessorId: 'a', successorId: 'b', type: 0,
      }],
      rects,
    );

    const ltrHost = document.createElement('div');
    renderTimeline(ltrHost, scale, rects, lines, {});
    const rtlHost = document.createElement('div');
    renderTimeline(rtlHost, scale, rects, lines, { rtl: true });

    const aRect = rects.find((r) => r.id === 'a')!;
    const ltrLeft = parseFloat(
      (ltrHost.querySelector('[data-task-id="a"]') as HTMLElement).style.left,
    );
    const rtlLeft = parseFloat(
      (rtlHost.querySelector('[data-task-id="a"]') as HTMLElement).style.left,
    );

    // LTR keeps the laid-out left; RTL mirrors it around the total width.
    expect(ltrLeft).toBeCloseTo(aRect.left, 3);
    expect(rtlLeft).toBeCloseTo(scale.totalWidth - aRect.left - aRect.width, 3);

    // The scroll surface stays LTR so the interaction math is unaffected.
    expect(rtlHost.style.direction).toBe('ltr');
    // The arrowhead flips direction under mirroring.
    expect(ltrHost.querySelector('.dx-gantt-arrow-right')).not.toBeNull();
    expect(rtlHost.querySelector('.dx-gantt-arrow-left')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Bug condition exploration (Task 1) - RTL dependency arrowhead placement.
//
// Property 1 (design.md): for every dependency type the mirrored arrowhead tip
// SHALL land flush on the mirrored connector terminus `totalWidth - to.x`, and
// point into the successor's connected edge (the mirror of the LTR direction).
//
// These tests run against the UNFIXED renderer. The start-edge types FS (0) and
// SS (1) render the tip `ARROW_VISUAL_WIDTH - ARROW_SIZE = 3px` short of the
// terminus, so those two cases are EXPECTED TO FAIL - that failure demonstrates
// the bug. The finish-edge types FF (2) and SF (3) are already flush and pass,
// which confirms the asymmetry the design attributes to the arrow tip living at
// a different box corner per direction. The direction classes are already
// correct pre-fix (the flip is not the bug), so the direction test passes.
// ---------------------------------------------------------------------------

// Visual width of the CSS arrowhead triangle - mirrors the renderer's private
// ARROW_VISUAL_WIDTH so the tip can be derived from the rendered box.
const ARROW_VISUAL_WIDTH = 8;

interface ArrowCounterexample {
  type: DependencyType;
  cellWidth: number;
  days: number;
  successorStartDay: number;
  successorLengthDays: number;
  tipX: number;
  expected: number;
}

// The successor edge the connector enters (LTR `to.x`): FS (0)/SS (1) enter the
// start (left) edge; FF (2)/SF (3) enter the finish (right) edge.
function terminusX(successor: { left: number; width: number }, type: DependencyType): number {
  const isStartEdge = type === 0 || type === 1;
  return isStartEdge ? successor.left : successor.left + successor.width;
}

// Derive the rendered arrowhead tip from the DOM box: a right-pointing arrow's
// tip sits ARROW_VISUAL_WIDTH in from box-left; a left-pointing arrow's tip is
// at box-left.
function readArrowTip(host: HTMLElement): { tipX: number; direction: 'left' | 'right' } {
  const arrow = host.querySelector('.dx-gantt-arrow') as HTMLElement;
  const boxLeft = parseFloat(arrow.style.left);
  const pointsRight = arrow.classList.contains('dx-gantt-arrow-right');
  return {
    tipX: pointsRight ? boxLeft + ARROW_VISUAL_WIDTH : boxLeft,
    direction: pointsRight ? 'right' : 'left',
  };
}

// Deterministic PRNG (Park-Miller minimal standard) so the property check is
// reproducible and any counterexample is stable across runs.
function makeRng(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

// Lay out a predecessor/successor pair and render one dependency of `type` in
// RTL using the shared `days`/`cellWidth: 50` fixture (totalWidth = 500,
// successor `b` at left = 200, width = 50).
function renderDependencyRtl(type: DependencyType): {
  tipX: number;
  direction: 'left' | 'right';
  expected: number;
} {
  const scale = buildScaleModel({
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 11),
    scaleType: 'days',
    cellWidth: 50,
  });
  const rects = layoutTasks(tasks, scale, { order: ['a', 'b', 'm'] });
  const lines = layoutDependencies(
    [{
      id: 'd1', predecessorId: 'a', successorId: 'b', type,
    }],
    rects,
  );
  const host = document.createElement('div');
  renderTimeline(host, scale, rects, lines, { rtl: true });

  const successor = rects.find((r) => r.id === 'b')!;
  const { tipX, direction } = readArrowTip(host);
  return { tipX, direction, expected: scale.totalWidth - terminusX(successor, type) };
}

describe('renderTimeline RTL dependency arrowhead (bug condition exploration)', () => {
  // EXPECTED FAIL on unfixed code: start-edge tip lands 3px short (297 vs 300).
  it('FS (type 0): RTL arrowhead tip is flush with the mirrored successor start edge', () => {
    const { tipX, expected } = renderDependencyRtl(0);
    // totalWidth - successor.left = 500 - 200 = 300; the unfixed renderer draws 297.
    expect(tipX).toBeCloseTo(expected, 3);
  });

  // EXPECTED FAIL on unfixed code: same 3px shortfall as FS.
  it('SS (type 1): RTL arrowhead tip is flush with the mirrored successor start edge', () => {
    const { tipX, expected } = renderDependencyRtl(1);
    expect(tipX).toBeCloseTo(expected, 3);
  });

  // EXPECTED PASS on unfixed code: finish-edge tip is already flush (confirms the asymmetry).
  it('FF (type 2): RTL arrowhead tip is flush with the mirrored successor finish edge', () => {
    const { tipX, expected } = renderDependencyRtl(2);
    // totalWidth - (successor.left + successor.width) = 500 - 250 = 250.
    expect(tipX).toBeCloseTo(expected, 3);
  });

  // EXPECTED PASS on unfixed code: finish-edge tip is already flush (confirms the asymmetry).
  it('SF (type 3): RTL arrowhead tip is flush with the mirrored successor finish edge', () => {
    const { tipX, expected } = renderDependencyRtl(3);
    expect(tipX).toBeCloseTo(expected, 3);
  });

  // EXPECTED PASS on unfixed code: the left<->right flip is already correct - the
  // defect is the tip offset, not the arrow's orientation.
  it('mirrors the arrowhead direction class per dependency type (mirror of LTR)', () => {
    expect(renderDependencyRtl(0).direction).toBe('left'); // FS: LTR right -> RTL left
    expect(renderDependencyRtl(1).direction).toBe('left'); // SS: LTR right -> RTL left
    expect(renderDependencyRtl(2).direction).toBe('right'); // FF: LTR left -> RTL right
    expect(renderDependencyRtl(3).direction).toBe('right'); // SF: LTR left -> RTL right
  });

  // Property 1 (all types consistent). EXPECTED FAIL on unfixed code: the
  // randomized FS/SS cases surface counterexamples where the tip is 3px short.
  it('property: for any dependency type and scale, the RTL tip equals totalWidth - to.x', () => {
    const rng = makeRng(20240115);
    const runs = 150;
    const counterexamples: ArrowCounterexample[] = [];

    for (let i = 0; i < runs; i += 1) {
      const type = Math.floor(rng() * 4) as DependencyType;
      const cellWidth = 20 + Math.floor(rng() * 100); // 20..119
      const days = 8 + Math.floor(rng() * 33); // 8..40
      const successorLengthDays = 1 + Math.floor(rng() * 2); // 1..2
      const maxStart = days - successorLengthDays - 1;
      // Keep the successor strictly interior so `dateToPixel` is exact (no clamp).
      const successorStartDay = 1 + Math.floor(rng() * Math.max(1, maxStart));

      const scale = buildScaleModel({
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 1 + days),
        scaleType: 'days',
        cellWidth,
      });
      const localTasks: GanttTaskInput[] = [
        {
          id: 'p', start: new Date(2024, 0, 1), end: new Date(2024, 0, 2), title: 'P',
        },
        {
          id: 's',
          start: new Date(2024, 0, 1 + successorStartDay),
          end: new Date(2024, 0, 1 + successorStartDay + successorLengthDays),
          title: 'S',
        },
      ];
      const rects = layoutTasks(localTasks, scale, { order: ['p', 's'] });
      const lines = layoutDependencies(
        [{
          id: 'd', predecessorId: 'p', successorId: 's', type,
        }],
        rects,
      );
      const host = document.createElement('div');
      renderTimeline(host, scale, rects, lines, { rtl: true });

      const successor = rects.find((r) => r.id === 's')!;
      const { tipX } = readArrowTip(host);
      const expected = scale.totalWidth - terminusX(successor, type);
      if (Math.abs(tipX - expected) > 1e-6) {
        counterexamples.push({
          type, cellWidth, days, successorStartDay, successorLengthDays, tipX, expected,
        });
      }
    }

    // On the unfixed code the start-edge (FS/SS) cases are 3px short, so this
    // surfaces counterexamples (bug confirmed). After the fix the list is empty.
    expect(counterexamples[0]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Preservation baseline (Task 2) - Property 2 (design.md): all inputs OUTSIDE
// the bug condition must render exactly as before.
//
// Observation-first: these tests capture the behavior of the UNFIXED renderer
// for the whole non-bug input domain - every LTR arrow, RTL finish-edge arrows
// (FF/SF), and all RTL non-arrow geometry (bars, milestones, header tiers,
// connector segments) - plus the pure layout records/dates. They ALL PASS
// pre-fix, pinning the baseline the RTL start-edge fix (Task 3) must preserve.
// Requirements 3.1 (LTR arrows), 3.2 (bar/milestone/header mirroring),
// 3.3 (endpoints/types), 3.4 (connector routing), 3.5 (dates/records).
// ---------------------------------------------------------------------------

const ALL_TYPES: DependencyType[] = [0, 1, 2, 3];
const FINISH_EDGE_TYPES: DependencyType[] = [2, 3];

// Lay out the shared `days`/`cellWidth: 50` fixture (a -> b, totalWidth = 500,
// successor `b` at left = 200, width = 50) with one dependency of `type`.
function layoutFixture(type: DependencyType): {
  scale: ScaleModel;
  rects: TaskRect[];
  lines: DependencyLine[];
} {
  const scale = buildScaleModel({
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 11),
    scaleType: 'days',
    cellWidth: 50,
  });
  const rects = layoutTasks(tasks, scale, { order: ['a', 'b', 'm'] });
  const lines = layoutDependencies(
    [{
      id: 'd1', predecessorId: 'a', successorId: 'b', type,
    }],
    rects,
  );
  return { scale, rects, lines };
}

// Read the arrowhead's box-`left` (not the tip) and direction class from the DOM.
function readArrowBox(host: HTMLElement): { boxLeft: number; direction: 'left' | 'right' } {
  const arrow = host.querySelector('.dx-gantt-arrow') as HTMLElement;
  return {
    boxLeft: parseFloat(arrow.style.left),
    direction: arrow.classList.contains('dx-gantt-arrow-right') ? 'right' : 'left',
  };
}

// Geometry-only projection of a task rect (drops the optional `color`) so the
// captured baseline compares cleanly with `toEqual`.
function taskGeom(rect: TaskRect): Omit<TaskRect, 'color'> {
  const {
    id, rowIndex, left, width, top, height, progressWidth, isMilestone, isParent, title,
  } = rect;
  return {
    id, rowIndex, left, width, top, height, progressWidth, isMilestone, isParent, title,
  };
}

describe('renderTimeline preservation baseline (unfixed code)', () => {
  // Requirement 3.1: LTR arrows are byte-for-byte unchanged. mirrorX is the
  // identity in LTR, so the rendered box-left/direction equal the pure layout.
  it('LTR: every arrow box-left/direction equals the laid-out line.arrow (mirrorX identity)', () => {
    // Observed per-type baseline: FS/SS -> start edge (195, right);
    // FF/SF -> finish edge (250, left).
    const expectedByType: Record<DependencyType, { left: number; direction: 'left' | 'right' }> = {
      0: { left: 195, direction: 'right' },
      1: { left: 195, direction: 'right' },
      2: { left: 250, direction: 'left' },
      3: { left: 250, direction: 'left' },
    };

    ALL_TYPES.forEach((type) => {
      const { scale, rects, lines } = layoutFixture(type);
      const host = document.createElement('div');
      renderTimeline(host, scale, rects, lines, {}); // LTR

      const { boxLeft, direction } = readArrowBox(host);
      // Rendered box-left/direction equal the pure layout (LTR mirrorX identity)...
      expect(boxLeft).toBeCloseTo(lines[0].arrow.left, 3);
      expect(direction).toBe(lines[0].arrow.direction);
      // ...and match the concrete observed baseline.
      expect(boxLeft).toBeCloseTo(expectedByType[type].left, 3);
      expect(direction).toBe(expectedByType[type].direction);
    });
  });

  // Requirements 2.3 / 3.1: RTL finish-edge arrows (FF/SF) are already correct
  // and must not move. Their tip is at box-left, which mirrorX maps flush.
  it('RTL finish-edge (FF, SF): arrowhead stays flush at the mirrored finish edge, pointing right', () => {
    FINISH_EDGE_TYPES.forEach((type) => {
      const { scale, rects, lines } = layoutFixture(type);
      const host = document.createElement('div');
      renderTimeline(host, scale, rects, lines, { rtl: true });

      const { boxLeft, direction } = readArrowBox(host);
      const { tipX } = readArrowTip(host);
      const successor = rects.find((r) => r.id === 'b')!;
      const terminus = scale.totalWidth - terminusX(successor, type);

      // Observed baseline: box-left = mirrorX(250, 8, rtl, 500) = 242; tip flush at 250.
      expect(boxLeft).toBeCloseTo(242, 3);
      expect(direction).toBe('right');
      expect(tipX).toBeCloseTo(terminus, 3);
      expect(tipX).toBeCloseTo(250, 3);
    });
  });

  // Requirements 3.2 / 3.4: RTL mirrors bars, milestones, both header tiers, and
  // connector segments around totalWidth (totalWidth - left - width).
  it('RTL: bars, milestone, both header tiers, and connector segments keep their mirrored positions', () => {
    const { scale, rects, lines } = layoutFixture(0);
    const { totalWidth } = scale;

    const ltrHost = document.createElement('div');
    renderTimeline(ltrHost, scale, rects, lines, {});
    const rtlHost = document.createElement('div');
    renderTimeline(rtlHost, scale, rects, lines, { rtl: true });

    // Task bars (a, b) and the milestone (m) mirror around totalWidth.
    (['a', 'b', 'm'] as const).forEach((id) => {
      const rect = rects.find((r) => r.id === id)!;
      const rtlLeft = parseFloat(
        (rtlHost.querySelector(`[data-task-id="${id}"]`) as HTMLElement).style.left,
      );
      expect(rtlLeft).toBeCloseTo(totalWidth - rect.left - rect.width, 3);
    });

    // Both header tiers: each scale cell mirrors around totalWidth.
    const ltrCells = Array.from(
      ltrHost.querySelectorAll('.dx-gantt-header .dx-gantt-si'),
    );
    const rtlCells = Array.from(
      rtlHost.querySelectorAll('.dx-gantt-header .dx-gantt-si'),
    );
    expect(ltrCells.length).toBeGreaterThan(0);
    expect(rtlCells).toHaveLength(ltrCells.length);
    ltrCells.forEach((ltrCell, i) => {
      const ltrLeft = parseFloat(ltrCell.style.left);
      const width = parseFloat(ltrCell.style.width);
      const rtlLeft = parseFloat(rtlCells[i].style.left);
      expect(rtlLeft).toBeCloseTo(totalWidth - ltrLeft - width, 3);
    });

    // Connector segments mirror around totalWidth (non-arrow geometry). The DOM
    // order matches `line.segments` (segments are appended in order, before the arrow).
    const rtlSegments = Array.from(
      rtlHost.querySelectorAll('.dx-gantt-dependency .dx-gantt-conn-h, .dx-gantt-dependency .dx-gantt-conn-v'),
    );
    expect(rtlSegments).toHaveLength(lines[0].segments.length);
    lines[0].segments.forEach((segment, i) => {
      const rtlLeft = parseFloat(rtlSegments[i].style.left);
      expect(rtlLeft).toBeCloseTo(totalWidth - segment.left - segment.width, 3);
    });
  });

  // Requirements 3.3 / 3.5: the pure layout (dependency records, routed segments,
  // date-derived task rects, stored dates) is produced in task_layout.ts, which
  // the renderer-only fix does not touch. Capture it as an explicit baseline.
  it('records/dates: layoutDependencies output and task rects are unchanged', () => {
    const { rects, lines } = layoutFixture(0);

    // Dependency record: same predecessor/successor/type and routed segments.
    expect(lines).toHaveLength(1);
    expect(lines[0].predecessorId).toBe('a');
    expect(lines[0].successorId).toBe('b');
    expect(lines[0].type).toBe(0);
    expect(lines[0].segments).toEqual([
      {
        left: 100, top: 16.5, width: 10, height: 1,
      },
      {
        left: 110, top: 16.5, width: 80, height: 1,
      },
      {
        left: 189.5, top: 17, width: 1, height: 34,
      },
      {
        left: 190, top: 50.5, width: 10, height: 1,
      },
    ]);
    // The layout-side arrow anchor (pre-render) is unchanged - the fix only
    // affects the rendered `left`, never what routeConnector produces.
    expect(lines[0].arrow).toEqual({ left: 195, top: 46, direction: 'right' });

    // Task rects (date-derived geometry) are unchanged.
    expect(rects.map(taskGeom)).toEqual([
      {
        id: 'a', rowIndex: 0, left: 0, width: 100, top: 6, height: 22, progressWidth: 50, isMilestone: false, isParent: true, title: 'Design',
      },
      {
        id: 'b', rowIndex: 1, left: 200, width: 50, top: 40, height: 22, progressWidth: 0, isMilestone: false, isParent: false, title: 'Build',
      },
      {
        id: 'm', rowIndex: 2, left: 239, width: 22, top: 74, height: 22, progressWidth: 0, isMilestone: true, isParent: false, title: 'Ship',
      },
    ]);

    // Stored task dates are unchanged (this is a display-only defect).
    const byId = (id: string): GanttTaskInput => tasks.find((t) => t.id === id)!;
    expect(byId('a').start).toEqual(new Date(2024, 0, 1));
    expect(byId('a').end).toEqual(new Date(2024, 0, 3));
    expect(byId('b').start).toEqual(new Date(2024, 0, 5));
    expect(byId('b').end).toEqual(new Date(2024, 0, 6));
    expect(byId('m').start).toEqual(new Date(2024, 0, 6));
    expect(byId('m').end).toEqual(new Date(2024, 0, 6));
  });

  // Property 2 (preservation over the non-bug domain). For all generated inputs
  // that are NOT the bug condition - every LTR type, and RTL finish-edge (FF/SF)
  // - the observed invariants hold: LTR box-left/direction equal the pure
  // layout; RTL finish-edge tip is flush at totalWidth - (successor.left+width),
  // pointing right. EXPECTED PASS on unfixed code (these are the baseline).
  it('property: non-bug inputs (all LTR types; RTL finish-edge FF/SF) match their laid-out invariants', () => {
    const rng = makeRng(19730401);
    const runs = 200;
    const counterexamples: {
      rtl: boolean;
      type: DependencyType;
      cellWidth: number;
      days: number;
      observed: number;
      expected: number;
      direction: 'left' | 'right';
      expectedDirection: 'left' | 'right';
    }[] = [];

    for (let i = 0; i < runs; i += 1) {
      // Restrict to the non-bug domain: LTR (any type 0-3) OR RTL finish-edge (2/3).
      const rtl = rng() < 0.5;
      const type = (rtl ? 2 + Math.floor(rng() * 2) : Math.floor(rng() * 4)) as DependencyType;
      const cellWidth = 20 + Math.floor(rng() * 100); // 20..119
      const days = 8 + Math.floor(rng() * 33); // 8..40
      const successorLengthDays = 1 + Math.floor(rng() * 2); // 1..2
      const maxStart = days - successorLengthDays - 1;
      const successorStartDay = 1 + Math.floor(rng() * Math.max(1, maxStart));

      const scale = buildScaleModel({
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 1 + days),
        scaleType: 'days',
        cellWidth,
      });
      const localTasks: GanttTaskInput[] = [
        {
          id: 'p', start: new Date(2024, 0, 1), end: new Date(2024, 0, 2), title: 'P',
        },
        {
          id: 's',
          start: new Date(2024, 0, 1 + successorStartDay),
          end: new Date(2024, 0, 1 + successorStartDay + successorLengthDays),
          title: 'S',
        },
      ];
      const rects = layoutTasks(localTasks, scale, { order: ['p', 's'] });
      const lines = layoutDependencies(
        [{
          id: 'd', predecessorId: 'p', successorId: 's', type,
        }],
        rects,
      );
      const host = document.createElement('div');
      renderTimeline(host, scale, rects, lines, { rtl });

      const successor = rects.find((r) => r.id === 's')!;
      const line = lines[0];

      if (rtl) {
        // RTL finish-edge: tip flush at the mirrored finish edge, pointing right.
        const { tipX, direction } = readArrowTip(host);
        const expected = scale.totalWidth - terminusX(successor, type);
        if (Math.abs(tipX - expected) > 1e-6 || direction !== 'right') {
          counterexamples.push({
            rtl, type, cellWidth, days, observed: tipX, expected, direction, expectedDirection: 'right',
          });
        }
      } else {
        // LTR: box-left/direction equal the pure layout (mirrorX identity, no flip).
        const { boxLeft, direction } = readArrowBox(host);
        if (Math.abs(boxLeft - line.arrow.left) > 1e-6 || direction !== line.arrow.direction) {
          counterexamples.push({
            rtl,
            type,
            cellWidth,
            days,
            observed: boxLeft,
            expected: line.arrow.left,
            direction,
            expectedDirection: line.arrow.direction,
          });
        }
      }
    }

    // Every generated input is outside the bug condition, so the baseline holds.
    expect(counterexamples[0]).toBeUndefined();
  });
});
