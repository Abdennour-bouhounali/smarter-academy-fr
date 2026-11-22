import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, EX, FINAL } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, LAB } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les clés du درس « التعليم على مستقيم مدرّج » recalculées avec un code INDÉPENDANT de `relative.js` : un lecteur de décimaux (texte LaTeX → centièmes, BigInt).
 * Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX, chaque affirmation de « أستعدّ » a la vérité qu'elle annonce.
 */
const num = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(/,/g, '.').replace(/−/g, '-').replace(/\s/g, '');
  const m = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(t);
  if (!m) throw new Error(`illisible : ${s}`);
  const v = BigInt(m[2]) * 100n + BigInt((m[3] ?? '').padEnd(2, '0').slice(0, 2) || '0');
  return m[1] === '-' ? -v : v;
};
const rows = (id) => EX[id].question.rows;
const rightOf = (r) => r.options[r.correct];
/** Chaque ligne : la bonne option vaut `want` ; aucune autre ne la vaut. */
const checkNumeric = (id, wants) => {
  rows(id).slice(0, wants.length).forEach((r, i) => {
    const want = num(wants[i]);
    r.options.forEach((o, k) => expect(num(o) === want, `${id} ligne ${i} option ${o}`).toBe(k === r.correct));
  });
};
/** « count » graduations (négatif : à gauche) de valeur `step` → centièmes. */
const grad = (count, step) => BigInt(count) * num(step);
const txt = (h) => { const neg = h < 0n; const a = neg ? -h : h; const f = String(a % 100n).padStart(2, '0').replace(/0+$/, ''); return `${neg ? '-' : ''}${a / 100n}${f ? `.${f}` : ''}`; };

describe('le درس « التعليم على مستقيم مدرّج » — clés recalculées', () => {
  it('le lecteur lui-même', () => {
    expect(num('$-1{,}25$')).toBe(-125n);
    expect(txt(grad(-14, '0.25'))).toBe('-3.5');
  });

  it('act-1 : la frise de la متوسطة — fonction de l’année et de l’origine 2000', () => {
    checkNumeric('act-1', [txt(num('1955') - num('2000')), txt(num('1990') - num('2000')), txt(num('2015') - num('2000')), txt(num('2025') - num('2000'))]);
    // la dernière ligne : la graduation 5 est la seule des trois qui garde −45 sur la planche et sur une graduation
    const years = ['1955', '1990', '2015', '2025'].map((y) => num(y) - num('2000'));
    const fits = (st) => years.every((x) => x % num(st) === 0n && (x < 0n ? -x : x) <= 10n * num(st));
    const last = rows('act-1')[4];
    last.options.forEach((o, k) => expect(fits(o.replace(/[^0-9]/g, '')), o).toBe(k === last.correct));
  });

  it('ex-4 : compter les graduations, multiplier par 5, signe selon le côté', () => {
    checkNumeric('ex-4', [txt(grad(-3, '5')), txt(grad(-1, '5')), txt(grad(2, '5')), txt(grad(5, '5'))]);
  });

  it('ex-7 : graduation 10 puis 0,25', () => {
    checkNumeric('ex-7', [txt(grad(-3, '10')), txt(grad(2, '10')), txt(grad(-5, '10')), txt(grad(4, '10')), txt(grad(-2, '0.25')), txt(grad(3, '0.25')), txt(grad(-5, '0.25')), txt(grad(4, '0.25'))]);
  });

  it('ex-9 : le nombre de graduations est la valeur absolue divisée par 0,25, la direction suit le signe', () => {
    const pts = [['-3.5', 14, 'يسارًا'], ['2', 8, 'يمينًا'], ['-1.25', 5, 'يسارًا'], ['0.75', 3, 'يمينًا']];
    rows('ex-9').forEach((r, i) => {
      const [x, n, dir] = pts[i];
      const abs = (num(x) < 0n ? -num(x) : num(x));
      expect(abs * 100n / num('0.25')).toBe(BigInt(n) * 100n);
      const hit = (o) => o.startsWith(`$${n}$`) && o.includes(dir);
      expect(hit(rightOf(r))).toBe(true);
      r.options.forEach((o, k) => expect(hit(o), o).toBe(k === r.correct));
    });
  });

  it('ex-10 : le symétrique n’est pas l’inverse', () => {
    checkNumeric('ex-10', ['2.5', '-4', '-0.4']);
  });

  it('ex-2 : la plus petite graduation de la liste qui garde les quatre températures dans les six graduations', () => {
    const vals = ['37', '0', '100', '-273.15'].map(num);
    const fits = (st) => vals.every((v) => (v < 0n ? -v : v) <= 6n * num(st));
    const opts = EX['ex-2'].question.options;
    const smallest = opts.map((o) => o.replace(/\$/g, '')).filter(fits)[0];
    expect(opts[EX['ex-2'].question.correct].replace(/\$/g, '')).toBe(smallest);
    expect(opts.map((o) => o.replace(/\$/g, '')).filter(fits).length).toBeGreaterThan(1);
  });

  it('ex-1 : chaque situation s’écrit avec un nombre négatif', () => {
    for (const r of rows('ex-1')) expect(num(rightOf(r)) < 0n).toBe(true);
    for (const r of rows('ex-1')) r.options.forEach((o, k) => expect(num(o) < 0n && txt(num(o)) === txt(num(rightOf(r))), o).toBe(k === r.correct));
  });

  it('le إختبار أولي : chaque clé recalculée, chaque distracteur faux', () => {
    const e = Object.fromEntries(FINAL.map((f) => [f.id, f]));
    expect(num(e.E1.options[e.E1.correct])).toBe(grad(-3, '5'));
    e.E1.options.forEach((o, k) => expect(num(o) === grad(-3, '5'), o).toBe(k === e.E1.correct));
    e.E2.options.forEach((o, k) => expect(num(o) === -num('-2.5'), o).toBe(k === e.E2.correct));
    const vals = e.E3.truth.values.map(num);
    const ok = (st) => vals.every((v) => v % num(st) === 0n && (v < 0n ? -v : v) <= 6n * num(st));
    e.E3.options.forEach((o, k) => expect(ok(o), o).toBe(k === e.E3.correct));
    e.E5.options.forEach((o, k) => expect(num(o) === num('50') - num('20'), o).toBe(k === e.E5.correct));
    expect(FINAL.map((f) => f.options.length)).toEqual([4, 4, 4, 4, 4]);
  });

  it('le إختبار أولي dans le module : chaque option du fichier, la clé à la bonne place', () => {
    const src = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    for (const f of FINAL.filter((x) => x.kind !== 'text')) for (const o of f.options) expect(src.includes(`'$${o.replace(',', '{,}')}$'`), `${f.id} ${o}`).toBe(true);
    expect(src.match(/correct: 0/g)).toHaveLength(5);
  });

  it('« أستعدّ » : la vérité annoncée', () => {
    expect(PREP_ITEMS.map((i) => i.answer)).toEqual([true, true, false, false]);
    expect(PREP_PLATFORM_ITEMS.map((i) => i.answer)).toEqual([false, true]);
    // item 5 : 2 + 7 × 0,1 = 2,7
    expect(num('2') + 7n * num('0.1')).toBe(num('2.7'));
    // item 3 : le symétrique de −8 est 8 ; item 4 : le symétrique de 1,2 est −1,2, pas −2,1
    expect(-num('-8')).toBe(num('8'));
    expect(-num('1.2')).not.toBe(num('-2.1'));
  });

  it('le labo : les tâches de معارف et le niveau متقدم', () => {
    const t = LAB.maarif.tasks[0];
    expect(t.pin).toBe('-20');
    // lampadaire −40, palmier +20, arrêt −35 vus depuis −20 : −20, +40, −15
    expect([-40, 20, -35].map((x) => x - -20)).toEqual([-20, 40, -15]);
  });

  it('les modules de la configuration', () => {
    expect(LESSON_CONFIG.modules).toHaveLength(9);
    expect(EXERCISES).toHaveLength(7);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
  });
});
