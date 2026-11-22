/**
 * Les constantes de « دفاع الكوكب ».
 *
 * `SCHEDULE` est le MIROIR de `config/madar.php › defense` (apps/api) : le
 * serveur borne la vague et le score avec ces mêmes valeurs (DefenseScoring).
 * Le calendrier des vagues est FIXE — personne ne peut l'accélérer — donc la
 * durée réelle d'une partie dit jusqu'où elle a pu aller. Une valeur qui
 * AUGMENTE le score possible doit être reportée côté serveur ; `sim.test.js`
 * vérifie qu'une partie simulée reste sous la borne.
 */
export const SCHEDULE = Object.freeze({
  firstWaveAt: 4,
  spawnBase: 10,
  spawnPerWave: 1,
  spawnMax: 22,
  breather: 5,
  enemiesBase: 6,
  enemiesPerWave: 2,
  enemiesCap: 40,
  maxEnemyPoints: 15,
  bossEvery: 5,
  bossPoints: 150,
  wavePoints: 100,
});

/** Rayons (unités du plateau ; le bord d'apparition est à SPAWN_R). */
export const PLANET_R = 0.16;
export const SPAWN_R = 1.15;

export const PLANET_HEALTH = 20;
export const START_CRYSTALS = 150;
export const REVIVE_HEALTH = 10;
export const REVIVE_CLEAR_R = 0.55;
export const REVIVE_GRACE = 2;
export const STEP = 1 / 60;

/** Les emplacements : un anneau intérieur (6), un anneau extérieur (8). */
export const SLOTS = [
  ...Array.from({ length: 6 }, (_, i) => ({ id: `i${i}`, r: 0.42, a: (i / 6) * Math.PI * 2 + Math.PI / 6 })),
  ...Array.from({ length: 8 }, (_, i) => ({ id: `o${i}`, r: 0.72, a: (i / 8) * Math.PI * 2 })),
].map((s) => ({ ...s, x: Math.cos(s.a) * s.r, y: Math.sin(s.a) * s.r }));

/**
 * Les ennemis. `beamResist` : les armes à faisceau (laser, tesla) ne font que
 * la moitié des dégâts aux boucliers — il faut une impulsion ou un rail.
 */
export const ENEMIES = {
  scout: { hp: 24, vr: 0.1, w: 0.25, damage: 1, points: 5, crystals: 5, size: 0.035, color: '#4ade80' },
  swarm: { hp: 12, vr: 0.13, w: 0.35, damage: 1, points: 2, crystals: 2, size: 0.022, color: '#facc15' },
  tank: { hp: 140, vr: 0.05, w: 0.1, damage: 3, points: 15, crystals: 12, size: 0.055, color: '#c084fc' },
  shield: { hp: 60, vr: 0.08, w: 0.18, damage: 2, points: 10, crystals: 8, size: 0.045, color: '#38bdf8', beamResist: 0.5 },
  boss: { hp: 900, vr: 0.035, w: 0.06, damage: 10, points: 150, crystals: 60, size: 0.1, color: '#f87171' },
};

/**
 * Les tourelles : trois niveaux. Les RÈGLES de déblocage vivent au serveur
 * (MadarTurrets::CATALOGUE) ; ici, le coût et la puissance.
 */
export const TURRETS = {
  laser: { cost: 50, range: [0.32, 0.35, 0.38], dps: [17, 27, 40], color: '#f472b6', beam: true },
  frost: { cost: 60, range: [0.28, 0.3, 0.33], dps: [3, 5, 8], slow: [0.35, 0.45, 0.55], color: '#67e8f9' },
  pulse: { cost: 80, range: [0.26, 0.28, 0.3], every: [1.4, 1.2, 1.0], damage: [18, 28, 42], color: '#fb923c' },
  rail: { cost: 110, range: [0.6, 0.66, 0.72], every: [2.2, 1.9, 1.6], damage: [70, 110, 170], color: '#a3e635' },
  tesla: { cost: 120, range: [0.3, 0.32, 0.35], every: [0.9, 0.8, 0.7], damage: [16, 24, 34], chain: [3, 4, 5], color: '#a78bfa', beam: true },
};
export const TURRET_ORDER = ['laser', 'frost', 'pulse', 'rail', 'tesla'];

/** Coût du niveau suivant (1→2, 2→3), et ce que rend une vente (60 % de l'investi). */
export function upgradeCost(type, level) {
  const base = TURRETS[type].cost;
  return level === 1 ? Math.round(base * 0.7) : level === 2 ? Math.round(base * 1.0) : null;
}

export function sellValue(turret) {
  return Math.floor(turret.invested * 0.6);
}

export function spawnWindow(k) {
  return Math.min(SCHEDULE.spawnMax, SCHEDULE.spawnBase + SCHEDULE.spawnPerWave * k);
}

export function waveStart(k) {
  let t = SCHEDULE.firstWaveAt;
  for (let j = 1; j < k; j++) t += spawnWindow(j) + SCHEDULE.breather;
  return t;
}

export function enemiesIn(k) {
  return Math.min(SCHEDULE.enemiesCap, SCHEDULE.enemiesBase + SCHEDULE.enemiesPerWave * k);
}

export function hpScale(k) {
  return 1 + 0.11 * (k - 1);
}
