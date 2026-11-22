import { describe, expect, it } from 'vitest';
import {
  GRADES, SCHOOL_YEARS, schoolYearOf, addDays, daysBetween, defaultPointer, taughtLessons, upcomingLessons,
  nextMilestone, dayStatus, validateSchoolYear, yearlyRenewal, lessonOrder,
} from './schoolCalendar.js';

// The delivered year is EMPTY until stage 2D writes the French one (FRANCE_REBUILD_PLAN.md §4bis): the rules are
// checked on this neutral year of four weeks, one per grade progression.
const calendar = {
  schoolYear: '2026/2027',
  start: '2026-09-01',
  end: '2026-12-18',
  weeks: [
    { id: 'w01', from: '2026-09-07', to: '2026-09-11', term: 1 },
    { id: 'w02', from: '2026-09-14', to: '2026-09-18', term: 1 },
    { id: 'w03', from: '2026-09-21', to: '2026-09-25', term: 2 },
    { id: 'w04', from: '2026-09-28', to: '2026-10-02', term: 3 },
  ],
  events: [
    { kind: 'evaluation', from: '2026-09-01', to: '2026-09-04', label: 'Évaluation diagnostique' },
    { kind: 'holiday', from: '2026-09-16', to: '2026-09-16', label: 'Jour férié' },
    { kind: 'devoir', from: '2026-09-24', to: '2026-09-24', grades: ['6e'], label: 'Devoir' },
    { kind: 'exam', term: 1, from: '2026-10-05', to: '2026-10-06', label: 'Examen 1' },
    { kind: 'break', from: '2026-10-17', to: '2026-11-01', label: 'Vacances' },
    { kind: 'exam', term: 2, from: '2026-11-09', to: '2026-11-10', label: 'Examen 2' },
    { kind: 'exam', term: 3, from: '2026-12-07', to: '2026-12-08', label: 'Examen 3' },
  ],
};
const progressionOf = (g) => ({
  grade: g,
  schoolYear: '2026/2027',
  weeks: [
    { week: 'w01', lessons: [`${g}-l1`, `${g}-l2`] },
    { week: 'w02', lessons: [`${g}-l3`] },
    { week: 'w03', lessons: [] },
    { week: 'w04', lessons: [`${g}-l4`] },
  ],
  unscheduled: [{ code: `${g}-hors`, reason: 'pas dans la progression de l’établissement' }],
});
const progressions = Object.fromEntries(GRADES.map((g) => [g, progressionOf(g)]));
const p6 = progressions['6e'];

describe('dates', () => {
  it('bascule l’année scolaire le 15 août', () => {
    expect(schoolYearOf('2026-08-14')).toBe('2025/2026');
    expect(schoolYearOf('2026-08-15')).toBe('2026/2027');
    expect(schoolYearOf('2027-06-01')).toBe('2026/2027');
  });
  it('compte les jours sans fuseau', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(daysBetween('2026-11-15', '2026-12-06')).toBe(21);
  });
});

describe('pointeur et portée', () => {
  it('avant la première semaine : rien n’est vu', () => {
    expect(defaultPointer(calendar, p6, '2026-09-07')).toBeNull();
    expect(taughtLessons(p6, null)).toEqual([]);
  });
  it('le pointeur est la dernière leçon de la dernière semaine TERMINÉE', () => {
    expect(defaultPointer(calendar, p6, '2026-09-11')).toBeNull();
    expect(defaultPointer(calendar, p6, '2026-09-14')).toBe('6e-l2');
  });
  it('une semaine terminée sans leçon renvoie à la précédente', () => {
    expect(defaultPointer(calendar, p6, '2026-09-28')).toBe('6e-l3');
  });
  it('les leçons vues vont jusqu’au pointeur inclus, dans l’ordre', () => {
    expect(taughtLessons(p6, '6e-l3')).toEqual(['6e-l1', '6e-l2', '6e-l3']);
  });
  it('un pointeur inconnu ne donne rien (jamais tout)', () => {
    expect(taughtLessons(p6, 'nope')).toEqual([]);
    expect(upcomingLessons(p6, 'nope')).toEqual([]);
  });
  it('les semaines suivantes commencent juste après le pointeur, le reste de sa semaine compris', () => {
    expect(upcomingLessons(p6, '6e-l1', 1)).toEqual(['6e-l2']);
    expect(upcomingLessons(p6, '6e-l2', 3)).toEqual(['6e-l3', '6e-l4']);
    expect(upcomingLessons(p6, '6e-l2', 1)).toEqual(['6e-l3']);
    expect(upcomingLessons(p6, null, 1)).toEqual(['6e-l1', '6e-l2']);
    expect(upcomingLessons(p6, '6e-l4')).toEqual([]);
    const weeksSpanned = new Set(lessonOrder(p6).filter((o) => upcomingLessons(p6, '6e-l2', 2).includes(o.code)).map((o) => o.weekIndex));
    expect(weeksSpanned.size).toBeLessThanOrEqual(2);
  });
});

describe('échéances et jours', () => {
  it('la prochaine échéance d’une classe, et dans combien de jours', () => {
    expect(nextMilestone(calendar, '6e', '2026-09-20')).toMatchObject({ kind: 'devoir', daysLeft: 4 });
    expect(nextMilestone(calendar, '5e', '2026-09-20')).toMatchObject({ kind: 'exam', from: '2026-10-05', daysLeft: 15 });
    expect(nextMilestone(calendar, '5e', '2026-10-05').daysLeft).toBe(0);
    expect(nextMilestone(calendar, '5e', '2026-12-09')).toBeNull();
  });
  it('reconnaît vacances, examens, semaines de classe et week-ends', () => {
    expect(dayStatus(calendar, '6e', '2026-08-31').kind).toBe('before');
    expect(dayStatus(calendar, '6e', '2026-12-19').kind).toBe('after');
    expect(dayStatus(calendar, '6e', '2026-10-20')).toEqual({ kind: 'break', label: 'Vacances' });
    expect(dayStatus(calendar, '6e', '2026-10-05').kind).toBe('exam');
    expect(dayStatus(calendar, '6e', '2026-09-15')).toMatchObject({ kind: 'teaching', weekIndex: 1 });
    expect(dayStatus(calendar, '6e', '2026-09-12').kind).toBe('weekend');
  });
});

describe('validation', () => {
  const catalogues = Object.fromEntries(
    GRADES.map((g) => [
      g,
      [...lessonOrder(progressions[g]).map((o) => o.code), ...(progressions[g].unscheduled ?? []).map((u) => u.code)],
    ]),
  );
  it('accepte une année bien formée', () => {
    const { errors, warnings } = validateSchoolYear({ calendar, progressions, catalogues });
    expect(errors).toEqual([]);
    expect(warnings).toHaveLength(GRADES.length);
  });
  it('refuse une leçon du catalogue ni placée ni déclarée', () => {
    const c = { ...catalogues, '6e': [...catalogues['6e'], 'lecon-oubliee'] };
    const { errors } = validateSchoolYear({ calendar, progressions, catalogues: c });
    expect(errors.some((e) => e.includes('lecon-oubliee'))).toBe(true);
  });
  it('refuse une leçon placée deux fois', () => {
    const weeks = p6.weeks.map((w, i) => (i === 1 ? { ...w, lessons: [...w.lessons, p6.weeks[0].lessons[0]] } : w));
    const { errors } = validateSchoolYear({
      calendar, progressions: { ...progressions, '6e': { ...p6, weeks } }, catalogues,
    });
    expect(errors.some((e) => e.includes('deux fois'))).toBe(true);
  });
  it('refuse des semaines qui se chevauchent et un trimestre sans examen', () => {
    const weeks = calendar.weeks.map((w, i) => (i === 1 ? { ...w, from: '2026-09-10' } : w));
    const events = calendar.events.filter((e) => !(e.kind === 'exam' && e.term === 3));
    const { errors } = validateSchoolYear({ calendar: { ...calendar, weeks, events }, progressions, catalogues });
    expect(errors.some((e) => e.includes('chevauche'))).toBe(true);
    expect(errors.some((e) => e.includes('trimestre 3'))).toBe(true);
  });
});

describe('l’année livrée (squelette vide)', () => {
  const delivered = SCHOOL_YEARS['2026/2027'];
  it('garde la forme : un calendrier sans semaine ni évènement, une progression vide par classe', () => {
    expect(delivered.calendar).toMatchObject({ schoolYear: '2026/2027', weeks: [], events: [] });
    expect(Object.keys(delivered.progressions)).toEqual(GRADES);
    for (const g of GRADES) {
      expect(delivered.progressions[g]).toMatchObject({ grade: g, schoolYear: '2026/2027', weeks: [], unscheduled: [], placedByPlatform: [] });
    }
  });
  it('n’est pas une année valide : le validateur le dit, tant que l’étape 2D ne l’a pas écrite', () => {
    const catalogues = Object.fromEntries(GRADES.map((g) => [g, []]));
    const { errors } = validateSchoolYear({ ...delivered, catalogues });
    expect(errors.some((e) => e.startsWith('start'))).toBe(true);
  });
  it('ne pointe sur rien et ne plante pas', () => {
    expect(defaultPointer(delivered.calendar, delivered.progressions['6e'], '2026-11-15')).toBeNull();
    expect(nextMilestone(delivered.calendar, '6e', '2026-11-15')).toBeNull();
    expect(upcomingLessons(delivered.progressions['6e'], null)).toEqual([]);
  });
});

describe('renouvellement annuel', () => {
  it('échoue sans calendrier pour l’année en cours', () => {
    expect(yearlyRenewal(['2026/2027'], '2027-09-01').errors).toHaveLength(1);
    expect(yearlyRenewal(['2026/2027'], '2026-11-09').errors).toHaveLength(0);
  });
  it('prévient à partir du 1er juin si l’année suivante manque', () => {
    expect(yearlyRenewal(['2026/2027'], '2027-06-02').warnings).toHaveLength(1);
    expect(yearlyRenewal(['2026/2027'], '2027-05-31').warnings).toHaveLength(0);
  });
});
