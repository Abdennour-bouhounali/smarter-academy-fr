import { getNextIncompleteModule } from '@smarter-academy/core';
import { resolveMasteryState, findLessonMasteryRows } from '../../lessons/common/components/LearningPointMastery';

/**
 * L'ARBRE de la page « Ma progression » : classe → thème (chapter) → chapitre (unit) →
 * leçon → savoir-faire, construit à partir de DEUX sources existantes et de
 * rien d'autre :
 *
 *  - le catalogue (`courseLevels`, packages/core) donne la STRUCTURE et
 *    l'ordre officiel — les thèmes, leurs unités du manuel, les leçons hors
 *    unité (même règle que components/student/unitGrouping.js), et la liste
 *    complète des points de chaque leçon ;
 *  - l'activité (`getStudentActivity`) donne la progression réelle par leçon
 *    (modules complétés, dernière visite), et le profil d'apprentissage
 *    (`currentMastery`, API) l'état réel de chaque point.
 *
 * Aucun pourcentage n'est inventé : la progression d'une leçon est celle des
 * modules (source existante), la maîtrise est un DÉCOMPTE d'états par point
 * (resolveMasteryState), et les niveaux supérieurs ne font qu'ADDITIONNER.
 * Un point « non évalué » n'entre jamais dans un dénominateur de maîtrise.
 *
 * Seules les leçons CONSTRUITES (présentes dans l'activité) portent une
 * progression ; les autres sont comptées « En préparation » pour que l'élève
 * voie l'étendue du programme sans qu'on leur prête un 0 %.
 */

export const ACTIVITY_STATES = ['not_started', 'in_progress', 'done'];
export const MASTERY_STATE_KEYS = ['mastered', 'reinforce', 'gap', 'unassessed'];

function emptyCounts() {
  return { mastered: 0, reinforce: 0, gap: 0, unassessed: 0 };
}

function activityStateOf(entry) {
  if (!entry || entry.lastVisitedAt <= 0) return 'not_started';
  return entry.progressPercent >= 100 ? 'done' : 'in_progress';
}

/**
 * Les points d'une leçon, fusionnés : la liste complète et l'ordre viennent
 * du catalogue, l'état vient du profil. Un point absent du profil est
 * « unassessed » — jamais autre chose.
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
      state: resolveMasteryState(row),
      confidence: row?.confidence,
      // Mastery V2 : la raison d'un `reinforce`, la fraîcheur d'un acquis et
      // le compteur d'items distincts — lus, jamais calculés ici.
      statusReason: row?.statusReason ?? null,
      freshness: row?.freshness ?? null,
      distinctItemsSuccess: row?.distinctItemsSuccess,
    };
  });
}

function countStates(points) {
  const counts = emptyCounts();
  for (const p of points) counts[p.state] = (counts[p.state] || 0) + 1;
  return counts;
}

/**
 * Le libellé d'action d'une leçon, et son chemin. « Continuer » mène au
 * prochain module incomplet via le registre (même pont que getResumeLesson),
 * jamais à une URL fabriquée ; sans module résolu, l'index de la leçon.
 */
function ctaOf(entry, counts, lesson, getModulePath, getFirstModuleNumber) {
  const state = activityStateOf(entry);
  const hasWork = counts.gap + counts.reinforce > 0;
  if (state === 'not_started') return { kind: 'start', path: lesson.path };
  if (state === 'in_progress') {
    // Le premier module n'est pas toujours 1 : une leçon qui ouvre sur
    // « Je me prépare » commence à 0, et « continuer » doit la reprendre là.
    const first = getFirstModuleNumber?.(lesson.id) ?? 1;
    const next = getNextIncompleteModule(entry.uniqueModules ?? new Set(), entry.totalCount, first);
    return { kind: 'continue', path: getModulePath?.(lesson.id, next) || lesson.path };
  }
  return { kind: hasWork ? 'reviewGaps' : 'review', path: lesson.path };
}

function buildLessonNode(lesson, ctx) {
  const entry = ctx.activityById.get(lesson.id) || null;
  if (!entry) return null; // pas construite : comptée à part, jamais à 0 %
  const points = mergeLearningPoints(lesson, ctx.currentMastery, ctx.gradeId);
  const counts = countStates(points);
  const assessed = points.length - counts.unassessed;
  return {
    id: lesson.id,
    lesson,
    isSynthesis: lesson.kind === 'synthesis',
    order: ctx.order++,
    progressPercent: entry.progressPercent,
    lastVisitedAt: entry.lastVisitedAt,
    totalCount: entry.totalCount,
    activityState: activityStateOf(entry),
    points,
    counts,
    assessed,
    hasWork: counts.gap + counts.reinforce > 0,
    cta: ctaOf(entry, counts, lesson, ctx.getModulePath, ctx.getFirstModuleNumber),
  };
}

/** Additionne des nœuds de leçon ; ne calcule aucun ratio de maîtrise. */
export function aggregateLessons(lessonNodes) {
  const counts = emptyCounts();
  let progressSum = 0;
  let lastVisitedAt = 0;
  let started = 0;
  let done = 0;
  for (const n of lessonNodes) {
    for (const k of MASTERY_STATE_KEYS) counts[k] += n.counts[k];
    progressSum += n.progressPercent;
    if (n.lastVisitedAt > lastVisitedAt) lastVisitedAt = n.lastVisitedAt;
    if (n.activityState !== 'not_started') started += 1;
    if (n.activityState === 'done') done += 1;
  }
  const points = MASTERY_STATE_KEYS.reduce((s, k) => s + counts[k], 0);
  return {
    lessons: lessonNodes.length,
    started,
    done,
    inProgress: started - done,
    // Moyenne de la progression des leçons construites — la même règle que
    // « Mes leçons » (getChapterProgress). 0 quand rien n'est construit.
    avgProgress: lessonNodes.length ? Math.round(progressSum / lessonNodes.length) : 0,
    counts,
    points,
    assessed: points - counts.unassessed,
    hasWork: counts.gap + counts.reinforce > 0,
    lastVisitedAt,
  };
}

function buildUnitNode(unit, ctx, index) {
  // Les leçons de l'unité dans l'ordre du manuel, puis sa synthèse (« Vers le
  // brevet »), qui a ses modules et ses points comme toute leçon, mais
  // n'est pas comptée parmi les leçons de l'unité (règle de buildDzUnit).
  const catalogueLessons = [...unit.lessons, ...(unit.synthesis ? [unit.synthesis] : [])];
  const lessons = [];
  let comingSoon = 0;
  for (const l of catalogueLessons) {
    const node = buildLessonNode(l, ctx);
    if (node) lessons.push(node);
    else comingSoon += 1;
  }
  return {
    id: unit.id,
    kind: 'unit',
    number: unit.number,
    title: unit.title,
    subtitle: unit.subtitle,
    path: unit.path,
    order: index,
    lessonCount: unit.lessons.length,
    hasSynthesis: Boolean(unit.synthesis),
    lessons,
    comingSoon,
    agg: aggregateLessons(lessons),
  };
}

/** Les leçons hors unité d'un thème, présentées comme un groupe à part. */
function buildOtherGroup(chapter, restLessons, ctx, index) {
  const lessons = [];
  let comingSoon = 0;
  for (const l of restLessons) {
    const node = buildLessonNode(l, ctx);
    if (node) lessons.push(node);
    else comingSoon += 1;
  }
  return {
    id: `${chapter.id}__other`,
    kind: 'other',
    number: null,
    title: null,
    subtitle: null,
    path: null,
    order: index,
    lessonCount: restLessons.length,
    hasSynthesis: false,
    lessons,
    comingSoon,
    agg: aggregateLessons(lessons),
  };
}

function buildFieldNode(chapter, ctx, index) {
  const units = (chapter.units || []).map((u, i) => buildUnitNode(u, ctx, i));
  const inUnit = new Set(units.flatMap((u) => [...u.lessons.map((l) => l.id)]));
  for (const u of chapter.units || []) {
    for (const l of u.lessons) inUnit.add(l.id);
    if (u.synthesis) inUnit.add(u.synthesis.id);
  }
  const rest = (chapter.lessons || []).filter((l) => !inUnit.has(l.id));
  const groups = [...units];
  if (rest.length) groups.push(buildOtherGroup(chapter, rest, ctx, units.length));

  const lessons = groups.flatMap((g) => g.lessons);
  return {
    id: chapter.id,
    title: chapter.title,
    subtitle: chapter.subtitle || null,
    number: index + 1,
    order: index,
    groups,
    lessonCount: (chapter.lessons || []).length,
    comingSoon: groups.reduce((s, g) => s + g.comingSoon, 0),
    agg: aggregateLessons(lessons),
  };
}

/**
 * @param {Array} courseLevels
 * @param {{ lessons: Array }} activity  le retour de getStudentActivity
 * @param {Array} currentMastery         profile.currentMastery (déjà cadré)
 * @param {{ gradeId?: string|null, getModulePath?: Function, getFirstModuleNumber?: Function }} options
 */
export function buildProgressionTree(courseLevels, activity, currentMastery, { gradeId = null, getModulePath, getFirstModuleNumber } = {}) {
  const activityById = new Map((activity?.lessons || []).map((e) => [e.lesson.id, e]));
  const grades = [];
  for (const level of courseLevels) {
    for (const grade of level.grades) {
      if (gradeId && grade.id !== gradeId) continue;
      if (!grade.chapters?.length) continue;
      const ctx = { activityById, currentMastery, gradeId: grade.id, getModulePath, getFirstModuleNumber, order: 0 };
      const fields = grade.chapters.map((c, i) => buildFieldNode(c, ctx, i));
      grades.push({
        id: grade.id,
        name: grade.name,
        label: `${level.title} ${grade.name}`,
        fields,
        agg: aggregateLessons(fields.flatMap((f) => f.groups.flatMap((g) => g.lessons))),
      });
    }
  }
  const all = grades.flatMap((g) => g.fields.flatMap((f) => f.groups.flatMap((gr) => gr.lessons)));
  return { grades, agg: aggregateLessons(all), lessonCount: all.length };
}

/** Toutes les leçons construites de l'arbre, avec leur thème et leur chapitre. */
export function flattenTree(tree) {
  const out = [];
  for (const grade of tree.grades) {
    for (const field of grade.fields) {
      for (const group of field.groups) {
        for (const lesson of group.lessons) out.push({ grade, field, group, lesson });
      }
    }
  }
  return out;
}
