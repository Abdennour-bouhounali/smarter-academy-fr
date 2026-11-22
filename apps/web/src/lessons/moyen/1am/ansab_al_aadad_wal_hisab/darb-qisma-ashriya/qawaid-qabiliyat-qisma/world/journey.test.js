import { describe, it, expect, vi } from 'vitest';
import katex from 'katex';
import { KEYS, journey } from './journey';
import { KNOWLEDGE } from './knowledge';
import { STORY, TABLETS } from './story';
import { FORGES } from './forges';
import { lesson } from './index';

describe('the road of « قواعد قابلية القسمة »', () => {
  it('its four keys, in order, each with its tablet, its forge, its memo sheet and its card', () => {
    expect(KEYS).toEqual(['raqm-alahad', 'majmu-arqam', 'raqmayn-akhirayn', 'baqi-sifr']);
    const items = Object.values(KNOWLEDGE.modules)
      .flat()
      .map((it) => it.id);
    expect([...items].sort()).toEqual([...KEYS].sort());
    expect(Object.keys(TABLETS)).toEqual(KEYS);
    expect(Object.keys(FORGES)).toEqual(KEYS);
    for (const key of KEYS) {
      expect(FORGES[key].key).toBe(key);
      const card = KNOWLEDGE.graph.nodes.find((n) => n.id === lesson.cards.ofKey[key]);
      expect(card?.notebook && card.requires, key).toBe(key);
      expect(TABLETS[key].title && TABLETS[key].lines.length && TABLETS[key].math.length, key).toBeTruthy();
    }
  });

  it('the knowledge map: about twelve cards, every card placed, opened by a key, revealed along its links', () => {
    const nodes = KNOWLEDGE.graph.nodes;
    const ids = nodes.map((n) => n.id);
    expect(ids.length).toBeGreaterThanOrEqual(11);
    expect(ids.length).toBeLessThanOrEqual(14);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(KNOWLEDGE.positions).sort()).toEqual([...ids].sort());
    expect(ids).toContain(KNOWLEDGE.graph.root);
    for (const n of nodes) {
      expect(KEYS, n.id).toContain(n.requires);
      const out = KNOWLEDGE.graph.edges.filter((e) => e.from === n.id).map((e) => e.to);
      expect([...n.reveals].sort(), n.id).toEqual(out.sort());
      expect(`${n.title} ${n.subtitle} ${JSON.stringify(n.context ?? {})}`).not.toMatch(/undefined|NaN/);
    }
    for (const e of KNOWLEDGE.graph.edges)
      expect(ids, `${e.from} → ${e.to}`).toEqual(expect.arrayContaining([e.from, e.to]));
    for (const id of [...Object.values(lesson.cards.ofKey), ...Object.values(lesson.cards.ofExercise)])
      expect(ids).toContain(id);
    expect(ids).toContain(lesson.cards.fallback);
  });

  it('the facts written on the cards are computed: 81, 111, 134, 136 and 1575', () => {
    const text = JSON.stringify(KNOWLEDGE.graph);
    for (const [, a, b, q, r] of text.matchAll(/(\d+) = (\d+) \\\\times (\d+)(?: \+ (\d+))?/g))
      expect(Number(b) * Number(q) + Number(r ?? 0), `${a} = ${b} × ${q} + ${r}`).toBe(Number(a));
    expect(text).toContain('134');
    expect(134 % 2 === 0 && 134 % 4 !== 0).toBe(true);
    expect(111 % 3 === 0 && 111 % 9 !== 0).toBe(true);
  });

  it('every memo sheet is complete and its two questions have one answer in range', () => {
    for (const it of Object.values(KNOWLEDGE.modules).flat()) {
      for (const f of ['rule', 'hook', 'example', 'trap', 'exam', 'chip'])
        expect(it.memo[f], `${it.id} ${f}`).toBeTruthy();
      expect(it.memo.quiz).toHaveLength(2);
      for (const q of it.memo.quiz) expect(q.options[q.correct], q.q).toBeTruthy();
      expect(JSON.stringify(it)).not.toMatch(/undefined|NaN/);
    }
    // the right option of each quiz is TRUE (its numbers recomputed)
    const [ahad, majmu] = KNOWLEDGE.modules[1];
    expect(ahad.memo.quiz[0].options.map((o) => Number(o.replace(/\$/g, '')) % 5 === 0)).toEqual([false, false, true]);
    expect(majmu.memo.quiz[0].correct).toBe(1);
    const four = KNOWLEDGE.modules[3][0];
    expect(four.memo.quiz[0].options.map((o) => Number(o.replace(/\$/g, '')) % 4 === 0)).toEqual([false, true, false]);
  });

  it('a memo rule is written for an 11-year-old: words and numbers, a formula the screens can draw, one worked number', () => {
    const quiet = vi.spyOn(console, 'warn').mockImplementation(() => {});
    /** The formula as the screens draw it (`$…$` through KaTeX): its boxes laid left to right, and the words in them. */
    const drawn = (tex) => {
      const html = katex.renderToString(tex, { throwOnError: true, strict: 'ignore' });
      const body = html.slice(html.indexOf('katex-html'));
      return {
        bases: (body.match(/class="(katex-)?base"/g) ?? []).length,
        texts: [...body.matchAll(/<span class="mord text"[^>]*>(.*?)<\/span><\/span>/g)].map((m) =>
          m[1].replace(/<[^>]+>/g, '').replace(/ /g, ' '),
        ),
      };
    };
    /** What an equality of an example says, its red marks taken off: « 4{6}=2\times 23 » → 46 = 2 × 23. */
    const plain = (tex) => tex.replace(/\\textcolor\{#e11d48\}\{([^{}]*)\}/g, '$1');
    const value = (side) =>
      side
        .split('+')
        .map((term) =>
          term
            .split('\\times')
            .map(Number)
            .reduce((p, x) => p * x, 1),
        )
        .reduce((t, x) => t + x, 0);
    const WORDS = {
      'raqm-alahad': ['رقم الآحاد 0، 2، 4، 6 أو 8: يقبل القسمة على 2', 'رقم الآحاد 0 أو 5: يقبل القسمة على 5'],
      'majmu-arqam': ['مجموع الأرقام يقبل القسمة على 3: العدد كذلك', 'مجموع الأرقام يقبل القسمة على 9: العدد كذلك'],
      'raqmayn-akhirayn': ['العدد المشكّل من رقمَي الآحاد والعشرات', 'يقبل القسمة على 4: العدد كلّه كذلك'],
    };
    try {
      for (const it of Object.values(KNOWLEDGE.modules).flat()) {
        const { rule, example, chip } = it.memo;
        for (const f of [rule, example, chip]) {
          expect(() => drawn(f), `${it.id}: ${f}`).not.toThrow();
          // nothing above 1AM: no bar over digits, no « belongs to », no set, no arrow of implication
          expect(f, `${it.id}: ${f}`).not.toMatch(/\\overline|\\in\b|\\Rightarrow|\\to\b|\\\{|\\mid|\\div/);
        }
        const rows = WORDS[it.id];
        if (rows) {
          // the three reading rules are SENTENCES: no letter stands for a digit
          expect(rule, it.id).not.toMatch(/(?<![a-z\\{])\b[a-z]\b/);
          const d = drawn(rule);
          // one box: a second one (after a sign of relation) would be laid to the right of the first — out of order
          expect(d.bases, it.id).toBe(1);
          // each row is its pieces in reading order: an Arabic sentence that begins with a letter and ends with a letter
          // or a number (a sign at either end would jump to the other side of a left-to-right box)
          const said = rule
            .replace(/^\\begin\{array\}\{c\}|\\end\{array\}$/g, '')
            .split('\\\\ ')
            .map((row) => [...row.matchAll(/\\text\{([^{}]*)\}/g)].map((m) => m[1]).join(''));
          expect(said, it.id).toEqual(rows);
          expect(d.texts.join(''), it.id).toBe(rows.join(''));
          for (const row of said) expect(row, row).toMatch(/^[ء-ي].*[ء-ي0-9]$/);
        }
        // the worked number: every equality of the example is true
        const eqs = plain(example)
          .split('\\ ,\\ ')
          .map((e) => e.split('=').map(value));
        expect(eqs.length, example).toBeGreaterThanOrEqual(1);
        for (const sides of eqs) {
          expect(sides.length, example).toBeGreaterThanOrEqual(2);
          expect(new Set(sides).size, `${it.id}: ${plain(example)}`).toBe(1);
        }
      }
    } finally {
      quiet.mockRestore();
    }
    // the worked numbers are the story's: 46 and 95, 81, 136 — and the term is the bank's
    const text = JSON.stringify(KNOWLEDGE);
    expect(plain(KNOWLEDGE.modules[1][0].memo.example)).toBe('46=2\\times 23\\ ,\\ 95=5\\times 19');
    expect(plain(KNOWLEDGE.modules[1][1].memo.example)).toBe('8+1=9\\ ,\\ 81 = 9 \\times 9');
    expect(plain(KNOWLEDGE.modules[3][0].memo.example)).toBe('136=100+36\\ ,\\ 36=4\\times 9');
    expect(text).toContain('العدد المشكّل من رقمَي الآحاد والعشرات');
    expect(text.includes('المكوّن')).toBe(false);
  });

  it('the story is playable: one island more than segments, a forge waits on each island that opens one', () => {
    expect(STORY.islands).toHaveLength(STORY.segments.length + 1);
    expect(STORY.islands.filter((i) => i.feature === 'stone')).toHaveLength(1);
    expect(STORY.segments.filter((s) => s.kind === 'rail')).toHaveLength(1);
    expect(STORY.segments.filter((s) => s.boss)).toHaveLength(1);
    // the forges open in the order of the keys: arriving on islands 2, 4 and 6, the last one from the stone
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
      wait: () => ({ then: () => {} }),
      save: () => {},
      refreshObjective: () => {},
    };
    STORY.islands.forEach((_, k) => STORY.onArrive(game, k));
    expect(opened).toEqual(KEYS.slice(0, 3));
    expect(STORY.onStone(game)).toEqual({ quiz: 'stone' });
    STORY.onQuiz(game, 'stone');
    expect(opened.at(-1)).toBe('baqi-sifr');
    expect(STORY.onStone(game)).toEqual({ forge: 'baqi-sifr' });
    for (const key of KEYS) STORY.afterKey[key](game);
    STORY.onBossPaid(game);
    expect(flags.key4).toBe(true);
    expect(modules).toEqual(['1', '3', '2', '6']);
    for (const [stage, key] of [
      [2, KEYS[0]],
      [4, KEYS[1]],
      [6, KEYS[2]],
    ])
      expect(STORY.pendingForge({ state: { stage, keys: [] } })).toBe(key);
    expect(STORY.pendingForge({ state: { stage: 2, keys: [KEYS[0]] } })).toBe(null);
    expect(journey.examOpen(KEYS, {})).toBe(false);
  });

  it('the store of the last bridge says the numbers of THIS lesson, in its own words', () => {
    const seg = STORY.segments.find((x) => x.boss);
    const T = STORY.text.boss;
    const said = [
      T.mission,
      T.choose,
      T.price,
      T.divide(45),
      T.costAsk(45, 35),
      T.err.long(50, 32),
      T.err.sum(50, 31, 20),
    ];
    for (const line of said) expect(line, line).toMatch(new RegExp(`\\b(${seg.a}|${seg.boss.price})\\b`));
    expect(said.join(' ')).not.toMatch(/756|1850|1015|بلّورة|undefined|NaN/);
  });

  it('the keys his own progress proves are his from the first screen', () => {
    expect(lesson.keysFromModules([])).toEqual([]);
    expect(lesson.keysFromModules(['0', '1'])).toEqual(KEYS.slice(0, 2));
    expect(lesson.keysFromModules(['1', '3'])).toEqual(KEYS.slice(0, 3));
    expect(lesson.keysFromModules(['2'])).toEqual([KEYS[0], KEYS[1], KEYS[3]]);
    expect(lesson.keysFromModules(['1', '2', '3'])).toEqual(KEYS);
  });
});
