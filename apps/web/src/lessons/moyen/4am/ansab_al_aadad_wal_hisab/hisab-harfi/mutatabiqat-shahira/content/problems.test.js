import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique RATIONNELLE exacte ─────────────────────────────────────────
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const R = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };
const add = (x, y) => R(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const neg = (x) => [-x[0], x[1]];
const mul = (x, y) => R(x[0] * y[0], x[1] * y[1]);
const inv = (x) => { if (x[0] === 0) throw new Error('division par 0'); return R(x[1], x[0]); };
const eq = (x, y) => x[0] === y[0] && x[1] === y[1];
const lt = (x, y) => x[0] * y[1] < y[0] * x[1];

/**
 * Évalue une formule LaTeX de la leçon pour des valeurs données des lettres
 * minuscules (x, a, b). Une majuscule (A, S, C…) ou un jeton inconnu → null.
 */
function evalTex(src, env) {
  const s = src
    .replace(/\\,[a-z]+(\^2)?/g, '') // unités : \,m, \,m^2
    .replace(/(\d)\\,(\d)/g, '$1$2') // 10\,000
    .replace(/\{,\}/g, '.')
    .replace(/\\times|\\cdot/g, '*').replace(/\\div/g, '/').replace(/\s+/g, '');
  let i = 0;
  const peek = (t) => s.startsWith(t, i);
  const eat = (t) => { if (!peek(t)) throw new Error(`attendu ${t} dans ${s}`); i += t.length; };
  const primary = () => {
    if (peek('(')) { i++; const v = sum(); eat(')'); return v; }
    if (peek('{')) { i++; const v = sum(); eat('}'); return v; }
    const m = /^\d+(\.\d+)?/.exec(s.slice(i));
    if (m) { i += m[0].length; const [ip, fp = ''] = m[0].split('.'); return R(Number(ip + fp), 10 ** fp.length); }
    const c = s[i];
    if (c && /[a-z]/.test(c) && c in env) { i++; return env[c]; }
    throw new Error(`jeton inattendu dans ${s} @${i}`);
  };
  const power = () => {
    let v = primary();
    while (peek('^')) { i++; const e = primary(); let p = R(1); for (let k = 0; k < e[0]; k++) p = mul(p, v); v = p; }
    return v;
  };
  const startsFactor = () => i < s.length && /[\d(a-z{]/.test(s[i]);
  const unary = () => (peek('-') ? (i++, neg(unary())) : power());
  const prod = () => {
    let v = unary();
    for (;;) {
      if (peek('*')) { i++; v = mul(v, unary()); } else if (peek('/')) { i++; v = mul(v, inv(unary())); } else if (startsFactor()) v = mul(v, power()); else break;
    }
    return v;
  };
  function sum() { let v = prod(); while (peek('+') || peek('-')) { const op = s[i++]; const w = prod(); v = op === '+' ? add(v, w) : add(v, neg(w)); } return v; }
  try { const v = sum(); return i === s.length ? v : null; } catch { return null; }
}

// Plusieurs jeux de valeurs : une identité littérale doit tenir pour tous.
const ENVS = [
  { x: R(30), a: R(7), b: R(3) },
  { x: R(-2), a: R(-5), b: R(4) },
  { x: R(3, 2), a: R(1, 3), b: R(-2) },
  { x: R(11), a: R(0), b: R(9) },
];
const val = (tex, env = ENVS[0]) => evalTex(tex, env);
/** Deux expressions sont égales comme polynômes (évaluées en 4 jeux de valeurs). */
const same = (p, q) => ENVS.every((e) => { const a = evalTex(p, e), b = evalTex(q, e); return a && b && eq(a, b); });

/** Une affectation « x = 30 » n'est pas une égalité à vérifier. */
const isAssignment = (f) => /^\s*[a-z]\s*=\s*[\d{},.]+\s*$/.test(f);

/**
 * Chaque formule $…$ : membres « = » égaux POUR TOUTES les valeurs des lettres,
 * « \neq » différents, « < » / « > » vrais. Retourne le nombre de vérifications.
 */
function checkFormula(f, where) {
  if (isAssignment(f)) return 0;
  let checked = 0;
  if (f.includes('\\neq')) {
    const [a, b] = f.split('\\neq').map((t) => val(t));
    if (a && b) { expect(eq(a, b), `${where}: ${f}`).toBe(false); checked++; }
    return checked;
  }
  for (const [op, sw] of [['<', false], ['>', true]]) {
    if (f.split(op).length === 2 && !f.includes('=')) {
      let [a, b] = f.split(op).map((t) => val(t));
      if (sw) [a, b] = [b, a];
      if (a && b) { expect(lt(a, b), `${where}: ${f}`).toBe(true); checked++; }
      return checked;
    }
  }
  const sides = f.split('=');
  for (const env of ENVS) {
    const vs = sides.map((t) => evalTex(t, env)).filter(Boolean);
    for (const v of vs.slice(1)) { expect(eq(v, vs[0]), `${where}: ${f}`).toBe(true); checked++; }
  }
  return checked;
}
const formulas = (text) => [...text.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const checkText = (text, where) => formulas(text).reduce((t, f) => t + checkFormula(f, where), 0);

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, k) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[k];
const correctOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options[s.correct]; };
const tex = (o) => formulas(o)[0];
/** RHS d'une option « $X = expr$ » ou « $expr$ ». */
const rhs = (o) => tex(o).split('=').at(-1);

const allTexts = (p) => [p.statement, ...p.data.map((d) => d.text), ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);

describe('l\'évaluateur exact', () => {
  it('reads identities and refuses a wrong one (mutation)', () => {
    expect(same('(x - 3)^2', 'x^2 - 6x + 9')).toBe(true);
    expect(same('(x - 3)^2', 'x^2 - 9')).toBe(false);
    expect(same('(20 + 2x)^2', '400 + 80x + 4x^2')).toBe(true);
    expect(same('(20 + 2x)^2', '400 + 80x + 2x^2')).toBe(false);
    expect(eq(val('10\\,000 + 200 + 1'), R(10201))).toBe(true);
    expect(eq(val('4 \\times 1{,}5^2 + 80 \\times 1{,}5'), R(129))).toBe(true);
    expect(val('S')).toBeNull();
    expect(isAssignment('x = 30')).toBe(true);
    // Une coquille dans une ligne est attrapée.
    expect(() => checkFormula('(30 - 3)^2 = 900 - 180 + 9 = 739', 'mutation')).toThrow();
    expect(() => checkFormula('x^2 - (x - 3)^2 = 6x + 9', 'mutation')).toThrow();
    expect(() => checkFormula('129 > 130', 'mutation')).toThrow();
  });
});

describe('les مسائل du درس « المتطابقات الشهيرة »', () => {
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

  it('no bare formula in the Arabic text — every formula is in $…$', () => {
    for (const p of PROBLEMS) for (const t of allTexts(p.data ? { ...p, data: [] } : p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\^|\\[a-z]+|\d\s*\/\s*\d|[a-z]²|[a-z]\s*[+−-]\s*\d/);
    }
  });

  it('every written equality (statement, question, explain, prompts, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) {
      checked += checkText(p.statement, `${p.id} statement`);
      p.parts.forEach((part) => {
        checked += checkText(part.question, `${p.id} ${part.label} question`);
        part.steps.forEach((s, si) => {
          const where = `${p.id} ${part.label} step ${si + 1}`;
          for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where);
          if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
        });
      });
    }
    expect(checked).toBeGreaterThan(150);
  });

  it('in an « expression = … » choice, only the correct option is true', () => {
    let seen = 0;
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) {
      if (s.kind !== 'choice') continue;
      s.options.forEach((o, k) => {
        const f = formulas(o);
        if (f.length !== 1 || o.trim() !== `$${f[0]}$` || f[0].split('=').length !== 2) return;
        const [l, r] = f[0].split('=');
        if (!val(l) || !val(r)) return;
        expect(same(l, r), `${p.id} ${part.label}: ${o}`).toBe(k === s.correct);
        seen++;
      });
    }
    expect(seen).toBe(26);
  });

  it('مسألة 1 — expressions and numbers are computed, not typed', () => {
    const [w, side, turf, tile] = [3, 30, 1200, 900];
    const A = (x) => (x - w) ** 2;
    // 1) côté x − 3 ; A = (x − 3)² = x² − 6x + 9 ; chaque distracteur est faux.
    expect(correctOf('masala-1', 0, 0)).toBe(`$x - ${w}$`);
    expect(same(rhs(correctOf('masala-1', 0, 1)), `(x - ${w})^2`)).toBe(true);
    for (const o of choiceOf('masala-1', 0, 1).options.slice(1)) expect(same(rhs(o), '(x - 3)^2'), o).toBe(false);
    const dev = choiceOf('masala-1', 0, 2);
    dev.options.forEach((o, k) => expect(same(rhs(o), '(x - 3)^2'), o).toBe(k === dev.correct));
    for (const x of [5, 12, 30]) expect(val(rhs(dev.options[dev.correct]), { x: R(x) })).toEqual(R(A(x)));
    // 2) 27² = 729 ; le « x² − 6x » de l'ouvrier donne 720, il manque le coin 9.
    const worker = side * side - 2 * w * side;
    expect(expectedOf('masala-1', 1)).toEqual([side - w, A(side), worker]);
    expect(A(side) - worker).toBe(w * w);
    // 3) gazon 729 × 1200 ; gradins x² − (x − 3)² = 6x − 9 → 171 ; × 900.
    const stands = side * side - A(side);
    expect(same(tex(correctOf('masala-1', 2, 0)), 'x^2 - (x - 3)^2')).toBe(true);
    const st = choiceOf('masala-1', 2, 1);
    st.options.forEach((o, k) => expect(same(tex(o), 'x^2 - (x - 3)^2'), o).toBe(k === st.correct));
    expect(stands).toBe(6 * side - 9);
    expect(expectedOf('masala-1', 2)).toEqual([A(side) * turf, stands, stands * tile]);
  });

  it('مسألة 2 — expressions and numbers are computed, not typed', () => {
    const [c, stock, price] = [20, 110, 2400];
    const S = (x) => (c + 2 * x) ** 2 - c * c;
    // 1) côté 20 + 2x ; (20 + 2x)² = 400 + 80x + 4x² ; S = 4x² + 80x.
    expect(correctOf('masala-2', 0, 0)).toBe('$20 + 2x$');
    const big = choiceOf('masala-2', 0, 1);
    big.options.forEach((o, k) => expect(same(tex(o), '(20 + 2x)^2'), o).toBe(k === big.correct));
    const sc = choiceOf('masala-2', 0, 3);
    sc.options.forEach((o, k) => expect(same(rhs(o), '(20 + 2x)^2 - 400'), o).toBe(k === sc.correct));
    for (const x of [1, 2, 5]) expect(val(rhs(sc.options[sc.correct]), { x: R(x) })).toEqual(R(S(x)));
    // 2) x = 1,5 : 23² = 529, S = 129 > 110 (le piège : 1,5 m ne passe pas).
    const big15 = (c + 3) ** 2; // 2 × 1,5 = 3
    expect(expectedOf('masala-2', 1)).toEqual([c + 3, big15, big15 - c * c]);
    expect(4 * 2.25 + 80 * 1.5).toBe(big15 - c * c);
    expect(big15 - c * c).toBeGreaterThan(stock);
    // 3) 19 m² × 2400 ; x = 1 : 84 < 110 (le cas qui passe), reste 26.
    const missing = big15 - c * c - stock;
    expect(expectedOf('masala-2', 2)).toEqual([missing, missing * price, S(1)]);
    expect(S(1)).toBeLessThan(stock);
    expect(stock - S(1)).toBe(26);
  });

  it('مسألة 3 — numbers are computed, not typed', () => {
    const [win, lose, need, rescue] = [10, 4, 30, 10];
    const A = 101 ** 2, B = 99 * 101, C = 98 ** 2, D = 53 ** 2 - 47 ** 2, E = 50 ** 2 - 49 * 51;
    expect(expectedOf('masala-3', 0)).toEqual([A, B]);
    expect(expectedOf('masala-3', 1)).toEqual([C, D]);
    expect(100 ** 2 - 2 ** 2).not.toBe(C); // la réponse du membre est fausse
    // les choix « (100 + 1)^2 = … » : seule la bonne écriture vaut le nombre
    for (const [k, n] of [[0, A], [1, B]]) {
      const s = choiceOf('masala-3', 0, k);
      s.options.forEach((o, j) => expect(eq(val(rhs(o)), R(n)), o).toBe(j === s.correct));
    }
    const sc = choiceOf('masala-3', 1, 0);
    sc.options.forEach((o, j) => expect(eq(val(rhs(o)), R(C)), o).toBe(j === sc.correct));
    const sd = choiceOf('masala-3', 1, 2);
    sd.options.forEach((o, j) => expect(eq(val(rhs(o)), R(D)), o).toBe(j === sd.correct));
    const se = choiceOf('masala-3', 2, 0);
    se.options.forEach((o, j) => expect(eq(val(rhs(o)), R(49 * 51)), o).toBe(j === se.correct));
    // 3) 3 × 10 − 4 = 26 < 30 ; E = 1 ; 26 + 10 = 36 ≥ 30.
    const pts = 3 * win - lose;
    expect(expectedOf('masala-3', 2)).toEqual([3, pts, E]);
    expect(E).toBe(1);
    expect(pts).toBeLessThan(need);
    expect(pts + rescue).toBeGreaterThanOrEqual(need);
  });
});
