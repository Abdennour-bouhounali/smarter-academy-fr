import { describe, it, expect } from 'vitest';
import lessons6e from './lessons_6e_2026_2027.json';
import lessons5e from './lessons_5e_2026_2027.json';
import lessons4e from './lessons_4e_2026_2027.json';
import lessons3e from './lessons_3e_2026_2027.json';
import units6e from './units_6e_2026_2027.json';
import units5e from './units_5e_2026_2027.json';
import units4e from './units_4e_2026_2027.json';
import units3e from './units_3e_2026_2027.json';
import { getItem } from './net/learningNet.js';

/**
 * The rules of the lesson files themselves — how a lesson, its learning points and its unit are written (the checks of
 * the 3e draft's validator, now on the live files of every grade).
 */
const GRADES = [
  [lessons6e, units6e],
  [lessons5e, units5e],
  [lessons4e, units4e],
  [lessons3e, units3e],
];

describe.each(GRADES.map(([l, u]) => [l.grade, l, u]))('lesson files (%s)', (grade, lessonFile, unitFile) => {
  const lessons = lessonFile.lessons;
  const byCode = new Map(lessons.map((l) => [l.code, l]));
  const unitCodes = unitFile.units.map((u) => u.code);

  it('gives lessons and units distinct codes, never the reserved `units`, never a grade suffix', () => {
    const codes = [...unitCodes, ...lessons.map((l) => l.code)];
    expect(new Set(codes).size).toBe(codes.length);
    for (const l of lessons) {
      expect(l.code).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(l.code).not.toBe('units');
      expect(l.code, l.code).not.toMatch(/-(3e|4e|5e|6e)$/);
    }
  });

  it('writes every lesson with the platform’s own title, a status, and none of the dropped fields', () => {
    for (const l of lessons) {
      expect(l.titleSource, l.code).toBe('editorial');
      expect(l.title?.trim().length, l.code).toBeGreaterThan(3);
      expect(['coming_soon', 'available'], l.code).toContain(l.status);
      for (const f of ['durationMinutes', 'difficulty', 'icon', 'textbookRef']) expect(f in l, `${l.code}: ${f}`).toBe(false);
    }
  });

  it('puts every lesson in a unit of its grade, under the unit’s thème', () => {
    for (const l of lessons) {
      const u = unitFile.units.find((x) => x.code === l.unitId);
      expect(u, `${l.code}: unit ${l.unitId}`).toBeDefined();
      expect(l.chapterId, l.code).toBe(u.chapterId);
    }
  });

  it('gives a lesson 2 to 5 learning points and at least one item of its grade; a synthesis one point and no item', () => {
    for (const l of lessons) {
      if (l.kind === 'synthesis') {
        expect(l.programmeItems, l.code).toEqual([]);
        expect(l.pointsToLearn, l.code).toHaveLength(1);
        continue;
      }
      expect(l.kind, l.code).toBe('lesson');
      expect(l.programmeItems.length, l.code).toBeGreaterThanOrEqual(1);
      for (const id of l.programmeItems) expect(getItem(id)?.grade, `${l.code} › ${id}`).toBe(grade);
      expect(l.pointsToLearn.length, l.code).toBeGreaterThanOrEqual(2);
      expect(l.pointsToLearn.length, l.code).toBeLessThanOrEqual(5);
    }
  });

  it('writes each learning point as a capability: an infinitive first, never « savoir que » or « comprendre »', () => {
    for (const l of lessons) {
      for (const p of l.pointsToLearn) {
        expect(p, l.code).not.toMatch(/savoir que|comprendre/i);
        expect(p, l.code).toMatch(/^(?:Se [a-zé]|[A-ZÉÈÀÂ])[a-zéèêàâîôûç’]*(er|ir|re)\b/);
      }
    }
  });

  it('declares only EARLIER lessons and points as prerequisites, and names at the lesson grain what a point needs', () => {
    for (const l of lessons) {
      for (const c of l.prerequisiteLessonCodes) {
        expect(byCode.has(c), `${l.code} ← ${c}`).toBe(true);
        expect(byCode.get(c).order, `${l.code} ← ${c}`).toBeLessThan(l.order);
      }
      for (const [key, ids] of Object.entries(l.pointPrerequisites ?? {})) {
        const n = Number(key.slice(1));
        expect(key, l.code).toMatch(/^P\d+$/);
        expect(n >= 1 && n <= l.pointsToLearn.length, `${l.code}.${key}`).toBe(true);
        for (const id of ids) {
          const m = new RegExp(`^${grade}_([a-z0-9-]+)_P(\\d+)$`).exec(id);
          const target = m && byCode.get(m[1]);
          expect(target, `${l.code}.${key} ← ${id}`).toBeTruthy();
          expect(Number(m[2]) >= 1 && Number(m[2]) <= target.pointsToLearn.length, `${l.code}.${key} ← ${id}`).toBe(true);
          const earlier = target.order < l.order || (target.code === l.code && Number(m[2]) < n);
          expect(earlier, `${l.code}.${key} ← ${id} is not earlier`).toBe(true);
          if (target.code !== l.code && l.kind !== 'synthesis') expect(l.prerequisiteLessonCodes, `${l.code} ← ${target.code}`).toContain(target.code);
        }
      }
    }
  });

  it('ends every unit with exactly one synthesis, 3 to 6 lessons before it, contiguous in the year', () => {
    for (const u of unitFile.units) {
      const ls = lessons.filter((l) => l.unitId === u.code).sort((a, b) => a.order - b.order);
      expect(ls.filter((l) => l.kind === 'synthesis'), u.code).toHaveLength(1);
      expect(ls.at(-1)).toMatchObject({ kind: 'synthesis', code: u.synthesisLessonCode });
      expect(ls.length, u.code).toBeGreaterThanOrEqual(4);
      expect(ls.length, u.code).toBeLessThanOrEqual(7);
      expect(u.objectives.length, u.code).toBeGreaterThanOrEqual(3);
      expect(u.objectives.length, u.code).toBeLessThanOrEqual(5);
      expect(Boolean(u.title && u.subtitle), u.code).toBe(true);
      const orders = ls.map((l) => l.order);
      expect(orders, u.code).toEqual(orders.map((_, i) => orders[0] + i));
    }
  });

  it('runs the units in the order of the year: unit `order` 0..n-1 follows the lessons’ `order`', () => {
    const units = unitFile.units.slice().sort((a, b) => a.order - b.order);
    expect(units.map((u) => u.order)).toEqual(units.map((_, i) => i));
    const firstLesson = units.map((u) => Math.min(...lessons.filter((l) => l.unitId === u.code).map((l) => l.order)));
    expect(firstLesson).toEqual([...firstLesson].sort((a, b) => a - b));
  });

  it('numbers the lessons of the year 0..n-1', () => {
    const orders = lessons.map((l) => l.order).sort((a, b) => a - b);
    expect(orders).toEqual(orders.map((_, i) => i));
  });
});

describe('the 3e catalogue', () => {
  it('holds 13 units and 59 lessons (46 + 13 syntheses), 161 learning points', () => {
    expect(units3e.units).toHaveLength(13);
    expect(lessons3e.lessons).toHaveLength(59);
    expect(lessons3e.lessons.filter((l) => l.kind === 'synthesis')).toHaveLength(13);
    expect(lessons3e.lessons.reduce((n, l) => n + l.pointsToLearn.length, 0)).toBe(161);
  });
});
