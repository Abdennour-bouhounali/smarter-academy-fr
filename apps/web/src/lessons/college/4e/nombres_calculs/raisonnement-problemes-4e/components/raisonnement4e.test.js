import { describe, it, expect } from 'vitest';
import {
  round2, fr, ETAPES, etapeApres, conjecture, tester, chercherContreExemple,
  sommeTroisConsecutifs, etapesPreuveConsecutifs, programmeMystere, etapesProgramme,
  STRATEGIES, plausible, verifierDansLHistoire, assertScope4e,
  CONJECTURES, PROBLEME_FINAL,
} from './raisonnement4e';
import * as mod from './raisonnement4e';

/* ══════════════════════════════════════════════════════════════════════
   LE PÉRIMÈTRE, EN CODE
   ══════════════════════════════════════════════════════════════════════ */
describe('Périmètre officiel de 4e', () => {
  it('n’expose ni système, ni produit nul, ni identité remarquable (objets de 3e)', () => {
    expect(mod.resoudreSysteme).toBeUndefined();
    expect(mod.produitNul).toBeUndefined();
    expect(mod.identiteRemarquable).toBeUndefined();
    expect(mod.resoudreInequation).toBeUndefined();
  });

  it('assertScope4e LÈVE sur chacun de ces sujets', () => {
    for (const s of ['systeme', 'produit-nul', 'identite-remarquable', 'inequation']) {
      expect(() => assertScope4e(s), s).toThrow(/3e/);
    }
    expect(assertScope4e('conjecture')).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LE PROCESSUS
   ══════════════════════════════════════════════════════════════════════ */
describe('Les sept temps de la résolution', () => {
  it('sont ordonnés et sans trou', () => {
    expect(ETAPES.map((e) => e.rang)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(new Set(ETAPES.map((e) => e.id)).size).toBe(7);
  });

  it('chaque étape porte une QUESTION, pas seulement un titre', () => {
    for (const e of ETAPES) expect(e.question.length, e.id).toBeGreaterThan(10);
  });

  it('l’enchaînement est complet, et se termine', () => {
    expect(etapeApres('comprendre').id).toBe('extraire');
    expect(etapeApres('verifier').id).toBe('expliquer');
    expect(etapeApres('expliquer')).toBeNull();
    expect(etapeApres('inconnue')).toBeNull();
  });
});

/* ══════════════════════════════════════════════════════════════════════
   TESTER NE PROUVE PAS — le cœur de la leçon
   ══════════════════════════════════════════════════════════════════════ */
describe('tester — une conjecture vraie reste « non prouvée »', () => {
  it('CENT essais réussis ne donnent JAMAIS le statut « prouvée »', () => {
    const valeurs = Array.from({ length: 100 }, (_, i) => i + 1);
    const r = tester(CONJECTURES.sommeMultipleDe3, valeurs);
    expect(r.contreExemples).toEqual([]);
    expect(r.statut).toBe('non-prouvee');
    expect(r.message).toMatch(/ne prouvent rien/);
  });

  it('UN SEUL contre-exemple suffit à réfuter, définitivement', () => {
    const r = tester(CONJECTURES.sommeToujoursPaire, [1, 2, 3, 4, 5]);
    expect(r.statut).toBe('refutee');
    expect(r.contreExemples.length).toBeGreaterThan(0);
    expect(r.message).toMatch(/contre-exemple/);
  });

  it('la conjecture FAUSSE de la leçon a bien un contre-exemple ATTEIGNABLE', () => {
    // Sans cela, l'élève chercherait en vain et le module serait injouable.
    const n = chercherContreExemple(CONJECTURES.sommeToujoursPaire, 1, 12);
    expect(n).not.toBeNull();
    expect(sommeTroisConsecutifs(n) % 2).toBe(1);
  });

  it('la conjecture VRAIE n’a AUCUN contre-exemple sur un large domaine', () => {
    expect(chercherContreExemple(CONJECTURES.sommeMultipleDe3, -50, 500)).toBeNull();
  });

  it('« le carré est toujours plus grand » se réfute avec 0 et 1', () => {
    const r = tester(CONJECTURES.carrePlusGrand, [0, 1, 2, 3, 5]);
    expect(r.statut).toBe('refutee');
    expect(r.contreExemples).toContain(0);
    expect(r.contreExemples).toContain(1);
  });

  it('le message est CALCULÉ : il cite le premier contre-exemple réel', () => {
    const r = tester(CONJECTURES.carrePlusGrand, [5, 4, 1, 0]);
    expect(r.message).toContain('1');
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LA PREUVE PAR LE CALCUL LITTÉRAL
   ══════════════════════════════════════════════════════════════════════ */
describe('La somme de trois entiers consécutifs', () => {
  it('vaut 3 × le nombre du milieu, pour TOUT entier', () => {
    for (let n = -20; n <= 60; n += 1) {
      expect(sommeTroisConsecutifs(n), `n=${n}`).toBe(3 * (n + 1));
    }
  });

  it('les trois écritures de la preuve donnent la MÊME valeur, partout', () => {
    for (let n = -10; n <= 40; n += 1) {
      const e = etapesPreuveConsecutifs(n);
      expect(new Set(e.map((x) => x.valeur)).size, `n=${n}`).toBe(1);
    }
  });

  it('la forme factorisée est celle qui MONTRE le multiple de 3', () => {
    const e = etapesPreuveConsecutifs(7);
    expect(e[2].texte).toBe('3 × (n + 1)');
    expect(e[2].valeur % 3).toBe(0);
  });
});

describe('Le programme mystère du module 1', () => {
  it('donne TOUJOURS 6, quel que soit le nombre de départ', () => {
    for (const n of [-15, -1, 0, 1, 7, 42, 1000, 0.5, -3.25]) {
      expect(programmeMystere(n), `n=${n}`).toBe(6);
    }
  });

  it('les quatre étapes affichées mènent bien à 6', () => {
    for (const n of [3, 11, -4]) {
      const e = etapesProgramme(n);
      expect(e).toHaveLength(4);
      expect(e[0].valeur).toBe(n);
      expect(e[3].valeur).toBe(6);
    }
  });

  it('les valeurs INTERMÉDIAIRES, elles, changent — sinon il n’y aurait rien à observer', () => {
    const a = etapesProgramme(3).map((e) => e.valeur);
    const b = etapesProgramme(11).map((e) => e.valeur);
    expect(a.slice(0, 3)).not.toEqual(b.slice(0, 3));
    expect(a[3]).toBe(b[3]);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   VÉRIFIER
   ══════════════════════════════════════════════════════════════════════ */
describe('plausible — le contrôle avant le calcul', () => {
  it('refuse un âge négatif, une part décimale, un dépassement', () => {
    expect(plausible(-3, { positif: true }).ok).toBe(false);
    expect(plausible(2.5, { entier: true }).ok).toBe(false);
    expect(plausible(120, { max: 100 }).ok).toBe(false);
    expect(plausible(4, { min: 5 }).ok).toBe(false);
  });

  it('donne la RAISON, jamais un simple refus', () => {
    const r = plausible(-3, { positif: true });
    expect(r.raisons[0]).toMatch(/négative/);
  });

  it('accepte ce qui est plausible', () => {
    expect(plausible(12.4, { positif: true, max: 74 }).ok).toBe(true);
  });
});

describe('verifierDansLHistoire — on remet la valeur dans l’énoncé', () => {
  it('valide la bonne solution du problème final', () => {
    const v = verifierDansLHistoire(PROBLEME_FINAL.solution, PROBLEME_FINAL.controles);
    expect(v.ok).toBe(true);
    expect(v.details.every((d) => d.ok)).toBe(true);
  });

  it('REFUSE une valeur fausse, et dit sur quel contrôle ça coince', () => {
    const v = verifierDansLHistoire(14, PROBLEME_FINAL.controles);
    expect(v.ok).toBe(false);
    expect(v.details.some((d) => !d.ok)).toBe(true);
  });

  it('le problème final est cohérent : 3 ballons + 2 filets = 74 €', () => {
    const f = PROBLEME_FINAL.solution;
    expect(round2(3 * (f + 4) + 2 * f)).toBe(74);
    expect(round2(f + 4)).toBe(16.4);
  });

  it('la solution N’EST PAS un nombre rond — l’élève doit accepter un décimal', () => {
    expect(Number.isInteger(PROBLEME_FINAL.solution)).toBe(false);
  });

  it('les données inutiles de l’énoncé sont bien inutiles au calcul', () => {
    expect(PROBLEME_FINAL.donneesInutiles.length).toBeGreaterThanOrEqual(2);
    for (const d of PROBLEME_FINAL.donneesInutiles) {
      // aucune ne contient un nombre qui apparaît dans les contrôles
      expect(d).not.toMatch(/74|12,4|16,4/);
    }
  });
});

describe('Les stratégies', () => {
  it('sont cinq, chacune avec son domaine d’emploi', () => {
    expect(STRATEGIES).toHaveLength(5);
    for (const s of STRATEGIES) expect(s.quand.length, s.id).toBeGreaterThan(10);
  });

  it('incluent le calcul littéral, seule stratégie qui PROUVE', () => {
    const l = STRATEGIES.find((s) => s.id === 'litteral');
    expect(l.quand).toMatch(/TOUS/);
  });
});
