import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE : les coefficients sont des entiers ou des demis (0,5) ;
//    tout est calculé en demis entiers, sans flottant. ──
/** Un polynôme = tableau de coefficients [c0, c1, c2] (rationnels exprimés en nombres JS exacts : entiers et demis). */
const poly = (...c) => c;
const mul = (p, q) => {
  const r = Array(p.length + q.length - 1).fill(0);
  p.forEach((a, i) => q.forEach((b, j) => { r[i + j] += a * b; }));
  return r;
};
const add = (p, q) => Array.from({ length: Math.max(p.length, q.length) }, (_, i) => (p[i] ?? 0) + (q[i] ?? 0));
const scale = (k, p) => p.map((c) => k * c);
const sub = (p, q) => add(p, scale(-1, q));
const trim = (p) => { const r = p.slice(); while (r.length > 1 && r.at(-1) === 0) r.pop(); return r; };
const same = (p, q) => expect(trim(p)).toEqual(trim(q));
const at = (p, x) => p.reduce((s, c, i) => s + c * x ** i, 0);
/** Racine de ax + b = 0, en entier (les énoncés sont choisis pour cela). */
const root = ([b, a]) => -b / a;
const X = poly(0, 1);
const lin = (a, b) => poly(b, a); // ax + b

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, k) => PROBLEM[id].parts[part].steps.filter((st) => st.kind === 'choice')[k];
const correctOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options[s.correct]; };

// ── Vérificateur des RELATIONS écrites (explain, lines, prompt, correction, bonne option) ──
// Chaque formule $…$ est découpée sur = < > \neq ; chaque membre purement numérique
// (entiers, décimaux 0{,}5, ×, +, −, parenthèses — y compris le produit implicite
// « (a)(b) » ou « 3(…) » —, \dfrac{a}{b}, unités \,m) est évalué, et chaque relation
// entre deux membres numériques VOISINS est vérifiée. Les membres avec une lettre sont ignorés.
const EPS = 1e-9;
function evalExpr(src) {
  let s = src
    .replace(/\\,\s*m(\^2)?/g, '')
    .replace(/\{,\}/g, '.')
    .replace(/\\left|\\right/g, '')
    .replace(/\\times/g, '*')
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(s) || s === '') return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '-') { i++; return -atom(); }
    let v;
    if (s[i] === '(') { i++; v = sum(); if (s[i] !== ')') throw new Error(`bad parens in ${src}`); i++; } else {
      const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
      if (i === j) throw new Error(`bad number in ${src}`);
      v = Number(s.slice(j, i));
    }
    while (s[i] === '(') { i++; const w = sum(); i++; v *= w; } // produit implicite
    return v;
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? v * w : v / w; } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|<|>|\\neq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const ok = { '=': Math.abs(x - y) < EPS * Math.max(1, Math.abs(x)), '<': x < y - EPS, '>': x > y + EPS, '\\neq': Math.abs(x - y) > EPS }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}

describe('les مسائل du درس 2 (unité 4) « معادلات جداء معدوم »', () => {
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
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(74);
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

  it('data: 4+ useful items, and at least one useless item that is a number', () => {
    for (const p of PROBLEMS) {
      expect(p.data.filter((d) => d.useful).length).toBeGreaterThanOrEqual(4);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text, `${p.id} ${d.id}`).not.toMatch(/\$|[a-z]/i);
    }
  });

  it('no bare x, h, x², √ or a/b in the Arabic text — every formula is a $…$ island', () => {
    const texts = (p) => [p.statement, p.title, p.context, ...p.parts.flatMap((part) => [part.title, part.question, ...part.asks,
      ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? []), ...(s.rows ?? []).flatMap((r) => [r.label, r.correction, ...r.options])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/√|²|\\|\^|\d\s*\/\s*\d|\b[xhabcd]\b|DA/);
    }
  });

  it('every written relation (explain, prompt, solution lines, corrections, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
      for (const r of s.rows ?? []) checked += checkText(`${r.correction} ${r.options[r.correct]}`, `${where} row ${r.label}`);
    }));
    expect(checked).toBeGreaterThan(55);
  });

  it('the relation checker fails on a mutated number (self-test)', () => {
    expect(() => checkText('$116 \\times 40 = 4460$', 'mutant')).toThrow();
    expect(() => checkText('$(3 \\times 4 - 12)(4 + 6) = 10$', 'mutant')).toThrow();
    expect(() => checkText('$0{,}5 \\times 2 \\times (6 - 2) = 8$', 'mutant')).toThrow();
    expect(() => checkText('$x = \\dfrac{12}{3} = 3$', 'mutant')).toThrow();
    expect(checkText('$(8 + 6)(8 - 2) = 14 \\times 6 = 84$ و $(-66) \\times (-12) = 792$ و $3 \\neq 0$', 'ok')).toBe(4);
  });

  it('مسألة 1 — roots substituted, the negative side rejected, 792 m² and the paint computed', () => {
    const A = lin(3, -12), B = lin(1, 6); // côtés 3x − 12 et x + 6
    const area = mul(A, B);
    const [r1, r2] = [root(A), root(B)];
    expect([r1, r2]).toEqual([4, -6]);
    for (const r of [r1, r2]) expect(at(area, r)).toBe(0); // substitution
    expect(expectedOf('masala-1', 0)).toEqual([r1, r2]);
    expect(correctOf('masala-1', 0, 1)).toBe('$4$ و $-6$');
    // 2) les côtés pour chaque racine ; −6 donne un côté négatif → rejeté
    expect([at(A, r1), at(B, r1)]).toEqual([0, 10]);
    expect([at(A, r2), at(B, r2)]).toEqual([-30, 0]);
    expect(at(A, r2)).toBeLessThan(0);
    expect(expectedOf('masala-1', 1)).toEqual([at(B, r1)]);
    const batch = PROBLEM['masala-1'].parts[1].steps[0];
    expect(batch.rows.map((r) => evalExpr(r.options[r.correct].replace(/\$/g, '')))).toEqual([at(A, r1), at(B, r1), at(A, r2), at(B, r2)]);
    // 3) (3x − 12)(x + 6) − 792 = 3(x − 16)(x + 18) — identité vérifiée coefficient par coefficient
    const target = 792;
    const lhs = sub(area, poly(target));
    same(lhs, poly(-864, 6, 3));
    same(lhs, scale(3, mul(lin(1, -16), lin(1, 18))));
    same(mul(lin(1, -16), lin(1, 18)), poly(-288, 2, 1));
    expect(correctOf('masala-1', 2, 1)).toBe('$3x^2 + 6x - 864$');
    const [s1, s2] = [16, -18];
    for (const r of [s1, s2]) expect(at(lhs, r)).toBe(0); // substitution des deux racines
    expect(at(A, s2) < 0 && at(B, s2) < 0).toBe(true); // −18 : deux côtés négatifs, produit 792 quand même
    expect(at(A, s2) * at(B, s2)).toBe(target);
    const [len, wid] = [at(A, s1), at(B, s1)];
    expect([len, wid, len * wid]).toEqual([36, 22, target]);
    const perimeter = 2 * (len + wid);
    const price = 40;
    expect(expectedOf('masala-1', 2)).toEqual([s1, len, wid, perimeter, perimeter * price]);
    expect([perimeter, perimeter * price]).toEqual([116, 4640]);
    // l'énoncé porte les nombres utilisés
    expect(PROBLEM['masala-1'].statement).toMatch(/\$3x - 12\$ و \$x \+ 6\$/);
    expect(PROBLEM['masala-1'].statement).toMatch(/792\\,m\^2/);
    expect(PROBLEM['masala-1'].statement).toMatch(/40 دج/);
  });

  it('مسألة 2 — the jet h = 0,5x(6 − x): roots substituted, two rings at 4 m, the basin and its rim', () => {
    const h = scale(0.5, mul(X, lin(-1, 6))); // 0,5x(6 − x)
    const fall = [0, 6];
    for (const r of fall) expect(at(h, r)).toBe(0);
    expect(at(h, 3)).toBe(4.5); // le sommet : le jet monte bien au-dessus de 4 m
    expect(correctOf('masala-2', 0, 1)).toBe('$0$ و $6$');
    expect(expectedOf('masala-2', 0)).toEqual([fall[1]]);
    // 2) h = 4 ⇔ 6x − x² = 8 ⇔ x² − 6x + 8 = 0 ⇔ (x − 2)(x − 4) = 0
    const ring = 4;
    same(scale(2, h), poly(0, 6, -1));
    same(scale(-1, sub(scale(2, h), poly(2 * ring))), poly(8, -6, 1));
    same(mul(lin(1, -2), lin(1, -4)), poly(8, -6, 1));
    for (const r of [2, 4]) { expect(at(h, r)).toBe(ring); expect(r > 0 && r < fall[1]).toBe(true); }
    expect(correctOf('masala-2', 1, 2)).toBe('$2$ و $4$');
    // 3) demi-côté ≥ 6 + 1, côté 14, périmètre 56, 56 × 2500
    const half = fall[1] + 1, side = 2 * half, rim = 4 * side, cost = rim * 2500;
    expect(expectedOf('masala-2', 2)).toEqual([side, rim, cost]);
    expect([side, rim, cost]).toEqual([14, 56, 140000]);
  });

  it('مسألة 3 — the border: lawn = 3 × roses gives (x + 6)(x − 8) = 0, −6 rejected, seedlings computed', () => {
    const L = lin(1, 6); // longueur x + 6
    const garden = mul(X, L), roses = scale(2, L);
    const lawn = sub(garden, roses);
    same(lawn, mul(L, lin(1, -2))); // x(x + 6) − 2(x + 6) = (x + 6)(x − 2)
    const condition = sub(lawn, scale(3, roses));
    same(condition, mul(L, lin(1, -8))); // (x + 6)(x − 8)
    const [r1, r2] = [root(L), root(lin(1, -8))];
    expect([r1, r2]).toEqual([-6, 8]);
    for (const r of [r1, r2]) expect(at(condition, r)).toBe(0); // substitution
    expect(r1).toBeLessThan(0); // une largeur négative : rejetée
    expect(correctOf('masala-3', 1, 2)).toBe('$-6$ و $8$');
    const width = r2, length = at(L, width);
    expect(expectedOf('masala-3', 1)).toEqual([width, length]);
    const [aRoses, aLawn] = [at(roses, width), at(lawn, width)];
    expect([aRoses, aLawn, aLawn === 3 * aRoses, aRoses + aLawn === width * length]).toEqual([28, 84, true, true]);
    const seedlings = aRoses * 9, cost = seedlings * 120;
    expect(expectedOf('masala-3', 2)).toEqual([aRoses, aLawn, seedlings, cost]);
    expect([seedlings, cost]).toEqual([252, 30240]);
  });
});
