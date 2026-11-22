// THE KIT NAMES NO LESSON. These tests drive every frame of the kit with a TOY lesson that has nothing to do with the
// pilot (« is n a multiple of 10? », two keys), and a boundary test reads the kit's own files.
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rng, int, pick, shuffle } from './random';
import { createLadder, buildWave, gatePoints, SUMMARY } from './ladder';
import { createTrainer, SESSION, sessionStars } from './trainer';
import {
  answered,
  forgotten,
  allQuestions,
  sittingStars,
  sittingPassed,
  PASS,
  pace,
  appreciation,
  tick,
  timeUp,
} from './sitting';
import { createBankSittings, shareQuarters, examPoints, keysOfPoints, DEV_SHEET_KEY, BANK_LEVELS } from './bankSitting';
import { createJourney, emptyExam, examLevelOpen } from './journey';
import { createEvidence, counts, guardEvidence } from './evidence';

// ── a toy lesson ──
const isRight = (w, n) => (w.type === 'tens' ? n % 10 === 0 : n % 2 === 1);
const generators = {
  tens: (rand, { max }) => {
    const right = 10 * int(rand, 1, max);
    return buildWave(rand, { type: 'tens', key: 'tens', a: right }, right, [right + 1, right + 3, right - 4]);
  },
  odd: (rand) => buildWave(rand, { type: 'odd', key: 'odd', a: 0 }, pick(rand, [3, 5, 7]), [2, 4, 6, 8]),
  never: () => null,
};
const nodes = [
  {
    id: 'tens',
    levels: [
      { speed: 6, mix: [['tens', { max: 5 }]] },
      { game: 'shop', mission: 'coins' },
    ],
  },
  { id: 'odd', levels: [{ speed: 6, mix: [['odd', {}]] }] },
  {
    id: SUMMARY,
    levels: [
      {
        speed: 7,
        mix: [
          ['tens', { max: 9 }],
          ['odd', {}],
        ],
      },
    ],
  },
];
const ladder = createLadder({ nodes, generators, isRight });
const levels = [
  { n: 1, title: 'one', sheets: 1 },
  { n: 2, title: 'two', sheets: 2 },
];
// a toy BANK, in the shape of content/practice (EXERCISE_CONTRACT.md « the exam sheet »)
const sheet = (id, points, questions, statement = { content: 'On considère le nombre 30.' }) => ({
  id,
  metadata: { title: id, estimatedMinutes: 4, exam: { kind: 'adapted', badge: null, heading: 'Exercice', points } },
  statement,
  questions,
});
const lp = (code) => [{ code, role: 'primary' }];
const BANK = {
  1: [
    sheet('ex-a', '02', [
      {
        id: 'q1',
        step: '01',
        statement: 'Le nombre 30 est-il un multiple de 10 ?',
        answerType: 'choice',
        learningPoints: lp('g_toy_P1'),
        choices: [
          { id: 'A', content: 'Oui', isCorrect: true },
          { id: 'B', content: 'Non', isCorrect: false },
        ],
        solution: { lines: ['$30 = 10 \\times 3$'], result: 'Oui' },
        hints: [{ id: 'h1', content: 'Divise par 10.' }],
      },
      {
        id: 'q2',
        step: '02',
        statement: 'Le prix :',
        answerType: 'rational',
        expectedAnswer: '450',
        learningPoints: lp('g_toy_P2'),
        answerFormat: 'Un nombre, en euros (€)',
        solution: { lines: ['$30 \\times 15 = 450$ €'], result: '450 \\text{ €}' },
        hints: [],
      },
    ]),
    sheet('ex-b', '02', [
      {
        id: 'q1',
        step: '01',
        statement: 'Les diviseurs de 6 :',
        answerType: 'integerSet',
        expectedAnswer: '1;2;3;6',
        learningPoints: lp('g_toy_P1'),
        solution: { lines: ['$6 = 1 \\times 6 = 2 \\times 3$'] },
        hints: [],
      },
      {
        id: 'q2',
        step: '02',
        statement: 'Montrer que 6 est un multiple de 3.',
        answerType: 'selfCheck',
        learningPoints: lp('g_toy_P1'),
        solution: { lines: ['$6 = 3 \\times 2$'] },
        hints: [],
      },
    ]),
    // a type the sitting does not draw: this sheet stays in « /espace/pratique », never in a sitting
    sheet('ex-z', '02', [
      {
        id: 'q1',
        step: '01',
        statement: 'Choisis',
        answerType: 'multiChoice',
        learningPoints: lp('g_toy_P1'),
        choices: [{ id: 'A', content: '1', isCorrect: true }],
        solution: { lines: ['1'] },
      },
    ]),
  ],
  2: [
    sheet(
      'ex-c',
      '03',
      [
        {
          id: 'q1',
          step: '01',
          statement: 'x =',
          answerType: 'rational',
          expectedAnswer: '3',
          learningPoints: lp('g_toy_P2'),
          solution: { lines: ['3'] },
        },
      ],
      { content: 'L’égalité :', formulas: ['30 = 10 \\times x'] },
    ),
    sheet('ex-d', '02,5', [
      {
        id: 'q1',
        step: '01',
        statement: 'a',
        answerType: 'rational',
        expectedAnswer: '1',
        learningPoints: lp('g_toy_P1'),
        solution: { lines: ['1'] },
      },
      {
        id: 'q2',
        step: '01',
        sub: 'b',
        statement: 'b',
        answerType: 'rational',
        expectedAnswer: '2',
        learningPoints: lp('g_toy_P1'),
        solution: { lines: ['2'] },
      },
    ]),
  ],
};
const sittings = createBankSittings({ lesson: 'toy', levels, load: async (code, n) => BANK[n] });
const keyOf = { g_toy_P1: 'tens', g_toy_P2: 'odd' };
const journey = createJourney({ keys: ['tens', 'odd'], ladder, levels, stages: 3, cards: 5 });

describe('kit/random', () => {
  it('replays the same sequence for the same seed', () => {
    const a = rng(42);
    const b = rng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(shuffle(rng(1), [1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4]);
    for (let i = 0; i < 50; i += 1) expect(int(rng(i), 3, 5)).toBeGreaterThanOrEqual(3);
  });
});

describe('kit/ladder — with a toy lesson', () => {
  it('lists the levels in playing order and counts three stars each', () => {
    expect(ladder.LEVEL_ORDER.map((x) => x.id)).toEqual(['tens:1', 'tens:2', 'odd:1', `${SUMMARY}:1`]);
    expect(ladder.MAX_PRACTICE_STARS).toBe(12);
    expect(ladder.isCase(0, 1)).toBe(true);
    expect(ladder.isCase(0, 0)).toBe(false);
  });

  it('makes fair waves only: three different gates, exactly one right', () => {
    for (let seed = 1; seed <= 40; seed += 1)
      for (const w of ladder.makeRun(rng(seed), 2, 0)) {
        expect(new Set(w.gates).size).toBe(3);
        expect(w.gates.filter((n) => isRight(w, n))).toEqual([w.gates[w.good]]);
      }
    expect(() => ladder.waveOf(rng(1), 'never', {})).toThrow();
  });

  it('opens a node with its key, a level after the one before it, the summary after every first level', () => {
    expect(ladder.nodeOpen(0, [], {})).toBe(false);
    expect(ladder.nodeOpen(0, ['tens'], {})).toBe(true);
    expect(ladder.levelOpen(0, 1, ['tens'], {})).toBe(false);
    expect(ladder.levelOpen(0, 1, ['tens'], { 'tens:1': { stars: 1 } })).toBe(true);
    expect(ladder.nodeOpen(2, ['tens', 'odd'], { 'tens:1': { stars: 1 } })).toBe(false);
    const both = { 'tens:1': { stars: 1 }, 'odd:1': { stars: 3 } };
    expect(ladder.nodeOpen(2, ['tens', 'odd'], both)).toBe(true);
    expect(ladder.nextLevel(['tens', 'odd'], both).id).toBe('tens:2');
    expect(ladder.practiceStars(both)).toBe(4);
    expect([gatePoints(0), gatePoints(3), gatePoints(5)]).toEqual([100, 150, 200]);
  });
});

describe('kit/trainer — with a toy lesson', () => {
  it('asks six questions in the order game, game, exam, game, exam, exam, from the plan of the card', () => {
    const kinds = { q: (rand, format, tag) => ({ format, kind: 'q', tag }) };
    const plan = (tag) => SESSION.map(() => ['q', tag]);
    const trainer = createTrainer({
      kinds,
      plans: { a: plan('a'), mix: plan('mix') },
      planOf: { card: 'a' },
      fallback: 'mix',
    });
    expect(trainer.makeSession(rng(1), 'card').map((q) => q.format)).toEqual(SESSION);
    expect(trainer.makeSession(rng(1), 'card')[0].tag).toBe('a');
    expect(trainer.makeSession(rng(1), 'unknown-card')[0].tag).toBe('mix');
    expect([0, 2, 4, 6].map(sessionStars)).toEqual([0, 1, 2, 3]);
  });
});

describe('kit/bankSitting — a toy bank, served as it is', () => {
  const right = { e1q1: { choiceId: 'A' }, e1q2: { value: '450' } };
  it('waits for its bank, then shows each level its minutes and points', async () => {
    expect(sittings.ready()).toBe(false);
    expect(sittings.levelPoints(levels[0])).toBe(null);
    await sittings.prepare();
    expect(sittings.ready()).toBe(true);
    expect(sittings.levelPoints(levels[0])).toBe('2');
    expect(sittings.levelPoints(levels[1])).toBe('5,5');
    expect(sittings.levelMinutes(levels[1])).toBe('8');
  });

  it('serves a sheet whole: its statement, its steps, its points shared in quarters; a « Montrer que » is for the paper', () => {
    const s = sittings.makeSubject(rng(1), 1, ['ex:ex-b'], keyOf);
    expect(s.exercises.map((e) => e.bankId)).toEqual(['ex-a']); // the sheet already missed is left out
    const [q1, q2] = s.exercises[0].questions;
    expect([q1.points, q2.points]).toEqual([1, 1]);
    expect([q1.key, q2.key]).toEqual(['tens', 'odd']);
    expect(s.title).toBe('Brevet blanc — palier 1');
    expect(s.exercises[0].title).toBe('Exercice 1');
    expect(shareQuarters(2.5, 3)).toEqual([1, 0.75, 0.75]);
    expect(examPoints('02,5')).toBe(2.5);
    const b = sittings.makeSubject(rng(1), 1, ['ex:ex-a'], keyOf).exercises[0];
    expect(b.bankId).toBe('ex-b');
    for (let seed = 1; seed <= 20; seed += 1)
      expect(sittings.makeSubject(rng(seed), 1, [], keyOf).exercises[0].bankId).not.toBe('ex-z');
    expect(b.questions.map((q) => [q.paper, q.points])).toEqual([
      [false, 2],
      [true, 0],
    ]);
    expect(sittings.model(b.questions[1])).toEqual(['$6 = 3 \\times 2$']);
  });

  it('marks with the practice evaluator: right, partly right (half), wrong, empty', () => {
    const s = sittings.makeSubject(rng(1), 1, ['ex:ex-b'], keyOf);
    expect(sittings.totalMark(s, right)).toBe(2);
    expect(sittings.totalMark(s, {})).toBe(0);
    expect(sittings.totalMark(s, { ...right, e1q1: { choiceId: 'B' } })).toBe(1);
    const b = sittings.makeSubject(rng(1), 1, ['ex:ex-a'], keyOf);
    expect(sittings.totalMark(b, { e1q1: { value: '1 ; 2 ; 3 ; 6' } })).toBe(2);
    expect(sittings.totalMark(b, { e1q1: { value: '1; 2' } })).toBe(1); // a strict subset: half
    expect(answered(b.exercises[0].questions[1], { value: 'x' })).toBe(false); // the paper step has no box
    expect(answered(b.exercises[0].questions[0], { value: ' ' })).toBe(false);
  });

  it('shows the bank’s money as the bank writes it (euros, no rewrite), and nothing of the source', () => {
    const s = sittings.makeSubject(rng(1), 1, ['ex:ex-b'], keyOf);
    const q = s.exercises[0].questions[1];
    // a result that is a formula keeps its dollars; the euro sign is the bank's own
    expect(sittings.model(q)).toEqual(['$30 \\times 15 = 450$\u00a0€', '$450 \\text{ €}$']);
    expect(q.shown.answerFormat).toBe('Un nombre, en euros (€)');
    expect(q.shown.answerFormat).toBe(q.bank.answerFormat);
    expect(JSON.stringify(s)).not.toMatch(/"source"|DA\b|\u062F\u062C/);
    expect(sittings.guide(s.exercises[0].questions[0])).toEqual(['Divise par 10.']);
    // a result that is WORDS is a line of words, never a formula
    expect(sittings.model(s.exercises[0].questions[0])).toEqual(['$30 = 10 \\times 3$', 'Oui']);
  });

  it('heads a sheet « Exercice n », or « Problème » when the bank heads it so; the levels carry the practice space names', async () => {
    const pb = createBankSittings({
      lesson: 'toy',
      levels: [{ n: 1, title: 'one', sheets: 2 }],
      load: async () => [
        {
          ...BANK[1][0],
          id: 'p1',
          metadata: { ...BANK[1][0].metadata, exam: { ...BANK[1][0].metadata.exam, heading: 'Problème' } },
        },
        { ...BANK[1][0], id: 'p2' },
      ],
    });
    await pb.prepare();
    const titles = pb.makeSubject(rng(3), 1, [], keyOf).exercises.map((e) => e.title);
    expect(titles).toContain('Problème');
    expect(titles.some((t) => /^Exercice [12]$/.test(t))).toBe(true);
    expect(BANK_LEVELS.map((L) => L.title)).toEqual([
      'Je reprends les bases',
      'J’applique',
      'Je m’exerce',
      'J’approfondis',
      'Défi',
    ]);
  });

  it('an EMPTY level is never sat: no subject, the level unavailable — and a subject with no points is no subject', async () => {
    const none = createBankSittings({ lesson: 'toy', levels, load: async () => [] });
    await none.prepare();
    expect(none.available(1)).toBe(false);
    expect(none.makeSubject(rng(1), 1, [], keyOf)).toBe(null);
    // a lesson missing from the exercise index: its loader finds no id
    const missing = createBankSittings({ lesson: 'toy', levels, load: async () => [undefined, null] });
    await missing.prepare().catch(() => {});
    expect(missing.makeSubject(rng(1), 1, [], keyOf)).toBe(null);
    // sheets written on paper only: nothing can be marked
    const paper = createBankSittings({ lesson: 'toy', levels, load: async (c, n) => (n === 1 ? [BANK[1][1]] : []) });
    await paper.prepare();
    const only = createBankSittings({
      lesson: 'toy',
      levels: [{ n: 1, title: 'one', sheets: 1 }],
      load: async () => [{ ...BANK[1][1], questions: [BANK[1][1].questions[1]] }],
    });
    await only.prepare();
    expect(only.available(1)).toBe(false);
    expect(only.makeSubject(rng(1), 1, [], keyOf)).toBe(null);
    expect(paper.available(1)).toBe(true);
    expect(sittings.available(1)).toBe(true);
    expect(sittings.sheetIds(1)).toEqual(['ex-a', 'ex-b']); // ex-z (a type the sitting does not draw) is not served
    // total 0 is never passed: no star, no appreciation, no promotion
    expect([sittingPassed(0, 0), sittingStars(0, 0), appreciation(0, 0)]).toEqual([false, 0, '']);
    const { exam, result } = journey.applySitting(emptyExam(), 1, 0, 0, []);
    expect(result).toMatchObject({ passed: false, stars: 0, promoted: false, nextLevel: null, finished: false });
    expect(examLevelOpen(exam, 2)).toBe(false);
  });

  describe('the DEV hook: a walk chooses its sheet', () => {
    const store = {};
    afterEach(() => {
      vi.unstubAllEnvs();
      delete globalThis.localStorage;
    });
    const stub = (id) => {
      store[DEV_SHEET_KEY] = id;
      globalThis.localStorage = { getItem: (k) => store[k] ?? null };
    };

    it('in development, the sheet named in localStorage is drawn (when it belongs to the level)', () => {
      stub('ex-b');
      for (let seed = 1; seed <= 10; seed += 1)
        expect(sittings.makeSubject(rng(seed), 1, ['ex:ex-b'], keyOf).exercises[0].bankId).toBe('ex-b');
      stub('ex-c'); // a sheet of another level: ignored
      expect(['ex-a', 'ex-b']).toContain(sittings.makeSubject(rng(1), 1, [], keyOf).exercises[0].bankId);
    });

    it('never in a production build', () => {
      vi.stubEnv('DEV', false);
      stub('ex-b');
      for (let seed = 1; seed <= 10; seed += 1)
        expect(sittings.makeSubject(rng(seed), 1, ['ex:ex-b'], keyOf).exercises[0].bankId).toBe('ex-a');
    });
  });

  it('the clock is pure, and time up hands the copy in ONCE (a StrictMode double call of the updater changes nothing)', () => {
    let left = 3;
    let handed = false;
    let sent = 0;
    for (let s = 0; s < 6; s += 1) {
      tick(left); // React may call the updater a first time and drop the result
      left = tick(left);
      // the effect on `left`, which StrictMode may also run twice
      for (let k = 0; k < 2; k += 1)
        if (timeUp('sit', left, handed)) {
          handed = true;
          sent += 1;
        }
    }
    expect([left, sent]).toEqual([0, 1]);
    expect(timeUp('read', 0, false)).toBe(false);
    const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'ExamSitting.jsx'), 'utf8');
    expect(src).toMatch(/setLeft\(tick\)/);
    expect(src).not.toMatch(/setLeft\(\(n\) =>[\s\S]{0,120}handIn/);
  });

  it('puts what was missed first, and hands in only what he answered, for the server to judge', () => {
    const s = sittings.makeSubject(rng(4), 2, [], keyOf);
    expect(s.exercises).toHaveLength(2);
    expect(s.total).toBe(5.5);
    const qs = allQuestions(s);
    const full = Object.fromEntries(qs.map((q) => [q.id, { value: q.bank.expectedAnswer }]));
    expect(sittings.totalMark(s, full)).toBe(5.5);
    const one = { [qs[0].id]: full[qs[0].id] };
    const weak = sittings.weakKinds(s, one);
    expect(weak.filter((w) => !w.startsWith('ex:')).length).toBeGreaterThan(0);
    let n = 0;
    const sheetOut = sittings.sheetOf(s, one, () => `u${(n += 1)}`);
    expect(sheetOut.items).toHaveLength(1);
    expect(sheetOut.items[0]).toMatchObject({
      exerciseId: s.exercises[0].bankId,
      questionId: 'q1',
      outcome: 'correct',
    });
    expect(sheetOut).toMatchObject({ lesson: 'toy', level: 2, sessionId: expect.any(String) });
    expect(sittings.tallyOf(s, one)).toEqual([{ key: qs[0].key, ok: true }]);
    expect(forgotten(s, one, 0)).toEqual([1]);
    expect(forgotten(s, one, 1)).toEqual([]);
    expect([sittingStars(10, 10), sittingStars(9, 10), sittingStars(8, 10), sittingStars(7.9, 10)]).toEqual([
      3, 2, 1, 0,
    ]);
    expect(PASS).toBe(0.8);
    expect(pace(30, 60)).toBe(0.5);
    const evidence = createEvidence({ grade: 'g', points: { tens: 'P1', odd: 'P2' } });
    expect(keysOfPoints('toy', { keys: ['tens', 'odd'], evidence })).toEqual(keyOf);
  });
});

describe('kit/journey — with a toy lesson', () => {
  const played = { 'tens:1': { stars: 1 }, 'odd:1': { stars: 1 } };
  it('opens the exam space once every key is held and its first run passed', () => {
    expect(journey.examOpen(['tens'], played)).toBe(false);
    expect(journey.examOpen(['tens', 'odd'], { 'tens:1': { stars: 1 } })).toBe(false);
    expect(journey.examOpen(['tens', 'odd'], played)).toBe(true);
  });

  it('promotes at 80 %, keeps what to work on after a miss, and finishes on the last level', () => {
    let { exam, result } = journey.applySitting(emptyExam(), 1, 1, 2, ['count']);
    expect(result).toMatchObject({ passed: false, weak: ['count'], fails: 1, nextLevel: null });
    expect(examLevelOpen(exam, 2)).toBe(false);
    ({ exam, result } = journey.applySitting(exam, 1, 2, 2, []));
    expect(result).toMatchObject({ passed: true, promoted: true, nextLevel: 2, finished: false });
    expect(examLevelOpen(exam, 2)).toBe(true);
    expect(journey.nextExamLevel(exam)).toBe(2);
    ({ exam, result } = journey.applySitting(exam, 2, 3, 3, []));
    expect(result.finished).toBe(true);
    expect(journey.nextExamLevel(exam)).toBe(null);
  });

  it('shows the road with the numbers of THIS lesson and gives one next step', () => {
    const p = journey.lessonProgress({ stage: 1, openKeys: ['tens'], practice: played, know: { read: ['a'] } });
    const nbsp = (label) => label.replace(/ /g, String.fromCharCode(160));
    expect(p.road.map((r) => r.label)).toEqual(['1 / 3', '1 / 2', '2 / 12', '0 / 2', '1 / 5'].map(nbsp));
    expect(p.rows.map((r) => r.game.max)).toEqual([6, 3]);
    expect(journey.nextStep({ stage: 0 })).toEqual({ do: 'story' });
    expect(journey.nextStep({ stage: 3, openKeys: ['tens', 'odd'], practice: {} })).toMatchObject({
      do: 'game',
      node: 0,
    });
    expect(journey.nextStep({ stage: 3, openKeys: ['tens', 'odd'], practice: played })).toEqual({
      do: 'exam',
      level: 1,
    });
    const failed = { ...emptyExam(), fails: { 1: 2 } };
    const tally = { tens: { ok: 3, n: 3 }, odd: { ok: 0, n: 2 } };
    expect(journey.nextStep({ stage: 3, openKeys: ['tens', 'odd'], practice: played, exam: failed, tally })).toEqual({
      do: 'train',
      key: 'odd',
      level: 1,
    });
  });
});

describe('kit/evidence — with a toy lesson', () => {
  it('counts a first try without help only, and names the savoir-faire of the key', () => {
    expect(counts({ firstTry: true, helped: false })).toBe(true);
    expect(counts({ firstTry: true, helped: true })).toBe(false);
    expect(counts({ firstTry: false })).toBe(false);
    const ev = createEvidence({ grade: '2am', points: { tens: 'P2' } });
    expect(ev.learningPointOf('some-lesson', 'tens')).toBe('2am_some-lesson_P2');
    expect(ev.payloadOf('some-lesson', 'case', { key: 'tens', claim: { n: 30 } }, 'id-1')).toEqual({
      attemptId: 'id-1',
      learningPoint: '2am_some-lesson_P2',
      context: 'case',
      claim: { n: 30 },
    });
    expect(ev.payloadOf('some-lesson', 'case', { key: 'odd', claim: {} }, 'id-2')).toBe(null);
    expect(ev.payloadOf('some-lesson', 'case', null, 'id-3')).toBe(null);
  });

  it('never sends a TRUE claim for an answer the lesson checks as wrong (the safety net of the trainer)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const half = { key: 'tens', claim: { kind: 'divisible', a: 30, b: 10, fits: true } };
    expect(guardEvidence(half, false)).toBe(null);
    expect(warn).toHaveBeenCalled();
    expect(guardEvidence(half, true)).toBe(half);
    const wrong = { key: 'tens', claim: { kind: 'divisible', a: 30, b: 10, fits: false } };
    expect(guardEvidence(wrong, false)).toBe(wrong); // a wrong answer is still sent: a false claim is evidence too
    expect(guardEvidence(null, false)).toBe(null);
    warn.mockRestore();
  });
});

describe('the kit boundary', () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const files = fs.readdirSync(here).filter((f) => /\.jsx?$/.test(f) && !/\.test\./.test(f));

  it('no kit file imports a lesson or a world', () => {
    for (const file of files) {
      const text = fs.readFileSync(path.join(here, file), 'utf8');
      const specs = [...text.matchAll(/from\s*'([^']+)'/g)].map((m) => m[1]);
      for (const spec of specs) {
        expect(spec, file).not.toMatch(/divisorIsles|\/moyen\/|\/worlds\//);
      }
    }
  });

  it('no kit file writes the id of a lesson or of a key of the pilot', () => {
    for (const file of files) {
      const text = fs.readFileSync(path.join(here, file), 'utf8');
      expect(text, file).not.toMatch(
        /qasim-adad-tabii|qasim-baqi|qasim-jidaa|siyagh-mutakafia|wahid-wa-nafsuh|divisor-isles/,
      );
    }
  });
});
