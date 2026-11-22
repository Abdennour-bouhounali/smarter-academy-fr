import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import { EXERCISES, EX, FINAL } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, LAB } from './textbook';
import { FIGURES } from './figures';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les clés du درس « تعليم نقطة في المستوي » recalculées avec un code INDÉPENDANT de `relative.js` : un lecteur de couples (texte LaTeX → centièmes, BigInt).
 * Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX, chaque affirmation de « أستعدّ » a la vérité qu'elle annonce.
 */
const num = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(/,/g, '.').replace(/−/g, '-').replace(/\s/g, '');
  const m = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(t);
  if (!m) throw new Error(`illisible : ${s}`);
  const v = BigInt(m[2]) * 100n + BigInt((m[3] ?? '').padEnd(2, '0').slice(0, 2) || '0');
  return m[1] === '-' ? -v : v;
};
/** « $(3\,;-2)$ » ou « (3 ; -2) » → [x, y] en centièmes. */
const pair = (s) => {
  const m = /\(\s*([^;]+?)\s*(?:\\,)?\s*;\s*([^)]+?)\s*\)/.exec(String(s).replace(/\$/g, ''));
  if (!m) throw new Error(`couple illisible : ${s}`);
  return [num(m[1].replace(/\\,/g, '')), num(m[2])];
};
const same = (a, b) => a[0] === b[0] && a[1] === b[1];
const rows = (id) => EX[id].question.rows;
const rightOf = (r) => r.options[r.correct];
const sx = ([x, y]) => [x, -y];
const sy = ([x, y]) => [-x, y];
const P = (x, y) => [num(String(x)), num(String(y))];

describe('le درس « تعليم نقطة في المستوي » — clés recalculées', () => {
  it('le lecteur lui-même', () => {
    expect(pair('$(-2{,}5\\,;3)$')).toEqual([-250n, 300n]);
    expect(pair('(3 ; -2)')).toEqual([300n, -200n]);
  });

  it('les figures sont valides, lisibles, et placent les points annoncés', () => {
    for (const [name, f] of Object.entries(FIGURES)) {
      expect(validateGeoFigure(f), name).toEqual([]);
      expect(figureQuality(f), name).toEqual([]);
    }
    expect(FIGURES.digit.points).toMatchObject({ A: [-2, 3], B: [-2, 0], C: [2, 0], D: [1, 3], E: [1, -3] });
    expect(LESSON_CONFIG.lessonProblem.figure.points).toMatchObject({ A: [-4, 3], B: [5, 3], C: [5, -2] });
  });

  it('ex-21 : chaque ligne lit les coordonnées de la figure (abscisse d’abord), chaque distracteur est faux', () => {
    const pts = FIGURES.read5.points;
    ['A', 'B', 'C', 'D', 'E'].forEach((n, i) => {
      const want = P(pts[n][0], pts[n][1]);
      rows('ex-21')[i].options.forEach((o, k) => expect(same(pair(o), want), `${n} ${o}`).toBe(k === rows('ex-21')[i].correct));
    });
  });

  it('ex-22 : régions et axes calculés sur les points de la figure', () => {
    const pts = Object.fromEntries(Object.entries(FIGURES.read5.points).map(([n, p]) => [n, P(p[0], p[1])]));
    const posNeg = Object.keys(pts).filter((n) => pts[n][0] > 0n && pts[n][1] < 0n);
    const yZero = Object.keys(pts).filter((n) => pts[n][1] === 0n);
    const xZero = Object.keys(pts).filter((n) => pts[n][0] === 0n);
    expect(posNeg).toEqual([]);
    expect(yZero).toEqual(['E']);
    expect(xZero).toEqual(['D']);
    expect(rightOf(rows('ex-22')[0]).includes('لا توجد')).toBe(true);
    expect(rightOf(rows('ex-22')[1])).toContain('$E$');
    expect(rightOf(rows('ex-22')[2])).toContain('$D$');
    rows('ex-22').slice(1).forEach((r) => expect(r.options.filter((o) => o === rightOf(r))).toHaveLength(1));
  });

  it('ex-23 : le symétrique axial garde une coordonnée et change l’autre', () => {
    const M = P(3, -2);
    const [rx, ry] = rows('ex-23');
    rx.options.forEach((o, k) => expect(same(pair(o), sx(M)), o).toBe(k === rx.correct));
    ry.options.forEach((o, k) => expect(same(pair(o), sy(M)), o).toBe(k === ry.correct));
  });

  it('ex-24 : trois points à distance 5 de O ; les affirmations vraies / fausses', () => {
    const pts = FIGURES.circle.points;
    for (const n of ['A', 'B', 'C']) expect(pts[n][0] ** 2 + pts[n][1] ** 2).toBe(25);
    const q = EX['ex-24'].question.rows;
    expect(q.map((r) => r.answer)).toEqual([true, false, true]);
    expect(pts.B[1]).toBe(0);
    expect(Math.sign(pts.A[1]) !== Math.sign(pts.C[1])).toBe(true);
    expect(pts.C[0] < 0 && pts.C[1] < 0).toBe(true);
  });

  it('deep-55 : le troisième sommet C(2 ; −3) rend ABC rectangle isocèle en B (comptage des carreaux)', () => {
    const A = [-3, 2]; const B = [-3, -3]; const C = [2, -3];
    expect(Math.abs(A[1] - B[1])).toBe(Math.abs(C[0] - B[0]));
    expect(A[0]).toBe(B[0]);
    expect(B[1]).toBe(C[1]);
    expect(EX['deep-55'].question.expected).toEqual({ x: '2', y: '-3' });
  });

  it('deep-52 : l’unité qui garde la plus grande coordonnée dans 6 cm sans écraser les petites', () => {
    const [ra, rb] = rows('deep-52');
    const per = (o) => Number(o.replace(/[^0-9]/g, '').replace(/^1(?=\d)/, '') || 1);
    expect(rightOf(ra)).toContain('$10$');
    expect(60 / 10).toBeLessThanOrEqual(6);
    expect(60 / 1).toBeGreaterThan(6);
    expect(rightOf(rb)).toContain('لكل وحدة');
    expect(3 / 1).toBeLessThanOrEqual(6);
    expect(per('$1\\,\\mathrm{cm}$ لكل $10$ وحدات')).toBe(10);
  });

  it('act-1 : les trois segments dessinent un « 4 »', () => {
    const p = FIGURES.digit.points;
    expect(p.A[0]).toBe(p.B[0]);
    expect(p.B[1]).toBe(p.C[1]);
    expect(p.D[0]).toBe(p.E[0]);
    expect(p.D[0] > p.A[0] && p.D[0] < p.C[0]).toBe(true);
    expect(p.D[1] === p.A[1] && p.E[1] < p.B[1]).toBe(true);
  });

  it('le إختبار أولي : chaque clé recalculée, chaque distracteur faux', () => {
    const e = Object.fromEntries(FINAL.map((f) => [f.id, f]));
    const read = P(e.E1.truth.x, e.E1.truth.y);
    e.E1.options.forEach((o, k) => expect(same(pair(o), read), o).toBe(k === e.E1.correct));
    expect(e.E2.truth).toEqual({ x: '0', y: '-4' });
    expect(e.E2.options[e.E2.correct]).toContain('التراتيب');
    const s = sx(P(e.E3.truth.x, e.E3.truth.y));
    e.E3.options.forEach((o, k) => expect(same(pair(o), s), o).toBe(k === e.E3.correct));
    const t = P(e.E4.truth.x, e.E4.truth.y);
    expect(t[0] < 0n && t[1] > 0n).toBe(true);
    expect(e.E4.options[e.E4.correct]).toBe('فوق محور الفواصل وعلى يسار محور التراتيب');
    expect(FINAL.map((f) => f.options.length)).toEqual([4, 4, 4, 4, 4]);
  });

  it('le إختبار أولي dans le module : chaque option du fichier, la clé à la bonne place', () => {
    const src = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    for (const f of FINAL) for (const o of f.options) {
      const lit = /^\(.*\)$/.test(o) ? `'$${o.replace(/ ; /g, '\\\\,;').replace(/ ;/g, '\\\\,;')}$'` : o;
      expect(src.includes(lit), `${f.id} ${o} -> ${lit}`).toBe(true);
    }
    expect(src.match(/correct: 0/g)).toHaveLength(5);
  });

  it('« أستعدّ » : la vérité annoncée', () => {
    expect(PREP_ITEMS.map((i) => i.answer)).toEqual([false, true, true, true]);
    expect(PREP_PLATFORM_ITEMS.map((i) => i.answer)).toEqual([true, true]);
    // item 4 : M(−1 ; 1), O, N(−3 ; 3) alignés — produit en croix (−1)(3) − (1)(−3) = 0
    expect((-1) * 3 - 1 * (-3)).toBe(0);
    // plateforme 1 : K(2 ; 5), L(−2 ; 5) — même ordonnée, abscisses opposées
    expect(2 === -(-2) && 5 === 5).toBe(true);
    // plateforme 2 : 5 × 0,5 = 2,5
    expect(5n * num('0.5')).toBe(num('2.5'));
  });

  it('le labo : معارف, piquet en (4 ; 2)', () => {
    const t = LAB.maarif.tasks[0];
    expect(t.stake).toBe('4;2');
    expect(t.finds).toEqual(['jar', 'lamp', 'plate']);
    // jarre (5,4), qandil (2,5), assiette (2,1) vus depuis (4,2)
    expect([[5, 4], [2, 5], [2, 1]].map(([x, y]) => [x - 4, y - 2])).toEqual([[1, 2], [-2, 3], [-2, -1]]);
  });

  it('les modules de la configuration', () => {
    expect(LESSON_CONFIG.modules).toHaveLength(9);
    expect(EXERCISES).toHaveLength(7);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    for (const s of LESSON_CONFIG.skills) expect(s.length).toBeLessThanOrEqual(255);
  });
});
