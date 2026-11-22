import { describe, it, expect } from 'vitest';
import { getUnitById } from '@smarter-academy/core';
import { UNIT_MISSIONS, unitState, unmetPrerequisites } from './unitMissions';

/**
 * Le contenu de la page d'unité (regard élève, 2026-11-09) est écrit par la plateforme : il doit couvrir CHAQUE leçon de l'unité, ses
 * clés doivent pointer vers de vraies leçons, ses nombres être dans son texte — et aucune ligne ne renvoie au manuel (indépendance).
 */
const BOOK = /الكتاب|كتاب|ص\s*\d|صفحة/;

describe.each(Object.entries(UNIT_MISSIONS))('unit mission content « %s »', (unitId, m) => {
  const unit = getUnitById(unitId);
  const ids = [...unit.lessons, ...(unit.synthesis ? [unit.synthesis] : [])].map((l) => l.id);
  it('exists in the catalogue, and every lesson (and the synthesis) has a station icon and a short label', () => {
    expect(unit).toBeTruthy();
    ids.forEach((id) => { expect(m.icons[id], id).toBeTruthy(); expect(m.short[id], id).toBeTruthy(); });
    Object.keys({ ...m.icons, ...m.short }).forEach((id) => expect(ids).toContain(id));
  });
  it('its keys and the challenge point to real lessons of the unit', () => {
    m.keys.forEach((k) => expect(ids).toContain(k.after));
    expect(ids).toContain(m.challenge.solvedAfter);
  });
  it('the highlighted numbers are in both texts of the challenge', () => {
    m.challenge.numbers.forEach((n) => { expect(m.challenge.lead).toContain(String(n)); expect(m.challenge.full).toContain(String(n)); });
  });
  it('no student-visible line sends the student to the textbook', () => {
    const text = JSON.stringify({ c: m.challenge, h: m.history, k: m.keys, s: m.short });
    expect(BOOK.test(text)).toBe(false);
  });
  it('the stations follow the catalogue order (lessons, then the synthesis) — the path and the e2e read this order', () => {
    expect(Object.keys(m.icons)).toEqual(ids);
  });
  it('five keys, in the order of the lessons (a unit of three or four lessons hands two keys in one lesson)', () => {
    expect(m.keys).toHaveLength(5);
    const at = m.keys.map((k) => ids.indexOf(k.after));
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });
});

describe('unit mission content — the table', () => {
  it('is empty until the French units exist', () => {
    expect(UNIT_MISSIONS).toEqual({});
  });
});

describe('unit state for a student', () => {
  const m = { keys: [{ after: 'a' }, { after: 'c' }] };
  it('the current lesson is the first open one not finished; keys follow finished lessons', () => {
    const s = unitState([{ id: 'a', done: true, available: true }, { id: 'b', done: false, available: true }, { id: 'c', done: false, available: true }], m);
    expect(s).toEqual({ done: 1, current: 'b', keysEarned: 1, finished: false });
  });
  it('a closed lesson is skipped; everything done means the unit is finished', () => {
    expect(unitState([{ id: 'a', done: true, available: true }, { id: 'b', done: false, available: false }, { id: 'c', done: false, available: true }], m).current).toBe('c');
    expect(unitState([{ id: 'a', done: true, available: true }, { id: 'c', done: true, available: true }], m)).toEqual({ done: 2, current: null, keysEarned: 2, finished: true });
  });
  it('only the unmet prerequisites inside the unit show up front', () => {
    const lesson = { prerequisiteLessonCodes: ['a', 'b', 'outside'] };
    expect(unmetPrerequisites(lesson, new Set(['a']), new Set(['a', 'b']))).toEqual(['b']);
  });
});
