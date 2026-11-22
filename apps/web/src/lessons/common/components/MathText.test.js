import { describe, it, expect } from 'vitest';
import { mathSegments } from './MathText';

const inline = (...pieces) => ({ type: 'inline', pieces });

describe('mathSegments — a Latin word attached to a formula shares its LTR island', () => {
  it('keeps the plain cases unchanged: text, one formula per island, block math', () => {
    expect(mathSegments('$a$ و $b$ عددان')).toEqual([
      inline({ math: 'a' }), { type: 'text', text: ' و ' }, inline({ math: 'b' }), { type: 'text', text: ' عددان' },
    ]);
    expect(mathSegments('$a$ ، $b$')).toEqual([inline({ math: 'a' }), { type: 'text', text: ' ، ' }, inline({ math: 'b' })]);
    expect(mathSegments('$$x = 1$$')).toEqual([{ type: 'block', math: 'x = 1' }]);
    expect(mathSegments('بدون رياضيات')).toEqual([{ type: 'text', text: 'بدون رياضيات' }]);
  });

  it('joins « PGCD$(a ; b)$ » and « PGCD $(a ; b)$ » into one island', () => {
    expect(mathSegments('PGCD$(a ; a) = a$')).toEqual([inline({ text: 'PGCD' }, { math: '(a ; a) = a' })]);
    expect(mathSegments('ويرمز له بالرمز PGCD $(a ; b)$.')).toEqual([
      { type: 'text', text: 'ويرمز له بالرمز ' }, inline({ text: 'PGCD ' }, { math: '(a ; b)' }), { type: 'text', text: '.' },
    ]);
  });

  it('keeps a whole equality chain in ONE island — two islands side by side would be reordered by RTL', () => {
    expect(mathSegments('PGCD$(a ; b) = $ PGCD$(b ; a - b)$ مع $a \\geq b$')).toEqual([
      inline({ text: 'PGCD' }, { math: '(a ; b) = ' }, { text: ' PGCD' }, { math: '(b ; a - b)' }),
      { type: 'text', text: ' مع ' },
      inline({ math: 'a \\geq b' }),
    ]);
  });

  it('never pulls Arabic, digits or punctuation into an island', () => {
    expect(mathSegments('العدد 12$x$')).toEqual([{ type: 'text', text: 'العدد 12' }, inline({ math: 'x' })]);
    expect(mathSegments('k حيث $m = d \\times k$')).toEqual([{ type: 'text', text: 'k حيث ' }, inline({ math: 'm = d \\times k' })]);
  });
});
