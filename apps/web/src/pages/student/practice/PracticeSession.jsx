import { useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { isolateMathRuns } from '../../../utils/bidi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowBack, ArrowForward } from '../../../components/common/DirectionalIcons';
import { BarChart3, Check, CheckCircle2, Clock, GraduationCap, Lightbulb, RotateCcw } from 'lucide-react';

import * as practice from '@smarter-academy/core/practice/index.js';
import { AuthContext } from '../../../context/AuthContext';
import {
  fetchPracticeSession, fetchPracticeOverview, openQuestion, requestHint, submitAnswer,
  completeExercise, completeSession, createNote, updateNote, fetchNextExercise, fetchSessionAnswers, fetchLessonMedals,
  uploadAnswerImage, deleteAnswerImage, fetchAnswerImage,
} from '../../../services/practiceService';
import { exerciseIdsFor, loadExercise } from '../../../features/practice/practiceContent';
import { decideNextExercise, selectionHintReason } from '../../../features/practice/nextExercise';
import ExerciseStatement from '../../../features/practice/ExerciseStatement';
import QuestionRenderer from '../../../features/practice/QuestionRenderer';
import HintPanel from '../../../features/practice/HintPanel';
import FeedbackPanel from '../../../features/practice/FeedbackPanel';
import SessionProgress from '../../../features/practice/SessionProgress';
import NotebookButton from '../../../features/practice/NotebookButton';
import ReportButton from '../../../features/reports/ReportButton';
import RichText from '../../../features/practice/RichText';
import QuestionHistory from '../../../features/practice/QuestionHistory';
import QuestionArrival from '../../../features/practice/QuestionArrival';
import QuestionContextPanel from '../../../features/practice/QuestionContextPanel';
import LearningPointProgress from '../../../features/practice/LearningPointProgress';
import ExamSheet from '../../../features/practice/exam/ExamSheet';
import ExamNavigator from '../../../features/practice/exam/ExamNavigator';
import ExamPanelButton from '../../../features/practice/exam/ExamPanelButton';
import Modal from '../../../components/admin/ui/Modal';
import SolutionPanel from '../../../features/practice/exam/SolutionPanel';
import AnswerImagePicker from '../../../features/practice/exam/images/AnswerImagePicker';
import AnswerImageGallery from '../../../features/practice/exam/images/AnswerImageGallery';
import ReviewStatus from '../../../features/practice/exam/images/ReviewStatus';
import { canSendWithImages, pendingKind } from '../../../features/practice/exam/images/answerImages';
import { SelfMarkChoice } from '../../../features/practice/inputs/SelfCheckInput';
import { answerChars, answerSize, examPaper, isExamExercise, solutionReady, stepSeconds } from '../../../features/practice/exam/examSheet';
import EarlierYearReview from '../../../features/learning/EarlierYearReview';
import StepTimer from '../../../features/practice/exam/StepTimer';
import Medal from '../../../features/practice/medals/Medal';
import MedalTray from '../../../features/practice/medals/MedalTray';
import MedalCelebration from '../../../features/practice/medals/MedalCelebration';
import { playMedal } from '../../../features/practice/medals/medalSound';
import { isCoachLesson } from '../../../features/practice/exam/examCoach';
import { useExamCoach, ExamHall, CoachStrip, CoachAfter } from '../../../features/practice/exam/ExamCoach';
import { medalFor, medalReason, tally } from '../../../features/practice/exam/medals';
import { useEffectsPreference } from '../../../lessons/common/hooks/useEffectsPreference';
import WorkArea, { MIN_WORK_CHARS, workLength, ZoneNumber } from '../../../features/practice/exam/WorkArea';
import SideColumnToggle from '../../../features/practice/SideColumnToggle';
import { useSideColumn, practiceGridClass } from '../../../features/practice/useSideColumn';
import { currentLearningPoint } from '../../../features/practice/learningPointProgress';
import { historyEntry, recordQuestion, exerciseScore, outcomeTone } from '../../../features/practice/questionHistory';
import { ClassroomPresentation, ClassroomEntryButton, ClassroomFrame, ClassroomHidden } from '../../../lessons/common/classroom';
import MISCONCEPTIONS from '../../../../../../content/practice/misconceptions.json';

const { evaluateAnswer, feedbackFor, isSuccessOutcome, isInertOutcome } = practice;

// L'action principale de la carte — vérifier, puis passer à la suite. Même
// forme pour les deux : l'élève a UN bouton plein à chercher à chaque étape.
// La taille de texte est EXPLICITE : dans le cadre de mode classe, un bouton
// qui l'hérite prend `1rem × échelle` et devient minuscule.
// (Pas `ValidateButton` de LessonUI : petit, en chasse fixe, sans `type` —
// il sert les 132 leçons et n'est pas modifié ici.)
const PRIMARY_BUTTON = 'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-nav-accent px-6 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#3350c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none motion-reduce:transition-none';

// Secondaire : contour, jamais plein — « Réessaie », « Question suivante »
// tant qu'aucune réponse n'est vérifiée.
const SECONDARY_BUTTON = 'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-base font-bold text-slate-700 transition-colors hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 motion-reduce:transition-none';

// Tertiaire : du texte avec une icône, sans fond — « Indice », « Question précédente ».
// Feuille d'examen : un petit bouton « Vérifier », discret, à côté du champ —
// pas le gros bouton plein d'une plateforme (propriétaire, 2026-10-06).
const EXAM_CHECK_BUTTON = 'inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-md border-[1.5px] border-[#1f5c4c] bg-white px-3.5 py-1.5 text-sm font-bold text-[#1f5c4c] transition-colors hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 motion-reduce:transition-none';

// Feuille d'examen : la navigation EN HAUT, petite et discrète (propriétaire,
// 2026-10-06) — à la place de la barre collée en bas.
const EXAM_NAV_BUTTON = 'inline-flex h-9 items-center gap-1 rounded-lg bg-white px-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-40';
const EXAM_NAV_NEXT = 'inline-flex h-9 items-center gap-1 rounded-lg bg-[#1f5c4c] px-3 text-sm font-bold text-white transition-colors hover:bg-[#174a3d] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1';

const TERTIARY_BUTTON = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-60 motion-reduce:transition-none';

const reducedMotion = () => typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Le lecteur d'exercices.
 *
 * La justesse est JUGÉE PAR LE SERVEUR (Mastery V2). @smarter-academy/core
 * évalue encore la réponse ici, mais seulement pour un retour instantané :
 * ce verdict local est une PRÉDICTION, envoyée au serveur pour comparaison
 * (`outcome`), puis REMPLACÉE par `evaluation` de sa réponse — c'est elle
 * qui s'affiche, et elle qui compte les bonnes réponses. Quand les deux
 * divergent, le serveur gagne, le retour se réaffiche et une petite note le
 * dit (« Ta réponse a été vérifiée sur le serveur »).
 *
 * Une réponse fausse ne bloque jamais : « Continuer » est toujours là. On
 * peut réessayer, mais on n'y est jamais obligé — c'est l'invariant de
 * progression non bloquante que tout le dépôt applique.
 */
export default function PracticeSession() {
  const { t } = useTranslation('student');
  // La colonne du point d'apprentissage se replie : l'exercice prend toute la largeur.
  const [sideHidden, toggleSide] = useSideColumn();
  const { lessonCode, sessionId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [exercise, setExercise] = useState(null);
  // L'exercice courant, par son IDENTIFIANT (plus un index) : depuis la
  // phase 9, le serveur choisit l'ordre (GET /practice/sessions/{id}/next) ;
  // l'ordre du contenu n'est plus qu'un repli (features/practice/nextExercise.js).
  const [currentId, setCurrentId] = useState(null);
  // Les exercices terminés dans CETTE visite : ils comptent la position
  // (« Exercice n sur total ») et excluent le repli par ordre du contenu.
  const [completedIds, setCompletedIds] = useState([]);
  // La décision qui a ouvert l'exercice courant — sa raison nourrit la
  // petite phrase « Nous avons choisi cet exercice pour toi… ».
  const [selection, setSelection] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  // « Étapes du calcul » de l'étape courante (feuille d'examen) : envoyé AVEC la
  // réponse (`answer.work`), donc enregistré en base et verrouillé avec elle.
  const [work, setWork] = useState('');
  // PHOTOS DE COPIE de l'étape courante (prototype de la feuille d’examen, 2026-10-06) : envoyées
  // une à une avant la réponse, puis verrouillées avec elle. `review` : la
  // correction de l'enseignant (« Correction du professeur ») ; `evaluatedBy` : qui a jugé.
  const [images, setImages] = useState([]);
  const [review, setReview] = useState(null);
  const [evaluatedBy, setEvaluatedBy] = useState(null);
  // Feuille d'examen : une saisie ILLISIBLE n'est pas envoyée (elle verrouillerait
  // l'étape) — un mot sous le champ, et l'élève corrige.
  const [unreadable, setUnreadable] = useState(false);
  // Feuille d'examen : « savoir-faire » et la navigation dans une FENÊTRE CENTRALE.
  const [panelOpen, setPanelOpen] = useState(false);
  // Le chrono de l'étape : l'instant (ms) où elle s'est ouverte — gardé en
  // localStorage par tentative, pour qu'un rechargement ne le remette pas à zéro.
  const [stepStartedAt, setStepStartedAt] = useState(null);
  // La question ouverte côté serveur (« exercice:question ») : « Commencer » attend
  // qu'elle le soit — sinon la réponse tardive du serveur effaçait le départ.
  const [openedFor, setOpenedFor] = useState(null);
  // LES MÉDAILLES (prototype de la feuille d’examen, 2026-10-06) : la célébration en cours, et la
  // La vitrine de la leçon (lue en base, puis augmentée à chaque médaille gagnée).
  const [award, setAward] = useState(null);
  const [lessonMedals, setLessonMedals] = useState(null);
  const { enabled: soundOn } = useEffectsPreference();
  const clearAward = useCallback(() => setAward(null), []);
  useEffect(() => {
    if (!token) return;
    fetchLessonMedals(token, lessonCode).then(setLessonMedals).catch(() => {});
  }, [token, lessonCode]);
  const [attemptUuid, setAttemptUuid] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  // La question dont le corrigé type a été OUVERT : plus de « Réessaie » pour elle (propriétaire, 2026-10-08).
  const [solutionSeenFor, setSolutionSeenFor] = useState(null);
  // Vrai quand le verdict du serveur a contredit la prédiction locale : la
  // note « Ta réponse a été vérifiée sur le serveur » s'affiche sous le retour.
  const [serverOverrode, setServerOverrode] = useState(false);
  const [hints, setHints] = useState([]);
  const [hintsRemaining, setHintsRemaining] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  // L'HISTORIQUE des questions déjà quittées dans l'exercice courant — des
  // photographies de l'état ci-dessus (questionHistory.js), pas un second
  // état d'exercice : le serveur reste la vérité des tentatives. Remis à
  // zéro à chaque nouvel exercice.
  const [history, setHistory] = useState([]);
  // « Exercice précédent » (propriétaire, 2026-10-06) : les exercices terminés de
  // la séance, RELUS EN BASE (GET /practice/sessions/{id}/answers) — ce que
  // l'élève a réellement enregistré, encore après un rechargement. Les revoir
  // est une LECTURE : rejouer un exercice compterait deux fois pour la maîtrise.
  // `reviewIndex` = celui qu'on relit, null = l'exercice courant.
  const [reviews, setReviews] = useState([]);
  const [reviewIndex, setReviewIndex] = useState(null);
  // Validations faites sur la question courante (1 = du premier coup) :
  // l'historique dit « Corrigée après un nouvel essai ».
  const [tries, setTries] = useState(0);
  // Posé par « Question suivante » / « Exercice suivant » : QuestionArrival amène
  // le regard et le focus sur la nouvelle question, une fois affichée.
  const [arrival, setArrival] = useState(null);
  const clearArrival = useCallback(() => setArrival(null), []);
  // Les points d'apprentissage de la leçon, tels que l'aperçu de pratique les
  // renvoie : état de maîtrise (Mastery V2) + compteurs d'activité
  // (`practice`). Relu après chaque réponse enregistrée et chaque exercice
  // terminé — les étoiles et les barres avancent sous les yeux de l'élève.
  const [learningPoints, setLearningPoints] = useState([]);
  // Le titre de la leçon (barre « Leçon : … » de la feuille d'examen).
  const [lessonTitle, setLessonTitle] = useState('');
  const refreshLearningPoints = useCallback(() => {
    if (!token) return;
    fetchPracticeOverview(token, lessonCode)
      .then((data) => { setLearningPoints(data?.learningPoints ?? []); setLessonTitle(data?.lesson?.title ?? ''); })
      .catch(() => {}); // Un module d'information : son échec ne bloque jamais la séance.
  }, [token, lessonCode]);
  useEffect(() => { refreshLearningPoints(); }, [refreshLearningPoints]);

  // Les photos sont privées : chargées avec le jeton (AnswerImageGallery).
  const imageLoader = useCallback((id, annotated) => fetchAnswerImage(token, id, annotated), [token]);

  const workspaceRef = useRef(null);
  const cardRef = useRef(null);
  const questionHeadingRef = useRef(null);
  const feedbackRef = useRef(null);

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

  // Le PREMIER exercice : demandé au sélecteur, avec le même repli que les
  // suivants (échec ou `disabled` → ordre du contenu). Un niveau déjà épuisé
  // pour cette séance (reprise) se clôt comme après le dernier exercice.
  useEffect(() => {
    if (!token || !session || exerciseIds.length === 0 || currentId !== null) return undefined;
    let cancelled = false;

    fetchNextExercise(token, sessionId)
      .catch(() => null)
      .then(async (response) => {
        if (cancelled) return;
        const decision = decideNextExercise({ response, fallbackIds: exerciseIds, completedIds: [] });
        if (decision.exerciseId) {
          setSelection(decision);
          setCurrentId(decision.exerciseId);
          return;
        }
        try {
          await completeSession(token, sessionId);
          if (!cancelled) navigate(`/espace/pratique/${lessonCode}/bilan/${sessionId}`, { replace: true });
        } catch (e) {
          if (!cancelled) setError(e.message);
        }
      });

    return () => { cancelled = true; };
  }, [token, session, sessionId, exerciseIds, currentId, lessonCode, navigate]);

  // Charge l'exercice courant dès que la séance et son identifiant sont connus.
  useEffect(() => {
    if (!session || !currentId) return undefined;
    let cancelled = false;

    loadExercise(lessonCode, session.level, currentId).then((data) => {
      if (cancelled) return;
      setExercise(data);
      setQuestionIndex(0);
      setAnswer(null);
      setWork('');
      setImages([]);
      setReview(null);
      setEvaluatedBy(null);
      setUnreadable(false);
      setEvaluation(null);
      setHints([]);
      setHistory([]);
      setTries(0);
    });

    return () => { cancelled = true; };
  }, [session, currentId, lessonCode]);

  const question = exercise?.questions?.[questionIndex] ?? null;
  // Une clé par question d'UN exercice (l'id de question « q1 » se répète d'un exercice à l'autre).
  const questionKey = `${exercise?.id ?? ''}:${question?.id ?? questionIndex}`;
  // « Le coach du brevet » (pilot lessons, features/practice/exam/ExamCoach.jsx): the hall, the two modes, the paper notebook.
  // Declared here, before any early return (rules of hooks).
  const coach = useExamCoach(lessonCode, Boolean(exercise) && isExamExercise(exercise));

  // Le titre de l'exercice, AUGMENTÉ du numéro de question :
  //   « Exercice 2 — Diviser par 6 »  →  « Exercice 2 — Question 1 : diviser par 6 »
  //   « 420 livres sur des étagères »      →  « 420 livres sur des étagères — Question 1 »
  // Les titres du manuel ont la forme « Exercice n — <sujet> » : on glisse donc
  // le numéro après le tiret, devant le sujet. Sans tiret, il s'ajoute à la
  // fin.
  const exerciseHeading = (() => {
    // Le numéro s'affiche MÊME pour un exercice à une seule question : c'est
    // un repère de position, pas un compteur — l'élève doit lire la même
    // forme partout, sans avoir à se demander pourquoi elle disparaît ici.
    // Un titre peut contenir une égalité ou une fraction (« 120 = 6 × 20 », « 28/42 ») : isolateMathRuns la garde d'un bloc.
    const title = isolateMathRuns(exercise?.metadata?.title ?? '');
    if (!title) return title;
    const label = t('practice.questionNumber', { n: questionIndex + 1 });
    const dash = title.indexOf('—');
    if (dash === -1) return `${title} — ${label}`;
    return `${title.slice(0, dash + 1)} ${label}\u00A0: ${title.slice(dash + 1).trim()}`;
  })();

  // Ouvre la question côté serveur : c'est cette tentative qui portera les
  // indices, demandés avant la réponse.
  useEffect(() => {
    if (!token || !session || !exercise || !question) return undefined;
    let cancelled = false;
    const uuid = crypto.randomUUID();

    openQuestion(token, sessionId, exercise.id, question.id, uuid)
      .then((data) => {
        if (cancelled) return;
        // Feuille d'examen : une étape déjà répondue revient avec SA tentative
        // (un autre identifiant que celui proposé) et sa réponse enregistrée.
        const used = data.attempt?.attemptUuid ?? uuid;
        setAttemptUuid(used);
        // Le chrono ne part qu'à « Commencer » (propriétaire, 2026-10-06) ; un départ
        // déjà donné (rechargement) est relu, pour ne pas offrir un temps neuf.
        let started = null;
        try {
          const stored = Number(window.localStorage.getItem(`sa-step-start:${used}`));
          if (stored > 0) started = stored;
        } catch { /* confort local */ }
        setStepStartedAt(started);
        setOpenedFor(`${exercise.id}:${question.id}`);
        setHints([]);
        setHintsRemaining(question.hints?.length ?? 0);
        setServerOverrode(false);
        setTries(0);
        // Les photos déjà jointes (même avant la réponse : un rechargement les retrouve).
        setImages(data.attempt?.images ?? []);
        setReview(data.attempt?.review ?? null);
        setEvaluatedBy(data.attempt?.evaluatedBy ?? null);
        // Une question déjà répondue (tentative rouverte) se relit avec le
        // verdict du SERVEUR quand il le renvoie.
        if (data.attempt?.answered) {
          const outcome = data.attempt.outcome ?? 'correct';
          if (data.attempt.answer != null) {
            setAnswer(data.attempt.answer);
            setWork(typeof data.attempt.answer.work === 'string' ? data.attempt.answer.work : '');
          }
          setEvaluation({ outcome, isCorrect: isSuccessOutcome(outcome), misconceptionId: null, feedbackKey: null, normalized: data.attempt.normalized ?? '' });
        } else {
          setEvaluation(null);
        }
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
    // Une photo suffit (le propriétaire : « saisie, image, ou les deux ») : un
    // champ vide n'est « illisible » que s'il n'y a pas de photo.
    if (isExamExercise(exercise) && images.length === 0 && evaluateAnswer(answer, question).outcome === 'syntax_error') {
      setUnreadable(true);
      return;
    }
    setUnreadable(false);
    setBusy(true);
    setError(null);
    try {
      // La réponse ENVOYÉE : la valeur, plus « Étapes du calcul » quand l'étape en a.
      const base = answer ?? (images.length > 0 ? {} : null);
      let sent = question.work && base && work.trim() ? { ...base, work } : base;
      // Le temps mis sur l'étape part avec la réponse (enregistré en base).
      if (isExamExercise(exercise) && sent && stepStartedAt) sent = { ...sent, seconds: Math.round((Date.now() - stepStartedAt) / 1000) };
      if (sent !== answer) setAnswer(sent);
      // 1. Prédiction locale — affichée tout de suite, jamais comptée. SAUF
      //    sur une étape d'examen avec photo ou démonstration : le client ne
      //    sait pas si elle part chez l'enseignant (« Correction du professeur ») ou en
      //    auto-évaluation — afficher sa prédiction montrerait le corrigé type
      //    avant que le serveur n'ait dit qui juge.
      const predicted = evaluateAnswer(sent, question);
      const waitForServer = isExamExercise(exercise) && (question.answerType === 'selfCheck' || images.length > 0);
      if (!waitForServer) setEvaluation(predicted);
      setServerOverrode(false);
      setTries((n) => n + 1);
      // Le bouton qui avait le focus disparaît : le focus va au retour
      // (focalisable, `role="status"`), d'où Tab mène à « la suite ».
      requestAnimationFrame(() => {
        const box = feedbackRef.current;
        if (!box) return;
        box.focus({ preventScroll: true });
        box.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
      });

      // 2. Le serveur juge. `outcome` n'est que la prédiction du client,
      //    envoyée pour la comparaison en ombre ; la réponse porte
      //    `evaluation`, le verdict qui s'affiche et qui compte.
      const data = await submitAnswer(token, sessionId, {
        attemptUuid,
        answer: sent ?? null,
        outcome: predicted.outcome,
      });
      const verdict = data?.evaluation ?? null;
      const shown = verdict
        ? {
          outcome: verdict.outcome,
          isCorrect: typeof verdict.isCorrect === 'boolean' ? verdict.isCorrect : isSuccessOutcome(verdict.outcome),
          misconceptionId: verdict.misconceptionId ?? null,
          normalized: verdict.normalized ?? '',
          feedbackKey: verdict.feedbackKey ?? predicted.feedbackKey,
        }
        : predicted;
      setEvaluation(shown);
      setEvaluatedBy(data?.attempt?.evaluatedBy ?? null);
      setReview(data?.review ?? null);
      // Une réponse juste sur une feuille d'examen gagne une médaille : or,
      // argent ou bronze selon les indices et le temps (medals.js).
      if (isExamExercise(exercise)) {
        const facts = { outcome: shown.outcome, answerType: question.answerType, hintsUsed: hints.length, seconds: sent?.seconds ?? null, limit: stepSeconds(question, exercise), evaluatedBy: data?.attempt?.evaluatedBy ?? null };
        const medal = data?.recorded === false ? null : medalFor(facts);
        if (medal) {
          setAward({ id: Date.now(), medal, reason: medalReason(facts) });
          playMedal(medal, soundOn && !isCoachLesson(lessonCode)); // « Le coach du brevet »: an exam is silent
          setLessonMedals((prev) => {
            const total = { ...(prev?.total ?? { gold: 0, silver: 0, bronze: 0, points: 0 }) };
            total[medal] += 1;
            total.points += { gold: 3, silver: 2, bronze: 1 }[medal];
            return { ...(prev ?? { levels: {} }), total };
          });
        }
      }
      if (verdict && !waitForServer && verdict.outcome !== predicted.outcome) setServerOverrode(true);
      // « Réessaie » : le serveur juge la nouvelle réponse sans
      // l'enregistrer (`recorded: false`) — rien n'a bougé côté compteurs.
      if (data?.recorded !== false) refreshLearningPoints();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [question, exercise, attemptUuid, answer, work, images, stepStartedAt, hints, soundOn, token, sessionId, busy, refreshLearningPoints]);

  // « Montrer que » (selfCheck), second temps : la démonstration est déjà
  // enregistrée et verrouillée ; le corrigé type sous les yeux, l'élève se
  // note. Même tentative, MÊME texte — le serveur refuse tout autre texte.
  // « Commencer » : l'élève lance le chrono de l'étape, ce qui révèle l'énoncé.
  const startStep = useCallback(() => {
    const now = Date.now();
    try { if (attemptUuid) window.localStorage.setItem(`sa-step-start:${attemptUuid}`, String(now)); } catch { /* confort local */ }
    setStepStartedAt(now);
  }, [attemptUuid]);

  const selfMark = useCallback(async (mark) => {
    // Un « Montrer que » (texte), ou une étape répondue en PHOTO seulement.
    if (!question || !attemptUuid || busy || (!answer?.text && images.length === 0)) return;
    const marked = { ...(answer ?? {}), selfMark: mark };
    setBusy(true);
    setError(null);
    try {
      const predicted = evaluateAnswer(marked, { ...question, answerType: 'selfCheck' });
      const data = await submitAnswer(token, sessionId, { attemptUuid, answer: marked, outcome: predicted.outcome });
      const verdict = data?.evaluation ?? null;
      setAnswer(marked);
      setEvaluatedBy(data?.attempt?.evaluatedBy ?? 'self');
      setEvaluation(verdict
        ? {
          outcome: verdict.outcome,
          isCorrect: typeof verdict.isCorrect === 'boolean' ? verdict.isCorrect : isSuccessOutcome(verdict.outcome),
          misconceptionId: null,
          normalized: verdict.normalized ?? '',
          feedbackKey: verdict.feedbackKey ?? predicted.feedbackKey,
        }
        : predicted);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [question, attemptUuid, busy, answer, images, token, sessionId]);

  const loadReviews = useCallback(async () => {
    if (!token || !session) return;
    try {
      const data = await fetchSessionAnswers(token, sessionId);
      const done = (data?.exercises ?? []).filter((e) => e.status === 'completed');
      const built = await Promise.all(done.map(async (e) => {
        const ex = await loadExercise(lessonCode, session.level, e.exerciseId).catch(() => null);
        if (!ex) return null;
        const entries = (e.questions ?? []).map((a) => {
          const index = ex.questions.findIndex((q) => q.id === a.questionId);
          if (index < 0) return null;
          return historyEntry({
            question: ex.questions[index],
            index,
            answer: a.answer,
            evaluation: { outcome: a.outcome, normalized: a.normalized ?? '', isCorrect: isSuccessOutcome(a.outcome), misconceptionId: null },
            hintsUsed: a.hintsUsed ?? 0,
            images: a.images ?? [],
            review: a.review ?? null,
            evaluatedBy: a.evaluatedBy ?? null,
          });
        }).filter(Boolean).sort((x, y) => x.number - y.number);
        return { exercise: ex, history: entries };
      }));
      setReviews(built.filter(Boolean));
    } catch {
      // Lecture facultative : sans elle, « Exercice précédent » n'apparaît pas.
    }
  }, [token, session, sessionId, lessonCode]);
  useEffect(() => { loadReviews(); }, [loadReviews]);

  const next = useCallback(async () => {
    const lastQuestion = questionIndex >= (exercise?.questions?.length ?? 1) - 1;
    const from = `${exercise?.id}:${question?.id}`;

    if (!lastQuestion) {
      // La question quittée entre dans l'historique, telle que l'élève la
      // laisse : sa réponse, le verdict affiché, le retour, les indices.
      setHistory((h) => recordQuestion(h, historyEntry({
        question,
        index: questionIndex,
        answer,
        evaluation,
        feedbackMessage: evaluation ? feedbackFor(question, evaluation, MISCONCEPTIONS, { syntaxError: t('practice.syntaxErrorFeedback') }) : '',
        hintsUsed: hints.length,
        tries,
        images,
        review,
        evaluatedBy,
      })));
      setArrival({ type: 'question', from });
      setQuestionIndex((i) => i + 1);
      setAnswer(null);
      setWork('');
      setImages([]);
      setReview(null);
      setEvaluatedBy(null);
      setUnreadable(false);
      setEvaluation(null);
      setServerOverrode(false);
      setHints([]);

      return;
    }


    setBusy(true);
    try {
      await completeExercise(token, sessionId, exercise.id);
      refreshLearningPoints();
      loadReviews();
      const completed = completedIds.includes(exercise.id) ? completedIds : [...completedIds, exercise.id];
      setCompletedIds(completed);
      // Le sélecteur choisit la suite ; son échec n'est jamais une erreur
      // affichée : on reprend l'ordre du contenu (nextExercise.js).
      const response = await fetchNextExercise(token, sessionId).catch(() => null);
      const decision = decideNextExercise({ response, fallbackIds: exerciseIds, completedIds: completed });
      if (!decision.exerciseId) {
        await completeSession(token, sessionId);
        navigate(`/espace/pratique/${lessonCode}/bilan/${sessionId}`);
      } else {
        setArrival({ type: 'exercise', from });
        setSelection(decision);
        setCurrentId(decision.exerciseId);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [questionIndex, exercise, question, answer, evaluation, hints, tries, images, review, evaluatedBy, token, sessionId, completedIds, exerciseIds, navigate, lessonCode, refreshLearningPoints, loadReviews]);

  // « Réessaie » GARDE la réponse : l'élève corrige ce qu'il a écrit
  // (une faute de frappe, un signe) au lieu de tout retaper. Le focus revient
  // au champ — ou au choix sélectionné d'un QCM.
  const retry = useCallback(() => {
    setEvaluation(null);
    setServerOverrode(false);
    requestAnimationFrame(() => {
      cardRef.current
        ?.querySelector('input:not([disabled]), textarea:not([disabled]), button[aria-pressed="true"]:not([disabled])')
        ?.focus();
    });
  }, []);

  // « Question précédente » : ramène la carte de la question précédente sous les
  // yeux (et le focus dessus). Relire, pas rejouer.

  const openReview = useCallback((i) => {
    setReviewIndex(i);
    requestAnimationFrame(() => workspaceRef.current?.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' }));
  }, []);

  const showPrevious = useCallback(() => {
    const card = workspaceRef.current?.querySelector('[data-previous-question]');
    if (!card) return;
    card.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
    card.focus({ preventScroll: true });
  }, []);

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
  const patchNote = useCallback((id, patch) => updateNote(token, id, patch), [token]);

  // Ce que le cahier sait de la question au moment où il s'ouvre : l'énoncé,
  // la question, et — seulement si l'élève a validé — sa réponse et le
  // verdict. Le cahier n'invente pas d'erreur : sans validation, pas de bloc
  // « Mon erreur ».
  const feedbackMessage = evaluation && question ? feedbackFor(question, evaluation, MISCONCEPTIONS, { syntaxError: t('practice.syntaxErrorFeedback') }) : '';
  const notebookContext = {
    lessonCode, exercise, question, answer, evaluation, feedbackMessage,
  };

  if (error) {
    return (
      <div className="sa-surface-plain sa-page sa-page--flush py-6 sm:py-8 space-y-6">
        <p className="text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-xl p-4">{error}</p>
        <Link to={`/espace/pratique/${lessonCode}`} className="text-sm font-bold text-slate-600 hover:text-slate-900">
          ← {t('practice.backToPractice')}
        </Link>
      </div>
    );
  }

  if (!exercise || !question) {
    return <div className="sa-surface-plain sa-page sa-page--flush py-6 sm:py-8"><div className="h-64 rounded-2xl bg-slate-100 animate-pulse" /></div>;
  }

  const answered = evaluation !== null;
  const totalQuestions = exercise.questions.length;
  const isLastQuestion = questionIndex >= totalQuestions - 1;
  // La position dans le niveau = les exercices TERMINÉS, plus un index : le
  // sélecteur ne suit pas l'ordre du contenu. Le total reste celui du niveau.
  const position = Math.min(completedIds.length, Math.max(0, exerciseIds.length - 1));
  const selectedBecause = selectionHintReason(selection);
  const currentTone = answered ? outcomeTone(evaluation.outcome) : null;
  const levelName = t(`practice.levelNames.${session.level}`, { defaultValue: '' });
  const score = answered && isLastQuestion ? exerciseScore(history, evaluation) : null;
  // Les médailles de CET exercice (étapes faites + étape courante), pour le bilan.
  const exerciseMedals = (() => {
    if (!exercise?.metadata?.exam) return { gold: 0, silver: 0, bronze: 0, points: 0, count: 0, allGold: false };
    const facts = exercise.questions.map((q, i) => {
      const e = i === questionIndex
        ? (answered ? { outcome: evaluation.outcome, hintsUsed: hints.length, seconds: answer?.seconds ?? null, evaluatedBy } : null)
        : history.find((h) => h.questionId === q.id);
      return e ? { q, m: medalFor({ outcome: e.outcome, answerType: q.answerType, hintsUsed: e.hintsUsed ?? 0, seconds: e.seconds ?? null, limit: stepSeconds(q, exercise), evaluatedBy: e.evaluatedBy ?? null }) } : { q, m: null };
    });
    const t2 = tally(facts.map((f) => f.m));
    const eligible = facts.filter((f) => f.q.answerType !== 'selfCheck');
    return { ...t2, count: t2.gold + t2.silver + t2.bronze, allGold: eligible.length > 0 && eligible.every((f) => f.m === 'gold') };
  })();
  // Une réponse fausse garde l'aide ouverte : l'indice suivant sert à la
  // nouvelle tentative. Une réponse juste la referme.
  const hintsClosed = answered && evaluation.isCorrect;

  const questionTones = history.map((e) => e.tone);
  const isChoice = question.answerType === 'choice' || question.answerType === 'multiChoice';
  // Le titre seul, pour le h1 ; `exerciseHeading` (titre + « Question n »)
  // reste le titre de la présentation en classe, où le chrome est retiré.
  const exerciseTitle = isolateMathRuns(exercise.metadata?.title ?? '');

  const nextLabel = !isLastQuestion
    ? t('practice.nextQuestion')
    : completedIds.length < exerciseIds.length - 1 ? t('practice.nextExercise') : t('practice.finishSession');

  // Le point d'apprentissage de la QUESTION courante (un exercice peut en
  // mêler plusieurs), avec son état et ses compteurs.
  const point = currentLearningPoint(question, exercise, learningPoints);
  const minutes = exercise.metadata?.estimatedMinutes;
  const tags = exercise.metadata?.tags ?? [];
  // Avant la réponse, « Question suivante » est secondaire (contour, inactif) ;
  // après, il devient L'action — un seul bouton plein à la fois.
  const nextClass = answered ? `${PRIMARY_BUTTON} min-w-[10rem]` : SECONDARY_BUTTON;
  // FEUILLE D'EXAMEN (pratique sur le modèle de l’examen, 2026-10-06) : un exercice qui
  // porte `metadata.exam` se présente comme le sujet — en-tête « Exercice 1 (3 points) »,
  // ruban de la session, toutes les étapes visibles. Seule la PRÉSENTATION
  // change : l'état ci-dessus (une question à la fois, jugée par le serveur)
  // est le même.
  const isExam = isExamExercise(exercise);
  const isSelfCheck = question.answerType === 'selfCheck';
  const size = answerSize(question);
  // Feuille d'examen : l'action principale prend le vert sombre de la maquette.
  const examTone = (cls) => (isExam ? cls.replace('bg-nav-accent', 'bg-[#1f5c4c]').replace('hover:bg-[#3350c4]', 'hover:bg-[#174a3d]').replace('focus-visible:ring-nav-accent', 'focus-visible:ring-emerald-600') : cls);
  // Ce que l'étape attend : la note de l'élève (`self` — démonstration, ou
  // copie en photo seulement) ou l'ENSEIGNANT (`review`, « Correction du professeur » :
  // l'élève continue sans attendre ; ni verdict, ni corrigé, ni médaille).
  const pending = answered ? pendingKind(evaluation.normalized) : null;
  const selfPending = pending === 'self';
  const reviewPending = pending === 'review';
  // Une démonstration trop courte reste un brouillon (`{ draft }`) : rien à
  // envoyer — sauf une photo, qui suffit (feuille d'examen).
  const hasTyped = answer != null && !(isSelfCheck && !answer.text);
  const workOk = !(isExam && question.work === 'required' && workLength(work) < MIN_WORK_CHARS);
  const canSubmit = isExam
    ? canSendWithImages({ hasTypedAnswer: hasTyped, imageCount: images.length }) && (workOk || images.length > 0)
    : hasTyped && workOk;
  const addImage = async (blob) => {
    const data = await uploadAnswerImage(token, attemptUuid, blob);
    setImages((list) => [...list, data.image]);
  };
  const removeImage = async (id) => {
    await deleteAnswerImage(token, id);
    setImages((list) => list.filter((image) => image.id !== id));
  };

  // La zone de réponse de la question courante — la même dans la carte
  // classique et dans l'étape courante d'une feuille d'examen.
  const answerZone = (
    <>
    {/* La réponse. Un <form> : Entrée dans un champ valide, comme
        partout sur le web ; les choix et les crochets sont des
        `type="button"` et ne soumettent rien. */}
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!answered && canSubmit && !busy) validate();
      }}
      // Feuille d'examen : le champ à la mesure de la réponse (`answerSize`)
      // et « Vérifier » sur la même ligne — on écrit sur la copie.
      className={isExam ? (size === 'proof' ? 'flex flex-col items-start gap-2' : 'flex flex-wrap items-end gap-x-4 gap-y-2') : 'space-y-3'}
      data-answer-form
      data-answer-size={isExam ? size : undefined}
      style={isExam ? { '--answer-ch': answerChars(question) } : undefined}
    >
      {coach.on && <CoachStrip coach={coach} />}
      {/* « Étapes du calcul » au-dessus de la ligne de réponse, sur toute la largeur. */}
      {isExam && question.work && (
        <div className="w-full basis-full">
          <WorkArea key={question.id} question={question} value={work} onChange={setWork} disabled={answered} />
        </div>
      )}
      {/* La zone « 2 » : le résultat final, séparé du calcul (« 1 ») ci-dessus. */}
      {isExam && question.work && (
        <div className="w-full basis-full space-y-1 border-t-2 border-dashed border-slate-300 pt-3" data-result-zone-header>
          <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
            <ZoneNumber n={2} tone="green" /> {t('practice.exam.result.title')}
          </p>
          {!answered && <p className="text-xs text-slate-600">{t('practice.exam.result.hint')}</p>}
        </div>
      )}
      <div className={isExam ? `min-w-0 ${size === 'long' || size === 'proof' ? 'w-full' : ''} ${question.work ? 'rounded-lg border-2 border-[#1f5c4c]/60 bg-emerald-50/40 p-2' : ''}` : `flex flex-col gap-1.5 ${isChoice ? '' : 'sm:flex-row sm:items-center sm:gap-3'}`} data-result-zone={question.work ? '' : undefined}>
        {!isExam && <span className="shrink-0 text-sm font-bold text-slate-700" aria-hidden="true">{t('practice.yourAnswerLabel')}</span>}
        <div className="min-w-0 flex-1">
          <QuestionRenderer
          question={question}
          value={answer}
          onChange={(v) => { setAnswer(v); setUnreadable(false); }}
          disabled={answered}
          exam={isExam}
          {...(isSelfCheck ? {
            // En attente de l'enseignant : ni corrigé, ni auto-évaluation ; jugée
            // par l'enseignant : le corrigé, sans les boutons.
            onSelfMark: reviewPending || evaluatedBy === 'teacher' ? null : selfMark,
            mark: answer?.selfMark ?? null,
            busy,
            showSolution: !reviewPending,
          } : {})}
        />
        </div>
      </div>

      {/* Les PHOTOS de la copie : à joindre avant de répondre, verrouillées ensuite. */}
      {isExam && !answered && attemptUuid && (
        <AnswerImagePicker images={images} loader={imageLoader} onAdd={addImage} onRemove={removeImage} disabled={busy} />
      )}
      {isExam && answered && images.length > 0 && (
        <div className="w-full basis-full space-y-1" data-answer-images-locked>
          <p className="text-xs font-bold text-slate-600">{t('practice.exam.images.saved')}</p>
          <AnswerImageGallery images={images} loader={imageLoader} size="sm" />
        </div>
      )}

      {unreadable && !answered && (
        <p className="w-full basis-full text-sm font-semibold text-orange-700" role="alert" data-unreadable>{t('practice.exam.unreadable')}</p>
      )}
      {!answered && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={!canSubmit || busy}
            className={isExam ? EXAM_CHECK_BUTTON : `${PRIMARY_BUTTON} w-full sm:w-auto sm:min-w-[14rem]`}
            data-validate
          >
            <Check className="h-5 w-5" aria-hidden="true" />
            {isSelfCheck ? t('practice.exam.selfCheck.record') : t('practice.checkMyAnswer')}
          </button>
          {/* Raccourci TERTIAIRE vers l'indice suivant (il ouvre le
              panneau). Masqué sur téléphone : le panneau juste dessous
              porte le même geste. */}
          {hintsRemaining > 0 && (
            <button
              type="button"
              onClick={askHint}
              disabled={busy}
              className={`${TERTIARY_BUTTON} ${isExam ? 'inline-flex min-h-[40px] px-2 text-amber-800' : 'hidden sm:inline-flex'}`}
              data-hint-shortcut
            >
              <Lightbulb className="h-4 w-4 text-amber-600" aria-hidden="true" />
              {t('practice.hint.short')}
            </button>
          )}
        </div>
      )}
    </form>

    {/* Le verdict, et ce qu'il enseigne. */}
    {/* « Correction du professeur » : envoyée, en attente — l'élève continue. */}
    {reviewPending && <ReviewStatus pending review={review} />}

    {/* Copie en PHOTO seulement (élève autonome) : corrigé type, puis l'élève
        se note — comme un « Montrer que ». */}
    {selfPending && !isSelfCheck && (
      <div className="space-y-3" data-image-self-check>
        <SolutionPanel solution={question.solution} open />
        <SelfMarkChoice onSelfMark={selfMark} mark={answer?.selfMark ?? null} busy={busy} />
      </div>
    )}

    {answered && !selfPending && !reviewPending && (
      <FeedbackPanel ref={feedbackRef} evaluation={evaluation} message={feedbackMessage}>
        {/* Le serveur a tranché autrement que la prédiction locale :
            on le dit, sans bloquer — le verdict affiché est déjà le sien. */}
        {serverOverrode && (
          <p className="flex items-center gap-1.5 pt-1 text-xs text-slate-600" data-server-verdict>
            <span aria-hidden="true">☁</span> {t('practice.serverVerdict')}
          </p>
        )}
        {/* « À revoir : <leçon> (<année>) » — une réponse fausse renvoie, d'un pas, à
            l'année antérieure (réseau des savoir-faire, décision D7). */}
        {!evaluation.isCorrect && !isInertOutcome(evaluation.outcome) && !isSelfCheck && (
          <EarlierYearReview
            learningPointCode={question.learningPoints?.find((lp) => lp.role === 'primary')?.code ?? null}
            lessonCode={lessonCode}
          />
        )}
      </FeedbackPanel>
    )}

    {/* Le corrigé type de l'étape (feuille d'examen) — replié, après le
        verdict seulement. Une auto-évaluation l'a déjà montré. */}
    {/* Le corrigé type se MÉRITE (propriétaire, 2026-10-06) : seulement après
        une vraie tentative. Une saisie illisible (`syntax_error`) ou vide
        n'ouvre rien. */}
    {/* Feuille coachée : le corrigé replié laisse la place au coach — « Guide-moi » ne montre JAMAIS la réponse, « Explique-moi » la raconte pas à pas. */}
    {coach.on && answered && !isSelfCheck && !isInertOutcome(evaluation.outcome) && !selfPending && !reviewPending && (
      <CoachAfter key={`coach-${questionKey}-${coach.mode}`} coach={coach} lessonCode={lessonCode} question={question} isCorrect={evaluation.isCorrect} why={question.feedback?.incorrect ?? ''} onReveal={() => setSolutionSeenFor(questionKey)} />
    )}
    {!coach.on && answered && !isSelfCheck && !isInertOutcome(evaluation.outcome) && question.solution && (!isExam || solutionReady(exercise.questions, questionIndex, questionIndex)) && <SolutionPanel solution={question.solution} onReveal={() => setSolutionSeenFor(questionKey)} />}

    {/* La correction de l'enseignant : son avis attendu sur une réponse déjà
        jugée, ou son verdict et son commentaire arrivés. */}
    {answered && !reviewPending && review && <ReviewStatus review={review} />}

    {/* Réessayer est PROPOSÉ, jamais imposé. Désactivé le temps que le
        serveur réponde : son verdict ne doit pas réapparaître
        par-dessus une question déjà rouverte. */}
    {/* Feuille d'examen : UNE tentative par étape, comme à l'examen — la
        réponse est enregistrée et verrouillée, le corrigé type est visible :
        pas de « Réessaie ». */}
    {/* Corrigé type ouvert : la réponse est sous les yeux — la retaper ne prouverait rien. */}
    {/* « Guide-moi seulement » : la réponse n'a pas été montrée — l'élève réessaie lui-même, même sur une feuille d'examen. */}
    {answered && !evaluation.isCorrect && !isSelfCheck && (!isExam || (coach.on && coach.mode === 'guide')) && solutionSeenFor !== questionKey && (
      <button type="button" disabled={busy} onClick={retry} className={SECONDARY_BUTTON} data-retry>
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        {t('practice.retry')}
      </button>
    )}

    {/* L'aide : une ligne tant qu'on n'en veut pas. Une réponse fausse
        la garde ouverte ; une réponse juste la referme. `key` par
        question : repliée à chaque nouvelle question. */}
    {/* Feuille d'examen : pas de grand bandeau d'aide permanent — le lien
        « Indice » à côté du champ suffit ; le panneau n'apparaît qu'une fois
        un indice demandé, ou après une réponse fausse. */}
    {(!isExam || hints.length > 0 || (answered && !evaluation.isCorrect && !isSelfCheck && !pending)) && (
    <HintPanel
      key={`hints-${exercise.id}:${question.id}`}
      hints={hints}
      remaining={hintsRemaining}
      hintTypes={question.hints?.map((h) => h.type) ?? []}
      onRequest={askHint}
      busy={busy}
      disabled={hintsClosed}
    />
    )}

    {/* Fin d'exercice : le seul moment qui mérite plus qu'une coche. */}
    {score && (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="flex items-center gap-3 rounded-xl bg-nav-accent-soft px-3.5 py-2.5 ring-1 ring-indigo-100"
        data-exercise-done
      >
        <CheckCircle2 className="h-6 w-6 shrink-0 text-nav-accent" aria-hidden="true" />
        <p className="text-sm text-indigo-950">
          <span className="font-bold">{t('practice.exerciseDone')}</span>
          {totalQuestions > 1 && (
            <>
              {' · '}{t('practice.exerciseScore')}{' '}
              <bdi dir="ltr" className="font-bold tabular-nums">{score.correct}{'\u00A0/\u00A0'}{score.total}</bdi>
            </>
          )}
        </p>
        {isExam && exerciseMedals.count > 0 && (
          <span className="ms-auto flex flex-wrap items-center gap-2" data-exercise-medals>
            <span className="text-sm font-semibold text-indigo-950">{t('practice.medals.exercise.haul')}</span>
            <MedalTray counts={exerciseMedals} size={20} />
          </span>
        )}
      </motion.div>
    )}
    {score && isExam && exerciseMedals.allGold && (
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2 text-sm font-bold text-amber-900 ring-1 ring-amber-200"
        data-exercise-gold
      >
        <Medal medal="gold" size={22} shine /> {t('practice.medals.exercise.gold')}
      </motion.p>
    )}

    {/* Le geste TERTIAIRE « à propos de cette question » : signaler.
        `key` par question pour que le panneau se referme en
        changeant de question. Le cahier, lui, n'est plus ici : c'est
        la pastille flottante « 📓 Mon cahier », la même qu'en leçon. */}
    <ClassroomHidden><div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-2.5" data-question-tools>
      <ReportButton
        key={`report-${question.id}`}
        source="question"
        variant="icon"
        context={{
          lessonCode,
          sessionId,
          exerciseCode: exercise?.id,
          questionId: question?.id,
          attemptUuid,
        }}
      />
    </div></ClassroomHidden>
    </>
  );

  return (
    // Toute la largeur de l'écran, 20 px de marge de chaque côté, à tous les
    // formats (demande du propriétaire, 2026-09-24) : le cadre partagé
    // `.sa-page` avec sa variante `--flush` (index.css), sans largeur
    // maximale — l'exercice prend tout ce que la colonne latérale laisse.
    <div className={`sa-surface-plain sa-page sa-page--flush ${isExam ? 'py-3 sm:py-4' : 'py-6 sm:py-8'}`}>
      <MotionConfig reducedMotion="user">
      {isExam && <MedalCelebration award={award} onDone={clearAward} />}
      {/* MODE CLASSE : la coquille enveloppe TOUTE la page pour que
          le bouton d'entrée (dans la rangée de navigation) et le contenu
          présenté partagent la même session ; en présentation, le chrome de
          séance (retour, colonne latérale, en-tête, cahier, signalement)
          est retiré et seul l'exercice reste, cadré. Rien ne se remonte : la
          réponse en cours, les indices demandés, la correction et
          l'historique des questions restent. */}
      <ClassroomPresentation scope="exercise" title={exerciseHeading} entry="none" className="w-full space-y-3">
      <QuestionArrival
        arrival={arrival}
        questionKey={`${exercise.id}:${question.id}`}
        workspaceRef={workspaceRef}
        cardRef={cardRef}
        headingRef={questionHeadingRef}
        titleId="practice-exercise-title"
        onArrived={clearArrival}
      />
      {/* La sortie de séance. Sans elle, l'élève engagé dans un niveau n'a
          aucun chemin de retour : ni bandeau, ni fil d'Ariane sur cette page.
          Le travail déjà validé est enregistré côté serveur à chaque réponse,
          donc quitter ne perd rien — et la séance reste ouverte, le Hub
          propose de la « Reprendre ». */}
      <ClassroomHidden><nav className="flex items-center justify-between gap-3 flex-wrap pb-2" aria-label={t('nav.breadcrumb', { ns: 'lesson' })}>
        {/* Un vrai bouton « Retour aux niveaux », puis le titre du cours en
            contexte — un simple lien « Leçon : … » ne se lisait pas comme un retour. */}
        <span className="inline-flex min-w-0 flex-wrap items-center gap-3">
          <Link
            to={`/espace/pratique/${lessonCode}`}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 text-sm font-bold text-nav-accent shadow-sm hover:border-indigo-400 hover:bg-nav-accent-soft whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            data-practice-back
          >
            <ArrowBack className="w-4 h-4" aria-hidden="true" />
            {t('practice.backToLevels')}
          </Link>
          {isExam && lessonTitle && (
            <span className="max-w-[14rem] truncate text-sm text-slate-600 lg:max-w-md">
              <span className="font-semibold text-slate-500">{t('practice.exam.nav.lesson')} :</span> {lessonTitle}
            </span>
          )}
          {/* Feuille d'examen : le niveau courant vit ici, à côté du cours,
              en pastille — plus de ligne orpheline au-dessus de la barre de progression. */}
          {isExam && (
            <span className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-nav-accent-soft px-3.5 text-sm font-bold text-nav-accent ring-1 ring-indigo-100 whitespace-nowrap" data-exercise-level>
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              {t('practice.levelLabel', { level: session.level })}{levelName ? ` · ${levelName}` : ''}
            </span>
          )}
        </span>
        {/* « Brevet blanc » — la pastille de la maquette. */}
        {isExam && (
          <p className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-1.5 text-sm font-semibold text-slate-700 md:inline-flex" data-exam-simulation>
            <GraduationCap className="h-4 w-4 text-[#1f5c4c]" aria-hidden="true" />
            {t(examPaper(lessonCode).kind === 'term' ? 'practice.exam.nav.simulationTerm' : 'practice.exam.nav.simulation')}
            <span className="text-slate-500">· {t('practice.exam.nav.subject', { n: examPaper(lessonCode).n })}</span>
          </p>
        )}
        {/* ⛶ Afficher l’exercice — le mode classe de CET exercice (présentateur
            seulement). Le bouton est hors de la coquille, le contenu dedans :
            entrer ne remonte rien, la réponse en cours et la correction
            restent. */}
        <span className="flex flex-wrap items-center gap-1">
          {isExam
            ? <ExamPanelButton label={t('practice.sideLearningPoint')} onOpen={() => setPanelOpen(true)} />
            : <SideColumnToggle hidden={sideHidden} onToggle={toggleSide} label={t('practice.sideLearningPoint')} />}
          <ClassroomEntryButton scope="exercise" title={exerciseHeading} tone="quiet" />
        </span>
      </nav></ClassroomHidden>

      {/* ── L'ESPACE DE TRAVAIL ─────────────────────────────────────────────
          Téléphone/tablette : une colonne — point d'apprentissage, puis
          l'exercice. À partir de `xl` : UNE colonne latérale étroite (point
          d'apprentissage + « Contexte de la question ») au début (à gauche), et
          l'exercice qui prend tout le reste — la tâche mathématique est ce
          qui compte. En mode classe (`data-sa-classroom` sur <html>), la grille
          redevient un bloc et la colonne est retirée. */}
      {/* Feuille d'examen : pas de colonne latérale — une fenêtre au centre,
          ouverte par « Afficher le savoir-faire », fermée par ✕, Échap ou un clic à côté. */}
      {isExam && (
        <Modal open={panelOpen} onClose={() => setPanelOpen(false)} title={t('practice.sideLearningPoint')} closeLabel={t('practice.exam.panelClose')} size="xl">
          {/* Large, les blocs l'un sous l'autre sur toute la largeur : aucun
              libellé ne passe à la ligne (un savoir-faire a des titres longs). */}
          <div className="space-y-3" data-exam-panel>
            <LearningPointProgress point={point} />
            <ExamNavigator exercise={exercise} questionIndex={questionIndex} history={history} onJump={() => setPanelOpen(false)} />
          </div>
        </Modal>
      )}

      <div className={isExam ? 'w-full space-y-3' : practiceGridClass(sideHidden)}>

      {!isExam && <ClassroomHidden><aside className={`space-y-3 xl:sticky xl:top-4 ${sideHidden ? 'xl:hidden' : ''}`} data-practice-side>
        {/* ── 1 — CE QUE J'ENTRAÎNE, et où j'en suis : toujours en tête. ── */}
        <LearningPointProgress point={point} />
        {/* ── « Contexte de la question » — grand écran seulement ─────────────────── */}
        <div className={isExam ? 'hidden' : 'hidden xl:block'} data-question-context-column>
          <QuestionContextPanel questions={exercise.questions} questionIndex={questionIndex} history={history} />
        </div>
      </aside></ClassroomHidden>}

      <div className="min-w-0 space-y-5">
      {/* ── 2 — QUEL exercice : niveau (surtitre), titre (h1), méta. ────── */}
      <ClassroomHidden><header className={isExam ? 'flex flex-wrap items-baseline gap-x-3 gap-y-0.5' : 'space-y-2'} data-exercise-header>
        {!isExam && <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-semibold text-slate-600" data-exercise-level>
          <span className="inline-flex items-center gap-1.5 font-bold text-nav-accent">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            {t('practice.levelLabel', { level: session.level })}{levelName ? ` · ${levelName}` : ''}
          </span>
          {minutes && !isExam ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {t('practice.meta.minutes', { count: minutes })}
            </span>
          ) : null}
          {tags.length > 0 && <span>{tags.join(', ')}</span>}
        </p>}
        <h1
          id="practice-exercise-title"
          tabIndex={-1}
          className={isExam ? 'sr-only' : 'text-lg font-bold leading-snug text-slate-900 focus:outline-none sm:text-xl'}
        >
          {exerciseTitle}
        </h1>
        {/* Pourquoi CET exercice — une phrase discrète, jamais un blocage. */}
        {selectedBecause && (
          <p className="pb-2 text-sm leading-relaxed text-slate-600" data-selected-because={selectedBecause}>
            {t(`practice.selectedBecause.${selectedBecause}`)}
          </p>
        )}
      </header></ClassroomHidden>

      <ClassroomFrame maxWidth={1080}>
      <div ref={workspaceRef} className="space-y-3" data-exercise-workspace>
        {reviewIndex !== null && reviews[reviewIndex] ? (
          <section className="space-y-3" data-exercise-review={reviews[reviewIndex].exercise.id} aria-label={t('practice.review.label')}>
            <p className="rounded-xl bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">{t('practice.review.banner')}</p>
            {isExamExercise(reviews[reviewIndex].exercise) ? (
              <ExamSheet
                exercise={reviews[reviewIndex].exercise}
                questionIndex={reviews[reviewIndex].exercise.questions.length}
                history={reviews[reviewIndex].history}
                imageLoader={imageLoader}
              />
            ) : (
              <>
                <section className="rounded-xl bg-white/70 px-3.5 py-3 ring-1 ring-slate-200 sm:px-4">
                  <ExerciseStatement
                    content={reviews[reviewIndex].exercise.statement?.content}
                    visual={reviews[reviewIndex].exercise.statement?.visual}
                    formulas={reviews[reviewIndex].exercise.statement?.formulas} table={reviews[reviewIndex].exercise.statement?.table} figure={reviews[reviewIndex].exercise.statement?.figure}
                  />
                </section>
                <QuestionHistory entries={reviews[reviewIndex].history} total={reviews[reviewIndex].history.length} />
              </>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2" data-review-footer>
              {reviewIndex > 0 ? (
                <button type="button" onClick={() => openReview(reviewIndex - 1)} className={TERTIARY_BUTTON} data-review-previous>
                  <ArrowBack className="h-4 w-4" aria-hidden="true" /> {t('practice.previousExercise')}
                </button>
              ) : <span />}
              <button type="button" onClick={() => setReviewIndex(null)} className={`${PRIMARY_BUTTON} min-w-[10rem]`} data-review-back>
                {t('practice.review.backToCurrent')}
                <ArrowForward className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </section>
        ) : (
          <>
          {/* ── FEUILLE D'EXAMEN : la position en bandeau, puis le sujet. ───── */}
          {isExam ? (
            <>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-white/80 px-4 py-1.5 ring-1 ring-slate-200 sm:px-5" aria-labelledby="practice-question-heading">
                <div className="min-w-0 flex-1">
                <SessionProgress
                  index={position}
                  total={exerciseIds.length}
                  questionIndex={questionIndex}
                  questionTotal={totalQuestions}
                  questionTones={questionTones}
                  currentTone={currentTone}
                  headingId="practice-question-heading"
                  headingRef={questionHeadingRef}
                />
                </div>
                {/* Revenir / continuer — en haut, à côté de la position (propriétaire, 2026-10-06). */}
                {/* La vitrine de la leçon, en direct. */}
              {lessonMedals && <MedalTray counts={lessonMedals.total} label={t('practice.medals.trayTitle')} />}
              <nav className="flex flex-wrap items-center gap-1.5" aria-label={t('practice.exam.nav.title')} data-exam-nav>
                  {history.length > 0 && (
                    <button type="button" onClick={showPrevious} className={EXAM_NAV_BUTTON} data-show-previous>
                      <ArrowBack className="h-3.5 w-3.5" aria-hidden="true" /> {t('practice.previousQuestion')}
                    </button>
                  )}
                  {reviews.length > 0 && (
                    <button type="button" onClick={() => openReview(reviews.length - 1)} className={EXAM_NAV_BUTTON} data-previous-exercise>
                      <ArrowBack className="h-3.5 w-3.5" aria-hidden="true" /> {t('practice.previousExercise')}
                    </button>
                  )}
                  <button type="button" onClick={next} disabled={!answered || busy} className={answered ? EXAM_NAV_NEXT : EXAM_NAV_BUTTON} data-next>
                    {nextLabel} <ArrowForward className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
              {/* « Salle d’examen » : la porte de la feuille — avant la première étape (leçons pilotes du coach). */}
              {coach.on && !coach.entered && <ExamHall coach={coach} title={exercise.metadata?.title ?? ''} />}
              <ExamSheet
              ref={cardRef}
              exercise={exercise}
              questionIndex={questionIndex}
              answeredThrough={answered ? questionIndex : questionIndex - 1}
              history={history}
              imageLoader={imageLoader}
              started={answered || stepStartedAt !== null}
              onStart={startStep}
              startReady={openedFor === `${exercise.id}:${question.id}`}
              timer={answered && !Number.isFinite(answer?.seconds) ? null : (
                <StepTimer limit={stepSeconds(question, exercise)} startedAt={stepStartedAt} stoppedSeconds={answered ? answer.seconds : null} />
              )}
            >
                <div className="space-y-4" data-exam-answer-zone>
                  {question.visual && <ExerciseStatement visual={question.visual} support={question.support} />}
                  {answerZone}
                </div>
              </ExamSheet>
            </>
          ) : (
            <>
            {/* ── les DONNÉES du problème : le contexte, pas la question. ───── */}
            {(exercise.statement?.content || exercise.statement?.formulas || exercise.statement?.table || exercise.statement?.visual || exercise.statement?.figure || exercise.statement?.support) && (
              <section aria-labelledby="practice-statement-label" className="rounded-xl bg-white/70 px-3.5 py-3 ring-1 ring-slate-200 sm:px-4">
                <p id="practice-statement-label" className="mb-1 text-xs font-bold text-slate-600">{t('practice.statementLabel')}</p>
                <ExerciseStatement
                  content={exercise.statement?.content}
                  visual={exercise.statement?.visual}
                  formulas={exercise.statement?.formulas} table={exercise.statement?.table} figure={exercise.statement?.figure}
                  support={exercise.statement?.support}
                />
              </section>
            )}

            {/* ── ce que l'élève a DÉJÀ fait : « Question précédente » + les anciennes ── */}
            <QuestionHistory entries={history} total={totalQuestions} />

            {/* ── LA QUESTION COURANTE : la seule surface en relief, filet
                indigo sur le bord de début. ─────────────────────────────────── */}
            <motion.section
              key={`${exercise.id}:${question.id}`}
              ref={cardRef}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              aria-labelledby="practice-question-heading"
              aria-current="step"
              data-current-question={questionIndex + 1}
              className="relative scroll-mt-20 overflow-hidden rounded-2xl border-s-4 border-nav-accent bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_28px_-16px_rgba(15,23,42,0.22)] ring-1 ring-slate-200 lg:scroll-mt-6"
            >
              {/* « Question n sur N » (N = les questions de CET exercice) et
                  « Exercice n sur N » : la position, une seule fois, ici. */}
              <header className="border-b border-indigo-100 bg-indigo-50/50 px-5 py-3.5 sm:px-6">
                <SessionProgress
                  index={position}
                  total={exerciseIds.length}
                  questionIndex={questionIndex}
                  questionTotal={totalQuestions}
                  questionTones={questionTones}
                  currentTone={currentTone}
                  headingId="practice-question-heading"
                  headingRef={questionHeadingRef}
                />
              </header>

              <div className="space-y-4 p-4 sm:p-5">
                <div className="space-y-3">
                  <p className="text-lg font-semibold leading-relaxed text-slate-900 sm:text-xl" data-question-statement>
                    <RichText>{question.statement}</RichText>
                  </p>
                  {question.visual && <ExerciseStatement visual={question.visual} support={question.support} />}
                </div>

                {answerZone}
              </div>
            </motion.section>
            </>
          )}

          {/* Le cahier : LA pastille flottante « 📓 Mon cahier » de la leçon, au
              même étage (au-dessus de la barre « Question suivante »). Atteignable
              à tout moment — pendant la recherche comme après le verdict.
              `key` par question ET par verdict : une réponse validée ouvre une
              nouvelle note, pré-remplie de la réponse et du verdict (c'est le
              moment d'y garder une erreur). */}
          <ClassroomHidden>
            <NotebookButton
              key={`note-${answered ? 'answered-' : ''}${question.id}`}
              context={notebookContext}
              onSave={saveNote}
              onUpdate={patchNote}
            />
          </ClassroomHidden>

          {/* ── LA SUITE — pied de colonne. « Question suivante » est TOUJOURS là,
              actif dès qu'une réponse est vérifiée, juste ou fausse (invariant
              non bloquant) — secondaire avant, principal après. « Question
              précédente » ramène à la question précédente — on la relit ; on ne
              rouvre pas une tentative déjà jugée par le serveur. Sur téléphone
              la barre colle au bas de l'écran, au-dessus de la barre d'onglets,
              sous le pouce — sauf sur un écran très bas (téléphone en paysage) :
              collée, elle ne laisserait plus voir le champ de réponse. Sur
              ordinateur, `lg:pe-36` laisse à sa fin (la droite) la
              place de la pastille « 📓 Mon cahier », posée au même étage. */}
          {/* Feuille d'examen : la navigation est EN HAUT (bandeau de position). */}
          {!isExam && (
          <div
            className={`sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 -mx-5 flex items-center gap-2 border-t border-slate-200 bg-slate-50/95 px-5 py-2 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:bg-white/95 sm:px-3 lg:bottom-4 lg:pe-36 [@media(max-height:520px)]:static`}
            data-question-footer
          >
            <span className="flex items-center gap-1">
              {history.length > 0 && (
                <button type="button" onClick={showPrevious} className={TERTIARY_BUTTON} data-show-previous>
                  <ArrowBack className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t('practice.previousQuestion')}</span>
                  <span className="sr-only sm:hidden">{t('practice.previousQuestion')}</span>
                </button>
              )}
              {reviews.length > 0 && (
                <button type="button" onClick={() => openReview(reviews.length - 1)} className={TERTIARY_BUTTON} data-previous-exercise>
                  <ArrowBack className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t('practice.previousExercise')}</span>
                  <span className="sr-only sm:hidden">{t('practice.previousExercise')}</span>
                </button>
              )}
            </span>

            <p className="flex flex-1 items-center justify-center gap-1.5 text-xs font-semibold text-slate-600" aria-live="polite" data-save-state>
              {answered && !busy && (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  {t('practice.answerSaved')}
                </>
              )}
            </p>

            <button type="button" onClick={next} disabled={!answered || busy} className={examTone(nextClass)} data-next>
              {nextLabel}
              <ArrowForward className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          )}
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
