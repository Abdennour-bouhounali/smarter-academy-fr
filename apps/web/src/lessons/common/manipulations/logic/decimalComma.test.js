import { describe, it, expect } from 'vitest';
import * as D from '@smarter-academy/core/arithmetic/decimals.js';
import * as L from './decimalComma';
import { LEVELS } from '../levels';

const B = LEVELS['decimal-comma'].beginner.numbers;
const A = LEVELS['decimal-comma'].advanced.numbers;
const MB = L.MACHINE_PRESETS.beginner;
const MA = L.MACHINE_PRESETS.advanced;

describe('decimal-comma — the value is N / 10^p, and each preset task has exactly one comma place', () => {
  it('for every digit string of ≤ 4 digits and every comma place', () => {
    let n = 0;
    for (let len = 1; len <= 4; len += 1) {
      for (let v = 0; v < 10 ** len; v += len < 4 ? 1 : 3) {
        const digits = String(v).padStart(len, '0');
        let s = L.init({ world: 'mosaic', tasks: [{ kind: 'match', digits, target: '1' }] });
        for (let p = 0; p <= len; p += 1) {
          s = L.release(s, len - p);
          const a = L.activeOf(s);
          expect(a.point).toBe(p);
          expect(L.valueOf(s)).toEqual({ n: v, k: p });
          n += 1;
        }
      }
    }
    expect(n).toBeGreaterThan(1000);
  });

  it('beginner and advanced mosaic presets: solvable, a single comma place each, no zero needed', () => {
    for (const tasks of [B.tasks, A.tasks]) {
      for (const raw of tasks) {
        const t = L.normalizeTask(raw);
        const sols = L.solutions(t);
        expect(sols, JSON.stringify(raw)).toHaveLength(1);
        expect(L.zerosNeeded(t)).toEqual({ left: 0, right: 0 });
      }
    }
    expect(L.solutions(B.tasks[0])[0].pos).toBe(1); // 2,35
    expect(L.solutions(B.tasks[1])[0].pos).toBe(0); // 0,37
    expect(L.solutions(B.tasks[2])[0].pos).toBe(0); // 0,05
    expect(L.solutions(A.tasks[0])[0].pos).toBe(1); // 3125/1000 = 3,125
    expect(L.solutions(A.tasks[1])[0].pos).toBe(1); // 605/100 = 6,05
    expect(L.solutions(A.tasks[2])[0].pos).toBe(1); // 250 → 2,5 : 2,50
  });

  it('shift tasks need exactly the documented zeros', () => {
    const need = (t) => L.zerosNeeded(t);
    expect(MB.map(need)).toEqual([{ left: 0, right: 0 }, { left: 0, right: 1 }, { left: 0, right: 0 }, { left: 1, right: 0 }]);
    expect(MA.map(need)).toEqual([{ left: 0, right: 1 }, { left: 1, right: 0 }, { left: 0, right: 0 }, { left: 1, right: 0 }]);
    expect(L.normalizeTask(MA[0]).target).toBe('143750');
    expect(L.normalizeTask(MA[1]).target).toBe('0,0437');
    expect(L.normalizeTask(MA[3]).target).toBe('0,006');
    // the spec's own examples: ×1000 of 3,5 needs two zeros on the right
    expect(L.zerosNeeded({ kind: 'shift', start: '3,5', op: '×1000' })).toEqual({ left: 0, right: 2 });
  });
});

describe('decimal-comma — gestures and verdicts', () => {
  it('mosaic: a wrong place says more or less, the right one is exact and stays solved', () => {
    let s = L.init({ world: 'mosaic', tasks: B.tasks });
    expect(L.shownOf(s)).toBe('235');
    expect(L.verdictOf(s)).toBe('more');
    expect(s.trials).toHaveLength(0); // a default is not a trial
    s = L.release(s, 0);
    expect(L.shownOf(s)).toBe('0,235');
    expect(s.last).toMatchObject({ verdict: 'less', ok: false, shown: '0,235', value: '0,235', target: '2,35' });
    s = L.release(s, 3); // back to 235 → more
    expect(s.last.verdict).toBe('more');
    expect(L.release(s, 3)).toBe(s); // a release that changes nothing is not a trial
    s = L.release(s, 1);
    expect(s.last).toMatchObject({ verdict: 'exact', ok: true, shown: '2,35' });
    expect(L.taskDone(s)).toBe(true);
    s = L.release(s, 2);
    expect(L.taskDone(s)).toBe(true); // a solved task stays solved
    expect(s.trials.every((t) => t.free === false && t.task === 0)).toBe(true);
  });

  it('mosaic: past the string the comma sticks to the end (no refusal, no trial when nothing moves)', () => {
    let s = L.init({ world: 'mosaic', tasks: B.tasks });
    expect(L.release(s, 99)).toBe(s);
    s = L.release(s, 1);
    s = L.release(s, -5);
    expect(L.activeOf(s).pos).toBe(0);
    expect(s.last.verdict).toBe('less');
  });

  it('the zero keeps an empty place: 05 → 0,05 and 0,5 are different', () => {
    let s = L.init({ world: 'mosaic', tasks: B.tasks });
    s = L.nextTask(L.release(L.nextTask(L.release(s, 1)), 0));
    expect(L.taskOf(s).digits).toBe('05');
    s = L.release(s, 1);
    expect(L.shownOf(s)).toBe('0,5');
    expect(s.last.verdict).toBe('more');
    s = L.release(s, 0);
    expect(L.shownOf(s)).toBe('0,05');
    expect(s.last.verdict).toBe('exact');
  });

  it('2,50 and 2,5 are the same amount', () => {
    let s = L.init({ world: 'mosaic', tasks: A.tasks.slice(2) });
    s = L.release(s, 1);
    expect(L.shownOf(s)).toBe('2,50');
    expect(s.last).toMatchObject({ ok: true, shown: '2,50', value: '2,5' });
  });

  it('fraction tasks are judged by the exact value', () => {
    let s = L.init({ world: 'mosaic', tasks: A.tasks });
    s = L.release(s, 0); // 0,3125
    expect(s.last.verdict).toBe('less');
    s = L.release(s, 1);
    expect(s.last).toMatchObject({ verdict: 'exact', kind: 'fraction', target: '3125/1000' });
    expect(D.fractionText(L.valueOf(s))).toBe('3125/1000');
  });

  it('machine: the comma never passes the end of the digits — nodigit, the comma stays at the end', () => {
    let s = L.init({ world: 'machine', tasks: [MB[1]] }); // 3,5 ×100 needs one zero on the right
    expect(L.shownOf(s)).toBe('3,5');
    s = L.release(s, 2);
    expect(L.shownOf(s)).toBe('35');
    expect(s.last.verdict).toBe('less');
    s = L.release(s, 3); // beyond
    expect(s.last).toMatchObject({ verdict: 'nodigit', ok: false, side: 'right' });
    expect(L.activeOf(s).pos).toBe(2);
    expect(L.coachOf(s)).toMatchObject({ id: 'zero', target: '[data-dc-zero="right"]' });
    s = L.addZero(s, 'right');
    expect(L.activeOf(s).str).toBe('350');
    expect(D.eq(L.valueOf(s), D.parse('35'))).toBe(true); // the zero changed nothing
    expect(s.last.verdict).toBe('less');
    s = L.release(s, 3);
    expect(L.shownOf(s)).toBe('350');
    expect(s.last).toMatchObject({ verdict: 'exact', ok: true, value: '350', zeros: { left: 0, right: 1 } });
    expect(L.taskDone(s)).toBe(true);
  });

  it('machine: an extra zero is never an error when the value is right; zeros are capped and removable', () => {
    let s = L.init({ world: 'machine', tasks: [MB[0]] }); // 3,5 ×10 → 35
    s = L.addZero(s, 'left');
    s = L.addZero(s, 'right');
    expect(L.activeOf(s).str).toBe('0350');
    s = L.release(s, 3);
    expect(L.shownOf(s)).toBe('035,0');
    expect(s.last).toMatchObject({ ok: true, verdict: 'exact', value: '35' });
    for (let i = 0; i < 5; i += 1) s = L.addZero(s, 'left');
    expect(L.activeOf(s).zl).toBe(L.ZERO_MAX);
    s = L.removeZero(s, 'left');
    expect(L.activeOf(s).zl).toBe(L.ZERO_MAX - 1);
    expect(L.valueOf(s)).toEqual({ n: 350, k: 1 }); // the comma stayed between the same digits
  });

  it('machine: adding a zero on the left never moves the comma off its digits', () => {
    let s = L.init({ world: 'machine', tasks: [MB[3]] }); // 3,5 ÷100 → 0,035
    const v0 = L.valueOf(s);
    s = L.addZero(s, 'left');
    expect(D.eq(L.valueOf(s), v0)).toBe(true);
    expect(L.shownOf(s)).toBe('03,5');
    s = L.release(s, 0);
    expect(L.shownOf(s)).toBe('0,035');
    expect(s.last.ok).toBe(true);
  });

  it('machine: the output starts from the input digits and the input comma', () => {
    for (const t of [...MB, ...MA]) {
      const s = L.init({ world: 'machine', tasks: [t] });
      expect(L.shownOf(s)).toBe(D.slipText(L.normalizeTask(t).digits, L.normalizeTask(t).startPoint));
      expect(L.verdictOf(s)).not.toBe('exact'); // never solved by default
    }
  });

  it('every machine and mosaic task of both levels can be solved by gestures', () => {
    for (const tasks of [B.tasks, A.tasks, MB, MA]) {
      for (const raw of tasks) {
        const w = raw.kind === 'shift' ? 'machine' : 'mosaic';
        let s = L.init({ world: w, tasks: [raw] });
        const sol = L.solutions(raw).sort((a, b) => a.zl + a.zr - b.zl - b.zr)[0];
        for (let i = 0; i < sol.zl; i += 1) s = L.addZero(s, 'left');
        for (let i = 0; i < sol.zr; i += 1) s = L.addZero(s, 'right');
        s = L.release(s, sol.pos);
        expect(L.taskDone(s), JSON.stringify(raw)).toBe(true);
      }
    }
  });

  it('restart brings back the original comma but keeps what was solved; next needs a solved task', () => {
    let s = L.init({ world: 'mosaic', tasks: B.tasks });
    expect(L.nextTask(s)).toBe(s);
    s = L.release(s, 1);
    expect(L.canNext(s)).toBe(true);
    s = L.nextTask(s);
    expect(s.ti).toBe(1);
    s = L.release(s, 1);
    s = L.restartTask(s);
    expect(L.activeOf(s).pos).toBe(2);
    expect(s.done[0]).toBe(true);
    expect(s.last).toBeNull();
  });
});

describe('decimal-comma — the free panel never counts', () => {
  it('free trials carry free: true and leave the guided progress alone', () => {
    let s = L.init({ world: 'mosaic', tasks: B.tasks });
    s = L.setFree(s, '4083');
    expect(L.isFree(s)).toBe(true);
    expect(L.shownOf(s)).toBe('4083');
    s = L.release(s, 3);
    expect(L.shownOf(s)).toBe('408,3');
    expect(s.last).toMatchObject({ free: true, verdict: null, ok: false, target: null });
    expect(L.trialEvidence(s.last).free).toBe(true);
    expect(s.done).toEqual({});
    expect(L.discoveryReady(s)).toBe(false);
    expect(L.coachOf(s)).toBeNull();
    expect(L.setFree(s, '')).toBe(s);
    expect(L.activeOf(L.setFree(s, '123456789')).core).toBe('12345');
    s = L.toGuided(s);
    expect(L.isFree(s)).toBe(false);
    expect(L.shownOf(s)).toBe('235');
  });

  it('free machine: any of the nine operators, a typed comma, judged against the operator', () => {
    let s = L.init({ world: 'machine', tasks: MB });
    s = L.setFree(s, '14,37');
    expect(L.shownOf(s)).toBe('14,37');
    for (const op of D.OPERATORS) {
      s = L.setFreeOp(s, op);
      expect(L.activeOf(s).op).toBe(op);
      expect(L.shownOf(s)).toBe('14,37');
    }
    s = L.setFreeOp(s, '×100');
    s = L.release(s, 4); // 1437
    expect(s.last).toMatchObject({ free: true, verdict: 'exact', ok: true, target: '1437' });
    expect(s.done).toEqual({});
  });

  it('no free state is left in the guided report', () => {
    let s = L.init({ world: 'mosaic', tasks: B.tasks });
    s = L.release(s, 0);
    s = L.setFree(s, '77');
    s = L.release(s, 0);
    expect(s.trials.filter((t) => !t.free)).toHaveLength(1);
    expect(L.guidedTrials(s)).toHaveLength(1);
  });
});

/* ── Le guide suivi jusqu'au bout ───────────────────────────────────────────────────────── */

/** Un élève qui ne fait que ce que le guide montre : la virgule (il essaie les espaces à tour de rôle), le zéro du bout refusé, la tâche suivante. */
function follow(s) {
  let guard = 0;
  const tried = new Set();
  const steps = [];
  while (!L.discoveryReady(s) && guard < 400) {
    guard += 1;
    const c = L.coachOf(s);
    expect(c, `no coach at step ${guard}`).not.toBeNull();
    steps.push(c.id);
    expect(c.target).toMatch(/^\[data-[a-z-]+(="[^"]+")?\]$/); // the shared coach selector convention (moyenLabsCoach.test.js)
    const a = L.activeOf(s);
    if (c.id === 'next') { s = L.nextTask(s); tried.clear(); continue; }
    if (c.id === 'zero') { s = L.addZero(s, c.target.includes('left') ? 'left' : 'right'); continue; }
    expect(['grab', 'move']).toContain(c.id);
    expect(c.target).toBe('[data-dc-comma]');
    const key = (p) => `${s.ti}|${a.zl}|${a.zr}|${p}`;
    const options = Array.from({ length: a.len + 1 }, (_, p) => p).filter((p) => !tried.has(key(p)));
    if (options.length) {
      // from the comma's current place, the nearest unexplored place (a hand moving one step at a time)
      const p = options.reduce((b, x) => (Math.abs(x - a.pos) < Math.abs(b - a.pos) ? x : b));
      tried.add(key(p));
      if (p === a.pos) tried.add(key(p));
      const before = s;
      s = L.release(s, p);
      if (s === before) tried.add(key(p));
    } else {
      // every place of this string explored: push past an end to meet the refusal
      const side = tried.has(`${s.ti}|beyondR`) ? -1 : a.len + 1;
      tried.add(`${s.ti}|${side < 0 ? 'beyondL' : 'beyondR'}`);
      s = L.release(s, side);
    }
  }
  return { s, steps, guard };
}

describe('coachOf — the guide always shows the next useful control, never where the comma ends', () => {
  it('follows to the goal on every task of both levels and both worlds', () => {
    const suites = { mosaicB: ['mosaic', B.tasks], mosaicA: ['mosaic', A.tasks], machineB: ['machine', MB], machineA: ['machine', MA] };
    for (const [name, [world, tasks]] of Object.entries(suites)) {
      const { s, steps, guard } = follow(L.init({ world, tasks }));
      expect(L.discoveryReady(s), `${name} after ${guard} steps`).toBe(true);
      expect(steps[0], name).toBe('grab');
      expect(steps.filter((x) => x === 'next')).toHaveLength(tasks.length - 1);
      if (world === 'mosaic') expect(steps).not.toContain('zero');
      expect(L.coachOf(s)).toBeNull();
    }
    const { steps } = follow(L.init({ world: 'machine', tasks: MA }));
    expect(steps).toContain('zero');
  });

  it('the zero step is shown only after a refusal, and on the side that was refused', () => {
    let s = L.init({ world: 'machine', tasks: [MB[3]] }); // ÷100 needs a left zero
    expect(L.coachOf(s).id).toBe('grab');
    s = L.release(s, 0); // 0,35 → more
    expect(L.coachOf(s).id).toBe('move');
    s = L.release(s, -1);
    expect(s.last).toMatchObject({ verdict: 'nodigit', side: 'left' });
    expect(L.coachOf(s)).toMatchObject({ id: 'zero', target: '[data-dc-zero="left"]' });
    s = L.addZero(s, 'left');
    expect(L.coachOf(s).id).toBe('move');
  });

  it('no step ever names a comma place', () => {
    const { steps } = follow(L.init({ world: 'machine', tasks: MA }));
    expect(new Set(steps)).toEqual(new Set(['grab', 'move', 'zero', 'next']));
    expect(L.coachOf(L.init({ world: 'mosaic', tasks: B.tasks }))).toEqual({ id: 'grab', target: '[data-dc-comma]', gesture: 'drag' });
  });
});

describe('blocks — the pieces equal the digits at every comma place', () => {
  it('panels, strips, tiles, shards are the digits of their ranks; the rest is grouped', () => {
    for (const digits of ['235', '37', '05', '3125', '250', '9999', '10203']) {
      for (let p = 0; p <= digits.length; p += 1) {
        const v = D.fromSlip(digits, p);
        const { groups, finer, panels } = L.blocksOf(v);
        const ranks = L.ranksOf(digits, p);
        const digitAt = (e) => ranks.find((r) => r.exp === e)?.digit ?? 0;
        const g = (kind, exp) => groups.find((x) => x.kind === kind && x.exp === exp);
        expect(g('panel', 0)?.icons ?? 0, `${digits}/${p} units`).toBe(digitAt(0));
        expect(g('strip', -1)?.icons ?? 0).toBe(digitAt(-1));
        expect(g('tile', -2)?.icons ?? 0).toBe(digitAt(-2));
        expect(g('shard', -3)?.icons ?? 0).toBe(digitAt(-3));
        const above = [1, 2, 3, 4, 5].reduce((a, e) => a + digitAt(e) * 10 ** e, 0);
        expect(g('panel', 1)?.mult ?? 0, `${digits}/${p} above`).toBe(above);
        expect(groups.filter((x) => x.kind === 'panel' && x.exp === 1).length).toBeLessThanOrEqual(1);
        // every panel counted exactly once
        const counted = groups.filter((x) => x.kind === 'panel').reduce((a, x) => a + x.count, 0);
        expect(counted, `${digits}/${p}`).toBe(panels);
        if (p <= 3) expect(finer).toBeNull();
      }
    }
  });
  it('pieceList names the amounts', () => {
    expect(L.pieceList(D.parse('2,35'))).toEqual([{ kind: 'panel', count: 2 }, { kind: 'strip', count: 3 }, { kind: 'tile', count: 5 }]);
    expect(L.pieceList(D.parse('235'))).toEqual([{ kind: 'panel', count: 235 }]);
    expect(L.pieceList(D.parse('0,05'))).toEqual([{ kind: 'tile', count: 5 }]);
  });
});

describe('slip layout — swept at five widths', () => {
  it('every tile and gap fits, the gap centres are inside, nearestGap round-trips', () => {
    for (const width of [300, 480, 640, 760, 1000]) {
      for (let len = 1; len <= 11; len += 1) {
        const lay = L.slipLayout({ width, len });
        expect(lay.tileW).toBeGreaterThanOrEqual(30);
        expect(lay.width, `${width}/${len}`).toBeLessThanOrEqual(Math.max(width, len * 45 + 15));
        for (let j = 0; j <= len; j += 1) {
          expect(lay.nearestGap(lay.gapCenter(j))).toBe(j);
          expect(lay.gapCenter(j)).toBeGreaterThanOrEqual(0);
          expect(lay.gapCenter(j)).toBeLessThanOrEqual(lay.width);
        }
        for (let i = 0; i < len; i += 1) {
          expect(lay.tileLeft(i)).toBeGreaterThan(lay.gapCenter(i));
          expect(lay.tileLeft(i) + lay.tileW).toBeLessThan(lay.gapCenter(i + 1) + 0.01);
        }
        expect(lay.nearestGap(-lay.pitch)).toBe(-1);
        expect(lay.nearestGap(lay.width + lay.pitch)).toBe(len + 1);
      }
    }
  });
});

describe('discovery witnesses use the student’s own boards', () => {
  it('sameDigitsPair: more decimals, smaller value', () => {
    let s = L.init({ world: 'mosaic', tasks: B.tasks });
    const fallback = L.sameDigitsPair(s);
    expect(fallback.wide.point).toBe(3);
    expect(fallback.narrow.point).toBe(0);
    s = L.release(L.release(s, 0), 2);
    const p = L.sameDigitsPair(s);
    expect(p.wide).toMatchObject({ point: 3, shown: '0,235' });
    expect(p.narrow).toMatchObject({ point: 1, shown: '23,5' });
    expect(D.cmp(D.parse(p.wide.value), D.parse(p.narrow.value))).toBe(-1);
  });
  it('machineWitness: the task that needed the fewest zeros', () => {
    const w = L.machineWitness(L.init({ world: 'machine', tasks: MB }));
    expect(w.fewest.zeros).toEqual({ left: 0, right: 0 });
    expect(w.first.op).toBe('×10');
  });
});
