import { describe, expect, it } from 'vitest';
import { withoutBookRef } from './bookRef.js';

describe('withoutBookRef — no student-visible pointer to the textbook', () => {
  it.each([
    ['أتمرّن — الكتاب ص 30 و 32', 'أتمرّن'],
    ['معارف — الكتاب ص 55', 'معارف'],
    ['أوظّف تعلّماتي — الكتاب ص 14 و 15', 'أوظّف تعلّماتي'],
    ['معارف ص 12 — طرائق ص 13', 'معارف — طرائق'],
    ['تحدّ — مآزر المدارس (الكتاب ص 7)', 'تحدّ — مآزر المدارس'],
    ['أتمرّن — الكتاب ص 45 و 46', 'أتمرّن'],
    ['تحدّ — الكتاب ص 35 و 48', 'تحدّ'],
  ])('%s → %s', (input, expected) => {
    expect(withoutBookRef(input)).toBe(expected);
  });

  it('a tag that was only a book reference disappears', () => {
    expect(withoutBookRef('الكتاب ص 9، 13 و 15')).toBeNull();
    expect(withoutBookRef('الكتاب ص 11 و 14')).toBeNull();
  });

  it('leaves « الكتابة » and tags without a reference untouched', () => {
    expect(withoutBookRef('الكتابة العلمية')).toBe('الكتابة العلمية');
    expect(withoutBookRef('وضعيات تدريبية')).toBe('وضعيات تدريبية');
    expect(withoutBookRef('الجواب الخاطئ ينقص 4 نقاط')).toBe('الجواب الخاطئ ينقص 4 نقاط');
    expect(withoutBookRef(undefined)).toBeUndefined();
  });
});
