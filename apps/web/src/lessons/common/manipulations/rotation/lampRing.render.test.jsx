import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import LampRing, { chainOf, QUESTIONS } from './LampRing';
import * as L from '../logic/lampRing';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * lamp-ring se rend aux deux niveaux de levels.js (4 poteaux sur 2 m ; la وضعية, 6 poteaux sur 3 m), seul et dans un workspace,
 * sans clé i18n brute, sans interpolation oubliée, et sans la distance écrite avant que l'élève ne l'ait trouvée.
 */
const RAW = /manipulation\.[a-zA-Z]/;

describe('lamp-ring — rendu', () => {
  it('advanced (وضعية) : le jardin la nuit, six poteaux en tas, phase « à la main », lampes éteintes — la réponse nulle part', () => {
    // Les indices sont désormais affichés d'emblée (méthode générale, jamais la valeur) : la fuite se mesure hors d'eux.
    const html = renderToString(<LampRing {...LEVELS['lamp-ring'].advanced.numbers} />).replace(/<ol[^>]*data-manipulation-hints[\s\S]*?<\/ol>/, '');
    expect(html).toContain('data-lamp-ring');
    expect(html).toContain('data-world="flower-bed"');
    expect(html).toContain('data-phase="hand"');
    expect(html).toContain('data-lit=""');
    expect(html).toContain('data-lr-glance');
    expect(html).toContain('data-lr-light');
    expect(html).not.toContain('data-lr-to-rotate');
    expect((html.match(/data-lr-post="/g) ?? []).length).toBe(6);
    expect(html).toContain('data-deco="flower-bed"');
    expect(html).not.toContain('data-on="true"');
    for (const leak of ['60°', '60^\\circ', 'd = 3', '2\\sin', 'data-lr-card']) expect(html).not.toContain(leak);
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('beginner : quatre poteaux sur 2 m, aucune distance exacte écrite', () => {
    const html = renderToString(<LampRing level="beginner" {...LEVELS['lamp-ring'].beginner.numbers} />);
    expect((html.match(/data-lr-post="/g) ?? []).length).toBe(4);
    expect(html).toContain('data-r="2"');
    expect(html).not.toContain('\\sqrt{2}');
    expect(html).not.toContain('2,83');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('numbers groupés (contrat de la leçon) et workspace : deux niveaux montés, des ids SVG distincts', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <LampRing level="beginner" theme="flower-bed" numbers={LEVELS['lamp-ring'].beginner.numbers} />,
        advanced: () => <LampRing level="advanced" theme="flower-bed" numbers={LEVELS['lamp-ring'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-lamp-ring="true"/g) ?? []).length).toBe(2);
    const ids = [...html.matchAll(/ id="(lr[A-Za-z]+[^"]*)"/g)].map((m) => m[1]);
    expect(ids.length).toBe(8);
    expect(new Set(ids).size).toBe(8);
    expect(html).not.toMatch(RAW);
  });
});

/** Les trois étapes jouées : poteaux à la main (jugés), tour allumé par le دوران, carte juste. */
function played(level) {
  const { n, r } = LEVELS['lamp-ring'][level].numbers;
  let lab = L.light(L.init({ n, r }));
  lab = L.openRotate(lab);
  lab = L.moveP2(lab, lab.rot.p1 + 360 / n);
  for (let i = 0; i < n && lab.phase === 'rotate'; i += 1) lab = L.rotateOnce(lab);
  return L.pickFormula(lab, 'sin');
}

describe('lamp-ring — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.lampRing.${key}`, o);
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : chaque question de chaque étape a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{`, () => {
      const lab = played(level);
      const options = [{ text: 'a', correct: true }, { text: 'b', why: 'w' }];
      const steps = L.stepsOf(lab);
      expect(steps.every((st) => st.reached)).toBe(true);
      steps.forEach((st, i) => {
        const chain = chainOf(st.id);
        expect(chain.length, st.id).toBeGreaterThanOrEqual(2);
        expect(chain.includes('rule'), st.id).toBe(i === steps.length - 1);
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
    const a = played('advanced');
    expect(QUESTIONS.arc({ lab: a }, k).expected).toBe('60');
    expect(QUESTIONS.half({ lab: a }, k).expected).toBe('30');
    expect(QUESTIONS.times({ lab: a }, k).expected).toBe('360');
    const b = played('beginner');
    expect(QUESTIONS.arc({ lab: b }, k).expected).toBe('90');
    expect(L.stepsOf(L.init({ n: 6, r: 3 })).map((x) => x.reached)).toEqual([false, false, false]);
    expect(L.stepsOf(L.retryStep(a, 'measure')).map((x) => x.reached)).toEqual([true, true, false]);
    expect(L.stepsOf(L.retryStep(a, 'rotate')).map((x) => x.reached)).toEqual([true, false, false]);
    expect(L.retryStep(a, 'rotate').phase).toBe('rotate');
    expect(L.stepsOf(L.retryStep(a, 'hand')).map((x) => x.reached)).toEqual([false, false, false]);
  });
});

describe('lamp-ring — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('ni la progression ni le bouton d\'indice ; trois étapes ; questions coupées : tout revient', () => {
    const g = renderToString(<LampRing {...LEVELS['lamp-ring'].advanced.numbers} />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect((g.match(/data-lr-step=/g) || []).length).toBe(3);
    const off = renderToString(<LampRing {...LEVELS['lamp-ring'].advanced.numbers} checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
