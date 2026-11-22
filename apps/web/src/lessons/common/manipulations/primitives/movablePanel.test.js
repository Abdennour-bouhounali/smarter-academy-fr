import { describe, it, expect } from 'vitest';
import { clampOffset, keyStep, readStored, writeStored } from './movablePanel';

const box = { left: 0, top: 0, right: 400, bottom: 300 };
const panel = { left: 10, top: 200, right: 110, bottom: 280 }; // 100 × 80, en bas à gauche

describe('panneau déplaçable — toujours entier dans la scène', () => {
  it('un décalage permis passe tel quel', () => {
    expect(clampOffset({ x: 50, y: -100 }, panel, box)).toEqual({ x: 50, y: -100 });
  });
  it('trop à droite / trop bas : borné au bord', () => {
    expect(clampOffset({ x: 999, y: 999 }, panel, box)).toEqual({ x: 290, y: 20 });
    expect(clampOffset({ x: -999, y: -999 }, panel, box)).toEqual({ x: -10, y: -200 });
  });
  it('un panneau plus grand que la scène est centré, jamais perdu', () => {
    const big = { left: 0, top: 0, right: 500, bottom: 100 };
    expect(clampOffset({ x: 80, y: 0 }, big, box).x).toBe(-50);
  });
  it('clavier : flèches 16 px, Maj 64 px, autres touches ignorées', () => {
    expect(keyStep('ArrowLeft')).toEqual({ x: -16, y: 0 });
    expect(keyStep('ArrowDown', true)).toEqual({ x: 0, y: 64 });
    expect(keyStep('a')).toBeNull();
  });
  it('mémoire par navigateur, sans exception quand le stockage manque', () => {
    expect(readStored(null, 7)).toBe(7);
    writeStored('sa-test', { x: 1 });
    expect(readStored('sa-test', null)).toEqual(globalThis.localStorage ? { x: 1 } : null);
  });
});
