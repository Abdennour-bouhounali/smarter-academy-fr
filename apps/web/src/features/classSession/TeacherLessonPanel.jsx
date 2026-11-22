/**
 * « Pour le professeur » — the TEACHER's place on a lesson page (CLASS_SESSION.md §2). Everything a teacher does with the lesson, in
 * the order of his work; on a lesson that has its board it IS his page (the old sections of the lesson home are gone):
 *
 *   En classe   one strong panel: « Séance en classe » and the four moments of the hour, each a card that says what happens in
 *               it and opens it directly;
 *   Je prépare  see the lesson as a student (nothing recorded) · the full memo;
 *   Mes outils  the lesson's own lab to explain with · the bank of exercises (to show on the board, to print a sheet);
 *   Avant de commencer  what the students will learn · what the lesson stands on · the mistakes they really make.
 *
 * An adult's screen (owner, 2026-11-18: « the UI/UX needs absolutely to be enhanced », « update the colors too »): one
 * decision per block, every door says in one line what is behind it, facts instead of decoration. ONE calm palette —
 * white surfaces, dark ink, grey for what is secondary; the dark tone marks only what is pressed (the main button, the
 * numbers of the hour, a door under the hand). No gradient, no colour per tool; green only on « Essentiel », where it means something.
 */
import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { lessonFilePagePath } from './lessonFileDoc';
import {
  AlertTriangle,
  Brain,
  ClipboardList,
  Eye,
  FileText,
  FlaskConical,
  Layers,
  Monitor,
  NotebookPen,
  Presentation,
  Target,
  Users,
} from 'lucide-react';
import { ArrowForward, ChevronForward } from '../../components/common/DirectionalIcons';
import { useIsPhoneScreen } from '../../components/auth/RequireLargeScreen';
import { toolsForLesson } from '@smarter-academy/core/curriculum/fr/net/learningNet.js';
import MathLabel from '../../lessons/common/components/MathLabel';
import { FAMILIES, MISTAKES } from '../../lessons/common/launchkit/families';
import { hasLab } from '../../lessons/common/lessonlab/registry';
import { levelCounts } from '../practice/practiceCounts';
import { teacherBankPath } from '../practice/teacherBank';
import {
  classCardPath,
  classSessionPath,
  classTrackingPath,
  hasClassBoard,
  MOMENTS,
  toolHasContent,
} from './boardLessons';
import './teacherPanel.css';
import { reviewCards } from './lessonScripts';
import { usePackPart } from '../../lessons/lessonPack';
import { LabOpeningSkeleton } from './TeacherSkeletons';

const LessonLab = lazy(() => import('../../lessons/common/lessonlab/LessonLab'));

/** A count bound to its noun (U+00A0), French plural: 0 and 1 take the singular. */
const counted = (n, one, many) => `${n} ${n <= 1 ? one : many}`;
const L = {
  title: 'Pour le professeur',
  inClass: 'En classe',
  session: 'Séance en classe',
  sessionLead: 'Toute la séance au tableau, avec les prénoms de vos élèves. Rien n’y change la progression d’un élève.',
  open: 'Ouvrir la séance en classe',
  moments: {
    start: { name: 'Test de début', say: () => 'Où en est la classe avant la leçon ? Chaque élève par son prénom.' },
    revise: {
      name: 'On révise les règles',
      say: ({ rules }) =>
        rules
          ? `${counted(rules, 'règle utile', 'règles utiles')}, lues par l’élève que vous choisissez.`
          : 'Les règles dont nous aurons besoin, lues par l’élève que vous choisissez.',
    },
    lesson: {
      name: 'La leçon au tableau',
      say: ({ stations }) =>
        `${stations ? `${counted(stations, 'étape', 'étapes')} : ` : ''}la classe essaie, conclut, puis nomme.`,
    },
    end: { name: 'Test de fin', say: () => 'Qu’a changé la séance ? Avant et après.' },
  },
  prepare: 'Je prépare',
  preview: 'Essayer la leçon comme un élève',
  previewSay: 'Le jeu et le test tels que les voit votre élève, sans rien enregistrer.',
  memo: 'La fiche du professeur',
  memoSay: 'Les étapes, les questions, les erreurs attendues et vos notes.',
  tools: 'Mes outils',
  lab: 'Le labo de la leçon',
  labSay: 'Les outils de cette leçon et des précédentes, pour expliquer devant la classe.',
  bank: 'Banque d’exercices',
  bankSay: (n) =>
    `${counted(n, 'exercice corrigé', 'exercices corrigés')} : à montrer au tableau ou à imprimer pour la classe.`,
  follow: 'Je suis',
  track: 'Suivi de la classe',
  trackSay:
    'Chaque élève sur cette leçon : ses savoir-faire, ses exercices, ce qui est réussi et ce qui est à reprendre.',
  file: 'Dossier de la leçon',
  fileSay:
    'Votre dossier de travail sur cette leçon : écrivez, dessinez, ajoutez des images. Un seul dossier, que vous seul lisez.',
  map: 'Fiche de connaissances',
  mapSay:
    'Les connaissances de la leçon au tableau : une révision rapide avec toute la classe, et les liens vers les leçons précédentes.',
  know: 'Avant de commencer',
  learns: 'Ce qu’apprennent vos élèves',
  learnsTrack: 'Où en est chaque élève ?',
  stands: 'Sur quoi repose la leçon',
  core: 'Essentiel',
  support: 'Appui',
  year: (g) => `niveau\u00a0${g}`,
  mistakes: 'Erreurs fréquentes des élèves',
  laptop: 'Sur ordinateur',
};

/** On a phone, what opens only on a tablet or a laptop says so and is not a link (owner, 2026-11-16). */
const LaptopBadge = () => (
  <span
    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold text-slate-500"
    data-teacher-laptop-only
  >
    <Monitor size={13} aria-hidden="true" /> {L.laptop}
  </span>
);

/**
 * A door of the card: an icon, what it is, one line on what is behind it. A link (`to`) or a button (`onClick`).
 * `closed`: on a phone, a tool designed for a larger screen — shown, named « Sur ordinateur », and opening nothing.
 */
function Door({ icon: Icon, title, say, to, onClick, closed = false, ...rest }) {
  if (closed) {
    return (
      <div
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3"
        aria-disabled="true"
        {...rest}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-slate-400">
          <Icon size={20} aria-hidden="true" />
        </span>
        <strong className="min-w-0 flex-1 text-start text-[15px] font-extrabold text-slate-500">{title}</strong>
        <LaptopBadge />
      </div>
    );
  }
  const body = (
    <>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-nav-accent-soft text-nav-accent transition-colors group-hover:bg-nav-accent group-hover:text-white">
        <Icon size={22} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 text-start">
        <strong className="block text-[15px] font-extrabold text-slate-900">{title}</strong>
        <span className="block text-[13px] font-semibold leading-6 text-slate-500">{say}</span>
      </span>
      <ChevronForward
        size={18}
        className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-nav-accent"
        aria-hidden="true"
      />
    </>
  );
  const cls =
    'group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-colors hover:border-nav-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent';
  return to ? (
    <Link to={to} className={cls} {...rest}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls} {...rest}>
      {body}
    </button>
  );
}
const Block = ({ label, children, ...rest }) => (
  <div className="space-y-2" {...rest}>
    <h3 className="text-xs font-extrabold tracking-wide text-slate-400">{label}</h3>
    {children}
  </div>
);
const Fact = ({ icon: Icon, title, children, ...rest }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-3.5" {...rest}>
    <h4 className="flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
      <Icon size={16} className="text-slate-400" aria-hidden="true" /> {title}
    </h4>
    {children}
  </div>
);

export default function TeacherLessonPanel({ config, basePath, hasWorld, extraTools = null }) {
  const [lab, setLab] = useState(false);
  // a phone opens what was designed for it: the student's world, the memo, the lesson file (components/auth/phoneLessons.js)
  const phone = useIsPhoneScreen();
  const tools = toolsForLesson(config.id, { max: 6 });
  const board = hasClassBoard(config.id);
  const labHere = hasLab(config.id);
  const mistakes = [
    ...new Set(tools.filter((t) => t.weight !== 'support').flatMap((t) => FAMILIES[t.id]?.mistakes ?? [])),
  ]
    .map((id) => MISTAKES[id]?.replace(/^Attention\s*:\s*/i, ''))
    .filter(Boolean)
    .slice(0, 4);
  const script = usePackPart(config.id, 'script'); // the lesson's board script, from its pack: its count arrives a moment later
  const facts = { rules: reviewCards(tools, FAMILIES).length, stations: script?.steps.length ?? 0 };
  const exercises = Object.values(levelCounts(config.id)).reduce((s, n) => s + n, 0);
  return (
    <section className="w-full space-y-5 text-start" data-teacher-lesson-panel={config.id} data-teacher-board={board}>
      {/* ── in class: the one thing a teacher comes for ── */}
      {board && phone && <Door icon={Presentation} title={L.session} closed data-teacher-session-closed />}
      {board && !phone && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5" data-teacher-group="class">
          <div className="flex flex-wrap items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-nav-accent text-white">
              <Presentation size={28} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-slate-500">
                {L.title} · {L.inClass}
              </p>
              <h2 className="text-2xl font-black leading-snug text-slate-900">{L.session}</h2>
              <p className="text-sm font-semibold leading-6 text-slate-600">{L.sessionLead}</p>
            </div>
            <Link
              to={classSessionPath(config.id)}
              data-teacher-session
              className="inline-flex min-h-[52px] shrink-0 items-center gap-2 rounded-2xl bg-nav-accent px-6 text-base font-black text-white transition-colors hover:bg-[#3350c4] focus:outline-none focus-visible:ring-4 focus-visible:ring-nav-accent-soft"
            >
              {L.open} <ArrowForward size={20} aria-hidden="true" />
            </Link>
          </div>
          {/* the hour as the set-up screen shows it: four moments, each opened directly */}
          <ol className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4" data-teacher-moments>
            {MOMENTS.map((m, k) => (
              <li key={m}>
                <Link
                  to={classSessionPath(config.id, m)}
                  data-teacher-moment={m}
                  className="group flex h-full flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-3 transition-colors hover:border-nav-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent"
                >
                  <span className="flex items-center gap-2">
                    <b className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-nav-accent text-sm font-black text-white">
                      {k + 1}
                    </b>
                    <strong className="text-[15px] font-extrabold text-slate-900">{L.moments[m].name}</strong>
                  </span>
                  <span className="text-[13px] font-semibold leading-6 text-slate-500">{L.moments[m].say(facts)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── prepare · my tools ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Block label={board ? L.prepare : `${L.title} · ${L.prepare}`} data-teacher-group="prepare">
          {hasWorld && (
            <Door
              icon={Eye}
              title={L.preview}
              say={L.previewSay}
              to={`${basePath}?apercu=eleve`}
              data-teacher-preview
            />
          )}
          {/* the memo of a v2 lesson is written with its board: without one there is nothing to read (owner, 2026-11-20) */}
          {(board || !hasWorld) && (
            <Door
              icon={FileText}
              title={L.memo}
              say={L.memoSay}
              to={`/enseignant/cours/${config.id}/memoire`}
              data-teacher-memo
            />
          )}
          {board && (
            <Door
              icon={NotebookPen}
              title={L.file}
              say={L.fileSay}
              to={lessonFilePagePath(config.id)}
              data-teacher-file
            />
          )}
        </Block>
        {(labHere || exercises > 0 || extraTools) && (
          <Block label={L.tools} data-teacher-group="tools">
            {labHere && (
              <Door
                icon={FlaskConical}
                title={L.lab}
                say={L.labSay}
                onClick={() => setLab(true)}
                closed={phone}
                data-teacher-lab
              />
            )}
            {exercises > 0 && (
              <Door
                icon={ClipboardList}
                title={L.bank}
                say={L.bankSay(exercises)}
                to={teacherBankPath(config.id)}
                closed={phone}
                data-teacher-bank
              />
            )}
            {board && toolHasContent(config.id, 'card') && (
              <Door
                icon={Brain}
                title={L.map}
                say={L.mapSay}
                to={classCardPath(config.id)}
                closed={phone}
                data-teacher-map
              />
            )}
            {extraTools}
          </Block>
        )}
      </div>

      {/* ── follow: the class on this lesson, student by student ── */}
      {/* a v2 lesson is followed even before it has its board: the tracking reads the bank (owner, 2026-11-20) */}
      {(board || hasWorld) && (
        <Block label={L.follow} data-teacher-group="follow">
          <Door
            icon={Users}
            title={L.track}
            say={L.trackSay}
            to={classTrackingPath(config.id)}
            closed={phone}
            data-teacher-track
          />
        </Block>
      )}

      {/* ── what to know before the hour ── */}
      <Block label={L.know} data-teacher-group="know">
        <div className="grid gap-3 lg:grid-cols-3">
          {config.skills?.length > 0 && (
            <Fact icon={Target} title={L.learns} data-teacher-learns>
              <ul className="mt-1.5 space-y-1 text-[14px] font-semibold leading-6 text-slate-700">
                {config.skills.map((s) => (
                  <li key={s} className="flex gap-1.5">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    <span>
                      <MathLabel>{s}</MathLabel>
                    </span>
                  </li>
                ))}
              </ul>
              {/* « Ce qu’apprennent vos élèves » leads somewhere (owner, 2026-11-20): where each student stands on these savoir-faire */}
              {(board || hasWorld) && !phone && (
                <Link
                  to={classTrackingPath(config.id)}
                  data-teacher-learns-track
                  className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-nav-accent px-4 text-[15px] font-extrabold text-white transition-colors hover:bg-[#3350c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent focus-visible:ring-offset-2"
                >
                  <Users size={17} aria-hidden="true" /> {L.learnsTrack} <ArrowForward size={17} aria-hidden="true" />
                </Link>
              )}
            </Fact>
          )}
          {tools.length > 0 && (
            <Fact icon={Layers} title={L.stands}>
              <ul className="mt-1.5 space-y-1.5" data-teacher-stands>
                {tools.map((t) => (
                  <li
                    key={t.id}
                    className="text-[14px] font-bold leading-6 text-slate-800"
                    data-teacher-tool={t.id}
                    data-weight={t.weight ?? ''}
                  >
                    <span
                      className={`me-1.5 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${t.weight === 'support' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'}`}
                    >
                      {t.weight === 'support' ? L.support : L.core}
                    </span>
                    <MathLabel>{t.lesson?.title ?? t.text}</MathLabel>{' '}
                    <span className="whitespace-nowrap text-xs font-bold text-slate-500">· {L.year(t.grade)}</span>
                  </li>
                ))}
              </ul>
            </Fact>
          )}
          {mistakes.length > 0 && (
            <Fact icon={AlertTriangle} title={L.mistakes}>
              <ul className="mt-1.5 space-y-1 text-[14px] font-semibold leading-6 text-slate-700" data-teacher-mistakes>
                {mistakes.map((m) => (
                  <li key={m} className="flex gap-1.5">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </Fact>
          )}
        </div>
      </Block>
      {/* the lab is a full-screen layer: between the click and its chunk, the same layer says it is opening */}
      {lab && (
        <Suspense fallback={<LabOpeningSkeleton />}>
          <LessonLab lessonCode={config.id} lessonTitle={config.title} onClose={() => setLab(false)} />
        </Suspense>
      )}
    </section>
  );
}
