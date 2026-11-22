/**
 * La logique du مختبر, prouvée (§49).
 *
 * Ce que ces épreuves défendent : les cinq connecteurs sont exacts sur
 * {V,F}², la contraposée coïncide avec l'implication et la réciproque NON,
 * De Morgan tient ligne à ligne, et — le plus important pédagogiquement —
 * une recherche qui ne trouve rien ne se change JAMAIS en preuve (§22).
 */

import { describe, it, expect } from 'vitest';
import {
  CONNECTORS, CONNECTOR_SYMBOLS, evalConnector, truthTable, TRUTH_ROWS, rowIndexOf,
  IMPLICATION_FORMS, formTable, sameTable, contrapositiveEquivalent, converseEquivalent,
  deMorganTable, deMorganHolds, evaluate, searchCounterexample, searchWitness,
  searchVerdict, quantifierNegationHolds, truthIntervals, vennPartition,
  analyzeImplication, implicationAt, conditionReading,
} from './logicMath.js';

describe('evalConnector — exact sur {V,F}²', () => {
  it('¬P', () => {
    expect(evalConnector('not', true)).toBe(false);
    expect(evalConnector('not', false)).toBe(true);
  });

  it('P ∧ Q', () => {
    expect(TRUTH_ROWS.map((r) => evalConnector('and', r.p, r.q))).toEqual([true, false, false, false]);
  });

  it('P ∨ Q', () => {
    expect(TRUTH_ROWS.map((r) => evalConnector('or', r.p, r.q))).toEqual([true, true, true, false]);
  });

  it('P ⇒ Q — fausse SEULEMENT quand P est vraie et Q fausse (§13)', () => {
    expect(TRUTH_ROWS.map((r) => evalConnector('implies', r.p, r.q))).toEqual([true, false, true, true]);
  });

  it('P ⇔ Q', () => {
    expect(TRUTH_ROWS.map((r) => evalConnector('iff', r.p, r.q))).toEqual([true, false, false, true]);
  });

  it('une entrée non réglée ne devient jamais une devinette', () => {
    for (const connector of CONNECTORS) {
      expect(evalConnector(connector, null, true)).toBeNull();
      if (connector !== 'not') expect(evalConnector(connector, true, null)).toBeNull();
    }
  });

  it('un connecteur inconnu rend null plutôt que de lever', () => {
    expect(evalConnector('xor', true, false)).toBeNull();
  });
});

describe('les tables et leurs formes', () => {
  it('quatre lignes pour un connecteur binaire, deux pour ¬', () => {
    expect(truthTable('and')).toHaveLength(4);
    expect(truthTable('not')).toHaveLength(2);
  });

  it('rowIndexOf désigne la ligne qu’on allume', () => {
    expect(rowIndexOf(true, true)).toBe(0);
    expect(rowIndexOf(true, false)).toBe(1);
    expect(rowIndexOf(false, true)).toBe(2);
    expect(rowIndexOf(false, false)).toBe(3);
  });

  it('les quatre formes sont bien celles des manuels', () => {
    expect(formTable('direct').map((r) => r.result)).toEqual([true, false, true, true]);
    expect(formTable('converse').map((r) => r.result)).toEqual([true, true, false, true]);
    expect(formTable('contrapositive').map((r) => r.result)).toEqual([true, false, true, true]);
    expect(formTable('inverse').map((r) => r.result)).toEqual([true, true, false, true]);
  });

  it('§16 — la contraposée a la MÊME table que l’implication', () => {
    expect(contrapositiveEquivalent()).toBe(true);
    expect(sameTable('direct', 'contrapositive')).toBe(true);
  });

  it('§15 — la réciproque N’A PAS la même table', () => {
    expect(converseEquivalent()).toBe(false);
  });

  it('réciproque et inverse sont équivalentes entre elles (l’une est la contraposée de l’autre)', () => {
    expect(sameTable('converse', 'inverse')).toBe(true);
  });

  it('les symboles couvrent les cinq connecteurs', () => {
    expect(Object.keys(CONNECTOR_SYMBOLS).sort()).toEqual([...CONNECTORS].sort());
    expect(Object.keys(IMPLICATION_FORMS)).toHaveLength(4);
  });
});

describe('§24 — De Morgan, vérifié ligne à ligne', () => {
  it('¬(P∧Q) ≡ ¬P∨¬Q', () => {
    expect(deMorganHolds('and')).toBe(true);
    expect(deMorganTable('and').every((row) => row.same)).toBe(true);
  });

  it('¬(P∨Q) ≡ ¬P∧¬Q', () => {
    expect(deMorganHolds('or')).toBe(true);
  });

  it('la table rend les deux côtés, pour qu’on les COMPARE', () => {
    const row = deMorganTable('and')[0];
    expect(row).toHaveProperty('left');
    expect(row).toHaveProperty('right');
  });
});

describe('evaluate — hors domaine n’est ni vrai ni faux (§6)', () => {
  it('rend undefined pour une valeur exclue', () => {
    expect(evaluate((x) => 1 / x > 0, 0, [0])).toBeUndefined();
  });

  it('rend undefined si le prédicat lève, sans propager l’erreur', () => {
    expect(evaluate(() => { throw new Error('boom'); }, 1)).toBeUndefined();
  });

  it('rend un booléen sinon', () => {
    expect(evaluate((x) => x > 0, 3)).toBe(true);
    expect(evaluate((x) => x > 0, -3)).toBe(false);
  });
});

describe('§22 — chercher, et dire honnêtement ce qu’on a trouvé', () => {
  const sample = [-3, -2, -1, 0, 1, 2, 3];

  it('un contre-exemple RÉFUTE un ∀', () => {
    const verdict = searchVerdict('forall', (n) => n > 0, sample);
    expect(verdict.status).toBe('disproved');
    expect(verdict.value).toBe(-3);
  });

  it('ne pas trouver de contre-exemple ne PROUVE pas — le statut le dit', () => {
    const verdict = searchVerdict('forall', (x) => x * x >= 0, sample);
    expect(verdict.status).toBe('notFound');
    expect(verdict.status).not.toBe('proved');
    expect(verdict.checked).toBe(sample.length);
  });

  it('un témoin PROUVE un ∃', () => {
    const verdict = searchVerdict('exists', (x) => x * x === 4, sample);
    expect(verdict.status).toBe('proved');
    expect([2, -2]).toContain(verdict.value);
  });

  it('ne pas trouver de témoin ne RÉFUTE pas un ∃', () => {
    const verdict = searchVerdict('exists', (x) => x * x === 5, sample);
    expect(verdict.status).toBe('notFound');
    expect(verdict.status).not.toBe('disproved');
  });

  it('les valeurs hors domaine ne sont pas comptées comme vérifiées', () => {
    const { checked } = searchCounterexample((x) => 1 / x > 0, [0, 1, 2], [0]);
    expect(checked).toBe(2);
  });

  it('searchWitness rend null quand il n’y a personne', () => {
    expect(searchWitness((x) => x > 100, sample).found).toBeNull();
  });
});

describe('§25 — la négation d’un quantificateur', () => {
  const sample = [-3, -2, -1, 0, 1, 2, 3];

  it('¬(∀x, P) ≡ ∃x, ¬P — sur un P vrai partout comme sur un P faux quelque part', () => {
    expect(quantifierNegationHolds('forall', (x) => x * x >= 0, sample)).toBe(true);
    expect(quantifierNegationHolds('forall', (x) => x > 0, sample)).toBe(true);
  });

  it('¬(∃x, P) ≡ ∀x, ¬P', () => {
    expect(quantifierNegationHolds('exists', (x) => x === 2, sample)).toBe(true);
    expect(quantifierNegationHolds('exists', (x) => x === 99, sample)).toBe(true);
  });
});

describe('§7 — la vérité devient une RÉGION de la droite', () => {
  it('x² > x est faux exactement sur [0 ; 1]', () => {
    const { intervals } = truthIntervals((x) => x * x > x, -4, 4, { samples: 800 });
    const falseZone = intervals.filter((iv) => iv.value === false);
    expect(falseZone.length).toBeGreaterThan(0);
    const from = Math.min(...falseZone.map((iv) => iv.from));
    const to = Math.max(...falseZone.map((iv) => iv.to));
    expect(from).toBeGreaterThanOrEqual(-0.02);
    expect(from).toBeLessThanOrEqual(0.02);
    expect(to).toBeGreaterThanOrEqual(0.98);
    expect(to).toBeLessThanOrEqual(1.02);
  });

  it('une égalité vraie en UN point est rendue comme un point, pas comme un intervalle', () => {
    const { points } = truthIntervals((x) => x + 2 === 5, -6, 6, { candidates: [3] });
    expect(points).toEqual([3]);
  });

  it('les valeurs exclues sont rendues à part (§6)', () => {
    const { excluded } = truthIntervals((x) => 1 / x > 0, -4, 4, { excluded: [0] });
    expect(excluded).toEqual([0]);
  });
});

describe('§14, §17 — la partition en ensembles', () => {
  const sample = [0, 1, 2, 3, 4, 5, 6];

  it('P ⊂ Q quand aucune valeur n’est « P seulement »', () => {
    const parts = vennPartition((x) => x > 3, (x) => x > 1, sample);
    expect(parts.pOnly).toEqual([]);
    expect(parts.qOnly).toEqual([2, 3]);
  });

  it('analyzeImplication lit les quatre formes sur la même partition', () => {
    const analysis = analyzeImplication((x) => x > 3, (x) => x > 1, sample);
    expect(analysis.direct.holds).toBe(true);
    expect(analysis.contrapositive.holds).toBe(true);
    expect(analysis.converse.holds).toBe(false);
    expect(analysis.converse.counterexample).toBe(2);
    expect(analysis.inverse.holds).toBe(false);
  });

  it('implicationAt marque le cas CRITIQUE : P vraie, Q fausse', () => {
    const at = implicationAt((x) => x > 3, (x) => x > 5, 4);
    expect(at).toMatchObject({ p: true, q: false, result: false, critical: true });
  });

  it('implicationAt rend null hors domaine plutôt qu’un faux verdict', () => {
    expect(implicationAt((x) => 1 / x > 0, (x) => x > 0, 0, [0]).result).toBeNull();
  });

  /**
   * Le défaut trouvé en QA visuelle : la RÉCIPROQUE était évaluée comme la
   * forme directe, si bien qu'à x = 2 sur « x > 3 ⇒ x > 1 » l'écran disait
   * « صحيحة, car P est fausse ici » — alors que la réciproque « x > 1 ⇒
   * x > 3 » est justement FAUSSE en ce point. Cela enseignait l'inverse de
   * ce que §15 veut faire découvrir.
   */
  describe('implicationAt évalue la FORME regardée, pas toujours la directe', () => {
    const p = (x) => x > 3;
    const q = (x) => x > 1;

    it('à x = 2, la directe est vraie par vacuité', () => {
      const at = implicationAt(p, q, 2, [], 'direct');
      expect(at).toMatchObject({ p: false, q: true, antecedent: false, result: true, critical: false });
    });

    it('à x = 2, la RÉCIPROQUE est fausse — c’est le contre-exemple de §15', () => {
      const at = implicationAt(p, q, 2, [], 'converse');
      expect(at).toMatchObject({ antecedent: true, consequent: false, result: false, critical: true });
    });

    it('à x = 2, la contraposée suit la directe (vraie)', () => {
      expect(implicationAt(p, q, 2, [], 'contrapositive').result).toBe(true);
    });

    it('à x = 2, l’inverse suit la réciproque (fausse)', () => {
      expect(implicationAt(p, q, 2, [], 'inverse').result).toBe(false);
    });

    it('à x = 5, les quatre formes sont vraies', () => {
      for (const form of ['direct', 'converse', 'contrapositive', 'inverse']) {
        expect(implicationAt(p, q, 5, [], form).result, form).toBe(true);
      }
    });

    it('P et Q restent ceux de l’énoncé, quelle que soit la forme', () => {
      const at = implicationAt(p, q, 2, [], 'contrapositive');
      expect(at.p).toBe(false);
      expect(at.q).toBe(true);
    });
  });
});

describe('§18-20 — nécessaire et suffisant, lus sur la même analyse', () => {
  const sample = Array.from({ length: 25 }, (_, i) => i);
  const reading = conditionReading((n) => n % 4 === 0, (n) => n % 2 === 0, sample);

  it('A ⇒ B : A est suffisante pour B, B est nécessaire pour A', () => {
    expect(reading.aImpliesB).toBe(true);
    expect(reading.aSufficientForB).toBe(true);
    expect(reading.bNecessaryForA).toBe(true);
  });

  it('mais B n’est PAS suffisante pour A — et le contre-exemple est nommé', () => {
    expect(reading.bSufficientForA).toBe(false);
    expect(reading.bNotSufficientCounterexample).toBe(2);
  });
});
