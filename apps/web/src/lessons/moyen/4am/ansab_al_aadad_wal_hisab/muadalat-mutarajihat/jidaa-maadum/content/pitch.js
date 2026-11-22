/**
 * LE TERRAIN QUI S'ANNULE de la leçon : le labo `vanishing-pitch` joué en MANCHES avec étoiles dans le lecteur de mission (rollout 2026-11-11,
 * unité 4 leçon 2 ; conseil du 2026-11-11, verdict L2 — arithmétique revérifiée par la logique du labo, VERDICT.md §3.2).
 * Un ESSAI = épingler un x NOUVEAU, ou « لا حلول أخرى » alors qu'un zéro manque (une fois par ensemble d'épingles) ; le PREMIER refus de la
 * leçon (M1 r1) et de la manche couverte est gratuit ; aucun refus n'est exigé (L2.2).
 *
 * MODULE 1 (`M1_ROUNDS`, labId `lab-vanish-m1`) — trois manches REQUISES, pas d'étoile couverte (le ⭐ est supprimé, L2.4) :
 *   r1  2(x − 3) à la main : un côté constant ne s'écrase jamais, un zéro (3). Suite « build » : quel côté, combien vaut l'autre, BÂTIR « ▢ = 0 ، إذن x = ▢ »
 *       (x − 3, 3 ; leurre 2 = la constante prise pour une solution). Pas de prédiction.
 *   r2  (x − 1)(x + 4) : deux zéros (1 ; −4). Prédictions : combien de fois, puis « en 0 ? » (non). Suite « rule » : quel côté, BÂTIR « ▢ = 0 ▢ ▢ = 0 »
 *       (x − 1, x + 4, tuile de texte « أو » ; leurre « معًا »), puis LA RÈGLE (après deux cas différents).
 *   r3  2x(x + 2) (règle [−3 ; 1], départ 1) : le zéro 0 vient du facteur 2x (L2.1 : plus de « −6 » restant). Prédictions « en 0 ? » (oui — la réponse
 *       BASCULE par rapport à r2) puis « où B s'annule ? » (2 / −2 / −1/2 → −2). Suite « build » : « x = ▢ أو x = ▢ » (0, −2 ; leurre 2).
 *   libre : six terrains au choix.
 * MODULE 2 (`M2_ROUNDS`, labId `lab-vanish-m2`)
 *   r1  COUVERT, REQUIS (L2.4) : (2x − 3)(x + 1), règle en demis, départ 2 ; le terrain ne se voit qu'après avoir épinglé. Une prédiction (combien de fois → 2).
 *       Suite « build » : « x = ▢ أو x = ▢ » (3/2, −1 ; leurre 2/3). 3 refus ouvrent l'entraînement non couvert (2x − 1)(x + 1).
 *   r2  (x + 1)² : le carré, un seul zéro. Prédiction « combien de fois » (1 — bascule par rapport à r1). Suite « count ».
 *   libre.
 *
 * La signature de la مسألة (côtés 3x − 12 et x + 6, 4 et −6, 792, 16 et −18, 36 / 22, 116, 4640…) n'est montrée par AUCUN écran dans son rôle :
 * content/forbidden.js (la règle) et content/mission.test.js (le balayage de `logic › shownValues`, entraînements et choix libres compris).
 */
const props = (extra) => ({ type: 'vanishing-pitch', levels: false, ...extra });

export const R1 = { expr: '2|x-3', startX: 5 };
export const R1_EASY = { expr: '2|x-1', startX: 3 };
export const R2 = { expr: 'x-1|x+4', startX: 3 };
export const R2_EASY = { expr: 'x-1|x+3', startX: 3 };
export const R3 = { expr: '2x|x+2', startX: 1, range: [-3, 1] };
export const R3_EASY = { expr: '2x|x+1', startX: 1, range: [-2, 1] };
export const C1 = { expr: '2x-3|x+1', startX: 2 };
export const C1_EASY = { expr: '2x-1|x+1', startX: 2 };
export const C2 = { expr: 'x+1', startX: 2 };
export const C2_EASY = { expr: 'x-1', startX: 3 };
export const FREE = [
  { expr: '4|x+1', startX: 2 }, { expr: 'x-3|x+2', startX: 5 }, { expr: '-x+2|x+3', startX: 0 },
  { expr: '2x+3|x-1', startX: 2 }, { expr: 'x-1', startX: 3 }, { expr: '3x-1|x+1', startX: 1 },
];

/** Les prédictions de chaque manche : des clés ; options et vérité sont calculées par le labo (`logic › predictOptions`, `predictTruth`). */
export const PREDICT = { r2: ['count', 'atZero'], r3: ['atZero', 'zeroB'], c1: ['count'], c2: ['count'] };

const easy = (extra, goal, helpLine, lead, mission) => ({
  goal, helpLine, stars: { maxTrials: 3, predict: false },
  props: props({ ...extra, chains: 'none', lead, mission }),
});

export const M1_ROUNDS = [
  { id: 'r1', title: 'ضلع لا يتغيّر', goal: [{ solvedAll: 1 }, { discovered: true }, { checkpoint: 'build' }], stars: { maxTrials: 2, predict: false },
    easier: easy(R1_EASY, [{ solvedAll: 1 }, { discovered: true }], 'جرّب أوّلًا ملعبًا أصغر، ثم عُد.', 'جولة تدريب: ملعب أصغر بضلع ثابت.', 'ثبّت القيمة التي يختفي عندها الملعب، ثم احكم: هل بقيت قيم أخرى؟'),
    helpAfterRefusals: 3,
    props: props({ ...R1, freeRefusal: true, coachPin: true, chains: 'build', lead: 'يرسم المدرّب ملعبًا على لوحته: ضلعه A طوله $2$ دائمًا، وضلعه B يتغيّر مع $x$ .', mission: 'حرّك $x$ حتى يختفي الملعب، وثبّت كل قيمة يختفي عندها. ثم احكم: هل بقيت قيم أخرى؟' }) },
  { id: 'r2', title: 'ضلعان يتغيّران', goal: [{ solvedAll: 2 }, { discovered: true }, { checkpoint: 'rule' }], stars: { maxTrials: 3 },
    easier: easy(R2_EASY, [{ solvedAll: 2 }, { discovered: true }], 'جرّب أوّلًا ملعبًا أصغر، ثم عُد.', 'جولة تدريب: ملعب أصغر بضلعين يتغيّران.', 'ثبّت كل القيم التي يختفي عندها الملعب.'),
    helpAfterRefusals: 3,
    props: props({ ...R2, chains: 'rule', predict: PREDICT.r2, lead: 'ملعب آخر: ضلعاه يتغيّران معًا مع $x$ .', mission: 'ثبّت كل القيم التي يختفي عندها الملعب.' }) },
  { id: 'r3', title: 'ضلع يحمل x', goal: [{ solvedAll: 2 }, { discovered: true }, { checkpoint: 'build' }], stars: { maxTrials: 3 },
    easier: easy(R3_EASY, [{ solvedAll: 2 }, { discovered: true }], 'جرّب أوّلًا ملعبًا أصغر، ثم عُد.', 'جولة تدريب: ضلع A يحمل $x$ .', 'ثبّت كل القيم التي يختفي عندها الملعب.'),
    helpAfterRefusals: 3,
    props: props({ ...R3, chains: 'build', predict: PREDICT.r3, lead: 'في هذا الملعب الضلع A طوله $2x$ : يتغيّر هو أيضًا.', mission: 'ثبّت كل القيم التي يختفي عندها الملعب.' }) },
  { id: 'free', free: true, title: 'اللوحة الحرّة',
    props: props({ ...FREE[0], chains: 'none', checkpoints: false, choices: FREE, lead: 'اللوحة الحرّة: اختر الملعب الذي تريد.', mission: 'حرّك $x$ وثبّت ما شئت.' }) },
];

export const M2_ROUNDS = [
  { id: 'r1', title: 'ملعب مغطّى', goal: [{ solvedAll: 2 }, { discovered: true }, { checkpoint: 'build' }], stars: { maxTrials: 3 },
    easier: easy({ ...C1_EASY, covered: false }, [{ solvedAll: 2 }, { discovered: true }], 'جرّب أوّلًا ملعبًا غير مغطّى، ثم عُد.', 'جولة تدريب: ملعب أصغر ترى ضلعيه.', 'ثبّت القيمتين اللتين يختفي عندهما الملعب.'),
    helpAfterRefusals: 3,
    props: props({ ...C1, covered: true, freeRefusal: true, coachPin: true, chains: 'build', predict: PREDICT.c1, lead: 'مسطرة هذا الملعب مدرّجة بالأنصاف. الملعب مغطّى: لا ترى ضلعيه إلا حين تثبّت.', mission: 'احسب القيمتين اللتين يختفي عندهما الملعب، ثم ثبّتهما.' }) },
  { id: 'r2', title: 'ملعب مربّع', goal: [{ solvedAll: 1 }, { discovered: true }, { checkpoint: 'count' }], stars: { maxTrials: 2 },
    easier: easy(C2_EASY, [{ solvedAll: 1 }, { discovered: true }], 'جرّب أوّلًا ملعبًا آخر، ثم عُد.', 'جولة تدريب: ملعب مربّع.', 'ثبّت كل القيم التي يختفي عندها.'),
    helpAfterRefusals: 3,
    props: props({ ...C2, chains: 'count', predict: PREDICT.c2, lead: 'ملعب مربّع: ضلعاه متساويان دائمًا.', mission: 'ثبّت كل القيم التي يختفي عندها.' }) },
  { id: 'free', free: true, title: 'اللوحة الحرّة',
    props: props({ ...FREE[4], chains: 'none', checkpoints: false, choices: FREE, lead: 'اللوحة الحرّة: اختر الملعب الذي تريد.', mission: 'حرّك $x$ وثبّت ما شئت.' }) },
];
