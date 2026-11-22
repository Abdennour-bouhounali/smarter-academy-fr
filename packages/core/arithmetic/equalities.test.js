import { describe, it, expect } from 'vitest';
import * as E from './equalities.js';
import * as Lin from './linear.js';

const e0 = E.eqn('3', '2x-4', '7/2');

describe('égalités : les opérations sur les deux membres', () => {
  it('la donnée du manuel : 3 = 2x − 4 vraie pour x = 7/2, et ses conséquences', () => {
    expect(E.holds(e0)).toBe(true);
    const sub1 = E.applyOp(e0, 'add', -1);
    expect(E.eqTex(sub1.eq)).toBe('2 = 2x - 5');
    expect(E.holds(sub1.eq)).toBe(true);
    expect(E.eqTex(E.applyOp(e0, 'add', 8).eq)).toBe('11 = 2x + 4');
    expect(E.eqTex(E.applyOp(e0, 'mul', 2).eq)).toBe('6 = 4x - 8');
    expect(E.eqTex(E.applyOp(e0, 'div', 2).eq)).toBe('\\dfrac{3}{2} = x - 2');
  });

  it('chaque opération légale garde l’égalité vraie : balayage de tous les nombres c de −9 à 9, quatre opérations, plusieurs égalités', () => {
    const starts = [e0, E.eqn('5', '-3x+1', '-4/3'), E.eqn('20', '3x+5', '5'), E.eqn('2x', '7', '7/2'), E.eqn('x/4', '3', '12')];
    for (const s of starts) {
      expect(E.holds(s)).toBe(true);
      for (const op of E.OPS) for (let c = -9; c <= 9; c += 1) {
        const r = E.applyOp(s, op, c);
        if (op === 'div' && c === 0) { expect(r.refused).toBe('zero'); continue; }
        expect(E.holds(r.eq), `${op} ${c}`).toBe(true);
        expect(r.broke).toBe(false);
      }
    }
  });

  it('un seul membre : l’égalité est cassée de exactement c (add) et jamais pour c = 0 ; × 0 perd l’information', () => {
    for (const who of ['left', 'right']) {
      for (let c = -9; c <= 9; c += 1) {
        const r = E.applyOp(e0, 'add', c, who);
        expect(r.broke, `${who} ${c}`).toBe(c !== 0);
        const v = E.values(r.eq);
        expect(Lin.eq(Lin.sub(v.left, v.right), who === 'left' ? c : -c)).toBe(true);
      }
    }
    const lost = E.applyOp(e0, 'mul', 0);
    expect(lost.lost).toBe(true);
    expect(E.holds(lost.eq)).toBe(true);
    expect(E.eqTex(lost.eq)).toBe('0 = 0');
  });

  it('une multiplication d’un seul côté casse l’égalité sauf quand la valeur est 0', () => {
    expect(E.applyOp(e0, 'mul', 2, 'left').broke).toBe(true);
    expect(E.applyOp(E.eqn('0', '2x', '0'), 'mul', 5, 'left').broke).toBe(false);
  });

  it('findOps trouve les tâches de la leçon en une ou deux opérations', () => {
    expect(E.findOps(e0, E.eqn('2', '2x-5', '7/2'))).toEqual([['add', -1]]);
    expect(E.findOps(e0, E.eqn('11', '2x+4', '7/2'))).toEqual([['add', 8]]);
    expect(E.findOps(e0, E.eqn('6', '4x-8', '7/2'))).toEqual([['mul', 2]]);
    expect(E.findOps(e0, E.eqn('3/2', 'x-2', '7/2'))).toEqual([['div', 2]]);
    const e1 = E.eqn('5', '-3x+1', '-4/3');
    expect(E.findOps(e1, E.chain(e1, [['mul', -2]]))).toEqual([['mul', -2]]);
    expect(E.findOps(e1, E.chain(e1, [['add', -1], ['div', -3]]))).toEqual([['add', -1], ['div', -3]]);
    expect(E.eqTex(E.chain(e1, [['add', -1], ['div', -3]]))).toBe('-\\dfrac{4}{3} = x');
    expect(E.findOps(e0, E.eqn('1', 'x', '7/2'), 1)).toBeNull();
  });

  it('une égalité fausse reste fausse : l’opération ne la répare pas', () => {
    const bad = E.eqn('2x+4', '-3', '7/2'); // 11 ≠ −3
    expect(E.holds(bad)).toBe(false);
    for (let c = -9; c <= 9; c += 1) expect(E.holds(E.applyOp(bad, 'add', c).eq)).toBe(false);
  });

  it('parseFreeNumber lit la virgule, les chiffres arabes et les fractions', () => {
    expect(Lin.fracText(E.parseFreeNumber('2,5'))).toBe('5/2');
    expect(Lin.fracText(E.parseFreeNumber('−3'))).toBe('-3');
    expect(Lin.fracText(E.parseFreeNumber('٧'))).toBe('7');
    expect(E.parseFreeNumber('abc')).toBeNull();
    expect(E.parseFreeNumber('250')).toBeNull();
  });

  it('trackFor contient 0 et toutes les valeurs', () => {
    for (const vals of [[3, 3], [-4, 6], [Lin.frac(-4, 3)], [100, 50], [-27, 27]]) {
      const t = E.trackFor(vals);
      for (const v of [0, ...vals]) expect(t.lo <= E.numFloat(v) && E.numFloat(v) <= t.hi).toBe(true);
      expect(t.step > 0).toBe(true);
    }
  });
});

describe('équations : traverser avec le signe, puis diviser', () => {
  const e = E.equation('9x+1', '5x-7');

  it('la solution unique est calculée : 9x + 1 = 5x − 7 → x = −2 ; sans solution unique → null', () => {
    expect(Lin.fracText(e.x)).toBe('-2');
    expect(E.equation('2x+1', '2x+5')).toBeNull();
    expect(E.equation('2x+2', '2x+2')).toBeNull();
    expect(E.parseEquation('4x - 3 = 2x + 7').x).toEqual(Lin.frac(5));
    expect(E.parseEquation('abc')).toBeNull();
    expect(E.parseEquation('1 = 2 = 3')).toBeNull();
  });

  it('une caisse qui traverse en CHANGEANT de signe garde l’égalité vraie ; sans changer, elle la casse', () => {
    const eqs = [e, E.equation('3x+2', 'x+8'), E.equation('-2x+5', '3x-10'), E.equation('7x-190', '6x+110')];
    for (const q of eqs) {
      expect(E.holds(q)).toBe(true);
      for (const c of E.crates(q)) {
        const flipped = E.moveTerm(q, c.side, c.kind, true);
        expect(flipped.ok, `${c.id} flip`).toBe(true);
        const kept = E.moveTerm(q, c.side, c.kind, false);
        expect(kept.ok, `${c.id} keep`).toBe(false);
      }
    }
  });

  it('les lignes du manuel : 9x + 1 − 5x = 5x − 7 − 5x, soit 4x + 1 = −7, puis 4x = −8, puis x = −2', () => {
    const a = E.moveTerm(e, 'R', 'x', true).eq;
    expect(E.eqTex(a)).toBe('4x + 1 = -7');
    expect(E.withTermTex(e.L, 'x', Lin.frac(-5))).toBe('9x + 1 - 5x');
    const b = E.moveTerm(a, 'L', 'n', true).eq;
    expect(E.eqTex(b)).toBe('4x = -8');
    expect(E.shapeOf(b)).toMatchObject({ side: 'L' });
    expect(E.isSolved(b)).toBe(false);
    const c = E.divideBoth(b, 4).eq;
    expect(E.eqTex(c)).toBe('x = -2');
    expect(E.isSolved(c)).toBe(true);
    expect(E.divideBoth(b, 0).refused).toBe('zero');
    const v = E.checkAt(e, '-2');
    expect(Lin.fracText(v.left)).toBe('-17');
    expect(Lin.fracText(v.right)).toBe('-17');
  });

  it('toute équation se résout par traversées puis division : balayage de ax + b = cx + d', () => {
    let n = 0;
    for (const a of [-5, -2, 1, 3, 7]) for (const c of [-3, 2, 4]) for (const b of [-6, 1, 4]) for (const d of [-8, 5, 9]) {
      if (a === c) continue;
      const q = E.equation(`${a}x${b < 0 ? '' : '+'}${b}`, `${c}x${d < 0 ? '' : '+'}${d}`);
      if (!q) continue;
      let cur = q;
      for (let g = 0; g < 8 && !E.shapeOf(cur); g += 1) {
        const cr = E.crates(cur);
        const xr = cr.find((k) => k.kind === 'x' && k.side === 'R');
        const nl = cr.find((k) => k.kind === 'n' && k.side === 'L');
        const pick = xr ?? nl;
        cur = E.moveTerm(cur, pick.side, pick.kind, true).eq;
      }
      const s = E.shapeOf(cur);
      expect(s).not.toBeNull();
      const done = E.divideBoth(cur, Lin.toNumber(s.a) === Math.round(Lin.toNumber(s.a)) ? Math.round(Lin.toNumber(s.a)) : s.a).eq;
      expect(E.isSolved(done)).toBe(true);
      expect(Lin.eq(Lin.linAt(done.L, q.x), Lin.linAt(done.R, q.x))).toBe(true);
      n += 1;
    }
    expect(n).toBeGreaterThan(100);
  });
});
