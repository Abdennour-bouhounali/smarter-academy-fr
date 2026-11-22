/**
 * LES CARTES-DEVINETTES de la leçon : le labo `elimination-cards` joué en MANCHES avec étoiles dans le lecteur de mission (rollout 2026-11-12, unité 5
 * leçon 2 ; conseil du 2026-11-11, verdict « L2 » et X11 ; nombres JOUÉS dans la logique du labo — `logic/eliminationCardsPlayer.js`).
 * Chaque manche est une devinette d'une élève de la distribution (X1) : « أخفت إكرام عددين وكتبت عنهما بطاقتين » (r1, r3 : إكرام ; r2 : إسحاق). Aucun
 * kiosque, aucun prix, aucun « دج » dans une manche (verdict L2.2 : le kiosque appartient à la مسألة) ; les cartes sont posées sur une simple table.
 * Un ESSAI est un geste qui écrit une ligne NOUVELLE ou un refus compté ; le premier refus compté de la manche est gratuit.
 *
 * MODULE 1 (`M1_ROUNDS`, labId `lab-cards-m1`) :
 *   r1  x + y = 8 | x − y = 2 → (5 ; 3), UNE méthode au choix (verdict L2.9 : la méthode n'est pas dite). Suite « r1 » : observer (`see`) puis BÂTIR
 *       l'équation à une inconnue (leurre selon le chemin : 2y = 10, 2x = 6 ou 2x = −6), puis la ثنائية. Pas de prédiction.
 *   r2  2x + y = 11 | 3x − y = 4 → (3 ; 5), les DEUX méthodes sur les mêmes cartes. Prédictions : quel mot disparaît si l'on pose les cartes telles
 *       quelles (y), puis « l'autre méthode donnera-t-elle la même ثنائية ? » (نعم). Suite « r2 » : BÂTIR une fois par méthode, la ثنائية, LA RÈGLE
 *       (après deux jumal différentes).
 *   r3  2x + 3y = 14 | x − y = 2 → (4 ; 2), requise, les deux méthodes : posées telles quelles, rien ne s'annule ; il faut multiplier. Prédiction : le
 *       multiplicateur de la carte (2) (3). Suite « r3 » : BÂTIR (le paquet sans parenthèses : 5y = 12, ou un seul membre multiplié : 5x = 16), la
 *       ثنائية, LE CHOIX de la méthode sur ces cartes.
 *   ⭐  4x + 3y = 5 | 3x − 2y = 8 → (2 ; −1) : les deux cartes à multiplier, une méthode.
 *   libre : x + y = 11 | x − y = 3 · x + 3y = 10 | x + y = 4 · 2x + y = 9 | x − y = 6 · 5x + 2y = 16 | 3x + 4y = 18 · 2x + 3y = 3 | 4x − 3y = 3.
 *   Entraînement (« لا بأس — جرّب أصغر ») : r1 → x + y = 4 | x − y = 2 ; r2 → x + y = 5 | 2x − y = 7 ; r3 → x + 2y = 4 | x − y = 1 — une méthode, sans
 *   question, et gagné il LIBÈRE la manche (1 ★).
 * Règle P (X11 › P2) : chaque manche requise et chaque entraînement ont un « chemin plus » (une inconnue isolée en entiers portée sur un coefficient
 * POSITIF) — content/cards.test.js le JOUE. La signature de la مسألة (3x + y = 115, 4x − 3y = 45, 13x = 390, (30 ; 25)…) n'est montrée par AUCUN écran
 * dans son rôle : content/forbidden.js et le balayage de `logic › shownValues` de chaque manche, entraînement et choix libres compris.
 */
const props = (extra) => ({ type: 'elimination-cards', levels: false, ...extra });

export const SYS = {
  r1: 'x+y=8|x-y=2', r1Easy: 'x+y=4|x-y=2',
  r2: '2x+y=11|3x-y=4', r2Easy: 'x+y=5|2x-y=7',
  r3: '2x+3y=14|x-y=2', r3Easy: 'x+2y=4|x-y=1',
  star: '4x+3y=5|3x-2y=8',
};
export const FREE = ['x+y=11|x-y=3', 'x+3y=10|x+y=4', '2x+y=9|x-y=6', '5x+2y=16|3x+4y=18', '2x+3y=3|4x-3y=3'];

/** Les prédictions de chaque manche : des clés ; options et vérité calculées par la logique (`predictOptions`, `predictTruth`). */
export const PREDICT = { r2: ['vanish', 'samePair'], r3: ['multiplier'] };

const MISSION_ONE = 'جد العددين اللذين يجعلان البطاقتين صحيحتين معًا.';
const MISSION_TWO = 'جد العددين اللذين يجعلان البطاقتين صحيحتين معًا، ثم جدهما من جديد بطريقة أخرى.';

const easy = (system, lead) => ({
  goal: [{ discovered: true }], releases: true, helpLine: 'جرّب أوّلًا بطاقتين أصغر، ثم عُد.', stars: { maxTrials: 3, predict: false },
  props: props({ system, methods: 1, chains: 'none', lead, mission: MISSION_ONE }),
});

export const M1_ROUNDS = [
  { id: 'r1', title: 'مجهول يختفي', goal: [{ discovered: true }, { checkpoint: 'build' }, { checkpoint: 'pair' }], stars: { maxTrials: 3, predict: false },
    helpAfterRefusals: 3,
    easier: easy(SYS.r1Easy, 'بطاقتان أصغر: مجموع العددين 4، وفرقهما 2.'),
    props: props({ system: SYS.r1, methods: 1, chains: 'r1', lead: 'أخفت إكرام عددين وكتبت عنهما بطاقتين: مجموعهما 8، وفرقهما 2.', mission: MISSION_ONE }) },
  { id: 'r2', title: 'طريقان، البطاقتان نفساهما', goal: [{ discovered: true }, { checkpoint: 'build-sub' }, { checkpoint: 'build-add' }, { checkpoint: 'pair' }, { checkpoint: 'rule' }],
    stars: { maxTrials: 5 }, helpAfterRefusals: 3,
    easier: easy(SYS.r2Easy, 'بطاقتان أصغر عن عددين: مجموعهما 5 على الأولى.'),
    props: props({ system: SYS.r2, methods: 2, chains: 'r2', predict: PREDICT.r2, lead: 'أخفى إسحاق عددين وكتب عنهما بطاقتين.', mission: MISSION_TWO }) },
  { id: 'r3', title: 'بطاقة عنيدة', goal: [{ discovered: true }, { checkpoint: 'build-sub' }, { checkpoint: 'build-add' }, { checkpoint: 'pair' }, { checkpoint: 'choose' }],
    stars: { maxTrials: 5 }, helpAfterRefusals: 3,
    easier: easy(SYS.r3Easy, 'بطاقتان أصغر: على الثانية فرق العددين 1.'),
    props: props({ system: SYS.r3, methods: 2, chains: 'r3', predict: PREDICT.r3, lead: 'أخفت إكرام عددين آخرين وكتبت عنهما بطاقتين.', mission: MISSION_TWO }) },
  { id: 'challenge', optional: true, title: 'تحدٍّ: بطاقتان عنيدتان', goal: [{ discovered: true }], stars: { maxTrials: 3, predict: false },
    props: props({ system: SYS.star, methods: 1, chains: 'none', lead: 'تحدٍّ: بطاقتان لا يختفي فيهما أيّ مجهول بسهولة.', mission: MISSION_ONE }) },
  { id: 'free', free: true, title: 'البطاقات الحرّة',
    props: props({ system: FREE[0], methods: 1, chains: 'none', checkpoints: false, choices: FREE, lead: 'البطاقات الحرّة: اختر البطاقتين اللتين تريد.', mission: MISSION_ONE }) },
];
