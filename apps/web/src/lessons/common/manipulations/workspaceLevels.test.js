import { describe, it, expect } from 'vitest';
import { availableLevels, activeLevel, panelKey, stepLevel } from './workspaceLevels';

/**
 * Ce que ces tests verrouillent, et qui a une conséquence visible pour
 * l'élève : le défaut est TOUJOURS « مبتدئ », il y a TOUJOURS un niveau
 * actif, et changer de niveau ne remonte RIEN tant que la mathématique ne
 * change pas — sinon l'élève perd les équipes qu'il vient de former.
 */

const both = { beginner: () => null, advanced: () => null };

describe('availableLevels — un onglet seulement s’il a du contenu', () => {
  it('reconnaît les deux niveaux fournis, dans l’ordre', () => {
    expect(availableLevels(both)).toEqual(['beginner', 'advanced']);
  });

  it('n’offre pas d’onglet mort', () => {
    expect(availableLevels({ beginner: () => null })).toEqual(['beginner']);
    expect(availableLevels({ advanced: () => null })).toEqual(['advanced']);
    expect(availableLevels({})).toEqual([]);
    expect(availableLevels({ beginner: 'pas une fonction' })).toEqual([]);
  });
});

describe('activeLevel — jamais d’écran vide', () => {
  it('le défaut est le niveau débutant', () => {
    expect(activeLevel(both, undefined)).toBe('beginner');
  });

  it('un niveau inconnu retombe sur le débutant', () => {
    expect(activeLevel(both, 'expert')).toBe('beginner');
  });

  it('respecte le niveau demandé quand il existe', () => {
    expect(activeLevel(both, 'advanced')).toBe('advanced');
  });

  it('quand le niveau demandé n’est pas fourni, prend le premier disponible', () => {
    expect(activeLevel({ advanced: () => null }, 'beginner')).toBe('advanced');
  });

  it('sans aucun niveau, il n’y a rien à rendre', () => {
    expect(activeLevel({}, 'beginner')).toBeNull();
  });
});

describe('panelKey — l’état survit au changement de niveau, pas au changement de modèle', () => {
  it('la clé ne dépend pas du niveau actif : aller-retour sans remontage', () => {
    expect(panelKey('beginner', '15:3')).toBe(panelKey('beginner', '15:3'));
  });

  it('chaque niveau a sa propre clé — les deux panneaux coexistent', () => {
    expect(panelKey('beginner', '15:3')).not.toBe(panelKey('advanced', '15:3'));
  });

  it('changer de modèle mathématique REMONTE le panneau — réinitialisation voulue', () => {
    expect(panelKey('beginner', '15:3')).not.toBe(panelKey('beginner', '16:3'));
  });
});

describe('stepLevel — le clavier passe d’un niveau à l’autre, en boucle', () => {
  it('avance et revient', () => {
    expect(stepLevel(both, 'beginner', 1)).toBe('advanced');
    expect(stepLevel(both, 'advanced', -1)).toBe('beginner');
  });

  it('boucle aux extrémités plutôt que de bloquer', () => {
    expect(stepLevel(both, 'advanced', 1)).toBe('beginner');
    expect(stepLevel(both, 'beginner', -1)).toBe('advanced');
  });

  it('avec un seul niveau, reste sur place', () => {
    expect(stepLevel({ beginner: () => null }, 'beginner', 1)).toBe('beginner');
    expect(stepLevel({}, 'beginner', 1)).toBeNull();
  });
});
