/**
 * Le moteur de tracé — source de vérité unique de la leçon « Algorithmique et
 * programmation » (5e).
 *
 * ─── CE QUE LA 5e AJOUTE À LA 6e ───────────────────────────────────────
 * La 6e déplaçait un robot de case en case (`algoUtils.js`) : le monde y était
 * un quadrillage, et le programme une suite d'AVANCER/TOURNER sans nombre.
 * Le programme officiel de 5e (objet « algorithmique_programmation ») ajoute
 * exactement trois choses :
 *     include — « Définir et utiliser des variables (lecture) »,
 *               « Boucles inconditionnelles (répéter n fois) »,
 *               « Tracer des figures simples ».
 *     exclude — « Conditions composées ».
 * D'où les trois écarts de ce moteur, et aucun autre :
 *   1. les instructions PORTENT UN NOMBRE (avancer de 60, tourner de 90°) ;
 *   2. ce nombre peut être une VARIABLE ou une FORMULE lue dans l'environnement ;
 *   3. le stylo laisse une TRACE : le programme produit une figure.
 *
 * ─── AUCUNE CONDITION, PAR CONSTRUCTION ────────────────────────────────
 * `KINDS` est clos et ne contient ni SI, ni TANT QUE : l'exclusion officielle
 * n'est pas une consigne d'auteur, c'est l'absence de la structure. Une seule
 * profondeur de RÉPÉTER (`makeRepeat` aplatit) — l'imbrication reste 4e/3e.
 *
 * ─── ÉTAT CANONIQUE ────────────────────────────────────────────────────
 *     { x, y, cap }   x, y en pas de stylo ; cap en DEGRÉS, mesuré depuis
 *                     l'Est, positif dans le sens direct (anti-horaire).
 * Tout le reste — segments, cadre, longueur totale, fermeture de la figure —
 * en est DÉRIVÉ. Rien d'autre n'est stocké.
 *
 * ─── POURQUOI LE CAP EST UN ANGLE, PAS UN INDICE ───────────────────────
 * En 6e le cap valait 0..3 (mod 4) : quatre directions suffisaient. Ici, le
 * cœur mathématique de la leçon est qu'un polygone régulier à n côtés se trace
 * avec n tours de boucle et un angle de 360 ÷ n. Cela EXIGE que le cap soit un
 * angle réel : `tourner(cap, 360/5)` doit donner 72°, pas « un quart de tour ».
 * La somme des rotations d'un tour complet vaut 360° — c'est ce que l'élève
 * découvre au module 5, et c'est du programme de 5e (angles, somme).
 *
 * ─── CONVENTION D'ORIENTATION (à respecter partout) ────────────────────
 * y croît vers le HAUT pour l'élève, comme sur un repère ; en SVG, y croît
 * vers le BAS. L'inversion n'a lieu QUE dans `toSvg` — aucun composant ne la
 * refait à la main (bug classique inter-composants, playbook §4).
 */

/* ══ Trigonométrie de service ═════════════════════════════════════════ */

/** Degrés → radians. Interne : rien au-dessus ne manipule des radians. */
const rad = (deg) => (deg * Math.PI) / 180;

/** Cap ramené dans [0, 360[ — JS : -90 % 360 === -90. */
export const mod360 = (a) => ((a % 360) + 360) % 360;

/**
 * Arrondi d'affichage et de comparaison, à 1/1000 de pas.
 * Le tracé passe par des cosinus : sans cela, un pentagone « fermé » se
 * refermerait à 1e-15 près et `estFermee` deviendrait un piège à virgule.
 */
export const arrondi = (v) => Math.round(v * 1000) / 1000;

/* ══ Les instructions ═════════════════════════════════════════════════ */

/**
 * Jeu d'instructions CLOS. Pas de SI, pas de TANT QUE : le périmètre officiel
 * de 5e est porté par cette constante, pas par une recommandation.
 */
export const KINDS = ['AVANCER', 'TOURNER', 'LEVER', 'BAISSER', 'REPETER'];

export const INSTRUCTION_LABELS = {
  AVANCER: { label: 'AVANCER', icon: '➡', aria: 'avancer' },
  TOURNER: { label: 'TOURNER', icon: '↻', aria: 'tourner à droite de' },
  LEVER: { label: 'LEVER LE STYLO', icon: '✋', aria: 'lever le stylo' },
  BAISSER: { label: 'BAISSER LE STYLO', icon: '✍', aria: 'baisser le stylo' },
  REPETER: { label: 'RÉPÉTER', icon: '🔁', aria: 'répéter un bloc' },
};

/** AVANCER d'une valeur — nombre, nom de variable, ou formule (voir plus bas). */
export const avancer = (valeur) => ({ kind: 'AVANCER', valeur });
/** TOURNER d'un angle en degrés, dans le sens des aiguilles d'une montre. */
export const tourner = (valeur) => ({ kind: 'TOURNER', valeur });
export const lever = () => ({ kind: 'LEVER' });
export const baisser = () => ({ kind: 'BAISSER' });

/**
 * Construit un bloc RÉPÉTER. Le corps est APLATI d'un éventuel RÉPÉTER :
 * l'imbrication est hors programme en 5e, la structure l'interdit donc.
 * `fois` peut lui-même être une variable — c'est la boucle « répéter n fois »
 * du programme, où n est lu et non écrit en dur.
 */
export function makeRepeat(fois, corps) {
  const plat = (corps || []).filter((b) => b && b.kind !== 'REPETER');
  return { kind: 'REPETER', fois, corps: plat };
}

/** Un programme respecte-t-il le périmètre (aucune imbrication) ? */
export const estPlat = (programme) =>
  (programme || []).every((i) => i.kind !== 'REPETER' || (i.corps || []).every((b) => b.kind !== 'REPETER'));

/* ══ Les valeurs : nombre, variable, formule ══════════════════════════ */

/**
 * Une VALEUR d'instruction est l'un de ces trois objets — et c'est ici que vit
 * « définir et utiliser des variables (lecture) » :
 *
 *   42                      un nombre écrit en dur
 *   { lire: 'cote' }        la LECTURE d'une variable de l'environnement
 *   { lire: 'cote', fois: 2, plus: 10 }   une FORMULE : cote × 2 + 10
 *
 * La formule est volontairement pauvre — un produit et une somme, dans cet
 * ordre — parce que le programme de 5e demande « produire une formule », pas
 * un interpréteur d'expressions. `evalValeur` est donc totale : elle ne peut
 * ni lever, ni boucler, ni dépendre d'un ordre d'évaluation subtil.
 */
export const lit = (nom) => ({ lire: nom });
export const formule = (nom, { fois = 1, plus = 0 } = {}) => ({ lire: nom, fois, plus });

/** Est-ce une lecture de variable (par opposition à un nombre écrit en dur) ? */
export const estLecture = (valeur) => !!valeur && typeof valeur === 'object' && typeof valeur.lire === 'string';

/**
 * Évalue une valeur dans un environnement `{ nom: nombre }`.
 * Une variable absente vaut 0 : le programme continue et la figure montre le
 * problème (un segment de longueur nulle), au lieu de planter — la conséquence
 * se voit, elle ne s'écrit pas dans un message d'erreur (playbook §8).
 */
export function evalValeur(valeur, env = {}) {
  if (!estLecture(valeur)) return Number(valeur) || 0;
  const base = Number(env[valeur.lire]) || 0;
  return base * (valeur.fois ?? 1) + (valeur.plus ?? 0);
}

/** « côté », « côté × 2 + 10 », « 90 » — l'écriture affichée d'une valeur. */
export function ecrireValeur(valeur) {
  if (!estLecture(valeur)) return String(valeur);
  const { lire, fois = 1, plus = 0 } = valeur;
  let s = lire;
  if (fois !== 1) s = `${s} × ${fois}`;
  if (plus > 0) s = `${s} + ${plus}`;
  if (plus < 0) s = `${s} − ${Math.abs(plus)}`;
  return s;
}

/* ══ Le déroulement ═══════════════════════════════════════════════════ */

/**
 * Déroule le programme en la LISTE DES INSTRUCTIONS RÉELLEMENT EXÉCUTÉES.
 *
 * C'est la fonction qui porte la pédagogie du module 4 : `RÉPÉTER 4 [AVANCER,
 * TOURNER]` et huit instructions écrites à la main produisent EXACTEMENT la
 * même liste — donc exactement le même dessin. L'invariant est vérifié par un
 * test unitaire ; c'est lui qui autorise la phrase « la boucle ne change pas
 * le dessin, elle change ce qu'on écrit ».
 *
 * Chaque pas garde d'où il vient : `srcIndex` (l'instruction affichée) et
 * `tour` (le tour de boucle), pour surligner la bonne carte à l'exécution.
 */
export function derouler(programme, env = {}) {
  const pas = [];
  (programme || []).forEach((noeud, srcIndex) => {
    if (noeud.kind === 'REPETER') {
      const fois = Math.max(0, Math.floor(evalValeur(noeud.fois, env)));
      for (let t = 0; t < fois; t += 1) {
        (noeud.corps || []).forEach((b, corpsIndex) => {
          pas.push({ ...b, srcIndex, tour: t, corpsIndex });
        });
      }
    } else {
      pas.push({ ...noeud, srcIndex, tour: 0, corpsIndex: null });
    }
  });
  return pas;
}

/** Nombre d'instructions écrites (≠ nombre d'instructions exécutées). */
export const tailleEcrite = (programme) => (programme || []).length;
/** Nombre d'instructions réellement exécutées. */
export const tailleExecutee = (programme, env) => derouler(programme, env).length;

/* ══ L'exécution ══════════════════════════════════════════════════════ */

/**
 * Exécute un programme. FONCTION PURE : aucun état React, aucun effet.
 * L'interface se contente de rejouer `etapes` image par image.
 *
 * @returns {{
 *   depart:{x,y,cap}, final:{x,y,cap},
 *   segments: Array<{x1,y1,x2,y2,srcIndex,tour,ordre}>,  // ce que le stylo a laissé
 *   etapes: Array<{pos,kind,srcIndex,tour,segment}>,     // état APRÈS chaque instruction
 *   longueur: number, rotationTotale: number,
 * }}
 */
export function executer(programme, { env = {}, depart = { x: 0, y: 0, cap: 0 } } = {}) {
  let pos = { ...depart };
  let stylo = true;
  const segments = [];
  const etapes = [];
  let longueur = 0;
  let rotationTotale = 0;

  derouler(programme, env).forEach((p) => {
    let segment = null;

    if (p.kind === 'AVANCER') {
      const d = evalValeur(p.valeur, env);
      const suivant = {
        x: arrondi(pos.x + d * Math.cos(rad(pos.cap))),
        y: arrondi(pos.y + d * Math.sin(rad(pos.cap))),
        cap: pos.cap,
      };
      if (stylo && d !== 0) {
        segment = {
          x1: pos.x, y1: pos.y, x2: suivant.x, y2: suivant.y,
          srcIndex: p.srcIndex, tour: p.tour, ordre: segments.length,
        };
        segments.push(segment);
        longueur += Math.abs(d);
      }
      pos = suivant;
    } else if (p.kind === 'TOURNER') {
      // Sens horaire à l'écran : l'élève tourne « à droite », donc le cap
      // décroît dans un repère où y monte. Une seule soustraction, ici.
      const a = evalValeur(p.valeur, env);
      rotationTotale += a;
      pos = { ...pos, cap: mod360(pos.cap - a) };
    } else if (p.kind === 'LEVER') {
      stylo = false;
    } else if (p.kind === 'BAISSER') {
      stylo = true;
    }

    etapes.push({ pos: { ...pos }, kind: p.kind, srcIndex: p.srcIndex, tour: p.tour, segment });
  });

  // `rotationTotale` est MONTRÉE à l'élève (« tu as tourné de 360° en tout »).
  // Sept virages de 360 ÷ 7 = 51,428…° s'additionnent en 360,00000000000006 :
  // sans arrondi, la leçon afficherait ce nombre-là. On arrondit donc ici, à
  // la source, plutôt qu'à chaque endroit qui l'affiche.
  return {
    depart: { ...depart }, final: pos, segments, etapes,
    longueur: arrondi(longueur), rotationTotale: arrondi(rotationTotale),
  };
}

/* ══ Lire la figure obtenue ═══════════════════════════════════════════ */

/** Le stylo est-il revenu à son point de départ ? (la figure se referme) */
export function estFermee(resultat, tol = 0.5) {
  const { depart, final } = resultat;
  return Math.hypot(final.x - depart.x, final.y - depart.y) <= tol;
}

/**
 * Le stylo a-t-il retrouvé sa direction de départ ? (un tour complet)
 *
 * L'écart se mesure SUR LE CERCLE : 359,999° et 0,001° sont tous deux à un
 * millième de degré du départ. Comparer `mod360(...) < tol` déclarerait le
 * premier faux — et c'est exactement le cas d'un heptagone, dont les sept
 * virages de 360 ÷ 7 = 51,428…° s'additionnent en 359,999…°.
 */
export function capRetrouve(resultat, tol = 0.5) {
  const ecart = mod360(resultat.final.cap - resultat.depart.cap);
  return Math.min(ecart, 360 - ecart) <= tol;
}

/**
 * Cadre exact des segments PLUS le point de départ, avec une marge.
 * Le point de départ compte même sans segment : un programme vide doit avoir
 * un cadre valide, sinon le SVG d'accueil naît sans dimensions.
 */
export function cadre(resultat, marge = 12) {
  const pts = [resultat.depart, ...resultat.segments.flatMap((s) => [{ x: s.x1, y: s.y1 }, { x: s.x2, y: s.y2 }])];
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs) - marge;
  const maxX = Math.max(...xs) + marge;
  const minY = Math.min(...ys) - marge;
  const maxY = Math.max(...ys) + marge;
  return { minX, maxX, minY, maxY, largeur: Math.max(1, maxX - minX), hauteur: Math.max(1, maxY - minY) };
}

/**
 * Point élève → point SVG. SEUL lieu de l'inversion verticale de la leçon.
 * Le cadre est passé explicitement : un composant qui dessine deux figures
 * côte à côte doit pouvoir leur imposer le MÊME cadre, sinon la comparaison
 * ment (deux carrés de tailles différentes paraîtraient identiques).
 */
export const toSvg = (c, x, y) => ({ x: x - c.minX, y: c.maxY - y });

/* ══ Le polygone régulier — le cœur mathématique de la leçon ══════════ */

/**
 * L'angle à tourner pour fermer un polygone régulier à n côtés.
 *
 * Ce n'est pas une recette : en parcourant le contour, le stylo fait UN TOUR
 * COMPLET, soit 360°, réparti en n virages égaux. D'où 360 ÷ n — et la
 * vérification est faite par le moteur lui-même : `polygone(n, c)` produit
 * une figure dont `estFermee` est vrai pour tout n testé.
 */
export const angleExterieur = (n) => 360 / n;

/** Le programme d'un polygone régulier : une boucle, deux instructions. */
export const polygone = (n, cote) => [makeRepeat(n, [avancer(cote), tourner(angleExterieur(n))])];

/** Les noms usuels — utilisés par les libellés, jamais par le calcul. */
export const NOM_POLYGONE = {
  3: 'triangle équilatéral', 4: 'carré', 5: 'pentagone régulier', 6: 'hexagone régulier',
  8: 'octogone régulier', 9: 'ennéagone régulier', 10: 'décagone régulier', 12: 'dodécagone régulier',
};
export const nomPolygone = (n) => NOM_POLYGONE[n] ?? `polygone régulier à ${n} côtés`;

/* ══ Affichage d'un programme ═════════════════════════════════════════ */

/** Une ligne lisible — pour les résumés, les aria-labels et les tests. */
export function ecrireInstruction(noeud) {
  if (noeud.kind === 'REPETER') {
    const corps = (noeud.corps || []).map(ecrireInstruction).join(' ; ');
    return `RÉPÉTER ${ecrireValeur(noeud.fois)} fois [ ${corps} ]`;
  }
  if (noeud.kind === 'AVANCER') return `AVANCER de ${ecrireValeur(noeud.valeur)}`;
  if (noeud.kind === 'TOURNER') return `TOURNER de ${ecrireValeur(noeud.valeur)}°`;
  return INSTRUCTION_LABELS[noeud.kind].label;
}

export const ecrireProgramme = (programme) =>
  !programme || programme.length === 0 ? 'programme vide' : programme.map(ecrireInstruction).join(' ; ');

/**
 * Premier pas où deux exécutions divergent, ou -1. Sert au module de
 * débogage : l'erreur se REPÈRE à l'endroit où le tracé quitte le bon chemin,
 * au lieu d'être coloriée en rouge d'avance.
 */
export function premiereDifference(a, b) {
  const n = Math.max(a.etapes.length, b.etapes.length);
  for (let i = 0; i < n; i += 1) {
    const ea = a.etapes[i];
    const eb = b.etapes[i];
    if (!ea || !eb) return i;
    if (arrondi(ea.pos.x) !== arrondi(eb.pos.x) || arrondi(ea.pos.y) !== arrondi(eb.pos.y)) return i;
    if (mod360(ea.pos.cap) !== mod360(eb.pos.cap)) return i;
  }
  return -1;
}
