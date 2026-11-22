import { describe, it, expect } from 'vitest';
import * as L from './lineCrossing';

/**
 * line-crossing — la logique pure, sur les nombres du manuel (نشاط 5 : 43 pièces, 5000DA → (36 ; 7))
 * et ceux de la plateforme (2x − y = 1 et x + y = 5 → (2 ; 3) ; x + y = 3 et 2x − y = 0 → (1 ; 2)).
 */
const ACT5 = { system: 'x+y=43|100x+200y=5000', cases: 'true' };
const BEG = { system: '2x-y=1|x+y=5' };
const t = (p) => L.numText(p);

const buildAll = (s) => {
  let st = s;
  for (const i of [0, 1]) st = L.choose(st, i, st.cands[i].findIndex((c) => c.ok));
  return st;
};

describe('line-crossing — les cartes « y = … »', () => {
  it('نشاط 5 : x + y = 43 ⇔ y = −x + 43 et 100x + 200y = 5000 ⇔ y = −x/2 + 25 (la carte juste existe, une seule)', () => {
    const s = L.init(ACT5);
    expect(s.cands[0].filter((c) => c.ok)).toHaveLength(1);
    expect(L.candTex(s.cands[0].find((c) => c.ok))).toBe('y = -x + 43');
    expect(L.candTex(s.cands[1].find((c) => c.ok))).toBe('y = -\\dfrac{1}{2}x + 25');
    for (const cs of s.cands) {
      expect(cs.length).toBe(4);
      const keys = cs.map((c) => `${t(c.m)}|${t(c.p)}`);
      expect(new Set(keys).size).toBe(4);
    }
    // la division oubliée : y = −100x + 5000
    expect(s.cands[1].some((c) => c.kind === 'noDivide' && t(c.m) === '-100' && t(c.p) === '5000')).toBe(true);
  });

  it('une carte fausse est refusée avec un témoin exact (x = 0 pour un signe du terme constant)', () => {
    let s = L.init(ACT5);
    const k = s.cands[0].findIndex((c) => c.kind === 'signC');
    s = L.choose(s, 0, k);
    expect(s.built[0]).toBe(false);
    expect(s.last.kind).toBe('wrongForm');
    const w = s.last.witness;
    expect(t(w.x)).toBe('0');
    expect(t(w.y)).toBe('-43');
    expect(t(w.left)).toBe('-43');
    expect(t(w.c)).toBe('43');
    expect(L.substTex(s.eqs[0], w.x, w.y)).toBe('0 + (-43) = -43 \\neq 43');
  });

  it('une erreur de pente seule est réfutée en x = 1 (la carte a le bon terme constant)', () => {
    const s = L.init(ACT5);
    const c = s.cands[0].find((x) => x.kind === 'signX');
    const w = L.witnessFor(s.eqs[0], c);
    expect(t(w.x)).toBe('1');
    expect(t(w.y)).toBe('44');
  });

  it('les deux cartes justes tracent les deux droites et ouvrent l’étape du point', () => {
    const s = buildAll(L.init(ACT5));
    expect(s.built).toEqual([true, true]);
    expect(s.stage).toBe('probe');
    expect(L.lineTex(s.lines[1])).toBe('y = -\\dfrac{1}{2}x + 25');
  });

  it('la carte juste n’est pas toujours la première', () => {
    const firsts = ['x+y=43|100x+200y=5000', '2x-y=1|x+y=5', 'x+y=3|2x-y=0', '3x+2y=8|x-y=1']
      .flatMap((sys) => L.init({ system: sys }).cands.map((cs) => cs.findIndex((c) => c.ok)));
    expect(new Set(firsts).size).toBeGreaterThan(1);
  });
});

describe('line-crossing — le point P et ses deux lampes', () => {
  it('(36 ; 7) allume les deux lampes ; (40 ; 3) seulement la (1) ; (30 ; 10) seulement la (2)', () => {
    const s = buildAll(L.init(ACT5));
    expect(L.lampsAt(s, 36, 7)).toEqual([true, true]);
    expect(L.lampsAt(s, 40, 3)).toEqual([true, false]);
    expect(L.lampsAt(s, 30, 10)).toEqual([false, true]);
    expect(L.lampsAt(s, 7, 36)).toEqual([true, false]); // la ثنائية inversée : sur (1) seulement
    expect(L.substTex(s.eqs[1], 36, 7)).toBe('100 \\times 36 + 200 \\times 7 = 5000');
    expect(L.substTex(s.eqs[1], 7, 36)).toBe('100 \\times 7 + 200 \\times 36 = 7900 \\neq 5000');
  });

  it('la découverte (sans cas) demande un essai à une lampe ET le point aux deux lampes', () => {
    let s = buildAll(L.init(BEG));
    s = L.place(s, 2, 3);
    expect(s.last.kind).toBe('both');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.place(s, 0, 5);
    expect(s.last.kind).toBe('one');
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('aucun point n’est posé avant que les deux droites soient tracées', () => {
    const s = L.init(BEG);
    expect(L.place(s, 2, 3)).toBe(s);
  });
});

describe('line-crossing — les trois cas (la seconde droite tenue)', () => {
  it('les cas ne s’ouvrent qu’après le point commun ; parallèles, confondues, sécantes', () => {
    let s = buildAll(L.init(ACT5));
    expect(L.canOpenCases(s)).toBe(false);
    s = L.place(s, 36, 7);
    s = L.openCases(s);
    expect(s.stage).toBe('cases');
    s = L.hold(s, -1, 20);
    expect(s.last.rel).toBe('parallel');
    // aucune lampe double possible : un point de (1) n'est pas sur la parallèle
    expect(L.lampsAt(s, 23, 20)).toEqual([true, false]);
    s = L.hold(s, -1, 43);
    expect(s.last.rel).toBe('same');
    expect(L.lampsAt(s, 10, 33)).toEqual([true, true]);
    expect(L.lampsAt(s, 40, 3)).toEqual([true, true]);
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('une intersection hors des nœuds est dite : la lecture graphique est approchée', () => {
    let s = buildAll(L.init(ACT5));
    s = L.openCases(L.place(s, 36, 7));
    s = L.hold(s, '-1/2', 24);
    expect(s.last.rel).toBe('unique');
    expect(t(s.last.x)).toBe('38');
    expect(s.last.grid).toBe(true);
    s = L.hold(s, 1, 0);
    expect(t(s.last.x)).toBe('21,5');
    expect(s.last.grid).toBe(false);
    expect(L.approxNum(s.last.x)).toBe('21,5');
  });

  it('startWith="cases" ouvre directement sur la seconde droite tenue', () => {
    const s = L.init({ system: 'x+y=3|2x-y=0', startWith: 'cases' });
    expect(s.stage).toBe('cases');
    expect(s.built).toEqual([true, true]);
    expect(L.relationNow(s).kind).toBe('unique');
    const r = L.mRange(s);
    expect(L.mAt(s, r.min) <= -1 || L.numText(L.mAt(s, r.min)).startsWith('-')).toBe(true);
    expect(L.mIndex(s, -1)).toBeGreaterThanOrEqual(r.min);
  });
});

describe('line-crossing — fenêtre et géométrie', () => {
  it('le manuel : premier quadrant, (36 ; 7), 43 et 50 dans la fenêtre', () => {
    const s = L.init(ACT5);
    expect(s.win.xMin).toBe(0);
    expect(s.win.yMin).toBe(0);
    expect(s.win.xMax).toBeGreaterThanOrEqual(50);
    expect(s.win.yMax).toBeGreaterThanOrEqual(43);
    expect(t(s.grid.label)).toBe('10');
  });

  it('les petits nombres : une marge d’une unité, une graduation par unité', () => {
    const s = L.init(BEG);
    expect(s.win).toEqual({ xMin: -1, xMax: 6, yMin: -2, yMax: 6 });
    expect(t(s.grid.label)).toBe('1');
  });

  it('segmentOf : le tronçon visible', () => {
    const s = L.init(ACT5);
    const seg = L.segmentOf(s.lines[0], s.win);
    expect(seg[0][0]).toBeCloseTo(0);
    expect(seg[0][1]).toBeCloseTo(43);
    expect(seg[1][1]).toBeCloseTo(0);
  });

  it('un contenu invalide est une erreur', () => {
    expect(() => L.init({ system: 'x+y=3' })).toThrow();
    expect(() => L.init({ system: 'x=3|x+y=2' })).toThrow();
  });
});

describe('line-crossing — balayage des pentes (2026-10-09)', () => {
  it('seulement à l\'étape des cas ; chaque pente est un essai de configuration', () => {
    const b = L.init({ system: 'x+y=3|2x-y=0' });
    expect(L.untriedSlopes(b)).toHaveLength(0);
    let s = L.init({ system: 'x+y=3|2x-y=0', startWith: 'cases' });
    const todo = L.untriedSlopes(s);
    expect(todo.length).toBeGreaterThan(3);
    for (const j of todo) s = L.hold(s, L.mAt(s, j), s.held.b);
    expect(L.untriedSlopes(s)).toHaveLength(0);
    expect(s.seen.parallel).toBe(true);
    expect(s.seen.same).toBe(false); // « confondues » demande aussi p : le geste de l'élève
  });
});
