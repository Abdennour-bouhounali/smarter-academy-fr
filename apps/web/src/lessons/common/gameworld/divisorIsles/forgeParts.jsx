/**
 * How THIS world draws a case of a rule forge (kit/RuleForge.jsx › `parts`): a bridge — a gap of `a` cells, planks of `b`.
 * A case may carry a `text` (a sentence about the bridge): it is then written above the bridge and in its line.
 * In some forges the truth of a case (`held`) is not « the bridge holds » — a promise kept, a plank that had to be tried:
 * the case then says whether the bridge itself holds in `fits`, and what its line shows in `tag`.
 *
 * A case may instead be a SHARING (`deal`): two collections dealt into k identical lots — no bridge, no plank. It is
 * drawn with the pieces of the investigation `deal` (`dealParts.jsx`) and its line names no plank:
 *   c.deal = { a: { n, item }, b: { n, item }, k, lot, claim? }
 *     a, b   the two collections: how many, and the kind of item (a glyph of `dealParts.jsx › GLYPHS`: rose, lily…)
 *     k      the number of identical lots, `lot` their kind (vase, basket — `dealParts.jsx › LOTS`)
 *     claim  [x, y] when the case asks « does each lot hold x and y? »: drawn, faint, in the empty lots before the deal
 * Whether everything is shared is `fits` (or `held`), as for a bridge: the held / fell look follows it.
 *
 * A case may be a PAIR of gaps (`pair`): ONE plank asked of TWO gaps (« does the plank 5 build both bridges, 16 and
 * 19? »). It is drawn as two bridges, one above the other, the same plank laid on each:
 *   c.pair = { a, b, d, need? }
 *     a, b   the two gaps (cells), the first drawn on top
 *     d      the plank (cells), laid on both
 *     need   the planks the two bridges take together, when the case counts them (written in its line)
 * Each bridge has its own held / fell look (does d fill IT?), what is left of each in amber. Whether the case holds is
 * still `held` (what the case asks); `fits` says whether the plank fills both.
 *
 * A case drawn as a bridge that is NOT about a plank (a pair of numbers and their notebooks) carries `head`: its line
 * then names it in those words (« 1003 et 34 ») instead of « a planche de b » (defects.md A10). A PAIR may carry `head` too —
 * a fraction drawn as its whole bridge over its lit stretch (`pair` = { a: the whole, b: the lit cells, d: the plank }):
 * its line then reads « 66/78 → 33/39 » (an isolated LTR run), not « 78 et 66 planche de 6 ».
 *
 * A case may be a FACTOR LADDER (`factor`): a number and the planks laid on it one after the other, each holding on what
 * the ones before left (the investigation `ladder · factor`, `InquiryFactor.jsx`). No single bridge: the mirror draws the
 * number, then the planks laid in a row — as planks, each with its length, nothing between them: no product, no power, no
 * name —, then where they took it (1, or what is left in amber), and the plank that fell there when the case has one:
 *   c.factor = { n, planks: [2, 2, 2, 3, 3], fell? }
 *     n       the number (the gap's cells)
 *     planks  the planks laid, in his order (each divides what is left — factorLadder.js › factorRungs refuses otherwise)
 *     fell    a plank tried on what is left that did NOT hold (drawn falling, amber); absent when none
 * Its line names the number and the planks (« 72 » then the planks as small planks) and where they took it, never
 * « a planche b ». Whether the case holds is `held` (what the forge asks of it), its look `fits` or `held`.
 *
 * A case about CREWS (2026-11-26, lesson 4): a pillar on a two-crew walkway (`c.walk = { crews, d }`), a story claim
 * (`c.story` with `a`, `b`, `kind`, `v`, `who?`) or teams on their days (`c.days = { cycles, day }`) — drawn by
 * `forgeCrews.jsx` with the walkway's lanes and the days' rows (`crewLanes.jsx`); its line is its sentence.
 */
import { formatFr } from '@smarter-academy/core';
import Inquiry from './Inquiry';
import { dealOf } from './deal';
import { factorRungs } from './factorLadder';
import { Glyph, GlyphDefs, LOTS, Lot, LotShape, Pile, grid } from './dealParts';
import { FORGE_TEXT as L } from './strings';
import { CrewsMirror, CrewsMini, crewsBeats, isCrewCase } from './forgeCrews';
import './forgeParts.css';

/** Does the BRIDGE of the case hold? (its own `fits`, or the truth of the case when they are the same thing) */
const fitsOf = (c) => c.fits ?? c.held;

/** The bridge in the mirror: `a` cells, planks of `b`, what is left in amber. `stage`: ask (the gap and one plank) | build | done. */
function Mirror({ c, stage, fast, tight = false }) {
  if (isCrewCase(c)) return <CrewsMirror c={c} stage={stage} tight={tight} />;
  if (c.deal) return <DealMirror c={c} stage={stage} fast={fast} tight={tight} />;
  if (c.pair) return <PairMirror c={c} stage={stage} fast={fast} tight={tight} />;
  if (c.factor) return <FactorMirror c={c} stage={stage} fast={fast} tight={tight} />;
  const W = 720;
  const cell = Math.min(34, W / Math.max(c.a, c.b));
  const x0 = (W - cell * c.a) / 2;
  const built = stage !== 'ask';
  const done = stage === 'done';
  // the plank shown before the build stands over the gap's first cells; one that is longer than the gap is centred
  const sampleX = c.b > c.a ? (W - cell * c.b) / 2 : x0;
  const sample = !built || c.b > c.a;
  // tight (the mirror shares the screen with the tiles): a built bridge with no plank shown above it leaves out the empty
  // band on top — same scale, less height; the planks still drop in from above it (the svg does not clip)
  const top = tight && !sample ? 48 : 0;
  // a SENTENCE is asked alone: showing its bridge before he answers would tell him how to read it
  if (c.text && stage === 'ask')
    return (
      <>
        <p className="rf-sentence rf-sentence--alone" data-rf-sentence>
          « {c.text} »
        </p>
        <p className="rf-sentence__hint">{L.which}</p>
      </>
    );
  return (
    <>
      {c.text && (
        <p className="rf-sentence" data-rf-sentence>
          « {c.text} »
        </p>
      )}
      <svg
        viewBox={`0 ${top} ${W} ${150 - top}`}
        className={`rf-bridge is-${stage} ${done ? (fitsOf(c) ? 'is-held' : 'is-fell') : ''} ${c.text ? 'has-sentence' : ''} ${tight ? 'is-tight' : ''}`}
        data-rf-bridge={`${c.a}:${c.b}`}
        data-rf-stage={stage}
      >
        <rect x={x0 - 26} y="74" width="26" height="46" rx="6" className="rf-bank" />
        <rect x={x0 + cell * c.a} y="74" width="26" height="46" rx="6" className="rf-bank" />
        {Array.from({ length: c.a }, (_, i) => (
          <rect
            key={i}
            x={x0 + i * cell + 1}
            y="80"
            width={Math.max(1, cell - 2)}
            height="22"
            rx="3"
            className={`rf-cell ${built && i >= c.q * c.b ? 'is-left' : ''}`}
          />
        ))}
        {sample && (
          <g>
            <rect x={sampleX} y="30" width={cell * c.b - 2} height="24" rx="6" className="rf-plank rf-plank--sample" />
            <text x={sampleX + (cell * c.b) / 2} y="22" textAnchor="middle" className="rf-cap">
              {L.plank(c.b)}
            </text>
          </g>
        )}
        {built &&
          Array.from({ length: c.q }, (_, k) => (
            <rect
              key={k}
              x={x0 + k * c.b * cell + 1.5}
              y="78"
              width={cell * c.b - 3}
              height="26"
              rx="6"
              className={`rf-plank ${k % 2 ? 'is-alt' : ''}`}
              style={{ animationDelay: `${k * (fast ? 8 : 110)}ms` }}
            />
          ))}
        <text x={W / 2} y="142" textAnchor="middle" className="rf-cap rf-cap--a">
          {L.cells(c.a)}
        </text>
      </svg>
    </>
  );
}

const Mini = ({ c }) => {
  if (isCrewCase(c)) return <CrewsMini c={c} />;
  if (c.deal) return <DealMini c={c} />;
  if (c.factor) return <FactorMini c={c} />;
  if (c.pair) return <PairMini pair={c.pair} />;
  const W = 150;
  const cell = W / Math.max(c.a, 1);
  return (
    <svg viewBox={`0 0 ${W} 14`} className="rf-mini" aria-hidden="true">
      {Array.from({ length: c.q }, (_, k) => (
        <rect
          key={k}
          x={k * c.b * cell + 0.5}
          y="1"
          width={Math.max(1, cell * c.b - 1)}
          height="12"
          rx="2.5"
          className={fitsOf(c) ? 'is-held' : ''}
        />
      ))}
      {c.r > 0 && (
        <rect
          x={c.q * c.b * cell + 0.5}
          y="1"
          width={Math.max(1, cell * c.r - 1)}
          height="12"
          rx="2.5"
          className="is-left"
        />
      )}
    </svg>
  );
};

// ───────────────────────────── a case that is a PAIR of gaps (`c.pair`) ─────────────────────────────
// Two bridges in a 720 × 150 scene (the single bridge's width: the same box in the mirror, also `tight`): the plank
// and its name on top, then gap a, then gap b, each with its banks, both drawn at ONE scale and from the same left edge
// (the shorter gap is the shorter bridge), its number of cells on the right. The plank is laid on both at once.
const PW = 720;
const PH = 150;
const P_X0 = 40; // the left edge of both gaps (after the left bank)
const P_ROOM = 548; // the longest gap (or the plank) takes this width; its right bank and the labels come after
const P_LABEL = 662; // the centre of the labels « 16 cases »
const P_ROWS = [58, 110]; // the top of each bridge
const P_TIGHT = 50; // tight: the band of the plank is left out once the planks are laid
/** One gap of a pair: n cells, the plank d laid on it, what is left in amber. */
const pairRow = (n, d) => {
  const q = d <= n ? Math.floor(n / d) : 0;
  return { n, q, r: n - q * d, fills: n % d === 0 };
};
/**
 * Past a few hundred cells a pair is drawn at scale as BARS, never one rect per cell or per plank (a pair of 52 015 and
 * 31 209 cells with a plank of 2 would be 130 000 rects and 26 000 strokes): the cells are drawn one by one while a cell
 * is 2 units wide or more, the planks one by one while a plank is 3 units wide or more; else the cells are one bar (the
 * filled part, then what is left in amber) and the planks laid are ONE strip (`data-rf-strip`) of their whole length.
 */
const P_CELL_MIN = 2;
const P_PLANK_MIN = 3;
const pairScale = (a, b, d) => {
  const cell = Math.min(34, P_ROOM / Math.max(a, b, d));
  return { cell, cells: cell >= P_CELL_MIN, planks: cell * d >= P_PLANK_MIN };
};

/** The strokes of a pair's build: one per plank laid on the longer row, ONE when the planks are drawn as a strip. */
const pairBeats = ({ a, b, d }) => {
  const q = Math.max(pairRow(a, d).q, pairRow(b, d).q);
  return pairScale(a, b, d).planks ? q : Math.min(q, 1);
};

function PairMirror({ c, stage, fast, tight }) {
  const { a, b, d } = c.pair;
  const built = stage !== 'ask';
  const done = stage === 'done';
  const rows = [pairRow(a, d), pairRow(b, d)];
  const { cell, cells, planks } = pairScale(a, b, d);
  // the plank and its name stay above the bridges until it is laid — or when it is longer than one of the gaps
  const sample = !built || d > Math.min(a, b);
  const top = tight && !sample ? P_TIGHT : 0;
  return (
    <svg
      viewBox={`0 ${top} ${PW} ${PH - top}`}
      className={`rf-bridge rf-pair is-${stage} ${tight ? 'is-tight' : ''}`}
      data-rf-pair={`${a}:${b}:${d}`}
      data-rf-stage={stage}
      role="img"
      aria-label={`${a} · ${b} · ${d}`}
    >
      {sample && (
        <g>
          <text x={P_X0 + (cell * d) / 2} y="20" textAnchor="middle" className="rf-cap">
            {L.plank(d)}
          </text>
          <rect x={P_X0} y="28" width={cell * d - 2} height="20" rx="6" className="rf-plank rf-plank--sample" />
        </g>
      )}
      {rows.map((row, j) => {
        const y = P_ROWS[j];
        const look = done ? (row.fills ? 'is-held' : 'is-fell') : '';
        return (
          <g key={j} className={`rf-pairrow ${look}`} data-rf-pair-row={row.n} data-rf-fills={row.fills ? '1' : '0'}>
            <rect x={P_X0 - 26} y={y} width="26" height="32" rx="6" className="rf-bank" />
            <rect x={P_X0 + cell * row.n} y={y} width="26" height="32" rx="6" className="rf-bank" />
            {cells
              ? Array.from({ length: row.n }, (_, i) => (
                  <rect
                    key={i}
                    x={P_X0 + i * cell + 1}
                    y={y + 6}
                    width={Math.max(1, cell - 2)}
                    height="20"
                    rx="3"
                    className={`rf-cell ${built && i >= row.q * d ? 'is-left' : ''}`}
                  />
                ))
              : [
                  [0, built ? row.q * d : row.n, ''],
                  [row.q * d, built ? row.r : 0, 'is-left'],
                ]
                  .filter(([, n]) => n > 0)
                  .map(([from, n, look]) => (
                    <rect
                      key={look || 'cells'}
                      x={P_X0 + from * cell + 1}
                      y={y + 6}
                      width={Math.max(1, n * cell - 2)}
                      height="20"
                      rx="3"
                      className={`rf-cell ${look}`}
                      data-rf-cells={n}
                    />
                  ))}
            {built && !planks && row.q > 0 && (
              <rect
                x={P_X0 + 1.5}
                y={y + 4}
                width={Math.max(1, cell * d * row.q - 3)}
                height="24"
                rx="6"
                className="rf-plank rf-plank--strip"
                data-rf-strip={row.q}
              />
            )}
            {built &&
              planks &&
              Array.from({ length: row.q }, (_, k) => (
                <rect
                  key={k}
                  x={P_X0 + k * d * cell + 1.5}
                  y={y + 4}
                  width={cell * d - 3}
                  height="24"
                  rx="6"
                  className={`rf-plank ${k % 2 ? 'is-alt' : ''}`}
                  style={{ animationDelay: `${k * (fast ? 8 : 110)}ms` }}
                />
              ))}
            <text x={P_LABEL} y={y + 23} textAnchor="middle" className="rf-cap rf-cap--a">
              {L.cells(row.n)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** The mini of a pair: two bars, gap a above gap b, at one scale — the planks laid, what is left in amber. */
const PairMini = ({ pair }) => {
  const W = 150;
  const cell = W / Math.max(pair.a, pair.b, 1);
  return (
    <svg viewBox={`0 0 ${W} 14`} className="rf-mini rf-mini--pair" aria-hidden="true">
      {[pair.a, pair.b].map((n, j) => {
        const row = pairRow(n, pair.d);
        const y = j ? 7.5 : 0.5;
        return (
          <g key={j}>
            {(cell * pair.d >= 1.5 ? Array.from({ length: row.q }, (_, k) => k) : row.q ? ['strip'] : []).map((k) => (
              <rect
                key={k}
                x={k === 'strip' ? 0.25 : k * pair.d * cell + 0.25}
                y={y}
                width={Math.max(0.6, cell * pair.d * (k === 'strip' ? row.q : 1) - 0.5)}
                height="6"
                rx="1.5"
                className={row.fills ? 'is-held' : ''}
              />
            ))}
            {row.r > 0 && (
              <rect
                x={row.q * pair.d * cell + 0.25}
                y={y}
                width={Math.max(0.6, cell * row.r - 0.5)}
                height="6"
                rx="1.5"
                className="is-left"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};

/** The head of a pair's line: its two gaps, then the plank. */
const PairHead = ({ pair }) => (
  <span className="rf-pairhead">
    <strong dir="ltr">{formatFr(pair.a)}</strong>
    {` ${L.and} `}
    <strong dir="ltr">{formatFr(pair.b)}</strong>
  </span>
);

// ───────────────────────────── a case that is a FACTOR LADDER (`c.factor`) ─────────────────────────────
// In a 720 × 150 scene (the single bridge's box, also `tight`): the number on the left, then the planks laid in a row,
// then where they took it — a green « 1 », or what is left in amber with the plank that fell on it. The planks share the
// room between the number and the end; eight planks or fewer keep their length written at 26 units.
const FW = 720;
const F_ROW = 46; // the top of the planks
const F_H = 52;
const F_X0 = 118; // after the number
const F_ROOM = 470; // the planks and the plank that fell share this width
const F_END = 640; // the centre of the end box
/** What a factor case draws: its rungs, what is left, the plank that fell (only when it does not hold there). */
function factorOf(f) {
  const { rungs, left } = factorRungs(f.n, f.planks);
  const fell = f.fell != null && left >= 2 && left % f.fell !== 0 ? f.fell : null;
  if (f.fell != null && fell == null)
    throw new RangeError(`factor: ${f.fell} holds on ${left} (in the ladder of ${f.n})`);
  return { rungs, left, fell };
}

function FactorMirror({ c, stage, fast, tight }) {
  const { n, planks } = c.factor;
  const { left, fell } = factorOf(c.factor);
  const built = stage !== 'ask';
  const done = stage === 'done';
  const slots = planks.length + (fell ? 1 : 0);
  const w = Math.min(96, (F_ROOM - (slots - 1) * 6) / Math.max(1, slots));
  const beat = fast ? 8 : 160;
  const top = tight ? 24 : 0;
  const look = done ? (fitsOf(c) ? 'is-held' : 'is-fell') : '';
  return (
    <svg
      viewBox={`0 ${top} ${FW} ${150 - top * 2}`}
      className={`rf-bridge rf-factor is-${stage} ${look} ${tight ? 'is-tight' : ''}`}
      data-rf-factor={`${n}:${planks.join('.')}${fell ? `:${fell}` : ''}`}
      data-rf-stage={stage}
      role="img"
      aria-label={`${n} : ${planks.join(' · ')}${fell ? ` · ${fell}` : ''} → ${left}`}
    >
      <text x="62" y={F_ROW + 36} textAnchor="middle" className="rf-cap rf-cap--a rf-factor__n">
        {formatFr(n)}
      </text>
      {built &&
        planks.map((d, k) => (
          // eslint-disable-next-line react/no-array-index-key -- equal planks are legal: keyed by their place
          <g key={k} className="rf-factor__plank" data-rf-factor-plank={d}>
            <rect
              x={F_X0 + k * (w + 6)}
              y={F_ROW}
              width={w}
              height={F_H}
              rx="7"
              className={`rf-plank ${k % 2 ? 'is-alt' : ''}`}
              style={{ animationDelay: `${k * beat}ms` }}
            />
            <text
              x={F_X0 + k * (w + 6) + w / 2}
              y={F_ROW + 35}
              textAnchor="middle"
              className="rf-factor__num"
              style={{ animationDelay: `${k * beat}ms` }}
            >
              {d}
            </text>
          </g>
        ))}
      {built && fell && (
        <g
          className="rf-factor__fell"
          style={{ animationDelay: `${planks.length * beat}ms` }}
          data-rf-factor-fell={fell}
        >
          <rect
            x={F_X0 + planks.length * (w + 6)}
            y={F_ROW}
            width={w}
            height={F_H}
            rx="7"
            className="rf-plank"
            style={{ animationDelay: `${planks.length * beat}ms` }}
          />
          <text
            x={F_X0 + planks.length * (w + 6) + w / 2}
            y={F_ROW + 35}
            textAnchor="middle"
            className="rf-factor__num"
          >
            {fell}
          </text>
        </g>
      )}
      {done && (
        <g className={`rf-factor__end ${left === 1 ? 'is-one' : 'is-left'}`} data-rf-factor-left={left}>
          <rect x={F_END - 40} y={F_ROW} width="80" height={F_H} rx="10" />
          <text x={F_END} y={F_ROW + 36} textAnchor="middle">
            {left}
          </text>
        </g>
      )}
    </svg>
  );
}

/** The mini of a factor case: its planks side by side, an amber block when the ladder did not reach 1. */
const FactorMini = ({ c }) => {
  const { planks } = c.factor;
  const { left } = factorOf(c.factor);
  const W = 150;
  const room = left === 1 ? W : W - 22;
  const w = room / Math.max(1, planks.length);
  return (
    <svg viewBox={`0 0 ${W} 14`} className="rf-mini rf-mini--factor" aria-hidden="true">
      {planks.map((d, k) => (
        // eslint-disable-next-line react/no-array-index-key -- equal planks are legal: keyed by their place
        <rect
          key={k}
          x={k * w + 0.75}
          y="1"
          width={Math.max(1, w - 1.5)}
          height="12"
          rx="2.5"
          className={fitsOf(c) ? 'is-held' : ''}
        />
      ))}
      {left > 1 && <rect x={W - 18} y="3" width="18" height="8" rx="3" className="is-left" />}
    </svg>
  );
};

/** The head of a factor case's line: the number, then its planks as small planks (no sign between them). */
const FactorHead = ({ factor }) => (
  <span className="rf-factorhead" dir="ltr" data-rf-factor-head={`${factor.n}:${factor.planks.join('.')}`}>
    {/* « 2 431 »: French writes the thousands apart (FRENCH_LANGUAGE_CONTRACT.md §5) */}
    <strong>{formatFr(factor.n)}</strong>
    <span className="rf-factorhead__planks">
      {factor.planks.map((d, k) => (
        // eslint-disable-next-line react/no-array-index-key -- equal planks are legal: keyed by their place
        <b key={k}>{d}</b>
      ))}
    </span>
  </span>
);
/** Where a factor case's planks took its number — and the plank that fell there. */
const factorTag = (f) => {
  const { left, fell } = factorOf(f);
  return fell ? `${L.factorEnd(left)}\u00a0: ${L.factorFell(fell)}` : L.factorEnd(left);
};

// ───────────────────────────── a case that is a SHARING (`c.deal`) ─────────────────────────────
// The mirror draws it in a 1000 × 230 scene (the bridge's own proportions: the same box in the mirror, also `tight`):
// the table on top — the two piles, their counts, and between them the kind of lot with its number — and the k lots
// under it. Up to 60 items a pile and 12 lots stay legible (a pile of 60 is three rows of twenty).
const DW = 1000;
const DH = 230;
const LOT_Y = 114;
const LOT_H = 112;
const LOT_GAP = 8;
/** The boxes of k lots, centred, never wider than 240 (two lots would otherwise be two squat vases). */
const lotBoxes = (k) => {
  const w = Math.min(240, (DW - 24 - (k - 1) * LOT_GAP) / k);
  const x0 = (DW - (k * w + (k - 1) * LOT_GAP)) / 2;
  return Array.from({ length: k }, (_, i) => [x0 + i * (w + LOT_GAP), LOT_Y, w, LOT_H]);
};
/** A claim is drawn inside each empty lot when its items stay recognisable there; else once, over the lots. */
const claimFits = (lot, box, n) => {
  const [, , iw, ih] = LOTS[lot](...box).inner;
  return grid(n, 0, 0, iw, ih, 22).p >= 9;
};

/** The claim « each lot holds x and y », drawn once over the empty lots: a lot, then x items and y items (no word). */
function ClaimTag({ lot, claim, a, b }) {
  const digits = (n) => String(n).length * 17;
  const parts = [
    { w: 34, el: (x) => <LotShape kind={lot} box={[x, 150, 34, 38]} /> },
    {
      w: 26,
      el: (x) => (
        <text x={x + 13} y="180">
          =
        </text>
      ),
    },
    {
      w: digits(claim[0]) + 6,
      el: (x) => (
        <text x={x + (digits(claim[0]) + 6) / 2} y="180">
          {claim[0]}
        </text>
      ),
    },
    { w: 30, el: (x) => <use href={`#rfd-${a}`} x={x} y="152" width="30" height="30" /> },
    {
      w: 26,
      el: (x) => (
        <text x={x + 13} y="180">
          +
        </text>
      ),
    },
    {
      w: digits(claim[1]) + 6,
      el: (x) => (
        <text x={x + (digits(claim[1]) + 6) / 2} y="180">
          {claim[1]}
        </text>
      ),
    },
    { w: 30, el: (x) => <use href={`#rfd-${b}`} x={x} y="152" width="30" height="30" /> },
  ];
  const gap = 8;
  const width = parts.reduce((t, p) => t + p.w, 0) + gap * (parts.length - 1);
  let x = (DW - width) / 2;
  return (
    <g className="rf-deal__claim" data-rf-claim={claim.join(',')}>
      <rect x={x - 18} y="144" width={width + 36} height="50" rx="14" />
      {parts.map((p, i) => {
        const el = <g key={i}>{p.el(x)}</g>;
        x += p.w + gap;
        return el;
      })}
    </g>
  );
}

/**
 * The sharing in the mirror. `ask`: the two collections on the table and the k empty lots (a claim drawn faint in them);
 * `build`: the world deals, round by round (one item of each kind per lot and per round); `done`: what could not be
 * dealt stays on the table, set apart in amber — the lots glow when nothing is left.
 */
function DealMirror({ c, stage, fast, tight }) {
  const { a, b, k, lot, claim } = c.deal;
  const d = dealOf(a.n, b.n, k);
  const built = stage !== 'ask';
  const done = stage === 'done';
  const boxes = lotBoxes(k);
  const ghost = !built && claim && claimFits(lot, boxes[0], claim[0] + claim[1]);
  const beat = fast ? 8 : 110;
  const look = done ? (fitsOf(c) ? 'is-held' : 'is-fell') : '';
  return (
    <svg
      viewBox={`0 0 ${DW} ${DH}`}
      className={`rf-deal is-${stage} ${look} ${tight ? 'is-tight' : ''}`}
      data-rf-deal={`${a.n}:${b.n}:${k}`}
      data-rf-stage={stage}
      role="img"
      aria-label={`${a.n} · ${b.n} → ${k}`}
    >
      <GlyphDefs ns="rfd" />
      <rect className="iqd-table" x="8" y="2" width="984" height="104" rx="14" />
      <Pile
        ns="rfd"
        tag="a"
        kind={a.item}
        n0={a.n}
        rem={built ? d.rA : a.n}
        box={[15, 6, 440, 96]}
        left={done && d.rA > 0}
      />
      <Pile
        ns="rfd"
        tag="b"
        kind={b.item}
        n0={b.n}
        rem={built ? d.rB : b.n}
        box={[545, 6, 440, 96]}
        left={done && d.rB > 0}
      />
      <LotShape kind={lot} box={[478, 12, 44, 50]} />
      <text className="rf-deal__k" x="500" y="96" data-rf-deal-k>
        {k}
      </text>
      {boxes.map((box, i) => (
        <Lot
          key={`${k}-${i}-${built}`}
          ns="rfd"
          i={i}
          kind={lot}
          box={box}
          itemA={a.item}
          itemB={b.item}
          cA={built ? d.qA : ghost ? claim[0] : 0}
          cB={built ? d.qB : ghost ? claim[1] : 0}
          full={built ? Math.max(1, d.qA + d.qB) : ghost ? claim[0] + claim[1] : 1}
          cls={built ? 'is-in' : 'is-ghost'}
          delay={built ? (j) => `${j * beat}ms` : undefined}
        />
      ))}
      {!built && claim && !ghost && <ClaimTag lot={lot} claim={claim} a={a.item} b={b.item} />}
    </svg>
  );
}

/** The head of a sharing's line: the two counts with their items (the number of lots is in its tag). */
const DealHead = ({ deal }) => (
  <span className="rf-dealhead" dir="ltr">
    <strong>{formatFr(deal.a.n)}</strong>
    <Glyph kind={deal.a.item} />
    <strong>{formatFr(deal.b.n)}</strong>
    <Glyph kind={deal.b.item} />
  </span>
);

/** The mini of a sharing: its k lots side by side, and an amber block when something stays on the table. */
const DealMini = ({ c }) => {
  const { a, b, k } = c.deal;
  const d = dealOf(a.n, b.n, k);
  const W = 150;
  const room = d.ok ? W : W - 22;
  const w = room / k;
  return (
    <svg viewBox={`0 0 ${W} 14`} className="rf-mini rf-mini--deal" aria-hidden="true">
      {Array.from({ length: k }, (_, i) => (
        <rect
          key={i}
          x={i * w + 0.75}
          y="2"
          width={Math.max(1, w - 1.5)}
          height="11"
          rx="4"
          className={fitsOf(c) ? 'is-held' : ''}
        />
      ))}
      {!d.ok && <rect x={W - 18} y="4" width="18" height="8" rx="3" className="is-left" />}
    </svg>
  );
};

/** A bridge as one line of the evidence; `children` = what the student's rule says of it, while it is tested. */
function Line({ c, children }) {
  return (
    <>
      <div className={c.text ? 'rf-line--sentence' : c.pair ? 'rf-line--pair' : c.factor ? 'rf-line--factor' : ''}>
        {c.mirror && (
          <i className="rf-inmirror" title={L.mirror}>
            🪞
          </i>
        )}
        {c.text ? (
          <span>{c.text}</span>
        ) : c.deal ? (
          <DealHead deal={c.deal} />
        ) : c.factor ? (
          // a factor ladder names its number and its planks, never « a planche b » (defects.md A10)
          <FactorHead factor={c.factor} />
        ) : c.pair && c.head ? (
          // a pair that is not two gaps (a FRACTION: the whole, its lit stretch) names itself in its own words
          <span className="rf-line__head">{c.head}</span>
        ) : c.pair ? (
          <>
            <PairHead pair={c.pair} /> <span>{L.plank(c.pair.d)}</span>
          </>
        ) : c.head ? (
          // a case that is not a bridge names itself in its own words (defects.md A10): « 1003 et 34 », never « planche »
          <span className="rf-line__head">{c.head}</span>
        ) : (
          <>
            <strong dir="ltr">{formatFr(c.a)}</strong> <span>{L.plank(c.b)}</span>
          </>
        )}
        <em>
          {c.tag ??
            (c.text
              ? c.held
                ? L.true
                : L.false
              : c.pair
                ? L.pair(c)
                : c.factor
                  ? factorTag(c.factor)
                  : fitsOf(c)
                    ? L.held
                    : L.fell(c))}
        </em>
      </div>
      <div className={c.sub ? 'rf-line2 rf-line2--sub' : 'rf-line2'}>
        {/* a case may say what its line is built on in words (`sub`: a fraction's two decompositions) — read in place of
            the bars, whose cells are too thin to count on a large bridge (a gate B of 2026-11-26) */}
        {c.sub ? (
          <small className="rf-line__sub" dir="ltr">
            {c.sub}
          </small>
        ) : (
          <Mini c={c} />
        )}
        {children}
      </div>
    </>
  );
}

export const FORGE_PARTS = {
  Mirror,
  Line,
  Inquiry,
  // a pair: the plank is laid on both gaps at once, one stroke per plank of the longer row; a factor ladder: one per plank
  beats: (c) =>
    isCrewCase(c)
      ? crewsBeats(c)
      : c.deal
        ? dealOf(c.deal.a.n, c.deal.b.n, c.deal.k).rounds
        : c.factor
          ? c.factor.planks.length + (c.factor.fell != null ? 1 : 0)
          : c.pair
            ? pairBeats(c.pair)
            : c.q,
};
