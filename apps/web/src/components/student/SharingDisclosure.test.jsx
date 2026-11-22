import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import '../../i18n';
import SharingDisclosure from './SharingDisclosure';

/**
 * Le texte de partage annonce l'établissement : nommé quand la classe en a un,
 * sinon le rattachement automatique à venir (SCHOOL_ADMIN_SPACE.md §4,
 * 2026-10-28) — le serveur ne l'accorde qu'à ce texte (school_auto_consent_since).
 */
describe('SharingDisclosure — l’établissement', () => {
  it('une classe sans établissement annonce le rattachement automatique', () => {
    const html = renderToStaticMarkup(<SharingDisclosure />);
    expect(html).toContain('data-qism-sharing-school-future');
    expect(html).toContain('تنضمّ إليها تلقائيًّا');
    expect(html).not.toContain('data-qism-sharing-school=');
  });

  it('une classe d’établissement le nomme', () => {
    const html = renderToStaticMarkup(<SharingDisclosure schoolName="متوسطة النور" />);
    expect(html).toContain('متوسطة النور');
    expect(html).not.toContain('data-qism-sharing-school-future');
  });
});
