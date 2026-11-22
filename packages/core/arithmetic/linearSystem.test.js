import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { frac, fracText } from './linear.js';
import {
  eq2, system, classify, holdsAt, pairHolds, isSolution, scale, addEqs, subEqs, eliminated,
  isolate, substitute, eliminationFactors, eqLatex, systemLatex, pairLatex, pairText, parseLinear2,
} from './linearSystem.js';

const T = (p) => fracText(p);
const solved = (s1, s2, vars) => {
  const r = classify(system(s1, s2, vars));
  return r.kind === 'unique' ? `(${T(r.x)} ; ${T(r.y)})` : r.kind;
};

describe('lecture des équations du manuel', () => {
  it.each([
    ['2(x - 5) = y - 3', [2, -1, 7]],
    ['x/6 - y = -1', ['1/6', -1, -1]],
    ['1/2x - y = -2', ['1/2', -1, -2]],
    ['3x = 2y', [3, -2, 0]],
    ['y = 3(x - 3)', [-3, 1, -9]],
    ['5y - 2 = 3(x - 1)', [-3, 5, -1]],
    ['-3(x - y) = 6', [-3, 3, 6]],
    ['3x - 2y = 4,2', [3, -2, '21/5']],
    ['−x + 3y = 2', [-1, 3, 2]],
  ])('%s', (src, [a, b, c]) => {
    const e = eq2(src);
    expect([T(e.a), T(e.b), T(e.c)]).toEqual([String(a), String(b), String(c)]);
  });

  it('autres noms d’inconnues : (a ; b), (d ; t)', () => {
    expect(eqLatex(eq2('3a - b/2 = 3', ['a', 'b']), ['a', 'b'])).toBe('3a - \\dfrac{1}{2}b = 3');
    expect(eqLatex(eq2('d + 50t = 280', ['d', 't']), ['d', 't'])).toBe('d + 50t = 280');
  });

  it('refuse ce qui n’est pas du premier degré, ou sans inconnue', () => {
    expect(() => eq2('xy = 3')).toThrow();
    expect(() => eq2('x(x + 1) = 2')).toThrow();
    expect(() => eq2('3 = 3')).toThrow();
    expect(() => eq2('x + y')).toThrow();
    expect(() => parseLinear2('2 / x')).toThrow();
  });
});

describe('les jumal du manuel (pp. 55–63) — mêmes couples que sympy dans extraction.json', () => {
  it.each([
    ['act-1', 'x + y = 32', '2(x - 5) = y - 3', '(13 ; 19)'],
    ['act-2', '2x + y = 7', '3x - 2y = 4,2', '(13/5 ; 9/5)'],
    ['act-2 Q2', 'x + 4y = 7', '5x + 3y = 1', '(-1 ; 2)'],
    ['act-3', 'x + y = 140', '300x + 150y = 30300', '(62 ; 78)'],
    ['طرائق (1)', '3x + y = -4', 'x - y = 2', '(-1/2 ; -5/2)'],
    ['طرائق (2)', '4x + 2y = 9', '-4x + 3y = 6', '(3/4 ; 3)'],
    ['دوري الآن 1', '2x + y = 6', '1/2x - y = -2', '(8/5 ; 14/5)'],
    ['دوري الآن 2', '6x - 2y = 8', 'x + 3y = 1', '(13/10 ; -1/10)'],
    ['ex-5 a', 'x + 3y = 10', '3x + 5y = 18', '(1 ; 3)'],
    ['ex-6 a', '2x - 3y = 1', '3x + 5y = 21', '(68/19 ; 39/19)'],
    ['ex-7 a', '-x + 3y = 2', '2x + y = 3', '(1 ; 1)'],
    ['ex-7 b', '5x + 4y = 16', '3x + 6y = 15', '(2 ; 3/2)'],
    ['ex-8 a', '2x - y = 1', '3x + 5y = 21', '(2 ; 3)'],
    ['ex-8 b', '3x + 7y = 11', '-5x + 2y = 5', '(-13/41 ; 70/41)'],
    ['ex-9 a', '-2x + y = 0', '3x - y = 4', '(4 ; 8)'],
    ['ex-9 b', 'x/6 - y = -1', '3x - 2y = 6', '(3 ; 3/2)'],
    ['ex-10 a', '3x = 2y', 'y = 3(x - 3)', '(6 ; 9)'],
    ['ex-10 b', 'x = y', '3x + 2y = 0', '(0 ; 0)'],
    ['ex-11 a', 'x + y = 12', '3x + 2y = 31', '(7 ; 5)'],
    ['ex-11 b', '4x - 3y = 1', '12x - y = -5', '(-1/2 ; -1)'],
    ['ex-11 c', '6x - 5y = 0', '2x - y = 12', '(15 ; 18)'],
    ['ex-12', 'x + 3y = 7', '5y - 2 = 3(x - 1)', '(19/7 ; 10/7)'],
    ['ex-13', 'x - 2y = 1', '-3(x - y) = 6', '(-5 ; -3)'],
    ['ex-22', '8x + 3y = 39,5', '7x + 9y = 50,5', '(4 ; 5/2)'],
    ['ex-23', '2x + y = 1', '-2x + 4y = -6', '(1 ; -1)'],
    ['QCM 5', '3x - y = -1', '3x + y = 5', '(2/3 ; 3)'],
    ['situation', '150x + 150y = 11250', '24x + 30y = 2100', '(25 ; 50)'],
    ['ex-31 (corrigé)', '6x + y = 720', 'x + y = 270', '(90 ; 180)'],
  ])('%s', (_id, s1, s2, want) => {
    expect(solved(s1, s2)).toBe(want);
  });

  it('inconnues nommées a, b et d, t', () => {
    expect(solved('3a + 2b = 0', '6a + 3b = -24', ['a', 'b'])).toBe('(-16 ; 24)');
    expect(solved('a - b = 6', '3a - b/2 = 3', ['a', 'b'])).toBe('(0 ; -6)');
    expect(solved('d = 90t', 'd + 50t = 280', ['d', 't'])).toBe('(180 ; 2)');
  });

  it('حالات خاصة : عدد غير منته من الحلول / ليس لها حلول', () => {
    expect(solved('4x + 6y = 2', '-2x - 3y = -1')).toBe('infinite');
    expect(solved('2x - y = 0', '-x + y/2 = -2')).toBe('none');
  });
});

describe('vérifier une ثنائية', () => {
  const s = system('x + y = 32', '2x - y = 7');
  it('act-1 : (13 ; 19) vérifie les deux, (24 ; 8) aucune', () => {
    expect(pairHolds(s, 13, 19)).toEqual([true, true]);
    expect(isSolution(s, 13, 19)).toBe(true);
    expect(pairHolds(system('x + y = 32', '2(x - 5) = y - 3'), 24, 8)).toEqual([true, false]);
  });
  it('know-2 : (2 ; 0) est un حل, (3 ; 1) vérifie (1) seulement, (0 ; 2) — l’ordre compte', () => {
    const k = system('x - y = 2', '2x - 5y = 4');
    expect(pairHolds(k, 2, 0)).toEqual([true, true]);
    expect(pairHolds(k, 3, 1)).toEqual([true, false]);
    expect(isSolution(k, 0, 2)).toBe(false);
  });
  it('ex-2 : des fractions et des décimaux', () => {
    expect(holdsAt(eq2('5x + 3y = 1'), '1/5', 0)).toBe(true);
    expect(holdsAt(eq2('5x + 3y = 1'), 0, '1/3')).toBe(true);
    expect(holdsAt(eq2('x - y = 2'), '0,5', '-1,5')).toBe(true);
    expect(holdsAt(eq2('3x + 5y = 1'), 1, -2)).toBe(false);
  });
});

describe('les gestes des méthodes', () => {
  it('التعويض (طرائق 1) : y = x − 2 puis 3x + (x − 2) = −4 → 4x = −2', () => {
    const iso = isolate(eq2('x - y = 2'), 'y');
    expect([T(iso.k), T(iso.m)]).toEqual(['1', '-2']);
    const one = substitute(eq2('3x + y = -4'), 'y', iso);
    expect([T(one.a), T(one.c)]).toEqual(['4', '-2']);
  });
  it('التعويض (التلميذ 1) : y = 7 − 2x dans 3x − 2y = 4,2 → 7x = 18,2', () => {
    const iso = isolate(eq2('2x + y = 7'), 'y');
    const one = substitute(eq2('3x - 2y = 4,2'), 'y', iso);
    expect([T(one.a), T(one.c)]).toEqual(['7', '91/5']);
  });
  it('isoler une inconnue de coefficient nul est impossible', () => {
    expect(isolate(eq2('x = 1/3'), 'y')).toBeNull();
    expect(T(isolate(eq2('x = 1/3'), 'x').m)).toBe('1/3');
  });
  it('الجمع (التلميذ 2) : (1) × 2 + (2) → 7x = 18,2', () => {
    const [e1, e2] = system('2x + y = 7', '3x - 2y = 4,2');
    expect(eliminationFactors(e1, e2, 'y')).toEqual([2, 1]);
    const sum = addEqs(scale(e1, 2), e2);
    expect(eliminated(sum)).toBe('y');
    expect(eqLatex(sum)).toBe('7x = \\dfrac{91}{5}');
  });
  it('الجمع (طرائق 2) : les coefficients de x sont déjà opposés', () => {
    const [e1, e2] = system('4x + 2y = 9', '-4x + 3y = 6');
    expect(eliminationFactors(e1, e2, 'x')).toEqual([1, 1]);
    expect(eqLatex(addEqs(e1, e2))).toBe('5y = 15');
  });
  it('الجمع (ex-8 b) : des deux côtés — × 5 et × 3', () => {
    const [e1, e2] = system('3x + 7y = 11', '-5x + 2y = 5');
    expect(eliminationFactors(e1, e2, 'x')).toEqual([5, 3]);
    expect(eliminated(addEqs(scale(e1, 5), scale(e2, 3)))).toBe('x');
  });
  it('soustraire, multiplier par 0 refusé, et le cas « 0 = 4 »', () => {
    const [e1, e2] = system('2x - y = 0', '2x - y = 4');
    expect(eliminated(subEqs(e1, e2))).toBe('both');
    expect(eqLatex(subEqs(e1, e2))).toBe('0 = -4');
    expect(() => scale(e1, 0)).toThrow();
  });
});

describe('écriture', () => {
  it('à la façon du manuel', () => {
    expect(eqLatex(eq2('2(x - 5) = y - 3'))).toBe('2x - y = 7');
    expect(eqLatex(eq2('-x + 3y = 2'))).toBe('-x + 3y = 2');
    expect(systemLatex(system('x + y = 32', '2x - y = 7'))).toBe('\\begin{cases} x + y = 32 \\\\ 2x - y = 7 \\end{cases}');
    expect(pairLatex(13, 19)).toBe('(13 ; 19)');
    expect(pairLatex(frac(-1, 2), frac(-5, 2))).toBe('\\left(-\\dfrac{1}{2} ; -\\dfrac{5}{2}\\right)');
    expect(pairText(frac(68, 19), frac(39, 19))).toBe('(68/19 ; 39/19)');
  });
});

describe('cohérence avec l’extraction du manuel (docs/sources/4am/unit5/extraction.json)', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const ex = JSON.parse(readFileSync(join(here, '../../../docs/sources/4am/unit5/extraction.json'), 'utf8'));
  const byId = Object.fromEntries(ex.elements.map((e) => [e.id, e]));
  // sympy écrit « \frac{13}{5} », « - \frac{1}{2} » : on compare des fractions.
  const read = (tex) => {
    const m = String(tex).replace(/\s/g, '').match(/^(-?)\\frac\{(\d+)\}\{(\d+)\}$/);
    return m ? `${m[1]}${m[2]}/${m[3]}` : String(tex).replace(/\s/g, '');
  };
  it('act-2, طرائق, دوري الآن : même couple exact', () => {
    const pairs = [
      [byId['act-2'].answer.c1, '2x + y = 7', '3x - 2y = 4,2'],
      [byId['method-example'].answer['1'], '3x + y = -4', 'x - y = 2'],
      [byId['method-example'].answer['2'], '4x + 2y = 9', '-4x + 3y = 6'],
      [byId['now-59'].answer['2'], '6x - 2y = 8', 'x + 3y = 1'],
    ];
    for (const [ans, s1, s2] of pairs) expect(solved(s1, s2)).toBe(`(${read(ans.x)} ; ${read(ans.y)})`);
  });
});
