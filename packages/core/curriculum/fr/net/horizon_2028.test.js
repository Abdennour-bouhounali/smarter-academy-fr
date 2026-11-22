import { describe, it, expect } from 'vitest';
import horizon from './horizon_2028.json';
import net from './learning_net_college.json';
import * as delivered from './learningNet.js';

// What the 2026 programme adds to 3e from 2028-2029: kept beside the live net, never loaded by it.
describe('horizon 2028 (not in the live net)', () => {
  const ids = new Set(horizon.items.map((i) => i.id));

  it('holds .x<n> items of the 2026 programme, each attached to a lesson or an item that exists', () => {
    expect(horizon.items.length).toBeGreaterThan(0);
    expect(ids.size).toBe(horizon.items.length);
    for (const i of horizon.items) {
      expect(i.id, i.id).toMatch(/^3e\.m\d+\.x\d+$/);
      expect(i).toMatchObject({ grade: '3e', horizon: '2028', origin: 'programme-2026' });
      expect(delivered.getSegment(i.segment), i.id).not.toBeNull();
      const target = delivered.getLesson(i.attachesTo) ?? delivered.getItem(i.attachesTo);
      expect(target, `${i.id} attachesTo ${i.attachesTo}`).not.toBeNull();
    }
  });

  it('never collides with a live id', () => {
    for (const id of ids) {
      expect(delivered.getItem(id), id).toBeNull();
      expect(delivered.getLesson(id), id).toBeNull();
    }
  });

  it('keeps its links pointing INTO horizon items, from live or horizon items, and its threads among the live ones', () => {
    for (const k of horizon.links) {
      expect(ids.has(k.to), `${k.from} → ${k.to}`).toBe(true);
      expect(ids.has(k.from) || delivered.getItem(k.from) !== null, `${k.from} → ${k.to}`).toBe(true);
    }
    // No live link touches a horizon item: a 2026-2027 item never depends on what is taught from 2028.
    for (const k of delivered.LINKS) expect(ids.has(k.from) || ids.has(k.to), `${k.from} → ${k.to}`).toBe(false);
    const threadIds = new Set(net.threads.map((t) => t.id));
    const placed = Object.entries(horizon.threads).flatMap(([t, list]) => {
      expect(threadIds.has(t), t).toBe(true);
      return list;
    });
    expect(new Set(placed)).toEqual(ids);
  });
});
