import { flattenTree } from '../progression/buildProgressionTree';

/**
 * « 📚 أين أنت » — la TRANCHE de programme que l'accueil montre : un seul
 * ميدان, sa وحدة (s'il y en a une) et une seule leçon. Pas l'arbre : l'arbre
 * est la page « تقدّمي ». Ici on oriente, on n'analyse pas.
 *
 * La leçon de référence est, dans l'ordre :
 *   1. la leçon visée par le héros (`focusLessonId`), si elle est dans la
 *      classe courante ;
 *   2. sinon la leçon de la classe visitée le plus récemment ;
 *   3. sinon la première leçon construite, dans l'ordre officiel — un élève
 *      qui n'a rien commencé voit le DÉBUT de son programme.
 *
 * Les pourcentages sont ceux de l'arbre (progression dans les محاور, jamais
 * une maîtrise) ; rien n'est recalculé ici.
 */
export function pickCurriculumContext(tree, focusLessonId = null) {
  const all = flattenTree(tree);
  if (all.length === 0) return null;

  const focused = focusLessonId ? all.find((x) => x.lesson.id === focusLessonId) : null;
  const recent = all
    .filter((x) => x.lesson.lastVisitedAt > 0)
    .sort((a, b) => b.lesson.lastVisitedAt - a.lesson.lastVisitedAt)[0];
  const pick = focused || recent || all[0];

  return {
    field: { id: pick.field.id, title: pick.field.title, percent: pick.field.agg.avgProgress },
    unit: pick.group.kind === 'unit'
      ? { id: pick.group.id, number: pick.group.number, title: pick.group.title, percent: pick.group.agg.avgProgress, path: pick.group.path }
      : null,
    lesson: {
      id: pick.lesson.id,
      title: pick.lesson.lesson.title,
      icon: pick.lesson.lesson.icon,
      percent: pick.lesson.progressPercent,
      activityState: pick.lesson.activityState,
      path: pick.lesson.cta.path,
    },
  };
}

/**
 * Index des nœuds de l'arbre par identifiant de leçon — pour que la liste
 * « واصل مسارك » retrouve la وحدة / le ميدان et le bon chemin de reprise
 * (`cta.path`, le pont numéro → chemin du registre) d'une leçon récente sans
 * re-parcourir l'arbre à chaque ligne.
 */
export function indexTreeByLesson(tree) {
  const map = new Map();
  for (const entry of flattenTree(tree)) map.set(entry.lesson.id, entry);
  return map;
}

/**
 * Le contexte CATALOGUE d'une leçon, toutes classes confondues : son ميدان,
 * sa وحدة (ou null), sa classe. Sert au héros, qui peut proposer une leçon
 * d'une AUTRE classe que celle de l'élève (getResumeLesson n'est pas cadré,
 * et c'est voulu) — l'arbre de la page, lui, est cadré.
 */
export function indexCurriculum(courseLevels) {
  const map = new Map();
  for (const level of courseLevels) {
    for (const grade of level.grades || []) {
      for (const chapter of grade.chapters || []) {
        const unitOf = new Map();
        for (const unit of chapter.units || []) {
          for (const l of unit.lessons || []) unitOf.set(l.id, unit);
          if (unit.synthesis) unitOf.set(unit.synthesis.id, unit);
        }
        for (const lesson of chapter.lessons || []) {
          map.set(lesson.id, { level, grade, field: chapter, unit: unitOf.get(lesson.id) || null });
        }
      }
    }
  }
  return map;
}
