/**
 * Carte PROGRESSIVE — le modèle pur (aucun React, aucun stockage, aucun DOM).
 * La carte de toutes les leçons depuis la migration du 2026-09-29 (référence :
 * la leçon pilote) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Un graphe de leçon (`KNOWLEDGE_GRAPH`, fourni par la leçon) :
 *
 *   { root: 'id',
 *     nodes: [{ id, kind, lane, title, subtitle?, requires?, reveals?, context }],
 *     edges: [{ from, to, label?, lateral? }] }
 *
 * Trois états se superposent, et un seul est inventé ici :
 *
 *   locked      l'item `requires` n'est PAS dans la carte cumulative
 *               (complétion des محاور ∪ briques) — lu, jamais calculé ici ;
 *   available   le nœud est révélé mais pas encore ouvert ;
 *   discovered  l'élève l'a ouvert.
 *
 * « available → discovered » est un état d'EXPLORATION de la carte (une
 * interface), pas une connaissance : il ne touche ni la progression ni la
 * maîtrise. La visibilité des connaissances reste celle du reste de la carte.
 */

/**
 * Les types sémantiques qu'un graphe peut employer (nodeKinds.js les habille).
 * CORE : ce qu'il faut savoir. GUIDE : ce à quoi faire attention, comment
 * vérifier, ce qu'il faut retenir — un nœud GUIDE porte son propre contenu
 * (`context`) et n'est pas un item de knowledge.jsx. Une leçon n'emploie que
 * les types que SA mathématique justifie.
 */
const CORE_KINDS = ['concept', 'definition', 'idea', 'relationship', 'method', 'example', 'term', 'retain'];
export const GUIDE_KINDS = ['common_mistake', 'warning', 'tip', 'check', 'prerequisite', 'takeaway'];
const NODE_KINDS = [...CORE_KINDS, ...GUIDE_KINDS];

/** Le graphe est-il exploitable ? Renvoie la liste des problèmes (vide = valide). */
export function validateGraph(graph) {
  const problems = [];
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) return ['graph: nodes/edges manquants'];
  const ids = new Set();
  for (const n of graph.nodes) {
    if (!n.id) problems.push('node sans id');
    else if (ids.has(n.id)) problems.push(`node en double: ${n.id}`);
    ids.add(n.id);
  }
  for (const n of graph.nodes) {
    if (!NODE_KINDS.includes(n.kind)) problems.push(`${n.id}: kind inconnu ${n.kind}`);
    if (!['start', 'end', 'center'].includes(n.lane)) problems.push(`${n.id}: lane inconnue ${n.lane}`);
    if (!n.title) problems.push(`${n.id}: title manquant`);
    for (const r of n.reveals ?? []) if (!ids.has(r)) problems.push(`${n.id}: reveals inconnu ${r}`);
  }
  if (!ids.has(graph.root)) problems.push(`root inconnu: ${graph.root}`);
  for (const e of graph.edges) {
    if (!ids.has(e.from) || !ids.has(e.to)) problems.push(`edge ${e.from}→${e.to}: extrémité inconnue`);
  }
  // Tout nœud doit être atteignable depuis la racine par `reveals` : sinon
  // l'exploration ne pourrait jamais le montrer.
  const reached = new Set();
  const stack = ids.has(graph.root) ? [graph.root] : [];
  while (stack.length) {
    const id = stack.pop();
    if (reached.has(id)) continue;
    reached.add(id);
    stack.push(...revealsOf(graph, id));
  }
  for (const id of ids) if (!reached.has(id)) problems.push(`${id}: jamais révélé depuis la racine`);
  // Les rangées se DÉRIVENT des arêtes descendantes (graphLayout) : un cycle
  // (arêtes latérales exclues) n'aurait pas de mise en page.
  const down = new Map([...ids].map((id) => [id, []]));
  for (const e of graph.edges) if (!e.lateral && down.has(e.from) && ids.has(e.to)) down.get(e.from).push(e.to);
  const mark = new Map();
  const cyclic = (id) => {
    if (mark.get(id) === 'done') return false;
    if (mark.get(id) === 'open') return true;
    mark.set(id, 'open');
    const hit = down.get(id).some(cyclic);
    mark.set(id, 'done');
    return hit;
  };
  if ([...ids].some(cyclic)) problems.push('cycle dans les arêtes descendantes');
  return problems;
}

export function nodeById(graph, id) {
  return graph.nodes.find((n) => n.id === id) ?? null;
}

/** Ce que l'ouverture d'un nœud révèle : `reveals` s'il est écrit, sinon ses arêtes sortantes. */
export function revealsOf(graph, id) {
  const node = nodeById(graph, id);
  if (!node) return [];
  if (Array.isArray(node.reveals)) return node.reveals;
  return graph.edges.filter((e) => e.from === id).map((e) => e.to);
}

/** L'état d'exploration initial : seule la racine est montrée. */
export function initialExplore(graph) {
  return { revealed: [graph.root], discovered: [] };
}

/**
 * Relit un état stocké en l'ASSAINISSANT : un id qui n'existe plus dans le
 * graphe (contenu modifié entre deux visites) est ignoré, et la racine est
 * toujours révélée. Un état illisible revient à l'état initial.
 */
export function restoreExplore(graph, stored) {
  if (!stored || !Array.isArray(stored.revealed) || !Array.isArray(stored.discovered)) return initialExplore(graph);
  const known = new Set(graph.nodes.map((n) => n.id));
  const revealed = [graph.root, ...stored.revealed.filter((id) => known.has(id) && id !== graph.root)];
  const discovered = stored.discovered.filter((id) => known.has(id) && revealed.includes(id));
  return { revealed: [...new Set(revealed)], discovered: [...new Set(discovered)] };
}

/**
 * L'élève ouvre un nœud. Un nœud verrouillé ne se découvre pas (on peut le
 * sélectionner pour lire pourquoi, pas l'ouvrir). Renvoie le nouvel état ET
 * les ids nouvellement révélés — l'interface anime exactement ceux-là.
 */
export function discover(graph, explore, id, unlocked) {
  const node = nodeById(graph, id);
  if (!node || isLocked(node, unlocked)) return { explore, newlyRevealed: [] };
  const revealed = explore.revealed.includes(id) ? [...explore.revealed] : [...explore.revealed, id];
  const newlyRevealed = [];
  for (const target of revealsOf(graph, id)) {
    if (!revealed.includes(target)) { revealed.push(target); newlyRevealed.push(target); }
  }
  const discovered = explore.discovered.includes(id) ? explore.discovered : [...explore.discovered, id];
  if (newlyRevealed.length === 0 && discovered === explore.discovered && revealed.length === explore.revealed.length) {
    return { explore, newlyRevealed };
  }
  return { explore: { revealed, discovered }, newlyRevealed };
}

/** `unlocked` : Set des ids d'items présents dans la carte cumulative. */
export function isLocked(node, unlocked) {
  return Boolean(node.requires) && !unlocked.has(node.requires);
}

/**
 * L'état d'affichage de chaque nœud. `full` : la carte complète montre tout,
 * y compris ce qui est verrouillé (en fantôme, sans son contenu).
 * Renvoie Map<id, 'hidden'|'locked'|'available'|'discovered'>.
 */
export function nodeStates(graph, explore, unlocked, { full = false } = {}) {
  const states = new Map();
  for (const n of graph.nodes) {
    const shown = full || explore.revealed.includes(n.id);
    if (!shown) states.set(n.id, 'hidden');
    else if (isLocked(n, unlocked)) states.set(n.id, 'locked');
    else if (explore.discovered.includes(n.id)) states.set(n.id, 'discovered');
    else states.set(n.id, 'available');
  }
  return states;
}

/** Une arête se dessine quand ses deux extrémités sont affichées. */
export function visibleEdges(graph, states) {
  return graph.edges.filter((e) => states.get(e.from) !== 'hidden' && states.get(e.to) !== 'hidden');
}

/** Les relations d'un nœud, dans les deux sens, pour le panneau de contexte et les lecteurs d'écran. */
export function relationsOf(graph, id) {
  return graph.edges
    .filter((e) => e.from === id || e.to === id)
    .map((e) => ({ edge: e, other: e.from === id ? e.to : e.from, outgoing: e.from === id }));
}

/**
 * Les ÉTAPES DE LECTURE de la vue linéaire « المعارف مفصّلة », dans l'ordre.
 *
 * Deux sortes d'étape :
 *   { item, node, kind }  une connaissance de knowledge.jsx — portée par le
 *                         nœud `notebook: true` qui la représente ;
 *   { node, kind }        un nœud GUIDE (erreur fréquente, vérification…),
 *                         qui porte son propre contenu.
 * Les nœuds CORE sans item (racine, exemples) n'ont pas d'étape : leur
 * contenu vit déjà dans le corps de l'item qu'ils illustrent.
 *
 * L'ordre suit la carte en PROFONDEUR (les `reveals`, depuis la racine) :
 * chaque aide arrive juste après la connaissance qu'elle éclaire, pas toutes
 * les erreurs à la fin. Un rappel (`prerequisite`) passe AVANT le nœud qui le
 * révèle : on se rappelle, puis on lit. Seul ce que la carte cumulative
 * contient est listé (un nœud dont l'item `requires` manque est ignoré). Un
 * item qu'aucun nœud n'atteint garde sa place cumulative, à la fin.
 */
export function linearEntries(graph, items) {
  const byId = new Map(items.map((it) => [it.id, it]));
  const unlocked = new Set(byId.keys());
  const out = [];
  const emitted = new Set();
  const placedItems = new Set();
  const visited = new Set();

  const emit = (node) => {
    if (!node || emitted.has(node.id)) return;
    emitted.add(node.id);
    if (node.notebook) {
      const item = byId.get(node.requires);
      if (item && !placedItems.has(item.id)) { placedItems.add(item.id); out.push({ key: item.id, item, node, kind: node.kind }); }
    } else if (GUIDE_KINDS.includes(node.kind) && !isLocked(node, unlocked)) {
      out.push({ key: node.id, node, kind: node.kind });
    }
  };
  const visit = (id) => {
    if (visited.has(id)) return;
    visited.add(id);
    const node = nodeById(graph, id);
    if (!node) return;
    const kids = revealsOf(graph, id);
    for (const k of kids) { const kid = nodeById(graph, k); if (kid?.kind === 'prerequisite') emit(kid); }
    emit(node);
    for (const k of kids) visit(k);
  };
  visit(graph.root);
  for (const it of items) if (!placedItems.has(it.id)) out.push({ key: it.id, item: it, node: null, kind: null });
  return out;
}

/**
 * L'ordre de DÉCOUVERTE conseillé : la carte parcourue en profondeur par ses
 * `reveals` depuis la racine — finir une branche (définition → rappel →
 * exemple → vérification) avant d'ouvrir la suivante. C'est le même ordre
 * que la lecture linéaire.
 */
export function discoveryOrder(graph) {
  const out = [];
  const seen = new Set();
  const visit = (id) => {
    if (seen.has(id)) return;
    seen.add(id);
    out.push(id);
    for (const k of revealsOf(graph, id)) visit(k);
  };
  visit(graph.root);
  return out;
}

/** Le PROCHAIN nœud à ouvrir : le premier disponible dans l'ordre de découverte (ou null). */
export function nextToDiscover(graph, states) {
  return discoveryOrder(graph).find((id) => states.get(id) === 'available') ?? null;
}

/**
 * Le contenu qu'un nœud affiche. Un nœud `notebook` sans `context` montre le
 * RÉSUMÉ de son item (knowledge.jsx) : le graphe n'a pas à recopier un texte
 * que la leçon a déjà écrit — il ne l'écrit que lorsqu'il cite autre chose
 * (le manuel, un exemple calculé). null : rien à montrer.
 */
export function contextOf(node, item) {
  if (node?.context) return node.context;
  if (node?.notebook && item?.summary) return { text: item.summary };
  return null;
}

/**
 * Le type sémantique de repli d'un item, d'après sa catégorie de la carte
 * par strates (KNOWLEDGE_MAP.md A.15). Un point de départ, pas un jugement :
 * une leçon MIGRÉE écrit son `kind` à la main.
 */
const FALLBACK_KIND = {
  concepts: 'concept', regles: 'relationship', formules: 'relationship',
  methodes: 'method', vocabulaire: 'term', memoriser: 'retain',
};

/**
 * REPLI DE MIGRATION — un graphe DÉRIVÉ des items de knowledge.jsx, pour une
 * leçon qui déclare la carte progressive sans graphe utilisable (absent, ou
 * invalide). Rien n'y est inventé : un nœud par item, dans l'ordre des محاور
 * puis de déclaration, portant l'item (`notebook`) et gardé par lui ; une
 * seule relation, honnête — l'ordre de la leçon (`sequenceLabel`, « ثمّ ») —
 * et aucune aide (خطأ شائع, تحقّق…) : celles-ci ne se dérivent pas.
 * Même moteur, mêmes états, même lecture linéaire : la leçon ne perd rien
 * et n'affiche jamais une carte vide. null s'il n'y a aucun item.
 */
export function graphFromKnowledge(knowledge, { sequenceLabel = '' } = {}) {
  const modules = Object.keys(knowledge?.modules ?? {}).map(Number).sort((a, b) => a - b);
  const items = modules.flatMap((m) => knowledge.modules[m] ?? []);
  const seen = new Set();
  const unique = items.filter((it) => it?.id && !seen.has(it.id) && seen.add(it.id));
  if (unique.length === 0) return null;
  const nodes = unique.map((it, i) => ({
    id: it.id,
    kind: FALLBACK_KIND[it.type] ?? 'concept',
    lane: 'center',
    title: it.title,
    requires: it.id,
    notebook: true,
    reveals: unique[i + 1] ? [unique[i + 1].id] : [],
  }));
  const edges = unique.slice(1).map((it, i) => ({ from: unique[i].id, to: it.id, label: sequenceLabel }));
  return { root: unique[0].id, nodes, edges, derived: true };
}

/**
 * Le graphe que la carte affiche : celui de la leçon s'il est VALIDE, sinon
 * le repli dérivé de ses items. Les leçons de la plateforme ont toutes un
 * graphe écrit et valide (progressiveMap.test.js) ; ce repli protège une
 * leçon en cours de migration ou un graphe cassé — jamais une carte blanche.
 */
export function resolveGraph(authored, knowledge, options) {
  if (authored && validateGraph(authored).length === 0) return authored;
  return graphFromKnowledge(knowledge, options);
}

/** Progression d'exploration : combien de nœuds ACCESSIBLES ont été ouverts. */
export function exploreProgress(graph, explore, unlocked) {
  const reachable = graph.nodes.filter((n) => !isLocked(n, unlocked));
  const done = reachable.filter((n) => explore.discovered.includes(n.id)).length;
  return { done, total: reachable.length, lockedCount: graph.nodes.length - reachable.length, complete: done === reachable.length };
}
