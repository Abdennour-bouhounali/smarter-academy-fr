import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import '../../i18n';
import { AuthContext } from '../../context/AuthContext';
import DeleteUserSection from './DeleteUserSection';
import { deleteUser, fetchUserDeletionPreview } from '../../services/admin/userDeletionService';

function render(role) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <AuthContext.Provider value={{ token: 'tk', user: { role: 'admin' } }}>
        <DeleteUserSection user={{ id: 7, email: 'eleve@example.test' }} role={role} backTo="/admin/eleves" />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('DeleteUserSection — la suppression définitive', () => {
  it('la zone de danger s’affiche fermée, avec son avertissement propre au rôle', () => {
    const student = render('student');
    expect(student).toContain('منطقة الخطر');
    expect(student).toContain('حذف الحساب نهائياً');
    expect(student).toContain('تعطيل');
    // La boîte (et l'e-mail à retaper) n'existe qu'une fois ouverte.
    expect(student).not.toContain('اكتب البريد الإلكتروني');

    expect(render('teacher')).toContain('أقسامه');
  });

  it('le service vise les routes admin, l’e-mail retapé dans le corps', async () => {
    const calls = [];
    const original = globalThis.fetch;
    globalThis.fetch = async (url, options = {}) => {
      calls.push({ url: String(url), method: options.method ?? 'GET', body: options.body });
      return new Response(JSON.stringify({ success: true, summary: { payments: 2 }, id: 7 }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    };
    try {
      expect(await fetchUserDeletionPreview('tk', 7)).toEqual({ payments: 2 });
      await deleteUser('tk', 7, 'eleve@example.test');
    } finally {
      globalThis.fetch = original;
    }

    expect(calls[0].url).toContain('/admin/users/7/deletion-preview');
    expect(calls[1].url).toContain('/admin/users/7');
    expect(calls[1].method).toBe('DELETE');
    expect(JSON.parse(calls[1].body)).toEqual({ confirmEmail: 'eleve@example.test' });
  });
});
