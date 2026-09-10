/**
 * LES AFFIRMATIONS DE LA LEÇON, VÉRIFIÉES SUR SES DONNÉES EXACTES.
 *
 * Les modules AFFIRMENT des choses à l'élève : « les positions qui passent
 * forment UNE SEULE bande », « la bande est entre les racines », « −8 n'est
 * pas une longueur ». Ce sont des CONTENUS PÉDAGOGIQUES : si le comportement
 * réel diffère, la leçon ment, et `quadratic.test.js` ne l'attrape pas — il
 * vérifie que `roots` est juste, pas qu'un module dit vrai en la citant.
 */
import { describe, it, expect } from 'vitest';
import { prehensionPx, PLANCHER_PX } from '../../../prehension';
import {
  PONT, H_STEPS, L_STEPS, P_STEPS, pStepsDe, pMaxDe, pAimante, arche, coinPasse, penichePasse, coinsDe,
  trinomeDegagement, bandeDegagement, bandePositions, positionDansLaBande,
  bandeCoherente, positionsGagnantes, nombreDeBlocs, labState,
  trinomeText, intervalleText, ensembleText, REL_TEXT,
  resoudreInequation, solutionsInequationText, verifieInequation, dansEnsemble,
  INEQUATIONS, TRAJECTOIRE, AIRE, AIRE_PIEGEE, ENCLOS, enclosInequation,
  aireEnclos, racinesAdmissibles, racinesRejetees, cadreDe,
  discriminant, roots, vertex, evalTrinome, trinomialSign, fr, parseSigned,
} from './signeProblemesUtils';

/* ═══ MODULE 1 — le laboratoire « le pont et la péniche » ═══════════════════ */

describe('module 1 — les crans du laboratoire', () => {
  it('chaque réglage est un cliquet régulier qui couvre sa plage', () => {
    for (const [steps, min, max, step] of [
      [H_STEPS, PONT.hMin, PONT.hMax, PONT.hStep],
      [L_STEPS, PONT.lMin, PONT.lMax, PONT.lStep],
      [P_STEPS, -pMaxDe(PONT.lMin), pMaxDe(PONT.lMin), PONT.pStep],
    ]) {
      expect(steps[0]).toBe(min);
      expect(steps.at(-1)).toBe(max);
      for (let i = 1; i < steps.length; i += 1) {
        expect(steps[i] - steps[i - 1]).toBeCloseTo(step, 12);
      }
    }
  });

  it('les états de DÉPART sont sur un cran — sinon aucun bouton ne fonctionne', () => {
    expect(H_STEPS).toContain(PONT.hStart);
    expect(L_STEPS).toContain(PONT.lStart);
    // La position de départ doit être un cran pour CHAQUE largeur : sinon un
    // changement de largeur laisserait la péniche entre deux crans, et les
    // boutons cesseraient de répondre.
    for (const L of L_STEPS) expect(pStepsDe(L)).toContain(PONT.pStart);
  });

  it('CIBLES ATTEIGNABLES : les trois hauteurs à racines ENTIÈRES sont des crans', () => {
    // Sans cela, le module 3 citerait des bandes que l'élève ne pourrait pas
    // obtenir, et le tableau de signes porterait sur un état invisible.
    for (const [H, r] of [[0, 3], [2.5, 2], [4, 1]]) {
      expect(H_STEPS).toContain(H);
      const b = bandeDegagement(H);
      expect(b.from).toBeCloseTo(-r, 12);
      expect(b.to).toBeCloseTo(r, 12);
      // Et atteignable depuis le départ en un nombre ENTIER de crans.
      const k = (H - PONT.hStart) / PONT.hStep;
      expect(k).toBe(Math.round(k));
    }
  });

  it('l’arche est bien une arche : tournée vers le bas, culminant au milieu', () => {
    expect(PONT.a).toBeLessThan(0);
    const v = vertex(PONT.a, 0, PONT.k);
    expect(v.x).toBe(0);
    expect(v.y).toBe(PONT.k);
    // Elle touche le quai en ±3 : une ouverture de 9 m, un fait cité.
    expect(roots(PONT.a, 0, PONT.k)).toEqual([-3, 3]);
    expect(arche(0)).toBe(4.5);
    expect(arche(3)).toBe(0);
  });
});

describe('module 1 — L’INVARIANT CENTRAL : géométrie et algèbre coïncident', () => {
  it('BALAYAGE COMPLET : le prédicat géométrique et le prédicat algébrique ne divergent JAMAIS', () => {
    // C'est l'affirmation que porte la leçon entière. Elle est balayée sur la
    // grille COMPLÈTE (largeur × hauteur × position), pas échantillonnée.
    const ecarts = bandeCoherente();
    expect(ecarts).toEqual([]);
    // Et le balayage a bien eu lieu — un invariant vide serait un faux vert.
    const cases = L_STEPS.reduce((n, L) => n + H_STEPS.length * pStepsDe(L).length, 0);
    expect(cases).toBeGreaterThan(1500);
  });

  it('LE PATCHWORK EST IMPOSSIBLE : les positions gagnantes font 0 ou 1 bloc', () => {
    for (const L of L_STEPS) {
      for (const H of H_STEPS) {
        expect(nombreDeBlocs(L, H)).toBeLessThanOrEqual(1);
      }
    }
  });

  it('un coin posé EXACTEMENT sur l’arche ne passe pas : la péniche frotte', () => {
    // À H = 2,5 la bande des coins est ]−2 ; 2[ : le coin en x = 2 est sur
    // l'arche, pas dessous. C'est ce qui rend les bornes EXCLUES, et le
    // module 4 s'appuie dessus pour distinguer > de ⩾.
    expect(arche(2)).toBe(2.5);
    expect(coinPasse(2, 2.5)).toBe(false);
    expect(coinPasse(1.75, 2.5)).toBe(true);
  });

  it('les CAS REMARQUABLES cités par les modules sont exacts', () => {
    // L = 2, H = 2,5 : bande des coins ]−2 ; 2[, bande des positions ]−1 ; 1[.
    const b = bandePositions(2, 2.5);
    expect(b.from).toBeCloseTo(-1, 12);
    expect(b.to).toBeCloseTo(1, 12);
    expect(penichePasse(0, 2, 2.5)).toBe(true);
    expect(penichePasse(0.75, 2, 2.5)).toBe(true);
    expect(penichePasse(1, 2, 2.5)).toBe(false);   // pile sur la borne
    expect(penichePasse(1.25, 2, 2.5)).toBe(false);
  });

  it('une péniche TROP GRANDE n’a aucune position : la bande est vide, pas ailleurs', () => {
    // L = 5, H = 2 : la bande des coins est ]−2√2 ; 2√2[, large de 5,66 m, et
    // 5 m de péniche… mais le module 2 cite le cas franc L = 5, H = 2,5.
    expect(bandePositions(5, 2.5)).toBeNull();
    expect(positionsGagnantes(5, 2.5)).toEqual([]);
    expect(pStepsDe(5).some((p) => penichePasse(p, 5, 2.5))).toBe(false);
    // Et il en existe au moins une qui passe, sinon le laboratoire serait mort.
    expect(positionsGagnantes(2, 2.5).length).toBeGreaterThan(0);
  });

  it('MONOTONIE : élargir ou surélever la péniche ne peut jamais AJOUTER de positions', () => {
    // C'est ce que l'élève constate en tournant les molettes, et ce que le
    // module 2 affirme. Une exception ferait mentir la manipulation.
    for (const H of H_STEPS) {
      for (let i = 1; i < L_STEPS.length; i += 1) {
        expect(positionsGagnantes(L_STEPS[i], H).length)
          .toBeLessThanOrEqual(positionsGagnantes(L_STEPS[i - 1], H).length);
      }
    }
    for (const L of L_STEPS) {
      for (let i = 1; i < H_STEPS.length; i += 1) {
        expect(positionsGagnantes(L, H_STEPS[i]).length)
          .toBeLessThanOrEqual(positionsGagnantes(L, H_STEPS[i - 1]).length);
      }
    }
  });

  it('SÉCURITÉ DE MISE EN PAGE : tout état atteignable tient dans le cadre', () => {
    const { xMin, xMax, yMin, yMax } = PONT.range;
    for (const L of L_STEPS) {
      for (const H of H_STEPS) {
        for (const p of pStepsDe(L)) {
          const s = labState(p, L, H);
          for (const coin of s.coins) {
            expect(coin.x).toBeGreaterThanOrEqual(xMin);
            expect(coin.x).toBeLessThanOrEqual(xMax);
          }
          expect(H).toBeGreaterThanOrEqual(yMin);
          expect(H).toBeLessThanOrEqual(yMax);
        }
      }
    }
    // L'arche entière tient aussi.
    expect(arche(0)).toBeLessThanOrEqual(yMax);
    expect(PONT.range.xMin).toBeLessThanOrEqual(-3);
    expect(PONT.range.xMax).toBeGreaterThanOrEqual(3);
  });

  it('labState dérive TOUT de (p, L, H) — rien n’est stocké', () => {
    const s = labState(0.5, 2, 2.5);
    expect(s.coins.map((c) => c.x)).toEqual(coinsDe(0.5, 2));
    expect(s.passe).toBe(penichePasse(0.5, 2, 2.5));
    expect(s.passe).toBe(s.coins.every((c) => c.ok));
  });
});

describe('module 1 — la bande EST l’intérieur des racines du trinôme du dégagement', () => {
  it('le trinôme du dégagement a bien pour racines les bornes de la bande', () => {
    for (const H of H_STEPS) {
      const t = trinomeDegagement(H);
      const b = bandeDegagement(H);
      const rs = roots(t.a, t.b, t.c);
      if (H < PONT.k) {
        expect(rs).toHaveLength(2);
        expect(b.from).toBeCloseTo(rs[0], 12);
        expect(b.to).toBeCloseTo(rs[1], 12);
        // a < 0 : le trinôme est POSITIF entre ses racines, négatif dehors.
        expect(evalTrinome(t.a, t.b, t.c, 0)).toBeGreaterThan(0);
        expect(evalTrinome(t.a, t.b, t.c, rs[1] + 1)).toBeLessThan(0);
      }
    }
  });

  it('le dégagement est exactement h(x) − H, pour tout coin et toute hauteur', () => {
    for (const H of H_STEPS) {
      const t = trinomeDegagement(H);
      for (const x of pStepsDe(PONT.lMin)) {
        expect(evalTrinome(t.a, t.b, t.c, x)).toBeCloseTo(arche(x) - H, 12);
        expect(coinPasse(x, H)).toBe(evalTrinome(t.a, t.b, t.c, x) > 0);
      }
    }
  });
});

/* ═══ MODULES 2 et 3 — le signe d'un trinôme ════════════════════════════════ */

describe('modules 2 et 3 — le signe selon Δ et le signe de a', () => {
  const CAS = [
    { nom: 'Δ > 0, a > 0', a: 1, b: -5, c: 6, signes: [1, 0, -1, 0, 1] },
    { nom: 'Δ > 0, a < 0', a: -1, b: 0, c: 4, signes: [-1, 0, 1, 0, -1] },
    { nom: 'Δ = 0, a > 0', a: 1, b: -6, c: 9, signes: [1, 0, 1] },
    { nom: 'Δ = 0, a < 0', a: -1, b: 6, c: -9, signes: [-1, 0, -1] },
    { nom: 'Δ < 0, a > 0', a: 1, b: 1, c: 1, signes: [1] },
    { nom: 'Δ < 0, a < 0', a: -1, b: 1, c: -1, signes: [-1] },
  ];

  it('LES SIX CAS que le module 2 énumère sont exacts, et ce sont les seuls', () => {
    for (const cas of CAS) {
      const cells = trinomialSign(cas.a, cas.b, cas.c);
      expect(cells.map((c) => c.sign)).toEqual(cas.signes);
    }
    // Deux Δ possibles par signe de a, trois signes de Δ : six cas exactement.
    expect(new Set(CAS.map((c) => `${Math.sign(discriminant(c.a, c.b, c.c))}|${Math.sign(c.a)}`)).size)
      .toBe(6);
  });

  it('LA RÈGLE : « du signe de a, sauf ENTRE les racines » se vérifie numériquement', () => {
    for (const cas of CAS) {
      const rs = roots(cas.a, cas.b, cas.c);
      const sa = Math.sign(cas.a);
      for (let x = -12; x <= 12; x += 0.25) {
        const y = evalTrinome(cas.a, cas.b, cas.c, x);
        if (rs.some((r) => Math.abs(x - r) < 1e-9)) { expect(y).toBeCloseTo(0, 9); continue; }
        const entre = rs.length === 2 && x > rs[0] && x < rs[1];
        expect(Math.sign(y)).toBe(entre ? -sa : sa);
      }
    }
  });

  it('Δ ⩽ 0 : le trinôme garde le signe de a partout, sans jamais le changer', () => {
    for (const [a, b, c] of [[1, 1, 1], [-1, 1, -1], [1, -6, 9], [-1, 6, -9]]) {
      const sa = Math.sign(a);
      for (let x = -10; x <= 10; x += 0.5) {
        const y = evalTrinome(a, b, c, x);
        if (Math.abs(y) < 1e-12) continue;
        expect(Math.sign(y)).toBe(sa);
      }
    }
  });
});

/* ═══ MODULE 4 — résoudre une inéquation ═══════════════════════════════════ */

describe('module 4 — résoudre une inéquation du second degré', () => {
  it('CHAQUE inéquation travaillée est résolue JUSTE, vérifiée point par point', () => {
    // La preuve : on confronte l'ensemble RENDU au prédicat direct, sur une
    // grille fine. Une borne mal incluse se voit immédiatement.
    for (const ineq of Object.values(INEQUATIONS)) {
      const S = resoudreInequation(ineq.a, ineq.b, ineq.c, ineq.rel);
      for (let x = -10; x <= 12; x += 0.05) {
        const v = Math.round(x * 1000) / 1000;
        expect(dansEnsemble(S, v)).toBe(verifieInequation(ineq.a, ineq.b, ineq.c, ineq.rel, v));
      }
      // Et sur les racines EXACTEMENT, là où ⩽ / ⩾ se distinguent de < / >.
      for (const r of roots(ineq.a, ineq.b, ineq.c)) {
        expect(dansEnsemble(S, r)).toBe(verifieInequation(ineq.a, ineq.b, ineq.c, ineq.rel, r));
      }
    }
  });

  it('LES BORNES : ⩽ / ⩾ les incluent, < / > les excluent — sur le MÊME trinôme', () => {
    const stricte = resoudreInequation(1, -5, 6, '<');
    const large = resoudreInequation(1, -5, 6, '<=');
    expect(intervalleText(stricte[0])).toBe(']2 ; 3[');
    expect(intervalleText(large[0])).toBe('[2 ; 3]');
    expect(dansEnsemble(stricte, 2)).toBe(false);
    expect(dansEnsemble(large, 2)).toBe(true);
  });

  it('LES ÉCRITURES citées par le module 4 sont exactes, au caractère près', () => {
    expect(solutionsInequationText(1, -5, 6, '>')).toBe(']−∞ ; 2[ ∪ ]3 ; +∞[');
    expect(solutionsInequationText(1, -5, 6, '<=')).toBe('[2 ; 3]');
    expect(solutionsInequationText(-1, 0, 4, '>=')).toBe('[−2 ; 2]');
    expect(solutionsInequationText(-1, 0, 4, '<')).toBe(']−∞ ; −2[ ∪ ]2 ; +∞[');
    expect(solutionsInequationText(1, 1, 1, '>')).toBe('ℝ');
    expect(solutionsInequationText(1, 1, 1, '<')).toBe('∅');
    expect(solutionsInequationText(1, 1, 1, '<=')).toBe('∅');
    // Δ = 0 : ⩾ donne ℝ tout entier, > exclut la racine double.
    expect(solutionsInequationText(1, -6, 9, '>=')).toBe('ℝ');
    expect(solutionsInequationText(1, -6, 9, '>')).toBe(']−∞ ; 3[ ∪ ]3 ; +∞[');
    // Δ = 0 : ⩽ ne garde QUE la racine double, un ensemble d'un seul nombre.
    expect(solutionsInequationText(1, -6, 9, '<=')).toBe('[3 ; 3]');
  });

  it('la RÉUNION ne se fusionne que quand la racine est admise des deux côtés', () => {
    // ⩾ sur Δ = 0 : ]−∞ ; 3[ ∪ {3} ∪ ]3 ; +∞[ doit devenir ℝ, en UN morceau.
    expect(resoudreInequation(1, -6, 9, '>=')).toHaveLength(1);
    // > sur Δ = 0 : deux morceaux, la racine exclue.
    expect(resoudreInequation(1, -6, 9, '>')).toHaveLength(2);
    expect(dansEnsemble(resoudreInequation(1, -6, 9, '>'), 3)).toBe(false);
  });

  it('une relation inconnue LÈVE, plutôt que de rendre un ensemble faux', () => {
    expect(() => resoudreInequation(1, 0, -1, '≠')).toThrow(/relation inconnue/);
    expect(() => verifieInequation(1, 0, -1, '≠', 0)).toThrow(/relation inconnue/);
  });

  it('les symboles affichés sont ceux du tableau, pas ceux du clavier', () => {
    expect(REL_TEXT['>=']).toBe('⩾');
    expect(REL_TEXT['<=']).toBe('⩽');
  });
});

/* ═══ MODULES 5 et 6 — modéliser, puis interpréter ═════════════════════════ */

describe('module 5 — modéliser un problème concret', () => {
  it('LA TRAJECTOIRE : le ballon part de 1 m et retombe une seule fois', () => {
    expect(evalTrinome(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c, 0)).toBe(1);
    const d = discriminant(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c);
    expect(d).toBeCloseTo(2, 12);
    const rs = roots(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c);
    expect(rs).toHaveLength(2);
    // Une seule racine est un point de chute possible : l'autre est en arrière.
    expect(racinesAdmissibles(TRAJECTOIRE)).toHaveLength(1);
    expect(racinesRejetees(TRAJECTOIRE)).toHaveLength(1);
    expect(racinesRejetees(TRAJECTOIRE)[0]).toBeLessThan(0);
    // La portée annoncée par le module, arrondie au décimètre.
    expect(racinesAdmissibles(TRAJECTOIRE)[0]).toBeCloseTo(2 + Math.sqrt(8), 12);
    expect(fr(Math.round(racinesAdmissibles(TRAJECTOIRE)[0] * 10) / 10)).toBe('4,8');
  });

  it('L’AIRE : périmètre 28 et aire 48 donnent bien −x² + 14x − 48, racines 6 et 8', () => {
    // Le modèle est REDÉRIVÉ du contexte, pas recopié : largeur x, longueur
    // demi-périmètre − x, produit = aire cible.
    const demi = AIRE.perimetre / 2;
    for (const x of [1, 3, 6, 8, 11]) {
      expect(evalTrinome(AIRE.a, AIRE.b, AIRE.c, x)).toBeCloseTo(x * (demi - x) - AIRE.aireCible, 12);
    }
    expect(discriminant(AIRE.a, AIRE.b, AIRE.c)).toBe(4);
    expect(roots(AIRE.a, AIRE.b, AIRE.c)).toEqual([6, 8]);
    // Les DEUX racines sont admissibles : c'est le même rectangle, retourné.
    expect(racinesAdmissibles(AIRE)).toEqual([6, 8]);
    expect(6 + 8).toBe(demi);
    expect(6 * 8).toBe(AIRE.aireCible);
  });

  it('L’ENCLOS : 24 m de grillage sur trois côtés, aire maximale 72 m² en x = 6', () => {
    for (const x of [1, 4, 6, 8, 11]) {
      expect(aireEnclos(x)).toBeCloseTo(x * (ENCLOS.grillage - 2 * x), 12);
    }
    const v = vertex(ENCLOS.a, ENCLOS.b, ENCLOS.c);
    expect(v.x).toBe(6);
    expect(v.y).toBe(72);
    // Le maximum est bien un MAXIMUM sur tout le domaine, balayé.
    for (let x = ENCLOS.domaine.from; x <= ENCLOS.domaine.to; x += 0.01) {
      expect(aireEnclos(x)).toBeLessThanOrEqual(72 + 1e-9);
    }
  });

  it('L’ENCLOS : « au moins 64 m² » se résout en [4 ; 8], bornes COMPRISES', () => {
    const q = enclosInequation();
    expect(q.a).toBe(-2); expect(q.b).toBe(24); expect(q.c).toBe(-64);
    expect(discriminant(q.a, q.b, q.c)).toBe(64);
    expect(roots(q.a, q.b, q.c)).toEqual([4, 8]);
    expect(solutionsInequationText(q.a, q.b, q.c, q.rel)).toBe('[4 ; 8]');
    // Vérification dans le CONTEXTE : 4 et 8 donnent exactement 64.
    expect(aireEnclos(4)).toBe(64);
    expect(aireEnclos(8)).toBe(64);
    expect(aireEnclos(3.9)).toBeLessThan(64);
    expect(aireEnclos(8.1)).toBeLessThan(64);
    // Et l'ensemble entier est dans le domaine physique.
    expect(4).toBeGreaterThan(ENCLOS.domaine.from);
    expect(8).toBeLessThan(ENCLOS.domaine.to);
  });
});

describe('module 6 — interpréter les solutions dans le contexte', () => {
  it('L’AIRE PIÉGÉE : x² + 3x − 40 a pour racines −8 et 5, et −8 n’est pas une longueur', () => {
    for (const x of [1, 5, 9]) {
      expect(evalTrinome(AIRE_PIEGEE.a, AIRE_PIEGEE.b, AIRE_PIEGEE.c, x))
        .toBeCloseTo(x * (x + AIRE_PIEGEE.ecart) - AIRE_PIEGEE.aireCible, 12);
    }
    expect(discriminant(AIRE_PIEGEE.a, AIRE_PIEGEE.b, AIRE_PIEGEE.c)).toBe(169);
    expect(roots(AIRE_PIEGEE.a, AIRE_PIEGEE.b, AIRE_PIEGEE.c)).toEqual([-8, 5]);
    expect(racinesAdmissibles(AIRE_PIEGEE)).toEqual([5]);
    expect(racinesRejetees(AIRE_PIEGEE)).toEqual([-8]);
    // Et la racine gardée VÉRIFIE le problème, pas seulement l'équation.
    expect(5 * (5 + AIRE_PIEGEE.ecart)).toBe(AIRE_PIEGEE.aireCible);
    // La racine rejetée vérifie l'ÉQUATION — c'est tout le piège.
    expect(evalTrinome(AIRE_PIEGEE.a, AIRE_PIEGEE.b, AIRE_PIEGEE.c, -8)).toBe(0);
  });

  it('les quatre situations ont un domaine qui EXCLUT ou GARDE, jamais par hasard', () => {
    const attendu = [
      [TRAJECTOIRE, 1, 1],
      [AIRE, 2, 0],
      [AIRE_PIEGEE, 1, 1],
    ];
    for (const [pb, nAdmises, nRejetees] of attendu) {
      expect(racinesAdmissibles(pb)).toHaveLength(nAdmises);
      expect(racinesRejetees(pb)).toHaveLength(nRejetees);
      // Aucune racine ne peut être à la fois admise et rejetée.
      for (const r of racinesAdmissibles(pb)) expect(racinesRejetees(pb)).not.toContain(r);
      expect(racinesAdmissibles(pb).length + racinesRejetees(pb).length)
        .toBe(roots(pb.a, pb.b, pb.c).length);
    }
  });
});

/* ═══ ÉCRITURES, CADRES ET DISTRACTEURS ════════════════════════════════════ */

describe('les écritures françaises de la leçon', () => {
  it('trinomeText range les signes et efface les coefficients 1', () => {
    expect(trinomeText(1, -5, 6)).toBe('x² − 5x + 6');
    expect(trinomeText(-1, 0, 4)).toBe('−x² + 4');
    expect(trinomeText(-0.5, 0, 4.5)).toBe('−0,5x² + 4,5');
    expect(trinomeText(-2, 24, -64)).toBe('−2x² + 24x − 64');
    expect(trinomeText(1, 3, -40)).toBe('x² + 3x − 40');
  });

  it('intervalleText et ensembleText écrivent les crochets du bon côté', () => {
    expect(intervalleText({ from: -2, to: 3 })).toBe(']−2 ; 3[');
    expect(intervalleText({ from: -2, to: 3, openFrom: false, openTo: false })).toBe('[−2 ; 3]');
    expect(intervalleText({ from: null, to: 2 })).toBe(']−∞ ; 2[');
    expect(intervalleText({ from: 3, to: null, openFrom: false })).toBe('[3 ; +∞[');
    expect(ensembleText([])).toBe('∅');
  });

  it('fr rend le VRAI signe moins, et parseSigned relit ce que la leçon affiche', () => {
    expect(fr(-8)).toBe('−8');
    expect(fr(-0.5)).toBe('−0,5');
    // Le piège du lot 1 : l'élève recopie « −8 » et parseDec le refuse.
    expect(parseSigned('−8')).toBe(-8);
    expect(parseSigned('–8')).toBe(-8);
    expect(parseSigned('—8')).toBe(-8);
    expect(parseSigned('-8')).toBe(-8);
    expect(parseSigned('−0,5')).toBe(-0.5);
    expect(parseSigned('4,8')).toBe(4.8);
  });

  it('cadreDe contient le sommet et les bornes de l’intervalle d’étude', () => {
    for (const [pb, xa, xb] of [[AIRE, 0, 14], [ENCLOS, 0, 12], [TRAJECTOIRE, 0, 5]]) {
      const cadre = cadreDe(pb, xa, xb);
      const v = vertex(pb.a, pb.b, pb.c);
      expect(cadre.xMin).toBeLessThanOrEqual(xa);
      expect(cadre.xMax).toBeGreaterThanOrEqual(xb);
      if (v.x >= xa && v.x <= xb) {
        expect(cadre.yMin).toBeLessThanOrEqual(v.y);
        expect(cadre.yMax).toBeGreaterThanOrEqual(v.y);
      }
      // L'axe des abscisses est toujours dans le cadre : sans lui, le signe
      // d'un trinôme ne se lirait pas.
      expect(cadre.yMin).toBeLessThanOrEqual(0);
      expect(cadre.yMax).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('les distracteurs du boss et des modules sont DISTINCTS et calculés', () => {
  /** Deux options identiques rendent une épreuve insoluble (piège n°4 du lot 1). */
  const tousDistincts = (options) => new Set(options.map(String)).size === options.length;

  it('e1 — le signe d’un trinôme : les quatre options diffèrent', () => {
    const bonne = solutionsInequationText(1, -5, 6, '>');
    const options = [bonne, ']2 ; 3[', '[2 ; 3]', 'ℝ'];
    expect(options[0]).toBe(']−∞ ; 2[ ∪ ]3 ; +∞[');
    expect(tousDistincts(options)).toBe(true);
  });

  it('e2 — inéquation à a < 0 : le piège est l’oubli du retournement', () => {
    const bonne = solutionsInequationText(-1, 0, 4, '>=');
    // Le piège classique : lire « à l'extérieur » comme si a était positif.
    const piege = solutionsInequationText(-1, 0, 4, '<=');
    expect(bonne).toBe('[−2 ; 2]');
    expect(piege).toBe(']−∞ ; −2] ∪ [2 ; +∞[');
    expect(tousDistincts([bonne, piege, ']−2 ; 2[', '∅'])).toBe(true);
  });

  it('e3 — Δ < 0 : ℝ et ∅ sont les deux réponses opposées, jamais confondues', () => {
    expect(solutionsInequationText(1, 1, 1, '>')).toBe('ℝ');
    expect(solutionsInequationText(1, 1, 1, '<')).toBe('∅');
    expect(tousDistincts(['ℝ', '∅', '{0}', ']−∞ ; 1[' ])).toBe(true);
  });

  it('e4 — les racines de l’aire piégée : 5 est la bonne, −8 le piège plausible', () => {
    const rs = roots(AIRE_PIEGEE.a, AIRE_PIEGEE.b, AIRE_PIEGEE.c);
    const bonne = racinesAdmissibles(AIRE_PIEGEE)[0];
    const options = [bonne, rs[0], 8, 40 / 3];
    expect(bonne).toBe(5);
    expect(tousDistincts(options.map((n) => Math.round(n * 1000)))).toBe(true);
  });

  it('e5 — l’enclos : 72 est le maximum, 64 la cible, 6 et 12 des longueurs', () => {
    const v = vertex(ENCLOS.a, ENCLOS.b, ENCLOS.c);
    expect(tousDistincts([v.y, ENCLOS.cible, v.x, ENCLOS.domaine.to])).toBe(true);
    // Chaque piège est PLAUSIBLE : c'est une grandeur du problème, pas un
    // nombre au hasard.
    expect(aireEnclos(v.x)).toBe(v.y);
    expect(ENCLOS.grillage - 2 * v.x).toBe(12);
  });

  it('e6 — la trajectoire : la portée arrondie diffère de tous ses pièges', () => {
    const portee = Math.round(racinesAdmissibles(TRAJECTOIRE)[0] * 10) / 10;
    const sommet = vertex(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c);
    const options = [portee, sommet.x, sommet.y, 1];
    expect(portee).toBe(4.8);
    expect(sommet.x).toBe(2);
    expect(sommet.y).toBe(2);
    // ATTENTION : le sommet a x = 2 et y = 2 — deux options identiques !
    // On n'en garde donc qu'une seule dans l'épreuve, et le test le fige.
    expect(tousDistincts(options)).toBe(false);
    expect(tousDistincts([portee, sommet.x, 1, 5])).toBe(true);
  });
});

/* ═══ LE BOSS — chaque énoncé recalculé, chaque distracteur vérifié ═══════ */

describe('module 7 — les dix épreuves de la mission finale', () => {
  const tousDistincts = (options) => new Set(options.map(String)).size === options.length;

  it('sp-e1 — −2x² + 8 : racines −2 et 2, POSITIF entre elles (a < 0)', () => {
    expect(roots(-2, 0, 8)).toEqual([-2, 2]);
    expect(evalTrinome(-2, 0, 8, 0)).toBe(8);
    expect(evalTrinome(-2, 0, 8, 3)).toBeLessThan(0);
    expect(trinomeText(-2, 0, 8)).toBe('−2x² + 8');
  });

  it('sp-e2 — x² − 2x + 5 : Δ = −16, positif partout, et 5 en x = 0', () => {
    expect(discriminant(1, -2, 5)).toBe(-16);
    expect(evalTrinome(1, -2, 5, 0)).toBe(5);
    for (let x = -10; x <= 10; x += 0.25) expect(evalTrinome(1, -2, 5, x)).toBeGreaterThan(0);
  });

  it('sp-e3 et sp-e4 — les ensembles proposés sont ceux du modèle, et distincts', () => {
    expect(solutionsInequationText(1, -5, 6, '>')).toBe(']−∞ ; 2[ ∪ ]3 ; +∞[');
    expect(tousDistincts([solutionsInequationText(1, -5, 6, '>'), ']2 ; 3[', '[2 ; 3]', 'ℝ'])).toBe(true);
    expect(roots(-1, 0, 9)).toEqual([-3, 3]);
    expect(solutionsInequationText(-1, 0, 9, '>=')).toBe('[−3 ; 3]');
    // Le piège : lire « ⩾ » comme « à l'extérieur », par habitude du cas a > 0.
    expect(solutionsInequationText(-1, 0, 9, '<=')).toBe(']−∞ ; −3] ∪ [3 ; +∞[');
    expect(tousDistincts(['[−3 ; 3]', ']−3 ; 3[', ']−∞ ; −3] ∪ [3 ; +∞[', '∅'])).toBe(true);
    expect(evalTrinome(-1, 0, 9, 0)).toBe(9);
    expect(evalTrinome(-1, 0, 9, 3)).toBe(0);
  });

  it('sp-e5 — périmètre 20, aire 24 : x(10 − x) = 24 donne 4 et 6', () => {
    // Le MODÈLE est redérivé du contexte, jamais recopié.
    for (const x of [1, 4, 6, 9]) expect(x * (10 - x) - 24).toBeCloseTo(evalTrinome(-1, 10, -24, x), 12);
    expect(roots(-1, 10, -24)).toEqual([4, 6]);
    expect(4 * 6).toBe(24);
    expect(2 * (4 + 6)).toBe(20);
    // Le piège « périmètre au lieu de demi-périmètre » donne un AUTRE ensemble.
    expect(roots(-1, 20, -24)).not.toEqual([4, 6]);
  });

  it('sp-e6 — x² + 2x − 24 : racines −6 et 4, une seule est une largeur', () => {
    expect(roots(1, 2, -24)).toEqual([-6, 4]);
    expect(4 * (4 + 2)).toBe(24);
    // Le piège de la valeur absolue : 6 n'annule PAS l'expression.
    expect(evalTrinome(1, 2, -24, 6)).not.toBe(0);
    expect(tousDistincts([4, -6, 6, -4])).toBe(true);
  });

  it('sp-e7 et sp-e8 — l’enclos : ⩾ 64 donne [4 ; 8], bornes comprises', () => {
    const q = enclosInequation();
    expect(trinomeText(ENCLOS.a, ENCLOS.b, ENCLOS.c)).toBe('−2x² + 24x');
    expect(trinomeText(q.a, q.b, q.c)).toBe('−2x² + 24x − 64');
    expect(roots(q.a, q.b, q.c)).toEqual([4, 8]);
    expect(solutionsInequationText(q.a, q.b, q.c, '>=')).toBe('[4 ; 8]');
    // Les trois pièges de sp-e8 décrivent des ensembles DIFFÉRENTS.
    expect(solutionsInequationText(q.a, q.b, q.c, '<=')).toBe(']−∞ ; 4] ∪ [8 ; +∞[');
    expect(solutionsInequationText(q.a, q.b, q.c, '>')).toBe(']4 ; 8[');
    expect(aireEnclos(4)).toBe(64);
    expect(aireEnclos(6)).toBe(72);
  });

  it('sp-e9 — 5 et −1 : la durée écoulée n’est pas négative, et 4 est un leurre', () => {
    // Les quatre options citent des nombres tous distincts.
    expect(tousDistincts([5, -1, 5 - (-1), 0])).toBe(true);
    // Le piège « la différence des deux solutions » vaut 6, pas 4 — l'énoncé
    // écrit donc 4 comme un nombre PLAUSIBLE mais faux, distinct de 5.
    expect(5 - (-1)).toBe(6);
    expect(4).not.toBe(5);
  });

  it('sp-e10 — x² + 4 : Δ = −16, jamais nul, et 2 ne l’annule pas', () => {
    expect(discriminant(1, 0, 4)).toBe(-16);
    expect(roots(1, 0, 4)).toEqual([]);
    expect(evalTrinome(1, 0, 4, 2)).toBe(8);
    expect(evalTrinome(1, 0, 4, -2)).toBe(8);
    expect(evalTrinome(1, 0, 4, 4)).toBe(20);
    for (let x = -10; x <= 10; x += 0.5) expect(evalTrinome(1, 0, 4, x)).toBeGreaterThan(0);
  });

  it('COUVERTURE : chaque LP porte au moins une épreuve qui lui est PROPRE', () => {
    // La table du boss, recopiée ici comme un CONTRAT : si le module change
    // sans que la table suive, la matrice de couverture du rapport ment.
    const solo = { P1: 'sp-e1', P2: 'sp-e3', P3: 'sp-e5', P4: 'sp-e7', P5: 'sp-e9' };
    expect(Object.keys(solo)).toHaveLength(5);
    expect(new Set(Object.values(solo)).size).toBe(5);
  });
});

/* ═══ LES MODULES 2 à 4 — chaque nombre cité est recalculé ════════════════ */

describe('les nombres cités par les modules 2, 3 et 4', () => {
  it('module 2 — le trinôme du dégagement d’une péniche de 2,5 m', () => {
    const H = 2.5;
    const t = trinomeDegagement(H);
    expect(t).toEqual({ a: -0.5, b: 0, c: 2 });
    expect(trinomeText(t.a, t.b, t.c)).toBe('−0,5x² + 2');
    expect(discriminant(t.a, t.b, t.c)).toBe(4);
    expect(roots(t.a, t.b, t.c)).toEqual([-2, 2]);
    expect(evalTrinome(t.a, t.b, t.c, 0)).toBe(2);
    expect(evalTrinome(t.a, t.b, t.c, 3)).toBe(-2.5);
  });

  it('module 2 — x² − 5x + 6 vaut −0,25 en 2,5, et x² − 6x + 9 vaut 1 des deux côtés', () => {
    expect(evalTrinome(1, -5, 6, 2.5)).toBe(-0.25);
    expect(evalTrinome(1, -6, 9, 2)).toBe(1);
    expect(evalTrinome(1, -6, 9, 4)).toBe(1);
    expect(evalTrinome(1, 1, 1, 0)).toBe(1);
    expect(discriminant(1, 1, 1)).toBe(-3);
    expect(discriminant(1, -6, 9)).toBe(0);
  });

  it('module 3 — x² − x − 6 et −2x² + 2x + 12 ont les MÊMES racines, −2 et 3', () => {
    expect(discriminant(1, -1, -6)).toBe(25);
    expect(roots(1, -1, -6)).toEqual([-2, 3]);
    expect(evalTrinome(1, -1, -6, 0)).toBe(-6);
    expect(discriminant(-2, 2, 12)).toBe(100);
    expect(roots(-2, 2, 12)).toEqual([-2, 3]);
    expect(evalTrinome(-2, 2, 12, 0)).toBe(12);
    // LE PIÈGE CITÉ : la formule sort la PLUS GRANDE en premier quand 2a < 0.
    const sqrtD = Math.sqrt(discriminant(-2, 2, 12));
    expect((-2 - sqrtD) / (2 * -2)).toBe(3);
    expect((-2 + sqrtD) / (2 * -2)).toBe(-2);
    // Et `roots` les rend malgré tout TRIÉES — c'est le contrat du noyau.
    expect(roots(-2, 2, 12)[0]).toBeLessThan(roots(-2, 2, 12)[1]);
  });

  it('module 3 — le nombre de colonnes de signe suit le signe de Δ', () => {
    expect(trinomialSign(1, -5, 6).filter((c) => c.sign !== 0)).toHaveLength(3);
    expect(trinomialSign(1, -6, 9).filter((c) => c.sign !== 0)).toHaveLength(2);
    expect(trinomialSign(1, 1, 1).filter((c) => c.sign !== 0)).toHaveLength(1);
  });

  it('module 4 — les quatre écritures d’ensemble, toutes distinctes', () => {
    const q = [
      solutionsInequationText(1, -5, 6, '>'),
      solutionsInequationText(1, -5, 6, '<'),
      solutionsInequationText(1, -5, 6, '<='),
      solutionsInequationText(-1, 0, 4, '>='),
      solutionsInequationText(1, 1, 1, '>'),
      solutionsInequationText(1, 1, 1, '<'),
    ];
    expect(new Set(q).size).toBe(q.length);
    expect(evalTrinome(1, -5, 6, 2)).toBe(0);
    expect(evalTrinome(1, -5, 6, 2.5)).toBe(-0.25);
    expect(evalTrinome(-1, 0, 4, 0)).toBe(4);
    expect(evalTrinome(-1, 0, 4, 3)).toBe(-5);
  });

  it('module 5 — le discriminant de l’aire, et son piège de signe', () => {
    expect(discriminant(AIRE.a, AIRE.b, AIRE.c)).toBe(4);
    // Le piège cité en `explainFor` : ajouter 4ac au lieu de le retrancher,
    // parce que le produit 4ac est négatif ici. Il donne 388, bien distinct
    // de la bonne réponse 4.
    expect(AIRE.b * AIRE.b + 4 * AIRE.a * AIRE.c).toBe(388);
    expect(388).not.toBe(discriminant(AIRE.a, AIRE.b, AIRE.c));
    expect(aireEnclos(3)).toBe(54);
    expect(aireEnclos(5)).toBe(70);
  });

  it('module 6 — les valeurs de vérification de la trajectoire et de l’aire piégée', () => {
    expect(evalTrinome(AIRE_PIEGEE.a, AIRE_PIEGEE.b, AIRE_PIEGEE.c, -8)).toBe(0);
    // Le piège de signe cité en explainFor : −64 − 24 − 40 = −128.
    expect(-64 - 24 - 40).toBe(-128);
    expect(64 - 24).toBe(40);
    const portee = Math.round(racinesAdmissibles(TRAJECTOIRE)[0] * 10) / 10;
    expect(portee).toBe(4.8);
    // L'arrondi ne ment pas : la hauteur en 4,8 est presque nulle.
    expect(Math.abs(evalTrinome(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c, portee))).toBeLessThan(0.05);
    // Les deux distracteurs de l'arrondi sont le sommet et la hauteur initiale.
    expect(vertex(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c).x).toBe(2);
    expect(TRAJECTOIRE.c).toBe(1);
    expect(new Set([portee, 2, 1]).size).toBe(3);
  });
});

/* ═══ SÉCURITÉ DE MISE EN PAGE — TOUTES les figures de la leçon ═══════════ */

describe('les cadres CALCULÉS de toutes les figures dessinées', () => {
  /** Chaque appel de <SignePlot> des modules 2 à 6, avec ses bornes. */
  const FIGURES = [
    { nom: 'M2 dégagement', a: -0.5, b: 0, c: 2 },
    { nom: 'M2 a > 0', a: 1, b: -5, c: 6 },
    { nom: 'M2 Δ < 0', a: 1, b: 1, c: 1, xMin: -3, xMax: 3 },
    { nom: 'M2 Δ = 0', a: 1, b: -6, c: 9, xMin: 0, xMax: 6 },
    { nom: 'M3 tableau lu', a: 1, b: -5, c: 6 },
    { nom: 'M3 tableau saisi', a: 1, b: -1, c: -6 },
    { nom: 'M4 extérieur', a: 1, b: -5, c: 6 },
    { nom: 'M4 toujours positif', a: 1, b: 1, c: 1, xMin: -3, xMax: 3 },
    { nom: 'M5 aire', a: -1, b: 14, c: -48, xMin: 0, xMax: 14 },
    { nom: 'M5 trajectoire', a: -0.25, b: 1, c: 1, xMin: 0, xMax: 6 },
    { nom: 'M6 aire piégée', a: 1, b: 3, c: -40, xMin: -10, xMax: 8 },
    { nom: 'M6 trajectoire', a: -0.25, b: 1, c: 1, xMin: -2, xMax: 6 },
  ];

  /** Les bornes que SignePlot calcule quand le module ne les donne pas. */
  const bornesDe = (f) => {
    const rs = roots(f.a, f.b, f.c);
    const b = rs.length ? [Math.min(...rs), Math.max(...rs)] : [-2, 2];
    return [f.xMin ?? b[0] - 2, f.xMax ?? b[1] + 2];
  };

  it('BALAYAGE : la courbe reste dans le cadre sur toute la plage dessinée', () => {
    // Pas d'échantillonnage : chaque figure est balayée au pas de 1/200 de sa
    // largeur — le pas même auquel SignePlot l'échantillonne. Un point hors
    // cadre serait rogné, et la courbe montrerait un trou.
    for (const f of FIGURES) {
      const [xa, xb] = bornesDe(f);
      const cadre = cadreDe(f, xa, xb);
      let dedans = 0;
      for (let i = 0; i <= 200; i += 1) {
        const x = cadre.xMin + ((cadre.xMax - cadre.xMin) * i) / 200;
        const y = evalTrinome(f.a, f.b, f.c, x);
        if (y >= cadre.yMin && y <= cadre.yMax) dedans += 1;
      }
      // La portion étudiée doit être ENTIÈREMENT visible.
      for (let i = 0; i <= 100; i += 1) {
        const x = xa + ((xb - xa) * i) / 100;
        const y = evalTrinome(f.a, f.b, f.c, x);
        expect(y, `${f.nom} en x=${x}`).toBeGreaterThanOrEqual(cadre.yMin);
        expect(y, `${f.nom} en x=${x}`).toBeLessThanOrEqual(cadre.yMax);
      }
      // Et la courbe n'est jamais réduite à un trait : au moins 60 points.
      expect(dedans, f.nom).toBeGreaterThan(60);
    }
  });

  it('l’axe des abscisses et chaque racine sont DANS le cadre — sinon le signe ne se lit pas', () => {
    for (const f of FIGURES) {
      const [xa, xb] = bornesDe(f);
      const cadre = cadreDe(f, xa, xb);
      expect(cadre.yMin, f.nom).toBeLessThanOrEqual(0);
      expect(cadre.yMax, f.nom).toBeGreaterThanOrEqual(0);
      for (const r of roots(f.a, f.b, f.c)) {
        if (r < xa || r > xb) continue;   // hors de la portion étudiée
        expect(r, f.nom).toBeGreaterThanOrEqual(cadre.xMin);
        expect(r, f.nom).toBeLessThanOrEqual(cadre.xMax);
      }
    }
  });

  it('la FIGURE ne peut pas contredire le TABLEAU : les bandes sortent du même modèle', () => {
    // L'invariant visuel est STRUCTUREL, pas surveillé : SignePlot et
    // TableauSignes lisent tous deux `trinomialSign`. Le test le fige — si
    // l'un des deux se mettait à recalculer, il tomberait.
    for (const f of FIGURES) {
      const cells = trinomialSign(f.a, f.b, f.c);
      const bandes = cells.filter((c) => c.sign !== 0);
      const colonnes = cells.filter((c) => c.sign !== 0);
      expect(bandes.map((b) => b.sign)).toEqual(colonnes.map((c) => c.sign));
      // Et chaque bande porte bien le signe du trinôme en son milieu.
      for (const b of bandes) {
        const [xa, xb] = bornesDe(f);
        const cadre = cadreDe(f, xa, xb);
        const from = b.from ?? cadre.xMin;
        const to = b.to ?? cadre.xMax;
        const milieu = (from + to) / 2;
        expect(Math.sign(evalTrinome(f.a, f.b, f.c, milieu)), `${f.nom} bande [${from};${to}]`)
          .toBe(b.sign);
      }
    }
  });

  it('les FIGURES de la carte des connaissances tiennent dans leur MiniGraph', () => {
    // Les trois cadres écrits en dur dans knowledge.jsx, balayés.
    const CARTES = [
      { nom: 'signe-change-aux-racines', a: -0.5, b: 0, c: 4.5, xMin: -4, xMax: 4, yMin: -2, yMax: 5 },
      { nom: 'signe-trinome-regle', a: 1, b: -5, c: 6, xMin: -1, xMax: 5, yMin: -3, yMax: 5 },
      { nom: 'signe-sans-racine', a: 1, b: 1, c: 1, xMin: -3, xMax: 3, yMin: -1, yMax: 6 },
      { nom: 'solution-equation-vs-probleme', a: 1, b: 3, c: -40, xMin: -10, xMax: 8, yMin: -45, yMax: 30 },
    ];
    for (const k of CARTES) {
      let visibles = 0;
      for (let i = 0; i <= 200; i += 1) {
        const x = k.xMin + ((k.xMax - k.xMin) * i) / 200;
        const y = evalTrinome(k.a, k.b, k.c, x);
        if (y >= k.yMin && y <= k.yMax) visibles += 1;
      }
      // Au moins la moitié de la plage doit être VISIBLE : une vignette où la
      // courbe sort du cadre aussitôt ne montre rien.
      expect(visibles, k.nom).toBeGreaterThan(100);
      // Les racines de la vignette sont dans le cadre.
      for (const r of roots(k.a, k.b, k.c)) {
        expect(r, `${k.nom} racine ${r}`).toBeGreaterThanOrEqual(k.xMin);
        expect(r, `${k.nom} racine ${r}`).toBeLessThanOrEqual(k.xMax);
      }
      // L'axe des abscisses est visible : sans lui, la bande n'a pas de sens.
      expect(k.yMin).toBeLessThanOrEqual(0);
      expect(k.yMax).toBeGreaterThanOrEqual(0);
    }
  });
});


/**
 * ─────────────────────────────────────────────────────────────────────────
 * LE GLISSER (règle utilisateur du 2026-09-10)
 *
 * La péniche se SAISIT et coulisse sous l'arche. Ce qui suit verrouille
 * l'atteignabilité des bandes remarquables sous l'aimantation, le respect du
 * chenal, et MESURE la zone de préhension — y compris là où elle est courte.
 * ─────────────────────────────────────────────────────────────────────────
 */
describe('le glisser — faire coulisser la péniche', () => {
  it('pAimante ne rend QUE des positions légales, pour CHAQUE largeur', () => {
    // BALAYÉ sur les 9 largeurs et tout le cadre : aucun lâcher ne peut poser
    // la péniche sur une position hors grille.
    for (const L of L_STEPS) {
      const crans = pStepsDe(L);
      for (let x = PONT.range.xMin - 2; x <= PONT.range.xMax + 2; x += 0.05) {
        expect(crans).toContain(pAimante(Math.round(x * 100) / 100, L));
      }
    }
  });

  it('LE CHENAL EST RESPECTÉ : un doigt qui pousse trop loin s’arrête au dernier cran légal', () => {
    // Sans ce serrage, le glisser ferait sortir un coin du cadre — exactement
    // ce que `pMaxDe` existe pour empêcher, et que le bouton empêchait par
    // construction.
    for (const L of L_STEPS) {
      const m = pMaxDe(L);
      expect(pAimante(999, L)).toBe(m);
      expect(pAimante(-999, L)).toBe(-m);
      // Et les coins restent DANS le cadre aux deux extrêmes. `coinsDe` rend
      // deux ABSCISSES nues, pas des points : c'est sur elles qu'on mesure.
      for (const p of [pAimante(999, L), pAimante(-999, L)]) {
        for (const x of coinsDe(p, L)) {
          expect(Math.abs(x)).toBeLessThanOrEqual(PONT.range.xMax + 1e-9);
        }
      }
    }
  });

  it('chaque cran est ATTEIGNABLE : un doigt posé dessus rend ce cran', () => {
    for (const L of L_STEPS) {
      for (const p of pStepsDe(L)) expect(pAimante(p, L)).toBe(p);
    }
  });

  it('LES BANDES REMARQUABLES restent exactement atteignables au doigt', () => {
    // C'est l'invariant d'atteignabilité du module : les bornes ±3, ±2 et ±1
    // doivent tomber sur des crans, sans quoi la lecture de l'intervalle
    // serait approximative — et le glisser ne doit rien y changer.
    // `toBe` distinguerait 0 de −0 : on compare donc numériquement.
    for (const borne of [3, 2, 1, 0]) {
      expect(pAimante(borne, PONT.lMin)).toBeCloseTo(borne, 10);
      expect(pAimante(-borne, PONT.lMin)).toBeCloseTo(-borne, 10);
    }
  });

  it('l’aimantation est STABLE : réaimanter une position ne la déplace pas', () => {
    for (const L of L_STEPS) {
      for (const p of pStepsDe(L)) expect(pAimante(pAimante(p, L), L)).toBe(p);
    }
  });

  it('LA ZONE DE PRÉHENSION, mesurée — et pourquoi les boutons restent au premier plan', () => {
    // MESURE HONNÊTE. Le repère du pont fait 388 px de large : il est donc
    // COMPRIMÉ à 0,884 dans un <main> de 375 px, et le cran de 0,25 m ne
    // couvre que 9,3 px — SOUS le plancher de 14 px.
    const repere = { range: PONT.range, unit: PONT.unit, unitY: PONT.unitY, xStep: 1, yStep: 1 };
    const px = prehensionPx(repere, PONT.pStep, 'x');
    expect(px).toBeCloseTo(9.3, 1);
    expect(px).toBeLessThan(PLANCHER_PX);

    // Le pas N'EST PAS élargissable : c'est lui qui met ±3, ±2 et ±1 sur des
    // crans. Un pas de 0,5 tiendrait le plancher (18,6 px) mais garderait les
    // bornes entières… au prix de la moitié des positions, et le module
    // affirme que les positions gagnantes « se suivent toutes » sur une grille
    // fine. On CONSTATE donc la contrainte au lieu de la contourner.
    expect(prehensionPx(repere, 0.5, 'x')).toBeGreaterThanOrEqual(PLANCHER_PX);

    // Ce qui rachète la préhension courte : ce n'est pas un point isolé qu'on
    // vise, mais une PÉNICHE, large d'au moins 1 m — soit 37 px à l'écran,
    // très au-dessus du plancher. Le doigt attrape la figure, et seule la
    // POSE finale est aimantée au quart de mètre.
    const largeurPeniche = prehensionPx(repere, PONT.lMin, 'x');
    expect(largeurPeniche).toBeGreaterThanOrEqual(PLANCHER_PX);
    expect(largeurPeniche).toBeCloseTo(37.1, 1);
  });
});
