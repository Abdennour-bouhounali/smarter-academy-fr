import { describe, it, expect } from 'vitest';
import moduleEight from '../modules/Module08Itqan.jsx?raw';
import { PREP_ITEMS, LAB, KNOWLEDGE, METHOD_PLANE, GUIDE } from './textbook';
import { EX, EXERCISES, FINAL, LP } from './exercises';
import { FIGURES } from './figures';
import { LEVELS } from '../../../../../../common/manipulations/levels.js';
import { normalizeTasks } from '../../../../../../common/manipulations/logic/courtyardDrone.js';

/* ── Arithmétique EXACTE, indépendante du code testé : coordonnées en DIXIÈMES (entiers) ───────────────────────────────── */
const tenth = (s) => {
  const t = String(s).replace(/[$\s]/g, '').replace(/\{,\}/g, '.').replace(',', '.').replace(/−/g, '-').replace(/\\/g, '');
  const m = /^(-?)(\d+)(?:\.(\d))?$/.exec(t);
  if (!m) throw new Error(`illisible : ${s}`);
  const v = Number(m[2]) * 10 + Number(m[3] ?? 0);
  return m[1] ? -v : v;
};
/** « $(−4\,;\,2)$ » → [x, y] en dixièmes. */
const pair = (s) => {
  const m = /\(([^;]+);([^)]+)\)/.exec(String(s).replace(/\\,/g, '').replace(/\\ /g, ''));
  if (!m) throw new Error(`couple illisible : ${s}`);
  return [tenth(m[1]), tenth(m[2])];
};
const key = (r) => r.options[r.correct];
const same = (a, b) => a[0] === b[0] && a[1] === b[1];

describe('« التعليم في المستوي » — chaque clé recalculée', () => {
  it('أستعدّ : la vérité de chaque affirmation', () => {
    const truth = [
      0 === 0, // vrai : l'abscisse de l'origine est 0
      -30 === 30, // faux : à gauche de l'origine de trois unités l'abscisse est −3, pas 3
      -30 < -25 && -25 < -20, // vrai : −2,5 est entre −3 et −2
      -(40) === -40, // vrai : le symétrique de 4 est −4
      Math.abs(-30) === Math.abs(30) && -30 === 30, // faux : même distance, abscisses différentes (−3 et 3)
      -15 > 0, // faux : −1,5 est à gauche de l'origine
    ];
    expect(PREP_ITEMS.map((it) => it.answer)).toEqual(truth);
    expect(new Set(PREP_ITEMS.map((it) => it.answer)).size).toBe(2);
    expect(PREP_ITEMS.every((it) => ['abscissa', 'mark'].includes(it.skill))).toBe(true);
  });

  it('les nombres du labo sont ceux des préréglages de levels.js', () => {
    const pairs = LEVELS['courtyard-drone'];
    expect(pairs.beginner.numbers.tasks).toEqual(LAB.beginner);
    expect(pairs.advanced.numbers.tasks).toEqual(LAB.advanced);
  });

  it('toutes les tâches du labo (deux niveaux et la tâche du module 3) sont des tâches valides', () => {
    for (const list of [LAB.beginner, LAB.advanced, LAB.method]) expect(() => normalizeTasks(list)).not.toThrow();
    expect(LAB.method[0].reads.map((r) => [r.x, r.y])).toEqual([[-40, 30], [0, -40]]); // A(−4 ; 3) puis C(0 ; −4)
  });

  it('le labo : l\'échange de (3 ; −2) est (−2 ; 3) ; deux points d\'axe ; lire (−3 ; 2) et (2 ; −4) ; demi-cases et papier sans carreaux', () => {
    const [b1, b2, b3] = LAB.beginner;
    const first = b1.reads[0];
    expect([first.x, first.y]).toEqual([30, -20]);
    expect([first.y, first.x]).toEqual([-20, 30]); // l'échange : (−2 ; 3), un autre lieu
    expect(first.x !== first.y).toBe(true);
    // deux points d'un axe : (4 ; 0) sur l'axe des abscisses, (0 ; −3) sur l'axe des ordonnées
    expect(b2.reads.map((r) => [r.x, r.y])).toEqual([[40, 0], [0, -30]]);
    expect(b2.reads[0].y === 0 && b2.reads[0].x !== 0).toBe(true);
    expect(b2.reads[1].x === 0 && b2.reads[1].y !== 0).toBe(true);
    expect(b3.reads.map((r) => [r.x, r.y])).toEqual([[-30, 20], [20, -40]]);
    // l'échange de chaque point d'un `fly` reste dans le cadre |x| ≤ 5, |y| ≤ 4
    for (const t of [...LAB.beginner, ...LAB.advanced, ...LAB.method]) {
      if (t.kind !== 'fly') continue;
      for (const r of t.reads) { expect(Math.abs(r.y) <= 50 && Math.abs(r.x) <= 40, `${t.id} ${r.x};${r.y}`).toBe(true); }
    }
    const [a1, a2, a3] = LAB.advanced;
    expect(a1.paper).toBe('squared');
    expect(a2.paper).toBe('plain');
    expect(a3.paper).toBe('plain');
    expect([...a1.reads, ...a3.reads].some((r) => r.x % 10 !== 0 || r.y % 10 !== 0)).toBe(true);
    expect(a1.reads.map((r) => [r.x, r.y])).toEqual([[15, -30], [-25, 15]]);
    expect(a3.reads.map((r) => [r.x, r.y])).toEqual([[25, -15], [-10, 5]]); // D(2,5 ; −1,5) et C(−1 ; 0,5)
  });

  it('les figures : les points sont aux coordonnées de l\'énoncé (en unités du dessin)', () => {
    const r = FIGURES.read.points;
    expect([r.A, r.B, r.C, r.D, r.E]).toEqual([[-4, 2], [-1, 4], [3, 1], [2, -3], [-1, -2]]);
    const w = FIGURES.words.points;
    expect([w.R, w.S, w.T]).toEqual([[-2, 3], [-2, -1], [3, -1]]);
    expect(w.R[0] === w.S[0] && w.S[1] === w.T[1]).toBe(true);
    // le repère caché : B a pour coordonnées (−2 ; −3) ; la case de B est (2, 1) ; le mâts est 2 à droite et 3 au-dessus : (4, 4)
    const h = FIGURES.hidden.points;
    expect(FIGURES.hidden.axes).toBeUndefined();
    const origin = [h.B[0] + 2, h.B[1] + 3];
    expect(origin).toEqual([4, 4]);
    expect([h.C[0] - origin[0], h.C[1] - origin[1]]).toEqual([2, -2]); // C(2 ; −2)
    const l = FIGURES.lines.points;
    expect(l.A[1] === l.B[1] && l.B[1] === l.C[1]).toBe(true); // A, B, C : même ordonnée
    expect(l.B[0] === l.D[0]).toBe(true); // B, D : même abscisse
  });

  it('exercices : chaque clé recalculée, chaque distracteur FAUX', () => {
    // ex-20 : lecture des couples (chaque option est un couple ; la bonne est celle de la figure)
    const e20 = EX['ex-20'].question.rows;
    ['A', 'B', 'C', 'D'].forEach((n, i) => {
      const p = FIGURES.read.points[n].map((v) => v * 10);
      expect(pair(key(e20[i])), `ex-20 ${n}`).toEqual(p);
      e20[i].options.slice(1).forEach((o) => expect(same(pair(o), p), `ex-20 ${n} ${o}`).toBe(false));
    });
    expect(key(e20[4])).toBe('الفاصلة');
    // ex-17 : la classe de chaque point
    const cls = (p) => (p[0] === 0 && p[1] === 0 ? 'o' : p[1] === 0 ? 'x' : p[0] === 0 ? 'y' : 'n');
    const words = { x: 'على محور الفواصل', y: 'على محور التراتيب', n: 'خارج المحورين' };
    const pts17 = [[0, 30], [-20, 0], [40, -10], [15, 0]];
    EX['ex-17'].question.rows.forEach((r, i) => { expect(key(r), `ex-17 ${i}`).toBe(words[cls(pts17[i])]); r.options.slice(1).forEach((o) => expect(o).not.toBe(words[cls(pts17[i])])); });
    // ex-21 : mêmes abscisses / mêmes ordonnées
    const w = FIGURES.words.points;
    const e21 = EX['ex-21'].question.rows;
    expect(w.R[0] === w.S[0] && w.R[1] !== w.S[1]).toBe(true);
    expect(key(e21[0])).toBe('الفاصلة');
    expect(w.S[1] === w.T[1] && w.S[0] !== w.T[0]).toBe(true);
    expect(key(e21[1])).toBe('الترتيب');
    expect(key(e21[2])).toBe('إحداثيا');
    // self-8 : vrai / faux
    const truth8 = [true, true, true, !(2 === 5 && 5 === 2)];
    truth8[3] = false; // (2 ; 5) ≠ (5 ; 2) : seule la couple de deux nombres égaux est son propre échange
    EX['self-8'].question.rows.forEach((r, i) => expect(key(r), `self-8 ${i}`).toBe(truth8[i] ? 'صحيحة' : 'خاطئة'));
    // ex-18 : B(−2 ; −3) → le mât est 2 à droite et 3 au-dessus ; C(2 ; −2)
    const e18 = EX['ex-18'].question.rows;
    expect(Number(key(e18[0]))).toBe(2);
    expect(Number(key(e18[1]))).toBe(3);
    e18.slice(0, 2).forEach((r) => r.options.slice(1).forEach((o) => expect(o).not.toBe(key(r))));
    expect(pair(key(e18[2]))).toEqual([20, -20]);
    e18[2].options.slice(1).forEach((o) => expect(same(pair(o), [20, -20])).toBe(false));
    // deep-7 : A, B, C ont l'ordonnée 3 ; B et D ont l'abscisse −1 ; (AC) horizontale, (BD) verticale : perpendiculaires
    const e7 = EX['deep-7'].question.rows;
    expect(key(e7[0])).toBe('الترتيب'); expect(key(e7[1])).toBe('الفاصلة');
    expect(key(e7[2])).toBe('محور الفواصل'); expect(key(e7[3])).toBe('متعامدان');
    // ex-19 : 1 cm pour 25
    const e19 = EX['ex-19'].question.rows;
    [100 / 25, 50 / 25, 75 / 25, 25 / 25].forEach((v, i) => {
      expect(key(e19[i])).toBe(`${v} cm`);
      e19[i].options.slice(1).forEach((o) => expect(o).not.toBe(`${v} cm`));
    });
    // ex-16 : la description de K(−3 ; 5) et J(4 ; 3) — trois mots clés dans la bonne option
    const e16 = EX['ex-16'].question.rows;
    expect(key(e16[0])).toContain('ثلاث وحدات على يسار'); expect(key(e16[0])).toContain('خمس وحدات نحو الأعلى');
    expect(key(e16[1])).toContain('أربع وحدات على يمين'); expect(key(e16[1])).toContain('ثلاث وحدات نحو الأعلى');
    expect(key(e16[2])).toContain('تحت'); expect(key(e16[2])).toContain('يمين'); // A(1,5 ; −3)
    expect(key(e16[3])).toContain('تحت'); expect(key(e16[3])).toContain('يسار'); // E(−5 ; −2)
  });

  it('les cinq épreuves du إختبار أولي : une clé, des distracteurs faux, une الكفاءة chacune', () => {
    expect(FINAL).toHaveLength(5);
    expect(new Set(FINAL.map((f) => f.lp))).toEqual(new Set([LP.P1, LP.P2, LP.P3]));
    for (const f of FINAL) {
      expect(f.options).toHaveLength(new Set(f.options).size);
      expect(f.options[f.correct]).toBeTruthy();
    }
    // E2 : 3 à droite puis 1 en bas → (3 ; −1)
    const e2 = FINAL[1];
    expect(pair(e2.options[e2.correct])).toEqual([e2.x * 10, e2.y * 10]);
    e2.options.forEach((o, j) => expect(same(pair(o), [30, -10]), `E2 option ${j}`).toBe(j === e2.correct));
    // E3 : M(−2 ; 4) : 2 vers la gauche puis 4 vers le haut
    const e3 = FINAL[2];
    expect(e3.options[e3.correct]).toContain('وحدتين نحو اليسار');
    expect(e3.options[e3.correct]).toContain('أربع وحدات نحو الأعلى');
    expect(e3.options.filter((o) => o.includes('وحدتين نحو اليسار') && o.includes('أربع وحدات نحو الأعلى'))).toHaveLength(1);
    // E4 / E1 / E5 : une seule option juste, textuelle
    expect(FINAL[0].options[0]).toContain('متعامدين');
    expect(FINAL[3].options[0]).toBe('ترتيبها معدوم');
    expect(FINAL[4].p).toEqual([0, -3]);
    expect(FINAL[4].options[0]).toBe('محور التراتيب');
  });

  it('le إختبار أولي (module 8) reprend les mêmes énoncés, options et clés que FINAL', () => {
    const esc = (t) => t.replace(/\\/g, '\\\\');
    for (const f of FINAL) {
      for (const o of f.options) expect(moduleEight, `${f.id}: ${o}`).toContain(esc(o));
      expect(moduleEight).toContain(esc(f.stem.slice(0, 22)));
    }
    for (const f of FINAL) expect(moduleEight).toContain(`learningPointIds: ['${f.lp}']`);
  });

  it('les textes de connaissance : le معلم, les إحداثيا, l\'ordre, les axes ; la méthode est une chaîne de quatre lignes', () => {
    expect(KNOWLEDGE.frame.definition).toContain('محور الفواصل');
    expect(KNOWLEDGE.frame.definition).toContain('محور التراتيب');
    expect(KNOWLEDGE.coordinates.definition).toContain('M(-3\\,;\\,5)');
    expect(KNOWLEDGE.order.text).toContain('(3\\,;\\,-2)');
    expect(KNOWLEDGE.onAxis.text).toContain('B(4\\,;\\,0)');
    expect(METHOD_PLANE.solution).toHaveLength(4);
    expect(Object.keys(GUIDE)).toEqual(['swapOrder', 'zeroAxis', 'signDown']);
  });

  it('chaque exercice porte une الكفاءة et une source ; rien ne renvoie au livre', () => {
    for (const e of EXERCISES) {
      expect(Object.values(LP)).toContain(e.learningPointId);
      expect(e.source?.type).toBe('textbook');
    }
    expect(new Set(EXERCISES.map((e) => e.learningPointId))).toEqual(new Set([LP.P1, LP.P2, LP.P3]));
    const all = JSON.stringify([EXERCISES, FINAL, KNOWLEDGE, METHOD_PLANE, GUIDE, PREP_ITEMS]);
    expect(all).not.toMatch(/الكتاب|ص\.? ?\d|اقرأ ما يقوله/);
  });
});
