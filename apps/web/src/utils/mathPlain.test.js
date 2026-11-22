import { describe, it, expect } from 'vitest';
import { latexToPlain, mathToPlain, hasMath } from './mathPlain';

const strip = (s) => s.replace(/[⁦-⁩]/g, '');

describe('mathToPlain — catalogue text readable without KaTeX', () => {
  it('turns the islands of the owner’s points to learn into Unicode', () => {
    expect(strip(mathToPlain('معرفة الترميز $x \\longmapsto ax + b$ .'))).toBe('معرفة الترميز x ⟼ ax + b .');
    expect(strip(mathToPlain('$a = \\dfrac{f(x_1) - f(x_2)}{x_1 - x_2}$'))).toBe('a = (f(x₁) - f(x₂))/(x₁ - x₂)');
    expect(strip(mathToPlain('بـ $t\\%$ بالضرب في $1 + \\dfrac{t}{100}$'))).toBe('بـ t% بالضرب في 1 + t/100');
    expect(strip(mathToPlain('$x \\longmapsto 0{,}5x$'))).toBe('x ⟼ 0,5x');
  });
  it('isolates each formula LTR and leaves no dollar or backslash', () => {
    const out = mathToPlain('$y = a \\times x$ و $\\sqrt{a^2} = a$');
    expect(out).toContain('⁦y = a × x⁩');
    expect(out).not.toMatch(/[$\\]/);
    expect(latexToPlain('10\\,^{\\circ}\\mathrm{C}')).toBe('10 °C');
  });
  it('detects math and passes plain text through', () => {
    expect(hasMath('الدالة $f$')).toBe(true);
    expect(hasMath('100 DA')).toBe(false);
    expect(mathToPlain('نص عادي')).toBe('نص عادي');
  });
});
