import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Le défaut que ce test verrouille : PyLab avait été copié depuis la leçon
 * « Variables et instructions » avec `seed = 2026`. Toutes les exécutions
 * partageaient donc la même graine — trois dés affichaient 1, 1, 1 à chaque
 * clic, et les deux simulations de 1 000 lancers du module 6 donnaient le même
 * compte. Or TOUTE la leçon repose sur le constat inverse.
 */
const SRC = fs.readFileSync(path.join(__dirname, 'PyLab.jsx'), 'utf8');

describe('PyLab — le hasard doit fluctuer', () => {
  it('ne fixe pas de graine par défaut', () => {
    expect(SRC).toMatch(/seed = null/);
    expect(SRC).not.toMatch(/seed = \d/);
  });

  it('tire une nouvelle graine à chaque exécution quand seed vaut null', () => {
    const run = SRC.slice(SRC.indexOf('const run = ()'), SRC.indexOf('const reset'));
    expect(run).toMatch(/seed === null/);
    expect(run).toMatch(/Math\.random|Date\.now/);
  });
});
