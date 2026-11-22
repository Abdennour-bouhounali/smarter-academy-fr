import { describe, it, expect } from 'vitest';
import { validateFrames, boardProgress, settledLines } from '../../shared/mathBoard/frames.js';
import {
  differencesFrames, differencesDrawing, euclidFrames, euclidDrawnCount,
} from './gcdFrames.js';
import { divisionFrames, divisionDrawStage } from './divisionFrames.js';
import { factorTreeFrames, treeAtCursor } from './factorTreeFrames.js';
import { autoSplitStages, collectLeaves } from './factorTree.js';
import { orderFrames, splitAtHighlight } from './orderFrames.js';
import { evaluateStepByStep } from './orderOfOperations.js';
import { rootFrames } from './rootFrames.js';
import { simplifySqrt, applyPowerRule, scientificNotation } from './powers.js';
import {
  factorMethodSteps, listsSteps, ppcmSteps, powerSteps, powerRuleSteps, scientificSteps, fractionSteps,
} from './solutionSteps.js';

/** Les lignes acquises d'un déroulé complet — ce que le tableau garde en mémoire. */
const settled = (frames) => settledLines(frames, frames.length + 1).map((line) => line.latex);
const resultRow = (frames) => frames.at(-1).rows[0].map((token) => token.latex).join(' ');

describe('PGCD بالفوارق المتتالية au tableau', () => {
  const { run, frames } = differencesFrames(48, 18);

  it('48 ; 18 : cinq soustractions, trois micro-états chacune, puis PGCD = 6 EN DERNIER', () => {
    expect(validateFrames(frames)).toEqual([]);
    expect(frames).toHaveLength(5 * 3 + 1);
    expect(settled(frames)).toEqual([
      '48 - 18 = 30 \\quad\\Rightarrow\\quad (30\\ ;\\ 18)',
      '30 - 18 = 12 \\quad\\Rightarrow\\quad (18\\ ;\\ 12)',
      '18 - 12 = 6 \\quad\\Rightarrow\\quad (12\\ ;\\ 6)',
      '12 - 6 = 6 \\quad\\Rightarrow\\quad (6\\ ;\\ 6)',
      '6 - 6 = 0 \\quad\\Rightarrow\\quad (6\\ ;\\ 0)',
      '\\mathrm{PGCD}(48\\ ;\\ 18) = 6',
    ]);
    expect(run.gcd).toBe(6);
    expect(boardProgress(frames, 1)).toEqual({ current: 1, total: 6 });
  });

  it('désigner → relier par « − » → la différence tombe', () => {
    expect(frames[0].rows[0].find((token) => token.id === 'big').tone).toBe('selected');
    expect(frames[1].marks).toEqual([{ type: 'link', from: 'big', to: 'small', latex: '-' }]);
    expect(frames[2].marks[1]).toMatchObject({ type: 'result', latex: '30' });
  });

  it('le PGCD n’est écrit dans AUCUN frame avant le dernier', () => {
    frames.slice(0, -1).forEach((frame) => {
      expect(JSON.stringify(frame)).not.toContain('PGCD');
    });
    expect(resultRow(frames)).toBe('\\mathrm{PGCD}(48\\ ;\\ 18) = 6');
  });

  it('les rubans suivent : couple entier tant qu’on désigne, coupé quand la différence tombe', () => {
    expect(differencesDrawing(frames, 0)).toBeNull();
    expect(differencesDrawing(frames, 1)).toEqual({ index: 0, cut: false });
    expect(differencesDrawing(frames, 2)).toEqual({ index: 0, cut: false });
    expect(differencesDrawing(frames, 3)).toEqual({ index: 0, cut: true });
    expect(differencesDrawing(frames, frames.length)).toEqual({ index: 4, cut: true });
  });

  it('1000 ; 1 : trace bornée, pas de frame de résultat', () => {
    const bounded = differencesFrames(1000, 1);
    expect(bounded.run.truncated).toBe(true);
    expect(bounded.frames.at(-1).tone).not.toBe('result');
  });
});

describe('خوارزمية إقليدس au tableau', () => {
  const { frames } = euclidFrames(84, 36);

  it('84 ; 36 : deux divisions, puis PGCD = 12', () => {
    expect(validateFrames(frames)).toEqual([]);
    expect(settled(frames)).toEqual([
      '84 = 2 \\times 36 + 12',
      '36 = 3 \\times 12 + 0',
      '\\mathrm{PGCD}(84\\ ;\\ 36) = 12',
    ]);
    expect(frames[1].marks[0]).toMatchObject({ type: 'link', latex: '\\div' });
    expect(frames[2].marks[1]).toMatchObject({ type: 'result', latex: 'q = 2,\\ r = 12' });
  });

  it('les carrés d’une division se posent quand elle tombe', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7].map((cursor) => euclidDrawnCount(frames, cursor))).toEqual([0, 0, 0, 1, 1, 1, 2, 2]);
  });
});

describe('القسمة الإقليدية au tableau', () => {
  const { frames } = divisionFrames(38, 7);

  it('38 ÷ 7 : question, rzam (q), reste (r), égalité, condition EN DERNIER', () => {
    expect(validateFrames(frames)).toEqual([]);
    expect(boardProgress(frames, frames.length)).toEqual({ current: 5, total: 5 });
    expect(settled(frames)).toEqual(['q = 5', 'r = 38 - 35 = 3', '38 = 7 \\times 5 + 3', '0 \\le 3 < 7']);
    expect(frames[1].marks[0]).toMatchObject({ type: 'under', target: 'q', latex: '7 \\times 5 = 35' });
    expect(frames[0].rows[0].map((token) => token.latex)).toEqual(['38', '=', '7', '\\times', '?', '+', '?']);
  });

  it('ni q ni r avant leur pas ; le dessin suit (vrac → rzam → reste)', () => {
    expect(frames[0].rows[0].some((token) => token.latex === '5')).toBe(false);
    expect(frames.slice(0, 3).some((frame) => JSON.stringify(frame.rows).includes('"3"'))).toBe(false);
    expect([0, 1, 2, 3, 4, 7, 8].map((cursor) => divisionDrawStage(frames, cursor))).toEqual([0, 0, 1, 1, 2, 2, 2]);
  });

  it('5 ÷ 8 : q = 0, r = 5', () => {
    expect(settled(divisionFrames(5, 8).frames)).toEqual(['q = 0', 'r = 5 - 0 = 5', '5 = 8 \\times 0 + 5', '0 \\le 5 < 8']);
  });
});

describe('شجرة العوامل, une fente par étape', () => {
  it('60 → 2 × 30 → 2 × 2 × 15 → 2 × 2 × 3 × 5, puis 2^2 × 3 × 5', () => {
    const start = { n: 60 };
    const { stages, frames } = factorTreeFrames(start);
    expect(stages.map((stage) => stage.leaves)).toEqual([[2, 30], [2, 2, 15], [2, 2, 3, 5]]);
    expect(validateFrames(frames)).toEqual([]);
    expect(settled(frames)).toEqual([
      '60 = 2 \\times 30',
      '60 = 2 \\times 2 \\times 15',
      '60 = 2 \\times 2 \\times 3 \\times 5',
      '60 = 2^{2} \\times 3 \\times 5',
    ]);
    // L'arbre dessiné pousse quand le quotient tombe.
    expect(treeAtCursor(start, stages, frames, 0)).toBe(start);
    expect(collectLeaves(treeAtCursor(start, stages, frames, 2)).map((leaf) => leaf.n)).toEqual([60]);
    expect(collectLeaves(treeAtCursor(start, stages, frames, 3)).map((leaf) => leaf.n)).toEqual([2, 30]);
    expect(collectLeaves(treeAtCursor(start, stages, frames, frames.length)).map((leaf) => leaf.n)).toEqual([2, 2, 3, 5]);
  });

  it('part de l’arbre commencé à la main (360 = 36 × 10)', () => {
    const stages = autoSplitStages({ n: 360, left: { n: 36 }, right: { n: 10 } });
    expect(stages.at(-1).leaves).toEqual([2, 2, 3, 3, 2, 5]);
  });

  it('un arbre fini ou un nombre premier : rien à dérouler', () => {
    expect(factorTreeFrames({ n: 7 }).frames).toEqual([]);
    expect(factorTreeFrames({ n: 6, left: { n: 2 }, right: { n: 3 } }).frames).toEqual([]);
  });
});

describe('أولويات العمليات au tableau', () => {
  it('2 × (3 + 4)^2 − 10 : désigner, relier, poser, intégrer — 88 au dernier frame seulement', () => {
    const frames = orderFrames(evaluateStepByStep('2 × (3 + 4)^2 − 10'));
    expect(validateFrames(frames)).toEqual([]);
    expect(settled(frames)).toEqual([
      '= 2 \\times 7^{2} - 10',
      '= 2 \\times 49 - 10',
      '= 98 - 10',
      '= 88',
      '2 \\times \\left(3 + 4\\right)^{2} - 10 = 88',
    ]);
    expect(frames[0].rows[0].map((token) => token.latex)).toEqual(['2 \\times (', '3', '+', '4', ')^{2} - 10']);
    expect(frames[1].marks[0]).toMatchObject({ type: 'link', from: 'l', to: 'r', latex: '+' });
  });

  it('la découpe refuse un morceau aux accolades déséquilibrées (cible dans un exposant)', () => {
    expect(splitAtHighlight('2^{\\textcolor{#F36D21}{1 + 1}}')).toBeNull();
    expect(splitAtHighlight('5 - \\textcolor{#F36D21}{3^{2}} + 1')).toEqual({ prefix: '5 -', target: '3^{2}', suffix: '+ 1' });
    expect(validateFrames(orderFrames(evaluateStepByStep('2^(1+1)')))).toEqual([]);
  });

  it('une erreur de calcul : pas de frame de résultat', () => {
    const frames = orderFrames(evaluateStepByStep('2 + 3 ÷ (1 − 1)'));
    expect(frames.some((frame) => frame.tone === 'result')).toBe(false);
  });
});

describe('√ au tableau', () => {
  it('√72 = √(36 × 2) = √36 × √2 = 6√2', () => {
    const frames = rootFrames(simplifySqrt(72));
    expect(validateFrames(frames)).toEqual([]);
    expect(settled(frames)).toEqual([
      '\\sqrt{72} = \\sqrt{36 \\times 2}',
      '= \\sqrt{36} \\times \\sqrt{2}',
      '= 6\\sqrt{2}',
      '\\sqrt{72} = 6\\sqrt{2}',
    ]);
    expect(frames.slice(0, -1).some((frame) => JSON.stringify(frame.rows).includes('6\\\\sqrt'))).toBe(false);
  });

  it('√49 = 7 ; √30 ne se simplifie pas ; √1 = 1', () => {
    expect(settled(rootFrames(simplifySqrt(49)))).toEqual(['\\sqrt{49} = \\sqrt{7^{2}}', '\\sqrt{49} = 7']);
    expect(settled(rootFrames(simplifySqrt(30)))).toEqual(['30 = 2 \\times 3 \\times 5', '\\sqrt{30}']);
    expect(validateFrames(rootFrames(simplifySqrt(7)))).toEqual([]);
    expect(rootFrames(simplifySqrt(1))).toHaveLength(1);
  });
});

describe('les dérivations formule par formule (StepList)', () => {
  const latex = (steps) => steps.map((step) => step.latex);
  const lastIsResult = (steps) => steps.at(-1).tone === 'result' && steps.slice(0, -1).every((step) => step.tone !== 'result');

  it('PGCD par facteurs premiers : 84 ; 36', () => {
    const { steps } = factorMethodSteps(84, 36);
    expect(latex(steps)).toEqual([
      '84 = 2^{2} \\times 3 \\times 7',
      '36 = 2^{2} \\times 3^{2}',
      '\\mathrm{PGCD}(84\\ ;\\ 36) = 2^{2} \\times 3',
      '\\mathrm{PGCD}(84\\ ;\\ 36) = 12',
    ]);
    expect(lastIsResult(steps)).toBe(true);
    expect(lastIsResult(factorMethodSteps(8, 15).steps)).toBe(true);
  });

  it('PGCD par listes : 12 ; 18', () => {
    const { steps, gcd } = listsSteps(12, 18);
    expect(gcd).toBe(6);
    expect(steps[2].latex).toBe('\\{1,\\ 2,\\ 3,\\ 6\\}');
    expect(lastIsResult(steps)).toBe(true);
  });

  it('PPCM(84 ; 36) = 84 × 36 / 12 = 3024 / 12 = 252', () => {
    const steps = ppcmSteps(84, 36);
    expect(latex(steps).slice(1)).toEqual([
      '\\mathrm{PPCM}(84\\ ;\\ 36) = \\dfrac{84 \\times 36}{12}',
      '\\mathrm{PPCM}(84\\ ;\\ 36) = \\dfrac{3024}{12}',
      '\\mathrm{PPCM}(84\\ ;\\ 36) = 252',
    ]);
    expect(steps.slice(0, -1).some((step) => `${step.latex} ${step.operationLatex ?? ''}`.includes('252'))).toBe(false);
  });

  it('2^5, facteur par facteur', () => {
    const steps = powerSteps(2, 5);
    expect(latex(steps)).toEqual([
      '2^{5} = 2 \\times 2 \\times 2 \\times 2 \\times 2',
      '= 4 \\times 2 \\times 2 \\times 2',
      '= 8 \\times 2 \\times 2',
      '= 16 \\times 2',
      '2^{5} = 32',
    ]);
    expect(lastIsResult(steps)).toBe(true);
    expect(latex(powerSteps(2, -3))).toEqual(['2^{-3} = \\dfrac{1}{2^{3}}', '= \\dfrac{1}{2 \\times 2 \\times 2}', '2^{-3} = \\frac{1}{8}']);
    expect(powerSteps(7, 0)).toHaveLength(1);
  });

  it('a^m × a^n : la règle, le pourquoi, les exposants combinés, puis a^{m+n}', () => {
    const steps = powerRuleSteps(applyPowerRule('product', 2, 3, 4));
    expect(steps.at(-1)).toMatchObject({ latex: '2^{3} \\times 2^{4} = 2^{7}', operationLatex: '3 + 4 = 7', tone: 'result' });
    expect(steps.slice(0, -1).some((step) => step.latex.includes('2^{7}'))).toBe(false);
  });

  it('écriture scientifique de 0,00045', () => {
    expect(latex(scientificSteps(scientificNotation('0,00045')))).toEqual([
      '1 \\le 4{,}5 < 10',
      'n = -4',
      '0{,}00045 = 4{,}5 \\times 10^{-4}',
    ]);
  });

  it('1/3 + 1/4 : PPCM des dénominateurs, conversion, numérateurs, 7/12', () => {
    const { steps, commonIndex } = fractionSteps({ n: 1, d: 3 }, { n: 1, d: 4 }, 'add');
    expect(latex(steps)).toEqual([
      '\\mathrm{PPCM}(3\\ ;\\ 4) = 12',
      '\\frac{1}{3} + \\frac{1}{4} = \\frac{4}{12} + \\frac{3}{12}',
      '= \\dfrac{4 + 3}{12}',
      '\\frac{1}{3} + \\frac{1}{4} = \\frac{7}{12}',
    ]);
    expect(commonIndex).toBe(1);
    expect(lastIsResult(steps)).toBe(true);
  });

  it('1/6 + 1/3 = 3/6 = 1/2 ; ÷ ; comparaison', () => {
    const add = fractionSteps({ n: 1, d: 6 }, { n: 1, d: 3 }, 'add').steps;
    expect(add.at(-1)).toMatchObject({ latex: '\\frac{1}{6} + \\frac{1}{3} = \\frac{1}{2}', operationLatex: '\\div 3' });
    const divide = fractionSteps({ n: 1, d: 2 }, { n: 3, d: 4 }, 'divide').steps;
    expect(divide[0].latex).toBe('\\frac{1}{2} \\div \\frac{3}{4} = \\frac{1}{2} \\times \\frac{4}{3}');
    expect(divide.at(-1).latex).toBe('\\frac{1}{2} \\div \\frac{3}{4} = \\frac{2}{3}');
    const compare = fractionSteps({ n: 3, d: 5 }, { n: 4, d: 7 }, 'compare').steps;
    expect(latex(compare).slice(1)).toEqual(['21 > 20', '\\frac{3}{5} > \\frac{4}{7}']);
    expect(fractionSteps({ n: 1, d: 2 }, { n: 0, d: 1 }, 'divide').steps).toEqual([]);
  });
});

describe('« تدرّب بنفسك » : chaque exercice est le vrai geste', () => {
  const tasks = (frames) => frames.map((frame, index) => (frame.task ? { index, targets: frame.task.targets, operator: frame.task.operator } : null)).filter(Boolean);

  it('48 ; 18 : les deux nombres du couple, puis « − », à chaque soustraction', () => {
    const { frames } = differencesFrames(48, 18);
    expect(validateFrames(frames)).toEqual([]);
    expect(tasks(frames)).toEqual([0, 3, 6, 9, 12].map((index) => ({ index, targets: ['big', 'small'], operator: '-' })));
    expect(frames[0].task.promptKey).toBe('tools.numberLab.practice.board.differences');
  });

  it('Euclide 84 ; 36 : dividende et diviseur, puis « ÷ »', () => {
    expect(tasks(euclidFrames(84, 36).frames)).toEqual([0, 3].map((index) => ({ index, targets: ['dividend', 'divisor'], operator: '\\div' })));
  });

  it('38 ÷ 7 : a et b puis « ÷ » ; 38 et 35 puis « − » pour le reste', () => {
    const { frames } = divisionFrames(38, 7);
    expect(validateFrames(frames)).toEqual([]);
    expect(tasks(frames)).toEqual([
      { index: 0, targets: ['a', 'b'], operator: '\\div' },
      { index: 3, targets: ['a', 'bq'], operator: '-' },
    ]);
    expect(frames[3].rows[0].map((token) => token.latex)).toEqual(['38', '-', '35']);
  });

  it('arbre de 60 : le nombre à fendre et son plus petit premier, puis « ÷ »', () => {
    const { frames } = factorTreeFrames({ n: 60 });
    expect(validateFrames(frames)).toEqual([]);
    expect(tasks(frames).map((task) => task.targets.map((id) => frames[task.index].rows[0].find((token) => token.id === id).latex)))
      .toEqual([['60', '2'], ['30', '2'], ['15', '3']]);
    expect(tasks(frames).every((task) => task.operator === '\\div')).toBe(true);
  });

  it('2 × (3 + 4)^2 − 10 : 3 et 4 puis « + » ; la puissance désignée ; 2 et 49 puis « × » ; 98 et 10 puis « − »', () => {
    const frames = orderFrames(evaluateStepByStep('2 × (3 + 4)^2 − 10'));
    expect(validateFrames(frames)).toEqual([]);
    const picked = tasks(frames).map((task) => ({
      latex: task.targets.map((id) => frames[task.index].rows[0].find((token) => token.id === id).latex),
      operator: task.operator,
    }));
    expect(picked).toEqual([
      { latex: ['3', '4'], operator: '+' },
      { latex: ['7^{2}'], operator: null },
      { latex: ['2', '49'], operator: '\\times' },
      { latex: ['98', '10'], operator: '-' },
    ]);
  });

  it('√72 : toucher √36, la racine qu’on sait calculer', () => {
    const frames = rootFrames(simplifySqrt(72));
    expect(validateFrames(frames)).toEqual([]);
    expect(tasks(frames)).toEqual([{ index: 2, targets: ['sa'], operator: null }]);
  });
});
