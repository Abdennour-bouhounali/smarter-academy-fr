import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { OUTCOMES, isSuccessOutcome, isInertOutcome } from './answerEvaluator.js';

// La fixture partagée avec App\Domain\Progress\Outcome (PHP) : les deux
// runtimes lisent le MÊME fichier, donc la taxonomie ne peut pas dériver
// d'un côté sans casser un test de l'autre.
const fixture = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'fixtures/outcomes.json'), 'utf8'),
);

/** Le taux de réussite, tel qu'OutcomeStats (PHP) le définit. */
function successRate(outcomes) {
  const s = outcomes.filter((o) => fixture.semantics[o].success).length;
  const p = outcomes.filter((o) => fixture.semantics[o].partial).length;
  const f = outcomes.filter((o) => fixture.semantics[o].failure).length;
  const d = s + p + f;
  return d > 0 ? Math.round((s / d) * 1000) / 10 : null;
}

describe('taxonomie des issues — lockstep JS/PHP', () => {
  it('OUTCOMES expose exactement les six issues de la fixture', () => {
    expect(Object.values(OUTCOMES).sort()).toEqual([...fixture.outcomes].sort());
  });

  it('isSuccessOutcome / isInertOutcome suivent la sémantique de la fixture', () => {
    for (const [outcome, s] of Object.entries(fixture.semantics)) {
      expect(isSuccessOutcome(outcome)).toBe(s.success);
      expect(isInertOutcome(outcome)).toBe(s.inert);
    }
  });

  it('les cas de taux de réussite de la fixture sont cohérents avec la formule', () => {
    for (const c of fixture.successRate.cases) {
      expect(successRate(c.outcomes)).toBe(c.rate);
    }
  });
});
