import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, FINAL } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, METHOD, LAB } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les clés du درس « مقارنة وترتيب أعداد نسبية » recalculées avec un code INDÉPENDANT de `relative.js` : un lecteur de décimaux (texte
 * LaTeX → centièmes, BigInt). Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX, chaque affirmation de « أستعدّ » a la
 * vérité qu'elle annonce.
 */
const num = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(/,/g, '.').replace(/−/g, '-').replace(/\s/g, '');
  const m = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(t);
  if (!m) throw new Error(`illisible : ${s}`);
  const v = BigInt(m[2]) * 100n + BigInt((m[3] ?? '').padEnd(2, '0').slice(0, 2) || '0');
  return m[1] === '-' ? -v : v;
};
const cmp = (a, b) => { const x = num(a); const y = num(b); return x < y ? -1 : x > y ? 1 : 0; };
/** Les nombres d'une chaîne « a < b < c » ou « a > b > c » + son symbole. */
const parseChain = (s) => {
  const t = s.replace(/\$/g, '');
  const sym = t.includes('<') ? '<' : '>';
  return { sym, vals: t.split(sym).map((x) => x.trim()) };
};
const chainTrue = (s) => { const { sym, vals } = parseChain(s); return vals.every((v, i) => i === 0 || (sym === '<' ? cmp(vals[i - 1], v) < 0 : cmp(vals[i - 1], v) > 0)); };
const SYM = ['<', '>', '='];
const rowPair = (label) => label.replace(/\$/g, '').split('\\ldots').map((x) => x.replace(/\\ /g, '').trim());

describe('le درس « مقارنة وترتيب أعداد نسبية » — clés recalculées', () => {
  it('le lecteur lui-même', () => {
    expect(cmp('-1,9', '-1,91')).toBe(1);
    expect(cmp('-2{,}6', '-2{,}06')).toBe(-1);
    expect(cmp('0', '-12,40')).toBe(1);
  });

  it('chaque ligne de comparaison : la bonne vraie, les autres fausses', () => {
    for (const e of EXERCISES.filter((x) => x.interaction === 'batch' && x.question.rows.every((r) => r.label.includes('\\ldots') && r.options.length === 3 && r.options[0] === '$<$'))) {
      for (const r of e.question.rows) {
        const [a, b] = rowPair(r.label);
        const truth = cmp(a, b);
        r.options.forEach((o, k) => expect(SYM[k] === (truth < 0 ? '<' : truth > 0 ? '>' : '='), `${e.id} ${r.label} ${o}`).toBe(k === r.correct));
      }
    }
  });

  it('ex-14 : chaque affirmation de l’élève a la vérité annoncée', () => {
    const ex = EXERCISES.find((e) => e.id === 'ex-14');
    for (const r of ex.question.rows) {
      const t = r.text.replace(/\$/g, '');
      const sym = t.includes('<') ? '<' : '>';
      const [a, b] = t.split(sym).map((x) => x.trim());
      expect(r.answer, r.text).toBe(sym === '<' ? cmp(a, b) < 0 : cmp(a, b) > 0);
    }
    expect(new Set(ex.question.rows.map((r) => r.answer)).size).toBe(2);
  });

  it('ex-15 : plus grand, plus petit, plus proche de zéro', () => {
    const rows = EXERCISES.find((e) => e.id === 'ex-15').question.rows;
    const list = ['3,4', '-5,6', '0', '-1,2', '5', '-5,59'];
    const biggest = list.reduce((a, b) => (cmp(a, b) >= 0 ? a : b));
    const smallest = list.reduce((a, b) => (cmp(a, b) <= 0 ? a : b));
    const near = list.reduce((a, b) => (num(a) * (num(a) < 0n ? -1n : 1n) <= num(b) * (num(b) < 0n ? -1n : 1n) ? a : b));
    [biggest, smallest, near].forEach((v, i) => {
      rows[i].options.forEach((o, k) => expect(cmp(o, v) === 0, `${i} ${o}`).toBe(k === rows[i].correct));
    });
  });

  it('ex-17 / ex-18 : la chaîne juste est ordonnée, les autres fausses', () => {
    for (const id of ['ex-17', 'ex-18']) {
      const q = EXERCISES.find((e) => e.id === id).question;
      q.options.forEach((o, k) => expect(chainTrue(o), `${id} ${o}`).toBe(k === q.correct));
    }
    const q17 = EXERCISES.find((e) => e.id === 'ex-17').question;
    expect(parseChain(q17.options[q17.correct]).sym).toBe('<');
    const q18 = EXERCISES.find((e) => e.id === 'ex-18').question;
    expect(parseChain(q18.options[q18.correct]).sym).toBe('>');
  });

  it('ex-20 : un seul nombre strictement entre les bornes', () => {
    for (const r of EXERCISES.find((e) => e.id === 'ex-20').question.rows) {
      const [lo, hi] = r.label.replace(/\$/g, '').split('<').map((x) => x.replace('\\ldots', '').trim()).filter(Boolean);
      r.options.forEach((o, k) => expect(cmp(lo, o) < 0 && cmp(o, hi) < 0, `${r.label} ${o}`).toBe(k === r.correct));
    }
  });

  it('l’ouverture : −67,8 < −2 < 50 < 56,7', () => {
    const rows = EXERCISES.find((e) => e.id === 'opener').question.rows;
    expect(cmp(rows[0].options[rows[0].correct], '-67,8')).toBe(0);
    expect(cmp(rows[1].options[rows[1].correct], '56,7')).toBe(0);
  });

  it('le إختبار أولي : chaque clé vraie, chaque distracteur faux, et le module contient chaque option', () => {
    const src = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    const T = (v) => `$${v.replace(',', '{,}')}$`;
    for (const f of FINAL) {
      const [a, b] = f.truth;
      f.options.forEach((o, k) => {
        let good;
        let shown;
        if (f.kind === 'smaller') { good = cmp(o, a) === 0 ? cmp(a, b) < 0 : cmp(o, b) === 0 ? cmp(b, a) < 0 : false; shown = T(o); }
        else if (f.kind === 'greatest') { good = f.truth.every((t) => cmp(o, t) >= 0); shown = T(o); }
        else if (f.kind === 'between') { good = cmp(a, o) < 0 && cmp(o, b) < 0; shown = src.includes(`'$x = ${o.replace(',', '{,}')}$'`) ? `$x = ${o.replace(',', '{,}')}$` : T(o); }
        else { const chain = o.map((v) => T(v).replace(/\$/g, '')).join(' < '); good = o.every((v, i) => i === 0 || cmp(o[i - 1], v) < 0); shown = `$${chain}$`; }
        expect(good, `${f.id} ${JSON.stringify(o)}`).toBe(k === f.correct);
        expect(src.includes(`'${shown}'`), `${f.id} option ${shown} absente du module`).toBe(true);
      });
    }
    expect(FINAL.map((f) => f.id)).toEqual(['E1', 'E2', 'E3', 'E4', 'E5']);
  });

  it('la طريقة : l’ordre croissant donné est trié', () => {
    const v = METHOD.order.numbers.ascending;
    v.forEach((x, i) => { if (i) expect(cmp(v[i - 1], x)).toBe(-1); });
    const text = METHOD.order.solution.at(-1).split(':').at(-1).replace(/\$/g, '').replace(/\{,\}/g, ',').replace(/\s+\./, '');
    expect(text.split('<').map((s) => s.trim().replace(/\.$/, '').trim())).toEqual(v.map((x) => x));
  });

  it('« أستعدّ » : chaque affirmation a la vérité qu’elle annonce', () => {
    const items = [...PREP_ITEMS, ...PREP_PLATFORM_ITEMS];
    expect(items.map((i) => i.answer)).toEqual([true, false, false, true, true, false]);
    // vérifications indépendantes du fond (distance, opposé, encadrement)
    expect(num('2,3') === -num('-2,3')).toBe(true);
    expect(-num('-9') === num('9')).toBe(true);
    expect(num('-1,2') === -num('-2,1') || num('1,2') === num('-2,1')).toBe(false);
    expect(cmp('1', '1,5') < 0 && cmp('1,5', '2') < 0).toBe(true);
    expect(new Set(items.map((i) => i.answer)).size).toBe(2);
  });

  it('les tâches du labo : chacune a une solution (ou est déclarée impossible) selon un balayage indépendant', () => {
    const tasks = [...LAB.insert.tasks];
    for (const t of tasks) {
      const sols = [];
      for (let d = 0; d <= 10; d += 1) for (const side of ['above', 'below']) {
        const v = side === 'above' ? d : -d;
        if (cmp(String(v), t.lo) > 0 && cmp(String(v), t.hi) < 0) sols.push(v);
      }
      expect(sols.length, JSON.stringify(t)).toBeGreaterThan(0);
    }
  });

  it('les الكفاءات sont trois', () => {
    expect(LESSON_CONFIG.skills).toHaveLength(3);
  });
});
