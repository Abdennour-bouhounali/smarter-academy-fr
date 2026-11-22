// The catalogue scope guard (scripts/lib/catalogueScope.mjs) on a neutral fixture, then the script on the real tree.
import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalogueScopeProblems } from './lib/catalogueScope.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const lesson = (id, extra = {}) => ({ id, path: `/courses/college/3e/nombres_calculs/${id}`, ...extra });
const levels = (grades, levelId = 'college') => [{ id: levelId, grades }];
const french = () => levels([
  { id: '4e', chapters: [] },
  { id: '3e', chapters: [{ id: 'nombres_calculs', lessons: [lesson('fixture-diviseurs')] }] },
]);

function problemsOf({ all = french(), active = all, activeGradeIds = ['4e', '3e'], onDisk = [] } = {}) {
  return catalogueScopeProblems({ courseLevels: active, allCourseLevels: all, activeGradeIds, exists: (p) => onDisk.includes(p) });
}

describe('catalogue scope', () => {
  it('passes on a French catalogue with nothing Algerian on disk', () => {
    expect(problemsOf()).toEqual([]);
  });

  it('fails on an Algerian grade or level in the catalogue', () => {
    const all = levels([{ id: '4am', chapters: [] }], 'moyen');
    const problems = problemsOf({ all, active: [], activeGradeIds: [] }).join('\n');
    expect(problems).toContain('Algerian level "moyen"');
    expect(problems).toContain('Algerian grade "4am"');
    expect(problemsOf({ all: levels([{ id: 'terminale_dz', chapters: [] }]), active: [], activeGradeIds: [] }).join()).toContain('"terminale_dz"');
  });

  it('fails on an Algerian grade id among the active ones', () => {
    expect(problemsOf({ activeGradeIds: ['4e', '3e', '1am'] }).join('\n')).toContain('ACTIVE_GRADE_IDS holds the Algerian grade "1am"');
  });

  it('fails on a lesson whose path is under an Algerian level', () => {
    const all = levels([{ id: '3e', chapters: [{ id: 'x', lessons: [lesson('ghost', { path: '/courses/moyen/4am/x/ghost' })] }] }]);
    expect(problemsOf({ all, activeGradeIds: ['3e'] }).join()).toContain('Algerian lesson "ghost"');
  });

  it('fails when an Algerian folder is back on disk', () => {
    for (const path of ['apps/web/src/lessons/moyen', 'packages/core/curriculum/dz']) {
      expect(problemsOf({ onDisk: [path] }).join()).toContain(`${path}/ exists again`);
    }
  });

  it('fails on an inactive grade in the active catalogue and on an active id no grade has', () => {
    expect(problemsOf({ activeGradeIds: ['3e'] }).join()).toContain('inactive grade "4e"');
    expect(problemsOf({ activeGradeIds: ['4e', '3e', '2nde'] }).join()).toContain('"2nde", which no grade');
  });

  it('fails on a tier in the catalogue', () => {
    const all = levels([{ id: '3e', chapters: [{ id: 'x', lessons: [lesson('paid', { tier: 'premium' })] }] }]);
    expect(problemsOf({ all, activeGradeIds: ['3e'] }).join()).toContain('"paid" carries a `tier`');
  });

  it('passes on the real catalogue and the real tree', () => {
    const r = spawnSync('node', ['scripts/check-dormant-isolation.mjs'], { cwd: repoRoot, encoding: 'utf8' });
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(r.stdout).toContain('No Algerian grade, level or lesson');
  });
});
