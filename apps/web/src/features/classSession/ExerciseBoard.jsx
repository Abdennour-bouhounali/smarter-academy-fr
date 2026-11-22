/**
 * « حصّة القسم » — an EXERCISE on the board of the class (owner, 2026-11-18: the teacher's practice space, rebuilt;
 * CLASS_SESSION.md §5quater). Opened from the teacher's bank (« على السبّورة »). One screen, one mouse:
 *   the statement stays on the board the whole time (the class never goes back to read it);
 *   the questions come one at a time; the teacher calls a student by his desk (« على السبّورة: نور »);
 *   a hint only when he asks, one at a time; the answer and its solution only when he asks.
 * Nothing is graded and nothing is recorded: it is the class working together. The text fits the board by itself (a long
 * statement is drawn smaller, never cut, never scrolled). Same shell and same dock as every other board screen.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lightbulb, NotebookPen, X } from 'lucide-react';
import ExerciseStatement from '../practice/ExerciseStatement';
import RichText from '../practice/RichText';
import MathText from '../../lessons/common/components/MathText';
import { ClassWindow, Speaker, BoardTools, BoardLayers, useBoardTools } from './board';
import { callName, teamsOf, teamOfStudent } from './session';
import { choicesOf, keyOf, summaryOf } from './exerciseBank';

const L = {
  exit: 'عودة إلى بنك التمارين',
  statement: 'نصّ التمرين',
  q: (i, n) => `السؤال ${i} من ${n}`,
  hint: 'تلميح',
  hintN: (k, n) => `تلميح ${k} من ${n}`,
  show: 'أظهر الجواب',
  hide: 'أخفِ الجواب',
  answer: 'الجواب',
  prev: 'السؤال السابق',
  next: 'السؤال التالي',
  done: 'أنهينا التمرين',
  turn: 'على السبّورة',
  pickBoard: 'من يأتي إلى السبّورة؟ اضغط طاولته.',
  time: (s) => `الوقت المقترح: ${Math.floor(s / 60)} د${s % 60 ? ` ${s % 60} ث` : ''}`,
};

/** Draws its content smaller when it is taller than its box — never cut, never scrolled. The box keeps its size. */
export function Fit({ children, className = '', watch }) {
  const box = useRef(null);
  const inner = useRef(null);
  useLayoutEffect(() => {
    const b = box.current;
    const n = inner.current;
    if (!b || !n) return undefined;
    // measured as drawn (bounding boxes): what counts is what the class sees, whatever the zoom of the page
    const fit = () => {
      let z = 1;
      n.style.zoom = 1;
      n.style.width = '100%';
      for (let k = 0; k < 6; k += 1) {
        const need = n.getBoundingClientRect().height;
        const have = b.getBoundingClientRect().height;
        if (need <= have + 1 || z <= 0.45) break;
        z = Math.max(0.45, z * Math.min(0.95, have / need));
        n.style.zoom = z;
        n.style.width = `${100 / z}%`;
      }
      b.dataset.csFit = z.toFixed(2);
    };
    fit();
    // the box itself changes when a name comes across the top or the window is resized: fit again
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
    ro?.observe(b);
    return () => ro?.disconnect();
  }, [watch]);
  return (
    <div ref={box} className={`cs-fitbox ${className}`}>
      <div ref={inner} className="cs-fitbox__in">
        {children}
      </div>
    </div>
  );
}

export default function ExerciseBoard({ exercise, students, seating, readers, onReader, onExit }) {
  const tools = useBoardTools();
  const [classOpen, setClassOpen] = useState(false);
  const [speaker, setSpeaker] = useState(null);
  const [i, setI] = useState(0);
  const [hints, setHints] = useState(0);
  const [shown, setShown] = useState(false);
  const qs = exercise.questions;
  const q = qs[i];
  const key = keyOf(q);
  const ch = choicesOf(q);
  const s = summaryOf(exercise);
  const last = i + 1 >= qs.length;
  const st0 = exercise.statement ?? {};
  const hasStatement = Boolean(st0.content?.trim() || st0.formulas?.length || st0.table || st0.figure || st0.visual); // some exercises put their whole text in the first question
  const byId = Object.fromEntries(students.map((x) => [x.id, x]));
  const st = speaker != null ? byId[speaker] : null;
  useEffect(() => {
    setHints(0);
    setShown(false);
    setSpeaker(null);
  }, [i]);
  const go = (d) => {
    if (d > 0 && last) {
      onExit();
      return;
    }
    setI(Math.max(0, i + d));
  };
  useEffect(() => {
    const onKey = (e) => {
      if (classOpen) {
        if (e.key === 'Escape') setClassOpen(false);
        return;
      }
      if (tools.busy) return;
      if (e.key === 'ArrowLeft' || e.key === 'PageDown') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  useEffect(() => {
    if (import.meta.env.DEV) window.__classExercise = { id: exercise.id, i, hints, shown, speaker };
  });
  const tap = (id) => {
    setSpeaker(id);
    onReader(id);
    setClassOpen(false);
  };
  return (
    <div className="cs-lesson" data-cs-exercise={exercise.id} data-cs-exercise-question={i}>
      <header className="cs-lesson__top">
        <div className="cs-lesson__brand">
          <NotebookPen size={26} />
          <div>
            <strong>
              <MathText>{s.title}</MathText>
            </strong>
            <small>{s.badge ?? ''}</small>
          </div>
        </div>
        <span className="cs-dots cs-dots--rail" dir="rtl" aria-label={L.q(i + 1, qs.length)}>
          {qs.map((x, k) => (
            <button
              key={x.id}
              type="button"
              className={k === i ? 'is-now' : k < i ? 'is-ok' : ''}
              onClick={() => setI(k)}
              aria-label={L.q(k + 1, qs.length)}
              data-cs-exo-dot={k}
            />
          ))}
        </span>
        <BoardTools tools={tools} onClass={() => setClassOpen(true)} />
        <button type="button" className="cs-icon" onClick={onExit} aria-label={L.exit} title={L.exit} data-cs-exo-exit>
          <X size={22} />
        </button>
      </header>

      {st && (
        <Speaker
          slim
          name={callName(st)}
          team={teamOfStudent(teamsOf(seating, students), st.id)}
          label={L.turn}
          onClear={() => setSpeaker(null)}
        />
      )}

      <main className={`cs-scene cs-exo ${hasStatement ? '' : 'cs-exo--solo'}`}>
        {/* the statement stays in sight for every question: nobody goes back a screen to read it */}
        {hasStatement && (
          <section className="cs-exo__statement" data-cs-exo-statement>
            <h3>{L.statement}</h3>
            <Fit watch={exercise.id}>
              <ExerciseStatement {...exercise.statement} />
            </Fit>
          </section>
        )}
        <section className="cs-exo__question" data-cs-exo-question={q.id}>
          <header>
            <span className="cs-chip cs-chip--chapter">{L.q(i + 1, qs.length)}</span>
            {q.timeSeconds > 0 && <span className="cs-chip">{L.time(q.timeSeconds)}</span>}
          </header>
          <Fit className="cs-exo__work" watch={`${q.id}:${hints}:${shown}`}>
            {q.lead && (
              <p className="cs-exo__lead">
                <RichText>{q.lead}</RichText>
              </p>
            )}
            <p className="cs-exo__text">
              <RichText>{q.statement}</RichText>
            </p>
            {ch.length > 0 && (
              <ul className="cs-exo__choices">
                {ch.map((c) => (
                  <li key={c.letter} className={shown && c.right ? 'is-right' : ''}>
                    <b>{c.letter}</b>
                    <span>
                      <RichText>{c.content}</RichText>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {hints > 0 && (
              <ol className="cs-exo__hints" data-cs-exo-hints={hints}>
                {(q.hints ?? []).slice(0, hints).map((h) => (
                  <li key={h.id}>
                    <Lightbulb size={22} />
                    <span>
                      <RichText>{h.content}</RichText>
                    </span>
                  </li>
                ))}
              </ol>
            )}
            {shown && (
              <div className="cs-exo__key" data-cs-exo-key>
                {key.answer && (
                  <p className="cs-exo__answer">
                    <strong>{L.answer}:</strong> <RichText>{key.answer}</RichText>
                  </p>
                )}
                {key.lines.map((line) => (
                  <p key={line}>
                    <RichText>{line}</RichText>
                  </p>
                ))}
                {key.result && (
                  <p dir="ltr" className="cs-exo__result">
                    <MathText>{`$${key.result}$`}</MathText>
                  </p>
                )}
              </div>
            )}
          </Fit>
          <div className="cs-actrow">
            {(q.hints ?? []).length > 0 && (
              <button
                type="button"
                className="cs-btn cs-btn--big"
                onClick={() => setHints(Math.min(q.hints.length, hints + 1))}
                disabled={hints >= q.hints.length}
                data-cs-exo-hint
              >
                <Lightbulb size={20} /> {hints === 0 ? L.hint : L.hintN(hints, q.hints.length)}
              </button>
            )}
            <button
              type="button"
              className={`cs-btn cs-btn--big ${shown ? 'is-on' : ''}`}
              onClick={() => setShown(!shown)}
              aria-pressed={shown}
              data-cs-exo-show
            >
              {shown ? <EyeOff size={20} /> : <Eye size={20} />} {shown ? L.hide : L.show}
            </button>
          </div>
        </section>
      </main>

      <footer className="cs-lesson__foot">
        <button type="button" className="cs-btn cs-btn--big" onClick={() => go(-1)} disabled={i === 0} data-cs-exo-prev>
          <ArrowRight size={20} /> {L.prev}
        </button>
        <span className="cs-lesson__mid" />
        <button
          type="button"
          className="cs-btn cs-btn--main cs-btn--big"
          onClick={() => go(1)}
          data-cs-exo-next={last ? 'done' : 'next'}
        >
          {last ? L.done : L.next} <ArrowLeft size={20} />
        </button>
      </footer>
      {classOpen && (
        <ClassWindow
          students={students}
          seating={seating}
          current={st?.id ?? null}
          spoken={readers}
          onTap={tap}
          onClose={() => setClassOpen(false)}
          title={L.pickBoard}
        />
      )}
      <BoardLayers tools={tools} />
    </div>
  );
}
