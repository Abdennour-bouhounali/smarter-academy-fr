import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { figureQuality } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les مسائل du درس « الشعاعان المتساويان ومتوازي الأضلاع ومنتصف قطعة » : chaque point vient de la FIGURE que l'élève
 * voit (ou de la donnée de l'énoncé), chaque image, milieu, vecteur et longueur est recalculé EXACTEMENT par
 * packages/core/arithmetic/vectors.js — puis chaque égalité écrite ($\overrightarrow{XY} = …$, $XY = …$, $a \times b = c$)
 * est confrontée à ce modèle.
 */
const numericOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric');
const expectedOf = (id, part) => numericOf(id, part).map((s) => s.expected);
const choiceOf = (id, part, k) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[k];
const correctOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options[s.correct]; };
const n = (f) => f.n / f.d; // fraction exacte → nombre (seulement pour des valeurs déjà entières/décimales exactes)
const lengthOf = (A, B) => {
  const sq = V.distanceSquared(A, B);
  const r = Math.sqrt(n(sq));
  expect(Number.isInteger(r * 10), `longueur rationnelle ${JSON.stringify(sq)}`).toBe(true);
  return r;
};

// ── Les modèles : les points de chaque مسألة (unités : le carreau en 1 ; le mètre en 2 ; le carreau de 10 cm en 3) ──
const FIG1 = LESSON_CONFIG.lessonProblem.figure.points;
const P1 = (() => {
  const A = V.point(...FIG1.A); const B = V.point(...FIG1.B); const C = V.point(...FIG1.C);
  const D = V.translate(C, V.vec(A, B)); // D صورة C بالانسحاب الذي شعاعه AB
  const E = V.translate(B, V.vecNeg(V.vec(A, C))); // EB = AC ⇔ E = B − AC
  return { A, B, C, D, E };
})();
// مسألة 2 : les points sur le سير, repérés par leur distance à A (un axe : les égalités de vecteurs sur une droite).
const T = 4; // un déplacement quelconque du سير entre deux instants : les conclusions ne doivent pas en dépendre
const P2 = { A: V.point(0, 0), B: V.point(10, 0), C: V.point(1, 0), D: V.point(3, 0), I: V.point(5, 0), E: V.point(1 + T, 0), F: V.point(3 + T, 0) };
const FIG3 = PROBLEM['masala-3'].figure.points;
const P3 = (() => {
  const A = V.point(...FIG3.A); const A1 = V.point(...FIG3["A'"]); const B = V.point(...FIG3.B); const C = V.point(...FIG3.C); const D = V.point(...FIG3.D);
  const u = V.vec(A, A1);
  return { A, "A'": A1, B, C, D, "C'": V.translate(C, u), K: V.midpoint(A, A1) };
})();
const MODELS = { 'masala-1': { pts: P1, unit: 1 }, 'masala-2': { pts: P2, unit: 1 }, 'masala-3': { pts: P3, unit: 10 } };

// ── Vérificateur des égalités écrites ───────────────────────────────────────────────────────────
// Rationnels [num, den] exacts pour + − × ÷ et parenthèses.
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const R = (p, q = 1) => { if (q < 0) { p = -p; q = -q; } const g = gcd(Math.abs(p), q) || 1; return [p / g, q / g]; };
const op = { '+': (x, y) => R(x[0] * y[1] + y[0] * x[1], x[1] * y[1]), '-': (x, y) => R(x[0] * y[1] - y[0] * x[1], x[1] * y[1]), '*': (x, y) => R(x[0] * y[0], x[1] * y[1]), '/': (x, y) => R(x[0] * y[1], x[1] * y[0]) };
const dec = (v) => { const [i, f = ''] = String(v).split('.'); return R(Number(i + f), 10 ** f.length); };
function evalExpr(src) {
  const s = src.replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(s)) return null;
  let i = 0;
  const num = () => { if (s[i] === '(') { i++; const v = add(); i++; return v; } const j = i; while (/[\d.]/.test(s[i] ?? '')) i++; if (j === i) throw new Error(`nombre attendu : ${src}`); return dec(s.slice(j, i)); };
  const prod = () => { let v = num(); while (s[i] === '*' || s[i] === '/') { const o = s[i++]; v = op[o](v, num()); } return v; };
  const add = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const o = s[i++]; v = op[o](v, prod()); } return v; };
  const v = add();
  return i === s.length ? v : null;
}
const NAME = "[A-Z]'?";
const VEC = new RegExp(`\\\\overrightarrow\\{(${NAME})(${NAME})\\}`, 'g');
/** Une formule $…$ : vecteurs égaux dans le modèle ; longueurs (XY → sa mesure) et nombres égaux ; < / > vrais. */
function checkFormula(f, model, where) {
  const { pts, unit } = model;
  if (f.includes('\\overrightarrow')) {
    const sides = f.split('=').map((side) => [...side.matchAll(VEC)].map((m) => [m[1], m[2]]));
    if (sides.length < 2 || sides.some((s) => s.length !== 1)) return 0;
    const vecs = sides.map(([[a, b]]) => { expect(pts[a] && pts[b], `${where} : point inconnu dans ${f}`).toBeTruthy(); return V.vec(pts[a], pts[b]); });
    for (const v of vecs.slice(1)) expect(V.vecEq(v, vecs[0]), `${where} : ${f}`).toBe(true);
    return 1;
  }
  // Les longueurs : « CC' » → sa mesure dans l'unité de l'énoncé.
  const sub = f.replace(new RegExp(`(${NAME})(${NAME})(?![A-Za-z{])`, 'g'), (m, a, b) => {
    if (!pts[a] || !pts[b]) return m;
    const r = Math.sqrt(n(V.distanceSquared(pts[a], pts[b])));
    return Number.isInteger(r * 10) ? `(${r * unit})` : m; // une diagonale irrationnelle ($[AC]$) n'est jamais une égalité numérique ici
  });
  for (const o of ['<', '>']) {
    const parts = sub.split(o);
    if (parts.length === 2) {
      const [x, y] = parts.map(evalExpr);
      if (!x || !y) return 0;
      const lt = x[0] * y[1] < y[0] * x[1];
      expect(o === '<' ? lt : !lt, `${where} : ${f}`).toBe(true);
      return 1;
    }
  }
  const sides = sub.split('=').map(evalExpr);
  if (sides.length < 2 || sides.some((v) => v == null)) return 0;
  for (const v of sides.slice(1)) expect(v[0] * sides[0][1], `${where} : ${f}`).toBe(sides[0][0] * v[1]);
  return 1;
}
/** Les égalités FAUSSES écrites exprès dans une explication (le malentendu nommé) : elles doivent rester fausses. */
const MISCONCEPTIONS = {
  'masala-1': ['\\overrightarrow{DC} = \\overrightarrow{AB}'],
  'masala-3': ["\\overrightarrow{C'C} = \\overrightarrow{AA'}"],
};
/** Tout ce qui est AFFIRMÉ : énoncé, questions, consignes, explications, bonnes options, lignes de solution. */
const assertedTexts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [
  s.prompt, s.explain, ...(s.lines ?? []), s.kind === 'choice' ? s.options[s.correct] : null,
])])].filter(Boolean);

describe('les مسائل du درس « الشعاعان المتساويان ومتوازي الأضلاع ومنتصف قطعة »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p), p.id).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.slug, m.stage])).toEqual([
      [5, 'masala-1', 'practice_lab'], [6, 'masala-2', 'practice_lab'], [7, 'masala-3', 'practice_lab'],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('every figure is readable (figureQuality) and the sort has a numeric decoy', () => {
    for (const p of PROBLEMS) {
      expect(p.figure, p.id).toBeTruthy();
      expect(figureQuality(p.figure), p.id).toEqual([]);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
    }
  });

  it('مسألة 1 — D image de C, ABDC (pas ABCD), B milieu de [DE], le périmètre : calculés', () => {
    const { A, B, C, D, E } = P1;
    const ab = V.vec(A, B);
    expect(expectedOf('masala-1', 0)).toEqual([n(ab.x), n(ab.y)]);
    // ABDC est un متوازي أضلاع ; ABCD non (le piège de l'ordre des lettres) ; A, B, C non alignés.
    expect(V.isParallelogram(A, B, D, C)).toBeTruthy();
    expect(V.vecEq(V.vec(A, B), V.vec(D, C))).toBe(false);
    expect(V.collinear(A, B, C)).toBe(false);
    // Les distracteurs de la position de D tombent ailleurs.
    const wrong = [V.translate(C, V.vecNeg(ab)), V.translate(B, ab), V.translate(C, V.point(ab.y, ab.x))];
    for (const w of wrong) expect(V.vecEq(w, D)).toBe(false);
    expect(lengthOf(A, B)).toBe(5); // la donnée « 5 m » est vraie sur la figure (4, 3 → 5)
    // 2) B milieu de [DE], AC compté, DE.
    expect(V.vecEq(V.midpoint(D, E), B)).toBe(true);
    expect(expectedOf('masala-1', 1)).toEqual([lengthOf(A, C), lengthOf(D, E)]);
    expect(lengthOf(D, E)).toBe(2 * lengthOf(B, D));
    // 3) Le périmètre et le ruban.
    const perim = lengthOf(A, B) + lengthOf(B, D) + lengthOf(D, C) + lengthOf(C, A);
    expect(expectedOf('masala-1', 2)).toEqual([perim, perim * 450]);
    // D reste sur la شبكة visible de la figure.
    expect(V.coords(D).every(Number.isInteger)).toBe(true);
  });

  it('مسألة 2 — I milieu, CEFD « مسطّح », EF = CD quel que soit le déplacement, les durées : calculés', () => {
    const { A, B, C, D, I, E, F } = P2;
    expect(V.vecEq(V.vec(A, I), V.vec(I, B))).toBe(true);
    expect(expectedOf('masala-2', 0)).toEqual([lengthOf(A, I)]);
    // CE = DF ⇒ [CF] et [DE] ont le même milieu (pour tout déplacement T).
    expect(V.vecEq(V.vec(C, E), V.vec(D, F))).toBe(true);
    expect(V.vecEq(V.midpoint(C, F), V.midpoint(D, E))).toBe(true);
    expect(V.vecEq(V.midpoint(C, E), V.midpoint(D, F))).toBe(false); // le distracteur « les côtés »
    expect(expectedOf('masala-2', 1)).toEqual([lengthOf(C, D), lengthOf(E, F)]);
    expect(lengthOf(E, F)).toBe(lengthOf(C, D));
    const secPerMetre = 2; // « 1 m كل ثانيتين »
    expect(expectedOf('masala-2', 2)).toEqual([lengthOf(A, I) * secPerMetre, lengthOf(E, F) * secPerMetre]);
    // La figure : le سير de 10 m de A à B, C et D à 1 m et 3 m de A, sur [AB].
    const fig = PROBLEM['masala-2'].figure.points;
    const [fA, fB, fC, fD] = ['A', 'B', 'C', 'D'].map((k) => V.point(...fig[k]));
    expect(lengthOf(fA, fB)).toBe(10);
    expect(lengthOf(fA, fC)).toBe(1);
    expect(lengthOf(fA, fD)).toBe(3);
    expect(V.collinear(fA, fB, fC) && V.collinear(fA, fB, fD)).toBe(true);
    expect(PROBLEM['masala-2'].figure.segments.find((s) => s.from === 'A' && s.to === 'B').label).toBe('10 m');
  });

  it('مسألة 3 — C\' image de C, AA\'C\'C (pas AA\'CC\'), AC = A\'C\', K milieu, la valise : calculés', () => {
    const { A, B, C, D, K } = P3; const A1 = P3["A'"]; const C1 = P3["C'"];
    const u = V.vec(A, A1);
    expect(n(u.y)).toBe(0); // le باب glisse sur la سكّة : horizontalement
    expect(expectedOf('masala-3', 0)).toEqual([n(u.x), lengthOf(C, C1) * 10]);
    // Les distracteurs de la position de C′.
    for (const w of [V.translate(C, V.vecNeg(u)), V.translate(C, V.vec(A, B)), V.translate(B, u)]) expect(V.vecEq(w, C1)).toBe(false);
    // AA'C'C متوازي أضلاع (non aplati, pas un rectangle) ; AA'CC' non ; AC = A'C'.
    expect(V.isParallelogram(A, A1, C1, C)).toBeTruthy();
    expect(V.collinear(A, A1, C)).toBe(false);
    expect(V.vecEq(V.vec(A, A1), V.vec(C1, C))).toBe(false);
    expect(V.vecEq(V.vec(A, C), V.vec(A1, C1))).toBe(true);
    expect(n(u.x) * n(V.vec(A, C).x) + n(u.y) * n(V.vec(A, C).y)).not.toBe(0);
    // ABCD est bien le باب rectangulaire 80 cm × 200 cm.
    expect([lengthOf(A, B) * 10, lengthOf(B, C) * 10, lengthOf(C, D) * 10, lengthOf(D, A) * 10]).toEqual([80, 200, 80, 200]);
    // 3) K milieu de [AA'], la فتحة, la valise de 35 cm.
    expect(V.vecEq(V.vec(A, K), V.vec(K, A1))).toBe(true);
    expect(expectedOf('masala-3', 2)).toEqual([lengthOf(A, K) * 10]);
    expect(lengthOf(A, K) * 10 < 35).toBe(true);
    expect(lengthOf(A, A1) * 10 > 35).toBe(true); // le piège « 60 > 35 » : la porte entièrement glissée
    expect(correctOf('masala-3', 2, 1)).toContain('لا');
  });

  it('every written equality (vectors, lengths, numbers) holds in the model — and the named misconceptions do not', () => {
    for (const p of PROBLEMS) {
      const model = MODELS[p.id];
      const wrong = MISCONCEPTIONS[p.id] ?? [];
      let checked = 0;
      for (const text of assertedTexts(p)) {
        for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
          if (wrong.includes(f.trim())) continue;
          checked += checkFormula(f, model, `${p.id} « ${text.slice(0, 50)} »`);
        }
      }
      expect(checked, p.id).toBeGreaterThan(8);
      for (const f of wrong) {
        const [[, a, b], [, c, d]] = [...f.matchAll(VEC)];
        expect(V.vecEq(V.vec(model.pts[a], model.pts[b]), V.vec(model.pts[c], model.pts[d])), `${p.id} ${f}`).toBe(false);
      }
    }
  });
});
