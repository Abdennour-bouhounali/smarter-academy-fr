import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, EX, FINAL } from './exercises';
import { PREP_PLATFORM_ITEMS, LAB } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les clés du درس « حساب مجموع جبري » recalculées avec un évaluateur INDÉPENDANT de `relative.js` : un petit analyseur récursif (parenthèses « ( ) » et « [ ] », décimaux, BigInt en centièmes).
 * Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX, chaque affirmation de « أستعدّ » a la vérité qu'elle annonce.
 */
const clean = (s) => String(s).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(/,/g, '.').replace(/−/g, '-').replace(/\\ldots/g, '').replace(/\s/g, '');
function ev(raw) {
  const s = clean(raw);
  let i = 0;
  const num = () => {
    const m = /^\d+(?:\.\d+)?/.exec(s.slice(i));
    if (!m) throw new Error(`illisible : ${raw} @${i}`);
    i += m[0].length;
    const [a, b = ''] = m[0].split('.');
    return BigInt(a) * 100n + BigInt(b.padEnd(2, '0').slice(0, 2) || '0');
  };
  const term = () => {
    if (s[i] === '(' || s[i] === '[') { i += 1; const v = expr(); i += 1; return v; }
    return num();
  };
  const expr = () => {
    let sign = 1n;
    if (s[i] === '+' || s[i] === '-') { sign = s[i] === '-' ? -1n : 1n; i += 1; }
    let acc = sign * term();
    while (i < s.length && (s[i] === '+' || s[i] === '-')) {
      const op = s[i]; i += 1;
      const v = term();
      acc = op === '+' ? acc + v : acc - v;
    }
    return acc;
  };
  const v = expr();
  if (i < s.length && s[i] !== ')' && s[i] !== ']') throw new Error(`reste : ${raw} @${i}`);
  return v;
}
const h = (x) => BigInt(Math.round(x * 100));
const rows = (id) => EX[id].question.rows;
const rightOf = (r) => r.options[r.correct];

describe('le درس « حساب مجموع جبري » — clés recalculées', () => {
  it('l’évaluateur : les chaînes du plan', () => {
    expect(ev('(+12)-[(-6)-(-2)+(+9)]')).toBe(h(7));
    expect(ev('(+4,5)+(-7)-(+8)+(+3,5)-(-4,5)-(-10)')).toBe(h(7.5));
    expect(ev('-15+4+8+3')).toBe(0n);
    expect(ev('(-9)-(+2)+(-5)-(-4)')).toBe(h(-12));
  });

  it('act-6 : la chaîne en additions seules est égale, les autres non ; deux calculs', () => {
    const r = rows('act-6');
    const orig = ev('(-7)-(+3)+(-4)-(-6)');
    r[0].options.forEach((o, k) => expect(ev(o) === orig, o).toBe(k === r[0].correct));
    expect(orig).toBe(h(-8));
    expect(rightOf(r[0])).not.toContain('-(');
    const wants = [ev('(-10)-(+5)-(-8)-(+2)'), ev('(+7)+(-2)-(-5)+(+4)')];
    [1, 2].forEach((i, n) => r[i].options.forEach((o, k) => expect(ev(o) === wants[n], `${i} ${o}`).toBe(k === r[i].correct)));
    expect(wants).toEqual([h(-9), h(14)]);
  });

  it('ex-29 : trois sommes ; ex-36 : trois sommes algébriques', () => {
    const w29 = ['(-6)+(+9)+(-3)+(+6)+(-9)', '(+8)+(-11)+(+5)+(-7)', '(-4)+(+15)+(-6)+(+4)+(+6)+(-8)'].map(ev);
    rows('ex-29').forEach((r, i) => r.options.forEach((o, k) => expect(ev(o) === w29[i], `${i} ${o}`).toBe(k === r.correct)));
    expect(w29).toEqual([h(-3), h(-5), h(7)]);
    const w36 = ['(+7)+(-4)-(+8)-(-2)+(-6)', '(-11)-(-8)-(-6)+(+4)-(+10)', '(-3)+(-12)-(-5)-(+4)+(+13)'].map(ev);
    rows('ex-36').forEach((r, i) => r.options.forEach((o, k) => expect(ev(o) === w36[i], `${i} ${o}`).toBe(k === r.correct)));
    expect(w36).toEqual([h(-9), h(-3), h(-1)]);
  });

  it('ex-37 : le calcul de l’élève est faux, le bon est −11', () => {
    expect(ev('(+7)-(+4)+(-4)+(-10)')).toBe(h(-11));
    expect(ev('(+7)+(-10)')).toBe(h(-3));
    const q = EX['ex-37'].question;
    expect(q.options[q.correct]).toContain('11');
    expect(q.options.filter((o, k) => k !== q.correct).every((o) => !o.includes('$-11$'))).toBe(true);
  });

  it('deep-39 : l’écriture simplifiée choisie est égale à la chaîne, les autres non', () => {
    const chains = ['(-5)+(+12)+(-3)+(-7)', '(+8)+(-2)-(+8)-(-9)'];
    rows('deep-39').forEach((r, i) => r.options.forEach((o, k) => {
      const [lhs, rhs] = o.split('=');
      expect(ev(lhs) === ev(chains[i]), o).toBe(k === r.correct);
      if (k === r.correct) expect(ev(rhs)).toBe(ev(lhs));
    }));
    expect(chains.map(ev)).toEqual([h(-3), h(7)]);
  });

  it('deep-43 : les trois signes', () => {
    const q = EX['deep-43'].question;
    q.options.forEach((o, k) => {
      const ops = o.replace(/\$/g, '').split('ثم').map((x) => x.trim());
      expect(ops).toHaveLength(3);
      const v = ev(`(+4)${ops[0]}(-6)${ops[1]}(+3)${ops[2]}(-2)`);
      expect(v === h(5), o).toBe(k === q.correct);
    });
  });

  it('deep-44 : 50 − 49 + 48 − … + 2 − 1 = 25', () => {
    let s = 0;
    for (let n = 50; n >= 1; n -= 1) s += n % 2 === 0 ? n : -n;
    expect(s).toBe(25);
    const q = EX['deep-44'].question;
    expect(q.options[q.correct]).toContain('$25$');
    q.options.forEach((o, k) => { if (k !== q.correct) expect(o).not.toContain('$25$'); });
  });

  it('deep-46 : la plus grande valeur possible avec les quatre nombres', () => {
    const nums = ['-6,4', '-5', '+2,7', '+12'];
    let best = null;
    for (let m = 0; m < 16; m += 1) {
      const v = nums.reduce((a, x, i) => a + (m & (1 << i) ? 1n : -1n) * ev(`(${x})`), 0n);
      if (best == null || v > best) best = v;
    }
    expect(best).toBe(h(26.1));
    const q = EX['deep-46'].question;
    q.options.forEach((o, k) => {
      expect(nums.every((x) => clean(o).includes(clean(`(${x})`).replace(/^\(\+/, '(+'))), o).toBe(true);
      expect(ev(o) === best, o).toBe(k === q.correct);
    });
  });

  it('deep-58 : le carré magique de somme nulle et ses cases manquantes', () => {
    const sq = [[3, -4, 1], [-2, 0, 2], [-1, 4, -3]];
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    for (let i = 0; i < 3; i += 1) { expect(sum(sq[i])).toBe(0); expect(sum(sq.map((r) => r[i]))).toBe(0); }
    expect(sq[0][0] + sq[1][1] + sq[2][2]).toBe(0);
    expect(sq[0][2] + sq[1][1] + sq[2][0]).toBe(0);
    expect([...sq.flat()].sort((a, b) => a - b)).toEqual([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
    const miss = [-(3 - 4), -(-1 + 4), -(1 + 2)];
    rows('deep-58').forEach((r, i) => r.options.forEach((o, k) => expect(ev(o) === h(miss[i]), `${i} ${o}`).toBe(k === r.correct)));
    expect(miss).toEqual([1, -3, -3]);
  });

  it('le إختبار أولي : chaque clé recalculée, chaque distracteur faux', () => {
    const e = Object.fromEntries(FINAL.map((f) => [f.id, f]));
    for (const id of ['E1', 'E3', 'E4']) {
      const want = ev(e[id].chain);
      e[id].options.forEach((o, k) => expect(ev(o) === want, `${id} ${o}`).toBe(k === e[id].correct));
    }
    expect([ev(e.E1.chain), ev(e.E3.chain), ev(e.E4.chain)]).toEqual([0n, h(17), 0n]);
    // E2 : l'écriture simplifiée égale à la chaîne ; les autres, non
    const w2 = ev(e.E2.chain);
    e.E2.options.forEach((o, k) => expect(ev(o) === w2, o).toBe(k === e.E2.correct));
    // E5 : l'expression égale à (−7)−(−2)
    const w5 = ev(e.E5.chain);
    e.E5.options.forEach((o, k) => expect(ev(o) === w5, o).toBe(k === e.E5.correct));
    // les erreurs nommées de la fiche
    expect(ev('(-8)-(+3)+(+5)')).toBe(h(-6));      // NOTURN de E1
    expect(ev('(+15)-(-6)+(+4)')).toBe(h(25));     // pas l'option BRACKETDROP
    expect(ev('(+15)-(-6)-(+4)') !== h(13)).toBe(true);
    expect(ev('15-6+4')).toBe(h(13));              // BRACKETDROP de E3 : 15 − 6 + 4
    expect(FINAL.map((f) => f.options.length)).toEqual([4, 4, 4, 4, 4]);
  });

  it('le إختبار أولي dans le module : chaque option du fichier, la clé à la bonne place', () => {
    const src = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    for (const f of FINAL) for (const o of f.options) expect(src.includes(`'$${o.replace(',', '{,}')}$'`), `${f.id} ${o}`).toBe(true);
    expect(src.match(/correct: 0/g)).toHaveLength(5);
  });

  it('« أستعدّ » : la vérité annoncée', () => {
    expect(PREP_PLATFORM_ITEMS.map((i) => i.answer)).toEqual([true, false, true, false, true, true]);
    expect(ev('(-6)+(-9)')).toBe(h(-15));
    expect(ev('(+4)-(-7)')).not.toBe(h(-3));
    expect(ev('(-2,5)+(+2,5)')).toBe(0n);
    expect(ev('20-(8-3)')).not.toBe(h(9));
    expect(ev('30-[12-(5+2)]')).toBe(h(25));
    expect(ev('(-5)-(+3)')).toBe(ev('(-5)+(-3)'));
  });

  it('le labo : la chaîne de معارف', () => {
    expect(ev(LAB.alone.tasks[0].chain)).toBe(h(-12));
  });

  it('les modules de la configuration', () => {
    expect(LESSON_CONFIG.modules).toHaveLength(9);
    expect(EXERCISES).toHaveLength(9);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    for (const sk of LESSON_CONFIG.skills) expect(sk.length).toBeLessThanOrEqual(255);
  });
});
