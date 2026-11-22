import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import mathlab from '../../../../i18n/locales/ar/mathlab.json';
import PracticePanel from './PracticePanel.jsx';
import { generateChallenge, CHALLENGE_KINDS } from './practice.js';
import { buildRevealSteps } from './revealSteps.js';
import { createPracticeState } from './sequenceState.js';

// Une instance i18n LOCALE, le namespace chargé d'avance : sinon useTranslation suspend.
const i18n = i18next.createInstance();
i18n.use(initReactI18next).init({
  lng: 'ar-DZ', fallbackLng: 'ar-DZ', resources: { 'ar-DZ': { mathlab } }, ns: ['mathlab'],
  interpolation: { escapeValue: false }, react: { useSuspense: false },
});

const noop = () => {};
const render = (practice) => renderToStaticMarkup(createElement(I18nextProvider, { i18n }, createElement(PracticePanel, {
  practice, onAnswer: noop, onSubmit: noop, onHint: noop, onReveal: noop, onRevealDone: noop, onNext: noop, onClose: noop,
})));
const challenge = generateChallenge(4, { kinds: ['arithmeticTerm'] });
const base = { ...createPracticeState(), active: true, challenge };

/**
 * « اكشف » DEMANDÉ ne jette pas la solution d'un bloc (exigence 2026-09-30) :
 * le panneau s'ouvre sur le déroulé, sans aucun pas, sans la réponse.
 */
describe('PracticePanel — la révélation', () => {
  it('demandée : le lecteur de pas, ni terme ni réponse avant le premier pas', () => {
    const html = render({ ...base, phase: 'reveal', revealMode: 'request' });
    expect(html).toContain('data-ml-seq-reveal-step-player="ready"');
    expect(html).toContain('data-ml-seq-practice-mode="steps"');
    expect(html).not.toContain('data-ml-seq-practice-expected');
    expect(html).not.toContain('data-ml-seq-explain-term');
    expect(html).not.toContain('data-ml-seq-reveal-steps');
  });

  it('les pas ont tous leur phrase arabe', () => {
    const keys = new Set(['title']);
    for (const kind of CHALLENGE_KINDS) {
      for (let seed = 1; seed <= 60; seed += 1) {
        for (const step of buildRevealSteps(generateChallenge(seed, { kinds: [kind], difficulty: ['easy', 'normal', 'hard'][seed % 3] }))) {
          keys.add(step.textKey);
        }
      }
    }
    for (const key of keys) {
      expect(i18n.exists(`tools.sequences.practice.steps.${key}`, { ns: 'mathlab' }), key).toBe(true);
    }
  });

  it('après une réponse juste : les termes et la réponse, d’un coup (l’élève l’a produite)', () => {
    const html = render({ ...base, phase: 'reveal', revealMode: 'answer', verdict: { correct: true, readable: true } });
    expect(html).toContain('data-ml-seq-practice-expected');
    expect(html).toContain('data-ml-seq-explain-term');
    expect(html).not.toContain('data-ml-seq-reveal-step-player');
  });

  it('avant toute révélation : rien de la solution', () => {
    const html = render({ ...base, phase: 'predict' });
    expect(html).not.toContain('data-ml-seq-practice-explain');
    expect(html).toContain('data-ml-seq-practice-reveal');
  });
});
