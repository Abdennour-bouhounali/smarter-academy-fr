import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import '../../i18n';
import PublicationBadge from './PublicationBadge';

const render = (status) => renderToStaticMarkup(<PublicationBadge status={status} />);

describe('PublicationBadge — l’état de publication, pour le relecteur', () => {
  it('un contenu publié (ou d’état inconnu du contexte) ne montre rien', () => {
    expect(render('published')).toBe('');
    expect(render(undefined)).toBe('');
    expect(render(null)).toBe('');
  });

  it.each([
    ['draft', 'مسودّة'],
    ['hidden', 'مخفي'],
    ['archived', 'مؤرشف'],
  ])('%s est nommé en arabe, pas seulement coloré', (status, word) => {
    const html = render(status);
    expect(html).toContain(`data-publication-status="${status}"`);
    expect(html).toContain(word);
  });
});
