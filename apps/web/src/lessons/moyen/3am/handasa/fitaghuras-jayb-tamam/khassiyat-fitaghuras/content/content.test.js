import { describe, it, expect } from 'vitest';
import moduleEight from '../modules/Module08Itqan.jsx?raw';
import { PREP_ITEMS, LAB, METHOD_SIDE, METHOD_NOT_RIGHT, LADDER, SURD20, GUIDE } from './textbook';
import { EX, EXERCISES, FINAL, LP } from './exercises';
import { FIGURES, FINAL_FIGURES, PROBLEM_FIGURES, MEASURES } from './figures';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure.js';
import { LESSON_CONFIG } from '../lesson.config';
import { LEVELS } from '../../../../../../common/manipulations/levels';

/* ── Arithmétique de contrôle, ÉCRITE AUTREMENT que core/arithmetic/pythagoras.js : un décimal « 6,5 » devient l'entier 650 en
 *    centièmes (BigInt) ; un carré se lit en dix-millièmes ; une racine se cherche par isqrt entier. ──────────────────────────── */
const H = (s) => { const [i, f = ''] = String(s).replace('.', ',').split(','); return BigInt(i + (f + '00').slice(0, 2)); }; // centièmes
const sq = (s) => H(s) * H(s); // dix-millièmes
const isqrt = (n) => { let x = BigInt(Math.floor(Math.sqrt(Number(n)))); while (x * x > n) x -= 1n; while ((x + 1n) * (x + 1n) <= n) x += 1n; return x; };
/** √(n dix-millièmes) en centièmes si exacte, sinon null. */
const exactRoot = (n) => { const r = isqrt(n); return r * r === n ? r : null; };
const txt = (centi) => { const s = centi.toString().padStart(3, '0'); const t = `${s.slice(0, -2)},${s.slice(-2)}`.replace(/,?0+$/, ''); return t; };
/** √(n dix-millièmes) arrondi à p décimales (p ≤ 2). */
const rounded = (n, p) => { const scaled = n * 10n ** BigInt(2 * p) * 4n / 10000n; const twice = isqrt(scaled); const q = (twice + 1n) / 2n; const s = q.toString().padStart(p + 1, '0'); return p ? `${s.slice(0, -p)},${s.slice(-p)}` : s; };
const mathNum = (o) => String(o).replace(/\$/g, '').replace(/\\,\\mathrm\{cm\}(\^2)?/, '').replace(/\{,\}/g, ',').trim();
const key = (r) => r.options[r.correct];

describe('« خاصية فيثاغورس » — chaque clé recalculée', () => {
  it('الكفاءات : quatre, dans l\'ordre du catalogue, identifiants positionnels', () => {
    expect(LP).toEqual({ P1: '3am_khassiyat-fitaghuras_P1', P2: '3am_khassiyat-fitaghuras_P2', P3: '3am_khassiyat-fitaghuras_P3', P4: '3am_khassiyat-fitaghuras_P4' });
    expect(LESSON_CONFIG.skills).toHaveLength(4);
  });

  it('le labo : les nombres de la leçon sont ceux des niveaux ; 9 + 16 = 25, 25 + 144 = 169 = 13², 4 + 9 = 13 sans racine décimale', () => {
    expect(LEVELS['pythagoras-tanks'].beginner.numbers).toEqual(LAB.beginner);
    expect(LEVELS['pythagoras-tanks'].advanced.numbers).toEqual(LAB.advanced);
    expect(sq(3) + sq(4)).toBe(sq(5));
    expect(Number((sq(3) + sq(4)) / 10000n)).toBe(LAB.water);
    expect(exactRoot(sq(5) + sq(12))).toBe(H(LAB.thirteen));
    expect(exactRoot(sq(2) + sq(3))).toBeNull();
    expect(rounded(sq(2) + sq(3), 2)).toBe(LAB.surd.rounded);
    expect(sq('3,6') < sq(2) + sq(3) && sq('3,7') > sq(2) + sq(3)).toBe(true);
  });

  it('أستعدّ : la vérité de chaque affirmation, et les deux réponses présentes', () => {
    const truth = [
      7 * 7 === 49,
      6 * 2.5 === 17,
      sq('2,6') === 52000n, // 5,2 en dix-millièmes
      25 + 144 === 169,
      (-3) * (-3) === -9,
      100 - 36 === 16,
      9 * 9 === 81,
      true,
    ];
    expect(PREP_ITEMS.map((it) => it.answer)).toEqual(truth);
    expect(new Set(PREP_ITEMS.map((it) => it.answer)).size).toBe(2);
  });

  it('les méthodes : 1,5 – 2 – 2,5 ; 6 – 4 – √20 ; KLM 54,76 ≠ 56,25 ; l\'échelle 2,4 ; √20 ≈ 4,5', () => {
    expect(exactRoot(sq('1,5') + sq(2))).toBe(H('2,5'));
    expect(sq(6) - sq(4)).toBe(200000n);
    expect(exactRoot(sq(6) - sq(4))).toBeNull();
    expect(METHOD_SIDE.solution.join(' ')).toContain('DF^2=36-16=20');
    expect(rounded(200000n, 2)).toBe('4,47');
    expect(rounded(200000n, 1)).toBe(SURD20.rounded1);
    expect(SURD20.truncated1).toBe(txt(isqrt(200000n * 100n / 10000n) * 10n));
    expect(sq('7,4')).toBe(547600n);
    expect(sq('4,5') + sq(6)).toBe(562500n);
    expect(sq('7,5')).toBe(sq('4,5') + sq(6)); // il a l'AIR droit
    expect(METHOD_NOT_RIGHT.solution.join(' ')).toContain('54{,}76');
    expect(txt(exactRoot(sq(LADDER.ladder) - sq(LADDER.foot)))).toBe(LADDER.height);
    expect(GUIDE.addLengths.right).toContain('169');
  });

  it('chaque figure passe la validation GeoFigure, et chaque triangle dessiné porte des longueurs vraies et un angle droit vrai', () => {
    const all = [...Object.values(FIGURES).flat(), ...Object.values(FINAL_FIGURES), ...Object.values(PROBLEM_FIGURES)];
    for (const fig of all) {
      expect(validateGeoFigure(fig)).toEqual([]);
      expect(figureQuality(fig), fig.ariaLabel).toEqual([]);
    }
    for (const [id, m] of Object.entries(MEASURES)) {
      for (const [a, v, b] of m.right ?? []) {
        const p = m.points;
        const dot = (p[a][0] - p[v][0]) * (p[b][0] - p[v][0]) + (p[a][1] - p[v][1]) * (p[b][1] - p[v][1]);
        expect(Math.abs(dot), `${id} angle droit en ${v}`).toBeLessThan(1e-9);
      }
      for (const [side, label] of Object.entries(m.labels ?? {})) {
        const [P, Q] = [m.points[side[0]], m.points[side[1]]];
        expect(Math.hypot(P[0] - Q[0], P[1] - Q[1]), `${id} ${side}`).toBeCloseTo(Number(label.replace(' cm', '').replace(',', '.')), 9);
      }
    }
    // le rectangle de la مسألة 1 (config, en littéral) et l'écran : diagonales 15 et √218
    const f = LESSON_CONFIG.lessonProblem.figure;
    expect(Math.hypot(f.points.C[0] - f.points.A[0], f.points.C[1] - f.points.A[1])).toBe(15);
    // le triangle qui a l'air droit (ex-17) : ses trois côtés dessinés sont ceux de l'énoncé
    const k = FIGURES['ex-17'][0].points;
    expect(Math.hypot(k.K[0] - k.J[0], k.K[1] - k.J[1])).toBeCloseTo(6.5, 9);
    expect(Math.hypot(k.K[0] - k.L[0], k.K[1] - k.L[1])).toBeCloseTo(9.6, 9);
    expect(FIGURES['ex-17'][0].rightAngles).toBeUndefined();
  });

  it('act-1 : 64 + 36 = 100, BC = 10 (et pas 14)', () => {
    const [area, len] = EX['act-1'].question.rows;
    expect(mathNum(key(area))).toBe('100');
    expect(mathNum(key(len))).toBe(txt(exactRoot(sq(8) + sq(6))));
    expect(area.options.map(mathNum).filter((o) => o === '100')).toHaveLength(1);
    expect(len.options.map(mathNum)).toContain('14');
  });

  it('ex-1 : l\'hypoténuse est le côté opposé au sommet de l\'angle droit', () => {
    const [ghi, uvw, acd] = EX['ex-1'].question.rows;
    expect(key(ghi)).toBe('$GI^2=GH^2+HI^2$');
    expect(key(uvw)).toBe('$VW^2=UV^2+UW^2$');
    expect(key(acd)).toBe('$AD^2=AC^2+CD^2$');
  });

  it('ex-3 : HF = 3,5 (2,1 et 2,8) ; BC = 6 (6,5 et 2,5) — et les distracteurs sont faux', () => {
    const [r1, r2] = EX['ex-3'].question.rows;
    expect(mathNum(key(r1))).toBe(txt(exactRoot(sq('2,1') + sq('2,8'))));
    expect(mathNum(key(r2))).toBe(txt(exactRoot(sq('6,5') - sq('2,5'))));
    expect(r1.options.map(mathNum).filter((o) => o === '3,5')).toHaveLength(1);
    expect(r2.options.map(mathNum)).toContain('\\sqrt{48,5}'); // l'erreur « additionner »
    expect(sq('6,5') + sq('2,5')).toBe(485000n);
  });

  it('ex-9 : EG = 12 (FG hypoténuse), l\'erreur du camarade donne √306', () => {
    expect(exactRoot(sq(15) - sq(9))).toBe(H(12));
    expect(sq(9) + sq(15)).toBe(3060000n);
    expect(EX['ex-9'].question.options[EX['ex-9'].question.correct]).toContain('EG=12');
  });

  it('ex-11, ex-13, ex-7, ex-17', () => {
    expect(EX['ex-11'].question.expected).toBe(Number(txt(exactRoot(sq(6) + sq('4,5'))).replace(',', '.')));
    const [jh, kh, area] = EX['ex-13'].question.rows;
    expect(mathNum(key(jh))).toBe('3');
    expect(mathNum(key(kh))).toBe(txt(exactRoot(sq(5) - sq(3))));
    expect(mathNum(key(area))).toBe('12');
    const [, screen, rs] = EX['ex-7'].question.rows;
    expect(mathNum(key(screen))).toBe(txt(exactRoot(sq('6,1') - sq(6))));
    expect(mathNum(key(rs))).toBe(rounded(sq(6) - sq('5,5'), 1));
    expect(rs.options.map(mathNum)).toContain('2,3'); // le tronqué
    const [cmp, values, verdict] = EX['ex-17'].question.rows;
    expect(cmp.correct).toBe(0);
    expect(sq('6,5') + sq('7,2')).toBe(940900n);
    expect(sq('9,6')).toBe(921600n);
    expect(key(values)).toBe('$94{,}09$ و $92{,}16$');
    expect(key(verdict)).toBe('المثلث غير قائم');
  });

  it('chaque exercice porte une source, un unique LP du درس, sans numéro visible', () => {
    for (const ex of EXERCISES) {
      expect(Object.values(LP)).toContain(ex.learningPointId);
      expect(ex.source?.type).toBe('textbook');
      expect(ex.source.number).toBeUndefined();
      if (ex.interaction === 'batch') ex.question.rows.forEach((r) => { expect(r.correct).toBeGreaterThanOrEqual(0); expect(r.correct).toBeLessThan(r.options.length); });
    }
  });

  describe('إختبار أولي — les cinq épreuves', () => {
    it('chaque option du module 8 vient des données, chaque LP est couvert', () => {
      for (const e of FINAL) {
        e.options.forEach((o) => expect(moduleEight, `${e.id}: ${o}`).toContain(o.replace(/\\/g, '\\\\'))); // la source JS double les « \ »
        expect(new Set(e.options).size).toBe(e.options.length);
        expect(moduleEight).toContain(e.lp);
      }
      expect(new Set(FINAL.map((e) => e.lp))).toEqual(new Set(Object.values(LP)));
    });

    it('E2 : 10 ; E3 : 12 ; E4 : √34 ≈ 5,8 ; E5 : non rectangle — chaque distracteur faux', () => {
      const [, e2, e3, e4, e5] = FINAL;
      expect(txt(exactRoot(sq(8) + sq(6)))).toBe(e2.key);
      expect(mathNum(e2.options[e2.correct])).toBe('10');
      e2.options.filter((_, j) => j !== e2.correct).forEach((o) => expect(mathNum(o)).not.toBe('10'));
      expect(txt(exactRoot(sq(13) - sq(5)))).toBe(e3.key);
      expect(sq(13) + sq(5)).toBe(1940000n); // le distracteur √194 : on a additionné
      expect(exactRoot(sq(3) + sq(5))).toBeNull();
      expect(rounded(sq(3) + sq(5), 1)).toBe(e4.key);
      expect(e4.options[e4.correct]).toContain('5{,}8');
      expect(sq('5,1') + sq('6,8')).toBe(722500n);
      expect(sq('8,6')).toBe(739600n);
      expect(e5.correct).toBe(0);
    });
  });
});
