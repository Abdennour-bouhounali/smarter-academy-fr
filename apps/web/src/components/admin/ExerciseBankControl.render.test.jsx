import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import '../../i18n';
import { AuthContext } from '../../context/AuthContext';
import ExerciseBankControl from './ExerciseBankControl';
import { changeLessonExercisesStatus } from '../../services/admin/contentService';

function render(exercises) {
  return renderToStaticMarkup(
    <AuthContext.Provider value={{ token: 'tk', user: { role: 'admin' } }}>
      <ExerciseBankControl lesson={{ id: 4, exercises }} />
    </AuthContext.Provider>,
  );
}

describe('ExerciseBankControl — toute la banque d’une leçon', () => {
  it('résume la banque sans compter les retirés, et propose les quatre états', () => {
    const html = render([
      { publicationStatus: 'published' },
      { publicationStatus: 'published' },
      { publicationStatus: 'hidden' },
      { publicationStatus: 'draft', retiredAt: '2026-10-01' },
    ]);
    expect(html).toContain('بنك التمارين');
    expect(html).toContain('نشر كل التمارين');
    expect(html).toContain('إخفاء كل التمارين');
    expect(html).toContain('>2<');
    expect(html).toContain('>1<');
  });

  it('ne rend rien pour une leçon sans exercice', () => {
    expect(render([])).toBe('');
  });

  it('le service vise la route de la banque', async () => {
    const calls = [];
    const original = globalThis.fetch;
    globalThis.fetch = async (url, options = {}) => {
      calls.push({ url: String(url), method: options.method, body: options.body });
      return new Response(JSON.stringify({ success: true, applied: [1], unchanged: [], failed: [] }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    };
    try {
      await changeLessonExercisesStatus('tk', 4, 'published');
    } finally {
      globalThis.fetch = original;
    }
    expect(calls[0].url).toContain('/admin/content/lesson/4/exercises-status');
    expect(calls[0].method).toBe('PATCH');
    expect(JSON.parse(calls[0].body)).toEqual({ status: 'published' });
  });
});
