/**
 * La GÉOMÉTRIE du monde `sea` du labo `zero-probe`, pure et testée (`zeroProbe.render.test.jsx › aucune étiquette ne se chevauche`).
 *
 * L'échelle verticale va de −10 à 10 m ; le zéro est la surface de la mer. Les étiquettes (la pastille de A, de B, de d, les deux
 * bornes d'une zone, les graduations) y sont posées par des règles qui ne dépendent QUE de la largeur de la scène :
 *   - A (ou les bornes lo / hi) dans la colonne de gauche (`xA`) ; B à droite de son capteur ; d à GAUCHE du câble de B ;
 *   - les graduations à droite de l'axe (`axisX`), que ni B ni d ne dépassent.
 */
import { pillWidth } from '../../primitives/SvgPill';

export const PILL = 13;
const TICK_FONT = 11;
export const AXIS_PAD = 46;
export const RING = 22;
const PAD = 18;
const pillH = Math.round(PILL * 1.9);

export const minus = (s) => String(s).replace(/-/g, '−');

/** La mise en page pour une scène de `W` × `H` px. */
export function layout(W, H) {
  const u = (H - PAD * 2) / 20;
  const yOf = (v) => PAD + (10 - v) * u;
  const axisX = W - AXIS_PAD;
  const xA = Math.max(46, Math.round(W * 0.14));
  const xB = Math.round(W * 0.54);
  const xBoat = Math.round(W * 0.33);
  return { W, H, u, yOf, y0: yOf(0), axisX, xA, xB, xBoat, boatW: Math.max(84, Math.min(210, Math.round(W * 0.26))) };
}

/** Le rectangle d'une pastille centrée (ou ancrée) en (x, y) — le centre vertical est `y`. */
function pillBox(x, y, text, anchor = 'middle') {
  const w = pillWidth(text, PILL);
  const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  return { x0, y0: y - pillH / 2, x1: x0 + w, y1: y - pillH / 2 + pillH, w, h: pillH };
}

/**
 * Toutes les étiquettes de la scène pour un état : { id, box }.
 * `state` = { marks: [{ id: 'a'|'lo'|'hi', text }], value (texte de B), dText, d (nombre de m), side, ticks (tous 2 m) }
 */
export function labelBoxes(geo, { marks, value, dText, d, side }) {
  const out = [];
  const num = (t) => Number(String(t).replace(',', '.'));
  for (const m of marks) {
    const v = num(m.text);
    if (m.id === 'a') out.push({ id: 'a', box: pillBox(geo.xA, geo.yOf(v), `A = ${minus(m.text)}`) });
    else {
      // lo : sous sa ligne ; hi : au-dessus de la sienne — les deux pastilles ne se touchent jamais, même à 0,2 m d'écart
      const p = pillBox(geo.xA, geo.yOf(v), minus(m.text));
      const dy = m.id === 'hi' ? -(pillH / 2 + 1) : (pillH / 2 + 1);
      out.push({ id: m.id, box: { ...p, y0: p.y0 + dy, y1: p.y1 + dy } });
    }
  }
  const sgn = side === 'below' ? -1 : 1;
  const yB = geo.yOf(sgn * d);
  out.push({ id: 'b', box: pillBox(geo.xB + RING + 4, yB, `B = ${minus(value)}`, 'start') });
  out.push({ id: 'd', box: pillBox(geo.xB - RING - 4, (geo.y0 + yB) / 2, `d = ${dText}`, 'end') });
  for (let t = -10; t <= 10; t += 2) {
    const s = minus(String(t));
    const w = s.length * 6.4 + 2;
    out.push({ id: `tick${t}`, box: { x0: geo.axisX + 12, y0: geo.yOf(t) - TICK_FONT / 2, x1: geo.axisX + 12 + w, y1: geo.yOf(t) + TICK_FONT / 2 } });
  }
  return out;
}

const intersects = (p, q) => p.x0 < q.x1 && q.x0 < p.x1 && p.y0 < q.y1 && q.y0 < p.y1;

/** Les paires d'étiquettes qui se chevauchent (vide = conforme). */
export function overlaps(boxes) {
  const bad = [];
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      if (intersects(boxes[i].box, boxes[j].box)) bad.push([boxes[i].id, boxes[j].id]);
    }
  }
  return bad;
}
