import { describe, it, expect } from 'vitest';
import { groupIntoClasses, classMean, medianClass, interpolatedMedian, mean, median, sum } from '../../../../common/stats';
import { RECHARGES, BORNES_10, SALAIRES } from './data';

/**
 * Les corrections des modules citent des effectifs et des estimations. Ce
 * test les VÉRIFIE : si la graine ou la forme de la série changent, les
 * énoncés devenus faux sont signalés ici.
 */
describe('série des 200 recharges', () => {
  it('compte 200 valeurs, toutes dans [10 ; 90[', () => {
    expect(RECHARGES).toHaveLength(200);
    for (const v of RECHARGES) {
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThan(90);
    }
  });

  it('est reproductible (graine figée)', () => {
    expect(RECHARGES[0]).toBe(RECHARGES[0]);
    expect(RECHARGES.slice(0, 3).every((v) => typeof v === 'number')).toBe(true);
  });

  it('est bien une série CONTINUE : presque aucune valeur répétée', () => {
    const distinctes = new Set(RECHARGES).size;
    expect(distinctes).toBeGreaterThan(150);
  });

  it('a une allure étirée vers la droite (moyenne > médiane)', () => {
    expect(mean(RECHARGES)).toBeGreaterThan(median(RECHARGES));
  });
});

describe('regroupement en classes d’amplitude 10', () => {
  const classes = groupIntoClasses(RECHARGES, BORNES_10);

  it('les effectifs EXACTS cités par les modules', () => {
    // Ces huit nombres sont écrits dans les énoncés et les corrections :
    // ils ne doivent pas bouger sans que les textes soient relus.
    expect(classes.map((c) => c.count)).toEqual([4, 39, 55, 64, 17, 13, 7, 1]);
    expect(classes.map((c) => c.cumulativeCount)).toEqual([4, 43, 98, 162, 179, 192, 199, 200]);
  });

  it('les indicateurs EXACTS cités par les modules', () => {
    expect(mean(RECHARGES)).toBeCloseTo(41.152, 2);
    expect(median(RECHARGES)).toBeCloseTo(40.535, 2);
    expect(classMean(classes)).toBeCloseTo(41.15, 2);
    expect(medianClass(classes).from).toBe(40);
    expect(medianClass(classes).to).toBe(50);
    expect(interpolatedMedian(classes)).toBeCloseTo(40.31, 1);
  });

  it('huit classes, aucun individu perdu', () => {
    expect(classes).toHaveLength(8);
    expect(sum(classes.map((c) => c.count))).toBe(200);
  });

  it('toutes les classes ont la même amplitude', () => {
    for (const c of classes) expect(c.width).toBe(10);
  });

  it('les fréquences cumulées croissent jusqu’à 1', () => {
    let prev = 0;
    for (const c of classes) {
      expect(c.cumulativeFrequency).toBeGreaterThanOrEqual(prev);
      prev = c.cumulativeFrequency;
    }
    expect(classes[classes.length - 1].cumulativeFrequency).toBeCloseTo(1, 10);
  });

  it('la moyenne estimée par les centres est PROCHE mais différente de l’exacte', () => {
    const estimee = classMean(classes);
    const exacte = mean(RECHARGES);
    expect(Math.abs(estimee - exacte)).toBeLessThan(2);   // proche
    expect(estimee).not.toBeCloseTo(exacte, 6);           // mais pas égale
  });

  it('la classe médiane contient bien la médiane exacte', () => {
    const mc = medianClass(classes);
    const exacte = median(RECHARGES);
    expect(exacte).toBeGreaterThanOrEqual(mc.from);
    expect(exacte).toBeLessThanOrEqual(mc.to);
  });

  it('la médiane interpolée tombe dans la classe médiane', () => {
    const mc = medianClass(classes);
    const interp = interpolatedMedian(classes);
    expect(interp).toBeGreaterThanOrEqual(mc.from);
    expect(interp).toBeLessThanOrEqual(mc.to);
  });
});

describe('amplitude du découpage', () => {
  it('une amplitude trop fine donne beaucoup de classes peu remplies', () => {
    const bornes = [];
    for (let b = 10; b <= 90; b += 2) bornes.push(b);
    const fines = groupIntoClasses(RECHARGES, bornes);
    expect(fines.length).toBe(40);
    expect(sum(fines.map((c) => c.count))).toBe(200);
  });

  it('une amplitude trop large écrase la forme (2 classes seulement)', () => {
    const larges = groupIntoClasses(RECHARGES, [10, 50, 90]);
    expect(larges).toHaveLength(2);
    expect(sum(larges.map((c) => c.count))).toBe(200);
  });

  it('quel que soit le découpage, l’effectif total est conservé', () => {
    for (const a of [2, 5, 10, 20, 40]) {
      const bornes = [];
      for (let b = 10; b <= 90; b += a) bornes.push(b);
      expect(sum(groupIntoClasses(RECHARGES, bornes).map((c) => c.count))).toBe(200);
    }
  });
});

describe('salaires — classes d’amplitudes inégales (le piège de l’atelier)', () => {
  const classes = SALAIRES.bornes.slice(0, -1).map((from, i) => ({
    from, to: SALAIRES.bornes[i + 1], count: SALAIRES.effectifs[i],
    width: SALAIRES.bornes[i + 1] - from,
  }));

  it('la dernière classe est quatre fois plus large', () => {
    expect(classes[3].width).toBe(4);
    expect(classes[0].width).toBe(1);
  });

  it('la classe la plus PEUPLÉE n’est pas la plus large', () => {
    const plusPeuplee = classes.reduce((a, c) => (c.count > a.count ? c : a));
    const plusLarge = classes.reduce((a, c) => (c.width > a.width ? c : a));
    expect(plusPeuplee.from).toBe(2);
    expect(plusLarge.from).toBe(4);
  });

  it('en densité, la dernière classe est la MOINS haute — d’où le piège', () => {
    const densites = classes.map((c) => c.count / c.width);
    expect(densites[3]).toBe(4);          // 16 / 4
    expect(densites[1]).toBe(34);         // 34 / 1
    expect(Math.min(...densites)).toBe(densites[3]);
  });
});
