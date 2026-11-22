import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import mathlab from '../../../../i18n/locales/ar/mathlab.json';
import DiscoveryPanel from './DiscoveryPanel.jsx';
import { getInvestigation } from './investigations.js';

const i18n = i18next.createInstance();
i18n.use(initReactI18next).init({
  lng: 'ar-DZ',
  resources: { 'ar-DZ': { mathlab } },
  ns: ['mathlab'],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

const noop = () => {};

describe('DiscoveryPanel — le récit ne se pose pas d’un bloc', () => {
  it('fermé : le bouton seul, aucune étape du récit dans le DOM', () => {
    const html = renderToStaticMarkup(createElement(I18nextProvider, { i18n }, createElement(DiscoveryPanel, {
      investigation: getInvestigation('rectangle-area'),
      record: { stage: 'exploring', rule: null, tests: [], hintsUsed: 0 },
      evidence: { check: { verdict: 'empty' } },
      solved: false,
      onHint: noop, onUnseenTest: noop, onExplained: noop, onReset: noop,
    })));
    expect(html).toContain('data-ml-ms-story-open');
    expect(html).not.toContain('data-ml-ms-story-steps');
    expect(html).not.toContain(mathlab.tools.measurement.story['rectangle-area']['1']);
  });
});
