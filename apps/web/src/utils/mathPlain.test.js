import { describe, it, expect } from 'vitest';
import { latexToPlain, mathToPlain, hasMath } from './mathPlain';

const strip = (s) => s.replace(/[⁦-⁩]/g, '');

describe('mathToPlain — catalogue text readable without KaTeX', () => {
  it('turns the islands of the owner’s points to learn into Unicode', () => {
    expect(strip(mathToPlain('Connaître la notation $x \\longmapsto ax + b$ .'))).toBe('Connaître la notation x ⟼ ax + b .');
    expect(strip(mathToPlain('$a = \\dfrac{f(x_1) - f(x_2)}{x_1 - x_2}$'))).toBe('a = (f(x₁) - f(x₂))/(x₁ - x₂)');
    expect(strip(mathToPlain('de $t\\%$ en multipliant par $1 + \\dfrac{t}{100}$'))).toBe('de t% en multipliant par 1 + t/100');
    expect(strip(mathToPlain('$x \\longmapsto 0{,}5x$'))).toBe('x ⟼ 0,5x');
  });
  it('isolates each formula LTR and leaves no dollar or backslash', () => {
    const out = mathToPlain('$y = a \\times x$ et $\\sqrt{a^2} = a$');
    expect(out).toContain('⁦y = a × x⁩');
    expect(out).not.toMatch(/[$\\]/);
    expect(latexToPlain('10\\,^{\\circ}\\mathrm{C}')).toBe('10 °C');
  });
  it('detects math and passes plain text through', () => {
    expect(hasMath('La fonction $f$')).toBe(true);
    expect(hasMath('100 €')).toBe(false);
    expect(mathToPlain('Texte ordinaire')).toBe('Texte ordinaire');
  });
});
