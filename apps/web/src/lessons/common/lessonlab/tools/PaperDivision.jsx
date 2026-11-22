/**
 * « القسمة على الورقة » — the Euclidean division as it is WRITTEN on a sheet, one step at a time, with the student's own
 * numbers; beside it, what one says to oneself at that step. (The steps and the sentences: gameworld/kit/longDivision.js.)
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Tool, Txt, useChime } from '../kit';
import { longDivision, paperRows, quotientSoFar, thinking, conclusion } from '../../gameworld/kit/longDivision';

export default function PaperDivision({ a, b, play, report }) {
  const d = useMemo(() => longDivision(a, b), [a, b]);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
  }, [a, b]);
  const done = shown >= d.steps.length;
  const c = conclusion(d);
  useEffect(() => {
    report({ key: `${a}:${b}`, done });
  }, [done, a, b]); // eslint-disable-line react-hooks/exhaustive-deps
  useChime(play, d.r === 0 ? 'fit' : 'rest', done, [done, a, b], { delay: 300 });
  const digits = String(a).split('');
  const rows = paperRows(d, shown);
  const cols = d.width + 1;
  const line = (text, end, kind, last) =>
    Array.from({ length: cols }, (_, g) => {
      const col = g - 1;
      const from = end - text.length + 1;
      if (kind === 'minus' && col === from - 1)
        return (
          <span key={g} className="is-sign">
            −
          </span>
        );
      if (col < from || col > end) return <span key={g} />;
      return (
        <span
          key={g}
          className={
            kind === 'minus'
              ? 'is-minus'
              : last && done
                ? 'is-rest'
                : kind === 'rest' && col === end && text.length > 1 && !last
                  ? 'is-new'
                  : ''
          }
        >
          {text[col - from]}
        </span>
      );
    });
  return (
    <Tool
      id="paper"
      tone={done ? (d.r === 0 ? 'good' : 'warm') : 'plain'}
      actions={
        <>
          <button
            type="button"
            className="ll-btn"
            onClick={() => {
              setShown(shown + 1);
              play('pencil');
            }}
            disabled={done}
            data-ll-step
          >
            الخطوة التالية ◂
          </button>
          <button
            type="button"
            className="ll-btn ll-btn--ghost"
            onClick={() => {
              setShown(Math.max(0, shown - 1));
              play('erase');
            }}
            disabled={shown === 0}
            data-ll-back
          >
            تراجع
          </button>
        </>
      }
      reading={
        done ? (
          <>
            <span className={`ll-chip ${d.r === 0 ? 'll-chip--good' : 'll-chip--warm'}`} data-ll-paper-done>
              {c.sentence}
            </span>
          </>
        ) : (
          <span className="ll-chip ll-chip--dim">
            الخطوة {shown} من {d.steps.length}
          </span>
        )
      }
    >
      <div className="ll-paper">
        <div className="ll-sheet" data-ll-sheet>
          <div className="ll-sheet__left" style={{ gridTemplateColumns: `repeat(${cols}, 1.5rem)` }}>
            <span />
            {digits.map((x, i) => (
              <span key={i}>{x}</span>
            ))}
            {rows.map((r, i) => (
              <React.Fragment key={i}>{line(r.text, r.end, r.kind, r.last)}</React.Fragment>
            ))}
          </div>
          <div className="ll-sheet__right">
            <div>{b}</div>
            <div data-ll-quotient>{quotientSoFar(d, shown) || ' '}</div>
          </div>
        </div>
        <div className="ll-think" data-ll-think>
          <h5>{done ? 'أتحقّق وأكتب الجواب' : shown === 0 ? 'قبل أن أبدأ' : 'أقول في نفسي'}</h5>
          {shown === 0 && (
            <p>
              أكتب المقسوم {a} على اليسار، والمقسوم عليه {b} على اليمين. أبدأ من يسار المقسوم.
            </p>
          )}
          {shown > 0 &&
            thinking(d, shown - 1).map((t, i) => (
              <p key={`${shown}-${i}`}>
                <Txt>{t}</Txt>
              </p>
            ))}
          {done && (
            <p>
              <Txt>{c.check}</Txt>
            </p>
          )}
        </div>
      </div>
    </Tool>
  );
}
