/**
 * « Le palais des dalles » — THE drawing of a court in 2D (pure SVG; it names no lesson). Used by the forge's mirror, the
 * experiments, the board: one court, drawn one way everywhere.
 *
 *   <Court area="30" rod={{ q: '5,47' }} stage="ask|build|done" tight={false} zoom={null} label={true} />
 *
 *   area   the court's area, as text (« 30 », « 0,25 », « 49/64 »): written on its gate as given
 *   rod    a rod (logic.js: `{ q }` or a wall `{ root }`) or null — no platform yet
 *   stage  ask   the court, and the platform built on the rod HOVERING over it as a dashed outline: nothing decided
 *          build the platform lowers into the court (0.9 s; still under `prefers-reduced-motion`)
 *          done  what the world did: the BAND it leaves in amber, the OVERHANG of a jam in violet, or the platform
 *                seated and glowing green when it rides — and the exact difference WRITTEN beside the court
 *   tight  the mirror shares the screen with the tiles: drawn lower (9.5rem instead of 11rem), same picture
 *   zoom   null: a MAGNIFIER appears by itself at `done` when the band or the overhang is thinner than about 4 px — it
 *          shows the court's far corner enlarged by a power of ten (« ×100 »); a number > 1 forces that factor (the
 *          student drives the lens; at a ride it shows the walls flush); 1 or 0 forces no lens
 *   label  false draws the court alone (no plaque, no rod label, no fact) — a thumbnail
 *   fast   (optional) the walks' fast mode: every animation in a few ms
 *
 * The geometry, in a viewBox of 640 × 240 drawn left to right (`direction="ltr"`), read in that order:
 *   left   the gate's plaque: the area, and its noun agreed (« 30 » over « dalles »)
 *   middle the court, TO SCALE: its corner POST at the bottom left (the side of the gate, where the reader starts — and
 *          where the 3D world's post stands, the rod pulled to the right); the rod runs from the post along the near
 *          (bottom) wall; the platform is the square built on it, from the post. The far walls are the top and the
 *          right one: there the tiles are CUT when the side is not whole
 *   right  what the world did, in words, and the magnifier on the far corner when it is needed
 * The floor: unit tiles up to 150 tiles; above, blocks of 10 × 10 (100 × 100 for a court of thousands — never more than
 * 15 blocks a side); under one tile, ONE enlarged tile and its subdivisions (4 × 4, 8 × 8 or 10 × 10), the court in its
 * corner — the picture stays honest (MANIPULATION_DNA.md §17.6).
 * Numbers: every number the drawing writes goes through `Num` — a fraction (the gate's area, the rod, a wall's radicand,
 * the difference in the fact) is STACKED over a real bar, never « p/q » text; a whole number or a decimal is one line.
 * A fraction rod's label hangs lower, so the view slides down (`ROD_FRAC`); `aria-label` reads « 23 sur 7 ».
 * Every word the drawing writes comes from strings.js › DRAWING_TEXT.
 * Text: every glyph is FONT = 27 units. Drawn at 11rem in the forge (1366 × 768: zoom 1.067) that is 27 × 176 / 240 ×
 * 1.067 = 21.1 px; tight (9.5rem) 18.2 px. A screen that draws the court smaller must keep `FONT × height / 240` ≥ 18 px.
 * Hooks: data-court, data-court-rod, data-court-stage, data-court-kind (at done), data-court-zoom (the lens factor, « 1 »
 * when there is no lens), data-court-mode (tiles | blocks | sub).
 */
import { approx, isWall, lengthOf, outcome, rodText, rootOf } from './logic';
import { counted } from '../kit/authoring/numbers';
import { TILES, inCourtWriting, tiles, tileWord } from './ruleForge';
import { DRAWING_TEXT } from './strings';
import './court.css';

export const COURT_VIEW = { w: 640, h: 240, font: 27 };
const { w: W, h: H, font: F } = COURT_VIEW;
/**
 * The zones, left to right: the plaque (2 … 144), the court from its post (164 … 332 at most), the facts and the lens
 * (centred on 490). Exported for the test that pins this order (`courtParts.render.test.jsx`).
 */
export const COURT_LAYOUT = {
  post: { x: 164, y: 196 }, // the corner post: bottom LEFT of the court
  room: 168, // the longest side drawn (the court or the platform)
  factMid: 490, // the centre of the right zone (the facts)
  plaque: { x0: 2, x1: 144, mid: 73 },
  lens: { cx: 454, cy: 60, r: 46 },
  factor: 570, // the lens's factor, right of the lens
};
const { post: POST, room: ROOM, factMid: FACT_MID, plaque: PLAQUE, lens: LENS } = COURT_LAYOUT;
const THIN = 4; // units (≈ px at 11rem): thinner than this, the band or the overhang cannot be seen
const EPS = 1e-9;
/**
 * A rod's label that is a stacked fraction stands lower than one line (`y` its baseline for `Num`; under a radical, 6
 * more for the radical's top line to clear the rod) and the view slides down by `drop` units to hold it: same size,
 * same height on the page, only the strip above the floor (where nothing but the lens's top and the plaque's arch
 * reach) leaves the view.
 */
const ROD_FRAC = { q: { y: 249, drop: 26 }, wall: { y: 255, drop: 34 } };

/** The width a text takes, in units — an estimate for the layout (a digit ≈ 0.6 em, a letter ≈ 0.55 em). */
export const widthOf = (text, f) =>
  [...String(text)].reduce(
    (t, ch) => t + f * (/[0-9]/.test(ch) ? 0.6 : /[,.]/.test(ch) ? 0.3 : /[/\-−]/.test(ch) ? 0.42 : 0.55),
    0,
  );
/** A text holds a word (a letter)? Then it is never squeezed; a number may be. */
const isWord = (t) => /\p{L}/u.test(t);

/**
 * One line of text, left to right. A NUMBER wider than `max` is squeezed sideways (never shrunk in height: a 20-digit
 * difference stays 27 units tall); a word is never forced to a length — its width is only estimated, and `textLength`
 * would stretch it when the estimate is long. The zones are sized for the longest sentence.
 */
function Txt({ x, y, f = F, max, anchor = 'middle', cls = '', children }) {
  const t = String(children);
  const squeeze = max && !isWord(t) && widthOf(t, f) > max ? { textLength: max, lengthAdjust: 'spacingAndGlyphs' } : {};
  return (
    <text x={x} y={y} textAnchor={anchor} direction="ltr" fontSize={f} className={`crt-t ${cls}`} {...squeeze}>
      {t}
    </text>
  );
}

/** A fraction « p/q »? Its two parts, else null (a whole number, a decimal, a radical: one line). */
const fracOf = (text) => {
  const m = /^(-?\d+)\/(\d+)$/.exec(String(text));
  return m ? { n: m[1], d: m[2] } : null;
};
/** The width a number takes as it is DRAWN: a fraction is as wide as its bar (its parts at `g` units). */
const numWidth = (text, f, g = f * 0.8) => {
  const fr = fracOf(text);
  return fr ? Math.max(widthOf(fr.n, g), widthOf(fr.d, g)) + 8 : widthOf(text, f);
};
/** A number read aloud (`aria-label`): « 23/7 » → « 23 sur 7 »; anything else as written. */
const spoken = (text) => String(text).replace(/(\d+)\/(\d+)/g, `$1 ${DRAWING_TEXT.over} $2`);

/**
 * THE way the court writes a number: a fraction « 49/64 » stacked — its numerator over a real bar over its denominator,
 * each part at `g` units (default 0.8 × f), the bar as wide as the longer part plus 8, all centred on `x` where the
 * plain number would stand (the numerator's baseline 0.62 g above `y`, the bar 0.38 g above it, the denominator's
 * baseline 0.62 g below: the whole spans y − 1.32 g … y + 0.62 g, its middle on a text line of baseline `y`). Never
 * « p/q » as text. A whole number, a decimal: one line, left to right, exactly as `Txt` draws it.
 */
function Num({ x, y, f, g = f * 0.8, text, cls = '', max }) {
  const fr = fracOf(text);
  if (!fr)
    return (
      <Txt x={x} y={y} f={f} cls={cls} max={max}>
        {text}
      </Txt>
    );
  const { n, d } = fr;
  const bar = Math.min(numWidth(text, f, g), max ?? Infinity);
  return (
    <g className={`crt-frac ${cls}`} data-court-frac={text}>
      <Txt x={x} y={y - g * 0.62} f={g} cls={cls} max={max && max - 8}>
        {n}
      </Txt>
      <line x1={x - bar / 2} x2={x + bar / 2} y1={y - g * 0.38} y2={y - g * 0.38} className="crt-bar" />
      <Txt x={x} y={y + g * 0.62} f={g} cls={cls} max={max && max - 8}>
        {d}
      </Txt>
    </g>
  );
}

/**
 * The radical sign drawn as a stroke over its number (never a glyph that bidi could turn round). A radicand that is a
 * fraction is stacked under a radical as tall as it (`y` is then the line's baseline of `Num`). It never starts left of
 * `minLeft` (the post's side).
 */
function Radical({ cx, y, radicand, f, minLeft }) {
  if (fracOf(radicand)) {
    const fw = numWidth(radicand, f, f);
    const rw = f * 0.62;
    const total = rw + fw + 6;
    const x0 = Math.max(cx - total / 2, minLeft);
    const top = y - f * 1.32 - 4;
    const bottom = y + f * 0.62 + 2;
    return (
      <g className="crt-radical" data-court-radical={radicand}>
        <path
          d={`M${x0} ${y - f * 0.38} l${f * 0.16} ${-f * 0.08} L${x0 + f * 0.36} ${bottom} L${x0 + rw} ${top} H${x0 + total}`}
        />
        <Num x={x0 + rw + 3 + fw / 2} y={y} f={f} g={f} text={radicand} cls="crt-t--rod" />
      </g>
    );
  }
  const dw = widthOf(radicand, f);
  const rw = f * 0.62;
  const total = rw + dw + 6;
  const x0 = Math.max(cx - total / 2, minLeft);
  const top = y - f * 0.86;
  return (
    <g className="crt-radical" data-court-radical={radicand}>
      <path
        d={`M${x0} ${y - f * 0.34} l${f * 0.16} ${-f * 0.08} l${f * 0.2} ${f * 0.44} L${x0 + rw} ${top} H${x0 + total}`}
      />
      <text
        x={x0 + rw + 3}
        y={y}
        textAnchor="start"
        direction="ltr"
        fontSize={f}
        textLength={dw}
        lengthAdjust="spacing"
        className="crt-t crt-t--rod"
      >
        {radicand}
      </text>
    </g>
  );
}

/** How the floor is drawn: unit tiles, blocks of 10ⁿ × 10ⁿ, or the subdivisions of ONE tile. */
function floorOf(area, areaNum, L, u) {
  if (areaNum < 1) {
    const root = rootOf(area);
    const exact = root == null ? null : approx(root);
    const n = [4, 8, 10, 5].find((k) => exact != null && Math.abs(exact * k - Math.round(exact * k)) < EPS) ?? 10;
    return { mode: 'sub', step: 1 / n, n };
  }
  if (areaNum <= 150 && u >= 5) return { mode: 'tiles', step: 1 };
  return { mode: 'blocks', step: 10 ** Math.max(1, Math.ceil(Math.log10(L / 15) - EPS)) };
}

/** The cells of a floor of side L (in tiles), `step` tiles a side, from the post: each with its cut and lit state. */
function cellsOf(L, step, u, l, lit) {
  const n = Math.ceil(L / step - EPS);
  const out = [];
  for (let i = 0; i < n; i += 1)
    for (let j = 0; j < n; j += 1) {
      const w = Math.min(step, L - i * step);
      const h = Math.min(step, L - j * step);
      out.push({
        key: `${i}-${j}`,
        x: POST.x + i * step * u,
        y: POST.y - (j * step + h) * u,
        w: w * u,
        h: h * u,
        cut: w < step - EPS || h < step - EPS,
        lit: lit && i * step + w <= l + EPS && j * step + h <= l + EPS,
        far: i + j,
      });
    }
  return out;
}

/** The factor of a lens that makes a gap of g units about 8 to 80 units wide: a power of ten. */
const lensFactor = (g) => 10 ** Math.min(20, Math.max(1, Math.ceil(Math.log10(8 / g) - EPS)));
/** « ×100 », or « ×10 » and its exponent above 10 000 (`exp` = null when the factor is written whole). */
const factorText = (k) => {
  const e = Math.round(Math.log10(k));
  return e <= 4 ? { base: `×${k}`, exp: null } : { base: '×10', exp: String(e) };
};

/**
 * THE MAGNIFIER on the court's far corner: the corner enlarged k times, so a band of 0,0791 tile (or of a hundred-
 * millionth) is SEEN. `g` = the gap in units of the court's drawing (0 at a ride); the lens is centred on the middle of
 * the gap. Inside: the floor of the court, its two far walls, the platform, the band (amber) or the overhang (violet).
 */
function Lens({ kind, g, k, corner }) {
  const { cx, cy, r } = LENS;
  const gk = g * k;
  const big = r * 3;
  // the court's far corner (its top RIGHT) in the lens: the court lies left of and below it — the band inside the
  // court, the overhang outside; `pc` is the platform's far corner
  const cc = kind === 'jam' ? { x: cx - gk / 2, y: cy + gk / 2 } : { x: cx + gk / 2, y: cy - gk / 2 };
  const pc = kind === 'jam' ? { x: cc.x + gk, y: cc.y - gk } : kind === 'band' ? { x: cc.x - gk, y: cc.y + gk } : cc;
  const id = `crt-lens-${kind}-${Math.round(Math.log10(k))}`;
  // the leader from the lens to the far corner of the court
  const dx = corner.x - cx;
  const dy = corner.y - cy;
  const len = Math.hypot(dx, dy) || 1;
  const { base, exp } = factorText(k);
  return (
    <g className={`crt-lens is-${kind}`} data-court-lens={k}>
      <line
        x1={cx + (dx / len) * r}
        y1={cy + (dy / len) * r}
        x2={corner.x - (dx / len) * 8}
        y2={corner.y - (dy / len) * 8}
        className="crt-lens__leader"
      />
      <circle cx={corner.x} cy={corner.y} r="7" className="crt-lens__spot" />
      <clipPath id={id}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} className="crt-lens__void" />
        {kind === 'jam' && <rect x={pc.x - big} y={pc.y} width={big} height={big} className="crt-over" />}
        <rect
          x={cc.x - big}
          y={cc.y}
          width={big}
          height={big}
          className={kind === 'band' ? 'crt-band' : 'crt-lens__floor'}
        />
        <rect
          x={Math.min(pc.x, cc.x) - big}
          y={Math.max(pc.y, cc.y)}
          width={big}
          height={big}
          className={`crt-lens__plat is-${kind}`}
        />
        <path d={`M${cc.x - big} ${cc.y} H${cc.x} V${cc.y + big}`} className="crt-lens__wall" />
      </g>
      <circle cx={cx} cy={cy} r={r} className="crt-lens__ring" />
      <line
        x1={cx + r * 0.72}
        y1={cy + r * 0.72}
        x2={cx + r * 0.72 + 20}
        y2={cy + r * 0.72 + 20}
        className="crt-lens__handle"
      />
      <text
        x={COURT_LAYOUT.factor}
        y={cy + F * 0.4}
        textAnchor="middle"
        direction="ltr"
        fontSize={F * 1.15}
        className="crt-t crt-t--zoom"
      >
        {base}
        {exp && (
          <tspan dy={-F * 0.5} fontSize={F}>
            {exp}
          </tspan>
        )}
      </text>
    </g>
  );
}

/** What the world did, in words, in the right zone: its fact, and the exact difference (`outcome().diff`). */
function Fact({ o, area, lens }) {
  const diff = inCourtWriting(o.diff, area);
  const lines =
    o.kind === 'ride'
      ? [
          { t: DRAWING_TEXT.fact.ride[0], cls: 'crt-t--ride' },
          { t: DRAWING_TEXT.fact.ride[1], cls: 'crt-t--soft' },
        ]
      : [{ t: DRAWING_TEXT.fact[o.kind], cls: `crt-t--${o.kind}` }];
  if (o.kind !== 'ride') {
    const whole = tiles(diff);
    if (fracOf(diff)) {
      // a fraction: drawn stacked, and its noun (what `tiles` writes after it) to its RIGHT — the line read left to
      // right meets the number first, the fraction one unit; too wide with its noun: the fraction, then its noun
      const word = tileWord(diff);
      const fw = numWidth(diff, F, F);
      if (fw + FRAC_SPACE + widthOf(word, F) <= 270) lines.push({ frac: diff, word, fw, cls: 'crt-t--diff' });
      else lines.push({ frac: diff, fw, cls: 'crt-t--diff' }, { t: word, cls: 'crt-t--soft' });
    }
    // a short difference with its noun on one line (« 5 dalles »); a long one: the number, then its noun
    else if (widthOf(whole, F) <= 270) lines.push({ t: whole, cls: 'crt-t--diff' });
    else lines.push({ t: diff, cls: 'crt-t--diff', num: true }, { t: tileWord(diff), cls: 'crt-t--soft' });
  }
  // the lines' baselines: 36 units apart, 46 beside a stacked fraction (it spans its baseline − 36 … + 17)
  const steps = lines.slice(1).map((line, i) => (line.frac || lines[i].frac ? 46 : 36));
  const span = steps.reduce((a, b) => a + b, 0);
  const y0 = lens ? 230 - span - (lines.at(-1).frac ? 9 : 0) : 124 - span / 2;
  const ys = steps.reduce((acc, s) => [...acc, acc.at(-1) + s], [y0]);
  return (
    <g className="crt-fact" data-court-fact={o.kind} data-court-diff={o.diff}>
      {lines.map((line, i) =>
        line.frac ? (
          <FracLine key={i} line={line} y={ys[i]} />
        ) : (
          <Txt key={i} x={FACT_MID} y={ys[i]} f={line.num ? F * 1.05 : F} max={288} cls={line.cls}>
            {line.t}
          </Txt>
        ),
      )}
    </g>
  );
}

const FRAC_SPACE = 12; // between a stacked fraction and the word after it
/**
 * A line of the fact holding a fraction: the fraction stacked (its parts at 27 units, like every glyph of the court)
 * and, when it has one, its noun to its RIGHT, both centred as one group on the right zone. The noun is drawn left to
 * right from its own left edge (anchor start), on the line's baseline.
 */
function FracLine({ line, y }) {
  const ww = line.word ? widthOf(line.word, F) + FRAC_SPACE : 0;
  const left = FACT_MID - Math.min(line.fw + ww, 288) / 2;
  const fx = line.word ? left + line.fw / 2 : FACT_MID;
  return (
    <g className="crt-fact__frac" data-court-fact-frac={line.frac}>
      <Num x={fx} y={y} f={F} g={F} text={line.frac} cls={line.cls} max={288} />
      {line.word && (
        <Txt x={left + line.fw + FRAC_SPACE} y={y} anchor="start" cls={line.cls}>
          {line.word}
        </Txt>
      )}
    </g>
  );
}

/** The gate's plaque: the area (a fraction stacked), and under it its noun agreed with it; a key of the floor below. */
function Plaque({ area, floor }) {
  const nf = Math.min(F * 1.5, 124 / Math.max(1, widthOf(area.split('/')[0], 1)));
  return (
    <g className="crt-plaque" data-court-plaque={area}>
      <path
        d={`M${PLAQUE.x0} 150 V54 Q${PLAQUE.x0} 20 ${PLAQUE.mid} 20 Q${PLAQUE.x1} 20 ${PLAQUE.x1} 54 V150 Z`}
        className="crt-plaque__arch"
      />
      <Num
        x={PLAQUE.mid}
        y={area.includes('/') ? 84 : 92}
        f={area.includes('/') ? F * 1.5 : Math.max(F, nf)}
        text={area}
        cls="crt-t--area"
        max={126}
      />
      <Txt x={PLAQUE.mid} y={136} max={128} cls="crt-t--soft">
        {tileWord(area)}
      </Txt>
      {floor.mode !== 'tiles' && <FloorKey floor={floor} />}
    </g>
  );
}

/** Under the plaque: what one square of the floor holds — « 1 dalle » (the dashed tile) or « 100 dalles » (a block). */
function FloorKey({ floor }) {
  const s = 22;
  const x = PLAQUE.mid - s / 2;
  if (floor.mode === 'sub')
    return (
      <g className="crt-key" data-court-key="tile">
        <rect x={x} y={160} width={s} height={s} className="crt-key__tile" />
        <Txt x={PLAQUE.mid} y={214} max={140} cls="crt-t--soft">
          {DRAWING_TEXT.tile}
        </Txt>
      </g>
    );
  const holds = floor.step * floor.step;
  return (
    <g className="crt-key" data-court-key={holds}>
      <rect x={x} y={158} width={s} height={s} className="crt-key__block" />
      <Txt x={PLAQUE.mid} y={208} max={140} cls="crt-t--soft">
        {String(holds)}
      </Txt>
      <Txt x={PLAQUE.mid} y={236} max={140} cls="crt-t--soft">
        {counted(holds, TILES).slice(String(holds).length + 1)}
      </Txt>
    </g>
  );
}

export function Court({
  area,
  rod = null,
  stage = 'ask',
  tight = false,
  zoom = null,
  label = true,
  fast = false,
  className = '',
}) {
  const A = String(area).trim();
  const aNum = approx(A);
  const L = Math.sqrt(aNum);
  const l = rod ? lengthOf(rod) : 0;
  const o = rod ? outcome(rod, A) : null;
  const sub = aNum < 1;
  const u = ROOM / Math.max(L, l, sub ? 1 : 0);
  const floor = floorOf(A, aNum, L, u);
  const seated = stage !== 'ask';
  const done = stage === 'done' && o;
  const cells = cellsOf(L, floor.step, u, l, Boolean(rod) && seated);
  // the court and the platform grow from the post (bottom left) to the right and up: xR / xr their far (right) edges
  const xR = POST.x + L * u;
  const yT = POST.y - L * u;
  const xr = POST.x + l * u;
  const yl = POST.y - l * u;
  // the gap between the platform's far edges and the court's far walls, in units — from the EXACT difference
  // (diff / (side + rod)): 5,477225575 against √30 is a gap of 5·10⁻¹¹ tile, which a subtraction of floats would lose
  const g = o && o.kind !== 'ride' ? (approx(o.diff) / (L + l)) * u : 0;
  const k = !done || !label ? null : zoom == null ? (g > 0 && g < THIN ? lensFactor(g) : null) : zoom > 1 ? zoom : null;
  const kind = o?.kind;
  const wallRod = rod && isWall(rod);
  const rt = rod ? rodText(rod) : '';
  const rodLabelW = wallRod ? numWidth(rod.root, F, F) + F * 0.62 + 6 : numWidth(rt, F, F);
  const rodCx = Math.max(POST.x + (l * u) / 2, POST.x - 14 + rodLabelW / 2);
  // a rod that is a FRACTION is written stacked under it (its parts at 27 units, like every glyph): ROD_FRAC
  const rodFrac = label && rod && fracOf(wallRod ? rod.root : rt) ? ROD_FRAC[wallRod ? 'wall' : 'q'] : null;
  const rodY = rodFrac ? rodFrac.y : 236;
  return (
    <svg
      viewBox={`0 ${rodFrac ? rodFrac.drop : 0} ${W} ${H}`}
      className={`crt-court is-${stage} ${done ? `is-${kind}` : ''} ${tight ? 'is-tight' : ''} ${fast ? 'is-fast' : ''} ${className}`}
      direction="ltr"
      role="img"
      aria-label={`${DRAWING_TEXT.court} ${spoken(A)}${rod ? ` · ${DRAWING_TEXT.rod} ${spoken(rt)}` : ''}`}
      data-court={A}
      data-court-rod={rod ? rt : undefined}
      data-court-stage={stage}
      data-court-kind={done ? kind : undefined}
      data-court-zoom={done ? String(k ?? 1) : undefined}
      data-court-mode={floor.mode}
    >
      {/* the floor: the whole tile and its subdivisions under a court smaller than one tile */}
      {floor.mode === 'sub' && (
        <g className="crt-onetile" data-court-sub={floor.n}>
          <rect x={POST.x} y={POST.y - u} width={u} height={u} className="crt-onetile__edge" />
          {Array.from({ length: floor.n - 1 }, (_, i) => {
            const d = ((i + 1) * u) / floor.n;
            return (
              <g key={i}>
                <line x1={POST.x + d} x2={POST.x + d} y1={POST.y - u} y2={POST.y} className="crt-onetile__line" />
                <line x1={POST.x} x2={POST.x + u} y1={POST.y - d} y2={POST.y - d} className="crt-onetile__line" />
              </g>
            );
          })}
        </g>
      )}
      <g className={`crt-floor is-${floor.mode}`}>
        {cells.map((c) => (
          <rect
            key={c.key}
            x={c.x}
            y={c.y}
            width={c.w}
            height={c.h}
            className={`crt-tile ${c.cut ? 'is-cut' : ''} ${c.lit ? 'is-lit' : ''}`}
            style={c.lit && stage === 'build' ? { animationDelay: `${300 + c.far * (fast ? 1 : 25)}ms` } : undefined}
          />
        ))}
        {floor.mode === 'blocks' &&
          floor.step * u >= F * 2.6 &&
          cells
            .filter((c) => !c.cut)
            .map((c) => (
              <Txt key={`n${c.key}`} x={c.x + c.w / 2} y={c.y + c.h / 2 + F * 0.36} cls="crt-t--block">
                {String(floor.step * floor.step)}
              </Txt>
            ))}
      </g>
      <rect x={POST.x} y={yT} width={L * u} height={L * u} className="crt-wall" />

      {/* what the world did: the band it leaves, or what sticks out */}
      {done && kind === 'band' && (
        <path
          d={`M${xR} ${yT} H${POST.x} V${yl} H${xr} V${POST.y} H${xR} Z`}
          className="crt-band"
          data-court-band={o.diff}
        />
      )}
      {rod && l > 0 && (
        <g className={`crt-plat is-${stage} ${done ? `is-${kind}` : ''}`} data-court-platform={o.covers}>
          <rect x={POST.x} y={yl} width={l * u} height={l * u} className="crt-plat__slab" />
          {done && kind === 'jam' && (
            <path
              d={`M${xr} ${yl} H${POST.x} V${yT} H${xR} V${POST.y} H${xr} Z`}
              className="crt-over"
              data-court-over={o.diff}
            />
          )}
        </g>
      )}

      <g className="crt-post">
        <rect x={POST.x - 7} y={POST.y - 7} width="14" height="14" rx="3" />
      </g>
      {rod && l > 0 && (
        <g className={`crt-rod ${wallRod ? 'is-wall' : ''}`}>
          <rect x={POST.x} y={POST.y + 7} width={l * u} height="7" rx="3.5" className="crt-rod__bar" />
          <circle cx={xr} cy={POST.y + 10.5} r="5.5" className="crt-rod__knob" />
        </g>
      )}

      {label && (
        <>
          <Plaque area={A} floor={floor} />
          {rod &&
            (wallRod ? (
              <Radical cx={rodCx} y={rodY} radicand={rod.root} f={F} minLeft={POST.x - 14} />
            ) : (
              <Num x={rodCx} y={rodY} f={F} g={F} text={rt} cls="crt-t--rod" />
            ))}
          {k && <Lens kind={kind} g={g} k={k} corner={{ x: xR, y: yT }} />}
          {done && <Fact o={o} area={A} lens={Boolean(k)} />}
        </>
      )}
    </svg>
  );
}

/**
 * The court as a THUMBNAIL (a line of evidence): the court, the platform from the post, and a sliver of amber (a band) or
 * violet (an overhang) — at least 2 units wide, so a band of 0,0791 tile is not lost in a 40-unit square (the exact
 * difference is written in the mirror and its sentences). No text.
 */
export function CourtMini({ area, rod }) {
  const A = String(area).trim();
  const L = Math.sqrt(approx(A));
  const l = rod ? lengthOf(rod) : 0;
  const o = rod ? outcome(rod, A) : null;
  const S = 34;
  const u = S / Math.max(L, l);
  const P = 37;
  const side = L * u;
  // a sliver too thin to see is drawn 2 units wide: the thumbnail says « a band » / « it sticks out », not how much
  const lp = o?.kind === 'band' ? Math.min(l * u, side - 2) : o?.kind === 'jam' ? Math.max(l * u, side + 2) : l * u;
  return (
    <svg
      viewBox="0 0 40 40"
      className={`crt-mini is-${o?.kind ?? 'none'}`}
      aria-hidden="true"
      data-court-mini={o?.kind}
    >
      {o?.kind === 'jam' && <rect x={P - lp} y={P - lp} width={lp} height={lp} className="crt-mini__over" />}
      <rect
        x={P - side}
        y={P - side}
        width={side}
        height={side}
        className={o?.kind === 'band' ? 'crt-mini__band' : 'crt-mini__floor'}
      />
      {rod && (
        <rect
          x={P - Math.min(lp, side)}
          y={P - Math.min(lp, side)}
          width={Math.min(lp, side)}
          height={Math.min(lp, side)}
          className="crt-mini__plat"
        />
      )}
      <rect x={P - side} y={P - side} width={side} height={side} className="crt-mini__wall" />
    </svg>
  );
}
