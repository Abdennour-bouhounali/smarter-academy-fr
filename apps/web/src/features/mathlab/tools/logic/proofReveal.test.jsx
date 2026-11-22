import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import mathlab from '../../../../i18n/locales/ar/mathlab.json';
import ProofArea from './ProofArea.jsx';
import InductionArea from './InductionArea.jsx';
import { DIRECT_PROOFS, INDUCTION_CASES } from './presets.js';
import { proofLayers } from './proofMath.js';
import { treeReveal, visibleTreeRanks, inductionCaseSteps } from './proofReveal.js';
import { createLogicData, setProofMode, placeStep } from './logicState.js';

// Une instance i18n LOCALE, le namespace chargé d'avance : sinon useTranslation suspend.
const i18n = i18next.createInstance();
i18n.use(initReactI18next).init({
  lng: 'ar-DZ', fallbackLng: 'ar-DZ', resources: { 'ar-DZ': { mathlab } }, ns: ['mathlab'],
  interpolation: { escapeValue: false }, react: { useSuspense: false },
});
const render = (Component, data) => renderToStaticMarkup(createElement(
  I18nextProvider, { i18n }, createElement(Component, { data, onChange: () => {}, announce: () => {} }),
));

describe('l’arbre de preuve se découvre rang par rang (exigence 2026-09-30)', () => {
  it('un pas = un rang du graphe ; le dernier rang contient la conclusion', () => {
    for (const proof of DIRECT_PROOFS) {
      const layers = treeReveal(proof);
      expect(layers.length).toBeGreaterThanOrEqual(2);
      expect(layers.flat().length).toBe(proof.steps.length);
      expect(layers).toEqual(proofLayers(proof).filter((layer) => layer.length));
      const last = layers[layers.length - 1].map((step) => step.role);
      expect(last.some((role) => role === 'result' || role === 'conclusion')).toBe(true);
    }
  });

  it('rien au départ ; les rangs révélés en entier ; au-delà, seules les étapes posées', () => {
    const layers = treeReveal(DIRECT_PROOFS[0]);
    expect(visibleTreeRanks(layers)).toEqual([]);
    expect(visibleTreeRanks(layers, { revealed: 1 })).toEqual([{ index: 0, steps: layers[0] }]);
    const posed = layers[1][0].id;
    const ranks = visibleTreeRanks(layers, { revealed: 1, placed: [layers[0][0].id, posed] });
    expect(ranks.map((rank) => rank.index)).toEqual([0, 1]);
    expect(ranks[1].steps.map((step) => step.id)).toEqual([posed]);
    expect(visibleTreeRanks(layers, { revealed: layers.length }).flatMap((rank) => rank.steps)).toHaveLength(layers.flat().length);
  });

  it('à l’ouverture, en mode « الناقصة » ou « رتّب », l’arbre ne donne aucune étape', () => {
    for (const mode of ['gap', 'order']) {
      const html = render(ProofArea, setProofMode(createLogicData(), mode));
      expect(html).toContain('data-ml-lg-tree-step-player="ready"');
      expect(html).not.toContain('data-ml-lg-tree-node');
      expect(html).toContain('data-ml-lg-tree-empty');
    }
  });

  it('une étape posée par l’élève apparaît dans l’arbre ; une preuve achevée s’y montre entière', () => {
    let data = createLogicData();
    const proof = DIRECT_PROOFS.find((item) => item.id === data.proof.id);
    const root = proof.steps.find((step) => (step.requires ?? []).length === 0);
    const once = render(ProofArea, placeStep(data, root.id));
    expect(once).toContain(`data-ml-lg-tree-node="${root.id}"`);
    expect((once.match(/data-ml-lg-tree-node=/g) ?? []).length).toBe(1);

    for (const layer of treeReveal(proof)) for (const step of layer) data = placeStep(data, step.id);
    const full = render(ProofArea, data);
    expect((full.match(/data-ml-lg-tree-node=/g) ?? []).length).toBe(proof.steps.length);
    expect(full).not.toContain('data-ml-lg-tree-step-player');
  });
});

describe('un exemple de récurrence : الحالة الأولى → الانتقال → الخلاصة', () => {
  it('trois pas, la conclusion en dernier, fidèles à l’exemple', () => {
    for (const item of INDUCTION_CASES) {
      const steps = inductionCaseSteps(item);
      expect(steps.map((step) => step.kind)).toEqual(['base', 'heredity', 'conclusion']);
      expect(steps[0].holds).toBe(item.baseHolds);
      expect(steps[1].holds).toBe(item.stepHolds);
      expect(steps[2].holds).toBe(item.works);
    }
    expect(inductionCaseSteps(null)).toEqual([]);
  });

  it('les phrases des pas existent', () => {
    for (const key of ['title', 'conclusion', 'base.holds', 'base.fails', 'heredity.holds', 'heredity.fails']) {
      expect(i18n.exists(`tools.logic.induction.caseSteps.${key}`, { ns: 'mathlab' }), key).toBe(true);
    }
    expect(i18n.exists('tools.logic.proof.treeSteps', { ns: 'mathlab' })).toBe(true);
    expect(i18n.exists('tools.logic.proof.treeEmpty', { ns: 'mathlab' })).toBe(true);
  });

  it('fermés, les exemples ne montrent ni escalier ni verdict', () => {
    const html = render(InductionArea, createLogicData());
    expect(html).toContain('data-ml-lg-induction-case="brokenStep"');
    expect(html).not.toContain('data-ml-lg-case-detail');
  });
});
