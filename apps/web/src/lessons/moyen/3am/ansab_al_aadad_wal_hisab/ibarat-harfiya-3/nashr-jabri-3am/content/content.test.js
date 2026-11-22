import { describe, it, expect } from 'vitest';
import moduleEight from '../modules/Module08Itqan.jsx?raw';
import { PREP_ITEMS, KNOWLEDGE, METHOD_EXPAND, METHOD_DOUBLE, LAB, GUIDE } from './textbook';
import { EX, EXERCISES, FINAL, LP } from './exercises';
import { LESSON_CONFIG } from '../lesson.config';

/* ── Calcul de contrôle, ÉCRIT AUTREMENT que le code de la leçon : la valeur d'une somme de produits (chaque produit = deux listes de termes)
 *    pour des x entiers ; deux expressions de degré ≤ 3 sont égales ⇔ égales en 9 valeurs de x. ───────────────────────────────────────── */
const XS = [-4, -3, -2, -1, 0, 1, 2, 3, 5];
const listAt = (terms, x) => terms.reduce((s, q) => s + q.c * x ** q.p, 0);
const prodsAt = (products, x) => products.reduce((s, p) => s + p.sign * listAt(p.f1, x) * listAt(p.f2, x), 0);
const equalProd = (products, terms) => XS.every((x) => prodsAt(products, x) === listAt(terms, x));
const rowsOf = (id) => EX[id].question.rows;

describe('« نشر عبارات جبرية » — chaque clé recalculée', () => {
  it('الكفاءات : quatre, dans l\'ordre du catalogue, identifiants positionnels', () => {
    expect(LP).toEqual({ P1: '3am_nashr-jabri-3am_P1', P2: '3am_nashr-jabri-3am_P2', P3: '3am_nashr-jabri-3am_P3', P4: '3am_nashr-jabri-3am_P4' });
    expect(LESSON_CONFIG.skills).toHaveLength(4);
  });

  it('أستعدّ : la vérité de chaque affirmation', () => {
    const x = 7;
    const truth = [
      (-4) * (-6) === 24, // vrai
      (-5) * 3 === 15, // faux : −15
      5 * x + 2 - 3 * x === 2 * x + 2, // vrai
      9 - (x - 4) === 9 - x - 4, // faux : 13 − x
      true, // l'aire est le produit des bords : 7(x + 5)
      false, // 6(x + 10) est l'aire, pas le périmètre 2(x + 10) + 12
    ];
    expect(PREP_ITEMS.map((i) => i.answer)).toEqual(truth);
    expect(2 * (x + 10) + 12).not.toBe(6 * (x + 10));
    expect(new Set(PREP_ITEMS.map((i) => i.answer)).size).toBe(2);
  });

  it('les erreurs courantes : les nombres cités sont justes', () => {
    expect([3 * (5 + 4), 3 * 5 + 4]).toEqual([27, 19]); // x = 5
    expect([(10 - 2) * (10 - 3), 10 * 10 - 5 * 10 - 6]).toEqual([56, 44]); // x = 10
    expect([(1 + 3) * (1 + 2), 1 + 6]).toEqual([12, 7]); // x = 1
    expect(GUIDE.firstOnly.why).toContain('27');
    expect(GUIDE.corner.why).toContain('56');
    expect(GUIDE.twoOnly.why).toContain('12');
  });

  it('les encadrés et la méthode : 3(2−5x) − 4(x−1) + x(7−2x) = −2x² − 12x + 10 ; (2x+3)(5−x) = −2x² + 7x + 15', () => {
    const A = [{ sign: 1, f1: [{ c: 3, p: 0 }], f2: [{ c: 2, p: 0 }, { c: -5, p: 1 }] }, { sign: -1, f1: [{ c: 4, p: 0 }], f2: [{ c: 1, p: 1 }, { c: -1, p: 0 }] }, { sign: 1, f1: [{ c: 1, p: 1 }], f2: [{ c: 7, p: 0 }, { c: -2, p: 1 }] }];
    expect(equalProd(A, [{ c: -2, p: 2 }, { c: -12, p: 1 }, { c: 10, p: 0 }])).toBe(true);
    expect(prodsAt(A, 2)).toBe(-22);
    expect(METHOD_EXPAND.solution.at(-1)).toContain('-22');
    const B = [{ sign: 1, f1: [{ c: 2, p: 1 }, { c: 3, p: 0 }], f2: [{ c: 5, p: 0 }, { c: -1, p: 1 }] }];
    expect(equalProd(B, [{ c: -2, p: 2 }, { c: 7, p: 1 }, { c: 15, p: 0 }])).toBe(true);
    expect(prodsAt(B, 1)).toBe(20);
    expect(METHOD_DOUBLE.solution.at(-1)).toContain('20');
    // 6x − 3x² + 8 − 4x = −3x² + 2x + 8 (le manuel p. 59, ordre décroissant)
    expect(6 * 2 - 3 * 4 + 8 - 4 * 2).toBe(-3 * 4 + 2 * 2 + 8);
    expect(KNOWLEDGE.order.text).toContain('-3x^2+2x+8');
    // pont : −(x − 3) = (−1)(x − 3) = −x + 3
    for (const x of XS) expect(-(x - 3)).toBe((-1) * (x - 3));
    // aire de deux façons : 3(x + 4) = 3x + 12
    for (const x of XS) expect(3 * (x + 4)).toBe(3 * x + 12);
  });

  it('les tâches du labo : chaque réponse attendue est le développement de l\'expression écrite', () => {
    const parse = (s) => s.replace(/\^2/g, '**2');
    const ev = (src, x) => Function('x', `return ${parse(src)};`)(x); // eslint-disable-line no-new-func
    // plot : (h)(w) = answer
    const sideSrc = ({ m, n }) => `(${m}*x+${n})`;
    for (const tk of [...LAB.plot.beginner, ...LAB.plot.advanced]) {
      const ans = tk.answer.replace(/(\d)x/g, '$1*x').replace(/\^/g, '**').replace(/(^|[+-])x/g, '$11*x').replace(/\*\*2/g, '**2');
      for (const x of XS) expect(ev(`${sideSrc(tk.h)}*${sideSrc(tk.w)}`, x) + 0, tk.id).toBe(ev(ans, x) + 0);
    }
    const mul = (s) => s.replace(/(\d)(?=[x(])/g, '$1*').replace(/\)(?=[x(\d])/g, ')*').replace(/\^2/g, '**2');
    const pairs = LAB.arrows.map((a) => [mul(a.written), mul(a.answer).replace(/(^|[+-])x/g, '$11*x')]);
    for (const [w, a] of pairs) for (const x of XS) expect(Function('x', `return ${w};`)(x) + 0, w).toBe(Function('x', `return ${a};`)(x) + 0);
  });

  it('chaque ligne de développement : la clé est le développement réduit, chaque distracteur est FAUX', () => {
    const rows = [...rowsOf('ex-8'), ...rowsOf('ex-16'), ...rowsOf('now-59'), rowsOf('ex-18')[1]];
    expect(rows.length).toBe(12);
    for (const r of rows) {
      const { data } = r;
      expect(equalProd(data.products, data.result), r.label).toBe(true);
      expect(new Set(r.options).size).toBe(r.options.length);
      for (const w of data.wrongs) expect(equalProd(data.products, w), `${r.label} ↔ distracteur`).toBe(false);
      expect(r.options).toHaveLength(data.wrongs.length + 1);
    }
  });

  it('act-3 : 4(x + 6) = 4x + 24, 44 = 44 à x = 5, les distracteurs sont faux', () => {
    const rows = rowsOf('act-3');
    expect(rows.map((r) => r.options[r.correct])).toEqual(['$x+6$', '$4(x+6)$', '$4x+24$', '$4(x+6)=4x+24$', '$ac+ad+bc+bd$']);
    for (const x of XS) expect(4 * (x + 6)).toBe(4 * x + 24);
    expect([4 * (5 + 6), 4 * 5 + 24]).toEqual([44, 44]);
    for (const wrong of [4 * 5 + 6, 4 + (5 + 6), 4 * 5 + 10]) expect(wrong).not.toBe(44);
    // quatre aires d'un rectangle (a + b)(c + d), vérifiées par des nombres
    const [a, b, c, d] = [3, 5, 7, 2];
    expect((a + b) * (c + d)).toBe(a * c + a * d + b * c + b * d);
    expect((a + b) * (c + d)).not.toBe(a * c + b * d);
    expect((a + b) * (c + d)).not.toBe(a * b + c * d);
  });

  it('ex-15 : 4 + (x − 3) × 6 = 6x − 14, la copie du camarade (24x − 72) est fausse', () => {
    const rows = rowsOf('ex-15');
    const A = [{ sign: 1, f1: [{ c: 4, p: 0 }], f2: [{ c: 1, p: 0 }] }, { sign: 1, f1: [{ c: 6, p: 0 }], f2: [{ c: 1, p: 1 }, { c: -3, p: 0 }] }];
    expect(equalProd(A, [{ c: 6, p: 1 }, { c: -14, p: 0 }])).toBe(true);
    expect(equalProd(A, [{ c: 24, p: 1 }, { c: -72, p: 0 }])).toBe(false);
    expect(equalProd(A, [{ c: 6, p: 1 }, { c: -18, p: 0 }])).toBe(false);
    expect([4 + (5 - 3) * 6, 24 * 5 - 72]).toEqual([16, 48]);
    expect(rows[1].options[rows[1].correct]).toBe('$6x-14$');
  });

  it('ex-18 : à x = 1 le produit vaut 20 et l\'élève trouve 19', () => {
    expect([(3 + 1) * (1 + 4), 3 + 12 + 4]).toEqual([20, 19]);
    const rows = rowsOf('ex-18');
    expect(rows[0].options[rows[0].correct]).toBe('$19$');
    expect(rows[1].options[rows[1].correct].replace(/ /g, '')).toBe('$3x^2+13x+4$');
  });

  it('deep-43 : le verdict de chaque ligne = l\'égalité sur 9 valeurs de x', () => {
    const rows = EX['deep-43'].question.rows;
    expect(rows).toHaveLength(5);
    for (const r of rows) expect(equalProd(r.data.products, r.data.claim), r.text).toBe(r.answer);
    expect(rows.map((r) => r.answer)).toEqual([false, true, true, false, false]);
  });

  it('إختبار أولي : une compétence principale par épreuve, chaque clé recalculée, chaque distracteur faux, tout est dans le module', () => {
    expect(FINAL.map((f) => f.lp)).toEqual([LP.P3, LP.P1, LP.P2, LP.P4, LP.P4]);
    for (const f of FINAL) {
      expect(f.options[f.correct]).toBeTruthy();
      for (const o of f.options) expect(moduleEight, f.id).toContain(o.replace(/\\/g, '\\\\'));
      expect(new Set(f.options).size).toBe(f.options.length);
    }
    // E1 : une paire est valable ⇔ ses deux écritures donnent l'aire
    const e1 = FINAL[0];
    const valid = e1.pairs.map((p) => equalProd(e1.area, p.right) && XS.every((x) => prodsAt(p.left, x) === prodsAt(e1.area, x)));
    expect(valid).toEqual([true, false, false, false]);
    // E2 … E5 : valeurs sur 9 x
    for (const f of FINAL.slice(1)) {
      const key = f.options[f.correct];
      expect(f.products.length).toBeGreaterThan(0);
      const keyTerms = f.options.map((o) => o);
      expect(keyTerms[f.correct]).toBe(key);
      for (const w of f.wrongs) expect(equalProd(f.products, w), `${f.id} distracteur`).toBe(false);
    }
    const keys = { E2: [{ c: -6, p: 1 }, { c: 15, p: 0 }], E3: [{ c: 1, p: 2 }, { c: -1, p: 1 }, { c: -12, p: 0 }], E4: [{ c: 1, p: 2 }, { c: 3, p: 1 }, { c: -8, p: 0 }], E5: [{ c: 1, p: 1 }, { c: -5, p: 0 }] };
    for (const f of FINAL.slice(1)) expect(equalProd(f.products, keys[f.id]), f.id).toBe(true);
    expect(FINAL[1].options[0]).toBe('$-6x+15$');
    expect(FINAL[4].options[0]).toBe('$x-5$');
  });

  it('les modules : numérotation contiguë, 3 مسائل, évaluation en dernier ; durée = Σ des minutes ≤ 90', () => {
    const mods = LESSON_CONFIG.modules;
    expect(mods.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(mods.filter((m) => m.track === 'problem').map((m) => m.slug)).toEqual(['masala-1', 'masala-2', 'masala-3']);
    expect(mods.at(-1).stage).toBe('evaluation');
    const sum = mods.reduce((s, m) => s + m.estimatedMin, 0);
    expect(sum).toBe(LESSON_CONFIG.estimatedDurationMin);
    expect(sum).toBeLessThanOrEqual(90);
    expect(EXERCISES.map((e) => e.id)).toEqual(['act-3', 'ex-8', 'ex-15', 'ex-16', 'ex-18', 'now-59', 'deep-43']);
  });
});
