import { describe, it, expect } from 'vitest';
import { KEYS, journey } from './journey';
import { KNOWLEDGE } from './knowledge';
import { MODULE_KEYS, NUMBERS, STORY, TABLETS } from './story';
import { FORGES } from './forges';
import { lesson } from './index';
import { differences, euclid, gcd } from './math';
import { LESSON_CONFIG } from '../lesson.config';

const card = (id) => KNOWLEDGE.graph.nodes.find((n) => n.id === id);
/** The value of a memo option: « $57$ » → 57. */
const num = (s) => Number(s.replace(/\$/g, ''));

describe('the road of « البحث عن القاسم المشترك الأكبر »', () => {
  it('its five keys, in order, each with its tablet, its forge, its memo sheet and its card', () => {
    expect(KEYS).toEqual(['farq-yabqi', 'khawarizmiyat-al-tarh', 'baqi-yabqi', 'iqlidis', 'aqall-khutuwat']);
    const items = Object.values(KNOWLEDGE.modules)
      .flat()
      .map((it) => it.id);
    expect(items).toEqual(KEYS);
    expect(Object.keys(TABLETS)).toEqual(KEYS);
    expect(Object.keys(FORGES)).toEqual(KEYS);
    expect(KEYS.map((k) => TABLETS[k].icon)).toEqual(['➖', '🪜', '🧮', '🔁', '⏱️']);
    for (const key of KEYS) {
      expect(FORGES[key].key).toBe(key);
      expect(card(lesson.cards.ofKey[key])?.notebook && card(lesson.cards.ofKey[key]).requires, key).toBe(key);
      expect(TABLETS[key].title && TABLETS[key].lines.length && TABLETS[key].math.length, key).toBeTruthy();
    }
  });

  it('the knowledge map: fifteen cards, every one placed, opened by a key, revealed along its links', () => {
    const nodes = KNOWLEDGE.graph.nodes;
    const ids = nodes.map((n) => n.id);
    expect(ids).toHaveLength(15);
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
    // a link label sits at the middle of its link: never on a row, and never inside a card of the row it is next to — at
    // least 8.5 % from a row (2026-11-19, the trainer walk: at 7.75 % the labels « تذكّر », « كيف نجده؟ » touched the top
    // of a card whose title takes two lines)
    for (const e of KNOWLEDGE.graph.edges) {
      const [x1, y1] = P[e.from];
      const [x2, y2] = P[e.to];
      expect(y2, `${e.from} → ${e.to}`).toBeGreaterThan(y1);
      const [mx, my] = [(x1 + x2) / 2, (y1 + y2) / 2];
      for (const [id, [x, y]] of Object.entries(P))
        if (Math.abs(y - my) < 8.5) expect(Math.abs(x - mx), `${e.label} under ${id}`).toBeGreaterThanOrEqual(19);
    }
  });

  it('every memo sheet is complete, its quiz has ONE right option, and every distractor is FALSE arithmetic', () => {
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
      // no Arabic letter or comma inside a formula of the sheet (KaTeX)
      for (const f of ['rule', 'example', 'chip']) expect(it.memo[f], `${it.id} ${f}`).not.toMatch(/[؀-ۿ]/);
      for (const q of it.memo.quiz)
        for (const m of `${q.q} ${q.options.join(' ')}`.matchAll(/\$([^$]*)\$/g))
          expect(m[1], q.q).not.toMatch(/[؀-ۿ]/);
      // a plain line of the sheet names no « PGCD(…) » inside Arabic (bidi, defects.md B7)
      for (const f of ['trap', 'exam', 'hook']) expect(it.memo[f], `${it.id} ${f}`).not.toMatch(/PGCD\(/);
      expect(it.summary, it.id).not.toMatch(/PGCD\(/);
    }
    const [farq, tarh, baqi, iqlidis, aqall] = items;
    const [d1, d2, d3] = NUMBERS.diff.gaps;
    // « PGCD(152 ; 95) = PGCD(95 ; …) »: exactly one option makes a TRUE equality (the draft offered 247: true too)
    const box = (x, y, opts) => opts.filter((o) => gcd(y, num(o)) === gcd(x, y));
    expect(box(d1, d2, farq.memo.quiz[0].options)).toEqual([farq.memo.quiz[0].options[farq.memo.quiz[0].correct]]);
    // « every plank that fills 152 and 95 also fills… »: only the gap of their difference
    const fills = (o) => {
      const n = Number(o.match(/\d+/)[0]);
      return [1, gcd(d1, d2)].every((p) => n % p === 0);
    };
    expect(farq.memo.quiz[1].options.filter(fills)).toEqual([`هوّة ${d3} خانة`]);
    expect(farq.memo.quiz[1].correct).toBe(1);
    const [t1, t2] = NUMBERS.tarh.gaps;
    expect(num(tarh.memo.quiz[0].options[tarh.memo.quiz[0].correct])).toBe(gcd(t1, t2));
    const [s0, s1] = differences(t1, t2);
    expect(tarh.memo.quiz[1].options[tarh.memo.quiz[1].correct]).toBe(`$${s1.x} - ${s1.y}$`);
    expect(s0.d).toBe(t1 - t2);
    const [f1, f2] = NUMBERS.fold.gaps;
    expect(box(f1, f2, baqi.memo.quiz[0].options)).toEqual([baqi.memo.quiz[0].options[baqi.memo.quiz[0].correct]]);
    const [i1, i2] = NUMBERS.iqlidis.gaps;
    expect(num(iqlidis.memo.quiz[0].options[iqlidis.memo.quiz[0].correct])).toBe(gcd(i1, i2));
    expect(iqlidis.memo.quiz[0].options.filter((o) => num(o) === gcd(i1, i2))).toHaveLength(1);
    const [e0] = euclid(i1, i2);
    expect(iqlidis.memo.quiz[1].options[iqlidis.memo.quiz[1].correct]).toBe(`$${e0.b}$ على $${e0.r}$`);
    const [r1, r2] = NUMBERS.sibaq.gaps;
    expect(num(aqall.memo.quiz[0].options[aqall.memo.quiz[0].correct])).toBe(differences(r1, r2).length);
    expect(aqall.memo.quiz[0].options.filter((o) => num(o) === differences(r1, r2).length)).toHaveLength(1);
  });

  it('the numbers the cards write are the story’s, and true', () => {
    expect(card('mithal-152').context.formula).toBe('$152 - 95 = 57$');
    expect(card('mithal-152').context.text).toContain('$57 = 19 \\times 3$');
    expect(card('mithal-259').context.list).toEqual(differences(259, 185).map((s) => `$${s.x} - ${s.y} = ${s.d}$`));
    expect(card('mithal-259').context.list.at(-1)).toBe('$37 - 37 = 0$');
    expect(card('mithal-962').context.formula).toBe('$962 = 296 \\times 3 + 74$');
    expect(card('mithal-962').context.text).toContain('$962 - 296 - 296 - 296 = 74$');
    expect(card('mithal-1833').context.list).toEqual([
      '$1833 = 546 \\times 3 + 195$',
      '$546 = 195 \\times 2 + 156$',
      '$195 = 156 \\times 1 + 39$',
      '$156 = 39 \\times 4 + 0$',
    ]);
    expect(card('khata-farq').context.parts[1].text).toContain('$95 = 57 \\times 1 + 38$');
    expect(card('khata-hasil').context.parts[1].text).toContain('$\\mathrm{PGCD}(296 ; 3) = 1$');
    expect(card('muqarana').subtitle).toBe('31 عملية طرح أم قسمتان؟');
    expect(JSON.stringify(KNOWLEDGE)).not.toMatch(/\d ،/);
  });

  it('the story is playable: the mirrors open on D, F (two), H and J, the modules are done when he holds their keys', () => {
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
    expect(opened).toEqual(['farq-yabqi', 'khawarizmiyat-al-tarh', 'iqlidis', 'aqall-khutuwat']);
    // onArrive bears being run twice: a forge already sealed never opens again; on F the second mirror waits its turn
    game.state.keys = [KEYS[0], KEYS[1]];
    opened.length = 0;
    STORY.islands.forEach((_, k) => STORY.onArrive(game, k));
    expect(opened).toEqual(['baqi-yabqi', 'iqlidis', 'aqall-khutuwat']);
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
    // the tablet of 🪜 closed: the mirror of 🧮 opens on the same island, once
    expect(opened).toEqual(['baqi-yabqi']);
    expect(flags.key4).toBe(true);
    expect(marked.map((m) => m.join())).toEqual(['', '1', '1,2', '1,2', '1,2,3,4']);
    // …and not when he holds 🧮 already (a page opened again after it)
    STORY.afterKey[KEYS[1]](game);
    expect(opened).toEqual(['baqi-yabqi']);
    for (const m of modules) expect(lesson.keysFromModules([m]).every((k) => KEYS.includes(k))).toBe(true);
    STORY.onBossPaid(game);
    expect(modules.at(-1)).toBe('7');
    // the forge waiting in front of a mirror, and the one after it is sealed (on F: the second mirror, then none)
    for (const [stage, held, key, then] of [
      [3, [], KEYS[0], null],
      [5, [KEYS[0]], KEYS[1], KEYS[2]],
      [5, KEYS.slice(0, 2), KEYS[2], null],
      [7, KEYS.slice(0, 3), KEYS[3], null],
      [9, KEYS.slice(0, 4), KEYS[4], null],
    ]) {
      expect(STORY.pendingForge({ state: { stage, keys: held } })).toBe(key);
      expect(STORY.pendingForge({ state: { stage, keys: [...held, key] } })).toBe(then);
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
      T.divide(28),
      T.costAsk(28, 73),
      T.err.long(56, 37),
      T.err.sum(56, 36, 10),
    ];
    const own = [seg.a, seg.boss.price, ...NUMBERS.boss.lanes].join('|');
    for (const line of said) expect(line, line).toMatch(new RegExp(`\\b(${own})\\b`));
    const words = JSON.stringify(STORY.text);
    // nothing of the earlier lessons' stores: their gaps, their prices, their piers, their flowers
    expect(words).not.toMatch(/\b(756|1850|650|154|238|392)\b|رفّ|العنيدة|بلّورة|الورود|الزنابق|الرصيف/);
  });

  it('the keys his own progress proves are his from the first screen — the keys of the modules he completed', () => {
    expect(lesson.keysFromModules([])).toEqual([]);
    expect(lesson.keysFromModules(['0', '1'])).toEqual(KEYS.slice(0, 2));
    expect(lesson.keysFromModules(['2'])).toEqual(KEYS.slice(0, 3));
    expect(lesson.keysFromModules(['3', '4'])).toEqual(KEYS.slice(1));
    const keyOf = Object.fromEntries(KEYS.map((k) => [lesson.evidence.learningPointOf('bahth-pgcd', k), k]));
    const fromConfig = Object.fromEntries(
      LESSON_CONFIG.modules
        .filter((m) => m.teachesLearningPointIds?.length)
        .map((m) => [m.number, KEYS.filter((k) => m.teachesLearningPointIds.some((p) => keyOf[p] === k))]),
    );
    expect(MODULE_KEYS).toEqual(fromConfig);
  });
});
