import { describe, it, expect } from 'vitest';
import { KEYS, journey } from './journey';
import { KNOWLEDGE } from './knowledge';
import { MODULE_KEYS, NUMBERS, STORY, TABLETS } from './story';
import { FORGES } from './forges';
import { lesson } from './index';
import { gcd } from './math';
import { LESSON_CONFIG } from '../lesson.config';

const num = (s) => Number(s.replace(/\$/g, ''));
const card = (id) => KNOWLEDGE.graph.nodes.find((n) => n.id === id);

describe('the road of « تعيين القاسم المشترك الأكبر »', () => {
  it('its three keys, in order, each with its tablet, its forge, its memo sheet and its card', () => {
    expect(KEYS).toEqual(['hasr-wa-taqatu', 'nataij-mubashira', 'b-yaqsim-a']);
    const items = Object.values(KNOWLEDGE.modules)
      .flat()
      .map((it) => it.id);
    expect(items).toEqual(KEYS);
    expect(Object.keys(TABLETS)).toEqual(KEYS);
    expect(Object.keys(FORGES)).toEqual(KEYS);
    expect(KEYS.map((k) => TABLETS[k].icon)).toEqual(['📋', '⚡', '🎯']);
    for (const key of KEYS) {
      expect(FORGES[key].key).toBe(key);
      expect(card(lesson.cards.ofKey[key])?.notebook && card(lesson.cards.ofKey[key]).requires, key).toBe(key);
      expect(TABLETS[key].title && TABLETS[key].lines.length && TABLETS[key].math.length, key).toBeTruthy();
    }
  });

  it('the knowledge map: twelve cards, every one placed, opened by a key, revealed along its links', () => {
    const nodes = KNOWLEDGE.graph.nodes;
    const ids = nodes.map((n) => n.id);
    expect(ids).toHaveLength(12);
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
  });

  it('the map is laid out: no two cards on one spot, three cards a row at most, every link label between two rows', () => {
    const P = KNOWLEDGE.positions;
    const ROWS = [5, 20.5, 39, 58, 74.5, 93];
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
    // a link label sits at the middle of its link: never on a row, and never inside a card of the row it is next to
    for (const e of KNOWLEDGE.graph.edges) {
      const [x1, y1] = P[e.from];
      const [x2, y2] = P[e.to];
      expect(y2, `${e.from} → ${e.to}`).toBeGreaterThan(y1);
      const [mx, my] = [(x1 + x2) / 2, (y1 + y2) / 2];
      for (const [id, [x, y]] of Object.entries(P))
        if (Math.abs(y - my) < 7) expect(Math.abs(x - mx), `${e.label} under ${id}`).toBeGreaterThanOrEqual(19);
    }
  });

  it('every memo sheet is complete, its two questions have one answer, and the right answer is the arithmetic', () => {
    const [hasr, nataij, yaqsim] = Object.values(KNOWLEDGE.modules).flat();
    for (const it of [hasr, nataij, yaqsim]) {
      for (const f of ['rule', 'hook', 'example', 'trap', 'exam', 'chip'])
        expect(it.memo[f], `${it.id} ${f}`).toBeTruthy();
      expect(it.memo.quiz).toHaveLength(2);
      for (const q of it.memo.quiz) {
        expect(q.options[q.correct], q.q).toBeTruthy();
        expect(new Set(q.options).size).toBe(q.options.length);
      }
      expect(JSON.stringify(it)).not.toMatch(/undefined|NaN/);
      // no Arabic letter or comma inside a formula of the sheet (KaTeX)
      for (const f of ['rule', 'example', 'chip']) expect(it.memo[f], `${it.id} ${f}`).not.toMatch(/[؀-ۿ]/);
      for (const q of it.memo.quiz)
        for (const m of `${q.q} ${q.options.join(' ')}`.matchAll(/\$([^$]*)\$/g))
          expect(m[1], q.q).not.toMatch(/[؀-ۿ]/);
      // a plain line of the sheet names no « PGCD(…) » inside Arabic (bidi, defects.md B7)
      for (const f of ['trap', 'exam', 'hook', 'summary'])
        expect(it.memo[f] ?? it[f], `${it.id} ${f}`).not.toMatch(/PGCD\(/);
    }
    const [a, b] = NUMBERS.lists.gaps;
    expect(num(hasr.memo.quiz[0].options[hasr.memo.quiz[0].correct])).toBe(gcd(a, b));
    expect(num(nataij.memo.quiz[0].options[nataij.memo.quiz[0].correct])).toBe(gcd(NUMBERS.nest.gaps[0], 0));
    expect(num(nataij.memo.quiz[1].options[nataij.memo.quiz[1].correct])).toBe(gcd(NUMBERS.nest.gaps[1], 1));
    expect(num(yaqsim.memo.quiz[0].options[yaqsim.memo.quiz[0].correct])).toBe(gcd(...NUMBERS.nest.gaps));
    const [x, y] = NUMBERS.against.gaps;
    expect(x % y).not.toBe(0); // « لا: 36 لا يقسم 90 » is the right answer
    expect(yaqsim.memo.quiz[1].options[yaqsim.memo.quiz[1].correct]).toBe(`لا: ${y} لا يقسم ${x}`);
  });

  it('the numbers the cards write are the story’s, and true', () => {
    const text = (id) => JSON.stringify(card(id));
    expect(text('mithal-32-44')).toContain('المشتركة: 1 ، 2 ، 4');
    expect(card('mithal-32-44').context.formula).toBe('$\\mathrm{PGCD}(32 ; 44) = 4$');
    expect(card('rappel-qawasim').context.text).toContain('$44 = 1 \\times 44 = 2 \\times 22 = 4 \\times 11$');
    expect(card('khata-laysa-akbar').subtitle).toBe('$\\mathrm{PGCD}(32 ; 44) \\neq 2$');
    expect(card('khata-sifr').subtitle).toBe('$\\mathrm{PGCD}(27 ; 0) = 27$');
    expect(card('mithal-76-19').context.formula).toBe('$76 = 19 \\times 4$');
    expect(card('tahaqquq-awwalan').context.text).toContain('$90 = 36 \\times 2 + 18$');
    expect(card('tahaqquq-awwalan').context.text).toContain('$\\mathrm{PGCD}(90 ; 36) = 18$');
    expect(JSON.stringify(KNOWLEDGE)).not.toMatch(/\d ،/);
  });

  it('the story is playable: the forges open on islands C, G and I, the modules are done when he holds their keys', () => {
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
    game.state.keys = [...KEYS];
    STORY.islands.forEach((_, k) => STORY.onArrive(game, k));
    expect(opened).toEqual(KEYS);
    game.state.keys = [];
    const marked = [];
    for (const key of KEYS) {
      STORY.afterKey[key](game);
      marked.push([...modules]);
      game.state.keys = [...game.state.keys, key];
    }
    expect(flags.key4).toBe(true);
    expect(marked.map((m) => m.join())).toEqual(['1', '1', '1,2,3']);
    for (const m of modules) expect(lesson.keysFromModules([m]).every((k) => game.state.keys.includes(k))).toBe(true);
    STORY.onBossPaid(game);
    expect(modules.at(-1)).toBe('4');
    for (const [stage, key] of [
      [2, KEYS[0]],
      [6, KEYS[1]],
      [8, KEYS[2]],
    ]) {
      expect(STORY.pendingForge({ state: { stage, keys: [] } })).toBe(key);
      expect(STORY.pendingForge({ state: { stage, keys: [key] } })).toBe(null);
    }
    expect(journey.examOpen(KEYS, {})).toBe(false);
  });

  it('the store of the last bridge says the numbers of THIS lesson, in its own words', () => {
    const seg = STORY.segments.find((x) => x.boss);
    const T = STORY.text.boss;
    const said = [
      T.mission,
      T.choose,
      T.price,
      T.divide(14),
      T.costAsk(14, 28),
      T.err.long(22, 18),
      T.err.sum(22, 17, 10),
    ];
    const own = [seg.a, seg.boss.price, ...NUMBERS.boss.piers].join('|');
    for (const line of said) expect(line, line).toMatch(new RegExp(`\\b(${own})\\b`));
    const words = JSON.stringify(STORY.text);
    // nothing of the earlier lessons' stores: their gaps, their prices, their shelves, their flowers
    expect(words).not.toMatch(/\b(756|1850|650|140|364|286)\b|رفّ|العنيدة|بلّورة|الورود|الزنابق/);
  });

  it('the keys his own progress proves are his from the first screen — the keys of the modules he completed', () => {
    expect(lesson.keysFromModules([])).toEqual([]);
    expect(lesson.keysFromModules(['0', '1'])).toEqual([KEYS[0]]);
    expect(lesson.keysFromModules(['2'])).toEqual([KEYS[1], KEYS[2]]);
    expect(lesson.keysFromModules(['5'])).toEqual(KEYS);
    const keyOf = Object.fromEntries(KEYS.map((k) => [lesson.evidence.learningPointOf('tayin-pgcd', k), k]));
    const fromConfig = Object.fromEntries(
      LESSON_CONFIG.modules
        .filter((m) => m.teachesLearningPointIds?.length)
        .map((m) => [m.number, KEYS.filter((k) => m.teachesLearningPointIds.some((p) => keyOf[p] === k))]),
    );
    expect(MODULE_KEYS).toEqual(fromConfig);
  });
});
