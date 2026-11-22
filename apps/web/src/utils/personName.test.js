import { describe, expect, it } from 'vitest';
import { liveNameError, nameError, needsName, normalizeName, personNameErrors } from './personName';

describe('personName — mirror of PersonName.php (Arabic letters only)', () => {
  it('normalizes whitespace like the server', () => {
    expect(normalizeName('  محمد   أمين ')).toBe('محمد أمين');
    expect(normalizeName(null)).toBe('');
  });

  it('accepts Arabic names, with harakat, tatweel, space or hyphen', () => {
    for (const ok of ['أمين', 'مُحَمَّد', 'بن علي', 'آيت-يحيى', 'محمـد', 'عبد الرحمن']) {
      expect(nameError(ok)).toBeNull();
    }
  });

  it('asks for Arabic letters when a Latin letter is typed', () => {
    for (const latin of ['Amine', 'Léa', "O'Neil", 'أمين A']) {
      expect(nameError(latin)).toBe('notArabic');
    }
  });

  it('rejects what is not a name', () => {
    expect(nameError('')).toBe('required');
    expect(nameError('   ')).toBe('required');
    expect(nameError('ب')).toBe('tooShort');
    expect(nameError('ب'.repeat(51))).toBe('tooLong');
    for (const bad of ['أمين3', 'أمين٣', 'ب،ن', '-أمين', 'أمين-', 'بن - علي', '😀😀', '<ب>']) {
      expect(nameError(bad)).toBe('invalid');
    }
  });

  it('live: flags wrong characters at once, waits for blur on missing/short', () => {
    expect(liveNameError('A')).toBe('notArabic');
    expect(liveNameError('أمين3')).toBe('invalid');
    expect(liveNameError('ب')).toBeNull();
    expect(liveNameError('ب', { touched: true })).toBe('tooShort');
    expect(liveNameError('')).toBeNull();
    expect(liveNameError('', { touched: true })).toBe('required');
    // mid-typing a compound name
    expect(liveNameError('بن ')).toBeNull();
    expect(liveNameError('آيت-')).toBeNull();
  });

  it('reports each field separately', () => {
    expect(personNameErrors({ firstName: 'أمين', lastName: '' })).toEqual({ lastName: 'required' });
    expect(personNameErrors({ firstName: 'Amine', lastName: 'بن علي' })).toEqual({ firstName: 'notArabic' });
    expect(personNameErrors({ firstName: 'أمين', lastName: 'بن علي' })).toEqual({});
  });

  it('needsName reads the server flag, and never gates admins', () => {
    expect(needsName({ role: 'student', nameComplete: false, firstName: 'x' })).toBe(true);
    expect(needsName({ role: 'teacher', nameComplete: true })).toBe(false);
    expect(needsName({ role: 'student', firstName: 'أمين', lastName: null })).toBe(true);
    expect(needsName({ role: 'student', firstName: 'Amine', lastName: 'Kaci' })).toBe(true);
    expect(needsName({ role: 'student', firstName: 'أمين', lastName: 'قاسي' })).toBe(false);
    expect(needsName({ role: 'admin', nameComplete: false })).toBe(false);
    expect(needsName(null)).toBe(false);
  });
});
