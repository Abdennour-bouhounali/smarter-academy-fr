import { describe, it, expect } from 'vitest';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { figureQuality, validateGeoFigure } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM, FIG_MINARET, FIG_OUED } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les مسائل du درس « استعمال الحاسبة… » : contrat, câblage, figures, et CHAQUE nombre recalculé — les écrans de la
 * calculatrice (10 chiffres significatifs, TR.screen), les arrondis annoncés (TR.roundTo), et toutes les égalités
 * écrites entre $…$ (explications, rédactions, bonne option) réévaluées par un petit lecteur (sin / cos / tan en
 * degrés quand l'angle porte ^{\circ}, en RADIANS sinon : le piège de la touche R).
 */
const num = (s) => Number(String(s).replace(',', '.'));
// L'arrondi « à k chiffres » (TR.roundTo pour la précision de la leçon ; au-delà, son epsilon relatif est trop grand).
const round = (x, k) => (k <= 3 ? num(TR.roundTo(x, k)) : Number((Math.round(x * 10 ** k) / 10 ** k).toFixed(k)));
const steps = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => steps(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);

/* ── Le lecteur d'égalités ───────────────────────────────────────────────────────────────────────────────────── */
const FN = { sin: Math.sin, cos: Math.cos, tan: Math.tan };
/** Un membre « purement numérique » en JS, ou null (une lettre, un angle nommé…). */
function toNumber(side) {
  let t = side.replace(/\\left|\\right|\\,/g, '').replace(/\{,\}/g, '.').replace(/\^\{\\circ\}/g, '°').trim();
  // \dfrac{a}{b} (sans accolades imbriquées une fois les degrés remplacés)
  for (let i = 0; i < 4; i += 1) t = t.replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))');
  t = t.replace(/\\(sin|cos|tan)\s*(-?\d+(?:\.\d+)?)(°?)/g, (_, f, x, deg) => `F.${f}(${deg ? `${x}*Math.PI/180` : x})`);
  t = t.replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/−/g, '-');
  const bare = t.replace(/F\.(sin|cos|tan)|Math\.PI/g, '');
  if (!/^[\d\s.+\-*/()]+$/.test(bare) || !/\d/.test(bare)) return null;
  // eslint-disable-next-line no-new-func
  return { value: Function('F', `return (${t});`)(FN), literal: /^-?\d+(?:\.\d+)?$/.test(t.trim()) ? t.trim() : null };
}
const decimalsOf = (lit) => (lit.split('.')[1] ?? '').length;
/** Les relations vérifiables d'un îlot $…$ ; rend la liste des échecs. */
function checkIsland(island) {
  const parts = island.split(/(\\approx|\\neq|=|<|>)/);
  const fails = [];
  const sides = parts.filter((_, i) => i % 2 === 0).map(toNumber);
  const rels = parts.filter((_, i) => i % 2 === 1);
  rels.forEach((rel, i) => {
    const a = sides[i]; const b = sides[i + 1];
    if (!a || !b) return;
    let ok;
    if (rel === '<') ok = a.value < b.value;
    else if (rel === '>') ok = a.value > b.value;
    else if (rel === '\\neq') ok = Math.abs(a.value - b.value) > 1e-12;
    // « ≈ » : l'arrondi annoncé ; « = » vers un décimal : l'écran (10 chiffres) ou une valeur exacte, au dernier chiffre écrit
    else if (b.literal && (rel === '\\approx' || decimalsOf(b.literal) > 0)) ok = Math.abs(round(a.value, decimalsOf(b.literal)) - b.value) < 1e-9;
    else ok = Math.abs(a.value - b.value) < 1e-9;
    if (!ok) fails.push(`${island} [${rel}]`);
  });
  return fails;
}
const islands = (s) => [...String(s).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
function textsOf(p) {
  const out = [p.statement];
  for (const part of p.parts) {
    out.push(part.question);
    for (const s of part.steps) {
      if (s.explain) out.push(s.explain);
      if (s.lines) out.push(...s.lines);
      if (s.kind === 'choice') out.push(s.options[s.correct]);
    }
  }
  return out;
}

/* ── Les écrans annoncés, recalculés (et AUCUN autre écran à 7 décimales ou plus n'est écrit) ─────────────────── */
const SCREENS = {
  '36,86989765': TR.atanDeg(0.75),
  '1,333333333': 1 / 0.75,
  '-0,2623748537': Math.sin(50), // sin 50 en RADIANS
  '0,7660444431': TR.sinDeg(50),
  '45,96266659': 60 * TR.sinDeg(50),
  '41,8103149': TR.asinDeg(40 / 60),
  '40,14783638': 60 * TR.sinDeg(42),
  '39,36354174': 60 * TR.sinDeg(41),
  '48,01003587': 30 * TR.tanDeg(58),
  '249,9257056': 30 * Math.tan(58), // 30 × tan 58 en RADIANS
  '0,4166666667': 1 / 2.4,
  '67,38013505': TR.atanDeg(2.4),
  '56,61239744': 30 / TR.cosDeg(58),
  '28,11912084': 45 * TR.tanDeg(32),
  '29,74527187': 45 * Math.tan(32), // en RADIANS
  '0,6248693519': TR.tanDeg(32),
  '0,6610060415': Math.tan(32), // en RADIANS
  '23,84636689': 45 * TR.sinDeg(32),
  '0,9998902031': TR.cosDeg(45 / 53), // cos sans 2nd : cos (0,849…)°
  '58,1092082': TR.asinDeg(45 / 53),
  '31,8907918': TR.acosDeg(45 / 53),
};

describe('les مسائل du درس « استعمال الحاسبة لحساب النسب المثلثية »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (4, 5, 6 — track problem, practice_lab, before the test 7)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [4, '04', 'masala-1', 'practice_lab', 8], [5, '05', 'masala-2', 'practice_lab', 8], [6, '06', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 7, id: '07', slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(69);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 4], ['masala-2', 5], ['masala-3', 6]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length, `${p.id} ${part.label}`).toBe(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('the data to sort: 4–5 useful items and a numeric decoy', () => {
    for (const p of PROBLEMS) {
      const useful = p.data.filter((d) => d.useful);
      const useless = p.data.filter((d) => !d.useful);
      expect(useful.length).toBeGreaterThanOrEqual(4);
      expect(useful.length).toBeLessThanOrEqual(5);
      expect(useless.some((d) => /\d/.test(d.text))).toBe(true);
      for (const d of p.data) expect(d.text).not.toMatch(/\$/);
    }
  });

  it('the three figures are valid and readable (figureQuality), drawn on computed coordinates', () => {
    for (const fig of [LESSON_CONFIG.lessonProblem.figure, FIG_MINARET, FIG_OUED]) {
      expect(validateGeoFigure(fig)).toEqual([]);
      expect(figureQuality(fig)).toEqual([]);
    }
    const f1 = LESSON_CONFIG.lessonProblem.figure.points;
    expect(Math.hypot(f1.D[0] - f1.T[0], f1.D[1] - f1.T[1])).toBe(60); // DT
    expect([f1.H[0] - f1.T[0], f1.D[1] - f1.H[1], f1.D[0] - f1.H[0]]).toEqual([48, 36, 0]); // TH, DH, droit en H
    expect(FIG_MINARET.points.C[1]).toBeCloseTo(30 * TR.tanDeg(58), 3);
    expect(FIG_MINARET.points.B[0] - FIG_MINARET.points.A[0]).toBe(30);
    expect(FIG_MINARET.points.B[0] - FIG_MINARET.points.E[0]).toBe(20);
    expect(FIG_OUED.points.T[1]).toBeCloseTo(45 * TR.tanDeg(32), 3);
    expect(FIG_OUED.points.B[0] - FIG_OUED.points.A[0]).toBe(45);
  });

  it('every calculator screen written is the real 10-digit screen, and none is unverified', () => {
    for (const [shown, x] of Object.entries(SCREENS)) expect(TR.screen(x), shown).toBe(shown);
    const written = new Set();
    for (const p of PROBLEMS) for (const t of textsOf(p)) for (const m of String(t).matchAll(/-?\d+\{,\}\d{7,}/g)) written.add(m[0].replace('{,}', ','));
    for (const w of written) expect(Object.keys(SCREENS), w).toContain(w);
  });

  it('every equality / approximation / inequality written between $…$ is true', () => {
    const fails = [];
    let checked = 0;
    for (const p of PROBLEMS) for (const t of textsOf(p)) for (const isl of islands(t)) {
      const f = checkIsland(isl);
      fails.push(...f);
      if (/[=<>]|\\approx/.test(isl) && isl.split(/\\approx|=|<|>/).filter((s) => toNumber(s)).length >= 2) checked += 1;
    }
    expect(fails).toEqual([]);
    expect(checked).toBeGreaterThan(25);
  });

  it('the reader really catches a wrong number', () => {
    expect(checkIsland('60 \\times \\sin 50^{\\circ} = 45{,}96266659')).toEqual([]);
    expect(checkIsland('60 \\times \\sin 50^{\\circ} = 45{,}96266669')).not.toEqual([]);
    expect(checkIsland('\\dfrac{30}{\\cos 58^{\\circ}} \\approx 56{,}7')).not.toEqual([]);
    expect(checkIsland('\\sin 50 = -0{,}2623748537')).toEqual([]); // radians
    expect(checkIsland('57 \\times 450 = 25660')).not.toEqual([]);
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const t = 36 / 48;
    const x = TR.atanDeg(t);
    expect(Math.hypot(36, 48)).toBe(60);
    expect(expectedOf('masala-1', 0)).toEqual([t, round(x, 2), round(x, 0)]);
    // la bonne touche est tan⁻¹ ; 1 ÷ 0,75 et tan 0,75 ne sont pas des angles de 37°
    expect(steps('masala-1', 0)[3].options[steps('masala-1', 0)[3].correct]).toContain('tan⁻¹ 0,75');
    expect(Math.round(1 / t)).not.toBe(37);
    const h = 60 * TR.sinDeg(50);
    expect(Math.sin(50)).toBeLessThan(0); // l'écran du copain en R est négatif
    expect(expectedOf('masala-1', 1)).toEqual([round(h, 1)]);
    expect(round(60 * round(TR.sinDeg(50), 2), 1)).not.toBe(round(h, 1)); // l'arrondi précoce change la réponse
    const limit = TR.asinDeg(40 / 60);
    const best = Math.floor(limit);
    expect(expectedOf('masala-1', 2)).toEqual([round(limit, 2), best]);
    expect(round(h, 1)).toBeGreaterThan(40);
    expect(60 * TR.sinDeg(Math.round(limit))).toBeGreaterThan(40); // l'arrondi (42°) dépasse
    expect(60 * TR.sinDeg(best)).toBeLessThanOrEqual(40);
    expect(Math.round(limit)).toBe(best + 1);
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const bc = 30 * TR.tanDeg(58);
    expect(expectedOf('masala-2', 0)).toEqual([round(bc, 2), round(bc, 1)]);
    expect(round(bc, 0)).toBe(48); // « نأخذ BC = 48 m »
    const r = 48 / 20;
    expect(r).toBeGreaterThan(1); // sin⁻¹ 2,4 : « خطأ رياضي »
    expect(Number.isNaN(Math.asin(r))).toBe(true);
    expect(expectedOf('masala-2', 1)).toEqual([r, round(TR.atanDeg(r), 1)]);
    const ac = 30 / TR.cosDeg(58);
    expect(Math.hypot(30, bc)).toBeCloseTo(ac, 9);
    const metres = Math.ceil(ac);
    expect(expectedOf('masala-2', 2)).toEqual([round(ac, 1), metres * 450]);
    expect(Math.floor(ac)).toBeLessThan(ac); // 56 m ne suffisent pas
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    const w = 45 * TR.tanDeg(32);
    expect(expectedOf('masala-3', 0)).toEqual([round(w, 3), round(w, 1)]);
    expect(round(45 * Math.tan(32), 1)).toBe(29.7); // le collègue en R : 29,7 m
    const a = TR.acosDeg(45 / 53);
    expect(45 / TR.cosDeg(32)).toBeCloseTo(53, 0); // AT réel ≈ 53,06 : la mesure laser est plausible
    expect(expectedOf('masala-3', 1)).toEqual([round(a, 0)]);
    expect(round(a, 0)).toBe(32); // confirme la lecture
    const len = round(round(w, 1) + 2 * 2, 1);
    expect(round(w + 4, 1)).toBe(len);
    const units = Math.ceil(len / 3);
    expect(expectedOf('masala-3', 2)).toEqual([len, round(len / 3, 1), units, units * 68000]);
    expect(Math.floor(len / 3) * 3).toBeLessThan(len);
  });
});
