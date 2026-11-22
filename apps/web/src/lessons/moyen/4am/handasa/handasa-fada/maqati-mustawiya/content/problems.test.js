import { describe, it, expect } from 'vitest';
import * as SP from '@smarter-academy/core/arithmetic/space.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { validateSpaceFigure, spaceFigureQuality } from '../../../../../../common/components/spaceFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les مسائل du درس « المقاطع المستوية للمجسمات المألوفة » : contrat GuidedProblem, place dans le parcours, figures (valides,
 * lisibles, et conformes à l'énoncé : points recalculés), et SURTOUT chaque nombre recalculé — les sections par space.js
 * (`sphereSection`, `sectionDistance`, `cuboidSection`, `apexSection`, exacts), le reste en arithmétique exacte (fractions
 * d'entiers), et chaque égalité / inégalité écrite dans les explications, les options justes et les rédactions évaluée
 * (y compris les `\dfrac{a}{b}`).
 */
const numericOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric');
const expectedOf = (id, part) => numericOf(id, part).map((s) => s.expected);
const O = [0, 0, 0];

// ── Rationnels exacts ────────────────────────────────────────────────────────────────────────────────────────────────────
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const R = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };
const rAdd = (x, y) => R(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const rSub = (x, y) => R(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const rMul = (x, y) => R(x[0] * y[0], x[1] * y[1]);
const rDiv = (x, y) => R(x[0] * y[1], x[1] * y[0]);
const rPow = (x, e) => { let v = R(1); for (let k = 0; k < e; k += 1) v = rMul(v, x); return v; };
const rCmp = (x, y) => Math.sign(x[0] * y[1] - y[0] * x[1]);
const dec = (v) => { const [i, f = ''] = String(v).split('.'); return R(Number(i + f), 10 ** f.length); };
/** Un nombre (décimal JS) → rationnel exact. */
const Q = (x) => dec(String(x));
/** Une valeur exacte de space.js (fraction {n, d} ou surd {k, r}) → nombre. */
const num = (v) => Number(SP.lengthNumber(v));

// ── Vérificateur des formules $…$ : + − × ÷ ^ parenthèses, \dfrac{…}{…}, décimaux « 3{,}14 », unités ignorées. ──────────
function evalExpr(src) {
  let s = src.replace(/\\,\\mathrm\{[^}]*\}(\^\d)?/g, '').replace(/\{,\}/g, '.');
  for (let k = 0; k < 4; k += 1) s = s.replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))');
  s = s.replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\s+/g, '');
  if (!s || !/^[\d.+\-*/()^]+$/.test(s)) return null; // une lettre (OA, R, \sqrt…) : ce membre n'est pas numérique
  let i = 0;
  const atom = () => {
    let v;
    if (s[i] === '(') { i += 1; v = sum(); i += 1; } else {
      const j = i; while (/[\d.]/.test(s[i] ?? '')) i += 1;
      if (j === i) throw new Error(`bad number in ${src}`);
      v = dec(s.slice(j, i));
    }
    if (s[i] === '^') { i += 1; const j = i; while (/\d/.test(s[i] ?? '')) i += 1; v = rPow(v, Number(s.slice(j, i))); }
    return v;
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i]; i += 1; const w = atom(); v = op === '*' ? rMul(v, w) : rDiv(v, w); } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i]; i += 1; const w = prod(); v = op === '+' ? rAdd(v, w) : rSub(v, w); } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
const REL = { '=': (c) => c === 0, '<': (c) => c < 0, '>': (c) => c > 0, '\\le': (c) => c <= 0, '\\neq': (c) => c !== 0 };
/** Chaque couple de membres NUMÉRIQUES voisins d'une formule vérifie sa relation. Renvoie le nombre de relations vérifiées. */
function checkText(text) {
  let checked = 0;
  for (const [, f] of String(text ?? '').matchAll(/\$([^$]+)\$/g)) {
    if (f.includes('\\approx') || f.includes('\\perp')) continue;
    const tokens = f.split(/(\\neq|\\le|=|<|>)/);
    for (let k = 1; k + 1 < tokens.length; k += 2) {
      const a = evalExpr(tokens[k - 1]); const b = evalExpr(tokens[k + 1]);
      if (!a || !b) continue;
      expect(REL[tokens[k]](rCmp(a, b)), f).toBe(true);
      checked += 1;
    }
  }
  return checked;
}
const allTexts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
/** Les textes qui doivent être VRAIS : explications, options justes, rédactions. */
const trueTexts = (p) => p.parts.flatMap((part) => part.steps.flatMap((s) => [s.explain, ...(s.lines ?? []), s.kind === 'choice' ? s.options[s.correct] : null])).filter(Boolean);
const dist2 = (P, M) => P.reduce((t, x, k) => t + (x - M[k]) ** 2, 0);
const near = (a, b) => Math.abs(a - b) < 1e-9;

describe('les مسائل du درس « المقاطع المستوية للمجسمات المألوفة »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [5, '05', 'masala-1', 'practice_lab', 8], [6, '06', 'masala-2', 'practice_lab', 8], [7, '07', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(79);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('data: 4–5 useful items, and at least one useless item that is a number', () => {
    for (const p of PROBLEMS) {
      const useful = p.data.filter((d) => d.useful).length;
      expect(useful >= 4 && useful <= 5, p.id).toBe(true);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text.includes('$'), `${p.id} ${d.id}`).toBe(false);
    }
  });

  it('every statement shows its figure (« الشكل المقابل »): valid SpaceFigure, readable', () => {
    for (const p of PROBLEMS) {
      expect(p.statement, p.id).toMatch(/الشكل المقابل/);
      expect(p.figure.kind, p.id).toBe('space');
      expect(validateSpaceFigure(p.figure), p.id).toEqual([]);
      expect(spaceFigureQuality(p.figure), p.id).toEqual([]);
    }
  });

  it('the figures say what the statements say', () => {
    // مسألة 1 : sphère R = 6,5 ; A, B sur l'axe à 6 sous O et 5,2 au-dessus ; M, E sur la sphère dans (P), (Q) ; cercles cohérents.
    const f1 = PROBLEM['masala-1'].figure; const p1 = f1.points;
    expect(f1.solids[0].radius).toBe(6.5);
    expect(p1.A).toEqual([0, 0, -6]);
    expect(p1.B).toEqual([0, 0, 5.2]);
    for (const n of ['M', 'E']) expect(near(dist2(O, p1[n]), 6.5 ** 2), n).toBe(true);
    expect(p1.M[2]).toBe(p1.A[2]);
    expect(p1.E[2]).toBe(p1.B[2]);
    expect(f1.circles.map((c) => [c.center, c.radius])).toEqual([['A', 2.5], ['B', 3.9]]);
    for (const n of ['P1', 'P2', 'P3', 'P4']) expect(p1[n][2]).toBe(-6);
    for (const n of ['Q1', 'Q2', 'Q3', 'Q4']) expect(p1[n][2]).toBe(5.2);
    // مسألة 2 : pavé AB = 30, BC = 12, CG = 8 ; IJKL dans un plan x = cte (parallèle à BCGF) ; M ∈ [CD], N ∈ [CB], CM = 8, CN = 6.
    const p2 = PROBLEM['masala-2'].figure.points;
    expect([dist2(p2.A, p2.B), dist2(p2.B, p2.C), dist2(p2.C, p2.G)]).toEqual([900, 144, 64]);
    expect(new Set(['B', 'C', 'G', 'F'].map((n) => p2[n][0])).size).toBe(1);
    expect(new Set(['I', 'J', 'K', 'L'].map((n) => p2[n][0])).size).toBe(1);
    expect([dist2(p2.C, p2.M), dist2(p2.C, p2.N)]).toEqual([64, 36]);
    expect(p2.M[1] === p2.C[1] && p2.M[2] === p2.C[2]).toBe(true); // M sur [CD]
    expect(p2.N[0] === p2.C[0] && p2.N[2] === p2.C[2]).toBe(true); // N sur [CB]
    expect(p2.P).toEqual([p2.N[0], p2.N[1], 0]); // MNPQ vertical, parallèle à [CG]
    expect(p2.Q).toEqual([p2.M[0], p2.M[1], 0]);
    // مسألة 3 : SABCD régulière AB = 2, SA = 2,25 ; E = S + 2/5 (A − S), I = S + 3/5 (A − S), idem F, G, H et J, K, L.
    const p3 = PROBLEM['masala-3'].figure.points;
    expect(dist2(p3.A, p3.B)).toBe(4);
    for (const n of ['A', 'B', 'C', 'D']) expect(near(dist2(p3.S, p3[n]), 2.25 ** 2), n).toBe(true);
    const on = (V, t) => p3.S.map((x, k) => x + t * (V[k] - x));
    [['E', 'A'], ['F', 'B'], ['G', 'C'], ['H', 'D']].forEach(([n, V]) => on(p3[V], 0.4).forEach((x, k) => expect(near(x, p3[n][k]), n).toBe(true)));
    [['I', 'A'], ['J', 'B'], ['K', 'C'], ['L', 'D']].forEach(([n, V]) => on(p3[V], 0.6).forEach((x, k) => expect(near(x, p3[n][k]), n).toBe(true)));
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const Rr = '13/2';
    const st = LESSON_CONFIG.lessonProblem.statement;
    for (const t of ['$6{,}5\\,\\mathrm{cm}$', '$6\\,\\mathrm{cm}$', '$7{,}8\\,\\mathrm{cm}$', '$0{,}2\\,\\mathrm{mm}$', '15 ثانية']) expect(st).toContain(t);
    // 1) le plan (P) à h = 6 : un cercle (6 < 6,5) de rayon √(42,25 − 36) = 2,5
    const s1 = SP.sphereSection(Rr, 6);
    expect(s1.kind).toBe('circle');
    expect(expectedOf('masala-1', 0)).toEqual([num(s1.radius2), num(s1.radius)]);
    expect(num(s1.radius)).toBe(2.5);
    // 2) l'ouverture de diamètre 7,8 → rayon 3,9 → OB = √(42,25 − 15,21) = 5,2 ; à 7 cm, rien
    const rho = rDiv(Q(7.8), R(2));
    const h = SP.sectionDistance(Rr, '39/10');
    expect(expectedOf('masala-1', 1)).toEqual([rho[0] / rho[1], 27.04, num(h)]);
    expect(num(h)).toBe(5.2);
    expect(rCmp(rSub(rPow(Q(6.5), 2), rPow(Q(3.9), 2)), Q(27.04))).toBe(0);
    expect(SP.sphereSection(Rr, '26/5').kind).toBe('circle');
    expect(num(SP.sphereSection(Rr, '26/5').radius)).toBe(3.9);
    expect(SP.sphereSection(Rr, 7).kind).toBe('none');
    // 3) AB = 6 + 5,2 = 11,2 cm = 112 mm ; 112 ÷ 0,2 = 560 couches ; 560 × 15 s = 8400 s = 140 min
    const AB = rAdd(R(6), Q(5.2));
    const mm = rMul(AB, R(10));
    const layers = rDiv(mm, Q(0.2));
    const minutes = rDiv(rMul(layers, R(15)), R(60));
    expect(expectedOf('masala-1', 2)).toEqual([AB, mm, layers, minutes].map(([n, d]) => n / d));
    expect([layers, minutes].every(([, d]) => d === 1)).toBe(true);
    // le piège : la hauteur de la sphère entière (13) n'est pas celle de l'abat-jour
    expect(rCmp(AB, R(13))).toBe(-1);
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const block = { a: 30, b: 12, c: 8 };
    // 1) parallèle à BCGF (12 × 8) : 96 ; le piège 30 × 8 = 240
    const face = SP.cuboidSection(block, { parallelTo: 'face', face: 'bc' });
    expect(face.sides.map(num)).toEqual([12, 8]);
    expect(expectedOf('masala-2', 0)).toEqual([num(face.area)]);
    // 2) parallèle à [CG], CM = 8, CN = 6 : MN = 10, aire 80
    const edge = SP.cuboidSection(block, { parallelTo: 'edge', p: 8, q: 6 });
    expect(expectedOf('masala-2', 1)).toEqual([8 * 8 + 6 * 6, num(edge.sides[1]), num(edge.area)]);
    expect(num(edge.sides[0])).toBe(block.c);
    expect(8 <= 30 && 6 <= 12).toBe(true); // M et N sont bien sur les arêtes
    // 3) 30 ÷ 1,5 = 20 tranches identiques ; 3000 ÷ 20 = 150 دج
    const slices = rDiv(R(30), Q(1.5));
    expect(slices).toEqual([20, 1]);
    expect(expectedOf('masala-2', 2)).toEqual([20, 3000 / 20]);
    expect(3000 % 20).toBe(0);
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    const SA = Q(2.25); const AB = R(2);
    // la pyramide existe : SA² = h² + (AB/√2)² avec h = 1,75
    expect(rCmp(rPow(SA, 2), rAdd(rPow(Q(1.75), 2), R(2)))).toBe(0);
    // 1) k = SE/SA = 0,9/2,25 = 2/5 ; EF = 0,8
    const k1 = rDiv(Q(0.9), SA);
    expect(k1).toEqual([2, 5]);
    const s1 = SP.apexSection({ base: [2, 2], ratio: '2/5' });
    expect(s1.kind).toBe('square');
    expect(expectedOf('masala-3', 0)).toEqual([num(s1.sides[0])]);
    expect(rMul(k1, AB)).toEqual(Q(0.8));
    // 2) SI = 2,25 − 0,9 = 1,35 ; k = 3/5 ; IJ = 1,2 ; la ratio du ferronnier AI/SA = 2/5 redonne 0,8
    const SI = rSub(SA, Q(0.9));
    const k2 = rDiv(SI, SA);
    expect(k2).toEqual([3, 5]);
    const s2 = SP.apexSection({ base: [2, 2], ratio: '3/5' });
    expect(expectedOf('masala-3', 1)).toEqual([SI[0] / SI[1], num(s2.sides[0])]);
    expect(rDiv(Q(0.9), SA)).toEqual(k1);
    // 3) périmètres 3,2 et 4,8 ; total 8 ; 8 × 850 = 6800 دج
    const p1 = rMul(R(4), rMul(k1, AB)); const p2 = rMul(R(4), rMul(k2, AB));
    const total = rAdd(p1, p2);
    expect(expectedOf('masala-3', 2)).toEqual([p1, p2, total, rMul(total, R(850))].map(([n, d]) => n / d));
  });

  it('every equality / inequality written in explains, correct options and solutions is TRUE', () => {
    let checked = 0;
    for (const p of PROBLEMS) for (const t of trueTexts(p)) checked += checkText(t);
    expect(checked).toBeGreaterThan(40);
  });

  it('the checker catches a wrong number (mutation)', () => {
    expect(() => checkText('$6{,}5^2 - 6^2 = 42{,}25 - 36 = 6{,}35$')).toThrow();
    expect(() => checkText('$\\dfrac{0{,}9}{2{,}25} = \\dfrac{3}{5}$')).toThrow();
    expect(() => checkText('$7 < 6{,}5$')).toThrow();
  });

  it('no bare point name, « x² » or « a/b » in the Arabic prose', () => {
    for (const p of PROBLEMS) for (const t of allTexts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, t).not.toMatch(/[A-Z]/);
      expect(prose, t).not.toMatch(/\d\s*\/\s*\d|²|√|DA\b/);
    }
  });
});
