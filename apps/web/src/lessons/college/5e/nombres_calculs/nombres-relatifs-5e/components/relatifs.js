/**
 * Noyau numérique de la leçon « Nombres relatifs » (5e).
 *
 * Tout ce qui est vrai mathématiquement vit ici et nulle part ailleurs : les
 * modules affichent, ce fichier calcule. Ce qui rend les affirmations de la
 * leçon vérifiables par un test plutôt que par relecture.
 *
 * PÉRIMÈTRE 5e — somme et différence seulement. Ni produit, ni quotient, ni
 * règle des signes : objets officiels de 4e (voir lesson.config.js).
 */

/** Écriture française d'un relatif : signe explicite pour les négatifs. */
export const fmt = (n) => (n < 0 ? `−${Math.abs(n)}` : `${n}`);

/** Écriture d'un relatif entre parenthèses, comme dans « 3 + (−5) ». */
export const fmtParen = (n) => (n < 0 ? `(−${Math.abs(n)})` : `(+${n})`);

/**
 * L'opposé : même distance à zéro, de l'autre côté.
 *
 * Le `+ 0` n'est pas décoratif : en JavaScript `-0` existe et vaut `0` au sens
 * de `===`, mais s'affiche « -0 ». L'opposé de zéro est zéro, et l'élève ne
 * doit jamais lire « −0 » sur la droite graduée.
 */
export const oppose = (n) => -n + 0;

/** Distance à zéro (valeur absolue) — toujours positive ou nulle. */
export const distanceAZero = (n) => Math.abs(n);

/** Écart entre deux relatifs : la distance qui les sépare sur la droite. */
export const ecart = (a, b) => Math.abs(a - b);

/** Le signe comme CÔTÉ de zéro, jamais comme opération. */
export const cote = (n) => (n > 0 ? 'positif' : n < 0 ? 'negatif' : 'zero');

export const COTE_LABEL = {
  positif: 'positif — au-dessus de zéro',
  negatif: 'négatif — au-dessous de zéro',
  zero: 'ni positif ni négatif — c’est zéro',
};

/**
 * Comparaison de deux relatifs. L'ordre est celui de la droite graduée : le
 * plus grand est le plus à droite, ce qui est exactement le piège que la
 * leçon vise (−2 > −7 alors que 2 < 7).
 */
export const compare = (a, b) => (a === b ? 0 : a > b ? 1 : -1);

/** Range une liste de relatifs dans l'ordre croissant. */
export const ranger = (xs) => [...xs].sort((a, b) => a - b);

/**
 * Additionner, c'est SE DÉPLACER depuis `depart` : le signe du nombre ajouté
 * donne le sens du déplacement, sa distance à zéro donne la longueur.
 */
export const ajouter = (depart, pas) => depart + pas;

/**
 * Soustraire, c'est faire le déplacement INVERSE : retirer `pas`, c'est
 * ajouter son opposé. Le résultat est identique — c'est ce que le module 5
 * fait constater plutôt que de l'énoncer.
 */
export const soustraire = (depart, pas) => depart - pas;

/** Vérifie l'équivalence a − b = a + (−b) pour un couple donné. */
export const memeResultat = (a, b) => soustraire(a, b) === ajouter(a, oppose(b));

/** Sens du déplacement produit par l'ajout de `pas`. */
export const sensDeplacement = (pas) =>
  pas > 0 ? 'droite' : pas < 0 ? 'gauche' : 'surplace';

export const SENS_LABEL = {
  droite: 'vers la droite',
  gauche: 'vers la gauche',
  surplace: 'sur place',
};

/**
 * Diagnostic d'une position visée mais manquée, sur la droite graduée.
 * Nomme l'erreur plutôt que de dire « faux » (§ retour ciblé).
 */
export const diagnostiquerPosition = (vise, obtenu) => {
  if (obtenu === vise) return 'ok';
  if (obtenu === -vise) return 'signe';           // bon écart, mauvais côté de zéro
  if (Math.sign(obtenu) !== Math.sign(vise) && vise !== 0) return 'cote';
  return obtenu > vise ? 'trop-a-droite' : 'trop-a-gauche';
};

export const DIAGNOSTIC_TEXT = {
  signe: 'La distance à zéro est la bonne, mais tu es du mauvais côté de zéro.',
  cote: 'Regarde le signe : il dit de quel côté de zéro se trouve le nombre.',
  'trop-a-droite': 'Tu es allé trop loin vers la droite.',
  'trop-a-gauche': 'Tu es allé trop loin vers la gauche.',
};

/** Le scénario de l'ascenseur — l'objet du module 1. */
export const IMMEUBLE = {
  min: -3,
  max: 5,
  sol: 0,
  /** Étages qui portent un nom dans l'histoire, pour ancrer le zéro. */
  reperes: {
    5: 'Terrasse',
    3: 'Bureaux',
    0: 'Rez-de-chaussée',
    '-1': 'Parking niveau 1',
    '-3': 'Local technique',
  },
};

/** Relevé de températures — module 6. Données d'une station de montagne. */
export const RELEVE = [
  { jour: 'Lundi', min: -7, max: -2 },
  { jour: 'Mardi', min: -4, max: 3 },
  { jour: 'Mercredi', min: -11, max: -5 },
  { jour: 'Jeudi', min: -1, max: 6 },
  { jour: 'Vendredi', min: -9, max: 0 },
];

/** Amplitude d'une journée : l'écart entre le minimum et le maximum. */
export const amplitude = (jour) => ecart(jour.min, jour.max);

/** Le jour le plus froid du relevé, au minimum atteint. */
export const jourLePlusFroid = (releve = RELEVE) =>
  releve.reduce((a, b) => (b.min < a.min ? b : a));

/**
 * Lecture d'une saisie élève représentant un nombre RELATIF entier.
 *
 * Le `parseFr` du kit refuse tout signe (`^\d+$` → NaN sur « −5 »), et le
 * `parseDec` du cœur n'accepte que le trait d'union ASCII `-`. Or cette leçon
 * affiche partout le vrai signe moins « − » (U+2212) : un élève qui recopie ce
 * qu'il voit à l'écran serait compté faux. On accepte donc les deux signes,
 * ainsi que le moins Unicode long, et on tolère les espaces.
 *
 * À passer explicitement à <NumericQuestion parse={parseRelatif} />.
 */
export const parseRelatif = (str) => {
  if (typeof str === 'number') return Math.trunc(str);
  if (typeof str !== 'string') return NaN;
  const cleaned = str
    .replace(/[\s  ]/g, '')
    .replace(/[−–—]/g, '-');   // − – — → -
  if (!/^[+-]?\d+$/.test(cleaned)) return NaN;
  return parseInt(cleaned, 10) + 0;           // + 0 : jamais de -0 affiché
};
