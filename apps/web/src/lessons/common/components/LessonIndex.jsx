import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Compass } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { lockedReasonData, getLessonById, getUnitById } from '@smarter-academy/core';
import PremiumLessonLocked from './PremiumLessonLocked';
import { resolveModuleStatus } from '../utils/moduleGate';
import PublicationBadge from '../../../components/content/PublicationBadge';
import { softGateHint, masteryStatusByIdFromProfile } from '../utils/softGate';
import { getModulePath } from '../../registry';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import { useLearningProfile } from '../hooks/useLearningProfile';
import { useLessonChromeLayout } from '../hooks/useLessonChrome';
import { resolveMasteryState, masteryTooltip } from './LearningPointMastery';
import { calculateCompletionPercentage } from '@smarter-academy/core';
// Le moteur d'exercices n'est activé que pour les leçons listées dans
// content/practice/active.json : pour toutes les autres, isPracticeActive
// renvoie false et cette carte ne rend rien du tout.
import { isPracticeActive } from '../../../features/practice/practiceCapability';
import PracticeEntryCard from '../../../features/practice/PracticeEntryCard';
import ReportButton from '../../../features/reports/ReportButton';
import { useContentAvailability } from '../../../context/ContentAvailabilityContext';
import { useClassroomMode, useClassroomStage, ClassroomEntryButton, ClassroomFrame } from '../classroom';
import MathLabEntryButton from '../../../features/mathlab/overlay/MathLabEntryButton';
import MathLabel from './MathLabel';
import PrerequisiteLessonChips from './PrerequisiteLessonChips';
import LessonProblemCard from '../problems/LessonProblemCard';
import { StudentFocusProvider, MoreToggle, isStudentFocus } from './StudentFocus';
import MissionHome from '../mission/MissionHome';
import MissionPlayer from '../mission/MissionPlayer';
import { isMissionView } from '../mission/missionModel';

// LE MONDE DE JEU : la leçon nomme son monde dans SON paquet (`lesson.pack.js › world`, LESSON_V2.md) ; un morceau paresseux, jamais
// dans le paquet d'entrée (three.js).
// « مختبري » : le laboratoire de la leçon (ses instruments + ceux des leçons PRÉCÉDENTES de toutes les années) — `?lab=1`.
const LessonLab = lazy(() => import('../lessonlab/LessonLab'));
const TeacherLessonPanel = lazy(() => import('../../../features/classSession/TeacherLessonPanel'));
const LessonToolsBar = lazy(() => import('../../../features/classSession/LessonToolsBar'));
import { hasClassBoard } from '../../../features/classSession/boardLessons';
const LessonGameWorld = lazy(() => import('../gameworld/LessonGameWorld'));
import { lessonPackFlags } from '../../registry';
import WorldLoading from '../gameworld/WorldLoading';
import { TeacherPanelSkeleton } from '../../../features/classSession/TeacherSkeletons';
import { mathToPlain } from '../../../utils/mathPlain';
import { hasLab } from '../lessonlab/registry';
import { useCatalogueHref } from '../../../components/student/catalogueLink';
import { useDeclarePageTour } from '../../../features/tours/PageTourProvider';
import { prefetchLessonStringsWhenIdle } from '../lessonRuntimeLoader';

/**
 * Static color map — replaces dynamic `bg-${color}-100` patterns.
 * Tailwind cannot purge dynamically interpolated class names at build time.
 * All variants here are kept as full strings so Tailwind can detect them.
 */
const MASTERY_DOT = {
  unassessed: 'bg-slate-300',
  gap: 'bg-rose-500',
  reinforce: 'bg-amber-400',
  mastered: 'bg-emerald-500',
};

const COLOR_MAP = {
  emerald: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    hoverBorder: 'hover:border-emerald-400',
    hoverText: 'group-hover:text-emerald-600',
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    hoverBorder: 'hover:border-indigo-400',
    hoverText: 'group-hover:text-indigo-600',
  },
  violet: {
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    hoverBorder: 'hover:border-violet-400',
    hoverText: 'group-hover:text-violet-600',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    hoverBorder: 'hover:border-blue-400',
    hoverText: 'group-hover:text-blue-600',
  },
  // Les deux « أستعدّ » de l'unité 1 déclarent `teal` : absent, il retombait
  // en silence sur `slate`.
  teal: {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    hoverBorder: 'hover:border-teal-400',
    hoverText: 'group-hover:text-teal-600',
  },
  sky: {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    hoverBorder: 'hover:border-sky-400',
    hoverText: 'group-hover:text-sky-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    hoverBorder: 'hover:border-purple-400',
    hoverText: 'group-hover:text-purple-600',
  },
  cyan: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    hoverBorder: 'hover:border-cyan-400',
    hoverText: 'group-hover:text-cyan-600',
  },
  rose: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    hoverBorder: 'hover:border-rose-400',
    hoverText: 'group-hover:text-rose-600',
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    hoverBorder: 'hover:border-amber-400',
    hoverText: 'group-hover:text-amber-600',
  },
  slate: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    hoverBorder: 'hover:border-slate-400',
    hoverText: 'group-hover:text-slate-600',
  },
};

function getColor(color, variant) {
  return COLOR_MAP[color]?.[variant] ?? COLOR_MAP.slate[variant];
}

/**
 * LessonIndex — composant générique de page d'accueil d'une leçon.
 *
 * Reçoit une config (LESSON_CONFIG) et affiche :
 *  - le hero de la leçon avec progression
 *  - la liste des modules avec leur état (fait / à faire)
 *
 * Ce composant est réutilisable pour TOUTES les leçons de Smarter Academy.
 * Il suffit de lui passer le bon LESSON_CONFIG et le LESSON_BASE_PATH.
 */
export default function LessonIndex({ config, basePath }) {
  const { t: ts } = useTranslation('student');
  // Le sommaire ne lit aucun texte de lab ; ses modules, si. On les précharge
  // une fois le sommaire affiché : le clic sur un module ne les attend plus.
  // …sauf pour une leçon v2 : son accueil est un monde, elle n'a plus de page de module — ces ≈ 440 Ko gzip
  // disputaient la bande passante à three.js au moment exact où le monde se charge (mesuré le 2026-11-21).
  useEffect(() => {
    if (!lessonPackFlags(config.id).world) prefetchLessonStringsWhenIdle();
  }, [config.id]);
  const catalogueLesson = getLessonById(config.id);
  const unit = config.unit ? getUnitById(config.unit) : null;
  const prereqLessons = (catalogueLesson?.prerequisiteLessonCodes ?? [])
    .map((code) => getLessonById(code))
    .filter(Boolean);
  // Le profil de CETTE leçon seulement (`?lesson=`, Mastery V2). Le `status`
  // du chargement est rendu (squelette / erreur / rien pour l'anonyme) :
  // « لم تُقيَّم بعد » ne s'affiche que lorsque le profil est vraiment lu.
  const { profile, status: profileStatus } = useLearningProfile({ lesson: config.id });
  // Le décalage haut suit la coquille réelle (Navbar visiteur / rien sur le
  // bureau élève) — même contrat que ModuleLayout, jamais un pt-16 écrit à la main.
  const chrome = useLessonChromeLayout();
  // Le profil est imbriqué par classe puis par leçon (cf. LearningPointMastery.findLessonMasteryRows).
  const masteryRows = new Map(
    (profile?.currentMastery ?? [])
      .flatMap((g) => (g.lessons ?? []).flatMap((l) => l.learningPoints ?? []))
      .map((row) => [row.code ?? row.learningPointCode ?? row.learning_point_code, row]),
  );
  // `code → status` pour les portes de maîtrise DOUCES (softGate.js) : un
  // conseil sous la carte, jamais un verrou.
  const masteryStatusById = useMemo(() => masteryStatusByIdFromProfile(profile), [profile]);
  const { t } = useTranslation('lesson');
  const catalogueHref = useCatalogueHref();
  const { completedModules, isModuleCompleted, currentModule, markModuleCompleted } = useProgress(config.id);
  const [searchParams, setSearchParams] = useSearchParams();
  // « مختبري » (2026-11-16) : ouvert par `?lab=1` sur n'importe quelle leçon qui a au moins un instrument atteint.
  const labAvailable = hasLab(config.id);
  const setLab = (on) =>
    setSearchParams(
      (p) => {
        const n = new URLSearchParams(p);
        if (on) n.set('lab', '1');
        else n.delete('lab');
        return n;
      },
      { replace: !on },
    );
  const labLayer =
    labAvailable && searchParams.get('lab') === '1' ? (
      <Suspense fallback={null}>
        <LessonLab lessonCode={config.id} lessonTitle={mathToPlain(config.title)} onClose={() => setLab(false)} />
      </Suspense>
    ) : null;
  const { isModuleClosed, isLessonClosed, isLessonLocked, isLessonHiddenByClass, lessonStatus, moduleStatus } =
    useContentAvailability();
  // QUI lit : l'enseignant voit chaque module ouvert (le verrou séquentiel
  // est un guide pour l'élève) ; un module retiré reste fermé pour tous.
  const viewer = useLearningViewer();

  // MODE CLASSE (وضع القسم) — 🎓 depuis le sommaire : la leçon entière, du
  // mdkhal (cette page, en mise en page de projection) au dernier module,
  // avec « التالي » vers le premier module. La coquille est celle de la
  // leçon (LessonClassroomShell, au-dessus des routes) ; cette page ne fait
  // que déclarer son titre et son geste, et se présenter autrement.
  const classroom = useClassroomMode();
  const presenting = classroom.isClassroomMode;
  // Regard « focus » de l'élève : le titre, la progression et UN bouton « واصل » ; le reste dans « تفاصيل الدرس ».
  const focus = isStudentFocus(config.studentView, viewer, classroom);
  // Mode mission (élève) : l'accueil EST la mission, et l'élève n'a JAMAIS accès à cette page (propriétaire, 2026-11-04) —
  // ce qu'elle offrait (détails, prérequis, تمارين) est dans la mission (MissionHome).
  const missionOn = Boolean(config.mission) && isMissionView(config.studentView, viewer, classroom);
  const lessonNav = classroom.lessonNavigation;
  // Le sommaire présenté tient en DEUX écrans — l'identité de la leçon (titre,
  // description, ce qu'on y apprend) puis مسار الدرس — au lieu d'un écran
  // surchargé : التالي passe de l'un à l'autre avant le premier محور.
  const [overviewPage, setOverviewPage] = useState(0);
  // Regard « focus » : les descriptions des محاور, affichées sur demande.
  const [showDesc, setShowDesc] = useState(false);
  const lessonNext = lessonNav?.next ?? undefined;
  const lessonPrevious = lessonNav?.previous ?? undefined;
  const overviewNext = useMemo(
    () => (overviewPage === 0 ? () => setOverviewPage(1) : lessonNext),
    [overviewPage, lessonNext],
  );
  const overviewPrevious = useMemo(
    () => (overviewPage === 1 ? () => setOverviewPage(0) : lessonPrevious),
    [overviewPage, lessonPrevious],
  );
  const overviewSlot = useMemo(
    () => (
      <>
        <span className="sa-classroom-position" data-classroom-position data-classroom-overview-page={overviewPage}>
          {t('classroom.positionOverview')}
        </span>
        <span className="sa-classroom-position" dir="ltr">
          {overviewPage + 1} / 2
        </span>
      </>
    ),
    [t, overviewPage],
  );
  useClassroomStage(
    { title: config.title, onPrevious: overviewPrevious, onNext: overviewNext, slot: overviewSlot, priority: 1 },
    presenting,
  );
  // « جولة تعريفية » du sommaire de leçon — l'URL change d'une leçon à
  // l'autre, la page se déclare. Jamais en وضع القسم (docs/architecture/PAGE_TOURS.md).
  // …ni sur une leçon qui a son tableau : sa page n'a plus les sections que cette visite décrit (LESSON_V2_MASTER_PLAN §4bis B9).
  useDeclarePageTour('lesson-index', !presenting && !hasClassBoard(config.id));

  const totalModules = config.modules.length;
  const completedCount = completedModules.length;
  const pct = calculateCompletionPercentage(completedModules, totalModules);
  // Avec le déverrouillage séquentiel, le PARCOURS de la leçon n'est achevé
  // que lorsque TOUS les modules sont validés (pas seulement masteryThreshold
  // d'entre eux) — voir lessonAccess.js. Les leçons qui n'activent pas
  // sequentialUnlock gardent leur seuil existant, inchangé.
  //
  // C'est une COMPLÉTION (des modules parcourus), jamais une maîtrise : la
  // maîtrise des الكفاءات vient du profil serveur, plus bas. Le mot
  // إتقان n'apparaît donc nulle part ici.
  // Le PREMIER module de CETTE leçon : 0 quand elle ouvre par un diagnostic
  // (« أستعدّ »), 1 sinon. Sans cela, un module 0 était traité comme
  // « pas le premier » et exigeait un module -1 inexistant.
  // PORTE DOUCE (phase 8b) : quand un module exige des points encore en
  // lacune, la carte reste OUVERTE et une ligne ambre conseille de revoir
  // d'abord le(s) module(s) qui les enseignent. Rien pour l'enseignant (il ne
  // suit pas de progression) ni en présentation.
  const withSoftGateHint = (module, card) => {
    if (!card || viewer.freeNavigation || presenting) return card;
    const hint = softGateHint(module, masteryStatusById, config.modules);
    if (!hint.show) return card;
    const lpTitle = (id) =>
      masteryRows.get(id)?.title || catalogueLesson?.learningPoints?.find((lp) => lp.id === id)?.title || id;
    const titles = hint.learningPointIds.map(lpTitle).join(t('index.softGateTitlesSeparator'));
    return (
      <div key={module.id} className="space-y-1.5" data-soft-gate={module.number}>
        {card}
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
          role="note"
        >
          <span>{t('index.softGateHint', { titles })}</span>
          {hint.recommendedModules.map((m) => {
            const path = m.slug ? `${basePath}/${m.slug}` : getModulePath(config.id, m.number);
            const label = t('index.softGateModuleLink', { number: String(m.number).padStart(2, '0'), title: m.title });
            return path ? (
              <Link
                key={m.id ?? m.number}
                to={path}
                className="font-bold underline underline-offset-2 hover:text-amber-700"
              >
                <MathLabel>{label}</MathLabel>
              </Link>
            ) : (
              <span key={m.id ?? m.number} className="font-bold">
                {label}
              </span>
            );
          })}
        </div>
      </div>
    );
  };
  const firstModuleNumber = Math.min(...config.modules.map((m) => Number(m.number)).filter(Number.isFinite));

  const isPathComplete = config.sequentialUnlock
    ? totalModules > 0 && completedCount === totalModules
    : pct >= Math.round(config.masteryThreshold * 100);

  // Leçon PUBLIÉE mais hors du droit d'accès de cet élève : arrivé ici par
  // l'URL, il voit ce qui lui manque plutôt que le sommaire.
  //
  // C'est de l'AFFICHAGE, pas de l'autorisation : le serveur refuse déjà
  // toute écriture sur cette leçon (ContentAccess). Retirer ce bloc dans le
  // navigateur ne rendrait donc rien d'autre qu'un sommaire inerte — aucun
  // module ne s'enregistrerait, aucun exercice ne se listerait.
  //
  // Aucun détail du contenu n'est rendu : ni titre de module, ni progression.
  if (presenting) {
    return (
      <div className="sa-classroom-lesson-page" data-lesson-presented={config.id}>
        <ClassroomFrame maxWidth={1180}>
          <div className="sa-classroom-lesson-overview sa-classroom-lesson-overview--split">
            <section
              hidden={overviewPage !== 0}
              data-lesson-overview-page="0"
              className="rounded-3xl border-2 border-indigo-200 bg-white p-8 space-y-5"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-xs font-semibold text-blue-700">
                {config.emoji} {config.chapterTitle || config.chapter}
              </div>
              <h1 className="font-space text-4xl font-extrabold leading-tight text-slate-900">
                <MathLabel>{config.title}</MathLabel>
              </h1>
              {config.description && (
                <p className="text-lg leading-relaxed text-slate-700">
                  <MathLabel>{config.description}</MathLabel>
                </p>
              )}
              {config.skills && (
                <div className="space-y-2">
                  <h2 className="text-base font-bold text-slate-800">{t('classroom.lessonSkills')}</h2>
                  <ul className="space-y-1.5">
                    {config.skills.map((skill, i) => (
                      <li key={i} className="flex items-start gap-2 text-base text-slate-700">
                        <span className="mt-0.5 text-blue-400">▸</span>
                        <span>
                          <MathLabel>{skill}</MathLabel>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
            <section
              hidden={overviewPage !== 1}
              data-lesson-overview-page="1"
              className="rounded-3xl border-2 border-slate-200 bg-white p-6 space-y-3"
              data-lesson-roadmap
            >
              <h2 className="text-base font-bold text-slate-800">{t('classroom.lessonPath')}</h2>
              <ol className="space-y-2">
                {config.modules.map((module) => (
                  <li key={module.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${getColor(module.color, 'bg')} ${getColor(module.color, 'text')}`}
                    >
                      {String(module.number).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <div className="font-space font-bold text-slate-900">
                        <MathLabel>{module.title}</MathLabel>
                      </div>
                      <div className="text-sm text-slate-500">
                        <MathLabel>{module.desc}</MathLabel>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </ClassroomFrame>
      </div>
    );
  }

  // NON PUBLIÉE : la carte la montrait déjà « bientôt », mais l'URL directe
  // ouvrait le sommaire. Jamais vrai pour un relecteur (admin, سفير) : son
  // inventaire ne ferme rien, il voit la leçon avec sa pastille d'état.
  if (isLessonClosed(config.id)) {
    return (
      <div className={`min-h-screen flex flex-col justify-between ${chrome.contentOffsetClass} bg-slate-50`}>
        <main className="sa-page py-8 flex-1">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 mb-8">
            <Link to={catalogueHref()} className="hover:text-blue-600">
              {t('index.home')}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">
              <MathLabel>{config.title}</MathLabel>
            </span>
          </nav>
          <div
            className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs"
            data-lesson-unpublished
          >
            <h1 className="font-space text-xl font-bold text-slate-800 mb-2">{t('index.unavailableTitle')}</h1>
            <p className="font-inter text-sm leading-relaxed text-slate-600 mb-6">{t('index.unavailableHint')}</p>
            <Link
              to={catalogueHref()}
              className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-5 py-2.5 font-inter text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              {t('index.home')}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Masquée par l'ENSEIGNANT pour la classe de l'élève : le serveur refuse
  // déjà toute écriture ; cet écran l'explique avec les bons mots (ni
  // « premium », ni « indisponible »).
  if (isLessonHiddenByClass(config.id)) {
    return (
      <div className={`min-h-screen flex flex-col justify-between ${chrome.contentOffsetClass} bg-slate-50`}>
        <main className="sa-page py-8 flex-1">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 mb-8">
            <Link to={catalogueHref()} className="hover:text-blue-600">
              {t('index.home')}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">
              <MathLabel>{config.title}</MathLabel>
            </span>
          </nav>
          <div
            className="mx-auto max-w-lg rounded-2xl border border-teal-200 bg-teal-50/50 p-8 text-center shadow-xs"
            data-hidden-by-teacher
          >
            <h1 className="font-space text-xl font-bold text-slate-800 mb-2">
              <MathLabel>{config.title}</MathLabel>
            </h1>
            <p className="font-inter text-sm leading-relaxed text-slate-600 mb-6">
              {t('hiddenByTeacherHint', { ns: 'access' })}
            </p>
            <Link
              to="/espace/qism"
              className="inline-flex items-center gap-1 rounded-xl bg-teal-700 px-5 py-2.5 font-inter text-sm font-bold text-white transition-colors hover:bg-teal-800"
            >
              {t('myClass', { ns: 'nav' })}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (isLessonLocked(config.id)) {
    return (
      <div className={`min-h-screen flex flex-col justify-between ${chrome.contentOffsetClass} bg-slate-50`}>
        <PremiumLessonLocked
          title={config.title}
          crumbs={
            <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 mb-8">
              <Link to={catalogueHref()} className="hover:text-blue-600">
                {t('index.home')}
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">
                <MathLabel>{config.title}</MathLabel>
              </span>
            </nav>
          }
        />
      </div>
    );
  }

  // Le monde de jeu EST l'accueil d'une leçon v2 pour l'ÉLÈVE (LESSON_V2.md §2) : ni lecteur de mission, ni pages de module
  // (supprimées ; leurs adresses renvoient ici), ni `?view=classic` (retiré le 2026-11-18, ordre du propriétaire).
  // « جرّب كتلميذ » : l'enseignant ouvre le monde de l'élève en APERÇU (`?apercu=eleve`) — rien n'est enregistré ni envoyé (CLASS_SESSION.md §2).
  const pack = lessonPackFlags(config.id);
  const teacherCard = viewer.isTeacher && !presenting && Boolean(pack.board || pack.world);
  // The TEACHER of a lesson that has its board (owner, 2026-11-18: « no need for these any more »): his page is the title and
  // his card « للأستاذ » — the old sections of the lesson home (progress, الكفاءات / المتطلبات / المناولات, مسألة الدرس,
  // مسار المحاور) are not shown to him. The other lessons are untouched; a v2 lesson's module addresses redirect to this page (its module pages are deleted).
  // …and the TEACHER of a lesson that has a WORLD, board or not (owner, 2026-11-20, on the unit's last lesson: « the old lesson
  // still exists »): its module pages are deleted, so their list, the old situations and the progress by module are not shown.
  const teacherBoard = teacherCard && (hasClassBoard(config.id) || Boolean(pack.world));
  const previewAsStudent =
    viewer.freeNavigation && !presenting && searchParams.get('apercu') === 'eleve' && Boolean(pack.world);
  const studentWorld = !viewer.freeNavigation && !presenting;
  const worldId = studentWorld || previewAsStudent ? (pack.world ?? null) : null;
  if (worldId) {
    return (
      <Suspense fallback={<WorldLoading lessonId={config.id} title={config.title} />}>
        <LessonGameWorld
          worldId={worldId}
          config={config}
          basePath={basePath}
          exitTo={
            previewAsStudent
              ? basePath
              : catalogueHref({ level: config.level, grade: config.grade, chapter: config.chapter })
          }
          onModule={(n) => {
            if (!previewAsStudent) markModuleCompleted(String(n));
          }}
          completedModules={completedModules}
          preview={previewAsStudent}
          mastery={Object.keys(masteryStatusById ?? {}).length ? masteryStatusById : null}
        />
      </Suspense>
    );
  }

  if (missionOn) {
    return (
      <StudentFocusProvider studentView={config.studentView}>
        <MissionPlayer
          exitTo={catalogueHref({ level: config.level, grade: config.grade, chapter: config.chapter })}
          exitLabel={t('mission.exitToLessons')}
        >
          <MissionHome config={config} basePath={basePath} onLab={labAvailable ? () => setLab(true) : null} />
        </MissionPlayer>
        {labLayer}
      </StudentFocusProvider>
    );
  }

  // Le module où l'élève reprend : le premier non terminé (focus seulement).
  const resumeModule = config.modules.find(
    (m) => !(isModuleCompleted(m.id) || isModuleCompleted(m.number?.toString())),
  );

  // La ligne « مجال • محاور • مدة » : en tête hors focus, dans « تفاصيل الدرس » en focus.
  const lessonChip = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-semibold">
        {config.emoji} {config.chapterTitle ?? config.chapter} • <span dir="ltr">{totalModules}</span>{' '}
        {t('index.modulesLabel', { count: totalModules })} • ~
        {t('index.durationMin', { count: config.estimatedDurationMin })}
      </div>
      {/* « مختبري » : pour l'élève seulement, hors Mode Classe */}
      {labAvailable && !viewer.freeNavigation && !presenting && (
        <button
          type="button"
          onClick={() => setLab(true)}
          data-lesson-lab-open
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-800 hover:border-emerald-500"
        >
          🧪 {t('mission.lab')}
        </button>
      )}
    </div>
  );

  // Ce que le درس enseigne : en focus, replié dans UN « تفاصيل الدرس ».
  const skillsList = config.skills && (
    <ul className="text-slate-500 text-sm space-y-1 max-w-xl">
      {config.skills.slice(0, 3).map((skill, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="text-blue-400 mt-0.5">▸</span>
          <span>
            <MathLabel>{skill}</MathLabel>
          </span>
        </li>
      ))}
      {config.skills.length > 3 && (
        <li className="text-xs text-slate-400 ps-4">{t('index.moreSkills', { count: config.skills.length - 3 })}</li>
      )}
    </ul>
  );

  return (
    <StudentFocusProvider studentView={config.studentView}>
      <div className={`min-h-screen flex flex-col justify-between ${chrome.contentOffsetClass} bg-slate-50`}>
        <main className="sa-page py-8 flex-1 space-y-8">
          {/* BREADCRUMB */}
          {/* `flex-wrap` : sans lui, un fil d'Ariane long (un chapitre et un
            titre de leçon étendus) force la page à défiler latéralement sur
            un téléphone. C'est déjà ce que fait ModuleLayout. */}
          {/* Le fil d'Ariane à gauche, le signalement à droite : c'est la
            rangée de chrome de la page, et l'élève y trouve le bouton sans
            avoir à dérouler jusqu'en bas. `gap-3` + `flex-wrap` pour qu'il
            passe sous le fil sur un téléphone plutôt que de le comprimer. */}
          {teacherBoard ? (
            /* L'ENSEIGNANT d'une leçon qui a son tableau : une seule ligne calme — où il est (ميدان › وحدة), le retour à
             ses leçons, et le signalement en lien discret. Même palette que sa fiche (blanc, encre sombre). */
            <div data-teacher-topline>
              <Suspense fallback={null}>
                <LessonToolsBar lessonId={config.id} active="lesson" />
              </Suspense>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* `flex-1` : le fil d'Ariane prend la place restante, ce qui
              maintient le bouton collé à droite MÊME quand la rangée passe à
              la ligne — sans lui, un fil long le renvoyait à gauche sur sa
              propre ligne. */}
              <nav className="flex flex-1 flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
                <Link to={catalogueHref()} className="hover:text-blue-600">
                  {t('index.home')}
                </Link>
                <span>/</span>
                <Link to={catalogueHref({ level: config.level, grade: config.grade })} className="hover:text-blue-600">
                  {t(`index.level_${config.level}`)} ({config.grade})
                </Link>
                <span>/</span>
                <Link
                  to={catalogueHref({ level: config.level, grade: config.grade, chapter: config.chapter })}
                  className="hover:text-blue-600"
                >
                  {config.chapterTitle || config.chapter}
                </Link>
                <span>/</span>
                {unit && (
                  <>
                    <Link to={unit.path} className="hover:text-blue-600">
                      {unit.title}
                    </Link>
                    <span>/</span>
                  </>
                )}
                <span className="text-slate-900 font-semibold">
                  <MathLabel>{config.title}</MathLabel>
                </span>
              </nav>

              <ReportButton
                source="lesson"
                variant="prominent"
                context={{ lessonCode: config.id, grade: config.grade, step: 'sommaire' }}
              />
            </div>
          )}

          {/* HERO CARD */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6 p-4 md:p-8">
            <div className="flex flex-row items-center justify-between gap-6">
              <div className={teacherBoard ? 'w-full min-w-0 space-y-4' : 'space-y-3'} data-tour="lesson-index.hero">
                {!focus && !teacherBoard && lessonChip}
                {teacherBoard && (
                  <p
                    className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-slate-500"
                    data-teacher-meta
                  >
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {t(`index.level_${config.level}`)} · {config.grade}
                    </span>
                    {/* a lesson that has a world has no module page left: their count is not shown (owner, 2026-11-20) */}
                    {!pack.world && (
                      <span className="rounded-full bg-slate-100 px-3 py-1" data-teacher-modules>
                        <span dir="ltr">{totalModules}</span> {t('index.modulesLabel', { count: totalModules })}
                      </span>
                    )}
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      ~{t('index.durationMin', { count: config.estimatedDurationMin })}
                    </span>
                  </p>
                )}

                <h1 className="font-space font-extrabold text-slate-900 leading-tight text-2xl md:text-4xl">
                  <MathLabel>{config.title}</MathLabel>
                </h1>
                {/* Relecteur seulement (admin, سفير) : l'état de publication. */}
                <PublicationBadge status={lessonStatus(config.id)} />

                {/* Deux portes, deux publics, à ne pas confondre :
                  🎓 وضع القسم présente la leçon au projecteur (présentateur
                  seulement : canPresentClassroom) ; 🧪 المختبر ouvre un
                  instrument SUR la leçon, pour tout le monde. */}
                {/* Une leçon qui a SON tableau (boardLessons.js) n'a plus de « وضع القسم » : TOUS les outils de
                  l'enseignant vivent dans sa fiche « للأستاذ » — un seul endroit (le مختبر général reste dans la barre latérale).
                  Les autres leçons gardent la rangée. */}
                {teacherBoard ? (
                  <div data-tour="lesson-index.tools">
                    <Suspense fallback={<TeacherPanelSkeleton />}>
                      <TeacherLessonPanel config={config} basePath={basePath} hasWorld={Boolean(pack.world)} />
                    </Suspense>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2" data-tour="lesson-index.tools">
                      <ClassroomEntryButton scope="lesson" title={config.title} />
                      <MathLabEntryButton scope={config.level} />
                    </div>
                    {/* L'ENSEIGNANT d'une leçon pilote : sa fiche d'une page, « جرّب كتلميذ », « حصّة القسم » (CLASS_SESSION.md). */}
                    {teacherCard && (
                      <Suspense fallback={<TeacherPanelSkeleton board={false} />}>
                        <TeacherLessonPanel config={config} basePath={basePath} hasWorld={Boolean(pack.world)} />
                      </Suspense>
                    )}
                  </>
                )}

                {!focus && !teacherBoard && skillsList}
                {focus && resumeModule && (
                  <Link
                    to={`${basePath}/${resumeModule.slug}`}
                    data-focus-resume
                    className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl bg-indigo-600 px-6 text-lg font-extrabold text-white shadow-[0_4px_0_0_#3730A3] hover:bg-indigo-700"
                  >
                    {t(completedCount > 0 ? 'focus.continue' : 'focus.start', {
                      title: mathToPlain(resumeModule.title),
                    })}{' '}
                    <span aria-hidden="true">←</span>
                  </Link>
                )}
              </div>

              {/* PROGRESS WIDGET */}
              {!teacherBoard && (
                <div
                  className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-center shrink-0 w-56"
                  data-tour="lesson-index.progress"
                >
                  <div className="text-xs font-mono text-slate-500 font-bold uppercase">{t('index.yourProgress')}</div>

                  <div
                    className={`text-3xl font-space font-extrabold ${isPathComplete ? 'text-emerald-600' : 'text-blue-600'}`}
                  >
                    {pct}%
                  </div>

                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isPathComplete
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-500">
                    <span dir="ltr">
                      {completedCount}/{totalModules}
                    </span>{' '}
                    {t('index.modulesLabel', { count: totalModules })}
                  </span>

                  {isPathComplete && (
                    <div className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 rounded-lg py-1">
                      {t('index.pathCompleted')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ── Ce que le درس enseigne (phase 8) : points d'apprentissage et leur
            maîtrise (profil serveur), prérequis PÉDAGOGIQUES (jamais bloquants),
            manipulations et méthodes déclarées dans lesson.config.js ── */}
          {catalogueLesson && !teacherBoard && (
            <MoreToggle label={t('focus.details')} className="rounded-2xl border border-slate-200 bg-white px-3 py-1">
              {focus && (
                <div className="space-y-3 px-2 pb-3">
                  {lessonChip}
                  {skillsList}
                </div>
              )}
              <section className="grid gap-4 grid-cols-2" data-lesson-structure>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="mb-2 text-sm font-bold text-slate-800">{ts('unit.learningPoints')}</h2>
                  <ul className="space-y-1.5">
                    {catalogueLesson.learningPoints.map((lp) => {
                      // L'état du CHARGEMENT se voit : squelette, erreur, ou rien
                      // pour l'anonyme — un point n'est « لم تُقيَّم بعد » que
                      // lorsque le profil a vraiment été lu.
                      if (profileStatus === 'anonymous') {
                        return (
                          <li key={lp.id} className="flex items-start gap-2 text-sm text-slate-700">
                            <span>
                              <MathLabel>{lp.title}</MathLabel>
                            </span>
                          </li>
                        );
                      }
                      if (profileStatus !== 'ready') {
                        const pending = profileStatus === 'loading';
                        return (
                          <li
                            key={lp.id}
                            className="flex items-start gap-2 text-sm text-slate-700"
                            title={pending ? ts('mastery.loadingDot') : ts('mastery.errorDot')}
                          >
                            <span
                              className={`mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${pending ? 'bg-slate-200 animate-pulse' : 'bg-slate-100 border border-slate-300'}`}
                              role="img"
                              aria-label={pending ? ts('mastery.loadingDot') : ts('mastery.errorDot')}
                              data-mastery-state={pending ? 'loading' : 'error'}
                            />
                            <span>
                              <MathLabel>{lp.title}</MathLabel>
                            </span>
                          </li>
                        );
                      }
                      const row = masteryRows.get(lp.id);
                      const state = resolveMasteryState(row);
                      // UN seul vocabulaire (`mastery.*`) ; le tooltip ajoute la
                      // raison (`statusReason`) et la fraîcheur d'un acquis qui vieillit.
                      const tooltip = masteryTooltip(state, row, ts);
                      return (
                        <li key={lp.id} className="flex items-start gap-2 text-sm text-slate-700" title={tooltip}>
                          <span
                            className={`mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${MASTERY_DOT[state]}`}
                            role="img"
                            aria-label={tooltip}
                            data-mastery-state={state}
                          />
                          <span>
                            <MathLabel>{lp.title}</MathLabel>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="space-y-4">
                  {(prereqLessons.length > 0 || (catalogueLesson.prerequisites ?? []).length > 0) && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <h2 className="mb-2 text-sm font-bold text-slate-800">{ts('unit.prerequisites')}</h2>
                      <ul className="flex flex-wrap gap-1.5">
                        <PrerequisiteLessonChips lessonId={config.id} />
                        {(catalogueLesson.prerequisites ?? []).map((txt) => (
                          <li
                            key={txt}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600"
                          >
                            <MathLabel>{txt}</MathLabel>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-1 text-[11px] text-slate-500">{ts('unit.prerequisitesNote')}</p>
                    </div>
                  )}
                  {(config.resources ?? []).length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <h2 className="mb-2 text-sm font-bold text-slate-800">{ts('unit.manipulationsAndMethods')}</h2>
                      <ul className="space-y-1">
                        {config.resources.map((r) => {
                          const target = config.modules.find((m) => m.number === r.module);
                          const label = `${r.kind === 'manipulation' ? '🧪' : r.kind === 'method' ? '📐' : '🏛️'} ${mathToPlain(r.title)}`;
                          return (
                            <li key={r.code} className="text-sm text-slate-700">
                              {target ? (
                                <Link to={`${basePath}/${target.slug}`} className="hover:text-blue-700">
                                  {label}
                                </Link>
                              ) : (
                                label
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            </MoreToggle>
          )}

          {/* « مسألة الدرس » (config.lessonProblem) : lue avant d'apprendre,
            résolue pas à pas dans son module « مسألة ». */}
          {config.lessonProblem &&
            !teacherBoard &&
            (() => {
              const target = config.modules.find((m) => m.number === config.lessonProblem.module);
              return (
                <LessonProblemCard
                  problem={config.lessonProblem}
                  to={target ? `${basePath}/${target.slug}` : undefined}
                  moduleTitle={target?.title}
                />
              );
            })()}

          {isPracticeActive(config.id) && !teacherBoard && <PracticeEntryCard lessonId={config.id} />}

          {/* MODULES ROADMAP */}
          {!teacherBoard && (
            <section className="space-y-4" data-tour="lesson-index.modules">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-space font-bold text-slate-900">{t('index.modulesPath')}</h2>
                {/* Regard « focus » : les descriptions des محاور ne sont pas supprimées, elles s'affichent sur demande. */}
                {focus && (
                  <button
                    type="button"
                    onClick={() => setShowDesc((v) => !v)}
                    aria-pressed={showDesc}
                    data-focus-show-desc
                    className="min-h-[44px] rounded-lg px-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50"
                  >
                    {t(showDesc ? 'focus.hideDesc' : 'focus.showDesc')}{' '}
                    <span aria-hidden="true">{showDesc ? '▴' : '▾'}</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {config.modules.map((module) =>
                  withSoftGateHint(
                    module,
                    (() => {
                      const isDone = isModuleCompleted(module.id) || isModuleCompleted(module.number?.toString());
                      const modulePath = `${basePath}/${module.slug}`;

                      // Un module retiré par l'administration est traité comme
                      // verrouillé : il reste VISIBLE dans le parcours (l'élève ne
                      // doit pas voir son plan de leçon changer de forme sous ses
                      // yeux) mais devient non cliquable. Le serveur refuse de toute
                      // façon d'enregistrer sa progression — ceci ne fait qu'aligner
                      // l'affichage sur ce refus, au lieu d'y mener l'élève.
                      // Passing `module` makes evaluation-stage modules always
                      // accessible (the "Je pense déjà maîtriser" path) and applies
                      // any requiresLearningPointIds mastery gate. The gate itself
                      // lives in moduleGate.js, shared with ModuleLayout.
                      const status = resolveModuleStatus({
                        closed: isModuleClosed(config.id, module.number),
                        freeNavigation: viewer.freeNavigation,
                        sequentialUnlock: config.sequentialUnlock,
                        isDone,
                        isModuleCompleted,
                        moduleNumber: module.number,
                        currentModule,
                        module,
                        masteryStatusById,
                        firstModuleNumber,
                        previousStage: config.modules.find((m) => Number(m.number) === Number(module.number) - 1)
                          ?.stage,
                      });

                      // Un module verrouillé reste VISIBLE (l'élève voit tout le
                      // parcours) mais n'est ni cliquable ni navigable : même rendu
                      // pour les trois styles de carte, afin de ne pas tripler la
                      // logique de verrouillage.
                      if (status === 'locked') {
                        return (
                          <div
                            key={module.id}
                            aria-disabled="true"
                            className="flex items-center justify-between gap-4 p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 opacity-75"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                                <Lock className="w-4 h-4" aria-hidden="true" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-space font-bold text-slate-500">
                                    <MathLabel>{module.title}</MathLabel>
                                  </h3>
                                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {t('index.locked')}
                                  </span>
                                </div>
                                <p className="text-slate-400 mt-0.5 text-sm">
                                  {t('nav.lockedReason', {
                                    module: lockedReasonData(module.number).previousModule,
                                    threshold: lockedReasonData(module.number).threshold,
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // « En cours », et — pour le relecteur — l'état de publication
                      // du module : les mêmes emplacements dans les trois styles.
                      const inProgressBadge = (
                        <>
                          {status === 'in_progress' && (
                            <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                              {t('index.inProgress')}
                            </span>
                          )}
                          <PublicationBadge status={moduleStatus(config.id, module.number)} />
                        </>
                      );

                      if (module.style === 'diagnostic') {
                        return (
                          <Link
                            key={module.id}
                            to={modulePath}
                            className={`group block p-5 rounded-2xl border-2 border-dashed transition-all relative overflow-hidden
                      ${
                        isDone
                          ? 'border-teal-300 bg-teal-50/40'
                          : 'border-teal-300 bg-teal-50/60 hover:border-teal-400 hover:shadow-md'
                      }`}
                          >
                            {isDone && (
                              <div className="absolute top-0 end-0 p-2 text-teal-700 text-[10px] font-bold bg-teal-100 rounded-es-xl font-mono">
                                {t('index.done')}
                              </div>
                            )}
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                                  <Compass className="w-5 h-5" aria-hidden="true" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                      {t('index.startingMission')}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                      ~{t('index.durationMin', { count: module.estimatedMin })}
                                    </span>
                                    {inProgressBadge}
                                  </div>
                                  <h3 className="font-space font-bold text-slate-900 mt-0.5">
                                    <MathLabel>{module.title}</MathLabel>
                                  </h3>
                                  {(!focus || showDesc) && (
                                    <p className="text-slate-500 mt-0.5 text-sm">
                                      <MathLabel>{module.desc}</MathLabel>
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-700 font-mono text-xs font-semibold shrink-0 inline-block">
                                {isDone ? t('index.review') : module.actionText}
                              </span>
                            </div>
                          </Link>
                        );
                      }

                      if (module.style === 'featured') {
                        return (
                          <Link
                            key={module.id}
                            to={modulePath}
                            className={`group block bg-white p-5 rounded-2xl border transition-all relative overflow-hidden
                      ${
                        isDone
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : `border-slate-200 ${getColor(module.color, 'hoverBorder')} hover:shadow-md`
                      }`}
                          >
                            {isDone && (
                              <div className="absolute top-0 end-0 p-2 text-emerald-600 text-[10px] font-bold bg-emerald-100 rounded-es-xl font-mono">
                                {t('index.completed')}
                              </div>
                            )}
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-xl ${getColor(module.color, 'bg')} ${getColor(module.color, 'text')} font-mono font-bold text-sm flex items-center justify-center shrink-0`}
                                >
                                  {String(module.number).padStart(2, '0')}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3
                                      className={`font-space font-bold text-slate-900 ${getColor(module.color, 'hoverText')} transition-colors`}
                                    >
                                      <MathLabel>{module.title}</MathLabel>
                                    </h3>
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                      ~{t('index.durationMin', { count: module.estimatedMin })}
                                    </span>
                                    {'★'
                                      .repeat(module.difficulty)
                                      .padEnd(5, '☆')
                                      .split('')
                                      .map((s, i) => (
                                        <span
                                          key={i}
                                          className={s === '★' ? 'text-amber-400 text-xs' : 'text-slate-200 text-xs'}
                                        >
                                          {s}
                                        </span>
                                      ))}
                                    {inProgressBadge}
                                  </div>
                                  {(!focus || showDesc) && (
                                    <p className="text-slate-500 mt-0.5 text-sm">
                                      <MathLabel>{module.desc}</MathLabel>
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-semibold shrink-0 inline-block">
                                {isDone ? t('index.review') : module.actionText}
                              </span>
                            </div>
                          </Link>
                        );
                      }

                      if (module.style === 'boss') {
                        return (
                          <Link
                            key={module.id}
                            to={modulePath}
                            className={`block p-5 bg-slate-900 border rounded-2xl hover:shadow-lg transition-all group relative overflow-hidden
                      ${isDone ? 'border-emerald-500' : 'border-slate-800 hover:border-amber-400'}`}
                          >
                            <div
                              className={`absolute top-0 start-0 w-1 h-full ${isDone ? 'bg-emerald-500' : 'bg-slate-700 group-hover:bg-amber-400'} transition-colors`}
                            />
                            <div className="ps-4 flex items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span
                                    className={`text-xs font-mono ${isDone ? 'text-emerald-400' : 'text-amber-400'} font-bold`}
                                  >
                                    MISSION ({String(module.number).padStart(2, '0')})
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                                    ~{t('index.durationMin', { count: module.estimatedMin })}
                                  </span>
                                  {inProgressBadge}
                                </div>
                                <h3 className="font-bold text-white group-hover:text-amber-300 transition-colors">
                                  <MathLabel>{module.title}</MathLabel>
                                </h3>
                                {(!focus || showDesc) && (
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    <MathLabel>{module.desc}</MathLabel>
                                  </p>
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${isDone ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 bg-slate-800'}`}
                              >
                                {isDone ? t('index.completed') : t('index.toDo')}
                              </span>
                            </div>
                          </Link>
                        );
                      }

                      if (module.style === 'assessment') {
                        return (
                          <Link
                            key={module.id}
                            to={modulePath}
                            className={`block p-5 rounded-2xl border-2 transition-all group relative overflow-hidden
                      ${
                        isDone
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-dashed border-slate-300 bg-white hover:border-slate-500 hover:shadow-md'
                      }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                                  {isDone ? '🏆' : '📝'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-space font-bold text-slate-900 group-hover:text-slate-700">
                                      <MathLabel>{module.title}</MathLabel>
                                    </h3>
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                      ~{t('index.durationMin', { count: module.estimatedMin })}
                                    </span>
                                    {inProgressBadge}
                                  </div>
                                  {(!focus || showDesc) && (
                                    <p className="text-slate-500 mt-0.5 text-sm">
                                      <MathLabel>{module.desc}</MathLabel>
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full font-mono text-xs font-bold shrink-0 inline-block
                        ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                              >
                                {isDone ? t('index.results') : module.actionText}
                              </span>
                            </div>
                          </Link>
                        );
                      }

                      return null;
                    })(),
                  ),
                )}
              </div>
            </section>
          )}

          {/* Le sommaire de la leçon n'utilise pas ModuleLayout : sans cette
            entrée, ce serait la seule page de leçon d'où l'on ne pourrait
            rien signaler. */}
          {/* L'enseignant d'une leçon qui a son tableau : l'en-tête commun ne porte aucun bouton d'outil — le signalement
            est en bas de la page d'accueil de la leçon (owner, 2026-11-18). */}
          {teacherBoard && (
            <div className="flex justify-center pt-2" data-teacher-report>
              <ReportButton
                source="lesson"
                variant="prominent"
                context={{ lessonCode: config.id, grade: config.grade, step: 'sommaire' }}
              />
            </div>
          )}
        </main>

        {/* the teacher's page of a lesson that has its board or its world is his card alone: no site footer under it (owner, 2026-11-20) */}
        {!teacherBoard && (
          <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 mt-12">
            <p>
              © {new Date().getFullYear()} Abdennour BOUHOUNALI — {t('common:footerRole')}
            </p>
          </footer>
        )}
        {labLayer}
      </div>
    </StudentFocusProvider>
  );
}
