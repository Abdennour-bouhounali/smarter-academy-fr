import { describe, it, expect, vi, beforeEach } from 'vitest';

// The end of the story completes a v2 lesson (LESSON_V2.md §1ter): the marker of the kit, then the snapshot the progress
// layer sends to the server (`progressQueue.js`), on the same storage seam as progressQueue.test.js.
const memory = new Map();
const fakeStorage = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
};
vi.mock('../../../../utils/storage', () => ({ storage: fakeStorage, scopedStorage: fakeStorage }));
vi.mock('../../../../services/lessonProgressService', () => ({ putLessonProgress: vi.fn() }));
const TOTAL = { 'v2-lesson': 8, 'old-lesson': 5 };
vi.mock('../../../registry', () => ({ getTotalModules: (id) => TOTAL[id] ?? null }));

const { snapshotLessonProgress } = await import('../../progressQueue');
const { storyEndMarker, storyFinished, lessonModules } = await import('./storyEnd');

// a v2 lesson: 8 modules as DATA (0–7); its world marks only 1, 2, 3, 4 on the way — the others have no page any more
const V2 = {
  id: 'v2-lesson',
  modules: Array.from({ length: 8 }, (_, n) => ({ id: String(n).padStart(2, '0'), number: n })),
};

// what `useProgress.markModuleCompleted` does: read the storage, add the module once, write it back
const markIn = (lessonId) => (n) => {
  const key = `smarter_lesson_${lessonId}`;
  const saved = JSON.parse(fakeStorage.getItem(key) ?? 'null') ?? { completedModules: [] };
  if (!saved.completedModules.includes(n)) saved.completedModules.push(n);
  fakeStorage.setItem(key, JSON.stringify(saved));
};
const save = (over) => ({ v: 1, stage: 3, keys: [], finished: false, ...over });

describe('the end of the story completes a v2 lesson', () => {
  beforeEach(() => memory.clear());

  it('reads the modules of the config as the world marks them', () => {
    expect(lessonModules(V2)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7']);
    expect(lessonModules({ modules: [{ id: '03' }, { id: 'x' }] })).toEqual(['3']);
    expect(storyFinished(save({ finished: true }))).toBe(true);
    expect(storyFinished(save())).toBe(false);
    expect(storyFinished({ finished: true })).toBe(false); // not a world save
    expect(storyFinished(null)).toBe(false);
  });

  it('a finished story yields a snapshot `completed` for a lesson with retired modules', () => {
    const mark = markIn(V2.id);
    const end = storyEndMarker(V2, mark);
    ['1', '2', '3', '4'].forEach(mark); // what the story marked on the way
    end(save({ stage: 7 }));
    expect(snapshotLessonProgress(V2.id).status).toBe('in_progress');
    expect(end(save({ stage: 8, finished: true }))).toBe(true);
    const snap = snapshotLessonProgress(V2.id);
    expect(snap.status).toBe('completed');
    expect(snap.completedModules.sort()).toEqual(lessonModules(V2));
  });

  it('a half-played story stays in_progress with the modules it marked', () => {
    const mark = markIn(V2.id);
    const end = storyEndMarker(V2, mark);
    mark('1');
    mark('2');
    end(save({ stage: 2 }));
    const snap = snapshotLessonProgress(V2.id);
    expect(snap.status).toBe('in_progress');
    expect(snap.completedModules).toEqual(['1', '2']);
  });

  it('repairs on load: a save already finished marks every module, once', () => {
    const mark = vi.fn(markIn(V2.id));
    const end = storyEndMarker(V2, mark);
    expect(end(save({ finished: true }))).toBe(true); // the save found when the world opens
    expect(end(save({ finished: true }))).toBe(false); // the next saves of the same world mark nothing again
    expect(mark).toHaveBeenCalledTimes(8);
    expect(snapshotLessonProgress(V2.id).status).toBe('completed');
  });

  it('a lesson without a world is unchanged: completed only when every module is done', () => {
    const mark = markIn('old-lesson');
    ['1', '2', '3', '4'].forEach(mark);
    expect(snapshotLessonProgress('old-lesson').status).toBe('in_progress');
    mark('5');
    expect(snapshotLessonProgress('old-lesson').status).toBe('completed');
  });
});
