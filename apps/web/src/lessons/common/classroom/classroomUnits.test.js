import { describe, it, expect, vi } from 'vitest';
import { moduleUnits, clampUnit, resolveModuleNavigation, lessonNeighbours, isWithinLesson } from './classroomUnits';

/**
 * Ce que ces tests verrouillent : l'ordre des unités présentées est CELUI de
 * la structure existante (brief → intro → étapes → footer ; sommaire →
 * modules dans l'ordre de LESSON_CONFIG), et aucun bouton mort n'est produit.
 */
describe('moduleUnits — les unités d’un module de contenu', () => {
  const steps = [{ num: 1, title: 'أ' }, { num: 2, title: 'ب' }];

  it('suit l’ordre de ContentModule : mission, laboratoire, étapes, khulasa', () => {
    const u = moduleUnits({ brief: true, intro: true, steps, footer: true });
    expect(u.map((x) => x.kind)).toEqual(['brief', 'intro', 'step', 'step', 'footer']);
    expect(u[2]).toMatchObject({ key: 'step-1', num: 1, title: 'أ' });
  });

  it('le module s’ouvre sur sa page d’entrée quand on le demande', () => {
    const u = moduleUnits({ overview: true, brief: true, steps });
    expect(u.map((x) => x.kind)).toEqual(['overview', 'brief', 'step', 'step']);
    expect(moduleUnits({ steps }).some((x) => x.kind === 'overview')).toBe(false);
  });

  it('n’invente pas d’unité absente : sans brief ni intro, les étapes seules', () => {
    expect(moduleUnits({ steps }).map((x) => x.kind)).toEqual(['step', 'step']);
    expect(moduleUnits({ brief: true, steps: [] }).map((x) => x.kind)).toEqual(['brief']);
  });

  it('le footer n’existe que si le module le rend (module terminé)', () => {
    expect(moduleUnits({ steps, footer: false }).some((x) => x.kind === 'footer')).toBe(false);
  });
});

describe('clampUnit', () => {
  it('reste dans les bornes, même quand les unités diminuent', () => {
    expect(clampUnit(4, 3)).toBe(2);
    expect(clampUnit(-1, 3)).toBe(0);
    expect(clampUnit(1.7, 3)).toBe(1);
    expect(clampUnit(2, 0)).toBe(0);
    expect(clampUnit(NaN, 3)).toBe(0);
  });
});

describe('resolveModuleNavigation — jamais de bouton mort', () => {
  it('au milieu : les deux gestes vont aux unités voisines', () => {
    const goTo = vi.fn();
    const nav = resolveModuleNavigation({ index: 1, count: 3, goTo });
    nav.onPrevious(); nav.onNext();
    expect(goTo).toHaveBeenNthCalledWith(1, 0);
    expect(goTo).toHaveBeenNthCalledWith(2, 2);
  });

  it('en portée MODULE, aux extrémités, le geste disparaît', () => {
    const goTo = vi.fn();
    expect(resolveModuleNavigation({ index: 0, count: 3, goTo }).onPrevious).toBeUndefined();
    expect(resolveModuleNavigation({ index: 2, count: 3, goTo }).onNext).toBeUndefined();
  });

  it('en portée LEÇON, aux extrémités, on passe au module voisin', () => {
    const prev = vi.fn(); const next = vi.fn(); const goTo = vi.fn();
    const first = resolveModuleNavigation({ index: 0, count: 2, goTo, lessonPrevious: prev, lessonNext: next });
    first.onPrevious();
    expect(prev).toHaveBeenCalled();
    expect(goTo).not.toHaveBeenCalled();
    const last = resolveModuleNavigation({ index: 1, count: 2, goTo, lessonPrevious: prev, lessonNext: next });
    last.onNext();
    expect(next).toHaveBeenCalled();
  });

  it('un module d’une seule unité en portée module n’a aucun bouton', () => {
    const nav = resolveModuleNavigation({ index: 0, count: 1, goTo: vi.fn() });
    expect(nav.onPrevious).toBeUndefined();
    expect(nav.onNext).toBeUndefined();
  });
});

describe('lessonNeighbours — l’ordre de LESSON_CONFIG.modules', () => {
  const base = '/courses/moyen/4am/x/qasim';
  const config = { modules: [
    { path: `${base}/astaidd`, number: 0, title: 'أستعدّ' },
    { path: `${base}/al-maktaba`, number: 1, title: 'المكتبة' },
    { path: `${base}/itqan`, number: 2, title: 'إتقان' },
  ] };

  it('depuis le sommaire : pas de précédent, le premier module ensuite', () => {
    expect(lessonNeighbours(config, base, base)).toMatchObject({ previous: null, next: `${base}/astaidd`, position: 0, total: 4 });
    expect(lessonNeighbours(config, base, `${base}/`).next).toBe(`${base}/astaidd`);
  });

  it('depuis le premier module : le sommaire avant, le deuxième après', () => {
    expect(lessonNeighbours(config, base, `${base}/astaidd`)).toMatchObject({ previous: base, next: `${base}/al-maktaba`, position: 1 });
  });

  it('depuis le dernier module : plus de suivant', () => {
    expect(lessonNeighbours(config, base, `${base}/itqan`)).toMatchObject({ previous: `${base}/al-maktaba`, next: null, position: 3 });
  });

  it('hors de la leçon : rien', () => {
    expect(lessonNeighbours(config, base, '/courses')).toMatchObject({ previous: null, next: null, position: -1 });
  });

  it('nomme les MODULES visés, pour que le saut dise où il va', () => {
    // Depuis le module 1 (index 0) : en arrière le sommaire (pas un module),
    // en avant le module suivant, avec son entrée complète.
    const fromFirst = lessonNeighbours(config, base, `${base}/astaidd`);
    expect(fromFirst.previousModule).toBeNull();
    expect(fromFirst.nextModule).toMatchObject({ number: 1, title: 'المكتبة' });

    const fromMiddle = lessonNeighbours(config, base, `${base}/al-maktaba`);
    expect(fromMiddle.previousModule).toMatchObject({ number: 0 });
    expect(fromMiddle.nextModule).toMatchObject({ number: 2 });

    // Depuis le sommaire : rien derrière, le premier module devant.
    expect(lessonNeighbours(config, base, base).nextModule).toMatchObject({ number: 0 });
    // Au dernier module : aucune cible devant.
    expect(lessonNeighbours(config, base, `${base}/itqan`).nextModule).toBeNull();
  });

  it('isWithinLesson reconnaît le sommaire et les modules, pas une leçon voisine', () => {
    expect(isWithinLesson(base, base)).toBe(true);
    expect(isWithinLesson(base, `${base}/itqan`)).toBe(true);
    expect(isWithinLesson(base, `${base}-2/itqan`)).toBe(false);
    expect(isWithinLesson(base, '/courses')).toBe(false);
  });
});
