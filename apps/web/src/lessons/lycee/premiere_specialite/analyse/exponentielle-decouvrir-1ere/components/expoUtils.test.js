import { describe, it, expect } from 'vitest';
import { parseDec } from '@smarter-academy/core';
import {
  PAS_EULER, NB_PAS, DEPARTS, FRACTION_AIMANT,
  penteImposee, hauteurSuivante, ligneEuler, etatDuPas,
  toleranceDuPas, pentesAcceptees, aimante, pasReussi,
  graduationDe, cadreDe, largeurAimantPx, largeurAimantEcranPx, facteurRendu,
  solutionExacte, ecartRelatifFinal, verifieUnicite,
  constructionDepuisZero, estStrictementPositive,
  EXP, E, tangenteEnZero, tangenteEn,
  CAS_EXP_U, assertCasSimple, expU, expUPrime, deriveeVerifiee,
  fr, parseSigned, eq, affiche, arrondi,
} from './expoUtils';
import { PAS_CONTACT } from './LaboExponentielle';

/* ────────────────────────────────────────────────────────────────────────────
   1. LA RÈGLE DU JEU, ET LA CONSTRUCTION QUI EN DÉCOULE
   ──────────────────────────────────────────────────────────────────────────── */

describe('la règle « la pente vaut la hauteur »', () => {
  it('la pente imposée EST la hauteur, sans exception', () => {
    for (const h of [0, 0.25, 0.5, 1, 2, 7.5]) expect(penteImposee(h)).toBe(h);
  });

  it('un pas avance de PAS_EULER × hauteur, ce qui multiplie la hauteur par 1,25', () => {
    for (const h of [0.5, 1, 2]) {
      expect(hauteurSuivante(h)).toBeCloseTo(h * (1 + PAS_EULER), 12);
      expect(hauteurSuivante(h)).toBeCloseTo(h * 1.25, 12);
    }
  });

  it('la ligne brisée part du départ imposé et compte NB_PAS segments', () => {
    for (const d of DEPARTS) {
      const pts = ligneEuler(d);
      expect(pts).toHaveLength(NB_PAS + 1);
      expect(pts[0]).toEqual({ x: 0, y: d });
      expect(pts.at(-1).x).toBe(1);
    }
  });

  it('les abscisses sont exactement 0 ; 0,25 ; 0,5 ; 0,75 ; 1 — toutes lisibles', () => {
    expect(ligneEuler(1).map((p) => p.x)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it('la construction depuis 1 donne les hauteurs attendues, recalculées et non recopiées', () => {
    const attendu = [1, 1.25, 1.5625, 1.953125, 2.44140625];
    ligneEuler(1).forEach((p, k) => expect(p.y).toBeCloseTo(attendu[k], 12));
  });

  it('etatDuPas dérive la cible de la règle : cible = de + pas × pente', () => {
    for (const d of DEPARTS) {
      for (let k = 0; k < NB_PAS; k += 1) {
        const e = etatDuPas(d, k);
        expect(e.pente).toBeCloseTo(e.de.y, 12);
        expect(e.vers.y).toBeCloseTo(e.de.y + PAS_EULER * e.pente, 12);
        expect(e.montee).toBeCloseTo(PAS_EULER * e.de.y, 12);
        expect(e.vers.x - e.de.x).toBeCloseTo(PAS_EULER, 12);
      }
    }
  });

  it('la ligne brisée est strictement croissante depuis un départ strictement positif', () => {
    for (const d of DEPARTS) {
      const pts = ligneEuler(d);
      for (let k = 1; k < pts.length; k += 1) expect(pts[k].y).toBeGreaterThan(pts[k - 1].y);
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   2. L'AIMANT — atteignable au doigt, et pas laxiste
   ──────────────────────────────────────────────────────────────────────────── */

describe('l’aimantation : la cible est atteignable, et elle seule', () => {
  it('CIBLE ATTEIGNABLE AU DOIGT : la zone mesure au moins 14 px à l’écran, pour TOUS les départs et TOUS les pas', () => {
    // BALAYAGE, pas échantillonnage : trois départs × quatre pas, aux deux
    // largeurs d'écran qui bornent le rendu (téléphone 375, bureau large).
    for (const largeurEcran of [343, 700, 1100]) {
      for (const d of DEPARTS) {
        for (let k = 0; k < NB_PAS; k += 1) {
          const px = largeurAimantEcranPx(d, k, largeurEcran);
          expect(px, `départ ${d}, pas ${k}, écran ${largeurEcran}px : ${px.toFixed(2)} px`)
            .toBeGreaterThanOrEqual(14);
        }
      }
    }
  });

  it('INVARIANCE D’ÉCHELLE : la zone mesure le MÊME nombre de pixels pour les trois départs', () => {
    for (let k = 0; k < NB_PAS; k += 1) {
      const largeurs = DEPARTS.map((d) => largeurAimantPx(d, k));
      for (const l of largeurs) expect(l).toBeCloseTo(largeurs[0], 9);
    }
  });

  it('le PREMIER pas est bien le plus étroit : c’est lui qui a décidé du pas d’Euler', () => {
    for (const d of DEPARTS) {
      const l = Array.from({ length: NB_PAS }, (_, k) => largeurAimantPx(d, k));
      for (let k = 1; k < l.length; k += 1) expect(l[k]).toBeGreaterThan(l[k - 1]);
    }
  });

  it('l’aimant colle EXACTEMENT à la cible dès qu’on entre dans la bande', () => {
    for (const d of DEPARTS) {
      for (let k = 0; k < NB_PAS; k += 1) {
        const e = etatDuPas(d, k);
        for (const f of [0, 0.25, 0.5, 0.75, 1]) {
          const y = e.vers.y + f * e.tolerance;
          expect(aimante(y, e)).toBeCloseTo(e.vers.y, 12);
          expect(pasReussi(aimante(y, e), e)).toBe(true);
        }
      }
    }
  });

  it('hors de la bande, le point RESTE où le doigt l’a mis — l’élève voit sa ligne partir de travers', () => {
    for (const d of DEPARTS) {
      const e = etatDuPas(d, 0);
      const y = e.vers.y + 1.5 * e.tolerance;
      expect(aimante(y, e)).toBeCloseTo(y, 12);
      expect(pasReussi(aimante(y, e), e)).toBe(false);
    }
  });

  it('l’aimant REFUSE la pente nulle, la pente moitié et la pente double', () => {
    const { min, max } = pentesAcceptees();
    expect(min).toBeGreaterThan(0);
    expect(min).toBeGreaterThan(0.5); // la pente moitié est refusée
    expect(max).toBeLessThan(2);      // la pente double est refusée
    for (const d of DEPARTS) {
      for (let k = 0; k < NB_PAS; k += 1) {
        const e = etatDuPas(d, k);
        const plate = e.de.y;                                   // pente 0
        const moitie = e.de.y + PAS_EULER * (e.pente / 2);      // pente h/2
        const double = e.de.y + PAS_EULER * (2 * e.pente);      // pente 2h
        for (const y of [plate, moitie, double]) {
          expect(pasReussi(aimante(y, e), e), `départ ${d} pas ${k}`).toBe(false);
        }
      }
    }
  });

  it('la tolérance est bien une fraction de la montée, jamais une constante', () => {
    for (const d of DEPARTS) {
      for (let k = 0; k < NB_PAS; k += 1) {
        const e = etatDuPas(d, k);
        expect(e.tolerance).toBeCloseTo(FRACTION_AIMANT * e.montee, 12);
        expect(toleranceDuPas(e.de.y)).toBeCloseTo(e.tolerance, 12);
      }
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   3. SÉCURITÉ DE MISE EN PAGE — la ligne brisée reste dans le cadre
   ──────────────────────────────────────────────────────────────────────────── */

describe('le cadre : tout état atteignable a un affichage valide', () => {
  it('la ligne brisée tient ENTIÈREMENT dans le cadre, sommet compris', () => {
    for (const d of DEPARTS) {
      const { range } = cadreDe(d);
      for (const p of ligneEuler(d)) {
        expect(p.x).toBeGreaterThanOrEqual(range.xMin);
        expect(p.x).toBeLessThanOrEqual(range.xMax);
        expect(p.y).toBeGreaterThan(range.yMin);
        expect(p.y, `départ ${d}`).toBeLessThan(range.yMax);
      }
    }
  });

  it('un point posé HORS cible reste dans le cadre : la borne haute laisse la place à l’erreur', () => {
    // BALAYAGE : toutes les positions que l'aimant accepte, et au-delà.
    for (const d of DEPARTS) {
      const { range } = cadreDe(d);
      for (let k = 0; k < NB_PAS; k += 1) {
        const e = etatDuPas(d, k);
        const haut = e.vers.y + e.tolerance;
        expect(haut, `départ ${d} pas ${k}`).toBeLessThanOrEqual(range.yMax);
      }
    }
  });

  it('la graduation divise le cadre en un nombre entier d’intervalles — pas de demi-ligne', () => {
    for (const d of DEPARTS) {
      const { range, graduation } = cadreDe(d);
      const n = range.yMax / graduation;
      expect(Math.abs(n - Math.round(n))).toBeLessThan(1e-9);
      expect(Math.round(n)).toBeGreaterThanOrEqual(4);
      expect(Math.round(n)).toBeLessThanOrEqual(14); // lisible : jamais 40 lignes
    }
  });

  it('la graduation est proportionnelle au départ : c’est ce qui rend les trois cadres semblables', () => {
    for (const d of DEPARTS) expect(graduationDe(d)).toBeCloseTo(d / 2, 12);
  });

  it('le facteur de rendu ne dépasse jamais ce que l’écran permet', () => {
    expect(facteurRendu(343)).toBeLessThanOrEqual(facteurRendu(700));
    expect(facteurRendu(700)).toBeCloseTo(facteurRendu(1100), 9); // borné par la hauteur
    expect(facteurRendu(343)).toBeGreaterThan(0.8);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   4. CE QUE LA CONSTRUCTION APPROCHE — la borne que la leçon ne peut pas franchir
   ──────────────────────────────────────────────────────────────────────────── */

describe('la construction APPROCHE, elle ne DONNE pas', () => {
  it('l’écart final est VISIBLE mais pas grotesque : entre 5 % et 15 %', () => {
    const e = ecartRelatifFinal();
    expect(e).toBeGreaterThan(5);
    expect(e).toBeLessThan(15);
    expect(e).toBeCloseTo(10.19, 1);
  });

  it('l’écart ne dépend PAS du départ — le problème est invariant d’échelle', () => {
    for (const d of DEPARTS) expect(ecartRelatifFinal(d)).toBeCloseTo(ecartRelatifFinal(1), 9);
  });

  it('la ligne brisée reste TOUJOURS EN DESSOUS de la courbe cherchée', () => {
    // C'est ce que la leçon affirme : les segments sont droits alors que la
    // vraie courbe se redresse entre deux points. On le vérifie point par point.
    for (const d of DEPARTS) {
      const exact = solutionExacte(d);
      ligneEuler(d).forEach((p, k) => {
        if (k === 0) expect(p.y).toBeCloseTo(exact(p.x), 12);
        else expect(p.y, `départ ${d}, x = ${p.x}`).toBeLessThan(exact(p.x));
      });
    }
  });

  it('un pas DEUX FOIS plus fin réduit l’écart : la construction converge bien vers la courbe', () => {
    const grossier = ecartRelatifFinal(1, 4, 0.25);
    const fin = ecartRelatifFinal(1, 8, 0.125);
    const tresFin = ecartRelatifFinal(1, 16, 0.0625);
    expect(fin).toBeLessThan(grossier);
    expect(tresFin).toBeLessThan(fin);
  });

  it('l’exponentielle est bien LA solution : elle vaut sa propre dérivée et 1 en 0', () => {
    for (const x of [-2, -1, -0.5, 0, 0.5, 1, 2]) {
      expect(EXP.fPrime(x)).toBeCloseTo(EXP.f(x), 12);
    }
    expect(EXP.f(0)).toBe(1);
  });

  it('UNICITÉ VÉRIFIÉE, pas affirmée : deux départs différents ne se rejoignent jamais', () => {
    expect(verifieUnicite(1, 1)).toBe(true);
    expect(verifieUnicite(0.5, 1)).toBe(true);
    expect(verifieUnicite(1, 2)).toBe(true);
    expect(verifieUnicite(0.5, 2)).toBe(true);
  });

  it('e est bien la valeur de la solution en 1, et la leçon ne recopie aucune décimale', () => {
    expect(solutionExacte(1)(1)).toBeCloseTo(E, 12);
    expect(E).toBeCloseTo(2.718, 3);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   5. LE SIGNE, DÉMONTRÉ PAR L'ABSURDE — et exécutable
   ──────────────────────────────────────────────────────────────────────────── */

describe('pourquoi la courbe ne touche jamais l’axe', () => {
  it('partie d’une hauteur NULLE, la construction ne bouge JAMAIS', () => {
    // C'est le raisonnement par l'absurde, exécuté : pente = hauteur = 0 donc
    // segment plat, donc hauteur suivante nulle, et ainsi de suite.
    for (const p of constructionDepuisZero()) expect(p.y).toBe(0);
    expect(constructionDepuisZero(12, 0.1).every((p) => p.y === 0)).toBe(true);
  });

  it('une courbe plate en 0 contredit f(0) = 1 : les deux exigences sont incompatibles', () => {
    const plate = constructionDepuisZero().at(-1).y;
    expect(plate).toBe(0);
    expect(plate).not.toBe(1);
  });

  it('l’exponentielle est strictement positive sur toute la plage affichée, BALAYÉE', () => {
    const { xMin, xMax } = EXP.range;
    for (let x = xMin; x <= xMax + 1e-9; x += 0.01) {
      expect(estStrictementPositive(x), `x = ${x.toFixed(2)}`).toBe(true);
    }
  });

  it('la courbe de la leçon tient dans son cadre sur toute la plage, BALAYÉE', () => {
    const { xMin, xMax, yMax } = EXP.range;
    // On ne vérifie pas yMin : la courbe s'en approche sans l'atteindre, et
    // c'est précisément ce que le module 5 fait observer.
    for (let x = xMin; x <= xMax + 1e-9; x += 0.01) {
      expect(EXP.f(x)).toBeLessThanOrEqual(yMax);
    }
    expect(EXP.f(xMax)).toBeLessThan(yMax);
    expect(EXP.f(xMin)).toBeGreaterThan(0);
  });

  it('f′ = f > 0 donc la fonction est strictement croissante — BALAYAGE de la plage', () => {
    const { xMin, xMax } = EXP.range;
    let prec = EXP.f(xMin);
    for (let x = xMin + 0.01; x <= xMax + 1e-9; x += 0.01) {
      expect(EXP.fPrime(x)).toBeGreaterThan(0);
      expect(EXP.f(x)).toBeGreaterThan(prec);
      prec = EXP.f(x);
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   6. LA TANGENTE EN 0 — y = x + 1, dérivée du noyau partagé
   ──────────────────────────────────────────────────────────────────────────── */

describe('la tangente en 0', () => {
  it('a pour équation y = x + 1, et ce n’est pas écrit à la main', () => {
    const t = tangenteEnZero();
    expect(t.a).toBe(1);
    expect(t.b).toBe(1);
    expect(eq(t)).toBe('y = x + 1');
  });

  it('passe EXACTEMENT par le point de contact (0 ; 1)', () => {
    const t = tangenteEnZero();
    expect(t.a * 0 + t.b).toBeCloseTo(EXP.f(0), 12);
  });

  it('reste EN DESSOUS de la courbe partout ailleurs — la convexité, constatée', () => {
    const t = tangenteEnZero();
    for (let x = -2; x <= 2; x += 0.05) {
      if (Math.abs(x) < 1e-9) continue;
      expect(EXP.f(x), `x = ${x.toFixed(2)}`).toBeGreaterThan(t.a * x + t.b);
    }
  });

  it('en un point quelconque, la tangente passe par son point de contact', () => {
    for (const a of [-1, -0.5, 0, 0.5, 1, 1.5]) {
      const t = tangenteEn(a);
      expect(t.a * a + t.b).toBeCloseTo(EXP.f(a), 9);
      expect(t.a).toBeCloseTo(EXP.f(a), 12); // f′ = f
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   6bis. LE LABORATOIRE DE LA COURBE — cibles atteignables, cadre sûr
   ──────────────────────────────────────────────────────────────────────────── */

describe('le laboratoire où le point de contact se saisit', () => {
  const crans = () => {
    const out = [];
    for (let v = EXP.range.xMin; v <= EXP.range.xMax + 1e-9; v += PAS_CONTACT) {
      out.push(Math.round(v * 1e6) / 1e6);
    }
    return out;
  };

  it('CIBLE ATTEIGNABLE : 0, le point de contact de la tangente remarquable, tombe PILE sur un cran', () => {
    expect(crans()).toContain(0);
  });

  it('CIBLE ATTEIGNABLE AU DOIGT : un cran mesure 16 px, au-dessus du seuil tactile', () => {
    expect(PAS_CONTACT * EXP.unit).toBeGreaterThanOrEqual(14);
  });

  it('les deux bornes du cadre sont elles-mêmes des crans : aucune position n’est hors d’atteinte', () => {
    const c = crans();
    expect(c[0]).toBeCloseTo(EXP.range.xMin, 9);
    expect(c.at(-1)).toBeCloseTo(EXP.range.xMax, 9);
  });

  it('SÉCURITÉ DE MISE EN PAGE : en TOUT cran, la tangente traverse le cadre — BALAYAGE', () => {
    const { xMin, xMax, yMin, yMax } = EXP.range;
    for (const a of crans()) {
      const t = tangenteEn(a);
      const yg = t.a * xMin + t.b;
      const yd = t.a * xMax + t.b;
      const invisible = (yg < yMin && yd < yMin) || (yg > yMax && yd > yMax);
      expect(invisible, `en a = ${a} la tangente ne traverse pas le cadre`).toBe(false);
    }
  });

  it('SÉCURITÉ DE MISE EN PAGE : en TOUT cran, le point de contact est DANS le cadre — BALAYAGE', () => {
    const { yMin, yMax } = EXP.range;
    for (const a of crans()) {
      const y = EXP.f(a);
      expect(y, `en a = ${a}`).toBeGreaterThan(yMin);
      expect(y, `en a = ${a}`).toBeLessThanOrEqual(yMax);
    }
  });

  it('l’ordonnée et la pente affichent TOUJOURS le même nombre — c’est la découverte du module 4', () => {
    for (const a of crans()) expect(EXP.fPrime(a)).toBeCloseTo(EXP.f(a), 12);
  });

  it('la tangente n’est JAMAIS horizontale : sa pente ne s’annule sur aucun cran', () => {
    for (const a of crans()) expect(Math.abs(tangenteEn(a).a)).toBeGreaterThan(0);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   7. DÉRIVER exp(u) — périmètre codé, dérivées vérifiées
   ──────────────────────────────────────────────────────────────────────────── */

describe('exp(u) dans des cas simples', () => {
  it('chaque cas déclaré est un cas SIMPLE : u affine, non constante', () => {
    for (const cas of CAS_EXP_U) expect(assertCasSimple(cas)).toBe(true);
  });

  it('le périmètre est CODÉ : un u non affine est REFUSÉ', () => {
    expect(() => assertCasSimple({ id: 'carre', u: null, facteur: 2 })).toThrow(/affine/);
    expect(() => assertCasSimple({ id: 'constante', u: { a: 0, b: 3 }, facteur: 0 })).toThrow(/constante/);
    expect(() => assertCasSimple({ id: 'menteur', u: { a: 2, b: 0 }, facteur: 3 })).toThrow(/facteur/);
  });

  it('la dérivée annoncée est la VRAIE dérivée, mesurée sur chaque cas', () => {
    for (const cas of CAS_EXP_U) expect(deriveeVerifiee(cas), cas.id).toBe(true);
  });

  it('le facteur sorti est exactement le coefficient de x — le facteur oublié se voit', () => {
    for (const cas of CAS_EXP_U) {
      const exacte = expUPrime(cas.u);
      const oubli = expU(cas.u); // l'erreur : on oublie de multiplier par a
      for (const x of [-0.5, 0, 0.5]) {
        expect(exacte(x)).toBeCloseTo(cas.facteur * oubli(x), 9);
        if (cas.facteur !== 1) expect(exacte(x)).not.toBeCloseTo(oubli(x), 6);
      }
    }
  });

  it('les trois cas sont DISTINCTS deux à deux — aucun doublon dans les épreuves', () => {
    const facteurs = CAS_EXP_U.map((c) => c.facteur);
    expect(new Set(facteurs).size).toBe(facteurs.length);
    const textes = CAS_EXP_U.map((c) => c.texte);
    expect(new Set(textes).size).toBe(textes.length);
  });

  it('e^{−x} est strictement DÉCROISSANTE : le facteur négatif renverse le sens', () => {
    const cas = CAS_EXP_U.find((c) => c.id === 'expmx');
    const d = expUPrime(cas.u);
    for (let x = -2; x <= 2; x += 0.05) expect(d(x)).toBeLessThan(0);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   8. LES NOMBRES DES MODULES, ET LES DISTRACTEURS DU BOSS
   ──────────────────────────────────────────────────────────────────────────── */

describe('les valeurs citées par les modules sont recalculées', () => {
  it('le premier pas depuis 1 : pente 1, montée 0,25, cible 1,25', () => {
    const e = etatDuPas(1, 0);
    expect(e.pente).toBe(1);
    expect(affiche(e.montee)).toBe(0.25);
    expect(affiche(e.vers.y)).toBe(1.25);
  });

  it('le deuxième pas depuis 1 : la pente a CHANGÉ, elle vaut 1,25', () => {
    const e = etatDuPas(1, 1);
    expect(affiche(e.pente)).toBe(1.25);
    expect(affiche(e.vers.y)).toBe(1.5625);
    // La pente n'est pas constante : c'est ce qui distingue cette courbe d'une droite.
    expect(e.pente).not.toBeCloseTo(etatDuPas(1, 0).pente, 6);
  });

  it('le bout de la construction depuis 1 vaut 2,4414, contre e ≈ 2,7183', () => {
    expect(affiche(ligneEuler(1).at(-1).y)).toBe(2.4414);
    expect(affiche(E)).toBe(2.7183);
    expect(ligneEuler(1).at(-1).y).toBeLessThan(E);
  });

  it('DISTRACTEURS du boss : les dérivées de e^{2x} sont numériquement distinctes', () => {
    // bonne réponse 2e^{2x} ; pièges : e^{2x} (facteur oublié), 2xe^{2x} (règle
    // du produit appliquée à tort), e^{2} (constante).
    const x = 0.7;
    const bonne = 2 * Math.exp(2 * x);
    const pieges = [Math.exp(2 * x), 2 * x * Math.exp(2 * x), Math.exp(2)];
    for (const p of pieges) expect(Math.abs(bonne - p)).toBeGreaterThan(1e-3);
    const toutes = [bonne, ...pieges];
    for (let i = 0; i < toutes.length; i += 1) {
      for (let j = i + 1; j < toutes.length; j += 1) {
        expect(Math.abs(toutes[i] - toutes[j]), `options ${i} et ${j}`).toBeGreaterThan(1e-3);
      }
    }
  });

  it('DISTRACTEURS du boss : e^0 = 1 se distingue de 0 et de e', () => {
    const options = [EXP.f(0), 0, E, -1];
    for (let i = 0; i < options.length; i += 1) {
      for (let j = i + 1; j < options.length; j += 1) {
        expect(Math.abs(options[i] - options[j])).toBeGreaterThan(1e-6);
      }
    }
    expect(EXP.f(0)).toBe(1);
  });

  it('DISTRACTEURS du boss : la tangente en 0 se distingue des trois pièges en x = 2', () => {
    // y = x + 1 ; pièges : y = x (l'ordonnée oubliée), y = 1 (la pente oubliée),
    // y = 2x + 1 (la pente doublée).
    const x = 2;
    const valeurs = [x + 1, x, 1, 2 * x + 1];
    for (let i = 0; i < valeurs.length; i += 1) {
      for (let j = i + 1; j < valeurs.length; j += 1) {
        expect(Math.abs(valeurs[i] - valeurs[j]), `pièges ${i}/${j}`).toBeGreaterThan(0.5);
      }
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   9. FORMAT ET SAISIE
   ──────────────────────────────────────────────────────────────────────────── */

describe('format français et saisie de l’élève', () => {
  it('fr écrit la virgule et le VRAI signe moins', () => {
    expect(fr(1.25)).toBe('1,25');
    expect(fr(-1)).toBe('−1');
    expect(fr(2)).toBe('2');
  });

  it('parseSigned accepte le signe moins que la leçon AFFICHE', () => {
    // parseDec seul rejette U+2212 ; c'est le piège n°1 du lot 1.
    expect(parseSigned('−1', parseDec)).toBe(-1);
    expect(parseSigned('–1', parseDec)).toBe(-1);
    expect(parseSigned('-1', parseDec)).toBe(-1);
    expect(parseSigned('1,25', parseDec)).toBe(1.25);
    expect(parseSigned('−0,5', parseDec)).toBe(-0.5);
  });

  it('arrondi neutralise les artefacts de flottants sans mentir', () => {
    expect(arrondi(0.1 + 0.2)).toBe(0.3);
    expect(affiche(2.44140625)).toBe(2.4414);
  });
});
