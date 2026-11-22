import { describe, it, expect } from 'vitest';
import { setReturnTo, readReturnTo, clearReturnTo, isAwayFrom, RETURN_KEY } from './returnToLesson';

const memory = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };
const LESSON = { path: '/courses/moyen/4am/ansab/qasim-adad-tabii', title: 'التعرّف على قاسم لعدد طبيعي' };

describe('returnToLesson — revenir de la révision d’un prérequis en un clic (propriétaire, 2026-11-07)', () => {
  it('retient la leçon de départ et la relit', () => {
    const s = memory(); setReturnTo(s, LESSON);
    expect(readReturnTo(s)).toEqual(LESSON);
    clearReturnTo(s); expect(readReturnTo(s)).toBeNull();
  });
  it('le bouton se montre hors de la leçon de départ, pas dedans', () => {
    expect(isAwayFrom(LESSON, '/courses/moyen/1am/x/qisma-iqlidiya-baqi/nashat')).toBe(true);
    expect(isAwayFrom(LESSON, LESSON.path)).toBe(false);
    expect(isAwayFrom(LESSON, `${LESSON.path}/astaidd`)).toBe(false);
    // un chemin qui COMMENCE pareil sans être la leçon n'est pas « dedans »
    expect(isAwayFrom(LESSON, `${LESSON.path}-bis`)).toBe(true);
    expect(isAwayFrom(null, '/x')).toBe(false);
  });
  it('un stockage fermé ou une valeur abîmée ne cassent rien', () => {
    const broken = { getItem: () => { throw new Error('closed'); }, setItem: () => { throw new Error('closed'); }, removeItem: () => { throw new Error('closed'); } };
    expect(() => setReturnTo(broken, LESSON)).not.toThrow();
    expect(readReturnTo(broken)).toBeNull();
    const s = memory(); s.setItem(RETURN_KEY, '{oops'); expect(readReturnTo(s)).toBeNull();
    s.setItem(RETURN_KEY, JSON.stringify({ path: 'http://evil.example/x', title: 'x' })); expect(readReturnTo(s)).toBeNull();
  });
});
