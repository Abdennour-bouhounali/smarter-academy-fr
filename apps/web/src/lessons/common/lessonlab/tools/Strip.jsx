/**
 * « La bande de la fraction » — a fraction of the student's own: a strip of b cells (the denominator) with its first a cells lit (the
 * numerator), and a piece of length k the hand drags along a ruler (or ± / arrows). The pieces are laid from 0 along the
 * whole strip (`logic.js › stripOf`): their joints, the piece INSIDE which the light ends when k does not divide a, what
 * is left at the end of the strip when k does not divide b. Only when k divides both does the strip regroup — the lit
 * pieces and the dark ones counted — and the fraction is written again in pieces: a/b = (a ÷ k)/(b ÷ k). The last twelve
 * lengths tried on this fraction stay as chips, coloured by what they did.
 * It draws facts and never concludes: no word of what a fraction « is » when no piece but 1 fits, nothing about the
 * longest piece. It does nothing on its own and reports only after the hand moved the piece.
 * `start` ({ k, tried }) is the state on opening — the render test draws it with it.
 */
import { useEffect, useRef, useState } from 'react';
import { VW, useDrag, useChime, Tool, M } from '../kit';
import { stripOf } from '../logic';

const X0 = 150;
const X1 = 905;
const RULER_Y = 70;
const STRIP_Y = 150;
const STRIP_H = 40;
/** Joints drawn one by one up to this many pieces; beyond, the pieces are one bar and only the joint at the light shows. */
const JOINTS_MAX = 120;
const SOUND = { both: 'fit', none: 'rest', a: 'short', b: 'short' };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const eq = (n, k, { q, r }) => `${n} = ${k} × ${q}${r ? ` + ${r}` : ''}`;
const eqTex = (n, k, { q, r }) => `${n} = ${k} \\times ${q}${r ? ` + ${r}` : ''}`;

/** A fraction drawn with its bar: numerator above, denominator below, centred on x. */
const Frac = ({ x, y, n, d, tone, id }) => {
  const w = Math.max(String(n).length, String(d).length) * 17 + 14;
  return (
    <g data-ll-strip-frac={id} data-n={n} data-d={d}>
      <text x={x} y={y - 10} textAnchor="middle" fontSize="28" fontWeight="900" style={{ fill: tone }}>
        {n}
      </text>
      <line x1={x - w / 2} y1={y} x2={x + w / 2} y2={y} stroke={tone} strokeWidth="3" strokeLinecap="round" />
      <text x={x} y={y + 30} textAnchor="middle" fontSize="28" fontWeight="900" style={{ fill: tone }}>
        {d}
      </text>
    </g>
  );
};

export default function Strip({ a, b, play, report, start = null }) {
  const key = `${a}:${b}`;
  const svg = useRef(null);
  const big = Math.max(a, b, 1);
  const kMax = Math.max(2, big);
  const [st, setSt] = useState({ key, k: start?.k ?? 2, tried: start?.tried ?? [] });
  const [moved, setMoved] = useState(false);
  // new numbers start a new sheet: the lengths tried belong to the fraction they were tried on
  const cur = st.key === key ? st : { key, k: st.k, tried: [] };
  const k = clamp(cur.k, 2, kMax);
  const S = stripOf(a, b, k);

  useEffect(() => {
    if (moved) report({ key, k, moved });
  }, [moved, key, k]); // eslint-disable-line react-hooks/exhaustive-deps
  // in both: the one chime of a fit; in neither: the soft rest; in one only: the short one
  useChime(play, SOUND[S.verdict], moved, [k, key]);

  const toK = (nk, record) => {
    const v = clamp(nk, 2, kMax);
    setMoved(true);
    if (v !== k) play('tick', v);
    const tried = record && !cur.tried.includes(v) ? [...cur.tried, v].slice(-12) : cur.tried;
    setSt({ ...cur, k: v, tried });
  };
  const u = (X1 - X0) / Math.max(1, kMax - 2);
  const xOfK = (v) => X0 + (v - 2) * u;
  const drag = useDrag(svg, {
    onStart: (p) => toK(Math.round((p.x - X0) / u) + 2, false),
    onMove: (p) => toK(Math.round((p.x - X0) / u) + 2, false),
    onEnd: () => toK(k, true),
  });

  // the strip: one cell = w; the lit part from 0 to a, the strip's end at b (a may pass it: a fraction above 1)
  const w = (X1 - X0) / big;
  const xOf = (cells) => X0 + cells * w;
  const both = S.verdict === 'both';
  const many = S.pieces > JOINTS_MAX;
  const joints = many ? [] : Array.from({ length: S.pieces - 1 }, (_, i) => (i + 1) * k).filter((c) => c < big);
  const hk = xOfK(k);

  return (
    <Tool
      id="strip"
      tone={both && moved ? 'good' : 'plain'}
      actions={
        <>
          <button type="button" className="ll-btn ll-btn--ghost" onClick={() => toK(k - 1, true)} data-ll-strip-minus>
            −
          </button>
          <button type="button" className="ll-btn ll-btn--ghost" onClick={() => toK(k + 1, true)} data-ll-strip-plus>
            +
          </button>
        </>
      }
      reading={
        <>
          <M>{eqTex(a, k, S.lit)}</M>
          <M>{eqTex(b, k, S.whole)}</M>
          <span
            className={`ll-chip ${both ? 'll-chip--good' : S.verdict === 'none' ? 'll-chip--dim' : 'll-chip--warm'}`}
            data-ll-strip-verdict={S.verdict}
          >
            {both
              ? `${k} divise le numérateur et le dénominateur`
              : S.verdict === 'none'
                ? `${k} ne divise ni le numérateur ni le dénominateur`
                : `${k} divise seulement le ${S.verdict === 'a' ? 'numérateur' : 'dénominateur'}`}
          </span>
        </>
      }
    >
      <svg
        ref={svg}
        viewBox={`0 0 ${VW} 370`}
        data-ll-strip
        data-k={k}
        data-verdict={S.verdict}
        data-pieces={S.pieces}
        data-joints={many ? 'bar' : joints.length}
      >
        {/* the ruler: the length of the piece, from 2 to the longer of the two terms */}
        <line
          x1={X0}
          y1={RULER_Y}
          x2={X1}
          y2={RULER_Y}
          stroke="rgb(var(--w-ink) / 0.45)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <text x={X0} y={RULER_Y + 30} textAnchor="middle" fontSize="16" style={{ fill: 'rgb(var(--w-ink) / 0.6)' }}>
          2
        </text>
        <text x={X1} y={RULER_Y + 30} textAnchor="middle" fontSize="16" style={{ fill: 'rgb(var(--w-ink) / 0.6)' }}>
          {kMax}
        </text>
        <g
          className="ll-handle"
          {...drag}
          tabIndex={0}
          onKeyDown={(e) => {
            const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
            if (step) toK(k + step, true);
          }}
          data-ll-strip-handle
        >
          <rect x={X0 - 10} y={RULER_Y - 22} width={X1 - X0 + 20} height="44" fill="transparent" />
          {!moved && <circle className="ll-pulse" cx={hk} cy={RULER_Y} r="22" fill="rgb(var(--w-gold))" />}
          <circle cx={hk} cy={RULER_Y} r="13" fill="rgb(var(--w-gold))" stroke="#06262c" strokeWidth="3" />
          <text x={hk} y={RULER_Y - 26} textAnchor="middle" fontSize="20" style={{ fill: 'rgb(var(--w-gold-ink))' }}>
            {k}
          </text>
        </g>

        {/* the strip: the whole (b cells) dark, the lit part (a cells) light; the pieces of k laid along it */}
        <g data-ll-strip-bar data-a={a} data-b={b}>
          <rect
            x={X0}
            y={STRIP_Y}
            width={b * w}
            height={STRIP_H}
            rx="6"
            fill="rgb(var(--w-ground))"
            stroke="rgb(var(--w-cyan-ink) / 0.55)"
            strokeWidth="2"
          />
          <rect
            x={X0}
            y={STRIP_Y + 4}
            width={Math.max(2, a * w)}
            height={STRIP_H - 8}
            rx="4"
            fill={both ? 'rgb(var(--w-gold))' : 'rgb(var(--w-gold) / 0.75)'}
            data-ll-strip-lit={a}
          />
          {joints.map((c) => (
            <line
              key={c}
              x1={xOf(c)}
              y1={STRIP_Y - 6}
              x2={xOf(c)}
              y2={STRIP_Y + STRIP_H + 6}
              stroke={both ? 'rgb(var(--w-green-ink))' : 'rgb(var(--w-ink) / 0.7)'}
              strokeWidth={k * w >= 6 ? 2.5 : 1.2}
              data-ll-strip-joint={c}
            />
          ))}
          {/* the light ends INSIDE a piece: that piece outlined amber */}
          {S.cut && (
            <rect
              x={xOf(S.cut.from)}
              y={STRIP_Y - 8}
              width={Math.max(3, Math.min(S.cut.to, big) * w - S.cut.from * w)}
              height={STRIP_H + 16}
              rx="5"
              fill="none"
              stroke="rgb(var(--w-gold-ink))"
              strokeWidth="3"
              strokeDasharray="6 4"
              data-ll-strip-cut={`${S.cut.from}:${S.cut.to}`}
            />
          )}
          {/* what no whole piece covers at the end of the strip */}
          {S.left > 0 && (
            <rect
              x={xOf(b - S.left)}
              y={STRIP_Y + STRIP_H + 10}
              width={Math.max(3, S.left * w)}
              height="8"
              rx="3"
              fill="rgb(var(--w-gold))"
              data-ll-strip-left={S.left}
            />
          )}
          {/* the light ends ON a joint: a green mark */}
          {!S.cut && a < big && (
            <line
              x1={xOf(a)}
              y1={STRIP_Y - 12}
              x2={xOf(a)}
              y2={STRIP_Y + STRIP_H + 12}
              stroke="rgb(var(--w-green-ink))"
              strokeWidth="4"
              strokeLinecap="round"
              data-ll-strip-onjoint={a}
            />
          )}
          <text
            x={clamp(xOf(a), X0 + 20, X1 - 20)}
            y={STRIP_Y - 16}
            textAnchor="middle"
            fontSize="18"
            fontWeight="900"
            style={{ fill: 'rgb(var(--w-gold-ink))' }}
          >
            {a}
          </text>
          <text
            x={clamp(xOf(b), X0 + 20, X1 - 20)}
            y={STRIP_Y + STRIP_H + 40}
            textAnchor="middle"
            fontSize="18"
            fontWeight="900"
            style={{ fill: 'rgb(var(--w-cyan-ink))' }}
          >
            {b}
          </text>
        </g>

        {/* the fraction, and — only when k divides both — the same fraction written in pieces */}
        <Frac x={X0 + 40} y={278} n={a} d={b} tone="rgb(var(--w-ink))" id="cells" />
        {S.rewrite && (
          <g data-ll-strip-rewrite={`${S.rewrite[0]}/${S.rewrite[1]}`}>
            <text
              x={X0 + 100}
              y={288}
              textAnchor="middle"
              fontSize="28"
              fontWeight="900"
              style={{ fill: 'rgb(var(--w-green-ink))' }}
            >
              =
            </text>
            <Frac x={X0 + 170} y={278} n={S.rewrite[0]} d={S.rewrite[1]} tone="rgb(var(--w-green-ink))" id="pieces" />
            <text x={X0 + 400} y={286} textAnchor="middle" fontSize="17" style={{ fill: 'rgb(var(--w-green-ink))' }}>
              {`Morceaux de ${k} : ${S.rewrite[0]} allumés sur ${S.rewrite[1]}`}
            </text>
          </g>
        )}
        {many && (
          <text
            x={(X0 + X1) / 2}
            y={RULER_Y + 30}
            textAnchor="middle"
            fontSize="16"
            style={{ fill: 'rgb(var(--w-violet-ink))' }}
          >
            {`${S.pieces} morceaux`}
          </text>
        )}

        {/* the lengths already tried on this fraction, the first on the LEFT */}
        <g data-ll-strip-tried={cur.tried.join(',')}>
          {cur.tried.map((v, i) => {
            const t = stripOf(a, b, v).verdict;
            return (
              <g key={v}>
                <rect
                  x={X0 - 23 + i * 52}
                  y="326"
                  width="46"
                  height="30"
                  rx="8"
                  fill={
                    t === 'both'
                      ? 'rgb(var(--w-green-ink) / 0.14)'
                      : t === 'none'
                        ? 'rgb(var(--w-ground))'
                        : 'rgb(var(--w-gold-ink) / 0.18)'
                  }
                  stroke={
                    t === 'both'
                      ? 'rgb(var(--w-green-ink))'
                      : t === 'none'
                        ? 'rgb(var(--w-cyan-ink) / 0.4)'
                        : 'rgb(var(--w-gold-ink))'
                  }
                  strokeWidth="2"
                  data-ll-strip-tried-k={v}
                  data-verdict={t}
                />
                <text x={X0 + i * 52} y="347" textAnchor="middle" fontSize="17">
                  {v}
                </text>
              </g>
            );
          })}
        </g>
        <title>{`${eq(a, k, S.lit)} · ${eq(b, k, S.whole)}`}</title>
      </svg>
    </Tool>
  );
}
