import { describe, expect, it } from 'vitest';
import {
  SCHOOL_YEARS, schoolYearOf, addDays, daysBetween, defaultPointer, taughtLessons, upcomingLessons,
  nextMilestone, dayStatus, validateSchoolYear, yearlyRenewal, lessonOrder,
} from './schoolCalendar.js';

const { calendar, progressions } = SCHOOL_YEARS['2026/2027'];
const p4 = progressions['4am'];

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

describe('pointeur et portée (4AM 2026/2027)', () => {
  it('avant la première semaine : rien n’est vu', () => {
    expect(defaultPointer(calendar, p4, '2026-09-22')).toBeNull();
    expect(taughtLessons(p4, null)).toEqual([]);
  });
  it('le 15 novembre, le pointeur est la dernière leçon de la semaine du 8 novembre', () => {
    const ptr = defaultPointer(calendar, p4, '2026-11-15');
    const w07 = p4.weeks.find((w) => w.week === 'w07');
    expect(calendar.weeks[6].from).toBe('2026-11-08');
    expect(ptr).toBe(w07.lessons.at(-1));
  });
  it('les leçons vues vont jusqu’au pointeur inclus, dans l’ordre', () => {
    const t = taughtLessons(p4, 'jidhr-tarbii');
    expect(t[0]).toBe('qasim-adad-tabii');
    expect(t.at(-1)).toBe('jidhr-tarbii');
    expect(t).not.toContain('natiqa-ghayr-natiqa');
  });
  it('un pointeur inconnu ne donne rien (jamais tout)', () => {
    expect(taughtLessons(p4, 'nope')).toEqual([]);
    expect(upcomingLessons(p4, 'nope')).toEqual([]);
  });
  it('les 3 semaines suivantes commencent juste après le pointeur', () => {
    const up = upcomingLessons(p4, 'jidhr-tarbii', 3);
    expect(up[0]).toBe('natiqa-ghayr-natiqa');
    const order = lessonOrder(p4);
    const weeksSpanned = new Set(order.filter((o) => up.includes(o.code)).map((o) => o.weekIndex));
    expect(weeksSpanned.size).toBeLessThanOrEqual(3);
  });
});

describe('échéances et jours', () => {
  it('prochaine échéance le 15 novembre : les examens du 1er trimestre, dans 21 jours', () => {
    const m = nextMilestone(calendar, '4am', '2026-11-15');
    expect(m.kind).toBe('exam');
    expect(m.daysLeft).toBe(21);
  });
  it('le devoir du 3e trimestre de 1AM est une semaine plus tard', () => {
    expect(nextMilestone(calendar, '1am', '2027-04-19').from).toBe('2027-04-25');
    expect(nextMilestone(calendar, '2am', '2027-04-19').from).toBe('2027-04-18');
  });
  it('le sprint BEM n’existe que pour 4AM', () => {
    expect(nextMilestone(calendar, '4am', '2027-05-21').kind).toBe('bem_sprint');
    expect(nextMilestone(calendar, '3am', '2027-05-21')).toBeNull();
  });
  it('reconnaît vacances, examens et semaines de classe', () => {
    expect(dayStatus(calendar, '4am', '2026-12-25').kind).toBe('break');
    expect(dayStatus(calendar, '4am', '2026-12-07').kind).toBe('exam');
    expect(dayStatus(calendar, '4am', '2026-11-16').kind).toBe('teaching');
  });
});

describe('validation', () => {
  const catalogues = Object.fromEntries(
    ['1am', '2am', '3am', '4am'].map((g) => [
      g,
      [...lessonOrder(progressions[g]).map((o) => o.code), ...(progressions[g].unscheduled ?? []).map((u) => u.code)],
    ]),
  );
  it('les données livrées sont valides', () => {
    expect(validateSchoolYear({ calendar, progressions, catalogues }).errors).toEqual([]);
  });
  it('refuse une leçon du catalogue ni placée ni déclarée', () => {
    const c = { ...catalogues, '4am': [...catalogues['4am'], 'lecon-oubliee'] };
    const { errors } = validateSchoolYear({ calendar, progressions, catalogues: c });
    expect(errors.some((e) => e.includes('lecon-oubliee'))).toBe(true);
  });
  it('refuse une leçon placée deux fois', () => {
    const weeks = p4.weeks.map((w, i) => (i === 1 ? { ...w, lessons: [...w.lessons, p4.weeks[0].lessons[0]] } : w));
    const { errors } = validateSchoolYear({
      calendar, progressions: { ...progressions, '4am': { ...p4, weeks } }, catalogues,
    });
    expect(errors.some((e) => e.includes('deux fois'))).toBe(true);
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
