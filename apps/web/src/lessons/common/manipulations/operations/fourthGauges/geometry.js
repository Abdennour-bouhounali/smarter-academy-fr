/**
 * La GÉOMÉTRIE du monde `market` du labo `fourth-gauges`, pure et testée (`fourthGauges.render.test.jsx › aucune étiquette ne se chevauche`).
 *
 * De haut en bas dans la scène (SVG LTR, `W` × `H` px) :
 *   l'auvent à rayures · la planche de prix (le tableau 2×2 en cartes ; le tableau se lit de DROITE à GAUCHE : les noms des lignes à
 *   droite, la colonne 1 (a, b) à côté d'eux, la colonne 2 (c, d) à gauche) · les balances d'égalité, alignées sous la planche (la
 *   première, « في الواحدة », à DROITE ; « الفرق », le leurre, tout à gauche) · la règle du marchand (la poignée du nombre qui manque).
 * Dans le couloir de gauche : la cliente (`KidFigure`, hijab) ; à droite, quand la scène est large : la balance de marchand en décor.
 *
 * Toutes les étiquettes ont une place qui ne dépend QUE de la largeur de la scène et du nombre de balances ; la mise en page est
 * rendue par `FourthGauges.jsx` à partir des MÊMES boîtes (`labelBoxes`), jamais recalculées dans la vue.
 */

export const CARD_FONT = 22;
export const SMALL = 11;
export const KNOB_R = 22;
/** L'inclinaison maximale d'une balance (degrés) : jamais plus d'un cran « saturé ». */
export const MAX_TILT = 18;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Largeur estimée d'un texte en `size` px (chiffres, virgule, signes, lettres arabes) — pas de mesure DOM (rendu serveur, tests). */
export function textW(text, size = SMALL) {
  let w = 0;
  for (const ch of String(text)) {
    if (/[0-9]/.test(ch)) w += 0.6;
    else if (/[,.]/.test(ch)) w += 0.32;
    else if (ch === ' ') w += 0.3;
    else if (/[÷×−+=/]/.test(ch)) w += 0.66;
    else if (/[؀-ۿ]/.test(ch)) w += 0.55;
    else w += 0.6;
  }
  return Math.ceil(w * size);
}

/** « التفاح (kg) » → { name: 'التفاح', unit: 'kg' } ; sans parenthèses : unit ''. */
export function splitLabel(label) {
  const m = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(String(label ?? '').trim());
  return m ? { name: m[1], unit: m[2] } : { name: String(label ?? '').trim(), unit: '' };
}

/** Le nom d'une ligne coupé en lignes de `max` caractères au plus (au mot près) ; puis l'unité sur sa propre ligne. */
export function labelLines(label, max) {
  const { name, unit } = splitLabel(label);
  const words = name.split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w; } else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) lines.push(cur);
  return { lines, unit };
}

/** La mise en page pour une scène de `W` px de large avec `nG` balances (3, ou 4 avec le leurre). */
export function layout(W, nG = 3) {
  const compact = W < 520;
  const aw = compact ? 22 : 30;
  const kidW = W >= 700 ? 92 : W >= 520 ? 78 : 48;
  const decorR = W >= 640 ? 58 : 0;
  const bx0 = kidW;
  const bx1 = W - 6 - decorR;
  const pad = 8;
  const innerW = bx1 - bx0 - 2 * pad;
  const lw = clamp(Math.round(innerW * 0.3), 74, 132);
  const gap = 8;
  const cw = Math.floor((innerW - lw - 3 * gap) / 2);
  const ch = compact ? 40 : 46;
  const rg = 8;
  const by0 = aw + 6;
  const r1 = by0 + pad;
  const r2 = r1 + ch + rg;
  const by1 = r2 + ch + pad;
  const labelX1 = bx1 - pad;
  const labelX0 = labelX1 - lw;
  const c1x1 = labelX0 - gap; const c1x0 = c1x1 - cw;
  const c2x1 = c1x0 - gap; const c2x0 = c2x1 - cw;
  const cell = (x0, y0) => ({ x0, x1: x0 + cw, y0, y1: y0 + ch, cx: x0 + cw / 2, cy: y0 + ch / 2 });
  const cells = { a: cell(c1x0, r1), b: cell(c1x0, r2), c: cell(c2x0, r1), d: cell(c2x0, r2) };
  const rows = [{ x0: labelX0, x1: labelX1, y0: r1, y1: r1 + ch }, { x0: labelX0, x1: labelX1, y0: r2, y1: r2 + ch }];

  // les balances, sous la planche : la première (« في الواحدة ») à droite
  const gh = compact ? 124 : 132;
  const gy0 = by1 + 8;
  const gx0 = bx0; const gx1 = bx1;
  const gw = (gx1 - gx0) / nG;
  const gauges = Array.from({ length: nG }, (_, i) => {
    const x1 = gx1 - i * gw; const x0 = x1 - gw; const cx = (x0 + x1) / 2;
    return { i, x0, x1, cx, y0: gy0, y1: gy0 + gh, gw };
  });

  // la règle
  const ry0 = gy0 + gh + 4;
  const rh = 62;
  const trackY = ry0 + KNOB_R + 4;
  const ruler = { x0: bx0, x1: bx1, y0: ry0, y1: ry0 + rh, trackY, tx0: bx0 + KNOB_R + 8, tx1: bx1 - KNOB_R - 8 };
  const H = ry0 + rh + 6;
  const kh = compact ? 94 : W >= 700 ? 140 : 122;
  const kid = { cx: kidW / 2 + 1, top: H - 8 - kh, foot: H - 8, kh };
  return { W, H, compact, aw, kidW, decorR, board: { x0: bx0, x1: bx1, y0: by0, y1: by1 }, cells, rows, cw, ch, lw, gh, gauges, ruler, kid, roomy: gw >= 170 };
}

/** La position x de la poignée pour une valeur `hh` (centièmes) sur une règle de 0 à `maxH`. */
export const xOfValue = (geo, hh, maxH) => geo.ruler.tx0 + (clamp(hh, 0, maxH) / maxH) * (geo.ruler.tx1 - geo.ruler.tx0);
/** La valeur (centièmes, non arrondie) pour une abscisse. */
export const valueOfX = (geo, x, maxH) => ((clamp(x, geo.ruler.tx0, geo.ruler.tx1) - geo.ruler.tx0) / (geo.ruler.tx1 - geo.ruler.tx0)) * maxH;

/** L'angle (degrés) d'une balance : 0 à l'égalité ; sinon de 3° à MAX_TILT° selon l'écart relatif. Négatif = le côté GAUCHE descend. */
export function tiltOf(state, left, right) {
  if (state === 'eq' || state === 'off' || state === 'covered') return 0;
  const l = Number(left); const r = Number(right);
  const big = Math.max(Math.abs(l), Math.abs(r)) || 1;
  const rel = Math.min(1, Math.abs(l - r) / big);
  const mag = Math.min(MAX_TILT, 3 + (MAX_TILT - 3) * Math.min(1, rel * 3));
  return state === 'gt' ? -mag : mag;
}

/** Les mesures internes d'une balance (le fléau, les plateaux, les étiquettes), pour une inclinaison `deg`. */
export function gaugeGeo(geo, g, deg = 0) {
  const roomy = geo.roomy;
  const bl = clamp(g.gw / 2 - 13, 18, 60);
  const lampY = g.y0 + 8;
  const pivotY = g.y0 + 28;
  // deg > 0 : sens horaire, le côté DROIT descend ; deg < 0 : le côté GAUCHE descend
  const rad = (deg * Math.PI) / 180;
  const endDx = bl * Math.cos(rad); const endDy = bl * Math.sin(rad);
  const left = { x: g.cx - endDx, y: pivotY - endDy };
  const right = { x: g.cx + endDx, y: pivotY + endDy };
  const dishDrop = 18;
  const baseY = g.y0 + 70;
  const chipH = 17;
  const chipY = baseY + 6;
  const chipW = Math.floor(g.gw / 2 - 3);
  const capY = chipY + chipH + 3;
  const nameY = g.y1 - 12;
  return { bl, lampY, pivotY, left, right, dishDrop, baseY, chipY, chipH, chipW, capY, nameY, roomy };
}

const box = (x0, y0, x1, y1) => ({ x0, y0, x1, y1 });
const centered = (cx, y, w, h) => box(cx - w / 2, y, cx + w / 2, y + h);

/**
 * Toutes les étiquettes de la scène pour un état : { id, box }.
 * `state` = { rows: [label1, label2], hole, values: { a, b, c, d } (textes), maxText, gauges: [{ id, name, left, right, capL, capR }], open }
 * Les boîtes de chaque balance couvrent le trajet complet des plateaux (inclinaison -MAX … +MAX).
 */
export function labelBoxes(geo, state) {
  const out = [];
  const maxLines = Math.max(6, Math.floor(geo.lw / 6.4));
  state.rows.forEach((label, i) => {
    const { lines, unit } = labelLines(label, maxLines);
    const all = unit ? [...lines, unit] : lines;
    const lh = 13;
    const total = all.length * lh;
    const r = geo.rows[i];
    const y0 = r.y0 + (r.y1 - r.y0 - total) / 2;
    all.forEach((ln, j) => out.push({ id: `row${i}-${j}`, box: centered((r.x0 + r.x1) / 2, y0 + j * lh, textW(ln, 12), lh) }));
  });
  for (const k of ['a', 'b', 'c', 'd']) {
    const c = geo.cells[k];
    const t = state.values[k];
    const size = t.length > 6 ? 16 : t.length > 4 ? 19 : CARD_FONT;
    out.push({ id: `card-${k}`, box: centered(c.cx, c.cy - size * 0.55, Math.min(textW(t, size), geo.cw - 8), size * 1.1) });
  }
  out.push({ id: 'max', box: centered(geo.ruler.tx1, geo.ruler.trackY + KNOB_R + 2, textW(state.maxText, SMALL), 12) });
  out.push({ id: 'zero', box: centered(geo.ruler.tx0, geo.ruler.trackY + KNOB_R + 2, textW('0', SMALL), 12) });
  geo.gauges.forEach((g, i) => {
    const gg = gaugeGeo(geo, g, 0);
    const s = state.gauges[i];
    if (!s) return;
    out.push({ id: `${s.id}-name`, box: centered(g.cx, gg.nameY, Math.min(textW(s.name, 12), g.gw - 4), 14) });
    const lw_ = Math.min(textW(s.left, 12) + 8, gg.chipW); const rw_ = Math.min(textW(s.right, 12) + 8, gg.chipW);
    out.push({ id: `${s.id}-chipL`, box: centered(g.cx - g.gw / 4, gg.chipY, lw_, gg.chipH) });
    out.push({ id: `${s.id}-chipR`, box: centered(g.cx + g.gw / 4, gg.chipY, rw_, gg.chipH) });
    if (state.open || geo.roomy) {
      out.push({ id: `${s.id}-capL`, box: centered(g.cx - g.gw / 4, gg.capY, Math.min(textW(s.capL, SMALL), g.gw / 2 - 3), 13) });
      out.push({ id: `${s.id}-capR`, box: centered(g.cx + g.gw / 4, gg.capY, Math.min(textW(s.capR, SMALL), g.gw / 2 - 3), 13) });
    }
    // le trajet complet des plateaux (pas d'étiquette dessus, mais ils ne doivent toucher ni les puces ni le nom)
    const lo = gaugeGeo(geo, g, MAX_TILT); const hi = gaugeGeo(geo, g, -MAX_TILT);
    const top = Math.min(lo.left.y, lo.right.y, hi.left.y, hi.right.y);
    const bottom = Math.max(lo.left.y, lo.right.y, hi.left.y, hi.right.y) + gg.dishDrop + 4;
    out.push({ id: `${s.id}-pans`, box: box(g.cx - gg.bl - 12, top, g.cx + gg.bl + 12, bottom) });
    out.push({ id: `${s.id}-lamp`, box: centered(g.cx, gg.lampY - 6, 12, 12) });
  });
  return out;
}

const intersects = (p, q) => p.x0 < q.x1 && q.x0 < p.x1 && p.y0 < q.y1 && q.y0 < p.y1;

/** Les paires d'étiquettes qui se chevauchent (vide = conforme). Les plateaux d'une balance ne comptent pas contre sa propre lampe. */
export function overlaps(boxes) {
  const bad = [];
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i]; const b = boxes[j];
      if (!intersects(a.box, b.box)) continue;
      const pair = [a.id, b.id].sort().join('|');
      if (/-pans\|.*-lamp$|-lamp\|.*-pans$/.test(pair) && a.id.split('-')[0] === b.id.split('-')[0]) continue;
      bad.push([a.id, b.id]);
    }
  }
  return bad;
}

