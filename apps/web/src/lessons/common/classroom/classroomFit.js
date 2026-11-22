/**
 * Le MOTEUR D'AJUSTEMENT du mode classe — mathématiques pures, sans DOM.
 *
 * La présentation doit « maximiser la taille lisible en gardant TOUT le
 * contenu important visible » (brief §9–10). Deux facteurs y concourent :
 *
 *   échelle choisie (userScale)   90 % · 100 % · 110 % · 125 % — la main de
 *                                 l'enseignant, sur la barre d'outils ;
 *   facteur d'ajustement (fit)    ≤ 1, calculé : quand le contenu déborde de
 *                                 la zone disponible on le réduit, quand il
 *                                 reste de la place on le laisse regrandir,
 *                                 jamais au-delà de 1.
 *
 *   échelle effective = userScale × fit      → --sa-classroom-scale
 *
 * Ce n'est PAS un zoom du navigateur : le contenu reste responsive, l'échelle
 * ne fait que nourrir ses tailles (livres, rayons, boutons, interlignes) par
 * une variable CSS. `usePresentationFit` mesure et boucle ; ce fichier
 * décide — et se teste seul.
 */

/** Les paliers offerts à l'enseignant, dans l'ordre des boutons − / +. */
export const SCALE_STEPS = Object.freeze([0.9, 1, 1.1, 1.25]);

/** Palier par défaut : 100 %. */
export const DEFAULT_SCALE = 1;

/**
 * En dessous de ce facteur, réduire encore rendrait les objets illisibles
 * (un livre de 30 px tomberait sous 17 px). On s'arrête là ; le contenu qui
 * dépasse encore défile DANS sa zone, jamais la page.
 */
export const MIN_FIT_FACTOR = 0.55;

/**
 * Marge de tolérance de la boucle : un écart plus petit ne vaut pas un
 * nouveau rendu (et éviterait toute oscillation autour du point d'équilibre).
 */
export const FIT_EPSILON = 0.015;

/**
 * Part de la zone qu'on laisse volontairement libre avant d'oser regrandir :
 * regrandir puis déborder puis réduire ferait vibrer la présentation.
 */
const GROW_SLACK = 0.06;

/** Ramène une échelle utilisateur sur un palier connu (le plus proche). */
export function clampScale(value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return DEFAULT_SCALE;
  let best = SCALE_STEPS[0];
  for (const s of SCALE_STEPS) if (Math.abs(s - v) < Math.abs(best - v)) best = s;
  return best;
}

/** Le palier suivant (+1) ou précédent (−1) ; borné aux extrémités. */
export function stepScale(current, direction) {
  const i = SCALE_STEPS.indexOf(clampScale(current));
  const next = Math.min(SCALE_STEPS.length - 1, Math.max(0, i + Math.sign(direction)));
  return SCALE_STEPS[next];
}

/** Pourcentage affiché sur la barre (« 110٪ » se lit en chiffres LTR). */
export function scalePercent(scale) {
  return Math.round(clampScale(scale) * 100);
}

/**
 * La zone RÉELLEMENT offerte au contenu : la boîte de la présentation moins
 * la barre d'outils, la barre de navigation et les marges (dont la zone sûre
 * des écrans à encoche).
 *
 * @param {{width:number, height:number, toolbarHeight?:number, navHeight?:number,
 *          paddingX?:number, paddingY?:number}} box
 * @returns {{width:number, height:number}} jamais négatif
 */
export function availableArea({ width, height, toolbarHeight = 0, navHeight = 0, paddingX = 0, paddingY = 0 }) {
  return {
    width: Math.max(0, Math.floor(width - paddingX)),
    height: Math.max(0, Math.floor(height - toolbarHeight - navHeight - paddingY)),
  };
}

/**
 * Le prochain facteur d'ajustement, à partir d'une mesure.
 *
 * @param {{current:number, needed:{width:number,height:number},
 *          available:{width:number,height:number}, min?:number}} m
 *   `needed`    la taille que le contenu réclame (scrollWidth/scrollHeight)
 *   `available` la zone offerte
 * @returns {number} le facteur à appliquer ; égal à `current` si rien ne change
 *
 * Règles :
 *   déborde  → réduire dans le rapport du plus grand débordement, une seule
 *              fois (les tailles suivent l'échelle à peu près linéairement,
 *              la boucle converge en un ou deux tours) ;
 *   tient avec de la marge, et current < 1 → regrandir vers ce que la marge
 *              permet, sans dépasser 1 ;
 *   sinon    → ne rien faire.
 * Un écart inférieur à FIT_EPSILON est ignoré : c'est la condition d'arrêt.
 */
export function nextFitFactor({ current, needed, available, min = MIN_FIT_FACTOR }) {
  const cur = Number.isFinite(current) && current > 0 ? Math.min(1, current) : 1;
  if (!needed || !available || available.width <= 0 || available.height <= 0) return cur;
  if (!(needed.width > 0) || !(needed.height > 0)) return cur;

  const ratio = Math.min(available.width / needed.width, available.height / needed.height);

  let next = cur;
  if (ratio < 1) {
    // Déborde : on réduit. Le 0.98 absorbe les arrondis de mise en page.
    next = cur * ratio * 0.98;
  } else if (cur < 1 && ratio > 1 + GROW_SLACK) {
    // De la place : on regrandit, prudemment (on garde la marge).
    next = cur * (ratio * (1 - GROW_SLACK));
  }

  next = Math.max(min, Math.min(1, next));
  return Math.abs(next - cur) < FIT_EPSILON ? cur : next;
}

/** L'échelle effective écrite dans --sa-classroom-scale. */
export function effectiveScale(userScale, fitFactor) {
  const s = clampScale(userScale) * (Number.isFinite(fitFactor) ? Math.max(MIN_FIT_FACTOR, Math.min(1, fitFactor)) : 1);
  return Math.round(s * 1000) / 1000;
}
