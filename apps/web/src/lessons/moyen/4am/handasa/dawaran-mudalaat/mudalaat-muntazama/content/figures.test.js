import { describe, it, expect } from 'vitest';
import * as R from '@smarter-academy/core/arithmetic/rotation.js';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import * as FIG from './figures';

/**
 * Les figures du درس « المضلعات المنتظمة وتطبيقاتها » disent VRAI : chaque mesure que la leçon affirme (réponses,
 * corrections, distracteurs déclarés faux) est recalculée ici avec rotation.js sur les points DESSINÉS ; chaque figure est
 * lisible (figureQuality, règle du propriétaire) ; et chaque figure du banc d'exercices aussi.
 */
const p = (fig, n) => ({ x: fig.points[n][0], y: fig.points[n][1] });
const dist = (fig, a, b) => Math.hypot(fig.points[a][0] - fig.points[b][0], fig.points[a][1] - fig.points[b][1]);
const ang = (fig, a, v, b) => R.angleAt(p(fig, a), p(fig, v), p(fig, b));
const TOL = 0.05; // degrés : les coordonnées sont arrondies au millième

const figures = Object.entries(FIG).filter(([, f]) => f && f.points && f.ariaLabel);

describe('figures — données GeoFigure valides et lisibles', () => {
  it('chaque figure exportée passe validateGeoFigure', () => {
    for (const [name, fig] of figures) expect(validateGeoFigure(fig), name).toEqual([]);
  });
  it('figureQuality : pas de bande étroite, aucune étiquette sur une autre (guide §5 « Textbook figures »)', () => {
    for (const [name, fig] of figures) expect(figureQuality(fig), name).toEqual([]);
  });
  it('une figure de plus de 6 points s’affiche à 480 px au moins', () => {
    for (const [name, fig] of figures) if (Object.keys(fig.points).length > 6) expect(fig.maxWidth ?? 0, name).toBeGreaterThanOrEqual(480);
  });
  it('les sommets des polygones réguliers sont ceux de rotation.regularVertices (au millième)', () => {
    const check = (fig, names, r, start, dir, center = 'O') => {
      const V = R.regularVertices({ x: fig.points[center][0], y: fig.points[center][1] }, r, names.length, start, dir);
      names.forEach((n, i) => {
        expect(fig.points[n][0], n).toBeCloseTo(V[i].x, 2);
        expect(fig.points[n][1], n).toBeCloseTo(V[i].y, 2);
      });
    };
    check(FIG.FIG_ACT5, ['M', 'N', 'P'], 2, 90, 'direct');
    check(FIG.FIG_KNOW5_TRI, ['A', 'B', 'C'], 2, 75, 'direct');
    check(FIG.FIG_KNOW5_SQ, ['A', 'B', 'C', 'D'], 2, 150, 'direct');
    check(FIG.FIG_KNOW5_HEX, ['A', 'B', 'C', 'D', 'E', 'F'], 2, 175, 'direct');
    check(FIG.FIG_METHOD_ANGLE, ['A', 'B', 'C', 'D', 'E'], 2, 126, 'direct');
    check(FIG.FIG_METHOD_CONSTRUCT, ['A', 'B', 'C', 'D', 'E'], 3 / (2 * Math.sin(Math.PI / 5)), 126, 'direct');
    check(FIG.FIG_NOW157, ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 2, 90, 'direct');
    check(FIG.FIG_EX9, ['A', 'B', 'C'], 2, 90, 'direct');
    check(FIG.FIG_EX13, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], 2, 108, 'indirect');
    check(FIG.FIG_EX14, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], Math.sqrt(8), 90, 'direct');
    check(FIG.FIG_EX19, ['A', 'B', 'C', 'D', 'E', 'F'], 16, 180, 'indirect');
    check(FIG.FIG_EX15, ['B', 'C', 'D', 'E', 'F'], 4, 0, 'direct', 'A');
    check(FIG.FIG_CHALLENGE_SOL, ['A', 'B', 'C', 'D', 'E'], R.radiusForChord(5, 10), 90, 'direct');
  });
});

describe('أستعدّ 1 et أؤكّد تعلّماتي 4', () => {
  it('prep 1 : 60° en C et en B ⇒ ABC équilatéral (vrai)', () => {
    const F = FIG.FIG_PREP1;
    expect(ang(F, 'A', 'C', 'B')).toBeCloseTo(60, 1);
    expect(ang(F, 'C', 'B', 'A')).toBeCloseTo(60, 1);
    expect(dist(F, 'A', 'B')).toBeCloseTo(dist(F, 'B', 'C'), 2);
  });
  it('QCM 4 : cinq côtés égaux mais angles 90°, 150°, 60°, 150°, 90° — un pentagone NON régulier (108° pour un régulier)', () => {
    const F = FIG.FIG_QCM4;
    const sides = [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'A']].map(([a, b]) => dist(F, a, b));
    for (const s of sides) expect(s).toBeCloseTo(1, 2);
    expect(ang(F, 'E', 'A', 'B')).toBeCloseTo(90, 1);
    expect(ang(F, 'A', 'B', 'C')).toBeCloseTo(150, 1);
    expect(ang(F, 'B', 'C', 'D')).toBeCloseTo(60, 1);
    expect(R.interiorAngle(5)).toMatchObject({ n: 108, d: 1 });
  });
});

describe('نشاط 5 — le triangle équilatéral MPN dans son cercle', () => {
  const F = FIG.FIG_ACT5;
  it('les trois زوايا مركزية valent 120° = 2 × 60°', () => {
    expect(ang(F, 'N', 'O', 'P')).toBeCloseTo(120, 1);
    expect(ang(F, 'M', 'O', 'N')).toBeCloseTo(120, 1);
    expect(ang(F, 'P', 'O', 'M')).toBeCloseTo(120, 1);
    expect(ang(F, 'N', 'M', 'P')).toBeCloseTo(60, 1);
  });
  it('la rotation (O, 120°, direct) : P ↦ M, M ↦ N, N ↦ P ; le sens indirect est refusé', () => {
    const O = p(F, 'O');
    expect(R.imageCheck(O, p(F, 'P'), p(F, 'M'), 120, 'direct', { tol: 1e-3, tolDeg: TOL }).ok).toBe(true);
    expect(R.imageCheck(O, p(F, 'M'), p(F, 'N'), 120, 'direct', { tol: 1e-3, tolDeg: TOL }).ok).toBe(true);
    expect(R.imageCheck(O, p(F, 'N'), p(F, 'P'), 120, 'direct', { tol: 1e-3, tolDeg: TOL }).ok).toBe(true);
    expect(R.imageCheck(O, p(F, 'P'), p(F, 'M'), 120, 'indirect', { tol: 1e-3, tolDeg: TOL }).sense).toBe(false);
  });
});

describe('معارف 5 — les exemples', () => {
  it('triangle 120° (60° en A), carré 90°, hexagone 60° (120° en B)', () => {
    expect(ang(FIG.FIG_KNOW5_TRI, 'B', 'O', 'C')).toBeCloseTo(120, 1);
    expect(ang(FIG.FIG_KNOW5_TRI, 'B', 'A', 'C')).toBeCloseTo(60, 1);
    expect(ang(FIG.FIG_KNOW5_SQ, 'D', 'O', 'C')).toBeCloseTo(90, 1);
    expect(ang(FIG.FIG_KNOW5_HEX, 'E', 'O', 'F')).toBeCloseTo(60, 1);
    expect(ang(FIG.FIG_KNOW5_HEX, 'C', 'B', 'A')).toBeCloseTo(120, 1);
  });
  it('l’hexagone : la rotation (O, \\widehat{AOB}) envoie C sur D (module 2, question 3)', () => {
    const F = FIG.FIG_KNOW5_HEX;
    const a = R.orientedAngle(p(F, 'O'), p(F, 'A'), p(F, 'B'));
    expect(a).toBeCloseTo(60, 1);
    expect(R.imageCheck(p(F, 'O'), p(F, 'C'), p(F, 'D'), 60, 'direct', { tol: 1e-3, tolDeg: TOL }).ok).toBe(true);
  });
});

describe('طرائق', () => {
  it('حساب قيس زاوية : AOE = 72°, OAE = 54°, BAE = 108° (et non 180°)', () => {
    const F = FIG.FIG_METHOD_ANGLE;
    expect(ang(F, 'A', 'O', 'E')).toBeCloseTo(72, 1);
    expect(ang(F, 'O', 'A', 'E')).toBeCloseTo(54, 1);
    expect(ang(F, 'B', 'A', 'E')).toBeCloseTo(108, 1);
    expect(ang(FIG.FIG_METHOD_ANGLE_SOL, 'E', 'O', 'A')).toBeCloseTo(72, 1);
  });
  it('إنشاء : AB = 3, E image de B par (A, 108°, direct), (Δ1) médiatrice de [AB] par O et D, (Δ2) de [AE] par O et C', () => {
    const F = FIG.FIG_METHOD_CONSTRUCT;
    expect(dist(F, 'A', 'B')).toBeCloseTo(3, 2);
    expect(R.imageCheck(p(F, 'A'), p(F, 'B'), p(F, 'E'), 108, 'direct', { tol: 1e-3, tolDeg: TOL }).ok).toBe(true);
    for (const n of ['O', 'D']) expect(dist(F, n, 'A')).toBeCloseTo(dist(F, n, 'B'), 2);
    for (const n of ['O', 'C']) expect(dist(F, n, 'A')).toBeCloseTo(dist(F, n, 'E'), 2);
    for (const [a, b] of [['B', 'C'], ['C', 'D'], ['D', 'E']]) expect(dist(F, a, b)).toBeCloseTo(3, 2);
  });
  it('حساب طول ضلع : R = √3, H milieu de [AB], OH ⊥ AB, AB = 3 (et non √3)', () => {
    const F = FIG.FIG_METHOD_SIDE;
    for (const n of ['A', 'B', 'C']) expect(dist(F, 'O', n)).toBeCloseTo(Math.sqrt(3), 2);
    expect(dist(F, 'A', 'B')).toBeCloseTo(3, 2);
    expect(dist(F, 'A', 'H')).toBeCloseTo(1.5, 2);
    expect(ang(F, 'A', 'H', 'O')).toBeCloseTo(90, 1);
    expect(ang(F, 'H', 'O', 'A')).toBeCloseTo(60, 1);
    expect(R.sideFromRadius(3, 1).exact).toMatchObject({ r: 3 });
  });
  it('دوري الآن : AOB = 360/7 ≈ 51° ; ABC = 900/7 ≈ 129°', () => {
    const F = FIG.FIG_NOW157;
    expect(ang(F, 'A', 'O', 'B')).toBeCloseTo(360 / 7, 1);
    expect(ang(F, 'A', 'B', 'C')).toBeCloseTo(900 / 7, 1);
    expect(Math.round(360 / 7)).toBe(51);
    expect(Math.round(900 / 7)).toBe(129);
    expect(R.degLatex(R.centralAngle(7))).toBe('\\dfrac{360}{7}^\\circ');
  });
});

describe('أوظّف تعلّماتي', () => {
  it('تمرين 9 : A′B′C′ = image par (O, 45°, direct) ; aussi par (O, 165°, direct) et (O, 75°, indirect) — comme figures', () => {
    const F = FIG.FIG_EX9_SOL;
    const O = p(F, 'O');
    const opt = { tol: 1e-3, tolDeg: TOL };
    expect(R.imageCheck(O, p(F, 'A'), p(F, "A'"), 45, 'direct', opt).ok).toBe(true);
    expect(R.imageCheck(O, p(F, 'B'), p(F, "B'"), 45, 'direct', opt).ok).toBe(true);
    expect(R.imageCheck(O, p(F, 'C'), p(F, "C'"), 45, 'direct', opt).ok).toBe(true);
    // 165° direct : A ↦ C′ (A à 90°, C′ à 15° + 360°) ; 75° indirect : A ↦ C′ aussi
    expect(R.imageCheck(O, p(F, 'A'), p(F, "C'"), 75, 'indirect', opt).ok).toBe(true);
    expect(R.imageCheck(O, p(F, 'A'), p(F, "B'"), 165, 'direct', opt).ok).toBe(true);
    // un distracteur : 30° direct ne donne pas le triangle A′B′C′
    expect(['A', 'B', 'C'].some((n) => ["A'", "B'", "C'"].some((m) => R.imageCheck(O, p(F, n), p(F, m), 30, 'direct', opt).ok))).toBe(false);
  });
  it('تمرين 13 : ABC = 144°, AOB = 36°', () => {
    const F = FIG.FIG_EX13;
    expect(ang(F, 'A', 'B', 'C')).toBeCloseTo(144, 1);
    expect(ang(F, 'A', 'O', 'B')).toBeCloseTo(36, 1);
  });
  it('تمرين 14 : ABC = 135° ; L sur (OA) et (BH), (BH) ⊥ (OA) ; OL = BL = 2 ; aire = 16√2 ≈ 22,63', () => {
    const F = FIG.FIG_EX14;
    expect(ang(F, 'A', 'B', 'C')).toBeCloseTo(135, 1);
    expect(dist(F, 'O', 'L')).toBeCloseTo(2, 2);
    expect(dist(F, 'B', 'L')).toBeCloseTo(2, 2);
    expect(ang(F, 'B', 'L', 'O')).toBeCloseTo(90, 1);
    expect(dist(F, 'O', 'A')).toBeCloseTo(Math.sqrt(8), 2);
    const area = 8 * 0.5 * Math.sqrt(8) * 2;
    expect(area).toBeCloseTo(16 * Math.sqrt(2), 9);
    expect(R.area(8, Math.sqrt(8)).number).toBeCloseTo(area, 6);
    expect(Math.round(area * 100) / 100).toBe(22.63);
  });
  it('تمرين 19 : côté 16 = rayon, OH = 8√3, S = 384√3, S/S′ = 3√3/(2π) ≈ 0,83', () => {
    const F = FIG.FIG_EX19;
    expect(dist(F, 'A', 'B')).toBeCloseTo(16, 2);
    expect(dist(F, 'O', 'A')).toBeCloseTo(16, 2);
    expect(dist(F, 'O', 'H')).toBeCloseTo(8 * Math.sqrt(3), 2);
    expect(R.area(6, 16).number).toBeCloseTo(384 * Math.sqrt(3), 6);
    expect(Math.round((384 * Math.sqrt(3)) / (256 * Math.PI) * 100) / 100).toBe(0.83);
  });
  it('تمرين 15 : C, D, E, F images successives de B par (A, 72°) ; F ↦ B ; FB ≈ 4,70 ; aire du cercle 16π ≈ 50,27', () => {
    const F = FIG.FIG_EX15;
    const A = p(F, 'A');
    const opt = { tol: 1e-3, tolDeg: TOL };
    for (const [m, n] of [['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'F'], ['F', 'B']]) expect(R.imageCheck(A, p(F, m), p(F, n), 72, 'direct', opt).ok, `${m}→${n}`).toBe(true);
    expect(dist(F, 'F', 'B')).toBeCloseTo(4.70, 2);
    expect(R.sideFromRadius(5, 4).number).toBeCloseTo(4.70, 2);
    expect(dist(F, 'A', 'B')).not.toBeCloseTo(dist(F, 'B', 'C'), 1); // ABCDEF n'est pas régulier (la coquille)
    expect(Math.round(16 * Math.PI * 100) / 100).toBe(50.27);
  });
});

describe('le تحدّ — l’étoile du drapeau', () => {
  it('AOB = 72°, AB = 10,00 cm avec R ≈ 8,51 ; la branche AC ≈ 16,18 ; R = 10 donnerait ≈ 11,76', () => {
    const F = FIG.FIG_CHALLENGE_SOL;
    expect(ang(F, 'A', 'O', 'B')).toBeCloseTo(72, 1);
    expect(dist(F, 'A', 'B')).toBeCloseTo(10, 2);
    expect(dist(F, 'A', 'C')).toBeCloseTo(16.18, 2);
    expect(R.radiusForChord(5, 10)).toBeCloseTo(8.51, 2);
    expect(R.chord(5, 10)).toBeCloseTo(11.76, 2);
    expect(5 / Math.cos((36 * Math.PI) / 180)).toBeCloseTo(6.18, 2);
  });
});

describe('le banc d’exercices — chaque `statement.figure` est lisible', () => {
  const bank = import.meta.glob('../../../../../../../../../../content/practice/4am/mudalaat-muntazama/level-*/*.json', { eager: true, import: 'default' });
  it('trouve les 50 exercices', () => {
    expect(Object.keys(bank).length).toBe(50);
  });
  it('validateGeoFigure et figureQuality sont vides pour chaque figure', () => {
    for (const [path, ex] of Object.entries(bank)) {
      const fig = ex.statement?.figure;
      if (!fig) continue;
      expect(validateGeoFigure(fig), path).toEqual([]);
      expect(figureQuality(fig), path).toEqual([]);
    }
  });
});
