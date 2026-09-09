/**
 * Noyau mathématique de « Statistiques » (4e) — PUR, sans React ni stockage.
 *
 * ─── CE QUE LA 4e AJOUTE À LA 5e ──────────────────────────────────────
 * La 5e (`statistiques-5e`) a installé la série, l'effectif, le tableau
 * d'effectifs, la fréquence, les deux diagrammes et la MOYENNE SIMPLE lue
 * comme un partage équitable. Son propre noyau refuse d'aller plus loin :
 * `assertScope5e('mediane')` y LÈVE. Ce fichier est l'autre côté de cette
 * frontière — l'objet officiel `4e_statistiques` (approfondissement) ajoute
 * exactement quatre choses, et aucune autre :
 *
 *     include — moyenne PONDÉRÉE (par des coefficients ou des effectifs),
 *               MÉDIANE, ÉTENDUE, COMPARAISON de deux séries.
 *     exclude — quartiles, boîte à moustaches, écart type, variance (3e).
 *
 * ─── LA SÉRIE EST UN OBJET, PAS UNE LISTE ─────────────────────────────
 * Une série porte ses valeurs ET, éventuellement, ses effectifs ; ses
 * indicateurs en sont DÉRIVÉS, jamais saisis à côté. C'est ce qui garantit
 * qu'aucune manipulation ne peut faire diverger le tableau affiché de la
 * moyenne annoncée. L'Observatoire des données (M1) modifie UNE valeur à la
 * fois : les trois helpers `remplacerValeur` / `ajouterValeur` /
 * `retirerValeur` rendent une série NEUVE, jamais la même mutée — un état
 * React muté en place ne redéclencherait aucun rendu, et la manipulation
 * paraîtrait gelée.
 *
 * ─── LA DÉCOUVERTE CENTRALE EST CALCULÉE, PAS AFFIRMÉE ────────────────
 * « La moyenne est sensible aux valeurs extrêmes, la médiane est robuste »
 * est la phrase que toute leçon de statistique récite. Ici elle n'est écrite
 * nulle part comme un fait : `sensibilite(serie, i, v)` RENVOIE de combien
 * chaque indicateur bouge quand l'élève déplace une valeur, et les tests
 * balaient le domaine atteignable pour vérifier que la série choisie le
 * montre vraiment. Si un jour la donnée cesse de le montrer, un test casse —
 * pas un élève.
 *
 * ─── RIEN N'EST RÉIMPLÉMENTÉ ──────────────────────────────────────────
 * `mean`, `weightedMean`, `median`, `range`, `frequencyTable` et
 * `formatNumber` viennent de `common/stats`. Une seule définition de la
 * médiane dans le dépôt : celle du programme (demi-somme des deux valeurs
 * centrales quand l'effectif est pair).
 */
import {
  mean,
  weightedMean,
  median,
  range,
  frequencyTable,
  sorted,
  sum,
  formatNumber,
} from '../../../../../common/stats';

/* ══ Le périmètre, en code ════════════════════════════════════════════ */

/**
 * Indicateurs qui n'appartiennent PAS à la 4e — ils sont l'objet de la 3e
 * puis de la 2nde. La liste est écrite ici plutôt que commentée parce qu'un
 * commentaire n'empêche pas une donnée hors programme d'atteindre l'écran.
 */
const HORS_PROGRAMME_4E = {
  quartile: 'les quartiles sont un objet de 3e',
  q1: 'le premier quartile est un objet de 3e',
  q3: 'le troisième quartile est un objet de 3e',
  'ecart-interquartile': 'l’écart interquartile est un objet de 3e',
  'boite-a-moustaches': 'la boîte à moustaches est un objet de 3e',
  'ecart-type': 'l’écart type est un objet de 3e',
  variance: 'la variance est un objet de 3e',
};

/**
 * FRONTIÈRE 4e / 3e, EXÉCUTABLE.
 *
 * Deux gardes complémentaires, parce qu'aucune ne suffit seule :
 *   · côté API — ce module n'exporte NI `quartile`, NI `ecartType`, NI
 *     `boiteAMoustaches`, alors même que `common/stats` les contient et
 *     qu'un `export *` les aurait laissés fuir. Testé par l'ABSENCE.
 *   · côté données — cette fonction LÈVE si un module demande l'un de ces
 *     indicateurs, ce qui transforme une erreur d'auteur en échec bruyant.
 */
export function assertScope4e(sujet) {
  const raison = HORS_PROGRAMME_4E[sujet];
  if (raison) {
    throw new Error(
      `[statistiques-4e] « ${sujet} » est hors du programme de 4e : ${raison}. ` +
      'L’objet officiel 4e_statistiques s’arrête à moyenne pondérée, médiane, étendue et comparaison.',
    );
  }
  return true;
}

/* ══ La série, objet de première classe ═══════════════════════════════ */

/**
 * Une SÉRIE = des valeurs, chacune munie d'un poids (coefficient ou
 * effectif) qui vaut 1 par défaut.
 *
 * POURQUOI UN POIDS PARTOUT PLUTÔT QUE DEUX TYPES DE SÉRIE. Une série brute
 * est exactement une série pondérée dont tous les poids valent 1 : les
 * garder distincts obligerait chaque indicateur à exister en deux versions,
 * et la première divergence entre les deux serait invisible. Ici la moyenne
 * pondérée EST la moyenne, et le fait que la moyenne simple en soit le cas
 * particulier est une propriété testée, pas une coïncidence d'écriture.
 *
 * `libelle` nomme l'individu (un prénom, une épreuve, un jour) — sans lui,
 * l'élève voit des nombres et non des données.
 */
export function serie({ id, nom, unite = '', unitePluriel = '', items }) {
  const normalises = items.map((it, i) =>
    typeof it === 'number'
      ? { cle: `${id ?? 's'}-${i}`, libelle: null, valeur: it, poids: 1 }
      : { cle: it.cle ?? `${id ?? 's'}-${i}`, libelle: it.libelle ?? null, valeur: it.valeur, poids: it.poids ?? 1 },
  );
  return { id, nom, unite, unitePluriel: unitePluriel || unite, items: normalises };
}

/** Les valeurs nues, dans l'ordre de saisie. */
export const valeurs = (s) => s.items.map((it) => it.valeur);

/** Les poids, dans l'ordre de saisie. */
export const poids = (s) => s.items.map((it) => it.poids);

/** La série est-elle pondérée, ou tous ses poids valent-ils 1 ? */
export const estPonderee = (s) => s.items.some((it) => it.poids !== 1);

/**
 * L'effectif total : la SOMME DES POIDS, et non le nombre de lignes.
 * Sur un tableau d'effectifs (« 9 élèves ont 1 frère ou sœur »), c'est 25
 * individus pour 5 lignes — confondre les deux est l'erreur qui fait rater
 * toutes les moyennes pondérées du niveau.
 */
export const effectifTotal = (s) => sum(poids(s));

/** Le nombre de LIGNES du tableau — à ne pas confondre avec l'effectif. */
export const nbLignes = (s) => s.items.length;

/**
 * La série DÉVELOPPÉE : chaque valeur répétée autant de fois que son poids.
 * C'est le pont entre les deux écritures, et c'est ce qui permet de calculer
 * la médiane d'une série donnée par un tableau d'effectifs sans écrire une
 * seconde définition de la médiane.
 *
 * Elle exige des poids ENTIERS : « 2,5 élèves » n'existe pas, et la médiane
 * d'une série à poids fractionnaires n'a pas de sens au collège. On lève
 * plutôt que d'arrondir en silence.
 */
export function developpee(s) {
  const out = [];
  for (const it of s.items) {
    if (!Number.isInteger(it.poids) || it.poids < 0) {
      throw new Error(
        `[statistiques-4e] développer une série exige des effectifs entiers (reçu ${it.poids}) : ` +
        'un coefficient de bulletin pondère une moyenne, il ne compte pas des individus.',
      );
    }
    for (let k = 0; k < it.poids; k += 1) out.push(it.valeur);
  }
  return out;
}

/* ── Modifier UNE valeur — le geste de l'Observatoire ─────────────── */

/**
 * Remplace la valeur d'indice `i`. Rend une série NEUVE : muter l'objet
 * d'état en place ne redéclencherait aucun rendu React et le laboratoire
 * paraîtrait figé (memory « manipulation gelée »).
 */
export function remplacerValeur(s, i, nouvelleValeur) {
  if (i < 0 || i >= s.items.length) throw new Error(`[statistiques-4e] indice hors série : ${i}`);
  const items = s.items.map((it, k) => (k === i ? { ...it, valeur: nouvelleValeur } : it));
  return { ...s, items };
}

/** Change le POIDS d'une ligne (un coefficient, un effectif). Série neuve. */
export function changerPoids(s, i, nouveauPoids) {
  if (i < 0 || i >= s.items.length) throw new Error(`[statistiques-4e] indice hors série : ${i}`);
  return { ...s, items: s.items.map((it, k) => (k === i ? { ...it, poids: nouveauPoids } : it)) };
}

/** Ajoute un individu en fin de série. Série neuve. */
export function ajouterValeur(s, valeur, { libelle = null, poids: p = 1, cle } = {}) {
  const item = { cle: cle ?? `${s.id ?? 's'}-add-${s.items.length}-${valeur}`, libelle, valeur, poids: p };
  return { ...s, items: [...s.items, item] };
}

/** Retire l'individu d'indice `i`. Série neuve. */
export function retirerValeur(s, i) {
  if (i < 0 || i >= s.items.length) throw new Error(`[statistiques-4e] indice hors série : ${i}`);
  return { ...s, items: s.items.filter((_, k) => k !== i) };
}

/* ══ Les indicateurs ══════════════════════════════════════════════════ */

/**
 * La MOYENNE de la série, pondérée par les poids : Σ pᵢxᵢ / Σ pᵢ.
 * Quand tous les poids valent 1, c'est la moyenne simple de la 5e — la
 * continuité est une propriété du calcul, pas une promesse du texte.
 * `null` sur une série vide : jamais NaN, jamais 0 (« zéro de moyenne » et
 * « personne n'a répondu » ne sont pas la même information).
 */
export function moyenne(s) {
  if (s.items.length === 0) return null;
  return weightedMean(s.items.map((it) => ({ value: it.valeur, count: it.poids })));
}

/** La moyenne SIMPLE, poids ignorés — l'erreur visée du module bulletin. */
export const moyenneSimple = (s) => mean(valeurs(s));

/**
 * La MÉDIANE : la valeur qui partage l'effectif en deux moitiés de même
 * taille. Calculée sur la série DÉVELOPPÉE, donc juste aussi bien pour une
 * liste brute que pour un tableau d'effectifs.
 *
 * EFFECTIF PAIR — c'est un vrai point de la leçon, pas un détail technique :
 * la médiane est alors la demi-somme des deux valeurs centrales, et elle
 * peut n'appartenir à AUCUNE donnée. Un élève qui cherche « la valeur du
 * milieu » dans la liste ne la trouvera pas ; `mediane` le lui dit par
 * `estUneValeurDeLaSerie` (voir `mediane Détail`).
 */
export function mediane(s) {
  const dev = developpee(s);
  return dev.length === 0 ? null : median(dev);
}

/**
 * La médiane AVEC son mode de calcul — jamais un nombre seul.
 * La leçon a besoin de MONTRER les deux rangs centraux quand l'effectif est
 * pair ; les recalculer dans le composant serait une deuxième définition de
 * la médiane, donc une occasion de divergence.
 */
export function medianeDetail(s) {
  const dev = sorted(developpee(s));
  const n = dev.length;
  if (n === 0) return null;
  const pair = n % 2 === 0;
  const mid = Math.floor(n / 2);
  const valeur = pair ? (dev[mid - 1] + dev[mid]) / 2 : dev[mid];
  return {
    valeur,
    effectif: n,
    pair,
    // Rangs affichés à partir de 1 : l'élève compte « la 6e et la 7e valeur ».
    rangs: pair ? [mid, mid + 1] : [mid + 1],
    encadrantes: pair ? [dev[mid - 1], dev[mid]] : [dev[mid]],
    estUneValeurDeLaSerie: dev.includes(valeur),
    triee: dev,
  };
}

/** L'ÉTENDUE : max − min. Toujours positive ou nulle. */
export const etendue = (s) => {
  const dev = developpee(s);
  return dev.length === 0 ? null : range(dev);
};

/** Le minimum et le maximum, qui portent l'étendue. */
export function extremes(s) {
  const dev = sorted(developpee(s));
  return dev.length === 0 ? null : { min: dev[0], max: dev[dev.length - 1] };
}

/**
 * Les TROIS indicateurs d'un coup — ce que l'Observatoire affiche en
 * permanence. Les demander séparément multiplierait les développements de la
 * série ; surtout, les afficher ENSEMBLE est le dispositif qui rend la
 * différence de comportement visible.
 */
export function indicateurs(s) {
  return { moyenne: moyenne(s), mediane: mediane(s), etendue: etendue(s), effectif: effectifTotal(s) };
}

/**
 * Le tableau d'effectifs d'une série brute — la vue de 5e, reprise telle
 * quelle comme point d'appui. Délégué à `frequencyTable` de `common/stats`.
 */
export const tableauEffectifs = (s) => frequencyTable(developpee(s));

/* ══ LA DÉCOUVERTE : sensible ou robuste ? ════════════════════════════ */

/** Un résidu de 1e-13 vient de l'addition de flottants, pas d'un vrai écart. */
const zeroSiBruit = (x) => (Math.abs(x) < 1e-9 ? 0 : x);

/**
 * SENSIBILITÉ — de combien chaque indicateur bouge quand on remplace UNE
 * valeur. C'est la fonction centrale de la leçon.
 *
 * POURQUOI ELLE EST CALCULÉE ET NON RACONTÉE. « La moyenne est sensible aux
 * valeurs extrêmes » est un slogan qu'on peut réciter sans y croire. Ici
 * l'élève tire une valeur, et les trois écarts s'affichent : la moyenne
 * bouge de (nouvelle − ancienne)/N à chaque cran, la médiane reste souvent
 * clouée, l'étendue ne réagit que si on touche un extrême. Le texte ne dit
 * rien que le nombre ne montre déjà.
 *
 * `deltaMoyenne` est EXACTEMENT (v − ancienne) / N sur une série non
 * pondérée — propriété vérifiée par balayage dans les tests, parce que c'est
 * elle qui rend la sensibilité prévisible et donc démontrable.
 */
export function sensibilite(s, i, nouvelleValeur) {
  if (i < 0 || i >= s.items.length) throw new Error(`[statistiques-4e] indice hors série : ${i}`);
  const avant = indicateurs(s);
  const apres = indicateurs(remplacerValeur(s, i, nouvelleValeur));
  const d = (k) => zeroSiBruit((apres[k] ?? 0) - (avant[k] ?? 0));
  const deltaMoyenne = d('moyenne');
  const deltaMediane = d('mediane');
  const deltaEtendue = d('etendue');
  return {
    ancienneValeur: s.items[i].valeur,
    nouvelleValeur,
    avant,
    apres,
    deltaMoyenne,
    deltaMediane,
    deltaEtendue,
    // Le VERDICT, pour que le composant n'ait pas à réinventer le seuil.
    moyenneABouge: deltaMoyenne !== 0,
    medianeABouge: deltaMediane !== 0,
    etendueABouge: deltaEtendue !== 0,
  };
}

/**
 * Balayage complet : la sensibilité pour CHAQUE valeur atteignable de la
 * poignée. C'est ce qui permet aux tests de vérifier une affirmation sur
 * TOUT le domaine plutôt que sur l'exemple choisi par l'auteur (§6ter.2) —
 * et au module de colorer d'avance les crans qui déplacent la médiane.
 */
export function balayerSensibilite(s, i, valeursTestees) {
  return valeursTestees.map((v) => ({ valeur: v, ...sensibilite(s, i, v) }));
}

/**
 * L'indicateur ROBUSTE d'un balayage : celui qui n'a bougé sur AUCUNE des
 * valeurs testées. Renvoie la liste — il peut y en avoir deux, ou aucun, et
 * prétendre le contraire serait déjà une affirmation non vérifiée.
 */
export function indicateursRobustes(balayage) {
  const bouge = (k) => balayage.some((b) => b[k] !== 0);
  const out = [];
  if (!bouge('deltaMoyenne')) out.push('moyenne');
  if (!bouge('deltaMediane')) out.push('mediane');
  if (!bouge('deltaEtendue')) out.push('etendue');
  return out;
}

/* ══ COMPARER DEUX SÉRIES ═════════════════════════════════════════════ */

/** Égalité d'indicateurs à la tolérance d'affichage — jamais `===` sur des flottants. */
const memeNombre = (a, b, tol = 1e-9) => a !== null && b !== null && Math.abs(a - b) <= tol;

/**
 * COMPARAISON de deux séries : quel indicateur les SÉPARE, lequel ne les
 * sépare pas, et de combien.
 *
 * POURQUOI CE N'EST PAS UN BOOLÉEN. « La série A est meilleure » n'est pas
 * une phrase statistique. La seule chose qu'on puisse dire est : « la
 * moyenne ne les distingue pas, la médiane oui » — et c'est exactement
 * l'apprentissage visé par le LP « Comparer deux séries statistiques ».
 * `separent` / `neSeparentPas` sont donc rendus comme deux listes, et
 * `verdict` est une phrase construite à partir d'elles, jamais saisie à la
 * main dans un module.
 */
export function comparer(sa, sb) {
  const a = indicateurs(sa);
  const b = indicateurs(sb);
  const cles = ['moyenne', 'mediane', 'etendue'];
  const details = cles.map((k) => ({
    indicateur: k,
    a: a[k],
    b: b[k],
    egal: memeNombre(a[k], b[k]),
    ecart: a[k] === null || b[k] === null ? null : zeroSiBruit(b[k] - a[k]),
    plusGrande: memeNombre(a[k], b[k]) ? null : (a[k] > b[k] ? 'a' : 'b'),
  }));
  const separent = details.filter((d) => !d.egal).map((d) => d.indicateur);
  const neSeparentPas = details.filter((d) => d.egal).map((d) => d.indicateur);
  return {
    a,
    b,
    details,
    separent,
    neSeparentPas,
    verdict:
      separent.length === 0
        ? 'aucun des trois indicateurs ne distingue ces deux séries'
        : `${neSeparentPas.length === 0 ? 'les trois indicateurs les distinguent' : `${neSeparentPas.join(' et ')} ne ${neSeparentPas.length > 1 ? 'les distinguent' : 'la distingue'} pas`}, ${separent.join(' et ')} oui`,
  };
}

/**
 * L'indicateur à choisir pour répondre à une QUESTION donnée. La leçon ne
 * demande pas « quel est le meilleur indicateur » (il n'y en a pas) mais
 * « lequel répond à CETTE question » — la réponse dépend de la question,
 * jamais de la série.
 */
export const QUESTIONS_INDICATEUR = {
  'total-partage': { indicateur: 'moyenne', question: 'Si on partageait tout également, chacun aurait combien ?' },
  'valeur-typique': { indicateur: 'mediane', question: 'Quelle valeur partage le groupe en deux moitiés ?' },
  'regularite': { indicateur: 'etendue', question: 'Les valeurs sont-elles resserrées ou dispersées ?' },
  'extremes-presents': { indicateur: 'mediane', question: 'Une valeur très à part fausse-t-elle le résumé ?' },
};

/* ══ LE GRAPHIQUE QUI MENT — axe tronqué ══════════════════════════════ */

/**
 * FACTEUR D'EXAGÉRATION d'un axe tronqué.
 *
 * Deux barres de valeurs `basse` et `haute` sur un axe qui démarre à
 * `depart` : l'œil compare les HAUTEURS DESSINÉES, donc le rapport
 * (haute − depart)/(basse − depart), alors que la vérité est haute/basse.
 * Le facteur est le quotient des deux. Il vaut EXACTEMENT 1 quand l'axe part
 * de zéro — la seule échelle qui ne ment pas — et explose quand `depart`
 * s'approche de la barre basse.
 *
 * C'est ce que la 5e ne pouvait pas faire : elle savait lire un diagramme,
 * elle ne pouvait pas le mettre en cause. En 4e, l'axe devient un objet
 * qu'on déplace, et le mensonge devient un NOMBRE.
 *
 * Le départ doit rester STRICTEMENT sous la barre basse : au-dessus, la
 * barre basse n'a plus de hauteur (ou une hauteur négative) et le graphique
 * ne représente plus rien du tout — on lève au lieu de rendre un ∞ que
 * l'affichage traduirait en pixels absurdes.
 */
export function exagerationAxe({ basse, haute, depart = 0 }) {
  if (basse <= 0 || haute <= 0) {
    throw new Error('[statistiques-4e] l’axe tronqué se raisonne sur des grandeurs positives');
  }
  if (depart >= basse) {
    throw new Error(
      `[statistiques-4e] un axe qui démarre à ${depart} coupe la barre basse (${basse}) : ` +
      'le diagramme ne représenterait plus rien.',
    );
  }
  const rapportReel = haute / basse;
  const rapportVu = (haute - depart) / (basse - depart);
  return {
    depart,
    rapportReel,
    rapportVu,
    facteur: rapportVu / rapportReel,
    // « Honnête » ⟺ l'axe part de zéro. Ce n'est pas un seuil de tolérance
    // choisi par l'auteur : c'est la définition.
    honnete: depart === 0,
    ecartReelPct: (haute - basse) / basse,
  };
}

/* ══ Écritures françaises ═════════════════════════════════════════════ */

/** Nombre à la française — virgule décimale, vrai signe moins (U+2212). */
export const fr = (v, d = 2) => formatNumber(v, d);

/** Une valeur avec son unité : « 12,5 min ». */
export const avecUnite = (v, u) => (v === null || v === undefined ? '—' : `${fr(v)}${u ? ` ${u}` : ''}`);

/**
 * Un écart SIGNÉ, tel qu'un tableau de bord l'affiche : « +2,5 », « −1 »,
 * « 0 ». Le signe explicite est ce qui rend la sensibilité lisible d'un coup
 * d'œil — « 2,5 » ne dit pas dans quel sens la moyenne est partie.
 */
export function ecart(v, d = 2) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  if (Math.abs(v) < 1e-9) return '0';
  return `${v > 0 ? '+' : '−'}${fr(Math.abs(v), d)}`;
}

/** Le calcul d'une moyenne pondérée, écrit comme au tableau. */
export function ecritureMoyennePonderee(s) {
  const num = s.items.map((it) => `${it.poids} × ${fr(it.valeur)}`).join(' + ');
  const den = s.items.map((it) => `${it.poids}`).join(' + ');
  return `(${num}) ÷ (${den}) = ${fr(moyenne(s))}`;
}

/* ══════════════════════════════════════════════════════════════════════
   LES DONNÉES DE LA LEÇON

   Chaque série est choisie POUR CE QU'ELLE REND VISIBLE, et un test vérifie
   qu'elle le rend effectivement visible. Une donnée qui cesserait de
   démontrer son point casserait le test avant d'atteindre un élève.
   ══════════════════════════════════════════════════════════════════════ */

/**
 * M1 — L'OBSERVATOIRE : douze temps de trajet domicile–collège, en minutes.
 *
 * CE QU'ELLE DOIT MONTRER, ET QUI EST TESTÉ :
 *  · moyenne = 16 min EXACTEMENT, médiane = 12,5 min : les deux nombres
 *    diffèrent nettement, sans quoi la leçon entière tomberait à plat ;
 *  · 12,5 n'appartient à AUCUN élève — c'est la demi-somme de 12 et 13.
 *    L'effectif pair n'est donc pas un cas particulier qu'on mentionne, il
 *    est là dès la première seconde ;
 *  · un élève à 50 min (le seul qui vienne de loin) tire la moyenne
 *    au-dessus de HUIT des douze valeurs, et à 3,5 min au-dessus de la
 *    médiane : « la moyenne, c'est le milieu » est démenti par la donnée
 *    elle-même, pas par le professeur ;
 *  · déplacer cet élève de 23 à 90 min laisse la médiane EXACTEMENT à 12,5,
 *    déplace la moyenne à chaque cran, et l'étendue aussi. Robuste et
 *    sensible se distinguent en une manipulation.
 */
export const TRAJETS = serie({
  id: 'trajets',
  nom: 'Temps de trajet jusqu’au collège',
  unite: 'min',
  items: [
    { libelle: 'Nina', valeur: 6 },
    { libelle: 'Sacha', valeur: 7 },
    { libelle: 'Ismaël', valeur: 9 },
    { libelle: 'Camille', valeur: 10 },
    { libelle: 'Théo', valeur: 11 },
    { libelle: 'Awa', valeur: 12 },
    { libelle: 'Lise', valeur: 13 },
    { libelle: 'Rayan', valeur: 15 },
    { libelle: 'Jonas', valeur: 17 },
    { libelle: 'Elena', valeur: 20 },
    { libelle: 'Maël', valeur: 22 },
    { libelle: 'Soline', valeur: 50 },
  ],
});

/** L'indice de Soline — la poignée que l'élève déplace au module 1. */
export const INDICE_ELOIGNE = 11;

/**
 * Le domaine ATTEIGNABLE de cette poignée. Toute affirmation de la leçon sur
 * la manipulation est vérifiée SUR CE DOMAINE, pas sur trois exemples.
 * Il démarre à 23 : en dessous, Soline ne serait plus la valeur maximale et
 * la lecture du graphique changerait de nature en cours de manipulation.
 */
export const DOMAINE_ELOIGNE = { min: 23, max: 90, pas: 1 };

/** L'axe commun des représentations de trajets. */
export const AXE_TRAJETS = { min: 0, max: 90, pas: 10 };

/**
 * M2 — LE BULLETIN : quatre épreuves affectées de coefficients.
 *
 * CE QU'ELLE DOIT MONTRER, ET QUI EST TESTÉ :
 *  · moyenne SIMPLE 12,5 contre moyenne PONDÉRÉE 11,2 : l'écart est de
 *    1,3 point, assez pour que « ça ne change pas grand-chose » ne tienne
 *    pas — et il fait basculer d'un côté à l'autre de 12 ;
 *  · la somme des coefficients vaut 10, donc l'élève peut refaire le calcul
 *    de tête et vérifier la machine ;
 *  · les deux notes les plus FORTES portent les coefficients les plus
 *    FAIBLES : c'est ce qui rend l'effet du coefficient visible dans le bon
 *    sens. Avec des coefficients alignés sur les notes, pondérer et ne pas
 *    pondérer donneraient presque la même chose et le module ne prouverait
 *    rien.
 */
export const BULLETIN = serie({
  id: 'bulletin',
  nom: 'Bulletin de mathématiques',
  unite: '/20',
  items: [
    { libelle: 'Devoir maison', valeur: 16, poids: 1 },
    { libelle: 'Interrogation', valeur: 14, poids: 1 },
    { libelle: 'Devoir surveillé', valeur: 9, poids: 3 },
    { libelle: 'Brevet blanc', valeur: 11, poids: 5 },
  ],
});

/**
 * M2 bis — LE TABLEAU D'EFFECTIFS : « combien de frères et sœurs ? », posé
 * aux 25 élèves de la classe.
 *
 * Le MÊME outil (moyenne pondérée) répond à une question de nature
 * différente : ici le poids n'est pas un coefficient choisi par le
 * professeur, c'est un EFFECTIF compté dans la classe. Rencontrer les deux
 * est ce qui empêche l'élève de croire que « pondéré » veut dire « bulletin ».
 *
 * TESTÉ : 25 individus pour 5 lignes (l'erreur « diviser par 5 » donnerait
 * 8,4 au lieu de 1,68 — un nombre absurde de frères et sœurs, ce qui rend
 * l'erreur visible à l'élève lui-même).
 */
export const FRATRIES = serie({
  id: 'fratries',
  nom: 'Nombre de frères et sœurs',
  unite: '',
  items: [
    { libelle: 'aucun', valeur: 0, poids: 4 },
    { libelle: 'un', valeur: 1, poids: 9 },
    { libelle: 'deux', valeur: 2, poids: 7 },
    { libelle: 'trois', valeur: 3, poids: 3 },
    { libelle: 'cinq', valeur: 5, poids: 2 },
  ],
});

/**
 * M5 — LA PAIRE QUE SEULE LA MÉDIANE SÉPARE.
 *
 * Deux groupes de neuf élèves au même contrôle. Même moyenne (12), même
 * étendue (15, de 4 à 19) : DEUX indicateurs sur trois sont aveugles. Seule
 * la médiane les distingue (14 contre 12).
 *
 * C'est la construction la plus fragile de la leçon, et donc la plus
 * testée : si un jour les moyennes cessaient d'être égales, le module
 * affirmerait « la moyenne ne les distingue pas » devant deux nombres
 * différents. Le test compare les trois indicateurs, pas seulement celui que
 * la rédaction met en avant.
 */
export const GROUPE_ROUGE = serie({
  id: 'groupe-rouge',
  nom: 'Groupe Rouge',
  unite: '/20',
  items: [4, 6, 7, 13, 14, 14, 15, 16, 19],
});

export const GROUPE_BLEU = serie({
  id: 'groupe-bleu',
  nom: 'Groupe Bleu',
  unite: '/20',
  items: [4, 9, 11, 12, 12, 13, 14, 14, 19],
});

/**
 * M6 — LA PAIRE QUE SEULE L'ÉTENDUE SÉPARE : la comparaison symétrique.
 *
 * Températures de midi sur neuf jours, dans deux villes. Même moyenne (18),
 * même MÉDIANE (18) : cette fois ce sont les deux indicateurs de position
 * qui sont aveugles, et seule l'étendue parle (4 contre 19).
 *
 * Les deux paires ensemble interdisent la conclusion paresseuse « la médiane
 * est le bon indicateur » : chaque indicateur voit ce que les autres ne
 * voient pas, et aucun ne suffit seul. Sans la seconde paire, la leçon
 * enseignerait une préférence au lieu d'un choix.
 */
export const VILLE_ABRITEE = serie({
  id: 'ville-abritee',
  nom: 'Val-Serein',
  unite: '°C',
  items: [16, 17, 17, 18, 18, 18, 19, 19, 20],
});

export const VILLE_EXPOSEE = serie({
  id: 'ville-exposee',
  nom: 'Mont-Venteux',
  unite: '°C',
  items: [8, 12, 15, 17, 18, 19, 21, 25, 27],
});

/**
 * M7 — LE GRAPHIQUE QUI MENT : un sondage à 48 % contre 52 %.
 *
 * Un écart réel de 4 points, soit un rapport de 1,083. Sur un axe qui
 * démarre à 45, l'œil voit une barre plus de DEUX FOIS plus haute que
 * l'autre. Le contexte (un sondage) est celui où ce trucage est le plus
 * fréquemment rencontré hors de l'école.
 *
 * `departs` est le domaine de la poignée : de 0 (honnête) à 47 (juste sous
 * la barre basse). Les tests vérifient que le facteur croît sur TOUT ce
 * domaine et vaut exactement 1 en 0.
 */
export const SONDAGE_TRUQUE = {
  id: 'sondage',
  nom: 'Sondage — deux propositions',
  unite: '%',
  basse: 48,
  haute: 52,
  libelles: ['Proposition A', 'Proposition B'],
  departs: [0, 20, 40, 44, 45, 46, 47],
};
