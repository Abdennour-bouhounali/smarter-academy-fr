import { describe, it, expect } from 'vitest';
import { PROBLEMS } from './problems.js';
import { textViolations, violations } from './forbidden.js';
import { LESSON_KNOWLEDGE } from '../knowledge.jsx';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph.js';
import { LESSON_CONFIG } from '../lesson.config.js';
import { M7_ROUNDS, TRIP, TRIP_EASY, PARTY, PARTY_EASY, FREE } from './rounds.js';
import { PEER_SHEET, PEER_KID } from './peerSheet.js';
import { PREP_LADDER, PREP_SYSTEMS } from './prep.js';
import { canonSystem, solutionOf } from '../../_unit/forbiddenShared.js';
import * as L from '../../../../../../common/manipulations/logic/storyModeller.js';
import * as P from '../../../../../../common/manipulations/logic/storyModellerPlayer.js';
import { emptyLog, logEvent, roundWon, starsFor, easierProps } from '../../../../../../common/manipulations/rounds/roundsModel.js';
import module7Src from '../modules/Module07AlWadiya.jsx?raw';
import { visibleLines } from '../../_unit/forbiddenShared.js';

const knowledgeOf = import.meta.glob('../../*/knowledge.jsx', { eager: true });
const signatures = import.meta.glob('../../_unit/signatures/*.js', { eager: true });
const peerSheets = import.meta.glob('../../../../../../**/content/peerSheet.js', { eager: true });

/**
 * La synthèse de l'unité 5 dans le lecteur de mission (2026-11-12, recette PROVISOIRE de la synthèse) — LE BALAYAGE PAR RÔLE, écrit AVANT la
 * conversion : tout ce qu'un écran avant le module 7 ou le défi 🏆 peut montrer, contre la signature du défi (module 8, jamais retouché) et la
 * situation de l'unité (module 7) : content/forbidden.js.
 */
const json = (x) => JSON.stringify(x).replace(/\\\\/g, '\\');
const cardText = (item) => json({ title: item.title, summary: item.summary, memo: item.memo, body: item.body });
/** Une étape tapée qui TROUVE un prix en dinars (unité « دج ») — le rôle des deux prix du défi. */
const foundPrices = (p) => p.parts.flatMap((part) => part.steps).filter((s) => s.kind === 'numeric' && (s.unit === 'دج' || s.suffix === 'دج')).map((s) => s.expected);

describe('the synthesis — role scan of every screen before its time', () => {
  it('the six trainings never show the challenge (module 8) nor the unit situation (module 7)', () => {
    PROBLEMS.forEach((p) => expect(textViolations(json(p), p.id)).toEqual([]));
  });
  it('no training FINDS a price of the challenge (25 دج or 50 دج)', () => {
    PROBLEMS.forEach((p) => foundPrices(p).forEach((v) => expect([25, 50], `${p.id}: ${v} دج`).not.toContain(v)));
  });
  it('the memo cards (open from the first screen) never hold the situation nor the challenge\'s answer', () => {
    const items = Object.values(LESSON_KNOWLEDGE.modules).flat();
    items.forEach((item) => expect(textViolations(cardText(item), item.id)).toEqual([]));
  });
  it('the knowledge map (open from the first screen) never shows them either', () => {
    KNOWLEDGE_GRAPH.nodes.forEach((node) => expect(textViolations(json(node), node.id)).toEqual([]));
  });
  it('the role scan catches what it must (negative controls)', () => {
    ['$150x + 150y = 11250$', '$24x + 30y = 2100$', '$x + y = 75$', '$y = 75 - x$', '$6x = 150$', '$(25 ; 50)$', 'سعر علبة العصير 25 دج',
      'سعر قطعة الحلوى 50 دج', '11 250 DA', '2 100 DA', 'بقيت 24 علبة عصير', '$37{,}5$', '$11{,}250$', '$11\\,250$', '$x = 25$', '$y = 50$', '$150 = 6x$', '$30 \\times 75 = 2250$']
      .forEach((s) => expect(textViolations(s).length, s).toBeGreaterThan(0));
    ['$x + y = 55$', '$10x + 10y = 550$', '$(35 ; 20)$', 'ثمن العلم 50 دج', '$x + y = 750$', '$x + y = 50$', '$3y = 50$', '$x = 50 - 10$', '$2150$', '$y = 175 - x$']
      .forEach((s) => expect(textViolations(s), s).toEqual([]));
    // module 7 may show the situation, never its solution
    expect(textViolations('$x + y = 75$', 'm7', { before7: false })).toEqual([]);
    expect(textViolations('$(25 ; 50)$', 'm7', { before7: false }).length).toBeGreaterThan(0);
    expect(violations([{ role: 'solution', v: '50' }, { role: 'chip', v: '150' }, { role: 'line', v: 'y = 75 - x' }, { role: 'check', v: '2100' }, { role: 'decoy', v: '75' }])).toHaveLength(5);
    expect(violations([{ role: 'solution', v: '35' }, { role: 'chip', v: '120' }, { role: 'line', v: 'y = 175 - x' }, { role: 'story', v: '30' }])).toEqual([]);
  });
});

/* ── les manches du module 7 : chaque écran balayé, chaque manche jouée jusqu'à son but ── */
const modelOf = (p) => L.parseModel({ system: p.system, unknowns: p.unknowns, facts: p.facts, chips: p.chips });
const sol = (p) => { const m = modelOf(p); return [L.fracText(m.sol.x), L.fracText(m.sol.y)]; };
const ALL = M7_ROUNDS.flatMap((r) => [{ id: r.id, round: r, props: r.props }, ...(r.easier ? [{ id: `${r.id}-easy`, round: r.easier, props: easierProps(r) }] : [])]);

/** Jouer une manche jusqu'à son but avec la logique seule (comme mushkilat-jumla › stories.test.js). */
function play(round, props, method = 'sub') {
  const model = modelOf(props);
  const mode = props.chains;
  let lab = P.playerInit(model, { named: props.named, onesPlaced: props.onesPlaced });
  let log = emptyLog();
  const done = [];
  if (lab.stage === 'name') { model.ids.forEach((id) => { lab = L.name(lab, id, id); }); lab = L.openModel(lab); }
  const T = L.targetSlots(model, lab.naming);
  [1, 2].forEach((r) => ['a', 'b', 'c'].forEach((s) => { lab = L.fill(lab, T[r][s], L.slotId(r, s)); }));
  lab = P.checkPlayerModel(lab, model, P.uselessKeys(props.chips));
  log = logEvent(log, 'trial', { tk: 'model', ok: lab.verdict.ok, key: P.modelKey(lab) });
  lab = L.openSolve(lab);
  lab = L.chooseMethod(lab, method);
  const plan = L.solvePlan(L.studentSystem(lab, model), model.ids, method);
  const ask = () => {
    let sp;
    // eslint-disable-next-line no-cond-assign
    while ((sp = P.pendingSpec(mode, lab, { plan }, done))) { done.push(sp.id); log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: sp.id }); }
  };
  for (let guard = 0; guard < 20 && !L.solved(lab, plan); guard += 1) {
    ask();
    if (lab.revealed === plan.halfAt + 1 && lab.half !== 'more') lab = L.claimHalf(lab, 'more');
    lab = L.reveal(lab, plan);
  }
  lab = L.openVerify(lab, plan);
  model.ids.forEach((id) => { lab = L.gate(lab, lab.naming[id], L.gateId(id)); });
  lab = L.replay(lab, model, plan.values);
  log = logEvent(log, 'verdict', { groups: 0, exact: P.trialExact(lab.replay) });
  ask();
  if (lab.replay.ok) {
    lab = L.openAnswer(lab);
    ask();
    if (!P.chainsOf(mode).answerBuild) { lab = L.chooseAnswer(lab, props.answer.correct, props.answer.correct); ask(); }
  }
  if (P.discovered(lab)) log = logEvent(log, 'trial', { tk: 'discovered' });
  return { lab, log, plan, won: roundWon(round, log), stars: starsFor(round, log) };
}

describe('module 7 « وضعية الوحدة » — the rounds', () => {
  it('two required rounds (r1 by hand, r2 the big party), their practice rounds RELEASE them, then the free lab; no ⭐', () => {
    expect(M7_ROUNDS.map((r) => r.id)).toEqual(['r1', 'r2', 'free']);
    expect(M7_ROUNDS.filter((r) => r.easier).every((r) => r.easier.releases)).toBe(true);
    expect(M7_ROUNDS.filter((r) => !r.free).every((r) => !r.optional)).toBe(true);
    expect(FREE.map((c) => c.id)).toEqual(['r1', 'r2']);
  });
  it('the numbers, recomputed: r1 (35 ; 20), r2 (40 ; 30), practice (40 ; 20) and (30 ; 15); the first fact always has EQUAL counts', () => {
    expect(sol(TRIP)).toEqual(['35', '20']);
    expect(sol(PARTY)).toEqual(['40', '30']);
    expect(sol(TRIP_EASY)).toEqual(['40', '20']);
    expect(sol(PARTY_EASY)).toEqual(['30', '15']);
    [TRIP, TRIP_EASY, PARTY, PARTY_EASY].forEach((p) => expect(P.equalRow(modelOf(p)), p.system).toBe(1));
    [TRIP, TRIP_EASY, PARTY, PARTY_EASY].forEach((p) => expect(p.facts.map((f) => f.kind)).toEqual(['money', 'money']));
  });
  it('every number of a story is a chip, and every practice round is smaller than its round', () => {
    [TRIP, TRIP_EASY, PARTY, PARTY_EASY].forEach((p) => {
      const chips = p.chips.map((c) => c.value);
      (p.story.match(/\d+/g) ?? []).forEach((n) => expect(chips, `${p.system} story ${n}`).toContain(n));
    });
    const tot = (p) => modelOf(p).target.map((e) => L.toNumber(e.c));
    [[TRIP, TRIP_EASY], [PARTY, PARTY_EASY]].forEach(([a, b]) => expect(tot(b)[0]).toBeLessThan(tot(a)[0]));
  });
  it('r1: the typed line 2x = 70; the swapped pair PASSES the equal-count fact and fails the other (verifySwap « only2 »)', () => {
    const m = modelOf(TRIP);
    const plan = L.solvePlan(m.target, ['x', 'y'], 'sub');
    expect(plan.lines[0].tex).toBe('y = 55 - x');
    expect(plan.lines[plan.halfAt - 1].tex).toBe('2x = 70');
    const sw = L.replayStory(m, { x: 'y', y: 'x' }, { x: m.sol.x, y: m.sol.y });
    expect(sw.facts.map((f) => f.ok)).toEqual([true, false]);
  });
  it('r2 ends on the NUMERICAL build 120 × (40 + 30) = 8400: four distinct tiles, the decoy is 8400 ÷ 120', () => {
    const m = modelOf(PARTY);
    const b = P.sumBuild(m, { x: m.sol.x, y: m.sol.y });
    expect(b).toMatchObject({ k: '120', expected: ['40', '30', '8400'], decoy: '70', distinct: true });
    const e = modelOf(PARTY_EASY);
    expect(P.sumBuild(e, { x: e.sol.x, y: e.sol.y })).toMatchObject({ k: '20', expected: ['30', '15', '900'], decoy: '45', distinct: true });
  });
  it('the dry-run: every value any round, practice round or free story can show is clean (role-paired)', () => {
    const all = ALL.concat(FREE.map((c) => ({ id: `free-${c.id}`, props: { ...c.props, chains: 'none' } })));
    all.forEach(({ id, props }) => expect(violations(P.shownValues(props), id), id).toEqual([]));
    M7_ROUNDS.forEach((r) => [r.props, r.easier && easierProps(r)].filter(Boolean).forEach((p) => {
      expect(textViolations(`${r.title} ${p.lead} ${p.mission} ${p.story} ${r.easier?.helpLine ?? ''}`, r.id)).toEqual([]);
      expect(`${p.story} ${p.lead} ${p.mission}`).not.toMatch(/\bDA\b/);
    }));
  });
  it('every question a round asks is in its goal, and every checkpoint of a goal is asked', () => {
    ALL.forEach(({ id, round, props }) => {
      const ids = P.chainsOf(props.chains).specs.map((s) => s.id);
      const goalCps = (round.goal ?? []).filter((c) => c.checkpoint).map((c) => c.checkpoint);
      expect([...ids].sort(), id).toEqual([...goalCps].sort());
    });
  });
  ALL.filter(({ round }) => !round.free).forEach(({ id, round, props }) => {
    ['sub', 'add'].forEach((m) => it(`${id} (${m}) is played to its goal with three stars`, () => {
      const r = play(round, props, m);
      expect(r.won, `${id} won`).toBe(true);
      expect(r.stars, `${id} stars`).toBe(3);
    }));
  });
});

describe('module 7 — the collision rule against the unit\'s lessons (verdict X3–X4)', () => {
  const lessonRows = Object.values(signatures).flatMap((m) => m.SYSTEMS ?? []).filter((r) => !r.callback);
  const HEAD = new Set(['required', 'star', 'checkpoint', 'peer']);
  const headPairs = new Set(lessonRows.filter((r) => HEAD.has(r.tier)).map((r) => solutionOf(r.system).key));
  const lessonCanon = new Set(lessonRows.map((r) => canonSystem(r.system)));
  const unitPairs = new Set(Object.values(signatures).flatMap((m) => m.UNIT?.pairs ?? []));
  const ours = [
    ...ALL.filter(({ round }) => !round.free).map(({ id, props }) => ({ id, system: props.system })),
    ...PREP_SYSTEMS.map((p) => ({ id: `prep-${p.n}`, system: p.system })),
  ];
  it('the three lessons\' signatures are read', () => {
    expect(lessonRows.length).toBeGreaterThan(30);
  });
  it('no round or ladder system is a system of a lesson (K1, canonical form)', () => {
    ours.forEach(({ id, system }) => expect(lessonCanon.has(canonSystem(system)), id).toBe(false));
  });
  it('no round or ladder solution is a HEADLINE pair or a climax pair of a lesson (K2 / K3)', () => {
    ours.forEach(({ id, system }) => {
      const { kind, key } = solutionOf(system);
      if (kind !== 'unique') return;              // « no solution » / « infinitely many » is not a pair (K2 reads pairs)
      expect(headPairs.has(key), `${id} ${key}`).toBe(false);
      expect(unitPairs.has(key), `${id} ${key}`).toBe(false);
    });
  });
  it('the module-7 rounds are all distinct', () => {
    const keys = ALL.filter(({ round }) => !round.free).map(({ props }) => canonSystem(props.system));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('module 7 — its own screens never show the challenge SOLVED', () => {
  it('no visible line of Module07AlWadiya.jsx holds the challenge\'s answer (the situation itself is allowed: module 7 analyses it)', () => {
    visibleLines(module7Src).forEach((line, i) => expect(textViolations(line, `m7:${i + 1}`, { before7: false }), line.trim().slice(0, 100)).toEqual([]));
  });
});

describe('the synthesis — config, peer sheet, ladder', () => {
  const { mission } = LESSON_CONFIG;
  it('mission: owned keys from the unit\'s three lessons (each id exists there), every training uses a key, no checkpoint, two labels, two sittings', () => {
    expect(LESSON_CONFIG.studentView).toBe('mission');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
    expect(mission.toolsOwned).toBe(true);
    expect(mission.checkpoints).toEqual([]);
    expect(mission.climaxModule).toBe(8);
    expect(mission.stationLabels).toEqual({ 7: 'وضعية الوحدة', 8: 'التحدّي 🏆' });
    expect(mission.trainings).toEqual([1, 2, 3, 4, 5, 6]);
    expect(mission.hideStars).toBe(true);
    expect(mission.sittings).toBe(2);
    expect(mission.resumeInside).toBe(true);
    expect(mission.opening.cta).toBe('أجرّب');
    expect(mission.durationMin).toBe(LESSON_CONFIG.modules.reduce((a, m) => a + m.estimatedMin, 0));
    const ids = Object.entries(knowledgeOf).filter(([p]) => !p.includes('wadiya-idmajiya')).flatMap(([, m]) => Object.values(m.LESSON_KNOWLEDGE.modules).flat().map((x) => x.id));
    mission.tools.forEach((tl) => { expect(ids, tl.id).toContain(tl.id); expect(tl.label).not.toMatch(/^[A-Za-z]/); });
    mission.trainings.forEach((m) => expect(mission.tools.some((tl) => tl.usedIn.includes(m)), `training ${m}`).toBe(true));
    expect(mission.tools.some((tl) => tl.usedIn.includes(7))).toBe(true);
  });
  it('the opening holds no digit and no signature; no student-visible config line sends to the textbook', () => {
    expect(mission.opening.text).not.toMatch(/\d/);
    expect(textViolations(`${mission.title} ${mission.opening.text}`)).toEqual([]);
    const visible = [LESSON_CONFIG.description, mission.title, mission.opening.text, ...mission.tools.map((t) => t.label),
      ...LESSON_CONFIG.modules.map((m) => `${m.title} ${m.desc}`), ...LESSON_CONFIG.resources.map((r) => `${r.title} ${r.objective ?? ''} ${r.autonomy ?? ''}`)];
    visible.forEach((s) => { expect(/الكتاب(?!ة)/.test(s), s).toBe(false); expect(/نشاط\s*\d|تمرين\s*\d|ص\s*\d/.test(s), s).toBe(false); });
  });
  it('« ورقة عائشة »: a wrong PLAN (the check on the simplified equation only), no number, one right fix, every wrong fix says why', () => {
    expect(PEER_SHEET.lines[PEER_SHEET.errorLine]).toMatch(/المبسّطة/);
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    expect(PEER_SHEET.fixes.find((x) => x.ok).text).toMatch(/المعلومتين معًا/);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    const words = [PEER_SHEET.task, ...PEER_SHEET.lines, ...PEER_SHEET.fixes.flatMap((x) => [x.text, x.why ?? '']), PEER_SHEET.why].join(' ');
    expect(words).not.toMatch(/\d/);
    expect(textViolations(json(PEER_SHEET), 'peer')).toEqual([]);
  });
  it('the classmate عائشة is in hijab and her first name is on no other peer sheet of the platform, nor in the unit\'s cast', () => {
    expect(PEER_KID.figure.hairStyle).toBe('hijab');
    const names = Object.values(peerSheets).map((m) => m.PEER_KID?.name).filter(Boolean);
    expect(names.length).toBeGreaterThan(15);
    expect(names.filter((n) => n === PEER_KID.name)).toHaveLength(1);   // her own sheet only (this file is `content/peerSheet.js`)
    ['صهيب', 'أسامة', 'وئام', 'إكرام', 'إسحاق', 'ملاك', 'الطاهر', 'ياسين', 'أنيس'].forEach((n) => expect(PEER_KID.name).not.toBe(n));
  });
  it('« أستعدّ » never shows the signatures', () => {
    expect(textViolations(PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' '), 'prep')).toEqual([]);
  });
  it('the trainings name none of the unit\'s climax names (verdict X1)', () => {
    PROBLEMS.forEach((p) => ['الطاهر', 'ياسين', 'أنيس'].forEach((n) => expect(json(p).includes(n), `${p.id} ${n}`).toBe(false)));
  });
});
