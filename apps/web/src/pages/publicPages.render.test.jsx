import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import '../i18n';
import { AuthContext } from '../context/AuthContext';
import Home from './Home';
import Methode from './Methode';
import About from './About';
import FAQ from './FAQ';
import Contact from './Contact';

/**
 * The five public pages, rendered for a visitor while payments are closed (the PaymentsContext default): French,
 * left to right, no image of the Arabic interface, and no claim the product cannot keep today.
 */
function render(Page) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: null, token: null, loading: false }}>
        <LazyMotion features={domAnimation}>
          <Page />
        </LazyMotion>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

const PAGES = { Home, Methode, About, FAQ, Contact };

describe('the public pages', () => {
  for (const [name, Page] of Object.entries(PAGES)) {
    it(`${name} speaks French, left to right, with no raw key`, () => {
      const html = render(Page);
      expect(html).not.toMatch(/[\u0600-\u06FF]/);
      expect(html).not.toContain('dir="rtl"');
      expect(html).not.toMatch(/\b(?:method|hero|faq|about|contact|trust|home)\.[a-zA-Z]+\b/);
      expect(html).not.toMatch(/\bBEM\b|dinar|Terminale/i);
    });
  }

  it('Home says that no lesson is open yet, never « 0 leçon »', () => {
    const html = render(Home);
    expect(html).toContain('Les leçons de 3e sont en préparation');
    expect(html).not.toMatch(/\b0\s+leçon/);
  });

  it('Méthode is typographic: a written card per station, no screenshot', () => {
    const html = render(Methode);
    expect(html).not.toContain('<img');
    expect(html).toContain('data-method-card="observe"');
    expect(html).toContain('16 = 3 × 5 + 1');
    expect(html).toContain('Je reprends les bases');
  });

  it('the FAQ hides the paid answers while payments are closed', () => {
    const html = render(FAQ);
    expect(html).toContain('La plateforme est-elle payante');
    expect(html).not.toContain('code d’activation');
  });
});
