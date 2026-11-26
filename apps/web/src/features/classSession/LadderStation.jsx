/**
 * A FACTOR LADDER on the board (step kind `ladder`, CLASS_SESSION.md §5ter): ONE gap of the `divisorIsles` world, broken
 * plank by plank. The class proposes the next plank; a tap lays it and the world answers — it holds: the gap becomes the
 * number of planks laid and a rung is written (« 168 = 2 × 84 »); it falls: the gap stays, its division and what is left
 * are written beside the plank. The ladder grows on the left as a copybook writes it (the numbers, a bar, the planks),
 * until the gap is 1 case; then the row of planks is written as one product, and the step's proof (`after`) comes.
 * « Une autre échelle » starts again on the same gap and keeps the finished ladders beside it (two at most), so the class
 * compares its rows. In sheet mode the rack is a SHEET of remainders (column A the primes up to the stop, column B the
 * remainders, `divisorIsles/sheet.js`): the class reads a 0 and taps its line, or says that no remainder is 0.
 * Pure logic: `lessonScripts.js › ladder*`. Every sentence is a fact of what was laid; no rule is stated here.
 */
import { useState } from 'react';
import { RotateCcw, Undo2 } from 'lucide-react';
import MathText from '../../lessons/common/components/MathText';
import { playSfx } from '../../lessons/common/utils/playEffect';
import {
  fellTex,
  groupText,
  ladderBreaks,
  ladderCells,
  ladderDone,
  ladderLay,
  ladderNoZero,
  ladderRack,
  ladderSheet,
  ladderStart,
  ladderTex,
  ladderUndo,
  leftCells,
  rowGroups,
  rungTex,
  ladderRow,
} from './lessonScripts';
import { formatFr, texFr } from '@smarter-academy/core';
import { listFr } from '../../lessons/common/gameworld/kit/authoring/numbers';

export const LADDER_WORDS = {
  gap: 'Fossé à franchir',
  crossed: 'Le fossé est franchi',
  plank: 'Planche',
  whole: 'Tout le fossé',
  rest: (r) => `reste ${formatFr(r)}`,
  pick: 'Quelle planche, maintenant ?',
  sheetPick: 'Touchez la ligne dont le reste est 0.',
  colA: 'A',
  colB: 'B',
  formula: (n) => `=MOD(${n};A2)`,
  noZero: 'Aucun reste nul',
  zeros: 'Regardez la colonne B : un reste vaut 0.',
  undo: 'Retirer la dernière planche',
  another: 'Une autre échelle',
  earlier: 'Nos échelles',
  row: 'La rangée de planches',
  // under a FINISHED ladder: which of its planks are still laid in shorter planks — a fact of the row, no rule
  breaks: 'Ces planches se posent encore en planches plus courtes :',
  unbroken: 'Aucune planche de cette rangée ne se pose en planches plus courtes.',
};
/** The most finished ladders kept beside the one being built. */
const LADDER_KEEP = 2;
/**
 * Lines a column of the sheet holds: FIVE — 15 lines (2 387) in three columns. Eight a column left each line about 15 px
 * high under the gap and the question at 1366×768: the numbers of the lines were written over one another (first French
 * lesson's board walk, 2026-11-23).
 */
export const MAX_LINES_COLUMN = 5;
const sfx = (name) => playSfx(name, { enabled: true });

/** The ladder as a copybook writes it: each number on the left, the plank that held on the right of the bar. */
function Rungs({ st }) {
  const rows = [...st.rungs.map((r) => ({ n: r.before, p: r.plank })), { n: st.gap, p: null }];
  return (
    <ol
      className="cs-ladder__rungs"
      data-rows={rows.length > 7 ? 'many' : undefined}
      data-cs-ladder-rungs={rows.length}
    >
      {rows.map((r, k) => (
        <li key={k} className={r.p === null ? 'is-now' : ''} data-cs-ladder-rung={r.n}>
          <b>{formatFr(r.n)}</b>
          <i aria-hidden="true" />
          <span>{r.p === null ? '' : formatFr(r.p)}</span>
        </li>
      ))}
    </ol>
  );
}

/** The planks on offer: each one a card; a plank that already fell on this gap shows what it left. */
function Rack({ step, st, onLay }) {
  const done = ladderDone(st);
  return (
    <div className="cs-ladder__rack" data-cs-ladder-rack>
      {ladderRack(step, st).map(({ d, whole }) => {
        const f = st.fell.find((x) => x.plank === d);
        return (
          <button
            key={whole ? 'whole' : d}
            type="button"
            className={`cs-ladder__plank ${f ? 'is-fell' : ''} ${whole ? 'is-whole' : ''}`}
            onClick={() => onLay(d)}
            disabled={done || d > st.gap}
            data-cs-ladder-plank={whole ? 'whole' : d}
          >
            <small>{whole ? LADDER_WORDS.whole : LADDER_WORDS.plank}</small>
            <b>{formatFr(d)}</b>
            {f && <em>{LADDER_WORDS.rest(f.r)}</em>}
          </button>
        );
      })}
    </div>
  );
}

/** The sheet of remainders for the gap now: column A the primes, column B the remainders (laid in columns of eight). */
function Sheet({ step, st, onLay, onNoZero }) {
  const lines = ladderSheet(step, st);
  const cols = Math.max(1, Math.ceil(lines.length / MAX_LINES_COLUMN));
  return (
    <div className="cs-ladder__sheet" data-cs-ladder-sheet={lines.length}>
      {/* the formula of column B and « Aucun reste nul » on ONE row above the lines: the lines keep the height */}
      <div className="cs-ladder__sheethead">
        <p className="cs-ladder__formula">
          <span>{LADDER_WORDS.colB}</span>
          <code>{LADDER_WORDS.formula(st.gap)}</code>
        </p>
        <button type="button" className="cs-btn" onClick={onNoZero} data-cs-ladder-nozero>
          {LADDER_WORDS.noZero}
        </button>
      </div>
      <div className="cs-ladder__lines" style={{ '--cols': cols }}>
        {lines.map((l, k) => {
          const tried = st.fell.find((x) => x.plank === l.p);
          const zero = st.zeros?.includes(l.p);
          return (
            <button
              key={l.p}
              type="button"
              className={`cs-ladder__line ${tried ? 'is-fell' : ''} ${zero ? 'is-zero' : ''}`}
              style={{ '--d': `${k * 60}ms` }}
              onClick={() => onLay(l.p)}
              data-cs-ladder-line={l.p}
              data-cs-ladder-r={l.r}
            >
              <span>{l.p}</span>
              <b>{formatFr(l.r)}</b>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The fact of the last plank laid: its rung, or its division and what is left. Once the ladder is FINISHED its last rung
 * (« 4 = 4 × 1 ») says nothing: the fact is then what its row still hides — each plank laid in shorter planks.
 */
function Last({ st }) {
  if (st.zeros) return <p className="cs-ladder__fact is-fell">{LADDER_WORDS.zeros}</p>;
  if (!st.last) return null;
  if (ladderDone(st)) {
    const breaks = ladderBreaks(ladderRow(st));
    return (
      <p className="cs-ladder__fact is-held is-breaks" data-cs-ladder-breaks={breaks.map((b) => b.p).join(',')}>
        {breaks.length ? (
          <>
            {LADDER_WORDS.breaks} <MathText>{listFr(breaks.map((b) => `$${b.tex}$`))}</MathText>
          </>
        ) : (
          LADDER_WORDS.unbroken
        )}
      </p>
    );
  }
  const l = st.last;
  return (
    <p className={`cs-ladder__fact ${l.held ? 'is-held' : 'is-fell'}`} data-cs-ladder-last={l.held ? 'held' : 'fell'}>
      <span dir="ltr">
        <MathText>{`$${l.held ? rungTex(l) : fellTex(l.before, l)}$`}</MathText>
      </span>
      {!l.held && <em>{leftCells(l.r)}</em>}
    </p>
  );
}

/** The pure view of the station: what the board draws for a ladder `st` (and the ladders finished before it). */
export function LadderView({ step, st, earlier = [], onLay, onNoZero, onUndo, onAnother }) {
  const done = ladderDone(st);
  // a lesson may name its gap in its own words (`step.words`: `start` before the first plank, `gap` after, `crossed`) —
  // a ladder on a lit stretch is not a gap to cross (a gate B of 2026-11-26)
  const W = { ...LADDER_WORDS, ...step.words };
  return (
    <div className="cs-ladderstep" data-cs-ladder={step.id} data-cs-ladder-done={done}>
      <p className="cs-say">
        <MathText>{step.text}</MathText>
      </p>
      <div className="cs-ladder__main" data-earlier={earlier.length ? '' : undefined}>
        <Rungs st={st} />
        <section className="cs-ladder__mid">
          <div className={`cs-ladder__gap ${done ? 'is-done' : ''}`} data-cs-ladder-gap={st.gap}>
            {done ? (
              <>
                <small>{W.crossed}</small>
                <span dir="ltr" data-cs-ladder-product>
                  <MathText>{`$${ladderTex(st)}$`}</MathText>
                </span>
              </>
            ) : (
              <>
                <small>{st.gap === step.n ? (W.start ?? W.gap) : W.gap}</small>
                <b>{ladderCells(st.gap)}</b>
              </>
            )}
          </div>
          {done && step.group ? (
            <ul className="cs-ladder__groups" data-cs-ladder-groups>
              {rowGroups(ladderRow(st)).map((g) => (
                <li key={g.p} data-cs-ladder-group={`${g.p}:${g.k}`}>
                  {groupText(g)}
                </li>
              ))}
            </ul>
          ) : (
            <Last st={st} />
          )}
          {!done &&
            (step.sheet ? (
              <Sheet step={step} st={st} onLay={onLay} onNoZero={onNoZero} />
            ) : (
              <Rack step={step} st={st} onLay={onLay} />
            ))}
        </section>
        {earlier.length > 0 && (
          <aside className="cs-ladder__earlier" data-cs-ladder-earlier={earlier.length}>
            <small>{LADDER_WORDS.earlier}</small>
            {earlier.map((e, k) => (
              <span key={k} dir="ltr">
                <MathText>{`$${texFr(e.n)} = ${ladderRow(e).map(texFr).join(' \\times ')}$`}</MathText>
              </span>
            ))}
          </aside>
        )}
      </div>
      <div className="cs-actrow">
        {done ? (
          <p className="cs-after is-right" data-cs-ladder-after>
            <span>
              <MathText>{step.after}</MathText>
            </span>
          </p>
        ) : (
          <p className="cs-quest">{step.question}</p>
        )}
        {done ? (
          <button type="button" className="cs-btn cs-btn--big" onClick={onAnother} data-cs-ladder-another>
            <RotateCcw size={20} /> {LADDER_WORDS.another}
          </button>
        ) : (
          st.rungs.length > 0 && (
            <button type="button" className="cs-btn cs-btn--big" onClick={onUndo} data-cs-ladder-undo>
              <Undo2 size={20} /> {LADDER_WORDS.undo}
            </button>
          )
        )}
      </div>
    </div>
  );
}

/** The station: the ladder being built, the ladders finished before it, the world's sounds. */
export default function LadderStation({ step }) {
  const [st, setSt] = useState(() => ladderStart(step.n));
  const [earlier, setEarlier] = useState([]);
  const lay = (d) => {
    const next = ladderLay(st, d);
    if (next === st) return;
    setSt(next);
    sfx(ladderDone(next) ? 'win' : next.last?.held ? 'correct' : 'notyet');
  };
  const noZero = () => {
    const next = ladderNoZero(step, st);
    setSt(next);
    sfx(next.zeros ? 'notyet' : ladderDone(next) ? 'win' : 'correct');
  };
  return (
    <LadderView
      step={step}
      st={st}
      earlier={earlier}
      onLay={lay}
      onNoZero={noZero}
      onUndo={() => setSt(ladderUndo(st))}
      onAnother={() => {
        setEarlier((e) => [...e, st].slice(-LADDER_KEEP));
        setSt(ladderStart(step.n));
      }}
    />
  );
}
