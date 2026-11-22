// L'ORACLE des réponses du laboratoire de réflexion — copie du principe de practice-answer-oracle.test.mjs.
// La banque livrée est vide : le moteur tourne aussi sur un défi témoin (scripts/__fixtures__/thinking-lab/).
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
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ORACLE as FIXTURE_ORACLE } from './__fixtures__/thinking-lab/four-arcs-area.oracle.mjs';

// One oracle module per batch in scripts/thinking-lab-oracle/ (none while the bank is empty), merged here.
const ORACLE_DIR = fileURLToPath(new URL('./thinking-lab-oracle/', import.meta.url));
const ORACLE = {};
for (const f of existsSync(ORACLE_DIR) ? readdirSync(ORACLE_DIR).filter((n) => n.endsWith('.mjs')) : []) {
  Object.assign(ORACLE, (await import(pathToFileURL(`${ORACLE_DIR}${f}`).href)).ORACLE);
}
const published = (entries) => entries.map((e) => e.data).filter((c) => c?.status === 'published');
const challenges = published(readChallenges());
const fixtures = published(readChallenges(fileURLToPath(new URL('./__fixtures__/thinking-lab/challenges', import.meta.url))));

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

function oracleSuite(title, list, ORACLE) {
describe(title, () => {
  it(`chaque défi publié (${list.length}) a un oracle indépendant`, () => {
    expect(list.filter((c) => !ORACLE[c.id]).map((c) => c.id)).toEqual([]);
  });

  for (const c of list) {
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
}

oracleSuite('oracle du laboratoire de réflexion — la banque', challenges, ORACLE);
oracleSuite('oracle du laboratoire de réflexion — le défi témoin', fixtures, FIXTURE_ORACLE);

describe('le défi témoin est lu', () => {
  it('lit exactement un défi publié dans le dossier témoin', () => {
    expect(fixtures.map((c) => c.id)).toEqual(['four-arcs-area']);
  });
});

describe('acceptation du juge — #318 lu dans le défi témoin', () => {
  const c = fixtures.find((x) => x.number === 318);

  it('existe, publié, sous l\'id stable four-arcs-area', () => {
    expect(c?.id).toBe('four-arcs-area');
  });

  it.each(['(3+π−3√3)x²/3', 'x² + πx²/3 − √3x²', 'x^(2)(1+(pi)/(3)-sqrt(3))'])('accepte « %s »', (raw) => {
    expect(checkAnswer(c.answer, raw, { mistakes: c.mistakes }).correct).toBe(true);
  });

  it('refuse ses 3 erreurs déclarées, chacune avec sa réponse « pas encore »', () => {
    expect(c.mistakes).toHaveLength(3);
    c.mistakes.forEach((m, i) => {
      expect(checkAnswer(c.answer, mistakeExpression(m), { mistakes: c.mistakes })).toMatchObject({ correct: false, mistakeIndex: i });
    });
  });
});
