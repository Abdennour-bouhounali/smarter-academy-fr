import { describe, it, expect } from 'vitest';
import { EXERCISES, EX, FINAL, LP } from './exercises';
import { LAB, LAB_SIGNS, PREP_ITEMS, PREP_PLATFORM_ITEMS, KNOWLEDGE, METHOD } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { LEVELS } from '../../../../../../common/manipulations/levels';
import * as EL from '../../../../../../common/manipulations/logic/elevatorReel';
import itqan from '../modules/Module08Itqan.jsx?raw';
import astaidd from '../modules/Module00Astaidd.jsx?raw';

/* Arithmétique de contrôle INDÉPENDANTE du cœur : fractions en BigInt, lues depuis le LaTeX de l'énoncé. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const fr = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return [n / g, d / g]; };
const mulF = ([a, b], [c, d]) => fr(a * c, b * d);
const addF = ([a, b], [c, d]) => fr(a * d + c * b, b * d);
const eqF = (x, y) => x[0] === y[0] && x[1] === y[1];
/** « -2{,}5 », « (-8) », « −0,3 » → fraction. */
function num(text) {
  const s = text.replace(/[()\s$]/g, '').replace(/\\left|\\right/g, '').replace(/−/g, '-').replace(/\{,\}|,/g, '.');
  const m = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(s);
  if (!m) throw new Error(`nombre illisible : ${text}`);
  const dec = m[3] ?? '';
  return fr(BigInt(`${m[1]}${m[2]}${dec}`), 10n ** BigInt(dec.length));
}
/** « (-8) \times 5 » → produit. */
const product = (tex) => tex.replace(/\$/g, '').split('\\times').map(num).reduce(mulF, [1n, 1n]);
const optValue = (o) => num(o.replace(/\$/g, ''));
const isNeg = (f) => f[0] < 0n;

describe('جداء عددين نسبيين — les exercices (clés recalculées en BigInt)', () => {
  it('chaque exercice est dans le catalogue de la leçon, avec une compétence de la leçon', () => {
    expect(EXERCISES.length).toBe(9);
    for (const e of EXERCISES) expect(Object.values(LP)).toContain(e.learningPointId);
    expect(Object.keys(EX).length).toBe(EXERCISES.length);
  });

  it('ex-1 : chaque clé est le produit de l’énoncé et chaque distracteur est FAUX', () => {
    for (const r of EX['ex-1'].question.rows) {
      const key = product(r.label);
      expect(eqF(optValue(r.options[r.correct]), key), r.label).toBe(true);
      r.options.forEach((o, i) => { if (i !== r.correct) expect(eqF(optValue(o), key), `${r.label} ${o}`).toBe(false); });
    }
  });

  it('ex-6 : une seule option égale le produit de la ligne', () => {
    for (const r of EX['ex-6'].question.rows) {
      const key = product(r.label);
      const hits = r.options.filter((o) => eqF(product(o), key));
      expect(hits.length, r.label).toBe(1);
      expect(eqF(product(r.options[r.correct]), key)).toBe(true);
    }
  });

  it('ex-29 : le signe choisi rend l’égalité vraie, l’autre non', () => {
    const rows = EX['ex-29'].question.rows;
    const check = (label, sign) => {
      const [lhs, rhs] = label.replace(/\$/g, '').split('=');
      const fill = (t) => t.replace('\\square\\,', sign === '+' ? '' : '-');
      return eqF(product(fill(lhs).replace(/[()]/g, (m) => m)), num(rhs));
    };
    const labels = ['(-5) \\times (\\square\\,9) = 45', '(\\square\\,4) \\times 7 = -28', '(-2{,}5) \\times (\\square\\,2) = -5'];
    rows.forEach((r, i) => {
      expect(r.label).toBe(`$${labels[i]}$`);
      const chosen = r.options[r.correct].replace(/\$/g, '');
      expect(check(labels[i], chosen)).toBe(true);
      expect(check(labels[i], chosen === '+' ? '-' : '+')).toBe(false);
    });
  });

  it('act-2, act-1, ex-17 : les réponses numériques', () => {
    expect(EX['act-2'].question.expected).toBe(Number((-17n * 48n)) / 100);
    expect(EX['act-1'].question.expected).toBe(-8 * 3);
    expect(eqF(mulF(fr(-3n), fr(BigInt(EX['ex-17'].question.expected))), fr(24n))).toBe(true);
    expect(EX['ex-17'].question.expected).toBeLessThan(0);
  });

  it('ex-17b : seule la bonne paire a le produit −36 ET la somme 0 ; deep-37 : seule la bonne a produit < 0 et somme > 0', () => {
    const pair = (o) => o.replace(/\$/g, '').split('و').map((x) => num(x));
    const q = EX['ex-17b'].question;
    q.options.forEach((o, i) => {
      const [a, b] = pair(o);
      const ok = eqF(mulF(a, b), fr(-36n)) && eqF(addF(a, b), fr(0n));
      expect(ok, o).toBe(i === q.correct);
    });
    const d = EX['deep-37'].question;
    d.options.forEach((o, i) => {
      const [a, b] = pair(o);
      const ok = isNeg(mulF(a, b)) && addF(a, b)[0] > 0n;
      expect(ok, o).toBe(i === d.correct);
    });
  });

  it('deep-43 : les trois vérités (un contre-exemple pour la fausse)', () => {
    const rows = EX['deep-43'].question.rows;
    expect(rows.map((r) => r.answer)).toEqual([true, false, true]);
    expect(isNeg(mulF(fr(2n), fr(-3n)))).toBe(true); // ضعف عدد سالب
    const p = mulF(fr(-3n), fr(2n)); // jamais plus grand que chacun : −6 < −3 et −6 < 2
    expect(p[0] < -3n && p[0] < 2n).toBe(true);
    expect(eqF(mulF(fr(-4n), fr(-4n)), fr(16n))).toBe(true);
  });
});

describe('le إختبار أولي — FINAL recalculé, options littérales dans le module', () => {
  it('E1 : (−4) × 5 = −20 (somme répétée de cinq termes −4), les autres étages sont faux', () => {
    const f = FINAL.find((x) => x.id === 'E1');
    const key = mulF(fr(-4n), fr(5n));
    expect(eqF(key, fr(-20n))).toBe(true);
    f.options.forEach((o, i) => expect(eqF(num(o.replace('الطابق', '')), key), o).toBe(i === f.correct));
  });
  it('E2, E4 : la première option est la valeur, les autres sont fausses', () => {
    for (const id of ['E2', 'E4']) {
      const f = FINAL.find((x) => x.id === id);
      const key = id === 'E4'
        ? addF(mulF(fr(-5n), fr(3n)), mulF(fr(-5n), fr(-3n)))
        : product(f.tex);
      f.options.forEach((o, i) => expect(eqF(num(o.replace(/\{,\}/g, '.')), key), `${id} ${o}`).toBe(i === f.correct));
    }
  });
  it('E5 : (−4) × (−2) = 8', () => {
    expect(eqF(mulF(fr(-4n), fr(-2n)), fr(8n))).toBe(true);
    expect(FINAL.find((x) => x.id === 'E5').options[0]).toBe('الطابق 8');
  });
  it('le module contient chaque option littérale et ses bonnes réponses sont en tête', () => {
    for (const f of FINAL) {
      for (const o of f.options) {
        const lit = f.tex !== undefined ? `'$${o.replace(/\\/g, '\\\\')}$'` : `'${o}'`;
        expect(itqan.includes(lit), `${f.id} ${o}`).toBe(true);
      }
      expect(f.correct).toBe(0);
    }
  });
});

describe('« أستعدّ » : sept affirmations, vraies et fausses, avec leur justification', () => {
  it('les valeurs des affirmations de calcul', () => {
    const items = [...PREP_ITEMS, ...PREP_PLATFORM_ITEMS];
    expect(items.length).toBe(7);
    expect(new Set(items.map((i) => i.answer)).size).toBe(2);
    expect(-7 + -5).toBe(-12); expect(3 - (-8)).toBe(11); expect(-4 + -4 + -4).toBe(-12); expect(5 * (2 + 3)).toBe(5 * 2 + 5 * 3);
    expect((-10) - (-2)).toBe(-8); expect(29 - (-18)).toBe(47);
    expect(astaidd).toContain("requires: ['masafa-sifr']");
  });
});

describe('le labo : les nombres de la leçon sont ceux du preset, jouables, et la logique les accepte', () => {
  it('LAB = preset de levels.js ; chaque mission a son temps sur le rail', () => {
    expect(LAB.beginner).toEqual(LEVELS['elevator-reel'].beginner.numbers);
    expect(LAB.advanced).toEqual(LEVELS['elevator-reel'].advanced.numbers);
    expect({ a: LAB_SIGNS.beginner.a, tasks: LAB_SIGNS.beginner.tasks }).toEqual(LEVELS['sign-machine'].beginner.numbers);
    expect({ a: LAB_SIGNS.advanced.a, tasks: LAB_SIGNS.advanced.tasks }).toEqual(LEVELS['sign-machine'].advanced.numbers);
    expect(EL.init(LAB.beginner).tasks.filter((t) => t.kind === 'floor').map((t) => EL.timeFor(t.r, t.floor, 1))).toEqual([3, -2, 2, -3]);
    // p1 (2026-10-27) : où était l'ascenseur une minute AVANT son passage — prédit avant d'être vu
    expect(LAB.beginner.tasks[1]).toMatchObject({ id: 'p1', kind: 'predict', r: '-2', t: '-1', key: '2' });
    expect(() => EL.init(LAB.advanced)).not.toThrow();
    // les quatre lignes du سجلّ : −6, 4, 6, −9 — trois d'entre elles ont des signes qui s'opposent ou s'accordent
    const floors = LAB.beginner.tasks.filter((t) => t.floor).map((t) => Number(t.floor));
    expect(floors).toEqual([-6, 4, 6, -9]);
  });
  it('les exemples des encadrés sont justes', () => {
    expect((-3) * 4).toBe(-12);
    expect((-3) * 4 + (-3) * (-4)).toBe(0);
    expect([3, 2, 1, 0].map((n) => -4 * n + 0)).toEqual([-12, -8, -4, 0]);
    expect(KNOWLEDGE.table.rows.length).toBe(4);
    expect((-6) * 7).toBe(METHOD.steps.numbers.A);
    expect(-1.5 * -8).toBe(METHOD.steps.numbers.B);
    expect(Math.round(-0.3 * -0.2 * 100)).toBe(6);
  });
  it('la durée : 66 minutes sans les مسائل, 90 avec (≤ 90)', () => {
    const sum = (ms) => ms.reduce((a, m) => a + m.estimatedMin, 0);
    const all = LESSON_CONFIG.modules;
    expect(sum(all.filter((m) => m.track !== 'problem'))).toBe(66);
    expect(sum(all)).toBe(90);
    expect(LESSON_CONFIG.estimatedDurationMin).toBe(90);
  });
});
