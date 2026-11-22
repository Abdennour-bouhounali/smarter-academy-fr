import { describe, it, expect, vi, afterEach } from 'vitest';
import '../i18n';
import { fetchExerciseStudents, fetchStudentResponses } from './teacherPracticeService';

describe('teacherPracticeService — lecture seule', () => {
  afterEach(() => { delete global.fetch; });

  it('liste les élèves d’un exercice (GET, jeton, chemin encodé)', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true, total: 1, students: [{ id: 3 }] }) });
    const res = await fetchExerciseStudents('tok', 'qasim-adad-tabii', 'ex-1');
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toMatch(/\/teacher\/practice\/qasim-adad-tabii\/exercises\/ex-1\/students$/);
    expect(options.method ?? 'GET').toBe('GET');
    expect(options.headers.Authorization).toBe('Bearer tok');
    expect(res.total).toBe(1);
  });

  it('les réponses d’un élève', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true, student: { id: 3 }, questions: [] }) });
    await fetchStudentResponses('tok', 'l', 'ex-1', 3);
    expect(global.fetch.mock.calls[0][0]).toMatch(/\/students\/3$/);
  });

  it('un élève hors de ses classes : 404 → erreur', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });
    await expect(fetchStudentResponses('tok', 'l', 'ex-1', 99)).rejects.toMatchObject({ status: 404 });
  });
});
