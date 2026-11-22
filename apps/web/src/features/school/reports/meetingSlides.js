/**
 * « وضع الاجتماع » — le découpage d'un rapport FIGÉ en diapositives
 * (SCHOOL_ADMIN_SPACE.md, phase 6). Fonctions PURES : la page ne fait que
 * dessiner la diapositive courante.
 *
 * Une diapositive tient sur un écran de projecteur : une leçon (ses كفاءات en
 * effectifs), les élèves à suivre, les كفاءات les plus difficiles, un niveau,
 * les enseignants. Jamais une moyenne.
 */

/**
 * Une leçon mérite une diapositive si au moins un élève y a un état
 * (متحكَّم فيها, تعزيز ou ثغرة) : l'année entière, encore vierge, ferait
 * soixante-dix diapositives vides. Le rapport imprimé, lui, reste complet.
 */
function hasEvidence(lesson) {
  return (lesson.learningPoints ?? []).some((lp) => {
    const cells = lp.counts ? [lp.counts] : Object.values(lp.byClass ?? {});
    return cells.some((c) => (c?.mastered ?? 0) + (c?.reinforce ?? 0) + (c?.gap ?? 0) > 0);
  });
}

/** Les rapports où les noms sont masqués par défaut quand on projette (conseil élargi). */
export const HIDE_NAMES_BY_DEFAULT = ['grade', 'school_term', 'teachers'];

/**
 * @param {{type: string, payload: object}} report
 * @returns {Array<{kind: string, [key: string]: unknown}>}
 */
export function buildSlides(report) {
  const p = report.payload ?? {};
  const slides = [{ kind: 'title' }];

  switch (report.type) {
    case 'class':
      for (const lesson of (p.lessons ?? []).filter(hasEvidence)) slides.push({ kind: 'lesson', lesson, mode: 'single' });
      slides.push({ kind: 'toWatch', students: p.studentsToWatch ?? [] });
      break;
    case 'grade':
      slides.push({ kind: 'hardest', items: p.hardest ?? [] });
      for (const lesson of (p.map?.lessons ?? []).filter(hasEvidence)) slides.push({ kind: 'lesson', lesson, mode: 'byClass', classes: p.map.classes });
      break;
    case 'student':
      slides.push({ kind: 'student' });
      break;
    case 'school_term':
      for (const grade of p.grades ?? []) slides.push({ kind: 'grade', grade });
      break;
    case 'teachers':
      slides.push({ kind: 'teachers', teachers: p.teachers ?? [] });
      break;
    default:
      break;
  }
  return slides;
}

/**
 * Le nom à projeter : le vrai, ou « تلميذ n » (n = rang dans la liste, stable
 * d'une diapositive à l'autre) quand les noms sont masqués.
 */
export function displayName(person, index, hidden, placeholder) {
  if (hidden) return placeholder(index + 1);
  return [person?.firstName, person?.lastName].filter(Boolean).join(' ');
}

/**
 * La touche → le déplacement. En RTL, « ← » avance. Les télécommandes de
 * présentation envoient PageDown / PageUp.
 */
export function stepForKey(key) {
  if (['ArrowLeft', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(key)) return 1;
  if (['ArrowRight', 'ArrowUp', 'PageUp', 'Backspace'].includes(key)) return -1;
  return 0;
}
