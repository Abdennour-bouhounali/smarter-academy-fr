import { SCHEDULE, enemiesIn, waveStart } from './constants.js';

/** Miroir de DefenseScoring (apps/api) : la vague et le score possibles en T ms. */
export function maxWave(durationMs) {
  const t = Math.max(0, durationMs) / 1000;
  let k = 0;
  while (k < 1000 && waveStart(k + 1) <= t) k++;
  return k;
}

export function perfectScore(durationMs) {
  const t = Math.max(0, durationMs) / 1000;
  let score = 0;
  for (let k = 1; k <= 1000 && waveStart(k) <= t; k++) {
    score += enemiesIn(k) * SCHEDULE.maxEnemyPoints;
    if (k % SCHEDULE.bossEvery === 0) score += SCHEDULE.bossPoints;
    if (waveStart(k + 1) <= t) score += SCHEDULE.wavePoints * k;
  }
  return score;
}
