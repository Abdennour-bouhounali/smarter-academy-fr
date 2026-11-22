import { describe, it, expect, beforeEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import mathlab from '../../i18n/locales/fr/mathlab.json';
import { REGISTERED_MATH_LAB_TOOLS } from './toolRegistry.js';
import AlgebraTool from './tools/algebra/AlgebraTool.jsx';
import { createAlgebraData } from './tools/algebra/algebraState.js';
import ProbabilityStatsTool from './tools/probabilityStats/ProbabilityStatsTool.jsx';
import { createProbabilityStatsData } from './tools/probabilityStats/probabilityState.js';
import NumberLabTool from './tools/numberLab/NumberLabTool.jsx';
import { createNumberLabData } from './tools/numberLab/numberState.js';
import TrigonometryTool from './tools/trigonometry/TrigonometryTool.jsx';
import { applyPreset, createTrigonometryData } from './tools/trigonometry/trigState.js';
import VectorsTool from './tools/vectors/VectorsTool.jsx';
import { createVectorsData } from './tools/vectors/vectorState.js';
import TransformationsTool from './tools/transformations/TransformationsTool.jsx';
import { createTransformationsData } from './tools/transformations/transformState.js';
import LogicLabTool from './tools/logic/LogicLabTool.jsx';
import { createLogicData } from './tools/logic/logicState.js';

/**
 * Le MÊME composant, rendu dans chaque atelier : ce que le DOM montre.
 *
 * Les tests purs (labCapabilities.test.js) disent ce que chaque instrument
 * DÉCLARE ; ceux-ci vérifient qu'il l'OBÉIT — qu'aucun onglet, bouton ou
 * lecture du lycée n'arrive dans le HTML d’atelier du collège, et que le lycée
 * les a tous. Rendu serveur, sans navigateur : c'est le HTML initial, celui
 * que l'élève voit avant tout geste. Les capacités sont celles que l'instrument
 * DÉCLARE (registre des instruments enregistrés) : le côté lycée, caché en
 * France (labConfig.js), garde son code et ses tests.
 */
const missing = new Set();
const i18n = i18next.createInstance();
i18n.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'fr',
  resources: { fr: { mathlab } },
  ns: ['mathlab'],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  saveMissing: true,
  missingKeyHandler: (_lngs, _ns, key) => missing.add(key),
});

beforeEach(() => missing.clear());

const render = (Component, toolId, scope, initialData, explicit = undefined) => {
  const declared = REGISTERED_MATH_LAB_TOOLS.find((tool) => tool.id === toolId).capabilities?.[scope] ?? null;
  const capabilities = explicit !== undefined ? explicit : declared;
  const html = renderToStaticMarkup(createElement(
    I18nextProvider,
    { i18n },
    createElement(Component, { initialData, onChange: () => {}, onReady: () => {}, scope, capabilities }),
  ));
  expect(html).not.toMatch(/NaN|Infinity|\[object Object\]/);
  expect([...missing]).toEqual([]);

  return html;
};
const count = (html, pattern) => (html.match(pattern) ?? []).length;

describe('outil Algèbre', () => {
  it('au collège, la famille « second degré » n’a pas de bouton ; au lycée, si', () => {
    const data = { ...createAlgebraData(), section: 'functions' };
    const moyen = render(AlgebraTool, 'algebra', 'moyen', data);
    expect(moyen).toContain('data-ml-alg-family="affine"');
    expect(moyen).not.toContain('data-ml-alg-family="quadratic"');
    expect(render(AlgebraTool, 'algebra', 'secondaire', data)).toContain('data-ml-alg-family="quadratic"');
  });

  it('au collège, x² + 5x + 6 n’est pas déroulé : une phrase renvoie au lycée', () => {
    const data = { ...createAlgebraData(), section: 'factor', factor: { source: 'x^2 + 5x + 6' } };
    const moyen = render(AlgebraTool, 'algebra', 'moyen', data);
    expect(moyen).toContain('data-ml-alg-factor-status="beyondLab"');
    expect(moyen).toContain(mathlab.tools.algebra.factor.beyondLab);
    expect(moyen).not.toContain('data-ml-alg-board');
    const secondaire = render(AlgebraTool, 'algebra', 'secondaire', data);
    expect(secondaire).toContain('data-ml-alg-factor-status="factored"');
  });

  it('au collège, a² − b² se déroule, et ni « somme et produit » ni les carrés (a ± b)² ne sont listés', () => {
    const data = { ...createAlgebraData(), section: 'factor', factor: { source: '4x^2 - 9' } };
    const moyen = render(AlgebraTool, 'algebra', 'moyen', data);
    expect(moyen).toContain('data-ml-alg-factor-status="factored"');
    expect(moyen).not.toContain('Différence de deux carrés ou somme et produit');
    expect(moyen).not.toContain(mathlab.tools.algebra.rules.sumProductRule.slice(0, 20));
    expect(moyen).not.toContain('2ab + b^2 = (a + b)^2');
    expect(moyen).not.toContain('2ab + b^2 = (a - b)^2');
  });

  it('au collège : ni l’onglet des systèmes, ni celui des inéquations ; au lycée, si', () => {
    const moyen = render(AlgebraTool, 'algebra', 'moyen', createAlgebraData());
    expect(count(moyen, /data-ml-alg-tab="/g)).toBe(4);
    expect(moyen).not.toContain('data-ml-alg-tab="systems"');
    expect(moyen).not.toContain('data-ml-alg-tab="inequalities"');
    const secondaire = render(AlgebraTool, 'algebra', 'secondaire', createAlgebraData());
    expect(secondaire).toContain('data-ml-alg-tab="systems"');
    expect(secondaire).toContain('data-ml-alg-tab="inequalities"');
  });

  it('au collège, un document ouvert sur les systèmes rouvre sur les équations', () => {
    const moyen = render(AlgebraTool, 'algebra', 'moyen', { ...createAlgebraData(), section: 'systems' });
    expect(moyen).toContain('data-ml-alg-section="equations"');
  });
});

// Probabilités et statistiques : du collège en France — expériences et série ;
// l'arbre, la loi normale, la boîte, les cumulés, les quartiles, la variance et
// le mode restent au lycée.
describe('Probabilités et statistiques', () => {
  it('au collège : deux onglets ; au lycée : quatre', () => {
    const data = createProbabilityStatsData();
    const moyen = render(ProbabilityStatsTool, 'probabilityStats', 'moyen', data);
    expect(count(moyen, /data-ml-ps-mode="/g)).toBe(2);
    expect(moyen).not.toContain('data-ml-ps-mode="tree"');
    expect(moyen).not.toContain('data-ml-ps-mode="normal"');
    expect(count(render(ProbabilityStatsTool, 'probabilityStats', 'secondaire', data), /data-ml-ps-mode="/g)).toBe(4);
  });

  it('au collège : ni boîte, ni cumulés, ni quartiles, ni variance, ni mode ; au lycée : tout', () => {
    const data = { ...createProbabilityStatsData(), mode: 'dataset' };
    const moyen = render(ProbabilityStatsTool, 'probabilityStats', 'moyen', data);
    expect(moyen).not.toContain('data-ml-ps-chart-type="box"');
    expect(moyen).not.toContain('data-ml-ps-chart-type="cumulative"');
    for (const stat of ['q1', 'q3', 'iqr', 'variance', 'sd', 'mode']) expect(moyen, stat).not.toContain(`data-ml-ps-stat="${stat}"`);
    for (const stat of ['mean', 'median', 'range']) expect(moyen, stat).toContain(`data-ml-ps-stat="${stat}"`);
    for (const fold of ['quartiles', 'variance', 'sd', 'mode']) expect(moyen, fold).not.toContain(`data-ml-ps-explain-${fold}`);
    expect(moyen).not.toContain('>Q₁<');
    const secondaire = render(ProbabilityStatsTool, 'probabilityStats', 'secondaire', data);
    expect(secondaire).toContain('data-ml-ps-chart-type="box"');
    expect(secondaire).toContain('data-ml-ps-stat="sd"');
  });

  it('au collège : un document sur la loi normale ou l’arbre rouvre sur les expériences', () => {
    for (const mode of ['normal', 'tree']) {
      const data = { ...createProbabilityStatsData(), mode };
      expect(render(ProbabilityStatsTool, 'probabilityStats', 'moyen', data), mode).toContain('data-ml-ps-section="experiment"');
      expect(render(ProbabilityStatsTool, 'probabilityStats', 'secondaire', data), mode).toContain(`data-ml-ps-section="${mode}"`);
    }
  });
});

describe('labo des nombres', () => {
  it('les seize modes dans chaque atelier', () => {
    const data = createNumberLabData();
    expect(count(render(NumberLabTool, 'numberLab', 'moyen', data), /data-ml-nb-modechip="/g)).toBe(16);
    expect(count(render(NumberLabTool, 'numberLab', 'secondaire', data), /data-ml-nb-modechip="/g)).toBe(16);
  });
});

describe('outil Trigonométrie', () => {
  it('au collège : ni bouton « cercle », ni radians, ni quadrant, ni symétries', () => {
    const moyen = render(TrigonometryTool, 'trigonometry', 'moyen', createTrigonometryData());
    expect(moyen).not.toContain('data-ml-trig-mode="circle"');
    expect(moyen).not.toContain('data-ml-trig-unit="rad"');
    expect(moyen).not.toContain('data-ml-trig-quadrant-readout');
    expect(moyen).not.toContain('data-ml-trig-signtable');
    expect(moyen).not.toContain('data-ml-trig-symmetry');
    expect(moyen).not.toContain('data-ml-trig-inverse');
    expect(moyen).not.toContain('data-ml-trig-experiment');
    expect(moyen).not.toContain('data-ml-trig-play');
    // Les préréglages sont dans une section repliée (absente du HTML initial) :
    // leur liste est vérifiée par labCapabilities.test.js et au navigateur.
    expect(count(moyen, /data-ml-trig-special="/g)).toBe(3);
    expect(moyen).not.toContain('π');
  });

  it('au collège, un document enregistré sur le cercle rouvre sur le triangle', () => {
    const circle = applyPreset(createTrigonometryData(), 'unitCircle');
    const moyen = render(TrigonometryTool, 'trigonometry', 'moyen', circle);
    expect(moyen).not.toContain('data-ml-trig-radius');
    const secondaire = render(TrigonometryTool, 'trigonometry', 'secondaire', circle);
    expect(secondaire).toContain('data-ml-trig-mode="circle"');
    expect(secondaire).toContain('data-ml-trig-unit="rad"');
    expect(secondaire).toContain('data-ml-trig-radius');
  });
});

// Le labo des vecteurs est du lycée seul (décision du propriétaire, 2026-11-23) :
// le composant OBÉIT toujours à des capacités restreintes (la mécanique).
const RESTRICTED_VECTORS = {
  scale: false,
  factor: false,
  analysis: ['none'],
  experiments: ['addition', 'parallelogram', 'subtraction', 'translation', 'shape', 'midpoint'],
};

describe('outil Vecteurs', () => {
  it('restreint : pas de « × nombre », pas de sélecteur d’analyse, pas d’expérience avancée ; au lycée : tout', () => {
    const moyen = render(VectorsTool, 'vectors', 'secondaire', createVectorsData(), RESTRICTED_VECTORS);
    expect(moyen).not.toContain('data-ml-scale');
    expect(moyen).not.toContain('data-ml-analysis');
    for (const id of ['scalar', 'parallel', 'collinear', 'perpendicular']) expect(moyen, id).not.toContain(`data-ml-experiment="${id}"`);
    expect(moyen).toContain('data-ml-experiment="addition"');
    const secondaire = render(VectorsTool, 'vectors', 'secondaire', createVectorsData());
    expect(secondaire).toContain('data-ml-scale');
    expect(secondaire).toContain('data-ml-analysis');
    expect(secondaire).toContain('data-ml-experiment="perpendicular"');
  });
});

describe('outil Transformations', () => {
  it('au collège : l’homothétie oui, mais ni matrice, ni étapes intermédiaires, ni expérience de l’ordre', () => {
    const moyen = render(TransformationsTool, 'transformations', 'moyen', createTransformationsData());
    expect(moyen).toContain('data-ml-add-step="dilation"');
    expect(moyen).not.toContain('data-ml-toggle="showMatrix"');
    expect(moyen).not.toContain('data-ml-toggle="showIntermediate"');
    expect(moyen).not.toContain('data-ml-experiment="order"');
    // Un seul pas : « ajouter » reste actif et REMPLACE.
    expect(moyen).toMatch(/data-ml-add-step="rotation"(?![^>]*disabled)/);
    const secondaire = render(TransformationsTool, 'transformations', 'secondaire', createTransformationsData());
    expect(secondaire).toContain('data-ml-add-step="dilation"');
    expect(secondaire).toContain('data-ml-toggle="showMatrix"');
    expect(secondaire).toContain('data-ml-experiment="order"');
  });
});

describe('outil Logique et raisonnement', () => {
  it('au collège : quatre aires ; au lycée : onze', () => {
    const moyen = render(LogicLabTool, 'logic', 'moyen', createLogicData());
    expect(count(moyen, /data-ml-lg-area-tab="/g)).toBe(4);
    for (const area of ['connectors', 'quantifiers', 'negation', 'proof', 'induction', 'conditions', 'equivalence']) {
      expect(moyen, area).not.toContain(`data-ml-lg-area-tab="${area}"`);
    }
    expect(count(render(LogicLabTool, 'logic', 'secondaire', createLogicData()), /data-ml-lg-area-tab="/g)).toBe(11);
  });

  it('au collège, l’implication n’a que la propriété et sa réciproque, sans ensembles ni table', () => {
    const data = { ...createLogicData(), area: 'implication' };
    const moyen = render(LogicLabTool, 'logic', 'moyen', data);
    expect(moyen).toContain('data-ml-lg-form="converse"');
    expect(moyen).not.toContain('data-ml-lg-form="contrapositive"');
    expect(moyen).not.toContain('data-ml-lg-form="inverse"');
    expect(moyen).not.toContain('data-ml-lg-impl-sets');
    expect(moyen).not.toContain('data-ml-lg-impl-table');
    const secondaire = render(LogicLabTool, 'logic', 'secondaire', data);
    expect(secondaire).toContain('data-ml-lg-form="contrapositive"');
    expect(secondaire).toContain('data-ml-lg-impl-table');
  });
});
