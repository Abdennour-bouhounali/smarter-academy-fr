/**
 * Les MANCHES du module 7 « وضعية الوحدة » dans le lecteur de mission (la synthèse de l'unité 9, 2026-11-10 — conseil C, verdict : le chemin requis,
 * chaque paire recalculée par le coordinateur ; content/mission.test.js rejoue chaque manche jusqu'à son but et balaie tout ce qu'elle montre).
 * Le lecteur joue UN `LabRounds` (`labId: 'm7-wadiya'`) derrière `PlayerSwitch` ; la page et l'enseignant gardent l'espace de travail d'avant.
 *
 *   zill  shadow-meet — la minaret du quartier à 15:00, la RENCONTRE seule (`hideHeight` : sa hauteur 7,25 est la réponse de l'étape 2) ;
 *         AB = 10 et OA = 11,6 sont les DONNÉES de la figure du module 7 ; puis « pourquoi ici ? » (trois phrases, sans nombre).
 *   r1    cone-cylinder 25 / 15 (n = 5), à la main : (5 ; 12) (10 ; 9) (15 ; 6) (20 ; 3) — deux cylindres qui touchent + un contraste ; la
 *         question `sec` lit r/R et (H − h)/H en NOMBRES (9/15 et 15/25, le leurre 10/25). Le premier refus est gratuit. 6 essais au plus.
 *         Entraînement : h verrouillé sur un cran PAS ENCORE inscrit (20 par défaut → r = 3) ; gagné, il LIBÈRE la manche (1 ★).
 *   r2    cone-cylinder 25 / 10 (n = 5) : deux prédictions (h = 5, un cinquième de H : r un cinquième de R ? — non, r = 8 ; h de 5 à 10 : r
 *         plus que la moitié — 8 → 6), les cylindres h = 5, 10 et 20 ; puis BÂTIR « 2/10 = □/□ » (5, 25, le leurre 20) et la règle en mots
 *         (« r + h ثابت » réfuté par 13, 16, 22). Entraînement : h = 15 verrouillé → r = 4 (jamais requis), libère la manche.
 *   ⭐    cone-cylinder 21 / 14 (n = 7), r VERROUILLÉ : 10 → h = 6, puis 4 → h = 15 (la tâche inverse). Facultative.
 *   libre les trois cônes, grilles entières. Aucun cylindre h = r sur aucune grille (25/6 · 75/8, 50/7, 21·14/35 = 42/5 hors règle).
 * Aucune lettre de point dans le labo du CÔNE (la scène de la minaret garde ses lettres A, B, E, M, O — celles du module 7) ; aucun volume ; aucun
 * nombre dans un verdict. Les lettres viennent à l'étape 7 (« TC/SK = □/□ »).
 */
const shadow = (extra) => ({ type: 'shadow-meet', ...extra });
const cone = (extra) => ({ type: 'cone-cylinder', ...extra });

export const ZILL = { object: 'minaret', height: '7,25', hour: '15:00' };
export const CONE_R1 = { H: 25, R: 15, n: 5 };
export const CONE_R2 = { H: 25, R: 10, n: 5 };
export const CONE_STAR = { H: 21, R: 14, n: 7, lockR: [10, 4] };
export const FREE_CONES = [CONE_R1, CONE_R2, { H: 21, R: 14, n: 7 }];
/** Les prédictions de r2 (des clés : la vérité est calculée par le labo, `logic/coneCylinder › predictTruthPlayer`). */
export const PREDICT = { r2: ['part', 'double'] };
/** La hauteur du cylindre sur lequel r2 bâtit son égalité numérique (h = 20 → r = 2 : 2/10 = 5/25). */
export const R2_BUILD = 20;
/** Les crans de h que r2 demande (5, 10, 20 : les crans 1, 2 et 4). */
export const R2_REQUIRED = [1, 2, 4];

/** L'entraînement de r1 : h verrouillé sur le premier cran (en partant du haut) que l'élève n'a PAS encore vu toucher — 20 par défaut. */
export function r1EasyH(log) {
  const seen = new Set((log?.verdicts ?? []).filter((v) => v.exact).map((v) => v.groups));
  const i = [4, 3, 2, 1].find((j) => !seen.has(j)) ?? 4;
  return i * (CONE_R1.H / CONE_R1.n);
}

const easyR1 = {
  goal: [{ anyExact: true }, { checkpoint: 'sec' }], stars: { predict: false, maxTrials: 3 }, releases: true,
  helpLine: 'جرّب أوّلًا أسطوانة طولها ثابت، ثم عُد.',
  props: (log) => cone({
    // le départ de r n'est JAMAIS la réponse (revue 2026-11-10 : à h = 20, r = 3 de départ touchait déjà) : un jeu ou un refus à corriger
    ...CONE_R1, lockH: r1EasyH(log), start: { r: r1EasyH(log) === 20 ? 9 : 3 }, chains: 'sec',
    lead: 'جولة تدريب: طول الأسطوانة ثابت هذه المرّة.', mission: 'غيّر نصف القطر r حتى تلمس الأسطوانة جدار المخروط، ثم اضغط « أدخِل الأسطوانة ».',
  }),
};
const easyR2 = {
  goal: [{ anyExact: true }, { checkpoint: 'sec' }], stars: { predict: false, maxTrials: 3 }, releases: true,
  helpLine: 'جرّب أوّلًا أسطوانة طولها ثابت، ثم عُد.',
  props: cone({
    ...CONE_R2, lockH: 15, chains: 'sec',
    lead: 'جولة تدريب: المخروط نفسه، وطول الأسطوانة ثابت.', mission: 'غيّر نصف القطر r حتى تلمس الأسطوانة جدار المخروط، ثم اضغط « أدخِل الأسطوانة ».',
  }),
};

export const M7_ROUNDS = [
  { id: 'zill', title: 'مئذنة الحيّ', goal: [{ solvedAll: 1 }, { checkpoint: 'why' }], stars: { predict: false },
    props: shadow({
      ...ZILL, ask: null, hideHeight: true, chains: 'why',
      lead: 'الساعة 15:00 في ساحة الحيّ. المئذنة أعلى من أن تُقاس، ومعك عصا طولها متر واحد.',
      mission: 'حرّك العصا حتى ينتهي ظلّها حيث ينتهي ظلّ المئذنة بالضبط.',
    }) },
  { id: 'r1', title: 'المخروط الأوّل', goal: [{ discovered: true }, { checkpoint: 'sec' }], stars: { predict: false, maxTrials: 6 },
    easier: easyR1, helpAfterRefusals: 3,
    props: cone({
      ...CONE_R1, freeFirstRefusal: true, chains: 'sec',
      lead: 'كوب مثلّجات على شكل مخروط: ارتفاعه 25 سم ونصف قطر قاعدته 15 سم. نريد أن نضع فيه علبة أسطوانية تلمس جداره.',
      mission: 'جد أسطوانتين بطولين مختلفين تلمسان جدار المخروط. اضغط « أدخِل الأسطوانة » لتجرّب.',
    }) },
  { id: 'r2', title: 'المخروط الثاني', goal: [...R2_REQUIRED.map((i) => ({ exact: i })), { checkpoint: 'r2' }], stars: { maxTrials: 5 },
    easier: easyR2, helpAfterRefusals: 3,
    props: cone({
      ...CONE_R2, chains: 'r2', build: R2_BUILD, predict: PREDICT.r2,
      lead: 'كوب آخر: ارتفاعه 25 سم ونصف قطر قاعدته 10 سم.',
      mission: 'جد الأسطوانات التي تلمس الجدار وطولها 5 ثم 10 ثم 20.',
    }) },
  { id: 'star', optional: true, title: 'تحدٍّ: الطول المجهول', goal: [{ allExact: [2, 5] }], stars: { predict: false, maxTrials: 3 },
    props: cone({
      ...CONE_STAR, chains: 'none',
      lead: 'تحدٍّ: كوب ارتفاعه 21 سم ونصف قطر قاعدته 14 سم. نصف قطر الأسطوانة ثابت هذه المرّة.',
      mission: 'جد طول الأسطوانة التي تلمس الجدار ونصف قطرها 10 ، ثم التي نصف قطرها 4 . ثلاث محاولات على الأكثر للنجوم الثلاث.',
    }) },
  { id: 'free', free: true, title: 'المختبر الحرّ',
    props: cone({
      ...CONE_R1, chains: 'none', checkpoints: false, choices: { cones: FREE_CONES },
      lead: 'المختبر الحرّ: اختر مخروطًا.', mission: 'جرّب أسطوانات تلمس الجدار.',
    }) },
];
