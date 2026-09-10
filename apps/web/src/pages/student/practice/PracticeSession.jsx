import { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { practice } from '@smarter-academy/core';
import { AuthContext } from '../../../context/AuthContext';
import {
  fetchPracticeSession, openQuestion, requestHint, submitAnswer,
  completeExercise, completeSession, createNote,
} from '../../../services/practiceService';
import { exerciseIdsFor, loadExercise } from '../../../features/practice/practiceContent';
import ExerciseStatement from '../../../features/practice/ExerciseStatement';
import QuestionRenderer from '../../../features/practice/QuestionRenderer';
import HintPanel from '../../../features/practice/HintPanel';
import FeedbackPanel from '../../../features/practice/FeedbackPanel';
import SessionProgress from '../../../features/practice/SessionProgress';
import NotebookButton from '../../../features/practice/NotebookButton';
import RichText from '../../../features/practice/RichText';
import { ValidateButton } from '../../../lessons/common/components/LessonUI';
import MISCONCEPTIONS from '../../../../../../content/practice/misconceptions.json';

const { evaluateAnswer, feedbackFor } = practice;

/**
 * Le lecteur d'exercices.
 *
 * La justesse est calculée ici, par @smarter-academy/core — même frontière de
 * confiance que le test final. Le serveur, lui, enregistre la tentative, lit
 * dans le CONTENU quels points d'apprentissage la question mesure, et fait
 * l'arithmétique de la maîtrise.
 *
 * Une réponse fausse ne bloque jamais : « Continuer » est toujours là. On
 * peut réessayer, mais on n'y est jamais obligé — c'est l'invariant de
 * progression non bloquante que tout le dépôt applique.
 */
export default function PracticeSession() {
  const { lessonCode, sessionId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [exercise, setExercise] = useState(null);
  const [index, setIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [attemptUuid, setAttemptUuid] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [hints, setHints] = useState([]);
  const [hintsRemaining, setHintsRemaining] = useState(0);
  const [busy, setBusy] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [error, setError] = useState(null);

  // Le niveau vient du serveur à la première réponse ; en attendant, l'ordre
  // des exercices se lit dans l'index du contenu.
  const exerciseIds = useMemo(
    () => (session ? exerciseIdsFor(lessonCode, session.level) : []),
    [lessonCode, session],
  );

  // Ouvre la séance (idempotent) puis charge le premier exercice.
  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    fetchPracticeSession(token, sessionId)
      .then((data) => {
        if (cancelled) return;
        // Une séance déjà close se relit : on renvoie vers son bilan plutôt
        // que de faire rejouer des exercices déjà comptés.
        if (data.session.status === 'completed') {
          navigate(`/espace/pratique/${lessonCode}/bilan/${sessionId}`, { replace: true });

          return;
        }
        setSession(data.session);
      })
      .catch((e) => !cancelled && setError(e.message));

    return () => { cancelled = true; };
  }, [token, lessonCode, sessionId, navigate]);

  // Charge l'exercice courant dès que la séance et l'index sont connus.
  useEffect(() => {
    if (!session || exerciseIds.length === 0) return undefined;
    let cancelled = false;
    const id = exerciseIds[index];
    if (!id) return undefined;

    loadExercise(lessonCode, session.level, id).then((data) => {
      if (cancelled) return;
      setExercise(data);
      setQuestionIndex(0);
      setAnswer(null);
      setEvaluation(null);
      setHints([]);
    });

    return () => { cancelled = true; };
  }, [session, exerciseIds, index, lessonCode]);

  const question = exercise?.questions?.[questionIndex] ?? null;

  // Ouvre la question côté serveur : c'est cette tentative qui portera les
  // indices, demandés avant la réponse.
  useEffect(() => {
    if (!token || !session || !exercise || !question) return undefined;
    let cancelled = false;
    const uuid = crypto.randomUUID();

    openQuestion(token, sessionId, exercise.id, question.id, uuid)
      .then((data) => {
        if (cancelled) return;
        setAttemptUuid(uuid);
        setHints([]);
        setHintsRemaining(question.hints?.length ?? 0);
        setEvaluation(data.attempt?.answered ? { outcome: 'correct' } : null);
      })
      .catch((e) => !cancelled && setError(e.message));

    return () => { cancelled = true; };
  }, [token, session, sessionId, exercise, question]);

  const askHint = useCallback(async () => {
    if (!attemptUuid) return;
    setBusy(true);
    try {
      const { hint } = await requestHint(token, attemptUuid);
      setHints((h) => [...h, hint]);
      setHintsRemaining(hint.remaining);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [token, attemptUuid]);

  const validate = useCallback(async () => {
    if (!question || !attemptUuid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = evaluateAnswer(answer, question);
      setEvaluation(result);
      if (result.isCorrect) setCorrectCount((n) => n + 1);

      await submitAnswer(token, sessionId, {
        attemptUuid,
        outcome: result.outcome,
        answer: answer ?? null,
        normalizedAnswer: result.normalized || null,
        misconceptionId: result.misconceptionId,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [question, attemptUuid, answer, token, sessionId, busy]);

  const next = useCallback(async () => {
    const lastQuestion = questionIndex >= (exercise?.questions?.length ?? 1) - 1;

    if (!lastQuestion) {
      setQuestionIndex((i) => i + 1);
      setAnswer(null);
      setEvaluation(null);
      setHints([]);

      return;
    }

    setBusy(true);
    try {
      await completeExercise(token, sessionId, exercise.id);
      if (index >= exerciseIds.length - 1) {
        await completeSession(token, sessionId);
        navigate(`/espace/pratique/${lessonCode}/bilan/${sessionId}`);
      } else {
        setIndex((i) => i + 1);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [questionIndex, exercise, token, sessionId, index, exerciseIds.length, navigate, lessonCode]);

  const saveNote = useCallback(
    (note) => createNote(token, {
      ...note,
      lessonCode,
      exerciseId: exercise?.id,
      questionId: question?.id,
      learningPointCode: question?.learningPoints?.find((lp) => lp.role === 'primary')?.code,
    }),
    [token, lessonCode, exercise, question],
  );

  if (error) {
    return (
      <div className="sa-surface-plain sa-page py-8 sm:py-10 space-y-6">
        <p className="text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-xl p-4">{error}</p>
        <Link to={`/espace/pratique/${lessonCode}`} className="text-sm font-bold text-slate-600 hover:text-slate-900">
          ← Retour à la pratique
        </Link>
      </div>
    );
  }

  if (!exercise || !question) {
    return <div className="sa-surface-plain sa-page py-8 sm:py-10 space-y-6"><div className="h-64 rounded-2xl bg-slate-100 animate-pulse" /></div>;
  }

  const answered = evaluation !== null;
  const totalQuestions = exercise.questions.length;

  return (
    <div className="sa-surface-plain sa-page py-8 sm:py-10 space-y-6">
      {/* La sortie de séance. Sans elle, l'élève engagé dans un niveau n'a
          aucun chemin de retour : ni bandeau, ni fil d'Ariane sur cette page.
          Le travail déjà validé est enregistré côté serveur à chaque réponse,
          donc quitter ne perd rien — et la séance reste ouverte, le Hub
          propose de la « Reprendre ». */}
      <nav className="flex items-center" aria-label="Fil d'Ariane">
        <Link
          to={`/espace/pratique/${lessonCode}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-indigo-600 whitespace-nowrap"
        >
          <ArrowLeft className="w-3 h-3" aria-hidden="true" /> Retour aux niveaux
        </Link>
      </nav>

      <SessionProgress index={index} total={exerciseIds.length} correctCount={correctCount} />

      <header className="space-y-1">
        <p className="text-xs font-mono font-bold text-indigo-600 uppercase">
          Niveau {session.level} · {exercise.metadata.title}
        </p>
      </header>

      <section className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 space-y-5">
        <ExerciseStatement
          content={exercise.statement?.content}
          visual={exercise.statement?.visual}
          support={exercise.statement?.support}
        />

        <hr className="border-slate-100" />

        <div className="space-y-4">
          {totalQuestions > 1 && (
            <p className="text-xs font-mono font-bold text-slate-500">
              Question {questionIndex + 1} / {totalQuestions}
            </p>
          )}

          <p className="text-[15px] sm:text-base text-slate-900 font-medium">
            <RichText>{question.statement}</RichText>
          </p>

          {question.visual && <ExerciseStatement visual={question.visual} support={question.support} />}

          <QuestionRenderer question={question} value={answer} onChange={setAnswer} disabled={answered} />

          {!answered && (
            <ValidateButton onClick={validate} disabled={answer == null || busy} tone="indigo">
              Vérifier ma réponse
            </ValidateButton>
          )}

          <HintPanel
            hints={hints}
            remaining={hintsRemaining}
            onRequest={askHint}
            busy={busy}
            disabled={answered}
          />

          {answered && (
            <div className="space-y-4">
              <FeedbackPanel
                evaluation={evaluation}
                message={feedbackFor(question, evaluation, MISCONCEPTIONS)}
              />

              <NotebookButton onSave={saveNote} />

              <div className="flex gap-3 flex-wrap">
                {/* Réessayer est PROPOSÉ, jamais imposé : une réponse fausse
                    ne verrouille pas la suite. */}
                {!evaluation.isCorrect && (
                  <button
                    type="button"
                    onClick={() => { setEvaluation(null); setAnswer(null); }}
                    className="px-5 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-bold min-h-[48px]"
                  >
                    Réessayer
                  </button>
                )}
                <button
                  type="button"
                  onClick={next}
                  disabled={busy}
                  className="flex-1 px-5 py-3 rounded-xl bg-slate-900 text-white font-bold min-h-[48px] disabled:opacity-60"
                >
                  {questionIndex < totalQuestions - 1
                    ? 'Question suivante'
                    : index < exerciseIds.length - 1 ? 'Exercice suivant' : 'Terminer la séance'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
