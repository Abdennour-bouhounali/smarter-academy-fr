/**
 * Le graphe d'une preuve (§26-36).
 *
 * Deux exigences sont défendues ici plutôt que relues :
 *   §36 — PLUSIEURS chemins valides. Les deux cas d'une disjonction se
 *         posent dans l'ordre qu'on veut, et les deux ordres sont acceptés.
 *   §27 — un refus qui EXPLIQUE : une raison typée et les prérequis qui
 *         manquent, jamais un simple « faux ».
 */

import { describe, it, expect } from 'vitest';
import {
  stepIds, findStep, validateStep, availableSteps, isComplete, orderIsValid,
  firstOrderError, makeGapChallenge, checkGapAnswer, proofLayers, anyValidOrder,
  refutesFallacy,
} from './proofMath.js';
import { PROOFS, FALLACIES, findPreset } from './presets.js';

const direct = findPreset(PROOFS, 'evenSquareIsEven');
const byCases = findPreset(PROOFS, 'squarePlusNEven');
const byContradiction = findPreset(PROOFS, 'sqrtTwoIrrational');

describe('validateStep — poser une étape, ou savoir pourquoi on ne peut pas', () => {
  it('la racine se pose en premier', () => {
    expect(validateStep(direct, [], 'given')).toEqual({ ok: true });
  });

  it('§27 — une étape hors tour est refusée AVEC ses prérequis manquants', () => {
    const verdict = validateStep(direct, [], 'factor');
    expect(verdict.ok).toBe(false);
    expect(verdict.reason).toBe('missingPrerequisite');
    expect(verdict.missing).toEqual(['square']);
  });

  it('une étape déjà posée est refusée pour cette raison-là', () => {
    expect(validateStep(direct, ['given'], 'given')).toEqual({ ok: false, reason: 'alreadyPlaced' });
  });

  it('une carte qui n’appartient pas à la preuve est nommée comme telle', () => {
    expect(validateStep(direct, [], 'wrongSquare')).toEqual({ ok: false, reason: 'notInProof' });
  });

  it('findStep rend null plutôt que de lever', () => {
    expect(findStep(direct, 'inexistant')).toBeNull();
    expect(findStep(null, 'given')).toBeNull();
  });
});

describe('§36 — plusieurs chemins valides', () => {
  it('les deux cas d’une disjonction se posent dans les DEUX ordres', () => {
    const start = ['given', 'split'];
    const orderA = [...start, 'evenCase', 'oddCase', 'conclude'];
    const orderB = [...start, 'oddCase', 'evenCase', 'conclude'];
    expect(isComplete(byCases, orderA)).toBe(true);
    expect(isComplete(byCases, orderB)).toBe(true);
  });

  it('mais la conclusion ne peut PAS venir avant ses deux branches', () => {
    const tooEarly = ['given', 'split', 'evenCase', 'conclude', 'oddCase'];
    expect(orderIsValid(byCases, tooEarly)).toBe(false);
    expect(firstOrderError(byCases, tooEarly)).toMatchObject({ index: 3, id: 'conclude', missing: ['oddCase'] });
  });

  it('availableSteps montre tout ce qui est posable maintenant', () => {
    expect(availableSteps(byCases, ['given', 'split']).sort()).toEqual(['evenCase', 'oddCase']);
  });
});

describe('isComplete / firstOrderError', () => {
  it('un ordre canonique complète la preuve', () => {
    expect(isComplete(direct, anyValidOrder(direct))).toBe(true);
  });

  it('une preuve incomplète n’est pas « complète », même bien ordonnée', () => {
    expect(isComplete(direct, ['given', 'rewrite'])).toBe(false);
  });

  it('un ordre inversé casse au premier pas et le dit', () => {
    const reversed = [...anyValidOrder(direct)].reverse();
    const error = firstOrderError(direct, reversed);
    expect(error.index).toBe(0);
    expect(error.reason).toBe('missingPrerequisite');
  });

  it('rien à signaler sur un ordre valide', () => {
    expect(firstOrderError(direct, anyValidOrder(direct))).toBeNull();
  });
});

describe('§34 — l’étape manquante', () => {
  it('ne retire jamais la première ni la dernière étape', () => {
    for (let seed = 0; seed < 30; seed += 1) {
      const gap = makeGapChallenge(direct, seed);
      expect(gap.missingIndex).toBeGreaterThan(0);
      expect(gap.missingIndex).toBeLessThan(direct.steps.length - 1);
    }
  });

  it('propose la bonne étape parmi des distracteurs', () => {
    const gap = makeGapChallenge(direct, 3);
    expect(gap.candidates).toContain(gap.missingId);
    expect(gap.candidates.length).toBeGreaterThan(1);
    expect(checkGapAnswer(gap, gap.missingId)).toBe(true);
    expect(checkGapAnswer(gap, 'wrongSquare')).toBe(false);
  });

  it('est reproductible à graine égale', () => {
    expect(makeGapChallenge(direct, 7)).toEqual(makeGapChallenge(direct, 7));
  });

  it('rend null pour une preuve trop courte', () => {
    expect(makeGapChallenge({ id: 'x', steps: [{ id: 'a', requires: [] }] }, 1)).toBeNull();
  });
});

describe('§32 — l’arbre de preuve', () => {
  it('le premier rang ne dépend de rien', () => {
    const layers = proofLayers(direct);
    expect(layers[0].every((step) => (step.requires ?? []).length === 0)).toBe(true);
  });

  it('une preuve par cas met ses deux branches au MÊME rang, et les réunit après', () => {
    const layers = proofLayers(byCases);
    const rankOf = (id) => layers.findIndex((layer) => layer.some((step) => step.id === id));
    expect(rankOf('evenCase')).toBe(rankOf('oddCase'));
    expect(rankOf('conclude')).toBeGreaterThan(rankOf('evenCase'));
  });

  it('chaque étape apparaît exactement une fois', () => {
    for (const proof of PROOFS) {
      const flat = proofLayers(proof).flat().map((step) => step.id);
      expect(flat.sort()).toEqual([...stepIds(proof)].sort());
    }
  });

  it('la contradiction dépend de l’hypothèse ET de ce qu’on en a tiré', () => {
    const step = findStep(byContradiction, 'contradiction');
    expect(step.requires).toEqual(expect.arrayContaining(['assume', 'bEven']));
    expect(step.contradiction).toBe(true);
  });
});

describe('§33 — réfuter un sophisme', () => {
  it('accepte tout contre-exemple valide', () => {
    const fallacy = findPreset(FALLACIES, 'evenSoMultipleOfFour');
    expect(refutesFallacy(fallacy, 6)).toBe(true);
    expect(refutesFallacy(fallacy, 14)).toBe(true);
  });

  it('refuse une valeur qui ne réfute rien', () => {
    const fallacy = findPreset(FALLACIES, 'evenSoMultipleOfFour');
    expect(refutesFallacy(fallacy, 8)).toBe(false);
  });

  it('ne lève jamais sur une entrée absurde', () => {
    expect(refutesFallacy(null, 1)).toBe(false);
    expect(refutesFallacy(FALLACIES[0], NaN)).toBe(false);
    expect(refutesFallacy({ refutes: () => { throw new Error('boom'); } }, 1)).toBe(false);
  });
});
