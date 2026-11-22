import { describe, it, expect } from 'vitest';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { validateIllustration } from '../../../../../../common/problems/problemIllustration';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Le calcul littéral de l'unité 3, réécrit ici pour tout recalculer ──────
/**
 * Convertit une écriture LaTeX simple (entiers, x, + − × ^, parenthèses, multiplication implicite
 * « 2x », « (a)(b) », « x(… ) ») en expression JavaScript ; `null` si le texte contient autre chose
 * (lettres, <, >, \ldots…) : il est alors hors du champ de ce lecteur.
 */
function toJs(src) {
  const t = src
    .replace(/\\times/g, '*').replace(/\\left|\\right/g, '').replace(/\\[,;! ]/g, ' ')
    .replace(/−/g, '-').replace(/\^/g, '**');
  if (/[^0-9x+\-*().\s]/.test(t)) return null;
  return t.replace(/(\d|x|\))\s*(?=\(|x)/g, '$1*');
}
const run = (js, x) => {
  // eslint-disable-next-line no-new-func
  const v = new Function('x', `return (${js});`)(x);
  if (!Number.isFinite(v)) throw new Error(`non finite « ${js} »`);
  return v;
};
/** Les chaînes d'égalités écrites dans les `$…$` d'un texte : [[membre, …], …]. */
const chainsOf = (text) => [...text.matchAll(/\$([^$]+)\$/g)]
  .map((m) => m[1])
  .filter((seg) => seg.includes('=') && !/\\(?:neq|approx|ldots|leq|geq)|[<>]/.test(seg))
  .map((seg) => seg.split('=').map((side) => side.trim()));

const POINTS = [2, 3, 7, 11, 13];
/** x pour lesquels une ÉQUATION écrite (ou une valeur donnée « x = 40 ») est vraie, par مسألة. */
const ROOTS = { 'wadiya-1': [], 'wadiya-2': [5, -12], 'wadiya-3': [40], 'wadiya-4': [8, -4, 9], 'wadiya-5': [2, 50], 'wadiya-6': [90] };

/** La seule égalité FAUSSE assumée : l'erreur de ياسمين (وضعية 5), que la مسألة réfute. */
const FALSE_CLAIMS = new Set(['(2x - 3)^2 = 4x^2 - 9']);

function textsOf(problem) {
  const out = [problem.statement];
  for (const part of problem.parts) {
    out.push(part.question);
    for (const st of part.steps) {
      for (const k of ['prompt', 'explain']) if (st[k]) out.push(st[k]);
      if (st.kind === 'choice') out.push(st.options[st.correct]); // les distracteurs sont FAUX par construction
      for (const l of st.lines ?? []) out.push(l);
    }
  }
  return out.filter(Boolean);
}

const steps = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => steps(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);

describe('les six وضعيات d\'entraînement de أدمج تعلّماتي (wadiya-idmajiya-harfi)', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (1 to 6, practice_lab, then the situation 7 and the final test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual(
      [1, 2, 3, 4, 5, 6].map((k) => [k, `0${k}`, `wadiya-${k}`, 'practice_lab']),
    );
    expect(LESSON_CONFIG.modules.map((m) => [m.number, m.slug])).toEqual([
      [0, 'astaidd'], [1, 'wadiya-1'], [2, 'wadiya-2'], [3, 'wadiya-3'], [4, 'wadiya-4'], [5, 'wadiya-5'], [6, 'wadiya-6'],
      [7, 'al-wadiya'], [8, 'ahill'],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'ahill', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(PROBLEMS.map((p) => p.id)).toEqual(problemModules.map((m) => m.slug));
    const situations = LESSON_CONFIG.resources.filter((r) => r.code.startsWith('wadiya-'));
    expect(situations.map((r) => [r.code, r.module])).toEqual([1, 2, 3, 4, 5, 6].map((k) => [`wadiya-${k}`, k]));
    // la situation du manuel (le bassin) est lue au module 7 : ses ressources la suivent
    expect(LESSON_CONFIG.resources.filter((r) => !r.code.startsWith('wadiya-')).every((r) => r.module === 7)).toBe(true);
  });

  it('every training module is titled « الوضعية التدريبية N » and has its own tone, support and a value-free contract', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    problemModules.forEach((m, i) => expect(m.title.startsWith(`الوضعية التدريبية ${i + 1} —`), m.title).toBe(true));
    PROBLEMS.forEach((p, i) => expect(p.title.startsWith(`الوضعية التدريبية ${i + 1} —`), p.title).toBe(true));
    expect(new Set(PROBLEMS.map((p) => p.tone)).size).toBe(6);
    for (const p of PROBLEMS) {
      expect(Boolean(p.illustration || p.table || p.figure), `${p.id} has no drawn support`).toBe(true);
      if (p.illustration) expect(validateIllustration(p.illustration)).toEqual([]);
      expect(p.source).toBeTruthy();
    }
  });

  it('the evaluated situation (the pool and its ribbon, 10 m, 44 m²) is NOT trained on', () => {
    for (const p of PROBLEMS) {
      expect(p.statement, p.id).not.toMatch(/\b44\b|حوض|شريط/);
      expect(JSON.stringify(p), p.id).not.toMatch(/x\^2 \+ 10x - 11|\(x - 1\)\(x \+ 11\)/);
    }
  });

  it('no sub-step is an assessment: mastery comes from module 8 only', () => {
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) expect(s.assessment, p.id).toBeUndefined();
    for (const m of LESSON_CONFIG.modules.filter((x) => x.track === 'problem')) expect(m.stage).toBe('practice_lab');
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('every number written in an exam-sheet statement is in the statement', () => {
    for (const p of PROBLEMS) expect(p.statement).toMatch(/\d/);
  });

  it('a unit-3 situation never teaches the zero-product equation: the « مساعدة » is GIVEN (2 and 4) or absent', () => {
    for (const p of PROBLEMS) {
      const given = p.parts.some((part) => /يعطيك/.test(part.question));
      const usesHelp = JSON.stringify(p).includes('معدومًا');
      if (usesHelp) expect(given, `${p.id} uses the zero-product rule without giving the factored form`).toBe(true);
    }
  });

  it('every written equality is true (identities at 5 points, equations at their roots, numbers exactly)', () => {
    let checked = 0, identities = 0, equations = 0;
    for (const p of PROBLEMS) for (const text of textsOf(p)) for (const chain of chainsOf(text)) {
      const js = chain.map(toJs);
      if (FALSE_CLAIMS.has(chain.join(' = '))) {
        expect(POINTS.some((x) => { const v = js.map((e) => run(e, x)); return v.every((n) => n === v[0]); }), chain.join(' = ')).toBe(false);
        continue;
      }
      if (js.some((s) => s === null || s === '')) continue; // letters / holes: out of this reader's range
      const hasX = chain.some((side) => /x/.test(side));
      if (!hasX) {
        const values = js.map((s) => run(s, 0));
        for (const v of values) expect(v, `${p.id}: « ${chain.join(' = ')} »`).toBe(values[0]);
      } else {
        const holdsAt = (x) => { const v = js.map((s) => run(s, x)); return v.every((n) => n === v[0]); };
        if (POINTS.every(holdsAt)) identities += 1;
        else {
          expect(ROOTS[p.id].some(holdsAt), `${p.id}: « ${chain.join(' = ')} » is neither an identity nor true at a root of the situation`).toBe(true);
          equations += 1;
        }
      }
      checked += 1;
    }
    expect(checked).toBeGreaterThan(120);
    expect(identities).toBeGreaterThan(25);
    expect(equations).toBeGreaterThan(10);
  });

  it('the equality reader really reads (self-check)', () => {
    const holds = (src, x) => { const v = src.split('=').map((s) => run(toJs(s.trim()), x)); return v.every((n) => n === v[0]); };
    expect(holds('(x + 3)(x - 3) = x^2 - 9', 5)).toBe(true);
    expect(holds('(2x - 3)^2 = 4x^2 - 9', 5)).toBe(false);
    expect(holds('51 \\times 49 = 50^2 - 1^2 = 2499', 0)).toBe(true);
    expect(holds('x(x + 7) = x^2 + 7x', 11)).toBe(true);
    expect(holds('2 \\times 2x \\times 3 = 12x', 4)).toBe(true);
    expect(toJs('a + b')).toBeNull();
  });

  // ── Chaque nombre attendu, recalculé depuis l'énoncé ─────────────────────
  it('وضعية 1 — 51 × 49, the 98 m square, the 102 m extension', () => {
    expect(expectedOf('wadiya-1', 0)).toEqual([50 ** 2, 51 * 49]);
    expect(51 * 49).toBe(50 ** 2 - 1);
    expect(expectedOf('wadiya-1', 1)).toEqual([2 * 100 * 2, 98 ** 2]);
    expect(98 ** 2).toBe(100 ** 2 - 2 * 100 * 2 + 2 ** 2);
    const gain = 102 ** 2 - 98 ** 2;
    expect(expectedOf('wadiya-1', 2)).toEqual([102 - 98, 102 + 98, gain, gain * 1500]);
    expect(gain).toBe((102 - 98) * (102 + 98));
  });

  it('وضعية 2 — the flower bed x(x + 7) = 60', () => {
    const area = (x) => x * (x + 7);
    expect(area(5)).toBe(60);
    // (x - 5)(x + 12) = x² + 7x − 60 at five points, and the roots are 5 and −12
    for (const x of POINTS) expect((x - 5) * (x + 12)).toBe(x * x + 7 * x - 60);
    expect(area(-12)).toBe(60); // the rejected root satisfies the equation but is not a width
    expect(expectedOf('wadiya-2', 1)).toEqual([12 - 5, 5]);
    const perimeter = 2 * (5 + (5 + 7));
    expect(expectedOf('wadiya-2', 2)).toEqual([perimeter, perimeter * 800]);
  });

  it('وضعية 3 — the square and the (x + 3)(x - 3) rectangle', () => {
    for (const x of POINTS) expect((x + 3) * (x - 3)).toBe(x * x - 9);
    // the gap is the constant 9, whatever x
    for (const x of POINTS) expect(x * x - (x + 3) * (x - 3)).toBe(9);
    expect(expectedOf('wadiya-3', 0)).toEqual([2]); // two terms remain: x² and −9
    expect(expectedOf('wadiya-3', 1)).toEqual([9]);
    expect(expectedOf('wadiya-3', 2)).toEqual([43 * 37, 40 ** 2 - 9, 9 * 1800]);
    expect(43 * 37).toBe(40 ** 2 - 9);
  });

  it('وضعية 4 — the flag mast: (x + 9)² = x² + (x + 7)², x = 8, the 8-15-17 triangle (renumbered 2026-11-12: 5-12-13 showed 144)', () => {
    for (const x of POINTS) {
      expect((x + 9) ** 2).toBe(x ** 2 + 18 * x + 81);
      expect(x ** 2 + (x + 7) ** 2).toBe(2 * x ** 2 + 14 * x + 49);
      // moving everything to one side: right − left = x² − 4x − 32 = (x − 8)(x + 4)
      expect(x ** 2 + (x + 7) ** 2 - (x + 9) ** 2).toBe(x ** 2 - 4 * x - 32);
      expect(x ** 2 - 4 * x - 32).toBe((x - 8) * (x + 4));
    }
    expect(expectedOf('wadiya-4', 0)).toEqual([9 ** 2, 7 ** 2]);
    expect(expectedOf('wadiya-4', 1)).toEqual([9 ** 2 - 4 * 9 - 32, 8]);
    expect((8 + 9) ** 2).toBe(8 ** 2 + (8 + 7) ** 2); // x = 8 solves the Pythagorean equality
    expect((-4 + 9) ** 2 === (-4) ** 2 + (-4 + 7) ** 2).toBe(true); // −4 too (algebra), but a distance is positive
    expect(expectedOf('wadiya-4', 2)).toEqual([8 + 7, 8 + 9, 17 * 450]);
  });

  it('وضعية 5 — (2x − 3)² is not 4x² − 9', () => {
    const lhs = (x) => (2 * x - 3) ** 2, wrong = (x) => 4 * x * x - 9, right = (x) => 4 * x * x - 12 * x + 9;
    expect(lhs(2)).toBe(1);
    expect(wrong(2)).toBe(7);
    expect(expectedOf('wadiya-5', 0)).toEqual([lhs(2), wrong(2)]);
    for (const x of POINTS) expect(lhs(x)).toBe(right(x));
    expect(POINTS.some((x) => lhs(x) === wrong(x))).toBe(false);
    expect(expectedOf('wadiya-5', 1)).toEqual([2 * 2 * 3, right(2)]);
    for (const x of POINTS) expect(wrong(x)).toBe((2 * x - 3) * (2 * x + 3));
    expect(expectedOf('wadiya-5', 2)).toEqual([2 * 50 - 3, 2 * 50 + 3, wrong(50)]);
    expect(97 * 103).toBe(wrong(50));
  });

  it('وضعية 6 — Samir (x + 6)² − 36 and Layla x(x + 12) agree for every x (renumbered 2026-11-12: x(x + 10) is the 🏆\'s reduced form)', () => {
    for (const x of [0, 1, 2, 3, 7, 11, 90, 1000]) expect((x + 6) ** 2 - 36).toBe(x * (x + 12));
    expect(expectedOf('wadiya-6', 0)).toEqual([12]);
    expect(expectedOf('wadiya-6', 2)).toEqual([90 + 12, 90 * 102, 96 ** 2, 96 ** 2 - 36]);
    expect(96 ** 2 - 36).toBe(90 * 102);
  });

  it('the statements keep the numbers of their situation', () => {
    const has = (id, ...nums) => nums.forEach((n) => expect(PROBLEM[id].statement, `${id} ${n}`).toContain(String(n)));
    has('wadiya-1', 51, 49, 98, 1500, 102);
    has('wadiya-2', 7, 60, 800);
    has('wadiya-3', 1800, 40);
    has('wadiya-4', 450);
    has('wadiya-5', 3);
    has('wadiya-6', 6, 12, 36);
  });
});
