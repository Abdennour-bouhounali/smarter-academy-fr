/**
 * Contrat de mise en page du bandeau de leçon (« lesson chrome »).
 *
 * Une leçon est rendue sous deux coquilles différentes (CourseLayout choisit
 * selon l'authentification) :
 *
 *   • visiteur (MainLayout)      → Navbar `fixed top-0 h-16`, à toutes les tailles
 *   • élève connecté (StudentLayout)
 *       – < lg : en-tête mobile `fixed top-0 h-14`
 *       – ≥ lg : barre latérale seule, AUCUN élément persistant en haut
 *
 * Tout ce qui se colle en haut d'un module (StepProgressBar) et le décalage
 * réservé en haut du module (ModuleLayout) doivent dériver d'ici, jamais
 * d'un `top-16` écrit à la main : réserver 64 px pour un en-tête qui n'existe
 * pas laisse un vide au-dessus du bandeau chez l'élève connecté.
 *
 * Les hauteurs sont exprimées en pas d'échelle Tailwind (1 = 0.25rem = 4px)
 * pour que les classes générées restent statiques et donc détectables par le
 * scan JIT de Tailwind — d'où les tables littérales ci-dessous.
 */

/** Hauteur de la Navbar visiteur : `h-16` = 64 px. */
export const VISITOR_HEADER_H = 16;

/** Hauteur de l'en-tête élève mobile (< lg) : `h-14` = 56 px. */
export const STUDENT_MOBILE_HEADER_H = 14;

/** Aucun élément persistant en haut : bureau élève (≥ lg). */
export const NO_HEADER_H = 0;

// Tailwind ne peut pas interpréter `top-${n}` : les classes doivent exister
// littéralement dans la source. Ces tables sont l'unique endroit où les
// valeurs de décalage apparaissent sous forme de classes.
const STICKY_TOP = {
  0: 'top-0',
  14: 'top-14',
  16: 'top-16',
};

const PADDING_TOP = {
  0: 'pt-0',
  14: 'pt-14',
  16: 'pt-16',
};

const LG_STICKY_TOP = {
  0: 'lg:top-0',
  14: 'lg:top-14',
  16: 'lg:top-16',
};

const LG_PADDING_TOP = {
  0: 'lg:pt-0',
  14: 'lg:pt-14',
  16: 'lg:pt-16',
};

/**
 * Décrit le bandeau réellement rendu au-dessus du contenu d'un module.
 *
 * @param {{ authenticated: boolean }} opts
 * @returns {{
 *   authenticated: boolean,
 *   headerHeight: number,      // pas Tailwind, en dessous du point de rupture lg
 *   headerHeightLg: number,    // pas Tailwind, à partir de lg
 *   hasLessonHeader: boolean,  // un en-tête existe-t-il à AU MOINS une taille
 *   stickyTopClass: string,    // pour un enfant `sticky` du contenu du module
 *   contentOffsetClass: string,// décalage haut réservé par la coquille de module
 * }}
 */
export function getLessonChromeLayout({ authenticated }) {
  // StudentLayout applique déjà `pt-14 lg:pt-0` sur son <main> : le décalage
  // de l'en-tête mobile est donc consommé en amont, et le module ne doit RIEN
  // réserver de plus. En visiteur au contraire, la Navbar est `fixed` sans
  // aucune compensation au-dessus : c'est le module qui la réserve.
  const headerHeight = authenticated ? STUDENT_MOBILE_HEADER_H : VISITOR_HEADER_H;
  const headerHeightLg = authenticated ? NO_HEADER_H : VISITOR_HEADER_H;
  const contentOffset = authenticated ? NO_HEADER_H : VISITOR_HEADER_H;

  return {
    authenticated,
    headerHeight,
    headerHeightLg,
    hasLessonHeader: headerHeight > 0 || headerHeightLg > 0,
    // `sticky` se résout contre la fenêtre (aucun conteneur de défilement
    // intermédiaire dans les deux coquilles), donc le décalage collant suit
    // la hauteur du chrome persistant, y compris quand elle change à `lg`.
    stickyTopClass: headerHeight === headerHeightLg
      ? STICKY_TOP[headerHeight]
      : `${STICKY_TOP[headerHeight]} ${LG_STICKY_TOP[headerHeightLg]}`,
    contentOffsetClass: contentOffset === headerHeightLg
      ? PADDING_TOP[contentOffset]
      : `${PADDING_TOP[contentOffset]} ${LG_PADDING_TOP[headerHeightLg]}`,
  };
}
