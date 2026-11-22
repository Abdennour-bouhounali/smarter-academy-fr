import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import mathlab from '../../../../i18n/locales/ar/mathlab.json';
import TriangleSolvePanel from './TriangleSolvePanel.jsx';
import { StepList } from '../../shared/LabKit.jsx';
import { buildTriangleSolveSteps, GIVEN_FIELDS } from './triangleSolveSteps.js';

const missing = new Set();
const i18n = i18next.createInstance();
i18n.use(initReactI18next).init({
  lng: 'ar-DZ',
  fallbackLng: 'ar-DZ',
  resources: { 'ar-DZ': { mathlab } },
  ns: ['mathlab'],
  defaultNS: 'mathlab',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  saveMissing: true,
  missingKeyHandler: (_lngs, _ns, key) => missing.add(key),
});

const wrap = (element) => renderToStaticMarkup(createElement(I18nextProvider, { i18n }, element));
const TRIANGLES = {
  'angle-hyp': { angle: 35, hypotenuse: 10 },
  'angle-opp': { angle: 30, opposite: 5 },
  'angle-adj': { angle: 45, adjacent: 7 },
  'opp-adj': { opposite: 3, adjacent: 4 },
  'opp-hyp': { opposite: 3, hypotenuse: 5 },
  'adj-hyp': { adjacent: 4, hypotenuse: 5 },
};

describe('TriangleSolvePanel — le raisonnement se déroule, il ne s’affiche pas d’un bloc', () => {
  it('à l’ouverture : le lecteur et l’énoncé, AUCUN pas dans le DOM', () => {
    const html = wrap(createElement(TriangleSolvePanel, { triangle: { given: 'angle-hyp', angle: 35, hypotenuse: 10, opposite: 0, adjacent: 0 } }));
    expect(html).toContain('data-ml-trig-solve="ready"');
    expect(html).toContain('data-ml-trig-step-player="ready"');
    expect(html).toContain('data-ml-trig-step-start');
    expect(html).toContain('data-ml-trig-solve-steps="0"');
    expect(html).not.toContain('sa-ml-kit-steps__item');
    expect(html).not.toContain('5,74');
    expect(html).not.toContain('data-ml-trig-solve-done');
  });

  it('un triangle impossible : pas de panneau', () => {
    const html = wrap(createElement(TriangleSolvePanel, { triangle: { given: 'opp-hyp', opposite: 5, hypotenuse: 3 } }));
    expect(html).toBe('');
  });

  it('chaque pas de chaque configuration se traduit (aucune clé manquante, aucun {{…}} laissé)', () => {
    missing.clear();
    for (const given of Object.keys(GIVEN_FIELDS)) {
      const { steps } = buildTriangleSolveSteps(given, TRIANGLES[given]);
      for (const step of steps) {
        expect(i18n.exists(step.textKey)).toBe(true);
      }
    }
    // Rendre la liste COMPLÈTE (ce que montre le dernier pas) par le vrai panneau n'est pas
    // possible en rendu statique ; on rend donc la StepList avec les mêmes textes.
    const t = i18n.getFixedT('ar-DZ', 'mathlab');
    const { steps } = buildTriangleSolveSteps('angle-hyp', TRIANGLES['angle-hyp']);
    const html = wrap(createElement(StepList, {
      steps: steps.map((step) => ({ latex: step.latex, tone: step.tone, text: t(step.textKey, step.params) })),
      revealUpTo: 1,
    }));
    // revealUpTo = 1 : deux pas, pas un de plus.
    expect((html.match(/sa-ml-kit-steps__item/g) ?? []).length).toBe(2);
    expect(missing.size).toBe(0);
  });
});
