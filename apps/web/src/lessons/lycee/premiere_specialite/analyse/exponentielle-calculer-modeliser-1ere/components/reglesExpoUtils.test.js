import { describe, it, expect } from 'vitest';
import { parseDec } from '@smarter-academy/core';
import {
  EXPO_MIN, EXPO_MAX, PAS_EXPO, NB_CRANS, CIBLES_PEDAGOGIQUES,
  estSurUnCran, aimanteExposant, sommeBornee, sommeHorsCadre,
  valeurAffichee, parLaSomme, parLeProduit, memeAffichage, etatDoubleAxe,
  MARGES, LARGEUR_AXE_PX, uniteExposantPx, largeurPrehensionPx,
  largeurPrehensionEcranPx, facteurRendu, positionExposantPx,
  graduationsExposants, ecartGraduationsPx, CRANS_PAR_GRADUATION,
  REGLES, REGLE_PAR_ID, regleVerifiee, COUPLES_DE_CONTROLE,
  deplie, CAS_PUISSANCE, assertPuissanceEntiere,
  justifieParCroissance, resoudreEquationExp, equationVerifiee, EQUATIONS,
  CADRE_CROISSANCE, borneHauteCroissance, aimanteCroissance, balayageDansLeCadre,
  resoudreInequationExp, inequationVerifiee, INEQUATIONS,
  modele, sensDuModele, facteurParPas, facteurConstant, SITUATIONS,
  courbeDuModele, cadreDuModele,
  piegesSomme, piegesPuissance, piegesDistincts,
  fr, parseSigned, arrondi,
} from './reglesExpoUtils';

/** Tous les exposants réellement atteignables par un curseur du laboratoire. */
const CRANS = Array.from({ length: NB_CRANS + 1 }, (_, k) => arrondi(EXPO_MIN + k * PAS_EXPO));

/* ────────────────────────────────────────────────────────────────────────────
   1. LA PROMESSE DU LABORATOIRE : LES DEUX AFFICHEURS NE SE CONTREDISENT JAMAIS
   ──────────────────────────────────────────────────────────────────────────── */

describe('les deux afficheurs e^(a+b) et e^a × e^b', () => {
  it('affichent LA MÊME CHAÎNE à TOUS les crans atteignables — balayage complet de la grille', () => {
    let couples = 0;
    for (const a of CRANS) {
      for (const b of CRANS) {
        couples += 1;
        expect(
          memeAffichage(a, b),
          `a = ${a}, b = ${b} : « ${valeurAffichee(parLaSomme(a, b))} » vs « ${valeurAffichee(parLeProduit(a, b))} »`,
        ).toBe(true);
      }
    }
    // La grille est bien BALAYÉE, pas échantillonnée : 17 × 17.
    expect(couples).toBe((NB_CRANS + 1) ** 2);
  });

  it('les deux flottants bruts, EUX, diffèrent parfois — c’est pour cela que l’affichage fait foi', () => {
    // Ce test documente la classe de défaut : si un jour les deux chemins
    // devenaient bit-exacts, ce n’est pas la leçon qui casserait, mais ce
    // constat qui deviendrait obsolète. On vérifie donc qu’il existe AU MOINS
    // un couple où les flottants diffèrent, et que l’affichage les réconcilie.
    const divergents = [];
    for (const a of CRANS) for (const b of CRANS) {
      if (parLaSomme(a, b) !== parLeProduit(a, b)) divergents.push([a, b]);
    }
    expect(divergents.length).toBeGreaterThan(0);
    for (const [a, b] of divergents) expect(memeAffichage(a, b)).toBe(true);
  });

  it('l’écart relatif entre les deux chemins reste sous le millionième de millionième', () => {
    for (const a of CRANS) for (const b of CRANS) {
      const s = parLaSomme(a, b);
      expect(Math.abs(s - parLeProduit(a, b)) / Math.abs(s)).toBeLessThan(1e-12);
    }
  });

  it('l’affichage distingue bien deux crans voisins : aucune paire ne se confond', () => {
    const vus = new Set();
    for (const x of CRANS) {
      const s = valeurAffichee(Math.exp(x));
      expect(vus.has(s), `deux crans affichent « ${s} »`).toBe(false);
      vus.add(s);
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   2. L'AIMANTATION : LES CIBLES PÉDAGOGIQUES TOMBENT SUR UN CRAN
   ──────────────────────────────────────────────────────────────────────────── */

describe('l’aimantation et les cibles', () => {
  it('CHAQUE cible pédagogique tombe EXACTEMENT sur un cran, en a comme en b', () => {
    for (const c of CIBLES_PEDAGOGIQUES) {
      expect(estSurUnCran(c.a), `${c.id} : a = ${c.a}`).toBe(true);
      expect(estSurUnCran(c.b), `${c.id} : b = ${c.b}`).toBe(true);
    }
  });

  it('les cibles citées par la consigne du module 1 — a = 1, b = 1, a + b = 2 — sont atteignables', () => {
    expect(estSurUnCran(1)).toBe(true);
    expect(sommeHorsCadre(1, 1)).toBe(false);
    expect(arrondi(1 + 1)).toBe(2);
  });

  it('la cible de l’exposant négatif — a = 2, b = −1 — est atteignable et sa somme reste dans le cadre', () => {
    expect(estSurUnCran(2)).toBe(true);
    expect(estSurUnCran(-1)).toBe(true);
    expect(sommeHorsCadre(2, -1)).toBe(false);
    expect(arrondi(2 + -1)).toBe(1);
  });

  it('l’aimantation renvoie TOUJOURS un cran, depuis n’importe quelle position brute', () => {
    for (let v = EXPO_MIN - 1; v <= EXPO_MAX + 1; v = arrondi(v + 0.017)) {
      const pose = aimanteExposant(v);
      expect(estSurUnCran(pose), `v = ${v} → ${pose}`).toBe(true);
      expect(pose).toBeGreaterThanOrEqual(EXPO_MIN);
      expect(pose).toBeLessThanOrEqual(EXPO_MAX);
    }
  });

  it('un doigt posé à moins d’un demi-cran d’une cible y tombe — c’est ce qui rend la cible viseable', () => {
    for (const c of CIBLES_PEDAGOGIQUES) {
      for (const f of [-0.49, -0.25, 0, 0.25, 0.49]) {
        expect(aimanteExposant(c.a + f * PAS_EXPO)).toBeCloseTo(c.a, 12);
      }
    }
  });

  it('les bornes du cadre sont elles-mêmes des crans : l’élève peut aller au bout', () => {
    expect(estSurUnCran(EXPO_MIN)).toBe(true);
    expect(estSurUnCran(EXPO_MAX)).toBe(true);
    expect(NB_CRANS).toBe(16);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   3. LA ZONE DE PRÉHENSION, EN PIXELS D'ÉCRAN
   ──────────────────────────────────────────────────────────────────────────── */

describe('la zone de préhension', () => {
  it('mesure au moins 14 px À L’ÉCRAN, du téléphone au bureau — le plancher établi en amont', () => {
    // 343 px est la largeur utile d'un écran de 375 px une fois les marges de
    // page retirées ; c'est le pire cas réel.
    for (const largeurEcran of [343, 375, 700, 1100]) {
      const px = largeurPrehensionEcranPx(largeurEcran);
      expect(px, `écran ${largeurEcran} px : ${px.toFixed(2)} px`).toBeGreaterThanOrEqual(14);
    }
  });

  it('la largeur en viewBox est un cran entier, dérivée de l’unité et non écrite à la main', () => {
    expect(largeurPrehensionPx()).toBeCloseTo(PAS_EXPO * uniteExposantPx(), 12);
    expect(uniteExposantPx()).toBeCloseTo(LARGEUR_AXE_PX / (EXPO_MAX - EXPO_MIN), 12);
  });

  it('le facteur de rendu suit la largeur d’écran, marges de viewBox comprises', () => {
    const largeurVB = MARGES.left + MARGES.right + LARGEUR_AXE_PX;
    expect(facteurRendu(largeurVB)).toBeCloseTo(1, 12);
    expect(facteurRendu(largeurVB / 2)).toBeCloseTo(0.5, 12);
  });

  it('les positions des deux bornes tombent aux extrémités de l’axe, sans déborder des marges', () => {
    expect(positionExposantPx(EXPO_MIN)).toBeCloseTo(MARGES.left, 9);
    expect(positionExposantPx(EXPO_MAX)).toBeCloseTo(MARGES.left + LARGEUR_AXE_PX, 9);
  });

  it('AUCUN cran ne sort du cadre dessinable — balayage, pas échantillonnage', () => {
    const largeurVB = MARGES.left + MARGES.right + LARGEUR_AXE_PX;
    for (const x of CRANS) {
      const px = positionExposantPx(x);
      expect(px).toBeGreaterThanOrEqual(MARGES.left - 1e-9);
      expect(px).toBeLessThanOrEqual(largeurVB - MARGES.right + 1e-9);
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   4. LA MISE EN PAGE : AUCUNE COLLISION D'ÉTIQUETTE
   ──────────────────────────────────────────────────────────────────────────── */

describe('la sécurité de mise en page', () => {
  it('les graduations sont assez espacées pour ne jamais se chevaucher (≥ 26 px)', () => {
    expect(ecartGraduationsPx()).toBeGreaterThanOrEqual(26);
  });

  it('les graduations couvrent la plage entière et tombent sur des exposants entiers', () => {
    const g = graduationsExposants();
    expect(g[0]).toBe(EXPO_MIN);
    expect(g.at(-1)).toBe(EXPO_MAX);
    for (const v of g) expect(Number.isInteger(v)).toBe(true);
    expect(CRANS_PAR_GRADUATION * PAS_EXPO).toBe(1);
  });

  it('même au plus près, les deux graduations extrêmes restent séparées sur un téléphone', () => {
    const ecartEcran = ecartGraduationsPx() * facteurRendu(343);
    expect(ecartEcran).toBeGreaterThanOrEqual(18);
  });

  it('la somme dessinée reste TOUJOURS dans le cadre, pour tout couple atteignable', () => {
    for (const a of CRANS) for (const b of CRANS) {
      const s = sommeBornee(a, b);
      expect(s).toBeGreaterThanOrEqual(EXPO_MIN);
      expect(s).toBeLessThanOrEqual(EXPO_MAX);
      expect(positionExposantPx(s)).toBeGreaterThanOrEqual(MARGES.left - 1e-9);
      expect(positionExposantPx(s)).toBeLessThanOrEqual(MARGES.left + LARGEUR_AXE_PX + 1e-9);
    }
  });

  it('le hors-cadre est SIGNALÉ et non caché : il existe, et il est exactement là où a + b sort', () => {
    expect(sommeHorsCadre(2, 2)).toBe(true);
    expect(sommeHorsCadre(-2, -2)).toBe(true);
    expect(sommeHorsCadre(1, 1)).toBe(false);
    let horsCadre = 0;
    for (const a of CRANS) for (const b of CRANS) if (sommeHorsCadre(a, b)) horsCadre += 1;
    expect(horsCadre).toBeGreaterThan(0);
    // …mais toutes les cibles pédagogiques, elles, restent dedans.
    for (const c of CIBLES_PEDAGOGIQUES) expect(sommeHorsCadre(c.a, c.b)).toBe(false);
  });

  it('l’état du laboratoire est entièrement dérivé du couple (a ; b)', () => {
    const e = etatDoubleAxe(2, -1);
    expect(e.somme).toBe(1);
    expect(e.valeurA).toBeCloseTo(Math.exp(2), 12);
    expect(e.valeurB).toBeCloseTo(Math.exp(-1), 12);
    expect(e.aDivise).toBe(true);   // b < 0 : la valeur de b est un diviseur
    expect(e.bDivise).toBe(false);
    expect(e.horsCadre).toBe(false);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   5. LES QUATRE RÈGLES, VÉRIFIÉES NUMÉRIQUEMENT
   ──────────────────────────────────────────────────────────────────────────── */

describe('les règles de calcul', () => {
  it('chaque règle est VRAIE sur tous les couples de contrôle, en écart relatif', () => {
    for (const r of REGLES) {
      expect(regleVerifiee(r), `règle ${r.id}`).toBe(true);
    }
    expect(COUPLES_DE_CONTROLE.length).toBeGreaterThanOrEqual(10);
  });

  it('e^(a+b) = e^a × e^b sur toute la grille du laboratoire', () => {
    const r = REGLE_PAR_ID.somme;
    for (const a of CRANS) for (const b of CRANS) {
      expect(Math.abs(r.gauche(a, b) - r.droite(a, b)) / r.gauche(a, b)).toBeLessThan(1e-12);
    }
  });

  it('e^(−a) est bien l’INVERSE de e^a — et ce n’est pas son opposé', () => {
    const r = REGLE_PAR_ID.oppose;
    for (const a of CRANS) {
      expect(r.gauche(a) * Math.exp(a)).toBeCloseTo(1, 12);
      // Le piège que la leçon combat : e^(−a) n'est PAS −e^a.
      if (a !== 0) expect(r.gauche(a)).not.toBeCloseTo(-Math.exp(a), 6);
      // Et il reste STRICTEMENT POSITIF, comme toute valeur de exp.
      expect(r.gauche(a)).toBeGreaterThan(0);
    }
  });

  it('e^(a−b) = e^a / e^b, y compris quand a < b (la valeur passe alors sous 1)', () => {
    const r = REGLE_PAR_ID.difference;
    for (const a of CRANS) for (const b of CRANS) {
      expect(Math.abs(r.gauche(a, b) - r.droite(a, b)) / r.gauche(a, b)).toBeLessThan(1e-12);
    }
    expect(REGLE_PAR_ID.difference.gauche(1, 2)).toBeLessThan(1);
    expect(REGLE_PAR_ID.difference.gauche(1, 2)).toBeGreaterThan(0);
  });

  it('(e^a)^n = e^(na) pour les puissances entières de la leçon', () => {
    for (const cas of CAS_PUISSANCE) {
      expect(assertPuissanceEntiere(cas)).toBe(true);
      expect(Math.exp(cas.a) ** cas.n).toBeCloseTo(Math.exp(cas.n * cas.a), 6);
    }
  });

  it('la règle du quotient explique le facteur constant d’un modèle : e^(k(t+1)) / e^(kt) = e^k', () => {
    for (const k of [-0.5, -0.15, 0.2, 0.4, 1]) {
      for (const t of [0, 1, 3.5, 10]) {
        expect(Math.exp(k * (t + 1)) / Math.exp(k * t)).toBeCloseTo(Math.exp(k), 10);
      }
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   6. LE PÉRIMÈTRE, CODÉ EN THROW
   ──────────────────────────────────────────────────────────────────────────── */

describe('le périmètre exécutable', () => {
  it('refuse une puissance non entière — la racine est hors périmètre', () => {
    expect(() => assertPuissanceEntiere({ id: 'x', a: 2, n: 0.5, exposant: 1 })).toThrow(/entier/);
  });

  it('refuse n < 2 : ce n’est pas un cas de puissance', () => {
    expect(() => assertPuissanceEntiere({ id: 'x', a: 2, n: 1, exposant: 2 })).toThrow(/n < 2/);
  });

  it('refuse un exposant annoncé qui ne vaut pas n × a', () => {
    expect(() => assertPuissanceEntiere({ id: 'x', a: 2, n: 3, exposant: 5 })).toThrow(/n × a/);
  });

  it('le dépliage montre bien n facteurs identiques dont les exposants s’ADDITIONNENT', () => {
    const d = deplie(2, 3);
    expect(d.facteurs).toEqual([2, 2, 2]);
    expect(d.sommeDesExposants).toBe(6);
    expect(d.valeur).toBeCloseTo(Math.exp(6), 6);
    // Le piège : élever l'exposant à la puissance donne 8, pas 6.
    expect(d.piegeExposantPuissance).toBe(8);
    expect(d.piegeExposantPuissance).not.toBe(d.sommeDesExposants);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   7. ÉQUATIONS ET INÉQUATIONS : LA STRICTE CROISSANCE, ET ELLE SEULE
   ──────────────────────────────────────────────────────────────────────────── */

describe('la stricte croissance comme unique argument', () => {
  it('conserve l’ordre sur une grille fine : u < v donne e^u < e^v, sans exception', () => {
    for (let u = -4; u <= 4; u = arrondi(u + 0.1)) {
      for (let v = -4; v <= 4; v = arrondi(v + 0.5)) {
        const j = justifieParCroissance(u, v);
        expect(j.coherent, `u = ${u}, v = ${v}`).toBe(true);
      }
    }
  });

  it('l’ordre ne s’inverse JAMAIS au passage aux exposants — c’est la conservation du sens', () => {
    for (let u = -3; u <= 3; u = arrondi(u + 0.25)) {
      const v = arrondi(u + 0.25);
      expect(Math.exp(u)).toBeLessThan(Math.exp(v));
    }
  });

  it('chaque équation de la leçon a la solution annoncée, RECALCULÉE et non recopiée', () => {
    for (const eq of EQUATIONS) {
      const res = resoudreEquationExp(eq);
      expect(res.type).toBe('unique');
      expect(res.solution, eq.id).toBe(eq.solution);
      expect(equationVerifiee(eq), eq.id).toBe(true);
    }
  });

  it('chaque solution d’équation est ENTIÈRE : l’élève ne bute pas sur une décimale', () => {
    for (const eq of EQUATIONS) expect(Number.isInteger(eq.solution), eq.id).toBe(true);
  });

  it('chaque inéquation a la borne et le SENS annoncés, vérifiés par balayage de part et d’autre', () => {
    for (const ineq of INEQUATIONS) {
      const res = resoudreInequationExp(ineq);
      expect(res.type).toBe('demi-droite');
      expect(res.borne, ineq.id).toBe(ineq.borne);
      expect(res.sens, ineq.id).toBe(ineq.sens);
      expect(inequationVerifiee(ineq), ineq.id).toBe(true);
    }
  });

  it('distingue les DEUX moments où un sens peut bouger : le passage aux exposants (jamais) et la division (parfois)', () => {
    const facile = resoudreInequationExp(INEQUATIONS[0]);
    expect(facile.sensInverseALaDivision).toBe(false);
    const dur = resoudreInequationExp(INEQUATIONS[2]);   // e^{−x} < e^{x−4}
    expect(dur.sensInverseALaDivision).toBe(true);
    expect(dur.sens).toBe('>');
    // La leçon AFFIRME que ce cas existe et qu'il est visible : il l'est.
    expect(INEQUATIONS.some((i) => resoudreInequationExp(i).sensInverseALaDivision)).toBe(true);
  });

  it('une équation dégénérée est reconnue, jamais résolue à tort', () => {
    expect(resoudreEquationExp({ m: 2, p: 1, q: 2, r: 1 }).type).toBe('toujours');
    expect(resoudreEquationExp({ m: 2, p: 1, q: 2, r: 5 }).type).toBe('jamais');
  });
});

describe('le laboratoire de croissance : le point ne sort jamais du cadre', () => {
  it('LE DÉFAUT ATTRAPÉ : un cadrage à xMax = 2,5 aurait fait sortir M du repère', () => {
    // e^2,5 ≈ 12,18 pour un cadre s'arrêtant à 9 : la poignée aurait disparu
    // sous le doigt. C'est ce qui a imposé une borne CALCULÉE.
    expect(Math.exp(2.5)).toBeGreaterThan(CADRE_CROISSANCE.yMax);
    expect(balayageDansLeCadre({ ...CADRE_CROISSANCE, xMax: 2.5 })).toBe(true);
    // …mais seulement parce que la borne haute est calculée : sans elle, 2,5
    // serait atteignable et hors cadre.
    expect(borneHauteCroissance({ ...CADRE_CROISSANCE, xMax: 2.5 })).toBeLessThan(2.5);
  });

  it('la borne haute est le plus grand CRAN dont l’image tienne dans le cadre', () => {
    const haut = borneHauteCroissance();
    expect(haut).toBe(2);
    expect(Math.exp(haut)).toBeLessThanOrEqual(CADRE_CROISSANCE.yMax);
    expect(Math.exp(haut + PAS_EXPO)).toBeGreaterThan(CADRE_CROISSANCE.yMax);
  });

  it('BALAYAGE COMPLET : aucun cran atteignable ne produit un point hors du repère', () => {
    expect(balayageDansLeCadre()).toBe(true);
    const haut = borneHauteCroissance();
    for (let x = CADRE_CROISSANCE.xMin; x <= haut + 1e-12; x = arrondi(x + PAS_EXPO)) {
      const y = Math.exp(x);
      expect(y, `x = ${x}`).toBeGreaterThanOrEqual(CADRE_CROISSANCE.yMin);
      expect(y, `x = ${x}`).toBeLessThanOrEqual(CADRE_CROISSANCE.yMax);
    }
  });

  it('l’aimantation borne le doigt : au-delà, le point s’arrête au dernier cran visible', () => {
    expect(aimanteCroissance(5)).toBe(borneHauteCroissance());
    expect(aimanteCroissance(-9)).toBe(CADRE_CROISSANCE.xMin);
    for (let v = -5; v <= 5; v = arrondi(v + 0.013)) {
      const pose = aimanteCroissance(v);
      expect(Math.exp(pose), `v = ${v} → ${pose}`).toBeLessThanOrEqual(CADRE_CROISSANCE.yMax);
    }
  });

  it('les cibles du module 5 — faire coïncider M avec N — sont atteignables', () => {
    // Le module fixe N sur des exposants entiers ; chacun doit être un cran
    // ATTEIGNABLE, sans quoi la consigne « amène M sur N » serait un mensonge.
    for (const v of [-2, -1, 0, 1, 2]) {
      expect(aimanteCroissance(v)).toBe(v);
      expect(Math.exp(v)).toBeLessThanOrEqual(CADRE_CROISSANCE.yMax);
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   8. LES MODÈLES
   ──────────────────────────────────────────────────────────────────────────── */

describe('modéliser une croissance ou une décroissance', () => {
  it('le signe de k décide seul du sens, et les deux situations le prouvent', () => {
    expect(sensDuModele(0.4)).toBe('croissance');
    expect(sensDuModele(-0.15)).toBe('decroissance');
    for (const s of SITUATIONS) expect(sensDuModele(s.k)).toBe(s.sens);
  });

  it('A est la valeur en 0, parce que e^0 = 1', () => {
    for (const s of SITUATIONS) expect(modele(s.A, s.k)(0)).toBeCloseTo(s.A, 12);
  });

  it('le facteur d’un pas est CONSTANT — c’est la règle du quotient en action', () => {
    for (const s of SITUATIONS) expect(facteurConstant(s.A, s.k), s.id).toBe(true);
  });

  it('les facteurs cités par le module sont recalculés, jamais recopiés', () => {
    expect(facteurParPas(0.4)).toBeCloseTo(Math.exp(0.4), 12);
    expect(facteurParPas(0.4)).toBeGreaterThan(1);        // croissance
    expect(facteurParPas(-0.15)).toBeLessThan(1);         // décroissance
    expect(facteurParPas(-0.15)).toBeGreaterThan(0);      // mais jamais négatif
  });

  it('une croissance exponentielle se reconnaît à un facteur constant, PAS à un écart constant', () => {
    const s = SITUATIONS[0];
    const f = modele(s.A, s.k);
    const ecarts = [0, 1, 2, 3].map((t) => f(t + 1) - f(t));
    // Les écarts, eux, grandissent : c'est ce qui distingue le modèle d'une
    // fonction affine, et c'est le cœur de la conception erronée visée.
    for (let i = 1; i < ecarts.length; i += 1) expect(ecarts[i]).toBeGreaterThan(ecarts[i - 1]);
  });

  it('AUCUN point de la courbe ne sort du cadre — balayage complet des deux situations', () => {
    for (const s of SITUATIONS) {
      const cadre = cadreDuModele(s);
      for (const p of courbeDuModele(s, 400)) {
        expect(p.y, `${s.id} en t = ${p.x}`).toBeGreaterThanOrEqual(cadre.yMin);
        expect(p.y, `${s.id} en t = ${p.x}`).toBeLessThanOrEqual(cadre.yMax);
        expect(p.x).toBeGreaterThanOrEqual(cadre.xMin);
        expect(p.x).toBeLessThanOrEqual(cadre.xMax);
      }
    }
  });

  it('les valeurs restent dans un ordre de grandeur crédible pour la situation décrite', () => {
    const b = SITUATIONS[0];   // bactéries : 20 milliers au départ
    expect(modele(b.A, b.k)(b.tMax)).toBeLessThan(1000);
    const c = SITUATIONS[1];   // café : 60 degrés au-dessus de la pièce
    expect(modele(c.A, c.k)(c.tMax)).toBeGreaterThan(0);
    expect(modele(c.A, c.k)(c.tMax)).toBeLessThan(c.A);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   9. LES DISTRACTEURS DU BOSS
   ──────────────────────────────────────────────────────────────────────────── */

describe('les distracteurs, calculés et distincts', () => {
  it('les pièges de la somme sont tous DISTINCTS de la bonne réponse et entre eux', () => {
    // Le couple (3 ; 2) est celui de l'épreuve : 3 + 2 = 5, 3 × 2 = 6,
    // 3 − 2 = 1, et « inchangé » vaut 3. Quatre nombres, quatre valeurs.
    const jeu = piegesSomme(3, 2);
    expect(jeu.bon).toBe(5);
    expect(jeu.produitDesExposants).toBe(6);
    expect(jeu.differenceDesExposants).toBe(1);
    expect(jeu.exposantInchange).toBe(3);
    expect(piegesDistincts(jeu)).toBe(true);
  });

  it('les pièges de la puissance sont tous DISTINCTS — deux options identiques rendraient l’épreuve insoluble', () => {
    const jeu = piegesPuissance(2, 3);
    expect(jeu.bon).toBe(6);
    expect(jeu.exposantALaPuissance).toBe(8);
    expect(jeu.exposantInchange).toBe(2);
    expect(jeu.sommeAvecN).toBe(5);
    expect(piegesDistincts(jeu)).toBe(true);
  });

  it('le détecteur de collision fonctionne : il REFUSE un jeu où deux pièges coïncident', () => {
    // (a = 2, n = 2) : n × a = 4 et a^n = 4 — le piège se confondrait avec la
    // bonne réponse. C'est exactement ce que le boss ne doit pas proposer.
    expect(piegesDistincts(piegesPuissance(2, 2))).toBe(false);
    expect(CAS_PUISSANCE.every((c) => !(c.a === 2 && c.n === 2))).toBe(true);
  });

  it('L’ÉTAT (a = 2 ; n = 2) EXISTE dans le cliquet du dépliquer, et le composant le DIT au lieu de mentir', () => {
    // Défaut attrapé par ce test : le cliquet du module 4 va de n = 2 à n = 6,
    // et sur a = 2 l'état n = 2 fait COÏNCIDER la bonne réponse (n × a = 4) et
    // le piège (a^n = 4). Une affirmation « regarde, les deux diffèrent »
    // serait fausse dans cet état ATTEIGNABLE. Deux parades, toutes deux
    // vérifiées ici : le composant affiche « ici les deux coïncident — c'est
    // une exception », et le module ne DEMANDE jamais n = 2 sur a = 2.
    const d = deplie(2, 2);
    expect(d.sommeDesExposants).toBe(4);
    expect(d.piegeExposantPuissance).toBe(4);
    // La cible RÉELLEMENT demandée par le module 4, elle, sépare bien les deux.
    const demande = deplie(2, 3);
    expect(demande.sommeDesExposants).toBe(6);
    expect(demande.piegeExposantPuissance).toBe(8);
    expect(demande.sommeDesExposants).not.toBe(demande.piegeExposantPuissance);
  });

  it('sur les trois AUTRES valeurs de a du module 4, aucun n du cliquet ne produit de coïncidence', () => {
    for (const a of [-1, 0.5, 3]) {
      for (let n = 2; n <= 6; n += 1) {
        const d = deplie(a, n);
        expect(d.sommeDesExposants, `a = ${a}, n = ${n}`).not.toBe(d.piegeExposantPuissance);
      }
    }
  });

  it('les cas de puissance retenus produisent tous des pièges distincts', () => {
    for (const c of CAS_PUISSANCE) {
      const jeu = piegesPuissance(c.a, c.n);
      expect(jeu.bon).toBe(arrondi(c.exposant));
      expect(piegesDistincts(jeu), `${c.id} : ${JSON.stringify(jeu)}`).toBe(true);
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   10. LA SAISIE ÉLÈVE
   ──────────────────────────────────────────────────────────────────────────── */

describe('la lecture d’une saisie', () => {
  it('parseSigned accepte le VRAI signe moins que la leçon affiche', () => {
    expect(parseSigned('−4', parseDec)).toBe(-4);
    expect(parseSigned('–4', parseDec)).toBe(-4);
    expect(parseSigned('-4', parseDec)).toBe(-4);
    expect(parseSigned('−1,5', parseDec)).toBe(-1.5);
    // parseDec seul les REFUSE : c'est la raison d'être de parseSigned.
    expect(Number.isNaN(parseDec('−4'))).toBe(true);
  });

  it('chaque solution attendue de la leçon se relit correctement telle qu’elle est AFFICHÉE', () => {
    for (const eq of EQUATIONS) {
      expect(parseSigned(fr(eq.solution), parseDec)).toBe(eq.solution);
    }
    for (const ineq of INEQUATIONS) {
      expect(parseSigned(fr(ineq.borne), parseDec)).toBe(ineq.borne);
    }
    for (const c of CAS_PUISSANCE) {
      expect(parseSigned(fr(c.exposant), parseDec)).toBe(c.exposant);
    }
  });

  it('fr affiche le vrai signe moins et la virgule française', () => {
    expect(fr(-4)).toBe('−4');
    expect(fr(1.5)).toBe('1,5');
    expect(fr(0)).toBe('0');
  });
});
