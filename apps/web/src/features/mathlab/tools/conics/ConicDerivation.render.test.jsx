import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import mathlab from '../../../../i18n/locales/ar/mathlab.json';
import ConicDerivation from './ConicDerivation.jsx';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import { buildCanonicalFrames } from './canonicalSteps.js';
import { parseConicEquation } from './conicParser.js';
import { buildIntersectionSteps } from './intersectionSteps.js';
import IntersectionSolvePanel from './IntersectionSolvePanel.jsx';

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
const t = i18n.getFixedT('ar-DZ', 'mathlab');
const wrap = (element) => renderToStaticMarkup(createElement(I18nextProvider, { i18n }, element));
const derive = (source) => ({ ...buildCanonicalFrames(source, parseConicEquation(source)), source });

const SOURCES = [
  'x^2 + y^2 - 4x - 6y + 9 = 0',
  '2x^2 + 2y^2 - 8x = 0',
  '4x^2 + 9y^2 - 8x + 36y + 4 = 0',
  'x^2 - 4y^2 - 2x - 3 = 0',
  'y = x^2 - 2x + 4',
  '2y = 4x^2 + 8x',
  'x = y^2 + 4y + 1',
];

describe('ConicDerivation — la complétion du carré au tableau', () => {
  it('à l’ouverture : l’énoncé seul, aucun frame, pas de forme canonique', () => {
    const html = wrap(createElement(ConicDerivation, { derivation: derive('x^2 + y^2 - 4x - 6y + 9 = 0'), t }));
    expect(html).toContain('data-ml-cn-derivation="ready"');
    expect(html).toContain('data-ml-cn-step-player="ready"');
    expect(html).toContain('data-ml-cn-board="ready"');
    expect(html).toContain('data-ml-board-problem');
    expect(html).not.toContain('data-ml-board-frame');
    expect(html).not.toContain('(x - 2)^2');
  });

  it('chaque frame de chaque famille se rend, texte traduit, sans clé manquante', () => {
    missing.clear();
    for (const source of SOURCES) {
      const { frames, problem } = derive(source);
      for (let cursor = 1; cursor <= frames.length; cursor += 1) {
        const html = wrap(createElement(MathBoard, { frames, cursor, problem }));
        expect(html).toContain(`data-ml-board="${cursor}/${frames.length}"`);
        expect(html).not.toContain('{{');
        expect(html).not.toMatch(/tools\.conics\.derivation/);
      }
    }
    expect([...missing]).toEqual([]);
  });

  it('avant le dernier frame, la phrase du résultat n’est pas dans le DOM', () => {
    const { frames, problem } = derive('x^2 + y^2 - 4x - 6y + 9 = 0');
    const before = wrap(createElement(MathBoard, { frames, cursor: frames.length - 1, problem }));
    const after = wrap(createElement(MathBoard, { frames, cursor: frames.length, problem }));
    const sentence = t('tools.conics.derivation.steps.resultCircle', frames.at(-1).textParams).slice(0, 8);
    expect(before).not.toContain(sentence);
    expect(after).toContain('is-result');
  });

  it('la résolution droite ∩ conique : pli fermé à l’ouverture, chaque pas se traduit', () => {
    const circle = { kind: 'circle', h: 0, k: 0, r: 5 };
    const closed = wrap(createElement(IntersectionSolvePanel, { conic: circle, line: { vertical: false, slope: 1, intercept: 1 }, t }));
    expect(closed).toContain('data-ml-cn-solve-panel="closed"');
    expect(closed).not.toContain('data-ml-cn-solve-step-player');
    missing.clear();
    const cases = [
      [circle, { vertical: false, slope: 1, intercept: 1 }],
      [circle, { vertical: false, slope: 0, intercept: 5 }],
      [circle, { vertical: false, slope: 0, intercept: 9 }],
      [{ kind: 'parabola', orientation: 'horizontal', h: 1, k: 3, a: 1 }, { vertical: true, x: 2 }],
      [{ kind: 'hyperbola', orientation: 'horizontal', h: 0, k: 0, a: 2, b: 1 }, { vertical: false, slope: 0, intercept: 1 }],
    ];
    for (const [conic, line] of cases) {
      const { steps } = buildIntersectionSteps(conic, line);
      for (const step of steps) {
        const text = t(step.textKey, step.params ?? {});
        expect(text).not.toContain('{{');
        expect(i18n.exists(step.textKey)).toBe(true);
      }
    }
    expect([...missing]).toEqual([]);
  });
});
