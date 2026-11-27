/**
 * THE STUDENT'S HOME OF A LESSON (owner, 2026-11-26: « when the student clicks on the lesson button instead of taking him
 * directly to the world home lesson → make it redirect to a new page like the teacher », then « like the one used on the
 * teacher account simple »; LESSON_V2.md §2). One calm page in the look of the teacher's lesson page: the way into the
 * lesson's world, in huge; where he stands (read with no world loaded); then, in order of importance, what the lesson has
 * beside its world — « Espace d'entraînement », « Fiche de connaissances », « Page de révision », « Mon labo »,
 * « Résumé du chapitre » — and what he will know how to do. Three of them are doors of the world too (the training
 * space, the sheets, the lab — owner: « they will exist in both »): from here each opens with NO world loaded.
 * « Ma progression », « L'échauffement » and « Recommencer » stay on the world's title screen only.
 * Nothing here names a lesson; it sends nothing.
 */
import { Link } from 'react-router-dom';
import {
  BookOpen,
  BookOpenCheck,
  ChevronRight,
  FileText,
  FlaskConical,
  Gamepad2,
  ListChecks,
  Table2,
} from 'lucide-react';
import { getLessonById, getUnitOfLesson } from '@smarter-academy/core';
import MathLabel from '../../lessons/common/components/MathLabel';
import { readSave } from '../../lessons/common/gameworld/kit/saveSync';
import { toolPath, worldPath } from '../../lessons/lessonEntry';
import { hasPackPart } from '../../lessons/lessonPack';
import { useCatalogueHref } from '../../components/student/catalogueLink';
import { hasRevision, revisionPath } from '../classSession/boardLessons';
import { summaryLessons, unitSummaryPath } from '../revision/unitSummary';

const L = {
  chapter: 'Chapitre',
  world: 'Le monde de la leçon',
  enter: 'Entrer dans le monde de la leçon',
  resume: 'Continuer l’aventure',
  first: 'Tu découvres la leçon en jouant : chaque règle, c’est toi qui la trouves.',
  again: 'Ton aventure t’attend là où tu l’as laissée.',
  story: (n, of) => `L’aventure : ${n} étape${n > 1 ? 's' : ''} sur ${of}`,
  mastered: (n, of) => `Savoir-faire maîtrisés : ${n} sur ${of}`,
  also: 'Aussi dans cette leçon',
  practice: 'Espace d’entraînement',
  practiceHint: 'Des sujets comme au brevet, sur ta feuille, et des jeux pour t’entraîner sur chaque règle.',
  know: 'Fiche de connaissances',
  knowHint: 'Les règles de la leçon, en cartes : la règle, un exemple, le piège.',
  lab: 'Mon labo',
  labHint: 'Des instruments pour essayer librement. Rien n’est noté.',
  revision: 'Page de révision',
  revisionHint: 'Toute la leçon sur une page : les règles, des exemples, les pièges, un quiz. À lire ou à imprimer.',
  summary: 'Résumé du chapitre',
  summaryHint: 'Les règles de toutes les leçons du chapitre, en tableaux.',
  skills: 'Ce que tu sauras faire',
  minutes: (n) => `~${n} min`,
};
const CHIP = 'rounded-full bg-slate-100 px-3 py-1';

export default function LessonHome({
  config,
  basePath,
  offsetClass = '',
  completedModules = [],
  masteryStatusById = {},
}) {
  const catalogueHref = useCatalogueHref();
  const started = Boolean(readSave(config.id)) || completedModules.length > 0;
  const steps = config.modules?.length ?? 0;
  const points = getLessonById(config.id)?.learningPoints ?? [];
  const mastered = points.filter((lp) => masteryStatusById[lp.id] === 'mastered').length;
  const unit = getUnitOfLesson(config.id);
  const chapterTo = config.unit
    ? `/courses/${config.level}/${config.grade}/${config.chapter}/units/${config.unit}`
    : catalogueHref({ level: config.level, grade: config.grade, chapter: config.chapter });
  const doors = [
    // three doors of the WORLD are here too (owner, 2026-11-26: « they will exist in both »): from here each one opens
    // WITH NO WORLD loaded (`?outil=…`); all three are open to a student who never played
    {
      id: 'entrainement',
      to: toolPath(basePath, 'entrainement'),
      Icon: FileText,
      name: L.practice,
      hint: L.practiceHint,
    },
    hasPackPart(config.id, 'knowledge') && {
      id: 'fiche',
      to: toolPath(basePath, 'fiche'),
      Icon: BookOpen,
      name: L.know,
      hint: L.knowHint,
    },
    hasRevision(config.id) && {
      id: 'revision',
      to: revisionPath(config.id),
      Icon: BookOpenCheck,
      name: L.revision,
      hint: L.revisionHint,
    },
    { id: 'labo', to: toolPath(basePath, 'labo'), Icon: FlaskConical, name: L.lab, hint: L.labHint },
    unit &&
      summaryLessons(unit).length > 0 && {
        id: 'summary',
        to: unitSummaryPath(unit.id),
        Icon: Table2,
        name: L.summary,
        hint: L.summaryHint,
      },
  ].filter(Boolean);

  return (
    <div className={`min-h-screen flex flex-col ${offsetClass} bg-slate-50`} data-lesson-home={config.id}>
      <main className="sa-page py-8 flex-1 space-y-6">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
          <Link to={chapterTo} className="hover:text-blue-600" data-lesson-home-back>
            {config.unitTitle ?? L.chapter}
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">
            <MathLabel>{config.title}</MathLabel>
          </span>
        </nav>

        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-8">
          <div className="space-y-3">
            <p className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-slate-500">
              <span className={CHIP}>{config.grade}</span>
              {config.estimatedDurationMin > 0 && (
                <span className={CHIP}>{L.minutes(config.estimatedDurationMin)}</span>
              )}
            </p>
            <h1 className="font-space text-2xl font-extrabold leading-tight text-slate-900 md:text-4xl">
              <MathLabel>{config.title}</MathLabel>
            </h1>
          </div>

          {/* the way in, in huge */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 md:p-7" data-lesson-home-world>
            <div className="flex flex-wrap items-center gap-5">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-nav-accent text-white">
                <Gamepad2 size={34} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-black leading-snug text-slate-900">{L.world}</h2>
                <p className="text-base font-semibold leading-7 text-slate-600">{started ? L.again : L.first}</p>
              </div>
            </div>
            <Link
              to={worldPath(basePath)}
              className="mt-5 flex min-h-[88px] w-full items-center justify-center gap-3 rounded-3xl bg-nav-accent px-8 text-center text-2xl font-black text-white transition-colors hover:bg-[#3350c4] focus:outline-none focus-visible:ring-4 focus-visible:ring-nav-accent-soft md:text-3xl"
              data-lesson-home-enter
            >
              {started ? L.resume : L.enter}
              <ChevronRight size={32} aria-hidden="true" />
            </Link>
            {started && (
              <p className="mt-4 flex flex-wrap gap-2 text-sm font-extrabold text-slate-600" data-lesson-home-status>
                {steps > 0 && (
                  <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                    {L.story(Math.min(completedModules.length, steps), steps)}
                  </span>
                )}
                {mastered > 0 && (
                  <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                    {L.mastered(mastered, points.length)}
                  </span>
                )}
              </p>
            )}
          </div>

          {doors.length > 0 && (
            <div className="space-y-2" data-lesson-home-doors>
              <h3 className="text-xs font-extrabold tracking-wide text-slate-400">{L.also}</h3>
              <div className="grid gap-3 md:grid-cols-3">
                {doors.map(({ id, to, Icon, name, hint }) => (
                  <Link
                    key={id}
                    to={to}
                    className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-nav-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent"
                    data-lesson-home-door={id}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-nav-accent-soft text-nav-accent transition-colors group-hover:bg-nav-accent group-hover:text-white">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 text-start">
                      <strong className="block text-[15px] font-extrabold text-slate-900">{name}</strong>
                      <span className="block text-[13px] font-semibold leading-6 text-slate-500">{hint}</span>
                    </span>
                    <ChevronRight
                      size={20}
                      aria-hidden="true"
                      className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-nav-accent"
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {config.skills?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5" data-lesson-home-skills>
              <h4 className="flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
                <ListChecks size={16} className="text-slate-400" aria-hidden="true" /> {L.skills}
              </h4>
              <ul className="mt-1.5 space-y-1 text-[14px] font-semibold leading-6 text-slate-700">
                {config.skills.map((skill) => (
                  <li key={skill} className="flex gap-1.5">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    <MathLabel>{skill}</MathLabel>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
