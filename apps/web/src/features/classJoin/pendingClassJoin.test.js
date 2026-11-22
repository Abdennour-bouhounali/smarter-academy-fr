import { describe, expect, it } from 'vitest';
import {
  PENDING_TTL_MS,
  autoJoinRequest,
  clearPendingClassJoin,
  isJoinLinkToken,
  joinLinkPath,
  joinLinkUrl,
  postAuthPath,
  readPendingClassJoin,
  savePendingClassJoin,
} from './pendingClassJoin';

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    dump: () => Object.fromEntries(map),
  };
}

const TOKEN = 'aB3dE5gH7jK9mN1pQ3sT5vW7yZ9bC1dE';
const NOW = 1_800_000_000_000;
const STUDENT = { role: 'student', emailVerified: true };

describe('le jeton du lien de classe', () => {
  it('32 symboles base62, rien d’autre', () => {
    expect(isJoinLinkToken(TOKEN)).toBe(true);
    expect(isJoinLinkToken(TOKEN.slice(1))).toBe(false);
    expect(isJoinLinkToken(`${TOKEN.slice(1)}/`)).toBe(false);
    expect(isJoinLinkToken('../../admin')).toBe(false);
    expect(isJoinLinkToken(null)).toBe(false);
  });

  it('le chemin et l’URL partagée', () => {
    expect(joinLinkPath(TOKEN)).toBe(`/rejoindre/classe/${TOKEN}`);
    expect(joinLinkUrl('https://smarter-academy.dz/', TOKEN)).toBe(`https://smarter-academy.dz/rejoindre/classe/${TOKEN}`);
  });
});

describe('l’adhésion en attente survit à l’authentification', () => {
  it('sauvée au clic, relue ensuite', () => {
    const s = memoryStorage();
    expect(savePendingClassJoin({ token: TOKEN, classroomName: 'رياضيات 4م2' }, s, NOW)).toBe(true);
    expect(readPendingClassJoin(s, NOW + 1000)).toEqual({ token: TOKEN, classroomName: 'رياضيات 4م2', consented: true, savedAt: NOW });
  });

  it('un jeton mal formé n’est jamais sauvé', () => {
    const s = memoryStorage();
    expect(savePendingClassJoin({ token: 'https://evil.example/x' }, s, NOW)).toBe(false);
    expect(readPendingClassJoin(s, NOW)).toBeNull();
  });

  it('périmée après une semaine, et effacée', () => {
    const s = memoryStorage();
    savePendingClassJoin({ token: TOKEN }, s, NOW);
    expect(readPendingClassJoin(s, NOW + PENDING_TTL_MS + 1)).toBeNull();
    expect(s.dump()).toEqual({});
  });

  it('altérée (jeton, consentement) : ignorée et effacée', () => {
    const s = memoryStorage();
    s.setItem('sa.pendingClassJoin', JSON.stringify({ token: '/admin', consented: true, savedAt: NOW }));
    expect(readPendingClassJoin(s, NOW)).toBeNull();
    s.setItem('sa.pendingClassJoin', JSON.stringify({ token: TOKEN, consented: false, savedAt: NOW }));
    expect(readPendingClassJoin(s, NOW)).toBeNull();
    s.setItem('sa.pendingClassJoin', '{pas du json');
    expect(readPendingClassJoin(s, NOW)).toBeNull();
  });

  it('un stockage qui lève (navigation privée) ne casse rien', () => {
    const throwing = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); }, removeItem: () => { throw new Error('x'); } };
    expect(savePendingClassJoin({ token: TOKEN }, throwing, NOW)).toBe(false);
    expect(readPendingClassJoin(throwing, NOW)).toBeNull();
    expect(() => clearPendingClassJoin(throwing)).not.toThrow();
  });
});

describe('postAuthPath — où va l’utilisateur authentifié', () => {
  it('élève vérifié avec une adhésion en attente → la page du lien', () => {
    const s = memoryStorage();
    savePendingClassJoin({ token: TOKEN }, s, NOW);
    expect(postAuthPath(STUDENT, '/espace', s, NOW)).toBe(`/rejoindre/classe/${TOKEN}`);
  });

  it('adresse non vérifiée → d’abord la vérification (le serveur refuserait)', () => {
    const s = memoryStorage();
    savePendingClassJoin({ token: TOKEN }, s, NOW);
    expect(postAuthPath({ role: 'student', emailVerified: false }, '/verification-email', s, NOW)).toBe('/verification-email');
    // L'attente n'est pas consommée : elle servira après la vérification.
    expect(readPendingClassJoin(s, NOW)).not.toBeNull();
  });

  it('enseignant ou admin : jamais redirigé vers un lien d’élève', () => {
    const s = memoryStorage();
    savePendingClassJoin({ token: TOKEN }, s, NOW);
    expect(postAuthPath({ role: 'teacher', emailVerified: true }, '/enseignant', s, NOW)).toBe('/enseignant');
    expect(postAuthPath({ role: 'admin' }, '/admin', s, NOW)).toBe('/admin');
  });

  it('rien en attente → la destination habituelle', () => {
    expect(postAuthPath(STUDENT, '/espace', memoryStorage(), NOW)).toBe('/espace');
  });
});

describe('autoJoinRequest — ouvrir un lien ne vaut pas consentement', () => {
  const pending = { token: TOKEN, consented: true, savedAt: NOW };

  it('le geste de consentement POUR CE LIEN déclenche l’adhésion', () => {
    expect(autoJoinRequest(pending, TOKEN)).toEqual({ link: TOKEN, consent: true });
  });

  it('sans attente, ou pour un autre lien, rien ne part', () => {
    expect(autoJoinRequest(null, TOKEN)).toBeNull();
    expect(autoJoinRequest(pending, 'Z'.repeat(32))).toBeNull();
    expect(autoJoinRequest({ ...pending, consented: false }, TOKEN)).toBeNull();
  });
});
