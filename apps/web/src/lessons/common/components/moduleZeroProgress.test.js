import { describe, it, expect } from 'vitest';
import { calculateCompletionPercentage, isValidModuleNumber } from '@smarter-academy/core';

/**
 * LE MODULE 0 EST UN MODULE.
 *
 * Deux leçons de l'unité 1 ouvrent sur « أستعدّ », numéroté 0. Pendant des
 * semaines leur progression n'a jamais été écrite : `ModuleLayout` gardait ses
 * quatre écritures derrière `if (lessonId && moduleNumber && …)`, et `0` est
 * falsy. La leçon plafonnait à 80 %, ne pouvait pas se terminer, et rien ne
 * le signalait — les suites e2e semaient `completed: ['0']` à la main, ce qui
 * masquait exactement le défaut.
 *
 * Ce fichier verrouille la DÉCISION du cœur : on valide la nature du numéro,
 * jamais sa vérité.
 */
describe('module 0 — la progression d’un module numéroté zéro', () => {
  it('le prédicat accepte 0 et refuse une absence de numéro', () => {
    expect(isValidModuleNumber(0)).toBe(true);
    expect(isValidModuleNumber('0')).toBe(true);
    expect(isValidModuleNumber(undefined)).toBe(false);
    expect(isValidModuleNumber(null)).toBe(false);
  });

  it('une leçon de 5 modules numérotés 0–4 atteint 100 %', () => {
    // Le symptôme visible du défaut : 4 modules sur 5 = 80 %, plafond
    // indépassable puisque le module 0 ne s’enregistrait jamais.
    expect(calculateCompletionPercentage(['1', '2', '3', '4'], 5)).toBe(80);
    expect(calculateCompletionPercentage(['0', '1', '2', '3', '4'], 5)).toBe(100);
  });
});
