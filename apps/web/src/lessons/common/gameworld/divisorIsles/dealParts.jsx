/**
 * The DRAWN PIECES of a sharing in this world — two collections on a table (roses and lilies, apples and pears…) and the
 * identical lots (vases, baskets) they are dealt into. Read by the investigation `deal` (`InquiryDeal.jsx`) and by the
 * mirror of a rule forge when a case is a sharing (`forgeParts.jsx › DealMirror`): the same items, the same lots, the
 * same « what is left is set apart in amber ».
 *
 * Every item and every lot is DRAWN here in SVG (`GLYPHS`, `Lot`): no raster image, no emoji as the drawing. The glyphs
 * are symbols declared once per scene (`GlyphDefs`, with the scene's own id prefix `ns`, so that two scenes never share an
 * id); `Glyph` draws one inline (a line of HTML, where no scene declares them).
 */
import './inquiryDeal.css';

/** The glyphs of the items, each in a 20 × 20 box: a symbol drawn once, used for every item. */
const GLYPHS = {
  rose: (
    <>
      <path className="iqd-stem" d="M10 19 V10" />
      <path className="iqd-leaf" d="M10 15 q-5 -1 -5 -4 q4 0 5 3 z" />
      <circle className="iqd-rose" cx="10" cy="7" r="6" />
      <path className="iqd-rose-in" d="M10 4.5 a2.6 2.6 0 1 1 -2.4 3.4 M10 7 a1.2 1.2 0 1 0 1.2 -1.2" />
    </>
  ),
  lily: (
    <>
      <path className="iqd-stem" d="M10 19 V11" />
      <path
        className="iqd-lily"
        d="M10 1 L12 6.5 L18 5 L13.5 9 L17 14 L10.8 11.6 L10 18 L9.2 11.6 L3 14 L6.5 9 L2 5 L8 6.5 Z"
        transform="translate(0 -2) scale(1 0.85) translate(0 1)"
      />
      <circle className="iqd-lily-in" cx="10" cy="7.6" r="1.8" />
    </>
  ),
  apple: (
    <>
      <path
        className="iqd-apple"
        d="M10 5.6 C7.4 3.6 3 4.6 3 9.6 C3 14.6 6.4 18.6 8.6 18.6 C9.4 18.6 9.6 18 10 18 C10.4 18 10.6 18.6 11.4 18.6 C13.6 18.6 17 14.6 17 9.6 C17 4.6 12.6 3.6 10 5.6 Z"
      />
      <path className="iqd-apple-in" d="M6 9 q0.4 -2.4 2.4 -3" />
      <path className="iqd-stem" d="M10 5.6 V2" />
      <path className="iqd-leaf" d="M10.4 3.4 q3 -2.6 5 -1 q-2.2 2.6 -5 1 z" />
    </>
  ),
  pear: (
    <>
      <path
        className="iqd-pear"
        d="M10 3.4 C8 3.4 7.6 5.4 7.6 7.4 C7.6 9.2 4.4 10.6 4.4 14 C4.4 17 7 19 10 19 C13 19 15.6 17 15.6 14 C15.6 10.6 12.4 9.2 12.4 7.4 C12.4 5.4 12 3.4 10 3.4 Z"
      />
      <path className="iqd-pear-in" d="M7 14 q0.2 2.4 2.6 3" />
      <path className="iqd-stem" d="M10 3.4 l0.8 -2.6" />
    </>
  ),
};

/** The symbols of the glyphs, for one scene (`ns`: the prefix of their ids). */
export const GlyphDefs = ({ ns }) => (
  <defs>
    {Object.entries(GLYPHS).map(([kind, glyph]) => (
      <symbol key={kind} id={`${ns}-${kind}`} viewBox="0 0 20 20">
        {glyph}
      </symbol>
    ))}
  </defs>
);

/** One item, drawn at (x, y) with the size s (a symbol of the scene `ns`). */
const Item = ({ ns = 'iqd', kind, x, y, s, cls = '', style }) => (
  <use href={`#${ns}-${kind}`} x={x} y={y} width={s} height={s} className={`iqd-item ${cls}`} style={style} />
);

/** One item drawn inline, with no symbol (a line of HTML: the evidence of a forge). */
export const Glyph = ({ kind }) => (
  <svg className="iqd-mini" viewBox="0 0 20 20" aria-hidden="true">
    {GLYPHS[kind]}
  </svg>
);

/** The biggest pitch (≤ max) that holds n items in a box w × h: { p, cols }. */
function fit(n, w, h, max = 24) {
  for (let p = max; p > 5; p -= 0.5) {
    const cols = Math.floor(w / p);
    if (cols > 0 && cols * Math.floor(h / p) >= n) return { p, cols };
  }
  return { p: 5, cols: Math.max(1, Math.floor(w / 5)) };
}
/** The places of n items laid in rows in a box (x, y, w, h), centred. */
export function grid(n, x, y, w, h, max) {
  const { p, cols } = fit(n, w, h, max);
  const rows = Math.ceil(n / cols);
  const used = Math.min(n, cols) * p;
  const x0 = x + (w - used) / 2;
  const y0 = y + Math.max(0, (h - rows * p) / 2);
  return { p, at: (i) => ({ x: x0 + (i % cols) * p, y: y0 + Math.floor(i / cols) * p }) };
}

/** The shapes of the lots, each in its box: the container and the box its items lie in. */
export const LOTS = {
  vase: (x, y, w, h) => {
    const c = x + w / 2;
    return {
      d: `M${c - 0.22 * w} ${y} H${c + 0.22 * w} L${c + 0.16 * w} ${y + 0.12 * h} Q${x + w} ${y + 0.2 * h} ${x + w} ${
        y + 0.56 * h
      } Q${x + w} ${y + h} ${c + 0.3 * w} ${y + h} H${c - 0.3 * w} Q${x} ${y + h} ${x} ${y + 0.56 * h} Q${x} ${
        y + 0.2 * h
      } ${c - 0.16 * w} ${y + 0.12 * h} Z`,
      inner: [x + 0.1 * w, y + 0.22 * h, 0.8 * w, 0.72 * h],
    };
  },
  basket: (x, y, w, h) => ({
    d: `M${x + 0.16 * w} ${y + 0.26 * h} Q${x + w / 2} ${y - 0.12 * h} ${x + 0.84 * w} ${y + 0.26 * h} M${x} ${
      y + 0.26 * h
    } H${x + w} L${x + 0.9 * w} ${y + h} H${x + 0.1 * w} Z`,
    inner: [x + 0.1 * w, y + 0.3 * h, 0.8 * w, 0.66 * h],
    weave: [0.45, 0.65, 0.85].map(
      (f) => `M${x + 0.04 * w + f * 0.04 * w} ${y + f * h} H${x + w - 0.04 * w - f * 0.04 * w}`,
    ),
  }),
};

/** The outline of a lot alone (an icon of its kind, no item in it). */
export function LotShape({ kind, box }) {
  const shape = LOTS[kind](...box);
  return (
    <g className={`iqd-lot iqd-lot--${kind}`}>
      <path className="iqd-lotshape" d={shape.d} />
      {(shape.weave ?? []).map((d) => (
        <path key={d} className="iqd-weave" d={d} />
      ))}
    </g>
  );
}

/**
 * One lot: its container and what it holds so far (cA items of the first kind, then cB of the second), laid in a grid of
 * `full` places. `cls`: the class of its items (« is-in »: dropped in; « is-ghost »: a claim, not yet dealt); `delay(j)`:
 * the animation delay of the j-th item of each kind (the round it was dealt in).
 */
export function Lot({ ns = 'iqd', i, kind, box, itemA, itemB, cA, cB, full, cls = 'is-in', delay }) {
  const shape = LOTS[kind](...box);
  const [ix, iy, iw, ih] = shape.inner;
  const g = grid(full, ix, iy, iw, ih, 22);
  const s = g.p * 0.9;
  const style = (j) => (delay ? { animationDelay: delay(j) } : undefined);
  return (
    <g className={`iqd-lot iqd-lot--${kind}`} data-iq-lot={i} data-iq-holds={`${cA},${cB}`}>
      <path className="iqd-lotshape" d={shape.d} />
      {(shape.weave ?? []).map((d) => (
        <path key={d} className="iqd-weave" d={d} />
      ))}
      {Array.from({ length: cA }, (_, j) => (
        <Item key={`a${j}`} ns={ns} kind={itemA} s={s} {...g.at(j)} cls={cls} style={style(j)} />
      ))}
      {Array.from({ length: cB }, (_, j) => (
        <Item key={`b${j}`} ns={ns} kind={itemB} s={s} {...g.at(full - cB + j)} cls={cls} style={style(j)} />
      ))}
    </g>
  );
}

/** What is still on the table: one pile per kind, its count over it; after a deal what is left is set apart in amber. */
export function Pile({ ns = 'iqd', tag, kind, n0, rem, box, left }) {
  const [x, y, w, h] = box;
  const g = grid(n0, x, y + 28, w, h - 28, 22);
  const s = g.p * 0.9;
  return (
    <g data-iq-pile={tag} data-iq-count={rem} className={left ? 'is-left' : ''}>
      {left && <rect className="iqd-apart" x={x - 6} y={y - 4} width={w + 12} height={h + 8} rx="12" />}
      <text className="iqd-count" x={x + w / 2} y={y + 22} direction="ltr">
        {rem}
      </text>
      {Array.from({ length: rem }, (_, j) => (
        <Item key={j} ns={ns} kind={kind} s={s} {...g.at(j)} />
      ))}
    </g>
  );
}
