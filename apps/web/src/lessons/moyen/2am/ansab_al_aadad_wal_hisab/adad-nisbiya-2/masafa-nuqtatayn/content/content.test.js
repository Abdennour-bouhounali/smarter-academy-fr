import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, EX, FINAL } from './exercises';
import { PREP_PLATFORM_ITEMS, LAB, GUIDE } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les clés du درس « المسافة بين نقطتين على مستقيم مدرّج » recalculées avec un code INDÉPENDANT de `relative.js` : des décimaux en BigInt (centièmes), la distance = max − min.
 * Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX, chaque affirmation de « أستعدّ » a la vérité qu'elle annonce.
 */
const num = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\\,/g, '').replace(/\{,\}/g, '.').replace(/,/g, '.').replace(/−/g, '-').replace(/^\+/, '').trim();
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(t);
  if (!m) throw new Error(`illisible : ${s}`);
  const h = BigInt(m[2]) * 100n + BigInt((m[3] ?? '').padEnd(2, '0').slice(0, 2) || '0');
  return m[1] ? -h : h;
};
const gap = (a, b) => { const x = num(a); const y = num(b); return x > y ? x - y : y - x; };
const gh = (x, y) => (x > y ? x - y : y - x);
const rows = (id) => EX[id].question.rows;
const rightOf = (r) => r.options[r.correct];
/** Toutes les options d'une ligne sauf la bonne sont fausses : `ok(option)` dit si l'option est vraie. */
const checkRow = (r, ok, tag) => r.options.forEach((o, k) => expect(ok(o), `${tag} ${o}`).toBe(k === r.correct));

describe('le درس « المسافة بين نقطتين على مستقيم مدرّج » — clés recalculées', () => {
  it('act-5 : AB, AC, BC pour A(+4), B(−2), C(−7) et AC = AB + BC', () => {
    const r = rows('act-5');
    const want = [gap('4', '-2'), gap('4', '-7'), gap('-2', '-7')];
    expect(want).toEqual([600n, 1100n, 500n]);
    [0, 1, 2].forEach((i) => checkRow(r[i], (o) => num(o) === want[i], `act-5 ${i}`));
    expect(want[1]).toBe(want[0] + want[2]);
    expect(rightOf(r[3])).toContain('نعم');
  });

  it('ex-35 : six distances', () => {
    const pairs = [['-1.8', '0.7'], ['-0.3', '1.2'], ['-6', '-13'], ['2.5', '-9'], ['-120', '80'], ['150', '-17.5']];
    const r = rows('ex-35');
    pairs.forEach(([a, b], i) => checkRow(r[i], (o) => num(o) === gap(a, b), `ex-35 ${i}`));
    expect(pairs.map(([a, b]) => gap(a, b))).toEqual([250n, 150n, 700n, 1150n, 20000n, 16750n]);
  });

  it('ict-1 : les trois paires de distance 7, la quatrième ligne', () => {
    const r = rows('ict-1');
    const pairsOf = (o) => [...o.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]);
    [0, 1, 2].forEach((i) => checkRow(r[i], (o) => { const [a, b] = pairsOf(o); return gap(a, b) === 700n; }, `ict-1 ${i}`));
    checkRow(r[3], (o) => num(o) === gap('-36.5', '-29.5'), 'ict-1 3');
    expect(gap('-36.5', '-29.5')).toBe(700n);
  });

  it('deep-40 : la moitié de la distance depuis la plus petite fait le milieu', () => {
    const cases = [['-24', '10'], ['-61', '-29'], ['-4.6', '1.8']];
    const r = rows('deep-40');
    cases.forEach(([a, b], i) => {
      const lo = num(a) < num(b) ? num(a) : num(b);
      const mid = lo + gap(a, b) / 2n;
      expect(gap(a, b) % 2n).toBe(0n);
      checkRow(r[i], (o) => num(o) === mid, `deep-40 ${i}`);
      // le milieu est à égale distance des deux extrémités
      expect(mid - num(a) === num(b) - mid).toBe(true);
    });
  });

  it('deep-41 : deux points à la distance 4 de M(+1,5)', () => {
    const [pts, count] = rows('deep-41');
    const two = [num('1.5') + num('4'), num('1.5') - num('4')];
    expect(two).toEqual([550n, -250n]);
    expect(rightOf(pts)).toBe('$+5{,}5$ أو $-2{,}5$');
    for (const p of two) expect(gh(p, num('1.5'))).toBe(num('4'));
    expect(rightOf(count)).toBe('نقطتان');
  });

  it('deep-42 : les deux configurations possibles de B et C autour de A(−1,5)', () => {
    const A = num('-1.5');
    const bs = [A + 120n, A - 120n];
    const cs = [A + 400n, A - 400n];
    const ok = bs.flatMap((b) => cs.filter((c) => gh(b, c) === num('2.8')).map((c) => [b, c]));
    expect(ok.map(([b, c]) => [b, c])).toEqual([[num('-0.3'), num('2.5')], [num('-2.7'), num('-5.5')]]);
    const [r0, r1] = rows('deep-42');
    expect(num(rightOf(r0))).toBe(num('2.5'));
    expect(num(rightOf(r1))).toBe(num('-5.5'));
    // les autres options ne vérifient pas BC = 2,8
    r0.options.forEach((o, k) => expect(gap('-0.3', o) === num('2.8'), o).toBe(k === r0.correct));
    r1.options.forEach((o, k) => expect(gap('-2.7', o) === num('2.8'), o).toBe(k === r1.correct));
  });

  it('le إختبار أولي : chaque clé recalculée, chaque distracteur faux', () => {
    const e = Object.fromEntries(FINAL.map((f) => [f.id, f]));
    for (const id of ['E1', 'E2', 'E3']) {
      const f = e[id];
      f.options.forEach((o, k) => expect(num(o) === gap(f.truth.a, f.truth.b), `${id} ${o}`).toBe(k === f.correct));
    }
    expect(['E1', 'E2', 'E3'].map((id) => gap(e[id].truth.a, e[id].truth.b))).toEqual([1300n, 500n, 850n]);
    // E4 : a − d et a + d
    const pts = [num('-1') - num('3'), num('-1') + num('3')];
    expect(pts).toEqual([-400n, 200n]);
    expect(e.E4.options[e.E4.correct]).toBe('$-4$ و $+2$');
    expect(e.E4.options.filter((o) => /فقط/.test(o))).toHaveLength(2);
    // E5 : −6 + 8/2
    const mid = num('-6') + gap('-6', '2') / 2n;
    expect(num(e.E5.options[e.E5.correct])).toBe(mid);
    e.E5.options.forEach((o, k) => expect(num(o) === mid, o).toBe(k === e.E5.correct));
    expect(num('4')).toBe(gap('-6', '2') / 2n);          // HALFDIST
    expect(num('-4')).toBe(num('-6') + num('2'));        // SUMNOHALF
    expect(FINAL.map((f) => f.options.length)).toEqual([4, 4, 4, 4, 4]);
  });

  it('le إختبار أولي dans le module : chaque option du fichier, la clé à la bonne place', () => {
    const src = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    for (const f of FINAL) for (const o of f.options) expect(src.includes(o), `${f.id} ${o}`).toBe(true);
    expect(src.match(/correct: 0/g)).toHaveLength(5);
  });

  it('« أستعدّ » : la vérité annoncée', () => {
    expect(PREP_PLATFORM_ITEMS.map((i) => i.answer)).toEqual([true, false, false, true, false, true]);
    expect(num('6') + num('2.5')).toBe(num('8.5'));
    expect(num('-7') - num('-2')).toBe(num('-5'));
    expect(num('-6') > num('-6.5')).toBe(true);
    expect(num('-1') - 3n * 100n).toBe(num('-4'));
    expect(num('2') - num('9')).toBe(num('-7'));
  });

  it('le labo : معارف, le compas sur A(−4) jusqu’à B(+3) = 7', () => {
    const t = LAB.maarif.tasks[0];
    expect([t.anchor, t.target]).toEqual(['-4', '3']);
    expect(gap(t.anchor, t.target)).toBe(700n);
  });

  it('les phrases partagées disent la vérité', () => {
    expect(9 - 4).toBe(5);
    expect(4 + 9).toBe(13);
    expect(GUIDE.twoPoints).toContain('5{,}5');
    expect(num('1.5') + num('4')).toBe(num('5.5'));
    expect(num('1.5') - num('4')).toBe(num('-2.5'));
  });

  it('les modules de la configuration', () => {
    expect(LESSON_CONFIG.modules).toHaveLength(9);
    expect(EXERCISES).toHaveLength(6);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    for (const s of LESSON_CONFIG.skills) expect(s.length).toBeLessThanOrEqual(255);
  });
});
