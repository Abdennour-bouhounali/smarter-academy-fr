import { useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { BarChart3, Check, Clock, Eye, RotateCcw } from 'lucide-react';
import * as practice from '@smarter-academy/core/practice/index.js';
import { ArrowBack, ArrowForward } from '../../../components/common/DirectionalIcons';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { exerciseIdsFor, loadExercise } from '../../../features/practice/practiceContent';
import ExerciseStatement from '../../../features/practice/ExerciseStatement';
import QuestionRenderer from '../../../features/practice/QuestionRenderer';
import HintPanel from '../../../features/practice/HintPanel';
import FeedbackPanel from '../../../features/practice/FeedbackPanel';
import SessionProgress from '../../../features/practice/SessionProgress';
import RichText from '../../../features/practice/RichText';
import ReportButton from '../../../features/reports/ReportButton';
import { outcomeTone, historyEntry, recordQuestion } from '../../../features/practice/questionHistory';
import ExamSheet from '../../../features/practice/exam/ExamSheet';
import ExamNavigator from '../../../features/practice/exam/ExamNavigator';
import ExamPanelButton from '../../../features/practice/exam/ExamPanelButton';
import Modal from '../../../components/admin/ui/Modal';
import SolutionPanel from '../../../features/practice/exam/SolutionPanel';
import {
  answerChars,
  answerSize,
  isExamExercise,
  solutionReady,
  stepSeconds,
} from '../../../features/practice/exam/examSheet';
import StepTimer from '../../../features/practice/exam/StepTimer';
import MedalCelebration from '../../../features/practice/medals/MedalCelebration';
import { playMedal } from '../../../features/practice/medals/medalSound';
import { medalFor, medalReason } from '../../../features/practice/exam/medals';
import { useEffectsPreference } from '../../../lessons/common/hooks/useEffectsPreference';
import WorkArea, { MIN_WORK_CHARS, workLength, ZoneNumber } from '../../../features/practice/exam/WorkArea';
import { checkLocally, expectedAnswerText, localHint, teacherBankPath } from '../../../features/practice/teacherBank';
import {
  ClassroomPresentation,
  ClassroomEntryButton,
  ClassroomFrame,
  ClassroomHidden,
} from '../../../lessons/common/classroom';
import StudentResponsesPanel from './StudentResponsesPanel';
import SideColumnToggle from '../../../features/practice/SideColumnToggle';
import { useSideColumn, practiceGridClass } from '../../../features/practice/useSideColumn';
import MISCONCEPTIONS from '../../../../../../content/practice/misconceptions.json';

const { feedbackFor, isInertOutcome } = practice;

// Les MÊMES boutons que le lecteur de l'élève (PracticeSession).
const PRIMARY_BUTTON =
  'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-nav-accent px-6 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#3350c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none motion-reduce:transition-none';
// Tertiaire : texte + icône, sans fond — « Question précédente », « Exercice précédent ».
const TERTIARY_BUTTON =
  'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 motion-reduce:transition-none';
// Feuille d'examen : le petit « Vérifier » discret, comme côté élève.
const EXAM_CHECK_BUTTON =
  'inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-md border-[1.5px] border-[#1f5c4c] bg-white px-3.5 py-1.5 text-sm font-bold text-[#1f5c4c] transition-colors hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 motion-reduce:transition-none';
const EXAM_NAV_BUTTON =
  'inline-flex h-9 items-center gap-1 rounded-lg bg-white px-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-40';
const EXAM_NAV_NEXT =
  'inline-flex h-9 items-center gap-1 rounded-lg bg-[#1f5c4c] px-3 text-sm font-bold text-white transition-colors hover:bg-[#174a3d] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1';
const SECONDARY_BUTTON =
  'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-base font-bold text-slate-700 transition-colors hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 motion-reduce:transition-none';

/**
 * L'exercice, côté ENSEIGNANT — la même page que le lecteur de l'élève
 * (PracticeSession : grille, colonne latérale, en-tête, carte de question,
 * mêmes boutons, même mode classe), SANS AUCUN SUIVI : vérification locale
 * (teacherBank.checkLocally), indices tirés du contenu, réponse attendue
 * dévoilable. La colonne latérale, qui porte chez l'élève son point
 * d'apprentissage, porte ici « Les réponses de mes élèves » : qui, parmi SES élèves, a
 * fait cet exercice, et ce que chacun a répondu.
 */
export default function TeacherPracticePlayer() {
  const { t } = useTranslation('teacher');
  const { t: ts } = useTranslation('student');
  const { lessonCode, level, exerciseId } = useParams();
  // « Les réponses de mes élèves » se replie : l'exercice prend toute la largeur.
  const [sideHidden, toggleSide] = useSideColumn();
  const [exercise, setExercise] = useState(undefined);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [work, setWork] = useState('');
  const [unreadable, setUnreadable] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  // Aperçu des médailles (local, jamais enregistré : l'enseignant n'est pas suivi).
  const [award, setAward] = useState(null);
  const { enabled: soundOn } = useEffectsPreference();
  const [stepStartedAt, setStepStartedAt] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  // Corrigé type ouvert pour cette question : plus de « Réessayer » (propriétaire, 2026-10-08).
  const [solutionSeenFor, setSolutionSeenFor] = useState(null);
  const [hintCount, setHintCount] = useState(0);
  const [showExpected, setShowExpected] = useState(false);
  // L'issue de chaque question déjà vérifiée — pour les pastilles de SessionProgress.
  const [tones, setTones] = useState([]);
  // Feuille d'examen (brevet) : les étapes déjà faites restent affichées, avec
  // la réponse essayée — le même historique que le lecteur élève.
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setExercise(undefined);
    setIndex(0);
    setTones([]);
    setHistory([]);
    loadExercise(lessonCode, level, exerciseId)
      .then((data) => {
        if (!cancelled) setExercise(data);
      })
      .catch(() => {
        if (!cancelled) setExercise(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lessonCode, level, exerciseId]);

  // Une nouvelle question repart d'une page blanche.
  useEffect(() => {
    setAnswer(null);
    setWork('');
    setUnreadable(false);
    setStepStartedAt(null);
    setEvaluation(null);
    setHintCount(0);
    setShowExpected(false);
  }, [index, exerciseId]);

  const exerciseTitle = exercise?.metadata?.title ?? exerciseId;
  useDocumentMeta(exercise?.metadata?.title ?? t('practice.metaTitle'));

  const ids = exerciseIdsFor(lessonCode, level);
  const position = Math.max(0, ids.indexOf(exerciseId));
  const nextId = ids[position + 1] ?? null;
  const prevId = position > 0 ? ids[position - 1] : null;
  const questions = exercise?.questions ?? [];
  const question = questions[index] ?? null;
  const questionKey = `${exercise?.id ?? ''}:${question?.id ?? index}`;
  const hints = useMemo(
    () => Array.from({ length: hintCount }, (_, i) => localHint(question, i)).filter(Boolean),
    [question, hintCount],
  );
  const hintsTotal = question?.hints?.length ?? 0;
  const hubPath = teacherBankPath(lessonCode);

  if (exercise === undefined) {
    return (
      <div className="sa-surface-plain sa-page sa-page--flush py-6 sm:py-8">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }
  if (exercise === null || !question) {
    return (
      <div className="sa-surface-plain sa-page sa-page--flush space-y-4 py-6 sm:py-8">
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          {t('practice.notFound')}
        </p>
        <Link to={hubPath} className="text-sm font-bold text-nav-accent hover:underline">
          {ts('practice.backToLevels')}
        </Link>
      </div>
    );
  }

  const answered = evaluation !== null;
  const expected = expectedAnswerText(question);
  const isLast = index >= questions.length - 1;
  const levelName = ts(`practice.levelNames.${level}`, { defaultValue: '' });
  const minutes = exercise.metadata?.estimatedMinutes;
  const tags = exercise.metadata?.tags ?? [];
  const nextClass = answered ? `${PRIMARY_BUTTON} min-w-[10rem]` : SECONDARY_BUTTON;

  // Feuille d'examen (pratique du brevet, 2026-10-06) : même présentation que
  // l'élève — en-tête « Exercice … (… points) », étapes révélées une à une.
  const isExam = isExamExercise(exercise);
  const isSelfCheck = question.answerType === 'selfCheck';
  const size = answerSize(question);
  const selfPending = isSelfCheck && answered && evaluation.normalized === 'self:pending';
  const canSubmit =
    answer != null &&
    !(isSelfCheck && !answer.text) &&
    !(isExam && question.work === 'required' && workLength(work) < MIN_WORK_CHARS);
  // Une VRAIE tentative : une réponse vérifiée et lisible, ou une démonstration enregistrée.
  // (Prototype brevet : seulement sur une feuille d'examen ; les autres leçons gardent le bouton libre.)
  const triedForReal = !isExam || (answered && (selfPending || !isInertOutcome(evaluation.outcome)));
  const selfMark = (mark) => {
    if (!answer?.text) return;
    const marked = { ...answer, text: answer.text, selfMark: mark };
    const verdict = checkLocally(marked, question);
    setAnswer(marked);
    setEvaluation(verdict);
    setTones((list) => {
      const next = [...list];
      next[index] = outcomeTone(verdict.outcome);
      return next;
    });
  };
  // « Question précédente » : l'enseignant revient à l'étape précédente (rien n'est
  // suivi ici) — elle se rouvre vierge, les étapes suivantes se retirent.
  const goPreviousQuestion = () => {
    // Feuille d'examen : l'étape précédente reste sur la feuille, VERROUILLÉE
    // avec sa réponse — on y retourne (défilement), on ne la rouvre pas : le
    // corrigé type déjà vu ne doit pas servir à la refaire.
    if (isExam) {
      const prev = questions[index - 1];
      document
        .querySelector(`[data-exam-question="${prev?.id}"]`)
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    setHistory((h) => h.filter((e) => e.number < index));
    setTones((list) => list.slice(0, index - 1));
    setIndex((i) => Math.max(0, i - 1));
  };
  const goNextQuestion = () => {
    setHistory((h) => recordQuestion(h, historyEntry({ question, index, answer, evaluation })));
    setIndex((i) => i + 1);
  };

  const check = () => {
    if (answered || !canSubmit) return;
    let sent = question.work && work.trim() ? { ...answer, work } : answer;
    if (isExam && stepStartedAt) sent = { ...sent, seconds: Math.round((Date.now() - stepStartedAt) / 1000) };
    if (sent !== answer) setAnswer(sent);
    const verdict = checkLocally(sent, question);
    // Feuille d'examen : une saisie illisible ne verrouille pas l'étape (comme côté élève).
    if (isExam && verdict.outcome === 'syntax_error') {
      setUnreadable(true);
      return;
    }
    setUnreadable(false);
    setEvaluation(verdict);
    if (isExam) {
      const facts = {
        outcome: verdict.outcome,
        answerType: question.answerType,
        hintsUsed: hintCount,
        seconds: sent?.seconds ?? null,
        limit: stepSeconds(question, exercise),
      };
      const medal = medalFor(facts);
      if (medal) {
        setAward({ id: Date.now(), medal, reason: medalReason(facts) });
        playMedal(medal, soundOn);
      }
    }
    setTones((list) => {
      const next = [...list];
      next[index] = outcomeTone(verdict.outcome);
      return next;
    });
  };

  // Feuille d'examen : la navigation EN HAUT, petite (propriétaire, 2026-10-06).
  const examNav = (
    <nav className="flex flex-wrap items-center gap-1.5" aria-label={ts('practice.exam.nav.title')} data-exam-nav>
      {index > 0 && (
        <button type="button" onClick={goPreviousQuestion} className={EXAM_NAV_BUTTON} data-previous-question-button>
          <ArrowBack className="h-3.5 w-3.5" aria-hidden="true" /> {ts('practice.previousQuestion')}
        </button>
      )}
      {prevId && (
        <Link to={teacherBankPath(lessonCode, level, prevId)} className={EXAM_NAV_BUTTON} data-previous-exercise>
          <ArrowBack className="h-3.5 w-3.5" aria-hidden="true" /> {ts('practice.previousExercise')}
        </Link>
      )}
      {!isLast ? (
        <button
          type="button"
          onClick={goNextQuestion}
          className={answered ? EXAM_NAV_NEXT : EXAM_NAV_BUTTON}
          data-next-question
        >
          {ts('practice.nextQuestion')} <ArrowForward className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : nextId ? (
        <Link
          to={teacherBankPath(lessonCode, level, nextId)}
          className={answered ? EXAM_NAV_NEXT : EXAM_NAV_BUTTON}
          data-next-exercise
        >
          {ts('practice.nextExercise')} <ArrowForward className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ) : (
        <Link to={hubPath} className={EXAM_NAV_BUTTON}>
          {ts('practice.backToLevels')}
        </Link>
      )}
    </nav>
  );

  // La zone de réponse — la même dans la carte classique et dans l'étape
  // courante d'une feuille d'examen.
  const answerZone = (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          check();
        }}
        className={
          isExam
            ? size === 'proof'
              ? 'flex flex-col items-start gap-2'
              : 'flex flex-wrap items-end gap-x-4 gap-y-2'
            : 'space-y-3'
        }
        data-answer-form
        data-answer-size={isExam ? size : undefined}
        style={isExam ? { '--answer-ch': answerChars(question) } : undefined}
      >
        {isExam && question.work && (
          <div className="w-full basis-full">
            <WorkArea key={question.id} question={question} value={work} onChange={setWork} disabled={answered} />
          </div>
        )}
        {/* La zone « 2 » : le résultat final, séparé du calcul (« 1 ») ci-dessus. */}
        {isExam && question.work && (
          <div
            className="w-full basis-full space-y-1 border-t-2 border-dashed border-slate-300 pt-3"
            data-result-zone-header
          >
            <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
              <ZoneNumber n={2} tone="green" /> {ts('practice.exam.result.title')}
            </p>
            {!answered && <p className="text-xs text-slate-600">{ts('practice.exam.result.hint')}</p>}
          </div>
        )}
        <div
          className={
            isExam
              ? `min-w-0 ${size === 'long' || size === 'proof' ? 'w-full' : ''} ${question.work ? 'rounded-lg border-2 border-[#1f5c4c]/60 bg-emerald-50/40 p-2' : ''}`
              : 'flex flex-col gap-1.5'
          }
          data-result-zone={isExam && question.work ? '' : undefined}
        >
          {!isExam && (
            <span className="shrink-0 text-sm font-bold text-slate-700" aria-hidden="true">
              {ts('practice.yourAnswerLabel')}
            </span>
          )}
          <QuestionRenderer
            question={question}
            value={answer}
            onChange={(v) => {
              setAnswer(v);
              setUnreadable(false);
            }}
            disabled={answered}
            exam={isExam}
            {...(isSelfCheck ? { onSelfMark: selfMark, mark: answer?.selfMark ?? null } : {})}
          />
        </div>
        {unreadable && !answered && (
          <p className="w-full basis-full text-sm font-semibold text-orange-700" role="alert" data-unreadable>
            {ts('practice.exam.unreadable')}
          </p>
        )}
        {!answered && (
          <button
            type="submit"
            disabled={!canSubmit}
            className={isExam ? EXAM_CHECK_BUTTON : `${PRIMARY_BUTTON} w-full sm:w-auto sm:min-w-[14rem]`}
            data-validate
          >
            <Check className="h-5 w-5" aria-hidden="true" />{' '}
            {isSelfCheck ? ts('practice.exam.selfCheck.record') : ts('practice.checkMyAnswer')}
          </button>
        )}
      </form>

      {answered && !selfPending && (
        <FeedbackPanel
          evaluation={evaluation}
          message={feedbackFor(question, evaluation, MISCONCEPTIONS, {
            syntaxError: ts('practice.syntaxErrorFeedback'),
          })}
        />
      )}
      {/* Corrigé type : seulement après une vraie tentative (comme l'élève). */}
      {answered &&
        !isSelfCheck &&
        !isInertOutcome(evaluation.outcome) &&
        question.solution &&
        (!isExam || solutionReady(exercise.questions, index, index)) && (
          <SolutionPanel solution={question.solution} onReveal={() => setSolutionSeenFor(questionKey)} />
        )}
      {answered && !evaluation.isCorrect && !isSelfCheck && solutionSeenFor !== questionKey && (
        <button
          type="button"
          onClick={() => {
            setEvaluation(null);
            setAnswer(null);
          }}
          className={SECONDARY_BUTTON}
          data-retry
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> {ts('practice.retry')}
        </button>
      )}

      <HintPanel
        key={`hints-${exerciseId}:${question.id}`}
        hints={hints}
        remaining={hintsTotal - hintCount}
        hintTypes={question.hints?.map((h) => h.type) ?? []}
        onRequest={() => setHintCount((n) => Math.min(n + 1, hintsTotal))}
        busy={false}
        disabled={false}
      />

      {/* La réponse attendue, pour une question SANS corrigé type seulement : quand
          « Corrigé type » existe, il porte déjà la réponse encadrée — le bouton
          « Afficher la réponse attendue » le répétait mot pour mot (propriétaire, 2026-10-08). */}
      {expected && !question.solution?.lines?.length && (
        <ClassroomHidden>
          <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 ring-1 ring-slate-200">
            {showExpected ? (
              <p className="text-sm text-slate-800" data-expected-answer>
                <span className="font-bold">{t('practice.expectedAnswer')}</span> <RichText>{expected}</RichText>
              </p>
            ) : (
              // La réponse attendue se MÉRITE ici aussi (propriétaire, 2026-10-06) :
              // inactive tant qu'aucune réponse n'a été saisie et vérifiée
              // (« Vérifier ma réponse »). Une saisie illisible ne compte pas ; une
              // démonstration enregistrée (« Montrer que ») compte.
              <span className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpected(true)}
                  disabled={!triedForReal}
                  className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-bold text-nav-accent hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                  data-show-expected
                >
                  <Eye className="h-4 w-4" aria-hidden="true" /> {t('practice.showExpected')}
                </button>
                {!triedForReal && (
                  <span className="text-xs text-slate-500" data-expected-locked>
                    {t('practice.expectedLocked')}
                  </span>
                )}
              </span>
            )}
          </div>
        </ClassroomHidden>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <ClassroomHidden>
          <ReportButton
            key={`report-${question.id}`}
            source="question"
            variant="link"
            context={{ lessonCode, exerciseCode: exerciseId, questionId: question.id }}
          />
        </ClassroomHidden>
        {/* Revenir en arrière, toujours possible (propriétaire, 2026-10-06). Sur
            une feuille d'examen, cette navigation est EN HAUT (examNav). */}
        {!isExam && (
          <>
            <span className="flex flex-wrap items-center gap-1">
              {index > 0 && (
                <button
                  type="button"
                  onClick={goPreviousQuestion}
                  className={TERTIARY_BUTTON}
                  data-previous-question-button
                >
                  <ArrowBack className="h-4 w-4" aria-hidden="true" /> {ts('practice.previousQuestion')}
                </button>
              )}
              {prevId && (
                <Link
                  to={teacherBankPath(lessonCode, level, prevId)}
                  className={TERTIARY_BUTTON}
                  data-previous-exercise
                >
                  <ArrowBack className="h-4 w-4" aria-hidden="true" /> {ts('practice.previousExercise')}
                </Link>
              )}
            </span>
            {!isLast ? (
              <button type="button" onClick={goNextQuestion} className={nextClass} data-next-question>
                {ts('practice.nextQuestion')} <ArrowForward className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : nextId ? (
              <Link to={teacherBankPath(lessonCode, level, nextId)} className={nextClass} data-next-exercise>
                {ts('practice.nextExercise')} <ArrowForward className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              <Link to={hubPath} className={nextClass}>
                {ts('practice.backToLevels')}
              </Link>
            )}
          </>
        )}
      </div>
    </>
  );

  return (
    <div className={`sa-surface-plain sa-page sa-page--flush ${isExam ? 'py-3 sm:py-4' : 'py-6 sm:py-8'}`}>
      <MotionConfig reducedMotion="user">
        {isExam && <MedalCelebration award={award} onDone={() => setAward(null)} />}
        <ClassroomPresentation scope="exercise" title={exerciseTitle} entry="none" className="w-full space-y-3">
          <ClassroomHidden>
            <nav
              className="flex flex-wrap items-center justify-between gap-3"
              aria-label={ts('nav.breadcrumb', { ns: 'lesson' })}
            >
              <Link
                to={hubPath}
                className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-lg px-1 text-sm font-bold text-slate-700 hover:text-nav-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <ArrowBack className="h-4 w-4" aria-hidden="true" /> {ts('practice.backToLevels')}
              </Link>
              <span className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200"
                  data-no-tracking
                >
                  {t('practice.noTracking')}
                </span>
                {isExam ? (
                  <ExamPanelButton label={t('practice.responses.short')} onOpen={() => setPanelOpen(true)} />
                ) : (
                  <SideColumnToggle hidden={sideHidden} onToggle={toggleSide} label={t('practice.responses.short')} />
                )}
                <ClassroomEntryButton scope="exercise" title={exerciseTitle} tone="quiet" />
              </span>
            </nav>
          </ClassroomHidden>

          {/* Feuille d'examen : la navigation et les réponses des élèves dans une
          fenêtre au centre, pas dans une colonne latérale. */}
          {isExam && (
            <Modal
              open={panelOpen}
              onClose={() => setPanelOpen(false)}
              title={t('practice.responses.short')}
              closeLabel={ts('practice.exam.panelClose')}
              size="xl"
            >
              <div className="space-y-3" data-exam-panel>
                <ExamNavigator
                  exercise={exercise}
                  questionIndex={index}
                  history={history}
                  onJump={() => setPanelOpen(false)}
                />
                <StudentResponsesPanel lessonCode={lessonCode} exerciseId={exerciseId} questions={questions} />
              </div>
            </Modal>
          )}

          <div className={isExam ? 'w-full space-y-3' : practiceGridClass(sideHidden)}>
            {!isExam && (
              <ClassroomHidden>
                <aside className={`space-y-3 xl:sticky xl:top-4 ${sideHidden ? 'xl:hidden' : ''}`} data-practice-side>
                  <StudentResponsesPanel lessonCode={lessonCode} exerciseId={exerciseId} questions={questions} />
                </aside>
              </ClassroomHidden>
            )}

            <div className="min-w-0 space-y-3">
              <ClassroomHidden>
                <header className="space-y-1" data-exercise-header>
                  <p
                    className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-semibold text-slate-600"
                    data-exercise-level
                  >
                    <span className="inline-flex items-center gap-1.5 font-bold text-nav-accent">
                      <BarChart3 className="h-4 w-4" aria-hidden="true" />
                      {ts('practice.levelLabel', { level })}
                      {levelName ? ` · ${levelName}` : ''}
                    </span>
                    {minutes && !isExam ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {ts('practice.meta.minutes', { count: minutes })}
                      </span>
                    ) : null}
                    {tags.length > 0 && !isExam && <span>{tags.join(', ')}</span>}
                  </p>
                  <h1 className={isExam ? 'sr-only' : 'text-lg font-bold leading-snug text-slate-900 sm:text-xl'}>
                    {exerciseTitle}
                  </h1>
                </header>
              </ClassroomHidden>

              <ClassroomFrame maxWidth={1080}>
                <div className="space-y-3" data-exercise-workspace>
                  {isExam ? (
                    <>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-white/80 px-4 py-1.5 ring-1 ring-slate-200 sm:px-5">
                        <div className="min-w-0 flex-1">
                          <SessionProgress
                            index={position}
                            total={ids.length}
                            questionIndex={index}
                            questionTotal={questions.length}
                            questionTones={tones}
                            currentTone={answered ? outcomeTone(evaluation.outcome) : null}
                            headingId="teacher-question-heading"
                          />
                        </div>
                        {examNav}
                      </div>
                      <ExamSheet
                        exercise={exercise}
                        questionIndex={index}
                        answeredThrough={answered ? index : index - 1}
                        history={history}
                        started={answered || stepStartedAt !== null}
                        onStart={() => setStepStartedAt(Date.now())}
                        timer={
                          <StepTimer
                            limit={stepSeconds(question, exercise)}
                            startedAt={stepStartedAt}
                            stoppedSeconds={answered && Number.isFinite(answer?.seconds) ? answer.seconds : null}
                          />
                        }
                      >
                        <div className="space-y-4" data-exam-answer-zone>
                          {question.visual && <ExerciseStatement visual={question.visual} support={question.support} />}
                          {answerZone}
                        </div>
                      </ExamSheet>
                    </>
                  ) : (
                    <>
                      {(exercise.statement?.content ||
                        exercise.statement?.visual ||
                        exercise.statement?.figure ||
                        exercise.statement?.support) && (
                        <section className="rounded-xl bg-white/70 px-3.5 py-3 ring-1 ring-slate-200 sm:px-4">
                          <p className="mb-1 text-xs font-bold text-slate-600">{ts('practice.statementLabel')}</p>
                          <ExerciseStatement
                            content={exercise.statement?.content}
                            visual={exercise.statement?.visual}
                            formulas={exercise.statement?.formulas}
                            table={exercise.statement?.table}
                            figure={exercise.statement?.figure}
                            support={exercise.statement?.support}
                          />
                        </section>
                      )}

                      <section
                        key={`${exerciseId}:${question.id}`}
                        aria-labelledby="teacher-question-heading"
                        data-current-question={index + 1}
                        className="relative overflow-hidden rounded-2xl border-s-4 border-nav-accent bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_28px_-16px_rgba(15,23,42,0.22)] ring-1 ring-slate-200"
                      >
                        <header className="border-b border-indigo-100 bg-indigo-50/50 px-4 py-2.5 sm:px-5">
                          <SessionProgress
                            index={position}
                            total={ids.length}
                            questionIndex={index}
                            questionTotal={questions.length}
                            questionTones={tones}
                            currentTone={answered ? outcomeTone(evaluation.outcome) : null}
                            headingId="teacher-question-heading"
                          />
                        </header>

                        <div className="space-y-4 p-4 sm:p-5">
                          <div className="space-y-3">
                            <p
                              className="text-lg font-semibold leading-relaxed text-slate-900 sm:text-xl"
                              data-question-statement
                            >
                              <RichText>{question.statement}</RichText>
                            </p>
                            {question.visual && (
                              <ExerciseStatement visual={question.visual} support={question.support} />
                            )}
                          </div>

                          {answerZone}
                        </div>
                      </section>
                    </>
                  )}
                </div>
              </ClassroomFrame>
            </div>
          </div>
        </ClassroomPresentation>
      </MotionConfig>
    </div>
  );
}
