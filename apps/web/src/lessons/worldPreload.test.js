import { describe, it, expect } from 'vitest';
import { lessonsWithPack, lessonPackFlags, getBuiltLessons } from './registry';
import { WORLDS } from './common/gameworld/worlds';
import { loadWorldContent, preloadWorld, preloadWorldCode } from './worldPreload';

describe('the world of a lesson, asked for early', () => {
  it('every world a pack names is a world that exists', () => {
    const named = new Set(lessonsWithPack('world').map((id) => lessonPackFlags(id).world));
    expect(named.size).toBeGreaterThan(0);
    for (const id of named) expect(typeof WORLDS[id], id).toBe('function');
  });

  it('the content is fetched once: the preload and the world read the same promise', () => {
    const [lessonId] = lessonsWithPack('world');
    expect(loadWorldContent(lessonId)).toBe(loadWorldContent(lessonId));
  });

  it('a lesson without a world asks for nothing and never throws', () => {
    const plain = getBuiltLessons().find((l) => !lessonPackFlags(l.id).world);
    expect(() => preloadWorld(plain?.id ?? 'no-such-lesson')).not.toThrow();
    expect(() => preloadWorldCode('no-such-lesson')).not.toThrow();
  });
});
