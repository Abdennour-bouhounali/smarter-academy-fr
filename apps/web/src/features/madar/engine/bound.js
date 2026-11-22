import { PHYSICS } from './constants.js';

/**
 * Miroir de MadarScoring (apps/api/app/Domain/Madar/MadarScoring.php) : le
 * meilleur score qu'une partie de cette durée peut faire. Sert aux tests du
 * moteur — une partie simulée ne doit jamais la dépasser.
 */

function maxDistanceRad(durationMs) {
  const t = Math.max(0, durationMs) / 1000;
  const { omegaStart: w0, omegaAccel: a, omegaMax: wMax } = PHYSICS;
  const tCap = Math.max(0, (wMax - w0) / a);
  if (t <= tCap) return w0 * t + (a * t * t) / 2;
  return w0 * tCap + (a * tCap * tCap) / 2 + wMax * (t - tCap);
}

function maxPointsPerRad() {
  const p = PHYSICS;
  return p.pointsPerRad + (p.starPoints * p.maxMultiplier) / p.starMinGapRad + p.nearMissPoints / p.obstacleMinGapRad;
}

/** La borne SANS marge : ce qu'une partie parfaite atteint au plus. */
export function perfectScore(durationMs) {
  return Math.floor(maxDistanceRad(durationMs) * maxPointsPerRad());
}

