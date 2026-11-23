import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import '../../i18n';
import SectionErrorBoundary from './SectionErrorBoundary';

// The test environment has no DOM (react-dom/server only, which does not run boundaries): the boundary's three
// React hooks are driven by hand, as React would call them.
const src = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

function boundaryAfterCrash(props) {
  const b = new SectionErrorBoundary({ children: <p>contenu</p>, ...props });
  b.state = { ...b.state, ...SectionErrorBoundary.getDerivedStateFromError(new TypeError('null.slice')) };
  return b;
}

describe('SectionErrorBoundary — a crash never blanks the student’s space', () => {
  it('renders its children while nothing crashed', () => {
    const b = new SectionErrorBoundary({ children: <p>contenu</p> });
    expect(renderToStaticMarkup(b.render())).toBe('<p>contenu</p>');
  });

  it('after a crash: a calm French sentence and « Réessayer », never the raw error', () => {
    const html = renderToStaticMarkup(boundaryAfterCrash({}).render());
    expect(html).toContain('role="alert"');
    expect(html).toContain('data-section-error="section"');
    expect(html).toContain('Cette partie de la page ne s’affiche pas');
    expect(html).toContain('Réessayer');
    expect(html).not.toContain('null.slice');
    expect(html).not.toContain('contenu');
    const page = renderToStaticMarkup(boundaryAfterCrash({ scope: 'page' }).render());
    expect(page).toContain('Cette page ne s’affiche pas');
  });

  it('another address renders again; the same address keeps the notice', () => {
    const b = boundaryAfterCrash({ resetKey: '/espace' });
    expect(SectionErrorBoundary.getDerivedStateFromProps({ resetKey: '/espace' }, b.state)).toBeNull();
    expect(SectionErrorBoundary.getDerivedStateFromProps({ resetKey: '/espace/cours' }, b.state)).toEqual({
      error: null,
      resetKey: '/espace/cours',
    });
  });

  it('stands around every page of the student’s space, and around the home’s « today » section', () => {
    expect(src('../layout/StudentLayout.jsx')).toMatch(
      /<SectionErrorBoundary scope="page" resetKey=\{location\.pathname\}>\s*<Outlet \/>\s*<\/SectionErrorBoundary>/,
    );
    const home = src('../../pages/student/StudentHome.jsx');
    expect(home).toMatch(/<SectionErrorBoundary>\s*\{!compassOn \?/);
  });
});
