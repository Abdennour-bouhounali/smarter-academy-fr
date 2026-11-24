/**
 * The pyramids world — the rule forge IN THIS WORLD (PURE; the frame is kit/forge.js, the screen kit/RuleForge.jsx,
 * the drawing of a case forgeParts.jsx). It names no lesson: a lesson's `world/forges.js` builds its forges on these cases.
 *
 * A CASE is a Thalès figure (`figure.js`) and what is true of it:
 *   { kind: 'nested' | 'butterfly', names: { V, M, B, N, C }, len: { VM, VB, VN, VC, MN, BC }, held, …extras }
 *   held    what the case is TRUE of — given by the lesson's question (default: « the three ratios are equal »,
 *           `chain`, exact)
 *   extras  `id` (an identity of its own), `head` (the case's name in a line of evidence, e.g. the field's new canal),
 *           `tag` (a short word under it), `show` (the lengths the mirror writes; default all), `parallel` (draw
 *           the chevrons — default: when the chain holds)
 *   tested  the three values the case was TESTED through, when they are not the ratios from the vertex
 *           (`figure.js › gauge`): `{ values, to?, names? }` — the gauge draws them, so it agrees with `held`
 * Every length is exact text: 50,1 is never taken for 351/7; a root is written « 8√2785 » (`surd.js`).
 */
import { chain, gauge, ratios, withPieces } from './figure';
import { lenWrite as write } from './surd';

/** A case of this world. Lengths are written once (« 14.0 » becomes « 14 »). */
export function thalesCase({ kind = 'nested', names, len, ...extra }) {
  const L = {};
  for (const [k, v] of Object.entries(len)) L[k] = v == null ? null : write(v);
  const fig = withPieces({ kind, names: { V: 'A', M: 'M', B: 'B', N: 'N', C: 'C', ...names }, len: L });
  return { ...extra, ...fig, held: 'held' in extra ? extra.held : chain(fig) };
}

/** The identity of a case: its kind, its letters and its lengths. */
export const caseId = (c) =>
  c.id ??
  `${c.kind}|${Object.values(c.names).join('')}|${['VM', 'VB', 'VN', 'VC', 'MN', 'BC'].map((k) => c.len[k] ?? '?').join(':')}`;

/** What the world shows of a case: the three ratios (exact text) and whether the gauge's marks stand on one line. */
export const runCase = (c) => ({ ratios: ratios(c), aligned: gauge(c).aligned });

/** A length ACROSS the vertex of a butterfly is named by its two ends (`figure.js › withPieces`). */
const ACROSS = { VMB: 'MB', VNC: 'NC' };

/**
 * The segment of `len` named with the case's letters: « VM » → « AM »; across the vertex « VMB » → « AE » (its two
 * ends, the vertex between them) — for a sentence or a card.
 */
export const segName = (c, key) =>
  (ACROSS[key] ?? key)
    .split('')
    .map((ch) => c.names[ch] ?? ch)
    .join('');

/** The wording the world gives the forges by default (its words: `strings.js`). */
export { THALES_TEXT } from './strings';
