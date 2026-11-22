/**
 * LE TERRAIN pour toute la leçon (propriétaire, 2026-11-04 : « le labo du football pour le reste de la leçon, pas celui de la
 * bibliothèque »). Un seul laboratoire, `team-builder` : l'élève FIXE le nombre d'équipes, le reste se voit debout.
 *
 *   ACTIVITY (module 1, متقدم) : l'entraîneur hésite entre 5 et 6 équipes pour 42 joueurs —
 *     42 = 6 × 7 + 0 (personne dehors) ; 42 = 5 × 8 + 2 (deux joueurs dehors). Même contraste que le نشاط 1 du manuel
 *     (420 livres, 26 ou 28 par rayon — conservé dans content/textbook.js comme source), dans le contexte de la plateforme.
 *   EXAMPLE (module 2) : 48 joueurs, 6 équipes PUIS 8 — tous deux vident le banc : 48 = 6 × 8 = 8 × 6, le quotient est
 *     lui aussi un قاسم (la découverte du « par le produit »).
 *
 * Les égalités se CALCULENT à partir de ces nombres (euclid), elles ne sont pas recopiées à la main.
 */
export const TEAMS_ACTIVITY = { total: 42, candidates: [5, 6], choices: [4, 5, 6, 7] };
export const TEAMS_EXAMPLE = { total: 48, groups: [6, 8], choices: [5, 6, 7, 8] };

export const euclid = (a, b) => ({ q: Math.floor(a / b), r: a % b });
export const eqTex = (a, b) => { const { q, r } = euclid(a, b); return `${a} = ${b} \\times ${q} + ${r}`; };

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const divisorsBetween = (n, a, b) => range(a, b).filter((k) => n % k === 0);

/**
 * LA SECONDE CHANCE (conseil + propriétaire, 2026-11-08) : une manche d'ENTRAÎNEMENT plus petite, proposée par
 * « لا بأس — جرّب أصغر » seulement quand l'élève peine (roundsModel.needsHelp). Même geste, même question, des nombres qu'on
 * voit d'un coup d'œil : quelqu'un reste dehors, puis un autre nombre de فرق ne laisse personne. Sans questions ni étoiles.
 */
const practice = (total, groups, teamChoices, exact, lead) => ({
  goal: [{ inexact: true }, { exact }],
  props: { type: 'team-builder', handDone: true, total, groups, teamChoices, squadChoices: [total], checkpoints: false, lead },
});

/**
 * LES MANCHES (« الجولات » + étoiles, propriétaire 2026-11-04) — jouées dans le lecteur de mission au lieu de مبتدئ / متقدم
 * (lessons/common/manipulations/rounds). Module 1 : 15 → 16 → 42 (5 ou 6 ?) → défi ⭐ (TOUS les nombres d'équipes justes pour 42)
 * → terrain libre. Module 2 : 48 en 6 équipes, puis en 8 → terrain libre.
 * SEULE la manche 1 (15 joueurs) se partage à la main : elle est courte et c'est elle qui fait comprendre « à parts égales » ;
 * ensuite `handDone` ouvre « أنشئ الفرق » d'emblée — personne ne porte 42 ou 48 joueurs un par un (propriétaire, 2026-11-04).
 */
export const M1_ROUNDS = [
  { id: 'r1', title: '15 لاعبًا في 3 فرق', goal: [{ checkpoint: 'first' }], stars: { maxTrials: 1 },
    props: { type: 'team-builder', total: 15, groups: 3, teamChoices: [3], squadChoices: [15],
      lead: 'جمع مدرّب الحيّ 15 لاعبًا ويريدهم في 3 فرق متساوية. وزّعهم.' } },
  { id: 'r2', title: 'اللاعب السادس عشر', goal: [{ checkpoint: 'contrast' }], stars: { maxTrials: 3 },
    easier: practice(8, 3, [3, 4], 4, 'جولة تدريب: 8 لاعبين فقط. وزّعهم في 3 فرق: هل يبقى أحد خارج الفرق؟ ثم جرّب 4 فرق.'),
    props: { type: 'team-builder', handDone: true, total: 16, groups: 3, teamChoices: [3, 4], squadChoices: [16],
      lead: 'وصل لاعب آخر: صاروا 16. وزّعهم في 3 فرق: أين يلعب اللاعب الأخير؟ ثم جرّب عددًا آخر من الفرق لا يترك أحدًا.' } },
  { id: 'r3', title: `${TEAMS_ACTIVITY.total}: ${TEAMS_ACTIVITY.candidates[0]} أم ${TEAMS_ACTIVITY.candidates[1]}؟`, goal: [{ checkpoint: 'contrast' }], stars: { maxTrials: 3 },
    easier: practice(12, 5, [4, 5, 6], 6, 'جولة تدريب: 12 لاعبًا فقط. جرّب 5 فرق ثم 6 فرق: متى لا يبقى أيّ لاعب خارج الفرق؟'),
    props: { type: 'team-builder', level: 'advanced', handDone: true, total: TEAMS_ACTIVITY.total, groups: TEAMS_ACTIVITY.candidates[0], teamChoices: TEAMS_ACTIVITY.choices, squadChoices: [TEAMS_ACTIVITY.total],
      lead: `جمع مدرّب النادي ${TEAMS_ACTIVITY.total} لاعبًا، وتردّد بين ${TEAMS_ACTIVITY.candidates[0]} فرق و ${TEAMS_ACTIVITY.candidates[1]} فرق متساوية. جرّب بنفسك: متى لا يبقى أيّ لاعب خارج الفرق؟` } },
  { id: 'challenge', optional: true, title: 'كل الأعداد التي لا تترك أحدًا', goal: [{ allExact: divisorsBetween(TEAMS_ACTIVITY.total, 2, 12) }], stars: { maxTrials: 7, predict: false },
    props: { type: 'team-builder', level: 'advanced', handDone: true, total: TEAMS_ACTIVITY.total, groups: 2, teamChoices: range(2, 12), squadChoices: [TEAMS_ACTIVITY.total], checkpoints: false,
      lead: `تحدٍّ: ${TEAMS_ACTIVITY.total} لاعبًا. جد كل أعداد الفرق، من 2 إلى 12، التي لا تترك أيّ لاعب خارج الفرق.` } },
  { id: 'free', free: true, title: 'الملعب الحرّ',
    // des PASTILLES à essayer (propriétaire, 2026-11-07 : « le terrain libre n'a pas de paramètres ») — bornées pour l'écran du
    // lecteur : au plus 6 équipes (une rangée de terrains de bonne taille) et 30 joueurs (un banc de 2 lignes courtes)
    props: { type: 'team-builder', level: 'advanced', handDone: true, total: 20, groups: 4, checkpoints: false,
      teamChoices: [2, 3, 4, 5, 6], squadChoices: [12, 15, 16, 18, 20, 24, 30],
      lead: 'الملعب الحرّ: اختر أنت عدد اللاعبين وعدد الفرق، وجرّب ما تشاء.' } },
];

export const M2_ROUNDS = [
  { id: 'a', title: `${TEAMS_EXAMPLE.total} في ${TEAMS_EXAMPLE.groups[0]} فرق`, goal: [{ checkpoint: 'first' }, { exact: TEAMS_EXAMPLE.groups[0] }], stars: { maxTrials: 2 },
    easier: practice(12, 5, [3, 5], 3, 'جولة تدريب: 12 لاعبًا فقط. وزّعهم في 5 فرق، ثم في 3 فرق: متى لا يبقى أحد خارج الفرق؟'),
    props: { type: 'team-builder', handDone: true, total: TEAMS_EXAMPLE.total, groups: TEAMS_EXAMPLE.groups[0], teamChoices: TEAMS_EXAMPLE.choices, squadChoices: [TEAMS_EXAMPLE.total],
      lead: `في دورة الحيّ ${TEAMS_EXAMPLE.total} لاعبًا. وزّعهم في ${TEAMS_EXAMPLE.groups[0]} فرق متساوية: هل يبقى أحد خارج الفرق؟` } },
  { id: 'b', title: `${TEAMS_EXAMPLE.total} في ${TEAMS_EXAMPLE.groups[1]} فرق`, goal: [{ exact: TEAMS_EXAMPLE.groups[1] }], stars: { maxTrials: 2, predict: false },
    props: { type: 'team-builder', handDone: true, total: TEAMS_EXAMPLE.total, groups: TEAMS_EXAMPLE.groups[1], teamChoices: TEAMS_EXAMPLE.choices, squadChoices: [TEAMS_EXAMPLE.total], checkpoints: false,
      lead: `والآن وزّع الـ ${TEAMS_EXAMPLE.total} لاعبًا في ${TEAMS_EXAMPLE.groups[1]} فرق: هل يبقى أحد خارج الفرق هذه المرّة؟` } },
  { id: 'free', free: true, title: 'الملعب الحرّ',
    props: { type: 'team-builder', level: 'advanced', handDone: true, total: TEAMS_EXAMPLE.total, groups: 4, checkpoints: false,
      teamChoices: [2, 3, 4, 5, 6], squadChoices: [24, 30, 36, 42, TEAMS_EXAMPLE.total],
      lead: 'الملعب الحرّ: اختر أنت عدد اللاعبين وعدد الفرق، وجرّب ما تشاء.' } },
];

