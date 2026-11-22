/**
 * La VUE de l'arbre de progression : recherche, filtres et tri, appliqués
 * SANS jamais aplatir la hiérarchie. Une leçon retenue reste sous sa وحدة
 * et son ميدان ; une وحدة ou un ميدان sans descendant retenu disparaît.
 *
 * Tout est pur (aucun état React) : l'arbre entre, un arbre annoté sort.
 * Chaque nœud de leçon retenu porte `visiblePoints` — les points à montrer
 * dans son panneau — et `forceOpen` quand la recherche ou le filtre a
 * touché un point en particulier (le panneau s'ouvre alors de lui-même).
 */

export const PRIMARY_FILTERS = ['all', 'inProgress', 'work', 'done'];
export const SORTS = ['curriculum', 'recent', 'oldest', 'progress'];

export const DEFAULT_VIEW = Object.freeze({
  query: '',
  filter: 'all',
  fieldId: '',
  unitId: '',
  masteryStates: [],   // sous-ensemble de ['mastered','reinforce','gap','unassessed']
  activityStates: [],  // sous-ensemble de ['not_started','in_progress','done']
  sort: 'curriculum',
});

/**
 * Normalisation pour la recherche en arabe (et en latin) : casse,
 * diacritiques (tashkīl), tatwīl, variantes de l'alif, tā marbūta et alif
 * maqsūra — pour que « الكسور » trouve « الكُسُور » et « كسور ».
 */
export function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function matches(haystack, needle) {
  return needle ? normalizeText(haystack).includes(needle) : false;
}

/** L'ensemble des états de point que la vue retient, ou `null` = tous. */
export function pointStateSet(view) {
  const primary = view.filter === 'work' ? ['gap', 'reinforce'] : null;
  const advanced = view.masteryStates?.length ? view.masteryStates : null;
  if (!primary && !advanced) return null;
  if (primary && advanced) return new Set(primary.filter((s) => advanced.includes(s)));
  return new Set(primary || advanced);
}

function lessonPassesActivity(node, view) {
  if (view.filter === 'inProgress' && node.activityState !== 'in_progress') return false;
  if (view.filter === 'done' && node.activityState !== 'done') return false;
  if (view.activityStates?.length && !view.activityStates.includes(node.activityState)) return false;
  return true;
}

function isViewActive(view) {
  return Boolean(
    normalizeText(view.query)
    || view.filter !== 'all'
    || view.fieldId
    || view.unitId
    || view.masteryStates?.length
    || view.activityStates?.length,
  );
}

export function countAdvancedFilters(view) {
  return (view.fieldId ? 1 : 0)
    + (view.unitId ? 1 : 0)
    + (view.masteryStates?.length ? 1 : 0)
    + (view.activityStates?.length ? 1 : 0);
}

const LESSON_SORTS = {
  curriculum: (a, b) => a.order - b.order,
  recent: (a, b) => (b.lastVisitedAt - a.lastVisitedAt) || (a.order - b.order),
  // « Plus ancien » : les leçons visitées, de la plus ancienne à la plus
  // récente ; celles jamais ouvertes en dernier (elles n'ont pas de date).
  oldest: (a, b) => {
    if (a.lastVisitedAt > 0 && b.lastVisitedAt > 0) return a.lastVisitedAt - b.lastVisitedAt || a.order - b.order;
    if (a.lastVisitedAt > 0) return -1;
    if (b.lastVisitedAt > 0) return 1;
    return a.order - b.order;
  },
  progress: (a, b) => (b.progressPercent - a.progressPercent) || (a.order - b.order),
};

const GROUP_SORTS = {
  curriculum: (a, b) => a.order - b.order,
  recent: (a, b) => (b.agg.lastVisitedAt - a.agg.lastVisitedAt) || (a.order - b.order),
  oldest: (a, b) => {
    const av = a.agg.lastVisitedAt; const bv = b.agg.lastVisitedAt;
    if (av > 0 && bv > 0) return av - bv || a.order - b.order;
    if (av > 0) return -1;
    if (bv > 0) return 1;
    return a.order - b.order;
  },
  progress: (a, b) => (b.agg.avgProgress - a.agg.avgProgress) || (a.order - b.order),
};

/**
 * @param {ReturnType<import('./buildProgressionTree').buildProgressionTree>} tree
 * @param {typeof DEFAULT_VIEW} view
 */
export function applyProgressionView(tree, view = DEFAULT_VIEW) {
  const q = normalizeText(view.query);
  const states = pointStateSet(view);
  const lessonSort = LESSON_SORTS[view.sort] || LESSON_SORTS.curriculum;
  const groupSort = GROUP_SORTS[view.sort] || GROUP_SORTS.curriculum;
  const active = isViewActive(view);

  let matched = 0;

  const grades = tree.grades.map((grade) => {
    const fields = grade.fields
      .filter((field) => !view.fieldId || field.id === view.fieldId)
      .map((field) => {
        const fieldHit = matches(field.title, q) || matches(field.subtitle, q);
        const groups = field.groups
          .filter((group) => !view.unitId || group.id === view.unitId)
          .map((group) => {
            const groupHit = fieldHit || matches(group.title, q) || matches(group.subtitle, q);
            const lessons = group.lessons
              .map((node) => {
                if (!lessonPassesActivity(node, view)) return null;

                // Les points visibles : ceux de l'état retenu, puis ceux
                // que la recherche a touchés si la leçon n'a pas été
                // retenue par son propre titre (ou par un ancêtre).
                let visible = states ? node.points.filter((p) => states.has(p.state)) : node.points;
                if (states && visible.length === 0) return null;

                const lessonHit = groupHit || matches(node.lesson.title, q);
                let pointHit = false;
                if (q && !lessonHit) {
                  const hits = visible.filter((p) => matches(p.title, q));
                  if (hits.length === 0) return null;
                  visible = hits;
                  pointHit = true;
                }

                matched += 1;
                return {
                  ...node,
                  visiblePoints: visible,
                  // Le panneau s'ouvre de lui-même quand la vue vise des
                  // points précis (état ou recherche), pas seulement une leçon.
                  forceOpen: Boolean(states) || pointHit,
                };
              })
              .filter(Boolean)
              .sort(lessonSort);
            // Hors de toute vue active, une unité encore « قيد الإعداد »
            // reste visible (comptée, non dépliable) : l'élève voit
            // l'étendue du programme. Dès qu'on cherche ou filtre, seul ce
            // qui correspond reste.
            if (lessons.length === 0 && (active || group.comingSoon === 0)) return null;
            return { ...group, lessons, forceOpen: active };
          })
          .filter(Boolean)
          .sort(groupSort);
        if (groups.length === 0 && active) return null;
        return { ...field, groups, forceOpen: active };
      })
      .filter(Boolean)
      .sort(groupSort);
    return { ...grade, fields };
  }).filter((g) => g.fields.length > 0);

  return { grades, matched, total: tree.lessonCount, active };
}
