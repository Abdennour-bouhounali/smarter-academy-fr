/**
 * LA BALANCE DU VESTIAIRE de la leçon : le labo `equation-balance` joué en MANCHES avec étoiles dans le lecteur de mission (rollout 2026-11-11,
 * unité 4 leçon 1 ; conseil du 2026-11-11, verdict « L1 » ; nombres JOUÉS dans la logique du labo — `logic/equationBalancePlayer.js`).
 * Un ESSAI est une équation NOUVELLE écrite ou un geste REFUSÉ ; le même refus deux fois dans le même état, « noneHere » et « full » ne comptent pas ;
 * le premier refus de la manche est gratuit. La découverte du labo = un sac lu ET les sacs ouverts.
 *
 * MODULE 1 (`M1_ROUNDS`, labId `lab-balance-m1`, réserve : balles et baudruches) — trois manches REQUISES, trois façons de faire « la même chose
 * aux deux plateaux » :
 *   r1  2x + 3 = 11, À LA MAIN (un objet par dépôt) : on ôte 3 balles de chaque plateau → 2x = 8 ; partage par 2 → x = 4. Suite « r1 » : combien de
 *       l'autre côté (3 · 0 · 8) puis BÂTIR « ▢ = ▢ » (2x, 8 ; leurre 11 = l'autre plateau laissé tel quel), le poids d'un sac (4 · 8 · 2). Pas de prédiction.
 *   r2  4x + 3 = −9 (la main apprise : 1 · 2 · 3 · 4 objets d'un dépôt) : aucune balle à ôter à droite — poser des baudruches EST ôter. Prédictions : ce qu'il y a
 *       dans le sac (baudruches) puis en combien de groupes on partage (4). Suite « r2 » : ce qu'il a mis à droite, BÂTIR (4x, −12 ; leurre −6 = −9 + 3), le poids (−3 · 3 · −12).
 *   r3  3x − 2 = 10 : des baudruches AVEC les sacs, annulées en AJOUTANT des balles. Prédiction : que faire à la droite (poser des balles). Suite « r3 » : BÂTIR
 *       (3x, 12 ; leurre 8 = 10 − 2), puis LA RÈGLE, après trois cas différents (ôter, poser des baudruches, ajouter).
 *   ⭐  2x − 1 = −9 : en deux étapes (deux essais au plus).
 *   libre : x + 5 = 9, 3x + 1 = 10, 4x − 3 = 9, 2x + 5 = −3, 2x + 4 = 10 (le seul qui se partage D'ABORD : x + 2 = 5).
 *   Entraînement (« لا بأس — جرّب أصغر », après 3 refus ou 2 réponses ratées) : r1 → x + 2 = 5 ; r2 → 2x + 1 = −3 ; r3 → x − 1 = 2.
 * MODULE 2 (`M2_ROUNDS`, labId `lab-balance-m2`, réserve : balles, baudruches, sacs) :
 *   r1  4x + 3 = 6x (les sacs dans LES DEUX plateaux ; le sac ne contient pas un nombre entier de balles) : on ôte 4 sacs de chaque plateau → 3 = 2x ; partage par 2 →
 *       3/2 = x. Prédictions : les sacs qui restent (2) puis « des balles entières ? » (non). Suite « m2r1 » : BÂTIR (3, 2x ; leurre 10x = 4x + 6x), le poids (3/2 · 2/3 · 3).
 *   r2  4x + 1 = x + 8 : 3x + 1 = 8 → 3x = 7 → 7/3. Prédiction : les sacs qui restent (3). Suite « m2r2 » : BÂTIR (3x, 7 ; leurre 9 = 8 + 1), LA RÈGLE ax = b → b/a.
 *   ⭐  3x − 1 = x + 7 : des baudruches avec les sacs des deux plateaux.
 *   libre : 5x = 3x + 4, x + 8 = 3x, x − 3 = 3x + 5, 3x + 7 = x.
 *   Entraînement : r1 → x + 2 = 2x ; r2 → 3x + 1 = x + 5.
 *
 * La signature de la مسألة (7x − 4 = 2x + 26, x = 6, 5x + 2 = 2x − 13, x = −5, 70200 دج…) n'est montrée par AUCUN écran dans son rôle : content/forbidden.js
 * (la règle) et content/balances.test.js (le balayage de `logic › shownValues` de chaque manche, entraînement et choix libres compris).
 */
const props = (extra) => ({ type: 'equation-balance', levels: false, ...extra });
const M1 = { kinds: ['ball', 'balloon'] };
const M2 = { kinds: ['ball', 'balloon', 'bag'], handDone: true };

export const EQ = {
  r1: '2x+3=11', r1Easy: 'x+2=5',
  r2: '4x+3=-9', r2Easy: '2x+1=-3',
  r3: '3x-2=10', r3Easy: 'x-1=2',
  star1: '2x-1=-9',
  m2r1: '4x+3=6x', m2r1Easy: 'x+2=2x',
  m2r2: '4x+1=x+8', m2r2Easy: '3x+1=x+5',
  star2: '3x-1=x+7',
};
export const FREE1 = ['x+5=9', '3x+1=10', '4x-3=9', '2x+5=-3', '2x+4=10'];
export const FREE2 = ['5x=3x+4', 'x+8=3x', 'x-3=3x+5', '3x+7=x'];

/** Les prédictions de chaque manche : des clés ; options et vérité calculées par la logique (`predictOptions`, `predictTruth`). */
export const PREDICT = {
  r2: ['bagHolds', 'parts'],
  r3: ['otherPanDo'],
  m2r1: ['bagsLeft', 'whole'],
  m2r2: ['bagsLeft'],
};

const easy = (eq, chains, lead, mission, extra = {}) => ({
  goal: [{ discovered: true }], helpLine: 'جرّب أوّلًا ميزانًا أصغر، ثم عُد.', stars: { maxTrials: 3, predict: false },
  props: props({ eq, chains: 'none', lead, mission, ...extra }),
});

export const M1_ROUNDS = [
  { id: 'r1', title: 'كيس واحد، كم كرة؟', goal: [{ discovered: true }, { checkpoint: 'line' }, { checkpoint: 'read' }], stars: { maxTrials: 3, predict: false },
    helpAfterRefusals: 3,
    easier: easy(EQ.r1Easy, 'none', 'ميزان أصغر: كيس واحد وكرتان في كفّة، و 5 كرات في الأخرى.', 'أبقِ الميزان متوازنًا حتى يبقى الكيس وحده: كم كرة فيه؟', M1),
    props: props({ ...M1, eq: EQ.r1, chains: 'r1', lead: 'في غرفة ملابس الفريق ميزان متوازن: في كفّة كيسان مغلقان وثلاث كرات، وفي الأخرى 11 كرة. في الكيسين العدد نفسه من الكرات.', mission: 'أبقِ الميزان متوازنًا حتى يبقى كيس واحد وحده في كفّة: كم كرة فيه؟' }) },
  { id: 'r2', title: 'لا كرة لتأخذها', goal: [{ discovered: true }, { checkpoint: 'line' }, { checkpoint: 'read' }], stars: { maxTrials: 3 },
    helpAfterRefusals: 3,
    easier: easy(EQ.r2Easy, 'none', 'ميزان أصغر: كيسان وكرة في كفّة، و 3 بالونات في الأخرى.', 'أبقِ الميزان متوازنًا حتى يبقى الكيس وحده: ماذا فيه؟', { ...M1, handDone: true }),
    props: props({ ...M1, handDone: true, eq: EQ.r2, chains: 'r2', predict: PREDICT.r2, lead: 'في الكفّة اليسرى أربعة أكياس وثلاث كرات، وفي اليمنى 9 بالونات. كل بالون يشدّ الكفّة إلى الأعلى.', mission: 'أبقِ الميزان متوازنًا حتى يبقى كيس واحد وحده: ماذا فيه؟' }) },
  { id: 'r3', title: 'بالونات مع الأكياس', goal: [{ discovered: true }, { checkpoint: 'line' }, { checkpoint: 'rule' }], stars: { maxTrials: 3 },
    helpAfterRefusals: 3,
    easier: easy(EQ.r3Easy, 'none', 'ميزان أصغر: كيس وبالون في كفّة، وكرتان في الأخرى.', 'أبقِ الميزان متوازنًا حتى يبقى الكيس وحده: كم كرة فيه؟', { ...M1, handDone: true }),
    props: props({ ...M1, handDone: true, eq: EQ.r3, chains: 'r3', predict: PREDICT.r3, lead: 'في الكفّة اليسرى ثلاثة أكياس وبالونان، وفي اليمنى 10 كرات.', mission: 'أبقِ الميزان متوازنًا حتى يبقى كيس واحد وحده: كم كرة فيه؟' }) },
  { id: 'challenge', optional: true, title: 'تحدٍّ: في خطوتين', goal: [{ discovered: true }], stars: { maxTrials: 2, predict: false },
    props: props({ ...M1, handDone: true, eq: EQ.star1, chains: 'none', lead: 'تحدٍّ: كيسان وبالون في كفّة، و 9 بالونات في الأخرى.', mission: 'اعرف ما في الكيس الواحد في أقلّ عدد من الخطوات.' }) },
  { id: 'free', free: true, title: 'الميزان الحرّ',
    props: props({ ...M1, handDone: true, eq: FREE1[0], chains: 'none', checkpoints: false, choices: FREE1, lead: 'الميزان الحرّ: اختر الميزان الذي تريد.', mission: 'أبقِ الميزان متوازنًا حتى يبقى كيس وحده في كفّة.' }) },
];

export const M2_ROUNDS = [
  { id: 'r1', title: 'ميزان نسيم: أكياس في الكفّتين', goal: [{ discovered: true }, { checkpoint: 'line' }, { checkpoint: 'read' }], stars: { maxTrials: 3 },
    helpAfterRefusals: 3,
    easier: easy(EQ.m2r1Easy, 'none', 'ميزان أصغر: كيس وكرتان في كفّة، وكيسان في الأخرى.', 'أبقِ الميزان متوازنًا حتى يبقى الكيس وحده: كم كرة فيه؟', M2),
    props: props({ ...M2, eq: EQ.m2r1, chains: 'm2r1', predict: PREDICT.m2r1, lead: 'نسيم وضع في الكفّة اليسرى أربعة أكياس وثلاث كرات، وفي اليمنى ستّة أكياس. الأكياس كلها متماثلة.', mission: 'أبقِ الميزان متوازنًا حتى يبقى كيس واحد وحده: كم كرة فيه؟' }) },
  { id: 'r2', title: 'أكياس وكرات في الكفّتين', goal: [{ discovered: true }, { checkpoint: 'line' }, { checkpoint: 'rule' }], stars: { maxTrials: 4 },
    helpAfterRefusals: 3,
    easier: easy(EQ.m2r2Easy, 'none', 'ميزان أصغر: ثلاثة أكياس وكرة في كفّة، وكيس و 5 كرات في الأخرى.', 'أبقِ الميزان متوازنًا حتى يبقى الكيس وحده: كم كرة فيه؟', M2),
    props: props({ ...M2, eq: EQ.m2r2, chains: 'm2r2', predict: PREDICT.m2r2, lead: 'في الكفّة اليسرى أربعة أكياس وكرة، وفي اليمنى كيس و 8 كرات.', mission: 'أبقِ الميزان متوازنًا حتى يبقى كيس واحد وحده: كم كرة فيه؟' }) },
  { id: 'challenge', optional: true, title: 'تحدٍّ: بالونات وأكياس في الكفّتين', goal: [{ discovered: true }], stars: { maxTrials: 3, predict: false },
    props: props({ ...M2, eq: EQ.star2, chains: 'none', lead: 'تحدٍّ: ثلاثة أكياس وبالون في كفّة، وكيس و 7 كرات في الأخرى.', mission: 'اعرف ما في الكيس الواحد في أقلّ عدد من الخطوات.' }) },
  { id: 'free', free: true, title: 'الميزان الحرّ',
    props: props({ ...M2, eq: FREE2[0], chains: 'none', checkpoints: false, choices: FREE2, lead: 'الميزان الحرّ: اختر الميزان الذي تريد.', mission: 'أبقِ الميزان متوازنًا حتى يبقى كيس وحده في كفّة.' }) },
];
