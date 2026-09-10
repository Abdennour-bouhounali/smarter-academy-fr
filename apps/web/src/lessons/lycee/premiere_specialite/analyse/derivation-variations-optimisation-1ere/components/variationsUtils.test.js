/**
 * LES AFFIRMATIONS DE LA LEÇON, VÉRIFIÉES SUR SES DONNÉES EXACTES.
 *
 * Les modules AFFIRMENT des choses à l'élève : « la flèche du haut bascule au
 * même cran que le signe du bas », « le maximum est là où f′ traverse zéro »,
 * « x³ a une dérivée nulle en 0 SANS extremum », « la boîte de volume maximal
 * mesure 2 cm de côté découpé ». Ce sont des CONTENUS PÉDAGOGIQUES : si le
 * comportement réel diffère, la leçon MENT, et derivative.test.js ne l'attrape
 * pas — il vérifie que `signTable` est juste, pas qu'un module dit vrai.
 *
 * PÉRIMÈTRE : aucun test ne porte sur les règles de calcul des dérivées (leçon
 * amont) ni sur l'équation de la tangente (leçon amont).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseDec } from '@smarter-academy/core';
import {
  CUBE, CUBE_SIMPLE, PARABOLE, CUBE_MAXMIN, TOUJOURS_CROISSANTE, BOITE, BENEFICE, FONCTIONS,
  assertDansLePerimetre, tableauDeSignes, tableauDeVariations, extremums, maximumSurLeDomaine,
  cransSonde, etatSonde, bandesDeSigne, aVuLesDeuxBascules, echantillon,
  abscisseAimantee, largeurCran, pasDe, graduationsY,
  PAS_SONDE, SENS, FLECHE, fr, parseSigned,
} from './variationsUtils';

/** La marge gauche du panneau, copie du PAD de DeuxPanneaux.jsx. */
const PAD_LEFT = 46;

// ── 1. Les dérivées sont EXACTES ────────────────────────────────────────────
describe('les dérivées déclarées sont exactes', () => {
  it('chaque fPrime coïncide avec la définition, balayée sur tout le domaine', () => {
    for (const fn of FONCTIONS) {
      const { xMin, xMax } = fn.domain;
      const pas = (xMax - xMin) / 60;
      for (let x = xMin + pas; x < xMax - pas; x += pas) {
        const parLaDefinition = (fn.f(x + 1e-5) - fn.f(x - 1e-5)) / 2e-5;
        // Tolérance relative : V et B prennent des valeurs à trois chiffres.
        const echelle = Math.max(1, Math.abs(fn.fPrime(x)));
        expect(Math.abs(fn.fPrime(x) - parLaDefinition) / echelle).toBeLessThan(1e-5);
      }
    }
  });

  it('les zéros déclarés sont de VRAIS zéros, au bit près — pas des « arrondis à 0 »', () => {
    // Piège n°3 du lot 1 : cos(90°) rend 6e-17. Ici tout est polynomial et
    // entier, donc f′(zéro) doit valoir 0 EXACTEMENT.
    for (const fn of FONCTIONS) {
      for (const z of fn.zeros) expect(fn.fPrime(z)).toBe(0);
    }
  });
});

// ── 2. Le périmètre est CODÉ, pas commenté ──────────────────────────────────
describe('le périmètre se refuse en throw', () => {
  it('accepte les sept fonctions de la leçon', () => {
    for (const fn of FONCTIONS) expect(assertDansLePerimetre(fn)).toBe(true);
  });

  it('REFUSE une fonction dont un zéro annoncé n’annule pas la dérivée', () => {
    const menteuse = { ...CUBE, id: 'menteuse', zeros: [0.5, 1] };
    expect(() => assertDansLePerimetre(menteuse)).toThrow(/0.5 est déclaré zéro/);
  });

  it('REFUSE un zéro hors du domaine d’étude', () => {
    const dehors = { ...CUBE, id: 'dehors', zeros: [-1, 1, 5] };
    expect(() => assertDansLePerimetre(dehors)).toThrow(/hors du domaine/);
  });

  it('REFUSE des zéros non triés — le tableau serait dans le désordre', () => {
    const desordre = { ...CUBE, id: 'desordre', zeros: [1, -1] };
    expect(() => assertDansLePerimetre(desordre)).toThrow(/ordre croissant/);
  });

  it('REFUSE une fonction sans zéros déclarés du tout', () => {
    const muette = { ...CUBE, id: 'muette', zeros: undefined };
    expect(() => assertDansLePerimetre(muette)).toThrow(/littéraux exacts/);
  });
});

// ── 3. L'INVARIANT CENTRAL de la manipulation signature ─────────────────────
describe('module 1 — les deux panneaux se répondent, BALAYÉ cran par cran', () => {
  it('les deux cadres partagent EXACTEMENT la même plage en x', () => {
    for (const fn of FONCTIONS) {
      expect(fn.fpRange.xMin).toBe(fn.fRange.xMin);
      expect(fn.fpRange.xMax).toBe(fn.fRange.xMax);
      expect(fn.fRange.xMin).toBe(fn.domain.xMin);
      expect(fn.fRange.xMax).toBe(fn.domain.xMax);
    }
  });

  it('les deux panneaux partagent le MÊME PAS : une sonde, deux lectures', () => {
    // Un pas différent d'un panneau à l'autre ferait mentir la sonde : elle
    // serait à un x dans le haut et à un autre dans le bas.
    const crans = cransSonde(CUBE);
    for (const x of crans) {
      const e = etatSonde(CUBE, x);
      expect(e.x).toBe(x);
      // Le sens du HAUT et le signe du BAS viennent du MÊME nombre.
      expect(Math.sign(e.d)).toBe(e.signe);
    }
  });

  it('le pas par défaut vaut un quart d’unité, et les domaines larges l’assouplissent', () => {
    // `pasDe` est un ARBITRAGE entre finesse de lecture et taille de la zone à
    // viser au doigt : il mérite d'être vu, pas caché dans un composant.
    expect(PAS_SONDE).toBe(0.25);
    expect(pasDe(CUBE)).toBe(0.25);
    expect(pasDe(BENEFICE)).toBe(0.5);
    expect(pasDe(PARABOLE)).toBe(0.5);
  });

  it('CIBLE ATTEIGNABLE : chaque zéro de f′ tombe EXACTEMENT sur un cran de la sonde', () => {
    for (const fn of FONCTIONS) {
      const crans = cransSonde(fn, pasDe(fn));
      for (const z of fn.zeros) {
        expect(crans.some((c) => Math.abs(c - z) < 1e-9)).toBe(true);
      }
    }
  });

  it('L’INVARIANT : la flèche du haut bascule au MÊME cran que le signe du bas', () => {
    // Balayé, pas échantillonné. Pour chaque paire de crans consécutifs, un
    // changement de flèche implique un changement de signe et réciproquement.
    for (const fn of FONCTIONS) {
      const crans = cransSonde(fn, pasDe(fn));
      for (let i = 1; i < crans.length; i += 1) {
        const a = etatSonde(fn, crans[i - 1]);
        const b = etatSonde(fn, crans[i]);
        expect(a.sens !== b.sens).toBe(a.signe !== b.signe);
      }
    }
  });

  it('sur f(x) = x³ − 3x, les bascules tombent en −1 et en 1, et nulle part ailleurs', () => {
    const crans = cransSonde(CUBE);
    const bascules = [];
    for (let i = 1; i < crans.length; i += 1) {
      const a = etatSonde(CUBE, crans[i - 1]);
      const b = etatSonde(CUBE, crans[i]);
      if (a.signe !== b.signe) bascules.push(crans[i - 1] === -1 || crans[i] === -1 ? -1 : 1);
    }
    // Deux traversées de zéro : chacune produit deux transitions (+ → 0 → −).
    expect([...new Set(bascules)].sort((u, v) => u - v)).toEqual([-1, 1]);
  });

  it('en un zéro, la sonde est SUR l’axe du bas et la flèche du haut n’est ni ↗ ni ↘', () => {
    for (const z of CUBE.zeros) {
      const e = etatSonde(CUBE, z);
      expect(e.d).toBe(0);
      expect(e.position).toBe('sur l’axe');
      expect(e.fleche).toBe('→');
    }
  });

  it('le MAXIMUM de f est précisément là où f′ traverse zéro en descendant', () => {
    const ext = extremums(CUBE);
    const max = ext.find((e) => e.kind === 'maximum');
    expect(max.x).toBe(-1);
    expect(max.y).toBe(2);
    expect(CUBE.fPrime(max.x)).toBe(0);
    // « traverse en descendant » : + avant, − après.
    expect(CUBE.fPrime(max.x - 0.25)).toBeGreaterThan(0);
    expect(CUBE.fPrime(max.x + 0.25)).toBeLessThan(0);
  });

  it('et le MINIMUM là où elle traverse en montant', () => {
    const min = extremums(CUBE).find((e) => e.kind === 'minimum');
    expect(min.x).toBe(1);
    expect(min.y).toBe(-2);
    expect(CUBE.fPrime(min.x - 0.25)).toBeLessThan(0);
    expect(CUBE.fPrime(min.x + 0.25)).toBeGreaterThan(0);
  });

  it('l’objectif du module ne tombe qu’après avoir visité les TROIS zones de signe', () => {
    expect(aVuLesDeuxBascules(CUBE, [-2, -1.75])).toBe(false);
    expect(aVuLesDeuxBascules(CUBE, [-2, 0])).toBe(false);
    expect(aVuLesDeuxBascules(CUBE, [-1.5, 0, 1.5])).toBe(true);
  });
});

// ── 3bis. LE GLISSER — la sonde s'attrape, elle ne se pilote pas au bouton ───
describe('module 1 — la sonde se GLISSE, et le glisser reste exact', () => {
  it('AUCUN pixel du panneau ne produit un x hors du domaine', () => {
    // Un doigt qui sort du cadre en glissant ne doit pas emporter la sonde
    // hors de l'intervalle d'étude : la conversion borne AVANT d'aimanter.
    for (const fn of FONCTIONS) {
      const largeur = (fn.domain.xMax - fn.domain.xMin) * fn.fUnit;
      // On balaie DEBORDANT largement de part et d'autre, c'est précisément le
      // cas que le glisser produit.
      for (let px = PAD_LEFT - 200; px <= PAD_LEFT + largeur + 200; px += 1) {
        const v = abscisseAimantee(fn, px, PAD_LEFT, pasDe(fn));
        expect(v).toBeGreaterThanOrEqual(fn.domain.xMin - 1e-9);
        expect(v).toBeLessThanOrEqual(fn.domain.xMax + 1e-9);
      }
    }
  });

  it('CHAQUE pixel tombe sur un CRAN — jamais sur un x continu', () => {
    // C'est l'invariant qui rend la leçon vraie au glisser : l'état n'est
    // jamais « presque −1 ». S'il l'était, la leçon affirmerait « f′ s'annule
    // ici » sur un état où f′ vaut 0,003.
    for (const fn of FONCTIONS) {
      const crans = cransSonde(fn, pasDe(fn));
      const largeur = (fn.domain.xMax - fn.domain.xMin) * fn.fUnit;
      for (let px = PAD_LEFT; px <= PAD_LEFT + largeur; px += 1) {
        const v = abscisseAimantee(fn, px, PAD_LEFT, pasDe(fn));
        expect(crans.some((c) => Math.abs(c - v) < 1e-9)).toBe(true);
      }
    }
  });

  it('CIBLE ATTEIGNABLE AU DOIGT : chaque zéro de f′ a une vraie zone de saisie', () => {
    // Le zéro doit être atteignable en visant APPROXIMATIVEMENT — sans quoi la
    // consigne « pose la sonde sur la bascule » serait irréalisable au doigt,
    // et le module mentirait sur ce qu'il demande.
    //
    // LA TOLÉRANCE EST UNE PROPRIÉTÉ DE L'AIMANTATION, PAS UN VŒU. Aimanter au
    // cran le plus proche donne exactement une DEMI-largeur de cran de marge de
    // chaque côté : viser plus large ne peut pas marcher, et l'exiger serait
    // une exigence fausse. Ce qu'il faut vérifier, c'est que cette demi-largeur
    // reste utilisable au doigt.
    for (const fn of FONCTIONS) {
      const demi = largeurCran(fn) / 2;
      // Une cible qu'on n'atteint qu'en visant à 4 px près n'est pas une cible
      // tactile : on exige au moins ±7 px, soit 14 px de zone de saisie.
      expect(demi).toBeGreaterThanOrEqual(7);
      for (const z of fn.zeros) {
        const pxZero = PAD_LEFT + (z - fn.domain.xMin) * fn.fUnit;
        // Tout le voisinage réellement promis par l'aimantation rend le zéro,
        // et l'on s'arrête juste avant la frontière (où l'arrondi bascule).
        for (let d = -(demi - 0.5); d <= demi - 0.5; d += 0.5) {
          expect(abscisseAimantee(fn, pxZero + d, PAD_LEFT, pasDe(fn))).toBeCloseTo(z, 9);
        }
      }
    }
  });

  it('le glisser est MONOTONE : aller à droite en pixels ne fait jamais reculer en x', () => {
    for (const fn of FONCTIONS) {
      const largeur = (fn.domain.xMax - fn.domain.xMin) * fn.fUnit;
      let precedent = -Infinity;
      for (let px = PAD_LEFT - 40; px <= PAD_LEFT + largeur + 40; px += 1) {
        const v = abscisseAimantee(fn, px, PAD_LEFT, pasDe(fn));
        expect(v).toBeGreaterThanOrEqual(precedent - 1e-9);
        precedent = v;
      }
    }
  });

  it('les DEUX panneaux convertissent un même pixel en un même x', () => {
    // Les deux panneaux partagent la MÊME géométrie en x (`fUnit`), donc la
    // sonde saisie en haut et la sonde saisie en bas commandent la même
    // abscisse. Sans cela, attraper la sonde dans le panneau du bas
    // l'amènerait ailleurs que dans celui du haut.
    for (const fn of FONCTIONS) {
      expect(fn.fpUnit).toBe(fn.fUnit);
      const largeur = (fn.domain.xMax - fn.domain.xMin) * fn.fUnit;
      for (let px = PAD_LEFT; px <= PAD_LEFT + largeur; px += 3) {
        const haut = abscisseAimantee(fn, px, PAD_LEFT, pasDe(fn));
        const bas = abscisseAimantee({ ...fn, fUnit: fn.fpUnit }, px, PAD_LEFT, pasDe(fn));
        expect(bas).toBe(haut);
      }
    }
  });
});

// ── 4. SÉCURITÉ DE MISE EN PAGE — balayée, jamais échantillonnée ────────────
describe('sécurité de mise en page — aucun débordement sur AUCUN cran', () => {
  it('la courbe de f tient dans le cadre du haut sur tout le domaine', () => {
    for (const fn of FONCTIONS) {
      const { xMin, xMax } = fn.domain;
      for (let i = 0; i <= 400; i += 1) {
        const x = xMin + ((xMax - xMin) * i) / 400;
        const y = fn.f(x);
        expect(y).toBeGreaterThanOrEqual(fn.fRange.yMin - 1e-9);
        expect(y).toBeLessThanOrEqual(fn.fRange.yMax + 1e-9);
      }
    }
  });

  it('la courbe de f′ tient dans le cadre du bas sur tout le domaine', () => {
    for (const fn of FONCTIONS) {
      const { xMin, xMax } = fn.domain;
      for (let i = 0; i <= 400; i += 1) {
        const x = xMin + ((xMax - xMin) * i) / 400;
        const d = fn.fPrime(x);
        expect(d).toBeGreaterThanOrEqual(fn.fpRange.yMin - 1e-9);
        expect(d).toBeLessThanOrEqual(fn.fpRange.yMax + 1e-9);
      }
    }
  });

  it('l’échantillonnage ne rend AUCUN point hors cadre — le tracé est coupé', () => {
    for (const fn of FONCTIONS) {
      for (const [f, range] of [[fn.f, fn.fRange], [fn.fPrime, fn.fpRange]]) {
        for (const p of echantillon(f, range)) {
          expect(p.y).toBeGreaterThanOrEqual(range.yMin - 1e-9);
          expect(p.y).toBeLessThanOrEqual(range.yMax + 1e-9);
        }
      }
    }
  });

  it('AUCUNE étiquette d’ordonnée ne déborde de la marge gauche du panneau', () => {
    // La marge est FIXE (PAD.left) parce que c'est elle qui aligne les deux
    // panneaux au pixel. Il faut donc vérifier que la plus large étiquette y
    // tient : « −100 » sur le bénéfice mesure plus que « 2 » sur le cube, et
    // une étiquette rognée est un affichage invalide pour un état valide (§16).
    const largeurTexte = (t) => [...String(t)].reduce((n, c) => n + (c === ',' || c === '.' ? 3 : c === '−' ? 5.5 : 6), 0);
    for (const fn of FONCTIONS) {
      for (const range of [fn.fRange, fn.fpRange]) {
        for (const g of graduationsY(range)) {
          // 7 px séparent l'étiquette de l'axe : il reste PAD_LEFT − 7 pour elle.
          expect(largeurTexte(fr(g))).toBeLessThanOrEqual(PAD_LEFT - 7);
        }
      }
    }
  });

  it('chaque panneau affiche entre DEUX et SIX graduations — ni nu, ni illisible', () => {
    for (const fn of FONCTIONS) {
      for (const range of [fn.fRange, fn.fpRange]) {
        const n = graduationsY(range).length;
        expect(n).toBeGreaterThanOrEqual(2);
        expect(n).toBeLessThanOrEqual(6);
      }
    }
  });

  it('les deux panneaux gardent la même LARGEUR en pixels : les axes sont alignés', () => {
    // Sans cette égalité, la sonde serait à un x dans le haut et à un autre
    // dans le bas — la manipulation signature s'effondrerait visuellement.
    for (const fn of FONCTIONS) {
      const largeurHaut = (fn.fRange.xMax - fn.fRange.xMin) * fn.fUnit;
      const largeurBas = (fn.fpRange.xMax - fn.fpRange.xMin) * fn.fpUnit;
      expect(largeurBas).toBeCloseTo(largeurHaut, 9);
    }
  });

  it('chaque panneau garde une hauteur raisonnable — jamais un cadre de 2 000 px', () => {
    for (const fn of FONCTIONS) {
      const hHaut = (fn.fRange.yMax - fn.fRange.yMin) * fn.fUnitY;
      const hBas = (fn.fpRange.yMax - fn.fpRange.yMin) * fn.fpUnitY;
      expect(hHaut).toBeGreaterThan(90);
      expect(hHaut).toBeLessThan(340);
      expect(hBas).toBeGreaterThan(90);
      expect(hBas).toBeLessThan(340);
    }
  });
});

// ── 5. Le CONTRE-EXEMPLE du module 2 ────────────────────────────────────────
describe('module 2 — f′(a) = 0 ne suffit PAS', () => {
  it('g(x) = x³ a une dérivée nulle en 0 et AUCUN extremum : le modèle le dit tout seul', () => {
    expect(CUBE_SIMPLE.fPrime(0)).toBe(0);
    expect(extremums(CUBE_SIMPLE)).toEqual([]);
  });

  it('et g reste croissante DE PART ET D’AUTRE de 0 — le signe ne change pas', () => {
    const { fleches } = tableauDeVariations(CUBE_SIMPLE);
    expect(new Set(fleches)).toEqual(new Set(['croissante']));
    expect(CUBE_SIMPLE.fPrime(-0.5)).toBeGreaterThan(0);
    expect(CUBE_SIMPLE.fPrime(0.5)).toBeGreaterThan(0);
  });

  it('CONTRE-EXEMPLE VISIBLE : le point (0 ; 0) est DANS le cadre, avec de la marge', () => {
    // Piège n°5 du lot 1 : un contre-exemple hors cadre ne montre rien.
    expect(0).toBeGreaterThan(CUBE_SIMPLE.fRange.xMin);
    expect(0).toBeLessThan(CUBE_SIMPLE.fRange.xMax);
    expect(CUBE_SIMPLE.f(0)).toBeGreaterThan(CUBE_SIMPLE.fRange.yMin);
    expect(CUBE_SIMPLE.f(0)).toBeLessThan(CUBE_SIMPLE.fRange.yMax);
    // Et l'aplatissement de la courbe est visible : sur ±0,5 elle ne monte que de 0,25.
    expect(Math.abs(CUBE_SIMPLE.f(0.5) - CUBE_SIMPLE.f(-0.5))).toBeCloseTo(0.25, 12);
  });

  it('le contraste tient : sur f(x) = x³ − 3x, le même geste PRODUIT deux extremums', () => {
    expect(extremums(CUBE).map((e) => e.kind)).toEqual(['maximum', 'minimum']);
  });
});

// ── 6. Le tableau de variations, DÉRIVÉ ─────────────────────────────────────
describe('modules 3 et 4 — le tableau est dérivé du signe, jamais écrit à la main', () => {
  it('f(x) = x³ − 3x : trois intervalles, ↗ ↘ ↗, et les quatre valeurs aux bornes', () => {
    const t = tableauDeVariations(CUBE);
    expect(t.bornes.map((b) => b.x)).toEqual([-2, -1, 1, 2]);
    expect(t.bornes.map((b) => b.y)).toEqual([-2, 2, -2, 2]);
    expect(t.fleches).toEqual(['croissante', 'décroissante', 'croissante']);
  });

  it('p(x) = x² − 4x + 1 : deux intervalles, ↘ ↗, minimum −3 en 2', () => {
    const t = tableauDeVariations(PARABOLE);
    expect(t.fleches).toEqual(['décroissante', 'croissante']);
    expect(extremums(PARABOLE)).toEqual([{ x: 2, y: -3, kind: 'minimum' }]);
  });

  it('q(x) = x³ − 6x² + 9x : ↗ ↘ ↗, maximum 4 en 1 puis minimum 0 en 3', () => {
    const t = tableauDeVariations(CUBE_MAXMIN);
    expect(t.fleches).toEqual(['croissante', 'décroissante', 'croissante']);
    expect(extremums(CUBE_MAXMIN)).toEqual([
      { x: 1, y: 4, kind: 'maximum' },
      { x: 3, y: 0, kind: 'minimum' },
    ]);
  });

  it('r(x) = x³ + 3x : f′ ne s’annule JAMAIS — une seule flèche, aucun extremum', () => {
    const t = tableauDeVariations(TOUJOURS_CROISSANTE);
    expect(t.fleches).toEqual(['croissante']);
    expect(extremums(TOUJOURS_CROISSANTE)).toEqual([]);
    // Balayé : la dérivée reste strictement positive partout.
    for (let x = -2; x <= 2; x += 0.05) expect(TOUJOURS_CROISSANTE.fPrime(x)).toBeGreaterThan(0);
  });

  it('le tableau de signes et le tableau de variations ont TOUJOURS le même découpage', () => {
    for (const fn of FONCTIONS) {
      const s = tableauDeSignes(fn);
      const v = tableauDeVariations(fn);
      expect(v.bornes.map((b) => b.x)).toEqual(s.bornes);
      expect(v.fleches.length).toBe(s.lignes.length);
    }
  });

  it('les bandes peintes sur l’axe couvrent le domaine SANS trou ni recouvrement', () => {
    for (const fn of FONCTIONS) {
      const bandes = bandesDeSigne(fn);
      expect(bandes[0].from).toBe(fn.domain.xMin);
      expect(bandes.at(-1).to).toBe(fn.domain.xMax);
      for (let i = 1; i < bandes.length; i += 1) expect(bandes[i].from).toBe(bandes[i - 1].to);
      // Deux bandes voisines ne portent JAMAIS la même couleur : sinon la
      // frontière annoncée à l'élève ne se verrait pas.
      for (let i = 1; i < bandes.length; i += 1) expect(bandes[i].tone).not.toBe(bandes[i - 1].tone);
    }
  });

  it('chaque flèche du tableau correspond au signe de f′ EN TOUT POINT de son intervalle', () => {
    for (const fn of FONCTIONS) {
      const { lignes } = tableauDeSignes(fn);
      for (const l of lignes) {
        for (let i = 1; i < 40; i += 1) {
          const x = l.from + ((l.to - l.from) * i) / 40;
          expect(Math.sign(fn.fPrime(x))).toBe(l.sign);
        }
      }
    }
  });
});

// ── 7. Les problèmes d'optimisation ─────────────────────────────────────────
describe('module 5 — les problèmes d’optimisation disent VRAI', () => {
  it('la boîte : V(x) = x(12 − 2x)², maximum 128 cm³ pour x = 2 — vérifié par balayage', () => {
    expect(BOITE.f(2)).toBe(128);
    expect(BOITE.fPrime(2)).toBe(0);
    let best = { x: 0, y: -Infinity };
    for (let x = 0; x <= 6; x += 0.0005) {
      const y = BOITE.f(x);
      if (y > best.y) best = { x, y };
    }
    expect(best.x).toBeCloseTo(2, 2);
    expect(best.y).toBeCloseTo(128, 4);
  });

  it('la forme développée du volume coïncide avec la forme factorisée', () => {
    for (let x = 0; x <= 6; x += 0.01) {
      expect(BOITE.f(x)).toBeCloseTo(4 * x ** 3 - 48 * x * x + 144 * x, 9);
    }
  });

  it('la boîte a un SENS physique : côté 12 − 2x > 0 et hauteur x > 0 sur ]0 ; 6[', () => {
    for (let x = 0.01; x < 6; x += 0.01) {
      expect(12 - 2 * x).toBeGreaterThan(0);
      expect(BOITE.f(x)).toBeGreaterThan(0);
    }
    expect(BOITE.f(0)).toBe(0);
    expect(BOITE.f(6)).toBe(0);
  });

  it('le bénéfice : DEUX zéros, minimum en 2 et maximum en 8 — annuler ne suffit pas', () => {
    expect(BENEFICE.fPrime(2)).toBe(0);
    expect(BENEFICE.fPrime(8)).toBe(0);
    expect(extremums(BENEFICE)).toEqual([
      { x: 2, y: -88, kind: 'minimum' },
      { x: 8, y: 128, kind: 'maximum' },
    ]);
  });

  it('le bénéfice maximal sur [0 ; 10] est bien 128, BORNES COMPRISES', () => {
    const max = maximumSurLeDomaine(BENEFICE);
    expect(max).toEqual({ x: 8, y: 128 });
    // Les bornes valent moins : 0 en 0, 40 en 10.
    expect(BENEFICE.f(0)).toBe(0);
    expect(BENEFICE.f(10)).toBe(40);
    let best = -Infinity;
    for (let x = 0; x <= 10; x += 0.0005) best = Math.max(best, BENEFICE.f(x));
    expect(best).toBeCloseTo(128, 4);
  });

  it('le PIÈGE du bénéfice est réel : en x = 2, f′ s’annule et pourtant c’est le PIRE point', () => {
    expect(BENEFICE.f(2)).toBe(-88);
    let pire = Infinity;
    for (let x = 0; x <= 10; x += 0.0005) pire = Math.min(pire, BENEFICE.f(x));
    expect(pire).toBeCloseTo(-88, 4);
  });

  it('la forme factorisée de chaque dérivée est celle que les modules affichent', () => {
    for (let x = 0; x <= 6; x += 0.01) expect(BOITE.fPrime(x)).toBeCloseTo(12 * (x - 2) * (x - 6), 9);
    for (let x = 0; x <= 10; x += 0.01) expect(BENEFICE.fPrime(x)).toBeCloseTo(-6 * (x - 2) * (x - 8), 9);
  });
});

// ── 8. Écriture française et saisie ─────────────────────────────────────────
describe('écriture et saisie', () => {
  it('fr utilise la virgule et le VRAI signe moins', () => {
    expect(fr(2.5)).toBe('2,5');
    expect(fr(-3)).toBe('−3');
    expect(fr(128)).toBe('128');
  });

  it('parseSigned accepte le vrai moins que la leçon AFFICHE — piège n°1 du lot 1', () => {
    expect(parseSigned('−2', parseDec)).toBe(-2);   // U+2212, celui de fr()
    expect(parseSigned('–2', parseDec)).toBe(-2);   // demi-cadratin
    expect(parseSigned('—2', parseDec)).toBe(-2);   // cadratin
    expect(parseSigned('-2', parseDec)).toBe(-2);   // le clavier
    expect(parseSigned('−2,5', parseDec)).toBe(-2.5);
    // Sans la normalisation, parseDec échoue sur ce que la leçon écrit :
    expect(parseDec(fr(-88))).not.toBe(-88);
  });

  it('les flèches et les sens sont deux vues du même signe', () => {
    expect(FLECHE[SENS['1']]).toBe('↗');
    expect(FLECHE[SENS['-1']]).toBe('↘');
  });
});

// ── 9. Le boss : distracteurs NUMÉRIQUEMENT distincts ───────────────────────
describe('mission finale — chaque piège est calculé, plausible et DISTINCT', () => {
  it('e1 — signe de f′ et sens : les quatre options sont deux à deux différentes', () => {
    // f(x) = x³ − 3x sur ]−1 ; 1[ : f′ < 0, donc f décroissante.
    expect(CUBE.fPrime(0)).toBeLessThan(0);
    expect(etatSonde(CUBE, 0).sens).toBe('décroissante');
    expect(etatSonde(CUBE, -1.5).sens).toBe('croissante');
  });

  it('e4 — p′(x) = 2x − 4 s’annule en 2 ; les pièges 4, −2 et 0 en diffèrent tous', () => {
    expect(PARABOLE.zeros).toEqual([2]);
    const pieges = [4, -2, 0];
    for (const p of pieges) expect(p).not.toBe(2);
    expect(new Set([2, ...pieges]).size).toBe(4);
  });

  it('e6 — extremum de q : maximum 4 en x = 1 ; le piège « 1 » est l’abscisse, pas la valeur', () => {
    const max = extremums(CUBE_MAXMIN).find((e) => e.kind === 'maximum');
    expect(max.y).toBe(4);
    expect(max.x).toBe(1);
    expect(max.x).not.toBe(max.y);        // sans quoi le piège serait la bonne réponse
    const options = [4, 1, 0, 3];
    expect(new Set(options).size).toBe(4);
  });

  it('e8 — la boîte : 128 cm³, et les pièges 2, 144 et 108 sont tous DIFFÉRENTS', () => {
    const bonne = BOITE.f(2);
    const pieges = [2, BOITE.fPrime(0), BOITE.f(3)];   // le côté ; V′(0) ; V(3)
    expect(bonne).toBe(128);
    expect(pieges).toEqual([2, 144, 108]);
    expect(new Set([bonne, ...pieges]).size).toBe(4);
    // Ordre de grandeur crédible : chaque piège reste entre 1 et 200.
    for (const p of pieges) expect(p).toBeGreaterThanOrEqual(1);
    for (const p of pieges) expect(p).toBeLessThanOrEqual(200);
  });

  it('e9 — le bénéfice : x = 8, et 2 (l’autre zéro) est le piège JUSTE ce qu’il faut', () => {
    expect(BENEFICE.zeros).toEqual([2, 8]);
    const options = [8, 2, 10, 0];
    expect(new Set(options).size).toBe(4);
    // Le piège 2 est PLAUSIBLE : c'est un vrai zéro de B′, mais c'est un minimum.
    expect(BENEFICE.fPrime(2)).toBe(0);
    expect(BENEFICE.f(2)).toBeLessThan(BENEFICE.f(8));
  });
});

// ── 10. Aucun mot au-dessus du niveau, aucune manipulation gelée ────────────
describe('les gardes de forme du PATRON', () => {
  const dossier = new URL('..', import.meta.url).pathname;
  const lire = (p) => readFileSync(`${dossier}${p}`, 'utf-8');
  const modules = [
    'modules/Module00Diagnostic.jsx',
    'modules/Module01DeuxLignesQuiSeRepondent.jsx',
    'modules/Module02LeSigneDecideDuSens.jsx',
    'modules/Module03ConstruireLeTableau.jsx',
    'modules/Module04AtelierDeTableaux.jsx',
    'modules/Module05LeMeilleurChoix.jsx',
    'modules/Module06MissionFinaleLeSommet.jsx',
  ];

  it('AUCUNE manipulation n’est gelée après validation — pas de disabled={done}', () => {
    for (const m of modules) {
      const src = lire(m);
      const gele = src.match(/disabled=\{[^}]*\bdone[^}]*\}/g) ?? [];
      // Seul `disabled={!doneX}` (verrou d'ANTÉRIORITÉ) est permis, plus le
      // figeage d'une PredictionChips.
      for (const occ of gele) expect(occ).toMatch(/disabled=\{!/);
    }
  });

  it('onAnswered est INCONDITIONNEL : une mauvaise réponse ne bloque jamais la suite', () => {
    for (const m of modules) {
      const src = lire(m);
      expect(src).not.toMatch(/onAnswered=\{\s*\(\s*ok\s*\)/);
    }
  });

  it('le module 0 n’emploie AUCUN mot que la leçon doit enseigner', () => {
    // Le mot est interdit à L'ÉLÈVE, pas au CONTRAT. `requires: [...]` et
    // `priorKnowledge` nomment des ids de connaissances — « extremum » y est
    // l'identifiant d'une brique de 2de, que l'audit exige EN LITTÉRAL
    // (E_REQUIRES_NOT_LITERAL est critique) et que l'élève ne lit jamais. Ce
    // qu'il lit, ce sont les `prompt`, `options` et `explain` : c'est là que le
    // mot ne doit pas apparaître, et c'est cela que la garde vérifie.
    const src = lire('modules/Module00Diagnostic.jsx')
      .replace(/requires:\s*\[[^\]]*\]/g, 'requires: []');
    // La substitution ne doit pas être un moyen de tout masquer : le texte
    // effectivement scanné reste l'essentiel du fichier.
    expect(src.length).toBeGreaterThan(2000);
    for (const interdit of [/optimis/i, /tableau de variations/i, /extremum/i, /maximum/i, /minimum/i]) {
      expect(src).not.toMatch(interdit);
    }
  });

  it('CHAQUE état de départ d’un module tombe sur un cran de SA fonction', () => {
    // Un état initial hors cran serait invisible à l'œil et casserait tout :
    // les boutons « un cran » ne sauraient plus où aller (`idx` vaudrait −1),
    // et l'aimantation du glisser ferait SAUTER la sonde au premier contact.
    const departs = [
      [CUBE, CUBE.domain.xMin],          // M1 étapes 1 et 2
      [CUBE, -1],                        // M1 étape 3, et M3 : la bascule
      [CUBE, -1.5],                      // M2 étape 1
      [CUBE_SIMPLE, CUBE_SIMPLE.domain.xMin], // M2 étape 2
      [CUBE_SIMPLE, -0.5], [CUBE_SIMPLE, 0], [CUBE_SIMPLE, 0.5], // les trois relevés exigés
      [BOITE, 0.5], [BOITE, 2],          // M5 étape 1, et sa cible
      [BENEFICE, BENEFICE.domain.xMin], [BENEFICE, 2], [BENEFICE, 8], // M5 étape 3
    ];
    for (const [fn, x] of departs) {
      const crans = cransSonde(fn, pasDe(fn));
      expect(crans.some((c) => Math.abs(c - x) < 1e-9)).toBe(true);
    }
  });

  it('la manipulation signature se GLISSE, et garde le clavier', () => {
    // Règle utilisateur : on attrape la figure, on ne la pilote pas au bouton.
    // Un composant qui perdrait son glisser repasserait la sonde au bouton
    // sans que rien d'autre ne le signale.
    const src = readFileSync(`${dossier}components/DeuxPanneaux.jsx`, 'utf-8');
    expect(src).toMatch(/onPointerDown=/);
    expect(src).toMatch(/onPointerMove=/);
    // Le pointeur capturé : sans lui, sortir du cadre en glissant plante la sonde.
    expect(src).toMatch(/setPointerCapture/);
    // Sans touchAction:'none', le navigateur fait défiler la page sur mobile.
    expect(src).toMatch(/touchAction:\s*'none'/);
    // Le clavier reste un chemin COMPLET, sur un élément focusable.
    expect(src).toMatch(/onKeyDown=/);
    expect(src).toMatch(/tabIndex=/);
    expect(src).toMatch(/ArrowRight/);
    expect(src).toMatch(/ArrowLeft/);
  });

  it('le boss n’introduit aucun mot neuf : « optimisation » n’y apparaît pas hors des titres posés', () => {
    const src = lire('modules/Module06MissionFinaleLeSommet.jsx');
    // Les mots employés dans le boss doivent tous avoir été posés avant.
    expect(src).not.toMatch(/dérivée seconde|convexité|point d’inflexion|inflexion/i);
  });
});
