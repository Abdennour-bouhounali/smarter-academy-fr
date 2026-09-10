/**
 * LES AFFIRMATIONS DE LA LEÇON, VÉRIFIÉES SUR SES DONNÉES EXACTES.
 *
 * `common/analysis/trig.test.js` vérifie que le NOYAU est juste. Ce fichier-ci
 * vérifie les affirmations PROPRES à cette leçon :
 *   · « l'aimantation de la barre fait tomber EXACTEMENT sur 0, ±1/2, ±√2/2,
 *     ±√3/2, ±1 » — sans quoi l'élève ne rencontre jamais un cas exact ;
 *   · « au-dessus de 1, la barre ne coupe plus rien » — atteignable ;
 *   · « la zone de préhension de la barre fait au moins 14 px » — le piège
 *     payé trois fois dans cette mission ;
 *   · « les solutions sont en nombre infini, espacées de 2π » — mesuré ;
 *   · « cos x = k donne ±a + 2kπ, sin x = k donne a et π − a + 2kπ » — les
 *     deux formes sont DIFFÉRENTES, vérifié ;
 *   · « la solution d'une inéquation est un ARC » — balayé, pas échantillonné ;
 *   · « cos 2a se DÉDUIT de l'addition en posant b = a » — calculé ;
 *   · « chaque situation périodique a les extremums qu'elle annonce » —
 *     contrôle croisé sur la courbe ;
 *   · « aucun état atteignable ne sort du cadre, à toute largeur d'écran ».
 *
 * PÉRIMÈTRE (dernier bloc) : le modèle ne réenseigne pas ce qui est acquis.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseDec } from '@smarter-academy/core';
import {
  TAU, PAS, REMARQUABLES, principal, sinExact, cosExact, labelPi, texPi, fr,
  parseSigned,
  CRANS_K, K_REMARQUABLES, K_HORS_BORNES, aimanterK, indexK, decalerK,
  ecritureK, texK,
  COS, SIN, solutionPrincipaleCos, solutionPrincipaleSin, familleSolutions,
  solutionsDansFenetre, brancheDansFenetre, ECART_FAMILLE,
  arcsSolution, complementaire, mesureArcs, verifieInegalite, INEQUATIONS, fnDe,
  cosAddition, sinAddition, cos2aDepuisAddition, sin2aDepuisAddition,
  FORMES_COS2A, FORME_SIN2A, pieceLineaire, contreExempleLineaire,
  CIBLES_DUPLICATION, valeurDuplication,
  modele, maxModele, minModele, amplitudeLue, moyenneLue,
  extremesMesures, periodeMesuree, SITUATIONS, lectureAttendue,
  cransAmplitudeDe, CRANS_AMPLITUDE_TOUS, CRANS_PERIODE,
  R, CX, CY, H_CADRE, yDeVal, valDeY, MARGE_G, MARGE_D,
  FENETRES, geometrieFenetre, fenetreDerouleur,
  HAUTEUR_PRISE, R_POIGNEE, R_PRISE_POIGNEE, bandePrise, kDepuisPointeur,
  barreDansLeCadre, pointsAllumes, courbeFenetre,
  CIBLES_BARRE, K_LIMITE, cransHorsBornes,
} from './trigEqUtils';
import { GEOM_MODELE } from './ModeleLab';

const R2 = Math.SQRT2 / 2;
const R3 = Math.sqrt(3) / 2;

/* ─────────────────────────────────────────────────────────────────────────
   1. LA BARRE — l'aimantation atteint EXACTEMENT les valeurs remarquables
   ───────────────────────────────────────────────────────────────────────── */

describe('la barre — atteignabilité EXACTE des hauteurs remarquables', () => {
  it('chaque hauteur remarquable ±k est un cran, au dernier bit près', () => {
    for (const v of K_REMARQUABLES) {
      for (const k of v === 0 ? [0] : [v, -v]) {
        const i = indexK(k);
        expect(i, `${k} doit être un cran`).toBeGreaterThanOrEqual(0);
        expect(Math.abs(CRANS_K[i] - k)).toBeLessThan(1e-15);
      }
    }
  });

  it('les hauteurs remarquables sont celles du NOYAU, pas des décimaux recopiés', () => {
    // Chaque k remarquable doit être le cosinus (ou le sinus) EXACT d'un cran.
    for (const v of K_REMARQUABLES) {
      const trouve = REMARQUABLES.some((r) => Math.abs(r.cos - v) < 1e-15 || Math.abs(r.sin - v) < 1e-15);
      expect(trouve, `${v} doit venir de la table du noyau`).toBe(true);
    }
  });

  it('cosExact rend la valeur EXACTE, et Math.cos ne le fait PAS', () => {
    // Le cœur de la garantie : afficher 0,5 et non 0,49999999999999994.
    expect(cosExact(Math.PI / 3)).toBe(0.5);
    expect(Math.cos(Math.PI / 3)).not.toBe(0.5);
    expect(sinExact(Math.PI / 6)).toBe(0.5);
    expect(Math.sin(Math.PI / 6)).not.toBe(0.5);
    expect(cosExact(Math.PI / 2)).toBe(0);
    expect(Math.cos(Math.PI / 2)).not.toBe(0);
  });

  it('AIMANTATION : un doigt qui vise « à peu près » tombe EXACTEMENT sur le cran', () => {
    for (const v of K_REMARQUABLES) {
      for (const k of v === 0 ? [0] : [v, -v]) {
        // ±0,02 : l'imprécision d'un doigt à 74 px par unité, c'est ~1,5 px.
        for (const bruit of [-0.02, -0.005, 0, 0.005, 0.02]) {
          expect(aimanterK(k + bruit)).toBe(k);
        }
      }
    }
  });

  it('aucun cran intermédiaire ne se confond avec une hauteur remarquable', () => {
    // Sinon l'aimantation deviendrait illisible : deux crans « presque égaux ».
    for (let i = 0; i < CRANS_K.length - 1; i += 1) {
      expect(CRANS_K[i + 1] - CRANS_K[i], `crans ${i} et ${i + 1} trop proches`).toBeGreaterThan(0.04);
    }
  });

  it('les crans sont strictement croissants et symétriques autour de 0', () => {
    for (let i = 0; i < CRANS_K.length - 1; i += 1) expect(CRANS_K[i]).toBeLessThan(CRANS_K[i + 1]);
    expect(CRANS_K).toContain(0);
    for (const k of CRANS_K) {
      expect(CRANS_K.some((c) => Math.abs(c + k) < 1e-12), `−${k} doit être un cran`).toBe(true);
    }
  });

  it('LES CAS SANS SOLUTION sont ATTEIGNABLES, des deux côtés', () => {
    const hors = cransHorsBornes();
    expect(hors.filter((k) => k > 1).length).toBeGreaterThanOrEqual(2);
    expect(hors.filter((k) => k < -1).length).toBeGreaterThanOrEqual(2);
    for (const k of hors) {
      expect(familleSolutions(COS, k)).toBeNull();
      expect(familleSolutions(SIN, k)).toBeNull();
      expect(solutionsDansFenetre(COS, k, -10, 10)).toHaveLength(0);
      expect(solutionsDansFenetre(SIN, k, -10, 10)).toHaveLength(0);
    }
  });

  it('les crans hors bornes déclarés sont bien hors de [−1 ; 1]', () => {
    for (const k of K_HORS_BORNES) expect(Math.abs(k)).toBeGreaterThan(K_LIMITE);
  });

  it('decalerK parcourt toute la liste sans jamais en sortir', () => {
    let k = CRANS_K[0];
    for (let i = 0; i < CRANS_K.length + 5; i += 1) k = decalerK(k, 1);
    expect(k).toBe(CRANS_K[CRANS_K.length - 1]);
    for (let i = 0; i < CRANS_K.length + 5; i += 1) k = decalerK(k, -1);
    expect(k).toBe(CRANS_K[0]);
  });

  it('depuis 0, chaque cible de la manipulation est atteignable au cliquet', () => {
    for (const c of CIBLES_BARRE) {
      const i = indexK(c.k);
      expect(i, `cible ${c.id} : ${c.k} doit être un cran`).toBeGreaterThanOrEqual(0);
      // Atteignable depuis 0 par des décalages successifs.
      const i0 = indexK(0);
      let k = 0;
      for (let n = 0; n < Math.abs(i - i0); n += 1) k = decalerK(k, Math.sign(i - i0));
      expect(k).toBe(c.k);
    }
  });

  it('les cibles couvrent BIEN un cas sans solution et plusieurs cas exacts', () => {
    expect(CIBLES_BARRE.filter((c) => c.attendu === 'aucun point').length).toBeGreaterThanOrEqual(1);
    expect(CIBLES_BARRE.filter((c) => Math.abs(c.k) <= 1).length).toBeGreaterThanOrEqual(3);
    for (const c of CIBLES_BARRE) {
      const pts = solutionsDansFenetre(COS, c.k, -2 * Math.PI, 6 * Math.PI);
      expect(pts.length > 0).toBe(c.attendu === 'des points');
    }
  });

  it('l’écriture d’une hauteur DÉRIVE du nombre — texte et figure ne se contredisent pas', () => {
    expect(ecritureK(0.5)).toBe('1/2');
    expect(ecritureK(-0.5)).toBe('−1/2');
    expect(ecritureK(R2)).toBe('√2/2');
    expect(ecritureK(-R3)).toBe('−√3/2');
    expect(ecritureK(1)).toBe('1');
    expect(ecritureK(0)).toBe('0');
    // Une hauteur non remarquable retombe sur le format français.
    expect(ecritureK(0.25)).toBe('0,25');
    // Et jamais un « −0,00 ».
    expect(ecritureK(0)).not.toContain('−');
  });

  it('texK produit du KaTeX pour chaque cran, sans exception', () => {
    for (const k of CRANS_K) {
      const s = texK(k);
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
      // Le KaTeX n'accepte pas le vrai signe moins ni la virgule décimale.
      expect(s).not.toContain('−');
      expect(s).not.toContain(',');
    }
  });
});

/* ─────────────────────────────────────────────────────────────────────────
   2. LES SOLUTIONS SUR ℝ — la FAMILLE, l'apport propre de la leçon
   ───────────────────────────────────────────────────────────────────────── */

describe('la solution principale est EXACTE aux hauteurs remarquables', () => {
  it('acos(1/2) rend π/3 au bit près, là où Math.acos ne le fait pas', () => {
    expect(solutionPrincipaleCos(0.5)).toBe(Math.PI / 3);
    expect(Math.acos(0.5)).not.toBe(Math.PI / 3);
    expect(solutionPrincipaleCos(R2)).toBe(Math.PI / 4);
    expect(solutionPrincipaleCos(R3)).toBe(Math.PI / 6);
    expect(solutionPrincipaleCos(0)).toBe(Math.PI / 2);
    expect(solutionPrincipaleCos(1)).toBe(0);
    expect(solutionPrincipaleCos(-1)).toBe(Math.PI);
  });

  it('asin(1/2) rend π/6 au bit près, et les négatifs aussi', () => {
    expect(solutionPrincipaleSin(0.5)).toBe(Math.PI / 6);
    expect(solutionPrincipaleSin(R2)).toBe(Math.PI / 4);
    expect(solutionPrincipaleSin(1)).toBe(Math.PI / 2);
    expect(solutionPrincipaleSin(0)).toBe(0);
    expect(solutionPrincipaleSin(-0.5)).toBeCloseTo(-Math.PI / 6, 12);
    expect(solutionPrincipaleSin(-1)).toBeCloseTo(-Math.PI / 2, 12);
  });

  it('la solution principale VÉRIFIE l’équation, pour tout cran dans les bornes', () => {
    for (const k of CRANS_K.filter((v) => Math.abs(v) <= 1)) {
      const a = solutionPrincipaleCos(k);
      expect(Math.abs(Math.cos(a) - k)).toBeLessThan(1e-12);
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(Math.PI + 1e-12);

      const b = solutionPrincipaleSin(k);
      expect(Math.abs(Math.sin(b) - k)).toBeLessThan(1e-12);
      expect(b).toBeGreaterThanOrEqual(-Math.PI / 2 - 1e-12);
      expect(b).toBeLessThanOrEqual(Math.PI / 2 + 1e-12);
    }
  });

  it('hors de [−1 ; 1], il n’y a PAS de solution principale', () => {
    for (const k of [1.2, 1.5, -1.2, -1.5, 4]) {
      expect(solutionPrincipaleCos(k)).toBeNull();
      expect(solutionPrincipaleSin(k)).toBeNull();
    }
  });
});

describe('LA FAMILLE ±a + 2kπ — le cœur de l’apport de la Première', () => {
  it('cos x = k : les DEUX représentants sont a et −a', () => {
    for (const k of CRANS_K.filter((v) => Math.abs(v) <= 1)) {
      const f = familleSolutions(COS, k);
      expect(f.forme).toBe('plus-ou-moins');
      expect(f.base[0]).toBe(f.a);
      expect(f.base[1]).toBe(-f.a);
    }
  });

  it('sin x = k : les DEUX représentants sont a et π − a — une AUTRE forme', () => {
    for (const k of CRANS_K.filter((v) => Math.abs(v) <= 1)) {
      const f = familleSolutions(SIN, k);
      expect(f.forme).toBe('a-et-pi-moins-a');
      expect(f.base[0]).toBe(f.a);
      expect(Math.abs(f.base[1] - (Math.PI - f.a))).toBeLessThan(1e-15);
    }
  });

  it('les DEUX formes sont réellement DIFFÉRENTES — sinon le module 3 ne dirait rien', () => {
    // Sur k = 1/2, les solutions de cos et de sin ne coïncident pas.
    const c = solutionsDansFenetre(COS, 0.5, 0, TAU);
    const s = solutionsDansFenetre(SIN, 0.5, 0, TAU);
    expect(c).toHaveLength(2);
    expect(s).toHaveLength(2);
    // Les deux solutions du cosinus sont symétriques par rapport à l'axe
    // HORIZONTAL : leur somme vaut 2π. Celles du sinus, par rapport à l'axe
    // VERTICAL : leur somme vaut π.
    expect(Math.abs(c[0] + c[1] - TAU)).toBeLessThan(1e-12);
    expect(Math.abs(s[0] + s[1] - Math.PI)).toBeLessThan(1e-12);
    // Et les ensembles diffèrent.
    expect(c.some((x) => s.some((y) => Math.abs(x - y) < 1e-9))).toBe(false);
  });

  it('TOUT membre de la famille est solution — balayé sur ±5 tours', () => {
    for (const fn of [COS, SIN]) {
      for (const k of CRANS_K.filter((v) => Math.abs(v) <= 1)) {
        const f = familleSolutions(fn, k);
        for (const b of f.base) {
          for (let n = -5; n <= 5; n += 1) {
            expect(Math.abs(fn.exact(b + n * TAU) - k), `${fn.id}, k=${k}, n=${n}`).toBeLessThan(1e-9);
          }
        }
      }
    }
  });

  it('et RIEN d’autre n’est solution — balayage fin d’un tour', () => {
    for (const fn of [COS, SIN]) {
      const k = 0.5;
      const f = familleSolutions(fn, k);
      const attendus = solutionsDansFenetre(fn, k, 0, TAU);
      for (let i = 0; i <= 4000; i += 1) {
        const x = (TAU * i) / 4000;
        const estSolution = Math.abs(fn.exact(x) - k) < 1e-9;
        const estDansFamille = attendus.some((s) => Math.abs(s - x) < 1e-6);
        if (estSolution) expect(estDansFamille, `${fn.id} : ${x} est solution mais hors famille`).toBe(true);
      }
      expect(f.base).toHaveLength(2);
    }
  });

  it('les solutions d’une MÊME branche sont espacées de 2π EXACTEMENT', () => {
    for (const fn of [COS, SIN]) {
      const f = familleSolutions(fn, R2);
      for (const b of f.base) {
        const br = brancheDansFenetre(b, -2 * Math.PI, 6 * Math.PI);
        expect(br.length).toBeGreaterThanOrEqual(4);
        for (let i = 0; i < br.length - 1; i += 1) {
          expect(Math.abs(br[i + 1] - br[i] - ECART_FAMILLE)).toBeLessThan(1e-12);
        }
      }
    }
  });

  it('L’INFINITÉ SE VOIT : plus la fenêtre est large, plus il y a de points', () => {
    const n1 = solutionsDansFenetre(COS, 0.5, 0, TAU).length;
    const n2 = solutionsDansFenetre(COS, 0.5, 0, 2 * TAU).length;
    const n3 = solutionsDansFenetre(COS, 0.5, 0, 5 * TAU).length;
    expect(n2).toBe(2 * n1);
    expect(n3).toBe(5 * n1);
  });

  it('les cas DOUBLES ne comptent pas deux fois : cos x = 1 n’a qu’un point par tour', () => {
    const pts = solutionsDansFenetre(COS, 1, -0.1, 4 * Math.PI + 0.1);
    // 0, 2π, 4π — trois points, pas six.
    expect(pts).toHaveLength(3);
    for (let i = 0; i < pts.length - 1; i += 1) expect(pts[i + 1] - pts[i]).toBeCloseTo(TAU, 9);
    // Idem pour sin x = 1.
    const ps = solutionsDansFenetre(SIN, 1, 0, 4 * Math.PI + 0.1);
    expect(ps).toHaveLength(2);
  });

  it('les solutions rendues sont croissantes et sans doublon, à tout k', () => {
    for (const fn of [COS, SIN]) {
      for (const k of CRANS_K) {
        const pts = solutionsDansFenetre(fn, k, -2 * Math.PI, 6 * Math.PI);
        for (let i = 0; i < pts.length - 1; i += 1) {
          expect(pts[i]).toBeLessThan(pts[i + 1]);
          expect(pts[i + 1] - pts[i]).toBeGreaterThan(1e-9);
        }
      }
    }
  });

  it('l’écriture de la famille DÉRIVE de a, jamais saisie à côté', () => {
    const f = familleSolutions(COS, 0.5);
    expect(f.tex).toContain('2k\\pi');
    expect(f.tex).toContain(texPi(Math.PI / 3));
    const g = familleSolutions(SIN, 0.5);
    expect(g.tex).toContain('\\pi -');
    expect(g.tex).toContain(texPi(Math.PI / 6));
  });
});

/* ─────────────────────────────────────────────────────────────────────────
   3. LES INÉQUATIONS — la solution est un ARC, balayé
   ───────────────────────────────────────────────────────────────────────── */

describe('les inéquations — l’arc est MESURÉ, pas recopié', () => {
  /**
   * Le contrôle croisé : l'arc rendu coïncide-t-il avec l'ensemble des x vrais ?
   *
   * Le balayage s'arrête AVANT 2π (i < n) : l'intervalle de résolution est
   * [0 ; 2π[, demi-ouvert, et 2π y désigne le même point du cercle que 0.
   * L'y inclure ferait échouer « sin x ≥ 0 », dont l'arc est [0 ; π].
   */
  const balayer = (fn, k, sens, n = 6000) => {
    const arcs = arcsSolution(fn, k, sens);
    const dans = (x) => arcs.some((a) => x >= a.de - 1e-9 && x <= a.a + 1e-9);
    let ecarts = 0;
    for (let i = 0; i < n; i += 1) {
      const x = (TAU * i) / n;
      const vrai = verifieInegalite(fn, k, sens, x);
      // On tolère un écart strictement au voisinage des bornes de l'arc :
      // c'est là que le flottant ne tranche pas.
      const auBord = arcs.some((a) => Math.abs(x - a.de) < 1e-3 || Math.abs(x - a.a) < 1e-3);
      if (vrai !== dans(x) && !auBord) ecarts += 1;
    }
    return ecarts;
  };

  it('cos x ≥ 1/2 : l’arc rendu EST l’ensemble des solutions — balayé', () => {
    expect(balayer(COS, 0.5, '>=')).toBe(0);
  });

  it('cos x ≤ −1/2, sin x ≥ √2/2, sin x ≤ −1/2 : idem', () => {
    expect(balayer(COS, -0.5, '<=')).toBe(0);
    expect(balayer(SIN, R2, '>=')).toBe(0);
    expect(balayer(SIN, -0.5, '<=')).toBe(0);
  });

  it('BALAYAGE COMPLET : pour tout cran et les deux sens, l’arc est juste', () => {
    for (const fn of [COS, SIN]) {
      for (const k of CRANS_K) {
        for (const sens of ['>=', '<=']) {
          expect(balayer(fn, k, sens, 2000), `${fn.id} ${sens} ${k}`).toBe(0);
        }
      }
    }
  });

  it('LA SOLUTION EST UN ARC, pas des points : sa mesure est STRICTEMENT positive', () => {
    for (const ineq of INEQUATIONS) {
      const arcs = arcsSolution(fnDe(ineq.fn), ineq.k, ineq.sens);
      expect(mesureArcs(arcs), `${ineq.id}`).toBeGreaterThan(0.5);
    }
  });

  it('et l’ÉGALITÉ, elle, ne donne que des points : mesure nulle', () => {
    // La différence est le sujet même du module 4.
    for (const ineq of INEQUATIONS) {
      const pts = solutionsDansFenetre(fnDe(ineq.fn), ineq.k, 0, TAU);
      expect(pts.length).toBeLessThanOrEqual(2);
    }
  });

  it('cos x ≥ 1/2 mesure exactement 2π/3 — le tiers du tour', () => {
    expect(mesureArcs(arcsSolution(COS, 0.5, '>='))).toBeCloseTo((2 * Math.PI) / 3, 12);
  });

  it('sin x ≥ √2/2 mesure exactement π/2 — le quart du tour', () => {
    expect(mesureArcs(arcsSolution(SIN, R2, '>='))).toBeCloseTo(Math.PI / 2, 12);
  });

  it('cos x ≤ −1/2 mesure exactement 2π/3 aussi', () => {
    expect(mesureArcs(arcsSolution(COS, -0.5, '<='))).toBeCloseTo((2 * Math.PI) / 3, 12);
  });

  it('les deux sens sont COMPLÉMENTAIRES : leurs mesures font un tour', () => {
    for (const fn of [COS, SIN]) {
      for (const k of CRANS_K.filter((v) => Math.abs(v) < 1)) {
        const h = mesureArcs(arcsSolution(fn, k, '>='));
        const b = mesureArcs(arcsSolution(fn, k, '<='));
        expect(h + b, `${fn.id} k=${k}`).toBeCloseTo(TAU, 9);
      }
    }
  });

  it('hors bornes : tout le tour d’un côté, rien de l’autre', () => {
    expect(mesureArcs(arcsSolution(COS, 1.5, '<='))).toBeCloseTo(TAU, 12);
    expect(arcsSolution(COS, 1.5, '>=')).toHaveLength(0);
    expect(mesureArcs(arcsSolution(SIN, -1.5, '>='))).toBeCloseTo(TAU, 12);
    expect(arcsSolution(SIN, -1.5, '<=')).toHaveLength(0);
  });

  it('tout arc rendu vit DANS [0 ; 2π] et est croissant', () => {
    for (const fn of [COS, SIN]) {
      for (const k of CRANS_K) {
        for (const sens of ['>=', '<=']) {
          for (const a of arcsSolution(fn, k, sens)) {
            expect(a.de).toBeGreaterThanOrEqual(-1e-12);
            expect(a.a).toBeLessThanOrEqual(TAU + 1e-12);
            expect(a.a).toBeGreaterThanOrEqual(a.de - 1e-12);
          }
        }
      }
    }
  });

  it('les trois inéquations du module sont DISTINCTES deux à deux', () => {
    const cles = INEQUATIONS.map((i) => `${i.fn}|${i.k}|${i.sens}`);
    expect(new Set(cles).size).toBe(INEQUATIONS.length);
    // Et leurs mesures aussi diffèrent d'au moins deux d'entre elles : sinon
    // deux exercices seraient interchangeables.
    const mesures = INEQUATIONS.map((i) => mesureArcs(arcsSolution(fnDe(i.fn), i.k, i.sens)));
    expect(new Set(mesures.map((m) => m.toFixed(6))).size).toBeGreaterThanOrEqual(2);
  });

  it('complementaire est bien une involution sur des arcs simples', () => {
    const a = [{ de: 1, a: 2 }];
    const c = complementaire(a);
    const cc = complementaire(c);
    expect(mesureArcs(cc)).toBeCloseTo(mesureArcs(a), 12);
  });

  it('chaque inéquation est ATTEIGNABLE : son k est un cran de la barre', () => {
    for (const ineq of INEQUATIONS) {
      expect(indexK(ineq.k), `${ineq.id} : k = ${ineq.k}`).toBeGreaterThanOrEqual(0);
    }
  });
});

/* ─────────────────────────────────────────────────────────────────────────
   4. LA DUPLICATION — DÉDUITE de l'addition
   ───────────────────────────────────────────────────────────────────────── */

describe('les formules d’addition (acquises en 2de) sont VRAIES, pas crues', () => {
  it('cosAddition et sinAddition coïncident avec cos(a+b) et sin(a+b) — balayé', () => {
    for (let i = 0; i < 24; i += 1) {
      for (let j = 0; j < 24; j += 1) {
        const a = i * PAS;
        const b = j * PAS;
        expect(Math.abs(cosAddition(a, b) - Math.cos(a + b)), `${i},${j}`).toBeLessThan(1e-12);
        expect(Math.abs(sinAddition(a, b) - Math.sin(a + b)), `${i},${j}`).toBeLessThan(1e-12);
      }
    }
  });
});

describe('LA DUPLICATION — on pose b = a, et la formule TOMBE', () => {
  it('cos 2a est LITTÉRALEMENT cosAddition(a, a) — le geste du module', () => {
    for (let i = 0; i < 48; i += 1) {
      const a = i * PAS;
      expect(cos2aDepuisAddition(a)).toBe(cosAddition(a, a));
      expect(Math.abs(cos2aDepuisAddition(a) - Math.cos(2 * a))).toBeLessThan(1e-12);
      expect(Math.abs(sin2aDepuisAddition(a) - Math.sin(2 * a))).toBeLessThan(1e-12);
    }
  });

  it('les TROIS écritures de cos 2a coïncident partout — balayé', () => {
    for (let i = 0; i < 96; i += 1) {
      const a = (i * PAS) / 2;
      const ref = Math.cos(2 * a);
      for (const forme of FORMES_COS2A) {
        expect(Math.abs(forme.f(a) - ref), `${forme.id} en ${i}`).toBeLessThan(1e-12);
      }
    }
  });

  it('sin 2a = 2 sin a cos a, partout', () => {
    for (let i = 0; i < 96; i += 1) {
      const a = (i * PAS) / 2;
      expect(Math.abs(FORME_SIN2A.f(a) - Math.sin(2 * a))).toBeLessThan(1e-12);
    }
  });

  it('LE PIÈGE « cos 2a = 2 cos a » est FAUX, et le contre-exemple est VISIBLE', () => {
    const ce = contreExempleLineaire(0.5);
    expect(ce).not.toBeNull();
    // Le contre-exemple est un réel remarquable, donc exactement affichable.
    expect(labelPi(ce.t)).not.toBeNull();
    // Et l'écart est GRAND : l'élève le voit, il n'a pas à le croire.
    expect(Math.abs(ce.vrai - ce.faux)).toBeGreaterThanOrEqual(0.5);
    expect(ce.vrai).not.toBe(ce.faux);
  });

  it('le piège n’est pas faux « partout sauf un point » : il est faux presque partout', () => {
    let faux = 0;
    for (let i = 0; i < 48; i += 1) {
      const a = i * PAS;
      if (Math.abs(cos2aDepuisAddition(a) - pieceLineaire(a)) > 1e-9) faux += 1;
    }
    expect(faux).toBeGreaterThan(40);
  });

  it('chaque cible de duplication a une valeur EXACTE et remarquable', () => {
    for (const c of CIBLES_DUPLICATION) {
      const v = valeurDuplication(c);
      // Le double du réel est un cran, donc la valeur est celle de la table.
      expect(labelPi(2 * c.t), `${c.id} : 2a doit s’écrire en π`).not.toBeNull();
      // Elle vaut une hauteur remarquable, au 1e-12 près.
      const remarquable = K_REMARQUABLES.some((r) => Math.abs(Math.abs(v) - r) < 1e-12);
      expect(remarquable, `${c.id} : ${v} doit être remarquable`).toBe(true);
    }
  });

  it('les cibles de duplication sont DISTINCTES deux à deux', () => {
    const cles = CIBLES_DUPLICATION.map((c) => `${c.fn}|${c.t}`);
    expect(new Set(cles).size).toBe(CIBLES_DUPLICATION.length);
    const vals = CIBLES_DUPLICATION.map((c) => valeurDuplication(c).toFixed(9));
    expect(new Set(vals).size).toBe(CIBLES_DUPLICATION.length);
  });

  it('et le PIÈGE de chaque cible diffère de sa bonne réponse', () => {
    for (const c of CIBLES_DUPLICATION.filter((x) => x.fn === 'cos')) {
      expect(Math.abs(valeurDuplication(c) - pieceLineaire(c.t))).toBeGreaterThan(1e-6);
    }
  });
});

/* ─────────────────────────────────────────────────────────────────────────
   5. LA MODÉLISATION — contrôle croisé sur la courbe
   ───────────────────────────────────────────────────────────────────────── */

describe('les situations périodiques disent VRAI — mesuré sur la courbe', () => {
  it('chaque situation a les extremums que ses réglages annoncent', () => {
    for (const s of SITUATIONS) {
      const f = modele(s.reglages);
      const { max, min } = extremesMesures(f, 0, s.tMax);
      expect(max, `${s.id} max`).toBeCloseTo(maxModele(s.reglages), 6);
      expect(min, `${s.id} min`).toBeCloseTo(minModele(s.reglages), 6);
    }
  });

  it('l’amplitude LUE (demi-différence) est bien le réglage A', () => {
    for (const s of SITUATIONS) {
      const l = lectureAttendue(s);
      expect(l.amplitude, `${s.id}`).toBeCloseTo(Math.abs(s.reglages.A), 6);
      expect(l.moyenne, `${s.id}`).toBeCloseTo(s.reglages.m, 6);
    }
  });

  it('la période MESURÉE sur la courbe est celle qu’on demande de trouver', () => {
    for (const s of SITUATIONS) {
      const f = modele(s.reglages);
      const essais = [...CRANS_PERIODE].sort((a, b) => a - b);
      const p = periodeMesuree(f, essais, 0, s.tMax);
      expect(p, `${s.id}`).toBe(s.reglages.P);
    }
  });

  it('une période PLUS COURTE ne convient jamais — la mesure est la plus petite', () => {
    for (const s of SITUATIONS) {
      const f = modele(s.reglages);
      for (const p of CRANS_PERIODE.filter((v) => v < s.reglages.P)) {
        expect(periodeMesuree(f, [p], 0, s.tMax), `${s.id} p=${p}`).toBeNull();
      }
    }
  });

  it('LE MAXIMUM EST ATTEINT EN d — c’est ce qui rend le décalage LISIBLE', () => {
    for (const s of SITUATIONS) {
      const f = modele(s.reglages);
      expect(f(s.reglages.d), `${s.id}`).toBeCloseTo(maxModele(s.reglages), 9);
    }
  });

  it('chaque cible de réglage tombe EXACTEMENT sur un cran — consigne faisable', () => {
    for (const s of SITUATIONS) {
      expect(cransAmplitudeDe(s), `${s.id} amplitude`).toContain(Math.abs(s.reglages.A));
      expect(CRANS_PERIODE, `${s.id} période`).toContain(s.reglages.P);
    }
  });

  it('les crans de réglage sont strictement croissants, sans doublon', () => {
    for (const liste of [...SITUATIONS.map(cransAmplitudeDe), CRANS_PERIODE, CRANS_AMPLITUDE_TOUS()]) {
      for (let i = 0; i < liste.length - 1; i += 1) expect(liste[i]).toBeLessThan(liste[i + 1]);
    }
  });

  it('les trois situations sont DISTINCTES — trois réglages, trois lectures', () => {
    const cles = SITUATIONS.map((s) => `${s.reglages.A}|${s.reglages.P}|${s.reglages.m}`);
    expect(new Set(cles).size).toBe(SITUATIONS.length);
    const amplitudes = SITUATIONS.map((s) => s.reglages.A);
    expect(new Set(amplitudes).size).toBe(SITUATIONS.length);
    const periodes = SITUATIONS.map((s) => s.reglages.P);
    expect(new Set(periodes).size).toBe(SITUATIONS.length);
  });

  it('les nombres cités dans le CONTEXTE sont ceux que la courbe donne', () => {
    // Contrôle croisé texte ↔ modèle : un énoncé ne peut pas mentir.
    for (const s of SITUATIONS) {
      const l = lectureAttendue(s);
      const nombres = [...s.contexte.matchAll(/(\d+(?:[.,]\d+)?)/g)].map((m) => Number(m[1].replace(',', '.')));
      // Le maximum, le minimum et la période doivent tous apparaître.
      for (const v of [l.max, l.min, l.periode]) {
        expect(nombres.some((n) => Math.abs(n - v) < 1e-6), `${s.id} : ${v} absent du contexte`).toBe(true);
      }
    }
  });

  it('chaque situation reste POSITIVE sur toute sa durée — une hauteur ne l’est pas moins', () => {
    for (const s of SITUATIONS) {
      const { min } = extremesMesures(modele(s.reglages), 0, s.tMax);
      expect(min, `${s.id}`).toBeGreaterThanOrEqual(0);
    }
  });

  it('la fenêtre de chaque situation montre AU MOINS deux périodes entières', () => {
    // Sinon on demanderait de lire « d’un sommet au sommet suivant » sans que
    // le suivant soit dessiné — exactement la consigne infaisable à éviter.
    for (const s of SITUATIONS) {
      expect(s.tMax / s.reglages.P, `${s.id}`).toBeGreaterThanOrEqual(2);
    }
  });
});

/* ─────────────────────────────────────────────────────────────────────────
   6. LE GLISSER — la barre s'attrape, et la prise est MESURÉE
   ───────────────────────────────────────────────────────────────────────── */

describe('LA ZONE DE PRÉHENSION — le piège payé trois fois dans cette mission', () => {
  it('la bande de prise de la barre fait AU MOINS 14 px de haut, à tout cran', () => {
    for (const k of CRANS_K) {
      const b = bandePrise(k);
      expect(b.hauteur, `k = ${k} : bande de ${b.hauteur} px`).toBeGreaterThanOrEqual(14);
    }
  });

  it('et la pastille de la poignée fait au moins 22 px de diamètre attrapable', () => {
    expect(2 * R_PRISE_POIGNEE).toBeGreaterThanOrEqual(22);
    // La pastille VISIBLE reste plus petite que sa cible tactile.
    expect(R_POIGNEE).toBeLessThan(R_PRISE_POIGNEE);
    expect(HAUTEUR_PRISE).toBeGreaterThanOrEqual(14);
  });

  it('la bande de prise reste DANS le cadre, même à la barre la plus haute', () => {
    for (const k of CRANS_K) {
      const b = bandePrise(k);
      expect(b.haut).toBeGreaterThanOrEqual(0);
      expect(b.bas).toBeLessThanOrEqual(H_CADRE);
    }
  });

  it('deux crans voisins donnent des bandes DISTINCTES — le geste est lisible', () => {
    for (let i = 0; i < CRANS_K.length - 1; i += 1) {
      const y1 = yDeVal(CRANS_K[i]);
      const y2 = yDeVal(CRANS_K[i + 1]);
      expect(Math.abs(y1 - y2), `crans ${i}/${i + 1}`).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('LE GLISSER de la barre — aimantation et stabilité', () => {
  it('yDeVal et valDeY sont réciproques, au dernier bit près', () => {
    for (const k of CRANS_K) expect(valDeY(yDeVal(k))).toBeCloseTo(k, 12);
  });

  it('lâchée SUR un cran, la barre rend EXACTEMENT ce cran', () => {
    for (const k of CRANS_K) expect(kDepuisPointeur(yDeVal(k))).toBe(k);
  });

  it('lâchée à ±3 px d’une hauteur remarquable, elle y tombe quand même', () => {
    for (const v of K_REMARQUABLES) {
      for (const k of v === 0 ? [0] : [v, -v]) {
        for (const dpx of [-3, -1, 0, 1, 3]) {
          expect(kDepuisPointeur(yDeVal(k) + dpx), `k=${k} dpx=${dpx}`).toBe(k);
        }
      }
    }
  });

  it('un aller-retour au même endroit rend le MÊME cran — le geste est stable', () => {
    for (let y = 0; y <= H_CADRE; y += 1) {
      const a = kDepuisPointeur(y);
      expect(kDepuisPointeur(y)).toBe(a);
      expect(CRANS_K).toContain(a);
    }
  });

  it('un glisser HORS cadre reste borné à un cran permis', () => {
    for (const y of [-500, -1, H_CADRE + 1, 5000]) {
      expect(CRANS_K).toContain(kDepuisPointeur(y));
    }
  });

  it('tout point du cadre s’aimante sur un cran — balayé au demi-pixel', () => {
    for (let y = 0; y <= H_CADRE; y += 0.5) {
      expect(CRANS_K).toContain(kDepuisPointeur(y));
    }
  });

  it('les DEUX chemins — glisser et cliquet — mènent au MÊME état', () => {
    let k = 0;
    for (let n = 0; n < 4; n += 1) k = decalerK(k, 1);
    expect(kDepuisPointeur(yDeVal(k))).toBe(k);
  });
});

/* ─────────────────────────────────────────────────────────────────────────
   7. SÉCURITÉ DE MISE EN PAGE — balayée, jamais échantillonnée
   ───────────────────────────────────────────────────────────────────────── */

describe('SÉCURITÉ DE MISE EN PAGE', () => {
  it('la barre reste DANS le cadre à tout cran atteignable', () => {
    for (const k of CRANS_K) expect(barreDansLeCadre(k), `k = ${k}`).toBe(true);
  });

  it('le cercle tient dans son cadre carré', () => {
    expect(CX - R).toBeGreaterThanOrEqual(0);
    expect(CX + R).toBeLessThanOrEqual(H_CADRE);
    expect(CY - R).toBeGreaterThanOrEqual(0);
    expect(CY + R).toBeLessThanOrEqual(H_CADRE);
  });

  it('les deux cadres partagent l’échelle verticale — la barre est UN trait continu', () => {
    // Le point du cercle d'ordonnée k et le point de la courbe de hauteur k
    // sont à la MÊME ordonnée pixel. C'est ce qui rend la manipulation lisible.
    for (const k of CRANS_K.filter((v) => Math.abs(v) <= 1)) {
      const yCercle = CY - k * R;
      expect(yDeVal(k)).toBeCloseTo(yCercle, 12);
    }
  });

  it('CHAQUE fenêtre candidate va au-delà de 2π ET descend sous 0', () => {
    for (const f of FENETRES) {
      const g = geometrieFenetre(f);
      expect(g.tMax, JSON.stringify(f)).toBeGreaterThan(TAU);
      expect(g.tMin, JSON.stringify(f)).toBeLessThan(0);
    }
  });

  it('CHAQUE fenêtre montre au moins DEUX tours entiers — la famille doit s’y répéter', () => {
    for (const f of FENETRES) {
      const g = geometrieFenetre(f);
      expect(g.tours, JSON.stringify(f)).toBeGreaterThanOrEqual(2);
      // Concrètement : au moins 4 points allumés pour k = 1/2.
      expect(solutionsDansFenetre(COS, 0.5, g.tMin, g.tMax).length).toBeGreaterThanOrEqual(4);
      expect(solutionsDansFenetre(SIN, 0.5, g.tMin, g.tMax).length).toBeGreaterThanOrEqual(4);
    }
  });

  it('pour TOUTE largeur disponible, la fenêtre choisie y TIENT', () => {
    const plusEtroite = geometrieFenetre(FENETRES[FENETRES.length - 1]);
    for (let w = 0; w <= 1400; w += 1) {
      const g = fenetreDerouleur(w);
      if (w >= plusEtroite.largeur) expect(g.largeur, `w=${w}`).toBeLessThanOrEqual(w);
      else expect(g.largeur).toBe(plusEtroite.largeur);
    }
  });

  it('à 375 px de <main>, le dessin ne dépasse pas la place réelle', () => {
    // Un téléphone : <main> à 375 px, moins les gouttières et la bordure.
    const dispo = 375 - 2 * 16 - 2 * 8;
    const g = fenetreDerouleur(dispo);
    expect(g.largeur).toBeLessThanOrEqual(Math.max(dispo, geometrieFenetre(FENETRES[FENETRES.length - 1]).largeur));
    // Et cette fenêtre garde les deux gestes.
    expect(g.tMin).toBeLessThan(0);
    expect(g.tMax).toBeGreaterThan(TAU);
  });

  it('dans CHAQUE fenêtre, les étiquettes restent séparées et dans le cadre', () => {
    const largeurTexte = (s) =>
      [...String(s)].reduce((n, c) => n + (c === '−' || c === '-' ? 5.5 : c === '/' ? 4 : 6), 0);
    for (const f of FENETRES) {
      const g = geometrieFenetre(f);
      const ecrites = g.graduations.filter((x) => x.label !== null);
      for (let i = 0; i < ecrites.length - 1; i += 1) {
        const d1 = largeurTexte(ecrites[i].label) / 2;
        const d2 = largeurTexte(ecrites[i + 1].label) / 2;
        expect(ecrites[i].x + d1 + 2, `${JSON.stringify(f)} : ${ecrites[i].label}/${ecrites[i + 1].label}`)
          .toBeLessThan(ecrites[i + 1].x - d2);
      }
      for (const e of ecrites) {
        const d = largeurTexte(e.label) / 2;
        expect(e.x - d).toBeGreaterThanOrEqual(-1);
        expect(e.x + d).toBeLessThanOrEqual(g.largeur + 1);
      }
    }
  });

  it('une graduation muette ne porte JAMAIS de texte — rien à déborder', () => {
    for (const f of FENETRES) {
      for (const g of geometrieFenetre(f).graduations) {
        if (!g.majeure) expect(g.label).toBeNull();
      }
    }
  });

  it('toute étiquette est une écriture en π, jamais un décimal', () => {
    for (const f of FENETRES) {
      for (const g of geometrieFenetre(f).graduations) {
        if (g.label !== null) expect(g.label).toMatch(/^(−?\d*π(\/\d+)?|0)$/);
      }
    }
  });

  it('les bornes 0 et 2π sont ÉTIQUETÉES dans chaque fenêtre', () => {
    for (const f of FENETRES) {
      const labels = geometrieFenetre(f).graduations.filter((g) => g.label).map((g) => g.label);
      expect(labels, JSON.stringify(f)).toContain('0');
      expect(labels, JSON.stringify(f)).toContain('2π');
    }
  });

  it('dans CHAQUE fenêtre, tout point allumé tient DANS le cadre', () => {
    for (const f of FENETRES) {
      const g = geometrieFenetre(f);
      for (const fn of [COS, SIN]) {
        for (const k of CRANS_K) {
          for (const p of pointsAllumes(fn, k, g)) {
            expect(p.px, `${fn.id} k=${k}`).toBeGreaterThanOrEqual(0);
            expect(p.px).toBeLessThanOrEqual(g.largeur);
            expect(p.py).toBeGreaterThanOrEqual(0);
            expect(p.py).toBeLessThanOrEqual(H_CADRE);
          }
        }
      }
    }
  });

  it('la courbe tracée ne sort jamais du cadre, dans chaque fenêtre', () => {
    for (const f of FENETRES) {
      const g = geometrieFenetre(f);
      for (const fn of [COS, SIN]) {
        for (const p of courbeFenetre(fn, g, 400)) {
          const y = yDeVal(p.y);
          expect(y).toBeGreaterThanOrEqual(0);
          expect(y).toBeLessThanOrEqual(H_CADRE);
          expect(g.xDe(p.x)).toBeGreaterThanOrEqual(-1e-9);
          expect(g.xDe(p.x)).toBeLessThanOrEqual(g.largeur + 1e-9);
        }
      }
    }
  });

  it('les fenêtres sont classées de la plus riche à la plus étroite', () => {
    for (let i = 0; i < FENETRES.length - 1; i += 1) {
      const a = geometrieFenetre(FENETRES[i]);
      const b = geometrieFenetre(FENETRES[i + 1]);
      expect(a.largeur, `${i}`).toBeGreaterThan(b.largeur);
    }
  });

  it('xDe et tDe sont réciproques dans chaque fenêtre', () => {
    for (const f of FENETRES) {
      const g = geometrieFenetre(f);
      for (let i = 0; i <= 20; i += 1) {
        const t = g.tMin + ((g.tMax - g.tMin) * i) / 20;
        expect(g.tDe(g.xDe(t))).toBeCloseTo(t, 9);
      }
    }
  });

  it('une largeur nulle (avant la première mesure) rend une fenêtre qui tient partout', () => {
    const g = fenetreDerouleur(0);
    expect(g.largeur).toBe(geometrieFenetre(FENETRES[FENETRES.length - 1]).largeur);
    expect(g.largeur).toBeLessThanOrEqual(330);
  });
});


/* ─────────────────────────────────────────────────────────────────────────
   7bis. LE REPÈRE DU LABORATOIRE DE MODÉLISATION, balayé
   ───────────────────────────────────────────────────────────────────────── */

describe('le repère du ModeleLab — balayé, jamais échantillonné', () => {
  const { MARGE, L_TRACE, H_TRACE, W, H, echelle, graduations } = GEOM_MODELE;

  it('TOUT réglage atteignable garde la courbe DANS le cadre', () => {
    // Le défaut visé : un élève qui monte le sommet trop haut verrait sa
    // courbe sortir par le haut. L'échelle est donc DÉRIVÉE du réglage le
    // plus ample, et l'on balaye tous les couples (A ; P).
    for (const s of SITUATIONS) {
      const e = echelle(s);
      for (const A of e.crans.filter((v) => v <= e.aMax)) {
        for (const P of CRANS_PERIODE) {
          const f = modele({ ...s.reglages, A, P });
          for (let i = 0; i <= 300; i += 1) {
            const t = (s.tMax * i) / 300;
            const y = e.toY(f(t));
            expect(y, `${s.id} A=${A} P=${P} t=${t}`).toBeGreaterThanOrEqual(MARGE.h - 1e-6);
            expect(y).toBeLessThanOrEqual(MARGE.h + H_TRACE + 1e-6);
            const x = e.toX(t);
            expect(x).toBeGreaterThanOrEqual(MARGE.g - 1e-6);
            expect(x).toBeLessThanOrEqual(W - MARGE.d + 1e-6);
          }
        }
      }
    }
  });

  it('LA POIGNÉE — le sommet — est toujours DANS le cadre, à tout réglage', () => {
    for (const s of SITUATIONS) {
      const e = echelle(s);
      for (const A of e.crans.filter((v) => v <= e.aMax)) {
        const sy = e.toY(s.reglages.m + A);
        const sx = e.toX(s.reglages.d);
        expect(sy, `${s.id} A=${A}`).toBeGreaterThanOrEqual(MARGE.h);
        expect(sy).toBeLessThanOrEqual(MARGE.h + H_TRACE);
        expect(sx).toBeGreaterThanOrEqual(MARGE.g);
        expect(sx).toBeLessThanOrEqual(W - MARGE.d);
      }
    }
  });

  it('la CIBLE de chaque situation est un réglage atteignable dans le cadre', () => {
    for (const s of SITUATIONS) {
      const e = echelle(s);
      expect(Math.abs(s.reglages.A), `${s.id}`).toBeLessThanOrEqual(e.aMax);
      expect(cransAmplitudeDe(s)).toContain(Math.abs(s.reglages.A));
      expect(CRANS_PERIODE).toContain(s.reglages.P);
    }
  });

  it('deux réglages d’amplitude voisins donnent des poignées DISTINCTES', () => {
    for (const s of SITUATIONS) {
      const e = echelle(s);
      const permis = e.crans.filter((v) => v <= e.aMax);
      for (let i = 0; i < permis.length - 1; i += 1) {
        const y1 = e.toY(s.reglages.m + permis[i]);
        const y2 = e.toY(s.reglages.m + permis[i + 1]);
        expect(Math.abs(y1 - y2), `${s.id} ${permis[i]}/${permis[i + 1]}`).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('les graduations d’abscisse ne se chevauchent pas — largeur mesurée', () => {
    const largeur = (v) => String(fr(v, 0)).length * 6;
    for (const s of SITUATIONS) {
      const e = echelle(s);
      const gs = graduations(s.tMax, s.reglages.P / 2);
      for (let i = 0; i < gs.length - 1; i += 1) {
        const d1 = largeur(gs[i]) / 2;
        const d2 = largeur(gs[i + 1]) / 2;
        expect(e.toX(gs[i]) + d1 + 2, `${s.id} : ${gs[i]}/${gs[i + 1]}`).toBeLessThan(e.toX(gs[i + 1]) - d2);
      }
      // Et aucune n'entre dans la gouttière des ordonnées.
      for (const g of gs.slice(1)) {
        expect(e.toX(g) - largeur(g) / 2).toBeGreaterThan(MARGE.g - 8);
      }
    }
  });

  it('les graduations d’ordonnée tiennent dans leur gouttière', () => {
    for (const s of SITUATIONS) {
      const e = echelle(s);
      const pas = e.yHaut > 30 ? 10 : e.yHaut > 12 ? 5 : 2;
      for (const v of graduations(e.yHaut, pas)) {
        const larg = String(fr(v, 0)).length * 6;
        expect(MARGE.g - 6 - larg, `${s.id} : ${v}`).toBeGreaterThanOrEqual(0);
        const y = e.toY(v);
        expect(y).toBeGreaterThanOrEqual(MARGE.h - 1e-6);
        expect(y).toBeLessThanOrEqual(MARGE.h + H_TRACE + 1e-6);
      }
    }
  });

  it('toX et deX, toY et deY sont réciproques', () => {
    for (const s of SITUATIONS) {
      const e = echelle(s);
      for (let i = 0; i <= 20; i += 1) {
        const t = (s.tMax * i) / 20;
        expect(e.deX(e.toX(t))).toBeCloseTo(t, 9);
        const v = (e.yHaut * i) / 20;
        expect(e.deY(e.toY(v))).toBeCloseTo(v, 9);
      }
    }
  });

  it('le SOMMET SUIVANT (en d + P) est visible pour la cible de chaque situation', () => {
    // Sinon on demanderait de lire la période « d'un sommet au sommet suivant »
    // alors que le suivant ne serait pas dessiné : consigne infaisable.
    for (const s of SITUATIONS) {
      expect(s.reglages.d + s.reglages.P, `${s.id}`).toBeLessThanOrEqual(s.tMax);
    }
  });
});

/* ─────────────────────────────────────────────────────────────────────────
   8. parseSigned — le vrai signe moins que la leçon AFFICHE
   ───────────────────────────────────────────────────────────────────────── */

describe('parseSigned — le vrai signe moins U+2212', () => {
  const parse = parseSigned(parseDec);

  it('accepte le moins typographique que parseDec refuse', () => {
    expect(parseDec('−0,5')).toBeNaN();
    expect(parse('−0,5')).toBe(-0.5);
  });

  it('accepte aussi le tiret demi-cadratin et le cadratin', () => {
    expect(parse('–2')).toBe(-2);
    expect(parse('—3,5')).toBe(-3.5);
  });

  it('n’abîme pas les cas ordinaires', () => {
    expect(parse('4')).toBe(4);
    expect(parse('-1,5')).toBe(-1.5);
    expect(parse('0')).toBe(0);
  });

  it('relit TOUT ce que la leçon peut AFFICHER, tel qu’affiché', () => {
    for (const k of CRANS_K) expect(parse(fr(k, 2))).toBeCloseTo(Number(k.toFixed(2)), 9);
    for (const s of SITUATIONS) {
      const l = lectureAttendue(s);
      for (const v of [l.max, l.min, l.amplitude, l.moyenne, l.periode]) {
        expect(parse(fr(v, 1))).toBeCloseTo(Number(v.toFixed(1)), 9);
      }
    }
  });
});


/* ─────────────────────────────────────────────────────────────────────────
   9bis. LES AFFIRMATIONS DES MODULES, vérifiées une à une
   ───────────────────────────────────────────────────────────────────────── */

describe('les nombres que les MODULES affichent sont ceux du modèle', () => {
  it('module 2 — l’écart d’une même branche vaut 2π, et c’est bien « 2 » qu’on saisit', () => {
    // Le module demande « cet écart vaut … × π » et attend 2.
    expect(ECART_FAMILLE / Math.PI).toBe(2);
    expect(labelPi(TAU)).toBe('2π');
  });

  it('module 2 — la solution principale de cos x = 1/2 s’écrit π/3, pas 1,05', () => {
    const a = solutionPrincipaleCos(0.5);
    expect(labelPi(a)).toBe('π/3');
    expect(labelPi(-a)).toBe('−π/3');
    // Et les deux branches citées existent bien dans la famille.
    const f = familleSolutions(COS, 0.5);
    expect(labelPi(f.base[0])).toBe('π/3');
    expect(labelPi(f.base[1])).toBe('−π/3');
    // Les réels cités dans l'explication du piège sont écrivables.
    for (const t of [f.base[1], f.base[0] + TAU, f.base[1] + TAU]) {
      expect(labelPi(t), `${t}`).not.toBeNull();
    }
  });

  it('module 3 — les deux solutions d’un tour, pour k = 1/2, sont celles que le texte cite', () => {
    const tourCos = solutionsDansFenetre(COS, 0.5, 0, TAU - 1e-9);
    const tourSin = solutionsDansFenetre(SIN, 0.5, 0, TAU - 1e-9);
    expect(tourCos).toHaveLength(2);
    expect(tourSin).toHaveLength(2);
    expect(tourCos.map(labelPi)).toEqual(['π/3', '5π/3']);
    expect(tourSin.map(labelPi)).toEqual(['π/6', '5π/6']);
    // Les DEUX sommes de contrôle affichées par le module.
    expect(labelPi(tourCos[0] + tourCos[1])).toBe('2π');
    expect(labelPi(tourSin[0] + tourSin[1])).toBe('π');
  });

  it('module 3 — la famille du sinus pour √3/2 est bien π/3 et 2π/3 (option juste du boss)', () => {
    const f = familleSolutions(SIN, Math.sqrt(3) / 2);
    expect(labelPi(f.base[0])).toBe('π/3');
    expect(labelPi(f.base[1])).toBe('2π/3');
    // Et le distracteur −π/3 ne l'est PAS : sin(−π/3) est l'opposé.
    expect(sinExact(-Math.PI / 3)).toBeCloseTo(-Math.sqrt(3) / 2, 12);
  });

  it('module 4 — les bornes et la longueur de l’arc de cos x ⩾ 1/2 sont celles annoncées', () => {
    const bornes = solutionsDansFenetre(COS, 0.5, 0, TAU - 1e-9);
    expect(bornes.map(labelPi)).toEqual(['π/3', '5π/3']);
    const m = mesureArcs(arcsSolution(COS, 0.5, '>='));
    expect(labelPi(m)).toBe('2π/3');
    // Le module demande « … × π » au CENTIÈME : la réponse attendue est 0,67.
    expect(Number((m / Math.PI).toFixed(2))).toBe(0.67);
  });

  it('module 4 — l’arc de cos x ⩽ 1/2 est bien celui du MILIEU, en un seul morceau', () => {
    // C'est l'option juste de l'épreuve te-e7 du boss.
    const arcs = arcsSolution(COS, 0.5, '<=');
    expect(arcs).toHaveLength(1);
    expect(labelPi(arcs[0].de)).toBe('π/3');
    expect(labelPi(arcs[0].a)).toBe('5π/3');
    // Et il contient bien π : « l'arc qui entoure π ».
    expect(Math.PI).toBeGreaterThan(arcs[0].de);
    expect(Math.PI).toBeLessThan(arcs[0].a);
  });

  it('module 4 — le TABLEAU des deux autres inéquations est entièrement écrivable en π', () => {
    // Le module affiche, pour I2 et I3, leurs bornes et la longueur de leur arc.
    // Si l'une n'était pas un multiple de π/12, la cellule afficherait un
    // décimal au milieu d'un tableau écrit en π — la figure se contredirait.
    for (const ineq of INEQUATIONS.slice(1)) {
      const fn = fnDe(ineq.fn);
      const bornes = solutionsDansFenetre(fn, ineq.k, 0, TAU - 1e-9);
      expect(bornes.length, `${ineq.id} : deux bornes attendues`).toBe(2);
      for (const b of bornes) expect(labelPi(b), `${ineq.id} borne ${b}`).not.toBeNull();
      const m = mesureArcs(arcsSolution(fn, ineq.k, ineq.sens));
      expect(labelPi(m), `${ineq.id} mesure ${m}`).not.toBeNull();
    }
  });

  it('module 4 — les deux sens sont complémentaires à TOUTE hauteur du cliquet', () => {
    // Le module l'affiche : « les deux ensemble font un tour entier ».
    for (const k of CRANS_K.filter((v) => Math.abs(v) < 1)) {
      const h = mesureArcs(arcsSolution(COS, k, '>='));
      const b = mesureArcs(arcsSolution(COS, k, '<='));
      expect(h + b, `k=${k}`).toBeCloseTo(TAU, 9);
    }
  });

  it('module 5 — le tableau des trois écritures ne montre AUCUN écart, aux réels affichés', () => {
    // Le module affiche 5 colonnes : REMARQUABLES aux indices 0, 2, 3, 4, 6.
    for (const i of [0, 2, 3, 4, 6]) {
      const a = REMARQUABLES[i].t;
      const ref = cos2aDepuisAddition(a);
      for (const forme of FORMES_COS2A) {
        // C'est le TEXTE AFFICHÉ, arrondi au centième, qui doit coïncider :
        // deux lignes du tableau qui différeraient d'un centième feraient
        // mentir la figure.
        expect(fr(forme.f(a), 2), `${forme.id} en ${REMARQUABLES[i].label}`).toBe(fr(ref, 2));
      }
    }
  });

  it('module 5 — la troisième cible confirme, et son 2a est écrivable', () => {
    // Le feedback de l'étape 3 cite cos(2π/3) pour a = π/3.
    const d3 = CIBLES_DUPLICATION[2];
    expect(labelPi(d3.t)).toBe('π/3');
    expect(labelPi(2 * d3.t)).toBe('2π/3');
    expect(fr(valeurDuplication(d3), 2)).toBe('−0,50');
    expect(valeurDuplication(d3)).toBeCloseTo(cosExact(2 * d3.t), 12);
  });

  it('module 5 — les valeurs demandées et leurs ARRONDIS au centième sont cohérents', () => {
    for (const c of CIBLES_DUPLICATION) {
      const v = valeurDuplication(c);
      // La réponse attendue est Number(v.toFixed(2)) : elle doit être ATTEINTE
      // exactement par la valeur exacte, sinon l'élève juste serait déclaré faux.
      expect(Math.abs(Number(v.toFixed(2)) - v), `${c.id}`).toBeLessThan(1e-9);
      expect(labelPi(2 * c.t), `${c.id}`).not.toBeNull();
    }
  });

  it('module 5 — les carrés cités dans l’explication sont EXACTS, pas des arrondis', () => {
    // Le piège de l'arrondi : « 0,87² − 0,50² » ferait 0,5069, pas 0,5. Le
    // module cite donc (√3/2)² = 3/4 et (1/2)² = 1/4. On le vérifie.
    const a = CIBLES_DUPLICATION[0].t;
    expect(cosExact(a) ** 2).toBeCloseTo(0.75, 15);
    expect(sinExact(a) ** 2).toBeCloseTo(0.25, 15);
    expect(cosExact(a) ** 2 - sinExact(a) ** 2).toBeCloseTo(0.5, 15);
    const b = CIBLES_DUPLICATION[1].t;
    expect(sinExact(b) * cosExact(b)).toBeCloseTo(0.5, 15);
  });

  it('module 5 — le contre-exemple est CELUI que la brique écrit : π/3, −0,50 contre 1,00', () => {
    // La brique `regle-cos-2a-nest-pas-2cos-a` de knowledge.jsx cite ces trois
    // valeurs en toutes lettres. Le modèle les CHERCHE ; si la recherche
    // changeait de réponse, ce test le dirait avant l'élève.
    const ce = contreExempleLineaire(0.5);
    expect(ce.label).toBe('π/3');
    expect(fr(ce.vrai, 2)).toBe('−0,50');
    expect(fr(ce.faux, 2)).toBe('1,00');
  });

  it('module 5 — le contre-exemple affiché a deux valeurs de SIGNES OPPOSÉS', () => {
    // Le module l'affirme (« elles ne sont même pas du même signe »).
    const ce = contreExempleLineaire(0.5);
    expect(Math.sign(ce.vrai) * Math.sign(ce.faux)).toBeLessThan(0);
    expect(fr(ce.vrai, 2)).not.toBe(fr(ce.faux, 2));
  });

  it('module 6 — chaque nombre affiché dans un feedback est celui du modèle', () => {
    for (const s of SITUATIONS) {
      const l = lectureAttendue(s);
      // Les feedbacks écrivent max, min, moyenne, amplitude, période à l'unité.
      expect(Number(fr(l.max, 0).replace('−', '-'))).toBe(Math.round(l.max));
      expect(Number(fr(l.min, 0).replace('−', '-'))).toBe(Math.round(l.min));
      expect(Math.abs(l.amplitude - Math.round(l.amplitude)), `${s.id}`).toBeLessThan(1e-9);
      expect(Math.abs(l.moyenne - Math.round(l.moyenne)), `${s.id}`).toBeLessThan(1e-9);
    }
  });

  it('module 6 — la roue a bien une amplitude PLUS GRANDE et une période PLUS COURTE que la marée', () => {
    // Le feedback l'affirme : « plus de dix fois plus grande, et pourtant plus courte ».
    const maree = SITUATIONS.find((s) => s.id === 'maree');
    const roue = SITUATIONS.find((s) => s.id === 'roue');
    expect(roue.reglages.A / maree.reglages.A).toBeGreaterThanOrEqual(10);
    expect(roue.reglages.P).toBeLessThan(maree.reglages.P);
  });

  it('module 6 — l’amplitude de la température se lit bien (22 − 10)/2 = 6', () => {
    const t = SITUATIONS.find((s) => s.id === 'temperature');
    const l = lectureAttendue(t);
    expect(l.max).toBeCloseTo(22, 6);
    expect(l.min).toBeCloseTo(10, 6);
    expect(amplitudeLue(22, 10)).toBe(6);
    expect(moyenneLue(22, 10)).toBe(16);
    expect(l.amplitude).toBeCloseTo(Math.abs(t.reglages.A), 6);
  });

  it('BOSS te-e9 — les quatre options sont DISTINCTES et calculées', () => {
    // cos a = 0,6, sin a = 0,8 : cos 2a = 0,36 − 0,64 = −0,28.
    const c = 0.6;
    const si = 0.8;
    // Le couple est cohérent : cos²+sin² = 1.
    expect(c * c + si * si).toBeCloseTo(1, 12);
    const juste = c * c - si * si;
    const piege2cos = 2 * c;          // « cos 2a = 2 cos a »
    const piegeSin2a = 2 * si * c;    // sin 2a confondu avec cos 2a
    const piegeSomme = c + si;        // les deux ajoutés
    expect(juste).toBeCloseTo(-0.28, 12);
    expect(piege2cos).toBeCloseTo(1.2, 12);
    expect(piegeSin2a).toBeCloseTo(0.96, 12);
    expect(piegeSomme).toBeCloseTo(1.4, 12);
    // Toutes distinctes deux à deux, au centième affiché.
    const affichees = [juste, piege2cos, 0.48, piegeSomme].map((v) => v.toFixed(2));
    expect(new Set(affichees).size).toBe(4);
  });

  it('BOSS te-e10 — les quatre options de l’amplitude sont DISTINCTES et plausibles', () => {
    const max = 7;
    const min = 3;
    expect(amplitudeLue(max, min)).toBe(2);       // la bonne réponse
    const options = [amplitudeLue(max, min), max, max - min, 12];
    expect(new Set(options).size).toBe(4);
    // Chaque piège est une erreur RÉELLE : le maximum, l'écart entier, la durée.
    expect(options[1]).toBe(max);
    expect(options[2]).toBe(max - min);
  });

  it('BOSS te-e2 — la hauteur 1,3 de l’énoncé est bien un cran ATTEIGNABLE', () => {
    expect(indexK(1.3)).toBeGreaterThanOrEqual(0);
    expect(familleSolutions(COS, 1.3)).toBeNull();
  });
});

/* ─────────────────────────────────────────────────────────────────────────
   9. PÉRIMÈTRE — ce que cette leçon ne fait PAS
   ───────────────────────────────────────────────────────────────────────── */

describe('PÉRIMÈTRE — la leçon consomme le noyau, elle ne le réécrit pas', () => {
  const source = readFileSync(new URL('./trigEqUtils.js', import.meta.url), 'utf-8');

  it('le modèle IMPORTE le noyau partagé, il n’en recopie pas la table', () => {
    expect(source).toMatch(/from '(\.\.\/)+common\/analysis\/trig'/);
    // Aucune valeur remarquable ressaisie sous forme de littéral décimal long.
    expect(source).not.toMatch(/0\.8660254/);
    expect(source).not.toMatch(/0\.7071067/);
    // REMARQUABLES vient du noyau, jamais d'une table locale.
    expect(source).not.toMatch(/const REMARQUABLES\s*=/);
  });

  it('le modèle n’importe RIEN d’une autre leçon', () => {
    const imports = [...source.matchAll(/from '([^']+)'/g)].map((m) => m[1]);
    for (const i of imports) {
      expect(i.includes('trigonometrie-cercle-fonctions'), `import interdit : ${i}`).toBe(false);
      expect(i.includes('trigonometrie-equations-2nde'), `import interdit : ${i}`).toBe(false);
      expect(i.includes('/lessons/'), `import interdit : ${i}`).toBe(false);
    }
  });

  it('le modèle ne porte NI dérivée NI limite — c’est la Terminale', () => {
    expect(source).not.toMatch(/deriv[ée]e/i);
    expect(source).not.toMatch(/\blimite\b/i);
  });

  it('le noyau REMARQUABLES couvre bien les 24 crans d’un tour', () => {
    expect(REMARQUABLES).toHaveLength(24);
    expect(principal(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2, 12);
  });
});
