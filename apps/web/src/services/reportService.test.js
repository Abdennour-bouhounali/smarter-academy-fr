import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '../i18n';
import { submitReport } from './reportService';

describe('submitReport — un seul envoi multipart', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ success: true, report: { id: 7, hasScreenshot: true } }),
    });
  });
  afterEach(() => { delete global.fetch; });

  it('poste le contexte, la catégorie, la note et la capture', async () => {
    const screenshot = new Blob(['x'], { type: 'image/webp' });
    const report = await submitReport('tok', {
      source: 'module',
      context: { lessonCode: 'qasim', moduleNumber: 2, step: 'ex', grade: undefined },
      category: 'math_error',
      note: 'خطأ هنا',
      screenshot,
    });

    expect(report).toEqual({ id: 7, hasScreenshot: true });
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toMatch(/\/reports$/);
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Bearer tok');
    // Le navigateur pose lui-même la frontière multipart.
    expect(options.headers['Content-Type']).toBeUndefined();

    const body = options.body;
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('source')).toBe('module');
    expect(body.get('lessonCode')).toBe('qasim');
    expect(body.get('moduleNumber')).toBe('2');
    expect(body.get('category')).toBe('math_error');
    expect(body.get('note')).toBe('خطأ هنا');
    // Un champ vide n'est pas envoyé (le serveur le lirait comme une chaîne vide).
    expect(body.has('grade')).toBe(false);
    const file = body.get('screenshot');
    expect(file).toBeInstanceOf(Blob);
    expect(file.name).toBe('capture.webp');
  });

  it('sans capture ni note, n’envoie ni l’une ni l’autre', async () => {
    await submitReport('tok', { source: 'lesson', context: {}, category: 'typo', note: '' });
    const body = global.fetch.mock.calls[0][1].body;
    expect(body.has('screenshot')).toBe(false);
    expect(body.has('note')).toBe(false);
  });

  it('n’envoie jamais d’identifiant de base', async () => {
    await submitReport('tok', { source: 'lesson', context: { lessonCode: 'a' }, category: 'other' });
    const body = global.fetch.mock.calls[0][1].body;
    for (const key of ['lesson_id', 'lessonId', 'module_id', 'user_id']) expect(body.has(key)).toBe(false);
  });

  it('un refus (403 non relecteur) lève une erreur ARABE, jamais le message serveur', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 403, json: async () => ({ reason: 'not_a_reviewer', message: 'Seuls les ambassadeurs…' }) });
    await expect(submitReport('tok', { source: 'lesson', category: 'other' })).rejects.toMatchObject({ status: 403 });
    await expect(submitReport('tok', { source: 'lesson', category: 'other' })).rejects.not.toThrow(/Seuls/);
  });
});
