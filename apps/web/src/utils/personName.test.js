import { describe, expect, it } from 'vitest';
import { liveNameError, nameError, needsName, normalizeName, personNameErrors } from './personName';

// An Arabic-script first name, written as escapes so that no Arabic character sits in this file (test/noArabic.test.js).
const ARABIC_NAME = '\u0623\u0645\u064A\u0646';

describe('personName — mirror of PersonName.php (French letters only)', () => {
  it('normalizes like the server: NFC, trimmed, inner spaces collapsed', () => {
    expect(normalizeName('  Jean   Pierre ')).toBe('Jean Pierre');
    // « é » typed as e + combining acute is the same letter as « é ».
    expect(normalizeName('Léa')).toBe('Léa');
    expect(normalizeName(null)).toBe('');
  });

  it('accepts French names, with accents, a space, a hyphen or an apostrophe between two letters', () => {
    for (const ok of ['Léa', 'L', 'Chloé', 'Jean-Pierre', 'Marie Ève', "D'Almeida", 'O’Neil', 'Lætitia', 'Œdipe', 'Zoë', 'Anaïs', 'Ÿvon']) {
      expect(nameError(ok), ok).toBeNull();
    }
  });

  it('refuses a name written in Arabic script', () => {
    expect(nameError(ARABIC_NAME)).toBe('invalid');
    expect(nameError(`Amine ${ARABIC_NAME}`)).toBe('invalid');
  });

  it('rejects what is not a name', () => {
    expect(nameError('')).toBe('required');
    expect(nameError('   ')).toBe('required');
    expect(nameError('a'.repeat(50))).toBeNull();
    expect(nameError('a'.repeat(51))).toBe('tooLong');
    for (const bad of ['Léa3', '-Léa', 'Léa-', "'Léa", 'Jean - Pierre', 'Jean--Pierre', "D''Almeida", 'Léa.', 'Ñuria', '😀', '<b>']) {
      expect(nameError(bad), bad).toBe('invalid');
    }
  });

  it('live: flags wrong characters at once, waits for blur on a missing name', () => {
    expect(liveNameError('Léa3')).toBe('invalid');
    expect(liveNameError(ARABIC_NAME.slice(0, 1))).toBe('invalid');
    expect(liveNameError('L')).toBeNull();
    expect(liveNameError('')).toBeNull();
    expect(liveNameError('', { touched: true })).toBe('required');
    expect(liveNameError('a'.repeat(51))).toBe('tooLong');
    // mid-typing a compound name
    expect(liveNameError('Jean ')).toBeNull();
    expect(liveNameError('Jean-')).toBeNull();
    expect(liveNameError('D’')).toBeNull();
  });

  it('reports each field separately', () => {
    expect(personNameErrors({ firstName: 'Léa', lastName: '' })).toEqual({ lastName: 'required' });
    expect(personNameErrors({ firstName: 'Léa2', lastName: 'Martin' })).toEqual({ firstName: 'invalid' });
    expect(personNameErrors({ firstName: 'Léa', lastName: 'Martin' })).toEqual({});
  });

  it('needsName reads the server flag, and never gates admins', () => {
    expect(needsName({ role: 'student', nameComplete: false, firstName: 'x' })).toBe(true);
    expect(needsName({ role: 'teacher', nameComplete: true })).toBe(false);
    expect(needsName({ role: 'student', firstName: 'Léa', lastName: null })).toBe(true);
    expect(needsName({ role: 'student', firstName: ARABIC_NAME, lastName: 'Martin' })).toBe(true);
    expect(needsName({ role: 'student', firstName: 'Léa', lastName: 'Martin' })).toBe(false);
    expect(needsName({ role: 'admin', nameComplete: false })).toBe(false);
    expect(needsName(null)).toBe(false);
  });
});
