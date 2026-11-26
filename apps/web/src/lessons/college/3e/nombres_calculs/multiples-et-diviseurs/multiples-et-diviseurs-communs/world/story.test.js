// THE STORY of multiples-et-diviseurs-communs: the shared checks (authoring kit), then what is this road's own — two walkways
// whose purses pay the first pillar that holds and not the next one, the facts of every pillar the design names, the WHOLE
// instruction of every step, the card on the right, the forges on their islands, the final mission (its facts written from
// who crosses, never the answer), and no sentence of the road that names a rule before its forge.
import { describe, it, expect } from 'vitest';
import {
  agreementErrors,
  PROVEN_LIMITS,
  describeStory,
  said,
  stringsIn,
  trueEqualities,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { lay } from '../../../../../../common/gameworld/divisorIsles/walkway';
import { daysFact } from '../../../../../../common/gameworld/divisorIsles/crews';
import { NUMBERS, fr, lcm, lcmOf, nb, togetherDay } from './math';
import { K, MODULE_KEYS, STORY, TABLETS } from './story';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { PRACTICE_MAP } from './practice';

const ID = 'multiples-et-diviseurs-communs';
const T = STORY.text;
const W = T.walkway;
const O = T.objective;
const M = STORY.mission;
const { pillar: PI, factors: FC, story: ST, mission: MI } = NUMBERS;
const [QUAI, CHANTIER] = STORY.segments.filter((s) => s.kind === 'walkway');
/** The sentences a walkway's panel writes after a try: one per lane, then the verdict (`Chantier.jsx › factsOf`). */
const facts = (seg, d) => {
  const purse = STORY.convoys[seg.convoy].purse;
  const t = lay(seg.crews, d, purse);
  return t.verdict === 'shore'
    ? [W.shore]
    : [...t.lanes.map((l, i) => W.lane(l, i, t)), W.verdict(t, { of: purse, left: purse })];
};
const laid = (seg, d) => lay(seg.crews, d, STORY.convoys[seg.convoy].purse);
/** Sentences as plain spaces: the French no-break spaces of `fr` and of `counted` read as one space. */
const flat = (x) => (Array.isArray(x) ? x.map(flat) : String(x).replace(/[  ]/g, ' '));

/** The sentences the story builds, with the arguments the road gives them (0, 1, 2 and 11+ where they count). */
const K1_DISTANCES = [64, 20, 16, 36, 40, 48, 60, 4, 0, 160, 320, 80];
const K2_DISTANCES = [6, 576, 138, 414, 4416, 26496, 79488, 13248];
const BUILT = [
  O.walkway(PI.crews, PI.purse, false),
  O.walkway(FC.crews, FC.purse, true),
  O.standing(STORY.islands[2].name),
  W.instruction(QUAI),
  W.instruction(CHANTIER),
  W.error.range(400),
  W.error.range(999999),
  W.crew(0, 16),
  W.band(120, 3),
  W.band(1, 414),
  W.pillar(0),
  W.pillar(1),
  W.pillar(80),
  W.short(1),
  W.short(2),
  W.purse(0, 14),
  W.purse(1, 14),
  W.purse(14, 14),
  ...[0, 1, 2, 11, 101].flatMap((n) => [
    W.lane({ b: 16, planks: n, short: 0, ends: true }, 0),
    W.lane({ b: 20, planks: n, short: 4, ends: false }, 1),
  ]),
  ...K1_DISTANCES.flatMap((d) => facts(QUAI, d)),
  ...K2_DISTANCES.flatMap((d) => facts(CHANTIER, d)),
  T.say.held(laid(QUAI, 80), PI.purse),
  T.say.held(laid(CHANTIER, 13248), FC.purse),
  T.say.held({ d: 1, lanes: [{ b: 1, planks: 1 }], cost: 1 }, 2),
  T.recall.pillar(80, PI.crews),
  T.recall.pillar(13248, FC.crews),
  T.recall.paid(1, 0),
  T.recall.paid(2, 1),
  T.recall.paid(9, 5),
  T.recall.paid(101, 19),
  M.text.posters(0, 3),
  M.text.posters(1, 3),
  M.text.posters(2, 3),
  M.text.posters(3, 3),
  ...[1, 2, 41, 161, 341, 680, 681, 2129, 2721].map((d) => M.check({ day: String(d) })),
];

/** The words of each key's name and of what it states: none in a sentence played before its forge, nor in a name. */
const KEY1 = /commun|plus petit|non nul|multiple|PPCM/i;
const KEY2 = /exposant|plus grand|tous les facteurs|PPCM/i;
const KEY3 = /rendez-vous|traduire|divisé par|propre période/i;
const KEY4 = /cinq équipes|cycle|sommeil|plus petit multiple|1 \+/i;
const panel = [
  W.title,
  W.prompt,
  W.objective,
  W.before,
  W.after,
  W.boxLabel,
  W.plant,
  W.lay,
  W.take,
  W.bench,
  W.benchSub,
  W.benchBack,
  W.error.empty,
  W.error.nan,
  W.error.range(400),
  W.crew(0, 16),
  W.crew(1, 20),
  W.band(1, 20),
  W.short(4),
  W.pillar(64),
  W.purse(14, 14),
  W.shore,
];
const beforeK1 = [
  T.title,
  T.subtitle,
  T.say.hello,
  O.walkway(PI.crews, PI.purse, false),
  O.cross,
  W.instruction(QUAI),
  ...panel,
  ...K1_DISTANCES.flatMap((d) => facts(QUAI, d)),
  T.say.held(laid(QUAI, 80), PI.purse),
];
const beforeK2 = [
  T.say.chantier,
  O.walkway(FC.crews, FC.purse, true),
  O.cross,
  O.standing(STORY.islands[2].name),
  W.instruction(CHANTIER),
  T.recall.pillar(80, PI.crews),
  T.recall.paid(9, 5),
  ...K2_DISTANCES.flatMap((d) => facts(CHANTIER, d)),
  T.say.held(laid(CHANTIER, 13248), FC.purse),
];
const beforeK3 = [
  T.say.toStory,
  T.recall.pillar(13248, FC.crews),
  T.recall.paid(101, 19),
  O.standing(STORY.islands[4].name),
];
const beforeK4 = [T.say.toTeams, O.standing(STORY.islands[5].name)];

describeStory({
  id: ID,
  story: STORY,
  tablets: TABLETS,
  keys: KEYS,
  sentences: BUILT,
  // the design's headline numbers of this lesson: in no other story and in no sheet of the bank
  headline: [414, 192, 13248, 26496, 1156, 952, 16184, 6776, 532, 533, 2129, 2721, 681],
  notInBank: [414, 13248, 1156, 16184, 6776],
  pairs: [
    [16, 20],
    [414, 192],
    [1156, 952],
    [32, 20],
    [10, 46],
    [4, 34],
    [26, 34],
    [24, 92],
    [19, 37],
  ],
  // the dash's waves: the design's own — their gates reach 2 208 (24 × 92), a product a student rejects
  dashMax: 2208,
  before: {
    [K.pilier]: { words: KEY1, lines: beforeK1 },
    [K.facteurs]: { words: KEY2, lines: beforeK2 },
    [K.rendezvous]: { words: KEY3, lines: beforeK3 },
    [K.equipes]: { words: KEY4, lines: beforeK4 },
  },
});

/** A game the story's hooks read: the keys held, the stage, the segments as the world builds them. */
function fake({ stage = 0, keys = [], complete = [] } = {}) {
  const segs = STORY.segments.map((s, index) => ({ ...s, index, complete: complete.includes(s.id), builtWith: null }));
  const said = [];
  const opened = [];
  const modules = [];
  return {
    T,
    state: { stage, keys: [...keys] },
    segs,
    isl: STORY.islands,
    flags: {},
    log: [],
    said,
    opened,
    modules,
    openForge: (k) => opened.push(k),
    say: (s) => said.push(s),
    onModule: (m) => modules.push(m),
    refreshObjective() {},
    save() {},
  };
}

describe('multiples-et-diviseurs-communs — its own road', () => {
  it('seven islands, the walkways, the standing bridges, the rail: the segments of the design', () => {
    expect(STORY.islands.map((x) => x.id)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    expect(STORY.segments.map((s) => s.kind)).toEqual(['walkway', 'bridge', 'walkway', 'bridge', 'bridge', 'rail']);
    expect(QUAI).toMatchObject({ crews: PI.crews, ruler: PI.ruler, scale: 'fixed', convoy: 'quai' });
    expect(CHANTIER).toMatchObject({ crews: FC.crews, scale: 'fit', convoy: 'chantier' });
    expect('bench' in CHANTIER).toBe(true);
    for (const s of STORY.segments.filter((x) => x.standing))
      expect(s).toMatchObject({ a: 0, holdsWith: 1, moulds: [] });
    expect(STORY.segments.filter((x) => x.standing)).toHaveLength(3);
    expect(STORY.convoys).toEqual({ quai: { purse: 14 }, chantier: { purse: 120 } });
    expect(STORY.dashWaves).toHaveLength(6);
    expect(STORY.segments.at(-1).kind).toBe('rail');
  });

  it('the walkway’s words are all written (the kit has no default: a walkway without them throws at build)', () => {
    for (const k of [
      'title',
      'instruction',
      'prompt',
      'objective',
      'before',
      'after',
      'plant',
      'lay',
      'take',
      'bench',
      'benchSub',
      'benchBack',
      'shore',
    ])
      expect(W[k], k).toBeTruthy();
    for (const k of ['crew', 'pillar', 'short', 'band', 'lane', 'verdict', 'purse'])
      expect(typeof W[k], k).toBe('function');
    for (const k of ['empty', 'nan']) expect(W.error[k], k).toBeTruthy();
    expect(W.error.range(400)).toContain('400');
  });

  it('K1: the first pillar that holds is 80 (9 planks, 5 coins); 160 and the product 320 hold and ruin; every fact is a sentence', () => {
    expect(lcm(...PI.crews)).toBe(80);
    expect(laid(QUAI, 80)).toMatchObject({ holds: true, cost: 9, paid: true });
    expect(laid(QUAI, 160)).toMatchObject({ verdict: 'ruins', cost: 18 });
    expect(laid(QUAI, 320)).toMatchObject({ verdict: 'ruins', cost: 36 });
    // the owner's sentence, in the design's words
    expect(flat(facts(QUAI, 64))).toEqual([
      'L’équipe A (planches de 16) finit pile au pilier : 4 planches.',
      'L’équipe B s’arrête 4 cases avant le pilier : 3 planches, la 4e dépasserait.',
      'Le pilier ne tient pas : le marchand reprend ses planches, et aucune pièce n’est dépensée.',
    ]);
    expect(flat(facts(QUAI, 16))[1]).toBe(
      'L’équipe B ne pose aucune planche : le pilier est à 16 cases du bord, la première en fait 20.',
    );
    expect(
      facts(QUAI, 4)
        .slice(0, 2)
        .every((f) => /ne pose aucune planche/.test(f)),
    ).toBe(true);
    expect(flat(facts(QUAI, 0))).toEqual(['Un pilier sur le bord : il n’y a pas de passerelle à construire.']);
    expect(flat(facts(QUAI, 80))).toEqual([
      'L’équipe A (planches de 16) finit pile au pilier : 5 planches.',
      'L’équipe B (planches de 20) finit pile au pilier : 4 planches.',
      'Le pilier tient. 9 planches, il te reste 5 pièces.',
    ]);
    expect(flat(facts(QUAI, 320))[2]).toBe(
      'Le pilier tient : 36 planches. Ta bourse ne paie que 14 planches : le marchand reprend ses planches.',
    );
    for (let d = 0; d <= PI.ruler; d += 1) for (const f of facts(QUAI, d)) said(f);
  });

  it('K1: no fact names the answer or the rule: the pillar that holds is said only once it is laid', () => {
    for (let d = 0; d <= PI.ruler; d += 1) {
      const t = laid(QUAI, d);
      for (const f of facts(QUAI, d)) {
        expect(f, `d = ${d}`).not.toMatch(KEY1);
        if (!t.holds) expect(f, `d = ${d}: ${f}`).not.toMatch(/\b80\b/);
      }
    }
  });

  it('K2: 13 248 is the first pillar (101 planks, 19 coins); 26 496 holds for 202 and is refused; the wrong rules are refuted', () => {
    expect(lcm(...FC.crews)).toBe(13248);
    expect(laid(CHANTIER, 13248)).toMatchObject({ holds: true, cost: 101, paid: true });
    expect(laid(CHANTIER, 26496)).toMatchObject({ verdict: 'ruins', cost: 202 });
    expect(flat(facts(CHANTIER, 13248))[2]).toBe('Le pilier tient. 101 planches, il te reste 19 pièces.');
    expect(
      facts(CHANTIER, 6)
        .slice(0, 2)
        .every((f) => /ne pose aucune planche/.test(f)),
    ).toBe(true);
    // a lane with no plank still writes its shortfall — the whole distance (walk: « each lane's planks and shortfall »)
    for (const d of [1, 6, 138, 191, 413])
      for (const [i, l] of laid(CHANTIER, d).lanes.entries())
        if (l.planks === 0)
          expect(flat(facts(CHANTIER, d))[i], `d = ${d}`).toMatch(new RegExp(`(^|\\D)${d} cases?\\b`));
    expect(flat(facts(CHANTIER, 576))[0]).toContain('s’arrête 162 cases avant le pilier');
    expect(flat(facts(CHANTIER, 414))[1]).toContain('s’arrête 30 cases avant le pilier');
    expect(flat(facts(CHANTIER, 4416))[0]).toContain('s’arrête 276 cases avant le pilier');
    for (const d of K2_DISTANCES) for (const f of facts(CHANTIER, d)) said(f);
    for (const d of K2_DISTANCES.filter((x) => x !== 13248 && x !== 26496 && x !== 79488))
      expect(laid(CHANTIER, d).holds, `d = ${d}`).toBe(false);
  });

  it('every sentence of the walkway stays clean for any pillar up to a hundred thousand', () => {
    for (let d = 0; d <= 3000; d += 1) for (const f of facts(CHANTIER, d)) expect(typographyErrors(f), f).toEqual([]);
    for (const d of [10000, 13248, 26496, 79488, 99999]) for (const f of facts(CHANTIER, d)) said(f);
  });

  it('the instruction of every step is whole, within the limit, and states only the constraint', () => {
    const seen = [O.walkway(PI.crews, PI.purse, false), O.walkway(FC.crews, FC.purse, true), M.objective];
    for (const o of seen) expect([...o].length, o).toBeLessThanOrEqual(212);
    expect(flat(O.walkway(PI.crews, PI.purse, false))).toMatch(/16 cases.*20.*finissent pile.*14 pièces/);
    expect(flat(O.walkway(FC.crews, FC.purse, true))).toMatch(/414 cases.*192.*finissent pile.*120 pièces/);
    for (const o of seen.slice(0, 2)) expect(o).not.toMatch(KEY1);
    // the world's objective hook: a walkway to build, a walkway that stands, a standing bridge, the rail
    const game = fake();
    expect(STORY.objective(game, game.segs[0])).toBe(O.walkway(PI.crews, PI.purse, false));
    // (the second walkway's instruction adds « Le tableur t’aide » once its bench exists: `inquiries.js › SHEET_BENCH`)
    expect(STORY.objective(game, game.segs[2])).toBe(O.walkway(FC.crews, FC.purse, Boolean(CHANTIER.bench)));
    expect(STORY.objective({ ...game, segs: game.segs }, { ...game.segs[0], complete: true })).toBe(O.cross);
    expect(STORY.objective(game, game.segs[1])).toBe(O.standing(STORY.islands[2].name));
    expect(STORY.objective(game, game.segs[5])).toBe(null);
  });

  it('the card on the right: after a walkway, the pillar’s equalities and the coins it cost', () => {
    const game = fake({ complete: ['pilier-quai'] });
    game.segs[0].builtWith = 80;
    const [pillar, paid] = STORY.recall(game, 1);
    expect(flat(pillar)).toBe('Le pilier : $80 = 16 \\times 5 = 20 \\times 4$');
    expect(flat(paid)).toBe('Tu as payé 9 pièces, il en reste 5');
    trueEqualities(pillar);
    expect(STORY.recall(game, 2)).toBe(null);
    const second = fake({ complete: ['pilier-chantier'] });
    second.segs[2].builtWith = 13248;
    const [p2, c2] = STORY.recall(second, 3);
    expect(flat(p2)).toBe('Le pilier : $13\\,248 = 414 \\times 32 = 192 \\times 69$');
    expect(flat(c2)).toContain('101 pièces');
    trueEqualities(p2);
  });

  it('the forges open on the islands of their mirrors — B, D, E, F — once, and only while their key is missing', () => {
    const FORGE_ISLAND = { [K.pilier]: 1, [K.facteurs]: 3, [K.rendezvous]: 4, [K.equipes]: 5 };
    for (const [key, k] of Object.entries(FORGE_ISLAND)) {
      const g = fake({ stage: k });
      STORY.onArrive(g, k);
      expect(g.opened, key).toEqual([key]);
      expect(STORY.pendingForge(g)).toBe(key);
      const held = fake({ stage: k, keys: [key] });
      STORY.onArrive(held, k);
      expect(held.opened).toEqual([]);
      expect(STORY.pendingForge(held)).toBe(null);
    }
    for (const k of [0, 2, 6]) {
      const g = fake({ stage: k });
      STORY.onArrive(g, k);
      expect(g.opened, `island ${k}`).toEqual([]);
    }
  });

  it('the modules are marked as their keys are sealed: K1 → 1, K2 → 2, K4 → 3 (it needs K3 too), never the problem', () => {
    const g = fake();
    const seal = (key) => {
      g.state.keys = [...g.state.keys, key];
      STORY.afterKey[key](g);
    };
    seal(K.pilier);
    expect(g.modules).toEqual(['1']);
    seal(K.facteurs);
    expect(g.modules).toEqual(['1', '2']);
    seal(K.rendezvous);
    expect(g.modules).toEqual(['1', '2']);
    seal(K.equipes);
    expect(g.modules).toEqual(['1', '2', '3']);
    expect(Object.keys(MODULE_KEYS)).toEqual(['1', '2', '3', '4']);
    expect(MODULE_KEYS[4]).toEqual(KEYS);
  });

  it('what Zero says between the forges names no later key (A2) and no sentence holds both the PGCD and a product', () => {
    const g = fake();
    for (const key of [K.pilier, K.facteurs, K.rendezvous]) STORY.afterKey[key](g);
    for (const s of g.said) {
      expect(s).not.toMatch(/PPCM/);
      expect(s).not.toMatch(KEY4);
    }
    const everything = [
      ...stringsIn(T),
      ...stringsIn(TABLETS),
      ...stringsIn(M.lead),
      ...stringsIn(M.text),
      M.objective,
      ...stringsIn(STORY.dashWaves.map((w) => [w.say, w.why])),
    ];
    for (const s of everything) {
      expect(s).not.toMatch(/PPCM/);
      for (const sentence of s.split(/[.;]/))
        expect(sentence, sentence).not.toMatch(/PGCD[^.]*produit|produit[^.]*PGCD/);
    }
  });

  it('every sentence the story can say takes French typography and agrees with its numbers (0, 1, 2, 11+)', () => {
    for (const s of [...stringsIn(T), ...stringsIn(M.text), ...stringsIn(M.lead), M.objective]) {
      said(s);
      expect(typographyErrors(s), s).toEqual([]);
      expect(agreementErrors(s), s).toEqual([]);
    }
  });
});

describe('multiples-et-diviseurs-communs — the tablets and the dash', () => {
  it('no rule’s icon is a glyph that prints words (📅 prints « July 17 » on the hub — walk 2026-11-26)', () => {
    for (const t of Object.values(TABLETS))
      expect(['📅', '📆', '🗓️', '🗓', '🆕', '🆗', '🆒', '🆓', '🔝']).not.toContain(t.icon);
  });

  it('the tablets hold the design’s numbers: 80, 13 248 = 2⁶ × 3² × 23 and 864, 160 = 32 × 5 = 20 × 8, 60 and 532', () => {
    const t = TABLETS;
    expect(t[K.pilier].lines.join(' ')).toContain('80');
    expect(t[K.pilier].math).toEqual(['80 = 16 \\times 5', '80 = 20 \\times 4']);
    expect(flat(t[K.pilier].notes[0])).toMatch(/320.*36 planches.*14/);
    expect(t[K.facteurs].math).toEqual(['13\\,248 = 2^{6} \\times 3^{2} \\times 23', '864 = 2^{5} \\times 3^{3}']);
    expect(t[K.facteurs].lines[1]).toContain('414 = 2 \\times 3^{2} \\times 23');
    expect(t[K.rendezvous].math).toEqual(['160 = 32 \\times 5', '160 = 20 \\times 8']);
    expect(t[K.rendezvous].notes[0]).toMatch(/230 min.*10 h/);
    expect(t[K.equipes].math).toEqual(['60 = 2^{2} \\times 3 \\times 5', '532 = 2^{2} \\times 7 \\times 19']);
    expect(t[K.equipes].lines.join(' ')).toMatch(/jour 61.*jour 533/);
    // a tablet tells no later key's way: K1's holds no factors, K2's no turns or days, K3's no days
    expect(t[K.pilier].lines.join(' ')).not.toMatch(/facteur|exposant|tour|jour/);
    expect(t[K.facteurs].lines.join(' ') + t[K.facteurs].notes.join(' ')).not.toMatch(/tour|jour|cycle/);
    expect(t[K.rendezvous].lines.join(' ') + t[K.rendezvous].notes.join(' ')).not.toMatch(/cycle|sommeil/);
  });

  it('the gate dash: the right gates of the design — 68, 552, 13 turns, 4 bags, day 41, 703 — and the wrong ones refuted', () => {
    const right = STORY.dashWaves.map((w) => w.gates.find(w.test));
    expect(right).toEqual([68, 552, 13, 4, 41, 703]);
    for (const w of STORY.dashWaves) {
      for (const g of w.gates.filter((n) => !w.test(n))) expect(w.why.wrong[g], `${w.say} ← ${g}`).toBeTruthy();
      for (const line of [w.why.right, ...Object.values(w.why.wrong)]) {
        trueEqualities(line);
        expect(typographyErrors(line), line).toEqual([]);
      }
    }
    // the dash's numbers are the design's: W1 4 and 34, W2 2³ × 3 and 2² × 23, W3 26 and 34 teeth, W5 rests 4 and 7
    expect([lcm(4, 34), lcm(24, 92), lcm(26, 34) / 34, togetherDay([5, 8]), lcm(19, 37)]).toEqual([
      68, 552, 13, 41, 703,
    ]);
  });
});

describe('multiples-et-diviseurs-communs — the final mission', () => {
  const ask = (day) => M.check({ day: String(day) });
  const cycles = MI.rests.map((r) => r + 1);

  it('the harbour’s three ferries: cycles 8, 17, 20 → day 681 (680 days from the start); the story only', () => {
    expect(cycles).toEqual([8, 17, 20]);
    expect(togetherDay(cycles)).toBe(681);
    expect(lcmOf(cycles)).toBe(680);
    expect(ask(681)).toBe('ok');
    for (const r of MI.rests) expect(flat(M.lead.join(' '))).toContain(`${r} jours`);
    // the mission states only the story: no cycle, no « + 1 », no name of the lesson’s tool
    for (const s of [...M.lead, M.objective, M.title, M.prompt])
      expect(s).not.toMatch(/cycle|multiple|PPCM|\+ 1|plus petit/i);
  });

  it('every error of the lesson is refused by a fact written from who crosses that day (the design’s table)', () => {
    // a day of four digits is written French, « 2 129 » (a narrow no-break space)
    expect(flat(ask(2129))).toBe('Le jour 2 129, la navette de l’ouest et celle du sud sont au port.');
    expect(flat(ask(680))).toBe('Le jour 680, les trois navettes sont au port.');
    expect(flat(ask(2))).toBe('Le jour 2, les trois navettes sont au port.');
    expect(ask(1)).toBe(fr('Le jour 1, c’est le départ : 0 jour depuis le départ.'));
    expect(flat(ask(2721))).toBe(
      'Les trois traversent ensemble ce jour-là, mais ce n’est pas la première fois depuis le jour 1.',
    );
    expect(flat(ask(41))).toBe('Le jour 41, la navette de l’ouest est au port.');
    expect(flat(ask(161))).toBe('Le jour 161, la navette de l’ouest est au port.');
    expect(flat(ask(341))).toBe('Le jour 341, la navette du nord est au port.');
  });

  it('a fact never writes the answer: no day but 681 is told 681, and 681 is the only « ok »', () => {
    for (let d = 1; d <= 3000; d += 1) {
      const out = ask(d);
      if (d === 681) {
        expect(out).toBe('ok');
        continue;
      }
      expect(out, `day ${d}`).not.toBe('ok');
      expect(flat(out).replace(flat(nb(d)), ''), `day ${d}: ${out}`).not.toMatch(/(?<![0-9])681(?![0-9])/);
      expect(typographyErrors(out), out).toEqual([]);
      said(out);
    }
    // the sentence agrees with the day the world runs to it
    for (const d of [2, 41, 161, 341, 680, 2129]) {
      const f = daysFact(cycles, d);
      expect(ask(d)).toBe(M.check({ day: String(d) }));
      expect(f.idle.length).toBeGreaterThan(0);
    }
  });

  it('a day that is no day: empty, a decimal, a negative, 0 — one sentence that asks for a whole day', () => {
    for (const v of ['', ' ', 'abc', '2.5', '-3', '0', '1e3', '1234567'])
      expect(M.check({ day: v }), v).toBe(M.check({ day: v.trim() }));
    expect(flat(M.check({ day: '' }))).toBe('Écris un jour : un nombre entier à partir de 1.');
    expect(M.window.day({ day: ' 2129 ' })).toBe(2129);
    expect(Number.isNaN(M.window.day({}))).toBe(true);
  });

  it('the board: one box « Le jour », three posters a run, the window of the three ferries, the words of the buttons', () => {
    const [line] = M.lines();
    expect(line.tokens.filter((t) => typeof t === 'object')).toHaveLength(1);
    expect(line.tokens.find((t) => typeof t === 'object')).toMatchObject({ slot: 'day' });
    expect(M.posters).toBe(3);
    expect(M.window.cycles).toEqual([8, 17, 20]);
    expect(M.window.day({ day: '2129' })).toBe(2129);
    expect(flat([0, 1, 2, 3].map((n) => M.text.posters(n, 3)))).toEqual([
      '0 affiche sur 3',
      '1 affiche sur 3',
      '2 affiches sur 3',
      '3 affiches sur 3',
    ]);
    expect(M.window.labels.team(0)).toBe('Nord');
    expect(M.window.labels.before(21)).toContain('20');
    // the window and its facts past day 1 000 (the rest days' trap 2 129): every number grouped by thousands
    const ungrouped = /(?<![\d\u202F\u00A0 ])\d{4,}/;
    expect(flat(M.window.labels.before(2114))).toBe('… 2 113 jours');
    expect(flat(M.window.labels.since(2128))).toBe('2 128');
    for (let d = 1000; d <= 3000; d += 1) expect(M.check({ day: String(d) }), `day ${d}`).not.toMatch(ungrouped);
    expect(M.text.check).toBe('Vérifier');
    expect(M.text.later).toBeTruthy();
    expect(M.text.spent).toBeTruthy();
    expect(M.prompt).toMatch(/^Appuie sur E/);
  });

  it('solving marks the problem module and Zero says it; a spent run speaks too', () => {
    const g = fake({ stage: 6, keys: KEYS });
    M.onSolved(g);
    expect(g.modules).toEqual(['4']);
    expect(g.said).toEqual([T.say.solved]);
    M.onSpent(g);
    expect(g.said.at(-1)).toBe(T.say.spent);
  });

  it('brute force is not free: the ferries need 34 tries on the days 21, 41 … (20k + 1), and 3 posters a run', () => {
    let tries = 0;
    for (let d = 21; ; d += 20) {
      tries += 1;
      if (ask(d) === 'ok') break;
    }
    expect(tries).toBe(0 + 34);
    expect(M.posters).toBeLessThan(tries);
    expect(ST.ruler).toBe(700);
  });
});

// What this lesson's own files decide of the limits the walks proved — the shared `describeLimits` (limits.test.js) reads
// the forges and the board too, and fails until they exist; this part does not need them.
describe('multiples-et-diviseurs-communs — its own limits', () => {
  it('the knowledge map: every card of the centre lane is two lines at most (≤ 36 characters, as lesson 2’s)', () => {
    // rows 17 % apart leave a link's label room only beside a two-line card (walk 2026-11-26: labels under « facteurs »)
    for (const n of KNOWLEDGE.graph.nodes.filter((x) => x.lane === 'center'))
      expect(flat(n.title).length, n.title).toBeLessThanOrEqual(36);
  });

  it('every instruction, whatever its arguments, stays within the instruction the walks proved', () => {
    const all = [
      O.walkway(PI.crews, PI.purse, false),
      O.walkway(FC.crews, FC.purse, true),
      O.walkway(FC.crews, FC.purse, false),
      O.cross,
      ...STORY.islands.slice(1).map((x) => O.standing(x.name)),
      O.board,
      O.end,
      M.objective,
      W.instruction(QUAI),
      W.instruction(CHANTIER),
    ];
    for (const o of all) expect([...o].length, o).toBeLessThanOrEqual(PROVEN_LIMITS.objective);
  });

  it('the tablets, the practice map and the knowledge map stay within their limits', () => {
    for (const t of Object.values(TABLETS)) {
      expect(t.lines.length).toBeLessThanOrEqual(PROVEN_LIMITS.tabletLines);
      expect(t.math.length).toBeLessThanOrEqual(PROVEN_LIMITS.tabletMath);
      expect((t.notes ?? []).length).toBeLessThanOrEqual(PROVEN_LIMITS.tabletNotes);
    }
    expect(Object.keys(PRACTICE_MAP.positions).length).toBeLessThanOrEqual(PROVEN_LIMITS.practiceNodes);
    expect(KNOWLEDGE.graph.nodes.length).toBeLessThanOrEqual(PROVEN_LIMITS.knowledgeCards);
  });
});
