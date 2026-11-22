import { describe, it, expect } from 'vitest';
import moduleEight from '../modules/Module08Itqan.jsx?raw';
import { PREP_ITEMS, LAB, KNOWLEDGE, METHOD_FIND, GUIDE } from './textbook';
import { EX, EXERCISES, FINAL, LP } from './exercises';
import { LEVELS } from '../../../../../../common/manipulations/levels.js';

/* ── Arithmétique EXACTE, indépendante du code testé : rationnels en BigInt (n/d), décimaux lus à la virgule ───────────────────────── */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const Q = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const lit = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(',', '.').replace(/−/g, '-').trim();
  const fr = /^\\frac\{(\d+)\}\{(\d+)\}$/.exec(t);
  if (fr) return Q(BigInt(fr[1]), BigInt(fr[2]));
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
/** Le nombre manquant d'une machine `op` de nombre `a` qui a rendu `b` (le trou est ce qui entre) : calculé DIRECTEMENT, sans passer par les cartes. */
const hole = (op, a, b) => ({ add: sub(b, a), sub: add(b, a), rsub: sub(a, b), mul: div(b, a) })[op];
/** Ce que la machine rend quand on lui donne x. */
const run = (op, a, x) => ({ add: add(x, a), sub: sub(x, a), rsub: sub(a, x), mul: mul(x, a) })[op];
const key = (r) => r.options[r.correct];
const L = lit;

describe('« البحث عن أعداد ناقصة » — chaque clé recalculée', () => {
  it('أستعدّ : la vérité de chaque affirmation', () => {
    const truth = [
      eq(add(L('2,4'), L('5,8')), L('8,2')), // vrai
      eq(sub(L('10'), L('3,6')), L('7,6')), // faux : 6,4
      eq(mul(L('1,5'), L('4')), L('6')), // vrai
      true, // 20 ÷ 7 = 20/7
      eq(div(L('3'), L('4')), div(L('4'), L('3'))), // faux
      eq(div(L('9'), L('2')), L('4,5')), // vrai
    ];
    expect(PREP_ITEMS.map((it) => it.answer)).toEqual(truth);
    expect(new Set(PREP_ITEMS.map((it) => it.answer)).size).toBe(2);
    expect(PREP_ITEMS.every((it) => ['jam', 'kasr'].includes(it.skill))).toBe(true);
  });

  it('les nombres du labo sont ceux des préréglages de levels.js', () => {
    const pair = LEVELS['rewind-belt'];
    expect(pair.beginner.numbers.tasks).toEqual(LAB.beginner);
    expect(pair.advanced.numbers.tasks).toEqual(LAB.advanced);
  });

  it('le labo : chaque manquant recalculé, la rangée a UNE carte juste, jamais de manquant négatif ; la fraction 20/7 ; le piège « a − »', () => {
    const secrets = { b1: ['add', '9', '54', '45'], b2: ['sub', '14', '54', '68'], b3: ['mul', '6', '54', '9'], b4: ['rsub', '80', '54', '26'],
      a1: ['add', '17,5', '46,2', '28,7'], a2: ['rsub', '12,5', '4,8', '7,7'], a3: ['mul', '7', '20', null], m1: ['add', '18,6', '45,1', '26,5'], m2: ['mul', '13', '41,6', '3,2'] };
    for (const t of [...LAB.beginner, ...LAB.advanced, ...LAB.method]) {
      const [op, a, b, want] = secrets[t.id];
      expect([t.kind, t.a, t.out]).toEqual([op, a, b]);
      const x = hole(op, L(a), L(b));
      expect(x.n >= 0n, t.id).toBe(true);
      expect(eq(run(op, L(a), x), L(b)), t.id).toBe(true); // la contre-épreuve tient
      if (want) expect(eq(x, L(want)), t.id).toBe(true);
    }
    expect(eq(hole('mul', L('7'), L('20')), Q(20n, 7n))).toBe(true);
    expect(hole('mul', L('7'), L('20')).d).toBe(7n); // ne s'arrête pas : 7 n'a pas que les facteurs 2 et 5
    // le piège : la même sortie 54 avec « + 80 » ne se remonte pas par la somme
    expect(eq(hole('rsub', L('80'), L('54')), L('26'))).toBe(true);
    expect(eq(add(L('54'), L('80')), L('134'))).toBe(true); // ce que donnerait le mauvais réflexe
    expect(eq(run('rsub', L('80'), L('134')), L('-54'))).toBe(true); // et ce que la contre-épreuve dit
    // le même résultat 54 pour les trois machines du niveau مبتدئ (la structure de la leçon)
    expect(LAB.beginner.every((t) => t.out === '54')).toBe(true);
    // une carte juste exactement par rangée : l'inverse de la machine
    const inv = { add: 'sub', sub: 'add', mul: 'div', rsub: 'rsub' };
    for (const t of [...LAB.beginner, ...LAB.advanced, ...LAB.method]) {
      expect(t.rack, t.id).toContain(inv[t.kind]);
      expect(t.rack.length >= 3 && t.rack.length <= 5, t.id).toBe(true);
    }
  });

  it('exercices : chaque clé recalculée, chaque distracteur FAUX', () => {
    // ex-1 : quatre lignes ; les égalités ont les solutions annoncées
    const e1 = EX['ex-1'].question.rows;
    expect(key(e1[0])).toBe('$6\\times\\square=48$');
    expect(eq(hole('mul', L('6'), L('48')), L('8'))).toBe(true);
    expect(key(e1[1])).toBe('$48-\\square=6$');
    expect(eq(hole('rsub', L('48'), L('6')), L('42'))).toBe(true);
    expect(key(e1[2])).toBe('$\\square+6=48$');
    expect(eq(hole('add', L('6'), L('48')), L('42'))).toBe(true);
    expect(key(e1[3])).toBe('الثانية والثالثة'); // 42 = 42 ; la première donne 8
    // les distracteurs des lignes 1–3 sont des égalités de solution DIFFÉRENTE (ou d'une autre forme) de la situation : leur manquant n'est pas celui de la bonne égalité
    const sol = { '6\\times\\square=48': L('8'), '48-\\square=6': L('42'), '\\square+6=48': L('42'), '\\square-6=48': L('54') };
    const norm = (o) => o.replace(/\$/g, '');
    e1.slice(0, 3).forEach((r) => {
      const right = sol[norm(key(r))];
      r.options.slice(1).forEach((o) => { expect(sol[norm(o)], o).toBeDefined(); expect(eq(sol[norm(o)], right) && norm(o) !== norm(key(r)), `${r.label} : ${o} a la même solution`).toBe(false); });
    });
    // ex-2 : manquant de somme, de différence (trou en premier), a = c + □, puis avec parenthèse
    const e2 = EX['ex-2'].question.rows;
    const k2 = [hole('add', L('47'), L('215')), hole('sub', L('9'), L('62')), hole('add', L('8'), L('13,4')), add(L('4'), add(L('2'), L('5,35')))];
    k2.forEach((v, i) => { expect(eq(L(key(e2[i])), v), `ex-2 ${i}`).toBe(true); e2[i].options.slice(1).forEach((o) => expect(eq(L(o), v), o).toBe(false)); });
    expect(k2.map((v) => v.n * 100n / v.d)).toEqual([16800n, 7100n, 540n, 1135n]);
    // ex-3 : produits
    const e3 = EX['ex-3'].question.rows;
    const k3 = [hole('mul', L('10'), L('47')), hole('mul', L('4'), L('30')), hole('mul', L('3'), L('96')), hole('mul', L('4'), L('210'))];
    k3.forEach((v, i) => { expect(eq(L(key(e3[i])), v), `ex-3 ${i}`).toBe(true); e3[i].options.slice(1).forEach((o) => expect(eq(L(o), v), o).toBe(false)); });
    // ex-4 : □ − 24,7 = 51,36 ; □ × 9 = 40 (fraction) ; la contre-épreuve de la fraction
    const e4 = EX['ex-4'].question.rows;
    expect(eq(L(key(e4[0])), hole('sub', L('24,7'), L('51,36')))).toBe(true);
    expect(key(e4[0])).toBe('$76{,}06$');
    expect(eq(L(key(e4[1])), Q(40n, 9n))).toBe(true);
    expect(eq(mul(Q(40n, 9n), L('9')), L('40'))).toBe(true);
    e4[1].options.slice(1).forEach((o) => expect(eq(mul(L(o), L('9')), L('40')), `4,4 × 9 ≠ 40 : ${o}`).toBe(false));
    e4[0].options.slice(1).forEach((o) => expect(eq(L(o), hole('sub', L('24,7'), L('51,36'))), o).toBe(false));
    expect(eq(L(key(e4[2])), L('40'))).toBe(true);
    e4[2].options.slice(1).forEach((o) => expect(eq(L(o), L('40')), o).toBe(false));
    // ex-5 : 6,5 × □ = 91
    const e5 = EX['ex-5'].question.rows;
    expect(eq(L(key(e5[1])), hole('mul', L('6,5'), L('91')))).toBe(true);
    expect(key(e5[1])).toBe('$14$');
    e5[1].options.slice(1).forEach((o) => expect(eq(L(o), L('14')), o).toBe(false));
    expect(eq(mul(L('6,5'), L('14')), L(key(e5[2])))).toBe(true);
    e5[2].options.slice(1).forEach((o) => expect(eq(L(o), L('91')), o).toBe(false));
    // ex-6 : la substitution : seul le bon nombre tient
    const e6 = EX['ex-6'].question.rows;
    const t6 = [(x) => sub(x, L('7')), (x) => mul(L('4,5'), x), (x) => sub(L('120'), x)];
    const out6 = [L('25'), L('18'), L('45')];
    e6.forEach((r, i) => {
      expect(eq(t6[i](L(key(r))), out6[i]), `ex-6 ${i}`).toBe(true);
      r.options.slice(1).forEach((o) => expect(eq(t6[i](L(o)), out6[i]), `ex-6 ${i} ${o}`).toBe(false));
    });
    // ex-7 : le mur 46 / (24, 22) / (11, 13, 9)
    const wall = { b: [11n, 13n, 9n], s: [24n, 22n], top: 46n };
    expect(wall.b[0] + wall.b[1]).toBe(wall.s[0]);
    expect(wall.b[1] + wall.b[2]).toBe(wall.s[1]);
    expect(wall.s[0] + wall.s[1]).toBe(wall.top);
    const e7 = EX['ex-7'].question.rows;
    [22n, 13n, 11n].forEach((v, i) => { expect(eq(L(key(e7[i])), Q(v)), `ex-7 ${i}`).toBe(true); e7[i].options.slice(1).forEach((o) => expect(eq(L(o), Q(v)), o).toBe(false)); });
    expect(e7).toHaveLength(3);
    // les sources des exercices existent
    expect(EXERCISES.map((e) => e.source.elementId)).toEqual(['act-1', 'ex-15', 'ex-16', 'now-82', 'ex-17', 'method-1', 'deep-7']);
    expect(EXERCISES.every((e) => Object.values(LP).includes(e.learningPointId))).toBe(true);
  });

  it('إختبار أولي : cinq épreuves, chaque clé recalculée, chaque distracteur FAUX, le module contient chaque option et chaque énoncé', () => {
    expect(FINAL).toHaveLength(5);
    const [e1, e2, e3, e4, e5] = FINAL;
    // E1 : la bonne égalité a pour manquant 27 ; chaque distracteur a un autre manquant
    const sol1 = { '$\\square+8=35$': hole('add', L('8'), L('35')), '$\\square-8=35$': hole('sub', L('8'), L('35')), '$8\\times\\square=35$': hole('mul', L('8'), L('35')), '$8+35=\\square$': add(L('8'), L('35')) };
    expect(eq(sol1[e1.options[0]], Q(27n))).toBe(true);
    e1.options.slice(1).forEach((o) => expect(eq(sol1[o], Q(27n)), o).toBe(false));
    // E2–E4 : le manquant de a ⊕ □ = b
    [e2, e3, e4].forEach((E) => {
      const v = hole(E.form.op, L(E.form.a), L(E.form.b));
      expect(eq(L(E.options[E.correct]), v), E.id).toBe(true);
      E.options.forEach((o, i) => { if (i !== E.correct) expect(eq(L(o.replace(/\\frac\{8\}\{30\}/, '8/30').includes('/') ? '1' : o), v) && !o.includes('frac'), `${E.id} ${o}`).toBe(false); });
    });
    expect(eq(hole('add', L('67'), L('150')), L('83'))).toBe(true);
    expect(eq(hole('rsub', L('120'), L('45')), L('75'))).toBe(true);
    expect(eq(hole('mul', L('8'), L('30')), L('3,75'))).toBe(true);
    expect(eq(Q(8n, 30n), L('3,75'))).toBe(false); // le distracteur 8/30
    expect(e3.options.slice(1).some((o) => eq(L(o), L('75')))).toBe(false);
    // E5 : n + 2n + 3n = 102 — 17 est le seul des quatre
    const sums = e5.options.map((o) => { const n = L(o); return add(add(n, mul(n, Q(2n))), mul(n, Q(3n))); });
    expect(sums.map((s, i) => eq(s, Q(102n)) ? i : -1).filter((i) => i >= 0)).toEqual([0]);
    expect(eq(hole('mul', L('6'), L('102')), L('17'))).toBe(true);
    // le module 8 contient chaque énoncé et chaque option, LITTÉRAUX (l'audit les lit statiquement)
    FINAL.forEach((E) => {
      expect(moduleEight, E.id).toContain(E.stem.replace(/\\/g, '\\\\'));
      E.options.forEach((o) => expect(moduleEight, `${E.id} ${o}`).toContain(o.replace(/\\/g, '\\\\')));
      expect(E.correct).toBe(0);
    });
    expect(moduleEight).toContain("learningPointIds: ['1am_bahth-adad-naqisa_P3']");
    expect(FINAL.map((E) => E.lp)).toEqual([LP.P1, LP.P2, LP.P2, LP.P3, LP.P3]);
  });

  it('la طريقة : la solution écrite est juste ; les erreurs courantes sont fausses', () => {
    const x = hole('add', L('18,6'), L('45,1'));
    expect(eq(x, L('26,5'))).toBe(true);
    expect(eq(add(x, L('18,6')), L('45,1'))).toBe(true);
    expect(METHOD_FIND.solution.join(' ')).toContain('26{,}5');
    expect(METHOD_FIND.solution).toHaveLength(4);
    // « same » : 54 + 9 = 63 et la contre-épreuve donne 72
    expect(eq(add(L('54'), L('9')), L('63'))).toBe(true);
    expect(eq(add(L('63'), L('9')), L('72'))).toBe(true);
    expect(GUIDE.same.wrong).toContain('63');
    expect(GUIDE.same.why).toContain('72');
    // « divRev » : 54 × 6 = 324
    expect(eq(mul(L('54'), L('6')), L('324'))).toBe(true);
    // « approx » : 2,86 × 7 = 20,02
    expect(eq(mul(L('2,86'), L('7')), L('20,02'))).toBe(true);
    expect(GUIDE.approx.why).toContain('20{,}02');
    expect(KNOWLEDGE.history.text.length).toBeGreaterThan(40);
  });

  it('aucun texte visible ne renvoie au manuel ni ne nomme un mot de l\'ancien monde', () => {
    const texts = JSON.stringify({ KNOWLEDGE, METHOD_FIND, GUIDE, EX, FINAL });
    expect(texts).not.toMatch(/الكتاب ص|اقرأ ما يقوله الكتاب|تمارين من الكتاب|صفحة \d/);
  });
});
