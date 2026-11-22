/**
 * La borne du serveur pour « الحساب الذهني » — MIROIR de
 * apps/api/app/Domain/Madar/OddScoring.php avec config('madar.mental') (sans la
 * tolérance ni la marge) : la même borne que « الدخيل », plus le bonus de vitesse.
 */
import { SCHEDULE } from './constants';
import { perHit } from '../sniper/constants';
import { levelOfPos } from '../sniper/levels';
import { maxReachable } from '../sniper/adapt';

export const maxProblems = (seconds) => Math.floor((Math.max(0, seconds) * 1000) / SCHEDULE.minProblemMs) + 1;
export const maxRounds = (seconds) => Math.floor(maxProblems(seconds) / SCHEDULE.problemsPerRound);

export function perfectScore(seconds, start = 0) {
  let score = 0;
  const n = maxProblems(seconds);
  for (let i = 0; i < n; i += 1) {
    const level = levelOfPos(maxReachable(start, Math.floor(i / SCHEDULE.problemsPerRound)));
    score += perHit(level) * (SCHEDULE.maxMultiplier + SCHEDULE.speedFactor);
    if ((i + 1) % SCHEDULE.problemsPerRound === 0) score += SCHEDULE.bonusFactor * perHit(level);
  }
  return score;
}
