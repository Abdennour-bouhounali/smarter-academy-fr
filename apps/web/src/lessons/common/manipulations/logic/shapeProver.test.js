import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as Lq from '@smarter-academy/core/arithmetic/linear.js';
import * as L from './shapeProver';
import { LEVELS } from '../levels';

/**
 * shape-prover — le فار du ملعب الحي : chaque verdict sur les nombres des deux niveaux de levels.js (le départ qui « a
 * l'air » droit, la droite de C de la طريقة p. 145, le carré ABCD et le cercle de diamètre [AC]).
 */
const { beginner, advanced } = LEVELS['shape-prover'];
const at = (s, x, y) => L.moveHeld(s, [x, y]);
const ask = (s, claim, cards) => L.check(cards.reduce(L.toggleCard, L.setClaim({ ...s, picked: [] }, claim)));
const num = (f) => Lq.toNumber(f);

describe('shape-prover — مبتدئ (le triangle, C tenu)', () => {
  const s0 = L.init(beginner.numbers);

  it('starts on C(−1 ; 2): it LOOKS right at A (98°) but 10 + 5 ≠ 17', () => {
    expect(L.xy(s0.pts.C)).toEqual([-1, 2]);
    const c = L.card(s0, 'pyth:A');
    expect([num(c.parts[0]), num(c.parts[1]), num(c.right)]).toEqual([10, 5, 17]);
    expect(c.balanced).toBe(false);
    const t = ask(s0, 'right:A', ['pyth:A']).last;
    expect(t).toMatchObject({ kind: 'false', card: 'pyth:A' });
  });

  it('right at A only on the perpendicular at A: C(−1 ; 3) and C(1 ; −3) are accepted', () => {
    for (const [x, y] of [[-1, 3], [1, -3]]) {
      const s = ask(at(s0, x, y), 'right:A', ['pyth:A']);
      expect(s.last.kind, `${x};${y}`).toBe('ok');
      expect(s.solved['right:A']).toBe(true);
    }
    // l'ensemble des nœuds acceptés est la perpendiculaire en A (invariant) — balayé sur tout le cadre
    const ok = [];
    for (let x = Math.ceil(s0.win.xMin); x <= Math.floor(s0.win.xMax); x += 1) {
      for (let y = Math.ceil(s0.win.yMin); y <= Math.floor(s0.win.yMax); y += 1) {
        const s = at(s0, x, y);
        if (L.xy(s.pts.C).join() !== `${x},${y}`) continue;
        if (L.judge(L.toggleCard(s, 'pyth:A'), 'right:A').kind === 'ok') ok.push([x, y]);
      }
    }
    expect(ok.length).toBeGreaterThanOrEqual(2);
    for (const [x, y] of ok) expect(3 * x + 1 * y).toBe(0);
  });

  it('the wrong side alone is refused (watar), even when that card balances', () => {
    // C(2 ; 4) : rectangle en B (3x + y = 10) — la carte du sommet B s'équilibre, mais elle ne prouve pas « قائم في A »
    const s = ask(at(s0, 2, 4), 'right:A', ['pyth:B']);
    expect(s.last).toMatchObject({ kind: 'watar', decides: 'B', balanced: true });
    expect(L.truth(at(s0, 2, 4), 'right:B')).toBe(true);
  });

  it('isosceles with apex C on 3x + y = 5; the apex-A card is refused; no card → refused', () => {
    expect(ask(at(s0, 0, 5), 'iso:C', ['iso:C']).last.kind).toBe('ok');
    expect(ask(at(s0, 1, 2), 'iso:C', ['iso:C']).last.kind).toBe('ok');
    expect(ask(at(s0, 1, 2), 'iso:C', ['iso:A']).last).toMatchObject({ kind: 'apex', decides: 'A' });
    expect(ask(at(s0, 1, 2), 'iso:C', []).last.kind).toBe('noCard');
    // les cartes présentées suivent la famille de l'affirmation ; une carte d'une autre famille ne s'ajoute pas
    expect(L.shownCards(L.setClaim(s0, 'right:A'))).toEqual(['pyth:A', 'pyth:B', 'pyth:C']);
    expect(L.shownCards(L.setClaim(s0, 'iso:C'))).toEqual(['iso:A', 'iso:B', 'iso:C']);
    expect(L.toggleCard(L.setClaim(s0, 'right:A'), 'iso:A').picked).toEqual([]);
    expect(L.setClaim(L.toggleCard(L.setClaim(s0, 'right:A'), 'pyth:A'), 'iso:C').picked).toEqual([]);
    expect(L.judge(at(s0, 1, 2), 'right:A', ['iso:A'])).toMatchObject({ kind: 'missing', need: 'pyth:A' });
  });

  it('C cannot sit on A or B; a flat triangle is refused', () => {
    expect(L.xy(at(s0, 0, 0).pts.C)).toEqual([-1, 2]);
    // (−3 ; −1) est sur (AB) : y = x/3
    const flat = at(s0, -3, -1);
    expect(L.isFlat(flat)).toBe(true);
    expect(ask(flat, 'iso:C', ['iso:C']).last.kind).toBe('flat');
  });

  it('discovery needs both goals AND a refusal (the contrast)', () => {
    let s = ask(at(s0, -1, 3), 'right:A', ['pyth:A']);
    s = ask(at(s, 0, 5), 'iso:C', ['iso:C']);
    expect(L.stageDone(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(false);
    s = ask(at(s, 1, 1), 'iso:C', []);
    expect(L.discoveryReady(s)).toBe(true);
  });
});

describe('shape-prover — متقدم (طرائق p. 145 : C(−2 ; y), puis le carré et le cercle)', () => {
  const s0 = L.init(advanced.numbers);

  it('C slides on x = −2 only; y = −4 is the only right angle in B on the rail (the textbook answer)', () => {
    expect(L.railSolutions(s0)).toEqual([-4]);
    expect(L.xy(at(s0, 3, -1).pts.C)).toEqual([-2, -1]);
    expect(L.xy(at(s0, -2, -9).pts.C)).toEqual([-2, -5]);
    const s = at(s0, -2, -4);
    const c = L.card(s, 'pyth:B');
    // AB² + BC² = 20 + 20 = 40 = AC²
    expect([num(c.parts[0]), num(c.parts[1]), num(c.right)]).toEqual([20, 20, 40]);
    expect(ask(s, 'right:B', ['pyth:B']).last.kind).toBe('ok');
    expect(ask(s, 'right:B', ['pyth:A']).last).toMatchObject({ kind: 'watar', decides: 'A' });
    // le départ y = 4 : isocèle en B, pas droit
    expect(ask(s0, 'right:B', ['pyth:B']).last.kind).toBe('false');
    expect(L.isFlat(at(s0, -2, 1))).toBe(true);
  });

  it('the gap AC² − (AB² + BC²) changes by 4 at each step of y: the y² cancels (first degree)', () => {
    const gaps = [];
    for (let y = -5; y <= 4; y += 1) {
      const c = L.card(at(s0, -2, y), 'pyth:B');
      gaps.push(num(c.right) - num(c.left));
    }
    for (let i = 1; i < gaps.length; i += 1) expect(gaps[i] - gaps[i - 1]).toBe(-4);
  });

  it('the quad stage opens only after the proof, with C kept at (−2 ; −4)', () => {
    expect(L.openQuad(s0)).toBe(s0);
    let s = ask(at(s0, -2, -4), 'right:B', ['pyth:B']);
    s = at(s, -2, 0); // l'élève bouge C après la preuve
    s = L.openQuad(s);
    expect(s.stage).toBe('quad');
    expect(s.held).toBe('D');
    expect(L.xy(s.pts.C)).toEqual([-2, -4]);
    expect(L.xy(s.pts.D)).toEqual([2, 2]);
    expect(L.backToTri(s).stage).toBe('tri');
  });

  it('D(2 ; 2): equal diagonals alone are not enough; D(2 ; −2): the square, the ladder of evidence', () => {
    let s = L.openQuad(ask(at(s0, -2, -4), 'right:B', ['pyth:B']));
    expect(L.card(s, 'diag').balanced).toBe(true); // 40 = 40 au départ : le piège
    expect(ask(s, 'rect', ['diag']).last).toMatchObject({ kind: 'missing', need: 'para' });
    expect(ask(s, 'rect', ['vec', 'diag']).last).toMatchObject({ kind: 'false', card: 'vec' });
    s = at(s, 2, -2);
    expect(V.quadNature(s.pts.A, s.pts.B, s.pts.C, s.pts.D)).toBe('square');
    expect(ask(s, 'square', ['vec']).last).toMatchObject({ kind: 'missing', need: 'diag' });
    expect(ask(s, 'rect', ['vec']).last).toMatchObject({ kind: 'missing', need: 'diag' });
    expect(ask(s, 'square', ['vec', 'diag']).last).toMatchObject({ kind: 'missing', need: 'side' });
    expect(ask(s, 'square', ['mid', 'diag', 'side']).last.kind).toBe('ok');
    expect(ask(s, 'para', ['mid']).last.kind).toBe('ok');
    const c = L.card(s, 'circ');
    expect(L.xy(c.center)).toEqual([-1, -1]);
    expect([num(c.parts[0]), num(c.parts[1]), num(c.right)]).toEqual([10, 10, 10]);
    expect(ask(s, 'circle', ['circ']).last.kind).toBe('ok');
    expect(ask(at(s, 1, -2), 'circle', ['circ']).last).toMatchObject({ kind: 'false', card: 'circ' });
  });

  it('discovery: the right angle, the square and the circle, with a contrast', () => {
    let s = L.openQuad(ask(at(s0, -2, -4), 'right:B', ['pyth:B']));
    s = at(s, 2, -2);
    s = ask(s, 'square', ['vec', 'diag', 'side']);
    s = ask(s, 'circle', ['circ']);
    expect(L.discoveryReady(s)).toBe(false);
    s = ask(s, 'rect', ['vec', 'diag']);
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('every frame stays in the scene; the window is near-square', () => {
    for (const s of [L.init(beginner.numbers), s0]) {
      const w = s.win;
      const r = (w.xMax - w.xMin) / (w.yMax - w.yMin);
      expect(r).toBeGreaterThan(0.85);
      expect(r).toBeLessThan(1.18);
      for (const width of [260, 320, 640]) {
        const fr = L.frame(s, { width, height: 300 });
        for (const p of Object.values(s.pts)) {
          const [x, y] = fr.P(p);
          expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(width);
          expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(300);
        }
      }
    }
  });

  it('evidence of a trial carries the numbers of the card it was judged on', () => {
    const s = ask(L.init(beginner.numbers), 'right:A', ['pyth:A']);
    expect(L.evidenceOf(s)).toMatchObject({ kind: 'false', claim: 'right:A', card: 'pyth:A', values: [15, 17] });
  });
});
