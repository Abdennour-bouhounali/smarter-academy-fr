/**
 * Les FIGURES du درس « مساحة الكرة وحجم الجلة » — des DONNÉES SpaceFigure (lessons/common/components/spaceFigure.js), z vers
 * le haut, dessinées par SpaceFigure dans les modules et le إختبار أولي (`inline`). Chaque figure est analysée :
 *   • l'introduction d'Archimède (p. 163) — bonne figure du manuel (cylindre transparent, boule tangente aux deux bases et au
 *     côté, diamètre vertical pointillé, rayon R pointillé, équateur) : REPRODUITE, R = 1 (le manuel ne donne aucune valeur) ;
 *     les points N, S, M sont des noms de la plateforme (extraction › figure.reading), seuls O et la cote R sont affichés ;
 *   • معارف 2 (p. 166) — la sphère et son équateur, le rayon pointillé R : REPRODUITE (R = 1,4, la valeur de l'exemple).
 * `content/figures.test.js` vérifie `spaceFigureQuality(fig)` = [] pour chacune.
 */
export const FIG_ARCHIMEDES = {
  kind: 'space',
  view: { azimuth: -62, elevation: 16 },
  points: { O: [0, 0, 0], N: [0, 0, 1], S: [0, 0, -1], M: [1, 0, 0] },
  hidden: ['N', 'S', 'M'],
  solids: [
    { type: 'cylinder', base: 'S', top: 'N', radius: 1, tone: 'sky' },
    { type: 'sphere', center: 'O', radius: 1, tone: 'rose' },
  ],
  segments: [
    { from: 'O', to: 'M', label: 'R', dashed: true },
    { from: 'S', to: 'N', dashed: true },
  ],
  labels: { O: 'nw' },
  ariaLabel: 'كرة نصف قطرها R داخل أسطوانة دوران نصف قطر قاعدتها R وارتفاعها 2R: الكرة تمسّ القاعدتين والسطح الجانبي، وقطرها الشاقولي منقّط',
  maxWidth: 300,
};

export const FIG_KNOW2 = {
  kind: 'space',
  view: { azimuth: -62, elevation: 18 },
  points: { O: [0, 0, 0], M: [1.4, 0, 0] },
  hidden: ['M'],
  solids: [{ type: 'sphere', center: 'O', radius: 1.4, tone: 'indigo' }],
  segments: [{ from: 'O', to: 'M', label: 'R', dashed: true }],
  labels: { O: 'nw' },
  ariaLabel: 'كرة مركزها O ونصف قطرها R، ودائرتها الكبرى الأفقية: نصفها الخلفي منقّط',
  maxWidth: 300,
};

/** Le إختبار أولي (E5) : la même situation d'Archimède, sans valeur (le volume du cylindre est donné en mots). */
export const FIG_TEST_ARCHIMEDES = { ...FIG_ARCHIMEDES, inline: true, maxWidth: 260 };
