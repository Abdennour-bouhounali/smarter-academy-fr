import { describe, it, expect } from 'vitest';
import moduleEight from '../modules/Module08Itqan.jsx?raw';
import { PREP_ITEMS, LAB, KNOWLEDGE, METHOD_APPLY, GUIDE } from './textbook';
import { EX, EXERCISES, FINAL, LP } from './exercises';
import { LEVELS } from '../../../../../../common/manipulations/levels.js';

/* ── Arithmétique EXACTE, indépendante du code testé (ni letterRule.js, ni le labo) : rationnels BigInt, un évaluateur d'expressions PROPRE à ce test ────────────── */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const Q = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const lit = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(',', '.').replace(/−/g, '-').trim();
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(t);
  if (!m) throw new Error(`illisible : ${s}`);
  const f = m[3] ?? '';
  const v = BigInt(m[2] + f);
  return Q(m[1] ? -v : v, 10n ** BigInt(f.length));
};
const add = (x, y) => Q(x.n * y.d + y.n * x.d, x.d * y.d);
const sub = (x, y) => Q(x.n * y.d - y.n * x.d, x.d * y.d);
const mul = (x, y) => Q(x.n * y.n, x.d * y.d);
const div = (x, y) => Q(x.n * y.d, x.d * y.n);
const eq = (x, y) => x.n === y.n && x.d === y.d;
/** Évalue « 4*(a+3) », « 3*x+2*y », « 2*(x+0,5) », « n*n » (+ − * ÷ et parenthèses, priorités) par descente récursive : propre à ce test. */
function evalExpr(src, env) {
  const s = src.replace(/\s+/g, '');
  let p = 0;
  const num = () => { let j = p; while (j < s.length && /[0-9,]/.test(s[j])) j += 1; const v = lit(s.slice(p, j)); p = j; return v; };
  const atom = () => {
    if (s[p] === '(') { p += 1; const v = sum(); p += 1; return v; }
    if (/[a-z]/.test(s[p])) { const v = lit(env[s[p]]); p += 1; return v; }
    return num();
  };
  const prod = () => { let v = atom(); while (s[p] === '*' || s[p] === '/') { const o = s[p]; p += 1; const w = atom(); v = o === '*' ? mul(v, w) : div(v, w); } return v; };
  const sum = () => { let v = prod(); while (s[p] === '+' || s[p] === '-') { const o = s[p]; p += 1; const w = prod(); v = o === '+' ? add(v, w) : sub(v, w); } return v; };
  const v = sum();
  if (p !== s.length) throw new Error(`reste : ${src}`);
  return v;
}
const key = (r) => r.options[r.correct];
const L = lit;
const I = (x) => Q(BigInt(x));

describe('« تطبيق قاعدة حرفية » — chaque clé recalculée', () => {
  it('أستعدّ : la vérité de chaque affirmation', () => {
    const truth = [
      eq(mul(L('3,5'), L('4')), L('14')), // vrai
      eq(sub(L('12'), L('4,7')), L('8,3')), // faux : 7,3
      eq(add(I(2), mul(I(3), I(4))), I(20)), // faux : 14
      eq(mul(add(I(2), I(3)), I(4)), I(20)), // vrai
      eq(mul(I(2), add(I(8), I(5))), I(26)), // vrai : périmètre
      eq(mul(I(8), I(5)), I(26)), // faux : l'aire est 40
    ];
    expect(PREP_ITEMS.map((it) => it.answer)).toEqual(truth);
    expect(new Set(PREP_ITEMS.map((it) => it.answer)).size).toBe(2);
    expect(PREP_ITEMS.every((it) => ['jam', 'awla', 'mustatil'].includes(it.skill))).toBe(true);
    expect(eq(mul(I(8), I(5)), I(40))).toBe(true);
  });

  it('les valeurs du labo sont celles des préréglages de levels.js', () => {
    const pair = LEVELS['letter-dial'];
    expect(pair.beginner.numbers.tasks).toEqual(LAB.beginner);
    expect(pair.advanced.numbers.tasks).toEqual(LAB.advanced);
  });

  it('le labo : chaque valeur recalculée ; une seule valeur pour 95 ; n écrit deux fois ; (2 ; 2) tient et (3 ; 4) réfute ; la clôture échangée vaut pareil', () => {
    const [b1, b2, b3] = LAB.beginner;
    expect(eq(evalExpr(b1.formula, { n: '12' }), I(80))).toBe(true);
    // b2 : une seule valeur de n donne 95 sur le cadran 0–30
    const hits = [...Array(31).keys()].filter((n) => eq(evalExpr(b2.formula, { n: String(n) }), I(95)));
    expect(hits).toEqual([15]);
    expect((b3.formula.match(/n/g) ?? []).length).toBe(2);
    expect(eq(evalExpr(b3.formula, { n: '10' }), I(60))).toBe(true);
    // la valeur « 5 collé à n » donnerait 512 + 20 : ce n'est pas la règle
    expect(Number(`5${12}`) + 20).toBe(532);
    const [a1, a2, a3] = LAB.advanced;
    expect(eq(evalExpr(a1.formula, { a: '15', b: '8' }), I(46))).toBe(true);
    expect(eq(evalExpr(a2.formula, { a: '8', b: '15' }), I(46))).toBe(true);
    expect(eq(evalExpr('2*15+8', {}), I(38))).toBe(true); // ce que donnerait le oubli des parenthèses
    const side = (a, b) => [evalExpr(a3.left, { a, b }), evalExpr(a3.right, { a, b })];
    expect(eq(...side('2', '2'))).toBe(true);
    expect(eq(...side('3', '4'))).toBe(false);
    expect([side('3', '4')[0], side('3', '4')[1]]).toEqual([I(7), I(12)]);
    // la prétendue règle n'est vraie que pour (0 ; 0) et (2 ; 2) sur 0–12 : tout autre couple la réfute
    let holds = 0;
    for (let a = 0; a <= 12; a += 1) for (let b = 0; b <= 12; b += 1) if (eq(...side(String(a), String(b)))) holds += 1;
    expect(holds).toBe(2); // (0;0) et (2;2) : a + b = ab ⇔ (a−1)(b−1) = 1, seuls (0;0) et (2;2) en entiers ≥ 0
  });

  it('les tâches de la méthode : 4 × n + 15 avec n = 9 vaut 51 ; « 2a = a + 2 » tient pour a = 2 et se réfute pour a = 3', () => {
    const [m1, m2] = LAB.method;
    expect(eq(evalExpr(m1.formula, { n: '9' }), I(51))).toBe(true);
    expect(eq(evalExpr('4*9', {}), I(36))).toBe(true); // 36 : le 15 oublié
    expect(Number('49') + 15).toBe(64);
    expect(eq(evalExpr(m2.left, { a: '2' }), evalExpr(m2.right, { a: '2' }))).toBe(true);
    expect(eq(evalExpr(m2.left, { a: '3' }), evalExpr(m2.right, { a: '3' }))).toBe(false);
  });

  it('exercices : chaque clé recalculée, chaque distracteur FAUX', () => {
    // ex-1 : P = 3 × w + d
    const e1 = EX['ex-1'].question.rows;
    const pts = [[5, 2], [3, 6], [7, 0]].map(([w, d]) => evalExpr('3*w+d', { w: String(w), d: String(d) }));
    pts.forEach((v, i) => { expect(eq(L(key(e1[i])), v), `ex-1 ${i}`).toBe(true); e1[i].options.slice(1).forEach((o) => expect(eq(L(o), v), o).toBe(false)); });
    expect(pts).toEqual([I(17), I(15), I(21)]);
    expect(key(e1[3])).toBe('الأحمر'); // 21 > 17 > 15
    // les distracteurs reproduisent des erreurs précises
    expect(eq(evalExpr('3*(5+2)', {}), I(21))).toBe(true);
    expect(eq(evalExpr('3+5+2', {}), I(10))).toBe(true);
    // ex-2 : B = 2x + 9 − x ÷ 2
    const e2 = EX['ex-2'].question.rows;
    const k2 = ['4', '0,5', '0'].map((x) => evalExpr('2*x+9-x/2', { x }));
    k2.forEach((v, i) => { expect(eq(L(key(e2[i])), v), `ex-2 ${i}`).toBe(true); e2[i].options.slice(1).forEach((o) => expect(eq(L(o), v), o).toBe(false)); });
    expect(k2).toEqual([I(15), L('9,75'), I(9)]);
    // ex-3 : C = (5x) − (3y) + 4
    const e3 = EX['ex-3'].question.rows;
    const k3 = [['3', '2'], ['4', '2'], ['2', '3']].map(([x, y]) => evalExpr('(5*x)-(3*y)+4', { x, y }));
    k3.forEach((v, i) => { expect(eq(L(key(e3[i])), v), `ex-3 ${i}`).toBe(true); e3[i].options.slice(1).forEach((o) => expect(eq(L(o), v), o).toBe(false)); });
    expect(k3).toEqual([I(13), I(18), I(5)]);
    // ex-4 : V = d ÷ t, et la contre-épreuve V × t = d
    const e4 = EX['ex-4'].question.rows;
    const k4 = [['120', '2'], ['90', '1,5'], ['45', '0,5']].map(([d, t]) => evalExpr('d/t', { d, t }));
    k4.forEach((v, i) => { expect(eq(L(key(e4[i])), v), `ex-4 ${i}`).toBe(true); e4[i].options.slice(1).forEach((o) => expect(eq(L(o), v), o).toBe(false)); });
    expect(k4).toEqual([I(60), I(60), I(90)]);
    expect(eq(mul(I(60), L('1,5')), I(90))).toBe(true);
    expect(eq(mul(I(90), L('0,5')), I(45))).toBe(true);
    // ex-5 : les écritures ; 2x pour x = 3
    const e5 = EX['ex-5'].question.rows;
    expect(key(e5[0])).toBe('$3a$');
    expect(key(e5[1])).toBe('$ab$');
    expect(eq(evalExpr('2*x', { x: '3' }), I(6))).toBe(true);
    expect(eq(L(key(e5[2])), I(6))).toBe(true);
    e5[2].options.slice(1).forEach((o) => expect(eq(L(o), I(6)), o).toBe(false));
    expect(Number('23')).not.toBe(6);
    expect(key(e5[3])).toContain('لا');
    // ex-6 : 6x − 4 dans un tableur
    const e6 = EX['ex-6'].question.rows;
    expect(key(e6[0])).toBe('$=6*A2-4$');
    expect(e6[0].options.slice(1)).toEqual(['$=6A2-4$', '$=6*A2+4$']);
    ['2', '5', '10'].forEach((x, i) => {
      const v = evalExpr('6*x-4', { x });
      expect(eq(L(key(e6[i + 1])), v), `ex-6 ${i + 1}`).toBe(true);
      e6[i + 1].options.slice(1).forEach((o) => expect(eq(L(o), v), o).toBe(false));
    });
    expect(['2', '5', '10'].map((x) => evalExpr('6*x-4', { x }))).toEqual([I(8), I(26), I(56)]);
    expect(eq(evalExpr('62-4', {}), I(58))).toBe(true); // 6A2 lu comme 62
    // ex-7 : 2n > n est faux pour n = 0 seulement (pour n ≥ 1 vraie) : n = 5 tient, n = 0 réfute
    const gt = (n) => { const v = evalExpr('2*n', { n: String(n) }); const w = L(String(n)); return v.n * w.d > w.n * v.d; };
    expect(gt(5)).toBe(true);
    expect(gt(0)).toBe(false);
    expect(key(EX['ex-7'].question.rows[0])).toContain('صحيحة');
    expect(key(EX['ex-7'].question.rows[1])).toContain('خاطئة');
    // les sources et les الكفاءات des exercices
    expect(EXERCISES.map((e) => e.source.elementId)).toEqual(['act-2', 'ex-4', 'ex-5', 'ex-6', 'know-1', 'ict', 'act-4']);
    expect(EXERCISES.every((e) => Object.values(LP).includes(e.learningPointId))).toBe(true);
    expect(EXERCISES.map((e) => e.learningPointId)).toEqual([LP.P2, LP.P2, LP.P2, LP.P2, LP.P1, LP.P2, LP.P3]);
  });

  it('إختبار أولي : cinq épreuves, chaque clé recalculée, chaque distracteur FAUX, le module contient chaque option et chaque énoncé', () => {
    expect(FINAL).toHaveLength(5);
    const [e1, e2, e3, e4, e5] = FINAL;
    expect(e1.options[e1.correct]).toBe('$6t$');
    expect(e1.options.slice(1)).toEqual(['$t6$', '$6+t$', '$t+6$']);
    [e2, e3, e4].forEach((E) => {
      const v = evalExpr(E.expr, E.env);
      expect(eq(L(E.options[E.correct]), v), E.id).toBe(true);
      E.options.forEach((o, i) => { if (i !== E.correct) expect(eq(L(o), v), `${E.id} ${o}`).toBe(false); });
    });
    expect(eq(evalExpr('4*(a+3)', { a: '5' }), I(32))).toBe(true);
    expect(eq(evalExpr('3*x+2*y', { x: '4', y: '5' }), I(22))).toBe(true);
    expect(eq(evalExpr('2*(x+0,5)', { x: '3' }), I(7))).toBe(true);
    // les distracteurs de E2–E4 reproduisent des erreurs précises
    expect(eq(evalExpr('4*5+3', {}), I(23))).toBe(true);
    expect(eq(evalExpr('4+5+3', {}), I(12))).toBe(true);
    expect(eq(evalExpr('4*5', {}), I(20))).toBe(true);
    expect(Number('34') + Number('25')).toBe(59);
    expect(eq(evalExpr('3+4+2+5', {}), I(14))).toBe(true);
    expect(eq(evalExpr('2*3+0,5', {}), L('6,5'))).toBe(true);
    // E5 : n × n = 2 × n — seule la valeur 3 réfute ; 0 et 2 tiennent
    const holdsAt = (n) => eq(evalExpr(e5.left, { n: String(n) }), evalExpr(e5.right, { n: String(n) }));
    expect(holdsAt(3)).toBe(false);
    expect(holdsAt(0)).toBe(true);
    expect(holdsAt(2)).toBe(true);
    expect(e5.options.map((o) => o)).toEqual(['$n=3$', '$n=0$', '$n=2$', '$n=0$ أو $n=2$']);
    // le module 8 contient chaque énoncé et chaque option, LITTÉRAUX (l'audit les lit statiquement)
    FINAL.forEach((E) => {
      expect(moduleEight, E.id).toContain(E.stem.replace(/\\/g, '\\\\'));
      E.options.forEach((o) => expect(moduleEight, `${E.id} ${o}`).toContain(o.replace(/\\/g, '\\\\')));
      expect(E.correct).toBe(0);
    });
    expect(moduleEight).toContain("learningPointIds: ['1am_tatbiq-qaida-harfiya_P3']");
    expect(FINAL.map((E) => E.lp)).toEqual([LP.P1, LP.P2, LP.P2, LP.P2, LP.P3]);
  });

  it('la طريقة : la solution écrite est juste ; les erreurs courantes sont fausses', () => {
    expect(eq(evalExpr('3*(x+2)-y', { x: '4', y: '5' }), I(13))).toBe(true);
    expect(METHOD_APPLY.solution.join(' ')).toContain('A=13');
    expect(METHOD_APPLY.solution).toHaveLength(4);
    expect(eq(evalExpr('3*(4+2)-5', {}), I(13))).toBe(true);
    expect(eq(evalExpr('3*6-5', {}), I(13))).toBe(true);
    // « glued » : 5 × 12 = 60, jamais 512
    expect(eq(evalExpr('5*12', {}), I(60))).toBe(true);
    expect(GUIDE.glued.why).toContain('60');
    expect(GUIDE.glued.wrong).toContain('512');
    // « once » : 5 × 10 + 20 − 10 = 60
    expect(eq(evalExpr('5*10+20-10', {}), I(60))).toBe(true);
    // « order » : 2 × 15 + 8 = 38 et 2 × (15 + 8) = 46
    expect(eq(evalExpr('2*15+8', {}), I(38))).toBe(true);
    expect(GUIDE.order.wrong).toContain('38');
    expect(GUIDE.order.right).toContain('46');
    // « many » : 2 + 2 = 2 × 2 ; 3 + 4 = 7 ≠ 12
    expect(eq(evalExpr('2+2', {}), evalExpr('2*2', {}))).toBe(true);
    expect(eq(evalExpr('3+4', {}), I(7))).toBe(true);
    expect(eq(evalExpr('3*4', {}), I(12))).toBe(true);
    // les mots de la connaissance
    expect(KNOWLEDGE.apply.text).toContain('46');
    expect(KNOWLEDGE.convNum.text).toContain('23');
    expect(eq(evalExpr('2*(15+8)', {}), I(46))).toBe(true);
  });

  it('aucun texte visible ne renvoie au manuel ni ne nomme un mot de l\'ancien monde', () => {
    const texts = JSON.stringify({ KNOWLEDGE, METHOD_APPLY, GUIDE, EX, FINAL });
    expect(texts).not.toMatch(/الكتاب ص|اقرأ ما يقوله الكتاب|تمارين من الكتاب|صفحة \d/);
  });
});
