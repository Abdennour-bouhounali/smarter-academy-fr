import { describe, it, expect } from 'vitest';
import * as P from './practice.js';
import * as C from './conicMath.js';
import * as I from './intersections.js';

/**
 * Les tests de l'entraînement (§36 – §41).
 *
 * Un générateur aléatoire se teste sur BEAUCOUP de tirages, pas sur un :
 * chaque propriété est donc vérifiée sur deux cents questions tirées d'un
 * générateur reproductible. Ce qui compte n'est pas qu'une question soit
 * juste, c'est qu'aucune ne puisse être fausse.
 */

/** Un générateur pseudo-aléatoire déterministe (mulberry32). */
function seeded(seed) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const manyChallenges = (kind, count = 200) => {
  const random = seeded(20260923);

  return Array.from({ length: count }, () => P.generateChallenge(random, kind ? { kind } : {}));
};

describe('le générateur (§41)', () => {
  it('ne produit que des familles connues', () => {
    for (const challenge of manyChallenges(null)) {
      expect(P.CHALLENGE_KINDS).toContain(challenge.kind);
      expect(challenge.equation).toBeTruthy();
      expect(C.isValidConic(challenge.conic)).toBe(true);
    }
  });

  it('sait produire CHAQUE famille sur demande', () => {
    const random = seeded(7);
    for (const kind of P.CHALLENGE_KINDS) {
      expect(P.generateChallenge(random, { kind }).kind).toBe(kind);
    }
  });

  it('n\'écrit jamais de valeur laide (§41)', () => {
    for (const challenge of manyChallenges(null)) {
      // Aucun nombre de l'énoncé ne doit avoir plus de deux décimales.
      const numbers = [challenge.conic.h, challenge.conic.k, challenge.conic.r, challenge.conic.a, challenge.conic.b]
        .filter(Number.isFinite);
      for (const value of numbers) {
        expect(Math.abs(value * 100 - Math.round(value * 100))).toBeLessThan(1e-9);
      }
    }
  });

  it('est REPRODUCTIBLE : même graine, mêmes questions', () => {
    const a = P.generateChallenge(seeded(42));
    const b = P.generateChallenge(seeded(42));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe('les réponses sont VRAIES (§36)', () => {
  it('le centre annoncé est bien le centre du cercle', () => {
    for (const challenge of manyChallenges('centerRadius')) {
      expect(challenge.answer).toEqual({ x: challenge.conic.h, y: challenge.conic.k });
      expect(challenge.extra.radius).toBe(challenge.conic.r);
    }
  });

  it('le sommet annoncé est bien le sommet de la parabole', () => {
    for (const challenge of manyChallenges('vertex')) {
      expect(challenge.answer).toEqual(C.parabolaFeatures(challenge.conic).vertex);
    }
  });

  it('le foyer annoncé EST un foyer, et les deux sont acceptés', () => {
    for (const challenge of manyChallenges('focus')) {
      const foci = C.ellipseFeatures(challenge.conic).foci;
      expect(foci.some((f) => Math.hypot(f.x - challenge.answer.x, f.y - challenge.answer.y) < 1e-9)).toBe(true);
      // §41 — les foyers tombent JUSTE : c doit être entier.
      expect(Math.abs(challenge.extra.c - Math.round(challenge.extra.c))).toBeLessThan(1e-9);
      for (const focus of foci) {
        expect(P.judge(challenge, focus).correct).toBe(true);
      }
    }
  });

  it('la pente d\'asymptote annoncée est bien celle de la courbe', () => {
    for (const challenge of manyChallenges('asymptote')) {
      const slopes = C.hyperbolaFeatures(challenge.conic).asymptotes.map((line) => line.slope);
      expect(slopes.some((slope) => Math.abs(slope - challenge.answer.slope) < 1e-9)).toBe(true);
    }
  });

  it('§39 — le nombre d\'intersections annoncé est celui que le moteur calcule', () => {
    for (const challenge of manyChallenges('intersectionCount')) {
      const actual = I.lineConicIntersection(challenge.conic, challenge.line);
      expect(challenge.answer).toBe(actual.count);
      expect([0, 1, 2]).toContain(challenge.answer);
    }
  });

  it('§32 — la position annoncée est celle que le moteur juge', () => {
    for (const challenge of manyChallenges('pointPosition')) {
      expect(C.pointPosition(challenge.conic, challenge.point)).toBe(challenge.answer);
    }
  });

  it('§37 — exactement UN choix est correct, et les leurres sont des erreurs réelles', () => {
    for (const challenge of manyChallenges('matchGraph')) {
      const correct = challenge.choices.filter((choice) => choice.correct);
      expect(correct).toHaveLength(1);
      expect(challenge.answer).toBe(correct[0].id);
      // Les leurres diffèrent VRAIMENT de la bonne réponse.
      for (const choice of challenge.choices.filter((c) => !c.correct)) {
        expect(JSON.stringify(choice.conic)).not.toBe(JSON.stringify(challenge.conic));
      }
    }
  });

  it('§37 — les choix sont mélangés, pas toujours en première position', () => {
    const positions = new Set(manyChallenges('matchGraph')
      .map((challenge) => challenge.choices.findIndex((choice) => choice.correct)));
    expect(positions.size).toBeGreaterThan(1);
  });
});

describe('le jugement (§36, §42)', () => {
  const random = seeded(3);

  it('accepte la bonne réponse, refuse la mauvaise', () => {
    const challenge = P.generateChallenge(random, { kind: 'centerRadius' });
    expect(P.judge(challenge, challenge.answer).correct).toBe(true);
    expect(P.judge(challenge, { x: challenge.answer.x + 3, y: challenge.answer.y }).correct).toBe(false);
  });

  it('tolère une saisie au centième, pas une confusion', () => {
    const challenge = P.generateChallenge(random, { kind: 'centerRadius' });
    const { x, y } = challenge.answer;
    expect(P.judge(challenge, { x: x + 0.005, y }).correct).toBe(true);
    expect(P.judge(challenge, { x: x + 0.5, y }).correct).toBe(false);
  });

  it('rend TOUJOURS la réponse attendue, même quand elle est fausse (§42)', () => {
    const challenge = P.generateChallenge(random, { kind: 'vertex' });
    const verdict = P.judge(challenge, { x: 99, y: 99 });
    expect(verdict.correct).toBe(false);
    expect(verdict.expected).toEqual(challenge.answer);
  });

  it('ne jette jamais sur une réponse absurde', () => {
    const challenge = P.generateChallenge(random, { kind: 'centerRadius' });
    for (const given of [null, undefined, 'x', {}, [], NaN, { x: NaN, y: 0 }]) {
      expect(() => P.judge(challenge, given)).not.toThrow();
      expect(P.judge(challenge, given).correct).toBe(false);
    }
  });

  it('ne juge rien sans question', () => {
    expect(P.judge(null, { x: 0, y: 0 }).correct).toBe(false);
  });
});

describe('les indices (§40)', () => {
  it('chaque question en a trois, et le premier ne donne pas la réponse', () => {
    for (const challenge of manyChallenges(null, 40)) {
      expect(P.hintCount(challenge)).toBe(3);
      const first = P.hintAt(challenge, 0);
      expect(first.key).toBeTruthy();
      // Le premier indice ne porte AUCUNE valeur calculée.
      expect(Object.keys(first.params)).toHaveLength(0);
    }
  });

  it('se tait au-delà du dernier', () => {
    const challenge = P.generateChallenge(seeded(1), { kind: 'focus' });
    expect(P.hintAt(challenge, 2)).not.toBeNull();
    expect(P.hintAt(challenge, 3)).toBeNull();
    expect(P.hintAt(challenge, -1)).toBeNull();
  });

  it('le dernier indice porte la donnée intermédiaire, jamais la conclusion', () => {
    const focus = P.generateChallenge(seeded(5), { kind: 'focus' });
    expect(P.hintAt(focus, 2).params.c).toBeDefined();
    // Ce n'est PAS la réponse : c'est `c`, à combiner avec le centre.
    expect(P.hintAt(focus, 2).params.c).not.toEqual(focus.answer);
  });
});

describe('la révélation (§36)', () => {
  it('dit quoi mettre en évidence pour chaque famille de question', () => {
    for (const kind of P.CHALLENGE_KINDS) {
      const challenge = P.generateChallenge(seeded(11), { kind });
      const reveal = P.revealFor(challenge);
      expect(reveal).not.toBeNull();
      expect(Array.isArray(reveal.highlight)).toBe(true);
      expect(reveal.highlight.length).toBeGreaterThan(0);
    }
  });
});

/**
 * RÉGRESSION — la lecture d'une saisie.
 *
 * `Number('')` vaut 0 : un champ VIDE était jugé « 0 », donc juste dès que
 * la réponse attendue était 0. Et `−2` (le signe moins que le plan affiche)
 * ou `٣` rendaient `NaN`, soit « faux » sur une bonne réponse.
 */
describe('la lecture d’une saisie — vide n’est pas zéro', () => {
  it('une saisie vide ou illisible n’est PAS un nombre', () => {
    for (const text of ['', '   ', 'abc', '1,2,3', '--2', '1/0', '/', null, undefined, NaN, Infinity]) {
      expect(P.parseNumberInput(text), String(text)).toBeNaN();
    }
  });

  it('lit le vrai signe moins, les chiffres arabes-indiens et persans, la virgule', () => {
    const cases = [
      ['−2', -2], ['-2', -2], ['1,5', 1.5], ['٫5', 0.5], ['٢٫٥', 2.5],
      ['٣', 3], ['−٤', -4], ['۴', 4], ['۱۲', 12], [' 0 ', 0], ['-3/2', -1.5], ['6/4', 1.5], [7, 7],
    ];
    for (const [text, expected] of cases) {
      expect(P.parseNumberInput(text), String(text)).toBe(expected);
    }
  });

  it('un point n’est lu que si SES DEUX coordonnées le sont', () => {
    expect(P.parsePointInput({ x: '', y: '' })).toBeNull();
    expect(P.parsePointInput({ x: '0', y: '' })).toBeNull();
    expect(P.parsePointInput({ x: '−3', y: '٢' })).toEqual({ x: -3, y: 2 });
    expect(P.parsePointInput(null)).toBeNull();
  });

  it('le juge ne prend plus un champ vide pour la réponse 0', () => {
    const numberAtZero = { answerKind: 'number', answer: 0 };
    expect(P.judge(numberAtZero, '').correct).toBe(false);
    expect(P.judge(numberAtZero, '   ').correct).toBe(false);
    expect(P.judge(numberAtZero, '0').correct).toBe(true);
    expect(P.judge(numberAtZero, 0).correct).toBe(true);
    const numberAtMinusTwo = { answerKind: 'number', answer: -2 };
    expect(P.judge(numberAtMinusTwo, '−2').correct).toBe(true);
    const pointAtOrigin = { answerKind: 'point', answer: { x: 0, y: 0 } };
    expect(P.judge(pointAtOrigin, P.parsePointInput({ x: '', y: '' })).correct).toBe(false);
    expect(P.judge(pointAtOrigin, P.parsePointInput({ x: '٠', y: '−0' })).correct).toBe(true);
  });
});
