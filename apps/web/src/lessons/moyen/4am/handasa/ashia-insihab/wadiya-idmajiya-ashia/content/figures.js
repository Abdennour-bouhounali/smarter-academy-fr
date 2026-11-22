/**
 * Les FIGURES que cette leçon redessine (GeoFigure — common/components/geoFigure.js) : la donnée seulement, en unités
 * libres (un carreau de la ورقة مرصوفة = 1), y vers le haut. Chaque figure suit la description de l'extraction
 * (docs/sources/4am/unit11/extraction.json › figure) et ne porte QUE ce que le manuel dessine — jamais une réponse :
 * la figure de la وضعية place le passage n'importe où (pas à la place optimale), celle de l'ex. 19 ne montre que le
 * triangle EFG donné (D, C et le carré sont à construire). Le banc d'exercices dessine ses `statement.figure` sur le
 * même modèle (une seule façon de dessiner la route et le passage).
 */

/** Une route horizontale entre y = 0 et y = w, de x0 à x1 : quatre coins cachés et la bande teintée. */
const road = (x0, x1, w) => ({
  points: { R1: [x0, w], R2: [x1, w], R3: [x1, 0], R4: [x0, 0] },
  polygon: { points: ['R1', 'R2', 'R3', 'R4'], tone: 'slate' },
  edges: [{ from: 'R1', to: 'R2', bold: true }, { from: 'R4', to: 'R3', bold: true }],
});

/**
 * La وضعية « ممر الراجلين » (p. 136) avec les nombres de la plateforme (extraction › situation › answer ›
 * illustration) : la route entre les deux bords (largeur 2 carreaux), A (الحي) 3 carreaux au-dessus du bord haut,
 * B (المدرسة) 3 carreaux au-dessous du bord bas, 7 carreaux d'écart. Le passage [MN] est posé AILLEURS qu'à la bonne
 * place : la figure modélise, elle ne répond pas.
 */
const R = road(-4.5, 5.5, 2);
export const MODEL = {
  points: { ...R.points, A: [-3, 5], M: [-1, 2], N: [-1, 0], B: [4, -3] },
  polygons: [R.polygon],
  segments: [...R.edges, { from: 'A', to: 'M', tone: 'amber' }, { from: 'M', to: 'N', bold: true, tone: 'indigo' }, { from: 'N', to: 'B', tone: 'amber' }],
  rightAngles: [['R1', 'M', 'N']],
  hidden: ['R1', 'R2', 'R3', 'R4'],
  labels: { A: 'n', B: 's', M: 'ne', N: 'se' },
  grid: true,
  // Le dessin du manuel est une BANDE étroite (route très large, A et B collés aux bords, pas de quadrillage) : redessiné
  // sur un quadrillage presque carré avec l'exemple chiffré de la plateforme (guide §5 « Textbook figures »).
  caption: 'أعادت المنصّة رسم شكل الكتاب بوضوح أكبر، بنفس المعطيات',
  ariaLabel: 'خريطة الوضعية على ورقة مرصوفة: طريق عرضه مربعان بين حافتين متوازيتين، الحي A فوق الحافة العليا بثلاثة مربعات، والمدرسة B تحت الحافة السفلى بثلاثة مربعات وعلى بعد سبعة مربعات أفقيا من A، وممر الراجلين [MN] عمودي على الحافتين، والمسلك من A إلى M ثم N ثم B',
};

/**
 * « وضعية الاختبار النهائي » — la وضعية TRANSPOSÉE : une passerelle au-dessus de l'autoroute de l'Est à Oran, la station du
 * tramway A et le stade B ; un carreau = 10 m. Autoroute de 3 carreaux, A 2 carreaux au-dessus, B 4 au-dessous, 9
 * d'écart. La passerelle est posée AILLEURS qu'à la bonne place (x = 6 ; l'optimum est x = 3).
 */
const RT = road(-1, 10, 3);
export const TEST_FIGURE = {
  points: { ...RT.points, A: [0, 5], M: [6, 3], N: [6, 0], B: [9, -4] },
  polygons: [RT.polygon],
  segments: [...RT.edges, { from: 'A', to: 'M', tone: 'amber' }, { from: 'M', to: 'N', bold: true, tone: 'indigo' }, { from: 'N', to: 'B', tone: 'amber' }],
  rightAngles: [['R1', 'M', 'N']],
  hidden: ['R1', 'R2', 'R3', 'R4'],
  labels: { A: 'n', B: 's', M: 'ne', N: 'se' },
  grid: true,
  ariaLabel: 'خريطة على ورقة مرصوفة ضلع مربعها يمثّل 10 أمتار: طريق سيار عرضه ثلاثة مربعات، محطة الترامواي A فوق حافته العليا بمربعين، والملعب B تحت حافته السفلى بأربعة مربعات وعلى بعد تسعة مربعات أفقيا من A، والجسر [MN] عمودي على الحافتين',
};
