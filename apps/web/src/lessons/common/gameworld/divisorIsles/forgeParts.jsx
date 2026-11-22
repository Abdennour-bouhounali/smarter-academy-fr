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
 * then names it in those words (« 1003 و 34 ») instead of « a لوح b » (defects.md A10). A PAIR may carry `head` too —
 * a fraction drawn as its whole bridge over its lit stretch (`pair` = { a: the whole, b: the lit cells, d: the plank }):
 * its line then reads « 66/78 → 33/39 » (an isolated LTR run), not « 78 و 66 لوح 6 ».
 */
import Inquiry from './Inquiry';
import { dealOf } from './deal';
import { Glyph, GlyphDefs, LOTS, Lot, LotShape, Pile, grid } from './dealParts';
import { planks } from './strings';
import './forgeParts.css';

const WHICH = 'أيّ جسر تعنيه؟ المرآة ستبنيه بعد جوابك.';
/** Does the BRIDGE of the case hold? (its own `fits`, or the truth of the case when they are the same thing) */
const fitsOf = (c) => c.fits ?? c.held;
/** A gap's length with its agreement: « خانة واحدة », « خانتان », « 3 خانات », « 27 خانة », « 0 خانة » (defects.md B11). */
const cells = (n) => (n === 1 ? 'خانة واحدة' : n === 2 ? 'خانتان' : n >= 3 && n <= 10 ? `${n} خانات` : `${n} خانة`);

/** The bridge in the mirror: `a` cells, planks of `b`, what is left in amber. `stage`: ask (the gap and one plank) | build | done. */
function Mirror({ c, stage, fast, tight = false }) {
  if (c.deal) return <DealMirror c={c} stage={stage} fast={fast} tight={tight} />;
  if (c.pair) return <PairMirror c={c} stage={stage} fast={fast} tight={tight} />;
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
        <p className="rf-sentence__hint">{WHICH}</p>
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
              لوح {c.b}
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
          {cells(c.a)}
        </text>
      </svg>
    </>
  );
}

const Mini = ({ c }) => {
  if (c.deal) return <DealMini c={c} />;
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
const P_LABEL = 662; // the centre of the labels « 16 خانة »
const P_ROWS = [58, 110]; // the top of each bridge
const P_TIGHT = 50; // tight: the band of the plank is left out once the planks are laid
/** One gap of a pair: n cells, the plank d laid on it, what is left in amber. */
const pairRow = (n, d) => {
  const q = d <= n ? Math.floor(n / d) : 0;
  return { n, q, r: n - q * d, fills: n % d === 0 };
};

function PairMirror({ c, stage, fast, tight }) {
  const { a, b, d } = c.pair;
  const built = stage !== 'ask';
  const done = stage === 'done';
  const rows = [pairRow(a, d), pairRow(b, d)];
  const cell = Math.min(34, P_ROOM / Math.max(a, b, d));
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
            {Array.from({ length: row.n }, (_, i) => (
              <rect
                key={i}
                x={P_X0 + i * cell + 1}
                y={y + 6}
                width={Math.max(1, cell - 2)}
                height="20"
                rx="3"
                className={`rf-cell ${built && i >= row.q * d ? 'is-left' : ''}`}
              />
            ))}
            {built &&
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
              {cells(row.n)}
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
            {Array.from({ length: row.q }, (_, k) => (
              <rect
                key={k}
                x={k * pair.d * cell + 0.25}
                y={y}
                width={Math.max(0.6, cell * pair.d - 0.5)}
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
    <strong dir="ltr">{pair.a}</strong> و <strong dir="ltr">{pair.b}</strong>
  </span>
);

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
        box={[545, 6, 440, 96]}
        left={done && d.rA > 0}
      />
      <Pile
        ns="rfd"
        tag="b"
        kind={b.item}
        n0={b.n}
        rem={built ? d.rB : b.n}
        box={[15, 6, 440, 96]}
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
    <strong>{deal.a.n}</strong>
    <Glyph kind={deal.a.item} />
    <strong>{deal.b.n}</strong>
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

const L = {
  mirror: 'بنته المرآة',
  plank: (b) => `لوح ${b}`,
  held: 'ثبت',
  fell: (c) =>
    c.b > c.a
      ? 'انهار: اللوح أطول'
      : c.r === 1
        ? 'انهار: بقيت خانة'
        : c.r === 2
          ? 'انهار: بقيت خانتان'
          : `انهار: بقيت ${cells(c.r)}`,
  true: 'صحيحة',
  false: 'خاطئة',
  /** a pair with no tag of its own: the planks the two bridges take, or whether the plank builds both */
  pair: (c) => (c.pair.need != null ? planks(c.pair.need) : fitsOf(c) ? 'يبني الجسرين' : 'لا يبنيهما'),
};

/** A bridge as one line of the evidence; `children` = what the student's rule says of it, while it is tested. */
function Line({ c, children }) {
  return (
    <>
      <div className={c.text ? 'rf-line--sentence' : c.pair ? 'rf-line--pair' : ''}>
        {c.mirror && (
          <i className="rf-inmirror" title={L.mirror}>
            🪞
          </i>
        )}
        {c.text ? (
          <span>{c.text}</span>
        ) : c.deal ? (
          <DealHead deal={c.deal} />
        ) : c.pair && c.head ? (
          // a pair that is not two gaps (a FRACTION: the whole, its lit stretch) names itself in its own words
          <span className="rf-line__head">{c.head}</span>
        ) : c.pair ? (
          <>
            <PairHead pair={c.pair} /> <span>{L.plank(c.pair.d)}</span>
          </>
        ) : c.head ? (
          // a case that is not a bridge names itself in its own words (defects.md A10): « 1003 و 34 », never « لوح »
          <span className="rf-line__head">{c.head}</span>
        ) : (
          <>
            <strong dir="ltr">{c.a}</strong> <span>{L.plank(c.b)}</span>
          </>
        )}
        <em>{c.tag ?? (c.text ? (c.held ? L.true : L.false) : c.pair ? L.pair(c) : fitsOf(c) ? L.held : L.fell(c))}</em>
      </div>
      <div className="rf-line2">
        <Mini c={c} />
        {children}
      </div>
    </>
  );
}

export const FORGE_PARTS = {
  Mirror,
  Line,
  Inquiry,
  // a pair: the plank is laid on both gaps at once, one stroke per plank of the longer row
  beats: (c) =>
    c.deal
      ? dealOf(c.deal.a.n, c.deal.b.n, c.deal.k).rounds
      : c.pair
        ? Math.max(pairRow(c.pair.a, c.pair.d).q, pairRow(c.pair.b, c.pair.d).q)
        : c.q,
};
