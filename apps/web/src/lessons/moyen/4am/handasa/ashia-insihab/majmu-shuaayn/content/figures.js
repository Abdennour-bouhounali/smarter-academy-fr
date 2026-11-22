/**
 * Les figures du درس 3 en DONNÉES GeoFigure (lessons/common/components/geoFigure.js) — redessinées d'après
 * extraction › figure (coordonnées lues et vérifiées par build-extraction.py), jamais une image du manuel. Unités libres,
 * y vers le HAUT ; `grid` = le papier quadrillé du manuel. Aucune figure « énoncé » n'écrit la réponse demandée : les
 * figures « SOL » ne sont montrées qu'après la réponse de l'élève. Le banc de pratique (statement.figure) dessine avec
 * les mêmes formes (un seul langage de dessin).
 */
const R3 = 1.732; // √3 arrondi pour le DESSIN (ex-10) — aucun calcul ne s'en sert
/** La ligne discrète d'une figure redessinée (guide §5 « Textbook figures ») : même concept, mise en page lisible. */
export const REDRAWN = 'أعادت المنصّة رسم شكل الكتاب بوضوح أكبر، بنفس المعطيات';

/** نشاط 3 (p. 129) : quadrillage 11 × 9, le triangle ABC et la point M (O et Z, cachés, tiennent le cadre). */
export const FIG_ACT3 = {
  points: { A: [2, 8], B: [1, 3], C: [4, 1], M: [8, 7], O: [0, 0], Z: [11, 9] },
  hidden: ['O', 'Z'],
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A']],
  polygons: [{ points: ['A', 'B', 'C'], tone: 'amber' }],
  labels: { A: 'n', B: 'w', C: 's', M: 'e' },
  grid: true,
  ariaLabel: 'ورقة مرصوفة: المثلث ABC والنقطة M في أعلى اليمين',
};

/** نشاط 3 — après la réponse : M′ (7 ; 2) et M″ (10 ; 0), les trois flèches de M, et AB, BC, AC. */
export const FIG_ACT3_SOL = {
  points: { A: [2, 8], B: [1, 3], C: [4, 1], M: [8, 7], "M′": [7, 2], "M″": [10, 0], O: [0, 0], Z: [11, 9] },
  hidden: ['O', 'Z'],
  segments: [['A', 'M'], ['B', "M′"], ['C', "M″"]].map(([from, to]) => ({ from, to, dashed: true })),
  vectors: [
    { from: 'A', to: 'B', tone: 'indigo' }, { from: 'B', to: 'C', tone: 'amber' }, { from: 'A', to: 'C', tone: 'emerald' },
    { from: 'M', to: "M′", tone: 'indigo' }, { from: "M′", to: "M″", tone: 'amber' }, { from: 'M', to: "M″", tone: 'emerald' },
  ],
  labels: { A: 'n', B: 'w', C: 's', M: 'e', "M′": 'w', "M″": 'e' },
  grid: true,
  ariaLabel: 'M′ صورة M بالانسحاب الذي شعاعه AB ، و M″ صورة M′ بالانسحاب الذي شعاعه BC ، والسهم من M إلى M″ يساوي السهم من A إلى C',
};

/** نشاط 4 (p. 129) : trois points non alignés, comme le manuel (rien d'autre). */
export const FIG_ACT4 = {
  points: { A: [0, 0], B: [2, 3], C: [5, 3] },
  labels: { A: 'w', B: 'n', C: 'n' },
  ariaLabel: 'ثلاث نقط A و B و C ليست على استقامة واحدة: A في الأسفل على اليسار، B فوقها إلى اليمين، C على يمين B',
};

/** نشاط 4 — après les réponses : AB + BC = AC, D (ABCD parallélogramme), AB + AD = AC. */
export const FIG_ACT4_SOL = {
  points: { A: [0, 0], B: [2, 3], C: [5, 3], D: [3, 0] },
  segments: [{ from: 'C', to: 'D', dashed: true }],
  vectors: [
    { from: 'A', to: 'B', tone: 'indigo' }, { from: 'B', to: 'C', tone: 'amber' },
    { from: 'A', to: 'D', tone: 'sky' }, { from: 'A', to: 'C', tone: 'emerald' },
  ],
  labels: { A: 'w', B: 'n', C: 'n', D: 's' },
  ariaLabel: 'متوازي الأضلاع ABCD: السهم AC يساوي AB + BC ويساوي أيضا AB + AD',
};

/** معارف 4 (p. 132) : le triangle ABC et M, M′, M″ « de la même forme » (papier fin du manuel : pas 0,5). */
export const FIG_KNOW4 = {
  points: { A: [0, 4.5], B: [3.5, 9.5], C: [10, 7.5], M: [0, 0], "M′": [3.5, 5], "M″": [10, 3] },
  vectors: [
    { from: 'A', to: 'B', tone: 'rose' }, { from: 'B', to: 'C', tone: 'rose' }, { from: 'A', to: 'C', tone: 'rose' },
    { from: 'M', to: "M′", tone: 'indigo' }, { from: "M′", to: "M″", tone: 'indigo' }, { from: 'M', to: "M″", tone: 'emerald' },
  ],
  labels: { A: 'w', B: 'n', C: 'e', M: 'w', "M′": 'n', "M″": 'e' },
  grid: { step: 0.5 },
  ariaLabel: 'المثلث ABC بالأسهم AB و BC و AC ، وتحته M و M′ و M″: انسحابان متتابعان من M يعطيان الانسحاب الذي شعاعه AC',
};

/** معارف 5 (p. 132) : u vers la droite, v vers la gauche, six carreaux chacun. */
export const FIG_KNOW5 = {
  points: { P: [0, 2], Q: [6, 2], R: [6, 0], S: [0, 0] },
  hidden: ['P', 'Q', 'R', 'S'],
  vectors: [{ from: 'P', to: 'Q', label: 'u', tone: 'indigo' }, { from: 'R', to: 'S', label: 'v', tone: 'rose' }],
  grid: true,
  ariaLabel: 'ورقة مرصوفة: الشعاع u أفقي نحو اليمين طوله 6 مربعات، والشعاع v تحته أفقي نحو اليسار بنفس الطول',
};

/** معارف 6 (p. 132) : ABDC parallélogramme, AB + AC = AD (la diagonale issue de A). */
export const FIG_KNOW6 = {
  // REDESSINÉE : le manuel étire ABDC en bande (9 × 3, rapport 2,5 : 1) ; même concept sur un cadre presque carré.
  points: { A: [0, 0], B: [6, 0], C: [2, 4], D: [8, 4] },
  segments: [{ from: 'C', to: 'D', dashed: true }, { from: 'B', to: 'D', dashed: true }],
  vectors: [{ from: 'A', to: 'B', tone: 'indigo' }, { from: 'A', to: 'C', tone: 'amber' }, { from: 'A', to: 'D', tone: 'rose' }],
  labels: { A: 'sw', B: 'se', C: 'nw', D: 'ne' },
  ariaLabel: 'متوازي الأضلاع ABDC: السهمان AB و AC لهما نفس المبدأ A ، ومجموعهما السهم AD قطر متوازي الأضلاع الصادر من A',
  caption: REDRAWN,
};

/** طرائق (p. 133) : le quadrilatère ABDC du manuel. */
export const FIG_METHOD = {
  points: { A: [6, 1], B: [0, 0], C: [4, -3], D: [8, -3] },
  segments: [['A', 'B'], ['B', 'D'], ['D', 'C'], ['C', 'A']],
  labels: { A: 'ne', B: 'nw', C: 's', D: 'se' },
  ariaLabel: 'رباعي: B في أعلى اليسار، A في أعلى اليمين، C في الأسفل في الوسط، D في أسفل اليمين',
};

/** طرائق — la figure de la solution : I milieu de [BC], M symétrique de A ; BE = AD, N = E. */
export const FIG_METHOD_SOL = {
  points: { A: [6, 1], B: [0, 0], C: [4, -3], D: [8, -3], I: [2, -1.5], M: [-2, -4], E: [2, -4] },
  segments: [['A', 'B'], ['B', 'D'], ['D', 'C'], ['C', 'A'], { from: 'A', to: 'M', dashed: true }],
  vectors: [
    { from: 'C', to: 'M', tone: 'indigo' }, { from: 'B', to: 'E', tone: 'amber' }, { from: 'A', to: 'E', tone: 'emerald' },
  ],
  labels: { A: 'ne', B: 'nw', C: 'e', D: 'se', I: 'w', M: 'sw', E: 's' },
  ariaLabel: 'الحل: M نظيرة A بالنسبة إلى I منتصف [BC] ، والسهم BE يساوي AD ، فالسهم AE هو AB + AD و N تنطبق على E',
  maxWidth: 480,
};

/** دوري الآن 2 (p. 133) : le rectangle ABCD. */
export const FIG_NOW = {
  points: { A: [0, 3], B: [5, 3], C: [5, 0], D: [0, 0] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], { from: 'B', to: 'D', dashed: true }],
  rightAngles: [['B', 'A', 'D']],
  labels: { A: 'nw', B: 'ne', C: 'se', D: 'sw' },
  ariaLabel: 'مستطيل ABCD: A في أعلى اليسار، B في أعلى اليمين، C في أسفل اليمين، D في أسفل اليسار',
};

/** دوري الآن 2 — après : DA + DB = DE (E symétrique de C par rapport à B) ; AC + BC = AF (F symétrique de B par rapport à C). */
export const FIG_NOW_SOL = {
  points: { A: [0, 3], B: [5, 3], C: [5, 0], D: [0, 0], E: [5, 6], F: [5, -3] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], { from: 'B', to: 'E', dashed: true }, { from: 'C', to: 'F', dashed: true }],
  vectors: [{ from: 'D', to: 'E', tone: 'emerald' }, { from: 'A', to: 'F', tone: 'rose' }],
  labels: { A: 'nw', B: 'w', C: 'w', D: 'sw', E: 'ne', F: 'se' },
  ariaLabel: 'المستطيل ABCD مع E نظيرة C بالنسبة إلى B و F نظيرة B بالنسبة إلى C ، والسهمان DE و AF',
};

/** تمرين 10 (p. 135) : le grand triangle équilatéral EFD et les milieux A, B, C. */
export const FIG_EX10 = {
  points: { A: [0, 0], B: [-1, -R3], C: [1, -R3], E: [-2, 0], F: [2, 0], D: [0, -2 * R3] },
  segments: [['E', 'F'], ['F', 'D'], ['D', 'E'], ['A', 'B'], ['B', 'C'], ['C', 'A']],
  labels: { A: 'n', B: 'w', C: 'e', E: 'nw', F: 'ne', D: 's' },
  ariaLabel: 'مثلث متقايس الأضلاع EFD و A و B و C منتصفات [EF] و [ED] و [FD]: أربعة مثلثات متقايسة الأضلاع ABC و BCD و AFC و EAB',
};

/** تمرين 11 (p. 135) : ABCD parallélogramme ; N symétrique de B / C et M symétrique de A / D (définis dans l'énoncé). */
export const FIG_EX11 = {
  // REDESSINÉE : avec N et M (définis par l'énoncé) la figure du manuel devient une bande 10 × 3 ; ABCD plus haut.
  points: { A: [0, 0], B: [-1, 5], C: [3, 5], D: [4, 0], N: [7, 5], M: [8, 0] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], { from: 'C', to: 'N', dashed: true }, { from: 'D', to: 'M', dashed: true }],
  labels: { A: 's', B: 'nw', C: 'n', D: 's', N: 'ne', M: 'se' },
  ariaLabel: 'متوازي الأضلاع ABCD، و N نظيرة B بالنسبة إلى C ، و M نظيرة A بالنسبة إلى D',
  caption: REDRAWN,
};

/** تمرين 13 (p. 135) : ABC, A′ B′ C′ milieux de [BC] [AC] [AB] (lecture de la figure), G centre de gravité. */
export const FIG_EX13 = {
  points: { A: [6, 6], B: [0, 0], C: [9, -3], "A′": [4.5, -1.5], "B′": [7.5, 1.5], "C′": [3, 3], G: [5, 1] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A'], { from: 'A', to: "A′", tone: 'slate' }, { from: 'B', to: "B′", tone: 'slate' }, { from: 'C', to: "C′", tone: 'slate' }],
  labels: { A: 'n', B: 'w', C: 'se', "A′": 's', "B′": 'e', "C′": 'nw', G: 'n' },
  ariaLabel: 'مثلث ABC و A′ و B′ و C′ منتصفات [BC] و [AC] و [AB] ، والمتوسطات تتقاطع في G مركز الثقل',
  maxWidth: 480,
};

/** تمرين 15 (p. 135) : les deux vecteurs donnés AB et CD. */
export const FIG_EX15 = {
  points: { A: [0, 0], B: [7, 5], C: [9, 5], D: [12, 3] },
  vectors: [{ from: 'A', to: 'B', tone: 'indigo' }, { from: 'C', to: 'D', tone: 'rose' }],
  labels: { A: 'w', B: 'n', C: 'n', D: 'e' },
  ariaLabel: 'سهم طويل من A إلى B وسهم قصير من C إلى D على يمين B',
};

/** تمرين 16 — « أنجز شكلا مناسبا » : une figure de la plateforme (E milieu de [AC] et de [BD], B hors de (AC)). */
export const FIG_EX16 = {
  points: { A: [0, 0], C: [6, 2], E: [3, 1], B: [1, 3], D: [5, -1] },
  segments: [{ from: 'A', to: 'C', dashed: true }, { from: 'B', to: 'D', dashed: true }],
  labels: { A: 'w', C: 'e', E: 'n', B: 'n', D: 's' },
  ariaLabel: 'شكل مناسب: E منتصف [AC] ومنتصف [BD] ، و B لا تنتمي إلى المستقيم (AC)',
};
