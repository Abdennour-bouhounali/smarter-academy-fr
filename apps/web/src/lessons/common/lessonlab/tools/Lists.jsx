/**
 * « L’établi des deux listes » — the divisors of two numbers WRITTEN, side by side, the way one writes them on a sheet: the hand
 * tries 1, then 2, then 3 … on BOTH numbers at once; each number that divides one of them is written in its list with its
 * partner (the small ones from the left, the partners from the right, an arc joining a pair). A list closes by itself
 * when the next number to try has a square past it. Once both are closed, a line joins every number that is in both, and
 * the greatest wears the crown. Tap a number: the two equalities that place it appear.
 * What it adds to « Les diviseurs communs » (lesson 4, `Common.jsx`, which shows the lists already made and sorted): the
 * lists are BUILT, by pairs, and stop where they must — the procedure of lesson 5, never a rule written.
 * `start` (default 0) is how many numbers were already tried on opening — the render test draws the closed lists with it.
 */
import { useEffect, useState } from 'react';
import { VW, useChime, Tool, M } from '../kit';
import { divide, twoLists } from '../logic';
import { listFr } from '../../gameworld/kit/authoring/numbers';

const X0 = 150;
const X1 = 905;
const SLOT = (X1 - X0) / 15; // 16 divisors at most for a number up to 120
const ROW = { A: 112, B: 258 };
const CW = 46;
const CH = 38;

const proof = (n, d) => {
  const { q, r } = divide(n, d);
  return `${n} = ${d} \\times ${q}${r ? ` + ${r}` : ''}`;
};
/** Where a divisor of a list is drawn: a small one from the left, a partner from the right. */
const xOf = (L, v) => {
  const i = L.smalls.indexOf(v);
  return i >= 0 ? X0 + i * SLOT : X1 - L.partners.indexOf(v) * SLOT;
};

export default function Lists({ a, b, play, report, start = 0 }) {
  const key = `${a}:${b}`;
  const [st, setSt] = useState({ key, tried: start, sel: null });
  // new numbers start a new sheet: what was tried belongs to the numbers it was tried on
  const cur = st.key === key ? st : { key, tried: 0, sel: null };
  const set = (x) => setSt({ ...cur, ...x });
  const L = twoLists(a, b, cur.tried);
  const { A, B, done, common, g } = L;
  const next = cur.tried + 1;

  useChime(play, 'complete', A.done || B.done, [A.done, B.done, key], { delay: 260 });
  useChime(play, 'crown', done, [done, key], { delay: 520 });
  useEffect(() => {
    report({ key, done });
  }, [done, key]); // eslint-disable-line react-hooks/exhaustive-deps

  const tryNext = () => {
    const d = next;
    set({ tried: d, sel: null });
    const hit = [a, b].find((n) => d * d <= n && n % d === 0);
    if (hit) play('found', d, hit / d);
    else play('miss');
  };

  const chips = (Lst, row) => {
    const y = ROW[row];
    const pairs = Lst.smalls.map((d, i) => [d, Lst.partners[i] ?? null]);
    const up = row === 'A';
    return (
      <g data-ll-list={row} data-ll-n={Lst.n} data-ll-done={Lst.done ? 'true' : 'false'} data-all={Lst.all.join(',')}>
        {pairs.map(([d, p], i) => {
          if (p === null) return null; // a square root is its own partner: no arc
          const x1 = X0 + i * SLOT;
          const x2 = X1 - i * SLOT;
          const ry = Math.min(66, 16 + (x2 - x1) * 0.07);
          const y0 = up ? y - CH / 2 - 3 : y + CH / 2 + 3;
          return (
            <path
              key={d}
              pathLength="1"
              className="ll-arc ll-arc--in"
              stroke={`hsl(${165 + i * 41} 80% 62%)`}
              d={`M ${x1} ${y0} A ${(x2 - x1) / 2} ${ry} 0 0 ${up ? 1 : 0} ${x2} ${y0}`}
            />
          );
        })}
        {!Lst.done && (
          <text
            x={(X0 + Lst.smalls.length * SLOT + X1 - Lst.partners.length * SLOT) / 2}
            y={y + 8}
            textAnchor="middle"
            fontSize="26"
            style={{ fill: 'rgba(234,252,255,.55)' }}
            data-ll-open
          >
            …
          </text>
        )}
        {Lst.all.map((v) => {
          const x = xOf(Lst, v);
          const both = done && common.includes(v);
          const top = done && v === g;
          const fresh = cur.tried > 0 && (v === cur.tried || v * cur.tried === Lst.n);
          return (
            <g
              key={v}
              className="ll-lchip"
              data-ll-d={v}
              data-ll-row={row}
              data-both={both ? 'true' : 'false'}
              onClick={() => {
                set({ sel: v });
                play(top ? 'crown' : both ? 'pair' : 'select', v);
              }}
            >
              <rect
                x={x - CW / 2}
                y={y - CH / 2}
                width={CW}
                height={CH}
                rx="10"
                fill={top ? '#fbbf24' : both ? '#064e3b' : '#062026'}
                stroke={
                  cur.sel === v
                    ? '#fff'
                    : top
                      ? '#fde68a'
                      : both
                        ? '#34d399'
                        : fresh
                          ? '#fbbf24'
                          : 'rgba(125,252,255,.55)'
                }
                strokeWidth={cur.sel === v || fresh ? 3.5 : 2}
              />
              <text
                x={x}
                y={y + 7}
                textAnchor="middle"
                fontSize="20"
                fontWeight="900"
                style={{ fill: top ? '#3b2a06' : '#eafcff' }}
              >
                {v}
              </text>
            </g>
          );
        })}
        <g data-ll-badge={row}>
          <rect
            x="18"
            y={y - 26}
            width="96"
            height="52"
            rx="14"
            fill={Lst.done ? '#7dfcff' : 'rgba(125,252,255,.14)'}
            stroke="#7dfcff"
            strokeWidth="2"
          />
          <text
            x="66"
            y={y + 9}
            textAnchor="middle"
            fontSize="26"
            fontWeight="900"
            style={{ fill: Lst.done ? '#06262c' : '#7dfcff' }}
          >
            {Lst.n}
          </text>
        </g>
      </g>
    );
  };

  const reading = () => {
    if (cur.sel !== null) {
      const inA = a % cur.sel === 0;
      const inB = b % cur.sel === 0;
      return (
        <>
          <M>{proof(a, cur.sel)}</M>
          <M>{proof(b, cur.sel)}</M>
          <span className={`ll-chip ${inA && inB ? 'll-chip--good' : 'll-chip--warm'}`}>
            {inA && inB
              ? `${cur.sel} est dans les deux listes`
              : `${cur.sel} est seulement dans la liste de ${inA ? a : b}`}
          </span>
        </>
      );
    }
    if (done)
      return (
        <>
          <M>{`\\mathrm{PGCD}(${a}\\,;\\,${b}) = ${g}`}</M>
          <span className="ll-chip ll-chip--good" data-ll-common={common.join(',')} data-ll-g={g}>
            Dans les deux listes : {listFr(common)} — le plus grand est {g}
          </span>
        </>
      );
    if (!L.step)
      return (
        <span className="ll-chip ll-chip--dim">
          Essaie 1, puis 2, puis 3… sur les deux nombres à la fois : chaque diviseur s’écrit avec son partenaire.
        </span>
      );
    const s = L.step;
    const rows = [
      [a, s.a],
      [b, s.b],
    ].filter(([, x]) => x);
    const hits = rows.filter(([, x]) => x.r === 0).map(([n]) => n);
    return (
      <>
        {rows.map(([n, x]) => (
          <M key={n}>{`${n} = ${s.d} \\times ${x.q}${x.r ? ` + ${x.r}` : ''}`}</M>
        ))}
        <span className={`ll-chip ${hits.length ? 'll-chip--good' : 'll-chip--dim'}`} data-ll-tried={s.d}>
          {hits.length === 2
            ? `${s.d} divise les deux nombres`
            : hits.length === 1
              ? `${s.d} divise ${hits[0]}`
              : rows.length === 2
                ? `${s.d} ne divise aucun des deux`
                : `${s.d} ne divise pas ${rows[0][0]}`}
        </span>
        {[A, B]
          .filter((x) => x.done && x.last === s.d)
          .map((x) => (
            <span key={x.n} className="ll-chip ll-chip--dim" data-ll-closed={x.n}>
              Liste de {x.n} complète : {s.d + 1} × {s.d + 1} est plus grand que {x.n}
            </span>
          ))}
      </>
    );
  };

  return (
    <Tool
      id="lists"
      tone={done ? 'good' : 'plain'}
      actions={
        <>
          <button
            type="button"
            className={`ll-btn ${cur.tried === 0 ? 'll-btn--call' : ''}`}
            onClick={tryNext}
            disabled={done}
            data-ll-try={done ? '' : next}
          >
            {done ? 'Les deux listes sont complètes' : `Essaie ${next} ▸`}
          </button>
          <button
            type="button"
            className="ll-btn ll-btn--ghost"
            onClick={() => {
              set({ tried: 0, sel: null });
              play('erase');
            }}
            disabled={cur.tried === 0}
            data-ll-reset
          >
            Recommence
          </button>
        </>
      }
      reading={reading()}
    >
      <svg viewBox={`0 0 ${VW} 370`} data-ll-lists data-tried={cur.tried} data-done={done ? 'true' : 'false'}>
        {done &&
          common.map((v) => {
            const top = v === g;
            const xa = xOf(A, v);
            const xb = xOf(B, v);
            return (
              <g key={v} data-ll-link={v}>
                <line
                  x1={xa}
                  y1={ROW.A + CH / 2}
                  x2={xb}
                  y2={ROW.B - CH / 2}
                  stroke={top ? '#fbbf24' : '#34d399'}
                  strokeWidth={top ? 5 : 3}
                  strokeLinecap="round"
                  opacity={top ? 1 : 0.75}
                />
                {top && (
                  <text x={(xa + xb) / 2} y={(ROW.A + ROW.B) / 2 + 9} textAnchor="middle" fontSize="26" data-ll-crown>
                    👑
                  </text>
                )}
              </g>
            );
          })}
        {chips(A, 'A')}
        {chips(B, 'B')}
      </svg>
    </Tool>
  );
}
