import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import WordFraction from './WordFraction';

const text = (html) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');

describe('WordFraction — an Arabic-word fraction, never Arabic inside KaTeX', () => {
  it('prints numerator then denominator as DOM text and reads « … على … »', () => {
    const html = renderToString(<p><WordFraction num="طول الضلع المقابل" den="طول الوتر" /></p>);
    expect(text(html)).toContain('طول الضلع المقابل');
    expect(text(html)).toContain('طول الوتر');
    expect(html).toContain('aria-label="طول الضلع المقابل على طول الوتر"');
    expect(html).not.toContain('katex');
  });
  it('accepts a left-hand side and keeps it free of raw dollars', () => {
    const out = text(renderToString(<p><WordFraction lhs="جيب الزاوية" num="المقابل" den="الوتر" /></p>));
    expect(out).toMatch(/جيب الزاوية.*=.*المقابل.*الوتر/);
    expect(out).not.toMatch(/\$/);
  });
});
