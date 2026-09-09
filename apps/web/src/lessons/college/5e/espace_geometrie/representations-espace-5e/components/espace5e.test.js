import { describe, it, expect } from 'vitest';
import {
  solide, volume, cylindre, diametre, perimetreBase, bandeDuCylindre,
  verifierBande, patronCylindreOk, prismeDroit, perimetrePrisme, facesDuPrisme,
  verifierPatronPrisme, raisonPatron, BOITE_CHOCOLATS, BOITE_THE, SOLIDES_5E, fmtLong,
} from './espace5e';
import { SOLIDS, projectCavaliere, projectOrtho, visibleEdges, rotateSolid } from '../../../../../common/utils/geometry3d';

/* ── Le périmètre est exécutable ─────────────────────────────────────── */

describe('périmètre — ce que la 5e ne traite pas', () => {
  it('REFUSE la sphère et la boule (exclusion explicite du référentiel)', () => {
    expect(() => solide('sphere')).toThrow(/hors périmètre/);
    expect(() => solide('boule')).toThrow(/hors périmètre/);
  });

  it('REFUSE la pyramide et le cône (objets de 4e)', () => {
    expect(() => solide('pyramide')).toThrow(/4e/);
    expect(() => solide('cone')).toThrow(/4e/);
  });

  it('REFUSE le volume (objet de 4e)', () => {
    expect(() => volume()).toThrow(/hors périmètre/);
    expect(() => volume()).toThrow(/4e/);
  });

  it('accepte les solides de la leçon', () => {
    expect(solide({ type: 'cylindre', rayon: 3, hauteur: 5 }).type).toBe('cylindre');
    expect(solide({ type: 'prisme', base: [4, 4, 4], hauteur: 6 }).type).toBe('prisme');
  });
});

/* ── Le cylindre ─────────────────────────────────────────────────────── */

describe('cylindre', () => {
  it('refuse des grandeurs non positives', () => {
    expect(() => cylindre({ rayon: 0, hauteur: 5 })).toThrow();
    expect(() => cylindre({ rayon: 3, hauteur: -1 })).toThrow();
  });

  it('n’est pas un polyèdre, et porte les comptes du collège', () => {
    const c = cylindre({ rayon: 3, hauteur: 5 });
    expect(c.polyedre).toBe(false);
    expect(c).toMatchObject({ faces: 3, aretes: 2, sommets: 0 });
  });

  it('n’a ni sommets ni arêtes à nommer (on ne lui invente pas de maillage)', () => {
    const c = cylindre({ rayon: 3, hauteur: 5 });
    expect(c.vertices).toBeUndefined();
    expect(c.edges).toBeUndefined();
  });
});

describe('la bande du cylindre — le cœur de la leçon', () => {
  const c = cylindre({ rayon: 4, hauteur: 11 });

  it('a pour longueur le PÉRIMÈTRE de la base, pas le diamètre', () => {
    const b = bandeDuCylindre(c);
    expect(b.longueur).toBeCloseTo(2 * Math.PI * 4, 10);
    expect(b.longueur).not.toBeCloseTo(diametre(c), 1);
  });

  it('a pour hauteur celle du cylindre', () => {
    expect(bandeDuCylindre(c).hauteur).toBe(11);
  });

  it('le périmètre vaut environ 3,14 fois le diamètre', () => {
    expect(perimetreBase(c) / diametre(c)).toBeCloseTo(Math.PI, 10);
  });

  it('accepte la bonne longueur', () => {
    expect(patronCylindreOk(perimetreBase(c), c)).toBe(true);
  });

  it('REFUSE le diamètre — le piège que le module 5 rend visible', () => {
    const v = verifierBande(diametre(c), c);
    expect(v.ok).toBe(false);
    expect(v.raison).toBe('trop-courte');
  });

  it('distingue « trop courte » de « trop longue »', () => {
    expect(verifierBande(perimetreBase(c) - 2, c).raison).toBe('trop-courte');
    expect(verifierBande(perimetreBase(c) + 2, c).raison).toBe('trop-longue');
  });

  it('donne une explication française à chaque refus', () => {
    for (const r of ['trop-courte', 'trop-longue']) {
      expect(raisonPatron(r)).not.toBe('');
    }
  });

  it('la tolérance reste plus fine que le pas de réglage', () => {
    // Sinon deux crans voisins seraient tous deux « justes ».
    expect(patronCylindreOk(perimetreBase(c) + 0.25, c, 0.05)).toBe(false);
  });

  it('ATTEIGNABILITÉ (§10.6) : la bonne longueur EXISTE sur la grille du lab', () => {
    // Le défaut réel attrapé par l'e2e : au pas de 0,5, le cran le plus proche
    // du périmètre (25,13) est 25,0 — à 0,133 de la cible, donc HORS tolérance.
    // La manipulation était littéralement impossible à réussir. Ce test fixe le
    // pas du lab comme un contrat, pour toutes les boîtes de la leçon.
    const STEP = 0.1;
    const TOL = 0.05;
    for (const solide of [BOITE_THE, cylindre({ rayon: 3, hauteur: 8 }), cylindre({ rayon: 5, hauteur: 12 })]) {
      const exact = perimetreBase(solide);
      const cran = Math.round(exact / STEP) * STEP;
      expect(
        patronCylindreOk(cran, solide, TOL),
        `r=${solide.rayon} : le cran ${cran.toFixed(2)} n'atteint pas ${exact.toFixed(3)}`,
      ).toBe(true);
    }
  });
});

/* ── Le prisme droit ─────────────────────────────────────────────────── */

describe('prisme droit', () => {
  it('refuse une base qui n’est pas un polygone', () => {
    expect(() => prismeDroit({ base: [3, 4], hauteur: 5 })).toThrow();
    expect(() => prismeDroit({ base: [3, 4, 5], hauteur: 0 })).toThrow();
  });

  it('compte ses faces, arêtes et sommets depuis le modèle', () => {
    const p = prismeDroit({ base: [3, 4, 5], hauteur: 10 });
    expect(p).toMatchObject({ faces: 5, aretes: 9, sommets: 6 });
  });

  it('vérifie la relation d’Euler sans qu’on l’enseigne (garde de cohérence)', () => {
    for (const n of [3, 4, 5, 6]) {
      const p = prismeDroit({ base: Array(n).fill(4), hauteur: 7 });
      expect(p.faces + p.sommets - p.aretes).toBe(2);
    }
  });

  it('se déplie en 2 bases plus un rectangle par côté', () => {
    const p = prismeDroit({ base: [6, 6, 6], hauteur: 12 });
    const f = facesDuPrisme(p);
    expect(f.filter((x) => x.role === 'base')).toHaveLength(2);
    expect(f.filter((x) => x.role === 'flanc')).toHaveLength(3);
    expect(f).toHaveLength(p.faces);
  });

  it('chaque flanc a pour hauteur celle du prisme', () => {
    const p = prismeDroit({ base: [6, 8, 10], hauteur: 12 });
    for (const f of facesDuPrisme(p).filter((x) => x.role === 'flanc')) {
      expect(f.hauteur).toBe(12);
    }
  });

  it('la bande dépliée a pour longueur le périmètre de la base', () => {
    const p = prismeDroit({ base: [6, 8, 10], hauteur: 12 });
    const largeurTotale = facesDuPrisme(p)
      .filter((x) => x.role === 'flanc')
      .reduce((s, f) => s + f.largeur, 0);
    expect(largeurTotale).toBe(perimetrePrisme(p));
  });
});

describe('vérification d’un patron de prisme', () => {
  const p = BOITE_CHOCOLATS;  // base triangulaire
  const flancs = [1, 2, 3].map(() => ({ role: 'flanc' }));

  it('accepte un patron correct : deux bases opposées et tous les flancs', () => {
    const pieces = [
      { role: 'base', cote: 'haut' }, { role: 'base', cote: 'bas' }, ...flancs,
    ];
    expect(verifierPatronPrisme(pieces, p).ok).toBe(true);
  });

  it('REFUSE deux bases du même côté — l’erreur classique', () => {
    const pieces = [
      { role: 'base', cote: 'haut' }, { role: 'base', cote: 'haut' }, ...flancs,
    ];
    const v = verifierPatronPrisme(pieces, p);
    expect(v.ok).toBe(false);
    expect(v.raison).toBe('bases-du-meme-cote');
  });

  it('REFUSE un patron auquel il manque une base', () => {
    expect(verifierPatronPrisme([{ role: 'base', cote: 'haut' }, ...flancs], p).raison)
      .toBe('base-manquante');
  });

  it('REFUSE un patron auquel il manque un flanc', () => {
    const pieces = [
      { role: 'base', cote: 'haut' }, { role: 'base', cote: 'bas' }, { role: 'flanc' }, { role: 'flanc' },
    ];
    expect(verifierPatronPrisme(pieces, p).raison).toBe('flanc-manquant');
  });

  it('donne une explication française à chaque refus', () => {
    for (const r of ['base-manquante', 'trop-de-bases', 'flanc-manquant', 'trop-de-flancs', 'bases-du-meme-cote']) {
      expect(raisonPatron(r)).not.toBe('');
    }
  });
});

/* ── L'accord avec le module 3D partagé ──────────────────────────────── */

describe('perspective cavalière — la convention du collège', () => {
  it('dessine la face avant en VRAIE GRANDEUR', () => {
    // Deux points de la face avant (z identique) : leur écart projeté doit
    // valoir exactement leur écart réel — c'est la règle de la convention.
    const a = projectCavaliere({ x: 0, y: 0, z: 50 });
    const b = projectCavaliere({ x: 30, y: 0, z: 50 });
    expect(b.x - a.x).toBeCloseTo(30, 10);
  });

  it('réduit la profondeur du coefficient k', () => {
    const avant = projectCavaliere({ x: 0, y: 0, z: 0 });
    const arriere = projectCavaliere({ x: 0, y: 0, z: 100 });
    const d = Math.hypot(arriere.x - avant.x, arriere.y - avant.y);
    expect(d).toBeCloseTo(0.5 * 100, 10);
  });

  it('les trois vues sont bien trois projections distinctes', () => {
    const p = { x: 10, y: 20, z: 30 };
    const vues = ['face', 'dessus', 'cote'].map((v) => projectOrtho(p, v));
    const cles = new Set(vues.map((q) => `${q.x},${q.y}`));
    expect(cles.size).toBe(3);
  });

  it('refuse une vue inconnue au lieu de dessiner n’importe quoi', () => {
    expect(() => projectOrtho({ x: 0, y: 0, z: 0 }, 'derriere')).toThrow(/vue inconnue/);
  });
});

describe('arêtes cachées du prisme — calculées, jamais dessinées à la main', () => {
  it('un prisme vu de face cache au moins une arête', () => {
    const { visible, hidden } = visibleEdges(SOLIDS.prisme);
    expect(visible.length + hidden.length).toBe(SOLIDS.prisme.edges.length);
    expect(hidden.length).toBeGreaterThan(0);
  });

  it('tourner le solide change ce qui est caché', () => {
    const cache = (yaw) => visibleEdges(rotateSolid(SOLIDS.prisme, { yaw })).hidden.length;
    const valeurs = new Set([0, 60, 120, 180].map(cache));
    expect(valeurs.size).toBeGreaterThan(1);
  });
});

/* ── Les données de la leçon ─────────────────────────────────────────── */

describe('données de l’atelier d’emballage', () => {
  it('la boîte de chocolats est un prisme droit à base triangulaire', () => {
    expect(BOITE_CHOCOLATS.type).toBe('prisme');
    expect(BOITE_CHOCOLATS.base).toHaveLength(3);
  });

  it('la boîte de thé est un cylindre', () => {
    expect(BOITE_THE.type).toBe('cylindre');
  });

  it('aucun solide de la leçon n’est hors programme', () => {
    for (const s of SOLIDES_5E) {
      expect(['prisme', 'cylindre']).toContain(s.type);
    }
  });

  it('toutes les dimensions sont strictement positives', () => {
    expect(BOITE_THE.rayon).toBeGreaterThan(0);
    expect(BOITE_THE.hauteur).toBeGreaterThan(0);
    expect(BOITE_CHOCOLATS.hauteur).toBeGreaterThan(0);
    for (const c of BOITE_CHOCOLATS.base) expect(c).toBeGreaterThan(0);
  });

  it('écrit les longueurs à la française', () => {
    expect(fmtLong(25.132741)).toBe('25,1');
    expect(fmtLong(12)).toBe('12');
  });
});
