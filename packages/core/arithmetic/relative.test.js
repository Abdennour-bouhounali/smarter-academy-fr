import { describe, it, expect } from 'vitest';
import * as R from './relative.js';

describe('relative — écriture et lecture exactes', () => {
  it('parse accepte le moins ASCII ou typographique, la virgule ou le point, les chiffres arabes-indiens', () => {
    expect(R.parse('-4,5')).toBe(-450n);
    expect(R.parse('−4.5')).toBe(-450n);
    expect(R.parse('٣,٥')).toBe(350n);
    expect(R.parse('-0,05')).toBe(-5n);
    expect(R.parse('10')).toBe(1000n);
    expect(R.parse(2.3)).toBe(230n);
    expect(R.parse(450n)).toBe(450n);
    for (const bad of ['', 'a', '1,234', '--1', '1,', ',5']) expect(() => R.parse(bad), bad).toThrow();
  });
  it('text / tex : virgule, zéros inutiles retirés, moins ASCII ; aller-retour', () => {
    expect(R.text(-450n)).toBe('-4,5');
    expect(R.text(R.parse('2,50'))).toBe('2,5');
    expect(R.text(0n)).toBe('0');
    expect(R.text(-5n)).toBe('-0,05');
    expect(R.tex(-450n)).toBe('-4{,}5');
    for (let h = -1000n; h <= 1000n; h += 1n) expect(R.parse(R.text(h))).toBe(h);
  });
  it('fromSideDistance : le côté est une conséquence ; 0 est le même point des deux côtés', () => {
    expect(R.fromSideDistance('below', '5')).toBe(-500n);
    expect(R.fromSideDistance('above', '0,3')).toBe(30n);
    expect(R.fromSideDistance('below', 0)).toBe(0n);
    expect(() => R.fromSideDistance('left', 1)).toThrow();
    expect(() => R.fromSideDistance('above', '-1')).toThrow();
  });
  it('parseFree : |A| ≤ 9,9, tout format de moins', () => {
    expect(R.parseFree('−2,5')).toBe('-2,5');
    expect(R.parseFree('٩,٩')).toBe('9,9');
    expect(R.parseFree('-9,9')).toBe('-9,9');
    expect(R.parseFree('10')).toBeNull();
    expect(R.parseFree('abc')).toBeNull();
  });
});

describe('relative — comparer', () => {
  it('cmp : négatifs (le plus éloigné est le plus petit), le zéro, les positifs', () => {
    expect(R.cmp('-5', '-3')).toBe(-1);
    expect(R.cmp('-1,9', '-1,91')).toBe(1);
    expect(R.cmp('-0,4', '-0,2')).toBe(-1);
    expect(R.cmp('-3', '0')).toBe(-1);
    expect(R.cmp('0', '0,01')).toBe(-1);
    expect(R.cmp('-9', '1')).toBe(-1);
    expect(R.cmp('2,50', '2,5')).toBe(0);
    expect(R.distance('-5')).toBe(500n);
    expect(R.sideOf('-0,01')).toBe('below');
    expect(R.sideOf(0)).toBe('zero');
  });
  it('balayage exhaustif : pour tout d, côté, la comparaison de deux capteurs suit celle des entiers relatifs', () => {
    for (let a = -1000; a <= 1000; a += 10) {
      for (let d = 0; d <= 1000; d += 10) {
        for (const side of R.SIDES) {
          const B = R.fromSideDistance(side, BigInt(d));
          const expected = (side === 'below' ? -d : d) < a ? -1 : (side === 'below' ? -d : d) > a ? 1 : 0;
          expect(R.cmp(B, BigInt(a))).toBe(expected);
          // la règle vue : deux négatifs → le plus éloigné du zéro est le plus petit
          if (a < 0 && side === 'below' && d !== -a) expect(R.cmp(B, BigInt(a)) === -1).toBe(d > -a);
        }
      }
    }
  });
});

describe('relative — juger les tâches du labo', () => {
  const beat = (a, want, side = null, extra = {}) => ({ kind: 'beat', a, want, side, ...extra });
  it('beat A=-3 below lower : il faut PLUS de câble (d > 3)', () => {
    const t = beat('-3', 'lower', 'below');
    expect(R.judge(t, 'below', '5')).toMatchObject({ ok: true, value: -500n, order: -1 });
    expect(R.judge(t, 'below', '3').ok).toBe(false);
    expect(R.judge(t, 'below', '1').ok).toBe(false);
    expect(R.judge(t, 'above', '5').ok).toBe(false);
    expect(R.solutions(t, R.STEP_UNIT).map((s) => R.text(s.d))).toEqual(['4', '5', '6', '7', '8', '9', '10']);
  });
  it('beat A=-3 below higher : MOINS de câble, mais pas zéro (d ∈ ]0 ; 3[)', () => {
    const t = beat('-3', 'higher', 'below');
    expect(R.solutions(t, R.STEP_UNIT).map((s) => R.text(s.d))).toEqual(['1', '2']);
    expect(R.judge(t, 'below', '0').ok).toBe(false);
  });
  it('beat A=4 above lower : d ∈ ]0 ; 4[ — plus de câble rend plus HAUT', () => {
    const t = beat('4', 'lower', 'above');
    expect(R.solutions(t, R.STEP_UNIT).map((s) => R.text(s.d))).toEqual(['1', '2', '3']);
  });
  it('beat A=2 below higher : aucune longueur ne convient (impossible)', () => {
    const t = beat('2', 'higher', 'below');
    expect(R.isImpossible(t, R.STEP_UNIT)).toBe(true);
    expect(R.isImpossible(t)).toBe(true);
    expect(R.sample(t)).toBeNull();
    for (let d = 0; d <= 100; d += 1) expect(R.judge(t, 'below', BigInt(d * 10)).ok).toBe(false);
  });
  it('between : strict, une seule dixième atteint la zone étroite', () => {
    const t = { kind: 'between', lo: '-4,5', hi: '-4,3', side: null };
    const s = R.solutions(t, R.STEP_TENTH);
    expect(s.map((x) => [x.side, R.text(x.d)])).toEqual([['below', '4,4']]);
    expect(R.judge(t, 'below', '4,5').ok).toBe(false);
    expect(R.judge(t, 'below', '4,3').ok).toBe(false);
    expect(R.judge(t, 'below', '4,4')).toMatchObject({ ok: true, order: 0 });
    expect(R.judge(t, 'below', '4,6').order).toBe(-1);
    expect(R.judge(t, 'below', '4,2').order).toBe(1);
    expect(R.solutions(t, R.STEP_UNIT)).toEqual([]);
    const u = { kind: 'between', lo: '-0,4', hi: '-0,2', side: null };
    expect(R.solutions(u).map((x) => R.text(x.d))).toEqual(['0,3']);
    expect(R.solutionsBetween(u).length).toBe(1);
  });
  it('beat both : A=1,2 lower — des deux côtés, le zéro ne crédite aucun côté', () => {
    const t = beat('1,2', 'lower', null, { both: true });
    expect(R.judge(t, 'above', '0,9')).toMatchObject({ ok: true, credit: 'above' });
    expect(R.judge(t, 'below', '7')).toMatchObject({ ok: true, credit: 'below' });
    expect(R.judge(t, 'above', '1,2').ok).toBe(false);
    expect(R.judge(t, 'above', '0').ok).toBe(false);
    expect(R.judge(t, 'above', '0').credit).toBeNull();
    expect(R.sample(t)).toMatchObject({ side: 'above', d: 10n });
  });
  it('balayage : tous les d de 0 à 10 par 0,1 des deux côtés pour chaque tâche des presets — solutions = jugement', () => {
    const tasks = [
      beat('-3', 'lower', 'below'), beat('-3', 'higher', 'below'), beat('4', 'lower', 'above'), beat('2', 'higher', 'below'),
      { kind: 'between', lo: '-4,5', hi: '-4,3', side: null }, beat('1,2', 'lower', null, { both: true }), { kind: 'between', lo: '-0,4', hi: '-0,2', side: null },
    ];
    for (const t of tasks) {
      let n = 0;
      for (let d = 0n; d <= 1000n; d += 10n) {
        for (const side of R.SIDES) {
          const j = R.judge(t, side, d);
          const listed = R.solutions(t).some((s) => s.d === d && (s.side === side || (d === 0n)));
          if (d === 0n && side === 'below') continue;
          expect(j.ok, `${JSON.stringify(t)} ${side} ${d}`).toBe(listed);
          if (j.ok) n += 1;
        }
      }
      expect(n).toBe(R.solutions(t).length);
    }
  });
  it('tâches mal formées refusées', () => {
    expect(() => R.judge({ kind: 'x' }, 'below', 1)).toThrow();
    expect(() => R.judge({ kind: 'between', lo: '1', hi: '0' }, 'below', 1)).toThrow();
    expect(() => R.judge({ kind: 'beat', a: '1', want: 'equal' }, 'below', 1)).toThrow();
  });
});

describe('corniche-ruler : opposé, abscisse, planche', () => {
  it('opposite / abscissaOf / positionOf', () => {
    expect(R.opposite('-2,5')).toBe(250n);
    expect(R.opposite(0)).toBe(0n);
    expect(R.abscissaOf('30', '0')).toBe(3000n);
    expect(R.abscissaOf('30', '-20')).toBe(5000n);
    expect(R.positionOf('-30', '-10')).toBe(-4000n);
  });
  it('boardFit / smallestStep : les trois tâches متقدم', () => {
    const S = ['0,1', '0,5', '1', '2', '5', '10', '20', '25', '50', '100'];
    expect(R.smallestStep(['-50', '75', '150'], S)).toBe(2500n);
    expect(R.smallestStep(['0,3', '-0,5', '-0,1', '0,6'], S)).toBe(10n);
    expect(R.smallestStep(['-300', '400', '600'], S)).toBe(10000n);
    expect(R.boardFit(['-50', '75', '150'], '20').off).toEqual([15000n]);
    expect(R.boardFit(['0,5'], '0,3').between).toEqual([50n]);
    expect(R.smallestStep(['1000'], ['1'])).toBeNull();
  });
  it('balayage : le plus petit pas convient et le précédent ne convient pas', () => {
    const S = ['1', '2', '5', '10', '25', '100'];
    for (let a = -600; a <= 600; a += 5) {
      const vs = [String(a), '35'];
      const got = R.smallestStep(vs, S);
      if (got === null) continue;
      const ok = (s) => { const r = R.boardFit(vs, s); return r.fits && r.between.length === 0; };
      expect(ok(got)).toBe(true);
      for (const s of S.map(R.parse)) if (s < got) expect(ok(s)).toBe(false);
    }
  });
});

describe('balloon-ballast : somme, différence, charge', () => {
  it('add / sub / ruleCase / ballastOf', () => {
    expect(R.add('-3,2', '-5')).toBe(-820n);
    expect(R.sub('5', '-7')).toBe(1200n);
    expect(R.sub('-2', '5')).toBe(-700n);
    expect(R.ruleCase('-3', '-5')).toBe('same');
    expect(R.ruleCase('-9', '5')).toBe('different');
    expect(R.ruleCase('-6', '6')).toBe('opposites');
    expect(R.ruleCase('0', '6')).toBe('zero');
    expect(R.ballastOf('-4')).toEqual({ tokens: 0, bags: 4 });
    expect(R.ballastOf(6)).toEqual({ tokens: 6, bags: 0 });
    expect(() => R.ballastOf('1,5')).toThrow();
  });
  it('balayage : |a|,|b| ≤ 12 par 0,25 contre un calcul en entiers', () => {
    for (let a = -1200; a <= 1200; a += 25) for (let b = -1200; b <= 1200; b += 25) {
      const A = String(a / 100); const B = String(b / 100);
      expect(R.add(A, B)).toBe(BigInt(a + b));
      expect(R.sub(A, B)).toBe(BigInt(a - b));
      expect(R.sub(A, B)).toBe(R.add(A, R.opposite(B)));
    }
  });
});

describe('relative — le plan (E4, dig-grid)', () => {
  const P = R.point;
  it('pointText, quadrantOf, parsePoint', () => {
    expect(R.pointText(P('-1,5', '2,5'))).toBe('(-1,5 ; 2,5)');
    expect([P(1, 2), P(-1, 2), P(-1, -2), P(1, -2)].map(R.quadrantOf)).toEqual([1, 2, 3, 4]);
    expect([P(0, 0), P(3, 0), P(0, -2)].map(R.quadrantOf)).toEqual(['origin', 'axisX', 'axisY']);
    expect(R.parsePoint('( −2,5 ; 3 )')).toEqual(P('-2,5', 3));
    expect(R.parsePoint('3')).toBeNull();
    expect(R.parsePoint('a ; 3')).toBeNull();
  });
  it('symX et symY sont des involutions, symX garde l’abscisse', () => {
    for (let x = -6; x <= 6; x += 1) for (let y = -6; y <= 6; y += 1) {
      const p = P(x, y);
      expect(R.symX(R.symX(p))).toEqual(p);
      expect(R.symY(R.symY(p))).toEqual(p);
      expect(R.symX(p).x).toBe(p.x);
      expect(R.symY(p).y).toBe(p.y);
    }
  });
  it('originFor et coordsOf sont inverses ; consistent exhaustif sur une grille 13 × 13', () => {
    const jar = P(5, 4); const plate = P(2, 1);
    for (let ox = -6; ox <= 6; ox += 1) for (let oy = -6; oy <= 6; oy += 1) {
      const o = P(ox, oy);
      expect(R.originFor(jar, R.coordsOf(jar, o))).toEqual(o);
      expect(R.consistent([{ world: jar, wanted: R.coordsOf(jar, o) }, { world: plate, wanted: R.coordsOf(plate, o) }])).toEqual(o);
    }
    expect(R.consistent([{ world: jar, wanted: P(2, 1) }, { world: plate, wanted: P(1, 2) }])).toBeNull();
    expect(R.originFor(jar, P(2, 1))).toEqual(P(3, 3));
  });
});

describe('E3 — tug-rope : somme algébrique (majmu-jabri)', () => {
  const sumOf = (s) => R.algebraicSum(R.terms(s));
  it('lit les formes du plan', () => {
    expect(sumOf('(-9) - (+2) + (-5) - (-4)')).toBe(-1200n);
    expect(sumOf('-9 - 2 - 5 + 4')).toBe(-1200n);
    expect(sumOf('(+12) - [(-6) - (-2) + (+9)]')).toBe(700n);
    expect(sumOf('-15 + 4 + 8 + 3')).toBe(0n);
    expect(sumOf('(+4,5)+(-7)-(+8)+(+3,5)-(-4,5)-(-10)')).toBe(750n);
    expect(sumOf('(+15)-[(-6)+(+4)]')).toBe(1700n);
    expect(sumOf('-9+4-6+11')).toBe(0n);
    expect(sumOf('(-8)-(+3)+(-6)-(-5)')).toBe(-1200n);
    expect(sumOf('5-6-8')).toBe(-900n);
    expect(sumOf('(-5)+(3-(2))')).toBe(-400n);
    expect(() => R.terms('(1')).toThrow();
    expect(() => R.terms('3 +')).toThrow();
  });
  it('asSum, groupBySign, simplifiedText', () => {
    const t = R.terms('(-9) - (+2) + (-5) - (-4)');
    const a = R.asSum(t);
    expect(a).toEqual([-900n, -200n, -500n, 400n]);
    expect(R.simplifiedText(a)).toBe('-9 - 2 - 5 + 4');
    const g = R.groupBySign(a);
    expect(g).toMatchObject({ posSum: 400n, negSum: -1600n, total: -1200n });
    expect(R.bracketText(t)).toBe('(-9) - (+2) + (-5) - (-4)');
  });
  it('500 chaînes aléatoires : évaluation de gauche à droite = groupement par signe = écriture simplifiée relue', () => {
    let seed = 7;
    const rnd = (n) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
    for (let k = 0; k < 500; k += 1) {
      const n = 2 + rnd(5);
      const items = Array.from({ length: n }, () => ({ op: rnd(2) ? '+' : '-', v: BigInt((rnd(41) - 20) * 100 + (rnd(2) ? 50 : 0)) }));
      items[0].op = '+';
      const txt = items.map((it, i) => `${i ? it.op : ''}(${it.v < 0n ? '-' : '+'}${R.text(it.v < 0n ? -it.v : it.v)})`).join('');
      const want = items.reduce((acc, it) => (it.op === '+' ? acc + it.v : acc - it.v), 0n);
      expect(sumOf(txt)).toBe(want);
      const a = R.asSum(R.terms(txt));
      expect(R.groupBySign(a).total).toBe(want);
      expect(sumOf(R.simplifiedText(a))).toBe(want);
    }
  });
});

describe('relative — la distance entre deux points (E5, gap-caliper)', () => {
  it('gap : positive, symétrique, = grande − petite, sur toutes les paires |a|, |b| ≤ 10 par 0,25', () => {
    for (let a = -1000n; a <= 1000n; a += 25n) {
      for (let b = -1000n; b <= 1000n; b += 25n) {
        const g = R.gap(a, b);
        expect(g >= 0n).toBe(true);
        expect(g).toBe(R.gap(b, a));
        expect(g).toBe((a > b ? a : b) - (a > b ? b : a));
      }
    }
  });
  it('exemples : −4 et +9 → 13 ; −7 et −2 → 5 ; 0 et −6 → 6 ; −2,5 et 6 → 8,5', () => {
    expect(R.text(R.gap('-4', '9'))).toBe('13');
    expect(R.text(R.gap('-7', '-2'))).toBe('5');
    expect(R.text(R.gap('0', '-6'))).toBe('6');
    expect(R.text(R.gap('-2,5', '6'))).toBe('8,5');
  });
  it('pointsAt : deux points à égale distance, symétriques autour de a', () => {
    expect(R.pointsAt('1,5', '4').map(R.text)).toEqual(['-2,5', '5,5']);
    expect(R.pointsAt('3', '0')).toEqual([300n]);
    for (const p of R.pointsAt('-1', '3')) expect(R.gap(p, '-1')).toBe(300n);
    expect(() => R.pointsAt('1', '-1')).toThrow();
  });
  it('midpointAbscissa : plus petite + moitié de la distance ; null si un troisième chiffre', () => {
    expect(R.text(R.midpointAbscissa('-24', '10'))).toBe('-7');
    expect(R.text(R.midpointAbscissa('-4,6', '1,8'))).toBe('-1,4');
    expect(R.text(R.midpointAbscissa('1,8', '-4,6'))).toBe('-1,4');
    expect(R.midpointAbscissa('0', '0,01')).toBeNull();
  });
});
