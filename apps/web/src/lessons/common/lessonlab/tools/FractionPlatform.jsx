/**
 * « La plateforme de la fraction » — a court of the student's own: `a` whole tiles (the shared number a), each tile cut into q × q small
 * pieces (q = the shared number b, the denominator), and a rod of p/q laid from the court's corner — p is the HAND's: a
 * handle on a ruler marked in steps of 1/q (or « − / + », the arrows). The square platform built on the rod is drawn to
 * scale over the court: the band it leaves in amber, what it holds more in violet, green when it covers the court; its
 * small pieces are drawn when they are big enough to see. The panel COUNTS: the platform holds p × p pieces, the court
 * a × q × q (`logic.js › pieceOf`, integers only), and keeps the NEAREST rod the hand reached on this court
 * (`closerPiece`: the difference in tiles, far ÷ q², compared by multiplying across) — whatever the denominator.
 * Facts only: it never says why two counts can or cannot be equal, names no key of its lesson and writes no root. It does
 * nothing on its own and reports only after the hand moved the rod. `start` ({ p, best }) is the state on opening — the
 * render test draws it with it.
 */
import { useEffect, useRef, useState } from 'react';
import { useDrag, useChime, svgPoint, Tool, M } from '../kit';
import { closerPiece, pieceOf } from '../logic';
import { tiles } from '../../gameworld/rootCourts/strings';
import { counted } from '../../gameworld/kit/authoring/numbers';

/** The drawing's own frame (it shares the stage with the panel of counts). */
const VW = 560;
const VH = 370;
const R0 = 50;
const R1 = 520;
const RULER_Y = 34;
const X0 = 60;
const BOTTOM = 300;
const G = 210; // the longest side drawn: the court or the platform
const THIN = 3; // a band or an overhang thinner than this is drawn this wide: the counts say how much
const SOUND = { fits: 'fit', band: 'rest', jam: 'short' };
const TONE = { fits: 'rgb(var(--w-green-ink))', band: 'rgb(var(--w-gold-ink))', jam: 'rgb(var(--w-violet-ink))' };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
/**
 * A point of the pointer in THIS drawing's viewBox (560 × 370) — not the kit's default 940 × 370 (defects ledger D38: with
 * the default a drag lands on the wrong mark).
 */
export const piecePoint = (svg, e) => svgPoint(svg, e, VW, VH);
/** « 1 morceau », « 25 morceaux » — the counter's no-break space. */
const pieces = (n) => counted(n, ['morceau', 'morceaux']);
/** p/q in LaTeX: a fraction with its bar, or the whole number alone when q is 1. */
const fracTex = (p, q) => (q === 1 ? String(p) : `\\dfrac{${p}}{${q}}`);

/** A fraction drawn in the svg: numerator, a real bar, denominator — centred on x (a whole number when q is 1). */
function SvgFrac({ x, y, p, q, fill }) {
  if (q === 1)
    return (
      <text x={x} y={y + 12} textAnchor="middle" fontSize="20" fontWeight="800" style={{ fill }}>
        {p}
      </text>
    );
  const w = 13 * Math.max(String(p).length, String(q).length) + 8;
  return (
    <g data-ll-piece-rod={`${p}/${q}`}>
      <text x={x} y={y} textAnchor="middle" fontSize="18" fontWeight="800" style={{ fill }}>
        {p}
      </text>
      <line x1={x - w / 2} x2={x + w / 2} y1={y + 6} y2={y + 6} stroke={fill} strokeWidth="2" />
      <text x={x} y={y + 25} textAnchor="middle" fontSize="18" fontWeight="800" style={{ fill }}>
        {q}
      </text>
    </g>
  );
}

export default function FractionPlatform({ a, b, play, report, start = null }) {
  const q = Math.max(1, b);
  const svg = useRef(null);
  // the rod is kept as p/q: a new denominator keeps its length (p rescaled); a new court starts a new record
  const [st, setSt] = useState({ a, q, p: start?.p ?? q, best: start?.best ?? null });
  const [moved, setMoved] = useState(Boolean(start?.best));
  const sameCourt = st.a === a;
  const p0 = st.q === q ? st.p : Math.max(1, Math.round((st.p * q) / st.q));
  const best = sameCourt ? st.best : null;
  const pMax = pieceOf(a, q, 1).pMax;
  const p = clamp(p0, 1, pMax);
  const P = pieceOf(a, q, p);
  // the rod on screen counts as reached once the hand has moved — also when a new denominator rescaled it
  const cur = { p, q, far: P.far };
  const shown = moved && closerPiece(cur, best) ? cur : best;

  useEffect(() => {
    if (moved) report({ key: `${a}:${b}`, p, moved, best: shown });
  }, [moved, a, b, p, shown?.p, shown?.q]); // eslint-disable-line react-hooks/exhaustive-deps
  useChime(play, SOUND[P.verdict], moved, [p, q, a]);
  useChime(play, 'found', moved && shown === cur && P.far > 0, [shown?.p, shown?.q], { delay: 260 });

  const toP = (np) => {
    const v = clamp(np, 1, pMax);
    setMoved(true);
    if (v !== p) play('tick', v);
    const rec = { p: v, q, far: pieceOf(a, q, v).far };
    setSt({ a, q, p: v, best: closerPiece(rec, shown) ? rec : shown });
  };
  const xOfP = (v) => R0 + ((v - 1) * (R1 - R0)) / Math.max(1, pMax - 1);
  const pOfX = (x) => Math.round(((x - R0) * Math.max(1, pMax - 1)) / (R1 - R0)) + 1;
  const drag = useDrag(svg, {
    onStart: (pt) => toP(pOfX(pt.x)),
    onMove: (pt) => toP(pOfX(pt.x)),
    point: piecePoint,
  });

  // the court and the platform, to scale: u units a tile
  const side = Math.sqrt(a);
  const len = p / q;
  const u = G / Math.max(side, len, 1);
  const Sc = side * u;
  const Sp = len * u;
  // a sliver too thin to see is still drawn THIN wide: the drawing says « a band », the counts say how much
  const Sd = P.verdict === 'band' ? Math.min(Sp, Sc - THIN) : P.verdict === 'jam' ? Math.max(Sp, Sc + THIN) : Sp;
  const yc = BOTTOM - Sc;
  const yp = BOTTOM - Sd;
  const small = u / q; // the side of a small piece on screen
  const gridPath = (S, step, n) =>
    Array.from({ length: n }, (_, i) => (i + 1) * step)
      .filter((d) => d < S - 0.5)
      .map((d) => `M${X0 + d} ${BOTTOM - S}V${BOTTOM}M${X0} ${BOTTOM - d}H${X0 + S}`)
      .join('');
  // the ruler: a tick per step of 1/q when they are 5 units apart, the whole tiles always; a label every k tiles
  const stepX = (R1 - R0) / Math.max(1, pMax - 1);
  const wholes = Array.from({ length: Math.floor(pMax / q) + 1 }, (_, k) => k).filter((k) => k * q >= 1);
  const every = Math.max(1, Math.ceil(30 / (stepX * q)));
  const tone = TONE[P.verdict];
  const sign = P.diff === 0 ? '=' : P.diff < 0 ? '<' : '>';

  return (
    <Tool
      id="piece"
      tone={P.verdict === 'fits' && moved ? 'good' : 'plain'}
      actions={
        <>
          <button type="button" className="ll-btn ll-btn--ghost" onClick={() => toP(p - 1)} data-ll-piece-minus>
            −
          </button>
          <button type="button" className="ll-btn ll-btn--ghost" onClick={() => toP(p + 1)} data-ll-piece-plus>
            +
          </button>
        </>
      }
      reading={
        <>
          <M>{`${P.plat} ${sign} ${P.court}`}</M>
          <span
            className={`ll-chip ${P.verdict === 'fits' ? 'll-chip--good' : P.verdict === 'band' ? 'll-chip--warm' : 'll-chip--jam'}`}
            data-ll-piece-verdict={P.verdict}
          >
            {P.verdict === 'fits'
              ? 'La plateforme couvre exactement la salle'
              : P.verdict === 'band'
                ? `Il reste une bande : ${pieces(P.far)}`
                : `La plateforme dépasse de ${pieces(P.far)}`}
          </span>
        </>
      }
    >
      <div className="ll-court">
        <svg
          ref={svg}
          viewBox={`0 0 ${VW} ${VH}`}
          data-ll-piece={a}
          data-q={q}
          data-p={p}
          data-court={P.court}
          data-plat={P.plat}
          data-verdict={P.verdict}
          data-far={P.far}
        >
          {/* the ruler: the rod's length, in steps of 1/q; the whole tiles labelled */}
          <line
            x1={R0}
            y1={RULER_Y}
            x2={R1}
            y2={RULER_Y}
            stroke="rgb(var(--w-ink) / 0.45)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {stepX >= 5 &&
            Array.from({ length: pMax }, (_, i) => i + 1)
              .filter((v) => v % q !== 0)
              .map((v) => (
                <line
                  key={v}
                  x1={xOfP(v)}
                  y1={RULER_Y - 4}
                  x2={xOfP(v)}
                  y2={RULER_Y + 4}
                  stroke="rgb(var(--w-ink) / 0.4)"
                  strokeWidth="1.4"
                />
              ))}
          {wholes.map((k) => (
            <g key={k}>
              <line
                x1={xOfP(k * q)}
                y1={RULER_Y - 9}
                x2={xOfP(k * q)}
                y2={RULER_Y + 9}
                stroke="rgb(var(--w-ink) / 0.7)"
                strokeWidth="2"
              />
              {k % every === 0 && (
                <text
                  x={xOfP(k * q)}
                  y={RULER_Y + 30}
                  textAnchor="middle"
                  fontSize="18"
                  style={{ fill: 'rgb(var(--w-cyan-ink))' }}
                >
                  {k}
                </text>
              )}
            </g>
          ))}
          <g
            className="ll-handle"
            {...drag}
            tabIndex={0}
            role="slider"
            aria-label="Numérateur de la toise"
            aria-valuenow={p}
            aria-valuemin={1}
            aria-valuemax={pMax}
            onKeyDown={(e) => {
              const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
              if (!step) return;
              e.preventDefault();
              toP(p + step);
            }}
            data-ll-piece-handle
          >
            <rect x={R0 - 12} y={RULER_Y - 24} width={R1 - R0 + 24} height="48" fill="transparent" />
            {!moved && <circle className="ll-pulse" cx={xOfP(p)} cy={RULER_Y} r="22" fill="rgb(var(--w-gold))" />}
            <circle cx={xOfP(p)} cy={RULER_Y} r="13" fill="rgb(var(--w-gold))" stroke="#06262c" strokeWidth="3" />
          </g>

          {/* the court: its floor and its whole tiles */}
          <rect x={X0} y={yc} width={Sc} height={Sc} fill="rgb(var(--w-cyan-ink) / 0.08)" data-ll-piece-court={a} />
          {u >= 8 && (
            <path d={gridPath(Sc, u, Math.ceil(side))} stroke="rgb(var(--w-ink) / 0.28)" strokeWidth="1" fill="none" />
          )}
          {/* the band it leaves, or what it holds more */}
          {P.verdict === 'band' && (
            <path
              d={`M${X0} ${yc}H${X0 + Sc}V${BOTTOM}H${X0 + Sd}V${yp}H${X0}Z`}
              fill="rgb(var(--w-gold))"
              fillOpacity=".85"
              data-ll-piece-band={P.far}
            />
          )}
          {P.verdict === 'jam' && (
            <path
              d={`M${X0} ${yp}H${X0 + Sd}V${BOTTOM}H${X0 + Sc}V${yc}H${X0}Z`}
              fill="rgb(var(--w-violet))"
              fillOpacity=".85"
              data-ll-piece-over={P.far}
            />
          )}
          {/* the platform and its small pieces */}
          <rect
            x={X0}
            y={yp}
            width={Sd}
            height={Sd}
            fill={P.verdict === 'fits' ? 'rgb(var(--w-green) / 0.55)' : 'rgb(var(--w-cyan-ink) / 0.32)'}
            stroke={P.verdict === 'fits' ? 'rgb(var(--w-green-ink))' : 'rgb(var(--w-cyan-ink))'}
            strokeWidth="2"
            data-ll-piece-platform={P.plat}
          />
          {small >= 4 && (
            <path
              d={gridPath(Sd, small, p)}
              stroke="rgba(6,38,44,.55)"
              strokeWidth="1"
              fill="none"
              data-ll-piece-grid={q}
            />
          )}
          <rect x={X0} y={yc} width={Sc} height={Sc} fill="none" stroke="rgb(var(--w-ink))" strokeWidth="3" rx="2" />
          <rect x={X0 - 6} y={BOTTOM - 6} width="12" height="12" rx="3" fill="rgb(var(--w-paper))" />
          {/* the rod under the platform: its length p/q, a fraction with its bar */}
          <line
            x1={X0}
            y1={BOTTOM + 9}
            x2={X0 + Sd}
            y2={BOTTOM + 9}
            stroke={tone}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <SvgFrac x={X0 + Math.max(Sd / 2, 22)} y={BOTTOM + 34} p={p} q={q} fill="rgb(var(--w-gold))" />
          <title>{`${p}/${q} · ${P.plat} · ${P.court}`}</title>
        </svg>

        {/* what the court and the platform hold, counted in small pieces */}
        <div className="ll-court__facts" data-ll-piece-facts>
          <p className="ll-court__title">{`Une salle de ${tiles(String(a))}`}</p>
          <p data-ll-piece-cut={q * q}>
            Dans une dalle : <M>{`${q} \\times ${q} = ${q * q}`}</M>
          </p>
          <p data-ll-piece-courtcount={P.court}>
            Dans la salle : <M>{`${a} \\times ${q * q} = ${P.court}`}</M>
          </p>
          <p data-ll-piece-platcount={P.plat}>
            Sur la plateforme : <M>{`${p} \\times ${p} = ${P.plat}`}</M>
          </p>
          {shown ? (
            <>
              <p data-ll-piece-best={`${shown.p}:${shown.q}:${shown.far}`}>
                {shown.far === 0 ? 'Couverte exactement : ' : 'Ta toise la plus proche : '}
                <M>{fracTex(shown.p, shown.q)}</M>
              </p>
              {/* the difference on a line of its own: on one line with the rod it ran out of the card (the lab's walk of
                  2026-11-21, the word « tile » cut at the card's edge) */}
              {shown.far > 0 && (
                <p data-ll-piece-far>
                  {shown.q === 1 ? (
                    `Écart : ${tiles(String(shown.far))}`
                  ) : (
                    <>
                      {'Écart : '}
                      <M>{fracTex(shown.far, shown.q * shown.q)}</M>
                      {' de dalle'}
                    </>
                  )}
                </p>
              )}
            </>
          ) : (
            <p className="ll-court__wait">
              Fais bouger la toise : combien de petits morceaux porte la plateforme, et combien en porte la salle ?
            </p>
          )}
        </div>
      </div>
    </Tool>
  );
}
