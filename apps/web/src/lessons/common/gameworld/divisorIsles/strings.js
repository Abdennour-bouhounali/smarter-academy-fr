/**
 * « L’archipel des diviseurs » — every sentence of the game (the platform's own wording; nothing is quoted from a
 * textbook). A rule is NAMED only on a « tablette » that opens AFTER the student has seen it happen in the world.
 * The French agreement of a number and its noun is the kit's (`kit/authoring/numbers.js › counted`).
 */
import { counted, listFr, PLANKS, CELLS } from '../kit/authoring/numbers';

/** « 1 planche », « 21 planches » — the number is always written. */
export const planks = (q) => counted(q, PLANKS);
/** « 1 case vide », « 3 cases vides ». */
const cells = (r) => counted(r, ['case vide', 'cases vides']);
/** « il reste 1 case vide », « il reste 3 cases vides ». */
const remain = (r) => `il reste ${cells(r)}`;
/** A sentence's first letter in capital. */
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** The words of the rule forge's cases in this world (`forgeParts.jsx`): the bridge in the mirror and its line. */
export const FORGE_TEXT = {
  which: 'De quel pont parles-tu ? Le miroir le construira après ta réponse.',
  cells: (n) => counted(n, CELLS),
  and: 'et',
  mirror: 'Construit par le miroir',
  plank: (b) => `planche de ${b}`,
  held: 'tient',
  fell: (c) => (c.b > c.a ? 's’effondre : planche trop longue' : `s’effondre : il reste ${counted(c.r, CELLS)}`),
  true: 'vraie',
  false: 'fausse',
  // a case that is a FACTOR LADDER (`c.factor`): where its planks took the number — a fact, never a name
  factorEnd: (left) => (left === 1 ? 'arrive à 1' : `s’arrête sur ${left}`),
  factorFell: (d) => `la planche de ${d} tombe`,
  pair: (c) =>
    c.pair.need != null
      ? planks(c.pair.need)
      : (c.fits ?? c.held)
        ? 'construit les deux ponts'
        : 'ne les construit pas',
};

const div = (a, b) => ({ q: Math.floor(a / b), r: a % b });

/**
 * The sentence of a practice wave (shown big above the rail). `$…$` is maths. A wave of a type this world does not know
 * is one the lesson wrote itself: its own `say` (and its own guidance `why`, read by `explain`).
 */
export function waveSay(w) {
  switch (w.type) {
    case 'divisorOf':
    case 'sureOf':
    case 'fromProduct':
      return `Un diviseur de ${w.a}`;
    case 'divides':
      return `Un nombre qui divise ${w.a}`;
    case 'multipleOf':
      return `Un multiple de ${w.b}`;
    case 'divisibleBy':
      return `Un nombre divisible par ${w.b}`;
    case 'remainder':
      return `Le reste de la division de ${w.a} par ${w.b}`;
    case 'missing':
      return `$${w.a} = ${w.b} \\times \\square$`;
    case 'everyNumber':
      return 'Un diviseur de tout nombre entier';
    case 'biggest':
      return `Le plus grand diviseur de ${w.a}`;
    case 'smallest':
      return `Le plus petit diviseur de ${w.a}`;
    case 'lastTry':
      return `Le dernier nombre à essayer pour trouver les diviseurs de ${w.a}`;
    case 'countOf':
      return `Le nombre de diviseurs de ${w.a}`;
    default:
      return w.say ?? '';
  }
}
/** A line above the sentence, when the wave gives something to read first (the product of « Lis le produit »). */
export const waveHint = (w) => (w.type === 'fromProduct' ? `$${w.a} = ${w.b} \\times ${w.q}$` : null);

/**
 * Guidance after a wrong gate: WHY the chosen number does not fit (with its own division), then why the right one does.
 * Always the world's reasoning — a remainder, a product — never « wrong » alone.
 */
export function explain(w, n) {
  const g = w.gates[w.good];
  const zero = '0 n’est le diviseur d’aucun nombre : on ne divise pas par 0.';
  const notDivisor = (a, x) => {
    if (x === 0) return zero;
    if (x > a && x % a === 0)
      return `${x} est un multiple de ${a}, pas un diviseur : un diviseur n’est jamais plus grand que le nombre.`;
    const { q, r } = div(a, x);
    return `$${a} = ${x} \\times ${q} + ${r}$ : le reste est ${r}, donc ${x} n’est pas un diviseur de ${a}.`;
  };
  const isDivisor = (a, x) =>
    x === 1
      ? `1 est un diviseur de tout nombre entier : $${a} = 1 \\times ${a}$.`
      : x === a
        ? `Tout nombre non nul est un diviseur de lui-même : $${a} = ${a} \\times 1$.`
        : `$${a} = ${x} \\times ${a / x}$ : le reste est 0, donc ${x} est un diviseur de ${a}.`;
  switch (w.type) {
    case 'divisorOf':
    case 'divides':
    case 'sureOf':
    case 'fromProduct':
      return { wrong: notDivisor(w.a, n), right: isDivisor(w.a, g) };
    case 'multipleOf':
    case 'divisibleBy': {
      let wrong;
      if (n === 0) wrong = zero;
      else if (n < w.b && w.b % n === 0)
        wrong = `${n} est un diviseur de ${w.b}, pas un multiple : les multiples de ${w.b} sont ${w.b}, ${2 * w.b}, ${3 * w.b}…`;
      else {
        const { q, r } = div(n, w.b);
        wrong = `$${n} = ${w.b} \\times ${q} + ${r}$ : le reste est ${r}, donc ${n} n’est pas divisible par ${w.b}.`;
      }
      return {
        wrong,
        right: `$${g} = ${w.b} \\times ${g / w.b}$ : ${g} est un multiple de ${w.b}, donc il est divisible par ${w.b}.`,
      };
    }
    case 'remainder':
      return {
        wrong: `Vérifie : $${w.b} \\times ${w.q} + ${n} = ${w.b * w.q + n}$, et non ${w.a}.`,
        right: `$${w.a} = ${w.b} \\times ${w.q} + ${w.r}$ : le reste est ${w.r}.`,
      };
    case 'missing':
      return {
        wrong: `$${w.b} \\times ${n} = ${w.b * n}$, et non ${w.a}.`,
        right: `$${w.a} = ${w.b} \\times ${w.q}$ : ${w.b} et ${w.q} sont deux diviseurs de ${w.a}.`,
      };
    case 'everyNumber':
      return {
        wrong:
          n === 0
            ? zero
            : `${n} n’est pas un diviseur de tout nombre : $${n + 1} = ${n} \\times 1 + 1$, le reste est 1.`,
        right: '1 est un diviseur de tout nombre entier : $a = 1 \\times a$.',
      };
    case 'biggest':
      return {
        wrong:
          n > w.a
            ? `${n} est plus grand que ${w.a} : c’est un multiple, et un diviseur ne dépasse pas le nombre.`
            : w.a % n === 0
              ? `${n} est bien un diviseur de ${w.a}, mais ce n’est pas le plus grand.`
              : notDivisor(w.a, n),
        right: `Le plus grand diviseur de ${w.a} est ${w.a} lui-même : $${w.a} = ${w.a} \\times 1$.`,
      };
    case 'smallest':
      return {
        wrong:
          n === 0
            ? zero
            : w.a % n === 0
              ? `${n} est bien un diviseur de ${w.a}, mais ce n’est pas le plus petit.`
              : notDivisor(w.a, n),
        right: `Le plus petit diviseur de tout nombre est 1 : $${w.a} = 1 \\times ${w.a}$.`,
      };
    case 'lastTry': {
      const d = Math.floor(Math.sqrt(w.a));
      return {
        wrong:
          n * n > w.a
            ? `$${n} \\times ${n} = ${n * n}$ dépasse ${w.a} : après cette limite, on retrouve les mêmes produits à l’envers.`
            : `Après ${n}, il reste un nombre dont le carré ne dépasse pas ${w.a} : $${n + 1} \\times ${n + 1} = ${(n + 1) * (n + 1)}$.`,
        right: `$${d} \\times ${d} = ${d * d}$ ne dépasse pas ${w.a}, et $${d + 1} \\times ${d + 1} = ${(d + 1) * (d + 1)}$ le dépasse : on s’arrête à ${d}.`,
      };
    }
    case 'countOf': {
      const ds = [];
      for (let d = 1; d <= w.a; d += 1) if (w.a % d === 0) ds.push(d);
      return {
        wrong: `Compte-les par paires : chaque produit égal à ${w.a} donne deux diviseurs.`,
        right: `Les diviseurs de ${w.a} sont ${listFr(ds)} : il y en a ${ds.length}.`,
      };
    }
    default:
      // a wave the lesson WROTE itself (a type this world does not know): it carries its sentence `say` and its guidance
      // `why: { right, wrong: { [gate]: line } }` — data, one line per wrong gate
      return w.why ? { wrong: w.why.wrong?.[n] ?? '', right: w.why.right ?? '' } : { wrong: '', right: '' };
  }
}

/**
 * The world's own words for an experiment (`Inquiry*.jsx`) when the lesson's `spec.text` does not give its own: a press
 * that cannot be answered yet is answered by what is missing on the screen — a fact, never « wrong ».
 */
export const INQUIRY_TEXT = {
  // common: « Vérifier » pressed with no plank marked on the shelf of both gaps, or with the count not written
  sayFirst: ({ needLong, needCount }) =>
    needLong && needCount
      ? 'Tu n’as encore marqué aucune planche, et le nombre de planches n’est pas écrit : touche la plus longue planche de l’étagère des deux fossés, puis écris le nombre.'
      : needLong
        ? 'Tu n’as encore marqué aucune planche : touche la plus longue planche de l’étagère des deux fossés.'
        : 'Le nombre de planches n’est pas écrit : compte les planches de l’étagère des deux fossés et écris le nombre.',
  // common · witness: the tray is empty and no plank of it filled both gaps — that fact only (never « they share none »)
  witnessEmpty: () => 'Aucune planche de ce tas ne remplit les deux fossés à la fois.',
  // chart: the next hundred, while he tests its first gaps himself (then the world finishes it: `text.confirming`)
  confirmTest: (b, from, n) =>
    `Ta lecture tient-elle après la première centaine ? Essaie toi-même la planche ${b} sur ${n === 1 ? 'le premier fossé' : `les ${counted(n, ['premier fossé', 'premiers fossés'])}`} à partir de ${from}, puis le monde continue jusqu’à ${from + 99}.`,
  // letters: a false card that none of the samples refutes — where it stands, not a verdict
  unrefuted: () =>
    'Cette ligne ne se déduit ni des données ni d’une ligne au-dessus : elle n’a pas sa place dans la preuve.',
  // letters: a sample whose □ is not a natural number (value is not by × a natural number) — shown, then the world moves on
  noWhole: (v, value, by) => `Avec ces nombres, aucun nombre entier □ ne donne $${by} \\times \\square = ${value}$.`,
};

export const T = {
  turn: { body: 'L’archipel est vaste : tourne ton téléphone à l’horizontale.' },
  title: 'L’archipel des diviseurs',
  subtitle:
    'Une tempête a cassé les ponts de lumière entre les îles, et le phare s’est éteint. Reconstruis les ponts avec le robot Zéro et rallume le phare.',
  hud: {
    remainder: 'Reste',
    unpaid: 'Cases sans planche',
    /** the mould he carries, in the top bar */
    held: (b) => `Moule ${b}`,
  },
  /** The names the screen reads aloud (aria-label): the two lanes of the run, the facts of a case, the amount typed. */
  a11y: {
    left: 'Gauche',
    right: 'Droite',
    facts: 'Ce que l’on sait',
    amount: 'Montant',
  },
  prompt: {
    take: (b) => `Prends le moule ${b}`,
    forge: (b) => `Construis le pont avec des planches de ${b}`,
    needMould: 'Prends d’abord un moule',
    statues: 'Réveille les gardiens',
    board: 'Monte sur le glisseur de lumière',
    anvil: 'Fabrique ton moule',
    anvilLocked: 'Essaie d’abord les moules',
    boss: 'Ouvre la réserve des moules',
    stone: 'Lis la stèle',
  },
  objective: {
    bridge: (a) => `Remplis exactement ${counted(a, CELLS)} pour traverser`,
    cross: 'Le pont tient : traverse !',
    storm: 'Sans aucune division : quel moule remplit 48 à coup sûr ?',
    stubborn: 'Trouve un moule qui remplit 7 cases',
    statues: 'Réveille les quatre gardiens',
    board: 'Monte sur le glisseur de lumière jusqu’à l’île têtue',
    dash: 'Passe par la bonne porte',
    stone: 'Va à la stèle de l’île (flèche jaune) et réponds à sa question',
    bossGo: 'Va au socle lumineux et choisis le moule qui remplit 756 cases',
    bossCross: 'Le grand pont tient : traverse jusqu’au phare !',
    end: 'Rallume le phare',
    // a CONVOY (two bridges built with the planks of ONE island): the second gap refused his planks, and its island has none
    convoyBack: (name) =>
      `Pas de planches sur cette île. Retourne à « ${name} » et choisis des planches qui construisent les deux ponts`,
  },
  /** What matters from the island before (kit/Instruction.jsx › Recall): the gap he has just crossed. */
  recall: { bridge: (a, b, q) => `Le fossé précédent : $${a} = ${b} \\times ${q}$` },
  /** The purse of a convoy: a coin per plank, whatever its length. */
  purse: { label: 'Pièces des deux ponts', one: 'Pièces du pont' },
  say: {
    hello:
      'Je suis Zéro ! La tempête a cassé les ponts de lumière. Prends le moule 3, puis viens au socle lumineux, près du fossé.',
    goAltar: 'Parfait ! Va maintenant au socle lumineux près du fossé : la flèche jaune te guide.',
    first: 'Cinq planches et aucune case vide : le pont tient. On traverse !',
    carry3: 'J’ai encore le moule 3. Ici, le fossé fait 16 cases… Que prédis-tu ?',
    gap: (r) => `${cap(remain(r))}, et le pont s’est effondré ! Essaie un autre moule.`,
    convoyBack: (name, r) =>
      `${cap(remain(r))}, et le deuxième pont s’est effondré. Pas de planches ici : retourne à « ${name} » et choisis des planches qui construisent les deux ponts.`,
    convoyReset: (b) =>
      `Les planches de ${b} construisent les deux ponts : les anciennes planches ont repris leur place.`,
    convoyOnly: 'Les deux ponts se construisent avec les mêmes planches : prends-les sur l’île précédente.',
    // a marked stretch (`mark.js`): the gap is filled, but the post of the mark stands in the middle of a plank
    markMiss: (b, mark) =>
      `Le pont est plein, mais le poteau du lampadaire, à la case ${mark.m}, tombe au milieu d’une planche : ${mark.m} = ${b} × ${mark.q} + ${mark.r}. Le poteau ne tient que sur une jointure entre deux planches.`,
    purseOut: (laid, need) =>
      `Plus de pièces ! ${planks(laid)} posée${laid < 2 ? '' : 's'}, et le pont a besoin de ${planks(need)}. Il faut une pièce par planche, quelle que soit sa longueur.`,
    gapRight: (r) => `Comme tu l’as prédit : ${remain(r)}. Ce moule ne convient donc pas : essaie un autre moule.`,
    gapShort: (r) => `Il reste ${r}… Le pont ne tient que s’il est rempli exactement.`,
    tooLong: (b, a) => `Une planche de ${b} est plus longue que tout le fossé (${a}) ! Aucune planche n’est entrée.`,
    ok: (b, q) =>
      q === 1
        ? `1 planche de ${b} remplit tout le fossé. Traverse !`
        : `${planks(q)} de ${b}, et aucune case vide. Traverse !`,
    c42: 'Un fossé de 42 cases et quatre moules. Réfléchis avant de lancer : ta première prédiction vaut une étoile.',
    d48: 'L’île des miroirs… Ici, il n’y a que le moule 6. Compte bien les planches !',
    storm:
      'Tempête ! Les planches se sont envolées et le moule 6 s’est cassé… mais j’ai gardé ce qu’on a vu : $48 = 6 \\times 8$',
    stormHint: 'Quatre nouveaux moules sont apparus. L’un d’eux remplit 48 à coup sûr, sans aucune division !',
    stormOk: 'Six planches de 8 : la même égalité, à l’envers : $48 = 8 \\times 6$',
    e120: 'Un long fossé : 120 cases. Lequel de ces moules le remplit ?',
    f: 'Les quatre gardiens dorment. Chacun dit la même vérité avec sa phrase… Réveille-les pour monter sur le glisseur de lumière.',
    statuesFirst: 'Le glisseur de lumière ne bouge pas tant que les gardiens dorment.',
    boardReady: 'Les gardiens sont réveillés ! Le glisseur de lumière t’attend au bord de l’île.',
    dashGo: 'Lis la phrase, et passe par la porte qui la vérifie. À gauche, à droite !',
    dashHit: 'Aïe ! Regarde la porte verte.',
    dashAgain: 'Plus de boucliers… On repart !',
    g7: 'L’île têtue ! Le fossé ne fait que 7 cases. Essaie ses moules…',
    anvilOpen:
      'Aucun moule de l’île ne remplit 7 ! L’atelier est ouvert : fabrique un moule de la longueur que tu veux.',
    crafted: (b) => `Le moule de ${b} est prêt. Au socle !`,
    h: 'Avant le grand pont, la stèle de cette île t’interroge sur le fossé têtu.',
    stoneWaits: 'La stèle attend ta réponse : la flèche jaune te guide.',
    boss: 'Voici le grand pont : 756 cases jusqu’au phare. Va au socle lumineux : dans la réserve, il n’y a que deux moules, 32 et 36.',
    bossFail: (b, r) => `Il reste ${cells(r)} : le moule ${b} ne remplit pas 756. Essaie l’autre moule.`,
    bossOk: '21 planches de 36 et aucune case vide. Le grand pont tient !',
    pay: 'C’est payé. Traverse jusqu’au phare !',
    fall: [
      'Oh ! L’air ne porte pas les robots.',
      'Atterrissage imprévu… Les nuages m’ont ramené.',
      'Pas encore de pont ici !',
    ],
    done: 'Le pont est prêt. Traverse !',
    end: 'Le phare brille de nouveau ! Merci.',
  },
  // Two SEPARATE results after a forge: the student's prediction (right or not), then what the mould does to the gap.
  // a bridge with a marked stretch: its label over the gap, the name of its sign
  mark: {
    label: (m, a) => `${counted(m, ['case éclairée', 'cases éclairées'])} sur ${a}`,
    sign: 'Panneau du pont',
    stretch: 'La partie éclairée',
  },
  verdict: {
    markMiss: (b, m) => `Le moule ${b} remplit le pont, mais aucune jointure à la case ${m} : le poteau ne tient pas`,
    purse: (laid, need) => `${planks(laid)} sur ${need} : plus de pièces avant que le pont soit plein`,
    right: (r) => (r === 0 ? 'Ta prédiction est juste : aucune case vide' : `Ta prédiction est juste : ${remain(r)}`),
    wrong: (p, r) => `Tu as prédit ${p}, et le reste est ${r}`,
    star: 'Étoile de prédiction',
    holds: (b, a) => `Le moule ${b} remplit exactement ${a} : le pont tient`,
    open: (b, a) => `Le moule ${b} ne remplit pas ${a} : le pont ne tient pas`,
  },
  predict: {
    title: (a, b) => `Des planches de ${b} sur un fossé de ${counted(a, CELLS)}`,
    ask: 'Combien de cases resteront vides au bout du pont ?',
    cancel: 'Je change de moule',
  },
  workshop: {
    title: 'L’atelier des moules',
    ask: 'Choisis la longueur du moule à fabriquer',
    make: 'Fabriquer le moule',
    close: 'Fermer',
    // the typed form (`workshop.typed`): he writes the length, in its own shape — a box and the printed unit
    typedAsk: 'Écris la longueur du moule à fabriquer',
    unit: 'cases',
    lengthLabel: 'Longueur du moule',
    // the gaps the plank must build (the whole convoy): « Le moule pour les fossés 32 et 44 »
    forGaps: (gaps) =>
      gaps.length === 1 ? `Le moule pour le fossé ${gaps[0]}` : `Le moule pour les fossés ${listFr(gaps)}`,
    empty: 'Écris d’abord la longueur du moule.',
    tooShort: 'Le moule le plus court fait 1 case.',
    tooLong: (b, max, n) =>
      n === 1
        ? `Un moule de ${b} est plus long que tout le fossé (${max}).`
        : `Un moule de ${b} est plus long que chaque fossé ici : le plus long fait ${max}.`,
    // the bench (`workshop.bench`): an experiment beside the workshop — it gives facts, never the plank to make
    bench: 'Le carnet des listes',
    benchSub: 'Ce que tu écris ici reste dans ton carnet',
    benchBack: 'Retour à l’atelier',
  },
  quiz: {
    check: 'Vérifier',
    back: 'Fermer la stèle',
    fits: (v, a, q) => `${v} remplit exactement ${a} : ${planks(q)}`,
    leaves: (v, a, q, r) => `$${a} = ${v} \\times ${q} + ${r}$ — ${remain(r)}`,
    missing: (n) =>
      n === 0
        ? 'Retire de ton choix ce qui ne remplit pas le fossé.'
        : n === 1
          ? 'Il manque encore un moule qui remplit le fossé : cherche-le.'
          : 'Il manque encore deux moules qui remplissent le fossé : cherche-les.',
    seven: {
      prompt: 'Le fossé têtu fait 7 cases. Quels moules le remplissent exactement ? Choisis tous ceux qui conviennent.',
      options: [1, 2, 3, 4, 5, 6, 7].map((n) => ({ v: n, label: String(n) })),
      answer: [1, 7],
      multi: true,
      a: 7,
      wrongGeneric:
        'Pas tout à fait. Essaie dans ta tête : combien de cases restent avec chaque moule choisi ? As-tu oublié un moule ?',
    },
  },
  statues: {
    title: 'Les quatre gardiens',
    fact: 'Le fait : des planches de 6 ont rempli un fossé de 120 cases avec 20 planches.',
    ask: 'Chaque gardien dit ce fait avec sa phrase. Touche une phrase pour échanger ses deux nombres, puis réveille-les.',
    go: 'Réveiller les gardiens',
    hint: {
      qasim: '« 120 est un diviseur de 6 »  ? Des planches de 120 remplissent-elles un fossé de 6 cases ?',
      yaqsim: '« 120 divise 6 »  ? Celui qui divise, c’est la longueur de la planche qui remplit le fossé.',
      yaqbal: '« 6 est divisible par 120 »  ? Divise 6 par 120 : le reste est-il 0 ?',
      mudaaf: '« 6 est un multiple de 120 »  ? Les multiples de 120 sont 120, 240, 360… 6 en fait-il partie ?',
    },
  },
  boss: {
    title: 'La réserve du grand pont',
    mission:
      'Ta mission : le fossé fait 756 cases. Choisis le moule qui le remplit exactement, construis le pont, puis paie ses planches.',
    steps: ['Choisis un moule et calcule', 'Construis le pont', 'Paie'],
    choose: 'Lequel des deux moules remplit exactement 756 cases ? Calcule dans ton cahier, puis choisis.',
    mould: (b) => `Planches de ${b}`,
    untried: 'Pas encore essayé',
    tried: (r) => `Essayé : ${cells(r)}`,
    // the store's planks refused for another reason: the purse ran out, or the post of a marked stretch missed a joint
    triedPurse: (laid, need) => `Plus de pièces : ${laid} sur ${need}`,
    triedMark: (r) => `Le poteau au milieu d’une planche (reste ${r})`,
    price: 'Prix d’une planche : 1 850 cristaux de lumière',
    divide: (b) => `Moule ${b} : combien de planches entrent dans 756 cases ? Combien de cases restent ?`,
    qLabel: 'Nombre de planches',
    rLabel: 'Cases restantes',
    forge: 'Construire et essayer',
    change: 'Je change de moule',
    close: 'Fermer',
    costAsk: (b, q) =>
      `Le pont tient : ${planks(q)} de ${b}. Une planche coûte 1 850 cristaux de lumière. Combien paies-tu à la réserve ?`,
    pay: 'Payer',
    err: {
      nan: 'Écris les deux nombres : le nombre de planches et les cases restantes.',
      long: (b, q) => `${planks(q)} de ${b}, cela fait ${counted(b * q, CELLS)} : plus long que le fossé (756) !`,
      sum: (b, q, r) => `Vérifie : $${b} \\times ${q} + ${r} = ${b * q + r}$, et le fossé fait 756 cases.`,
      big: (b, r) =>
        `Il reste ${counted(r, CELLS)} : il y a encore la place pour une planche de ${b}. Le reste doit être plus petit que ${b}.`,
      cost: (n) => `${n} n’est pas le prix. Calcule : nombre de planches × prix d’une planche.`,
    },
  },
  tablets: {
    'qasim-baqi': {
      icon: '🔑',
      title: 'Le diviseur par le reste',
      lines: [
        'Le pont tient quand il ne reste aucune case vide : le reste de la division euclidienne est 0.',
        'On dit alors que la longueur de la planche est un diviseur de la longueur du fossé.',
      ],
      math: ['42 = 6 \\times 7 + \\textcolor{#34d399}{0}', '42 = 5 \\times 8 + \\textcolor{#fb7185}{2}'],
      notes: ['6 est un diviseur de 42', '5 n’est pas un diviseur de 42'],
    },
    'qasim-jidaa': {
      icon: '🗝️',
      title: 'Le diviseur par le produit',
      lines: [
        'Quand on écrit un nombre comme le produit de deux nombres entiers, chacun d’eux est un diviseur de ce nombre.',
        '$b$ est un diviseur de $a$ signifie : il existe un nombre entier $q$ tel que $a = b \\times q$.',
      ],
      math: ['48 = 6 \\times 8 = 8 \\times 6'],
      notes: ['6 est un diviseur de 48, et 8 aussi'],
    },
    'siyagh-mutakafia': {
      icon: '🗣️',
      title: 'Quatre phrases, un seul sens',
      lines: ['Ces quatre phrases disent la même chose :'],
      list: ['6 est un diviseur de 120', '6 divise 120', '120 est divisible par 6', '120 est un multiple de 6'],
      math: ['120 = 6 \\times 20'],
      notes: ['Le diviseur est le plus petit, le multiple est le plus grand'],
    },
    'wahid-wa-nafsuh': {
      icon: '⭐',
      title: '1 et le nombre lui-même',
      lines: [
        'Le nombre 1 est un diviseur de tout nombre entier.',
        'Tout nombre entier non nul est un diviseur de lui-même.',
      ],
      math: ['7 = 1 \\times 7 = 7 \\times 1', '143 = 1 \\times 143'],
      notes: ['Un moule d’une case, un moule de la longueur du fossé : ils marchent toujours'],
    },
  },
  end: {
    title: 'Tu as rallumé le phare !',
    text: 'Tu as reconstruit tous les ponts et rassemblé les quatre clés.',
    stay: 'Je me promène dans l’archipel',
  },
};
