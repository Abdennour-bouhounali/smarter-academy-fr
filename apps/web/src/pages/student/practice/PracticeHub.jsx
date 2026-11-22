import { useContext, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Dumbbell, PlayCircle, GraduationCap, Sparkles } from 'lucide-react';
import SettingsButton from '../../../features/settings/SettingsButton';
import ExamLevelCards from '../../../features/practice/exam/ExamLevelCards';
import { examPaper, isExamLesson } from '../../../features/practice/exam/examSheet';
import Modal from '../../../components/admin/ui/Modal';
import { ArrowBack, ArrowForward } from '../../../components/common/DirectionalIcons';
import { AuthContext } from '../../../context/AuthContext';
import { fetchPracticeOverview, startPracticeSession, fetchLessonMedals } from '../../../services/practiceService';
import MedalCabinet from '../../../features/practice/medals/MedalCabinet';
import LevelSelector from '../../../features/practice/LevelSelector';
import LearningPointProgress from '../../../features/practice/LearningPointProgress';
import { resolveMasteryState, reasonLabel, freshnessLabel } from '../../../lessons/common/components/LearningPointMastery';
import { getLessonPath, getLessonById } from '@smarter-academy/core';
import MathLabel from '../../../lessons/common/components/MathLabel';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import { exerciseIdsFor } from '../../../features/practice/practiceContent';
import { teacherOverview, teacherBankPath } from '../../../features/practice/teacherBank';

/**
 * Le Hub de pratique d'une leçon : les niveaux, et l'état des connaissances
 * qu'ils travaillent.
 *
 * Rien de ludique ici — pas de pièces, pas de classement. La récompense
 * affichée est la seule qui compte : voir un point d'apprentissage passer de
 * « à renforcer » à « maîtrisé ».
 *
 * L'ENSEIGNANT (2026-10-05) arrive ici par la leçon, comme l'élève, et voit
 * EXACTEMENT cette page (`/enseignant/pratique/:lessonCode`) — sans aucun
 * suivi : l'aperçu est construit localement (teacherOverview, tous les
 * niveaux ouverts), choisir un niveau ouvre son premier exercice dans le
 * lecteur enseignant, rien n'est écrit sur le serveur.
 */
export default function PracticeHub() {
  const { isTeacher, workspaceBase } = useLearningViewer();
  // `teacher` est à la demande : seul l'enseignant le déclare, donc seul lui le télécharge.
  const { t } = useTranslation(isTeacher ? ['student', 'teacher'] : 'student');
  const { lessonCode } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const coursesPath = `${workspaceBase ?? '/espace'}/cours`;

  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);
  const [busyLevel, setBusyLevel] = useState(null);
  // Prototype de la feuille d’examen : « Ce que j’ai montré » dans une fenêtre centrale, pas en colonne.
  const [lpsOpen, setLpsOpen] = useState(false);
  const exam = isExamLesson(lessonCode);
  // La « Vitrine des médailles » (prototype de la feuille d’examen) : élève seulement — l'enseignant n'est pas suivi.
  const [medals, setMedals] = useState(null);
  useEffect(() => {
    if (!token || !exam || isTeacher) return;
    fetchLessonMedals(token, lessonCode).then(setMedals).catch(() => {});
  }, [token, lessonCode, exam, isTeacher]);
  // Un refus du serveur porte un motif clos (`code`) : « pas de pratique ici »
  // et « leçon non ouverte » se disent différemment ; sinon, le message
  // générique du service.
  const refusalText = (e) => (
    e?.code === 'practice_unavailable' || e?.code === 'lesson_unavailable'
      ? t(`practice.unavailable.${e.code}`)
      : e?.message
  );

  useEffect(() => {
    if (!token) return undefined;
    // L'enseignant : aucun appel, aucun suivi — l'aperçu vient du contenu.
    if (isTeacher) {
      setOverview(teacherOverview(lessonCode));
      return undefined;
    }
    let cancelled = false;
    setError(null);
    fetchPracticeOverview(token, lessonCode)
      .then((data) => !cancelled && setOverview(data))
      .catch((e) => !cancelled && setError(refusalText(e)));

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, lessonCode, isTeacher]);

  const start = useCallback(async (level) => {
    if (isTeacher) {
      const [first] = exerciseIdsFor(lessonCode, level);
      if (first) navigate(teacherBankPath(lessonCode, level, first));
      return;
    }
    setBusyLevel(level);
    setError(null);
    try {
      const sessionId = crypto.randomUUID();
      await startPracticeSession(token, lessonCode, sessionId, level);
      navigate(`/espace/pratique/${lessonCode}/session/${sessionId}`);
    } catch (e) {
      setError(refusalText(e));
      setBusyLevel(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, lessonCode, navigate, isTeacher]);

  if (error && !overview) {
    return (
      <div className="sa-surface-plain sa-page sa-page--flush py-6 sm:py-8 space-y-6">
        <p className="text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-xl p-4">{error}</p>
        <Link to={coursesPath} className="text-sm font-bold text-slate-600 hover:text-slate-900">
          ← {t('practice.backToMyCourses')}
        </Link>
      </div>
    );
  }

  if (!overview) {
    return <div className="sa-surface-plain sa-page sa-page--flush py-6 sm:py-8"><div className="h-64 rounded-2xl bg-slate-100 animate-pulse" /></div>;
  }

  const { lesson, levels, recommendedLevel, openSession } = overview;
  // L'enseignant voit les points d'apprentissage de la leçon, sans état :
  // étoiles éteintes, aucun compteur (`practice: null`) — rien n'est suivi.
  const learningPoints = isTeacher
    ? (getLessonById(lessonCode)?.learningPoints ?? []).map((lp) => ({ code: lp.id, title: lp.title, status: 'unassessed', practice: null }))
    : overview.learningPoints;
  // L'API de pratique ne renvoie que le code de la leçon ; le chemin de son
  // cours vient du catalogue, seule source de vérité des URLs de leçon.
  const lessonPath = getLessonPath(lessonCode);
  const lpItems = (cols) => (
    <ul className={`grid grid-cols-1 gap-2 ${cols}`}>
      {learningPoints.map((lp) => {
        const stateKey = resolveMasteryState(lp);
        const reason = stateKey === 'reinforce' ? reasonLabel(lp, t) : '';
        const freshness = stateKey === 'mastered' && lp.freshness && lp.freshness !== 'fresh' ? freshnessLabel(lp, t) : '';

        return (
          <li key={lp.code} data-mastery-state={stateKey} className="space-y-1">
            <LearningPointProgress point={lp} eyebrow={false} headingTag="h3" />
            {(reason || freshness) && (
              <p className="px-1 text-xs text-slate-600">
                {reason}{reason && freshness ? ' · ' : ''}{freshness && `⏳ ${freshness}`}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
  const lpsTitle = isTeacher ? t('practice.lessonPoints', { ns: 'teacher' }) : t('practice.whatYouShowed');

  // ── PROTOTYPE DE LA FEUILLE D’EXAMEN (propriétaire, 2026-10-06) : en-tête « Brevet blanc », niveaux
  // en cartes sur toute la largeur, « Ce que j’ai montré » dans une fenêtre centrale.
  if (exam) {
    return (
      <div className="sa-surface-plain sa-page sa-page--flush space-y-5 py-5 sm:py-6" data-practice-hub-exam>
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-600" aria-label={t('nav.breadcrumb', { ns: 'lesson' })}>
          <Link to={coursesPath} className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap hover:text-[#1f5c4c]">
            <ArrowBack className="h-4 w-4" aria-hidden="true" /> {t('practice.breadcrumbMyCourses')}
          </Link>
          {lessonPath && (
            <>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <Link to={lessonPath} className="min-w-0 truncate hover:text-[#1f5c4c]"><MathLabel>{lesson.title}</MathLabel></Link>
            </>
          )}
        </nav>

        <header className="relative overflow-hidden rounded-2xl bg-white px-5 py-5 ring-1 ring-slate-200 sm:px-7" data-practice-hub-header>
          <span aria-hidden="true" className="absolute inset-y-0 start-0 w-1.5 bg-[#1f5c4c]" />
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <div className="min-w-0 space-y-1.5">
              <p className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                <GraduationCap className="h-4 w-4 text-[#1f5c4c]" aria-hidden="true" />
                {t(examPaper(lessonCode).kind === 'term' ? 'practice.exam.nav.simulationTerm' : 'practice.exam.nav.simulation')}
                <span className="text-slate-500">· {t('practice.exam.nav.subject', { n: examPaper(lessonCode).n })}</span>
              </p>
              <h1 className="text-xl font-bold leading-snug text-slate-900 sm:text-2xl"><MathLabel>{lesson.title}</MathLabel></h1>
              <p className="text-sm text-slate-600">{isTeacher ? t('practice.noTracking', { ns: 'teacher' }) : t('practice.exam.hub.subtitle')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {learningPoints.length > 0 && (
                <button type="button" onClick={() => setLpsOpen(true)} className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#1f5c4c] px-3.5 text-sm font-bold text-white hover:bg-[#174a3d] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2" data-practice-hub-lps-open>
                  <Sparkles className="h-4 w-4" aria-hidden="true" /> {lpsTitle}
                </button>
              )}
              {lessonPath && (
                <Link to={lessonPath} className="inline-flex min-h-[40px] items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
                  <BookOpen className="h-4 w-4" aria-hidden="true" /> {t('practice.reviewLesson')}
                </Link>
              )}
              {!isTeacher && (
                <SettingsButton
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  iconSize={16}
                  testId="hub"
                />
              )}
            </div>
          </div>
        </header>

        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

        {openSession && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50/70 px-4 py-3 ring-1 ring-emerald-200" data-open-session>
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
              <PlayCircle className="h-5 w-5 text-[#1f5c4c]" aria-hidden="true" />
              {t('practice.openSession', { level: openSession.level })}
            </p>
            <Link
              to={`/espace/pratique/${lessonCode}/session/${openSession.sessionId}`}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#1f5c4c] px-4 text-sm font-bold text-white hover:bg-[#174a3d]"
            >
              {t('practice.resume')}
              <ArrowForward className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}

        {!isTeacher && medals && <MedalCabinet medals={medals} />}

        <section className="space-y-3" aria-labelledby="practice-levels-title">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="practice-levels-title" className="text-lg font-bold text-slate-900">{t('practice.levelsTitle')}</h2>
            <p className="text-xs text-slate-600">{t('practice.hubSubtitle')}</p>
          </div>
          <ExamLevelCards lessonCode={lessonCode} levels={levels} recommendedLevel={recommendedLevel} onSelect={start} busyLevel={busyLevel} showProgress={!isTeacher} medalsByLevel={medals?.levels} />
        </section>

        <Modal open={lpsOpen} onClose={() => setLpsOpen(false)} title={lpsTitle} closeLabel={t('practice.exam.panelClose')} size="xl">
          <div className="space-y-3" data-practice-hub-lps>
            {!isTeacher && <p className="text-xs text-slate-600">{t('practice.whatYouShowedHint')}</p>}
            {/* Une colonne sur toute la largeur : les titres longs ne passent pas à la ligne. */}
            {lpItems('')}
          </div>
        </Modal>
      </div>
    );
  }

  return (
    // Même cadre que le lecteur d'exercices : toute la largeur, 20 px de
    // chaque côté (`.sa-page--flush`), le même cadre que « Défi du jour » (py-6 sm:py-8).
    <div className="sa-surface-plain sa-page sa-page--flush py-6 sm:py-8 space-y-4">
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-600" aria-label={t('nav.breadcrumb', { ns: 'lesson' })}>
        <Link to={coursesPath} className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap hover:text-nav-accent">
          <ArrowBack className="h-4 w-4" aria-hidden="true" /> {t('practice.breadcrumbMyCourses')}
        </Link>
        {lessonPath && (
          <>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <Link to={lessonPath} className="min-w-0 truncate hover:text-nav-accent"><MathLabel>{lesson.title}</MathLabel></Link>
          </>
        )}
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2" data-practice-hub-header>
        <div className="min-w-0 space-y-1">
          <p className="inline-flex items-center gap-1.5 text-sm font-bold text-nav-accent">
            <Dumbbell className="h-4 w-4" aria-hidden="true" /> {t('practice.eyebrow')}
          </p>
          <h1 className="text-xl font-bold leading-snug text-slate-900 sm:text-2xl"><MathLabel>{lesson.title}</MathLabel></h1>
          <p className="text-sm text-slate-600">{isTeacher ? t('practice.noTracking', { ns: 'teacher' }) : t('practice.hubSubtitle')}</p>
        </div>
        {/* Le retour au cours. La pratique n'est pas une impasse : l'élève qui
            butte sur un niveau doit pouvoir relire la leçon en un geste, sans
            repasser par « Mes cours ». `lessonPath` est nul quand la leçon
            n'est pas (encore) au catalogue — on n'affiche alors aucun lien
            plutôt qu'un lien mort. Action TERTIAIRE : le choix du niveau est
            l'action de la page. */}
        {lessonPath && (
          <Link
            to={lessonPath}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-700 hover:bg-white hover:text-nav-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            {t('practice.reviewLesson')}
          </Link>
        )}
      </header>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {/* Une séance ouverte : UNE rangée, l'action principale de la page
          quand elle existe. */}
      {openSession && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-s-4 border-nav-accent bg-white px-4 py-3 ring-1 ring-slate-200" data-open-session>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <PlayCircle className="h-5 w-5 text-nav-accent" aria-hidden="true" />
            {t('practice.openSession', { level: openSession.level })}
          </p>
          <Link
            to={`/espace/pratique/${lessonCode}/session/${openSession.sessionId}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-nav-accent px-5 text-sm font-bold text-white hover:bg-[#3350c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent focus-visible:ring-offset-2"
          >
            {t('practice.resume')}
            <ArrowForward className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Grand écran : les points d'apprentissage en colonne au DÉBUT (à gauche,
          comme dans le lecteur), les niveaux prennent le reste. Plus
          petit : les niveaux d'abord — choisir un niveau est l'action. */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[30.6rem_minmax(0,1fr)] xl:items-start xl:[grid-template-areas:'side_main']">
        <section className="space-y-2 xl:[grid-area:main]" aria-labelledby="practice-levels-title">
          <h2 id="practice-levels-title" className="text-base font-bold text-slate-900">{t('practice.levelsTitle')}</h2>
          <LevelSelector levels={levels} recommendedLevel={recommendedLevel} onSelect={start} busyLevel={busyLevel} showProgress={!isTeacher} />
        </section>

        {learningPoints.length > 0 && (
          <section className="space-y-2 xl:sticky xl:top-4 xl:[grid-area:side]" aria-labelledby="practice-lps-title" data-practice-hub-lps>
            <div>
              <h2 id="practice-lps-title" className="text-base font-bold text-slate-900">{isTeacher ? t('practice.lessonPoints', { ns: 'teacher' }) : t('practice.whatYouShowed')}</h2>
              {!isTeacher && <p className="text-xs text-slate-600">{t('practice.whatYouShowedHint')}</p>}
            </div>
            {/* Le MÊME module que dans le lecteur : chemin d'étoiles (l'état
                Mastery V2) et compteurs exercices / questions. Sous `xl`,
                deux par rangée sur tablette. */}
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {learningPoints.map((lp) => {
                const stateKey = resolveMasteryState(lp);
                const reason = stateKey === 'reinforce' ? reasonLabel(lp, t) : '';
                const freshness = stateKey === 'mastered' && lp.freshness && lp.freshness !== 'fresh' ? freshnessLabel(lp, t) : '';

                return (
                  <li key={lp.code} data-mastery-state={stateKey} className="space-y-1">
                    <LearningPointProgress point={lp} eyebrow={false} headingTag="h3" />
                    {(reason || freshness) && (
                      <p className="px-1 text-xs text-slate-600">
                        {reason}{reason && freshness ? ' · ' : ''}{freshness && `⏳ ${freshness}`}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
