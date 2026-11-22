import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, FINAL, CHAINS_ADD, CHAINS_PRIORITY, SHEET, MISSING, CHECKS, tex } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, METHOD, KNOWLEDGE, GUIDE } from './textbook';

/**
 * Les clés du درس « سلسلة عمليات دون أقواس وأولوية العمليات » recalculées avec un code INDÉPENDANT de `chainOps.js` / `powers.js` : un évaluateur de chaînes en BigInt (rationnels
 * exacts, priorités, gauche → droite, ou un ORDRE donné pour reproduire une erreur nommée). Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX ; chaque option d'une
 * épreuve du إختبار أولي est présente LITTÉRALEMENT dans Module08Itqan.jsx ; aucune parenthèse ni résultat négatif dans une chaîne montrée.
 */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const Q = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const add = (p, q) => Q(p.n * q.d + q.n * p.d, p.d * q.d);
const sub = (p, q) => Q(p.n * q.d - q.n * p.d, p.d * q.d);
const mul = (p, q) => Q(p.n * q.n, p.d * q.d);
const div = (p, q) => { if (q.n === 0n) throw new Error('÷ 0'); return Q(p.n * q.d, p.d * q.n); };
const same = (p, q) => p.n === q.n && p.d === q.d;
const num = (s) => {
  const t = String(s).replace(',', '.').trim();
  const [i, f = ''] = t.split('.');
  return Q(BigInt(i + f), 10n ** BigInt(f.length));
};
const OPS = { '+': add, '−': sub, '×': mul, '÷': div };
/** Une chaîne « a op b op c … » → { nums, ops }. */
const lex = (chain) => {
  const parts = chain.replace(/\$/g, '').trim().split(/\s+/);
  return { nums: parts.filter((_, i) => i % 2 === 0).map(num), ops: parts.filter((_, i) => i % 2 === 1) };
};
/** Évalue avec les priorités (× ÷ puis + −, gauche → droite) — par réduction de listes, pas par arbre. */
const ev = (chain) => {
  let { nums, ops } = lex(chain);
  for (const group of [['×', '÷'], ['+', '−']]) {
    let k = 0;
    while (k < ops.length) {
      if (group.includes(ops[k])) { nums = [...nums.slice(0, k), OPS[ops[k]](nums[k], nums[k + 1]), ...nums.slice(k + 2)]; ops = [...ops.slice(0, k), ...ops.slice(k + 1)]; } else k += 1;
    }
  }
  return nums[0];
};
/** Évalue dans un ORDRE d'opérateurs donné (indices d'origine) : l'erreur nommée reproduite. */
const evOrder = (chain, order) => {
  const { nums, ops } = lex(chain);
  const blocks = nums.map((v, i) => ({ v, lo: i, hi: i }));
  const at = (pos) => blocks.find((b) => b.lo <= pos && pos <= b.hi);
  order.forEach((idx) => {
    const a = at(idx); const b = at(idx + 1);
    const v = OPS[ops[idx]](a.v, b.v);
    a.v = v; a.hi = b.hi; blocks.splice(blocks.indexOf(b), 1);
  });
  return blocks[0].v;
};
const opt = (o) => num(String(o).replace(/^\$|\$$/g, '').replace(/\{,\}/g, ',').replace(/[°]/g, '').trim());
const noBracket = (s) => !/[()[\]]|\\frac|\\left|\\right/.test(String(s));
const rows = (id) => EXERCISES.find((e) => e.id === id).question.rows;

describe('le درس « سلسلة عمليات دون أقواس وأولوية العمليات » — clés recalculées', () => {
  it('l\'évaluateur de contrôle donne les valeurs du labo (26 − 9 + 4 = 21 · 15 + 3 × 4 = 27 · 150 ÷ 6 × 4 = 100)', () => {
    expect(ev('26 − 9 + 4')).toEqual(Q(21n));
    expect(ev('15 + 3 × 4')).toEqual(Q(27n));
    expect(ev('150 ÷ 6 × 4')).toEqual(Q(100n));
    expect(evOrder('26 − 9 + 4', [1, 0])).toEqual(Q(13n));
    expect(evOrder('150 ÷ 6 × 4', [1, 0])).toEqual(Q(625n, 100n));
    expect(evOrder('15 + 3 × 4', [0, 1])).toEqual(Q(72n));
  });

  it('ex-1 et ex-4 : chaque clé est la valeur conventionnelle, chaque distracteur est faux ET reproduit une erreur d\'ordre', () => {
    [[CHAINS_ADD, 'ex-1'], [CHAINS_PRIORITY, 'ex-4']].forEach(([list, id]) => list.forEach((c, i) => {
      const truth = ev(c.chain);
      const row = rows(id)[i];
      row.options.forEach((o, k) => expect(same(opt(o), truth), `${c.chain} ${o}`).toBe(k === row.correct));
      // chaque distracteur est la valeur d'AU MOINS un ordre fautif (aucune valeur au hasard)
      const wrongs = row.options.filter((_, k) => k !== row.correct).map(opt);
      const n = lex(c.chain).ops.length;
      const perms = (a) => (a.length <= 1 ? [a] : a.flatMap((x, j) => perms([...a.slice(0, j), ...a.slice(j + 1)]).map((p) => [x, ...p])));
      for (const w of wrongs) expect(perms([...Array(n).keys()]).some((o) => same(evOrder(c.chain, o), w)), `${c.chain} ${w.n}/${w.d}`).toBe(true);
    }));
  });

  it('ex-5 : la feuille du camarade — chaque ligne est fausse, la clé est la valeur conventionnelle', () => {
    SHEET.forEach((r, i) => {
      const truth = ev(r.chain);
      expect(same(truth, num(r.wrong)), r.chain).toBe(false);
      const row = rows('ex-5')[i];
      row.options.forEach((o, k) => expect(same(opt(o.match(/\$([^$]*)\$/)[1]), truth), o).toBe(k === row.correct));
    });
  });

  it('ex-7 : chaque trou est rempli par la seule bonne option', () => {
    MISSING.forEach((m, i) => {
      const row = rows('ex-7')[i];
      m.test.forEach((c, k) => {
        const hit = same(ev(c), num(m.target));
        expect(hit, c).toBe(k === 0);
      });
      expect(row.options[row.correct]).toBe(m.right);
    });
    // l'unique réponse à 6 … 12 … 3 = 10 parmi les trois chaînes proposées
    expect(['6 + 12 ÷ 3', '6 × 12 ÷ 3', '6 + 12 × 3'].filter((c) => same(ev(c), Q(10n)))).toEqual(['6 + 12 ÷ 3']);
  });

  it('act-1 : 31 − 9 + 4 = 26 ; 18 vient de 9 + 4 d\'abord', () => {
    expect(ev('31 − 9 + 4')).toEqual(Q(26n));
    expect(evOrder('31 − 9 + 4', [1, 0])).toEqual(Q(18n));
    expect(rows('act-1')[0].options[rows('act-1')[0].correct]).toContain('26');
  });

  it('act-2 : les égalités annoncées (quatre vraies, 8 + 3 × 4 = 44 fausse)', () => {
    expect(CHECKS.map((c) => c.answer)).toEqual([true, true, true, true, false]);
    CHECKS.forEach((c) => expect(same(ev(c.chain), num(c.claim)), c.chain).toBe(c.answer));
    expect(ev('8 + 3 × 4')).toEqual(Q(20n));
  });

  it('self-6 : 95 − 38 − 21 = 36', () => {
    expect(ev('95 − 38 − 21')).toEqual(Q(36n));
    const r = rows('self-6')[1];
    r.options.forEach((o, k) => expect(same(opt(o), Q(36n)), o).toBe(k === r.correct));
    expect(evOrder('95 − 38 − 21', [1, 0])).toEqual(Q(78n));   // 95 − (38 − 21)? non : 38 + 21 d\'abord donne 36 ; ici le piège +
  });

  it('chaque ligne d\'un exercice a UNE bonne option et des distracteurs distincts ; aucune parenthèse', () => {
    for (const ex of EXERCISES.filter((e) => e.interaction === 'batch')) {
      for (const r of ex.question.rows) {
        expect(new Set(r.options).size).toBe(r.options.length);
        expect(r.options.length).toBeGreaterThanOrEqual(2);
        expect(r.correct).toBeLessThan(r.options.length);
      }
    }
    // aucune parenthèse, crochet ni barre dans un îlot mathématique montré
    const islands = (JSON.stringify(EXERCISES).replace(/\\\\/g, '\\').match(/\$[^$]*\$/g) ?? []);
    expect(islands.length).toBeGreaterThan(20);
    islands.forEach((m) => expect(noBracket(m), m).toBe(true));
    expect(tex('4,5 + 2 × 8 − 3')).toBe('4{,}5 + 2 \\times 8 - 3');
  });

  it('إختبار أولي : chaque clé recalculée, chaque distracteur faux et nommé, chaque option littérale dans le module', () => {
    const source = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    for (const f of FINAL) {
      if (f.truth.story != null) {
        // E5 : la bonne chaîne donne le reste ; les autres ne sont pas la même quantité
        const keys = f.options.map((o) => ev(o.replace(/\$/g, '').replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/ - /g, ' − ').replace(/ \+ /g, ' + ')));
        expect(same(keys[f.correct], Q(BigInt(f.truth.story))), f.id).toBe(true);
        keys.forEach((v, k) => { if (k !== f.correct) expect(same(v, Q(BigInt(f.truth.story))), `${f.id} ${f.options[k]}`).toBe(false); });
      } else {
        const t = ev(f.truth.chain);
        f.options.forEach((o, k) => expect(same(opt(o), t), `${f.id} ${o}`).toBe(k === f.correct));
        Object.entries(f.truth.bad ?? {}).forEach(([k, order]) => expect(same(evOrder(f.truth.chain, order), opt(f.options[k])), `${f.id} option ${k} reproduit son erreur`).toBe(true));
      }
      f.options.forEach((o) => expect(source, `${f.id} ${o}`).toContain(o.replace(/\\/g, '\\\\')));
    }
    expect(FINAL).toHaveLength(5);
    expect(FINAL.map((f) => f.lp)).toEqual([...FINAL.map((f) => f.lp)]);
  });

  it('طريقة : les trois enchaînements sont justes', () => {
    expect(ev('4,5 + 2 × 8 − 27 ÷ 9')).toEqual(num('17,5'));
    expect(ev('100 − 36 ÷ 4 × 3')).toEqual(Q(73n));
    expect(ev('200 − 3 × 45 − 25')).toEqual(Q(40n));
    expect(METHOD.priority.solution).toHaveLength(3);
    expect(ev('42 + 15 − 9')).toEqual(Q(48n)); expect(ev('56 ÷ 7 × 3')).toEqual(Q(24n)); expect(ev('18 + 6 × 5 − 40 ÷ 8')).toEqual(Q(43n));
    expect(KNOWLEDGE.addSub.text).toContain('= 48');
    // pièges de la leçon
    expect(evOrder('26 − 9 + 4', [1, 0])).toEqual(Q(13n));
    expect(GUIDE.addfirst.wrong).toContain('13');
    expect(evOrder('150 ÷ 6 × 4', [1, 0]).d).toBe(4n);   // 6,25 = 25/4
  });

  it('« أستعدّ » : les affirmations sont vraies ou fausses comme annoncé', () => {
    const items = [...PREP_ITEMS, ...PREP_PLATFORM_ITEMS];
    expect(items).toHaveLength(7);
    expect(new Set(items.map((i) => i.answer)).size).toBe(2);
    expect(same(add(add(num('46,3'), num('128,4')), num('53,7')), num('228,4'))).toBe(true); // 1 vrai
    expect(same(sub(num('512,6'), num('307,48')), num('205,12'))).toBe(true); // 2 vrai
    expect(same(sub(num('12'), num('6,5')), add(num('6,5'), num('12')))).toBe(false); // 3 faux : AC = 18,5
    expect(same(add(add(num('18'), num('35')), num('12')), add(add(num('18'), num('12')), num('35')))).toBe(true); // 4 vrai
    expect(same(mul(num('4'), num('37,5')), num('150'))).toBe(true); // 5 vrai
    expect(same(add(num('25'), num('7')), num('32'))).toBe(true); expect(sub(num('25'), num('7'))).toEqual(Q(18n)); // 6 faux
    expect(ev('20 − 6 + 4')).toEqual(Q(18n)); // 7 faux (10 est faux)
    expect(PREP_ITEMS.map((i) => i.answer)).toEqual([true, true, false, true]);
    expect(PREP_PLATFORM_ITEMS.map((i) => i.answer)).toEqual([true, false, false]);
  });
});
