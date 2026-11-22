/**
 * Les FIGURES du درس « مفهوم الانسحاب والشعاع وتساوي شعاعين », redessinées en données GeoFigure
 * (common/components/geoFigure.js : points, segments, `vectors` (flèches nommées), `grid` (le papier quadrillé))
 * d'après les figures du manuel (pp. 128–136, docs/sources/4am/unit11/extraction.json › figure, et le scan rendu page à
 * page). Aucune image. Les coordonnées sont celles de l'extraction : sur quadrillage, chaque point est sur un nœud, et
 * chaque égalité que la figure doit montrer est exacte (vérifiée par content/figures.test.js avec vectors.js).
 */

/* ── نشاط 1 (p. 128), REDESSINÉ (règle du propriétaire, 2026-10-04) ──
 * Le dessin du manuel est une bande 4 × 11 où les quatre images de ABC s'empilent (GED, A′DC′ et DRP partagent D) et où
 * les étiquettes se heurtent (C′ sur C, E sur L, H sur P). MÊME CONCEPT ici, sur une grille 14 × 8 : le triangle ABC,
 * quatre translations données par un point et son image — A ↦ G et A ↦ M de même منحى (horizontal) mais de sens
 * contraires et de longueurs 6 et 3, A ↦ A′ (3 vers la gauche) qui transforme aussi C en D et K en H, C ↦ R en
 * diagonale — et [EF], [GL], [RP] pour la question 2 د. Les noms que le texte cite sont gardés ; Q, S, T nomment les
 * images qui coïncidaient dans le dessin du manuel. Chaque réponse est RECALCULÉE (figures.test.js, vectors.js).
 */
export const REDRAWN = 'أعادت المنصّة رسم شكل الكتاب بوضوح أكبر، بنفس المعطيات';
export const ACT1_POINTS = {
  A: [8, 4], B: [10, 1], C: [10, 3], K: [7, 7], H: [4, 7],
  G: [2, 4], Q: [4, 1], E: [4, 3], F: [4, 5], L: [0, 4],
  S: [10, 8], P: [12, 5], R: [12, 7],
  M: [11, 4], N: [13, 1], T: [13, 3],
  "A'": [5, 4], "C'": [7, 1], D: [7, 3],
};
const tri = (a, b, c, tone) => ({ points: [a, b, c], tone });
// contours ÉPAIS et un ton par image : chaque triangle se lit d'un coup d'œil (demande du propriétaire)
const edges = (a, b, c, tone) => [{ from: a, to: b, tone, bold: true }, { from: b, to: c, tone, bold: true }, { from: c, to: a, tone, bold: true }];
export const FIG_ACT1 = {
  points: ACT1_POINTS,
  grid: true,
  polygons: [tri('A', 'B', 'C', 'slate'), tri('G', 'Q', 'E', 'emerald'), tri('S', 'P', 'R', 'sky'), tri('M', 'N', 'T', 'amber'), tri("A'", "C'", 'D', 'violet')],
  segments: [...edges('A', 'B', 'C'), ...edges('G', 'Q', 'E', 'emerald'), ...edges('S', 'P', 'R', 'sky'), ...edges('M', 'N', 'T', 'amber'),
    ...edges("A'", "C'", 'D', 'violet'), { from: 'K', to: 'H' }, { from: 'E', to: 'F' }],
  ariaLabel: 'ورقة مرصوفة: المثلث ABC وصوره الأربع GQE و SPR و MNT و A′C′D متباعدة، والقطع [KH] و [EF] والنقطة L',
  caption: REDRAWN,
  maxWidth: 600, // GRANDE, sur sa propre ligne (pleine largeur sur un téléphone)
};

/* ── نشاط 1 جـ/د : les flèches AG, CE, KH, AM (même منحى) ── */
export const FIG_ACT1_ARROWS = {
  points: { A: [8, 4], G: [2, 4], C: [10, 3], E: [4, 3], K: [7, 7], H: [4, 7], M: [11, 4] },
  grid: true,
  vectors: [{ from: 'A', to: 'G', tone: 'amber' }, { from: 'C', to: 'E', tone: 'indigo' }, { from: 'K', to: 'H', tone: 'emerald' }, { from: 'A', to: 'M', tone: 'rose' }],
  ariaLabel: 'ورقة مرصوفة: الأسهم من A نحو G، من C نحو E، من K نحو H نحو اليسار، ومن A نحو M نحو اليمين، كلها أفقية',
  caption: REDRAWN,
  maxWidth: 480,
};

/* ── نشاط 1 2-د : GL, EF, RP ── */
export const FIG_ACT1_2D = {
  points: { G: [2, 4], L: [0, 4], E: [4, 3], F: [4, 5], R: [12, 7], P: [12, 5] },
  grid: true,
  vectors: [{ from: 'G', to: 'L', tone: 'amber' }, { from: 'E', to: 'F', tone: 'indigo' }, { from: 'R', to: 'P', tone: 'rose' }],
  ariaLabel: 'ورقة مرصوفة: السهم من G نحو L أفقي، السهم من E نحو F شاقولي نحو الأعلى، والسهم من R نحو P شاقولي نحو الأسفل، والثلاثة بطول 2',
  caption: REDRAWN,
  maxWidth: 420,
};

/* ── نشاط 2 أ (p. 128) : le triangle quelconque ABC, puis D (ABCD متوازي أضلاع) ── */
export const FIG_ACT2 = {
  points: { A: [0, 4], B: [4, 3], C: [3, 0] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A']],
  ariaLabel: 'مثلث كيفي ABC: A في الأعلى على اليسار، B على اليمين أخفض قليلا، C في الأسفل',
  maxWidth: 260,
};
export const FIG_ACT2_D = {
  points: { A: [0, 4], B: [4, 3], C: [3, 0], D: [-1, 1] },
  segments: [['A', 'D', 'dashed'], ['B', 'C']].map(([f, t, d]) => ({ from: f, to: t, dashed: !!d })),
  vectors: [{ from: 'A', to: 'B', tone: 'rose' }, { from: 'D', to: 'C', tone: 'rose' }],
  polygons: [{ points: ['A', 'B', 'C', 'D'], tone: 'indigo' }],
  ariaLabel: 'متوازي الأضلاع ABCD: الشعاعان من A نحو B ومن D نحو C متوازيان ولهما نفس الاتجاه ونفس الطول',
  maxWidth: 280,
};

/* ── معارف 1 (p. 130) : quatre représentants de u, puis AB = CD ── */
export const FIG_KNOW1 = {
  points: { A: [2, 6], B: [6, 12], E: [3, 2], F: [7, 8], C: [9, 4], D: [13, 10], M: [14, 4], N: [18, 10] },
  grid: true,
  vectors: [{ from: 'A', to: 'B', label: 'u', tone: 'indigo' }, { from: 'E', to: 'F', label: 'u', tone: 'indigo' },
    { from: 'C', to: 'D', label: 'u', tone: 'indigo' }, { from: 'M', to: 'N', label: 'u', tone: 'indigo' }],
  ariaLabel: 'ورقة مرصوفة: أربعة أسهم متوازية لها نفس الاتجاه ونفس الطول، من A نحو B، من E نحو F، من C نحو D ومن M نحو N، كل منها ممثّل للشعاع u',
  maxWidth: 480,
};
export const FIG_KNOW1_EQ = {
  points: { A: [2, 0], B: [8, 6], C: [9, -1], D: [15, 5] },
  grid: { step: 1 },
  vectors: [{ from: 'A', to: 'B', tone: 'rose' }, { from: 'C', to: 'D', tone: 'rose' }],
  ariaLabel: 'ورقة مرصوفة: سهمان متوازيان من A نحو B ومن C نحو D، لهما نفس الاتجاه ونفس الطول',
  maxWidth: 420,
};

/* ── تمرين على تساوي شعاعين (plateforme, module 2) : quatre flèches, une seule paire égale ── */
export const FIG_EQ_PICK = {
  points: { A: [0, 0], B: [3, 1], C: [4, 3], D: [7, 4], E: [9, 1], F: [6, 0], G: [1, 3], H: [7, 5] },
  grid: true,
  vectors: [{ from: 'A', to: 'B', tone: 'indigo' }, { from: 'C', to: 'D', tone: 'emerald' }, { from: 'E', to: 'F', tone: 'rose' }, { from: 'G', to: 'H', tone: 'amber' }],
  ariaLabel: 'ورقة مرصوفة: أربعة أسهم، من A نحو B، من C نحو D، من E نحو F ومن G نحو H',
  maxWidth: 480,
};

/* ── معارف 2 (p. 130) : le parallélogramme ABCD (AB = DC), puis le cas aligné ── */
export const FIG_KNOW2 = {
  points: { A: [1, 2], B: [5, 2], C: [4, 0], D: [0, 0] },
  segments: [{ from: 'A', to: 'D' }, { from: 'B', to: 'C' }, { from: 'A', to: 'C', dashed: true }, { from: 'B', to: 'D', dashed: true }],
  vectors: [{ from: 'A', to: 'B', tone: 'rose' }, { from: 'D', to: 'C', tone: 'rose' }],
  ariaLabel: 'متوازي الأضلاع ABCD: الشعاعان من A نحو B ومن D نحو C متساويان، والقطران [AC] و [BD] لهما نفس المنتصف',
  maxWidth: 280,
};
export const FIG_KNOW2_FLAT = {
  points: { A: [0, 0], B: [4, 0], E: [5, 0], D: [6, 0], C: [10, 0] },
  vectors: [{ from: 'A', to: 'B', tone: 'rose' }, { from: 'D', to: 'C', tone: 'rose' }],
  segments: [{ from: 'B', to: 'D' }],
  labels: { A: 's', B: 's', E: 'n', D: 's', C: 's' },
  ariaLabel: 'النقط A و B و E و D و C على مستقيم واحد: الشعاعان من A نحو B ومن D نحو C متساويان، و E منتصف [AC] و [BD]',
  maxWidth: 320,
};

/* ── تمارين أوظّف (p. 134) ── */
export const FIG_EX1 = {
  points: { A: [0, 0], B: [5, 0], C: [7, 4] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A']],
  ariaLabel: 'مثلث ABC: A في الأسفل على اليسار، B في الأسفل، C في الأعلى على اليمين، و AC أطول من AB',
  maxWidth: 300,
};
export const FIG_EX2 = {
  points: { A: [1, -2], B: [5, -2], E: [7, -3], C: [2, -5], D: [6, -5], F: [8, -6] },
  grid: true,
  ariaLabel: 'ورقة مرصوفة عليها النقط A و B و E و C و D و F على عقد الرصف',
  maxWidth: 420,
};
export const FIG_EX4 = {
  points: { O: [3, 5], A: [0, 4], M: [2, 4], N: [4, 4], B: [6, 4], C: [0, 3], P: [2, 3], Q: [4, 3], D: [6, 3],
    E: [0, 2], R: [2, 2], S: [4, 2], F: [6, 2], H: [2, 0], K: [4, 0] },
  grid: true,
  segments: [['O', 'A'], ['O', 'B'], ['A', 'M'], ['N', 'B'], ['M', 'C'], ['N', 'D'], ['C', 'P'], ['Q', 'D'], ['P', 'E'], ['Q', 'F'],
    ['E', 'R'], ['S', 'F'], ['R', 'H'], ['H', 'K'], ['K', 'S']],
  labels: { O: 'n', A: 'w', C: 'w', E: 'w', B: 'e', D: 'e', F: 'e', H: 's', K: 's', R: 's', S: 's' },
  ariaLabel: 'شجرة صنوبر على ورقة مرصوفة: القمة O، الفروع الأفقية AM و NB و CP و QD و ER و SF، والجذع RHKS',
  maxWidth: 520,
};
export const FIG_EX5 = {
  points: { A: [0, 0], B: [4, 1], C: [5, 5], D: [1, 4] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']],
  ariaLabel: 'معين ABCD (شكل نموذجي)',
  maxWidth: 240,
};
export const FIG_EX5_SOL = {
  points: { A: [0, 0], B: [4, 1], C: [5, 5], D: [1, 4], M: [9, 6], N: [6, 9] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], { from: 'B', to: 'M', tone: 'indigo' }, { from: 'M', to: 'N', tone: 'indigo' }, { from: 'N', to: 'D', tone: 'indigo' }],
  vectors: [{ from: 'C', to: 'M', tone: 'rose' }, { from: 'C', to: 'N', tone: 'emerald' }],
  ariaLabel: 'المعين ABCD والنقطتان M و N حيث الشعاع من C نحو M يساوي الشعاع من A نحو B، والشعاع من C نحو N يساوي الشعاع من B نحو C؛ الرباعي BMND',
  maxWidth: 280,
};
export const FIG_EX8 = {
  points: { A: [0, 2], B: [0, 0], C: [4, 0], D: [4, 2], E: [2, 2], F: [2, 0], G: [0, 1], H: [4, 1], O: [2, 1] },
  segments: [['A', 'D'], ['D', 'C'], ['C', 'B'], ['B', 'A'], ['A', 'C'], ['B', 'D'], ['E', 'F'], ['G', 'H'], ['G', 'E'], ['E', 'H'], ['H', 'F'], ['F', 'G']],
  rightAngles: [['B', 'A', 'D'], ['A', 'D', 'C'], ['D', 'C', 'B'], ['C', 'B', 'A']],
  labels: { A: 'nw', D: 'ne', B: 'sw', C: 'se', E: 'n', F: 's', G: 'w', H: 'e', O: 's' },
  ariaLabel: 'مستطيل ABCD: E و F منتصفا [AD] و [BC]، G و H منتصفا [AB] و [DC]، O مركزه، والمعين GEHF',
  maxWidth: 480,
};

/* ── أؤكّد تعلّماتي (p. 136) : items 1 et 3 ── */
export const FIG_QCM1 = {
  points: { M: [4, 5], N: [0, 5], A: [2, 4], C: [6, 4], D: [6, 0], G: [-1, 1], H: [3, 1], E: [0, 0], F: [4, 0] },
  grid: true,
  vectors: [{ from: 'M', to: 'N' }, { from: 'A', to: 'C' }, { from: 'A', to: 'D' }, { from: 'G', to: 'H' }, { from: 'E', to: 'F' }],
  ariaLabel: 'ورقة مرصوفة: السهم من M نحو N أفقي نحو اليسار، السهم من A نحو C أفقي نحو اليمين، السهم من A نحو D مائل نحو الأسفل، والسهمان من G نحو H ومن E نحو F أفقيان نحو اليمين',
  maxWidth: 480,
};
export const FIG_QCM3 = {
  points: { A: [7, 4], B: [1, 4], C: [0, 2], D: [6, 2], E: [9, 4], H: [9, 0], G: [5, 0] },
  grid: true,
  vectors: [{ from: 'A', to: 'B' }, { from: 'C', to: 'D' }, { from: 'E', to: 'H' }, { from: 'G', to: 'H' }],
  labels: { H: 'se' },
  ariaLabel: 'ورقة مرصوفة: السهم من A نحو B أفقي نحو اليسار، السهم من C نحو D أفقي نحو اليمين بنفس الطول، السهم من E نحو H شاقولي نحو الأسفل، والسهم من G نحو H أفقي نحو اليمين أقصر',
  maxWidth: 480,
};
