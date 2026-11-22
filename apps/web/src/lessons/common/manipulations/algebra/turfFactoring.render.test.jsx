import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import TurfFactoring, { chainOf, QUESTIONS, wrongFactors, cpId } from './TurfFactoring';
import * as L from '../logic/turfFactoring';

const RAW = /manipulation\.[a-zA-Z]/;
const k = (key, o) => i18n.t(`lesson:manipulation.turfFactoring.${key}`, o);

function rowsDone(expr) {
  let s = L.initRows({ expr });
  const g = L.rowsGcd(s);
  const bad = Array.from({ length: L.rowsRange(s).max }, (_, i) => i + 1).find((r) => !L.rowsLayout(s, r).valid);
  s = L.setRows(s, bad); s = L.setRows(s, g);
  return s;
}
function squareDone(b, c) {
  let s = L.initSquare({ b, c });
  if (b === 0) return L.close(s);
  for (let i = 0; i < 2; i += 1) s = L.place(s, 'stock', 'right');
  for (let i = 0; i < 4; i += 1) s = L.place(s, 'stock', 'bottom');
  s = L.close(s);                                                     // 2 | 4 : le coin exige 8 pour 9 carreaux, refusé
  s = L.place(s, 'bottom', 'right');                                  // 3 | 3
  return L.close(s);
}

describe('turf-factoring — questions pendant le labo (LabCheckpoint)', () => {
  const scenes = [
    ['rows 9x+3', rowsDone('9x+3'), 'rows', false], ['rows 6x^2+4x', rowsDone('6x^2+4x'), 'rows', false], ['rows 7x-21', rowsDone('7x-21'), 'rows', false],
    ['square 6|9', squareDone(6, 9), 'square', false], ['square 0|25', squareDone(0, 25), 'square', true],
  ];
  for (const [name, lab, mode, none] of scenes) {
    it(`${name} : prêt, chaque question a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{`, () => {
      const ready = mode === 'rows' ? L.rowsDiscoveryReady(lab) : L.squareDiscoveryReady(lab);
      expect(ready, name).toBe(true);
      const chain = chainOf(mode, none);
      expect(chain[chain.length - 1]).toBe('rule');
      for (const qid of chain) {
        const q = QUESTIONS[qid](lab, k);
        const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
        expect(out, `${name}.${qid}`).not.toMatch(RAW);
        expect(out, `${name}.${qid}`).not.toContain('{{');
        expect(q.hints, `${name}.${qid}`).toHaveLength(2);
        if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${name}.${qid}`).toHaveLength(1);
        else expect(q.expected, `${name}.${qid}`).toBeTruthy();
      }
    });
  }
  it('les nombres viennent de la scène ; les mauvaises écritures sont de vraies erreurs', () => {
    const r1 = rowsDone('9x+3');
    expect(QUESTIONS.best(r1, k).expected).toBe('3');
    expect(wrongFactors(r1).map((w) => w.id)).toEqual(expect.arrayContaining(['lost', 'forgot']));
    expect(wrongFactors(r1).find((w) => w.id === 'lost').expanded).toBe('9x');
    const r2 = rowsDone('6x^2+4x');
    expect(QUESTIONS.best(r2, k).expected).toBe('2');
    expect(wrongFactors(r2).map((w) => w.id)).toEqual(expect.arrayContaining(['forgot', 'partial']));
    expect(wrongFactors(rowsDone('7x-21')).length).toBeGreaterThanOrEqual(2);
    expect(QUESTIONS.half(squareDone(6, 9), k).expected).toBe('3');
    expect(QUESTIONS.outside(squareDone(0, 25), k).expected).toBe('25');
    expect(cpId('rows', { expr: '9x+3' })).toBe('rows:9x+3');
  });
});

describe('turf-factoring — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('avec questions : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = renderToString(<TurfFactoring mode="rows" expr="9x+3" />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(g).toContain('data-tf-step');
    const off = renderToString(<TurfFactoring mode="rows" expr="9x+3" checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
