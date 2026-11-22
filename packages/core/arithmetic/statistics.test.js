import { describe, it, expect } from 'vitest';
import { fracText, frac } from './linear.js';
import {
  tableOf, table, total, cumulativeUp, cumulativeDown, relative, relativeUp, relativeDown, runningSum, runningSumDown,
  countWhere, countAtMost, countAtLeast, expand, range, min, max, mean, medianRanks, valueAtRank, median, mode,
  klass, classesFrom, center, width, classIndexOf, classFreqs, groupedMean, medianClass,
  combineGroups, solveValueForMean, countFromRemoval, pieAngles, percent, statLatex, statText, approx,
} from './statistics.js';

const T = (p) => fracText(p);
const TT = (list) => list.map(T);

describe('statistics — tableaux et cumuls (unité 8, docs/sources/4am/unit8/extraction.json)', () => {
  const HEIGHTS = [160, 165, 154, 157, 159, 154, 157, 165, 160, 159, 165, 159, 160, 154, 160, 159, 157, 160, 157, 159];
  const H = tableOf(HEIGHTS);
  it('نشاط 1 : les 20 tailles', () => {
    expect(TT(H.values)).toEqual(['154', '157', '159', '160', '165']);
    expect(H.freqs).toEqual([3, 4, 5, 5, 3]);
    expect(total(H.freqs)).toBe(20);
    expect(cumulativeUp(H.freqs)).toEqual([3, 7, 12, 17, 20]);
    expect(cumulativeDown(H.freqs)).toEqual([20, 17, 13, 8, 3]);
    expect(countAtLeast(H, 159)).toBe(13);
    expect(countAtMost(H, 160)).toBe(17);
  });
  it('نشاط 1 (âges) et أؤكّد 1–2', () => {
    expect(cumulativeUp([40, 50, 80, 30])[1]).toBe(90);
    expect(cumulativeDown([40, 50, 80, 30])[2]).toBe(110);
    expect(cumulativeUp([6, 10, 3, 1])[2]).toBe(19);
    expect(cumulativeDown([50, 60, 70, 80])[3]).toBe(80);
  });
  it('نشاط 2 : les fréquences cumulées sur 30', () => {
    const f = [3, 7, 8, 5, 4, 2, 1];
    expect(TT(relativeUp(f))).toEqual(['1/10', '1/3', '3/5', '23/30', '9/10', '29/30', '1']);
    expect(TT(relativeDown(f))[4]).toBe('7/30');
    expect(TT(relative(f))[0]).toBe('1/10');
  });
  it('طرائق : séismes (décimaux exacts) et histogramme des âges', () => {
    const EQ = ['8,8', '8,5', '8,5', '8,5', '8,6', '8,6', '9', '9,5', '8,5', '9,2', '8,7', '9,1', '8,6', '8,5', '9', '8,8', '8,8'];
    const t = tableOf(EQ);
    expect(t.freqs).toEqual([5, 3, 1, 3, 2, 1, 1, 1]);
    expect(cumulativeDown(t.freqs)).toEqual([17, 12, 9, 8, 5, 3, 2, 1]);
    expect(relativeUp([20, 30, 40, 20, 60, 20, 10]).map((p) => statText(p))).toEqual(['0,1', '0,25', '0,45', '0,55', '0,85', '0,95', '1']);
  });
  it('تمرين 3 : des pourcentages déjà relatifs (97,97 % …)', () => {
    expect(runningSum(['97,97', '0,95', '1,08']).map((p) => statText(p, 2))).toEqual(['97,97', '98,92', '100']);
    expect(runningSumDown(['97,97', '0,95', '1,08']).map((p) => statText(p, 2))).toEqual(['100', '2,03', '1,08']);
  });
  it('تمرين 1 : « تفوق 34 » est strict', () => {
    const X = tableOf([33, 33, 32, 30, 32, 34, 34, 30, 30, 35, 36, 30, 32, 34, 33, 32, 32, 33, 35, 32, 34, 30, 30, 32, 34, 32, 30, 34, 32, 30]);
    expect([countWhere(X, '>', 34), countWhere(X, '<', 34), countAtLeast(X, 32), countAtMost(X, 32)]).toEqual([3, 21, 22, 17]);
  });
  it('refuse un tableau mal formé', () => {
    expect(() => table([1, 2], [1])).toThrow();
    expect(() => table([1], [1.5])).toThrow();
    expect(() => countWhere(tableOf([1]), '≈', 1)).toThrow();
  });
});

describe('statistics — المدى ، المتوسط ، الوسيط ، المنوال', () => {
  it('نشاط 3 : deux villes, même moyenne, deux étendues', () => {
    expect(T(mean([18, 15, 16, 20], [2, 18, 6, 4]))).toBe('241/15');
    expect(T(mean([10, 18, 15, 20], [3, 4, 16, 7]))).toBe('241/15');
    expect(approx(mean([18, 15, 16, 20], [2, 18, 6, 4]))).toBe('16,07');
    expect([T(range([18, 15, 16, 20])), T(range([10, 18, 15, 20], [3, 4, 16, 7]))]).toEqual(['5', '10']);
    expect(T(range([30000, 35000, 40000, 45000, 50000, 60000, 75000], [4, 3, 6, 5, 4, 3, 1]))).toBe('45000');
  });
  it('نشاط 4 : salaires, températures, poids groupés', () => {
    expect(T(median([42000, 35000, 55000, 42000, 60000, 50000, 35000, 42000, 50000, 65000, 35000]))).toBe('42000');
    const T10 = [40, 35, 34, 41, 48, 37, 35, 46, 37, 40];
    expect([T(range(T10)), statText(mean(T10)), statText(median(T10))]).toEqual(['14', '39,3', '38,5']);
    const C = classesFrom(34, 4, 5);
    expect(TT(C.map(center))).toEqual(['36', '40', '44', '48', '52']);
    expect(C[4].closed).toBe(true);
    expect(T(groupedMean(C, [4, 10, 12, 9, 6]))).toBe('1816/41');
    expect(medianClass([4, 10, 12, 9, 6])).toBe(2);
  });
  it('معارف 3–4 : étendue 2,2 ; médianes 15 et 10,5 ; classe médiane 3', () => {
    expect(statText(range(['37,3', '39', '38', '38,7', '39,5']))).toBe('2,2');
    expect(T(median([4, 5, 11, 11, 15, 17, 23, 23, 25]))).toBe('15');
    expect(statText(median([2, 5, 7, 7, 9, 12, 13, 13, 20, 22]))).toBe('10,5');
    expect(medianClass([5, 6, 14])).toBe(2);
  });
  it('طرائق تمرين 1 : 3 et 43 bougent la moyenne, pas la médiane', () => {
    const S = [3, 5, 4, 5, 11, 8, 10, 7, 4, 3, 10, 3, 4, 6, 7];
    expect([T(mean(S)), T(median(S)), T(range(S))]).toEqual(['6', '5', '8']);
    const S2 = [...S, 3, 43];
    expect([T(mean(S2)), T(median(S2)), T(range(S2))]).toEqual(['8', '5', '40']);
  });
  it('طرائق تمرين 2 : rangs 29 ; 30 et 31', () => {
    expect(medianRanks(57)).toEqual({ odd: true, ranks: [29] });
    expect(medianRanks(60)).toEqual({ odd: false, ranks: [30, 31] });
    expect(T(median([50, 51, 53, 54, 55, 56, 57, 58, 60], [11, 8, 12, 9, 6, 5, 2, 3, 1]))).toBe('53');
    expect(statText(median([54, 55, 56, 57, 58, 60], [12, 18, 10, 8, 9, 3]))).toBe('55,5');
    expect(T(valueAtRank([54, 55, 56], [12, 18, 10], 31))).toBe('56');
    expect(medianRanks(97).ranks).toEqual([49]);
  });
  it('تمرين 7 et le منوال', () => {
    const S = [4, 10, 8, 4, 3, 2, 4];
    expect([T(range(S)), T(median(S)), T(mean(S))]).toEqual(['8', '4', '5']);
    expect(TT(mode(S))).toEqual(['4']);
    expect(TT(mode([1, 1, 2, 2]))).toEqual(['1', '2']);
    expect(TT(mode([7, 8], [3, 5]))).toEqual(['8']);
  });
  it('تمرين 14 : deux villes sur un an', () => {
    const A = [-3, -7, -2, 10, 10, 20, 24, 28, 21, 11, 5, -3];
    const B = [6, 8, 10, 14, 16, 19, 20, 22, 17, 14, 8, 5];
    expect([statText(mean(A)), T(median(A)), T(range(A))]).toEqual(['9,5', '10', '35']);
    expect([statText(mean(B)), T(median(B)), T(range(B))]).toEqual(['13,25', '14', '17']);
    expect([T(min(A)), T(max(A))]).toEqual(['-7', '28']);
  });
  it('أؤكّد 3–6', () => {
    expect(T(median([8, 20, 40, 60]))).toBe('30');
    expect(statText(range(['8,1', '5,7', '3', '2,8']))).toBe('5,3');
    expect([T(mean([13, 1, 4, 10, 12])), T(median([13, 1, 4, 10, 12]))]).toEqual(['8', '10']);
  });
  it('expand ignore un effectif nul ; une série vide est refusée', () => {
    expect(TT(expand([1, 2, 3], [0, 2, 1]))).toEqual(['2', '2', '3']);
    expect(T(range([1, 2, 9], [0, 1, 1]))).toBe('7');
    expect(() => mean([], [])).toThrow();
    expect(() => medianRanks(0)).toThrow();
  });
});

describe('statistics — classes', () => {
  it('appartenance : [lo ; hi[ sauf la dernière, fermée', () => {
    const C = [klass(7, 8), klass(8, 9), klass(9, 10, true)];
    expect([classIndexOf(C, 7), classIndexOf(C, 8), classIndexOf(C, '9,99'), classIndexOf(C, 10), classIndexOf(C, 11)]).toEqual([0, 1, 2, 2, -1]);
    expect(classFreqs(C, [7, 7.5, 8, 9, 10])).toEqual([2, 1, 2]);
    expect(T(width(C[0]))).toBe('1');
    expect(medianClass([6, 1, 4])).toBe(0);
  });
  it('une médiane à cheval sur deux classes le dit', () => {
    expect(medianClass([2, 2])).toEqual({ between: [0, 1] });
  });
});

describe('statistics — raisonner sur des moyennes', () => {
  it('تحدّ : les deux classes ont la même moyenne 384/33', () => {
    const A = combineGroups([{ n: 15, mean: 10 }, { n: 18, mean: 13 }]);
    const B = combineGroups([{ n: 14, mean: '12,5' }, { n: 19, mean: 11 }]);
    expect(T(A)).toBe('128/11');
    expect(T(B)).toBe('128/11');
    expect(approx(A)).toBe('11,64');
  });
  it('أدمج تعلّماتي : la seconde valeur cachée vaut 28', () => {
    const V = [1, 2, 3, 4, 5, 6, 7, 11, 13, 14, 16, 26, 0, 32];
    const Fq = [11, 3, 2, 1, 2, 2, 1, 1, 1, 2, 1, 1, 1, 1];
    expect(total(Fq)).toBe(30);
    expect(medianRanks(30).ranks.map((k) => valueAtRank([1, 2, 3], [11, 3, 2], k)).map(T)).toEqual(['3', '3']);
    expect(T(solveValueForMean(V, Fq, 7, 12))).toBe('28');
  });
  it('أتعمّق 22 : N = 31', () => {
    expect(T(countFromRemoval('11,5', 19, '11,25'))).toBe('31');
  });
  it('تمرين 15 : angles du diagramme circulaire ; pourcentages', () => {
    expect(TT(pieAngles([60, 40, 50]))).toEqual(['144', '96', '120']);
    expect(T(percent('0,15'))).toBe('15');
  });
  it('écritures', () => {
    expect(statLatex(frac(33, 2))).toBe('16{,}5');
    expect(statLatex(frac(1816, 41))).toBe('\\dfrac{1816}{41}');
    expect(statText(frac(8, 49))).toBe('8/49');
    expect(approx(frac(1816, 41))).toBe('44,29');
    expect(approx(frac(30, 1))).toBe('30');
  });
});
