import { describe, it, expect } from 'vitest';
import * as L from './lampRing';

/**
 * lamp-ring — la logique que le lab importe (logic/lampRing.js), sur les nombres des deux niveaux (levels.js) :
 * مبتدئ 4 poteaux sur un cercle de 2 m (un carré, 2√2 ≈ 2,83 m) ; متقدم la وضعية, 6 poteaux sur 3 m (l'hexagone, d = r = 3 m) ;
 * l'extra n = 12 (30°, ≈ 1,55 m sur 3 m).
 */
const placeEvenly = (s, start = 90) => {
  let t = s;
  for (let i = 0; i < s.n; i += 1) t = L.movePost(t, i, start + (360 / s.n) * i);
  return t;
};
const rotateAll = (s) => { let t = s; for (let k = 0; k < s.n + 2; k += 1) t = L.rotateOnce(t); return t; };

describe('lamp-ring — phase 1 : à la main', () => {
  it('les poteaux partent en tas : jamais également espacés, « أشعل » refuse en nommant les écarts extrêmes', () => {
    for (const n of [3, 4, 5, 6, 8, 12]) expect(L.handGaps(L.init({ n, r: 3 })).equal, `n = ${n}`).toBe(false);
    const s = L.light(L.init({ n: 6, r: 3 }));
    expect(s.handLit).toBe(false);
    expect(s.last.kind).toBe('handUnequal');
    expect(s.last.max).toBeGreaterThan(s.last.min);
    expect(L.handStart(6)).toEqual([200, 241, 255, 310, 331, 40]);
    expect(s.last.max).toBeCloseTo(2 * 3 * Math.sin((160 / 2) * Math.PI / 180), 9); // l'arc qui referme le tour : 360 − 200 = 160°
    expect(s.last.min).toBeCloseTo(2 * 3 * Math.sin((14 / 2) * Math.PI / 180), 9);
    expect(s.refusals).toBe(1);
    expect(L.canRotate(s)).toBe(true);
  });

  it('au degré près, la main PEUT réussir : 90° × 4 et 60° × 6 s’allument ; un degré de trop refuse', () => {
    const four = L.light(placeEvenly(L.init({ n: 4, r: 2 })));
    expect(four.handLit).toBe(true);
    expect(four.last.d).toBeCloseTo(2 * Math.SQRT2, 9);
    const six = placeEvenly(L.init({ n: 6, r: 3 }));
    expect(L.light(six).handLit).toBe(true);
    const off = L.light(L.movePost(six, 2, 211));
    expect(off.handLit).toBe(false);
    expect(off.last.max).toBeCloseTo(2 * 3 * Math.sin(30.5 * Math.PI / 180), 9);
  });

  it('deux poteaux superposés : un écart nul, refusé', () => {
    const s = L.light(L.movePost(L.init({ n: 4, r: 2 }), 1, L.handStart(4)[0]));
    expect(s.last.zero).toBe(true);
  });

  it('déranger un tour allumé l’éteint', () => {
    const lit = L.light(placeEvenly(L.init({ n: 4, r: 2 })));
    expect(L.movePost(lit, 0, 91).handLit).toBe(false);
  });
});

describe('lamp-ring — phase 2 : par le دوران', () => {
  it('ouverte seulement après un premier « أشعل » ; P₁ garde sa place, P₂ part à 40°', () => {
    const s0 = L.init({ n: 6, r: 3 });
    expect(L.openRotate(s0).phase).toBe('hand');
    const s = L.openRotate(L.light(s0));
    expect(s.phase).toBe('rotate');
    expect(s.rot.p1).toBe(200);
    expect(L.alphaOf(s)).toBe(40);
    expect(L.rotatedPosts(s)).toEqual([200, 240]); // P₁ garde sa place de départ (200°)
  });

  it('α = 60° (وضعية) : quatre « دوّر » posent les poteaux 3 à 6 et le tour se referme', () => {
    let s = L.moveP2(L.openRotate(L.light(L.init({ n: 6, r: 3 }))), 260);
    expect(L.alphaOf(s)).toBe(60);
    for (let k = 3; k <= 5; k += 1) { s = L.rotateOnce(s); expect(s.rot.placed).toBe(k); expect(s.rotLit).toBe(false); }
    s = L.rotateOnce(s);
    expect(s.rotLit).toBe(true);
    expect(s.phase).toBe('measure');
    expect(s.last).toMatchObject({ kind: 'ringOk', alpha: 60, sense: 'direct' });
    expect(s.last.d).toBeCloseTo(3, 9);
    expect(L.rotatedPosts(s)).toEqual([200, 260, 320, 20, 80, 140]);
  });

  it('le sens indirect convient aussi (P₂ à −60°) ; 90° × 4 sur 2 m', () => {
    let s = L.moveP2(L.openRotate(L.light(L.init({ n: 6, r: 3 }))), 140);
    expect(L.senseOf(s)).toBe('indirect');
    s = rotateAll(s);
    expect(s.rotLit).toBe(true);
    let q = L.moveP2(L.openRotate(L.light(L.init({ n: 4, r: 2 }))), 290);
    q = rotateAll(q);
    expect(q.rotLit).toBe(true);
    expect(q.last.d).toBeCloseTo(2 * Math.SQRT2, 9);
  });

  it('α = 55° : le tour reste ouvert (5 × 55 = 275°, dernier arc 85°) ; α = 75° : le 6ᵉ poteau dépasse le premier', () => {
    let s = rotateAll(L.moveP2(L.openRotate(L.light(L.init({ n: 6, r: 3 }))), 255));
    expect(s.rotLit).toBe(false);
    expect(s.last).toMatchObject({ kind: 'ringOpen', alpha: 55, closing: 85, total: 275 });
    expect(s.last.dLast).toBeGreaterThan(s.last.d);
    s = L.retryRotate(s);
    expect(s.rot).toMatchObject({ placed: 2, result: null });
    const o = rotateAll(L.moveP2(L.openRotate(L.light(L.init({ n: 6, r: 3 }))), 275));
    expect(o.last).toMatchObject({ kind: 'overshoot', alpha: 75, k: 6, turn: 375 });
    const half = rotateAll(L.moveP2(L.openRotate(L.light(L.init({ n: 6, r: 3 }))), 320));
    expect(half.last).toMatchObject({ kind: 'overshoot', alpha: 120, k: 4 });
  });

  it('balayage : pour n = 3 … 12 et tout α entier, le tour s’allume ⇔ n·α = 360', () => {
    for (let n = 3; n <= 12; n += 1) {
      for (let a = 1; a <= 180; a += 1) {
        const s = rotateAll(L.moveP2(L.openRotate(L.light(L.init({ n, r: 3 }))), 200 + a));
        expect(s.rotLit, `n = ${n}, α = ${a}`).toBe(n * a === 360);
      }
    }
  });

  it('P₂ ne peut pas se poser sur P₁ ; bouger P₂ fait repartir les images', () => {
    const s = L.openRotate(L.light(L.init({ n: 6, r: 3 })));
    expect(L.moveP2(s, 200)).toBe(s);
    const t = L.moveP2(L.rotateOnce(s), 250);
    expect(t.rot.placed).toBe(2);
  });
});

describe('lamp-ring — phase 3 : la distance', () => {
  it('les cartes : n = 6 (sin, équilatéral ✓ ; arc, sans moitié ✗), n = 4 (sin, Pythagore ✓ ; arc, d = r ✗)', () => {
    const six = L.formulaCards(6, 3);
    expect(six.map((c) => c.id)).toEqual(['arc', 'sin', 'noHalf', 'equi']);
    expect(six.filter((c) => c.ok).map((c) => c.id)).toEqual(['sin', 'equi']);
    expect(six.find((c) => c.id === 'sin').value).toBeCloseTo(3, 9);
    expect(six.find((c) => c.id === 'arc').value).toBeCloseTo(Math.PI, 9);
    expect(six.find((c) => c.id === 'noHalf').value).toBeCloseTo(3 * Math.sqrt(3), 9);
    const four = L.formulaCards(4, 2);
    expect(four.map((c) => c.id)).toEqual(['arc', 'sin', 'radius', 'pyth']);
    expect(four.find((c) => c.id === 'pyth').value).toBeCloseTo(2 * Math.SQRT2, 9);
    expect(L.formulaCards(8, 3).map((c) => c.id)).toEqual(['arc', 'sin', 'radius', 'noHalf']);
    // chaque carte fausse donne une valeur FAUSSE (≠ la distance), chaque juste la distance
    for (const [n, r] of [[4, 2], [6, 3], [8, 3], [5, 3], [8, 5]]) {
      for (const c of L.formulaCards(n, r)) {
        if (c.ok) expect(c.value).toBeCloseTo(L.gap(n, r).number, 9);
        else expect(Math.abs(c.value - L.gap(n, r).number), `${n} ${r} ${c.id}`).toBeGreaterThan(0.05);
      }
    }
  });

  it('distance exacte : 3 m (n = 6, r = 3), 2√2 ≈ 2,83 m (n = 4, r = 2) ; approchée : ≈ 1,55 m (n = 12, r = 3) ; l’arc π ≈ 3,14 m', () => {
    expect(L.gapTex(6, 3)).toBe('3\\,\\mathrm{m}');
    expect(L.gapTex(4, 2)).toBe('2\\sqrt{2}\\,\\mathrm{m} \\approx 2{,}83\\,\\mathrm{m}');
    expect(L.gapTex(12, 3)).toBe('\\approx 1{,}55\\,\\mathrm{m}');
    expect(L.dec(L.edge(6, 3))).toBe('3,14');
    expect(L.dec(L.gap(8, 5).number)).toBe('3,83');
  });

  it('une carte fausse est refusée (et compte comme contraste), la juste ouvre la découverte', () => {
    let s = L.moveP2(L.openRotate(L.light(L.init({ n: 6, r: 3 }))), 260);
    s = rotateAll(s);
    const before = s.refusals;
    s = L.pickFormula(s, 'arc');
    expect(s.formulaOk).toBe(false);
    expect(s.last).toMatchObject({ kind: 'formulaKo', id: 'arc' });
    expect(s.refusals).toBe(before + 1);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.pickFormula(s, 'equi');
    expect(s.formulaOk).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.evidenceOf(s)).toMatchObject({ kind: 'formulaOk', n: 6, r: 3 });
  });

  it('sans aucun refus ni tour à la main, pas de découverte (le contraste manque) ; un tour à la main suffit', () => {
    const lit = L.light(placeEvenly(L.init({ n: 6, r: 3 }), 200));
    let s = L.pickFormula(rotateAll(L.moveP2(L.openRotate(lit), 260)), 'sin');
    expect(s.refusals).toBe(0);
    expect(s.handLit).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    s = { ...s, handLit: false };
    expect(L.discoveryReady(s)).toBe(false);
  });
});

describe('lamp-ring — l’état d’ouverture n’est ni un essai ni la réponse', () => {
  it('poteaux inégaux, second poteau jamais à 360°/n, aucun essai', () => {
    for (const n of [4, 6, 8, 12]) {
      const s = L.init({ n, r: 3 });
      expect(s.trials).toHaveLength(0);
      expect(L.handGaps(s).equal, `n=${n}`).toBe(false);
      expect(s.rot.p2 - s.rot.p1, `n=${n}`).not.toBe(360 / n);
    }
  });
});
