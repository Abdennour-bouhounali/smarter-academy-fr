import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  getLessonChromeLayout,
  VISITOR_HEADER_H,
  STUDENT_MOBILE_HEADER_H,
} from './lessonChrome';

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(here, '../../..');

describe('contrat de mise en page du bandeau de leçon', () => {
  it('réserve la Navbar visiteur (64 px) à toutes les tailles', () => {
    const v = getLessonChromeLayout({ authenticated: false });
    expect(v.headerHeight).toBe(VISITOR_HEADER_H);
    expect(v.headerHeightLg).toBe(VISITOR_HEADER_H);
    expect(v.stickyTopClass).toBe('top-16');
    expect(v.contentOffsetClass).toBe('pt-16');
  });

  it('ne réserve AUCUN espace en haut chez l’élève connecté', () => {
    // Le bug d'origine : `sticky top-16` + `pt-16` laissaient un vide de
    // 64 px au-dessus du bandeau alors qu'aucun en-tête n'est rendu.
    const a = getLessonChromeLayout({ authenticated: true });
    expect(a.contentOffsetClass).toBe('pt-0');
    expect(a.stickyTopClass).not.toContain('top-16');
  });

  it('colle le bandeau sous l’en-tête mobile élève, et au ras du haut sur grand écran', () => {
    // StudentLayout : `fixed top-0 h-14` en < lg, barre latérale seule en ≥ lg.
    const a = getLessonChromeLayout({ authenticated: true });
    expect(a.headerHeight).toBe(STUDENT_MOBILE_HEADER_H);
    expect(a.headerHeightLg).toBe(0);
    expect(a.stickyTopClass).toBe('top-14 md:top-0');
  });

  it('n’utilise jamais de décalage négatif ni de translation compensatoire', () => {
    for (const authenticated of [true, false]) {
      const c = getLessonChromeLayout({ authenticated });
      for (const cls of [c.stickyTopClass, c.contentOffsetClass]) {
        expect(cls).not.toMatch(/-top-|-mt-|translate/);
      }
    }
  });

  it('produit des classes Tailwind littéralement présentes dans la source', () => {
    // Les classes sont composées à partir de variables : si une valeur
    // n'existe pas en toutes lettres dans le fichier, le scan JIT de
    // Tailwind ne la génère pas et le décalage devient silencieusement nul.
    const source = readFileSync(resolve(here, 'lessonChrome.js'), 'utf8');
    for (const authenticated of [true, false]) {
      const c = getLessonChromeLayout({ authenticated });
      const classes = `${c.stickyTopClass} ${c.contentOffsetClass}`.split(' ');
      for (const cls of classes) {
        expect(source).toContain(`'${cls}'`);
      }
    }
  });
});

describe('source unique de vérité', () => {
  const read = (rel) => readFileSync(resolve(srcRoot, rel), 'utf8');

  it.each([
    'lessons/common/components/LessonIndex.jsx',
    'pages/UnitPage.jsx',
  ])('%s dérive aussi son décalage haut du contrat', (rel) => {
    // Le sommaire de leçon et la page d'unité vivent sous la même coquille
    // que les modules : un `pt-16` fixe y laissait 64 px de vide chez l'élève
    // connecté, dont le bureau n'a pas d'en-tête.
    const src = read(rel);
    expect(src).toContain('chrome.contentOffsetClass');
    expect(src).not.toMatch(/min-h-screen[^"`]*pt-16/);
  });
});
