import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';
import * as L from './routeCompare';
import { LEVELS } from '../levels';

/**
 * route-compare — la logique des deux parcours sur les nombres des DEUX niveaux de levels.js (le rallye du Sahara ; la وضعية
 * du manuel p. 148 : trois demi-cercles 3π ≈ 9,42 contre √13 + √5 + √17 ≈ 9,96). Balayé : chaque nœud du cadre pour
 * l'épingle de chaque morceau.
 */
const ADV = LEVELS['route-compare'].advanced.numbers;
const BEG = LEVELS['route-compare'].beginner.numbers;
const node = (P) => ({ x: P.x, y: P.y });

/** Construire tout un niveau à la main : parier, puis poser chaque bonne épingle, parcours 1 puis 2. */
function buildAll(nums, bet = 1) {
  let s = L.placeBet(L.init(nums), bet);
  while (!L.allDone(s)) {
    const p = L.nextPiece(s);
    s = L.placePin(s, node(p.kind === 'arc' ? p.centre : p.to));
  }
  return s;
}

describe('route-compare — les nombres', () => {
  it('la وضعية : 3π ≈ 9,42 contre √13 + √5 + √17 ≈ 9,96 ; le parcours (1) est le plus court, écart ≈ 0,54', () => {
    const s = L.init(ADV);
    expect(s.routes[0].total.latex).toBe('3\\pi');
    expect(s.routes[1].total.latex).toBe('\\sqrt{13} + \\sqrt{5} + \\sqrt{17}');
    expect(L.dec(s.routes[0].total.number)).toBe('9,42');
    expect(L.dec(s.routes[1].total.number)).toBe('9,96');
    expect(L.shorter(s)).toBe(0);
    expect(L.dec(L.gap(s))).toBe('0,54');
    expect(s.routes[0].pieces.map((p) => L.pairText(p.centre))).toEqual(['(−1 ; 0)', '(1 ; 0)', '(3 ; 0)']);
    expect(TR.surdText(L.shortcut(s, 1))).toBe('√61');
  });
  it('le rallye : 2π + 2 ≈ 8,28 contre 2√2 + 2√5 ≈ 7,30 — cette fois la ligne brisée gagne', () => {
    const s = L.init(BEG);
    expect(s.routes[0].total.latex).toBe('2\\pi + 2');
    expect(s.routes[1].total.latex).toBe('2\\sqrt{2} + 2\\sqrt{5}');
    expect(L.dec(s.routes[0].total.number)).toBe('8,28');
    expect(L.dec(s.routes[1].total.number)).toBe('7,30');
    expect(L.shorter(s)).toBe(1);
  });
  it.each([['advanced', ADV], ['beginner', BEG]])('%s : un cadre presque carré qui contient tout', (_, nums) => {
    const f = L.init(nums).frame;
    const w = f.xMax - f.xMin; const h = f.yMax - f.yMin;
    expect(Math.max(w, h) / Math.min(w, h)).toBeLessThan(1.5);
  });
});

describe('route-compare — la main', () => {
  it('rien ne se pose avant le pari ; le pari ne change plus après la première pose', () => {
    let s = L.init(ADV);
    expect(L.placePin(s, { x: -1, y: 0 })).toBe(s);
    s = L.placeBet(s, 1);
    expect(s.bet).toBe(1);
    s = L.placePin(s, { x: -1, y: 0 });
    expect(s.built).toEqual([1, 0]);
    expect(L.placeBet(s, 0).bet).toBe(1);
  });

  it('balayé : pour chaque demi-cercle, SEUL le milieu du diamètre referme l’arc ; le centre sur l’extrémité est « atEnd »', () => {
    for (const nums of [ADV, BEG]) {
      let s = L.placeBet(L.init(nums), 0);
      const f = s.frame;
      for (let k = 0; k < s.routes[0].pieces.length; k += 1) {
        const piece = L.nextPiece(s);
        if (piece.kind !== 'arc') break;
        const mid = V.midpoint(L.currentPoint(s), piece.to);
        for (let x = f.xMin; x <= f.xMax; x += 0.5) {
          for (let y = f.yMin; y <= f.yMax; y += 0.5) {
            const P = L.snap(s, x, y);
            const v = L.judge(s, P);
            if (V.vecEq(P, mid)) expect(v.kind).toBe('ok');
            else if (V.vecEq(P, L.currentPoint(s))) expect(v.kind).toBe('zero');
            else if (V.vecEq(P, piece.to)) expect(v.kind).toBe('atEnd');
            else expect(v.kind).toBe('miss');
          }
        }
        s = L.placePin(s, node(mid));
      }
    }
  });

  it('un centre refusé rend l’épingle au point courant et dit où l’arc se referme (2C − P)', () => {
    let s = L.placeBet(L.init(ADV), 0);
    s = L.placePin(s, { x: 0, y: 0 }); // le centre sur O : l'arc de A se referme en (2 ; 0)
    expect(s.last.trial.kind).toBe('atEnd');
    expect(L.pairText(s.last.trial.pv.end)).toBe('(2 ; 0)');
    expect(V.vecEq(s.pin, V.point(-2, 0))).toBe(true);
    s = L.placePin(s, { x: -1, y: 0.5 });
    expect(s.last.trial.kind).toBe('miss');
    expect(L.pairText(s.last.trial.pv.end)).toBe('(0 ; 1)');
    expect(s.built).toEqual([0, 0]);
  });

  it('balayé : pour chaque morceau droit, seule la balise suivante est acceptée ; une balise plus loin est un raccourci', () => {
    let s = L.placeBet(L.init(ADV), 1);
    s = L.selectRoute(s, 1);
    expect(L.pinStep(s).d).toBe(1);
    const f = s.frame;
    for (let k = 0; k < 3; k += 1) {
      const piece = L.nextPiece(s);
      const later = s.routes[1].pieces.slice(k + 1).map((p) => p.to);
      for (let x = f.xMin; x <= f.xMax; x += 1) {
        for (let y = f.yMin; y <= f.yMax; y += 1) {
          const P = V.point(x, y); const v = L.judge(s, P);
          if (V.vecEq(P, piece.to)) expect(v.kind).toBe('ok');
          else if (V.vecEq(P, L.currentPoint(s))) expect(v.kind).toBe('zero');
          else if (later.some((Q) => V.vecEq(P, Q))) expect(v.kind).toBe('skip');
          else expect(v.kind).toBe('off');
        }
      }
      s = L.placePin(s, node(piece.to));
    }
    expect(L.isComplete(s, 1)).toBe(true);
  });

  it('le raccourci M → N : refusé, sa longueur √61 se lit', () => {
    let s = L.selectRoute(L.placeBet(L.init(ADV), 0), 1);
    s = L.placePin(s, { x: 4, y: -2 });
    expect(s.last.trial.kind).toBe('skip');
    expect(TR.surdText(s.last.trial.pv.length)).toBe('√61');
  });

  it('la montre additionne exactement ce qui est construit ; le parcours fini passe la main à l’autre', () => {
    let s = L.placeBet(L.init(ADV), 1);
    s = L.placePin(s, { x: -1, y: 0 });
    expect(L.builtLength(s, 0).latex).toBe('\\pi');
    s = L.placePin(s, { x: 1, y: 0 });
    s = L.placePin(s, { x: 3, y: 0 });
    expect(L.builtLength(s, 0)).toMatchObject({ latex: '3\\pi', complete: true });
    expect(s.last.routeDone).toBe(0);
    expect(s.active).toBe(1);
    expect(V.vecEq(s.pin, V.point(-2, 3))).toBe(true);
    s = L.placePin(s, { x: 1, y: 1 });
    expect(L.builtLength(s, 1).latex).toBe('\\sqrt{13}');
    expect(L.evidenceOf(s)).toMatchObject({ kind: 'ok', route: 2, comp: '(3 ; −2)', length: '√13', approx: '3,61' });
  });

  it.each([['advanced', ADV], ['beginner', BEG]])('%s : tout construire ouvre la découverte, pas avant', (_, nums) => {
    const s = buildAll(nums);
    expect(L.allDone(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.discoveryReady(L.placeBet(L.init(nums), 0))).toBe(false);
    expect(s.pin).toBe(null);
  });

  it('les centres au demi-carreau : l’épingle d’un arc avance de ½, celle d’une balise de 1', () => {
    const s = L.placeBet(L.init(ADV), 0);
    expect(L.pinStep(s).d).toBe(2);
    expect(L.pairText(L.snap(s, -1.3, 0.2))).toBe('(−1,5 ; 0)');
    expect(L.pairText(L.snap(s, 99, -99))).toBe(`(${s.frame.xMax} ; ${String(s.frame.yMin).replace('-', '−')})`);
  });

  it('la mise en page garde des carrés et tient dans la boîte', () => {
    const s = L.init(ADV);
    for (const [w, h] of [[300, 260], [620, 420], [360, 500]]) {
      const G = L.layout(s, { width: w, height: h });
      expect(G.width).toBeLessThanOrEqual(w + 1);
      expect(G.height).toBeLessThanOrEqual(h + 1);
      expect(G.X(1) - G.X(0)).toBeCloseTo(G.Y(0) - G.Y(1), 6);
    }
  });
});
