import { describe, it, expect } from 'vitest';
import { hasRequiredRole } from './auth';

describe('hasRequiredRole', () => {
  it('allows a user whose role is in the allowed list', () => {
    expect(hasRequiredRole({ role: 'admin' }, ['admin'])).toBe(true);
  });

  it('rejects a user whose role is not in the allowed list', () => {
    expect(hasRequiredRole({ role: 'student' }, ['admin'])).toBe(false);
  });

  it('rejects when there is no user', () => {
    expect(hasRequiredRole(null, ['admin'])).toBe(false);
    expect(hasRequiredRole(undefined, ['admin'])).toBe(false);
  });

  it('supports more than one allowed role', () => {
    expect(hasRequiredRole({ role: 'student' }, ['admin', 'student'])).toBe(true);
    expect(hasRequiredRole({ role: 'guest' }, ['admin', 'student'])).toBe(false);
  });
});
