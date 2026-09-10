/**
 * Le modèle mathématique de « Second degré : signe et problèmes ».
 *
 * Tout ce que les modules affichent en est DÉRIVÉ : aucun signe, aucune bande,
 * aucun ensemble de solutions n'est écrit à la main dans un module sans qu'un
 * test le recalcule. Le noyau partagé (common/analysis/quadratic.js) fournit
 * discriminant / roots / trinomialSign ; ce fichier fixe LES DONNÉES de cette
 * leçon — le pont et ses crans, les inéquations travaillées, les situations
 * concrètes.
 *
 * ─── L'INVARIANT CENTRAL DE LA LEÇON ──────────────────────────────────────
 * Le laboratoire du module 1 confronte DEUX prédicats :
 *   GÉOMÉTRIQUE  la péniche passe si ses deux coins hauts sont sous l'arche ;
 *   ALGÉBRIQUE   la position est dans la bande où le trinôme h(x) − H > 0,
 *                c'est-à-dire ENTRE les racines de ce trinôme.
 * `bandeCoherente()` les compare sur TOUTE la grille (largeur × hauteur ×
 * position), et le test l'exige à 0 écart. Si les deux divergeaient d'un seul
 * cran, la leçon montrerait une bande verte au-dessus d'une péniche coincée.
 */
import {
  discriminant, roots, vertex, trinomialSign, rootCount, evalTrinome,
} from '../../../../../common/analysis/quadratic';
import { formatDec, parseDec } from '@smarter-academy/core';

export { discriminant, roots, vertex, trinomialSign, rootCount, evalTrinome };

/** Format français des nombres de la leçon : virgule, VRAI signe moins. */
export const fr = (n, opts) => formatDec(n, opts).replace('-', '−');

/**
 * Lecture d'une saisie élève SIGNÉE.
 *
 * `parseDec` du noyau n'accepte que le tiret ASCII : la leçon AFFICHE « −2 »
 * avec le vrai signe moins U+2212, et un élève qui recopie ce qu'il voit
 * verrait sa réponse juste refusée. On normalise les trois traits qui traînent
 * dans les copies avant de déléguer. `parseFr` serait doublement faux ici :
 * entier-seulement ET sans signe.
 */
export const parseSigned = (str) =>
  typeof str === 'string' ? parseDec(str.replace(/[−–—]/g, '-')) : parseDec(str);

/* ═══ LE LABORATOIRE SIGNATURE : le pont et la péniche ══════════════════════
 *
 * Une arche parabolique FIXE : h(x) = −0,5x² + 4,5. Elle touche le quai en
 * x = −3 et x = 3 (une ouverture de 9 m) et culmine à 4,5 m au milieu.
 *
 * L'élève règle la LARGEUR L et la HAUTEUR H d'une péniche, puis la DÉPLACE :
 * les deux coins hauts, en (p − L/2 ; H) et (p + L/2 ; H), s'allument en vert
 * s'ils sont sous l'arche, en rouge sinon.
 *
 * CIBLES ATTEIGNABLES (§17) : le pas de H vaut 0,5 et le pas de L vaut 0,5, si
 * bien que les trois hauteurs à racines ENTIÈRES tombent exactement sur un
 * cran depuis le départ :
 *     H = 0   → bande ]−3 ; 3[     (le trinôme −0,5x² + 4,5)
 *     H = 2,5 → bande ]−2 ; 2[     (le trinôme −0,5x² + 2)
 *     H = 4   → bande ]−1 ; 1[     (le trinôme −0,5x² + 0,5)
 * Un test le vérifie plutôt que de le supposer.
 */
export const PONT = {
  /** h(x) = a x² + k, a < 0 : l'arche est tournée vers le bas. */
  a: -0.5,
  k: 4.5,
  /** Les crans de chaque réglage. Discrets — jamais un curseur : les positions
   *  et les hauteurs remarquables doivent être exactement atteignables. */
  hMin: 0, hMax: 4, hStep: 0.5, hStart: 2.5,
  lMin: 1, lMax: 5, lStep: 0.5, lStart: 2,
  pStep: 0.25, pStart: 0,
  /** Le cadre du repère : l'arche entière plus une marge, le quai visible. */
  range: { xMin: -4, xMax: 4, yMin: -0.5, yMax: 5.5 },
  unit: 42,
  unitY: 34,
};

const crans = (min, max, step) => {
  const out = [];
  for (let v = min; v <= max + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
};
export const H_STEPS = crans(PONT.hMin, PONT.hMax, PONT.hStep);
export const L_STEPS = crans(PONT.lMin, PONT.lMax, PONT.lStep);

/**
 * Les crans de POSITION, BORNÉS PAR LA LARGEUR.
 *
 * SÉCURITÉ DE MISE EN PAGE (§16), et non un caprice : le coin le plus éloigné
 * est en |p| + L/2. Avec une position libre jusqu'à ±3,5 et une péniche de
 * 5 m, ce coin sortirait du cadre à −6 — le laboratoire dessinerait une
 * péniche à moitié invisible, et l'élève chercherait un coin rouge hors
 * champ. La plage de position se rétrécit donc quand la péniche s'élargit,
 * exactement comme un chenal borne un bateau : |p| ⩽ xMax − L/2, arrondi au
 * cran inférieur. Un test balaye les 9 largeurs et exige que TOUS les coins
 * tiennent dans le cadre.
 */
export function pMaxDe(L) {
  const brut = PONT.range.xMax - L / 2;
  return Math.floor(brut / PONT.pStep) * PONT.pStep;
}
export function pStepsDe(L) {
  const m = pMaxDe(L);
  return crans(-m, m, PONT.pStep);
}
/** La grille de position la plus large — celle de la péniche la plus étroite. */
export const P_STEPS = pStepsDe(PONT.lMin);

/** La hauteur de l'arche au-dessus du point d'abscisse x. */
export const arche = (x) => PONT.a * x * x + PONT.k;

/**
 * LE PRÉDICAT GÉOMÉTRIQUE — le seul que l'élève VOIT.
 * La péniche passe si ses DEUX coins hauts sont strictement sous l'arche.
 * Un coin posé exactement sur l'arche NE passe pas : la péniche frotte.
 */
export const coinPasse = (x, H) => arche(x) > H;
export function penichePasse(p, L, H) {
  return coinPasse(p - L / 2, H) && coinPasse(p + L / 2, H);
}
/** Les abscisses des deux coins hauts, gauche puis droit. */
export const coinsDe = (p, L) => [p - L / 2, p + L / 2];

/**
 * LE PRÉDICAT ALGÉBRIQUE — celui que la leçon veut faire découvrir.
 * Le trinôme du dégagement : f(x) = h(x) − H = a x² + (k − H). Un coin
 * d'abscisse x passe exactement quand f(x) > 0, c'est-à-dire — puisque a < 0 —
 * ENTRE les racines de f.
 */
export function trinomeDegagement(H) {
  return { a: PONT.a, b: 0, c: PONT.k - H };
}
/**
 * La BANDE des abscisses où le dégagement est strictement positif, décrite par
 * ses deux bornes (exclues). `null` quand le trinôme ne s'annule jamais en
 * restant positif — ici seulement le cas dégénéré H = k, où la bande se réduit
 * au point x = 0 et devient vide.
 */
export function bandeDegagement(H) {
  const t = trinomeDegagement(H);
  const rs = roots(t.a, t.b, t.c);
  if (rs.length < 2) return null;
  return { from: rs[0], to: rs[1] };
}
/** La bande des POSITIONS du centre où la péniche passe : la bande rétrécie de L/2. */
export function bandePositions(L, H) {
  const b = bandeDegagement(H);
  if (!b) return null;
  const from = b.from + L / 2;
  const to = b.to - L / 2;
  return from < to ? { from, to } : null;
}
/** Le prédicat algébrique, tel que la leçon l'énonce. */
export function positionDansLaBande(p, L, H) {
  const b = bandePositions(L, H);
  return b !== null && p > b.from && p < b.to;
}

/**
 * L'INVARIANT : les deux prédicats coïncident sur TOUTE la grille.
 * Rendu comme une LISTE d'écarts pour que le test dise LEQUEL diverge, plutôt
 * qu'un booléen muet. Les positions posées EXACTEMENT sur une borne sont
 * exclues du balayage : les deux prédicats y sont faux, mais par des chemins
 * flottants distincts, et l'égalité stricte y serait un test de la précision
 * machine, pas de la mathématique.
 */
export function bandeCoherente(tol = 1e-9) {
  const ecarts = [];
  for (const L of L_STEPS) {
    for (const H of H_STEPS) {
      const b = bandePositions(L, H);
      for (const p of pStepsDe(L)) {
        if (b && (Math.abs(p - b.from) < tol || Math.abs(p - b.to) < tol)) continue;
        const geo = penichePasse(p, L, H);
        const alg = positionDansLaBande(p, L, H);
        if (geo !== alg) ecarts.push({ L, H, p, geo, alg });
      }
    }
  }
  return ecarts;
}

/** Les positions gagnantes de la grille, pour un réglage donné. */
export const positionsGagnantes = (L, H) => pStepsDe(L).filter((p) => penichePasse(p, L, H));

/**
 * Combien de BLOCS séparés forment les positions gagnantes ? L'aha du module 1
 * est que la réponse vaut toujours 1 ou 0 — jamais un patchwork.
 */
export function nombreDeBlocs(L, H) {
  let blocs = 0;
  let dedans = false;
  for (const p of pStepsDe(L)) {
    const ok = penichePasse(p, L, H);
    if (ok && !dedans) blocs += 1;
    dedans = ok;
  }
  return blocs;
}

/** L'état complet du laboratoire — tout en est dérivé, rien n'est stocké. */
export function labState(p, L, H) {
  const [gauche, droite] = coinsDe(p, L);
  return {
    p, L, H,
    coins: [
      { x: gauche, ok: coinPasse(gauche, H) },
      { x: droite, ok: coinPasse(droite, H) },
    ],
    passe: penichePasse(p, L, H),
    bandeCoins: bandeDegagement(H),
    bande: bandePositions(L, H),
    gagnantes: positionsGagnantes(L, H),
  };
}

/* ═══ ÉCRITURES ════════════════════════════════════════════════════════════ */

/** Écriture française d'un trinôme ax² + bx + c, signes compris. */
export function trinomeText(a, b, c) {
  const terme = (coef, suffixe, premier) => {
    if (coef === 0) return '';
    const signe = coef < 0 ? (premier ? '−' : ' − ') : premier ? '' : ' + ';
    const abs = Math.abs(coef);
    const nombre = abs === 1 && suffixe ? '' : fr(abs);
    return `${signe}${nombre}${suffixe}`;
  };
  return `${terme(a, 'x²', true)}${terme(b, 'x', false)}${terme(c, '', false)}` || '0';
}

/** Écriture d'un intervalle, crochets compris. `null` = borne infinie. */
export function intervalleText({ from, to, openFrom = true, openTo = true }) {
  const lo = from === null ? ']−∞' : `${openFrom ? ']' : '['}${fr(from)}`;
  const hi = to === null ? '+∞[' : `${fr(to)}${openTo ? '[' : ']'}`;
  return `${lo} ; ${hi}`;
}
/** Écriture d'une réunion d'intervalles — ∅ quand il n'y en a aucun. */
export const ensembleText = (list) =>
  list.length === 0 ? '∅' : list.map(intervalleText).join(' ∪ ');

/* ═══ RÉSOUDRE UNE INÉQUATION DU SECOND DEGRÉ (module 4) ═══════════════════
 *
 * On s'appuie sur `trinomialSign` du noyau, qui décrit le signe par
 * intervalles ET pose les racines comme intervalles PONCTUELS de signe 0.
 * C'est ce zéro explicite qui permet de traiter ≤ et ≥ sans cas particulier :
 * une borne est incluse EXACTEMENT quand la relation accepte le signe 0.
 */
const ACCEPTE = {
  '>': [1], '<': [-1], '>=': [1, 0], '<=': [-1, 0],
};
/** Les symboles tels qu'ils s'écrivent au tableau. */
export const REL_TEXT = { '>': '>', '<': '<', '>=': '⩾', '<=': '⩽' };

/**
 * Résout a x² + b x + c ⋈ 0 et rend l'ensemble des solutions comme une liste
 * d'intervalles, du plus petit x au plus grand.
 *
 * `null` en borne signifie l'infini. Une borne finie est INCLUSE quand elle
 * est une racine et que la relation est large — c'est le seul endroit où
 * ⩽ / ⩾ diffèrent de < / >, et c'est ce que le module 4 fait constater.
 */
export function resoudreInequation(a, b, c, rel) {
  const cells = trinomialSign(a, b, c);
  const veut = ACCEPTE[rel];
  if (!veut) throw new Error(`resoudreInequation: relation inconnue « ${rel} »`);
  const out = [];
  for (const cell of cells) {
    if (!veut.includes(cell.sign)) continue;
    // Un intervalle PONCTUEL (une racine, gardée par ⩽ / ⩾).
    if (cell.sign === 0) {
      const last = out[out.length - 1];
      if (last && last.to === cell.from) { last.openTo = false; continue; }
      out.push({ from: cell.from, to: cell.to, openFrom: false, openTo: false, ponctuel: true });
      continue;
    }
    const last = out[out.length - 1];
    // Fusion avec l'intervalle précédent quand la racine qui les sépare est
    // elle-même admise : ]−∞ ; 1] ∪ [1 ; +∞[ s'écrit ℝ, pas deux morceaux.
    if (last && last.to === cell.from && !last.openTo) {
      last.to = cell.to; last.openTo = true; last.ponctuel = false; continue;
    }
    out.push({ from: cell.from, to: cell.to, openFrom: true, openTo: true, ponctuel: false });
  }
  return out;
}

/** L'ensemble des solutions, écrit comme au tableau — ℝ quand tout convient. */
export function solutionsInequationText(a, b, c, rel) {
  const list = resoudreInequation(a, b, c, rel);
  if (list.length === 1 && list[0].from === null && list[0].to === null) return 'ℝ';
  return ensembleText(list);
}

/**
 * Un nombre est-il solution ? C'est la VÉRIFICATION que l'élève doit savoir
 * refaire seul, et c'est elle qui atteste que `resoudreInequation` dit vrai
 * (le test la confronte à l'ensemble rendu, sur toute une grille).
 */
export function verifieInequation(a, b, c, rel, x) {
  const y = evalTrinome(a, b, c, x);
  switch (rel) {
    case '>': return y > 0;
    case '<': return y < 0;
    case '>=': return y >= 0;
    case '<=': return y <= 0;
    default: throw new Error(`verifieInequation: relation inconnue « ${rel} »`);
  }
}
/** Le nombre x appartient-il à l'ensemble rendu par `resoudreInequation` ? */
export function dansEnsemble(list, x, tol = 1e-9) {
  return list.some((I) => {
    const apresA = I.from === null || (I.openFrom ? x > I.from + tol : x >= I.from - tol);
    const avantB = I.to === null || (I.openTo ? x < I.to - tol : x <= I.to + tol);
    return apresA && avantB;
  });
}

/** Les inéquations travaillées au module 4. Coefficients SEULS : tout le reste
 *  est recalculé, y compris dans les énoncés. */
export const INEQUATIONS = {
  /** x² − 5x + 6 > 0, a > 0, racines 2 et 3 : DEUX morceaux, l'extérieur. */
  exterieur: { id: 'ext', a: 1, b: -5, c: 6, rel: '>' },
  /** x² − 5x + 6 ⩽ 0 : le MÊME trinôme, l'intérieur, bornes INCLUSES. */
  interieurLarge: { id: 'int', a: 1, b: -5, c: 6, rel: '<=' },
  /** −x² + 4 ⩾ 0, a < 0, racines −2 et 2 : le signe de a retourne la lecture. */
  aNegatif: { id: 'aneg', a: -1, b: 0, c: 4, rel: '>=' },
  /** x² + x + 1 > 0, Δ < 0 : le trinôme ne s'annule jamais → S = ℝ. */
  toujoursPositif: { id: 'toujours', a: 1, b: 1, c: 1, rel: '>' },
  /** x² + x + 1 < 0, Δ < 0 : la même expression, l'autre sens → S = ∅. */
  jamaisNegatif: { id: 'jamais', a: 1, b: 1, c: 1, rel: '<' },
  /** x² − 6x + 9 ⩾ 0, Δ = 0 : S = ℝ, la racine double comprise. */
  racineDouble: { id: 'double', a: 1, b: -6, c: 9, rel: '>=' },
};

/* ═══ LES PROBLÈMES CONCRETS (modules 5 et 6) ══════════════════════════════
 *
 * Chaque situation déclare son MODÈLE (les coefficients) et son DOMAINE de
 * validité (les valeurs qui ont un sens dans le contexte). C'est cette
 * séparation qui rend l'interprétation du module 6 vérifiable : une racine
 * hors domaine n'est pas une réponse au problème, même si c'est une solution
 * de l'équation.
 */

/**
 * LA TRAJECTOIRE — un ballon lancé depuis 1 m de haut :
 *   y(x) = −0,25x² + x + 1, x en mètres depuis le lanceur.
 * Δ = 1 + 1 = 2 : les racines sont irrationnelles, et une seule est positive.
 * Le domaine physique est x ⩾ 0 : le ballon ne recule pas.
 */
export const TRAJECTOIRE = {
  id: 'trajectoire',
  a: -0.25, b: 1, c: 1,
  domaine: { from: 0, to: null },
  unite: 'm',
};

/**
 * L'AIRE — un rectangle de périmètre 28 m et d'aire 48 m².
 * Une largeur x et une longueur 14 − x, donc x(14 − x) = 48, soit
 * −x² + 14x − 48 = 0 : Δ = 196 − 192 = 4, racines 6 et 8. Les DEUX sont des
 * longueurs valides — c'est le même rectangle vu dans les deux sens, et c'est
 * une leçon d'interprétation : deux solutions, un seul rectangle.
 */
export const AIRE = {
  id: 'aire',
  a: -1, b: 14, c: -48,
  perimetre: 28, aireCible: 48,
  domaine: { from: 0, to: 14 },
  unite: 'm',
};

/**
 * L'AIRE PIÉGÉE — le même geste, mais une racine NÉGATIVE.
 * Un rectangle dont la longueur dépasse la largeur de 3 m et dont l'aire vaut
 * 40 m² : x(x + 3) = 40, soit x² + 3x − 40 = 0. Δ = 9 + 160 = 169, racines −8
 * et 5. Une longueur ne peut pas valoir −8 : la solution de l'ÉQUATION n'est
 * pas une solution du PROBLÈME. C'est le cœur du LP « interpréter ».
 */
export const AIRE_PIEGEE = {
  id: 'aire-piegee',
  a: 1, b: 3, c: -40,
  ecart: 3, aireCible: 40,
  domaine: { from: 0, to: null },
  unite: 'm',
};

/**
 * L'OPTIMISATION — un enclos contre un mur, 24 m de grillage sur trois côtés :
 *   aire(x) = x(24 − 2x) = −2x² + 24x. Le sommet est en x = 6, et l'aire
 *   maximale vaut 72 m². Le domaine est ]0 ; 12[ : au-delà, la profondeur
 *   serait négative.
 *   L'INÉQUATION du module 5 : « au moins 64 m² » → −2x² + 24x ⩾ 64, soit
 *   −2x² + 24x − 64 ⩾ 0, Δ = 576 − 512 = 64, racines 4 et 8 : S = [4 ; 8].
 */
export const ENCLOS = {
  id: 'enclos',
  grillage: 24,
  a: -2, b: 24, c: 0,
  cible: 64,
  domaine: { from: 0, to: 12 },
  unite: 'm',
};
/** Le trinôme de l'inéquation « aire ⩾ cible » — la cible passe à gauche. */
export const enclosInequation = (cible = ENCLOS.cible) => ({
  a: ENCLOS.a, b: ENCLOS.b, c: ENCLOS.c - cible, rel: '>=',
});
/** L'aire de l'enclos pour une profondeur x. */
export const aireEnclos = (x) => evalTrinome(ENCLOS.a, ENCLOS.b, ENCLOS.c, x);

/**
 * Les racines qui ont un SENS dans le contexte : celles qui tombent dans le
 * domaine déclaré. C'est la fonction qui rend le LP « interpréter » testable.
 */
export function racinesAdmissibles(pb) {
  const rs = roots(pb.a, pb.b, pb.c);
  const { from, to } = pb.domaine;
  return rs.filter((r) => (from === null || r >= from) && (to === null || r <= to));
}
/** Les racines REJETÉES par le contexte — celles que l'élève doit écarter. */
export function racinesRejetees(pb) {
  const admises = racinesAdmissibles(pb);
  return roots(pb.a, pb.b, pb.c).filter((r) => !admises.includes(r));
}

/** Le cadre de dessin d'un trinôme sur un intervalle donné, CALCULÉ. */
export function cadreDe({ a, b, c }, xMin, xMax, marge = 1) {
  const v = vertex(a, b, c);
  const xs = [xMin, xMax];
  if (v.x > xMin && v.x < xMax) xs.push(v.x);
  const ys = xs.map((x) => evalTrinome(a, b, c, x));
  return {
    xMin: Math.floor(xMin - marge),
    xMax: Math.ceil(xMax + marge),
    yMin: Math.floor(Math.min(...ys, 0) - marge),
    yMax: Math.ceil(Math.max(...ys, 0) + marge),
  };
}

/**
 * LE GLISSER DE LA PÉNICHE — l'aimantation sur le cran de position le plus
 * proche, POUR LA LARGEUR COURANTE.
 *
 * L'élève attrape la péniche et la fait coulisser sous l'arche. Le cran rendu
 * est cherché dans `pStepsDe(L)` et non dans une grille fixe : la plage de
 * position se rétrécit quand la péniche s'élargit (un chenal borne un bateau),
 * et un doigt qui pousse au-delà doit s'arrêter au dernier cran LÉGAL, sans
 * jamais faire sortir un coin du cadre.
 *
 * CIBLE ATTEIGNABLE : la valeur rendue est toujours un élément de la grille
 * courante, si bien que les bandes remarquables ]−3 ; 3[, ]−2 ; 2[ et
 * ]−1 ; 1[ restent exactement atteignables au doigt. Verrouillé par un test.
 */
export function pAimante(x, L) {
  const crans = pStepsDe(L);
  let best = crans[0];
  let dist = Math.abs(x - best);
  for (const c of crans) {
    const d = Math.abs(x - c);
    if (d < dist) { dist = d; best = c; }
  }
  return best;
}
