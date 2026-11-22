import { describe, expect, it } from 'vitest';
import { getDisplayName, getFullName, getInitials } from './userDisplay';

describe('userDisplay', () => {
  const lea = { firstName: 'Léa', lastName: 'Martin-Durand', email: 'lea@example.fr' };

  it('greets by first name, shows the full name on the profile', () => {
    expect(getDisplayName(lea)).toBe('Léa');
    expect(getFullName(lea)).toBe('Léa Martin-Durand');
  });

  it('falls back to the email local part only when there is no name', () => {
    expect(getDisplayName({ email: 'x.y@example.fr' })).toBe('x.y');
    expect(getFullName({ email: 'x.y@example.fr' })).toBe('x.y');
  });

  it('writes two tight capitals, accents kept', () => {
    expect(getInitials(lea)).toBe('LM');
    expect(getInitials({ firstName: 'élodie', lastName: 'ozil' })).toBe('ÉO');
    expect(getInitials({ email: 'zoe@example.fr' })).toBe('Z');
  });
});
