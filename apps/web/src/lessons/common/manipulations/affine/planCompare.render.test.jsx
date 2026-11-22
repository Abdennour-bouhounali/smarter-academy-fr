import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import PlanCompare, { chainOf, QUESTIONS } from './PlanCompare';
import * as L from '../logic/planCompare';
import ManipulationWorkspace from '../ManipulationWorkspace';

/**
 * plan-compare se rend pour CHAQUE monde × 1, 2 et 3 formules avec les props du contrat de l'unité
 * (brief §6) — exactement celles que la leçon 5 et la synthèse passent — sans clé i18n brute.
 * La synthèse (thème « rental », jusqu'à trois formules) s'appuie sur ce test.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const THEMES = ['stadium', 'gaming', 'rental'];
const CASES = {
  1: { plans: '150x+500', mode: 'model' },
  2: { plans: '200x+2000|400x', mode: 'model|compare', ask: 'x:7|y:4800' },
  3: { plans: '300x|150x+500|2400', mode: 'compare', xMax: '16' },
};

describe('plan-compare — chaque monde × 1, 2, 3 formules', () => {
  for (const theme of THEMES) {
    for (const n of [1, 2, 3]) {
      it(`${theme} × ${n}`, () => {
        const html = renderToString(<PlanCompare {...CASES[n]} theme={theme} />);
        expect(html).toContain('data-plan-compare');
        expect(html).toContain(`data-theme="${theme}"`);
        expect(html).toContain('data-pc-glance');
        expect(html).toContain('data-pc-plane');
        expect(html).toContain('data-pc-strip');
        expect(html).toContain(`data-deco="${theme}"`);
        expect(html).not.toMatch(RAW);
        expect(html).not.toContain('{{');
        if (n === 3) {
          // comparer seul : les trois barres et les trois droites tout de suite, la marque à poser
          expect(html).toContain('data-stage="compare"');
          expect(html).toContain('data-step="mark"');
          for (const id of ['A', 'B', 'C']) {
            expect(html).toContain(`data-pc-bar="${id}"`);
            expect(html).toContain(`data-pc-line="${id}"`);
          }
          expect(html).toContain('data-pc-pin');
          expect(html).toContain('data-pc-nocross');
        } else {
          // modéliser d'abord : la facture, ses deux cases, les deux montants
          expect(html).toContain('data-stage="model"');
          expect(html).toContain('data-step="build"');
          expect(html).toContain('data-drop-zone="slot:once"');
          expect(html).toContain('data-drop-zone="slot:each"');
          expect(html).toContain('data-drag-source="chip:fixed"');
          expect(html).toContain('data-drag-source="chip:unit"');
          expect(html).toContain('data-pc-check');
          expect(html).not.toContain('data-pc-line=');
        }
      });
    }
  }
});

describe('plan-compare — ce que le contrat promet', () => {
  it('نشاط 4 : les mots du stade, les deux cibles, le budget 4800 tracé, la piste x fermée avant le modèle', () => {
    const html = renderToString(<PlanCompare {...CASES[2]} theme="stadium" />);
    expect(html).toContain('الاشتراك السنوي 2000DA');
    expect(html).toContain('دخول مقابلة 200DA');
    expect(html).toContain('عدد المقابلات x');
    expect(html).toContain('data-pc-budget="4800"');
    expect(html).toContain('data-disabled="true"');
    expect(html).toContain('f(x) = 0');
  });

  it('les mondes parlent leur langue : heures de jeu, heures de location', () => {
    expect(renderToString(<PlanCompare {...CASES[1]} theme="gaming" />)).toContain('البطاقة الشهرية 500DA');
    expect(renderToString(<PlanCompare {...CASES[1]} theme="rental" />)).toContain('الرسم الثابت 500DA');
  });

  it('dans un workspace, les deux niveaux se rendent ensemble', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <PlanCompare level="beginner" plans="150x+500" mode="model" theme="gaming" />,
        advanced: () => <PlanCompare {...CASES[2]} theme="stadium" />,
      }} />,
    );
    expect((html.match(/data-plan-compare/g) ?? []).length).toBe(2);
    expect(html).not.toMatch(RAW);
  });

  it('un contenu faux est une erreur de rendu', () => {
    expect(() => renderToString(<PlanCompare plans="200x+2000" mode="model" ask="y:4900" />)).toThrow();
    expect(() => renderToString(<PlanCompare plans="2x+1|2x+1" mode="compare" />)).toThrow();
  });
});

describe('plan-compare — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.planCompare.${key}`, o);
  const tw = (theme) => (key, o) => i18n.t(`lesson:manipulation.planCompare.themes.${theme}.${key}`, o);
  const check = (lab, step, theme = 'stadium') => {
    for (const qid of chainOf(lab, step)) {
      const q = QUESTIONS[qid](lab, k, tw(theme));
      const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
      expect(out, `${step}.${qid}`).not.toMatch(RAW);
      expect(out, `${step}.${qid}`).not.toContain('{{');
      expect(q.hints, `${step}.${qid}`).toHaveLength(2);
      if (q.kind === 'choice') {
        expect(q.options.filter((o) => o.correct), `${step}.${qid}`).toHaveLength(1);
        expect(q.options.filter((o) => !o.correct).every((o) => o.why), `${step}.${qid} why`).toBe(true);
      } else expect(q.expected, `${step}.${qid}`).toBeTruthy();
    }
  };
  const build = (lab) => { let s = L.place(lab, 'fixed', 'once'); s = L.place(s, 'unit', 'each'); return L.check(s); };
  it('model seul (مبتدئ) : build · slide, la dernière finit par la règle', () => {
    let lab = L.init({ plans: '150x+500', mode: 'model' });
    expect(L.stepsOf(lab)).toEqual(['build', 'slide']);
    expect(L.stepReached(lab, 'build')).toBe(false);
    lab = build(lab);
    expect(L.stepReached(lab, 'build')).toBe(true);
    expect(chainOf(lab, 'build')).toEqual(['atZero', 'costAt']);
    check(lab, 'build');
    expect(QUESTIONS.atZero(lab, k).expected).toBe('500');
    lab = L.commitX(L.commitX(lab, 2), 5);
    expect(L.stepReached(lab, 'slide')).toBe(true);
    expect(chainOf(lab, 'slide')).toEqual(['rate', 'rule']);
    check(lab, 'slide');
    expect(QUESTIONS.rate(lab, k).expected).toBe('150');
  });
  it('model avec cibles (متقدم) : le budget ajoute sa question', () => {
    let lab = build(L.init({ plans: '200x+2000', mode: 'model', ask: 'x:7|y:4800' }));
    lab = L.commitX(L.commitX(lab, 7), 14);
    expect(L.stepReached(lab, 'slide')).toBe(true);
    expect(chainOf(lab, 'slide')).toEqual(['rate', 'budget', 'rule']);
    check(lab, 'slide');
    expect(QUESTIONS.budget(lab, k).expected).toBe('14');
    expect(QUESTIONS.costAt(lab, k).expected).toBe('3400');
  });
  it('compare seul : mark · paint (deux et trois formules)', () => {
    for (const [plans, xMax] of [['200x+2000|400x'], ['100x|40x+600|1800', '40'], ['300x|150x+500|2400', '16']]) {
      let lab = L.init({ plans, mode: 'compare', ...(xMax ? { xMax } : {}) });
      expect(L.stepsOf(lab)).toEqual(['mark', 'paint']);
      const br = lab.env.breaks[0];
      if (br) {
        lab = L.placeMark(lab, br.x, br.y);
        for (const b of lab.env.breaks) lab = L.placeMark(lab, b.x, b.y);
      } else lab = L.claimNoCross(lab);
      expect(L.stepReached(lab, 'mark'), plans).toBe(true);
      check(lab, 'mark');
      for (const seg of lab.env.segments) { lab = L.setBrush(lab, seg.plan); lab = L.paint(lab, seg.index); }
      for (const x of [0, lab.win.xMax]) lab = L.commitX(lab, x);
      for (const seg of lab.env.segments) lab = L.commitX(lab, Math.round(Number(L.toNumber(L.witnessIn(lab, seg)))));
      expect(L.stepReached(lab, 'paint'), plans).toBe(true);
      expect(chainOf(lab, 'paint').at(-1)).toBe('rule');
      check(lab, 'paint', 'gaming');
    }
  });
  it('mode guidé : ni la progression ni le bouton d’indice, le son et l’étape 1 sont là', () => {
    const out = renderToString(<PlanCompare plans="150x+500" mode="model" theme="gaming" />);
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(out).toContain('data-manipulation-sound');
    expect(out).toContain('data-pc-step="1"');
  });
});
