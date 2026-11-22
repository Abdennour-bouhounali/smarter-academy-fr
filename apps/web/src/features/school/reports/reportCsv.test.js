import { describe, expect, it } from 'vitest';
import { reportRows, toCsv } from './reportCsv';

const label = (k) => `[${k}]`;
const stateLabel = (s) => `<${s}>`;

describe('reportRows', () => {
  it('flattens a class report into counts per learning point, then the students to watch', () => {
    const rows = reportRows({
      type: 'class',
      payload: {
        lessons: [{ title: 'القاسم', learningPoints: [{ title: 'ك1', counts: { mastered: 3, reinforce: 1, gap: 2, unassessed: 4 } }] }],
        studentsToWatch: [{ firstName: 'أمين', lastName: 'بوعلام', gap: 2, reinforce: 1, mastered: 0 }],
      },
    }, label, stateLabel);
    expect(rows[0]).toEqual(['[lesson]', '[learningPoint]', '[mastered]', '[reinforce]', '[gap]', '[unassessed]']);
    expect(rows[1]).toEqual(['القاسم', 'ك1', 3, 1, 2, 4]);
    expect(rows.at(-1)).toEqual(['أمين بوعلام', 2, 1, 0]);
  });

  it('gives one row per learning point AND class in a grade report', () => {
    const rows = reportRows({
      type: 'grade',
      payload: { map: { classes: [{ id: 7, name: '4م1' }, { id: 8, name: '4م2' }], lessons: [{ title: 'ل', learningPoints: [{ title: 'ك', byClass: { 7: { mastered: 1, reinforce: 0, gap: 0, unassessed: 0 } } }] }] } },
    }, label, stateLabel);
    expect(rows).toHaveLength(3);
    expect(rows[2]).toEqual(['ل', 'ك', '4م2', 0, 0, 0, 0]);
  });

  it('labels each state of a student report and never invents an average', () => {
    const rows = reportRows({ type: 'student', payload: { progress: { lessons: [{ title: 'ل', learningPoints: [{ title: 'ك', status: 'gap' }] }] } } }, label, stateLabel);
    expect(rows[1]).toEqual(['ل', 'ك', '<gap>']);
    expect(JSON.stringify(rows)).not.toMatch(/average|moyenne/i);
  });

  it('returns nothing for an unknown type', () => {
    expect(reportRows({ type: 'nope', payload: {} }, label, stateLabel)).toEqual([]);
  });
});

describe('toCsv', () => {
  it('starts with a BOM, quotes commas and quotes, and ends lines with CRLF', () => {
    expect(toCsv([['a,b', 'c"d'], [1, null]])).toBe('﻿"a,b","c""d"\r\n1,\r\n');
  });
});
