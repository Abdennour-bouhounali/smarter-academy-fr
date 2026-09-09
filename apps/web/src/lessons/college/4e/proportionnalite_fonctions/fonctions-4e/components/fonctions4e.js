/**
 * Noyau mathématique de « Fonctions » (4e) — le PROGRAMME DE CALCUL comme objet.
 *
 * ─── RÈGLE-OBJETS, PAS LISTES DE VALEURS ──────────────────────────────
 * Un programme de calcul est ici une SUITE ORDONNÉE D'ÉTAPES, jamais un
 * tableau de nombres écrit à la main :
 *
 *     [{ op: '×', val: 3 }, { op: '+', val: 2 }]   « multiplier par 3, puis ajouter 2 »
 *
 * Cette représentation est le cœur pédagogique de la leçon, pas un détail
 * d'implémentation. Elle seule permet de faire, du MÊME objet :
 *   – l'exécuter sur n'importe quelle entrée (module « exécuter ») ;
 *   – le remonter à l'envers, étape par étape (module « inverser ») ;
 *   – lui demander la formule qui le résume (module « produire la formule ») ;
 *   – engendrer son tableau de valeurs, puis ses points.
 * Un tableau de nombres ne saurait rien faire de tout cela : il ne dit pas
 * COMMENT on est passé de l'entrée à la sortie, et c'est précisément ce que
 * la 4e ajoute à la 5e (INTERACTION_PEDAGOGY §6ter.2).
 *
 * ─── CE QUE LA 4e AJOUTE À LA 5e ──────────────────────────────────────
 * La 5e (`fonctions-5e`) a installé : la dépendance entre deux grandeurs,
 * « une même entrée redonne la même sortie », l'expression « en fonction de »,
 * le tableau de valeurs, le programme de calcul EXÉCUTÉ, le couple-point et
 * la lecture d'un graphique. La 4e, rôle APPROFONDISSEMENT, ajoute exactement :
 *   1. INVERSER un programme — remonter de la sortie à l'entrée, ce qui oblige
 *      à voir le programme comme une chaîne orientée et non comme une recette ;
 *   2. PRODUIRE la formule qui le résume — le passage du « fais ceci puis
 *      cela » à l'écriture « 3x + 2 », c'est-à-dire l'entrée du calcul
 *      littéral (acquis de 4e) dans le monde des fonctions ;
 *   3. remonter d'un TABLEAU DE VALEURS à une formule, en la testant sur TOUS
 *      les couples et pas sur un seul ;
 *   4. MODÉLISER une situation réelle par une formule et son graphique.
 *
 * ─── PÉRIMÈTRE, ABSOLU ────────────────────────────────────────────────
 * La notation f(x), les mots « image » et « antécédent », les fonctions
 * linéaires et affines, le coefficient directeur et l'ordonnée à l'origine
 * sont des objets de 3e (`fonctions-3e`). Ils n'apparaissent NULLE PART dans
 * ce fichier : ni identifiant, ni chaîne, ni écriture LaTeX. La 4e écrit
 * « 3x + 2 », jamais « f(x) = 3x + 2 » ; elle dit « ce que le programme rend
 * pour 5 », jamais « l'image de 5 ». `assertScope4e` en fait une garde
 * EXÉCUTABLE : un commentaire n'a jamais empêché une donnée hors programme
 * d'atteindre l'écran, un `throw` si.
 *
 * ─── EXACTITUDE ───────────────────────────────────────────────────────
 * Tout passe par les RATIONNELS EXACTS de `common/algebra4e/exprCore`. Un
 * programme « ÷ 3 » appliqué à 1 rend 1/3, et non 0,3333 : quand l'élève
 * inverse le programme, il doit retrouver EXACTEMENT son entrée de départ,
 * sinon la leçon lui montrerait un aller-retour qui ne referme pas. Les
 * flottants ne sont produits qu'au dernier moment, pour placer un point.
 */

import {
  rat, ratAdd, ratSub, ratMul, ratDiv, ratEq, ratIsZero, ratIsInt,
  ratToNumber, ratIsDecimal, ratSign, ratAbs,
  expr, exprEval, exprEq,
  texRat, texExpr,
} from '../../../../../common/algebra4e';
import { roundTo } from '@smarter-academy/core';

/* ══ Les opérations autorisées ════════════════════════════════════════
 *
 * QUATRE opérations, et pas une de plus. Le carré, la racine ou l'inverse
 * feraient des programmes non inversibles ou à deux entrées possibles — ce
 * qui est exactement la question de 3e (plusieurs antécédents). En 4e, un
 * programme de calcul est une CHAÎNE RÉVERSIBLE, et cette réversibilité est
 * ce qui rend le module « remonter le programme » possible.
 */
export const OPS = ['+', '−', '×', '÷'];

/** Le symbole français de chaque opération, tel qu'il s'affiche sur une étape. */
export const OP_LABEL = {
  '+': 'ajouter',
  '−': 'soustraire',
  '×': 'multiplier par',
  '÷': 'diviser par',
};

/** L'opération qui DÉFAIT chacune — la table qui fonde `inverser`. */
const OP_INVERSE = { '+': '−', '−': '+', '×': '÷', '÷': '×' };

/**
 * Une étape de programme : une opération et sa valeur.
 *
 * `val` accepte un nombre entier ou un rationnel — jamais un flottant
 * quelconque : un programme « × 0,1 » écrit en flottant ne se refermerait pas
 * à l'aller-retour (0,1 × 10 ≠ 1 en binaire). Un décimal se donne donc en
 * rationnel exact, `rat(1, 10)`.
 */
export function etape(op, val) {
  if (!OPS.includes(op)) throw new Error(`étape : opération inconnue « ${op} »`);
  const v = typeof val === 'number' ? rat(val) : val;
  if (op === '÷' && ratIsZero(v)) throw new Error('étape : on ne divise pas par zéro');
  return { op, val: v };
}

/**
 * Un PROGRAMME : la suite ordonnée de ses étapes.
 * `programme(['×', 3], ['+', 2])` se lit « multiplier par 3, puis ajouter 2 ».
 * L'ordre est porteur de sens — c'est le premier constat du niveau : « ×3 puis
 * +2 » et « +2 puis ×3 » ne donnent pas la même chose.
 */
export function programme(...paires) {
  return paires.map(([op, val]) => etape(op, val));
}

/** Le programme est-il bien formé ? (garde de données, pour un import ou un test) */
export function programmeValide(prog) {
  return Array.isArray(prog) && prog.length > 0 && prog.every(
    (e) => e && OPS.includes(e.op) && e.val && Number.isInteger(e.val.n) && Number.isInteger(e.val.d)
      && e.val.d !== 0 && !(e.op === '÷' && e.val.n === 0)
  );
}

/* ══ Exécuter ═════════════════════════════════════════════════════════ */

/** Une étape appliquée à une valeur rationnelle. */
function appliquerEtape(valeur, e) {
  switch (e.op) {
    case '+': return ratAdd(valeur, e.val);
    case '−': return ratSub(valeur, e.val);
    case '×': return ratMul(valeur, e.val);
    case '÷': return ratDiv(valeur, e.val);
    default: throw new Error(`étape : opération inconnue « ${e.op} »`);
  }
}

/**
 * Exécuter le programme sur une entrée → un RATIONNEL EXACT.
 * « ÷ 3 » sur 1 rend 1/3, pas 0,333 : c'est la condition pour que
 * `inverser` referme l'aller-retour au nombre près.
 */
export function executer(prog, x) {
  const v = typeof x === 'number' ? rat(x) : x;
  return prog.reduce(appliquerEtape, v);
}

/**
 * La TRACE de l'exécution : la valeur après chacune des étapes.
 * C'est ce que la manipulation affiche case par case — l'élève voit le nombre
 * descendre la chaîne, il ne voit pas seulement le résultat tomber.
 */
export function trace(prog, x) {
  const depart = typeof x === 'number' ? rat(x) : x;
  const etapes = [];
  let v = depart;
  for (const e of prog) {
    const avant = v;
    v = appliquerEtape(v, e);
    etapes.push({ op: e.op, val: e.val, avant, apres: v });
  }
  return { depart, etapes, arrivee: v };
}

/* ══ Inverser ═════════════════════════════════════════════════════════ */

/**
 * Le programme est-il INVERSIBLE ?
 *
 * Une seule étape l'interdit : « × 0 ». Elle écrase toute entrée sur 0, donc
 * la sortie ne dit plus rien de l'entrée et il n'y a rien à remonter. C'est
 * le contre-exemple que la leçon montre : toutes les autres étapes se
 * défont, celle-là non — et la raison est visible (« quel nombre a-t-on
 * multiplié par 0 pour obtenir 0 ? tous »).
 *
 * (« ÷ 0 » n'existe pas : `etape` le refuse à la construction.)
 */
export function estInversible(prog) {
  return programmeValide(prog) && prog.every((e) => !(e.op === '×' && ratIsZero(e.val)));
}

/** La raison, en français, pour laquelle un programme ne s'inverse pas — ou null. */
export function raisonNonInversible(prog) {
  if (!programmeValide(prog)) return 'ce n’est pas un programme bien formé';
  const i = prog.findIndex((e) => e.op === '×' && ratIsZero(e.val));
  if (i < 0) return null;
  return `l’étape ${i + 1} multiplie par 0 : toutes les entrées donnent alors 0, on ne peut plus remonter`;
}

/**
 * Le programme INVERSE : on part de la sortie et on remonte.
 * Chaque opération devient son contraire, ET l'ordre s'inverse — les deux à
 * la fois. Oublier de retourner l'ordre est l'erreur du niveau : « ×3 puis
 * +2 » ne se défait pas par « ÷3 puis −2 » mais par « −2 puis ÷3 ».
 */
export function inverser(prog) {
  if (!estInversible(prog)) throw new Error(`programme non inversible : ${raisonNonInversible(prog)}`);
  return prog.slice().reverse().map((e) => ({ op: OP_INVERSE[e.op], val: e.val }));
}

/**
 * L'entrée qui produit une sortie donnée — l'aller-retour, en un geste.
 * `remonter(prog, y)` exécute simplement le programme inverse sur y.
 */
export function remonter(prog, y) {
  return executer(inverser(prog), y);
}

/* ══ La formule ═══════════════════════════════════════════════════════ */

/**
 * La FORMULE qui résume le programme, sous forme d'expression du premier
 * degré `{ x, k }` de `common/algebra4e` — c'est-à-dire a·(entrée) + b.
 *
 * Toute chaîne de +, −, × et ÷ par des nombres reste du premier degré : la
 * formule existe TOUJOURS, ce qui est la promesse du module « produire la
 * formule ». On part de l'entrée elle-même (1×entrée + 0) et on lui applique
 * les étapes une à une — le calcul littéral de 4e, en action.
 */
export function formule(prog) {
  return prog.reduce((e, s) => {
    switch (s.op) {
      case '+': return { x: e.x, k: ratAdd(e.k, s.val) };
      case '−': return { x: e.x, k: ratSub(e.k, s.val) };
      case '×': return { x: ratMul(e.x, s.val), k: ratMul(e.k, s.val) };
      case '÷': return { x: ratDiv(e.x, s.val), k: ratDiv(e.k, s.val) };
      default: throw new Error(`formule : opération inconnue « ${s.op} »`);
    }
  }, expr(1, 0));
}

/**
 * L'écriture LaTeX de la formule : « 3x + 2 ».
 *
 * PAS de « f(x) = » devant, et ce n'est pas un oubli : la notation
 * fonctionnelle est un objet de 3e. En 4e, la formule est une EXPRESSION qui
 * dit ce qu'on calcule, pas un objet nommé qu'on évalue.
 * L'écriture passe par `exprTex`, seule autorité du dépôt sur le moins
 * typographique, la virgule française et le coefficient 1 qui disparaît.
 */
export function formuleTex(prog, variable = 'x') {
  return texExpr(formule(prog), variable);
}

/** L'écriture LaTeX d'une valeur rationnelle (fraction si elle n'est pas décimale). */
export const valeurTex = (r) => texRat(typeof r === 'number' ? rat(r) : r);

/**
 * L'écriture d'une étape, telle qu'elle s'affiche sur une case du programme :
 * « × 3 », « + 2 », « ÷ 4 ».
 */
export const etapeTex = (e) => `${e.op}\\, ${texRat(e.val)}`;

/** L'étape en toutes lettres, pour un aria-label ou une consigne lue. */
export const etapeTexte = (e) => `${OP_LABEL[e.op]} ${frRat(e.val)}`;

/** Le programme en toutes lettres : « multiplier par 3, puis ajouter 2 ». */
export const programmeTexte = (prog) => prog.map(etapeTexte).join(', puis ');

/**
 * Deux programmes ont-ils la MÊME formule ?
 * C'est l'aha du module « produire la formule » : « ×2 puis ×3 » et « ×6 »
 * sont des programmes DIFFÉRENTS qui font la même chose. Comparer les
 * formules, c'est décider de l'égalité pour TOUTE entrée d'un coup, là où
 * comparer des tableaux ne décide que des entrées essayées.
 */
export const memeFormule = (p, q) => exprEq(formule(p), formule(q));

/** La formule évaluée directement (contrôle : elle doit égaler `executer`). */
export const evaluerFormule = (f, x) => exprEval(f, typeof x === 'number' ? rat(x) : x);

/* ══ Le tableau de valeurs ════════════════════════════════════════════ */

/**
 * Le tableau de valeurs du programme : [{ x, y }] en rationnels exacts.
 * Acquis de 5e (`tableau-de-valeurs`), réemployé ici comme MATÉRIAU : c'est
 * de lui que le module 4 remonte vers la formule.
 */
export function tableau(prog, xs) {
  return xs.map((x) => {
    const rx = typeof x === 'number' ? rat(x) : x;
    return { x: rx, y: executer(prog, rx) };
  });
}

/** Le même tableau, en flottants prêts à placer — la conversion se fait ICI, et une seule fois. */
export const enPoints = (couples) => couples.map((c) => ({
  x: roundTo(ratToNumber(c.x), 6),
  y: roundTo(ratToNumber(c.y), 6),
}));

/** Toutes les sorties tombent-elles « juste » (décimales finies) ? */
export const tableauDecimal = (couples) => couples.every((c) => ratIsDecimal(c.y));

/* ══ Tester une formule candidate contre des couples ══════════════════ */

/**
 * LE TESTEUR DE RÈGLE — le geste central du module « du tableau à la formule ».
 *
 * Reprend le patron de `fonctions-3e` (M1) : une candidate ne se juge pas sur
 * un couple mais sur TOUS. Une formule qui tombe juste une fois sur deux
 * n'est pas la formule, et le rapport le dit en nommant les couples qui la
 * démentent — jamais un « faux » sec.
 *
 * `candidate` est soit une formule `{x, k}`, soit un programme (une liste
 * d'étapes) : l'élève teste tantôt une écriture, tantôt une machine, et
 * l'appelant n'a pas à convertir.
 *
 * → { accord, total, valide, echecs: [{ x, attendu, obtenu }] }
 */
export function testerFormule(candidate, couples) {
  const f = Array.isArray(candidate) ? formule(candidate) : candidate;
  const verdicts = couples.map((c) => {
    const rx = typeof c.x === 'number' ? rat(c.x) : c.x;
    const attendu = typeof c.y === 'number' ? rat(c.y) : c.y;
    const obtenu = exprEval(f, rx);
    return { x: rx, attendu, obtenu, ok: ratEq(obtenu, attendu) };
  });
  const echecs = verdicts.filter((v) => !v.ok).map(({ x, attendu, obtenu }) => ({ x, attendu, obtenu }));
  return {
    accord: verdicts.length - echecs.length,
    total: verdicts.length,
    // « valide » exige l'accord PARTOUT — et un tableau vide ne valide rien :
    // sans couple à contredire, toute formule passerait.
    valide: verdicts.length > 0 && echecs.length === 0,
    echecs,
  };
}

/**
 * LA formule qui explique un tableau, ou null s'il n'y en a pas.
 *
 * Deux couples d'entrées distinctes suffisent à la déterminer ; les autres la
 * CONFIRMENT ou la réfutent, et c'est pourquoi on les vérifie tous. Renvoyer
 * null quand les couples ne s'accordent sur aucune formule est une réponse
 * mathématique, pas un échec : tous les tableaux ne cachent pas une formule
 * de ce type.
 */
export function formuleDepuisTableau(couples) {
  const cs = couples.map((c) => ({
    x: typeof c.x === 'number' ? rat(c.x) : c.x,
    y: typeof c.y === 'number' ? rat(c.y) : c.y,
  }));
  if (cs.length < 2) return null;
  const [p] = cs;
  const q = cs.find((c) => !ratEq(c.x, p.x));
  if (!q) return null; // toutes les entrées identiques : rien à déterminer
  const a = ratDiv(ratSub(q.y, p.y), ratSub(q.x, p.x));
  const b = ratSub(p.y, ratMul(a, p.x));
  const f = { x: a, k: b };
  return testerFormule(f, cs).valide ? f : null;
}

/**
 * Le PROGRAMME le plus court qui réalise une formule a·x + b : « × a » puis
 * « + b ». C'est le chemin retour du module « produire la formule » — de
 * l'écriture à la machine — et il n'existe que si a ≠ 0 (sinon la sortie ne
 * dépend plus de l'entrée : ce n'est plus une dépendance).
 */
export function programmeDepuisFormule(f) {
  if (ratIsZero(f.x)) throw new Error('programmeDepuisFormule : sans terme en x, la sortie ne dépend pas de l’entrée');
  const etapes = [etape('×', f.x)];
  if (!ratIsZero(f.k)) etapes.push(etape(ratSign(f.k) < 0 ? '−' : '+', ratAbs(f.k)));
  return etapes;
}

/* ══ Le cadre du graphique ════════════════════════════════════════════ */

/**
 * Les pas « ronds » disponibles, des deux côtés de l'unité : un forfait qui
 * varie de 0,25 € a besoin d'un pas plus fin que 1, et une population de
 * 10 000 d'un pas beaucoup plus large.
 */
const PAS_RONDS = [
  0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500,
  1000, 2000, 2500, 5000, 10000, 20000, 50000, 100000,
];

/**
 * Le plus petit pas rond qui tient l'étendue en au plus `maxTicks` graduations.
 * Sans ce plafond, une entrée de 10 000 fabriquerait dix mille traits et le
 * repère deviendrait un aplat noir (règle d'affichage §17bis).
 */
export function pasRond(etendue, maxTicks = 10) {
  const e = Number.isFinite(etendue) && etendue > 0 ? etendue : 1;
  for (const p of PAS_RONDS) if (e / p <= maxTicks) return p;
  return PAS_RONDS[PAS_RONDS.length - 1];
}

/** Étend [lo, hi] à la graduation voisine, en laissant toujours un cran de marge. */
function elargir(lo, hi, pas) {
  let a = Math.floor(lo / pas) * pas;
  if (Math.abs(a - lo) < 1e-9 && Math.abs(a) > 1e-9) a -= pas;
  let b = Math.ceil(hi / pas) * pas;
  if (Math.abs(b - hi) < 1e-9 && Math.abs(b) > 1e-9) b += pas;
  if (b - a < pas * 0.5) b = a + pas;
  return [roundTo(a, 6), roundTo(b, 6)];
}

/**
 * → { range, xStep, yStep, unit, unitY, xTicks, yTicks } pour <CoordPlane>.
 *
 * L'IDÉE est celle de `fonctions-3e/functionUtils.planeFor`, réécrite ici
 * (jamais importée d'un dossier de leçon voisin : une leçon ne dépend pas
 * d'une autre leçon) et adaptée à la 4e — pas décimaux admis, car les
 * situations modélisées ici sont des prix et des aires, pas des entiers.
 *
 * TROIS GARANTIES, que les tests vérifient sur des entrées extrêmes :
 *   1. les deux axes contiennent 0 (CoordPlane les trace en 0) ;
 *   2. l'étendue n'est JAMAIS dégénérée (min < max), même si tous les points
 *      sont confondus ou si la liste est vide — un repère plat diviserait par
 *      zéro au moment de calculer l'unité en pixels ;
 *   3. le nombre de graduations reste borné, quelle que soit la grandeur des
 *      nombres.
 */
export function planeFor(points, { maxTicks = 10, width = 300, height = 240 } = {}) {
  const xs = points.map((p) => p.x).filter(Number.isFinite);
  const ys = points.map((p) => p.y).filter(Number.isFinite);
  const xLo = Math.min(0, ...xs);
  const xHi = Math.max(0, ...xs);
  const yLo = Math.min(0, ...ys);
  const yHi = Math.max(0, ...ys);
  const xStep = pasRond(xHi - xLo, maxTicks);
  const yStep = pasRond(yHi - yLo, maxTicks);
  const [xMin, xMax] = elargir(xLo, xHi, xStep);
  const [yMin, yMax] = elargir(yLo, yHi, yStep);
  return {
    range: { xMin, xMax, yMin, yMax },
    xStep,
    yStep,
    unit: roundTo(width / (xMax - xMin), 6),
    unitY: roundTo(height / (yMax - yMin), 6),
    xTicks: Math.round((xMax - xMin) / xStep) + 1,
    yTicks: Math.round((yMax - yMin) / yStep) + 1,
  };
}

/* ══ Le périmètre, en code ════════════════════════════════════════════ */

/**
 * FRONTIÈRE 4e / 3e, EXÉCUTABLE.
 *
 * Ce noyau ne SAIT PAS écrire f(x), ne connaît ni « image » ni « antécédent »,
 * et ne classe aucune formule en « linéaire » ou « affine » : ce sont les
 * objets de `fonctions-3e`. Les tests le vérifient par l'ABSENCE des
 * fonctions correspondantes ; cette garde-ci couvre l'autre côté, celui des
 * DONNÉES — un module qui tenterait de faire entrer l'un de ces sujets dans
 * la leçon échoue immédiatement, avec la raison.
 *
 * Pourquoi la formule s'écrit quand même « 3x + 2 » : c'est du calcul
 * littéral de 4e, une EXPRESSION. Ce qui est réservé à la 3e, c'est de la
 * NOMMER f et d'en évaluer f(3) — la notation, pas l'écriture.
 */
export function assertScope4e(sujet) {
  const interdits = {
    image: 'le mot « image » est un objet de 3e (fonctions-3e)',
    antecedent: 'le mot « antécédent » est un objet de 3e (fonctions-3e)',
    'notation-fx': 'la notation f(x) est un objet de 3e (fonctions-3e)',
    'fonction-lineaire': 'la fonction linéaire est un objet de 3e (fonctions-3e)',
    'fonction-affine': 'la fonction affine est un objet de 3e (fonctions-3e)',
    'coefficient-directeur': 'le coefficient directeur est un objet de 3e (fonctions-3e)',
    'ordonnee-origine': 'l’ordonnée à l’origine est un objet de 3e (fonctions-3e)',
  };
  if (interdits[sujet]) throw new Error(`Hors programme de 4e : ${interdits[sujet]}`);
  return true;
}

/* ══ Les situations à modéliser, comme RÈGLE-OBJETS ═══════════════════ */

/**
 * Une SITUATION est une règle sur une grandeur, décrite par le programme de
 * calcul qui la produit — jamais par la liste des valeurs qu'on a bien voulu
 * calculer. C'est ce qui garantit qu'elle se comporte correctement à TOUTE
 * entrée atteignable, y compris celles auxquelles l'auteur n'a pas pensé.
 *
 * Chaque situation porte son DOMAINE (`entrees`), et ce domaine est une
 * contrainte du réel, pas une commodité : une longueur de rectangle de
 * périmètre 20 ne peut pas dépasser 10, sinon la largeur devient négative et
 * la figure mentirait à l'élève (§28bis — un schéma ne contredit jamais la
 * leçon). Les tests balaient ce domaine en entier.
 */
function situation({ id, nom, question, entreeNom, sortieNom, uniteEntree, uniteSortie, prog, entrees, note }) {
  if (!programmeValide(prog)) throw new Error(`situation ${id} : programme invalide`);
  return {
    id, nom, question, entreeNom, sortieNom, uniteEntree, uniteSortie, prog, entrees, note,
    /** La sortie exacte pour une entrée du domaine. */
    valeur: (x) => executer(prog, x),
    /** La sortie en flottant, pour l'affichage et le placement des points. */
    valeurNum: (x) => roundTo(ratToNumber(executer(prog, x)), 6),
    /** La formule qui résume la situation. */
    formule: () => formule(prog),
    formuleTex: (variable = 'x') => formuleTex(prog, variable),
  };
}

export const SITUATIONS = {
  /**
   * LE FORFAIT — la situation la plus lisible du niveau : une part fixe et
   * une part qui suit. C'est la modélisation de référence du module final.
   */
  forfait: situation({
    id: 'forfait',
    nom: 'L’atelier de sérigraphie',
    question: 'Combien coûte une commande de t-shirts ?',
    entreeNom: 'nombre de t-shirts',
    sortieNom: 'prix à payer',
    uniteEntree: 't-shirt',
    uniteSortie: '€',
    // 12 € de mise en route, puis 7 € par t-shirt : « ×7 puis +12 ».
    prog: programme(['×', 7], ['+', 12]),
    entrees: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20],
    note: 'La mise en route se paie même pour zéro t-shirt : la formule le dit, le graphique aussi.',
  }),

  /**
   * LE PÉRIMÈTRE FIXÉ — la situation qui SURPREND : quand la longueur
   * augmente, la largeur diminue. La dépendance n'est donc pas « les deux
   * montent ensemble », et c'est exactement l'erreur que la 5e laissait
   * intacte.
   *
   * Périmètre 20 ⇒ demi-périmètre 10 ⇒ largeur = 10 − longueur.
   * DOMAINE : la longueur reste dans ]0 ; 10[, sinon la largeur serait nulle
   * ou négative et le rectangle n'existerait pas. On s'arrête à 9.
   */
  perimetreFixe: situation({
    id: 'perimetre-fixe',
    nom: 'L’enclos de 20 m de grillage',
    question: 'Quelle largeur, pour une longueur donnée ?',
    entreeNom: 'longueur',
    sortieNom: 'largeur',
    uniteEntree: 'm',
    uniteSortie: 'm',
    // « ×(−1) puis +10 » : largeur = 10 − longueur.
    prog: programme(['×', -1], ['+', 10]),
    entrees: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    note: 'Ici la sortie DIMINUE quand l’entrée augmente — c’est encore une dépendance.',
  }),

  /**
   * LA CONVERSION — la situation SANS part fixe, celle qui passe par
   * l'origine. Elle est là pour que « part fixe » ne devienne pas la seule
   * forme imaginable, et pour que le contraste avec le forfait soit visible
   * sur le graphique.
   * 1 mile ≈ 1,609 km, arrondi à 1,6 pour rester manipulable — et donné en
   * rationnel exact 8/5, pour que l'aller-retour se referme.
   */
  conversion: situation({
    id: 'conversion',
    nom: 'Le compteur du vélo',
    question: 'Combien de kilomètres, pour un nombre de miles affiché ?',
    entreeNom: 'distance en miles',
    sortieNom: 'distance en kilomètres',
    uniteEntree: 'mile',
    uniteSortie: 'km',
    prog: programme(['×', rat(8, 5)]),
    entrees: [0, 1, 2, 5, 10, 20, 50, 100],
    note: 'Aucune part fixe : zéro mile fait zéro kilomètre, et le graphique part de l’origine.',
  }),

  /**
   * LA CITERNE QUI SE VIDE — une part fixe POSITIVE et une pente NÉGATIVE.
   * DOMAINE : 300 L au départ, 25 L par minute, donc la citerne est vide à
   * la minute 12. Aller au-delà donnerait un volume négatif : la figure
   * mentirait. Le domaine s'arrête donc à 12, et la leçon peut demander
   * « quand est-elle vide ? » — la réponse est DANS le domaine.
   */
  citerne: situation({
    id: 'citerne',
    nom: 'La citerne du potager',
    question: 'Combien reste-t-il d’eau après un certain temps ?',
    entreeNom: 'durée d’arrosage',
    sortieNom: 'eau restante',
    uniteEntree: 'min',
    uniteSortie: 'L',
    // « ×(−25) puis +300 » : 300 − 25t.
    prog: programme(['×', -25], ['+', 300]),
    entrees: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12],
    note: 'À 12 minutes, il ne reste rien : remonter le programme depuis 0 donne cette durée.',
  }),
};

/** Le tableau de valeurs d'une situation, sur tout son domaine. */
export const tableauSituation = (s) => tableau(s.prog, s.entrees);

/** Les points d'une situation, prêts pour le repère. */
export const pointsSituation = (s) => enPoints(tableauSituation(s));

/* ══ Écritures françaises ═════════════════════════════════════════════ */

/**
 * Un rationnel en français : entier ou décimal à la virgule, fraction sinon.
 * Le moins est le moins typographique U+2212, comme partout dans le dépôt.
 */
export function frRat(r, maxDecimals = 3) {
  const v = typeof r === 'number' ? rat(r) : r;
  if (ratIsInt(v)) return String(v.n).replace('-', '−');
  if (ratIsDecimal(v)) {
    return ratToNumber(v).toLocaleString('fr-FR', { maximumFractionDigits: maxDecimals }).replace('-', '−');
  }
  return `${String(v.n).replace('-', '−')}/${v.d}`;
}

/** Un nombre en français, virgule décimale et espace fine des milliers. */
export function fr(x, maxDecimals = 2) {
  if (!Number.isFinite(x)) return '—';
  return x.toLocaleString('fr-FR', { maximumFractionDigits: maxDecimals }).replace('-', '−');
}
