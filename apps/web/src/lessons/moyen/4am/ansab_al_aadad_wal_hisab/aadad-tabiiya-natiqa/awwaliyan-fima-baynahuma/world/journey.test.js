import { describe, it, expect } from 'vitest';
import { KEYS, journey } from './journey';
import { KNOWLEDGE } from './knowledge';
import { MODULE_KEYS, NUMBERS, STORY, TABLETS } from './story';
import { FORGES } from './forges';
import { lesson } from './index';
import { RULES, euclid, gcd } from './math';
import { LESSON_CONFIG } from '../lesson.config';

const card = (id) => KNOWLEDGE.graph.nodes.find((n) => n.id === id);
/** The value of a memo option: « $57$ » → 57. */
const num = (s) => Number(s.replace(/\$/g, ''));

describe('the road of « العددان الأوّليّان فيما بينهما »', () => {
  it('its three keys, in order, each with its tablet, its forge, its memo sheet and its card', () => {
    expect(KEYS).toEqual(['awwaliyan', 'ithbat-awwaliyan', 'shahid-wahid']);
    const items = Object.values(KNOWLEDGE.modules)
      .flat()
      .map((it) => it.id);
    expect(items).toEqual(KEYS);
    expect(Object.keys(TABLETS)).toEqual(KEYS);
    expect(Object.keys(FORGES)).toEqual(KEYS);
    expect(KEYS.map((k) => TABLETS[k].icon)).toEqual(['🤝', '✅', '❌']);
    for (const key of KEYS) {
      expect(FORGES[key].key).toBe(key);
      expect(card(lesson.cards.ofKey[key])?.notebook && card(lesson.cards.ofKey[key]).requires, key).toBe(key);
      expect(TABLETS[key].title && TABLETS[key].lines.length && TABLETS[key].math.length, key).toBeTruthy();
    }
  });

  it('the knowledge map: thirteen cards, every one placed, opened by a key, revealed along its links', () => {
    const nodes = KNOWLEDGE.graph.nodes;
    const ids = nodes.map((n) => n.id);
    expect(ids).toHaveLength(13);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(KNOWLEDGE.positions).sort()).toEqual([...ids].sort());
    expect(ids).toContain(KNOWLEDGE.graph.root);
    for (const n of nodes) {
      expect(KEYS, n.id).toContain(n.requires);
      const out = KNOWLEDGE.graph.edges.filter((e) => e.from === n.id).map((e) => e.to);
      expect([...n.reveals].sort(), n.id).toEqual(out.sort());
      expect(`${n.title} ${n.subtitle} ${JSON.stringify(n.context ?? {})}`).not.toMatch(/undefined|NaN/);
    }
    for (const id of [...Object.values(lesson.cards.ofKey), lesson.cards.fallback]) expect(ids).toContain(id);
    const reached = new Set([KNOWLEDGE.graph.root]);
    for (let i = 0; i < ids.length; i += 1)
      for (const e of KNOWLEDGE.graph.edges) if (reached.has(e.from)) reached.add(e.to);
    expect(reached.size).toBe(ids.length);
    // a card opens only with a key the story gives at or before the card that reveals it
    const order = (id) => KEYS.indexOf(card(id).requires);
    for (const e of KNOWLEDGE.graph.edges)
      expect(order(e.to), `${e.from} → ${e.to}`).toBeGreaterThanOrEqual(order(e.from));
  });

  it('the map is laid out: no two cards on one spot, three cards a row at most, every link label between two rows', () => {
    const P = KNOWLEDGE.positions;
    const ROWS = [5, 23, 41, 59, 76, 93];
    const COLS = [17, 30, 50, 70, 83];
    for (const [id, [x, y]] of Object.entries(P)) {
      expect(ROWS, id).toContain(y);
      expect(COLS, id).toContain(x);
    }
    for (const y of ROWS) {
      const row = Object.values(P)
        .filter((q) => q[1] === y)
        .map((q) => q[0])
        .sort((a, b) => a - b);
      expect(row.length).toBeLessThanOrEqual(3);
      for (let i = 1; i < row.length; i += 1) expect(row[i] - row[i - 1], `row ${y}`).toBeGreaterThanOrEqual(33);
    }
    // a link label sits at the middle of its link: never on a row, never inside a card of the row it is next to — at
    // least 8.5 % from a row (lesson 6's trainer walk: at 7.75 % the labels touched a two-line card)
    for (const e of KNOWLEDGE.graph.edges) {
      const [x1, y1] = P[e.from];
      const [x2, y2] = P[e.to];
      expect(y2, `${e.from} → ${e.to}`).toBeGreaterThan(y1);
      const [mx, my] = [(x1 + x2) / 2, (y1 + y2) / 2];
      for (const [id, [x, y]] of Object.entries(P))
        if (Math.abs(y - my) < 8.5) expect(Math.abs(x - mx), `${e.label} under ${id}`).toBeGreaterThanOrEqual(19);
    }
  });

  it('every memo sheet is complete, its quiz has ONE right option, and every distractor is FALSE', () => {
    const items = Object.values(KNOWLEDGE.modules).flat();
    for (const it of items) {
      for (const f of ['rule', 'hook', 'example', 'trap', 'exam', 'chip'])
        expect(it.memo[f], `${it.id} ${f}`).toBeTruthy();
      expect(it.memo.quiz).toHaveLength(2);
      for (const q of it.memo.quiz) {
        expect(q.options[q.correct], q.q).toBeTruthy();
        expect(new Set(q.options).size).toBe(q.options.length);
      }
      expect(JSON.stringify(it)).not.toMatch(/undefined|NaN/);
      // no Arabic letter inside a formula of the sheet (KaTeX)
      for (const f of ['rule', 'example', 'chip']) expect(it.memo[f], `${it.id} ${f}`).not.toMatch(/[؀-ۿ]/);
      for (const q of it.memo.quiz)
        for (const m of `${q.q} ${q.options.join(' ')}`.matchAll(/\$([^$]*)\$/g))
          expect(m[1], q.q).not.toMatch(/[؀-ۿ]/);
      // a plain line of the sheet names no « PGCD(…) » inside Arabic (bidi, defects.md B7)
      for (const f of ['trap', 'exam', 'hook']) expect(it.memo[f], `${it.id} ${f}`).not.toMatch(/PGCD\(/);
      expect(it.summary, it.id).not.toMatch(/PGCD\(/);
    }
    const [only, proof, witness] = items;
    const [o1, o2] = NUMBERS.only.gaps;
    // « PGCD(25 ; 27) = … »: only 1
    expect(only.memo.quiz[0].options.filter((o) => num(o) === gcd(o1, o2))).toEqual([
      only.memo.quiz[0].options[only.memo.quiz[0].correct],
    ]);
    // « which pair is coprime? »: exactly the right option's pair
    const pairOf = (o) => o.match(/\d+/g).map(Number);
    expect(only.memo.quiz[1].options.filter((o) => gcd(...pairOf(o)) === 1)).toEqual([
      only.memo.quiz[1].options[only.memo.quiz[1].correct],
    ]);
    // ✅: the last two divisions of 35 and 26, then the PGCD
    const [p1, p2] = NUMBERS.proof.gaps;
    expect(num(proof.memo.quiz[0].options[proof.memo.quiz[0].correct])).toBe(gcd(p1, p2));
    expect(proof.memo.quiz[0].options.filter((o) => num(o) === gcd(p1, p2))).toHaveLength(1);
    expect(proof.memo.quiz[0].q).toContain(`${euclid(p1, p2).at(-1).a} = ${euclid(p1, p2).at(-1).b}`);
    expect(proof.memo.quiz[1].options[proof.memo.quiz[1].correct]).toBe('$\\mathrm{PGCD}(a ; b) = 1$');
    // ❌: of 3, 5, 9 only 5 divides 645 and 410
    const [w1, w2] = NUMBERS.witness.gaps;
    expect(witness.memo.quiz[0].options.filter((o) => w1 % num(o) === 0 && w2 % num(o) === 0)).toEqual([
      witness.memo.quiz[0].options[witness.memo.quiz[0].correct],
    ]);
    // « no rule divides 85 and 119 together »: the premise is TRUE, and 17 divides both
    const [h1, h2] = NUMBERS.hidden.gaps;
    expect([2, 3, 5].some((r) => h1 % r === 0 && h2 % r === 0)).toBe(false);
    expect(gcd(h1, h2)).toBe(17);
    expect(witness.memo.quiz[1].options[witness.memo.quiz[1].correct]).toContain('$17$');
  });

  it('the numbers the cards write are the story’s, and true', () => {
    expect(card('mithal-35').context.list).toEqual([
      '$35 = 26 \\times 1 + 9$',
      '$26 = 9 \\times 2 + 8$',
      '$9 = 8 \\times 1 + 1$',
      '$8 = 1 \\times 8 + 0$',
    ]);
    expect(card('mithal-645').context.formula).toBe('$645 = 5 \\times 129$ ، $410 = 5 \\times 82$');
    expect(card('mithal-39').context.formula).toBe('$39 = 13 \\times 3$ ، $52 = 13 \\times 4$');
    expect(card('khata-shahid').context.parts[1].text).toBe(
      '$119 = 85 \\times 1 + 34$ و $85 = 34 \\times 2 + 17$ و $34 = 17 \\times 2 + 0$.',
    );
    expect(card('khata-shahid').context.parts[0].text).toContain(RULES.join(' و '));
    expect(card('khata-awwali').context.parts[1].text).toContain('قواسم 25 هي 1 و 5 و 25، وقواسم 27 هي 1 و 3 و 9 و 27');
    expect(JSON.stringify(KNOWLEDGE)).not.toMatch(/\d ،/);
  });

  it('the story is playable: the mirrors open on E, G and K, the modules are done when he holds their keys', () => {
    const opened = [];
    const modules = [];
    const flags = {};
    const game = {
      T: STORY.text,
      flags,
      state: { keys: [], stage: 0, phase: 'play' },
      say: () => {},
      openForge: (k) => opened.push(k),
      onModule: (m) => modules.push(m),
      save: () => {},
      refreshObjective: () => {},
    };
    STORY.islands.forEach((_, k) => STORY.onArrive(game, k));
    expect(opened).toEqual(KEYS);
    // onArrive bears being run twice: a forge already sealed never opens again
    game.state.keys = [KEYS[0]];
    opened.length = 0;
    STORY.islands.forEach((_, k) => STORY.onArrive(game, k));
    expect(opened).toEqual(KEYS.slice(1));
    game.state.keys = [...KEYS];
    opened.length = 0;
    STORY.islands.forEach((_, k) => STORY.onArrive(game, k));
    expect(opened).toEqual([]);
    // the keys sealed one by one, as the closed tablet hands them over (the key is already in the keys)
    game.state.keys = [];
    const marked = [];
    for (const key of KEYS) {
      game.state.keys = [...game.state.keys, key];
      STORY.afterKey[key](game);
      marked.push([...modules]);
    }
    expect(flags.key4).toBe(true);
    expect(marked.map((m) => m.join())).toEqual(['', '2', '2,1,3']);
    for (const m of modules) expect(lesson.keysFromModules([m]).every((k) => KEYS.includes(k))).toBe(true);
    STORY.onBossPaid(game);
    expect(modules.at(-1)).toBe('4');
    // the forge waiting in front of a mirror, and none after it is sealed
    for (const [stage, held, key] of [
      [4, [], KEYS[0]],
      [6, [KEYS[0]], KEYS[1]],
      [10, KEYS.slice(0, 2), KEYS[2]],
    ]) {
      expect(STORY.pendingForge({ state: { stage, keys: held } })).toBe(key);
      expect(STORY.pendingForge({ state: { stage, keys: [...held, key] } })).toBe(null);
    }
    expect(STORY.pendingForge({ state: { stage: 5, keys: [] } })).toBe(null);
    expect(journey.examOpen(KEYS, {})).toBe(false);
  });

  it('the store of the last bridge says the numbers of THIS lesson, in its own words', () => {
    const seg = STORY.segments.find((x) => x.boss);
    const T = STORY.text.boss;
    const said = [T.mission, T.choose, T.price, T.divide(1), T.costAsk(1, 179), T.err.long(35, 6), T.err.sum(35, 5, 4)];
    const own = [seg.a, seg.boss.price, ...NUMBERS.boss.lanes].join('|');
    for (const line of said) expect(line, line).toMatch(new RegExp(`(?<![0-9])(${own})(?![0-9])`));
    const words = JSON.stringify(STORY.text);
    // nothing of the earlier lessons' stores: their lanes, their prices, their piers
    expect(words).not.toMatch(/(?<![0-9])(1176|868|2044|756|1850)(?![0-9])|مرسى الممرّين|الرصيف|المنارة/);
  });

  it('the keys his own progress proves are his from the first screen — the keys of the modules he completed', () => {
    expect(lesson.keysFromModules([])).toEqual([]);
    expect(lesson.keysFromModules(['0', '1'])).toEqual([KEYS[0], KEYS[2]]);
    expect(lesson.keysFromModules(['2'])).toEqual(KEYS.slice(0, 2));
    expect(lesson.keysFromModules(['4'])).toEqual(KEYS);
    const keyOf = Object.fromEntries(
      KEYS.map((k) => [lesson.evidence.learningPointOf('awwaliyan-fima-baynahuma', k), k]),
    );
    const fromConfig = Object.fromEntries(
      LESSON_CONFIG.modules
        .filter((m) => m.teachesLearningPointIds?.length)
        .map((m) => [m.number, KEYS.filter((k) => m.teachesLearningPointIds.some((p) => keyOf[p] === k))]),
    );
    expect(MODULE_KEYS).toEqual(fromConfig);
  });
});
