import { describe, expect, it } from 'vitest';
import { getDisplayName, getFullName, getInitials } from './userDisplay';

describe('userDisplay', () => {
  const amine = { firstName: 'أمين', lastName: 'بن علي', email: 'amine@example.dz' };

  it('greets by first name, shows the full name on the profile', () => {
    expect(getDisplayName(amine)).toBe('أمين');
    expect(getFullName(amine)).toBe('أمين بن علي');
  });

  it('falls back to the email local part only when there is no name', () => {
    expect(getDisplayName({ email: 'x.y@example.dz' })).toBe('x.y');
    expect(getFullName({ email: 'x.y@example.dz' })).toBe('x.y');
  });

  it('keeps Arabic initials from joining into a word', () => {
    expect(getInitials(amine)).toBe('أ\u2009ب');
    expect(getInitials({ firstName: 'lea', lastName: 'martin' })).toBe('LM');
  });
});
