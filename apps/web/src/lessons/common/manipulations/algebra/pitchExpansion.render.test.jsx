import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import PitchExpansion, { CHAIN, QUESTIONS, wrongForms } from './PitchExpansion';
import * as L from '../logic/pitchExpansion';

const RAW = /manipulation\.[a-zA-Z]/;
const k = (key, o) => i18n.t(`lesson:manipulation.pitchExpansion.${key}`, o);
const EXPRS = ['3|x+5', '3x-1|3+x', 'x+3', 'x-2', 'x+3|x-3', '2x+5|2x-5', '2x-1|x+4', 'x+10+x'];

/** Un terrain « fini » : toutes les zones portées, la somme réduite, l'égalité vérifiée pour deux x. */
function finished(expr) {
  let s = L.init({ expr, simplify: true });
  s.cells.forEach((c) => { s = L.collect(s, c.id); });
  for (let guard = 0; guard < 20 && !L.isSimplified(s); guard += 1) {
    const dup = s.tray.find((a, i) => s.tray.some((b, j) => j !== i && b.term.p === a.term.p));
    const other = s.tray.find((b) => b !== dup && b.term.p === dup.term.p);
    s = L.merge(s, dup.id, other.id);
  }
  const range = L.xRange(s.factors, 5);
  s = L.verify(s, range.min); s = L.verify(s, range.min + 1);
  return s;
}

describe('pitch-expansion — questions pendant le labo (LabCheckpoint)', () => {
  for (const expr of EXPRS) {
    it(`${expr} : chaque question a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{`, () => {
      const lab = finished(expr);
      expect(L.discoveryReady(lab)).toBe(true);
      for (const qid of CHAIN) {
        const q = QUESTIONS[qid](lab, k);
        const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
        expect(out, `${expr}.${qid}`).not.toMatch(RAW);
        expect(out, `${expr}.${qid}`).not.toContain('{{');
        expect(q.hints, `${expr}.${qid}`).toHaveLength(2);
        if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${expr}.${qid}`).toHaveLength(1);
        else expect(q.expected, `${expr}.${qid}`).toBeTruthy();
      }
      expect(wrongForms(lab).length, expr).toBeGreaterThanOrEqual(2);
    });
  }

  it('les nombres viennent du terrain ; chaque mauvaise forme est réfutée par SES nombres', () => {
    const lab = finished('x+3');                       // x = 1 puis 2 : (x + 3)² = 16 pour x = 1
    expect(QUESTIONS.zones(lab, k).expected).toBe('4');
    expect(QUESTIONS.area(lab, k).expected).toBe('16');
    const wrong = wrongForms(lab);
    expect(wrong.map((w) => w.id)).toContain('cross');   // x² + 9 → 10, pas 16
    expect(wrong.find((w) => w.id === 'cross').got).toBe(10);
    expect(wrongForms(finished('3|x+5')).map((w) => w.id)).toEqual(expect.arrayContaining(['first', 'last']));
    expect(CHAIN[CHAIN.length - 1]).toBe('rule');
  });
});

describe('pitch-expansion — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('avec questions : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = renderToString(<PitchExpansion expr="x+3" />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(g).toContain('data-pe-step');
    const off = renderToString(<PitchExpansion expr="x+3" checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
