import { describe, it, expect, vi } from 'vitest';
import { lessonFileDocumentId, lessonFilePagePath, lessonFileTitle } from './lessonFileDoc';

const apiWith = (over = {}) => ({
  fetchLessonFile: vi.fn(async () => ({ documentId: null })),
  saveLessonFile: vi.fn(async () => ({})),
  fetchMathLabDocument: vi.fn(async () => ({})),
  createMathLabDocument: vi.fn(async () => ({ document: { id: 41 } })),
  ...over,
});

describe('ملفّ الدرس — the lesson file is a whiteboard document of the Math Lab', () => {
  it('creates ONE whiteboard document at the first opening and attaches it to the lesson', async () => {
    const api = apiWith();
    expect(await lessonFileDocumentId('tok', 'qasim-adad-tabii', 'قاسم', api)).toBe(41);
    expect(lessonFilePagePath('qasim-adad-tabii')).toBe('/enseignant/milaff/qasim-adad-tabii'); // its own page, not the lab's
    expect(api.createMathLabDocument.mock.calls[0][1]).toMatchObject({
      tool: 'whiteboard',
      title: 'ملفّ الدرس — قاسم',
    });
    expect(api.saveLessonFile).toHaveBeenCalledWith('tok', 'qasim-adad-tabii', { documentId: 41 });
  });

  it('opens the same document afterwards, without creating another', async () => {
    const api = apiWith({ fetchLessonFile: vi.fn(async () => ({ documentId: 41 })) });
    expect(await lessonFileDocumentId('tok', 'qasim-adad-tabii', 'قاسم', api)).toBe(41);
    expect(api.createMathLabDocument).not.toHaveBeenCalled();
    expect(api.saveLessonFile).not.toHaveBeenCalled();
  });

  it('starts a new one when the teacher deleted the document in the lab', async () => {
    const api = apiWith({
      fetchLessonFile: vi.fn(async () => ({ documentId: 7 })),
      fetchMathLabDocument: vi.fn(async () => {
        throw new Error('404');
      }),
    });
    expect(await lessonFileDocumentId('tok', 'l', 'ع', api)).toBe(41);
    expect(api.saveLessonFile).toHaveBeenCalledWith('tok', 'l', { documentId: 41 });
    expect(lessonFileTitle('ع'.repeat(200))).toHaveLength(120);
  });

  it('never creates two documents for two openings made together', async () => {
    const api = apiWith();
    const [a, b] = await Promise.all([
      lessonFileDocumentId('tok', 'twice', 'قاسم', api),
      lessonFileDocumentId('tok', 'twice', 'قاسم', api),
    ]);
    expect([a, b]).toEqual([41, 41]);
    expect(api.createMathLabDocument).toHaveBeenCalledTimes(1);
  });
});
