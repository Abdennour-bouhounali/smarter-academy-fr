/**
 * « le suivi de la classe » — the class on ONE lesson, student by student (owner, 2026-11-18; CLASS_SESSION.md §2bis). Pure logic
 * over what the server gives (`GET /teacher/classrooms/{id}/lesson-tracking/{lesson}`): each active student, his state on
 * every savoir-faire of the lesson, and what he did on each exercise. Facts only: no average, no rank, nobody shown as last.
 */
export const STATES = ['gap', 'reinforce', 'unassessed', 'mastered'];
export const STATE_LABEL = {
  mastered: 'Maîtrisé',
  reinforce: 'À consolider',
  gap: 'En difficulté',
  unassessed: 'Non évalué',
};

/** « ex-4am-…-l3-002 » → { level: 3, number: 2 }: what the teacher reads instead of an identifier. */
export function exerciseRef(id) {
  const m = /-l(\d)-(\d+)$/.exec(id ?? '');
  return m ? { level: Number(m[1]), number: Number(m[2]) } : { level: null, number: null };
}
export const exerciseLabel = (id) => {
  const r = exerciseRef(id);
  return r.level ? `Palier ${r.level} · exercice ${r.number}` : id;
};

/** One student in numbers: his savoir-faire by state, his exercises, his questions (answered, right, right at the first try). */
export function studentFacts(student, points) {
  const states = points.map((p) => student.points?.[p.code] ?? 'unassessed');
  const ex = student.exercises ?? [];
  const sum = (k) => ex.reduce((s, e) => s + (e[k] ?? 0), 0);
  const byLevel = {};
  for (const e of ex) {
    const l = exerciseRef(e.exerciseId).level ?? 0;
    byLevel[l] = (byLevel[l] ?? 0) + 1;
  }
  return {
    states,
    mastered: states.filter((s) => s === 'mastered').length,
    gaps: states.filter((s) => s === 'gap').length,
    reinforce: states.filter((s) => s === 'reinforce').length,
    exercises: ex.length,
    answered: sum('answered'),
    correct: sum('correct'),
    firstTry: sum('firstTry'),
    byLevel,
    started: ex.length > 0 || states.some((s) => s !== 'unassessed'),
    last: student.lastActivityAt ?? null,
  };
}

/**
 * The order a teacher needs: who needs him first — a gap, then « needs support », then those who have not started, then
 * the others; inside a group, by name. Never a ranking by score.
 */
export function orderStudents(students, points) {
  const group = (f) => (f.gaps > 0 ? 0 : f.reinforce > 0 ? 1 : !f.started ? 2 : 3);
  return students
    .map((s) => ({ ...s, facts: studentFacts(s, points) }))
    .sort(
      (a, b) =>
        group(a.facts) - group(b.facts) ||
        `${a.firstName ?? ''} ${a.lastName ?? ''}`.localeCompare(`${b.firstName ?? ''} ${b.lastName ?? ''}`, 'ar'),
    );
}

/** The class in facts: per savoir-faire how many students in each state, and how many have not started the lesson. */
export function classFacts(students, points) {
  const perPoint = points.map((p) => {
    const c = { mastered: 0, reinforce: 0, gap: 0, unassessed: 0 };
    for (const s of students) c[s.points?.[p.code] ?? 'unassessed'] += 1;
    return { ...p, counts: c };
  });
  const facts = students.map((s) => studentFacts(s, points));
  return {
    students: students.length,
    notStarted: facts.filter((f) => !f.started).length,
    practising: facts.filter((f) => f.exercises > 0).length,
    perPoint,
  };
}

/** The exercises of one student, in the order of the bank; each with what is left to get right. */
export const exercisesOf = (student) =>
  [...(student.exercises ?? [])]
    .map((e) => ({ ...e, ...exerciseRef(e.exerciseId), missed: e.answered - e.correct }))
    .sort((a, b) => (a.level ?? 9) - (b.level ?? 9) || (a.number ?? 0) - (b.number ?? 0));

/** Was a recorded answer right? The server names its outcomes (`Outcome`): « correct » and « equivalent_correct » are right; « partially_correct » is not. */
export const isRight = (outcome) => outcome === 'correct' || outcome === 'equivalent_correct';

/**
 * What ONE student did on ONE exercise, question by question, for the teacher's window: every try in order (what he
 * wrote is formatted by the caller), whether the LAST try is right, and how many tries it took.
 * `responses` = the server's `questions[{ questionId, attempts[] }]`; `exercise` = the exercise of the bank.
 */
export function studentWork(exercise, responses) {
  const byId = Object.fromEntries((responses ?? []).map((r) => [r.questionId, r.attempts ?? []]));
  return (exercise?.questions ?? []).map((q, k) => {
    const tries = [...(byId[q.id] ?? [])].sort((a, b) => (a.attemptNumber ?? 0) - (b.attemptNumber ?? 0));
    const last = tries[tries.length - 1] ?? null;
    return {
      question: q,
      number: k + 1,
      tries,
      answered: tries.length > 0,
      right: last ? isRight(last.outcome) : null,
      firstTry: tries.length > 0 && isRight(tries[0].outcome),
    };
  });
}
