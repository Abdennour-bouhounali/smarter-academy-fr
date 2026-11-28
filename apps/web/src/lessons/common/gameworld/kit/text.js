/**
 * THE WORDS of the kit's screens — one table per screen, nothing but words (and small functions that build a sentence).
 * Nothing here speaks of a lesson's mathematics or of its world: those sentences are the lesson's (`lesson.text`) and the
 * world's (`world.text`).
 *   TX      the chrome of the lesson's pages: the two practice spaces, « Ma progression », a real-world case, the
 *           « fiche de connaissances »
 *   KT      the chrome of the shell every world shares: the title screen, the HUD, the practice hub, a run, a tablet, the end
 *   EXAM    the exam sitting « brevet blanc » (ExamSitting.jsx)
 *   LEAF    the pager of an answer sheet in leaves (ExamSittingLeaves.jsx)
 *   TRAINER « Entraîne-toi » on a card (Trainer.jsx)
 *   FORGE   the rule forge « Forge ta règle » (RuleForge.jsx)
 *   PT      the paper mode (Paper.jsx, which re-exports it)
 */
import { agreed, counted, listFr } from './authoring/numbers';

const MINUTES = ['minute', 'minutes'];
const POINTS = ['point', 'points'];
/**
 * `counted` for a number already WRITTEN the French way (« 2,5 », a range « 2–2,5 »): the same agreement (under 2 is
 * singular), read on the value; a range is plural.
 */
const countedShown = (shown, nouns) => {
  const s = String(shown);
  if (s.includes('–')) return `${s} ${nouns[1]}`;
  const v = Number(s.replace(',', '.'));
  return Number.isFinite(v) ? `${s} ${Math.abs(v) < 2 ? nouns[0] : nouns[1]}` : `${s} ${nouns[1]}`;
};
const minutes = (m) => (typeof m === 'number' ? counted(m, MINUTES) : countedShown(m, MINUTES));
const points = (p) => (typeof p === 'number' ? counted(p, POINTS) : countedShown(p, POINTS));

export const TX = {
  hub: {
    title: 'L’espace d’entraînement',
    open: 'Espace d’entraînement',
    toKnow: 'Fiche de connaissances',
  },
  close: 'Fermer',
  tip: 'Astuce',
  // the two practice spaces: the real exam FIRST and open from the start (owner, 2026-11-26), then the game — which lives
  // BETWEEN the levels of the exam, never inside
  spaces: {
    game: 'Espace jeu',
    exam: 'Espace brevet',
    gameSub: 'Courses et missions : entraîne-toi en jouant.',
    examSub: 'Des brevets blancs sur papier : cinq paliers, d’un seul exercice à un sujet complet.',
    level: (n) => `Palier ${n}`,
    minutes,
    points,
    start: 'Commencer le brevet blanc',
    again: 'Refaire un brevet blanc',
    lockedLevel: 'S’ouvre après le palier précédent',
    focus: 'Sujet adapté : ce qui t’a coûté des points revient en premier, avec d’autres nombres.',
    passAt: 'Tu passes au palier suivant avec 80 % des points.',
    promoted: (n) => `Tu passes au palier ${n} !`,
    passed: 'Palier réussi !',
    champion: 'Tu as gravi toute l’échelle du brevet !',
    notYet: 'Pas encore… Un autre sujet, et tu y arrives.',
    notYetText:
      'Le sujet suivant est du même genre, avec d’autres nombres. Ce qui t’a coûté des points vient en premier.',
    twice: 'Deux fois sans réussir : entraîne-toi d’abord sur la règle, puis reviens.',
    nextLevel: 'Palier suivant',
    similar: 'Un sujet du même genre',
    train: 'Entraîne-toi d’abord',
    toLadder: 'L’échelle du brevet',
    mark: 'Note',
    /** A rung whose level has no sheet to sit yet (Spaces.jsx › ExamLadder). */
    noSheet: 'Pas encore de sujet pour ce palier',
  },
  lab: { open: 'Mon labo' },
  launch: { open: 'L’échauffement' },
  progress: {
    open: 'Ma progression',
    title: 'Ma progression dans cette leçon',
    road: {
      story: 'L’aventure',
      keys: 'Les clés',
      game: 'Étoiles de jeu',
      exam: 'Paliers du brevet',
      know: 'Cartes lues',
    },
    readiness: 'Prêt pour le brevet',
    readinessTip:
      'Compté seulement sur ce que tu as fait comme au brevet : tes premières réponses sur papier et les paliers du brevet blanc. Les étoiles de jeu n’y entrent pas.',
    cols: {
      key: 'Savoir-faire',
      game: 'En jeu',
      sealed: 'Fiche mémo',
      exam: 'Comme au brevet',
      server: 'Sur la plateforme',
    },
    notYet: 'Pas encore gagnée',
    sealed: 'Scellée',
    notSealed: '—',
    noTry: 'Pas encore d’essai',
    tries: (ok, n) => `${counted(ok, ['réussite', 'réussites'])} sur ${n}`,
    // the button reads « Ensuite : <what to do> »
    next: 'Ensuite :',
    do: {
      story: 'continue l’aventure',
      game: 'joue la manche suivante',
      exam: (n) => `passe le palier ${n} du brevet`,
      train: 'entraîne-toi d’abord sur cette règle',
      done: 'tout est fait, révise quand tu veux',
    },
    status: {
      mastered: 'Maîtrisé',
      reinforce: 'À consolider',
      gap: 'En difficulté',
      in_progress: 'En cours',
      not_started: 'Pas commencé',
    },
  },
  depot: {
    step: (i, n) => `Calcul ${i} sur ${n}`,
    check: 'Vérifier',
    pack: 'Emballer',
    guide: 'Comprenons ce qui s’est passé',
    retry: 'Je réessaie',
    history: 'Les calculs d’avant :',
    review: 'Revoir un calcul d’avant',
    mine: 'Ta réponse',
    backNow: 'Retour à ma question →',
  },
  know: {
    title: 'Fiche de connaissances',
    open: 'Fiche de connaissances',
    sub: 'Toutes les règles de la leçon, ses exemples et ses pièges. Ouvre chaque carte et scelle chaque règle d’or.',
    cards: 'Cartes lues',
    seals: 'Règles scellées',
    locked: 'Cette carte s’ouvre quand tu gagnes sa clé dans l’aventure.',
    lockedTitle: 'Carte verrouillée',
    kinds: {
      concept: ['💡', 'Notion', 'core'],
      definition: ['📘', 'Définition', 'core'],
      prerequisite: ['📌', 'Rappel', 'guide'],
      example: ['✏️', 'Exemple', 'guide'],
      common_mistake: ['⛔', 'Erreur fréquente', 'mistake'],
      check: ['🔍', 'Vérification', 'guide'],
      term: ['🗣️', 'Vocabulaire', 'core'],
      retain: ['⭐', 'À retenir', 'core'],
      warning: ['⚠️', 'Attention', 'mistake'],
      takeaway: ['🎯', 'L’essentiel', 'core'],
      relationship: ['🔑', 'Règle', 'core'],
      method: ['🧭', 'Méthode', 'core'],
      tip: ['✨', 'Astuce', 'guide'],
    },
    legend: { core: 'Ce que tu dois savoir', guide: 'Ce qui t’aide', mistake: 'Ce dont tu dois te méfier' },
    discover: 'Mode découverte',
    full: 'La carte des connaissances',
    found: 'Cartes découvertes',
    again: 'Recommencer la découverte',
    allFound: 'Tu as découvert toute la carte !',
    journey: 'Le voyage de découverte',
    journeySub: 'Une carte à la fois : lis-la tranquillement, puis retourne la suivante.',
    trail: 'Ce que tu as découvert',
    hidden: 'Cartes cachées',
    nextTitle: 'Retourne une carte pour découvrir la suite',
    mystery: 'Nouvelle carte',
    branchEnd: 'Tu es au bout de ce chemin',
    frontier: 'Il reste ici des cartes cachées :',
    seeMap: 'Voir la carte des connaissances',
    tabs: { card: 'La carte', memo: 'Fiche mémo', quiz: 'Teste ta mémoire', train: 'Entraîne-toi' },
    memo: { rule: 'La règle', hook: 'Pour t’en souvenir', example: 'Exemple', trap: 'Le piège', exam: 'Au brevet' },
    parts: { wrong: 'L’erreur', why: 'Pourquoi ça ne tient pas', right: 'Ce qui tient', example: 'Exemple' },
    reveal: 'Pourquoi ça ne tient pas ? Découvre-le',
    check: 'Vérifier',
    quizOk: 'Cette règle est scellée d’or !',
    quizRetry: 'Pas encore : relis la fiche mémo, puis réessaie.',
    sealed: 'Scellée d’or',
    practise: 'Entraîne-toi sur cette carte',
    close: 'Fermer',
  },
};

/** The CHROME of the shell every world shares: the title screen, the HUD, the practice hub, a run, a rule tablet, the end. */
export const KT = {
  turn: 'Tourne ton téléphone',
  start: 'Commencer l’aventure',
  resume: 'Continuer l’aventure',
  restart: 'Recommencer depuis le début',
  // what a screen shows IN PLACE OF the name of a key he does not hold yet (« no rule is told »: the name comes after him)
  hidden: '? ? ?',
  noWebgl:
    'Cet appareil n’affiche pas le monde en 3D. Ouvre la leçon dans un autre navigateur ou sur un autre appareil.',
  controls: { move: 'Se déplacer', jump: 'Sauter', act: 'Agir', space: 'Espace' },
  /** The instruction of the moment (kit/Instruction.jsx): it stays until it is done; he may fold it and open it again. */
  instruction: { label: 'Mission', hide: 'Masquer la mission', show: 'Afficher la mission' },
  /** What matters from the island before, shown beside the game. */
  recall: { title: 'De l’île précédente' },
  hud: {
    stars: 'Étoiles',
    gems: 'Cristaux',
    exit: 'Quitter',
    sound: 'Son',
    full: 'Plein écran',
    bag: 'Espace d’entraînement',
  },
  /** The teacher's preview of the world (LessonWorld.jsx): spoken to the teacher, so no « tu ». */
  preview: { text: 'Aperçu du professeur : ce que voit l’élève. Rien n’est enregistré.', exit: 'Quitter l’aperçu' },
  prompt: { press: 'Appuie sur', tap: 'Touche ici' },
  tablets: {
    close: 'J’ai retenu ma clé',
    all: 'Mes règles',
    back: 'Retour au jeu',
    got: 'Une nouvelle clé',
    forged: 'Une clé que tu as forgée',
    mine: 'Ta règle, qui a tenu face au miroir :',
    theirs: 'Et voici son nom en mathématiques :',
  },
  end: {
    stars: 'Étoiles',
    gems: 'Cristaux',
    /** The label under the number of falls: « 0 chute », « 2 chutes » (agreed with it). */
    falls: (n) => agreed(n, ['Chute', 'Chutes']),
    time: 'Temps',
    /** The time of the story, in whole minutes. */
    min: (m) => `${m} min`,
    test: 'Passer le test de la leçon',
    practice: 'Exercices de la leçon',
    again: 'Rejouer',
  },
  // the practice hub: the lesson's mind map, each node a set of levels
  map: {
    level: (n) => `Manche ${n}`,
    locked: 'Gagne cette clé dans l’aventure pour ouvrir sa piste.',
    examLocked: 'Termine la manche 1 de chaque clé pour ouvrir le défi du brevet.',
    levelLocked: 'Termine d’abord la manche précédente',
    next: 'Continuer l’entraînement',
    allDone: 'Toutes les manches à trois étoiles !',
    play: 'Jouer',
    close: 'Fermer',
    rule: 'La règle',
    stars: 'Étoiles d’entraînement',
  },
  practice: {
    score: 'Points',
    streak: 'Série',
    rule: 'La règle',
    quit: 'Quitter',
    guide: 'Comprenons ce qui s’est passé',
    picked: (n) => `Tu as choisi ${n}`,
    right: (n) => `La bonne porte : ${n}`,
    again: 'Une question du même genre reviendra avant la fin de la course.',
    lost: 'Deux portes manquées dans cette course : voici la règle qu’il te faut.',
    go: 'J’ai compris, je continue',
    remind: 'Rappelle-moi la règle',
    back: 'Retour à la course',
    win: ['Bravo !', 'Excellent !', 'Course parfaite !'],
    lose: 'Plus de boucliers',
    loseText: 'Pas grave : relis la règle, puis recommence.',
    newBest: 'Nouveau record !',
    mistakes: 'Portes manquées',
    nextLevel: 'Manche suivante',
    retry: 'Rejouer la manche',
    map: 'La carte',
    exam: 'Entraîne-toi pour le brevet',
  },
};

/** The words of a sitting served from the bank (`bankSitting.js`): its levels, its title, its exercises, its scheme. */
export const BANK = {
  // the names the practice space gives the bank's five levels (`student.json › levelNames`)
  levels: ['Je reprends les bases', 'J’applique', 'Je m’exerce', 'J’approfondis', 'Défi'],
  title: (n) => `Brevet blanc — palier ${n}`,
  exercise: (n) => `Exercice ${n}`,
  problem: 'Problème',
  // what the corrector looks for ON THE PAPER, by the shape of the step
  scheme: {
    selfCheck: ['J’ai rédigé toute la réponse sur ma feuille', 'Je l’ai comparée ligne à ligne au corrigé rédigé'],
    choice: ['J’ai justifié mon choix sur ma feuille', 'J’ai écrit la phrase réponse en entier'],
    integerSet: [
      'Je n’ai oublié aucun élément',
      'Je n’ai écrit aucun élément en trop',
      'J’ai écrit la méthode sur ma feuille',
    ],
    value: ['J’ai écrit le calcul avant le résultat', 'J’ai écrit le résultat sous la forme demandée'],
  },
};

/** The appreciation written on a copy of the brevet blanc, by the share of the points (`sitting.js › appreciation`). */
export const APPRECIATION = {
  top: 'Excellent',
  good: 'Bien',
  fair: 'Assez bien\u00a0: revois tes erreurs',
  work: 'À retravailler\u00a0: ne lâche rien',
};

/** « Brevet blanc » — the exam sitting (ExamSitting.jsx). Black for the subject, blue for the student, red for the corrector. */
export const EXAM = {
  seat: 'Place',
  read: 'Temps de lecture',
  readTip: 'Lis d’abord tout le sujet. Touche un nombre ou un mot pour le souligner au crayon.',
  ready: 'J’ai fini de lire : je commence',
  paper: 'Rédige la solution complète sur ta copie. Ici, tu reportes seulement les réponses.',
  sheet: 'Feuille de réponses',
  silent: 'Sans musique',
  here: 'Tu devrais en être ici',
  flag: 'J’y reviendrai',
  lastMinute: 'Il reste une minute : relis deux réponses.',
  hand: 'Je rends ma copie',
  sure: 'Sûr ? Tu ne pourras plus rien changer après.',
  yes: 'Oui, je rends',
  no: 'Je continue',
  sealed: 'Copie rendue…',
  pick: 'Touche une question pour voir sa correction',
  mine: 'Ta réponse',
  none: 'Pas de réponse',
  scheme: 'Compare avec ta copie : qu’as-tu écrit ?',
  guide: 'Guide-moi',
  explain: 'Explique-moi',
  modelCopy: 'Le corrigé rédigé',
  think: 'Réfléchis avec moi',
  redo: 'Refais cette question sur ta copie, puis compare.',
  notebook: 'Mon carnet de révision',
  notebookTip: 'Écris dans ton cahier, à la main :',
  finish: 'J’ai fini',
  perfect: 'Copie parfaite : rien à noter dans ton carnet !',
  onPaper: 'À rédiger sur ta copie seulement : tu la compares au corrigé après l’avoir rendue.',
  loading: 'Le sujet se prépare…',
  failed: 'Impossible de préparer le sujet. Vérifie ta connexion, puis réessaie.',
  empty: 'Pas encore de sujet pour ce palier.',
  quit: 'Quitter',
  quitTitle: 'Quitter le brevet blanc ?',
  quitText:
    'Ta copie ne sera pas corrigée et cet essai ne compte pas : tu retrouveras le même palier sur l’échelle, avec un nouveau sujet.',
  quitYes: 'Oui, je quitte',
  forgotOne: (name) => `Attention : rien n’est écrit pour « ${name} ». Le voici.`,
  forgotMany: (names) => `Attention : rien n’est écrit pour ${listFr(names.map((n) => `« ${n} »`))}.`,
  /** The points of a subject, a sheet or a step (« 2,5 points », « 1 point »), and its time (« 1 minute », « 20 minutes »). */
  points,
  minutes,
};

/** The pager of an answer sheet too long for its box (ExamSittingLeaves.jsx). */
export const LEAF = {
  prev: 'Précédente',
  next: 'Suivante',
  page: 'Page',
  more: 'La suite des réponses est à la page suivante',
};

/** « Entraîne-toi » — the trainer on a card of the « fiche de connaissances » (Trainer.jsx). */
export const TRAINER = {
  game: 'Format jeu',
  exam: 'Format brevet',
  question: (i) => `Question ${i}`,
  check: 'Vérifier',
  next: 'Suivant',
  finish: 'Terminer l’entraînement',
  again: 'Recommencer l’entraînement',
  review: 'Revoir',
  mine: 'Ta réponse',
  backNow: 'Retour à ma question',
  seeOld: 'Touche une question d’avant pour revoir ta réponse',
  hint: 'Pas encore',
  fix: 'Correction',
  right: 'Bravo !',
  // the two answers of the brevet's own question « Vrai ou faux ? » — words of the statement, never a verdict on him
  true: 'Vrai',
  false: 'Faux',
  tfAsk: 'Vrai ou faux ? Justifie.',
  why: 'Justification :',
  pick: '— choisis —',
  done: ['Continue à t’entraîner !', 'Bon début !', 'Bravo !', 'Entraînement parfait !'],
  first: 'réussies du premier coup',
  best: 'Meilleur résultat',
};

/** « Forge ta règle » — the words of the forge itself, the same in every lesson. What speaks of a case is the forge's `text`. */
export const FORGE = {
  /** The three beats of a forge — the key being made (RuleForge.jsx « THE ARCHITECTURE »). */
  beats: { try: 'Essaie', write: 'Grave ta règle', seal: 'Scelle ta clé' },
  /** One short line over the mirror's first attack: his rule agreed with all he did (the long sentence was just shown). */
  agreedThenAttack: 'Ta règle s’accorde avec tes essais. Le miroir riposte.',
  right: 'Ta prédiction a vu juste !',
  miss: 'Ta prédiction n’a pas vu juste cette fois.',
  toBuild: 'J’écris ma règle',
  inHead: 'Trois prédictions justes d’affilée : la règle est dans ta tête. Écris-la maintenant.',
  timeToWrite: 'C’est le moment d’écrire ta règle : le miroir va la tester.',
  test: 'Teste ma règle',
  fix: 'Je corrige ma règle',
  notThat: 'Ta règle dit autre chose.',
  another: 'Un autre défi',
  toSeal: 'Ma règle a tenu !',
  sealed: 'Ta règle a tenu face au miroir : elle devient ta clé.',
  check: 'Vérifier',
  help: 'Aide-moi, Zéro',
  choice: 'L’une de ces deux règles tient face au miroir. Teste-les :',
  ruleA: 'La première règle',
  ruleB: 'La deuxième règle',
};

/** The paper mode (Paper.jsx): a sheet, a pen and a method — no music, no gates. */
export const PT = {
  mode: 'Mode papier',
  silent: 'Sans musique',
  take: 'Prends ton stylo et ta feuille',
  wait: (n) => `Écris d’abord… ${n}`,
  go: 'J’ai écrit sur ma feuille : je reporte ma réponse',
  how: 'Comment l’écrire sur la feuille ?',
  tipDivision:
    'Au brevet, ni musique ni portes : pose la division sur ta feuille, puis reporte le quotient et le reste.',
  tipWrite: 'Au brevet, ni musique ni portes : écris ta réponse et ta justification sur ta feuille, puis reporte-la.',
  tipCompute: 'Calcule sur ta feuille comme au brevet, puis reporte le résultat.',
  twin: 'Un exemple du même genre : voici comment l’écrire sur la feuille',
  own: 'Le corrigé rédigé de ta question',
  think: 'Je réfléchis',
  sheet: 'Ma feuille',
  verify: 'Je vérifie',
  write: 'J’écris sur ma copie',
  next: 'La suite',
  replay: 'Depuis le début',
  back: 'J’ai compris, je reviens à ma question',
  readFix: 'Lis le corrigé rédigé',
  method: 'La méthode pour répondre',
};
