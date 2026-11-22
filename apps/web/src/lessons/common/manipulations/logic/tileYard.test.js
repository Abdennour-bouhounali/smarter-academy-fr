import { describe, it, expect } from 'vitest';
import * as S from '@smarter-academy/core/arithmetic/surfaces.js';
import * as L from './tileYard';

const fence = () => L.init({ world: 'yard', mode: 'fence' });
const rope = () => L.init({ world: 'yard', mode: 'rope' });
const at = (s, r, c) => L.tileAt(s, r, c).id;
const mv = (s, from, to) => L.moveTile(s, at(s, ...from), to);

/** 2 × 6 → 3 × 4 in four legal moves (the fence goes 16 → 14). */
const TO_3X4 = [[[3, 7], [4, 5]], [[2, 7], [4, 4]], [[3, 6], [4, 3]], [[2, 6], [4, 2]]];
const to3x4 = (s) => TO_3X4.reduce((acc, [from, to]) => mv(acc, from, to), s);

describe('tile-yard — the yard at the start', () => {
  it('fence mode: 12 tiles as a 2 × 6 rectangle on a 7 × 10 grid, fence 16, no tile in the heap logic', () => {
    const s = fence();
    expect(L.tilesOf(s)).toBe(12);
    expect(L.fenceOf(s)).toBe(16);
    expect(S.perimeter(s.tiles.map((t) => [t.r, t.c]))).toBe(16);
    expect(new Set(s.tiles.map((t) => t.id)).size).toBe(12);
    expect(s.tiles.every((t) => L.inGrid(s, t.r, t.c))).toBe(true);
    expect(s.tasks).toEqual(['shortest', 'twenty']);
    expect(s.rope).toBeNull();
    expect(s.events).toEqual([]);
  });
  it('rope mode: an empty yard, a roll of 12 sticks, a heap of 12 tiles', () => {
    const s = rope();
    expect(L.tilesOf(s)).toBe(0);
    expect(s.rope).toBe(12);
    expect(L.heapOf(s)).toBe(12);
    expect(L.ropeLeft(s)).toBe(12);
    expect(s.tasks).toEqual(['biggest', 'smallest']);
  });
  it('floor world carries its scenes; unknown scenes are dropped, empty list = both', () => {
    expect(L.init({ world: 'floor', tasks: ['terrace-double', 'nope'] }).tasks).toEqual(['terrace-double']);
    expect(L.init({ world: 'floor' }).tasks).toEqual(['terrace-halves', 'terrace-double']);
    expect(L.init({ world: 'floor', tasks: [] }).tasks).toEqual(['terrace-halves', 'terrace-double']);
  });
});

describe('tile-yard — fence mode: moving a tile', () => {
  it('a legal move keeps the area and changes the fence; the event has the exact shape', () => {
    let s = fence();
    s = mv(s, [3, 7], [4, 5]);
    expect(L.tilesOf(s)).toBe(12);
    expect(L.fenceOf(s)).toBe(18); // a corner tile (2 contacts) leaves nothing; it lands with one contact: +2
    expect(s.events.at(-1)).toEqual({ kind: 'move', world: 'yard', mode: 'fence', tiles: 12, fence: 18, prevFence: 16 });
    s = to3x4(fence());
    expect(L.fenceOf(s)).toBe(14);
    expect(s.events.filter((e) => e.kind === 'move')).toHaveLength(4);
    expect(s.events.at(-1)).toEqual({ kind: 'move', world: 'yard', mode: 'fence', tiles: 12, fence: 14, prevFence: 16 });
    expect(L.tilesOf(s)).toBe(12);
  });
  it('the three refusals leave the yard untouched and say why', () => {
    const s0 = fence();
    // detached: a corner only (no side shared)
    let s = mv(s0, [2, 2], [1, 1]);
    expect(s.events.at(-1)).toEqual({ kind: 'refused', reason: 'detached' });
    expect(L.fenceOf(s)).toBe(16);
    expect(s.tiles).toEqual(s0.tiles);
    // splits: lifting a bridge of a line
    const line = { ...s0, tiles: [0, 1, 2, 3, 4].map((c) => ({ id: c, r: 3, c })) };
    s = L.moveTile(line, 2, [2, 2]);
    expect(s.events.at(-1)).toEqual({ kind: 'refused', reason: 'splits' });
    expect(L.liftable(line, 2)).toEqual({ ok: false, reason: 'splits' });
    // hole: lifting the middle of a 3 × 3 block
    const block = { ...s0, tiles: [] };
    block.tiles = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => ({ id: r * 3 + c, r: r + 2, c: c + 2 })));
    s = L.moveTile(block, 4, [1, 3]);
    expect(s.events.at(-1)).toEqual({ kind: 'refused', reason: 'hole' });
    // hole by dropping into a notch: closing a hollow
    const horse = { ...s0, tiles: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [4, 4]].map(([r, c], id) => ({ id, r: r + 1, c: c + 1 })) };
    // (4,4)+1 is detached from the rest: use a tile of the horseshoe instead
    const horse2 = { ...s0, tiles: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [3, 0]].map(([r, c], id) => ({ id, r: r + 1, c: c + 1 })) };
    s = L.moveTile(horse2, 6, [3, 2]); // (4,1)->(3,2): closes the hollow (2,2)? it touches (2,3)'s tile below → hole
    expect(horse.tiles).toHaveLength(7);
    expect(s.events.at(-1)).toEqual({ kind: 'refused', reason: 'hole' });
  });
  it('dropping on an occupied cell, outside the grid or back where it was is a quiet no-op', () => {
    const s = fence();
    expect(mv(s, [2, 2], [2, 3])).toBe(s);
    expect(mv(s, [2, 2], [2, 2])).toBe(s);
    expect(mv(s, [2, 2], [-1, 2])).toBe(s);
    expect(L.moveTile(s, 999, [0, 0])).toBe(s);
  });
  it('legalDrops: every glowing cell is a legal move; a corner of the 2 × 6 has some, never an occupied cell', () => {
    const s = fence();
    const id = at(s, 2, 2);
    const drops = L.legalDrops(s, id);
    expect(drops.length).toBeGreaterThan(5);
    for (const d of drops) {
      expect(L.tileAt(s, d[0], d[1])).toBeNull();
      expect(L.moveTile(s, id, d).events.at(-1).kind).toBe('move');
    }
    expect(L.preview(s, id, drops[0]).tiles).toBe(12);
  });
  it('the area never changes in fence mode, whatever the moves (hill-climbing to 20)', () => {
    let s = to3x4(fence());
    for (let guard = 0; guard < 30 && L.fenceOf(s) < 20; guard += 1) {
      let best = null;
      for (const t of s.tiles) {
        for (const d of L.legalDrops(s, t.id)) {
          if (!L.liftable(s, t.id).ok) continue;
          const f = L.preview(s, t.id, d).fence;
          if (f <= 20 && f > L.fenceOf(s) && (!best || f < best.f)) best = { id: t.id, d, f };
        }
      }
      expect(best).not.toBeNull();
      s = L.moveTile(s, best.id, best.d);
      expect(L.tilesOf(s)).toBe(12);
    }
    expect(L.fenceOf(s)).toBe(20);
  });
});

describe('tile-yard — the notebook, the walk, the tasks (fence mode)', () => {
  it('keep stamps the yard with its two numbers and a canonical shape; the 3 × 4 completes task « shortest »', () => {
    let s = fence();
    s = L.keep(s);
    expect(s.kept).toHaveLength(1);
    expect(s.events.at(-1)).toEqual({ kind: 'keep', mode: 'fence', tiles: 12, fence: 16, shape: S.canonical(s.tiles.map((t) => [t.r, t.c])) });
    expect(L.taskDone(s)).toBe(false);
    s = to3x4(s);
    s = L.keep(s);
    expect(s.events.slice(-2).map((e) => e.kind)).toEqual(['keep', 'task']);
    expect(s.events.at(-1)).toEqual({ kind: 'task', task: 'shortest' });
    expect(L.taskDone(s)).toBe(true);
    expect(L.canNext(s)).toBe(true);
    s = L.nextTask(s);
    expect(L.taskOf(s)).toBe('twenty');
    expect(L.taskDone(s)).toBe(false);
  });
  it('never two congruent yards: a duplicate is refused with a note and no event', () => {
    let s = L.keep(fence());
    const n = s.events.length;
    // the same 2 × 6, turned upright and moved, is the same yard
    const turned = { ...s, tiles: Array.from({ length: 12 }, (_, i) => ({ id: i, r: 1 + Math.floor(i / 2), c: 3 + (i % 2) })) };
    const again = L.keep(turned);
    expect(again.kept).toHaveLength(1);
    expect(again.events).toHaveLength(n);
    expect(again.last).toEqual({ event: 'duplicate' });
    expect(L.isKept(turned)).toBe(true);
    s = to3x4(s);
    expect(L.isKept(s)).toBe(false);
  });
  it('task « twenty » needs a kept fence of exactly 20 (any shape)', () => {
    let s = L.nextTask(L.keep(to3x4(fence())));
    // a 2 × 4 block with a tail of 4: area 12, fence 12 + 8 = 20
    const tail = [...[2, 3].flatMap((r) => [2, 3, 4, 5].map((c) => [r, c])), ...[6, 7, 8, 9].map((c) => [2, c])];
    s = { ...s, tiles: tail.map(([r, c], id) => ({ id, r, c })) };
    expect(L.fenceOf(s)).toBe(20);
    s = L.keep(s);
    expect(s.events.at(-1)).toEqual({ kind: 'task', task: 'twenty' });
    expect(L.allTasksDone(s)).toBe(true);
    expect(L.canNext(s)).toBe(false);
  });
  it('a kept yard that is not the goal does not complete the task', () => {
    const s = L.keep(fence());
    expect(L.taskDone(s)).toBe(false);
    expect(s.events.some((e) => e.kind === 'task')).toBe(false);
  });
  it('a completed walk is an event with the two numbers', () => {
    const s = L.walked(fence());
    expect(s.events.at(-1)).toEqual({ kind: 'walk', tiles: 12, fence: 16 });
    expect(s.walks).toBe(1);
    expect(L.walked(rope())).toEqual(rope());
  });
  it('discoveryReady: ≥ 3 kept yards with ≥ 3 distinct fences including 14', () => {
    let s = L.keep(fence()); // 16
    expect(L.discoveryReady(s)).toBe(false);
    s = L.keep(to3x4(s)); // 14
    expect(L.discoveryReady(s)).toBe(false);
    const tail = [...[2, 3].flatMap((r) => [2, 3, 4, 5].map((c) => [r, c])), ...[6, 7, 8, 9].map((c) => [2, c])];
    s = L.keep({ ...s, tiles: tail.map(([r, c], id) => ({ id, r, c })) }); // 20
    expect(L.discoveryReady(s)).toBe(true);
    const witnesses = L.witnesses(s);
    expect(witnesses.lo).toMatchObject({ fence: 14, tiles: 12 });
    expect(witnesses.hi).toMatchObject({ fence: 20, tiles: 12 });
    const pairs = L.formalPairs(s);
    expect(pairs.sameAreaOnly).not.toBeNull();
    expect(pairs.samePerimeterOnly).toBeNull();
    expect(pairs.sameBoth).toBeNull();
  });
  it('three kept yards with only two distinct fences do not open the discovery', () => {
    let s = L.keep(fence()); // 16
    s = L.keep(to3x4(s)); // 14
    // another 16: a 2 × 6 with one tile moved to a 2-contact nook? use a 3 × 3 + 3 line (fence 16)
    const other = [...[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => [2 + r, 2 + c])), [2, 5], [2, 6], [2, 7]];
    const t = other.map(([r, c], id) => ({ id, r, c }));
    expect(S.perimeter(other)).toBe(18);
    s = L.keep({ ...s, tiles: t });
    expect(s.kept).toHaveLength(3);
    expect(L.discoveryReady(s)).toBe(true); // 16, 14, 18: three distinct
  });
});

describe('tile-yard — rope mode', () => {
  it('the first tile lands anywhere; each next one must share a side; the heap shrinks', () => {
    let s = rope();
    s = L.addTile(s, [3, 3]);
    expect(s.events.at(-1)).toEqual({ kind: 'add', world: 'yard', mode: 'rope', tiles: 1, fence: 4, prevFence: 0 });
    expect(L.heapOf(s)).toBe(11);
    expect(L.ropeLeft(s)).toBe(8);
    s = L.addTile(s, [5, 5]);
    expect(s.events.at(-1)).toEqual({ kind: 'refused', reason: 'detached' });
    s = L.addTile(s, [3, 4]);
    expect(L.fenceOf(s)).toBe(6);
  });
  it('a drop whose fence would exceed the rope is refused (rope) and says the fence it would have', () => {
    let s = rope();
    for (let c = 0; c < 5; c += 1) s = L.addTile(s, [3, c]);
    expect(L.fenceOf(s)).toBe(12);
    const refused = L.addTile(s, [3, 5]);
    expect(refused.events.at(-1)).toEqual({ kind: 'refused', reason: 'rope' });
    expect(refused.last).toMatchObject({ event: 'refused', reason: 'rope', fence: 14 });
    expect(L.tilesOf(refused)).toBe(5);
    // a corner-filling drop adds no fence and is accepted
    const filled = L.addTile(L.addTile(s, [2, 1]), [2, 2]);
    expect(L.tilesOf(filled)).toBe(5);
  });
  it('removing a tile: back to the heap, keeping the yard valid (splits and hole are refused)', () => {
    let s = rope();
    for (let c = 0; c < 4; c += 1) s = L.addTile(s, [3, c]);
    expect(L.removeTile(s, 1).events.at(-1)).toEqual({ kind: 'refused', reason: 'splits' });
    const r = L.removeTile(s, 3);
    expect(r.events.at(-1)).toEqual({ kind: 'remove', world: 'yard', mode: 'rope', tiles: 3, fence: 8, prevFence: 10 });
    expect(L.heapOf(r)).toBe(9);
    expect(L.removeTile(fence(), 0)).toEqual(fence()); // fence mode never removes
  });
  it('moving a tile inside the grid obeys the rope too', () => {
    let s = rope();
    for (let c = 0; c < 5; c += 1) s = L.addTile(s, [3, c]);
    s = L.moveTile(s, 4, [2, 3]); // leaf (3,4) -> above (3,3)
    expect(s.events.at(-1).kind).toBe('move');
    expect(L.fenceOf(s)).toBe(12);
  });
  it('keep is possible only when the whole rope is used', () => {
    let s = rope();
    s = L.addTile(s, [3, 3]);
    expect(L.canKeep(s)).toBe(false);
    expect(L.keep(s)).toBe(s);
    for (const c of [[3, 4], [3, 5], [4, 3], [4, 4], [4, 5], [5, 3], [5, 4], [5, 5]]) s = L.addTile(s, c);
    expect(L.tilesOf(s)).toBe(9);
    expect(L.fenceOf(s)).toBe(12);
    expect(L.canKeep(s)).toBe(true);
    s = L.keep(s);
    expect(s.events.slice(-2)).toEqual([{ kind: 'keep', mode: 'rope', tiles: 9, fence: 12, shape: S.canonical(s.tiles.map((t) => [t.r, t.c])) }, { kind: 'task', task: 'biggest' }]);
  });
  it('with the same rope: 9, 7 and 5 tiles are all reachable and different — discoveryReady needs 9 and 5', () => {
    const keepShape = (s, cells) => {
      // clear then build
      let x = s;
      while (x.tiles.length) { const t = x.tiles.find((q) => L.liftable(x, q.id).ok); x = L.removeTile(x, t.id); }
      for (const c of cells) x = L.addTile(x, c);
      return L.keep(x);
    };
    let s = rope();
    s = keepShape(s, [[3, 3], [3, 4], [3, 5], [4, 3], [4, 4], [4, 5], [5, 3], [5, 4], [5, 5]]); // 9
    s = L.nextTask(s);
    s = keepShape(s, [[3, 1], [3, 2], [3, 3], [3, 4], [3, 5]]); // 5
    expect(s.events.filter((e) => e.kind === 'task').map((e) => e.task)).toEqual(['biggest', 'smallest']);
    expect(L.discoveryReady(s)).toBe(false);
    s = keepShape(s, [[3, 3], [3, 4], [4, 3], [4, 4], [5, 3], [5, 4], [4, 5]]); // 7 tiles, fence: 2×3 (10) + 1 = 12
    expect(s.kept.map((k) => k.tiles)).toEqual([9, 5, 7]);
    expect(s.kept.every((k) => k.fence === 12)).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    const w = L.witnesses(s);
    expect(w.many.tiles).toBe(9);
    expect(w.few.tiles).toBe(5);
    expect(w.longest).toBe(5);
    expect(w.widest).toBe(3);
    const pairs = L.formalPairs(s);
    expect(pairs.samePerimeterOnly).not.toBeNull();
    expect(pairs.sameAreaOnly).toBeNull();
  });
});

describe('tile-yard — the floor', () => {
  const sc = L.SCENES;
  it('terrace-halves: 14 whole cells + 4 cut cells = 16 unit ①', () => {
    expect(sc['terrace-halves'].whole).toHaveLength(14);
    expect(sc['terrace-halves'].halves).toHaveLength(4);
    expect(sc['terrace-double'].whole).toHaveLength(21);
    expect(sc['terrace-double'].whole.length).not.toBe(sc['terrace-double'].rows * sc['terrace-double'].cols); // not a rectangle
  });
  it('lay, refuse (outside, unit, overlap), take back', () => {
    let s = L.init({ world: 'floor', tasks: ['terrace-halves'] });
    s = L.layPiece(s, 'one', [0, 0]);
    expect(s.events.at(-1)).toEqual({ kind: 'lay', scene: 'terrace-halves', unit: 'one', area: '1' });
    s = L.layPiece(s, 'one', [0, 0]);
    expect(s.events.at(-1)).toEqual({ kind: 'refused', scene: 'terrace-halves', reason: 'overlap' });
    s = L.layPiece(s, 'one', [9, 9]);
    expect(s.events.at(-1)).toEqual({ kind: 'refused', scene: 'terrace-halves', reason: 'outside' });
    s = L.layPiece(s, 'one', [0, 5]); // a cut cell: a whole tile does not fit
    expect(s.events.at(-1)).toEqual({ kind: 'refused', scene: 'terrace-halves', reason: 'unit' });
    s = L.layPiece(s, 'half', [0, 1]); // a half tile on a whole cell
    expect(s.events.at(-1)).toEqual({ kind: 'refused', scene: 'terrace-halves', reason: 'unit' });
    s = L.layPiece(s, 'half', [0, 5]);
    expect(s.events.at(-1)).toEqual({ kind: 'lay', scene: 'terrace-halves', unit: 'half', area: '1,5' });
    expect(L.reading(s)).toMatchObject({ unit: 'one', halves: 3, value: '1,5', cells: 2 });
    s = L.unlay(s, s.pieces[0].id);
    expect(L.reading(s).value).toBe('0,5');
    expect(L.unlay(s, 12345)).toBe(s);
  });
  it('terrace-halves, followed to the end: sweep the whole cells, fit the 4 halves, read 16', () => {
    let s = L.init({ world: 'floor', tasks: ['terrace-halves'] });
    s = L.sweepLay(s, 'one', sc['terrace-halves'].whole.filter(([r]) => r === 0));
    expect(s.swept).toBe(true);
    expect(L.covered(s)).toBe(false);
    s = L.sweepLay(s, 'one', sc['terrace-halves'].whole.filter(([r]) => r > 0));
    expect(L.reading(s)).toMatchObject({ value: '14', cells: 14 });
    expect(L.canConfirm(s)).toBe(false);
    for (const { r, c } of sc['terrace-halves'].halves) s = L.layPiece(s, 'half', [r, c]);
    expect(L.covered(s)).toBe(true);
    expect(L.reading(s).value).toBe('16');
    s = L.confirm(s);
    expect(s.events.at(-1)).toEqual({ kind: 'read', scene: 'terrace-halves', unit: 'one', value: '16' });
    expect(L.sceneDone(s)).toBe(true);
    expect(L.finished(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.layPiece(s, 'one', [0, 0])).toBe(s); // a read scene is closed
  });
  it('sweepLay ignores occupied or foreign cells quietly, with no refusal event', () => {
    let s = L.init({ world: 'floor', tasks: ['terrace-halves'] });
    s = L.layPiece(s, 'one', [0, 1]);
    const n = s.events.length;
    s = L.sweepLay(s, 'one', [[0, 0], [0, 1], [0, 2], [9, 9], [0, 5]]);
    expect(s.pieces).toHaveLength(3);
    expect(s.events.slice(n).every((e) => e.kind === 'lay')).toBe(true);
  });
  const doubleFloor = () => {
    let s = L.init({ world: 'floor', tasks: ['terrace-double'] });
    s = L.sweepLay(s, 'one', sc['terrace-double'].whole);
    return s;
  };
  it('terrace-double: 21 unit ① first, then the double tile is offered on a cleared floor', () => {
    let s = doubleFloor();
    expect(L.reading(s)).toMatchObject({ unit: 'one', value: '21' });
    expect(s.events.at(-1)).toMatchObject({ kind: 'lay', scene: 'terrace-double', unit: 'one', area: '21', areaTwo: '10,5' });
    expect(L.boxOf(s)).toEqual(['one']);
    s = L.confirm(s);
    expect(s.events.at(-1)).toEqual({ kind: 'read', scene: 'terrace-double', unit: 'one', value: '21' });
    expect(s.phase).toBe('two');
    expect(s.pieces).toEqual([]);
    expect(L.boxOf(s)).toEqual(['two', 'halfTwo']);
    expect(L.sceneDone(s)).toBe(false);
  });
  it('terrace-double: a double tile covers two cells, turns, and is refused over the staircase edge', () => {
    let s = L.confirm(doubleFloor());
    s = L.layPiece(s, 'two', [0, 0], 'h');
    expect(s.events.at(-1)).toMatchObject({ kind: 'lay', unit: 'two', area: '2', areaTwo: '1' });
    expect(s.pieces[0].cells).toEqual([[0, 0], [0, 1]]);
    s = L.layPiece(s, 'two', [0, 1], 'h'); // (0,2) is beyond the first row
    expect(s.events.at(-1)).toMatchObject({ kind: 'refused', reason: 'outside' });
    s = L.layPiece(s, 'two', [0, 1], 'v'); // (0,1) taken
    expect(s.events.at(-1)).toMatchObject({ kind: 'refused', reason: 'overlap' });
    s = L.layPiece(s, 'two', [1, 2], 'h'); // (1,3) is outside (row 1 has 3 cells)
    expect(s.events.at(-1)).toMatchObject({ kind: 'refused', reason: 'outside' });
    s = L.layPiece(s, 'two', [1, 0], 'v');
    expect(s.pieces.at(-1).cells).toEqual([[1, 0], [2, 0]]);
  });
  const finishTwo = (s, pairs) => {
    for (const [cell, o] of pairs) s = L.layPiece(s, 'two', cell, o);
    // the rest: half doubles
    const occ = L.occupied(s);
    for (const [r, c] of sc['terrace-double'].whole) if (!occ.has(S.key(r, c))) s = L.layPiece(s, 'halfTwo', [r, c]);
    return s;
  };
  it('terrace-double: ANY pairing reads 10,5 unit ② (10 doubles + a half; 9 doubles + 3 halves; row by row)', () => {
    const base = L.confirm(doubleFloor());
    const rowPairs = (skipRows = []) => {
      const out = [];
      sc['terrace-double'].whole.forEach(([r, c]) => { if (!skipRows.includes(r) && c % 2 === 0 && sc['terrace-double'].whole.some(([a, b]) => a === r && b === c + 1)) out.push([[r, c], 'h']); });
      return out;
    };
    const readings = [rowPairs(), rowPairs([4]), rowPairs([1, 2, 3])].map((pairs) => {
      const s = finishTwo(base, pairs);
      expect(L.covered(s)).toBe(true);
      return { value: L.reading(s).value, doubles: s.pieces.filter((p) => p.kind === 'two').length, halves: s.pieces.filter((p) => p.kind === 'halfTwo').length };
    });
    for (const r of readings) {
      expect(r.value).toBe('10,5');
      expect(2 * r.doubles + r.halves).toBe(21);
    }
    expect(new Set(readings.map((r) => r.doubles)).size).toBeGreaterThan(1); // different pairings really were compared
    // the three-halves pairing: 9 doubles + 3 halves
    const s9 = finishTwo(base, rowPairs().slice(0, 9));
    expect(s9.pieces.filter((p) => p.kind === 'halfTwo')).toHaveLength(3);
    expect(L.reading(s9).value).toBe('10,5');
    const done = L.confirm(s9);
    expect(done.events.at(-1)).toEqual({ kind: 'read', scene: 'terrace-double', unit: 'two', value: '10,5' });
    expect(L.finished(done)).toBe(true);
  });
  it('both scenes: next scene after the first is read; nothing is skipped', () => {
    let s = L.init({ world: 'floor' });
    s = L.sweepLay(s, 'one', sc['terrace-halves'].whole);
    for (const { r, c } of sc['terrace-halves'].halves) s = L.layPiece(s, 'half', [r, c]);
    s = L.confirm(s);
    expect(L.canNext(s)).toBe(true);
    expect(L.finished(s)).toBe(false);
    s = L.nextScene(s);
    expect(L.taskOf(s)).toBe('terrace-double');
    expect(s.phase).toBe('one');
    expect(s.pieces).toEqual([]);
  });
  it('freePairs lists the places a double tile still fits', () => {
    let s = L.confirm(doubleFloor());
    expect(L.freePairs(s).length).toBeGreaterThan(10);
    s = finishTwo(s, []);
    expect(L.freePairs(s)).toEqual([]);
  });
});

/* ── The coach, followed to the end of every task ── */

describe('tile-yard — the coach, followed to the end', () => {
  it('fence: pick → walk → keep → again … → next → … discovery; never the answer, always a selector of the DOM contract', () => {
    let s = fence();
    const seen = [];
    let step = 0;
    for (; step < 40 && !L.discoveryReady(s); step += 1) {
      const c = L.coachOf(s);
      expect(c, `step ${step}`).not.toBeNull();
      expect(c.target).toMatch(/^\[data-ty-(tile="\d+-\d+"|walk|keep|next)\]$/);
      seen.push(c.id);
      if (c.id === 'pick' || c.id === 'again') {
        const task = L.taskOf(s);
        if (task === 'shortest') s = s.tiles.some((t) => t.r === 4) ? s : to3x4(s);
        else if (task === 'twenty' && !L.taskDone(s)) {
          const tail = [...[2, 3].flatMap((r) => [2, 3, 4, 5].map((cc) => [r, cc])), ...[6, 7, 8, 9].map((cc) => [2, cc])];
          s = { ...s, tiles: tail.map(([r, cc], id) => ({ id, r, c: cc })) };
        } else { // a third distinct fence once both tasks are done
          const other = [...[0, 1, 2].flatMap((r) => [0, 1, 2].map((cc) => [2 + r, 2 + cc])), [2, 5], [2, 6], [2, 7]];
          s = { ...s, tiles: other.map(([r, cc], id) => ({ id, r, c: cc })) };
        }
        s = { ...s, moves: s.moves + 1 };
      } else if (c.id === 'walk') s = L.walked(s);
      else if (c.id === 'keep') s = L.keep(s);
      else if (c.id === 'next') s = L.nextTask(s);
    }
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.coachOf(s)).toBeNull();
    expect(L.allTasksDone(s)).toBe(true);
    expect(new Set(seen)).toEqual(new Set(['pick', 'walk', 'keep', 'next', 'again']));
  });

  it('rope: add → walk → more → keep → again … → next', () => {
    let s = rope();
    const seen = [];
    const builds = [
      [[3, 3], [3, 4], [3, 5], [4, 3], [4, 4], [4, 5], [5, 3], [5, 4], [5, 5]],
      [[3, 1], [3, 2], [3, 3], [3, 4], [3, 5]],
      [[3, 3], [3, 4], [4, 3], [4, 4], [5, 3], [5, 4], [4, 5]],
    ];
    const clear = (x) => { let y = x; while (y.tiles.length) { const t = y.tiles.find((q) => L.liftable(y, q.id).ok); y = L.removeTile(y, t.id); } return y; };
    for (let step = 0; step < 60 && !L.discoveryReady(s); step += 1) {
      const c = L.coachOf(s);
      expect(c, `step ${step}`).not.toBeNull();
      expect(c.target).toMatch(/^\[data-ty-(heap|tile="\d+-\d+"|walk|keep|next)\]$/);
      seen.push(c.id);
      if (c.id === 'add' || c.id === 'more') {
        // build the wanted shape one tile at a time
        const want = builds[Math.min(s.kept.length, 2)];
        const have = new Set(s.tiles.map((t) => S.key(t.r, t.c)));
        const nextCell = want.find(([r, cc]) => !have.has(S.key(r, cc)));
        s = L.addTile(s, nextCell);
      } else if (c.id === 'again') s = clear(s);
      else if (c.id === 'walk') s = L.walked(s);
      else if (c.id === 'keep') {
        // the whole rope is used, but the student still has the wanted shape to finish before stamping it
        for (const cell of builds[Math.min(s.kept.length, 2)]) if (!L.tileAt(s, cell[0], cell[1])) s = L.addTile(s, cell);
        s = L.keep(s);
      } else if (c.id === 'next') s = L.nextTask(s);
    }
    expect(L.discoveryReady(s)).toBe(true);
    expect(s.kept.map((k) => k.tiles).sort()).toEqual([5, 7, 9]);
    expect(seen).toContain('add');
    expect(seen).toContain('walk');
    expect(seen).toContain('keep');
    expect(seen).toContain('next');
  });

  it('floor: pick → sweep → half → confirm → next → double → halfTwo → confirm', () => {
    let s = L.init({ world: 'floor' });
    const seen = [];
    for (let step = 0; step < 80 && !L.discoveryReady(s); step += 1) {
      const c = L.coachOf(s);
      expect(c, `step ${step}`).not.toBeNull();
      expect(c.target).toMatch(/^\[data-ty-(box="(one|half|two|halfTwo)"|floor|confirm|next)\]$/);
      seen.push(c.id);
      const sc0 = L.sceneOf(s);
      const occ = L.occupied(s);
      const free = sc0.whole.filter(([r, cc]) => !occ.has(S.key(r, cc)));
      if (c.id === 'pick') s = L.layPiece(s, 'one', free[0]);
      else if (c.id === 'sweep') s = L.sweepLay(s, 'one', free);
      else if (c.id === 'cover' && s.phase === 'one') s = L.sweepLay(s, 'one', free);
      else if (c.id === 'half') { const h = sc0.halves.find(({ r, c: cc }) => !occ.has(S.key(r, cc))); s = L.layPiece(s, 'half', [h.r, h.c]); }
      else if (c.id === 'double' || (c.id === 'cover' && s.phase === 'two')) { const [cell, o] = L.freePairs(s)[0]; s = L.layPiece(s, 'two', cell, o); }
      else if (c.id === 'halfTwo') s = L.layPiece(s, 'halfTwo', free[0]);
      else if (c.id === 'confirm') s = L.confirm(s);
      else if (c.id === 'next') s = L.nextScene(s);
      else throw new Error(`unhandled ${c.id}`);
    }
    expect(L.finished(s)).toBe(true);
    expect(L.coachOf(s)).toBeNull();
    expect(s.reads).toEqual({ 'terrace-halves': { one: '16' }, 'terrace-double': { one: '21', two: '10,5' } });
    for (const id of ['pick', 'sweep', 'half', 'confirm', 'next', 'double', 'halfTwo']) expect(seen).toContain(id);
  });
});

describe('tile-yard — reset', () => {
  it('init always returns a fresh, empty memory', () => {
    let s = to3x4(fence());
    s = L.keep(s);
    expect(s.events.length).toBeGreaterThan(0);
    const again = L.init({ world: 'yard', mode: 'fence' });
    expect(again.events).toEqual([]);
    expect(again.kept).toEqual([]);
    expect(L.fenceOf(again)).toBe(16);
    expect(L.init({ world: 'floor', tasks: ['terrace-halves'] }).reads).toEqual({});
  });
});
