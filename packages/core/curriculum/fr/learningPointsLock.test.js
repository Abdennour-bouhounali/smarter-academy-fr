import { describe, it, expect } from 'vitest';
import lock from './learning_points.lock.json';
import lessons6e from './lessons_6e_2026_2027.json';
import lessons5e from './lessons_5e_2026_2027.json';
import lessons4e from './lessons_4e_2026_2027.json';
import lessons3e from './lessons_3e_2026_2027.json';

/**
 * Learning-point ids are append-only: `<grade>_<code>_P<n>` IS the n-th point of the lesson, and progress, evidence and
 * reports store that id. This test compares the catalogue with learning_points.lock.json, point by point.
 */
const HOW =
  'A learning point is added by APPENDING it after the last point of its lesson, then `npm run generate:lp-lock`. ' +
  'Reordering, removing or rewording a point is forbidden once the lesson is built (it has a folder under ' +
  'apps/web/src/lessons/college/): the script refuses it. While a lesson is coming_soon with no folder, its points may ' +
  'still be re-cut and the lock regenerated with the same command.';

const catalogue = [lessons6e, lessons5e, lessons4e, lessons3e].flatMap((f) => f.lessons.map((l) => ({ ...l, grade: f.grade })));
const byCode = new Map(catalogue.map((l) => [l.code, l]));

describe('learning_points.lock.json', () => {
  it('keeps every locked point of every locked lesson, same text, same place', () => {
    const broken = [];
    for (const [code, entry] of Object.entries(lock.lessons)) {
      const lesson = byCode.get(code);
      if (!lesson) {
        broken.push(`${code}: the lesson left the catalogue`);
        continue;
      }
      if (lesson.grade !== entry.grade) broken.push(`${code}: grade ${entry.grade} is now ${lesson.grade}`);
      entry.points.forEach((text, i) => {
        if (lesson.pointsToLearn[i] !== text) {
          broken.push(`${entry.grade}_${code}_P${i + 1}: « ${text} » is now « ${lesson.pointsToLearn[i] ?? '(gone)'} »`);
        }
      });
    }
    expect(broken, HOW).toEqual([]);
  });

  it('locks every lesson of the catalogue and every one of its points (no point left out of the lock)', () => {
    const missing = catalogue.flatMap((l) => {
      const entry = lock.lessons[l.code];
      if (!entry) return [`${l.code}: not in the lock`];
      return l.pointsToLearn.slice(entry.points.length).map((_, k) => `${l.grade}_${l.code}_P${entry.points.length + k + 1}: not locked yet`);
    });
    expect(missing, HOW).toEqual([]);
  });
});
