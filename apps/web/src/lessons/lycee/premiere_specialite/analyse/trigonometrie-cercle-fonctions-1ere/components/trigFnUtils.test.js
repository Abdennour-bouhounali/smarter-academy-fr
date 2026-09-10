/**
 * LES AFFIRMATIONS DE LA LEÇON, VÉRIFIÉES SUR SES DONNÉES EXACTES.
 *
 * `common/analysis/trig.test.js` vérifie que le NOYAU est juste : que
 * `sinExact(π/6)` rend 0,5, que `variationsSin` découpe correctement. Il ne
 * vérifie PAS qu'un module de CETTE leçon dit vrai en le citant.
 *
 * Ce fichier-ci vérifie les affirmations propres à la leçon :
 *   · « le cliquet atteint EXACTEMENT π/6, π/4, π/3, π/2, π » ;
 *   · « dépasser 2π fait repasser la trace sur elle-même » ;
 *   · « enrouler en négatif donne la trace MIROIR pour le sinus et la MÊME
 *     pour le cosinus » ;
 *   · « sur [0 ; 2π] le sinus monte, descend, remonte » ;
 *   · « aucun état atteignable ne fait sortir un point du cadre » — balayé,
 *     pas échantillonné ;
 *   · « chaque cible que l'on demande d'atteindre tombe sur un cran » ;
 *   · « les distracteurs du laboratoire de lecture sont distincts ».
 *
 * PÉRIMÈTRE : aucun test ne porte sur la résolution de cos x = k sur ℝ, ni sur
 * les formules d'addition ou de duplication — c'est la leçon « équations et
 * phénomènes périodiques ». Le périmètre est vérifié ici même (dernier bloc).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseDec } from '@smarter-academy/core';
import {
  TAU, PAS, REMARQUABLES, principal, remarquableDe, sinExact, cosExact,
  variationsSin, variationsCos, labelPi, texPi, fr,
  CRAN_MIN, CRAN_MAX, T_MIN, T_MAX, tDuCran, cranDe, bornerCran,
  SIN, COS, FONCTIONS,
  trace, segmentsTrace, jumeau, aRefaitUnTour, aTourneEnNegatif,
  R, CX, CY, H_CADRE, L_DEROULE, MARGE_G, xDeT, yDeVal, GRADUATIONS, GRADUATIONS_ETIQUETEES,
  CIBLES, tableauVariations, extremums,
  ECARTS, MOTIFS, MOTIFS_LABELS, onde, LECTURES, ecartMesure, motifMesure,
  dansLeCadre, parseSigned, cranPrincipalDe, cranDepuisPointeur,
  aimanter, sommetDe, reglageDepuisSommet,
  fenetreDerouleur, geometrieFenetre, FENETRES, H_CADRE,
} from './trigFnUtils';
import { GEOM_ONDE } from './OndeReader';

/** Les cinq valeurs remarquables que la consigne exige d'atteindre au cran. */
const EXIGEES = [
  { label: 'π/6', t: Math.PI / 6 },
  { label: 'π/4', t: Math.PI / 4 },
  { label: 'π/3', t: Math.PI / 3 },
  { label: 'π/2', t: Math.PI / 2 },
  { label: 'π', t: Math.PI },
];

describe('le cliquet — atteignabilité EXACTE des valeurs remarquables', () => {
  it('un pas de π/12 atteint π/6, π/4, π/3, π/2 et π sans arrondi', () => {
    for (const v of EXIGEES) {
      const n = Math.round(v.t / PAS);
      // Le cran EST la valeur : pas « proche de », égal au dernier bit près.
      expect(Math.abs(tDuCran(n) - v.t)).toBeLessThan(1e-15);
      expect(n).toBe(Math.trunc(n));
    }
  });

  it('π/8 n’est PAS sur un cran — la contrainte est réelle, pas décorative', () => {
    const n = Math.round(Math.PI / 8 / PAS);
    expect(Math.abs(tDuCran(n) - Math.PI / 8)).toBeGreaterThan(1e-3);
  });

  it('tous les crans de la plage sont des multiples entiers de π/12', () => {
    for (let n = CRAN_MIN; n <= CRAN_MAX; n += 1) {
      expect(cranDe(tDuCran(n))) .toBe(n);
    }
  });

  it('la plage dépasse 2π ET descend sous 0 — les deux gestes exigés', () => {
    expect(T_MAX).toBeGreaterThan(TAU);
    expect(T_MIN).toBeLessThan(0);
    // Un tour complet de marge de part et d'autre, au moins.
    expect(T_MAX - TAU).toBeGreaterThanOrEqual(TAU - 1e-12);
    expect(-T_MIN).toBeGreaterThanOrEqual(TAU - 1e-12);
  });

  it('bornerCran ne laisse jamais sortir de la plage', () => {
    for (const n of [-1000, CRAN_MIN - 1, CRAN_MIN, 0, CRAN_MAX, CRAN_MAX + 1, 1000]) {
      const b = bornerCran(n);
      expect(b).toBeGreaterThanOrEqual(CRAN_MIN);
      expect(b).toBeLessThanOrEqual(CRAN_MAX);
    }
  });
});

describe('les valeurs affichées sont EXACTES, jamais 0,49999999999999994', () => {
  it('sin(π/6) vaut 0,5 au bit près, et Math.sin ne le fait PAS', () => {
    expect(sinExact(Math.PI / 6)).toBe(0.5);
    expect(Math.sin(Math.PI / 6)).not.toBe(0.5);   // le défaut que l'on évite
  });

  it('cos(π/2) est un VRAI zéro, et Math.cos ne l’est pas', () => {
    expect(cosExact(Math.PI / 2)).toBe(0);
    expect(Math.cos(Math.PI / 2)).not.toBe(0);
  });

  it('les valeurs affichées par la leçon, cran par cran, sont exactes partout', () => {
    // Balayage de TOUTE la plage : à chaque cran, la valeur affichée doit être
    // la valeur EXACTE de la table (à un tour près), pas une approximation.
    for (let n = CRAN_MIN; n <= CRAN_MAX; n += 1) {
      const t = tDuCran(n);
      const r = remarquableDe(t);
      expect(r).not.toBeNull();
      expect(sinExact(t)).toBe(r.sin);
      expect(cosExact(t)).toBe(r.cos);
    }
  });

  it('les valeurs formatées ne montrent jamais de bruit de flottant', () => {
    for (let n = CRAN_MIN; n <= CRAN_MAX; n += 1) {
      const t = tDuCran(n);
      for (const v of [sinExact(t), cosExact(t)]) {
        expect(fr(v)).toMatch(/^−?\d+,\d{2}$/);
      }
    }
    expect(fr(sinExact(Math.PI / 6))).toBe('0,50');
    expect(fr(cosExact(Math.PI / 2))).toBe('0,00');       // pas « −0,00 »
    expect(fr(sinExact((3 * Math.PI) / 2))).toBe('−1,00');
  });

  it('l’écriture des réels en π DÉRIVE du nombre — texte et figure ne peuvent pas se contredire', () => {
    expect(labelPi(0)).toBe('0');
    expect(labelPi(Math.PI / 6)).toBe('π/6');
    expect(labelPi(Math.PI)).toBe('π');
    expect(labelPi(TAU)).toBe('2π');
    expect(labelPi(-Math.PI / 2)).toBe('−π/2');
    expect(labelPi((5 * Math.PI) / 4)).toBe('5π/4');
    // Un réel hors cran n'a pas d'écriture : la leçon ne peut pas en inventer une.
    expect(labelPi(1)).toBeNull();
  });

  it('texPi produit du KaTeX pour chaque cran de la plage', () => {
    for (let n = CRAN_MIN; n <= CRAN_MAX; n += 1) {
      expect(typeof texPi(tDuCran(n))).toBe('string');
    }
  });
});

describe('module 1 — la trace se DÉROULE, et repasse sur elle-même', () => {
  it('la trace naît des crans VISITÉS, pas d’une courbe affichée d’avance', () => {
    expect(trace(SIN, [])).toEqual([]);
    const t3 = trace(SIN, [0, 1, 2]);
    expect(t3).toHaveLength(3);
    expect(t3.map((p) => p.cran)).toEqual([0, 1, 2]);
  });

  it('les crans visités dans le désordre se rangent, et les doublons disparaissent', () => {
    const t = trace(SIN, [5, 2, 5, 0, 2]);
    expect(t.map((p) => p.cran)).toEqual([0, 2, 5]);
  });

  it('un tour de plus REPASSE exactement sur la trace — c’est la périodicité', () => {
    for (let n = CRAN_MIN; n <= CRAN_MAX - 24; n += 1) {
      const t = tDuCran(n);
      const tp = tDuCran(jumeau(n));
      expect(sinExact(tp)).toBe(sinExact(t));
      expect(cosExact(tp)).toBe(cosExact(t));
      // Et le point du DÉROULÉ est décalé d'exactement un tour à l'horizontale.
      expect(xDeT(tp) - xDeT(t)).toBeCloseTo(TAU * (xDeT(1) - xDeT(0)), 9);
    }
  });

  it('un DEMI-tour ne suffit pas : la trace ne repasse pas sur elle-même', () => {
    // Le contre-exemple qui prouve que 2π n'est pas une valeur choisie au hasard.
    let auMoinsUnEcart = false;
    for (let n = 0; n <= 12; n += 1) {
      if (sinExact(tDuCran(n + 12)) !== sinExact(tDuCran(n))) auMoinsUnEcart = true;
    }
    expect(auMoinsUnEcart).toBe(true);
  });

  it('en négatif, la trace du SINUS est le MIROIR — balayé sur toute la plage', () => {
    for (let n = 1; n <= CRAN_MAX; n += 1) {
      // `+0` et `−0` sont le MÊME nombre : aux multiples de π le miroir d'un
      // zéro est un zéro, et `toBe` (Object.is) les distinguerait à tort.
      // C'est bien l'égalité EXACTE qui est testée — `toEqual` sur des nombres
      // n'admet aucune tolérance —, seul le signe du zéro est neutralisé.
      expect(sinExact(tDuCran(-n)) + 0).toEqual(-sinExact(tDuCran(n)) + 0);
    }
  });

  it('et jamais un « −0,00 » ne s’affiche : le zéro reste un zéro', () => {
    for (let n = CRAN_MIN; n <= CRAN_MAX; n += 1) {
      for (const v of [sinExact(tDuCran(n)), cosExact(tDuCran(n))]) {
        expect(fr(v)).not.toBe('−0,00');
      }
    }
  });

  it('en négatif, la trace du COSINUS est la MÊME — balayé sur toute la plage', () => {
    for (let n = 1; n <= CRAN_MAX; n += 1) {
      expect(cosExact(tDuCran(-n))).toBe(cosExact(tDuCran(n)));
    }
  });

  it('les deux constats du module 1 sont DISTINCTS : sin n’est pas égal à son miroir', () => {
    // Sans quoi « miroir » et « même trace » diraient la même chose et le
    // module 1 poserait deux fois la même question.
    const differe = [];
    for (let n = 1; n <= 24; n += 1) {
      if (sinExact(tDuCran(-n)) !== sinExact(tDuCran(n))) differe.push(n);
    }
    expect(differe.length).toBeGreaterThan(15);
  });

  it('les objectifs du module 1 ne se déclarent pas sur un seul point', () => {
    expect(aRefaitUnTour([25])).toBe(false);
    expect(aRefaitUnTour([25, 26, 27, 28, 29])).toBe(false);
    expect(aRefaitUnTour([25, 26, 27, 28, 29, 30])).toBe(true);
    expect(aTourneEnNegatif([-1])).toBe(false);
    expect(aTourneEnNegatif([-1, -2, -3, -4, -5, -6])).toBe(true);
    // Un élève qui n'a fait qu'aller de 0 à 2π n'a atteint NI l'un ni l'autre.
    const unTour = Array.from({ length: 25 }, (_, i) => i);
    expect(aRefaitUnTour(unTour)).toBe(false);
    expect(aTourneEnNegatif(unTour)).toBe(false);
  });

  it('la trace ne relie JAMAIS deux crans non voisins — pas de corde qui ment', () => {
    const segs = segmentsTrace(SIN, [0, 1, 2, 20, 21, 22]);
    expect(segs).toHaveLength(2);
    expect(segs[0].map((p) => p.cran)).toEqual([0, 1, 2]);
    expect(segs[1].map((p) => p.cran)).toEqual([20, 21, 22]);
    for (const seg of segs) {
      for (let i = 1; i < seg.length; i += 1) expect(seg[i].cran).toBe(seg[i - 1].cran + 1);
    }
  });

  it('un cran isolé ne produit aucun segment — un point n’est pas une courbe', () => {
    expect(segmentsTrace(SIN, [7])).toEqual([]);
    expect(segmentsTrace(SIN, [0, 5, 10])).toEqual([]);
  });

  it('une visite complète de la plage produit UN seul segment continu', () => {
    const tous = Array.from({ length: CRAN_MAX - CRAN_MIN + 1 }, (_, i) => CRAN_MIN + i);
    const segs = segmentsTrace(SIN, tous);
    expect(segs).toHaveLength(1);
    expect(segs[0]).toHaveLength(tous.length);
  });
});

describe('les deux fonctions étudiées, et leur parité CONSTATÉE', () => {
  it('le sinus est l’ordonnée, le cosinus l’abscisse — l’héritage de la 2de', () => {
    expect(SIN.coordonnee).toBe('ordonnée');
    expect(COS.coordonnee).toBe('abscisse');
    expect(FONCTIONS).toHaveLength(2);
  });

  it('la parité déclarée est celle que le calcul MESURE, pas une étiquette', () => {
    for (const fn of FONCTIONS) {
      let paire = true;
      let impaire = true;
      for (let n = CRAN_MIN; n <= CRAN_MAX; n += 1) {
        const t = tDuCran(n);
        if (fn.exact(-t) !== fn.exact(t)) paire = false;
        if (fn.exact(-t) !== -fn.exact(t) && fn.exact(t) !== 0) impaire = false;
      }
      if (fn.parite === 'paire') { expect(paire).toBe(true); expect(fn.id).toBe('cos'); }
      else { expect(impaire).toBe(true); expect(fn.id).toBe('sin'); }
    }
  });

  it('les deux tons sont distincts — la légende reste lisible', () => {
    expect(SIN.tone).not.toBe(COS.tone);
  });
});

describe('module 4 — les variations sur [0 ; 2π] sont MESURÉES', () => {
  it('le sinus monte, descend, puis remonte — trois morceaux, dans cet ordre', () => {
    const v = variationsSin(0, TAU);
    expect(v.map((s) => s.sens)).toEqual(['croissante', 'decroissante', 'croissante']);
    expect(v[0].from).toBeCloseTo(0, 12);
    expect(v[0].to).toBeCloseTo(Math.PI / 2, 12);
    expect(v[1].to).toBeCloseTo((3 * Math.PI) / 2, 12);
    expect(v[2].to).toBeCloseTo(TAU, 12);
  });

  it('le cosinus DESCEND puis remonte — deux morceaux, l’autre allure', () => {
    const v = variationsCos(0, TAU);
    expect(v.map((s) => s.sens)).toEqual(['decroissante', 'croissante']);
    expect(v[0].to).toBeCloseTo(Math.PI, 12);
  });

  it('chaque sens annoncé est vrai POINT PAR POINT à l’intérieur du morceau', () => {
    for (const fn of FONCTIONS) {
      for (const s of fn.variations(0, TAU)) {
        const n = 60;
        for (let i = 0; i < n; i += 1) {
          const x1 = s.from + ((s.to - s.from) * i) / n;
          const x2 = s.from + ((s.to - s.from) * (i + 1)) / n;
          const d = fn.exact(x2) - fn.exact(x1);
          if (s.sens === 'croissante') expect(d).toBeGreaterThan(-1e-12);
          else expect(d).toBeLessThan(1e-12);
        }
      }
    }
  });

  it('le tableau de variations porte des bornes ÉCRITES et des valeurs exactes', () => {
    const t = tableauVariations(SIN);
    expect(t).toHaveLength(3);
    expect(t[0].deLabel).toBe('0');
    expect(t[0].aLabel).toBe('π/2');
    expect(t[0].deVal).toBe(0);
    expect(t[0].aVal).toBe(1);
    expect(t[1].aVal).toBe(-1);
    expect(t[2].aVal).toBe(0);
    // Toute borne du tableau est écrivable : aucune case ne peut rester vide.
    for (const fn of FONCTIONS) {
      for (const s of tableauVariations(fn)) {
        expect(s.deLabel).not.toBeNull();
        expect(s.aLabel).not.toBeNull();
      }
    }
  });

  it('les extremums sont DÉRIVÉS du tableau, et valent exactement ±1', () => {
    const eS = extremums(SIN);
    expect(eS.map((e) => e.label)).toEqual(['π/2', '3π/2']);
    expect(eS.map((e) => e.valeur)).toEqual([1, -1]);
    expect(eS.map((e) => e.type)).toEqual(['maximum', 'minimum']);

    const eC = extremums(COS);
    expect(eC.map((e) => e.label)).toEqual(['0', 'π', '2π']);
    expect(eC.map((e) => e.valeur)).toEqual([1, -1, 1]);
  });

  it('aucune valeur ne sort de [−1 ; 1] — la borne héritée de la 2de tient', () => {
    for (let n = CRAN_MIN; n <= CRAN_MAX; n += 1) {
      for (const fn of FONCTIONS) {
        const v = fn.exact(tDuCran(n));
        expect(v).toBeGreaterThanOrEqual(-1);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('les CIBLES pédagogiques sont toutes atteignables', () => {
  it('chaque cible tombe exactement sur un cran, DANS la plage', () => {
    for (const c of CIBLES) {
      expect(Number.isInteger(c.cran)).toBe(true);
      expect(c.cran).toBeGreaterThanOrEqual(CRAN_MIN);
      expect(c.cran).toBeLessThanOrEqual(CRAN_MAX);
    }
  });

  it('l’étiquette d’une cible est celle que le nombre DÉRIVE — pas une saisie', () => {
    for (const c of CIBLES) {
      if (c.label.includes('+')) continue;             // « 2π + π/6 », écriture pédagogique
      expect(labelPi(tDuCran(c.cran))).toBe(c.label);
    }
    // « 2π + π/6 » désigne bien 13π/6, un cran de la plage.
    const dp = CIBLES.find((c) => c.id === 'deux-pi-plus-pi-6');
    expect(labelPi(tDuCran(dp.cran))).toBe('13π/6');
    expect(tDuCran(dp.cran)).toBeCloseTo(TAU + Math.PI / 6, 12);
  });

  it('les cibles couvrent les DEUX gestes du module 1 : au-delà de 2π, et en négatif', () => {
    expect(CIBLES.some((c) => c.cran > 24)).toBe(true);
    expect(CIBLES.some((c) => c.cran < 0)).toBe(true);
  });

  it('deux cibles ne portent jamais le même cran ni le même id', () => {
    expect(new Set(CIBLES.map((c) => c.cran)).size).toBe(CIBLES.length);
    expect(new Set(CIBLES.map((c) => c.id)).size).toBe(CIBLES.length);
  });

  it('les cibles « jumelles » du module 3 ont bien la même valeur, à un tour près', () => {
    const a = CIBLES.find((c) => c.id === 'pi-6');
    const b = CIBLES.find((c) => c.id === 'deux-pi-plus-pi-6');
    expect(b.cran - a.cran).toBe(24);
    expect(sinExact(tDuCran(b.cran))).toBe(sinExact(tDuCran(a.cran)));
    // …et les cibles « opposées » ont bien des sinus opposés.
    const m = CIBLES.find((c) => c.id === 'moins-pi-6');
    expect(sinExact(tDuCran(m.cran))).toBe(-sinExact(tDuCran(a.cran)));
    expect(cosExact(tDuCran(m.cran))).toBe(cosExact(tDuCran(a.cran)));
  });
});

describe('SÉCURITÉ DE MISE EN PAGE — balayée, jamais échantillonnée', () => {
  it('tout cran atteignable garde ses DEUX points dans le cadre', () => {
    for (let n = CRAN_MIN; n <= CRAN_MAX; n += 1) expect(dansLeCadre(n)).toBe(true);
  });

  it('la géométrie du cercle tient dans son cadre carré', () => {
    expect(CX - R).toBeGreaterThanOrEqual(0);
    expect(CY - R).toBeGreaterThanOrEqual(0);
    expect(CX + R).toBeLessThanOrEqual(H_CADRE);
    expect(CY + R).toBeLessThanOrEqual(H_CADRE);
  });

  it('les deux cadres partagent l’échelle verticale — le report est HORIZONTAL', () => {
    // C'est ce qui rend le déroulement lisible : l'ordonnée du point du cercle
    // et celle du point de la courbe se lisent à la MÊME hauteur.
    for (let n = CRAN_MIN; n <= CRAN_MAX; n += 1) {
      const t = tDuCran(n);
      const yCercle = CY - sinExact(t) * R;
      expect(yDeVal(sinExact(t))).toBeCloseTo(yCercle, 12);
    }
  });

  it('les extrémités de la plage tombent DANS le cadre déroulé, marges comprises', () => {
    expect(xDeT(T_MIN)).toBeCloseTo(MARGE_G, 9);
    expect(xDeT(T_MAX)).toBeLessThanOrEqual(L_DEROULE);
    expect(L_DEROULE - xDeT(T_MAX)).toBeGreaterThan(10);
  });

  it('les graduations sont strictement croissantes et toutes dans le cadre', () => {
    expect(GRADUATIONS.length).toBeGreaterThan(8);
    for (let i = 1; i < GRADUATIONS.length; i += 1) {
      expect(GRADUATIONS[i].x).toBeGreaterThan(GRADUATIONS[i - 1].x);
    }
    for (const g of GRADUATIONS) {
      expect(g.x).toBeGreaterThanOrEqual(0);
      expect(g.x).toBeLessThanOrEqual(L_DEROULE);
    }
  });

  it('AUCUNE étiquette n’en chevauche une autre — le défaut qui a changé le pas', () => {
    // C'est ce test qui a refusé le pas de π/2 : il posait les étiquettes à
    // 40,8 px alors que « −11π/2 » en mesure 42. Le pas de π donne 81,7 px.
    // Largeur mesurée caractère par caractère, comme le fait CoordPlane.
    const largeur = (s) => [...String(s)].reduce((n, c) => n + (c === ',' || c === '.' ? 3 : c === '−' || c === '-' ? 5.5 : 6), 0);
    for (let i = 1; i < GRADUATIONS_ETIQUETEES.length; i += 1) {
      const g = GRADUATIONS_ETIQUETEES[i];
      const p = GRADUATIONS_ETIQUETEES[i - 1];
      // Étiquettes CENTRÉES sur leur graduation : les demi-largeurs s'ajoutent.
      const besoin = largeur(g.label) / 2 + largeur(p.label) / 2 + 4;
      expect(g.x - p.x).toBeGreaterThan(besoin);
    }
  });

  it('aucune étiquette ne déborde du cadre, à gauche comme à droite', () => {
    const largeur = (s) => [...String(s)].reduce((n, c) => n + (c === '−' ? 5.5 : 6), 0);
    for (const g of GRADUATIONS_ETIQUETEES) {
      expect(g.x - largeur(g.label) / 2).toBeGreaterThanOrEqual(0);
      expect(g.x + largeur(g.label) / 2).toBeLessThanOrEqual(L_DEROULE);
    }
  });

  it('toute étiquette de graduation est une écriture en π, jamais un décimal', () => {
    for (const g of GRADUATIONS_ETIQUETEES) expect(g.label).toMatch(/^(0|−?\d*π(\/\d+)?)$/);
  });

  it('les bornes pédagogiques 0, π et 2π sont toutes ÉTIQUETÉES', () => {
    // Le module 4 parle de [0 ; 2π] : ces trois repères doivent être lisibles.
    for (const l of ['0', 'π', '2π']) {
      expect(GRADUATIONS_ETIQUETEES.some((g) => g.label === l)).toBe(true);
    }
  });

  it('une graduation muette ne porte JAMAIS de texte — rien à déborder', () => {
    for (const g of GRADUATIONS) {
      if (!g.majeure) expect(g.label).toBeNull();
    }
  });
});

describe('module 6 — le laboratoire de lecture graphique', () => {
  it('l’écart maximal MESURÉ sur la courbe est celui qu’on annonce', () => {
    for (const l of LECTURES) {
      const f = onde(l.A, l.P);
      expect(ecartMesure(f, -4 * Math.PI, 4 * Math.PI)).toBeCloseTo(l.A, 6);
    }
  });

  it('la longueur du motif MESURÉE est celle qu’on annonce', () => {
    for (const l of LECTURES) {
      const f = onde(l.A, l.P);
      const p = motifMesure(f, MOTIFS.slice().sort((a, b) => a - b), -6, 6, 1e-6);
      expect(p).toBeCloseTo(l.P, 6);
    }
  });

  it('un motif PLUS COURT ne convient jamais — la mesure est le plus petit', () => {
    for (const l of LECTURES) {
      const f = onde(l.A, l.P);
      for (const p of MOTIFS.filter((m) => m < l.P - 1e-9)) {
        let superpose = true;
        for (let x = -6; x <= 6; x += 0.05) {
          if (Math.abs(f(x + p) - f(x)) > 1e-6) { superpose = false; break; }
        }
        expect(superpose).toBe(false);
      }
    }
  });

  it('les trois lectures sont DISTINCTES deux à deux — sinon deux exercices identiques', () => {
    expect(new Set(LECTURES.map((l) => `${l.A}|${l.P}`)).size).toBe(LECTURES.length);
    expect(new Set(LECTURES.map((l) => l.A)).size).toBe(LECTURES.length);
  });

  it('les distracteurs « demi » et « double » sont plausibles ET distincts de la réponse', () => {
    for (const l of LECTURES) {
      const piege = l.piege === 'demi' ? l.P / 2 : l.P * 2;
      expect(Math.abs(piege - l.P)).toBeGreaterThan(1e-9);
      // Plausible = du même ordre de grandeur, et lisible sur un axe en π.
      expect(piege).toBeGreaterThan(0);
      expect(piege).toBeLessThanOrEqual(8 * Math.PI);
    }
  });

  it('chaque réglage du laboratoire tombe sur un cran, et les cibles y sont', () => {
    for (const l of LECTURES) {
      expect(ECARTS).toContain(l.A);
      expect(MOTIFS.some((m) => Math.abs(m - l.P) < 1e-12)).toBe(true);
    }
    expect(MOTIFS).toHaveLength(MOTIFS_LABELS.length);
    for (let i = 0; i < MOTIFS.length; i += 1) {
      expect(labelPi(MOTIFS[i])).toBe(MOTIFS_LABELS[i]);
    }
  });

  it('les crans d’écart sont strictement croissants et couvrent les trois cibles', () => {
    for (let i = 1; i < ECARTS.length; i += 1) expect(ECARTS[i]).toBeGreaterThan(ECARTS[i - 1]);
    expect(ECARTS).toContain(1);
  });

  it('l’onde vaut 0 en 0 et atteint son maximum au quart du motif — exactement', () => {
    for (const l of LECTURES) {
      const f = onde(l.A, l.P);
      expect(f(0)).toBe(0);
      expect(f(l.P / 4)).toBeCloseTo(l.A, 12);
      expect(f(l.P / 2)).toBeCloseTo(0, 12);
    }
  });
});

describe('parseSigned — le vrai signe moins que la leçon AFFICHE', () => {
  const p = parseSigned(parseDec);

  it('accepte le moins typographique U+2212 que parseDec refuse', () => {
    expect(Number.isNaN(parseDec('−1'))).toBe(true);   // le défaut d'origine
    expect(p('−1')).toBe(-1);
    expect(p('−0,5')).toBe(-0.5);
  });

  it('accepte aussi le tiret demi-cadratin et le cadratin', () => {
    expect(p('–2')).toBe(-2);
    expect(p('—2')).toBe(-2);
  });

  it('n’abîme pas les cas ordinaires', () => {
    expect(p('1')).toBe(1);
    expect(p('-1')).toBe(-1);
    expect(p('0,5')).toBe(0.5);
    expect(p('0')).toBe(0);
  });

  it('accepte toute valeur que la leçon peut AFFICHER, telle qu’affichée', () => {
    // Contrat croisé : ce que `fr` écrit, `parseSigned` doit savoir le relire.
    for (const v of [0, 0.5, -0.5, 1, -1, 0.87, -0.87]) {
      expect(p(fr(v))).toBeCloseTo(Math.round(v * 100) / 100, 12);
    }
  });
});

describe('PÉRIMÈTRE — ce que cette leçon ne fait PAS', () => {
  const src = readFileSync(new URL('./trigFnUtils.js', import.meta.url), 'utf-8');

  it('le modèle n’importe ni ne définit de résolution d’équation trigonométrique', () => {
    // « équations et phénomènes périodiques » est la leçon SUIVANTE.
    expect(src).not.toMatch(/solveCos|solveSin|resoudre/i);
  });

  it('le modèle ne porte ni formule d’addition ni duplication', () => {
    expect(src).not.toMatch(/duplication|formuleAddition|addition\s*\(/i);
  });

  it('le modèle ne réécrit RIEN du noyau partagé : il le consomme', () => {
    // Toute redéfinition locale de sinExact/principal/REMARQUABLES serait une
    // quatrième copie de la trigonométrie.
    expect(src).toMatch(/from '\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/common\/analysis\/trig'/);
    expect(src).not.toMatch(/^(export )?function (sinExact|cosExact|principal)\b/m);
    expect(src).not.toMatch(/^const REMARQUABLES\b/m);
  });

  it('aucune valeur remarquable n’est ressaisie à la main dans le modèle', () => {
    // Les radicaux vivent dans le noyau partagé, une seule fois.
    expect(src).not.toMatch(/Math\.sqrt\(3\)\s*\/\s*2|Math\.SQRT2\s*\/\s*2/);
  });

  it('la table du noyau couvre bien les 24 crans d’un tour', () => {
    expect(REMARQUABLES).toHaveLength(24);
    expect(principal(TAU)).toBeCloseTo(0, 12);
  });
});

describe('module 6 — le repère de l’OndeReader, balayé', () => {
  it('toute courbe réglable tient DANS le cadre, à tout réglage', () => {
    // Balayage du produit COMPLET des deux cliquets : aucun couple (écart,
    // motif) atteignable ne doit faire sortir la vague du repère.
    for (const A of ECARTS) {
      for (const P of MOTIFS) {
        const f = onde(A, P);
        for (let i = 0; i <= 400; i += 1) {
          const x = GEOM_ONDE.XMIN + ((GEOM_ONDE.XMAX - GEOM_ONDE.XMIN) * i) / 400;
          const y = GEOM_ONDE.toY(f(x));
          expect(y).toBeGreaterThanOrEqual(0);
          expect(y).toBeLessThanOrEqual(GEOM_ONDE.H);
          expect(Math.abs(f(x))).toBeLessThanOrEqual(GEOM_ONDE.YMAX);
        }
      }
    }
  });

  it('les graduations en π ne se chevauchent pas et restent dans le cadre', () => {
    const largeur = (s) => [...String(s)].reduce((n, c) => n + (c === '−' ? 5.5 : 6), 0);
    for (let i = 1; i < GEOM_ONDE.TICKS.length; i += 1) {
      const g = GEOM_ONDE.TICKS[i];
      const p = GEOM_ONDE.TICKS[i - 1];
      expect(g.x - p.x).toBeGreaterThan(largeur(g.label) / 2 + largeur(p.label) / 2 + 4);
    }
    for (const g of GEOM_ONDE.TICKS) {
      expect(g.x - largeur(g.label) / 2).toBeGreaterThanOrEqual(0);
      expect(g.x + largeur(g.label) / 2).toBeLessThanOrEqual(GEOM_ONDE.W);
    }
  });

  it('chaque cible de lecture est visible ENTIÈREMENT : au moins un motif complet', () => {
    // Une consigne « lis la longueur du motif » est infaisable si le cadre n'en
    // montre pas un tour entier, sommet à sommet.
    for (const l of LECTURES) {
      expect(GEOM_ONDE.XMAX - GEOM_ONDE.XMIN).toBeGreaterThanOrEqual(l.P);
      // Et deux sommets consécutifs sont dans le cadre : la mesure est faisable.
      const premierSommet = l.P / 4;
      expect(premierSommet + l.P).toBeLessThanOrEqual(GEOM_ONDE.XMAX + 1e-9);
    }
  });

  it('l’écart maximal de chaque cible est LISIBLE : la graduation existe', () => {
    for (const l of LECTURES) {
      expect(l.A).toBeLessThanOrEqual(3);       // les graduations vont jusqu'à 3
      expect(l.A).toBeGreaterThan(0);
    }
  });
});

describe('LE GLISSER — enrouler est un geste, pas un clic', () => {
  /** La position du pointeur sur le cercle pour un réel t, y vers le HAUT. */
  const pointeurEn = (t, rayon = 78) => ({ dx: rayon * Math.cos(t), dy: rayon * Math.sin(t) });

  it('AIMANTATION : un doigt qui vise « à peu près » tombe EXACTEMENT sur le cran', () => {
    // C'est la condition n°1 : sans aimantation, sin afficherait 0,4999.
    for (const v of EXIGEES) {
      // Le doigt rate de 3 % d'un cran, dans un sens puis dans l'autre.
      for (const erreur of [-0.4 * PAS, -0.1 * PAS, 0, 0.1 * PAS, 0.4 * PAS]) {
        const p = pointeurEn(v.t + erreur);
        const n = cranDepuisPointeur(p.dx, p.dy, Math.round(v.t / PAS));
        expect(tDuCran(n)).toBeCloseTo(v.t, 12);
        // Et la valeur affichée est la valeur EXACTE, pas une approximation.
        expect(sinExact(tDuCran(n))).toBe(sinExact(v.t));
      }
    }
  });

  it('l’aimantation rend une valeur remarquable EXACTE, jamais 0,4999', () => {
    const p = pointeurEn(Math.PI / 6 + 0.3 * PAS);
    const n = cranDepuisPointeur(p.dx, p.dy, 2);
    expect(sinExact(tDuCran(n))).toBe(0.5);
    expect(fr(sinExact(tDuCran(n)))).toBe('0,50');
  });

  it('tout point du cercle s’aimante sur un cran — balayé finement', () => {
    for (let a = 0; a < TAU; a += TAU / 720) {
      const p = pointeurEn(a);
      const n = cranDepuisPointeur(p.dx, p.dy, 0);
      expect(Number.isInteger(n)).toBe(true);
      expect(remarquableDe(tDuCran(n))).not.toBeNull();
    }
  });

  it('CONTINUITÉ : franchir la couture AJOUTE un tour, il ne remet pas à zéro', () => {
    // Condition n°2, et c'est tout le sujet de la leçon : un élève qui tourne
    // sans lever le doigt doit DÉPASSER 2π, pas revenir à 0.
    let cran = 0;
    for (let i = 1; i <= 36; i += 1) {          // un tour et demi, cran par cran
      const p = pointeurEn(i * PAS);
      cran = cranDepuisPointeur(p.dx, p.dy, cran);
      expect(cran).toBe(i);                      // strictement croissant, sans retour
    }
    expect(cran).toBe(36);
    expect(tDuCran(cran)).toBeGreaterThan(TAU);  // on a bien dépassé un tour
  });

  it('CONTINUITÉ EN NÉGATIF : tourner à l’envers descend sous 0, puis SATURE', () => {
    let cran = 0;
    for (let i = 1; i <= 30; i += 1) {
      const p = pointeurEn(-i * PAS);
      cran = cranDepuisPointeur(p.dx, p.dy, cran);
      // Jusqu'au bord du cadre, chaque cran du doigt est suivi exactement.
      expect(cran).toBe(Math.max(CRAN_MIN, -i));
    }
    // Au-delà, le point s'ARRÊTE au bord au lieu de sortir du cadre : c'est le
    // bornage, et c'est ce qu'on veut — jamais un saut ni un retour à zéro.
    expect(cran).toBe(CRAN_MIN);
    expect(tDuCran(cran)).toBeLessThan(0);
    expect(tDuCran(cran)).toBeLessThanOrEqual(-TAU);
  });

  it('un geste continu ne SAUTE jamais de plus d’un demi-tour', () => {
    // Sinon le point « traverserait » le cercle et la trace mentirait.
    for (let depart = CRAN_MIN; depart <= CRAN_MAX; depart += 1) {
      for (let a = 0; a < TAU; a += TAU / 96) {
        const p = pointeurEn(a);
        const n = cranDepuisPointeur(p.dx, p.dy, depart);
        // Hors saturation aux bornes, l'écart reste dans un demi-tour.
        if (n !== CRAN_MIN && n !== CRAN_MAX) {
          expect(Math.abs(n - depart)).toBeLessThanOrEqual(12);
        }
      }
    }
  });

  it('le glisser reste DANS la plage : il ne sort jamais du cadre', () => {
    for (let depart = CRAN_MIN; depart <= CRAN_MAX; depart += 3) {
      for (let a = -TAU; a < 2 * TAU; a += TAU / 48) {
        const p = pointeurEn(a);
        const n = cranDepuisPointeur(p.dx, p.dy, depart);
        expect(n).toBeGreaterThanOrEqual(CRAN_MIN);
        expect(n).toBeLessThanOrEqual(CRAN_MAX);
        expect(dansLeCadre(n)).toBe(true);
      }
    }
  });

  it('un aller-retour au même endroit rend le MÊME cran — le geste est stable', () => {
    const p = pointeurEn(Math.PI / 3);
    const n1 = cranDepuisPointeur(p.dx, p.dy, 4);
    const n2 = cranDepuisPointeur(p.dx, p.dy, n1);
    expect(n2).toBe(n1);
  });

  it('la distance au centre n’a AUCUN effet : seul l’angle compte', () => {
    // L'élève n'a pas à rester pile sur le cercle pour enrouler.
    for (const rayon of [12, 40, 78, 140, 400]) {
      const p = pointeurEn(Math.PI / 4, rayon);
      expect(cranDepuisPointeur(p.dx, p.dy, 3)).toBe(3);
    }
  });

  it('cranPrincipalDe rend toujours un cran du PREMIER tour', () => {
    for (let a = -3 * TAU; a < 3 * TAU; a += TAU / 100) {
      const p = pointeurEn(a);
      const k = cranPrincipalDe(p.dx, p.dy);
      expect(k).toBeGreaterThanOrEqual(0);
      expect(k).toBeLessThan(24);
    }
  });

  it('les deux chemins — glisser et cliquet — mènent au MÊME état', () => {
    // Le clavier et les boutons restent des chemins complets : ils doivent
    // produire exactement les mêmes crans que le doigt.
    for (let n = CRAN_MIN + 1; n < CRAN_MAX; n += 1) {
      const p = pointeurEn(tDuCran(n));
      expect(cranDepuisPointeur(p.dx, p.dy, n - 1)).toBe(n);
    }
  });
});

describe('LE GLISSER DU SOMMET — module 6', () => {
  it('le sommet d’une onde est bien au QUART du motif, et il y vaut A', () => {
    for (const l of LECTURES) {
      const f = onde(l.A, l.P);
      expect(sommetDe(l.P)).toBeCloseTo(l.P / 4, 12);
      expect(f(sommetDe(l.P))).toBeCloseTo(l.A, 12);
    }
  });

  it('AIMANTATION : un doigt approximatif tombe EXACTEMENT sur un réglage permis', () => {
    for (const l of LECTURES) {
      for (const dx of [-0.25, 0, 0.25]) {
        for (const dy of [-0.2, 0, 0.2]) {
          const { A, P } = reglageDepuisSommet(sommetDe(l.P) + dx, l.A + dy);
          expect(ECARTS).toContain(A);
          expect(MOTIFS.some((m) => Math.abs(m - P) < 1e-12)).toBe(true);
        }
      }
    }
  });

  it('lâché SUR le sommet d’une cible, le glisser rend EXACTEMENT cette cible', () => {
    // Sans quoi la consigne « superpose les deux courbes » serait infaisable.
    for (const l of LECTURES) {
      const { A, P } = reglageDepuisSommet(sommetDe(l.P), l.A);
      expect(A).toBe(l.A);
      expect(P).toBeCloseTo(l.P, 12);
    }
  });

  it('les deux réglages sont INDÉPENDANTS — c’est ce que le module fait sentir', () => {
    // Bouger en hauteur ne change pas le motif, et inversement.
    const base = reglageDepuisSommet(sommetDe(TAU), 1);
    const plusHaut = reglageDepuisSommet(sommetDe(TAU), 3);
    expect(plusHaut.P).toBeCloseTo(base.P, 12);
    expect(plusHaut.A).not.toBe(base.A);

    const plusLarge = reglageDepuisSommet(sommetDe(4 * Math.PI), 1);
    expect(plusLarge.A).toBe(base.A);
    expect(plusLarge.P).not.toBeCloseTo(base.P, 6);
  });

  it('un glisser hors cadre reste borné à un réglage permis', () => {
    for (const [x, y] of [[-50, -50], [0, 0], [999, 999], [-1, 2]]) {
      const { A, P } = reglageDepuisSommet(x, y);
      expect(ECARTS).toContain(A);
      expect(MOTIFS.some((m) => Math.abs(m - P) < 1e-12)).toBe(true);
    }
  });

  it('aimanter rend toujours un élément de la liste, jamais une valeur inventée', () => {
    for (let v = -5; v <= 15; v += 0.13) {
      expect(ECARTS).toContain(aimanter(v, ECARTS));
      expect(MOTIFS).toContain(aimanter(v, MOTIFS));
    }
  });
});

describe('LA POIGNÉE du module 6 est toujours attrapable', () => {
  it('le sommet de toute vague réglable est DANS le cadre — balayé', () => {
    // Une poignée hors cadre serait inattrapable : le glisser deviendrait le
    // seul chemin impossible, et la manipulation signature du module tomberait.
    for (const A of ECARTS) {
      for (const P of MOTIFS) {
        const x = GEOM_ONDE.toX(sommetDe(P));
        const y = GEOM_ONDE.toY(A);
        // Marge de 8 px : la pastille elle-même mesure 7 px de rayon.
        expect(x).toBeGreaterThanOrEqual(8);
        expect(x).toBeLessThanOrEqual(GEOM_ONDE.W - 8);
        expect(y).toBeGreaterThanOrEqual(8);
        expect(y).toBeLessThanOrEqual(GEOM_ONDE.H - 8);
      }
    }
  });

  it('deux réglages voisins donnent des poignées DISTINCTES — le geste est lisible', () => {
    const vus = new Set();
    for (const A of ECARTS) {
      for (const P of MOTIFS) {
        const cle = `${GEOM_ONDE.toX(sommetDe(P)).toFixed(1)}|${GEOM_ONDE.toY(A).toFixed(1)}`;
        expect(vus.has(cle)).toBe(false);
        vus.add(cle);
      }
    }
    expect(vus.size).toBe(ECARTS.length * MOTIFS.length);
  });
});

/**
 * LES DEUX DÉFAUTS VISUELS TROUVÉS AU NAVIGATEUR, verrouillés ici.
 *
 * Ils avaient passé les tests d'origine parce que ceux-ci mesuraient la figure
 * SEULE. Un chevauchement naît de la RENCONTRE de deux familles d'étiquettes
 * (abscisses × ordonnées), et un débordement naît de la rencontre du dessin
 * avec la LARGEUR DISPONIBLE. Les deux se balayent, ils ne s'échantillonnent
 * pas.
 */
describe('DÉFAUT 1 — aucune étiquette d’abscisse ne touche la gouttière des ordonnées', () => {
  const { largeurTexte, GOUTTIERE_DEBUT, GOUTTIERE_FIN, ORDONNEES, TICKS, toY, H, W } = GEOM_ONDE;

  /** La boîte d'une étiquette d'abscisse, centrée sur sa graduation. */
  const boiteAbs = (t) => {
    const d = largeurTexte(t.label) / 2;
    return { x1: t.x - d, x2: t.x + d, y1: toY(0) + 18 - 8, y2: toY(0) + 18 + 2 };
  };
  /** La boîte d'une étiquette d'ordonnée, alignée à droite sur la gouttière. */
  const boiteOrd = (y) => ({
    x1: GOUTTIERE_FIN - largeurTexte(fr(y, 0)), x2: GOUTTIERE_FIN,
    y1: toY(y) + 3.5 - 8, y2: toY(y) + 3.5 + 2,
  });

  it('AUCUN couple (abscisse écrite × ordonnée) ne se chevauche — balayage complet', () => {
    // C'est exactement le défaut rapporté : « chevauchement −1 ↔ −2π ».
    for (const t of TICKS.filter((g) => g.etiquetee)) {
      const a = boiteAbs(t);
      for (const y of ORDONNEES) {
        const o = boiteOrd(y);
        const ox = Math.min(a.x2, o.x2) - Math.max(a.x1, o.x1);
        const oy = Math.min(a.y2, o.y2) - Math.max(a.y1, o.y1);
        // Le seuil de l'audit du navigateur est 1,5 px sur les DEUX axes.
        expect(ox > 1.5 && oy > 1.5).toBe(false);
      }
    }
  });

  it('la graduation −2π, celle qui a causé le défaut, n’est PLUS écrite', () => {
    const g = TICKS.find((x) => x.label === '−2π');
    expect(g).toBeDefined();
    expect(g.etiquetee).toBe(false);      // trait gardé, texte retiré
  });

  it('une graduation non écrite garde tout de même son TRAIT', () => {
    // Le repère reste gradué : on ne perd pas la lecture, seulement le texte.
    expect(TICKS.length).toBeGreaterThan(TICKS.filter((g) => g.etiquetee).length);
    for (const g of TICKS) expect(Number.isFinite(g.x)).toBe(true);
  });

  it('toute étiquette écrite tient entièrement DANS le cadre', () => {
    for (const t of TICKS.filter((g) => g.etiquetee)) {
      expect(t.x - t.demi).toBeGreaterThanOrEqual(0);
      expect(t.x + t.demi).toBeLessThanOrEqual(W);
    }
  });

  it('deux étiquettes d’abscisse écrites ne se chevauchent pas entre elles', () => {
    const ecrites = TICKS.filter((g) => g.etiquetee);
    for (let i = 1; i < ecrites.length; i += 1) {
      const a = ecrites[i - 1];
      const b = ecrites[i];
      expect(b.x - b.demi).toBeGreaterThan(a.x + a.demi + 1.5);
    }
  });

  it('il reste assez de graduations écrites pour que le repère soit lisible', () => {
    // Une parade qui supprimerait TOUTES les étiquettes « réglerait » le
    // chevauchement en cassant la lecture. Ce test l'interdit.
    expect(TICKS.filter((g) => g.etiquetee).length).toBeGreaterThanOrEqual(5);
  });

  it('les repères pédagogiques du module 6 restent écrits', () => {
    // On doit pouvoir lire un motif d'un sommet au sommet suivant.
    for (const l of ['π', '2π', '3π', '4π']) {
      expect(TICKS.some((g) => g.etiquetee && g.label === l)).toBe(true);
    }
  });
});

describe('DÉFAUT 2 — le dérouloir tient dans la largeur disponible, mesurée', () => {
  /** Les largeurs réellement rencontrées, du téléphone au grand écran. */
  const LARGEURS = [240, 263, 280, 320, 343, 375, 420, 480, 560, 640, 768, 1024];

  it('pour TOUTE largeur disponible, la fenêtre choisie y TIENT', () => {
    // C'est le défaut rapporté : 530 px de dessin dans un <main> de 375.
    for (const dispo of LARGEURS) {
      const v = fenetreDerouleur(dispo);
      // La plus étroite des fenêtres est le dernier recours : elle doit tenir
      // même dans la plus petite largeur testée.
      if (dispo >= geometrieFenetre(FENETRES[FENETRES.length - 1]).largeur) {
        expect(v.largeur).toBeLessThanOrEqual(dispo);
      }
    }
  });

  it('à 375 px de <main>, le dessin ne dépasse jamais la place réelle', () => {
    // Le conteneur perd les marges de page et ses propres bordures : on prend
    // la mesure basse observée au navigateur.
    const v = fenetreDerouleur(263);
    expect(v.largeur).toBeLessThanOrEqual(263);
  });

  it('CHAQUE fenêtre candidate garde les DEUX gestes de la leçon', () => {
    // Non négociable : une fenêtre qui ne dépasserait pas 2π rendrait la
    // périodicité inobservable, et une qui n'irait pas sous 0 rendrait la
    // parité inobservable. Le sujet même de la leçon.
    for (const f of FENETRES) {
      const g = geometrieFenetre(f);
      expect(g.tMax).toBeGreaterThan(TAU);
      expect(g.tMin).toBeLessThan(0);
      // Assez de crans au-delà d'un tour et en deçà de zéro pour que les
      // objectifs des modules 1 et 3 soient atteignables.
      expect(f.cranMax - 24).toBeGreaterThanOrEqual(6);
      expect(-f.cranMin).toBeGreaterThanOrEqual(6);
    }
  });

  it('dans CHAQUE fenêtre, les étiquettes restent séparées et dans le cadre', () => {
    const largeur = (s) => [...String(s)].reduce((n, c) => n + (c === '−' ? 5.5 : 6), 0);
    for (const f of FENETRES) {
      const g = geometrieFenetre(f);
      const ecrites = g.graduations.filter((x) => x.label !== null);
      for (let i = 1; i < ecrites.length; i += 1) {
        const a = ecrites[i - 1];
        const b = ecrites[i];
        expect(b.x - a.x).toBeGreaterThan(largeur(a.label) / 2 + largeur(b.label) / 2 + 4);
      }
      for (const x of ecrites) {
        expect(x.x - largeur(x.label) / 2).toBeGreaterThanOrEqual(0);
        expect(x.x + largeur(x.label) / 2).toBeLessThanOrEqual(g.largeur);
      }
    }
  });

  it('dans CHAQUE fenêtre, tout point atteignable reste DANS le cadre', () => {
    for (const f of FENETRES) {
      const g = geometrieFenetre(f);
      for (let n = f.cranMin; n <= f.cranMax; n += 1) {
        const t = tDuCran(n);
        const x = g.xDe(t);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(g.largeur);
        for (const fn of FONCTIONS) {
          const y = yDeVal(fn.exact(t));
          expect(y).toBeGreaterThanOrEqual(0);
          expect(y).toBeLessThanOrEqual(H_CADRE);
        }
      }
    }
  });

  it('les fenêtres sont classées de la plus riche à la plus étroite', () => {
    const l = FENETRES.map((f) => geometrieFenetre(f).largeur);
    for (let i = 1; i < l.length; i += 1) expect(l[i]).toBeLessThanOrEqual(l[i - 1]);
  });

  it('la fenêtre la plus large est celle du bureau, et couvre trois tours', () => {
    const g = fenetreDerouleur(10000);
    expect(g.cranMin).toBe(CRAN_MIN);
    expect(g.cranMax).toBe(CRAN_MAX);
  });

  it('une largeur nulle (avant la première mesure) rend une fenêtre qui tient partout', () => {
    // Le premier rendu a lieu AVANT que le ResizeObserver ait mesuré : il ne
    // doit jamais déborder, sinon le défaut réapparaîtrait le temps d'une frame.
    const v = fenetreDerouleur(0);
    expect(v.largeur).toBeLessThanOrEqual(263);
  });

  it('le cliquet reste ATTEIGNABLE aux valeurs remarquables dans chaque fenêtre', () => {
    // Réduire la fenêtre ne doit pas rendre une cible pédagogique inatteignable.
    for (const f of FENETRES) {
      for (const v of EXIGEES) {
        const n = Math.round(v.t / PAS);
        expect(n).toBeGreaterThanOrEqual(f.cranMin);
        expect(n).toBeLessThanOrEqual(f.cranMax);
      }
      // Et les cibles nommées des modules 1 et 2.
      for (const id of ['deux-pi-plus-pi-6', 'moins-pi-6', 'deux-pi']) {
        const c = CIBLES.find((x) => x.id === id);
        expect(c.cran).toBeGreaterThanOrEqual(f.cranMin);
        expect(c.cran).toBeLessThanOrEqual(f.cranMax);
      }
    }
  });
});
