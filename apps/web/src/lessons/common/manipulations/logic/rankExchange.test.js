import { describe, it, expect } from 'vitest';
import { digitsByRank, valueOfCounts } from '@smarter-academy/core/arithmetic/placeValue.js';
import * as L from './rankExchange';
import { LEVELS } from '../levels';

const B = LEVELS['rank-exchange'].beginner.numbers;
const A = LEVELS['rank-exchange'].advanced.numbers;

/** Un générateur pseudo-aléatoire déterministe (mulberry32). */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Emballer jusqu'au bout, dans un ordre aléatoire de colonnes, en vérifiant l'invariant à chaque geste. */
function packAll(s, rand) {
  const v0 = L.valueOf(s);
  let guard = 0;
  while (!L.writable(s) && guard < 10000) {
    guard += 1;
    const full = Object.keys(s.counts).map(Number).filter((k) => s.counts[k] >= 10 && k < s.columns - 1);
    if (full.length === 0) break;
    const k = full[Math.floor(rand() * full.length)];
    s = L.tie(s, k, 10);
    expect(L.valueOf(s)).toBe(v0);
    s = L.carry(s, k + 1);
    expect(L.valueOf(s)).toBe(v0);
  }
  return s;
}

describe('rank-exchange — pack', () => {
  it('the three prediction cards are distinct and computed from the start (75, 2577, 1132437)', () => {
    const p = L.packCards(B.start);
    expect(p.cards).toEqual([75, 2577, 1132437]);
    expect(p.concat).toBe(1132437);
    expect(p.sum).toBe(75);
    expect(p.right).toBe(2577);
  });

  it('no gesture before a prediction; a prediction is judged by the board when every column is writable', () => {
    let s = L.init({ world: 'pencils', tasks: ['pack', 'unpack'], start: B.start, n: B.n, rank: B.rank });
    expect(L.needsPrediction(s)).toBe(true);
    expect(L.tie(s, 0, 10)).toBe(s);
    s = L.choose(s, 1132437);
    expect(L.needsPrediction(s)).toBe(false);
    s = packAll(s, rng(1));
    expect(L.taskDone(s)).toBe(true);
    expect(L.writtenOf(s)).toBe('2 577');
    expect(s.results.pack).toEqual({ value: 2577, predict: 1132437, ok: false });
    const pred = s.trials.at(-1);
    expect(pred).toMatchObject({ task: 'pack', kind: 'predict', ok: false, value: 2577 });
  });

  it('property: ANY start state, ANY pack order ends on digitsByRank(value), the value never changes', () => {
    const rand = rng(42);
    for (let i = 0; i < 300; i += 1) {
      const start = { 3: Math.floor(rand() * 6), 2: Math.floor(rand() * 41), 1: Math.floor(rand() * 41), 0: Math.floor(rand() * 41) };
      const value = valueOfCounts(start);
      if (value >= 10000) continue;
      let s = L.init({ world: 'pencils', tasks: ['pack'], start });
      s = L.choose(s, L.packCards(start).cards[0]);
      s = packAll(s, rand);
      expect(L.writable(s)).toBe(true);
      expect(L.valueOf(s)).toBe(value);
      const d = digitsByRank(value);
      for (let k = 0; k < 4; k += 1) expect(s.counts[k], `${JSON.stringify(start)} rank ${k}`).toBe(d[k] ?? 0);
    }
  });

  it('refusals carry their kind and the student\'s numbers: a short pack, a wrong column', () => {
    let s = L.choose(L.init({ world: 'pencils', tasks: ['pack'], start: B.start }), 2577);
    const short = L.tie(s, 0, 7);
    expect(short.last).toMatchObject({ type: 'refused', refused: 'short-pack', rank: 0, n: 7 });
    expect(short.counts).toEqual(s.counts);
    expect(short.trials.at(-1)).toMatchObject({ kind: 'pack', ok: false, refused: 'short-pack' });
    s = L.tie(s, 0, 10);
    expect(s.tray).toEqual({ from: 0, to: 1 });
    expect(L.writtenOf(s)).toBe('');
    for (const to of [0, 2, 3]) {
      const w = L.carry(s, to);
      expect(w.last).toMatchObject({ refused: 'wrong-column', to, need: 1 });
      expect(w.tray).toEqual({ from: 0, to: 1 });
    }
    expect(L.tie(s, 1, 10)).toBe(s); // one tied object at a time
    s = L.carry(s, 1);
    expect(s.counts).toMatchObject({ 0: 27, 1: 25 });
    expect(s.trials.at(-1)).toMatchObject({ kind: 'pack', ok: true, rank: 0, value: 2577 });
  });
});

describe('rank-exchange — unpack', () => {
  it('the three prediction cards (1, 20, 201) and the money cards (1, 3, 13)', () => {
    expect(L.unpackCards(2017, 1).cards).toEqual([1, 20, 201]);
    expect(L.unpackCards(1345, 2).cards).toEqual([1, 3, 13]);
  });

  it('opening cartons and boxes ends on 201 packs and 7 pencils; packs and pencils cannot be opened', () => {
    let s = L.init({ world: 'pencils', tasks: ['pack', 'unpack'], start: B.start, n: B.n, rank: B.rank });
    s = packAll(L.choose(s, 2577), rng(3));
    s = L.nextTask(s);
    expect(L.taskOf(s)).toBe('unpack');
    expect(s.counts).toEqual({ 0: 7, 1: 1, 2: 0, 3: 2 });
    s = L.choose(s, 201);
    expect(L.open(s, 1)).toBe(s);
    expect(L.open(s, 0)).toBe(s);
    expect(L.canOpenAll(s, 3)).toBe(false);
    s = L.open(s, 3);
    s = L.open(s, 3);
    expect(s.counts[2]).toBe(20);
    expect(L.valueOf(s)).toBe(2017);
    s = L.open(s, 2);
    s = L.open(s, 2);
    expect(L.canOpenAll(s, 2)).toBe(true);
    s = L.openAll(s, 2);
    expect(s.counts).toEqual({ 0: 7, 1: 201, 2: 0, 3: 0 });
    expect(L.taskDone(s)).toBe(true);
    expect(s.results.unpack).toMatchObject({ count: 201, predict: 201, ok: true, digit: 1, rest: 7 });
    expect(L.unpackLine(2017, 1)).toBe('2017 = 201 × 10 + 7');
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('money: 1345 DA into 100 DA notes = 13 notes and 45 DA', () => {
    let s = L.init({ world: 'money', tasks: ['unpack'], n: 1345, rank: 2 });
    s = L.open(L.choose(s, 13), 3);
    expect(L.taskDone(s)).toBe(true);
    expect(s.results.unpack).toMatchObject({ count: 13, ok: true, rest: 45 });
    expect(L.unpackLine(1345, 2)).toBe('1345 = 13 × 100 + 45');
  });
});

describe('rank-exchange — advanced tasks', () => {
  it('next from 999 needs exactly 3 packs (a cascade) and ends on 1 000', () => {
    let s = L.init({ world: 'tokens', tasks: ['next'], next: 999 });
    expect(L.columnsOf('tokens')).toBe(7);
    s = L.add(s, 0, 1);
    expect(L.writable(s)).toBe(false);
    expect(L.add(s, 0, 1)).toBe(s); // never past the target
    s = L.carry(L.tie(s, 0, 10), 1);
    s = L.carry(L.tie(s, 1, 10), 2);
    expect(L.taskDone(s)).toBe(false);
    s = L.carry(L.tie(s, 2, 10), 3);
    expect(L.taskDone(s)).toBe(true);
    expect(s.results.next).toMatchObject({ value: 1000, packs: 3 });
    expect(L.writtenOf(s)).toBe('1 000');
  });

  it('previous from 999 is one gesture', () => {
    const s = L.add(L.init({ world: 'tokens', tasks: ['previous'], next: 999 }), 0, -1);
    expect(L.taskDone(s)).toBe(true);
    expect(s.results.previous.value).toBe(998);
  });

  it('borrow from 1000: no unit to remove (refused), then exactly 3 opens', () => {
    let s = L.init({ world: 'tokens', tasks: ['borrow'], borrow: 1000 });
    const r = L.add(s, 0, -1);
    expect(r.last).toMatchObject({ refused: 'no-unit', rank: 0 });
    s = L.open(s, 3);
    s = L.open(s, 2);
    s = L.open(s, 1);
    s = L.add(s, 0, -1);
    expect(L.taskDone(s)).toBe(true);
    expect(s.results.borrow).toMatchObject({ value: 999, opens: 3 });
  });

  it('the dictation judge accepts only the exact value, on a writable board', () => {
    let s = L.init({ world: 'tokens', tasks: ['dictation'], dictation: A.dictation });
    const set = (st, digits) => {
      let x = st;
      for (const [k, d] of Object.entries(digits)) for (let i = 0; i < d; i += 1) x = L.add(x, Number(k), 1);
      return x;
    };
    let w = L.check(set(s, { 2: 7, 1: 6, 0: 5 }));
    expect(w.last).toMatchObject({ refused: 'wrong-board', board: 765, target: 7065 });
    w = L.check(set(s, { 3: 7, 1: 6, 0: 15 }));
    expect(w.last).toMatchObject({ refused: 'overflow', rank: 0, count: 15 });
    s = L.check(set(s, { 3: 7, 1: 6, 0: 5 }));
    expect(s.last).toMatchObject({ type: 'answer', value: 7065, finished: false });
    expect(s.di).toBe(1);
    expect(L.valueOf(s)).toBe(0);
    s = L.check(set(s, digitsByRank(4908732)));
    expect(L.taskDone(s)).toBe(true);
    expect(s.results.dictation).toEqual([7065, 4908732]);
  });

  it('valueOf is invariant under every tie, carry and open', () => {
    const rand = rng(7);
    let s = L.init({ world: 'tokens', tasks: ['dictation'] });
    for (let i = 0; i < 60; i += 1) s = L.add(s, Math.floor(rand() * 4), 1);
    const v = L.valueOf(s);
    for (let i = 0; i < 400; i += 1) {
      const k = Math.floor(rand() * 7);
      const before = L.valueOf(s);
      s = rand() < 0.5 ? L.tie(s, k, 10) : L.carry(s, k);
      expect(L.valueOf(s)).toBe(before);
    }
    expect(L.valueOf(s)).toBe(v);
  });

  it('readings for the discovery and the rule', () => {
    expect(L.decomposeLine(2017)).toBe('2017 = 2 × 1000 + 1 × 10 + 7');
    expect(L.digitCountPairs(2017)).toEqual([
      { rank: 0, digit: 7, count: 2017 }, { rank: 1, digit: 1, count: 201 }, { rank: 2, digit: 0, count: 20 }, { rank: 3, digit: 2, count: 2 },
    ]);
    expect(L.withoutZeros(7065)).toBe(765);
    expect(L.zeroCount(4908732)).toBe(1);
  });

  it('« إعادة » restarts the task in progress, keeps the finished ones', () => {
    let s = L.init({ world: 'tokens', tasks: A.tasks, next: A.next, borrow: A.borrow, dictation: A.dictation });
    s = L.carry(L.tie(L.add(s, 0, 1), 0, 10), 1);
    s = L.restartTask(s);
    expect(L.valueOf(s)).toBe(999);
    s = L.carry(L.tie(L.add(s, 0, 1), 0, 10), 1);
    s = L.carry(L.tie(L.carry(L.tie(s, 1, 10), 2), 2, 10), 3);
    s = L.nextTask(s);
    expect(L.taskOf(s)).toBe('previous');
    s = L.restartTask(s);
    expect(s.done.next).toBe(true);
    expect(L.taskOf(s)).toBe('previous');
  });
});

describe('rank-exchange — column layout', () => {
  it('each object drawn once, inside its column, at five widths; counts ≥ 10 carry the exact-count badge', () => {
    for (const width of [40, 56, 72, 110, 180]) {
      for (const height of [120, 180, 240]) {
        for (const [world, rank] of [['pencils', 0], ['pencils', 1], ['pencils', 2], ['pencils', 3], ['tokens', 0], ['money', 2]]) {
          for (const count of [0, 1, 7, 10, 13, 37, 201]) {
            const lay = L.columnLayout({ count, width, height, aspect: L.aspectOf(world, rank), minPitch: L.pitchOf(world, rank) });
            expect(lay.shown).toBeLessThanOrEqual(count);
            expect(lay.positions).toHaveLength(lay.shown);
            expect(lay.badge).toBe(count >= 10);
            if (count > 0 && count <= 10) expect(lay.shown, `${world}/${rank} ${count} in ${width}×${height}`).toBe(count);
            const seen = new Set();
            for (const p of lay.positions) {
              expect(p.x).toBeGreaterThanOrEqual(-0.01);
              expect(p.x + lay.w).toBeLessThanOrEqual(width + 0.01);
              expect(p.y).toBeGreaterThanOrEqual(-0.01);
              expect(p.y + lay.size).toBeLessThanOrEqual(height + 0.01);
              const key = `${p.x.toFixed(2)}|${p.y.toFixed(2)}`;
              expect(seen.has(key)).toBe(false);
              seen.add(key);
            }
          }
        }
      }
    }
  });
});

describe('coachOf — le guide montre toujours le prochain geste utile', () => {
  /** Suit le guide à la lettre, geste après geste ; renvoie les ids vus. */
  function follow(init, maxSteps = 600) {
    let s = L.init(init);
    let focusCol = 0;
    const seen = [];
    for (let i = 0; i < maxSteps; i += 1) {
      const c = L.coachOf(s, { focusCol });
      if (!c) break;
      seen.push(c.id);
      if (c.id === 'predict') s = L.choose(s, L.cardsOf(s)[0]);
      else if (c.id === 'tie') s = L.tie(s, c.rank, 10);
      else if (c.id === 'carry') s = L.carry(s, c.rank);
      else if (c.id === 'open') s = L.open(s, c.rank);
      else if (c.id === 'plus') s = L.add(s, c.rank, 1);
      else if (c.id === 'minus') s = L.add(s, c.rank, -1);
      else if (c.id === 'pick') focusCol = c.rank;
      else if (c.id === 'check') s = L.check(s);
      else if (c.id === 'next-task') s = L.nextTask(s);
    }
    return { s, seen };
  }

  it('pack puis unpack (atelier des crayons) : chaque tâche se termine en suivant le guide', () => {
    const { s, seen } = follow({ world: 'pencils', tasks: ['pack', 'unpack'], start: B.start, n: B.n, rank: B.rank });
    expect(L.allDone(s)).toBe(true);
    expect(seen[0]).toBe('predict');
    expect(seen).toContain('tie');
    expect(seen).toContain('carry');
    expect(seen).toContain('open');
    expect(seen).toContain('next-task');
  });

  it('next, previous, borrow : le guide mène à la cible', () => {
    const { s, seen } = follow({ world: 'tokens', tasks: ['next', 'previous', 'borrow'], next: A.next, borrow: A.borrow });
    expect(L.allDone(s)).toBe(true);
    expect(seen).toEqual(expect.arrayContaining(['plus', 'tie', 'carry', 'minus', 'open']));
  });

  it('dictée : choisir la colonne, ± puis « تحقّق », pour chaque nombre dicté', () => {
    const { s, seen } = follow({ world: 'tokens', tasks: ['dictation'], dictation: [7065, 4908732] });
    expect(L.allDone(s)).toBe(true);
    expect(seen).toEqual(expect.arrayContaining(['pick', 'plus', 'check']));
  });

  it('money (déballage seul) et la fin : plus rien à guider une fois tout fait', () => {
    const { s } = follow({ world: 'money', tasks: ['unpack'], n: 1345, rank: 2 });
    expect(L.allDone(s)).toBe(true);
    expect(L.coachOf(s)).toBeNull();
  });

  it('ne cible que des éléments du contrat DOM', () => {
    const s = L.init({ world: 'pencils', tasks: ['pack', 'unpack'] });
    expect(L.coachOf(s).target).toBe('[data-rx-cards]');
    expect(L.coachOf(L.choose(s, L.cardsOf(s)[0]))).toMatchObject({ id: 'tie', target: '[data-rx-tie="0"]' });
  });
});
