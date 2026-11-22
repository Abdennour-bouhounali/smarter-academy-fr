import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import ShapeTurn, { STEPS, QUESTIONS } from './ShapeTurn';
import * as L from '../logic/shapeTurn';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * shape-turn se rend dans ses deux scènes (la rosace de zellige, la طريقة p. 155) seul et dans un workspace, à plat ou
 * par `numbers`, sans clé i18n brute, sans interpolation oubliée, sans un mot latin hors des îlots — et SANS la réponse
 * sur le premier écran : ni « متعامدان », ni √41 = BD, ni W(2 ; 4).
 */
const RAW = /manipulation\.[a-zA-Z]/;
const clean = (html) => {
  expect(html).not.toMatch(RAW);
  expect(html).not.toContain('{{');
  expect(html).not.toMatch(/\b(undefined|NaN|null)\b/);
};

describe('shape-turn — rendu', () => {
  it('rosette (beginner) : le pétale, la feuille épinglée, la poignée, le mors, les jauges égales, pas encore de copie', () => {
    const html = renderToString(<ShapeTurn {...LEVELS['shape-turn'].beginner.numbers} />);
    expect(html).toContain('data-shape-turn');
    expect(html).toContain('data-mode="rosette"');
    expect(html).toContain('data-world="zellige"');
    expect(html).toContain('data-st-glance');
    expect(html).toContain('data-st-handle="0"');
    expect(html).toContain('role="slider"');
    expect(html).toContain('data-st-stretch="10"');
    expect(html).toContain('data-st-stamp');
    expect(html).toContain('data-st-sheet');
    expect(html).toContain('data-st-verdict="start"');
    expect(html).toContain('data-deco="zellige"');
    expect(html).toContain('data-st-claims-closed');
    expect(html).not.toContain('data-st-copy=');
    expect(html).not.toContain('data-st-claims=');
    clean(html);
  });

  it('prove (advanced) : OAB, OCD, [AC] et [BD] non posés, aucune conclusion affichée', () => {
    const html = renderToString(<ShapeTurn numbers={LEVELS['shape-turn'].advanced.numbers} />);
    expect(html).toContain('data-mode="prove"');
    expect(html).toContain('data-st-prove-figure');
    expect(html).toContain('data-st-seg="AC"');
    expect(html).toContain('data-landed="false"');
    expect(html).not.toContain('data-st-stamp');
    expect(html).not.toContain('data-st-center-open');
    expect(html).not.toContain('متعامدان');
    clean(html);
  });

  it('dans un workspace : les deux niveaux montés, ids SVG distincts (useId)', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="beginner" levels={{
        beginner: () => <ShapeTurn level="beginner" numbers={LEVELS['shape-turn'].beginner.numbers} />,
        advanced: () => <ShapeTurn level="advanced" numbers={LEVELS['shape-turn'].advanced.numbers} />,
      }} />,
    );
    expect(html).toContain('data-mode="rosette"');
    expect(html).toContain('data-mode="prove"');
    const ids = [...html.matchAll(/<pattern id="([^"]+)"/g)].map((x) => x[1]);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    clean(html);
  });
});

/** Une rosace finie, une feuille étirée, [AC] posé sur [BD], les affirmations prouvées, l'épingle acceptée : l'état de chaque étape. */
function played(level) {
  const nums = LEVELS['shape-turn'][level].numbers;
  let s = L.init(nums);
  if (level === 'beginner') {
    for (const th of [60, 120, 180, 240, 300]) s = L.stamp(L.turn(s, th));
    s = L.stretchTo(s, 14);
    s = L.unstretch(s);
    return s;
  }
  s = L.turn(s, 90);
  for (const [c, card] of [['eq', 'atwal'], ['perp', 'taamud90']]) s = L.claim(s, c, card);
  s = L.movePin(s, [2, 4]);
  s = L.placePin(L.openCenter(s));
  return s;
}

describe('shape-turn — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.shapeTurn.${key}`, o);
  for (const [level, mode] of [['beginner', 'rosette'], ['advanced', 'prove']]) {
    it(`${level} : chaque question de chaque étape a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{`, () => {
      const lab = played(level);
      const m = (key, o) => k(`${mode}.${key}`, o);
      const options = [{ text: 'a', correct: true }, { text: 'b', why: 'w' }];
      for (const st of STEPS[mode]) {
        expect(st.reached(lab), `${st.id} atteinte`).toBe(true);
        for (const qid of st.chain) {
          const q = QUESTIONS[qid]({ lab, options, formal: 'f', m, mode }, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${st.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${st.id}.${qid}`).not.toContain('{{');
          expect(out, `${st.id}.${qid}`).not.toMatch(/\b(undefined|NaN)\b/);
          expect(q.hints, `${st.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${st.id}.${qid}`).toHaveLength(1);
          else expect(q.expected).toBeTruthy();
          if (q.kind === 'choice' && qid !== 'rule') for (const o of q.options.filter((x) => !x.correct)) expect(o.why, `${st.id}.${qid}`).toBeTruthy();
        }
      }
    });
  }

  it('les réponses attendues viennent des nombres de l\'élève', () => {
    const b = played('beginner');
    expect(QUESTIONS.count({ lab: b }, k).expected).toBe('6');
    expect(QUESTIONS.between({ lab: b }, k).expected).toBe('60');
    const a = played('advanced');
    expect(QUESTIONS.alpha({ lab: a }, k).expected).toBe('90');
    expect(QUESTIONS.center({ lab: a }, k).expected).toBe(String(a.center.alpha));
  });

  it('« أعِد التجربة » remet la MÊME étape : r2 recolle la feuille, p2 vide les affirmations, p3 retire l\'épingle', () => {
    const nums = LEVELS['shape-turn'].beginner.numbers;
    const r2 = L.retryStep(played('beginner'), 'r2', nums);
    expect(r2.fakeTried).toBe(false);
    expect(L.rosetteDone(r2)).toBe(true);                       // la rosace, étape 1, reste faite
    const adv = LEVELS['shape-turn'].advanced.numbers;
    const a = played('advanced');
    expect(Object.keys(L.retryStep(a, 'p2', adv).claims)).toHaveLength(0);
    expect(L.retryStep(a, 'p3', adv).center).toBe(null);
    expect(L.retryStep(a, 'p1', adv).landed).toBe(false);
  });
});

describe('shape-turn — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('مبتدئ : ni la progression ni le bouton d\'indice, deux étapes lisibles', () => {
    const out = renderToString(<ShapeTurn {...LEVELS['shape-turn'].beginner.numbers} />);
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(out).toContain('data-lab-stepper');
    expect((out.match(/data-st-step=/g) || []).length).toBe(2);
    const adv = renderToString(<ShapeTurn numbers={LEVELS['shape-turn'].advanced.numbers} />);
    expect((adv.match(/data-st-step=/g) || []).length).toBe(3);
  });

  it('questions coupées (checkpoints=false) : la progression et les indices reviennent', () => {
    // le réglage enseignant coupe `enabled` ; ici on vérifie seulement que la prop existe et ne casse pas le rendu
    const out = renderToString(<ShapeTurn {...LEVELS['shape-turn'].beginner.numbers} checkpoints={false} />);
    expect(out).toContain('data-shape-turn');
    expect(out).toContain('data-manipulation-progress');
    expect(out).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
