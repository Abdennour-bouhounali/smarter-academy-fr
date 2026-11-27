import { useState } from 'react';
import { Bar, Confetti, Key, LotsScene, Rich, Statement, TimelineScene } from './parts';
import { T } from './text';

/**
 * « Vers le brevet » — PROTOTYPE: what follows the map. Two SOLVED exercises, read line by line (he solves nothing: he
 * watches a full copy being written and sees which lesson each line uses), then a QUICK QUIZ of six one-tap questions
 * with the reason right after. Nothing is evidence, nothing is saved.
 */

/** The picture of a solved exercise: bare at first, then with the number the copy has just found. */
export function Picture({ picture, shown }) {
  const { kind, a, b } = picture;
  const there = shown >= picture.from;
  if (kind === 'lots') return <LotsScene a={a} b={b} A={picture.A} B={picture.B} n={there ? picture.n : null} />;
  return <TimelineScene a={a} b={b} at={there ? picture.at : null} unit={picture.unit} />;
}

export function Solved({ unit, play, onDone }) {
  const [e, setE] = useState(0);
  const [shown, setShown] = useState(0);
  const ex = unit.solved[e];
  const full = shown === ex.lines.length;
  const last = e === unit.solved.length - 1;

  const next = () => {
    if (!full) {
      setShown(shown + 1);
      play('good');
      return;
    }
    if (last) {
      onDone();
      return;
    }
    setE(e + 1);
    setShown(0);
    play('tap');
  };

  return (
    <>
      <div className="vb-main">
        <div className="vb-col">
          <div className="vb-panel">
            <div className="vb-count">{T.solvedCount(e + 1, unit.solved.length)}</div>
            <Statement text={ex.text} />
          </div>
          <div className="vb-panel vb-copy">
            <h4>{T.copy}</h4>
            {ex.lines.slice(0, shown).map((l, k) => (
              <p className={`vb-ln${k === ex.lines.length - 1 ? ' vb-ln--say' : ''}`} key={`${e}-${k}`}>
                <span className="vb-tag">{l.tag}</span>
                {l.t}
              </p>
            ))}
          </div>
        </div>
        <div className="vb-panel vb-stage vb-stage--center" key={e}>
          <Picture picture={ex.picture} shown={shown} />
        </div>
      </div>
      <Bar mood={full ? 'win' : 'idle'} say={shown ? ex.lines[shown - 1].why : T.solvedIntro}>
        <Key kind={full ? 'go' : 'main'} onClick={next}>
          {!full ? T.nextLine : last ? T.toQuiz : T.nextExercise}
        </Key>
      </Bar>
    </>
  );
}

/** The end of the quiz: the stamp, the count, the lessons to look at again. */
export function QuizEnd({ unit, right, missed }) {
  return (
    <div className="vb-main">
      <div className="vb-end">
        <div className="vb-stamp">
          <b>{unit.title}</b>
          <span>{T.title}</span>
        </div>
      </div>
      <div className="vb-panel vb-stage vb-stage--center">
        <p className="vb-q">{T.quizScore(right, unit.quiz.length)}</p>
        {missed.length === 0 ? (
          <p className="vb-fact is-ok">{T.quizAll}</p>
        ) : (
          <>
            <h4>{T.quizReview}</h4>
            <ul className="vb-list">
              {unit.lessons
                .filter((l) => missed.includes(l.id))
                .map((l) => (
                  <li key={l.id}>{l.title}</li>
                ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export function Quiz({ unit, play, onPoints, onMap }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [right, setRight] = useState(0);
  const [missed, setMissed] = useState([]);
  const [round, setRound] = useState(0);
  const total = unit.quiz.length;
  const over = i === total;
  const q = unit.quiz[i];

  const pick = (k) => {
    if (picked !== null) return;
    setPicked(k);
    if (q.choices[k].ok) {
      setRight(right + 1);
      onPoints(10);
      play('good');
    } else {
      setMissed((m) => (m.includes(q.lesson) ? m : [...m, q.lesson]));
      play('bad');
    }
  };
  const next = () => {
    setI(i + 1);
    setPicked(null);
    if (i + 1 === total) play('win');
  };
  const again = () => {
    setI(0);
    setPicked(null);
    setRight(0);
    setMissed([]);
    setRound(round + 1);
  };

  if (over) {
    return (
      <>
        <QuizEnd unit={unit} right={right} missed={missed} />
        <Bar mood="win" say={T.quizEnd}>
          <Key onClick={again}>{T.again}</Key>
          <Key kind="go" onClick={onMap}>
            {T.toMap}
          </Key>
        </Bar>
        <Confetti run={round + 1} />
      </>
    );
  }

  const ok = picked !== null && q.choices[picked].ok;
  return (
    <>
      <div className="vb-main vb-main--one">
        <div className="vb-panel vb-quiz" key={`${round}-${i}`}>
          <div className="vb-count">{T.quizCount(i + 1, total)}</div>
          <p className="vb-question">
            <Rich>{q.q}</Rich>
          </p>
          <div className="vb-choices vb-choices--row">
            {q.choices.map((c, k) => (
              <button
                type="button"
                key={c.t}
                className={`vb-choice${picked !== null && c.ok ? ' is-ok' : ''}${picked === k && !c.ok ? ' is-faulty' : ''}`}
                disabled={picked !== null}
                onClick={() => pick(k)}
              >
                {c.t}
              </button>
            ))}
          </div>
          {picked !== null && (
            <p className={`vb-fact ${ok ? 'is-ok' : 'is-bad'}`}>
              <Rich>{q.why}</Rich>
            </p>
          )}
        </div>
      </div>
      <Bar
        mood={picked === null ? 'idle' : ok ? 'win' : 'think'}
        say={picked === null ? T.quizIntro : ok ? T.quizRight[i % T.quizRight.length] : T.quizWrong}
      >
        {picked !== null && (
          <Key kind="go" onClick={next}>
            {i + 1 === total ? T.quizSee : T.next}
          </Key>
        )}
      </Bar>
    </>
  );
}
