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
    ['Ma progression', 'src/pages/student/Progression.jsx'],
    ['Espace',         'src/pages/student/StudentHome.jsx'],
    ['Profil',         'src/pages/student/Profil.jsx'],
  ];

  it.each(PAGES)('%s utilise le cadre partagé (.sa-page)', (_name, file) => {
    expect(read(file)).toMatch(/className=[{"`][^"`}]*\bsa-page\b/);
  });

  it('la gouttière du cadre est définie une seule fois, et responsive', () => {
    const css = read('src/index.css');
    // 20 / 40 / 60 : imposer 60px à 360px mangerait un tiers de l'écran.
    expect(css).toMatch(/\.sa-page\s*\{[^}]*padding-left:\s*20px/);
    expect(css).toMatch(/min-width:\s*640px\)\s*\{\s*\.sa-page\s*\{[^}]*padding-left:\s*40px/);
    expect(css).toMatch(/min-width:\s*1024px\)\s*\{\s*\.sa-page\s*\{[^}]*padding-left:\s*60px/);
    // Une largeur maximale ici re-briserait l'égalité entre les pages.
    expect(css).not.toMatch(/\.sa-page\s*\{[^}]*max-width/);
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

describe('fond uni du système d’exercices', () => {
  const EXERCISE_PAGES = [
    ['Exercise Space', 'src/pages/student/practice/PracticeHub.jsx'],
    ['Exercise',       'src/pages/student/practice/PracticeSession.jsx'],
    ['Bilan',          'src/pages/student/practice/PracticeSummary.jsx'],
  ];

  // `StudentLayout` monte `<BackgroundLayer />` — grille de points et trois
  // halos animés — derrière toutes les pages de l'espace. Sous un énoncé, un
  // graphique ou une saisie mathématique, un décor qui pulse en boucle
  // concurrence ce qu'on demande à l'élève de regarder.
  it.each(EXERCISE_PAGES)('%s pose un aplat opaque', (_name, file) => {
    const src = read(file);
    expect(src).toMatch(/\bsa-surface-plain\b/);
    // TOUS les états, pas seulement le nominal : chargement et erreur sont des
    // écrans à part entière, et l'un d'eux oublié laisserait le décor
    // réapparaître le temps d'une requête.
    const frames = src.match(/className="[^"]*\bsa-page\b[^"]*"/g) || [];
    expect(frames.length).toBeGreaterThan(0);
    for (const f of frames) expect(f).toMatch(/sa-surface-plain/);
  });

  it('l’aplat reprend la couleur du sommaire de leçon, et couvre la fenêtre', () => {
    // Les commentaires CITENT `min-height: 100%` pour expliquer pourquoi il ne
    // convient pas ; on lit donc les DÉCLARATIONS seules.
    const css = read('src/index.css').replace(/\/\*[\s\S]*?\*\//g, '');
    // slate-50 : exactement le `bg-slate-50` de LessonIndex/ModuleLayout.
    expect(css).toMatch(/\.sa-surface-plain\s*\{[^}]*background-color:\s*#f8fafc/i);
    // `min-height: 100%` ne suffit pas — le <main> parent n'a pas de hauteur
    // définie, et l'aplat s'arrêterait où finit le contenu.
    expect(css).toMatch(/\.sa-surface-plain\s*\{[^}]*min-height:\s*calc\(100dvh/);
    expect(css).not.toMatch(/\.sa-surface-plain\s*\{[^}]*min-height:\s*100%/);
  });
});
