import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { getModulePath, getLessonConfig } from '../../../registry';

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
 */
describe('getModulePath — le pont entre numéro et route', () => {
  it('rend le chemin par SLUG du module, jamais son numéro', () => {
    const path = getModulePath('fonction-affine-2nde', 2);
    expect(path).toBe('/courses/lycee/seconde/fonctions/fonction-affine-2nde/le-taux-d-accroissement');
    expect(path).not.toMatch(/\/2$/);
  });

  it('accepte un numéro donné sous forme de chaîne', () => {
    expect(getModulePath('fonction-affine-2nde', '2')).toBe(getModulePath('fonction-affine-2nde', 2));
  });

  it('rend null — et non une URL fabriquée — pour un module ou une leçon inconnus', () => {
    expect(getModulePath('fonction-affine-2nde', 999)).toBeNull();
    expect(getModulePath('lecon-qui-nexiste-pas', 1)).toBeNull();
    expect(getModulePath('fonction-affine-2nde', undefined)).toBeNull();
    expect(getModulePath(undefined, 1)).toBeNull();
  });

  it('rend, pour CHAQUE module de la leçon, exactement le chemin que la route déclare', () => {
    const config = getLessonConfig('fonction-affine-2nde');
    for (const m of config.modules) {
      expect(getModulePath('fonction-affine-2nde', m.number)).toBe(m.path);
    }
  });
});

describe('les appelants n’assemblent plus l’URL à la main', () => {
  const CALLERS = [
    'pages/Courses.jsx',
    'pages/student/StudentHome.jsx',
    'components/student/StudentHomeBanner.jsx',
  ];

  it.each(CALLERS)('%s utilise resumePath', (file) => {
    const src = readFileSync(resolve(srcRoot, file), 'utf8');
    expect(src).toMatch(/continueCourse\.resumePath/);
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
  });
});
