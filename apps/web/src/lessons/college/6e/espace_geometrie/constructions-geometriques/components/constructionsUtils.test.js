import { describe, it, expect } from 'vitest';
import {
  INSTRUMENTS, INSTRUMENTS_LIST, TACHES, instrumentFor,
  checkOrder, PROGRAMME_RECTANGLE, ERREURS,
} from './constructionsUtils';

describe('les instruments et leur domaine', () => {
  it('chaque instrument dit ce qu’il garantit ET ce qu’il ne garantit pas', () => {
    for (const i of INSTRUMENTS_LIST) {
      expect(i.nom).toBeTruthy();
      expect(i.garantit).toBeTruthy();
      expect(i.neGarantitPas).toBeTruthy();
    }
  });

  it('chaque tâche pointe vers un instrument existant', () => {
    for (const t of TACHES) {
      expect(INSTRUMENTS[t.instrument]).toBeTruthy();
      expect(instrumentFor(t.id)).toBe(t.instrument);
    }
  });

  it('les trois instruments sont tous mobilisés par les tâches', () => {
    const utilisés = new Set(TACHES.map((t) => t.instrument));
    expect(utilisés).toEqual(new Set(['regle', 'equerre', 'compas']));
  });
});

describe('programme de construction — l’ordre a un sens', () => {
  const ids = PROGRAMME_RECTANGLE.map((s) => s.id);

  it('l’ordre de référence est valide', () => {
    expect(checkOrder(PROGRAMME_RECTANGLE, ids).ok).toBe(true);
  });

  it('refuse un ordre qui viole une dépendance, et NOMME le fautif', () => {
    // La perpendiculaire (e2) avant le segment (e1) : impossible.
    const mauvais = ['e2', 'e1', 'e3', 'e4', 'e5', 'e6'];
    const r = checkOrder(PROGRAMME_RECTANGLE, mauvais);
    expect(r.ok).toBe(false);
    expect(r.fautif).toBe('e2');
    expect(r.manquant).toBe('e1');
    expect(r.message).toMatch(/trop tôt/);
  });

  it('refuse de tracer [BC] avant d’avoir placé C', () => {
    const mauvais = ['e1', 'e2', 'e3', 'e4', 'e6', 'e5'];
    const r = checkOrder(PROGRAMME_RECTANGLE, mauvais);
    expect(r.ok).toBe(false);
    expect(r.fautif).toBe('e6');
  });

  it('chaque étape déclare un instrument connu', () => {
    for (const s of PROGRAMME_RECTANGLE) {
      expect(INSTRUMENTS[s.instrument]).toBeTruthy();
      expect(s.texte).toBeTruthy();
    }
  });

  it('les dépendances pointent toutes vers des étapes réelles', () => {
    for (const s of PROGRAMME_RECTANGLE) {
      for (const d of s.depend ?? []) expect(ids).toContain(d);
    }
  });
});

describe('erreurs de construction', () => {
  it('chaque erreur nomme l’instrument qui l’aurait évitée', () => {
    for (const e of ERREURS) {
      expect(INSTRUMENTS[e.instrument]).toBeTruthy();
      expect(e.figure).toBeTruthy();
      expect(e.explication).toBeTruthy();
    }
  });

  it('les trois instruments sont chacun mis en cause une fois', () => {
    expect(new Set(ERREURS.map((e) => e.instrument))).toEqual(
      new Set(['regle', 'equerre', 'compas'])
    );
  });
});
