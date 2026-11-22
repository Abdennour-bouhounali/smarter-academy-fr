/**
 * Écrire une expression (tokens de cards.js) sur un canevas 2D : fractions
 * superposées, racine dessinée (pas un glyphe), exposants surélevés.
 * Toujours de gauche à droite (`ctx.direction = 'ltr'`) — c'est des maths.
 *
 *   measureMath(ctx, tokens, size) → largeur (px)
 *   drawMath(ctx, tokens, x, y, size, color)   x = bord gauche, y = ligne de base
 */
const FONT = '"Space Grotesk", Inter, system-ui, sans-serif';
const font = (size, weight = 700) => `${weight} ${size}px ${FONT}`;

function box(ctx, t, size) {
  if (typeof t === 'string') {
    ctx.font = font(size);
    return ctx.measureText(t).width;
  }
  if (t.frac) {
    ctx.font = font(size * 0.72);
    return Math.max(ctx.measureText(t.frac[0]).width, ctx.measureText(t.frac[1]).width) + size * 0.24;
  }
  if (t.sqrt) {
    ctx.font = font(size);
    return size * 0.62 + ctx.measureText(t.sqrt).width + size * 0.08;
  }
  ctx.font = font(size * 0.62);
  return ctx.measureText(t.sup).width + size * 0.04;
}

/**
 * Écrire un texte de maths de gauche à droite, morceau par morceau (nombre,
 * opérateur, parenthèse). La page est en RTL : laissé à l'algorithme
 * bidirectionnel, « 2 × 16 − 1 » s'afficherait « 1 − 16 × 2 ». Chaque morceau
 * est posé à sa place, la largeur totale reste celle de measureText.
 */
function runs(ctx, text, x, y) {
  let cx = x;
  for (const piece of text.match(/[0-9]+(?:,[0-9]+)?|[a-z]+|\s+|./gu) ?? []) {
    if (!/^\s+$/.test(piece)) ctx.fillText(piece, cx, y);
    cx += ctx.measureText(piece).width;
  }
}

export function measureMath(ctx, tokens, size) {
  return tokens.reduce((w, t) => w + box(ctx, t, size), 0);
}

/** La hauteur d'une écriture : une fraction est plus haute qu'une ligne. */
export function mathHeight(tokens, size) {
  return tokens.some((t) => t && t.frac) ? size * 1.9 : size * 1.25;
}

export function drawMath(ctx, tokens, x, y, size, color = '#0f172a') {
  ctx.save();
  ctx.direction = 'ltr';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  let cx = x;
  const axis = y - size * 0.32;
  for (const t of tokens) {
    const w = box(ctx, t, size);
    if (typeof t === 'string') {
      ctx.font = font(size);
      runs(ctx, t, cx, y);
    } else if (t.frac) {
      ctx.font = font(size * 0.72);
      const nw = ctx.measureText(t.frac[0]).width;
      const dw = ctx.measureText(t.frac[1]).width;
      runs(ctx, t.frac[0], cx + (w - nw) / 2, axis - size * 0.14);
      runs(ctx, t.frac[1], cx + (w - dw) / 2, axis + size * 0.62);
      ctx.lineWidth = Math.max(1.5, size * 0.07);
      ctx.beginPath();
      ctx.moveTo(cx + size * 0.06, axis);
      ctx.lineTo(cx + w - size * 0.06, axis);
      ctx.stroke();
    } else if (t.sqrt) {
      const top = y - size * 0.86;
      ctx.lineWidth = Math.max(1.5, size * 0.075);
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + size * 0.04, y - size * 0.34);
      ctx.lineTo(cx + size * 0.16, y - size * 0.42);
      ctx.lineTo(cx + size * 0.3, y + size * 0.04);
      ctx.lineTo(cx + size * 0.54, top);
      ctx.lineTo(cx + w, top);
      ctx.stroke();
      ctx.font = font(size);
      runs(ctx, t.sqrt, cx + size * 0.62, y);
    } else {
      ctx.font = font(size * 0.62);
      runs(ctx, t.sup, cx + size * 0.02, y - size * 0.46);
    }
    cx += w;
  }
  ctx.restore();
}
