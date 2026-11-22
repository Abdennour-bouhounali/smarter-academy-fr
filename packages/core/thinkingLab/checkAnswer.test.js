import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { checkAnswer, CHECKS } from './checkAnswer.js';

describe('checkAnswer — les cinq checks', () => {
  it('integer délègue à l\'évaluateur rationnel de la pratique', () => {
    const spec = { check: 'integer', value: '12' };
    expect(checkAnswer(spec, '12').outcome).toBe('correct');
    expect(checkAnswer(spec, '24/2').outcome).toBe('equivalent_correct');
    expect(checkAnswer(spec, '١٢').correct).toBe(true);
    expect(checkAnswer(spec, '13').outcome).toBe('incorrect');
    expect(checkAnswer(spec, 'abc').outcome).toBe('syntax_error');
  });

  it('rational : valeur exacte, jamais à epsilon près', () => {
    const spec = { check: 'rational', value: '3/10' };
    expect(checkAnswer(spec, '0,3').correct).toBe(true);
    expect(checkAnswer(spec, '6/20').correct).toBe(true);
    expect(checkAnswer(spec, '0.30001').correct).toBe(false);
  });

  it('number : tolérance relative/absolue, constantes permises', () => {
    const spec = { check: 'number', value: 'pi/4', relTol: 1e-3 };
    expect(checkAnswer(spec, '0.7854').correct).toBe(true);
    expect(checkAnswer(spec, 'π/4').correct).toBe(true);
    expect(checkAnswer(spec, '0.78').correct).toBe(false);
    expect(checkAnswer(spec, '50%').correct).toBe(false);
  });

  it('choice : par identifiant de choix', () => {
    const spec = { check: 'choice', value: 'B', choices: [{ id: 'A' }, { id: 'B' }, { id: 'C' }] };
    expect(checkAnswer(spec, 'B').correct).toBe(true);
    expect(checkAnswer(spec, { choiceId: 'B' }).correct).toBe(true);
    expect(checkAnswer(spec, 'A', { mistakes: [{ value: 'A', reply: '…' }] })).toMatchObject({ correct: false, mistakeIndex: 0 });
  });

  it('une saisie vide est une syntax_error, jamais un incorrect', () => {
    for (const check of CHECKS) {
      expect(checkAnswer({ check, value: '1', vars: [], choices: [{ id: '1' }] }, '  ').outcome).toBe('syntax_error');
    }
  });

  it('un check inconnu LÈVE', () => {
    expect(() => checkAnswer({ check: 'quantique', value: '1' }, '1')).toThrow(/inconnu/);
  });
});

describe('acceptation de la phase 0 — le défi vitrine #318', () => {
  // Copie du `answer`/`mistakes` de content/thinking-lab/challenges/0318-four-arcs-area.json ;
  // scripts/thinking-lab-oracle.test.mjs refait la même vérification sur le fichier de contenu.
  const spec = {
    check: 'expression',
    value: 'x^2*(1+pi/3-sqrt(3))',
    vars: ['x'],
    domain: { x: { min: 0.5, max: 10 } },
  };
  const mistakes = [
    { value: '1-pi/4', scaleWith: 'x^2', reply: 'ركن' },
    { value: 'pi/2-1', scaleWith: 'x^2', reply: 'عدسة' },
    { value: 'x^2', outside: [0, 1], at: { x: 1 }, reply: 'خارج المربّع' },
  ];

  it.each([
    ['(3+π−3√3)x²/3'],
    ['x² + πx²/3 − √3x²'],
    ['x^(2)(1+(pi)/(3)-sqrt(3))'],
  ])('accepte %s', (raw) => {
    expect(checkAnswer(spec, raw, { mistakes })).toMatchObject({ correct: true, mistakeIndex: null });
  });

  it('accepte l\'écriture du contenu comme « correct »', () => {
    expect(checkAnswer(spec, 'x^2*(1+pi/3-sqrt(3))').outcome).toBe('correct');
  });

  it.each([
    ['x^2(1-π/4)', 0],
    ['(π/2−1)x²', 1],
    ['x²', 2],
    ['-x^2', 2],
  ])('refuse %s et reconnaît l\'erreur déclarée n°%i', (raw, index) => {
    expect(checkAnswer(spec, raw, { mistakes })).toMatchObject({ outcome: 'incorrect', correct: false, mistakeIndex: index });
  });

  it('une erreur non déclarée est refusée sans réponse ciblée', () => {
    expect(checkAnswer(spec, '0.2x^2', { mistakes })).toMatchObject({ correct: false, mistakeIndex: null });
  });
});

describe('fixture partagée du juge JS ↔ PHP (content/thinking-lab/_fixtures/answers.json)', () => {
  const fixture = JSON.parse(readFileSync(new URL('../../../content/thinking-lab/_fixtures/answers.json', import.meta.url), 'utf8'));

  it('couvre les cinq checks', () => {
    expect(new Set(fixture.cases.map((c) => c.spec.check))).toEqual(new Set(CHECKS));
  });

  for (const { name, spec, raw, mistakes, expected } of fixture.cases) {
    it(name, () => {
      expect(checkAnswer(spec, raw, { mistakes })).toEqual(expected);
    });
  }
});
