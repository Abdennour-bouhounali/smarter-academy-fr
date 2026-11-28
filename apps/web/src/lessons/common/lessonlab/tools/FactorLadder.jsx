/**
 * « L’échelle des facteurs » — a number of the student's own (2 … 9 999) is a gap of that many cases. His hand chooses a
 * plank — 2 to 13, any other length he types, or the whole gap — and the world lays it (`divisorIsles/factorLadder.js`):
 * when it fills the gap, the gap becomes the number of planks laid and a rung is written on the ladder at the left
 * (« 72 = 2 × 36 »); when it does not, the gap stays and what is left is drawn in amber. The planks that filled stand in a
 * row; when the gap is 1 case, the row is written as one product of the number. Free play: facts only — no verdict, no
 * order imposed, no word of the lesson's rules (LESSON_LAB.md §2: the world's door opens the lab before the first key).
 */
import { useEffect, useState } from 'react';
import { VW, VH, useChime, Tool, M } from '../kit';
import { factorRungs, layPlank } from '../../gameworld/divisorIsles/factorLadder';
import { counted } from '../../gameworld/kit/authoring/numbers';
import { formatFr, texFr } from '@smarter-academy/core';

const LTR = { direction: 'ltr', unicodeBidi: 'isolate' };
const NO_PLANKS = [];
/** The planks on the rack, in two rows of seven (the last place of the second row is the whole gap). */
export const RACK = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const X_GAP = 290;
const W_GAP = 620;
const CHIP = { w: 74, h: 46, step: 86, y: [140, 200] };
/** Under this many planks, each plank of a lay is drawn; above, one block with its count. */
const EACH = 48;
const f = formatFr;
/** « 2 387 cases », « 1 case ». */
const cells = (n) => `${f(n)} ${n < 2 ? 'case' : 'cases'}`;

/** Where each plank of the rack stands: seven a row, the shortest on the left. */
export const chipAt = (k) => ({ x: X_GAP + (k % 7) * CHIP.step, y: CHIP.y[Math.floor(k / 7)] });

/**
 * `start` ({ planks, last }) is the state on opening — the render test draws it with it. The state belongs to its number:
 * a new number starts a new gap in the render itself, never one frame late in an effect (defects.md B21).
 */
export default function FactorLadder({ a, b, play, report, start = null }) {
  const [st, setSt] = useState({ a, planks: start?.planks ?? [], last: start?.last ?? null });
  const [other, setOther] = useState('');
  // a new number: an empty ladder of its own — the SAME empty row at every render (a new [] each time re-ran the report
  // effect below at every render: « Maximum update depth exceeded » when the number was typed, first French walk)
  const cur = st.a === a ? st : { a, planks: NO_PLANKS, last: null };
  const { planks, last } = cur;
  const { rungs, left } = factorRungs(a, planks);
  const done = left === 1;
  useEffect(() => {
    report({ key: `${a}:${b}`, planks, left });
  }, [planks, a]); // eslint-disable-line react-hooks/exhaustive-deps
  useChime(play, 'complete', done && planks.length > 0, [done, a], { delay: 320 });
  const lay = (d) => {
    if (done || !Number.isInteger(d) || d < 2 || d > left) return;
    const x = layPlank(left, d);
    setSt({ a, planks: x.held ? [...planks, d] : planks, last: x });
    play('select', d);
    play(x.held ? 'fit' : 'rest');
  };
  const undo = () => {
    setSt({ a, planks: planks.slice(0, -1), last: null });
    play('erase');
  };
  const typed = Number(other);
  const fellHere = last && !last.held && last.before === left ? last.plank : null;
  const rows = [...rungs.map((r) => ({ n: r.before, p: r.plank })), { n: left, p: null }];
  const rowH = Math.min(26, 300 / rows.length);
  const size = rows.length > 10 ? 16 : 19;
  // the last lay drawn over the gap it was laid on
  const u = W_GAP / (last ? last.before : left);
  const q = last ? Math.floor(last.before / last.plank) : 0;
  const r = last ? last.before % last.plank : 0;
  const row = planks.map(f).join(' × ');
  return (
    <Tool
      id="factor"
      tone={done ? 'good' : last && !last.held ? 'warm' : 'plain'}
      actions={
        <>
          <label className="ll-btn ll-btn--ghost" data-ll-factor-other>
            Planche de{' '}
            <input
              type="text"
              inputMode="numeric"
              value={other}
              onChange={(e) => setOther(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(e) => e.key === 'Enter' && lay(typed)}
              aria-label="Longueur de la planche"
              size={4}
              data-ll-factor-input
            />
          </label>
          <button
            type="button"
            className="ll-btn"
            onClick={() => lay(typed)}
            disabled={done || !(typed >= 2 && typed <= left)}
            data-ll-factor-lay
          >
            Poser
          </button>
          {/* a short label: the reading line beside the actions holds the sentence (French is longer than the Arabic
              this bar was laid for — first French lesson, 2026-11-23: the stage was pushed past the screen) */}
          <button
            type="button"
            className="ll-btn ll-btn--ghost"
            onClick={undo}
            disabled={!planks.length}
            aria-label="Retirer la dernière planche"
            data-ll-factor-undo
          >
            Retirer
          </button>
        </>
      }
      reading={
        done ? (
          <>
            {/* a long row (8 192 = 2 × 2 × … thirteen times) is written by the drawing above, not on this one line */}
            {planks.length <= 6 && <M>{`${texFr(a)} = ${planks.map(texFr).join(' \\times ')}`}</M>}
            <span className="ll-chip ll-chip--good" data-ll-factor-done>
              Le fossé est franchi avec {counted(planks.length, ['planche', 'planches'])}
            </span>
          </>
        ) : last === null ? (
          <span className="ll-chip ll-chip--dim">
            Choisis une planche : elle se pose sur le fossé de {cells(left)}.
          </span>
        ) : last.held ? (
          <>
            <M>{`${texFr(last.before)} = ${last.plank} \\times ${texFr(last.after)}`}</M>
            <span className="ll-chip ll-chip--good" data-ll-factor-last="held">
              Le fossé fait maintenant {cells(left)}
            </span>
          </>
        ) : (
          <>
            <M>{`${texFr(last.before)} = ${last.plank} \\times ${texFr(q)} + ${r}`}</M>
            <span className="ll-chip ll-chip--warm" data-ll-factor-last="fell">
              Reste {r} : le fossé ne change pas
            </span>
          </>
        )
      }
    >
      <svg viewBox={`0 0 ${VW} ${VH}`} data-ll-factor-tool data-left={left} data-planks={planks.join(',')}>
        {/* the ladder, as a copybook writes it: the numbers, a bar, the planks that filled */}
        <text x="40" y="30" fontSize="18" style={{ fill: 'rgb(var(--w-ink))' }}>
          L’échelle
        </text>
        <line
          x1="185"
          y1={50}
          x2="185"
          y2={50 + rows.length * rowH}
          stroke="rgb(var(--w-cyan-ink))"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {rows.map((x, k) => (
          <g key={k} data-ll-factor-rung={x.n}>
            <text
              x="170"
              y={50 + (k + 0.75) * rowH}
              textAnchor="end"
              fontSize={size}
              fontWeight="700"
              style={{ ...LTR, fill: x.p === null ? 'rgb(var(--w-gold-ink))' : 'rgb(var(--w-ink))' }}
            >
              {f(x.n)}
            </text>
            {x.p !== null && (
              <text
                x="200"
                y={50 + (k + 0.75) * rowH}
                fontSize={size}
                fontWeight="700"
                style={{ ...LTR, fill: 'rgb(var(--w-green-ink))' }}
              >
                {f(x.p)}
              </text>
            )}
          </g>
        ))}
        {/* the gap now, and the last lay over the gap it was laid on */}
        <text
          x={X_GAP}
          y="34"
          fontSize="20"
          fontWeight="700"
          style={{ fill: 'rgb(var(--w-ink))' }}
          data-ll-factor-gap={left}
        >
          {done ? 'Le fossé est franchi' : `Fossé : ${cells(left)}`}
        </text>
        <rect
          x={X_GAP}
          y="50"
          width={W_GAP}
          height="32"
          rx="6"
          fill="rgb(var(--w-ink) / 0.08)"
          stroke="rgb(var(--w-ink) / 0.55)"
          strokeWidth="1.5"
        />
        {last && (
          <g data-ll-factor-lay-drawn={`${last.plank}:${last.held ? 'held' : 'fell'}`}>
            {q <= EACH ? (
              Array.from({ length: q }, (_, k) => (
                <rect
                  key={k}
                  x={X_GAP + k * last.plank * u + 1}
                  y="53"
                  width={Math.max(1, last.plank * u - 2)}
                  height="26"
                  rx="3"
                  fill={last.held ? 'rgb(var(--w-green))' : 'rgb(var(--w-cyan))'}
                />
              ))
            ) : (
              <rect
                x={X_GAP + 1}
                y="53"
                width={q * last.plank * u - 2}
                height="26"
                rx="3"
                fill={last.held ? 'rgb(var(--w-green))' : 'rgb(var(--w-cyan))'}
              />
            )}
            {r > 0 && (
              <rect x={X_GAP + q * last.plank * u} y="53" width={r * u} height="26" rx="3" fill="rgb(var(--w-gold))" />
            )}
            <text
              x={X_GAP}
              y="108"
              fontSize="18"
              style={{ ...LTR, fill: last.held ? 'rgb(var(--w-green-ink))' : 'rgb(var(--w-gold-ink))' }}
            >
              {`${counted(q, ['planche', 'planches'])} de ${f(last.plank)} sur ${cells(last.before)}${r ? `, reste ${f(r)}` : ''}`}
            </text>
          </g>
        )}
        {/* the rack: the hand takes a plank */}
        {RACK.map((d, k) => {
          const { x, y } = chipAt(k);
          const off = done || d > left;
          return (
            <g
              key={d}
              className={off ? '' : 'll-handle'}
              onClick={() => lay(d)}
              opacity={off ? 0.35 : 1}
              data-ll-factor-plank={d}
            >
              {!off && !last && planks.length === 0 && k === 0 && (
                <rect
                  className="ll-pulse"
                  x={x - 4}
                  y={y - 4}
                  width={CHIP.w + 8}
                  height={CHIP.h + 8}
                  rx="14"
                  fill="rgb(var(--w-gold))"
                />
              )}
              <rect
                x={x}
                y={y}
                width={CHIP.w}
                height={CHIP.h}
                rx="10"
                fill="rgb(var(--w-cyan-ink) / 0.12)"
                stroke={fellHere === d ? 'rgb(var(--w-gold-ink))' : 'rgb(var(--w-cyan-ink))'}
                strokeWidth={fellHere === d ? 3 : 1.5}
              />
              <text
                x={x + CHIP.w / 2}
                y={y + 30}
                textAnchor="middle"
                fontSize="22"
                fontWeight="800"
                style={{ fill: 'rgb(var(--w-ink))' }}
              >
                {d}
              </text>
            </g>
          );
        })}
        {(() => {
          const { x, y } = chipAt(RACK.length);
          const off = done;
          return (
            <g
              className={off ? '' : 'll-handle'}
              onClick={() => lay(left)}
              opacity={off ? 0.35 : 1}
              data-ll-factor-whole
            >
              <rect
                x={x}
                y={y}
                width={CHIP.w + CHIP.step}
                height={CHIP.h}
                rx="10"
                fill="rgb(var(--w-gold-ink) / 0.12)"
                stroke="rgb(var(--w-gold-ink))"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text
                x={x + (CHIP.w + CHIP.step) / 2}
                y={y + 29}
                textAnchor="middle"
                fontSize="17"
                fontWeight="700"
                style={{ fill: 'rgb(var(--w-gold-ink))' }}
              >
                Tout le fossé
              </text>
            </g>
          );
        })()}
        {/* the row of planks laid — then, once the gap is 1 case, the SAME row as the product of the number, in its place
            (2026-11-23: both lines at once printed the same product twice, « Rangée : 2 × 2 … » over « 8 192 = 2 × 2 … ») */}
        {done ? (
          <text
            x={X_GAP}
            y="300"
            fontSize={planks.length > 8 ? 17 : 24}
            fontWeight="800"
            style={{ ...LTR, fill: 'rgb(var(--w-green-ink))' }}
            data-ll-factor-product
          >
            {`${f(a)} = ${row}`}
          </text>
        ) : (
          <text
            x={X_GAP}
            y="288"
            fontSize={planks.length > 8 ? 17 : 21}
            fontWeight="700"
            style={{ ...LTR, fill: 'rgb(var(--w-ink))' }}
            data-ll-factor-row
          >
            {planks.length ? `Rangée : ${row}` : 'Rangée : aucune planche'}
          </text>
        )}
      </svg>
    </Tool>
  );
}
