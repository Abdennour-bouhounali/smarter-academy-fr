import { describe, it, expect, beforeEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import mathlab from '../../../../i18n/locales/ar/mathlab.json';
import AnalysisInspector from './AnalysisInspector.jsx';
import { buildScene } from './buildScene.js';
import { buildDerivativeSteps } from './derivativeSteps.js';
import { VARIATION_STAGES } from './variationTable.js';
import { createAnalysisData, setSource, setLab } from './analysisState.js';
import { layersForLab } from './layers.js';

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

const VIEW = { xMin: -1, xMax: 5, yMin: -3, yMax: 6 };
const noop = () => {};

/** Un lecteur figé à `cursor` pas sur `total` — ce que useStepReveal rend. */
const playerAt = (cursor, total) => {
  const phase = total === 0 ? 'empty' : cursor === 0 ? 'ready' : cursor >= total ? 'completed' : 'stepping';

  return {
    cursor, total, phase, mode: 'manual', speed: 'normal', playing: false,
    started: cursor > 0, done: phase === 'completed' || phase === 'empty',
    start: noop, next: noop, previous: noop, pause: noop, resume: noop, restart: noop,
    rewind: noop, revealAll: noop, setMode: noop, setSpeed: noop,
  };
};

const render = (lab, source, steppers) => {
  let data = setSource(createAnalysisData(), 'f', source);
  data = { ...setLab(data, lab), layers: layersForLab(lab, data.layers) };
  const scene = buildScene(data, VIEW, { withDomain: lab === 'study' });

  return renderToStaticMarkup(createElement(
    I18nextProvider, { i18n },
    createElement(AnalysisInspector, { data, scene, steppers, onHighlight: noop }),
  ));
};

const visible = (html) => html.replace(/<annotation[\s\S]*?<\/annotation>/g, '').replace(/<[^>]+>/g, ' ');
const clean = (html) => {
  expect(html).not.toMatch(/NaN|undefined|\[object Object\]/);
  expect([...missing]).toEqual([]);
};

describe('المشتقّة : f′(x) se dérive pas à pas', () => {
  const steps = buildDerivativeSteps('x^2-4x+3');
  const derivative = (cursor) => ({ derivative: { player: playerAt(cursor, steps.steps.length), steps } });

  it('à l’ouverture : le bouton d’action, AUCUNE dérivée écrite, pas de f″', () => {
    const html = render('derivative', 'x^2-4x+3', derivative(0));
    expect(html).toContain('data-ml-an-derive');
    expect(html).not.toContain('data-ml-an-dsteps');
    expect(visible(html)).not.toContain('2x - 4');
    expect(html).not.toContain('f″');
    expect(html).toContain('data-ml-an-derivation="steps"');
    clean(html);
  });

  it('en route : le lecteur collant, les pas atteints seulement', () => {
    const html = render('derivative', 'x^2-4x+3', derivative(2));
    expect(html).toContain('data-ml-an-dstep-player="stepping"');
    expect(html).toContain('data-ml-an-dsteps="2"');
    expect(html.match(/sa-ml-kit-steps__item/g).length).toBeGreaterThanOrEqual(2);
    expect(html).not.toContain('sa-ml-kit-steps__item--result');
    expect(visible(html)).not.toContain('2x - 4');
    clean(html);
  });

  it('au dernier pas : le résultat mis en évidence, la ligne f′(x) = 2x − 4 et f″', () => {
    const html = render('derivative', 'x^2-4x+3', derivative(steps.steps.length));
    expect(html).toContain('sa-ml-kit-steps__item--result');
    expect(visible(html)).toContain('2x - 4');
    expect(html).toContain('f″');
    expect(html).toContain('data-ml-an-derivation="done"');
    clean(html);
  });
});

describe('دراسة الدالة : le جدول التغيّرات se construit', () => {
  const study = (cursor) => ({ study: playerAt(cursor, VARIATION_STAGES.length) });

  it('à l’ouverture : aucun tableau, la liste reliée au graphe, la variation en attente', () => {
    const html = render('study', 'x^2-4x+3', study(0));
    expect(html).toContain('data-ml-an-vbuild');
    expect(html).not.toContain('data-ml-an-vartable');
    expect(html).toContain('data-ml-an-study="roots"');
    expect(html).toContain(mathlab.tools.analysis.variationSteps.pending);
    clean(html);
  });

  it('pas 3 : la ligne x et le zéro de f′, sans signe, sans flèche, sans valeur', () => {
    const html = render('study', 'x^2-4x+3', study(3));
    expect(html).toContain('data-ml-an-vartable="building"');
    expect(html).toContain('data-ml-an-varrows="1"');
    expect(html).not.toContain('data-ml-an-varsign');
    expect(html).not.toContain('data-ml-an-vararrow');
    expect(html).not.toContain('data-ml-an-varpos');
    clean(html);
  });

  it('pas 5 : signes et flèches, mais pas encore les valeurs ni la phrase du lecteur d’écran', () => {
    const html = render('study', 'x^2-4x+3', study(5));
    expect(html.match(/data-ml-an-varsign=/g)).toHaveLength(2);
    expect(html.match(/data-ml-an-vararrow=/g)).toHaveLength(2);
    expect(html).not.toContain('data-ml-an-varpos');
    expect(html).not.toContain('sa-ml-an__sr');
    clean(html);
  });

  it('dernier pas : le tableau complet (« ok »), ses valeurs, la phrase, la variation énoncée', () => {
    const html = render('study', 'x^2-4x+3', study(6));
    expect(html).toContain('data-ml-an-vartable="ok"');
    expect(html.match(/data-ml-an-varpos=/g)).toHaveLength(3);
    expect(html).toContain('sa-ml-an__sr');
    expect(html).not.toContain(mathlab.tools.analysis.variationSteps.pending);
    expect(html).toContain('sa-ml-kit-steps__item--result');
    clean(html);
  });

  it('sans lecteur (rendu isolé), le tableau reste complet comme avant', () => {
    const html = render('study', 'x^2-4x+3', null);
    expect(html).toContain('data-ml-an-vartable="ok"');
    clean(html);
  });
});
