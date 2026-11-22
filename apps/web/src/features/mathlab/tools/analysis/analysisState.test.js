import { describe, it, expect } from 'vitest';
import {
  createAnalysisData, normalizeAnalysisData, ANALYSIS_SCHEMA_VERSION, LABS,
  setLab, setSource, setPoint, setBounds, setRiemann, setParameter,
  setTransform, applyPreset, toggleLayer, addSecondFunction, removeSecondFunction,
  recordPractice, MAX_FUNCTIONS, MAX_RIEMANN_N, MIN_RIEMANN_N, MAX_SOURCE_LENGTH,
} from './analysisState.js';
import { layersForLab, LAYER_KEYS, DEFAULT_LAYERS } from './layers.js';
import { summarizeAnalysis } from './summarize.js';
import { PRESETS, PARAMETRIC_PRESETS, TRANSFORMATIONS, substituteX } from './presets.js';
import { compileSource } from '../functionGrapher/expressionEvaluator.js';
import { fitViewportToAspect } from '../functionGrapher/viewport.js';

/** Ce que le serveur accepte pour cet instrument (MathLabTools.php). */
const MAX_BYTES = 8_000;
const bytesOf = (value) => new TextEncoder().encode(JSON.stringify(value)).length;

describe('le document', () => {
  it('naît sur le laboratoire de la SÉCANTE, avec une fonction affine', () => {
    const data = createAnalysisData();
    // Le seul ancrage au collège du calcul différentiel est le taux d'accroissement
    // d'une fonction affine : c'est lui qui ouvre (MATH_LAB §5m.1).
    expect(data.lab).toBe('secant');
    expect(data.functions[0].source).toBe('2x+1');
    expect(data.layers.secant).toBe(true);
    expect(data.layers.riseRun).toBe(true);
    // Rien du lycée n'est allumé au premier écran.
    expect(data.layers.derivativeCurve).toBe(false);
    expect(data.layers.riemann).toBe(false);
    expect(data.layers.approach).toBe(false);
  });

  it('tient dans la borne du serveur, même au pire', () => {
    expect(bytesOf(createAnalysisData())).toBeLessThan(MAX_BYTES);

    let worst = createAnalysisData();
    worst = addSecondFunction(worst, 'x'.repeat(MAX_SOURCE_LENGTH));
    worst = setSource(worst, 'f', 'x'.repeat(MAX_SOURCE_LENGTH));
    worst = setTransform(worst, { id: 'verticalShift', value: 3 });
    worst = { ...worst, view: { xMin: -1234.5678, xMax: 1234.5678, yMin: -1234.5678, yMax: 1234.5678 } };
    for (const key of LAYER_KEYS) worst = toggleLayer(worst, key);
    expect(bytesOf(worst)).toBeLessThan(MAX_BYTES);
  });

  it('a une version de schéma entière', () => {
    expect(Number.isInteger(ANALYSIS_SCHEMA_VERSION)).toBe(true);
    expect(ANALYSIS_SCHEMA_VERSION).toBeGreaterThanOrEqual(1);
  });
});

describe('la normalisation ne croit RIEN sur parole', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['un nombre', 42],
    ['une chaîne', 'x'],
    ['un tableau', []],
    ['un objet vide', {}],
    ['des champs absurdes', { lab: 'inconnu', functions: 'pas un tableau', point: 'x', layers: 3, practice: null }],
    ['des fonctions cassées', { functions: [null, {}, { source: '' }] }],
    ['une fenêtre impossible', { view: { xMin: 5, xMax: 1, yMin: 0, yMax: 0 } }],
    ['des nombres non finis', { point: Infinity, secondPoint: NaN, constant: -Infinity }],
  ])('%s → un document valide', (_label, input) => {
    const data = normalizeAnalysisData(input);
    expect(LABS).toContain(data.lab);
    expect(Array.isArray(data.functions)).toBe(true);
    expect(data.functions.length).toBeGreaterThanOrEqual(1);
    expect(Number.isFinite(data.point)).toBe(true);
    expect(Number.isFinite(data.secondPoint)).toBe(true);
    expect(data.riemann.n).toBeGreaterThanOrEqual(MIN_RIEMANN_N);
    expect(data.riemann.n).toBeLessThanOrEqual(MAX_RIEMANN_N);
    for (const key of LAYER_KEYS) expect(typeof data.layers[key]).toBe('boolean');
  });

  it('borne le nombre de fonctions et la longueur d’une expression', () => {
    const data = normalizeAnalysisData({ functions: [{ source: 'x' }, { source: 'x' }, { source: 'x' }] });
    expect(data.functions.length).toBeLessThanOrEqual(MAX_FUNCTIONS);
    expect(normalizeAnalysisData({ functions: [{ source: 'x'.repeat(5000) }] }).functions[0].source.length)
      .toBeLessThanOrEqual(MAX_SOURCE_LENGTH);
  });

  it('garde un document valide intact', () => {
    const data = applyPreset(createAnalysisData(), 'parabola');
    expect(normalizeAnalysisData(JSON.parse(JSON.stringify(data)))).toEqual(data);
  });
});

describe('les transitions sont pures', () => {
  it('ne modifient jamais l’état reçu', () => {
    const data = createAnalysisData();
    const snapshot = JSON.parse(JSON.stringify(data));
    setLab(data, 'limit');
    setPoint(data, 5);
    setBounds(data, 1, 2);
    setRiemann(data, { n: 50 });
    setParameter(data, 'a', 3);
    toggleLayer(data, 'roots');
    addSecondFunction(data);
    recordPractice(data, true);
    expect(data).toEqual(snapshot);
  });

  it('refusent une valeur qui n’a pas de sens', () => {
    const data = createAnalysisData();
    expect(setLab(data, 'inconnu')).toBe(data);
    expect(setPoint(data, NaN)).toBe(data);
    expect(setParameter(data, 'z', 1)).toBe(data);
    expect(toggleLayer(data, 'inconnue')).toBe(data);
    expect(removeSecondFunction(data)).toBe(data);
  });

  it('bornent le nombre de rectangles', () => {
    const data = createAnalysisData();
    expect(setRiemann(data, { n: 99999 }).riemann.n).toBe(MAX_RIEMANN_N);
    expect(setRiemann(data, { n: -5 }).riemann.n).toBe(MIN_RIEMANN_N);
    expect(setRiemann(data, { mode: 'inconnu' }).riemann.mode).toBe('left');
  });

  it('comptent l’entraînement sans rien d’autre', () => {
    let data = createAnalysisData();
    data = recordPractice(data, true);
    data = recordPractice(data, false);
    expect(data.practice).toEqual({ solved: 1, seen: 2 });
    // Ni série, ni médaille, ni horodatage : le score et rien de plus (§43).
    expect(Object.keys(data.practice)).toEqual(['solved', 'seen']);
  });
});

describe('les couches suivent le laboratoire', () => {
  it('allument ce que l’expérience demande et éteignent le reste', () => {
    const secant = layersForLab('secant', DEFAULT_LAYERS);
    expect(secant.secant).toBe(true);
    expect(secant.riemann).toBe(false);

    const integral = layersForLab('integral', DEFAULT_LAYERS);
    expect(integral.area).toBe(true);
    expect(integral.riemann).toBe(true);
    expect(integral.secant).toBe(false);
  });

  /** La grille appartient au REPÈRE, pas à l'expérience : elle ne bouge jamais. */
  it('ne touchent jamais à la grille', () => {
    const off = { ...DEFAULT_LAYERS, grid: false };
    for (const lab of LABS) expect(layersForLab(lab, off).grid).toBe(false);
    for (const lab of LABS) expect(layersForLab(lab, DEFAULT_LAYERS).grid).toBe(true);
  });
});

describe('les préréglages', () => {
  it('sont tous analysables par le moteur du grapheur', () => {
    for (const preset of PRESETS) {
      expect(compileSource(preset.source).ok, preset.id).toBe(true);
    }
    for (const preset of PARAMETRIC_PRESETS) {
      expect(compileSource(preset.source, { variables: ['x', 'a', 'b', 'c'] }).ok, preset.id).toBe(true);
    }
  });

  /** §37 : le premier écran ne propose que ce qui relève du programme. */
  it('distinguent le programme du collège du reste', () => {
    const programme = PRESETS.filter((preset) => preset.level === 'programme');
    expect(programme.length).toBeGreaterThan(0);
    // Les fonctions du programme sont affines ou linéaires — rien d'autre.
    for (const preset of programme) {
      expect(preset.source, preset.id).not.toMatch(/\^|sin|cos|sqrt|ln|exp|frac/);
    }
  });

  /**
   * Le repère est ORTHONORMÉ : le plan ÉLARGIT l'axe le plus court pour
   * épouser la boîte. Une fenêtre plate (sin sur x ∈ [−7 ; 7], y ∈ [−2 ; 2])
   * se fait donc étirer en y, et la courbe n'occupe plus qu'un tiers de la
   * hauteur — la QA visuelle l'a vu. Une fenêtre de préréglage doit être
   * déjà À PEU PRÈS CARRÉE, sinon elle ne cadre pas ce qu'elle promet.
   */
  it('proposent une fenêtre que le repère orthonormé ne déforme pas', () => {
    // La boîte de référence mesurée en QA sur un écran d'ordinateur.
    const [width, height] = [644, 598];
    for (const preset of PRESETS) {
      const fitted = fitViewportToAspect(preset.view, width, height);
      const wanted = preset.view.yMax - preset.view.yMin;
      const got = fitted.yMax - fitted.yMin;
      // Moins de 30 % de hauteur perdue : la courbe reste le sujet de l'image.
      expect(1 - wanted / got, `${preset.id} : fenêtre trop plate`).toBeLessThan(0.3);
    }
  });

  it('appliquent leur fenêtre ET leur laboratoire', () => {
    const data = applyPreset(createAnalysisData(), 'inverse');
    expect(data.functions[0].source).toBe('\\frac{1}{x}');
    expect(data.lab).toBe('limit');
    expect(data.view).toEqual({ xMin: -5, xMax: 5, yMin: -5, yMax: 5 });
  });
});

describe('les transformations (§25)', () => {
  /**
   * LE piège : `\exp(x)` ne doit pas devenir `\e(-x)p(-x)`. La substitution
   * saute les commandes LaTeX et ne remplace un `x` que s'il est isolé.
   */
  it('substituent x sans casser les noms de fonctions', () => {
    expect(substituteX('x^2', '(-x)')).toBe('(-x)^2');
    expect(substituteX('\\exp(x)', '(-x)')).toBe('\\exp((-x))');
    expect(substituteX('\\sin(x)+x', '(-x)')).toBe('\\sin((-x))+(-x)');
    expect(substituteX('e^x', '(-x)')).toBe('e^(-x)');
  });

  it('produisent toujours une expression analysable', () => {
    const sources = ['x^2', '\\sin(x)', '\\frac{1}{x}', '\\sqrt{x}', 'e^x', '2x+1', '\\left|x\\right|'];
    for (const transformation of TRANSFORMATIONS) {
      for (const source of sources) {
        const result = transformation.apply(source, transformation.defaultValue);
        expect(compileSource(result).ok, `${transformation.id} sur ${source} → ${result}`).toBe(true);
      }
    }
  });

  it('font ce qu’elles disent', () => {
    const shifted = TRANSFORMATIONS.find((entry) => entry.id === 'verticalShift').apply('x^2', 3);
    expect(compileSource(shifted).fn(2)).toBeCloseTo(7, 9);      // 4 + 3
    const reflected = TRANSFORMATIONS.find((entry) => entry.id === 'reflectX').apply('x^2', 1);
    expect(compileSource(reflected).fn(2)).toBeCloseTo(-4, 9);
    const horizontal = TRANSFORMATIONS.find((entry) => entry.id === 'horizontalShift').apply('x^2', 2);
    expect(compileSource(horizontal).fn(2)).toBeCloseTo(0, 9);   // (2−2)² = 0
  });
});

describe('le résumé pour « Mes travaux »', () => {
  /**
   * Le résumé doit parler la langue de `WorkPreview`, pas la sienne : forme
   * « curve », `detail.polylines` de points `{x, y}` et `detail.viewport` en
   * quadruplet. Écrit autrement, la carte reste blanche — et rien dans le
   * contrat n'échoue pour le signaler.
   */
  it('réutilise la forme « curve » de « Mes travaux », dans SON écriture', () => {
    const summary = summarizeAnalysis(createAnalysisData());
    expect(summary.kind).toBe('curve');
    expect(summary.text[0]).toBe('2x+1');

    expect(Array.isArray(summary.detail.polylines)).toBe(true);
    expect(summary.detail.polylines.length).toBeGreaterThan(0);
    const [first] = summary.detail.polylines;
    expect(typeof first.c).toBe('string');
    expect(Array.isArray(first.p)).toBe(true);
    for (const point of first.p) {
      expect(Number.isFinite(point.x), 'une abscisse est toujours un nombre').toBe(true);
      expect(point.y === null || Number.isFinite(point.y)).toBe(true);
    }

    expect(summary.detail.viewport).toHaveLength(4);
    expect(summary.detail.viewport.every(Number.isFinite)).toBe(true);
  });

  /**
   * La vignette ne doit pas TRAVERSER un pôle : l'échantillonneur ne tombe
   * presque jamais pile dessus, donc un saut plus haut que la fenêtre lève
   * le crayon (un point sans `y`).
   */
  it('coupe la vignette au pôle de 1/x', () => {
    const summary = summarizeAnalysis(applyPreset(createAnalysisData(), 'inverse'));
    const lifts = summary.detail.polylines[0].p.filter((point) => point.y === null);
    expect(lifts.length).toBeGreaterThan(0);
  });

  it('dessine la SECONDE fonction quand il y en a une', () => {
    const data = addSecondFunction(createAnalysisData(), 'x^2');
    expect(summarizeAnalysis(data).detail.polylines).toHaveLength(2);
  });

  it('reste minuscule — le serveur ignore au-delà de 2 Ko', () => {
    let data = applyPreset(createAnalysisData(), 'parabola');
    data = addSecondFunction(data, 'x^3-3x');
    expect(bytesOf(summarizeAnalysis(data))).toBeLessThanOrEqual(2000);
  });

  it('ne jette JAMAIS, quel que soit l’état', () => {
    const rubbish = [null, undefined, {}, [], 0, 'x', { functions: null }, { functions: [{}] },
      { functions: [{ source: 'x^^' }] }, { functions: [{ source: 'x' }], view: 'non' }];
    for (const input of rubbish) {
      expect(() => summarizeAnalysis(input)).not.toThrow();
    }
  });

  it('coupe la silhouette là où la fonction n’existe pas', () => {
    const data = applyPreset(createAnalysisData(), 'root');   // √x
    const points = summarizeAnalysis(data).detail.polylines[0].p;
    // √x n'existe pas pour x < 0 : la vignette y lève le crayon…
    expect(points.some((point) => point.y === null)).toBe(true);
    // … et elle trace bien quelque chose pour x ≥ 0.
    expect(points.some((point) => Number.isFinite(point.y))).toBe(true);
  });
});
