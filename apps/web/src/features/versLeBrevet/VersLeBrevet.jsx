import { useState } from 'react';
import { Quiz, Solved } from './After';
import { ChapterMap, LessonSheet } from './ChapterMap';
import { query, useArcadePrefs } from './prefs';
import { ScrollMode } from './ScrollMode';
import { ArcadeShell } from './Shell';
import { T } from './text';

/**
 * « Vers le brevet » in 2D — THE LAST LESSON OF A UNIT (docs/reports/VERS_LE_BREVET_PLAN.md §7bis). The page of every
 * unit: the unit's own content is `brevet.js` in its lesson's folder (`unit`), its `config` is the lesson's.
 * Open on the first unit, « Multiples et diviseurs » (owner, 2026-11-26). A RAPID REVISION of the whole unit, not a lesson (owner, 2026-11-26): the chapter on one
 * screen, each lesson revised on one screen with a twenty-second manipulation, two solved exercises, a quick quiz.
 * TWO presentations of the SAME content, one switch at the top (owner, 2026-11-26): « Par écrans » — one fixed screen at
 * a time, nothing scrolls — and « En une page » — the same look and the same manipulations on one page that scrolls
 * (`ScrollMode.jsx`). A dark and a light look. It saves nothing and sends nothing.
 * `?etape=1…3` opens a part directly; `?lecon=dec|pgcd|ppcm|irr` opens a lesson; `?mode=page` opens the page.
 */
const readStep = () => {
  const n = Number(query('etape'));
  return Number.isInteger(n) && n >= 1 && n <= 3 ? n - 1 : 0;
};

export default function VersLeBrevet({ unit, config }) {
  const prefs = useArcadePrefs();
  const { mode, setMode, play } = prefs;
  const [where, setWhere] = useState('top'); // in the page: the part under the eyes
  const [step, setStep] = useState(readStep); // 0 the map · 1 the solved exercises · 2 the quiz
  const [open, setOpen] = useState(() => (unit.lessons.some((l) => l.id === query('lecon')) ? query('lecon') : null));
  const [seen, setSeen] = useState([]);
  const [points, setPoints] = useState(0);

  const page = mode === 'page';
  const lesson = unit.lessons.find((l) => l.id === (page ? where : open));
  const at = !page ? step : where === 'quiz' ? 2 : where.startsWith('ex-') ? 1 : 0;
  /** The switch keeps the student's place: the lesson, the exercises or the quiz he was on is what he sees after it. */
  const present = (to) => {
    if (to === mode) return;
    if (to === 'page') setWhere(open ?? (step === 1 ? `ex-${unit.solved[0].id}` : step === 2 ? 'quiz' : 'top'));
    else {
      setStep(at);
      setOpen(lesson ? lesson.id : null);
    }
    setMode(to);
    play('tap');
  };
  const arrive = (id) => {
    setWhere(id);
    if (unit.lessons.some((l) => l.id === id)) setSeen((s) => (s.includes(id) ? s : [...s, id]));
  };
  const addPoints = (p) => setPoints((v) => v + p);
  const close = () => {
    setSeen((s) => (s.includes(open) ? s : [...s, open]));
    setOpen(null);
    play('tap');
  };
  const go = (to) => {
    setStep(to);
    setOpen(null);
    play('tap');
  };

  return (
    <ArcadeShell
      prefs={prefs}
      home={{ to: `/courses/${config.level}/${config.grade}/${config.chapter}/units/${config.unit}`, label: T.home }}
      segs={T.steps.map((_, i) => (i < at ? 'done' : i === at ? 'on' : ''))}
      title={lesson ? lesson.title : page && where === 'top' ? T.pageTitle : T.steps[at]}
      pill={unit.title}
      onMode={present}
      actions={
        <span className="vb-pill vb-points">
          <b key={points}>{points}</b> {T.points}
        </span>
      }
    >
      {page && <ScrollMode unit={unit} start={where} play={play} onPoints={addPoints} onWhere={arrive} />}
      {!page && step === 0 && !lesson && <ChapterMap unit={unit} seen={seen} onOpen={setOpen} onNext={() => go(1)} />}
      {!page && step === 0 && lesson && (
        <LessonSheet key={lesson.id} lesson={lesson} play={play} onPoints={addPoints} onClose={close} />
      )}
      {!page && step === 1 && <Solved unit={unit} play={play} onDone={() => go(2)} />}
      {!page && step === 2 && <Quiz unit={unit} play={play} onPoints={addPoints} onMap={() => go(0)} />}
    </ArcadeShell>
  );
}
