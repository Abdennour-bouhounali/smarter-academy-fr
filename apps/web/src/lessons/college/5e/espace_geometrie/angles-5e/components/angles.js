import { angleAt, angleOf, deg, rad, lineInter, clipLine } from '../../../../../common/geo5e/geo5e';

export { angleAt, angleOf, deg, rad, lineInter, clipLine };

/**
 * Le noyau de la leçon « Angles » (5e) — deux droites coupées par une sécante.
 *
 * LA CONFIGURATION EST CALCULÉE, JAMAIS DESSINÉE À LA MAIN. Toute la leçon
 * repose sur une seule structure : deux droites d1, d2 et une sécante s. Les
 * deux points d'intersection, les huit angles et leurs appariements en sortent
 * par le calcul. C'est ce qui permet à l'élève de traîner une droite et de
 * voir les huit valeurs suivre — en restant vraies.
 *
 * LE PÉRIMÈTRE EST EXÉCUTABLE. La 5e ne démontre pas le théorème de Thalès et
 * ne manipule pas de trigonométrie : `configuration` LÈVE si on lui donne deux
 * droites confondues (aucun angle n'y est défini) ou une sécante parallèle aux
 * deux droites (aucune intersection). Un module qui déraperait casserait la
 * suite au lieu de dessiner une figure absurde.
 */

/**
 * Une droite est décrite par un POINT et une DIRECTION en degrés — c'est ce
 * que l'élève manipule (« je fais tourner cette droite »), et cela rend le
 * parallélisme exactement représentable : deux droites sont parallèles quand
 * leurs directions sont égales, sans erreur d'arrondi.
 */
export const droite = (p, dirDeg) => ({ p, dir: ((dirDeg % 180) + 180) % 180 });

/** Deux points de la droite, écartés de `len` de part et d'autre du point. */
export function pointsDe(d, len = 500) {
  const t = rad(d.dir);
  const u = { x: Math.cos(t), y: Math.sin(t) };
  return [
    { x: d.p.x - u.x * len, y: d.p.y - u.y * len },
    { x: d.p.x + u.x * len, y: d.p.y + u.y * len },
  ];
}

/** L'écart angulaire entre deux directions, dans [0 ; 90]. 0 = parallèles. */
export function ecartDirections(d1, d2) {
  const e = Math.abs(d1.dir - d2.dir) % 180;
  return Math.min(e, 180 - e);
}

export const sontParalleles = (d1, d2, tol = 0.35) => ecartDirections(d1, d2) <= tol;

/**
 * La configuration complète : deux droites, une sécante, et les huit angles.
 *
 * Les angles sont nommés par leur SOMMET (A sur d1, B sur d2) et par leur
 * quadrant, décrit dans le repère de la sécante :
 *   - `haut` / `bas`   : avant ou après le sommet le long de la sécante ;
 *   - `gauche` / `droite` : de quel côté de la sécante.
 *
 * Cette description-là est celle qui rend « alternes-internes » et
 * « correspondants » LISIBLES : deux angles sont correspondants quand ils
 * occupent la MÊME case aux deux sommets, alternes-internes quand ils sont
 * tous deux intérieurs et de côtés opposés.
 */
export function configuration(d1, d2, s) {
  if (sontParalleles(d1, s) || sontParalleles(d2, s)) {
    throw new Error(
      'angles-5e : la sécante doit couper les deux droites — une sécante parallèle '
      + 'à l’une d’elles ne définit aucun angle.',
    );
  }
  const [s0, s1] = pointsDe(s);
  const [a0, a1] = pointsDe(d1);
  const [b0, b1] = pointsDe(d2);

  const A = lineInter(a0, a1, s0, s1);
  const B = lineInter(b0, b1, s0, s1);
  if (!A || !B) {
    throw new Error('angles-5e : les intersections n’existent pas.');
  }

  return { A, B, d1, d2, s, angles: huitAngles(A, B, d1, d2, s) };
}

/**
 * Les huit angles, chacun avec sa mesure RÉELLE et sa position.
 *
 * `interieur` vaut true quand l'angle est entre les deux droites : c'est cette
 * seule information qui sépare « alternes-internes » de « alternes-externes ».
 */
export function huitAngles(A, B, d1, d2, s) {
  const dirAB = angleOf(A, B);                 // le sens A → B le long de la sécante
  const out = [];

  for (const [sommet, P, d, autre] of [['A', A, d1, B], ['B', B, d2, A]]) {
    const t = rad(d.dir);
    for (const signeDroite of [1, -1]) {
      for (const signeSecante of [1, -1]) {
        // Un point sur la droite, d'un côté ou de l'autre du sommet…
        const surDroite = {
          x: P.x + Math.cos(t) * 100 * signeDroite,
          y: P.y + Math.sin(t) * 100 * signeDroite,
        };
        // …et un point sur la sécante, avant ou après le sommet.
        const surSecante = {
          x: P.x + Math.cos(dirAB) * 100 * signeSecante,
          y: P.y + Math.sin(dirAB) * 100 * signeSecante,
        };
        // « Intérieur » = du côté où se trouve l'AUTRE sommet.
        const versAutre = signeSecante > 0 ? sommet === 'A' : sommet === 'B';
        out.push({
          id: `${sommet}${signeDroite > 0 ? 'p' : 'm'}${signeSecante > 0 ? 'p' : 'm'}`,
          sommet,
          P,
          a: surDroite,
          c: surSecante,
          mesure: angleAt(surDroite, P, surSecante),
          interieur: versAutre,
          cote: signeDroite,          // de quel côté de la sécante
          sens: signeSecante,
        });
      }
    }
  }
  return out;
}

export const angleParId = (config, id) => config.angles.find((a) => a.id === id);

/**
 * Deux angles sont CORRESPONDANTS quand ils sont à des sommets différents, du
 * même côté de la sécante, et dans le même sens le long de celle-ci.
 * Autrement dit : ils occupent la même case aux deux croisements.
 */
export const sontCorrespondants = (x, y) =>
  x.sommet !== y.sommet && x.cote === y.cote && x.sens === y.sens;

/**
 * Deux angles sont ALTERNES-INTERNES quand ils sont à des sommets différents,
 * tous deux INTÉRIEURS (entre les deux droites), et de part et d'autre de la
 * sécante.
 */
export const sontAlternesInternes = (x, y) =>
  x.sommet !== y.sommet && x.interieur && y.interieur && x.cote !== y.cote;

/** Alternes-EXTERNES : même chose, mais tous deux à l'extérieur. */
export const sontAlternesExternes = (x, y) =>
  x.sommet !== y.sommet && !x.interieur && !y.interieur && x.cote !== y.cote;

/** Deux angles adjacents formant un angle plat : leur somme vaut 180°. */
export const sontSupplementaires = (x, y, tol = 0.5) =>
  Math.abs(x.mesure + y.mesure - 180) <= tol;

/** Opposés par le sommet : même sommet, côté ET sens inversés. */
export const sontOpposesParSommet = (x, y) =>
  x.sommet === y.sommet && x.cote !== y.cote && x.sens !== y.sens;
