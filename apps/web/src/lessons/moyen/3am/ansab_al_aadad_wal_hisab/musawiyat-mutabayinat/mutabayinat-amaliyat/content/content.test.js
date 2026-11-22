import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, FINAL, E1, E2, E3, E4, E5, E6, E7, E8, SYMBOL_TEX, tx } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, METHOD, LAB } from './textbook';

/**
 * Les clés du درس « المتباينات والعمليات » recalculées avec un code INDÉPENDANT de `linear.js` : des rationnels en BigInt, un petit évaluateur
 * d'expressions (le LaTeX ÉCRIT dans les options est relu : \frac, {,}, \leq, \geq, multiplication implicite) et des TÉMOINS (échantillons rationnels).
 * Une option juste est vraie pour TOUS les témoins qui vérifient l'hypothèse ; chaque distracteur est FAUX pour au moins un.
 */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const add = (p, q) => R(p.n * q.d + q.n * p.d, p.d * q.d);
const mul = (p, q) => R(p.n * q.n, p.d * q.d);
const neg = (p) => R(-p.n, p.d);
const div = (p, q) => R(p.n * q.d, p.d * q.n);
const cmp = (p, q) => { const l = p.n * q.d; const r = q.n * p.d; return l < r ? -1 : l > r ? 1 : 0; };
const same = (p, q) => cmp(p, q) === 0;

/** Évaluateur : « -\frac{1}{2}m+3 », « 5-2t », « \frac{x}{-4} », « 6{,}5 », « 3x » avec des variables à une lettre. */
function evaluate(src, env) {
  let s = String(src).replace(/\$/g, '').replace(/\\ /g, '').replace(/\s+/g, '').replace(/\{,\}/g, '.');
  let prev;
  do { prev = s; s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))'); } while (s !== prev);
  let i = 0;
  const peek = () => s[i];
  const num = () => { let t = ''; while (/[0-9.]/.test(peek() ?? '')) t += s[i++]; const [a, f = ''] = t.split('.'); return R(BigInt(a + f), 10n ** BigInt(f.length)); };
  const atom = () => {
    const c = peek();
    if (c === '(') { i += 1; const v = expr(); i += 1; return v; }
    if (/[0-9.]/.test(c)) return num();
    if (/[a-zA-Z]/.test(c)) { i += 1; if (!(c in env)) throw new Error(`variable ${c} in ${src}`); return env[c]; }
    throw new Error(`illisible « ${src} » à ${i}`);
  };
  const unary = () => { if (peek() === '-') { i += 1; return neg(unary()); } if (peek() === '+') { i += 1; return unary(); } return atom(); };
  const term = () => {
    let v = unary();
    for (;;) {
      const c = peek();
      if (c === '*') { i += 1; v = mul(v, unary()); } else if (c === '/') { i += 1; v = div(v, unary()); } else if (c && /[0-9.a-zA-Z(]/.test(c)) v = mul(v, unary()); else return v;
    }
  };
  function expr() {
    let v = term();
    while (peek() === '+' || peek() === '-') { const op = s[i++]; const t = term(); v = op === '+' ? add(v, t) : add(v, neg(t)); }
    return v;
  }
  const out = expr();
  if (i !== s.length) throw new Error(`reste « ${s.slice(i)} » dans « ${src} »`);
  return out;
}
/** « lhs REL rhs » (une seule relation) → { l, rel, r } avec rel dans < > <= >= =. */
function split1(tex) {
  const t = String(tex).replace(/\$/g, '').replace(/\\leq/g, '≤').replace(/\\geq/g, '≥');
  const m = t.match(/^(.*?)(≤|≥|<|>|=)(.*)$/);
  return { l: m[1], rel: { '≤': '<=', '≥': '>=', '<': '<', '>': '>', '=': '=' }[m[2]], r: m[3] };
}
/** « lo REL e REL hi » (encadrement). */
function split2(tex) {
  const t = String(tex).replace(/\$/g, '').replace(/\\leq/g, '≤').replace(/\\geq/g, '≥');
  const m = t.match(/^(.*?)(≤|<)(.*)(≤|<)(.*)$/);
  return { lo: m[1], r1: m[2], mid: m[3], r2: m[4], hi: m[5] };
}
const holds = (a, rel, b) => { const c = cmp(a, b); return { '<': c < 0, '>': c > 0, '<=': c <= 0, '>=': c >= 0, '=': c === 0 }[rel]; };
const grid1 = []; for (let n = -64; n <= 64; n += 1) grid1.push(R(BigInt(n), 4n));
const grid1b = []; for (let n = -60; n <= 60; n += 1) grid1b.push(R(BigInt(n), 3n));
const SAMPLES1 = [...grid1, ...grid1b];
const grid2 = []; for (let a = -16; a <= 16; a += 1) for (let b = -16; b <= 16; b += 1) grid2.push([R(BigInt(a), 2n), R(BigInt(b), 2n)]);

/** Une option « expr REL const » pour les variables `vars`, testée contre l'hypothèse `given` (déjà au format texte). */
function envsFor(vars) { return vars.length === 1 ? SAMPLES1.map((x) => ({ [vars[0]]: x })) : grid2.map(([a, b]) => ({ [vars[0]]: a, [vars[1]]: b })); }
const satisfiesGiven = (given, env) => { const g = split1(given.replace(/<=/g, '\\leq').replace(/>=/g, '\\geq')); return holds(evaluate(g.l, env), g.rel, evaluate(g.r, env)); };
const optHolds = (opt, env) => { const g = split1(opt); return holds(evaluate(g.l, env), g.rel, evaluate(g.r, env)); };
const strip = (s) => String(s);

function checkImplication({ vars, given, key, wrongs, options, correct, label }) {
  const envs = envsFor(vars).filter((e) => satisfiesGiven(given, e));
  expect(envs.length, `${label} : témoins`).toBeGreaterThan(50);
  expect(options[correct], label).toBe(`$${tx(key)}$`);
  expect(new Set(options).size, `${label} : options distinctes`).toBe(options.length);
  const written = options.map((o) => o);
  written.forEach((o, i) => {
    if (i === correct) {
      expect(envs.every((e) => optHolds(o, e)), `${label} : la clé ${o} est vraie pour tous les témoins`).toBe(true);
    } else {
      expect(envs.some((e) => !optHolds(o, e)), `${label} : le distracteur ${o} est faux pour un témoin`).toBe(true);
    }
  });
  // la clé est la CONSÉQUENCE la plus fine pour une variable (équivalente à l'hypothèse)
  if (vars.length === 1) {
    const all = envsFor(vars);
    expect(all.every((e) => satisfiesGiven(given, e) === optHolds(options[correct], e)), `${label} : clé équivalente à l'hypothèse`).toBe(true);
  }
  expect(wrongs.length).toBe(options.length - 1);
}

describe('le درس « المتباينات والعمليات » — clés recalculées', () => {
  it('E1 (ex-6, act-2) : a + c, a − c — la borne exacte ; chaque distracteur faux', () => {
    const ex = EXERCISES.find((e) => e.id === 'ex-6');
    E1.forEach((r, i) => {
      const row = ex.question.rows[i];
      checkImplication({ vars: [r.v], given: r.given, key: r.key, wrongs: r.wrongs, options: row.options, correct: row.correct, label: `E1.${i}` });
      expect(row.label).toContain(tx(r.expr));
    });
  });

  it('E2 (act-2 partie 5) : « إن أمكن » — décidable ou non, par témoins des deux signes', () => {
    const ex = EXERCISES.find((e) => e.id === 'act-2');
    const envs = envsFor(E2.vars).filter((e) => holds(e.a, '<', e.b));
    E2.rows.forEach((r, i) => {
      const seen = new Set(envs.map((e) => { const l = evaluate(r.L, e); const rr = evaluate(r.R, e); return cmp(l, rr) < 0 ? '<' : cmp(l, rr) > 0 ? '>' : '='; }));
      if (r.key === 'none') { expect(seen.has('<') && seen.has('>'), `E2.${i} indécidable`).toBe(true); } else { expect([...seen], `E2.${i}`).toEqual([r.key]); }
      // le libellé écrit en LaTeX vaut l'expression en texte simple
      envs.slice(0, 40).forEach((e) => { expect(same(evaluate(r.left, e), evaluate(r.L, e))).toBe(true); expect(same(evaluate(r.right, e), evaluate(r.R, e))).toBe(true); });
      expect(ex.question.rows[i].options[ex.question.rows[i].correct]).toBe(SYMBOL_TEX[r.key]);
      expect(ex.question.rows[i].options).toHaveLength(3);
    });
    expect(E2.rows.map((r) => r.key)).toEqual(['<', '<', '<', 'none']);
  });

  it('E3 (act-2b, ex-18) et E6 (ex-17, ex-7) : le symbole juste pour tous les témoins, les autres faux', () => {
    for (const [ex, id] of [[E3, 'act-2b'], [E6, 'ex-17']]) {
      const exercise = EXERCISES.find((e) => e.id === id);
      const envs = envsFor(ex.vars).filter((e) => satisfiesGiven(ex.given, e));
      ex.rows.forEach((r, i) => {
        const truth = (rel) => envs.every((e) => holds(evaluate(r.L, e), rel, evaluate(r.R, e)));
        expect(truth(r.key), `${id}.${i} ${r.key}`).toBe(true);
        for (const o of ex.options.filter((x) => x !== r.key && x !== 'none')) expect(truth(o), `${id}.${i} ${o} faux`).toBe(false);
        envs.slice(0, 40).forEach((e) => { expect(same(evaluate(r.left, e), evaluate(r.L, e))).toBe(true); expect(same(evaluate(r.right, e), evaluate(r.R, e))).toBe(true); });
        const row = exercise.question.rows[i];
        expect(row.options[row.correct]).toBe(SYMBOL_TEX[r.key]);
      });
    }
    expect(E3.rows.map((r) => r.key)).toEqual(['<', '>', '<', '>', '>']);
    expect(E6.rows.map((r) => r.key)).toEqual(['<=', '>=', '>=', '<=']);
  });

  it('E4 (ex-13, now-75-1) : m > 2 et cinq expressions ; la clé est la conséquence exacte', () => {
    const ex = EXERCISES.find((e) => e.id === 'ex-13');
    E4.forEach((r, i) => {
      const row = ex.question.rows[i];
      checkImplication({ vars: [r.v], given: r.given, key: r.key, wrongs: r.wrongs, options: row.options, correct: row.correct, label: `E4.${i}` });
    });
    expect(E4.map((r) => r.key)).toEqual(['m+6>8', 'm-9>-7', '5m>10', '-4m<-8', '-(1/2)m+3<2']);
  });

  it('E5 (ex-14 … ex-16, now-75-2) : une inégalité de premier terme x, équivalente à l\'hypothèse', () => {
    const ex = EXERCISES.find((e) => e.id === 'ex-14');
    E5.forEach((r, i) => {
      const row = ex.question.rows[i];
      checkImplication({ vars: [r.v], given: r.given, key: r.key, wrongs: r.wrongs, options: row.options, correct: row.correct, label: `E5.${i}` });
      // l'hypothèse écrite en LaTeX est celle du texte simple
      const g = split1(r.givenTex); const p = split1(r.given.replace(/<=/g, '\\leq').replace(/>=/g, '\\geq'));
      expect(g.rel).toBe(p.rel);
      SAMPLES1.slice(0, 80).forEach((x) => { expect(same(evaluate(g.l, { x }), evaluate(p.l, { x }))).toBe(true); expect(same(evaluate(g.r, { x }), evaluate(p.r, { x }))).toBe(true); });
    });
    expect(E5.map((r) => r.key)).toEqual(['x<=5', 'x<-4', 'x>=-18']);
  });

  it('E7 (ex-23, ex-24) : les bornes d\'un encadrement, recalculées aux deux bouts', () => {
    const ex = EXERCISES.find((e) => e.id === 'ex-23');
    E7.forEach((r, i) => {
      const row = ex.question.rows[i];
      const ends = (b) => [evaluate(b.lo, {}), evaluate(b.hi, {})];
      const lo = evaluate(r.interval.lo, {}); const hi = evaluate(r.interval.hi, {});
      const f = (x) => evaluate(r.expr.replace('/', '/'), { [r.v]: x });
      const [klo, khi] = ends(r.key);
      expect(same(f(lo), klo) && same(f(hi), khi), `E7.${i} bornes`).toBe(true);
      row.options.forEach((o, k) => {
        const s = split2(o);
        const a = evaluate(s.lo, {}); const b = evaluate(s.hi, {});
        const mid = s.mid;
        expect(mid.replace(/\s/g, ''), `E7.${i} milieu`).toBe(tx(r.expr));
        expect(same(a, klo) && same(b, khi), `E7.${i} option ${o}`).toBe(k === row.correct);
        if (k === row.correct) expect(cmp(a, b)).toBeLessThan(0);
      });
    });
    expect(E7.map((r) => `${r.key.lo}-${r.key.hi}`)).toEqual(['16-26', '4-9/2']);
  });

  it('E8 (ex-26) : 3 ≤ 2x + 1 < 9 ⟺ 1 ≤ x < 4 ; les distracteurs décrivent d\'autres ensembles', () => {
    const row = EXERCISES.find((e) => e.id === 'ex-26').question.rows[0];
    const inGiven = (x) => holds(evaluate(E8.given.lo, {}), E8.given.loRel, evaluate(E8.given.expr, { x })) && holds(evaluate(E8.given.expr, { x }), E8.given.hiRel, evaluate(E8.given.hi, {}));
    row.options.forEach((o) => {
      const s = split2(o);
      const rel1 = s.r1 === '≤' || s.r1 === '\\leq' ? '<=' : '<';
      const inOpt = (x) => holds(evaluate(s.lo, {}), rel1, x) && holds(x, s.r2.includes('≤') || s.r2 === '≤' ? '<=' : '<', evaluate(s.hi, {}));
      void inOpt;
    });
    const parse = (o) => { const t = o.replace(/\$/g, ''); const m = t.match(/^(\d+)(\\leq |<)x(\\leq |<)(\d+)$/); return { lo: R(BigInt(m[1])), r1: m[2] === '<' ? '<' : '<=', r2: m[3] === '<' ? '<' : '<=', hi: R(BigInt(m[4])) }; };
    const sets = row.options.map((o) => { const p = parse(o); return SAMPLES1.map((x) => holds(p.lo, p.r1, x) && holds(x, p.r2, p.hi)); });
    const truth = SAMPLES1.map(inGiven);
    sets.forEach((s, k) => expect(s.every((v, j) => v === truth[j]), `E8 option ${k}`).toBe(k === row.correct));
  });

  it('le إختبار أولي : chaque clé vraie, chaque distracteur faux, et le module contient chaque option', () => {
    const src = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    for (const f of FINAL) f.options.forEach((o) => expect(src.includes(`'${o.replace(/\\/g, '\\\\')}'`), `${f.id} option ${o} absente du module`).toBe(true));
    for (const f of FINAL.filter((x) => typeof x.given === 'string')) {
      checkImplication({ vars: f.vars, given: f.given, key: f.key, wrongs: f.wrongs, options: f.options, correct: f.correct, label: f.id });
    }
    // E5 : 2 ≤ t ≤ 4 ⟹ 5 − 2t entre −3 et 1 ; les autres encadrements
    const e5 = FINAL.find((f) => f.id === 'E5');
    const ts = [R(2n), R(3n), R(4n)];
    const values = ts.map((t) => evaluate(e5.expr, { t }));
    const lo = values.reduce((m, v) => (cmp(v, m) < 0 ? v : m)); const hi = values.reduce((m, v) => (cmp(v, m) > 0 ? v : m));
    expect(same(lo, R(-3n)) && same(hi, R(1n))).toBe(true);
    e5.options.forEach((o, k) => {
      const s = split2(o);
      const a = evaluate(s.lo, {}); const b = evaluate(s.hi, {});
      expect(s.mid.trim()).toBe('5-2t');
      expect(same(a, lo) && same(b, hi), `E5 ${o}`).toBe(k === e5.correct);
      // chaque distracteur est faux pour au moins un t de {2, 3, 4}
      if (k !== e5.correct) expect(ts.some((t) => { const v = evaluate('5-2t', { t }); return !(cmp(a, v) <= 0 && cmp(v, b) <= 0); }), `E5 ${o} faux`).toBe(true);
    });
    expect(FINAL.map((f) => f.lp.slice(-2))).toEqual(['P1', 'P2', 'P3', 'P4', 'P4']);
  });

  it('la طريقة : A (7 − 2x ≥ 1 ⟹ x ≤ 3), B (A − B = 2x − 4 > 0 si x > 2), C (2 ≤ t ≤ 5 ⟹ −6 ≤ −2t + 4 ≤ 0)', () => {
    for (const x of SAMPLES1) {
      const holdsGiven = holds(add(R(7n), mul(R(-2n), x)), '>=', R(1n));
      expect(holdsGiven).toBe(holds(x, '<=', R(3n)));
    }
    const A = (x) => add(mul(R(4n), x), R(1n)); const B = (x) => add(mul(R(2n), x), R(5n));
    expect([A(R(3n)), B(R(3n)), A(R(5n, 2n)), B(R(5n, 2n))].map((v) => `${v.n}/${v.d}`)).toEqual(['13/1', '11/1', '11/1', '10/1']);
    SAMPLES1.filter((x) => holds(x, '>', R(2n))).forEach((x) => expect(cmp(A(x), B(x))).toBe(1));
    expect(SAMPLES1.some((x) => cmp(A(x), B(x)) <= 0)).toBe(true);
    const f = (t) => add(mul(R(-2n), t), R(4n));
    expect(same(f(R(2n)), R(0n)) && same(f(R(5n)), R(-6n))).toBe(true);
    SAMPLES1.filter((t) => holds(R(2n), '<=', t) && holds(t, '<=', R(5n))).forEach((t) => expect(cmp(f(t), R(-6n)) >= 0 && cmp(f(t), R(0n)) <= 0).toBe(true));
    // -3x + 5 pour x > 4 : < -7 ; les autres options fausses
    const g = (x) => add(mul(R(-3n), x), R(5n));
    const xs = SAMPLES1.filter((x) => holds(x, '>', R(4n)));
    expect(xs.every((x) => holds(g(x), '<', R(-7n)))).toBe(true);
    expect(xs.some((x) => !holds(g(x), '>', R(-7n)))).toBe(true);
    expect(xs.some((x) => !holds(g(x), '<', R(-12n)))).toBe(true);
    expect(xs.some((x) => !holds(g(x), '>', R(-12n)))).toBe(true);
    expect(METHOD.bracket.solution).toHaveLength(3);
  });

  it('« أستعدّ » : chaque affirmation a la vérité qu\'elle annonce', () => {
    const claims = [
      [PREP_PLATFORM_ITEMS[0], holds(add(mul(R(2n), R(4n)), R(-3n)), '<', R(5n))],
      [PREP_PLATFORM_ITEMS[1], holds(add(R(3n), neg(R(-1n))), '>', R(3n))],
      [PREP_PLATFORM_ITEMS[2], same(mul(R(-6n), R(-2n, 3n)), R(-4n))],
      [PREP_PLATFORM_ITEMS[3], same(mul(R(-5n), R(6n, 5n)), R(-6n))],
      [PREP_ITEMS[0], holds(R(-3n, 4n), '<', R(-1n, 2n))],
      [PREP_ITEMS[1], holds(R(-7n, 3n), '<', R(-8n, 3n))],
      [PREP_PLATFORM_ITEMS[4], same(mul(R(-3n), R(5n)), mul(R(-3n), R(5n)))],
    ];
    for (const [item, truth] of claims) expect(item.answer, item.text).toBe(truth);
    expect(PREP_ITEMS.map((i) => i.n)).toEqual([7, 8]);
  });

  it('le labo posé seul : × (−2) fait passer −3 < 2 à 6 > −4 ; chaque exercice nomme son LP', () => {
    const t = LAB.alone.tasks[0];
    expect(t.target).toEqual(['6', '-4']);
    expect(same(mul(R(-3n), R(-2n)), R(6n)) && same(mul(R(2n), R(-2n)), R(-4n))).toBe(true);
    for (const ex of EXERCISES) { expect(ex.learningPointId).toMatch(/^3am_mutabayinat-amaliyat_P[1-4]$/); expect(ex.source.type).toBe('textbook'); }
    expect(strip('ok')).toBe('ok');
  });
});
