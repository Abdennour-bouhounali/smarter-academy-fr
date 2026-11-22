import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Contrôle INDÉPENDANT : relatifs décimaux exacts en BigInt (CENTIÈMES : « -5.5 » → -550n), aucun import de packages/core. */
const D = (v) => {
  let s = String(v).replace('−', '-'); const neg = s.startsWith('-'); s = s.replace(/^[-+]/, '');
  const [i, f = ''] = s.split('.');
  const r = BigInt(i) * 100n + BigInt((f + '00').slice(0, 2));
  return neg ? -r : r;
};
const abs = (x) => (x < 0n ? -x : x);
const dist = (a, b) => abs(D(a) - D(b));
const sum = (...xs) => xs.reduce((t, x) => t + D(x), 0n);
const nums = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => BigInt(Math.round(s.expected * 100)));
const hs = (...xs) => xs.map((x) => D(x));
const choices = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const right = (c) => c.options[c.correct];

describe('les وضعيات تدريبية de « أدمج تعلّماتي — الأعداد النسبية »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    expect(PROBLEMS.length).toBe(6);
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([1, 2, 3, 4, 5, 6].map((n) => [n, `wadiya-${n}`]));
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
  });

  it('situation 1 — le budget : +40300, −16400, −6700, −15300 ; ordre ; +1900 ; 9700', () => {
    const w1 = sum('56000', '-12500', '-3200'); const w2 = sum('-11800', '-4600'); const w3 = sum('6500', '-13200'); const w4 = sum('-12900', '-2400');
    expect([w1, w2, w3, w4]).toEqual(hs('40300', '-16400', '-6700', '-15300'));
    expect(nums('wadiya-1', 0)).toEqual([w1, w2, w3, w4]);
    // l'ordre : -16400 < -15300 < -6700 < 40300 ; le distracteur range les négatifs par distance croissante (faux)
    const sorted = [w1, w2, w3, w4].sort((a, b) => (a < b ? -1 : 1));
    expect(sorted).toEqual(hs('-16400', '-15300', '-6700', '40300'));
    expect(right(choices('wadiya-1', 1)[0])).toBe('$-16400 < -15300 < -6700 < +40300$');
    expect(PROBLEM['wadiya-1'].parts[1].steps[0].correct).toBe(1);
    const neg = w2 + w3 + w4;
    expect(neg).toBe(D('-38400'));
    expect(nums('wadiya-1', 2)).toEqual([neg, w1 + neg]);
    // le mois : toutes les opérations du tableau, dans un seul ordre
    expect(sum('56000', '6500', '-12500', '-3200', '-11800', '-4600', '-13200', '-12900', '-2400')).toBe(D('1900'));
    expect(w1 + neg > 0n).toBe(true);
    // la différence : (−6700) − (−16400) = +9700
    expect(D('-6700') - D('-16400')).toBe(D('9700'));
    expect(nums('wadiya-1', 3)).toEqual([D('9700')]);
  });

  it('situation 2 — les fuseaux : 20 h, 6 h, 13 h ; l\'écart 14 ; l\'appel 20 − 14 = 6', () => {
    const off = { alg: '1', cai: '2', bei: '2', jhb: '2', tok: '9', was: '-5', lon: '0' };
    expect(D(off.tok) - D(off.alg)).toBe(D('8')); expect(D('12') + D('8')).toBe(D('20'));
    expect(D(off.was) - D(off.alg)).toBe(D('-6')); expect(D('12') + D('-6')).toBe(D('6'));
    expect(D(off.cai) - D(off.alg)).toBe(D('1')); expect(D('12') + D('1')).toBe(D('13'));
    expect(nums('wadiya-2', 2)).toEqual(hs('8', '20', '-6', '6', '13'));
    expect(dist(off.tok, off.was)).toBe(D('14'));
    expect(nums('wadiya-2', 3)).toEqual(hs('14'));
    expect(D('20') + D('-14')).toBe(D('6'));
    expect(nums('wadiya-2', 4)).toEqual(hs('6'));
    // l'ordre décroissant des sept valeurs ; l'ordre croissant est le distracteur
    const vals = ['9', '2', '2', '2', '1', '0', '-5'].map(D);
    expect([...vals].sort((a, b) => (a > b ? -1 : 1))).toEqual(vals);
    expect(right(choices('wadiya-2', 1)[0])).toBe('$+9 > +2 = +2 = +2 > +1 > 0 > -5$');
    // graduation : 1 convient à −5…+9 ; 2 laisse +1 et −5 entre deux graduations ; 0,1 exige 90 graduations
    expect(vals.every((v) => v % 100n === 0n)).toBe(true);
    expect(vals.some((v) => v % 200n !== 0n)).toBe(true);
    expect(D('9') / D('0.1')).toBe(90n);
  });

  it('situation 3 — les altitudes : 2948, 592, 3540, −200 ; ordre croissant', () => {
    expect(dist('2908', '-40')).toBe(D('2948'));
    expect(dist('3500', '2908')).toBe(D('592')); expect(dist('3500', '-40')).toBe(D('3540'));
    expect(D('-40') - D('160')).toBe(D('-200'));
    expect(nums('wadiya-3', 0)).toEqual(hs('2948')); expect(nums('wadiya-3', 1)).toEqual(hs('592', '3540')); expect(nums('wadiya-3', 2)).toEqual(hs('-200'));
    const vals = ['-200', '-40', '0', '2908', '3500'].map(D);
    expect([...vals].sort((a, b) => (a < b ? -1 : 1))).toEqual(vals);
    expect(right(choices('wadiya-3', 3)[0])).toBe('$-200 < -40 < 0 < +2908 < +3500$');
    expect(PROBLEM['wadiya-3'].parts[3].steps[0].correct).toBe(1);
  });

  it('situation 4 — E(−3 ; 2), F(4 ; 2), G(4 ; −3) : H(−3 ; −3), 7, 5, 35, 140 dalles, 25200 DA, K à l\'intérieur', () => {
    const E = ['-3', '2']; const F = ['4', '2']; const G = ['4', '-3'];
    const H = [E[0], G[1]]; // EFGH rectangle : H a l'abscisse de E et l'ordonnée de G
    expect(H).toEqual(['-3', '-3']);
    expect(nums('wadiya-4', 0)).toEqual(hs(H[0], H[1]));
    expect(dist(E[0], F[0])).toBe(D('7')); expect(dist(F[1], G[1])).toBe(D('5'));
    expect(nums('wadiya-4', 1)).toEqual(hs('7', '5'));
    expect(D('7') * D('5') / 100n).toBe(D('35')); expect(nums('wadiya-4', 2)).toEqual(hs('35'));
    expect(D('0.25') * 4n).toBe(D('1'));
    expect(nums('wadiya-4', 3)).toEqual(hs('140', '25200')); expect(140n * 180n).toBe(25200n);
    // le point K(3,5 ; −2,5) est strictement dans le rectangle [−3, 4] × [−3, 2]
    expect(D('-3') < D('3.5') && D('3.5') < D('4') && D('-3') < D('-2.5') && D('-2.5') < D('2')).toBe(true);
    expect(PROBLEM['wadiya-4'].visual.points.map((p) => [p.x, p.y])).toEqual([[-3, 2], [4, 2], [4, -3]]);
  });

  it('situation 5 — l\'ascenseur : somme 0 ; 7, 3, 9, −3, 0 ; max 9, min −3 ; 12', () => {
    const moves = ['9', '-4', '6', '-12', '3'];
    let floor = D('-2'); const path = [];
    for (const m of moves) { floor += D(m); path.push(floor); }
    expect(path).toEqual(hs('7', '3', '9', '-3', '0'));
    expect(sum('-2', ...moves)).toBe(0n);
    expect(nums('wadiya-5', 0)).toEqual(hs('18', '-18', '0'));
    expect(nums('wadiya-5', 1)).toEqual(hs('7', '3', '9', '-3'));
    const all = [D('-2'), ...path];
    expect(all.reduce((a, b) => (a > b ? a : b))).toBe(D('9')); expect(all.reduce((a, b) => (a < b ? a : b))).toBe(D('-3'));
    expect(nums('wadiya-5', 2)).toEqual(hs('9', '-3'));
    expect(D('9') - D('-3')).toBe(D('12')); expect(nums('wadiya-5', 3)).toEqual(hs('12'));
  });

  it('situation 6 — la feuille de Salim : (a) ✗ −8 ; (b) ✓ ; (c) ✗ ; (d) ✗ 5 ; (e) ✓ ; point 2', () => {
    expect(D('-5') + D('-3')).toBe(D('-8')); expect(D('-5') + D('-3')).not.toBe(D('8'));
    expect(D('-4') - D('-9')).toBe(D('5'));
    expect(D('-2.7') < D('-2.07')).toBe(true); // donc « −2,7 > −2,07 » est faux
    expect(dist('-6', '-1')).toBe(D('5')); expect(dist('-6', '-1')).not.toBe(D('7'));
    const M = [D('-3'), D('2')]; const sym = [M[0], -M[1]]; // symétrique par rapport à l'axe des abscisses
    expect(sym).toEqual([D('-3'), D('-2')]);
    const rows = PROBLEM['wadiya-6'].parts[0].steps.find((s) => s.kind === 'batch').rows;
    expect(rows.map((r) => r.correct)).toEqual([1, 0, 1, 1, 0]);
    expect(rows.filter((r) => r.correct === 0).length).toBe(2);
    expect(nums('wadiya-6', 1).slice(0, 2)).toEqual(hs('-8', '5'));
    expect(nums('wadiya-6', 2)).toEqual(hs('2'));
    expect(right(choices('wadiya-6', 1)[0])).toBe('$-2{,}7 < -2{,}07$');
  });

  it('aucune ligne ne renvoie au manuel ; l\'islam est respecté ; les montants n\'ont ni prêt ni intérêt', () => {
    const all = JSON.stringify(PROBLEMS);
    expect(all).not.toMatch(/الكتاب(?!ة)|(^|[^ء-ي])ص\.?\s*\d+/);
    expect(all).not.toMatch(/خنزير|🐷|خمر|قمار|ميسر|(^|[^ء-ي])(ربا|ساحر|سحر|نرد)([^ء-ي]|$)|فائدة|فوائد|قرض|ورق اللعب/);
  });
});
