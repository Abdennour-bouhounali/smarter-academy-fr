import { beforeEach, describe, expect, it } from 'vitest';
import { readCachedSessionUser, writeCachedSessionUser, clearCachedSessionUser, SESSION_USER_KEY } from './sessionUserCache';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  };
}

describe('sessionUserCache', () => {
  beforeEach(() => {
    globalThis.localStorage = memoryStorage();
  });

  it('returns the user cached for the same token', () => {
    writeCachedSessionUser('token-abcdefghijklmnopqrstuvwxyz', { id: 7, role: 'student' });
    expect(readCachedSessionUser('token-abcdefghijklmnopqrstuvwxyz')).toEqual({ id: 7, role: 'student' });
  });

  it('never returns the user of another token', () => {
    writeCachedSessionUser('token-A-abcdefghijklmnopqrstuvwxyz', { id: 7 });
    expect(readCachedSessionUser('token-B-zyxwvutsrqponmlkjihgfedcba')).toBeNull();
    expect(readCachedSessionUser(null)).toBeNull();
  });

  it('does not store the token itself', () => {
    const token = '42|averysecretplaintexttokenvalue0123456789';
    writeCachedSessionUser(token, { id: 1 });
    expect(localStorage.getItem(SESSION_USER_KEY)).not.toContain(token);
  });

  it('is cleared, and tolerates corrupt data', () => {
    writeCachedSessionUser('token-abcdefghijklmnopqrstuvwxyz', { id: 7 });
    clearCachedSessionUser();
    expect(readCachedSessionUser('token-abcdefghijklmnopqrstuvwxyz')).toBeNull();
    localStorage.setItem(SESSION_USER_KEY, '{not json');
    expect(readCachedSessionUser('token-abcdefghijklmnopqrstuvwxyz')).toBeNull();
  });
});
