/**
 * La borne du serveur pour « قنّاص القيم » — MIROIR de
 * apps/api/app/Domain/Madar/SniperScoring.php (sans la tolérance ni la marge).
 * `sim.test.js` vérifie qu'une partie parfaite ne la dépasse jamais.
 *
 * Le niveau de la manche k ne dépasse pas celui de la position start + k
 * (on monte d'au plus un sous-niveau par manche).
 */
import { SCHEDULE, gap, perHit, perfectBonus, roundStart } from './constants';
import { levelOfPos } from './levels';
import { maxReachable } from './adapt';

/** Le nombre de manches commencées en `seconds`. */
export function maxRound(seconds) {
  let k = 0;
  while (k < 1000 && roundStart(k) <= seconds) k += 1;
  return k;
}

export function perfectScore(seconds, start = 0) {
  let score = 0;
  for (let k = 0; k < 1000 && roundStart(k) <= seconds; k += 1) {
    const level = levelOfPos(maxReachable(start, k));
    for (let j = 0; j < SCHEDULE.cardsPerRound && roundStart(k) + j * gap(k) <= seconds; j += 1) score += perHit(level) * SCHEDULE.maxMultiplier;
    score += perfectBonus(level);
  }
  return score;
}
