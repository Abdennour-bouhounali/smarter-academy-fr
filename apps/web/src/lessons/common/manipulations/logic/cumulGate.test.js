import { describe, it, expect } from 'vitest';
import * as L from './cumulGate';

/**
 * cumul-gate — la logique RÉELLE du lab (celle que stats/CumulGate.jsx importe), sur les deux niveaux :
 * 8 enfants du manège (120:2|130:3|140:2|150:1) et les 20 tailles du نشاط 1 (p. 92), dans l'ordre du manuel.
 */
const ACT1 = '160|165|154|157|159|154|157|165|160|159|165|159|160|154|160|159|157|160|157|159';
const GIVEN = 'up:154|up:157|up:165|down:154|down:160|down:165';

describe('cumul-gate — la série et la file', () => {
  it('lit les 20 tailles du manuel : 154 ×3, 157 ×4, 159 ×5, 160 ×5, 165 ×3, N = 20', () => {
    const s = L.init({ series: ACT1, mode: 'up|down|table', given: GIVEN });
    expect(s.values).toEqual([154, 157, 159, 160, 165]);
    expect(s.freqs).toEqual([3, 4, 5, 5, 3]);
    expect(s.N).toBe(20);
    expect(s.people.map((p) => p.v).slice(0, 3)).toEqual([160, 165, 154]); // l'ordre du manuel, non rangé
    expect(s.sorted).toBe(false);
  });

  it('une série « v:f » devient une file non rangée qui garde les effectifs', () => {
    const s = L.init({ series: '120:2|130:3|140:2|150:1' });
    const vs = s.people.map((p) => p.v);
    expect([...vs].sort((a, b) => a - b)).toEqual([120, 120, 130, 130, 130, 140, 140, 150]);
    expect(vs).not.toEqual([...vs].sort((a, b) => a - b));
    expect(L.rangeOf(s)).toEqual({ min: 117, max: 153 });
  });

  it('ranger la file : croissante, et les allumés forment un bloc contigu', () => {
    const s = L.sortQueue(L.init({ series: ACT1 }));
    const vs = s.people.map((p) => p.v);
    expect(vs).toEqual([...vs].sort((a, b) => a - b));
    for (let t = 151; t <= 168; t += 1) {
      for (const side of L.SIDES) {
        const lit = vs.map((v) => L.isLit(v, t, side));
        const first = lit.indexOf(true);
        const lastI = lit.lastIndexOf(true);
        if (first >= 0) expect(lit.slice(first, lastI + 1).every(Boolean), `${t} ${side}`).toBe(true);
        expect(lit.filter(Boolean).length).toBe(L.count(s, t, side));
      }
    }
  });

  it('refuse un contenu défectueux', () => {
    expect(() => L.init({ series: '' })).toThrow();
    expect(() => L.init({ series: '8,5|9' })).toThrow();
    expect(() => L.init({ series: '1:2|3' })).toThrow();
    expect(() => L.init({ series: '1|2', mode: 'up' })).toThrow();
    expect(() => L.init({ series: '1|2', given: 'up:5' })).toThrow();
  });
});

describe('cumul-gate — compter à la porte (la résistance)', () => {
  const s0 = L.init({ series: ACT1, mode: 'up|down|table', given: GIVEN });

  it('« 159cm على الأقل » = 13, « 160cm على الأكثر » = 17 (les réponses du manuel)', () => {
    expect(L.count(s0, 159, 'down')).toBe(13);
    expect(L.count(s0, 160, 'up')).toBe(17);
    const s = L.claim(L.claim(s0, 159, 'down', '13'), 160, 'up', '١٧');
    expect(s.claims).toHaveLength(2);
    expect(s.cells.down[159]).toBe(13);
    expect(s.cells.up[160]).toBe(17);
    expect(s.last.groups.map((g) => g.f)).toEqual([3, 4, 5, 5]);
  });

  it('les colonnes du tableau sont celles du manuel : 3, 7, 12, 17, 20 et 20, 17, 13, 8, 3', () => {
    expect(L.expectedColumns(s0)).toEqual({ up: [3, 7, 12, 17, 20], down: [20, 17, 13, 8, 3] });
    let s = s0;
    for (const v of s0.values) for (const side of L.SIDES) s = L.claim(s, v, side, String(L.count(s0, v, side)));
    expect(L.tableComplete(s)).toBe(true);
    expect(L.tableRows(s).map((r) => [r.up, r.down])).toEqual([[3, 20], [7, 17], [12, 13], [17, 8], [20, 3]]);
    expect(L.tableComplete(s0)).toBe(false);
    expect(L.tableRows(s0)[0]).toMatchObject({ up: 3, down: 20, givenUp: true, givenDown: true });
  });

  it('oublier ceux qui ont EXACTEMENT t est reconnu (« strict »), avec leur effectif', () => {
    const s = L.claim(s0, 159, 'down', '8');
    expect(s.last).toMatchObject({ kind: 'strict', want: 13, f: 5 });
    expect(s.claims).toHaveLength(0);
    expect(L.claim(s0, 160, 'up', '12').last.kind).toBe('strict');
  });

  it('compter l’autre côté, trop, trop peu ; saisie illisible ; pas de seuil', () => {
    expect(L.claim(s0, 160, 'up', '8').last.kind).toBe('otherSide');
    expect(L.claim(s0, 160, 'up', '3').last.kind).toBe('under');
    expect(L.claim(s0, 160, 'up', '19').last.kind).toBe('over');
    expect(L.claim(s0, 160, 'up', 'abc').last.kind).toBe('syntax');
    expect(L.claim(s0, null, 'up', '3').last.kind).toBe('noT');
  });

  it('un seuil hors série est un palier : 158 compte comme 157, sans case de tableau', () => {
    expect(L.count(s0, 158, 'up')).toBe(L.count(s0, 157, 'up'));
    const s = L.claim(s0, 158, 'up', '7');
    expect(s.last).toMatchObject({ kind: 'ok', value: false });
    expect(s.cells.up[158]).toBeUndefined();
  });
});

describe('cumul-gate — la découverte : la même valeur comptée des deux côtés', () => {
  const s0 = L.init({ series: ACT1, mode: 'up|down|table' });

  it('s’ouvre seulement quand une VALEUR de la série est comptée des deux côtés', () => {
    let s = L.claim(s0, 159, 'down', '13');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.claim(s, 158, 'up', '7');
    s = L.claim(s, 158, 'down', '13');
    expect(L.discoveryReady(s)).toBe(false); // 158 n'est pas une valeur : up + down = N
    s = L.claim(s, 159, 'up', '12');
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.discoveryT(s)).toBe(159);
    expect(L.invariantAt(s, 159)).toEqual({ t: 159, up: 12, down: 13, N: 20, f: 5 });
    expect(L.unequalPair(s)).toMatchObject({ up: 7, down: 13 });
  });

  it('up(t) + down(t) = N + f(t) pour tout t de la toise, aux deux niveaux', () => {
    for (const series of [ACT1, '120:2|130:3|140:2|150:1']) {
      const s = L.init({ series });
      const { min, max } = L.rangeOf(s);
      for (let t = min; t <= max; t += 1) {
        const inv = L.invariantAt(s, t);
        expect(inv.up + inv.down, `${series} ${t}`).toBe(inv.N + inv.f);
      }
      expect(L.count(s, Math.max(...s.values), 'up')).toBe(s.N);
      expect(L.count(s, Math.min(...s.values), 'down')).toBe(s.N);
    }
  });
});

describe('cumul-gate — le bloc quasi carré et les tailles dessinées', () => {
  it('20 → 5 × 4, 8 → 3 × 3 sur une scène carrée ; |rows − cols| ≤ 1', () => {
    expect(L.blockLayout(20, 1)).toEqual({ cols: 5, rows: 4 });
    expect(L.blockLayout(8, 1)).toEqual({ cols: 3, rows: 3 });
    for (let n = 1; n <= 40; n += 1) {
      const { cols, rows } = L.blockLayout(n, 1);
      expect(cols * rows).toBeGreaterThanOrEqual(n);
      expect(Math.abs(rows - cols), String(n)).toBeLessThanOrEqual(1);
    }
  });

  it('la hauteur dessinée croît avec la taille : la plus grande à 1, la plus petite à 0,6', () => {
    const vs = [154, 157, 159, 160, 165];
    const sc = vs.map((v) => L.figureScale(v, vs));
    for (let i = 1; i < sc.length; i += 1) expect(sc[i]).toBeGreaterThan(sc[i - 1]);
    expect(sc[4]).toBe(1);
    expect(sc[0]).toBeCloseTo(0.6, 5);
    expect(L.figureScale(5, [5, 5])).toBe(1);
  });
});
