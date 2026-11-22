import { describe, it, expect, beforeEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import mathlab from '../../../../i18n/locales/ar/mathlab.json';
import AlgebraTool from './AlgebraTool.jsx';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import { buildWalkthrough } from './walkthrough.js';
import { resolutionFrames, verificationFrames } from './equationFrames.js';
import { equationExpansion } from './equationDisplay.js';
import { verifyResolution } from './verify.js';
import { simplifyExpression } from './simplify.js';
import { simplifyFrames } from './simplifyFrames.js';
import { factorExpression } from './factor.js';
import { factorFrames } from './factorFrames.js';
import { parseLinearEquation, eliminationSteps, substitutionSteps } from './systems.js';
import { eliminationFrames, substitutionFrames, graphicalFrames } from './systemsFrames.js';
import * as R from './rational.js';
import { applyOperation } from './equation.js';
import { createAlgebraData, pushStep, updatePath, resetTo, ALGEBRA_SECTIONS } from './algebraState.js';
import { parseEquation } from './equation.js';
import {
  SIMPLIFY_EXAMPLES, FACTOR_EXAMPLES, SYSTEM_EXAMPLES, FUNCTION_EXAMPLES, EQUATION_EXAMPLES, INEQUALITY_EXAMPLES,
} from './examples.js';

// Une instance i18n LOCALE ; toute clé absente est relevée (une chaîne manquante s'afficherait en clair).
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

const render = (data) => renderToStaticMarkup(createElement(
  I18nextProvider,
  { i18n },
  createElement(AlgebraTool, { initialData: data, onChange: () => {}, onReady: () => {} }),
));

const clean = (html) => {
  expect(html).not.toMatch(/NaN|Infinity|undefined|\[object Object\]/);
  expect([...missing]).toEqual([]);
};

beforeEach(() => missing.clear());

describe('le مختبر الجبر se rend dans chaque section', () => {
  it('un document neuf ouvre sur les معادلات, barre des six sections, sans la solution', () => {
    const html = render(undefined);
    expect(html).toContain('data-ml-alg-section="equations"');
    expect(html.match(/data-ml-alg-tab=/g)).toHaveLength(6);
    expect(html).toContain('role="tablist"');
    expect(html).toContain('data-ml-current-equation');
    expect(html).not.toContain('data-ml-solution');
    // « حلّ خطوة بخطوة » est proposé ; aucun tableau n'est encore ouvert.
    expect(html).toContain('data-ml-alg-solve');
    expect(html).toContain('data-ml-alg-show-solution');
    expect(html).not.toContain('data-ml-alg-board');
    clean(html);
  });

  it.each(ALGEBRA_SECTIONS)('section %s', (section) => {
    const html = render({ ...createAlgebraData(), section });
    expect(html).toContain(`data-ml-alg-mode="${section}"`);
    clean(html);
  });

  it('المعادلات : une saisie à parenthèses montre « نشر وتبسيط », une opération montre sa ligne intermédiaire', () => {
    for (const example of EQUATION_EXAMPLES) {
      const eq = parseEquation(example.source).equation;
      const html = render(resetTo(createAlgebraData(), eq, example.source));
      if (example.level === 'advanced') expect(html).toContain('data-ml-alg-expansion');
      clean(html);
    }
    let data = createAlgebraData();
    const result = applyOperation(data.steps[0].equation, { kind: 'subtract', value: R.makeRational(3) });
    data = pushStep(data, result.equation, { kind: 'subtract', value: R.makeRational(3) });
    const html = render(data);
    expect(html).toContain('data-ml-alg-intermediate');
    expect(html).toContain('data-ml-alg-history-intermediate');
    clean(html);
  });

  it('المعادلات / المتراجحات : avant le déroulé, aucune réponse — ni verdict, ni borne, ni ensemble', () => {
    for (const source of ['2x + 3 = 2x + 5', '2x + 3 = 2x + 3', '4x - 7 = 2x + 5']) {
      const html = render(resetTo(createAlgebraData(), parseEquation(source).equation, source));
      expect(html).not.toContain('data-ml-solution');
      expect(html).toContain('data-ml-alg-solve');
      clean(html);
    }
    const data = { ...createAlgebraData(), section: 'inequalities' };
    const html = render({ ...data, inequalities: resetTo(data.inequalities, parseEquation('2x + 3 < 9').equation, '2x + 3 < 9') });
    expect(html).not.toContain('data-ml-alg-solution-set');
    expect(html).not.toContain('sa-ml-alg__numberline-solution');
    clean(html);
  });

  it('المتراجحات : le retournement annoncé, l’ensemble en intervalle une fois isolé', () => {
    let data = { ...createAlgebraData(), section: 'inequalities' };
    const steps = [{ kind: 'subtract', value: R.makeRational(3) }, { kind: 'divide', value: R.makeRational(-2) }];
    for (const operation of steps) {
      data = updatePath(data, 'inequalities', (path) => {
        const result = applyOperation(path.steps[path.cursor].equation, operation);

        return pushStep(path, result.equation, operation, result.flipped, 30);
      });
    }
    const html = render(data);
    expect(html).toContain('data-ml-alg-flip');
    expect(html).toContain('data-ml-alg-solution-set');
    expect(html).toContain('data-ml-alg-interval');
    clean(html);
    for (const example of INEQUALITY_EXAMPLES) {
      const eq = parseEquation(example.source).equation;
      clean(render({ ...data, inequalities: resetTo(data.inequalities, eq, example.source) }));
    }
  });

  it.each(SYSTEM_EXAMPLES.map((e) => e.id))('الأنظمة — %s, chaque méthode', (id) => {
    const example = SYSTEM_EXAMPLES.find((e) => e.id === id);
    for (const method of ['substitution', 'elimination', 'graphical']) {
      const html = render({ ...createAlgebraData(), section: 'systems', systems: { first: example.first, second: example.second, method } });
      expect(html).toContain('data-ml-alg-system');
      expect(html).toContain('data-ml-alg-step-player="ready"');
      expect(html).toContain('data-ml-alg-board="ready"');
      // Rien du raisonnement avant le premier geste : ni verdict, ni vérification, ni point.
      expect(html).toContain('data-ml-alg-system-kind="pending"');
      expect(html).not.toContain('data-ml-alg-system-verdict');
      expect(html).not.toContain('data-ml-alg-intersection');
      if (method === 'graphical') {
        expect(html).toContain('data-ml-alg-plane');
        expect(html).not.toContain('data-ml-alg-line');
      }
      clean(html);
    }
  });

  it.each(SIMPLIFY_EXAMPLES.map((e) => e.source))('تبسيط — %s', (source) => {
    const html = render({ ...createAlgebraData(), section: 'simplify', simplify: { source } });
    expect(html).toContain('data-ml-alg-simplify');
    expect(html).toContain('data-ml-alg-board="ready"');
    expect(html).not.toContain('data-ml-alg-simplify-result');
    clean(html);
  });

  it.each(FACTOR_EXAMPLES.map((e) => e.source))('تحليل — %s', (source) => {
    const html = render({ ...createAlgebraData(), section: 'factor', factor: { source } });
    expect(html).toContain('data-ml-alg-factor-status');
    expect(html).toContain('data-ml-alg-board="ready"');
    clean(html);
  });

  it('تحليل : ni candidats, ni vérification, ni مميّز avant le déroulé', () => {
    const html = render({ ...createAlgebraData(), section: 'factor', factor: { source: 'x^2 + 5x + 6' } });
    expect(html).not.toContain('data-mb-token');
    expect(html).not.toContain('data-ml-alg-factor-verify');
    expect(html).not.toContain('data-ml-alg-discriminant');
    clean(html);
  });

  it('une saisie invalide stockée donne un message, jamais une exception', () => {
    for (const section of ['simplify', 'factor']) {
      clean(render({ ...createAlgebraData(), section, [section]: { source: 'sin(x' } }));
    }
    clean(render({ ...createAlgebraData(), section: 'systems', systems: { first: 'xy = 2', second: 'x = 1', method: 'graphical' } }));
  });

  it.each(FUNCTION_EXAMPLES.map((e) => e.id))('الدوال — %s', (id) => {
    const { value } = FUNCTION_EXAMPLES.find((e) => e.id === id);
    const html = render({ ...createAlgebraData(), section: 'functions', functions: { ...value, tableStart: -3, tableStep: 1 } });
    expect(html).toContain('data-ml-alg-facts');
    expect(html).toContain('data-ml-alg-table');
    clean(html);
  });
});

/** Le tableau à un curseur donné — ce que l'élève voit après `cursor` gestes. */
const board = (frames, cursor, problem = null) => renderToStaticMarkup(createElement(
  I18nextProvider,
  { i18n },
  createElement(MathBoard, { frames, cursor, problem }),
));

/** Tous les frames se rendent (aucune clé manquante), et le dernier seul porte le résultat. */
function checkBoard(frames, finalMarker) {
  const before = board(frames, frames.length - 1);
  const after = board(frames, frames.length);
  expect(before).not.toContain(finalMarker);
  expect(after).toContain(finalMarker);
  for (let cursor = 1; cursor <= frames.length; cursor += 1) clean(board(frames, cursor));
}

describe('le tableau : la réponse n’arrive qu’au DERNIER geste, et chaque geste a sa phrase', () => {
  it('المعادلات et المتراجحات — chaque exemple, avec son التحقق', () => {
    for (const example of [...EQUATION_EXAMPLES, ...INEQUALITY_EXAMPLES]) {
      const start = parseEquation(example.source).equation;
      const walk = buildWalkthrough(start);
      const frames = resolutionFrames(walk, { expansion: equationExpansion(example.source), start });
      checkBoard(frames, 'sa-ml-board__current is-result');
      if (walk.final.kind === 'solved') {
        const verification = verifyResolution(start, walk.final.solution, walk.final.relation);
        checkBoard(verificationFrames(start, verification), 'sa-ml-board__current is-result');
      }
    }
    // Les cas particuliers : leur phrase, pas un nombre.
    for (const source of ['2x + 3 = 2x + 5', '2x + 3 = 2x + 3', '2x + 1 < 2x', 'x + 1 >= x']) {
      checkBoard(resolutionFrames(buildWalkthrough(parseEquation(source).equation)), 'sa-ml-board__current is-result');
    }
  });

  it('2x + 3 = 9 : au 4e geste 2x = 6, et x = 3 n’est au tableau qu’à la fin', () => {
    const frames = resolutionFrames(buildWalkthrough(parseEquation('2x + 3 = 9').equation));
    const fourth = board(frames, 4, '2x + 3 = 9');
    expect(fourth).toContain('data-mb-token="Rc"');
    expect(fourth).not.toContain('data-mb-token="fs"');
    expect(board(frames, frames.length)).toContain('data-mb-token="fs"');
  });

  it.each(SIMPLIFY_EXAMPLES.map((e) => e.source))('تبسيط — %s', (source) => {
    checkBoard(simplifyFrames(simplifyExpression(source)), 'sa-ml-board__current is-result');
  });

  it.each(FACTOR_EXAMPLES.map((e) => e.source))('تحليل — %s', (source) => {
    checkBoard(factorFrames(factorExpression(source)), 'sa-ml-board__current is-result');
  });

  it.each(SYSTEM_EXAMPLES.map((e) => e.id))('الأنظمة — %s, les trois méthodes', (id) => {
    const example = SYSTEM_EXAMPLES.find((e) => e.id === id);
    const e1 = parseLinearEquation(example.first).equation;
    const e2 = parseLinearEquation(example.second).equation;
    checkBoard(eliminationFrames(eliminationSteps(e1, e2), e1, e2), 'sa-ml-board__current is-result');
    checkBoard(substitutionFrames(substitutionSteps(e1, e2), e1), 'sa-ml-board__current is-result');
    checkBoard(graphicalFrames(e1, e2), 'sa-ml-board__current is-result');
  });
});
