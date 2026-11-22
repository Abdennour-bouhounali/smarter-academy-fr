import { describe, it, expect } from 'vitest';
import * as L from './teamBuilder';

describe('coachOf — la consigne du guide suit le geste réel de la manche (2026-11-07)', () => {
  it('manche au BOUTON, rien de posé : le guide montre « أنشئ الفرق », pas un glisser', () => {
    const step = L.coachOf(L.init({ total: 16, groups: 3 }), { button: true });
    expect(step).toMatchObject({ id: 'auto', gesture: 'tap', target: '[data-manipulation-autocomplete] button' });
  });
  it('manche à la main : le guide montre le premier joueur à glisser (inchangé)', () => {
    const step = L.coachOf(L.init({ total: 15, groups: 3 }));
    expect(step).toMatchObject({ id: 'place', gesture: 'drag' });
  });
});
