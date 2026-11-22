import { describe, it, expect } from 'vitest';
import { Children, isValidElement } from 'react';
import {
  isLessonBuilt, getTotalModules, getModulePath, getBuiltLessons, getLessonBasePath,
  loadLessonConfig, loadLessonRoutesFactory, getLoadedLessonConfig, lessonPackFlags,
} from './registry';
import { ACTIVE_GRADE_IDS } from '@smarter-academy/core';

/**
 * Dormant-grade isolation, registry half (docs/ALGERIA_MIGRATION_AUDIT.md
 * §15). The generated index only lists active grades and registry.js filters
 * it again by ACTIVE_GRADE_IDS — this locks that no lesson under a dormant
 * grade is ever resolvable through the registry, independent of which
 * specific grades are active at any given time.
 */
describe('registry — dormant-grade isolation', () => {
  it('ne résout AUCUNE leçon française, alors que des classes sont actives', async () => {
    // (Les dossiers français ont été supprimés le 2026-09-25 ; ce test garde
    // qu'aucun identifiant français ne se résout, même si un dossier revenait.)
    expect(ACTIVE_GRADE_IDS.length).toBeGreaterThan(0);
    expect(isLessonBuilt('fonction-affine-2nde')).toBe(false);
    expect(getTotalModules('fonction-affine-2nde')).toBeNull();
    expect(getModulePath('fonction-affine-2nde', 1)).toBeNull();
    expect(await loadLessonConfig('fonction-affine-2nde')).toBeNull();
    expect(await loadLessonRoutesFactory('fonction-affine-2nde')).toBeNull();
  });

  it('never resolves a lesson whose folder grade is outside ACTIVE_GRADE_IDS', () => {
    // A lesson id of every grade the product does not carry: none resolves, whatever folder held it.
    const knownLessonByGrade = {
      '4am': 'qasim-adad-tabii',
      '1am': 'qisma-iqlidiya-baqi',
      seconde: 'fonction-affine-2nde',
      premiere_specialite: 'second-degre-resoudre-1ere',
    };
    for (const [gradeId, lessonId] of Object.entries(knownLessonByGrade)) {
      const shouldResolve = ACTIVE_GRADE_IDS.includes(gradeId);
      expect(isLessonBuilt(lessonId), `grade '${gradeId}' lesson '${lessonId}'`).toBe(shouldResolve);
    }
    for (const { grade } of getBuiltLessons()) expect(ACTIVE_GRADE_IDS).toContain(grade);
  });
});

// The globs of lessonLoaders.js are build-time boundaries: only the active
// grades' configs and routes become lazy chunks. They must be literals, so
// this guards them against drifting from ACTIVE_GRADE_IDS
// (docs/architecture/BUNDLE_BOUNDARIES.md). The registry itself must never
// glob again — eagerly or not — so its loaders stay out of the entry.
import loadersSource from './lessonLoaders.js?raw';
import registrySource from './registry.js?raw';

describe('registry — build-time glob scope', () => {
  it.each([['lesson.config.js'], ['routes.jsx']])('lessonLoaders.js globs %s for exactly the active grades, never ./**', (file) => {
    const calls = [...loadersSource.matchAll(/import\.meta\.glob\(\s*\[([^\]]*)\]/g)].map((m) => m[1]);
    const call = calls.find((c) => c.includes(file));
    expect(call, `lessonLoaders.js must glob an explicit list of grade patterns for ${file}`).toBeTruthy();
    const escaped = file.replace('.', '\\.');
    const grades = [...call.matchAll(new RegExp(`'\\./college/([^/]+)/\\*\\*/${escaped}'`, 'g'))].map((m) => m[1]);
    expect(grades.sort()).toEqual([...ACTIVE_GRADE_IDS].sort());
  });

  it('lessonLoaders.js globs lazily; registry.js does not glob at all', () => {
    expect(loadersSource).not.toMatch(/eager:\s*true/);
    expect(registrySource).not.toMatch(/import\.meta\.glob\(/);
    expect(registrySource).toMatch(/import\('\.\/lessonLoaders\.js'\)/);
  });
});

/** Les <Route> d'un arbre, à plat. */
function flattenRoutes(element, out = []) {
  if (!isValidElement(element)) return out;
  out.push(element.props);
  Children.forEach(element.props.children, (child) => flattenRoutes(child, out));
  return out;
}

// Modules DÉCLARÉS dans une config mais sans fichier `modules/Module<NN>*.jsx` — donc sans route : leur URL
// retombe sur l'accueil. Trouvé le 2026-10-14 par ce test (docs/reports/BUNDLE_ENTRY_REPORT_2026-10-14.md) :
// la synthèse de l'unité 4 est passée au format à 9 modules (2b1e7342, 2026-10-13) sans ses six « وضعيات
// تدريبية ». Une dette de CONTENU, à générer — pas à masquer : ce test échoue dès qu'elle est réglée (retirer
// l'entrée) et pour toute autre leçon.
// Réglée le 2026-11-12 (la synthèse de l'unité 4 dans le lecteur de mission : Module01…06 recréés) — l'entrée est retirée.
const KNOWN_UNMOUNTED_MODULES = {};

describe('registry — every indexed lesson loads with its own routes', () => {
  const lessons = getBuiltLessons();

  it('indexes the built lessons — none before the first French lesson', () => {
    expect(lessons).toEqual([]);
  });

  it.each(lessons.map((l) => [l.id, l]))('%s : config + routes resolve, and mount its index and every module', async (id, { basePath }) => {
    const config = await loadLessonConfig(id);
    expect(config?.id).toBe(id);
    expect(getLessonBasePath(id)).toBe(basePath);
    const factory = await loadLessonRoutesFactory(id);
    expect(typeof factory).toBe('function');
    const paths = flattenRoutes(factory()).map((p) => p.path).filter(Boolean);
    expect(paths).toContain(basePath);
    const unmounted = config.modules.filter((m) => !paths.includes(getModulePath(id, m.number))).map((m) => m.number);
    expect(unmounted, `${id} : modules déclarés sans route`).toEqual(KNOWN_UNMOUNTED_MODULES[id] ?? []);
    expect(paths.length).toBe(1 + config.modules.length - unmounted.length);
    // Le constructeur de routes la rend lisible synchrone pour les pages de la leçon.
    expect(getLoadedLessonConfig(id)).toBe(config);
    // A v2 lesson (a world in its pack) has no module page: each module address redirects to its home (LESSON_V2.md §2).
    if (lessonPackFlags(id).world) {
      const modules = flattenRoutes(factory()).filter((p) => p.path && p.path !== basePath);
      for (const route of modules) expect(route.element?.props?.to, `${id} ${route.path}`).toBe(basePath);
      // ONE knowledge source: the pack's (the world's « خريطة المعارف »). The home mounts no 🧠 map of its own.
      const home = flattenRoutes(factory()).find((p) => p.path === basePath);
      const frame = home.element?.props?.children;
      expect(frame?.props?.Component, `${id} home frame`).toBeTruthy();
      expect(frame.props.loadKnowledge, `${id}: a v2 home loads no second knowledge map`).toBeFalsy();
    }
  });
});
