import { describe, it, expect } from 'vitest';
import { LESSON_CONFIG } from '../lesson.config';
import { DECIMALS, SIGNS1, SIGNS2, CLASSIFY, WRITE, INTFRAC, WHY_NOT_DECIMAL, COMPARE, EQUAL, TRUEFALSE, ORDER, MIDWAY, EXERCISES, EX, FINAL, LP } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, KNOWLEDGE, METHOD, GUIDE, LAB, RECALL_UNIT1, RECALL_1AM } from './textbook';
import * as L from '../../../../../../common/manipulations/logic/numberLinePegs';
import { LEVELS } from '../../../../../../common/manipulations/levels';

/* Arithmétique de contrôle en BigInt, INDÉPENDANTE de fractions3.js / powers.js : un rationnel est { n, d } réduit, d > 0. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a || 1n; };
const R = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); if (d === 0n) throw new Error('d = 0'); const g = gcd(n, d); return d < 0n ? { n: -n / g, d: -d / g } : { n: n / g, d: d / g }; };
const eq = (x, y) => x.n === y.n && x.d === y.d;
const cmp = (x, y) => { const l = x.n * y.d; const r = y.n * x.d; return l > r ? 1 : l === r ? 0 : -1; };
/** Un nombre écrit « -7,4 » ou « -7{,}4 » ou « 12 » (signe − ou -) → rationnel. */
const num = (s) => {
  const t = String(s).trim().replace(/−/g, '-').replace(/\{,\}/g, ',').replace(',', '.');
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(t);
  if (!m) throw new Error(`nombre illisible : ${s}`);
  const frac = m[3] ?? '';
  return R(BigInt(`${m[1]}${m[2]}${frac}`), 10n ** BigInt(frac.length));
};
/** Une écriture « a/b » (a, b relatifs, a décimal) → rationnel. */
const wr = (w) => { const i = String(w).indexOf('/'); if (i < 0) return num(w); const a = num(String(w).slice(0, i)); const b = num(String(w).slice(i + 1)); return R(a.n * b.d, a.d * b.n); };
/** Lit une écriture LaTeX « -\frac{3}{4} », « \frac{-9}{-12} », « 4 », « 0{,}8 » (sans $). */
const tex = (s) => {
  let t = String(s).replace(/\$/g, '').replace(/[⁦⁩]/g, '').trim().replace(/−/g, '-');
  let sign = 1n;
  if (t.startsWith('-')) { sign = -1n; t = t.slice(1); }
  const m = /^\\frac\{([^}]+)\}\{([^}]+)\}$/.exec(t);
  const v = m ? (() => { const a = num(m[1]); const b = num(m[2]); return R(a.n * b.d, a.d * b.n); })() : num(t);
  return R(sign * v.n, v.d);
};
const isDec = (x) => { let d = x.d; while (d % 2n === 0n) d /= 2n; while (d % 5n === 0n) d /= 5n; return d === 1n; };
const floorOf = (x) => { let k = x.n / x.d; if (x.n < 0n && x.n % x.d !== 0n) k -= 1n; return k; };
/** Le 2-chiffres décimal par défaut de x (toward −∞) : floor(x × 100) / 100. */
const approxDown = (x) => R(floorOf(R(x.n * 100n, x.d)), 100n);

describe('العدد الناطق — le contenu en arithmétique exacte', () => {
  it('act-5 : chaque clé est la bonne kitaba décimale ou la bonne valeur approchée, chaque distracteur est faux', () => {
    for (const r of DECIMALS) {
      const v = wr(r.w);
      r.options.forEach((o, i) => {
        let right;
        if (o.claim === 'dec') right = isDec(v) && eq(num(o.v), v);
        else right = !isDec(v) && (o.v == null || eq(num(o.v), approxDown(v)));
        expect(right, `${r.w} / ${o.t}`).toBe(i === r.correct);
      });
    }
    expect(DECIMALS.map((r) => isDec(wr(r.w)))).toEqual([true, true, true, false, true, true, false]);
  });
  it('les signes (act-5, ex-24) sont recalculés', () => {
    for (const r of [...SIGNS1, ...SIGNS2]) expect(wr(r.w).n > 0n, r.w).toBe(r.plus);
    expect(SIGNS1.map((r) => r.plus)).toEqual([true, false, false]);
    expect(SIGNS2.map((r) => r.plus)).toEqual([true, true, false, false]);
  });
  it('ex-22 : la classe de chaque nombre (naturel, relatif entier négatif, décimal non entier, ناطق غير عشري)', () => {
    for (const r of CLASSIFY) {
      const v = wr(r.w);
      const k = v.d === 1n ? (v.n >= 0n ? 'nat' : 'neg') : isDec(v) ? 'dec' : 'non';
      expect(k, r.w).toBe(r.kind);
      expect(r.correct).toBe(['nat', 'neg', 'dec', 'non'].indexOf(k));
    }
  });
  it('ex-23 : la clé vaut le nombre, la clé est « a/b ou −a/b » réduite, chaque distracteur est faux', () => {
    for (const r of WRITE) {
      const v = wr(r.w);
      expect(eq(tex(r.options[r.correct]), v), r.w).toBe(true);
      expect(eq(wr(r.key), v)).toBe(true);
      r.options.forEach((o, i) => { if (i !== r.correct) expect(eq(tex(o), v), `${r.w} ${o}`).toBe(false); });
      const k = wr(r.key); expect(gcd(k.n, k.d)).toBe(1n);
    }
    expect(WRITE.map((r) => r.key)).toEqual(['-7/20', '1/4', '-9', '3/2']);
  });
  it('ex-26 : la clé est un entier + une fraction < 1 qui vaut le nombre ; les distracteurs sont faux (valeur ou fraction ≥ 1)', () => {
    const parse = (o) => { const m = /^\$(\d+)\+\\frac\{(\d+)\}\{(\d+)\}\$$/.exec(o); return { k: BigInt(m[1]), a: BigInt(m[2]), b: BigInt(m[3]) }; };
    for (const r of INTFRAC) {
      const v = wr(r.w);
      r.options.forEach((o, i) => {
        const { k, a, b } = parse(o);
        const ok = eq(R(k * b + a, b), v) && a < b;
        expect(ok, `${r.w} ${o}`).toBe(i === r.correct);
      });
    }
    // 41/9 : la clé 4 + 5/9, et le distracteur 3 + 14/9 a la bonne valeur mais une fraction ≥ 1
    expect(INTFRAC[2].wrongs).toContain('3+\\frac{14}{9}');
    expect(isDec(R(41, 9))).toBe(false);
    expect(R(9)).toEqual({ n: 9n, d: 1n });
    expect(WHY_NOT_DECIMAL.correct).toBe(0);
  });
  it('ex-27, ex-28 : le bon symbole (recalculé) et les distracteurs faux', () => {
    for (const r of [...COMPARE, ...EQUAL]) {
      const c = cmp(wr(r.a), wr(r.b));
      expect(['<', '=', '>'][c + 1], `${r.a} ? ${r.b}`).toBe(r.key);
      expect(r.options[r.correct]).toBe(`$${r.key}$`);
    }
    expect(COMPARE.map((r) => r.key)).toEqual(['>', '<', '<', '>']);
    expect(EQUAL.map((r) => r.key)).toEqual(['=', '=', '<']);
  });
  it('self-10 : vrai ou faux recalculé', () => {
    for (const r of TRUEFALSE) {
      const c = cmp(wr(r.a), wr(r.b));
      expect(r.op === '<' ? c < 0 : c > 0, `${r.a} ${r.op} ${r.b}`).toBe(r.answer);
    }
  });
  it('ex-30 : la chaîne clé est triée, les distracteurs ne le sont pas', () => {
    const sorted = (ws) => ws.every((w, i) => i === 0 || cmp(wr(ws[i - 1]), wr(w)) < 0);
    expect(sorted(ORDER.key)).toBe(true);
    expect([...ORDER.key].sort()).toEqual([...ORDER.list].sort());
    ORDER.wrongs.forEach((c) => { expect(sorted(c)).toBe(false); expect([...c].sort()).toEqual([...ORDER.list].sort()); });
    const opts = EX['ex-30'].question.options;
    expect(opts).toHaveLength(3);
    expect(opts[EX['ex-30'].question.correct]).toBe(`$${ORDER.key.map((w) => { const i = w.indexOf('/'); return i < 0 ? w.replace(',', '{,}') : `\\frac{${w.slice(0, i)}}{${w.slice(i + 1)}}`; }).join('<')}$`);
  });
  it('deep-69 : −1/3 est exactement au milieu de −1/2 et −1/6', () => {
    const lo = wr(MIDWAY.lo); const mid = wr(MIDWAY.mid); const hi = wr(MIDWAY.hi);
    expect(eq(mid, R((lo.n * hi.d + hi.n * lo.d), 2n * lo.d * hi.d))).toBe(true);
    expect(MIDWAY.correct).toBe(0);
  });
  it('« أستعدّ » : la vérité de chaque affirmation est recalculée', () => {
    const truth = {
      '$\\frac{3}{4}=0{,}75$ .': eq(R(3, 4), num('0,75')),
      '$\\frac{7}{3}=2{,}33$ .': eq(R(7, 3), num('2,33')),
      '$15\\div4=\\frac{15}{4}$ .': eq(R(15, 4), R(15, 4)),
      '$(-18)\\div3=-6$ .': eq(R(-18, 3), R(-6)),
      '$12\\div(-4)=3$ .': eq(R(12, -4), R(3)),
      '$(-9)\\div(-2)=4{,}5$ .': eq(R(-9, -2), num('4,5')),
      '$-11<-8$ .': cmp(R(-11), R(-8)) < 0,
    };
    for (const it of [...PREP_ITEMS, ...PREP_PLATFORM_ITEMS]) {
      expect(it.text in truth, it.text).toBe(true);
      expect(truth[it.text], it.text).toBe(it.answer);
    }
    expect(PREP_ITEMS.map((i) => i.n)).toEqual([12, 8]);
    expect(new Set([...PREP_ITEMS, ...PREP_PLATFORM_ITEMS].map((i) => i.answer))).toEqual(new Set([true, false]));
  });
  it('les exemples et les méthodes de la leçon sont justes', () => {
    expect(eq(wr('14/-21'), R(-2, 3))).toBe(true);
    expect(METHOD.standard.solution.join(' ')).toContain('-\\frac{2}{3}');
    expect(eq(wr('-3,6/-8'), R(9, 20))).toBe(true);
    expect(METHOD.decimal.solution.join(' ')).toContain('\\frac{9}{20}');
    const a = wr('-4,9/6'); const b = wr('-3,5/4');
    expect(eq(a, R(-98, 120))).toBe(true);
    expect(cmp(b, a)).toBe(-1);
    expect(eq(num('-9,8'), R(-49, 5))).toBe(true);
    expect(eq(R(-49, 5 * 12), a)).toBe(true);            // −9,8/12 = −4,9/6
    expect(eq(R(-105, 10 * 12), b)).toBe(true);          // −10,5/12 = −3,5/4
    expect(METHOD.compare.solution.join(' ')).toContain('-10{,}5<-9{,}8');
    const six = ['-5/6', '-3/2', '2/3', '7/6'].map(wr).map((v) => R(v.n * 6n, v.d));
    expect(six.map((v) => Number(v.n))).toEqual([-5, -9, 4, 7]);
    expect(METHOD.place.solution.join(' ')).toContain('-9<-5<4<7');
    expect(17n === 3n * 5n + 2n && 41n === 4n * 9n + 5n).toBe(true);
    expect(eq(wr('-28/15'), R(-28, 15)) && eq(wr('-24/-32'), R(3, 4))).toBe(true);
    expect(KNOWLEDGE.examples.text).toContain('\\frac{3}{4}');
    expect(eq(wr('-1,8'), R(-9, 5))).toBe(true);
    expect(KNOWLEDGE.inclusions.text).toContain('\\frac{9}{5}');
    expect(GUIDE.twoneg.right).toContain('\\frac{3}{4}');
    expect(eq(R(-10, 12), R(-5, 6)) && cmp(R(-10, 12), R(-9, 12)) < 0).toBe(true);
    expect(GUIDE.rope).toContain('-\\frac{3}{4}');
    expect(RECALL_UNIT1.lesson).toBe('qismat-nisbiyayn');
    expect(RECALL_1AM.lesson).toBe('hasil-qisma-kasr');
    expect(eq(R(11, 7), R(11, 7)) && !isDec(R(11, 7))).toBe(true);
  });
  it('إختبار أولي : chaque clé est recalculée, chaque distracteur est faux, et le module contient chaque option', async () => {
    const modules = import.meta.glob('../modules/Module08Itqan.jsx', { query: '?raw', import: 'default', eager: true });
    const source = Object.values(modules)[0];
    for (const e of FINAL) {
      const key = e.options[e.correct];
      const t = e.truth;
      if (t.kind === 'equal') {
        const v = wr(t.w);
        e.options.forEach((o, i) => expect(eq(tex(o), v), `${e.id} ${o}`).toBe(i === e.correct));
      } else if (t.kind === 'between') {
        const v = wr(t.w);
        const k = floorOf(v);
        e.options.forEach((o, i) => {
          const m = [...o.replace(/\$/g, '').matchAll(/-?\d+/g)].map((x) => BigInt(x[0]));
          const right = m[0] === k && m[1] === k + 1n;
          expect(right, `${e.id} ${o}`).toBe(i === e.correct);
        });
      } else if (t.kind === 'ascending') {
        const vals = t.ws.map(wr);
        const sorted = [...vals].sort(cmp);
        const asc = (o) => { const parts = o.replace(/\$/g, '').split('<').map(tex); return parts.length === vals.length && parts.every((p, i) => i === 0 || cmp(parts[i - 1], p) < 0) && parts.every((p) => vals.some((v) => eq(v, p))); };
        e.options.forEach((o, i) => expect(asc(o), `${e.id} ${o}`).toBe(i === e.correct));
        expect(eq(tex(key.split('<')[0]), sorted[0])).toBe(true);
      } else if (t.kind === 'notDecimal') {
        e.options.forEach((o, i) => expect(!isDec(tex(o)), `${e.id} ${o}`).toBe(i === e.correct));
        t.ws.forEach((w, i) => expect(eq(tex(e.options[i]), wr(w))).toBe(true));
      }
      for (const o of e.options) expect(source.includes(o.replace(/\\/g, '\\\\')), `${e.id} : ${o}`).toBe(true);
      expect(e.lp).toMatch(/^3am_adad-natiq_P[123]$/);
    }
    expect(new Set(FINAL.map((e) => e.lp))).toEqual(new Set([LP.P1, LP.P2, LP.P3]));
  });
  it('chaque exercice porte un LP de la leçon, une source de manuel, et ne cite que des éléments de la leçon', () => {
    for (const e of EXERCISES) {
      expect(Object.values(LP)).toContain(e.learningPointId);
      expect(e.source.type).toBe('textbook');
    }
    expect(EXERCISES.map((e) => e.id)).toEqual(['act-5', 'act-5-signs', 'ex-22', 'ex-23', 'ex-24', 'ex-26', 'deep-56', 'ex-27', 'ex-30', 'ex-28', 'self-10', 'deep-69']);
  });
  it('le labo : les tâches du niveau sont celles de la leçon, le monde `writings` de معارف pose 4 écritures sur −3/4 et 1 sur 3/4', () => {
    expect(LEVELS['number-line-pegs'].beginner.numbers.tasks.map((t) => t.id)).toEqual(['w1', 'w2', 'w3']);
    expect(LEVELS['number-line-pegs'].advanced.numbers.tasks.map((t) => t.id)).toEqual(['a1', 'a2', 'a3']);
    const t = L.buildTask(LAB.writings.tasks[0]);
    expect(t.cards.map((c) => c.tw)).toEqual([-9, -9, -9, -9, 9]);
    // les valeurs de la leçon, recalculées par le test (code indépendant)
    expect(L.PRESETS.beginner.tasks.map((x) => x.cards.map((w) => Number(wr(w).n * 12n / wr(w).d)))).toEqual([[-9, -9, 9, 9], [-28, -28, -28, 28], [-18, 24, 30, -36]]);
    expect(L.PRESETS.advanced.tasks[0].cards.map((w) => Number(wr(w).n * 12n / wr(w).d))).toEqual([-21, 10, -8, -26, 18, -1]);
    expect(L.PRESETS.advanced.tasks[1].cards.map((w) => Number(wr(w).n * 12n / wr(w).d))).toEqual([-27, -33, -30]);
    expect(L.PRESETS.advanced.tasks[2].cards.map((w) => Number(wr(w).n * 12n / wr(w).d))).toEqual([-9, -9, -10]);
  });
  it('la config : LP du catalogue, ordre des modules, un seul objective par paire de niveaux', () => {
    const levelled = LESSON_CONFIG.resources.filter((r) => r.type === 'number-line-pegs' && r.level);
    expect(levelled).toHaveLength(2);
    expect(levelled[0].objective).toBe(levelled[1].objective);
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.skills).toHaveLength(3);
  });
});
