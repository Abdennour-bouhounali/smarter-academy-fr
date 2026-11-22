import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import InscribedAngle, { chainOf, QUESTIONS } from './InscribedAngle';
import * as L from '../logic/inscribedAngle';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * inscribed-angle se rend dans ses DEUX modes (l'angle de tir, le نشاط 4), seul et dans un workspace, à plat ou par
 * `numbers`, sans clé i18n brute, sans interpolation oubliée, et SANS la réponse sur le premier écran : à مبتدئ l'angle de
 * tir (60°) reste caché tant que l'élève n'a pas parié ; à متقدم la relation n'est pas écrite avant l'étape de مزيان.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const clean = (html) => {
  expect(html).not.toMatch(RAW);
  expect(html).not.toContain('{{');
  expect(html).not.toContain('undefined');
  expect(html).not.toContain('NaN');
};

describe('inscribed-angle — rendu', () => {
  it('striker (beginner): the pitch, the circle, the central angle given, the shooting angle hidden until the bet', () => {
    const html = renderToString(<InscribedAngle {...LEVELS['inscribed-angle'].beginner.numbers} />);
    expect(html).toContain('data-inscribed-angle');
    expect(html).toContain('data-mode="striker"');
    expect(html).toContain('data-world="football"');
    expect(html).toContain('data-ia-glance');
    expect(html).toContain('data-ia-circle');
    expect(html).toContain('data-ia-central="120"');
    expect(html).toContain('data-ia-angle="?"');
    expect(html).toContain('data-ia-bet-input');
    expect(html).toContain('data-ia-handle="250"');
    expect(html).toContain('data-ia-verdict="start"');
    expect(html).toContain('data-deco="football"');
    expect((html.match(/data-ia-place="/g) ?? []).length).toBe(3);
    expect(html).not.toContain('60°');
    expect(html).not.toContain('60^');
    clean(html);
  });

  it('act4 (advanced, نشاط 4): stage mezian, D on the major arc, no relation written yet', () => {
    const html = renderToString(<InscribedAngle numbers={LEVELS['inscribed-angle'].advanced.numbers} />);
    expect(html).toContain('data-mode="act4"');
    expect(html).toContain('data-stage="mezian"');
    expect(html).toContain('data-ia-central="100"');
    expect(html).toContain('data-ia-stage-card="mezian"');
    expect(html).not.toContain('data-ia-mezian-equalities');
    expect(html).not.toContain('data-ia-relation');
    expect(html).not.toContain('data-ia-formal');
    expect(html).not.toContain('data-ia-bet-input');
    clean(html);
  });

  it('inside a workspace: both levels mounted, the نشاط 4 by default, distinct SVG ids', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <InscribedAngle level="beginner" {...LEVELS['inscribed-angle'].beginner.numbers} />,
        advanced: () => <InscribedAngle level="advanced" {...LEVELS['inscribed-angle'].advanced.numbers} />,
      }} />,
    );
    expect(html).toContain('data-mode="striker"');
    expect(html).toContain('data-mode="act4"');
    const ids = [...html.matchAll(/id="([^"]+-stand)"/g)].map((x) => x[1]);
    expect(ids.length).toBe(2);
    expect(new Set(ids).size).toBe(2);
    clean(html);
  });
});

/** Toutes les étapes jouées : le pari, deux positions du grand arc et un sommet hors du cercle ; ou مزيان, هوارية, l'intérieur. */
function played(level) {
  let lab = L.init(LEVELS['inscribed-angle'][level].numbers);
  const at = (s, t, rho = 1) => L.place(L.moveTo(s, { t, rho }));
  if (lab.mode === 'striker') {
    lab = L.bet(lab, lab.inscribed);
    lab = at(lab, 250); lab = at(lab, 300); lab = at(lab, 270, 1.3);
    return lab;
  }
  lab = at(lab, L.diameterT(lab));
  lab = L.pickRelation(lab, 'double');
  lab = L.advance(lab);
  for (let t = 150; t <= 350 && !L.stageDone(lab, 'houaria'); t += 10) lab = at(lab, t);
  lab = L.advance(lab);
  return at(lab, lab.pos.t, 0.6);
}

describe('inscribed-angle — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.inscribedAngle.${key}`, o);
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : chaque question de chaque étape a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{`, () => {
      const lab = played(level);
      const options = [{ text: 'a', correct: true }, { text: 'b', why: 'w' }];
      const steps = L.stepsOf(lab);
      expect(steps.every((st) => st.reached)).toBe(true);
      steps.forEach((st, i) => {
        const chain = chainOf(lab.mode, st.id);
        expect(chain.length, st.id).toBeGreaterThanOrEqual(2);
        expect(chain.includes('rule'), st.id).toBe(i === steps.length - 1 || (lab.mode === 'striker' && st.id === 'contrast') || (lab.mode === 'act4' && st.id === 'interior'));
        for (const qid of chain) {
          const q = QUESTIONS[qid]({ lab, options, formal: 'f' }, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${st.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${st.id}.${qid}`).not.toContain('{{');
          expect(out, `${st.id}.${qid}`).not.toMatch(/\b(undefined|NaN)\b/);
          expect(q.hints, `${st.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') {
            expect(q.options.filter((o) => o.correct), `${st.id}.${qid}`).toHaveLength(1);
            if (qid !== 'rule') for (const o of q.options.filter((x) => !x.correct)) expect(o.why, `${st.id}.${qid}`).toBeTruthy();
          } else expect(q.expected).toBeTruthy();
        }
      });
    });
  }

  it('les réponses viennent des nombres de l\'élève ; les étapes s\'ouvrent dans l\'ordre ; « أعِد التجربة » ne remet que SON étape', () => {
    const b = played('beginner');
    expect(QUESTIONS.read({ lab: b }, k).expected).toBe('60');
    expect(QUESTIONS.predict({ lab: b }, k).expected).toBe('40');
    const a = played('advanced');
    expect(QUESTIONS.bad({ lab: a }, k).expected).toBe('40');
    expect(QUESTIONS.ratio({ lab: a }, k).expected).toBe('2');
    expect(QUESTIONS.same({ lab: a }, k).expected).toBe('50');
    expect(L.stepsOf(L.init(LEVELS['inscribed-angle'].advanced.numbers)).map((x) => x.reached)).toEqual([false, false, false]);
    expect(L.stepsOf(L.init(LEVELS['inscribed-angle'].beginner.numbers)).map((x) => x.reached)).toEqual([false, false]);
    const back = L.retryStep(a, 'interior');
    expect(L.stepsOf(back).map((x) => x.reached)).toEqual([true, true, false]);
    expect(back.stage).toBe('interior');
    expect(L.stepsOf(L.retryStep(a, 'mezian')).map((x) => x.reached)).toEqual([false, false, false]);
    expect(L.stepsOf(L.retryStep(b, 'contrast')).map((x) => x.reached)).toEqual([true, false]);
    expect(L.stepsOf(L.retryStep(b, 'major')).map((x) => x.reached)).toEqual([false, false]);
  });
});

describe('inscribed-angle — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('ni la progression ni le bouton d\'indice ; deux étapes (tir), trois (نشاط 4) ; questions coupées : tout revient', () => {
    const b = renderToString(<InscribedAngle {...LEVELS['inscribed-angle'].beginner.numbers} />);
    expect(b).not.toContain('data-manipulation-progress');
    expect(b).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect((b.match(/data-ia-step=/g) || []).length).toBe(2);
    const a = renderToString(<InscribedAngle numbers={LEVELS['inscribed-angle'].advanced.numbers} />);
    expect((a.match(/data-ia-step=/g) || []).length).toBe(3);
    const off = renderToString(<InscribedAngle {...LEVELS['inscribed-angle'].beginner.numbers} checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
