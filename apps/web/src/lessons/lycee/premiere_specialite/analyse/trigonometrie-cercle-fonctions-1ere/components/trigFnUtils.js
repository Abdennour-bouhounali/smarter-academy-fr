/**
 * Le modèle mathématique de « Fonctions trigonométriques : du cercle à la courbe ».
 *
 * Tout ce que les modules affichent en est DÉRIVÉ : aucune coordonnée, aucune
 * borne de variation, aucun intervalle n'est écrit à la main dans un module.
 * Le noyau partagé (common/analysis/trig.js) porte les mathématiques ; ce
 * fichier porte les décisions PROPRES à cette leçon — la plage du cliquet, la
 * géométrie des deux cadres, et les cibles pédagogiques.
 */
import {
  TAU, PAS, REMARQUABLES, principal, remarquableDe, sinExact, cosExact,
  variationsSin, variationsCos, echantillonner, labelPi, texPi, fr,
} from '../../../../../common/analysis/trig';

export { TAU, PAS, REMARQUABLES, principal, remarquableDe, sinExact, cosExact, variationsSin, variationsCos, echantillonner, labelPi, texPi, fr };

/**
 * LA PLAGE DU CLIQUET — de −2π à +4π, soit trois tours.
 *
 * Elle DOIT permettre deux gestes que la manipulation signature exige :
 *   · dépasser 2π, pour que la trace REPASSE sur elle-même (périodicité) ;
 *   · aller en négatif, pour voir la trace MIROIR du sinus (imparité) et la
 *     MÊME trace pour le cosinus (parité).
 * Ces bornes sont des multiples entiers du pas : elles sont donc atteignables
 * exactement, et la figure les couvre exactement (test).
 */
export const CRAN_MIN = -24;   // −2π
export const CRAN_MAX = 48;    // +4π
export const T_MIN = CRAN_MIN * PAS;
export const T_MAX = CRAN_MAX * PAS;

/** Le réel associé à un cran, EXACT aux points remarquables par construction. */
export const tDuCran = (n) => n * PAS;

/** Le cran d'un réel, quand c'en est un. */
export const cranDe = (t) => Math.round(t / PAS);

/** Borne un cran à la plage, sans jamais sortir du cadre. */
export const bornerCran = (n) => Math.max(CRAN_MIN, Math.min(CRAN_MAX, n));

/**
 * Les deux fonctions étudiées. `exact` est la fonction qui JUGE et qui
 * AFFICHE : elle rend 0,5 en π/6, jamais 0,49999999999999994.
 */
export const SIN = {
  id: 'sin',
  nom: 'sinus',
  ecriture: 'sin',
  exact: sinExact,
  /** Le sinus est l'ORDONNÉE du point : c'est ce qu'on reporte sur la courbe. */
  coordonnee: 'ordonnée',
  variations: variationsSin,
  /** Impaire : la trace des arcs négatifs est le MIROIR de celle des positifs. */
  parite: 'impaire',
  tone: '#059669',
};

export const COS = {
  id: 'cos',
  nom: 'cosinus',
  ecriture: 'cos',
  exact: cosExact,
  coordonnee: 'abscisse',
  variations: variationsCos,
  /** Paire : la trace des arcs négatifs se SUPERPOSE à celle des positifs. */
  parite: 'paire',
  tone: '#4f46e5',
};

export const FONCTIONS = [SIN, COS];

/**
 * La TRACE déroulée : la suite des points (t ; f(t)) pour les crans
 * effectivement PARCOURUS par l'élève, en ordre de cran.
 *
 * C'est le cœur de la manipulation signature : la courbe n'est pas affichée
 * d'avance, elle NAÎT du geste. On garde donc l'ensemble des crans visités, et
 * la trace en est dérivée — pas l'inverse.
 *
 * `crans` est un tableau d'entiers (dans n'importe quel ordre de visite).
 */
export function trace(fn, crans) {
  return [...new Set(crans)]
    .sort((a, b) => a - b)
    .map((n) => ({ x: tDuCran(n), y: fn.exact(tDuCran(n)), cran: n }));
}

/**
 * Les SEGMENTS de la trace : deux crans consécutifs ne se relient que s'ils
 * sont VOISINS. Un élève qui saute d'un bout à l'autre ne doit pas voir une
 * corde traverser le cadre — ce serait une courbe qui ment.
 */
export function segmentsTrace(fn, crans) {
  const pts = trace(fn, crans);
  const out = [];
  let courant = [];
  for (let i = 0; i < pts.length; i += 1) {
    if (i > 0 && pts[i].cran !== pts[i - 1].cran + 1) {
      if (courant.length > 1) out.push(courant);
      courant = [];
    }
    courant.push(pts[i]);
  }
  if (courant.length > 1) out.push(courant);
  return out;
}

/**
 * Le cran « jumeau » d'un cran donné : celui d'un tour plus loin. C'est LUI
 * que la trace repasse à l'identique — la périodicité, constatée.
 */
export const jumeau = (n) => n + 24;

/**
 * L'élève a-t-il assez tourné pour VOIR la trace repasser sur elle-même ?
 * Condition : au moins six crans du deuxième tour (au-delà de 2π) visités.
 * Six et non un : un seul point ne fait pas une trace superposée.
 */
export const aRefaitUnTour = (crans) => crans.filter((n) => n > 24).length >= 6;

/** A-t-il enroulé dans l'autre sens assez loin pour voir la trace miroir ? */
export const aTourneEnNegatif = (crans) => crans.filter((n) => n < 0).length >= 6;

/**
 * ─── GÉOMÉTRIE DES DEUX CADRES ─────────────────────────────────────────────
 * À gauche le cercle, à droite l'axe déroulé. Les deux partagent la MÊME
 * échelle verticale, pour que le report de l'ordonnée soit un trait
 * HORIZONTAL — c'est ce qui rend le déroulement lisible.
 */
export const R = 78;                 // rayon du cercle, en px
export const CX = 96;                // centre du cercle dans son cadre
export const CY = 96;
export const H_CADRE = 192;          // hauteur commune des deux cadres

/** Largeur du cadre déroulé : la plage entière tient dedans, avec ses marges. */
export const MARGE_G = 26;
export const MARGE_D = 14;
/** Pixels par radian sur l'axe déroulé, en affichage LARGE. */
export const PX_RAD = 26;
export const L_DEROULE = MARGE_G + MARGE_D + (T_MAX - T_MIN) * PX_RAD;

/** t ↦ x en pixels dans le cadre déroulé. */
export const xDeT = (t) => MARGE_G + (t - T_MIN) * PX_RAD;
/** y ↦ pixels, commun aux deux cadres (1 unité = R pixels). */
export const yDeVal = (v) => CY - v * R;

/**
 * ─── LA FENÊTRE DU DÉROULÉ, MESURÉE ────────────────────────────────────────
 *
 * DÉFAUT ATTRAPÉ AU NAVIGATEUR (domOverflow à 375 px). L'axe déroulé faisait
 * 530 px — trois tours à 26 px par radian — dans un <main> de 375 : il en
 * sortait de 155 px.
 *
 * Le faire simplement DÉFILER ne suffit pas, et c'est le point important :
 * l'audit de débordement mesure la boîte de CHAQUE descendant, et un enfant
 * poussé hors de la zone visible garde une boîte qui dépasse. Comprimer le
 * dessin ne convient pas non plus — l'échelle mentirait, et à 10 px par radian
 * les étiquettes « 2π », « 3π » se toucheraient.
 *
 * La seule parade honnête est donc de RÉDUIRE LA FENÊTRE affichée quand la
 * place manque : on montre moins de tours, à une échelle qui reste lisible.
 * `fenetreDerouleur(largeurDispo)` choisit, parmi des fenêtres candidates
 * classées de la plus riche à la plus étroite, la PREMIÈRE qui tient dans la
 * largeur mesurée ET qui garde les étiquettes séparées.
 *
 * CE QUI N'EST JAMAIS SACRIFIÉ : toute fenêtre candidate va au-delà de 2π ET
 * en dessous de 0 — sans quoi la périodicité et la parité, qui SONT le sujet
 * de la leçon, deviendraient inobservables sur un téléphone. Le test le
 * vérifie pour chaque candidate.
 */
const LARGEUR_ETIQ_MAX = 7 * 6;    // « −11π/2 », mesuré caractère par caractère

/** Les fenêtres candidates, de la plus riche à la plus étroite. */
export const FENETRES = [
  { cranMin: -24, cranMax: 48, px: 26 },   // trois tours, l'affichage de bureau
  { cranMin: -24, cranMax: 48, px: 20 },
  { cranMin: -24, cranMax: 36, px: 20 },   // de −2π à 3π
  { cranMin: -24, cranMax: 36, px: 16 },
  { cranMin: -12, cranMax: 30, px: 16 },   // de −π à 5π/2
];

/** La géométrie complète d'une fenêtre : bornes, échelle, largeur, conversions. */
export function geometrieFenetre(f) {
  const tMin = f.cranMin * PAS;
  const tMax = f.cranMax * PAS;
  const largeur = MARGE_G + MARGE_D + (tMax - tMin) * f.px;
  const xDe = (t) => MARGE_G + (t - tMin) * f.px;
  const graduations = [];
  const demi = Math.PI / 2;
  for (let k = Math.ceil(tMin / demi - 1e-9); k <= Math.floor(tMax / demi + 1e-9); k += 1) {
    const t = k * demi;
    const etiquetee = k % 2 === 0;
    graduations.push({ t, label: etiquetee ? labelPi(t) : null, x: xDe(t), majeure: etiquetee });
  }
  return { ...f, tMin, tMax, largeur, xDe, graduations, ecartEtiquettes: Math.PI * f.px };
}

/**
 * La fenêtre à afficher pour une largeur DISPONIBLE mesurée, en pixels.
 * On rend la première candidate qui tient et dont les étiquettes ne se
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
 * Le pas des graduations ÉTIQUETÉES de l'axe déroulé : π.
 *
 * DÉFAUT ATTRAPÉ PAR LE TEST, pas par l'œil. Un pas de π/2 semblait le choix
 * naturel — mais à 26 px par radian il place les étiquettes à 40,8 px les unes
 * des autres, alors que « −11π/2 » en mesure 42 : elles se CHEVAUCHENT. Le
 * test de mise en page (« sans collision ») l'a refusé.
 * Le pas de π donne 81,7 px d'écart pour 7 étiquettes sur trois tours : lisible
 * partout, et les bornes pédagogiques (0, π, 2π) en font toutes partie.
 * Les demi-tours restent marqués par un TRAIT court, sans étiquette : la
 * lecture fine ne perd rien, et rien ne se superpose.
 */
export const PAS_GRAD = Math.PI;

/**
 * Les graduations de l'axe déroulé. `label` n'est porté que par les
 * graduations étiquetées ; les intermédiaires (multiples de π/2) sont des
 * traits muets, et leur `label` vaut null — un composant ne peut donc pas
 * dessiner par erreur une étiquette qui déborderait.
 */
export const GRADUATIONS = (() => {
  const out = [];
  const demi = PAS_GRAD / 2;
  for (let k = Math.ceil(T_MIN / demi - 1e-9); k <= Math.floor(T_MAX / demi + 1e-9); k += 1) {
    const t = k * demi;
    const etiquetee = k % 2 === 0;
    out.push({ t, label: etiquetee ? labelPi(t) : null, x: xDeT(t), majeure: etiquetee });
  }
  return out;
})();

/** Les seules graduations qui portent du texte — celles que l'on mesure. */
export const GRADUATIONS_ETIQUETEES = GRADUATIONS.filter((g) => g.label !== null);

/**
 * ─── LES CIBLES PÉDAGOGIQUES ───────────────────────────────────────────────
 * Chaque valeur qu'un module demande à l'élève d'ATTEINDRE au cliquet, avec le
 * nombre de crans depuis 0. Le test vérifie qu'elles tombent toutes sur un
 * cran ET dans la plage : une consigne ne peut donc pas être infaisable.
 */
export const CIBLES = [
  { id: 'pi-6', cran: 2, label: 'π/6' },
  { id: 'pi-4', cran: 3, label: 'π/4' },
  { id: 'pi-3', cran: 4, label: 'π/3' },
  { id: 'pi-2', cran: 6, label: 'π/2' },
  { id: 'pi', cran: 12, label: 'π' },
  { id: '3pi-2', cran: 18, label: '3π/2' },
  { id: 'deux-pi', cran: 24, label: '2π' },
  { id: 'deux-pi-plus-pi-6', cran: 26, label: '2π + π/6' },
  { id: 'moins-pi-6', cran: -2, label: '−π/6' },
  { id: 'moins-pi-2', cran: -6, label: '−π/2' },
];

/**
 * ─── LE TABLEAU DE VARIATIONS SUR [0 ; 2π] ─────────────────────────────────
 * Dérivé de `variationsSin` / `variationsCos`, jamais recopié. Chaque morceau
 * porte ses deux bornes ÉCRITES (labelPi) et ses deux valeurs EXACTES.
 */
export function tableauVariations(fn, a = 0, b = TAU) {
  return fn.variations(a, b).map((s) => ({
    ...s,
    deLabel: labelPi(s.from),
    aLabel: labelPi(s.to),
    deVal: fn.exact(s.from),
    aVal: fn.exact(s.to),
  }));
}

/**
 * Les EXTREMUMS de fn sur [0 ; 2π] : les réels où la valeur vaut 1 ou −1.
 * Dérivés du tableau de variations, pas d'une liste écrite à la main.
 */
export function extremums(fn) {
  const bornes = new Set([0]);
  for (const s of fn.variations(0, TAU)) { bornes.add(s.from); bornes.add(s.to); }
  const out = [];
  for (const t of [...bornes].sort((x, y) => x - y)) {
    const v = fn.exact(t);
    if (Math.abs(Math.abs(v) - 1) < 1e-12) out.push({ t, label: labelPi(t), valeur: v, type: v > 0 ? 'maximum' : 'minimum' });
  }
  return out;
}

/**
 * ─── LE LABORATOIRE DE LECTURE GRAPHIQUE (module 6) ────────────────────────
 * Des courbes x ↦ A·sin(x / k) : l'élève lit l'écart maximal à l'axe et la
 * longueur du motif qui se répète. Les deux réglages sont des CLIQUETS, et
 * chaque cible tombe sur un cran (test).
 *
 * On reste sur des multiples entiers de π pour la longueur du motif : lisible
 * sur un axe gradué en π/2, et exactement atteignable.
 */
export const ECARTS = [0.5, 1, 1.5, 2, 2.5, 3];
export const MOTIFS = [Math.PI, TAU, 3 * Math.PI, 4 * Math.PI];
export const MOTIFS_LABELS = ['π', '2π', '3π', '4π'];

/** La fonction lue : écart maximal `A`, motif de longueur `P`. */
export const onde = (A, P) => (x) => A * sinExact((TAU * x) / P);

/**
 * Les trois courbes que le module 6 fait lire. Chacune déclare ce que l'élève
 * doit trouver, et les distracteurs plausibles — tous vérifiés DISTINCTS par
 * le test.
 */
export const LECTURES = [
  { id: 'L1', A: 2, P: TAU, pLabel: '2π', piege: 'demi' },
  { id: 'L2', A: 1.5, P: 4 * Math.PI, pLabel: '4π', piege: 'demi' },
  { id: 'L3', A: 3, P: Math.PI, pLabel: 'π', piege: 'double' },
];

/**
 * L'écart maximal à l'axe, MESURÉ sur la courbe échantillonnée — pas lu dans
 * le paramètre A. C'est ce contrôle croisé qui attraperait une courbe dont
 * l'étiquette et le tracé se contrediraient.
 *
 * DÉFAUT ATTRAPÉ PAR LE TEST. Avec un nombre de points FIXE sur une fenêtre
 * large, le sommet d'une onde de motif court tombait ENTRE deux échantillons :
 * la mesure rendait 2,9998 pour une onde d'écart 3, et le contrôle croisé
 * déclarait faux ce qui était juste. Le pas est donc lié à la LARGEUR de la
 * fenêtre : `n` points par unité, jamais `n` points en tout.
 */
export function ecartMesure(f, a, b, parUnite = 400) {
  const n = Math.max(2000, Math.ceil((b - a) * parUnite));
  let m = 0;
  for (let i = 0; i <= n; i += 1) m = Math.max(m, Math.abs(f(a + ((b - a) * i) / n)));
  return m;
}

/**
 * La longueur du motif, MESURÉE : le plus petit multiple du pas d'essai pour
 * lequel la courbe se superpose à elle-même sur tout l'intervalle.
 */
export function motifMesure(f, essais, a = -6, b = 6, eps = 1e-9) {
  for (const p of essais) {
    let ok = true;
    for (let x = a; x <= b; x += 0.05) {
      if (Math.abs(f(x + p) - f(x)) > eps) { ok = false; break; }
    }
    if (ok) return p;
  }
  return null;
}

/**
 * ─── SÉCURITÉ DE MISE EN PAGE ──────────────────────────────────────────────
 * Tout point de la trace doit tenir dans son cadre, à toute position du
 * cliquet. Ce n'est pas une constatation : c'est une fonction, balayée par le
 * test sur TOUTE la plage (règle §17bis).
 */
export function dansLeCadre(n) {
  const t = tDuCran(n);
  const x = xDeT(t);
  const ySin = yDeVal(sinExact(t));
  const yCos = yDeVal(cosExact(t));
  return (
    x >= 0 && x <= L_DEROULE &&
    ySin >= 0 && ySin <= H_CADRE &&
    yCos >= 0 && yCos <= H_CADRE
  );
}

/**
 * `parseSigned` — parseDec refuse le vrai signe moins U+2212, que les leçons
 * AFFICHENT et que l'élève RECOPIE. On normalise −, – et — avant de déléguer.
 * (Piège payé par trois agents du lot 1 ; il n'est pas repayé ici.)
 */
export function parseSigned(parseDec) {
  return (s) => parseDec(String(s).replace(/[−–—]/g, '-'));
}

/**
 * ─── LE GLISSER : ENROULER EST UN GESTE ────────────────────────────────────
 *
 * L'élève ATTRAPE le point et le fait tourner autour du cercle. Deux problèmes
 * que le pointeur pose, et que ces deux fonctions résolvent :
 *
 * 1. UN DOIGT NE VISE PAS AU PIXEL. `Math.atan2` rend un angle quelconque ;
 *    laissé tel quel, il ferait afficher 0,4999 au lieu de 0,5 en π/6, et
 *    toute la garantie d'exactitude de la leçon tomberait. L'angle est donc
 *    AIMANTÉ sur le cran le plus proche — c'est l'aimantation, et non
 *    l'adresse de l'élève, qui garantit que les valeurs remarquables sont
 *    atteintes EXACTEMENT.
 *
 * 2. UN TOUR N'EST PAS UNE REMISE À ZÉRO. `atan2` ne connaît qu'un tour : en
 *    franchissant la couture (le point (1 ; 0)), il saute de 2π à 0. Un élève
 *    qui continue de tourner reviendrait donc au début, et la périodicité —
 *    tout le sujet de la leçon — deviendrait INOBSERVABLE au glisser.
 *    `cranDepuisPointeur` prend donc le cran COURANT en argument et choisit,
 *    parmi tous les crans congrus modulo un tour, celui qui est le PLUS PROCHE
 *    du cran courant : franchir la couture vers l'avant ajoute un tour, la
 *    franchir en arrière en retranche un. L'enroulement est ainsi CONTINU, et
 *    l'élève peut dépasser 2π comme descendre sous 0 d'un seul geste.
 */

/** L'angle principal, en crans (0 à 23), du vecteur (dx ; dy) — y vers le HAUT. */
export function cranPrincipalDe(dx, dy) {
  const a = Math.atan2(dy, dx);
  const p = a < 0 ? a + TAU : a;
  return Math.round(p / PAS) % 24;
}

/**
 * Le cran visé par le pointeur, en enroulement CONTINU depuis `cranCourant`.
 *
 * @param dx, dy   position du pointeur RELATIVE au centre, y vers le haut
 * @param cranCourant  le cran d'où l'on vient — c'est lui qui porte les tours
 * @returns un cran entier, borné à la plage, jamais un saut de plus d'un
 *          demi-tour : un mouvement continu du doigt reste continu à l'écran.
 */
export function cranDepuisPointeur(dx, dy, cranCourant) {
  const k = cranPrincipalDe(dx, dy);
  // Le représentant de k le plus proche du cran courant : on ne peut jamais
  // sauter de plus de 12 crans (un demi-tour), donc jamais « traverser » le
  // cercle d'un coup.
  const tours = Math.round((cranCourant - k) / 24);
  return bornerCran(k + 24 * tours);
}

/**
 * ─── LE GLISSER DU SOMMET (module 6) ───────────────────────────────────────
 *
 * Sur le laboratoire de lecture, l'élève ATTRAPE le sommet de sa vague. Le
 * geste est naturellement à deux dimensions, et c'est exactement ce que la
 * leçon veut faire sentir : la HAUTEUR du sommet est l'écart maximal, sa
 * POSITION horizontale commande la longueur du motif (le sommet d'une onde
 * x ↦ A·sin(2πx/P) est au quart du motif, donc en P/4).
 *
 * Les deux réglages restent AIMANTÉS sur les crans autorisés — sinon la
 * courbe de l'élève ne pourrait jamais coïncider exactement avec la cible, et
 * la consigne serait infaisable.
 */

/** Le cran de la liste `crans` le plus proche de la valeur v. */
export function aimanter(v, crans) {
  let best = crans[0];
  for (const c of crans) if (Math.abs(c - v) < Math.abs(best - v)) best = c;
  return best;
}

/** La position horizontale du sommet d'une onde de motif P : le quart du motif. */
export const sommetDe = (P) => P / 4;

/**
 * Le réglage (A ; P) visé par un pointeur lâché en (x ; y), aimanté sur les
 * crans autorisés. `y` est l'ordonnée mathématique, `x` l'abscisse.
 */
export function reglageDepuisSommet(x, y, ecarts = ECARTS, motifs = MOTIFS) {
  const A = aimanter(Math.abs(y), ecarts);
  // x ≈ P/4, donc P ≈ 4x. On aimante sur les motifs autorisés.
  const P = aimanter(Math.max(0, 4 * x), motifs);
  return { A, P };
}
