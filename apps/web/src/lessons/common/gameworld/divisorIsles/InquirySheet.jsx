/**
 * THE INVESTIGATION `sheet` of this world (see `Inquiry.jsx`, which mounts it; logic and state machine: `sheet.js`).
 * A number too large to try by hand, and a spreadsheet drawn in DOM: the column letters, the row numbers, column A the
 * primes, column B the remainder of the number by A — its first cell shows the formula a spreadsheet would hold
 * (« =MOD(2431;A2) », filled down), the cells under it plain numbers the world fills one by one. He clicks the line he
 * reads as dividing: the number becomes the quotient, a line of the notebook is written and the sheet is filled again
 * (shorter, with the default stop); a line whose remainder is not 0 is marked with that remainder — what happened. When he
 * reads no 0 he says the number is prime: accepted when no line has the remainder 0, else refused by the lesson's
 * sentence (`notPrime`) — the lines with 0 are NOT outlined: he reads the sheet again himself (main session,
 * 2026-11-23: the world does not do the reading for him); the line he then clicks plays as any line.
 *
 * More than ten lines stand in two blocks side by side, the rows numbered on (3 127 needs the primes up to 53: 16 lines);
 * nothing scrolls. `spec.text` is the lesson's wording (GAME_WORLD.md « Explore », spec shape of `sheet`). Nothing here
 * states a rule: every sentence says what the sheet has just shown. The screen is a pure VIEW of the reducer (`SheetView`).
 */
import { useEffect, useReducer } from 'react';
import MathText from '../../components/MathText';
import { texFr } from '@smarter-academy/core';
import { initSheet, sheetNow, sheetReducer, sheetResult } from './sheet';
import { Head, Found } from './InquiryDivision';
import { expose, FAST } from './inquiryParts';
import './inquirySheet.css';

const ONE_BLOCK = 10; // up to ten lines in one block; more are cut into two blocks of equal height
/** The formula of column B as a French spreadsheet writes it (LibreOffice Calc and Excel in French: MOD, « ; »). */
const modFormula = (n, cell) => `=MOD(${n};${cell})`;

/** The lines cut into blocks: one block up to ten lines, else two, the first one the longer. */
function blocksOf(lines) {
  if (lines.length <= ONE_BLOCK) return [lines.map((l, i) => ({ ...l, row: i + 2 }))];
  const half = Math.ceil(lines.length / 2);
  return [lines.slice(0, half), lines.slice(half)].map((part, b) =>
    part.map((l, i) => ({ ...l, row: b * half + i + 2 })),
  );
}

/** One block of the sheet: the column letters, the header row (A1 the lesson's word, B1 the formula), the lines. */
function Block({ T, n, lines, rows, filled, s, onLine, first }) {
  const pick = s.stage === 'pick';
  return (
    <div className="iq-sheet__block" data-iq-block={first ? 1 : 2} style={{ '--rows': rows }}>
      <div className="iq-sheet__row iq-sheet__row--letters">
        <span className="iq-sheet__corner" />
        <span>A</span>
        <span>B</span>
      </div>
      {first ? (
        <div className="iq-sheet__row iq-sheet__row--head">
          <span className="iq-sheet__n">1</span>
          <span>{T.primeHead}</span>
          {/* a spreadsheet's formula is what a machine reads: no thousands space inside it (`data-machine-text`) */}
          <span className="iq-sheet__formula" data-iq-formula data-machine-text>
            {(T.formula ?? modFormula)(n, 'A2')}
          </span>
        </div>
      ) : (
        // the second block continues the first: its header row is the first block's, shown dimmed
        <div className="iq-sheet__row iq-sheet__row--head is-echo" aria-hidden="true">
          <span className="iq-sheet__n">1</span>
          <span>{T.primeHead}</span>
          <span className="iq-sheet__formula" data-machine-text>
            {(T.formula ?? modFormula)(n, 'A2')}
          </span>
        </div>
      )}
      {lines.map((l) => {
        const shown = l.row - 2 < filled;
        const last = s.last?.type === 'line' && s.last.before === n && s.last.p === l.p ? s.last : null;
        const look = last ? (last.held ? 'is-held' : 'is-miss') : '';
        return (
          <button
            key={l.p}
            type="button"
            className={`iq-sheet__row iq-sheet__line ${look}`}
            onClick={() => onLine(l.p)}
            disabled={!pick}
            data-iq-line={l.p}
            {...(shown ? { 'data-iq-rest': l.r } : {})}
            {...(last ? { 'data-iq-said': last.held ? 'held' : 'miss' } : {})}
          >
            <span className="iq-sheet__n">{l.row}</span>
            <span>{l.p}</span>
            <span className="iq-sheet__b">{shown ? l.r : ''}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SheetView({ spec, state: s, act }) {
  const T = spec.text;
  const now = sheetNow(spec, s);
  const { n0, n, lines } = now;
  const seen = s.stage === 'seen';
  const isLast = s.ri + 1 >= spec.rounds.length;
  const blocks = blocksOf(lines);
  const rows = Math.max(...blocks.map((b) => b.length), 1);
  const notes = s.attempts.filter((a) => a.type === 'line' && a.held);
  const refused = s.last?.type === 'prime' && !s.last.held && s.last.before === n ? s.last : null;

  let fact = ' ';
  if (seen) fact = T.end({ n: n0, factors: s.factors, attempts: s.attempts });
  else if (refused) fact = T.notPrime({ n, zeros: refused.zeros });
  else if (s.last?.type === 'line') fact = s.last.held ? T.held(s.last) : T.miss(s.last);

  return (
    <section
      className="iq iq--div iq--sheet"
      data-iq="sheet"
      data-iq-stage={s.stage}
      data-iq-n={n}
      data-iq-lines={lines.length}
    >
      <Head i={s.ri} n={spec.rounds.length} lead={T.lead(n0)} goal={T.goal(n0)} />

      <div className="iq-sheet-main">
        {!seen && (
          <div className="iq-sheet" dir="ltr" data-iq-sheet data-iq-blocks={blocks.length}>
            {blocks.map((b, k) => (
              <Block
                key={`${n}-${k}`}
                T={T}
                n={n}
                lines={b}
                rows={rows}
                filled={s.filled}
                s={s}
                onLine={act.line}
                first={k === 0}
              />
            ))}
          </div>
        )}
        <div className="iq-sheet-notes" data-iq-notes={notes.length}>
          {T.notebook && <small>{T.notebook}</small>}
          <ol>
            {notes.map((a) => (
              <li key={`${a.before}-${a.p}`} data-iq-note={`${a.before}:${a.p}:${a.after}`}>
                <MathText>{`$${texFr(a.before)} \\div ${a.p} = ${texFr(a.after)}$`}</MathText>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="iq-fact" data-iq-fact>
        <MathText>{fact}</MathText>
      </p>

      <div className="iq-actions">
        {!seen && (
          <>
            <p className="iq-askline">
              <MathText>{T.ask({ n, lines: lines.length })}</MathText>
            </p>
            <button type="button" className="rf-btn" onClick={act.prime} disabled={s.stage !== 'pick'} data-iq-prime>
              {T.prime}
            </button>
          </>
        )}
        {seen && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
            {isLast ? T.done : T.next}
          </button>
        )}
      </div>

      <Found
        lines={s.rounds.map((r) => ({ key: `${r.n}`, text: T.foundLine(r), fell: r.attempts.some((a) => !a.held) }))}
      />
    </section>
  );
}

export function Sheet({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => sheetReducer(spec, s, a), spec, initSheet);
  const now = sheetNow(spec, state);
  expose({
    kind: 'sheet',
    ri: state.ri,
    n: state.n,
    stage: state.stage,
    lines: now.lines.map((l) => l.p),
    filled: state.filled,
    factors: state.factors,
    attempts: state.attempts.length,
    rounds: state.rounds,
  });
  // the world fills column B, a cell at a time
  useEffect(() => {
    if (state.stage !== 'fill') return undefined;
    const t = setTimeout(
      () => {
        if (state.filled < now.lines.length) play('sweep', state.filled);
        dispatch({ type: 'tick' });
      },
      FAST() ? 15 : 140,
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one timer per cell the world fills
  }, [state.stage, state.filled, state.n, state.ri]);
  useEffect(() => {
    if (state.stage === 'seen') play('gate');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once at the end of a round
  }, [state.stage]);

  const act = {
    line(p) {
      const after = sheetReducer(spec, state, { type: 'line', p });
      if (after === state) return;
      play(after.last.held ? 'plank' : 'hit');
      dispatch({ type: 'line', p });
    },
    prime() {
      const after = sheetReducer(spec, state, { type: 'prime' });
      if (after === state) return;
      play(after.last.held ? 'key' : 'fail');
      dispatch({ type: 'prime' });
    },
    next() {
      const after = sheetReducer(spec, state, { type: 'next' });
      if (after.done) onDone(sheetResult(after));
      else dispatch({ type: 'next' });
    },
  };
  return <SheetView spec={spec} state={state} act={act} />;
}
