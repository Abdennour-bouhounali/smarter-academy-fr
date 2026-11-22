import { describe, it, expect } from 'vitest';
import * as B from '@smarter-academy/core/arithmetic/brackets.js';
import * as L from './likeTerms';

const collect = (level = 'beginner') => L.init({ world: 'collect', scaffold: level === 'beginner', level });
const brackets = (tasks) => L.init({ world: 'brackets', tasks });
const kinds = (s) => s.events.map((e) => e.kind);
/** Pose chaque pile libre dans la صينية de sa forme, en vérifiant l'invariant de valeur à chaque geste. */
const sortAll = (s0) => {
  let s = s0;
  for (const b of L.loose(s)) {
    s = L.sort(s, b.id, b.p);
    for (let x = L.X_MIN; x <= L.X_MAX; x += 1) expect(L.tableValue(s, x)).toBe(L.writtenValue(s, x));
  }
  return s;
};

describe('like-terms — the default tasks are the brief’s, and reduce as it says', () => {
  const want = { 'collect-1': '7x + 4', 'collect-2': '3x + 2', 'collect-3': '2x^2 + 4x - 2', 'collect-4': '-3x + 4', plus: '2x + 4', minus: '-4x + 14', both: '6x - 7' };
  it('every default task', () => {
    const all = [...L.COLLECT_TASKS.beginner, ...L.COLLECT_TASKS.advanced, ...L.BRACKET_TASKS];
    for (const tk of all) expect(B.simplifiedTex(tk.expr), tk.id).toBe(want[tk.id]);
    expect(B.expressionTex(L.BRACKET_TASKS[1].expr)).toBe('9 - (4x - 5)');
    expect(B.openedTex(L.BRACKET_TASKS[2].expr)).toBe('3x + x - 2 - 5 + 2x');
  });
  it('init: the table holds one bundle per term, x = 3, nothing in the trays', () => {
    const s = collect();
    expect(s.bundles.map((b) => [b.c, b.p])).toEqual([[2, 1], [3, 0], [4, 1], [1, 0], [1, 1]]);
    expect(s.x).toBe(3);
    expect(L.taskOf(s)).toBe('collect-1');
    expect(L.writtenValue(s)).toBe(25);
    expect(L.tableValue(s)).toBe(25);
    const a = collect('advanced');
    expect(a.scaffold).toBe(false);
    expect(L.taskOf(a)).toBe('collect-3');
    const k = brackets();
    expect(k.crates).toEqual([{ item: 1, sign: 1 }]);
    expect(L.inCrate(k).map((b) => b.c0)).toEqual([2, -3]);
    expect(L.showExits(k)).toBe(true);
    expect(L.showTrays(k)).toBe(false);
  });
});

describe('like-terms — collect (مبتدئ)', () => {
  it('a bundle of another shape is REFUSED (kind) with the values of one piece of each shape at the student’s x', () => {
    const s = collect();
    expect(L.canSort(s, 'b0', 0)).toBe('kind');
    expect(L.canSort(s, 'b0', 1)).toBe(true);
    const r = L.refuseKind(s, 'b0', 0);
    expect(r.bundles).toEqual(s.bundles);
    expect(r.events.at(-1)).toEqual({ kind: 'refused', world: 'collect', task: 'collect-1', reason: 'kind', term: { c: 2, p: 1 }, tray: 0, x: 3, termValue: 3, trayValue: 1 });
  });
  it('the witness: at x = 1, x and 1 (or x² and x) have the same value — the refusal speaks at x = 2', () => {
    let s = L.setX(collect('advanced'), 1);
    s = L.refuseKind(s, 'b0', 1); // 4x² onto the x tray
    expect(s.events.at(-1)).toMatchObject({ x: 2, termValue: 4, trayValue: 2 });
    s = L.refuseKind(s, 'b2', 0); // −x onto the numbers
    expect(s.events.at(-1)).toMatchObject({ x: 2, termValue: 2, trayValue: 1 });
  });
  it('collect-1: the running readout, then the reduced form writes itself — solved with LaTeX', () => {
    let s = collect();
    s = L.sort(s, 'b0', 1);
    expect(L.trayCoef(s, 1)).toBe(2);
    s = L.sort(s, 'b2', 1);
    expect(L.trayCoef(s, 1)).toBe(6);
    expect(s.solvedNow).toBe(false);
    s = sortAll(s);
    expect(L.trayCoef(s, 1)).toBe(7);
    expect(L.trayCoef(s, 0)).toBe(4);
    expect(s.solvedNow).toBe(true);
    expect(s.events.at(-1)).toEqual({ kind: 'solved', world: 'collect', task: 'collect-1', expr: '2x + 3 + 4x + 1 + x', opened: '2x + 3 + 4x + 1 + x', result: '7x + 4' });
    expect(s.done).toEqual([true, false]);
    expect(L.discoveryReady(s)).toBe(false);
  });
  it('collect-2: opposite pieces cancel two by two (cancel event), the value never changes', () => {
    let s = L.nextTask(sortAll(collect()));
    expect(L.taskOf(s)).toBe('collect-2');
    s = L.sort(s, 'b0', 1); // 5x
    s = L.sort(s, 'b2', 1); // −2x
    expect(s.last).toMatchObject({ event: 'sort', cancelled: 2, coef: 3 });
    expect(kinds(s).slice(-2)).toEqual(['sort', 'cancel']);
    expect(s.seenCancel).toBe(true);
    s = sortAll(s);
    expect(s.events.at(-1).result).toBe('3x + 2');
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('value invariance: at every x, sorting and refusing never change the table’s value', () => {
    let s = collect();
    for (let x = L.X_MIN; x <= L.X_MAX; x += 1) {
      s = L.setX(s, x);
      expect(L.tableValue(s)).toBe(L.writtenValue(s));
    }
    expect(kinds(s).filter((k) => k === 'x')).toHaveLength(6); // 3 → 1 … 2 → 3 … 5 → 6: six changes
    expect(L.setX(s, 99).x).toBe(6);
    expect(L.setX(s, 0).x).toBe(1);
  });
  it('a second gesture on a sorted bundle, or into the trays once solved, does nothing', () => {
    let s = L.sort(collect(), 'b0', 1);
    expect(L.canSort(s, 'b0', 1)).toBe('');
    s = sortAll(s);
    expect(L.canSort(s, 'b0', 1)).toBe('');
  });
});

describe('like-terms — collect (متقدم): set each tray, then « تحقّق »', () => {
  it('collect-3: no cancellation while sorting; a wrong tray is refused with its value at x; right → pairs vanish, solved', () => {
    let s = sortAll(collect('advanced'));
    expect(kinds(s)).not.toContain('cancel');
    expect(s.solvedNow).toBe(false);
    expect(L.canCheck(s)).toBe(true);
    expect(L.trayPieces(s, 2)).toEqual({ pos: 4, neg: 2 });
    // the default of each setting is never the answer
    for (const p of L.usedTrays(s)) expect(L.coefOf(s, p)).not.toBe(L.trayCoef(s, p));
    s = L.setCoef(s, 2, 6); // 4x² − 2x² read as 6x²
    s = L.setCoef(s, 1, 4);
    s = L.setCoef(s, 0, -2);
    s = L.check(s);
    expect(s.solvedNow).toBe(false);
    expect(s.events.slice(-3)).toEqual([
      { kind: 'check', world: 'collect', task: 'collect-3', tray: 2, ok: false },
      { kind: 'check', world: 'collect', task: 'collect-3', tray: 1, ok: true },
      { kind: 'check', world: 'collect', task: 'collect-3', tray: 0, ok: true },
    ]);
    expect(s.last).toMatchObject({ event: 'check', ok: false, tray: 2, x: 3, trayTex: '4x^2 - 2x^2', trayValue: 18, typedTex: '6x^2', typedValue: 54 });
    s = L.check(L.setCoef(s, 2, 2));
    expect(s.solvedNow).toBe(true);
    expect(kinds(s).filter((k) => k === 'cancel')).toHaveLength(3);
    expect(s.events.at(-1).result).toBe('2x^2 + 4x - 2');
  });
  it('collect-4: the x² tray empties to 0 — the term disappears from the result', () => {
    let s = L.nextTask(L.check(['2', '1', '0'].reduce((x, p) => L.setCoef(x, Number(p), L.trayCoef(x, Number(p))), sortAll(collect('advanced')))));
    expect(L.taskOf(s)).toBe('collect-4');
    s = sortAll(s);
    expect(L.trayCoef(s, 2)).toBe(0);
    expect(L.coefOf(s, 2)).not.toBe(0);
    s = L.check(L.setCoef(L.setCoef(L.setCoef(s, 2, 0), 1, -3), 0, 4));
    expect(s.events.at(-1).result).toBe('-3x + 4');
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('the settings are clamped and re-open a judged tray', () => {
    let s = sortAll(collect('advanced'));
    expect(L.setCoef(s, 1, 99).coefs[1]).toBe(L.COEF_MAX);
    s = L.check(s);
    expect(Object.keys(s.checked)).toHaveLength(3);
    expect(L.setCoef(s, 1, 5).checked[1]).toBeUndefined();
  });
});

describe('like-terms — brackets', () => {
  it('plus: « كما هي » is accepted, « بعكس إشارتها » refused (sign) with the two values; the line grows; then collect', () => {
    let s = brackets();
    const r = L.exitTo(s, 'b1', true); // 2x flipped out of +( )
    expect(r.events.at(-1)).toEqual({ kind: 'refused', world: 'brackets', task: 'plus', reason: 'sign', crateSign: 1, term: { c: 2, p: 1 }, flipped: true, x: 3, before: 10, after: -2 });
    expect(r.bundles).toEqual(s.bundles);
    s = L.exitTo(s, 'b1', false);
    expect(s.events.at(-1)).toEqual({ kind: 'exit', world: 'brackets', task: 'plus', crateSign: 1, term: { c: 2, p: 1 }, flipped: false });
    expect(L.tableValue(s)).toBe(L.writtenValue(s));
    s = L.exitTo(s, 'b2', false);
    expect(L.cratesFull(s)).toBe(false);
    expect(L.showTrays(s)).toBe(true);
    s = sortAll(s);
    expect(s.events.at(-1)).toEqual({ kind: 'solved', world: 'brackets', task: 'plus', expr: '7 + (2x - 3)', opened: '7 + 2x - 3', result: '2x + 4' });
  });
  it('minus: kept as is → refused (« عند x = 3: 2، ولو أخرجتَ 4x كما هي لصارت 26 »); flipped → −4x; then +5', () => {
    let s = L.nextTask(sortAll(L.exitTo(L.exitTo(brackets(), 'b1', false), 'b2', false)));
    expect(L.taskOf(s)).toBe('minus');
    const r = L.exitTo(s, 'b1', false);
    expect(r.events.at(-1)).toMatchObject({ reason: 'sign', crateSign: -1, flipped: false, x: 3, before: 2, after: 26 });
    s = L.exitTo(s, 'b1', true);
    expect(L.bundle(s, 'b1').c).toBe(-4);
    s = L.exitTo(s, 'b2', false); // −5 kept: refused
    expect(s.last).toMatchObject({ event: 'refused', reason: 'sign' });
    expect(s.refusals.at(-1).rank).toBe(1);
    s = L.exitTo(s, 'b2', true);
    expect(L.bundle(s, 'b2').c).toBe(5);
    s = sortAll(s);
    expect(s.events.at(-1)).toMatchObject({ opened: '9 - 4x + 5', result: '-4x + 14' });
  });
  it('a sorting gesture is impossible while a crate still holds terms; the loose term stays where it is', () => {
    const s = brackets();
    expect(L.canSort(s, 'b0', 0)).toBe('');
    expect(L.canExit(s, 'b0')).toBe(false);
  });
  it('the refusal witness: at any x the wrong exit changes the value (the hand never meets a silent wrong exit)', () => {
    for (const tk of L.BRACKET_TASKS) {
      for (let x = L.X_MIN; x <= L.X_MAX; x += 1) {
        const s = L.setX(L.init({ world: 'brackets', tasks: [tk] }), x);
        for (const b of L.inCrate(s)) {
          const sign = L.crateOf(s, b.crate).sign;
          const ev = L.exitTo(s, b.id, sign > 0).events.at(-1);
          expect(ev.reason).toBe('sign');
          expect(ev.before).not.toBe(ev.after);
          expect(ev.x).toBe(x);
        }
      }
    }
  });
  it('discovery: the student’s own refused second term refutes « only the first sign changes »', () => {
    let s = brackets();
    for (const tk of [0, 1, 2]) {
      if (tk) s = L.nextTask(s);
      for (const b of L.inCrate(s)) {
        const sign = L.crateOf(s, b.crate).sign;
        if (L.taskOf(s) === 'minus' && b.id === 'b2') s = L.exitTo(s, b.id, false); // the second term kept as is: refused
        s = L.exitTo(s, b.id, sign < 0);
      }
      s = sortAll(s);
    }
    expect(L.discoveryReady(s)).toBe(true);
    const v = L.minusVariants(s);
    expect(v.first).toMatchObject({ exprTex: '9 - (4x - 5)', wrongTex: '9 - 4x - 5', x: 3, right: 2, wrong: -8 });
    expect(v.none).toMatchObject({ wrongTex: '9 + 4x - 5', right: 2, wrong: 16 });
    expect(v.own).toEqual({ termTex: '-5', x: 3, before: 2, after: -8 });
    const f = L.formalLines(s);
    expect(f.lines.map((l) => `${l.expr} = ${l.opened}`)).toEqual(['7 + (2x - 3) = 7 + 2x - 3', '9 - (4x - 5) = 9 - 4x + 5', '3x + (x - 2) - (5 - 2x) = 3x + x - 2 - 5 + 2x']);
  });
});

describe('like-terms — « جرّب أعدادك » (free panel)', () => {
  it('the same button grows ONE new bundle; another button starts another; the written expression grows with the table', () => {
    let s = L.addPiece(collect(), 2, 1);
    s = L.addPiece(s, 2, 1);
    s = L.addPiece(s, 2, -1);
    expect(L.taskOf(s)).toBe('custom');
    expect(B.expressionTex(s.expr)).toBe('2x + 3 + 4x + 1 + x + 2x^2 - x^2');
    expect(kinds(s).filter((k) => k === 'custom')).toHaveLength(3);
    expect(s.events.at(-1)).toEqual({ kind: 'custom', world: 'collect' });
    for (let x = 1; x <= 6; x += 1) expect(L.tableValue(s, x)).toBe(L.writtenValue(s, x));
    s = sortAll(s);
    expect(s.solvedNow).toBe(true);
    expect(s.events.at(-1)).toMatchObject({ task: 'custom', result: 'x^2 + 7x + 4' });
    expect(s.done).toEqual([false, false]); // a custom table never ticks an authored task
    expect(L.canNext(s)).toBe(true);
    s = L.nextTask(s);
    expect(L.taskOf(s)).toBe('collect-1');
  });
  it('« امسح » empties the table; at most 12 pieces of a shape', () => {
    let s = L.clearTable(collect());
    expect(s.bundles).toEqual([]);
    expect(L.writtenValue(s)).toBe(0);
    for (let k = 0; k < 20; k += 1) s = L.addPiece(s, 0, 1);
    expect(L.pieceCount(s, 0)).toBe(12);
    expect(L.canAdd(s, 0)).toBe(false);
    expect(B.expressionTex(s.expr)).toBe('12');
  });
  it('brackets: a crate of each sign (≤ 3 terms) and loose terms; the value invariant holds through exits', () => {
    let s = L.clearTable(brackets());
    s = L.addPiece(s, 1, 1, 'minus');
    s = L.addPiece(s, 1, 1, 'minus');
    s = L.addPiece(s, 0, -1, 'minus');
    s = L.addPiece(s, 0, 1, 'row');
    expect(B.expressionTex(s.expr)).toBe('-(2x - 1) + 1');
    s = L.addPiece(s, 2, 1, 'minus'); // same open crate, a third term
    s = L.addPiece(s, 0, 1, 'minus'); // a fourth term → a new crate
    expect(B.expressionTex(s.expr)).toBe('-(2x - 1 + x^2) + 1 - (1)');
    for (const b of L.inCrate(s)) {
      s = L.exitTo(s, b.id, true);
      for (let x = 1; x <= 6; x += 1) expect(L.tableValue(s, x)).toBe(L.writtenValue(s, x));
    }
    s = sortAll(s);
    expect(s.events.at(-1)).toMatchObject({ task: 'custom', result: '-x^2 - 2x + 1' });
  });
});

describe('like-terms — the coach (LabCoach) completes every task, every level, every world', () => {
  /** Suit `coachOf` jusqu'au bout ; l'oracle ne décide QUE ce que le coach ne montre pas (la صينية, la sortie, la valeur). */
  const follow = (s0, max = 120) => {
    let s = s0;
    const seen = [];
    for (let step = 0; step < max && L.coachOf(s); step += 1) {
      const c = L.coachOf(s);
      expect(c.target).toMatch(/^\[data-lt-(bundle="b\d+"|xbox|coef="[012]"|check|next)\]$/);
      seen.push(c.id);
      const id = c.target.match(/bundle="(b\d+)"/)?.[1];
      if (c.id === 'sort' || c.id === 'sortMore') s = L.sort(s, id, L.bundle(s, id).p);
      else if (c.id === 'exit' || c.id === 'exitMore') { const b = L.bundle(s, id); s = L.exitTo(s, id, L.crateOf(s, b.crate).sign < 0); }
      else if (c.id === 'x') s = L.setX(s, s.x + 1);
      else if (c.id === 'coef') { const p = Number(c.target.match(/coef="(\d)"/)[1]); s = L.setCoef(s, p, L.trayCoef(s, p)); }
      else if (c.id === 'check') s = L.check(s);
      else if (c.id === 'next') s = L.nextTask(s);
    }
    return { s, seen };
  };
  it('collect مبتدئ: sort → x → sortMore … → next → … discovery', () => {
    const { s, seen } = follow(collect());
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.coachOf(s)).toBeNull();
    expect(new Set(seen)).toEqual(new Set(['sort', 'x', 'sortMore', 'next']));
    expect(seen.indexOf('x')).toBe(1);
  });
  it('collect متقدم: sort … → coef ×3 → check → next → …', () => {
    const { s, seen } = follow(collect('advanced'));
    expect(L.discoveryReady(s)).toBe(true);
    expect(new Set(seen)).toEqual(new Set(['sort', 'sortMore', 'coef', 'check', 'next']));
  });
  it('brackets: exit → exitMore … → sort … → next (three tasks)', () => {
    const { s, seen } = follow(brackets());
    expect(L.discoveryReady(s)).toBe(true);
    expect(s.done).toEqual([true, true, true]);
    expect(new Set(seen)).toEqual(new Set(['exit', 'exitMore', 'sort', 'sortMore', 'next']));
  });
  it('a lesson’s own tasks, and a custom table, are completed by the coach too', () => {
    const { s } = follow(L.init({ world: 'brackets', tasks: [{ id: 'own', expr: [{ c: 2, p: 2 }, B.group(-1, [{ c: -1, p: 2 }, { c: 3, p: 1 }])] }] }));
    expect(s.done).toEqual([true]);
    const custom = follow(L.addPiece(L.addPiece(collect(), 1, -1), 0, 1));
    // the custom table is solved by the coach, then « next » returns to the authored tasks, which it completes too
    expect(custom.seen.slice(0, 4)).toEqual(['sort', 'x', 'sortMore', 'sortMore']);
    expect(custom.seen).toContain('next');
    expect(custom.s.done).toEqual([true, true]);
  });
  it('never points at a tray, an exit or a value', () => {
    for (const s0 of [collect(), collect('advanced'), brackets()]) {
      const { seen } = follow(s0);
      expect(seen.every((id) => !/tray|exit=/.test(id))).toBe(true);
    }
  });
});

describe('like-terms — reset (a fresh init) and the formal lines', () => {
  it('init again clears the trial memory', () => {
    const s = L.init({ world: 'collect' });
    expect(s.refusals).toEqual([]);
    expect(s.events).toEqual([]);
    expect(s.seenCancel).toBe(false);
  });
  it('formal: the student’s own lines, a sum of coefficients and a cancellation', () => {
    let s = collect();
    s = L.nextTask(sortAll(s));
    s = sortAll(s);
    const f = L.formalLines(s);
    expect(f.lines.map((l) => `${l.expr} = ${l.result}`)).toEqual(['2x + 3 + 4x + 1 + x = 7x + 4', '5x + 6 - 2x - 4 = 3x + 2']);
    expect(f.sum).toEqual({ lhs: '2x + 4x + x', rhs: '7x' });
    expect(f.cancel).toEqual({ tex: '2x - 2x = 0' });
    expect(f.value).toMatchObject({ x: 3, v: 25 });
    expect(L.mergeAllWitness({ x: 3 })).toEqual({ x: 3, a: 11, b: 15 });
    expect(L.mergeAllWitness({ x: 1 }).x).toBe(2);
    expect(L.sameNumberWitness({ x: 3, refusals: [] })).toMatchObject({ x: 3, a: 6, b: 18 });
  });
});
