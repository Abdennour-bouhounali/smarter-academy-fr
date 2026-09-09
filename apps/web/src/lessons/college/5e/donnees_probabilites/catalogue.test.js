import { describe, it, expect } from 'vitest';
import { courseLevels } from '@smarter-academy/core';

/**
 * PORTE DE VISIBILITÉ (memory « lesson_visibility_gate »).
 *
 * Codée + routée + validée ≠ visible : c'est `status: 'available'` dans le
 * catalogue qui ouvre la carte, et c'est `path` qui la rend cliquable. Ce
 * test verrouille les deux, pour les deux leçons.
 */
const trouver = (id) => {
  const out = [];
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (n && typeof n === 'object') {
      if (n.id === id) out.push(n);
      Object.values(n).forEach(walk);
    }
  };
  walk(courseLevels);
  return out[0];
};

describe.each([
  ['statistiques-5e', '/courses/college/5e/donnees_probabilites/statistiques-5e', 7],
  ['probabilites-5e', '/courses/college/5e/donnees_probabilites/probabilites-5e', 6],
])('%s — porte de visibilité', (id, chemin, nbLP) => {
  const lecon = trouver(id);

  it('est présente dans le catalogue', () => {
    expect(lecon).toBeDefined();
  });

  it('est OUVERTE (status available), donc cliquable', () => {
    expect(lecon.status).toBe('available');
  });

  it('porte le chemin attendu, celui que App.jsx route', () => {
    expect(lecon.path).toBe(chemin);
  });

  it('déclare ses Learning Points', () => {
    expect(lecon.learningPoints).toHaveLength(nbLP);
    for (const lp of lecon.learningPoints) {
      expect(lp.id).toMatch(new RegExp(`^5e_${id}_P\\d+$`));
    }
  });
});
