import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, CheckCircle, Lock, ListChecks } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '../hooks/useProgress';
import { lockedReasonData, isValidModuleNumber } from '@smarter-academy/core';
import { resolveModuleUnlock } from '../utils/moduleGate';
import { StudentFocusProvider, useStudentFocusFor, MoreToggle } from './StudentFocus';
import MissionLayer from '../mission/MissionLayer';
import MissionPlayer from '../mission/MissionPlayer';
import { isMissionView } from '../mission/missionModel';
import { getLoadedLessonConfig } from '../../registry';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import ReportButton from '../../../features/reports/ReportButton';
import PublicationBadge from '../../../components/content/PublicationBadge';
import { scrollToStep } from '../utils/scrollToStep';
import { LessonChromeContext, useLessonChromeLayout } from '../hooks/useLessonChrome';
import { useClassroomMode, useClassroomStage, ClassroomEntryButton, ClassroomFrame } from '../classroom';
import MathLabEntryButton from '../../../features/mathlab/overlay/MathLabEntryButton';
import { useContentAvailability } from '../../../context/ContentAvailabilityContext';
import PremiumLessonLocked from './PremiumLessonLocked';
import { useCatalogueHref } from '../../../components/student/catalogueLink';
import MathLabel from './MathLabel';
import { useDeclarePageTour } from '../../../features/tours/PageTourProvider';

/**
 * ModuleLayout — shared layout wrapper for every lesson module.
 *
 * Props:
 *   coursePath    — base URL of the lesson (e.g. /courses/moyen/4am/<chapter>/<lesson>)
 *   courseTitle   — lesson title for breadcrumb
 *   unitTitle     — الوحدة, the textbook unit (a GROUP OF LESSONS) shown first
 *                   in the breadcrumb « الوحدة / الدرس / المحور »
 *   unitPath      — its page; without the pair, the breadcrumb falls back to المجال
 *   levelLabel    — human-readable level label; no longer shown in the
 *                   breadcrumb, still used to build the catalogue link
 *   gradeLabel    — human-readable grade label (same)
 *   moduleNumber  — current module index (1-based, or 0 for a prerequisite
 *     diagnostic module)
 *   totalModules  — total number of modules in this lesson
 *   lastModuleNumber — number of the lesson's LAST module (drives the
 *     "Terminer" button). Defaults to totalModules, which is only correct
 *     when modules are numbered 1..N — a lesson with a module 0 must pass
 *     it explicitly (modules.length ≠ last number there). Set it once in
 *     MODULE_CTX so every module inherits it.
 *   moduleTitle   — title of this module
 *   moduleSubtitle — subtitle / objective sentence
 *   estimatedTime — e.g. "8 min"
 *   xp            — current XP to display
 *   prevLink      — URL of previous module (or null)
 *   nextLink      — URL of next module (or null for last module)
 *   onNextClick   — callback fired when the next button is clicked (mark complete)
 *   lessonId      — ID of the lesson to track progress automatically
 *   sequentialUnlock — when true, this module (and its route) is only
 *     accessible once the previous module is mastered (>= 80%). Opt-in per
 *     lesson via MODULE_CTX, so lessons that don't set it keep the previous
 *     always-open behavior. See @smarter-academy/core.
 *   presentationFrame — en MODE CLASSE (وضع القسم), le contenu est-il posé
 *     dans un ClassroomFrame (agrandissement) par ce layout ? Vrai par défaut
 *     (moteurs sans unités : test final, diagnostic) ; ContentModule, qui
 *     présente ses unités une à une et les cadre lui-même, passe false.
 *   incompleteSteps — optional array of {num, title} for the module's own
 *     steps not yet done (e.g. [{num: 2, title: 'Des chiffres vers les mots'}]).
 *     When the "Module suivant"/"Terminer" button is disabled, these are
 *     listed next to it and clicking one scrolls straight to that
 *     StepCard (matched by id `step-{num}`) instead of leaving the student
 *     staring at a disabled button with no idea what's missing.
 *   children      — module content
 */
export default function ModuleLayout({
  coursePath,
  courseTitle,
  // L'الوحدة du manuel (le groupe de leçons), pour le fil d'Ariane
  // « الوحدة / الدرس / المحور ». Absentes, on retombe sur le المجال.
  unitTitle,
  unitPath,
  moduleNumber,
  totalModules,
  firstModuleNumber,
  previousStage,
  lastModuleNumber,
  moduleTitle,
  moduleSubtitle,
  estimatedTime,
  xp,
  children,
  prevLink,
  nextLink,
  onNextClick,
  lessonId,
  chapter,
  chapterTitle,
  isCompleted,
  sequentialUnlock = false,
  stage,
  incompleteSteps,
  // Optional catalogue ids for the breadcrumb links (`/courses?level=…&grade=…`).
  // When absent, the historical derivation from the labels is kept unchanged.
  levelId,
  gradeId: gradeIdProp,
  presentationFrame = true,
  // Le regard « focus » de l'élève (StudentFocus.jsx) : vient de MODULE_CTX.
  studentView,
}) {
  const navigate = useNavigate();

  // MODE CLASSE (وضع القسم). Présenté, le module cache son chrome (fil
  // d'Ariane, en-tête, XP, navigation basse, pied de page) et ne garde que
  // son contenu — dans le MÊME arbre React : rien ne se remonte, l'état des
  // questions et des manipulations survit à l'entrée comme à la sortie.
  const classroom = useClassroomMode();
  const presenting = classroom.isClassroomMode;
  // QUI lit : un enseignant navigue librement (tous les modules ouverts) et
  // n'écrit rien — useProgress est déjà muet pour lui.
  const viewer = useLearningViewer();
  // En focus, l'en-tête se réduit au titre (ni minuterie, ni sous-titre).
  const focus = useStudentFocusFor(studentView);
  // MODE MISSION (élève) : le module se joue dans le lecteur plein écran, sans défilement (mission/MissionPlayer.jsx).
  const missionConfig = lessonId ? getLoadedLessonConfig(lessonId) : null;
  const play = Boolean(missionConfig?.mission) && isMissionView(studentView, viewer, classroom);

  // Le décalage haut réservé par la coquille du module dépend du bandeau
  // réellement rendu au-dessus : la Navbar visiteur est `fixed` sans
  // compensation (le module la réserve), alors que StudentLayout consomme
  // déjà son en-tête mobile via `pt-14 lg:pt-0` (le module ne réserve rien).
  const chrome = useLessonChromeLayout();
  const { t } = useTranslation('lesson');
  const catalogueHref = useCatalogueHref();

  const isLastModule = moduleNumber === (lastModuleNumber ?? totalModules);

  const { markModuleVisited, markModuleCompleted, isModuleCompleted } = useProgress(lessonId || 'unknown');

  // `stage` keeps evaluation modules reachable from the start — the final
  // challenge is an alternative path, not just the last module.
  // Le premier module de la leçon (MODULE_CTX.firstModuleNumber, que toutes
  // les leçons 4AM fournissent). En son absence, on retombe sur 0 dès qu'un
  // module 0 est affiché — `moduleNumber === 0` est lui-même la preuve que
  // la numérotation commence à zéro.
  const firstModule = Number.isFinite(Number(firstModuleNumber))
    ? Number(firstModuleNumber)
    : (Number(moduleNumber) === 0 ? 0 : 1);
  // La POSITION du module dans la leçon, pas son numéro : une leçon qui
  // ouvre sur « أستعدّ » (module 0) affichait « 0 / 5 » puis plafonnait à
  // « 4 / 5 » (80 %) sur son dernier module.
  const modulePosition = Number(moduleNumber) - firstModule + 1;
  const progressPct = Math.round((modulePosition / totalModules) * 100);
  // « جولة تعريفية » des modules de leçon : le module, الخريطة, كرّاسي,
  // المختبر, la navigation. Elle s'ouvre d'elle-même sur le PREMIER module
  // seulement (une fois par compte, toutes leçons confondues) ; sur les
  // autres, elle reste rejouable par « جولة في الصفحة ». Jamais en وضع القسم.
  // Voir docs/architecture/PAGE_TOURS.md.
  useDeclarePageTour('lesson-module', !presenting && !play, { autoStart: modulePosition === 1 });
  // CE QUI EST FAIT RESTE OUVERT (même règle que getModuleStatus) : un module
  // déjà terminé ne se referme jamais, même si son prédécesseur ne l'est pas.
  // Sans cela, revenir sur un module fini affichait « أتمِم المحور 00 » et
  // renvoyait l'élève hors de son propre travail.
  const alreadyDone = isModuleCompleted(String(moduleNumber));
  // Présenter n'est pas apprendre : un enseignant projette le module 3 sans
  // avoir « terminé » les modules 0 à 2 sur son propre compte. Le verrou
  // séquentiel est un guide de progression de l'ÉLÈVE ; en présentation il
  // ne s'applique pas — et, symétriquement, rien n'est écrit dans la
  // progression (ni visite ni complétion) tant qu'on présente.
  const sequentiallyUnlocked = resolveModuleUnlock({
    presenting,
    freeNavigation: viewer.freeNavigation,
    alreadyDone,
    sequentialUnlock,
    isModuleCompleted,
    moduleNumber,
    stage,
    firstModuleNumber: firstModule,
    previousStage,
  });

  // ── Le PALIER, avant la progression ──────────────────────────────────
  // Une leçon premium que ce compte ne peut pas ouvrir est verrouillée sur
  // son sommaire (LessonIndex) — et ICI aussi, sinon l'URL d'un module tapée
  // directement contournerait le cadenas. La décision vient du serveur
  // (lessons.tier, décidé par l'administrateur, lu via /content/availability) ;
  // le serveur refuse de toute façon chaque écriture (ContentAccess). Un
  // module verrouillé par le palier n'écrit donc ni visite ni complétion.
  const { isLessonLocked, lessonStatus, moduleStatus } = useContentAvailability();
  const premiumLocked = Boolean(lessonId) && isLessonLocked(lessonId);
  const unlocked = sequentiallyUnlocked && !premiumLocked;

  // `isValidModuleNumber` et non `moduleNumber` : le module 0 (« أستعدّ »)
  // est un numéro valide, et `if (moduleNumber)` le rejetait — sa visite et
  // sa complétion n'étaient jamais écrites, si bien qu'une leçon ouvrant sur
  // un module 0 plafonnait à 80 % et ne pouvait pas se terminer.
  const hasModuleNumber = isValidModuleNumber(moduleNumber);

  useEffect(() => {
    if (lessonId && hasModuleNumber && unlocked && !presenting) {
      markModuleVisited(moduleNumber);
    }
  }, [lessonId, hasModuleNumber, moduleNumber, unlocked, presenting, markModuleVisited]);

  useEffect(() => {
    if (lessonId && hasModuleNumber && isCompleted && unlocked && !presenting) {
      markModuleCompleted(String(moduleNumber));
    }
  }, [lessonId, hasModuleNumber, moduleNumber, isCompleted, unlocked, presenting, markModuleCompleted]);

  // Ce que la barre de présentation affiche pour CE module : son titre, sa
  // position dans la leçon, et — en session leçon — les gestes vers les
  // modules voisins. ContentModule, qui connaît ses unités, déclare par
  // dessus (priorité 2) ; ici c'est le repli de tout module (priorité 1).
  const lessonNav = classroom.lessonNavigation;
  const positionSlot = useMemo(() => (lessonNav
    ? <span className="sa-classroom-position" data-classroom-position>{t('classroom.positionModule', { current: lessonNav.position, total: Math.max(1, lessonNav.total - 1) })}</span>
    : null), [lessonNav, t]);
  useClassroomStage({
    title: moduleTitle,
    onPrevious: lessonNav?.previous ?? undefined,
    onNext: lessonNav?.next ?? undefined,
    slot: positionSlot,
    priority: 1,
  }, presenting);

  // Quitter un module n'est pas le terminer. « التالي » est toujours offert
  // quand le module ne bloque pas (أستعدّ, le défi final) : il n'écrivait
  // pourtant la complétion SANS regarder `isCompleted` — sauter le
  // diagnostic le marquait « fait » — ni `presenting`/`unlocked`, que l'effet
  // ci-dessus respecte. Une seule règle d'écriture, la même partout.
  const commitCompletion = () => {
    if (lessonId && hasModuleNumber && isCompleted && unlocked && !presenting) {
      markModuleCompleted(String(moduleNumber));
    }
  };

  const handleNextClick = (e) => {
    e.preventDefault();
    commitCompletion();
    if (onNextClick) onNextClick();
    if (nextLink) navigate(nextLink);
  };

  // `gradeId`/`levelId` sont des IDENTIFIANTS d'URL, pas du texte : ils
  // viennent de la leçon (`gradeId: '4am'`, `levelId: 'moyen'`). L'ancienne
  // heuristique dérivait l'identifiant du LIBELLÉ français (`3ème` → `3e`,
  // défaut `'3e'`) — sur un libellé arabe elle produisait une URL en arabe
  // ou retombait sur une classe française. On ne devine plus : sans
  // identifiant explicite, le lien est simplement omis.
  const gradeId = gradeIdProp ?? null;
  const levelParam = levelId ?? null;

  // Le lien du fil d'Ariane, construit à partir des seuls identifiants
  // RÉELLEMENT fournis : interpoler un `null` donnait `?level=null&grade=null`,
  // une URL que le catalogue ne sait pas lire. Sans aucun identifiant, on
  // pointe vers le catalogue nu.
  // L'élève va à « دروسي », les autres au catalogue public (catalogueLink.js).
  const catalogueLink = (extra) => catalogueHref({ level: levelParam, grade: gradeId, chapter: extra });

  // Protection de route : un module verrouillé ne s'affiche jamais, même en
  // tapant son URL directement. Aucune navigation, aucune écriture de
  // progression ne se produit pour un module inaccessible.
  if (premiumLocked) {
    return (
      <LessonChromeContext.Provider value={chrome}>
        <div className={`min-h-screen flex flex-col justify-between ${chrome.contentOffsetClass} bg-slate-50`}>
          <PremiumLessonLocked
            title={courseTitle}
            crumbs={(
              <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 mb-8">
                <Link to={coursePath} className="hover:text-blue-600">{courseTitle}</Link>
                {moduleTitle ? <><span>/</span><span className="text-slate-900 font-semibold"><MathLabel>{moduleTitle}</MathLabel></span></> : null}
              </nav>
            )}
          />
        </div>
      </LessonChromeContext.Provider>
    );
  }

  // Mode mission : l'élève ne voit JAMAIS l'ancienne page « مقفل » — un module fermé le renvoie à la mission (sa carte
  // montre la même serrure). Propriétaire, 2026-11-04 : l'élève n'a pas accès à l'ancienne version.
  if (!unlocked && play) return <Navigate to={coursePath} replace />;
  if (!unlocked) {
    return (
      <LessonChromeContext.Provider value={chrome}>
      <div className={`min-h-screen flex flex-col justify-between ${chrome.contentOffsetClass} bg-slate-50`}>
        <main className="sa-page py-8 flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-white border-2 border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-space font-extrabold text-slate-900">{t('nav.moduleLocked')}</h1>
              <p className="text-sm text-slate-500 mt-2">
                {t('nav.lockedReason', {
                  module: lockedReasonData(moduleNumber).previousModule,
                  threshold: lockedReasonData(moduleNumber).threshold,
                })}
              </p>
            </div>
            <Link
              to={coursePath}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none"
            >
              <ArrowLeft size={16} aria-hidden="true" /> {t('nav.backToPath')}
            </Link>

            {/* Le signalement existe AUSSI ici : « ce module ne devrait pas
                être verrouillé » est précisément le genre de problème qu'on
                veut apprendre. Ce composant a deux sorties — un bouton posé
                dans une seule disparaîtrait sans bruit dans l'autre. */}
            <div className="pt-2">
              <ReportButton
                source="module"
                variant="link"
                context={{
                  lessonCode: lessonId,
                  grade: gradeId,
                  moduleNumber,
                  step: 'module-verrouille',
                }}
              />
            </div>
          </div>
        </main>
        <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 mt-12">
          <p>© {new Date().getFullYear()} Abdennour BOUHOUNALI — {t('common:footerRole')}</p>
        </footer>
      </div>
      </LessonChromeContext.Provider>
    );
  }

  if (play) {
    // Les MÊMES gestes que la barre du bas de la page : terminer écrit la complétion par commitCompletion / handleNextClick.
    const next = isLastModule ? (
      isCompleted ? (
        <Link to={coursePath} onClick={commitCompletion} data-mission-finish
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-emerald-600 px-5 font-black text-white shadow-sm hover:bg-emerald-700">
          {t('nav.finish')} <CheckCircle size={16} aria-hidden="true" />
        </Link>
      ) : (
        <IncompleteStepsHint label={t('nav.finish')} icon={<CheckCircle size={16} aria-hidden="true" />} incompleteSteps={incompleteSteps} onStepClick={scrollToStep} />
      )
    ) : nextLink ? (
      <button type="button" onClick={handleNextClick} data-mission-next-module
        className="sa-mission-ready inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-gradient-to-l from-indigo-600 to-violet-600 px-5 font-black text-white shadow-sm hover:from-indigo-700 hover:to-violet-700">
        {t('mission.nextStation')} <ArrowLeft size={16} aria-hidden="true" />
      </button>
    ) : (
      <IncompleteStepsHint label={t('mission.nextStation')} icon={<ArrowLeft size={16} aria-hidden="true" />} incompleteSteps={incompleteSteps} onStepClick={scrollToStep} />
    );
    return (
      <LessonChromeContext.Provider value={chrome}>
      <StudentFocusProvider studentView={studentView}>
        <MissionPlayer
          top={<MissionLayer config={missionConfig} moduleNumber={moduleNumber} basePath={coursePath} />}
          title={<MathLabel>{moduleTitle}</MathLabel>}
          more={(
            // Plus de « المزيد » dans le lecteur : la durée et le sous-titre en UNE petite ligne sous le titre.
            <p className="w-full truncate text-center text-xs text-slate-500" data-mission-subtitle>
              <span aria-hidden="true">⏱️</span> {estimatedTime || `5 ${t('nav.minutesShort')}`}
              {moduleSubtitle ? <> · <MathLabel>{moduleSubtitle}</MathLabel></> : null}
            </p>
          )}
          exitTo={coursePath}
          exitLabel={t('mission.exitToMission')}
          moduleNav={{ prevLink, next }}
        >
          {children}
        </MissionPlayer>
      </StudentFocusProvider>
      </LessonChromeContext.Provider>
    );
  }

  return (
    <LessonChromeContext.Provider value={chrome}>
    <StudentFocusProvider studentView={studentView}>
    <div
      className={presenting ? 'sa-classroom-module-page' : `min-h-screen flex flex-col justify-between ${chrome.contentOffsetClass} bg-slate-50`}
      data-module-presented={presenting ? moduleNumber : undefined}
    >
      <main className={presenting ? 'sa-classroom-module-main' : 'sa-page py-8 flex-1 space-y-8'}>

        {/* Navigation Header */}
        {!presenting && <div className="flex justify-between gap-4 mb-4 flex-row items-center">
          <nav
            className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500"
            aria-label={t('nav.breadcrumb')}
            data-tour="lesson.path"
          >
            {/* TROIS niveaux : الوحدة / الدرس / المحور.
                L'accueil et le niveau scolaire en ont été retirés — l'élève
                sait dans quelle classe il est, et le chemin de retour vers
                le catalogue reste dans la barre latérale. Ce qui l'aide ici,
                c'est de savoir OÙ il se trouve dans le manuel.

                L'الوحدة est le groupe de leçons du manuel, jamais le المجال
                (domaine) ni un المحور (LESSON_DEVELOPMENT_GUIDE §2). Une
                leçon qui n'en déclare pas retombe sur son المجال, pour ne jamais rendre un fil d'Ariane
                à deux niveaux. */}
            {unitTitle && unitPath ? (
              <Link to={unitPath} className="hover:text-blue-600">{unitTitle}</Link>
            ) : (
              chapter && chapterTitle && <Link to={catalogueLink(chapter)} className="hover:text-blue-600">{chapterTitle}</Link>
            )}
            <span aria-hidden="true">/</span>
            <Link to={coursePath} className="hover:text-blue-600">{courseTitle}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-900 font-semibold" aria-current="page">
              {String(moduleNumber).padStart(2, '0')}. <MathLabel>{moduleTitle}</MathLabel>
            </span>
          </nav>

          {/* La rangée ENVELOPPE au lieu de comprimer : avec « المختبر » et
              « وضع القسم » à côté des XP, un écran étroit manquerait de place
              et écraserait les pastilles (un libellé sur deux lignes, une
              cible tactile rétrécie). Elles passent à la ligne, entières. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 self-auto">
            {/* 🧪 المختبر — un instrument de mathématiques, ouvert SUR la
                leçon sans la quitter. Ici, avec les autres repères du
                module : toujours atteignable (la rangée est `sticky`) et
                jamais devant le contenu, contrairement à une pastille
                flottante. Voir MathLabEntryButton. Il s'ouvre sur le مخبر
                de la leçon (`levelId` : « moyen » pour une leçon de 4AM). */}
            <MathLabEntryButton scope={levelId} />

            {/* 🎓 وضع القسم — le point d'entrée du mode classe, visible du
                seul présentateur (canPresentClassroom). DANS la rangée de
                repères, à côté de « المختبر » : l'enseignant y trouve ses
                deux outils au même endroit, en haut, sans dérouler — et la
                colonne flottante du bas se vide d'autant.

                La portée est « lesson », PAS « module », et le libellé est
                celui du sommaire : il n'y a qu'un seul وضع القسم, où qu'on
                l'ouvre. Une séance de portée module ne connaissait pas ses
                voisins — `lessonNav` est nul hors portée leçon — donc
                « التالي » s'arrêtait au bout du محور et l'enseignant devait
                sortir de la séance pour passer au suivant. La coquille qui
                répond ici est déjà LessonClassroomShell (montée au-dessus de
                chaque route de module), donc il suffit de le lui dire. */}
            <ClassroomEntryButton
              scope="lesson"
              title={courseTitle ?? moduleTitle}
              tone="quiet"
              className="!px-3 !py-1.5 !text-xs !rounded-full"
            />

            <div className="flex items-center gap-2" data-tour="lesson.progress">
              <span className="text-xs font-mono text-blue-600 font-bold">
                {t('nav.module')}{' '}
                <span dir="ltr">{modulePosition}{'\u00A0/\u00A0'}{totalModules}</span>
              </span>
              <div
                className="h-2 bg-slate-200 rounded-full overflow-hidden w-24"
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('nav.progressAria', { pct: progressPct })}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-blue-500"
                />
              </div>
            </div>
            {/* « الإبلاغ عن مشكل » EN HAUT, à côté des repères (2026-10-05) :
                seuls les relecteurs (admin, سفير) le voient, et ils doivent le
                trouver sans dérouler jusqu'au pied de page. */}
            <ReportButton
              source="module"
              variant="prominent"
              context={{
                lessonCode: lessonId,
                grade: gradeId,
                moduleNumber,
                step: moduleTitle,
              }}
            />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-mono text-xs font-bold shrink-0 shadow-sm">
              <span id="xpCount">{xp || 0}</span>
              <span aria-label={t('nav.experiencePoints')}>XP</span>
            </div>

</div>
        </div>}

        {/* Le fil de MISSION (mode mission, élève seulement) : barre, carte, point d'étape à l'arrivée. */}
        {!presenting && lessonId && <MissionLayer config={missionConfig} moduleNumber={moduleNumber} basePath={coursePath} />}

        {/* Module Header */}
        {!presenting && <header className="space-y-2 text-center" data-tour="lesson.module">
          {!focus && <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold">
            <span aria-hidden="true">⏱️</span>
            {estimatedTime || `5 ${t('nav.minutesShort')}`} · {t('nav.module')} {moduleNumber}
          </div>}
          <h1 className="text-3xl font-space font-extrabold text-slate-900"><MathLabel>{moduleTitle}</MathLabel></h1>
          {/* Relecteur seulement (admin, سفير) : l'état de la leçon et du module. */}
          {lessonId && (
            <div className="flex flex-wrap justify-center gap-2">
              <PublicationBadge status={lessonStatus(lessonId)} />
              {hasModuleNumber && <PublicationBadge status={moduleStatus(lessonId, moduleNumber)} />}
            </div>
          )}
          {focus ? (
            // Regard « focus » : le titre seul à l'écran ; la durée et le sous-titre à un geste, jamais supprimés.
            <MoreToggle className="flex flex-col items-center">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold">
                  <span aria-hidden="true">⏱️</span>
                  {estimatedTime || `5 ${t('nav.minutesShort')}`} · {t('nav.module')} {moduleNumber}
                </div>
                <p className="text-slate-600 max-w-xl mx-auto text-sm">
                  <MathLabel>{moduleSubtitle}</MathLabel>
                </p>
              </div>
            </MoreToggle>
          ) : (
            <p className="text-slate-600 max-w-xl mx-auto text-sm">
              <MathLabel>{moduleSubtitle}</MathLabel>
            </p>
          )}
        </header>}

        {/* Module Content — le même élément dans les deux modes. */}
        <div className={presenting ? 'sa-classroom-module-content' : 'space-y-8'}>
          {presentationFrame ? <ClassroomFrame>{children}</ClassroomFrame> : children}
        </div>

        {/* « Signaler un problème » — présent sur CHAQUE module, parce qu'il
            est ici, dans le shell partagé, et non recopié dans 1082 modules.
            Le contexte est pris de ce que ModuleLayout a déjà en portée :
            l'élève n'a rien à désigner. */}
        {/* Bottom Navigation */}
        {!presenting && <div className="flex justify-between items-center pt-8 pb-4" data-tour="lesson.moduleNav">
          {prevLink ? (
            <Link
              to={prevLink}
              className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-mono text-xs font-bold transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none"
            >
              <ArrowRight size={16} aria-hidden="true" /> {t('nav.previous')}
            </Link>
          ) : <div />}

          {isLastModule ? (
            isCompleted ? (
              <Link
                to={coursePath}
                onClick={commitCompletion}
                className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl font-mono text-xs font-bold shadow-md transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 focus:outline-none bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {t('nav.finish')} <CheckCircle size={16} aria-hidden="true" />
              </Link>
            ) : (
              <IncompleteStepsHint
                label={t('nav.finish')}
                icon={<CheckCircle size={16} aria-hidden="true" />}
                incompleteSteps={incompleteSteps}
                onStepClick={scrollToStep}
              />
            )
          ) : nextLink ? (
            <button
              type="button"
              onClick={handleNextClick}
              className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-mono text-xs font-bold shadow-md transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none"
            >
              {t('nav.nextModule')} <ArrowLeft size={16} aria-hidden="true" />
            </button>
          ) : (
            <IncompleteStepsHint
              label={t('nav.nextModule')}
              icon={<ArrowLeft size={16} aria-hidden="true" />}
              incompleteSteps={incompleteSteps}
              onStepClick={scrollToStep}
            />
          )}
        </div>}

      </main>

      {/* « Signaler un problème » est dans la rangée de repères EN HAUT
          (variante « prominent », relecteurs seulement) depuis 2026-10-05 ;
          le pied de page ne porte plus que la mention. */}
      {!presenting && <footer className="border-t border-slate-200 bg-white py-8 mt-12">
        <div className="sa-page flex justify-center">
          <p className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Abdennour BOUHOUNALI — {t('common:footerRole')}
          </p>
        </div>
      </footer>}
    </div>
    </StudentFocusProvider>
    </LessonChromeContext.Provider>
  );
}

/**
 * Disabled next/finish button + "what's left" popover. A disabled button
 * with no explanation just tells a student "no" — this tells them exactly
 * which step(s) to go back and complete, and jumps straight there on click.
 * Falls back to a plain disabled button (no popover) if the module didn't
 * pass `incompleteSteps` — never breaks a module that hasn't adopted it yet.
 */
function IncompleteStepsHint({ label, icon, incompleteSteps, onStepClick }) {
  const { t } = useTranslation('lesson');
  const [open, setOpen] = useState(false);
  const steps = incompleteSteps?.filter(Boolean) ?? [];

  if (steps.length === 0) {
    return (
      <button
        type="button"
        disabled
        className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-slate-200 text-slate-400 font-mono text-xs font-bold shadow-sm cursor-not-allowed"
      >
        {label} {icon}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-describedby="incomplete-steps-hint"
        className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-slate-200 text-slate-500 font-mono text-xs font-bold shadow-sm hover:bg-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        {label} {icon}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="incomplete-steps-hint"
            role="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute bottom-full end-0 mb-2 w-72 max-w-[90vw] rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 shadow-lg text-start z-10"
          >
            <div className="flex items-center gap-2 text-amber-800 font-space font-bold text-sm mb-2">
              <ListChecks className="w-4 h-4 shrink-0" aria-hidden="true" />
              {t('nav.toFinishBeforeContinuing')}
            </div>
            <ul className="space-y-1.5">
              {steps.map((step) => (
                <li key={step.num}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onStepClick(step.num);
                    }}
                    className="w-full text-start px-3 py-2 rounded-lg bg-white border border-amber-200 text-xs font-semibold text-amber-900 hover:border-amber-400 hover:bg-amber-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    {t('step.label')} {step.num} — <MathLabel>{step.title}</MathLabel>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
