import { describe, it, expect } from 'vitest';
import * as SP from '@smarter-academy/core/arithmetic/space.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { validateSpaceFigure, spaceFigureQuality } from '../../../../../../common/components/spaceFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les مسائل du درس « التكبير والتصغير وأثره على المقادير الفضائية » : contrat GuidedProblem, place dans le parcours, et
 * SURTOUT chaque nombre recalculé — l'effet de k par space.js (`scaled`, `scaleEffect`, `ratioFrom`, `cuboid`, `pyramid`,
 * en fractions EXACTES), et chaque égalité / inégalité écrite dans les explications, les options justes et les rédactions
 * évaluée en rationnels (fractions \dfrac, puissances, décimaux « 2{,}4 », produits implicites « 2(… ) »).
 */
const steps = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => steps(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const N = (f) => Lin.toNumber(f);

// ── Vérificateur des formules $…$ (rationnels exacts) ─────────────────────────────────────────────────────────────
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const R = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };
const rAdd = (x, y) => R(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const rSub = (x, y) => R(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const rMul = (x, y) => R(x[0] * y[0], x[1] * y[1]);
const rDiv = (x, y) => R(x[0] * y[1], x[1] * y[0]);
const rPow = (x, e) => { let v = R(1); for (let k = 0; k < e; k += 1) v = rMul(v, x); return v; };
const rCmp = (x, y) => Math.sign(x[0] * y[1] - y[0] * x[1]);
const dec = (v) => { const [i, f = ''] = String(v).split('.'); return R(Number(i + f), 10 ** f.length); };
const UNIT = /\\,\\mathrm\{([^}]*)\}(\^\d)?/g;
/** L'unité d'un membre (« cm^3 », « L »…) ou '' : deux membres d'unités DIFFÉRENTES sont une conversion, vérifiée à part
 * (les tests par مسألة recalculent chaque conversion : 4 m = 400 cm, 60 m² = 600000 cm², 0,006 m³ = 6 L…). */
const unitOf = (src) => [...src.matchAll(UNIT)].map((m) => m[1] + (m[2] ?? '')).join('|');
function evalExpr(src) {
  let s = src
    .replace(UNIT, '').replace(/\{,\}/g, '.')
    .replace(/\\left|\\right/g, '')
    .replace(/\\d?frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))')
    .replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\s+/g, '');
  s = s.replace(/(\d)\(/g, '$1*(').replace(/\)\(/g, ')*(');
  if (!s || !/^[\d.+\-*/()^]+$/.test(s)) return null; // une lettre (V, A, k…) : ce membre n'est pas numérique
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
const REL = { '=': (c) => c === 0, '<': (c) => c < 0, '>': (c) => c > 0 };
/** Chaque couple de membres NUMÉRIQUES voisins (même unité) d'une formule vérifie sa relation. Renvoie le nombre vérifié. */
function checkText(text) {
  let checked = 0;
  for (const [, f] of String(text ?? '').matchAll(/\$([^$]+)\$/g)) {
    const tokens = f.split(/(=|<|>)/);
    // un membre sans unité prend celle du premier membre qui en a une À SA DROITE :
    // dans « 60 m² = 60 × 10000 = 600000 cm² », le membre du milieu compte des cm²
    const units = [];
    for (let k = tokens.length - 1; k >= 0; k -= 2) units[k] = unitOf(tokens[k]) || (units[k + 2] ?? '');
    for (let k = 1; k + 1 < tokens.length; k += 2) {
      const [l, r] = [tokens[k - 1], tokens[k + 1]];
      const [lu, ru] = [units[k - 1], units[k + 1]];
      if (lu && ru && lu !== ru) continue;
      const a = evalExpr(l); const b = evalExpr(r);
      if (!a || !b) continue;
      expect(REL[tokens[k]](rCmp(a, b)), f).toBe(true);
      checked += 1;
    }
  }
  return checked;
}
/** Les textes qui doivent être VRAIS : explications, options justes, rédactions. */
const trueTexts = (p) => p.parts.flatMap((part) => part.steps.flatMap((s) => [s.explain, ...(s.lines ?? []), s.kind === 'choice' ? s.options[s.correct] : null])).filter(Boolean);

describe('les مسائل du درس « التكبير والتصغير »', () => {
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
    const d = (P, a, b) => Math.sqrt(SP.lengthNumber(SP.distanceSquared3(P[a], P[b])));
    // مسألة 1 : AB = 8, BC = 6, AE = 4 (cotes 8, 6, 4 sur EF, FG, BF)
    const P1 = PROBLEM['masala-1'].figure.points;
    expect([d(P1, 'A', 'B'), d(P1, 'B', 'C'), d(P1, 'A', 'E'), d(P1, 'E', 'F'), d(P1, 'F', 'G'), d(P1, 'B', 'F')]).toEqual([8, 6, 4, 8, 6, 4]);
    expect(PROBLEM['masala-1'].figure.segments.map((s) => s.label)).toEqual(['8 cm', '6 cm', '4 cm']);
    // مسألة 2 : base carrée de côté 6, O centre, SO = 4 ⊥ base ; apothème 5 → aire latérale 4 × 6 × 5 / 2 = 60, volume 48
    const P2 = PROBLEM['masala-2'].figure.points;
    expect(['A', 'B', 'C', 'D'].map((n, i, a) => d(P2, n, a[(i + 1) % 4]))).toEqual([6, 6, 6, 6]);
    expect(P2.O).toEqual([0, 1, 2].map((k) => (P2.A[k] + P2.C[k]) / 2));
    expect(d(P2, 'S', 'O')).toBe(4);
    expect([P2.S[0], P2.S[1]]).toEqual([P2.O[0], P2.O[1]]);
    const midAB = [0, 1, 2].map((k) => (P2.A[k] + P2.B[k]) / 2);
    const apothem = Math.sqrt(SP.lengthNumber(SP.distanceSquared3(P2.S, midAB)));
    expect(apothem).toBe(5);
    expect(4 * (6 * apothem) / 2).toBe(60);
    expect(N(SP.pyramid(36, 4).volume)).toBe(48);
    expect(PROBLEM['masala-2'].statement).toContain('$60\\,\\mathrm{m}^2$');
    expect(PROBLEM['masala-2'].statement).toContain('$48\\,\\mathrm{m}^3$');
    // مسألة 3 : 40 × 20 × 30 dessiné en dizaines de cm, sans face supérieure (ouvert)
    const f3 = PROBLEM['masala-3'].figure;
    const P3 = f3.points;
    expect([d(P3, 'E', 'F'), d(P3, 'F', 'G'), d(P3, 'B', 'F')].map((x) => x * 10)).toEqual([40, 20, 30]);
    expect(f3.solids[0].faces).toHaveLength(5);
    expect(f3.solids[0].faces.some((f) => ['A', 'B', 'C', 'D'].every((n) => f.includes(n)))).toBe(false);
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const box = SP.cuboid(8, 6, 4);
    const k = '3/4';
    const V2 = SP.scaled(box.volume, k, 3);
    const A2 = SP.scaled(box.area, k, 2);
    expect(expectedOf('masala-1', 0)).toEqual([N(box.volume), N(V2)]); // 192, 81
    expect([N(box.volume), N(V2)]).toEqual([192, 81]);
    // les deux pièges : × k et × k²
    expect([N(SP.scaled(box.volume, k, 1)), N(SP.scaled(box.volume, k, 2))]).toEqual([144, 108]);
    // l'image recalculée par ses dimensions
    const img = SP.scaleAll([8, 6, 4], k);
    expect(N(SP.cuboid(...img).volume)).toBe(81);
    expect(N(SP.cuboid(...img).area)).toBe(117);
    expect(expectedOf('masala-1', 1)).toEqual([N(box.area), N(A2)]); // 208, 117
    // Yassine : − 2 cm → 6, 4, 2 ; les rapports diffèrent → pas une réduction
    const yas = [8, 6, 4].map((x) => x - 2);
    const ratios = yas.map((x, i) => Lin.toNumber(SP.ratioFrom([8, 6, 4][i], x, 1)));
    expect(new Set(ratios).size).toBe(3);
    expect(steps('masala-1', 1).find((s) => s.ask === 1).correct).toBe(0);
    // 3) prix : 81 × 12, 117 × 5, total, budget 1500 insuffisant
    const resin = N(V2) * 12; const paint = N(A2) * 5;
    expect(expectedOf('masala-1', 2)).toEqual([resin, paint, resin + paint]); // 972, 585, 1557
    expect(resin + paint - 1500).toBe(57);
    expect(PROBLEM['masala-1'].statement).toContain('1500 دج');
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const k = SP.ratioFrom(400, 20, 1);
    expect(k).toEqual(Lin.frac(1, 20));
    expect(SP.scaleEffect(k).kind).toBe('reduction');
    expect(steps('masala-2', 0).find((s) => s.ask === 0).options[0]).toContain('\\dfrac{1}{20}');
    const side = N(SP.scaled(600, k, 1));
    expect(expectedOf('masala-2', 0)).toEqual([4 * 100, side]); // 400 cm, 30 cm
    const lateralCm2 = 60 * 100 * 100;
    const modelArea = N(SP.scaled(lateralCm2, k, 2));
    expect(expectedOf('masala-2', 1)).toEqual([lateralCm2, modelArea, lateralCm2 / modelArea]); // 600000, 1500, 400
    expect(lateralCm2 / modelArea).toBe(20 ** 2);
    // le modèle par ses propres dimensions : apothème 5 m → 25 cm, aire latérale 4 × 30 × 25 / 2
    expect(4 * side * N(SP.scaled(500, k, 1)) / 2).toBe(1500);
    // 3) volume : 48 m³ × (1/20)³ = 0,006 m³ = 6 L ; pyramide 30 × 30 × 20 / 3 = 6000 cm³
    const vM3 = SP.scaled(48, k, 3);
    const litres = N(SP.m3ToLitres(vM3));
    expect(litres).toBe(6);
    expect(N(SP.cm3ToLitres(SP.pyramid(30 * 30, 20).volume))).toBe(6);
    const bags = Math.ceil(litres / 2.5);
    expect(expectedOf('masala-2', 2)).toEqual([20 ** 3, litres, litres / 2.5, bags, bags * 180]); // 8000, 6, 2.4, 3, 540
    expect(2 * 2.5 < litres).toBe(true); // deux sacs ne suffisent pas
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    const k = '3/2';
    const tank = SP.cuboid(40, 20, 30);
    const L1 = N(SP.cm3ToLitres(tank.volume));
    const L2 = N(SP.scaled(L1, k, 3));
    expect(expectedOf('masala-3', 0)).toEqual([N(tank.volume), L1, L2]); // 24000, 24, 81
    const img = SP.scaleAll([40, 20, 30], k).map(N);
    expect(img).toEqual([60, 30, 45]);
    expect(N(SP.cm3ToLitres(SP.cuboid(...img).volume))).toBe(81);
    // verre : aire totale moins le dessus (ouvert)
    const glass = (a, b, c) => a * b + 2 * a * c + 2 * b * c;
    const G1 = glass(40, 20, 30);
    const G2 = N(SP.scaled(G1, k, 2));
    expect(G1).toBe(N(tank.area) - 40 * 20);
    expect(expectedOf('masala-3', 1)).toEqual([G1, G2]); // 4400, 9900
    expect(glass(...img)).toBe(G2);
    // poissons : 1 pour 3 L ; 8 dans le petit (24 / 3) ; 27 dans le grand ; 19 achetés × 120
    expect(L1 / 3).toBe(8);
    const fish = L2 / 3;
    expect(expectedOf('masala-3', 2)).toEqual([fish, fish - 8, (fish - 8) * 120]); // 27, 19, 2280
    expect(8 * 1.5).not.toBe(fish); // le raisonnement « × k » de سمير
  });

  it('every equality written in explains, correct options and solutions is TRUE', () => {
    let checked = 0;
    for (const p of PROBLEMS) for (const t of trueTexts(p)) checked += checkText(t);
    expect(checked).toBeGreaterThan(60);
  });

  it('the checker catches a wrong number (mutation)', () => {
    expect(() => checkText('$\\dfrac{27}{64} \\times 192 = 82$')).toThrow();
    expect(() => checkText('$2(8 \\times 6 + 6 \\times 4 + 8 \\times 4) = 2 \\times 104 = 206\\,\\mathrm{cm}^2$')).toThrow();
    expect(checkText('$4\\,\\mathrm{m} = 400\\,\\mathrm{cm}$')).toBe(0); // une conversion n'est pas une égalité de nombres
  });

  it('math stays in $…$: no bare fraction, power or root in Arabic prose', () => {
    for (const p of PROBLEMS) {
      const texts = [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
      for (const t of texts) {
        const prose = t.replace(/\$[^$]*\$/g, '');
        expect(prose, t).not.toMatch(/\d\s*\/\s*\d|\^|√|\\/);
      }
    }
  });
});
