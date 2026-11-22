import { describe, it, expect } from 'vitest';
import * as H from './halfLine.js';

describe('halfLine — le nombre sur un demi-droite gradué', () => {
  it('parse et text : virgule, point, somme, chiffres arabes-indiens', () => {
    expect(H.parse('2,4')).toBe(2400);
    expect(H.parse('2.4')).toBe(2400);
    expect(H.parse('٣')).toBe(3000);
    expect(H.parse('2+6/10')).toBe(2600);
    expect(H.parse('3+25/100')).toBe(3250);
    expect(H.parse('4,235')).toBe(4235);
    expect(H.parse('4,2355')).toBeNull();
    expect(H.parse('-1')).toBeNull();
    expect(H.parse('abc')).toBeNull();
    expect(H.parse('2+10/10')).toBeNull();
    expect(H.text(2400)).toBe('2,4');
    expect(H.text(3000)).toBe('3');
    expect(H.text(4235)).toBe('4,235');
    expect(H.text(50)).toBe('0,05');
    expect(H.isSum('2+6/10')).toBe(true);
    expect(H.isSum('2,6')).toBe(false);
  });
  it('les petites graduations : 10 par grande marque, chacune à step/10 ; encadrement exact', () => {
    const w = { from: 0, step: 1000 };
    expect(H.tickValue(w, 10)).toBe(1000);
    expect(H.tickValue(w, 24)).toBe(2400);
    expect(H.onTick(w, 2400)).toBe(true);
    expect(H.onTick(w, 2350)).toBe(false);
    expect(H.bracket(w, 2350)).toEqual({ i: 23, lo: 2300, hi: 2400, exact: false });
    expect(H.bracket(w, 2400)).toMatchObject({ i: 24, lo: 2400, exact: true });
    const c = { from: 4000, step: 100 };
    expect(H.tickValue(c, 1)).toBe(4010);
    expect(H.bracket(c, 4235)).toEqual({ i: 23, lo: 4230, hi: 4240, exact: false });
    expect(H.markValue(c, 3)).toBe(4300);
    expect(H.marksNeeded({ from: 0, step: 1000 }, 3100)).toBe(4);
    expect(H.marksNeeded({ from: 0, step: 1000 }, 3000)).toBe(3);
  });
  it('swapDigits : 2,4 → 4,2 ; seulement une décimale et un chiffre entier', () => {
    expect(H.swapDigits(2400)).toBe(4200);
    expect(H.swapDigits(3100)).toBe(1300);
    expect(H.swapDigits(3000)).toBe(300);
    expect(H.swapDigits(2350)).toBeNull();
    expect(H.swapDigits(10400)).toBeNull();
  });
});
