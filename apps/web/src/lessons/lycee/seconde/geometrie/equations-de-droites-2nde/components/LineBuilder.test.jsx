import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Le défaut que ce test verrouille : `frozen = solved || success` retirait les
 * poignées, les steppers et le choix du point à l'instant même où l'élève
 * réussissait, et `move()` refusait tout déplacement ensuite. Or c'est APRÈS
 * avoir trouvé un couple (P, Q) que l'observation devient intéressante : un
 * AUTRE couple convient tout aussi bien, parce qu'une droite passe par une
 * infinité de points qui vérifient son équation.
 *
 * Règle du dépôt : une manipulation n'est jamais gelée après validation
 * (docs/architecture/INTERACTION_PEDAGOGY.md).
 */
const SRC = fs.readFileSync(path.join(__dirname, 'LineBuilder.jsx'), 'utf8');

describe('LineBuilder — jamais gelé après réussite', () => {
  it('ne calcule plus de drapeau « frozen »', () => {
    expect(SRC).not.toMatch(/const frozen\s*=/);
    expect(SRC).not.toMatch(/frozen \? null :/);
  });

  it('laisse move() déplacer les points même une fois résolu', () => {
    const move = SRC.slice(SRC.indexOf('const move = ('), SRC.indexOf('const showMe'));
    expect(move).not.toMatch(/if \(solved \|\| success\) return;/);
  });

  it('garde une poignée déplaçable en permanence', () => {
    expect(SRC).toMatch(/draggableId=\{active\}/);
  });
});
