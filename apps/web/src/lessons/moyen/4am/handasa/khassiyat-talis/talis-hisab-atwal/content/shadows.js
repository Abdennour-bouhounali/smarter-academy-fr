/**
 * LES DEUX OMBRES de la leçon : le labo `shadow-meet` joué en MANCHES avec étoiles dans le lecteur de mission (rollout 2026-11-10, unité 9
 * leçon 1 ; conseil du 2026-11-10 — 5 conseillers, 5 revues, président ; verdict « L1 », arithmétique revérifiée par le coordinateur et
 * recalculée en fractions exactes par content/shadows.test.js). La page et l'enseignant gardent le monde `shadow-world` : rien ici ne le touche.
 *
 * Un bâton de 1 m, le soleil à une heure FIXÉE par la manche (k = ombre ÷ hauteur : 14:00 → 1,2 ; 14:30 → 1,32 ; 15:30 → 1,84 ; 16:00 → 2,28).
 * Un ESSAI est une RÉPONSE (une hauteur, un drapeau) — jamais un mouvement du bâton ; la même réponse deux fois ne compte pas.
 *
 * MODULE 1 (`M1_ROUNDS`, labId `m1-shadows`)
 *   r1  le lampadaire de 2,75 m à 14:00, à la main : la rencontre (OA 3,3 · OB 1,2 · BA 2,1) ; les suites `readFigure` (conseil du 2026-11-11) :
 *       « read » (lire OB et OA parmi les trois longueurs, SUR LA PLACE), « figure » (la place DEVIENT la figure : désigner (AM) ∥ (BE) parmi
 *       quatre droites, puis pourquoi — deux perpendiculaires à (OA)), « ratio » (BÂTIR « BE/AM = OB/OA » — le leurre BA, la قطعة) : l'hypothèse
 *       avant la conclusion ; la hauteur en trois pastilles (2,75 · 1,75 la قطعة · 3,1 l'écart) ; « rule » : la phrase parmi trois. Pas de prédiction.
 *   r2  le château d'eau de 6,5 m à 14:00 (7,8 · 1,2 · 6,6 ; pastilles 6,5 · 5,5 · 7,6) puis, UNE heure à l'écran à la fois, à 16:00
 *       (14,82 · 2,28 · 12,54 — observé, pas calculé). Entre les deux, deux prédictions : « l'ombre du bâton reste-t-elle la même ? » → non ;
 *       « celle du château d'eau : moins / exactement / plus du double ? » → moins (× 1,9). La suite « same » : ce qui n'a pas changé — OB/OA = 2/13.
 *   r3  REQUISE : un mât de 3,75 m à planter, à 14:30 — écrire où finira son ombre (4,95 m, au centimètre) dans le modèle « AO = [ ] m », puis
 *       planter le drapeau. La suite « build » : le rapport du mât = celui du bâton (le rapport INVERSÉ est une tuile).
 *   ⭐  à 15:30 : le palmier par le rapport (ombre mesurée 7,82 m → 4,25 m), puis un château d'eau par la rencontre (13,8 · 1,84 · 11,96 → 7,5 m),
 *       hauteurs TAPÉES (« H = [ ] m »), trois réponses au plus.
 *   libre : 5,75 / 6,75 / 9,25 m ; 13:00, 13:30, 14:00, 14:30, 15:30, 16:00 (jamais 12:30 ni 15:00 — l'heure du تحدّ de la synthèse).
 *   Entraînement (« لا بأس — جرّب أصغر », après 2 questions ratées, ou les refus de la manche) : r1 → un lampadaire de 1,5 m (1,8 · 1,2 · 0,6 ;
 *   pastilles 1,5 · 0,5 · 1,8) ; r3 → un mât de 2,25 m à 14:00 (2,7 m).
 *
 * Les nombres de la مسألة (10, 12, 6, 4, 4,8, 2,4, 4,5, 5,6, 5, 15, 9, 8, 3, 180 ; 2/5, 1/2, 3/2…) et du تحدّ de la synthèse (7,25 · 11,6 · 1,6 ·
 * 15:00) ne sont montrés par AUCUN écran dans leur rôle : content/forbidden.js (la règle) et content/shadows.test.js / mission.test.js (le
 * balayage de `logic/shadowMeet › shownValues`).
 */
const props = (extra) => ({ type: 'shadow-meet', ...extra });

export const R1 = { object: 'lamp', height: '2,75', hour: '14:00', ask: 'tap' };
export const R1_EASY = { object: 'lamp', height: '1,5', hour: '14:00', ask: { kind: 'tap', decoys: ['segment', 'shadow'] } };
export const R2 = {
  steps: [{ object: 'tower', height: '6,5', hour: '14:00', ask: 'tap' }, { object: 'tower', height: '6,5', hour: '16:00' }],
};
export const R3 = { object: 'pole', height: '3,75', hour: '14:30', task: 'flag' };
export const R3_EASY = { object: 'pole', height: '2,25', hour: '14:00', task: 'flag' };
export const CHALLENGE = {
  steps: [{ object: 'palm', height: '4,25', hour: '15:30', task: 'ratio', ask: 'type' }, { object: 'tower', height: '7,5', hour: '15:30', ask: 'type' }],
};
export const FREE = { heights: ['5,75', '6,75', '9,25'], hours: ['13:00', '13:30', '14:00', '14:30', '15:30', '16:00'] };

/** Les prédictions de chaque manche : des clés ; les options et la vérité sont calculées par le labo (`logic › predictOptions`, `predictTruth`). */
export const PREDICT = { r2: ['stickSame', 'double'] };

const easyLamp = {
  goal: [{ solvedAll: 1 }, { checkpoint: 'read' }], helpLine: 'جرّب أوّلًا عمودًا أقصر، ثم عُد.', stars: { maxTrials: 3, predict: false },
  props: props({ ...R1_EASY, chains: 'readEasy', lead: 'جولة تدريب: عمود إنارة أقصر، والساعة 14:00.', mission: 'حرّك العصا حتى ينتهي ظلّها حيث ينتهي ظلّ العمود بالضبط، ثم جد ارتفاعه.' }),
};
const easyPole = {
  goal: [{ solvedAll: 1 }], helpLine: 'جرّب أوّلًا سارية أقصر، ثم عُد.', stars: { maxTrials: 3, predict: false },
  props: props({ ...R3_EASY, chains: 'none', lead: 'جولة تدريب: سارية ارتفاعها 2,25 m ، والساعة 14:00.', mission: 'أين سينتهي ظلّ السارية؟ اكتب طوله ثم اغرس العلم عند نهايته.' }),
};

export const M1_ROUNDS = [
  { id: 'r1', title: 'عمود الإنارة', goal: [{ solvedAll: 1 }, { checkpoint: 'read' }, { checkpoint: 'figure' }, { checkpoint: 'ratio' }, { checkpoint: 'rule' }],
    stars: { maxTrials: 2, predict: false }, easier: easyLamp, helpAfterRefusals: 2,
    props: props({ ...R1, chains: 'readFigure', lead: 'ساحة الحيّ بعد الظهر، الساعة 14:00. عمود الإنارة أعلى من أن تقيسه، ومعك عصا طولها 1 m.', mission: 'حرّك العصا حتى ينتهي ظلّها حيث ينتهي ظلّ العمود بالضبط، ثم جد ارتفاع العمود.' }) },
  { id: 'r2', title: 'خزّان الماء', goal: [{ solvedAll: 2 }, { checkpoint: 'same' }], stars: { maxTrials: 2 },
    props: props({ ...R2, chains: 'same', predict: PREDICT.r2, lead: 'خزّان الماء في طرف الساحة: لا أحد يستطيع قياسه. الساعة 14:00، وبعدها تتحرّك الشمس.', mission: 'اجعل الظلّين ينتهيان معًا وجد ارتفاع الخزّان. ثم حرّك الشمس وأعد: ما الذي يبقى كما هو؟' }) },
  { id: 'r3', title: 'سارية جديدة', goal: [{ solvedAll: 1 }, { checkpoint: 'build' }], stars: { maxTrials: 2, predict: false },
    easier: easyPole, helpAfterRefusals: 3,
    props: props({ ...R3, chains: 'flag', lead: 'الساعة 14:30. ستنصب البلدية سارية ارتفاعها 3,75 m في النقطة A، والعصا مغروسة بجانبها.', mission: 'أين سينتهي ظلّ السارية؟ اكتب طوله ثم اغرس العلم عند نهايته.' }) },
  { id: 'challenge', optional: true, title: 'تحدٍّ: ارتفاعان', goal: [{ solvedAll: 2 }], stars: { maxTrials: 3, predict: false },
    props: props({ ...CHALLENGE, chains: 'none', lead: 'تحدٍّ عند الساعة 15:30: النخلة ثم خزّان آخر، بثلاث إجابات على الأكثر.', mission: 'احسب ارتفاع النخلة من الظلّين المقيسين، ثم ارتفاع الخزّان بعد أن يلتقي الظلّان.' }) },
  { id: 'free', free: true, title: 'الساحة الحرّة',
    props: props({ object: 'tower', height: FREE.heights[0], hour: '14:00', ask: 'type', chains: 'none', checkpoints: false, choices: FREE, lead: 'الساحة الحرّة: اختر ارتفاعًا وساعة.', mission: 'اجعل الظلّين يلتقيان، ثم احسب الارتفاع.' }) },
];
