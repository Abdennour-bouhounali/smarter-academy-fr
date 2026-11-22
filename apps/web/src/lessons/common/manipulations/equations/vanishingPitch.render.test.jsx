import { it, expect, describe } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import VanishingPitch, { CHAIN, QUESTIONS, wrongAreas } from './VanishingPitch';
import * as L from '../logic/vanishingPitch';
import ManipulationWorkspace from '../ManipulationWorkspace';

/**
 * Le lab de la leçon jidaa-maadum se rend pour chaque forme de produit qu'elle pose
 * (côté constant, deux facteurs, sixièmes, carré, décimaux), seul et dans un workspace
 * à deux niveaux, sans clé i18n brute.
 */
it('vanishing-pitch se rend pour chaque forme de produit', () => {
  for (const expr of ['3|x-5', 'x-2|x+5', '3x-4|-2x+1', '2x+1', '-1,2|3x+2,7', '4x|-x+1']) {
    const html = renderToString(<VanishingPitch expr={expr} />);
    expect(html).toContain('data-vanishing-pitch');
    expect(html).toContain('data-vanishing-ruler');
    expect(html).toContain('data-decor-ball');
    expect(html).not.toMatch(/manipulation\.vanishingPitch\./);
  }
  expect(renderToString(<VanishingPitch expr="3x-4|-2x+1" levels={false} />)).toContain('data-graduation="6"');
});

it('vanishing-pitch se rend dans un workspace à deux niveaux, ouvert sur متقدم', () => {
  const html = renderToString(
    <ManipulationWorkspace
      defaultLevel="advanced"
      levels={{
        beginner: () => <VanishingPitch level="beginner" expr="3|x-5" />,
        advanced: () => <VanishingPitch level="advanced" expr="x-2|x+5" />,
      }}
    />,
  );
  expect(html).toContain('data-expr="x-2|x+5"');
  expect(html).toContain('data-expr="3|x-5"');
});

it('vanishing-pitch s\'ouvre sur un x par défaut (jamais « ? ») et offre جرّب كل الإمكانيات', () => {
  const html = renderToString(<VanishingPitch expr="x-2|x+5" />);
  expect(html).not.toContain('x = ?');
  expect(html).toContain('data-vanishing-x');
  expect(html).not.toContain('data-vanishing-pin=');
});

const RAW = /manipulation\.[a-zA-Z]/;
const k = (key, o) => i18n.t(`lesson:manipulation.vanishingPitch.${key}`, o);
const EXPRS = ['3|x-5', 'x-2|x+5', '3x-4|-2x+1', '2x+1', '-1,2|3x+2,7', '4x|-x+1'];

/** Un terrain « fini » : un x refusé, tous les zéros épinglés, balayage des deux côtés, « لا حلول أخرى ». */
function finished(expr) {
  let s = L.init({ expr });
  s = L.pin(L.move(s, L.defaultV(s)));
  s.rootUnits.forEach((u) => { s = L.pin(L.move(s, u)); });
  s = L.move(L.move(s, s.range.min), s.range.max);
  return L.claimNoOther(s);
}

describe('vanishing-pitch — questions pendant le labo (LabCheckpoint)', () => {
  for (const expr of EXPRS) {
    it(`${expr} : chaque question a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{`, () => {
      const lab = finished(expr);
      expect(L.discoveryReady(lab)).toBe(true);
      for (const qid of CHAIN) {
        const q = QUESTIONS[qid](lab, k);
        const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
        expect(out, `${expr}.${qid}`).not.toMatch(RAW);
        expect(out, `${expr}.${qid}`).not.toContain('{{');
        expect(out, `${expr}.${qid}`).not.toMatch(/\$/);   // aucun « $ » orphelin (un $…$ imbriqué)
        expect(q.hints, `${expr}.${qid}`).toHaveLength(2);
        if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${expr}.${qid}`).toHaveLength(1);
        else expect(q.expected, `${expr}.${qid}`).toBeTruthy();
      }
      expect(wrongAreas(lab).length, expr).toBeGreaterThanOrEqual(2);
    });
  }

  it('les nombres viennent du terrain', () => {
    const two = finished('x-2|x+5');
    expect(QUESTIONS.count(two, k).expected).toBe('2');
    expect(QUESTIONS.count(finished('3|x-5'), k).expected).toBe('1');
    expect(QUESTIONS.count(finished('2x+1'), k).expected).toBe('1');
    expect(CHAIN[CHAIN.length - 1]).toBe('rule');
    const q = QUESTIONS.area(two, k);
    expect(q.options.map((o) => !!o.correct)).toEqual([false, true, false]);
  });
});

describe('vanishing-pitch — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('avec questions : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = renderToString(<VanishingPitch expr="x-2|x+5" />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(g).toContain('data-vp-step');
    const off = renderToString(<VanishingPitch expr="x-2|x+5" checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
