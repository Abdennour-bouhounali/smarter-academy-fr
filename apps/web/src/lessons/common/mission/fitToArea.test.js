import { describe, it, expect } from 'vitest';
import { fitFactor, MIN_FIT, keepInPlace, uniformZoom, UNIFORM_MAX, shrunkALot } from './FitToArea';

describe('fitFactor — a page shrinks to fit, never below readability', () => {
  it('leaves content that fits at full size', () => {
    expect(fitFactor(500, 600)).toBe(1);
    expect(fitFactor(0, 600)).toBe(1);
  });
  it('shrinks just enough, rounded down to the hundredth', () => {
    expect(fitFactor(800, 600)).toBe(0.75);
    expect(fitFactor(1000, 667)).toBe(0.66);
  });
  it('never goes below MIN_FIT (the player then lets that one area scroll)', () => {
    expect(fitFactor(3000, 600)).toBe(MIN_FIT);
  });
});

describe('keepInPlace — un écran posé ne bouge plus (propriétaire, 2026-11-04)', () => {
  it('le nouveau contenu tient sous le haut actuel : ni la place ni la taille ne changent', () => {
    expect(keepInPlace({ natural: 400, zoom: 1.5, pad: 100, height: 800 })).toEqual({ zoom: 1.5, pad: 100 });
  });
  it('il ne tient plus en bas : on remonte juste assez, la taille du texte reste', () => {
    // 500 × 1,5 = 750 : il faut remonter à 800 − 750 = 50
    expect(keepInPlace({ natural: 500, zoom: 1.5, pad: 100, height: 800 })).toEqual({ zoom: 1.5, pad: 50 });
  });
  it('il ne tient plus du tout : dernier recours, on réduit, collé en haut', () => {
    expect(keepInPlace({ natural: 1000, zoom: 1.5, pad: 100, height: 800 })).toEqual({ zoom: 0.8, pad: 0 });
    // le moins possible : 800 / 600 = 1,33, pas 1
    expect(keepInPlace({ natural: 600, zoom: 1.5, pad: 0, height: 800 })).toEqual({ zoom: 1.33, pad: 0 });
  });
  it('jamais d’agrandissement quand le contenu diminue', () => {
    expect(keepInPlace({ natural: 200, zoom: 1.2, pad: 300, height: 800 })).toEqual({ zoom: 1.2, pad: 300 });
  });
});

describe('uniformZoom — une taille pour toute la leçon (propriétaire, 2026-11-04)', () => {
  it('ne dépend que de l’écran : la colonne de lecture et la hauteur de référence', () => {
    expect(uniformZoom(1806, 760)).toBe(1.35);
    expect(uniformZoom(1318, 600)).toBe(1.05);
  });
  it('jamais sous 1 ni au-dessus de UNIFORM_MAX, par pas de 0,05', () => {
    expect(uniformZoom(900, 500)).toBe(1);
    expect(uniformZoom(4000, 2000)).toBe(UNIFORM_MAX);
    expect(uniformZoom(0, 0)).toBe(1);
  });
});

describe('shrunkALot — un écran posé qui a beaucoup rétréci se ré-ajuste une fois (2026-11-07)', () => {
  it('sous 70 % de la hauteur : oui ; au-dessus : non (les petits changements ne bougent rien)', () => {
    expect(shrunkALot({ natural: 700, zoom: 0.63, height: 775 })).toBe(true);
    expect(shrunkALot({ natural: 700, zoom: 1, height: 775 })).toBe(false);
    expect(shrunkALot({ natural: 0, zoom: 1, height: 775 })).toBe(false);
  });
});
