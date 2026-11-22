import { describe, it, expect } from 'vitest';
import { isStepLocked, canAdvance } from './stepUnlock';

/**
 * La porte d'une PARTIE, le pendant de moduleGate.test.js un cran plus bas.
 * Les deux modèles coexistent : l'élève suit sa progression, le lecteur en
 * navigation libre (enseignant, administration) ouvre tout.
 */
describe('isStepLocked — la porte d’une partie', () => {
  it('l’élève reste sous le verrou séquentiel de son module', () => {
    // La partie 1 n'est jamais verrouillée (pas de précédente).
    expect(isStepLocked(false, false)).toBe(false);
    // La partie N attend que la N-1 soit répondue.
    expect(isStepLocked(false, true)).toBe(true);
  });

  it('un module déjà terminé redevient un espace de révision libre', () => {
    expect(isStepLocked(true, true)).toBe(false);
  });

  it('la navigation libre (enseignant) ouvre toute partie, dans n’importe quel ordre', () => {
    // Cas B/D du cahier de recette : la partie 6 s'ouvre sans les parties 1-5.
    expect(isStepLocked(false, true, { freeNavigation: true })).toBe(false);
    expect(isStepLocked(false, false, { freeNavigation: true })).toBe(false);
  });

  it('présenter (وضع القسم) ouvre aussi la partie projetée', () => {
    expect(isStepLocked(false, true, { presenting: true })).toBe(false);
  });

  it('sans lecteur, le comportement historique de l’élève est inchangé', () => {
    // Cas G : l'élève ne gagne rien au passage — mêmes réponses qu'avant.
    expect(isStepLocked(false, true, {})).toBe(true);
    expect(isStepLocked(false, true, { freeNavigation: false, presenting: false })).toBe(true);
  });
});

describe('canAdvance — le geste « suivant »', () => {
  it('l’élève avance quand son module est terminé', () => {
    expect(canAdvance(false)).toBe(false);
    expect(canAdvance(true)).toBe(true);
  });

  it('l’enseignant avance toujours : sa navigation est structurelle', () => {
    // Cas E : la dernière partie du module 2 mène au module 3 sans le finir.
    expect(canAdvance(false, { freeNavigation: true })).toBe(true);
  });
});
