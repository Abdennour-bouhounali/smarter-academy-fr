import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE : fractions d'entiers (BigInt), décimaux « 1{,}5 » / « 1,5 » lus exactement. ──
const big = (n) => BigInt(n);
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const Q = (n, d = 1n) => {
  n = big(n); d = big(d);
  if (d === 0n) throw new Error('division by 0');
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d) || 1n;
  return { n: n / g, d: d / g };
};
/** Un décimal écrit « -1,5 » / « 1.5 » / « 46 » → fraction exacte. */
const dec = (s) => {
  const m = String(s).replace('{,}', ',').match(/^(-?)(\d+)(?:[.,](\d+))?$/);
  if (!m) throw new Error(`not a decimal: ${s}`);
  const frac = m[3] ?? '';
  const q = Q(big(m[2] + frac), 10n ** big(frac.length));
  return m[1] ? Q(-q.n, q.d) : q;
};
const add = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => Q(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => Q(a.n * b.n, a.d * b.d);
const div = (a, b) => Q(a.n * b.d, a.d * b.n);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const cmp = (a, b) => { const x = a.n * b.d - b.n * a.d; return x === 0n ? 0 : x > 0n ? 1 : -1; };
/** Le nombre JS saisi par l'élève (`expected`) vaut-il EXACTEMENT la fraction ? */
const same = (num, q) => eq(dec(String(num)), q);
/** Écriture d'une fraction décimale comme dans les énoncés (« -4,5 »). */
const show = (q) => {
  for (let k = 0n; k < 6n; k++) {
    const scaled = q.n * 10n ** k;
    if (scaled % q.d === 0n) {
      const v = scaled / q.d; const neg = v < 0n; const s = (neg ? -v : v).toString().padStart(Number(k) + 1, '0');
      const out = k ? `${s.slice(0, -Number(k))},${s.slice(-Number(k))}` : s;
      return neg ? `-${out}` : out;
    }
  }
  throw new Error('not a short decimal');
};

// ── Vérificateur des RELATIONS écrites (explain, prompt, lignes de solution, bonne option) ──
// Chaque formule $…$ est découpée sur = < > \neq ; chaque membre purement numérique (décimaux,
// ×, ÷, +, −, parenthèses, \dfrac{n}{m}) est évalué EXACTEMENT, et chaque relation entre deux
// membres numériques voisins est vérifiée. Les membres qui contiennent une lettre sont ignorés.
function evalExpr(src) {
  const s = src
    .replace(/\{,\}/g, ',')
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\s+/g, '');
  if (!/^[\d,+\-*/()]+$/.test(s) || !/\d/.test(s)) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`bad parens in ${src}`); i++; return v; }
    if (s[i] === '-') { i++; const v = atom(); return Q(-v.n, v.d); }
    const j = i; while (/[\d,]/.test(s[i] ?? '')) i++;
    if (i === j) throw new Error(`bad number in ${src}`);
    return dec(s.slice(j, i));
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? mul(v, w) : div(v, w); } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? add(v, w) : sub(v, w); } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of text.matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|<|>|\\neq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const c = cmp(x, y);
      const ok = { '=': c === 0, '<': c < 0, '>': c > 0, '\\neq': c !== 0 }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}

const stepsOf = (id, part) => PROBLEM[id].parts[part].steps;
const numericOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, k) => stepsOf(id, part).filter((st) => st.kind === 'choice')[k];
const correctOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options[s.correct]; };
const q = (x) => dec(String(x));

describe('les مسائل du درس 2 (unité 6) « مفهوم وتعيين الدالة الخطية »', () => {
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
    expect(PROBLEMS.map((p) => p.id)).toEqual(['masala-1', 'masala-2', 'masala-3']);
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
      for (const d of p.data) expect(d.text.includes('$'), `${p.id} ${d.id}`).toBe(false);
    }
  });

  it('a statement that names a table carries one; only masala-1 and masala-2 do', () => {
    for (const p of PROBLEMS) expect(Boolean(p.table), p.id).toBe(/الجدول/.test(p.statement) || p.id === 'masala-1');
    // La carte « مسألة الدرس » n'affiche pas de tableau : l'énoncé 1 ne doit pas en parler.
    expect(LESSON_CONFIG.lessonProblem.statement).not.toMatch(/الجدول|الشكل/);
  });

  it('no bare letter, « DA » or a/b in the Arabic text — every formula is a $…$ island; money in دج', () => {
    const texts = (p) => [p.statement, ...p.data.map((d) => d.text), ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? []), ...(s.rows ?? []).flatMap((r) => [r.label, r.correction, ...r.options])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\\|\^|\d\s*\/\s*\d|\b[a-zA-Z]\b|\bDA\b|نقاط التعلّم|−/);
    }
  });

  it('every written relation (explain, prompt, solution lines, correct options, corrections) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      for (const t of [s.explain, s.prompt, ...(s.lines ?? []), ...(s.rows ?? []).map((r) => r.correction)].filter(Boolean)) checked += checkText(t, where);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
    }));
    expect(checked).toBeGreaterThanOrEqual(75);
  });

  it('the relation checker fails on a mutated number (self-test)', () => {
    expect(() => checkText('$f(48) = 46 \\times 48 = 2218$', 'mutant')).toThrow();
    expect(() => checkText('$a = 10 \\div (-4) = -2{,}4$', 'mutant')).toThrow();
    expect(() => checkText('$\\dfrac{4{,}5}{3} = 1{,}6$', 'mutant')).toThrow();
    expect(() => checkText('$828 \\neq 828$', 'mutant')).toThrow();
    expect(checkText('$-2{,}5 \\times 1{,}2 = -3$ و $\\dfrac{3}{-2} = \\dfrac{-4{,}5}{3} = -1{,}5$ و $6400 > 5000$', 'ok')).toBe(4);
  });

  it('مسألة 1 — les machines : relevés, la seule machine linéaire, la machine د, la جائزة', () => {
    const A = (x) => add(mul(q(3), x), q(1)); // 3x + 1
    const B = (x) => mul(Q(1, 2), mul(x, x)); // 0,5 x²
    const C = (x) => mul(q('-1,5'), x); // −1,5 x
    const inputs = ['-2', '0', '3'].map(q);
    const outs = [A, B, C].map((f) => inputs.map((x) => show(f(x))));
    expect(outs).toEqual([['-5', '1', '10'], ['2', '0', '4,5'], ['3', '0', '-4,5']]);
    // l'énoncé et le tableau disent les mêmes relevés
    const st = LESSON_CONFIG.lessonProblem.statement;
    const latex = (s) => `$${s.replace(',', '{,}')}$`;
    for (const row of [inputs.map(show), ...outs]) expect(st).toContain(row.map(latex).join(' ثم '));
    const { table } = PROBLEM['masala-1'];
    expect(table.head.slice(1)).toEqual(inputs.map(show));
    expect(table.rows.map((r) => r.slice(1))).toEqual(outs);
    // 1) A : 0 ⟼ 1 ≠ 0 ; B : 0 ⟼ 0 mais deux rapports différents ; C : un seul rapport −1,5
    expect(eq(A(q(0)), q(0))).toBe(false);
    expect(eq(B(q(0)), q(0))).toBe(true);
    expect(eq(div(B(q(-2)), q(-2)), q(-1))).toBe(true);
    expect(eq(div(B(q(3)), q(3)), q('1,5'))).toBe(true);
    const ratiosC = [q(-2), q(3)].map((x) => div(C(x), x));
    expect(ratiosC.every((r) => eq(r, q('-1,5')))).toBe(true);
    expect(stepsOf('masala-1', 0).find((s) => s.kind === 'batch').rows.map((r) => r.correct)).toEqual([1, 1, 0]);
    expect(numericOf('masala-1', 0)).toHaveLength(1);
    expect(same(numericOf('masala-1', 0)[0], ratiosC[0])).toBe(true);
    // 2) la machine د : a × 0 = 0 ne fixe rien ; a × (−4) = 10 → a = −2,5 ; image de 1,2
    const aD = div(q(10), q(-4));
    expect(show(aD)).toBe('-2,5');
    const [gotA, gotImage] = numericOf('masala-1', 1);
    expect(same(gotA, aD) && same(gotImage, mul(aD, q('1,2')))).toBe(true);
    expect(correctOf('masala-1', 1, 1)).toBe('$a \\times (-4) = 10$');
    // 3) les antécédents : −1,5 x = −12 et −2,5 x = 15
    const xC = div(q(-12), q('-1,5'));
    const xD = div(q(15), aD);
    expect([show(xC), show(xD)]).toEqual(['8', '-6']);
    expect(eq(C(xC), q(-12)) && eq(mul(aD, xD), q(15))).toBe(true);
    const [gotC, gotD] = numericOf('masala-1', 2);
    expect(same(gotC, xC) && same(gotD, xD)).toBe(true);
    // le distracteur « x = −1,5 × (−12) » = l'image de −12, pas son antécédent
    expect(show(C(q(-12)))).toBe('18');
  });

  it('مسألة 2 — la station : le prix du litre, le tableau, le reçu faux, le plein', () => {
    const litres = q(40); const paid = q(1840);
    const a = div(paid, litres);
    expect(show(a)).toBe('46');
    const f = (x) => mul(a, q(x));
    expect(numericOf('masala-2', 0)).toEqual([46]);
    expect(correctOf('masala-2', 0, 2)).toBe('$40a = 1840$');
    // le tableau de l'énoncé : 40 → 1840, 25 → …, … → 690
    expect(PROBLEM['masala-2'].table.head).toEqual(['عدد اللترات $x$', '40', '25', '…']);
    expect(PROBLEM['masala-2'].table.rows[0].slice(1)).toEqual(['1840', '…', '690']);
    // 2) f(25), antécédent de 690, le reçu « 18 لترًا — 850 دج »
    const x690 = div(q(690), a);
    expect([show(f(25)), show(x690), show(f(18))]).toEqual(['1150', '15', '828']);
    expect(numericOf('masala-2', 1)).toEqual([1150, 15, 828]);
    expect(eq(f(18), q(850))).toBe(false);
    expect(show(sub(q(850), f(18)))).toBe('22');
    // 3) le plein : 55 − 7 litres, f(48), ce qui manque sur 2000 دج
    const need = sub(q(55), q(7));
    const cost = mul(a, need);
    expect([show(need), show(cost), show(sub(cost, q(2000)))]).toEqual(['48', '2208', '208']);
    expect(numericOf('masala-2', 2)).toEqual([48, 2208, 208]);
    expect(cmp(cost, q(2000))).toBe(1);
    expect(eq(sub(f(55), f(7)), cost)).toBe(true); // la linéarité : f(55) − f(7) = f(48)
  });

  it('مسألة 3 — le tissu : le prix du mètre, la قندورة non linéaire, le budget', () => {
    const a = div(q(2450), q('3,5'));
    expect(show(a)).toBe('700');
    expect(numericOf('masala-3', 0)).toEqual([700]);
    expect(correctOf('masala-3', 0, 1)).toBe('$g(x) = 700x$');
    const fee = q(1500);
    const h = (x) => add(mul(a, q(x)), fee);
    // 2) h(2), h(4) ; rapports différents → pas une dala khattiya
    expect([show(h(2)), show(h(4))]).toEqual(['2900', '4300']);
    expect(numericOf('masala-3', 1)).toEqual([2900, 4300]);
    const r2 = div(h(2), q(2)); const r4 = div(h(4), q(4));
    expect([show(r2), show(r4)]).toEqual(['1450', '1075']);
    expect(eq(r2, r4)).toBe(false);
    expect(show(mul(q(2), h(2)))).toBe('5800');
    expect(show(h(0))).toBe('1500');
    // 3) budget 5000 دج : 3500 pour le tissu → 5 m ; le piège 5000 ÷ 700 > 7 mais 7 m coûtent 6400
    const left = sub(q(5000), fee);
    const len = div(left, a);
    expect([show(left), show(len)]).toEqual(['3500', '5']);
    expect(numericOf('masala-3', 2)).toEqual([3500, 5]);
    expect(eq(h(5), q(5000))).toBe(true);
    expect(cmp(div(q(5000), a), q(7))).toBe(1);
    expect(show(h(7))).toBe('6400');
    expect(cmp(h(7), q(5000))).toBe(1);
  });
});
