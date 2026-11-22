import { describe, expect, it } from 'vitest';
import { normalizeDate, parseRoster } from './rosterCsv';

describe('parseRoster', () => {
  it('reads last name, first name, birth date and skips an Arabic header', () => {
    const text = 'اللقب,الاسم,تاريخ الميلاد\nبوعلام,أمين,2012-03-14\nحداد,ليلى,02/11/2012\n';
    expect(parseRoster(text)).toEqual([
      { lastName: 'بوعلام', firstName: 'أمين', birthDate: '2012-03-14' },
      { lastName: 'حداد', firstName: 'ليلى', birthDate: '2012-11-02' },
    ]);
  });

  it('accepts semicolons, tabs (spreadsheet paste), quotes, a BOM and blank lines', () => {
    expect(parseRoster('﻿بوعلام;أمين;14/03/2012\n\n"حداد"\t"ليلى"\t2.11.2012')).toEqual([
      { lastName: 'بوعلام', firstName: 'أمين', birthDate: '2012-03-14' },
      { lastName: 'حداد', firstName: 'ليلى', birthDate: '2012-11-02' },
    ]);
  });

  it('keeps an incomplete row so the server can name the problem', () => {
    expect(parseRoster('بوعلام')).toEqual([{ lastName: 'بوعلام', firstName: '', birthDate: '' }]);
  });

  it('returns nothing for empty input', () => {
    expect(parseRoster('')).toEqual([]);
    expect(parseRoster(null)).toEqual([]);
  });
});

describe('normalizeDate', () => {
  it('turns day-first dates into ISO and leaves other text for the server', () => {
    expect(normalizeDate('4/3/2012')).toBe('2012-03-04');
    expect(normalizeDate('2012-03-04')).toBe('2012-03-04');
    expect(normalizeDate('mars 2012')).toBe('mars 2012');
  });
});
