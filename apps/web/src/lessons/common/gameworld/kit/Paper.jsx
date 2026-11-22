/**
 * « Mode papier » — the paper mode of the practice games and of the last bridge (logic: paper.js).
 * An exam has no music and no gates: it has a sheet, a pen and a method. Four pieces, shared by every screen that asks for
 * written work (the trainer's exam questions, the depot's calculation steps, the store of the last bridge):
 *   PaperChip   the sign of the mode — « Sans musique » and a quiet clock (time awareness, never a countdown);
 *   PaperGate   « Prends ton stylo et ta feuille »: the answer boxes stay closed until the student says he wrote on his paper;
 *   MethodStrip the six gestures of an exam answer;
 *   PaperModel  a model sheet: a division POSED as on paper, one step per tap, each step said aloud, then the check and the
 *               sentence to write. Before answering it shows a TWIN example; after the correction, the student's own question.
 */
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { PenLine, VolumeX, Timer, ArrowRight, RotateCcw } from 'lucide-react';
import MathText from '../../components/MathText';
import { longDivision, paperRows, quotientSoFar, thinking, conclusion, METHOD } from './longDivision';
import Fit, { cardRoom } from './Fit';
import { PT } from './text';

export { PT };

function MethodStrip({ now }) {
  return (
    <ol className="di-method" aria-label={PT.method}>
      {METHOD.map((m, i) => (
        <li key={m.id} className={m.id === now ? 'is-now' : ''}>
          <b>{i + 1}</b>
          {m.text}
        </li>
      ))}
    </ol>
  );
}

/** The sign of the paper mode, with the time spent on the sheet (it counts UP: an exam is long, the student learns to feel it). */
export function PaperChip({ className = '' }) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSec((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className={`di-pchip ${className}`} data-di-paper>
      <PenLine size={15} /> {PT.mode} · <VolumeX size={14} /> {PT.silent}
      <span className="di-pchip__time" dir="ltr">
        <Timer size={13} /> {String(Math.floor(sec / 60)).padStart(2, '0')}:{String(sec % 60).padStart(2, '0')}
      </span>
    </span>
  );
}

/**
 * The answer boxes (`children`) open only after « J’ai écrit sur ma feuille ». A few seconds must pass first — the time to pick up the
 * pen — so a reflex tap is not possible. `onModel` adds « Comment l’écrire sur la feuille ? ».
 */
export function PaperGate({ tip, onModel, children, delay = 5 }) {
  const fast = import.meta.env.DEV && typeof window !== 'undefined' && window.__paperFast;
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(fast ? 0 : delay);
  useEffect(() => {
    if (left <= 0) return undefined;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  if (open) return children;
  return (
    <div className="di-pgate" data-di-pgate>
      <span className="di-pgate__pen">
        <PenLine size={26} />
      </span>
      <div className="di-pgate__text">
        <strong>{PT.take}</strong>
        <p>{tip}</p>
      </div>
      <div className="di-pgate__btns">
        <button
          type="button"
          className="di-btn di-btn--primary"
          disabled={left > 0}
          onClick={() => setOpen(true)}
          data-di-pgate-go
        >
          {left > 0 ? PT.wait(left) : PT.go}
        </button>
        {onModel && (
          <button type="button" className="di-link" onClick={onModel} data-di-pgate-model>
            {PT.how}
          </button>
        )}
      </div>
    </div>
  );
}

/** The model sheet: the division of a by b written as on paper, one step per tap. `own` = it is the student's own question. */
export function PaperModel({ a, b, own = false, onClose }) {
  const d = useMemo(() => longDivision(a, b), [a, b]);
  const steps = d.steps.length;
  const [n, setN] = useState(1); // 1 … steps: the division; steps + 1: the check; steps + 2: the sentence
  const shown = Math.min(n, steps);
  const end = conclusion(d);
  const stage = n <= steps ? 'compute' : n === steps + 1 ? 'verify' : 'write';
  // drawn at the root of the game window, whatever panel asked for it (a panel may be transformed or clipped)
  return createPortal(
    <div
      className="di-veil di-veil--paper"
      data-di-model={own ? 'own' : 'twin'}
      data-di-model-a={a}
      data-di-model-b={b}
    >
      <div className="di-card di-card--wide di-pmodel" role="dialog" aria-modal="true">
        <Fit avail={cardRoom}>
          <p className="di-card__eyebrow">{own ? PT.own : PT.twin}</p>
          <MethodStrip now={stage} />
          <div className="di-pmodel__body">
            <div className="di-pmodel__sheet">
              <small>{PT.sheet}</small>
              <div className="di-potence" dir="ltr" style={{ '--w': d.width }}>
                <div className="di-potence__left">
                  <div className="di-potence__row">{a}</div>
                  {paperRows(d, shown).map((r, i) => (
                    <div
                      key={i}
                      className={`di-potence__row is-${r.kind} ${r.last ? 'is-last' : ''}`}
                      style={{ paddingRight: `calc(${d.width - 1 - r.end} * 1ch)` }}
                    >
                      {r.kind === 'minus' && <i>−</i>}
                      {r.text}
                    </div>
                  ))}
                </div>
                <div className="di-potence__right">
                  <div>{b}</div>
                  <div className="di-potence__q">{quotientSoFar(d, shown)}</div>
                </div>
              </div>
              {stage === 'write' && (
                <div className="di-pmodel__final" data-di-model-final>
                  <small>{PT.write}</small>
                  <p>
                    <MathText>{end.equality}</MathText>
                  </p>
                  <p>{end.sentence}</p>
                </div>
              )}
            </div>
            <div className="di-pmodel__talk" data-di-model-talk>
              <small>{stage === 'compute' ? PT.think : stage === 'verify' ? PT.verify : PT.write}</small>
              {stage === 'compute' &&
                thinking(d, shown - 1).map((l) => (
                  <p key={l}>
                    <MathText>{l}</MathText>
                  </p>
                ))}
              {stage === 'verify' && (
                <p>
                  <MathText>{end.check}</MathText>
                </p>
              )}
              {stage === 'write' && (
                <>
                  <p>
                    <MathText>{end.equality}</MathText>
                  </p>
                  <p>{end.sentence}</p>
                </>
              )}
            </div>
          </div>
          <div className="di-row">
            {stage !== 'write' && (
              <button
                type="button"
                className="di-btn di-btn--primary"
                onClick={() => setN((x) => x + 1)}
                data-di-model-next
                autoFocus
              >
                {PT.next} <ArrowRight size={16} />
              </button>
            )}
            {stage === 'write' && (
              <button type="button" className="di-btn di-btn--primary" onClick={onClose} data-di-model-close autoFocus>
                {PT.back}
              </button>
            )}
            {n > 1 && (
              <button type="button" className="di-link" onClick={() => setN(1)}>
                <RotateCcw size={14} /> {PT.replay}
              </button>
            )}
            {stage !== 'write' && (
              <button type="button" className="di-link" onClick={onClose}>
                {PT.back}
              </button>
            )}
          </div>
        </Fit>
      </div>
    </div>,
    document.querySelector('[data-gameworld]') ?? document.body,
  );
}
