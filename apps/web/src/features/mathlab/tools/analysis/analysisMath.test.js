import { describe, it, expect } from 'vitest';
import { compileSource, compileExpression } from '../functionGrapher/expressionEvaluator.js';
import { parseExpression } from '../functionGrapher/expressionParser.js';
import { differentiate } from './symbolicDerivative.js';
import {
  findRoots, findCriticalPoints, findVariationIntervals, findSignIntervals,
  findDiscontinuities, oneSidedLimit, twoSidedLimit, limitAtInfinity, findAsymptotes,
  averageRate, tangentInfo, riemannSum, definiteIntegral, signedAndGeometricArea,
  findIntersections, areaBetween, antiderivativeSampler, observedDomain, approachTable,
} from './analysisMath.js';

const f = (source) => compileSource(source).fn;
const df = (source) => {
  const parsed = parseExpression(source);
  const derivative = differentiate(parsed.ast);

  return derivative ? compileExpression(derivative) : null;
};
const xsOf = (list) => list.map((entry) => entry.x);

describe('les racines (§27)', () => {
  it('trouve les zéros simples', () => {
    expect(xsOf(findRoots(f('x^2-4x+3'), -10, 10))).toEqual([expect.closeTo(1, 6), expect.closeTo(3, 6)]);
    expect(xsOf(findRoots(f('x^3-3x'), -5, 5))).toEqual([
      expect.closeTo(-Math.sqrt(3), 6), expect.closeTo(0, 6), expect.closeTo(Math.sqrt(3), 6),
    ]);
  });

  /** x² TOUCHE l'axe sans le traverser : la distinction se voit sur le graphe. */
  it('distingue une racine double d’une racine simple', () => {
    const roots = findRoots(f('x^2'), -5, 5);
    expect(roots).toHaveLength(1);
    expect(roots[0].x).toBeCloseTo(0, 6);
    expect(roots[0].kind).toBe('touch');
    expect(findRoots(f('x^2-4x+3'), -10, 10)[0].kind).toBe('simple');
  });

  /**
   * LE piège : `1/x` change de signe en 0 sans s'y annuler. Un balayage naïf
   * y voit une racine et l'affiche sur l'axe — une faute mathématique.
   */
  it('ne prend JAMAIS un pôle pour une racine', () => {
    expect(findRoots(f('\\frac{1}{x}'), -5, 5)).toEqual([]);
    expect(findRoots(f('\\frac{1}{x^2}'), -5, 5)).toEqual([]);
  });

  it('trouve les zéros de sin sur plusieurs périodes', () => {
    expect(xsOf(findRoots(f('\\sin(x)'), -7, 7)).map((x) => Math.round(x * 1e6) / 1e6))
      .toEqual([-2 * Math.PI, -Math.PI, 0, Math.PI, 2 * Math.PI].map((x) => Math.round(x * 1e6) / 1e6));
  });
});

describe('les points critiques et la variation (§16, §17)', () => {
  it('classe un minimum et un maximum', () => {
    const points = findCriticalPoints(f('x^3-3x'), df('x^3-3x'), -5, 5);
    expect(points).toHaveLength(2);
    expect(points[0]).toMatchObject({ kind: 'max' });
    expect(points[0].x).toBeCloseTo(-1, 6);
    expect(points[1]).toMatchObject({ kind: 'min' });
    expect(points[1].x).toBeCloseTo(1, 6);
  });

  /**
   * §17 est catégorique : « Do not imply that every f'(x)=0 point is
   * automatically an extremum. » x³ a une tangente horizontale en 0 et AUCUN
   * extremum. Le classer « minimum » serait enseigner une erreur.
   */
  it('n’appelle pas extremum une tangente horizontale qui n’en est pas une', () => {
    const points = findCriticalPoints(f('x^3'), df('x^3'), -5, 5);
    expect(points).toHaveLength(1);
    expect(points[0].x).toBeCloseTo(0, 5);
    expect(points[0].kind).toBe('stationary');
  });

  /**
   * La fenêtre ne doit RIEN changer aux mathématiques.
   *
   * La QA navigateur a trouvé x³ sans aucun point critique sur une fenêtre
   * dissymétrique ([−3,9 ; 7,9]) alors qu'il en avait un sur [−5 ; 5] : le
   * seuil de détection se lisait sur l'amplitude de f′ à l'écran. Un élève
   * qui déplace son cadre voyait le point stationnaire apparaître et
   * disparaître.
   */
  it.each([
    [-5, 5], [-3.92, 7.92], [-1, 9], [-8, 2.5],
  ])('trouve le point stationnaire de x³ quelle que soit la fenêtre [%s ; %s]', (from, to) => {
    const points = findCriticalPoints(f('x^3'), df('x^3'), from, to);
    expect(points).toHaveLength(1);
    expect(points[0].x).toBeCloseTo(0, 4);
    expect(points[0].kind).toBe('stationary');
  });

  it('ne voit AUCUN point critique là où f′ ne s’annule pas', () => {
    expect(findCriticalPoints(f('2x+1'), df('2x+1'), -5, 5)).toEqual([]);
    expect(findCriticalPoints(f('\\frac{1}{x}'), df('\\frac{1}{x}'), -5, 5)).toEqual([]);
    // x³ sur un intervalle qui ne contient pas 0 : rien non plus.
    expect(findCriticalPoints(f('x^3'), df('x^3'), 0.5, 9)).toEqual([]);
  });

  it('découpe la variation aux points critiques', () => {
    const intervals = findVariationIntervals(f('x^2-4x+3'), df('x^2-4x+3'), -6, 10);
    expect(intervals).toHaveLength(2);
    expect(intervals[0].direction).toBe('decreasing');
    expect(intervals[0].to).toBeCloseTo(2, 5);
    expect(intervals[1].direction).toBe('increasing');
  });

  /** 1/x décroît sur ]−∞,0[ ET sur ]0,+∞[ — jamais « sur ℝ∗ » d'un seul tenant. */
  it('coupe la variation à une discontinuité', () => {
    const intervals = findVariationIntervals(f('\\frac{1}{x}'), df('\\frac{1}{x}'), -5, 5);
    expect(intervals).toHaveLength(2);
    expect(intervals.every((interval) => interval.direction === 'decreasing')).toBe(true);
    expect(intervals[0].to).toBeCloseTo(0, 5);
    expect(intervals[1].from).toBeCloseTo(0, 5);
  });

  it('rend le signe de f par intervalles', () => {
    const signs = findSignIntervals(f('x^2-4x+3'), -6, 10);
    expect(signs.map((interval) => interval.sign)).toEqual([1, -1, 1]);
  });
});

describe('les discontinuités (§15)', () => {
  it('reconnaît une discontinuité infinie', () => {
    const breaks = findDiscontinuities(f('\\frac{1}{x}'), -5, 5);
    expect(breaks).toHaveLength(1);
    expect(breaks[0].x).toBeCloseTo(0, 6);
    expect(breaks[0].kind).toBe('infinite');
  });

  /**
   * Le TROU de (x²−1)/(x−1) en 1 : les deux limites valent 2, mais f n'y est
   * pas définie. C'est la discontinuité « removable » de §15, et c'est celle
   * qu'un balayage distrait déclare continue.
   */
  it('reconnaît un trou (discontinuité apparente)', () => {
    const breaks = findDiscontinuities(f('\\frac{x^2-1}{x-1}'), -5, 5);
    expect(breaks).toHaveLength(1);
    expect(breaks[0].x).toBeCloseTo(1, 5);
    expect(breaks[0].kind).toBe('removable');
    expect(breaks[0].left).toBeCloseTo(2, 4);
    expect(breaks[0].right).toBeCloseTo(2, 4);
  });

  /**
   * Un trou est de MESURE NULLE : aucun balayage ne garantit de tomber dessus.
   * La QA navigateur a vu le trou de (x²−1)/(x−1) disparaître sur une fenêtre
   * dont le pas (0,0247) enjambait exactement x = 1. Quand l'élève DÉSIGNE un
   * point — le a de lim x→a — on le sonde directement.
   */
  it('trouve un trou que la grille enjambe, si l’élève a désigné le point', () => {
    const hole = f('\\frac{x^2-1}{x-1}');
    // Cette fenêtre-là ne tombe PAS sur x = 1.
    expect(findDiscontinuities(hole, -3.9231, 7.9231, { samples: 480 })).toEqual([]);
    const probed = findDiscontinuities(hole, -3.9231, 7.9231, { samples: 480, probe: 1 });
    expect(probed).toHaveLength(1);
    expect(probed[0]).toMatchObject({ kind: 'removable' });
    expect(probed[0].x).toBeCloseTo(1, 9);
  });

  it('sonder un point CONTINU n’invente aucune rupture', () => {
    expect(findDiscontinuities(f('x^2'), -5, 5, { samples: 480, probe: 2 })).toEqual([]);
    expect(findDiscontinuities(f('\\sin(x)'), -5, 5, { samples: 480, probe: 0 })).toEqual([]);
  });

  it('ne voit aucune rupture là où il n’y en a pas', () => {
    expect(findDiscontinuities(f('x^2'), -5, 5)).toEqual([]);
    expect(findDiscontinuities(f('\\sin(x)'), -5, 5)).toEqual([]);
  });

  /**
   * Une PENTE RAIDE n'est pas une rupture.
   *
   * Près d'un pôle, `1/x` varie de 83 entre deux échantillons voisins, et
   * ses limites à gauche et à droite s'y lisent 83,34 et 83,33 — du bruit
   * d'échantillonnage. La QA visuelle a vu une SECONDE double barre
   * apparaître sur le tableau de variations de 1/x, à x = 0,012, où la
   * fonction est parfaitement continue.
   */
  it('ne prend pas une pente raide pour une discontinuité', () => {
    const steep = findDiscontinuities(f('1000x'), -5, 5, { samples: 480 });
    expect(steep).toEqual([]);
    /**
     * Autour de son pôle, 1/x n'a QU'UNE rupture : le pôle lui-même — et
     * cela ne doit pas dépendre de l'endroit où la grille tombe. Sur
     * [−3,9231 ; 7,9231], une SECONDE double barre apparaissait à x = 0,00095,
     * là où les deux limites sont trop instables pour se lire : deux limites
     * introuvables ne prouvent aucun saut.
     */
    for (const [from, to] of [[-5, 5], [-3.68, 7.68], [-3.9231, 7.9231], [-1, 9], [-2, 6], [-10, 10]]) {
      const breaks = findDiscontinuities(f('\\frac{1}{x}'), from, to, { samples: 480, probe: 0 });
      expect(breaks, `[${from} ; ${to}]`).toHaveLength(1);
      expect(breaks[0].kind).toBe('infinite');
      expect(breaks[0].x).toBeCloseTo(0, 6);
    }
  });

  /**
   * Le BORD DU DOMAINE n'est pas une rupture : `√x` en 0 ne saute pas, la
   * courbe y COMMENCE. Une double barre au départ de la courbe ferait croire
   * le contraire.
   */
  it('ne prend pas un bord de domaine pour une discontinuité', () => {
    expect(findDiscontinuities(f('\\sqrt{x}'), -3, 5, { samples: 480 })).toEqual([]);
  });

  /**
   * Un bord OÙ LA FONCTION PART À L'INFINI, lui, est une asymptote verticale.
   *
   * Ce test attendait autrefois `[]` pour ln(x) : la table d'approche de ln
   * en 0⁺ (−6,9 ; −9,2 ; −11,5 ; −13,8) était lue comme une limite FINIE
   * « ≈ −14 », donc le point passait pour un simple bord, comme √x. Or
   * lim(x→0⁺) ln x = −∞ : la droite x = 0 est une asymptote verticale, et
   * ln doit être traité exactement comme 1/√x, qui l'était déjà.
   */
  it('reconnaît l’asymptote verticale au bord du domaine de ln', () => {
    const breaks = findDiscontinuities(f('\\ln(x)'), -3, 5, { samples: 480 });
    expect(breaks).toHaveLength(1);
    expect(breaks[0]).toMatchObject({ kind: 'infinite' });
    expect(breaks[0].x).toBeCloseTo(0, 6);
    expect(findDiscontinuities(f('\\frac{1}{\\sqrt{x}}'), -3, 5, { samples: 480 })[0]).toMatchObject({ kind: 'infinite' });
  });
});

describe('les limites (§11 – §14)', () => {
  it('construit la table d’approche que l’élève lit', () => {
    const table = approachTable(f('x^2'), 2, 'left');
    expect(table[0].x).toBeCloseTo(1, 10);
    expect(table[table.length - 1].x).toBeLessThan(2);
    expect(table[table.length - 1].y).toBeCloseTo(4, 4);
  });

  it('lit une limite finie', () => {
    const limit = oneSidedLimit(f('\\frac{\\sin(x)}{x}'), 0, 'right');
    expect(limit.kind).toBe('finite');
    expect(limit.value).toBeCloseTo(1, 6);
    // §35 : une limite lue sur une table est APPROCHÉE, et le dit.
    expect(limit.approximate).toBe(true);
  });

  /** §12 : les deux côtés diffèrent → on rend LES DEUX, la raison est visible. */
  it('montre les deux côtés quand ils diffèrent', () => {
    const limit = twoSidedLimit(f('\\frac{1}{x}'), 0);
    expect(limit.agree).toBe(false);
    expect(limit.value).toBeNull();
    expect(limit.left).toMatchObject({ kind: 'infinite', sign: -1 });
    expect(limit.right).toMatchObject({ kind: 'infinite', sign: 1 });
  });

  it('reconnaît une limite infinie des deux côtés (§13)', () => {
    const limit = twoSidedLimit(f('\\frac{1}{x^2}'), 0);
    expect(limit.left).toMatchObject({ kind: 'infinite', sign: 1 });
    expect(limit.right).toMatchObject({ kind: 'infinite', sign: 1 });
    expect(limit.agree).toBe(true);
  });

  /**
   * Une droite A une limite en chacun de ses points : la valeur f(a).
   *
   * La table s'arrête à δ = 1e−6 de a, et une pente m y décale les deux
   * lectures de ∓m·1e−6. Comparées brutes à 1e−6 près, elles « différaient » :
   * l'état PAR DÉFAUT du laboratoire (f = 2x + 1, a = 0) annonçait
   * « النهايتان مختلفتان » — 658 droites sur 2 057 aux points entiers ou
   * demi-entiers. L'attendu est calculé à part : f(a) = m·a + p.
   */
  it('lit la limite d’une droite en tout point, par défaut 2x + 1 en 0', () => {
    const limit = twoSidedLimit(f('2x+1'), 0);
    expect(limit.agree).toBe(true);
    expect(limit.left.value).toBeCloseTo(1, 8);
    expect(limit.right.value).toBeCloseTo(1, 8);

    const refused = [];
    for (let m = -5; m <= 5; m += 1) {
      for (let p = -5; p <= 5; p += 1) {
        const source = `${m}x+${p}`.replace('+-', '-');
        for (let a = -4; a <= 4; a += 0.5) {
          const reading = twoSidedLimit(f(source), a);
          const expected = m * a + p;
          if (!reading.agree || Math.abs(reading.value.value - expected) > 1e-6) refused.push(`${source} @ ${a}`);
        }
      }
    }
    expect(refused).toEqual([]);
  });

  it('lit la limite d’un polynôme en tout point (valeur calculée à part)', () => {
    const polynomials = [
      ['x^3', (x) => x ** 3],
      ['x^2-4x+3', (x) => x * x - 4 * x + 3],
      ['x^3-3x', (x) => x ** 3 - 3 * x],
      ['4-x^2', (x) => 4 - x * x],
      ['1000x+1', (x) => 1000 * x + 1],
    ];
    for (const [source, exact] of polynomials) {
      for (let a = -3; a <= 3; a += 0.5) {
        const reading = twoSidedLimit(f(source), a);
        expect(reading.agree, `${source} @ ${a}`).toBe(true);
        expect(reading.value.value, `${source} @ ${a}`).toBeCloseTo(exact(a), 6);
      }
    }
  });

  /** Les vrais sauts restent des sauts : leurs côtés sont CONSTANTS. */
  it('dit « différentes » pour un vrai saut', () => {
    const sign = twoSidedLimit(Math.sign, 0);
    expect(sign.agree).toBe(false);
    expect(sign.left.value).toBe(-1);
    expect(sign.right.value).toBe(1);

    const stairs = twoSidedLimit(Math.floor, 2);
    expect(stairs.agree).toBe(false);
    expect(stairs.left.value).toBe(1);
    expect(stairs.right.value).toBe(2);

    const quotient = twoSidedLimit(f('\\frac{|x|}{x}'), 0);
    expect(quotient.agree).toBe(false);

    // Un petit saut sur une pente raide reste visible : 0,01 contre une pente de 1.
    const smallJump = twoSidedLimit((x) => x + (x >= 1 ? 0.01 : 0), 1);
    expect(smallJump.agree).toBe(false);
  });

  /** Le trou : (x² − 4)/(x − 2) n'est pas définie en 2, sa limite vaut 4 (x + 2 en 2). */
  it('lit la limite à travers un trou', () => {
    const limit = twoSidedLimit(f('\\frac{x^2-4}{x-2}'), 2);
    expect(limit.agree).toBe(true);
    expect(limit.value.value).toBeCloseTo(4, 6);
  });

  /** Deux côtés illisibles ne font pas une limite. */
  it('ne déclare pas « égales » deux limites qui n’existent pas', () => {
    const limit = twoSidedLimit(f('\\sin(\\frac{1}{x})'), 0);
    expect(limit.left.kind).toBe('none');
    expect(limit.agree).toBe(false);
    expect(limit.value).toBeNull();
  });

  /** ln|x| → −∞ en 0 : une divergence LENTE (logarithmique) reste une divergence. */
  it('lit −∞ pour ln|x| en 0, pas une valeur finie', () => {
    const limit = twoSidedLimit(f('\\ln(|x|)'), 0);
    expect(limit.left).toMatchObject({ kind: 'infinite', sign: -1 });
    expect(limit.right).toMatchObject({ kind: 'infinite', sign: -1 });
    expect(limit.agree).toBe(true);
  });

  /** Au bord de √ (f ≈ √δ), l'extrapolation rend 0, pas le dernier échantillon 0,001. */
  it('extrapole la limite au bord de √x', () => {
    const limit = oneSidedLimit(f('\\sqrt{x}'), 0, 'right');
    expect(limit.kind).toBe('finite');
    expect(Math.abs(limit.value)).toBeLessThan(1e-6);
  });

  it('lit une limite à l’infini (§14)', () => {
    expect(limitAtInfinity(f('\\frac{1}{x}'), '+')).toMatchObject({ kind: 'finite' });
    expect(limitAtInfinity(f('\\frac{1}{x}'), '+').value).toBeCloseTo(0, 6);
    expect(limitAtInfinity(f('\\frac{2x+1}{x-3}'), '+').value).toBeCloseTo(2, 4);
    expect(limitAtInfinity(f('x^2'), '+')).toMatchObject({ kind: 'infinite', sign: 1 });
  });
});

describe('les asymptotes (§16)', () => {
  it('trouve une asymptote verticale et une horizontale', () => {
    const asymptotes = findAsymptotes(f('\\frac{1}{x}'), -10, 10);
    expect(asymptotes.vertical).toEqual([{ x: 0 }]);
    // Exactement 0 : `y = 0,0000001` serait faux pour l'élève.
    expect(asymptotes.horizontal.every((entry) => entry.y === 0)).toBe(true);
  });

  it('trouve y = 2 pour (2x+1)/(x−3)', () => {
    const asymptotes = findAsymptotes(f('\\frac{2x+1}{x-3}'), -20, 20);
    expect(asymptotes.vertical[0].x).toBeCloseTo(3, 5);
    expect(asymptotes.horizontal.every((entry) => entry.y === 2)).toBe(true);
  });

  /**
   * L'asymptote oblique est le piège NUMÉRIQUE du fichier : f(x) − m·x à
   * x = 10⁷ annule catastrophiquement si m porte la moindre erreur.
   */
  it('trouve une asymptote oblique', () => {
    const asymptotes = findAsymptotes(f('\\frac{x^2+1}{x}'), -10, 10);
    expect(asymptotes.oblique).toHaveLength(2);
    expect(asymptotes.oblique[0].slope).toBe(1);
    expect(asymptotes.oblique[0].intercept).toBeCloseTo(0, 5);

    const shifted = findAsymptotes(f('\\frac{x^2}{x-1}'), -10, 10);
    expect(shifted.oblique[0].slope).toBe(1);
    expect(shifted.oblique[0].intercept).toBeCloseTo(1, 5);
  });

  it('n’invente pas d’asymptote à une parabole', () => {
    const asymptotes = findAsymptotes(f('x^2'), -10, 10);
    expect(asymptotes.vertical).toEqual([]);
    expect(asymptotes.horizontal).toEqual([]);
    expect(asymptotes.oblique).toEqual([]);
  });
});

describe('sécante et tangente (§7, §8, §10)', () => {
  it('calcule le taux d’accroissement moyen — le geste du programme de 4AM', () => {
    const rate = averageRate(f('x^2'), 1, 3);
    expect(rate.ok).toBe(true);
    expect(rate.slope).toBe(4);            // (9 − 1)/(3 − 1)
    expect(averageRate(f('2x+1'), -5, 5).slope).toBe(2);
  });

  it('refuse un taux sur un point unique ou hors domaine', () => {
    expect(averageRate(f('x^2'), 2, 2)).toMatchObject({ ok: false, reason: 'samePoint' });
    expect(averageRate(f('\\sqrt{x}'), -1, 4)).toMatchObject({ ok: false, reason: 'undefined' });
  });

  /**
   * §8 : quand B s'approche de A, la sécante tend vers la tangente. Ce n'est
   * pas une phrase : la pente de la sécante doit converger vers f′(a).
   */
  it('la sécante tend vers la tangente quand B → A', () => {
    const square = f('x^2');
    const slopes = [1, 0.1, 0.01, 0.001].map((gap) => averageRate(square, 2, 2 + gap).slope);
    for (const slope of slopes) expect(slope).toBeGreaterThan(4);
    expect(slopes[slopes.length - 1]).toBeCloseTo(4, 2);
    expect(tangentInfo(square, 2, df('x^2')).slope).toBe(4);
  });

  /** §35 : une pente issue de la règle est EXACTE, une pente mesurée ne l'est pas. */
  it('dit si la pente est symbolique ou mesurée', () => {
    expect(tangentInfo(f('x^2'), 2, df('x^2'))).toMatchObject({ exact: true, slope: 4 });
    expect(tangentInfo(f('x^2'), 2, null)).toMatchObject({ exact: false });
    expect(tangentInfo(f('\\left|x\\right|'), 0, null)).toMatchObject({ ok: false, reason: 'corner' });
    expect(tangentInfo(f('\\sqrt{x}'), -1, null)).toMatchObject({ ok: false, reason: 'undefined' });
  });
});

describe('l’intégrale et les sommes de Riemann (§19 – §23)', () => {
  it('intègre exactement ce qu’on sait à la main', () => {
    expect(definiteIntegral(f('x^2'), 0, 1).value).toBeCloseTo(1 / 3, 9);
    expect(definiteIntegral(f('\\sin(x)'), 0, Math.PI).value).toBeCloseTo(2, 9);
    expect(definiteIntegral(f('\\frac{1}{x}'), 1, 2).value).toBeCloseTo(Math.log(2), 9);
    expect(definiteIntegral(f('x'), 0, 4).value).toBeCloseTo(8, 9);
  });

  it('respecte l’orientation : ∫ᵇₐ = −∫ₐᵇ', () => {
    expect(definiteIntegral(f('x^2'), 1, 0).value).toBeCloseTo(-1 / 3, 9);
  });

  /** §35 : une quadrature n'est pas une primitive — elle le dit. */
  it('déclare son résultat approché', () => {
    expect(definiteIntegral(f('x^2'), 0, 1).approximate).toBe(true);
  });

  /** §21 : l'intégrale SIGNÉE et l'aire GÉOMÉTRIQUE ne coïncident pas toujours. */
  it('distingue l’intégrale signée de l’aire géométrique', () => {
    const area = signedAndGeometricArea(f('\\sin(x)'), 0, 2 * Math.PI);
    expect(area.signed.value).toBeCloseTo(0, 6);
    expect(area.geometric.value).toBeCloseTo(4, 5);
    expect(area.differ).toBe(true);

    const positive = signedAndGeometricArea(f('x^2'), 0, 1);
    expect(positive.differ).toBe(false);
  });

  /** Une singularité DANS l'intervalle : on refuse plutôt que de mentir. */
  it('refuse une intégrale impropre', () => {
    expect(definiteIntegral(f('\\frac{1}{x}'), -1, 1)).toMatchObject({ ok: false, reason: 'singularity' });
  });

  /** §20 : quand n grandit, l'approximation s'améliore — visiblement. */
  it('les sommes de Riemann convergent quand n grandit', () => {
    const square = f('x^2');
    const errors = [2, 5, 10, 50, 200].map((n) => Math.abs(riemannSum(square, 0, 1, n, 'left').sum - 1 / 3));
    for (let i = 1; i < errors.length; i += 1) expect(errors[i]).toBeLessThan(errors[i - 1]);
    expect(errors[errors.length - 1]).toBeLessThan(0.01);
  });

  it('les quatre modes encadrent la valeur', () => {
    const square = f('x^2');
    expect(riemannSum(square, 0, 1, 100, 'left').sum).toBeLessThan(1 / 3);
    expect(riemannSum(square, 0, 1, 100, 'right').sum).toBeGreaterThan(1 / 3);
    expect(riemannSum(square, 0, 1, 100, 'midpoint').sum).toBeCloseTo(1 / 3, 4);
    expect(riemannSum(square, 0, 1, 100, 'trapezoid').sum).toBeCloseTo(1 / 3, 4);
  });

  it('rend les rectangles eux-mêmes — c’est le dessin qui enseigne', () => {
    const { rectangles, width } = riemannSum(f('x^2'), 0, 1, 4, 'left');
    expect(rectangles).toHaveLength(4);
    expect(width).toBeCloseTo(0.25, 12);
    expect(rectangles[0]).toMatchObject({ x0: 0, defined: true });
    expect(rectangles[3].height).toBeCloseTo(0.5625, 12);
  });

  it('marque un rectangle non défini plutôt que de le compter zéro', () => {
    const { rectangles, defined } = riemannSum(f('\\sqrt{x}'), -1, 1, 4, 'left');
    expect(defined).toBe(false);
    expect(rectangles.some((rectangle) => rectangle.defined === false)).toBe(true);
  });
});

describe('intersections et aire entre deux courbes (§23, §26)', () => {
  it('trouve les intersections', () => {
    const points = findIntersections(f('x^2'), f('x+2'), -10, 10);
    expect(points).toHaveLength(2);
    expect(points[0].x).toBeCloseTo(-1, 6);
    expect(points[1].x).toBeCloseTo(2, 6);
  });

  it('calcule l’aire entre deux courbes', () => {
    // Les bornes SONT les intersections : on intègre donc sur un intervalle
    // un peu plus large pour que les deux croisements tombent à l'intérieur.
    const between = areaBetween(f('x+2'), f('x^2'), -1, 2);
    expect(between.area.value).toBeCloseTo(4.5, 6);

    const wider = areaBetween(f('x+2'), f('x^2'), -3, 4);
    expect(wider.crossings.map((point) => Math.round(point.x * 1e6) / 1e6)).toEqual([-1, 2]);
  });
});

describe('primitive et domaine (§16, §22)', () => {
  /** §22 : ajouter C translate F sans changer sa pente. */
  it('une primitive translatée garde sa pente', () => {
    const base = antiderivativeSampler(f('x^2'), 0, 0);
    const shifted = antiderivativeSampler(f('x^2'), 0, 5);
    expect(base(1)).toBeCloseTo(1 / 3, 5);
    expect(shifted(1)).toBeCloseTo(1 / 3 + 5, 5);
    // La DIFFÉRENCE est constante : c'est exactement ce que « + C » veut dire.
    for (const x of [0.5, 1, 1.5, 2]) expect(shifted(x) - base(x)).toBeCloseTo(5, 5);
  });

  it('observe le domaine dans la fenêtre', () => {
    const domain = observedDomain(f('\\sqrt{x}'), -5, 5);
    expect(domain).toHaveLength(1);
    expect(domain[0].from).toBeCloseTo(0, 2);
    expect(observedDomain(f('x^2'), -5, 5)).toHaveLength(1);
    // 1/x : deux morceaux, séparés par le pôle.
    expect(observedDomain(f('\\frac{1}{x}'), -5, 5).length).toBeGreaterThanOrEqual(1);
  });
});
