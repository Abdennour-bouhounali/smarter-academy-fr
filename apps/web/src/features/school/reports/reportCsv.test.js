import { describe, expect, it } from 'vitest';
import { reportRows, toCsv } from './reportCsv';

const label = (k) => `[${k}]`;
const stateLabel = (s) => `<${s}>`;

describe('reportRows', () => {
  it('flattens a class report into counts per learning point, then the students to watch', () => {
    const rows = reportRows({
      type: 'class',
      payload: {
        lessons: [{ title: 'Diviseurs', learningPoints: [{ title: 'SF1', counts: { mastered: 3, reinforce: 1, gap: 2, unassessed: 4 } }] }],
        studentsToWatch: [{ firstName: 'Inès', lastName: 'Martin', gap: 2, reinforce: 1, mastered: 0 }],
      },
    }, label, stateLabel);
    expect(rows[0]).toEqual(['[lesson]', '[learningPoint]', '[mastered]', '[reinforce]', '[gap]', '[unassessed]']);
    expect(rows[1]).toEqual(['Diviseurs', 'SF1', 3, 1, 2, 4]);
    expect(rows.at(-1)).toEqual(['Inès Martin', 2, 1, 0]);
  });

  it('gives one row per learning point AND class in a grade report', () => {
    const rows = reportRows({
      type: 'grade',
      payload: { map: { classes: [{ id: 7, name: '3e A' }, { id: 8, name: '3e B' }], lessons: [{ title: 'L', learningPoints: [{ title: 'SF', byClass: { 7: { mastered: 1, reinforce: 0, gap: 0, unassessed: 0 } } }] }] } },
    }, label, stateLabel);
    expect(rows).toHaveLength(3);
    expect(rows[2]).toEqual(['L', 'SF', '3e B', 0, 0, 0, 0]);
  });

  it('labels each state of a student report and never invents an average', () => {
    const rows = reportRows({ type: 'student', payload: { progress: { lessons: [{ title: 'L', learningPoints: [{ title: 'SF', status: 'gap' }] }] } } }, label, stateLabel);
    expect(rows[1]).toEqual(['L', 'SF', '<gap>']);
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
