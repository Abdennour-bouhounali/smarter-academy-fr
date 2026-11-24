/**
 * THE EXPERIMENT `plan`, the computing plan (key 📐 — PYRAMIDS_WORLD_PLAN §2.3, §3.4) — PURE reducer; the screen is
 * `InquiryPlan.jsx`. On a figure with ONE unknown length he builds his plan: he picks two of the THREE RATIO CARDS of
 * the chain (every term a length FROM THE VERTEX), joins two ropes end to end or cuts a piece off — on a NESTED figure
 * along a side (VM + MB = VB, VB − VM = MB), on a BUTTERFLY across the vertex (VM + VB = VMB, VMB − VM = VB) — then
 * types the unknown: the cross product is his. The world lays his number: a side facing the vertex (MN, BC) as a course
 * on the drawn face (fits · gap · overhang), a length on a line through the vertex of a butterfly as a rope from the
 * vertex (`laidOn`, its own words `KIND_TEXT.plan.line`); the size written (this is the mirror). A card with two unknowns refuses itself. No sentence names the criterion (gate P2).
 *
 *   spec = { kind: 'plan', rounds: [{ fig: { kind: 'nested', names, len }, given: ['VM', 'MB', 'BC'], unknown: 'MN' }],
 *            text? }
 *   a butterfly round: { fig: { kind: 'butterfly', names, len }, given: ['VM', 'VMB', 'MN'], unknown: 'BC' }
 * `len` holds the TRUE lengths (VM, VB, VN, VC, MN, BC; `figure.js › withPieces` adds MB and NC to a nested figure, the
 * across lengths VMB and VNC to a butterfly); `given` what he is shown; `unknown` what he computes. The result (`planResult`) is the rows of every course laid and his last plan: `inquiry.writes` reads it.
 */
import { withPieces } from './figure';
import { write, compare, minus, plus, magnitude, tryRead } from '../kit/exact';

/** The three ratio cards of the chain: a card is its key and its two segments. */
export const CARDS = Object.freeze([
  { id: 'VB', top: 'VM', bottom: 'VB' },
  { id: 'VC', top: 'VN', bottom: 'VC' },
  { id: 'BC', top: 'MN', bottom: 'BC' },
]);
/**
 * Per figure kind, the two lines through the vertex as a whole and its two parts: on a nested figure a side and its
 * pieces; on a butterfly the length across the vertex and its two lengths from the vertex.
 */
const SIDES = Object.freeze({
  nested: [
    ['VB', 'VM', 'MB'],
    ['VC', 'VN', 'NC'],
  ],
  butterfly: [
    ['VMB', 'VM', 'VB'],
    ['VNC', 'VN', 'VC'],
  ],
});
/**
 * How the world lays a length: a side facing the vertex (MN, BC) is a course; on a butterfly, a length on a line
 * through the vertex is a rope stretched from the vertex ('line'). A nested figure's pieces stay courses.
 */
export const laidOn = (fig, key) => (fig.kind === 'butterfly' && key !== 'MN' && key !== 'BC' ? 'line' : 'course');
/** After this many courses that do not fit, the cards holding the unknown are lit (a fact: where the unknown is). */
const HINT_AFTER = 2;

const roundOf = (spec, i) => {
  const r = spec.rounds[i];
  return { ...r, fig: withPieces(r.fig) };
};

export function initPlan(spec) {
  if (!spec.rounds?.length) throw new Error('plan: no round');
  return start(spec, 0, []);
}
function start(spec, i, rows) {
  const r = roundOf(spec, i);
  return {
    i,
    kind: r.fig.kind,
    known: [...r.given],
    picked: [],
    joins: [],
    typed: '',
    laid: null,
    refused: null,
    misses: 0,
    rows,
    done: false,
  };
}

/** What a segment is worth now: its length when known, else null. */
export const valueOf = (spec, s, key) => (s.known.includes(key) ? roundOf(spec, s.i).fig.len[key] : null);

/** How many unknowns a card holds now. */
export const unknownsOf = (s, card) => [card.top, card.bottom].filter((k) => !s.known.includes(k)).length;

/**
 * The joins and cuts he may make now: `{ id: 'VM+MB', gives: 'VB' }`, `{ id: 'VB-VM', gives: 'MB' }`; on a butterfly
 * `{ id: 'VM+VB', gives: 'VMB' }`, `{ id: 'VMB-VM', gives: 'VB' }`.
 */
export function toolsOf(s) {
  const out = [];
  const has = (k) => s.known.includes(k);
  for (const [whole, a, b] of SIDES[s.kind] ?? SIDES.nested) {
    if (has(a) && has(b) && !has(whole)) out.push({ id: `${a}+${b}`, gives: whole });
    if (has(whole) && has(a) && !has(b)) out.push({ id: `${whole}-${a}`, gives: b });
    if (has(whole) && has(b) && !has(a)) out.push({ id: `${whole}-${b}`, gives: a });
  }
  return out;
}

/** The fact of a course laid: his number against the true length — exact; the size of the difference written. */
export function laidFact(typed, truth) {
  const c = compare(typed, truth);
  return { fact: c === 0 ? 'fits' : c < 0 ? 'gap' : 'overhang', diff: write(magnitude(minus(truth, typed))) };
}

export function planReducer(spec, s, a) {
  const r = roundOf(spec, s.i);
  switch (a.type) {
    case 'pick': {
      if (s.laid) return s;
      const card = CARDS.find((c) => c.id === a.card);
      if (!card) return s;
      if (s.picked.includes(card.id)) return { ...s, picked: s.picked.filter((x) => x !== card.id), refused: null };
      if (unknownsOf(s, card) >= 2) return { ...s, refused: card.id };
      if (s.picked.length >= 2) return { ...s, refused: null, picked: [s.picked[1], card.id] };
      return { ...s, picked: [...s.picked, card.id], refused: null };
    }
    case 'tool': {
      const t = toolsOf(s).find((x) => x.id === a.id);
      if (!t || s.laid) return s;
      return { ...s, known: [...s.known, t.gives], joins: [...s.joins, t.id], refused: null };
    }
    case 'type':
      return s.laid ? s : { ...s, typed: a.text };
    case 'lay': {
      const v = tryRead(s.typed);
      if (s.laid || s.picked.length !== 2 || !v || v.n <= 0n) return s;
      const typed = write(v);
      const { fact, diff } = laidFact(typed, r.fig.len[r.unknown]);
      const row = { round: s.i, unknown: r.unknown, typed, fact, diff, picked: [...s.picked], joins: [...s.joins] };
      return { ...s, laid: row, rows: [...s.rows, row], misses: s.misses + (fact === 'fits' ? 0 : 1) };
    }
    case 'next': {
      if (!s.laid) return s;
      if (s.laid.fact !== 'fits') return { ...s, laid: null, typed: '' }; // a new order of his own; the miss stays in the rows
      if (s.i + 1 >= spec.rounds.length) return { ...s, done: true };
      return start(spec, s.i + 1, s.rows);
    }
    default:
      return s;
  }
}

/** The cards that hold the unknown (lit after `HINT_AFTER` misses). */
export const hintCards = (spec, s) => {
  const r = roundOf(spec, s.i);
  return s.misses >= HINT_AFTER
    ? CARDS.filter((c) => c.top === r.unknown || c.bottom === r.unknown).map((c) => c.id)
    : [];
};

/** What the forge receives: every course laid, and his last plan (the cards and the joins of the last course that fit). */
export function planResult(s) {
  const fit = [...s.rows].reverse().find((row) => row.fact === 'fits') ?? null;
  return { rows: s.rows, plan: fit ? { cards: fit.picked, joins: fit.joins } : null };
}

/** The sum of two lengths (for a line that writes a join): « 42 + 12 = 54 ». */
export const joinText = (spec, s, id) => {
  const len = roundOf(spec, s.i).fig.len;
  const [a, b] = id.split(/[+-]/);
  const op = id.includes('+') ? plus : minus;
  return { a: len[a], b: len[b], out: write(op(len[a], len[b])) };
};

export const roundFig = roundOf;
