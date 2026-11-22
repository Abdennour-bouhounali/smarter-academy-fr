import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Polynômes EXACTS en x : tableau de coefficients entiers [c0, c1, c2, …]. ──
const trim = (p) => { const q = p.slice(); while (q.length > 1 && q[q.length - 1] === 0) q.pop(); return q; };
const add = (p, q) => trim(Array.from({ length: Math.max(p.length, q.length) }, (_, i) => (p[i] ?? 0) + (q[i] ?? 0)));
const neg = (p) => p.map((c) => -c);
const sub = (p, q) => add(p, neg(q));
const mul = (p, q) => {
  const r = Array(p.length + q.length - 1).fill(0);
  p.forEach((a, i) => q.forEach((b, j) => { r[i + j] += a * b; }));
  return trim(r);
};
const k = (n) => [n];
const X = [0, 1];
const same = (p, q) => JSON.stringify(trim(p)) === JSON.stringify(trim(q));
const at = (p, x) => p.reduce((s, c, i) => s + c * x ** i, 0);
const XS = [-3, 0, 1, 2, 7, 30]; // les valeurs de x où l'on évalue chaque expression

/**
 * Lit une expression KaTeX en x : entiers, x, ^n, \times, \div (par une constante),
 * multiplication implicite (2x, 5(x + 150), (2x + 10)(x - 4)), parenthèses, signe −.
 * Renvoie le polynôme, ou null si une autre lettre (A, B, S, E, F, H, T…) y figure.
 */
function poly(src) {
  const s = src.replace(/\\left|\\right/g, '').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\s+/g, '');
  if (!/^[\dx+\-*/()^]+$/.test(s) || s === '') return null;
  let i = 0;
  const atom = () => {
    let v;
    if (s[i] === '-') { i++; return neg(atom()); }
    if (s[i] === '(') { i++; v = sum(); if (s[i] !== ')') throw new Error(`bad parens in ${src}`); i++; } else if (s[i] === 'x') { i++; v = X; } else {
      const j = i; while (/\d/.test(s[i])) i++;
      if (i === j) throw new Error(`bad term in ${src}`);
      v = k(Number(s.slice(j, i)));
    }
    if (s[i] === '^') { i++; const j = i; while (/\d/.test(s[i])) i++; const n = Number(s.slice(j, i)); let r = k(1); for (let t = 0; t < n; t++) r = mul(r, v); v = r; }
    return v;
  };
  const prod = () => {
    let v = atom();
    for (;;) {
      if (s[i] === '*') { i++; v = mul(v, atom()); } else if (s[i] === '/') {
        i++; const d = atom();
        if (d.length !== 1 || d[0] === 0) throw new Error(`non-constant divisor in ${src}`);
        v = v.map((c) => c / d[0]);
      } else if (s[i] === '(' || s[i] === 'x' || /\d/.test(s[i] ?? '')) { v = mul(v, atom()); } else return v;
    }
  };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? add(v, w) : sub(v, w); } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
/** Le membre de droite d'une option « $A = …$ » (ou l'option entière). */
const rhs = (opt) => poly(opt.replace(/^\$|\$$/g, '').split('=').at(-1));

// ── Vérificateur des RELATIONS écrites (explain, lines, prompt, bonne option) ──
// Chaque formule $…$ est découpée sur = < > \neq ; chaque relation entre deux
// membres VOISINS lisibles (polynômes en x) est vérifiée : identité de
// polynômes pour =, constantes pour < > \neq. Un membre « x » seul (x = 30)
// est une affectation ; un membre avec une autre lettre est ignoré.
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of text.matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|<|>|\\neq)/);
    for (let j = 1; j + 1 < parts.length; j += 2) {
      const [l, op, r] = [parts[j - 1], parts[j], parts[j + 1]];
      if (l.trim() === 'x' || r.trim() === 'x') continue;
      const [a, b] = [poly(l), poly(r)];
      if (a == null || b == null) continue;
      let ok;
      if (op === '=') ok = same(a, b);
      else {
        expect(a.length === 1 && b.length === 1, `${where}: ${f} compares non-constants`).toBe(true);
        ok = { '<': a[0] < b[0], '>': a[0] > b[0], '\\neq': a[0] !== b[0] }[op];
      }
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}

const stepsOf = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, n) => stepsOf(id, part).filter((st) => st.kind === 'choice')[n];
const correctOf = (id, part, n) => { const s = choiceOf(id, part, n); return s.options[s.correct]; };
/** La bonne option vaut `ref` (coefficients ET valeurs en plusieurs x) ; chaque autre option en diffère. */
function expectChoice(id, part, n, ref, read = rhs) {
  const s = choiceOf(id, part, n);
  const vals = s.options.map(read);
  expect(vals[s.correct], `${id} ${part + 1}) choice ${n + 1}: correct option`).toEqual(trim(ref));
  for (const x of XS) expect(at(vals[s.correct], x)).toBe(at(ref, x));
  vals.forEach((v, o) => {
    if (o === s.correct) return;
    expect(v, `${id} ${part + 1}) choice ${n + 1} option ${o + 1} is readable`).not.toBeNull();
    expect(XS.some((x) => at(v, x) !== at(ref, x)), `${id} ${part + 1}) choice ${n + 1} option ${o + 1} must differ`).toBe(true);
  });
}

describe('les مسائل du درس 1 (unité 3) « نشر وتبسيط عبارة جبرية »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (4, 5, 6 — track problem, practice_lab, before the test 7)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [4, '04', 'masala-1', 'practice_lab', 8], [5, '05', 'masala-2', 'practice_lab', 8], [6, '06', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '07', number: 7, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(74);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 4], ['masala-2', 5], ['masala-3', 6]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, n) => {
        expect(part.steps.some((s) => s.ask === n && s.kind !== 'solution'), `${p.id} ${part.label} ask ${n + 1}`).toBe(true);
      });
    }
  });

  it('data: 4+ useful items, and at least one useless item that is a number', () => {
    for (const p of PROBLEMS) {
      expect(p.data.filter((d) => d.useful).length).toBeGreaterThanOrEqual(4);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text.includes('$'), `${p.id} ${d.id}`).toBe(false);
    }
  });

  it('no bare formula in the Arabic text — every expression is a $…$ island', () => {
    const texts = (p) => [p.statement, p.context, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/²|\^|\\times|\d\s*\/\s*\d|\b[xABSEFHT]\b|[=×]/);
    }
  });

  it('every written relation (explain, prompt, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
    }));
    expect(checked).toBeGreaterThan(80);
  });

  it('the relation checker fails on a mutated number (self-test)', () => {
    expect(() => checkText('$(2x + 10)(x - 4) = 2x^2 + 2x + 40$', 'mutant')).toThrow();
    expect(() => checkText('$2x \\times x = 2x$', 'mutant')).toThrow();
    expect(() => checkText('$(5x + 990) - (240 + 5x) = 5x + 990 - 240 + 5x$', 'mutant')).toThrow();
    expect(() => checkText('$124 \\times 1500 = 168000$', 'mutant')).toThrow();
    expect(() => checkText('$765000 < 650000$', 'mutant')).toThrow();
    expect(checkText('$(30 + x)(16 + x) = x^2 + 46x + 480$ و $x = 4$ و $34 \\times 20 = 680 \\neq 184$', 'ok')).toBe(3);
  });

  it('مسألة 1 — the pitch (2x + 10)(x − 4): expansion, check at x = 30 and the extension, computed', () => {
    const aisle = 4, extra = 10, x0 = 30, price = 1500;
    const L = add(mul(k(2), X), k(extra)); // 2x + 10
    const W = sub(X, k(aisle)); // x − 4
    const A = mul(L, W);
    expect(A).toEqual([-40, 2, 2]); // 2x² + 2x − 40
    // 1) le produit, les quatre zones, la forme réduite
    expectChoice('masala-1', 0, 0, A);
    const four = choiceOf('masala-1', 0, 1);
    expect(poly(four.options[four.correct].slice(1, -1))).toEqual(A);
    expect(four.options[four.correct]).toBe('$2x^2 - 8x + 10x - 40$');
    expectChoice('masala-1', 0, 1, A, (o) => poly(o.slice(1, -1)));
    expectChoice('masala-1', 0, 2, A);
    // 2) x = 30 : 70 × 26 = 1820 par les deux formes ; le joueur oublie 2x
    const area = at(L, x0) * at(W, x0);
    expect(expectedOf('masala-1', 1)).toEqual([at(L, x0), at(W, x0), area, at(A, x0)]);
    expect([at(L, x0), at(W, x0), area]).toEqual([70, 26, 1820]);
    const player = at([-40, 0, 2], x0);
    expect(player).toBe(1760);
    expect(area - player).toBe(at([0, 2], x0));
    // 3) la terre élargie à x + 1 : (2x + 12)(x − 3) ; B − A = 4x + 4 ; 124 m², 186000 دج
    const L2 = add(mul(k(2), add(X, k(1))), k(extra));
    const W2 = sub(add(X, k(1)), k(aisle));
    expect([L2, W2]).toEqual([[12, 2], [-3, 1]]);
    const B = mul(L2, W2);
    expectChoice('masala-1', 2, 1, B);
    const gain = sub(B, A);
    expect(gain).toEqual([4, 4]);
    expectChoice('masala-1', 2, 2, gain);
    const wrong = choiceOf('masala-1', 2, 2).options.map(rhs);
    expect(wrong[1]).toEqual(add(B, [-40, 2, -2])); // seul 2x² change de signe : 8x − 76
    expect(wrong[2]).toEqual(add(B, [-40, -2, -2])); // le −40 garde son signe : 4x − 76
    expect(wrong[3]).toEqual(add(B, A)); // B + A
    const g = at(gain, x0);
    expect(at(L, x0 + 1) * at(W, x0 + 1) - area).toBe(g);
    expect(expectedOf('masala-1', 2)).toEqual([g, g * price]);
    expect([g, g * price]).toEqual([124, 186000]);
  });

  it('مسألة 2 — the hall (30 + x)(16 + x): added part, the forgotten corner and the budget, computed', () => {
    const len = 30, wid = 16, price = 3000, budget = 650000;
    const S = mul(add(k(len), X), add(k(wid), X));
    expect(S).toEqual([480, 46, 1]);
    expectChoice('masala-2', 0, 0, S);
    expectChoice('masala-2', 0, 1, S, (o) => poly(o.slice(1, -1)));
    expectChoice('masala-2', 0, 2, S);
    // 2) E = S − 480 ; x = 4 : 200 (et 184 pour le seul couple de bandes) ; le coin x² = 16
    const E = sub(S, k(len * wid));
    expectChoice('masala-2', 1, 0, E);
    const bands = [0, len + wid];
    expect(expectedOf('masala-2', 1)).toEqual([at(E, 4), at(bands, 4)]);
    expect([at(E, 4), at(bands, 4), at(E, 4) - at(bands, 4)]).toEqual([200, 184, 4 ** 2]);
    expect(at(E, 4)).toBe((len + 4) * (wid + 4) - len * wid);
    // 3) le budget : x = 4 tient, x = 5 dépasse (le terme x² rend le coût non proportionnel)
    expect(expectedOf('masala-2', 2)).toEqual([at(E, 4) * price, at(E, 5), at(E, 5) * price]);
    expect(at(E, 4) * price).toBeLessThanOrEqual(budget);
    expect(at(E, 5) * price).toBeGreaterThan(budget);
    expect([at(E, 5), at(E, 5) * price, at(E, 5) * price - budget]).toEqual([255, 765000, 115000]);
    expect(correctOf('masala-2', 2, 0)).toBe('لا: $765000 > 650000$، وينقص $765000 - 650000 = 115000$ دج');
  });

  it('مسألة 3 — the electricity bills: F, H, H − F = 750 and the year total, computed', () => {
    const fixed = 240, unit = 5, more = 150, less = 60, x0 = 250, save = 550;
    const bill = (consumption) => add(k(fixed), mul(k(unit), consumption));
    const F = bill(X);
    const H = bill(add(X, k(more)));
    expect([F, H]).toEqual([[240, 5], [990, 5]]);
    expectChoice('masala-3', 0, 0, F);
    expectChoice('masala-3', 0, 1, H);
    expectChoice('masala-3', 0, 2, H);
    // 2) H − F ne dépend pas de x ; facture d'automne 1490 دج ⇔ x = 250
    const diff = sub(H, F);
    expect(diff).toEqual([unit * more]);
    expectChoice('masala-3', 1, 0, diff);
    expect(at(F, x0)).toBe(1490);
    expect(expectedOf('masala-3', 1)).toEqual([at(F, x0) + diff[0]]);
    expect(at(H, x0)).toBe(2240);
    // 3) printemps = été = 240 + 5(x − 60) = 5x − 60 ; T = 20x + 1110 ; 6110 ≤ 6600
    const spring = bill(sub(X, k(less)));
    expect(spring).toEqual([-60, 5]);
    expectChoice('masala-3', 2, 0, spring);
    const T = add(add(F, H), mul(k(2), spring));
    expect(T).toEqual([1110, 20]);
    expectChoice('masala-3', 2, 1, T);
    expect(at(T, x0)).toBe(at(F, x0) + at(H, x0) + 2 * at(spring, x0));
    expect(expectedOf('masala-3', 2)).toEqual([at(T, x0), save * 12]);
    expect([at(T, x0), save * 12, save * 12 - at(T, x0)]).toEqual([6110, 6600, 490]);
  });
});
