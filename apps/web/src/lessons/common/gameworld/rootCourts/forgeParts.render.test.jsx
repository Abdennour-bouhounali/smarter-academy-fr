import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Mirror, Line, beats } from './forgeParts';
import { caseOf } from './ruleForge';

describe('the mirror of this world draws a case with THE court', () => {
  it('passes the stage through and says what the world did once it is done', () => {
    const c = caseOf('30', '5,47');
    const ask = renderToString(<Mirror c={c} stage="ask" fast />);
    expect(ask).toContain('data-rf-stage="ask"');
    expect(ask).toContain('data-rf-court="30|5,47"');
    expect(ask).toContain('data-court="30"');
    expect(ask).not.toContain('data-rf-kind');
    const done = renderToString(<Mirror c={c} stage="done" fast />);
    expect(done).toContain('data-rf-kind="band"');
    expect(done).toContain('data-court-zoom="100"');
    expect(done).toContain('crt-court is-done is-band');
    expect(done).toContain('is-fast');
  });
  it('draws the tight court when it shares the screen with the tiles, and a forced lens', () => {
    const out = renderToString(<Mirror c={{ ...caseOf('30', '5'), zoom: 1000 }} stage="done" tight />);
    expect(out).toContain('crt-mirror is-tight');
    expect(out).toMatch(/crt-court[^"]*is-tight/);
    expect(out).toContain('data-court-zoom="1000"');
  });
  it('four strokes for every case', () => {
    expect(beats(caseOf('30', '5'))).toBe(4);
  });
});

describe('a line of evidence — in the world’s words, for each outcome', () => {
  const line = (c, kids) => renderToString(<Line c={c}>{kids}</Line>);
  it('a ride, a band, a jam: « salle · toise », the world’s word, its colour, a thumbnail', () => {
    for (const [a, s, kind, word] of [
      ['36', '6', 'ride', 'Elle monte'],
      ['30', '5', 'band', 'Une bande'],
      ['30', '6', 'jam', 'Elle coince'],
    ]) {
      const out = line(caseOf(a, s));
      expect(out).toContain(`data-rc-line="${kind}"`);
      expect(out).toContain(`crt-kind--${kind}">${word}<`);
      expect(out).toContain(`<strong dir="ltr">${a}</strong>`);
      expect(out).toContain(`<strong dir="ltr">${s}</strong>`);
      expect(out).toContain('<span>salle</span>');
      expect(out).toContain('<span>toise</span>');
      expect(out).not.toMatch(/[\u0600-\u06FF]/);
      expect(out).toContain(`crt-mini is-${kind}`);
      expect(out).not.toMatch(/planche|pont|fossé|règle/i); // never the first world's words (defects.md A10)
    }
  });
  it('a wall is written « √30 » left to right; the tag, the mirror’s mark and what his rule says are shown', () => {
    const out = line({ ...caseOf('30', 'wall', { tag: 'mur' }), mirror: true }, <small className="rf-says">✓</small>);
    // a real radical (KaTeX: the bar over the number), inside a left-to-right isolate
    expect(out).toMatch(/<strong dir="ltr">.*katex.*sqrt.*30.*<\/strong>/s);
    expect(out).toContain('crt-line__tag">mur<');
    expect(out).toContain('rf-inmirror');
    expect(out).toContain('title="Construite par le miroir"');
    expect(out).toContain('rf-says');
  });
  it('a court or a rod that is a fraction is stacked over a real bar — never « p/q » as text (defects.md D41)', () => {
    const out = line(caseOf('49/64', '11/6'));
    expect(out).toContain('data-rc-frac="49/64"');
    expect(out).toContain('data-rc-frac="11/6"');
    expect(out).toMatch(/di-frac[^>]*><b>49<\/b><span class="di-frac__bar"[^>]*><\/span><b>64<\/b>/);
    const text = out.replace(/<[^>]+>/g, ' ');
    expect(text).not.toMatch(/\d+\s*\/\s*\d+/);
    const band = line(caseOf('2', '17/12'));
    expect(band).toContain('data-rc-frac="17/12"');
    expect(band.replace(/<[^>]+>/g, ' ')).not.toMatch(/\d+\s*\/\s*\d+/);
    // a whole and a decimal court stay one plain number
    expect(line(caseOf('30', '5,47'))).toContain('<strong dir="ltr">30</strong>');
  });
  it('a case with a `head` is named by it, not by its court and rod', () => {
    const out = line(caseOf('30', '5,47', { head: 'toise de la calculatrice' }));
    expect(out).toContain('crt-line__name">toise de la calculatrice<');
    expect(out).not.toContain('<strong dir="ltr">30</strong>');
    expect(out).toContain('crt-kind--band');
  });
  it('the look follows what the world did, even when the case asks another question (`held` given)', () => {
    const out = line(caseOf('30', '5', { held: true }));
    expect(out).toContain('crt-kind--band');
  });
});
