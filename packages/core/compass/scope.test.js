import { describe, expect, it } from 'vitest';
import { buildScope, prereqsOf, itemInfo } from './scope.js';
import { SCHOOL_YEARS, defaultPointer } from '../curriculum/dz/calendar/schoolCalendar.js';
import { getItem } from '../curriculum/dz/net/learningNet.js';

const { calendar, progressions } = SCHOOL_YEARS['2026/2027'];
const p4 = progressions['4am'];

describe('prereqsOf', () => {
  it('donne les prérequis directs du réseau, sans doublon ni l’item lui-même', () => {
    const p = prereqsOf('4am.m1.r06');
    expect(p).toContain('3am.m4.r03');
    expect(new Set(p).size).toBe(p.length);
    expect(p).not.toContain('4am.m1.r06');
  });
});

describe('buildScope (4AM, 15 novembre 2026)', () => {
  const pointer = defaultPointer(calendar, p4, '2026-11-15');
  const s = buildScope({ progression: p4, pointer });

  it('ne cible que des items qui existent', () => {
    expect(s.targets.length).toBeGreaterThan(0);
    for (const id of s.targets) expect(getItem(id)).not.toBeNull();
  });
  it('règle A : au plus 10 items vus, tous issus de leçons vues', () => {
    expect(s.ruleA.length).toBeLessThanOrEqual(10);
    for (const id of s.ruleA) expect(s.taughtItems).toContain(id);
  });
  it('règle B : jamais un item des leçons à venir lui-même, 4 au plus', () => {
    expect(s.ruleB.length).toBeLessThanOrEqual(4);
    for (const id of s.ruleB) expect(s.upcomingItems).not.toContain(id);
  });
  it('rien de ce qui n’est pas encore vu n’est ciblé en règle A', () => {
    for (const id of s.ruleA) expect(s.upcomingItems).not.toContain(id);
  });
  it('avant la rentrée : aucune règle A', () => {
    const s0 = buildScope({ progression: p4, pointer: null });
    expect(s0.ruleA).toEqual([]);
  });
});

describe('itemInfo', () => {
  it('donne le texte et la leçon où réviser', () => {
    const info = itemInfo('4am.m1.r06');
    expect(info.textAr.length).toBeGreaterThan(0);
    expect(info.homeLesson.code).toBe('jidhr-tarbii');
  });
  it('null pour un item inconnu', () => {
    expect(itemInfo('nope')).toBeNull();
  });
});
