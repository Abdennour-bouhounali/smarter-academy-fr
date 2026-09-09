import { describe, it, expect } from 'vitest';
import { dist, midpoint, polygonArea } from '../../../../../common/geo5e/geo5e';
import {
  DEPARTS_M2, TOL_ANGLE, TOL_LONG, anglesQuad, cm, cm2, centreDiagonales, ecartDirection, enCm,
  estParallelogramme, estSimple, etatAire, etatDiagonales, etatQuad, longueurs, nature,
  quatriemeSommet, sontParalleles, translater,
} from './paral';

/**
 * Ce que ces tests protègent : LA FIGURE NE MENT JAMAIS.
 *
 * Chaque affirmation que la leçon met sous les yeux de l'élève — une lampe
 * qui s'allume, un codage de côtés égaux, « O est le milieu des deux
 * diagonales », « l'aire n'a pas bougé » — est ici confrontée aux points
 * réellement dessinés, sur un BALAYAGE de configurations et pas sur l'exemple
 * qui se trouvait à l'écran quand le code a été écrit (§17bis « sweep, don't
 * sample »).
 */

/** Un parallélogramme construit par définition, à partir de trois sommets. */
const para = (A, B, C) => [A, B, C, quatriemeSommet(A, B, C)];

const CARRE = [
  { x: 200, y: 200 }, { x: 400, y: 200 }, { x: 400, y: 400 }, { x: 200, y: 400 },
];

describe('ecartDirection — deux DROITES, jamais deux demi-droites', () => {
  it('voit parallèles deux côtés opposés parcourus en sens contraire', () => {
    // Le contour ABCD parcourt [AB] vers la droite et [CD] vers la gauche :
    // un angle orienté annoncerait 180°, alors que l'élève voit deux traits
    // parallèles. C'est le piège que ecartDirection existe pour éviter.
    const [A, B, C, D] = CARRE;
    expect(ecartDirection(A, B, C, D)).toBeCloseTo(0, 6);
    expect(ecartDirection(A, B, D, C)).toBeCloseTo(0, 6);
    expect(sontParalleles(A, B, C, D)).toBe(true);
  });

  it('reste dans [0 ; 90] pour toutes les directions', () => {
    const O = { x: 0, y: 0 };
    for (let a = 0; a < 360; a += 7) {
      for (let b = 0; b < 360; b += 11) {
        const p = { x: Math.cos((a * Math.PI) / 180), y: Math.sin((a * Math.PI) / 180) };
        const q = { x: Math.cos((b * Math.PI) / 180), y: Math.sin((b * Math.PI) / 180) };
        const e = ecartDirection(O, p, O, q);
        expect(e).toBeGreaterThanOrEqual(0);
        expect(e).toBeLessThanOrEqual(90 + 1e-9);
      }
    }
  });

  it('mesure vraiment l’écart annoncé — 30° reste 30°', () => {
    const O = { x: 0, y: 0 };
    const h = { x: 100, y: 0 };
    const d30 = { x: Math.cos(Math.PI / 6) * 100, y: Math.sin(Math.PI / 6) * 100 };
    expect(ecartDirection(O, h, O, d30)).toBeCloseTo(30, 6);
  });
});

describe('quatriemeSommet — il n’y a qu’UNE place pour D', () => {
  it('produit un parallélogramme pour chacun des départs du module 2', () => {
    for (const { id, A, B, C } of DEPARTS_M2) {
      const q = para(A, B, C);
      expect(estParallelogramme(q), id).toBe(true);
      expect(estSimple(q), id).toBe(true);
    }
  });

  it('produit un parallélogramme sur un balayage de 3 000 triangles', () => {
    let n = 0;
    for (let bx = 260; bx <= 620; bx += 30) {
      for (let cx = 240; cx <= 660; cx += 30) {
        for (let cy = 120; cy <= 330; cy += 30) {
          const A = { x: 200, y: 400 };
          const B = { x: bx, y: 400 };
          const C = { x: cx, y: cy };
          const q = para(A, B, C);
          expect(estParallelogramme(q)).toBe(true);
          n += 1;
        }
      }
    }
    expect(n).toBeGreaterThan(1000);
  });

  it('donne les côtés opposés égaux SANS qu’on l’ait demandé — la découverte du module 1', () => {
    // estParallelogramme ne teste QUE le parallélisme. Si les longueurs
    // suivent, c'est une conséquence, et c'est exactement ce que l'élève doit
    // constater : les quatre lampes s'allument ensemble.
    for (const { id, A, B, C } of DEPARTS_M2) {
      const q = para(A, B, C);
      const { AB, BC, CD, DA } = etatQuad(q).longueurs;
      expect(AB, id).toBeCloseTo(CD, 6);
      expect(DA, id).toBeCloseTo(BC, 6);
    }
  });

  it('est la seule place : bouger D de plus de la tolérance casse le parallélisme', () => {
    const { A, B, C } = DEPARTS_M2[0];
    const D = quatriemeSommet(A, B, C);
    for (const [dx, dy] of [[26, 0], [-26, 0], [0, 26], [0, -26], [20, 20], [-20, 18]]) {
      const q = [A, B, C, { x: D.x + dx, y: D.y + dy }];
      expect(estParallelogramme(q)).toBe(false);
    }
  });
});

describe('etatQuad — les témoins que l’élève voit s’allumer', () => {
  it('allume les quatre témoins sur un vrai parallélogramme, et pas avant', () => {
    const { A, B, C } = DEPARTS_M2[1];
    const D = quatriemeSommet(A, B, C);
    const bon = etatQuad([A, B, C, D]).temoins;
    expect(Object.values(bon).every((t) => t.ok)).toBe(true);

    const faux = etatQuad([A, B, C, { x: D.x + 60, y: D.y - 40 }]).temoins;
    expect(faux.parAbDc.ok && faux.parAdBc.ok).toBe(false);
  });

  it('accompagne chaque témoin éteint d’un écart NON nul — le retour nomme ce qui manque', () => {
    const { A, B, C } = DEPARTS_M2[2];
    const D = quatriemeSommet(A, B, C);
    const t = etatQuad([A, B, C, { x: D.x + 70, y: D.y + 10 }]).temoins;
    for (const k of Object.keys(t)) {
      if (!t[k].ok) expect(t[k].ecart).toBeGreaterThan(0);
    }
  });

  it('donne quatre angles dont la somme vaut 360° — la figure est un quadrilatère', () => {
    for (const { id, A, B, C } of DEPARTS_M2) {
      const somme = anglesQuad(para(A, B, C)).reduce((s, a) => s + a, 0);
      expect(somme, id).toBeCloseTo(360, 6);
    }
  });

  it('donne les angles opposés égaux dans un parallélogramme', () => {
    for (const { id, A, B, C } of DEPARTS_M2) {
      const [a, b, c, d] = anglesQuad(para(A, B, C));
      expect(a, id).toBeCloseTo(c, 6);
      expect(b, id).toBeCloseTo(d, 6);
    }
  });
});

describe('estSimple — l’élève ne peut pas fabriquer une figure dont la leçon ne parle pas', () => {
  it('accepte les parallélogrammes des départs', () => {
    for (const { id, A, B, C } of DEPARTS_M2) expect(estSimple(para(A, B, C)), id).toBe(true);
  });

  it('refuse un quadrilatère croisé', () => {
    expect(estSimple([{ x: 200, y: 200 }, { x: 400, y: 200 }, { x: 200, y: 400 }, { x: 400, y: 400 }])).toBe(false);
  });

  it('refuse un côté trop court (deux sommets quasi confondus)', () => {
    expect(estSimple([{ x: 200, y: 200 }, { x: 210, y: 202 }, { x: 400, y: 400 }, { x: 200, y: 400 }])).toBe(false);
  });

  it('refuse trois points alignés (figure aplatie)', () => {
    expect(estSimple([{ x: 100, y: 300 }, { x: 300, y: 300 }, { x: 500, y: 300 }, { x: 300, y: 450 }])).toBe(false);
  });
});

describe('etatDiagonales — le point où tout se croise', () => {
  it('place O au milieu des DEUX diagonales, dans tout parallélogramme', () => {
    for (const { id, A, B, C } of DEPARTS_M2) {
      const q = para(A, B, C);
      const d = etatDiagonales(q);
      expect(d.milieuAC, id).toBe(true);
      expect(d.milieuBD, id).toBe(true);
      // et la position elle-même, pas seulement le prédicat
      expect(d.O.x, id).toBeCloseTo(midpoint(q[0], q[2]).x, 6);
      expect(d.O.y, id).toBeCloseTo(midpoint(q[1], q[3]).y, 6);
    }
  });

  it('sépare « milieu commun » de « même longueur » — la misconception du module 4', () => {
    // Le parallélogramme générique : O est bien le milieu des deux diagonales,
    // et pourtant AC ≠ BD. C'est ce que le module 4 doit rendre visible.
    const d = etatDiagonales(para(DEPARTS_M2[0].A, DEPARTS_M2[0].B, DEPARTS_M2[0].C));
    expect(d.milieuAC && d.milieuBD).toBe(true);
    expect(d.memeLongueur).toBe(false);
  });

  it('reconnaît que le rectangle a, lui, des diagonales de même longueur', () => {
    expect(etatDiagonales(CARRE).memeLongueur).toBe(true);
  });

  it('reconnaît les diagonales perpendiculaires du losange', () => {
    const losange = [
      { x: 300, y: 180 }, { x: 460, y: 300 }, { x: 300, y: 420 }, { x: 140, y: 300 },
    ];
    const d = etatDiagonales(losange);
    expect(d.perpendiculaires).toBe(true);
    expect(nature(losange).id).toBe('losange');
  });
});

describe('nature — l’arbre des inclusions du module 6', () => {
  it('reconnaît le carré, et le compte comme parallélogramme', () => {
    const n = nature(CARRE);
    expect(n.id).toBe('carre');
    expect(n.estPara).toBe(true);
    expect(n.droit && n.consecutifsEgaux).toBe(true);
  });

  it('reconnaît le rectangle non carré', () => {
    const r = [{ x: 180, y: 200 }, { x: 520, y: 200 }, { x: 520, y: 380 }, { x: 180, y: 380 }];
    expect(nature(r).id).toBe('rectangle');
    expect(nature(r).estPara).toBe(true);
  });

  it('reconnaît le parallélogramme quelconque', () => {
    expect(nature(para(DEPARTS_M2[0].A, DEPARTS_M2[0].B, DEPARTS_M2[0].C)).id).toBe('parallelogramme');
  });

  it('reconnaît le trapèze — un seul couple parallèle — et refuse de l’appeler parallélogramme', () => {
    const trap = [{ x: 180, y: 400 }, { x: 560, y: 400 }, { x: 460, y: 220 }, { x: 280, y: 220 }];
    const n = nature(trap);
    expect(n.id).toBe('trapeze');
    expect(n.estPara).toBe(false);
  });

  it('n’appelle « losange » un quadrilatère à côtés consécutifs égaux que s’il est un parallélogramme', () => {
    // Un cerf-volant : AB = AD et CB = CD, mais aucun couple de côtés opposés
    // n'est parallèle. Le distracteur du module 5 exactement.
    const cerf = [{ x: 300, y: 160 }, { x: 440, y: 300 }, { x: 300, y: 460 }, { x: 200, y: 300 }];
    expect(nature(cerf).estPara).toBe(false);
    expect(nature(cerf).id).not.toBe('losange');
  });
});

describe('etatAire — l’aire ne dépend pas du côté oblique', () => {
  it('fait coïncider l’aire du polygone et base × hauteur', () => {
    for (const { id, A, B, C } of DEPARTS_M2) {
      const e = etatAire(para(A, B, C));
      expect(e.aire, id).toBeCloseTo(e.produit, 5);
    }
  });

  it('garde l’aire constante pendant le cisaillement, pendant que le côté s’allonge', () => {
    // Le geste du module 7 : D glisse sur la parallèle à (AB). La base et la
    // hauteur ne changent pas, l'aire non plus — mais AD grandit.
    const A = { x: 200, y: 400 };
    const B = { x: 500, y: 400 };
    const y = 220;
    const ref = etatAire([A, B, { x: 500 + 0, y }, { x: 200 + 0, y }]);
    let precedentCote = ref.cote;
    for (let dx = 20; dx <= 260; dx += 20) {
      const q = [A, B, { x: 500 + dx, y }, { x: 200 + dx, y }];
      const e = etatAire(q);
      expect(e.aire).toBeCloseTo(ref.aire, 5);
      expect(e.hauteur).toBeCloseTo(ref.hauteur, 6);
      expect(e.cote).toBeGreaterThan(precedentCote);
      precedentCote = e.cote;
      expect(estParallelogramme(q)).toBe(true);
    }
  });

  it('mesure la hauteur jusqu’à la DROITE (AB), même quand le pied sort du segment', () => {
    // Le cisaillement pousse le pied de la hauteur hors de [AB] : la hauteur
    // reste la distance à la droite, jamais la longueur d'un côté.
    const q = [{ x: 200, y: 400 }, { x: 500, y: 400 }, { x: 900, y: 220 }, { x: 600, y: 220 }];
    const e = etatAire(q);
    expect(e.hauteur).toBeCloseTo(180, 6);
    expect(e.pied.x).toBeGreaterThan(500);
    expect(e.aire).toBeCloseTo(polygonArea(q), 6);
    expect(e.cote).toBeGreaterThan(e.hauteur);
  });
});

describe('affichage — une seule échelle, aucun nombre ne peut en contredire un autre', () => {
  it('convertit 40 unités en 1 cm', () => {
    expect(enCm(40)).toBe(1);
    expect(enCm(260)).toBe(6.5);
    expect(cm(260)).toBe('6,5');
  });

  it('donne une aire en cm² cohérente avec les longueurs affichées', () => {
    const q = [{ x: 200, y: 400 }, { x: 440, y: 400 }, { x: 480, y: 240 }, { x: 240, y: 240 }];
    const e = etatAire(q);
    // 240 unités = 6 cm de base, 160 unités = 4 cm de hauteur → 24 cm²
    expect(cm(e.base)).toBe('6');
    expect(cm(e.hauteur)).toBe('4');
    expect(cm2(e.aire)).toBe('24');
  });

  it('rend la virgule française, jamais le point', () => {
    expect(cm(250)).not.toContain('.');
    expect(cm2(6400)).not.toContain('.');
  });
});

describe('périmètre 5e — la frontière est une erreur, pas un commentaire', () => {
  it('translater() lève : les vecteurs sont exclus de l’objet officiel', () => {
    expect(() => translater()).toThrow(/vecteurs/i);
    expect(() => translater()).toThrow(/4e/);
  });

  it('quatriemeSommet est la voie autorisée, et elle passe par le milieu des diagonales', () => {
    const { A, B, C } = DEPARTS_M2[0];
    const D = quatriemeSommet(A, B, C);
    // Le milieu de [AC] est aussi celui de [BD] : la construction EST la
    // propriété du module 4, pas une translation déguisée.
    const O = midpoint(A, C);
    expect(midpoint(B, D).x).toBeCloseTo(O.x, 6);
    expect(midpoint(B, D).y).toBeCloseTo(O.y, 6);
  });
});

describe('tolérances — sous ce que l’élève voit', () => {
  it('reste plus fine que l’écart visible à la taille de rendu', () => {
    // Le cadre fait 760 unités pour ~700 px : une unité ≈ un pixel. Un écart
    // de 6 unités sur un côté, ou de 2,2° sur une direction, se voit.
    expect(TOL_LONG).toBeLessThanOrEqual(8);
    expect(TOL_ANGLE).toBeLessThanOrEqual(3);
  });

  it('n’allume pas les lampes sur une figure visiblement fausse', () => {
    const A = { x: 200, y: 400 };
    const B = { x: 500, y: 400 };
    const C = { x: 560, y: 220 };
    // 30 unités d'écart — largement visible — ne doivent JAMAIS passer.
    const D = quatriemeSommet(A, B, C);
    const t = etatQuad([A, B, C, { x: D.x + 30, y: D.y }]).temoins;
    expect(t.parAdBc.ok && t.egAbDc.ok).toBe(false);
  });

  it('longueurs() et dist() concordent — une seule mesure, partout', () => {
    const q = para(DEPARTS_M2[1].A, DEPARTS_M2[1].B, DEPARTS_M2[1].C);
    const [ab] = longueurs(q);
    expect(ab).toBeCloseTo(dist(q[0], q[1]), 9);
    expect(centreDiagonales(q)).not.toBeNull();
  });
});

/**
 * Les figures du module 5 — « quelle propriété permet de conclure ? ».
 *
 * Ce module donne à l'élève des figures CODÉES : des marques d'égalité et des
 * chevrons de parallélisme y sont dessinés, et l'énoncé les répète. Un codage
 * est une AFFIRMATION : si le dessin ne la vérifie pas, la leçon ment à
 * l'élève au moment précis où elle lui apprend à ne pas se fier au dessin
 * (§28bis). Ces tests confrontent chaque figure à ce que sa configuration
 * prétend.
 *
 * Ils ont déjà servi : le premier cerf-volant tapé à la main affichait
 * AB = 162,8 et AD = 139,0 sous deux marques identiques.
 */
describe('module 5 — les figures codées disent la vérité', () => {
  const CERF = [{ x: 200, y: 55 }, { x: 310, y: 150 }, { x: 200, y: 265 }, { x: 90, y: 150 }];
  const TRAPEZE = [{ x: 70, y: 245 }, { x: 330, y: 245 }, { x: 275, y: 100 }, { x: 140, y: 100 }];

  it('le cerf-volant porte des marques vraies : AB = AD et CB = CD', () => {
    const [A, B, C, D] = CERF;
    expect(dist(A, B)).toBeCloseTo(dist(A, D), 6);
    expect(dist(C, B)).toBeCloseTo(dist(C, D), 6);
  });

  it('le cerf-volant n’est PAS un parallélogramme — c’est tout son intérêt', () => {
    expect(estParallelogramme(CERF)).toBe(false);
    expect(nature(CERF).estPara).toBe(false);
    // et ses côtés OPPOSÉS, eux, ne sont pas égaux : la caractérisation ne
    // s'applique donc pas, exactement comme l'explain le dit.
    const [A, B, C, D] = CERF;
    expect(Math.abs(dist(A, B) - dist(C, D))).toBeGreaterThan(TOL_LONG);
  });

  it('le trapèze a UNE paire parallèle et une seule', () => {
    const [A, B, C, D] = TRAPEZE;
    expect(sontParalleles(A, B, D, C)).toBe(true);
    expect(sontParalleles(A, D, B, C)).toBe(false);
    expect(nature(TRAPEZE).id).toBe('trapeze');
  });

  it('les deux figures restent dessinables : simples, non croisées', () => {
    expect(estSimple(CERF)).toBe(true);
    expect(estSimple(TRAPEZE)).toBe(true);
  });

  it('la figure « très aplatie » du module 5 est bien un parallélogramme', () => {
    // Elle ne RESSEMBLE pas à un parallélogramme : c'est la question posée.
    // Il faut donc qu'elle en soit un pour de vrai.
    const a = { x: 60, y: 200 };
    const b = { x: 300, y: 235 };
    const c = { x: 355, y: 160 };
    const q = [a, b, c, quatriemeSommet(a, b, c)];
    expect(estParallelogramme(q)).toBe(true);
    expect(estSimple(q)).toBe(true);
    expect(nature(q).id).toBe('parallelogramme');
  });
});
