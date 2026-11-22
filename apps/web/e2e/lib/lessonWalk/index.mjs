// THE LESSON WALK — one library that plays a v2 lesson from the lesson's own files; a lesson brings a short descriptor
// (`e2e/lessons/<id>.walk.mjs`) and its truly new screens as hooks. README.md beside this file: the descriptor's shape.
import { foreignWordsFor } from '../lessonWords.mjs';
import { boardWalk } from './board.mjs';
import { deafAll } from './hmr.mjs';
import { hubWalk } from './hub.mjs';
import { launchWalk, sittingPart } from './launch.mjs';
import { loadLesson } from './load.mjs';
import { storyWalk } from './story.mjs';
import { trainerWalk } from './trainer.mjs';
import { worldOfLesson } from './worlds/index.mjs';

export const PARTS = {
  story: storyWalk,
  hub: hubWalk,
  trainer: trainerWalk,
  board: boardWalk,
  launch: launchWalk,
  sitting: sittingPart,
};
/** `all` = every part but the sitting (it opens every sheet of the bank: run it on its own, trusted.md). */
export const ALL = ['story', 'hub', 'trainer', 'board', 'launch'];
/** Two knowledge cards of other lessons whose tablet carries a longer name (lessons 4–6's lists add them by hand). */
const LONG_NAMES = ['جداء عاملين', 'الرقمان الأخيران'];

/** Runs `parts` of the lesson the descriptor names; screenshots in `<out>/<part>`. */
export async function runLessonWalk(D, parts, out) {
  deafAll();
  const L = await loadLesson(D.id);
  // a lesson of ANOTHER world than the islands (« قصر الساحات »): its foreign words and its screens' rules are its world's
  const other = worldOfLesson(L);
  const foreign = other
    ? other.foreignWords(L, [...LONG_NAMES, ...(D.foreignWords ?? [])])
    : foreignWordsFor(D.id, [...LONG_NAMES, ...(D.foreignWords ?? [])]);
  const foreignNumbers = [...new Set([...L.foreignNumbers, ...(D.foreignNumbers ?? [])])].filter(
    (n) => !(D.ownNumbers ?? []).includes(n),
  );
  console.log(
    `NOTE  ${D.id}: ${foreign.length} foreign words, ${foreignNumbers.length} foreign numbers (${foreignNumbers.join(', ')})`,
  );
  // a lesson of another world may add rules of its own screens (`descriptor.textRules`, e.g. no fraction « p/q » as text)
  const opts = {
    foreign,
    foreignNumbers,
    ...(other ? { textRules: [...other.textRules, ...(D.textRules ?? [])] } : {}),
  };
  for (const part of parts) {
    const play = PARTS[part];
    if (!play) throw new Error(`no part « ${part} » (${Object.keys(PARTS).join(', ')}, all)`);
    // lib/walk.mjs, the launch and the sitting libraries read their screenshot folder from argv[2]
    process.argv[2] = `${out}/${part}`;
    const t0 = Date.now();
    console.log(`\n══════ ${D.id} · ${part} ══════`);
    try {
      await play(L, D, opts);
    } catch (e) {
      // a shared library that throws (the launch kit's hard expectations) stops ITS part only
      process.exitCode = 1;
      console.log(`FAIL  ${D.id} · ${part} stopped: ${String(e.message).split('\n')[0]}`);
    }
    console.log(`PART  ${D.id} · ${part}: ${Math.round((Date.now() - t0) / 1000)} s`);
  }
}
