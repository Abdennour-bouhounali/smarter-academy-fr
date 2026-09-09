/**
 * Modèle mathématique de la leçon « Repérage sur une droite et dans le plan » (5e).
 *
 * ─── CE QUE CETTE LEÇON APPORTE, ET CE QU'ELLE NE REFAIT PAS ───────────
 * La leçon voisine `nombres-relatifs-5e` construit déjà le SIGNE : l'ascenseur
 * qui descend sous le sol, la droite graduée couchée, « pourquoi −2 est plus
 * grand que −7 ». Refaire ici « lire et placer un relatif sur une droite »
 * serait un doublon du même niveau.
 *
 * Cette leçon-ci part donc d'un autre manque : un seul nombre ne suffit pas à
 * DÉSIGNER UN ENDROIT. C'est pourquoi le module 1 n'enseigne pas l'abscisse —
 * il montre que deux lieux différents la partagent (`sharingAbscissa`), et
 * c'est ce constat qui appelle la deuxième dimension.
 *
 * ─── LE PÉRIMÈTRE EST EXÉCUTABLE ──────────────────────────────────────
 * Le référentiel 2026 exclut les coordonnées dans l'espace. `point()` lève
 * donc une exception sur une troisième composante : l'exclusion est du code,
 * pas un commentaire qu'on peut contourner sans s'en apercevoir.
 *
 * ─── LES QUADRANTS, HONNÊTEMENT ───────────────────────────────────────
 * `quadrantOf` ne renvoie JAMAIS un quadrant pour un point dont une
 * coordonnée est nulle : un tel point est SUR un axe, il n'est dans aucun
 * quadrant. C'est le cas-limite que les élèves rangent de force dans le
 * quadrant voisin, et le module 5 le traite pour cette raison.
 */

/* ── Périmètre (exécutable) ─────────────────────────────────────────── */

/**
 * Un point du plan. Deux composantes, jamais trois.
 *
 * Le référentiel 5e exclut explicitement les coordonnées dans l'espace : on
 * refuse ici, à la construction, plutôt que de laisser une leçon dériver.
 */
export function point(x, y, ...rest) {
  if (rest.length > 0) {
    throw new Error(
      'reperage-5e : hors périmètre — pas de coordonnées dans l’espace (exclusion du référentiel 2026).',
    );
  }
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error('reperage-5e : un point demande deux nombres finis.');
  }
  return { x, y };
}

/* ── Écriture française ─────────────────────────────────────────────── */

const MOINS = '−';        // U+2212, le vrai signe moins (pas le tiret ASCII)
const FINE = ' ';         // espace fine insécable, avant le point-virgule

/** « −3 », « 2,5 », « 0 » — l'écriture que l'élève voit à l'écran. */
export function formatAbscissa(a) {
  if (Object.is(a, -0) || a === 0) return '0';
  const abs = Math.abs(a);
  const txt = Number.isInteger(abs) ? String(abs) : String(abs).replace('.', ',');
  return a < 0 ? `${MOINS}${txt}` : txt;
}

/** « (−2 ; 5) » — point-virgule français, espaces fines, moins typographique. */
export function formatCoords(p) {
  return `(${formatAbscissa(p.x)}${FINE};${FINE}${formatAbscissa(p.y)})`;
}

/**
 * Lecture d'une saisie élève.
 *
 * `parseFr` du noyau est ENTIER seulement, et `parseDec` refuse le moins
 * typographique U+2212 — or c'est exactement ce que `formatAbscissa` affiche.
 * Un élève qui recopie ce qu'il voit à l'écran doit être compris.
 */
export function parseSigned(str) {
  if (typeof str === 'number') return Number.isFinite(str) ? str : NaN;
  if (typeof str !== 'string') return NaN;
  const cleaned = str
    .trim()
    .replace(/[\s  ]/g, '')
    .replace(/[−–—]/g, '-')   // moins, demi-cadratin, cadratin
    .replace(',', '.');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return NaN;
  return Number(cleaned);
}

/* ── Droite graduée : rappel, pas l'objet de la leçon ───────────────── */

/** Arrondit au pas de la graduation (1, 0,5 ou 2 selon le module). */
export function snapAbscissa(a, step = 1) {
  if (!Number.isFinite(a) || !(step > 0)) return NaN;
  // On repasse par un arrondi décimal : 0.1 + 0.2 ne doit pas produire 3,0000004.
  return Number((Math.round(a / step) * step).toFixed(6));
}

/* ── L'ambiguïté du module 1 ────────────────────────────────────────── */

/**
 * Tous les lieux qui partagent cette abscisse — la « colonne » du module 1.
 *
 * C'est le calcul qui fait le déclencheur : l'élève bouge un seul curseur, et
 * voit s'allumer PLUSIEURS lieux. Le manque est constaté, pas affirmé.
 */
export function sharingAbscissa(x, lieux = LIEUX) {
  return lieux.filter((l) => l.x === x);
}

/** Vrai quand un seul nombre ne suffit pas à désigner un lieu. */
export function isAmbiguous(x, lieux = LIEUX) {
  return sharingAbscissa(x, lieux).length >= 2;
}

/* ── Le plan : quadrants, couple ordonné ────────────────────────────── */

/**
 * Où se trouve le point : un quadrant, un axe, ou l'origine.
 *
 * Renvoie 1|2|3|4 pour les quadrants (sens usuel, anti-horaire depuis le
 * quart en haut à droite), et 'axe-x' | 'axe-y' | 'origine' pour les points
 * qu'AUCUN quadrant ne contient.
 */
export function quadrantOf(p) {
  const { x, y } = p;
  if (x === 0 && y === 0) return 'origine';
  if (y === 0) return 'axe-x';
  if (x === 0) return 'axe-y';
  if (x > 0 && y > 0) return 1;
  if (x < 0 && y > 0) return 2;
  if (x < 0 && y < 0) return 3;
  return 4;
}

const QUADRANT_TEXTE = {
  1: 'en haut à droite',
  2: 'en haut à gauche',
  3: 'en bas à gauche',
  4: 'en bas à droite',
  'axe-x': 'sur l’axe des abscisses',
  'axe-y': 'sur l’axe des ordonnées',
  origine: 'à l’origine',
};

/** La phrase française qui dit la même chose que le dessin. */
export function describeQuadrant(q) {
  return QUADRANT_TEXTE[q] ?? '';
}

/** Le couple de signes, tel qu'on le lit : { sx, sy } ∈ {'+', '−', '0'}. */
export function signsOf(p) {
  const s = (v) => (v === 0 ? '0' : v > 0 ? '+' : MOINS);
  return { sx: s(p.x), sy: s(p.y) };
}

export function samePoint(a, b, eps = 1e-9) {
  return Math.abs(a.x - b.x) <= eps && Math.abs(a.y - b.y) <= eps;
}

/** (x ; y) → (y ; x) : le piège du couple échangé. */
export function swap(p) {
  return { x: p.y, y: p.x };
}

/**
 * L'échange déplace-t-il réellement le point ?
 *
 * Faux exactement quand x === y — le point est alors sur la diagonale et le
 * fantôme se superpose. Le module 4 doit le DIRE dans ce cas au lieu de
 * prétendre que « les deux points sont différents » : un schéma ne contredit
 * jamais la leçon.
 */
export function swapLandsElsewhere(p) {
  return p.x !== p.y;
}

/* ── Données de la leçon : la carte du domaine ──────────────────────── */

/** La fenêtre du repère. Tout lieu et toute cible doit y tenir. */
export const DOMAINE = { xMin: -6, xMax: 6, yMin: -4, yMax: 4 };

/**
 * Les lieux du domaine skiable, le chalet d'accueil à l'origine.
 *
 * Contraintes tenues par les tests : les quatre quadrants sont représentés,
 * chaque axe porte au moins un lieu, et deux lieux au moins partagent une
 * abscisse (sinon le déclencheur du module 1 n'aurait rien à montrer).
 */
export const LIEUX = [
  { id: 'chalet', nom: 'Chalet d’accueil', emoji: '🏠', x: 0, y: 0 },
  { id: 'sommet', nom: 'Le Sommet', emoji: '⛰️', x: -3, y: 3 },
  { id: 'lac', nom: 'Lac gelé', emoji: '🧊', x: -3, y: -2 },
  { id: 'telesiege', nom: 'Télésiège', emoji: '🚡', x: 4, y: 2 },
  { id: 'parking', nom: 'Parking', emoji: '🅿️', x: 4, y: -3 },
  { id: 'refuge', nom: 'Refuge', emoji: '🛖', x: -5, y: 0 },
  { id: 'depart', nom: 'Départ des pistes', emoji: '⛷️', x: 0, y: 3 },
  { id: 'restaurant', nom: 'Restaurant', emoji: '🍽️', x: 2, y: -2 },
];

/**
 * La paire ambiguë du module 1 : même abscisse, ordonnées différentes.
 * Le Sommet (−3 ; 3) et le Lac gelé (−3 ; −2).
 */
export const AMBIGU = { x: -3, ids: ['sommet', 'lac'] };

/** Points-cibles des exercices de placement (modules 4 et 6). */
export const CIBLES = [
  { id: 'c1', p: { x: -2, y: 3 }, indice: 'Deux à gauche, trois en haut.' },
  { id: 'c2', p: { x: 5, y: -1 }, indice: 'Cinq à droite, un en bas.' },
  { id: 'c3', p: { x: -4, y: -3 }, indice: 'Les deux nombres sont négatifs.' },
  { id: 'c4', p: { x: 3, y: 3 }, indice: 'Les deux nombres sont égaux.' },
];

/** Retrouve un lieu par son id — jamais un couple écrit en dur dans un module. */
export function lieuById(id) {
  const l = LIEUX.find((x) => x.id === id);
  if (!l) throw new Error(`reperage-5e : lieu inconnu « ${id} »`);
  return l;
}

/** Le point d'un lieu, sous la forme attendue par CoordPlane. */
export function lieuPoint(id) {
  const l = lieuById(id);
  return point(l.x, l.y);
}

/** Vrai si le point tient dans la fenêtre du repère (garde de cadrage). */
export function inDomaine(p, d = DOMAINE) {
  return p.x >= d.xMin && p.x <= d.xMax && p.y >= d.yMin && p.y <= d.yMax;
}
