import { describe, it, expect } from 'vitest';
import * as AF from '@smarter-academy/core/arithmetic/affine.js';
import * as L from './slopeStairs';

/**
 * slope-stairs sur les nombres du manuel : نشاط 4 (f(x) = 200x + 2000, l'escalier 0→1→4→6→10→12→15)
 * et le تحدّ (deux couples lus (10 ; 50) et (30 ; 86) → a = 1,8 puis b = 32), plus le préréglage
 * مبتدئ de la plateforme (50x + 100, marques 0|2|4). L'INVARIANT est balayé sur toutes les paires.
 */
const T = (p) => L.numText(p);
const at = (s, x1, x2) => {
  const i1 = L.indexOf(L.toNum(x1), s.snap);
  const i2 = L.indexOf(L.toNum(x2), s.snap);
  return L.commit(L.move(L.move(s, 0, i1), 1, i2));
};
const chain = (s, pairs) => pairs.reduce((acc, [a, b]) => at(acc, a, b), s);

describe('slope-stairs — نشاط 4 : f(x) = 200x + 2000', () => {
  const s0 = L.init({ rule: '200x+2000', marks: '0|1|4|6|10|12|15', shown: 2 });

  it('la fenêtre et le pas : 0 → 15 matchs, nœuds entiers, la droite entière dans le cadre', () => {
    expect(s0.mode).toBe('rule');
    expect(T(s0.snap)).toBe('1');
    expect(s0.win.xMin).toBe(0);
    expect(s0.win.xMax).toBe(15);
    expect(s0.win.yMax).toBeGreaterThanOrEqual(5000);
    expect(s0.range).toEqual({ min: 0, max: 15 });
  });

  it('les six marches du manuel, les deux premières imprimées (200 ; 3 et 600)', () => {
    expect(s0.ghosts.map((g) => [T(g.from), T(g.to), T(g.dx), T(g.df)])).toEqual([
      ['0', '1', '1', '200'], ['1', '4', '3', '600'], ['4', '6', '2', '400'],
      ['6', '10', '4', '800'], ['10', '12', '2', '400'], ['12', '15', '3', '600'],
    ]);
    expect(s0.ghosts.map((g) => g.printed)).toEqual([true, true, false, false, false, false]);
    expect(L.fillProgress(s0)).toEqual({ done: 0, total: 4 });
  });

  it('rien n\'est offert : les marqueurs de départ ne sont ni des marques ni des marches du manuel', () => {
    const [i1, i2] = s0.m;
    expect(i1).not.toBe(i2);
    for (const i of [i1, i2]) expect([0, 1, 4, 6, 10, 12, 15]).not.toContain(i);
  });

  it('les trois quotients du manuel valent 200', () => {
    for (const [a, b] of [[4, 1], [1, 0], [6, 4]]) {
      const st = L.stairOf(s0, a, b);
      expect(T(st.q)).toBe('200');
      expect(T(st.q)).toBe(T(AF.rateOfChange(AF.affine('200x+2000'), a, b)));
    }
    expect(L.quotientTex(L.stairOf(s0, 4, 1))).toBe('\\dfrac{f(4) - f(1)}{4 - 1} = \\dfrac{2800 - 2200}{4 - 1} = \\dfrac{600}{3} = 200');
  });

  it('INVARIANT balayé : chaque paire de nœuds distincts (dans les deux sens) donne 200', () => {
    for (let i = 0; i <= 15; i++) for (let j = 0; j <= 15; j++) {
      if (i === j) continue;
      expect(T(L.stairOf(s0, i, j).q), `${i}→${j}`).toBe('200');
    }
  });

  it('RÉSISTANCE : x₁ = x₂ est refusé (0 ÷ 0), sans marche, et l\'essai le dit', () => {
    expect(L.canStair(s0, 5, 5)).toBe('same');
    const s = at(s0, 5, 5);
    expect(s.last.kind).toBe('same');
    expect(L.stairs(s)).toHaveLength(0);
    expect(L.stairOf(s, 5, 5)).toBeNull();
  });

  it('poser les marqueurs sur deux marques consécutives REMPLIT la marche du manuel (dans les deux sens)', () => {
    let s = at(s0, 6, 4);
    expect(s.filled[2]).toBe(true);
    expect(s.last.newGhost).toBe(true);
    s = at(s, 10, 6);
    s = at(s, 10, 12);
    s = at(s, 15, 12);
    expect(L.fillProgress(s)).toEqual({ done: 4, total: 4 });
    // une marche imprimée ne compte pas comme remplie par l'élève
    s = at(s, 0, 1);
    expect(s.last.newGhost).toBe(false);
  });

  it('la découverte demande trois marches de DEUX largeurs au moins', () => {
    let s = chain(s0, [[6, 4], [12, 10]]);
    expect(L.discoveryReady(s)).toBe(false);
    s = at(s, 4, 6); // même largeur, autre sens
    expect(L.discoveryReady(s)).toBe(false);
    s = at(s, 10, 6);
    expect(L.discoveryReady(s)).toBe(true);
    const [small, big] = L.contrastPair(s);
    expect(L.toNum(L.absOf(small.dx))).toBeLessThan(L.toNum(L.absOf(big.dx)));
    expect(T(small.q)).toBe(T(big.q));
    expect(L.reversedStair(s)).not.toBeNull();
  });

  it('un même essai répété ne s\'inscrit qu\'une fois', () => {
    const s = chain(s0, [[6, 4], [6, 4], [6, 4]]);
    expect(L.stairs(s)).toHaveLength(1);
  });

  it('descendre à x = 0 lit b = f(x) − a·x', () => {
    const s = at(s0, 4, 0);
    expect(T(s.bRead.b)).toBe('2000');
    expect(L.bTex(s.bRead)).toBe('b = f(0) = f(4) - 200 \\times 4 = 2800 - 800 = 2000');
  });

  it('l\'écriture de f', () => {
    expect(L.ruleTex(s0.f)).toBe('f(x) = 200x + 2000');
    expect(L.ruleTex(AF.affine('-x+5'))).toBe('f(x) = -x + 5');
    expect(L.ruleTex(AF.affine('-3/2x-4'))).toBe('f(x) = -1{,}5x - 4');
    expect(L.ruleTex(AF.affine('2/3x+1'))).toBe('f(x) = \\dfrac{2}{3}x + 1');
  });
});

describe('slope-stairs — مبتدئ de la plateforme : 50x + 100, marques 0|2|4', () => {
  const s0 = L.init({ rule: '50x+100', marks: '0|2|4' });
  it('fenêtre 0 → 6, deux marches fantômes, aucune imprimée', () => {
    expect(s0.win.xMax).toBe(6);
    expect(s0.ghosts).toHaveLength(2);
    expect(L.fillProgress(s0)).toEqual({ done: 0, total: 2 });
  });
  it('les deux marches du manuel ont la même largeur : il faut une troisième, plus large', () => {
    let s = chain(s0, [[2, 0], [4, 2], [0, 2]]);
    expect(L.discoveryReady(s)).toBe(false);
    s = at(s, 5, 1);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.stairs(s).every((t) => T(t.q) === '50')).toBe(true);
  });
});

describe('slope-stairs — le تحدّ : deux couples (10 ; 50) et (30 ; 86), f inconnue', () => {
  const s0 = L.init({ points: '10:50|30:86' });

  it('fenêtre 0 → 40 °C au pas de 5, f inconnue au départ', () => {
    expect(s0.mode).toBe('points');
    expect(T(s0.snap)).toBe('5');
    expect(s0.win.xMax).toBe(40);
    expect(s0.win.yMax).toBeGreaterThanOrEqual(104);
    expect(L.fnOf(s0)).toBeNull();
    expect(L.known(s0, 20)).toBe(false);
    expect(L.known(s0, 10)).toBe(true);
  });

  it('un nombre dont l\'image est inconnue est refusé, et 0 aussi, tant que a n\'est pas trouvé', () => {
    let s = at(s0, 20, 10);
    expect(s.last.kind).toBe('unknown');
    s = at(s, 0, 10);
    expect(s.last.kind).toBe('unknown');
    expect(s.found).toBe(false);
  });

  it('la marche entre les deux couples donne a = 1,8 et TROUVE f ; 0 donne alors b = 32', () => {
    let s = at(s0, 30, 10);
    expect(s.last.first).toBe(true);
    expect(T(s.last.q)).toBe('1,8');
    expect(L.quotientTex(s.last)).toBe('\\dfrac{f(30) - f(10)}{30 - 10} = \\dfrac{86 - 50}{30 - 10} = \\dfrac{36}{20} = 1{,}8');
    expect(L.ruleTex(s.f)).toBe('f(x) = 1{,}8x + 32');
    expect(L.discoveryReady(s)).toBe(false);
    s = at(s, 10, 0);
    expect(T(s.bRead.b)).toBe('32');
    expect(L.bTex(s.bRead)).toBe('b = f(0) = f(10) - 1{,}8 \\times 10 = 50 - 18 = 32');
    expect(L.discoveryReady(s)).toBe(true);
    // f(10) = 50 se lit sur le point donné (question 1 du تحدّ)
    expect(T(L.imageAt(s, 10))).toBe('50');
  });

  it('la marche à l\'envers (10 puis 30) donne le même a', () => {
    const s = at(s0, 10, 30);
    expect(T(s.last.q)).toBe('1,8');
  });

  it('un contrat incomplet est une erreur de contenu', () => {
    expect(() => L.init({ points: '10:50' })).toThrow();
    expect(() => L.init({ points: '10:50|10:60' })).toThrow();
    expect(() => L.init({})).toThrow();
  });
});

describe('slope-stairs — une fonction décroissante, des valeurs négatives', () => {
  it('-3x+12 : fenêtre qui descend sous 0, quotient −3 partout', () => {
    const s0 = L.init({ rule: '-3x+12', marks: '0|2|5|8' });
    expect(s0.win.yMin).toBeLessThan(0);
    for (let i = 0; i <= s0.range.max; i++) for (let j = 0; j <= s0.range.max; j++) {
      if (i !== j) expect(T(L.stairOf(s0, i, j).q)).toBe('-3');
    }
    expect(L.quotientTex(L.stairOf(s0, 8, 5))).toBe('\\dfrac{f(8) - f(5)}{8 - 5} = \\dfrac{-12 - (-3)}{8 - 5} = \\dfrac{-9}{3} = -3');
  });
});

describe('slope-stairs — balayage du premier marqueur (2026-10-09)', () => {
  it('rule : chaque x₁ donne une marche au même quotient', () => {
    let s = L.init({ rule: '200x+2000', marks: '0|1|4|6|10|12|15' });
    const todo = L.untriedFirstMarkers(s);
    expect(todo.length).toBeGreaterThan(5);
    for (const i of todo) s = L.commit(L.move(s, 0, i));
    expect(L.untriedFirstMarkers(s)).toHaveLength(0);
    expect(new Set(L.stairs(s).map((t) => T(t.q)))).toEqual(new Set(['200']));
  });
  it('points : rien avant que la première marche ait trouvé f', () => {
    const s = L.init({ points: '10:50|30:86' });
    expect(L.untriedFirstMarkers(s)).toHaveLength(0);
    expect(s.trials).toHaveLength(0);
  });
});
