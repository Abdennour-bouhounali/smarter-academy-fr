// The oracle of the neutral fixture bank (scripts/__fixtures__/practice-oracle/3e/fixture-diviseurs): each answer is
// RECOMPUTED from the numbers of the statement with helpers.mjs, exactly as a lesson's oracle module would.
import { R, C, q } from '../../practice-oracle/helpers.mjs';

const divisors = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const pgcd = (a, b) => Math.max(...divisors(Math.min(a, b)).filter((d) => a % d === 0 && b % d === 0));

export const ORACLE = {
  'ex-3e-fixture-diviseurs-l1-001:q1': R(pgcd(84, 126)),
  'ex-3e-fixture-diviseurs-l1-001:q2': { value: divisors(12).join(', ') },
  'ex-3e-fixture-diviseurs-l1-002:q1': C(91 % 7 === 0 ? 'A' : 'B'),
  'ex-3e-fixture-diviseurs-l1-002:q2': R(q('84/126').toString()),
};
