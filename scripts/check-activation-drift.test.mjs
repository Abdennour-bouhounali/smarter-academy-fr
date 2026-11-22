import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectFromCatalogue, projectFromExport, exportDrift } from './lib/activationDrift.mjs';

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

  it('échoue quand l’export porte une leçon inconnue du catalogue', () => {
    regenerate();
    const exported = JSON.parse(readFileSync(exportPath, 'utf8'));
    const original = JSON.stringify(exported, null, 2);

    // The shipped catalogue has no lesson yet: the ghost comes in its own chapter.
    exported.grades[0].chapters.push({ code: '__chapitre__', lessons: [{ code: '__lecon-fantome__' }] });
    writeFileSync(exportPath, JSON.stringify(exported, null, 2));

    try {
      const result = run();
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('__lecon-fantome__');
    } finally {
      writeFileSync(exportPath, original);
    }
  });
});

// The same rules on a neutral catalogue of two lessons (the shipped one is empty): what the subprocess cannot show.
describe('exportDrift — catalogue fixture', () => {
  const catalogue = [{ id: 'college', grades: [{ id: '3e', chapters: [{ id: 'nombres_calculs', lessons: [{ id: 'fixture-a' }, { id: 'fixture-b' }] }] }] }];
  const source = () => projectFromCatalogue(catalogue, (id) => id === '3e');
  const exportOf = (lessons, extra = {}) => ({ grades: [{ code: '3e', active: true, chapters: [{ code: 'nombres_calculs', lessons }], ...extra }] });

  it('passes when the export carries the same lessons', () => {
    expect(exportDrift(source(), projectFromExport(exportOf([{ code: 'fixture-a' }, { code: 'fixture-b' }])))).toEqual([]);
  });

  it('échoue quand une leçon manque à l’export', () => {
    expect(exportDrift(source(), projectFromExport(exportOf([{ code: 'fixture-b' }]))).join()).toContain('« fixture-a » (3e) absente de l\'export');
  });

  it('échoue quand l’export porte une leçon inconnue du catalogue', () => {
    const lessons = [{ code: 'fixture-a' }, { code: 'fixture-b' }, { code: 'fixture-ghost' }];
    expect(exportDrift(source(), projectFromExport(exportOf(lessons))).join()).toContain('« fixture-ghost » (3e) dans l\'export mais absente du catalogue');
  });

  // The tier belongs to the database (lessons.tier, decided by the administrator): a tier in the export is never a drift.
  it('ne compare aucun palier de leçon', () => {
    const lessons = [{ code: 'fixture-a', tier: 'premium' }, { code: 'fixture-b', tier: 'free' }];
    expect(exportDrift(source(), projectFromExport(exportOf(lessons)))).toEqual([]);
  });

  it('échoue quand une classe manque à l’export ou n’existe pas au catalogue', () => {
    expect(exportDrift(source(), {}).join()).toContain('« 3e » présente dans coursesData.js mais absente de l\'export');
    const extra = { ...projectFromExport(exportOf([{ code: 'fixture-a' }, { code: 'fixture-b' }])), '2nde': { active: false, lessons: {} } };
    expect(exportDrift(source(), extra).join()).toContain('« 2nde » dans l\'export mais absente de coursesData.js');
  });
});
