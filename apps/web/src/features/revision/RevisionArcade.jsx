/**
 * « la page de révision » IN THE 2D GAME LOOK — the student's page (owner, 2026-11-26: « this new style with the 2 mode
 * must be applied also for the lessons », REVISION_PAGE.md §4). The SAME content and the same blocks as the plain page
 * (`RevisionBlock`, `RevisionQuiz`): nothing is written twice. Two presentations, one switch at the top:
 *   « Par écrans »  — one fixed screen at a time, nothing scrolls: a step is laid out in columns and cut into screens by
 *                     the browser itself (CSS columns), so no block is ever split by hand or lost;
 *   « En une page » — the seven steps one under the other on one page that scrolls.
 * It is a self-check: nothing is sent, the ticked steps stay in the browser (the same key as the plain page).
 */
import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonById, getLessonPath } from '@smarter-academy/core';
import MathText from '../../lessons/common/components/MathText';
import MathLabel from '../../lessons/common/components/MathLabel';
import { Bar, Key } from '../versLeBrevet/parts';
import { useArcadePrefs, useScrollParts } from '../versLeBrevet/prefs';
import { ArcadeShell } from '../versLeBrevet/Shell';
import RevisionBlock from './RevisionBlock';
import RevisionQuiz from './RevisionQuiz';
import { readSteps, writeSteps } from './revisionSteps';
import './revisionArcade.css';

const L = {
  revision: 'Page de révision',
  home: 'Accueil de la leçon',
  print: 'Imprimer',
  practice: 'Plus d’exercices dans l’espace d’entraînement',
  done: 'J’ai fini cette étape',
  undone: 'Étape finie',
  previous: 'Précédent',
  next: 'Suivant',
  nextStep: 'Étape suivante',
  end: 'Terminer',
  top: 'Haut de page',
  where: (step, steps, screen, screens) =>
    screens > 1 ? `Étape ${step} sur ${steps}, écran ${screen} sur ${screens}.` : `Étape ${step} sur ${steps}.`,
  finished: 'Tu as fini cette page. Ferme-la, ou reviens sur une étape.',
};
/** A step whose blocks need the whole width: the table of the rules. */
const WIDE = ['summary'];

function StepBody({ step, data, lessonId }) {
  return (
    <>
      {step.blocks.map((block, j) => (
        <RevisionBlock key={j} block={block} />
      ))}
      {step.id === 'exercises' && (
        <Link to={`/espace/pratique/${lessonId}`} className="vb-pill rva-more">
          {L.practice}
        </Link>
      )}
      {step.id === 'quiz' && <RevisionQuiz questions={data.quiz} />}
    </>
  );
}

/**
 * « A formula is one line »: one that is wider than its box is set smaller until it fits (a column is half a window).
 * Never under two thirds of the text's size: past that it would not be read, and the block says so by its overflow.
 */
function fitFormulas(root) {
  for (const formula of root.querySelectorAll('.rv-formula')) {
    formula.style.fontSize = '';
    const room = formula.clientWidth;
    const need = formula.scrollWidth;
    if (need > room + 1) formula.style.fontSize = `${Math.max(0.66, room / need) * 100}%`;
  }
}

/**
 * One step cut into screens: the blocks flow into columns of a fixed height, the columns that do not fit continue to the
 * side, and a screen is the columns the window holds. `screen` chooses which; `onCount` says how many there are (it
 * changes when a « Corrigé » opens or the maths finishes rendering).
 */
function Pager({ screen, onCount, wide, children }) {
  const box = useRef(null);
  useLayoutEffect(() => {
    const el = box.current;
    const measure = () => {
      fitFormulas(el);
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const count = Math.max(1, Math.round((el.scrollWidth + gap) / (el.clientWidth + gap)));
      onCount(count);
      el.scrollLeft = Math.min(screen, count - 1) * (el.clientWidth + gap);
    };
    measure();
    const watcher = new ResizeObserver(measure);
    for (const child of el.children) watcher.observe(child);
    return () => watcher.disconnect();
  });
  return (
    <div className={`rva-pager${wide ? ' is-wide' : ''}`} ref={box} data-revision-pager>
      {children}
    </div>
  );
}

/** « En une page »: the seven steps one under the other. `jumpRef` lets the top bar's segments go to a step. */
function PageMode({ data, lessonId, start, onWhere, done, mark, play, jumpRef }) {
  const steps = data.steps;
  const { box, watch, jump } = useScrollParts({ start, onWhere });
  jumpRef.current = jump;
  useLayoutEffect(() => fitFormulas(box.current), [box, data]);
  return (
    <div className="vb-scroll" ref={box} onScroll={watch} tabIndex={0}>
      <section className="vb-sec" data-sec="top">
        <p className="rva-intro">
          <MathText>{data.intro}</MathText>
        </p>
        <div className="rva-jump">
          {steps.map((s, i) => (
            <button
              type="button"
              key={s.id}
              className={`vb-tile vb-tile--flow${done.includes(s.id) ? ' is-seen' : ''}`}
              onClick={() => {
                play('tap');
                jump(s.id);
              }}
            >
              <span className="vb-tile__n">{i + 1}</span>
              <b>{s.short}</b>
            </button>
          ))}
        </div>
      </section>
      {steps.map((s, i) => (
        <section className="vb-sec" key={s.id} data-sec={s.id} data-revision-step={s.id}>
          <div className="vb-sec__head">
            <span className="vb-tile__n">{i + 1}</span>
            <h2>
              <MathText>{s.title}</MathText>
            </h2>
          </div>
          <div className={`rva-flow${WIDE.includes(s.id) ? ' is-wide' : ''}`}>
            <StepBody step={s} data={data} lessonId={lessonId} />
          </div>
          <button
            type="button"
            className="vb-pill rva-done"
            aria-pressed={done.includes(s.id)}
            onClick={() => {
              mark(s.id, !done.includes(s.id));
              play('good');
            }}
          >
            {done.includes(s.id) ? `✓ ${L.undone}` : L.done}
          </button>
        </section>
      ))}
      <section className="vb-sec rva-end">
        <p className="rva-intro">
          <MathText>{data.next}</MathText>
        </p>
        <button type="button" className="vb-pill" onClick={() => jump('top')}>
          {L.top}
        </button>
      </section>
    </div>
  );
}

export default function RevisionArcade({ lessonId, data }) {
  const prefs = useArcadePrefs();
  const { mode, setMode, play } = prefs;
  const steps = data.steps;
  const lesson = getLessonById(lessonId);
  const lessonPath = getLessonPath(lessonId);
  const [done, setDone] = useState(() => readSteps(lessonId));
  const [at, setAt] = useState(0); // the step, by screens
  const [screen, setScreen] = useState(0);
  const [screens, setScreens] = useState(1);
  const [where, setWhere] = useState('top'); // the part under the eyes, in the page
  const page = mode === 'page';
  const jumpRef = useRef(null);

  const mark = (stepId, on) => {
    const next = on ? [...new Set([...done, stepId])] : done.filter((id) => id !== stepId);
    setDone(next);
    writeSteps(lessonId, next);
  };
  const now = page
    ? Math.max(
        0,
        steps.findIndex((s) => s.id === where),
      )
    : at;
  const shown = Math.min(screen, screens - 1);
  const lastScreen = shown === screens - 1;
  const lastStep = at === steps.length - 1;

  /** The switch keeps the reader's place: the step he was on is the step he sees after it. */
  const present = (to) => {
    if (to === mode) return;
    if (to === 'page') setWhere(steps[at].id);
    else {
      setAt(now);
      setScreen(0);
    }
    setMode(to);
    play('tap');
  };
  const goStep = (i) => {
    play('tap');
    if (page) jumpRef.current?.(steps[i].id);
    else {
      setAt(i);
      setScreen(0);
    }
  };
  const forward = () => {
    play(lastScreen ? 'good' : 'tap');
    if (!lastScreen) return setScreen(shown + 1);
    mark(steps[at].id, true);
    if (lastStep) return undefined;
    setAt(at + 1);
    return setScreen(0);
  };
  const back = () => {
    play('tap');
    if (shown > 0) return setScreen(shown - 1);
    setAt(at - 1);
    return setScreen(Number.MAX_SAFE_INTEGER); // the last screen of the step before: the pager brings it back in range
  };
  const finished = !page && lastStep && lastScreen && done.includes(steps[at].id);

  return (
    <ArcadeShell
      prefs={prefs}
      home={lessonPath ? { to: lessonPath, label: L.home } : null}
      data-revision-arcade={lessonId}
      segs={steps.map((s, i) => (i === now && !(page && where === 'top') ? 'on' : done.includes(s.id) ? 'done' : ''))}
      segNames={steps.map((s) => s.short)}
      onSeg={goStep}
      title={page && where === 'top' ? L.revision : <MathText>{steps[now].title}</MathText>}
      pill={<MathLabel>{lesson?.title ?? lessonId}</MathLabel>}
      onMode={present}
      actions={
        <button type="button" className="vb-pill" onClick={() => window.print()} data-revision-print>
          {L.print}
        </button>
      }
    >
      {page ? (
        <PageMode
          data={data}
          lessonId={lessonId}
          start={where}
          onWhere={setWhere}
          done={done}
          mark={mark}
          play={play}
          jumpRef={jumpRef}
        />
      ) : (
        <>
          <div className="vb-main vb-main--one rva-screen" data-revision-step={steps[at].id}>
            <Pager key={steps[at].id} screen={screen} onCount={setScreens} wide={WIDE.includes(steps[at].id)}>
              <StepBody step={steps[at]} data={data} lessonId={lessonId} />
            </Pager>
          </div>
          <Bar
            mood={finished ? 'win' : 'idle'}
            say={finished ? L.finished : L.where(at + 1, steps.length, shown + 1, screens)}
          >
            <Key kind="mini" disabled={at === 0 && shown === 0} onClick={back}>
              {L.previous}
            </Key>
            {finished && lessonPath ? (
              <Link to={lessonPath} className="vb-key vb-key--go rva-keylink">
                {L.home}
              </Link>
            ) : (
              <Key kind="go" onClick={forward}>
                {!lastScreen ? L.next : lastStep ? L.end : L.nextStep}
              </Key>
            )}
          </Bar>
        </>
      )}
    </ArcadeShell>
  );
}
