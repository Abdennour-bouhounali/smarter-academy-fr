import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import TrigCalculator, { QUESTIONS, chainFor } from './TrigCalculator';
import * as TL from '../logic/trigCalculator';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * trig-calculator se rend aux deux niveaux de levels.js (30°, 45°, 60° ; le tableau du نشاط 4 + les trois angles),
 * seul et dans un workspace, sans clé i18n brute, sans interpolation oubliée, sans aucune réponse du tableau écrite.
 */
const RAW = /manipulation\.[a-zA-Z]/;

describe('trig-calculator — rendu', () => {
  it('beginner: the drone scene, the calculator in R mode, every key, the table fold, no answer', () => {
    const html = renderToString(<TrigCalculator {...LEVELS['trig-calculator'].beginner.numbers} />);
    expect(html).toContain('data-trig-calculator');
    expect(html).toContain('data-tc-glance');
    expect(html).toContain('data-stage="table"');
    expect(html).toContain('data-mode="RAD"');
    expect(html).toContain('data-tc-mode-flag="RAD"');
    for (const k of ['2nd', 'DRG', 'sin', 'cos', 'tan', 'ON', 'DEL', '=', ',', '0', '9']) expect(html).toContain(`data-tc-key="${k}"`);
    expect(html).toContain('data-tc-cell="30|cos"');
    expect(html).toContain('data-deco="hud"');
    expect(html).toContain('data-lab-fold="trig-calculator.table"');
    expect(html).not.toContain('data-tc-next');
    expect(html).not.toContain('0,87');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('advanced (نشاط 4): seven angles, the inverse stage closed, 31,33 nowhere', () => {
    const html = renderToString(<TrigCalculator {...LEVELS['trig-calculator'].advanced.numbers} />);
    expect(html).toContain('data-tc-cell="75|tan"');
    expect(html).not.toContain('data-tc-task');
    expect(html).not.toContain('31,33');
    expect(html).not.toContain('3,73');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <TrigCalculator level="beginner" {...LEVELS['trig-calculator'].beginner.numbers} />,
        advanced: () => <TrigCalculator {...LEVELS['trig-calculator'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-trig-calculator/g) ?? []).length).toBe(2);
    expect(html).not.toMatch(RAW);
  });
});

describe('trig-calculator — questions pendant le labo (LabCheckpoint)', () => {
  const RAWK = /manipulation\.[a-zA-Z]/;
  const press = (lab, keys) => keys.reduce((s, kk) => TL.key(s, kk), lab);
  /** Une cellule ARRONDIE : le trait au centième, puis la bonne décision. */
  const cell = (lab, kind, angle) => {
    let s = press(lab, [kind, ...String(angle).split(''), '=']);
    const { up } = TL.roundingOf(Number(s.pending.screen.replace(',', '.')), 2);
    s = TL.decide(TL.setCut(s, 2), up ? 'up' : 'keep');
    return s;
  };
  const filled = (init) => {
    let s = TL.initLab(init);
    s = press(s, ['DRG']);
    for (const kind of ['cos', 'sin', 'tan']) s = cell(s, kind, init.angles[0]);
    return s;
  };
  const check = (id, lab, qid, k) => {
    const q = QUESTIONS[qid](lab, k);
    const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
    expect(out, `${id}.${qid}`).not.toMatch(RAWK);
    expect(out, `${id}.${qid}`).not.toContain('{{');
    expect(q.hints, `${id}.${qid}`).toHaveLength(2);
    if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${id}.${qid}`).toHaveLength(1);
    else expect(q.expected).toBeTruthy();
    return q;
  };
  const k = (key, o) => i18n.t(`lesson:manipulation.trigCalculator.${key}`, o);

  it('tableau : chaque question a un texte, deux indices, une seule bonne réponse ; la lecture vient de la cellule de l’élève', () => {
    const lab = filled({ angles: [30, 45, 60], digits: 2 });
    expect(TL.tableReady(lab)).toBe(true);
    expect(chainFor(lab, 'tbl')).toEqual(['read', 'mode', 'round', 'rule']);
    for (const qid of chainFor(lab, 'tbl')) check('tbl', lab, qid, k);
    const q = QUESTIONS.read(lab, k);
    expect(Object.values(lab.cells).map((c) => c.rounded)).toContain(q.expected);
  });

  it('angles (متقدم) : tableau sans règle, puis readAngle · key · tenth · rule', () => {
    let lab = TL.initLab({ angles: [30, 45, 60], inverse: { sin: 0.52, cos: 0.25, tan: 1.33 }, digits: 2 });
    lab = press(lab, ['DRG']);
    for (const kind of ['cos', 'sin', 'tan']) lab = cell(lab, kind, 30);
    expect(chainFor(lab, 'tbl')).toEqual(['read', 'mode', 'round']);
    lab = TL.openInverse(lab);
    for (const [kind, x] of [['sin', '0,52'], ['cos', '0,25'], ['tan', '1,33']]) {
      let s = press(lab, ['2nd', kind, ...x.split(''), '=']);
      for (const c of [2, 1, 0]) {
        const { up } = TL.roundingOf(Number(s.pending.screen.replace(',', '.')), c);
        s = TL.decide(TL.setCut(s, c), up ? 'up' : 'keep');
        if (c) s = { ...s, pending: lab.pending ?? s.pending };
        if (c) s = press({ ...s, calc: TL.initCalc('DEG') }, ['2nd', kind, ...x.split(''), '=']);
      }
      lab = s;
    }
    expect(TL.inverseReady(lab)).toBe(true);
    expect(chainFor(lab, 'inv')).toEqual(['readAngle', 'key', 'tenth', 'rule']);
    for (const qid of chainFor(lab, 'inv')) check('inv', lab, qid, k);
    expect(QUESTIONS.readAngle(lab, k).expected).toMatch(/^\d+$/);
  });
});

describe('trig-calculator — mode guidé', () => {
  it('questions actives : ni la progression ni le bouton d’indice, mais les étapes', () => {
    const out = renderToString(<TrigCalculator {...LEVELS['trig-calculator'].beginner.numbers} level="beginner" />);
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(out).toContain('data-lab-stepper');
    expect(out).toContain('data-tc-step="0"');
  });
});
