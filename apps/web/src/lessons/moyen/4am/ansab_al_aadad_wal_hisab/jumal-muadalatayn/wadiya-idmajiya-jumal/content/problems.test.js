import { describe, it, expect } from 'vitest';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── L'arithmétique des six وضعيات, réécrite ici pour tout recalculer ───────
/** Résout a1·x + b1·y = c1 ; a2·x + b2·y = c2 (Cramer) — le déterminant est non nul dans les six situations. */
function solve([a1, b1, c1], [a2, b2, c2]) {
  const det = a1 * b2 - a2 * b1;
  expect(det).not.toBe(0);
  return { x: (c1 * b2 - c2 * b1) / det, y: (a1 * c2 - a2 * c1) / det };
}
const near = (a, b) => Math.abs(a - b) < 1e-9;

const steps = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => steps(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const answersOf = (id, part) => steps(id, part).filter((s) => s.kind === 'numeric' && s.role === 'answer').map((s) => s.expected);

// ── Toute égalité NUMÉRIQUE ou en x, y écrite dans une explication, une rédaction ou une consigne est recalculée ──
// Les lettres x et y sont remplacées par la solution de la partie (ENV) : une égalité fausse échoue.
const normalise = (text) => text
  .replace(/\\begin\{cases\}|\\end\{cases\}|\\\\/g, ' | ')
  .replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\\ldots/g, '…')
  .replace(/\\%|%/g, '').replace(/\{,\}/g, '.').replace(/\\,/g, ' ').replace(/\\mathrm\{[^}]*\}/g, ' ')
  .replace(/\$/g, ' ').replace(/−/g, '-').replace(/×/g, '*');
const substitute = (expr, env) => expr
  .replace(/([0-9.)])\s*([xy])/g, (_, a, v) => `${a}*(${env[v]})`)
  .replace(/([xy])/g, (v) => `(${env[v]})`)
  .replace(/([0-9.)])\s*\(/g, '$1*(')
  .replace(/\)\s*([0-9.])/g, ')*$1');
function evaluate(expr) {
  if (!/^[0-9.+\-*/() ]+$/.test(expr)) throw new Error(`unsafe expression « ${expr} »`);
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${expr});`)();
}
const balanced = (s) => { let d = 0; for (const c of s) { if (c === '(') d += 1; if (c === ')') d -= 1; if (d < 0) return false; } return d === 0; };
/** Les chaînes d'égalités d'un texte : [[membre, membre, …], …]. */
const equalityChains = (text) => (normalise(text).match(/[0-9xy.()+\-*/=…\s]+/g) ?? [])
  .filter((seg) => seg.includes('='))
  .map((seg) => seg.split('=').map((side) => side.replace(/^[\s.]+|[\s.]+$/g, '')));

/** Les textes qui AFFIRMENT quelque chose de vrai : consignes, explications, rédactions, et la bonne option. */
function truthsOf(part) {
  const out = [part.question];
  for (const st of part.steps) {
    for (const k of ['prompt', 'explain']) if (st[k]) out.push(st[k]);
    if (st.kind === 'choice') out.push(st.options[st.correct]);
    for (const l of st.lines ?? []) out.push(l);
  }
  return out.filter(Boolean);
}

/** La solution (x ; y) de chaque partie à jumeaux de lettres — vérifiée plus bas contre les systèmes. */
const ENV = {
  'wadiya-1': [{ x: 24, y: 16 }, null],
  'wadiya-2': [{ x: 20, y: 4 }, { x: -8, y: 32 }],
  'wadiya-3': [{ x: 8, y: 6 }, null],
  'wadiya-4': [{ x: 30, y: 60 }, null],
  'wadiya-5': [{ x: 40, y: 30 }, null],
  'wadiya-6': [{ x: 40, y: 10 }, { x: 3000, y: 1800 }],
};

describe('les six وضعيات d\'entraînement de أدمج تعلّماتي (wadiya-idmajiya-jumal)', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (1 to 6, practice_lab, then the حفل analysis 7 and the final situation 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual(
      [1, 2, 3, 4, 5, 6].map((k) => [k, `0${k}`, `wadiya-${k}`, 'practice_lab']),
    );
    expect(LESSON_CONFIG.modules.map((m) => [m.number, m.slug])).toEqual([
      [0, 'astaidd'], [1, 'wadiya-1'], [2, 'wadiya-2'], [3, 'wadiya-3'], [4, 'wadiya-4'], [5, 'wadiya-5'], [6, 'wadiya-6'],
      [7, 'al-wadiya'], [8, 'ahill'],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'ahill', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.find((m) => m.number === 7)).toMatchObject({ id: '07', slug: 'al-wadiya', stage: 'practice_lab' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(PROBLEMS.map((p) => p.id)).toEqual(problemModules.map((m) => m.slug));
    expect(LESSON_CONFIG.lessonProblem).toBeUndefined();
    const situations = LESSON_CONFIG.resources.filter((r) => /^wadiya-\d$/.test(r.code));
    expect(situations.map((r) => [r.code, r.module])).toEqual([1, 2, 3, 4, 5, 6].map((k) => [`wadiya-${k}`, k]));
    // the حفل (module 7) and its two laboratories moved with it
    for (const r of LESSON_CONFIG.resources.filter((x) => x.kind === 'manipulation' || x.code === 'situation-hafl-baladiya')) expect(r.module, r.code).toBe(7);
  });

  it('every training module is titled « الوضعية التدريبية N », and the حفل of the final situation is NOT trained on', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    problemModules.forEach((m, i) => expect(m.title.startsWith(`الوضعية التدريبية ${i + 1} —`), m.title).toBe(true));
    PROBLEMS.forEach((p, i) => expect(p.title.startsWith(`الوضعية التدريبية ${i + 1} —`), p.title).toBe(true));
    // the final situation (150 cans / 150 cakes / 11 250 DA ; 24 / 30 / 2 100 DA) must stay unseen
    for (const p of PROBLEMS) {
      const text = JSON.stringify(p);
      expect(text, p.id).not.toMatch(/11250|11 250|2100|2 100/);
      expect(text, p.id).not.toMatch(/150 علبة|حفل البلدية|علب العصير/);
    }
  });

  it('no sub-step is an assessment: mastery comes from module 8 only; each training is a platform addition', () => {
    for (const p of PROBLEMS) {
      expect(p.source).toEqual({ type: 'platform_addition', reason: 'exam_style_problem' });
      for (const part of p.parts) for (const s of part.steps) expect(s.assessment, p.id).toBeUndefined();
    }
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

  it('every situation is its own world: distinct tone, a drawn support, 2 to 4 parts, a statement with numbers', () => {
    expect(new Set(PROBLEMS.map((p) => p.tone)).size).toBe(6);
    for (const p of PROBLEMS) {
      expect(p.illustration, p.id).toBeTruthy();
      expect(p.parts.length, p.id).toBeGreaterThanOrEqual(2);
      expect(p.parts.length, p.id).toBeLessThanOrEqual(4);
      expect(p.statement, p.id).toMatch(/\d/);
      // « جملة معادلتين » : at least one step asks for the system itself
      expect(p.parts[0].asks[0], p.id).toBe('جملة المعادلتين');
    }
  });

  it('the Arabic statements keep a woven value (rule 1: one clause of a good value per story)', () => {
    const VALUES = {
      'wadiya-1': 'تكافلًا', 'wadiya-2': 'بروح التعاون', 'wadiya-3': 'إتقان عمله', 'wadiya-4': 'حبًّا للوطن',
      'wadiya-5': 'نظافة المحيط', 'wadiya-6': 'برّه',
    };
    for (const [id, clause] of Object.entries(VALUES)) expect(PROBLEM[id].statement, id).toContain(clause);
  });

  it('every written equality is true (explain, lines, prompts, correct options) — letters read at the solution of their part', () => {
    const holes = [];
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part, k) => {
      const env = ENV[p.id][k] ?? ENV[p.id][0];
      for (const text of truthsOf(part)) for (const chain of equalityChains(text)) {
        if (chain.some((side) => side === '' || side.includes('…'))) { holes.push(`${p.id}: ${chain.join(' = ')}`); continue; }
        if (!chain.every(balanced)) continue; // « ($20 + 20 = 40$) » : a chain cut by its own parentheses
        // a part whose letters are not the part-1 unknowns carries its own ENV; a chain of the other part is skipped by name
        let values;
        try { values = chain.map((side) => evaluate(substitute(side, env))); } catch (e) { holes.push(`${p.id} ${part.label}: unreadable « ${chain.join(' = ')} » (${e.message})`); continue; }
        for (const v of values) expect(near(v, values[0]), `${p.id} ${part.label}: « ${chain.join(' = ')} » → ${values.join(' ; ')}`).toBe(true);
        checked += 1;
      }
    });
    // only the blanks of the prompts (« … ») are allowed holes
    expect(holes.filter((h) => !h.includes('…'))).toEqual([]);
    expect(checked).toBeGreaterThan(120);
  });

  it('the equality reader really reads (self-check)', () => {
    expect(evaluate(substitute('5x + 8(40 - x)', { x: 24, y: 16 }))).toBe(248);
    expect(evaluate(substitute('0.9(6x + 5y)', { x: 30, y: 50 }))).toBeCloseTo(387, 9);
    expect(equalityChains('نجد $5 \\times 24 + 8 \\times 16 = 120 + 128 = 248$').flat()).toEqual(['5 * 24 + 8 * 16', '120 + 128', '248']);
    expect(near(evaluate('60 * 3 + 30'), 211)).toBe(false);
  });

  // ── Chaque système, résolu ici, redonne les nombres attendus ───────────────
  it('وضعية 1 — 40 baskets, 248 kg: 24 small and 16 large; the proposal (20 ; 20) is NOT a solution', () => {
    const { x, y } = solve([1, 1, 40], [5, 8, 248]);
    expect([x, y]).toEqual([24, 16]);
    expect(expectedOf('wadiya-1', 0)).toEqual([320 - 248, x, y]);
    expect(answersOf('wadiya-1', 0)).toEqual([x, y]);
    expect(5 * 20 + 8 * 20).toBe(260);
    expect(expectedOf('wadiya-1', 1)).toEqual([260]);
    expect(260).not.toBe(248);
    expect(20 + 20).toBe(40); // it satisfies the FIRST equation only — the trap
  });

  it('وضعية 2 — 24 baskets, 52 points: 20 + 4; the referee\'s 80 points gives a negative solution', () => {
    const { x, y } = solve([1, 1, 24], [2, 3, 52]);
    expect([x, y]).toEqual([20, 4]);
    expect(expectedOf('wadiya-2', 0)).toEqual([2 * 24, y, x]);
    expect(answersOf('wadiya-2', 0)).toEqual([y, x]);
    const second = solve([1, 1, 24], [2, 3, 80]);
    expect(second).toEqual({ x: -8, y: 32 });
    expect(expectedOf('wadiya-2', 1)).toEqual([second.y]);
    expect(second.x).toBeLessThan(0); // the interpretation step
    expect(second.y).toBeGreaterThan(24); // more 3-pointers than baskets
  });

  it('وضعية 3 — 50 planks, 48 hours: 8 tables and 6 chairs; income 57000, planks 40000, profit 17000', () => {
    const { x, y } = solve([4, 3, 50], [3, 4, 48]);
    expect([x, y]).toEqual([8, 6]);
    expect(expectedOf('wadiya-3', 0)).toEqual([3 * 48, 4 * 50 - 3 * 48, x, y]);
    const income = x * 6000 + y * 1500;
    const planks = 50 * 800;
    expect(expectedOf('wadiya-3', 1)).toEqual([x * 6000, income, planks, income - planks]);
    expect([income, planks, income - planks]).toEqual([57000, 40000, 17000]);
    // all the planks and all the hours are used: nothing is left
    expect(4 * x + 3 * y).toBe(50);
    expect(3 * x + 4 * y).toBe(48);
    // the swapped readings of the options give other pairs
    expect(solve([3, 4, 50], [4, 3, 48])).not.toEqual({ x, y });
  });

  // renumbered on 2026-11-12 (the synthesis's role scan: the large flag cost 50 دج, a price FOUND by the challenge — the cake piece)
  it('وضعية 4 — flags: 30 and 60 دج, 10% off (0.9), then 27 and 54 دج and a 1080 دج order', () => {
    const before = 432 / 0.9;
    expect(near(before, 480)).toBe(true);
    const { x, y } = solve([4, 3, 300], [6, 5, Math.round(before)]);
    expect([x, y]).toEqual([30, 60]);
    expect(expectedOf('wadiya-4', 0)).toEqual([480, 2 * 480, y, x]);
    expect(near(0.9 * (6 * x + 5 * y), 432)).toBe(true);
    // ×3 and ×2 give equal coefficients of x
    expect([3 * 4, 2 * 6, 3 * 300, 2 * 480, 2 * 480 - 3 * 300]).toEqual([12, 12, 900, 960, 60]);
    const [small, big] = [x * 0.9, y * 0.9];
    expect([small, big]).toEqual([27, 54]);
    expect(expectedOf('wadiya-4', 1)).toEqual([small, big, 20 * small, 20 * small + 10 * big]);
    expect(20 * small + 10 * big).toBe(1080);
  });

  it('وضعية 5 — the garden: perimeter 140 m, length = width + 10: 40 m × 30 m; fence 49000 DA, 300 bags', () => {
    const { x, y } = solve([2, 2, 140], [1, -1, 10]);
    expect([x, y]).toEqual([40, 30]);
    expect(expectedOf('wadiya-5', 0)).toEqual([140 / 2, 70 - 10, y, x]);
    expect(expectedOf('wadiya-5', 1)).toEqual([140 * 350, x * y, (x * y) / 4]);
    expect(Number.isInteger((x * y) / 4)).toBe(true);
    expect(2 * x + 2 * y).toBe(140);
  });

  it('وضعية 6 — ages 40 and 10 (35 = 7 × 5 five years ago); the gift: 3000 and 1800 DA', () => {
    const ages = solve([1, 1, 50], [1, -7, -30]); // x − 5 = 7(y − 5) ⇔ x − 7y = −30
    expect(ages).toEqual({ x: 40, y: 10 });
    expect(ages.x - 5).toBe(7 * (ages.y - 5));
    expect(expectedOf('wadiya-6', 0)).toEqual([30, 80, ages.y, ages.x]);
    const gift = solve([1, 1, 4800], [1, -2, -600]); // x = 2y − 600 ⇔ x − 2y = −600
    expect(gift).toEqual({ x: 3000, y: 1800 });
    expect(expectedOf('wadiya-6', 1)).toEqual([4800 + 600, gift.y, gift.x]);
    // the wrong readings of the options are really different pairs
    expect(solve([1, 1, 50], [1, -7, 0])).not.toEqual(ages); // x = 7y today
    expect(solve([1, 1, 50], [1, -7, 0]).y).not.toBe(10);
  });

  it('the statements keep their own numbers (the illustration test checks the drawings)', () => {
    const has = (id, ...nums) => nums.forEach((n) => expect(PROBLEM[id].statement, `${id} ${n}`).toContain(String(n)));
    has('wadiya-1', 40, 5, 8, 248);
    has('wadiya-2', 24, 52, 60);
    has('wadiya-3', 4, 3, 50, 48, 6000, 1500, 800);
    has('wadiya-4', 4, 3, 300, 6, 5, 432, '10%');
    has('wadiya-5', 140, 10, 350, 4);
    has('wadiya-6', 4800, 50, 5, 7, 600);
  });
});
