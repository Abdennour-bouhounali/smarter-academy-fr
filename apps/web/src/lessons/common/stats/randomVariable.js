/**
 * Variables aléatoires discrètes — noyau de calcul partagé.
 *
 * Le pendant probabiliste de statsUtils : là où `weightedMean` fait la moyenne
 * d'une SÉRIE OBSERVÉE pondérée par des effectifs, ce module calcule ce que
 * l'on ATTEND d'une expérience dont on connaît le modèle. Les deux nombres se
 * ressemblent et se calculent presque pareil — c'est tout l'objet de la leçon
 * « Variables aléatoires : loi et espérance » —, mais l'un se constate et
 * l'autre se prévoit.
 *
 * DEUX RÈGLES QUE CE MODULE FAIT RESPECTER PAR CONSTRUCTION :
 *
 * 1. Une loi de probabilité dont les probabilités ne somment pas à 1 n'est pas
 *    une loi : `makeLaw` la REJETTE. Une leçon qui afficherait un tableau faux
 *    enseignerait un faux, et aucun contrôle d'affichage ne le rattraperait.
 *
 * 2. Les probabilités s'écrivent en FRACTIONS de dénominateur commun, jamais
 *    en décimaux saisis à la main : 0,1 + 0,2 ne fait pas 0,3 en flottant,
 *    et six secteurs sur dix se somment exactement quand on les compte en
 *    dixièmes. `lawFromCounts` est la porte d'entrée normale.
 *
 * L'ALÉA EST INJECTÉ : `sampleFromLaw` reçoit son générateur (`makeRng` de
 * randomUtils), il n'en fabrique jamais. Une simulation doit être rejouable —
 * pour les tests, pour l'e2e, et pour qu'un élève retrouve SA série.
 */
import { sum, weightedMean } from './statsUtils';

/** Tolérance de somme des probabilités : le bruit d'un flottant, rien de plus. */
const EPS = 1e-9;

/**
 * Construit une loi de probabilité à partir de couples (valeur, probabilité).
 *
 * `pairs` = [{ x, p }] ou [[x, p]]. Rend [{ x, p }] TRIÉ par valeur croissante
 * — l'ordre de lecture d'un tableau de loi, celui que l'élève doit apprendre à
 * produire.
 *
 * Rejette : une loi vide, une probabilité hors [0 ; 1], une valeur répétée
 * (deux lignes pour la même valeur ne sont pas un tableau de loi : il faut les
 * réunir), et surtout une somme différente de 1.
 */
export function makeLaw(pairs) {
  if (!Array.isArray(pairs) || pairs.length === 0) {
    throw new Error('makeLaw : une loi de probabilité a au moins une valeur.');
  }
  const rows = pairs.map((entry) => {
    const x = Array.isArray(entry) ? entry[0] : entry.x;
    const p = Array.isArray(entry) ? entry[1] : entry.p;
    if (!Number.isFinite(x)) throw new Error('makeLaw : chaque valeur doit être un nombre.');
    if (!Number.isFinite(p) || p < 0 || p > 1) {
      throw new Error(`makeLaw : probabilité hors de [0 ; 1] pour la valeur ${x} (p = ${p}).`);
    }
    return { x, p };
  });

  const valeurs = rows.map((r) => r.x);
  if (new Set(valeurs).size !== valeurs.length) {
    throw new Error('makeLaw : une valeur ne peut apparaître qu’une fois — réunis les lignes.');
  }

  const total = sum(rows.map((r) => r.p));
  if (Math.abs(total - 1) > EPS) {
    throw new Error(`makeLaw : les probabilités somment à ${total}, et non à 1.`);
  }

  return rows.sort((a, b) => a.x - b.x);
}

/**
 * Loi construite à partir d'EFFECTIFS entiers de dénominateur commun —
 * la voie normale, celle qui garantit la somme exacte.
 *
 * `counts` = [{ x, n }] : n secteurs de roue, n faces de dé, n boules.
 *
 * LE PIÈGE, ATTRAPÉ PAR LE TEST. Écrire simplement `p = n / total` ne suffit
 * PAS : 6/10 + 3/10 + 1/10 vaut 0,999 999 999 999 999 9 en flottants, parce que
 * 0,6, 0,3 et 0,1 n'ont aucun développement binaire fini. La fraction est donc
 * CONSERVÉE (`n` et `total` restent sur chaque ligne) et la somme est vérifiée
 * sur les EFFECTIFS — des entiers, où Σn = total est exact. Le flottant `p`
 * n'est plus qu'un affichage et un pas de tirage.
 */
export function lawFromCounts(counts) {
  const lignes = counts.map((c) => {
    const x = Array.isArray(c) ? c[0] : c.x;
    const n = Array.isArray(c) ? c[1] : c.n;
    if (!Number.isFinite(x)) throw new Error('lawFromCounts : chaque valeur doit être un nombre.');
    if (!Number.isInteger(n) || n < 0) {
      throw new Error(`lawFromCounts : effectif entier positif attendu pour la valeur ${x}.`);
    }
    return { x, n };
  });

  const total = sum(lignes.map((l) => l.n));
  if (total <= 0) throw new Error('lawFromCounts : l’effectif total doit être strictement positif.');
  // La somme des probabilités est exacte PAR CONSTRUCTION : Σn / total = 1 sur
  // des entiers. `makeLaw` la revérifierait sur les flottants et la refuserait à
  // tort ; on construit donc la loi directement, en gardant la fraction.
  const valeurs = lignes.map((l) => l.x);
  if (new Set(valeurs).size !== valeurs.length) {
    throw new Error('lawFromCounts : une valeur ne peut apparaître qu’une fois — réunis les lignes.');
  }
  return lignes
    .map((l) => ({ x: l.x, p: l.n / total, n: l.n, total }))
    .sort((a, b) => a.x - b.x);
}

/**
 * La somme des probabilités d'une loi, EXACTE quand la loi vient d'effectifs.
 *
 * Une loi construite par `lawFromCounts` porte sa fraction : on somme alors les
 * ENTIERS et l'on divise une seule fois, ce qui rend exactement 1. Sinon on
 * somme les flottants, et l'on retombe sur le résidu — c'est précisément
 * pourquoi les leçons passent par les effectifs.
 */
export function probabilitySum(law) {
  if (law.every((r) => Number.isInteger(r.n) && Number.isInteger(r.total) && r.total > 0)) {
    return sum(law.map((r) => r.n)) / law[0].total;
  }
  return sum(law.map((r) => r.p));
}

/**
 * Espérance E(X) = Σ xᵢ pᵢ.
 *
 * C'est EXACTEMENT une moyenne pondérée dont les poids sont les probabilités :
 * on réutilise `weightedMean` de statsUtils plutôt que de réécrire la somme —
 * une seule définition de la moyenne pondérée dans tout le projet. Comme les
 * probabilités somment à 1, le dénominateur vaut 1 et la formule se lit bien
 * « somme des valeurs × leur probabilité ».
 */
export function expectation(law) {
  return weightedMean(law.map((r) => ({ value: r.x, count: r.p })));
}

/**
 * Une valeur de la loi est-elle égale à l'espérance ?
 *
 * Sert au CONTRÔLE PÉDAGOGIQUE : le sel de la leçon est que l'espérance est en
 * général une valeur que l'expérience ne donne JAMAIS (gagner 1,40 € à une roue
 * qui ne paie que 0, 1 ou 5 €). Un test verrouille cette propriété sur les
 * données de la leçon.
 */
export function expectationIsAttainable(law, eps = 1e-9) {
  const e = expectation(law);
  return law.some((r) => Math.abs(r.x - e) <= eps);
}

/**
 * Bénéfice espéré d'un jeu de mise donnée : E(X) − mise.
 * Positif, le jeu est favorable au joueur ; négatif, il l'est à l'organisateur.
 */
export const expectedProfit = (law, mise = 0) => expectation(law) - mise;

/**
 * Un jeu est ÉQUITABLE quand l'espérance de gain égale la mise : à long terme,
 * ni le joueur ni l'organisateur ne gagne. C'est une égalité de nombres, pas
 * une impression de justice — d'où la tolérance minuscule, pour le seul bruit
 * des flottants.
 */
export const isFairGame = (law, mise, eps = 1e-9) => Math.abs(expectation(law) - mise) <= eps;

/**
 * Moyenne d'un échantillon effectivement observé. `null` sur un échantillon
 * vide (jamais NaN), comme `mean` de statsUtils dont elle est le relais.
 *
 * ELLE N'EST PAS L'ESPÉRANCE. Sur 500 tirages elle s'en APPROCHE, elle ne
 * l'atteint pas : aucune leçon ne doit affirmer l'égalité.
 */
export function empiricalMean(samples) {
  if (!samples || samples.length === 0) return null;
  return sum(samples) / samples.length;
}

/**
 * Écart type de la loi — l'échelle naturelle de l'écart entre moyenne observée
 * et espérance. Le seuil d'un test de convergence se DÉCLARE en σ/√n, pas en
 * euros : sur la même roue, un gros lot dix fois plus élevé rend l'écart dix
 * fois plus large sans que rien ne soit cassé.
 */
export function lawStandardDeviation(law) {
  const e = expectation(law);
  return Math.sqrt(sum(law.map((r) => r.p * (r.x - e) ** 2)));
}

/**
 * `n` tirages dans la loi, avec un générateur INJECTÉ (`makeRng`).
 *
 * Chaque tirage est réellement calculé : ce n'est pas une animation. Le résidu
 * de flottant est absorbé par la dernière ligne, ce qui interdit un `undefined`
 * quand la somme des probabilités vaut 0,999 999 999 9.
 */
export function sampleFromLaw(law, n, rng) {
  if (typeof rng !== 'function') {
    throw new Error('sampleFromLaw : le générateur doit être injecté (makeRng), jamais tiré ici.');
  }
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const u = rng();
    let acc = 0;
    let choisi = law[law.length - 1].x;
    for (const r of law) {
      acc += r.p;
      if (u < acc) { choisi = r.x; break; }
    }
    out.push(choisi);
  }
  return out;
}

/**
 * Le GRAND LIVRE d'une série de tirages : chaque valeur de la loi avec son
 * effectif observé, sa fréquence, et la probabilité qu'elle avait.
 *
 * Les valeurs viennent de la LOI, pas de l'échantillon : une valeur jamais
 * sortie doit apparaître avec un effectif nul — c'est elle qui rend visible
 * qu'une petite série ne montre pas tout.
 */
export function tally(law, samples) {
  const n = samples.length;
  return law.map((r) => {
    const count = samples.filter((v) => v === r.x).length;
    return { x: r.x, p: r.p, count, frequency: n === 0 ? 0 : count / n };
  });
}
