// A synthetic bank for the tests of scripts/validate-exercises.mjs: written in a temporary folder and validated there
// (SMARTER_PRACTICE_ROOT), against the neutral one-lesson catalogue (SMARTER_CATALOGUE_FIXTURE). Never real content.
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const repo = join(dirname(fileURLToPath(import.meta.url)), '../../..');
export const LESSON = 'fixture-diviseurs';
const catalogue = join(repo, 'scripts/__fixtures__/catalogue/one-lesson.json');
const roots = [];

/** A clean exam-format 3e exercise of level 2 (French typography, the brevet tags), one step with a) and b). */
export function examExercise(i = 1) {
  const q = (id, sub, statement, expectedAnswer) => ({
    id,
    step: '01',
    sub,
    statement,
    learningPoints: [{ code: `3e_${LESSON}_P1`, role: 'primary' }],
    answerType: 'rational',
    answerFormat: 'un entier naturel',
    expectedAnswer,
    hints: [{ id: 'h1', type: 'look', content: 'Écris la liste des diviseurs de chaque nombre.' }],
    feedback: { correct: 'Exact.', incorrect: 'Reprends la liste des diviseurs communs.' },
    solution: {
      lines: ['Les diviseurs communs de 84 et 126 sont 1, 2, 3, 6, 7, 14, 21 et 42.'],
      result: '\\mathrm{PGCD}(84 ; 126) = 42',
    },
  });
  return {
    id: `ex-3e-${LESSON}-l2-${String(i).padStart(3, '0')}`,
    lessonCode: LESSON,
    level: 2,
    brevet: 2,
    calculator: true,
    metadata: {
      title: `Exercice ${i}`,
      estimatedMinutes: 6,
      source: { type: 'platform_addition', reason: 'brevet_modelled', modelledOn: 'Brevet 2023 II-1' },
      exam: { kind: 'modelled', badge: 'Sur le modèle du brevet 2023', heading: 'Exercice 1', points: '03' },
    },
    statement: {
      content:
        'Un fleuriste a 84 roses et 126 tulipes. Il veut faire des bouquets identiques, sans qu’il reste de fleur. Chaque bouquet sera vendu 12,50\u00a0€.',
    },
    questions: [
      q('q1', 'a', 'Combien de bouquets au plus peut-il faire\u202f?', '42'),
      q('q2', 'b', 'Combien de roses y a-t-il alors dans chaque bouquet\u202f?', '2'),
    ],
  };
}

/** Writes the exercises into a 3e bank and runs the validator: { ok, out }. */
export function validateBank(exercises) {
  const root = mkdtempSync(join(tmpdir(), 'bank-fr-'));
  roots.push(root);
  mkdirSync(join(root, '_schema'), { recursive: true });
  copyFileSync(join(repo, 'content/practice/_schema/exercise.schema.json'), join(root, '_schema/exercise.schema.json'));
  // an EMPTY registry: the real one cites the real lessons' points, which the one-lesson fixture catalogue does not have
  writeFileSync(join(root, 'misconceptions.json'), JSON.stringify({ _comment: 'synthetic bank: no misconception' }));
  writeFileSync(join(root, 'active.json'), JSON.stringify([LESSON]));
  writeFileSync(join(root, 'policy.json'), JSON.stringify({ defaultMinPerLevel: 1, lessons: {} }));
  for (const ex of exercises) {
    const dir = join(root, '3e', ex.lessonCode, `level-${ex.level}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${ex.id}.json`), JSON.stringify(ex));
  }
  const r = spawnSync('node', [join(repo, 'scripts/validate-exercises.mjs')], {
    env: { ...process.env, SMARTER_PRACTICE_ROOT: root, SMARTER_CATALOGUE_FIXTURE: catalogue },
    encoding: 'utf8',
  });
  return { ok: r.status === 0, out: `${r.stdout}\n${r.stderr}` };
}

export const cleanBanks = () => roots.splice(0).forEach((r) => rmSync(r, { recursive: true, force: true }));
