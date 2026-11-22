/**
 * « ساحة العدد » — a court of the student's own: `a` whole tiles, laid from the corner into a square whose side `s` the
 * hand chooses on a ruler (or « − / + », the arrows). The tiles fill the square row by row (`logic.js › courtOf`): when
 * the square is too small the tiles that do not fit wait in amber along its next row and column (« +n » when they are
 * more than that border holds); when it is too big its empty places are drawn dashed. The reading writes s × s and what
 * the square holds.
 * Only once the hand has tried the sides that settle the court — k, the side of the greatest whole square, and k + 1
 * when a is not a perfect square (`courtSettled`) — does the panel write what the court is: the greatest whole square
 * and what is left, then √a = k, or k < √a < k + 1 and the side to 0,01 from below and from above with the two squares
 * that prove it, all computed in integers. It names the sign √: the lab opens after the lesson (LESSON_LAB.md §2: it is
 * NOT safe before the lesson's keys). It does nothing on its own and reports only after the hand moved the side.
 * `start` ({ s, tried }) is the state on opening — the render test draws it with it.
 */
import { useEffect, useRef, useState } from 'react';
import { useDrag, useChime, svgPoint, Tool, M } from '../kit';
import { courtOf, courtSettled, decText, hundredths } from '../logic';
import { tiles } from '../../gameworld/rootCourts/strings';

/** The drawing's own frame (it shares the stage with the panel of facts). */
const COURT_VW = 560;
const COURT_VH = 370;
const SMAX = 21;
const R0 = 50;
const R1 = 520;
const RULER_Y = 40;
const X0 = 50;
const BOTTOM = 336;
const G = 252;
const SOUND = { fits: 'fit', out: 'rest', holes: 'short' };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const texDec = (t) => t.replace(',', '{,}');
/**
 * A point of the pointer in THIS drawing's viewBox (560 × 370) — not the kit's default 940 × 370: with the default, a
 * drag to 12 landed on 21 (the lab walk of 2026-11-21).
 */
export const courtPoint = (svg, e) => svgPoint(svg, e, COURT_VW, COURT_VH);

export default function NumberCourt({ a, b, play, report, start = null }) {
  const key = `${a}:${b}`;
  const svg = useRef(null);
  const [st, setSt] = useState({ key, s: start?.s ?? 2, tried: start?.tried ?? [] });
  const [moved, setMoved] = useState(Boolean(start?.tried?.length));
  // a new court starts a new sheet: the sides tried belong to the court they were tried on
  const cur = st.key === key ? st : { key, s: st.s, tried: [] };
  const s = clamp(cur.s, 1, SMAX);
  const C = courtOf(a, s);
  const settled = courtSettled(a, cur.tried);

  useEffect(() => {
    if (moved) report({ key, s, moved, tried: cur.tried });
  }, [moved, key, s, cur.tried.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  useChime(play, SOUND[C.verdict], moved, [s, key]);
  useChime(play, 'complete', settled && moved, [settled, key], { delay: 260 });

  const toS = (ns, record) => {
    const v = clamp(ns, 1, SMAX);
    setMoved(true);
    if (v !== s) play('tick', v);
    const tried = record && !cur.tried.includes(v) ? [...cur.tried, v].slice(-12) : cur.tried;
    setSt({ ...cur, s: v, tried });
  };
  const u = (R1 - R0) / (SMAX - 1);
  const xOfS = (v) => R0 + (v - 1) * u;
  const sOfX = (x) => Math.round((x - R0) / u) + 1;
  const drag = useDrag(svg, {
    onStart: (p) => toS(sOfX(p.x), false),
    onMove: (p) => toS(sOfX(p.x), false),
    onEnd: () => toS(s, true),
    point: courtPoint,
  });

  // the square and the border around it (its next column, then its next row): one cell = c
  const c = G / Math.max(s + 1, 4);
  const gap = c > 9 ? 1.2 : 0.5;
  const cell = (col, row) => ({ x: X0 + col * c + gap / 2, y: BOTTOM - (row + 1) * c + gap / 2, w: c - gap });
  const inside = Array.from({ length: C.inside }, (_, i) => cell(i % s, Math.floor(i / s)));
  const holes = Array.from({ length: C.holes }, (_, i) => cell((C.inside + i) % s, Math.floor((C.inside + i) / s)));
  const border = [
    ...Array.from({ length: s }, (_, r) => cell(s, r)),
    ...Array.from({ length: s + 1 }, (_, col) => cell(s - col, s)),
  ];
  const outDrawn = Math.min(C.out, border.length);
  const fits = C.verdict === 'fits';
  const tone = fits ? '#34d399' : 'rgba(125,252,255,.62)';
  const side = s * c;

  return (
    <Tool
      id="court"
      tone={fits && moved ? 'good' : 'plain'}
      actions={
        <>
          <button type="button" className="ll-btn ll-btn--ghost" onClick={() => toS(s - 1, true)} data-ll-court-minus>
            −
          </button>
          <button type="button" className="ll-btn ll-btn--ghost" onClick={() => toS(s + 1, true)} data-ll-court-plus>
            +
          </button>
        </>
      }
      reading={
        <>
          <M>{`${s} \\times ${s} = ${s * s}`}</M>
          <span
            className={`ll-chip ${fits ? 'll-chip--good' : C.verdict === 'out' ? 'll-chip--warm' : 'll-chip--dim'}`}
            data-ll-court-verdict={C.verdict}
          >
            {fits
              ? `المربّع ممتلئ، ولا بلاطة خارجه`
              : C.verdict === 'out'
                ? `خارج المربّع: ${tiles(String(C.out))}`
                : `خانات فارغة في المربّع: ${C.holes}`}
          </span>
        </>
      }
    >
      <div className="ll-court">
        <svg
          ref={svg}
          viewBox={`0 0 ${COURT_VW} ${COURT_VH}`}
          data-ll-court={a}
          data-s={s}
          data-verdict={C.verdict}
          data-inside={C.inside}
          data-out={C.out}
          data-holes={C.holes}
          data-out-drawn={outDrawn}
        >
          {/* the ruler: the side of the square, from 1 to 21 */}
          <line
            x1={R0}
            y1={RULER_Y}
            x2={R1}
            y2={RULER_Y}
            stroke="rgba(234,252,255,.45)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {Array.from({ length: SMAX }, (_, i) => i + 1).map((v) => (
            <line
              key={v}
              x1={xOfS(v)}
              y1={RULER_Y - (v % 5 === 0 || v === 1 ? 8 : 4)}
              x2={xOfS(v)}
              y2={RULER_Y + (v % 5 === 0 || v === 1 ? 8 : 4)}
              stroke="rgba(234,252,255,.5)"
              strokeWidth="1.6"
            />
          ))}
          {[1, 5, 10, 15, 20].map((v) => (
            <text key={v} x={xOfS(v)} y={RULER_Y + 30} textAnchor="middle" fontSize="18" style={{ fill: '#a5f3fc' }}>
              {v}
            </text>
          ))}
          <g
            className="ll-handle"
            {...drag}
            tabIndex={0}
            role="slider"
            aria-label="ضلع المربّع"
            aria-valuenow={s}
            aria-valuemin={1}
            aria-valuemax={SMAX}
            onKeyDown={(e) => {
              const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
              if (!step) return;
              e.preventDefault();
              toS(s + step, true);
            }}
            data-ll-court-handle
          >
            <rect x={R0 - 12} y={RULER_Y - 24} width={R1 - R0 + 24} height="48" fill="transparent" />
            {!moved && <circle className="ll-pulse" cx={xOfS(s)} cy={RULER_Y} r="22" fill="#fbbf24" />}
            <circle cx={xOfS(s)} cy={RULER_Y} r="13" fill="#fde68a" stroke="#06262c" strokeWidth="3" />
          </g>

          {/* the tiles in the square, its empty places, and the tiles that do not fit along its border */}
          <g data-ll-court-tiles>
            {inside.map((t, i) => (
              <rect key={`i${i}`} x={t.x} y={t.y} width={t.w} height={t.w} rx={Math.min(3, c / 6)} fill={tone} />
            ))}
            {holes.map((t, i) => (
              <rect
                key={`h${i}`}
                x={t.x}
                y={t.y}
                width={t.w}
                height={t.w}
                rx={Math.min(3, c / 6)}
                fill="none"
                stroke="rgba(234,252,255,.45)"
                strokeWidth="1.4"
                strokeDasharray="4 3"
                data-ll-court-hole
              />
            ))}
            {border.slice(0, outDrawn).map((t, i) => (
              <rect
                key={`o${i}`}
                x={t.x}
                y={t.y}
                width={t.w}
                height={t.w}
                rx={Math.min(3, c / 6)}
                fill="#fbbf24"
                data-ll-court-out
              />
            ))}
          </g>
          <rect
            x={X0}
            y={BOTTOM - side}
            width={side}
            height={side}
            fill="none"
            stroke={fits ? '#34d399' : '#eafcff'}
            strokeWidth="3"
            rx="3"
            data-ll-court-square={s}
          />
          {C.out > outDrawn && (
            <text
              x={X0 + (s + 1) * c + 10}
              y={BOTTOM - (s + 1) * c + 20}
              fontSize="22"
              fontWeight="900"
              style={{ fill: '#fde68a' }}
              data-ll-court-more={C.out - outDrawn}
            >
              {`+${C.out - outDrawn}`}
            </text>
          )}
          {/* the side, written under the square, centred on it */}
          <text x={X0 + side / 2} y={BOTTOM + 26} textAnchor="middle" fontSize="22" style={{ fill: '#fde68a' }}>
            {s}
          </text>
          <title>{`${s} × ${s} = ${s * s} · ${a}`}</title>
        </svg>

        {/* what the court is: written only once the hand has settled it */}
        <div className="ll-court__facts" data-ll-court-facts={settled ? 'settled' : 'open'}>
          <p className="ll-court__title">{`ساحة مساحتها ${tiles(String(a))}`}</p>
          {settled ? (
            <>
              <p data-ll-court-whole={`${C.k}:${C.left}`}>
                أكبر مربّع كامل فيها: <M>{`${C.k} \\times ${C.k} = ${C.k * C.k}`}</M>
              </p>
              <p>{C.left ? `يبقى منها: ${tiles(String(C.left))}` : 'لا يبقى منها شيء.'}</p>
              {C.perfect ? (
                <p data-ll-court-root={C.k}>
                  <M>{`\\sqrt{${a}} = ${C.k}`}</M>
                </p>
              ) : (
                <>
                  <p data-ll-court-bracket={`${C.k}:${C.k + 1}`}>
                    <M>{`${C.k} < \\sqrt{${a}} < ${C.k + 1}`}</M>
                  </p>
                  <p data-ll-court-near={`${hundredths(C.lo)}:${hundredths(C.hi)}`}>
                    إلى <M>{'0{,}01'}</M>:{' '}
                    <M>{`${texDec(hundredths(C.lo))} < \\sqrt{${a}} < ${texDec(hundredths(C.hi))}`}</M>
                  </p>
                  <p className="ll-court__proof">
                    <M>{`${texDec(hundredths(C.lo))}^{2} = ${texDec(decText(C.lo * C.lo, 4))}`}</M>
                  </p>
                  <p className="ll-court__proof">
                    <M>{`${texDec(hundredths(C.hi))}^{2} = ${texDec(decText(C.hi * C.hi, 4))}`}</M>
                  </p>
                </>
              )}
            </>
          ) : (
            <p className="ll-court__wait">حرّك الضلع: جرّب أكبر مربّع كامل يتّسع للبلاطات، ثمّ المربّع الذي بعده.</p>
          )}
        </div>
      </div>
    </Tool>
  );
}
