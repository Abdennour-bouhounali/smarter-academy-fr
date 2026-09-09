/**
 * Noyau mathématique de « Proportionnalité » (4e).
 *
 * ─── RÈGLE-OBJETS, PAS LISTES DE VALEURS ──────────────────────────────
 * Une situation est une FONCTION de l'entrée, jamais un tableau écrit à la
 * main. C'est ce qui garantit qu'une situation non proportionnelle se comporte
 * comme telle À TOUTE entrée que l'élève peut atteindre — y compris celles
 * auxquelles l'auteur n'a pas pensé — et que rien de ce que la leçon affirme
 * ne puisse être démenti par le code (INTERACTION_PEDAGOGY §6ter.2).
 *
 * ─── CE QUE LA 4e AJOUTE À LA 5e ──────────────────────────────────────
 * La 5e (`proportionnalite-5e`) a installé le coefficient comme opérateur, le
 * tableau, l'échelle, le pourcentage-remise et le graphique. Le programme de
 * 4e ajoute exactement :
 *     include — « Quatrième proportionnelle (produit en croix) »,
 *               « Calcul avec des pourcentages (augmentation, diminution) »,
 *               « Coefficient multiplicateur ».
 *     exclude — « Fonctions affines » (et, par la 3e : k²/k³, Thalès).
 * D'où les trois apports de ce noyau, et aucun autre :
 *   1. `quatriemeProportionnelle` — l'outil qui sert QUAND aucun passage n'est
 *      entier, seul cas où le produit en croix est autre chose qu'un rituel ;
 *   2. `coefficientMultiplicateur` / `appliquerEvolution` — l'évolution vue
 *      comme une MULTIPLICATION, pas comme une addition de pourcentages ;
 *   3. `valeurInitiale` — le retour en arrière, qui n'est pas l'évolution
 *      opposée.
 *
 * ─── EXACTITUDE ───────────────────────────────────────────────────────
 * La quatrième proportionnelle passe par les RATIONNELS EXACTS de
 * `common/algebra4e/exprCore` : 3 objets pour 7 € donnent 7/3, et afficher
 * « 2,333 » serait une faute mathématique. Les évolutions, elles, portent sur
 * des prix : elles vivent en décimal arrondi au centime, ce qui EST le modèle
 * du domaine.
 */
import { rat, ratMul, ratDiv, ratEq, ratIsInt, ratToNumber, ratIsDecimal } from '../../../../../common/algebra4e';
import {
  coefficient as coefficientDepuisTaux,
  evolutionRate,
  initialValue,
  globalCoefficient,
  reciprocalRate,
  percentagePointDifference,
} from '../../../../../common/stats/percentUtils';
import { parseDec } from '@smarter-academy/core';

/**
 * `parseFr` est ENTIER : « 2,5 » y renverrait NaN et l'étape ne se validerait
 * jamais. Toute NumericQuestion à réponse décimale de cette leçon passe donc
 * `parse={parseDec}`.
 */
export { parseDec };

/* ══ Écritures ════════════════════════════════════════════════════════ */

/** Arrondi « monnaie » : deux décimales, sans bruit binaire (0,1 + 0,2). */
export const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;

/** Format français : virgule décimale, espace fine insécable pour les milliers. */
export function fr(x, maxDecimals = 2) {
  if (!Number.isFinite(x)) return '—';
  return x.toLocaleString('fr-FR', { maximumFractionDigits: maxDecimals });
}

/** Prix en euros, toujours lisible (« 4,50 € » et non « 4,5 € »). */
export function eur(x) {
  if (!Number.isFinite(x)) return '—';
  const centimes = Math.abs(Math.round(x * 100)) % 100 !== 0;
  return `${x.toLocaleString('fr-FR', {
    minimumFractionDigits: centimes ? 2 : 0,
    maximumFractionDigits: 2,
  })} €`;
}

/** Un taux en pourcentage, signé : « +20 % », « −20 % », « 0 % ». */
export function pct(taux, maxDecimals = 1) {
  if (!Number.isFinite(taux)) return '—';
  const v = taux * 100;
  const signe = v > 0 ? '+' : v < 0 ? '−' : '';
  return `${signe}${fr(Math.abs(v), maxDecimals)} %`;
}

/** Un coefficient multiplicateur : « ×1,2 ». */
export const coefTexte = (k) => `×${fr(k, 4)}`;

/* ══ Les situations, comme RÈGLES ═════════════════════════════════════ */

/**
 * Situation PROPORTIONNELLE : sortie = k × entrée, et rien d'autre.
 * `k` est le coefficient — acquis de 5e, réutilisé ici comme point d'appui.
 */
export const proportionnelle = ({ k, ...meta }) => ({
  kind: 'proportionnelle',
  k,
  apply: (x) => round2(k * x),
  ...meta,
});

/**
 * Situation à PART FIXE : sortie = base + k × entrée, avec base ≠ 0.
 * Jamais nommée « affine » devant l'élève de 4e — c'est le vocabulaire de la
 * 3e. Ici, c'est « la machine qui fait payer la mise en service » : le
 * contre-exemple qui casse les cinq lectures à la fois.
 */
export const partFixe = ({ base, k, ...meta }) => {
  if (base === 0) throw new Error('partFixe avec base nulle : c’est une situation proportionnelle');
  return { kind: 'partFixe', base, k, apply: (x) => round2(base + k * x), ...meta };
};

/**
 * Situation à PALIERS : le prix change par tranches. Deuxième contre-exemple,
 * de nature différente — il ne casse pas la proportionnalité « par un
 * décalage » mais « par un escalier », et son graphique ne ressemble à rien
 * d'une droite.
 */
export const parPaliers = ({ paliers, ...meta }) => {
  // Les paliers sont rangés du plus petit au plus grand plafond : le premier
  // qui contient l'entrée est LE sien. Trier dans l'autre sens ferait tomber
  // toute entrée dans la tranche la plus haute — le tarif serait constant et
  // le contre-exemple ne montrerait plus rien.
  const ordonnes = [...paliers].sort((a, b) => a.jusqua - b.jusqua);
  return {
    kind: 'paliers',
    paliers: ordonnes,
    apply: (x) => {
      const p = ordonnes.find((q) => x <= q.jusqua) ?? ordonnes[ordonnes.length - 1];
      return round2(p.prix);
    },
    ...meta,
  };
};

/** Les couples (entrée, sortie) d'une situation, pour une liste d'entrées. */
export const couples = (situation, entrees) => entrees.map((x) => ({ x, y: situation.apply(x) }));

/**
 * La colonne « ÷ entrée » — le rapport sortie/entrée pour chaque couple.
 * Constante ⟺ situation proportionnelle. C'est la lecture NUMÉRIQUE du
 * critère ; `alignesAvecOrigine` en est la lecture GRAPHIQUE.
 * L'entrée nulle est écartée : on ne divise pas par zéro, et « 0 pour 0 » ne
 * dit rien du coefficient.
 */
export function rapports(cs, decimales = 4) {
  return cs
    .filter((c) => c.x !== 0)
    .map((c) => ({ ...c, r: Math.round((c.y / c.x) * 10 ** decimales) / 10 ** decimales }));
}

/** Le rapport est-il le MÊME partout ? (à la tolérance d'affichage près) */
export function rapportConstant(cs, decimales = 4) {
  const rs = rapports(cs, decimales).map((c) => c.r);
  if (rs.length < 2) return true;
  return rs.every((r) => r === rs[0]);
}

/**
 * Les points sont-ils alignés AVEC L'ORIGINE ? Le « avec l'origine » est tout
 * le critère : une situation à part fixe donne des points parfaitement
 * alignés, et c'est l'erreur la plus tenace du niveau.
 */
export function alignesAvecOrigine(cs, tol = 1e-6) {
  const utiles = cs.filter((c) => c.x !== 0);
  if (utiles.length === 0) return true;
  const k = utiles[0].y / utiles[0].x;
  return utiles.every((c) => Math.abs(c.y - k * c.x) <= tol * Math.max(1, Math.abs(c.y)));
}

/** Le verdict complet, avec sa RAISON — jamais un booléen seul. */
export function verdict(situation, entrees) {
  const cs = couples(situation, entrees);
  const proportionnel = situation.kind === 'proportionnelle';
  return {
    proportionnel,
    rapportConstant: rapportConstant(cs),
    alignes: alignesAvecOrigine(cs),
    raison: proportionnel
      ? 'le rapport sortie ÷ entrée est le même partout'
      : situation.kind === 'partFixe'
        ? 'une part se paie même pour une entrée nulle : le rapport diminue quand l’entrée grandit'
        : 'le prix ne change que par paliers : le rapport saute d’une tranche à l’autre',
  };
}

/* ══ La quatrième proportionnelle ═════════════════════════════════════ */

/**
 * a → b, c → ? dans une même situation proportionnelle.
 * Résultat RATIONNEL EXACT : 3 pour 7 € et 5 objets donnent 35/3, pas 11,67.
 *
 * `a` non nul est une condition mathématique, pas un garde-fou défensif :
 * sans elle il n'y a pas de coefficient, donc pas de quatrième
 * proportionnelle.
 */
export function quatriemeProportionnelle(a, b, c) {
  const ra = rat(a);
  if (ra.n === 0) throw new Error('quatrième proportionnelle : la première valeur ne peut pas être nulle');
  return ratDiv(ratMul(rat(b), rat(c)), ra);
}

/**
 * Les DEUX produits en croix d'un tableau (a b / c d), pour les comparer.
 * C'est ce que l'élève tire à la main au module 2 : le tableau est
 * proportionnel exactement quand les deux produits sont égaux.
 */
export const produitsEnCroix = (a, b, c, d) => ({ gauche: a * d, droite: b * c });

/** Le tableau (a b / c d) est-il proportionnel ? */
export const croixEgales = (a, b, c, d) => a * d === b * c;

/**
 * Le passage d'une colonne à l'autre est-il ENTIER ? C'est ce qui décide si
 * le produit en croix apporte quelque chose : quand on passe de 2 à 6 en
 * multipliant par 3, l'élève n'a besoin d'aucun outil nouveau.
 */
export function passageEntier(a, c) {
  if (a === 0) return false;
  const q = rat(c, a);
  return ratIsInt(q);
}

/** Le résultat tombe-t-il « juste » (décimal fini) ou est-ce une fraction ? */
export const estDecimalFini = (r) => ratIsDecimal(r);

/* ══ Les évolutions ═══════════════════════════════════════════════════ */

/**
 * Coefficient multiplicateur d'un taux : k = 1 + t.
 * +20 % → 1,2 ; −20 % → 0,8. Une seule définition dans le dépôt : celle de
 * `common/stats/percentUtils`, réutilisée ici plutôt que réécrite.
 */
export const coefficientMultiplicateur = coefficientDepuisTaux;

/** Appliquer une évolution à une valeur (résultat arrondi au centime). */
export const appliquerEvolution = (valeur, taux) => round2(valeur * coefficientDepuisTaux(taux));

/** Appliquer un coefficient directement. */
export const appliquerCoefficient = (valeur, k) => round2(valeur * k);

/** Le taux d'évolution entre deux valeurs : t = (fin − début) / début. */
export const tauxEntre = evolutionRate;

/** La valeur de DÉPART, connaissant l'arrivée et le coefficient. */
export const valeurInitiale = (final, k) => {
  const v = initialValue(final, k);
  return v == null ? null : round2(v);
};

/**
 * Le coefficient de plusieurs évolutions successives : le PRODUIT de leurs
 * coefficients. +20 % puis −20 % donne 1,2 × 0,8 = 0,96, soit −4 % — et non
 * 0 %. C'est le cœur du module 4.
 *
 * L'argument est une liste de TAUX (0,2 et −0,2), pas de coefficients :
 * l'élève raisonne sur « +20 % puis −20 % », et une API qui attendrait
 * 1,2 et 0,8 déplacerait la conversion chez l'appelant, donc l'exposerait à
 * l'oubli. `common/stats/percentUtils.globalCoefficient` a déjà cette
 * convention ; on la garde plutôt que d'en inventer une seconde.
 */
export const coefficientSuccessif = globalCoefficient;

/** Le taux global équivalent à une suite d'évolutions : k − 1. */
export const tauxSuccessif = (taux) => globalCoefficient(taux) - 1;

/** Le taux qui RAMÈNE au départ : t' = 1/(1+t) − 1. Après +25 %, c'est −20 %. */
export const tauxRetour = reciprocalRate;

/**
 * La différence de deux pourcentages, en POINTS, dans l'ordre de lecture
 * « de … à … » : `differenceEnPoints(0,20, 0,25)` vaut +0,05.
 * Passer de 20 % à 25 %, c'est +5 POINTS mais +25 % (une évolution) : les
 * deux lectures sont affichées côte à côte au module 3, parce que les
 * confondre est l'erreur du niveau.
 */
export const differenceEnPoints = (depuis, vers) => percentagePointDifference(depuis, vers);

/* ══ Le périmètre, en code ════════════════════════════════════════════ */

/**
 * FRONTIÈRE 4e / 3e, EXÉCUTABLE.
 *
 * Ce noyau n'expose NI fonction linéaire, NI effet d'un agrandissement sur les
 * aires et les volumes (k², k³), NI Thalès : ce sont des objets de 3e
 * (`proportionnalite-3e`, `thales-3e`). Les tests le vérifient par l'ABSENCE
 * des fonctions correspondantes — un commentaire n'empêcherait pas une donnée
 * hors programme d'atteindre l'écran, un test le fait.
 *
 * Cette fonction lève si on lui demande un coefficient d'aire ou de volume :
 * c'est la garde côté données, complémentaire de l'absence côté API.
 */
export function assertScope4e(sujet) {
  const interdits = {
    'aire-agrandie': 'l’effet d’un agrandissement sur les AIRES (k²) est un objet de 3e',
    'volume-agrandi': 'l’effet d’un agrandissement sur les VOLUMES (k³) est un objet de 3e',
    'fonction-lineaire': 'la fonction linéaire est un objet de 3e',
    thales: 'le théorème de Thalès est un objet de 3e',
  };
  if (interdits[sujet]) throw new Error(`Hors programme de 4e : ${interdits[sujet]}`);
  return true;
}

/* ══ Les données de la leçon ══════════════════════════════════════════ */

/**
 * Les deux machines du module 1 — même geste, comportements opposés.
 *
 * POURQUOI UN PRIX ET NON UN VOLUME. Un contre-exemple à part fixe s'écrit
 * base + k × x ; avec une base NÉGATIVE (« la machine garde un demi-litre »)
 * le modèle rendrait un volume négatif pour une petite entrée, et la figure
 * mentirait à l'élève dès la première seconde. Avec un PRIX, la part fixe est
 * positive — un forfait, une mise en service — et le modèle reste vrai sur
 * TOUT le domaine atteignable, entrée nulle comprise. C'est la contrainte
 * §28bis (« un schéma ne contredit jamais la leçon ») appliquée au choix du
 * contexte, pas seulement au dessin.
 */
export const ATELIERS = {
  aLaCommande: proportionnelle({
    id: 'a-la-commande',
    nom: 'L’atelier Cléo',
    detail: 'On paie chaque affiche, et rien d’autre.',
    k: 1.5, // 1 affiche → 1,50 €
    uniteEntree: 'affiche',
    uniteSortie: '€',
  }),
  avecMiseEnRoute: partFixe({
    id: 'avec-mise-en-route',
    nom: 'L’atelier Bruno',
    detail: 'Il facture 6 € de mise en route, puis chaque affiche.',
    base: 6,
    k: 1.5,
    uniteEntree: 'affiche',
    uniteSortie: '€',
  }),
};

/**
 * Le domaine que l'élève peut atteindre au module 1. Toute affirmation de la
 * leçon est vérifiée SUR CE DOMAINE par les tests, pas sur un échantillon.
 */
export const ENTREES_M1 = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20];
