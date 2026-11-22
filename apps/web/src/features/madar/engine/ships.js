/**
 * Les vaisseaux de « مدار ». Les RÈGLES de déblocage vivent au serveur
 * (MadarShips::CATALOGUE) ; ici, l'apparence : la silhouette (tracée au
 * canevas pendant la partie, en SVG dans les listes) et les couleurs.
 *
 * Coordonnées d'une silhouette : nez vers +x, longueur ≈ 2 (de −1 à +1),
 * centrée sur l'origine. Le rendu la met à l'échelle et l'oriente.
 */
const SHIPS = [
  {
    id: 'sahm',
    colors: { body: '#e8f1ff', accent: '#3b82f6', cockpit: '#7dd3fc', flame: ['#fde68a', '#f97316'], trail: '#60a5fa' },
    hull: [[1, 0], [0.35, 0.28], [-0.55, 0.3], [-0.8, 0.62], [-0.95, 0.62], [-0.75, 0], [-0.95, -0.62], [-0.8, -0.62], [-0.55, -0.3], [0.35, -0.28]],
    cockpit: [0.3, 0, 0.2, 0.13],
  },
  {
    id: 'saqr',
    colors: { body: '#fef3c7', accent: '#f59e0b', cockpit: '#fcd34d', flame: ['#fef9c3', '#f59e0b'], trail: '#fbbf24' },
    hull: [[1, 0], [0.45, 0.14], [0, 0.18], [-0.35, 0.9], [-0.62, 0.9], [-0.5, 0.2], [-0.95, 0.18], [-0.95, -0.18], [-0.5, -0.2], [-0.62, -0.9], [-0.35, -0.9], [0, -0.18], [0.45, -0.14]],
    cockpit: [0.35, 0, 0.18, 0.09],
  },
  {
    id: 'mudhannab',
    colors: { body: '#ffe4e6', accent: '#f43f5e', cockpit: '#fda4af', flame: ['#fff1f2', '#e11d48'], trail: '#fb7185' },
    hull: [[0.95, 0], [0.7, 0.42], [0.1, 0.55], [-0.6, 0.42], [-0.9, 0.18], [-0.9, -0.18], [-0.6, -0.42], [0.1, -0.55], [0.7, -0.42]],
    cockpit: [0.35, 0, 0.26, 0.22],
    longTrail: true,
  },
  {
    id: 'nayzak',
    colors: { body: '#ede9fe', accent: '#8b5cf6', cockpit: '#c4b5fd', flame: ['#f5f3ff', '#7c3aed'], trail: '#a78bfa' },
    hull: [[1.05, 0], [-0.9, 0.78], [-0.55, 0.12], [-0.95, 0], [-0.55, -0.12], [-0.9, -0.78]],
    cockpit: [0.15, 0, 0.22, 0.1],
  },
  {
    id: 'falak',
    colors: { body: '#ccfbf1', accent: '#14b8a6', cockpit: '#99f6e4', flame: ['#f0fdfa', '#0d9488'], trail: '#2dd4bf' },
    hull: [[0.9, 0], [0.62, 0.62], [0, 0.88], [-0.62, 0.62], [-0.9, 0], [-0.62, -0.62], [0, -0.88], [0.62, -0.62]],
    cockpit: [0, 0, 0.36, 0.36],
    saucer: true,
  },
  {
    id: 'majarra',
    colors: { body: '#fdf4ff', accent: '#d946ef', cockpit: '#f0abfc', flame: ['#ffffff', '#c026d3'], trail: 'rainbow' },
    hull: [[1.05, 0], [0.3, 0.22], [0.05, 0.75], [-0.25, 0.3], [-0.95, 0.5], [-0.65, 0], [-0.95, -0.5], [-0.25, -0.3], [0.05, -0.75], [0.3, -0.22]],
    cockpit: [0.38, 0, 0.2, 0.11],
  },
];

const BY_ID = new Map(SHIPS.map((s) => [s.id, s]));

export function shipById(id) {
  return BY_ID.get(id) ?? SHIPS[0];
}

/** La silhouette en chemin SVG (viewBox −1.2…1.2). */
export function hullPath(ship) {
  return ship.hull.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(3)} ${y.toFixed(3)}`).join(' ') + ' Z';
}
