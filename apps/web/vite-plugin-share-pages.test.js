import { describe, it, expect } from 'vitest';
import { renderSharePage, renderBookPage, replaceRoot, shareRewriteRules, shareFileOf } from './vite-plugin-share-pages.js';
import cards from './src/features/books/shareCards.json';

const BASE = `<html><head><title>Accueil</title>
<meta name="description"
  content="Accueil" />
<meta property="og:url" content="https://smarter-academy.com/" />
<meta property="og:title" content="Smarter Academy" />
<meta property="og:description"
  content="Accueil" />
<meta property="og:image" content="https://smarter-academy.com/og-image.png" />
<meta property="og:image:alt" content="Smarter Academy" />
<meta name="twitter:title" content="Smarter Academy" />
<meta name="twitter:description"
  content="Accueil" />
<meta name="twitter:image" content="https://smarter-academy.com/og-image.png" />
</head><body></body></html>`;

describe('renderSharePage', () => {
  it('remplace titre, description, og et twitter pour la page du livre', () => {
    const card = cards.find((c) => c.path === '/books/smart-protocol');
    const out = renderSharePage(BASE, card);
    expect(out).toContain(`<title>${card.title}</title>`);
    expect(out).toContain('property="og:url" content="https://smarter-academy.com/books/smart-protocol"');
    expect(out).toContain('property="og:image" content="https://smarter-academy.com/og/smart-protocol.png"');
    expect(out).toContain('name="twitter:image" content="https://smarter-academy.com/og/smart-protocol.png"');
    expect(out).toContain(`content="${card.description}"`);
    expect(out).toContain('<link rel="canonical" href="https://smarter-academy.com/books/smart-protocol" />');
    expect(out).not.toContain('og-image.png');
  });

  it('échappe les guillemets d’un titre', () => {
    const out = renderSharePage(BASE, { path: '/books/x', title: 'Le "livre"', description: 'd', image: '/og/x.png' });
    expect(out).toContain('content="Le &quot;livre&quot;"');
  });
});

describe('renderBookPage — le premier écran de la fiche en HTML', () => {
  const card = cards.find((c) => c.path === '/books/smart-protocol');
  const html = `<html><head><title>x</title><script type="module" src="/assets/index-abc.js"></script></head><body>
  <div id="root">
    <div style="display:flex"><style>.s{}</style><div class="root-spinner"></div><p>جارٍ تحميل Smarter Academy...</p></div>
  </div>
</body></html>`;
  const book = { slug: 'smart-protocol', title: 'بروتوكول <SMART>', price: 1400, content: { heroImage: '/images/b.webp' } };
  const out = renderBookPage(html, { card, book, heroHtml: '<section>HERO</section>', preloadChunks: ['assets/BookDetailPage-x.js'] });

  it('remplace l’écran d’attente par le premier écran, posé au-dessus de #root', () => {
    expect(out).not.toContain('جارٍ تحميل');
    expect(out).toContain('<div id="root"></div>');
    expect(out).toContain('id="sa-static-shell"');
    expect(out).toContain('<section>HERO</section>');
    expect(out.indexOf('<div id="root"></div>')).toBeLessThan(out.indexOf('sa-static-shell'));
  });

  it('précharge l’image et le lot de la page, et donne les données à React sans balise cassable', () => {
    expect(out).toContain('<link rel="preload" as="image" href="/images/b.webp" fetchpriority="high" />');
    expect(out).toContain('<link rel="modulepreload" crossorigin href="/assets/BookDetailPage-x.js" />');
    expect(out).toContain('window.__SA_BOOK_SNAPSHOT__=');
    expect(out).toContain('"path":"/books/smart-protocol"');
    expect(out).not.toContain('<SMART>');
  });
});

describe('replaceRoot', () => {
  it('remplace l’élément #root entier, divs imbriquées comprises', () => {
    expect(replaceRoot('<body><div id="root"><div><div></div></div></div><p>après</p></body>', 'X')).toBe('<body>X<p>après</p></body>');
  });
});

describe('shareRewriteRules — aucune page de partage au chemin public', () => {
  it('écrit sous share/ et réécrit le chemin public, avec ou sans « / » final', () => {
    expect(shareFileOf('/books/smart-protocol')).toBe('share/books/smart-protocol.html');
    const rules = shareRewriteRules(cards);
    expect(rules).toContain('RewriteRule ^books/smart-protocol/?$ share/books/smart-protocol.html [L]');
    expect(rules).toContain('RewriteRule ^books/?$ share/books.html [L]');
  });

  it('le .htaccess source porte le marqueur que le build remplace', async () => {
    const { readFileSync } = await import('node:fs');
    expect(readFileSync(new URL('./public/.htaccess', import.meta.url), 'utf8')).toContain('  # @share-pages');
  });
});
