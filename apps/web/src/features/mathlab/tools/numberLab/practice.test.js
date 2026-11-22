import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import * as P from './practice.js';
import { makeFrac, fracToNumber } from './fraction.js';
import { gcd, lcm, isPrime, factorPairs } from './numberTheory.js';

/** §48 à §53 : prédire → révéler → vérifier, sans jamais bloquer personne. */

describe('le tirage', () => {
  it('la même graine rend le même défi', () => {
    expect(P.generateChallenge(7, 3)).toEqual(P.generateChallenge(7, 3));
  });

  it('des graines consécutives ne donnent pas toujours la même famille', () => {
    const kinds = new Set(Array.from({ length: 40 }, (_, i) => P.generateChallenge(i + 1, 3).kind));
    expect(kinds.size).toBeGreaterThan(1);
  });

  it('§51 — le niveau change les FAMILLES, pas la taille des nombres', () => {
    const level1 = new Set(Array.from({ length: 60 }, (_, i) => P.generateChallenge(i, 1).kind));
    const level5 = new Set(Array.from({ length: 60 }, (_, i) => P.generateChallenge(i, 5).kind));
    expect([...level1].every((k) => P.LEVEL_KINDS[1].includes(k))).toBe(true);
    expect([...level5].every((k) => P.LEVEL_KINDS[5].includes(k))).toBe(true);
    // Le niveau 5 pose des questions que le niveau 1 ne pose pas.
    expect([...level5].some((k) => !level1.has(k))).toBe(true);
  });

  it('un niveau absurde retombe sur le premier, sans jeter', () => {
    for (const level of [0, 9, null, undefined, 'x', NaN]) {
      expect(() => P.generateChallenge(1, level)).not.toThrow();
    }
  });
});

describe('chaque défi est COMPLET — l’écran peut tout dessiner', () => {
  it('tous les champs du contrat sont là, pour toutes les familles', () => {
    for (const kind of P.CHALLENGE_KINDS) {
      for (let seed = 1; seed <= 8; seed += 1) {
        const challenge = P.generateChallenge(seed, 3, [kind]);
        expect(challenge.kind, kind).toBe(kind);
        expect(typeof challenge.promptKey, kind).toBe('string');
        expect(challenge.expected, kind).toBeDefined();
        expect(Array.isArray(challenge.hintKeys), kind).toBe(true);
        expect(challenge.hintKeys.length, kind).toBeGreaterThanOrEqual(2);
        expect(typeof challenge.explainKey, kind).toBe('string');
        // §53 : il y a TOUJOURS quelque chose à montrer après une erreur.
        expect(challenge.reveal, kind).toBeTruthy();
        expect(typeof challenge.reveal.mode, kind).toBe('string');
      }
    }
  });

  it('la réponse attendue est mathématiquement JUSTE', () => {
    for (let seed = 1; seed <= 30; seed += 1) {
      const g = P.generateChallenge(seed, 4, ['gcdChallenge']);
      expect(g.expected).toBe(gcd(g.promptParams.a, g.promptParams.b));

      const l = P.generateChallenge(seed, 4, ['lcmChallenge']);
      expect(l.expected).toBe(lcm(l.promptParams.a, l.promptParams.b));

      const prime = P.generateChallenge(seed, 1, ['primeChallenge']);
      expect(isPrime(Number(prime.expected))).toBe(true);
      // Les leurres ne sont PAS premiers : la question a une seule réponse.
      expect(prime.choices.filter((c) => isPrime(Number(c)))).toHaveLength(1);

      const pairs = P.generateChallenge(seed, 5, ['factorPairs']);
      expect(pairs.expected).toEqual(factorPairs(pairs.value).map(([a, b]) => `${a}×${b}`));
    }
  });

  it('le défi de divisibilité fabrique VRAIMENT le cas qu’il annonce', () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const c = P.generateChallenge(seed, 1, ['divisibility']);
      const divisible = c.promptParams.value % c.promptParams.by === 0;
      expect(c.expected, `${c.promptParams.value} / ${c.promptParams.by}`).toBe(divisible ? 'yes' : 'no');
    }
  });

  it('la comparaison ne propose jamais deux fois la même valeur sans « = »', () => {
    for (let seed = 1; seed <= 30; seed += 1) {
      const c = P.generateChallenge(seed, 3, ['compare']);
      expect(c.choices).toContain('equal');
      expect(['left', 'right', 'equal']).toContain(c.expected);
    }
  });
});

describe('la vérification accepte TOUTES les écritures d’un nombre (§46)', () => {
  const challenge = { kind: 'representation', answerType: 'number', expected: 0.5, tolerance: 1e-6 };

  it.each(['0,5', '0.5', '1/2', '50%', '2/4'])('« %s » vaut 0,5', (answer) => {
    expect(P.checkAnswer(challenge, answer).correct).toBe(true);
  });

  it('une réponse illisible n’est pas comptée fausse en silence', () => {
    const verdict = P.checkAnswer(challenge, 'abc');
    expect(verdict.correct).toBe(false);
    expect(verdict.unreadable).toBe(true);
  });

  it('un nombre proche mais hors tolérance est faux', () => {
    expect(P.checkAnswer(challenge, '0,6').correct).toBe(false);
  });
});

describe('les autres formes de réponse', () => {
  it('le GLISSÉ est juste à la tolérance près, et « tout près » est DIT', () => {
    const challenge = P.generateChallenge(3, 2, ['placeOnLine']);
    expect(P.checkAnswer(challenge, challenge.expected).correct).toBe(true);
    expect(P.checkAnswer(challenge, challenge.expected + challenge.tolerance * 0.5).correct).toBe(true);
    const near = P.checkAnswer(challenge, challenge.expected + challenge.tolerance * 2);
    expect(near.correct).toBe(false);
    expect(near.near).toBe(true);
    expect(P.checkAnswer(challenge, challenge.expected + 5).near).toBe(false);
  });

  it('§50 — la fraction équivalente doit avoir la bonne VALEUR et la bonne écriture', () => {
    const challenge = P.generateChallenge(5, 2, ['equivalent']);
    expect(P.checkAnswer(challenge, challenge.expected).correct).toBe(true);
    // La forme réduite a la bonne valeur mais pas le dénominateur demandé.
    const reduced = P.checkAnswer(challenge, challenge.base);
    expect(reduced.sameValue).toBe(true);
    expect(reduced.correct).toBe(false);
  });

  it('§50 — l’ENSEMBLE des couples : l’ordre ne compte pas, 6×4 vaut 4×6', () => {
    const challenge = P.generateChallenge(2, 5, ['factorPairs']);
    const all = factorPairs(challenge.value).map(([a, b]) => `${b}×${a}`);
    const verdict = P.checkAnswer(challenge, all.reverse());
    expect(verdict.correct).toBe(true);

    const partial = P.checkAnswer(challenge, [challenge.expected[0]]);
    expect(partial.correct).toBe(false);
    expect(partial.missing).toBe(challenge.expected.length - 1);
  });

  it('un couple FAUX est désigné', () => {
    const challenge = P.generateChallenge(2, 5, ['factorPairs']);
    const verdict = P.checkAnswer(challenge, [...challenge.expected, '5×7']);
    expect(verdict.correct).toBe(false);
    expect(verdict.wrong).toContain('5×7');
  });

  it('le curseur de pourcentage tolère un demi-point', () => {
    const challenge = P.generateChallenge(1, 2, ['percentSlider']);
    expect(P.checkAnswer(challenge, challenge.expected + 0.4).correct).toBe(true);
    expect(P.checkAnswer(challenge, challenge.expected + 3).correct).toBe(false);
  });
});

describe('§52 — les indices révèlent la MÉTHODE, progressivement', () => {
  it('ils viennent un par un et s’épuisent', () => {
    const challenge = P.generateChallenge(1, 1, ['compare']);
    const first = P.nextHint(challenge, 0);
    expect(first.index).toBe(0);
    expect(first.last).toBe(false);
    expect(P.nextHint(challenge, 1).remaining).toBe(1);
    expect(P.nextHint(challenge, 2).last).toBe(true);
    // Épuisés : plus d'indice, mais rien n'est bloqué.
    expect(P.nextHint(challenge, 3)).toBeNull();
  });

  it('le premier indice ne contient JAMAIS la réponse', () => {
    for (const kind of P.CHALLENGE_KINDS) {
      const challenge = P.generateChallenge(4, 3, [kind]);
      expect(String(challenge.hintKeys[0]), kind).not.toContain(String(challenge.expected));
    }
  });
});

describe('§53 — une erreur s’EXPLIQUE par le dessin, jamais par « خطأ »', () => {
  it('l’explication dit quoi montrer et quoi demander', () => {
    const challenge = P.generateChallenge(1, 1, ['compare']);
    const wrong = challenge.expected === 'left' ? 'right' : 'left';
    const explanation = P.explainError(challenge, P.checkAnswer(challenge, wrong));
    expect(explanation.reveal.mode).toBe('line');
    expect(explanation.reveal.values).toHaveLength(2);
    expect(explanation.askKey).toContain('whichIsRight');
  });

  it('une bonne réponse n’a rien à expliquer', () => {
    const challenge = P.generateChallenge(1, 1, ['compare']);
    expect(P.explainError(challenge, P.checkAnswer(challenge, challenge.expected))).toBeNull();
  });

  it('chaque famille a sa propre question de révélation', () => {
    const asks = new Set(P.CHALLENGE_KINDS.map((kind) => {
      const challenge = P.generateChallenge(1, 3, [kind]);

      return P.explainError(challenge, { correct: false }).askKey;
    }));
    expect(asks.size).toBeGreaterThan(5);
  });

  it('§48 — rien, jamais, ne rend un état « bloqué »', () => {
    const challenge = P.generateChallenge(1, 1, ['compare']);
    for (const answer of ['', 'n’importe quoi', null, 42, [], {}]) {
      const verdict = P.checkAnswer(challenge, answer);
      expect(verdict).not.toHaveProperty('locked');
      expect(verdict).not.toHaveProperty('blocked');
      expect(typeof verdict.correct).toBe('boolean');
    }
  });
});

describe('la réponse, quand on la demande (§52)', () => {
  it('elle existe pour chaque famille', () => {
    for (const kind of P.CHALLENGE_KINDS) {
      const revealed = P.revealAnswer(P.generateChallenge(1, 3, [kind]));
      expect(typeof revealed.text, kind).toBe('string');
      expect(revealed.text.length, kind).toBeGreaterThan(0);
    }
  });
});

describe('§54 — les expériences ne demandent rien, elles MONTRENT', () => {
  it('§21 — les multiples de 3 ont une somme de chiffres divisible par 3', () => {
    const run = P.runExperiment('digitSum', 3);
    expect(run.rows).toHaveLength(8);
    for (const row of run.rows) {
      expect(row.value % 3, String(row.value)).toBe(0);
      expect(row.digitSum % 3, String(row.value)).toBe(0);
    }
  });

  it('§29 — deux consécutifs sont premiers entre eux, sur chaque ligne', () => {
    for (const row of P.runExperiment('coprime', 5).rows) {
      expect(row.b).toBe(row.a + 1);
      expect(row.gcd).toBe(1);
    }
  });

  it('§31 — PGCD × PPCM = a × b, sur chaque ligne', () => {
    for (const row of P.runExperiment('gcdLcmProduct', 9).rows) {
      expect(row.product).toBe(row.ab);
    }
  });

  it('§9 — la chaîne des équivalentes garde la même valeur', () => {
    const rows = P.runExperiment('equivalentChain', 2).rows;
    const first = fracToNumber(rows[0]);
    for (const row of rows) expect(fracToNumber(row)).toBeCloseTo(first, 12);
  });

  it('une expérience inconnue ne jette pas', () => {
    expect(() => P.runExperiment('n’existe pas')).not.toThrow();
  });
});

/*
 * Audit des réponses (2026-09-24) — chaque cas rejoue un défaut réel, avec
 * une réponse juste calculée ici, pas lue dans le défi.
 */
describe('audit — la bonne réponse de l’élève est acceptée, dans son écriture', () => {
  const ar = JSON.parse(readFileSync(new URL('../../../../i18n/locales/ar/mathlab.json', import.meta.url), 'utf8'));
  const at = (key) => key.split('.').reduce((node, k) => node?.[k], ar);

  it('« اكتب 3/4 على شكل نسبة مئوية » : 75 et 75 % sont justes, 0,75 % ne l’est pas', () => {
    for (let seed = 0; seed < 400; seed++) {
      const c = P.generateChallenge(seed, 3, ['representation']);
      if (!c.promptKey.endsWith('Percent')) continue;
      const percent = Math.round(fracToNumber(makeFrac(...c.promptParams.value.split('/').map(Number))) * 100);
      expect(P.checkAnswer(c, String(percent)).correct).toBe(true);
      expect(P.checkAnswer(c, `${percent}%`).correct).toBe(true);
      expect(P.checkAnswer(c, `${percent} %`).correct).toBe(true);
      expect(P.checkAnswer(c, `${percent / 100}%`).correct).toBe(false);
    }
  });

  it('une question décimale ne lit pas « 75 % » comme 75', () => {
    const c = { kind: 'representation', answerType: 'number', expected: 0.75, tolerance: 1e-6 };
    expect(P.checkAnswer(c, '75%').correct).toBe(true);
    expect(P.checkAnswer(c, '75').correct).toBe(false);
  });

  it('la consigne d’arrondi NOMME le rang — jamais « إلى -1 »', () => {
    for (let seed = 0; seed < 300; seed++) {
      const c = P.generateChallenge(seed, 3, ['rounding']);
      const text = at(c.promptKey);
      expect(typeof text, c.promptKey).toBe('string');
      expect(text).toMatch(/أقرب/);
      expect(text).not.toMatch(/\{\{rank\}\}/);
    }
  });

  it('chaque indice ne demande que des paramètres fournis par le défi', () => {
    for (let seed = 0; seed < 600; seed++) {
      const c = P.generateChallenge(seed, 1 + (seed % 5));
      for (const key of c.hintKeys ?? []) {
        const wanted = [...String(at(key) ?? '').matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
        for (const w of wanted) expect(c.promptParams, `${key} veut {{${w}}}`).toHaveProperty(w);
      }
    }
  });
});
