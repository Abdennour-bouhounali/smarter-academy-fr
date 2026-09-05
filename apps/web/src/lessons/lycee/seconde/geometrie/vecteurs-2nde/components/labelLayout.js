/**
 * labelLayout — placer des étiquettes courtes (noms de points, noms de
 * vecteurs, « +3 » d'un escalier) dans un SVG SANS qu'aucune ne chevauche
 * une autre, un point, une flèche ou une graduation, et sans qu'aucune ne
 * sorte du cadre — pour TOUT état atteignable (INTERACTION_PEDAGOGY §17bis).
 *
 * Pur, en pixels SVG, testé sur un balayage de grille. Le composant qui
 * l'appelle (VectorScene) ne décide jamais d'un décalage fixe.
 *
 * Algorithme : pour chaque étiquette, une liste ordonnée de candidats
 * (autour d'un point : 8 directions à deux distances ; le long d'une flèche :
 * de part et d'autre de son milieu, puis à 30 % et 70 %). Le premier candidat
 * qui tient dans le cadre et ne touche ni un obstacle ni une étiquette déjà
 * posée gagne. S'il n'en existe aucun, on prend celui qui gêne le moins et
 * on le RAMÈNE dans le cadre : une étiquette lisible mal placée vaut mieux
 * qu'une étiquette rognée.
 */

const GLYPH = { ',': 0.3, '.': 0.3, ' ': 0.3, ';': 0.3, '−': 0.6, '-': 0.6, '+': 0.6, '(': 0.35, ')': 0.35, '·': 0.3 };

/** Largeur estimée d'un texte (police 600, px). Les emojis sont larges. */
export function textWidth(text, size) {
  let w = 0;
  for (const ch of String(text)) {
    const code = ch.codePointAt(0);
    if (code > 0x2600) w += size * 1.25;          // emoji / symboles larges
    else if (ch === '√') w += size * 0.7;
    else w += (GLYPH[ch] ?? 0.62) * size;
  }
  return w;
}

export function boxesOverlap(a, b, gap = 1) {
  return a.x < b.x + b.w + gap && b.x < a.x + a.w + gap
    && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;
}

function overlapArea(a, b) {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return ox > 0 && oy > 0 ? ox * oy : 0;
}

function insideFrame(b, frame) {
  return b.x >= frame.x && b.y >= frame.y
    && b.x + b.w <= frame.x + frame.w && b.y + b.h <= frame.y + frame.h;
}

function clampBox(b, frame) {
  return {
    ...b,
    x: Math.max(frame.x, Math.min(frame.x + frame.w - b.w, b.x)),
    y: Math.max(frame.y, Math.min(frame.y + frame.h - b.h, b.y)),
  };
}

/** Des boîtes 8×8 échantillonnées le long d'un segment : l'obstacle « flèche ». */
export function segmentObstacles(a, b, size = 8) {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const n = Math.max(1, Math.ceil(len / (size * 0.9)));
  const out = [];
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    out.push({ x: a.x + (b.x - a.x) * t - size / 2, y: a.y + (b.y - a.y) * t - size / 2, w: size, h: size });
  }
  return out;
}

export function pointObstacle(p, r = 9) {
  return { x: p.x - r, y: p.y - r, w: 2 * r, h: 2 * r };
}

/** Candidats autour d'un point, du plus lisible au moins lisible. */
function pointCandidates(p, w, h, prefer = 'ne') {
  const dirs = {
    ne: { x: 1, y: -1 }, nw: { x: -1, y: -1 }, se: { x: 1, y: 1 }, sw: { x: -1, y: 1 },
    n: { x: 0, y: -1 }, s: { x: 0, y: 1 }, e: { x: 1, y: 0 }, w: { x: -1, y: 0 },
  };
  const order = [prefer, ...Object.keys(dirs).filter((k) => k !== prefer)];
  const out = [];
  for (const d of [12, 20, 28]) {
    for (const k of order) {
      const dir = dirs[k];
      const cx = p.x + dir.x * (d + w / 2) * (dir.y === 0 ? 1 : 0.8) + (dir.x === 0 ? 0 : 0);
      const cy = p.y + dir.y * (d + h / 2) * (dir.x === 0 ? 1 : 0.8);
      out.push({ x: cx - w / 2, y: cy - h / 2, w, h });
    }
  }
  return out;
}

/** Candidats le long d'une flèche : de part et d'autre, milieu puis tiers. */
function arrowCandidates(from, to, w, h, avoid = null) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return pointCandidates(from, w, h);
  const n = { x: -dy / len, y: dx / len };
  // Côté préféré : celui qui s'éloigne du point `avoid` (pour une marche
  // d'escalier, l'extérieur du triangle — jamais contre l'hypoténuse).
  let sides = [1, -1];
  if (avoid) {
    const mid = { x: from.x + dx / 2, y: from.y + dy / 2 };
    const far = (side) => Math.hypot(mid.x + n.x * side * 10 - avoid.x, mid.y + n.y * side * 10 - avoid.y);
    sides = far(1) >= far(-1) ? [1, -1] : [-1, 1];
  }
  const out = [];
  const half = Math.min(w, h) / 2;
  for (const d of [11, 18, 26, 34, 42]) {
    for (const t of [0.5, 0.3, 0.7, 0.15, 0.85]) {
      for (const side of sides) {
        const cx = from.x + dx * t + n.x * side * (d + half);
        const cy = from.y + dy * t + n.y * side * (d + half);
        out.push({ x: cx - w / 2, y: cy - h / 2, w, h });
      }
    }
    // Au-delà des extrémités, dans le prolongement puis en biais : une flèche
    // courte coincée le long d'une bande de graduations n'a de place que là.
    const ux = dx / len;
    const uy = dy / len;
    for (const end of [{ p: to, s: 1 }, { p: from, s: -1 }]) {
      for (const side of [0, ...sides]) {
        const cx = end.p.x + ux * end.s * (d + half) + n.x * side * (d * 0.6 + half);
        const cy = end.p.y + uy * end.s * (d + half) + n.y * side * (d * 0.6 + half);
        out.push({ x: cx - w / 2, y: cy - h / 2, w, h });
      }
    }
  }
  return out;
}

/**
 * @param labels    [{ id, text, size, kind: 'point'|'arrow', anchor:{x,y} | from,to, prefer?, avoid?, pad? }]
 * @param obstacles [{x,y,w,h}] boîtes à ne pas toucher
 * @param frame     {x,y,w,h}
 * @returns [{ id, text, size, box:{x,y,w,h}, x, y }] — x,y : position du <text> (textAnchor="start", baseline alphabétique)
 */
export function placeLabels(labels, obstacles, frame) {
  const placed = [];
  const out = [];
  for (const l of labels) {
    const pad = l.pad ?? 0;
    const w = textWidth(l.text, l.size) + 2 * pad;
    const h = l.size * 1.05 + 2 * pad;
    const cands = l.kind === 'arrow'
      ? arrowCandidates(l.from, l.to, w, h, l.avoid)
      : pointCandidates(l.anchor, w, h, l.prefer);
    const blockers = [...obstacles, ...placed];
    let best = null;
    let bestScore = Infinity;
    for (const c of cands) {
      if (!insideFrame(c, frame)) continue;
      let score = 0;
      for (const b of blockers) {
        if (boxesOverlap(c, b)) score += overlapArea(c, b) + 4;
      }
      if (score === 0) { best = c; bestScore = 0; break; }
      if (score < bestScore) { best = c; bestScore = score; }
    }
    if (!best) {
      // Aucun candidat dans le cadre : on ramène le premier dedans.
      best = clampBox(cands[0], frame);
    }
    placed.push(best);
    out.push({
      id: l.id, text: l.text, size: l.size, kind: l.kind, box: best,
      x: best.x + pad, y: best.y + pad + l.size * 0.82,
    });
  }
  return out;
}
