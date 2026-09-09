import { describe, it, expect } from 'vitest';
import {
  arrondi, fr, vol, aireBaseCarree, aireDisque,
  volumePrisme, volumeCylindre, volumePyramide, volumeCone, versements,
  hauteurDe, areteLaterale, apothemeFace, longueursDe,
  patronPyramide, patronSeReferme, coneParRevolution,
  assertScope4e, DIMENSIONS, PROBLEMES,
  makePyramide, makePrismeCarre,
} from './espace4e';
import * as mod from './espace4e';

/** Toutes les dimensions que l'élève peut atteindre au module 1. */
const DIMS = [];
for (let c = DIMENSIONS.coteMin; c <= DIMENSIONS.coteMax; c += 2) {
  for (let h = DIMENSIONS.hauteurMin; h <= DIMENSIONS.hauteurMax; h += 2) DIMS.push([c, h]);
}

/* ══════════════════════════════════════════════════════════════════════
   LE PÉRIMÈTRE, EN CODE — frontière 4e / 3e
   ══════════════════════════════════════════════════════════════════════ */
describe('Périmètre officiel de 4e — ce que ce noyau ne SAIT PAS faire', () => {
  it('ne sait NI couper un solide NI calculer une sphère (objets de 3e)', () => {
    expect(mod.section).toBeUndefined();
    expect(mod.sectionParUnPlan).toBeUndefined();
    expect(mod.volumeBoule).toBeUndefined();
    expect(mod.volumeSphere).toBeUndefined();
    expect(mod.makeSphere).toBeUndefined();
  });

  it('n’expose AUCUN agrandissement de volume (k³ — objet de 3e)', () => {
    expect(mod.agrandirVolume).toBeUndefined();
    expect(mod.k3).toBeUndefined();
  });

  it('assertScope4e LÈVE sur chacun de ces sujets, avec la raison', () => {
    for (const s of ['section', 'sphere', 'boule', 'agrandissement-volume']) {
      expect(() => assertScope4e(s), s).toThrow(/3e/);
    }
    expect(assertScope4e('pyramide')).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LE TIERS — constaté, pas décrété
   ══════════════════════════════════════════════════════════════════════ */
describe('versements — il en faut EXACTEMENT trois, quelles que soient les dimensions', () => {
  it('le nombre de versements vaut 3 sur TOUT le domaine atteignable', () => {
    for (const [c, h] of DIMS) {
      expect(versements(aireBaseCarree(c), h).nombre, `${c}×${h}`).toBeCloseTo(3, 10);
    }
  });

  it('…y compris sur une base RONDE : le tiers ne dépend pas de la forme', () => {
    for (const r of [1, 2.5, 4, 7.5]) {
      for (const h of [2, 5, 11]) {
        expect(versements(aireDisque(r), h).nombre, `r=${r} h=${h}`).toBeCloseTo(3, 10);
      }
    }
  });

  it('le prisme et la pyramide n’ont PAS le même volume — sinon le module ne montrerait rien', () => {
    for (const [c, h] of DIMS) {
      const v = versements(aireBaseCarree(c), h);
      expect(v.prisme).toBeGreaterThan(v.pyramide);
      expect(v.prisme / 3).toBeCloseTo(v.pyramide, 9);
    }
  });

  it('les volumes sont refusés si une dimension est nulle ou négative', () => {
    expect(() => volumePyramide(0, 5)).toThrow(/aire de base/);
    expect(() => volumePyramide(25, 0)).toThrow(/hauteur/);
    expect(() => volumeCone(-1, 5)).toThrow();
  });

  it('les formules usuelles tombent sur les valeurs attendues', () => {
    expect(volumePrisme(aireBaseCarree(5), 6)).toBe(150);
    expect(volumePyramide(aireBaseCarree(5), 6)).toBe(50);
    expect(volumeCylindre(2, 5)).toBeCloseTo(Math.PI * 20, 9);
    expect(volumeCone(2, 5)).toBeCloseTo((Math.PI * 20) / 3, 9);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LA HAUTEUR N'EST PAS L'ARÊTE — le piège du niveau
   ══════════════════════════════════════════════════════════════════════ */
describe('base, hauteur, arête, apothème : quatre longueurs distinctes', () => {
  it('la hauteur MESURÉE sur le solide est bien celle qu’on a demandée', () => {
    for (const [c, h] of DIMS) {
      expect(hauteurDe(makePyramide(c, h)), `${c}×${h}`).toBeCloseTo(h, 9);
    }
  });

  it('L’ARÊTE LATÉRALE EST TOUJOURS PLUS LONGUE que la hauteur', () => {
    // C'est ce qui rend le piège réfutable par un nombre, sur n'importe quelle
    // pyramide que l'élève peut construire.
    for (const [c, h] of DIMS) {
      const p = makePyramide(c, h);
      expect(areteLaterale(p), `${c}×${h}`).toBeGreaterThan(hauteurDe(p));
    }
  });

  it('l’APOTHÈME est entre la hauteur et l’arête — trois longueurs, jamais deux', () => {
    for (const [c, h] of DIMS) {
      const l = longueursDe(c, h);
      expect(l.hauteur, `${c}×${h}`).toBeLessThan(l.apotheme);
      expect(l.apotheme).toBeLessThan(l.arete);
    }
  });

  it('les trois longueurs sont VISIBLEMENT différentes sur le cas de la leçon', () => {
    const l = longueursDe(8, 6);
    expect(l.hauteur).toBe(6);
    expect(arrondi(l.apotheme, 2)).toBe(7.21);
    expect(arrondi(l.arete, 2)).toBe(8.25);
  });

  it('la base d’une pyramide est un carré plan : ses quatre sommets sont au même niveau', () => {
    for (const [c, h] of DIMS) {
      const base = makePyramide(c, h).vertices.slice(0, 4);
      expect(new Set(base.map((v) => arrondi(v.y, 9))).size, `${c}×${h}`).toBe(1);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LE PATRON
   ══════════════════════════════════════════════════════════════════════ */
describe('patronPyramide — il se déplie sans se chevaucher, et se referme', () => {
  it('les quatre triangles ont pour hauteur l’APOTHÈME, jamais celle de la pyramide', () => {
    for (const [c, h] of DIMS) {
      const p = patronPyramide(c, h);
      expect(p.apotheme, `${c}×${h}`).toBeCloseTo(apothemeFace(c, h), 9);
      expect(p.apotheme).not.toBeCloseTo(h, 3);
    }
  });

  it('chaque triangle a bien pour base un côté du carré', () => {
    const p = patronPyramide(8, 6);
    for (const t of p.triangles) {
      const [A, B] = t.sommets;
      expect(Math.hypot(B.x - A.x, B.y - A.y)).toBeCloseTo(8, 9);
    }
  });

  it('AUCUN triangle ne recouvre la base ni un voisin', () => {
    const dedans = (pt, poly) => {
      let d = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
        const a = poly[i];
        const b = poly[j];
        if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x) d = !d;
      }
      return d;
    };
    for (const [c, h] of DIMS) {
      const p = patronPyramide(c, h);
      const pieces = [{ id: 'base', sommets: p.base }, ...p.triangles];
      for (let i = 0; i < pieces.length; i += 1) {
        const P = pieces[i];
        const g = P.sommets.reduce(
          (acc, s) => ({ x: acc.x + s.x / P.sommets.length, y: acc.y + s.y / P.sommets.length }), { x: 0, y: 0 }
        );
        const ech = [g, ...P.sommets.map((s) => ({ x: g.x + (s.x - g.x) * 0.6, y: g.y + (s.y - g.y) * 0.6 }))];
        for (let j = 0; j < pieces.length; j += 1) {
          if (i === j) continue;
          for (const pt of ech) {
            expect(dedans(pt, pieces[j].sommets), `${c}×${h} : ${P.id} dans ${pieces[j].id}`).toBe(false);
          }
        }
      }
    }
  });

  it('le cadre annoncé contient TOUT le patron — le composant en dérive son viewBox', () => {
    for (const [c, h] of DIMS) {
      const p = patronPyramide(c, h);
      const pts = [...p.base, ...p.triangles.flatMap((t) => t.sommets)];
      for (const s of pts) {
        expect(s.x, `${c}×${h}`).toBeGreaterThanOrEqual(p.cadre.minX - 1e-9);
        expect(s.x).toBeLessThanOrEqual(p.cadre.maxX + 1e-9);
        expect(s.y).toBeGreaterThanOrEqual(p.cadre.minY - 1e-9);
        expect(s.y).toBeLessThanOrEqual(p.cadre.maxY + 1e-9);
      }
    }
  });

  it('patronSeReferme juge par une CONDITION MATHÉMATIQUE, pas à l’œil', () => {
    expect(patronSeReferme(8, 6, apothemeFace(8, 6))).toBe(true);
    expect(patronSeReferme(8, 6, 6)).toBe(false);   // on a pris la hauteur
    expect(patronSeReferme(8, 6, 8.25)).toBe(false); // on a pris l'arête
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LE CÔNE PAR RÉVOLUTION
   ══════════════════════════════════════════════════════════════════════ */
describe('coneParRevolution', () => {
  it('le côté vertical devient la hauteur, l’autre le rayon', () => {
    const c = coneParRevolution(3, 4);
    expect(c.rayon).toBe(3);
    expect(c.hauteur).toBe(4);
    expect(c.generatrice).toBe(5);
  });

  it('son volume est le tiers du cylindre de même base et hauteur', () => {
    for (const r of [1, 2.5, 6]) {
      for (const h of [3, 7, 12]) {
        expect(coneParRevolution(r, h).volume).toBeCloseTo(volumeCylindre(r, h) / 3, 9);
      }
    }
  });

  it('refuse des dimensions nulles', () => {
    expect(() => coneParRevolution(0, 4)).toThrow();
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LES PROBLÈMES DE LA LEÇON
   ══════════════════════════════════════════════════════════════════════ */
describe('Les trois problèmes du module 6 démontrent ce qu’ils annoncent', () => {
  it('chaque problème a une réponse calculée, et un piège DIFFÉRENT d’elle', () => {
    for (const p of PROBLEMES) {
      const bon = p.calcul();
      const piege = p.piege();
      expect(Number.isFinite(bon), p.id).toBe(true);
      expect(arrondi(bon, 3), p.id).not.toBe(arrondi(piege, 3));
    }
  });

  it('la tente : 3 m de côté, 2,4 m de haut → 7,2 m³ (et 21,6 si l’on oublie le tiers)', () => {
    const t = PROBLEMES.find((p) => p.id === 'tente');
    expect(arrondi(t.calcul(), 2)).toBe(7.2);
    expect(arrondi(t.piege(), 2)).toBe(21.6);
  });

  it('le cornet : rayon 3, hauteur 12 → environ 113 cm³', () => {
    const c = PROBLEMES.find((p) => p.id === 'cornet');
    expect(Math.round(c.calcul())).toBe(113);
    expect(Math.round(c.piege())).toBe(339);
  });

  it('le toit : DOUBLER la hauteur double le volume, il ne le quadruple pas', () => {
    const t = PROBLEMES.find((p) => p.id === 'toit');
    expect(t.calcul()).toBeCloseTo(2, 9);
    expect(t.piege()).toBe(4);
  });
});

describe('Les écritures', () => {
  it('un volume porte toujours son unité au cube', () => {
    expect(vol(7.2, 'm')).toBe('7,2 m³');
    expect(vol(113.1, 'cm', 0)).toBe('113 cm³');
  });

  it('fr utilise la virgule décimale', () => {
    expect(fr(2.5)).toBe('2,5');
  });
});
