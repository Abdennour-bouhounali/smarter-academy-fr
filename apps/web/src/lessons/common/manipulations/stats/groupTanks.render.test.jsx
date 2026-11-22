import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import GroupTanks, { CHAINS, QUESTIONS } from './GroupTanks';
import * as L from '../logic/groupTanks';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * group-tanks se rend aux deux niveaux de levels.js (les deux amis du quiz ; les deux classes du تحدّ),
 * seul et dans le workspace, sans clé i18n brute ni interpolation oubliée.
 */
const RAW = /manipulation\.[a-zA-Z]/;

describe('group-tanks — rendu', () => {
  it('beginner (quiz): one class, two group tanks, the bet handle, the valve', () => {
    const html = renderToString(<GroupTanks {...LEVELS['group-tanks'].beginner.numbers} theme="quiz" />);
    expect(html).toContain('data-group-tanks');
    expect(html).toContain('data-classes="1"');
    expect(html).toContain('data-gt-glance');
    expect((html.match(/data-gt-tank="/g) ?? []).length).toBe(2);
    expect(html).toContain('data-gt-bet-handle="0"');
    expect(html).toContain('data-gt-open="0"');
    expect(html).toContain('data-deco="quiz"');
    expect(html).toContain('فريق أمين');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('advanced (تحدّ): two classes of two groups, both valves', () => {
    const html = renderToString(<GroupTanks {...LEVELS['group-tanks'].advanced.numbers} theme="school" />);
    expect(html).toContain('data-classes="2"');
    expect((html.match(/data-gt-tank="/g) ?? []).length).toBe(4);
    expect(html).toContain('data-gt-open="1"');
    expect(html).toContain('data-level="128/11"');
    expect(html).toContain('القسم (أ)');
    expect(html).toContain('ذكور (ب)');
    expect(html).not.toMatch(RAW);
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <GroupTanks level="beginner" groups="4:12|6:7" theme="quiz" />,
        advanced: () => <GroupTanks groups="15:10|18:13|14:12,5|19:11" classes="2|2" theme="school" />,
      }} />,
    );
    expect((html.match(/data-group-tanks/g) ?? []).length).toBe(2);
    expect(html).not.toMatch(RAW);
  });
});

describe('group-tanks — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.groupTanks.${key}`, o);
  const names = (many) => ({ many, gName: (i) => `G${i + 1}`, cName: (i) => (many ? ['A', 'B'][i] : 'C') });
  const check = (s, chain, ctx, label) => {
    for (const qid of chain) {
      const q = QUESTIONS[qid](s, k, ctx);
      const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
      expect(out, `${label}.${qid}`).not.toMatch(RAW);
      expect(out, `${label}.${qid}`).not.toContain('{{');
      expect(q.hints, `${label}.${qid}`).toHaveLength(2);
      if (q.kind === 'choice') {
        expect(q.options.filter((o) => o.correct), `${label}.${qid}`).toHaveLength(1);
        expect(q.options.filter((o) => !o.correct).every((o) => o.why), `${label}.${qid} why`).toBe(true);
      } else expect(q.expected).toBeTruthy();
    }
  };
  const play = (numbers, steps) => {
    let s = L.init(numbers);
    for (const f of steps) s = f(s);
    return s;
  };

  it('une classe : s1 (après la vanne) et s2 (après un effectif changé) — textes, 2 indices, une bonne réponse', () => {
    const open = (s) => L.openValve(L.setBet(s, 0, 19), 0);                 // 19 × ½ = 9,5 : le pari « moyenne des moyennes »
    const s1 = play(LEVELS['group-tanks'].beginner.numbers, [open]);
    check(s1, CHAINS.one.s1, names(false), 'one.s1');
    expect(QUESTIONS.water(s1, k, names(false)).expected).toBe('90');       // 4 × 12 + 6 × 7
    expect(QUESTIONS.count(s1, k, names(false)).expected).toBe('10');
    const s2 = L.setSize(s1, 0, 6);                                          // 6 et 6 : égaux
    check(s2, CHAINS.one.s2, names(false), 'one.s2');
    expect(QUESTIONS.move(s2, k, names(false)).options.find((o) => o.correct).text).toBeTruthy();
    check(L.setSize(s1, 0, 8), CHAINS.one.s2, names(false), 'one.s2-widest');
  });

  it('deux classes : s1 et s2 (comparaison croisée, niveaux égaux)', () => {
    const both = (s) => L.openValve(L.setBet(L.openValve(L.setBet(s, 0, 1), 0), 1, 1), 1);
    const s = play(LEVELS['group-tanks'].advanced.numbers, [both]);
    check(s, CHAINS.many.s1, names(true), 'many.s1');
    check(s, CHAINS.many.s2, names(true), 'many.s2');
    expect(QUESTIONS.water(s, k, names(true)).expected).toBe('384');
  });

  it('mode guidé : ni la progression ni « تلميح » ; deux étapes ; questions coupées : la progression revient', () => {
    const out = renderToString(<GroupTanks {...LEVELS['group-tanks'].beginner.numbers} theme="quiz" />);
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect((out.match(/data-gt-step=/g) ?? []).length).toBe(2);
    const off = renderToString(<GroupTanks {...LEVELS['group-tanks'].beginner.numbers} theme="quiz" checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
  });
});
