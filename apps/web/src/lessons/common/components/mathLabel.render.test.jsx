import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import MathLabel from './MathLabel';
import { bidi } from '../../../utils/bidi';

const text = (html) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');

describe('MathLabel — content text outside a module', () => {
  it('never prints the dollars or the backslashes, even before KaTeX has loaded', () => {
    const out = text(renderToString(<p><MathLabel>{'Connaître la notation $x \\longmapsto ax + b$.'}</MathLabel></p>));
    expect(out).not.toMatch(/[$\\]/);
    expect(out).toContain('x ⟼ ax + b');
  });
  it('renders plain text exactly like bidi()', () => {
    const s = 'Le loyer 35000 = 185 × 0 + 35000';
    expect(text(renderToString(<p><MathLabel>{s}</MathLabel></p>))).toBe(bidi(s));
  });
});
