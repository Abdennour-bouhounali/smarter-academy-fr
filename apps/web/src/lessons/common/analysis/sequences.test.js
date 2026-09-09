/**
 * Le noyau des suites, vérifié AVANT toute JSX.
 *
 * Ce fichier teste le MODÈLE : la convention d'indexation dans les deux
 * lectures, les cas limites qui font mentir une classification naïve (la suite
 * constante, la raison négative, la raison entre 0 et 1), et le fait
 * mathématique sur lequel repose l'interaction signature de
 * `suites-decouvrir-1ere` (deux machines ne peuvent pas coïncider sur trois
 * termes).
 */
import { describe, it, expect } from 'vitest';
import {
  arithmetic, geometric, terms, nthArithmetic, nthGeometric,
  differences, ratios, detectKind, variationSense, raisonQuiCoincide,
} from './sequences';

describe('convention d’indexation — u0 est le PREMIER terme, partout', () => {
  it('terms(gen, n) rend n + 1 valeurs, et l’indice du tableau EST le rang', () => {
    const t = terms(arithmetic(5, 3), 4);
    expect(t).toHaveLength(5);
    expect(t).toEqual([5, 8, 11, 14, 17]);
    expect(t[0]).toBe(5);      // u0
    expect(t[4]).toBe(17);     // u4
  });

  it('LES DEUX LECTURES EN CROISÉ : terms(...)[k] === nth...(u0, r, k)', () => {
    // C'est le contrôle qui attrape un décalage d'un rang, la faute la plus
    // silencieuse de tout le sujet : une pile affichée avec un terme de trop
    // ou de moins reste plausible à l'œil.
    for (const [u0, r] of [[0, 1], [5, 3], [-2, 4], [7, -1.5], [3.5, 0.25]]) {
      const list = terms(arithmetic(u0, r), 6);
      for (let k = 0; k <= 6; k += 1) expect(list[k]).toBeCloseTo(nthArithmetic(u0, r, k), 12);
    }
    for (const [u0, q] of [[1, 2], [3, 0.5], [2, -1], [5, 1], [-4, 3]]) {
      const list = terms(geometric(u0, q), 6);
      for (let k = 0; k <= 6; k += 1) expect(list[k]).toBeCloseTo(nthGeometric(u0, q, k), 12);
    }
  });

  it('la lecture DÉCALÉE (u1 comme premier terme) reste cohérente si l’on décale explicitement', () => {
    // Une leçon qui indexe à partir de 1 fait .slice(1) ; on vérifie qu'elle
    // obtient bien u1, u2, … et pas un mélange des deux conventions.
    const u0 = 4;
    const r = 3;
    const depuisUn = terms(arithmetic(u0, r), 5).slice(1);
    expect(depuisUn).toEqual([7, 10, 13, 16, 19]);
    for (let k = 0; k < depuisUn.length; k += 1) {
      expect(depuisUn[k]).toBe(nthArithmetic(u0, r, k + 1));
    }
  });

  it('la relation de récurrence est vérifiée terme à terme, pas seulement la formule', () => {
    const a = terms(arithmetic(2, 2), 5);
    for (let k = 1; k < a.length; k += 1) expect(a[k]).toBeCloseTo(a[k - 1] + 2, 12);
    const g = terms(geometric(2, 2), 5);
    for (let k = 1; k < g.length; k += 1) expect(g[k]).toBeCloseTo(g[k - 1] * 2, 12);
  });

  it('rang 0 : terms(gen, 0) rend le seul premier terme', () => {
    expect(terms(arithmetic(9, 7), 0)).toEqual([9]);
    expect(terms(geometric(9, 7), 0)).toEqual([9]);
  });
});

describe('écarts et rapports', () => {
  it('differences rend un tableau plus court d’un élément', () => {
    expect(differences([2, 4, 6, 8])).toEqual([2, 2, 2]);
    expect(differences([2])).toEqual([]);
  });

  it('ratios ne rend jamais Infinity : un terme nul donne NaN', () => {
    // Une Infinity atteindrait le SVG et casserait le tracé.
    const r = ratios([0, 5, 10]);
    expect(Number.isNaN(r[0])).toBe(true);
    expect(r[1]).toBe(2);
  });
});

describe('detectKind — les cas qui font mentir une classification naïve', () => {
  it('reconnaît une suite arithmétique et sa raison', () => {
    expect(detectKind([3, 7, 11, 15])).toEqual({ kind: 'arithmetique', raison: 4 });
  });

  it('reconnaît une suite géométrique et sa raison', () => {
    expect(detectKind([2, 6, 18, 54])).toEqual({ kind: 'geometrique', raison: 3 });
  });

  it('RAISON NÉGATIVE — arithmétique décroissante', () => {
    const d = detectKind([20, 14, 8, 2, -4]);
    expect(d.kind).toBe('arithmetique');
    expect(d.raison).toBeCloseTo(-6, 12);
  });

  it('RAISON NÉGATIVE — géométrique alternée : elle est géométrique, pas « ni »', () => {
    const d = detectKind([3, -6, 12, -24]);
    expect(d.kind).toBe('geometrique');
    expect(d.raison).toBeCloseTo(-2, 12);
    // Et elle n'est monotone dans AUCUN sens.
    expect(variationSense([3, -6, 12, -24]).sens).toBe('ni');
  });

  it('RAISON ENTRE 0 ET 1 — géométrique DÉCROISSANTE, et non « ni »', () => {
    const list = terms(geometric(80, 0.5), 4);
    expect(list).toEqual([80, 40, 20, 10, 5]);
    const d = detectKind(list);
    expect(d.kind).toBe('geometrique');
    expect(d.raison).toBeCloseTo(0.5, 12);
    expect(variationSense(list).sens).toBe('decroissante');
  });

  it('SUITE CONSTANTE : arithmétique de raison 0 — jamais « ni », jamais les deux', () => {
    // Elle est mathématiquement les DEUX (r = 0 et q = 1). L'ordre de décision
    // tranche : un `kind` ambigu obligerait chaque appelant à retrancher ce
    // cas particulier à la main.
    const d = detectKind([7, 7, 7, 7]);
    expect(d.kind).toBe('arithmetique');
    expect(d.raison).toBe(0);
    // La lecture géométrique reste vraie, et le test la nomme :
    expect(ratios([7, 7, 7, 7]).every((x) => x === 1)).toBe(true);
  });

  it('SUITE NULLE : arithmétique de raison 0, sans qu’aucun rapport soit cherché', () => {
    expect(detectKind([0, 0, 0])).toEqual({ kind: 'arithmetique', raison: 0 });
    expect(Number.isNaN(ratios([0, 0, 0])[0])).toBe(true);
  });

  it('une suite qui n’est NI l’une NI l’autre est reconnue comme telle', () => {
    expect(detectKind([1, 4, 9, 16]).kind).toBe('ni');       // les carrés
    expect(detectKind([1, 1, 2, 3, 5, 8]).kind).toBe('ni');  // Fibonacci
    expect(detectKind([2, 4, 8, 15]).kind).toBe('ni');       // presque géométrique
  });

  it('un zéro au milieu interdit la lecture géométrique, sans faire planter', () => {
    const d = detectKind([4, 0, 5]);
    expect(d.kind).toBe('ni');
    expect(d.raison).toBeNull();
  });

  it('deux termes ne suffisent pas à trancher : `indetermine`, pas un faux verdict', () => {
    // Toute paire est à la fois arithmétique et géométrique ; répondre
    // « arithmétique » ici serait un mensonge de la fonction.
    expect(detectKind([2, 4]).kind).toBe('indetermine');
    expect(detectKind([]).kind).toBe('indetermine');
  });

  it('tolère les flottants : 0,1 + 0,2 ne casse pas la reconnaissance', () => {
    const list = terms(arithmetic(0.1, 0.2), 5);
    const d = detectKind(list);
    expect(d.kind).toBe('arithmetique');
    expect(d.raison).toBeCloseTo(0.2, 9);
  });

  it('BALAYAGE : toute suite construite par arithmetic() est classée arithmétique', () => {
    for (let u0 = -5; u0 <= 5; u0 += 1) {
      for (let r = -3; r <= 3; r += 0.5) {
        const d = detectKind(terms(arithmetic(u0, r), 5));
        expect(d.kind).toBe('arithmetique');
        expect(d.raison).toBeCloseTo(r, 9);
      }
    }
  });

  it('BALAYAGE : toute géométrique de raison ≠ 1 et de u0 ≠ 0 est classée géométrique', () => {
    for (const u0 of [-4, -1, 2, 3, 10]) {
      for (const q of [-2, -0.5, 0.25, 0.5, 2, 3]) {
        const d = detectKind(terms(geometric(u0, q), 5));
        expect(d.kind).toBe('geometrique');
        expect(d.raison).toBeCloseTo(q, 9);
      }
    }
  });
});

describe('variationSense', () => {
  it('croissante, décroissante, constante — strictement', () => {
    expect(variationSense([1, 2, 3]).sens).toBe('croissante');
    expect(variationSense([3, 2, 1]).sens).toBe('decroissante');
    expect(variationSense([5, 5, 5]).sens).toBe('constante');
  });

  it('une suite qui monte puis descend n’est monotone dans aucun sens', () => {
    expect(variationSense([1, 5, 2]).sens).toBe('ni');
  });

  it('rend les écarts, c’est-à-dire l’outil de la démonstration', () => {
    expect(variationSense([2, 5, 8]).ecarts).toEqual([3, 3]);
  });

  it('une géométrique de raison 1 est CONSTANTE, pas croissante', () => {
    expect(variationSense(terms(geometric(6, 1), 4)).sens).toBe('constante');
  });

  it('le signe de u0 renverse le sens d’une géométrique de raison > 1', () => {
    // Le piège classique : « q > 1 donc ça monte » est faux si u0 < 0.
    expect(variationSense(terms(geometric(3, 2), 4)).sens).toBe('croissante');
    expect(variationSense(terms(geometric(-3, 2), 4)).sens).toBe('decroissante');
  });

  it('une arithmétique varie dans le sens du SIGNE de sa raison, quel que soit u0', () => {
    for (const u0 of [-10, 0, 7]) {
      expect(variationSense(terms(arithmetic(u0, 2), 4)).sens).toBe('croissante');
      expect(variationSense(terms(arithmetic(u0, -2), 4)).sens).toBe('decroissante');
      expect(variationSense(terms(arithmetic(u0, 0), 4)).sens).toBe('constante');
    }
  });
});

describe('deux machines ne peuvent pas coïncider sur TROIS termes — le fait qui porte le labo', () => {
  it('raisonQuiCoincide fait coïncider les DEUX premiers termes, exactement', () => {
    for (const u0 of [1, 2, 3, 5, 10]) {
      for (const q of [1.5, 2, 3, 0.5]) {
        const r = raisonQuiCoincide(u0, q);
        expect(nthArithmetic(u0, r, 0)).toBeCloseTo(nthGeometric(u0, q, 0), 12);
        expect(nthArithmetic(u0, r, 1)).toBeCloseTo(nthGeometric(u0, q, 1), 12);
      }
    }
  });

  it('BALAYÉ, pas échantillonné : dès que q ≠ 1, le rang 2 DIVERGE toujours', () => {
    // C'est l'affirmation du module 1. Si elle était fausse quelque part, la
    // consigne mentirait. On balaie u0 et q plutôt que d'y croire.
    let testes = 0;
    for (let u0 = 1; u0 <= 10; u0 += 1) {
      for (let q = -3; q <= 4; q += 0.25) {
        if (Math.abs(q - 1) < 1e-9) continue;
        const r = raisonQuiCoincide(u0, q);
        const ecartAuRang2 = Math.abs(nthArithmetic(u0, r, 2) - nthGeometric(u0, q, 2));
        expect(ecartAuRang2).toBeGreaterThan(1e-9);
        testes += 1;
      }
    }
    expect(testes).toBeGreaterThan(200);
  });

  it('AUCUNE raison r ne fait coïncider trois termes, sauf la suite constante', () => {
    // La recherche exhaustive confirme la démonstration : u0(q−1)² = 0.
    for (let u0 = 1; u0 <= 6; u0 += 1) {
      for (let q = -3; q <= 4; q += 0.25) {
        // Le SEUL r qui aligne le rang 1 est u0(q−1) ; on vérifie qu'il rate
        // le rang 2 dès que q ≠ 1, donc qu'aucun autre r ne peut réussir.
        const r = raisonQuiCoincide(u0, q);
        const coincide3 = Math.abs(nthArithmetic(u0, r, 2) - nthGeometric(u0, q, 2)) < 1e-9;
        expect(coincide3).toBe(Math.abs(q - 1) < 1e-9);
      }
    }
  });

  it('la suite constante est le seul cas de coïncidence totale — et elle est plate', () => {
    const u0 = 5;
    const r = raisonQuiCoincide(u0, 1);
    expect(r).toBe(0);
    expect(terms(arithmetic(u0, r), 5)).toEqual(terms(geometric(u0, 1), 5));
    expect(variationSense(terms(arithmetic(u0, r), 5)).sens).toBe('constante');
  });
});
