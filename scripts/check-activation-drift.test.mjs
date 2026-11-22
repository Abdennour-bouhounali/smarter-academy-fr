import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const script = resolve(repoRoot, 'scripts/check-activation-drift.mjs');
const exportPath = resolve(repoRoot, 'packages/core/curriculum/.generated/curriculum-export.json');

/**
 * La garde est lancée en SOUS-PROCESSUS, avec le contrôle base de données
 * sauté : ce test éprouve la détection d'un export périmé, qui est la moitié
 * qu'on peut vérifier sans MySQL. L'autre moitié (base ↔ export) a sa propre
 * couverture côté PHP.
 */
function run() {
  return spawnSync('node', [script], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env, SKIP_DB_DRIFT_CHECK: '1' },
  });
}

function regenerate() {
  const result = spawnSync('node', ['packages/core/curriculum/exportCurriculum.mjs'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  expect(result.status, result.stderr).toBe(0);
}

describe('check-activation-drift', () => {
  it('passe quand l’export reflète le catalogue', () => {
    regenerate();
    const result = run();
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toContain('Aucune dérive');
  });

  it('échoue quand l’activation d’une classe a dérivé', () => {
    regenerate();
    const exported = JSON.parse(readFileSync(exportPath, 'utf8'));
    const original = JSON.stringify(exported, null, 2);

    // Une classe déclarée active dans l'export, mais pas dans activeGrades.js :
    // exactement ce que produit un oubli d'export après réactivation.
    exported.grades[0].active = !exported.grades[0].active;
    writeFileSync(exportPath, JSON.stringify(exported, null, 2));

    try {
      const result = run();
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(exported.grades[0].code);
      expect(result.stderr).toContain('périmé');
    } finally {
      writeFileSync(exportPath, original);
    }
  });

  // Le PALIER n'est plus une affaire de catalogue : il appartient à la base
  // (lessons.tier, décidé par l'administrateur). L'export ne doit donc en
  // porter aucun, et la garde ne doit pas en comparer — sinon chaque
  // décision d'administration redeviendrait une « dérive ».
  it('l’export ne porte aucun palier de leçon', () => {
    regenerate();
    const exported = JSON.parse(readFileSync(exportPath, 'utf8'));
    const lessons = exported.grades.flatMap((g) => g.chapters ?? []).flatMap((c) => c.lessons ?? []);
    expect(lessons.length).toBeGreaterThan(0);
    for (const lesson of lessons) {
      expect(lesson, lesson.code).not.toHaveProperty('tier');
    }
  });

  it('échoue quand l’export porte une leçon inconnue du catalogue', () => {
    regenerate();
    const exported = JSON.parse(readFileSync(exportPath, 'utf8'));
    const original = JSON.stringify(exported, null, 2);

    const chapter = exported.grades
      .flatMap((g) => g.chapters ?? [])
      .find((c) => (c.lessons ?? []).length > 0);
    chapter.lessons.push({ ...chapter.lessons[0], code: '__lecon-fantome__' });
    writeFileSync(exportPath, JSON.stringify(exported, null, 2));

    try {
      const result = run();
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('__lecon-fantome__');
    } finally {
      writeFileSync(exportPath, original);
    }
  });

  it('échoue quand une leçon manque à l’export', () => {
    regenerate();
    const exported = JSON.parse(readFileSync(exportPath, 'utf8'));
    const original = JSON.stringify(exported, null, 2);

    const chapter = exported.grades
      .flatMap((g) => g.chapters ?? [])
      .find((c) => (c.lessons ?? []).length > 0);
    const removed = chapter.lessons.shift();
    writeFileSync(exportPath, JSON.stringify(exported, null, 2));

    try {
      const result = run();
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(removed.code);
    } finally {
      writeFileSync(exportPath, original);
    }
  });
});
