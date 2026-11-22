// The ENGINE of the answer oracle of the exercise bank (content/practice/<grade>/<lesson>/level-N).
//
// The evaluator's tests only prove it accepts the CONFIGURED key. The oracle proves something else: that the key is the
// MATHEMATICALLY right answer. A lesson's oracle module (scripts/practice-oracle/<lesson>.mjs, `export const ORACLE`)
// RECOMPUTES each answer with arithmetic written there (helpers.mjs), never read from the content. Then, per question:
//   1. the oracle's answer is accepted by the real evaluator;
//   2. the content's key is that answer (same value / same set / same point);
//   3. for a single-choice question, only the oracle's choice is accepted.
// A question of the bank with no oracle entry fails: a new exercise arrives with its independent check. A multiple
// choice question without an entry is left to the validator's key round trip (validate-exercises.mjs).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { evaluateAnswer, isSuccessOutcome } from '../../packages/core/practice/answerEvaluator.js';

const C = (id) => ({ choiceId: id });

/** Every question of a bank root, as `{ key: '<exercise id>:<question id>', q }`, for the given grade folders. */
export function readBank(root, grades) {
  const out = [];
  for (const grade of grades) {
    const gdir = join(root, grade);
    if (!existsSync(gdir)) continue;
    for (const lesson of readdirSync(gdir).sort()) {
      const ldir = join(gdir, lesson);
      if (!statSync(ldir).isDirectory()) continue;
      for (const lvl of readdirSync(ldir).sort()) {
        for (const f of readdirSync(join(ldir, lvl)).sort()) {
          const ex = JSON.parse(readFileSync(join(ldir, lvl, f), 'utf8'));
          for (const q of ex.questions) out.push({ key: `${ex.id}:${q.id}`, q });
        }
      }
    }
  }
  return out;
}

/** Does the question need an oracle entry? A self-check has no key; a QCM without an entry is the validator's. */
export const needsOracle = ({ key, q }, oracle) =>
  q.answerType !== 'selfCheck' && !((q.answerType === 'choice' || q.answerType === 'multiChoice') && !(key in oracle));

/** @returns {string[]} what is wrong with one question against the oracle (empty = its key is the right answer). */
export function oracleProblems({ key, q }, oracle) {
  if (!(key in oracle)) return [`${key}: aucune vérification indépendante`];
  const expected = oracle[key];
  const problems = [];
  const verdict = evaluateAnswer(expected, q);
  if (!isSuccessOutcome(verdict.outcome)) problems.push(`${key}: l'évaluateur refuse la réponse juste ${JSON.stringify(expected)} (${verdict.outcome})`);
  const same = (ok) => { if (!ok) problems.push(`${key}: la clé du contenu n'est pas la réponse juste ${JSON.stringify(expected)}`); };
  if (q.answerType === 'rational') same(evaluateAnswer({ value: String(q.expectedAnswer) }, { ...q, expectedAnswer: expected.value }).isCorrect);
  if (q.answerType === 'integerSet') same([...q.expectedAnswer].sort((a, b) => a - b).join(',') === expected.value.split(', ').join(','));
  if (q.answerType === 'point') same(evaluateAnswer({ x: String(q.expectedAnswer.x), y: String(q.expectedAnswer.y) }, { ...q, expectedAnswer: expected }).isCorrect);
  if (q.answerType === 'choice') {
    for (const c of q.choices) {
      const accepted = isSuccessOutcome(evaluateAnswer(C(c.id), q).outcome);
      if (accepted !== (c.id === expected.choiceId)) problems.push(`${key}: le choix « ${c.id} » est ${accepted ? 'accepté' : 'refusé'} alors que la réponse juste est « ${expected.choiceId} »`);
    }
  }
  return problems;
}
