/**
 * « الدخيل » — les constantes du jeu.
 *
 * SCHEDULE est le MIROIR de apps/api/config/madar.php › odd. Une énigme ne se
 * résout pas plus vite que `minPuzzleMs` (la réponse reste affichée
 * `revealMs`) ; le niveau s'adapte toutes les `puzzlesPerRound` énigmes et monte
 * d'au plus un sous-niveau par manche. Les 50 niveaux et les points sont ceux
 * de « قنّاص القيم » (sniper/levels.js, sniper/constants.js).
 */
export const SCHEDULE = Object.freeze({
  puzzlesPerRound: 5,
  revealMs: 1200,
  minPuzzleMs: 1000,
  timeStart: 15,
  timeMin: 7,
  timeStep: 0.15,
  bonusFactor: 3,
  maxMultiplier: 4,
});

export const LIVES = 3;
export const STREAK_STEP = 5;

/** Le temps (s) laissé pour l'énigme i : 15 s, puis de moins en moins, jamais sous 7 s. */
export const timeLimit = (i) => Math.max(SCHEDULE.timeMin, SCHEDULE.timeStart - SCHEDULE.timeStep * i);
