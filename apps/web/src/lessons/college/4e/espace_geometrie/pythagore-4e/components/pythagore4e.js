/**
 * Noyau mathématique de « Théorème de Pythagore » (4e).
 *
 * ─── LA FIGURE NE MENT JAMAIS ─────────────────────────────────────────
 * Tout ce que la leçon affirme est MESURÉ sur les points dessinés : les
 * longueurs, les angles, les aires des trois carrés. Aucune valeur n'est
 * écrite à la main, aucune n'est « corrigée » pour tomber juste. C'est ce qui
 * garantit qu'un élève qui déforme le triangle voit des nombres exacts, et
 * que la leçon ne peut pas être démentie par sa propre figure
 * (INTERACTION_PEDAGOGY §28bis).
 *
 * ─── CE QUE LA 4e APPORTE, ET SA FRONTIÈRE ────────────────────────────
 * Objet officiel `triangles`, périmètre de 4e :
 *     include — « Théorème de Pythagore (direct, réciproque, contraposée) ».
 *     exclude — Thalès, trigonométrie.
 * La 3e (`pythagore-3e`) ajoute l'application à l'espace et le choix de la
 * relation dans des configurations complexes. Ce noyau n'expose donc ni
 * `distance3d`, ni `thales`, ni `cos/sin/tan`, et `assertScope4e` lève si on
 * les demande.
 *
 * ─── POURQUOI LE DÉCOUPAGE EST CALCULÉ ────────────────────────────────
 * Le module 3 fait GLISSER cinq pièces dans le grand carré. Si leurs
 * positions étaient dessinées à la main, elles ne pourraient être justes que
 * pour un seul triangle — et la manipulation mentirait dès que l'élève en
 * change. `perigal(a, b)` les calcule, et un test vérifie qu'elles pavent le
 * grand carré EXACTEMENT : même aire totale, aucun chevauchement.
 */

/* ══ Géométrie de base ════════════════════════════════════════════════ */

/** Arrondi d'affichage et de comparaison, au centième. */
export const arrondi = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

/** Format français : virgule décimale. */
export const fr = (x, d = 2) =>
  Number.isFinite(x) ? x.toLocaleString('fr-FR', { maximumFractionDigits: d }) : '—';

export const dist = (P, Q) => Math.hypot(Q.x - P.x, Q.y - P.y);
export const milieu = (P, Q) => ({ x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 });

/** L'angle en B dans le triangle ABC, en degrés. */
export function angleEn(A, B, C) {
  const u = { x: A.x - B.x, y: A.y - B.y };
  const v = { x: C.x - B.x, y: C.y - B.y };
  const n = Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y);
  if (n === 0) return 0;
  const cos = Math.min(1, Math.max(-1, (u.x * v.x + u.y * v.y) / n));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Aire d'un polygone, par la formule du lacet. Toujours positive. */
export function aire(points) {
  let s = 0;
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    const q = points[(i + 1) % points.length];
    s += p.x * q.y - q.x * p.y;
  }
  return Math.abs(s) / 2;
}

/* ══ Le triangle et ses trois carrés ══════════════════════════════════ */

/**
 * Les trois côtés d'un triangle, avec leurs longueurs MESURÉES et le nom du
 * sommet opposé — c'est ce nom qui permet de dire « le côté opposé à l'angle
 * droit », donc de définir l'hypoténuse sans jamais la désigner par sa
 * position sur le dessin.
 */
export function cotes({ A, B, C }) {
  return [
    { de: 'B', a: 'C', opposeA: 'A', longueur: dist(B, C), p: B, q: C },
    { de: 'A', a: 'C', opposeA: 'B', longueur: dist(A, C), p: A, q: C },
    { de: 'A', a: 'B', opposeA: 'C', longueur: dist(A, B), p: A, q: B },
  ];
}

/** Les trois angles du triangle, en degrés. */
export const angles = ({ A, B, C }) => ({
  A: angleEn(B, A, C),
  B: angleEn(A, B, C),
  C: angleEn(A, C, B),
});

/**
 * Le sommet où l'angle est le plus proche de 90°, et son écart.
 * Sert au verdict « aigu / droit / obtus » du module 2 : le triangle N'EST
 * PAS corrigé, on lit ce qu'il est.
 */
export function sommetLePlusDroit(T) {
  const a = angles(T);
  return Object.entries(a)
    .map(([nom, valeur]) => ({ nom, valeur, ecart: Math.abs(valeur - 90) }))
    .sort((x, y) => x.ecart - y.ecart)[0];
}

/** Le triangle est-il rectangle, à la tolérance donnée (en degrés) ? */
export const estRectangle = (T, tol = 0.5) => sommetLePlusDroit(T).ecart <= tol;

/**
 * L'HYPOTÉNUSE : le côté opposé à l'angle droit. Défini par l'angle, pas par
 * « le plus long » — même si c'est équivalent, c'est la définition qui compte
 * et c'est elle qui survit quand la figure est tournée.
 * Renvoie `null` si le triangle n'est pas rectangle : sans angle droit, il n'y
 * a pas d'hypoténuse, et la leçon doit pouvoir le dire.
 */
export function hypotenuseDe(T, tol = 0.5) {
  const droit = sommetLePlusDroit(T);
  if (droit.ecart > tol) return null;
  return cotes(T).find((c) => c.opposeA === droit.nom) ?? null;
}

/**
 * Le carré construit à L'EXTÉRIEUR du triangle sur le côté [PQ].
 * L'extérieur est déterminé par le troisième sommet : le carré part du côté
 * opposé à lui. Sans cela, les carrés se superposeraient au triangle pour
 * certaines formes — un défaut qui ne se voit qu'à l'écran, sur une seule
 * position.
 */
export function carreSurCote(P, Q, troisieme) {
  const dx = Q.x - P.x;
  const dy = Q.y - P.y;
  // Les deux normales possibles ; on garde celle qui s'éloigne du triangle.
  const n1 = { x: -dy, y: dx };
  const n2 = { x: dy, y: -dx };
  const centreCote = milieu(P, Q);
  const versTroisieme = { x: troisieme.x - centreCote.x, y: troisieme.y - centreCote.y };
  const n = n1.x * versTroisieme.x + n1.y * versTroisieme.y > 0 ? n2 : n1;
  return [P, Q, { x: Q.x + n.x, y: Q.y + n.y }, { x: P.x + n.x, y: P.y + n.y }];
}

/**
 * Les trois carrés du triangle, avec leur aire MESURÉE (par la formule du
 * lacet, sur les sommets réellement calculés — pas par « longueur² »).
 * C'est volontaire : la leçon affirme que l'aire du grand vaut la somme des
 * deux autres, et cette affirmation doit porter sur des aires mesurées, pas
 * sur une identité algébrique déguisée en observation.
 */
export function troisCarres(T) {
  const troisieme = { A: T.A, B: T.B, C: T.C };
  return cotes(T).map((c) => {
    const sommets = carreSurCote(c.p, c.q, troisieme[c.opposeA]);
    return { ...c, sommets, aire: aire(sommets) };
  });
}

/**
 * Le bilan des aires : les deux petits carrés d'un côté, le grand de l'autre.
 * `ecart` est ce que la leçon montre au module 2 quand l'angle se casse.
 */
export function bilanAires(T) {
  const carres = troisCarres(T);
  const tries = [...carres].sort((a, b) => a.aire - b.aire);
  const petits = tries.slice(0, 2);
  const grand = tries[2];
  const somme = petits[0].aire + petits[1].aire;
  return {
    petits,
    grand,
    somme,
    ecart: grand.aire - somme,
    equilibre: Math.abs(grand.aire - somme) < Math.max(1, grand.aire) * 0.005,
  };
}

/* ══ Le puzzle de la preuve ═══════════════════════════════════════════ */

/**
 * LE PUZZLE, CALCULÉ — et pourquoi celui-ci.
 *
 * Dans un cadre carré de côté (a + b), on pose quatre copies du triangle
 * rectangle de départ, une par coin. Ce qui reste au centre est un carré
 * INCLINÉ dont le côté vaut exactement c — l'hypoténuse. L'élève voit donc
 * apparaître c², non pas parce qu'on le lui dit, mais parce que c'est le trou
 * que les quatre triangles laissent.
 *
 * L'identité qui en découle est immédiate et se lit sur la figure :
 *
 *     (a + b)²  =  4 × (a·b / 2)  +  c²
 *      a² + 2ab + b²  =  2ab + c²
 *      a² + b²  =  c²
 *
 * Trois qualités de cette disposition :
 *   1. les pièces SONT le triangle de la leçon, à l'identique — l'élève
 *      reconnaît ce qu'il manipule ;
 *   2. le carré du milieu n'est pas dessiné : il APPARAÎT quand les quatre
 *      pièces sont posées, et c'est là toute la découverte ;
 *   3. tout se calcule, donc tout se vérifie — aires, débordement,
 *      chevauchement, longueur du côté incliné. Un test le fait.
 *
 * Repère local : origine en bas à gauche du cadre, côté (a + b).
 *
 * PIÈGE ÉVITÉ : une première version posait quatre rectangles de côté
 * moyen/2 aux coins d'un carré de côté c. Les aires tombaient juste — et les
 * pièces se chevauchaient, parce que 2 × (moyen/2) dépasse c dès que a et b
 * sont proches. Les aires ne suffisent pas à valider un pavage : il faut
 * vérifier la géométrie, et c'est ce que fait le test.
 *
 * @returns {{cadre:number, cote:number, aireTotale:number,
 *            pieces: Array<{id, source, sommets, aire}>, carreIncline: object}}
 */
export function puzzlePreuve(a, b) {
  if (!(a > 0) || !(b > 0)) throw new Error('puzzlePreuve : les deux côtés doivent être strictement positifs');
  const c = Math.sqrt(a * a + b * b);
  const S = a + b;

  const coins = [{ x: 0, y: 0 }, { x: S, y: 0 }, { x: S, y: S }, { x: 0, y: S }];
  // Un point à distance `a` du coin précédent, sur chaque bord, dans le sens
  // direct. C'est ce décalage qui fait tourner le « moulin ».
  const jalons = [{ x: a, y: 0 }, { x: S, y: a }, { x: S - a, y: S }, { x: 0, y: S - a }];

  const sommetsTriangles = [
    [coins[0], jalons[0], jalons[3]],
    [coins[1], jalons[1], jalons[0]],
    [coins[2], jalons[2], jalons[1]],
    [coins[3], jalons[3], jalons[2]],
  ];

  const pieces = sommetsTriangles.map((sommets, i) => ({
    id: `t${i + 1}`,
    source: 'triangle',
    sommets,
    aire: aire(sommets),
  }));

  return {
    cadre: S,
    cote: c,
    carreIncline: { sommets: jalons, aire: aire(jalons), cote: dist(jalons[0], jalons[1]) },
    aireTotale: pieces.reduce((s, p) => s + p.aire, 0) + aire(jalons),
    pieces,
  };
}

/* ══ Les calculs de longueur ══════════════════════════════════════════ */

/**
 * L'hypoténuse, connaissant les deux côtés de l'angle droit.
 * Renvoie la valeur ET son statut : entière, décimale finie, ou à encadrer.
 * C'est ce statut qui permet à la leçon de dire « ça tombe juste » ou « on
 * encadre » sans jamais se tromper sur un cas particulier.
 */
export function hypotenuse(a, b) {
  if (!(a > 0) || !(b > 0)) throw new Error('hypotenuse : les deux côtés doivent être strictement positifs');
  const carre = a * a + b * b;
  const racine = Math.sqrt(carre);
  return { carre, valeur: racine, exacte: Number.isInteger(racine), encadrement: encadrer(carre) };
}

/** Un côté de l'angle droit, connaissant l'hypoténuse et l'autre côté. */
export function coteAngleDroit(c, a) {
  if (!(c > 0) || !(a > 0)) throw new Error('coteAngleDroit : les longueurs doivent être strictement positives');
  if (a >= c) throw new Error('coteAngleDroit : l’hypoténuse est le plus grand côté — a doit être plus petit que c');
  const carre = c * c - a * a;
  const racine = Math.sqrt(carre);
  return { carre, valeur: racine, exacte: Number.isInteger(racine), encadrement: encadrer(carre) };
}

/** Les deux entiers consécutifs qui encadrent √n. */
export function encadrer(n) {
  if (n < 0) throw new Error('encadrer : pas de racine carrée d’un nombre négatif');
  const bas = Math.floor(Math.sqrt(n));
  return Number.isInteger(Math.sqrt(n)) ? { bas, haut: bas, exact: true } : { bas, haut: bas + 1, exact: false };
}

/* ══ Réciproque et contraposée ════════════════════════════════════════ */

/**
 * LE VERDICT, à partir de TROIS LONGUEURS SEULES — sans figure.
 *
 * C'est la situation de la réciproque : on ne voit pas le triangle, on ne peut
 * pas mesurer l'angle, on ne dispose que des nombres. Le verdict compare les
 * deux membres et dit lequel l'emporte, ce qui couvre d'un seul objet la
 * réciproque (ils sont égaux → rectangle) et la contraposée (ils diffèrent →
 * pas rectangle).
 */
export function verdict(a, b, c) {
  const cotes = [a, b, c].sort((x, y) => x - y);
  const [p, q, plusGrand] = cotes;
  if (p <= 0) throw new Error('verdict : les trois longueurs doivent être strictement positives');
  const membreGauche = p * p + q * q;
  const membreDroit = plusGrand * plusGrand;
  const egaux = Math.abs(membreGauche - membreDroit) < 1e-9;
  return {
    cotes,
    plusGrand,
    membreGauche: arrondi(membreGauche, 6),
    membreDroit: arrondi(membreDroit, 6),
    egaux,
    rectangle: egaux,
    // L'inégalité triangulaire : sans elle, le triangle n'existe pas, et le
    // verdict n'aurait aucun sens.
    existe: p + q > plusGrand,
    raison: egaux
      ? 'les deux membres sont égaux : le triangle est rectangle'
      : membreDroit > membreGauche
        ? 'le carré du plus grand côté dépasse la somme des deux autres : l’angle est obtus'
        : 'le carré du plus grand côté est inférieur à la somme des deux autres : les trois angles sont aigus',
  };
}

/* ══ Le périmètre, en code ════════════════════════════════════════════ */

/**
 * FRONTIÈRE 4e / 3e, EXÉCUTABLE.
 *
 * Ce noyau ne connaît que la géométrie PLANE, et ne sait ni appliquer
 * Pythagore dans l'espace, ni choisir une relation trigonométrique, ni
 * mobiliser Thalès : ce sont des objets de 3e (`pythagore-3e`, `thales-3e`,
 * `trigonometrie-triangle-rectangle-3e`). Les tests vérifient l'ABSENCE des
 * fonctions correspondantes ; cette fonction est la garde côté données.
 */
export function assertScope4e(sujet) {
  const interdits = {
    espace: 'appliquer Pythagore dans un solide est un objet de 3e',
    thales: 'le théorème de Thalès est un objet de 3e',
    trigonometrie: 'la trigonométrie (cosinus, sinus, tangente) est un objet de 3e',
    'racine-produit': 'le produit et le quotient de racines sont des objets de 3e',
  };
  if (interdits[sujet]) throw new Error(`Hors programme de 4e : ${interdits[sujet]}`);
  return true;
}

/* ══ Les données de la leçon ══════════════════════════════════════════ */

/**
 * Le triangle de départ du module 1 : A et B fixes, C sur le cercle de
 * diamètre [AB]. L'angle droit en C est alors une PROPRIÉTÉ de la figure
 * (l'angle inscrit dans un demi-cercle), pas un aimant qui corrigerait la
 * position — c'est ce qui fait que l'élève peut déformer librement sans
 * jamais casser l'angle droit.
 */
export const CADRE = { largeur: 620, hauteur: 460 };
export const A_DEFAUT = { x: 150, y: 330 };
export const B_DEFAUT = { x: 430, y: 330 };

/** Le point du cercle de diamètre [AB] repéré par son angle. */
export function surLeCercle(A, B, theta) {
  const O = milieu(A, B);
  const r = dist(A, B) / 2;
  return { x: O.x + r * Math.cos(theta), y: O.y - r * Math.sin(theta) };
}

/** Les triplets pythagoriciens utilisés par la leçon (entiers, vérifiés). */
export const TRIPLETS = [
  { a: 3, b: 4, c: 5 },
  { a: 6, b: 8, c: 10 },
  { a: 5, b: 12, c: 13 },
  { a: 8, b: 15, c: 17 },
  { a: 9, b: 12, c: 15 },
];
