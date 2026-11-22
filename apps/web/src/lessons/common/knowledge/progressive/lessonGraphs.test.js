import { describe, it, expect } from 'vitest';
import {
  validateGraph, GUIDE_KINDS, discoveryOrder, linearEntries, revealsOf, nodeStates, initialExplore, discover, nextToDiscover,
} from './graphModel';
import { layoutGraph, labelWidth } from './graphLayout';
import { KIND_STYLE } from './nodeKinds';

/**
 * LA CARTE PROGRESSIVE DE CHAQUE LEÇON — les invariants de KNOWLEDGE_MAP.md
 * A.14, pour toutes les leçons qui déclarent une carte (et plus seulement
 * pour la leçon de référence). Une nouvelle leçon entre ici sans rien écrire : il lui
 * suffit d'exister. Ce que ces tests ne jugent pas — la PERTINENCE d'une aide,
 * la justesse d'une relation — reste une relecture humaine (A.14).
 */
const configs = import.meta.glob('../../../**/lesson.config.js', { eager: true });
const knowledgeMods = import.meta.glob('../../../**/knowledge.jsx', { eager: true });
const graphMods = import.meta.glob('../../../**/knowledgeGraph.js', { eager: true });
const knowledgeSources = import.meta.glob('../../../**/knowledge.jsx', { eager: true, query: '?raw', import: 'default' });
// A v2 lesson whose old root knowledge.jsx / knowledgeGraph.js were deleted (LESSON_V2.md §2): its ONE knowledge is the
// file its pack names, `world/knowledge.js` — the world's « خريطة المعارف », drawn by the world's own page at its own
// `positions` (not by this renderer's layout) and checked by the lesson's `world/journey.test.js`. It is not held to the
// invariants below, which are those of the lesson page's 🧠 map; only its presence is checked here.
const worldKnowledge = import.meta.glob('../../../**/world/knowledge.js', { eager: true });
// Les SOURCES de la leçon (manuel, exercices, محاور), telles qu'écrites.
// A v2 lesson (LESSON_V2.md §2) has no module page any more: its text is its world and its board.
const lessonSources = import.meta.glob(
  ['../../../**/content/*.js', '../../../**/modules/*.jsx', '../../../**/world/*.js', '../../../**/board/*.js', '!../../../**/*.test.js'],
  { eager: true, query: '?raw', import: 'default' },
);

// CONTENT DEBT, to be paid — never extended: aids that quoted a module page deleted with the lesson's old version
// (2026-11-18, docs/reports/OLD_VERSION_TRACE_2026-11-18.md, follow-up 6). Each must be reworded on the text of the
// lesson's world or board (then its entry goes); the test fails as soon as an entry is grounded again.
const KNOWN_UNGROUNDED = { 'qasim-adad-tabii': ['khata-amil'] };

const dirOf = (path) => path.slice(0, path.lastIndexOf('/'));
/** The lessons whose only knowledge is their world's (no root knowledge.jsx): { dir, id, knowledge }. */
const WORLD_ONLY = Object.entries(worldKnowledge)
  .map(([path, mod]) => ({ dir: dirOf(dirOf(path)), mod }))
  .filter(({ dir }) => !knowledgeMods[`${dir}/knowledge.jsx`])
  .map(({ dir, mod }) => ({ dir, id: configs[`${dir}/lesson.config.js`]?.LESSON_CONFIG?.id, knowledge: mod }));
const LESSONS = Object.entries(configs)
  .map(([path, mod]) => ({ dir: dirOf(path), config: mod.LESSON_CONFIG }))
  .filter(({ config }) => config?.knowledgeMap === true)
  .filter(({ dir }) => !WORLD_ONLY.some((l) => l.dir === dir))
  .map(({ dir, config }) => ({
    id: config.id,
    config,
    knowledge: knowledgeMods[`${dir}/knowledge.jsx`]?.LESSON_KNOWLEDGE,
    reexport: knowledgeMods[`${dir}/knowledge.jsx`]?.KNOWLEDGE_GRAPH,
    source: knowledgeSources[`${dir}/knowledge.jsx`] ?? '',
    // Le texte tel que l'élève le lit : les échappements JS (« \\times ») défaits.
    sources: Object.entries(lessonSources).filter(([p]) => p.startsWith(`${dir}/`)).map(([, raw]) => raw).join('\n').replace(/\\\\/g, '\\'),
    graph: graphMods[`${dir}/knowledgeGraph.js`]?.KNOWLEDGE_GRAPH,
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

const isGuide = (n) => GUIDE_KINDS.includes(n.kind);

/** Tous les textes qu'un nœud AFFICHE (sous-titre, contexte, parties). */
function textsOf(node) {
  const c = node.context ?? {};
  return [node.subtitle, c.text, c.formula, c.note, ...(c.list ?? []), ...(c.parts ?? []).map((p) => p.text)].filter(Boolean);
}

/** Évalue une expression purement numérique (chiffres, + − × ÷, parenthèses), sinon null. */
function numeric(expr) {
  const e = expr.replace(/\\,|\\ |\\!/g, '').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/−/g, '-').trim();
  if (!e || !/^[\d\s+\-*/().]+$/.test(e) || !/\d/.test(e)) return null;
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${e});`)();
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
/** « PGCD(28 ; 42) », « PGCD$(a ; b)$ », « \mathrm{PGCD}(8\ ;\ 88) » → [x, y] numériques, ou null. */
const PGCD_RE = /PGCD\s*\(\s*(\d+)\s*;\s*(\d+)\s*\)/g;
const plain = (t) => t.replace(/\\mathrm\{PGCD\}/g, 'PGCD').replace(/\$/g, '').replace(/\\ /g, ' ').replace(/\\,/g, '');

describe('a v2 lesson whose only knowledge is its world’s', () => {
  it('the four lessons whose old map was deleted are found', () => {
    expect(WORLD_ONLY.length).toBeGreaterThanOrEqual(4);
  });
  it.each(WORLD_ONLY.map((l) => [l.id, l]))('%s: its world/knowledge.js holds the map and the sheets', (_id, l) => {
    expect(l.knowledge.KNOWLEDGE_GRAPH?.nodes?.length).toBeGreaterThan(0);
    expect(Object.keys(l.knowledge.LESSON_KNOWLEDGE?.modules ?? {}).length).toBeGreaterThan(0);
  });
});

describe('every lesson is migrated to the progressive map', () => {
  it('finds the lessons that declare a knowledge map', () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(9);
  });

  it.each(LESSONS.map((l) => [l.id, l]))('%s declares the progressive mode and exports a hand-authored graph', (_id, l) => {
    expect(l.config.knowledgeMapMode).toBe('progressive');
    expect(l.graph, 'knowledgeGraph.js').toBeTruthy();
    expect(l.reexport, 'knowledge.jsx re-exports KNOWLEDGE_GRAPH').toBe(l.graph);
    expect(l.graph.derived, 'never the migration fallback').toBeUndefined();
  });
});

describe.each(LESSONS.filter((l) => l.graph).map((l) => [l.id, l]))('the graph of %s', (_id, l) => {
  const G = l.graph;
  const byId = Object.fromEntries(G.nodes.map((n) => [n.id, n]));
  const moduleOf = new Map();
  for (const [m, list] of Object.entries(l.knowledge.modules)) for (const it of list) if (!moduleOf.has(it.id)) moduleOf.set(it.id, Number(m));
  const items = Object.values(l.knowledge.modules).flat();
  const itemIds = [...new Set(items.map((it) => it.id))];

  it('is valid: known kinds and lanes, no dangling edge, no cycle, every node reachable from the root', () => {
    expect(validateGraph(G)).toEqual([]);
    for (const n of G.nodes) expect(KIND_STYLE[n.kind], n.id).toBeTruthy();
  });

  it('gates every node by an item knowledge.jsx really declares', () => {
    for (const n of G.nodes) expect(moduleOf.has(n.requires), `${n.id} requires ${n.requires}`).toBe(true);
  });

  it('starts on an idea of the FIRST module that teaches knowledge (the map is never empty after it)', () => {
    const first = Math.min(...moduleOf.values());
    expect(moduleOf.get(byId[G.root].requires)).toBe(first);
    expect(isGuide(byId[G.root])).toBe(false);
  });

  it('carries every knowledge item on exactly ONE notebook node — nothing is lost, nothing is doubled', () => {
    const carried = G.nodes.filter((n) => n.notebook).map((n) => n.requires);
    expect([...carried].sort()).toEqual([...itemIds].sort());
  });

  it('has no duplicated node: ids and titles are unique', () => {
    const titles = G.nodes.map((n) => n.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('labels every relation, once, between two different nodes', () => {
    const keys = G.edges.map((e) => `${e.from}->${e.to}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const e of G.edges) {
      expect(e.label, `${e.from}->${e.to}`).toBeTruthy();
      expect(e.from).not.toBe(e.to);
    }
  });

  it('gives every node something to show when opened', () => {
    const item = new Map(items.map((it) => [it.id, it]));
    for (const n of G.nodes) {
      const own = n.context && textsOf({ context: n.context }).length > 0;
      const fromItem = n.notebook && item.get(n.requires)?.summary;
      expect(Boolean(own || fromItem), n.id).toBe(true);
    }
  });

  it('writes every common mistake as wrong / why / right', () => {
    for (const n of G.nodes.filter((x) => x.kind === 'common_mistake')) {
      const parts = n.context?.parts ?? [];
      expect(parts.slice(0, 3).map((p) => p.role), n.id).toEqual(['wrong', 'why', 'right']);
      for (const p of parts) expect(p.text?.trim(), `${n.id}:${p.role}`).toBeTruthy();
    }
  });

  it('grounds every aid in the lesson: each one quotes at least one of its texts word for word', () => {
    // La خلاصة est un assemblage (A.7) ; les aides portées par un item le sont par knowledge.jsx.
    const aids = G.nodes.filter((n) => isGuide(n) && !n.notebook && n.kind !== 'takeaway');
    // Une phrase citée, ou une proposition citée dans une phrase (« … : <citation> »).
    const quotes = (t) => [t, ...t.split(/[:؛]\s/)].map((q) => q.trim().replace(/[.،؛:]$/, '')).filter((q) => q.length >= 16);
    // Ce que l'aide DIT (son contexte), pas son étiquette (le sous-titre).
    const ungrounded = aids.filter((n) => !textsOf({ context: n.context }).some((t) => quotes(t).some((q) => l.sources.includes(q)))).map((n) => n.id);
    expect(ungrounded).toEqual(KNOWN_UNGROUNDED[l.id] ?? []);
  });

  it('never hangs guidance on the root, and keeps the core dominant (guidance < half)', () => {
    for (const n of G.nodes.filter(isGuide)) {
      const parents = G.edges.filter((e) => e.to === n.id).map((e) => e.from);
      expect(parents.length, n.id).toBeGreaterThan(0);
      expect(parents, n.id).not.toContain(G.root);
    }
    expect(G.nodes.filter(isGuide).length).toBeLessThan(G.nodes.length / 2);
  });

  it('follows the lesson: discovery never reaches an idea of a later محور before one of an earlier محور', () => {
    const modules = discoveryOrder(G).map((id) => moduleOf.get(byId[id].requires));
    expect(discoveryOrder(G)).toHaveLength(G.nodes.length);
    for (let i = 1; i < modules.length; i += 1) {
      expect(modules[i] >= modules[i - 1], `${discoveryOrder(G)[i]} (محور ${modules[i]}) after محور ${modules[i - 1]}`).toBe(true);
    }
  });

  it('walks the whole map by following the flash, and after the first محور only what it taught is open', () => {
    const all = new Set(itemIds);
    let ex = initialExplore(G);
    for (const id of discoveryOrder(G)) {
      expect(nextToDiscover(G, nodeStates(G, ex, all))).toBe(id);
      ex = discover(G, ex, id, all).explore;
    }
    expect(nextToDiscover(G, nodeStates(G, ex, all))).toBeNull();

    const first = Math.min(...moduleOf.values());
    const m1 = new Set(itemIds.filter((id) => moduleOf.get(id) === first));
    const s = nodeStates(G, initialExplore(G), m1, { full: true });
    for (const n of G.nodes) {
      expect(s.get(n.id), n.id).toBe(moduleOf.get(n.requires) === first ? 'available' : 'locked');
    }
  });

  it('lists every item and every aid exactly once in « المعارف مفصّلة », a reminder before its idea', () => {
    const entries = linearEntries(G, items);
    const keys = entries.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(entries.filter((e) => e.item).map((e) => e.key).sort()).toEqual([...itemIds].sort());
    expect(entries.filter((e) => !e.item).map((e) => e.key).sort())
      .toEqual(G.nodes.filter((n) => isGuide(n) && !n.notebook).map((n) => n.id).sort());
    for (const n of G.nodes.filter((x) => x.kind === 'prerequisite')) {
      const parent = G.edges.find((e) => e.to === n.id && revealsOf(G, e.from).includes(n.id))?.from;
      const at = (id) => keys.indexOf(byId[id].notebook ? byId[id].requires : id);
      if (parent && at(parent) >= 0) expect(at(n.id), n.id).toBeLessThan(at(parent));
    }
  });

  it('shows only TRUE arithmetic: every numeric equality, every Euclidean division, every PGCD', () => {
    for (const n of G.nodes) {
      for (const t of textsOf(n)) {
        for (const [, math] of t.matchAll(/\$([^$]+)\$/g)) {
          const sides = math.split(/=/).map(numeric).filter((v) => v !== null);
          if (sides.length >= 2) { for (const v of sides) expect(v, `${n.id}: ${math}`).toBe(sides[0]); }
          const eu = math.match(/^\s*(\d+) = (\d+) \\times (\d+) \+ (\d+)\s*$/);
          if (eu) expect(Number(eu[4]) < Number(eu[2]), `${n.id}: remainder < divisor in ${math}`).toBe(true);
        }
        const p = plain(t);
        for (const m of p.matchAll(/PGCD\s*\(\s*(\d+)\s*;\s*(\d+)\s*\)\s*=\s*(\d+)(?!\s*[\d(×])/g)) {
          expect(gcd(Number(m[1]), Number(m[2])), `${n.id}: ${m[0]}`).toBe(Number(m[3]));
        }
        // « PGCD(a ; b) = PGCD(c ; d) = … » : chaque maillon a la même valeur.
        for (const segment of p.split(/[،؛.]\s|\n/)) {
          const inSeg = [...segment.matchAll(PGCD_RE)].map((m) => gcd(Number(m[1]), Number(m[2])));
          if (inSeg.length >= 2 && /PGCD[^=]*=\s*PGCD/.test(segment)) {
            for (const v of inSeg) expect(v, `${n.id}: ${segment}`).toBe(inSeg[0]);
          }
        }
      }
    }
  });

  it('writes every equality in a math island — outside one, RTL reorders « 252 − 140 = 112 » into « 112 = 140 − 252 »', () => {
    const unsafe = [];
    for (const n of G.nodes) {
      for (const t of [n.title, ...textsOf(n)]) {
        const prose = t.replace(/\$[^$]*\$/g, ' ');
        for (const m of prose.matchAll(/\d[\d\s]*[=×÷−+<>≤≥-][\s\d=×÷−+<>≤≥-]*\d/g)) {
          // Ancré par une lettre latine (« PGCD(155 ; 141) = 1 ») : la suite reste LTR.
          const before = prose.slice(0, m.index).match(/[A-Za-z\u0600-\u06FF](?=[^A-Za-z\u0600-\u06FF]*$)/)?.[0];
          if (!before || /[\u0600-\u06FF]/.test(before)) unsafe.push(`${n.id}: « ${m[0]} »`);
        }
      }
    }
    expect(unsafe).toEqual([]);
  });

  it('keeps the titles short enough to read in a lane', () => {
    for (const n of G.nodes) expect(n.title.length, n.id).toBeLessThanOrEqual(28);
  });

  /** Points d'un chemin SVG (M/L/Q). */
  const pathPoints = (d) => {
    const nums = d.replace(/[MLQ]/g, ' ').trim().split(/\s+/).map(Number);
    const pts = [];
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
    return pts;
  };

  for (const width of [328, 400, 720, 1100]) {
    it(`lays out at ${width}px: inside the width, no overlap, no arrow through a node, no label on a node or a label`, () => {
      const L = layoutGraph(G, { width, rtl: true });
      const boxes = [...L.nodes.entries()];
      for (const [id, b] of boxes) {
        expect(b.x, id).toBeGreaterThanOrEqual(0);
        expect(b.x + b.w, id).toBeLessThanOrEqual(width);
      }
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const [, a] = boxes[i]; const [, b] = boxes[j];
          const apart = a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
          expect(apart, `${boxes[i][0]} × ${boxes[j][0]}`).toBe(true);
        }
      }
      for (const e of L.edges) {
        const pts = pathPoints(e.d);
        for (let i = 1; i < pts.length; i += 1) {
          const [x0, y0] = pts[i - 1]; const [x1, y1] = pts[i];
          for (let k = 0; k <= 20; k += 1) {
            const x = x0 + ((x1 - x0) * k) / 20; const y = y0 + ((y1 - y0) * k) / 20;
            for (const [id, b] of L.nodes) {
              if (id === e.edge.from || id === e.edge.to) continue;
              const inside = x > b.x + 2 && x < b.x + b.w - 2 && y > b.y + 2 && y < b.y + b.h - 2;
              expect(inside, `${e.key} crosses ${id} @${width}`).toBe(false);
            }
          }
        }
      }
      const seen = new Set();
      const labels = [];
      for (const e of L.edges) {
        if (!e.label || seen.has(e.label.group)) continue;
        seen.add(e.label.group);
        const w = labelWidth(e.edge.label);
        labels.push({ key: e.key, x0: e.label.x - w / 2, x1: e.label.x + w / 2, y0: e.label.y - 11, y1: e.label.y + 11 });
      }
      for (let i = 0; i < labels.length; i += 1) {
        const a = labels[i];
        for (let j = i + 1; j < labels.length; j += 1) {
          const b = labels[j];
          expect(a.x1 <= b.x0 || b.x1 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0, `${a.key} × ${b.key} @${width}`).toBe(true);
        }
        for (const [id, b] of L.nodes) {
          const apart = a.x1 <= b.x || b.x + b.w <= a.x0 || a.y1 <= b.y || b.y + b.h <= a.y0;
          expect(apart, `label ${a.key} on node ${id} @${width}`).toBe(true);
        }
        expect(a.x0 >= 0 && a.x1 <= width, `label ${a.key} inside ${width}px`).toBe(true);
      }
    });
  }
});
