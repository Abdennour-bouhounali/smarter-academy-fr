/**
 * « كاشف قابلية القسمة » — the number is a PADLOCK of digits the student rolls; six lamps (2, 3, 4, 5, 9, 10) light when the
 * number is divisible. Tap a lamp: the digits ITS rule reads rise on the padlock, with what the rule reads in them.
 */
import { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Tool, useChime } from '../kit';
import { digitRules, rollDigit } from '../logic';

export default function Rules({ a, setA, play }) {
  const len = String(a).length;
  const [width, setWidth] = useState(Math.max(3, len));
  const [sel, setSel] = useState(null);
  useEffect(() => {
    if (len > width) setWidth(len);
  }, [len]); // eslint-disable-line react-hooks/exhaustive-deps
  const w = Math.max(width, len);
  const str = String(a).padStart(w, '0');
  const pad = w - len;
  const R = digitRules(a);
  const cur = R.find((r) => r.by === sel) ?? null;
  const read = new Set((cur?.digits ?? []).map((i) => i + pad));
  const roll = (i, step) => {
    const v = rollDigit(a, i, step, w);
    setA(v);
    play('click', Number(String(v).padStart(w, '0')[i]));
  };
  const lit = R.filter((r) => r.ok).length;
  useChime(play, 'lamps', lit > 0, [a], { p: lit }); // one soft note per lamp that is lit: the number of rules that hold is HEARD
  return (
    <Tool
      id="rules"
      tone={cur ? (cur.ok ? 'good' : 'warm') : 'plain'}
      reading={
        cur ? (
          <>
            <span>{cur.reads}</span>
            <span
              className={`ll-chip ${cur.ok ? 'll-chip--good' : 'll-chip--warm'}`}
              data-ll-rule={cur.by}
              data-ll-rule-ok={cur.ok ? '1' : '0'}
            >
              {a} {cur.ok ? 'يقبل' : 'لا يقبل'} القسمة على {cur.by}
            </span>
          </>
        ) : (
          <span className="ll-chip ll-chip--dim">أدِر الأرقام، ثمّ اضغط مصباحًا لترى ماذا تقرأ قاعدته في العدد.</span>
        )
      }
    >
      <div className="ll-rules">
        <div className="ll-lock" data-ll-lock={a}>
          <div className="ll-lock__side">
            <button
              type="button"
              className="ll-btn ll-btn--ghost"
              disabled={w >= 4}
              onClick={() => {
                setWidth(w + 1);
                play('ui');
              }}
              data-ll-wider
            >
              + رقم
            </button>
            <button
              type="button"
              className="ll-btn ll-btn--ghost"
              disabled={w <= 1}
              onClick={() => {
                setA(a % 10 ** (w - 1));
                setWidth(w - 1);
                play('ui');
              }}
              data-ll-narrower
            >
              − رقم
            </button>
          </div>
          {str.split('').map((ch, i) => (
            <div key={i} className={`ll-wheel ${read.has(i) ? 'is-read' : ''} ${i < pad ? 'is-pad' : ''}`}>
              <button type="button" onClick={() => roll(i, 1)} aria-label="+1" data-ll-up={i}>
                <ChevronUp size={20} />
              </button>
              <b>{ch}</b>
              <button type="button" onClick={() => roll(i, -1)} aria-label="−1" data-ll-down={i}>
                <ChevronDown size={20} />
              </button>
            </div>
          ))}
        </div>
        <p className="ll-lamps__cap">هل يقبل {a} القسمة…</p>
        <div className="ll-lamps">
          {R.map((r) => (
            <button
              key={r.by}
              type="button"
              className={`ll-lamp ${r.ok ? 'is-ok' : ''} ${sel === r.by ? 'is-sel' : ''}`}
              onClick={() => {
                setSel(sel === r.by ? null : r.by);
                play('lamp', r.ok ? 1 : 0);
              }}
              data-ll-lamp={r.by}
              data-ll-lit={r.ok ? '1' : '0'}
            >
              <i>💡</i>
              <strong>على {r.by}</strong>
            </button>
          ))}
        </div>
      </div>
    </Tool>
  );
}
