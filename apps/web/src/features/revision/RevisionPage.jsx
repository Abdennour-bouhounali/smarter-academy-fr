/**
 * « la page de révision » — THE PLAIN SHEET (the teacher's page, and what prints): one lesson on one scrolling page: reminder, lesson, worked examples, common mistakes, exercises
 * with hidden solutions, the rules in a table, a quick quiz (docs/architecture/REVISION_PAGE.md). ONE template for every
 * lesson: the words come from the lesson's pack (`lesson.pack.js › revision`), nothing here names a lesson.
 *
 * It is a SELF-CHECK: nothing is sent to the server and nothing counts as progress. The steps a reader ticks stay in
 * his browser. The teacher sees this sheet (`/enseignant/revision/:lessonId`, under the lesson's tools header); the
 * student (`/espace/revision/:lessonId`) sees the SAME content in the 2D game look (`RevisionArcade.jsx`), with this
 * sheet kept in the page for the paper.
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLessonById, getLessonPath } from '@smarter-academy/core';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { usePackPart } from '../../lessons/lessonPack';
import MathText from '../../lessons/common/components/MathText';
import MathLabel from '../../lessons/common/components/MathLabel';
import LessonAccessGate from '../../lessons/common/components/LessonAccessGate';
import { LessonToolPage } from '../classSession/LessonToolsBar';
import RevisionBlock from './RevisionBlock';
import RevisionQuiz from './RevisionQuiz';
import RevisionArcade from './RevisionArcade';
import { readSteps, writeSteps } from './revisionSteps';
import './revision.css';

const L = {
  revision: 'Révision',
  none: 'Cette leçon n’a pas encore de page de révision.',
  loading: 'Chargement…',
  back: 'Vers la leçon',
  print: 'Imprimer',
  practice: 'Plus d’exercices dans l’espace d’entraînement',
  done: 'J’ai fini cette étape',
};

function RevisionSheet({ lessonId, data, teacher, paper = false }) {
  const [done, setDone] = useState(() => readSteps(lessonId));
  const lesson = getLessonById(lessonId);
  const lessonPath = getLessonPath(lessonId);
  const count = data.steps.filter((s) => done.includes(s.id)).length;

  const toggle = (stepId) => {
    const next = done.includes(stepId) ? done.filter((id) => id !== stepId) : [...done, stepId];
    setDone(next);
    writeSteps(lessonId, next);
  };
  const goTo = (stepId) => document.getElementById(`rv-${stepId}`)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <article className={`rv${paper ? ' rv--paper' : ''}`} dir="ltr" data-revision={lessonId}>
      <header className="rv-head">
        <div className="rv-head__row">
          <h1>
            <small>{L.revision}</small>
            <MathLabel>{lesson?.title ?? lessonId}</MathLabel>
          </h1>
          <div className="rv-actions">
            <span className="rv-count" data-revision-count>
              <bdi dir="ltr">
                {count}
                {'\u00a0/\u00a0'}
                {data.steps.length}
              </bdi>
            </span>
            {!teacher && lessonPath && (
              <Link to={lessonPath} className="rv-btn">
                {L.back}
              </Link>
            )}
            <button type="button" className="rv-btn" onClick={() => window.print()} data-revision-print>
              {L.print}
            </button>
          </div>
        </div>
        <p className="rv-note">
          <MathText>{data.intro}</MathText>
        </p>
        <nav className="rv-index">
          {data.steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={done.includes(s.id) ? 'is-done' : ''}
              onClick={() => goTo(s.id)}
            >
              <b>{i + 1}</b> {s.short}
            </button>
          ))}
        </nav>
      </header>

      {data.steps.map((step, i) => (
        <section key={step.id} id={`rv-${step.id}`} className="rv-step" data-revision-step={step.id}>
          <h2>
            <span className="rv-num">{i + 1}</span>
            <MathText>{step.title}</MathText>
          </h2>
          {step.blocks.map((block, j) => (
            <RevisionBlock key={j} block={block} />
          ))}
          {step.id === 'exercises' && (
            <Link to={`/${teacher ? 'enseignant' : 'espace'}/pratique/${lessonId}`} className="rv-btn">
              {L.practice}
            </Link>
          )}
          {step.id === 'quiz' && <RevisionQuiz questions={data.quiz} />}
          <label className="rv-done">
            <input type="checkbox" checked={done.includes(step.id)} onChange={() => toggle(step.id)} /> {L.done}
          </label>
        </section>
      ))}
      <p className="rv-next">
        <MathText>{data.next}</MathText>
      </p>
    </article>
  );
}

export default function RevisionPage({ teacher = false }) {
  const { lessonId } = useParams();
  const title = getLessonById(lessonId)?.title ?? lessonId;
  const data = usePackPart(lessonId, 'revision');
  useDocumentMeta(`${L.revision} — ${title}`);

  const empty = <p className="rv-empty">{data === undefined ? L.loading : L.none}</p>;
  const sheet = data && (
    <RevisionSheet key={`sheet-${lessonId}`} lessonId={lessonId} data={data} teacher={teacher} paper={!teacher} />
  );
  if (teacher) {
    return (
      <LessonToolPage lessonId={lessonId} active="revision">
        {sheet || empty}
      </LessonToolPage>
    );
  }
  return (
    <LessonAccessGate lessonId={lessonId} title={title}>
      {data ? (
        <>
          {/* the student's page is the 2D game look; the plain sheet stays in the page for the PAPER only */}
          <RevisionArcade key={lessonId} lessonId={lessonId} data={data} />
          {sheet}
        </>
      ) : (
        empty
      )}
    </LessonAccessGate>
  );
}
