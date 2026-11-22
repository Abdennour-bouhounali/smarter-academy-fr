import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  tok, bothSidesFrames, binaryOperationFrames, resultFrame, boardProgress, settledLines, validateFrames,
} from './frames.js';
import MathBoard from './MathBoard.jsx';

// 2x + 3 = 9 → 2x = 6 → x = 3, construit comme un outil le ferait.
function equationFrames() {
  const minus3 = bothSidesFrames({
    step: 0,
    left: [tok('a', '2x'), tok('b', '+3')],
    relation: tok('rel', '='),
    right: [tok('c', '9')],
    targets: ['b'],
    opLatex: '-3',
    applied: [tok('a', '2x'), tok('b', '+3'), tok('op1', '-3', 'operation'), tok('rel', '='), tok('c', '9'), tok('op2', '-3', 'operation')],
    after: [tok('a', '2x'), tok('rel', '='), tok('r', '6', 'result')],
    settle: '2x = 6',
  });
  const div2 = bothSidesFrames({
    step: 1,
    left: [tok('a', '2x')],
    relation: tok('rel', '='),
    right: [tok('r', '6')],
    opLatex: '\\div 2',
    applied: [tok('a', '\\frac{2x}{2}', 'operation'), tok('rel', '='), tok('r', '\\frac{6}{2}', 'operation')],
    after: [tok('x', 'x', 'result'), tok('rel', '='), tok('s', '3', 'result')],
    settle: 'x = 3',
  });
  return [...minus3, ...div2, resultFrame({ step: 2, row: [tok('x', 'x'), tok('rel', '='), tok('s', '3', 'result')] })];
}

describe('les frames d\'une transformation visible', () => {
  it('2x + 3 = 9 : désigner +3, −3 sous chaque membre, l\'écrire, simplifier — puis ÷2 — puis x = 3', () => {
    const frames = equationFrames();
    expect(validateFrames(frames)).toEqual([]);
    expect(frames[0].rows[0].find((token) => token.id === 'b').tone).toBe('selected');
    expect(frames[1].marks.map((mark) => mark.latex)).toEqual(['-3', '-3']);
    expect(frames[3].settle).toBe('2x = 6');
    expect(frames.at(-1).tone).toBe('result');
    expect(boardProgress(frames, 1)).toEqual({ current: 1, total: 3 });
    expect(boardProgress(frames, frames.length)).toEqual({ current: 3, total: 3 });
  });

  it('[2] × [3] → 6 : désigner, relier par l\'opérateur, poser le résultat', () => {
    const row = [tok('x2', 'x^2'), tok('p', '+'), tok('five', '5x'), tok('q', '+'), tok('two', '2'), tok('times', '\\times'), tok('three', '3')];
    const frames = binaryOperationFrames({ step: 0, row, a: 'two', b: 'three', symbolLatex: '\\times', resultLatex: '6', settle: '2 \\times 3 = 6' });
    expect(frames).toHaveLength(3);
    expect(frames[1].marks[0]).toMatchObject({ type: 'link', from: 'two', to: 'three' });
    expect(frames[2].marks[1]).toMatchObject({ type: 'result', latex: '6' });
  });

  it('l\'historique ne contient que les lignes acquises AVANT le frame courant', () => {
    const frames = equationFrames();
    expect(settledLines(frames, 4)).toEqual([]);
    expect(settledLines(frames, 5).map((line) => line.latex)).toEqual(['2x = 6']);
  });

  it('signale une marque qui vise un jeton absent et une fin qui n\'est pas un résultat', () => {
    const bad = [{ step: 0, rows: [[tok('a', '1')]], marks: [{ type: 'under', target: 'zz', latex: '-1' }] }];
    expect(validateFrames(bad)).toHaveLength(2);
  });
});

describe('MathBoard ne montre jamais l\'avenir', () => {
  it('avant le premier pas : l\'énoncé seul ; au pas k : rien des pas suivants', () => {
    const frames = equationFrames();
    const ready = renderToStaticMarkup(createElement(MathBoard, { frames, cursor: 0, problem: '2x + 3 = 9' }));
    expect(ready).not.toContain('data-ml-board-frame');
    const second = renderToStaticMarkup(createElement(MathBoard, { frames, cursor: 2, problem: '2x + 3 = 9' }));
    expect(second).toContain('data-ml-board-frame="2"');
    expect(second).not.toContain('frac{6}{2}');
    expect(second).not.toContain('data-mb-token="s"');
    const done = renderToStaticMarkup(createElement(MathBoard, { frames, cursor: frames.length }));
    expect(done).toContain('data-mb-token="s"');
  });
});

describe('« تدرّب بنفسك » — les exercices posés sur les frames', async () => {
  const { makeTask, checkPick, checkOperator, normalizeOperator } = await import('./frames.js');

  it('les constructeurs posent l\'exercice du vrai geste', () => {
    const frames = equationFrames();
    // 2x + 3 = 9 : désigner +3, puis « − » ; ensuite désigner 2x, puis « ÷ ».
    expect(frames[0].task).toMatchObject({ targets: ['b'], operator: '-', kind: 'term' });
    const division = frames.find((frame, index) => index > 0 && frame.task);
    expect(division.task).toMatchObject({ targets: ['a'], operator: '\\div' });
    const row = [tok('two', '2'), tok('times', '\\times'), tok('three', '3')];
    const product = binaryOperationFrames({ step: 0, row, a: 'two', b: 'three', symbolLatex: '\\times', resultLatex: '6' });
    expect(product[0].task).toMatchObject({ targets: ['two', 'three'], operator: '\\times' });
    expect(binaryOperationFrames({ step: 0, row, a: 'two', b: 'three', symbolLatex: '\\times', resultLatex: '6', task: false })[0].task).toBeUndefined();
  });

  it('juge sans ordre, et une étiquette qui n\'est pas une opération ne demande pas d\'opération', () => {
    const task = makeTask({ targets: ['two', 'three'], operator: '\\times' });
    expect(checkPick(task, ['three', 'two']).ok).toBe(true);
    expect(checkPick(task, ['two']).reason).toBe('count');
    expect(checkPick(task, ['two', 'five']).reason).toBe('wrong');
    expect(checkOperator(task, '×')).toBe(true);
    expect(checkOperator(task, '+')).toBe(false);
    expect(makeTask({ targets: ['a'], operator: '\\left(\\tfrac{-4}{2}\\right)^2' }).operator).toBeNull();
    expect(normalizeOperator('\\div 2')).toBe('\\div');
  });

  it('en mode exercice, le frame ne révèle RIEN du geste attendu', () => {
    const frames = equationFrames();
    const html = renderToStaticMarkup(createElement(MathBoard, { frames, cursor: 1, interactive: true, onSolved: () => {} }));
    expect(html).toContain('data-ml-board-practice="pick"');
    expect(html).toContain('data-mb-pick="b"');
    expect(html).not.toContain('data-mb-pick="rel"');
    expect(html).not.toContain('is-selected');
    expect(html).not.toContain('data-ml-board-operation');
    expect(html).not.toContain('sa-ml-board__marks');
  });
});

describe('« تدرّب بنفسك » — l\'élève calcule lui-même le résultat', async () => {
  const { parseNumberAnswer, checkAnswer, locateAnswer } = await import('./frames.js');

  it('lit les écritures d\'un nombre et juge à l\'égalité exacte', () => {
    expect(parseNumberAnswer('0,5')).toEqual({ n: 1, d: 2 });
    expect(parseNumberAnswer('\\frac{3}{10}')).toEqual({ n: 3, d: 10 });
    expect(parseNumberAnswer('−3')).toEqual({ n: -3, d: 1 });
    expect(parseNumberAnswer('2x')).toBeNull();
    expect(checkAnswer('\\frac{1}{2}', '0.5')).toBe(true);
    expect(checkAnswer('6', '12/2')).toBe(true);
    expect(checkAnswer('6', '5')).toBe(false);
  });

  it('le résultat attendu vient des frames suivants de la même étape', () => {
    const frames = equationFrames();
    expect(locateAnswer(frames, 0)).toEqual({ latex: '6', at: 3 });   // 9 − 3 → 6, posé au 4ᵉ frame
    const row = [tok('two', '2'), tok('times', '\\times'), tok('three', '3')];
    const product = binaryOperationFrames({ step: 0, row, a: 'two', b: 'three', symbolLatex: '\\times', resultLatex: '6' });
    expect(locateAnswer(product, 0)).toEqual({ latex: '6', at: 2 });
  });
});
