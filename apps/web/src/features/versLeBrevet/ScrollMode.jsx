import { useState } from 'react';
import { Picture, QuizEnd } from './After';
import { LessonBody } from './ChapterMap';
import { Confetti, Key, Rich, Statement } from './parts';
import { useScrollParts } from './prefs';
import { T } from './text';

/**
 * « Vers le brevet » — PROTOTYPE: THE SAME REVISION ON ONE PAGE THAT SCROLLS (owner, 2026-11-26: « the scroll mode but
 * with the new fancy colored design and small manipu »). Nothing is written twice: the page reads the unit's content and
 * mounts the lesson bodies, the manipulations and the pictures of the presentation by screens. The top bar stays in
 * place; there is NO robot's bar here (owner, the same day: « remove this from the one page mode »), so what the robot
 * would say is written where the student has just acted.
 */

/** One solved exercise: the copy appears line by line, under the student's finger. */
function SolvedFlow({ ex, play }) {
  const [shown, setShown] = useState(0);
  const full = shown === ex.lines.length;
  const next = () => {
    play('good');
    setShown(shown + 1);
  };
  return (
    <div className="vb-main">
      <div className="vb-col">
        <div className="vb-panel">
          <Statement text={ex.text} />
        </div>
        <div className="vb-panel vb-copy">
          <h4>{T.copy}</h4>
          {ex.lines.slice(0, shown).map((l, k) => (
            <p className={`vb-ln${k === ex.lines.length - 1 ? ' vb-ln--say' : ''}`} key={k}>
              <span className="vb-tag">{l.tag}</span>
              {l.t}
            </p>
          ))}
          <p className="vb-note" key={shown}>
            <Rich>{shown ? ex.lines[shown - 1].why : T.solvedIntro}</Rich>
          </p>
          {!full && (
            <Key kind="mini" onClick={next}>
              {T.nextLine}
            </Key>
          )}
        </div>
      </div>
      <div className="vb-panel vb-stage vb-stage--center">
        <Picture picture={ex.picture} shown={shown} />
      </div>
    </div>
  );
}

/** The six questions, one under the other; the end appears once the last one is answered. */
function QuizFlow({ unit, play, onPoints, onEnd }) {
  const [picked, setPicked] = useState(() => unit.quiz.map(() => null));
  const [round, setRound] = useState(0);
  const total = unit.quiz.length;
  const isRight = (q, i) => picked[i] !== null && q.choices[picked[i]].ok;
  const done = picked.every((p) => p !== null);
  const right = unit.quiz.filter(isRight).length;
  const missed = unit.quiz.filter((q, i) => picked[i] !== null && !isRight(q, i)).map((q) => q.lesson);

  const pick = (i, k) => {
    if (picked[i] !== null) return;
    const all = picked.map((p, j) => (j === i ? k : p));
    const ok = unit.quiz[i].choices[k].ok;
    setPicked(all);
    if (ok) onPoints(10);
    if (all.every((p) => p !== null)) {
      play('win');
      onEnd();
    } else play(ok ? 'good' : 'bad');
  };

  return (
    <>
      {unit.quiz.map((q, i) => (
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
                className={`vb-choice${picked[i] !== null && c.ok ? ' is-ok' : ''}${picked[i] === k && !c.ok ? ' is-faulty' : ''}`}
                disabled={picked[i] !== null}
                onClick={() => pick(i, k)}
              >
                {c.t}
              </button>
            ))}
          </div>
          {picked[i] !== null && (
            <p className={`vb-fact ${isRight(q, i) ? 'is-ok' : 'is-bad'}`}>
              <Rich>{q.why}</Rich>
            </p>
          )}
        </div>
      ))}
      {done && (
        <div className="vb-sec__end">
          <QuizEnd unit={unit} right={right} missed={missed} />
          <Key
            onClick={() => {
              setPicked(unit.quiz.map(() => null));
              setRound(round + 1);
            }}
          >
            {T.again}
          </Key>
        </div>
      )}
    </>
  );
}

/** One lesson of the page: what its manipulation answers is written under it. */
function LessonFlow({ lesson, play, onWin }) {
  const [note, setNote] = useState({ text: lesson.manip, face: 'idle' });
  const tell = (text, face = 'idle', sound = null) => {
    setNote({ text, face });
    if (sound) play(sound);
  };
  const win = (text) => {
    tell(text, 'win', 'win');
    onWin();
  };
  return (
    <LessonBody
      lesson={lesson}
      tell={tell}
      win={win}
      note={
        <p className="vb-note" data-face={note.face} key={note.text} aria-live="polite">
          <Rich>{note.text}</Rich>
        </p>
      }
    />
  );
}

export function ScrollMode({ unit, start, play, onPoints, onWhere }) {
  const [burst, setBurst] = useState(0);
  const [won, setWon] = useState([]);
  const parts = useScrollParts({ start, onWhere });
  const { box, watch } = parts;

  const winOf = (id) => () => {
    if (!won.includes(id)) {
      setWon([...won, id]);
      onPoints(10);
    }
    setBurst((b) => b + 1);
  };
  const jump = (id) => {
    parts.jump(id);
    play('tap');
  };
  const linksTo = (id) =>
    Object.entries(unit.links)
      .filter(([key]) => key.endsWith(`-${id}`))
      .map(([key, what]) => T.linkFrom(unit.lessons.findIndex((l) => l.id === key.split('-')[0]) + 1, what));

  return (
    <>
      <div className="vb-scroll" ref={box} onScroll={watch} tabIndex={0}>
        <section className="vb-sec" data-sec="top">
          <div className="vb-jump">
            {unit.lessons.map((lesson, i) => (
              <button
                type="button"
                key={lesson.id}
                className={`vb-tile vb-tile--flow${won.includes(lesson.id) ? ' is-seen' : ''}`}
                data-lesson={lesson.id}
                onClick={() => jump(lesson.id)}
              >
                <span className="vb-tile__n">{i + 1}</span>
                <b>{lesson.title}</b>
                <span className="vb-tile__rule">
                  <Rich>{lesson.short}</Rich>
                </span>
              </button>
            ))}
          </div>
          <div className="vb-jump__then">
            <span>{T.mapThen}</span>
            <button type="button" className="vb-pill" onClick={() => jump(`ex-${unit.solved[0].id}`)}>
              {T.steps[1]}
            </button>
            <button type="button" className="vb-pill" onClick={() => jump('quiz')}>
              {T.steps[2]}
            </button>
          </div>
        </section>

        {unit.lessons.map((lesson, i) => (
          <section className="vb-sec" key={lesson.id} data-sec={lesson.id} data-lesson={lesson.id}>
            <div className="vb-sec__head">
              <span className="vb-tile__n">{i + 1}</span>
              <h2>{lesson.title}</h2>
              {linksTo(lesson.id).map((link) => (
                <span className="vb-pill" key={link}>
                  {link}
                </span>
              ))}
            </div>
            <LessonFlow lesson={lesson} play={play} onWin={winOf(lesson.id)} />
          </section>
        ))}

        {unit.solved.map((ex, i) => (
          <section className="vb-sec" key={ex.id} data-sec={`ex-${ex.id}`}>
            <div className="vb-sec__head">
              <h2>{T.solvedCount(i + 1, unit.solved.length)}</h2>
            </div>
            <SolvedFlow ex={ex} play={play} />
          </section>
        ))}

        <section className="vb-sec" data-sec="quiz">
          <div className="vb-sec__head">
            <h2>{T.steps[2]}</h2>
          </div>
          <QuizFlow unit={unit} play={play} onPoints={onPoints} onEnd={() => setBurst((b) => b + 1)} />
          <button type="button" className="vb-pill vb-totop" onClick={() => jump('top')}>
            {T.pageTop}
          </button>
        </section>
      </div>
      <Confetti run={burst} />
    </>
  );
}
