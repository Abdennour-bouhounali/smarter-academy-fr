/**
 * MOTEUR DE TRACÉ 4e — le stylo qui CHOISIT.
 *
 * ─── D'OÙ IL VIENT, ET CE QU'IL AJOUTE ────────────────────────────────
 * La 5e (`algorithmique-programmation-5e/components/trace.js`) a posé l'état
 * canonique { x, y, cap }, les instructions qui portent un nombre, la lecture
 * de variables et la boucle RÉPÉTER. Ce moteur en est la suite EXACTE, au
 * périmètre officiel de 4e (objet `algorithmique_programmation`) :
 *     include — « Conditions (si… alors… sinon) »,
 *               « Manipulation de variables informatiques simples »,
 *               « Modification d'un programme existant ».
 *     exclude — « Boucles "Tant que" complexes ».
 * D'où exactement trois écarts, et aucun autre :
 *   1. SI…ALORS…SINON : une instruction peut choisir sa branche ;
 *   2. AFFECTER : une variable peut ÊTRE ÉCRITE, donc évoluer au fil du
 *      programme (en 5e elle n'était que LUE) ;
 *   3. `executerPasAPas` expose l'ENVIRONNEMENT après chaque instruction —
 *      c'est ce qui rend une variable qui change observable, et le débogage
 *      possible autrement qu'en devinant.
 *
 * ─── AUCUNE BOUCLE CONDITIONNELLE, PAR CONSTRUCTION ───────────────────
 * `KINDS` est clos et ne contient pas TANT QUE ; `evalTest` ne connaît qu'UNE
 * comparaison (pas de ET, pas de OU) : les exclusions officielles sont
 * l'ABSENCE de la structure, pas une consigne d'auteur. Un test unitaire
 * échoue si on les ajoute (voir trace4e.test.js).
 *
 * ─── POURQUOI UN NOUVEAU FICHIER PLUTÔT QU'UNE EXTENSION DE LA 5e ─────
 * La leçon de 5e tire sa valeur de ce que son jeu d'instructions est CLOS :
 * y ajouter SI la ferait mentir sur son propre périmètre, et son test
 * « KINDS ne contient ni SI ni TANT QUE » deviendrait faux. Les deux moteurs
 * partagent donc la même mathématique, écrite deux fois à un niveau
 * différent — c'est la règle §6ter.6 (copier-adapter, jamais importer d'un
 * dossier de leçon à l'autre), ici appliquée entre deux niveaux.
 *
 * ─── ÉTAT CANONIQUE ───────────────────────────────────────────────────
 *     { x, y, cap }   x, y en pas de stylo ; cap en DEGRÉS depuis l'Est,
 *                     positif dans le sens direct.
 *     env             { nom: nombre } — les variables, qui peuvent changer.
 * Segments, cadre, longueur, fermeture : tout est DÉRIVÉ, rien d'autre n'est
 * stocké. y croît vers le HAUT pour l'élève ; l'inversion SVG n'a lieu que
 * dans `toSvg`.
 */

/* ══ Trigonométrie de service ═════════════════════════════════════════ */

const rad = (deg) => (deg * Math.PI) / 180;

/** Cap ramené dans [0, 360[ — JS : -90 % 360 === -90. */
export const mod360 = (a) => ((a % 360) + 360) % 360;

/** Arrondi d'affichage et de comparaison, à 1/1000 de pas. */
export const arrondi = (v) => Math.round(v * 1000) / 1000;

/* ══ Les instructions ═════════════════════════════════════════════════ */

/**
 * Jeu d'instructions CLOS. TANT QUE n'y est pas : c'est la frontière 4e/3e,
 * écrite en code.
 */
export const KINDS = ['AVANCER', 'TOURNER', 'LEVER', 'BAISSER', 'REPETER', 'SI', 'AFFECTER'];

export const INSTRUCTION_LABELS = {
  AVANCER: { label: 'AVANCER', icon: '➡', aria: 'avancer' },
  TOURNER: { label: 'TOURNER', icon: '↻', aria: 'tourner à droite de' },
  LEVER: { label: 'LEVER LE STYLO', icon: '✋', aria: 'lever le stylo' },
  BAISSER: { label: 'BAISSER LE STYLO', icon: '✍', aria: 'baisser le stylo' },
  REPETER: { label: 'RÉPÉTER', icon: '🔁', aria: 'répéter un bloc' },
  SI: { label: 'SI', icon: '🔀', aria: 'si la condition est vraie' },
  AFFECTER: { label: 'METTRE', icon: '📥', aria: 'donner une valeur à une variable' },
};

export const avancer = (valeur) => ({ kind: 'AVANCER', valeur });
export const tourner = (valeur) => ({ kind: 'TOURNER', valeur });
export const lever = () => ({ kind: 'LEVER' });
export const baisser = () => ({ kind: 'BAISSER' });

/**
 * Construit un bloc RÉPÉTER. Le corps ne peut pas contenir un autre RÉPÉTER
 * (l'imbrication de boucles reste hors 4e), mais il PEUT contenir un SI et
 * une AFFECTATION : c'est précisément la boucle « qui choisit » et la boucle
 * « qui compte » du programme de 4e.
 */
export function makeRepeat(fois, corps) {
  const plat = (corps || []).filter((b) => b && b.kind !== 'REPETER');
  return { kind: 'REPETER', fois, corps: plat };
}

/**
 * Construit un SI…ALORS…SINON. Les deux branches sont aplaties de tout
 * RÉPÉTER et de tout SI : une seule profondeur de choix, comme pour la
 * boucle. `sinon` peut être vide — « si… alors » sans « sinon » est le
 * premier cas rencontré par l'élève.
 */
export function makeSi(test, alors, sinon = []) {
  const plat = (bloc) => (bloc || []).filter((b) => b && b.kind !== 'REPETER' && b.kind !== 'SI');
  return { kind: 'SI', test, alors: plat(alors), sinon: plat(sinon) };
}

/** METTRE <nom> à <valeur> — l'affectation, nouveauté de 4e. */
export const affecter = (nom, valeur) => ({ kind: 'AFFECTER', nom, valeur });

/** Un programme respecte-t-il le périmètre (aucune imbrication de structures) ? */
export const estPlat = (programme) =>
  (programme || []).every((i) => {
    if (i.kind === 'REPETER') return (i.corps || []).every((b) => b.kind !== 'REPETER');
    if (i.kind === 'SI') {
      return [...(i.alors || []), ...(i.sinon || [])].every((b) => b.kind !== 'REPETER' && b.kind !== 'SI');
    }
    return true;
  });

/* ══ Les valeurs : nombre, variable, formule ══════════════════════════ */

/**
 * Une VALEUR est l'un de ces trois objets :
 *   42                                    un nombre écrit en dur
 *   { lire: 'cote' }                      la lecture d'une variable
 *   { lire: 'cote', fois: 2, plus: 10 }   une formule : cote × 2 + 10
 * Volontairement pauvre : `evalValeur` est TOTALE — elle ne lève pas, ne
 * boucle pas, ne dépend d'aucun ordre d'évaluation subtil.
 */
export const lit = (nom) => ({ lire: nom });
export const formule = (nom, { fois = 1, plus = 0 } = {}) => ({ lire: nom, fois, plus });

export const estLecture = (valeur) => !!valeur && typeof valeur === 'object' && typeof valeur.lire === 'string';

/**
 * Évalue une valeur dans un environnement `{ nom: nombre }`.
 * Une variable absente vaut 0 : le programme continue et la figure MONTRE le
 * problème (un segment de longueur nulle) au lieu de planter.
 */
export function evalValeur(valeur, env = {}) {
  if (!estLecture(valeur)) return Number(valeur) || 0;
  const base = Number(env[valeur.lire]) || 0;
  return base * (valeur.fois ?? 1) + (valeur.plus ?? 0);
}

export function ecrireValeur(valeur) {
  if (!estLecture(valeur)) return String(valeur);
  const { lire, fois = 1, plus = 0 } = valeur;
  let s = lire;
  if (fois !== 1) s = `${s} × ${fois}`;
  if (plus > 0) s = `${s} + ${plus}`;
  if (plus < 0) s = `${s} − ${Math.abs(plus)}`;
  return s;
}

/* ══ La condition — le cœur de la 4e ══════════════════════════════════ */

/**
 * Les comparaisons disponibles. UNE seule par condition : pas de ET, pas de
 * OU — « conditions composées » est hors programme (5e l'excluait déjà, la 4e
 * ne l'ouvre pas ; c'est la 3e qui les porte).
 */
export const COMPARATEURS = {
  '<': { test: (a, b) => a < b, label: '<', aria: 'est plus petit que' },
  '<=': { test: (a, b) => a <= b, label: '⩽', aria: 'est plus petit ou égal à' },
  '>': { test: (a, b) => a > b, label: '>', aria: 'est plus grand que' },
  '>=': { test: (a, b) => a >= b, label: '⩾', aria: 'est plus grand ou égal à' },
  '=': { test: (a, b) => a === b, label: '=', aria: 'est égal à' },
  '≠': { test: (a, b) => a !== b, label: '≠', aria: 'est différent de' },
};

/**
 * Une CONDITION compare une valeur à une autre : `{ gauche, op, droite }`.
 * Les deux membres sont des VALEURS au sens ci-dessus — donc un nombre, une
 * variable ou une formule. Comparer deux variables est permis ; combiner deux
 * conditions ne l'est pas.
 */
export const condition = (gauche, op, droite) => ({ gauche, op, droite });

/**
 * Évalue une condition. Un opérateur inconnu vaut FAUX : le programme prend
 * la branche « sinon » et l'élève voit un tracé inattendu, plutôt qu'un écran
 * blanc.
 */
export function evalTest(test, env = {}) {
  if (!test || !COMPARATEURS[test.op]) return false;
  const g = evalValeur(test.gauche, env);
  const d = evalValeur(test.droite, env);
  return COMPARATEURS[test.op].test(arrondi(g), arrondi(d));
}

/** « côté > 50 » — l'écriture affichée d'une condition. */
export function ecrireTest(test) {
  if (!test || !COMPARATEURS[test.op]) return '?';
  return `${ecrireValeur(test.gauche)} ${COMPARATEURS[test.op].label} ${ecrireValeur(test.droite)}`;
}

/* ══ Le déroulement ═══════════════════════════════════════════════════ */

/**
 * Déroule le programme en la LISTE DES INSTRUCTIONS RÉELLEMENT EXÉCUTÉES.
 *
 * DIFFÉRENCE CAPITALE AVEC LA 5e : le déroulement dépend maintenant de
 * l'environnement, et l'environnement CHANGE en cours de route (AFFECTER).
 * Un SI ne peut donc pas être déroulé « à l'avance » : sa branche se décide
 * au moment où on l'atteint, avec les valeurs de ce moment-là. Le déroulement
 * simule donc les affectations au fil de l'eau.
 *
 * C'est exactement ce que l'élève doit comprendre au module 4 : la même
 * instruction, rencontrée deux fois, peut ne pas faire la même chose.
 *
 * Chaque pas garde d'où il vient : `srcIndex` (l'instruction affichée),
 * `tour` (le tour de boucle), `branche` ('alors' | 'sinon' | null).
 */
export function derouler(programme, env = {}) {
  const pas = [];
  const local = { ...env };

  const jouerBloc = (bloc, srcIndex, tour, branche) => {
    (bloc || []).forEach((b, corpsIndex) => {
      if (b.kind === 'AFFECTER') {
        // L'affectation est déroulée ET appliquée : les instructions
        // suivantes lisent la NOUVELLE valeur.
        pas.push({ ...b, srcIndex, tour, corpsIndex, branche, avant: { ...local } });
        local[b.nom] = arrondi(evalValeur(b.valeur, local));
        return;
      }
      pas.push({ ...b, srcIndex, tour, corpsIndex, branche, env: { ...local } });
    });
  };

  (programme || []).forEach((noeud, srcIndex) => {
    if (noeud.kind === 'REPETER') {
      const fois = Math.max(0, Math.floor(evalValeur(noeud.fois, local)));
      for (let t = 0; t < fois; t += 1) {
        (noeud.corps || []).forEach((b, corpsIndex) => {
          if (b.kind === 'SI') {
            const vrai = evalTest(b.test, local);
            jouerBloc(vrai ? b.alors : b.sinon, srcIndex, t, vrai ? 'alors' : 'sinon');
            return;
          }
          if (b.kind === 'AFFECTER') {
            pas.push({ ...b, srcIndex, tour: t, corpsIndex, branche: null, avant: { ...local } });
            local[b.nom] = arrondi(evalValeur(b.valeur, local));
            return;
          }
          pas.push({ ...b, srcIndex, tour: t, corpsIndex, branche: null, env: { ...local } });
        });
      }
    } else if (noeud.kind === 'SI') {
      const vrai = evalTest(noeud.test, local);
      jouerBloc(vrai ? noeud.alors : noeud.sinon, srcIndex, 0, vrai ? 'alors' : 'sinon');
    } else if (noeud.kind === 'AFFECTER') {
      pas.push({ ...noeud, srcIndex, tour: 0, corpsIndex: null, branche: null, avant: { ...local } });
      local[noeud.nom] = arrondi(evalValeur(noeud.valeur, local));
    } else {
      pas.push({ ...noeud, srcIndex, tour: 0, corpsIndex: null, branche: null, env: { ...local } });
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
 *
 * @returns {{
 *   depart:{x,y,cap}, final:{x,y,cap}, env: object,
 *   segments: Array<{x1,y1,x2,y2,srcIndex,tour,branche,ordre}>,
 *   etapes: Array<{pos,env,kind,srcIndex,tour,branche,segment}>,
 *   longueur: number, rotationTotale: number,
 * }}
 */
export function executer(programme, { env = {}, depart = { x: 0, y: 0, cap: 0 } } = {}) {
  let pos = { ...depart };
  let stylo = true;
  let local = { ...env };
  const segments = [];
  const etapes = [];
  let longueur = 0;
  let rotationTotale = 0;

  derouler(programme, env).forEach((p) => {
    let segment = null;

    if (p.kind === 'AFFECTER') {
      // `derouler` a déjà calculé l'environnement d'AVANT ; on rejoue
      // l'affectation ici pour que `etapes` porte l'état d'APRÈS.
      local = { ...(p.avant ?? local) };
      local[p.nom] = arrondi(evalValeur(p.valeur, local));
    } else {
      // Pour toute autre instruction, `derouler` a joint l'environnement du
      // moment : une seule source de vérité pour les variables.
      local = { ...(p.env ?? local) };
    }

    if (p.kind === 'AVANCER') {
      const d = evalValeur(p.valeur, local);
      const suivant = {
        x: arrondi(pos.x + d * Math.cos(rad(pos.cap))),
        y: arrondi(pos.y + d * Math.sin(rad(pos.cap))),
        cap: pos.cap,
      };
      if (stylo && d !== 0) {
        segment = {
          x1: pos.x, y1: pos.y, x2: suivant.x, y2: suivant.y,
          srcIndex: p.srcIndex, tour: p.tour, branche: p.branche ?? null, ordre: segments.length,
        };
        segments.push(segment);
        longueur += Math.abs(d);
      }
      pos = suivant;
    } else if (p.kind === 'TOURNER') {
      // Sens horaire à l'écran : l'élève tourne « à droite », donc le cap
      // décroît dans un repère où y monte. Une seule soustraction, ici.
      const a = evalValeur(p.valeur, local);
      rotationTotale += a;
      pos = { ...pos, cap: mod360(pos.cap - a) };
    } else if (p.kind === 'LEVER') {
      stylo = false;
    } else if (p.kind === 'BAISSER') {
      stylo = true;
    }

    etapes.push({
      pos: { ...pos },
      env: { ...local },
      kind: p.kind,
      nom: p.nom ?? null,
      srcIndex: p.srcIndex,
      tour: p.tour,
      branche: p.branche ?? null,
      segment,
    });
  });

  // `rotationTotale` est MONTRÉE à l'élève : sept virages de 360 ÷ 7
  // s'additionnent en 360,00000000000006. On arrondit à la source.
  return {
    depart: { ...depart }, final: pos, env: local, segments, etapes,
    longueur: arrondi(longueur), rotationTotale: arrondi(rotationTotale),
  };
}

/**
 * L'EXÉCUTION PAS À PAS, telle que l'interface la rejoue.
 *
 * Renvoie, pour chaque instruction exécutée, l'état COMPLET après elle :
 * position, cap, variables, et le segment éventuellement tracé. C'est ce qui
 * rend « la variable a changé » observable — sans cela, l'élève voit un
 * dessin et doit deviner ce que valait le compteur.
 *
 * L'index 0 est l'ÉTAT DE DÉPART, avant toute instruction : la pause et le
 * retour arrière ont ainsi toujours un état à afficher.
 */
export function executerPasAPas(programme, options = {}) {
  const res = executer(programme, options);
  const depart = {
    rang: 0,
    kind: null,
    srcIndex: null,
    tour: null,
    branche: null,
    pos: { ...res.depart },
    env: { ...(options.env ?? {}) },
    segment: null,
    segmentsJusquIci: [],
  };
  // Les segments s'accumulent : à l'étape i, l'interface dessine exactement
  // ce que le stylo a laissé jusque-là — ni plus (pas de figure « déjà
  // finie »), ni moins.
  const dessines = [];
  const suite = res.etapes.map((e, i) => {
    if (e.segment) dessines.push(e.segment);
    return {
      rang: i + 1,
      kind: e.kind,
      nom: e.nom,
      srcIndex: e.srcIndex,
      tour: e.tour,
      branche: e.branche,
      pos: { ...e.pos },
      env: { ...e.env },
      segment: e.segment,
      segmentsJusquIci: [...dessines],
    };
  });
  return [depart, ...suite];
}

/* ══ Lire la figure obtenue ═══════════════════════════════════════════ */

/** Le stylo est-il revenu à son point de départ ? (la figure se referme) */
export function estFermee(resultat, tol = 0.5) {
  const { depart, final } = resultat;
  return Math.hypot(final.x - depart.x, final.y - depart.y) <= tol;
}

/**
 * Le stylo a-t-il retrouvé sa direction de départ ? (un tour complet)
 * L'écart se mesure SUR LE CERCLE : 359,999° et 0,001° sont tous deux à un
 * millième de degré du départ.
 */
export function capRetrouve(resultat, tol = 0.5) {
  const ecart = mod360(resultat.final.cap - resultat.depart.cap);
  return Math.min(ecart, 360 - ecart) <= tol;
}

/** Cadre exact des segments PLUS le point de départ, avec une marge. */
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

/** Point élève → point SVG. SEUL lieu de l'inversion verticale. */
export const toSvg = (c, x, y) => ({ x: x - c.minX, y: c.maxY - y });

/* ══ Le polygone régulier — acquis de 5e, rappelé ici ═════════════════ */

/** L'angle à tourner pour fermer un polygone régulier à n côtés. */
export const angleExterieur = (n) => 360 / n;

/** Le programme d'un polygone régulier : une boucle, deux instructions. */
export const polygone = (n, cote) => [makeRepeat(n, [avancer(cote), tourner(angleExterieur(n))])];

export const NOM_POLYGONE = {
  3: 'triangle équilatéral', 4: 'carré', 5: 'pentagone régulier', 6: 'hexagone régulier',
  8: 'octogone régulier', 9: 'ennéagone régulier', 10: 'décagone régulier', 12: 'dodécagone régulier',
};
export const nomPolygone = (n) => NOM_POLYGONE[n] ?? `polygone régulier à ${n} côtés`;

/* ══ Affichage d'un programme ═════════════════════════════════════════ */

export function ecrireInstruction(noeud) {
  if (noeud.kind === 'REPETER') {
    const corps = (noeud.corps || []).map(ecrireInstruction).join(' ; ');
    return `RÉPÉTER ${ecrireValeur(noeud.fois)} fois [ ${corps} ]`;
  }
  if (noeud.kind === 'SI') {
    const alors = (noeud.alors || []).map(ecrireInstruction).join(' ; ');
    const sinon = (noeud.sinon || []).map(ecrireInstruction).join(' ; ');
    const base = `SI ${ecrireTest(noeud.test)} ALORS [ ${alors} ]`;
    return sinon ? `${base} SINON [ ${sinon} ]` : base;
  }
  if (noeud.kind === 'AFFECTER') return `METTRE ${ecrireValeur(noeud.valeur)} DANS ${noeud.nom}`;
  if (noeud.kind === 'AVANCER') return `AVANCER de ${ecrireValeur(noeud.valeur)}`;
  if (noeud.kind === 'TOURNER') return `TOURNER de ${ecrireValeur(noeud.valeur)}°`;
  return INSTRUCTION_LABELS[noeud.kind].label;
}

export const ecrireProgramme = (programme) =>
  !programme || programme.length === 0 ? 'programme vide' : programme.map(ecrireInstruction).join(' ; ');

/**
 * Premier pas où deux exécutions divergent, ou -1.
 *
 * Sert au module de débogage : l'erreur se REPÈRE à l'endroit où le tracé
 * quitte le bon chemin, au lieu d'être coloriée en rouge d'avance. En 4e, la
 * divergence peut aussi venir d'une VARIABLE : deux programmes peuvent
 * dessiner la même chose jusqu'ici et différer déjà par leur compteur.
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

/**
 * Premier pas où les VARIABLES divergent, ou -1. Complète
 * `premiereDifference` : un compteur jamais incrémenté peut se voir avant que
 * le dessin ne bouge.
 */
export function premiereDifferenceVariables(a, b) {
  const n = Math.max(a.etapes.length, b.etapes.length);
  for (let i = 0; i < n; i += 1) {
    const ea = a.etapes[i];
    const eb = b.etapes[i];
    if (!ea || !eb) return i;
    const noms = new Set([...Object.keys(ea.env || {}), ...Object.keys(eb.env || {})]);
    for (const nom of noms) {
      if (arrondi(Number(ea.env?.[nom]) || 0) !== arrondi(Number(eb.env?.[nom]) || 0)) return i;
    }
  }
  return -1;
}
