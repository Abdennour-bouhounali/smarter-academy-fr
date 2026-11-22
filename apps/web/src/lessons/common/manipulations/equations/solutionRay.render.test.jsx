import { it, expect, describe } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import SolutionRay, { CHAINS, QUESTIONS, edgeOf } from './SolutionRay';
import * as L from '../logic/solutionRay';

it('solution-ray se rend dans ses trois modes et pour des bornes entières ou fractionnaires', () => {
  const phone = renderToString(<SolutionRay ineq="2,5x+100<=150" context="phone" bracket={false} levels={false} marks={[16, 20, 21]} />);
  expect(phone).toContain('data-solution-ray');
  expect(phone).toContain('data-mode="region"');
  expect(phone).toContain('data-decor-phone');
  expect(phone).not.toContain('manipulation.solutionRay');
  for (const ineq of ['x<3', '-3x+5<=20', '5x<=3', '4x-1<=x+3', '-7x+1<x-3']) {
    const html = renderToString(<SolutionRay ineq={ineq} />);
    expect(html).toContain('data-ray-line');
    expect(html).toContain('data-ray-bracket');
    expect(html).not.toContain('manipulation.solutionRay');
  }
  expect(renderToString(<SolutionRay ineq="-3x+5<=20" transform />)).toContain('data-mode="flip"');
  expect(renderToString(<SolutionRay ineq="x<3" level="beginner" />)).toContain('data-mode="bracket"');
});

it('solution-ray s\'ouvre sur un mobile posé (jamais « x » seul) et aucune trace', () => {
  const html = renderToString(<SolutionRay ineq="-3x+5<=20" />);
  expect(html).toContain('data-ray-probe');
  expect(html).not.toContain('data-trace=');
});

const RAW = /manipulation\.[a-zA-Z]/;
const k = (key, o) => i18n.t(`lesson:manipulation.solutionRay.${key}`, o);

/** Un rayon « fini » du niveau : toutes les graduations tracées, puis (crochet / متقدم) le crochet juste et la chaîne menée jusqu'à x REL c. */
function finished(ineq, mode, whole = false) {
  let lab = L.initLab({ ineq, whole });
  for (let kk = lab.kmin; kk <= lab.kmax; kk += 1) lab = L.addTrace(lab, kk);
  if (mode === 'region') return lab;
  lab = L.placeBracket(lab, { k: L.boundK(lab), side: L.sideOf(lab.sol), toward: L.closedOf(lab.sol) });
  if (mode === 'bracket') return lab;
  for (let guard = 0; guard < 8 && !L.transformDone(lab); guard += 1) {
    const cards = L.cardsFor(L.current(lab));
    const card = cards.find((c) => L.isNegativeScaling(c)) ?? cards[0];
    lab = L.chooseStep(lab, card, L.candidates(lab, card).rel).lab;
  }
  return lab;
}

const CASES = [
  ['2,5x+100<=150', 'region', true], ['x<3', 'region'], ['-3x+5<=20', 'region'],
  ['x<3', 'bracket'], ['5x<=3', 'bracket'], ['4x-1<=x+3', 'bracket'], ['-3x+5<=20', 'bracket'],
  ['-3x+5<=20', 'flip'], ['-7x+1<x-3', 'flip'],
];

describe('solution-ray — questions pendant le labo (LabCheckpoint)', () => {
  for (const [ineq, mode, whole] of CASES) {
    it(`${mode} ${ineq} : chaque question a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{`, () => {
      const lab = finished(ineq, mode, whole);
      const ready = { region: L.regionDiscoveryReady, bracket: L.bracketDiscoveryReady, flip: L.flipDiscoveryReady }[mode](lab);
      expect(ready, `${mode} ${ineq}`).toBe(true);
      for (const qid of CHAINS[mode]) {
        const q = QUESTIONS[qid](lab, k, { mode, phone: !!whole });
        const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
        expect(out, `${mode} ${ineq}.${qid}`).not.toMatch(RAW);
        expect(out, `${mode} ${ineq}.${qid}`).not.toContain('{{');
        expect(out, `${mode} ${ineq}.${qid}`).not.toMatch(/\$/);   // aucun « $ » orphelin (un $…$ imbriqué)
        expect(q.hints, `${mode} ${ineq}.${qid}`).toHaveLength(2);
        if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${mode} ${ineq}.${qid}`).toHaveLength(1);
        else expect(q.expected, `${mode} ${ineq}.${qid}`).toBeTruthy();
      }
    });
  }

  it('les nombres viennent du rayon : 2,5x + 100 ≤ 150 se lit 20 (et 21 est refusé)', () => {
    const lab = finished('2,5x+100<=150', 'region', true);
    const g = edgeOf(lab);
    expect(g.edge).toBe(20);
    expect(g.out).toBe(21);
    const q = QUESTIONS.edge(lab, k, { mode: 'region' });
    expect(q.options.map((o) => !!o.correct)).toEqual([false, true, false]);
    expect(CHAINS.region[CHAINS.region.length - 1]).toBe('rule');
    expect(QUESTIONS.calc(lab, k, { phone: true }).kind).toBe('number');
  });
});

describe('solution-ray — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('avec questions : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = renderToString(<SolutionRay ineq="-3x+5<=20" />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(g).toContain('data-sr-step');
    const off = renderToString(<SolutionRay ineq="-3x+5<=20" checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
