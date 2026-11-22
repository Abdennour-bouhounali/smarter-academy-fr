import { describe, expect, it } from 'vitest';
import { buildScope, prereqsOf, itemInfo } from './scope.js';
import { SCHOOL_YEARS } from '../curriculum/fr/calendar/schoolCalendar.js';
import { createLearningNet } from '../curriculum/fr/net/learningNet.js';

// The delivered net and year are EMPTY (FRANCE_REBUILD_PLAN.md §4bis): the rules A and B are checked on a neutral net.
const item = (id, segment) => ({ id, segment, grade: id.split('.')[0], number: Number(id.slice(-2)), text: `Compétence ${id}` });
const net = createLearningNet({
  programme: {
    grades: [{ id: '6e' }, { id: '5e' }],
    segments: [{ id: '6e.m1', grade: '6e', number: 1 }, { id: '5e.m1', grade: '5e', number: 1 }],
    items: [
      item('6e.m1.r01', '6e.m1'), item('6e.m1.r02', '6e.m1'), item('6e.m1.r03', '6e.m1'),
      item('5e.m1.r01', '5e.m1'), item('5e.m1.r02', '5e.m1'),
    ],
  },
  net: {
    threads: [],
    links: [
      { from: '6e.m1.r02', to: '5e.m1.r01', type: 'extends', addedValue: 'plus loin' },
      { from: '6e.m1.r01', to: '5e.m1.r01', type: 'requires' },
      { from: '6e.m1.r03', to: '5e.m1.r02', type: 'consolidates', note: 'rappel' },
      { from: '5e.m1.r01', to: '5e.m1.r02', type: 'requires' },
    ],
  },
  lessonFiles: [
    { grade: '6e', lessons: [{ code: 'a6', order: 0, kind: 'lesson', title: 'Leçon a6', programmeItems: ['6e.m1.r01', '6e.m1.r02', '6e.m1.r03'] }] },
    {
      grade: '5e',
      lessons: [
        { code: 'l1', order: 0, kind: 'lesson', title: 'Leçon l1', programmeItems: ['5e.m1.r01'], status: 'available' },
        { code: 'l2', order: 1, kind: 'lesson', title: 'Leçon l2', programmeItems: ['5e.m1.r02'] },
        { code: 'syn', order: 2, kind: 'synthesis', title: 'Synthèse', programmeItems: ['5e.m1.r02'] },
      ],
    },
  ],
  unitFiles: [],
});
const progression = { weeks: [{ week: 'w01', lessons: ['l1'] }, { week: 'w02', lessons: ['l2'] }, { week: 'w03', lessons: ['syn'] }] };

describe('prereqsOf', () => {
  it('donne les prérequis directs du réseau, `requires` d’abord, sans doublon ni l’item lui-même', () => {
    expect(prereqsOf('5e.m1.r01', net)).toEqual(['6e.m1.r01', '6e.m1.r02']);
    expect(prereqsOf('5e.m1.r02', net)).toEqual(['5e.m1.r01', '6e.m1.r03']);
    expect(prereqsOf('6e.m1.r01', net)).toEqual([]);
  });
});

describe('buildScope', () => {
  it('règle A : les items des leçons vues ; règle B : les prérequis des leçons à venir, jamais elles-mêmes', () => {
    const s = buildScope({ progression, pointer: 'l1', net });
    expect(s.taughtLessons).toEqual(['l1']);
    expect(s.upcomingLessons).toEqual(['l2', 'syn']);
    expect(s.ruleA).toEqual(['5e.m1.r01']);
    // a synthesis brings no item; 5e.m1.r01 is already in rule A
    expect(s.upcomingItems).toEqual(['5e.m1.r02']);
    expect(s.ruleB).toEqual(['6e.m1.r03']);
    expect(s.targets).toEqual(['6e.m1.r03', '5e.m1.r01']);
    for (const id of s.targets) expect(net.getItem(id)).not.toBeNull();
  });
  it('avant la rentrée : aucune règle A, et la règle B s’arrête à son plafond', () => {
    const s0 = buildScope({ progression, pointer: null, net });
    expect(s0.ruleA).toEqual([]);
    expect(s0.ruleB).toEqual(['6e.m1.r01', '6e.m1.r02', '6e.m1.r03']);
    expect(buildScope({ progression, pointer: null, maxUpcomingPrereqs: 2, net }).ruleB).toEqual(['6e.m1.r01', '6e.m1.r02']);
  });
  it('ne garde en règle A que les plus récents des items vus', () => {
    const s = buildScope({ progression, pointer: 'l2', recentTaught: 1, net });
    expect(s.taughtItems).toEqual(['5e.m1.r01', '5e.m1.r02']);
    expect(s.ruleA).toEqual(['5e.m1.r02']);
    for (const id of s.ruleA) expect(s.upcomingItems).not.toContain(id);
  });
  it('sur l’année livrée, vide : aucune cible, aucun plantage', () => {
    const { progressions } = SCHOOL_YEARS['2026/2027'];
    const s = buildScope({ progression: progressions['6e'], pointer: null });
    expect(s.targets).toEqual([]);
  });
  it('on the delivered 3e net, rule B reaches stub prerequisites, and each one answers itemInfo without a lesson', () => {
    const s = buildScope({ progression: { weeks: [{ week: 'w01', lessons: ['calculer-avec-des-fractions'] }] }, pointer: null });
    expect(s.ruleB.length).toBeGreaterThan(0);
    const stubs = s.ruleB.filter((id) => itemInfo(id).noLessonInGrade);
    expect(stubs.length).toBeGreaterThan(0);
    for (const id of stubs) expect(itemInfo(id).homeLesson).toBeNull();
  });
});

describe('itemInfo', () => {
  it('donne le texte et la leçon où réviser', () => {
    expect(itemInfo('5e.m1.r01', net)).toEqual({
      id: '5e.m1.r01', text: 'Compétence 5e.m1.r01', grade: '5e',
      homeLesson: { code: 'l1', grade: '5e', title: 'Leçon l1', status: 'available' },
      noLessonInGrade: null,
    });
  });
  it('a stub of the delivered net: its text and grade, no lesson, « no lesson yet in its grade »', () => {
    expect(itemInfo('4e.m1.r01')).toMatchObject({ id: '4e.m1.r01', grade: '4e', homeLesson: null, noLessonInGrade: '4e' });
    expect(itemInfo('4e.m1.r01').text.length).toBeGreaterThan(5);
  });
  it('null pour un item inconnu', () => {
    expect(itemInfo('nope', net)).toBeNull();
    expect(itemInfo('nope')).toBeNull();
  });
});
