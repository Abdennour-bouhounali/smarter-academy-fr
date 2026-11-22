import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { reasonLabel, freshnessLabel } from './masteryLabels';

// Le vocabulaire (raisons, fraîcheur, tooltip) vit dans masteryLabels.js —
// pur, sans React — et se lit aussi depuis ce module.
export { reasonLabel, freshnessLabel, masteryTooltip } from './masteryLabels';

/**
 * LearningPointMastery — student-facing rendering of a Learning Point's
 * mastery state, sourced from the real `/students/me/learning-profile`
 * evidence rollup (see learningEvidenceService.fetchLearningProfile).
 *
 * Never invents a percentage: a Learning Point absent from the API's
 * `currentMastery` (no evidence submitted yet) renders as `unassessed`,
 * with no progress bar — only `gap`/`reinforce`/`mastered` rows (which
 * always carry a real `confidence` float from MasteryModel) show a bar.
 * Internal vocabulary (status/confidence/evidence_count/...) never reaches
 * the student — only the translated state labels below.
 *
 * `label` is a GETTER, not a stored string : ces états sont un module
 * constant lu par quatre écrans (progression, pratique, bilan, carte de
 * compétence) qui affichent tous `.label`. Le rendre paresseux traduit les
 * quatre d'un coup sans changer la forme exportée, et sans lire i18n au
 * chargement du module — l'ordre d'import ne peut donc pas figer un libellé.
 */

function masteryState(emoji, labelKey, tone) {
  return {
    emoji,
    labelKey,
    tone,
    get label() {
      return i18n.t(labelKey, { ns: 'student' });
    },
  };
}

export const MASTERY_STATES = {
  unassessed: masteryState('⚪', 'mastery.unassessed', 'slate'),
  gap: masteryState('🔴', 'mastery.gap', 'rose'),
  reinforce: masteryState('🟡', 'mastery.reinforce', 'amber'),
  mastered: masteryState('🟢', 'mastery.mastered', 'emerald'),
};

const TONE_CLASSES = {
  slate: { border: 'border-slate-200', bg: 'bg-slate-50', pill: 'bg-slate-100 text-slate-600', bar: 'bg-slate-300' },
  rose: { border: 'border-rose-200', bg: 'bg-rose-50', pill: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500' },
  amber: { border: 'border-amber-200', bg: 'bg-amber-50', pill: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', pill: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
};

/**
 * Resolves a Learning Point's display state from a `currentMastery` row
 * (or `undefined` when the LP has no evidence yet at all).
 * @param {{status: string, confidence: number}|undefined} row
 */
export function resolveMasteryState(row) {
  if (!row || row.status === 'unassessed') return 'unassessed';
  return MASTERY_STATES[row.status] ? row.status : 'unassessed';
}

/**
 * @param {object} props
 * @param {string} props.title - the Learning Point's title (from the API row, or coursesData.js)
 * @param {'unassessed'|'gap'|'reinforce'|'mastered'} props.state
 * @param {number} [props.confidence] - 0..1, only meaningful when state !== 'unassessed'
 * @param {string} props.message - short, student-friendly, non-technical
 * @param {React.ReactNode} [props.action]
 * @param {{statusReason?: string|null, freshness?: string|null, distinctItemsSuccess?: number}} [props.row]
 *        the profile row (Mastery V2) : its `statusReason` explains a
 *        `reinforce` under the pill, its `freshness` marks an ageing `mastered`
 * @param {() => void} [props.onExplain] - opens « Pourquoi ? » (the explanation drawer)
 */
export function LearningPointCard({ title, state, confidence, message, action, row, onExplain }) {
  const { t } = useTranslation('student');
  const s = MASTERY_STATES[state] || MASTERY_STATES.unassessed;
  const c = TONE_CLASSES[s.tone];
  const pct = typeof confidence === 'number' ? Math.round(confidence * 100) : null;
  const reason = state === 'reinforce' ? reasonLabel(row, t) : '';
  const freshness = state === 'mastered' && row?.freshness && row.freshness !== 'fresh' ? freshnessLabel(row, t) : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 p-5 space-y-3 ${c.border} ${c.bg}`}
      data-mastery-state={state}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold ${c.pill}`}>
          <span aria-hidden="true">{s.emoji}</span> {t(s.labelKey)}
        </span>
        {freshness && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white/80 px-2 py-0.5 text-[11px] font-bold text-emerald-800" data-mastery-freshness={row.freshness}>
            <span aria-hidden="true">⏳</span> {freshness}
          </span>
        )}
      </div>

      {reason && (
        <p className="text-xs text-amber-900 leading-relaxed" data-mastery-reason={row.statusReason}>{reason}</p>
      )}

      <h4 className="font-space font-bold text-slate-900 text-sm leading-snug">{title}</h4>

      {pct !== null && (
        <div
          className="h-2.5 rounded-full bg-white/70 overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('mastery.estimatedAria', { percent: pct })}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6 }}
            className={`h-full ${c.bar}`}
          />
        </div>
      )}

      <p className="text-xs text-slate-600 leading-relaxed">{message}</p>

      {(action || onExplain) && (
        <div className="pt-1 flex items-center justify-between gap-2 flex-wrap">
          {action}
          {onExplain && (
            <button
              type="button"
              onClick={onExplain}
              className="ms-auto inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 min-h-[36px] text-xs font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={t('mastery.explain.whyAria', { title })}
              data-mastery-explain
            >
              {t('mastery.explain.why')}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Extracts one lesson's Learning Point rows from a `currentMastery` payload.
 * @param {object[]} currentMastery
 * @param {string} grade
 * @param {string} lessonId
 * @returns {object[]} learningPoints rows (possibly empty — never fabricated)
 */
export function findLessonMasteryRows(currentMastery, grade, lessonId) {
  const gradeEntry = (currentMastery || []).find((g) => g.grade === grade);
  const lessonEntry = gradeEntry?.lessons?.find((l) => l.lesson === lessonId);
  return lessonEntry?.learningPoints ?? [];
}
