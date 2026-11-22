import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import RichText from './RichText';

const L = '⁦';
const P = '⁩';

describe('RichText — les égalités écrites en clair sont isolées LTR', () => {
  it('isole « 15 = 3 × 5 » dans une phrase arabe', () => {
    const html = renderToStaticMarkup(<RichText>{'لأن 15 = 3 × 5 فقط'}</RichText>);
    expect(html).toContain(`${L}15 = 3 × 5${P}`);
  });

  it('isole aussi à l’intérieur du gras', () => {
    const html = renderToStaticMarkup(<RichText>{'**84/48** بـ PGCD'}</RichText>);
    expect(html).toContain(`${L}84/48${P}`);
  });

  it('ne touche pas au contenu d’un $…$ (MathText l’isole déjà)', () => {
    const html = renderToStaticMarkup(<RichText>{'من الكتاب: $120 = 6 \\times 20$.'}</RichText>);
    expect(html).not.toContain(L);
  });
});
