import { describe, it, expect } from 'vitest';
import catalogue from '../../../../../../../../../../packages/core/curriculum/dz/lessons_3am_2026_2027.json';
import { LESSON_CONFIG } from '../lesson.config';
import { LEVELS } from '../../../../../../common/manipulations/levels';
import { TWIN_TASKS } from '../../../../../../common/manipulations/logic/marbleRun';
import { LAB, KNOWLEDGE, METHOD_VALUES, PREP_ITEMS, GUIDE, RECALL_1AM, RECALL_OPS } from './textbook';
import { EXERCISES, EX, FINAL, FIGURE_E8, ROWS_E1, ROWS_E2, ROWS_E3, ROWS_E4, ROWS_E5, ROWS_E7, ROWS_E8, ROWS_E9, LP } from './exercises';
import itqan from '../modules/Module08Itqan.jsx?raw';
import astaidd from '../modules/Module00Astaidd.jsx?raw';
import knowledgeSrc from '../knowledge.jsx?raw';

/* ═════ Un évaluateur de rationnels BigInt écrit À PART (jamais le cœur de la plateforme) ═════ */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const F = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const ipow = (a, k) => { let r = F(1n); for (let i = 0; i < k; i += 1) r = mul(r, a); return r; };
const num = (s) => { const t = String(s).replace(/[−]/g, '-').replace(',', '.'); const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(t); if (!m) throw new Error(`nombre: ${s}`); const frac = m[3] ?? ''; return F(BigInt(`${m[1]}${m[2]}${frac}`), 10n ** BigInt(frac.length)); };
const frac = (s) => { const [a, b] = String(s).split('/'); return b ? F(BigInt(a), BigInt(b)) : num(a); };

/** Évalue une expression écrite (x, y, a, + − × ( ) ², ^2, ^3, produit implicite) en rationnel exact, par descente récursive. */
function evalExpr(src, env = {}) {
  const t = [...String(src).replace(/\s+/g, '').replace(/−/g, '-').replace(/×/g, '*').replace(/²/g, '^2').replace(/³/g, '^3').replace(/,/g, '.')];
  let p = 0;
  const peek = () => t[p];
  const isDigit = (c) => c !== undefined && /[0-9.]/.test(c);
  const isVar = (c) => c !== undefined && /[a-z]/.test(c);
  function expr() { let a = term(); while (peek() === '+' || peek() === '-') { const op = t[p++]; const b = term(); a = op === '+' ? add(a, b) : sub(a, b); } return a; }
  function term() { let a = unary(); for (;;) { if (peek() === '*') { p += 1; a = mul(a, power()); } else if (isVar(peek()) || peek() === '(') a = mul(a, power()); else return a; } }
  function unary() { if (peek() === '-') { p += 1; if (isDigit(peek())) { const save = p; const n = number(); if (peek() === '^') { p = save; return mul(F(-1n), power()); } return mul(F(-1n), n); } return mul(F(-1n), unary()); } return power(); }
  function power() { const a = atom(); if (peek() === '^') { p += 1; const k = Number(t[p++]); return ipow(a, k); } return a; }
  function number() { let s = ''; while (isDigit(peek())) s += t[p++]; return num(s); }
  function atom() { if (isDigit(peek())) return number(); if (isVar(peek())) { const v = t[p++]; if (!(v in env)) throw new Error(`lettre ${v}`); return frac(env[v]); } if (peek() === '(') { p += 1; const a = expr(); if (t[p++] !== ')') throw new Error('parenthèse'); return a; } throw new Error(`illisible: ${src}`); }
  const v = expr();
  if (p !== t.length) throw new Error(`reste: ${src}`);
  return v;
}
const at = (expr, env) => evalExpr(expr, env);

/** Les valeurs écrites dans une option LaTeX : « $-11$ », « $\frac{5}{2}$ », « $18{,}75$ », « $4$ و $4$ » → liste de rationnels. */
function optValues(o) {
  const s = String(o).replace(/\\left|\\right/g, '').replace(/\{,\}/g, '.').replace(/−/g, '-');
  const out = [];
  for (const m of s.matchAll(/(-?)\\frac\{(\d+)\}\{(\d+)\}|(-?\d+(?:\.\d+)?)/g)) out.push(m[2] ? F(BigInt(`${m[1]}${m[2]}`), BigInt(m[3])) : num(m[4]));
  return out;
}
const rows = { E1: ROWS_E1, E2: ROWS_E2, E3: ROWS_E3, E4: ROWS_E4, E5: ROWS_E5, E7: ROWS_E7, E8: ROWS_E8, E9: ROWS_E9 };
const XS = [-4, -3, -2, -1, 0, 1, 2, 3, 5].map((v) => String(v));

describe('qimat-ibara-harfiya — le labo et le catalogue', () => {
  it('LAB mirrors the presets of levels.js and the twin tasks of the logic', () => {
    const lv = LEVELS['marble-run'];
    expect(lv.beginner.numbers.tasks.map(({ id, expr, target }) => ({ id, expr, target }))).toEqual(LAB.run.beginner.map(({ id, expr, target }) => ({ id, expr, target })));
    expect(lv.advanced.numbers.tasks.map(({ id, expr, target }) => ({ id, expr, target }))).toEqual(LAB.run.advanced.map(({ id, expr, target }) => ({ id, expr, target })));
    expect(TWIN_TASKS.map(({ id, a, b }) => ({ id, a, b }))).toEqual(LAB.twins.map(({ id, a, b }) => ({ id, a, b })));
  });
  it('every lab task value is recomputed', () => {
    for (const tk of [...LAB.run.beginner, ...LAB.run.advanced]) expect(eq(at(tk.expr, tk.target), frac(tk.value)), tk.id).toBe(true);
    for (const tw of LAB.twins) {
      const agree = XS.every((x) => eq(at(tw.a, { x }), at(tw.b, { x })));
      expect(agree, tw.id).toBe(tw.equal);
    }
    // les valeurs citées dans les encadrés du labo twins : (0 → 6/6, 1 → 12/7), (0,1 → 2/2, 4/4 ; 2 → 10/8), tw3 égales sur le râtelier −3…3
    const pair = (a, b, x) => [at(a, { x }), at(b, { x })].map((v) => v.n / v.d);
    expect(pair('(x+2)(x+3)', 'x²+6', '0')).toEqual([6n, 6n]); expect(pair('(x+2)(x+3)', 'x²+6', '1')).toEqual([12n, 7n]);
    expect(pair('2x²+2', 'x²+x+2', '1')).toEqual([4n, 4n]); expect(pair('2x²+2', 'x²+x+2', '2')).toEqual([10n, 8n]);
    for (const x of ['-3', '-2', '-1', '0', '1', '2', '3']) expect(eq(at('(x-2)(3x+3)', { x }), at('3(x²-1)-3(x+1)', { x })), x).toBe(true);
  });
  it('the config skills and the catalogue entry carry the same three الكفاءات and the same programme item', () => {
    const entry = catalogue.lessons.find((l) => l.code === 'qimat-ibara-harfiya');
    expect(entry.pointsToLearn).toEqual(LESSON_CONFIG.skills);
    expect(entry.programmeItems).toEqual(['3am.m5.r03']);
    expect(LESSON_CONFIG.modules).toHaveLength(9);
  });
});

describe('qimat-ibara-harfiya — « أستعدّ » et les encadrés', () => {
  it('the truth of each affirmation', () => {
    const r = (a, b) => eq(a, b);
    const truth = [
      r(add(F(-3n, 4n), F(1n, 2n)), F(-1n, 4n)), // vrai
      r(mul(F(-2n, 3n), F(6n)), F(4n)), // faux : −4
      r(mul(F(4n), num('7,5')), F(30n)), // vrai
      r(ipow(F(-3n), 2), F(-9n)), // faux : 9
      r(sub(F(9n), mul(F(4n), F(2n))), F(10n)), // faux : 1
      true, // a·a·a = a³ (définition)
    ];
    expect(PREP_ITEMS.map((i) => i.answer)).toEqual(truth);
    expect(new Set(PREP_ITEMS.map((i) => i.answer)).size).toBe(2);
    expect(PREP_ITEMS[4].why).toContain('1'); expect(sub(F(9n), F(8n)).n).toBe(1n);
    expect(PREP_ITEMS[4].cites.map((c) => c.number)).toEqual([2, 3]);
    expect(astaidd).toContain("requires: ['amaliyat-natiqa-3am']");
  });
  it('the recalls point to the right lessons', () => {
    expect(RECALL_1AM.lesson).toBe('tatbiq-qaida-harfiya'); expect(RECALL_OPS.lesson).toBe('amaliyat-natiqa');
    expect(eq(mul(F(4n), F(5n)), F(20n))).toBe(true); // 4 × 5 = 20 (mémoire de 1AM)
  });
  it('the box examples are right', () => {
    expect(eq(at('4-3x²', { x: '-2' }), F(-8n))).toBe(true); expect(KNOWLEDGE.example.text).toContain('-8');
    expect(eq(at('4x', { x: '3' }), F(12n))).toBe(true);
    expect(eq(at('x²-3x', { x: '-2' }), F(10n))).toBe(true); expect(eq(ipow(F(-2n), 2), F(4n))).toBe(true); expect(eq(F(-4n), mul(F(-1n), ipow(F(2n), 2)))).toBe(true);
    expect(eq(at('3x-2y', { x: '2', y: '-1' }), F(8n))).toBe(true);
    expect(eq(at('(x+2)(x+3)', { x: '1' }), F(12n))).toBe(true); expect(eq(at('x²+6', { x: '1' }), F(7n))).toBe(true);
    // 2x² − 5x + 1 (module 2) et B = (4 − x)(y + 2)
    expect(eq(at('2x²-5x+1', { x: '3' }), F(4n))).toBe(true); expect(eq(at('2x²-5x+1', { x: '-1' }), F(8n))).toBe(true);
    expect(eq(at('(4-x)(y+2)', { x: '-1.5', y: '-7' }), num('-27.5'))).toBe(true);
    // π : 36 + 9π/2 ≈ 50,137 → 50,13
    expect(36 + 4.5 * Math.PI).toBeCloseTo(50.1371, 3); expect(Math.floor((36 + 4.5 * Math.PI) * 100) / 100).toBe(50.13);
  });
  it('the common-mistake lines quote true numbers', () => {
    expect(eq(at('x²', { x: '-3' }), F(9n))).toBe(true); expect(GUIDE.negPower.why).toContain('9');
    expect(eq(mul(F(4n), F(3n)), F(12n))).toBe(true); expect(GUIDE.fused.why).toContain('12');
    const a = (x) => [at('x²+5', { x }), at('x²-4x+5', { x })];
    expect(eq(a('0')[0], a('0')[1])).toBe(true); expect(a('1').map((v) => Number(v.n))).toEqual([6, 2]); expect(GUIDE.oneValue.why).toContain('5');
  });
  it('the method: A = −3, B = C = −9 at x = 1; B and C both expand to 3x² − 12', () => {
    const [A, B, C] = ['3x²-6', '(x-2)(3x+6)', '3(x²-x)+3(x-4)'];
    expect([A, B, C].map((e) => Number(at(e, { x: '1' }).n))).toEqual([-3, -9, -9]);
    for (const x of XS) { expect(eq(at(B, { x }), at(C, { x })), x).toBe(true); expect(eq(at(B, { x }), at('3x²-12', { x })), x).toBe(true); }
    expect(eq(at(A, { x: '1' }), at(B, { x: '1' }))).toBe(false);
    expect(METHOD_VALUES.solution).toHaveLength(5);
    const p = (x) => [at('x²+5', { x }), at('x²-4x+5', { x })].map((v) => Number(v.n));
    expect(p('0')).toEqual([5, 5]); expect(p('1')).toEqual([6, 2]); expect(METHOD_VALUES.remark).toContain('6');
  });
});

describe('qimat-ibara-harfiya — les lignes de valeur : clé recalculée, distracteurs FAUX', () => {
  it('every value row', () => {
    let n = 0;
    for (const [name, list] of Object.entries(rows)) {
      list.forEach((rw, i) => {
        const id = `${name}[${i}]`;
        expect(rw.options.length, id).toBeGreaterThanOrEqual(3);
        expect(new Set(rw.options).size, id).toBe(rw.options.length);
        expect(rw.correct, id).toBeGreaterThanOrEqual(0); expect(rw.correct, id).toBeLessThan(rw.options.length);
        const d = rw.data ?? {};
        if (d.kind === 'value') {
          n += 1;
          const key = at(d.expr, d.env);
          expect(eq(key, frac(d.key)), `${id} key`).toBe(true);
          rw.options.forEach((o, k) => {
            const v = optValues(o);
            expect(v.length, `${id} option ${k}`).toBe(1);
            expect(eq(v[0], key), `${id} option ${k} = ${o}`).toBe(k === rw.correct);
          });
        } else if (d.kind === 'pair') {
          n += 1;
          const pair = [at(d.a, { a: d.at }), at(d.b, { a: d.at })];
          expect(pair.every((v, k) => eq(v, frac(d.key[k]))), `${id} pair`).toBe(true);
          rw.options.forEach((o, k) => {
            const v = optValues(o);
            expect(v.length, `${id} option ${k}`).toBe(2);
            expect(v.every((x, j) => eq(x, pair[j])), `${id} option ${k}`).toBe(k === rw.correct);
          });
        }
      });
    }
    expect(n).toBeGreaterThanOrEqual(24);
  });
  it('the exercise rows quote their own numbers', () => {
    // E1 : A en 1, −1, 4 ; le développement du camarade
    expect(['1', '-1', '4'].map((x) => Number(at('(2x+3)(x-4)', { x }).n))).toEqual([-15, -5, 0]);
    expect(['1', '-1', '4'].map((x) => Number(at('2x²-11x-6', { x }).n))).toEqual([-15, 7, -18]);
    for (const x of XS) expect(eq(at('(2x+3)(x-4)', { x }), at('2x²-5x-12', { x })), x).toBe(true);
    expect(eq(at('(2x+3)(x-4)', { x: '1' }), at('2x²-11x-6', { x: '1' }))).toBe(true); // l'accord de x = 1
    // E3 : vraie égalité (2x−1)(3−x) = −2x² + 7x − 3 ; fausse 6x − 2x² = −2x(x + 3)
    for (const x of XS) expect(eq(at('(2x-1)(3-x)', { x }), at('-2x²+7x-3', { x })), x).toBe(true);
    expect(XS.some((x) => !eq(at('6x-2x²', { x }), at('-2x(x+3)', { x })))).toBe(true);
    expect([at('6x-2x²', { x: '1' }), at('-2x(x+3)', { x: '1' })].map((v) => Number(v.n))).toEqual([4, -8]);
    // E5 : x = −5
    expect([at('(x+5)(x-2)', { x: '-5' }), at('x²-10', { x: '-5' })].map((v) => Number(v.n))).toEqual([0, 15]);
    // E7 : (1 + a)(4 + a) et 6a + 4, d'accord en 0 et en 1, séparées en 2
    const e7 = (a) => [at('(1+a)(4+a)', { a }), at('6a+4', { a })].map((v) => Number(v.n));
    expect([e7('0'), e7('1'), e7('2')]).toEqual([[4, 4], [10, 10], [18, 16]]);
    // E9 : (4x − 3)(2x + 5) = 8x² + 14x − 15 ; l'autre, 8x² + 26x − 15, est fausse mais d'accord en 0
    for (const x of XS) expect(eq(at('(4x-3)(2x+5)', { x }), at('8x²+14x-15', { x })), x).toBe(true);
    expect(['-2', '-1', '0', '1', '2'].map((x) => Number(at('(4x-3)(2x+5)', { x }).n))).toEqual([-11, -21, -15, 7, 45]);
    expect(['-2', '-1', '0', '1', '2'].map((x) => Number(at('8x²+26x-15', { x }).n))).toEqual([-35, -33, -15, 19, 69]);
    // E4 : h = 20t − 5t²
    expect(['1', '2', '4', '1.5'].map((t) => at('20t-5t²', { t }))).toEqual([F(15n), F(20n), F(0n), F(75n, 4n)]);
    // self-3 : (x + 6)(x − 3) en −2
    expect(Number(at('(x+6)(x-3)', { x: '-2' }).n)).toBe(EX['self-3'].question.expected);
  });
  it('the figure of the π exercise is measured from its coordinates', () => {
    const P = FIGURE_E8.points;
    const dist = (a, b) => Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]);
    expect(['AB', 'BC', 'CD', 'DA'].map((s) => dist(s[0], s[1]))).toEqual([6, 6, 6, 6]);
    const arc = FIGURE_E8.arcs[0];
    const r = dist(arc.from, arc.to) / 2; // demi-cercle de diamètre [DC] = un côté du carré
    expect(r).toBe(3);
    const area = 36 + 0.5 * Math.PI * r * r;
    expect(area).toBeCloseTo(50.1371, 3);
    expect(Math.floor(area * 100) / 100).toBe(50.13); // « بالنقصان »
    expect(Math.round(area * 100) / 100).toBe(50.14); // l'arrondi : l'option fausse de la banque de réponses
    const exact = ROWS_E8[0]; expect(exact.options[exact.correct]).toBe('$36+\\frac92\\pi$');
    expect(ROWS_E8[1].options[ROWS_E8[1].correct]).toBe('$50{,}13$');
  });
});

describe('qimat-ibara-harfiya — les exercices', () => {
  it('each exercise has one primary الكفاءة of THIS lesson, a source, and the 9 expected ids', () => {
    expect(EXERCISES.map((e) => e.id)).toEqual(['act-4', 'ex-1', 'ex-3', 'ex-4', 'now-61', 'self-3', 'deep-39', 'deep-37', 'ict']);
    for (const e of EXERCISES) { expect(Object.values(LP)).toContain(e.learningPointId); expect(e.source.elementId).toBe(e.id); expect(e.source.number == null || typeof e.source.number === 'number').toBe(true); }
    expect(EX['ex-1'].cites.map((c) => c.elementId)).toEqual(['ex-2']);
    expect(new Set(EXERCISES.map((e) => e.learningPointId)).size).toBe(3);
  });
});

describe('qimat-ibara-harfiya — le إختبار أولي', () => {
  it('every key is recomputed and every distractor is FALSE and distinct', () => {
    expect(FINAL).toHaveLength(5);
    for (const f of FINAL) {
      expect(new Set(f.options).size, f.id).toBe(f.options.length);
      if (f.kind === 'value') {
        const key = at(f.expr, f.env);
        f.values.forEach((v, k) => expect(eq(frac(v), key), `${f.id} option ${k}`).toBe(k === f.correct));
        f.options.forEach((o, k) => { const x = optValues(o); expect(x.length, f.id).toBe(1); expect(eq(x[0], frac(f.values[k])), `${f.id} ${o}`).toBe(true); });
      } else {
        const a = at(f.a, { x: f.at }); const b = at(f.b, { x: f.at });
        expect(eq(a, b)).toBe(false);
        expect([Number(a.n), Number(b.n)]).toEqual([4, 2]);
        expect(f.options[f.correct]).toContain('4'); expect(f.options[f.correct]).toContain('2');
        expect(f.options[f.correct]).toContain('غير متساويتين');
        // « متساويتان لأنّ لهما القيمة 1 من أجل x = 0 » : vrai sur la valeur, faux comme conclusion
        expect(eq(at('(x+1)²', { x: '0' }), at('x²+1', { x: '0' }))).toBe(true);
        expect(XS.some((x) => !eq(at('(x+1)²', { x }), at('x²+1', { x })))).toBe(true);
      }
    }
  });
  it('the named mistakes behind the distractors really give those values', () => {
    // E1 5 − 2x en −3 : −1 (signe perdu), −9 ((5 − 2) × (−3)), 0 (5 − 2 − 3)
    expect([5 - 2 * 3, (5 - 2) * -3, 5 - 2 - 3]).toEqual([-1, -9, 0]);
    // E2 x² − 4 en −3 : −13 (−3² − 4), −10 (x² lu 2x : 2 × (−3) − 4), 13
    expect([-(3 ** 2) - 4, 2 * -3 - 4, 9 + 4]).toEqual([-13, -10, 13]);
    // E3 3x² en −2 : 36 ((3 × (−2))²), −12 (−3 × 4), −36
    expect([(3 * -2) ** 2, -(3 * 2 ** 2), -((3 * -2) ** 2)]).toEqual([36, -12, -36]);
    // E4 2x − 3y en (1/2, −1) : −2 (signe de y perdu), −7/2 (x et y échangés)
    expect(eq(sub(mul(F(2n), F(1n, 2n)), mul(F(3n), F(1n))), F(-2n))).toBe(true);
    expect(eq(at('2x-3y', { x: '-1', y: '1/2' }), F(-7n, 2n))).toBe(true);
  });
  it('the module source holds the options verbatim and every assessment is literal', () => {
    for (const f of FINAL) for (const o of f.options) expect(itqan, `${f.id} ${o}`).toContain(o.replace(/\\/g, '\\\\'));
    expect((itqan.match(/learningPointIds: \['3am_qimat-ibara-harfiya_P[123]'\]/g) ?? []).length).toBe(5);
    expect(new Set(FINAL.map((f) => f.lp))).toEqual(new Set([LP.P1, LP.P2, LP.P3]));
    expect(itqan).toContain("source={SELF[3].source}");
  });
  it('every brick used by a module exists in knowledge.jsx', () => {
    for (const id of ['ithar-darb', 'aqwas-salib', 'nafs-al-adad', 'harfan', 'tawid-qimat', 'mithal-mudad', 'nashr-yuthbit']) expect(knowledgeSrc, id).toContain(`id: '${id}'`);
  });
});
