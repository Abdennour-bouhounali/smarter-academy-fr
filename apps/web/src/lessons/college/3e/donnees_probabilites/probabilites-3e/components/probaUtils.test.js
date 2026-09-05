import { describe, it, expect } from 'vitest';
import { makeRng } from '@smarter-academy/core';
import {
  ZERO, ZERO_SUMS, FACES, SUMS, MAX_TOTAL, TAIL, appendTail, sessionSeed, fairWeights, loadedWeights, probabilities, rollMany,
  afterStreak, totalOf, frequencies, pct, formatPct, leaders, laggards, spreadPoints, faceList,
  simplify, equalFractions, fracLatex, fracText, eventProbability, eventFrequency, eventCount,
  sameSet, complementFaces, bagTotal, bagProbability, scaleBag, drawMany, expectedCount,
  sumCells, sumProbabilities, rollTwoMany, cellsWhere, scaleMax, barsGeometry, CHART, textWidth,
} from './probaUtils';

describe('le dé : modèle et expérience', () => {
  it('un dé équilibré a six probabilités exactes de 1/6, somme 1', () => {
    const p = probabilities(fairWeights());
    expect(p).toHaveLength(6);
    p.forEach((x) => expect(x).toBe(1 / 6));
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
  });

  it('un dé truqué met la face alourdie à 3/8 et les autres à 1/8', () => {
    const p = probabilities(loadedWeights(6));
    expect(p[5]).toBe(3 / 8);
    expect(p[0]).toBe(1 / 8);
    expect(loadedWeights(null)).toEqual(fairWeights());
  });

  it('rollMany est pur, rejouable, et ses effectifs somment au nombre de lancers', () => {
    const a = rollMany(ZERO, 1000, makeRng(7));
    const b = rollMany(ZERO, 1000, makeRng(7));
    expect(a.counts).toEqual(b.counts);
    expect(totalOf(a.counts)).toBe(1000);
    expect(ZERO).toEqual([0, 0, 0, 0, 0, 0]);
    expect(FACES).toContain(a.last);
    expect(a.tail).toHaveLength(TAIL);
    expect(a.tail[TAIL - 1]).toBe(a.last);
    expect(rollMany(ZERO, 3, makeRng(1)).tail).toHaveLength(3);
    expect(appendTail([1, 2, 3], [4, 5])).toEqual([1, 2, 3, 4, 5]);
    expect(appendTail(Array(TAIL).fill(6), [1])).toHaveLength(TAIL);
  });

  it('la graine de session est déterministe quand un test la fixe, et jamais nulle', () => {
    globalThis.window = { __SMARTER_RNG_SEED: 5 };
    expect(sessionSeed(100)).toBe(105);
    delete globalThis.window;
    expect(sessionSeed(100)).toBeGreaterThan(0);
  });

  it('sur 6 000 lancers, chaque fréquence est à moins de 3 points de 1/6', () => {
    const { counts } = rollMany(ZERO, 6000, makeRng(20260904));
    frequencies(counts).forEach((f) => expect(Math.abs(f - 1 / 6)).toBeLessThan(0.03));
  });

  it('les fréquences sont exactes (somme 1) et seuls pct/formatPct arrondissent', () => {
    const fr = frequencies([1, 2, 3, 4, 5, 6]);
    expect(fr.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    expect(fr[0]).toBe(1 / 21);
    expect(pct(1 / 6)).toBe(16.7);
    expect(formatPct(1 / 6, 1000)).toBe('16,7 %');
    expect(formatPct(0, 0)).toBe('—');
  });

  it('leaders / laggards renvoient toutes les faces à égalité, vide sans lancer', () => {
    expect(leaders(ZERO)).toEqual([]);
    expect(leaders([3, 5, 5, 1, 0, 2])).toEqual([2, 3]);
    expect(laggards([3, 5, 5, 1, 0, 2])).toEqual([5]);
    expect(leaders([1, 1, 5], SUMS.slice(0, 3))).toEqual([4]);
    expect(faceList([2, 3, 5])).toBe('2, 3 et 5');
    expect(spreadPoints([50, 50, 50, 50, 50, 50])).toBe(0);
    expect(spreadPoints(ZERO)).toBeNull();
  });

  it("après trois 6 de suite, le lancer suivant se répartit comme n'importe quel lancer", () => {
    const { counts, rolls } = afterStreak(makeRng(42), 6, 3, 300);
    expect(totalOf(counts)).toBe(300);
    expect(rolls).toBeGreaterThan(300 * 4);
    frequencies(counts).forEach((f) => expect(Math.abs(f - 1 / 6)).toBeLessThan(0.08));
  });
});

describe('fractions et événements', () => {
  it('simplify réduit, normalise le signe et traite 0', () => {
    expect(simplify(3, 6)).toEqual({ num: 1, den: 2 });
    expect(simplify(0, 6)).toEqual({ num: 0, den: 1 });
    expect(simplify(6, 6)).toEqual({ num: 1, den: 1 });
    expect(equalFractions({ num: 2, den: 8 }, { num: 1, den: 4 })).toBe(true);
    expect(fracLatex(3, 6)).toBe('\\frac{1}{2}');
    expect(fracLatex(6, 6)).toBe('1');
    expect(fracText(2, 36)).toBe('1/18');
  });

  it("un événement est un ensemble de faces : P(pair) = 1/2, P(vide) = 0, P(tout) = 1", () => {
    expect(eventProbability([2, 4, 6])).toBe(0.5);
    expect(eventProbability([])).toBe(0);
    expect(eventProbability(FACES)).toBe(1);
    expect(eventProbability([6], loadedWeights(6))).toBe(3 / 8);
    expect(complementFaces([2, 4, 6])).toEqual([1, 3, 5]);
    expect(sameSet([2, 4, 6], [6, 4, 2])).toBe(true);
    expect(sameSet([2, 4], [2, 4, 6])).toBe(false);
  });

  it("la fréquence d'un événement cumule ses faces", () => {
    const counts = [10, 20, 30, 40, 50, 50];
    expect(eventCount(counts, [5, 6])).toBe(100);
    expect(eventFrequency(counts, [5, 6])).toBe(0.5);
    expect(eventFrequency(ZERO, [1])).toBe(0);
  });
});

describe('le sac de billes', () => {
  it('P(couleur) = billes de la couleur ÷ total, inchangée quand on double le sac', () => {
    const bag = { rouge: 2, bleu: 4, vert: 2 };
    expect(bagTotal(bag)).toBe(8);
    expect(bagProbability(bag, 'rouge')).toBe(0.25);
    expect(bagProbability(scaleBag(bag, 2), 'rouge')).toBe(0.25);
    expect(bagProbability({ rouge: 0, bleu: 0, vert: 0 }, 'rouge')).toBeNull();
  });

  it('200 tirages avec remise : effectifs somment à 200, rouge proche de P × 200', () => {
    const bag = { rouge: 2, bleu: 4, vert: 2 };
    const { counts } = drawMany(bag, 200, makeRng(3));
    expect(counts.rouge + counts.bleu + counts.vert).toBe(200);
    expect(Math.abs(counts.rouge - expectedCount(0.25, 200))).toBeLessThan(25);
    expect(drawMany({ rouge: 0, bleu: 0, vert: 0 }, 5, makeRng(1)).last).toBeNull();
  });
});

describe('deux dés', () => {
  it('la somme 7 a 6 cases sur 36, la somme 2 une seule, les 11 probabilités somment à 1', () => {
    expect(sumCells(7)).toHaveLength(6);
    expect(sumCells(2)).toEqual([[1, 1]]);
    expect(sumCells(12)).toEqual([[6, 6]]);
    expect(sumCells(13)).toEqual([]);
    const p = sumProbabilities();
    expect(p[5]).toBe(1 / 6);
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    expect(cellsWhere((a, b) => a + b >= 10)).toHaveLength(6);
  });

  it('rollTwoMany : 1 000 lancers, la somme 7 domine, 1 000 effectifs au total', () => {
    const { counts, last } = rollTwoMany(ZERO_SUMS, 1000, makeRng(11));
    expect(totalOf(counts)).toBe(1000);
    expect(leaders(counts, SUMS)).toContain(7);
    expect(last).toHaveLength(2);
  });
});

describe("sécurité d'affichage des barres", () => {
  const extremes = [
    ZERO, [1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, MAX_TOTAL], [500, 500, 500, 500, 500, 500],
    [1, 99999, 1, 1, 1, 1], ZERO_SUMS, [0, 0, 0, 0, 0, 1000, 0, 0, 0, 0, 0],
    Array.from({ length: 11 }, () => 999),
  ];
  const theories = [null, probabilities(fairWeights()), probabilities(loadedWeights(1)), sumProbabilities()];

  it('aucune barre ni étiquette ne sort du cadre, quel que soit le modèle', () => {
    for (const counts of extremes) {
      for (const theory of theories) {
        if (theory && theory.length !== counts.length) continue;
        const { bars } = barsGeometry(counts, theory);
        for (const b of bars) {
          expect(b.y).toBeGreaterThanOrEqual(CHART.TOP - 1e-9);
          expect(b.h).toBeGreaterThanOrEqual(0);
          expect(b.labelY).toBeGreaterThan(0);
          expect(b.labelY).toBeLessThanOrEqual(CHART.BASE);
          if (b.tick !== null) {
            expect(b.tick).toBeGreaterThanOrEqual(CHART.TOP - 1e-9);
            expect(b.tick).toBeLessThanOrEqual(CHART.BASE + 1e-9);
          }
          expect(textWidth(b.label)).toBeLessThan(b.col);
          expect(b.x).toBeGreaterThanOrEqual(0);
          expect(b.x + b.barW).toBeLessThanOrEqual(CHART.W);
        }
      }
    }
  });

  it("l'échelle contient la barre et le repère les plus hauts", () => {
    expect(scaleMax([0, 0, 0, 0, 0, 12], probabilities(loadedWeights(1)))).toBeGreaterThanOrEqual(12);
    expect(scaleMax(ZERO)).toBe(1);
    expect(scaleMax([100, 0, 0, 0, 0, 0], probabilities(loadedWeights(1)))).toBe(100);
  });
});
