import { describe, it, expect } from 'vitest';
import { symbolsFor } from './mathSymbols';

const flat = (groups) => Object.fromEntries(groups.map((g) => [g.id, g.symbols]));

describe('symbolsFor — only the symbols the rule uses', () => {
  it('divisor definition: = ≠ × + and the letters a, b — nothing else', () => {
    const g = flat(symbolsFor(['a و b عددان طبيعيان حيث $b \\neq 0$. القول أن b قاسم للعدد a معناه أن باقي القسمة الإقليدية لـ a على b هو 0.', '$143 = 11 \\times 13 + 0$']));
    expect(g).toEqual({ arith: ['+', '×', '=', '≠'], letters: ['a', 'b'] });
  });

  it('reads strings inside React elements (MathText children, TextbookBox lines)', () => {
    const Box = () => null;
    const node = <div><Box lines={['$\\sqrt{a^2} = a$']} /><span>{'مع $a \\geq 0$'}</span></div>;
    expect(flat(symbolsFor(node))).toEqual({ arith: ['='], compare: ['≥'], powers: ['²', '√'], letters: ['a'] });
  });

  it('geometry rule: vectors and parallels, no arithmetic palette', () => {
    const g = flat(symbolsFor('إذا كان $\\overrightarrow{AB} = \\overrightarrow{DC}$ فإنّ (AB) ∥ (DC)'));
    expect(g.geometry).toEqual(['∥', '→']);
    expect(g.letters).toEqual(['A', 'B', 'C', 'D']);
  });

  it('ignores parentheses of Arabic prose, keeps mathematical ones', () => {
    expect(flat(symbolsFor('قاسم عدد طبيعي (بالباقي): $b \\neq 0$'))).toEqual({ arith: ['≠'], letters: ['b'] });
    expect(flat(symbolsFor('$2(x + 3) = 2x + 6$')).powers).toEqual(['(', ')']);
  });

  it('PGCD / PPCM are words, never split into point letters (2026-10-06)', () => {
    const g = flat(symbolsFor(['إذا كان $\\mathrm{PGCD}(a\\ ;\\ b) = 1$ فإنّ الكسر $\\frac{a}{b}$ غير قابل للاختزال', 'PGCD(a ; b) = b']));
    expect(g.letters).toEqual(['a', 'b']);
  });

  it('a rule without mathematics gets no palette at all', () => {
    expect(symbolsFor('المدى هو الفرق بين أكبر قيمة وأصغر قيمة')).toEqual([]);
  });
});
