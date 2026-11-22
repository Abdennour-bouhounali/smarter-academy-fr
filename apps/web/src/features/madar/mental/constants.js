/**
 * « الحساب الذهني » — les constantes du jeu.
 *
 * SCHEDULE est le MIROIR de apps/api/config/madar.php › mental. Après chaque
 * réponse, le résultat reste affiché `feedbackMs` : un problème ne se résout
 * pas plus vite que `minProblemMs`. Le niveau s'adapte toutes les
 * `problemsPerRound` réponses. Points : ceux du niveau (sniper/constants.js
 * › perHit) × le multiplicateur de série, plus un bonus de VITESSE d'au plus
 * `speedFactor` × perHit (le temps qui reste sur le chronomètre).
 */
export const SCHEDULE = Object.freeze({
  problemsPerRound: 5,
  feedbackMs: 700,
  minProblemMs: 700,
  timeStart: 12,
  timeMin: 6,
  timeStep: 0.06,
  bonusFactor: 3,
  maxMultiplier: 4,
  speedFactor: 1,
});

export const LIVES = 3;
export const STREAK_STEP = 5;
/** Une planète de plus toutes les PLANET_EVERY bonnes réponses. */
export const PLANET_EVERY = 10;

/** Le temps (s) laissé pour le problème i : 12 s, puis de moins en moins, jamais sous 6 s. */
export const timeLimit = (i) => Math.max(SCHEDULE.timeMin, SCHEDULE.timeStart - SCHEDULE.timeStep * i);
