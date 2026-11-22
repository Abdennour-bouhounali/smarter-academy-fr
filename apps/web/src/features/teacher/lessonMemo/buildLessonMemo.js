/**
 * LA مذكرة الدرس — construite, jamais écrite.
 *
 * Une fonction PURE qui transforme ce que la leçon contient déjà en document
 * d'ORCHESTRATION pour l'enseignant. Aucune mathématique, aucun exemple,
 * aucun objectif n'est inventé ici :
 *
 *   catalogue (packages/core)  titre, durée, points d'apprentissage,
 *                              prérequis, pages du manuel, unité
 *   lesson.config.js           محاور (stage, durée, description),
 *                              compétences (skills), périmètre, manipulations
 *   knowledge.jsx              briques de savoir (titre + résumé)
 *   content/*.js               activité du manuel (situation, questions,
 *                              clôture), exercices (énoncé, correction,
 *                              difficulté, erreur fréquente)
 *
 * Ce qui relève du GESTE pédagogique — ce que fait l'enseignant, ce que font
 * les élèves, l'intention d'une phase — vient du `stage` du محور et est
 * rédigé une fois, par stage, dans le catalogue i18n `memo`. Un contenu
 * absent donne une section vide (`[]` / `null`) que la page n'affiche pas :
 * la مذكرة reste digne de confiance.
 */

/** Les exercices, quel que soit le nom d'export (EXERCISES, EXERCISES_1, …). */
export function collectExercises(content) {
  const out = [];
  for (const [name, value] of Object.entries(content ?? {})) {
    if (!/^EXERCISES(_\d+)?$/.test(name) || !Array.isArray(value)) continue;
    for (const ex of value) if (ex && typeof ex === 'object' && ex.id) out.push(ex);
  }
  return out;
}

/** L'activité de départ du manuel : ACTIVITY, sinon ACTIVITY_A, sinon SITUATION. */
export function pickStartActivity(content) {
  const raw = content?.ACTIVITY ?? content?.ACTIVITY_A ?? content?.SITUATION ?? null;
  if (!raw || typeof raw !== 'object') return null;
  const situation = raw.situation ?? raw.text ?? null;
  const questions = Array.isArray(raw.questions) ? raw.questions.filter((q) => typeof q === 'string') : [];
  if (!situation && questions.length === 0) return null;
  return {
    title: raw.title ?? null,
    subtitle: raw.subtitle ?? null,
    situation,
    questions,
    closing: raw.closing ?? null,
    hint: raw.hint ?? null,
    page: raw.source?.page ?? null,
  };
}

/** Les briques de savoir, dans l'ordre des محاور, avec leur محور. */
export function collectBricks(knowledge) {
  const modules = knowledge?.modules ?? {};
  return Object.keys(modules)
    .map(Number)
    .filter(Number.isFinite)
    .sort((a, b) => a - b)
    .flatMap((n) => (modules[n] ?? []).filter((b) => b?.title).map((b) => ({
      id: b.id, type: b.type ?? null, title: b.title, summary: b.summary ?? null, moduleNumber: n,
    })));
}

const DIFFICULTY_TIER = { facile: 'support', moyen: 'core', difficile: 'extension', maitrise: 'extension' };
const LEVEL_TIER = { beginner: 'support', advanced: 'core' };

function exerciseView(ex, lpTitles, brickFor) {
  const q = ex.question ?? {};
  const brick = brickFor(ex.learningPointId);
  return {
    id: ex.id,
    statement: ex.statement ?? q.prompt ?? null,
    prompt: ex.statement ? q.prompt ?? null : null,
    explain: typeof q.explain === 'string' ? q.explain : null,
    commonError: ex.commonError ?? null,
    difficulty: ex.difficulty ?? null,
    tier: DIFFICULTY_TIER[ex.difficulty] ?? null,
    learningPointId: ex.learningPointId ?? null,
    learningPoint: lpTitles.get(ex.learningPointId) ?? null,
    source: ex.source?.type === 'textbook'
      ? { page: ex.source.page ?? null, section: ex.source.section ?? null, number: ex.source.number ?? null }
      : null,
    // Le coup de pouce : la brique de savoir du محور qui enseigne ce point.
    hint: brick ? { title: brick.title, summary: brick.summary } : null,
  };
}

/**
 * @param {{
 *   lesson: object,          catalogue (getLessonById)
 *   config: object,          LESSON_CONFIG
 *   unit?: object|null,      getUnitOfLesson
 *   knowledge?: object|null, LESSON_KNOWLEDGE
 *   content?: object,        exports fusionnés de content/*.js
 *   lessonById?: (id: string) => object|null,
 *   unitLessons?: Array,     les leçons de l'unité dans l'ordre du manuel
 * }} input
 */
export function buildLessonMemo({ lesson, config, unit = null, knowledge = null, content = {}, lessonById = () => null, unitLessons = [] }) {
  const modules = [...(config?.modules ?? [])];
  const learningPoints = (lesson?.learningPoints ?? []).map((lp) => ({ id: lp.id, title: lp.title }));
  const lpTitles = new Map(learningPoints.map((lp) => [lp.id, lp.title]));
  const bricks = collectBricks(knowledge);
  const resources = config?.resources ?? [];
  const activity = pickStartActivity(content);

  // Le محور qui enseigne un point → sa première brique : le coup de pouce.
  const moduleOfLp = new Map();
  for (const m of modules) for (const id of m.teachesLearningPointIds ?? []) if (!moduleOfLp.has(id)) moduleOfLp.set(id, m.number);
  const brickFor = (lpId) => {
    const n = moduleOfLp.get(lpId);
    return n === undefined ? null : bricks.find((b) => b.moduleNumber === n) ?? null;
  };

  const exercises = collectExercises(content).map((ex) => exerciseView(ex, lpTitles, brickFor));
  const errors = exercises.filter((ex) => ex.commonError);

  // ── La ligne du temps : un محور = une phase ────────────────────────────
  let clock = 0;
  const phases = modules.map((m, i) => {
    const teaches = new Set(m.teachesLearningPointIds ?? []);
    const startsAt = clock;
    const minutes = Number.isFinite(m.estimatedMin) ? m.estimatedMin : null;
    clock += minutes ?? 0;
    const next = modules[i + 1] ?? null;
    const moduleResources = resources.filter((r) => Number(r.module) === Number(m.number));
    return {
      index: i + 1,
      number: m.number,
      stage: m.stage ?? null,
      title: m.title,
      desc: m.desc ?? null,
      minutes,
      startsAt,
      path: m.path ?? null,
      actionText: m.actionText ?? null,
      learningPoints: [...teaches].map((id) => lpTitles.get(id)).filter(Boolean),
      manipulations: moduleResources.filter((r) => r.kind === 'manipulation').map((r) => ({ title: r.title, level: r.level ?? null, objective: r.objective ?? null })),
      otherResources: moduleResources.filter((r) => r.kind !== 'manipulation').map((r) => ({ kind: r.kind, title: r.title })),
      bricks: bricks.filter((b) => b.moduleNumber === m.number),
      // Les questions du manuel appartiennent à la phase qui porte l'activité.
      questions: m.stage === 'trigger' && activity ? activity.questions : [],
      // Les erreurs des exercices qui travaillent un point enseigné ici.
      vigilance: errors.filter((ex) => teaches.has(ex.learningPointId)).map((ex) => ex.commonError),
      next: next ? { number: next.number, title: next.title } : null,
    };
  });
  const plannedMinutes = phases.reduce((sum, p) => sum + (p.minutes ?? 0), 0);

  // ── Différenciation : seulement ce que la leçon offre déjà ──────────────
  const manipulationsByTier = { support: [], core: [], extension: [] };
  for (const r of resources.filter((x) => x.kind === 'manipulation' && x.level)) {
    const tier = LEVEL_TIER[r.level];
    if (tier) manipulationsByTier[tier].push({ title: r.title, module: r.module });
  }
  const differentiation = Object.fromEntries(['support', 'core', 'extension'].map((tier) => [tier, {
    manipulations: manipulationsByTier[tier],
    exercises: exercises.filter((ex) => ex.tier === tier).map((ex) => ({ id: ex.id, statement: ex.statement, source: ex.source })),
  }]));

  // ── La suite ──────────────────────────────────────────────────────────
  const order = unitLessons.map((l) => l.id);
  const at = order.indexOf(lesson?.id);
  const nextInUnit = at >= 0 && at < order.length - 1 ? unitLessons[at + 1] : null;
  const dependents = unitLessons.filter((l) => (l.prerequisiteLessonCodes ?? []).includes(lesson?.id));
  const prerequisiteLessons = (lesson?.prerequisiteLessonCodes ?? []).map((id) => lessonById(id)).filter(Boolean);
  const evaluationPhase = phases.find((p) => p.stage === 'evaluation') ?? null;

  // Le ticket de sortie : le premier exercice « facile » du manuel, sinon le premier.
  const exitTicket = exercises.find((ex) => ex.tier === 'support' && ex.statement) ?? exercises.find((ex) => ex.statement) ?? null;

  return {
    header: {
      id: lesson?.id,
      title: lesson?.title ?? config?.title,
      icon: lesson?.icon ?? config?.emoji ?? null,
      kind: config?.kind ?? lesson?.kind ?? 'lesson',
      description: lesson?.description ?? config?.description ?? null,
      grade: lesson?.gradeName ?? null,
      chapter: lesson?.chapterTitle ?? config?.chapterTitle ?? null,
      unit: unit ? { number: unit.number, title: unit.title, path: unit.path } : null,
      durationMinutes: config?.estimatedDurationMin ?? lesson?.durationMinutes ?? null,
      plannedMinutes,
      moduleCount: phases.length,
      path: lesson?.path ?? null,
    },
    objectives: {
      knowledge: bricks,
      skills: config?.skills?.length ? config.skills : (lesson?.pointsToLearn ?? []),
      learningPoints,
      scope: { include: config?.teachingScope?.include ?? [], exclude: config?.teachingScope?.exclude ?? [] },
      unitObjectives: unit?.objectives ?? [],
    },
    prerequisites: {
      lessons: prerequisiteLessons.map((l) => ({ id: l.id, title: l.title, path: l.path })),
      notions: lesson?.prerequisites ?? [],
    },
    start: activity ? {
      ...activity,
      phase: phases.find((p) => p.stage === 'trigger') ?? phases[0] ?? null,
    } : null,
    phases,
    examples: exercises.filter((ex) => ex.statement && (ex.explain || ex.commonError)).slice(0, 4),
    errors,
    differentiation,
    trace: {
      observation: activity?.closing ?? null,
      bricks,
      warnings: errors.slice(0, 3).map((ex) => ex.commonError),
    },
    evaluation: {
      phase: evaluationPhase,
      oral: bricks.filter((b) => b.summary).map((b) => ({ title: b.title, answer: b.summary })),
      indicators: learningPoints.map((lp) => lp.title),
      exitTicket,
    },
    next: {
      nextLesson: nextInUnit ? { id: nextInUnit.id, title: nextInUnit.title, path: nextInUnit.path } : null,
      dependents: dependents.map((l) => ({ id: l.id, title: l.title, path: l.path })),
      remediation: prerequisiteLessons.map((l) => ({ id: l.id, title: l.title, path: l.path })),
      assignable: exercises.filter((ex) => ex.statement).length,
    },
  };
}
