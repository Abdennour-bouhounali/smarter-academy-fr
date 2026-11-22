/**
 * The student's road, on screen (logic: journey.js, 2026-11-16). These screens name no lesson: its levels, its road, its
 * rules and the cards that train them come from `useLesson()`.
 *   ExamLadder    « فضاء الامتحان » — the five levels of exam sittings, as rising steps; the next sheet is adapted to him;
 *   Promotion     the moment BETWEEN two levels: stars, confetti, sound — the game returns here, never inside the sitting;
 *   ProgressPage  « تقدّمي » — the road of the lesson, the four الكفاءات, an honest exam readiness, and the ONE next thing.
 */
import { useEffect, useState } from 'react';
import {
  Star,
  Lock,
  Play,
  X,
  Clock,
  FileText,
  Trophy,
  RotateCcw,
  Compass,
  Award,
  Check,
  ArrowLeft,
  Gamepad2,
} from 'lucide-react';
import Fit, { cardRoom } from './Fit';
import { examLevelOpen } from './journey';
import { useLesson } from './LessonContext';
import { SoundToggle } from './parts';
import { KT, TX } from './text';

const fmt = (n) => String(n).replace('.', ',');
/** A rung whose level has no sheet to sit yet (`sittings.available`): said, never a dead button. */
const NO_SHEET = 'لا توجد بعدُ ورقة امتحان لهذه الدرجة';
const Stars = ({ n, size = 18 }) => (
  <span className="di-stars3" dir="ltr">
    {[1, 2, 3].map((i) => (
      <Star key={i} size={size} className={i <= n ? 'is-on' : ''} />
    ))}
  </span>
);

export function ExamLadder({ s, game }) {
  const { journey, sittings } = useLesson();
  // the sheets are the lesson's bank (bankSitting.js): a level's minutes and points are known once it is loaded
  const [, setLoaded] = useState(sittings.ready());
  useEffect(() => {
    let live = true;
    if (!sittings.ready())
      sittings.prepare().then(
        () => live && setLoaded(true),
        () => {},
      );
    return () => {
      live = false;
    };
  }, [sittings]);
  const exam = s.exam;
  const open = journey.examOpen(s.openKeys, s.practice);
  const next = journey.nextExamLevel(exam);
  if (!open)
    return (
      <div className="di-ladder di-ladder--locked" data-di-ladder="locked">
        <Lock size={34} />
        <p>{TX.spaces.examLocked}</p>
      </div>
    );
  return (
    <div className="di-ladder" data-di-ladder="open">
      <p className="di-dim">{TX.spaces.passAt}</p>
      <ol className="di-rungs">
        {sittings.levels.map((L, i) => {
          // a level of the bank with nothing to mark (bankSitting.js › available) cannot be sat: shown, never opened.
          // Before the bank is loaded it is not known yet — the rung opens, and the sitting says « empty » if need be.
          const none = sittings.ready() && !sittings.available(L.n);
          const can = examLevelOpen(exam, L.n) && !none;
          const best = exam.best?.[L.n];
          const focus = (exam.weak?.[L.n] ?? []).length > 0;
          return (
            <li
              key={L.n}
              style={{ '--rise': i }}
              className={`${can ? '' : 'is-locked'} ${none ? 'is-empty' : ''} ${next === L.n && !none ? 'is-next' : ''} ${best ? 'is-passed' : ''}`}
            >
              <button
                type="button"
                disabled={!can}
                onClick={() => game.openSitting(L.n)}
                data-di-exam-level={L.n}
                data-di-exam-empty={none ? '' : undefined}
                title={can ? undefined : none ? NO_SHEET : TX.spaces.lockedLevel}
              >
                <b className="di-rung__n">{can ? L.n : <Lock size={18} />}</b>
                <strong>{L.title}</strong>
                {sittings.levelPoints(L) && (
                  <small>
                    <Clock size={13} /> {TX.spaces.minutes(sittings.levelMinutes(L))} ·{' '}
                    {TX.spaces.points(sittings.levelPoints(L))}
                  </small>
                )}
                <Stars n={best?.stars ?? 0} />
                {best && (
                  <small dir="ltr">
                    {fmt(best.mark)}
                    {'\u00a0/\u00a0'}
                    {fmt(best.total)}
                  </small>
                )}
                {focus && can && <em>{TX.spaces.focus}</em>}
                {none ? (
                  <small className="di-rung__none">{NO_SHEET}</small>
                ) : (
                  <span className="di-rung__go">
                    {best ? <RotateCcw size={15} /> : <Play size={15} fill="currentColor" />}{' '}
                    {best ? TX.spaces.again : TX.spaces.start}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Between two levels: the celebration (or the encouragement), then where to go. */
export function Promotion({ o, game }) {
  const { cards } = useLesson();
  const r = o.result;
  const up = r.passed;
  return (
    <div className="di-veil">
      {up && (
        <div className="di-confetti" aria-hidden="true">
          {Array.from({ length: 28 }, (_, i) => (
            <i key={i} style={{ '--x': `${(i * 37) % 100}%`, '--d': `${(i % 7) * 0.12}s`, '--h': (i * 47) % 360 }} />
          ))}
        </div>
      )}
      <div
        className={`di-card di-card--wide ${up ? 'di-card--gold' : ''}`}
        role="dialog"
        aria-modal="true"
        data-di-promotion={up ? (r.finished ? 'champion' : r.promoted ? 'promoted' : 'passed') : 'retry'}
      >
        <Fit avail={cardRoom}>
          <p className="di-card__eyebrow">
            <FileText size={15} /> {TX.spaces.exam} · {TX.spaces.level(r.level)}
          </p>
          {up && <div className="di-tablet__icon">{r.finished ? '🏆' : '🎓'}</div>}
          <h2>
            {up
              ? r.finished
                ? TX.spaces.champion
                : r.promoted
                  ? TX.spaces.promoted(r.nextLevel)
                  : TX.spaces.passed
              : TX.spaces.notYet}
          </h2>
          {up ? (
            <div className="di-result__stars">
              <Stars n={r.stars} size={54} />
            </div>
          ) : (
            <p>{r.fails >= 2 ? TX.spaces.twice : TX.spaces.notYetText}</p>
          )}
          <p className="di-promo__mark">
            {TX.spaces.mark}:{' '}
            <b dir="ltr">
              {fmt(r.mark)}
              {'\u00a0/\u00a0'}
              {fmt(r.total)}
            </b>
          </p>
          <div className="di-row di-row--wrap">
            {up && r.nextLevel && (
              <button
                type="button"
                className="di-btn di-btn--primary"
                onClick={() => game.openSitting(r.nextLevel)}
                data-di-promo-next
              >
                <Play size={17} fill="currentColor" /> {TX.spaces.nextLevel}
              </button>
            )}
            {!up && r.fails >= 2 && (
              <button
                type="button"
                className="di-btn di-btn--primary"
                onClick={() =>
                  game.openKnow(cards.ofExercise?.[r.weak[0]] ?? cards.ofKey?.[r.weak[0]] ?? cards.fallback)
                }
                data-di-promo-train
              >
                <Compass size={17} /> {TX.spaces.train}
              </button>
            )}
            {!up && (
              <button
                type="button"
                className={`di-btn ${r.fails >= 2 ? '' : 'di-btn--primary'}`}
                onClick={() => game.openSitting(r.level)}
                data-di-promo-similar
              >
                <RotateCcw size={16} /> {TX.spaces.similar}
              </button>
            )}
            <button type="button" className="di-btn" onClick={() => game.openMap(null, 'exam')} data-di-promo-ladder>
              <Trophy size={16} /> {TX.spaces.toLadder}
            </button>
          </div>
        </Fit>
      </div>
    </div>
  );
}

/** « تقدّمي »: one full page — the road, the readiness, the الكفاءات of the lesson, the next thing. `mastery` = the platform's status per learning point, when known. */
export function ProgressPage({ s, game, mastery = null, lessonId, lessonTitle }) {
  const { journey, rules, cards, evidence } = useLesson();
  const [z, setZ] = useState(1);
  useEffect(() => {
    const fit = () => setZ(Math.max(1, Math.min(1.8, Math.min(window.innerWidth / 1280, window.innerHeight / 720))));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  const p = journey.lessonProgress(s);
  const step = journey.nextStep(s);
  const P = TX.progress;
  const go = () => {
    if (step.do === 'story') {
      game.closeMap();
      if (s.phase === 'title') game.start();
    } else if (step.do === 'game') game.startPractice(step.node, step.level);
    else if (step.do === 'exam') game.openSitting(step.level);
    else if (step.do === 'train') game.openKnow(cards.ofKey[step.key]);
    else game.openKnow();
  };
  const label = step.do === 'exam' ? P.do.exam(step.level) : P.do[step.do];
  return (
    <div className="di-page" data-di-progress>
      <div className="di-page__fit" style={{ zoom: z }}>
        <header className="di-page__head">
          <div>
            <h2>{P.title}</h2>
            <p>{lessonTitle}</p>
          </div>
          <SoundToggle game={game} />
          <button
            type="button"
            className="di-icon"
            onClick={() => game.closeMap()}
            aria-label={TX.close}
            data-di-progress-close
          >
            <X size={20} />
          </button>
        </header>
        <ol className="di-road" data-di-road>
          {p.road.map((st) => (
            <li key={st.id} className={st.done >= 1 ? 'is-done' : st.done > 0 ? 'is-on' : ''} data-di-road-step={st.id}>
              <strong>{P.road[st.id]}</strong>
              <span className="di-bar">
                <i style={{ width: `${Math.round(st.done * 100)}%` }} />
              </span>
              <b dir="ltr">{st.label}</b>
            </li>
          ))}
        </ol>
        <div className="di-progress__body">
          <section className="di-ready" data-di-ready={p.readiness}>
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="50" className="di-ready__track" />
              <circle
                cx="60"
                cy="60"
                r="50"
                className="di-ready__arc"
                strokeDasharray={`${(p.readiness / 100) * 314} 314`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <b dir="ltr">{p.readiness}%</b>
            <h3>{P.readiness}</h3>
            <p>{P.readinessTip}</p>
            <button type="button" className="di-btn di-btn--primary" onClick={go} data-di-next-step={step.do}>
              <ArrowLeft size={17} /> {P.next} {label}
            </button>
          </section>
          <section className={`di-ptable ${mastery ? 'di-ptable--server' : ''}`}>
            <div className="di-ptable__head">
              <span>{P.cols.key}</span>
              <span>{P.cols.game}</span>
              <span>{P.cols.sealed}</span>
              <span>{P.cols.exam}</span>
              {mastery && <span>{P.cols.server}</span>}
            </div>
            {p.rows.map((r) => {
              const t = rules[r.key];
              const st = mastery?.[evidence.learningPointOf(lessonId, r.key)];
              return (
                <div key={r.key} className={`di-ptable__row ${r.earned ? '' : 'is-off'}`} data-di-prow={r.key}>
                  <span>
                    <i>{r.earned ? t.icon : '🔒'}</i>
                    <strong>{r.earned ? t.title : KT.hidden}</strong>
                    {!r.earned && <small>{P.notYet}</small>}
                  </span>
                  <span>
                    <Gamepad2 size={15} /> <Stars n={Math.round((r.game.stars / r.game.max) * 3)} />{' '}
                    <small dir="ltr">
                      {r.game.stars}/{r.game.max}
                    </small>
                  </span>
                  <span>
                    {r.sealed ? (
                      <>
                        <Award size={16} className="di-ic-star" /> {P.sealed}
                      </>
                    ) : (
                      P.notSealed
                    )}
                  </span>
                  <span className={r.exam.rate === null ? 'is-none' : r.exam.rate >= 0.8 ? 'is-good' : 'is-weak'}>
                    {r.exam.n ? (
                      <>
                        <Check size={15} /> {P.tries(r.exam.ok, r.exam.n)}
                      </>
                    ) : (
                      P.noTry
                    )}
                  </span>
                  {mastery && <span>{st ? (P.status[st] ?? st) : '—'}</span>}
                </div>
              );
            })}
          </section>
        </div>
      </div>
    </div>
  );
}
