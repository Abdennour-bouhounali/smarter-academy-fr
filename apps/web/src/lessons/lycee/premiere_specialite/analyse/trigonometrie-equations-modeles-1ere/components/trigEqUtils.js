/**
 * Le modèle mathématique de « Fonctions trigonométriques : équations et
 * phénomènes périodiques ».
 *
 * Tout ce que les modules affichent en est DÉRIVÉ : aucune solution, aucun
 * arc, aucune valeur de duplication n'est écrite à la main dans un module.
 *
 * ─── CE QUE CE FICHIER NE FAIT PAS ─────────────────────────────────────────
 * Il ne réécrit RIEN du noyau partagé `common/analysis/trig.js` (TAU, PAS,
 * REMARQUABLES, principal, sinExact/cosExact, labelPi, texPi, fr) : il le
 * CONSOMME et le réexporte. Il ne touche pas non plus au `trigFnUtils.js` de
 * la leçon amont (« du cercle à la courbe »), qui est livré et audité — la
 * fenêtre mesurée et l'enroulement continu y sont RE-DÉRIVÉS ici, pour les
 * besoins propres de cette leçon (une BARRE horizontale, pas un point qui
 * tourne), jamais importés depuis une autre leçon.
 *
 * ─── L'APPORT PROPRE DE CETTE LEÇON ────────────────────────────────────────
 * La Seconde (`trigonometrie-equations-2nde`, livrée) résout DÉJÀ cos t = a et
 * sin t = b SUR UN TOUR, et connaît DÉJÀ les formules d'addition. Ce fichier
 * porte donc, et rien d'autre :
 *   · la FAMILLE de solutions sur ℝ tout entier (±a + 2kπ, ou a + 2kπ et
 *     π − a + 2kπ) — une infinité, régulièrement espacée ;
 *   · les INÉQUATIONS : la solution est un ARC de cercle, pas deux points ;
 *   · les formules de DUPLICATION, DÉRIVÉES des formules d'addition en y
 *     posant b = a — jamais recopiées ;
 *   · la MODÉLISATION d'un phénomène périodique : amplitude, période, décalage.
 */
import {
  TAU, PAS, REMARQUABLES, principal, remarquableDe, sinExact, cosExact,
  echantillonner, labelPi, texPi, fr,
} from '../../../../../common/analysis/trig';

export {
  TAU, PAS, REMARQUABLES, principal, remarquableDe, sinExact, cosExact,
  echantillonner, labelPi, texPi, fr,
};

/**
 * `parseSigned` — `parseDec` du noyau refuse le vrai signe moins U+2212, que
 * la leçon AFFICHE partout (« −0,5 ») et que l'élève RECOPIE. On normalise les
 * trois tirets longs avant de déléguer. (Piège payé par trois agents du lot 1.)
 */
export function parseSigned(parseDec) {
  return (s) => parseDec(String(s).replace(/[−–—]/g, '-'));
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. LA BARRE : les valeurs de k qu'elle peut prendre
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * LES CRANS DE LA BARRE — une LISTE, pas un pas régulier.
 *
 * POURQUOI PAS UN PAS RÉGULIER. La manipulation signature exige
 * que l'élève puisse tomber EXACTEMENT sur chacune des valeurs remarquables
 * de k : 0, ±1/2, ±√2/2, ±√3/2, ±1. Or √2/2 ≈ 0,7071 et √3/2 ≈ 0,8660 ne sont
 * multiples d'aucun pas décimal. Un cliquet régulier ne peut donc PAS les
 * atteindre — et sans elles, l'élève ne rencontrerait jamais un cas exact.
 *
 * La parade : les crans ne sont pas régulièrement espacés en VALEUR. Ce sont
 * les hauteurs remarquables elles-mêmes, plus des hauteurs intermédiaires qui
 * remplissent la plage. `CRANS_K` est donc une LISTE, et l'aimantation choisit
 * l'élément le plus proche — exactement comme `aimanter` du module de lecture
 * de la leçon amont.
 *
 * Les crans |k| > 1 sont INDISPENSABLES : c'est là que la barre ne coupe plus
 * rien, et que l'élève constate « aucune solution ». Le test le vérifie.
 */
const R2 = Math.SQRT2 / 2;
const R3 = Math.sqrt(3) / 2;

/** Les cinq hauteurs remarquables positives, EXACTES (issues du noyau). */
export const K_REMARQUABLES = [0, 0.5, R2, R3, 1];

/**
 * Les hauteurs intermédiaires, qui donnent au cliquet un grain régulier sans
 * jamais coïncider avec une hauteur remarquable (test) — un cran « presque
 * √2/2 » rendrait l'aimantation illisible.
 */
const INTERMEDIAIRES = [0.25, 0.62];

/**
 * Au-delà de 1 : les hauteurs SANS solution, ATTEIGNABLES (test).
 *
 * DÉFAUT ATTRAPÉ PAR LE TEST. La première version montait à 1,5. Or la barre
 * de hauteur k est dessinée à l'ordonnée CY − k·R : à 1,5 elle sortait du
 * cadre par le haut, et sa bande de préhension avec elle (« bande de −3 px »).
 * Une consigne du module 1 — « monte la barre jusqu'à ce qu'il n'y ait plus
 * aucun point » — devenait donc infaisable au geste.
 * Deux crans hors bornes suffisent, et 1,3 tient dans le cadre avec sa bande
 * entière (test).
 */
export const K_HORS_BORNES = [1.15, 1.3];

/** Tous les crans de la barre, croissants, symétriques autour de 0. */
export const CRANS_K = (() => {
  const positifs = [...K_REMARQUABLES.filter((v) => v > 0), ...INTERMEDIAIRES, ...K_HORS_BORNES];
  const tous = [...positifs.map((v) => -v), 0, ...positifs];
  return tous.sort((a, b) => a - b);
})();

/** Le cran de la liste le plus proche de v — l'aimantation de la barre. */
export function aimanterK(v, crans = CRANS_K) {
  let best = crans[0];
  for (const c of crans) if (Math.abs(c - v) < Math.abs(best - v)) best = c;
  return best;
}

/** L'indice d'un cran dans la liste (−1 s'il n'y est pas). */
export const indexK = (k, crans = CRANS_K) => crans.findIndex((c) => Math.abs(c - k) < 1e-12);

/** Le cran suivant / précédent, borné : le cliquet ne sort jamais de la liste. */
export function decalerK(k, d, crans = CRANS_K) {
  const i = indexK(k, crans);
  if (i < 0) return k;
  return crans[Math.max(0, Math.min(crans.length - 1, i + d))];
}

/**
 * L'écriture d'une hauteur remarquable : « √2/2 » plutôt que « 0,71 ».
 * DÉRIVÉE de la valeur, jamais saisie à côté d'elle — texte et figure ne
 * peuvent donc pas se contredire.
 */
export function ecritureK(k, eps = 1e-12) {
  const table = [
    [0, '0'], [0.5, '1/2'], [R2, '√2/2'], [R3, '√3/2'], [1, '1'],
  ];
  for (const [v, s] of table) {
    if (Math.abs(k - v) < eps) return s;
    if (Math.abs(k + v) < eps && v !== 0) return `−${s}`;
  }
  return fr(k, 2);
}

/** L'écriture KaTeX de la même hauteur. */
export function texK(k, eps = 1e-12) {
  const table = [
    [0, '0'], [0.5, '\\dfrac{1}{2}'], [R2, '\\dfrac{\\sqrt{2}}{2}'],
    [R3, '\\dfrac{\\sqrt{3}}{2}'], [1, '1'],
  ];
  for (const [v, s] of table) {
    if (Math.abs(k - v) < eps) return s;
    if (Math.abs(k + v) < eps && v !== 0) return `-${s}`;
  }
  return fr(k, 2).replace('−', '-').replace(',', '.');
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. LES SOLUTIONS SUR UN TOUR, PUIS SUR ℝ
   ═══════════════════════════════════════════════════════════════════════════ */

/** Les deux fonctions étudiées, avec ce qui les DISTINGUE. */
export const COS = {
  id: 'cos',
  nom: 'cosinus',
  ecriture: 'cos',
  exact: cosExact,
  /** La droite qui coupe le cercle est VERTICALE (abscisse k). */
  droite: 'verticale',
  /** La seconde solution se lit par symétrie par rapport à l'axe HORIZONTAL. */
  symetrie: 'axe horizontal',
  tone: '#4f46e5',
};

export const SIN = {
  id: 'sin',
  nom: 'sinus',
  ecriture: 'sin',
  exact: sinExact,
  droite: 'horizontale',
  symetrie: 'axe vertical',
  tone: '#059669',
};

/**
 * La solution PRINCIPALE de cos x = k : l'unique réel de [0 ; π] dont le
 * cosinus vaut k. C'est le t₀ que la Seconde appelle déjà ainsi.
 *
 * EXACTITUDE : quand k est une hauteur remarquable, `Math.acos` rend un réel
 * approché (acos(0.5) = 1.0471975511965979, pas exactement π/3). On CHERCHE
 * donc d'abord le cran remarquable dont le cosinus vaut k, et l'on ne retombe
 * sur `Math.acos` que si k n'est pas remarquable. Sans cela, la leçon
 * afficherait « 1,05 » là où elle promet « π/3 ».
 */
export function solutionPrincipaleCos(k, eps = 1e-12) {
  if (k < -1 - eps || k > 1 + eps) return null;
  for (const r of REMARQUABLES) {
    if (r.t <= Math.PI + 1e-12 && Math.abs(r.cos - k) < eps) return r.t;
  }
  if (Math.abs(k - (-1)) < eps) return Math.PI;
  return Math.acos(Math.max(-1, Math.min(1, k)));
}

/**
 * La solution principale de sin x = k : l'unique réel de [−π/2 ; π/2] dont le
 * sinus vaut k. Même garantie d'exactitude que ci-dessus.
 */
export function solutionPrincipaleSin(k, eps = 1e-12) {
  if (k < -1 - eps || k > 1 + eps) return null;
  for (const r of REMARQUABLES) {
    const t = r.t <= Math.PI / 2 + 1e-12 ? r.t : r.t >= (3 * Math.PI) / 2 - 1e-12 ? r.t - TAU : null;
    if (t !== null && Math.abs(r.sin - k) < eps) return t;
  }
  return Math.asin(Math.max(-1, Math.min(1, k)));
}

/**
 * ─── LA FAMILLE DE SOLUTIONS SUR ℝ — LE CŒUR DE LA LEÇON ────────────────────
 *
 * Résoudre cos x = k sur ℝ, ce n'est pas trouver UN nombre : c'est décrire une
 * FAMILLE infinie. Deux points sur le cercle, puis « plus 2kπ ».
 *
 * @returns null si |k| > 1 (aucune solution), sinon
 *   { forme: 'plus-ou-moins' | 'a-et-pi-moins-a', base: [a, b], texFamille }
 *   où `base` sont les DEUX représentants d'un tour et la famille complète est
 *   { base[i] + 2nπ, n ∈ ℤ }.
 *
 * Les deux formes sont DIFFÉRENTES, et c'est tout l'enjeu du module 3 :
 *   cos x = k  →  x = a + 2kπ  ou  x = −a + 2kπ      (symétrie horizontale)
 *   sin x = k  →  x = a + 2kπ  ou  x = π − a + 2kπ   (symétrie verticale)
 */
export function familleSolutions(fn, k, eps = 1e-12) {
  if (k < -1 - eps || k > 1 + eps) return null;
  if (fn.id === 'cos') {
    const a = solutionPrincipaleCos(k, eps);
    return {
      forme: 'plus-ou-moins',
      base: [a, -a],
      a,
      /** L'écriture littérale de la famille, DÉRIVÉE de a. */
      tex: `x = ${texPi(a) ?? fr(a)} + 2k\\pi \\quad \\text{ou} \\quad x = -${texPi(a) ?? fr(a)} + 2k\\pi`,
      texCourt: `x = \\pm ${texPi(a) ?? fr(a)} + 2k\\pi`,
    };
  }
  const a = solutionPrincipaleSin(k, eps);
  const b = Math.PI - a;
  return {
    forme: 'a-et-pi-moins-a',
    base: [a, b],
    a,
    tex: `x = ${texPi(a) ?? fr(a)} + 2k\\pi \\quad \\text{ou} \\quad x = \\pi - ${texPi(a) ?? fr(a)} + 2k\\pi`,
    texCourt: `x = ${texPi(a) ?? fr(a)} + 2k\\pi \\ \\text{ou} \\ x = \\pi - ${texPi(a) ?? fr(a)} + 2k\\pi`,
  };
}

/**
 * Les solutions de fn(x) = k EFFECTIVEMENT dans la fenêtre [xMin ; xMax],
 * croissantes. C'est CE tableau que la figure allume : les points de la courbe
 * que la barre coupe. Ils sont en nombre fini seulement parce que la fenêtre
 * l'est — hors du cadre, il y en a toujours d'autres.
 *
 * Une famille de deux représentants base[0] et base[1] engendre, pour chaque
 * entier n, les réels base[i] + 2nπ.
 */
export function solutionsDansFenetre(fn, k, xMin, xMax, eps = 1e-9) {
  const fam = familleSolutions(fn, k);
  if (!fam) return [];
  const out = [];
  for (const b of fam.base) {
    const nMin = Math.ceil((xMin - b) / TAU - 1e-9);
    const nMax = Math.floor((xMax - b) / TAU + 1e-9);
    for (let n = nMin; n <= nMax; n += 1) {
      const x = b + n * TAU;
      if (x >= xMin - eps && x <= xMax + eps) out.push(x);
    }
  }
  // Deux représentants peuvent coïncider (k = 1 pour le cosinus : a = 0 = −a).
  const uniques = [];
  for (const x of out.sort((p, q) => p - q)) {
    if (uniques.length === 0 || Math.abs(x - uniques[uniques.length - 1]) > eps) uniques.push(x);
  }
  return uniques;
}

/**
 * L'ÉCART entre deux solutions consécutives d'une MÊME branche : un tour.
 * Le module 2 le fait CONSTATER — c'est la régularité que l'élève voit sur la
 * courbe, et c'est elle qui justifie le « + 2kπ ».
 */
export const ECART_FAMILLE = TAU;

/**
 * Les solutions de la BRANCHE d'un représentant, dans la fenêtre. Sert au
 * module 2 : allumer une seule branche montre l'espacement régulier de 2π.
 */
export function brancheDansFenetre(base, xMin, xMax) {
  const out = [];
  const nMin = Math.ceil((xMin - base) / TAU - 1e-9);
  const nMax = Math.floor((xMax - base) / TAU + 1e-9);
  for (let n = nMin; n <= nMax; n += 1) out.push(base + n * TAU);
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. LES INÉQUATIONS : la solution est un ARC
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * ─── L'ARC SOLUTION SUR UN TOUR ────────────────────────────────────────────
 *
 * Résoudre cos x ≥ k, ce n'est plus trouver des points : c'est décrire un ARC.
 * L'égalité donne DEUX points ; l'inégalité garde tout ce qu'il y a ENTRE eux,
 * d'un côté ou de l'autre.
 *
 * @returns [{ de, a }] : les intervalles de [0 ; 2π[ où l'inégalité est vraie.
 *   Un arc qui « passe par 0 » est rendu en DEUX morceaux — la fenêtre reste
 *   [0 ; 2π[, et un intervalle ne peut pas s'y enrouler. Le module l'assume et
 *   le dit ; la figure, elle, dessine bien UN seul arc sur le cercle.
 *
 * Le sens `>=` ou `<=` est passé en clair, et le résultat est MESURÉ par
 * balayage dans le test — jamais recopié d'un tableau.
 */
export function arcsSolution(fn, k, sens, eps = 1e-12) {
  if (sens !== '>=' && sens !== '<=') throw new Error(`sens inconnu : ${sens}`);
  // Hors bornes : soit tout le tour, soit rien.
  if (k > 1 + eps) return sens === '<=' ? [{ de: 0, a: TAU }] : [];
  if (k < -1 - eps) return sens === '>=' ? [{ de: 0, a: TAU }] : [];

  /**
   * ─── LES DEUX CAS DÉGÉNÉRÉS, k = 1 et k = −1 ──────────────────────────────
   *
   * DÉFAUT ATTRAPÉ PAR LE TEST (« sin <= -1 : 1 écart sur 2 000 »). En k = −1,
   * « sin x ≤ −1 » n'est vrai qu'en UN point (3π/2) : la solution n'est plus un
   * arc, c'est un point isolé. Le complémentaire du tour entier rendait
   * l'ensemble VIDE, et le balayage voyait ce point manquant.
   *
   * Ces deux cas sont réels et l'élève peut les atteindre à la barre (k = ±1
   * sont des crans). On les rend donc EXPLICITEMENT, comme des arcs de mesure
   * NULLE — ce qu'ils sont — au lieu de les perdre dans un complémentaire.
   * Le module 4 ne les demande pas ; le modèle, lui, ne ment pas dessus.
   */
  if (Math.abs(k - 1) < eps || Math.abs(k + 1) < eps) {
    const extreme = k > 0 ? 1 : -1;
    // Le côté « large » : toute l'inégalité est vraie.
    const large = (sens === '>=' && extreme === -1) || (sens === '<=' && extreme === 1);
    if (large) return [{ de: 0, a: TAU }];
    // Le côté « serré » : seuls les points où fn vaut exactement ±1.
    return solutionsDansFenetre(fn, k, 0, TAU).map((x) => ({ de: x, a: x }));
  }

  if (fn.id === 'cos') {
    const a = solutionPrincipaleCos(k);
    // cos x ≥ k sur [0 ; 2π[ : l'arc autour de 0, soit [0 ; a] ∪ [2π − a ; 2π[.
    if (sens === '>=') {
      if (a <= 1e-12) return [{ de: 0, a: 0 }, { de: TAU, a: TAU }];
      return [{ de: 0, a }, { de: TAU - a, a: TAU }];
    }
    // cos x ≤ k : l'arc autour de π, soit [a ; 2π − a].
    return [{ de: a, a: TAU - a }];
  }

  /**
   * ─── LE SINUS : l'arc entoure π/2, pas 0 ───────────────────────────────
   *
   * DÉFAUT ATTRAPÉ PAR LE TEST (5 997 écarts sur 6 000 points balayés). La
   * première version raisonnait « entre les deux solutions », en prenant le
   * min et le max des deux représentants. C'est FAUX dès que la solution
   * principale a₀ est NÉGATIVE : elle vit alors sous l'axe, son représentant
   * dans un tour est 2π + a₀, et l'arc où sin x ≥ k est
   *     [0 ; π − a₀] ∪ [2π + a₀ ; 2π[
   * — il FRANCHIT la couture, en deux morceaux, exactement comme l'arc du
   * cosinus le fait pour k > 0. Prendre min et max donnait le COMPLÉMENTAIRE.
   *
   * L'écriture ci-dessous est donc la seule juste dans les deux cas, et le
   * balayage la vérifie point par point, pour chaque cran et chaque sens.
   */
  const a0 = solutionPrincipaleSin(k);      // dans [−π/2 ; π/2]
  const b = Math.PI - a0;                   // l'autre solution, dans [π/2 ; 3π/2]
  if (sens === '>=') {
    if (a0 >= -eps) {
      // Les deux solutions sont dans [0 ; π] : l'arc est entre elles.
      return a0 <= b ? [{ de: a0, a: b }] : [{ de: b, a: a0 }];
    }
    // a₀ < 0 : l'arc franchit la couture, donc deux morceaux dans [0 ; 2π[.
    return [{ de: 0, a: b }, { de: TAU + a0, a: TAU }];
  }
  // sin x ≤ k : le COMPLÉMENTAIRE de l'arc précédent dans [0 ; 2π[.
  return complementaire(arcsSolution(fn, k, '>='));
}

/**
 * Le complémentaire d'une réunion d'intervalles dans [0 ; 2π[.
 *
 * DÉFAUT ATTRAPÉ PAR LE TEST (« sin ≤ 0 : 1 écart »). Une inéquation est LARGE
 * (≤ et non <) : ses bornes en font partie. Or le complémentaire d'un fermé
 * n'est pas fermé — le complémentaire de [0 ; π] est ]π ; 2π[, et l'on perdait
 * les trois points π, 2π et 0.
 *
 * Deux corrections, toutes deux structurelles :
 *   · on rend la FERMETURE : chaque morceau garde ses deux bornes, qui sont
 *     précisément les solutions de l'ÉGALITÉ, donc de l'inégalité large ;
 *   · le complémentaire se calcule SUR LE CERCLE : un morceau qui finit en 2π
 *     touche 0, et l'on ajoute donc le point 0 quand il manque. Sans cela,
 *     « sin x ≤ 0 » oublierait x = 0, qui en est pourtant solution.
 */
export function complementaire(arcs, eps = 1e-12) {
  const tries = [...arcs].sort((p, q) => p.de - q.de);
  const out = [];
  let x = 0;
  for (const s of tries) {
    if (s.de - x > eps) out.push({ de: x, a: s.de });
    x = Math.max(x, s.a);
  }
  if (TAU - x > eps) out.push({ de: x, a: TAU });
  // Le raccord par la couture : si le dernier morceau touche 2π sans qu'un
  // morceau commence en 0, le point 0 est solution et doit être rendu.
  const touche2Pi = out.some((s) => Math.abs(s.a - TAU) < eps);
  const commenceEn0 = out.some((s) => Math.abs(s.de) < eps);
  if (touche2Pi && !commenceEn0) out.unshift({ de: 0, a: 0 });
  return out;
}

/**
 * La MESURE de l'arc solution : la longueur totale, en radians. Sur un cercle
 * de rayon 1, c'est aussi sa longueur d'arc — et c'est le nombre que le module
 * fait lire.
 */
export const mesureArcs = (arcs) => arcs.reduce((s, a) => s + (a.a - a.de), 0);

/**
 * Le TEST NUMÉRIQUE de l'arc : l'inégalité est-elle vraie en x ?
 * C'est LUI qui juge dans le test — jamais l'arc lui-même, sans quoi le test
 * ne ferait que se relire.
 */
export function verifieInegalite(fn, k, sens, x) {
  const v = fn.exact(x);
  return sens === '>=' ? v >= k - 1e-12 : v <= k + 1e-12;
}

/**
 * Les inéquations que le module 4 fait résoudre. Chaque énoncé porte sa
 * réponse ATTENDUE en crans ; le test balaye [0 ; 2π[ et vérifie que l'arc
 * rendu coïncide avec l'ensemble des x où l'inégalité est vraie.
 */
export const INEQUATIONS = [
  { id: 'I1', fn: 'cos', k: 0.5, sens: '>=', enonce: 'cos x ≥ 1/2', tex: '\\cos x \\geqslant \\dfrac{1}{2}' },
  { id: 'I2', fn: 'sin', k: R2, sens: '>=', enonce: 'sin x ≥ √2/2', tex: '\\sin x \\geqslant \\dfrac{\\sqrt{2}}{2}' },
  { id: 'I3', fn: 'cos', k: -0.5, sens: '<=', enonce: 'cos x ≤ −1/2', tex: '\\cos x \\leqslant -\\dfrac{1}{2}' },
];

/** La fonction (objet) d'une inéquation, résolue depuis son id. */
export const fnDe = (id) => (id === 'cos' ? COS : SIN);

/* ═══════════════════════════════════════════════════════════════════════════
   4. LA DUPLICATION, DÉRIVÉE DE L'ADDITION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Les formules d'ADDITION, acquises en Seconde. Elles sont écrites ICI comme
 * FONCTIONS, et non comme texte : c'est en y posant b = a que le module 5 fait
 * DÉCOUVRIR la duplication. Le test vérifie qu'elles coïncident avec
 * cos(a+b) et sin(a+b) sur un balayage — elles ne sont pas crues sur parole.
 */
export const cosAddition = (a, b) => cosExact(a) * cosExact(b) - sinExact(a) * sinExact(b);
export const sinAddition = (a, b) => sinExact(a) * cosExact(b) + cosExact(a) * sinExact(b);

/**
 * ─── LA DUPLICATION : ON POSE b = a ────────────────────────────────────────
 * `cos2aDepuisAddition(a)` n'est PAS une formule recopiée : c'est littéralement
 * `cosAddition(a, a)`. C'est le geste du module 5, exécuté par le modèle.
 */
export const cos2aDepuisAddition = (a) => cosAddition(a, a);
export const sin2aDepuisAddition = (a) => sinAddition(a, a);

/**
 * Les TROIS écritures de cos 2a. La première tombe directement de l'addition ;
 * les deux autres s'en déduisent par l'identité fondamentale (2de).
 * Chacune est une FONCTION, et le test vérifie qu'elles coïncident toutes.
 */
export const FORMES_COS2A = [
  { id: 'diff-carres', tex: '\\cos^2 a - \\sin^2 a', f: (a) => cosExact(a) ** 2 - sinExact(a) ** 2 },
  { id: 'deux-cos2-moins-un', tex: '2\\cos^2 a - 1', f: (a) => 2 * cosExact(a) ** 2 - 1 },
  { id: 'un-moins-deux-sin2', tex: '1 - 2\\sin^2 a', f: (a) => 1 - 2 * sinExact(a) ** 2 },
];

/** L'unique écriture de sin 2a. */
export const FORME_SIN2A = { tex: '2\\sin a \\cos a', f: (a) => 2 * sinExact(a) * cosExact(a) };

/**
 * ─── LE PIÈGE FRONTAL DE LA DUPLICATION ────────────────────────────────────
 * « cos 2a = 2 cos a » est l'erreur type. Elle est ici une FONCTION, pour que
 * le module puisse produire un CONTRE-EXEMPLE calculé, jamais affirmé.
 */
export const pieceLineaire = (a) => 2 * cosExact(a);

/**
 * Un contre-exemple à « cos 2a = 2 cos a ».
 *
 * DEUX exigences, et la seconde a été ajoutée après un test rouge. Le premier
 * cran où l'écart dépassait 0,5 était a = 0 : cos 0 = 1 et 2 cos 0 = 2 — deux
 * nombres du MÊME signe, tous deux positifs. Le module affirme pourtant
 * « elles ne sont même pas du même signe » : la figure aurait contredit le
 * texte. On exige donc aussi que les deux quantités soient de SIGNES OPPOSÉS,
 * ce qui rend le contre-exemple visible d'un coup d'œil.
 *
 * Le réel est CHERCHÉ, jamais choisi à la main : le module ne peut donc pas
 * citer un cas où l'écart serait invisible.
 */
export function contreExempleLineaire(ecartMin = 0.5) {
  for (const r of REMARQUABLES) {
    const vrai = cos2aDepuisAddition(r.t);
    const faux = pieceLineaire(r.t);
    const opposes = Math.sign(vrai) * Math.sign(faux) < 0;
    if (Math.abs(vrai - faux) >= ecartMin && opposes) {
      return { t: r.t, label: r.label, vrai, faux };
    }
  }
  return null;
}

/**
 * Les valeurs de duplication que le module 5 fait calculer. Chaque cible
 * porte le réel a, et sa réponse est CALCULÉE — jamais saisie.
 * Le test vérifie qu'elles sont toutes remarquables (donc exactes), qu'elles
 * sont distinctes, et que 2a reste un cran du cliquet.
 */
export const CIBLES_DUPLICATION = [
  { id: 'D1', t: Math.PI / 6, fn: 'cos' },     // cos(π/3) = 1/2
  { id: 'D2', t: Math.PI / 4, fn: 'sin' },     // sin(π/2) = 1
  { id: 'D3', t: Math.PI / 3, fn: 'cos' },     // cos(2π/3) = −1/2
];

/** La valeur exacte visée par une cible de duplication. */
export function valeurDuplication(cible) {
  return cible.fn === 'cos' ? cos2aDepuisAddition(cible.t) : sin2aDepuisAddition(cible.t);
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. LA MODÉLISATION D'UN PHÉNOMÈNE QUI SE RÉPÈTE
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * ─── LE MODÈLE À TROIS RÉGLAGES ────────────────────────────────────────────
 *
 *     h(t) = m + A·cos( 2π (t − d) / P )
 *
 *   A  l'AMPLITUDE   — l'écart maximal au niveau moyen ;
 *   P  la PÉRIODE    — la durée au bout de laquelle le phénomène recommence ;
 *   d  le DÉCALAGE   — l'instant où le maximum est atteint ;
 *   m  le niveau moyen, autour duquel le phénomène oscille.
 *
 * POURQUOI LE COSINUS ET NON LE SINUS. Avec le cosinus, `d` est EXACTEMENT
 * l'instant du maximum : le décalage se LIT sur la courbe (le sommet), au lieu
 * de se calculer. Pour un phénomène concret (la marée haute, le midi solaire),
 * c'est le réglage que l'élève sait nommer.
 */
export const modele = ({ m, A, P, d }) => (t) => m + A * Math.cos((TAU * (t - d)) / P);

/** Le maximum et le minimum d'un modèle, DÉRIVÉS de ses réglages. */
export const maxModele = ({ m, A }) => m + Math.abs(A);
export const minModele = ({ m, A }) => m - Math.abs(A);

/**
 * L'amplitude LUE sur un couple (maximum ; minimum) : la demi-différence.
 * C'est le geste que le module 6 fait faire, et il est ici une fonction pour
 * que le test le vérifie sur chaque situation.
 */
export const amplitudeLue = (max, min) => (max - min) / 2;
export const moyenneLue = (max, min) => (max + min) / 2;

/**
 * L'amplitude et la période MESURÉES sur la courbe elle-même — pas lues dans
 * les réglages. Ce contrôle CROISÉ attraperait une situation dont l'énoncé et
 * le tracé se contrediraient.
 *
 * DÉFAUT DE MESURE ÉVITÉ (leçon amont) : le pas d'échantillonnage est lié à la
 * LARGEUR de la fenêtre, jamais un nombre de points fixe — sinon le sommet
 * d'une courbe de période courte tombe entre deux échantillons.
 */
export function extremesMesures(f, a, b, parUnite = 400) {
  const n = Math.max(4000, Math.ceil((b - a) * parUnite));
  let max = -Infinity;
  let min = Infinity;
  for (let i = 0; i <= n; i += 1) {
    const v = f(a + ((b - a) * i) / n);
    if (v > max) max = v;
    if (v < min) min = v;
  }
  return { max, min };
}

/**
 * La période MESURÉE : le plus petit essai pour lequel la courbe se superpose
 * à elle-même sur tout l'intervalle.
 */
export function periodeMesuree(f, essais, a = 0, b = 40, eps = 1e-6) {
  for (const p of essais) {
    let ok = true;
    for (let x = a; x <= b - p; x += 0.05) {
      if (Math.abs(f(x + p) - f(x)) > eps) { ok = false; break; }
    }
    if (ok) return p;
  }
  return null;
}

/**
 * ─── LES TROIS SITUATIONS DU MODULE 6 ──────────────────────────────────────
 * Marée, température, roue. Chacune porte ses réglages et son vocabulaire
 * concret ; tout ce qui s'affiche en est DÉRIVÉ. Le test vérifie, pour chacune,
 * que les extremums mesurés sur la courbe sont ceux qu'annonce l'énoncé, et
 * que la période mesurée est celle qu'on demande de trouver.
 */
export const SITUATIONS = [
  {
    id: 'maree',
    titre: 'La marée',
    emoji: '🌊',
    unite: 'h',
    uniteY: 'm',
    grandeur: 'hauteur d’eau',
    /** m = 4 m, A = 2 m, P = 12 h, maximum à t = 3 h. */
    reglages: { m: 4, A: 2, P: 12, d: 3 },
    /** Échelle de 0 à 8 m : un pas de 0,5 m laisse 9,75 px entre deux crans. */
    cransA: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4],
    tMax: 30,
    contexte:
      'Dans un port, la hauteur d’eau monte et descend. Elle atteint 6 m à la pleine mer et 2 m à la basse mer, et le cycle recommence toutes les 12 heures.',
  },
  {
    id: 'temperature',
    titre: 'La température d’une journée',
    emoji: '🌡️',
    unite: 'h',
    uniteY: '°C',
    grandeur: 'température',
    /** m = 16 °C, A = 6 °C, P = 24 h, maximum à 15 h. */
    reglages: { m: 16, A: 6, P: 24, d: 15 },
    /** Échelle de 0 à 32 °C : un pas de 2 °C laisse 9,75 px entre deux crans. */
    cransA: [2, 4, 6, 8, 10, 12, 14, 16],
    tMax: 60,
    contexte:
      'La température d’un jour d’été passe par 22 °C au plus chaud, vers 15 h, et par 10 °C au plus frais. Le cycle recommence au bout de 24 heures.',
  },
  {
    id: 'roue',
    titre: 'La grande roue',
    emoji: '🎡',
    unite: 'min',
    uniteY: 'm',
    grandeur: 'hauteur de la nacelle',
    /** m = 30 m, A = 25 m, P = 10 min, maximum à 5 min. */
    reglages: { m: 30, A: 25, P: 10, d: 5 },
    /** Échelle de 0 à 60 m : un pas de 5 m laisse 13 px entre deux crans. */
    cransA: [5, 10, 15, 20, 25, 30],
    tMax: 25,
    contexte:
      'Une nacelle de grande roue monte de 5 m à 55 m puis redescend. Un tour complet prend 10 minutes, et la nacelle part du point le plus bas.',
  },
];

/** Les réglages ATTENDUS d'une situation, sous forme lisible et dérivée. */
export function lectureAttendue(s) {
  const f = modele(s.reglages);
  const { max, min } = extremesMesures(f, 0, s.tMax);
  return {
    max, min,
    amplitude: amplitudeLue(max, min),
    moyenne: moyenneLue(max, min),
    periode: s.reglages.P,
  };
}

/**
 * Les réglages que l'élève peut choisir dans le laboratoire de modélisation.
 * Chaque cible doit tomber EXACTEMENT sur un cran (test) — un doigt ne vise pas
 * au pixel, et une consigne dont la réponse n'est pas atteignable est
 * infaisable.
 */
export const CRANS_PERIODE = [6, 8, 10, 12, 16, 20, 24, 30];

/**
 * ─── LES CRANS D'AMPLITUDE SONT PROPRES À CHAQUE SITUATION ─────────────────
 *
 * DÉFAUT ATTRAPÉ PAR LE TEST (« roue 1/2 : 2,6 px d'écart »). Une liste
 * UNIQUE de crans, de 1 à 30, marchait pour la marée (amplitude 2 m, échelle
 * de 0 à 6) mais pas pour la grande roue (amplitude 25 m, échelle de 0 à 60) :
 * à cette échelle, les crans 1 et 2 tombaient à 2,6 px l'un de l'autre. Deux
 * poignées voisines devenaient indiscernables, et le glisser illisible.
 *
 * Chaque situation porte donc ses PROPRES crans, dont le pas est à sa mesure.
 * La règle est vérifiée par test : deux crans voisins sont à AU MOINS 4 px
 * l'un de l'autre, et la cible de la situation en fait toujours partie.
 */
export const cransAmplitudeDe = (s) => s.cransA;

/**
 * L'union de tous les crans d'amplitude, pour les composants et les tests qui
 * raisonnent sur la liste entière. Dérivée, jamais ressaisie.
 */
export const CRANS_AMPLITUDE_TOUS = () =>
  [...new Set(SITUATIONS.flatMap((s) => s.cransA))].sort((a, b) => a - b);

/* ═══════════════════════════════════════════════════════════════════════════
   6. LA GÉOMÉTRIE DES DEUX CADRES (cercle + courbe déroulée)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * À gauche le cercle, à droite la courbe déroulée. Les deux partagent la MÊME
 * échelle verticale : la barre de hauteur k est donc, à l'écran, un SEUL trait
 * horizontal continu d'un cadre à l'autre. C'est ce qui rend la manipulation
 * lisible — et c'est vérifié par test.
 */
export const R = 74;                 // rayon du cercle, en px
export const CX = 96;
/**
 * LE CENTRE EST BAS, ET LE CADRE EST HAUT — deux choix DÉRIVÉS, pas esthétiques.
 *
 * Le cadre doit contenir la barre à SON CRAN LE PLUS HAUT (k = 1,3), bande de
 * préhension comprise : il faut donc CY − 1,3·R − HAUTEUR_PRISE/2 ≥ 0, et
 * symétriquement en bas. Avec R = 74, cela impose CY ≥ 108 et H_CADRE ≥ 216.
 *
 * Et R ne peut pas être RÉDUIT à la place : deux hauteurs remarquables
 * voisines, √2/2 et √3/2, ne diffèrent que de 0,087. À R = 60 elles seraient
 * à 5,2 px l'une de l'autre, et le rayon de capture de l'aimantation
 * tomberait à 2,6 px — moins que l'imprécision d'un doigt. À R = 74 elles
 * sont à 6,45 px, et l'on capture à ±3 px (test).
 */
export const CY = 110;
export const H_CADRE = 220;

/** y ↦ pixels, commun aux deux cadres (1 unité d'ordonnée = R pixels). */
export const yDeVal = (v) => CY - v * R;

/** La valeur associée à une ordonnée en pixels — la réciproque exacte. */
export const valDeY = (y) => (CY - y) / R;

export const MARGE_G = 26;
export const MARGE_D = 14;

/**
 * ─── LA FENÊTRE DÉROULÉE, MESURÉE ──────────────────────────────────────────
 *
 * Le problème et sa parade sont ceux de la leçon amont, RE-DÉRIVÉS ici pour
 * une contrainte propre : la barre doit couper la courbe en PLUSIEURS points,
 * régulièrement espacés de 2π, et l'élève doit VOIR l'espacement se répéter.
 *
 * TOUTE fenêtre candidate va donc au-delà de 2π ET descend sous 0 (test), et
 * toute fenêtre montre AU MOINS deux tours entiers — sans quoi la famille
 * « + 2kπ », qui EST le sujet, deviendrait inobservable sur un téléphone.
 *
 * Le pas des étiquettes est π : à 24 px par radian, deux étiquettes voisines
 * sont à 75 px alors que « −5π/2 » en mesure 36 — aucun chevauchement (test).
 */
const LARGEUR_ETIQ_MAX = 7 * 6;

/** Les fenêtres candidates, de la plus riche à la plus étroite. */
export const FENETRES = [
  { tMinPi: -2, tMaxPi: 6, px: 24 },   // de −2π à 6π : quatre tours
  { tMinPi: -2, tMaxPi: 6, px: 18 },
  { tMinPi: -2, tMaxPi: 4, px: 18 },   // de −2π à 4π : trois tours
  { tMinPi: -2, tMaxPi: 4, px: 15 },
  { tMinPi: -1, tMaxPi: 3, px: 15 },   // de −π à 3π : deux tours
];

/** La géométrie complète d'une fenêtre : bornes, échelle, largeur, conversions. */
export function geometrieFenetre(f) {
  const tMin = f.tMinPi * Math.PI;
  const tMax = f.tMaxPi * Math.PI;
  const largeur = MARGE_G + MARGE_D + (tMax - tMin) * f.px;
  const xDe = (t) => MARGE_G + (t - tMin) * f.px;
  const tDe = (x) => (x - MARGE_G) / f.px + tMin;
  const graduations = [];
  const demi = Math.PI / 2;
  for (let k = Math.ceil(tMin / demi - 1e-9); k <= Math.floor(tMax / demi + 1e-9); k += 1) {
    const t = k * demi;
    const etiquetee = k % 2 === 0;
    graduations.push({ t, label: etiquetee ? labelPi(t) : null, x: xDe(t), majeure: etiquetee });
  }
  return {
    ...f, tMin, tMax, largeur, xDe, tDe, graduations,
    ecartEtiquettes: Math.PI * f.px,
    /** Le nombre de tours ENTIERS visibles : la famille doit s'y répéter. */
    tours: (tMax - tMin) / TAU,
  };
}

/**
 * La fenêtre à afficher pour une largeur DISPONIBLE mesurée, en pixels.
 * On rend la première candidate qui tient ET dont les étiquettes ne se
 * chevauchent pas ; à défaut, la plus étroite (elle tient partout).
 */
export function fenetreDerouleur(largeurDispo) {
  for (const f of FENETRES) {
    const g = geometrieFenetre(f);
    if (g.largeur <= largeurDispo && g.ecartEtiquettes > LARGEUR_ETIQ_MAX + 4) return g;
  }
  return geometrieFenetre(FENETRES[FENETRES.length - 1]);
}

/**
 * ─── LA ZONE DE PRÉHENSION DE LA BARRE ─────────────────────────────────────
 *
 * PIÈGE PAYÉ TROIS FOIS DANS CETTE MISSION : une poignée trop fine est
 * inattrapable au doigt. La barre est un trait de 3 px ; sa zone de
 * préhension est un rectangle INVISIBLE de `HAUTEUR_PRISE` px centré dessus,
 * et la pastille ronde de son extrémité gauche a un rayon de `R_POIGNEE`.
 *
 * Les deux sont vérifiés par test (≥ 14 px de haut pour la bande, ≥ 22 px de
 * diamètre pour la pastille), ET dans les DEUX cadres.
 */
export const HAUTEUR_PRISE = 24;     // ≥ 14 px : la contrainte critique
export const R_POIGNEE = 9;          // pastille visible
export const R_PRISE_POIGNEE = 18;   // cible tactile invisible autour

/**
 * La bande de préhension pour une valeur k, dans un cadre de hauteur H_CADRE.
 * Elle est BORNÉE au cadre : une barre au bord garde une zone attrapable.
 */
export function bandePrise(k) {
  const y = yDeVal(k);
  const haut = Math.max(0, y - HAUTEUR_PRISE / 2);
  const bas = Math.min(H_CADRE, y + HAUTEUR_PRISE / 2);
  return { y, haut, bas, hauteur: bas - haut };
}

/**
 * Le k visé par un pointeur lâché à l'ordonnée `yPx` du cadre, aimanté sur les
 * crans. Le modèle pur : c'est LUI qui garantit que les hauteurs remarquables
 * sont atteintes EXACTEMENT, et non l'adresse de l'élève.
 */
export function kDepuisPointeur(yPx, crans = CRANS_K) {
  return aimanterK(valDeY(yPx), crans);
}

/**
 * ─── SÉCURITÉ DE MISE EN PAGE ──────────────────────────────────────────────
 * Aucun état atteignable ne doit sortir du cadre. Ce n'est pas un constat :
 * c'est une fonction, BALAYÉE par le test sur toute la liste des crans et
 * toutes les fenêtres.
 */
export function barreDansLeCadre(k) {
  const y = yDeVal(k);
  return y >= 0 && y <= H_CADRE;
}

/**
 * Les points de la courbe que la barre allume, en PIXELS, pour une fenêtre.
 * Dérivés des solutions ; le test vérifie qu'ils tiennent tous dans le cadre.
 */
export function pointsAllumes(fn, k, vue) {
  return solutionsDansFenetre(fn, k, vue.tMin, vue.tMax).map((x) => ({
    x, px: vue.xDe(x), py: yDeVal(k),
  }));
}

/** La courbe de fn échantillonnée sur la fenêtre, pour le tracé. */
export function courbeFenetre(fn, vue, n = 480) {
  return echantillonner(fn.exact, vue.tMin, vue.tMax, n);
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. LES CIBLES PÉDAGOGIQUES DE LA MANIPULATION SIGNATURE
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Chaque hauteur que le module 1 demande d'ATTEINDRE, avec ce qu'on y voit.
 * Le test vérifie que chacune est un cran EXACT de la liste, et que le nombre
 * de points allumés annoncé est bien celui que le modèle calcule.
 */
export const CIBLES_BARRE = [
  { id: 'demi', k: 0.5, ecriture: '1/2', attendu: 'des points' },
  { id: 'un', k: 1, ecriture: '1', attendu: 'des points' },
  { id: 'zero', k: 0, ecriture: '0', attendu: 'des points' },
  { id: 'moins-r2', k: -R2, ecriture: '−√2/2', attendu: 'des points' },
  { id: 'trop-haut', k: 1.3, ecriture: '1,3', attendu: 'aucun point' },
];

/** La hauteur au-dessus de laquelle il n'y a plus aucune solution. */
export const K_LIMITE = 1;

/** Combien de crans hors bornes la liste offre, de chaque côté (test). */
export const cransHorsBornes = (crans = CRANS_K) => crans.filter((k) => Math.abs(k) > 1 + 1e-12);
