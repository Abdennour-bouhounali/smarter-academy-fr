// « Entraîne-toi sur le Nil » — the practice ladder of thales-configuration-papillon: one node per key and the summary,
// each level asking only what its key gives, the felucca's leg as the first level, the hub naming no rule and laid out
// as lesson 1's.
import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { plain, typographyErrors } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { ladder, PRACTICE_MAP, PRACTICE_NODES } from './practice';
import { isRight, LEG_MIX, SPARE, THINK } from './run';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { TEXT } from './text';

const ID = 'thales-configuration-papillon';
const runs = (seeds, salt) =>
  ladder.LEVEL_ORDER.flatMap(({ node, level, id }) =>
    Array.from({ length: seeds }, (_, s) =>
      ladder.makeRun(rng((s + 1) * salt + level * 7 + node), node, level),
    ).flatMap((run) => run.map((w) => ({ w, node, id }))),
  );
/** The words that NAME a rule of the lesson (a level's name and the hub say a place or a question, never one of them). */
const RULE_WORDS = /Thalès|papillon|sommet|demi-tour|rapport|travers/i;

describe(`${ID} — the practice ladder`, () => {
  it('one node per key and a summary node, two levels each from the easiest, each named and placed on the hub', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, SUMMARY]);
    for (const node of PRACTICE_NODES) {
      expect(TEXT.levels[node.id], node.id).toHaveLength(node.levels.length);
      expect(PRACTICE_MAP.positions[node.id], node.id).toBeTruthy();
      const speeds = node.levels.map((l) => l.speed);
      expect([...speeds].sort((x, y) => x - y)).toEqual(speeds);
    }
    expect(ladder.LEVEL_ORDER).toHaveLength(6);
  });

  it('every buoy of every level carries its kind’s thinking time plus five seconds (the rail spaces the rows by it)', () => {
    ladder.nodes.forEach((node, n) =>
      node.levels.forEach((_, l) => {
        for (const w of ladder.makeRun(rng(n * 7 + l + 1), n, l)) expect(w.seconds).toBe(THINK[w.type] + SPARE);
      }),
    );
  });

  it('the felucca’s leg after a key is the first level of that key’s node (legs 2 and 3)', () => {
    expect(PRACTICE_NODES[0].levels[0].mix).toBe(LEG_MIX[2]);
    expect(PRACTICE_NODES[1].levels[0].mix).toBe(LEG_MIX[3]);
  });

  it('a level that opens with a key asks only what that key gives; the summary mixes both', () => {
    for (const { w, node } of runs(15, 131)) {
      const id = PRACTICE_NODES[node].id;
      if (id !== SUMMARY) expect(w.key, `${id} ${w.type}`).toBe(id);
      expect(w.gates.filter((g) => isRight(w, g))).toHaveLength(1);
      plain(w.say);
    }
    const summaryKeys = new Set(
      runs(15, 977)
        .filter(({ node }) => PRACTICE_NODES[node].id === SUMMARY)
        .map(({ w }) => w.key),
    );
    expect([...summaryKeys].sort()).toEqual([...KEYS].sort());
  });

  it('the hub names no key and no rule before its forge; its words are French', () => {
    const shown = [
      PRACTICE_MAP.root,
      ...PRACTICE_MAP.edges.map((e) => e[2]).filter(Boolean),
      ...Object.values(TEXT.levels).flat(),
    ];
    for (const line of shown) {
      plain(line);
      expect(line, line).not.toMatch(RULE_WORDS);
      expect(typographyErrors(line), line).toEqual([]);
    }
  });

  it('the map is laid out as lesson 1’s: the longest name inside, no label on a node', () => {
    const P = PRACTICE_MAP.positions;
    // a node's name is its key's title (the memo sheet's), or the summary's
    const titles = Object.fromEntries(
      Object.values(KNOWLEDGE.modules)
        .flat()
        .map((m) => [m.id, m.title]),
    );
    const nameOf = (id) => (id === SUMMARY ? TEXT.summary.title : titles[id]);
    const boxes = (id) => {
      const [x, y] = P[id];
      if (id === 'root') {
        const h = ([...PRACTICE_MAP.root].length * 8.5 + 38) / 5.9 / 2;
        return [[x - h, x + h, y - 4, y + 4]];
      }
      const h = ([...nameOf(id)].length * 7 + 16) / 5.9 / 2;
      return [
        [x - 5.6, x + 5.6, y - 13, y + 4],
        [x - h, x + h, y + 4, y + 13],
      ];
    };
    const meet = (p, q) => p[0] < q[1] && q[0] < p[1] && p[2] < q[3] && q[2] < p[3];
    const ids = Object.keys(P);
    for (const id of ids)
      for (const [x0, x1, y0, y1] of boxes(id)) {
        expect(x0, id).toBeGreaterThanOrEqual(2);
        expect(x1, id).toBeLessThanOrEqual(98);
        expect(y0, id).toBeGreaterThanOrEqual(1);
        expect(y1, id).toBeLessThanOrEqual(99);
      }
    for (const a of ids)
      for (const b of ids)
        if (a < b) for (const p of boxes(a)) for (const q of boxes(b)) expect(meet(p, q), `${a} on ${b}`).toBe(false);
    for (const [a, b, label] of PRACTICE_MAP.edges.filter((e) => e[2])) {
      const [mx, my] = [(P[a][0] + P[b][0]) / 2, (P[a][1] + P[b][1]) / 2];
      const h = ([...label].length * 6 + 18) / 5.9 / 2;
      const box = [mx - h, mx + h, my - 2.5, my + 2.5];
      for (const id of ids) for (const q of boxes(id)) expect(meet(box, q), `« ${label} » on ${id}`).toBe(false);
    }
  });
});
