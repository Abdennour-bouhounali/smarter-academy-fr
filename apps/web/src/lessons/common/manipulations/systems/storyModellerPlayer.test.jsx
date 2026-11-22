import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import StoryModeller from './StoryModeller';
import { QUESTIONS } from './StoryModellerPlayer';
import { InMissionPlayerContext } from '../../mission/missionPlayerContext';
import * as L from '../logic/storyModeller';
import * as P from '../logic/storyModellerPlayer';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le traitement du labo `story-modeller` dans le lecteur de mission (rollout 2026-11-12, unité 5 leçon 3 ; verdict L3, X7). Chaque question dit la
 * MÊME vérité que la logique, aucune clé brute ni `{{` à l'écran, les réponses changent de place ; la page (storyModeller.render.test.jsx) et la
 * synthèse (wadiya-idmajiya-jumal) restent inchangées — ici : ce que seul le lecteur montre. Les histoires sont écrites ICI (le labo est commun).
 */
const k = (key, o) => i18n.t(`lesson:manipulation.storyModeller.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.slots}{q.wrap}{q.ops}{q.tiles?.map((x, i) => <span key={i}>{typeof x === 'string' ? x : x.text}</span>)}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}</div>);
const inPlayer = (el) => renderToString(<InMissionPlayerContext.Provider value>{el}</InMissionPlayerContext.Provider>);

const COUNT = {
  system: 'x+y=12|70x+20y=440', unknowns: [{ id: 'x', noun: 'عدد أقلام التلوين', short: 'أقلام التلوين' }, { id: 'y', noun: 'عدد أقلام الرصاص', short: 'أقلام الرصاص' }],
  story: 'اشترى نادٍ 12 قلمًا بـ 70 دج و 20 دج، ودفع 440 دج.',
  facts: [{ quote: 'اشترى 12 قلمًا', kind: 'count' }, { quote: 'دفع 440 دج', kind: 'money' }],
  chips: [{ value: '12', label: 'قلمًا' }, { value: '70', label: 'دج' }, { value: '20', label: 'دج' }, { value: '440', label: 'دج' }],
  answer: { options: ['أ', 'ب', 'ج'], correct: 0 }, items: { x: { glyph: 'pencil' }, y: { glyph: 'pencil' } },
};
const MONEY = {
  system: '2x+y=230|x+2y=190', named: true, unknowns: [{ id: 'x', noun: 'ثمن الكرّاس', short: 'الكرّاس' }, { id: 'y', noun: 'ثمن القلم', short: 'القلم' }],
  story: 'قبل 8 أيام: كرّاسان وقلم بـ 230 دج، وكرّاس وقلمان بـ 190 دج.',
  facts: [{ quote: 'كرّاسان وقلم بـ 230 دج', kind: 'money' }, { quote: 'كرّاس وقلمان بـ 190 دج', kind: 'money' }],
  chips: [{ value: '2', label: 'اثنان' }, { value: '230', label: 'دج' }, { value: '190', label: 'دج' }, { value: '8', label: 'أيام', useless: true }],
  answer: { options: ['أ', 'ب', 'ج'], correct: 0 },
};
const SHIRTS = {
  system: 'x+y=15|1100x+700y=17700', named: true, countNoun: 'عدد القمصان',
  unknowns: [{ id: 'x', noun: 'عدد الطويلة', short: 'الطويلة', few: 'قمصان طويلة', many: 'قميصًا طويلًا' }, { id: 'y', noun: 'عدد القصيرة', short: 'القصيرة', few: 'قمصان قصيرة', many: 'قميصًا قصيرًا' }],
  story: 'بِيع 15 قميصًا بـ 1100 دج و 700 دج، والمداخيل 17700 دج.',
  facts: [{ quote: 'بِيع 15 قميصًا', kind: 'count' }, { quote: 'المداخيل 17700 دج', kind: 'money' }],
  chips: [{ value: '15', label: 'قميصًا' }, { value: '1100', label: 'دج' }, { value: '700', label: 'دج' }, { value: '17700', label: 'دج' }],
  answer: { options: ['أ', 'ب', 'ج'], correct: 0 },
};
const modelOf = (p) => L.parseModel(p);

/** Une manche jouée par la logique jusqu'au moment demandé (le contexte des questions). */
function reach(p, until, method = 'sub') {
  const model = modelOf(p);
  let lab = P.playerInit(model, { named: p.named, onesPlaced: true });
  if (lab.stage === 'name') { model.ids.forEach((id) => { lab = L.name(lab, id, id); }); lab = L.openModel(lab); }
  const T = L.targetSlots(model, lab.naming);
  [1, 2].forEach((r) => ['a', 'b', 'c'].forEach((s) => { lab = L.fill(lab, T[r][s], L.slotId(r, s)); }));
  lab = L.openSolve(L.checkModel(lab, model));
  lab = L.chooseMethod(lab, method);
  const plan = L.solvePlan(L.studentSystem(lab, model), model.ids, method);
  if (until === 'typed') { while (lab.revealed < plan.halfAt) lab = L.reveal(lab, plan); return { model, lab, plan }; }
  while (!L.solved(lab, plan)) { if (lab.revealed === plan.halfAt + 1) lab = L.claimHalf(lab, 'more'); lab = L.reveal(lab, plan); }
  lab = L.openVerify(lab, plan);
  model.ids.forEach((id) => { lab = L.gate(lab, lab.naming[id], L.gateId(id)); });
  lab = L.replay(lab, model, plan.values);
  if (until === 'answer' && lab.replay.ok) lab = L.openAnswer(lab);
  return { model, lab, plan };
}
const ctxOf = (p, r) => ({ k, model: r.model, def: p, lab: r.lab, plan: r.plan, sv: P.storyValues(r.lab, r.plan, r.model), seed: 3 });

describe('story-modeller in the mission player — rendering', () => {
  it('the player screen: the story always shown, live region, no page title, no stepper, no floating panel, no book table', () => {
    const html = inPlayer(<StoryModeller {...COUNT} levels={false} chains="first" onesPlaced />);
    expect(html).toContain('data-sm-story');
    expect(html).toContain('data-sm-verdict-live');
    expect(html).toContain('role="status"');
    expect(html).toContain('data-player');
    expect(html).toContain('data-coach="letters"');
    expect(html).not.toContain('data-sm-step');
    expect(html).not.toContain('data-movable-panel');
    expect(html).not.toContain('data-lab-fold');
    expect(html).not.toContain('جدول الكتاب');
    expect(html).not.toMatch(rawKey);
    // the page keeps its fold and stepper; the player is not mounted there
    const page = renderToString(<StoryModeller {...COUNT} />);
    expect(page).toContain('data-lab-fold');
    expect(page).not.toContain('data-sm-verdict-live');
  });
  it('a named story opens on the translation with the two « 1 » of the counting row already placed', () => {
    const html = inPlayer(<StoryModeller {...COUNT} named onesPlaced levels={false} />);
    expect(html).toMatch(/data-stage="model"/);
    expect(html).toContain('data-sm-reserve');
    const slot1 = [...html.matchAll(/data-sm-row="1"[\s\S]*?data-sm-row="2"/g)][0][0];
    expect((slot1.match(/>1</g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
  it('the free round offers its stories as choices, the current one pressed', () => {
    const html = inPlayer(<StoryModeller {...COUNT} named checkpoints={false} choices={[{ id: 'a', label: 'أ', props: COUNT }, { id: 'b', label: 'ب', props: MONEY }]} />);
    expect((html.match(/data-sm-choice="/g) ?? []).length).toBe(2);
    expect([...html.matchAll(/<button[^>]*data-sm-choice="([^"]+)"[^>]*>/g)].filter((m) => m[0].includes('aria-pressed="true"')).map((m) => m[1])).toEqual(['a']);
  });
});

describe('story-modeller in the mission player — the questions tell the logic\'s truth', () => {
  const check = (id, q) => {
    expect(text(q), id).not.toMatch(rawKey);
    expect(q.hints, id).toHaveLength(2);
    if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), id).toHaveLength(1);
  };
  ['sub', 'add'].forEach((m) => {
    it(`r1-like (${m}): solveTyped expects the first unknown; buildCheck has one decoy, the head count`, () => {
      const r = reach(COUNT, 'typed', m);
      const q = QUESTIONS.solveTyped(ctxOf(COUNT, r));
      check('solveTyped', q);
      expect(q.expected).toBe(L.fracText(r.plan.first.value));
      const v = reach(COUNT, 'verify', m);
      const b = QUESTIONS.buildCheck(ctxOf(COUNT, v));
      check('buildCheck', b);
      expect(b.expected).toEqual(['4', '8', '440']);
      expect(isCorrect(b, b.expected)).toBe(true);
      expect(isCorrect(b, ['4', '8', '12'])).toBe(false);
      expect(b.tiles).toContain('12');
      const a = QUESTIONS.answerWhy(ctxOf(COUNT, reach(COUNT, 'answer', m)));
      check('answerWhy', a);
    });
  });
  it('r2-like: verifySwap says both facts fail; buildAnswer is built with words, the letter is the decoy; the rule has no book table', () => {
    const r = reach(MONEY, 'answer');
    const vs = QUESTIONS.verifySwap(ctxOf(MONEY, r));
    check('verifySwap', vs);
    expect(renderToString(<div>{vs.options.find((o) => o.correct).text}</div>)).toContain(k('cp.verifySwap.both'));
    const ba = QUESTIONS.buildAnswer(ctxOf(MONEY, r));
    check('buildAnswer', ba);
    expect(ba.wideText).toBe(true);
    expect(isCorrect(ba, ['الكرّاس', 'القلم'])).toBe(true);
    expect(isCorrect(ba, ['القلم', 'الكرّاس'])).toBe(false);
    expect(isCorrect(ba, ['x', 'القلم'])).toBe(false);
    expect(text(ba)).toContain('90');
    const rule = QUESTIONS.rule(ctxOf(MONEY, r));
    check('rule', rule);
    expect(text(rule)).not.toContain('جدول الكتاب');
  });
  it('the silent chip: a translation that uses « 8 أيام » is refused with the reason unused', () => {
    const model = modelOf(MONEY);
    let lab = P.playerInit(model, { named: true });
    const T = L.targetSlots(model, lab.naming);
    [1, 2].forEach((r) => ['a', 'b', 'c'].forEach((s) => { lab = L.fill(lab, T[r][s], L.slotId(r, s)); }));
    lab = L.fill(lab, 'c3', L.slotId(1, 'c'));
    const v = P.checkPlayerModel(lab, model, P.uselessKeys(MONEY.chips));
    expect(v.verdict.ok).toBe(false);
    expect(v.verdict.rows[0].reason).toBe('unused');
    expect(k('player.reason_unused', { v: '8', label: 'أيام', n: 1 })).toContain('8');
  });
  it('p1-like: the story refuses; naturalTap picks y = −3; refuseTap keeps the sign; ruleNatural has no rounding option', () => {
    const r = reach(SHIRTS, 'verify');
    expect(P.refused(r.lab)).toBe(true);
    const n = QUESTIONS.naturalTap(ctxOf(SHIRTS, r));
    check('naturalTap', n);
    expect(renderToString(<div>{n.options.find((o) => o.correct).text}</div>)).toMatch(/-3|−3/);
    const rf = QUESTIONS.refuseTap(ctxOf(SHIRTS, r));
    check('refuseTap', rf);
    const right = renderToString(<div>{rf.options.find((o) => o.correct).text}</div>);
    expect(right).toContain('مستحيل');
    expect(text(rf)).toContain('3 قمصان قصيرة');
    expect(text(rf)).toContain('18 قميصًا طويلًا');
    const rn = QUESTIONS.ruleNatural(ctxOf(SHIRTS, r));
    check('ruleNatural', rn);
    expect(text(rn)).not.toMatch(/نقرّب|التدوير/);
  });
  it('the right option does not always sit in the same place', () => {
    const r = reach(SHIRTS, 'verify');
    const pos = [1, 2, 3, 4].map((seed) => QUESTIONS.ruleNatural({ ...ctxOf(SHIRTS, r), seed }).options.findIndex((o) => o.correct));
    expect(new Set(pos).size).toBeGreaterThan(1);
  });
  it('the words: coach and predictions have no raw key, no « $ » in a prediction prompt', () => {
    ['letter', 'toModel', 'chip', 'check', 'toSolve', 'method', 'next', 'half', 'gate', 'replay'].forEach((id) => expect(k(`coach.${id}`)).not.toMatch(rawKey));
    P.PREDICT_KEYS.forEach((id) => { expect(k(`predict.${id}`)).not.toContain('$'); expect(k(`predict.${id}`)).not.toMatch(rawKey); });
    ['modelOk', 'modelKo', 'ok', 'order', 'natural'].forEach((w) => expect(k(`player.word.${w}`, { why: 'x' })).not.toMatch(rawKey));
  });
});
