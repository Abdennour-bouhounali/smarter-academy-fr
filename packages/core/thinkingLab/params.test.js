import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { fnv1a32, pickParams, allTuples, tupleCount, fillTemplate, fillChallenge } from './params.js';

const fixture = JSON.parse(readFileSync(new URL('../../../content/thinking-lab/_fixtures/params.json', import.meta.url), 'utf8'));

describe('fixture partagée des nombres par élève (miroir PHP en phase 1)', () => {
  it.each(fixture.hashes)('fnv1a32 « $text »', ({ text, hash }) => {
    expect(fnv1a32(text)).toBe(hash);
  });

  it('choisit le même tuple pour chaque (élève, défi, édition)', () => {
    for (const { userId, challengeId, edition, params, index, values } of fixture.picks) {
      expect(pickParams(params, { userId, challengeId, edition })).toEqual({ index, values });
    }
  });

  it('répartit les élèves sur plusieurs tuples', () => {
    const handshakes = fixture.picks.filter((p) => p.challengeId === 'handshakes');
    expect(new Set(handshakes.map((p) => p.index)).size).toBeGreaterThan(1);
  });
});

describe('tuples', () => {
  const params = { vars: { b: [1, 2], a: [10, 20, 30] } };

  it('triés par nom, dernière variable la plus rapide', () => {
    expect(tupleCount(params)).toBe(6);
    expect(allTuples(params).slice(0, 3)).toEqual([{ a: 10, b: 1 }, { a: 10, b: 2 }, { a: 20, b: 1 }]);
  });

  it('sans params : un seul tuple vide', () => {
    expect(allTuples(null)).toEqual([{}]);
    expect(pickParams(null, { userId: 9, challengeId: 'x', edition: 1 })).toEqual({ index: 0, values: {} });
  });
});

describe('remplissage', () => {
  it('texte : valeur brute ; expression : entre parenthèses', () => {
    expect(fillTemplate('مربّع ضلعه {a} سم', { a: 6 })).toBe('مربّع ضلعه 6 سم');
    expect(fillTemplate('{a}^2', { a: -3 }, { asExpression: true })).toBe('(-3)^2');
    expect(fillTemplate('{z}', { a: 1 })).toBe('{z}');
  });

  it('remplit énoncé, clés, relecture et réponse ; garde `params` intact', () => {
    const c = {
      statement: 'كم {a}؟',
      params: { vars: { a: [2, 3] } },
      answer: { check: 'integer', value: '{a}*{a}' },
      keys: [{ phase: 'S', text: 'ابدأ بـ {a}' }],
      mistakes: [{ value: '2*{a}', reply: 'ليس بعد' }],
    };
    const f = fillChallenge(c, { a: 3 });
    expect(f.statement).toBe('كم 3؟');
    expect(f.answer.value).toBe('(3)*(3)');
    expect(f.keys[0].text).toBe('ابدأ بـ 3');
    expect(f.mistakes[0].value).toBe('2*(3)');
    expect(f.params).toEqual(c.params);
  });
});
