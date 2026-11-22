/**
 * Les constantes du moteur « مدار ».
 *
 * `PHYSICS` est le MIROIR de `config/madar.php › physics` (apps/api) : le
 * serveur borne le score annoncé avec ces mêmes valeurs (MadarScoring). Une
 * valeur qui AUGMENTE le score possible doit y être reportée, sinon de vrais
 * scores seraient ramenés à la borne. `madarBound.test.js` vérifie qu'une
 * partie parfaite simulée reste sous la borne.
 */
export const PHYSICS = Object.freeze({
  omegaStart: 1.25, // rad/s au départ (un tour ≈ 5 s)
  omegaAccel: 0.018, // rad/s²
  omegaMax: 3.6, // rad/s (un tour ≈ 1,75 s)
  pointsPerRad: 8,
  starPoints: 3,
  maxMultiplier: 4,
  starMinGapRad: 0.35,
  nearMissPoints: 10,
  obstacleMinGapRad: 0.85,
});

/** Rayons des deux couloirs, en fraction du rayon de l'orbite. */
export const LANE_R = [0.78, 1.22];

/** Demi-largeur angulaire du vaisseau (rad, à rayon 1). */
export const SHIP_HALF = 0.05;

/** Durée d'un changement de couloir (s). */
export const FLIP_S = 0.13;

/** Bande radiale autour d'un couloir où l'on touche ce qui s'y trouve. */
export const HIT_BAND = 0.13;

/** On génère le monde jusqu'ici devant le vaisseau (rad). */
export const SPAWN_AHEAD = 2.7;

/** Un secteur (une planète) = cinq tours. */
export const SECTOR_RAD = Math.PI * 2 * 5;

/** Toutes les COMBO_STEP étoiles d'affilée, le multiplicateur monte d'un cran. */
export const COMBO_STEP = 5;

/** Fenêtre d'un « قريب! » : on a quitté le couloir de l'obstacle juste avant (s). */
export const NEAR_MISS_WINDOW = 0.28;

/** Invulnérabilité après une reprise (s). */
export const REVIVE_GRACE = 2;

/** Le pas fixe de la simulation (s) : assez fin pour ne rien traverser à ωmax. */
export const STEP = 1 / 120;

/** Les planètes des secteurs, du Soleil vers le dehors, puis l'espace profond. */
export const SECTORS = [
  { id: 'mercury', hue: 28, planet: ['#f5d0a9', '#a8714a', '#4a2c1a'] },
  { id: 'venus', hue: 40, planet: ['#ffe8a3', '#e0a43c', '#7a4a12'] },
  { id: 'earth', hue: 205, planet: ['#bfe8ff', '#2f8fdc', '#0b3a6b'], land: '#3fbf7f' },
  { id: 'mars', hue: 12, planet: ['#ffb08a', '#d2532c', '#5e1a0b'] },
  { id: 'jupiter', hue: 30, planet: ['#fde3c0', '#d39a62', '#6b3d1f'], bands: true },
  { id: 'saturn', hue: 45, planet: ['#fff1c4', '#d9b45c', '#6d5420'], ring: true },
  { id: 'uranus', hue: 180, planet: ['#d9fbff', '#6fd6e0', '#1f6a78'] },
  { id: 'neptune', hue: 225, planet: ['#c7d6ff', '#3d63e0', '#121f66'] },
  { id: 'deep', hue: 275, planet: ['#f3d6ff', '#9b5cf0', '#2a0d55'], ring: true },
];

export function sectorAt(index) {
  return SECTORS[Math.min(index, SECTORS.length - 1)];
}
