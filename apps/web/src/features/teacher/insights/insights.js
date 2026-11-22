/**
 * Les signaux, l'aperçu et les interventions, vus par l'écran — logique pure,
 * sans React (même idiome que learningPoints/lpBar.js).
 *
 * Le serveur DÉCIDE (App\Domain\Classroom\Insights) : quel signal existe,
 * quel statut a un élève, s'il a progressé. Ce fichier ne fait que
 * TRADUIRE ces décisions en clés de libellés et en valeurs de formulaire ;
 * il ne recalcule jamais une règle pédagogique.
 */

/** Les gestes d'intervention, dans l'ordre où l'enseignant les voit. */
export const INTERVENTION_KINDS = Object.freeze([
  'individual_followup',
  'class_reinforcement',
  'recommend_practice',
  'review_prerequisite',
  'recommend_lesson',
  'observation',
]);

/** Ces gestes n'ont de sens que sur un point d'apprentissage (règle du serveur). */
const POINT_KINDS = new Set(['class_reinforcement', 'review_prerequisite', 'recommend_practice']);

/** Ces gestes sont VUS de l'élève, comme une suggestion — jamais un verrou. */
const STUDENT_VISIBLE_KINDS = new Set(['review_prerequisite', 'recommend_lesson', 'recommend_practice']);

export const kindNeedsPoint = (kind) => POINT_KINDS.has(kind);
export const kindVisibleToStudent = (kind) => STUDENT_VISIBLE_KINDS.has(kind);

/**
 * Le nom d'un élève pour l'enseignant. Il n'y a PAS de repli sur le
 * courriel : le serveur ne l'envoie plus, et l'écran ne doit pas l'attendre.
 */
export function studentName(student, placeholder = '—') {
  if (!student) return placeholder;
  return [student.firstName, student.lastName].filter(Boolean).join(' ') || placeholder;
}

/**
 * Ce que le formulaire d'intervention propose quand il s'ouvre depuis un
 * signal : le premier geste suggéré par le serveur, les élèves du signal,
 * son point.
 */
export function interventionDefaults(signal) {
  if (!signal) return { kind: INTERVENTION_KINDS[0], studentIds: [], learningPointCode: null, sourceSignal: null };
  const suggested = (signal.actions ?? []).find((k) => INTERVENTION_KINDS.includes(k));
  const kind = suggested && (!kindNeedsPoint(suggested) || signal.learningPoint) ? suggested : 'individual_followup';
  return {
    kind,
    studentIds: (signal.students ?? []).map((s) => s.id),
    learningPointCode: signal.learningPoint?.code ?? null,
    sourceSignal: signal.type ?? null,
  };
}

/**
 * Les paramètres de la phrase « pourquoi » d'un signal : les NOMBRES que le
 * serveur a mis dans `indicator` et dans la preuve des élèves.
 */
export function signalWhyParams(signal) {
  const students = signal?.students ?? [];
  const first = students[0] ?? {};
  const failures = students.reduce((sum, s) => sum + (Number(s.recent?.failures) || 0), 0);
  const answered = students.reduce((sum, s) => sum + (Number(s.recent?.answered) || 0), 0);
  return {
    count: students.length,
    gap: Number(signal?.indicator?.gap) || 0,
    assessed: Number(signal?.indicator?.assessed) || 0,
    members: Number(signal?.indicator?.members) || 0,
    failures,
    answered,
    days: Number(signal?.indicator?.days) || 0,
    neverStarted: Number(signal?.indicator?.neverStarted) || 0,
    from: first.statusAtWindowStart ?? null,
    to: first.status ?? null,
  };
}

/** La tonalité d'une tendance d'élève (les classes de couleur, pas un jugement). */
export const TREND_TONE = Object.freeze({
  improving: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  declining: 'bg-rose-50 text-rose-700 ring-rose-200',
  mixed: 'bg-amber-50 text-amber-800 ring-amber-200',
  started: 'bg-sky-50 text-sky-800 ring-sky-200',
  stable: 'bg-slate-100 text-slate-700 ring-slate-200',
  no_recent_evidence: 'bg-slate-50 text-slate-500 ring-slate-200',
});

/** La tonalité d'un mouvement de statut. */
export const DIRECTION_TONE = Object.freeze({
  improved: 'text-emerald-700',
  declined: 'text-rose-700',
  unchanged: 'text-slate-500',
  first_assessed: 'text-sky-700',
  not_assessed: 'text-slate-400',
});

/**
 * La trajectoire d'un point dans la classe : pour chaque semaine, les
 * segments d'une barre (mêmes couleurs que la carte), « inconnu » compris —
 * un élève dont l'histoire n'est pas enregistrée n'est pas deviné.
 *
 * @param {Array<{until: string, counts: Record<string, number>}>} weeks
 */
export function trajectoryColumns(weeks) {
  const keys = ['mastered', 'reinforce', 'gap', 'unassessed', 'unknown'];
  return (weeks ?? []).map((week) => {
    const total = keys.reduce((sum, key) => sum + (Number(week.counts?.[key]) || 0), 0);
    return {
      until: week.until,
      total,
      segments: keys.map((key) => {
        const count = Number(week.counts?.[key]) || 0;
        return { key, count, percent: total > 0 ? (count * 100) / total : 0 };
      }),
    };
  });
}

/**
 * La mesure d'une intervention, en une ligne : combien d'élèves ont une
 * preuve nouvelle, et parmi eux combien ont bougé dans chaque sens. Aucune
 * conclusion causale n'est tirée ici : ce sont des comptes.
 */
export function outcomeLine(summary) {
  if (!summary) return null;
  return {
    students: Number(summary.students) || 0,
    withNewEvidence: Number(summary.withNewEvidence) || 0,
    noNewEvidence: Number(summary.noNewEvidence) || 0,
    improved: Number(summary.improved) || 0,
    declined: Number(summary.declined) || 0,
    unchanged: Number(summary.unchanged) || 0,
    firstAssessed: Number(summary.firstAssessed) || 0,
  };
}
