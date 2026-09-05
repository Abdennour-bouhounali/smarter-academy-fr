import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, CircleCheckBig, Flame, Zap, ArrowRight, Target, ChevronDown, Trophy,
} from 'lucide-react';
import { courseLevels } from '@smarter-academy/core';
import { getStudentActivity } from '../../lessons/common/utils/progress/getStudentActivity';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useLearningProfile } from '../../lessons/common/hooks/useLearningProfile';
import {
  LearningPointCard, resolveMasteryState, findLessonMasteryRows, MASTERY_STATES,
} from '../../lessons/common/components/LearningPointMastery';

/** Looks up a lesson's display title/path and its chapter's title from the
 * catalogue — the learning-profile API only returns codes (grade/lesson/
 * chapter), never display strings for the lesson/chapter themselves. */
function resolveLessonMeta(gradeId, lessonId) {
  for (const level of courseLevels) {
    const grade = level.grades.find((g) => g.id === gradeId);
    if (!grade) continue;
    for (const chapter of grade.chapters) {
      const lesson = chapter.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        return {
          lesson,
          lessonTitle: lesson.title,
          lessonPath: lesson.path,
          chapterTitle: chapter.title,
          gradeLabel: `${level.title} (${grade.name})`,
        };
      }
    }
  }
  return null;
}

const MASTERY_MESSAGE = {
  unassessed: "Passe le bilan de la leçon pour évaluer cette compétence.",
  gap: 'Une vraie difficulté à travailler.',
  reinforce: 'Des bases, mais pas encore solide.',
  mastered: 'Compétence solidement acquise.',
};

/** Ordre d'affichage : ce qui bloque d'abord, ce qui est acquis ensuite. */
const STATE_ORDER = { gap: 0, reinforce: 1, unassessed: 2, mastered: 3 };

/**
 * Les Learning Points d'une leçon, fusionnés depuis DEUX sources :
 *  - le catalogue (coursesData.js) donne la LISTE COMPLÈTE et l'ordre officiel ;
 *  - le profil d'apprentissage (API) donne l'état réel de maîtrise.
 *
 * Une compétence encore jamais évaluée apparaît donc quand même, en
 * « Pas encore évalué » — l'élève voit ce qui l'attend, sans qu'on invente
 * le moindre pourcentage (règle de LearningPointMastery).
 */
function mergeLearningPoints(lesson, currentMastery, gradeId) {
  const rows = findLessonMasteryRows(currentMastery, gradeId, lesson.id);
  const byCode = new Map(rows.map((r) => [r.code, r]));

  return (lesson.learningPoints || []).map((lp) => {
    const row = byCode.get(lp.id);
    return {
      code: lp.id,
      title: row?.title || lp.title,
      order: lp.order,
      row,
      state: resolveMasteryState(row),
      confidence: row?.confidence,
    };
  });
}

/** Petit résumé chiffré : combien de compétences dans chaque état. */
function masteryCounts(points) {
  return points.reduce(
    (acc, p) => ({ ...acc, [p.state]: (acc[p.state] || 0) + 1 }),
    {}
  );
}

/** Pastilles de synthèse — jamais la couleur seule, toujours un nombre. */
function MasteryChips({ counts, total }) {
  const order = ['mastered', 'reinforce', 'gap', 'unassessed'];
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {order
        .filter((state) => counts[state])
        .map((state) => (
          <span
            key={state}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 font-mono text-[10px] font-bold text-slate-600"
            title={MASTERY_STATES[state].label}
          >
            <span aria-hidden="true">{MASTERY_STATES[state].emoji}</span>
            {counts[state]}
          </span>
        ))}
      <span className="font-mono text-[10px] text-slate-400">/ {total} compétences</span>
    </div>
  );
}

/**
 * Une ligne de leçon dépliable : progression du parcours + état des
 * compétences. Le dépli est un vrai <button> (clavier, aria-expanded), et le
 * lien vers la leçon reste distinct pour ne pas piéger la navigation.
 */
function LessonRow({ item, currentMastery, profileReady }) {
  const [open, setOpen] = useState(false);
  const gradeId = item.grade.id;

  const points = useMemo(
    () => mergeLearningPoints(item.lesson, currentMastery, gradeId),
    [item.lesson, currentMastery, gradeId]
  );
  const counts = useMemo(() => masteryCounts(points), [points]);
  const assessedCount = points.length - (counts.unassessed || 0);
  const sorted = useMemo(
    () => [...points].sort((a, b) => (STATE_ORDER[a.state] - STATE_ORDER[b.state]) || (a.order - b.order)),
    [points]
  );

  const panelId = `lp-${gradeId}-${item.lesson.id}`;
  const hasPoints = points.length > 0;

  return (
    <div className="first:rounded-t-[20px] last:rounded-b-[20px] overflow-hidden">
      <div className="flex items-center gap-3 p-4 hover:bg-slate-50/70 transition-colors group">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">{item.lesson.icon}</span>

        <div className="flex-1 min-w-0">
          <Link
            to={item.lesson.path}
            className="font-inter font-semibold text-slate-800 text-sm truncate hover:text-blue-600 block"
          >
            {item.lesson.title}
          </Link>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[160px]">
              <div
                className={`h-full ${item.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                style={{ width: `${item.progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono-jetbrains font-bold text-slate-500 tabular-nums">
              {item.progressPercent}%
            </span>
          </div>
          {hasPoints && (
            <div className="mt-2">
              <MasteryChips counts={counts} total={points.length} />
            </div>
          )}
        </div>

        {hasPoints && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={panelId}
            className="flex-shrink-0 min-h-[44px] px-3 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-400 text-xs font-mono font-bold text-slate-600 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {open ? 'Masquer' : 'Mes acquis'}
            <ChevronDown
              size={14}
              className={`transition-transform ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={panelId}
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-slate-50/60 border-t border-slate-100"
          >
            <div className="p-4 space-y-3">
              {assessedCount === 0 && (
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2.5">
                  <Trophy size={16} className="text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Aucune compétence encore évaluée pour cette leçon.{' '}
                    <strong>Termine le bilan final</strong> pour que tes résultats apparaissent ici.
                  </p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sorted.map((p) => (
                  <LearningPointCard
                    key={p.code}
                    title={p.title}
                    state={p.state}
                    confidence={p.confidence}
                    message={MASTERY_MESSAGE[p.state]}
                    action={
                      p.state === 'gap' || p.state === 'reinforce' ? (
                        <Link
                          to={item.lesson.path}
                          className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 underline decoration-dotted"
                        >
                          → Revoir la leçon
                        </Link>
                      ) : null
                    }
                  />
                ))}
              </div>

              {!profileReady && (
                <p className="text-[11px] text-slate-400 font-mono">
                  Connecte-toi pour voir tes résultats réels de bilan.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatTile({ icon: Icon, value, label, accent }) {
  return (
    <div className="glass-card p-4 sm:p-5 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="font-space font-black text-xl text-slate-900 leading-none tabular-nums">{value}</p>
        <p className="font-inter text-slate-500 text-xs mt-1 leading-tight">{label}</p>
      </div>
    </div>
  );
}

export default function Progression() {
  useDocumentMeta('Ma progression', 'Suis ta progression et tes acquis, leçon par leçon.');

  // Progress spans every grade a student has touched, not just their
  // current one — matches getResumeLesson's documented, considered
  // decision (ARCHITECTURE.md §10): progress is never grade-locked.
  const activity = useMemo(() => getStudentActivity(courseLevels), []);
  const { profile, status, reload } = useLearningProfile();
  const currentMastery = profile?.currentMastery || [];
  const profileReady = status === 'ready';

  const byGrade = useMemo(() => {
    const map = new Map();
    activity.lessons.forEach((item) => {
      const key = `${item.level.title} ${item.grade.name}`;
      if (!map.has(key)) map.set(key, { label: key, lessons: [] });
      map.get(key).lessons.push(item);
    });
    return Array.from(map.values()).filter((g) => g.lessons.some((l) => l.lastVisitedAt > 0));
  }, [activity]);

  // Compétences maîtrisées, tous parcours confondus — un chiffre qui vient
  // uniquement des bilans réels, jamais d'une moyenne de complétion.
  const masteredTotal = useMemo(
    () =>
      currentMastery.reduce(
        (sum, g) =>
          sum + g.lessons.reduce((s, l) => s + l.learningPoints.filter((p) => p.status === 'mastered').length, 0),
        0
      ),
    [currentMastery]
  );

  // Dénominateur du compteur : les compétences réellement évaluées (une
  // compétence sans bilan n'entre ni au numérateur ni au dénominateur).
  const assessedTotal = useMemo(
    () =>
      currentMastery.reduce(
        (sum, g) =>
          sum +
          g.lessons.reduce(
            (s, l) => s + l.learningPoints.filter((p) => p.status !== 'unassessed').length,
            0
          ),
        0
      ),
    [currentMastery]
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
      <div className="mb-8">
        <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5">
          <TrendingUp size={13} /> Ma progression
        </p>
        <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">Ce que tu as accompli</h1>
        <p className="font-inter text-slate-500 text-sm mt-1 max-w-xl">
          Tes leçons et, pour chacune, les compétences que tu maîtrises vraiment. Clique sur{' '}
          <strong>« Mes acquis »</strong> sous une leçon pour voir le détail, compétence par compétence.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
        <StatTile icon={CircleCheckBig} value={activity.completedCount} label="Leçons terminées" accent="bg-emerald-50 text-emerald-600" />
        <StatTile icon={Flame} value={activity.inProgressCount} label="Leçons en cours" accent="bg-amber-50 text-amber-600" />
        {/* Total TOUTES LEÇONS confondues — d'où le libellé explicite : le
            détail par leçon vit dans le panneau « Mes acquis » ci-dessous. */}
        <StatTile
          icon={Target}
          value={profileReady ? `${masteredTotal} / ${assessedTotal}` : '—'}
          label="Compétences maîtrisées (toutes leçons)"
          accent="bg-blue-50 text-blue-600"
        />
        <StatTile icon={Zap} value={activity.totalXp} label="XP total" accent="bg-purple-50 text-purple-600" />
      </div>

      {status === 'loading' && (
        <p className="text-xs font-mono text-slate-400 mb-4">Chargement de tes acquis…</p>
      )}
      {status === 'error' && (
        <div className="glass-card p-4 mb-6 flex items-center justify-between gap-3 flex-wrap">
          <p className="font-inter text-slate-500 text-sm">
            Impossible de charger tes acquis pour le moment. Ta progression de parcours reste affichée.
          </p>
          <button
            type="button"
            onClick={reload}
            className="min-h-[44px] px-4 rounded-xl border-2 border-slate-200 bg-white text-xs font-mono font-bold text-slate-600 hover:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            🔄 Réessayer
          </button>
        </div>
      )}

      {byGrade.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="font-inter text-slate-500 text-sm mb-5">Tu n'as pas encore commencé de leçon.</p>
          <Link to="/espace/cours" className="btn-primary text-sm inline-flex">Commencer une leçon</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {byGrade.map((group) => (
            <motion.div key={group.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-space font-bold text-slate-800 text-sm mb-3">{group.label}</h2>
              <div className="glass-card divide-y divide-slate-100">
                {group.lessons
                  .filter((l) => l.lastVisitedAt > 0)
                  .sort((a, b) => b.lastVisitedAt - a.lastVisitedAt)
                  .map((item) => (
                    <LessonRow
                      key={item.lesson.id}
                      item={item}
                      currentMastery={currentMastery}
                      profileReady={profileReady}
                    />
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-slate-400 font-inter max-w-xl">
        Chaque compétence est évaluée à partir de tes vraies réponses aux bilans de fin de leçon — jamais d'une
        moyenne générale. Une compétence « Pas encore évaluée » attend simplement que tu passes le bilan.
      </p>
    </div>
  );
}
