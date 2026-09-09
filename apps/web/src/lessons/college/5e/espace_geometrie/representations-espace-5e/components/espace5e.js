/**
 * Modèle mathématique de la leçon « Représentation de l'espace » (5e).
 *
 * ─── CE QUE CE MODULE AJOUTE À `common/utils/geometry3d.js` ────────────
 * Le module partagé sait déjà tourner un polyèdre, le projeter en cavalière
 * ou en vue orthogonale, et CALCULER ses arêtes cachées. Il est importé tel
 * quel, jamais recopié.
 *
 * Il lui manque exactement ce que le programme de 5e exige en propre :
 *
 *   1. LE CYLINDRE. Ce n'est pas un polyèdre : lui inventer des sommets et
 *      des arêtes mentirait sur sa nature. Il est donc décrit par ses
 *      GRANDEURS (rayon, hauteur), et sa perspective se dessine à partir
 *      d'elles — pas à partir d'un maillage.
 *
 *   2. LES PATRONS DU PRISME ET DU CYLINDRE. Le patron du cube (6e) se
 *      vérifie en roulant un dé sur un quadrillage ; celui d'un prisme ou
 *      d'un cylindre ne s'y ramène pas. Un patron est ici jugé par une
 *      CONDITION MATHÉMATIQUE (les deux bases sont présentes et opposées ;
 *      la bande a pour longueur le périmètre de la base), si bien qu'un
 *      patron correct inventé par l'élève est accepté, et qu'un patron faux
 *      est refusé pour une raison exacte.
 *
 * ─── LE PÉRIMÈTRE EST EXÉCUTABLE ──────────────────────────────────────
 * Le référentiel 2026 exclut la sphère de la 5e, et place le VOLUME (ainsi
 * que la pyramide et le cône) en 4e. `solide()` et `volume()` lèvent donc une
 * exception : l'exclusion est du code, pas un commentaire qu'on peut
 * contourner sans s'en apercevoir.
 */

/* ── Périmètre (exécutable) ─────────────────────────────────────────── */

/** Solides hors programme de 5e, avec la raison — jamais un simple refus. */
const HORS_PERIMETRE = {
  sphere: 'la sphère est explicitement exclue du programme de 5e',
  boule: 'la boule est explicitement exclue du programme de 5e',
  pyramide: 'la pyramide est un objet de 4e',
  cone: 'le cône est un objet de 4e',
};

/**
 * Construit un solide de la leçon, en refusant ceux qui n'en sont pas.
 *
 * `spec` : { type: 'prisme' | 'cylindre' | 'pave' | 'cube', ... }
 */
export function solide(spec) {
  const type = typeof spec === 'string' ? spec : spec?.type;
  if (HORS_PERIMETRE[type]) {
    throw new Error(`representations-espace-5e : hors périmètre — ${HORS_PERIMETRE[type]}.`);
  }
  if (type === 'cylindre') return cylindre(spec);
  if (type === 'prisme') return prismeDroit(spec);
  throw new Error(`representations-espace-5e : solide inconnu « ${type} ».`);
}

/**
 * Le volume n'est PAS au programme de 5e (référentiel 2026 : il apparaît en
 * 4e, avec la pyramide et le cône). Toute tentative de le calculer ici est
 * une dérive de périmètre, et elle échoue bruyamment.
 */
export function volume() {
  throw new Error(
    'representations-espace-5e : hors périmètre — le volume des solides est un objet de 4e, pas de 5e.',
  );
}

/* ── Le cylindre de révolution ──────────────────────────────────────── */

/**
 * Un cylindre, décrit par ses grandeurs et non par des sommets.
 *
 * `faces: 3` / `aretes: 2` / `sommets: 0` sont les comptes du collège
 * (deux disques et une surface courbe), cohérents avec la fiche de 6e.
 */
export function cylindre({ rayon, hauteur, nom = 'cylindre' } = {}) {
  if (!(rayon > 0) || !(hauteur > 0)) {
    throw new Error('cylindre : rayon et hauteur doivent être strictement positifs.');
  }
  return {
    type: 'cylindre', id: 'cylindre', nom, emoji: '🥫',
    rayon, hauteur,
    polyedre: false,
    faces: 3, aretes: 2, sommets: 0,
    natureFaces: '2 disques et une surface courbe',
  };
}

/** Le diamètre de la base. */
export function diametre(cyl) {
  return 2 * cyl.rayon;
}

/**
 * Le périmètre du disque de base — la grandeur CENTRALE de la leçon.
 *
 * C'est elle, et non le diamètre, qui donne la longueur de la bande : c'est
 * exactement le piège que le module 5 rend visible.
 */
export function perimetreBase(cyl) {
  return 2 * Math.PI * cyl.rayon;
}

/**
 * La surface latérale, dépliée : un RECTANGLE.
 *
 * Sa hauteur est celle du cylindre ; sa longueur est le périmètre du disque,
 * parce que la bande doit faire exactement le tour de la base.
 */
export function bandeDuCylindre(cyl) {
  return { longueur: perimetreBase(cyl), hauteur: cyl.hauteur };
}

/**
 * La bande proposée se referme-t-elle exactement autour de la base ?
 *
 * Renvoie un verdict MOTIVÉ : la leçon doit pouvoir dire « il reste un jour »
 * ou « la bande chevauche », jamais « faux ».
 *
 * `tol` est exprimée dans l'unité des longueurs — la tolérance de validation
 * doit rester plus fine que ce que l'élève distingue à l'écran.
 */
export function verifierBande(longueur, cyl, tol = 0.05) {
  const attendu = perimetreBase(cyl);
  const ecart = longueur - attendu;
  if (Math.abs(ecart) <= tol) return { ok: true, raison: null, ecart: 0, attendu };
  return {
    ok: false,
    raison: ecart < 0 ? 'trop-courte' : 'trop-longue',
    ecart,
    attendu,
  };
}

/** Vrai si la bande proposée est celle du cylindre (raccourci de lecture). */
export function patronCylindreOk(longueur, cyl, tol = 0.05) {
  return verifierBande(longueur, cyl, tol).ok;
}

/* ── Le prisme droit ────────────────────────────────────────────────── */

/**
 * Un prisme droit : deux bases polygonales identiques, reliées par des
 * rectangles. `base` est un tableau de longueurs de côtés (la nature du
 * polygone tient dans ce tableau : 3 côtés = triangulaire, etc.).
 */
export function prismeDroit({ base, hauteur, nom = 'prisme droit' } = {}) {
  if (!Array.isArray(base) || base.length < 3) {
    throw new Error('prismeDroit : la base doit être un polygone d’au moins 3 côtés.');
  }
  if (!(hauteur > 0)) throw new Error('prismeDroit : la hauteur doit être strictement positive.');
  const n = base.length;
  return {
    type: 'prisme', id: 'prisme', nom, emoji: '⛺',
    base, hauteur,
    polyedre: true,
    faces: n + 2,
    aretes: 3 * n,
    sommets: 2 * n,
    natureFaces: `2 polygones à ${n} côtés et ${n} rectangles`,
  };
}

/** Le périmètre de la base d'un prisme — longueur de sa bande dépliée. */
export function perimetrePrisme(pr) {
  return pr.base.reduce((s, c) => s + c, 0);
}

/**
 * Les faces d'un prisme droit, dépliées : 2 bases + n rectangles.
 * Chaque rectangle a pour largeur un côté de la base et pour hauteur celle
 * du prisme — c'est ce qui fait de la bande un rectangle unique de longueur
 * égale au périmètre.
 */
export function facesDuPrisme(pr) {
  const bases = [
    { role: 'base', id: 'base-1' },
    { role: 'base', id: 'base-2' },
  ];
  const flancs = pr.base.map((cote, i) => ({
    role: 'flanc', id: `flanc-${i + 1}`, largeur: cote, hauteur: pr.hauteur,
  }));
  return [...bases, ...flancs];
}

/**
 * Le patron proposé se replie-t-il en ce prisme ?
 *
 * `pieces` : [{ role: 'base' | 'flanc', cote?: 'haut' | 'bas' }]
 *
 * Trois conditions, vérifiées séparément pour que le refus soit motivé :
 *   — il faut exactement deux bases ;
 *   — il faut autant de flancs que la base a de côtés ;
 *   — les deux bases doivent être de part et d'autre de la bande. Deux bases
 *     du même côté se superposeraient au pliage : c'est l'erreur classique,
 *     et elle doit être nommée comme telle.
 */
export function verifierPatronPrisme(pieces, pr) {
  const bases = pieces.filter((p) => p.role === 'base');
  const flancs = pieces.filter((p) => p.role === 'flanc');
  const n = pr.base.length;

  if (bases.length < 2) return { ok: false, raison: 'base-manquante' };
  if (bases.length > 2) return { ok: false, raison: 'trop-de-bases' };
  if (flancs.length < n) return { ok: false, raison: 'flanc-manquant' };
  if (flancs.length > n) return { ok: false, raison: 'trop-de-flancs' };
  if (bases[0].cote && bases[0].cote === bases[1].cote) {
    return { ok: false, raison: 'bases-du-meme-cote' };
  }
  return { ok: true, raison: null };
}

/** Explication française du refus — jamais un « faux » sec. */
export function raisonPatron(raison) {
  return {
    'base-manquante': 'Il manque une base : un prisme en a deux, une à chaque extrémité.',
    'trop-de-bases': 'Il y a trop de bases : un prisme n’en a que deux.',
    'flanc-manquant': 'Il manque un rectangle : il en faut un par côté de la base.',
    'trop-de-flancs': 'Il y a trop de rectangles : il en faut exactement un par côté de la base.',
    'bases-du-meme-cote': 'Les deux bases sont du même côté de la bande : au pliage, elles se rabattraient au même endroit. Il en faut une de chaque côté.',
    'trop-courte': 'La bande est trop courte : elle ne fait pas tout le tour, il reste un jour.',
    'trop-longue': 'La bande est trop longue : elle se chevauche en se refermant.',
  }[raison] ?? '';
}

/* ── Données de la leçon : l'atelier d'emballage ────────────────────── */

/** La boîte de chocolats : un prisme droit à base triangulaire. */
export const BOITE_CHOCOLATS = prismeDroit({
  base: [6, 6, 6], hauteur: 12, nom: 'boîte de chocolats',
});

/** La boîte de thé : un cylindre. */
export const BOITE_THE = cylindre({ rayon: 4, hauteur: 11, nom: 'boîte de thé' });

/** Les solides au programme de la leçon — jamais de sphère ni de pyramide. */
export const SOLIDES_5E = [BOITE_CHOCOLATS, BOITE_THE];

/** Arrondi d'affichage, en écriture française. */
export function fmtLong(v, dp = 1) {
  const r = Number(v.toFixed(dp));
  return String(r).replace('.', ',');
}
