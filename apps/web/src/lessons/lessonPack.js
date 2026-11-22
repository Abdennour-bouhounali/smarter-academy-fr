/**
 * ONE PART of a lesson's pack, loaded when a page needs it (docs/architecture/LESSON_V2.md).
 *
 * A lesson says what it gives the platform in ITS OWN `lesson.pack.js`; the pages below never keep a list of lessons —
 * they ask the pack. The parts:
 *   world      the content its game world is played with (`kit/LessonWorld › lesson`)
 *   knowledge  its knowledge sheets (`LESSON_KNOWLEDGE`)
 *   coach      { <learning point (savoir-faire)>: <knowledge item id> } — the sheet the exam coach reminds
 *   script     « la leçon au tableau »: the steps of the class session
 *   memo       its written memo
 * Never in the entry bundle: the flags (`registry › lessonPackFlags`) answer « has it one? » without loading anything.
 */
import { useEffect, useState } from 'react';
import { lessonPackFlags, loadLessonPack } from './registry';

const PARTS = {
  world: { flag: 'world', read: (pack) => pack.world.content() },
  knowledge: { flag: 'knowledge', read: (pack) => pack.knowledge() },
  coach: { flag: 'coach', read: (pack) => pack.coach },
  script: { flag: 'board', read: (pack) => pack.board.script() },
  memo: { flag: 'board', read: (pack) => pack.board.memo() },
};

/** Has this lesson that part? Answered from the generated flags: nothing is loaded. */
export const hasPackPart = (lessonId, part) => Boolean(lessonPackFlags(lessonId)[PARTS[part].flag]);

/** @returns {Promise<any|null>} the part, or null when the lesson has none. */
export async function loadPackPart(lessonId, part) {
  if (!hasPackPart(lessonId, part)) return null;
  const pack = await loadLessonPack(lessonId);
  return pack ? ((await PARTS[part].read(pack)) ?? null) : null;
}

/**
 * The same for a component: `undefined` while the part loads, then the part — or `null` at once when the lesson has
 * none (and when it could not be loaded: the page then behaves as for a lesson without that part).
 */
export function usePackPart(lessonId, part) {
  const key = `${lessonId}:${part}`;
  const has = hasPackPart(lessonId, part);
  const [loaded, setLoaded] = useState({ key: null, value: null });
  useEffect(() => {
    if (!has) return undefined;
    let alive = true;
    loadPackPart(lessonId, part).then(
      (value) => alive && setLoaded({ key, value }),
      () => alive && setLoaded({ key, value: null }),
    );
    return () => {
      alive = false;
    };
  }, [key, has, lessonId, part]);
  if (!has) return null;
  return loaded.key === key ? loaded.value : undefined;
}
