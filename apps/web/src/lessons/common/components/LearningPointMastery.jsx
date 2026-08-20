import React from 'react';
import { motion } from 'framer-motion';

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
 * the student — only the French state labels below.
 */

export const MASTERY_STATES = {
  unassessed: { emoji: '⚪', label: 'Pas encore évalué', tone: 'slate' },
  gap: { emoji: '🔴', label: 'À renforcer', tone: 'rose' },
  reinforce: { emoji: '🟡', label: 'En cours', tone: 'amber' },
  mastered: { emoji: '🟢', label: 'Maîtrisé', tone: 'emerald' },
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
 */
export function LearningPointCard({ title, state, confidence, message, action }) {
  const s = MASTERY_STATES[state] || MASTERY_STATES.unassessed;
  const c = TONE_CLASSES[s.tone];
  const pct = typeof confidence === 'number' ? Math.round(confidence * 100) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 p-5 space-y-3 ${c.border} ${c.bg}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold ${c.pill}`}>
          <span aria-hidden="true">{s.emoji}</span> {s.label}
        </span>
      </div>

      <h4 className="font-space font-bold text-slate-900 text-sm leading-snug">{title}</h4>

      {pct !== null && (
        <div
          className="h-2.5 rounded-full bg-white/70 overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Maîtrise estimée : ${pct}%`}
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

      {action && <div className="pt-1">{action}</div>}
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
