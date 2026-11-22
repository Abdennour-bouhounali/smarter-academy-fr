/**
 * La borne du serveur pour « الدخيل » — MIROIR de
 * apps/api/app/Domain/Madar/OddScoring.php (sans la tolérance ni la marge).
 */
import { SCHEDULE } from './constants';
import { perHit } from '../sniper/constants';
import { levelOfPos } from '../sniper/levels';
import { maxReachable } from '../sniper/adapt';

export const maxPuzzles = (seconds) => Math.floor((Math.max(0, seconds) * 1000) / SCHEDULE.minPuzzleMs) + 1;
export const maxRounds = (seconds) => Math.floor(maxPuzzles(seconds) / SCHEDULE.puzzlesPerRound);

export function perfectScore(seconds, start = 0) {
  let score = 0;
  const n = maxPuzzles(seconds);
  for (let i = 0; i < n; i += 1) {
    const level = levelOfPos(maxReachable(start, Math.floor(i / SCHEDULE.puzzlesPerRound)));
    score += perHit(level) * SCHEDULE.maxMultiplier;
    if ((i + 1) % SCHEDULE.puzzlesPerRound === 0) score += SCHEDULE.bonusFactor * perHit(level);
  }
  return score;
}
