import { describe, it, expect } from 'vitest';
import * as A from './algorithms';
import * as F from './fraction';
import ar from '../../../../i18n/locales/ar/lesson.manipulation.json';

/**
 * Le GUIDE (LabCoach) des trois labos qui n'en avaient pas (2026-11-09) : pgcd-differences, euclidean-algorithm, fraction-reduction.
 * Il montre le geste du moment — jamais un nombre, jamais le moment de s'arrêter — et se tait quand tout est fait.
 */
const ids = (seq) => seq.map((s) => s?.id ?? null);

describe('LabCoach of the three ribbon / recipe labs', () => {
  it('differences: cut, again …, then the PGCD box, then nothing', () => {
    let s = A.initDifferences({ a: 21, b: 14 });
    const seen = [A.differencesCoachOf(s)];
    while (!A.isDifferencesFinished(s)) { s = A.subtract(s); seen.push(A.differencesCoachOf(s)); }
    expect(ids(seen)).toEqual(['cut', 'again', 'again', 'pgcd']);
    expect(seen[0].target).toBe('[data-drag-source="num:small"]');
    expect(A.differencesCoachOf({ ...s, pgcdPlaced: true })).toBeNull();
  });
  it('Euclid: copy until the quotient, then « one more », then carry; the PGCD box at the end', () => {
    let s = A.initEuclid({ a: 45, b: 18 });
    expect(A.euclidCoachOf(s).id).toBe('copy');
    s = A.tryCopy(A.tryCopy(s));
    expect(A.euclidCoachOf(s).id).toBe('more');
    s = A.tryCopy(s);
    expect(A.euclidCoachOf(s)).toMatchObject({ id: 'carry', target: '[data-drop-zone="carry"]' });
    let g = 0;
    while (!A.isEuclidFinished(s) && g++ < 30) s = A.euclidAutoStep(s);
    expect(A.euclidCoachOf(s).id).toBe('pgcd');
    expect(A.euclidCoachOf({ ...s, pgcdPlaced: true })).toBeNull();
  });
  it('reduction: divide, then « more » on the rail (never « stop now »), then path B, then nothing', () => {
    let s = F.init({ n: 12, d: 18 });
    expect(F.coachOf(s)).toMatchObject({ id: 'divide', target: '[data-fr-rail]' });
    s = F.reduceA(s, 2);
    expect(F.coachOf(s).id).toBe('more');
    s = F.claimIrreducible(F.reduceA(s, 3));
    expect(F.coachOf(s)).toMatchObject({ id: 'pgcd', target: '[data-drop-zone="pgcd"]' });
    expect(F.coachOf(F.reduceB(s, 6))).toBeNull();
  });
  it('every step has its sentence (and the four control labels), and no sentence names a number', () => {
    const steps = { diff: ['cut', 'again', 'pgcd'], euclid: ['copy', 'more', 'carry', 'pgcd'], reduce: ['divide', 'more', 'pgcd'] };
    Object.entries(steps).forEach(([ns, list]) => {
      ['hide', 'show', 'ok', 'stop', ...list].forEach((id) => expect(ar[ns].coach[id], `${ns}.${id}`).toBeTruthy());
      list.forEach((id) => expect(ar[ns].coach[id]).not.toMatch(/[0-9٠-٩]/));
    });
    expect(ar.coachGuide).toBe('المرشد');
  });
});
