import { describe, it, expect } from 'vitest';
import moduleEight from '../modules/Module08Itqan.jsx?raw';
import { PREP_ITEMS, KNOWLEDGE, METHOD_BRACKETS, LAB } from './textbook';
import { EX, EXERCISES, FINAL, LP } from './exercises';
import { LESSON_CONFIG } from '../lesson.config';

/* ── Calcul de contrôle, ÉCRIT AUTREMENT que le code de la leçon : la valeur d'une expression à parenthèses pour des x entiers ; deux
 *    expressions sont égales ⇔ égales en 9 valeurs de x (un polynôme de degré ≤ 2 qui s'annule en 9 points est nul). ───────────────── */
const XS = [-4, -3, -2, -1, 0, 1, 2, 3, 5];
const termAt = (t, x) => t.c * x ** t.p;
const listAt = (terms, x) => terms.reduce((s, t) => s + termAt(t, x), 0);
const valueAt = (items, x) => items.reduce((s, it) => s + (Array.isArray(it.terms) ? it.sign * listAt(it.terms, x) : termAt(it, x)), 0);
const equal = (a, b) => XS.every((x) => valueAt(a, x) === valueAt(b, x));
const rowsOf = (id) => EX[id].question.rows;

describe('« تبسيط عبارة جبرية وحذف الأقواس » — chaque clé recalculée', () => {
  it('الكفاءات : quatre, dans l\'ordre du catalogue, identifiants positionnels', () => {
    expect(LP).toEqual({ P1: '3am_tabsit-hadhf-aqwas_P1', P2: '3am_tabsit-hadhf-aqwas_P2', P3: '3am_tabsit-hadhf-aqwas_P3', P4: '3am_tabsit-hadhf-aqwas_P4' });
    expect(LESSON_CONFIG.skills).toHaveLength(4);
  });

  it('أستعدّ : la vérité de chaque affirmation', () => {
    const truth = [
      7 * (10 + 8) === 7 * 10 + 7 * 8, // vrai
      2 * (5 + 3) === 2 * 5 + 3, // faux
      (-3) * (-5) === 15, // vrai
      -3 - (-5) === -8, // faux : 2
      false, // x + x + x + x + x = 5x, pas x^5 (pour tout x ≠ 0, 1, −1 : 5x ≠ x^5 ; ici x = 2 : 10 ≠ 32)
      true, // 5x × 2x = 10x²
    ];
    expect(2 + 2 + 2 + 2 + 2 === 2 ** 5).toBe(false);
    expect(5 * 2 * (2 * 2) === 10 * 2 ** 2).toBe(true);
    expect(PREP_ITEMS.map((i) => i.answer)).toEqual(truth);
    expect(new Set(PREP_ITEMS.map((i) => i.answer)).size).toBe(2);
  });

  it('les encadrés : les nombres cités sont justes (4x²+4x ≠ 8x², l\'erreur du premier signe, la méthode)', () => {
    expect([4 * 9 + 4 * 3, 8 * 9, 8 * 3]).toEqual([48, 72, 24]); // x = 3
    expect([9 - (4 * 3 - 5), 9 - 4 * 3 - 5]).toEqual([2, -8]);
    expect(KNOWLEDGE.noMix.text).toContain('48');
    // la méthode : A = 4x² − 5 + (7x − 2x²) − (3 − 4x) = 2x² + 11x − 8, vérifié sur 9 valeurs
    const A = [{ c: 4, p: 2 }, { c: -5, p: 0 }, { sign: 1, terms: [{ c: 7, p: 1 }, { c: -2, p: 2 }] }, { sign: -1, terms: [{ c: 3, p: 0 }, { c: -4, p: 1 }] }];
    expect(equal(A, [{ c: 2, p: 2 }, { c: 11, p: 1 }, { c: -8, p: 0 }])).toBe(true);
    expect(valueAt(A, 2)).toBe(22);
    expect(METHOD_BRACKETS.solution.at(-1)).toContain('22');
    // les tâches du labo en monde brackets
    const brackets = [
      [[{ c: 7, p: 0 }, { sign: 1, terms: [{ c: 2, p: 1 }, { c: -3, p: 0 }] }], [{ c: 2, p: 1 }, { c: 4, p: 0 }]],
      [[{ c: 9, p: 0 }, { sign: -1, terms: [{ c: 4, p: 1 }, { c: -5, p: 0 }] }], [{ c: -4, p: 1 }, { c: 14, p: 0 }]],
      [[{ c: 3, p: 1 }, { sign: 1, terms: [{ c: 1, p: 1 }, { c: -2, p: 0 }] }, { sign: -1, terms: [{ c: 5, p: 0 }, { c: -2, p: 1 }] }], [{ c: 6, p: 1 }, { c: -7, p: 0 }]],
    ];
    brackets.forEach(([e, r]) => expect(equal(e, r)).toBe(true));
    expect(LAB.brackets.map((b) => b.answer)).toEqual(['2x+4', '-4x+14', '6x-7']);
  });

  it('chaque ligne à parenthèses ou à monômes : la clé est la forme réduite, chaque distracteur est FAUX', () => {
    const rows = [...rowsOf('ex-12'), ...rowsOf('ex-5')].filter((r) => r.data.kind !== 'irreducible');
    expect(rows.length).toBe(10);
    for (const r of rows) {
      const { data } = r;
      const source = data.kind === 'brackets' ? data.expr : data.kind === 'sum' ? data.terms : [data.factors.reduce((a, b) => ({ c: a.c * b.c, p: a.p + b.p }), { c: 1, p: 0 })];
      expect(equal(source, data.result), r.label).toBe(true);
      expect(new Set(r.options).size).toBe(r.options.length);
      for (const w of data.wrongs) expect(equal(source, w), `${r.label} ↔ distracteur`).toBe(false);
      expect(r.options).toHaveLength(data.wrongs.length + 1);
    }
  });

  it('ex-5 : 3x² + 2x ne se simplifie pas (aucune des deux sommes proposées ne lui est égale)', () => {
    const r = rowsOf('ex-5').find((q) => q.data.kind === 'irreducible');
    for (const w of r.data.wrongs) expect(equal(r.data.terms, w)).toBe(false);
    expect(r.correct).toBe(0);
  });

  it('act-1 : 4 × 3x = 12x, 5 colonnes × 3 rangées = 15 carrés de x², 5x × 3x = 15x²', () => {
    const rows = rowsOf('act-1');
    expect(rows[2].options[rows[2].correct]).toBe('$12x$');
    expect(4 * 3).toBe(12);
    expect(rows[3].options[rows[3].correct]).toBe('$15$');
    expect(5 * 3).toBe(15);
    expect(rows[4].options[rows[4].correct]).toBe('$15x^2$');
    // les deux rangées « forme » : un produit et une somme, chacun la bonne dans sa question
    expect(rows[0].options[rows[0].correct]).toBe('$4\\times(3x)$');
    expect(rows[1].options[rows[1].correct]).toBe('$3x+3x+3x+3x$');
    expect(equal([{ c: 12, p: 1 }], [{ c: 3, p: 1 }, { c: 3, p: 1 }, { c: 3, p: 1 }, { c: 3, p: 1 }])).toBe(true);
    for (const r of rows.slice(2)) expect(new Set(r.options).size).toBe(r.options.length);
  });

  it('act-2 : seules les chaînes dont la valeur est celle du récit sont vraies', () => {
    const rows = EX['act-2'].question.rows;
    const values = [80 - (23 + 18), 80 - 23 - 18, 80 - (23 - 18), 45 + 12 - 5, 45 - 12 - 5, 45 + (12 - 5)];
    expect(rows.map((r) => r.data.value)).toEqual(values);
    expect(rows.map((r) => r.answer)).toEqual([true, true, false, true, false, true]);
    expect([values[0], values[3]]).toEqual([39, 52]);
  });

  it('ex-6 : les deux erreurs du camarade se réfutent à x = 2', () => {
    expect([4 * 2 - 3, 2]).toEqual([5, 2]);
    expect([3 * 2 + 7 * 2, 10 * 2 ** 2]).toEqual([20, 40]);
    const rows = rowsOf('ex-6');
    expect(rows).toHaveLength(2);
    rows.forEach((r) => expect(r.correct).toBeGreaterThanOrEqual(0));
  });

  it('ex-14 : ∠A = 200 − 2x, 110° à x = 45, −40 à x = 120, périmètre 12x + 36', () => {
    const A = [{ c: 180, p: 0 }, { c: -1, p: 1 }, { sign: -1, terms: [{ c: 1, p: 1 }, { c: -20, p: 0 }] }];
    expect(equal(A, [{ c: -2, p: 1 }, { c: 200, p: 0 }])).toBe(true);
    expect(equal(A, [{ c: -2, p: 1 }, { c: 160, p: 0 }])).toBe(false);
    expect(equal(A, [{ c: -1, p: 1 }, { c: 180, p: 0 }])).toBe(false);
    expect(valueAt(A, 45)).toBe(110);
    expect(valueAt(A, 120)).toBe(-40);
    const rows = rowsOf('ex-14');
    expect(rows[0].options[rows[0].correct]).toBe('$200-2x$');
    expect(rows[1].options[rows[1].correct]).toBe('$110$');
    expect(rows[2].correct).toBe(0);
    const per = [{ c: 4, p: 1 }, { c: 12, p: 0 }, { c: 3, p: 1 }, { c: 9, p: 0 }, { c: 5, p: 1 }, { c: 15, p: 0 }];
    expect(equal(per, [{ c: 12, p: 1 }, { c: 36, p: 0 }])).toBe(true);
    expect(equal(per, [{ c: 12, p: 1 }, { c: 15, p: 0 }])).toBe(false);
    expect(equal(per, [{ c: 12, p: 3 }, { c: 36, p: 0 }])).toBe(false);
    expect(rows[3].options[rows[3].correct]).toBe('$12x+36$');
  });

  it('deep-43 : le verdict de chaque ligne = l\'égalité sur 9 valeurs de x', () => {
    const rows = EX['deep-43'].question.rows;
    expect(rows).toHaveLength(6);
    for (const r of rows) {
      if (r.data.expr) expect(equal(r.data.expr, r.data.claim), r.text).toBe(r.answer);
      else expect(r.answer).toBe(false); // −2x × 3x = −6x² ≠ −6x
    }
    expect([-2 * 2 * (3 * 2), -6 * 2]).toEqual([-24, -12]); // à x = 2 : −6x² = −24 ≠ −6x = −12
    expect(rows.map((r) => r.answer)).toEqual([true, false, true, false, true, false]);
  });

  it('إختبار أولي : une compétence principale par épreuve, chaque clé recalculée, chaque distracteur faux, tout est dans le module', () => {
    expect(FINAL.map((f) => f.lp)).toEqual([LP.P4, LP.P1, LP.P1, LP.P2, LP.P3]);
    for (const f of FINAL) {
      expect(f.options[f.correct]).toBeTruthy();
      for (const o of f.options) expect(moduleEight, f.id).toContain(o);
      expect(new Set(f.options).size).toBe(f.options.length);
    }
    // E1 : la seule option dont la dernière opération (hors parenthèses) est un +/−
    const topLevelSum = (s) => { let d = 0; for (let i = 0; i < s.length; i += 1) { const ch = s[i]; if (i === 0 && ch === '-') continue; if (ch === '(') d += 1; else if (ch === ')') d -= 1; else if (d === 0 && (ch === '+' || ch === '-') ) return true; } return false; };
    const e1 = FINAL[0];
    const strip = (o) => o.replace(/\$/g, '');
    expect(e1.options.map((o) => topLevelSum(strip(o)))).toEqual([false, true, false, false]);
    // E2 … E5 : valeurs sur 9 x
    const e2 = FINAL[1];
    const product = [{ c: e2.factors[0].c * e2.factors[1].c, p: e2.factors[0].p + e2.factors[1].p }];
    expect(equal(product, [{ c: -24, p: 2 }])).toBe(true);
    for (const w of e2.wrongs) expect(equal(product, w)).toBe(false);
    const e3 = FINAL[2];
    expect(equal(e3.terms, [{ c: 4, p: 2 }, { c: -3, p: 1 }])).toBe(true);
    for (const w of e3.wrongs) expect(equal(e3.terms, w)).toBe(false);
    for (const k of [3, 4]) {
      const f = FINAL[k];
      const key = k === 3 ? [{ c: 3, p: 1 }, { c: 5, p: 0 }] : [{ c: 2, p: 1 }, { c: 7, p: 0 }];
      expect(equal(f.expr, key)).toBe(true);
      for (const w of f.wrongs) expect(equal(f.expr, w)).toBe(false);
    }
    expect(FINAL[3].options[0]).toBe('$3x+5$');
    expect(FINAL[4].options[0]).toBe('$2a+7$');
  });

  it('les modules : numérotation contiguë, 3 مسائل, évaluation en dernier ; durée = Σ des minutes ≤ 90', () => {
    const mods = LESSON_CONFIG.modules;
    expect(mods.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(mods.filter((m) => m.track === 'problem').map((m) => m.slug)).toEqual(['masala-1', 'masala-2', 'masala-3']);
    expect(mods.at(-1).stage).toBe('evaluation');
    const sum = mods.reduce((s, m) => s + m.estimatedMin, 0);
    expect(sum).toBe(LESSON_CONFIG.estimatedDurationMin);
    expect(sum).toBeLessThanOrEqual(90);
    expect(EXERCISES.map((e) => e.id)).toEqual(['act-1', 'act-2', 'ex-5', 'ex-6', 'ex-12', 'ex-14', 'deep-43']);
  });
});
