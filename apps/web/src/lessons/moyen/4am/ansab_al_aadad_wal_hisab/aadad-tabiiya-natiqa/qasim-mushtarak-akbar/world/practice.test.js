import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { ladder, isRight, PRACTICE_NODES, PRACTICE_MAP } from './practice';
import { KEYS } from './journey';
import { TEXT } from './text';
import { divisorsOf, gcd } from './math';

const runs = function* (seeds, mult) {
  for (const { node, level, id } of ladder.LEVEL_ORDER)
    for (let seed = 1; seed <= seeds; seed += 1)
      for (const w of ladder.makeRun(rng(seed * mult + level * 7 + node), node, level)) yield { w, node, id };
};

describe('حلبة التدريب — the practice ladder of « القاسم المشترك الأكبر »', () => {
  it('has one node per key and a summary node, each level named and placed on the hub', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, 'exam']);
    for (const node of PRACTICE_NODES) {
      expect(TEXT.levels[node.id], node.id).toHaveLength(node.levels.length);
      expect(PRACTICE_MAP.positions[node.id], node.id).toBeTruthy();
    }
    expect(ladder.LEVEL_ORDER).toHaveLength(10);
  });

  it('every wave has exactly ONE right gate, its own sentence and a guidance line for every gate', () => {
    const types = new Set();
    for (const { w, node, id } of runs(40, 7919)) {
      types.add(w.type);
      const tag = `${id} ${JSON.stringify(w)}`;
      expect(
        w.gates.filter((n) => isRight(w, n)),
        tag,
      ).toHaveLength(1);
      expect(new Set(w.gates).size).toBe(3);
      expect(waveSay(w), tag).toBe(w.say); // a type of THIS lesson: the world falls back to the wave's own words
      const right = w.gates[w.good];
      for (const n of w.gates.filter((x) => x !== right)) {
        const g = explain(w, n);
        expect(g.wrong, `${tag} ${n}`).toContain(String(n));
        expect(g.right, tag).toBeTruthy();
        expect(`${g.wrong} ${g.right}`).not.toMatch(/undefined|NaN/);
      }
      expect(w.key === PRACTICE_NODES[node].id || PRACTICE_NODES[node].id === 'exam').toBe(true);
      // mental arithmetic: inside the tables
      if (w.a != null) expect(Math.max(w.a, w.b), tag).toBeLessThanOrEqual(100);
      expect(Math.max(...w.gates), tag).toBeLessThanOrEqual(100);
    }
    expect([...types].sort()).toEqual(
      [
        'commonDivisor',
        'countCommon',
        'divisorOfPgcd',
        'longest',
        'mostBouquets',
        'pgcd',
        'perBouquet',
        'possibleBouquets',
      ].sort(),
    );
  });

  it('the right gate is the arithmetic: a common divisor, the PGCD, the roses of a bouquet, a divisor of the PGCD', () => {
    for (const { w } of runs(30, 31337)) {
      const right = w.gates[w.good];
      const tag = JSON.stringify(w);
      if (['commonDivisor', 'possibleBouquets'].includes(w.type)) {
        expect([w.a % right, w.b % right], tag).toEqual([0, 0]);
        // the wrong gates divide ONE of the two numbers at most
        for (const n of w.gates.filter((x) => x !== right))
          expect(w.a % n && w.b % n ? 1 : 0, tag).toBeLessThanOrEqual(1);
      }
      if (['pgcd', 'longest', 'mostBouquets'].includes(w.type)) {
        expect(right, tag).toBe(gcd(w.a, w.b));
        expect(w.a / right, tag).not.toBe(w.b / right);
      }
      if (w.type === 'perBouquet') expect([right * w.g, w.a % w.g, w.b % w.g], tag).toEqual([w.a, 0, 0]);
      if (w.type === 'divisorOfPgcd') {
        expect(w.g % right, tag).toBe(0);
        for (const n of w.gates.filter((x) => x !== right)) expect(w.g % n, tag).not.toBe(0);
        expect(w.say).toContain(`= ${w.g}$`);
      }
      if (w.type === 'countCommon') expect(right, tag).toBe(divisorsOf(w.g).length);
    }
  });

  it('« PGCD » waves offer, when it exists, a common divisor that is NOT the greatest — the trap of the key', () => {
    let seen = 0;
    for (const { w } of runs(30, 104729)) {
      if (!['pgcd', 'longest'].includes(w.type)) continue;
      const g = gcd(w.a, w.b);
      const smaller = w.gates.filter((n) => n > 1 && n < g && w.a % n === 0 && w.b % n === 0);
      if (divisorsOf(g).length > 2) {
        expect(smaller.length, JSON.stringify(w)).toBe(1);
        seen += 1;
      }
    }
    expect(seen).toBeGreaterThan(20);
  });
  it('its words agree with their numbers and every guidance line is TRUE — a square PGCD included', () => {
    /** « 6 وردة », « 2 باقات », « مع 2 باقات »: a counted noun that does not agree with its number. */
    const disagree =
      /(?:^|[\s:(])(?:[3-9]|10) (?:وردة|زنبقة|باقة|سلّة)(?![؀-ۿ])|(?:^|\s)(?:1|2) (?:ورود|زنبقات|باقات)|باقتان متماثلة/;
    let lines = 0;
    for (const { w } of runs(30, 15485863)) {
      const right = w.gates[w.good];
      for (const n of w.gates) {
        const g = explain(w, n);
        for (const line of [w.say, n === right ? g.right : g.wrong]) {
          expect(line, line).not.toMatch(disagree);
          lines += 1;
        }
      }
      // « عُدّ قواسم 16 زوجًا زوجًا: كلّ جداء يعطي قاسمين » was false for 16 = 4 × 4: the hint now names no pairing
      if (w.type === 'countCommon') for (const n of w.gates) expect(explain(w, n).wrong ?? '').not.toContain('زوج');
    }
    expect(lines).toBeGreaterThan(1000);
    // the hub's labels are shown before any key is forged: none names a rule
    for (const [, , label] of PRACTICE_MAP.edges) expect(label ?? '').not.toMatch(/أكبر|أكثر|قواسم|يقسم|PGCD/);
    for (const names of Object.values(TEXT.levels)) for (const n of names) expect(n).not.toMatch(/PGCD|قواسم/);
  });
});
