import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import RichText from './RichText';

// One direction (FRENCH_LANGUAGE_CONTRACT.md §8): an equality written in the words reads as it is written — no invisible
// isolate (U+2066–U+2069) is put around it any more (utils/bidi.js is gone, 2026-11-23).
const BIDI = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/;

describe('RichText — une égalité écrite en clair reste telle qu’elle est écrite', () => {
  it('« 15 = 3 × 5 » dans une phrase, sans marque invisible', () => {
    const html = renderToStaticMarkup(<RichText>{'car 15 = 3 × 5 seulement'}</RichText>);
    expect(html).toContain('car 15 = 3 × 5 seulement');
    expect(html).not.toMatch(BIDI);
  });

  it('dans le gras aussi', () => {
    const html = renderToStaticMarkup(<RichText>{'**84/48** avec le PGCD'}</RichText>);
    expect(html).toContain('84/48');
    expect(html).not.toMatch(BIDI);
  });

  it('un $…$ est dessiné par KaTeX', () => {
    const html = renderToStaticMarkup(<RichText>{'On a : $120 = 6 \\times 20$.'}</RichText>);
    expect(html).toContain('katex');
    expect(html).not.toMatch(BIDI);
  });
});
