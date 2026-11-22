// L'ORACLE des réponses du « مختبر التفكير » — copie du principe de practice-answer-oracle.test.mjs.
//
// Le validateur prouve que la réponse configurée est LISIBLE et cohérente avec les erreurs
// déclarées. Ce test prouve autre chose : qu'elle est MATHÉMATIQUEMENT juste. Chaque réponse
// est recalculée dans scripts/thinking-lab-oracle/<lot>.mjs par un chemin indépendant, pour
// CHAQUE tuple de `params`, puis :
//   1. expression : la réponse du contenu vaut l'oracle en des points du domaine ;
//      autre check : la valeur de l'oracle est acceptée par le vrai juge (checkAnswer) ;
//   2. idem pour `ceiling` et chaque `parts[i]` ;
//   3. chaque erreur déclarée est refusée.
// Un défi publié sans oracle fait échouer le test.
import { describe, it, expect } from 'vitest';
import { readChallenges } from './build-thinking-lab-index.mjs';
import { checkAnswer, mistakeExpression, expressionOptions, exactValue } from '../packages/core/thinkingLab/checkAnswer.js';
import { evaluateExpression, samplePoints, closeEnough } from '../packages/core/thinkingLab/expression.js';
import { allTuples, fillChallenge } from '../packages/core/thinkingLab/params.js';
import { ORACLE as SEED } from './thinking-lab-oracle/seed.mjs';
import { ORACLE as PRIMARY } from './thinking-lab-oracle/primary.mjs';
import { ORACLE as MIDDLE } from './thinking-lab-oracle/middle.mjs';
import { ORACLE as SECONDARY } from './thinking-lab-oracle/secondary.mjs';
import { ORACLE as UNIVERSITY } from './thinking-lab-oracle/university.mjs';

// Un lot par tranche (écrits en parallèle, jamais deux auteurs sur le même fichier).
const ORACLE = { ...SEED, ...PRIMARY, ...MIDDLE, ...SECONDARY, ...UNIVERSITY };
const challenges = readChallenges().map((e) => e.data).filter((c) => c?.status === 'published');

function expectMatchesOracle(spec, compute, values, tolerance, label) {
  if (spec.check === 'expression') {
    const opts = expressionOptions(spec);
    const points = samplePoints(opts.vars, { samples: 12, domain: opts.domain, seed: 4242 }).slice(0, 12);
    expect(points.length, `${label} : aucun point dans le domaine`).toBeGreaterThan(0);
    for (const point of points) {
      const content = evaluateExpression(String(spec.value), point, opts.vars);
      const oracle = compute(values, point);
      expect(content, `${label} indéfinie en ${JSON.stringify(point)}`).not.toBeNull();
      expect(closeEnough(content, oracle, tolerance, 1e-12), `${label} en ${JSON.stringify(point)} : contenu ${content}, oracle ${oracle}`).toBe(true);
    }
  } else {
    const r = checkAnswer(spec, String(compute(values, {})));
    expect(r.correct, `${label} : l'oracle ${compute(values, {})} est refusé (${r.outcome})`).toBe(true);
  }
}

describe('oracle du « مختبر التفكير »', () => {
  it('lit au moins un défi publié', () => {
    expect(challenges.length).toBeGreaterThan(0);
  });

  for (const c of challenges) {
    describe(`#${c.number} ${c.id}`, () => {
      const oracle = ORACLE[c.id];

      it('a un oracle indépendant', () => {
        expect(oracle, `ajouter ORACLE['${c.id}'] dans scripts/thinking-lab-oracle/`).toBeDefined();
        if (c.ceiling) expect(oracle.ceiling, 'ceiling sans oracle').toBeTypeOf('function');
        if (c.parts) expect(oracle.parts?.length, 'parts sans oracle').toBe(c.parts.length);
      });

      it('la réponse, le plafond et les parties valent l\'oracle pour chaque tuple', () => {
        if (!oracle) return;
        const tol = oracle.tolerance ?? 1e-9;
        for (const values of allTuples(c.params)) {
          const f = fillChallenge(c, values);
          expectMatchesOracle(f.answer, oracle.answer, values, tol, `answer ${JSON.stringify(values)}`);
          if (f.ceiling) expectMatchesOracle(f.ceiling.answer, oracle.ceiling, values, tol, 'ceiling');
          (f.parts ?? []).forEach((p, i) => expectMatchesOracle(p.answer, oracle.parts[i], values, tol, `parts[${i}]`));
        }
      });

      it('chaque erreur déclarée est refusée', () => {
        for (const values of allTuples(c.params)) {
          const f = fillChallenge(c, values);
          f.mistakes.forEach((m) => {
            const typed = ['integer', 'rational'].includes(f.answer.check) && !m.outside ? exactValue(String(m.value))?.toString() : mistakeExpression(m);
            const r = checkAnswer(f.answer, typed, { mistakes: f.mistakes });
            expect(r.outcome, `erreur « ${m.value} » illisible`).not.toBe('syntax_error');
            expect(r.correct, `erreur « ${m.value} » acceptée`).toBe(false);
          });
        }
      });
    });
  }
});

describe('acceptation de la phase 0 — #318 lu dans le contenu', () => {
  const c = challenges.find((x) => x.number === 318);

  it('existe, publié, sous l\'id stable four-arcs-area', () => {
    expect(c?.id).toBe('four-arcs-area');
  });

  it.each(['(3+π−3√3)x²/3', 'x² + πx²/3 − √3x²', 'x^(2)(1+(pi)/(3)-sqrt(3))'])('accepte « %s »', (raw) => {
    expect(checkAnswer(c.answer, raw, { mistakes: c.mistakes }).correct).toBe(true);
  });

  it('refuse ses 3 erreurs déclarées, chacune avec sa réponse « ليس بعد »', () => {
    expect(c.mistakes).toHaveLength(3);
    c.mistakes.forEach((m, i) => {
      expect(checkAnswer(c.answer, mistakeExpression(m), { mistakes: c.mistakes })).toMatchObject({ correct: false, mistakeIndex: i });
    });
  });
});
