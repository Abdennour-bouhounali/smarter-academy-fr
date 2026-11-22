/**
 * La fixture partagée `fixtures/answers.json` est la SEULE source de vérité de
 * l'équivalence sémantique entre cet évaluateur et son portage PHP
 * (apps/api/app/Domain/Practice/Support/AnswerEvaluator.php, verrouillé par
 * tests/Unit/Practice/AnswerEvaluatorFixtureTest.php).
 *
 * Les valeurs attendues ont été produites en EXÉCUTANT cet évaluateur — jamais
 * écrites à la main. Si ce test échoue, c'est que le comportement JS a changé :
 * régénérer la fixture est une décision de contrat, à prendre des deux côtés.
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { evaluateAnswer } from './answerEvaluator.js';

const cases = JSON.parse(readFileSync(new URL('./fixtures/answers.json', import.meta.url), 'utf8'));

describe('fixture partagée JS ↔ PHP', () => {
  it('contient un corpus suffisant, sans doublon de nom', () => {
    expect(cases.length).toBeGreaterThanOrEqual(60);
    expect(new Set(cases.map((c) => c.name)).size).toBe(cases.length);
  });

  for (const { name, question, answer, expected } of cases) {
    it(name, () => {
      if (expected.throws) {
        expect(() => evaluateAnswer(answer, question)).toThrow(expected.throws);
        return;
      }
      const r = evaluateAnswer(answer, question);
      expect({
        outcome: r.outcome,
        misconceptionId: r.misconceptionId,
        normalized: r.normalized,
        isCorrect: r.isCorrect,
        feedbackKey: r.feedbackKey,
      }).toEqual(expected);
    });
  }
});
