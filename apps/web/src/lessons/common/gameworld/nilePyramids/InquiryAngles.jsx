/**
 * The screen of `angles` (logic: `angles.js`, words: `anglesText.js`) — a PURE view (`AnglesView`), its drawing
 * (`AnglesFigure`, also usable by a forge's last step: two triangles apart with the angles it is told to show) and its
 * player (`Angles`), which reads ← → itself while the protractor is on a vertex.
 *
 * Hooks: `data-iq="angles"`, `data-iq-stage=<measure|predict|slid>`, `data-iq-round`, `data-iq-at=<vertex name|>`,
 * `data-iq-vertex=<name>` (+ `data-iq-tri=<a|b>`), `data-iq-turn=<-10|-1|1|10>`, `data-iq-needle` (a range input, the
 * keyboard's and the walk's way to set the needle), `data-iq-reading`, `data-iq-read`, `data-iq-off`,
 * `data-iq-line=<a|b>` (+ `data-iq-third`), `data-iq-say=<same|other>`, `data-iq-slide`, `data-iq-fact=<hit|miss>`,
 * `data-iq-verdict=<covers|apart|open>` (+ `data-iq-open-sum`: « 225° ≠ 180° »), `data-iq-ghost`, `data-iq-next`.
 *
 * The drawing is this kind's own SVG (not `GeoFigure`): the protractor is dragged on it. It is drawn at 1 px a unit of
 * its 640 × 320 box or more (`.np-iq-ang__fig`), so its 18-unit text is 18 px or more.
 */
import { useEffect, useReducer } from 'react';
import MathText from '../../components/MathText';
import { M } from '../kit/parts';
import { approx } from '../kit/exact';
import {
  initAngles,
  anglesReducer,
  anglesResult,
  triOf,
  toMeasure,
  angleTex,
  thirdTex,
  thirdOf,
  drawnTex,
  SAYS,
  TRIS,
} from './angles';
import { ANGLES_TEXT } from './anglesText';
import { expose, texNum } from './inquiryParts';
import { withStory } from './strings';

export const BOX = Object.freeze({ w: 640, h: 320, pad: 46 });
const R_PRO = 70;
const R_NEEDLE = 94;
/**
 * The room the protractor takes beyond the triangles' box: its needle's handle (R_NEEDLE + its radius 11, and its
 * stroke) from a vertex `pad` away from the edge. The drawing's viewBox holds it, so the protractor stays inside the
 * figure's card (the walk of 2026-11-27: it spilled out of the card to the page's edge).
 */
export const PRO_ROOM = R_NEEDLE + 13 - BOX.pad;
const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;
const fmtDeg = (x) => `${String(x).replace('.', ',')}°`;

/** A triangle's corners in its own units (y up): vertex 0 at the origin, vertex 1 along +x. Null if it cannot close. */
function cornersOf(tri) {
  if (tri.between) {
    const [p, q] = tri.between.sides.map(approx);
    const t = toRad(approx(tri.between.angle));
    return [
      [0, 0],
      [p, 0],
      [q * Math.cos(t), q * Math.sin(t)],
    ];
  }
  if (!tri.closes) return null;
  const sin = tri.angles.map((x) => Math.sin(toRad(approx(x))));
  // law of sines: the side opposite vertex i is ∝ sin(angle i); the written side gives the unit
  const unit = tri.side != null ? approx(tri.side) / sin[tri.opp] : 1 / Math.max(...sin);
  const c = sin[2] * unit;
  const b = sin[1] * unit;
  const a0 = toRad(approx(tri.angles[0]));
  return [
    [0, 0],
    [c, 0],
    [b * Math.cos(a0), b * Math.sin(a0)],
  ];
}

/** How the triangle lies on the table: turned by `turn` degrees, then flipped (mirrored) when `flip`. */
function lay(points, { turn = 0, flip = false } = {}) {
  const t = toRad(turn);
  return points.map(([x, y]) => {
    const p = [x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t)];
    return flip ? [-p[0], p[1]] : p;
  });
}

/** Both triangles in the box's pixels (y down), each in its half, at ONE scale (their sizes compare). */
export function placeRound(round) {
  const tris = Object.fromEntries(TRIS.map((t) => [t, triOf(round, t)]));
  const raw = Object.fromEntries(
    TRIS.map((t) => {
      const c = cornersOf(tris[t]);
      return [t, c ? lay(c, round[t]) : null];
    }),
  );
  const half = BOX.w / 2;
  const boxOf = (ps) => {
    const xs = ps.map((p) => p[0]);
    const ys = ps.map((p) => p[1]);
    return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  };
  const scales = TRIS.filter((t) => raw[t]).map((t) => {
    const b = boxOf(raw[t]);
    return Math.min((half - 2 * BOX.pad) / (b.x1 - b.x0 || 1), (BOX.h - 2 * BOX.pad) / (b.y1 - b.y0 || 1));
  });
  const s = Math.min(...scales);
  const px = {};
  TRIS.forEach((t, k) => {
    if (!raw[t]) return;
    const b = boxOf(raw[t]);
    const cx = half * k + half / 2;
    const cy = BOX.h / 2;
    px[t] = raw[t].map(([x, y]) => [cx + s * (x - (b.x0 + b.x1) / 2), cy - s * (y - (b.y0 + b.y1) / 2)]);
  });
  return { tris, px };
}

/** The screen angle (degrees, y up) of the ray from p to q. */
const dirOf = (p, q) => toDeg(Math.atan2(-(q[1] - p[1]), q[0] - p[0]));
const norm = (d) => ((d % 360) + 360) % 360;
const at = (p, d, r) => [p[0] + r * Math.cos(toRad(d)), p[1] - r * Math.sin(toRad(d))];

/** The protractor's zero at vertex v: along the side from which the angle opens counter-clockwise on screen. */
export function zeroOf(pts, v) {
  const [u, w] = [0, 1, 2].filter((x) => x !== v);
  const du = dirOf(pts[v], pts[u]);
  const dw = dirOf(pts[v], pts[w]);
  return norm(dw - du) <= 180 ? du : dw;
}

/** The reading of a point of the screen, from the protractor at vertex v (0 to 180, unrounded). */
export function readingAt(pts, v, [x, y]) {
  const r = norm(dirOf(pts[v], [x, y]) - zeroOf(pts, v));
  return r <= 180 ? r : r > 270 ? 0 : 180;
}

/** The similarity that lays triangle a's pixels on b's (the ends of the written sides on each other): an SVG matrix. */
export function slideMatrix(pa, pb, map) {
  const [[a0, b0], [a1, b1]] = map;
  const third = (m) => [0, 1, 2].find((x) => x !== m[0][0] && x !== m[1][0]);
  const thirdB = [0, 1, 2].find((x) => x !== b0 && x !== b1);
  const P = [pa[a0], pa[a1]];
  const Q = [pb[b0], pb[b1]];
  const d = [P[1][0] - P[0][0], P[1][1] - P[0][1]];
  const e = [Q[1][0] - Q[0][0], Q[1][1] - Q[0][1]];
  const dd = d[0] * d[0] + d[1] * d[1] || 1;
  const make = (mirror) => {
    // z' = m·z + c (direct) or m·conj(z) + c (mirror), complex numbers on the screen's plane
    const dz = mirror ? [d[0], -d[1]] : d;
    const mr = (e[0] * dz[0] + e[1] * dz[1]) / dd;
    const mi = (e[1] * dz[0] - e[0] * dz[1]) / dd;
    const apply = ([x, y]) => (mirror ? [mr * x + mi * y, mi * x - mr * y] : [mr * x - mi * y, mi * x + mr * y]);
    const p0 = apply(P[0]);
    const c = [Q[0][0] - p0[0], Q[0][1] - p0[1]];
    const to = (z) => {
      const q = apply(z);
      return [q[0] + c[0], q[1] + c[1]];
    };
    const m = mirror ? [mr, mi, mi, -mr, c[0], c[1]] : [mr, mi, -mi, mr, c[0], c[1]];
    return { m, to };
  };
  const t = third(map);
  const [direct, mirror] = [make(false), make(true)];
  const gap = (x) => Math.hypot(x.to(pa[t])[0] - pb[thirdB][0], x.to(pa[t])[1] - pb[thirdB][1]);
  return (gap(direct) <= gap(mirror) ? direct : mirror).m;
}

/** The angle values shown at the vertices of triangle t: what he read, the third written, or what the world gives. */
function shownAngles(round, t, read) {
  const tri = triOf(round, t);
  if (tri.between) return { 0: tri.between.angle };
  if (toMeasure(round).includes(t)) {
    const out = Object.fromEntries(read.map((v) => [v, tri.angles[v]]));
    if (read.length === 2) out[thirdOf(read)] = tri.angles[thirdOf(read)];
    return out;
  }
  return Object.fromEntries(tri.angles.map((x, i) => [i, x]));
}

/** The world's wedges of a triangle that does not close: its angles laid side by side on a straight line. */
function Wedges({ tri, cx, cy }) {
  const r = 78;
  let from = 0;
  const parts = tri.angles.map((x) => {
    const a = approx(x);
    const part = { x, from, to: from + a };
    from += a;
    return part;
  });
  const wedge = (f, t) => {
    const [x0, y0] = at([cx, cy], f, r);
    const [x1, y1] = at([cx, cy], t, r);
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${t - f > 180 ? 1 : 0} 0 ${x1} ${y1} Z`;
  };
  return (
    <g data-iq-wedges>
      <line x1={cx - 130} y1={cy} x2={cx + 130} y2={cy} className="np-iq-ang__flat" />
      {parts.map((p, i) => (
        <path key={i} d={wedge(p.from, p.to)} className={`np-iq-ang__wedge is-${i}`} />
      ))}
      {from > 180 && <path d={wedge(180, from)} className="np-iq-ang__over" />}
      {parts.map((p, i) => {
        const [x, y] = at([cx, cy], (p.from + p.to) / 2, r + 34);
        return (
          <text key={i} x={x} y={y + 6} textAnchor="middle" className="np-iq-ang__deg">
            {fmtDeg(p.x)}
          </text>
        );
      })}
    </g>
  );
}

/** The box of a written angle (« 112° » at 18 px bold: ≈ 10,5 units a character) and of a vertex's name. */
const degBox = (text, [x, y]) => ({ x, y, w: [...text].length * 10.5 + 6, h: 22 });
const nameBox = ([x, y]) => ({ x, y: y + 1, w: 16, h: 22 });
const overlap = (a, b) => Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2;
/**
 * Where the angles of a triangle are written (centres): on each angle's bisector, at its usual distance — pushed further
 * along it, then to the outside of the vertex, until it stays in the box and overlaps neither an angle already written nor
 * a vertex's name
 * (the walk saw « 112° » on « 41° » in a long flat triangle). { [vertex]: [x, y] }.
 */
export function angleLabels(pts, angles) {
  const g = [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3];
  const names = pts.map((p) => {
    const v = [p[0] - g[0], p[1] - g[1]];
    const l = Math.hypot(...v) || 1;
    return nameBox([p[0] + (v[0] / l) * 18, p[1] + (v[1] / l) * 18]);
  });
  const placed = [];
  const out = {};
  for (const [i, x] of Object.entries(angles)) {
    const p = pts[i];
    const open = approx(x);
    const mid = zeroOf(pts, Number(i)) + open / 2;
    const base = Math.max(40, 54 - open / 6);
    const tries = [
      ...[0, 10, 20, 30, 40, 52, 64].map((d) => at(p, mid, base + d)),
      ...[34, 46, 58, 70].map((d) => at(p, mid + 180, d)),
    ];
    const free = tries.find((c) => {
      const b = degBox(fmtDeg(x), c);
      const inside = b.x - b.w / 2 >= 0 && b.x + b.w / 2 <= BOX.w && b.y - b.h / 2 >= 0 && b.y + b.h / 2 <= BOX.h;
      return inside && !placed.some((o) => overlap(b, o)) && !names.some((o) => overlap(b, o));
    });
    const c = free ?? tries[0];
    placed.push(degBox(fmtDeg(x), c));
    out[i] = c;
  }
  return out;
}

/** One triangle: its sides, its names, the angles shown, the written side(s) (in `unit`). */
function Tri({ tri, pts, angles, unit, sideShown, onPlace }) {
  const g = [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3];
  const out = (p, d) => {
    const v = [p[0] - g[0], p[1] - g[1]];
    const l = Math.hypot(...v) || 1;
    return [p[0] + (v[0] / l) * d, p[1] + (v[1] / l) * d];
  };
  const sideLabel = (i, j, text) => {
    const m = [(pts[i][0] + pts[j][0]) / 2, (pts[i][1] + pts[j][1]) / 2];
    const [x, y] = out(m, 20);
    return (
      <text key={`s${i}${j}`} x={x} y={y + 6} textAnchor="middle" className="np-iq-ang__len">
        {`${text}\u00a0${unit}`}
      </text>
    );
  };
  const labels = angleLabels(pts, angles);
  return (
    <g>
      <polygon points={pts.map((p) => p.join(',')).join(' ')} className="np-iq-ang__tri" />
      {pts.map((p, i) => {
        const [x, y] = out(p, 18);
        return (
          <g key={tri.names[i]}>
            <text x={x} y={y + 7} textAnchor="middle" className="np-iq-ang__name">
              {tri.names[i]}
            </text>
            {onPlace && <circle cx={p[0]} cy={p[1]} r={16} className="np-iq-ang__spot" onClick={() => onPlace(i)} />}
          </g>
        );
      })}
      {Object.entries(angles).map(([i, x]) => {
        const p = pts[i];
        const z = zeroOf(pts, Number(i));
        const open = approx(x);
        const [ax, ay] = labels[i];
        const [x0, y0] = at(p, z, 22);
        const [x1, y1] = at(p, z + open, 22);
        return (
          <g key={`a${i}`}>
            <path d={`M ${x0} ${y0} A 22 22 0 0 0 ${x1} ${y1}`} className="np-iq-ang__arc" />
            <text x={ax} y={ay + 6} textAnchor="middle" className="np-iq-ang__deg">
              {fmtDeg(x)}
            </text>
          </g>
        );
      })}
      {tri.between && [sideLabel(0, 1, tri.between.sides[0]), sideLabel(0, 2, tri.between.sides[1])]}
      {!tri.between &&
        sideShown &&
        tri.side != null &&
        (() => {
          const [i, j] = [0, 1, 2].filter((k) => k !== tri.opp);
          return sideLabel(i, j, tri.side);
        })()}
    </g>
  );
}

/** The protractor on vertex v: a half disc from the zero side, ticks every 10°, the needle at `needle` degrees. */
function Protractor({ pts, v, needle, onNeedle }) {
  const p = pts[v];
  const z = zeroOf(pts, v);
  const [s0x, s0y] = at(p, z, R_PRO);
  const [s1x, s1y] = at(p, z + 180, R_PRO);
  const [nx, ny] = at(p, z + needle, R_NEEDLE);
  const fromEvent = (e, magnet) => {
    const svg = e.currentTarget.ownerSVGElement ?? e.currentTarget;
    const ctm = svg.getScreenCTM?.();
    if (!ctm) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    onNeedle(readingAt(pts, v, [pt.x, pt.y]), magnet);
  };
  return (
    <g
      className="np-iq-ang__pro"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        fromEvent(e, false);
      }}
      onPointerMove={(e) => {
        if (e.buttons & 1) fromEvent(e, false);
      }}
      onPointerUp={(e) => fromEvent(e, true)}
    >
      <path d={`M ${s0x} ${s0y} A ${R_PRO} ${R_PRO} 0 0 0 ${s1x} ${s1y} Z`} className="np-iq-ang__disc" />
      {Array.from({ length: 19 }, (_, k) => {
        const d = k * 10;
        const [x0, y0] = at(p, z + d, R_PRO - (d % 30 === 0 ? 12 : 7));
        const [x1, y1] = at(p, z + d, R_PRO);
        return <line key={d} x1={x0} y1={y0} x2={x1} y2={y1} className="np-iq-ang__tick" />;
      })}
      <line x1={p[0]} y1={p[1]} x2={nx} y2={ny} className="np-iq-ang__needle" />
      <circle cx={nx} cy={ny} r={11} className="np-iq-ang__handle" />
    </g>
  );
}

/**
 * The two triangles of a round, apart. `read` = the vertices read per triangle; `at` / `needle` = the protractor;
 * `slid` = the slide's verdict (`angles.js › slideOf`), drawn as a's ghost laid on b.
 */
function AnglesFigure({ round, read = { a: [], b: [] }, at: on = null, needle = 0, slid = null, text, act }) {
  const T = text ?? ANGLES_TEXT;
  const { tris, px } = placeRound(round);
  const measuring = toMeasure(round);
  const matrix = slid && slid.fact !== 'open' && px.a && px.b ? slideMatrix(px.a, px.b, slid.map) : null;
  return (
    <svg
      viewBox={`${-PRO_ROOM} ${-PRO_ROOM} ${BOX.w + 2 * PRO_ROOM} ${BOX.h + 2 * PRO_ROOM}`}
      className="np-iq-ang__svg"
      role="img"
      aria-label={T.aria(tris.a.names.join(''), tris.b.names.join(''))}
    >
      <line x1={BOX.w / 2} y1={16} x2={BOX.w / 2} y2={BOX.h - 16} className="np-iq-ang__gap" />
      {TRIS.map((t) =>
        px[t] ? (
          <Tri
            key={t}
            tri={tris[t]}
            pts={px[t]}
            angles={shownAngles(round, t, read[t] ?? [])}
            unit={T.unit}
            sideShown
            onPlace={
              act && measuring.includes(t) && (read[t] ?? []).length < 2
                ? (v) => !(read[t] ?? []).includes(v) && act.place(t, v)
                : null
            }
          />
        ) : (
          <Wedges key={t} tri={tris[t]} cx={(BOX.w / 2) * (t === 'a' ? 0.5 : 1.5)} cy={BOX.h * 0.62} />
        ),
      )}
      {on && px[on.t] && (
        <Protractor pts={px[on.t]} v={on.v} needle={needle} onNeedle={(d, magnet) => act?.needle(d, magnet)} />
      )}
      {matrix && (
        <g
          className="np-iq-ang__ghost"
          style={{ '--np-slide': `matrix(${matrix.map((x) => x.toFixed(4)).join(',')})` }}
          data-iq-ghost={slid.fact}
        >
          <polygon points={px.a.map((p) => p.join(',')).join(' ')} vectorEffect="non-scaling-stroke" />
        </g>
      )}
    </svg>
  );
}

/** The world's line for triangle t: the angles he read, then the third with its three terms; or what it gives. */
function lineOf(round, t, read) {
  const tri = triOf(round, t);
  if (tri.between) return angleTex(tri.names[0], tri.between.angle);
  if (!toMeasure(round).includes(t)) return drawnTex(tri);
  const parts = read.map((v) => angleTex(tri.names[v], tri.angles[v]));
  if (read.length === 2) parts.push(thirdTex(tri, read));
  return parts.join(' \\;;\\; ');
}

export function AnglesView({ spec, state: s, act }) {
  const T = withStory(ANGLES_TEXT, spec.text);
  const r = spec.rounds[s.i];
  const tris = Object.fromEntries(TRIS.map((t) => [t, triOf(r, t)]));
  const name = (t) => tris[t].names.join('');
  const row = s.stage === 'slid' ? s.rows.at(-1) : null;
  // the protractor's instruction only while there is something to measure; then the place alone (gate B, 2026-11-27)
  const measured = r.measure && s.stage !== 'measure';
  const lead = !r.measure
    ? T.leadGiven
    : measured
      ? r.drawn
        ? T.leadDrawnDone
        : T.leadDone
      : r.drawn
        ? T.leadDrawn(name('a'))
        : T.lead;
  const open = toMeasure(r).filter((t) => s.read[t].length < 2);
  // the sum of the angles of the block that cannot close (« 225° ≠ 180° » beside the world's fact)
  const openSum = TRIS.map((t) => tris[t]).find((x) => !x.between && !x.closes)?.sum ?? null;
  return (
    <section
      className="np-iq np-iq--angles"
      data-iq="angles"
      data-iq-stage={s.stage}
      data-iq-round={s.i}
      data-iq-at={s.at ? tris[s.at.t].names[s.at.v] : ''}
    >
      <p className="np-iq__lead">
        <MathText>{lead}</MathText>
      </p>
      <div className="np-iq__row">
        <div className="np-iq-ang__fig">
          <AnglesFigure
            round={r}
            read={s.read}
            at={s.at}
            needle={s.needle}
            slid={s.stage === 'slid' ? s.slid : null}
            text={T}
            act={s.stage === 'measure' ? act : null}
          />
          <div className="np-iq-ang__lines">
            {TRIS.map((t) => {
              const tex = lineOf(r, t, s.read[t]);
              const third = s.read[t].length === 2 ? tris[t].angles[thirdOf(s.read[t])] : '';
              return (
                // nothing read yet: the line stays empty (a name alone, « ABC », read as a label of nothing)
                <p key={t} className="np-iq__chain" data-iq-line={t} data-iq-third={third}>
                  {tex && (
                    <>
                      <b>{name(t)}</b> <M>{tex}</M>
                    </>
                  )}
                </p>
              );
            })}
          </div>
        </div>
        <div className="np-iq__side">
          {s.stage === 'measure' && (
            <>
              {open.map((t) => (
                <div key={t} className="np-iq-ang__pick">
                  <p className="np-iq__ask">
                    <MathText>{T.pick(name(t))}</MathText>
                  </p>
                  <div className="np-iq__choices">
                    {tris[t].names.map((n, v) =>
                      s.read[t].includes(v) ? null : (
                        <button
                          key={n}
                          type="button"
                          className={`rf-btn ${s.at?.t === t && s.at.v === v ? 'is-on' : ''}`}
                          onClick={() => act.place(t, v)}
                          data-iq-vertex={n}
                          data-iq-tri={t}
                        >
                          <M>{`\\widehat{${n}}`}</M>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              ))}
              {s.at && (
                <div className="np-iq-ang__dial">
                  <p className="np-iq__ask">{T.needle}</p>
                  <div className="np-iq__choices" dir="ltr">
                    {[-10, -1].map((d) => (
                      <button key={d} type="button" className="rf-btn" onClick={() => act.turn(d)} data-iq-turn={d}>
                        {d === -10 ? '«' : '‹'}
                      </button>
                    ))}
                    <b className="np-iq__angle" data-iq-reading={s.needle} title={T.reading}>
                      {fmtDeg(s.needle)}
                    </b>
                    {[1, 10].map((d) => (
                      <button key={d} type="button" className="rf-btn" onClick={() => act.turn(d)} data-iq-turn={d}>
                        {d === 10 ? '»' : '›'}
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={180}
                    step={1}
                    value={s.needle}
                    onChange={(e) => act.needle(Number(e.target.value), false)}
                    aria-label={T.ariaNeedle}
                    className="np-iq-ang__range"
                    data-iq-needle
                  />
                  <button type="button" className="rf-btn rf-btn--main" onClick={act.read} data-iq-read>
                    {T.read}
                  </button>
                  {s.off && (
                    <p className="np-iq__fact is-gap" data-iq-off>
                      {T.off}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
          {s.stage === 'predict' && (
            <>
              <p className="np-iq__ask">{T.ask}</p>
              <div className="np-iq__choices">
                {SAYS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`rf-btn ${s.said === v ? 'is-on' : ''}`}
                    onClick={() => act.say(v)}
                    data-iq-say={v}
                  >
                    {T.say[v]}
                  </button>
                ))}
              </div>
              <button type="button" className="rf-btn rf-btn--main" onClick={act.slide} data-iq-slide>
                {T.slide}
              </button>
            </>
          )}
          {row && (
            <div className="np-iq__out" data-iq-verdict={row.fact}>
              <p
                className={`np-iq__fact ${row.right ? 'is-fits' : 'is-gap'}`}
                data-iq-fact={row.right ? 'hit' : 'miss'}
              >
                {row.right ? T.hit : T.miss}
              </p>
              {row.quotient && row.fact !== 'open' && (
                <p className="np-iq__chain">
                  <MathText>
                    {T.slideOf(name('a'), name('b'), texNum(row.quotient[0]), texNum(row.quotient[1]))}
                  </MathText>
                </p>
              )}
              {row.fact === 'open' && openSum && (
                <p className="np-iq__chain" data-iq-open-sum>
                  <M>{`${texNum(openSum)}^\\circ \\neq 180^\\circ`}</M>
                </p>
              )}
              <p className={`np-iq__fact ${row.fact === 'covers' ? 'is-fits' : 'is-gap'}`}>{T.fact[row.fact]}</p>
              <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
                {T.next}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function Angles({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => anglesReducer(spec, s, a), spec, initAngles);
  expose({ kind: 'angles', ...state });
  // ← → turn the needle by one degree while the protractor lies on a vertex
  useEffect(() => {
    if (!state.at) return undefined;
    const onKey = (e) => {
      if (e.code !== 'ArrowLeft' && e.code !== 'ArrowRight') return;
      if (e.target?.tagName === 'INPUT') return; // the range input moves itself
      e.preventDefault();
      play('lane');
      dispatch({ type: 'turn', d: e.code === 'ArrowRight' ? 1 : -1 });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.at]); // eslint-disable-line react-hooks/exhaustive-deps
  const act = {
    place(t, v) {
      play('pick');
      dispatch({ type: 'place', t, v });
    },
    needle(deg, magnet) {
      dispatch({ type: 'needle', deg, magnet });
    },
    turn(d) {
      play('lane');
      dispatch({ type: 'turn', d });
    },
    read() {
      const after = anglesReducer(spec, state, { type: 'read' });
      play(after.off ? 'plank' : 'gate');
      dispatch({ type: 'read' });
    },
    say(v) {
      play('pick');
      dispatch({ type: 'say', v });
    },
    slide() {
      const after = anglesReducer(spec, state, { type: 'slide' });
      if (after.stage === 'slid') play(after.slid.fact === 'covers' ? 'gate' : 'plank');
      dispatch({ type: 'slide' });
    },
    next() {
      const after = anglesReducer(spec, state, { type: 'next' });
      if (after.done) onDone(anglesResult(after));
      else {
        play('ui');
        dispatch({ type: 'next' });
      }
    },
  };
  return <AnglesView spec={spec} state={state} act={act} />;
}
