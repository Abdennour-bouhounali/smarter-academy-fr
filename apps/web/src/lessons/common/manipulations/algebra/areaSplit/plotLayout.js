import * as E from '@smarter-academy/core/arithmetic/expansion.js';

/**
 * area-split (monde `plot`) — la GÉOMÉTRIE du terrain, pure et testée (MANIPULATION_CONTRACT §7ter étape 9). Tout est à l'ÉCHELLE d'une
 * unité `u` (px). Le dessin est LTR (une figure, pas du texte) : le côté `w` (horizontal) se lit de gauche à droite depuis le bord
 * gauche, le côté `h` (vertical) de haut en bas depuis le bord haut. La scène a un cadre FIXE (calculé à x = 9) : le terrain grandit
 * dans son cadre quand la main règle x, rien d'autre ne bouge.
 *
 * Marges : en haut — l'écriture du côté `w` (y = 14), la poignée de coupure de `w` à cheval sur le bord (la bulle du guide s'ouvre AU-DESSUS
 * d'elle, jamais sur le terrain) et, une fois la coupure juste, ses accolades et leurs libellés ; à gauche — l'écriture de `h` (tournée),
 * la poignée de coupure de `h`, puis ses accolades et libellés. Un nombre négatif est une BANDE
 * ôtée au bout du côté : elle MORD sur le terme en x (son libellé est écrit dans la bande, jamais en accolade — les accolades ne se
 * chevauchent donc jamais).
 */
const hasStrip = (s) => s.m > 0 && s.n < 0;
/** Les marges de la scène : celles qu'exigent les deux côtés (un côté constant n'a ni poignée ni accolades à gauche ; une bande ôtée écrit son libellé HORS du terrain). */
export function marginsOf(h, w, scaffold = true) {
  if (!scaffold) return { top: 40, left: E.isCuttable(h) ? 44 : 34, right: 16, bottom: 16 };
  return { top: 52, left: E.isCuttable(h) ? 74 : 44, right: hasStrip(h) ? 48 : 16, bottom: hasStrip(w) ? 36 : 16 };
}
export const KNOB_R = 13;
export const BADGE_R = 11;
export const U_MIN = 12;
export const U_MAX = 48;
/** Largeur estimée d'un libellé court (chiffres, x, signe) en px, pour la géométrie des collisions. */
const labelWidth = (text, size = 14) => Math.round(String(text).length * size * 0.62 + size * 0.6);

/** Le cadre fixe de la scène (viewBox), calculé à x = X_MAX. */
export function frameOf(h, w, u, scaffold = true) {
  const M = marginsOf(h, w, scaffold);
  const W = E.drawnLength(w, E.X_MAX) * u;
  const H = E.drawnLength(h, E.X_MAX) * u;
  return { W, H, M, vbW: M.left + W + M.right, vbH: M.top + H + M.bottom };
}

/** L'unité qui fait tenir la scène d'un regard dans `width` × `height` px (le cadre à x = 9). */
export function fitUnit({ h, w, width, height, scaffold = true, min = U_MIN, max = U_MAX }) {
  const Wu = E.drawnLength(w, E.X_MAX);
  const Hu = E.drawnLength(h, E.X_MAX);
  const M = marginsOf(h, w, scaffold);
  const u = Math.floor(Math.min((width - M.left - M.right) / Wu, (height - M.top - M.bottom) / Hu));
  return Math.max(min, Math.min(max, u));
}

/** L'intervalle VISIBLE d'un segment : le terme en x d'un côté dont le nombre est ôté ne montre que ce qui reste de pelouse. */
export function visibleSpan(s, i, x) {
  const t = E.sideTerms(s)[i];
  if (t.p === 1 && s.n < 0) return { from: 0, to: s.m * x + s.n };
  return E.segmentSpan(s, i, x);
}

const minus = (txt) => txt.replace(/-/g, '−');
/** Le libellé d'un terme dans une accolade : « x », « 2x », « 4 », « −3 ». */
export const termLabel = (t) => minus(E.termTex(t).replace(/^(-?)1x/, '$1x').replace('^2', '²'));

/**
 * La géométrie complète du terrain à x : les rectangles pleins et VISIBLES de chaque parcelle, la place de son badge, les accolades
 * (côtés `top` et `left`), les poignées, le rectangle du terrain. Toutes les coordonnées sont dans le repère de la scène.
 */
export function geometry({ h, w, x, u, scaffold = true, patches = E.patchesOf(h, w) }) {
  const M = marginsOf(h, w, scaffold);
  const ox = M.left; const oy = M.top;
  const W = E.drawnLength(w, x) * u; const H = E.drawnLength(h, x) * u;
  const sx = (v) => ox + v * u; const sy = (v) => oy + v * u;
  const rects = patches.map((p) => {
    const a = E.segmentSpan(h, p.i, x); const b = E.segmentSpan(w, p.j, x);
    const va = visibleSpan(h, p.i, x); const vb = visibleSpan(w, p.j, x);
    return {
      id: p.id,
      full: { x0: sx(b.from), x1: sx(b.to), y0: sy(a.from), y1: sy(a.to) },
      seen: { x0: sx(vb.from), x1: sx(vb.to), y0: sy(va.from), y1: sy(va.to) },
      badge: { cx: (sx(vb.from) + sx(vb.to)) / 2, cy: (sy(va.from) + sy(va.to)) / 2 },
    };
  });
  /** Les accolades d'un côté : les segments POSITIFS seulement (un nombre ôté s'écrit dans sa bande). `axis` 'w' (haut) ou 'h' (gauche). */
  const braces = (s, axis) => {
    if (E.sideTerms(s).length < 2) return [];
    return E.segments(s).filter((g) => g.term.c > 0).map((g) => {
      const sp = E.segmentSpan(s, g.i, x);
      const label = termLabel(g.term);
      return axis === 'w'
        ? { axis, i: g.i, from: sx(sp.from), to: sx(sp.to), line: oy - 12, label, cx: (sx(sp.from) + sx(sp.to)) / 2, cy: oy - 25, w: labelWidth(label, 14), h: 18 }
        : { axis, i: g.i, from: sy(sp.from), to: sy(sp.to), line: ox - 26, label, cx: ox - 37, cy: (sy(sp.from) + sy(sp.to)) / 2, w: labelWidth(label, 14), h: 18 };
    });
  };
  /** Les bandes ôtées (nombre négatif) et leur libellé, écrit HORS du terrain : sous le bord bas pour `w`, à droite du bord pour `h`. */
  const strips = (s, axis) => E.segments(s).filter((g) => g.term.c < 0 && s.m > 0).map((g) => {
    const sp = E.segmentSpan(s, g.i, x);
    const label = termLabel(g.term);
    return axis === 'w'
      ? { axis, i: g.i, x0: sx(sp.from), x1: sx(sp.to), y0: oy, y1: oy + H, label, cx: (sx(sp.from) + sx(sp.to)) / 2, cy: oy + H + 18, w: labelWidth(label, 13), h: 16 }
      : { axis, i: g.i, x0: ox, x1: ox + W, y0: sy(sp.from), y1: sy(sp.to), label, cx: ox + W + 8 + labelWidth(label, 13) / 2, cy: (sy(sp.from) + sy(sp.to)) / 2, w: labelWidth(label, 13), h: 16 };
  });
  return {
    ox, oy, W, H, M, rect: { x0: ox, x1: ox + W, y0: oy, y1: oy + H },
    rects, bracesTop: braces(w, 'w'), bracesLeft: braces(h, 'h'), stripsW: strips(w, 'w'), stripsH: strips(h, 'h'),
    knob: {
      w: E.isCuttable(w) ? (at) => ({ cx: sx(at), cy: oy, line: { x0: sx(at), x1: sx(at), y0: oy, y1: oy + H } }) : null,
      h: E.isCuttable(h) ? (at) => ({ cx: ox, cy: sy(at), line: { x0: ox, x1: ox + W, y0: sy(at), y1: sy(at) } }) : null,
    },
    sx, sy,
  };
}

/**
 * Les badges (n° puis signe) sont des disques de rayon BADGE_R ; en مبتدئ une pilule d'aire les suit à droite si elle tient dans la partie
 * visible de la parcelle sans toucher un autre badge. Retourne, par parcelle, `{ cx, cy, pill: null | { x, y, w, h } }`.
 */
export function badgeLayout(geo, { showArea, areas }) {
  const boxes = geo.rects.map((r) => ({ id: r.id, ...r.badge, pill: null }));
  if (!showArea) return boxes;
  const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const discs = boxes.map((b) => ({ x: b.cx - BADGE_R - 1, y: b.cy - BADGE_R - 1, w: 2 * BADGE_R + 2, h: 2 * BADGE_R + 2 }));
  const taken = [...discs];
  boxes.forEach((b, i) => {
    const txt = String(areas[b.id]);
    const w = labelWidth(txt, 13) + 4; const h = 20;
    const pill = { x: b.cx + BADGE_R + 2, y: b.cy - h / 2, w, h };
    const seen = geo.rects[i].seen;
    const inside = pill.x + pill.w <= seen.x1 + 2 && pill.x >= seen.x0 - 2 && pill.y >= seen.y0 - 2 && pill.y + pill.h <= seen.y1 + 2;
    const free = taken.every((t) => t === discs[i] || !hit(pill, t));
    if (inside && free) { b.pill = pill; taken.push(pill); }
  });
  return boxes;
}

/** Deux boîtes { x, y, w, h } se chevauchent-elles ? */
export const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
/** Les boîtes des deux écritures de côté : celle de `w` au-dessus du terrain, celle de `h` TOURNÉE à gauche (même géométrie que le dessin). */
export function sideLabelBoxes(geo, wText, hText) {
  const ww = labelWidth(wText, 15); const hw = labelWidth(hText, 15);
  return [
    { id: 'side:w', x: geo.ox + geo.W / 2 - ww / 2, y: 0, w: ww, h: 17 },
    { id: 'side:h', x: 3, y: geo.oy + geo.H / 2 - hw / 2, w: 16, h: hw },
  ];
}
/** Les boîtes de TOUS les libellés d'une géométrie (badges, accolades, bandes) pour le test de collision. */
export function labelBoxes(geo, badges) {
  const out = [];
  for (const b of badges) {
    out.push({ id: `badge:${b.id}`, x: b.cx - BADGE_R, y: b.cy - BADGE_R, w: 2 * BADGE_R, h: 2 * BADGE_R });
    if (b.pill) out.push({ id: `pill:${b.id}`, ...b.pill });
  }
  for (const b of [...geo.bracesTop, ...geo.bracesLeft]) out.push({ id: `brace:${b.axis}${b.i}`, x: b.cx - b.w / 2, y: b.cy - b.h / 2, w: b.w, h: b.h });
  for (const b of [...geo.stripsW, ...geo.stripsH]) out.push({ id: `strip:${b.axis}${b.i}`, x: b.cx - b.w / 2, y: b.cy - b.h / 2, w: b.w, h: b.h });
  return out;
}
