/**
 * Les UNITÉS DE PRÉSENTATION — mathématiques pures, sans DOM ni React.
 *
 * Une présentation ne fait pas une « diapositive » de chaque élément du DOM :
 * elle suit les unités PÉDAGOGIQUES que l'architecture de leçon connaît déjà.
 *
 *   module (ContentModule)   المدخل (overview) → المهمة (brief) → المختبر (intro) → الخطوات… → الخلاصة (footer)
 *   leçon (LESSON_CONFIG)    sommaire → module 0 → module 1 → … → dernier module
 *
 * Ces deux fonctions dérivent l'ordre de la structure existante ; rien n'est
 * inventé, rien n'est dupliqué.
 */

/**
 * Les unités d'un module de contenu, dans l'ordre de ContentModule.
 *
 * @param {{overview?:boolean, brief?:boolean, intro?:boolean, steps:Array<{num:number|string, title:string}>, footer?:boolean}} m
 *   `overview` : la page d'entrée du module (titre + ce qu'on y apprend) ;
 *   `brief`/`intro`/`footer` : l'unité existe-t-elle (le slot est-il fourni,
 *   et pour le footer, le module est-il terminé — il n'est rendu qu'alors).
 * @returns {Array<{kind:'overview'|'brief'|'intro'|'step'|'footer', key:string, num?:number|string, title?:string}>}
 */
export function moduleUnits({ overview = false, brief = false, intro = false, steps = [], footer = false }) {
  const units = [];
  if (overview) units.push({ kind: 'overview', key: 'overview' });
  if (brief) units.push({ kind: 'brief', key: 'brief' });
  if (intro) units.push({ kind: 'intro', key: 'intro' });
  for (const s of steps) units.push({ kind: 'step', key: `step-${s.num}`, num: s.num, title: s.title });
  if (footer) units.push({ kind: 'footer', key: 'footer' });
  return units;
}

/** Ramène un index d'unité dans [0, count-1] (0 quand il n'y a rien). */
export function clampUnit(index, count) {
  if (!(count > 0)) return 0;
  const i = Number.isFinite(index) ? Math.trunc(index) : 0;
  return Math.min(count - 1, Math.max(0, i));
}

/**
 * Les gestes السابق / التالي d'un module présenté, en combinant ses unités
 * et, en portée LEÇON, le passage au module voisin.
 *
 * @param {{index:number, count:number, goTo:(i:number)=>void,
 *          lessonPrevious?:Function|null, lessonNext?:Function|null}} p
 * @returns {{onPrevious?:Function, onNext?:Function}} — `undefined` = pas de bouton
 */
export function resolveModuleNavigation({ index, count, goTo, lessonPrevious = null, lessonNext = null }) {
  const onPrevious = index > 0 ? () => goTo(index - 1) : (lessonPrevious || undefined);
  const onNext = index < count - 1 ? () => goTo(index + 1) : (lessonNext || undefined);
  return { onPrevious, onNext };
}

/**
 * Les voisins d'une page de leçon dans l'ordre de LESSON_CONFIG.modules.
 *
 * @param {{modules:Array<{path:string}>}} config
 * @param {string} basePath  la page sommaire de la leçon
 * @param {string} pathname  la page courante
 * @returns {{previous:string|null, next:string|null, previousModule:object|null,
 *             nextModule:object|null, position:number, total:number}}
 *   position       : 0 pour le sommaire, 1…n pour les modules ; -1 hors de la leçon.
 *   total          : sommaire + modules.
 *   previousModule : l'entrée de config.modules visée, pour NOMMER le saut
 *                    (« المحور 2 ») ; `null` quand la cible est le sommaire.
 */
export function lessonNeighbours(config, basePath, pathname) {
  const modules = config?.modules ?? [];
  const total = modules.length + 1;
  const strip = (p) => String(p ?? '').replace(/\/+$/, '');
  const here = strip(pathname);
  if (here === strip(basePath)) {
    return { previous: null, next: modules[0]?.path ?? null, previousModule: null, nextModule: modules[0] ?? null, position: 0, total };
  }
  const i = modules.findIndex((m) => strip(m.path) === here);
  if (i === -1) return { previous: null, next: null, previousModule: null, nextModule: null, position: -1, total };
  return {
    previous: i > 0 ? modules[i - 1].path : basePath,
    next: i < modules.length - 1 ? modules[i + 1].path : null,
    previousModule: i > 0 ? modules[i - 1] : null,
    nextModule: i < modules.length - 1 ? modules[i + 1] : null,
    position: i + 1,
    total,
  };
}

/** La page est-elle dans la leçon (sommaire ou module) ? */
export function isWithinLesson(basePath, pathname) {
  const base = String(basePath ?? '').replace(/\/+$/, '');
  const here = String(pathname ?? '');
  return here === base || here.startsWith(`${base}/`);
}
