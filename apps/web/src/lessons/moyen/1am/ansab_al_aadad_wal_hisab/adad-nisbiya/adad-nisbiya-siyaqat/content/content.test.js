import { describe, it, expect } from 'vitest';
import moduleEight from '../modules/Module08Itqan.jsx?raw';
import { PREP_ITEMS, LAB, KNOWLEDGE, METHOD_READ, GUIDE } from './textbook';
import { EX, EXERCISES, FINAL, LP } from './exercises';
import { LEVELS } from '../../../../../../common/manipulations/levels.js';

/* ── Arithmétique EXACTE, indépendante du code testé : nombres relatifs décimaux en CENTIÈMES (BigInt) ─────────────────────────────── */
const cent = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(',', '.').replace(/−/g, '-').trim();
  const m = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(t);
  if (!m) throw new Error(`illisible : ${s}`);
  const v = BigInt(m[2]) * 100n + BigInt((m[3] ?? '').padEnd(2, '0') || '0');
  return m[1] === '-' ? -v : v;
};
const abs = (x) => (x < 0n ? -x : x);
const key = (r) => r.options[r.correct];

describe('« الأعداد النسبية وسياقات استعمالها » — chaque clé recalculée', () => {
  it('أستعدّ : la vérité de chaque affirmation', () => {
    const truth = [
      cent('4,7') > cent('4,07'), // vrai : 4,70 > 4,07
      cent('3,2') < cent('3,18'), // faux : 3,20 > 3,18
      2n * 100n + 3n * 10n === cent('2,3'), // vrai : 2 + 3/10
      3n * 100n + 2n * 10n === cent('2,3'), // faux : 3 + 2/10 = 3,2
      false, // faux : la plus grande abscisse est la plus éloignée de l'origine
      cent('6') < cent('6,5') && cent('6,5') < cent('7'), // vrai
    ];
    expect(PREP_ITEMS.map((it) => it.answer)).toEqual(truth);
    expect(new Set(PREP_ITEMS.map((it) => it.answer)).size).toBe(2);
    expect(PREP_ITEMS.every((it) => ['muqarana', 'khat'].includes(it.skill))).toBe(true);
  });

  it('les nombres du labo sont ceux des préréglages de levels.js', () => {
    const pair = LEVELS['frost-gauge'];
    expect(pair.beginner.numbers.tasks).toEqual(LAB.beginner);
    expect(pair.advanced.numbers.tasks).toEqual(LAB.advanced);
  });

  it('le labo : le plus froid n\'est pas le plus grand nombre ; deux opposés ; un zéro ; la distance de la paire', () => {
    const [b1, b2, b3] = LAB.beginner;
    expect(Math.min(...b1.reads)).toBe(-3);
    expect(b1.reads.indexOf(Math.max(...b1.reads))).toBe(0); // 5 : le plus grand, le plus chaud
    expect(b1.reads.indexOf(Math.min(...b1.reads))).toBe(2); // le mardi
    expect(b1.reads).toContain(0);
    expect(b1.reads.includes(2) && b1.reads.includes(-2)).toBe(true); // lundi −2 / jeudi 2 : opposés (masala-1)
    expect(b2.step).toBe(10);
    expect(b2.reads).toEqual([-40, 30, 0]);
    expect(b3.reads[0]).toEqual({ self: -4 });
    for (const t of [...LAB.beginner, ...LAB.advanced, ...LAB.method]) {
      expect(t.min % t.step === 0 && t.max % t.step === 0, t.id).toBe(true);
      for (const r of t.reads) {
        const v = typeof r === 'number' ? r : r.self ?? r.mirror ?? r.dist;
        expect(Math.abs(v % t.step), `${t.id} ${JSON.stringify(r)}`).toBe(0);
        const inside = (x) => x >= t.min && x <= t.max;
        expect(typeof r === 'object' && r.dist != null ? Math.abs(v) <= Math.min(t.max, -t.min) : inside(v) && (r.mirror == null || inside(-v)), `${t.id} ${JSON.stringify(r)}`).toBe(true);
      }
    }
    const a1 = LAB.advanced[0];
    expect(a1.reads).toEqual([{ dist: 6 }, { dist: 6 }]);
    expect(Math.abs(6 % a1.step)).toBe(0);
  });

  it('exercices : chaque clé recalculée, chaque distracteur FAUX', () => {
    const side = (v) => (v > 0n ? 'فوق الصفر' : v < 0n ? 'تحت الصفر' : 'على الصفر');
    // ex-1 : la jauge d'une station
    const e1 = EX['ex-1'].question.rows;
    [-5, 6, 0, -8].forEach((v, i) => expect(key(e1[i]), `ex-1 ${v}`).toBe(side(BigInt(v))));
    expect(cent(key(e1[4]))).toBe(-800n);
    expect(-8 < -5 && -5 < 0 && 0 < 6).toBe(true);
    e1[4].options.slice(1).forEach((o) => expect(cent(o)).not.toBe(-800n));
    // ex-2 : 6 étages au-dessus, rez-de-chaussée, 2 sous le sol : 9 touches
    const e2 = EX['ex-2'].question.rows;
    expect(cent(key(e2[0]))).toBe(0n);
    expect(cent(key(e2[1]))).toBe(-100n);
    expect(cent(key(e2[2]))).toBe(-200n);
    expect(cent(key(e2[3]))).toBe(600n);
    expect(cent(key(e2[4]))).toBe(BigInt((6 + 1 + 2) * 100));
    // ex-3 / ex-4 : dates avant l'ère négatives, après positives ; l'âge est une différence positive
    const e3 = EX['ex-3'].question.rows;
    expect([-287n, -238n, 780n].map((v) => v * 100n)).toEqual([cent(key(e3[0])), cent(key(e3[1])), cent(key(e3[2]))]);
    expect(-287 < -238 && -238 < 780 && 780 < 965).toBe(true); // l'ordre : le plus ancien est le plus petit
    expect(key(e3[3])).toBe('أرخميدس');
    const e4 = EX['self-4'].question.rows;
    expect(cent(key(e4[0]))).toBe(-21200n);
    expect(Number(key(e4[1]))).toBe(-212 - -287);
    expect(Number(key(e4[1]))).toBe(75);
    e4[1].options.slice(1).forEach((o) => expect(Number(o)).not.toBe(75));
    // ex-5 : altitudes signées ; ex-9 : deux nombres à chaque distance
    const e5 = EX['ex-5'].question.rows;
    expect([1200n, -350n, 0n].map((v) => v * 100n)).toEqual([cent(key(e5[0])), cent(key(e5[1])), cent(key(e5[2]))]);
    expect(-350 < 1200).toBe(true);
    expect(key(e5[3])).toBe('المنجم');
    const e9 = EX['ex-9'].question.rows;
    ['3,5', '0,8', '9'].forEach((d, i) => {
      const parts = key(e9[i]).split(' و ').map(cent);
      expect(parts.length).toBe(2);
      expect(parts.every((x) => abs(x) === cent(d))).toBe(true);
      expect(parts[0]).toBe(-parts[1]);
      // un distracteur est faux : un seul nombre (« … فقط ») ou une mauvaise distance
      e9[i].options.slice(1).forEach((o) => {
        const ps = o.split(' و ');
        const complete = ps.length === 2 && ps.every((x) => !x.includes('فقط')) && cent(ps[0]) === -cent(ps[1]) && abs(cent(ps[0])) === cent(d);
        expect(complete, o).toBe(false);
      });
    });
    // ex-7 : la distance au zéro est la valeur absolue
    const dist = ['-1,5', '5,5', '-50', '-0,1'];
    dist.forEach((n, i) => expect(cent(key(EX['ex-7'].question.rows[i])), `ex-7 ${n}`).toBe(abs(cent(n))));
    EX['ex-7'].question.rows.forEach((r, i) => r.options.slice(1).forEach((o) => expect(cent(o)).not.toBe(abs(cent(dist[i])))));
    // ex-8 : l'opposé change le signe et garde la distance
    const opp = ['-4,5', '20', '-0,36'];
    opp.forEach((n, i) => {
      const r = EX['ex-8'].question.rows[i];
      expect(cent(key(r)), `ex-8 ${n}`).toBe(-cent(n));
      r.options.slice(1).forEach((o) => expect(cent(o)).not.toBe(-cent(n)));
    });
    expect(-(-4)).toBe(4); // opposé de l'opposé
  });

  it('ex-6 : quatre affirmations, vrai / faux calculés', () => {
    const rows = EX['ex-6'].question.rows;
    const truth = [
      cent('-0,5') < 0n && cent('-5') < 0n, // vrai
      -(-3) < 0, // faux : l'opposé de −3 est 3 > 0
      [-5, -1, -0.3].every((v) => 0 > v), // vrai : 0 est plus grand que tout négatif
      [-3, 4, 0].every((n) => n > -n), // faux : −3 < 3 ; 0 = 0
    ];
    rows.forEach((r, i) => expect(key(r), `ex-6 ${i}`).toBe(truth[i] ? 'صحيحة' : 'خاطئة'));
  });

  it('les cinq épreuves du إختبار أولي : une clé, des distracteurs faux, une الكفاءة chacune', () => {
    expect(FINAL).toHaveLength(5);
    expect(new Set(FINAL.map((f) => f.lp))).toEqual(new Set([LP.P1, LP.P2, LP.P3]));
    const asNum = (o) => cent(String(o).replace(/\$/g, ''));
    for (const f of FINAL) {
      expect(f.options).toHaveLength(new Set(f.options).size);
      expect(f.options[f.correct]).toBeTruthy();
      if (f.kind === 'situation') f.options.forEach((o, j) => expect(asNum(o) === BigInt(f.value) * 100n, `${f.id} option ${j}`).toBe(j === f.correct));
      if (f.kind === 'countNeg') {
        const n = f.list.filter((v) => v < 0).length;
        f.options.forEach((o, j) => expect(Number(o) === n, `${f.id} option ${j}`).toBe(j === f.correct));
        expect(n).toBe(3);
      }
      if (f.kind === 'distance') f.options.forEach((o, j) => expect(asNum(o) === abs(BigInt(f.value) * 100n), `${f.id} option ${j}`).toBe(j === f.correct));
      if (f.kind === 'opposite') f.options.forEach((o, j) => expect(asNum(o) === -BigInt(f.value) * 100n, `${f.id} option ${j}`).toBe(j === f.correct));
      if (f.kind === 'lowest') {
        const lo = Math.min(...f.list);
        f.options.forEach((o, j) => expect(Number(String(o).replace(/\$/g, '')) === lo, `${f.id} option ${j}`).toBe(j === f.correct));
      }
    }
  });

  it('le إختبار أولي (module 8) reprend les mêmes énoncés, options et clés que FINAL', () => {
    for (const f of FINAL) {
      for (const o of f.options) expect(moduleEight, `${f.id}: ${o}`).toContain(o);
      expect(moduleEight).toContain(f.stem.replace(/\$/g, '$').slice(0, 25));
    }
    for (const f of FINAL) expect(moduleEight).toContain(`learningPointIds: ['${f.lp}']`);
  });

  it('les textes de connaissance : définitions, zéro, opposés ; la méthode est une chaîne de quatre lignes', () => {
    expect(KNOWLEDGE.relative.definition).toContain('سالب');
    expect(KNOWLEDGE.zero.text).toContain('موجبًا وسالبًا في آن واحد');
    expect(KNOWLEDGE.opposites.definition).toContain('3$ و $-3');
    expect(KNOWLEDGE.opposites.definition).toContain('معاكس $0$ هو $0$');
    expect(METHOD_READ.solution).toHaveLength(4);
    // 3 au-dessus : 3 ; 4 au-dessous : −4, distance 4, opposé 4
    expect([3, -4].map((v) => abs(BigInt(v)))).toEqual([3n, 4n]);
    expect(-(-4)).toBe(4);
    expect(Object.keys(GUIDE)).toEqual(['biggestColdest', 'negDistance', 'oppSame', 'zeroNone']);
  });

  it('chaque exercice porte une الكفاءة et une source ; rien ne renvoie au livre', () => {
    for (const e of EXERCISES) {
      expect(Object.values(LP)).toContain(e.learningPointId);
      expect(e.source?.type).toBe('textbook');
    }
    const all = JSON.stringify([EXERCISES, FINAL, KNOWLEDGE, METHOD_READ, GUIDE, PREP_ITEMS]);
    expect(all).not.toMatch(/الكتاب|ص\.? ?\d|اقرأ ما يقوله/);
  });
});
