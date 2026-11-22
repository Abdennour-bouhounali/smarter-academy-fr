/**
 * Les FIGURES du manuel que cette leçon redessine (GeoFigure — common/components/geoFigure.js) : la donnée
 * seulement, en unités libres, y vers le haut. Chaque figure suit la description de l'extraction
 * (docs/sources/4am/unit9/extraction.json › figure) et ne porte QUE les longueurs que le manuel écrit — jamais
 * une réponse. Les longueurs dessinées respectent les rapports de l'énoncé (Thalès se voit sur le dessin).
 */

/**
 * La وضعية (p. 112) : la DEMI-coupe axiale — S centre de la base du cône, K un point du cercle de base (SK = R = 6),
 * O le sommet (SO = H = 18) ; le cylindre : T centre de sa face libre (ST = h), C sur son cercle (TC = r), D sur
 * la base. C est sur la génératrice [OK]. Les dimensions h et r sont des LETTRES (rien de la réponse n'est dessiné :
 * le coin est placé à un endroit quelconque de la génératrice).
 */
export const SECTION = {
  points: { S: [0, 0], K: [0, 6], O: [18, 0], T: [6, 0], C: [6, 4], D: [0, 4] },
  segments: [
    { from: 'S', to: 'K', label: '6', labelSide: 1 }, { from: 'K', to: 'O' }, { from: 'S', to: 'T', label: 'h', labelSide: -1 },
    { from: 'T', to: 'O', labelSide: -1 }, { from: 'T', to: 'C', label: 'r', tone: 'indigo', bold: true },
    { from: 'D', to: 'C', tone: 'indigo' }, { from: 'S', to: 'D', tone: 'indigo' },
  ],
  polygons: [{ points: ['O', 'T', 'C'], tone: 'amber' }],
  rightAngles: [['K', 'S', 'O'], ['C', 'T', 'O']],
  labels: { S: 'sw', K: 'nw', O: 'e', T: 's', C: 'n', D: 'w' },
  ariaLabel: 'نصف المقطع المحوري: المثلث القائم OSK حيث SK = 6 و SO = 18، والمستطيل SDCT للأسطوانة حيث ST = h و TC = r، والنقطة C على [OK]',
  caption: 'ارتفاع المخروط 18 ونصف قطر قاعدته 6',
  maxWidth: 420,
};