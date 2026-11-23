import { describe, it, expect } from 'vitest';
import { mathSegments } from './MathText';

const inline = (...pieces) => ({ type: 'inline', pieces });

describe('mathSegments — a Latin word attached to a formula shares its LTR island', () => {
  it('keeps the plain cases unchanged: text, one formula per island, block math', () => {
    expect(mathSegments('$a$, $b$ sont deux nombres')).toEqual([
      inline({ math: 'a' }), { type: 'text', text: ', ' }, inline({ math: 'b' }), { type: 'text', text: ' sont deux nombres' },
    ]);
    expect(mathSegments('$a$ ; $b$')).toEqual([inline({ math: 'a' }), { type: 'text', text: ' ; ' }, inline({ math: 'b' })]);
    expect(mathSegments('$$x = 1$$')).toEqual([{ type: 'block', math: 'x = 1' }]);
    expect(mathSegments('sans formule')).toEqual([{ type: 'text', text: 'sans formule' }]);
  });

  it('joins « PGCD$(a ; b)$ » and « PGCD $(a ; b)$ » into one island', () => {
    expect(mathSegments('PGCD$(a ; a) = a$')).toEqual([inline({ text: 'PGCD' }, { math: '(a\\,;\\,a) = a' })]);
    expect(mathSegments('On le note PGCD $(a ; b)$.')).toEqual([
      { type: 'text', text: 'On le note ' }, inline({ text: 'PGCD ' }, { math: '(a\\,;\\,b)' }), { type: 'text', text: '.' },
    ]);
  });

  it('keeps a whole equality chain in ONE island — it never breaks across two islands', () => {
    expect(mathSegments('PGCD$(a ; b) = $ PGCD$(b ; a - b)$ où $a \\geq b$')).toEqual([
      inline({ text: 'PGCD' }, { math: '(a\\,;\\,b) = ' }, { text: ' PGCD' }, { math: '(b\\,;\\,a - b)' }),
      { type: 'text', text: ' où ' },
      inline({ math: 'a \\geq b' }),
    ]);
  });

  it('never pulls digits, accented words or punctuation into an island', () => {
    expect(mathSegments('le nombre 12$x$')).toEqual([{ type: 'text', text: 'le nombre 12' }, inline({ math: 'x' })]);
    expect(mathSegments('k, où $m = d \\times k$')).toEqual([{ type: 'text', text: 'k, où ' }, inline({ math: 'm = d \\times k' })]);
    // an accented word is never cut in two: « écrit » stays whole, outside the island
    expect(mathSegments('tu as écrit $x$')).toEqual([{ type: 'text', text: 'tu as écrit ' }, inline({ math: 'x' })]);
    expect(mathSegments('la clé $k$')).toEqual([{ type: 'text', text: 'la clé ' }, inline({ math: 'k' })]);
  });
});

describe('mathSegments — the French pair inside a formula', () => {
  it('« PGCD(a ; b) » gets a thin space on each side of « ; »; a \\; command is left alone', () => {
    expect(mathSegments('$\\mathrm{PGCD}(12 ; 18)$')).toEqual([inline({ math: '\\mathrm{PGCD}(12\\,;\\,18)' })]);
    expect(mathSegments('$$x \\; y$$')).toEqual([{ type: 'block', math: 'x \\; y' }]);
  });
});
