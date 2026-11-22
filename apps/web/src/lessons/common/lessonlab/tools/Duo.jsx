/**
 * « Le microscope à deux nombres » — two numbers of the student's own, looked at three ways (three faces, one tab each):
 *   lists      the divisors of each number in a row, and under them those in BOTH (tap one: the two equalities);
 *   divisions  the divisions one after another, written by the hand (« Division suivante »): the greater by the smaller, then
 *              the divisor by the remainder … down to the remainder 0 (`logic.js › euclidLines`);
 *   probe      a number d the hand drags along a ruler (or ± / arrows), tried on BOTH numbers: the two divisions drawn as
 *              pieces of d laid along each number, what is left, and every d already tried on these numbers.
 * It draws facts and never concludes: no word of what the pair « is », no sentence about the last remainder. It does
 * nothing on its own: each face shows what the hand asked for, and reports only after a gesture on it.
 * `start` ({ face, written, d }) is the state on opening — the render test draws the faces with it.
 */
import { useEffect, useRef, useState } from 'react';
import { VW, VH, useDrag, useChime, Tool, M } from '../kit';
import { euclidLines, pairLists, probeOf } from '../logic';
import { listFr } from '../../gameworld/kit/authoring/numbers';

const FACES = [
  { id: 'lists', label: 'Diviseurs' },
  { id: 'divisions', label: 'Divisions successives' },
  { id: 'probe', label: 'Essaie un nombre' },
];
const TAB_W = 230;
const X0 = 150;
const X1 = 905;
const SLOT = (X1 - X0) / 15; // 16 numbers in a line; a number up to 999 has 32 divisors at most: two lines
const CW = 46;
const CH = 32;
const LINE = 40;
const PROBE_SOUND = { both: 'fit', none: 'rest', a: 'short', b: 'short' };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const eq = (n, d, { q, r }) => `${n} = ${d} × ${q}${r ? ` + ${r}` : ''}`;
const eqTex = (n, d, { q, r }) => `${n} = ${d} \\times ${q}${r ? ` + ${r}` : ''}`;
const chunks = (xs) => (xs.length > 16 ? [xs.slice(0, 16), xs.slice(16)] : [xs]);

export default function Duo({ a, b, play, report, start = null }) {
  const key = `${a}:${b}`;
  const svg = useRef(null);
  const [face, setFace] = useState(start?.face ?? 'lists');
  const [st, setSt] = useState({ key, sel: null, written: start?.written ?? 0, d: start?.d ?? 2, tried: [] });
  const [acted, setActed] = useState(false); // a gesture was made on the instrument: from then on it reports
  const [moved, setMoved] = useState(false);
  // new numbers start a new sheet: what was written or tried belongs to the numbers it was made with
  const cur = st.key === key ? st : { key, sel: null, written: 0, d: st.d, tried: [] };
  const set = (x) => {
    setActed(true);
    setSt({ ...cur, ...x });
  };

  const L = pairLists(a, b);
  const lines = euclidLines(a, b);
  const written = Math.min(cur.written, lines.length);
  const done = written === lines.length;
  const dMax = Math.max(2, Math.max(a, b));
  const d = clamp(cur.d, 2, dMax);
  const P = probeOf(a, b, d);

  useEffect(() => {
    if (acted) report({ key, face, looked: face === 'lists', done: face === 'divisions' && done, d, moved });
  }, [acted, key, face, done, d, moved]); // eslint-disable-line react-hooks/exhaustive-deps
  useChime(play, 'complete', face === 'divisions' && done && written > 0, [done, key, face], { delay: 260 });
  // nothing left in both: the one chime of a fit; in neither: the soft rest; in one only: the short one
  useChime(play, PROBE_SOUND[P.verdict], face === 'probe' && moved, [d, key]);

  const pickFace = (id) => {
    setFace(id);
    setActed(true);
    play('ui');
  };
  const toD = (nd, record) => {
    const v = clamp(nd, 2, dMax);
    setMoved(true);
    if (v !== d) play('tick', v);
    const tried = record && !cur.tried.includes(v) ? [...cur.tried, v].slice(-12) : cur.tried;
    set({ d: v, tried });
  };
  const u = (X1 - X0) / Math.max(1, dMax - 2);
  const xOfD = (v) => X0 + (v - 2) * u;
  const drag = useDrag(svg, {
    onStart: (p) => toD(Math.round((p.x - X0) / u) + 2, false),
    onMove: (p) => toD(Math.round((p.x - X0) / u) + 2, false),
    onEnd: () => toD(d, true),
  });

  // ─── the face of the lists ───
  const listsFace = () => {
    const bands = [
      { id: 'A', n: a, xs: L.A },
      { id: 'both', n: null, xs: L.common },
      { id: 'B', n: b, xs: L.B },
    ];
    let y = 78;
    return bands.map((band) => {
      const rows = chunks(band.xs);
      const top = y;
      y += rows.length * LINE + 14;
      const mid = top + ((rows.length - 1) * LINE) / 2;
      return (
        <g
          key={band.id}
          data-ll-duo-list={band.id}
          data-all={band.xs.join(',')}
          {...(band.id === 'both' ? { 'data-ll-common': L.common.join(',') } : {})}
        >
          <rect
            x="12"
            y={mid - 20}
            width="110"
            height="40"
            rx="12"
            fill={band.id === 'both' ? 'rgba(52,211,153,.18)' : 'rgba(125,252,255,.14)'}
            stroke={band.id === 'both' ? '#34d399' : '#7dfcff'}
            strokeWidth="2"
          />
          <text
            x="67"
            y={mid + (band.id === 'both' ? 6 : 8)}
            textAnchor="middle"
            fontSize={band.id === 'both' ? 16 : 22}
            style={{ fill: band.id === 'both' ? '#6ee7b7' : '#7dfcff' }}
          >
            {band.id === 'both' ? 'Communs' : band.n}
          </text>
          {rows.map((row, r) =>
            row.map((v, i) => {
              const x = X0 + i * SLOT;
              const cy = top + r * LINE;
              const both = band.id === 'both' || L.common.includes(v);
              const on = cur.sel === v;
              return (
                <g
                  key={v}
                  className="ll-lchip"
                  data-ll-d={v}
                  data-ll-row={band.id}
                  data-both={both ? 'true' : 'false'}
                  onClick={() => {
                    set({ sel: v });
                    play(both ? 'pair' : 'select', v);
                  }}
                >
                  <rect
                    x={x - CW / 2}
                    y={cy - CH / 2}
                    width={CW}
                    height={CH}
                    rx="9"
                    fill={both ? '#064e3b' : '#062026'}
                    stroke={on ? '#fff' : both ? '#34d399' : 'rgba(125,252,255,.55)'}
                    strokeWidth={on ? 3.5 : 2}
                  />
                  <text x={x} y={cy + 6} textAnchor="middle" fontSize="18" fontWeight="900">
                    {v}
                  </text>
                </g>
              );
            }),
          )}
        </g>
      );
    });
  };

  // ─── the face of the divisions ───
  const divisionsFace = () => (
    <g data-ll-duo-divisions data-written={written} data-lines={lines.length} data-done={done ? 'true' : 'false'}>
      {lines.slice(0, written).map((l, i) => {
        const col = Math.floor(i / 7);
        const cx = col === 0 ? 250 : 690; // the first column on the LEFT
        const y = 92 + (i % 7) * 40;
        return (
          <text
            key={i}
            x={cx}
            y={y}
            textAnchor="middle"
            fontSize="24"
            data-ll-div={i}
            data-r={l.r}
            style={{ animation: 'll-flip .3s ease-out' }}
          >
            {`${l.a} = ${l.b} × ${l.q} + `}
            <tspan style={{ fill: l.r === 0 ? '#6ee7b7' : '#fbbf24' }}>{l.r}</tspan>
          </text>
        );
      })}
      {!done && (
        <text
          x={written < 7 ? 250 : 690}
          y={92 + (written % 7) * 40}
          textAnchor="middle"
          fontSize="24"
          style={{ fill: 'rgba(234,252,255,.4)' }}
          data-ll-open
        >
          …
        </text>
      )}
    </g>
  );

  // ─── the face of the probe ───
  const probeFace = () => {
    const big = Math.max(a, b, 1);
    const w = (X1 - X0) / big;
    const bar = (n, div, y, id) => {
      const pieces = div.q;
      const many = pieces > 60;
      const tone = div.r === 0 ? '#34d399' : '#7dfcff';
      return (
        <g data-ll-duo-bar={id} data-n={n} data-q={div.q} data-r={div.r}>
          <rect x="12" y={y - 20} width="110" height="40" rx="12" fill="rgba(125,252,255,.14)" stroke="#7dfcff" />
          <text x="67" y={y + 8} textAnchor="middle" fontSize="22" style={{ fill: '#7dfcff' }}>
            {n}
          </text>
          <rect
            x={X0}
            y={y - 13}
            width={Math.max(2, n * w)}
            height="26"
            rx="5"
            fill="rgba(234,252,255,.08)"
            stroke="rgba(234,252,255,.45)"
          />
          {many ? (
            <rect x={X0} y={y - 10} width={pieces * d * w} height="20" rx="3" fill={tone} />
          ) : (
            Array.from({ length: pieces }, (_, k) => (
              <rect
                key={k}
                x={X0 + k * d * w + Math.min(1, d * w * 0.2)}
                y={y - 10}
                width={Math.max(1, d * w - Math.min(2, d * w * 0.4))}
                height="20"
                rx="3"
                fill={tone}
              />
            ))
          )}
          {div.r > 0 && (
            <rect
              x={X0 + pieces * d * w}
              y={y - 10}
              width={div.r * w}
              height="20"
              rx="3"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
          )}
          <text x={X0} y={y + 40} fontSize="18" style={{ fill: div.r === 0 ? '#6ee7b7' : '#e0f2fe' }}>
            {eq(n, d, div)}
          </text>
        </g>
      );
    };
    const hx = xOfD(d);
    return (
      <g data-ll-duo-probe data-d={d} data-verdict={P.verdict}>
        <line x1={X0} y1="86" x2={X1} y2="86" stroke="rgba(234,252,255,.45)" strokeWidth="3" strokeLinecap="round" />
        <text x={X0} y="116" textAnchor="middle" fontSize="16" style={{ fill: 'rgba(234,252,255,.6)' }}>
          2
        </text>
        <text x={X1} y="116" textAnchor="middle" fontSize="16" style={{ fill: 'rgba(234,252,255,.6)' }}>
          {dMax}
        </text>
        <g
          className="ll-handle"
          {...drag}
          tabIndex={0}
          onKeyDown={(e) => {
            const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
            if (step) toD(d + step, true);
          }}
          data-ll-probe
        >
          <rect x={X0 - 10} y="64" width={X1 - X0 + 20} height="44" fill="transparent" />
          {!moved && <circle className="ll-pulse" cx={hx} cy="86" r="22" fill="#fbbf24" />}
          <circle cx={hx} cy="86" r="13" fill="#fde68a" stroke="#06262c" strokeWidth="3" />
          <text x={hx} y="60" textAnchor="middle" fontSize="20" style={{ fill: '#fde68a' }}>
            {d}
          </text>
        </g>
        {bar(a, P.a, 170, 'a')}
        {bar(b, P.b, 256, 'b')}
        <g data-ll-tried={cur.tried.join(',')}>
          {cur.tried.map((v, i) => {
            const t = probeOf(a, b, v).verdict;
            return (
              <g key={v}>
                <rect
                  x={X0 - 23 + i * 52}
                  y="326"
                  width="46"
                  height="30"
                  rx="8"
                  fill={t === 'both' ? '#064e3b' : t === 'none' ? '#062026' : 'rgba(251,191,36,.18)'}
                  stroke={t === 'both' ? '#34d399' : t === 'none' ? 'rgba(125,252,255,.4)' : '#fbbf24'}
                  strokeWidth="2"
                  data-ll-tried-d={v}
                  data-verdict={t}
                />
                <text x={X0 + i * 52} y="347" textAnchor="middle" fontSize="17">
                  {v}
                </text>
              </g>
            );
          })}
        </g>
      </g>
    );
  };

  const reading = () => {
    if (face === 'lists') {
      if (cur.sel !== null) {
        const inA = a % cur.sel === 0;
        const inB = b % cur.sel === 0;
        return (
          <>
            <M>{eqTex(a, cur.sel, { q: Math.floor(a / cur.sel), r: a % cur.sel })}</M>
            <M>{eqTex(b, cur.sel, { q: Math.floor(b / cur.sel), r: b % cur.sel })}</M>
            <span className={`ll-chip ${inA && inB ? 'll-chip--good' : 'll-chip--warm'}`}>
              {inA && inB
                ? `${cur.sel} est dans les deux listes`
                : `${cur.sel} est seulement dans la liste de ${inA ? a : b}`}
            </span>
          </>
        );
      }
      const shown = L.common.length > 10 ? `${L.common.slice(0, 10).join(', ')}, …` : listFr(L.common);
      return (
        <span className="ll-chip ll-chip--good" data-ll-common-read={L.common.join(',')}>
          Dans les deux listes : {shown}
        </span>
      );
    }
    if (face === 'divisions') {
      if (!written)
        return (
          <span className="ll-chip ll-chip--dim">
            Chaque appui écrit une division sur une ligne : commence par diviser le plus grand par le plus petit.
          </span>
        );
      const l = lines[written - 1];
      return (
        <>
          <M>{eqTex(l.a, l.b, l)}</M>
          {done ? (
            <>
              <M>{`\\mathrm{PGCD}(${a} ; ${b}) = ${l.b}`}</M>
              <span className="ll-chip ll-chip--good" data-ll-divisions-done={lines.length}>
                Nombre de divisions : {lines.length}
              </span>
            </>
          ) : (
            <span className="ll-chip ll-chip--warm">Reste {l.r}</span>
          )}
        </>
      );
    }
    const say =
      P.verdict === 'both'
        ? `${d} divise les deux nombres`
        : P.verdict === 'none'
          ? `${d} ne divise aucun des deux`
          : `${d} divise seulement ${P.verdict === 'a' ? a : b}`;
    return (
      <>
        <M>{eqTex(a, d, P.a)}</M>
        <M>{eqTex(b, d, P.b)}</M>
        <span
          className={`ll-chip ${P.verdict === 'both' ? 'll-chip--good' : P.verdict === 'none' ? 'll-chip--dim' : 'll-chip--warm'}`}
          data-ll-verdict={P.verdict}
        >
          {say}
        </span>
      </>
    );
  };

  const actions =
    face === 'divisions' ? (
      <>
        <button
          type="button"
          className={`ll-btn ${written === 0 ? 'll-btn--call' : ''}`}
          onClick={() => {
            set({ written: written + 1 });
            play('pencil');
          }}
          disabled={done}
          data-ll-next
        >
          {done ? 'Reste 0' : 'Division suivante ▸'}
        </button>
        <button
          type="button"
          className="ll-btn ll-btn--ghost"
          onClick={() => {
            set({ written: 0 });
            play('erase');
          }}
          disabled={written === 0}
          data-ll-reset
        >
          Recommence
        </button>
      </>
    ) : face === 'probe' ? (
      <>
        <button type="button" className="ll-btn ll-btn--ghost" onClick={() => toD(d - 1, true)} data-ll-minus>
          −
        </button>
        <button type="button" className="ll-btn ll-btn--ghost" onClick={() => toD(d + 1, true)} data-ll-plus>
          +
        </button>
      </>
    ) : null;

  const tone =
    face === 'divisions' && done ? 'good' : face === 'probe' && P.verdict === 'both' && moved ? 'good' : 'plain';
  return (
    <Tool id="duo" tone={tone} actions={actions} reading={reading()}>
      <svg ref={svg} viewBox={`0 0 ${VW} ${VH}`} data-ll-duo data-face={face}>
        {FACES.map((f, i) => {
          // the first face on the LEFT: the page reads left to right
          const x = VW / 2 + TAB_W * (i - 1);
          const on = f.id === face;
          return (
            <g
              key={f.id}
              className="ll-handle"
              onClick={() => pickFace(f.id)}
              data-ll-face-tab={f.id}
              data-on={on ? 'true' : 'false'}
            >
              <rect
                x={x - TAB_W / 2 + 6}
                y="4"
                width={TAB_W - 12}
                height="36"
                rx="12"
                fill={on ? '#7dfcff' : 'rgba(125,252,255,.1)'}
                stroke="#7dfcff"
                strokeWidth="1.5"
              />
              <text x={x} y="29" textAnchor="middle" fontSize="18" style={{ fill: on ? '#06262c' : '#eafcff' }}>
                {f.label}
              </text>
            </g>
          );
        })}
        {face === 'lists' ? listsFace() : face === 'divisions' ? divisionsFace() : probeFace()}
      </svg>
    </Tool>
  );
}
