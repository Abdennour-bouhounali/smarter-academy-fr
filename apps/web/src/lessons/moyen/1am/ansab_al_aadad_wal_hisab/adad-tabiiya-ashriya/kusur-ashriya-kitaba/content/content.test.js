import { describe, it, expect } from 'vitest';
import moduleNine from '../modules/Module09Itqan.jsx?raw';
import { PREP_ITEMS, LAB, KNOWLEDGE, METHOD_CONVERT, METHOD_SHIFT, GUIDE } from './textbook';
import { EX, EXERCISES, FINAL, LP } from './exercises';
import { PLATES, FIGURES, PLATE_CELLS } from './figures';
import { LEVELS } from '../../../../../../common/manipulations/levels.js';
import { validateGeoFigure, layoutGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure.js';

/* ── Arithmétique EXACTE (BigInt) : un évaluateur de l'écriture TeX utilisée par les énoncés ─────────────────────────────────────── */
const gcd = (a, b) => (b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b));
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const add = (x, y) => R(x.n * y.d + y.n * x.d, x.d * y.d);
const mul = (x, y) => R(x.n * y.n, x.d * y.d);
const div = (x, y) => R(x.n * y.d, x.d * y.n);
const eq = (x, y) => x.n === y.n && x.d === y.d;
const num = (s) => { const [i, f = ''] = s.split('.'); return R(BigInt(i + f), 10n ** BigInt(f.length)); };

/** « $3\times100+\frac{2}{10}$ » → fraction exacte. */
function evalTex(text) {
  const s = text.replace(/\$/g, '').replace(/\\,/g, '').replace(/\\ /g, '').replace(/\{,\}/g, '.').replace(/\s+/g, '').replace(/\\times/g, '*').replace(/\\div/g, '/');
  let i = 0;
  const peek = () => s[i];
  function atom() {
    if (s.startsWith('\\frac', i)) {
      i += 5; i += 1; const a = expr(); i += 2; const b = expr(); i += 1; return div(a, b);
    }
    if (peek() === '(') { i += 1; const v = expr(); i += 1; return v; }
    const m = /^\d+(\.\d+)?/.exec(s.slice(i));
    if (!m) throw new Error(`cannot parse « ${text} » at ${i}`);
    i += m[0].length; return num(m[0]);
  }
  function prod() {
    let v = atom();
    while (peek() === '*' || peek() === '/') { const op = s[i]; i += 1; const w = atom(); v = op === '*' ? mul(v, w) : div(v, w); }
    return v;
  }
  function expr() {
    let v = prod();
    while (peek() === '+') { i += 1; v = add(v, prod()); }
    return v;
  }
  const v = expr();
  if (i !== s.length) throw new Error(`trailing input in « ${text} » at ${i}`);
  return v;
}
const N = (x) => evalTex(String(x));
const key = (r) => r.options[r.correct];

/** Une ligne dont la clé vaut `expected` et dont CHAQUE distracteur vaut autre chose. */
function expectRow(row, expected, where) {
  const e = typeof expected === 'string' ? N(expected) : expected;
  row.options.forEach((o, k) => {
    const v = N(o);
    if (k === row.correct) expect(eq(v, e), `${where}: la clé « ${o} » doit valoir ${e.n}/${e.d}`).toBe(true);
    else expect(eq(v, e), `${where}: le distracteur « ${o} » ne doit pas valoir ${e.n}/${e.d}`).toBe(false);
  });
}
/** Les lignes dont l'énoncé est lui-même une écriture : la clé a la même valeur que l'énoncé. */
const sameAsLabel = (id, rows = EX[id].question.rows) => rows.forEach((r, i) => expectRow(r, N(r.label), `${id}[${i}]`));

describe('« الكسور العشرية والكتابة العشرية » — chaque clé recalculée en arithmétique exacte', () => {
  it('أستعدّ : la vérité de chaque affirmation', () => {
    const truth = [
      eq(R(3n, 10n), N('\\frac{3}{10}')), // 3 parts sur 10 : vrai
      N('\\frac{125}{100}').n < N('\\frac{125}{100}').d, // 125/100 < 1 : faux
      eq(add(N('2.5'), mul(N('0.75'), R(-1n))), N('1.25')), // 2,5 − 0,75 = 1,25 : faux
      eq(add(N('2.5'), N('1.25')), N('3.75')), // vrai
      Math.floor(2017 / 10) === 1, // 201 ≠ 1 : faux
      '5.07'.split('.')[1][1] === '7', // vrai
    ];
    expect(PREP_ITEMS.map((it) => it.answer)).toEqual(truth);
    expect(new Set(PREP_ITEMS.map((it) => it.answer)).size).toBe(2);
    expect(PREP_ITEMS.every((it) => ['kasr', 'jam', 'maratib'].includes(it.skill))).toBe(true);
  });

  it('les nombres du labo sont ceux des préréglages de levels.js et chaque tâche a UNE solution', () => {
    const pair = LEVELS['decimal-comma'];
    expect(pair.beginner.numbers.tasks).toEqual(LAB.mosaic.beginner);
    expect(pair.advanced.numbers.tasks).toEqual(LAB.mosaic.advanced);
    const value = (digits, p) => R(BigInt(digits), 10n ** BigInt(p));
    for (const t of [...LAB.mosaic.beginner, ...LAB.mosaic.advanced]) {
      const target = t.target.includes('/') ? N(`\\frac{${t.target.split('/')[0]}}{${t.target.split('/')[1]}}`) : N(t.target.replace(',', '{,}'));
      const places = [...Array(t.digits.length + 1).keys()].filter((p) => eq(value(t.digits, p), target));
      expect(places, `${t.digits} → ${t.target}`).toHaveLength(1);
    }
    // 235 : 2,35 ; 37 : 0,37 ; 05 : 0,05 ; 3125 sur 1000 : trois chiffres ; 605 sur 100 : deux ; 250 → 2,5 : deux (2,50)
    expect(LAB.mosaic.beginner.map((t) => [...Array(t.digits.length + 1).keys()].find((p) => eq(value(t.digits, p), N(t.target.replace(',', '{,}')))))).toEqual([2, 2, 2]);
    // machine : le résultat de chaque tâche, recalculé
    const ops = { '×10': [10n, 1n], '×100': [100n, 1n], '×1000': [1000n, 1n], '÷10': [1n, 10n], '÷100': [1n, 100n], '÷1000': [1n, 1000n], '×0,1': [1n, 10n], '×0,01': [1n, 100n] };
    const results = [...LAB.machine.beginner, ...LAB.machine.advanced].map((t) => { const [a, b] = ops[t.op]; const r = mul(N(t.start.replace(',', '{,}')), R(a, b)); return `${r.n}/${r.d}`; });
    expect(results).toEqual(['35/1', '350/1', '7/20', '7/200', '143750/1', '437/10000', '11/4', '3/500']);
  });

  it('les plaques : les carreaux coloriés sont recomptés sur les polygones', () => {
    const area = (fig) => fig.polygons.reduce((s, pg) => {
      const pts = pg.points.map((n) => fig.points[n]);
      return s + Math.abs(pts.reduce((a, p, i) => { const q = pts[(i + 1) % pts.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
    }, 0);
    expect(area(PLATES.A)).toBe(PLATE_CELLS.A);
    expect(area(PLATES.B)).toBe(PLATE_CELLS.B);
    expect(area(PLATES.C1) + area(PLATES.C2)).toBe(PLATE_CELLS.C);
    for (const fig of Object.values(FIGURES).flat()) {
      expect(validateGeoFigure(fig)).toEqual([]);
      expect(figureQuality(fig, { maxAspect: Infinity })).toEqual([]);
      expect(layoutGeoFigure(fig).width).toBeGreaterThan(0);
    }
  });

  it('act-2 : chaque plaque = carreaux / 100 ; chaque distracteur est faux', () => {
    const rows = EX['act-2'].question.rows;
    [PLATE_CELLS.A, PLATE_CELLS.B, PLATE_CELLS.C].forEach((cells, i) => expectRow(rows[i], R(BigInt(cells), 100n), `act-2[${i}]`));
  });

  it('act-3, ex-8, ex-11, ex-26 : la clé a la valeur de l\'énoncé, aucun distracteur ne l\'a', () => {
    for (const id of ['act-3', 'ex-8', 'ex-11', 'ex-26']) sameAsLabel(id);
  });

  it('ex-10 : trois écritures puis trois numérateurs manquants', () => {
    const rows = EX['ex-10'].question.rows;
    sameAsLabel('ex-10', rows.slice(0, 3));
    // 15 = ?/10 ; 0,03 = ?/100 ; 43,5 = ?/1000
    const dens = [10n, 100n, 1000n];
    [R(15n), N('0.03'), N('43.5')].forEach((value, k) => {
      rows[3 + k].options.forEach((o, j) => {
        expect(eq(R(BigInt(String(o).replace(/\$/g, '')), dens[k]), value), `ex-10[${3 + k}] ${o}`).toBe(j === rows[3 + k].correct);
      });
    });
  });

  it('ex-6 : 7/10 = 70/100 ; 58/100 = 5/10 + 8/100 ; sommes et fractions', () => {
    const rows = EX['ex-6'].question.rows;
    rows[0].options.forEach((o, j) => expect(eq(R(BigInt(o.replace(/\$/g, '')), 100n), N('\\frac{7}{10}')), `ex-6[0] ${o}`).toBe(j === rows[0].correct));
    rows[1].options.forEach((o, j) => {
      const [a, b] = o.split('و').map((x) => BigInt(x.trim()));
      expect(eq(add(R(a, 10n), R(b, 100n)), N('\\frac{58}{100}')), `ex-6[1] ${o}`).toBe(j === rows[1].correct);
    });
    rows.slice(2).forEach((r, i) => expectRow(r, N(r.label), `ex-6[${i + 2}]`));
  });

  it('ex-12 : du مفكوك au nombre et du nombre à son مفكوك', () => {
    const rows = EX['ex-12'].question.rows;
    sameAsLabel('ex-12', rows);
    // le مفكوك النموذجي n'a pas de terme nul : 805,07 et 49,302
    expect(key(rows[3])).not.toMatch(/\\frac\{0\}/);
    expect(key(rows[4])).not.toMatch(/\\frac\{0\}/);
  });

  it('ex-27 : calculatrice (÷ 100, ÷ 1000) et unités (g → kg, cm → m, kg + g)', () => {
    const rows = EX['ex-27'].question.rows;
    expect(key(rows[0])).toMatch(/45 ثم يقسم على 100/);
    expect(eq(div(R(45n), R(100n)), N('0.45'))).toBe(true);
    expect(key(rows[1])).toMatch(/12305 ثم يقسم على 1000/);
    expect(eq(div(R(12305n), R(1000n)), N('12.305'))).toBe(true);
    expectRow(rows[2], div(R(2450n), R(1000n)), 'ex-27[2]');
    expectRow(rows[3], div(R(340n), R(100n)), 'ex-27[3]');
    expectRow(rows[4], add(R(7n), div(R(30n), R(1000n))), 'ex-27[4]');
    // les distracteurs de calculatrice sont faux
    for (const k of [0, 1]) rows[k].options.forEach((o, j) => { if (j !== rows[k].correct) expect(o).not.toBe(key(rows[k])); });
    expect(eq(mul(R(45n), R(100n)), N('0.45'))).toBe(false);
    expect(eq(div(R(45n), R(10n)), N('0.45'))).toBe(false);
  });

  it('chaque exercice déclare une des quatre الكفاءات, et chacune est travaillée', () => {
    const lps = new Set(Object.values(LP));
    for (const e of EXERCISES) expect(lps.has(e.learningPointId), e.id).toBe(true);
    expect(new Set(EXERCISES.map((e) => e.learningPointId)).size).toBe(4);
    for (const e of EXERCISES) for (const r of e.question.rows) { expect(r.correct).toBeGreaterThanOrEqual(0); expect(r.correct).toBeLessThan(r.options.length); }
  });

  it('إختبار أولي : chaque clé est recalculée, chaque distracteur est faux ; le module porte les mêmes littéraux', () => {
    for (const f of FINAL) {
      const ref = N(f.ref);
      f.options.forEach((o, k) => {
        const v = N(o);
        const want = f.kind === 'equal' ? k === f.correct : k !== f.correct;
        expect(eq(v, ref), `${f.id} option ${k} « ${o} »`).toBe(want);
      });
      // le module affiche exactement ces énoncés, ces options et cette clé
      expect(moduleNine, f.id).toContain(`id: '${f.id}'`);
      for (const o of f.options) expect(moduleNine.replace(/\\\\/g, '\\'), `${f.id} ${o}`).toContain(o);
      expect(moduleNine).toContain(`correct: ${f.correct}`);
      expect(moduleNine).toContain(f.lp);
    }
    expect(FINAL.map((f) => f.lp)).toEqual([LP.P1, LP.P2, LP.P3, LP.P4, LP.P2]);
  });

  it('معارف et طريقة : les exemples du texte sont justes', () => {
    expect(eq(add(add(R(2n), R(3n, 10n)), R(5n, 100n)), N('2.35'))).toBe(true);
    expect(eq(N('2.35'), R(235n, 100n))).toBe(true);
    expect(eq(add(add(R(5n), R(2n, 10n)), R(6n, 1000n)), N('5.206'))).toBe(true); // 5,206 : pas de terme pour le 0
    expect(eq(add(add(mul(R(3n), R(1000n)), mul(R(4n), N('0.1'))), R(2n)), N('3002.4'))).toBe(true);
    expect(eq(R(3n, 10n), R(30n, 100n)) && eq(R(30n, 100n), R(300n, 1000n))).toBe(true);
    expect(eq(R(243n, 100n), add(add(R(2n), R(4n, 10n)), R(3n, 100n)))).toBe(true);
    expect(eq(N('3.40'), N('3.4')) && eq(N('12.0'), R(12n)) && eq(N('07.5'), N('7.5'))).toBe(true);
    expect(eq(N('0.05'), N('0.5'))).toBe(false);
    expect(eq(N('3.04'), N('3.4'))).toBe(false);
    expect(eq(mul(N('27.5'), N('0.1')), N('2.75'))).toBe(true);
    expect(eq(R(7n, 1000n), N('0.007'))).toBe(true);
    // 2,35 : 23 dixièmes (2350 / 100 = 23,5 → 23 entiers), 235 centièmes
    expect((2350n / 100n)).toBe(23n);
    expect(mul(N('2.35'), R(100n))).toEqual(R(235n));
    // طريقة 1 : 31,25 = 3125/100 ; 9345/1000 = 9,345
    expect(eq(N('31.25'), R(3125n, 100n))).toBe(true);
    expect(eq(R(9345n, 1000n), N('9.345'))).toBe(true);
    expect(METHOD_CONVERT.solution.join(' ')).toMatch(/3125/);
    // طريقة 2 : 56,8 × 10 … ÷ 1000
    const v = N('56.8');
    expect([mul(v, R(10n)), mul(v, R(100n)), mul(v, R(1000n)), div(v, R(10n)), div(v, R(100n)), div(v, R(1000n))].map((x) => `${x.n}/${x.d}`))
      .toEqual(['568/1', '5680/1', '56800/1', '142/25', '71/125', '71/1250']);
    expect(eq(div(v, R(10n)), N('5.68')) && eq(div(v, R(100n)), N('0.568')) && eq(div(v, R(1000n)), N('0.0568'))).toBe(true);
    expect(METHOD_SHIFT.solution.join(' ')).toContain('0{,}0568');
    // erreurs courantes : 3,5 × 10 = 35 ≠ 3,50 ; 3125/10 = 312,5 ≠ 31,25 ; 5/10 ≠ 0,05
    expect(eq(mul(N('3.5'), R(10n)), N('3.50'))).toBe(false);
    expect(eq(R(3125n, 10n), N('31.25'))).toBe(false);
    expect(eq(R(5n, 10n), N('0.05'))).toBe(false);
    expect(GUIDE.addZero.right).toContain('35');
    expect(KNOWLEDGE.zeros.trailing).toContain('0{,}05');
  });
});
