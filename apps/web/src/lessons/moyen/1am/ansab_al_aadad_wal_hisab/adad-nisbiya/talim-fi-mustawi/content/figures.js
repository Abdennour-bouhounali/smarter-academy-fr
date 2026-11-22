/**
 * Les FIGURES du درس « التعليم في المستوي » (GeoFigure, données pures : un معلم = `grid: true` + `axes: true`, des points nommés ; tout le texte est en arabe). Chaque figure a deux points
 * d'appui CACHÉS aux coins du cadre (−5 ; −4) et (5 ; 4) pour que les axes se prolongent d'un côté à l'autre et que l'aspect reste proche du carré ; chaque position est recalculée
 * dans ./content.test.js. Rien n'est copié du livre : autres points, autres contextes.
 */
const CORNERS = { c1: [-5, -4], c2: [5, 4] };
const frame = (points, extra = {}) => ({
  points: { ...points, ...CORNERS },
  grid: true,
  axes: true,
  hidden: ['c1', 'c2'],
  maxWidth: 400,
  ...extra,
});

export const FIGURES = {
  // lecture : cinq points, dont deux de même abscisse (B et E) — ex-20
  read: frame({ A: [-4, 2], B: [-1, 4], C: [3, 1], D: [2, -3], E: [-1, -2] }, { ariaLabel: 'معلم متعامد مبدؤه O يظهر فيه خمس نقط A و B و C و D و E' }),
  // les mots : R et S de même abscisse, S et T de même ordonnée — ex-21
  words: frame({ R: [-2, 3], S: [-2, -1], T: [3, -1] }, { ariaLabel: 'معلم متعامد تظهر فيه ثلاث نقط R و S و T' }),
  // le repère caché : une شبكة sans axes, deux points B et C (B a pour إحداثيين (−2 ; −3)) — ex-18, deep-5
  hidden: {
    points: { B: [2, 1], C: [6, 2], g1: [0, 0], g2: [8, 6] },
    grid: true,
    hidden: ['g1', 'g2'],
    maxWidth: 400,
    ariaLabel: 'شبكة مربّعات أُخفي عنها المبدأ والمحوران، تظهر عليها نقطتان B و C',
  },
  // les segments [AC] et [BD] — deep-7
  lines: frame({ A: [-4, 3], B: [-1, 3], C: [2, 3], D: [-1, -2] }, { segments: [{ from: 'A', to: 'C', tone: 'indigo' }, { from: 'B', to: 'D', tone: 'rose' }], ariaLabel: 'معلم متعامد تظهر فيه أربع نقط A و B و C و D والقطعتان [AC] و [BD]' }),
};
