import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import mathlab from '../../../../i18n/locales/ar/mathlab.json';
import NumberLabTool from './NumberLabTool.jsx';
import { createNumberLabData, setMode, patchMode, MODES } from './numberState.js';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import { StepList } from '../../shared/LabKit.jsx';
import { differencesFrames, euclidFrames } from './gcdFrames.js';
import { divisionFrames } from './divisionFrames.js';
import { factorTreeFrames } from './factorTreeFrames.js';
import { orderFrames } from './orderFrames.js';
import { rootFrames } from './rootFrames.js';
import { evaluateStepByStep } from './orderOfOperations.js';
import { simplifySqrt } from './powers.js';
import { fractionSteps, ppcmSteps, powerSteps, localizeSteps } from './solutionSteps.js';

// Une instance i18n LOCALE, le namespace chargé d'avance : sinon useTranslation suspend.
const i18n = i18next.createInstance();
i18n.use(initReactI18next).init({
  lng: 'ar-DZ', fallbackLng: 'ar-DZ', resources: { 'ar-DZ': { mathlab } }, ns: ['mathlab'],
  interpolation: { escapeValue: false }, react: { useSuspense: false },
});

/** Chaque mode se REND (sans navigateur) : pas d'exception, ses sélecteurs e2e sont là. */
const render = (data) => renderToStaticMarkup(createElement(
  I18nextProvider,
  { i18n },
  createElement(NumberLabTool, { initialData: data, onChange: () => {}, onReady: () => {} }),
));

describe('le laboratoire se rend dans chaque mode', () => {
  it.each(MODES)('%s', (mode) => {
    const html = render(setMode(createNumberLabData(), mode));
    expect(html).toContain(`data-ml-nb-mode="${mode}"`);
    // La barre groupée : seize puces, toujours sous l'attribut des e2e.
    expect(html.match(/data-ml-nb-modechip=/g)).toHaveLength(16);
    expect(html).toContain('role="tablist"');
  });

  it('le PGCD s’ouvre sur les fuvāriq, sans donner le PGCD avant le dernier pas', () => {
    const html = render(setMode(createNumberLabData(), 'gcdLcm'));
    expect(html).toContain('data-ml-nb-differences');
    // Le lecteur PARTAGÉ, sur l'énoncé : « ابدأ الحل », et aucun « كل الخطوات » pour l'élève.
    expect(html).toContain('data-ml-nb-step-start');
    expect(html).not.toContain('data-ml-nb-step-reveal-all');
    expect(html).not.toContain('data-ml-nb-diff-all');
    expect(html).not.toContain('data-ml-nb-diff-result');
    expect(html).not.toContain('sa-ml-board__current');
    expect(html).toContain('data-ml-nb-ppcm');
    // Ni PGCD ni PPCM en tête : le PPCM attend le PGCD, la relation attend le PPCM.
    expect(html).toContain('data-ml-nb-ppcm-locked');
    expect(html).not.toContain('data-ml-nb-ppcm-steps');
    expect(html).not.toContain('data-ml-nb-relation-check');
    expect(html).toContain('حساب PGCD بالفوارق المتتالية');
  });

  it.each([
    ['euclid', 'data-ml-nb-euclid-divisions'],
    ['factors', 'class="is-gcd"'],
    ['lists', 'sa-ml-kit-steps__item'],
  ])('PGCD par %s : l’énoncé seul avant « ابدأ الحل »', (method, marker) => {
    const html = render(patchMode(setMode(createNumberLabData(), 'gcdLcm'), 'gcdLcm', { method }));
    expect(html).toContain('data-ml-nb-step-start');
    expect(html).not.toContain(marker);
    // 252 figure dans les listes de multiples, mais rien ne l'allume encore.
    expect(html).not.toContain('is-current">252');
    expect(html).toContain('data-ml-nb-ppcm-locked');
    expect(html).not.toContain('is-gcd');
  });

  it.each([
    ['division', {}, 'data-ml-nb-division-result'],
    ['order', {}, 'data-ml-nb-order-result'],
    ['powers', { tab: 'power' }, 'data-ml-nb-power-result'],
    ['powers', { tab: 'rules' }, 'data-ml-nb-power-rule-check'],
    ['powers', { tab: 'scientific' }, 'data-ml-nb-scientific-result'],
    ['powers', { tab: 'roots' }, 'data-ml-nb-root-result'],
    ['fractions', {}, 'data-ml-nb-fraction-answer'],
  ])('%s %j : le résultat n’est pas rendu avant le premier pas', (mode, patch, marker) => {
    const html = render(patchMode(setMode(createNumberLabData(), mode), mode, patch));
    expect(html).toContain('data-ml-nb-step-start');
    expect(html).not.toContain(marker);
    expect(html).not.toContain('sa-ml-board__current');
    expect(html).not.toContain('sa-ml-kit-steps__item');
  });

  it('l’accord arabe du nombre de pas : خطوتان، 5 خطوات، 11 خطوة', () => {
    expect(i18n.t('tools.numberLab.gcdLcm.differences.stepsCount', { ns: 'mathlab', count: 2 })).toBe('خطوتان');
    expect(i18n.t('tools.numberLab.gcdLcm.differences.stepsCount', { ns: 'mathlab', count: 5 })).toBe('5 خطوات');
    expect(i18n.t('tools.numberLab.gcdLcm.differences.stepsCount', { ns: 'mathlab', count: 11 })).toBe('11 خطوة');
    expect(i18n.t('tools.numberLab.gcdLcm.differences.divisionsCount', { ns: 'mathlab', count: 3 })).toBe('3 قسمات');
    expect(i18n.t('tools.numberLab.gcdLcm.squareCount', { ns: 'mathlab', count: 1, side: 36 })).toBe('مربّع واحد ضلعه 36');
  });

  it('un document V1 en euclid garde les carrés d’Euclide', () => {
    const html = render(patchMode(setMode(createNumberLabData(), 'gcdLcm'), 'gcdLcm', { method: 'euclid' }));
    expect(html).toContain('sa-ml-nb__euclid');
    expect(html).not.toContain('data-ml-nb-differences');
  });

  it('1000 et 1 : le déroulé est borné et le dit', () => {
    const html = render(patchMode(setMode(createNumberLabData(), 'gcdLcm'), 'gcdLcm', { a: 1000, b: 1 }));
    expect(html).toContain('data-ml-nb-go-euclid');
  });

  it('la division dessine ses 38 cubes EN VRAC tant que q n’est pas tombé', () => {
    const html = render(setMode(createNumberLabData(), 'division'));
    expect(html).toContain('data-ml-nb-division-drawing="blocks"');
    expect(html).toContain('data-ml-nb-division-stage="0"');
    expect(html.match(/class="sa-ml-nb__block"/g)).toHaveLength(38);
    expect(html).not.toContain('data-ml-nb-block-remainder');
    expect(html).toContain('class="katex');
  });

  it('les quatre onglets des puissances se rendent', () => {
    for (const tab of ['power', 'rules', 'scientific', 'roots']) {
      const html = render(patchMode(setMode(createNumberLabData(), 'powers'), 'powers', { tab }));
      expect(html).toContain(`data-ml-nb-powers-tab="${tab}"`);
      expect(html).not.toMatch(/NaN|Infinity|e\+\d/);
    }
  });

  it('les priorités : une expression fausse montre sa position', () => {
    const html = render(patchMode(setMode(createNumberLabData(), 'order'), 'order', { expression: '3 + (4' }));
    expect(html).toContain('data-ml-nb-order-error="missingClose"');
    const ok = render(setMode(createNumberLabData(), 'order'));
    expect(ok).toContain('data-ml-nb-order-steps="4"');
  });
});

/**
 * Le déroulé COMPLET (curseur au bout) : le résultat est là, et c'est le
 * dernier pas. Le curseur est un état d'interface — on rend donc les pièces
 * (MathBoard, StepList) avec le curseur voulu, comme le fait le mode.
 */
describe('au dernier pas, le résultat est rendu — pas avant', () => {
  const board = (frames, cursor, problem = 'x') => renderToStaticMarkup(createElement(
    I18nextProvider, { i18n }, createElement(MathBoard, { frames, cursor, problem }),
  ));
  const list = (steps, revealUpTo) => renderToStaticMarkup(createElement(
    I18nextProvider, { i18n }, createElement(StepList, { steps: localizeSteps(i18n.getFixedT('ar-DZ', 'mathlab'), steps), revealUpTo }),
  ));

  it.each([
    ['PGCD(48 ; 18)', differencesFrames(48, 18).frames],
    ['Euclide 84 ; 36', euclidFrames(84, 36).frames],
    ['38 ÷ 7', divisionFrames(38, 7).frames],
    ['arbre de 60', factorTreeFrames({ n: 60 }).frames],
    ['2 × (3 + 4)^2 − 10', orderFrames(evaluateStepByStep('2 × (3 + 4)^2 − 10'))],
    ['√72', rootFrames(simplifySqrt(72))],
  ])('%s : le cadre résultat n’apparaît qu’au dernier frame', (_, frames) => {
    expect(board(frames, 0)).not.toContain('sa-ml-board__current');
    expect(board(frames, frames.length - 1)).not.toContain('sa-ml-board__current is-result');
    const last = board(frames, frames.length);
    expect(last).toContain('sa-ml-board__current is-result');
    expect(last).toContain('data-mb-tone="result"');
  });

  it.each([
    ['1/3 + 1/4', fractionSteps({ n: 1, d: 3 }, { n: 1, d: 4 }, 'add').steps],
    ['PPCM(84 ; 36)', ppcmSteps(84, 36)],
    ['2^5', powerSteps(2, 5)],
  ])('%s : aucun pas avant « ابدأ الحل », le résultat au dernier', (_, steps) => {
    expect(list(steps, -1)).not.toContain('sa-ml-kit-steps__item');
    expect(list(steps, steps.length - 2)).not.toContain('sa-ml-kit-steps__item--result');
    expect(list(steps, steps.length - 1)).toContain('sa-ml-kit-steps__item--result');
  });
});
