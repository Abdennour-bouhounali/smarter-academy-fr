import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { needsEmailVerification } from './emailVerification';

describe('needsEmailVerification', () => {
  it('ferme la porte à un élève ou un enseignant non vérifié', () => {
    expect(needsEmailVerification({ role: 'student', emailVerified: false })).toBe(true);
    expect(needsEmailVerification({ role: 'teacher', emailVerified: false })).toBe(true);
  });

  it('laisse passer un compte vérifié, un administrateur, ou un champ absent', () => {
    expect(needsEmailVerification({ role: 'student', emailVerified: true })).toBe(false);
    expect(needsEmailVerification({ role: 'admin', emailVerified: false })).toBe(false);
    expect(needsEmailVerification({ role: 'student' })).toBe(false);
    expect(needsEmailVerification(null)).toBe(false);
  });
});

describe('« فضائي » avant la vérification', () => {
  const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

  it('ProtectedRoute renvoie vers /verification-email', () => {
    const src = read('../components/auth/ProtectedRoute.jsx');
    expect(src).toContain('needsEmailVerification(user)');
    expect(src).toContain('<Navigate to="/verification-email" replace />');
  });

  it('la barre de navigation ne propose pas l’espace à un compte non vérifié', () => {
    const src = read('../components/navigation/Navbar.jsx');
    expect(src).toContain("to={unverified ? '/verification-email' : '/espace'}");
    expect(src).toContain("to={unverified ? '/verification-email' : '/enseignant'}");
  });
});
