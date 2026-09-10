/**
 * Le noyau trigonométrique, vérifié AVANT toute JSX.
 *
 * Ce fichier teste le MODÈLE, et surtout les trois choses dont la leçon
 * « du cercle à la courbe » dépend pour ne pas mentir :
 *   1. les valeurs affichées aux points remarquables sont EXACTES, pas
 *      « arrondies à » (sin(π/6) doit être 0.5 au bit près) ;
 *   2. le cliquet de π/12 ATTEINT chaque cible pédagogique — π/6, π/4, π/3,
 *      π/2, π, 2π — depuis 0, en un nombre entier de crans, dans les deux sens ;
 *   3. les intervalles de variation sont MESURÉS sur la fonction, pas recopiés.
 */
import { describe, it, expect } from 'vitest';
import {
  TAU, PAS, REMARQUABLES, principal, tours, remarquableDe,
  sinExact, cosExact, pointOf, variationsSin, variationsCos,
  estPaire, estImpaire, estPeriodique, echantillonner, labelPi, texPi, fr,
} from './trig';

describe('principal — l’enroulement ramène dans [0 ; 2π[', () => {
  it('laisse en place ce qui est déjà dans [0 ; 2π[', () => {
    for (const t of [0, 0.5, Math.PI, 4, TAU - 1e-9]) {
      expect(principal(t)).toBeCloseTo(t, 12);
    }
  });

  it('ramène les réels au-delà d’un tour, et les négatifs', () => {
    expect(principal(TAU)).toBeCloseTo(0, 12);
    expect(principal(TAU + Math.PI / 3)).toBeCloseTo(Math.PI / 3, 12);
    expect(principal(3 * TAU + 1)).toBeCloseTo(1, 12);
    expect(principal(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2, 12);
    expect(principal(-TAU)).toBeCloseTo(0, 12);
    expect(principal(-TAU - 1)).toBeCloseTo(TAU - 1, 12);
  });

  it('le résultat est TOUJOURS dans [0 ; 2π[, y compris loin en négatif', () => {
    for (let t = -20; t <= 20; t += 0.137) {
      const p = principal(t);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThan(TAU);
    }
  });

  it('t = principal(t) + tours(t) × 2π, exactement', () => {
    for (const t of [-13.7, -TAU, -1, 0, 1, TAU, 19.4]) {
      expect(principal(t) + tours(t) * TAU).toBeCloseTo(t, 10);
    }
  });
});

describe('REMARQUABLES — la table est EXACTE, et complète', () => {
  it('24 crans, un par π/12, en ordre strictement croissant', () => {
    expect(REMARQUABLES).toHaveLength(24);
    for (let i = 0; i < 24; i += 1) {
      expect(REMARQUABLES[i].k).toBe(i);
      expect(REMARQUABLES[i].t).toBeCloseTo(i * PAS, 12);
      if (i > 0) expect(REMARQUABLES[i].t).toBeGreaterThan(REMARQUABLES[i - 1].t);
    }
  });

  it('chaque couple (cos ; sin) est sur le cercle de rayon 1', () => {
    for (const r of REMARQUABLES) {
      expect(r.cos * r.cos + r.sin * r.sin).toBeCloseTo(1, 12);
    }
  });

  it('la table N’EST PAS Math.cos/Math.sin : elle les corrige', () => {
    // Le cœur du contrat. Si ces assertions tombent, l'élève voit
    // 0,49999999999999994 au lieu de 0,5.
    expect(sinExact(Math.PI / 6)).toBe(0.5);
    expect(Math.sin(Math.PI / 6)).not.toBe(0.5);
    expect(cosExact(Math.PI / 3)).toBe(0.5);
    expect(cosExact(Math.PI / 2)).toBe(0);
    expect(Math.cos(Math.PI / 2)).not.toBe(0);
    expect(sinExact(Math.PI)).toBe(0);
    expect(Math.sin(Math.PI)).not.toBe(0);
    expect(cosExact(Math.PI)).toBe(-1);
    expect(sinExact((3 * Math.PI) / 2)).toBe(-1);
    expect(cosExact((3 * Math.PI) / 2)).toBe(0);
    expect(sinExact(TAU)).toBe(0);
    expect(cosExact(TAU)).toBe(1);
  });

  it('l’exactitude tient aussi HORS du premier tour et en négatif', () => {
    // Le module 1 dépasse 2π et va en négatif : l'exactitude doit y survivre.
    expect(sinExact(TAU + Math.PI / 6)).toBe(0.5);
    expect(sinExact(-Math.PI / 6)).toBe(-0.5);
    expect(cosExact(-Math.PI / 3)).toBe(0.5);
    expect(sinExact(3 * TAU + Math.PI / 2)).toBe(1);
    expect(cosExact(-TAU - Math.PI)).toBe(-1);
    expect(sinExact(-2 * TAU)).toBe(0);
  });

  it('hors des crans, on retombe sur Math.sin / Math.cos', () => {
    for (const t of [0.37, 1.13, -2.02, 9.5]) {
      expect(sinExact(t)).toBe(Math.sin(t));
      expect(cosExact(t)).toBe(Math.cos(t));
    }
  });

  it('les valeurs exactes coïncident avec Math.sin/cos à 1e-12 près', () => {
    // L'exactitude ne doit pas être une FAUSSE valeur : la table dit la même
    // chose que la trigonométrie, en mieux écrit.
    for (const r of REMARQUABLES) {
      expect(r.cos).toBeCloseTo(Math.cos(r.t), 12);
      expect(r.sin).toBeCloseTo(Math.sin(r.t), 12);
    }
  });

  it('remarquableDe reconnaît un cran, et refuse ce qui n’en est pas un', () => {
    expect(remarquableDe(Math.PI / 4)?.label).toBe('π/4');
    expect(remarquableDe(TAU + Math.PI / 4)?.label).toBe('π/4');
    expect(remarquableDe(-Math.PI / 4)?.label).toBe('7π/4');
    expect(remarquableDe(Math.PI / 8)).toBeNull();
    expect(remarquableDe(1)).toBeNull();
  });
});

describe('CIBLE ATTEIGNABLE — le cliquet de π/12 atteint toutes les cibles', () => {
  const CIBLES = [
    ['π/6', Math.PI / 6, 2],
    ['π/4', Math.PI / 4, 3],
    ['π/3', Math.PI / 3, 4],
    ['π/2', Math.PI / 2, 6],
    ['2π/3', (2 * Math.PI) / 3, 8],
    ['3π/4', (3 * Math.PI) / 4, 9],
    ['5π/6', (5 * Math.PI) / 6, 10],
    ['π', Math.PI, 12],
    ['3π/2', (3 * Math.PI) / 2, 18],
    ['2π', TAU, 24],
  ];

  it.each(CIBLES)('%s tombe exactement sur le cran n° %s… (depuis 0, en avançant)', (label, cible, crans) => {
    // On CUMULE le pas, comme le fait la manipulation : c'est le cumul qui
    // dérive, pas la multiplication.
    let t = 0;
    for (let i = 0; i < crans; i += 1) t += PAS;
    expect(t).toBeCloseTo(cible, 12);
    expect(labelPi(t)).toBe(labelPi(cible));
  });

  it.each(CIBLES)('−%s est atteignable en reculant, avec la valeur exacte', (label, cible, crans) => {
    let t = 0;
    for (let i = 0; i < crans; i += 1) t -= PAS;
    expect(t).toBeCloseTo(-cible, 12);
    // Et la valeur y reste exacte, ce qui est le vrai enjeu du module 1.
    const r = remarquableDe(t);
    expect(r).not.toBeNull();
  });

  it('π/8 n’est PAS atteignable — et c’est assumé (hors programme)', () => {
    expect(remarquableDe(Math.PI / 8)).toBeNull();
  });

  it('le cumul de 48 crans (deux tours) ne dérive pas', () => {
    let t = 0;
    for (let i = 0; i < 48; i += 1) t += PAS;
    expect(t).toBeCloseTo(2 * TAU, 10);
    expect(sinExact(t)).toBe(0);
    expect(cosExact(t)).toBe(1);
  });

  it('à CHAQUE cran de −3 tours à +3 tours, la valeur est exacte', () => {
    // Balayage complet, pas un échantillon : le module 1 laisse l'élève
    // parcourir toute la plage.
    for (let n = -72; n <= 72; n += 1) {
      const t = n * PAS;
      const r = remarquableDe(t);
      expect(r, `cran ${n}`).not.toBeNull();
      expect(sinExact(t)).toBe(r.sin);
      expect(cosExact(t)).toBe(r.cos);
      // Aucune valeur affichée ne peut être un 0,49999999999999994.
      expect(Math.abs(sinExact(t))).toBeLessThanOrEqual(1);
      expect(Math.abs(cosExact(t))).toBeLessThanOrEqual(1);
    }
  });
});

describe('parité — le constat numérique que la leçon fait faire', () => {
  it('cosinus est PAIRE, sinus est IMPAIRE', () => {
    expect(estPaire(cosExact)).toBe(true);
    expect(estImpaire(cosExact)).toBe(false);
    expect(estImpaire(sinExact)).toBe(true);
    expect(estPaire(sinExact)).toBe(false);
  });

  it('le test refuse une fonction ni paire ni impaire', () => {
    const g = (x) => Math.sin(x) + 1;
    expect(estPaire(g)).toBe(false);
    expect(estImpaire(g)).toBe(false);
  });

  it('la parité tient AUSSI aux points remarquables, exactement', () => {
    // C'est ce que l'élève lit dans le tableau du module 3 : deux colonnes
    // rigoureusement opposées, pas « presque ».
    // `+ 0` normalise le zéro négatif : −0 est un zéro, et `fr` l'écrit « 0,00 »
    // (vérifié plus bas). C'est une convention d'égalité, pas une tolérance.
    for (let n = 1; n <= 24; n += 1) {
      const t = n * PAS;
      expect(cosExact(-t) + 0).toBe(cosExact(t) + 0);
      expect(sinExact(-t) + 0).toBe(-sinExact(t) + 0);
    }
  });

  it('AUCUNE valeur affichable n’est un zéro négatif après formatage', () => {
    // Le piège : sin(−π) vaut −0. Écrit tel quel, l'élève lirait « −0 ».
    for (let n = -48; n <= 48; n += 1) {
      const t = n * PAS;
      expect(fr(sinExact(t))).not.toContain('−0,00');
      expect(fr(cosExact(t))).not.toContain('−0,00');
    }
  });
});

describe('périodicité — 2π, et pas moins', () => {
  it('sin et cos sont 2π-périodiques', () => {
    expect(estPeriodique(sinExact, TAU)).toBe(true);
    expect(estPeriodique(cosExact, TAU)).toBe(true);
    expect(estPeriodique(sinExact, 2 * TAU)).toBe(true);
  });

  it('π n’est PAS une période — le distracteur classique est faux', () => {
    expect(estPeriodique(sinExact, Math.PI)).toBe(false);
    expect(estPeriodique(cosExact, Math.PI)).toBe(false);
    expect(estPeriodique(sinExact, Math.PI / 2)).toBe(false);
  });

  it('un tour de plus rend le MÊME point du cercle', () => {
    for (let n = 0; n < 24; n += 1) {
      const t = n * PAS;
      expect(pointOf(t + TAU)).toEqual(pointOf(t));
      expect(pointOf(t - TAU)).toEqual(pointOf(t));
    }
  });
});

describe('variations — MESURÉES sur la fonction, jamais recopiées', () => {
  it('sinus sur [0 ; 2π] : monte, descend, remonte', () => {
    const v = variationsSin(0, TAU);
    expect(v).toHaveLength(3);
    expect(v.map((s) => s.sens)).toEqual(['croissante', 'decroissante', 'croissante']);
    expect(v[0].from).toBeCloseTo(0, 12);
    expect(v[0].to).toBeCloseTo(Math.PI / 2, 12);
    expect(v[1].to).toBeCloseTo((3 * Math.PI) / 2, 12);
    expect(v[2].to).toBeCloseTo(TAU, 12);
  });

  it('cosinus sur [0 ; 2π] : descend puis remonte, deux morceaux seulement', () => {
    const v = variationsCos(0, TAU);
    expect(v).toHaveLength(2);
    expect(v.map((s) => s.sens)).toEqual(['decroissante', 'croissante']);
    expect(v[0].to).toBeCloseTo(Math.PI, 12);
  });

  it('les bornes annoncées sont bien celles où la fonction retourne', () => {
    // Contrôle croisé : sur chaque morceau, f doit vraiment varier dans le
    // sens annoncé d'un bout à l'autre.
    for (const [f, v] of [[sinExact, variationsSin(-TAU, TAU)], [cosExact, variationsCos(-TAU, TAU)]]) {
      for (const s of v) {
        const g = f(s.from);
        const d = f(s.to);
        if (s.sens === 'croissante') expect(d).toBeGreaterThan(g);
        else expect(d).toBeLessThan(g);
      }
      // Les morceaux pavent l'intervalle sans trou ni recouvrement.
      for (let i = 1; i < v.length; i += 1) expect(v[i].from).toBeCloseTo(v[i - 1].to, 12);
      expect(v[0].from).toBeCloseTo(-TAU, 12);
      expect(v[v.length - 1].to).toBeCloseTo(TAU, 12);
    }
  });

  it('un intervalle vide ou renversé ne produit aucun morceau', () => {
    expect(variationsSin(1, 1)).toEqual([]);
    expect(variationsCos(2, 1)).toEqual([]);
  });

  it('un intervalle plus court qu’un demi-tour reste d’un seul tenant', () => {
    const v = variationsSin(0.1, 1.2);
    expect(v).toHaveLength(1);
    expect(v[0].sens).toBe('croissante');
  });
});

describe('échantillonnage et écritures', () => {
  it('echantillonner rend n + 1 points, du premier au dernier', () => {
    const pts = echantillonner(sinExact, 0, TAU, 12);
    expect(pts).toHaveLength(13);
    expect(pts[0].x).toBeCloseTo(0, 12);
    expect(pts[12].x).toBeCloseTo(TAU, 12);
    expect(pts.every((p) => Math.abs(p.y) <= 1)).toBe(true);
  });

  it('labelPi écrit les multiples de π/12 en français, réduits', () => {
    expect(labelPi(0)).toBe('0');
    expect(labelPi(Math.PI / 12)).toBe('π/12');
    expect(labelPi(Math.PI / 6)).toBe('π/6');
    expect(labelPi(Math.PI / 4)).toBe('π/4');
    expect(labelPi(Math.PI / 2)).toBe('π/2');
    expect(labelPi(Math.PI)).toBe('π');
    expect(labelPi(TAU)).toBe('2π');
    expect(labelPi((3 * Math.PI) / 2)).toBe('3π/2');
    expect(labelPi(-Math.PI / 3)).toBe('−π/3');
    expect(labelPi(-TAU)).toBe('−2π');
    expect(labelPi(1)).toBeNull();
  });

  it('texPi rend du KaTeX pour les mêmes valeurs', () => {
    expect(texPi(0)).toBe('0');
    expect(texPi(Math.PI)).toBe('\\pi');
    expect(texPi(Math.PI / 6)).toBe('\\dfrac{\\pi}{6}');
    expect(texPi((3 * Math.PI) / 4)).toBe('\\dfrac{3\\pi}{4}');
    expect(texPi(1)).toBeNull();
  });

  it('fr n’écrit jamais « −0,00 » et emploie le vrai signe moins', () => {
    expect(fr(0.5)).toBe('0,50');
    expect(fr(-0.5)).toBe('−0,50');
    expect(fr(-1e-18)).toBe('0,00');
    expect(fr(0)).toBe('0,00');
    expect(fr(-0.866, 3)).toBe('−0,866');
  });
});
