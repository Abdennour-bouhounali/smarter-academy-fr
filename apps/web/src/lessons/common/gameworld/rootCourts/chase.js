/**
 * THE INVESTIGATION `chase` — PURE logic (screen: `InquiryChase.jsx`; contract: GAME_WORLD.md « Explore », spec shape of
 * `chase`). Its rule is of the nature of a PURSUIT THAT NEVER CLOSES: the court of area `a` (a whole number) is in front
 * of him, and a list of fractions p/q, better and better, is tried on it one after the other. For each rod p/q he says
 * BEFORE what its platform will do — a band, a jam, or it rides; the world lowers it and answers with FACTS written on
 * ONE common denominator, so that the eye compares two WHOLE numbers: the platform holds p × p small tiles of side 1/q,
 * the court a × q × q of them (7/5 on 2: 49 against 50 — one small tile missing, a band). The gap is drawn, and a
 * magnifier opens on the court's far corner when it is too thin to see. Last, ONE question asks what he observed: in how
 * many of these did the platform ride (none / one / all)? — still a fact, never the rule.
 *
 *   spec = { kind: 'chase', a: '2', fracs: ['3/2', '7/5', '17/12', '41/29', '99/70'], text }
 *
 * The kind checks nothing about how the fractions were found; it checks that each is p/q with whole p ≥ 1 and q ≥ 2,
 * that the screen holds them (`CHASE_LAYOUT.maxFracs`) and that every whole number it writes fits its column
 * (`CHASE_LAYOUT.maxDigits`). Every number is exact (BigInt): 9801 against 9800 is never a float's guess.
 * The screen is a pure view of this file's reducer: the whole experiment is played and tested without a browser.
 */
import { compare, read, write } from './logic';

/**
 * THE LAYOUT of the screen at 1366 × 768 (the ONE size), in rem of the forge's frame (`.rf-fit`, designed 1280 × 720 and
 * zoomed 1.067: 1rem ≈ 17 px). Inside the experiment's panel: 1205 × 587 px of the frame (measured for `calc`, the same
 * panel). Columns, left to right (`columns`): the main column (the court and the card of numbers, then the question, its
 * buttons and the fact), then the table. `inquiryChase.render.test.jsx` adds the widths and the heights and checks that every text he
 * reads is ≥ 18 px on screen; the CSS reads the sizes from the custom properties the screen sets.
 */
export const CHASE_LAYOUT = {
  zoom: 1.067,
  panel: { w: 1205, h: 587 }, // px of the frame inside `.rq-iq`
  /** the table holds at most this many rows (one per fraction): the longest content, tested */
  maxFracs: 6,
  /** the longest whole number written (p, q, p × p, a × q × q, the gap), in digits */
  maxDigits: 8,
  /** the largest court the drawing lays tile by tile (blocks of 10 × 10 past 20 tiles a side) */
  maxArea: 400,
  /** the columns, left to right: the first one is on the LEFT (the screen's DOM order, pinned by the render test) */
  columns: ['main', 'table'],
  gap: 1, // rem between two columns
  rowGap: 0.55, // rem between two rows (`.rq-iq` gap)
  head: 3.52, // rem: the lead (1.2rem × 1.5) and the goal (1.08rem × 1.45), one line each
  /** the court's drawing: its viewBox, drawn `h` rem high; its one text (the lens's factor) is `font` units */
  court: { h: 14, view: { w: 320, h: 240 }, font: 26 },
  /**
   * the card of numbers beside the court, at `font` rem: the rod's fraction (`rod` rem), the key of a small tile, the two
   * lines « name  formula  unit » (`line` em each), the relation (`rel` rem). `em` = the widest formula, in em of
   * KaTeX's own size (× 1.21): a digit 0.5, « × » 1.22, « = » 1.33 with their spaces (`lineEm`). `name` and `unit` = the
   * longest label and unit word the lesson may give, in characters (French: « Plateforme » 10, « carreaux » 8).
   */
  card: { font: 1.08, rod: 1.7, line: 1.6, rel: 1.3, em: 10.8, name: 10, unit: 10 },
  /** the column of the question, its buttons and the fact (rem of its font) */
  talk: { ask: 1.12, buttons: 3.3, fact: 1.12 },
  /**
   * the table: its width and its four cells (rem), its font, a row (a stacked fraction), the header (two lines), and the
   * longest word of a chip (« band » / « jam » / « rides ») in characters
   */
  table: { w: 27.2, font: 1.08, rod: 4.4, num: 6.2, fact: 10.4, row: 2.95, header: 3.4, word: 5 },
};

/**
 * The width of the card's two formulas, in em of KaTeX: « p × p = P » and « a × q × q = C » (a digit 0.5 em, « × » 1.22,
 * « = » 1.33 with the spaces around them). The wider one must stay within `CHASE_LAYOUT.card.em`.
 */
export function lineEm(o) {
  const digits = (...xs) => xs.reduce((t, x) => t + String(x).length, 0);
  return Math.max(
    digits(o.p, o.p, o.platform) * 0.5 + 1.22 + 1.33,
    digits(o.a, o.q, o.q, o.court) * 0.5 + 2 * 1.22 + 1.33,
  );
}

/** The three things a platform can do — what he predicts, and what the world does. */
export const KINDS = ['band', 'jam', 'ride'];

/** Reads a rod of the spec, « p/q »: whole p ≥ 1, whole q ≥ 2 — kept AS GIVEN (6/4 measures with small tiles of 1/4). */
export function fracOf(t) {
  const m = /^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(String(t));
  if (!m) throw new Error(`chase: « ${t} » is not a fraction p/q`);
  const [p, q] = [BigInt(m[1]), BigInt(m[2])];
  if (p < 1n || q < 2n) throw new Error(`chase: « ${t} » — p must be ≥ 1 and q ≥ 2`);
  return { p: String(p), q: String(q) };
}

/** The court's area: a whole number ≥ 1, as text. */
function areaOf(a) {
  if (!/^\s*\d+\s*$/.test(String(a)) || BigInt(String(a).trim()) < 1n)
    throw new Error(`chase: the court « ${a} » is not a whole number of tiles`);
  return String(BigInt(String(a).trim()));
}

/**
 * What the world does with the rod p/q over the court of area a, on ONE denominator (small tiles of side 1/q):
 *   { p, q, a, kind, platform: p × p, court: a × q × q, gap: |court − platform| (small tiles), covers, diff (tiles) }
 * — every number as text. `covers` and `diff` are the same facts in whole tiles (`logic.js › write`).
 */
export function chaseFact(a, frac) {
  const A = BigInt(areaOf(a));
  const { p, q } = fracOf(frac);
  const [P, Q] = [BigInt(p), BigInt(q)];
  const platform = P * P;
  const court = A * Q * Q;
  const kind = platform === court ? 'ride' : platform < court ? 'band' : 'jam';
  const gap = platform < court ? court - platform : platform - court;
  return {
    p,
    q,
    a: String(A),
    kind,
    platform: String(platform),
    court: String(court),
    gap: String(gap),
    covers: write(`${platform}/${Q * Q}`),
    diff: write(`${gap}/${Q * Q}`),
  };
}

/**
 * The rod p/q as the world's other screens and forges read it (`logic.js` reads « p/q »): `{ q: '7/5' }`, reduced, and
 * KEPT as a fraction — never rewritten as a decimal (3/2 stays « 3/2 », so a forge draws it over its bar).
 */
export const rodOfFrac = (frac) => {
  const { p, q } = fracOf(frac);
  const r = read(`${p}/${q}`);
  return { q: r.d === 1n ? String(r.n) : `${r.n}/${r.d}` };
};

/**
 * THE MAGNIFIER: the power of ten that makes the gap at the court's far corner seen, for a drawing of `u` units a tile.
 * The thickness of the band (or of what sticks out) is |√a − p/q| = (gap / q²) / (√a + p/q) — from the EXACT gap, no
 * cancellation of two close floats. 0 when the gap is seen without a lens (≥ 4 units) or when it rides; else the
 * smallest k for which it is ≥ 8 units under the lens.
 */
export function lensPower(fact, u) {
  if (fact.kind === 'ride') return 0;
  const p = Number(fact.p);
  const q = Number(fact.q);
  const t = (Number(fact.gap) / (q * q) / (Math.sqrt(Number(fact.a)) + p / q)) * u;
  if (t >= 4) return 0;
  let k = 1;
  while (t * 10 ** k < 8 && k < 20) k += 1;
  return k;
}

// ───────────────────────── the state machine of the screen ─────────────────────────
// say → build → seen → say (next fraction) … → seen (the last) → count → counted → done

function check(spec) {
  const a = areaOf(spec.a);
  if (Number(a) > CHASE_LAYOUT.maxArea)
    throw new Error(`chase: a court of ${CHASE_LAYOUT.maxArea} tiles at most, not ${a}`);
  if (!Array.isArray(spec.fracs) || !spec.fracs.length) throw new Error('chase: the spec holds no fraction');
  const { maxFracs, maxDigits } = CHASE_LAYOUT;
  if (spec.fracs.length > maxFracs)
    throw new Error(`chase: the table holds ${maxFracs} fractions at most, not ${spec.fracs.length}`);
  for (const f of spec.fracs) {
    const o = chaseFact(a, f);
    for (const x of [o.platform, o.court, o.gap, o.p, o.q])
      if (x.length > maxDigits)
        throw new Error(`chase: « ${x} » (${f} on ${a}) is longer than the table's ${maxDigits} digits`);
    if (lineEm(o) > CHASE_LAYOUT.card.em)
      throw new Error(`chase: the formulas of ${f} on ${a} are wider than the card (${CHASE_LAYOUT.card.em} em)`);
  }
  return a;
}

export function initChase(spec) {
  check(spec);
  return { i: 0, stage: 'say', predicted: null, rows: [], count: null, done: false };
}

/** The row of the fraction under way, once lowered (null before). */
export const rowNow = (s) => (s.stage === 'seen' ? s.rows.at(-1) : null);

/** How many rods of the list rode — and what his tap « none / one / all » says, as a number. */
const ridesOf = (rows) => rows.filter((r) => r.kind === 'ride').length;
export const COUNTS = ['0', '1', 'all'];
const countValue = (v, n) => (v === 'all' ? n : Number(v));

/**
 * One move of the experiment.
 *   { type: 'say', v }    say: his prediction — 'band' | 'jam' | 'ride'
 *   { type: 'built' }     build: the world has lowered the platform
 *   { type: 'next' }      seen: the next fraction, or the closing question; counted: the end
 *   { type: 'count', v }  count: his tap — '0' | '1' | 'all'
 * A move that does not belong to the stage changes nothing.
 */
export function chaseReducer(spec, s, action) {
  switch (action.type) {
    case 'say': {
      if (s.stage !== 'say' || !KINDS.includes(action.v)) return s;
      return { ...s, stage: 'build', predicted: action.v };
    }
    case 'built': {
      if (s.stage !== 'build') return s;
      const f = spec.fracs[s.i];
      const o = chaseFact(spec.a, f);
      const row = {
        i: s.i,
        frac: `${o.p}/${o.q}`,
        a: o.a,
        s: rodOfFrac(f),
        kind: o.kind,
        p: o.p,
        q: o.q,
        platform: o.platform,
        court: o.court,
        gap: o.gap,
        covers: o.covers,
        diff: o.diff,
        predicted: s.predicted,
        right: s.predicted === o.kind,
      };
      return { ...s, rows: [...s.rows, row], stage: 'seen' };
    }
    case 'next': {
      if (s.stage === 'counted') return { ...s, done: true };
      if (s.stage !== 'seen') return s;
      if (s.i + 1 < spec.fracs.length) return { ...s, i: s.i + 1, predicted: null, stage: 'say' };
      return { ...s, predicted: null, stage: 'count' };
    }
    case 'count': {
      if (s.stage !== 'count' || !COUNTS.includes(action.v)) return s;
      const n = s.rows.length;
      const rides = ridesOf(s.rows);
      const said = countValue(action.v, n);
      return { ...s, stage: 'counted', count: { said, tapped: action.v, rides, n, right: said === rides } };
    }
    default:
      return s;
  }
}

/** What the investigation hands back to the forge (`forge.fromInquiry`). */
export const chaseResult = (s) => ({ rows: s.rows, count: s.count });

/** -1, 0 or 1: the platform against the court, in small tiles (the relation sign the card writes). */
export const relation = (row) => compare(row.platform, row.court);
