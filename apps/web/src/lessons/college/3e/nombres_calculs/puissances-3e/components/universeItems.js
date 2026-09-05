/**
 * Les objets de l'échelle de l'univers, triés du plus grand au plus petit.
 * `meters` est la SEULE donnée numérique : l'écriture scientifique affichée
 * est calculée par toScientific, jamais recopiée. `plain` est l'écriture
 * décimale complète, à lire (et à trouver interminable).
 */
export const UNIVERSE_ITEMS = [
  { id: 'galaxie', name: 'La Voie lactée', emoji: '🌌', meters: 1e21, plain: '1 000 000 000 000 000 000 000 m' },
  { id: 'systeme', name: 'Le système solaire', emoji: '🪐', meters: 1e13, plain: '10 000 000 000 000 m' },
  { id: 'terre', name: 'La Terre (diamètre)', emoji: '🌍', meters: 12700000, plain: '12 700 000 m' },
  { id: 'humain', name: 'Un être humain', emoji: '🧍', meters: 1.7, plain: '1,7 m' },
  { id: 'globule', name: 'Un globule rouge', emoji: '🩸', meters: 0.000008, plain: '0,000 008 m' },
  { id: 'atome', name: "Un atome d'hydrogène", emoji: '⚛️', meters: 1e-10, plain: '0,000 000 000 1 m' },
];
