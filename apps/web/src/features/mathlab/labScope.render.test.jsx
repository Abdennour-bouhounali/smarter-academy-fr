import { describe, it, expect, beforeEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import mathlab from '../../i18n/locales/ar/mathlab.json';
import { getMathLabTool } from './toolRegistry.js';
import { toolCapabilities } from './labScope.js';
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
 * Le MÊME composant, rendu dans chaque مخبر : ce que le DOM montre.
 *
 * Les tests purs (labCapabilities.test.js) disent ce que chaque instrument
 * DÉCLARE ; ceux-ci vérifient qu'il l'OBÉIT — qu'aucun onglet, bouton ou
 * lecture du lycée n'arrive dans le HTML de مخبر المتوسط, et que le lycée
 * les a tous. Rendu serveur, sans navigateur : c'est le HTML initial, celui
 * que l'élève voit avant tout geste.
 */
const missing = new Set();
const i18n = i18next.createInstance();
i18n.use(initReactI18next).init({
  lng: 'ar-DZ',
  fallbackLng: 'ar-DZ',
  resources: { 'ar-DZ': { mathlab } },
  ns: ['mathlab'],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  saveMissing: true,
  missingKeyHandler: (_lngs, _ns, key) => missing.add(key),
});

beforeEach(() => missing.clear());

const render = (Component, toolId, scope, initialData, explicit = undefined) => {
  const capabilities = explicit !== undefined ? explicit : toolCapabilities(getMathLabTool(toolId), scope);
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

describe('مختبر الجبر', () => {
  it('au collège, la famille « second degré » n’a pas de bouton ; au lycée, si', () => {
    const data = { ...createAlgebraData(), section: 'functions' };
    const moyen = render(AlgebraTool, 'algebra', 'moyen', data);
    expect(moyen).toContain('data-ml-alg-family="affine"');
    expect(moyen).not.toContain('data-ml-alg-family="quadratic"');
    expect(render(AlgebraTool, 'algebra', 'secondaire', data)).toContain('data-ml-alg-family="quadratic"');
  });

  it('au collège, x² + 5x + 6 n’est pas déroulé : une phrase renvoie au ثانوي', () => {
    const data = { ...createAlgebraData(), section: 'factor', factor: { source: 'x^2 + 5x + 6' } };
    const moyen = render(AlgebraTool, 'algebra', 'moyen', data);
    expect(moyen).toContain('data-ml-alg-factor-status="beyondLab"');
    expect(moyen).toContain(mathlab.tools.algebra.factor.beyondLab);
    expect(moyen).not.toContain('data-ml-alg-board');
    const secondaire = render(AlgebraTool, 'algebra', 'secondaire', data);
    expect(secondaire).toContain('data-ml-alg-factor-status="factored"');
  });

  it('au collège, une identité remarquable se déroule, et la règle « مجموع وجداء » n’est pas listée', () => {
    const data = { ...createAlgebraData(), section: 'factor', factor: { source: 'x^2 + 6x + 9' } };
    const moyen = render(AlgebraTool, 'algebra', 'moyen', data);
    expect(moyen).toContain('data-ml-alg-factor-status="factored"');
    expect(moyen).not.toContain('فرق مربعين أو مجموع وجداء');
    expect(moyen).not.toContain(mathlab.tools.algebra.rules.sumProductRule.slice(0, 20));
  });
});

// الاحتمالات والإحصاء n'est qu'au ثانوي, sans restriction : on vérifie ici que
// le composant OBÉIT à des capacités restreintes (la mécanique), et que le
// ثانوي a tout.
const RESTRICTED_PS = {
  sections: ['experiment', 'dataset'],
  charts: ['bars', 'histogram', 'pie', 'cumulative'],
  stats: ['count', 'min', 'max', 'range', 'mean', 'median', 'mode'],
  explanations: ['mean', 'median', 'mode', 'range'],
};

describe('الاحتمالات والإحصاء', () => {
  it('restreint : deux onglets ; au ثانوي : quatre', () => {
    const data = createProbabilityStatsData();
    const restricted = render(ProbabilityStatsTool, 'probabilityStats', 'secondaire', data, RESTRICTED_PS);
    expect(count(restricted, /data-ml-ps-mode="/g)).toBe(2);
    expect(restricted).not.toContain('data-ml-ps-mode="tree"');
    expect(count(render(ProbabilityStatsTool, 'probabilityStats', 'secondaire', data), /data-ml-ps-mode="/g)).toBe(4);
  });

  it('restreint : ni boîte, ni quartiles, ni variance ; au ثانوي : tout', () => {
    const data = { ...createProbabilityStatsData(), mode: 'dataset' };
    const restricted = render(ProbabilityStatsTool, 'probabilityStats', 'secondaire', data, RESTRICTED_PS);
    expect(restricted).not.toContain('data-ml-ps-chart-type="box"');
    for (const stat of ['q1', 'q3', 'iqr', 'variance', 'sd']) expect(restricted, stat).not.toContain(`data-ml-ps-stat="${stat}"`);
    for (const fold of ['quartiles', 'variance', 'sd']) expect(restricted, fold).not.toContain(`data-ml-ps-explain-${fold}`);
    expect(restricted).not.toContain('>Q₁<');
    const secondaire = render(ProbabilityStatsTool, 'probabilityStats', 'secondaire', data);
    expect(secondaire).toContain('data-ml-ps-chart-type="box"');
    expect(secondaire).toContain('data-ml-ps-stat="sd"');
  });

  it('restreint : un document sur la loi normale rouvre sur les expériences', () => {
    const data = { ...createProbabilityStatsData(), mode: 'normal' };
    expect(render(ProbabilityStatsTool, 'probabilityStats', 'secondaire', data, RESTRICTED_PS)).toContain('data-ml-ps-section="experiment"');
    expect(render(ProbabilityStatsTool, 'probabilityStats', 'secondaire', data)).toContain('data-ml-ps-section="normal"');
  });
});

describe('مختبر الأعداد والحساب', () => {
  it('les seize modes dans chaque مخبر', () => {
    const data = createNumberLabData();
    expect(count(render(NumberLabTool, 'numberLab', 'moyen', data), /data-ml-nb-modechip="/g)).toBe(16);
    expect(count(render(NumberLabTool, 'numberLab', 'secondaire', data), /data-ml-nb-modechip="/g)).toBe(16);
  });
});

describe('مختبر المثلثات', () => {
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

describe('مختبر الأشعة', () => {
  it('au collège : pas de « × عدد », pas de sélecteur d’analyse, pas d’expérience du lycée', () => {
    const moyen = render(VectorsTool, 'vectors', 'moyen', createVectorsData());
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

describe('مختبر التحويلات', () => {
  it('au collège : le تحاكي oui, mais ni matrice, ni étapes intermédiaires, ni expérience de l’ordre', () => {
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

describe('مختبر المنطق والبرهان', () => {
  it('au collège : quatre aires ; au lycée : onze', () => {
    const moyen = render(LogicLabTool, 'logic', 'moyen', createLogicData());
    expect(count(moyen, /data-ml-lg-area-tab="/g)).toBe(4);
    for (const area of ['connectors', 'quantifiers', 'negation', 'proof', 'induction', 'conditions', 'equivalence']) {
      expect(moyen, area).not.toContain(`data-ml-lg-area-tab="${area}"`);
    }
    expect(count(render(LogicLabTool, 'logic', 'secondaire', createLogicData()), /data-ml-lg-area-tab="/g)).toBe(11);
  });

  it('au collège, la شرطية n’a que la propriété et sa réciproque, sans ensembles ni table', () => {
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
