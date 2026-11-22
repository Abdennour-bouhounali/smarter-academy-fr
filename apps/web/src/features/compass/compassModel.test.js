import { describe, expect, it, vi } from 'vitest';
import {
  yearFor, resolvePointer, pointerChoices, scopeFor, sessionView, reportOf, weekV0, milestone, todayIso, BANDS,
  yearStrip, teachingWeekNumber, tickTasks,
} from './compassModel';
import { CALENDAR, PROGRESSION } from './test/compassFixture';

// The delivered net and school year are EMPTY until Stage 2: the logic runs on the neutral fixture of `test/`.
vi.mock('@smarter-academy/core/curriculum/fr/net/learningNet.js', async (importOriginal) =>
  (await import('./test/compassFixture.js')).mockLearningNet(importOriginal));
vi.mock('@smarter-academy/core/compass/scope.js', async (importOriginal) =>
  (await import('./test/compassFixture.js')).mockScope(importOriginal));

const TODAY = '2026-09-27';
const year = { schoolYear: '2026/2027', calendar: CALENDAR, progression: PROGRESSION };

describe('année et pointeur', () => {
  it('trouve la progression 3e de 2026/2027, et rien hors de l’année', () => {
    expect(yearFor('3e', TODAY).schoolYear).toBe('2026/2027');
    expect(yearFor('3e', '2031-01-01')).toBeNull();
  });
  it('le tap de l’élève l’emporte, sinon la date', () => {
    expect(resolvePointer({ profile: { mode: 'lesson', lesson: 'l3' }, year, today: TODAY })).toEqual({ pointer: 'l3', source: 'student' });
    const def = resolvePointer({ profile: null, year, today: TODAY });
    expect(def).toEqual({ pointer: 'l2', source: 'default' });
    expect(resolvePointer({ profile: { mode: 'lesson', lesson: 'inconnue' }, year, today: TODAY }).source).toBe('default');
  });
  it('propose des leçons autour du pointeur, une seule suggérée, jamais une synthèse', () => {
    const choices = pointerChoices(year, resolvePointer({ profile: null, year, today: TODAY }).pointer);
    expect(choices.length).toBeGreaterThan(2);
    expect(choices.filter((c) => c.suggested)).toHaveLength(1);
    expect(choices.some((c) => c.code === 'syn')).toBe(false);
    expect(choices.find((c) => c.code === 'l1').title).toBe('Leçon l1');
  });
});

describe('rapport et semaine', () => {
  const availability = { '3e.m1.r02': [1, 2], '3e.m1.r01': [1, 2] };
  const session = {
    targets: ['3e.m1.r01', '3e.m1.r02'],
    answers: [
      { itemId: '3e.m1.r01', level: 1, correct: true, unsure: false },
      { itemId: '3e.m1.r02', level: 1, correct: false, unsure: false },
      { itemId: '3e.m1.r01', level: 2, correct: true, unsure: false },
      { itemId: '3e.m1.r02', level: 1, correct: false, unsure: false },
    ],
  };
  const bands = { '3e.m1.r01': 'solid', '3e.m1.r02': 'start' };
  it('le moteur rejoué continue sur ce qui reste', () => {
    const v = sessionView(session, availability);
    expect(v.items.get('3e.m1.r02').opened).toBe(true);
  });
  it('compte par bande, la lacune en priorité avec sa leçon', () => {
    const r = reportOf({ ...session, bands }, availability);
    expect(r.counts.solid).toBe(1);
    expect(r.priority.id).toBe('3e.m1.r02');
    expect(r.priority.band).toBe(BANDS.START);
    expect(r.priority.homeLesson.code).toBe('l2');
  });
  it('la semaine v0 a 3 tâches au plus, la priorité d’abord, la préparation d’une leçon (jamais d’une synthèse) en dernier', () => {
    const r = reportOf({ ...session, bands }, availability);
    const tasks = weekV0(r, year, 'l2');
    expect(tasks.length).toBeLessThanOrEqual(3);
    expect(tasks[0]).toMatchObject({ kind: 'revise' });
    expect(tasks.at(-1)).toMatchObject({ kind: 'prepare', lesson: { code: 'l3', title: 'Leçon l3' } });
  });
  it('la portée d’un pointeur réel n’est pas vide', () => {
    expect(scopeFor(year, 'l2').targets.length).toBeGreaterThan(0);
  });
});

describe('accueil : bande de l’année, semaine, tâches cochées', () => {
  it('la bande couvre l’année avec une seule semaine « now », l’examen, les vacances et le sprint du brevet', () => {
    const strip = yearStrip(year, '3e', TODAY);
    expect(strip.length).toBeGreaterThan(35);
    expect(strip.filter((w) => w.now)).toHaveLength(1);
    expect(strip.find((w) => w.from <= '2026-12-07' && w.to >= '2026-12-07').kind).toBe('exam');
    expect(strip.find((w) => w.from <= '2026-12-25' && w.to >= '2026-12-25').kind).toBe('break');
    expect(strip.some((w) => w.kind === 'bem')).toBe(true);
    expect(yearStrip(year, '6e', TODAY).some((w) => w.kind === 'bem')).toBe(false);
  });
  it('le rang de la semaine de classe', () => {
    expect(teachingWeekNumber(year, TODAY)).toEqual({ n: 3, total: 10 });
  });
  it('une tâche est cochée quand sa leçon est ouverte APRÈS la jauge, la suivante devient celle du jour', () => {
    const tasks = [
      { kind: 'revise', item: { homeLesson: { code: 'l2' } } },
      { kind: 'prepare', lesson: { code: 'l3', title: '…' } },
    ];
    const since = '2026-11-15T10:00:00Z';
    const r = tickTasks(tasks, { l2: Date.parse('2026-11-16T09:00:00Z'), l3: Date.parse('2026-11-01T09:00:00Z') }, since);
    expect(r.doneCount).toBe(1);
    expect(r.today.code).toBe('l3');
    expect(tickTasks(tasks, {}, since).today.code).toBe('l2');
  });
});

describe('dates', () => {
  it('prochaine échéance et date du jour', () => {
    expect(milestone(year, '3e', TODAY).daysLeft).toBe(71);
    expect(todayIso(new Date(2026, 10, 9))).toBe('2026-11-09');
  });
});
