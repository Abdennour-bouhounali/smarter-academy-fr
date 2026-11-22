import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique ENTIÈRE ─────────────────────────────────────────────────────
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
/** Le plus grand carré a² qui divise n, et b = n / a² : √n = a√b. */
const simplest = (n) => { let a = 1; for (let k = 1; k * k <= n; k += 1) if (n % (k * k) === 0) a = k; return [a, n / (a * a)]; };
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const correctOf = (id, part, k) => { const s = PROBLEM[id].parts[part].steps.filter((st) => st.kind === 'choice')[k]; return s.options[s.correct]; };
/** Valeur approchée en CENTIÈMES (entier) : coefficient × 1,73 ou 1,41. */
const hundredths = (coef, approx100) => coef * approx100;

// ── Vérificateur des ÉGALITÉS écrites : nombres de la forme Σ q·√r ─────────
// Rationnels exacts [num, den] ; une « surd » = Map(radicande sans facteur carré → rationnel).
const R = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return [n / g, d / g]; };
const rAdd = (x, y) => R(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const rMul = (x, y) => R(x[0] * y[0], x[1] * y[1]);
const rInv = (x) => R(x[1], x[0]);
const S = (q, r = 1) => new Map([[r, q]]);
const clean = (m) => { for (const [k, v] of m) if (v[0] === 0) m.delete(k); return m; };
const sAdd = (a, b) => { const m = new Map(a); for (const [r, q] of b) m.set(r, m.has(r) ? rAdd(m.get(r), q) : q); return clean(m); };
const sNeg = (a) => new Map([...a].map(([r, q]) => [r, [-q[0], q[1]]]));
const sMul = (a, b) => {
  let m = new Map();
  for (const [r1, q1] of a) for (const [r2, q2] of b) {
    const [s, t] = simplest(r1 * r2);
    m = sAdd(m, S(rMul(rMul(q1, q2), [s, 1]), t));
  }
  return m;
};
const sDiv = (a, b) => {
  if (b.size !== 1) return null; // diviseur à plusieurs termes : non vérifiable ici
  const [[r, q]] = [...b];
  return sMul(a, S(rInv(rMul(q, [r, 1])), r)); // x / (q√r) = x · √r / (q·r)
};
const sSqrt = (a) => {
  if (a.size > 1 || (a.size === 1 && !a.has(1))) return null;
  const q = a.get(1) ?? [0, 1];
  if (q[0] < 0) return null;
  const [s, t] = simplest(q[0] * q[1]); // √(p/d) = √(p·d) / d
  return S(R(s, q[1]), t);
};
const sFloat = (a) => [...a].reduce((t, [r, q]) => t + (q[0] / q[1]) * Math.sqrt(r), 0);
const sEq = (a, b) => { const d = sAdd(a, sNeg(b)); return d.size === 0; };

function evalExpr(src) {
  const s = src
    .replace(/\\,(cm|dm|m)(\^2)?/g, '')
    .replace(/\\dfrac|\\frac/g, 'F')
    .replace(/\\sqrt/g, 'Q')
    .replace(/\\times/g, '*').replace(/\\div/g, '/')
    .replace(/\{,\}/g, '.')
    .replace(/\s+/g, '');
  if (!/^[\d.+\-*/()^{}FQ]+$/.test(s) || s === '') return null;
  let i = 0;
  const fail = () => { throw new Error('parse'); };
  const group = () => { if (s[i] !== '{') fail(); i++; const v = sum(); if (s[i] !== '}') fail(); i++; return v; };
  const atom = () => {
    if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') fail(); i++; return v; }
    if (s[i] === 'F') { i++; const n = group(); const d = group(); return sDiv(n, d) ?? fail(); }
    if (s[i] === 'Q') { i++; return sSqrt(group()) ?? fail(); }
    const j = i; while (/[\d.]/.test(s[i])) i++;
    if (i === j) fail();
    const t = s.slice(j, i); const [w, f = ''] = t.split('.');
    return S(R(Number(w + f), 10 ** f.length));
  };
  const power = () => { let v = atom(); if (s[i] === '^') { i++; const e = Number(s[i++]); let p = S([1, 1]); for (let k = 0; k < e; k++) p = sMul(p, v); v = p; } return v; };
  // multiplication implicite : 2√3, (2 + 3)√3, 3(3√2)
  const prod = () => {
    let v = power();
    for (;;) {
      if (s[i] === '*') { i++; v = sMul(v, power()); } else if (s[i] === '/') { i++; v = sDiv(v, power()) ?? fail(); } else if (s[i] === '(' || s[i] === 'F' || s[i] === 'Q' || /\d/.test(s[i] ?? '')) v = sMul(v, power()); else return v;
    }
  };
  const sum = () => {
    let v = s[i] === '-' ? (i++, sNeg(prod())) : prod();
    while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? sAdd(v, w) : sAdd(v, sNeg(w)); }
    return v;
  };
  try { const v = sum(); return i === s.length ? v : null; } catch { return null; }
}

const IS_VAR = /^\s*[A-Za-z]\s*$/;
/** Chaque formule $…$ : membres « = » égaux (exactement), « < » / « > » vrais, « \approx » à 0,5 % près. */
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of text.matchAll(/\$([^$]+)\$/g)) {
    if (/\\ldots|\\neq/.test(f)) continue;
    const ineq = f.split(/(<|>)/);
    if (ineq.length >= 3) {
      const vals = ineq.filter((_, k) => k % 2 === 0).map(evalExpr);
      if (vals.every(Boolean)) {
        for (let k = 1; k < ineq.length; k += 2) {
          const [a, b] = [sFloat(vals[(k - 1) / 2]), sFloat(vals[(k + 1) / 2])];
          expect(ineq[k] === '<' ? a < b : a > b, `${where}: ${f}`).toBe(true);
        }
        checked++;
      }
      continue;
    }
    const approxSegs = f.split('\\approx').map((seg) => {
      const sides = seg.split('=').filter((x) => !IS_VAR.test(x)).map(evalExpr);
      if (sides.length === 0 || sides.some((v) => v == null)) return null;
      for (const v of sides.slice(1)) expect(sEq(v, sides[0]), `${where}: ${f}`).toBe(true);
      return { value: sides[0], n: sides.length };
    });
    if (approxSegs.some((x) => x == null)) continue;
    if (approxSegs.length === 1 && approxSegs[0].n < 2) continue;
    for (let k = 1; k < approxSegs.length; k++) {
      const [a, b] = [sFloat(approxSegs[k - 1].value), sFloat(approxSegs[k].value)];
      expect(Math.abs(a - b) <= 0.005 * Math.abs(a), `${where}: ${f} (${a} ≈ ${b})`).toBe(true);
    }
    checked++;
  }
  return checked;
}

describe('les مسائل du درس 5 « توظيف خواص الجذور التربيعية »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (6, 7, 8 — track problem, practice_lab, 6 min, before the test 9)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [6, '06', 'masala-1', 'practice_lab', 6], [7, '07', 'masala-2', 'practice_lab', 6], [8, '08', 'masala-3', 'practice_lab', 6],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '09', number: 9, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(89);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(6);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 6], ['masala-2', 7], ['masala-3', 8]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('data: 4–5 useful items, and a useless item that is a number', () => {
    for (const p of PROBLEMS) {
      const useful = p.data.filter((d) => d.useful).length;
      expect(useful >= 4 && useful <= 5, p.id).toBe(true);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(/[$√]/.test(d.text), `${p.id} ${d.id}`).toBe(false);
    }
  });

  it('no bare √, « a/b » or exponent in the Arabic prose — every formula is in $…$', () => {
    const texts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/√|\\sqrt|\d\s*\/\s*\d|\^|²|DA/);
    }
  });

  it('the evaluator itself catches a wrong surd equality', () => {
    expect(checkText('$\\sqrt{200} = 10\\sqrt{2}$', 'ok')).toBe(1);
    expect(() => checkText('$\\sqrt{200} = 2\\sqrt{10}$', 'mutated')).toThrow();
    expect(() => checkText('$\\dfrac{50}{\\sqrt{2}} = 50\\sqrt{2}$', 'mutated')).toThrow();
    expect(() => checkText('$14\\sqrt{3} \\approx 14 \\times 1{,}73 = 24{,}32$', 'mutated')).toThrow();
  });

  it('every written equality (explain, prompts, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
    }));
    expect(checked).toBeGreaterThan(55);
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const N = 200, price = 120;
    const [a, b] = simplest(N);
    expect([a, b]).toEqual([10, 2]);
    expect(correctOf('masala-1', 0, 1)).toBe(`$${a}\\sqrt{${b}}$`);
    expect(expectedOf('masala-1', 0)).toEqual([a * a, b]);
    // Les carrés diviseurs > 1 : 4, 25, 100 — trois pavages ; seul k = 10 donne une pièce non repavable.
    expect([2, 5, 10].map((k) => N % (k * k))).toEqual([0, 0, 0]);
    expect([3, 4, 6, 7, 8, 9].map((k) => N % (k * k) === 0)).toEqual([false, false, false, false, false, false]);
    expect(simplest(2)).toEqual([1, 2]);
    // 2) k = 2 : pièce 50 = 5² × 2, encore repavable ; 2√50 = 10√2.
    expect(expectedOf('masala-1', 1)).toEqual([N / 4]);
    expect(simplest(N / 4)).toEqual([5, 2]);
    expect(2 * simplest(N / 4)[0]).toBe(a);
    expect((N / 4) / b).toBe(25); // 25 petites pièces dans une pièce de 50
    // 3) 100 pièces, prix.
    expect(expectedOf('masala-1', 2)).toEqual([a, a * a, a * a * price]);
    expect(a * a * b).toBe(N);
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const areas = [12, 27, 48], fourth = 75, fifth = 3, path = 25, r3 = 173; // √3 ≈ 1,73
    const coefs = areas.map((n) => simplest(n));
    for (const [, r] of coefs) expect(r).toBe(3);
    expect(expectedOf('masala-2', 0)).toEqual(coefs.map(([c]) => c));
    const L = coefs.reduce((t, [c]) => t + c, 0);
    expect(correctOf('masala-2', 0, 1)).toBe(`$${L}\\sqrt{3}$`);
    // 2) le 4e bac ; le piège √(somme des aires).
    const [c4, r4] = simplest(fourth);
    expect(r4).toBe(3);
    const L4 = L + c4;
    const total = areas.reduce((t, n) => t + n, 0) + fourth;
    expect(total).toBe(162);
    expect(expectedOf('masala-2', 1)).toEqual([c4, simplest(total)[0]]);
    expect(simplest(total)[1]).toBe(2);
    expect(correctOf('masala-2', 1, 0)).toBe(`$${L4}\\sqrt{3}$`);
    expect(L4 * L4 * 3).toBe(588);
    expect(L4 * L4 * 3).not.toBe(total);
    // 3) valeurs approchées (centièmes) et comparaison au chemin, exactes aussi au carré.
    const L5 = L4 + simplest(fifth)[0];
    expect(expectedOf('masala-2', 2)).toEqual([hundredths(L4, r3) / 100, L5]);
    expect(hundredths(L4, r3)).toBeLessThan(path * 100);
    expect(L4 * L4 * 3).toBeLessThan(path * path); // 588 < 625 : la conclusion ne dépend pas de l'arrondi
    expect(hundredths(L5, r3)).toBeGreaterThan(path * 100);
    expect(L5 * L5 * 3).toBeGreaterThan(path * path); // 675 > 625
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    const d = 50, kites = 15, pricePerM = 45, r2 = 141; // √2 ≈ 1,41
    // 1) c = d/√2 = d√2/2 = (d/2)√2.
    expect(d % 2).toBe(0);
    const c = d / 2;
    expect(expectedOf('masala-3', 0)).toEqual([2]);
    expect(correctOf('masala-3', 0, 2)).toBe(`$c = ${c}\\sqrt{2}$`);
    expect(c * 2).toBe(d); // (c√2) × √2 = 2c = d : le côté c√2 a bien pour diagonale d
    // 2) ruban d'un cerf-volant : 4c = 100√2 cm ≈ 141 cm > 100 cm (le piège : 4 × 25).
    const ribbon = 4 * c;
    expect(correctOf('masala-3', 1, 0)).toBe(`$${ribbon}\\sqrt{2}$`);
    expect(expectedOf('masala-3', 1)).toEqual([hundredths(ribbon, r2) / 100]);
    expect(ribbon * ribbon * 2).toBeGreaterThan((4 * (d / 2)) ** 2); // (100√2)² = 20000 > 100² : le ruban de 100 cm du piège ne suffit pas
    // 3) 15 cerfs-volants : 1500√2 cm = 15√2 m ≈ 21,15 m → 22 m (l'arrondi à l'unité, 21, ne suffit pas).
    const meters = (kites * ribbon) / 100;
    expect(Number.isInteger(meters)).toBe(true);
    const approx100 = hundredths(meters, r2);
    const bought = Math.ceil(approx100 / 100);
    expect(Math.round(approx100 / 100)).toBe(bought - 1); // le piège est réel
    expect(meters * meters * 2).toBeGreaterThan((bought - 1) ** 2); // exact : 15√2 > 21
    expect(meters * meters * 2).toBeLessThan(bought ** 2); // exact : 15√2 < 22
    expect(expectedOf('masala-3', 2)).toEqual([meters, approx100 / 100, bought, bought * pricePerM]);
  });
});
