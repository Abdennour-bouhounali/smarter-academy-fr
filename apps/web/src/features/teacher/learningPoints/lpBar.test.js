import { describe, it, expect } from 'vitest';
import { barSegments, sortLearningPoints, confidencePercent, LP_STATUSES } from './lpBar';

describe('la barre empilée d’un point d’apprentissage', () => {
  it('garde l’ordre des quatre statuts et somme exactement 100', () => {
    const segments = barSegments({ mastered: 1, reinforce: 1, gap: 1, unassessed: 0 });
    expect(segments.map((s) => s.key)).toEqual([...LP_STATUSES]);
    expect(segments.reduce((sum, s) => sum + s.percent, 0)).toBe(100);
    expect(segments.find((s) => s.key === 'unassessed').percent).toBe(0);
    expect(segments.filter((s) => s.count > 0).every((s) => s.percent >= 33)).toBe(true);
  });

  it('n’attribue jamais un pourcentage à un segment vide', () => {
    const segments = barSegments({ mastered: 2, reinforce: 0, gap: 0, unassessed: 1 });
    expect(segments.map((s) => s.percent)).toEqual([67, 0, 0, 33]);
  });

  it('rend quatre segments à zéro pour une classe vide, sans division par zéro', () => {
    expect(barSegments({}).every((s) => s.percent === 0 && s.count === 0)).toBe(true);
    expect(barSegments(null)).toHaveLength(4);
  });
});

describe('le tri des points d’apprentissage', () => {
  const points = [
    { code: 'a', order: 1, counts: { gap: 0, reinforce: 3 } },
    { code: 'b', order: 2, counts: { gap: 4, reinforce: 0 } },
    { code: 'c', order: 3, counts: { gap: 4, reinforce: 2 } },
    { code: 'd', order: 0, counts: { gap: 0, reinforce: 3 } },
  ];

  it('met en tête ce qui bloque le plus d’élèves, puis le renforcement, puis l’ordre du cours', () => {
    expect(sortLearningPoints(points).map((p) => p.code)).toEqual(['c', 'b', 'd', 'a']);
  });

  it('suit la leçon quand on le demande, et ne mute pas la liste reçue', () => {
    const copy = [...points];
    expect(sortLearningPoints(points, 'order').map((p) => p.code)).toEqual(['d', 'a', 'b', 'c']);
    expect(points).toEqual(copy);
  });
});

describe('la confiance en pourcentage', () => {
  it('lit [0, 1], tolère un pourcentage, et rend null sans valeur', () => {
    expect(confidencePercent(0.42)).toBe(42);
    expect(confidencePercent(1)).toBe(100);
    expect(confidencePercent(85)).toBe(85);
    expect(confidencePercent(null)).toBeNull();
    expect(confidencePercent(undefined)).toBeNull();
  });
});
