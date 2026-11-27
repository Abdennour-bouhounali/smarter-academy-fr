import { useState } from 'react';
import { MANIPS } from './manips';
import { Bar, Confetti, Key, Rich } from './parts';
import { T } from './text';

/**
 * « Vers le brevet » — PROTOTYPE: THE CHAPTER ON ONE SCREEN. Four tiles, one per lesson, joined by what one lesson gives
 * the next (« je relie ce que j'ai appris »). A tile shows its rule in one line and its key words; touched, it opens
 * the lesson's revision screen. Free order, nothing to pass: a rapid revision, not a lesson (owner, 2026-11-26).
 */
const PLACE = {
  dec: { left: '0%', top: '27%' },
  pgcd: { left: '37%', top: '0%' },
  ppcm: { left: '37%', top: '54%' },
  irr: { left: '74%', top: '0%' },
};
const LINKS = [
  { id: 'dec-pgcd', d: 'M260 200C315 200 315 92 370 92', left: '26.6%', top: '27%' },
  { id: 'dec-ppcm', d: 'M260 200C315 200 315 308 370 308', left: '26.6%', top: '60%' },
  { id: 'pgcd-irr', d: 'M630 92H740', left: '63.6%', top: '10%' },
];

export function ChapterMap({ unit, seen, onOpen, onNext }) {
  const all = seen.length === unit.lessons.length;
  return (
    <>
      <div className="vb-main vb-main--one">
        <div className="vb-map">
          <svg className="vb-map__lines" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
            {LINKS.map((l) => (
              <path key={l.id} d={l.d} />
            ))}
          </svg>
          {LINKS.map((l) => (
            <span key={l.id} className="vb-map__link" style={{ left: l.left, top: l.top }}>
              {unit.links[l.id]}
            </span>
          ))}
          {unit.lessons.map((lesson, i) => (
            <button
              type="button"
              key={lesson.id}
              className={`vb-tile${seen.includes(lesson.id) ? ' is-seen' : ''}`}
              data-lesson={lesson.id}
              style={PLACE[lesson.id]}
              onClick={() => onOpen(lesson.id)}
            >
              <span className="vb-tile__n">{i + 1}</span>
              <b>{lesson.title}</b>
              <span className="vb-tile__rule">
                <Rich>{lesson.short}</Rich>
              </span>
              <span className="vb-chips">
                {lesson.words.slice(0, 3).map((word) => (
                  <i key={word.w}>{word.w}</i>
                ))}
              </span>
            </button>
          ))}
          <div className="vb-map__then" style={{ left: '74%', top: '54%' }}>
            <b>{T.mapSeen(seen.length, unit.lessons.length)}</b>
            <span>{T.mapThen}</span>
          </div>
        </div>
      </div>
      <Bar mood={all ? 'win' : 'idle'} say={all ? T.mapAll : T.mapIntro}>
        <Key kind={all ? 'go' : 'main'} onClick={onNext}>
          {T.toSolved}
        </Key>
      </Bar>
    </>
  );
}

/** One lesson's revision: the idea, the rule with its example, the trap, the words — and the rule done once. */
export function LessonBody({ lesson, tell, win, note = null }) {
  const [word, setWord] = useState(null);
  const Manip = MANIPS[lesson.id];
  return (
    <div className="vb-main">
      <div className="vb-col">
        <div className="vb-panel vb-idea">
          <h4>{T.idea}</h4>
          <p>
            <Rich>{lesson.idea}</Rich>
          </p>
        </div>
        <div className="vb-panel vb-rule">
          <h4>{T.rule}</h4>
          <p>
            <Rich>{lesson.rule}</Rich>
          </p>
          <p className="vb-example">
            <Rich>{lesson.example}</Rich>
          </p>
        </div>
        <div className="vb-panel vb-trap">
          <h4>{T.trap}</h4>
          <p>
            <Rich>{lesson.trap}</Rich>
          </p>
        </div>
        <div className="vb-words">
          <h4>{T.words}</h4>
          <div className="vb-chips">
            {lesson.words.map((item, k) => (
              <button
                type="button"
                key={item.w}
                aria-pressed={word === k}
                onClick={() => setWord(word === k ? null : k)}
              >
                {item.w}
              </button>
            ))}
          </div>
          <p className="vb-def">{word === null ? T.wordHint : lesson.words[word].d}</p>
        </div>
      </div>
      <div className="vb-panel vb-stage">
        <h4>{T.yourTurn}</h4>
        <Manip tell={tell} win={win} />
        {note}
      </div>
    </div>
  );
}

/** One lesson on ONE screen (the presentation by screens). */
export function LessonSheet({ lesson, play, onPoints, onClose }) {
  const [say, setSay] = useState(lesson.manip);
  const [mood, setMood] = useState('idle');
  const [burst, setBurst] = useState(0);

  const tell = (text, face = 'idle', sound = null) => {
    setSay(text);
    setMood(face);
    if (sound) play(sound);
  };
  const win = (text) => {
    tell(text, 'win', 'win');
    if (!burst) onPoints(10);
    setBurst((b) => b + 1);
  };

  return (
    <>
      <LessonBody lesson={lesson} tell={tell} win={win} />
      <Bar mood={mood} say={say}>
        <Key kind="go" onClick={onClose}>
          {T.backToMap}
        </Key>
      </Bar>
      <Confetti run={burst} />
    </>
  );
}
