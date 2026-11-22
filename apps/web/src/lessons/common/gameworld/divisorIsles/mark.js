/**
 * A BRIDGE WITH A MARKED STRETCH (owner + council, 2026-11-19 — the world piece of the fractions lessons on the islands).
 *
 * The gap is the WHOLE (`a` cells); a stretch of it, from the island he leaves, is MARKED (`mark` cells — lit, a lantern
 * post standing where it ends). The bridge is then a FRACTION: the marked stretch over the whole bridge, `mark / a`, and
 * a sign writes it. He builds with ONE kind of plank, and the post must stand on a JOINT between two planks: so a plank
 * of `b` holds only when it fills the gap (`b` divides `a`) AND a joint falls on the mark (`b` divides `mark`). The sign
 * then counts in PLANKS — `mark / b` of `a / b` — the stretch has not moved, only its writing: an equal fraction.
 *
 * A segment declares `mark: 66` (and, for a stretch marked in two strokes, `strokes: [5, 8]`, whose sum is the mark).
 * Pure logic, no three.js: `Game.js` draws it, this file says what is true.
 */

/** What planks of `b` do on a gap of `a` cells whose first `mark` cells are marked. */
export function markVerdict(a, mark, b) {
  const q = Math.floor(a / b);
  const r = a - b * q;
  const mq = Math.floor(mark / b);
  const mr = mark - b * mq;
  return {
    q,
    r,
    fills: r === 0,
    /** the planks that lie whole inside the marked stretch, and the cells of the next plank the mark cuts off */
    mark: { m: mark, q: mq, r: mr },
    joint: mr === 0,
    holds: r === 0 && mr === 0,
  };
}

/**
 * The sign of the bridge: the fraction as first written (in cells), then once per plank that held, in the order he
 * built — `[[66, 78], [33, 39], [11, 13]]`. A plank that held twice is written once; planks that do not hold are skipped.
 */
export function signChain(a, mark, planks = []) {
  const chain = [[mark, a]];
  for (const b of planks) {
    if (!markVerdict(a, mark, b).holds) continue;
    const pair = [mark / b, a / b];
    if (!chain.some(([n, d]) => n === pair[0] && d === pair[1])) chain.push(pair);
  }
  return chain;
}

/** `\frac{66}{78} = \frac{33}{39}`; a stretch in two strokes opens on its sum: `\frac{5}{39} + \frac{8}{39} = \frac{13}{39}`. */
export function signTex(chain, strokes = null) {
  const [, whole] = chain[0];
  const head = strokes?.length > 1 ? [strokes.map((s) => `\\frac{${s}}{${whole}}`).join(' + ')] : [];
  return [...head, ...chain.map(([n, d]) => `\\frac{${n}}{${d}}`)].join(' = ');
}
