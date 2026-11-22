/**
 * The TAPE DIAGRAM with arcs (« schéma en barre », addition and subtraction, 2026-10-14).
 *
 * One straight line cut into parts (the terms); an arc ABOVE each part carries its value, one arc BELOW the whole line
 * carries the whole (the sum). It represents « 24,3 + 5,9 = 30,2 » and turns « de plus / de moins / plus / moins »
 * into a calculation (« solve a problem with a fitting representation »): the unknown is
 * either the WHOLE (we add the parts) or a PART (we subtract the other part from the whole).
 *
 * Data (`statement.figure` with `kind: 'tape'`, a problem's `figure`, or a lesson's own figure):
 *
 *   {
 *     kind: 'tape',
 *     parts: [{ label: '24,3', value?: 24.3 | '24,3', unknown?: true, tone? }, …],   // 2 to 4, drawn left → right
 *     whole: { label: '30,2', value?, unknown?: true },
 *     ariaLabel: '<French>',        // required, never Arabic
 *     caption?, maxWidth?, inline?
 *   }
 *
 * A label is short text read LEFT TO RIGHT (« 24,3 », « 124 cm », « □ »); a label that holds a word is drawn in the text font.
 * Lengths are SCHEMATIC, as in the textbook: proportional to the values when they are known (a missing part is the
 * whole minus the others), never thinner than `MIN_PART` of the width so that every arc and label stays readable.
 * When every value is given and the parts do not add up to the whole, the layout says so (`closed: false`) and draws
 * the GAP (parts too short) or the OVERFLOW (parts too long) — a lab uses it to show that a wrong calculation does
 * not close the tape. A STATEMENT figure must close: `validateArcTape` refuses one whose numbers do not add up.
 */

const TAPE_KEYS = Object.freeze(['kind', 'parts', 'whole', 'ariaLabel', 'caption', 'maxWidth', 'inline']);
const TAPE_TONES = Object.freeze(['amber', 'emerald', 'sky', 'violet', 'indigo', 'rose', 'slate']);
const PART_TONES = ['amber', 'emerald', 'sky', 'violet'];
export const MIN_PART = 0.16;
const ARABIC = /[\u0600-\u06FF]/;
/** A label holding a word (« ce qu’il a ») is drawn in the text font; a number in a fixed-width one. */
const WORD = /[A-Za-zÀ-ÿ]{2,}/;

/** A value given as a number or a decimal-comma string ('24,3'), or null when absent / unreadable. */
function tapeValue(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const n = Number(String(v).trim().replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

const close = (a, b) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

/**
 * The lengths the tape is drawn with, in the values' own unit: one per part, the whole, and whether it closes.
 * `known` is false when the values cannot place the parts (they are then drawn equal).
 */
export function tapeLengths(fig) {
  const parts = fig.parts.map((p) => tapeValue(p.value));
  let whole = tapeValue(fig.whole?.value);
  const missing = parts.filter((v) => v == null).length;
  if (missing === 0) {
    const sum = parts.reduce((a, b) => a + b, 0);
    if (whole == null) whole = sum;
    return { parts, whole, sum, known: true, closed: close(sum, whole) };
  }
  if (missing === 1 && whole != null) {
    const rest = parts.reduce((a, v) => a + (v ?? 0), 0);
    const filled = parts.map((v) => (v == null ? Math.max(whole - rest, 0) : v));
    return { parts: filled, whole, sum: whole, known: true, closed: whole - rest >= 0 };
  }
  const n = fig.parts.length;
  return { parts: Array(n).fill(1), whole: n, sum: n, known: false, closed: true };
}

/** Widths in drawing units: proportional, each part at least MIN_PART of the drawn span (when it fits). */
function spread(lengths, span, total) {
  const raw = lengths.map((l) => (total > 0 ? (l / total) * span : span / lengths.length));
  const floor = MIN_PART * span;
  if (floor * lengths.length > span) return raw.map(() => span / lengths.length);
  const small = raw.filter((w) => w < floor);
  if (small.length === 0) return raw;
  const need = small.reduce((a, w) => a + (floor - w), 0);
  const bigTotal = raw.filter((w) => w >= floor).reduce((a, w) => a + w, 0);
  return raw.map((w) => (w < floor ? floor : w - (need * w) / bigTotal));
}

/**
 * Layout in a viewBox `W × H` (LTR): the line, the tick marks, one arc above each part, the arc below the whole,
 * and — when the tape does not close — the gap or overflow segment.
 */
export function layoutArcTape(fig, { W = 340, pad = 18, archUp = 26, archDown = 30 } = {}) {
  const len = tapeLengths(fig);
  const y = 16 + archUp + 14;
  const span = W - 2 * pad;
  // Total drawn length: the longest of (sum of parts, whole) fills the span.
  const total = Math.max(len.sum, len.whole);
  const pieces = [...len.parts];
  let gap = 0;
  if (!len.closed && len.known) gap = len.whole - len.sum; // > 0: too short, < 0: overflow
  const widthsIn = gap > 0 ? [...pieces, gap] : pieces;
  const widths = spread(widthsIn, gap > 0 ? span : (span * len.sum) / total, gap > 0 ? total : len.sum);
  const partW = widths.slice(0, pieces.length);
  const xs = [pad];
  for (const w of partW) xs.push(xs.at(-1) + w);
  const partsEnd = xs.at(-1);
  // The whole's arc: as long as the whole (shorter than the parts on an overflow).
  const wholeEnd = gap > 0 ? partsEnd + widths.at(-1) : gap < 0 ? pad + (span * len.whole) / total : partsEnd;
  const arc = (x1, x2, h, up) => {
    const yy = up ? y - 2 * h : y + 2 * h;
    return `M${x1.toFixed(1)} ${y} Q${((x1 + x2) / 2).toFixed(1)} ${yy} ${x2.toFixed(1)} ${y}`;
  };
  const parts = fig.parts.map((p, i) => ({
    x1: xs[i], x2: xs[i + 1], path: arc(xs[i] + 2, xs[i + 1] - 2, archUp / 1.6, true),
    labelX: (xs[i] + xs[i + 1]) / 2, labelY: y - archUp / 1.6 - 6,
    label: p.label, unknown: !!p.unknown, tone: p.tone ?? PART_TONES[i % PART_TONES.length],
    word: WORD.test(String(p.label ?? '')),
  }));
  const whole = {
    x1: pad, x2: wholeEnd, path: arc(pad + 1, wholeEnd - 1, archDown / 1.6, false),
    labelX: (pad + wholeEnd) / 2, labelY: y + archDown / 1.6 + 16,
    label: fig.whole?.label, unknown: !!fig.whole?.unknown, tone: fig.whole?.tone ?? 'indigo',
    word: WORD.test(String(fig.whole?.label ?? '')),
  };
  const lineEnd = Math.max(partsEnd, wholeEnd);
  const ticks = [...new Set([...xs, wholeEnd].map((x) => x.toFixed(1)))].map(Number);
  const mismatch = gap > 0 ? { kind: 'gap', x1: partsEnd, x2: wholeEnd } : gap < 0 ? { kind: 'overflow', x1: wholeEnd, x2: partsEnd } : null;
  const H = y + archDown / 1.6 + 26;
  return { W, H, y, x0: pad, lineEnd, parts, whole, ticks, mismatch, closed: len.closed, proportional: len.known };
}

/** Validation of a STATEMENT figure: [] when it is correct. */
export function validateArcTape(fig) {
  const errors = [];
  if (!fig || typeof fig !== 'object') return ['tape : figure absente'];
  for (const key of Object.keys(fig)) if (!TAPE_KEYS.includes(key)) errors.push(`tape : clé inconnue « ${key} »`);
  if (fig.kind !== 'tape') errors.push('tape : kind doit valoir « tape »');
  if (!Array.isArray(fig.parts) || fig.parts.length < 2 || fig.parts.length > 4) errors.push('tape : 2 à 4 parties (parts)');
  const items = [...(Array.isArray(fig.parts) ? fig.parts : []), ...(fig.whole ? [fig.whole] : [])];
  if (!fig.whole || typeof fig.whole !== 'object') errors.push('tape : le tout (whole) est obligatoire');
  items.forEach((it, i) => {
    const where = i < (fig.parts?.length ?? 0) ? `parts[${i}]` : 'whole';
    if (typeof it?.label !== 'string' || it.label.trim() === '') errors.push(`tape : ${where} sans label`);
    if (it?.value != null && tapeValue(it.value) == null) errors.push(`tape : ${where}.value illisible`);
    if (it?.tone != null && !TAPE_TONES.includes(it.tone)) errors.push(`tape : ${where}.tone inconnu`);
  });
  if (typeof fig.ariaLabel !== 'string' || !fig.ariaLabel.trim() || ARABIC.test(fig.ariaLabel)) errors.push('tape : ariaLabel en français obligatoire');
  if (errors.length === 0) {
    const len = tapeLengths(fig);
    if (len.known && !len.closed) errors.push('tape : les parties ne font pas le tout (une figure d’énoncé doit être juste)');
  }
  return errors;
}
