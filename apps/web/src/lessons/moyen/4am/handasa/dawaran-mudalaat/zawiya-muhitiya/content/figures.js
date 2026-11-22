/**
 * Les FIGURES du درس « الزاوية المحيطية والزاوية المركزية والعلاقة بينهما », en données GeoFigure
 * (common/components/geoFigure.js : points, segments, `circles`, `arcs` centrés, `angles`, `rightAngles`) d'après les figures
 * du manuel (pp. 151, 153, 156, 159–161 ; docs/sources/4am/unit13/extraction.json › figure, et le scan rendu page à page).
 * Aucune image. Chaque point d'un cercle est posé par sa DIRECTION (degrés) — `on(deg, r)` — pour que les angles que la leçon
 * affirme soient exacts ; content/figures.test.js les recalcule avec rotation.js et mesure `figureQuality`.
 *
 * Analyse (règle du propriétaire, guide §5) : les figures du manuel sont lisibles mais PETITES (≈ 150 px) ; elles sont reproduites
 * sur leurs directions, AGRANDIES (≥ 360 px, 480 px dès qu'il y a plus de six points). DEUX sont REDESSINÉES :
 *   • نشاط 4 : la corde AB du manuel (A ≈ 130°, B ≈ 30°) est tournée de 10° (A 140°, B 40°) pour que la ligne [AB] soit
 *     horizontale — la « ligne de but » du lab ; même concept (angle au centre 100°, D sur le grand arc), réponses recalculées ;
 *   • exercice 12 : le manuel ne trace ni (AB) ni (CD) et laisse M sans nom ; la figure trace les deux cordes et nomme M.
 * Les données que le manuel ne met que SUR la figure sont écrites dans l'énoncé (ex-10 : $\widehat{BOD} = 45^\circ$ ; ex-11 ;
 * ex-16 : $\widehat{DOB} = 40^\circ$) — extraction › discrepancies.
 */

/** Le point du cercle de centre (0 ; 0) et de rayon r à la direction `deg` (degrés, sens direct), arrondi au dix-millième. */
export const on = (deg, r = 2) => {
  const a = (deg * Math.PI) / 180;
  const f = (v) => Math.round(v * 1e4) / 1e4 + 0;
  return [f(r * Math.cos(a)), f(r * Math.sin(a))];
};
/** L'intersection des droites (PQ) et (RS) (pour les points construits : A de l'exercice 16, M de l'exercice 12). */
export function meet(P, Q, R, S) {
  const d = (Q[0] - P[0]) * (S[1] - R[1]) - (Q[1] - P[1]) * (S[0] - R[0]);
  const t = ((R[0] - P[0]) * (S[1] - R[1]) - (R[1] - P[1]) * (S[0] - R[0])) / d;
  const f = (v) => Math.round(v * 1e4) / 1e4 + 0;
  return [f(P[0] + t * (Q[0] - P[0])), f(P[1] + t * (Q[1] - P[1]))];
}

export const REDRAWN = 'أعادت المنصّة رسم شكل الكتاب بوضوح أكبر، بنفس المعطيات';
export const PLATFORM_FIG = 'شكل من المنصّة';
const C0 = (center = 'O', r = 2) => ({ center, radius: r });

/* ── أستعدّ 4 (p. 151) : le cercle (E) et quatre points ; son centre n'est pas dessiné (point caché) ── */
export const FIG_PREP4 = {
  points: { W: [0, 0], D: on(100), C: on(30), B: on(-60), A: on(200) },
  hidden: ['W'],
  circles: [C0('W')],
  segments: [['D', 'A'], ['D', 'B'], ['C', 'B'], { from: 'D', to: 'C', tone: 'slate', dashed: true }, { from: 'A', to: 'B', dashed: true }],
  ariaLabel: 'دائرة (E) عليها النقط D و C و B و A، والقطع [DA] و [DB] و [CB] و [DC] و [AB]',
  maxWidth: 380,
};

/* ── أستعدّ 5 (p. 151) : (E) de centre O, le diamètre [PN], M sur le cercle, [MO] ⊥ [PN] ── */
export const FIG_PREP5 = {
  points: { O: [0, 0], N: on(25), P: on(205), M: on(115) },
  circles: [C0()],
  segments: [['M', 'P'], ['M', 'N'], ['P', 'N'], ['M', 'O']],
  rightAngles: [['P', 'M', 'N'], ['M', 'O', 'N']],
  ariaLabel: 'دائرة (E) مركزها O وقطرها [PN]، والنقطة M عليها، والمثلث MNP قائم في M، و [MO] عمودي على [PN]',
  maxWidth: 380,
};

/* ── نشاط 4 (p. 153), REDESSINÉ : la corde [AB] horizontale (A 140°, B 40°), le petit arc AB coloré, D sur le grand arc ── */
export const ACT4_DIR = { A: 140, B: 40, D: 270, Dd: 320 };
export const FIG_ACT4 = {
  points: { O: [0, 0], A: on(ACT4_DIR.A), B: on(ACT4_DIR.B), D: on(ACT4_DIR.D) },
  circles: [C0()],
  arcs: [{ center: 'O', from: 'B', to: 'A', sweep: 'ccw', tone: 'rose', bold: true }],
  segments: [{ from: 'O', to: 'A', tone: 'indigo' }, { from: 'O', to: 'B', tone: 'indigo' }, { from: 'D', to: 'A', tone: 'amber' }, { from: 'D', to: 'B', tone: 'amber' }],
  angles: [{ at: 'O', from: 'B', to: 'A', tone: 'indigo' }, { at: 'D', from: 'B', to: 'A', tone: 'amber', radius: 26 }],
  ariaLabel: 'دائرة مركزها O، النقطتان A و B عليها والقوس AB الصغير ملوّن، الزاوية المركزية AOB، والنقطة D على القوس الكبير والزاوية المحيطية ADB',
  caption: REDRAWN,
  maxWidth: 420,
};
/* ── نشاط 4 — 1) قول مزيان : [AD] diamètre, OA = OB, le triangle ABD rectangle en B ── */
export const FIG_ACT4_MEZIAN = {
  points: { O: [0, 0], A: on(ACT4_DIR.A), B: on(ACT4_DIR.B), D: on(ACT4_DIR.Dd) },
  circles: [C0()],
  arcs: [{ center: 'O', from: 'B', to: 'A', sweep: 'ccw', tone: 'rose', bold: true }],
  segments: [{ from: 'A', to: 'D', tone: 'emerald', bold: true }, { from: 'O', to: 'A', ticks: 1, tone: 'indigo' }, { from: 'O', to: 'B', ticks: 1, tone: 'indigo' }, ['A', 'B'], { from: 'D', to: 'B', tone: 'amber' }],
  rightAngles: [['A', 'B', 'D']],
  angles: [{ at: 'O', from: 'B', to: 'A', tone: 'indigo' }],
  ariaLabel: 'دائرة مركزها O و [AD] قطر لها، المثلث AOB متساوي الساقين (OA = OB) والمثلث ABD قائم في B',
  caption: REDRAWN,
  maxWidth: 420,
};

/* ── معارف 4 (p. 156) : A 240°, B 320°, M 160°, N 100° (extraction › know-4 › reading : AOB = 80°, AMB = ANB = 40°) ── */
const KNOW4 = { O: [0, 0], A: on(240), B: on(320), M: on(160), N: on(100) };
const KNOW4_ARC = { center: 'O', from: 'A', to: 'B', sweep: 'ccw', tone: 'rose', bold: true };
export const FIG_KNOW4_EX1 = {
  points: KNOW4,
  circles: [C0()],
  arcs: [KNOW4_ARC],
  segments: [{ from: 'O', to: 'A', tone: 'indigo' }, { from: 'O', to: 'B', tone: 'indigo' }, { from: 'A', to: 'M', tone: 'amber' }, { from: 'A', to: 'N', tone: 'amber' }],
  angles: [{ at: 'O', from: 'A', to: 'B', tone: 'indigo' }, { at: 'A', from: 'M', to: 'N', tone: 'amber', radius: 26 }],
  ariaLabel: 'مثال 1: دائرة مركزها O، الزاوية المركزية AOB تحصر القوس AB، والزاوية المحيطية MAN تحصر القوس MN',
  maxWidth: 380,
};
export const FIG_KNOW4_EX2 = {
  points: { O: KNOW4.O, A: KNOW4.A, B: KNOW4.B, M: KNOW4.M },
  circles: [C0()],
  arcs: [KNOW4_ARC],
  segments: [{ from: 'O', to: 'A', tone: 'indigo' }, { from: 'O', to: 'B', tone: 'indigo' }, { from: 'M', to: 'A', tone: 'amber' }, { from: 'M', to: 'B', tone: 'amber' }],
  angles: [{ at: 'O', from: 'A', to: 'B', tone: 'indigo' }, { at: 'M', from: 'A', to: 'B', tone: 'amber', radius: 28 }],
  ariaLabel: 'مثال 2: الزاوية المركزية AOB والزاوية المحيطية AMB تحصران نفس القوس AB',
  maxWidth: 380,
};
export const FIG_KNOW4_EX3 = {
  points: KNOW4,
  circles: [C0()],
  arcs: [KNOW4_ARC],
  segments: [{ from: 'M', to: 'A', tone: 'amber' }, { from: 'M', to: 'B', tone: 'amber' }, { from: 'N', to: 'A', tone: 'emerald' }, { from: 'N', to: 'B', tone: 'emerald' }],
  angles: [{ at: 'M', from: 'A', to: 'B', tone: 'amber', radius: 28 }, { at: 'N', from: 'A', to: 'B', tone: 'emerald', radius: 28 }],
  ariaLabel: 'مثال 3: الزاويتان المحيطيتان AMB و ANB تحصران نفس القوس AB',
  maxWidth: 380,
};

/* ── طريقة (plateforme) : la grande roue de Ben Aknoun — le moyeu O, deux nacelles P et Q, la caméra C sur la roue ── */
export const FIG_TARIQA = {
  points: { O: [0, 0], P: on(200), Q: on(330), C: on(100), K: on(60) },
  circles: [C0()],
  arcs: [{ center: 'O', from: 'P', to: 'Q', sweep: 'ccw', tone: 'rose', bold: true }],
  segments: [{ from: 'O', to: 'P', tone: 'indigo' }, { from: 'O', to: 'Q', tone: 'indigo' }, { from: 'C', to: 'P', tone: 'amber' }, { from: 'C', to: 'Q', tone: 'amber' }, { from: 'K', to: 'P', tone: 'emerald', dashed: true }, { from: 'K', to: 'Q', tone: 'emerald', dashed: true }],
  angles: [{ at: 'O', from: 'P', to: 'Q', tone: 'indigo', label: '130°' }],
  ariaLabel: 'دائرة العجلة مركزها O، النقطتان P و Q عليها والزاوية المركزية POQ قيسها 130 درجة، والنقطتان C و K على القوس الكبير',
  caption: PLATFORM_FIG,
  maxWidth: 420,
};
/* ── طريقة : le cas du diamètre (QCM 3 : un angle plat BOC = 180° compté comme angle au centre) ── */
export const FIG_QUTR = {
  points: { O: [0, 0], B: on(110), C: on(290), A: on(180) },
  circles: [C0()],
  segments: [{ from: 'B', to: 'C', tone: 'indigo' }, { from: 'A', to: 'B', tone: 'amber' }, { from: 'A', to: 'C', tone: 'amber' }],
  angles: [{ at: 'A', from: 'C', to: 'B', tone: 'amber' }],
  ariaLabel: 'دائرة مركزها O وقطرها [BC]، والنقطة A على الدائرة والزاوية المحيطية BAC',
  caption: PLATFORM_FIG,
  maxWidth: 360,
};

/* ── تمرين 10 (p. 159) : ABC متقايس الأضلاع (A 60°, B 180°, C 300°), le diamètre [DE] avec D à 135° ($\widehat{BOD} = 45^\circ$) ── */
export const FIG_EX10 = {
  points: { O: [0, 0], A: on(60), B: on(180), C: on(300), D: on(135), E: on(315) },
  circles: [C0()],
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A'], { from: 'D', to: 'E', tone: 'indigo' }],
  ariaLabel: 'دائرة مركزها O، المثلث ABC متقايس الأضلاع مرسوم فيها، والقطر [DE] حيث D على القوس الصغير AB',
  maxWidth: 480,
};

/* ── تمرين 11 (p. 159) : [AC] diamètre (incliné de 10°), B à 290°, D à 110° ; ∠BOC = 80°, ∠BAC = ∠ACD (le codage) ── */
export const FIG_EX11 = {
  points: { O: [0, 0], A: on(190), C: on(10), B: on(290), D: on(110) },
  circles: [C0()],
  segments: [['A', 'C'], ['A', 'B'], { from: 'O', to: 'B', tone: 'indigo' }, ['C', 'D']],
  angles: [{ at: 'O', from: 'C', to: 'B', tone: 'indigo', label: '80°' }, { at: 'A', from: 'C', to: 'B', tone: 'amber', label: 'α', radius: 28 }, { at: 'C', from: 'A', to: 'D', tone: 'amber', label: 'α', radius: 28 }],
  ariaLabel: 'دائرة مركزها O وقطرها [AC]، النقطتان B و D عليها، الزاوية BOC قيسها 80 درجة، والزاويتان BAC و ACD متقايستان',
  maxWidth: 480,
};

/* ── تمرين 12 (p. 159), REDESSINÉ : [BD] diamètre horizontal, C 120°, A 60°, les cordes [AB] et [CD] qui se coupent en M ── */
const EX12 = { O: [0, 0], B: on(180), D: on(0), C: on(120), A: on(60) };
export const FIG_EX12 = {
  points: { ...EX12, M: meet(EX12.A, EX12.B, EX12.C, EX12.D) },
  circles: [C0()],
  segments: [['B', 'D'], { from: 'A', to: 'B', tone: 'amber' }, { from: 'C', to: 'D', tone: 'emerald' }],
  labels: { M: 'n', O: 's' },
  ariaLabel: 'دائرة (P) مركزها O وقطرها [BD]، النقطتان C و A على نصف الدائرة العلوي، والوتران [AB] و [CD] يتقاطعان في M داخل الدائرة',
  caption: REDRAWN,
  maxWidth: 480,
};

/* ── تمرين 16 (p. 161) : E 100°, C −40°, B 240°, D 200° ($\widehat{DOB} = 40^\circ$ fixé), A = (ED) ∩ (CB) hors du cercle ── */
const EX16 = { O: [0, 0], E: on(100), C: on(-40), B: on(240), D: on(200) };
export const FIG_EX16 = {
  points: { ...EX16, A: meet(EX16.E, EX16.D, EX16.C, EX16.B) },
  circles: [C0()],
  segments: [['E', 'B'], { from: 'E', to: 'O', tone: 'indigo' }, { from: 'O', to: 'C', tone: 'indigo' }, ['E', 'C'], ['D', 'C'], ['D', 'B'], ['E', 'A'], ['A', 'C']],
  angles: [{ at: 'O', from: 'C', to: 'E', tone: 'indigo', label: '140°' }, { at: 'D', from: 'B', to: 'C', tone: 'amber', label: '40°', radius: 26 }],
  ariaLabel: 'دائرة مركزها O عليها E و D و B و C، المستقيمان (ED) و (CB) يتقاطعان في A خارج الدائرة، الزاوية EOC قيسها 140 درجة والزاوية BDC قيسها 40 درجة',
  maxWidth: 480,
};

/* ── تمرين 20 (p. 161, BEM) : la figure « à réaliser » — la plateforme dessine la question 1 seulement ── */
export const FIG_EX20 = {
  points: { O: [0, 0], A: [-4, 0], B: [4, 0], C: [2.875, 2.7811] },
  circles: [{ center: 'O', radius: 4 }],
  segments: [['A', 'B'], ['A', 'C'], { from: 'B', to: 'C', label: '3 cm' }, { from: 'O', to: 'C', tone: 'indigo', dashed: true }],
  rightAngles: [['A', 'C', 'B']],
  ariaLabel: 'دائرة (T) مركزها O وقطرها [AB] طوله 8 سم، والنقطة C عليها حيث BC = 3 سم',
  caption: PLATFORM_FIG,
  maxWidth: 400,
};

/* ── أؤكّد تعلّماتي (p. 160), items 2 et 3 ── */
export const FIG_QCM2 = {
  points: { O: [0, 0], A: [-2, 0], C: on(70), B: on(-70), E: [0.85, 0], D: [2.9, 0] },
  circles: [C0()],
  segments: [['A', 'C'], ['A', 'B'], ['O', 'C'], ['O', 'B'], ['E', 'C'], ['E', 'B'], ['D', 'C'], ['D', 'B']],
  ariaLabel: 'دائرة مركزها O، النقط A و C و B عليها، النقطة E داخلها والنقطة D خارجها، وقطع تصل كلا من A و O و E و D بالنقطتين B و C',
  maxWidth: 420,
};
export const FIG_QCM3 = {
  points: { O: [0, 0], B: on(108), C: on(288), A: on(171) },
  circles: [C0()],
  segments: [['A', 'B'], ['A', 'C'], ['B', 'C']],
  ariaLabel: 'دائرة مركزها O وقطرها [BC]، والنقطة A عليها، والقطعتان [AB] و [AC]',
  maxWidth: 360,
};

/* ── إختبار أولي (plateforme) : deux angles inscrits du même côté de la corde [AB] ── */
export const FIG_TEST_SAME = {
  points: { O: [0, 0], A: on(222), B: on(318), C: on(70), D: on(140) },
  circles: [C0()],
  segments: [{ from: 'C', to: 'A', tone: 'amber' }, { from: 'C', to: 'B', tone: 'amber' }, { from: 'D', to: 'A', tone: 'emerald' }, { from: 'D', to: 'B', tone: 'emerald' }],
  angles: [{ at: 'C', from: 'A', to: 'B', tone: 'amber', label: '48°', radius: 30 }],
  ariaLabel: 'دائرة مركزها O، النقطتان A و B عليها، والنقطتان C و D على نفس القوس، الزاوية ACB قيسها 48 درجة',
  caption: PLATFORM_FIG,
  maxWidth: 380,
};
