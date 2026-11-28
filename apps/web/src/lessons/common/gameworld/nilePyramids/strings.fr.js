/**
 * « Les pyramides » — EVERY word the world shows, in FRENCH (it names no lesson: a lesson's story overrides or adds
 * through `story.text`). The world is ONE code for two countries: `strings.js` re-exports the country's file — this one
 * in France, `strings.ar.js` (the same keys) in Algeria — and nothing visible, no screen-reader label and no text
 * direction is written anywhere else in the folder. Every sentence about what the world built is a FACT, never « faux »,
 * and none writes the size of a gap (gate P1). No dock name and no experiment sentence names a rule before its tablet.
 * Written from each sentence's job, never word for word; the typography of `FRENCH_LANGUAGE_CONTRACT.md` §4: a no-break
 * space before « : », a narrow one before « ; ! ? », a no-break space between a number and « m ».
 */

/** The direction of the world's sentences (read by every screen that sets `dir`). */
export const DIR = 'ltr';

/** A length in a sentence: the decimal comma. */
const dec = (n) => String(n).replace('.', ',');
/** A length inside a formula: the decimal comma in LaTeX. */
const tex = (n) => String(n).replace(/[.,]/, '{,}');

export const WORLD_TEXT = {
  title: 'Les pyramides',
  subtitle:
    'Au bord du Nil, des embarcadères t’attendent. Ce que la corde à nœuds atteint, tu le mesures ; le reste, tu le calcules, et le monde construit ton nombre.',
  turn: { body: 'Tourne ton téléphone pour jouer.' },
  end: {
    title: 'Tu es au dernier embarcadère',
    text: 'Ce monde est une première version : ses étapes arrivent les unes après les autres.',
    stay: 'Je me promène au bord du Nil',
  },
  /** The five docks, in the order of play. No name says a rule. */
  docks: [
    'Le champ du Nil',
    'Le chantier des bâtisseurs',
    'La largeur du Nil',
    'Le pyramidion',
    'L’ombre de la grande pyramide',
  ],
  unit: 'm',
  hud: {
    rope: 'La corde à nœuds',
    knots: (n) => `${dec(n)} m`,
    drop: 'Lâcher la corde',
    register: 'Le carnet de terrain',
    record: 'Le carnet des arpenteurs',
    plan: 'Le plan des bâtisseurs',
    reads: 'La corde indique',
    typed: 'Tu as écrit',
    back: 'Revenir à Zéro',
    top: 'Vue de dessus',
    topBack: 'Revenir à Zéro',
  },
  held: (n) => `Corde : ${dec(n)} m`,
  prompt: {
    take: (p) => `Prends le bout de la corde au piquet ${p}`,
    drop: 'Lâche la corde',
    predict: 'Écris la longueur du canal',
    order: 'Commande une assise à la carrière',
    board: (name) => `Embarque sur la felouque pour « ${name} »`,
    look: 'Regarde toute l’étape',
  },
  objective: {
    slide: (from, line, stake) =>
      `Mesure à la corde, du piquet $${from}$ le long de $${line}$ jusqu’au piquet $${stake}$ : appuie sur E en $${from}$, puis sur les flèches jusqu’à ce que la corde atteigne $${stake}$, et lâche-la.`,
    canal: (from, to) =>
      `Tends la corde le long du canal, du piquet $${from}$ au piquet $${to}$ : appuie sur E en $${from}$, la corde indique sa longueur.`,
    predict: (seg) =>
      `Les bâtisseurs doivent paver le canal avant le retour de l’eau. Écris la longueur $${seg}$ avant que la corde la mesure : appuie sur E au piquet $${seg[0]}$.`,
    edge: (from, stake) =>
      `Mesure à la corde l’arête de la pyramide, du coin $${from}$ jusqu’à la dernière assise posée, au repère $${stake}$ : la corde ne suit que ce qui est construit.`,
    course: (seg) =>
      `L’assise du repère $${seg[0]}$ n’est pas encore posée : aucune corde ne la mesure. Calcule sa longueur $${seg}$ et commande-la à la carrière, au coin $B$.`,
    look: 'Depuis l’embarcadère, tu vois toute l’étape : appuie sur E à l’embarcadère.',
    board: (name) => `Cette étape est terminée. Embarque sur la felouque, à l’embarcadère, pour « ${name} ».`,
    later: 'Cette étape sera construite plus tard. Embarque sur la felouque, à l’embarcadère, pour l’étape suivante.',
    end: 'Tu es au dernier embarcadère de cette version du monde.',
  },
  order: {
    canal: {
      title: 'Avant la mesure',
      ask: (seg) =>
        `Quelle longueur prévois-tu pour le canal $${seg}$ ? Écris ton estimation à partir de ce que tu as mesuré : elle n’est pas notée, la corde lit ensuite la vraie longueur.`,
      send: 'Envoyer aux bâtisseurs',
    },
    course: {
      title: 'Commande à la carrière',
      ask: (seg) =>
        `Quelle longueur pour l’assise $${seg}$ ? La carrière la taille, les bâtisseurs la posent à sa hauteur.`,
      send: 'Tailler et hisser',
    },
    later: 'Plus tard',
    refused: {
      empty: 'Écris une longueur : des chiffres, et une virgule au plus.',
      out: 'Ce repère est en dehors de l’arête.',
    },
  },
  /** The three facts of each order (`orders.js › FACTS`): what the world did, with no size. */
  fact: {
    as: 'La corde indique ce que tu as écrit.',
    longer: 'Le canal est plus long que ce que tu as écrit.',
    shorter: 'Le canal est plus court que ce que tu as écrit.',
    fits: 'L’assise touche les deux arêtes.',
    gap: 'Il reste un vide aux deux coins.',
    overhang: 'L’assise dépasse des deux arêtes.',
    ties: 'La corde s’attache au poteau d’en face.',
    short: 'La corde tombe dans l’eau avant le poteau.',
    slack: 'La corde pend dans l’eau.',
    apex: 'Zéro est au sommet.',
    below: 'Zéro est sous le sommet.',
    above: 'Zéro est au-dessus du sommet.',
  },
  say: {
    tied: (seg, n) => `$${seg} = ${tex(n)}$ m. Je l’ai noté dans le carnet de terrain.`,
    built: 'Les bâtisseurs posent l’assise.',
    star: 'Ta prédiction a vu juste du premier coup.',
    water: 'Ici, c’est l’eau : la corde ne la traverse pas, et tu n’y marches pas.',
    sail: 'La felouque part vers l’embarcadère suivant.',
  },
  recall: { title: 'De l’embarcadère précédent' },
  /**
   * A palier of the practice space, sailed on the river (`practice.js`): the run's cards (`kit/GateRunHud.jsx ›
   * content.text`); the palier's name is its title. Never a rule, never « faux »: a buoy that was not the one shows a fact.
   */
  practice: {
    title: 'Une sortie d’entraînement sur le Nil',
    say: 'Chaque bouée porte un nombre : passe par celle qui porte la réponse.',
    rule: 'Choisis ta bouée avec les flèches ← →, et évite le crocodile. Tu as trois cœurs.',
    start: 'En route',
    again: 'Refaire la sortie',
    leave: 'Retour à la carte',
    order: 'Passe par la bouée qui porte la réponse',
    gate: 'Bouée',
    of: 'sur',
    pause: 'Pause',
    resume: 'Reprendre',
    quit: 'Quitter',
    pausedTitle: 'La felouque est à l’arrêt',
    pausedText: 'Les bouées t’attendent là où tu les as laissées. Appuie sur « Reprendre » ou sur la barre d’espace.',
    left: 'Gauche',
    right: 'Droite',
    bump: 'Le crocodile ! Tu perds un cœur.',
    won: { title: 'Sortie terminée', text: 'Retourne à la carte pour voir tes étoiles.' },
    lost: { title: 'Plus de cœurs', text: 'Recommence la sortie depuis le début.' },
  },
  /** Stages 2–5: their instructions, prompts, orders and facts. */
  stage: {
    objective: {
      mark: (row) =>
        `Une rangée de ${dec(row)} m est déjà taillée. Où la poser sur l’arête ? Écris le repère $BM$ : les bâtisseurs construisent jusqu’à ton repère. Appuie sur E au coin $B$.`,
      bankStart:
        'Mesure à la corde, le long de la rive, du piquet $A$ jusqu’au vieux piquet $S$ : appuie sur E en $A$, puis sur les flèches.',
      plan: 'Il reste un piquet à planter dans les terres. Va au piquet $E$ et ouvre le plan du géomètre.',
      ferry:
        'La corde du bac se coupe avant la traversée. Ouvre le plan au piquet $A$ et écris la longueur $AF$ : la corde est lancée jusqu’au poteau $F$.',
      ferryAgain:
        'Ta première corde ne s’est pas attachée au poteau. Ouvre le plan au piquet $A$ et coupe une nouvelle corde : écris la longueur $AF$.',
      climb: 'Le pyramidion attend. Monte au sommet : appuie sur E au pied de la rampe.',
      capstone:
        'Le pyramidion est une petite pyramide de la même forme. Écris un seul nombre pour le tailleur de pierre : chaque longueur × [ ]. Appuie sur E au sommet.',
      stick: 'Mesure à la corde l’ombre du bâton, de son pied $M$ jusqu’au bout de l’ombre : appuie sur E au bâton.',
      shadow:
        'Mesure l’ombre de la pyramide, du milieu $H$ du bord de la base jusqu’à son bout $A$ : appuie sur E en $H$.',
      base: 'Mesure le côté de la base, du coin $D$ au coin $G$ : appuie sur E en $D$.',
      slideStick:
        'Prends le triangle du bâton, tracé sur l’axe de l’ombre, et fais-le glisser jusqu’à ce que le bout de son ombre tombe sur $A$ : appuie sur E au triangle, puis sur les flèches.',
      mission:
        'Les deux triangles sont maintenant l’un dans l’autre. Ouvre la carte de mission en $A$ : quelle est la hauteur de la pyramide ?',
      noon: 'À midi, l’ombre ne sort plus de la base. Vérifie la hauteur avec la chambre noire d’Ibn al-Haytham : appuie sur E près de la chambre.',
      forge: 'Forge ta clé : appuie sur E à la table des bâtisseurs.',
      end: 'Tu as mesuré la grande pyramide sans l’escalader, de deux façons.',
    },
    prompt: {
      mark: 'Écris le repère de la rangée',
      ferry: 'Coupe la corde du bac',
      plan: 'Ouvre le plan du géomètre',
      climb: 'Monte au sommet',
      capstone: 'Écris la commande du pyramidion',
      stick: 'Prends le triangle du bâton',
      mission: 'Ouvre la carte de mission',
      box: 'Ouvre la chambre noire d’Ibn al-Haytham',
      forge: 'Va à la table des bâtisseurs',
      rope: 'Prends le bout de la corde',
    },
    order: {
      mark: {
        title: 'Une rangée prête',
        ask: (row) => `Une rangée de ${dec(row)} m. À quel repère la poser ?`,
        seg: 'BM',
        send: 'Construisez jusqu’à mon repère',
      },
      ferry: {
        title: 'La corde du bac',
        ask: () => 'Quelle longueur de corde de $A$ jusqu’au poteau $F$ ?',
        seg: 'AF',
        send: 'Couper et lancer',
      },
      capstone: {
        title: 'La commande du tailleur',
        ask: () => 'Chaque longueur de la grande pyramide × le nombre que tu écris = une longueur du pyramidion.',
        seg: 'k',
        send: 'Sculpter et hisser',
      },
    },
    fact: {
      sits: 'Le pyramidion se pose sur le sommet.',
      small: 'Le pyramidion est plus petit que le sommet : une marche reste autour.',
      big: 'Le pyramidion est plus grand que le sommet : il dépasse de ses bords.',
      quarry: (b) => `Commande de la carrière : une base de ${dec(b)} m — elle ne tient pas dans la cour.`,
      markFits: 'À ton repère, la rangée touche les deux arêtes.',
      markGap: 'À ton repère, il reste un vide aux deux coins autour de la rangée.',
      markOver: 'À ton repère, la rangée dépasse des deux arêtes.',
      meet: 'Les bouts des deux ombres se rejoignent en $A$.',
    },
    /** The geometer's plan of the river (`RiverPlan.jsx`): facts and directions, never a rule. */
    riverPlan: {
      title: 'Le plan du géomètre',
      aria: 'Le fleuve vu de dessus : le poteau F sur l’autre rive, les piquets A, S et E sur la rive, le piquet R dans les terres',
      place:
        'Une ficelle part du piquet $R$, passe sur le piquet $S$ et traverse le fleuve. Déplace $R$ jusqu’à ce que la ficelle arrive sur le poteau $F$.',
      hint: 'Le piquet $R$ se déplace sur la ligne tracée depuis $E$, mètre par mètre.',
      fact: {
        left: 'La ficelle touche l’autre rive à gauche du poteau $F$.',
        right: 'La ficelle touche l’autre rive à droite du poteau $F$.',
      },
      nearer: 'Vers le fleuve',
      further: 'Vers les terres',
      set: 'Planter le piquet R',
      planted: 'Le piquet $R$ est planté : la ficelle passe sur $S$ et arrive sur le poteau $F$.',
      rope: 'La corde du bac ira du piquet $A$ au poteau $F$. Quelle longueur couper ?',
      send: 'Couper et lancer',
      last: (n) => `Tu as lancé ${dec(n)} m.`,
      note: 'Sur ce plan, le fleuve est dessiné moins large qu’il ne l’est.',
      farBank: 'l’autre rive',
      river: 'le Nil',
      nearBank: 'la rive des bâtisseurs',
    },
    card: {
      check: 'Vérifier',
      later: 'Plus tard',
      notToScale: 'Figure non à l’échelle.',
    },
    hud: { triangle: 'Le triangle du bâton, tracé au sol' },
    say: {
      built: 'Les bâtisseurs construisent jusqu’au repère.',
      thrown: 'La corde est lancée au-dessus de l’eau.',
      carved: 'Le tailleur hisse le pyramidion au sommet.',
      rise: 'Zéro monte le long de l’axe de la pyramide, jusqu’à la hauteur que tu as écrite.',
      noon: 'Le soleil est maintenant au plus haut.',
      climbed: 'Tu es au sommet.',
    },
  },
};

/**
 * The words of the three experiments (« Explore ») — facts only: no sentence names the rule, and a miss is answered
 * by the kit's « Ta prédiction n’a pas vu juste cette fois. » followed by a fact. A lesson's `inquiry.text` overrides
 * any of them.
 */
export const KIND_TEXT = {
  plan: {
    lead: 'Une longueur de la figure est inconnue. Choisis deux cartes, mets deux cordes bout à bout ou coupe un morceau s’il le faut, puis écris la longueur.',
    cards: 'Les cartes des rapports',
    twoUnknown: 'Un rapport avec deux longueurs inconnues.',
    tools: 'La corde',
    typeIt: (seg) => `Écris $${seg}$`,
    lay: 'Poser l’assise',
    next: 'Suivant',
    again: 'Commander une autre assise',
    unit: 'm',
    fact: {
      fits: 'L’assise touche les deux arêtes.',
      gap: (d) => `Il reste un vide aux deux coins : $${d}$ m manquent à l’assise.`,
      overhang: (d) => `L’assise dépasse des deux arêtes : $${d}$ m de trop.`,
    },
    /**
     * A length on a line THROUGH the vertex of a butterfly (`plan.js › laidOn`): his number is a rope stretched from the
     * vertex along its line — it reaches the point, stops short of it, or passes it; the size written.
     */
    line: {
      fits: 'La corde tendue depuis le sommet atteint exactement le point.',
      gap: (d) => `La corde tendue depuis le sommet s’arrête avant le point : $${d}$ m manquent.`,
      overhang: (d) => `La corde tendue depuis le sommet dépasse le point : $${d}$ m de trop.`,
    },
  },
  halfturn: {
    lead: 'Le petit triangle est de l’autre côté du sommet. Fais-le tourner d’un demi-tour autour du sommet.',
    ask: (m) => `Avant de tourner : sur quelle droite arrive le point $${m}$ après un demi-tour ?`,
    line: (v, x) => `La droite $(${v}${x})$`,
    turn: 'Tourne avec les flèches ← →',
    landed: (m, v, b) => `$${m}$ arrive sur la droite $(${v}${b})$.`,
    miss: 'Ta prédiction n’a pas vu juste cette fois.',
    hit: 'Comme tu l’avais dit.',
    next: 'Suivant',
    /** Before the chain rewritten in the butterfly's own letters (shown only when the inquiry says `chainOwn: true`). */
    chainOwn: 'Avec les lettres de la première figure :',
  },
  scale: {
    lead: 'La machine à copier est fixée au sommet : elle copie le triangle et multiplie chaque côté par le nombre écrit sur son cadran.',
    dial: 'Le cadran',
    ask: (t) => `Avant de copier : comment sera la copie, comparée au triangle $${t}$ ?`,
    say: { larger: 'Plus grande que lui', exact: 'Exactement de sa taille', smaller: 'Plus petite que lui' },
    setK: (t) => `Écris sur le cadran le nombre qui donne exactement le triangle $${t}$.`,
    perimeterAsk: 'Quel est le périmètre de la copie ?',
    perimeter: { times: 'Le périmètre × k', plus: 'Le périmètre + k', times3: 'Le périmètre × 3k' },
    image: {
      outside: 'La copie dépasse de l’autre triangle.',
      exact: 'La copie recouvre exactement l’autre triangle.',
      inside: 'La copie est à l’intérieur de l’autre triangle.',
    },
    copySides: 'Les côtés de la copie',
    copyPerimeter: 'Le périmètre de la copie',
    miss: 'Ta prédiction n’a pas vu juste cette fois.',
    hit: 'Comme tu l’avais dit.',
    copy: 'Copier',
    next: 'Suivant',
    again: 'Essaie un autre nombre',
    fact: 'Le pyramidion : voici ce qu’a fabriqué la machine à copier.',
  },
};

/** The wording the world gives the forges by default (`ruleForge.js`) — a lesson's forge overrides what its rule changes. */
export const THALES_TEXT = {
  title: 'La table des bâtisseurs',
  sub: 'Forge ta clé : une règle qui tient face au miroir.',
  log: 'Ce que tu as mesuré et ce qui a été construit',
  next: 'Un autre cas',
  testing: 'Le miroir passe tes cas en revue, un par un…',
  agreed:
    'Ta règle s’accorde avec tous les cas que tu as vus. Maintenant, le miroir la met au défi avec un nouveau cas.',
  fire: 'Construire le cas',
  survived: 'Ta règle a tenu face à ce cas.',
  wordsHint: 'Dis ta règle avec tes mots…',
  aligned: 'Les trois repères sont sur une même ligne.',
  apart: 'Les trois repères ne sont pas sur une même ligne.',
  gauge: 'Les côtés, deux à deux : un côté du petit triangle sur un côté du grand.',
  gaugeTurn: 'Les trois côtés du grand triangle sont ramenés à la même longueur.',
  mirrored: 'Construit par le miroir',
};

/** What a screen reader says of a drawn figure (`figure.js`, `InquiryHalfturn.jsx`, `InquiryScale.jsx`). */
export const FIGURE_TEXT = {
  butterfly: (V) => `Deux triangles opposés par le sommet ${V}`,
  nested: (V, B, C, M, N) => `Triangle ${V}${B}${C} et segment [${M}${N}]`,
  pair: (V) => `Deux triangles de sommet ${V}`,
};
