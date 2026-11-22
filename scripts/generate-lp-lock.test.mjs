import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLock, render, violations } from './generate-lp-lock.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const entry = (...points) => ({ grade: '3e', points });

describe('generate-lp-lock', () => {
  it('lets a lesson that is not built be re-cut freely', () => {
    expect(violations({ a: entry('P un', 'P deux') }, { a: entry('P deux', 'P un') }, new Set())).toEqual([]);
    expect(violations({ a: entry('P un') }, {}, new Set())).toEqual([]);
  });

  it('accepts an appended point on a built lesson, refuses a move, a rewording, a removal', () => {
    const built = new Set(['a']);
    expect(violations({ a: entry('P un', 'P deux') }, { a: entry('P un', 'P deux', 'P trois') }, built)).toEqual([]);
    expect(violations({ a: entry('P un', 'P deux') }, { a: entry('P deux', 'P un') }, built)).toHaveLength(2);
    expect(violations({ a: entry('P un', 'P deux') }, { a: entry('P un', 'P 2') }, built)).toHaveLength(1);
    expect(violations({ a: entry('P un', 'P deux') }, { a: entry('P un') }, built)).toHaveLength(1);
    expect(violations({ a: entry('P un') }, {}, built)[0]).toMatch(/left the catalogue/);
  });

  it('wrote the lock that the catalogue gives today', () => {
    const { lessons } = buildLock();
    expect(readFileSync(join(ROOT, 'packages/core/curriculum/fr/learning_points.lock.json'), 'utf8')).toBe(render(lessons));
  });
});
