// The answer ORACLE of the exercise bank (scripts/practice-oracle/engine.mjs): every key of the bank is the
// mathematically right answer, recomputed by the lesson's own oracle module (scripts/practice-oracle/<lesson>.mjs).
// First the real bank (empty while no lesson exists), then the engine on a neutral fixture bank of two exercises.
import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readBank, needsOracle, oracleProblems } from './practice-oracle/engine.mjs';
import { R, C, P, q, poly, solve2 } from './practice-oracle/helpers.mjs';
import { ORACLE as FIXTURE_ORACLE } from './__fixtures__/practice-oracle/fixture-diviseurs.oracle.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const GRADES = ['6e', '5e', '4e', '3e'];

// Every lesson's oracle module is merged: adding a lesson's oracle is adding its file, never editing this one.
const ORACLE = {};
for (const f of readdirSync(join(here, 'practice-oracle')).filter((n) => n.endsWith('.mjs') && !['engine.mjs', 'helpers.mjs'].includes(n))) {
  Object.assign(ORACLE, (await import(pathToFileURL(join(here, 'practice-oracle', f)).href)).ORACLE);
}

describe('oracle indépendant du banc — la clé est-elle la réponse juste ?', () => {
  const bank = readBank(join(here, '..', 'content/practice'), GRADES);
  it(`chaque question du banc (${bank.length}) a sa vérification indépendante et la passe`, () => {
    expect(bank.filter((b) => needsOracle(b, ORACLE)).flatMap((b) => oracleProblems(b, ORACLE))).toEqual([]);
  });
});

describe('le moteur de l’oracle — banc témoin', () => {
  const root = join(here, '__fixtures__/practice-oracle');
  const bank = readBank(root, GRADES);
  const one = (key) => bank.find((b) => b.key === key);
  const withKey = (key, patch) => ({ ...one(key), q: { ...one(key).q, ...patch } });

  it('lit chaque question du banc, par classe', () => {
    expect(bank.map((b) => b.key)).toEqual([
      'ex-3e-fixture-diviseurs-l1-001:q1', 'ex-3e-fixture-diviseurs-l1-001:q2',
      'ex-3e-fixture-diviseurs-l1-002:q1', 'ex-3e-fixture-diviseurs-l1-002:q2', 'ex-3e-fixture-diviseurs-l1-002:q3',
    ]);
    expect(readBank(root, ['6e'])).toEqual([]);
  });

  it('passe quand chaque clé est la réponse recalculée', () => {
    expect(bank.filter((b) => needsOracle(b, FIXTURE_ORACLE)).flatMap((b) => oracleProblems(b, FIXTURE_ORACLE))).toEqual([]);
  });

  it('une auto-évaluation n’a pas de clé ; un QCM sans entrée est laissé au validateur', () => {
    expect(needsOracle(one('ex-3e-fixture-diviseurs-l1-002:q3'), FIXTURE_ORACLE)).toBe(false);
    expect(needsOracle(one('ex-3e-fixture-diviseurs-l1-002:q1'), {})).toBe(false);
    expect(needsOracle(one('ex-3e-fixture-diviseurs-l1-001:q1'), {})).toBe(true);
  });

  it('échoue sur une question sans vérification indépendante', () => {
    expect(oracleProblems(one('ex-3e-fixture-diviseurs-l1-001:q1'), {}).join()).toMatch(/aucune vérification indépendante/);
  });

  it('échoue quand la clé du contenu n’est pas la réponse juste', () => {
    const k = 'ex-3e-fixture-diviseurs-l1-001:q1';
    expect(oracleProblems(withKey(k, { expectedAnswer: '21' }), FIXTURE_ORACLE).join()).toMatch(/refuse la réponse juste/);
    const s = 'ex-3e-fixture-diviseurs-l1-001:q2';
    expect(oracleProblems(withKey(s, { expectedAnswer: [1, 2, 3, 4, 12] }), FIXTURE_ORACLE).join()).toMatch(/refuse la réponse juste|n'est pas la réponse juste/);
  });

  it('échoue quand un QCM accepte un autre choix que celui de l’oracle', () => {
    const k = 'ex-3e-fixture-diviseurs-l1-002:q1';
    const choices = one(k).q.choices.map((c) => ({ ...c, isCorrect: c.id === 'B' }));
    expect(oracleProblems(withKey(k, { choices }), FIXTURE_ORACLE).join()).toMatch(/le choix « B » est accepté/);
  });
});

describe('la bibliothèque des oracles (helpers.mjs) — calcul exact, indépendant de packages/core', () => {
  it('rationnels exacts', () => {
    expect(q('84/126').toString()).toBe('2/3');
    expect(q('0,25').add('1/4').toString()).toBe('1/2');
    expect(q(-3).div(6).toString()).toBe('-1/2');
    expect(() => q(1).div(0)).toThrow();
  });
  it('polynômes à coefficients rationnels', () => {
    const A = poly.x.add(2).mul(poly.x.mul(3).sub(1)); // (x + 2)(3x − 1) = 3x² + 5x − 2
    expect([A.coef(2), A.coef(1), A.coef(0)]).toEqual(['3', '5', '-2']);
    expect(A.at('1/2')).toBe('5/4'); // (1/2 + 2)(3/2 − 1)
    expect(A.equals(poly.x.pow(2).mul(3).add(poly.x.mul(5)).sub(2))).toBe(true);
  });
  it('système de deux équations (Cramer exact)', () => {
    expect(solve2(1, 1, 10, 1, -1, 2)).toEqual(['6', '4']);
    expect(() => solve2(1, 2, 3, 2, 4, 6)).toThrow(/déterminant nul/);
  });
  it('formes de réponse de l’évaluateur', () => {
    expect([R(3), C('A'), P('1/2', -1)]).toEqual([{ value: '3' }, { choiceId: 'A' }, { x: '1/2', y: '-1' }]);
  });
});
