import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { calculateCompletionPercentage, isValidModuleNumber } from '@smarter-academy/core';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '../../../..');
const read = (p) => readFileSync(resolve(webRoot, p), 'utf8');

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
 * Ce fichier interdit le retour du motif. Il ne teste pas le rendu (il n'y a
 * pas de bibliothèque DOM ici) : il verrouille la DÉCISION — on valide la
 * nature du numéro, jamais sa vérité.
 */
describe('module 0 — la progression d’un module numéroté zéro', () => {
  const layout = read('src/lessons/common/components/ModuleLayout.jsx');

  it('ModuleLayout ne garde plus aucune écriture derrière la vérité de moduleNumber', () => {
    // Le motif exact qui causait le défaut, sous ses deux ordres d'écriture.
    expect(layout).not.toMatch(/&&\s*moduleNumber\s*&&/);
    expect(layout).not.toMatch(/if\s*\(\s*lessonId\s*&&\s*moduleNumber\s*\)/);
  });

  it('ModuleLayout valide le numéro par isValidModuleNumber', () => {
    expect(layout).toMatch(/isValidModuleNumber/);
    // Les quatre sites d'écriture passent par le même prédicat calculé.
    expect(layout).toMatch(/const hasModuleNumber = isValidModuleNumber\(moduleNumber\)/);
    const guarded = layout.match(/hasModuleNumber/g) ?? [];
    // 1 déclaration + 4 gardes (visite, complétion, « suivant », « terminer »)
    // + 2 dépendances d'effet.
    expect(guarded.length).toBeGreaterThanOrEqual(5);
  });

  it('les deux écritures de progression sont bien celles gardées', () => {
    expect(layout).toMatch(/if \(lessonId && hasModuleNumber && unlocked && !presenting\)[\s\S]{0,80}markModuleVisited/);
    expect(layout).toMatch(/if \(lessonId && hasModuleNumber && isCompleted && unlocked && !presenting\)[\s\S]{0,90}markModuleCompleted/);
  });

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

  it('la carte du module 0 se lit terminée par son id OU son numéro', () => {
    // LessonIndex accepte les deux formes ('00' du config, '0' écrit par le
    // layout) — sans quoi la carte « أستعدّ » resterait grise une fois faite.
    const index = read('src/lessons/common/components/LessonIndex.jsx');
    expect(index).toMatch(/isModuleCompleted\(module\.id\)\s*\|\|\s*isModuleCompleted\(module\.number\?\.toString\(\)\)/);
  });
});
