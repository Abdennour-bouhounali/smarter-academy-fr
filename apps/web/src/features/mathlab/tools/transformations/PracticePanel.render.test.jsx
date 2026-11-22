import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import mathlab from '../../../../i18n/locales/ar/mathlab.json';
import PracticePanel from './PracticePanel.jsx';

const i18n = i18next.createInstance();
i18n.use(initReactI18next).init({
  lng: 'ar-DZ',
  resources: { 'ar-DZ': { mathlab } },
  ns: ['mathlab'],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

const challenge = {
  kind: 'predictPoint',
  point: { x: 3, y: 2 },
  steps: [{ kind: 'rotation', enabled: true, angle: 90, center: { type: 'origin' } }],
  answer: { x: -2, y: 3 },
  choices: null,
};

const noop = () => {};
const render = (props) => renderToStaticMarkup(createElement(I18nextProvider, { i18n }, createElement(PracticePanel, {
  challenge, verdict: null, score: { solved: 0, attempts: 0 },
  onNew: noop, onSubmit: noop, onReveal: noop, puzzleId: null, puzzleSolved: false, onPuzzle: noop, onExitPuzzle: noop,
  ...props,
})));

describe('PracticePanel — « أرني » ne pose pas la réponse d’un bloc', () => {
  it('avant toute demande : ni déroulé, ni A′, ni verdict', () => {
    const html = render();
    expect(html).toContain('data-ml-practice-reveal');
    expect(html).not.toContain('data-ml-tr-solution');
    expect(html).not.toContain('data-ml-verdict');
    expect(html).not.toContain('(−2 ; 3)');
    expect(html).not.toContain('data-ml-practice-steps');
  });

  it('après la réponse de l’élève : le verdict, et le déroulé proposé (pas ouvert)', () => {
    const html = render({ verdict: { correct: false, expected: { x: -2, y: 3 } } });
    expect(html).toContain('data-ml-verdict="wrong"');
    expect(html).toContain('data-ml-practice-steps');
    expect(html).not.toContain('data-ml-tr-solution');
  });
});
