import { describe, it, expect } from 'vitest';
import { marginalFrequency, conditionalFrequency, jointFrequency } from '../../../../common/stats';
import { enqueteTable, sportTable, TRANSPORTS, NIVEAUX } from './data';

const T = enqueteTable();

describe('l’enquête sur 400 lycéens', () => {
  it('les marges et le total cités par les modules', () => {
    expect(T.grandTotal).toBe(400);
    expect(T.colTotals).toEqual({ '2de': 200, '1re': 120, terminale: 80 });
    expect(T.rowTotals).toEqual({ bus: 160, vélo: 80, voiture: 90, 'à pied': 70 });
  });

  it('les groupes comparés ont des tailles TRÈS différentes — c’est le sujet', () => {
    expect(T.colTotals['2de']).toBe(2.5 * T.colTotals.terminale);
  });
});

describe('les trois dénominateurs d’une même case', () => {
  // Case « bus × 2de » : 100 élèves.
  it('conjointe, marginale et conditionnelles diffèrent', () => {
    expect(jointFrequency(T, 'bus', '2de')).toBeCloseTo(100 / 400, 10);          // 25 % du total
    expect(conditionalFrequency(T, { axis: 'col', key: '2de' }, 'bus')).toBeCloseTo(0.5, 10);   // 50 % des 2de
    expect(conditionalFrequency(T, { axis: 'row', key: 'bus' }, '2de')).toBeCloseTo(0.625, 10); // 62,5 % des usagers du bus
  });

  it('« parmi les 2de, le bus » ≠ « parmi le bus, les 2de »', () => {
    const a = conditionalFrequency(T, { axis: 'col', key: '2de' }, 'bus');
    const b = conditionalFrequency(T, { axis: 'row', key: 'bus' }, '2de');
    expect(a).not.toBeCloseTo(b, 3);
  });

  it('les conditionnelles selon une même condition somment à 1', () => {
    for (const n of NIVEAUX) {
      const s = TRANSPORTS.reduce((a, t) => a + conditionalFrequency(T, { axis: 'col', key: n }, t), 0);
      expect(s).toBeCloseTo(1, 10);
    }
    for (const t of TRANSPORTS) {
      const s = NIVEAUX.reduce((a, n) => a + conditionalFrequency(T, { axis: 'row', key: t }, n), 0);
      expect(s).toBeCloseTo(1, 10);
    }
  });

  it('les fréquences marginales somment à 1 sur chaque variable', () => {
    expect(NIVEAUX.reduce((a, n) => a + marginalFrequency(T, 'col', n), 0)).toBeCloseTo(1, 10);
    expect(TRANSPORTS.reduce((a, t) => a + marginalFrequency(T, 'row', t), 0)).toBeCloseTo(1, 10);
  });

  it('les fréquences citées par les modules tombent juste', () => {
    // La voiture progresse nettement avec le niveau : 10 %, 25 %, 50 %.
    expect(conditionalFrequency(T, { axis: 'col', key: '2de' }, 'voiture')).toBeCloseTo(0.1, 10);
    expect(conditionalFrequency(T, { axis: 'col', key: '1re' }, 'voiture')).toBeCloseTo(0.25, 10);
    expect(conditionalFrequency(T, { axis: 'col', key: 'terminale' }, 'voiture')).toBeCloseTo(0.5, 10);
  });

  it('LE PIÈGE : plus d’usagers du bus en 2de qu’en terminale, mais aussi bien plus d’élèves', () => {
    expect(T.cells.bus['2de']).toBeGreaterThan(T.cells.bus.terminale);
    // et pourtant la part du bus chute avec le niveau
    const p2 = conditionalFrequency(T, { axis: 'col', key: '2de' }, 'bus');
    const pT = conditionalFrequency(T, { axis: 'col', key: 'terminale' }, 'bus');
    expect(p2).toBeGreaterThan(pT);
  });
});

describe('le tableau « club sportif » (module 5)', () => {
  const S = sportTable();

  it('les marges', () => {
    expect(S.grandTotal).toBe(400);
    expect(S.colTotals).toEqual({ garçons: 160, filles: 240 });
    expect(S.rowTotals).toEqual({ 'club sportif': 180, 'pas de club': 220 });
  });

  it('EN EFFECTIF plus de garçons en club ; EN PART aussi — les deux se rejoignent ici', () => {
    expect(S.cells['club sportif'].garçons).toBeGreaterThan(S.cells['club sportif'].filles);
    const pg = conditionalFrequency(S, { axis: 'col', key: 'garçons' }, 'club sportif');
    const pf = conditionalFrequency(S, { axis: 'col', key: 'filles' }, 'club sportif');
    expect(pg).toBeCloseTo(0.6, 10);
    expect(pf).toBeCloseTo(0.35, 10);
  });

  it('mais « parmi les inscrits, la part de garçons » est une TOUTE autre question', () => {
    const inv = conditionalFrequency(S, { axis: 'row', key: 'club sportif' }, 'garçons');
    expect(inv).toBeCloseTo(96 / 180, 10);   // ≈ 53 %, à ne pas confondre avec 60 %
  });
});
