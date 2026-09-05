import { describe, it, expect } from 'vitest';
import {
  KINDS, KIND_LABEL, endpointCount, extentSentence, endpointNames,
  isAligned, alignmentGap, isMidpoint, midpointGap,
  notationParts, allNotations, kindOfNotation,
  extentOf, endpointsOf, containsPoint, clipToBox, notationOf, describeObj, midpoint, dist,
} from './droitesUtils';

const P = (x, y) => ({ x, y });
const A = P(0, 0);
const B = P(100, 0);

describe('les trois objets ne diffèrent que par leur étendue', () => {
  it('le nombre d’extrémités est la propriété discriminante : 2, 1, 0', () => {
    expect(endpointCount('segment')).toBe(2);
    expect(endpointCount('demi-droite')).toBe(1);
    expect(endpointCount('droite')).toBe(0);
  });

  it('changer le kind sans toucher aux points change l’étendue', () => {
    const spans = KINDS.map((kind) => extentOf({ kind, a: A, b: B }));
    expect(spans[0]).toEqual({ fromT: 0, toT: 100 });     // segment
    expect(spans[1].toT).toBe(Infinity);                   // demi-droite
    expect(spans[2].fromT).toBe(-Infinity);                // droite
  });

  it('nomme les extrémités réellement portées', () => {
    expect(endpointNames('segment')).toEqual(['A', 'B']);
    expect(endpointNames('demi-droite')).toEqual(['A']);
    expect(endpointNames('droite')).toEqual([]);
    expect(endpointNames('segment', 'M', 'N')).toEqual(['M', 'N']);
  });

  it('décrit l’étendue en français, sans jargon', () => {
    expect(extentSentence('segment')).toMatch(/deux côtés/);
    expect(extentSentence('demi-droite')).toMatch(/un seul côté/);
    expect(extentSentence('droite')).toMatch(/sans fin/);
  });

  it('un point au-delà de B appartient à la droite et à la demi-droite, pas au segment', () => {
    const beyond = P(160, 0);
    expect(containsPoint({ kind: 'segment', a: A, b: B }, beyond)).toBe(false);
    expect(containsPoint({ kind: 'demi-droite', a: A, b: B }, beyond)).toBe(true);
    expect(containsPoint({ kind: 'droite', a: A, b: B }, beyond)).toBe(true);
  });

  it('clipToBox : seul le segment reste borné', () => {
    const box = { xMin: -200, yMin: -200, xMax: 200, yMax: 200 };
    expect(clipToBox({ kind: 'segment', a: A, b: B }, box).openTo).toBe(false);
    expect(clipToBox({ kind: 'demi-droite', a: A, b: B }, box).openTo).toBe(true);
    const d = clipToBox({ kind: 'droite', a: A, b: B }, box);
    expect(d.openFrom && d.openTo).toBe(true);
  });
});

describe('points sur la droite', () => {
  it('reconnaît un point aligné et en rejette un qui ne l’est pas', () => {
    expect(isAligned(A, B, P(50, 0))).toBe(true);
    expect(isAligned(A, B, P(50, 40))).toBe(false);
  });

  it('alignmentGap chiffre l’écart — « presque aligné » n’est pas aligné', () => {
    expect(alignmentGap(A, B, P(50, 0))).toBeCloseTo(0, 9);
    expect(alignmentGap(A, B, P(50, 30))).toBeCloseTo(30, 9);
  });

  it('le milieu est équidistant ET aligné', () => {
    const m = midpoint(A, B);
    expect(isMidpoint(A, B, m)).toBe(true);
    expect(midpointGap(A, B, m)).toBeCloseTo(0, 9);
    // Équidistant mais PAS aligné : ce n'est pas le milieu du segment.
    expect(isMidpoint(A, B, P(50, 40))).toBe(false);
    // Aligné mais pas au centre.
    expect(isMidpoint(A, B, P(30, 0))).toBe(false);
    expect(midpointGap(A, B, P(30, 0))).toBeCloseTo(40, 9);
  });
});

describe('notations', () => {
  it('chaque symbole raconte un côté de l’étendue', () => {
    expect(notationParts('segment')).toMatchObject({ left: '[', right: ']' });
    expect(notationParts('demi-droite')).toMatchObject({ left: '[', right: ')' });
    expect(notationParts('droite')).toMatchObject({ left: '(', right: ')' });
    // Une parenthèse dit toujours « ça continue ».
    expect(notationParts('droite').leftMeans).toMatch(/continue/);
    expect(notationParts('segment').leftMeans).toMatch(/arrête/);
  });

  it('produit les trois notations françaises', () => {
    expect(allNotations().map((n) => n.notation)).toEqual(['[AB]', '[AB)', '(AB)']);
    expect(allNotations('M', 'N').map((n) => n.notation)).toEqual(['[MN]', '[MN)', '(MN)']);
  });

  it('kindOfNotation lit les symboles, quels que soient les noms de points', () => {
    expect(kindOfNotation('[AB]')).toBe('segment');
    expect(kindOfNotation('[AB)')).toBe('demi-droite');
    expect(kindOfNotation('(AB)')).toBe('droite');
    expect(kindOfNotation('[MN]')).toBe('segment');
    expect(kindOfNotation('(uv)')).toBe('droite');
    expect(kindOfNotation('AB')).toBeNull();
  });

  it('notationOf et describeObj restent cohérents avec le kind', () => {
    for (const kind of KINDS) {
      const o = { kind, a: A, b: B };
      expect(describeObj(o)).toContain(notationOf(o));
      expect(describeObj(o)).toContain(KIND_LABEL[kind]);
    }
  });
});
