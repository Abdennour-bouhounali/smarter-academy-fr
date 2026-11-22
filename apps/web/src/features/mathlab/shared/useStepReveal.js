import { useEffect, useMemo, useReducer } from 'react';
import {
  stepReducer, initialStepState, stepPhase, STEP_SPEEDS, DEFAULT_MODE, DEFAULT_SPEED,
} from './stepPlayerModel.js';

/** La préférence de l'élève (mode, vitesse) : une commodité par navigateur, jamais le document. */
const PREFERENCE_KEY = 'sa-ml-step-player';

function readPreference() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(PREFERENCE_KEY) ?? 'null');

    return { mode: raw?.mode ?? DEFAULT_MODE, speed: raw?.speed ?? DEFAULT_SPEED };
  } catch {
    return { mode: DEFAULT_MODE, speed: DEFAULT_SPEED };
  }
}

function writePreference(mode, speed) {
  try {
    window.localStorage.setItem(PREFERENCE_KEY, JSON.stringify({ mode, speed }));
  } catch {
    /* navigation privée, aperçu : la préférence n'est qu'une commodité */
  }
}

/**
 * LE DÉROULÉ PAS À PAS d'une solution — le hook de `stepPlayerModel.js`.
 *
 * @param {number} total  le nombre de pas de la solution, RÉSULTAT COMPRIS (le résultat est le dernier pas)
 * @param {object} [options]
 * @param {unknown} [options.resetKey]  ce qui définit la question (source, méthode…) : quand il
 *   change, le déroulé revient à l'énoncé — sans image intermédiaire où l'ancien curseur
 *   montrerait la nouvelle réponse.
 *
 * `player.start()` est ce qu'appelle le bouton d'action de l'outil (« حلّ خطوة بخطوة ») :
 * il démarre la question affichée — et, si elle change dans le même geste, la NOUVELLE
 * (le drapeau `autostart` de l'état survit exactement au rendu qui applique le changement).
 *
 * Le curseur n'est jamais sérialisé : rouvrir un document montre l'énoncé, pas la réponse.
 */
export default function useStepReveal(total, { resetKey = null } = {}) {
  const [state, dispatch] = useReducer(
    stepReducer,
    null,
    () => initialStepState(total, { ...readPreference(), key: resetKey }),
  );

  // Nouvelle question ou nouveau nombre de pas → retour à l'énoncé, PENDANT le
  // rendu (React rejoue le rendu avec l'état remis à zéro avant de peindre :
  // aucune image où l'ancien curseur montrerait la nouvelle réponse).
  if (state.key !== resetKey || state.total !== total) {
    dispatch({ type: 'reset', total, key: resetKey });
  }

  // Le signal « démarre la prochaine question » ne vit qu'un rendu.
  useEffect(() => {
    if (state.autostart) dispatch({ type: 'clearAutostart' });
  }, [state.autostart]);

  // La lecture automatique : un pas, puis le suivant après la pause choisie.
  useEffect(() => {
    if (!state.playing) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: 'tick' }), STEP_SPEEDS[state.speed]);

    return () => window.clearTimeout(timer);
  }, [state.playing, state.cursor, state.speed]);

  useEffect(() => { writePreference(state.mode, state.speed); }, [state.mode, state.speed]);

  const actions = useMemo(() => ({
    start: () => dispatch({ type: 'begin' }),
    next: () => dispatch({ type: 'next' }),
    previous: () => dispatch({ type: 'previous' }),
    pause: () => dispatch({ type: 'pause' }),
    resume: () => dispatch({ type: 'resume' }),
    restart: () => dispatch({ type: 'restart' }),
    rewind: () => dispatch({ type: 'rewind' }),
    revealAll: () => dispatch({ type: 'revealAll' }),
    setMode: (mode) => dispatch({ type: 'setMode', mode }),
    setSpeed: (speed) => dispatch({ type: 'setSpeed', speed }),
  }), []);

  const phase = stepPhase({ ...state, total });

  return {
    ...actions,
    cursor: Math.min(state.cursor, total),
    total,
    mode: state.mode,
    speed: state.speed,
    playing: state.playing,
    phase,
    started: state.cursor > 0,
    done: phase === 'completed' || phase === 'empty',
  };
}
