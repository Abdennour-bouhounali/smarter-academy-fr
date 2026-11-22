import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuthContext } from '../../context/AuthContext';
import '../../i18n';
import ReportButton from './ReportButton';

// Le bouton n'existe que pour les RELECTEURS : l'administrateur et les
// enseignants ambassadeurs (`canReviewContent`, servi par UserPresenter).
const render = (user, token = user ? 't' : null) => renderToStaticMarkup(
  <AuthContext.Provider value={{ user, token, loading: false }}>
    <ReportButton source="lesson" variant="chip" context={{ lessonCode: 'x' }} />
  </AuthContext.Provider>,
);

describe('ReportButton — qui voit « الإبلاغ عن مشكل »', () => {
  it('un visiteur ne voit rien', () => {
    expect(render(null)).toBe('');
  });

  it('un élève ne voit rien', () => {
    expect(render({ role: 'student', canReviewContent: false })).toBe('');
    // Ni même sans le drapeau (compte servi par une ancienne API).
    expect(render({ role: 'student' })).toBe('');
  });

  it('un enseignant qui n’est pas ambassadeur ne voit rien', () => {
    expect(render({ role: 'teacher', isAmbassador: false, canReviewContent: false })).toBe('');
  });

  it('un ambassadeur voit le bouton', () => {
    const html = render({ role: 'teacher', isAmbassador: true, canReviewContent: true });
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('الإبلاغ عن مشكل');
  });

  it('un administrateur voit le bouton', () => {
    expect(render({ role: 'admin', canReviewContent: true })).toContain('aria-haspopup="dialog"');
  });

  it('la fenêtre est fermée au rendu : rien n’est ouvert ni envoyé d’office', () => {
    expect(render({ role: 'admin', canReviewContent: true })).not.toContain('role="dialog"');
  });
});
