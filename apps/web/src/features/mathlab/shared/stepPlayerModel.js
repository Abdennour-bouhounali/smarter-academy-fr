/**
 * LE DÉROULÉ D'UNE SOLUTION — la machine à états, pure, sans React.
 *
 * Exigence de la propriétaire (2026-09-30) : dans l’atelier, une solution ne
 * s'affiche JAMAIS d'un bloc. L'outil calcule toute la suite des états
 * mathématiques, puis l'élève la DÉCOUVRE pas à pas, comme un professeur qui
 * écrit au tableau :
 *
 *     ready ──start──▶ step 1 ──next──▶ step 2 … ──next──▶ completed
 *       (l'énoncé seul)                             (le résultat est le DERNIER pas)
 *
 * Deux façons d'avancer, un seul curseur :
 *   'manual' — « Pas à pas » : un pas par clic (et un pas en arrière) ;
 *   'auto'   — « Défilement automatique » : un pas toutes les `SPEEDS[speed]` ms, en pause à volonté ;
 *   'practice' — « Entraîne-toi » : comme le manuel, mais aux pas qui portent un
 *              exercice (frame.task) l'ÉLÈVE désigne les éléments et l'opération
 *              (useBoardPractice) ; le composant bloque « Suivant » tant qu'il n'a pas répondu.
 * Changer de mode ou de vitesse GARDE le pas courant ; seul « Du début » / une
 * nouvelle question y remet à zéro.
 *
 *     state = { cursor, total, mode, speed, playing, key, autostart }
 *       cursor     0 … total : combien de pas sont MONTRÉS (0 = l'énoncé seul)
 *       key        la question déroulée (un changement ramène à l'énoncé)
 *       autostart  le bouton d'action vient d'être pressé : la PROCHAINE
 *                  question démarre d'elle-même (question changée dans le même geste)
 *
 * Le composant n'affiche que `steps.slice(0, cursor)` : un pas futur n'est
 * dans le DOM sous aucune forme (ni grisé, ni masqué en CSS).
 */

const STEP_MODES = Object.freeze(['manual', 'auto', 'practice']);
export const STEP_SPEEDS = Object.freeze({ slow: 2000, normal: 1200, fast: 700 });
export const DEFAULT_MODE = 'manual';
export const DEFAULT_SPEED = 'normal';

const clamp = (value, total) => Math.max(0, Math.min(total, value));

/** L'état initial : l'énoncé, aucun pas montré. */
export function initialStepState(total, { mode = DEFAULT_MODE, speed = DEFAULT_SPEED, key = null } = {}) {
  return {
    key,
    autostart: false,
    cursor: 0,
    total: Math.max(0, Math.trunc(total) || 0),
    mode: STEP_MODES.includes(mode) ? mode : DEFAULT_MODE,
    speed: speed in STEP_SPEEDS ? speed : DEFAULT_SPEED,
    playing: false,
  };
}

/**
 * La phase lisible : `empty` (rien à dérouler), `ready` (l'énoncé seul),
 * `playing`, `paused` (auto arrêté en route), `stepping` (manuel en route),
 * `completed` (le dernier pas — le résultat — est montré).
 */
export function stepPhase(state) {
  if (state.total === 0) return 'empty';
  if (state.cursor === 0 && !state.playing) return 'ready';
  if (state.cursor >= state.total) return 'completed';
  if (state.playing) return 'playing';

  return state.mode === 'auto' ? 'paused' : 'stepping';
}

/**
 * Les transitions. Chaque action rend un NOUVEL état (ou le même, si elle
 * n'a pas de sens ici — l'appelant peut comparer par identité).
 */
export function stepReducer(state, action) {
  switch (action.type) {
    case 'reset': {
      // Une nouvelle question : on revient à l'énoncé, on garde les préférences.
      // Si le bouton d'action vient d'être pressé, elle démarre d'elle-même.
      const next = initialStepState(action.total ?? state.total, { ...state, key: 'key' in action ? action.key : state.key });
      if (!state.autostart) return next;

      return stepReducer(next, { type: 'start' });
    }
    case 'clearAutostart':
      return state.autostart ? { ...state, autostart: false } : state;
    case 'start':
      // « Commencer la solution » / « Lecture » : le PREMIER pas, jamais la fin.
      if (state.total === 0) return state;

      return { ...state, cursor: Math.max(1, clamp(state.cursor, state.total)), playing: state.mode === 'auto' && state.total > 1 && state.cursor < state.total - 1 };
    case 'next':
      if (state.cursor >= state.total) return state;

      return { ...state, cursor: state.cursor + 1, playing: state.playing && state.cursor + 1 < state.total };
    case 'tick':
      // Le pas de la lecture automatique : sans effet hors lecture.
      if (!state.playing) return state;

      return stepReducer(state, { type: 'next' });
    case 'previous':
      if (state.cursor <= 1) return state;

      return { ...state, cursor: state.cursor - 1, playing: false };
    case 'pause':
      return state.playing ? { ...state, playing: false } : state;
    case 'resume':
      if (state.playing || state.total === 0) return state;
      if (state.cursor >= state.total) return stepReducer({ ...state, cursor: 0 }, { type: 'start' });

      return { ...state, cursor: Math.max(1, state.cursor), playing: true };
    case 'restart':
      // « Refaire la solution » / « Rejouer » : depuis le premier pas, dans le mode courant.
      return stepReducer({ ...state, cursor: 0, playing: false }, { type: 'start' });
    case 'begin':
      // Le bouton d'action de l'outil (« … pas à pas ») : démarre CETTE question,
      // et la suivante si elle change dans le même geste.
      return { ...stepReducer({ ...state, cursor: 0, playing: false }, { type: 'start' }), autostart: true };
    case 'rewind':
      return { ...state, cursor: 0, playing: false };
    case 'revealAll':
      // Un geste DÉLIBÉRÉ (l'enseignant qui explique) — jamais automatique.
      return { ...state, cursor: state.total, playing: false };
    case 'setMode': {
      if (!STEP_MODES.includes(action.mode) || action.mode === state.mode) return state;
      // Le pas courant est gardé. Passer en auto EN ROUTE reprend la lecture ;
      // passer en manuel l'arrête là où elle en est.
      const inProgress = state.cursor > 0 && state.cursor < state.total;

      return { ...state, mode: action.mode, playing: action.mode === 'auto' && inProgress };
    }
    case 'setSpeed':
      return action.speed in STEP_SPEEDS && action.speed !== state.speed ? { ...state, speed: action.speed } : state;
    default:
      return state;
  }
}
