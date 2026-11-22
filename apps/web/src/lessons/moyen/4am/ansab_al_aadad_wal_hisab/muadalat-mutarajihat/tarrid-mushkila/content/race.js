/**
 * LA COURSE de la leçon : le labo `growth-race` joué en MANCHES avec étoiles dans le lecteur de mission (rollout 2026-11-11, unité 4 leçon 4 ;
 * conseil du 2026-11-11, verdict L4.1–L4.9). Un ESSAI est un x NOUVEAU lâché sur la règle ; une vérification de MODÈLE (« تحقّق » sur un nouveau
 * jeu de cartes) est un événement à part (`roundsModel › tk: 'model'`, but `modelOk`). Toutes les manches partent de x = 0, explicitement.
 *
 *   r1  « أربعة أبناء » : 52 ; 7 · 8 · 10 · 12 → 52 + x = 4x + 37, x = 5 (57 = 12 + 13 + 15 + 17). Quatre cartes (jamais trois : la مسألة).
 *   r2  « أربعة أضعاف » : 26 et 2 → 26 + x = 4x + 8, x = 6 ; prédictions : cartes (2), qui devant au bout (le multiple).
 *   r3  REQUISE « عدد لا يكبر » : deux sœurs 13 et 10, cible 31 → 2x + 23 = 31, x = 4 ; la cible ne prend pas de carte.
 *   ⭐   55 ; 11 · 12 : 55 + x = 2(23 + 2x) → x = 3.
 *   Module 2 r1 (REQUISE) : deux frères 11 et 13, cible 18 → 2x + 24 = 18, x = −3 : « منذ 3 سنوات » (8 + 10 = 18). La rencontre n'est jamais sur la règle.
 *   Entraînements (« لا بأس — جرّب أصغر ») : 35 ; 15 · 17 (x = 3) · 55 et 26 (x = 3) · 8 et 10, cible 24 (x = 3) · 12 et 15, cible 25 (x = −1).
 * Les nombres de la مسألة (voir content/forbidden.js) ne sont montrés par AUCUN écran : content/race.test.js (le balayage de `shownValues`).
 */
const props = (extra) => ({ type: 'growth-race', theme: 'ages', goal: 'equal', startX: 0, decor: 'board', levels: false, ...extra });

export const R1 = { left: '52+x', right: '7+x+8+x+10+x+12+x', maxX: 9 };
export const R1_EASY = { left: '35+x', right: '15+x+17+x', maxX: 5 };
export const R2 = { left: '26+x', right: '4(2+x)', maxX: 8 };
export const R2_EASY = { left: '55+x', right: '2(26+x)', maxX: 7 };
export const R3 = { left: '13+x+10+x', right: '31', maxX: 8 };
export const R3_EASY = { left: '8+x+10+x', right: '24', maxX: 7 };
export const CHALLENGE = { left: '55+x', right: '2(11+x+12+x)', maxX: 7 };
export const P1 = { left: '11+x+13+x', right: '18', maxX: 8 };
export const P1_EASY = { left: '12+x+15+x', right: '25', maxX: 6 };
/** La ورشة libre : les cinq courses de la leçon et une course qui ne se rejoint jamais. */
export const FREE = [
  `${R1.left}|${R1.right}|${R1.maxX}`, `${R2.left}|${R2.right}|${R2.maxX}`, `${R3.left}|${R3.right}|${R3.maxX}`,
  `${CHALLENGE.left}|${CHALLENGE.right}|${CHALLENGE.maxX}`, `${P1.left}|${P1.right}|${P1.maxX}`, '7+x|11+x|12',
];

/** Les noms et le genre des personnes (le dessin les lit : une fille est en hijab). */
export const CAST = {
  father: { names: { L0: 'الأب', R0: 'الابن الأول', R1: 'الابن الثاني' }, adults: ['L0'] },
  r1: { adults: ['L0'], names: { L0: 'الأب', R0: 'الابن الأول', R1: 'الابن الثاني', R2: 'الابن الثالث', R3: 'الابن الرابع' } },
  r2: { adults: ['L0'], names: { L0: 'الأب', R0: 'الابن' } },
  r3: { names: { L0: 'الأخت الكبرى', L1: 'الأخت الصغرى', R0: 'العدد المطلوب' }, girls: ['L0', 'L1'] },
  p1: { names: { L0: 'الأخ الأكبر', L1: 'الأخ الأصغر', R0: 'العدد المطلوب' } },
};

/** Les prédictions : leur NATURE ; la réponse est calculée par le labo. */
export const PREDICT = {
  r2: [{ key: 'r2-cards', kind: 'cards', pos: 0 }, { key: 'r2-ahead', kind: 'ahead', pos: 1 }],
  r3: [{ key: 'r3-cards', kind: 'cards', pos: 2 }],
  p1: [{ key: 'p1-meets', kind: 'meets', pos: 1 }],
};

/** Le casting d'une manche : `cast` (qui est un adulte, qui est une fille) et `context` (les mots de l'histoire dans le labo). */
const who = (c, titles = {}) => ({ cast: { adults: c.adults ?? [], girls: c.girls ?? [] }, context: { names: c.names, ...titles } });
const TWO_SISTERS = { leftTitle: 'مجموع عمري الأختين', rightTitle: 'العدد المطلوب' };
const TWO_BROTHERS = { leftTitle: 'مجموع عمري الأخوين', rightTitle: 'العدد المطلوب' };

const help = 'جرّب أوّلًا سباقًا أصغر، ثم عُد.';
const free = {
  id: 'free', free: true, title: 'سباقات حرّة',
  props: props({ ...R1, chains: 'none', checkpoints: false, choices: FREE, lead: 'سباقات حرّة: اختر أسرة.', mission: 'ضع البطاقات وتحقّق، ثم مدّد x كما تشاء.' }),
};

export const M1_ROUNDS = [
  { id: 'r1', title: 'أربعة أبناء', goal: [{ modelOk: true }, { checkpoint: 'build' }, { discovered: true }, { checkpoint: 'race' }], stars: { maxTrials: 5, predict: false },
    helpAfterRefusals: 4,
    easier: { goal: [{ modelOk: true }, { checkpoint: 'build' }, { discovered: true }], helpLine: help, releases: true, stars: { maxTrials: 5, predict: false },
      props: props({ ...R1_EASY, chains: 'easy', ...who(CAST.father), lead: 'أب عمره $35$ سنة وابناه $15$ و $17$ سنة.', mission: 'بعد كم سنة يصير عمر الأب مساويًا مجموع عمريهما؟ ضع «+ x» على كل من يكبر.' }) },
    props: props({ ...R1, chains: 'sum4', freeFirstModel: true, ...who(CAST.r1), lead: 'أب عمره $52$ سنة، وأعمار أبنائه الأربعة $7$ و $8$ و $10$ و $12$ سنة.', mission: 'بعد كم سنة يصير عمر الأب مساويًا مجموع أعمارهم؟ ضع «+ x» على كل من يكبر.' }) },
  { id: 'r2', title: 'أربعة أضعاف', goal: [{ modelOk: true }, { checkpoint: 'build' }, { discovered: true }, { checkpoint: 'race' }], stars: { maxTrials: 5 },
    helpAfterRefusals: 4,
    easier: { goal: [{ modelOk: true }, { checkpoint: 'build' }, { discovered: true }], helpLine: help, releases: true, stars: { maxTrials: 5, predict: false },
      props: props({ ...R2_EASY, chains: 'easy', ...who({ adults: ['L0'], names: { L0: 'الأب', R0: 'الابن' } }), lead: 'أب عمره $55$ سنة وابنه $26$ سنة.', mission: 'متى يصير عمر الأب ضعف عمر ابنه؟' }) },
    props: props({ ...R2, chains: 'mult', predict: PREDICT.r2, ...who(CAST.r2, { rightTitle: 'أربعة أضعاف عمر الابن' }), lead: 'أب عمره $26$ سنة وابنه عمره سنتان.', mission: 'بعد كم سنة يصير عمر الأب أربعة أضعاف عمر ابنه؟' }) },
  { id: 'r3', title: 'عدد لا يكبر', goal: [{ modelOk: true }, { checkpoint: 'build' }, { discovered: true }, { checkpoint: 'race' }], stars: { maxTrials: 5 },
    helpAfterRefusals: 4,
    easier: { goal: [{ modelOk: true }, { checkpoint: 'build' }, { discovered: true }], helpLine: help, releases: true, stars: { maxTrials: 5, predict: false },
      props: props({ ...R3_EASY, chains: 'easy', ...who(CAST.r3, TWO_SISTERS), lead: 'أختان عمراهما $8$ و $10$ سنوات.', mission: 'بعد كم سنة يصير مجموع عمريهما $24$ ؟' }) },
    props: props({ ...R3, chains: 'sum2', predict: PREDICT.r3, ...who(CAST.r3, TWO_SISTERS), lead: 'أختان عمراهما $13$ و $10$ سنوات.', mission: 'بعد كم سنة يصير مجموع عمريهما $31$ سنة؟' }) },
  { id: 'challenge', optional: true, title: 'تحدٍّ: ضعف المجموع', goal: [{ modelOk: true }, { discovered: true }], stars: { maxTrials: 3, predict: false },
    props: props({ ...CHALLENGE, chains: 'none', lead: 'أب عمره $55$ سنة وولداه $11$ و $12$ سنة.', mission: 'متى يصير عمره ضعف مجموع عمريهما؟ في ثلاث محاولات على الأكثر.' }) },
  free,
];

/** Module 2 : سباق بلا لقاء (REQUISE), puis la ورشة libre. */
export const M2_ROUNDS = [
  { id: 'p1', title: 'سباق بلا لقاء', goal: [{ modelOk: true }, { discovered: true }, { checkpoint: 'race' }], stars: { maxTrials: 4 },
    helpAfterRefusals: 3,
    easier: { goal: [{ modelOk: true }, { discovered: true }], helpLine: help, releases: true, stars: { maxTrials: 4, predict: false },
      props: props({ ...P1_EASY, chains: 'none', ...who(CAST.p1, TWO_BROTHERS), lead: 'أخوان عمراهما $12$ و $15$ سنة.', mission: 'متى يصير مجموع عمريهما $25$ ؟' }) },
    props: props({ ...P1, chains: 'past', predict: PREDICT.p1, freeFirstModel: true, ...who(CAST.p1, TWO_BROTHERS), lead: 'أخوان عمراهما $11$ و $13$ سنة.', mission: 'بعد كم سنة يصير مجموع عمريهما $18$ ؟' }) },
  free,
];
