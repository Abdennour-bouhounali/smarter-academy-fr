/**
 * PROOF of the authoring kit on a real lesson — the PGCD search (lesson 6 of unit 1, 4AM):
 *   1. the shared suites of `test/suites.js` run on its world and pass (what its own tests hand-wrote, in a few lines);
 *   2. its `math.js` re-exports `numbers.js` (since 2026-11-20: the copies it held are gone);
 *   3. ONE of its forges (🔁, Euclid's procedure) is REBUILT from `forgeBlocks.js` and behaves exactly like its own:
 *      the same tiles, the same verdict of every rule on every case, the same evidence for a log, the same attacks,
 *      the same last step.
 * This file and `proof.tayin.test.js` are the only files of the kit that name a lesson (a test may: lessonPack.test.js).
 */
import { describe, it, expect } from 'vitest';
import { foldReducer, foldResult, initFold } from '../../divisorIsles/gcdModes';
import { ladderOf } from '../../divisorIsles/inquiry';
import { rng } from '../random';
import { runOn } from '../forge';
import {
  attacksOf,
  divisionRow,
  firstWrong,
  fromLog,
  givenDivision,
  judge,
  noPredictions,
  pairPool,
  pgcdBox,
  plankCase,
  makerOf,
} from './forgeBlocks';
import * as N from './numbers';
import {
  allRules,
  buildersOf,
  describeEvidence,
  describeExperiments,
  describeForges,
  describeKnowledge,
  describeLimits,
  describeSitting,
  describeStory,
  describeTrainer,
  stringsIn,
} from './test/suites.js';
import { bankPairs, readBank } from './test/bank.js';
import * as M from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/bahth-pgcd/world/math';
import {
  NUMBERS,
  STORY,
  TABLETS,
  roadOf,
} from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/bahth-pgcd/world/story';
import {
  BANK_PAIRS as LISTED,
  FORGES,
} from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/bahth-pgcd/world/forges';
import {
  FOLD_INQUIRY,
  IQLIDIS_BENCH,
  SIBAQ_BENCH,
  TARH_BENCH,
} from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/bahth-pgcd/world/inquiries';
import { KEYS } from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/bahth-pgcd/world/journey';
import { KNOWLEDGE } from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/bahth-pgcd/world/knowledge';
import { PRACTICE_MAP } from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/bahth-pgcd/world/practice';
import {
  evidence,
  trainerEvidence,
} from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/bahth-pgcd/world/evidence';
import {
  PLAN_OF,
  answerLabel,
  check,
  solution,
  trainer,
} from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/bahth-pgcd/world/trainer';
import { lesson } from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/bahth-pgcd/world/index';
import {
  LEVELS,
  sittings,
} from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/bahth-pgcd/world/sitting';
import { SCRIPT } from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/bahth-pgcd/board/script';
import { LESSON_CONFIG } from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/bahth-pgcd/lesson.config';

const ID = 'bahth-pgcd';

// ───────── 1. the shared suites, on the lesson as it is ─────────

const S = STORY.text.say;
const O = STORY.text.objective;
const R = STORY.text.recall;
describeStory({
  id: ID,
  story: STORY,
  tablets: TABLETS,
  keys: KEYS,
  pairs: [NUMBERS.fold.gaps, NUMBERS.boss.lanes],
  headline: [...NUMBERS.boss.lanes, NUMBERS.boss.lanes[0] + NUMBERS.boss.lanes[1], 259, 185, 1833, 546, 1003, 962, 296],
  notInBank: [...NUMBERS.boss.lanes, NUMBERS.boss.lanes[0] + NUMBERS.boss.lanes[1]],
  // written before the kit: « 1003 خانة » (the kit's `counted` says « 1003 خانات »: the last two digits decide) — reported
  agreement: { past100: false },
  sentences: [
    S.diffOk(152, 19, 95),
    S.diffOk(57, 19, null),
    S.headOk(1833, 39, 14, 546),
    S.tailOk(34, 17, 0),
    S.bossFail(56),
    S.bossFail(13),
    O.make('tarh'),
    O.carry('iqlidis', 39, 61),
    O.tail(546, 39, 14),
    R.paid(47, 14),
    R.plank(1, [{ a: 259, did: 'coins' }]),
    TABLETS['aqall-khutuwat'].notes[0],
  ],
  // the sentences played before each forge, and the words of the key they must not hold (its own story.test.js lists)
  before: {
    'farq-yabqi': {
      words: /يحفظ|مشترك|PGCD|قاسم|فرق|الفروق|خوارزمية|باق|إقليدس/,
      lines: [STORY.text.subtitle, S.hello, S.b95, S.c57, S.diffOk(95, 19, 57), O.diff, O.diffCarry(8), R.third],
    },
    'khawarizmiyat-al-tarh': {
      words: /PGCD|القاسم المشترك|آخر فرق|آخر باق|غير معدوم|خوارزمية|إقليدس|حتّى/,
      lines: [S.tarh, S.e185, S.headOk(259, 37, 5, 185), O.make('tarh'), O.tail(185, 37, 5), STORY.text.workshop.bench],
    },
    iqlidis: {
      words: /PGCD|القاسم المشترك|آخر فرق|آخر باق|غير معدوم|خوارزمية|إقليدس|أسرع|أقصر|أقلّ|خطو/,
      lines: [S.iqlidis, S.g546, S.sibaq, S.i34, O.make('iqlidis'), O.make('sibaq'), O.tail(34, 17, 2)],
    },
  },
});

/** The fold he plays in 🧮's mirror, through the world's own reducer (one wrong fold first). */
const FOLD_RESULT = (() => {
  let s = initFold();
  while (s.stage === 'write') s = foldReducer(FOLD_INQUIRY, s, { type: 'tick' });
  s = foldReducer(FOLD_INQUIRY, s, { type: 'fold', q: 2, r: 370 });
  s = foldReducer(FOLD_INQUIRY, s, { type: 'fold', q: 3, r: 74 });
  while (s.stage === 'finish') s = foldReducer(FOLD_INQUIRY, s, { type: 'tick' });
  return foldResult(s);
})();
const fired = (list) => list.map(([a, b]) => ({ a, b }));
const DIFF = fired([
  [152, 19],
  [95, 19],
  [57, 19],
]);
const TARH = fired([
  [259, 37],
  [185, 37],
]);
const IQ = fired([
  [1833, 39],
  [546, 39],
]);
const ROADS = {
  AT_ONCE: {
    'farq-yabqi': DIFF,
    'khawarizmiyat-al-tarh': TARH,
    iqlidis: IQ,
    'aqall-khutuwat': fired([
      [1003, 17],
      [34, 17],
    ]),
  },
  WALKED: {
    'farq-yabqi': fired([[152, 8], [95, 8], [152, 5], ...DIFF.map((r) => [r.a, r.b])]),
    'khawarizmiyat-al-tarh': fired([[259, 74], [259, 1], ...TARH.map((r) => [r.a, r.b])]),
    iqlidis: fired([[1833, 13], [546, 13], ...IQ.map((r) => [r.a, r.b])]),
    'aqall-khutuwat': fired([
      [1003, 34],
      [1003, 17],
      [34, 17],
    ]),
  },
};
const BEFORE = {
  'khawarizmiyat-al-tarh': DIFF,
  'baqi-yabqi': [...DIFF, ...TARH],
  iqlidis: [...DIFF, ...TARH],
  'aqall-khutuwat': [...DIFF, ...TARH, ...IQ],
};
const SOLVE = {
  'farq-yabqi': (c) => ({ d: c.A - c.B, p: c.A - c.B, g: N.gcd(c.A, c.B) }),
  'khawarizmiyat-al-tarh': (c) => {
    const r = N.differences(c.A, c.B);
    return { d1: r[0].d, x2: r[1].x, y2: r[1].y, d2: r[1].d, x3: r[2].x, y3: r[2].y, d3: r[2].d, g: N.gcd(c.A, c.B) };
  },
  'baqi-yabqi': (c) => ({ q: Math.floor(c.A / c.B), r: c.A % c.B, p: c.A % c.B, g: N.gcd(c.A, c.B) }),
  iqlidis: (c) => {
    const r = N.euclid(c.A, c.B);
    const row = (i) => ({ [`a${i}`]: r[i - 1].a, [`b${i}`]: r[i - 1].b, [`q${i}`]: r[i - 1].q, [`r${i}`]: r[i - 1].r });
    return { q1: r[0].q, r1: r[0].r, ...row(2), ...row(3), g: N.gcd(c.A, c.B) };
  },
  'aqall-khutuwat': (c) => {
    const [d1, d2] = N.euclid(c.A, c.B);
    return { q1: d1.q, r1: d1.r, b2: d2.b, q2: d2.q, r2: d2.r, s: N.differences(c.A, c.B).length, g: N.gcd(c.A, c.B) };
  },
};
const FORBIDDEN = {
  'farq-yabqi': /يحفظ|مشترك|PGCD|قاسم/,
  'khawarizmiyat-al-tarh': /خوارزمي|الفروق|PGCD|قاسم|مشترك|غير معدوم/,
  'baqi-yabqi': /يحفظ|مشترك|PGCD|قاسم/,
  iqlidis: /خوارزمي|إقليدس|PGCD|قاسم|مشترك|غير معدوم/,
  'aqall-khutuwat': /خوارزمي|أسرع|PGCD|قاسم|مشترك/,
};
const forgeSuite = describeForges({
  forges: FORGES,
  keys: KEYS,
  roads: ROADS,
  before: BEFORE,
  inquiry: { 'baqi-yabqi': FOLD_RESULT },
  solve: SOLVE,
  forbidden: FORBIDDEN,
  tiles: { 'farq-yabqi': 8, 'khawarizmiyat-al-tarh': 12, 'baqi-yabqi': 8, iqlidis: 18, 'aqall-khutuwat': 12 },
  // the lesson's own list of the bank's pairs (forges.js): the shared reader finds more — see « the bank » below
  bankPairs: LISTED,
});

/** Every sentence a one-mode notebook can say on its own numbers, row by row (the lesson's inquiries.test.js). */
function notebookLines(spec) {
  const T = spec.text;
  const { mode } = spec;
  const { a, b } = spec.rounds[0];
  const L = ladderOf(a, b, mode);
  const lines = [T.lead(a, b, mode), T.goal(a, b, mode), T.write, T.planks, T.countLabel, T.finish, T.next, T.done];
  for (const k of [1, 2, 3, 11]) lines.push(T.folded(k));
  for (let w = 0; w <= L.steps; w += 1) lines.push(T.countAsk({ a, b, mode, written: w }));
  for (const row of L.rows) {
    lines.push(T.ask({ a: row.a, b: row.b, mode, row: 1 }));
    for (const hit of [true, false])
      lines.push(T.seen({ ...row, mode, said: hit ? (row.next ?? [0, 0]) : [1, 1], hit: hit && Boolean(row.next) }));
  }
  for (const guessed of [L.steps, L.steps + 2]) {
    const end = { a, b, mode, steps: L.steps, guessed, gcd: L.gcd };
    lines.push(T.end(end), T.foundLine(end));
  }
  return lines;
}
describeExperiments({
  ofKey: {
    'khawarizmiyat-al-tarh': TARH_BENCH,
    'baqi-yabqi': FOLD_INQUIRY,
    iqlidis: IQLIDIS_BENCH,
    'aqall-khutuwat': SIBAQ_BENCH,
  },
  linesOf: (key, spec) => (spec.plain ? notebookLines(spec) : stringsIn(spec.text)),
  never: /PGCD|قاسم|مشترك|يحفظ|خوارزمي|إقليدس|غير معدوم|أسرع|اصنع|أطول لوح|آخر فرق|آخر باق|آخر سطر|الأخير/,
  own: {
    'khawarizmiyat-al-tarh': /الأقصر والفرق|الأصغر والفرق|حتّى يصير|الفرق 0/,
    'baqi-yabqi': /الباقي|هوّة الباقي/,
    iqlidis: /الأصغر والباقي|القاسم والباقي|حتّى يصير|الباقي 0/,
    'aqall-khutuwat': /حاصل|دائمًا|أختار/,
  },
});

const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
describeEvidence({
  id: ID,
  keys: KEYS,
  evidence,
  trainerEvidence,
  trainer,
  check,
  solution,
  cards: CARDS,
  config: LESSON_CONFIG,
  boxes: { farq: ['e', 'g'], furuq: ['d', 'g'], baqi: ['q', 'r', 'e'], iqlidis: ['q', 'r', 'g'] },
  seeds: 10,
  minPerKind: 15,
  // the mistakes of THIS lesson (its evidence.test.js): the sum where the difference is asked, the difference for the PGCD
  mistakes: (q, right) => {
    const [first] = N.euclid(q.a, q.b);
    if (q.kind === 'farq')
      return [
        { ...right, e: q.a + q.b },
        { ...right, g: q.a - q.b },
      ];
    if (q.kind === 'baqi')
      return [
        { ...right, e: first.q },
        { q: first.q - 1, r: first.r + q.b, e: first.r + q.b },
      ];
    if (q.kind === 'iqlidis')
      return [
        { ...right, g: N.euclid(q.a, q.b).at(-1).q },
        { ...right, g: 0 },
      ];
    return [];
  },
});
describeTrainer({
  trainer,
  check,
  solution,
  answerLabel,
  evidenceOf: trainerEvidence,
  planOf: PLAN_OF,
  cards: CARDS,
  kinds: ['farq', 'furuq', 'baqi', 'iqlidis', 'sura', 'tap', 'tf'],
  seeds: 10,
});
describeKnowledge({ knowledge: KNOWLEDGE, keys: KEYS, cards: lesson.cards });
describeLimits({
  forges: FORGES,
  keys: KEYS,
  tablets: TABLETS,
  objectives: [
    O.diff,
    ...[37, 39, 17, 8, 5, 3, 13].map((b) => O.diffCarry(b)),
    ...['tarh', 'iqlidis', 'sibaq'].flatMap((c) => [O.make(c), O.carry(c, 39, 61)]),
    ...STORY.islands.map((x) => O.convoyBack(x.name)),
    O.bossGo,
  ],
  knowledge: KNOWLEDGE,
  practiceMap: PRACTICE_MAP,
  script: SCRIPT,
});
describeSitting({ id: ID, lesson, sittings, levels: LEVELS });

// ───────── 2. the lesson's math.js IS numbers.js (it re-exports it: no copy left to drift) ─────────

describe('the lesson’s math.js is numbers.js', () => {
  it('every helper it gives the lesson is the kit’s own, and so is the story’s road', () => {
    const shared = Object.keys(M).filter((name) => name !== 'NUMBERS');
    expect(shared.length).toBeGreaterThan(20);
    for (const name of shared) expect(M[name], name).toBe(N[name]);
    expect(roadOf).toBe(N.roadOf);
  });
  it('past 100 the last two digits decide the noun (the lesson glued « 103 لوحًا » before it used the kit)', () => {
    expect(M.planksOf(103, 4)).toBe('103 ألواح طولها 4');
    expect(M.planksOf(144, 4)).toBe('144 لوحًا طولها 4');
    expect(M.emptyCells(106)).toBe('بقيت 106 خانات فارغة');
  });
  it('every convoy of the road is solvable with exactly its plank', () => {
    expect(buildersOf(NUMBERS.tarh.gaps, NUMBERS.tarh.purse)).toEqual([37]);
    expect(buildersOf(NUMBERS.diff.gaps, Infinity, NUMBERS.diff.moulds)).toEqual([19]);
  });
});

// ───────── 3. the forge 🔁 rebuilt from the blocks ─────────

const L = FORGES.iqlidis;
/** Euclid's procedure as a rule of tiles writes it (the lesson's own: what its tiles mean). */
function iqRun(rule, A, B) {
  let [x, y] = [Math.max(A, B), Math.min(A, B)];
  const rows = [];
  for (;;) {
    const q = Math.floor(x / y);
    const r = x % y;
    rows.push({ x, y, q, r });
    if (r === 0 || (rule.stop === 'qone' && q === 1)) break;
    [x, y] = rule.next === 'sr' ? [y, r] : rule.next === 'qr' ? [Math.max(q, r), Math.min(q, r)] : [x, r];
  }
  const end = rows.at(-1);
  return { rows, made: { last: end.r !== 0 ? end.r : end.y, q: end.q, count: rows.length }[rule.make] };
}
const iqCase = (A, B, d) => plankCase('iqlidis', A, B, d);
const plankId = (c) => `${c.of}:${c.A}:${c.B}:${c.d}`;
const J = judge({
  slots: L.slots,
  right: { next: 'sr', stop: 'zero', make: 'last' },
  says: (rule, c) => iqRun(rule, c.A, c.B).made === c.d,
});
const n = (v) => Number(v);
const REBUILT = {
  key: 'iqlidis',
  ...J,
  chip: L.chip,
  ruleText: L.ruleText,
  explain: L.explain,
  caseId: plankId,
  evidence: fromLog({
    of: 'iqlidis',
    gaps: NUMBERS.iqlidis.gaps,
    make: iqCase,
    lived: [NUMBERS.iqlidis.plank],
    caseId: plankId,
  }),
  predictCases: noPredictions,
  attacks: attacksOf({
    ...J,
    caseId: plankId,
    pool: pairPool({ A: [6, 40], B: (a) => [a + 1, 60], d: (a, b) => [1, b], make: iqCase, exclude: LISTED }),
    hard: [iqCase(63, 45, 18), iqCase(63, 45, 9)],
  }),
  nudge: L.nudge,
  use: {
    make: makerOf(
      [
        [1334, 319],
        [1395, 217],
        [1288, 207],
        [1411, 272],
      ],
      (A, B) => ({ A, B, rows: N.euclid(A, B), g: N.gcd(A, B), held: true }),
    ),
    lines: (c) => [
      givenDivision(c.A, c.B, { q: 'q1', r: 'r1', rw: 3 }),
      divisionRow(2),
      divisionRow(3),
      pgcdBox(c.A, c.B),
    ],
    check: (c, v) =>
      firstWrong([
        ['row1', n(v.q1) === c.rows[0].q && n(v.r1) === c.rows[0].r],
        ...[2, 3].flatMap((i) => [
          [`pair${i}`, n(v[`a${i}`]) === c.rows[i - 1].a && n(v[`b${i}`]) === c.rows[i - 1].b],
          [`row${i}`, n(v[`q${i}`]) === c.rows[i - 1].q && n(v[`r${i}`]) === c.rows[i - 1].r],
        ]),
        [n(v.g) === 0 ? 'zero' : 'pgcd', n(v.g) === c.g],
      ]),
  },
  text: L.text,
};

describe('the forge 🔁 rebuilt from forgeBlocks.js behaves exactly like the lesson’s own', () => {
  const rules = allRules(L);
  const logs = [
    [],
    IQ,
    ROADS.WALKED.iqlidis,
    [...DIFF, ...TARH, ...ROADS.WALKED.iqlidis],
    fired([
      [1833, 3],
      [546, 3],
      [1833, 546],
      [1833, 13],
      [546, 13],
      [1833, 39],
      [546, 39],
    ]),
  ];
  it('the same tiles, and the same verdict of every rule on every case it can show', () => {
    expect(REBUILT.slots).toEqual(L.slots);
    expect(rules.filter(REBUILT.isTheRule)).toEqual(rules.filter(L.isTheRule));
    const cases = [...logs.flatMap((log) => L.evidence(log)), ...forgeSuite.shownCases(L)];
    expect(cases.length).toBeGreaterThan(50);
    for (const rule of rules) for (const c of cases) expect(REBUILT.says(rule, c), plankId(c)).toBe(L.says(rule, c));
  });
  it('the same evidence for a log, and the same attack of every rule on it', () => {
    for (const log of logs) {
      const rows = L.evidence(log);
      expect(REBUILT.evidence(log)).toEqual(rows);
      expect(REBUILT.predictCases(rows)).toEqual(L.predictCases(rows));
      for (const rule of rules) {
        expect(REBUILT.attacks(rule, rows)).toEqual(L.attacks(rule, rows));
        expect(runOn(REBUILT, rule, rows).bad).toBe(runOn(L, rule, rows).bad);
      }
    }
  });
  it('the same last step: the same case for a draw, the same lines, the same answer to every mistake', () => {
    for (let seed = 1; seed <= 30; seed += 1) {
      const c = L.use.make(rng(seed));
      expect(REBUILT.use.make(rng(seed))).toEqual(c);
      expect(REBUILT.use.lines(c)).toEqual(L.use.lines(c));
      const ok = SOLVE.iqlidis(c);
      const text = Object.fromEntries(Object.entries(ok).map(([k, v]) => [k, String(v)]));
      expect(REBUILT.use.check(c, text)).toBe('ok');
      for (const k of Object.keys(ok))
        for (const v of ['0', String(ok[k] + 1), '', String(c.A)]) {
          const vals = { ...text, [k]: v };
          expect(REBUILT.use.check(c, vals), `${k}=${v}`).toBe(L.use.check(c, vals));
        }
    }
  });
});

// ───────── the bank: the shared reader against the lesson's own ─────────

describe('the bank of the lesson, read by test/bank.js', () => {
  it('finds every pair the lesson listed — and the pairs written « \\text{PGCD}(a ; b) » its regex missed', () => {
    const found = bankPairs(readBank(ID));
    for (const p of LISTED) expect(found.has(p), p).toBe(true);
    const missed = [...found].filter((p) => !LISTED.has(p)).sort();
    // reported, not fixed here: the mirror's pool is built from the lesson's list (forges.js › BANK_PAIRS)
    expect(missed.length).toBeGreaterThan(0);
    // what the mirror really shows of those pairs, on the roads above
    const shown = KEYS.flatMap((key) => forgeSuite.shownCases(FORGES[key]))
      .filter((c) => c.A != null && missed.includes([c.A, c.B].sort((x, y) => x - y).join(';')))
      .map((c) => `${c.A};${c.B}`);
    expect([...new Set(shown)]).toEqual([]);
  });
});
