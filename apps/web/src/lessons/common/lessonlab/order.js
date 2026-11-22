/**
 * « Mon labo » — WHERE a lesson sits in the four years (PURE). The lab shows the instruments of the lesson and of every lesson
 * BEFORE it (any grade), never of a lesson after it: a student never meets a tool of something he has not studied yet.
 * The order is the catalogue's: grade (6e → 3e), then the lesson's position (`lessonOrder.generated.json`).
 */
import { ACTIVE_GRADE_IDS, getAllGrades } from '@smarter-academy/core';
import ORDER from './lessonOrder.generated.json';

export const GRADES = [...ACTIVE_GRADE_IDS];
/** The grade's name as the catalogue writes it — never a local table. */
export const GRADE_NAMES = Object.fromEntries(getAllGrades().map((g) => [g.id, g.name]));

const RANK = new Map();
GRADES.forEach((g, gi) => (ORDER[g] ?? []).forEach((code, i) => RANK.set(code, { grade: g, rank: gi * 1000 + i })));

/** { grade, rank } of a lesson code, or null when the lesson is unknown to the catalogue. */
export const placeOf = (code) => RANK.get(code) ?? null;
/** Is lesson `x` the lesson `of` itself or one studied before it? Unknown lessons are never « before ». */
export const isReached = (x, of) => {
  const a = RANK.get(x);
  const b = RANK.get(of);
  return Boolean(a && b) && a.rank <= b.rank;
};
export const compareLessons = (x, y) => (RANK.get(x)?.rank ?? Infinity) - (RANK.get(y)?.rank ?? Infinity);
