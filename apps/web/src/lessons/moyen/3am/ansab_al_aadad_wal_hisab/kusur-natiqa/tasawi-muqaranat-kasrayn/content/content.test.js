import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, FINAL, COMPARE, EQUALS, SORT, ORDER, CROSS, MISSING, CALC } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, METHOD, LAB } from './textbook';

/**
 * Les clés du درس « تساوي كسرين ومقارنتهما » recalculées avec un code INDÉPENDANT de `powers.js` / `fractions3.js` : des produits en croix en BigInt. Chaque bonne réponse est vérifiée vraie,
 * chaque distracteur FAUX ; chaque option d'une épreuve du إختبار أولي est présente LITTÉRALEMENT dans Module08Itqan.jsx.
 */
const fr = (s) => { const [a, b] = String(s).split('/'); return { n: BigInt(a), d: BigInt(b ?? 1) }; };
/** a/b contre c/d par les produits en croix : '>' | '=' | '<'. */
const rel = (p, q) => { const x = fr(p); const y = fr(q); const l = x.n * y.d; const r = y.n * x.d; return l > r ? '>' : l === r ? '=' : '<'; };
const same = (p, q) => rel(p, q) === '=';
const rows = (id) => EXERCISES.find((e) => e.id === id).question.rows;
const unit = (a, b) => Number((BigInt(a) * BigInt(b)) % 10n);
/** « $\frac{3}{4}$ » → '3/4' ; « $>$ » → '>'. */
const strip = (o) => String(o).replace(/^\$|\$$/g, '').trim();
const fracOf = (o) => { const m = /^\\frac\{(\d+)\}\{(\d+)\}$/.exec(strip(o)); return m ? `${m[1]}/${m[2]}` : strip(o).replace(/\{,\}/g, '.'); };
const chain = (o) => strip(o).split(/(<|>)/).map((x) => x.trim()).filter(Boolean);

describe('le درس « تساوي كسرين ومقارنتهما » — clés recalculées', () => {
  it('act-3 : chaque relation est celle des produits en croix, chaque distracteur faux', () => {
    COMPARE.forEach((r, i) => {
      const truth = rel(r.pair[0], r.pair[1]);
      r.options.forEach((o, k) => expect(strip(o) === truth, `${r.pair} ${o}`).toBe(k === r.correct));
      expect(rows('act-3')[i].correct).toBe(r.correct);
    });
    // chaque paire appelle une méthode : > 1 / même numérateur / 1 + 1/n / dénominateur commun
    expect(fr('413/398').n > fr('413/398').d && fr('562/631').n < fr('562/631').d).toBe(true);
    expect(fr('47/23').n).toBe(fr('47/25').n);
    expect(rel('306/305', '305/304')).toBe('<');
    expect(rel('17/16', '29/24')).toBe('<');
  });

  it('now-1 : consécutifs jamais égaux ; 336/609 = 16/29 (9744 = 9744)', () => {
    EQUALS.forEach((r) => expect(r.correct === 0, String(r.pair)).toBe(same(r.pair[0], r.pair[1])));
    expect(2026n * 2024n).toBe(4100624n);
    expect(2025n * 2025n).toBe(4100625n);
    expect(336n * 29n).toBe(9744n);
    expect(609n * 16n).toBe(9744n);
  });

  it('ex-8 : les groupes {15/18, 5/6, 20/24} et {7/2, 21/6}, 9/8 seule', () => {
    SORT.forEach((r) => {
      const inA = same(r.frac, '5/6'); const inB = same(r.frac, '7/2');
      expect(r.correct, r.frac).toBe(inA ? 0 : inB ? 1 : 2);
    });
    expect(SORT.filter((r) => r.correct === 0).map((r) => r.frac).sort()).toEqual(['15/18', '20/24', '5/6']);
    expect(SORT.filter((r) => r.correct === 1).map((r) => r.frac).sort()).toEqual(['21/6', '7/2']);
  });

  it('ex-12 : 9 < 11 < 14 < 18 < 20 sur 12 ; la chaîne juste est croissante, les autres non', () => {
    const sorted = [...ORDER.list].sort((a, b) => { const r = rel(a, b); return r === '<' ? -1 : r === '>' ? 1 : 0; });
    expect(sorted).toEqual(ORDER.ascending);
    ORDER.list.forEach((p) => expect((fr(p).n * BigInt(ORDER.common)) % fr(p).d, p).toBe(0n)); // tous ont 12 pour dénominateur possible
    ORDER.options.forEach((o, k) => {
      const parts = chain(o);
      const fracs = parts.filter((_, i) => i % 2 === 0).map(fracOf);
      const ops = parts.filter((_, i) => i % 2 === 1);
      const increasing = ops.every((op, i) => op === '<' && rel(fracs[i], fracs[i + 1]) === '<');
      expect(increasing, o).toBe(k === ORDER.correct);
    });
  });

  it('ex-15 : 18 × 35 = 21 × 30 ; seule 18/21 = 30/35 est juste', () => {
    const [a, d, b, c] = CROSS.products;
    expect(BigInt(a) * BigInt(d)).toBe(BigInt(b) * BigInt(c));
    CROSS.options.forEach((o, k) => {
      const [p, q] = strip(o).split('=').map(fracOf);
      expect(same(p, q), o).toBe(k === CROSS.correct);
    });
  });

  it('ex-16 : x/16 = 5/8 → x = 10', () => {
    const [, b, c, d] = MISSING.terms;
    expect(BigInt(MISSING.answer) * BigInt(d)).toBe(BigInt(b) * BigInt(c));
    expect(same(`${MISSING.answer}/${b}`, `${c}/${d}`)).toBe(true);
    expect(EXERCISES.find((e) => e.id === 'ex-16').question.expected).toBe(MISSING.answer);
  });

  it('deep-55 : 355/113 ≠ 35500000001/11300000000 ; chiffres des unités 0 et 3 ; la différence est 1/11300000000', () => {
    const p = fr(CALC.p); const q = fr(CALC.q);
    const left = p.n * q.d; const right = p.d * q.n;
    expect(left).not.toBe(right);
    expect([Number(left % 10n), Number(right % 10n)]).toEqual([0, 3]);
    expect(unit(355, 11300000000)).toBe(0);
    expect(unit(113, 35500000001)).toBe(3);
    expect(right - left).toBe(113n);   // q − p = 113 / (113 × 11300000000) = 1 / 11300000000
    expect(CALC.correct).toBe(0);
  });

  it('chaque exercice à lignes a UNE bonne option, des options distinctes', () => {
    for (const ex of EXERCISES.filter((e) => e.question.rows)) {
      for (const r of ex.question.rows) {
        expect(new Set(r.options).size).toBe(r.options.length);
        expect(r.correct).toBeLessThan(r.options.length);
      }
    }
  });

  it('إختبار أولي : chaque clé recalculée, chaque distracteur faux, chaque option littérale dans le module', () => {
    const source = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    const truthOf = {
      equal: (f) => (o) => same(fracOf(o), f.truth.p),
      relation: (f) => { const t = rel(f.truth.p, f.truth.q); return (o) => strip(o) === t; },
      sameYes: (f) => { const yes = same(f.truth.p, f.truth.q); return (o) => { const claimsYes = strip(o).startsWith('نعم'); const prod = /\\times55=35\\times33=1155|21\\times55/.test(o); return yes && claimsYes && prod; }; },
      order: (f) => { const ascending = [...f.truth.list].sort((a, b) => (rel(a, b) === '<' ? -1 : rel(a, b) === '>' ? 1 : 0)); return (o) => { const fs = chain(o).filter((_, i) => i % 2 === 0).map(fracOf); return JSON.stringify(fs) === JSON.stringify(ascending) && chain(o).filter((_, i) => i % 2 === 1).every((x) => x === '<'); }; },
      missing: (f) => { const [, b, c, d] = f.truth.terms; const x = (BigInt(b) * BigInt(c)) / BigInt(d); return (o) => strip(o) === String(x); },
    };
    for (const f of FINAL) {
      const ok = truthOf[f.truth.kind](f);
      f.options.forEach((o, k) => {
        expect(ok(o), `${f.id} ${o}`).toBe(k === f.correct);
        expect(source, `${f.id} option ${o}`).toContain(o.replace(/\\/g, '\\\\'));
      });
    }
    expect(FINAL).toHaveLength(5);
    // E3 : 21 × 55 = 35 × 33 = 1155 ; E5 : 60 ÷ 6 = 10 exactement
    expect(21n * 55n).toBe(1155n);
    expect(35n * 33n).toBe(1155n);
    expect(15n * 4n % 6n).toBe(0n);
  });

  it('طريقة : les cinq exemples sont justes', () => {
    expect(156n * 7n).toBe(84n * 13n);
    expect(unit(3217, 8133)).toBe(1);
    expect(unit(5419, 4826)).toBe(4);
    expect(3217n * 8133n).not.toBe(5419n * 4826n);
    expect(rel('125/97', '61/340')).toBe('>');
    expect(rel('11/6', '9/4')).toBe('<');
    expect(rel('13/20', '13/21')).toBe('>');
    for (const m of ['cross', 'digits', 'one', 'multiple', 'numerator']) expect(METHOD[m].solution.length).toBeGreaterThanOrEqual(2);
  });

  it('« أستعدّ » : les affirmations sont vraies ou fausses comme annoncé', () => {
    const items = [...PREP_PLATFORM_ITEMS, ...PREP_ITEMS];
    expect(items).toHaveLength(7);
    expect(new Set(items.map((i) => i.answer)).size).toBe(2);
    expect(rel('7/12', '11/12')).toBe('<');                // 1 vrai
    expect(rel('5/8', '5/6')).toBe('<');                   // 2 faux (la phrase dit >)
    expect(rel('3/4', '7/12')).toBe('>') ;                 // 3 vrai ; 3/4 = 9/12
    expect(same('3/4', '9/12')).toBe(true);
    expect(rel('2/5', '3/10')).toBe('>');                  // 4 vrai
    expect(rel('9/7', '1')).toBe('>');                     // 5 faux (la phrase dit < 1)
    expect(same('3/4', '18/24')).toBe(true);               // 6 vrai
    expect(rel('7/10', '3/5')).toBe('>');                  // 7 vrai
  });

  it('le monde `equal` : 6/8 ; 9/12 et 15/20 raccordent, 7/9 et 12/15 non', () => {
    const t = LAB.equal.tasks[0];
    t.candidates.forEach(([c, d], i) => expect(same(`${t.a}/${t.b}`, `${c}/${d}`), `${c}/${d}`).toBe(i < 2));
  });
});
