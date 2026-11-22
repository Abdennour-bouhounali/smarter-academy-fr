import { describe, expect, it } from 'vitest';
import {
  yearFor, resolvePointer, pointerChoices, scopeFor, sessionView, reportOf, weekV0, milestone, todayIso, BANDS,
  yearStrip, teachingWeekNumber, tickTasks,
} from './compassModel';

const TODAY = '2026-11-15';
const year = yearFor('4am', TODAY);

describe('année et pointeur', () => {
  it('trouve la progression 4AM de 2026/2027', () => {
    expect(year.schoolYear).toBe('2026/2027');
    expect(yearFor('4am', '2031-01-01')).toBeNull();
  });
  it('le tap de l’élève l’emporte, sinon la date', () => {
    expect(resolvePointer({ profile: { mode: 'lesson', lesson: 'jidhr-tarbii' }, year, today: TODAY }))
      .toEqual({ pointer: 'jidhr-tarbii', source: 'student' });
    const def = resolvePointer({ profile: null, year, today: TODAY });
    expect(def.source).toBe('default');
    expect(def.pointer).toBeTruthy();
    expect(resolvePointer({ profile: { mode: 'lesson', lesson: 'inconnue' }, year, today: TODAY }).source).toBe('default');
  });
  it('propose des leçons autour du pointeur, une seule suggérée, jamais une synthèse', () => {
    const choices = pointerChoices(year, resolvePointer({ profile: null, year, today: TODAY }).pointer);
    expect(choices.length).toBeGreaterThan(2);
    expect(choices.filter((c) => c.suggested)).toHaveLength(1);
    expect(choices.some((c) => c.code.startsWith('wadiya-idmajiya'))).toBe(false);
  });
});

describe('rapport et semaine', () => {
  const availability = { '4am.m1.r06': [1, 2], '4am.m1.r01': [1, 2] };
  const session = {
    targets: ['4am.m1.r01', '4am.m1.r06'],
    answers: [
      { itemId: '4am.m1.r01', level: 1, correct: true, unsure: false },
      { itemId: '4am.m1.r06', level: 1, correct: false, unsure: false },
      { itemId: '4am.m1.r01', level: 2, correct: true, unsure: false },
      { itemId: '4am.m1.r06', level: 1, correct: false, unsure: false },
    ],
  };
  it('le moteur rejoué continue sur ce qui reste', () => {
    const v = sessionView(session, availability);
    expect(v.items.get('4am.m1.r06').opened).toBe(true);
  });
  it('compte par bande, la lacune en priorité avec sa leçon', () => {
    const r = reportOf({ ...session, bands: { '4am.m1.r01': 'solid', '4am.m1.r06': 'start' } }, availability);
    expect(r.counts.solid).toBe(1);
    expect(r.priority.id).toBe('4am.m1.r06');
    expect(r.priority.band).toBe(BANDS.START);
    expect(r.priority.homeLesson.code).toBe('jidhr-tarbii');
  });
  it('la semaine v0 a 3 tâches au plus, la priorité d’abord', () => {
    const r = reportOf({ ...session, bands: { '4am.m1.r01': 'solid', '4am.m1.r06': 'start' } }, availability);
    const tasks = weekV0(r, year, 'jidhr-tarbii');
    expect(tasks.length).toBeLessThanOrEqual(3);
    expect(tasks[0]).toMatchObject({ kind: 'revise' });
    expect(tasks.at(-1).kind).toBe('prepare');
  });
  it('la portée d’un pointeur réel n’est pas vide', () => {
    expect(scopeFor(year, 'jidhr-tarbii').targets.length).toBeGreaterThan(0);
  });
});

describe('accueil : bande de l’année, semaine, tâches cochées', () => {
  it('la bande couvre l’année avec une seule semaine « now » et les examens du 1er trimestre', () => {
    const strip = yearStrip(year, '4am', TODAY);
    expect(strip.length).toBeGreaterThan(35);
    expect(strip.filter((w) => w.now)).toHaveLength(1);
    expect(strip.find((w) => w.from <= '2026-12-07' && w.to >= '2026-12-07').kind).toBe('exam');
    expect(strip.find((w) => w.from <= '2026-12-25' && w.to >= '2026-12-25').kind).toBe('break');
    expect(strip.some((w) => w.kind === 'bem')).toBe(true);
    expect(yearStrip(yearFor('3am', TODAY), '3am', TODAY).some((w) => w.kind === 'bem')).toBe(false);
  });
  it('le rang de la semaine de classe', () => {
    expect(teachingWeekNumber(year, TODAY)).toEqual({ n: 8, total: 25 });
  });
  it('une tâche est cochée quand sa leçon est ouverte APRÈS la jauge, la suivante devient celle du jour', () => {
    const tasks = [
      { kind: 'revise', item: { homeLesson: { code: 'jidhr-tarbii' } } },
      { kind: 'prepare', lesson: { code: 'aksiya-talis', titleAr: '…' } },
    ];
    const since = '2026-11-15T10:00:00Z';
    const r = tickTasks(tasks, { 'jidhr-tarbii': Date.parse('2026-11-16T09:00:00Z'), 'aksiya-talis': Date.parse('2026-11-01T09:00:00Z') }, since);
    expect(r.doneCount).toBe(1);
    expect(r.today.code).toBe('aksiya-talis');
    expect(tickTasks(tasks, {}, since).today.code).toBe('jidhr-tarbii');
  });
});

describe('dates', () => {
  it('prochaine échéance et date du jour', () => {
    expect(milestone(year, '4am', TODAY).daysLeft).toBe(21);
    expect(todayIso(new Date(2026, 10, 9))).toBe('2026-11-09');
  });
});
