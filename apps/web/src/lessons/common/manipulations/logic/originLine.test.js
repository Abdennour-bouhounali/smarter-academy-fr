import { describe, it, expect } from 'vitest';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as L from './originLine';

/**
 * origin-line — la logique RÉELLE du lab (celle que OriginLine.jsx importe), sur les nombres du
 * manuel : نشاط 3 (f = 0,5x : A(1 ; 0,5), B(4 ; 2), C(−2 ; −1)), طرائق ص 69 (f(4) = 1,6 et
 * l'antécédent 8,75 de 3,5 sur la droite de coefficient 0,4 ; f(x) = 1,5x par A(1 ; 1,5)),
 * دوري الآن ص 69 (a = 9/4 par A(−2/3 ; −3/2)), معارف ص 68 (−2x descend, 2x monte), تمرين 14
 * (−3,2x : B(5 ; 16) refusé), et les deux mondes des leçons 5 (ressort, y = 0,3x) et 6 (budget).
 */
const T = (p) => Lin.fracText(p);
const v = L.parseValue;

describe('origin-line — lecture des props', () => {
  it('lit a comme le manuel : décimales à virgule, signe typographique, fractions', () => {
    expect(T(v('0,5'))).toBe('1/2');
    expect(T(v('−3,2'))).toBe('-16/5');
    expect(T(v('9/4'))).toBe('9/4');
    expect(L.parsePoints('2:0,6|3:0,9').map((p) => [T(p.x), T(p.y)])).toEqual([['2', '3/5'], ['3', '9/10']]);
    expect(L.parseReads('x:4|y:3,5').map((r) => [r.axis, T(r.v)])).toEqual([['x', '4'], ['y', '7/2']]);
    expect(() => L.parseReads('z:4')).toThrow();
  });

  it('refuse un contrat incomplet', () => {
    expect(() => L.init({ mode: 'draw' })).toThrow();
    expect(() => L.init({ mode: 'fit' })).toThrow();
    expect(() => L.init({ mode: 'read', a: '0' })).toThrow();
  });

  it('pas ronds et subdivisions exactes', () => {
    expect(T(L.niceStep(10))).toBe('1');
    expect(T(L.niceStep(2))).toBe('1/5');
    expect(T(L.niceStep(700))).toBe('100');
    expect(T(L.subdivide(v('1'), [v('0,5')]))).toBe('1/2');
    expect(T(L.subdivide(v('1'), [v('-2/3')]))).toBe('1/3');
    expect(T(L.subdivide(v('1'), [v('9/4')]))).toBe('1/4');
  });
});

describe('origin-line — draw (نشاط 3 : f(x) = 0,5x)', () => {
  const s0 = L.init({ a: '0,5', mode: 'draw' });

  it('fenêtre : O, une abscisse négative (C), et la grille qui atteint A(1 ; 0,5) exactement', () => {
    expect(s0.win).toEqual({ xMin: -4, xMax: 6, yMin: -2, yMax: 3 });
    expect(T(s0.snap.dx)).toBe('1');
    expect(T(s0.snap.dy)).toBe('1/2');
    expect(L.hasLine(s0)).toBe(false);
  });

  it('O résiste ; un point hors de la droite est refusé avec son écart', () => {
    expect(L.place(s0, 0, 0).last.kind).toBe('origin');
    expect(L.touchOrigin(s0).last.kind).toBe('origin');
    const r = L.place(s0, 4, 3);
    expect(r.last.kind).toBe('refused');
    expect(T(r.last.fx)).toBe('2');
    expect(T(r.last.gap)).toBe('1');
    expect(r.placed).toHaveLength(0);
    expect(L.hasLine(r)).toBe(false);
  });

  it('le premier point accepté trace (OA) ; B s\'aligne ; la découverte demande A ET B', () => {
    let s = L.place(s0, 1, v('0,5'));
    expect(s.last).toMatchObject({ kind: 'accepted', label: 'A', first: true });
    expect(L.hasLine(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.place(s, 1, v('0,5'));
    expect(s.last.kind).toBe('same');
    s = L.place(s, 4, 2);
    expect(s.last).toMatchObject({ kind: 'accepted', label: 'B', first: false });
    expect(L.discoveryReady(s)).toBe(true);
    // C d'abscisse −2 : la sonde lit f(−2) = −1 (seulement l'axe des x en draw)
    const c = L.readX(s, -2);
    expect(T(c.last.other)).toBe('-1');
    expect(L.readY(s, 1)).toBe(s);
    expect(L.place(s, -2, -1).last.label).toBe('C');
  });

  it('la sonde ne lit rien tant que la droite n\'est pas tracée', () => {
    expect(L.readX(s0, 2)).toBe(s0);
  });

  it('l\'épingle de départ n\'est jamais déjà sur la droite (rien n\'est offert)', () => {
    for (const a of ['0,5', '1,5', '-2', '2', '9/4', '-3,2', '0,25']) {
      const s = L.init({ a, mode: 'draw' });
      const { i, j } = L.startPin(s);
      const x = L.valueAt(i, s.snap.dx); const y = L.valueAt(j, s.snap.dy);
      expect(Lin.eq(Lin.mul(s.a, x), y)).toBe(false);
    }
  });

  it('chaque coefficient du chapitre a un second point atteignable sur la grille de la main', () => {
    for (const a of ['0,5', '1,5', '-2', '2', '9/4', '-3,2', '0,25', '-3/2', '3/2', '2/3', '0,2']) {
      const s = L.init({ a, mode: 'draw' });
      const rx = L.indexRange(s.win.xMin, s.win.xMax, s.snap.dx);
      const ry = L.indexRange(s.win.yMin, s.win.yMax, s.snap.dy);
      let found = false;
      for (let i = rx.min; i <= rx.max && !found; i++) {
        if (i === 0) continue;
        for (let j = ry.min; j <= ry.max; j++) {
          if (Lin.eq(Lin.mul(s.a, L.valueAt(i, s.snap.dx)), L.valueAt(j, s.snap.dy))) { found = true; break; }
        }
      }
      expect(found, `a = ${a}`).toBe(true);
    }
  });

  it('دوري الآن ص 69 : a = 9/4, le point donné A(−2/3 ; −3/2) est un nœud, (1 ; 9/4) est accepté', () => {
    const s = L.init({ a: '9/4', mode: 'draw', points: '-2/3:-3/2' });
    expect(T(s.snap.dx)).toBe('1/3');
    expect(L.isMultiple(v('-3/2'), s.snap.dy)).toBe(true);
    const t = L.place(s, 1, v('9/4'));
    expect(t.last.kind).toBe('accepted');
    expect(L.place(s, v('-2/3'), v('-3/2')).last.kind).toBe('accepted');
  });

  it('تمرين 14 : sur −3,2x, B(5 ; 16) est refusé (écart 32) — c\'est un point de 3,2x', () => {
    const s = L.init({ a: '-3,2', mode: 'draw', xMin: '-1', xMax: '11', yMin: '-35', yMax: '35' });
    const r = L.place(s, 5, 16);
    expect(r.last.kind).toBe('refused');
    expect(T(r.last.fx)).toBe('-16');
    expect(T(r.last.gap)).toBe('32');
  });
});

describe('origin-line — read (طرائق ص 69 : a = 0,4)', () => {
  const s0 = L.init({ a: '0,4', mode: 'read', reads: 'x:4|y:3,5', xMax: '10', yMax: '5' });

  it('la droite est donnée ; les sondes vont par demi-pas', () => {
    expect(L.hasLine(s0)).toBe(true);
    expect(T(s0.snap.dx)).toBe('1/2');
    expect(T(s0.snap.dy)).toBe('1/2');
  });

  it('f(4) = 1,6 et le nombre dont l\'image est 3,5 est 8,75 — exacts ; la découverte demande les DEUX', () => {
    let s = L.readX(s0, 4);
    expect(L.numText(s.last.other)).toBe('1,6');
    expect(s.last.target).toBe(0);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.readY(s, v('3,5'));
    expect(L.numText(s.last.other)).toBe('8,75');
    expect(L.targetsDone(s)).toEqual([true, true]);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.quotientTex(v('3,5'), v('0,4'))).toBe('3{,}5 \\div 0{,}4 = 8{,}75');
    expect(L.productTex(v('0,4'), v('4'))).toBe('0{,}4 \\times 4 = 1{,}6');
  });

  it('sans cible : une lecture de chaque sens suffit à la découverte', () => {
    const s = L.init({ a: '0,4', mode: 'read' });
    expect(L.discoveryReady(L.readX(s, 2))).toBe(false);
    expect(L.discoveryReady(L.readY(L.readX(s, 2), 2))).toBe(true);
  });

  it('le budget (leçon 6) : 3,8x sous le plafond 2000 — la rencontre est exacte, 10000/19 ≈ 526,32', () => {
    const s = L.init({ a: '3,8', mode: 'read', cap: '2000', xMin: '0', xMax: '700', yMin: '0', yMax: '2600' });
    expect(L.isMultiple(v('2000'), s.snap.dy)).toBe(true);
    const r = L.readY(s, 2000);
    expect(r.last.capHit).toBe(true);
    expect(T(r.last.other)).toBe('10000/19');
    expect(L.approxTex(r.last.other)).toBe('\\dfrac{10000}{19} \\approx 526{,}32');
  });
});

describe('origin-line — pivot (le زالق : le sens et le signe de a)', () => {
  const s0 = L.init({ mode: 'pivot' });
  it('la poignée est au bord droit ; a = j·dy / hx', () => {
    expect(T(s0.hx)).toBe('5');
    expect(T(L.aAt(s0, L.handleIndex(s0, 2)))).toBe('2');
  });
  it('CONTRASTE : une droite qui monte ET une qui descend', () => {
    let s = L.pivot(s0, 2);
    expect(s.last.dir).toBe('rising');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.pivot(s, 0);
    expect(s.last.dir).toBe('flat');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.pivot(s, -2);
    expect(s.last.dir).toBe('falling');
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('saisir la droite à un point (x ; y) la fait passer par ce point', () => {
    const j = L.handleIndexFor(s0, 1, -2);
    expect(T(L.aAt(s0, j))).toBe('-2');
    expect(L.handleIndexFor(s0, 0, 3)).toBeNull();
  });
});

describe('origin-line — fit (le ressort de la leçon 5 : y = 0,3x)', () => {
  const s0 = L.init({ mode: 'fit', points: '2:0,6|3:0,9|4:1,2|5:1,5' });
  it('les données sont alignées avec O ; le coefficient est atteignable exactement', () => {
    expect(T(s0.fitA)).toBe('3/10');
    const j = L.handleIndex(s0, v('0,3'));
    expect(T(L.aAt(s0, j))).toBe('3/10');
  });
  it('une droite par un seul point ne suffit pas ; la bonne droite passe par tous', () => {
    let s = L.pivot(s0, v('0,25'));
    expect(s.last.kind).toBe('fitSome');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.pivot(s, v('0,3'));
    expect(s.last.kind).toBe('fitAll');
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.lineTex(s.lineA)).toBe('y = 0{,}3x');
  });
  it('données NON alignées avec O : la découverte demande que chaque point ait été atteint', () => {
    const s = L.init({ mode: 'fit', points: '1:60|2:70' });
    expect(L.fitPossible(s)).toBe(false);
    let t = L.pivot(s, 60);
    expect(L.discoveryReady(t)).toBe(false);
    t = L.pivot(t, 35);
    expect(L.discoveryReady(t)).toBe(true);
  });
});

describe('origin-line — géométrie du dessin', () => {
  it('orthonormé : même unité sur les deux axes ; O au bon pixel', () => {
    const g = L.planeGeometry({ win: { xMin: -4, xMax: 6, yMin: -2, yMax: 3 }, width: 420, height: 400 });
    expect(g.ux).toBe(g.uy);
    expect(g.px(-4)).toBe(g.pad);
    expect(g.py(3)).toBe(g.pad);
    expect(g.W).toBeLessThanOrEqual(420);
    const back = g.fromPx(g.px(1), g.py(0.5));
    expect(back.x).toBeCloseTo(1);
    expect(back.y).toBeCloseTo(0.5);
  });
  it('le tronçon visible de la droite reste dans la fenêtre (balayé)', () => {
    const win = { xMin: -4, xMax: 6, yMin: -2, yMax: 3 };
    for (const a of [-5, -2, -0.5, 0, 0.25, 0.5, 2, 9 / 4, 10]) {
      const seg = L.lineSegment(Lin.parseNumber(String(a).replace('.', ',')), win);
      for (const [x, y] of seg) {
        expect(x).toBeGreaterThanOrEqual(win.xMin - 1e-9);
        expect(x).toBeLessThanOrEqual(win.xMax + 1e-9);
        expect(y).toBeGreaterThanOrEqual(win.yMin - 1e-9);
        expect(y).toBeLessThanOrEqual(win.yMax + 1e-9);
      }
    }
  });
  it('écritures : y = 0,5x, y = -x, (−2 ; −1)', () => {
    expect(L.lineTex(v('0,5'))).toBe('y = 0{,}5x');
    expect(L.lineTex(v('-1'))).toBe('y = -x');
    expect(L.pointTex(v('-2'), v('-1'))).toBe('(-2 ; -1)');
    expect(L.numTex(v('9/4'))).toBe('2{,}25');
    expect(L.numTex(v('-2/3'))).toBe('-\\dfrac{2}{3}');
  });
});

describe('valeurs par défaut (jamais une réponse, jamais un essai)', () => {
  const CASES = [
    { a: '0,4', mode: 'read', reads: 'x:4|y:3,5', xMax: '10', yMax: '5' },
    { a: '3,8', mode: 'read', cap: '2000', xMin: '0', xMax: '700', yMin: '0', yMax: '2600' },
    { a: '0,4', mode: 'read' },
    { mode: 'pivot' },
    { mode: 'fit', points: '2:0,6|3:0,9|4:1,2|5:1,5' },
    { mode: 'fit', points: '1:60|2:70' },
    { mode: 'fit', points: '1:0|2:0' },
  ];
  it('la poignée par défaut ne passe pas par toutes les données ; les sondes évitent cibles, O et plafond', () => {
    for (const c of CASES) {
      const s = L.init(c);
      if (c.mode === 'pivot' || c.mode === 'fit') {
        const j = L.defaultHandleIndex(s);
        const hr = L.handleRange(s);
        expect(j).toBeGreaterThanOrEqual(hr.min);
        expect(j).toBeLessThanOrEqual(hr.max);
        if (c.mode === 'fit') expect(L.hitsOf(s, L.aAt(s, j)).every(Boolean), JSON.stringify(c)).toBe(false);
      }
      if (c.mode === 'read') {
        for (const axis of ['x', 'y']) {
          const i = L.defaultProbeIndex(s, axis);
          const v = L.valueAt(i, axis === 'x' ? s.snap.dx : s.snap.dy);
          expect(i).not.toBe(0);
          expect(s.reads.some((t) => t.axis === axis && L.same(t.v, v))).toBe(false);
          if (axis === 'y' && s.cap) expect(L.same(v, s.cap)).toBe(false);
        }
      }
      expect(s.trials).toHaveLength(0);
      expect(s.lines).toHaveLength(0);
      expect(s.readsDone).toHaveLength(0);
    }
  });
});
