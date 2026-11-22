import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Bracket from './tools/Bracket';

const noop = () => {};
const draw = (a, b, start) =>
  renderToString(
    <Bracket a={a} b={b} start={start} play={noop} report={noop} range={{ a: [1, 9999], b: [2, 999] }} />,
  ).replaceAll('<!-- -->', '');

describe('Mon labo — « L’encadrement par planches » draws what it reads', () => {
  it('opens on ONE plank laid along the length: what is left, the product compared with a, and no bracket yet', () => {
    const html = draw(100, 7);
    expect(html).toContain('data-n="1"');
    expect(html).toContain('data-q="14"');
    expect(html).toContain('data-ll-left="93"'); // 100 − 7
    expect(html).toContain('1 × 7 = 7 &lt; 100');
    expect(html).toContain('Longueur 100');
    expect(html).toContain('Planche de 7');
    // the bracket is written only once the hand has laid the full planks and the one more: never on opening
    expect(html).not.toContain('data-ll-bracket=');
    expect(html).not.toContain('data-ll-found');
    expect(html).not.toMatch(/\\times|\\div|\$/);
    expect(html).toContain('data-ll-plank-end');
    expect(html).toContain('data-ll-more');
    expect(html).toContain('data-ll-less');
  });

  it('a length shorter than one plank: the single plank already passes it, by what is missing', () => {
    const html = draw(9, 14);
    expect(html).toContain('data-n="1"');
    expect(html).toContain('data-q="0"');
    expect(html).toContain('data-over="5"');
    expect(html).toContain('1 × 14 = 14 &gt; 9');
    expect(html).toContain('La longueur est dépassée de 5');
  });

  it('a great many planks is drawn as one bar, never thousands of rectangles', () => {
    // 4999 full planks of 2 and the one more that passes 9999: past 60 planks, the ONE-BAR branch draws them
    const html = draw(9999, 2, 5000);
    expect(html).toContain('data-n="5000"');
    expect(html).toContain('data-ll-planks-laid="5000"');
    expect(html).toContain('data-over="1"');
    expect(html).toContain('5000 × 2 = 10000 &gt; 9999');
    const laid = html.slice(html.indexOf('data-ll-planks-laid'), html.indexOf('data-ll-plank-end'));
    // one blue bar for the 4999 full planks and one rose plank for the one too many — nothing else in the row
    expect((laid.match(/<rect/g) ?? []).length).toBe(2);
    expect(laid).toContain('fill="#fb7185"');
    expect((html.match(/<rect/g) ?? []).length).toBeLessThan(10);
  });
});
