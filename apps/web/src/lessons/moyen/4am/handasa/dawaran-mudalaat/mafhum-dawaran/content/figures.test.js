import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import * as RT from '@smarter-academy/core/arithmetic/rotation.js';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import * as FIG from './figures';

/**
 * Les figures du درس « مفهوم الدوران وإنشاء صور أشكال هندسية بدوران » disent VRAI : chaque image que la leçon affirme
 * (réponses, corrections, distracteurs déclarés faux) est re-vérifiée ici par rotation.imageCheck (packages/core) sur les
 * points DESSINÉS ; chaque figure — leçon, test final, banque d'exercices — passe figureQuality (guide §5).
 */
const O = { x: 0, y: 0 };
const p = (fig, n) => ({ x: fig.points[n][0], y: fig.points[n][1] });
const isImage = (fig, a, b, alpha, dir, c = O) => RT.imageCheck(c, p(fig, a), p(fig, b), alpha, dir, { tol: 1e-3, tolDeg: 0.05 }).ok;
const all = Object.entries(FIG).flatMap(([name, v]) => (Array.isArray(v) ? v.map((f, i) => [`${name}[${i}]`, f]) : [[name, v]]))
  .filter(([, f]) => f && f.points && f.ariaLabel);
// des points ALIGNÉS par définition (la droite (d) passant par O, le demi-tour) : la bande est le sujet
const ALIGNED = new Set(['FIG_ACT3_LINE1', 'FIG_KNOW2_180']);

describe('figures — données GeoFigure valides et lisibles', () => {
  it('chaque figure exportée passe validateGeoFigure', () => {
    for (const [name, fig] of all) expect(validateGeoFigure(fig), name).toEqual([]);
  });
  it('figureQuality : pas de bande étroite, aucune étiquette sur une autre (guide §5)', () => {
    for (const [name, fig] of all) expect(figureQuality(fig, ALIGNED.has(name) ? { maxAspect: Infinity } : {}), name).toEqual([]);
  });
  it('une figure à plus de six points nommés s’affiche à 480 px au moins', () => {
    for (const [name, fig] of all) {
      const named = Object.keys(fig.points).filter((n) => !(fig.hidden ?? []).includes(n)).length;
      if (named > 6) expect(fig.maxWidth ?? (fig.grid ? 540 : 360), name).toBeGreaterThanOrEqual(480);
    }
  });
});

describe('les réponses de la leçon, recalculées sur les points dessinés', () => {
  it('نشاط 1 : (F′) est l’image de (F) par 90° dans le sens des aiguilles (et pas dans l’autre)', () => {
    const F = FIG.FIG_ACT1;
    for (const n of ['A', 'B', 'C']) {
      expect(isImage(F, n, `${n}'`, 90, 'indirect'), n).toBe(true);
      expect(isImage(F, n, `${n}'`, 90, 'direct'), n).toBe(false);
      // (F₁) est le symétrique de (F) par rapport à l'axe vertical : même distance à O, mais ce n'est pas un دوران de 90°
      expect(F.points[`${n}₁`]).toEqual([-F.points[n][0], F.points[n][1]]);
    }
  });
  it('نشاط 2 : A′ = image de A par 70° dans le sens direct (la flèche)', () => {
    const F = FIG.FIG_ACT2_STEPS[3];
    expect(isImage(F, 'A', "A'", 70, 'direct')).toBe(true);
  });
  it('نشاط 3 : les quatre images par 72° direct ; A′B′ = AB ; la droite (OA′) fait 72° avec (d) ; même rayon', () => {
    const S = FIG.FIG_ACT3_SEG_SOL;
    expect(isImage(S, 'A', "A'", 72, 'direct') && isImage(S, 'B', "B'", 72, 'direct')).toBe(true);
    const d = (f, a, b) => Math.hypot(f.points[a][0] - f.points[b][0], f.points[a][1] - f.points[b][1]);
    expect(d(S, "A'", "B'")).toBeCloseTo(d(S, 'A', 'B'), 3);
    expect(d(S, 'A', 'B')).toBe(4);
    const L1 = FIG.FIG_ACT3_LINE1_SOL;
    expect(isImage(L1, 'A', "A'", 72, 'direct')).toBe(true);
    const L2 = FIG.FIG_ACT3_LINE2_SOL;
    expect(isImage(L2, 'A', "A'", 72, 'direct') && isImage(L2, 'B', "B'", 72, 'direct')).toBe(true);
    // (d) et (A′B′) : 72° entre les directions
    const dirOf = (f, a, b) => Math.atan2(f.points[b][1] - f.points[a][1], f.points[b][0] - f.points[a][0]) * 180 / Math.PI;
    expect(dirOf(L2, "A'", "B'") - dirOf(L2, 'A', 'B')).toBeCloseTo(72, 2);
    const H = FIG.FIG_ACT3_RAY_SOL;
    expect(isImage(H, 'A', "A'", 72, 'direct') && isImage(H, 'B', "B'", 72, 'direct')).toBe(true);
    const C = FIG.FIG_ACT3_CIRCLE_SOL;
    expect(isImage(C, 'W', "W'", 72, 'direct') && isImage(C, 'A', "A'", 72, 'direct')).toBe(true);
    expect(d(C, "W'", "A'")).toBeCloseTo(d(C, 'W', 'A'), 3);
    expect(d(C, 'W', 'A')).toBe(2);
  });
  it('معارف : 90° dans le sens des aiguilles ; 35° direct ; 180° = symétrie de centre O', () => {
    expect(isImage(FIG.FIG_KNOW1, 'M', "M'", 90, 'indirect')).toBe(true);
    expect(isImage(FIG.FIG_KNOW2, 'A', "A'", 35, 'direct') && isImage(FIG.FIG_KNOW2, 'M', "M'", 35, 'direct')).toBe(true);
    const H = FIG.FIG_KNOW2_180;
    expect(isImage(H, 'M', "M'", 180, 'direct') && isImage(H, 'M', "M'", 180, 'indirect')).toBe(true);
    expect((H.points.M[0] + H.points["M'"][0]) / 2).toBe(0);
  });
  it('طرائق : 50° direct ; [A′B′] par 40° indirect, A′B′ = AB = 4', () => {
    expect(isImage(FIG.FIG_METHOD_POINT, 'A', "A'", 50, 'direct')).toBe(true);
    const S = FIG.FIG_METHOD_SEG_SOL;
    expect(isImage(S, 'A', "A'", 40, 'indirect') && isImage(S, 'B', "B'", 40, 'indirect')).toBe(true);
    expect(isImage(S, 'A', "A'", 40, 'direct')).toBe(false);
  });
  it('التمرين 1 : les trois réponses sont [OA] (95° de C, 230° de D, l’antécédent de [OC] par 265°)', () => {
    const F = FIG.FIG_EX1;
    expect(isImage(F, 'C', 'A', 95, 'direct')).toBe(true);
    expect(isImage(F, 'D', 'A', 230, 'direct')).toBe(true);
    expect(isImage(F, 'A', 'C', 265, 'direct')).toBe(true);
    expect(isImage(F, 'C', 'B', 95, 'direct') || isImage(F, 'D', 'C', 230, 'direct') || isImage(F, 'D', 'C', 265, 'direct')).toBe(false);
    // B, O, D alignés ; les quatre mesures imprimées
    expect(RT.angleAt(p(F, 'B'), O, p(F, 'D'))).toBeCloseTo(180, 2);
    expect(RT.angleAt(p(F, 'A'), O, p(F, 'B'))).toBeCloseTo(50, 2);
    expect(RT.angleAt(p(F, 'B'), O, p(F, 'C'))).toBeCloseTo(45, 2);
    expect(RT.angleAt(p(F, 'C'), O, p(F, 'D'))).toBeCloseTo(135, 2);
    expect(RT.angleAt(p(F, 'A'), O, p(F, 'D'))).toBeCloseTo(130, 2);
  });
  it('التمرين 2 : ① ↦ ② par 90° indirect ; ② ↦ ③, ④ ↦ ① ; ① ↦ ④ direct ; ① ↦ ③ et ④ ↦ ② par 180°', () => {
    const F = FIG.FIG_EX2;
    expect(isImage(F, '①', '②', 90, 'indirect')).toBe(true);
    expect(isImage(F, '②', '③', 90, 'indirect')).toBe(true);
    expect(isImage(F, '④', '①', 90, 'indirect')).toBe(true);
    expect(isImage(F, '①', '④', 90, 'direct')).toBe(true);
    expect(isImage(F, '①', '③', 180, 'direct') && isImage(F, '④', '②', 180, 'indirect')).toBe(true);
  });
  it('التمرين 5 : AMN = ABD par 120° ↺, APQ par 150° ↻, ARS par 90° ↻, AEF = AMN par 60° ↻ ; les écarts donnés', () => {
    const F = FIG.FIG_EX5; const A = { x: 0, y: 0 };
    const im = (a, b, alpha, dir) => RT.imageCheck(A, p(F, a), p(F, b), alpha, dir, { tol: 1e-3, tolDeg: 0.05 }).ok;
    expect(im('B', 'M', 120, 'direct') && im('D', 'N', 120, 'direct')).toBe(true);
    expect(im('B', 'P', 150, 'indirect') && im('D', 'Q', 150, 'indirect')).toBe(true);
    expect(im('B', 'R', 90, 'indirect') && im('D', 'S', 90, 'indirect')).toBe(true);
    expect(im('M', 'E', 60, 'indirect') && im('N', 'F', 60, 'indirect')).toBe(true);
    expect(im('B', 'P', 150, 'direct')).toBe(false);
    expect(RT.angleAt(p(F, 'D'), p(F, 'B'), A)).toBeCloseTo(75, 2);
    for (const [k, v] of Object.entries(FIG.EX5_GAPS)) expect(RT.angleAt(p(F, k[0]), A, p(F, k[2])), k).toBeCloseTo(v, 2);
  });
  it('التمرين 7 : ② = ① tourné de 90° dans le sens direct autour de O (A ↦ F, B ↦ G, C ↦ H, D ↦ L, E ↦ K)', () => {
    const F = FIG.FIG_EX7;
    for (const [a, b] of [['A', 'F'], ['B', 'G'], ['C', 'H'], ['D', 'L'], ['E', 'K']]) expect(isImage(F, a, b, 90, 'direct'), a).toBe(true);
    expect(isImage(F, 'A', 'F', 90, 'indirect')).toBe(false);
  });
  it('أؤكّد تعلّماتي 1 : par 60° direct, B ↦ C, D ↦ A ; l’image de A n’est aucun sommet (la coquille corrigée)', () => {
    const F = FIG.FIG_QCM1;
    expect(isImage(F, 'B', 'C', 60, 'direct')).toBe(true);
    expect(isImage(F, 'D', 'A', 60, 'direct')).toBe(true);
    for (const v of ['B', 'C', 'D']) expect(isImage(F, 'A', v, 60, 'direct'), v).toBe(false);
    expect(RT.angleAt(p(F, 'B'), O, p(F, 'C'))).toBeCloseTo(60, 2);
  });
  it('دوري الآن : l’angle AOB mesure 45°', () => {
    expect(RT.angleAt(p(FIG.FIG_NOW, 'B'), O, p(FIG.FIG_NOW, 'A'))).toBeCloseTo(45, 2);
  });
});

describe('la banque d’exercices : chaque statement.figure est lisible', () => {
  const root = new URL('../../../../../../../../../../content/practice/4am/mafhum-dawaran/', import.meta.url);
  let files = [];
  try { files = readdirSync(root, { recursive: true }).filter((f) => String(f).endsWith('.json')); } catch { files = []; }
  it('figureQuality et validateGeoFigure sur chaque figure de la banque', () => {
    let n = 0;
    for (const f of files) {
      const ex = JSON.parse(readFileSync(new URL(String(f), root), 'utf8'));
      const fig = ex.statement?.figure;
      if (!fig) continue;
      n += 1;
      expect(validateGeoFigure(fig), f).toEqual([]);
      expect(figureQuality(fig, fig.points && Object.keys(fig.points).length === 2 ? { maxAspect: Infinity } : {}), f).toEqual([]);
    }
    expect(n).toBeGreaterThanOrEqual(20); // la banque porte une vingtaine de figures (le chemin est donc bien résolu)
  });
});
