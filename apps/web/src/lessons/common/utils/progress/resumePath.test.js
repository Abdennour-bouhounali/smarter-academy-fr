import { describe, it, expect, vi } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { getModulePath, getTotalModules, getFirstModuleNumber, getAnyRegisteredLessonId, lessonsWithPack, lessonPackFlags, getBuiltLessons } from '../../../registry';
import { getResumeModulePath } from './getResumeLesson';

// Les configs COMPLÈTES, lues ici directement (un test peut les lire toutes) : le registre, lui,
// répond depuis l'index généré — ce test vérifie que les deux disent la même chose.
const CONFIGS = Object.values(import.meta.glob('../../../*/*/**/lesson.config.js', { eager: true, import: 'LESSON_CONFIG' }));

// The generated index is EMPTY until the first French lesson: a neutral index of two lessons of three modules each —
// one v2 (a world in its pack), one still on its module pages.
vi.mock('../../../lessonIndex.generated.json', () => {
  const modules = [[1, 'premier'], [2, 'deuxieme'], [3, 'troisieme']];
  const line = (id, pack) => ({ id, level: 'college', grade: '3e', chapter: 'nombres_calculs', modules, ...(pack ? { pack } : {}) });
  return { default: { lessons: [line('lecon-pages'), line('lecon-monde', { world: 'divisor-isles' })] } };
});
const BASE = '/courses/college/3e/nombres_calculs';

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(here, '../../../..');

/**
 * « Continuer » menait l'élève à la page d'accueil marketing.
 *
 * Le modèle de progression raisonne en NUMÉROS de module (1, 2, 3…) ; les
 * routes, elles, sont déclarées avec le CHEMIN du module, construit sur son
 * slug. Les trois appelants assemblaient `${lesson.path}/${numéro}` — une URL
 * qui ne correspond à aucune route. React Router la fait alors retomber sur
 * `*`, c'est-à-dire la page d'accueil, SANS erreur : ni la console, ni les
 * tests, ni le build ne pouvaient le signaler. Seul un clic le révélait.
 *
 * Ces tests verrouillent les deux moitiés du correctif : le pont numéro →
 * chemin, et l'absence de tout retour à l'assemblage manuel.
 *
 * Le test tire sa leçon-fixture du registre ACTIF plutôt que de coder en dur
 * 'fonction-affine-2nde' (une leçon de seconde, désormais dormante pour
 * l'Algérie — voir activeGrades.js) : le pont numéro → chemin doit être
 * vérifié sur une leçon réellement enregistrée, quelle que soit la classe
 * active du moment. `describe.skipIf` couvre le cas transitoire où aucune
 * classe n'est encore active (avant la Phase 7 du roadmap Algérie).
 */
const fixtureLessonId = getAnyRegisteredLessonId();

describe.skipIf(!fixtureLessonId)('getModulePath — le pont entre numéro et route', () => {
  const secondModule = { number: 2, path: `${BASE}/${fixtureLessonId}/deuxieme` };

  it('rend le chemin par SLUG du module, jamais son numéro', () => {
    const path = getModulePath(fixtureLessonId, secondModule.number);
    expect(path).toBe(secondModule.path);
    expect(path).not.toMatch(new RegExp(`/${secondModule.number}$`));
  });

  it('accepte un numéro donné sous forme de chaîne', () => {
    expect(getModulePath(fixtureLessonId, String(secondModule.number))).toBe(getModulePath(fixtureLessonId, secondModule.number));
  });

  it('rend null — et non une URL fabriquée — pour un module ou une leçon inconnus', () => {
    expect(getModulePath(fixtureLessonId, 999999)).toBeNull();
    expect(getModulePath('lecon-qui-nexiste-pas', 1)).toBeNull();
    expect(getModulePath(fixtureLessonId, undefined)).toBeNull();
    expect(getModulePath(undefined, 1)).toBeNull();
  });

  it('rend, pour CHAQUE module de CHAQUE leçon, exactement le chemin que la route déclare', () => {
    // every config of the tree (none before the first French lesson) agrees with the index
    for (const c of CONFIGS) {
      for (const m of c.modules) expect(getModulePath(c.id, m.number), `${c.id} › ${m.number}`).toBe(m.path);
      expect(getTotalModules(c.id), c.id).toBe(c.modules.length);
      expect(getFirstModuleNumber(c.id), c.id).toBe(Math.min(...c.modules.map((m) => Number(m.number))));
    }
  });
});

describe('a v2 lesson (a world in its pack) is resumed on its home, never on a module address', () => {
  const worlds = lessonsWithPack('world');
  const paged = getBuiltLessons().map((l) => l.id).find((id) => !lessonPackFlags(id).world && getTotalModules(id) > 1);

  it('there are v2 lessons to check', () => {
    expect(worlds).toEqual(['lecon-monde']);
    expect(paged).toBe('lecon-pages');
  });

  it.each(worlds)('%s: no module address (they only redirect to the world)', (id) => {
    const first = getFirstModuleNumber(id);
    for (const n of [first, first + 1, first + 2]) {
      expect(getModulePath(id, n), `${id} › ${n} still has an address`).toBeTruthy();
      expect(getResumeModulePath(id, n), `${id} › ${n}`).toBeNull();
    }
  });

  it('a lesson still on its module pages keeps its module address', () => {
    const n = getFirstModuleNumber(paged);
    expect(getResumeModulePath(paged, n)).toBe(getModulePath(paged, n));
  });

  it('the resume link and the progression tree read the world-aware path', () => {
    expect(readFileSync(resolve(srcRoot, 'lessons/common/utils/progress/getResumeLesson.js'), 'utf8')).toMatch(/resumePath: getResumeModulePath\(/);
    for (const page of ['pages/student/StudentHome.jsx', 'pages/student/Progression.jsx']) {
      expect(readFileSync(resolve(srcRoot, page), 'utf8'), page).toMatch(/getModulePath: getResumeModulePath/);
    }
  });
});

describe('les appelants n’assemblent plus l’URL à la main', () => {
  // L'accueil de l'espace (mené par « Ma boussole » depuis le 2026-11-09) passe la forme de getResumeLesson
  // telle quelle à CompassHomeSections (`resume`) : c'est là que « Continue » lit son chemin.
  const CALLERS = [
    ['pages/Courses.jsx', /continueCourse\.resumePath/],
    ['features/home/compass/CompassHomeSections.jsx', /resume\.resumePath/],
    ['components/student/StudentHomeBanner.jsx', /continueCourse\.resumePath/],
  ];

  it.each(CALLERS)('%s utilise resumePath', (file, pattern) => {
    const src = readFileSync(resolve(srcRoot, file), 'utf8');
    expect(src).toMatch(pattern);
  });

  it('aucun fichier ne recolle un chemin de leçon à un numéro de module', () => {
    const offenders = [];
    const walk = (dir) => {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) { walk(full); continue; }
        if (!/\.jsx?$/.test(name) || /\.test\./.test(name)) continue;
        const src = readFileSync(full, 'utf8');
        // La signature du défaut : `${...path}/${...resumeModule}`.
        if (/\$\{[^}]*\.path\}\/\$\{[^}]*resumeModule\}/.test(src)) {
          offenders.push(full.slice(srcRoot.length + 1));
        }
      }
    };
    walk(srcRoot);
    expect(offenders).toEqual([]);
    // reads every source file: under 1 s alone, over the default 5 s among the whole suite (2026-11-19)
  }, 60_000);
});
