import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '../../..');
const read = (p) => readFileSync(resolve(webRoot, p), 'utf8');

/**
 * Le contrat de cadre et de typographie de l'espace élève.
 *
 * Ces deux réglages avaient DÉJÀ été faits une fois, puis ont disparu sans
 * laisser de trace dans l'historique : aucun commit du dépôt n'a jamais
 * contenu l'échelle `fontSize`. Un arbre de travail perdu suffit à annuler un
 * changement qui ne vit que dans deux fichiers de configuration, et rien
 * n'aurait signalé la régression — ni les tests, ni les gardes, ni le build.
 *
 * Ce fichier est ce signal. Il ne juge pas du goût (les valeurs exactes
 * peuvent évoluer) ; il vérifie que les deux décisions structurelles sont
 * toujours là, et que les cinq pages élève partagent bien UN cadre.
 */
describe('cadre de page partagé', () => {
  const PAGES = [
    ['Courses',        'src/pages/Courses.jsx'],
    ['Lesson Index',   'src/lessons/common/components/LessonIndex.jsx'],
    ['Lesson Module',  'src/lessons/common/components/ModuleLayout.jsx'],
    ['Exercise',       'src/pages/student/practice/PracticeSession.jsx'],
    ['Exercise Space', 'src/pages/student/practice/PracticeHub.jsx'],
  ];

  it.each(PAGES)('%s utilise le cadre pleine largeur (w-full px-5)', (_name, file) => {
    expect(read(file)).toMatch(/className=[{"`][^"`}]*\bw-full px-5\b/);
  });

  it.each(PAGES)("%s ne borne plus son cadre principal par un max-w-*xl", (_name, file) => {
    const src = read(file);
    // `max-w-2xl`/`max-w-md` sur une CARTE ou un paragraphe reste légitime :
    // seule la combinaison « borne + centrage », signature d'un cadre de page,
    // est proscrite.
    const frameLike = src.match(/max-w-(?:3xl|4xl|5xl|6xl|7xl) mx-auto px-/g) || [];
    expect(frameLike).toEqual([]);
  });
});

describe('échelle typographique (+25% sur le corps du texte)', () => {
  const config = read('tailwind.config.js');

  it('définit une échelle fontSize explicite', () => {
    expect(config).toMatch(/fontSize:\s*\{/);
  });

  // Les tailles qui portent la quasi-totalité du texte de l'interface.
  const EXPECTED = { xs: 15, sm: 17, base: 20, lg: 22, xl: 24 };

  it.each(Object.entries(EXPECTED))('text-%s vaut %ipx', (token, px) => {
    const key = /^\d/.test(token) ? `'${token}'` : token;
    const line = config.match(new RegExp(`${key}:\\s*\\['([\\d.]+)rem'`));
    expect(line, `token ${token} absent de l'échelle`).not.toBeNull();
    expect(parseFloat(line[1]) * 16).toBe(px);
  });

  it('laisse les tailles d’affichage (5xl et au-delà) inchangées', () => {
    // La hiérarchie se préserve en amortissant : tout multiplier par 1.25
    // ferait des titres de héros des pavés.
    expect(config).toMatch(/'5xl':\s*\['3rem'/);
  });

  it('relève au sol les tailles écrites en pixels, à l’écran seulement', () => {
    const css = read('src/index.css');
    expect(css).toMatch(/@media screen\s*\{[\s\S]*text-\\\[10px\\\]/);
    // L'impression dimensionne en pt : la relever casserait la pagination
    // de « Ma carte ».
    expect(css).not.toMatch(/@media print[\s\S]{0,200}text-\\\[10px\\\]/);
  });
});
