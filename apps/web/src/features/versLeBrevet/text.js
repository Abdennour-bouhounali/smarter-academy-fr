/**
 * « Vers le brevet » — PROTOTYPE: the sentences of the interface. Plain French, « tu », no slang
 * (docs/reports/VERS_LE_BREVET_PLAN.md §3). Written with ordinary spaces; `fr` sets the French ones.
 */

/** A narrow no-break space before ; ! ?, a no-break space before : and inside « » (FRENCH_LANGUAGE_CONTRACT.md). */
export const fr = (s) =>
  s
    .replace(/ ([;!?])/g, ' $1')
    .replace(/ :/g, ' :')
    .replace(/« /g, '« ')
    .replace(/ »/g, ' »');

const each = (o) =>
  Object.fromEntries(
    Object.entries(o).map(([k, v]) => {
      if (typeof v === 'string') return [k, fr(v)];
      if (typeof v === 'function') return [k, (...args) => fr(v(...args))];
      if (Array.isArray(v)) return [k, v.map(fr)];
      return [k, each(v)];
    }),
  );

export const T = each({
  title: 'Vers le brevet',
  steps: ['La carte du chapitre', 'Exercices résolus', 'Quiz rapide'],
  points: 'points',
  soundOn: 'Son : oui',
  soundOff: 'Son : non',
  dark: 'Sombre',
  light: 'Clair',
  theme: 'Thème',
  next: 'Suivant',
  home: 'Chapitre',

  // the two presentations
  mode: 'Présentation',
  modeScreens: 'Par écrans',
  modePage: 'En une page',
  pageTitle: 'Tout le chapitre',
  pageTop: 'Haut de page',
  lessonN: (n) => `Leçon ${n}`,
  linkFrom: (n, what) => `Vient de la leçon ${n} : ${what}`,

  // the map
  mapIntro: 'Voici tout le chapitre sur un écran. Touche une leçon : tu la revois en une minute.',
  mapAll: 'Tu as revu les quatre leçons. Regarde maintenant deux exercices résolus.',
  mapSeen: (n, of) => `${n} leçon${n > 1 ? 's' : ''} revue${n > 1 ? 's' : ''} sur ${of}`,
  mapThen: 'Ensuite : deux exercices résolus, puis un quiz rapide.',
  toSolved: 'Exercices résolus',
  backToMap: 'Retour à la carte',

  // a lesson
  idea: 'L’idée',
  rule: 'La règle',
  trap: 'Le piège',
  words: 'Les mots',
  wordHint: 'Touche un mot pour revoir ce qu’il veut dire.',
  yourTurn: 'À toi, en vingt secondes',

  // the four manipulations
  decNo: (p, n) => `${p} ne divise pas ${n}. Essaie un autre nombre premier.`,
  decGo: (n) => `Bien. Il reste ${n} à casser.`,
  decDone: (n, form) => `${n} = ${form}. Il ne reste que des nombres premiers.`,
  decAgain: 'Un autre nombre',
  lotsLeft: (n, r1, A, r2, B) =>
    `Avec ${n} bouquets, il reste ${r1} ${A} et ${r2} ${B}. ${n} n’est pas un diviseur commun.`,
  lotsMore: (n) => `${n} est un diviseur commun : rien ne reste. Y en a-t-il un plus grand ?`,
  lotsBest: (n) => `${n} divise 24 et 36, et aucun nombre plus grand ne le fait : PGCD(24 ; 36) = ${n}.`,
  rest: (r1, A, r2, B) => `Il reste ${r1} ${A} et ${r2} ${B}`,
  irrNo: (d, n) => `${d} ne divise pas ${n}. Il faut un diviseur du haut ET du bas.`,
  irrGo: 'La fraction a rapetissé, sa valeur est la même. Encore un diviseur commun ?',
  irrDone: (n, d) => `${n}/${d} est irréductible : le haut et le bas n’ont plus de diviseur commun.`,
  irrAgain: 'Une autre fraction',
  rdvStep: 'Avancer',
  rdvOne: (at, which) => `À ${at} s, seul le ${which} phare s’allume.`,
  rdvBoth: (at) => `À ${at} s, les deux s’allument ensemble : ${at} est leur plus petit multiple commun.`,
  rdvWhich: ['premier', 'second'],
  rdvAgain: 'Recommencer',

  // the solved exercises
  solvedCount: (i, n) => `Exercice résolu ${i} sur ${n}`,
  copy: 'La copie',
  nextLine: 'Ligne suivante',
  nextExercise: 'Exercice suivant',
  toQuiz: 'Quiz rapide',
  solvedIntro: 'Lis l’énoncé, puis fais apparaître la copie ligne par ligne.',

  // the quiz
  quizCount: (i, n) => `Question ${i} sur ${n}`,
  quizIntro: 'Six questions, une réponse à toucher. La raison arrive tout de suite.',
  quizRight: ['Bien vu !', 'Exact !', 'C’est ça !'],
  quizWrong: 'Pas cette fois. Lis la raison.',
  quizSee: 'Voir le résultat',
  quizScore: (ok, n) => `${ok} bonne${ok > 1 ? 's' : ''} réponse${ok > 1 ? 's' : ''} sur ${n}`,
  quizAll: 'Tout le chapitre est en place.',
  quizReview: 'À revoir sur la carte :',
  quizEnd: 'Un tampon de plus dans ton carnet du brevet.',
  again: 'Refaire le quiz',
  toMap: 'Revoir la carte',
});
