// Mastery V2 — le contrat des banques d'exercices GÉNÉRÉES, tel que
// validate-exercises.mjs l'applique : un exercice généré qui passe le
// validateur est prêt pour la maîtrise ; un exercice qui ment sur sa
// famille (templateId) ou sur sa difficulté est refusé.
//
// Chaque cas écrit une petite banque synthétique dans un dossier temporaire
// et lance le validateur dessus (SMARTER_PRACTICE_ROOT), contre un catalogue
// neutre d'une leçon (SMARTER_CATALOGUE_FIXTURE) : le catalogue livré est vide.
import { describe, it, expect, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const lesson = 'fixture-diviseurs';
const catalogue = join(repo, 'scripts/__fixtures__/catalogue/one-lesson.json');
const roots = [];

function exercise(i, { templateId, lp = '3e_fixture-diviseurs_P1', difficulty, cognitiveDemand, answerType = 'rational' } = {}) {
  const id = `ex-3e-${lesson}-l2-${String(i).padStart(3, '0')}`;
  const question = {
    id: 'q1',
    statement: 'Quel est le plus grand diviseur commun ?',
    learningPoints: [{ code: lp, role: 'primary' }],
    answerType,
    hints: [{ id: 'h1', type: 'look', content: 'Écris les diviseurs de chaque nombre.' }],
    feedback: { correct: 'Exact.', incorrect: 'Revois les diviseurs communs.' },
  };
  if (answerType === 'rational') {
    question.answerFormat = 'un entier naturel';
    question.expectedAnswer = '6';
  } else {
    question.choices = [{ id: 'A', content: '6', isCorrect: true }, { id: 'B', content: '3', isCorrect: false }];
  }
  if (difficulty !== undefined) question.difficulty = difficulty;
  if (cognitiveDemand !== undefined) question.cognitiveDemand = cognitiveDemand;
  return {
    id, lessonCode: lesson, level: 2,
    ...(templateId ? { templateId, generator: { tool: 'test', version: '1', seed: i } } : {}),
    metadata: { title: `Exercice ${i}`, estimatedMinutes: 3 },
    statement: { content: 'Deux nombres : 12 et 18.' },
    questions: [question],
  };
}

function validate(exercises) {
  const root = mkdtempSync(join(tmpdir(), 'bank-'));
  roots.push(root);
  mkdirSync(join(root, '_schema'), { recursive: true });
  copyFileSync(join(repo, 'content/practice/_schema/exercise.schema.json'), join(root, '_schema/exercise.schema.json'));
  copyFileSync(join(repo, 'content/practice/misconceptions.json'), join(root, 'misconceptions.json'));
  writeFileSync(join(root, 'active.json'), JSON.stringify([lesson]));
  writeFileSync(join(root, 'policy.json'), JSON.stringify({ defaultMinPerLevel: 1, lessons: {} }));
  const dir = join(root, '3e', lesson, 'level-2');
  mkdirSync(dir, { recursive: true });
  for (const ex of exercises) writeFileSync(join(dir, `${ex.id}.json`), JSON.stringify(ex));
  const r = spawnSync('node', [join(repo, 'scripts/validate-exercises.mjs')], {
    env: { ...process.env, SMARTER_PRACTICE_ROOT: root, SMARTER_CATALOGUE_FIXTURE: catalogue }, encoding: 'utf8',
  });
  return { ok: r.status === 0, out: `${r.stdout}\n${r.stderr}` };
}

afterAll(() => roots.forEach((r) => rmSync(r, { recursive: true, force: true })));

describe('validate-exercises — contrat Mastery V2 des banques générées', () => {
  it('accepte des variantes cohérentes d’un même gabarit, avec difficulté et demande cognitive', () => {
    const r = validate([
      exercise(1, { templateId: 'tpl-3e-pgcd-test', difficulty: 2, cognitiveDemand: 'apply' }),
      exercise(2, { templateId: 'tpl-3e-pgcd-test', difficulty: 3, cognitiveDemand: 'transfer' }),
    ]);
    expect(r.out).not.toMatch(/templateId|difficulty doit|cognitiveDemand/);
  });

  it('refuse deux variantes d’un gabarit qui visent des learning points principaux différents', () => {
    const r = validate([
      exercise(1, { templateId: 'tpl-3e-pgcd-test', lp: '3e_fixture-diviseurs_P1' }),
      exercise(2, { templateId: 'tpl-3e-pgcd-test', lp: '3e_fixture-diviseurs_P2' }),
    ]);
    expect(r.ok).toBe(false);
    expect(r.out).toMatch(/variantes doivent partager/);
  });

  it('refuse deux variantes d’un gabarit qui changent de type de réponse', () => {
    const r = validate([
      exercise(1, { templateId: 'tpl-3e-pgcd-test' }),
      exercise(2, { templateId: 'tpl-3e-pgcd-test', answerType: 'choice' }),
    ]);
    expect(r.ok).toBe(false);
    expect(r.out).toMatch(/variantes doivent partager/);
  });

  it('refuse une difficulté hors 1..5, une demande cognitive inconnue et un templateId mal formé', () => {
    expect(validate([exercise(1, { difficulty: 7 })]).out).toMatch(/difficulty doit être un entier de 1 à 5/);
    expect(validate([exercise(1, { cognitiveDemand: 'magic' })]).out).toMatch(/cognitiveDemand « magic » inconnu/);
    expect(validate([exercise(1, { templateId: 'Template 1' })]).out).toMatch(/templateId/);
  });
});
