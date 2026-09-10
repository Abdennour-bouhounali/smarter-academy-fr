/**
 * Le modèle mathématique de « Produit scalaire : mesurer et démontrer ».
 *
 * LA SUITE de `produit-scalaire-definir-1ere`. Cette leçon-là faisait TOURNER
 * une flèche pour lire UN nombre ; celle-ci fait DÉFORMER une FIGURE pour lire
 * une CLASSIFICATION. Le mécanisme diffère volontairement — mêmes maths, geste
 * opposé.
 *
 * ─── L'IDÉE QUE TOUT LE FICHIER SERT ───────────────────────────────────
 * UNE seule opération remplace le rapporteur ET la règle :
 *
 *     cos θ = (u · v) / (‖u‖ ‖v‖)          → l'angle       (P1)
 *     ‖AB‖² = AB · AB                       → la longueur   (P2)
 *
 * Et parce que les deux sortent du même calcul, la NATURE d'un triangle
 * (rectangle / isocèle / quelconque) se lit d'un coup, sans rien mesurer.
 *
 * ─── L'ANGLE DROIT DOIT ÊTRE EXACT ─────────────────────────────────────
 * Tous les sommets du laboratoire sont à coordonnées ENTIÈRES, et le cliquet
 * les déplace d'une case entière. Le produit scalaire y est donc un ENTIER :
 * `estRectangleEn` teste `=== 0` et non « |x| < ε ». Un cos construit par
 * flottants rendrait 6 × 10⁻¹⁷ et l'angle droit deviendrait un arrondi.
 * Un test le verrouille sur tout le balayage.
 *
 * ─── LE TRIANGLE ÉQUILATÉRAL EST IMPOSSIBLE ────────────────────────────
 * AUCUN triangle équilatéral n'a ses trois sommets à coordonnées entières.
 * Preuve courte : l'aire d'un triangle à sommets entiers est un demi-entier
 * (formule du lacet), tandis que l'aire d'un équilatéral de côté c vaut
 * c²√3/4 avec c² entier — donc un irrationnel non nul. Les deux ne peuvent
 * pas coïncider.
 * Conséquence assumée : la pastille de nature ne propose PAS « équilatéral ».
 * Elle en dit la raison plutôt que de promettre une cible infaisable, et un
 * test balaie tout le cadre pour confirmer qu'aucun n'existe (`AUCUN_EQUILATERAL`).
 *
 * ─── CIBLES ATTEIGNABLES ───────────────────────────────────────────────
 * `cheminVers` fait un parcours en largeur sur les états du laboratoire : il
 * PROUVE, et ne suppose pas, que chaque cible annoncée par le module 1 est
 * atteinte au cliquet depuis l'état de départ. Les tests l'exécutent.
 */
import {
  vec, add, scale, dot, norm, dist, cross, normalize,
  lineThrough, projectOnLine, areCollinear, midpoint,
} from '../../../../../common/utils/geometry2d';

export { vec, add, scale, dot, norm, dist, cross, normalize, projectOnLine, areCollinear, midpoint };

/* ── Écriture française ───────────────────────────────────────────────── */

/** Un nombre à la française : virgule, vrai signe moins, jamais « −0 ». */
export function fr(n, maxDecimals = 2) {
  if (!Number.isFinite(n)) return '?';
  let r = Math.round(n * 10 ** maxDecimals) / 10 ** maxDecimals;
  if (Object.is(r, -0) || r === 0) r = 0;
  return String(r).replace('.', ',').replace('-', '−');
}

/** Les coordonnées d'un point ou d'un vecteur : (4 ; −3). */
export const frVec = (v) => `(${fr(v.x)} ; ${fr(v.y)})`;

/**
 * Lecture d'une réponse numérique SIGNÉE et DÉCIMALE.
 *
 * `parseDec` du noyau refuse le vrai signe moins « − » (U+2212), celui que la
 * leçon écrit partout, et `parseFr` refuse en plus les décimaux. Une leçon
 * dont les réponses sont des angles (53,13°) et des produits scalaires
 * négatifs a donc besoin de sa propre lecture.
 */
export function parseSigned(str) {
  if (typeof str === 'number') return Number.isFinite(str) ? str : NaN;
  if (typeof str !== 'string') return NaN;
  const s = str
    .trim()
    .replace(/[\s  ]/g, '')
    .replace(/[−–—]/g, '-')
    .replace(',', '.');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  return Number(s);
}

/* ── L'instrument : angles et longueurs par le produit scalaire ───────── */

/**
 * Le cosinus de l'angle entre deux vecteurs non nuls : (u·v) / (‖u‖ ‖v‖).
 * Borné dans [−1 ; 1] : sans ce bornage, une erreur d'arrondi de 10⁻¹⁶ ferait
 * rendre NaN à `Math.acos` exactement aux angles remarquables.
 */
export function cosAngle(u, v) {
  const nu = norm(u);
  const nv = norm(v);
  if (nu === 0 || nv === 0) return 0;
  return Math.max(-1, Math.min(1, dot(u, v) / (nu * nv)));
}

/** L'angle géométrique entre deux vecteurs non nuls, en degrés, dans [0 ; 180]. */
export function angleVecteursDeg(u, v) {
  return (Math.acos(cosAngle(u, v)) * 180) / Math.PI;
}

/** L'angle ABC (au sommet b), en degrés. Les deux vecteurs partent de b. */
export function angleEnDeg(a, b, c) {
  return angleVecteursDeg(vec(b, a), vec(b, c));
}

/**
 * Le CARRÉ SCALAIRE : u·u. C'est ‖u‖², et c'est ce qui fait du produit
 * scalaire une règle graduée — la longueur en découle par une racine.
 */
export function carreScalaire(u) {
  return dot(u, u);
}

/** La longueur AB, obtenue par √(AB·AB) — la voie « produit scalaire ». */
export function longueurParScalaire(a, b) {
  return Math.sqrt(carreScalaire(vec(a, b)));
}

/**
 * Al-Kashi : BC² = AB² + AC² − 2 × AB × AC × cos(Â).
 *
 * Renvoie le CARRÉ, pas la longueur : c'est sous cette forme que le théorème
 * s'énonce et que le produit scalaire le démontre (BC = AC − AB, on développe
 * le carré scalaire). La racine est prise par l'appelant, jamais ici.
 */
export function alKashiCarre(ab, ac, angleADeg) {
  const t = (angleADeg * Math.PI) / 180;
  return ab * ab + ac * ac - 2 * ab * ac * Math.cos(t);
}

/* ── Le laboratoire signature : « Le théodolite » ─────────────────────── */

/** Le cadre du laboratoire. Les sommets n'en sortent jamais. */
export const RANGE = Object.freeze({ xMin: -6, xMax: 6, yMin: -6, yMax: 6 });

/** Les trois sommets au départ : un triangle QUELCONQUE, exprès. */
export const TRIANGLE_DEPART = Object.freeze({
  A: Object.freeze({ x: -3, y: -2 }),
  B: Object.freeze({ x: 2, y: -2 }),
  C: Object.freeze({ x: 0, y: 3 }),
});

export const SOMMETS = Object.freeze(['A', 'B', 'C']);

/** Les quatre déplacements d'un cran : une case entière, jamais un demi. */
export const PAS = Object.freeze([
  { dx: 1, dy: 0, label: '→' },
  { dx: -1, dy: 0, label: '←' },
  { dx: 0, dy: 1, label: '↑' },
  { dx: 0, dy: -1, label: '↓' },
]);

/** Le sommet reste-t-il dans le cadre ? */
export const dansLeCadre = (p) =>
  p.x >= RANGE.xMin && p.x <= RANGE.xMax && p.y >= RANGE.yMin && p.y <= RANGE.yMax;

/** Les trois sommets forment-ils un vrai triangle (non aplati) ? */
export const estUnTriangle = (t) => cross(vec(t.A, t.B), vec(t.A, t.C)) !== 0;

/**
 * Déplacer un sommet d'un cran. Renvoie le MÊME objet si le coup est refusé
 * (hors cadre, ou triangle aplati) : l'état ne change jamais en silence.
 *
 * Fonction PURE — elle ne mute pas l'état reçu. Un updater impur ferait
 * diverger l'historique de React de la figure affichée.
 */
export function deplacer(t, sommet, dx, dy) {
  if (!SOMMETS.includes(sommet)) return t;
  const p = { x: t[sommet].x + dx, y: t[sommet].y + dy };
  if (!dansLeCadre(p)) return t;
  const suivant = { A: { ...t.A }, B: { ...t.B }, C: { ...t.C }, [sommet]: p };
  if (!estUnTriangle(suivant)) return t;
  return suivant;
}

/* ── Les mesures de l'instrument ──────────────────────────────────────── */

/**
 * Les trois côtés, chacun avec son carré scalaire ENTIER et sa longueur.
 * Le carré est la valeur EXACTE ; la longueur en est la racine, donc
 * l'approximation. Toute décision (isocèle, rectangle) passe par le CARRÉ.
 */
export function cotes(t) {
  return [
    { id: 'AB', de: 'A', a: 'B', carre: carreScalaire(vec(t.A, t.B)) },
    { id: 'BC', de: 'B', a: 'C', carre: carreScalaire(vec(t.B, t.C)) },
    { id: 'CA', de: 'C', a: 'A', carre: carreScalaire(vec(t.C, t.A)) },
  ].map((c) => ({ ...c, longueur: Math.sqrt(c.carre) }));
}

/**
 * Les trois angles, chacun avec le produit scalaire ENTIER dont il sort.
 * `produit === 0` ⟺ l'angle est droit — au bit près, sans tolérance.
 */
export function angles(t) {
  const au = (s, p, q) => {
    const u = vec(t[s], t[p]);
    const v = vec(t[s], t[q]);
    return {
      id: s,
      u, v,
      produit: dot(u, v),
      cos: cosAngle(u, v),
      deg: angleVecteursDeg(u, v),
    };
  };
  return [au('A', 'B', 'C'), au('B', 'A', 'C'), au('C', 'A', 'B')];
}

/** L'angle est-il DROIT au sommet donné ? Test exact sur un entier. */
export function estRectangleEn(t, sommet) {
  const a = angles(t).find((x) => x.id === sommet);
  return a ? a.produit === 0 : false;
}

/** Le sommet portant l'angle droit, ou `null`. */
export function sommetDroit(t) {
  return angles(t).find((a) => a.produit === 0)?.id ?? null;
}

/**
 * Les deux côtés de même longueur, ou `null`.
 * Comparaison des CARRÉS, donc d'entiers : « 8,062 = 8,062 » à l'affichage
 * ne prouverait rien, 65 = 65 si.
 */
export function paireIsocele(t) {
  const c = cotes(t);
  for (let i = 0; i < 3; i += 1) {
    for (let j = i + 1; j < 3; j += 1) {
      if (c[i].carre === c[j].carre) return [c[i].id, c[j].id];
    }
  }
  return null;
}

/**
 * LA PASTILLE — la nature du triangle, lue en direct.
 *
 * Quatre valeurs seulement : `rectangle-isocele`, `rectangle`, `isocele`,
 * `quelconque`. PAS d'« équilatéral » : il n'en existe AUCUN à sommets
 * entiers (voir l'en-tête du fichier, et le test `AUCUN_EQUILATERAL`).
 * Annoncer une pastille qu'aucune manipulation ne peut allumer serait une
 * cible infaisable.
 */
export function nature(t) {
  const droit = sommetDroit(t);
  const iso = paireIsocele(t);
  if (droit && iso) return { code: 'rectangle-isocele', sommet: droit, cotes: iso };
  if (droit) return { code: 'rectangle', sommet: droit, cotes: null };
  if (iso) return { code: 'isocele', sommet: null, cotes: iso };
  return { code: 'quelconque', sommet: null, cotes: null };
}

/** Le libellé français de la pastille, avec le sommet ou les côtés en cause. */
export function natureTexte(t) {
  const n = nature(t);
  switch (n.code) {
    case 'rectangle-isocele':
      return `rectangle en ${n.sommet} et isocèle (${n.cotes[0]} = ${n.cotes[1]})`;
    case 'rectangle':
      return `rectangle en ${n.sommet}`;
    case 'isocele':
      return `isocèle (${n.cotes[0]} = ${n.cotes[1]})`;
    default:
      return 'quelconque';
  }
}

/* ── Les cibles du module 1, et leur ATTEIGNABILITÉ ───────────────────── */

/**
 * Les deux missions annoncées par le module 1. Chacune est un PRÉDICAT sur
 * l'état, jamais une position à recopier : l'élève a le droit d'arriver par
 * n'importe quel chemin, et la mission « isocèle non rectangle » exige
 * explicitement l'ABSENCE d'angle droit — sans quoi le triangle rectangle
 * isocèle la validerait par accident.
 */
export const CIBLES = Object.freeze([
  Object.freeze({
    id: 'rect-B',
    titre: 'un triangle rectangle en B',
    consigne: 'Déplace les sommets jusqu’à ce que l’angle en B soit droit.',
    atteinte: (t) => estRectangleEn(t, 'B'),
  }),
  Object.freeze({
    id: 'iso-non-rect',
    titre: 'un triangle isocèle qui n’est PAS rectangle',
    consigne: 'Deux côtés de même longueur, et aucun angle droit.',
    atteinte: (t) => paireIsocele(t) !== null && sommetDroit(t) === null,
  }),
]);

const cle = (t) => `${t.A.x},${t.A.y}|${t.B.x},${t.B.y}|${t.C.x},${t.C.y}`;

/**
 * PARCOURS EN LARGEUR sur les états du laboratoire — la PREUVE d'atteignabilité.
 *
 * Renvoie la suite des coups menant de `depart` à un état vérifiant `atteinte`,
 * ou `null` si la cible est hors de portée en `maxCoups` crans. C'est ce qui
 * rend l'étape 2 du module 1 débloquable : une cible qu'on ne peut pas
 * atteindre gèlerait l'élève sur une consigne impossible.
 *
 * Coûteux (des milliers d'états) : réservé aux TESTS et aux indices, jamais
 * appelé dans un rendu.
 */
export function cheminVers(depart, atteinte, maxCoups = 6) {
  if (atteinte(depart)) return [];
  const vus = new Set([cle(depart)]);
  let frontiere = [{ t: depart, chemin: [] }];
  for (let d = 1; d <= maxCoups; d += 1) {
    const suivante = [];
    for (const { t, chemin } of frontiere) {
      for (const s of SOMMETS) {
        for (const p of PAS) {
          const nt = deplacer(t, s, p.dx, p.dy);
          if (nt === t) continue;
          const k = cle(nt);
          if (vus.has(k)) continue;
          vus.add(k);
          const suite = [...chemin, { sommet: s, dx: p.dx, dy: p.dy }];
          if (atteinte(nt)) return suite;
          suivante.push({ t: nt, chemin: suite });
        }
      }
    }
    frontiere = suivante;
  }
  return null;
}

/* ── Équation d'une droite sous forme NORMALE (P3) ────────────────────── */

/**
 * L'équation a(x − x₀) + b(y − y₀) = 0 de la droite passant par P₀ et de
 * vecteur normal n(a ; b), rendue sous sa forme développée ax + by + c = 0.
 *
 * C'est la même identité que dans la leçon amont, écrite ici dans l'autre
 * sens : là-bas on partait du normal pour trouver c, ici on part du POINT et
 * de l'écriture factorisée — la forme normale.
 */
export function formeNormale(P0, n) {
  return { a: n.x, b: n.y, c: -(n.x * P0.x + n.y * P0.y), P0, n };
}

/** M vérifie-t-il ax + by + c = 0 ? Exact quand tout est entier. */
export function verifieEquation(eqn, M, eps = 1e-9) {
  return Math.abs(eqn.a * M.x + eqn.b * M.y + eqn.c) <= eps;
}

/**
 * La DISTANCE du point M à la droite d'équation ax + by + c = 0 :
 * |a·xM + b·yM + c| / √(a² + b²).
 *
 * Elle sort du produit scalaire : n·P₀M projeté sur n, en valeur absolue.
 * C'est la mesure que l'équation normale rend immédiate.
 */
export function distancePointDroite(eqn, M) {
  const d = Math.hypot(eqn.a, eqn.b);
  if (d === 0) return 0;
  return Math.abs(eqn.a * M.x + eqn.b * M.y + eqn.c) / d;
}

/**
 * L'équation écrite comme au tableau : « 3x − 2y + 6 = 0 », sans « 1x »,
 * sans « + −4 », sans « + 0 ».
 */
export function equationTexte(eqn) {
  const terme = (coef, lettre, premier) => {
    if (coef === 0) return '';
    const signe = coef < 0 ? '−' : premier ? '' : '+';
    const abs = Math.abs(coef);
    const nombre = abs === 1 ? '' : fr(abs);
    return `${signe}${signe && !premier ? ' ' : ''}${nombre}${lettre} `;
  };
  let s = terme(eqn.a, 'x', true);
  s += terme(eqn.b, 'y', s === '');
  if (eqn.c !== 0) {
    const signe = eqn.c < 0 ? '−' : '+';
    s += s === '' ? fr(eqn.c) : `${signe} ${fr(Math.abs(eqn.c))} `;
  }
  return `${s.trim()} = 0`;
}

/** La forme normale écrite en clair : « 2(x − 1) + 3(y + 4) = 0 ». */
export function formeNormaleTexte(eqn) {
  const bloc = (coef, lettre, v) => {
    const dedans = v === 0 ? lettre : `${lettre} ${v > 0 ? '−' : '+'} ${fr(Math.abs(v))}`;
    const tete = coef === 1 ? '' : coef === -1 ? '−' : fr(coef);
    return `${tete}(${dedans})`;
  };
  const g = bloc(eqn.a, 'x', eqn.P0.x);
  const d = bloc(eqn.b, 'y', eqn.P0.y);
  return `${g} ${eqn.b < 0 ? '−' : '+'} ${eqn.b < 0 ? d.replace('−', '') : d} = 0`;
}

/* ── Les scènes littérales de la leçon ────────────────────────────────── */

/**
 * Les données citées par les modules. CHAQUE valeur affichée à l'élève est
 * RECALCULÉE dans theodoliteUtils.test.js : aucun nombre du texte n'est écrit
 * à la main sans être vérifié.
 */
export const SCENES = Object.freeze({
  /**
   * M2 — l'angle. Trois couples, dont un OBTUS (cosinus négatif) : sans lui,
   * l'élève croirait que le produit scalaire ne mesure que les angles aigus.
   * u(4 ; 3) et v(0 ; 5) donnent cos = 15/25 = 0,6 exactement — un angle de
   * 53,13°, dont le cosinus est LISIBLE et non une décimale de dictée.
   */
  angle: Object.freeze({
    aigu: Object.freeze({ u: { x: 4, y: 3 }, v: { x: 0, y: 5 } }),      // cos = 0,6
    droit: Object.freeze({ u: { x: 4, y: 3 }, v: { x: -3, y: 4 } }),    // cos = 0
    obtus: Object.freeze({ u: { x: 4, y: 3 }, v: { x: -5, y: 0 } }),    // cos = −0,8
  }),

  /**
   * M3 — les distances. Un triangle à sommets entiers dont les trois carrés
   * scalaires sont entiers, dont un carré PARFAIT : l'élève doit rencontrer
   * au moins une longueur EXACTE, sinon il croit que la méthode ne rend que
   * des décimales.
   *   AB·AB = 25 → AB = 5 exactement ; BC·BC = 20 ; CA·CA = 37.
   * (Le premier jet annonçait 45 pour CA² : le test l'a corrigé en 37 avant
   * qu'un module ne cite le mauvais nombre.)
   */
  distances: Object.freeze({
    A: Object.freeze({ x: -2, y: -1 }),
    B: Object.freeze({ x: 2, y: 2 }),
    C: Object.freeze({ x: 4, y: -2 }),
  }),

  /** M3 — Al-Kashi : deux côtés et l'angle entre eux, sans coordonnées. */
  alKashi: Object.freeze({ ab: 7, ac: 5, angleA: 60 }),   // BC² = 39

  /**
   * M4 — la forme normale. Un point et un normal ENTIERS ; le point de
   * contrôle `dehors` ne vérifie PAS l'équation, et sa distance à la droite
   * est calculée.
   */
  normale: Object.freeze({
    P0: Object.freeze({ x: 1, y: -2 }),
    n: Object.freeze({ x: 3, y: 4 }),          // 3x + 4y + 5 = 0
    dessus: Object.freeze({ x: 5, y: -5 }),    // 15 − 20 + 5 = 0 ✔
    dehors: Object.freeze({ x: 0, y: 0 }),     // 5 ≠ 0, distance 1
  }),

  /**
   * M5 — les démonstrations.
   *
   *  alignes   : D, E, F alignés — DE(3 ; 2) et DF(6 ; 4) sont colinéaires
   *              (déterminant nul), et pourtant DE·DF = 26 ≠ 0. C'est le
   *              contre-exemple qui empêche de croire que « produit scalaire
   *              nul » serait le critère d'alignement : l'alignement se lit
   *              sur la COLINÉARITÉ, jamais sur l'orthogonalité.
   *
   *  hauteur   : dans PQR, (PH) est-elle la hauteur issue de P ?
   *              P(2 ; −4), Q(−5 ; −3), R(1 ; 3), H(−2 ; 0).
   *              PH(−4 ; 4), QR(6 ; 6) : PH·QR = −24 + 24 = 0 AU BIT PRÈS,
   *              et H est bien SUR (QR) (det(QH, QR) = 0). Le premier jet
   *              (P(−1;4) Q(−4;−2) R(4;2) H(0;0)) donnait PH·QR = −8 : la
   *              leçon aurait affirmé un angle droit qui n'existait pas.
   *              Défaut attrapé par le test avant tout affichage.
   *
   *  triangles : quatre triangles à trancher par le CALCUL, jamais à l'œil.
   *              t1 rectangle en B (dot 0), t2 QUELCONQUE mais dont l'angle
   *              en C vaut 88,99° (dot = 1), t3 rectangle ISOCÈLE en B,
   *              t4 quelconque dont deux côtés mesurent 10,296 et 10,440 —
   *              soit 1,4 % d'écart, invisible sur 300 px. Sans ces deux
   *              trompe-l'œil, l'élève trancherait à vue et n'aurait aucune
   *              raison de calculer. Les angles sont vérifiés par le test.
   */
  demontrer: Object.freeze({
    alignes: Object.freeze({
      D: Object.freeze({ x: -3, y: -1 }),
      E: Object.freeze({ x: 0, y: 1 }),
      F: Object.freeze({ x: 3, y: 3 }),
    }),
    hauteur: Object.freeze({
      P: Object.freeze({ x: 2, y: -4 }),
      Q: Object.freeze({ x: -5, y: -3 }),
      R: Object.freeze({ x: 1, y: 3 }),
      H: Object.freeze({ x: -2, y: 0 }),
    }),
    triangles: Object.freeze([
      Object.freeze({ id: 't1', A: { x: -5, y: -3 }, B: { x: 1, y: 3 }, C: { x: 4, y: 0 } }),
      Object.freeze({ id: 't2', A: { x: -5, y: -3 }, B: { x: 2, y: 5 }, C: { x: 3, y: -2 } }),
      Object.freeze({ id: 't3', A: { x: -5, y: 0 }, B: { x: 1, y: -3 }, C: { x: 4, y: 3 } }),
      Object.freeze({ id: 't4', A: { x: -5, y: -4 }, B: { x: 0, y: 5 }, C: { x: 5, y: -1 } }),
    ]),
  }),
});

/** Les quatre triangles du module 5, chacun avec sa nature CALCULÉE. */
export const naturesDesTriangles = () =>
  SCENES.demontrer.triangles.map((t) => ({
    ...t,
    nature: nature(t),
    texte: natureTexte(t),
    angles: angles(t),
    cotes: cotes(t),
  }));
