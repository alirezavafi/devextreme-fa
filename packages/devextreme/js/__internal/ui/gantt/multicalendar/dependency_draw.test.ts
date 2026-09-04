/* eslint-disable spellcheck/spell-checker */
import { describe, expect, it } from '@jest/globals';

import {
  buildDependency,
  canCreateDependency,
  hitTestTask,
  nearestEdge,
  resolveDependencyType,
} from './dependency_draw';
import type { GanttDependencyInput, TaskRect } from './task_layout';

const rect = (id: string | number, left: number, top: number): TaskRect => ({
  id, rowIndex: top / 34, left, width: 80, top, height: 22, progressWidth: 0, isMilestone: false, isParent: false, title: '',
});

describe('resolveDependencyType', () => {
  it('maps edge pairs to FS/SS/FF/SF', () => {
    expect(resolveDependencyType('finish', 'start')).toBe(0);
    expect(resolveDependencyType('start', 'start')).toBe(1);
    expect(resolveDependencyType('finish', 'finish')).toBe(2);
    expect(resolveDependencyType('start', 'finish')).toBe(3);
  });
});

describe('hitTestTask', () => {
  const rects = [rect('a', 0, 0), rect('b', 100, 34)];

  it('finds the task under a point', () => {
    expect(hitTestTask(rects, 120, 40)?.id).toBe('b');
    expect(hitTestTask(rects, 40, 10)?.id).toBe('a');
  });

  it('returns null when no task is under the point', () => {
    expect(hitTestTask(rects, 300, 200)).toBeNull();
  });
});

describe('nearestEdge', () => {
  it('detects the closer edge', () => {
    const r = rect('a', 100, 0); // [100, 180], mid 140
    expect(nearestEdge(r, 110)).toBe('start');
    expect(nearestEdge(r, 170)).toBe('finish');
  });
});

describe('canCreateDependency', () => {
  const existing: GanttDependencyInput[] = [{
    id: 'd', predecessorId: 'a', successorId: 'b', type: 0,
  }];

  it('rejects self-links, duplicates and reverse 2-cycles', () => {
    expect(canCreateDependency('a', 'a', existing)).toBe(false);
    expect(canCreateDependency('a', 'b', existing)).toBe(false); // duplicate
    expect(canCreateDependency('b', 'a', existing)).toBe(false); // reverse cycle
  });

  it('accepts a new valid link', () => {
    expect(canCreateDependency('a', 'c', existing)).toBe(true);
  });
});

describe('buildDependency', () => {
  it('creates a finish-to-start link when dropping near the target start', () => {
    const target = rect('b', 100, 34); // [100,180], mid 140
    const dep = buildDependency('a', 'finish', target, 110, []);
    expect(dep).toEqual({ predecessorId: 'a', successorId: 'b', type: 0 });
  });

  it('creates a start-to-finish link when dropping near the target finish', () => {
    const target = rect('b', 100, 34);
    const dep = buildDependency('a', 'start', target, 170, []);
    expect(dep).toEqual({ predecessorId: 'a', successorId: 'b', type: 3 });
  });

  it('returns null for an invalid link', () => {
    const target = rect('a', 0, 0);
    expect(buildDependency('a', 'finish', target, 10, [])).toBeNull(); // self
  });
});
