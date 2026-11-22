import { flattenTree } from './buildProgressionTree';

/**
 * « للعمل الآن » — une règle DÉTERMINISTE et lisible, pas un moteur de
 * recommandation : on ne pioche que dans les états réels du profil.
 *
 *  1. les points « gap » (🔴 يحتاج إلى تدعيم) d'abord, puis « reinforce »
 *     (🟡 قيد التحسّن) ;
 *  2. à état égal, la leçon la plus RÉCEMMENT visitée d'abord (c'est là que
 *     l'élève est) ;
 *  3. puis l'ordre officiel du programme (ميدان, وحدة, درس, point) ;
 *  4. et on n'en montre qu'un petit nombre (`limit`) — le reste se retrouve
 *     dans l'arbre avec le filtre « للعمل ».
 *
 * L'arbre est déjà cadré sur la classe de l'élève : la règle n'a pas à
 * refiltrer. Les points « non évalués » ne sont JAMAIS proposés ici — ne pas
 * avoir été évalué n'est pas une lacune.
 */
const STATE_RANK = { gap: 0, reinforce: 1 };

export function pickWorkNow(tree, { limit = 4 } = {}) {
  const items = [];
  for (const { field, group, lesson } of flattenTree(tree)) {
    for (const point of lesson.points) {
      if (!(point.state in STATE_RANK)) continue;
      items.push({ point, lesson, group, field });
    }
  }
  items.sort((a, b) =>
    (STATE_RANK[a.point.state] - STATE_RANK[b.point.state])
    || (b.lesson.lastVisitedAt - a.lesson.lastVisitedAt)
    || (a.field.order - b.field.order)
    || (a.group.order - b.group.order)
    || (a.lesson.order - b.lesson.order)
    || (a.point.order - b.point.order));
  return { items: items.slice(0, limit), total: items.length };
}

/**
 * Quand rien n'est à retravailler : la prochaine étape naturelle dans
 * l'ordre du programme — une leçon en cours d'abord, sinon la première non
 * commencée. `null` quand tout est terminé.
 */
export function pickNextStep(tree) {
  const all = flattenTree(tree);
  return all.find((x) => x.lesson.activityState === 'in_progress')
    || all.find((x) => x.lesson.activityState === 'not_started')
    || null;
}
