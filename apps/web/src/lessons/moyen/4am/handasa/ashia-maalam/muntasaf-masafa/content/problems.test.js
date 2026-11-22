import { describe, it, expect } from 'vitest';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Géométrie EXACTE en entiers : milieu (×2 pour rester entier), carré de la distance, racine simplifiée. ──
const mid2 = ([xa, ya], [xb, yb]) => [xa + xb, ya + yb]; // 2 × les coordonnées du milieu
const mid = (a, b) => { const [x, y] = mid2(a, b); expect(x % 2 === 0 && y % 2 === 0).toBe(true); return [x / 2, y / 2]; };
const dist2 = ([xa, ya], [xb, yb]) => (xb - xa) ** 2 + (yb - ya) ** 2;
/** n = a² × b avec b sans facteur carré : √n = a√b. */
const simplifySqrt = (n) => { let a = 1; let b = n; for (let k = 2; k * k <= b; k += 1) while (b % (k * k) === 0) { b /= k * k; a *= k; } return [a, b]; };
const isqrt = (n) => { const r = Math.round(Math.sqrt(n)); return r * r === n ? r : null; };
/** Le symétrique : M milieu de [A A′] ⇔ A′ = 2M − A. */
const symmetric = ([xa, ya], [xm, ym]) => [2 * xm - xa, 2 * ym - ya];

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choicesOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const correctOf = (id, part, k) => { const s = choicesOf(id, part)[k]; return s.options[s.correct]; };
const ptTex = (name, [x, y]) => `$${name}(${x}\\,;\\,${y})$`;
const surdTex = ([a, b]) => (b === 1 ? `$${a}$` : `$${a === 1 ? '' : a}\\sqrt{${b}}$`);

// ── Vérificateur des RELATIONS écrites (statement, prompt, explain, options, lines) ──
// Chaque formule $…$ est découpée sur = < > \neq \approx ; chaque membre purement numérique (entiers, décimaux 2{,}24,
// \dfrac, \sqrt, ^2, ×, ÷, +, −, parenthèses, produit implicite 3\sqrt{5}) est évalué, et chaque relation entre deux
// membres numériques VOISINS est vérifiée. Les membres qui contiennent une lettre (x_I, AB, MT…) sont ignorés.
function evalExpr(src) {
  const s = src
    .replace(/\\,/g, '')
    .replace(/\{,\}/g, '.')
    .replace(/\\dfrac/g, 'F')
    .replace(/\\sqrt/g, 'R')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\s+/g, '');
  if (s === '' || !/^[\d.+\-*/()^{}FR]+$/.test(s)) return null;
  let i = 0;
  const fail = () => { throw new Error(`cannot parse « ${src} »`); };
  const group = () => { if (s[i] !== '{') fail(); i += 1; const v = sum(); if (s[i] !== '}') fail(); i += 1; return v; };
  const primary = () => {
    if (s[i] === '(') { i += 1; const v = sum(); if (s[i] !== ')') fail(); i += 1; return v; }
    if (s[i] === 'F') { i += 1; const n = group(); const d = group(); return n / d; }
    if (s[i] === 'R') { i += 1; return Math.sqrt(group()); }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i += 1;
    if (i === j) fail();
    return Number(s.slice(j, i));
  };
  const power = () => {
    let v = primary();
    if (s[i] === '^') { i += 1; const e = s[i] === '{' ? group() : primary(); v **= e; }
    // produit implicite : 3\sqrt{5}, 2(…)
    while (s[i] === 'R' || s[i] === '(' || s[i] === 'F') v *= power();
    return v;
  };
  const unary = () => { if (s[i] === '-') { i += 1; return -unary(); } return power(); };
  const prod = () => { let v = unary(); while (s[i] === '*' || s[i] === '/') { const op = s[i]; i += 1; const w = unary(); v = op === '*' ? v * w : v / w; } return v; };
  function sum() { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i]; i += 1; const w = prod(); v = op === '+' ? v + w : v - w; } return v; }
  const v = sum();
  return i === s.length ? v : null;
}
const close = (x, y) => Math.abs(x - y) < 1e-9;
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|<|>|\\neq|\\approx|\\leq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const ok = { '=': close(x, y), '<': x < y, '>': x > y, '\\neq': !close(x, y), '\\leq': x <= y + 1e-9, '\\approx': Math.abs(x - y) <= 0.005 * Math.abs(y) }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked += 1;
    }
  }
  return checked;
}
/** Les textes où un point nommé « $X(a\,;\,b)$ » doit être le VRAI point (jamais les distracteurs). */
const trueTextsOf = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.steps.flatMap((s) => [
  s.prompt, s.explain, ...(s.lines ?? []), s.kind === 'choice' ? s.options[s.correct] : null,
])])].filter(Boolean);
const allTextsOf = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
function checkPoints(p, pts) {
  let checked = 0;
  for (const t of trueTextsOf(p)) {
    for (const [, name, x, y] of String(t).matchAll(/\$([A-Z])\((-?\d+)\\,;\\,(-?\d+)\)\$/g)) {
      expect(pts[name], `${p.id}: point ${name} inconnu`).toBeDefined();
      expect([Number(x), Number(y)], `${p.id}: ${name}(${x} ; ${y})`).toEqual(pts[name]);
      checked += 1;
    }
  }
  return checked;
}

// ── Les points des trois مسائل, posés UNE fois ; tout le reste en est déduit ──
const P1 = { A: [-3, -2], B: [5, 4] };               // GPS, unité 100 m
P1.I = mid(P1.A, P1.B);
P1.C = [P1.I[0], P1.A[1]];                            // la marche : horizontale d'abord
const P2 = { A: [-2, 5], B: [6, -1], F: [5, 6], G: [7, 4] }; // مشتتان, unité 100 m
P2.I = mid(P2.A, P2.B);
const P3 = { M: [-2, 3], T: [4, 0] };                // établissements, unité 200 m
P3.K = symmetric(P3.M, P3.T);

describe('les مسائل du درس 3 (unité 12) « إحداثيتا منتصف قطعة مستقيم والمسافة بين نقطتين »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p), p.id).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [5, '05', 'masala-1', 'practice_lab', 8], [6, '06', 'masala-2', 'practice_lab', 8], [7, '07', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(74);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('the figures are valid, readable, drawn on the statement coordinates — and never show the point to find', () => {
    const cases = [['masala-1', P1, ['I', 'C']], ['masala-2', P2, ['I']], ['masala-3', P3, ['K']]];
    for (const [id, pts, hidden] of cases) {
      const fig = PROBLEM[id].figure;
      expect(validateGeoFigure(fig), id).toEqual([]);
      expect(figureQuality(fig), id).toEqual([]);
      expect(fig.grid && fig.axes, id).toBeTruthy();
      expect(fig.points.O).toEqual([0, 0]);
      for (const [n, xy] of Object.entries(fig.points)) if (n !== 'O') expect(xy, `${id} ${n}`).toEqual(pts[n]);
      for (const n of hidden) expect(fig.points[n], `${id} ${n}`).toBeUndefined();
    }
  });

  it('every named point written in the texts is the true point', () => {
    expect(checkPoints(PROBLEM['masala-1'], P1)).toBeGreaterThanOrEqual(6);
    expect(checkPoints(PROBLEM['masala-2'], P2)).toBeGreaterThanOrEqual(6);
    expect(checkPoints(PROBLEM['masala-3'], P3)).toBeGreaterThanOrEqual(4);
  });

  it('every written equality / inequality evaluates true', () => {
    let n = 0;
    for (const p of PROBLEMS) for (const [k, t] of allTextsOf(p).entries()) n += checkText(t, `${p.id} #${k}`);
    expect(n).toBeGreaterThan(60);
  });

  it('the checker catches a wrong number (mutation)', () => {
    expect(() => checkText('$\\sqrt{45} = \\sqrt{9 \\times 5} = 3\\sqrt{6}$', 'mutant')).toThrow();
    expect(() => checkText('$(5 - (-3))^2 + (4 - (-2))^2 = 8^2 + 6^2 = 64 + 35$', 'mutant')).toThrow();
    expect(() => checkText('$6 \\times 2{,}24 = 13{,}44$ و $13{,}44 \\times 200 = 2668$', 'mutant')).toThrow();
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const { A, B, I, C } = P1;
    const ab2 = dist2(A, B); const ab = isqrt(ab2);
    expect(ab).not.toBeNull();
    expect(expectedOf('masala-1', 0)).toEqual([I[0], I[1]]);
    expect(correctOf('masala-1', 0, 1)).toBe(ptTex('I', I));
    expect(expectedOf('masala-1', 1)).toEqual([ab2, ab, ab * 100, (ab * 100) / 2]);
    expect(isqrt(dist2(A, I))).toBe(ab / 2);
    const ac = C[0] - A[0]; const ci = I[1] - C[1];
    expect(correctOf('masala-1', 2, 0)).toBe(ptTex('C', C));
    expect(expectedOf('masala-1', 2)).toEqual([ac, ci, (ac + ci) * 100, ((ac + ci) * 100) / 70]);
    expect(((ac + ci) * 100) % 70).toBe(0);
    expect(ac + ci).toBeGreaterThan(ab / 2); // le درج est plus long que le vrai chemin
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const { A, B, F, G, I } = P2;
    const ia = isqrt(dist2(I, A));
    expect(ia).not.toBeNull();
    expect(isqrt(dist2(I, B))).toBe(ia);
    expect(expectedOf('masala-2', 0)).toEqual([I[0], I[1], ia, ia * 100]);
    expect(correctOf('masala-2', 0, 0)).toBe(ptTex('I', I));
    // F est à la même distance de I ; G plus loin, distance irrationnelle et non simplifiable
    expect(isqrt(dist2(I, F))).toBe(ia);
    const ig2 = dist2(I, G);
    expect(ig2).toBeGreaterThan(ia * ia);
    expect(isqrt(ig2)).toBeNull();
    expect(simplifySqrt(ig2)).toEqual([1, ig2]);
    expect(expectedOf('masala-2', 1)).toEqual([isqrt(dist2(I, F)), ig2]);
    expect(correctOf('masala-2', 1, 1)).toBe(surdTex(simplifySqrt(ig2)));
    expect(correctOf('masala-2', 1, 2)).toMatch(/^المزرعة \$F\$ فقط/);
    const canals = 3; // A, B et F
    expect(expectedOf('masala-2', 2)).toEqual([canals * ia * 100, canals * ia * 100 * 900]);
    expect(correctOf('masala-2', 2, 0)).toBe(`$${canals} \\times ${ia * 100}$`);
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    const { M, T, K } = P3;
    const mt2 = dist2(M, T);
    expect(expectedOf('masala-3', 0)).toEqual([mt2]);
    const [a, b] = simplifySqrt(mt2);
    expect(b).toBe(5); // la forme a√5 demandée
    expect(correctOf('masala-3', 0, 1)).toBe(surdTex([a, b]));
    expect(expectedOf('masala-3', 1)).toEqual([K[0], K[1]]);
    expect(mid(M, K)).toEqual(T);
    expect(correctOf('masala-3', 1, 1)).toBe(ptTex('K', K));
    const mk = simplifySqrt(dist2(M, K));
    expect(mk).toEqual([2 * a, b]);
    expect(correctOf('masala-3', 1, 2)).toBe(surdTex(mk));
    // √5 ≈ 2,24 (énoncé) : longueur en m, calculée en centièmes pour rester exacte
    const lengthM = (mk[0] * 224 * 200) / 100;
    expect(Number.isInteger(lengthM)).toBe(true);
    expect(Math.abs(lengthM - mk[0] * Math.sqrt(5) * 200)).toBeLessThan(0.005 * lengthM);
    expect(expectedOf('masala-3', 2)).toEqual([lengthM, lengthM * 2500]);
  });

  it('each problem has a numeric decoy among its useless data', () => {
    for (const p of PROBLEMS) {
      const useless = p.data.filter((d) => !d.useful);
      expect(useless.length, p.id).toBeGreaterThanOrEqual(1);
      expect(useless.some((d) => /\d/.test(d.text)), p.id).toBe(true);
      expect(p.data.filter((d) => d.useful).length, p.id).toBeGreaterThanOrEqual(4);
      for (const d of p.data) expect(d.text, `${p.id} ${d.id}`).not.toMatch(/\$/);
    }
  });
});
