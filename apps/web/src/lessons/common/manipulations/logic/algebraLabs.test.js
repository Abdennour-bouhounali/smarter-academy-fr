import { describe, it, expect } from 'vitest';
import * as PE from './pitchExpansion';
import * as TF from './turfFactoring';

/** Porte toutes les zones, dans l'ordre de la grille. */
const collectAll = (s) => s.cells.reduce((acc, c) => PE.collect(acc, c.id), s);
/** Fusionne tous les semblables, deux à deux. */
function simplifyAll(s) {
  let cur = s;
  for (;;) {
    const pair = cur.tray.flatMap((a, i) => cur.tray.slice(i + 1).map((b) => [a, b])).find(([a, b]) => a.term.p === b.term.p);
    if (!pair) return cur;
    cur = PE.merge(cur, pair[0].id, pair[1].id);
  }
}

describe('pitch-expansion — le terrain découpé', () => {
  it('lit les facteurs du manuel et leur nature', () => {
    expect(PE.kindOf(PE.parseExpr('3|x+5'))).toBe('distributive');
    expect(PE.kindOf(PE.parseExpr('3x-1|3+x'))).toBe('double');       // نشاط 1، س 3
    expect(PE.kindOf(PE.parseExpr('x+3'))).toBe('square-sum');
    expect(PE.kindOf(PE.parseExpr('x-2'))).toBe('square-diff');
    expect(PE.kindOf(PE.parseExpr('x+3|x-3'))).toBe('sum-diff');
  });

  it('(3x − 1)(3 + x) : les quatre zones, puis 3x² + 8x − 3 après réduction', () => {
    let s = collectAll(PE.init({ expr: '3x-1|3+x' }));
    expect(PE.trayTex(s)).toBe('9x + 3x^2 - 3 - x');
    s = simplifyAll(s);
    expect(PE.isSimplified(s)).toBe(true);
    expect(PE.trayIsExpansion(s)).toBe(true);
    expect(PE.resultTex(s)).toBe('3x^2 + 8x - 3');
  });

  it('refuse de fusionner deux termes non semblables, et deux semblables opposés s’annulent', () => {
    let s = collectAll(PE.init({ expr: 'x+3|x-3' }));
    const [sq, a, b] = s.tray;
    expect(PE.canMerge(s, sq.id, a.id)).toBe('notLike');
    s = PE.merge(s, a.id, b.id);                       // −3x + 3x = 0
    expect(s.tray.map((c) => c.term)).toEqual([{ c: 1, p: 2 }, { c: -9, p: 0 }]);
    expect(PE.resultTex(s)).toBe('x^2 - 9');
  });

  it('résistance : une zone oubliée rend la somme fausse, et la vérification le montre', () => {
    let s = PE.init({ expr: 'x+3' });
    s = PE.collect(PE.collect(s, '0-0'), '1-1');       // x² + 9 : « l'erreur » (a + b)² = a² + b²
    s = PE.verify(s, 4);
    expect(s.trials[0]).toMatchObject({ x: 4, ok: false, product: 49, sum: 25, missing: ['0-1', '1-0'] });
    expect(PE.discoveryReady(s)).toBe(false);
  });

  it('une seule valeur de x ne suffit pas : la découverte exige deux valeurs vérifiées', () => {
    let s = simplifyAll(collectAll(PE.init({ expr: 'x+3' })));
    s = PE.verify(s, 2);
    expect(PE.discoveryReady(s)).toBe(false);
    s = PE.verify(s, 5);
    expect(PE.discoveryReady(s)).toBe(true);
  });

  it('sans réduction demandée (simplify: false), la fusion est refusée « notYet »', () => {
    const s = collectAll(PE.init({ expr: '3|x+5', simplify: false }));
    expect(PE.canMerge(s, s.tray[0].id, s.tray[1].id)).toBe('notYet');
  });

  it('balayage géométrique : les zones signées couvrent exactement l’aire du terrain, pour chaque x de la règle', () => {
    for (const expr of ['3|x+5', '3x-1|3+x', 'x+3', 'x-2', 'x+3|x-3', '2x+1', 'x+10+x', '5-2x|5-2x']) {
      const s = PE.init({ expr });
      const { min, max } = PE.xRange(s.factors);
      for (let x = min; x <= max; x++) {
        const z = PE.zones(s, x);
        const signed = z.zones.reduce((acc, zone) => acc + zone.area, 0);
        expect(signed, `${expr} x=${x}`).toBe(PE.product(s, x));
        expect(z.width * z.height, `${expr} x=${x}`).toBeGreaterThan(0);
        for (const zone of z.zones) {
          expect(zone.x0 + zone.w).toBeLessThanOrEqual(z.width + 1e-9);
          expect(zone.y0 + zone.h).toBeLessThanOrEqual(z.height + 1e-9);
          expect(Math.abs(zone.area)).toBe(zone.w * zone.h);
        }
      }
    }
  });

  it('la règle commence à la première valeur qui dessine les deux côtés', () => {
    expect(PE.xRange(PE.parseExpr('x-2')).min).toBe(3);
    expect(PE.xRange(PE.parseExpr('x+3|x-3')).min).toBe(4);
    expect(PE.xRange(PE.parseExpr('5-2x|5-2x'))).toEqual({ min: 1, max: 2 }); // dessiné tant que 2x < 5
    expect(() => PE.xRange(PE.parseExpr('1-x|x+2'))).toThrow();
  });
});

describe('turf-factoring — le terrain en gazon', () => {
  it('rows 6x² + 4x (معارف 3) : 2 rangées donnent 2x(3x + 2), 3 rangées refusent', () => {
    let s = TF.initRows({ expr: '6x^2+4x' });
    expect(TF.rowsGcd(s)).toBe(2);
    s = TF.setRows(s, 3);
    expect(TF.rowsLayout(s, 3)).toMatchObject({ valid: false, leftover: [{ c: 1, p: 1 }] });
    s = TF.setRows(s, 2);
    expect(TF.rowsEquationTex(s, 2)).toBe('6x^2 + 4x = 2x(3x + 2)');
    expect(TF.rowsDiscoveryReady(s)).toBe(true);
  });

  it('rows 9x + 3 (نشاط 3) : 3 rangées de hauteur 1 → 3(3x + 1)', () => {
    let s = TF.initRows({ expr: '9x+3' });
    expect(s.m).toBe(0);
    s = TF.setRows(TF.setRows(s, 2), 3);
    expect(TF.rowsEquationTex(s, 3)).toBe('9x + 3 = 3(3x + 1)');
    expect(TF.rowsDiscoveryReady(s)).toBe(true);
  });

  it('rows 7x − 21 (تمرين 23) : les plaques retranchées se répartissent aussi → 7(x − 3)', () => {
    const s = TF.initRows({ expr: '7x-21' });
    expect(TF.rowsEquationTex(s, 7)).toBe('7x - 21 = 7(x - 3)');
  });

  it('rows : la découverte exige le PGCD ET un refus — un r juste mais pas le plus grand ne suffit pas', () => {
    let s = TF.initRows({ expr: '12x+18' });
    s = TF.setRows(TF.setRows(s, 4), 2);
    expect(TF.rowsDiscoveryReady(s)).toBe(false);
    s = TF.setRows(s, 6);
    expect(TF.rowsDiscoveryReady(s)).toBe(true);
  });

  it('rows : balayage — chaque r juste reconstitue exactement la somme', () => {
    for (const expr of ['6x^2+4x', '9x+3', '2x+6', '7x-21', 'x^2-3x', 'x^2-5x', '12x+18']) {
      const s = TF.initRows({ expr });
      const { min, max } = TF.rowsRange(s);
      for (let r = min; r <= max; r++) {
        const l = TF.rowsLayout(s, r);
        const rebuilt = s.terms.map((t, k) => r * l.perRow[k].c + (l.leftover.find((u) => u.p === t.p)?.c ?? 0));
        expect(rebuilt).toEqual(s.terms.map((t) => t.c));
        expect(l.valid).toBe(s.terms.every((t) => t.c % r === 0));
      }
    }
  });

  it('square x² + 6x + 9 (نشاط 3) : 2 | 4 exige 8 carreaux et refuse ; 3 | 3 ferme (x + 3)²', () => {
    let s = TF.initSquare({ b: 6, c: 9 });
    expect(TF.canClose(s)).toBe('stripsLeft');
    for (let k = 0; k < 2; k++) s = TF.place(s, 'stock', 'right');
    for (let k = 0; k < 4; k++) s = TF.place(s, 'stock', 'bottom');
    expect(TF.cornerNeed(s)).toBe(8);
    s = TF.close(s);
    expect(s.closed).toBe(null);
    expect(TF.canClose(s)).toBe('cornerExtra');
    s = TF.close(TF.place(s, 'bottom', 'right'));
    expect(s.closed).toEqual({ p: 3, q: 3 });
    expect(TF.squareEquationTex(s)).toBe('x^2 + 6x + 9 = (x + 3)^2');
    expect(TF.squareDiscoveryReady(s)).toBe(true);
  });

  it('square x² + 25 (QCM 9) ne se ferme jamais : « لا تقبل تحليلا »', () => {
    let s = TF.initSquare({ b: 0, c: 25 });
    expect(TF.closable(s)).toBe(false);
    expect(TF.canClose(s)).toBe('cornerExtra');   // 25 carreaux, un coin de 0 × 0
    s = TF.close(s);
    expect(s.closed).toBe(null);
    expect(TF.squareDiscoveryReady(s)).toBe(true);
  });

  it('square : balayage — le terrain ferme exactement quand c = p × (b − p)', () => {
    for (const [b, c] of [[6, 9], [10, 25], [4, 4], [8, 16], [0, 25], [2, 1], [6, 8]]) {
      for (let p = 0; p <= b; p++) {
        let s = TF.initSquare({ b, c });
        for (let k = 0; k < p; k++) s = TF.place(s, 'stock', 'right');
        for (let k = 0; k < b - p; k++) s = TF.place(s, 'stock', 'bottom');
        expect(TF.canClose(s) === true).toBe(p * (b - p) === c);
      }
    }
  });
});

describe('défaut et balayage (2026-10-09)', () => {
  it('turf rows : le r de départ n\'est pas un r qui convient, et n\'entre pas dans tried', async () => {
    const T = await import('./turfFactoring');
    for (const expr of ['6x^2+4x', '9x+3', '7x-21', '12x+18']) {
      const s = T.initRows({ expr });
      const r = T.defaultRows(s);
      expect(T.rowsLayout(s, r).valid).toBe(false);
      expect(s.tried).toHaveLength(0);
      let n = s;
      for (const v of T.untriedRows(s)) n = T.setRows(n, v);
      expect(T.untriedRows(n)).toHaveLength(0);
      expect(T.rowsDiscoveryReady(n)).toBe(true);
    }
    expect(T.untriedRows(T.initSquare({ b: 6, c: 9 }))).toHaveLength(0);
  });
  it('pitch : balayage de x seulement quand la somme est construite', async () => {
    const P = await import('./pitchExpansion');
    let s = P.init({ expr: '3x-1|3+x', simplify: true });
    const range = P.xRange(s.factors, 5);
    expect(P.untriedXs(s, range)).toHaveLength(0);
    for (const c of s.cells) s = P.collect(s, c.id);
    while (!P.isSimplified(s)) {
      const a = s.tray.find((u, i) => s.tray.some((v, j) => j !== i && v.term.p === u.term.p));
      const b = s.tray.find((v) => v !== a && v.term.p === a.term.p);
      s = P.merge(s, a.id, b.id);
    }
    const todo = P.untriedXs(s, range);
    expect(todo.length).toBe(range.max - range.min + 1);
    for (const x of todo) s = P.verify(s, x);
    expect(P.untriedXs(s, range)).toHaveLength(0);
    expect(P.discoveryReady(s)).toBe(true);
  });
});
