import { createContext, useContext } from 'react';

/**
 * Le contexte du MODE CLASSE (« وضع القسم »), publié par ClassroomPresentation
 * à tout ce qu'elle enveloppe.
 *
 * Un contenu (manipulation, exercice, module, leçon) n'a JAMAIS à connaître
 * le plein écran, le verrou de défilement ou la barre d'outils : il lit ici
 * s'il est présenté, à quelle échelle et dans quelle zone, et adapte sa mise
 * en page (ou ne fait rien — un contenu qui ignore le contexte est simplement
 * montré tel quel).
 *
 *   isClassroomMode     la présentation est active (plein écran natif OU repli)
 *   isNativeFullscreen  le navigateur est réellement en plein écran sur elle
 *   isNested            CE provider est passe-plat : un ancêtre présente déjà,
 *                       et il n'y a qu'UNE session (jamais de plein écran imbriqué)
 *   canPresent          l'utilisateur courant a le droit d'entrer (rôle)
 *   scope               la portée présentée : 'lesson' | 'module' | 'exercise' | 'manipulation'
 *   title               le titre annoncé sur la barre d'outils
 *   scale               l'échelle effective (--sa-classroom-scale), 0.55…1.25
 *   userScale           la part choisie par l'enseignant (90 · 100 · 110 · 125 %), sans l'ajustement
 *   area                { width, height } offerts au contenu, en px
 *   enterClassroomMode({ scope?, title? })  entrer, en disant ce qu'on présente
 *   exitClassroomMode   / toggleClassroomMode
 *   registerStage(id, spec|null)  une page présentée publie titre, gestes
 *                       السابق/التالي et commandes (voir useClassroomStage)
 *   lessonNavigation    en session LEÇON : { previous, next, position, total }
 *                       — les gestes vers les modules voisins ; null sinon
 *   takeArrival()       'first' | 'last' | null — par quel bout entrer dans
 *                       la page qui vient de s'ouvrir en session leçon
 *   refit()             le contenu vient de changer de nature (autre unité) :
 *                       le moteur repart de l'échelle demandée
 *   portalTarget        l'élément où porter un portail (fantôme de glisser,
 *                       infobulle…) : en plein écran natif, un portail vers
 *                       <body> serait INVISIBLE
 *
 * Hors provider (page sans présentation, test unitaire) : le repli
 * INACTIVE — jamais d'exception, jamais de commande visible.
 */
export const ClassroomContext = createContext(null);

const noop = () => {};

const CLASSROOM_INACTIVE = Object.freeze({
  isClassroomMode: false,
  isNativeFullscreen: false,
  isNested: false,
  canPresent: false,
  retired: false,
  scope: null,
  title: '',
  scale: 1,
  userScale: 1,
  area: { width: 0, height: 0 },
  enterClassroomMode: noop,
  exitClassroomMode: noop,
  toggleClassroomMode: noop,
  registerStage: noop,
  lessonNavigation: null,
  takeArrival: () => null,
  refit: noop,
  portalTarget: null,
});

/** L'état du mode classe pour le contenu enveloppé. */
export function useClassroomMode() {
  return useContext(ClassroomContext) ?? CLASSROOM_INACTIVE;
}

/**
 * Où porter un portail : la racine de la présentation quand elle est active,
 * sinon <body>. `null` hors navigateur.
 */
export function useClassroomPortalTarget() {
  const ctx = useContext(ClassroomContext);
  if (ctx?.isClassroomMode && ctx.portalTarget) return ctx.portalTarget;
  return typeof document === 'undefined' ? null : document.body;
}
