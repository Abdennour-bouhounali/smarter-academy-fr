import { describe, it, expect } from 'vitest';
import { getMathLabTool } from './toolRegistry.js';
import { toolCapabilities } from './labScope.js';

import { grapherFeatures, MOYEN_PRESETS } from './tools/functionGrapher/scope.js';
import { MOYEN_KEYBOARD_LAYOUT, GRAPHER_KEYBOARD_LAYOUT } from './tools/functionGrapher/mathliveSetup.js';
import { normalizeGrapherData } from './tools/functionGrapher/grapherState.js';

import { probabilityFeatures, clampToFeatures as clampProbability } from './tools/probabilityStats/scope.js';
import { createProbabilityStatsData } from './tools/probabilityStats/probabilityState.js';

import { algebraFeatures, clampToFeatures as clampAlgebra, isBeyondMoyenFactorization } from './tools/algebra/scope.js';
import { factorExpression } from './tools/algebra/factor.js';
import { simplifyExpression } from './tools/algebra/simplify.js';
import { createAlgebraData } from './tools/algebra/algebraState.js';

import { vectorsFeatures, clampToFeatures as clampVectors } from './tools/vectors/scope.js';
import { createVectorsData } from './tools/vectors/vectorState.js';

import { trigonometryFeatures, clampToFeatures as clampTrig } from './tools/trigonometry/scope.js';
import { applyPreset, createTrigonometryData } from './tools/trigonometry/trigState.js';
import { generateChallenge as trigChallenge, kindsForMode } from './tools/trigonometry/practice.js';

import { transformationsFeatures, displayToggles, clampToFeatures as clampTransform } from './tools/transformations/scope.js';
import { generateChallenge as transformChallenge } from './tools/transformations/practice.js';
import { createTransformationsData } from './tools/transformations/transformState.js';

import { numberLabModes, clampToModes } from './tools/numberLab/scope.js';
import { MODES as NUMBER_MODES } from './tools/numberLab/numberState.js';

import { logicFeatures, practiceKindsFor, clampToFeatures as clampLogic } from './tools/logic/scope.js';
import { generateChallenge as logicChallenge, revealTarget as logicReveal } from './tools/logic/practice.js';
import { createLogicData } from './tools/logic/logicState.js';

/**
 * « Advanced features never appear in مخبر المتوسط » — et un instrument
 * partagé expose, dans chaque مخبر, EXACTEMENT ce qui lui revient.
 *
 * Chaque bloc prend les capacités DÉCLARÉES par l'instrument (le registre,
 * pas une copie) et vérifie ce que le collège n'a pas, puis que le lycée a
 * tout. Les générateurs d'exercices sont tirés des centaines de fois : une
 * question du lycée posée au collège ne passe pas au hasard d'une graine.
 */
const features = (id, scope, resolve) => resolve(toolCapabilities(getMathLabTool(id), scope));

describe('راسم الدوال', () => {
  const moyen = features('functionGrapher', 'moyen', grapherFeatures);
  const secondaire = features('functionGrapher', 'secondaire', grapherFeatures);

  it('au collège : pas d’المماس, des droites, un clavier sans sin ni ln', () => {
    expect(moyen.tangent).toBe(false);
    expect(moyen.keyboard).toBe('moyen');
    expect(moyen.presets).toBe(MOYEN_PRESETS);
    for (const { expression } of moyen.presets) {
      expect(expression, expression).not.toMatch(/\\(sin|cos|tan|ln|log|sqrt|exp)|\^|\|/);
    }
    const keys = MOYEN_KEYBOARD_LAYOUT.rows.flat().map((key) => key.latex).filter(Boolean);
    for (const banned of ['\\sin', '\\cos', '\\tan', '\\ln', '\\log', 'e^{x}', 'e']) expect(keys, banned).not.toContain(banned);
    // Le reste du clavier est intact (chiffres, fraction, racine, parenthèses).
    expect(keys).toContain('\\frac{a}{b}');
    expect(keys).toContain('7');
  });

  it('au lycée : tout — المماس, les exemples transcendants, le clavier complet', () => {
    expect(secondaire.tangent).toBe(true);
    expect(secondaire.keyboard).toBe('full');
    expect(secondaire.presets.map((p) => p.expression)).toContain('\\sin(x)');
    expect(GRAPHER_KEYBOARD_LAYOUT.rows.flat().map((key) => key.latex)).toContain('\\ln');
  });

  it('un document enregistré avec المماس allumé s’ouvre ÉTEINT au collège (l’état garde tout le reste)', () => {
    const data = normalizeGrapherData({ functions: [{ expression: 'x^2' }], tangent: { enabled: true, x: 2 } });
    expect(data.tangent.enabled).toBe(true);
    // Le composant applique cette règle à l'ouverture (FunctionGrapherTool) : on la rejoue ici.
    const opened = moyen.tangent || !data.tangent.enabled ? data : { ...data, tangent: { ...data.tangent, enabled: false } };
    expect(opened.tangent.enabled).toBe(false);
    expect(opened.tangent.x).toBe(2);
  });
});

/**
 * Aucun مخبر ne restreint aujourd'hui الاحتمالات والإحصاء (مخبر الثانوي seulement,
 * toutes sections). La MÉCANIQUE de filtrage reste, et elle est tenue par ce
 * jeu de capacités d'essai — celui qu'un مخبر restreint déclarerait.
 */
const RESTRICTED = Object.freeze({
  sections: ['experiment', 'dataset'],
  charts: ['bars', 'histogram', 'pie', 'cumulative'],
  stats: ['count', 'min', 'max', 'range', 'mean', 'median', 'mode'],
  explanations: ['mean', 'median', 'mode', 'range'],
});

describe('الاحتمالات والإحصاء', () => {
  const moyen = probabilityFeatures(RESTRICTED);
  const secondaire = features('probabilityStats', 'secondaire', probabilityFeatures);

  it('instrument du seul ثانوي, sans aucune restriction déclarée', () => {
    expect(getMathLabTool('probabilityStats').scopes).toEqual(['secondaire']);
    expect(toolCapabilities(getMathLabTool('probabilityStats'), 'secondaire')).toBeNull();
    expect(toolCapabilities(getMathLabTool('probabilityStats'), 'moyen')).toBeNull();
  });

  it('la mécanique : des capacités restreintes n’offrent ni arbre, ni loi normale, ni quartiles', () => {
    expect(moyen.sections).toEqual(['experiment', 'dataset']);
    expect(moyen.charts).not.toContain('box');
    expect(moyen.charts).toContain('cumulative');
    for (const lycee of ['q1', 'q3', 'iqr', 'variance', 'sd']) expect(moyen.stats, lycee).not.toContain(lycee);
    for (const lycee of ['quartiles', 'variance', 'sd']) expect(moyen.explanations, lycee).not.toContain(lycee);
    for (const college of ['mean', 'median', 'mode', 'range']) expect(moyen.stats, college).toContain(college);
  });

  it('au lycée : les quatre sections, la boîte, les quartiles, la variance', () => {
    expect(secondaire.sections).toEqual(['experiment', 'dataset', 'tree', 'normal']);
    expect(secondaire.charts).toContain('box');
    expect(secondaire.stats).toContain('sd');
    expect(secondaire.explanations).toContain('quartiles');
  });

  it('la mécanique : un document ouvert sur l’arbre ou la boîte revient à ce qui est montré', () => {
    const base = createProbabilityStatsData();
    expect(clampProbability({ ...base, mode: 'tree' }, moyen).mode).toBe('experiment');
    expect(clampProbability({ ...base, mode: 'normal', chart: 'box' }, moyen)).toMatchObject({ mode: 'experiment', chart: null });
    expect(clampProbability({ ...base, mode: 'dataset', chart: 'pie' }, moyen)).toMatchObject({ mode: 'dataset', chart: 'pie' });
    // Le lycée garde tout.
    expect(clampProbability({ ...base, mode: 'normal', chart: 'box' }, secondaire)).toMatchObject({ mode: 'normal', chart: 'box' });
  });
});

describe('مختبر الجبر', () => {
  const moyen = features('algebra', 'moyen', algebraFeatures);
  const secondaire = features('algebra', 'secondaire', algebraFeatures);

  it('au collège : les six sections, mais ni مميّز, ni second degré, ni « مجموع وجداء »', () => {
    expect(moyen.sections).toHaveLength(6);
    expect(moyen.factor.discriminant).toBe(false);
    expect(moyen.factor.methods).toBe('moyen');
    expect(moyen.factor.rules).not.toContain('sumProductRule');
    expect(moyen.functions.families).toEqual(['linear', 'affine']);
    expect(moyen.functions.examples.every((example) => example.value.family !== 'quadratic')).toBe(true);
  });

  it('chaque exemple de factorisation du collège se DÉROULE au collège', () => {
    expect(moyen.factor.examples.length).toBeGreaterThan(0);
    for (const example of moyen.factor.examples) {
      const result = factorExpression(example.source);
      expect(result.ok, example.id).toBe(true);
      expect(isBeyondMoyenFactorization(result), example.id).toBe(false);
      expect(result.status, example.id).toBe('factored');
    }
  });

  it('ce qui exige « مجموع وجداء », la méthode ac ou le مميّز est reconnu', () => {
    for (const source of ['x^2 + 5x + 6', '6x^2 + 5x + 1', 'x^2 + x - 1', 'x^2 + 1', 'x^2 + x + 1']) {
      expect(isBeyondMoyenFactorization(factorExpression(source)), source).toBe(true);
    }
    for (const source of ['6x^2 + 9x', '4x^2 - 9', 'x^2 + 6x + 9', '2x^2 - 8', 'x^2 - 10x + 25']) {
      expect(isBeyondMoyenFactorization(factorExpression(source)), source).toBe(false);
    }
  });

  it('aucun exemple de simplification du collège n’est une fraction rationnelle', () => {
    for (const example of moyen.simplify.examples) {
      expect(simplifyExpression(example.source).kind ?? 'polynomial', example.id).not.toBe('fraction');
      expect(example.source, example.id).not.toMatch(/\)\s*\//);
    }
  });

  it('au lycée : le second degré, le مميّز, tous les exemples', () => {
    expect(secondaire.factor.discriminant).toBe(true);
    expect(secondaire.factor.methods).toBe('all');
    expect(secondaire.functions.families).toContain('quadratic');
  });

  it('un document au second degré rouvre en affine au collège, sans rien perdre d’autre', () => {
    const data = createAlgebraData();
    const quadratic = { ...data, section: 'functions', functions: { ...data.functions, family: 'quadratic', a: 1, b: -2, c: -3 } };
    const clamped = clampAlgebra(quadratic, moyen);
    expect(clamped.functions).toMatchObject({ family: 'affine', a: 1, b: -2 });
    expect(clamped.section).toBe('functions');
    expect(clampAlgebra(quadratic, secondaire)).toBe(quadratic);
  });
});

describe('مختبر الأشعة', () => {
  const moyen = features('vectors', 'moyen', vectorsFeatures);
  const secondaire = features('vectors', 'secondaire', vectorsFeatures);

  it('au collège : ni k·u, ni v = k·u, ni produit scalaire, ni analyse avancée', () => {
    expect(moyen.scale).toBe(false);
    expect(moyen.factor).toBe(false);
    expect(moyen.analysis).toEqual(['none']);
    const ids = moyen.experiments.map((entry) => entry.id);
    for (const lycee of ['scalar', 'parallel', 'collinear', 'perpendicular']) expect(ids, lycee).not.toContain(lycee);
    expect(ids).toEqual(expect.arrayContaining(['addition', 'parallelogram', 'translation']));
  });

  it('aucune expérience du collège n’allume une analyse du lycée', () => {
    for (const entry of moyen.experiments) {
      const built = entry.build();
      expect(['none', undefined], entry.id).toContain(built.settings?.analysis ?? entry.settings?.analysis);
      expect(built.scene.vectors.every((vector) => vector.source?.kind !== 'scaled'), entry.id).toBe(true);
    }
  });

  it('au lycée : tout', () => {
    expect(secondaire.scale).toBe(true);
    expect(secondaire.analysis).toContain('dot');
    expect(secondaire.experiments).toHaveLength(10);
  });

  it('une analyse du lycée enregistrée s’éteint au collège', () => {
    const data = createVectorsData();
    expect(clampVectors({ ...data, settings: { ...data.settings, analysis: 'dot' } }, moyen).settings.analysis).toBe('none');
    expect(clampVectors({ ...data, settings: { ...data.settings, analysis: 'dot' } }, secondaire).settings.analysis).toBe('dot');
  });
});

describe('مختبر المثلثات', () => {
  const moyen = features('trigonometry', 'moyen', trigonometryFeatures);
  const secondaire = features('trigonometry', 'secondaire', trigonometryFeatures);

  it('au collège : le triangle rectangle en degrés, 30°/45°/60°, aucun panneau du cercle', () => {
    expect(moyen.modes).toEqual(['triangle']);
    expect(moyen.units).toEqual(['deg']);
    expect(moyen.specialAngles).toEqual([30, 45, 60]);
    expect(Object.values(moyen.panels).every((open) => open === false)).toBe(true);
    expect(Object.values(moyen.readings).every((open) => open === false)).toBe(true);
  });

  it('chaque préréglage du collège GARDE le triangle et les degrés', () => {
    expect(moyen.presets.length).toBeGreaterThan(0);
    const base = createTrigonometryData();
    for (const preset of moyen.presets) {
      const next = applyPreset(base, preset.id);
      expect(next.mode, preset.id).toBe('triangle');
      expect(next.unit, preset.id).toBe('deg');
    }
  });

  it('les exercices du collège sont ceux du triangle, sur 30°, 45°, 60°, sans radians', () => {
    const kinds = kindsForMode('triangle');
    for (let seed = 1; seed <= 300; seed += 1) {
      const challenge = trigChallenge(seed, kinds, { mode: 'triangle' });
      expect(['triangleRatio', 'ratioValue'], `${seed}`).toContain(challenge.kind);
      if (challenge.kind === 'ratioValue') expect([30, 45, 60], `${seed}`).toContain(challenge.angle);
    }
  });

  it('un document ouvert sur le cercle en radians rouvre sur le triangle en degrés au collège', () => {
    const circle = applyPreset(createTrigonometryData(), 'radians');
    expect(circle).toMatchObject({ mode: 'circle', unit: 'rad' });
    const clamped = clampTrig({ ...circle, symmetry: 'negate', compare: { enabled: true, angle: 150 } }, moyen);
    expect(clamped).toMatchObject({ mode: 'triangle', unit: 'deg', symmetry: null, preset: null });
    expect(clamped.compare.enabled).toBe(false);
    expect(clamped.layers.triangle).toBe(true);
  });

  it('au lycée : le cercle, les radians, les douze préréglages, tous les panneaux', () => {
    expect(secondaire.modes).toEqual(['circle', 'triangle']);
    expect(secondaire.units).toEqual(['deg', 'rad']);
    expect(secondaire.presets).toHaveLength(12);
    expect(Object.values(secondaire.panels).every(Boolean)).toBe(true);
  });
});

describe('مختبر التحويلات', () => {
  const moyen = features('transformations', 'moyen', transformationsFeatures);
  const secondaire = features('transformations', 'secondaire', transformationsFeatures);
  it('au collège : تناظر, انسحاب, دوران, تحاكٍ — une seule à la fois, sans matrice', () => {
    expect(moyen.kinds).toEqual(['translation', 'rotation', 'reflection', 'dilation']);
    expect(moyen.maxSteps).toBe(1);
    expect(moyen.matrix).toBe(false);
    expect(displayToggles(moyen)).not.toContain('showMatrix');
    expect(displayToggles(moyen)).not.toContain('showIntermediate');
  });

  it('expériences et puzzles du collège : jamais deux pas (la composition est au lycée)', () => {
    for (const experiment of moyen.experiments) expect(experiment.steps.length, experiment.id).toBeLessThanOrEqual(1);
    expect(moyen.experiments.map((entry) => entry.id)).not.toContain('order');
    for (const puzzle of moyen.puzzles) expect(puzzle.solution.length, puzzle.id).toBeLessThanOrEqual(1);
    expect(moyen.puzzles.map((entry) => entry.id)).not.toContain('twoSteps');
    expect(moyen.puzzles.map((entry) => entry.id)).toContain('grow');
  });

  it('400 questions du collège : un seul pas, jamais « multiStep »', () => {
    let seed = 7;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 400; i += 1) {
      const challenge = transformChallenge(random, { kinds: moyen.challenges, stepKinds: moyen.kinds });
      expect(['predictPoint', 'choosePosition']).toContain(challenge.kind);
      expect(challenge.steps).toHaveLength(1);
      expect(moyen.kinds).toContain(challenge.steps[0].kind);
    }
  });

  it('au lycée : la composition, la matrice, l’expérience de l’ordre', () => {
    expect(secondaire.maxSteps).toBe(6);
    expect(displayToggles(secondaire)).toContain('showMatrix');
    expect(secondaire.experiments.map((entry) => entry.id)).toContain('order');
  });

  it('la matrice allumée dans un ancien document s’éteint au collège', () => {
    const data = createTransformationsData();
    const lit = { ...data, settings: { ...data.settings, showMatrix: true, showIntermediate: true } };
    expect(clampTransform(lit, moyen).settings).toMatchObject({ showMatrix: false, showIntermediate: false });
    expect(clampTransform(lit, secondaire)).toBe(lit);
  });
});

describe('مختبر الأعداد والحساب', () => {
  const moyen = numberLabModes(toolCapabilities(getMathLabTool('numberLab'), 'moyen'));
  const secondaire = numberLabModes(toolCapabilities(getMathLabTool('numberLab'), 'secondaire'));

  it('les seize modes dans les DEUX مخابر : le lycée étend, il ne retire rien', () => {
    expect(moyen).toEqual(NUMBER_MODES);
    expect(secondaire).toEqual(NUMBER_MODES);
    expect(moyen).toHaveLength(16);
  });

  it('la mécanique de restriction reste prête (un mode absent rouvre sur le premier)', () => {
    expect(clampToModes({ mode: 'place' }, ['explorer', 'gcdLcm']).mode).toBe('explorer');
    expect(clampToModes({ mode: 'gcdLcm' }, ['explorer', 'gcdLcm']).mode).toBe('gcdLcm');
  });
});

describe('مختبر المنطق والبرهان', () => {
  const moyen = features('logic', 'moyen', logicFeatures);
  const secondaire = features('logic', 'secondaire', logicFeatures);

  it('au collège : l’énoncé, la réciproque, le contre-exemple, les erreurs — rien d’autre', () => {
    expect(moyen.areas).toEqual(['statements', 'implication', 'counterexample', 'fallacy']);
    expect(moyen.implicationForms).toEqual(['direct', 'converse']);
    expect(moyen.implicationSets).toBe(false);
    expect(moyen.implicationTable).toBe(false);
    expect(moyen.practiceLevels).toBe(3);
  });

  it('les exercices du collège, 300 graines par niveau, ne sortent jamais du collège', () => {
    for (let level = 1; level <= moyen.practiceLevels; level += 1) {
      const kinds = practiceKindsFor(level, moyen);
      expect(kinds.length, `niveau ${level}`).toBeGreaterThan(0);
      for (let seed = 1; seed <= 300; seed += 1) {
        const challenge = logicChallenge(seed, kinds);
        expect(moyen.practiceKinds, `${level}/${seed}`).toContain(challenge.kind);
        const target = logicReveal(challenge);
        if (target) {
          expect(moyen.areas, `${level}/${seed}`).toContain(target.area);
          if (target.form) expect(moyen.implicationForms).toContain(target.form);
        }
      }
    }
  });

  it('un document ouvert sur la récurrence ou la contraposée revient au collège', () => {
    const data = createLogicData();
    const lycee = { ...data, area: 'induction', implication: { ...data.implication, form: 'contrapositive' }, practice: { ...data.practice, level: 4 } };
    const clamped = clampLogic(lycee, moyen);
    expect(clamped.area).toBe('counterexample');
    expect(clamped.implication.form).toBe('direct');
    expect(clamped.practice.level).toBe(3);
    expect(clampLogic(lycee, secondaire)).toBe(lycee);
  });

  it('au lycée : les onze aires, les quatre formes, quatre niveaux', () => {
    expect(secondaire.areas).toHaveLength(11);
    expect(secondaire.implicationForms).toHaveLength(4);
    expect(secondaire.practiceLevels).toBe(4);
  });
});
