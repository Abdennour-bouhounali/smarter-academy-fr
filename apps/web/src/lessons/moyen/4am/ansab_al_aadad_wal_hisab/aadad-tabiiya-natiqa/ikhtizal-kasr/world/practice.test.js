import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { explain } from '../../../../../../common/gameworld/divisorIsles/strings';
import {
  agreementErrors,
  looseComma,
  said,
  trueEqualities,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { ladder, isRight, PRACTICE_NODES, PRACTICE_MAP } from './practice';
import { gcd } from './math';
import { KEYS } from './journey';
import { TABLETS } from './story';
import { TEXT } from './text';

const runs = (seeds, salt) =>
  ladder.LEVEL_ORDER.flatMap(({ node, level, id }) =>
    Array.from({ length: seeds }, (_, s) =>
      ladder.makeRun(rng((s + 1) * salt + level * 7 + node), node, level),
    ).flatMap((run) => run.map((w) => ({ w, node, id }))),
  );
/** The right value of a wave, computed here independently of `isRight`. */
function truth(w) {
  switch (w.type) {
    case 'marhala':
      return w.side === 'd' ? (w.b * (w.a / w.k)) / w.a : (w.a * (w.b / w.k)) / w.b;
    case 'pgcdW': {
      let g = 1;
      for (let d = 1; d <= Math.min(w.a, w.b); d += 1) if (w.a % d === 0 && w.b % d === 0) g = d;
      return (w.side === 'd' ? w.b : w.a) / g;
    }
    case 'natijaW':
      return w.n / gcd(w.s, w.n);
    default:
      return null;
  }
}

describe('حلبة التدريب — the practice ladder of « اختزال كسر »', () => {
  it('one node per key and a summary node, each level named and placed on the hub; the PGCD and the result weigh most', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, 'exam']);
    for (const node of PRACTICE_NODES) {
      expect(TEXT.levels[node.id], node.id).toHaveLength(node.levels.length);
      expect(PRACTICE_MAP.positions[node.id], node.id).toBeTruthy();
    }
    expect(PRACTICE_NODES.map((n) => n.levels.length)).toEqual([1, 1, 2, 2, 2]);
    expect(ladder.LEVEL_ORDER).toHaveLength(8);
    for (const [from, to] of PRACTICE_MAP.edges.map((e) => e.slice(0, 2)))
      for (const id of [from, to]) expect(Object.keys(PRACTICE_MAP.positions)).toContain(id);
  });

  it('the hub shows no key’s name and no rule before its forge: level names and link labels say places and questions', () => {
    const shown = [...Object.values(TEXT.levels).flat(), ...PRACTICE_MAP.edges.map((e) => e[2]).filter(Boolean)];
    for (const line of shown) {
      for (const t of Object.values(TABLETS)) expect(line, line).not.toContain(t.title);
      expect(line, line).not.toMatch(/اختزال|يُختزل|مختزل|غير قابل|PGCD|القاسم المشترك|مراحل|النتيجة|أوّلي|أولي/);
    }
  });

  it('every wave of every level: exactly one right gate, computed independently; mental arithmetic; a line for every gate', () => {
    const seen = new Set();
    for (const { w } of runs(25, 131)) {
      seen.add(w.type);
      expect(
        w.gates.filter((n) => isRight(w, n)),
        w.say,
      ).toHaveLength(1);
      expect(new Set(w.gates).size).toBe(3);
      for (const n of w.gates) expect(n, w.say).toBeLessThanOrEqual(100);
      for (const n of (w.say.match(/\d+/g) ?? []).map(Number)) expect(n, w.say).toBeLessThanOrEqual(100);
      const right = w.gates[w.good];
      const t = truth(w);
      if (t != null) expect(right, w.say).toBe(t);
      if (w.type === 'ghayrW') {
        expect(gcd(right, w.n)).toBe(1);
        for (const n of w.gates.filter((x) => x !== right)) expect(gcd(n, w.n), w.say).toBeGreaterThan(1);
      }
      for (const n of w.gates) {
        const g = explain(w, n);
        const line = n === right ? g.right : g.wrong;
        expect(line, `${w.say} ${n}`).toBeTruthy();
        said(line);
        trueEqualities(line);
        expect(looseComma(line), line).toBe(false);
        expect(agreementErrors(line), line).toEqual([]);
      }
    }
    expect([...seen].sort()).toEqual(['ghayrW', 'marhala', 'natijaW', 'pgcdW']);
  });

  it('the wrong gates are real mistakes: a writing stopped too early, the result not reduced, the denominators added', () => {
    const waves = runs(25, 977).map((x) => x.w);
    const p = waves.filter((w) => w.type === 'pgcdW');
    expect(p.some((w) => w.gates.some((n) => !isRight(w, n) && n !== (w.side === 'd' ? w.b : w.a)))).toBe(true);
    const plus = waves.filter((w) => w.type === 'natijaW' && w.op === '+');
    expect(plus.some((w) => w.gates.includes(2 * w.n))).toBe(true);
    expect(plus.some((w) => w.gates.includes(w.n))).toBe(true);
  });
});
