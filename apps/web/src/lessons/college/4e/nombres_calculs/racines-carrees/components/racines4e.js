/**
 * Noyau numérique de la leçon « Racine carrée » (4e).
 *
 * Tout ce qui est vrai mathématiquement vit ici ; les modules affichent, ce
 * fichier calcule.
 *
 * CE QUE LA 4e FAIT, ET CE QU'ELLE NE FAIT PAS. La racine carrée est
 * INTRODUITE en 4e (chaîne verticale 4e → 3e) : on construit son SENS —
 * l'opération inverse du carré, le côté d'un carré d'aire donnée —, on
 * reconnaît les carrés parfaits, on calcule des racines exactes et on encadre
 * les autres entre deux entiers.
 *
 * PÉRIMÈTRE — refusé par construction (`CURRICULUM_MATRIX_5E_4E.md`) :
 *   — les OPÉRATIONS sur les racines, √(ab) = √a × √b et le quotient (3e) :
 *     aucune fonction ne les produit ;
 *   — la SIMPLIFICATION a√b, par exemple √12 = 2√3 (3e) : idem ;
 *   — la racine carrée d'un nombre négatif (exclusion officielle du niveau) :
 *     `racine` LÈVE plutôt que de renvoyer NaN.
 *
 * FRONTIÈRE AVEC LA 3e. La leçon `racines-carrees-3e` reprend cette notion
 * pour y ajouter exactement ce que celle-ci s'interdit. Les deux ne peuvent
 * donc pas partager de noyau : ce fichier est la version RESTREINTE, et sa
 * restriction est testée.
 */

/* ── Carré et racine ───────────────────────────────────────────────────── */

/** Le carré d'un nombre — l'opération que la racine va défaire. */
export const carre = (n) => n * n;

/**
 * La racine carrée d'un nombre POSITIF ou nul.
 *
 * Lève sur un négatif : au niveau 4e, « aucun nombre multiplié par lui-même
 * ne donne un nombre négatif » est un fait à établir, pas une erreur de
 * calcul à masquer par un NaN qu'un module afficherait sans le voir.
 */
export const racine = (n) => {
  if (n < 0) throw new Error(`racine d'un nombre négatif (hors périmètre 4e) : ${n}`);
  return Math.sqrt(n);
};

/** La racine entière : le plus grand entier dont le carré ne dépasse pas n. */
export const racineEntiere = (n) => {
  if (n < 0) throw new Error(`racine d'un nombre négatif : ${n}`);
  return Math.floor(Math.sqrt(n) + 1e-9);
};

/* ── Carrés parfaits ───────────────────────────────────────────────────── */

/** n est-il le carré d'un entier ? */
export const estCarreParfait = (n) => {
  if (n < 0 || !Number.isInteger(n)) return false;
  const r = racineEntiere(n);
  return r * r === n;
};

/** Les carrés parfaits jusqu'à `max` inclus, avec leur racine. */
export const carresParfaits = (max = 144) => {
  const out = [];
  for (let k = 0; k * k <= max; k += 1) out.push({ racine: k, carre: k * k });
  return out;
};

/* ── Encadrement — le cœur du niveau ───────────────────────────────────── */

/**
 * L'encadrement de √n entre deux entiers CONSÉCUTIFS : `{bas, haut}` tels que
 * bas² ≤ n < haut², avec haut = bas + 1.
 *
 * Quand n est un carré parfait, la racine tombe pile : on renvoie alors
 * `exact: true` et bas = haut = √n, plutôt qu'un encadrement trompeur.
 */
export const encadrement = (n) => {
  if (n < 0) throw new Error(`encadrement d'un négatif : ${n}`);
  const bas = racineEntiere(n);
  if (bas * bas === n) return { bas, haut: bas, exact: true };
  return { bas, haut: bas + 1, exact: false };
};

/**
 * Une valeur proposée est-elle un encadrement CORRECT de √n ?
 * Sert au retour ciblé : on distingue « trop large » de « faux ».
 */
export const verifierEncadrement = (n, bas, haut) => {
  if (!Number.isInteger(bas) || !Number.isInteger(haut)) return 'non-entier';
  if (bas * bas > n || haut * haut < n) return 'faux';
  if (haut - bas !== 1) return 'trop-large';
  const attendu = encadrement(n);
  return bas === attendu.bas && haut === attendu.haut ? 'ok' : 'faux';
};

/**
 * De quel entier √n est-il le plus PROCHE ? Sert au module « estimer », qui
 * demande un ordre de grandeur avant un encadrement.
 */
export const entierLePlusProche = (n) => Math.round(racine(n));

/* ── Le lien géométrique : aire ↔ côté ─────────────────────────────────── */

/**
 * Le côté d'un carré d'aire donnée — la définition même de la racine, dans le
 * langage où elle a un sens concret.
 */
export const coteDAire = (aire) => racine(aire);

/**
 * Peut-on ranger `n` carreaux unité en un carré plein ?
 * C'est la question du module 1 : la réponse est « oui exactement quand n est
 * un carré parfait », et l'élève la découvre en essayant.
 */
export const formeUnCarre = (n) => estCarreParfait(n);

/**
 * Le meilleur carré plein qu'on puisse former avec `n` carreaux, et ce qu'il
 * en reste. C'est ce que la manipulation montre : 50 carreaux donnent un
 * carré 7×7 et il en reste 1.
 */
export const meilleurCarre = (n) => {
  const cote = racineEntiere(n);
  return { cote, utilises: cote * cote, reste: n - cote * cote };
};

/* ── x² = a ────────────────────────────────────────────────────────────── */

/**
 * Les solutions de x² = a.
 *   { kind: 'deux', valeurs: [−√a, √a] }  pour a > 0
 *   { kind: 'une', valeurs: [0] }          pour a = 0
 *   { kind: 'aucune' }                     pour a < 0
 *
 * Les DEUX solutions sont renvoyées pour a > 0 : oublier la négative est
 * l'erreur classique, et une leçon ne peut pas la corriger si son propre
 * noyau la commet.
 */
export const resoudreCarreEgal = (a) => {
  if (a < 0) return { kind: 'aucune' };
  if (a === 0) return { kind: 'une', valeurs: [0] };
  const r = racine(a);
  return { kind: 'deux', valeurs: [-r, r] };
};

/* ── Diagnostic des erreurs — nommer l'erreur, pas la constater ────────── */

/** L'erreur reine : confondre racine et moitié (√36 lu « 18 »). */
export const erreurMoitie = (n) => n / 2;

/** L'autre : redonner l'aire au lieu du côté. */
export const erreurRedonneLAire = (n) => n;

export const diagnostiquerRacine = (n, rep) => {
  if (!Number.isFinite(rep)) return 'illisible';
  if (estCarreParfait(n) && rep === racine(n)) return 'ok';
  if (rep === erreurMoitie(n)) return 'a-pris-la-moitie';
  if (rep === n) return 'a-redonne-l-aire';
  if (rep * rep === n) return 'ok';
  if (rep > 0 && carre(rep) > n) return 'trop-grand';
  if (rep > 0 && carre(rep) < n) return 'trop-petit';
  return 'autre';
};

/* ── Garde de périmètre exécutable ─────────────────────────────────────── */

/**
 * Le périmètre du niveau, en code plutôt qu'en commentaire
 * (memory: perimetre_executable_lecon). Les nombres d'une leçon de 4e restent
 * dans la plage des carrés parfaits connus et des encadrements calculables
 * mentalement.
 */
export const DANS_LE_PERIMETRE_4E = (n) =>
  Number.isInteger(n) && n >= 0 && n <= 200;

export const verifierPerimetre = (n, ou = '') => {
  if (!DANS_LE_PERIMETRE_4E(n)) {
    throw new Error(`hors périmètre 4e${ou ? ` (${ou})` : ''} : ${n}`);
  }
  return n;
};
