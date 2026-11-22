import { forwardRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RichText from '../RichText';
import StatementFigure from '../../../lessons/common/components/StatementFigure';
import ProblemTable from '../../../lessons/common/problems/ProblemTable';
import { StudentAnswer } from '../QuestionHistory';
import { ToneIcon, TONE_STYLE } from '../toneStyle';
import SolutionPanel from './SolutionPanel';
import { examBadge, examPaper, examPart, examSession, formatClock, stepMarks, stepSeconds, stepState, solutionReady } from './examSheet';
import { Timer } from 'lucide-react';
import StepTimer from './StepTimer';
import RedactionText from './math/RedactionText';
import Medal from '../medals/Medal';
import { medalFor } from './medals';
import { ensureExamFont } from './examFont';
import AnswerImageGallery from './images/AnswerImageGallery';
import ReviewStatus from './images/ReviewStatus';

/**
 * LA FEUILLE D'EXAMEN — un exercice de pratique présenté comme un sujet de
 * شهادة التعليم المتوسط (décision du propriétaire, 2026-10-06 : « l'élève doit
 * se dire : c'est exactement l'examen »).
 *
 * Ce que le papier montre, la feuille le montre :
 *  - l'en-tête « التمرين الأول (02,5 ن) » souligné, et le ruban de session
 *    « BEM 2008 » (ou « على منوال BEM 2015 ») à l'autre bout ;
 *  - l'énoncé de mise en place, puis les formules CENTRÉES sur leur ligne ;
 *  - les étapes 01 / 02 / 03 et leurs (ا)(ب)(ج), numéros encadrés — révélées
 *    UNE À UNE : la 02 s'ajoute sous la 01 quand l'élève l'a résolue, rien ne
 *    disparaît (demande du propriétaire, 2026-10-06).
 *
 * Ce que l'écran ajoute, sans changer de nature : l'étape COURANTE s'ouvre sur
 * sa zone de réponse (`children`, le formulaire du lecteur) ; les étapes faites
 * rappellent la réponse de l'élève, son verdict et le corrigé type replié.
 *
 * Le lecteur (PracticeSession) garde TOUT l'état : une question à la fois,
 * jugée par le serveur. Cette feuille n'est qu'une présentation.
 */
const ExamSheet = forwardRef(function ExamSheet({ exercise, questionIndex, history, children, timer = null, started = true, onStart = null, startReady = true, imageLoader = null, answeredThrough = questionIndex - 1 }, currentRef) {
  const { t } = useTranslation('student');
  useEffect(() => { ensureExamFont(); }, []);

  const exam = exercise.metadata.exam;
  const badge = examBadge(exam);
  const paper = examPaper(exercise.lessonCode);
  const part = examPart(exercise);
  const session = examSession(exercise);
  const marks = stepMarks(exercise.questions);
  const statement = exercise.statement ?? {};
  const minutes = exercise.metadata?.estimatedMinutes;

  return (
    <article
      className="sa-exam-paper relative rounded-sm bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.08),0_14px_34px_-18px_rgba(15,23,42,0.35)] ring-1 ring-slate-300 sm:px-7 sm:py-5"
      aria-labelledby="exam-sheet-heading"
      data-exam-sheet={exam.kind}
    >
      {/* ── L'en-tête du sujet (maquette du propriétaire, 2026-10-06) ──────
          Trois lignes centrées comme une feuille d'examen, puis le cadre
          d'informations : niveau, durée conseillée, دورة (sujet officiel),
          provenance. « اختبار تجريبي » dit que c'est un entraînement. */}
      {/* Une seule rangée (propriétaire, 2026-10-06) : le titre au MILIEU, les
          informations sur les côtés — المستوى et الدورة à droite, المدة et
          المصدر à gauche — comme l'en-tête d'un sujet. Sur téléphone : le
          titre d'abord, les deux côtés dessous. */}
      <header
        className="mb-3 grid grid-cols-2 items-center gap-x-4 gap-y-2 border-b border-slate-300 pb-2.5 text-[13px] sm:grid-cols-[1fr_auto_1fr]"
        data-exam-paper-header
      >
        <div className="col-span-2 text-center leading-snug sm:order-2 sm:col-span-1">
          <p className="text-sm font-bold text-slate-900 sm:text-base">{t('practice.exam.paper.republic')}</p>
          <p className="text-base font-bold text-slate-900 sm:text-lg" data-exam-paper-kind={paper.kind}>{t(paper.kind === 'term' ? 'practice.exam.paper.titleTerm' : 'practice.exam.paper.title')}</p>
          <p className="text-sm font-bold text-slate-800">{t('practice.exam.paper.subject')}</p>
        </div>
        <dl className="space-y-0.5 justify-self-start sm:order-1 [&_dd]:whitespace-nowrap [&_dt]:whitespace-nowrap" data-exam-info>
          <div className="flex gap-1"><dt className="font-bold">{t('practice.exam.paper.level')}:</dt><dd>{t('practice.exam.paper.levelValue', { n: paper.n })}</dd></div>
          <div className="flex gap-1" data-exam-session={session ?? undefined}>
            <dt className="font-bold">{t('practice.exam.year')}:</dt>
            <dd>{session ? <bdi dir="ltr">{session}</bdi> : t('practice.exam.paper.training')}</dd>
          </div>
        </dl>
        <dl className="space-y-0.5 justify-self-end sm:order-3 [&_dd]:whitespace-nowrap [&_dt]:whitespace-nowrap">
          {minutes ? (
            <div className="flex gap-1"><dt className="font-bold">{t('practice.exam.paper.duration')}:</dt><dd>{t('practice.meta.minutes', { count: minutes })}</dd></div>
          ) : null}
          <div className="flex gap-1" data-exam-badge={badge?.kind ?? 'adapted'}>
            <dt className="font-bold">{t('practice.exam.paper.source')}:</dt>
            <dd>
              {badge ? (
                <>{badge.prefix && <span>{badge.prefix} </span>}<bdi dir={badge.ltr ? 'ltr' : 'rtl'} className="font-bold text-violet-800">{badge.label}</bdi></>
              ) : t('practice.exam.paper.lessonExercise')}
            </dd>
          </div>
        </dl>
      </header>

      {/* « الجزء الثاني » coiffe la وضعية الإدماجية, comme sur le sujet. */}
      {part === 2 && <p className="mb-2 text-lg font-bold text-slate-900 sm:text-xl" data-exam-part>{t('practice.exam.part.2')}:</p>}
      {/* Le bandeau de l'exercice : « التمرين الأول: » d'un côté, « (02,5 ن) » de l'autre. */}
      <h2
        id="exam-sheet-heading"
        className="mb-2.5 flex items-center justify-between gap-3 rounded-md bg-slate-100 px-4 py-1.5 text-base font-bold text-slate-900 sm:text-lg"
      >
        <span>{exam.heading}:</span>
        <span data-exam-points>(<bdi dir="ltr">{exam.points}</bdi> {t('practice.exam.pointsUnit')})</span>
      </h2>

      {/* ── Mise en place ────────────────────────────────────────────────── */}
      <div className="space-y-2 text-[17px] leading-relaxed text-slate-900 sm:text-lg" data-exam-statement>
        {/* `\n\n` = paragraphe ; `\n` seul = retour à la ligne (les « • » du sujet). */}
        {statement.content && statement.content.split('\n\n').map((p, i) => <p key={i} className="whitespace-pre-line"><RichText>{p}</RichText></p>)}
        {statement.formulas?.length > 0 && (
          <p className="flex flex-wrap items-baseline justify-center gap-x-10 gap-y-2 py-1" data-exam-formulas>
            {/* Une formule trop longue défile dans SA boîte : jamais toute la page (360 px). */}
            {statement.formulas.map((f, i) => <span key={i} className="max-w-full overflow-x-auto" data-exam-formula><RichText>{`$${f}$`}</RichText></span>)}
          </p>
        )}
        {statement.figure && <StatementFigure {...statement.figure} />}
        {statement.table && <ProblemTable {...statement.table} />}
      </div>

      {/* ── Les étapes ───────────────────────────────────────────────────── */}
      <ol className="mt-2 space-y-2.5" data-exam-steps>
        {/* Progressif (demande du propriétaire, 2026-10-06) : la question 01
            d'abord ; une fois résolue, la 02 s'AJOUTE dessous, la 01 reste. Les
            étapes à venir ne s'affichent pas. */}
        {exercise.questions.slice(0, questionIndex + 1).map((q, i) => {
          const state = stepState(i, questionIndex);
          const mark = marks[i];
          const entry = state === 'done' ? history.find((e) => e.questionId === q.id) : null;
          const isPrevious = state === 'done' && i === questionIndex - 1;
          // « ابدأ » (propriétaire, 2026-10-06) : l'étape courante reste CACHÉE
          // tant que l'élève n'a pas lancé son chrono ; l'appui révèle l'énoncé.
          if (state === 'current' && !started && onStart) {
            return (
              <li key={q.id} ref={currentRef} data-exam-step="current" data-step-locked aria-current="step" className="scroll-mt-20 lg:scroll-mt-6">
                <div className="flex flex-wrap items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/70 px-3 py-3">
                  {mark.step && <StepBox step={mark.step} />}
                  {mark.sub && <span className="font-bold">({mark.sub})</span>}
                  <span className="flex-1 text-sm text-slate-600">
                    {t('practice.exam.timer.hidden', { limit: formatClock(stepSeconds(q, exercise)) })}
                  </span>
                  <button
                    type="button"
                    onClick={onStart}
                    disabled={!startReady}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#1f5c4c] px-4 py-2 font-sans text-sm font-bold text-white hover:bg-[#174a3d] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                    data-step-start
                  >
                    <Timer className="h-4 w-4" aria-hidden="true" /> {t('practice.exam.timer.start')}
                  </button>
                </div>
              </li>
            );
          }
          return (
            <li
              key={q.id}
              ref={state === 'current' ? currentRef : undefined}
              tabIndex={isPrevious ? -1 : undefined}
              data-previous-question={isPrevious ? '' : undefined}
              data-exam-step={state}
              aria-current={state === 'current' ? 'step' : undefined}
              className={state === 'current'
                ? 'scroll-mt-20 lg:scroll-mt-6'
                : 'scroll-mt-20 focus:outline-none'}
            >
              {q.lead && (
                <p className="mb-1 flex items-start gap-2 text-[17px] leading-relaxed text-slate-900 sm:text-lg">
                  {mark.step && <StepBox step={mark.step} />}
                  <span className="min-w-0"><RichText>{q.lead}</RichText></span>
                </p>
              )}
              <p className={`flex items-start gap-2 text-[17px] leading-relaxed sm:text-lg ${
                state === 'current' ? 'font-semibold text-slate-900' : 'text-slate-800'
              } ${mark.step && !q.lead ? '' : 'ps-9'}`} data-exam-question={q.id}>
                {mark.step && !q.lead && <StepBox step={mark.step} />}
                {mark.sub && <span className="shrink-0 font-bold">({mark.sub})</span>}
                <span className="min-w-0 flex-1"><RichText>{q.statement}</RichText></span>
                {/* Le chrono de l'étape EN COURS, au bout de sa ligne. */}
                {state === 'current' && timer && <span className="mt-1 shrink-0">{timer}</span>}
              </p>

              {state === 'done' && entry && (
                <div className="mt-1.5 space-y-2 ps-9">
                  <p className={`flex flex-wrap items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm ${TONE_STYLE[entry.tone].chip}`}>
                    <ToneIcon tone={entry.tone} className="h-4 w-4" />
                    <span className="font-bold">{t('practice.exam.yourAnswer')}</span>
                    <StudentAnswer answer={entry.answer} />
                    {Number.isFinite(entry.seconds) && <StepTimer limit={stepSeconds(q, exercise)} stoppedSeconds={entry.seconds} />}
                    {(() => {
                      const m = medalFor({ outcome: entry.outcome, answerType: q.answerType, hintsUsed: entry.hintsUsed ?? 0, seconds: entry.seconds, limit: stepSeconds(q, exercise), evaluatedBy: entry.evaluatedBy });
                      return m ? <span className="inline-flex" data-step-medal={m}><Medal medal={m} size={20} title={t(`practice.medals.name.${m}`)} /></span> : null;
                    })()}
                  </p>
                  {/* Corrigé seulement après une VRAIE tentative : une étape passée
                      sur une saisie illisible ne le montre pas. */}
                  {entry.work && (
                    <div className="space-y-0.5" data-exam-work-recap>
                      <p className="text-xs font-bold text-slate-600">{t('practice.exam.work.label')}</p>
                      <RedactionText text={entry.work} className="sa-exam-ink" />
                    </div>
                  )}
                  {/* Les photos de la copie (prototype BEM, 2026-10-06) — annotées par l'enseignant le cas échéant. */}
                  {entry.images?.length > 0 && imageLoader && <AnswerImageGallery images={entry.images} loader={imageLoader} size="sm" />}
                  {/* « تصحيح الأستاذ » : en attente (ni corrigé ni médaille), ou verdict et commentaire. */}
                  <ReviewStatus review={entry.review} pending={entry.normalized === 'review:pending'} />
                  {(q.answerType !== 'selfCheck' || entry.evaluatedBy === 'teacher') && !['syntax_error', 'abandoned'].includes(entry.outcome) && solutionReady(exercise.questions, i, answeredThrough) && <SolutionPanel solution={q.solution} />}
                </div>
              )}

              {/* La réponse s'écrit sous la question, alignée sur son texte, comme sur la copie. */}
              {state === 'current' && <div className="mt-1.5 ps-9">{children}</div>}
            </li>
          );
        })}
      </ol>

      <p className="mt-3 flex items-center justify-center gap-3 text-sm text-slate-500" aria-hidden="true" data-exam-good-luck>
        <span className="h-px w-16 bg-slate-300" />{t('practice.exam.paper.goodLuck')}<span className="h-px w-16 bg-slate-300" />
      </p>
    </article>
  );
});

/** Le numéro d'étape encadré, comme sur le sujet (« 01 » dans un carré rouge). */
function StepBox({ step }) {
  return (
    <bdi
      dir="ltr"
      className="mt-1 inline-flex h-6 min-w-[1.85rem] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-rose-500 bg-rose-50 px-1 font-sans text-sm font-bold leading-none text-rose-600"
      data-exam-step-box
    >
      {step}
    </bdi>
  );
}

export default ExamSheet;
