import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import strings from '../../../../i18n/locales/ar/lesson.manipulation.json';
import ParallelLevel, { CHAINS_PLAYER, QUESTIONS, chainsOfPlayer } from './ParallelLevel';
import { InMissionPlayerContext } from '../../mission/missionPlayerContext';
import * as L from '../logic/parallelLevel';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le traitement v2 du labo `parallel-level` dans le lecteur de mission (rollout 2026-11-10, unité 9 leçon 2 ; conseil du 2026-11-10, L2.1–L2.7).
 * Chaque question dit la MÊME vérité que la logique (converse), aucune clé brute ni `{{` à l'écran, les réponses changent de place ; la page
 * (parallelLevel.render.test.jsx) reste inchangée — ici : ce que seul le lecteur montre.
 */
const t = (key, o) => i18n.t(`lesson:${key}`, o);
const k = (key, o) => t(`manipulation.parallelLevel.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f, i) => <span key={i}>{f.label}{f.options.map((o) => (f.render ? f.render(o) : o))}</span>)}{q.slots}{q.ops}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}</div>);
/** Un essai du lecteur : poser B′ et C′ (sans essai), puis « ضع الميزان » (un essai). */
const press = (lab, bp, cp) => L.commit(L.move(L.move(lab, 'B', L.slotOf(bp)), 'C', L.slotOf(cp)), 'B', null);
const inPlayer = (el) => renderToString(<InMissionPlayerContext.Provider value>{el}</InMissionPlayerContext.Provider>);

describe('parallel-level in the mission player — rendering', () => {
  it('the bubble is HIDDEN until « ضع الميزان »; the press button and the coach exist only in the player', () => {
    const html = inPlayer(<ParallelLevel AB={3} AC={6} mode="ladder" levels={false} ratios="hide" chains="ladder" />);
    expect(html).toContain('data-pl-press');
    expect(html).toContain('data-revealed="false"');
    expect(html).toContain('data-pl-bubble-hidden');
    expect(html).not.toContain('data-pl-ratios');           // round 1: the question asks the ratios
    expect(html).not.toContain('data-lab-stepper');          // no stepper, no party in the player
    expect(html).not.toMatch(rawKey);
    const page = renderToString(<ParallelLevel AB={3} AC={6} mode="ladder" />);
    expect(page).not.toContain('data-pl-press');
    expect(page).not.toContain('data-pl-bubble-hidden');
    expect(page).toContain('data-pl-ratios');
  });

  it('rounds 2+: the two ratio chips are picked BEFORE the bubble; the press is disabled until both are right', () => {
    const html = inPlayer(<ParallelLevel AB={9} AC={12} ratio="1/3" mode="crossing" levels={false} ratios="pick" chains="side" />);
    expect(html).toContain('data-pl-picks');
    expect((html.match(/data-pl-chip="/g) ?? []).length).toBe(6);
    expect(html).toMatch(/data-pl-press[^>]*disabled|disabled[^>]*data-pl-press/);
    expect(html).not.toMatch(rawKey);
  });

  it('the free round offers bar pairs as choices', () => {
    const html = inPlayer(<ParallelLevel AB={6} AC={9} mode="crossing" levels={false} ratios="show" checkpoints={false} choices={[[6, 9], [4, 8], [12, 18], [14, 21]]} />);
    expect((html.match(/data-pl-choice="/g) ?? []).length).toBe(4);
    expect(html).toContain('aria-pressed="true"');
  });
});

describe('parallel-level in the mission player — trials and verdicts', () => {
  it('a trial is ONE press: moving records nothing, the same position twice is one trial', () => {
    const s = L.init({ AB: 3, AC: 6 });
    const moved = L.move(L.move(s, 'B', L.slotOf(1)), 'C', L.slotOf(2));
    expect(moved.trials).toHaveLength(0);
    const one = L.commit(moved, 'B', null);
    expect(one.trials).toHaveLength(1);
    expect(L.commit(one, 'B', null).trials).toHaveLength(1);
    expect(L.verdictOf(one, one.trials[0])).toEqual({ groups: 1, exact: true });
  });

  it('the player discovery of the ladder is two level planks of DIFFERENT ratios (1/3 then 2/3)', () => {
    let s = press(L.init({ AB: 3, AC: 6 }), 1, 2);
    expect(L.playerDiscovery(s)).toBe(false);
    s = press(s, 2, 4);
    expect(L.levelRatios(s)).toEqual(['1/3', '2/3']);
    expect(L.playerDiscovery(s)).toBe(true);
  });
});

describe('parallel-level in the mission player — the question chains', () => {
  it('chains: ladder (lv, then the build and the rule), side, cross (beyond, then order and the rule), none', () => {
    expect(CHAINS_PLAYER.ladder.map((c) => [c.id, c.qs])).toEqual([['lv', ['lvFill']], ['rule', ['ratioBuild', 'rule']]]);
    expect(chainsOfPlayer('ladderEasy').map((c) => c.id)).toEqual(['lv']);
    expect(chainsOfPlayer('side').map((c) => c.qs)).toEqual([['crSide']]);
    expect(chainsOfPlayer('cross').map((c) => c.id)).toEqual(['beyond', 'order']);
    expect(chainsOfPlayer('none')).toEqual([]);
    expect(chainsOfPlayer('nope')).toEqual([]);
  });

  it('round 1 (3 / 6): « lv » asks the two ratios of the first level plank — the right chip is the truth', () => {
    const s = press(L.init({ AB: 3, AC: 6 }), 1, 2);
    expect(CHAINS_PLAYER.ladder[0].reached(s)).toBe(true);
    const q = QUESTIONS.lvFill(s, 'lv', k);
    expect(q.fields.map((f) => f.expected)).toEqual(['1/3', '1/3']);
    expect([...q.fields[0].options].sort()).toEqual(['1/2', '1/3', '3']);     // AB′/BB′ = 1/2, the inverse 3
    expect(isCorrect(q, ['1/3', '1/3'])).toBe(true);
    expect(isCorrect(q, ['1/2', '1/3'])).toBe(false);
    expect(text(q)).not.toMatch(rawKey);
    // the other level plank first: 2/3, AB′/BB′ = 2, the inverse 3/2
    const s2 = press(L.init({ AB: 3, AC: 6 }), 2, 4);
    expect([...QUESTIONS.lvFill(s2, 'lv', k).fields[0].options].sort()).toEqual(['2', '2/3', '3/2']);
  });

  it('round 1: the BUILD keeps AB′/AB on the left, the decoy CC′; the swapped equality is accepted (shared `accept`)', () => {
    const s = press(press(L.init({ AB: 3, AC: 6 }), 1, 2), 2, 4);
    const q = QUESTIONS.ratioBuild(s, 'rule', k);
    expect(q.preset).toEqual(["AB′", 'AB', null, null]);
    expect(q.tiles.slice(0, 2)).toEqual(["AB′", 'AB']);
    expect([...q.tiles.slice(2)].sort()).toEqual(['AC', "AC′", "CC′"].sort());
    expect(isCorrect(q, ["AB′", 'AB', "AC′", 'AC'])).toBe(true);
    expect(isCorrect(q, ["AC′", 'AC', "AB′", 'AB'])).toBe(true);
    expect(isCorrect(q, ["AB′", 'AB', "AC′", "CC′"])).toBe(false);
    expect(isCorrect(q, ["AB′", 'AB', 'AC', "AC′"])).toBe(false);
    const rule = QUESTIONS.rule(s, 'rule', k);
    expect(rule.options.filter((o) => o.correct)).toHaveLength(1);
    [q, rule].forEach((x) => expect(text(x)).not.toMatch(rawKey));
  });

  it('the decoy tile turns with the numbers (never always at the same place)', () => {
    const pos = [[3, 6], [4, 6], [3, 9], [2, 4]].map(([b, c]) => {
      const s = L.init({ AB: b, AC: c });
      return QUESTIONS.ratioBuild(s, 'rule', k).tiles.indexOf("CC′");
    });
    expect(new Set(pos).size).toBeGreaterThan(1);
  });

  it('round 2 (9 / 12 at 1/3): figures 1 and 2 open « side »; crSide says what they share', () => {
    let s = L.init({ AB: 9, AC: 12, ratio: '1/3', mode: 'crossing' });
    s = press(s, 3, 4);
    expect(CHAINS_PLAYER.side[0].reached(s)).toBe(false);
    s = press(s, -3, -4);
    expect(CHAINS_PLAYER.side[0].reached(s)).toBe(true);
    const q = QUESTIONS.crSide(s, 'side', k);
    expect(q.options.filter((o) => o.correct)).toHaveLength(1);
    expect(text(q)).not.toMatch(rawKey);
  });

  it('round 3 (8 / 12, no ratio): « beyond » — the ratios of a plank past A are POSITIVE; « order » — which point is between', () => {
    let s = L.init({ AB: 8, AC: 12, mode: 'crossing' });
    s = press(s, -2, -3);
    expect(CHAINS_PLAYER.cross[0].reached(s)).toBe(true);
    const b = QUESTIONS.beyondFill(s, 'beyond', k);
    expect(b.fields.map((f) => f.expected)).toEqual(['1/4', '1/4']);
    expect([...b.fields[0].options].sort()).toEqual(['1/4', '4', '−1/4'].sort());
    expect(isCorrect(b, ['1/4', '1/4'])).toBe(true);
    expect(isCorrect(b, ['−1/4', '1/4'])).toBe(false);
    s = press(s, 4, 6);
    expect(CHAINS_PLAYER.cross[1].reached(s)).toBe(false);
    s = press(s, 2, -3);   // equal ratios, opposite sides: refused by the bubble
    expect(s.trials.at(-1)).toMatchObject({ kind: 'order', figure: '3', parallel: false });
    expect(CHAINS_PLAYER.cross[1].reached(s)).toBe(true);
    const o = QUESTIONS.orderFill(s, 'order', k);
    expect(o.fields.map((f) => f.expected)).toEqual(["B′", 'A']);   // on (d) B′ is between A and B; on (d′) A is between C′ and C
    expect(isCorrect(o, ["B′", 'A'])).toBe(true);
    expect(isCorrect(o, ['A', 'A'])).toBe(false);
    [b, o, QUESTIONS.rule(s, 'order', k)].forEach((q) => expect(text(q)).not.toMatch(rawKey));
    // the mirror figure 3m: on (d) A is between, on (d′) C′ is
    const m = press(L.init({ AB: 8, AC: 12, mode: 'crossing' }), -2, 3);
    expect(QUESTIONS.orderFill(m, 'order', k).fields.map((f) => f.expected)).toEqual(['A', "C′"]);
  });

  it('every right chip of the lab is the truth of converse, at every position of every round', () => {
    for (const p of [{ AB: 3, AC: 6 }, { AB: 2, AC: 4 }, { AB: 9, AC: 12, ratio: '1/3', mode: 'crossing' }, { AB: 8, AC: 12, mode: 'crossing' }, { AB: 12, AC: 16, mode: 'crossing' }]) {
      const lab = L.init(p);
      for (let sb = lab.rangeB.min; sb <= lab.rangeB.max; sb += 1) {
        const at = { bp: L.abscissaOf(sb), cp: lab.c };
        const right = L.chipOptions(lab, 'B', at).find((o) => o.right).text;
        expect(right).toBe(L.ratioTex(at.bp, lab.b).split('= ').at(-1).replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, '$1/$2'));
      }
    }
  });
});

describe('parallel-level in the mission player — strings', () => {
  it('every new string exists in Arabic, none interpolates `ns`, none starts a sentence with a raw key', () => {
    expect(JSON.stringify(strings.parallelLevel)).not.toContain('{{ns}}');
    ['press', 'waitingPress', 'waitingPick', 'cueRight', 'cueWrong', 'journal', 'colBubble', 'rowLevel', 'rowTilted', 'journalBeyond', 'choicesLabel',
      'pickB', 'pickC', 'pickWhy.inverse', 'pickWhy.rest', 'pickWhy.other', 'pickWhy.near', 'vp_level', 'vp_tilted', 'vp_figureFree', 'vp_orderFree',
      'predict.yes', 'predict.no', 'predict.wrong', 'coach.dragB', 'coach.dragC', 'coach.pick', 'coach.press', 'coach.ratios', 'coach.journal',
      'cp.ratioBuild.slotPart', 'cp.ratioBuild.slotWhole', 'cp.orderFill.onD', 'cp.orderFill.onD2']
      .forEach((key) => expect(k(key), key).not.toMatch(rawKey));
    expect(k('predict.prompt', { db: 3, dc: 6, sideB: 'x', sideC: 'y' })).toContain('6');
    expect(k('vp_figure', { n: 2 })).not.toMatch(rawKey);
    expect(k('vp_order', { n: 3 })).not.toMatch(rawKey);
    expect(k('vp_condition', { target: '\\tfrac{1}{3}' })).not.toMatch(rawKey);
    expect(k('choiceAria', { b: 4, c: 8 })).toContain('8');
  });
  it('a PredictTray prompt holds no `$` (unit-2 trap); one formula at most per player verdict', () => {
    expect(strings.parallelLevel.predict.prompt).not.toContain('$');
    Object.entries(strings.parallelLevel).filter(([key]) => key.startsWith('vp_')).forEach(([key, v]) => expect((v.match(/\$/g) ?? []).length, key).toBeLessThanOrEqual(2));
  });
});
