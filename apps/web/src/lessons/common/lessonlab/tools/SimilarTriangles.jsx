/**
 * « Les deux triangles » — two triangles APART: ABC (AB = a and AC = b, the shared numbers; BC = c, whole, set by the hand on
 * the vertex C) and DEF, built at the angle of A from two sides k × a and k × s (`similar.js`). The hand changes k (« − » /
 * « + »), slides the vertex at the end of the second side (s, whole), turns DEF by 30°, flips it, and moves its names round.
 * The drawing reads, all computed exactly: the lengths on the sides, the angles (one colour per angle of ABC; an angle of
 * DEF takes that colour only when it is EXACTLY equal to it), the three quotients of the sides ranked from the shortest,
 * then linked by the names, written « 7,5 ÷ 5 » and never evaluated, with « = » or « ≠ » between them; and DEF set to the
 * size of ABC and laid on it along its longest side: it covers ABC exactly, or its third vertex lands elsewhere.
 * Facts only (LESSON_LAB.md §2): no rule is written, no word of the lesson's tablets; it reports only after the hand moved.
 * `start` ({ c, ki, s, rot, flip, names, moved }) is the state on opening — the render test draws it with it.
 */
import { useEffect, useRef, useState } from 'react';
import { useDrag, useChime, Tool } from '../kit';
import { SIM_K, cRange, sRange, cStart, similarOf, decimalOf, frac } from '../similar';

const BOX = [
  { x: 20, y: 30, w: 420, h: 196 },
  { x: 500, y: 30, w: 420, h: 196 },
];
const INK1 = '#7dfcff';
const INK2 = '#fde68a';
/** One colour per angle of ABC; an angle of DEF wears it only when it is exactly equal. */
const ANGLE_INK = { A: '#f9a8d4', B: '#86efac', C: '#c4b5fd' };
const DIM = 'rgba(234,252,255,.35)';
const HAT = { A: 'Â', B: 'B̂', C: 'Ĉ', D: 'D̂', E: 'Ê', F: 'F̂' };
const CELLS = [330, 560, 790];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const sub = (p, q) => ({ x: p.x - q.x, y: p.y - q.y });

/** The third vertex of a triangle on the base P → Q, at distances d0 from P and d1 from Q, on the side of `towards`. */
function apexOn(P, Q, d0, d1, towards) {
  const u = sub(Q, P);
  const L = Math.hypot(u.x, u.y);
  const x = (d0 * d0 - d1 * d1 + L * L) / (2 * L);
  const h = Math.sqrt(Math.max(0, d0 * d0 - x * x));
  const n = { x: -u.y / L, y: u.x / L };
  const t = sub(towards, P);
  const side = n.x * t.x + n.y * t.y >= 0 ? 1 : -1;
  return { x: P.x + (u.x * x) / L + side * n.x * h, y: P.y + (u.y * x) / L + side * n.y * h };
}

/** The whole drawing in metres, then in the boxes: ABC, DEF turned / flipped, and DEF laid on ABC (float, drawing only). */
export function simLayout(a, b, c, ki, s, rot, flip, S) {
  const [kn, kd] = SIM_K[ki];
  const k = kn / kd;
  const cosA = (a * a + b * b - c * c) / (2 * a * b);
  const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  const m1 = { A: { x: 0, y: 0 }, B: { x: a, y: 0 }, C: { x: b * cosA, y: b * sinA } };
  // DEF in its own frame: P0 at the angle of A, P1 along the first side, P2 at the end of the second; flipped, then turned
  const th = (rot * Math.PI) / 6;
  const place = ({ x, y }) => {
    const yy = flip ? -y : y;
    return { x: x * Math.cos(th) - yy * Math.sin(th), y: x * Math.sin(th) + yy * Math.cos(th) };
  };
  const p = [place({ x: 0, y: 0 }), place({ x: k * a, y: 0 }), place({ x: k * s * cosA, y: k * s * sinA })];
  const m2 = Object.fromEntries(S.t2.labels.map((l, i) => [l, p[i]]));
  // DEF laid on ABC: the vertex opposite each ranked side of DEF on the vertex opposite the same ranked side of ABC
  const o1 = S.ranked.map((r) => S.t1.opp[r.t1]);
  const o2 = S.ranked.map((r) => S.t2.opp[r.t2]);
  const len2 = (n) => S.t2.sides[n].value;
  const lam = S.t1.sides[S.ranked[2].t1].value / len2(S.ranked[2].t2);
  const ghostApex = S.same
    ? m1[o1[2]]
    : apexOn(m1[o1[0]], m1[o1[1]], lam * len2(S.ranked[1].t2), lam * len2(S.ranked[0].t2), m1[o1[2]]);
  const ghost = { [o2[0]]: m1[o1[0]], [o2[1]]: m1[o1[1]], [o2[2]]: ghostApex };
  // one scale for both boxes: ABC and what is laid on it in the first; DEF, whatever its turn, in the second (its width
  // in any direction is at most its longest side)
  const pts1 = [...Object.values(m1), ghostApex];
  const bb = (pts) => {
    const xs = pts.map((q) => q.x);
    const ys = pts.map((q) => q.y);
    return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  };
  const b1 = bb(pts1);
  const L2 = Math.max(...Object.values(S.t2.sides).map((x) => x.value));
  const sc =
    0.84 *
    Math.min(
      BOX[0].w / Math.max(b1.x1 - b1.x0, 1e-9),
      BOX[0].h / Math.max(b1.y1 - b1.y0, 1e-9),
      BOX[1].h / L2,
      BOX[1].w / L2,
    );
  const b2 = bb(p);
  const to = (box, bx) => (q) => ({
    x: box.x + box.w / 2 + sc * (q.x - (bx.x0 + bx.x1) / 2),
    y: box.y + box.h / 2 - sc * (q.y - (bx.y0 + bx.y1) / 2),
  });
  const f1 = to(BOX[0], b1);
  const f2 = to(BOX[1], b2);
  const map = (o, f) => Object.fromEntries(Object.entries(o).map(([n, q]) => [n, f(q)]));
  return { sc, k, t1: map(m1, f1), t2: map(m2, f2), ghost: map(ghost, f1), P0: f2(p[0]), P2: f2(p[2]) };
}

const fmt = (x) => x.toFixed(2);
const poly = (pts) => pts.map((q) => `${fmt(q.x)},${fmt(q.y)}`).join(' ');
const centre = (pts) => ({
  x: pts.reduce((t, q) => t + q.x, 0) / pts.length,
  y: pts.reduce((t, q) => t + q.y, 0) / pts.length,
});
/** A point pushed away from the centre of its triangle by d. */
const out = (q, g, d) => {
  const v = sub(q, g);
  const n = Math.hypot(v.x, v.y) || 1;
  return { x: q.x + (v.x / n) * d, y: q.y + (v.y / n) * d };
};
/** The small arc of an angle at V between the rays to P and Q. */
function arc(V, P, Q, r) {
  const u = sub(P, V);
  const v = sub(Q, V);
  const nu = Math.hypot(u.x, u.y) || 1;
  const nv = Math.hypot(v.x, v.y) || 1;
  const s0 = { x: V.x + (u.x / nu) * r, y: V.y + (u.y / nu) * r };
  const s1 = { x: V.x + (v.x / nv) * r, y: V.y + (v.y / nv) * r };
  const sweep = u.x * v.y - u.y * v.x > 0 ? 1 : 0;
  return `M ${fmt(s0.x)} ${fmt(s0.y)} A ${r} ${r} 0 0 ${sweep} ${fmt(s1.x)} ${fmt(s1.y)}`;
}

/** One triangle drawn: its sides and their lengths, its angles, its letters. */
function Triangle({ pts, sides, names, ink, angleInk, id }) {
  const g = centre(names.map((n) => pts[n]));
  return (
    <g data-ll-sim-tri={id}>
      <polygon
        points={poly(names.map((n) => pts[n]))}
        fill={id === 't1' ? 'rgba(125,252,255,.10)' : 'rgba(253,230,138,.12)'}
        stroke={ink}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {names.map((n) => {
        const [p, q] = names.filter((x) => x !== n);
        return (
          <path
            key={`arc-${n}`}
            d={arc(pts[n], pts[p], pts[q], 16)}
            fill="none"
            stroke={angleInk(n)}
            strokeWidth="4"
            data-ll-sim-angle={n}
            data-ink={angleInk(n) === DIM ? 'none' : 'match'}
          />
        );
      })}
      {Object.entries(sides).map(([nm, L]) => {
        const mid = centre([pts[nm[0]], pts[nm[1]]]);
        const at = out(mid, g, 16);
        return (
          <text
            key={nm}
            x={fmt(at.x)}
            y={fmt(at.y + 6)}
            textAnchor="middle"
            fontSize="16"
            style={{ fill: ink }}
            data-ll-sim-side={nm}
          >
            {L.text}
          </text>
        );
      })}
      {names.map((n) => {
        const at = out(pts[n], g, 20);
        return (
          <text key={n} x={fmt(at.x)} y={fmt(at.y + 7)} textAnchor="middle" fontSize="20" fontWeight="900">
            {n}
          </text>
        );
      })}
    </g>
  );
}

export default function SimilarTriangles({ a, b, play, report, start = null }) {
  const key = `${a}:${b}`;
  const svg = useRef(null);
  const first = { c: cStart(a, b), ki: 5, s: b, rot: 2, flip: false, names: 0 };
  const [st, setSt] = useState(() => ({ key, ...first, ...(start ?? {}) }));
  const [moved, setMoved] = useState(Boolean(start?.moved));
  // a new pair of numbers starts a new triangle ABC: the second one comes back as ABC × k
  const cur = st.key === key ? st : { key, ...first, ki: st.ki, rot: st.rot, flip: st.flip, names: st.names };
  const [clo, chi] = cRange(a, b);
  const [slo, shi] = sRange(a, b);
  const c = clamp(cur.c, clo, chi);
  const s = clamp(cur.s, slo, shi);
  const ki = clamp(cur.ki, 0, SIM_K.length - 1);
  const { rot, flip, names } = cur;
  const S = similarOf(a, b, c, ki, s, names);
  const G = simLayout(a, b, c, ki, s, rot, flip, S);

  useEffect(() => {
    if (moved) report({ key, moved, c, ki, s, rot, flip, names });
  }, [moved, key, c, ki, s, rot, flip, names]); // eslint-disable-line react-hooks/exhaustive-deps
  useChime(play, S.same ? 'fit' : 'rest', moved, [S.same], { delay: 140 });

  const set = (patch) => {
    setMoved(true);
    setSt({ key, c, ki, s, rot, flip, names, ...patch });
  };
  const setC = (v) => {
    const next = clamp(v, clo, chi);
    if (next !== c) play('tick', next);
    set({ c: next });
  };
  const setS = (v) => {
    const next = clamp(v, slo, shi);
    if (next !== s) play('tick', next);
    set({ s: next });
  };
  const setK = (v) => {
    const next = clamp(v, 0, SIM_K.length - 1);
    if (next !== ki) play('select', next);
    set({ ki: next });
  };
  // a drag reads the pointer in the frame of its start: the drawing re-centres while the hand moves, the hand does not
  const dragC = useDrag(svg, {
    onStart: () => ({ A: G.t1.A }),
    onMove: (p, live) => {
      const A = live.data.A;
      const th = clamp(Math.atan2(A.y - p.y, p.x - A.x), 0.02, Math.PI - 0.02);
      setC(Math.round(Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(th))));
    },
  });
  const dragS = useDrag(svg, {
    onStart: () => {
      const d = sub(G.P2, G.P0);
      const n = Math.hypot(d.x, d.y) || 1;
      return { P0: G.P0, u: { x: d.x / n, y: d.y / n }, unit: G.sc * G.k };
    },
    onMove: (p, live) => {
      const { P0, u, unit } = live.data;
      const v = sub(p, P0);
      setS(Math.round((v.x * u.x + v.y * u.y) / unit));
    },
  });
  const keys = (fn, v) => (e) => {
    const step =
      e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    fn(v + step);
  };

  const ink1 = (n) => ANGLE_INK[n];
  const ink2 = (n) => {
    const hit = S.equalAngles.find(([, v2]) => v2 === n);
    return hit ? ANGLE_INK[hit[0]] : DIM;
  };
  const kText = decimalOf(frac(SIM_K[ki][0], SIM_K[ki][1]));
  const P2name = S.t2.labels[2];
  const quot = (p) => `${S.t2.sides[p.t2].text} ÷ ${S.t1.sides[p.t1].text}`;
  const row = (pairs, eqs, y, caption, label, id) => (
    <g data-ll-sim-row={id}>
      <text x="20" y={y} fontSize="17" style={{ fill: '#a5f3fc' }}>
        {label}
      </text>
      {pairs.map((p, i) => (
        <g key={i}>
          <text x={CELLS[i]} y={y - 22} textAnchor="middle" fontSize="13" style={{ fill: '#a5f3fc' }}>
            {caption(p, i)}
          </text>
          <text x={CELLS[i]} y={y} textAnchor="middle" fontSize="19" data-ll-sim-quot={`${id}-${i}`}>
            {quot(p)}
          </text>
        </g>
      ))}
      {eqs.map((eq, i) => (
        <text
          key={`m${i}`}
          x={(CELLS[i] + CELLS[i + 1]) / 2}
          y={y}
          textAnchor="middle"
          fontSize="24"
          fontWeight="900"
          style={{ fill: eq ? '#34d399' : '#fbbf24' }}
          data-ll-sim-mark={`${id}-${i}`}
          data-eq={eq ? 'yes' : 'no'}
        >
          {eq ? '=' : '≠'}
        </text>
      ))}
    </g>
  );
  const angles = (tri, letters, x, id) => (
    <text x={x} y="356" fontSize="17" data-ll-sim-angles={id}>
      {letters.map((n, i) => (
        <tspan key={n} style={{ fill: id === 't1' ? ink1(n) : ink2(n) === DIM ? '#eafcff' : ink2(n) }}>
          {`${i ? ' ; ' : ''}${HAT[n]} ${tri.angles[n].text}`}
        </tspan>
      ))}
    </text>
  );
  const ghostNames = Object.keys(G.ghost);

  return (
    <Tool
      id="similar"
      tone={S.same && moved ? 'good' : 'plain'}
      actions={
        <>
          <button
            type="button"
            className="ll-btn ll-btn--ghost"
            onClick={() => setK(ki - 1)}
            disabled={ki === 0}
            aria-label="Rapetisser DEF"
            data-ll-sim-smaller
          >
            −
          </button>
          <span className="ll-chip ll-chip--dim" data-ll-sim-k={kText}>
            {`× ${kText}`}
          </span>
          <button
            type="button"
            className="ll-btn ll-btn--ghost"
            onClick={() => setK(ki + 1)}
            disabled={ki === SIM_K.length - 1}
            aria-label="Grandir DEF"
            data-ll-sim-bigger
          >
            +
          </button>
          <button
            type="button"
            className="ll-btn ll-btn--ghost"
            onClick={() => {
              play('hop', rot + 1);
              set({ rot: (rot + 1) % 12 });
            }}
            data-ll-sim-turn
          >
            Tourner
          </button>
          <button
            type="button"
            className="ll-btn ll-btn--ghost"
            onClick={() => {
              play('swap');
              set({ flip: !flip });
            }}
            data-ll-sim-flip
          >
            Retourner
          </button>
          <button
            type="button"
            className="ll-btn ll-btn--ghost"
            onClick={() => {
              play('swap');
              set({ names: (names + 1) % 3 });
            }}
            data-ll-sim-names
          >
            Noms
          </button>
        </>
      }
      reading={
        <span
          className={`ll-chip ${S.same ? 'll-chip--good' : 'll-chip--dim'}`}
          data-ll-sim-verdict={S.same ? 'covers' : 'misses'}
        >
          {S.same ? 'Posé sur ABC : il le recouvre exactement' : 'Posé sur ABC : il ne le recouvre pas'}
        </span>
      }
    >
      <svg
        ref={svg}
        viewBox="0 0 940 370"
        data-ll-similar={key}
        data-c={c}
        data-k={kText}
        data-s={s}
        data-rot={rot * 30}
        data-flip={flip ? 'yes' : 'no'}
        data-names={S.t2.labels.join('')}
        data-same={S.same ? 'yes' : 'no'}
        data-size={S.size ?? 'none'}
      >
        <text x={BOX[0].x} y="20" fontSize="15" style={{ fill: '#a5f3fc' }}>
          ABC
        </text>
        <text x={BOX[1].x} y="20" fontSize="15" style={{ fill: '#a5f3fc' }}>
          {`DEF — fais glisser ${P2name}`}
        </text>
        {/* DEF set to the size of ABC and laid on it: drawn under ABC's letters, dashed */}
        <polygon
          points={poly(ghostNames.map((n) => G.ghost[n]))}
          fill={S.same ? 'rgba(52,211,153,.22)' : 'none'}
          stroke={S.same ? '#34d399' : INK2}
          strokeWidth="3"
          strokeDasharray="8 6"
          data-ll-sim-laid={S.same ? 'covers' : 'misses'}
        />
        <Triangle pts={G.t1} sides={S.t1.sides} names={['A', 'B', 'C']} ink={INK1} angleInk={ink1} id="t1" />
        <Triangle pts={G.t2} sides={S.t2.sides} names={S.t2.labels} ink={INK2} angleInk={ink2} id="t2" />
        {/* the vertex C of ABC: the hand opens and closes the angle of A, BC stays a whole number */}
        <g
          className="ll-handle"
          {...dragC}
          tabIndex={0}
          role="slider"
          aria-label="Le sommet C"
          aria-valuenow={c}
          aria-valuemin={clo}
          aria-valuemax={chi}
          onKeyDown={keys(setC, c)}
          data-ll-sim-handle="C"
        >
          {!moved && <circle className="ll-pulse" cx={fmt(G.t1.C.x)} cy={fmt(G.t1.C.y)} r="20" fill="#fbbf24" />}
          <circle cx={fmt(G.t1.C.x)} cy={fmt(G.t1.C.y)} r="11" fill={INK1} stroke="#06262c" strokeWidth="3" />
        </g>
        {/* the far vertex of DEF's second side: it slides along that side, the angle at its first vertex stays */}
        <g
          className="ll-handle"
          {...dragS}
          tabIndex={0}
          role="slider"
          aria-label={`Le sommet ${P2name}`}
          aria-valuenow={s}
          aria-valuemin={slo}
          aria-valuemax={shi}
          onKeyDown={keys(setS, s)}
          data-ll-sim-handle="far"
        >
          <circle cx={fmt(G.P2.x)} cy={fmt(G.P2.y)} r="11" fill={INK2} stroke="#06262c" strokeWidth="3" />
        </g>
        {row(S.ranked, S.rankedEq, 274, (p, i) => ['le plus court', 'le moyen', 'le plus long'][i], 'rangés', 'ranked')}
        {row(S.named, S.namedEq, 322, (p) => `${p.t2} ÷ ${p.t1}`, 'par les noms', 'named')}
        {angles(S.t1, ['A', 'B', 'C'], 20, 't1')}
        {angles(S.t2, [...S.t2.labels].sort(), 500, 't2')}
      </svg>
    </Tool>
  );
}
