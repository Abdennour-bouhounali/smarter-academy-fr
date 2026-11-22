import { describe, it, expect } from 'vitest';
import { KEYS, journey } from './journey';
import { KNOWLEDGE } from './knowledge';
import { STORY, TABLETS } from './story';
import { FORGES } from './forges';
import { lesson } from './index';

describe('the road of « القسمة الإقليدية وحصر حاصل القسمة »', () => {
  it('its three keys, in order, each with its tablet, its forge, its memo sheet and its card', () => {
    expect(KEYS).toEqual(['qisma-ay-adad', 'hasr-hasil', 'inidam-baqi']);
    const items = Object.values(KNOWLEDGE.modules)
      .flat()
      .map((it) => it.id);
    expect(items).toEqual(KEYS);
    expect(Object.keys(TABLETS)).toEqual(KEYS);
    expect(Object.keys(FORGES)).toEqual(KEYS);
    for (const key of KEYS) {
      expect(FORGES[key].key).toBe(key);
      const card = KNOWLEDGE.graph.nodes.find((n) => n.id === lesson.cards.ofKey[key]);
      expect(card?.notebook && card.requires, key).toBe(key);
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
    for (const e of KNOWLEDGE.graph.edges)
      expect(ids, `${e.from} → ${e.to}`).toEqual(expect.arrayContaining([e.from, e.to]));
    for (const id of [...Object.values(lesson.cards.ofKey), ...Object.values(lesson.cards.ofExercise)])
      expect(ids).toContain(id);
    expect(ids).toContain(lesson.cards.fallback);
  });

  it('the cards’ examples are true, with LONG divisors: 4576 = 248 × 18 + 112 by a digit corrected; 26 < 5475 ÷ 208 < 27', () => {
    const card = (id) => KNOWLEDGE.graph.nodes.find((n) => n.id === id);
    // ten planks, then 9 tried (too big) and 8 kept
    expect(card('mithal-taqdir').title).toBe('4576 على 248');
    expect(card('mithal-taqdir').context.list).toEqual([
      '$248 \\times 10 = 2480$ و $4576 - 2480 = 2096$',
      'نجرّب 9: $248 \\times 9 = 2232$ يتجاوز 2096',
      'ننقص إلى 8: $2096 - 248 \\times 8 = 112$',
    ]);
    expect([248 * 10, 4576 - 2480, 248 * 9, 2096 - 248 * 8, 248 * 18 + 112]).toEqual([2480, 2096, 2232, 112, 4576]);
    expect(card('mithal-taqdir').context.formula).toBe('$4576 = 248 \\times 18 + 112$');
    expect(card('mithal-hasr').subtitle).toBe('$26 < 5475 \\div 208 < 27$');
    expect(card('mithal-hasr').context.list).toEqual(['$208 \\times 26 = 5408$', '$208 \\times 27 = 5616$']);
    expect([208 * 26, 208 * 27, 5408 <= 5475, 5475 < 5616]).toEqual([5408, 5616, true, true]);
    expect(card('siyagh').subtitle).toBe('$1080 = 45 \\times 24$');
    expect(card('khata-baqi').subtitle).toBe('$4576 = 365 \\times 11 + 561$');
    expect([365 * 11 + 561, 561 >= 365]).toEqual([4576, true]);
    expect(card('khata-lazim').context.parts.map((p) => p.text)).toEqual([
      '$1250 = 48 \\times 26 + 2$، إذن تكفي 26 رحلة.',
      'بعد 26 رحلة مملوءة يبقى على الرصيف صندوقان.',
      '26 رحلة مملوءة، و 27 رحلة لازمة: القيمة بالزيادة.',
    ]);
  });

  it('b is « المقسوم عليه » everywhere; « قاسم » is kept for « b يقسم a », and the link is said ONCE', () => {
    const all = JSON.stringify(KNOWLEDGE) + JSON.stringify(TABLETS);
    expect(all).toContain('المقسوم عليه');
    expect(all).not.toContain('القاسم');
    expect(all.match(/قاسم للعدد/g)).toHaveLength(1);
    const card = KNOWLEDGE.graph.nodes.find((n) => n.id === 'siyagh');
    expect(card.requires).toBe('inidam-baqi'); // on a card of the third key
    expect(card.context.note).toBe('عندما يكون الباقي معدومًا، وعندئذ فقط، نقول إنّ المقسوم عليه 45 قاسم للعدد 1080.');
    const names = KNOWLEDGE.graph.nodes.find((n) => n.id === 'mufradat');
    expect(names.subtitle).toBe('المقسوم، المقسوم عليه، الحاصل، الباقي');
    expect(names.context.text).toBe('4576 المقسوم، 365 المقسوم عليه، 12 الحاصل، 196 الباقي.');
  });

  it('the bank’s notation of the quotient is on the map and on a memo sheet, with a real fraction bar', () => {
    const card = KNOWLEDGE.graph.nodes.find((n) => n.id === 'muqarraba');
    expect(card.context.text).toContain('يُكتب أيضًا $\\frac{a}{b}$');
    expect(card.context.formula).toBe('$26 < \\dfrac{5475}{208} < 27$');
    expect(KNOWLEDGE.modules[1][1].memo.example).toContain('\\dfrac{5475}{208}');
  });

  it('no sheet states a rule that an edge refutes: the bracket and its two values need a remainder that is not 0', () => {
    const [ay, hasr] = KNOWLEDGE.modules[1];
    expect(hasr.summary).toMatch(/^إذا لم يكن الباقي معدومًا/);
    expect(hasr.memo.rule).toContain('0<r<b');
    expect(hasr.memo.rule).not.toContain('\\neq');
    expect(ay.memo.rule).toContain('<b');
    const card = (id) => KNOWLEDGE.graph.nodes.find((n) => n.id === id);
    expect(card('khulasa').context.note).toContain('$0 < r < b$');
    expect(card('muqarraba').context.text).toContain('إذا لم يكن الباقي معدومًا');
    // the edges, computed: with r = 0 the full planks ARE the planks needed (1080 by 45: 24 and 24) …
    expect([Math.floor(1080 / 45), Math.ceil(1080 / 45)]).toEqual([24, 24]);
    // … and a writing with r ≥ b is outside the bracket (4576 = 365 × 11 + 561: 4576 ÷ 365 is past 12)
    expect(4576 / 365 > 11 + 1).toBe(true);
    // a < b and a = b: 30 = 47 × 0 + 30 gives 0 < 30 ÷ 47 < 1; 47 = 47 × 1 + 0 gives 47 ÷ 47 = 1
    expect([0 < 30 / 47 && 30 / 47 < 1, 47 / 47]).toEqual([true, 1]);
  });

  it('every memo sheet is complete and its two questions have one answer in range, computed', () => {
    for (const it of Object.values(KNOWLEDGE.modules).flat()) {
      for (const f of ['rule', 'hook', 'example', 'trap', 'exam', 'chip'])
        expect(it.memo[f], `${it.id} ${f}`).toBeTruthy();
      expect(it.memo.quiz).toHaveLength(2);
      for (const q of it.memo.quiz) expect(q.options[q.correct], q.q).toBeTruthy();
      expect(JSON.stringify(it)).not.toMatch(/undefined|NaN/);
    }
    const [ay, hasr] = KNOWLEDGE.modules[1];
    expect(ay.memo.quiz[0].options[1]).toBe('$4576 = 365 \\times 12 + 196$');
    expect(ay.memo.quiz[1].options).toEqual(['$365$', '$364$', '$366$']);
    expect(hasr.memo.quiz[0].options[1]).toBe('$17 < 5475 \\div 312 < 18$');
    expect([312 * 17 <= 5475, 5475 < 312 * 18]).toEqual([true, true]);
    expect(hasr.memo.quiz[1].options[1]).toBe('$27$');
    // the sheet of the first key shows a divisor of three digits
    expect(ay.summary).toContain('ثلاثة أرقام');
    expect(ay.memo.example).toContain('365');
  });

  it('the story is playable: one island more than segments, a forge waits on the islands that open one', () => {
    expect(STORY.islands).toHaveLength(STORY.segments.length + 1);
    expect(STORY.islands.filter((i) => i.feature === 'stone')).toHaveLength(1);
    expect(STORY.segments.filter((s) => s.kind === 'rail')).toHaveLength(1);
    expect(STORY.segments.filter((s) => s.boss)).toHaveLength(1);
    // the forges open in the order of the keys: arriving on islands 3 and 4 (after the recall and the long planks),
    // the last one from the stone
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
    const at = STORY.islands.map((_, k) => {
      STORY.onArrive(game, k);
      return opened.length;
    });
    expect(opened).toEqual(KEYS.slice(0, 2));
    expect(at).toEqual([0, 0, 0, 1, 2, 2, 2, 2, 2]); // nothing is forged on the island of the recall
    // each mirror is named after the island where it opens
    expect(FORGES[KEYS[0]].text.title).toBe(`مرآة ${STORY.islands[3].name}`);
    expect(FORGES[KEYS[1]].text.title).toBe(`مرآة ${STORY.islands[4].name}`);
    expect(FORGES[KEYS[2]].text.title).toBe(`مرآة ${STORY.islands.find((i) => i.feature === 'stone').name}`);
    expect(STORY.onStone(game)).toEqual({ quiz: 'trips' });
    STORY.onQuiz(game, 'trips');
    expect(opened.at(-1)).toBe('inidam-baqi');
    expect(STORY.onStone(game)).toEqual({ forge: 'inidam-baqi' });
    for (const key of KEYS) STORY.afterKey[key](game);
    expect(flags.key4).toBe(true);
    STORY.onBossPaid(game);
    expect(modules).toEqual(['1', '3', '2', '5']);
    for (const [stage, key] of [
      [3, KEYS[0]],
      [4, KEYS[1]],
    ])
      expect(STORY.pendingForge({ state: { stage, keys: [] } })).toBe(key);
    expect(STORY.pendingForge({ state: { stage: 3, keys: [KEYS[0]] } })).toBe(null);
    expect(STORY.pendingForge({ state: { stage: 2, keys: [] } })).toBe(null);
    expect(STORY.pendingForge({ state: { stage: 7, keys: [] } })).toBe(null);
    expect(journey.examOpen(KEYS, {})).toBe(false);
  });

  it('a bridge with its own sentence says it; the others are left to the world', () => {
    const said = [];
    const game = { T: STORY.text, say: (s) => said.push(s) };
    const held = STORY.segments.filter((s) => s.kind === 'bridge' && !s.boss).map((s) => STORY.onHold(game, s));
    expect(held).toEqual([true, true, false, true, true, false]);
    expect(said.join(' ')).not.toMatch(/undefined|NaN/);
    // every sentence the story says on the way exists and is worded
    const { say } = STORY.text;
    for (const k of [
      'hello',
      'first',
      'recall',
      'recallOk',
      'long',
      'far',
      'farOk',
      'after',
      'afterOk',
      'f',
      'g1080',
      'h',
    ])
      expect(typeof say[k], k).toBe('string');
    expect(say.recall).toContain('912');
    expect(say.long).toContain('208 و 248 و 365');
  });

  it('the keys his own progress proves are his from the first screen', () => {
    expect(lesson.keysFromModules([])).toEqual([]);
    expect(lesson.keysFromModules(['0', '1'])).toEqual(KEYS.slice(0, 1));
    expect(lesson.keysFromModules(['1', '3'])).toEqual(KEYS.slice(0, 2));
    expect(lesson.keysFromModules(['1', '2', '3'])).toEqual(KEYS);
  });
});
