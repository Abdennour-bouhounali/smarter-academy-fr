/**
 * Le modèle mathématique de « L'espace : droites, plans et distances » (1ère spé).
 *
 * ─── CE QUE CE FICHIER NE REFAIT PAS ───────────────────────────────────
 * L'algèbre 3D (`dot3`, `cross3`, `sub3`, `rotateSolid`, `projectCavaliere`,
 * `visibleEdges`…) vient de `common/utils/geometry3d.js`. Ce fichier la
 * SPÉCIALISE : il pose le cube de la leçon, le plan mobile, la droite mobile,
 * et il dérive TOUT ce que les modules affichent.
 *
 * Il ne modifie pas non plus `espace-vecteurs-coordonnees-1ere`, dont cette
 * leçon est la suite directe : ce dont il a besoin (le cube d'arête 2 ancré à
 * l'origine, l'écriture française, le glisser aimanté, la parade au piège de
 * la perspective) est RECOPIÉ ici, spécialisé, et retesté.
 *
 * ─── LE REPÈRE DE L'ÉLÈVE, ET CELUI DU DESSIN ──────────────────────────
 * L'élève travaille dans le repère (A ; i, j, k) où
 *     x va vers la DROITE,  y va vers le FOND,  z va vers le HAUT,
 * et le cube ABCDEFGH occupe [0 ; 2]³ :
 *     A(0;0;0) B(2;0;0) C(2;2;0) D(0;2;0)     — le plancher (z = 0)
 *     E(0;0;2) F(2;0;2) G(2;2;2) H(0;2;2)     — le plafond  (z = 2)
 *
 * `geometry3d` utilise un autre repère (§CONVENTIONS) : y vers le HAUT,
 * z vers l'OBSERVATEUR. La traduction est `versMonde` / `versEleve`, et
 * c'est le SEUL endroit du fichier où elle a lieu. Une leçon qui mélange les
 * deux repères dessine un solide retourné et trace ses arêtes cachées en
 * trait plein.
 *
 * POURQUOI CE REPÈRE-CI POUR L'ÉLÈVE. Le plan mobile de la manipulation
 * signature est un plan HORIZONTAL qui MONTE. Un élève qui le fait monter doit
 * voir croître le nombre qu'il lit ; c'est le cas si ce nombre est la
 * troisième coordonnée, et si la troisième coordonnée est la hauteur. Nommer
 * « z » la profondeur (comme le fait la leçon voisine, dont le sujet est tout
 * autre) rendrait le geste et le nombre contradictoires.
 *
 * ─── POURQUOI DES COORDONNÉES ENTIÈRES ─────────────────────────────────
 * Arête 2, sommet A à l'origine, milieux d'arête entiers (1). Conséquences,
 * toutes vérifiées par les tests :
 *   - tout produit scalaire directeur·normal est un ENTIER exact : jamais un
 *     1e-16 qui ferait passer une droite parallèle pour une sécante ;
 *   - les normaux des plans remarquables sont (0;0;1), (0;1;0), (1;0;0),
 *     (1;1;1), (1;−1;1)… — entiers, réduits, lisibles ;
 *   - les distances sortent en radicaux lisibles : 2, 2/√3 = 2√3/3, 4√3/3 ;
 *   - le point de percée de la manipulation tombe sur des coordonnées
 *     ENTIÈRES (0;0;0), (1;1;1), (2;2;2)…
 *
 * ─── LE PIÈGE DE LA PERSPECTIVE, PIRE ICI QU'EN AMONT ──────────────────
 * En projection cavalière, une droite peut PARAÎTRE percer un plan qu'elle
 * rate, et deux plans sécants peuvent paraître parallèles. La leçon ne pose
 * donc JAMAIS une question de position relative sans avoir d'abord donné la
 * rotation, et `orientationsQuiLevent` prouve PAR BALAYAGE qu'une orientation
 * atteignable défait l'ambiguïté, pour chaque configuration proposée. Un test
 * verrouille cette existence : sans lui, la consigne « tourne pour t'en
 * assurer » serait un mensonge.
 */
import {
  v3, sub3, add3, scale3, dot3, cross3, norm3, dist3, normalize3,
  rotateSolid, projectCavaliere, visibleEdges, visibleVertices, vertexName,
} from '../../../../../common/utils/geometry3d';

export {
  v3, sub3, add3, scale3, dot3, cross3, norm3, dist3, normalize3,
  rotateSolid, projectCavaliere, visibleEdges, visibleVertices, vertexName,
};

/* ── Écriture française ───────────────────────────────────────────────── */

/**
 * ZÉRO EST UN ZÉRO. `-0 / 2` vaut `-0` en JavaScript : invisible à l'écran,
 * mais `Object.is(-0, 0)` est faux, si bien qu'un `toBe(0)` ou une comparaison
 * d'option de QCM échoue sans que rien ne paraisse anormal. On normalise À LA
 * SOURCE, jamais à l'affichage.
 */
export const zero = (n) => (n === 0 ? 0 : n);

/** Un nombre à la française : virgule, vrai signe moins, jamais « −0 ». */
export function fr(n, maxDecimals = 2) {
  if (!Number.isFinite(n)) return '?';
  let r = Math.round(n * 10 ** maxDecimals) / 10 ** maxDecimals;
  if (Object.is(r, -0) || r === 0) r = 0;
  return String(r).replace('.', ',').replace('-', '−');
}

/** Les coordonnées d'un point ou d'un vecteur : (2 ; 0 ; −2). */
export const frVec3 = (v) => `(${fr(v.x)} ; ${fr(v.y)} ; ${fr(v.z)})`;

/**
 * Lecture d'une réponse numérique SIGNÉE.
 *
 * `parseDec` de @smarter-academy/core refuse le vrai signe moins « − »
 * (U+2212), celui que la leçon écrit partout, et `parseFr` refuse en plus les
 * décimaux. Une leçon dont les produits scalaires et les coefficients d
 * sont souvent négatifs a donc besoin de sa propre lecture, sans quoi « −2 »
 * ne validerait jamais.
 */
export function parseSigned(str) {
  if (typeof str === 'number') return Number.isFinite(str) ? str : NaN;
  if (typeof str !== 'string') return NaN;
  const s = str
    .trim()
    .replace(/[\s  ]/g, '')
    .replace(/[−–—]/g, '-')
    .replace(',', '.');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  return Number(s);
}

/* ── Le cube de la leçon, dans le repère de l'élève ───────────────────── */

/** L'arête du cube. Entière et paire : les milieux d'arête restent entiers. */
export const ARETE = 2;

const c = ARETE;

/** Les huit sommets, en coordonnées d'ÉLÈVE (x droite, y fond, z hauteur). */
export const SOMMETS = Object.freeze({
  A: Object.freeze(v3(0, 0, 0)),
  B: Object.freeze(v3(c, 0, 0)),
  C: Object.freeze(v3(c, c, 0)),
  D: Object.freeze(v3(0, c, 0)),
  E: Object.freeze(v3(0, 0, c)),
  F: Object.freeze(v3(c, 0, c)),
  G: Object.freeze(v3(c, c, c)),
  H: Object.freeze(v3(0, c, c)),
});

export const NOMS = Object.freeze(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
export const IDX = Object.freeze(Object.fromEntries(NOMS.map((n, i) => [n, i])));

/** Le point de nom `nom` (« G »), en coordonnées d'élève. */
export function pt(nom) {
  const p = SOMMETS[nom];
  if (!p) throw new Error(`pt: sommet inconnu « ${nom} »`);
  return p;
}

/** Le vecteur d'un sommet vers un autre, par leurs NOMS : vecNom('A','G'). */
export function vecNom(depart, arrivee) {
  return sub3(pt(arrivee), pt(depart));
}

/* ── Le pont entre le repère de l'élève et celui de geometry3d ────────── */

/**
 * Repère élève (x droite, y fond, z hauteur) → repère monde de geometry3d
 * (x droite, y haut, z vers l'observateur).
 *
 *   x_monde = x_élève       la droite reste la droite
 *   y_monde = z_élève       la hauteur de l'élève est le haut du monde
 *   z_monde = −y_élève      le fond de l'élève s'éloigne de l'observateur
 *
 * C'est une rotation, pas une symétrie : son déterminant vaut +1, ce qu'un
 * test vérifie. Une conversion de déterminant −1 retournerait le solide, et
 * `visibleEdges` tracerait en trait plein les arêtes cachées.
 */
export function versMonde(e) {
  return { x: zero(e.x), y: zero(e.z), z: zero(-e.y) };
}

/** L'inverse : du monde du dessin vers le repère de l'élève. */
export function versEleve(m) {
  return { x: zero(m.x), y: zero(-m.z), z: zero(m.y) };
}

/**
 * Le solide, en coordonnées MONDE, tel que geometry3d l'attend.
 *
 * Faces listées en sens anti-horaire VUE DE L'EXTÉRIEUR (convention
 * geometry3d §3) : c'est cet ordre qui donne une normale sortante, donc un
 * test de visibilité correct. Un test vérifie que chaque normale sortante
 * pointe bien à l'opposé du centre.
 */
export const CUBE = Object.freeze({
  id: 'cube-droites-plans',
  nom: 'cube',
  emoji: '📦',
  arete: c,
  vertices: NOMS.map((n) => versMonde(SOMMETS[n])),
  names: [...NOMS],
  edges: [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ],
  faces: [
    [0, 1, 5, 4], // avant   (y_élève = 0)
    [2, 3, 7, 6], // arrière (y_élève = 2)
    [1, 2, 6, 5], // droite  (x = 2)
    [3, 0, 4, 7], // gauche  (x = 0)
    [4, 5, 6, 7], // dessus  (z = 2)
    [3, 2, 1, 0], // dessous (z = 0)
  ],
});

/* ── Arithmétique entière : réduire un vecteur normal ─────────────────── */

function pgcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) { [x, y] = [y, x % y]; }
  return x;
}

/**
 * Le vecteur normal RÉDUIT : on divise par le pgcd des trois coordonnées, puis
 * on rend positive la première coordonnée non nulle.
 *
 * POURQUOI CETTE FORME CANONIQUE. Deux plans parallèles doivent avoir le MÊME
 * normal affiché, sans quoi l'élève croirait qu'ils diffèrent ; et une équation
 * cartésienne doit être comparable à celle du corrigé. Sans réduction, le plan
 * (BDE) sortirait avec n = (−4 ; −4 ; −4) selon l'ordre des trois points
 * choisis, et l'équation « −4x − 4y − 4z + 8 = 0 » — juste, mais illisible et
 * incomparable. La réduction est EXACTE : les coordonnées sont entières.
 */
export function reduireNormal(n) {
  const g = pgcd(pgcd(n.x, n.y), n.z);
  if (g === 0) return v3(0, 0, 0);
  let r = v3(zero(n.x / g), zero(n.y / g), zero(n.z / g));
  const premier = [r.x, r.y, r.z].find((t) => t !== 0);
  if (premier < 0) r = v3(zero(-r.x), zero(-r.y), zero(-r.z));
  return r;
}

/* ── LE PLAN ──────────────────────────────────────────────────────────── */

/**
 * Un plan de l'espace : son vecteur normal RÉDUIT (a ; b ; c) et le
 * coefficient d de son équation cartésienne ax + by + cz + d = 0.
 *
 * LE FAIT CENTRAL DE LA LEÇON, et la raison pour laquelle le plan est stocké
 * SOUS CETTE FORME et pas autrement : les trois premiers coefficients de
 * l'équation SONT les coordonnées du vecteur normal. Ce n'est pas une
 * coïncidence d'écriture — c'est la définition, lue à l'envers :
 *     M(x;y;z) appartient au plan  ⟺  n·AM = 0
 *                                  ⟺  a(x−x_A) + b(y−y_A) + c(z−z_A) = 0
 *                                  ⟺  ax + by + cz + d = 0  avec d = −n·A.
 * Le module 5 le fait CONSTATER avant de l'écrire.
 */
export function planDeNormalEtPoint(n, A) {
  const r = reduireNormal(n);
  return { n: r, d: zero(-dot3(r, A)) };
}

/** Le plan passant par trois points NON alignés, donnés par leurs noms. */
export function planParTrois(a, b, cc) {
  const n = cross3(vecNom(a, b), vecNom(a, cc));
  if (n.x === 0 && n.y === 0 && n.z === 0) {
    throw new Error(`planParTrois: ${a}, ${b}, ${cc} sont alignés — ils ne définissent pas un plan`);
  }
  return { ...planDeNormalEtPoint(n, pt(a)), par: [a, b, cc] };
}

/** Le membre de gauche de l'équation, évalué en un point : ax + by + cz + d. */
export function evalPlan(plan, M) {
  return zero(dot3(plan.n, M) + plan.d);
}

/** Le point appartient-il au plan ? Test EXACT : tout est entier. */
export function appartient(plan, M) {
  return evalPlan(plan, M) === 0;
}

/**
 * L'équation cartésienne écrite en toutes lettres : « x + y + z − 2 = 0 ».
 *
 * Les coefficients 1 et −1 s'écrivent sans le « 1 », les termes nuls
 * disparaissent, et le signe est porté par l'opérateur : c'est l'écriture des
 * copies, et un élève qui lit « 1x + 1y + 1z + −2 = 0 » ne reconnaît pas la
 * sienne. Un test balaie les 27 plans remarquables du cube et vérifie que
 * l'écriture ne produit jamais « + −», « 1x » ni un terme nul.
 */
export function equationCartesienne(plan) {
  const { n, d } = plan;
  const termes = [];
  const pousser = (coef, lettre) => {
    if (coef === 0) return;
    const signe = coef < 0 ? '−' : '+';
    const abs = Math.abs(coef);
    const corps = abs === 1 ? lettre : `${fr(abs)}${lettre}`;
    termes.push(termes.length === 0
      ? (coef < 0 ? `−${corps}` : corps)
      : ` ${signe} ${corps}`);
  };
  pousser(n.x, 'x');
  pousser(n.y, 'y');
  pousser(n.z, 'z');
  if (d !== 0) termes.push(` ${d < 0 ? '−' : '+'} ${fr(Math.abs(d))}`);
  return `${termes.join('')} = 0`;
}

/* ── POSITIONS RELATIVES : le cœur de la leçon ────────────────────────── */

export const POSITION_DROITE_PLAN = Object.freeze({
  secante: 'secante',
  parallele: 'parallele',
  contenue: 'contenue',
});

/** Le nombre de points communs, en toutes lettres. */
export const POINTS_COMMUNS = Object.freeze({
  secante: '1',
  parallele: '0',
  contenue: 'une infinité',
});

export const LABEL_DROITE_PLAN = Object.freeze({
  secante: 'sécante au plan : elle le perce en un point',
  parallele: 'parallèle au plan, sans être dedans : aucun point commun',
  contenue: 'contenue dans le plan : une infinité de points communs',
});

/**
 * LA DÉCISION, en un seul nombre — le cœur de la leçon.
 *
 * Trois positions seulement, et c'est le produit scalaire u·n du vecteur
 * directeur par le vecteur normal qui les départage :
 *
 *   u·n ≠ 0                  → la droite PERCE le plan, en un point et un seul
 *   u·n = 0 et A ∉ plan      → PARALLÈLE stricte : aucun point commun
 *   u·n = 0 et A ∈ plan      → CONTENUE dans le plan : une infinité
 *
 * Le second test — l'appartenance d'UN point de la droite — est indispensable
 * et ne se déduit pas du premier : c'est exactement ce qu'un élève oublie, et
 * la manipulation du module 1 le lui fait produire à la main.
 *
 * Tout est ENTIER, donc tout est exact : `u·n === 0` n'est jamais un « presque
 * zéro » qu'un epsilon aurait à rattraper.
 */
export function positionDroitePlan(droite, plan) {
  const un = zero(dot3(droite.u, plan.n));
  if (un !== 0) return POSITION_DROITE_PLAN.secante;
  return appartient(plan, droite.A)
    ? POSITION_DROITE_PLAN.contenue
    : POSITION_DROITE_PLAN.parallele;
}

/**
 * Le VERDICT complet sur un couple droite / plan : tout ce qu'un module
 * affiche, calculé ici et jamais écrit à la main.
 *
 * `t` et `M` ne sont définis que dans le cas sécant. `M` est le point de
 * percée : A + t·u avec t = −(n·A + d) / (n·u).
 */
export function verdictDroitePlan(droite, plan) {
  const un = zero(dot3(droite.u, plan.n));
  const position = positionDroitePlan(droite, plan);
  const base = {
    droite, plan, un,
    position,
    pointsCommuns: POINTS_COMMUNS[position],
    aPointDansPlan: appartient(plan, droite.A),
    t: null, M: null, MSurSegment: false,
  };
  if (position !== POSITION_DROITE_PLAN.secante) return base;
  const t = -evalPlan(plan, droite.A) / un;
  const M = add3(droite.A, scale3(droite.u, t));
  return {
    ...base,
    t: zero(t),
    M: v3(zero(M.x), zero(M.y), zero(M.z)),
    MSurSegment: t >= 0 && t <= 1,
  };
}

export const POSITION_DEUX_PLANS = Object.freeze({
  secants: 'secants',
  paralleles: 'paralleles',
  confondus: 'confondus',
});

export const LABEL_DEUX_PLANS = Object.freeze({
  secants: 'sécants : leur intersection est une droite',
  paralleles: 'strictement parallèles : aucun point commun',
  confondus: 'confondus : c’est le même plan écrit deux fois',
});

/**
 * DEUX PLANS : deux cas seulement, et ce sont leurs NORMAUX qui décident.
 *
 *   normaux colinéaires et même équation (au facteur près) → confondus
 *   normaux colinéaires, équations différentes             → parallèles stricts
 *   normaux non colinéaires                                → sécants, selon une DROITE
 *
 * Attention à ce qui n'existe PAS ici : deux plans ne peuvent pas être « non
 * coplanaires » comme deux droites. Le troisième cas des droites n'a pas
 * d'équivalent pour les plans, et c'est la surprise du module 3.
 *
 * Le test de colinéarité passe par le produit vectoriel, qui reste ENTIER :
 * il est exact, sans epsilon. Les normaux étant réduits par `reduireNormal`,
 * deux plans parallèles portent littéralement le MÊME normal, et l'égalité
 * des d suffit alors à trancher entre parallèles et confondus.
 */
export function positionDeuxPlans(p1, p2) {
  const w = cross3(p1.n, p2.n);
  if (w.x !== 0 || w.y !== 0 || w.z !== 0) return POSITION_DEUX_PLANS.secants;
  return p1.d === p2.d ? POSITION_DEUX_PLANS.confondus : POSITION_DEUX_PLANS.paralleles;
}

export function verdictDeuxPlans(p1, p2) {
  const position = positionDeuxPlans(p1, p2);
  return {
    p1, p2, position,
    normauxColineaires: position !== POSITION_DEUX_PLANS.secants,
    // La distance n'a de sens QUE pour deux plans parallèles : deux plans
    // sécants se touchent, deux plans confondus sont le même. Rendre un
    // nombre dans ces cas-là inviterait à l'afficher.
    distance: position === POSITION_DEUX_PLANS.paralleles
      ? { num: Math.abs(p1.d - p2.d), n2: dot3(p1.n, p1.n) }
      : null,
  };
}

/* ── LA DROITE : représentation paramétrique ──────────────────────────── */

/** Une droite de l'espace : un point A et un vecteur directeur u non nul. */
export function droiteParPointEtVecteur(A, u, nom = null) {
  if (u.x === 0 && u.y === 0 && u.z === 0) {
    throw new Error('droiteParPointEtVecteur: le vecteur directeur ne peut pas être nul');
  }
  return { A, u, nom };
}

/** La droite passant par deux sommets du cube, désignés par leurs noms. */
export function droiteNom(a, b) {
  return { A: pt(a), u: vecNom(a, b), nom: `(${a}${b})`, a, b };
}

/**
 * Le point de la droite de paramètre t : A + t·u.
 *
 * C'EST LA DÉFINITION MÊME de la représentation paramétrique, et c'est ce que
 * le module 4 fait produire au doigt : le paramètre t n'est pas une lettre de
 * plus, c'est le CURSEUR qui parcourt la droite. t = 0 donne A, t = 1 donne
 * A + u, t négatif repart de l'autre côté.
 */
export function pointDeParametre(droite, t) {
  const M = add3(droite.A, scale3(droite.u, t));
  return v3(zero(M.x), zero(M.y), zero(M.z));
}

/**
 * Le paramètre t d'un point de la droite — ou null si le point n'y est pas.
 *
 * Sert au module 4 : l'élève place un point, et la leçon lui répond « oui,
 * c'est le point de paramètre 0,5 » ou « non, ce point n'est pas sur la
 * droite ». La vérification porte sur les TROIS coordonnées : deux qui
 * s'accordent ne suffisent pas, et c'est précisément l'erreur visée.
 */
export function parametreDe(droite, M) {
  const w = sub3(M, droite.A);
  const { u } = droite;
  let t = null;
  for (const axe of ['x', 'y', 'z']) {
    if (u[axe] === 0) {
      if (w[axe] !== 0) return null;
    } else {
      const cand = w[axe] / u[axe];
      if (t === null) t = cand;
      else if (Math.abs(cand - t) > 1e-9) return null;
    }
  }
  return t === null ? null : zero(t);
}

/**
 * Les trois lignes de la représentation paramétrique, prêtes à l'affichage :
 * « x = 0 + 2t », « y = 0 + 2t », « z = 0 + 2t ».
 *
 * Le coefficient est écrit MÊME QUAND IL VAUT 0 (« z = 0 + 0t »), et c'est
 * délibéré : la ligne qui disparaît est exactement celle que l'élève oublie
 * de recopier, et un système à deux lignes ne décrit plus une droite de
 * l'espace. Un test verrouille les trois lignes.
 */
export function lignesParametriques(droite, lettre = 't') {
  const { A, u } = droite;
  return ['x', 'y', 'z'].map((axe) => ({
    axe,
    origine: zero(A[axe]),
    coef: zero(u[axe]),
    texte: `${axe} = ${fr(A[axe])} ${u[axe] < 0 ? '−' : '+'} ${fr(Math.abs(u[axe]))}${lettre}`,
  }));
}

/* ── PARALLÉLISME ET ORTHOGONALITÉ : les quatre démonstrations ────────── */

/** Deux vecteurs sont colinéaires ⟺ leur produit vectoriel est nul (exact). */
export function colineaires(u, v) {
  const w = cross3(u, v);
  return w.x === 0 && w.y === 0 && w.z === 0;
}

/** Deux vecteurs sont orthogonaux ⟺ leur produit scalaire est nul (exact). */
export function orthogonaux(u, v) {
  return zero(dot3(u, v)) === 0;
}

/**
 * LES QUATRE ÉNONCÉS que la leçon démontre, et le calcul qui décide chacun.
 *
 * C'est ici que se joue le contresens le plus coûteux du chapitre, et la
 * raison pour laquelle ces quatre cas vivent dans UNE table et non dans quatre
 * fonctions éparpillées : le rôle du produit scalaire s'INVERSE entre la
 * droite et le plan.
 *
 *   droite ∥ droite   les DIRECTEURS sont colinéaires
 *   droite ⊥ droite   les DIRECTEURS ont un produit scalaire nul
 *   droite ∥ plan     le directeur et le NORMAL ont un produit scalaire nul  ← nul = parallèle
 *   droite ⊥ plan     le directeur et le NORMAL sont COLINÉAIRES             ← colinéaire = orthogonal
 *   plan ∥ plan       les NORMAUX sont colinéaires
 *   plan ⊥ plan       les NORMAUX ont un produit scalaire nul
 *
 * Un élève qui applique « produit nul ⇒ orthogonal » à un couple
 * droite/plan conclut exactement le contraire de la vérité. Le module 6 le lui
 * fait produire, sur la même figure, à une minute d'intervalle.
 */
export function droiteParalleleAuPlan(droite, plan) {
  return orthogonaux(droite.u, plan.n) && !appartient(plan, droite.A);
}

export function droiteOrthogonaleAuPlan(droite, plan) {
  return colineaires(droite.u, plan.n);
}

export function plansParalleles(p1, p2) {
  return colineaires(p1.n, p2.n);
}

export function plansOrthogonaux(p1, p2) {
  return orthogonaux(p1.n, p2.n);
}

/* ── DISTANCES ────────────────────────────────────────────────────────── */

/**
 * Un radical simplifié, EXACT et sans flottant : 8 devient 2√2, 12 devient
 * 2√3, 4 devient 2. Le carré est toujours un entier — les coordonnées le sont —
 * donc l'extraction du plus grand carré parfait se fait à l'entier près.
 *
 * POURQUOI PAS UN ARRONDI. La leçon promet des distances « lisibles ».
 * Afficher 1,15 là où la réponse exacte est 2√3/3 apprendrait à arrondir, et
 * rendrait deux distances voisines indiscernables.
 */
export function radical(carre) {
  if (!Number.isInteger(carre) || carre < 0) return fr(Math.sqrt(carre));
  if (carre === 0) return '0';
  let dehors = 1;
  let dedans = carre;
  for (let k = 2; k * k <= dedans; k += 1) {
    while (dedans % (k * k) === 0) { dedans /= k * k; dehors *= k; }
  }
  if (dedans === 1) return String(dehors);
  return dehors === 1 ? `√${dedans}` : `${dehors}√${dedans}`;
}

/**
 * Un quotient de la forme p/√q, écrit sous forme RATIONALISÉE et simplifiée :
 * 2/√3 devient « 2√3/3 », 4/√1 devient « 4 », 2/√4 devient « 1 ».
 *
 * C'est l'écriture attendue d'une copie de Première. Un test balaie les
 * distances de tous les sommets à tous les plans remarquables et vérifie que
 * la forme rendue vaut bien, numériquement, le quotient de départ — ce qui
 * rend impossible une simplification fausse affichée comme exacte.
 */
export function quotientRadical(num, n2) {
  if (num === 0) return '0';

  // On extrait D'ABORD le facteur qui SORT de la racine : √n2 = dehors·√dedans.
  // C'est ce facteur qui doit MULTIPLIER le dénominateur, jamais se coller au
  // numérateur. Un test l'a attrapé : quotientRadical(3, 8) rendait « 32√2/8 »,
  // la concaténation de « 3 » et de « 2√2 », soit 5,66 au lieu de 1,06.
  let dehors = 1;
  let dedans = n2;
  for (let k = 2; k * k <= dedans; k += 1) {
    while (dedans % (k * k) === 0) { dedans /= k * k; dehors *= k; }
  }

  // √n2 est entier : le quotient est une simple fraction.
  if (dedans === 1) {
    const g = pgcd(num, dehors) || 1;
    const haut = num / g;
    const bas = dehors / g;
    return bas === 1 ? String(haut) : `${haut}/${bas}`;
  }

  // Rationalisation : num/(dehors·√dedans) = num·√dedans / (dehors·dedans).
  const bas0 = dehors * dedans;
  const g = pgcd(num, bas0) || 1;
  const haut = num / g;
  const bas = bas0 / g;
  const corps = haut === 1 ? `√${dedans}` : `${haut}√${dedans}`;
  return bas === 1 ? corps : `${corps}/${bas}`;
}

/**
 * LA DISTANCE D'UN POINT À UN PLAN, rendue en trois morceaux :
 * `num` = |ax + by + cz + d|, `n2` = a² + b² + c², `valeur` = num/√n2, et
 * `texte` la forme exacte simplifiée.
 *
 * Les trois morceaux sont rendus SÉPARÉMENT parce que c'est la formule qu'on
 * démontre : le numérateur est ce que l'équation du plan répond au point, le
 * dénominateur est la longueur du normal. Un module qui n'afficherait que le
 * résultat priverait l'élève de la seule chose à comprendre.
 *
 * Le SIGNE de ax + by + cz + d est rendu à part (`signe`) : il ne fait pas
 * partie de la distance, mais il dit DE QUEL CÔTÉ du plan le point se trouve.
 * C'est ce qui permet au module 3 de montrer, sans un mot de plus, que deux
 * sommets sont de part et d'autre.
 */
export function distancePointPlan(M, plan) {
  const brut = evalPlan(plan, M);
  const n2 = zero(dot3(plan.n, plan.n));
  const num = Math.abs(brut);
  return {
    brut,
    signe: brut === 0 ? 0 : Math.sign(brut),
    num,
    n2,
    valeur: num / Math.sqrt(n2),
    texte: quotientRadical(num, n2),
  };
}

/**
 * La distance entre DEUX PLANS PARALLÈLES : |d₁ − d₂| / ‖n‖.
 *
 * Rend null si les plans ne sont pas strictement parallèles — c'est le seul
 * cas où la question a un sens, et rendre 0 pour deux plans sécants
 * inviterait à afficher un nombre là où il n'y a rien à mesurer.
 * Les normaux étant RÉDUITS, ils sont littéralement égaux quand les plans sont
 * parallèles : la soustraction des d est alors licite sans renormalisation,
 * et un test le verrouille.
 */
export function distanceDeuxPlans(p1, p2) {
  if (positionDeuxPlans(p1, p2) !== POSITION_DEUX_PLANS.paralleles) return null;
  const n2 = zero(dot3(p1.n, p1.n));
  const num = Math.abs(p1.d - p2.d);
  return { num, n2, valeur: num / Math.sqrt(n2), texte: quotientRadical(num, n2) };
}

/** Le PROJETÉ ORTHOGONAL d'un point sur un plan : M − (n·M + d)/‖n‖² · n. */
export function projeteSurPlan(M, plan) {
  const k = evalPlan(plan, M) / dot3(plan.n, plan.n);
  const p = sub3(M, scale3(plan.n, k));
  return v3(zero(p.x), zero(p.y), zero(p.z));
}

/* ═══════════════════════════════════════════════════════════════════════
   LA MANIPULATION SIGNATURE — « La droite qui traverse, ou pas »
   ═══════════════════════════════════════════════════════════════════════

   L'ÉTAT est trois entiers, et rien d'autre :
     p ∈ {0;1;2}  la hauteur de la poignée P, sur l'arête verticale [AE]
     q ∈ {0;1;2}  la hauteur de la poignée Q, sur l'arête verticale [CG]
     h ∈ {0;1;2}  la hauteur du plan mobile, d'équation z = h

   La droite est (PQ) avec P(0 ; 0 ; p) et Q(2 ; 2 ; q) : elle traverse
   l'INTÉRIEUR du cube, en diagonale, et non une face. Son directeur est
   u = (2 ; 2 ; q − p), le normal du plan est n = (0 ; 0 ; 1), et donc

       u · n = q − p.

   LES TROIS POSITIONS, ET LEUR ATTEIGNABILITÉ (prouvée par balayage) :
     q ≠ p              → u·n ≠ 0 : la droite PERCE le plan (18 états sur 27)
     q = p et p ≠ h     → u·n = 0, P ∉ plan : PARALLÈLE (6 états)
     q = p et p = h     → u·n = 0, P ∈ plan : CONTENUE (3 états : 0, 1 et 2)

   Le cas « contenue » est le plus délicat, et c'est celui que la consigne
   exige : il demande que TROIS crans coïncident. Il est atteignable trois
   fois, à toutes les hauteurs, et depuis l'état de départ il est à DEUX crans.
   `cheminVers` en exhibe le chemin, et un test l'exécute cran par cran.

   POURQUOI DES CRANS ENTIERS, ET PAS UN GLISSER CONTINU. Le cas « contenue »
   exige une COÏNCIDENCE EXACTE (u·n = 0 ET P dans le plan). Au doigt, sans
   aimantation, il ne serait jamais atteint — l'élève verrait le compteur
   osciller entre 0 et 1 point commun sans jamais lire « une infinité ». Le
   glisser est donc AIMANTÉ sur les entiers : le geste reste un glisser, mais
   la cible reste atteignable. C'est la condition n° 1 de la règle du glisser.
*/

export const NIVEAUX = Object.freeze([0, 1, 2]);

/** L'état de départ : la droite PERCE le plan, en son centre exact (1;1;1). */
export const ETAT_DEPART = Object.freeze({ p: 0, q: 2, h: 1 });

/** Le demi-côté du carré qui matérialise le plan, en unités d'élève.
 *  Mesuré : 1,6 laisse le plan déborder du cube de 0,6 de chaque côté — assez
 *  pour qu'il se lise comme un plan et non comme une face, et assez peu pour
 *  que le cube occupe encore 70 % du cadre à toute rotation (test). */
export const DEMI_PLAN = 1.6;

/** La droite du laboratoire, dérivée de l'état. */
export function droiteDuLabo({ p, q }) {
  const A = v3(0, 0, p);
  const B = v3(c, c, q);
  return { A, B, u: sub3(B, A), nom: '(PQ)' };
}

/** Le plan du laboratoire, dérivé de l'état : z = h, soit 0x + 0y + z − h = 0. */
export function planDuLabo({ h }) {
  return planDeNormalEtPoint(v3(0, 0, 1), v3(0, 0, h));
}

/** Le verdict complet du laboratoire, TOUT calculé depuis les trois entiers. */
export function verdictLabo(etat) {
  const droite = droiteDuLabo(etat);
  const plan = planDuLabo(etat);
  const v = verdictDroitePlan(droite, plan);
  return { ...v, etat, droite, plan };
}

/** Les 27 états atteignables du laboratoire — la plage entière, énumérée. */
export function etatsLabo() {
  const out = [];
  for (const p of NIVEAUX) for (const q of NIVEAUX) for (const h of NIVEAUX) out.push({ p, q, h });
  return out;
}

/**
 * UN CHEMIN, CRAN PAR CRAN, de l'état de départ vers une position donnée.
 *
 * Ce n'est pas un utilitaire de confort : c'est la PREUVE, exécutable, que la
 * consigne du module 1 est faisable. Un test la rejoue cran par cran et
 * vérifie qu'au dernier cran la position demandée est bien atteinte — et que
 * chaque cran intermédiaire reste dans les bornes. Sans elle, « fais glisser
 * jusqu'à ce que la droite se couche dans le plan » pourrait être un ordre
 * impossible, et l'élève aurait raison de ne pas y arriver.
 *
 * Le chemin est le plus court en nombre de crans (distance de Manhattan sur
 * les trois cliquets), et il change UN SEUL cliquet d'UN SEUL cran à la fois :
 * c'est exactement ce que le doigt fait.
 */
export function cheminVers(position, depart = ETAT_DEPART) {
  const cibles = etatsLabo().filter((e) => positionDroitePlan(droiteDuLabo(e), planDuLabo(e)) === position);
  if (cibles.length === 0) return null;
  const cout = (e) => Math.abs(e.p - depart.p) + Math.abs(e.q - depart.q) + Math.abs(e.h - depart.h);
  const cible = cibles.reduce((best, e) => (cout(e) < cout(best) ? e : best), cibles[0]);

  const etapes = [];
  const etat = { ...depart };
  for (const cle of ['p', 'q', 'h']) {
    while (etat[cle] !== cible[cle]) {
      etat[cle] += Math.sign(cible[cle] - etat[cle]);
      etapes.push({ cle, etat: { ...etat } });
    }
  }
  return { cible, etapes };
}

/* ── Rotation : la plage, le glisser, et la parade au piège de la vue ─── */

/** Le pas du cliquet de rotation, en degrés. */
export const PAS_ROT = 15;

/**
 * LA PLAGE DE ROTATION OFFERTE, ET POURQUOI ELLE N'EST PAS CELLE DE LA LEÇON
 * VOISINE.
 *
 * La leçon d'amont offre yaw ∈ [−90 ; 90] et pitch ∈ [−60 ; 60] : son objet
 * est un cube, et un cube se lit sous n'importe quel angle. Ici, l'objet
 * central est un PLAN HORIZONTAL, et un plan horizontal se voit PAR LA
 * TRANCHE — il se projette sur un segment — dès que le regard s'approche de
 * l'horizontale. Un test l'a mesuré : à pitch = 20°, la hauteur apparente du
 * plan tombe à 2 unités d'écran sur 300. La manipulation signature aurait été
 * illisible au premier écran, et la consigne « regarde si elle le traverse »
 * un ordre impossible.
 *
 * La plage est donc CALCULÉE, pas héritée. Sur yaw ∈ [−90 ; 0] et
 * pitch ∈ [30 ; 60], balayés au cran de 15° (21 orientations) :
 *   - la hauteur apparente du plan ne descend jamais sous 30 unités d'écran ;
 *   - les deux poignées de la droite ne se rapprochent jamais à moins de 50
 *     unités, soit deux fois le rayon de saisie : la saisie n'est jamais
 *     ambiguë ;
 *   - 20 des 21 vues plongent sur le solide, ce qui est la vue naturelle d'un
 *     plan qui monte à travers une boîte.
 * Les trois faits sont des tests, pas des estimations.
 *
 * CE QUE LA PLAGE NE COÛTE PAS : l'élève garde 90° de tour horizontal et 30°
 * d'inclinaison, largement de quoi défaire tout croisement apparent — ce qu'un
 * test vérifie configuration par configuration.
 */
export const YAW_RANGE = Object.freeze({ min: -90, max: 0 });
export const PITCH_RANGE = Object.freeze({ min: 30, max: 60 });

/** L'orientation de départ : celle qui, dans la plage, ouvre le plus le plan
 *  (99 unités d'écran de hauteur apparente, mesurées) tout en montrant trois
 *  faces du cube. Un test vérifie qu'elle est atteignable et qu'elle lève
 *  l'ambiguïté aux trois hauteurs. */
export const ORIENTATION_DEPART = Object.freeze({ yaw: -45, pitch: 45 });

/** Toutes les orientations réellement atteignables au cliquet. */
export function orientationsAtteignables() {
  const out = [];
  for (let yaw = YAW_RANGE.min; yaw <= YAW_RANGE.max; yaw += PAS_ROT) {
    for (let pitch = PITCH_RANGE.min; pitch <= PITCH_RANGE.max; pitch += PAS_ROT) {
      out.push({ yaw, pitch });
    }
  }
  return out;
}

/** Une orientation est-elle atteignable au geste ? (cran ET bornes) */
export function estAtteignable(o) {
  const ok = (a, r) => Number.isInteger(a / PAS_ROT) && a >= r.min && a <= r.max;
  return ok(o.yaw, YAW_RANGE) && ok(o.pitch, PITCH_RANGE);
}

/**
 * LE CENTRE DU CUBE, autour duquel il TOURNE — en coordonnées MONDE.
 *
 * Le cube est ancré en A pour que les coordonnées soient entières et petites.
 * Le faire tourner tel quel le ferait pivoter AUTOUR DE A, donc décrire un
 * grand arc à travers le cadre : l'élève verrait la boîte fuir au lieu de
 * tourner sur elle-même. On recentre AVANT de tourner et de projeter ; le
 * repère mathématique de la leçon n'en est pas touché — c'est du DESSIN.
 */
const CENTRE_MONDE = Object.freeze(versMonde(v3(c / 2, c / 2, c / 2)));

/** La projection écran d'une liste de points d'ÉLÈVE, dans une orientation. */
export function projeterEleve(orientation, pointsEleve) {
  const recentres = pointsEleve.map((p) => sub3(versMonde(p), CENTRE_MONDE));
  const tourne = rotateSolid({ vertices: recentres, edges: [], faces: [] }, orientation);
  return tourne.vertices.map((p) => projectCavaliere(p));
}

/** Le rayon maximal du dessin — cube ET plan mobile — sur toute la plage. */
export function rayonMaximal() {
  const coinsPlan = (h) => [
    v3(1 - DEMI_PLAN, 1 - DEMI_PLAN, h), v3(1 + DEMI_PLAN, 1 - DEMI_PLAN, h),
    v3(1 + DEMI_PLAN, 1 + DEMI_PLAN, h), v3(1 - DEMI_PLAN, 1 + DEMI_PLAN, h),
  ];
  const sommets = NOMS.map((n) => SOMMETS[n]);
  let r = 0;
  for (const o of orientationsAtteignables()) {
    for (const h of NIVEAUX) {
      for (const P of projeterEleve(o, [...sommets, ...coinsPlan(h)])) {
        r = Math.max(r, Math.abs(P.x), Math.abs(P.y));
      }
    }
  }
  return r;
}

/**
 * L'ÉCHELLE DU DESSIN, DÉRIVÉE de `rayonMaximal()` et non estimée.
 *
 * Le cadre est carré, de demi-côté `DEMI_CADRE` unités d'écran. On agrandit le
 * dessin pour qu'il remplisse le cadre en gardant `MARGE` unités de garde — de
 * quoi loger la pastille d'une poignée sans jamais sortir du viewBox, quelle
 * que soit la rotation ET quelle que soit la hauteur du plan. Un test balaie
 * les 117 orientations × 3 hauteurs et vérifie qu'aucun point dessiné, pastille
 * comprise, ne franchit le bord. Il ne l'échantillonne pas.
 */
export const DEMI_CADRE = 150;
export const MARGE = 26;
export const ECHELLE = (DEMI_CADRE - MARGE) / rayonMaximal();

/** Le rayon de la pastille DESSINÉE d'une poignée, en unités d'écran. */
export const RAYON_POIGNEE = 9;

/**
 * Le rayon de SAISIE d'une poignée, MESURÉ et non deviné.
 *
 * Le viewBox fait 300 unités de large et se rend sur ≈ 300 px à 375 px de
 * large : le facteur est ≈ 1, et les 44 px de cible tactile exigent un rayon
 * de 22 unités. On prend 24, avec la marge.
 *
 * POURQUOI 24 ET NON DAVANTAGE. Il n'y a que DEUX poignées, et sur la plage de
 * rotation offerte elles ne se rapprochent jamais à moins de 50,65 unités
 * d'écran — mesuré, au pire à (yaw 0 ; pitch 60) avec p = 2 et q = 0. Un rayon
 * de 24 laisse donc les deux zones de saisie DISJOINTES partout : la saisie
 * n'est jamais ambiguë, sans avoir à départager. Un rayon de 26 les ferait se
 * toucher au pire cas, ce qu'un test a refusé.
 */
export const RAYON_SAISIE = 24;

/** Les positions écran des points d'élève, prêtes à dessiner et à cliquer. */
export function ecran(orientation, pointsEleve) {
  return projeterEleve(orientation, pointsEleve).map((p) => ({
    x: DEMI_CADRE + p.x * ECHELLE,
    y: DEMI_CADRE + p.y * ECHELLE,
  }));
}

/** Les huit sommets du cube, à l'écran. */
export function sommetsEcran(orientation) {
  return ecran(orientation, NOMS.map((n) => SOMMETS[n]));
}

/** Les quatre coins du plan mobile de hauteur h, à l'écran. */
export function coinsPlanEcran(orientation, h) {
  return ecran(orientation, [
    v3(1 - DEMI_PLAN, 1 - DEMI_PLAN, h), v3(1 + DEMI_PLAN, 1 - DEMI_PLAN, h),
    v3(1 + DEMI_PLAN, 1 + DEMI_PLAN, h), v3(1 - DEMI_PLAN, 1 + DEMI_PLAN, h),
  ]);
}

/**
 * Aimantation d'un angle sur le cliquet, puis bornage.
 *
 * L'AIMANTATION EST CE QUI REND LE GLISSER COMPATIBLE AVEC L'ATTEIGNABILITÉ.
 * Un doigt ne vise pas au degré ; avec elle, toute orientation atteinte au
 * doigt appartient à `orientationsAtteignables()` — invariant testé.
 */
export function aimanter(angle, { min, max }, pas = PAS_ROT) {
  const k = zero(Math.round(angle / pas) * pas);
  return zero(Math.min(max, Math.max(min, k)));
}

/** Le nombre d'unités d'écran à parcourir pour tourner d'un degré. */
export const SENSIBILITE = 2;

export function orientationApresGlisser(depart, dx, dy) {
  return {
    yaw: aimanter(depart.yaw + dx / SENSIBILITE, YAW_RANGE),
    pitch: aimanter(depart.pitch - dy / SENSIBILITE, PITCH_RANGE),
  };
}

/** Un cran de rotation au clavier, borné — le chemin clavier complet. */
export function orientationApresTouche(depart, touche) {
  const { yaw, pitch } = depart;
  switch (touche) {
    case 'ArrowLeft': return { yaw: aimanter(yaw - PAS_ROT, YAW_RANGE), pitch };
    case 'ArrowRight': return { yaw: aimanter(yaw + PAS_ROT, YAW_RANGE), pitch };
    case 'ArrowUp': return { yaw, pitch: aimanter(pitch + PAS_ROT, PITCH_RANGE) };
    case 'ArrowDown': return { yaw, pitch: aimanter(pitch - PAS_ROT, PITCH_RANGE) };
    case 'Home': return { yaw: YAW_RANGE.min, pitch };
    case 'End': return { yaw: YAW_RANGE.max, pitch };
    case 'PageUp': return { yaw, pitch: PITCH_RANGE.max };
    case 'PageDown': return { yaw, pitch: PITCH_RANGE.min };
    default: return null;
  }
}

/**
 * L'AIMANTATION D'UNE POIGNÉE : d'un point de l'écran vers un cran entier.
 *
 * La poignée se déplace sur une arête VERTICALE du cube : on projette les
 * trois positions possibles (0, 1, 2), on prend la plus proche du doigt à
 * l'écran, et on rend son niveau. Aucun calcul d'inverse de projection —
 * ce serait mal conditionné aux rotations rasantes, et inutile : trois
 * candidats se comparent directement.
 *
 * C'est CE mécanisme qui tient la promesse d'atteignabilité au doigt : la
 * poignée ne peut littéralement pas s'arrêter entre deux crans.
 */
export function niveauLePlusProche(orientation, arete, pointEcran) {
  const base = arete === 'P' ? { x: 0, y: 0 } : { x: c, y: c };
  const P = ecran(orientation, NIVEAUX.map((n) => v3(base.x, base.y, n)));
  let best = NIVEAUX[0];
  let bestD = Infinity;
  for (let i = 0; i < P.length; i += 1) {
    const d = Math.hypot(P[i].x - pointEcran.x, P[i].y - pointEcran.y);
    if (d < bestD) { bestD = d; best = NIVEAUX[i]; }
  }
  return best;
}

/**
 * QUELLE POIGNÉE le doigt attrape — 'P', 'Q', 'plan' ou null.
 *
 * Les deux poignées de la droite l'emportent sur le plan quand le doigt est à
 * portée de l'une d'elles : ce sont de petites cibles, le plan est une grande
 * surface, et laisser le plan gagner rendrait les poignées inatteignables au
 * centre du cadre. Au-delà de `RAYON_SAISIE` des deux poignées, un appui à
 * l'intérieur du quadrilatère du plan saisit le plan ; ailleurs, rien n'est
 * saisi et le geste tourne le solide.
 */
export function poigneeSous(orientation, etat, pointEcran) {
  const cibles = [
    { id: 'P', point: v3(0, 0, etat.p) },
    { id: 'Q', point: v3(c, c, etat.q) },
  ];
  const E = ecran(orientation, cibles.map((t) => t.point));
  let best = null;
  let bestD = Infinity;
  for (let i = 0; i < E.length; i += 1) {
    const d = Math.hypot(E[i].x - pointEcran.x, E[i].y - pointEcran.y);
    if (d < bestD) { bestD = d; best = cibles[i].id; }
  }
  if (bestD <= RAYON_SAISIE) return best;
  return dansPolygone(coinsPlanEcran(orientation, etat.h), pointEcran) ? 'plan' : null;
}

/** Le point est-il dans le quadrilatère ? (lancer de rayon, robuste aux
 *  quadrilatères non convexes que la perspective peut produire aux
 *  orientations rasantes) */
export function dansPolygone(coins, P) {
  let dedans = false;
  for (let i = 0, j = coins.length - 1; i < coins.length; j = i, i += 1) {
    const a = coins[i];
    const b = coins[j];
    if ((a.y > P.y) !== (b.y > P.y)
      && P.x < ((b.x - a.x) * (P.y - a.y)) / (b.y - a.y) + a.x) dedans = !dedans;
  }
  return dedans;
}

/**
 * L'AIMANTATION DU PLAN : d'un point de l'écran vers une hauteur entière.
 *
 * Le plan se déplace VERTICALEMENT : on compare le doigt aux trois positions
 * de son centre, exactement comme pour une poignée. Le geste est donc le même,
 * et la cible reste atteignable au cran près.
 */
export function hauteurLaPlusProche(orientation, pointEcran) {
  const P = ecran(orientation, NIVEAUX.map((h) => v3(1, 1, h)));
  let best = NIVEAUX[0];
  let bestD = Infinity;
  for (let i = 0; i < P.length; i += 1) {
    const d = Math.hypot(P[i].x - pointEcran.x, P[i].y - pointEcran.y);
    if (d < bestD) { bestD = d; best = NIVEAUX[i]; }
  }
  return best;
}

/* ── LA PARADE AU PIÈGE DE LA PERSPECTIVE, PROUVÉE ────────────────────── */

/**
 * Le plan mobile est-il vu PAR LA TRANCHE dans cette orientation ?
 *
 * Un plan horizontal vu de face se projette sur un SEGMENT : sa hauteur
 * apparente tombe à zéro, et il devient impossible de voir si la droite le
 * perce, le longe ou s'y couche. C'est la forme que prend ici le mensonge de
 * la perspective, et c'est mesurable : la hauteur du quadrilatère projeté.
 */
export function hauteurApparentePlan(orientation, h) {
  const C = coinsPlanEcran(orientation, h);
  const ys = C.map((P) => P.y);
  return Math.max(...ys) - Math.min(...ys);
}

/** Le seuil sous lequel le plan est illisible, en unités d'écran. */
export const SEUIL_TRANCHE = 24;

/**
 * LA PARADE, PROUVÉE PAR BALAYAGE : les orientations où le plan de hauteur h
 * se lit comme une SURFACE, et où la position relative se VOIT.
 *
 * La leçon promet « tourne, et tu verras si elle le traverse ». Cette fonction
 * rend la liste des orientations qui tiennent cette promesse ; un test vérifie
 * qu'elle n'est vide pour AUCUNE hauteur et qu'elle contient l'orientation de
 * départ. Sans cela, la consigne serait infaisable.
 */
export function orientationsQuiLevent(h) {
  return orientationsAtteignables().filter((o) => hauteurApparentePlan(o, h) >= SEUIL_TRANCHE);
}

/**
 * DEUX SEGMENTS DE L'ÉCRAN se croisent-ils STRICTEMENT (hors extrémités) ?
 * Sert à mesurer le croisement APPARENT de deux arêtes qui ne se rencontrent
 * pas — le mensonge que la rotation doit défaire.
 */
export function segmentsSeCroisent(p1, p2, p3, p4, eps = 1e-9) {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (Math.abs(d) < eps) return false;
  const t = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const s = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
  return t > eps && t < 1 - eps && s > eps && s < 1 - eps;
}

/**
 * LE CROISEMENT APPARENT d'une droite [AB] du cube avec le CONTOUR d'un plan
 * remarquable, dans une orientation : le dessin montre-t-il une rencontre ?
 *
 * Employé par les tests pour prouver, sur chaque configuration proposée par
 * les modules 2 et 3, qu'il existe une orientation atteignable où l'ambiguïté
 * se défait.
 */
export function croisementApparent(droite, triangle, orientation) {
  const [S] = [ecran(orientation, [droite.A, add3(droite.A, droite.u)])];
  const T = ecran(orientation, triangle.map((n) => pt(n)));
  for (let i = 0; i < T.length; i += 1) {
    if (segmentsSeCroisent(S[0], S[1], T[i], T[(i + 1) % T.length])) return true;
  }
  return false;
}

/* ── LES CONFIGURATIONS TRAVAILLÉES PAR LES MODULES ───────────────────── */

/**
 * Les plans remarquables du cube, nommés par TROIS de leurs points.
 *
 * Aucune équation n'est écrite ici : `planParTrois` les calcule toutes, si
 * bien qu'un énoncé faux est impossible. Les tests recalculent chaque équation
 * citée par un module.
 */
export const PLANS = Object.freeze({
  ABC: ['A', 'B', 'C'],   // le plancher : z = 0
  EFG: ['E', 'F', 'G'],   // le plafond  : z = 2
  ABF: ['A', 'B', 'F'],   // la face avant : y = 0
  DCG: ['D', 'C', 'G'],   // la face arrière : y = 2
  ADH: ['A', 'D', 'H'],   // la face gauche : x = 0
  BCG: ['B', 'C', 'G'],   // la face droite : x = 2
  BDE: ['B', 'D', 'E'],   // le plan diagonal : x + y + z − 2 = 0
  CFH: ['C', 'F', 'H'],   // son parallèle    : x + y + z − 4 = 0
  ACF: ['A', 'C', 'F'],   // x − y − z = 0
  ABG: ['A', 'B', 'G'],   // y − z = 0
});

/** Le plan remarquable de clé `cle`, calculé. */
export function planNomme(cle) {
  const trio = PLANS[cle];
  if (!trio) throw new Error(`planNomme: plan inconnu « ${cle} »`);
  return { ...planParTrois(...trio), cle, nom: `(${trio.join('')})` };
}

/**
 * Les six couples droite / plan du module 2. Aucun verdict n'est écrit :
 * `verdictDroitePlan` les calcule tous.
 *
 * `piege` dit ce que la PERSPECTIVE laisse croire — c'est lui qui justifie
 * d'imposer la rotation AVANT la question, et un test exige qu'une orientation
 * atteignable lève l'ambiguïté pour chacun.
 */
export const COUPLES_DROITE_PLAN = Object.freeze([
  { id: 'dp1', droite: ['A', 'G'], plan: 'ABC', piege: null },
  { id: 'dp2', droite: ['E', 'G'], plan: 'ABC', piege: 'parait-percer' },
  { id: 'dp3', droite: ['B', 'D'], plan: 'BDE', piege: null },
  { id: 'dp4', droite: ['B', 'D'], plan: 'EFG', piege: 'parait-percer' },
  { id: 'dp5', droite: ['A', 'E'], plan: 'ABC', piege: null },
  { id: 'dp6', droite: ['A', 'C'], plan: 'BDE', piege: null },
]);

/** Les verdicts des six couples, CALCULÉS. */
export function verdictsDroitePlan() {
  return COUPLES_DROITE_PLAN.map((k) => ({
    cle: k.id,
    piege: k.piege,
    ...verdictDroitePlan(droiteNom(...k.droite), planNomme(k.plan)),
  }));
}

/** Les cinq couples de plans du module 3. */
export const COUPLES_PLANS = Object.freeze([
  { id: 'pp1', p1: 'BDE', p2: 'CFH' },
  { id: 'pp2', p1: 'ABC', p2: 'EFG' },
  { id: 'pp3', p1: 'ABC', p2: 'ABF' },
  { id: 'pp4', p1: 'BDE', p2: 'ABC' },
  { id: 'pp5', p1: 'ADH', p2: 'BCG' },
]);

export function verdictsDeuxPlans() {
  return COUPLES_PLANS.map((k) => ({
    cle: k.id,
    ...verdictDeuxPlans(planNomme(k.p1), planNomme(k.p2)),
  }));
}
