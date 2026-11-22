/**
 * mosaicLayout — la mise en page PURE des pièces du monde `mosaic` (labo `decimal-comma`). Aucune dépendance React.
 *
 * Le panneau (l'unité) est un carré de côté `s` fait de 10 × 10 carreaux de côté `c = s / 10`. Les pièces sont HONNÊTES :
 *   panneau  s × s            (1)
 *   bande    c × s            (1/10 : une colonne de 10 carreaux)
 *   carreau  c × c            (1/100)
 *   éclat    1/10 de carreau  (1/1000) — trop fin pour être vu à l'échelle : il est montré dans une LOUPE (un carreau agrandi, coupé en 10
 *            lamelles, dont autant sont pleines que le chiffre des millièmes).
 * Tous les panneaux des rangs au-dessus des unités (dizaines, centaines …) forment UN symbole (`bundle`, une pile + « ×N ») avec son compte
 * exact : il n'est pas à l'échelle.
 *
 * `layoutBlocks(groups, box)` range les groupes de `logic/decimalComma.js › blocksOf` dans une boîte et choisit le plus grand `s`
 * qui tient ; `commonScale` fait choisir UN `s` à deux zones (la table du client et le plateau) pour que leurs pièces se comparent.
 */
export const BUNDLE_OFF = 5;
const LENS = 54;

/** Les éléments à placer pour un côté de panneau s : [{ id, kind, groupExp, w, h, ...données }]. */
function itemsFor(groups, s) {
  const c = s / 10;
  const out = [];
  for (const g of groups) {
    if (g.kind === 'panel') {
      if (g.mult === 1) {
        for (let i = 0; i < g.icons; i += 1) out.push({ id: `panel-${g.exp}-${i}`, kind: 'panel', exp: g.exp, w: s, h: s, mult: 1, count: 1 });
      } else {
        for (let i = 0; i < g.icons; i += 1) out.push({ id: `bundle-${g.exp}-${i}`, kind: 'bundle', exp: g.exp, w: s + 2 * BUNDLE_OFF, h: s + 2 * BUNDLE_OFF, mult: g.mult, count: g.mult });
      }
    } else if (g.kind === 'strip') {
      out.push({ id: 'strips', kind: 'strips', exp: -1, w: g.icons * (c + 2) - 2, h: s, icons: g.icons, c, count: g.icons });
    } else if (g.kind === 'tile') {
      const cols = Math.min(g.icons, 3);
      const rows = Math.ceil(g.icons / 3);
      out.push({ id: 'tiles', kind: 'tiles', exp: -2, w: cols * (c + 2) - 2, h: rows * (c + 2) - 2, icons: g.icons, cols, c, count: g.icons });
    } else if (g.kind === 'shard') {
      out.push({ id: 'shards', kind: 'lens', exp: -3, w: LENS, h: LENS, icons: g.icons, count: g.icons });
    }
  }
  return out;
}

/** Les éléments rangés de gauche à droite, à la ligne quand la largeur manque. */
function flow(items, width, gap) {
  const rows = [];
  let row = { items: [], w: 0, h: 0 };
  for (const it of items) {
    const nextW = row.w + (row.items.length ? gap : 0) + it.w;
    if (row.items.length && nextW > width) { rows.push(row); row = { items: [], w: 0, h: 0 }; }
    row.w += (row.items.length ? gap : 0) + it.w;
    row.h = Math.max(row.h, it.h);
    row.items.push(it);
  }
  if (row.items.length) rows.push(row);
  return rows;
}

function place(groups, s, { width, gap }) {
  const items = itemsFor(groups, s);
  const rows = flow(items, width, gap);
  let y = 0;
  const placed = [];
  for (const row of rows) {
    // une rangée est CENTRÉE dans la largeur ; ses pièces reposent sur la même ligne de base (le bas)
    let x = (width - row.w) / 2;
    for (const it of row.items) {
      placed.push({ ...it, x, y: y + row.h - it.h });
      x += it.w + gap;
    }
    y += row.h + gap;
  }
  const height = rows.length ? y - gap : 0;
  const maxW = rows.reduce((m, r) => Math.max(m, r.w), 0);
  return { s, items: placed, height, width: maxW, rows: rows.length };
}

/**
 * @param groups  `blocksOf(v).groups`
 * @param box     { width, height, gap?, maxS?, minS? } — la place de la zone (px)
 * @returns { s, items, height, width, fits } — `items` : { id, kind, x, y, w, h, … } dans la boîte ; `fits` : tient en hauteur
 */
export function layoutBlocks(groups, { width, height, gap = 8, maxS = 84, minS = 20, s: fixedS } = {}) {
  if (fixedS) { const p = place(groups, fixedS, { width, gap }); return { ...p, fits: p.height <= height && p.width <= width }; }
  for (let s = maxS; s >= minS; s -= 2) {
    const p = place(groups, s, { width, gap });
    if (p.height <= height && p.width <= width) return { ...p, fits: true };
  }
  const p = place(groups, minS, { width, gap });
  return { ...p, fits: false };
}

/** UN côté de panneau pour plusieurs zones (la plus petite échelle qui convient à toutes). */
export function commonScale(groupLists, box) {
  return Math.min(...groupLists.map((g) => layoutBlocks(g, box).s));
}
