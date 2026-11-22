import React from 'react';
import { describe, it, expect } from 'vitest';
import { textOf, fingerprint, answerKey, mergeAnswers } from './answersModel';

describe('answersModel — les réponses gardées pour l’élève (pilote 2026-11-07)', () => {
  it('le texte d’une question : chaînes, nombres et enfants imbriqués', () => {
    expect(textOf(['حاصل ', 12, React.createElement('b', null, 'و', React.createElement('i', null, 'x'))])).toBe('حاصل  12 و x');
  });
  it('la même question donne la même clé ; un autre texte, une autre', () => {
    expect(answerKey(2, ['هل 6 قاسم؟', ['نعم', 'لا']])).toBe(answerKey(2, ['هل 6 قاسم؟', ['نعم', 'لا']]));
    expect(answerKey(2, ['هل 6 قاسم؟', ['نعم', 'لا']])).not.toBe(answerKey(2, ['هل 7 قاسم؟', ['نعم', 'لا']]));
    expect(answerKey(2, ['x'])).not.toBe(answerKey(3, ['x']));
    expect(fingerprint('a  b')).toBe(fingerprint('a b'));
  });
  it('la fusion garde, clé par clé, la réponse la plus récente', () => {
    const merged = mergeAnswers({ k1: { v: 1, at: 200 }, k2: { v: 'a', at: 100 } }, { k1: { v: 0, at: 150 }, k2: { v: 'b', at: 300 }, k3: { v: 2, at: 1 } });
    expect(merged).toEqual({ k1: { v: 1, at: 200 }, k2: { v: 'b', at: 300 }, k3: { v: 2, at: 1 } });
  });
});
