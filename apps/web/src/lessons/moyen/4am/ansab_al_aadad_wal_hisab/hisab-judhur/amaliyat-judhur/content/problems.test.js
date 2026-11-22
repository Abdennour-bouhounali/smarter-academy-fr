import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique ENTIÈRE ─────────────────────────────────────────────────────
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const isqrt = (n) => { let k = Math.floor(Math.sqrt(n)); while (k * k > n) k--; while ((k + 1) * (k + 1) <= n) k++; return k; };
const isSquare = (n) => isqrt(n) ** 2 === n;
const div = (a, b) => ({ q: Math.floor(a / b), r: a % b });
/** a√b est bien √N : a² × b = N (en entiers). */
const surdIs = (a, b, N) => a * a * b === N;
const surdTex = (N, a, b) => `$\\sqrt{${N}} = ${a}\\sqrt{${b}}$`;

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const correctOf = (id, part, k) => { const s = PROBLEM[id].parts[part].steps.filter((st) => st.kind === 'choice')[k]; return s.options[s.correct]; };

// ── Évaluateur EXACT des expressions à radicaux ─────────────────────────────
// Une valeur est une combinaison linéaire Σ c·√r : Map(r sans facteur carré → rationnel [n, d]).
const R = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };
const rAdd = (x, y) => R(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const rMul = (x, y) => R(x[0] * y[0], x[1] * y[1]);
/** n = k² × s, s sans facteur carré. */
const squareFree = (n) => { let k = 1, s = n; for (let p = 2; p * p <= s; p++) while (s % (p * p) === 0) { s /= p * p; k *= p; } return [k, s]; };
const V = (entries) => { const m = new Map(); for (const [r, c] of entries) { if (c[0] === 0) continue; const prev = m.get(r); const v = prev ? rAdd(prev, c) : c; if (v[0] === 0) m.delete(r); else m.set(r, v); } return m; };
const vNum = (q) => V([[1, q]]);
const vAdd = (x, y) => V([...x, ...y]);
const vNeg = (x) => V([...x].map(([r, c]) => [r, [-c[0], c[1]]]));
const vMul = (x, y) => {
  const out = [];
  for (const [r1, c1] of x) for (const [r2, c2] of y) { const [k, s] = squareFree(r1 * r2); out.push([s, rMul(rMul(c1, c2), [k, 1])]); }
  return V(out);
};
const vInv = (x) => {
  if (x.size !== 1) throw new Error('division par une somme');
  const [[r, c]] = [...x]; // 1 / (c√r) = √r / (c·r)
  return V([[r, R(c[1], c[0] * r)]]);
};
const vSqrt = (x) => {
  if (x.size === 0) return V([]);
  if (x.size !== 1 || !x.has(1)) throw new Error('racine d\'un irrationnel');
  const [n, d] = x.get(1);
  if (n < 0) throw new Error('racine d\'un négatif');
  const [k, s] = squareFree(n * d); // √(n/d) = √(n·d) / d
  return V([[s, R(k, d)]]);
};
const vEq = (x, y) => vAdd(x, vNeg(y)).size === 0;
const vFloat = (x) => [...x].reduce((t, [r, c]) => t + (c[0] / c[1]) * Math.sqrt(r), 0);

function evalSurd(src) {
  const s = src
    .replace(/\\,[a-z]+(\^2)?/g, '') // unités : \,dm^2, \,m, \,cm
    .replace(/\\left|\\right/g, '').replace(/\\dfrac/g, '\\frac').replace(/\{,\}/g, '.')
    .replace(/\\times|\\cdot/g, '*').replace(/\\div/g, '/').replace(/\s+/g, '');
  let i = 0;
  const peek = (t) => s.startsWith(t, i);
  const eat = (t) => { if (!peek(t)) throw new Error(`attendu ${t} dans ${s}`); i += t.length; };
  const group = () => { eat('{'); const v = sum(); eat('}'); return v; };
  const primary = () => {
    if (peek('(')) { i++; const v = sum(); eat(')'); return v; }
    if (peek('{')) return group();
    if (peek('\\sqrt')) { i += 5; return vSqrt(group()); }
    if (peek('\\frac')) { i += 5; const a = group(); const b = group(); return vMul(a, vInv(b)); }
    const m = /^\d+(\.\d+)?/.exec(s.slice(i));
    if (!m) throw new Error(`jeton inattendu dans ${s} @${i}`);
    i += m[0].length;
    const [ip, fp = ''] = m[0].split('.');
    return vNum(R(Number(ip + fp), 10 ** fp.length));
  };
  const power = () => { let v = primary(); while (peek('^')) { i++; const e = peek('{') ? group() : primary(); const [[, [n]]] = [...e]; let p = vNum([1, 1]); for (let k = 0; k < n; k++) p = vMul(p, v); v = p; } return v; };
  const unary = () => (peek('-') ? (i++, vNeg(unary())) : power());
  const startsFactor = () => peek('\\sqrt') || peek('(') || peek('\\frac');
  const prod = () => {
    let v = unary();
    for (;;) {
      if (peek('*')) { i++; v = vMul(v, unary()); } else if (peek('/')) { i++; v = vMul(v, vInv(unary())); } else if (startsFactor()) v = vMul(v, unary()); else break;
    }
    return v;
  };
  function sum() { let v = prod(); while (peek('+') || peek('-')) { const op = s[i++]; const w = prod(); v = op === '+' ? vAdd(v, w) : vAdd(v, vNeg(w)); } return v; }
  try { const v = sum(); return i === s.length ? v : null; } catch { return null; }
}

/**
 * Chaque formule $…$ : membres « = » égaux EXACTEMENT, « \neq » différents,
 * « < » vrai, « \approx » à 1 % près (√2 ≈ 1,41). Retourne le nombre de vérifications.
 */
function checkFormula(f, where) {
  let checked = 0;
  const segs = f.split('\\approx');
  const ends = [];
  for (const seg of segs) {
    if (seg.includes('\\neq')) {
      const [a, b] = seg.split('\\neq').map(evalSurd);
      if (a && b) { expect(vEq(a, b), `${where}: ${f}`).toBe(false); checked++; }
      ends.push([null, null]);
      continue;
    }
    if (seg.split('<').length === 2) {
      const [a, b] = seg.split('<').map(evalSurd);
      if (a && b) { expect(vFloat(a) < vFloat(b), `${where}: ${f}`).toBe(true); checked++; }
      ends.push([null, null]);
      continue;
    }
    const sides = seg.split('=').map(evalSurd).filter(Boolean);
    for (const v of sides.slice(1)) { expect(vEq(v, sides[0]), `${where}: ${f}`).toBe(true); checked++; }
    ends.push([sides[0] ?? null, sides.at(-1) ?? null]);
  }
  for (let k = 0; k + 1 < ends.length; k++) {
    const a = ends[k][1], b = ends[k + 1][0];
    if (a && b) { expect(Math.abs(vFloat(a) - vFloat(b)) / Math.abs(vFloat(b)), `${where}: ${f}`).toBeLessThan(0.01); checked++; }
  }
  return checked;
}
const formulas = (text) => [...text.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const checkText = (text, where) => formulas(text).reduce((t, f) => t + checkFormula(f, where), 0);

const allTexts = (p) => [p.statement, ...p.data.map((d) => d.text), ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);

describe('l\'évaluateur exact', () => {
  it('reads surds and refuses a wrong one (mutation)', () => {
    expect(vEq(evalSurd('\\sqrt{180}'), evalSurd('6\\sqrt{5}'))).toBe(true);
    expect(vEq(evalSurd('\\sqrt{180}'), evalSurd('5\\sqrt{6}'))).toBe(false);
    expect(vEq(evalSurd('\\dfrac{6\\sqrt{2}}{2\\sqrt{2}}'), evalSurd('3'))).toBe(true);
    expect(vEq(evalSurd('(8\\sqrt{3})^2'), evalSurd('192'))).toBe(true);
    expect(vEq(evalSurd('6\\sqrt{2{,}5}'), evalSurd('\\sqrt{90}'))).toBe(true);
    expect(vEq(evalSurd('\\sqrt{800 + 800}'), evalSurd('\\sqrt{800} + \\sqrt{800}'))).toBe(false);
    expect(evalSurd('d^2')).toBeNull();
    // Une coquille dans une ligne est attrapée.
    expect(() => checkFormula('\\sqrt{72} = \\sqrt{36 \\times 2} = 7\\sqrt{2}', 'mutation')).toThrow();
    expect(() => checkFormula('20\\sqrt{2} \\approx 20 \\times 1{,}41 = 28{,}4', 'mutation')).toThrow();
  });
});

describe('les مسائل du درس « العمليات على الجذور التربيعية »', () => {
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
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(83);
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

  it('no bare √, \\sqrt or « a/b » in the Arabic text — every formula is in $…$', () => {
    for (const p of PROBLEMS) for (const t of allTexts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/√|\\sqrt|\\frac|\d\s*\/\s*\d/);
    }
  });

  it('every written equality (explain, prompts, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
    }));
    for (const p of PROBLEMS) checked += checkText(p.statement, `${p.id} statement`);
    expect(checked).toBeGreaterThan(70);
  });

  it('in a surd choice, the correct equality is true and every distractor equality is false', () => {
    let seen = 0;
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) {
      if (s.kind !== 'choice') continue;
      s.options.forEach((o, k) => {
        const f = formulas(o);
        if (f.length !== 1 || o.trim() !== `$${f[0]}$` || !f[0].includes('=')) return;
        const [a, b] = f[0].split('=').map(evalSurd);
        if (!a || !b) return;
        expect(vEq(a, b), `${p.id} ${part.label}: ${o}`).toBe(k === s.correct);
        seen++;
      });
    }
    expect(seen).toBe(5 * 4);
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const [A, small, big, price] = [180, 5, 12, 150];
    // 1) 180 ÷ 5 = 36 dalles, 36 = 6² → 6 par côté, √180 = 6√5.
    expect(A % small).toBe(0);
    const n = A / small, k = isqrt(n);
    expect(k * k).toBe(n);
    expect(surdIs(k, small, A)).toBe(true);
    expect(expectedOf('masala-1', 0)).toEqual([n, k]);
    expect(correctOf('masala-1', 0, 1)).toBe(surdTex(A, k, small));
    // 2) √12 = 2√3 ; 4 par côté : 16 dalles, 192 ≠ 180 ; 180 ÷ 12 = 15 n'est pas un carré.
    const [kb, rb] = [isqrt(4), 3];
    expect(surdIs(kb, rb, big)).toBe(true);
    expect(correctOf('masala-1', 1, 0)).toBe(surdTex(big, kb, rb));
    expect(expectedOf('masala-1', 1)).toEqual([4 * 4, 4 * 4 * big]);
    expect(surdIs(4 * kb, rb, 4 * 4 * big)).toBe(true); // (8√3)² = 192
    expect(4 * 4 * big).not.toBe(A);
    expect(A % big).toBe(0);
    expect(isSquare(A / big)).toBe(false);
    expect(3 * 3 * big).toBeLessThan(A); // 3 par côté : 108, trop petit
    // 3) demi-côté 3√5 → aire 45 → 9 dalles ; (36 + 9) × 150.
    expect(k % 2).toBe(0);
    const half = k / 2, A2 = half * half * small;
    expect(correctOf('masala-1', 2, 0)).toBe(`$${half}\\sqrt{${small}}$`);
    expect(A2 * 4).toBe(A);
    expect(expectedOf('masala-1', 2)).toEqual([A2, A2 / small, n + A2 / small, (n + A2 / small) * price]);
    expect(A2 / small).not.toBe(n / 2); // le piège « moitié des dalles »
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const [A, approx100, fencePrice] = [800, 141, 900]; // √2 ≈ 1,41 = 141/100
    // 1) 800 = 400 × 2, 400 = 20² → 20√2 ≈ 28,2.
    const sq = A / 2, a = isqrt(sq);
    expect(a * a).toBe(sq);
    expect(surdIs(a, 2, A)).toBe(true);
    expect(correctOf('masala-2', 0, 0)).toBe(surdTex(A, a, 2));
    const [e400, approxSide] = expectedOf('masala-2', 0);
    expect(e400).toBe(sq);
    expect(Math.round(approxSide * 100)).toBe(a * approx100);
    // 2) Pythagore : d² = 800 + 800 = 1600, d = 40 ; le piège √800 + √800 ≈ 56,4.
    const d2 = A + A, d = isqrt(d2);
    expect(d * d).toBe(d2);
    const [e1600, e40, eTrap] = expectedOf('masala-2', 1);
    expect([e1600, e40]).toEqual([d2, d]);
    expect(Math.round(eTrap * 10)).toBe(2 * Math.round(approxSide * 10));
    expect((2 * a) ** 2 * 2).not.toBe(d * d); // (√800 + √800)² = 3200 ≠ 1600
    // 3) périmètre 4 × 20√2 = 80√2 ≈ 112,8 m ; × 900.
    expect(correctOf('masala-2', 2, 1)).toBe(`$${4 * a}\\sqrt{2}$`);
    const [eFence, eCost] = expectedOf('masala-2', 2);
    expect(Math.round(eFence * 100)).toBe(4 * a * approx100);
    expect(eCost * 100).toBe(4 * a * approx100 * fencePrice);
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    const [poster, badge, sheet, N, price] = [72, 8, 1152, 300, 85];
    // 1) 72 = 36 × 2 → 6√2 ; 8 = 4 × 2 → 2√2.
    const [a1, a2] = [isqrt(poster / 2), isqrt(badge / 2)];
    expect([surdIs(a1, 2, poster), surdIs(a2, 2, badge)]).toEqual([true, true]);
    expect(expectedOf('masala-3', 0)).toEqual([poster / 2, badge / 2]);
    expect(correctOf('masala-3', 0, 0)).toBe(surdTex(poster, a1, 2));
    expect(correctOf('masala-3', 0, 1)).toBe(surdTex(badge, a2, 2));
    // 2) 72 ÷ 8 = 9 = 3² → rapport des côtés 3 = 6√2 ÷ 2√2.
    expect(poster % badge).toBe(0);
    const ratio = isqrt(poster / badge);
    expect(ratio * ratio).toBe(poster / badge);
    expect(a1 / a2).toBe(ratio);
    expect(expectedOf('masala-3', 1)).toEqual([poster / badge, ratio]);
    // 3) √1152 ÷ √8 = √144 = 12 par côté, 144 par feuille ; 300 = 144 × 2 + 12 → 3 feuilles.
    expect(sheet % badge).toBe(0);
    const perSide = isqrt(sheet / badge);
    expect(perSide * perSide).toBe(sheet / badge);
    const perSheet = perSide * perSide;
    const { q, r } = div(N, perSheet);
    expect(r).toBeGreaterThan(0);
    const sheets = q + 1;
    expect(expectedOf('masala-3', 2)).toEqual([perSide, perSheet, q, r, sheets, sheets * price]);
  });
});
