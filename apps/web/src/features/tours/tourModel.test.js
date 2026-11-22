import { describe, it, expect } from 'vitest';
import { findPageTour, findDeclaredTour, isTourClosed, shouldAutoStart, playableSteps, nextPlayableIndex, placeCard } from './tourModel';
import { PAGE_TOURS } from './tourRegistry';

const tours = [
  { key: 'student.home', role: 'student', path: '/espace', steps: [] },
  { key: 'teacher.class', role: 'teacher', path: '/enseignant/classes/:id', steps: [] },
];

describe('findPageTour', () => {
  it('matches the whole path for the right role only', () => {
    expect(findPageTour(tours, 'student', '/espace')?.key).toBe('student.home');
    expect(findPageTour(tours, 'student', '/espace/cours')).toBeNull();
    expect(findPageTour(tours, 'teacher', '/espace')).toBeNull();
    expect(findPageTour(tours, 'teacher', '/enseignant/classes/12')?.key).toBe('teacher.class');
    expect(findPageTour(tours, 'teacher', '/enseignant/classes/12/eleves/3')).toBeNull();
    expect(findPageTour(tours, 'admin', '/espace')).toBeNull();
  });
});

describe('findDeclaredTour', () => {
  const declared = [
    { key: 'student.lesson', role: 'student', page: 'lesson-module', steps: [] },
    { key: 'teacher.lesson', role: 'teacher', page: 'lesson-module', steps: [] },
  ];
  it('resolves the page a component declared, for the caller role only', () => {
    expect(findDeclaredTour(declared, 'student', 'lesson-module')?.key).toBe('student.lesson');
    expect(findDeclaredTour(declared, 'teacher', 'lesson-module')?.key).toBe('teacher.lesson');
    expect(findDeclaredTour(declared, 'admin', 'lesson-module')).toBeNull();
    expect(findDeclaredTour(declared, 'student', null)).toBeNull();
  });
  it('is never matched by a URL', () => {
    expect(findPageTour(declared, 'student', '/courses/moyen/4am/x/units/y')).toBeNull();
  });
});

describe('auto start', () => {
  const tour = tours[0];
  it('waits for the server answer, then opens only an unclosed tour', () => {
    expect(shouldAutoStart({ tour, closed: null, eligible: true })).toBe(false);
    expect(shouldAutoStart({ tour, closed: {}, eligible: true })).toBe(true);
    expect(shouldAutoStart({ tour, closed: { 'student.home': { status: 'skipped' } }, eligible: true })).toBe(false);
    expect(shouldAutoStart({ tour, closed: {}, eligible: false })).toBe(false);
    expect(shouldAutoStart({ tour: null, closed: {}, eligible: true })).toBe(false);
    // Déclarée pour le bouton seulement (module de leçon autre que le premier).
    expect(shouldAutoStart({ tour, closed: {}, eligible: true, autoStart: false })).toBe(false);
  });
  it('treats skipped and completed alike', () => {
    expect(isTourClosed({ a: { status: 'completed' } }, 'a')).toBe(true);
    expect(isTourClosed({ a: { status: 'skipped' } }, 'a')).toBe(true);
    expect(isTourClosed({}, 'a')).toBe(false);
  });
});

describe('playable steps', () => {
  const steps = [{ id: 'intro' }, { id: 'a', target: 'x.a' }, { id: 'b', target: 'x.b' }, { id: 'c', target: 'x.c' }];
  it('drops steps whose target is not on screen, keeps untargeted ones', () => {
    const present = new Set(['x.a', 'x.c']);
    expect(playableSteps(steps, (t) => present.has(t)).map((s) => s.id)).toEqual(['intro', 'a', 'c']);
  });
  it('plays nothing when no targeted step is left', () => {
    expect(playableSteps(steps, () => false)).toEqual([]);
  });
  it('finds the next playable step in both directions', () => {
    const present = new Set(['x.a', 'x.c']);
    const has = (t) => present.has(t);
    expect(nextPlayableIndex(steps, 1, 1, has)).toBe(3);
    expect(nextPlayableIndex(steps, 3, -1, has)).toBe(1);
    expect(nextPlayableIndex(steps, 3, 1, has)).toBe(-1);
  });
});

describe('placeCard', () => {
  const viewport = { width: 400, height: 800 };
  const card = { width: 300, height: 200 };
  it('goes below the target when there is room, kept inside the screen', () => {
    const p = placeCard({ target: { top: 50, bottom: 100, left: 350, width: 40, height: 50 }, card, viewport });
    expect(p.side).toBe('bottom');
    expect(p.top).toBe(114);
    expect(p.left).toBe(400 - 300 - 12);
  });
  it('goes above when below is full, overlays when neither fits', () => {
    expect(placeCard({ target: { top: 650, bottom: 700, left: 0, width: 100, height: 50 }, card, viewport }).side).toBe('top');
    expect(placeCard({ target: { top: 10, bottom: 790, left: 0, width: 400, height: 780 }, card, viewport }).side).toBe('overlay');
  });
  it('centres an untargeted card', () => {
    expect(placeCard({ target: null, card, viewport })).toEqual({ side: 'center', top: 300, left: 50 });
  });
});

describe('PAGE_TOURS registry', () => {
  it('has unique keys prefixed by their role, matching the server pattern', () => {
    const keys = PAGE_TOURS.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const tour of PAGE_TOURS) {
      expect(['student', 'teacher']).toContain(tour.role);
      expect(tour.key).toMatch(/^(student|teacher)\.[a-z][a-z0-9-]{0,47}$/);
      expect(tour.key.startsWith(`${tour.role}.`)).toBe(true);
    }
  });
  it('gives every tour at least one targeted step, with unique step ids', () => {
    for (const tour of PAGE_TOURS) {
      expect(tour.steps.some((s) => s.target)).toBe(true);
      const ids = tour.steps.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it('never gives two tours of the same role the same page', () => {
    const seen = new Set();
    for (const tour of PAGE_TOURS) {
      // Exactement un des deux : un chemin, ou une page déclarée.
      expect(Boolean(tour.path) !== Boolean(tour.page), tour.key).toBe(true);
      const k = `${tour.role} ${tour.path ?? `page:${tour.page}`}`;
      expect(seen.has(k)).toBe(false);
      seen.add(k);
    }
  });
});
