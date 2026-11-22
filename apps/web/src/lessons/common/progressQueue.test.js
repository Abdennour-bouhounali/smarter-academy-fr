import { describe, it, expect, vi, beforeEach } from 'vitest';

// Même couture de stockage que evidenceQueue.test.js : la file est ce qui est
// testé, pas le navigateur.
const memory = new Map();
const fakeStorage = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
};
vi.mock('../../utils/storage', () => ({
  storage: fakeStorage,
  scopedStorage: {
    getItem: (key) => fakeStorage.getItem(`u_anon_${key}`),
    setItem: (key, value) => fakeStorage.setItem(`u_anon_${key}`, value),
    removeItem: (key) => fakeStorage.removeItem(`u_anon_${key}`),
  },
}));
vi.mock('../../services/lessonProgressService', () => ({ putLessonProgress: vi.fn() }));
vi.mock('../registry', () => ({ getTotalModules: () => 5 }));

const { readProgressQueue, flushProgressQueue } = await import('./progressQueue');

const QUEUE = 'u_anon_smarter_progress_queue';
const park = (queue) => memory.set(QUEUE, JSON.stringify(queue));

describe('flushProgressQueue — la file est relue avant d’être réécrite', () => {
  beforeEach(() => memory.clear());

  it('garde un instantané plus récent parqué pendant l’envoi', async () => {
    const first = { completedModules: ['1'], lastVisitedAt: 1 };
    const newer = { completedModules: ['1', '2'], lastVisitedAt: 2 };
    park({ lessonA: first });
    const put = vi.fn(async () => {
      park({ lessonA: newer }); // le module 2 s'achève pendant l'envoi du 1
      return null;
    });
    await flushProgressQueue('tok', put);
    expect(readProgressQueue()).toEqual({ lessonA: newer });
  });

  it('garde une autre leçon parquée pendant l’envoi', async () => {
    const a = { completedModules: ['1'], lastVisitedAt: 1 };
    const b = { completedModules: ['3'], lastVisitedAt: 1 };
    park({ lessonA: a });
    const put = vi.fn(async () => { park({ lessonA: a, lessonB: b }); return null; });
    await flushProgressQueue('tok', put);
    expect(readProgressQueue()).toEqual({ lessonB: b });
  });

  it('ôte un envoi accepté et garde un échec réseau', async () => {
    park({ ok: { completedModules: ['1'] }, down: { completedModules: ['2'] } });
    const put = vi.fn(async (_t, id) => { if (id === 'down') throw Object.assign(new Error('x'), { status: 503 }); return null; });
    const r = await flushProgressQueue('tok', put);
    expect(readProgressQueue()).toEqual({ down: { completedModules: ['2'] } });
    expect(r).toEqual({ flushed: 1, remaining: 1 });
  });
});
