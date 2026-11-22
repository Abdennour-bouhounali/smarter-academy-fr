import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique ENTIÈRE ─────────────────────────────────────────────────────
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const div = (a, b) => ({ q: Math.floor(a / b), r: a % b });

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, k) => PROBLEM[id].parts[part].steps.filter((st) => st.kind === 'choice')[k];
const correctOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options[s.correct]; };

// ── Expressions en x : DEUX lectures indépendantes du même texte TeX ────────
// 1) le polynôme DÉVELOPPÉ (coefficients entiers, [c0, c1, c2, …]) ;
// 2) la VALEUR numérique pour un x donné.
// Une factorisation est juste ⇔ mêmes polynômes, et on le recoupe par les
// valeurs en plusieurs x (consigne du lead : « re-expanding AND evaluation »).
const trim = (p) => { const q = p.slice(); while (q.length > 1 && q.at(-1) === 0) q.pop(); return q; };
const POLY = {
  num: (n) => [n],
  x: () => [0, 1],
  add: (a, b) => trim(Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0))),
  neg: (a) => a.map((c) => -c),
  // Division seulement par une CONSTANTE qui divise exactement chaque coefficient.
  div: (a, b) => { if (b.length !== 1 || a.some((c) => c % b[0] !== 0)) throw new Error('division inexacte'); return a.map((c) => c / b[0]); },
  mul: (a, b) => { const out = Array(a.length + b.length - 1).fill(0); a.forEach((u, i) => b.forEach((v, j) => { out[i + j] += u * v; })); return trim(out); },
};
const VALUE = (x) => ({ num: (n) => n, x: () => x, add: (a, b) => a + b, neg: (a) => -a, mul: (a, b) => a * b, div: (a, b) => a / b });

/** TeX → valeur dans l'algèbre `A` ; null si le texte n'est pas une expression en x (lettre a, b, S, PGCD…). */
function parse(src, A) {
  const s = src
    .replace(/\\,[a-z]+(\^2)?/g, '') // unités : \,m, \,cm, \,m^2
    .replace(/\\left|\\right/g, '').replace(/\{,\}/g, '.')
    .replace(/\\times|\\cdot/g, '*').replace(/\\div/g, '/').replace(/\s+/g, '');
  let i = 0;
  const peek = (t) => s.startsWith(t, i);
  const eat = (t) => { if (!peek(t)) throw new Error(`attendu ${t} dans ${s}`); i += t.length; };
  const primary = () => {
    if (peek('(')) { i++; const v = sum(); eat(')'); return v; }
    if (peek('[')) { i++; const v = sum(); eat(']'); return v; }
    if (peek('{')) { i++; const v = sum(); eat('}'); return v; }
    if (peek('x')) { i++; return A.x(); }
    const m = /^\d+/.exec(s.slice(i));
    if (!m) throw new Error(`jeton inattendu dans ${s} @${i}`);
    i += m[0].length;
    return A.num(Number(m[0]));
  };
  const power = () => {
    let v = primary();
    while (peek('^')) {
      i++;
      const m = /^\{?(\d+)\}?/.exec(s.slice(i));
      if (!m) throw new Error('exposant');
      i += m[0].length;
      let p = A.num(1);
      for (let k = 0; k < Number(m[1]); k++) p = A.mul(p, v);
      v = p;
    }
    return v;
  };
  const unary = () => (peek('-') ? (i++, A.neg(unary())) : power());
  const startsFactor = () => peek('(') || peek('[') || peek('x') || /^\d/.test(s.slice(i));
  const prod = () => {
    let v = unary();
    for (;;) {
      if (peek('*')) { i++; v = A.mul(v, unary()); } else if (peek('/')) { i++; v = A.div(v, unary()); } else if (startsFactor()) v = A.mul(v, power()); else break;
    }
    return v;
  };
  function sum() {
    let v = prod();
    while (peek('+') || peek('-')) { const op = s[i++]; const w = prod(); v = A.add(v, op === '+' ? w : A.neg(w)); }
    return v;
  }
  try { const v = sum(); return i === s.length ? v : null; } catch { return null; }
}
const poly = (t) => parse(t, POLY);
const polyEq = (a, b) => JSON.stringify(trim(a)) === JSON.stringify(trim(b));
const SAMPLES = [-3, 0, 1, 2, 3, 6, 11, 12];
/** Les deux lectures : polynômes égaux, et valeurs égales en chaque x de SAMPLES. */
const sameExpr = (a, b) => {
  const [pa, pb] = [poly(a), poly(b)];
  if (!pa || !pb) throw new Error(`illisible : ${a} | ${b}`);
  const byValue = SAMPLES.every((x) => parse(a, VALUE(x)) === parse(b, VALUE(x)));
  expect(polyEq(pa, pb), `développement : ${a} vs ${b}`).toBe(byValue);
  return byValue;
};

/**
 * Chaque formule $…$ : membres « = » égaux (polynômes ET valeurs), « \neq »
 * différents. Les formules avec <, > ou une lettre autre que x sont ignorées
 * membre par membre. Retourne le nombre de vérifications.
 */
function checkFormula(f, where) {
  if (/[<>]/.test(f)) return 0;
  if (/^\s*x\s*=\s*\d+\s*$/.test(f)) return 0; // une hypothèse « x = 6 », pas une égalité à vérifier
  let checked = 0;
  if (f.includes('\\neq')) {
    const [a, b] = f.split('\\neq');
    if (poly(a) && poly(b)) { expect(sameExpr(a, b), `${where}: ${f}`).toBe(false); checked++; }
    return checked;
  }
  const sides = f.split('=').filter((t) => poly(t));
  for (const t of sides.slice(1)) { expect(sameExpr(t, sides[0]), `${where}: ${f}`).toBe(true); checked++; }
  return checked;
}
const formulas = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const checkText = (text, where) => formulas(text).reduce((t, f) => t + checkFormula(f, where), 0);
const allTexts = (p) => [p.statement, ...p.data.map((d) => d.text), ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
/** « $A = B$ » seul dans une option → [A, B]. */
const eqOption = (o) => { const f = formulas(o); return f.length === 1 && o.trim() === `$${f[0]}$` && f[0].split('=').length === 2 ? f[0].split('=') : null; };
const bare = (o) => { const f = formulas(o); return f.length === 1 && o.trim() === `$${f[0]}$` ? f[0] : null; };

describe('le vérificateur d\'expressions', () => {
  it('expands, evaluates, and refuses a wrong factorisation (mutation)', () => {
    expect(sameExpr('10x^2 + 15x', '5x(2x + 3)')).toBe(true);
    expect(sameExpr('(2x + 3)(x + 5) - (x + 5)^2', '(x + 5)(x - 2)')).toBe(true);
    expect(sameExpr('(x + 5)[(2x + 3) - (x + 5)]', '(x + 5)(x - 2)')).toBe(true);
    expect(sameExpr('10 \\times 6^2 + 15 \\times 6', '450')).toBe(true);
    expect(sameExpr('(2x + 3)(x + 5) - (x + 5)^2', '(x + 5)(x + 8)')).toBe(false);
    expect(poly('a^2 + 2ab + b^2')).toBeNull();
    expect(poly('S')).toBeNull();
    // Une coquille dans une ligne est attrapée.
    expect(() => checkFormula('x^2 + 18x + 81 = (x + 8)^2', 'mutation')).toThrow();
    expect(() => checkFormula('24 \\times 450 = 10080', 'mutation')).toThrow();
    expect(() => checkFormula('80 \\div 20 = 5', 'mutation')).toThrow();
    expect(() => checkFormula('88 \\neq 88', 'mutation')).toThrow();
    expect(checkFormula('x = 6', 'hypothèse')).toBe(0);
  });
});

describe('les مسائل du درس « تحليل عبارة جبرية »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [5, '05', 'masala-1', 'practice_lab', 8], [6, '06', 'masala-2', 'practice_lab', 8], [7, '07', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(79);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('data: useful items, and at least one useless item that is a number', () => {
    for (const p of PROBLEMS) {
      expect(p.data.filter((d) => d.useful).length).toBeGreaterThanOrEqual(4);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text.includes('$'), `${p.id} ${d.id}`).toBe(false);
    }
  });

  it('no bare formula in the Arabic prose — every x², a/b or \\command is in $…$', () => {
    for (const p of PROBLEMS) for (const t of [p.statement, ...allTexts(p).slice(1 + p.data.length)]) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\\[a-z]|\d\s*\/\s*\d|\^|²|\bx\b/);
    }
  });

  it('every written equality (explain, prompts, solution lines, correct options, statement) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
    }));
    for (const p of PROBLEMS) checked += checkText(p.statement, `${p.id} statement`);
    expect(checked).toBeGreaterThan(60);
  });

  it('in an equality choice, the correct equality is true and every distractor equality is false', () => {
    let seen = 0;
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) {
      if (s.kind !== 'choice') continue;
      s.options.forEach((o, k) => {
        const eq = eqOption(o);
        if (!eq || !poly(eq[0]) || !poly(eq[1])) return;
        expect(sameExpr(eq[0], eq[1]), `${p.id} ${part.label}: ${o}`).toBe(k === s.correct);
        seen++;
      });
    }
    expect(seen).toBe(3 * 4); // 10x² + 15x = …, x² + 18x + 81 = …, (x − 5)² = …
  });

  it('مسألة 1 — the numbers and the factorisation are computed, not typed', () => {
    const [squares, strips, x, fencePrice] = [10, 15, 6, 1500];
    const area = `${squares}x^2 + ${strips}x`;
    // 1) l'aire, le PGCD, les rangées.
    expect(correctOf('masala-1', 0, 0)).toBe(`$${area}$`);
    PROBLEM['masala-1'].parts[0].steps[1].options.slice(1).forEach((o) => expect(sameExpr(bare(o), area), o).toBe(false));
    const g = gcd(squares, strips);
    expect(expectedOf('masala-1', 0)).toEqual([g, g, squares / g, strips / g]);
    expect(correctOf('masala-1', 0, 1)).toBe(`$${area} = ${g}x(${squares / g}x + ${strips / g})$`);
    // 2) 3 rangées : reste non nul ; 5(2x² + 3x) juste mais incomplet (x divise encore le facteur).
    const { r } = div(squares, 3);
    expect(r).toBeGreaterThan(0);
    expect(strips % 3).toBe(0); // le piège : 3 divise 15
    expect(expectedOf('masala-1', 1)).toEqual([r]);
    const amine = `${g}(${squares / g}x^2 + ${strips / g}x)`;
    expect(sameExpr(amine, area)).toBe(true);
    expect(poly(`${squares / g}x^2 + ${strips / g}x`)[0]).toBe(0); // terme constant nul : x est encore facteur commun
    expect(gcd(squares / g, strips / g)).toBe(1); // et plus aucun facteur numérique
    expect(correctOf('masala-1', 1, 1)).toBe('$10x^2 + 15x$');
    // 3) x = 6 : 450 m², 30 m × 15 m, 90 m, 135000 دج.
    const A = squares * x * x + strips * x;
    const [L, W] = [g * x, (squares / g) * x + strips / g];
    expect(L * W).toBe(A);
    expect(parse(area, VALUE(x))).toBe(A);
    const P = 2 * (L + W);
    expect(expectedOf('masala-1', 2)).toEqual([A, L, W, P, P * fencePrice]);
  });

  it('مسألة 2 — the numbers and the factorisations are computed, not typed', () => {
    const [x, cartonL, cartonW, layers, price] = [11, 80, 60, 2, 450];
    const family = 'x^2 + 18x + 81';
    const school = 'x^2 - 25';
    // 1) 81 = 9², 18x = 2 × x × 9 → (x + 9)² ; côté x + 9.
    expect(expectedOf('masala-2', 0)).toEqual([9, 9]);
    expect(sameExpr(family, '(x + 9)^2')).toBe(true);
    expect(correctOf('masala-2', 0, 1)).toBe(`$${family} = (x + 9)^2$`);
    const side = choiceOf('masala-2', 0, 2);
    side.options.forEach((o, k) => expect(sameExpr(`(${bare(o)})^2`, family), o).toBe(k === side.correct));
    // 2) (x + 5)(x − 5) ; (x − 5)² ≠ ; différence 10(x − 5).
    const dims = choiceOf('masala-2', 1, 1);
    dims.options.forEach((o, k) => {
      const [a, b] = formulas(o);
      expect(sameExpr(`(${a})(${b})`, school), o).toBe(k === dims.correct);
    });
    expect(sameExpr('(x - 5)^2', school)).toBe(false);
    const diff = `(${school}) - (x - 5)^2`;
    const d = choiceOf('masala-2', 1, 4);
    d.options.forEach((o, k) => expect(sameExpr(bare(o), diff), o).toBe(k === d.correct));
    expect(parse(diff, VALUE(x))).toBeGreaterThan(0); // la boîte proposée est plus PETITE (x > 5)
    // 3) x = 11 : côté 20, 400 cm², 4 × 3 = 12 par couche, 24 par carton, 10800 دج.
    const s = x + 9;
    expect(parse(family, VALUE(x))).toBe(s * s);
    expect([cartonL % s, cartonW % s]).toEqual([0, 0]);
    const perLayer = (cartonL / s) * (cartonW / s);
    expect(expectedOf('masala-2', 2)).toEqual([s, s * s, cartonL / s, cartonW / s, perLayer, perLayer * layers, perLayer * layers * price]);
    expect(parse(school, VALUE(x))).toBe((x + 5) * (x - 5)); // 96, cité dans l'explication
  });

  it('مسألة 3 — the numbers and the factorisation are computed, not typed', () => {
    const [x, xTest, price] = [12, 3, 1100];
    const S = '(2x + 3)(x + 5) - (x + 5)^2';
    // 1) S = (x + 5)(x − 2) ; l'erreur de signe donne (x + 5)(x + 8).
    expect(correctOf('masala-3', 0, 0)).toBe(`$S = ${S}$`);
    const second = choiceOf('masala-3', 0, 2);
    second.options.forEach((o, k) => expect(sameExpr(bare(o), '(2x + 3) - (x + 5)'), o).toBe(k === second.correct));
    const fact = choiceOf('masala-3', 0, 3);
    fact.options.forEach((o, k) => expect(sameExpr(bare(o).replace(/^S=|^S =/, ''), S), o).toBe(k === fact.correct));
    // 2) x = 3 : 8, 8, 88.
    expect(expectedOf('masala-3', 1)).toEqual([parse(S, VALUE(xTest)), parse('(x + 5)(x - 2)', VALUE(xTest)), parse('(x + 5)(x + 8)', VALUE(xTest))]);
    expect(expectedOf('masala-3', 1)).toEqual([8, 8, 88]);
    // 3) x = 12 : 17 × 10 = 170 m² = 459 − 289 ; 204000 دج. La cour est bien plus longue que large.
    expect(2 * x + 3).toBeGreaterThan(x + 5);
    const area = (x + 5) * (x - 2);
    expect(parse(S, VALUE(x))).toBe(area);
    expect((2 * x + 3) * (x + 5) - (x + 5) ** 2).toBe(area);
    expect(expectedOf('masala-3', 2)).toEqual([x + 5, x - 2, area, area * price]);
  });
});
