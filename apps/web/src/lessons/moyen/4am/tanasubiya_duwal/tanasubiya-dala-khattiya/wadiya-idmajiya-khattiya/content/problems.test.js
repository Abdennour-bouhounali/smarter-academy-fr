import { describe, it, expect } from 'vitest';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { validateIllustration } from '../../../../../../common/problems/problemIllustration';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Helpers ────────────────────────────────────────────────────────────────
const steps = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => steps(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const correctOf = (id, part, k) => { const s = steps(id, part).filter((x) => x.kind === 'choice')[k]; return s.options[s.correct]; };
/** Décimaux EXACTS : on compare en centièmes entiers (0,85 → 85), jamais en flottants. */
const c = (v) => Math.round(v * 100);
const dec = (s) => Number(String(s).replace(',', '.'));

// ── Évaluateur des formules écrites ($…$) ─────────────────────────────────────
// Nombres (décimaux 0{,}85), + − × ÷, \frac / \dfrac, carrés n^2, \sqrt{carré parfait}, parenthèses ;
// une formule est découpée sur = < > ≤ ≥ ≠ ≈ ; une lettre sans valeur rend le membre « non numérique »
// (ignoré). Renvoie le nombre de maillons numériques vérifiés.
function evalExpr(src, vars = {}) {
  let s = src
    .replace(/\{,\}/g, '.')
    .replace(/\\left|\\right/g, '')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\\sqrt\{(\d+)\}/g, (_, n) => (Number.isInteger(Math.sqrt(Number(n))) ? String(Math.sqrt(Number(n))) : 'NaN'))
    .replace(/(\d+(?:\.\d+)?)\^2/g, '($1*$1)')
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\s+/g, '');
  if (s === '' || !/^[\d.+\-*/()x]+$/.test(s)) return null;
  if (s.includes('x') && vars.x == null) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '-') { i++; return -atom(); }
    if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`bad ( in ${src}`); i++; return v; }
    if (s[i] === 'x') { i++; return vars.x; }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    if (i === j) throw new Error(`bad token in ${src}`);
    return Number(s.slice(j, i));
  };
  const implicit = () => { let v = atom(); while (s[i] === '(' || s[i] === 'x') v *= atom(); return v; };
  const prod = () => { let v = implicit(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = implicit(); v = op === '*' ? v * w : v / w; } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
const EPS = 1e-9;
const REL = {
  '=': (a, b) => Math.abs(a - b) < EPS,
  '<': (a, b) => a < b - EPS,
  '>': (a, b) => a > b + EPS,
  '≤': (a, b) => a <= b + EPS,
  '≥': (a, b) => a >= b - EPS,
  '≠': (a, b) => Math.abs(a - b) > EPS,
  '≈': (a, b) => Math.abs(a - b) < 0.006, // arrondi au centième
};
/** Vérifie chaque maillon NUMÉRIQUE des formules d'un texte ; renvoie le nombre de maillons vérifiés. */
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const g = f.replace(/\\leq?(?![a-z])/g, '≤').replace(/\\geq?(?![a-z])/g, '≥').replace(/\\neq/g, '≠').replace(/\\approx/g, '≈');
    const parts = g.split(/(=|<|>|≤|≥|≠|≈)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [a, b] = [evalExpr(parts[k - 1]), evalExpr(parts[k + 1])];
      if (a == null || b == null) continue;
      expect(REL[parts[k]](a, b), `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}
/** x vérifie-t-il l'équation écrite « $… = …$ » ? */
const solves = (formula, x) => {
  const [l, r] = formula.replace(/^\$|\$$/g, '').split('=');
  return Math.abs(evalExpr(l, { x }) - evalExpr(r, { x })) < EPS;
};
const textsOf = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);

describe('les six وضعيات d\'entraînement de أدمج تعلّماتي (wadiya-idmajiya-khattiya, unité 6)', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    for (const p of PROBLEMS) if (p.illustration) expect(validateIllustration(p.illustration)).toEqual([]);
  });

  it('match their modules (1 to 6, practice_lab, then 7 analysis and the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual(
      [1, 2, 3, 4, 5, 6].map((k) => [k, `0${k}`, `wadiya-${k}`, 'practice_lab']),
    );
    expect(LESSON_CONFIG.modules.map((m) => [m.number, m.id, m.slug])).toEqual([
      [0, '00', 'astaidd'], [1, '01', 'wadiya-1'], [2, '02', 'wadiya-2'], [3, '03', 'wadiya-3'], [4, '04', 'wadiya-4'],
      [5, '05', 'wadiya-5'], [6, '06', 'wadiya-6'], [7, '07', 'al-wadiya'], [8, '08', 'itqan'],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ stage: 'evaluation', title: 'وضعية الاختبار النهائي' });
    expect(LESSON_CONFIG.modules.slice(7, 8).every((m) => m.stage === 'practice_lab' && m.track === undefined)).toBe(true);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(LESSON_CONFIG.lessonProblem).toBeUndefined();
    expect(PROBLEMS.map((p) => p.id)).toEqual(problemModules.map((m) => m.slug));
    const situations = LESSON_CONFIG.resources.filter((r) => /^wadiya-\d$/.test(r.code));
    expect(situations.map((r) => [r.code, r.module])).toEqual([1, 2, 3, 4, 5, 6].map((k) => [`wadiya-${k}`, k]));
    // the old modules 1–4 moved to 7–10, then 8–9 were removed (unit-1 format) : the resources that named module 1 now name module 7
    expect(LESSON_CONFIG.resources.filter((r) => r.code === 'situation-misad-hawai' || r.type === 'origin-line').every((r) => r.module === 7)).toBe(true);
  });

  it('every training module is titled « الوضعية التدريبية N », is a platform addition, and never uses the cable-car numbers of the test', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    problemModules.forEach((m, i) => expect(m.title.startsWith(`الوضعية التدريبية ${i + 1} —`), m.title).toBe(true));
    PROBLEMS.forEach((p, i) => {
      expect(p.title.startsWith(`الوضعية التدريبية ${i + 1} —`), p.title).toBe(true);
      expect(p.source.type, p.id).toBe('platform_addition');
      expect(p.tone, p.id).toBeTruthy();
    });
    expect(new Set(PROBLEMS.map((p) => p.tone)).size).toBe(6);
    // the evaluated situation (cable car 900 m → 1400 m, AH = 2500 m, 5,5 m/s, −40 %, 2000 DA, 3,8x, 526 DA) stays unseen
    for (const p of PROBLEMS) expect(JSON.stringify(p), p.id).not.toMatch(/(?<![\d,.])(2500|1400|900|526|2000)(?![\d])|3[,.]8|5[,.]5|\\sqrt\{26\}/);
  });

  it('no sub-step is an assessment, and every `requires` is a priorKnowledge point (modules 1-6 precede the bricks)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) {
      expect(s.assessment, p.id).toBeUndefined();
      for (const r of s.requires ?? []) expect(LESSON_CONFIG.priorKnowledge, `${p.id}: ${r}`).toContain(r);
    }
  });

  it('every demand has its own answer (owner rule 2026-10-06), and each situation has 2-4 parts and a drawn support', () => {
    for (const p of PROBLEMS) {
      expect(p.parts.length, p.id).toBeGreaterThanOrEqual(2);
      expect(p.parts.length, p.id).toBeLessThanOrEqual(4);
      expect(Boolean(p.figure || p.visual || p.table || p.scene || p.illustration), `${p.id} support`).toBe(true);
      for (const part of p.parts) {
        expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question));
        part.asks.forEach((_, k) => {
          expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
        });
      }
    }
  });

  it('an illustration shows only numbers of the statement', () => {
    for (const p of PROBLEMS.filter((x) => x.illustration)) {
      const il = JSON.stringify({ ...p.illustration, ariaLabel: '' });
      for (const n of il.match(/\d+(?:\.\d+)?/g) ?? []) {
        if (n === '0.3' || n === '0.8') continue; // tank levels (layout), not a quantity
        expect(p.statement, `${p.id}: ${n}`).toContain(n.replace('.', ','));
      }
    }
  });

  it('no bare formula in the Arabic prose — every formula is a $…$ island', () => {
    for (const p of PROBLEMS) for (const t of textsOf(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/[A-Za-z=<>+×÷√²\\]|\d\s*\/\s*\d/);
      expect(t.split('$').length % 2, `${p.id}: unbalanced $ in ${t}`).toBe(1);
      expect(t, `${p.id}: « DA » in Arabic`).not.toMatch(/\bDA\b/);
    }
  });

  it('every numeric equality written in explains, options and solutions is TRUE', () => {
    let checked = 0;
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) {
      for (const t of [s.explain, ...(s.lines ?? []), ...(s.options ?? [])].filter(Boolean)) checked += checkText(t, `${p.id} ${part.label}`);
    }
    expect(checked).toBeGreaterThan(90);
  });

  it('the equality reader really reads (self-check)', () => {
    expect(checkText('$12^2 + 5^2 = 144 + 25 = 169$', 'self')).toBe(2);
    expect(checkText('$L = \\sqrt{169} = 13$', 'self')).toBe(1);
    expect(checkText('$340x \\leq 6000$', 'self')).toBe(0); // letter: skipped
    expect(() => checkText('$17 \\times 340 = 5781$', 'self')).toThrow();
  });

  // ── Chaque nombre attendu, recalculé depuis l'énoncé ─────────────────────
  it('وضعية 1 — the bags table: coefficient 1500, f(18), the antecedent of 33000, g is not linear', () => {
    const { head, rows } = PROBLEM['wadiya-1'].table;
    const xs = head.slice(1).map(dec), ys = rows[0].slice(1).map(dec);
    const q = ys.map((y, k) => y / xs[k]);
    expect(new Set(q).size).toBe(1);
    const a = q[0];
    expect(a).toBe(1500);
    expect(expectedOf('wadiya-1', 0)).toEqual([ys[0] / xs[0], ys[1] / xs[1], a]);
    expect(expectedOf('wadiya-1', 1)).toEqual([a * 18, 33000 / a]);
    expect(a * 22).toBe(33000);
    expect(correctOf('wadiya-1', 1, 0)).toBe('$1500x = 33000$');
    expect(solves(correctOf('wadiya-1', 1, 0), 22)).toBe(true);
    const g = (x) => a * x + 3000;
    expect(PROBLEM['wadiya-1'].parts[2].question).toContain('3000');
    expect(expectedOf('wadiya-1', 2)).toEqual([g(10), g(20)]);
    expect(g(10) / 10).not.toBe(g(20) / 20); // the quotient is not constant: g is not linear
    expect([g(10) / 10, g(20) / 20]).toEqual([1800, 1650]);
  });

  it('وضعية 2 — the book fair: 0,85x against x − 150, the crossover at 1000', () => {
    const p = (x) => 0.85 * x, q = (x) => x - 150;
    expect(expectedOf('wadiya-2', 1).map(c)).toEqual([c(p(1200)), c(q(1200)), c(800)]);
    expect(c(p(800))).toBe(c(680)); // the other book: 0,85 × 800 = 680
    expect(expectedOf('wadiya-2', 2).map(c)).toEqual([c(p(600)), c(q(600)), c(p(1500)), c(q(1500))]);
    expect(q(600)).toBeLessThan(p(600)); // «ب» is better for the cheap book…
    expect(p(1500)).toBeLessThan(q(1500)); // …«أ» for the dear one
    expect(c(p(1000))).toBe(c(q(1000))); // and they are equal at 1000 DA
    expect(correctOf('wadiya-2', 0, 0)).toBe('$0{,}85x$');
    expect(correctOf('wadiya-2', 0, 1)).toBe('$x - 150$');
    expect(q(0)).not.toBe(0); // q is not linear
  });

  it('وضعية 3 — Saad: the graph through O and A(6 ; 480), 80 m/min, 4,8 km/h, 15 min', () => {
    const v = PROBLEM['wadiya-3'].visual;
    const [line] = v.functions, [A] = v.points;
    expect(line.b).toBe(0);
    expect(line.a * A.x).toBe(A.y);
    expect([A.x, A.y]).toEqual([6, 480]);
    const a = A.y / A.x;
    expect(a).toBe(line.a);
    const hour = a * 60;
    expect(expectedOf('wadiya-3', 0)).toEqual([a]);
    expect(expectedOf('wadiya-3', 1)).toEqual([hour, hour / 1000, a * 9]);
    expect(hour / 1000).toBe(4.8);
    const school = 1.2 * 1000;
    expect(expectedOf('wadiya-3', 2)).toEqual([school, school / a]);
    expect(school / a).toBe(15);
    expect(20 - school / a).toBe(5);
    expect(school).toBeLessThanOrEqual(v.range.yMax);
    expect(school / a).toBeLessThanOrEqual(v.range.xMax);
    // the frame fits in 460 px
    expect((v.range.xMax - v.range.xMin) * v.unit).toBeLessThanOrEqual(460);
    expect((v.range.yMax - v.range.yMin) * v.unitY).toBeLessThanOrEqual(460);
    expect(solves(correctOf('wadiya-3', 2, 0).replace(/t/g, 'x'), 15)).toBe(true);
  });

  it('وضعية 4 — the flagpole rope: 12 and 5 give 13 (Pythagoras), 340 DA a metre, 6000 DA budget', () => {
    const [h, b] = [12, 5], L = Math.sqrt(h * h + b * b);
    expect(L).toBe(13);
    expect(expectedOf('wadiya-4', 0)).toEqual([h * h + b * b, L]);
    const price = 340, f = (x) => price * x;
    expect(expectedOf('wadiya-4', 1)).toEqual([f(L)]);
    expect(f(L)).toBe(4420);
    const budget = 6000, max = Math.floor(budget / price);
    expect(max).toBe(17);
    expect(budget / price).toBeGreaterThan(17.6);
    expect(expectedOf('wadiya-4', 2)).toEqual([f(17), f(18), max]);
    expect(f(17)).toBeLessThanOrEqual(budget);
    expect(f(18)).toBeGreaterThan(budget); // the trap: round DOWN
    expect(max).toBeLessThan(2 * L);
    expect(max).toBeGreaterThan(L);
    const il = PROBLEM['wadiya-4'].illustration;
    expect([il.h, il.base]).toEqual([h, b]);
    expect(il.len).toBeUndefined(); // the rope is the unknown, not drawn as an answer
  });

  it('وضعية 5 — the well water: 40 mg/L, 120 g in the tank, 78 g and 26 mg/L after 35 %', () => {
    const [litres, grams, limit, tank] = [40, 1.6, 50, 3000];
    const mg = Math.round(grams * 1000);
    expect(mg).toBe(1600);
    const conc = mg / litres;
    expect(conc).toBe(40);
    expect(conc).toBeLessThan(limit);
    expect(expectedOf('wadiya-5', 0)).toEqual([mg, conc]);
    const m = (V) => conc * V;
    expect(expectedOf('wadiya-5', 1)).toEqual([m(tank), m(tank) / 1000]);
    expect(m(tank) / 1000).toBe(120);
    const left = (m(tank) / 1000) * (1 - 35 / 100);
    expect(c(left)).toBe(c(78));
    expect(expectedOf('wadiya-5', 2).map(c)).toEqual([c(78), c(78000), c(26)]);
    expect((78 * 1000) / tank).toBe(26);
    expect((78 * 1000) / tank).toBeLessThan(limit);
    const il = PROBLEM['wadiya-5'].illustration;
    expect(il.tanks.map((t) => t.value)).toEqual([litres, tank]);
  });

  it('وضعية 6 — the taxi: table A is NOT proportional (65, 50, 45), g(x) = 48x, the point (10 ; 480)', () => {
    const { head, rows } = PROBLEM['wadiya-6'].table;
    const km = head.slice(1).map(dec), pay = rows[0].slice(1).map(dec);
    const q = pay.map((y, k) => y / km[k]);
    expect(q).toEqual([65, 50, 45]);
    expect(new Set(q).size).toBeGreaterThan(1);
    expect(expectedOf('wadiya-6', 0)).toEqual([q[0], q[1]]);
    expect(PROBLEM['wadiya-6'].statement).toContain('48');
    const g = (x) => 48 * x;
    expect(c(g(12.5))).toBe(c(600));
    expect(expectedOf('wadiya-6', 1).map(c)).toEqual([c(g(12.5)), c(360 / 48)]);
    expect(360 / 48).toBe(7.5);
    expect(g(10)).toBe(480);
    expect(correctOf('wadiya-6', 2, 0)).toBe('$(10 ; 480)$');
    expect(expectedOf('wadiya-6', 2)).toEqual([pay[2], g(10)]);
    expect(pay[2]).toBeLessThan(g(10)); // «أ» is cheaper at 10 km…
    expect(g(2)).toBeLessThan(pay[0]); // …«ب» at 2 km
    expect(g(2)).toBe(96);
    expect(solves(correctOf('wadiya-6', 1, 1) ?? '$48x = 360$', 7.5)).toBe(true);
  });

  it('values woven in each context (one clause, numbers untouched)', () => {
    const clause = {
      'wadiya-1': /الخيرية|محتاجين/, 'wadiya-2': /المطالعة|يستفيد منها زملاؤه/, 'wadiya-3': /ألّا يتأخّر/,
      'wadiya-4': /الاستقلال|العلم الوطني/, 'wadiya-5': /النظافة والصحة/, 'wadiya-6': /بأمانة/,
    };
    for (const p of PROBLEMS) expect(p.statement, p.id).toMatch(clause[p.id]);
  });
});
