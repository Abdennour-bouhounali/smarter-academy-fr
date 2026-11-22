/**
 * « جزيرة المهمّات » on screen — the world of a unit's last lesson (`Game.js`): its HOME over the island (the missions
 * of the lesson, the door of the exam sitting, the unit's recap), and the mission he opened (`missions/`).
 * Everything said here comes from the lesson (`lesson.text`, `lesson.missions`, `lesson.bank`, `lesson.recap`).
 */
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  FileText,
  Flame,
  Heart,
  Pause,
  PenLine,
  Play,
  Star,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import LessonWorld from '../kit/LessonWorld';
import { useLesson } from '../kit/LessonContext';
import { M } from '../kit/parts';
import { examLevelOpen } from '../kit/journey';
import { readSave } from '../kit/saveSync';
import { loadPackPart } from '../../../lessonPack';
import MissionRunner from '../missions/MissionRunner';
import { MissionIsleGame } from './Game';
import './missionIsle.css';

const Stars = ({ n }) => (
  <span className="mi-stars" data-mi-stars={n}>
    {[0, 1, 2].map((k) => (
      <Star key={k} size={24} className={k < n ? 'is-on' : ''} aria-hidden="true" />
    ))}
  </span>
);

/** The unit's recap: each lesson of the unit and its rules. A rule he has not forged yet keeps its name hidden. */
function Recap({ lessons: list, onClose }) {
  const [lessons, setLessons] = useState(null);
  useEffect(() => {
    let alive = true;
    Promise.all(
      list.map(({ id, title }) =>
        loadPackPart(id, 'world').then(
          (l) => (l ? { id, title, keys: l.keys, rules: l.rules, held: readSave(id)?.keysEver ?? [] } : null),
          () => null,
        ),
      ),
    ).then((all) => alive && setLessons(all.filter(Boolean)));
    return () => {
      alive = false;
    };
  }, [list]);
  return (
    <section className="mi-panel mi-panel--recap" data-mi-recap={lessons?.length ?? 'loading'}>
      <header>
        <h2>
          <BookOpen size={24} aria-hidden="true" /> ملخّص الوحدة: قواعدك
        </h2>
        <button type="button" className="mi-x" aria-label="إغلاق" data-mi-recap-close onClick={onClose}>
          <X size={22} aria-hidden="true" />
        </button>
      </header>
      {!lessons ? (
        <p>نجمع قواعدك…</p>
      ) : (
        <div className="mi-recap">
          {lessons.map((l) => (
            <article key={l.id} data-mi-recap-lesson={l.id}>
              <h3>{l.title}</h3>
              <ul>
                {l.keys.map((k) => {
                  const mine = l.held.includes(k);
                  return (
                    <li key={k} className={mine ? 'is-mine' : ''}>
                      <span aria-hidden="true">{mine ? l.rules[k].icon : '🔒'}</span>
                      {mine ? l.rules[k].title : 'قاعدة لم تصنعها بعد'}
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const Option = ({ o }) => (o.tex ? <M>{o.tex}</M> : <span dir="ltr">{o.t}</span>);

/**
 * « سباق الأعداد » on screen: the sign (the order), the three gates' numbers (placed over the 3D gates by the game, every
 * frame), his hearts, his score, the level; the two arrows for a mouse or a finger; the fact of a wrong gate; the end.
 */
function Run({ s, game }) {
  const { endless } = useLesson();
  const r = s.run;
  if (r.stage === 'ready')
    return (
      <section className="mi-run mi-run--card" data-mi-run="ready">
        <div className="mi-runcard">
          <Zap size={56} aria-hidden="true" />
          <h2>{endless.title}</h2>
          <p>{endless.say}</p>
          <p>يبدأ سهلًا جدًّا، ثمّ يصعد مستوى بعد كلّ {endless.gates} أبواب صحيحة. لك ثلاثة قلوب.</p>
          {r.best > 0 && (
            <p className="mi-runcard__best">
              <Trophy size={24} aria-hidden="true" /> أفضل ما بلغتَ: {r.best} بابًا
            </p>
          )}
          <button type="button" className="mi-btn" data-mi-run-start onClick={() => game.startRun()}>
            <Play size={20} aria-hidden="true" /> أبدأ السباق
          </button>
          <button type="button" className="mi-door" data-mi-run-leave onClick={() => game.leaveRun()}>
            الرجوع إلى الجزيرة
          </button>
        </div>
      </section>
    );
  if (r.stage === 'over')
    return (
      <section className="mi-run mi-run--card" data-mi-run="over">
        <div className="mi-runcard">
          <Trophy size={64} aria-hidden="true" />
          <h2>{r.record ? 'رقم جديد!' : 'انتهى السباق'}</h2>
          <p className="mi-runcard__score" data-mi-run-score={r.score}>
            {r.score} بابًا صحيحًا
          </p>
          <p>
            بلغتَ المستوى {r.level}: {endless.levels[Math.min(r.level, endless.levels.length) - 1].name}. أفضل ما بلغتَ:{' '}
            {r.best}.
          </p>
          <button type="button" className="mi-btn" data-mi-run-start onClick={() => game.startRun()}>
            <Play size={20} aria-hidden="true" /> سباق جديد
          </button>
          <button type="button" className="mi-door" data-mi-run-leave onClick={() => game.leaveRun()}>
            الرجوع إلى الجزيرة
          </button>
        </div>
      </section>
    );
  // THE SCREEN OF LESSON 1'S RUN (`divisorIsles/DivisorIsles.jsx › DashHud`, the kit's `di-dash` styles): the hearts and the
  // score in a pill, the order on its white card, the two round arrows at the bottom corners.
  return (
    <section
      className="mi-run"
      data-mi-run={r.stage}
      data-mi-run-round={r.n}
      data-mi-run-lane={r.lane}
      data-mi-run-right={r.right ?? ''}
    >
      <div className="di-dash" data-di-dash="endless">
        <div className="di-dash__meta">
          <span className="di-dash__hearts" data-mi-run-hearts={r.hearts} aria-label={`${r.hearts} قلوب`}>
            {[0, 1, 2].map((k) => (
              <Heart key={k} size={22} className={k < r.hearts ? 'is-on' : ''} fill="currentColor" aria-hidden="true" />
            ))}
          </span>
          <span className="di-dash__score" data-mi-run-score={r.score}>
            <Star size={18} className="di-ic-star" aria-hidden="true" /> <b dir="ltr">{r.score}</b>
          </span>
          {r.streak >= 3 && (
            <span className="di-dash__streak" key={r.streak}>
              <Flame size={18} aria-hidden="true" /> <b dir="ltr">{r.streak}</b>
            </span>
          )}
          <span data-mi-run-level={r.level}>
            المستوى {r.level} · {r.levelName}
          </span>
          <button
            type="button"
            className="mi-quit"
            data-mi-run-pause
            onClick={() => game.pauseRun(r.stage !== 'paused')}
          >
            {r.stage === 'paused' ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
            {r.stage === 'paused' ? 'متابعة' : 'توقّف'}
          </button>
          <button type="button" className="mi-quit" data-mi-run-leave onClick={() => game.leaveRun()}>
            <X size={18} aria-hidden="true" /> خروج
          </button>
        </div>
        {(r.stage === 'go' || r.stage === 'paused') && (
          <div className="di-dash__say" key={r.n} data-mi-run-ask>
            <small>مرّ من الباب الصحيح</small>
            <strong>
              {r.ask} {r.tex && <M>{r.tex}</M>}
            </strong>
          </div>
        )}
        {r.stage === 'hit' && (
          <div className="di-dash__say mi-why" data-mi-run-why>
            <small>
              {r.ask} {r.tex && <M>{r.tex}</M>}
            </small>
            <strong>{r.why}</strong>
          </div>
        )}
      </div>
      {r.options.map((o, lane) => (
        <b
          key={`${r.n}-${lane}`}
          ref={(el) => {
            game.gateEls[lane] = el;
          }}
          className={`mi-gate ${r.stage === 'hit' && lane === r.right ? 'is-right' : ''} ${r.stage === 'hit' && lane === r.picked ? 'is-wrong' : ''}`}
          data-mi-gate={lane}
          style={{ visibility: 'hidden' }}
        >
          <Option o={o} />
        </b>
      ))}
      {r.stage === 'paused' && (
        <div className="mi-paused" data-mi-run-paused>
          <div className="mi-runcard">
            <Pause size={52} aria-hidden="true" />
            <h2>السباق متوقّف</h2>
            <p>الأبواب تنتظرك حيث تركتها. اضغط « متابعة » أو مفتاح المسافة.</p>
            <button type="button" className="mi-btn" data-mi-run-resume onClick={() => game.pauseRun(false)}>
              <Play size={20} aria-hidden="true" /> متابعة
            </button>
            <button type="button" className="mi-door" data-mi-run-leave onClick={() => game.leaveRun()}>
              الرجوع إلى الجزيرة
            </button>
          </div>
        </div>
      )}
      {r.up && r.stage === 'go' && (
        <p className="mi-up" key={r.level} data-mi-run-up>
          مستوى جديد: {r.levelName}
        </p>
      )}
      <div className="di-lanes" dir="ltr">
        <button
          type="button"
          aria-label="يسار"
          data-mi-run-left
          onPointerDown={(e) => (e.preventDefault(), game.runLane(-1))}
        >
          <ArrowLeft size={30} />
        </button>
        <button
          type="button"
          aria-label="يمين"
          data-mi-run-right
          onPointerDown={(e) => (e.preventDefault(), game.runLane(1))}
        >
          <ArrowRight size={30} />
        </button>
      </div>
    </section>
  );
}

/** The home of the lesson: its missions in order, the exam sitting, the recap. */
function Home({ s, game }) {
  const lesson = useLesson();
  const { missions, bank, text, sittings } = lesson;
  const [panel, setPanel] = useState(null); // null | 'exam' | 'recap'
  const bankDone = s.missions[bank.id];
  const cards = [
    ...missions.map((m) => ({
      id: m.id,
      title: m.title,
      sub: m.session,
      minutes: m.minutes,
      done: s.missions[m.id],
      open: () => game.startMission(m),
    })),
    { id: bank.id, title: bank.title, sub: bank.sub, minutes: null, done: bankDone, open: () => game.openBank() },
  ];
  const next = cards.find((c) => !c.done)?.id ?? null;
  if (panel === 'recap') return <Recap lessons={lesson.recap} onClose={() => setPanel(null)} />;
  if (panel === 'exam')
    return (
      <section className="mi-panel" data-mi-exam>
        <header>
          <h2>
            <FileText size={24} aria-hidden="true" /> {text.exam}
          </h2>
          <button type="button" className="mi-x" aria-label="إغلاق" data-mi-exam-close onClick={() => setPanel(null)}>
            <X size={22} aria-hidden="true" />
          </button>
        </header>
        <p>{text.examSay}</p>
        <div className="mi-levels">
          {sittings.levels.map((l) => {
            const open = examLevelOpen(s.exam, l.n);
            return (
              <button
                key={l.n}
                type="button"
                className="mi-level"
                disabled={!open}
                data-mi-level={l.n}
                onClick={() => game.openSitting(l.n)}
              >
                <b>المستوى {l.n}</b>
                <span>{l.title}</span>
                {open ? <Stars n={s.exam.best?.[l.n]?.stars ?? 0} /> : <small>يُفتح بعد المستوى {l.n - 1}</small>}
              </button>
            );
          })}
        </div>
      </section>
    );
  return (
    <section className="mi-home" data-mi-home>
      <header>
        <h1>{text.title}</h1>
        <p>{text.subtitle}</p>
      </header>
      <div className="mi-cards">
        {cards.map((c, i) => (
          <article
            key={c.id}
            className={`mi-card ${c.done ? 'is-done' : ''} ${c.id === next ? 'is-next' : ''}`}
            data-mi-card={c.id}
          >
            <b className="mi-card__n">{i + 1}</b>
            <h2>{c.title}</h2>
            <p>{c.sub}</p>
            <p className="mi-card__need">
              <PenLine size={20} aria-hidden="true" /> ورقة · قلم
              {c.minutes && (
                <>
                  <Clock size={20} aria-hidden="true" /> {c.minutes} دقيقة
                </>
              )}
            </p>
            {c.done ? (
              <Stars n={c.done.stars} />
            ) : (
              <span className="mi-card__new">
                {s.partial[c.id] ? 'توقّفتَ في منتصفها' : c.id === next ? 'ابدأ من هنا' : 'لم تُلعب بعد'}
              </span>
            )}
            <button type="button" className="mi-btn" data-mi-open={c.id} onClick={c.open}>
              {c.done ? 'ألعبها من جديد' : 'أبدأ المهمّة'}
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
          </article>
        ))}
      </div>
      <div className="mi-doors">
        <button type="button" className="mi-door" data-mi-door="exam" onClick={() => setPanel('exam')}>
          <Trophy size={24} aria-hidden="true" /> {text.exam}
        </button>
        <button type="button" className="mi-door" data-mi-door="recap" onClick={() => setPanel('recap')}>
          <BookOpen size={24} aria-hidden="true" /> ملخّص الوحدة
        </button>
        {lesson.endless && (
          <button type="button" className="mi-door mi-door--game" data-mi-door="run" onClick={() => game.openRun()}>
            <Zap size={24} aria-hidden="true" /> {lesson.endless.title}
          </button>
        )}
      </div>
    </section>
  );
}

const WORLD = {
  id: 'mission-isle',
  Game: MissionIsleGame,
  playing: () => false,
  busy: (s) => Boolean(s.mission || s.run),
  quiet: () => true,
  paperOn: (s) => Boolean(s.mission),
  Over: ({ s, game }) => {
    if (s.mission) {
      return (
        <MissionRunner
          key={s.mission.id}
          situation={s.mission}
          world={{
            run: (spec, opts) => game.missionRun(spec, opts),
            stock: (a, b) => game.missionStock(a, b),
            cheer: (big) => game.missionCheer(big),
            done: (result) => game.missionDone(result),
            keep: (snapshot) => game.missionKeep(snapshot),
          }}
          resume={s.partial[s.mission.id] ?? null}
          onClose={() => game.leaveMission()}
        />
      );
    }
    if (s.run) return <Run s={s} game={game} />;
    return s.phase === 'home' && !s.overlay ? <Home s={s} game={game} /> : null;
  },
};

/**
 * `board` = `{ mission, onLeave }`: the world mounted by the class board (`features/classSession/LessonBoard › MissionStation`)
 * opens on that mission and calls `onLeave` when it is left. Always a preview there: nothing is saved as the teacher's.
 */
export default function MissionIsle({ lesson: content, board = null, ...props }) {
  const lesson = useMemo(() => (board ? { ...content, board } : content), [content, board]);
  const world = useMemo(
    () => ({
      ...WORLD,
      stages: lesson.missions.length + 1,
      maxStars: (lesson.missions.length + 1) * 3,
      text: { title: lesson.text.title, subtitle: lesson.text.subtitle, turn: lesson.text.turn, end: {} },
    }),
    [lesson],
  );
  return <LessonWorld world={world} lesson={lesson} {...props} />;
}
