import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import MathLabel from './MathLabel';

const text = (html) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');

describe('MathLabel — content text outside a module', () => {
  it('never prints the dollars or the backslashes, even before KaTeX has loaded', () => {
    const out = text(renderToString(<p><MathLabel>{'Connaître la notation $x \\longmapsto ax + b$.'}</MathLabel></p>));
    expect(out).not.toMatch(/[$\\]/);
    expect(out).toContain('x ⟼ ax + b');
  });
  it('renders plain text as it is written: one direction, no invisible mark around an equality', () => {
    const s = 'Le loyer 35000 = 185 × 0 + 35000';
    const out = text(renderToString(<p><MathLabel>{s}</MathLabel></p>));
    expect(out).toBe(s);
    expect(out).not.toMatch(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/);
  });
});
