/**
 * MODULE 7 « وضعية الوحدة » DANS LE LECTEUR DE MISSION (la synthèse de l'unité 4, 2026-11-12 — recette PROVISOIRE de la synthèse, point 5) :
 * UN `LabRounds` sur le labo de l'unité `growth-race` (la course de deux grandeurs), joué sur deux TARIFS — « ax » contre « f + bx », le
 * phénomène du défi 🏆 (un prix par séance contre un abonnement et un petit prix) — sur des nombres FRÈRES, jamais les siens ni sa solution
 * (content/forbidden.js, recalculé et balayé par content/mission.test.js).
 *
 *   r1 « قاعة الرياضة » 60x contre 300 + 10x (égalité à 6 séances, 360 دج ; meilleure à partir de 7) : l'élève porte « × x » sur chaque ticket
 *      (jamais sur l'abonnement), BÂTIT l'inéquation « 300 + 10x < 60x » (leurre 300x : l'abonnement payé à chaque séance), étire x, puis
 *      « où le prix s'égale » (6) et « à partir de quand la 2 est meilleure » (7 — le piège : 6, l'égalité). Entraînement : 30x contre 60 + 10x.
 *   r2 « نادي الرماية » 45x contre 150 + 15x (égalité à 5, 225 دج ; meilleure à partir de 6) : prédiction « au bout de la règle, laquelle est
 *      plus chère ? », étire x, la première séance meilleure (6), puis la construction NUMÉRIQUE « 30 × 5 = 150 » : ce qu'une séance économise
 *      (45 − 15) rembourse l'abonnement à l'égalité (leurre 45 : le prix pris pour l'économie). Entraînement : 40x contre 100 + 15x.
 *   free : le guichet libre (les deux tarifs des manches et celui de la carte, 50x contre 200 + 10x).
 * Les manches d'entraînement LIBÈRENT leur manche (`easier.releases`) : un élève bloqué ne l'est ni des étapes au crayon ni du défi 🏆.
 * Aucun tarif n'est celui du défi (75 / 560 + 5), ni du défi de la page d'unité (90 / 700 + 20), ni d'une leçon de l'unité (règle des
 * collisions, content/mission.test.js).
 */
export const R1 = { left: '60x', right: '300+10x', maxX: 9 };
export const R1_EASY = { left: '30x', right: '60+10x', maxX: 6 };
export const R2 = { left: '45x', right: '150+15x', maxX: 8 };
export const R2_EASY = { left: '40x', right: '100+15x', maxX: 7 };
export const CARD = { left: '50x', right: '200+10x', maxX: 8 };
/** La ورشة libre : les deux tarifs des manches et l'exemple de la carte. */
export const FREE = [R1, R2, CARD].map((p) => `${p.left}|${p.right}|${p.maxX}`);

const TITLES = { leftTitle: 'الصيغة الأولى', rightTitle: 'الصيغة الثانية' };
const props = (extra) => ({ type: 'growth-race', theme: 'pool', goal: 'greater', domain: 'natural', startX: 0, levels: false, context: TITLES, ...extra });
const help = 'جرّب أوّلًا عرضًا أصغر، ثم عُد.';

/** Les props de la PAGE (l'enseignant, le mode classe) : les mêmes tarifs, deux niveaux d'un ManipulationWorkspace (lab.render.test.jsx). */
export const LAB = {
  beginner: { ...R1, theme: 'pool', domain: 'natural', goal: 'greater', context: TITLES },
  advanced: { ...R2, theme: 'pool', domain: 'natural', goal: 'greater', context: TITLES },
};
export const LEAD = {
  r1: 'قاعة الرياضة: الأولى $60$ دج للحصّة؛ الثانية اشتراك $300$ دج مرّة واحدة، ثم $10$ دج للحصّة.',
  r2: 'نادي الرماية: الأولى $45$ دج للحصّة؛ الثانية اشتراك $150$ دج مرّة واحدة، ثم $15$ دج للحصّة.',
};

export const M7_ROUNDS = [
  {
    id: 'r1', title: 'قاعة الرياضة', goal: [{ modelOk: true }, { checkpoint: 'build' }, { discovered: true }, { checkpoint: 'race' }],
    stars: { maxTrials: 5, predict: false }, helpAfterRefusals: 3,
    easier: {
      goal: [{ modelOk: true }, { checkpoint: 'race' }], helpLine: help, releases: true, stars: { maxTrials: 5, predict: false },
      props: props({ ...R1_EASY, chains: 'poolEasy', lead: 'جولة تدريب: $30$ دج لكل حصّة، أو اشتراك $60$ دج ثم $10$ دج لكل حصّة.', mission: 'ضع البطاقة «× x» على كل مبلغ يُدفع في كل حصّة، ثم مدّد x.' }),
    },
    props: props({ ...R1, chains: 'pool', freeFirstModel: true, lead: LEAD.r1, mission: 'ضع البطاقة «× x» على كل مبلغ يُدفع في كل حصّة، ثم ابحث: ابتداءً من كم حصّة تصبح الصيغة الثانية أفضل؟' }),
  },
  {
    id: 'r2', title: 'نادي الرماية', goal: [{ modelOk: true }, { discovered: true }, { checkpoint: 'race' }],
    stars: { maxTrials: 5 }, helpAfterRefusals: 3,
    easier: {
      goal: [{ modelOk: true }, { checkpoint: 'race' }], helpLine: help, releases: true, stars: { maxTrials: 5, predict: false },
      props: props({ ...R2_EASY, chains: 'poolSavingEasy', lead: 'جولة تدريب: $40$ دج لكل حصّة، أو اشتراك $100$ دج ثم $15$ دج لكل حصّة.', mission: 'ابنِ النموذج، ثم مدّد x حتى يتساوى الثمنان.' }),
    },
    props: props({ ...R2, chains: 'poolSaving', predict: [{ key: 'r2-ahead', kind: 'ahead', pos: 1 }], lead: LEAD.r2, mission: 'ابنِ النموذج، ثم مدّد x: متى يسترجع من اختار الصيغة الثانية ثمن اشتراكه؟' }),
  },
  {
    id: 'free', free: true, title: 'الشبّاك الحرّ',
    props: props({ ...R1, chains: 'none', checkpoints: false, choices: FREE, lead: 'الشبّاك الحرّ: اختر عرضًا.', mission: 'ضع البطاقات وتحقّق، ثم مدّد x كما تشاء.' }),
  },
];
