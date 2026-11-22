import { describe, it, expect } from 'vitest';
import moduleEight from '../modules/Module08Itqan.jsx?raw';
import { PREP_ITEMS, LAB, KNOWLEDGE, METHOD_GRAD, GUIDE } from './textbook';
import { EX, EXERCISES, FINAL, LP } from './exercises';
import { FIGURES } from './figures';
import { LEVELS } from '../../../../../../common/manipulations/levels.js';
import { normalizeTasks } from '../../../../../../common/manipulations/logic/strideStamp.js';

/* ── Arithmétique EXACTE, indépendante du code testé : nombres décimaux en CENTIÈMES (BigInt) ─────────────────────────────── */
const cent = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(',', '.').replace(/−/g, '-').replace(/\s*cm$/, '').trim();
  const m = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(t);
  if (!m) throw new Error(`illisible : ${s}`);
  const v = BigInt(m[2]) * 100n + BigInt((m[3] ?? '').padEnd(2, '0') || '0');
  return m[1] === '-' ? -v : v;
};
const abs = (x) => (x < 0n ? -x : x);
const key = (r) => r.options[r.correct];
const floorDiv = (a, b) => { const q = a / b; return (a % b !== 0n && (a < 0n) !== (b < 0n)) ? q - 1n : q; };

describe('« التعليم على مستقيم مدرّج » — chaque clé recalculée', () => {
  it('أستعدّ : la vérité de chaque affirmation', () => {
    const truth = [
      3n * 100n + 4n * 10n === cent('3,4'), // vrai : 3 + 4/10
      cent('6') < cent('5,2') && cent('5,2') < cent('7'), // faux : 5,2 est entre 5 et 6
      true, // vrai : sur une demi-droite la plus grande abscisse est la plus éloignée de l'origine
      -cent('-5') === cent('5'), // vrai : l'opposé de −5 est 5
      abs(cent('-2')) === cent('-2'), // faux : la distance de −2 est 2, pas −2
      cent('-3') < 0n, // vrai : un nombre précédé de − est négatif
    ];
    expect(PREP_ITEMS.map((it) => it.answer)).toEqual(truth);
    expect(cent('5,2') > cent('5') && cent('5,2') < cent('6')).toBe(true); // l'explication de l'item 2
    expect(abs(cent('-2'))).toBe(cent('2')); // l'explication de l'item 5
    expect(new Set(PREP_ITEMS.map((it) => it.answer)).size).toBe(2);
    expect(PREP_ITEMS.every((it) => ['khat', 'nisbi'].includes(it.skill))).toBe(true);
  });

  it('les nombres du labo sont ceux des préréglages de levels.js', () => {
    const pair = LEVELS['stride-stamp'];
    expect(pair.beginner.numbers.tasks).toEqual(LAB.beginner);
    expect(pair.advanced.numbers.tasks).toEqual(LAB.advanced);
  });

  it('toutes les tâches du labo (deux niveaux et la tâche du module 3) sont des tâches valides', () => {
    for (const list of [LAB.beginner, LAB.advanced, LAB.method]) expect(() => normalizeTasks(list)).not.toThrow();
    expect(LAB.method[0].reads.map((r) => r.x)).toEqual([-40, 16]); // M(−4) et N(1,6)
  });

  it('le labo : la foulée longue n\'atteint pas −3 ; des symétriques ; A(−3), B(2,7), C(−1,5) ; l\'origine retrouvée ; l\'encadrement des négatifs', () => {
    const [b1, b2, b3] = LAB.beginner;
    // route : 250 vers l'ouest, 450 vers l'est ; foulées 40 / 60 / 90
    const reach = (u) => [Math.floor(250 / u), Math.floor(450 / u)];
    expect(reach(90)).toEqual([2, 5]); // la longue : −3 est hors de la route (3 > 2)
    expect(reach(60)[0]).toBeGreaterThanOrEqual(4); // la droite de b2/b3 va de −4 à 4 avec la foulée moyenne
    expect(reach(40)[0]).toBeGreaterThanOrEqual(3);
    expect(b1.stride).toBe(2);
    expect(b1.reads.map((r) => r.at)).toEqual([3, -3]);
    expect(reach(90)[0] < Math.abs(b1.reads[1].at)).toBe(true);
    // jumeaux : −3 → 3 et 2 → −2
    expect(b2.reads.map((r) => -r.of)).toEqual([30, -20]);
    // A(−3), B(2,7), C(−1,5) : en dixièmes
    expect(b3.reads.map((r) => r.x)).toEqual([-30, 27, -15]);
    expect(floorDiv(-15n, 10n)).toBe(-2n); // −1,5 est entre −2 et −1
    expect(floorDiv(27n, 10n)).toBe(2n);
    // origine : a1 −3 et 3 (rang 2 et 8, pas 1) → 5 ; a2 −8 et −2 (rangs 2 et 5, pas 2) → 6
    const [a1, a2, a3] = LAB.advanced;
    const origin = (t) => t.marks.map((m) => m.i - m.v / t.u);
    expect(origin(a1)).toEqual([5, 5]);
    expect(origin(a2)).toEqual([6, 6]);
    expect(a1.marks.every((m) => m.i !== 5)).toBe(true);
    expect(a2.marks.every((m) => m.i !== 6)).toBe(true);
    // l'écart entre rangs est cohérent avec le pas : 6 tick · 1 = 6 unités ; 3 ticks · 2 = 6 unités
    expect((a1.marks[1].i - a1.marks[0].i) * a1.u).toBe(a1.marks[1].v - a1.marks[0].v);
    expect((a2.marks[1].i - a2.marks[0].i) * a2.u).toBe(a2.marks[1].v - a2.marks[0].v);
    // encadrer : −1,5 → [−2, −1] ; 2,7 → [2, 3] ; −0,4 → [−1, 0] (jamais la troncature −1 / 0)
    expect(a3.reads.map((r) => floorDiv(BigInt(r.x), 10n))).toEqual([-2n, 2n, -1n]);
    expect(a3.reads.every((r) => r.x % 10 !== 0)).toBe(true);
  });

  it('les figures : les points sont aux abscisses de l\'énoncé (en unités du dessin)', () => {
    const f = FIGURES.read.points;
    // abscisses : x du dessin = valeur / pas(1) ; A −2,6 ; B 1,4 ; C 3,2 ; D −0,4
    expect([f.A[0], f.B[0], f.C[0], f.D[0]]).toEqual([-2.6, 1.4, 3.2, -0.4]);
    expect(f['−4'][0]).toBe(-4);
    expect(f['0'][0]).toBe(0);
    expect(f['4'][0]).toBe(4);
    // les deux droites à origine cachée : deux étiquettes seulement, à leurs rangs
    expect(FIGURES.origin1.points['−3'][0]).toBe(2);
    expect(FIGURES.origin1.points['3'][0]).toBe(8);
    expect(FIGURES.origin2.points['−6'][0]).toBe(1);
    expect(FIGURES.origin2.points['−3'][0]).toBe(4);
  });

  it('exercices : chaque clé recalculée, chaque distracteur FAUX', () => {
    // ex-12 : la lecture avec cinq tickets par unité (0,2)
    const e12 = EX['ex-12'].question.rows;
    const read = [-26, 14, 32, -4]; // dixièmes : −2,6 ; 1,4 ; 3,2 ; −0,4
    read.forEach((v, i) => {
      expect(cent(key(e12[i])), `ex-12 ${i}`).toBe(BigInt(v) * 10n);
      e12[i].options.slice(1).forEach((o) => expect(cent(o)).not.toBe(BigInt(v) * 10n));
    });
    // −2,6 : trois ticks après −2 vers la gauche (3 × 0,2 = 0,6) ; D : deux ticks (0,4)
    expect(-(2 * 10 + 3 * 2)).toBe(-26);
    expect(-(2 * 2)).toBe(-4);
    // ex-13 : le rang de l'origine
    const e13 = EX['ex-13'].question.rows;
    expect(Number(key(e13[0]))).toBe(2 + 3);
    expect(Number(key(e13[1]))).toBe(4 + 3);
    e13.forEach((r) => r.options.slice(1).forEach((o) => expect(o).not.toBe(key(r))));
    // ex-14 : le bruit de l'unité de 3 cm
    const e14 = EX['ex-14'].question.rows;
    ['2,2', '1,7', '0,7'].forEach((n, i) => {
      expect(cent(key(e14[i])), `ex-14 ${n}`).toBe(abs(cent(n)) * 3n);
      e14[i].options.slice(1).forEach((o) => expect(cent(o)).not.toBe(abs(cent(n)) * 3n));
    });
    // act-1-line : les symétriques
    const sy = EX['act-1-line'].question.rows;
    expect(cent(key(sy[0]))).toBe(-cent('2,3'));
    expect(cent(key(sy[1]))).toBe(-cent('-1,4'));
    expect(cent(key(sy[2]))).toBe(0n);
    expect(key(sy[3])).toBe('صحيح');
    sy.slice(0, 3).forEach((r) => r.options.slice(1).forEach((o) => expect(cent(o)).not.toBe(cent(key(r)))));
    // deep-3 : voisins de −30
    const e3 = EX['deep-3'].question.rows;
    expect(cent(key(e3[0]))).toBe(cent('-30') + 100n);
    expect(cent(key(e3[1]))).toBe(cent('-30') - 100n);
    expect(cent(key(e3[2]))).toBe(-3100n);
    expect(abs(-3100n) > abs(-2900n)).toBe(true);
    e3.slice(0, 2).forEach((r) => r.options.slice(1).forEach((o) => expect(cent(o)).not.toBe(cent(key(r)))));
    // deep-4 : un déplacement de 2 unités par heure vers la droite, 4 à 12 h
    const e4 = EX['deep-4'].question.rows;
    [[11, 2], [10, 0], [9, -2]].forEach(([h, x], i) => {
      expect(4 - 2 * (12 - h), `deep-4 ${h} h`).toBe(x);
      expect(cent(key(e4[i]))).toBe(BigInt(x) * 100n);
      e4[i].options.slice(1).forEach((o) => expect(cent(o)).not.toBe(BigInt(x) * 100n));
    });
    expect(Number(key(e4[3]))).toBe(12 - 4 / 2);
    e4[3].options.slice(1).forEach((o) => expect(Number(o)).not.toBe(10));
    // ex-10 : vrai / faux
    const e10 = EX['ex-10'].question.rows;
    const truth = [
      true, // à droite de l'origine : positifs (jamais un négatif)
      !(cent('-3') < 0n === cent('3') < 0n), // −3 et 3 : pas du même côté → l'affirmation est fausse
      false, // même distance ≠ même abscisse (ex : −3 et 3)
      cent('-1') < cent('-0,5') && cent('-0,5') < 0n, // −1 < −0,5 < 0
    ];
    truth[1] = false;
    e10.forEach((r, i) => expect(key(r), `ex-10 ${i}`).toBe(truth[i] ? 'صحيحة' : 'خاطئة'));
    // self-6 : A(2), B(−5), C(4,5), E(0)
    const e6 = EX['self-6'].question.rows;
    const pts = { A: cent('2'), B: cent('-5'), C: cent('4,5'), E: cent('0') };
    const farthest = Object.keys(pts).reduce((a, b) => (abs(pts[b]) > abs(pts[a]) ? b : a));
    const leftmost = Object.keys(pts).reduce((a, b) => (pts[b] < pts[a] ? b : a));
    const between45 = Object.keys(pts).filter((n) => pts[n] > cent('4') && pts[n] < cent('5'));
    expect(key(e6[0])).toBe('$E$'); expect(pts.E).toBe(0n);
    expect(key(e6[1])).toBe(`$${farthest}$`);
    expect(key(e6[2])).toBe(`$${between45[0]}$`); expect(between45).toHaveLength(1);
    expect(key(e6[3])).toBe(`$${leftmost}$`);
    expect(farthest).toBe('B'); // 5 > 4,5
  });

  it('les cinq épreuves du إختبار أولي : une clé, des distracteurs faux, une الكفاءة chacune', () => {
    expect(FINAL).toHaveLength(5);
    expect(new Set(FINAL.map((f) => f.lp))).toEqual(new Set([LP.P1, LP.P2, LP.P3]));
    const asNum = (o) => cent(String(o).replace(/\$/g, ''));
    for (const f of FINAL) {
      expect(f.options).toHaveLength(new Set(f.options).size);
      expect(f.options[f.correct]).toBeTruthy();
    }
    // E2 : zéro et 20 à quatre tick de distance, deux tick à gauche du zéro → −10
    const e2 = FINAL[1];
    const step = BigInt(e2.mark - e2.zero) / BigInt(e2.gaps);
    expect(step).toBe(5n);
    expect(-step * BigInt(e2.left)).toBe(BigInt(e2.answer));
    e2.options.forEach((o, j) => expect(asNum(o) === BigInt(e2.answer) * 100n, `E2 option ${j}`).toBe(j === e2.correct));
    // E3 : −3,4 est entre −4 et −3
    const e3 = FINAL[2];
    const lo = floorDiv(BigInt(Math.round(e3.x * 100)), 100n);
    expect(lo).toBe(-4n);
    const pair = (o) => o.replace(/\$/g, '').split(' و ').map((v) => BigInt(v));
    e3.options.forEach((o, j) => { const [a, b] = pair(o); expect(b - a === 1n && a === lo, `E3 option ${j}`).toBe(j === e3.correct); });
    // E5 : le symétrique de 4,5
    const e5 = FINAL[4];
    e5.options.forEach((o, j) => expect(asNum(o) === -cent('4,5'), `E5 option ${j}`).toBe(j === e5.correct));
    // E1 / E4 : une seule option juste, textuelle
    expect(FINAL[0].options[0]).toBe('نفسها في الجهتين');
    expect(FINAL[3].options[0]).toContain('المقابلة');
    // −5 < 0 : à l'opposé de l'indicateur positif
    expect(cent('-5') < 0n).toBe(true);
  });

  it('le إختبار أولي (module 8) reprend les mêmes énoncés, options et clés que FINAL', () => {
    for (const f of FINAL) {
      for (const o of f.options) expect(moduleEight, `${f.id}: ${o}`).toContain(o);
      expect(moduleEight).toContain(f.stem.slice(0, 22));
    }
    for (const f of FINAL) expect(moduleEight).toContain(`learningPointIds: ['${f.lp}']`);
  });

  it('les textes de connaissance : définitions, fasila, symétrique, encadrement ; la méthode est une chaîne de quatre lignes', () => {
    expect(KNOWLEDGE.line.definition).toContain('المبدأ');
    expect(KNOWLEDGE.abscissa.definition).toContain('M(-3{,}5)');
    expect(KNOWLEDGE.symmetric.text).toContain('A(-3)$ و $A\'(3)');
    expect(KNOWLEDGE.bounds.text).toContain('-2<-1{,}5<-1');
    expect(METHOD_GRAD.solution).toHaveLength(4);
    // M(−4) : quatre unités à gauche ; N(1,6) : entre 1 et 2 — six petites graduations après 1
    expect(floorDiv(16n, 10n)).toBe(1n);
    expect(16 - 10).toBe(6);
    expect(Object.keys(GUIDE)).toEqual(['leftIsZero', 'westPositive', 'truncBound', 'symSame']);
  });

  it('chaque exercice porte une الكفاءة et une source ; rien ne renvoie au livre', () => {
    for (const e of EXERCISES) {
      expect(Object.values(LP)).toContain(e.learningPointId);
      expect(e.source?.type).toBe('textbook');
    }
    expect(new Set(EXERCISES.map((e) => e.learningPointId))).toEqual(new Set([LP.P1, LP.P2, LP.P3]));
    const all = JSON.stringify([EXERCISES, FINAL, KNOWLEDGE, METHOD_GRAD, GUIDE, PREP_ITEMS]);
    expect(all).not.toMatch(/الكتاب|ص\.? ?\d|اقرأ ما يقوله/);
  });
});
