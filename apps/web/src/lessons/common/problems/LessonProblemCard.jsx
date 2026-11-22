import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import MathText from '../components/MathText';
import { MoreToggle, useStudentFocus } from '../components/StudentFocus';

// Le support (figure / repère / tableau) n'alourdit pas le sommaire : chargé seulement s'il existe.
const ProblemSupport = lazy(() => import('./ProblemSupport'));

/**
 * « مسألة الدرس » — l'énoncé de la مسألة 1, montré AVANT d'apprendre : au
 * sommaire (LessonIndex) et à la fin du laboratoire d'ouverture (module 1).
 * L'élève la lit, y pense, et la résout pas à pas au module `lessonProblem.module`.
 *
 * @param {{ title: string, statement: string, questions?: {label: string, text: string}[], figure?, visual?, table?, illustration? }} problem  LESSON_CONFIG.lessonProblem
 *        (`questions` : les demandes de la مسألة 1, affichées sous l'énoncé et le support)
 *        (le support, s'il existe, est la même donnée que celle de la مسألة 1 — une seule source)
 * @param {string} [to]           lien vers le module qui la résout
 * @param {string} [moduleTitle]  titre de ce module (pour le libellé du lien)
 * @param {boolean} [compact]     variante dans un module
 */
export default function LessonProblemCard({ problem, to, moduleTitle, compact = false }) {
  const { t } = useTranslation('lesson');
  // Regard « focus » : le titre et le dessin ; l'énoncé et les questions à un geste (« اقرأ المسألة »).
  const focus = useStudentFocus();
  if (!problem) return null;
  const text = (
    <>
      <p className="text-sm leading-relaxed"><MathText>{problem.statement}</MathText></p>
      {problem.questions?.length > 0 && (
        <ol className="space-y-1 text-sm leading-relaxed list-none">
          {problem.questions.map((q) => (
            <li key={q.label} className="flex gap-1.5">
              <span className="font-bold shrink-0">{q.label}</span>
              <span><MathText>{q.text}</MathText></span>
            </li>
          ))}
        </ol>
      )}
      <p className="text-xs text-amber-800">{t('problem.lessonProblemLead')}</p>
    </>
  );
  return (
    <section className={`rounded-2xl border-2 border-amber-300 bg-amber-50 ${compact ? 'p-3' : 'p-5'} space-y-2 text-amber-950`} data-lesson-problem>
      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-amber-800">
        <span aria-hidden="true">🧩</span>{t('problem.lessonProblem')}
      </p>
      <h2 className={`font-space font-bold ${compact ? 'text-sm' : 'text-base'}`}>{problem.title}</h2>
      {!focus && <p className="text-sm leading-relaxed"><MathText>{problem.statement}</MathText></p>}
      {(problem.figure || problem.visual || problem.table || problem.illustration) && (
        <Suspense fallback={null}>
          <ProblemSupport figure={problem.figure} visual={problem.visual} table={problem.table} illustration={problem.illustration} />
        </Suspense>
      )}
      {focus ? <MoreToggle label={t('focus.problem')}><div className="space-y-2">{text}</div></MoreToggle> : (
        <>
          {problem.questions?.length > 0 && (
            <ol className="space-y-1 text-sm leading-relaxed list-none">
              {problem.questions.map((q) => (
                <li key={q.label} className="flex gap-1.5">
                  <span className="font-bold shrink-0">{q.label}</span>
                  <span><MathText>{q.text}</MathText></span>
                </li>
              ))}
            </ol>
          )}
          <p className="text-xs text-amber-800">{t('problem.lessonProblemLead')}</p>
        </>
      )}
      {to && moduleTitle && (
        <Link to={to} className="inline-block text-xs font-bold text-amber-900 underline hover:text-amber-700">
          {t('problem.lessonProblemOpen', { module: moduleTitle })}
        </Link>
      )}
    </section>
  );
}
