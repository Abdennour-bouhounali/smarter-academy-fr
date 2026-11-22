/**
 * Carte PROGRESSIVE — la mise en page (pure, déterministe, testée).
 *
 * Une disposition en couloirs, pas un placement « force » : la hiérarchie
 * se LIT de haut en bas, et une même leçon donne toujours la même carte
 * (même règle que les manipulations : la géométrie est assertée en test).
 *
 *   rangée  = profondeur du nœud (plus long chemin depuis la racine, arêtes
 *             latérales exclues) — dérivée, jamais écrite par la leçon ;
 *   couloir = `lane` écrit par la leçon : 'start' | 'center' | 'end'.
 *
 * `start` est le bord de DÉBUT de lecture : la droite sous RTL. La carte ne
 * « miroite » pas des flèches qui ont un sens mathématique : seules les
 * positions des couloirs basculent, les arêtes descendent toujours.
 *
 * Trois formes d'arête, choisies par la géométrie :
 *   droite   même abscisse          → un trait vertical ;
 *   coude    abscisses différentes  → bas, horizontal, bas (─┬─ ou ─┴─) ;
 *            si la cible a plusieurs coudes entrants, ils FUSIONNENT sur une
 *            jonction commune et partagent UNE étiquette (`labelGroup`) ;
 *   latérale `lateral: true`, même rangée → une anse sous les deux nœuds ;
 *   couloir  vers un nœud central quand le couloir de la source est occupé
 *            entre les deux rangées → par le flanc, dans l'espace central.
 */

const ARROW = 7;

function metrics(width) {
  const wide = width >= 560;
  return {
    wide,
    // Cairo a de hautes jambes : trois lignes (type, titre, notation) sur des
    // interlignes de 20/24/24px, sinon le titre est rogné par son `truncate`.
    nodeH: wide ? 92 : 86,
    rowGap: wide ? 84 : 72,
    padX: 8,
    padTop: 10,
    laneGap: wide ? 56 : Math.max(16, Math.round(width * 0.05)),
    maxLane: wide ? 250 : 200,
    lateralDrop: 22,
  };
}

/**
 * La rangée de chaque nœud : plus long chemin depuis une source (arêtes
 * latérales ignorées), puis RÉSOLUTION DES COLLISIONS — deux nœuds du même
 * couloir sur la même rangée (ou un nœud central avec n'importe quel autre)
 * ne peuvent coexister. Le nœud déclaré le plus tard descend d'une rangée,
 * et sa descendance avec lui (la profondeur est recalculée). Déterministe :
 * l'ordre de déclaration du graphe décide.
 */
export function nodeRows(graph) {
  const incoming = new Map(graph.nodes.map((n) => [n.id, []]));
  for (const e of graph.edges) if (!e.lateral) incoming.get(e.to)?.push(e.from);
  const lane = new Map(graph.nodes.map((n) => [n.id, n.lane]));
  const index = new Map(graph.nodes.map((n, i) => [n.id, i]));
  const rowMin = new Map();

  const compute = () => {
    const rows = new Map();
    const visiting = new Set();
    const depth = (id) => {
      if (rows.has(id)) return rows.get(id);
      if (visiting.has(id)) throw new Error(`knowledge graph: cycle through ${id}`);
      visiting.add(id);
      const parents = incoming.get(id) ?? [];
      const d = Math.max(rowMin.get(id) ?? 0, parents.length === 0 ? 0 : 1 + Math.max(...parents.map(depth)));
      visiting.delete(id);
      rows.set(id, d);
      return d;
    };
    for (const n of graph.nodes) depth(n.id);
    return rows;
  };

  for (let guard = 0; guard <= graph.nodes.length * graph.nodes.length; guard += 1) {
    const rows = compute();
    const order = graph.nodes.map((n) => n.id).sort((a, b) => rows.get(a) - rows.get(b) || index.get(a) - index.get(b));
    const taken = new Map();
    let bumped = false;
    for (const id of order) {
      const r = rows.get(id);
      const used = taken.get(r) ?? new Set();
      const clash = lane.get(id) === 'center' ? used.size > 0 : used.has(lane.get(id)) || used.has('center');
      if (clash) { rowMin.set(id, r + 1); bumped = true; break; }
      used.add(lane.get(id));
      taken.set(r, used);
    }
    if (!bumped) return rows;
  }
  throw new Error('knowledge graph: rows did not settle');
}

/** Largeur estimée d'une étiquette de relation (pastille 11px gras + marges). */
export const labelWidth = (text) => text.length * 6.5 + 22;

/** Polyligne → chemin SVG aux angles arrondis (rayon borné par les segments). */
export function roundedPath(points, radius = 10) {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const [px, py] = points[i - 1];
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    const inLen = Math.hypot(cx - px, cy - py);
    const outLen = Math.hypot(nx - cx, ny - cy);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    if (r <= 0.5) { d += ` L ${cx} ${cy}`; continue; }
    const ax = cx - ((cx - px) / inLen) * r;
    const ay = cy - ((cy - py) / inLen) * r;
    const bx = cx + ((nx - cx) / outLen) * r;
    const by = cy + ((ny - cy) / outLen) * r;
    d += ` L ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`;
  }
  const [lx, ly] = points[points.length - 1];
  return `${d} L ${lx} ${ly}`;
}

function arrowHead(x, y, dir) {
  // dir: 'down' (pointe en bas, en y) ou 'up'.
  const s = dir === 'down' ? -1 : 1;
  return `${x - ARROW * 0.72},${y + s * ARROW} ${x + ARROW * 0.72},${y + s * ARROW} ${x},${y}`;
}

/**
 * @param {object} graph            KNOWLEDGE_GRAPH de la leçon
 * @param {{width:number, rtl?:boolean}} opts
 * @returns {{ wide, nodeH, nodes: Map<string, {x,y,w,h,cx,row}>, edges: object[], heightFor: (maxRow:number)=>number }}
 */
export function layoutGraph(graph, { width, rtl = true }) {
  const m = metrics(width);
  const rows = nodeRows(graph);
  const laneW = Math.max(120, Math.min(m.maxLane, Math.floor((width - 2 * m.padX - m.laneGap) / 2)));
  const groupW = laneW * 2 + m.laneGap;
  const left0 = (width - groupW) / 2;
  const cxLeft = left0 + laneW / 2;
  const cxRight = left0 + laneW + m.laneGap + laneW / 2;
  const laneX = { start: rtl ? cxRight : cxLeft, end: rtl ? cxLeft : cxRight, center: width / 2 };
  const centerW = Math.min(width - 2 * m.padX, Math.max(Math.round(laneW * 1.35), Math.min(260, width - 2 * m.padX)));
  const rowY = (row) => m.padTop + row * (m.nodeH + m.rowGap);

  const nodes = new Map();
  for (const n of graph.nodes) {
    const row = rows.get(n.id);
    const w = n.lane === 'center' ? centerW : laneW;
    const cx = laneX[n.lane] ?? laneX.center;
    nodes.set(n.id, { x: cx - w / 2, y: rowY(row), w, h: m.nodeH, cx, row });
  }

  const laneOf = new Map(graph.nodes.map((n) => [n.id, n.lane]));
  const elbowIn = new Map();
  for (const e of graph.edges) {
    if (e.lateral) continue;
    const s = nodes.get(e.from);
    const t = nodes.get(e.to);
    if (Math.abs(s.cx - t.cx) >= 1) elbowIn.set(e.to, (elbowIn.get(e.to) ?? 0) + 1);
  }

  const edges = graph.edges.map((e) => {
    const s = nodes.get(e.from);
    const t = nodes.get(e.to);
    const key = `${e.from}->${e.to}`;
    if (e.lateral) {
      const sign = Math.sign(t.cx - s.cx) || 1;
      const sx = s.cx + sign * (s.w / 4);
      const tx = t.cx - sign * (t.w / 4);
      const sB = s.y + s.h;
      const tB = t.y + t.h;
      const yB = Math.max(sB, tB) + m.lateralDrop;
      return {
        key, edge: e, dashed: true,
        d: roundedPath([[sx, sB], [sx, yB], [tx, yB], [tx, tB + ARROW]], 10),
        arrow: arrowHead(tx, tB, 'up'),
        label: e.label ? { x: (sx + tx) / 2, y: yB, group: key } : null,
        length: Math.abs(yB - sB) * 2 + Math.abs(tx - sx),
      };
    }
    const sB = s.y + s.h;
    const tT = t.y;
    if (Math.abs(s.cx - t.cx) < 1) {
      return {
        key, edge: e, dashed: false,
        d: roundedPath([[s.cx, sB], [t.cx, tT - ARROW]]),
        arrow: arrowHead(t.cx, tT, 'down'),
        label: e.label ? { x: s.cx, y: (sB + tT) / 2, group: key } : null,
        length: tT - sB,
      };
    }
    const merge = (elbowIn.get(e.to) ?? 0) >= 2;
    // Toutes les jonctions d'une fusion se font juste au-dessus de la cible.
    const mergeLabel = e.label ? { x: t.cx, y: tT - m.rowGap / 2, group: `merge:${e.to}` } : null;

    // COULOIR CENTRAL — vers un nœud central, quand le couloir de la source
    // est OCCUPÉ entre les deux rangées (des aides empilées sous un exemple),
    // l'arête sort par le flanc intérieur de la source et descend dans
    // l'espace entre les couloirs, au lieu de traverser ces nœuds.
    const sLane = laneOf.get(e.from);
    const blocked = laneOf.get(e.to) === 'center' && sLane !== 'center' && graph.nodes.some((n) => {
      if (n.id === e.from || n.id === e.to) return false;
      const b = nodes.get(n.id);
      return b.row > s.row && b.row < t.row && (n.lane === sLane || n.lane === 'center');
    });
    if (blocked) {
      const gapX = t.cx;
      const innerX = s.cx < gapX ? s.x + s.w : s.x;
      const yS = s.y + s.h / 2;
      return {
        key, edge: e, dashed: false,
        d: roundedPath([[innerX, yS], [gapX, yS], [gapX, tT - ARROW]], 10),
        arrow: arrowHead(gapX, tT, 'down'),
        label: merge ? mergeLabel : e.label ? { x: gapX, y: tT - m.rowGap / 2, group: key } : null,
        length: Math.abs(gapX - innerX) + (tT - yS),
      };
    }

    // Une arête qui saute des rangées tourne près de sa CIBLE : le trait
    // horizontal ne traverse pas les rangées intermédiaires.
    const yMid = t.row - s.row > 1 ? tT - m.rowGap / 2 : sB + m.rowGap / 2;
    // Étiquette d'une branche : au milieu du bras horizontal si elle y tient,
    // sinon sur la courte descente vers l'enfant (deux sœurs aux étiquettes
    // longues ne se chevauchent plus au centre).
    const onArm = e.label && labelWidth(e.label) < Math.abs(t.cx - s.cx) - 8;
    return {
      key, edge: e, dashed: false,
      d: roundedPath([[s.cx, sB], [s.cx, yMid], [t.cx, yMid], [t.cx, tT - ARROW]], 12),
      arrow: arrowHead(t.cx, tT, 'down'),
      label: e.label
        ? merge
          ? mergeLabel
          : onArm
            ? { x: (s.cx + t.cx) / 2, y: yMid, group: key }
            : { x: t.cx, y: (yMid + tT - ARROW) / 2, group: key }
        : null,
      length: (yMid - sB) + Math.abs(t.cx - s.cx) + (tT - yMid),
    };
  });

  const lateralRows = new Set(graph.edges.filter((e) => e.lateral).map((e) => rows.get(e.from)));
  const heightFor = (maxRow) => rowY(maxRow) + m.nodeH + (lateralRows.has(maxRow) ? m.lateralDrop + 18 : 0) + m.padTop;

  return { wide: m.wide, nodeH: m.nodeH, nodes, edges, heightFor };
}
