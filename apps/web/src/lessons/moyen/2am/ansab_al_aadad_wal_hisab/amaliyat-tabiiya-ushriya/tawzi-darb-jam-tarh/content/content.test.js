import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, EX, FINAL, MENTAL_ROWS, tex } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, METHOD, KNOWLEDGE, GUIDE, LAB } from './textbook';
import { LEVELS } from '../../../../../../common/manipulations/levels';

/**
 * Les clés du درس « توزيع الضرب على الجمع والطرح » recalculées avec un code INDÉPENDANT de `chainOps.js` : un évaluateur de descente récursive en BigInt (rationnels exacts, priorités, parenthèses ; une
 * différence NÉGATIVE fait échouer le test : toute chaîne de la leçon vaut un nombre ≥ 0) et un lecteur d'égalités « a = b = c ». Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX et
 * reproduisant son erreur nommée (MISC-TAWZI-*) ; chaque option d'une épreuve du إختبار أولي est présente LITTÉRALEMENT dans Module08Itqan.jsx.
 */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const Q = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const add = (p, q) => Q(p.n * q.d + q.n * p.d, p.d * q.d);
const sub = (p, q) => { const r = Q(p.n * q.d - q.n * p.d, p.d * q.d); if (r.n < 0n) throw new Error('différence négative'); return r; };
const mul = (p, q) => Q(p.n * q.n, p.d * q.d);
const div = (p, q) => { if (q.n === 0n) throw new Error('÷ 0'); return Q(p.n * q.d, p.d * q.n); };
const same = (p, q) => p.n === q.n && p.d === q.d;
const num = (s) => { const [i, f = ''] = String(s).replace(',', '.').trim().split('.'); return Q(BigInt(i + f), 10n ** BigInt(f.length)); };
const OPS = { '+': add, '−': sub, '×': mul, '÷': div };
const lex = (text) => text.replace(/\$/g, '').replace(/\s+/g, '').match(/\d+(?:,\d+)?|[()+−×÷]/g);
const ev = (text) => {
  const t = lex(text); let i = 0;
  const factor = () => { const x = t[i++]; if (x === '(') { const v = expr(); i += 1; return v; } return num(x); };
  const term = () => { let v = factor(); while (t[i] === '×' || t[i] === '÷') { const o = t[i++]; v = OPS[o](v, factor()); } return v; };
  const expr = () => { let v = term(); while (t[i] === '+' || t[i] === '−') { const o = t[i++]; v = OPS[o](v, term()); } return v; };
  const v = expr();
  if (i !== t.length) throw new Error(`reste : ${text}`);
  return v;
};
/** LaTeX → texte brut évaluable. */
const plain = (s) => String(s).replace(/\$/g, '').replace(/\{,\}/g, ',').replace(/\\,/g, '').replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/ - /g, ' − ').replace(/-/g, '−');
/** « a = b = c » → true si tous les membres sont égaux. */
const holds = (s) => plain(s).split(' و ').every((part) => { const sides = part.split('=').map((x) => x.trim()); return sides.every((x) => same(ev(x), ev(sides[0]))); });
const rows = (id) => EX[id].question.rows;
const rightOf = (r) => r.options[r.correct];
const wrongsOf = (r) => r.options.filter((_, i) => i !== r.correct);

describe('le درس « توزيع الضرب على الجمع والطرح » — clés recalculées', () => {
  it('l\'évaluateur de contrôle donne les valeurs du labo (30, 72, 56, 96, 432, 30, 42)', () => {
    const t = Object.fromEntries([...LEVELS['kit-packer'].beginner.numbers.tasks, ...LEVELS['kit-packer'].advanced.numbers.tasks].map((x) => [x.id, x]));
    const total = (x) => (x.op === '−' ? ev(`${x.k} × (${x.a} − ${x.b})`) : ev(`${x.k} × (${x.a} + ${x.b})`));
    expect([t.k1, t.k2, t.k3, t.a2, t.a3].map(total).map((q) => String(Number(q.n) / Number(q.d)))).toEqual(['30', '72', '56', '30', '42']);
    expect(t.k4.n + t.k4.m).toBe(96); expect(t.k4.n / t.k4.a).toBe(12); expect(t.k4.m / t.k4.b).toBe(12);
    expect(t.a1.k * t.a1.n).toBe(432);
    expect(LAB.alone.tasks[0]).toMatchObject({ k: 5, a: 6, b: 4 });
    // chaque distributeur de k1–k3, a2, a3 : n = k × a, m = k × b
    for (const x of [t.k1, t.k2, t.k3, t.a3]) expect([x.k * x.a, x.k * x.b].every(Number.isInteger)).toBe(true);
  });
  it('act-6 / ex-24 / ex-26 / ex-32 / ex-27 : chaque option est une égalité VRAIE telle qu\'écrite ; seule la bonne donne la valeur attendue', () => {
    const KEY = { 'act-6': ['28', '16'], 'ex-24': ['156', '210', '25'], 'ex-26': ['90', '45'], 'ex-32': MENTAL_ROWS.map((r) => String(Number(ev(r.chain).n) / Number(ev(r.chain).d)).replace('.', ',')), 'ex-27': ['75'] };
    const last = (s) => ev(plain(s).split(' و ').at(-1).split('=').at(-1));
    for (const [id, keys] of Object.entries(KEY)) {
      keys.forEach((k, i) => {
        const r = rows(id)[i];
        expect(holds(rightOf(r)), `${id} #${i} juste`).toBe(true);
        expect(same(last(rightOf(r)), num(k)), `${id} #${i} valeur`).toBe(true);
        wrongsOf(r).forEach((w) => { expect(holds(w), `${id} #${i} ${w} est une égalité vraie de sa lecture`).toBe(true); expect(same(last(w), num(k)), `${id} #${i} faux : ${w}`).toBe(false); });
      });
    }
  });
  it('le texte de chaque ligne vaut ce qu\'il annonce (aire 28 et 16 ; 156 ; 210 ; 25 ; 90 et 45 ; 495 2772 323,2 576 ; 75)', () => {
    expect(plain(rightOf(rows('act-6')[0]))).toContain('= 28'); expect(plain(rightOf(rows('act-6')[1]))).toContain('= 16');
    expect(ev('12 × 5 + 12 × 8')).toEqual(num('156')); expect(ev('7 × (13 + 17)')).toEqual(num('210')); expect(ev('2,5 × (18 − 8)')).toEqual(num('25'));
    expect(ev('9 × (6 + 4)')).toEqual(num('90')); expect(ev('4,5 × (12 − 2)')).toEqual(num('45'));
    MENTAL_ROWS.forEach((r, i) => { expect(same(ev(r.chain), ev(r.good)), r.chain).toBe(true); expect(same(ev(r.chain), ev(r.bad1)), `${r.chain} bad1`).toBe(false); expect(same(ev(r.chain), ev(r.bad2)), `${r.chain} bad2`).toBe(false); expect(plain(rightOf(rows('ex-32')[i]))).toContain(`= ${plain(String(ev(r.chain).d === 1n ? ev(r.chain).n : `${Number(ev(r.chain).n) / Number(ev(r.chain).d)}`).replace('.', ','))}`); });
    expect(ev('(9 − 4) × 15')).toEqual(num('75')); expect(ev('9 × 15 − 4 × 15')).toEqual(num('75')); expect(ev('4 × 15')).toEqual(num('60'));
  });
  it('ex-21 : les trous (4 ; 9 − 4) et les deux feuilles fausses', () => {
    expect(rows('ex-21')[0].options[rows('ex-21')[0].correct]).toBe('$4$');
    expect(same(ev('15 × (20 + 4)'), ev('15 × 20 + 15 × 4'))).toBe(true);
    expect(same(ev('6 × 9 − 6 × 4'), ev('6 × (9 − 4)'))).toBe(true);
    expect(same(ev('5 × (12 + 3)'), ev('5 × 12 − 5 × 3'))).toBe(false); // SIGNCHANGE
    expect(same(ev('9 × (8 − 2)'), ev('9 × 8 − 2'))).toBe(false); // FIRSTONLY
    expect(rows('ex-21')[2].correct).toBe(2); expect(rows('ex-21')[3].correct).toBe(0);
  });
  it('ex-35 : 4 × (2a + 3) = 8a + 12 (a = 1, 2, 3), les distracteurs ne le sont pas ; a = 0,5 → 16 ; 6x + 4x = 10x ; 9x − 2x = 7x', () => {
    const F = (a) => 4 * (2 * a + 3);
    const lin = (m, c) => (a) => m * a + c;
    expect([1, 2, 3].every((a) => lin(8, 12)(a) === F(a))).toBe(true);
    expect([1, 2, 3].some((a) => lin(8, 3)(a) === F(a))).toBe(false); // NOTATION
    expect([1, 2, 3].some((a) => lin(2, 12)(a) === F(a))).toBe(false);
    expect(F(0.5)).toBe(16); expect(lin(8, 3)(0.5)).toBe(7); expect(lin(2, 12)(0.5)).toBe(13);
    const r = rows('ex-35');
    expect(rightOf(r[0])).toBe('$8a + 12$'); expect(rightOf(r[1])).toBe('$16$'); expect(rightOf(r[2])).toContain('10x'); expect(rightOf(r[3])).toContain('7x');
    expect(6 + 4).toBe(10); expect(9 - 2).toBe(7); expect(6 * 4).toBe(24); expect(9 * 2).toBe(18);
  });
  it('chaque ligne d\'un exercice a UNE bonne option et des distracteurs distincts', () => {
    for (const ex of EXERCISES) for (const r of ex.question.rows) {
      expect(r.options.length, `${ex.id} ${r.label}`).toBeGreaterThanOrEqual(2);
      expect(new Set(r.options).size, `${ex.id} ${r.label}`).toBe(r.options.length);
      expect(r.correct).toBeGreaterThanOrEqual(0); expect(r.correct).toBeLessThan(r.options.length);
    }
  });
  it('toute chaîne montrée vaut un nombre ≥ 0 (une différence négative fait échouer l\'évaluateur)', () => {
    const chains = [];
    const grab = (s) => { for (const m of String(s).matchAll(/\$([^$]*)\$/g)) { const p = plain(m[1]); if (/[0-9]/.test(p) && !/[a-z\\]/i.test(p)) chains.push(p); } };
    for (const ex of EXERCISES) { grab(ex.statement); for (const r of ex.question.rows) { grab(r.label); r.options.forEach(grab); } }
    expect(chains.length).toBeGreaterThan(20);
    for (const c of chains) {
      const sides = c.split('=').map((x) => x.replace(/\\ldots/g, '').trim()).filter((x) => /\d/.test(x) && !/…|\.\.\./.test(x));
      for (const s of sides) { try { ev(s); } catch (e) { if (/négative|÷ 0/.test(e.message)) throw new Error(`${c} → ${e.message}`); } }
    }
  });
  it('إختبار أولي : chaque clé recalculée, chaque distracteur faux et nommé (MISC-TAWZI-*), chaque option littérale dans le module', () => {
    const mod = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    const readWhole = (w) => { const m = /^(\d+(?:,\d+)?) × (\(.+\)|\d+)/.exec(w); return m; };
    for (const f of FINAL) {
      expect(f.options.length).toBe(4);
      const esc = (x) => x.replace(/\\/g, '\\\\');
      f.options.forEach((o) => expect(mod, `${f.id} ${o}`).toContain(esc(o)));
      expect(mod).toContain(esc(f.prompt));
      expect(f.miscs[0]).toBeUndefined();
      if (f.kind === 'letter') {
        const [m0, c0] = f.letterForms[f.correct];
        const target = (x) => 5 * (x - 4);
        f.letterForms.forEach(([m, c], i) => { const eqAll = [4, 6, 9].every((x) => m * x + c === target(x)); expect(eqAll, `${f.id} #${i}`).toBe(i === f.correct); });
        expect([m0, c0]).toEqual([5, -20]);
        f.options.forEach((o, i) => expect(plain(o).replace(/\s/g, '')).toContain(String(f.letterForms[i][0] === 1 ? '' : f.letterForms[i][0])));
      } else {
        const whole = ev(f.whole);
        f.chains.forEach((c, i) => expect(same(ev(c), whole) || (f.kind === 'expand' && f.id !== 'E0' && same(ev(c), whole)), `${f.id} #${i} ${c}`).toBe(i === f.correct || (f.kind === 'factor' && i === f.correct)));
        if (f.kind === 'factor' || f.kind === 'mental') expect(String(Number(ev(f.chains[f.correct]).n))).toBe(plain(f.options[f.correct]));
      }
      Object.keys(f.miscs).forEach((i) => expect(f.miscs[i] === null || /^MISC-TAWZI-(FIRSTONLY|SIGNCHANGE|ADDK|FACTORMULT|FACTORWRONG|NOTATION)$/.test(f.miscs[i])).toBe(true));
    }
    // les erreurs nommées reproduisent leur lecture exacte
    expect(ev('7 × 10 + 3')).toEqual(add(mul(num('7'), num('10')), num('3'))); // FIRSTONLY
    expect(ev('7 + 10 × 3')).toEqual(num('37')); // ADDK
    expect(ev('7 × 10 × 3')).toEqual(num('210')); // FACTORMULT
    expect(ev('6 × 9 + 6 × 4')).toEqual(num('78')); // SIGNCHANGE
    expect(ev('6 × 9 − 4')).toEqual(num('50')); // FIRSTONLY
    expect(ev('13 × 8 × 2')).toEqual(num('208')); // FACTORMULT
    expect(ev('13 × 8 + 2')).toEqual(num('106')); // FIRSTONLY
    expect(ev('(13 + 13) × (8 + 2)')).toEqual(num('260'));
    expect(ev('100 × 7 − 1')).toEqual(num('699')); // FIRSTONLY
    expect(ev('100 × 7 + 1 × 7')).toEqual(num('707')); // SIGNCHANGE
    expect(readWhole('7 × (10 + 3)')).not.toBeNull();
  });
  it('معارف et طريقة : les exemples et les enchaînements sont justes', () => {
    expect(ev('4 × (9 + 6)')).toEqual(num('60')); expect(ev('4 × 9 + 4 × 6')).toEqual(num('60'));
    expect(ev('7 × (12 − 5)')).toEqual(num('49')); expect(ev('7 × 12 − 7 × 5')).toEqual(num('49'));
    expect(ev('9 × 7 + 9 × 3')).toEqual(num('90')); expect(ev('9 × (7 + 3)')).toEqual(num('90'));
    expect(ev('12 × 5 + 12 × 3')).toEqual(num('96')); expect(ev('5 × 12 + 3 × 12')).toEqual(num('96'));
    expect(KNOWLEDGE.exampleSum.text).toContain('= 60'); expect(KNOWLEDGE.exampleDiff.text).toContain('= 49'); expect(KNOWLEDGE.names.text).toContain('= 90');
    expect(ev('25 × (4,3 + 5,7)')).toEqual(num('250')); expect(ev('25 × 4,3 + 25 × 5,7')).toEqual(num('250'));
    expect(ev('14,6 × 12 − 4,6 × 12')).toEqual(num('120')); expect(ev('(14,6 − 4,6) × 12')).toEqual(num('120'));
    expect(ev('3,5 × 101')).toEqual(num('353,5')); expect(ev('3,5 × 100 + 3,5')).toEqual(num('353,5'));
    expect(ev('19 × 6')).toEqual(num('114')); expect(ev('20 × 6 − 6')).toEqual(num('114'));
    // la lettre : x = 5 → 8 ; x = 3 → 0 ; x = 4,5 → 6 (par les deux voies)
    for (const [x, v] of [['5', '8'], ['3', '0'], ['4,5', '6']]) { expect(ev(`4 × (${x} − 3)`)).toEqual(num(v)); expect(ev(`4 × ${x} − 12`)).toEqual(num(v)); }
    expect(METHOD.common.solution.join(' ')).toContain('250'); expect(METHOD.diff.solution.join(' ')).toContain('120');
    expect(METHOD.near.solution.join(' ')).toContain('353{,}5'); expect(METHOD.near.solution.join(' ')).toContain('114');
    expect(METHOD.letter.solution.join(' ')).toContain('4x - 12');
    expect(GUIDE.firstOnly.right).toContain('30'); expect(GUIDE.signChange.right).toContain('56');
  });
  it('« أستعدّ » : les affirmations sont vraies ou fausses comme annoncé', () => {
    expect(ev('6 × (10 + 2)')).toEqual(num('72')); expect(PREP_PLATFORM_ITEMS[0].answer).toBe(true);
    expect(ev('6 × 10 + 2')).toEqual(num('62')); expect(PREP_PLATFORM_ITEMS[1].answer).toBe(false);
    expect(ev('(7 − 3) × 5')).toEqual(num('20')); expect(PREP_PLATFORM_ITEMS[2].answer).toBe(true);
    expect(ev('3 × 4 + 3 × 2,5')).toEqual(num('19,5')); expect(ev('3 × (4 + 2,5)')).toEqual(num('19,5')); expect(PREP_ITEMS[0].answer).toBe(true);
    expect(ev('6 × 4,5')).toEqual(num('27')); expect(PREP_PLATFORM_ITEMS[3].answer).toBe(false);
    expect(PREP_ITEMS[1].answer).toBe(true);
  });
  it('la notation : le signe × est écrit partout sauf dans « 4x », « 8a », « 10x », « 7x » (lettre accolée)', () => {
    for (const ex of EXERCISES) for (const r of ex.question.rows) for (const o of r.options) expect(/\d\(/.test(o), `${ex.id} ${o}`).toBe(false);
    expect(tex('9 × 6,5')).toBe('9 \\times 6{,}5');
  });
});
