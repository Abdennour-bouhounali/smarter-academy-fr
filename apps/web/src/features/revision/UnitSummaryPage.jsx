/** « le résumé de l’unité »: one page of tables, to read or to print (docs/architecture/REVISION_PAGE.md §6). */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUnitById } from '@smarter-academy/core';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useContentAvailability } from '../../context/ContentAvailabilityContext';
import MathText from '../../lessons/common/components/MathText';
import MathLabel from '../../lessons/common/components/MathLabel';
import { loadUnitSummary, summaryLessons } from './unitSummary';
import './revision.css';

const L = {
  summary: 'Résumé du chapitre',
  head: ['La règle', 'En symboles et exemple', 'Attention'],
  example: 'Exemple',
  none: 'Ce chapitre n’a pas encore de résumé.',
  loading: 'Chargement…',
  back: 'Vers le chapitre',
  print: 'Imprimer',
};

/** The statements of a cell, one per line, read left to right. */
function Formulas({ lines }) {
  return (
    <div dir="ltr">
      {lines.map((line) => (
        <p key={line}>
          <MathText>{line}</MathText>
        </p>
      ))}
    </div>
  );
}

export default function UnitSummaryPage({ teacher = false }) {
  const { unitId } = useParams();
  const unit = getUnitById(unitId);
  const { isLessonLocked, isLessonClosed, isLessonHiddenByClass } = useContentAvailability();
  // a lesson the student may not open gives no rules here either; the teacher reads them all
  const open = summaryLessons(unit).filter(
    (l) => teacher || !(isLessonLocked(l.id) || isLessonClosed(l.id) || isLessonHiddenByClass(l.id)),
  );
  const key = open.map((l) => l.id).join();
  const [loaded, setLoaded] = useState({ key: null, lessons: [] });
  useDocumentMeta(`${L.summary} — ${unit?.title ?? ''}`);

  useEffect(() => {
    let alive = true;
    loadUnitSummary(open).then(
      (lessons) => alive && setLoaded({ key, lessons }),
      () => alive && setLoaded({ key, lessons: [] }),
    );
    return () => {
      alive = false;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loaded.key !== key) return <p className="rv-empty">{L.loading}</p>;
  if (!loaded.lessons.length) return <p className="rv-empty">{L.none}</p>;
  // the lesson's number in the unit, kept even when an earlier lesson is not shown
  const numberOf = (id) => unit.lessons.findIndex((l) => l.id === id) + 1;

  return (
    <article className="rv rv--unit" dir="ltr" data-unit-summary={unit.id}>
      <header className="rv-head">
        <div className="rv-head__row">
          <h1>
            <small>{L.summary}</small>
            <MathLabel>{unit.title}</MathLabel>
          </h1>
          <div className="rv-actions">
            {!teacher && (
              <Link to={unit.path} className="rv-btn">
                {L.back}
              </Link>
            )}
            <button type="button" className="rv-btn" onClick={() => window.print()}>
              {L.print}
            </button>
          </div>
        </div>
      </header>
      {loaded.lessons.map((lesson) => (
        <section key={lesson.id} className="rv-step" data-unit-summary-lesson={lesson.id}>
          <h2>
            <span className="rv-num">{numberOf(lesson.id)}</span>
            <MathLabel>{lesson.title}</MathLabel>
          </h2>
          <div className="rv-table">
            <table>
              <thead>
                <tr>
                  {L.head.map((cell) => (
                    <th key={cell}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lesson.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <b>
                        <MathLabel>{row.title}</MathLabel>
                      </b>
                      <br />
                      <MathText>{row.text}</MathText>
                    </td>
                    <td className="rv-math">
                      <Formulas lines={row.rule} />
                      {row.example.length > 0 && <p className="rv-math__tag">{L.example}</p>}
                      <Formulas lines={row.example} />
                    </td>
                    <td>
                      <MathText>{row.trap}</MathText>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </article>
  );
}
