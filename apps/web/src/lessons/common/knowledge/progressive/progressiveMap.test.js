import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import {
  validateGraph, initialExplore, restoreExplore, discover, nodeStates, visibleEdges, exploreProgress, revealsOf,
  linearEntries, GUIDE_KINDS, discoveryOrder, nextToDiscover, graphFromKnowledge, resolveGraph, contextOf,
} from './graphModel';
import { layoutGraph, nodeRows, roundedPath, labelWidth } from './graphLayout';
import { KIND_STYLE } from './nodeKinds';
import { KNOWLEDGE_GRAPH } from '../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii/knowledgeGraph';
import { KNOWLEDGE, PREP_ITEMS } from '../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii/content/textbook';
import { EX } from '../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii/content/exercises';

const here = dirname(fileURLToPath(import.meta.url));
const UNIT = resolve(here, '../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa');
const G = KNOWLEDGE_GRAPH;
const byId = Object.fromEntries(G.nodes.map((n) => [n.id, n]));
const ALL = new Set(['qasim-baqi', 'qasim-jidaa', 'siyagh-mutakafia', 'wahid-wa-nafsuh']);
const M1_ONLY = new Set(['qasim-baqi']);
const isGuide = (n) => GUIDE_KINDS.includes(n.kind);

// Les ids d'items que knowledge.jsx déclare — lus dans le source (le fichier
// est du JSX : on n'a pas besoin de l'exécuter pour connaître ses ids).
const knowledgeIds = [...readFileSync(join(UNIT, 'qasim-adad-tabii/knowledge.jsx'), 'utf8').matchAll(/\bid: '([^']+)'/g)].map((m) => m[1]);

// L'ancien test « prototype isolation » (une seule leçon porte la carte) est
// devenu, avec la migration, « chaque leçon porte une carte valide » :
// lessonGraphs.test.js. Ce fichier garde les assertions PROPRES à la leçon de
// référence (qasim-adad-tabii) et celles du moteur.

describe('migration fallback — a lesson without a usable graph still gets a map', () => {
  const knowledge = {
    modules: {
      2: [{ id: 'c', type: 'regles', title: 'C', summary: 'c.' }],
      1: [{ id: 'a', type: 'concepts', title: 'A', summary: 'a.' }, { id: 'b', type: 'methodes', title: 'B', summary: 'b.' }],
    },
  };

  it('derives one notebook node per item, in module order, chained by the lesson order only', () => {
    const g = graphFromKnowledge(knowledge, { sequenceLabel: 'ثمّ' });
    expect(validateGraph(g)).toEqual([]);
    expect(g.derived).toBe(true);
    expect(g.root).toBe('a');
    expect(g.nodes.map((n) => [n.id, n.kind, n.requires, n.notebook])).toEqual([
      ['a', 'concept', 'a', true], ['b', 'method', 'b', true], ['c', 'relationship', 'c', true],
    ]);
    expect(g.edges).toEqual([{ from: 'a', to: 'b', label: 'ثمّ' }, { from: 'b', to: 'c', label: 'ثمّ' }]);
    // No invented guidance, and the linear reading loses no item.
    expect(g.nodes.some((n) => GUIDE_KINDS.includes(n.kind))).toBe(false);
    expect(linearEntries(g, Object.values(knowledge.modules).flat()).map((e) => e.key)).toEqual(['a', 'b', 'c']);
  });

  it('uses the lesson graph when it is valid, the derived one when it is missing or broken, nothing when there is no item', () => {
    expect(resolveGraph(G, knowledge)).toBe(G);
    expect(resolveGraph(null, knowledge).derived).toBe(true);
    const broken = { root: 'x', nodes: [{ id: 'x', kind: 'concept', lane: 'center', title: 'x' }], edges: [{ from: 'x', to: 'ghost' }] };
    expect(resolveGraph(broken, knowledge).root).toBe('a');
    expect(resolveGraph(null, { modules: {} })).toBeNull();
  });

  it('rejects a cycle — the layout derives rows from descending edges', () => {
    const cyc = {
      root: 'a',
      nodes: ['a', 'b'].map((id) => ({ id, kind: 'concept', lane: 'center', title: id })),
      edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'a' }],
    };
    expect(validateGraph(cyc)).toContain('cycle dans les arêtes descendantes');
    // A lateral edge is not a descent: the prototype's بالباقي ⇢ بالجداء stays valid.
    expect(validateGraph({ ...cyc, edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'a', lateral: true }] })).toEqual([]);
  });

  it('shows a notebook node\'s item summary when the graph writes no context for it', () => {
    const item = { id: 'i', summary: 'ملخّص.' };
    expect(contextOf({ id: 'n', notebook: true }, item)).toEqual({ text: 'ملخّص.' });
    expect(contextOf({ id: 'n', notebook: true, context: { text: 'منقول' } }, item)).toEqual({ text: 'منقول' });
    expect(contextOf({ id: 'n', kind: 'warning' }, item)).toBeNull();
  });
});

describe('the lesson graph (qasim-adad-tabii)', () => {
  it('is valid: known kinds and lanes, no dangling edge, every node reachable from the root', () => {
    expect(validateGraph(G)).toEqual([]);
  });

  it('every kind the graph uses has a style, an icon and a family', () => {
    for (const n of G.nodes) {
      expect(KIND_STYLE[n.kind], n.id).toBeTruthy();
      expect(['core', 'guide']).toContain(KIND_STYLE[n.kind].family);
    }
  });

  it('gates every node by an item that knowledge.jsx really declares', () => {
    expect([...knowledgeIds].sort()).toEqual([...ALL].sort());
    for (const n of G.nodes) expect(ALL.has(n.requires), n.id).toBe(true);
  });

  it('quotes the textbook word for word (no rewritten mathematics)', () => {
    expect(byId.baqi.context.text).toBe(KNOWLEDGE.definitions[0].text);
    expect(byId.jidaa.context.text).toBe(KNOWLEDGE.definitions[1].text);
    expect(byId.ex143.context.text).toBe(KNOWLEDGE.definitions[0].example.text);
    expect(byId.ex120.context.text).toBe(KNOWLEDGE.definitions[1].example.text);
    expect(byId.siyagh.context.text).toBe(KNOWLEDGE.remarks[0].text);
    expect(byId.siyagh.context.list).toEqual(KNOWLEDGE.remarks[0].example);
    expect(byId.wahid.context.text).toBe(KNOWLEDGE.remarks[1].text);
    expect(byId.wahid.context.note).toBe(KNOWLEDGE.remarks[2].text);
    // 143 = 11 × 13 + 0 : l'égalité affichée est celle de la division du manuel.
    const { dividend, divisor, quotient, remainder } = KNOWLEDGE.definitions[0].example.division;
    expect(dividend).toBe(divisor * quotient + remainder);
    expect(byId.ex143.subtitle).toBe(`$${dividend} = ${divisor} \\times ${quotient} + ${remainder}$`);
  });

  it('labels every relation', () => {
    for (const e of G.edges) expect(e.label, `${e.from}->${e.to}`).toBeTruthy();
  });
});

describe('guidance layer — grounded in the lesson, attached where it helps', () => {
  it('uses only guidance the lesson supports (no tip: the only candidate is out of scope)', () => {
    expect(G.nodes.filter(isGuide).map((n) => `${n.id}:${n.kind}`).sort()).toEqual([
      'intabih:warning', 'khata-amil:common_mistake', 'khata-ittijah:common_mistake',
      'khulasa:takeaway', 'tadhakkar:prerequisite', 'tahaqqaq:check',
    ]);
  });

  it('takes its words from the lesson: exercises, أستعدّ, the textbook', () => {
    expect(byId.tadhakkar.context.text).toBe(EX['ex-1'].method);
    expect(byId.tadhakkar.context.list).toEqual([PREP_ITEMS[1].why, PREP_ITEMS[2].why]);
    const parts = Object.fromEntries(byId['khata-ittijah'].context.parts.map((p) => [p.role, p.text]));
    expect(parts.wrong).toBe(EX['ex-5'].commonError);
    expect(parts.why).toBe(EX['ex-5'].question.explain);
    expect(parts.right).toBe(EX['ex-5'].question.rows[0].why);
    expect(byId.intabih.context.note).toContain(KNOWLEDGE.remarks[2].text);
  });

  it('every common mistake says what is done, why it is wrong, and what is right', () => {
    for (const n of G.nodes.filter((x) => x.kind === 'common_mistake')) {
      const roles = n.context.parts.map((p) => p.role);
      expect(roles.slice(0, 3), n.id).toEqual(['wrong', 'why', 'right']);
    }
  });

  it('every Euclidean equality it shows is arithmetically true (and a real Euclidean division)', () => {
    const texts = G.nodes.flatMap((n) => [n.subtitle, n.context.text, n.context.formula, ...(n.context.list ?? [])]).filter(Boolean);
    let checked = 0;
    for (const t of texts) {
      for (const m of t.matchAll(/\$(\d+) = (\d+) \\times (\d+) \+ (\d+)\$/g)) {
        const [a, b, q, r] = m.slice(1).map(Number);
        expect(a, m[0]).toBe(b * q + r);
        expect(r < b, m[0]).toBe(true);
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThanOrEqual(4);
  });

  it('never hangs guidance on the root: each aid is reached from the knowledge it explains', () => {
    for (const n of G.nodes.filter(isGuide)) {
      const parents = G.edges.filter((e) => e.to === n.id).map((e) => e.from);
      expect(parents.length, n.id).toBeGreaterThan(0);
      expect(parents, n.id).not.toContain(G.root);
    }
  });

  it('keeps the core dominant: guidance is fewer than half the map', () => {
    expect(G.nodes.filter(isGuide).length).toBeLessThan(G.nodes.length / 2);
  });
});

describe('progressive discovery', () => {
  it('starts on the root alone', () => {
    const s = nodeStates(G, initialExplore(G), ALL);
    expect([...s].filter(([, v]) => v !== 'hidden').map(([k]) => k)).toEqual(['qasim']);
    expect(s.get('qasim')).toBe('available');
    expect(visibleEdges(G, s)).toEqual([]);
  });

  it('follows the lesson: definition → reminder → example → check; product → example → mistake; …', () => {
    let ex = initialExplore(G);
    const step = (id) => { const r = discover(G, ex, id, ALL); ex = r.explore; return r.newlyRevealed; };
    expect(step('qasim')).toEqual(['baqi']);
    expect(step('baqi')).toEqual(['tadhakkar', 'jidaa']);
    expect(step('tadhakkar')).toEqual(['ex143']);
    expect(step('ex143')).toEqual(['tahaqqaq']);
    expect(step('tahaqqaq')).toEqual([]);
    expect(step('jidaa')).toEqual(['ex120']);
    expect(step('ex120')).toEqual(['khata-amil', 'siyagh']);
    expect(step('khata-amil')).toEqual([]);
    expect(step('siyagh')).toEqual(['khata-ittijah', 'wahid']);
    expect(step('khata-ittijah')).toEqual([]);
    expect(step('wahid')).toEqual(['intabih']);
    expect(step('intabih')).toEqual(['khulasa']);
    expect(step('khulasa')).toEqual([]);
    expect(exploreProgress(G, ex, ALL)).toMatchObject({ done: 13, total: 13, complete: true });
    expect(visibleEdges(G, nodeStates(G, ex, ALL))).toHaveLength(G.edges.length);
  });

  it('always points at ONE next step, in the lesson\'s discovery order', () => {
    expect(discoveryOrder(G)).toEqual([
      'qasim', 'baqi', 'tadhakkar', 'ex143', 'tahaqqaq', 'jidaa', 'ex120', 'khata-amil',
      'siyagh', 'khata-ittijah', 'wahid', 'intabih', 'khulasa',
    ]);
    let ex = initialExplore(G);
    const next = () => nextToDiscover(G, nodeStates(G, ex, ALL));
    expect(next()).toBe('qasim');
    for (const id of discoveryOrder(G)) {
      expect(next()).toBe(id); // following the flash walks the whole lesson…
      ex = discover(G, ex, id, ALL).explore;
    }
    expect(next()).toBeNull(); // …and it stops when everything is discovered.
    // A locked branch is never pointed at: after module 1, the flash stays on what is open.
    let m1 = initialExplore(G);
    for (const id of ['qasim', 'baqi', 'tadhakkar', 'ex143', 'tahaqqaq']) m1 = discover(G, m1, id, M1_ONLY).explore;
    expect(nextToDiscover(G, nodeStates(G, m1, M1_ONLY))).toBeNull();
  });

  it('draws an edge only once both ends are on the map', () => {
    let ex = initialExplore(G);
    ex = discover(G, ex, 'qasim', ALL).explore;
    ex = discover(G, ex, 'baqi', ALL).explore;
    const edges = visibleEdges(G, nodeStates(G, ex, ALL)).map((e) => `${e.from}->${e.to}`).sort();
    expect(edges).toEqual(['baqi->jidaa', 'baqi->tadhakkar', 'qasim->baqi', 'qasim->jidaa'].sort());
  });

  it('never opens knowledge the cumulative map does not hold (module 1 only)', () => {
    let ex = initialExplore(G);
    ex = discover(G, ex, 'qasim', M1_ONLY).explore;
    ex = discover(G, ex, 'baqi', M1_ONLY).explore;
    const s = nodeStates(G, ex, M1_ONLY);
    expect(s.get('jidaa')).toBe('locked');
    const again = discover(G, ex, 'jidaa', M1_ONLY);
    expect(again.explore).toBe(ex);
    expect(again.newlyRevealed).toEqual([]);
    // qasim, baqi, تذكّر, 143, تحقّق — all established by module 1.
    expect(exploreProgress(G, ex, M1_ONLY)).toMatchObject({ total: 5, lockedCount: 8 });
  });

  it('full map shows everything, locked nodes as locked, without touching the exploration', () => {
    const ex = initialExplore(G);
    const s = nodeStates(G, ex, M1_ONLY, { full: true });
    expect([...s.values()].includes('hidden')).toBe(false);
    expect(s.get('wahid')).toBe('locked');
    expect(s.get('khata-ittijah')).toBe('locked');
    expect(ex).toEqual(initialExplore(G));
  });

  it('restores a stored exploration defensively', () => {
    expect(restoreExplore(G, null)).toEqual(initialExplore(G));
    expect(restoreExplore(G, { revealed: ['baqi', 'gone'], discovered: ['baqi', 'jidaa'] }))
      .toEqual({ revealed: ['qasim', 'baqi'], discovered: ['baqi'] });
  });

  it('defaults reveals to outgoing edges when a node does not list them', () => {
    const g = { root: 'a', nodes: [{ id: 'a', kind: 'concept', lane: 'center', title: 'a' }, { id: 'b', kind: 'example', lane: 'center', title: 'b' }], edges: [{ from: 'a', to: 'b' }] };
    expect(revealsOf(g, 'a')).toEqual(['b']);
    expect(validateGraph(g)).toEqual([]);
  });
});

describe('linear reading order (« المعارف مفصّلة »)', () => {
  const item = (id) => ({ id, title: id });
  const keys = (items) => linearEntries(G, items).map((e) => e.key);

  it('interleaves each aid right after what it explains; a reminder comes BEFORE its idea', () => {
    // Given in a scrambled order: the view must not depend on it.
    expect(keys(['wahid-wa-nafsuh', 'siyagh-mutakafia', 'qasim-jidaa', 'qasim-baqi'].map(item))).toEqual([
      'tadhakkar', 'qasim-baqi', 'tahaqqaq',
      'qasim-jidaa', 'khata-amil',
      'siyagh-mutakafia', 'khata-ittijah',
      'wahid-wa-nafsuh', 'intabih',
      'khulasa',
    ]);
  });

  it('keeps the knowledge items in the declaration order of knowledge.jsx (textbook order)', () => {
    const itemsOnly = linearEntries(G, knowledgeIds.map(item)).filter((e) => e.item).map((e) => e.key);
    expect(itemsOnly).toEqual(knowledgeIds);
  });

  it('numbers only what the cumulative map holds, and never drops an item', () => {
    expect(keys([item('qasim-baqi')])).toEqual(['tadhakkar', 'qasim-baqi', 'tahaqqaq']);
    expect(keys([item('outside-graph'), item('qasim-jidaa')])).toEqual(['qasim-jidaa', 'khata-amil', 'outside-graph']);
  });

  it('speaks the map\'s language: each step has the kind of the node that carries it', () => {
    const kinds = linearEntries(G, knowledgeIds.map(item)).map((e) => e.kind);
    expect(kinds).toEqual(['prerequisite', 'definition', 'check', 'definition', 'common_mistake', 'term', 'common_mistake', 'retain', 'warning', 'takeaway']);
  });
});

/** Points d'un chemin SVG (M/L/Q), pour vérifier qu'une arête ne traverse aucun nœud. */
function pathPoints(d) {
  const nums = d.replace(/[MLQ]/g, ' ').trim().split(/\s+/).map(Number);
  const pts = [];
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  return pts;
}

describe('layout', () => {
  it('derives rows from depth and resolves lane collisions deterministically', () => {
    expect(Object.fromEntries(nodeRows(G))).toEqual({
      qasim: 0, baqi: 1, jidaa: 1, tadhakkar: 2, ex120: 2, ex143: 3, 'khata-amil': 3,
      tahaqqaq: 4, siyagh: 5, 'khata-ittijah': 6, wahid: 6, intabih: 7, khulasa: 8,
    });
  });

  for (const width of [328, 400, 720, 1100]) {
    it(`relation labels never overlap one another (${width}px)`, () => {
      const L = layoutGraph(G, { width, rtl: true });
      const seen = new Set();
      const boxes = [];
      for (const e of L.edges) {
        if (!e.label || seen.has(e.label.group)) continue;
        seen.add(e.label.group);
        const w = labelWidth(e.edge.label);
        boxes.push({ key: e.key, x0: e.label.x - w / 2, x1: e.label.x + w / 2, y0: e.label.y - 11, y1: e.label.y + 11 });
      }
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const a = boxes[i]; const b = boxes[j];
          const apart = a.x1 <= b.x0 || b.x1 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0;
          expect(apart, `${a.key} × ${b.key} @${width}`).toBe(true);
        }
      }
    });

    it(`no arrow crosses a node it does not connect (${width}px)`, () => {
      const L = layoutGraph(G, { width, rtl: true });
      for (const e of L.edges) {
        const pts = pathPoints(e.d);
        for (let i = 1; i < pts.length; i += 1) {
          const [x0, y0] = pts[i - 1]; const [x1, y1] = pts[i];
          for (let k = 0; k <= 20; k += 1) {
            const x = x0 + ((x1 - x0) * k) / 20; const y = y0 + ((y1 - y0) * k) / 20;
            for (const [id, b] of L.nodes) {
              if (id === e.edge.from || id === e.edge.to) continue;
              const inside = x > b.x + 2 && x < b.x + b.w - 2 && y > b.y + 2 && y < b.y + b.h - 2;
              expect(inside, `${e.key} crosses ${id}`).toBe(false);
            }
          }
        }
      }
    });
  }

  for (const width of [328, 400, 720, 1100]) {
    it(`fits ${width}px without overlap, «بالباقي» on the reading-start side (RTL)`, () => {
      const L = layoutGraph(G, { width, rtl: true });
      const boxes = [...L.nodes.entries()];
      for (const [, b] of boxes) {
        expect(b.x).toBeGreaterThanOrEqual(0);
        expect(b.x + b.w).toBeLessThanOrEqual(width);
      }
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const [, a] = boxes[i]; const [, b] = boxes[j];
          const apart = a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
          expect(apart, `${boxes[i][0]} × ${boxes[j][0]}`).toBe(true);
        }
      }
      expect(L.nodes.get('baqi').cx).toBeGreaterThan(L.nodes.get('jidaa').cx);
      // Lanes stay readable: never below 120px.
      expect(L.nodes.get('baqi').w).toBeGreaterThanOrEqual(120);
    });
  }

  it('mirrors lanes, not arrows, in LTR', () => {
    const L = layoutGraph(G, { width: 400, rtl: false });
    expect(L.nodes.get('baqi').cx).toBeLessThan(L.nodes.get('jidaa').cx);
  });

  it('merges the two examples into one junction with ONE label', () => {
    const L = layoutGraph(G, { width: 400 });
    const merge = L.edges.filter((e) => e.edge.to === 'siyagh');
    expect(merge).toHaveLength(2);
    expect(new Set(merge.map((e) => e.label.group)).size).toBe(1);
    expect(merge[0].label.x).toBe(L.nodes.get('siyagh').cx);
  });

  it('keeps edge labels off the nodes', () => {
    for (const width of [328, 720]) {
      const L = layoutGraph(G, { width });
      for (const e of L.edges) {
        if (!e.label) continue;
        for (const [id, b] of L.nodes) {
          const inside = e.label.x > b.x && e.label.x < b.x + b.w && e.label.y > b.y && e.label.y < b.y + b.h;
          expect(inside, `${e.key} label inside ${id} @${width}`).toBe(false);
        }
      }
    }
  });

  it('grows the canvas row by row', () => {
    const L = layoutGraph(G, { width: 400 });
    expect(L.heightFor(0)).toBeLessThan(L.heightFor(1));
    expect(L.heightFor(4)).toBeGreaterThan(L.heightFor(3));
  });

  it('rounds corners without overshooting short segments', () => {
    expect(roundedPath([[0, 0], [0, 10], [4, 10]], 10)).toBe('M 0 0 L 0 8 Q 0 10 2 10 L 4 10');
  });
});
