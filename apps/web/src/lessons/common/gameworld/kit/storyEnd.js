/**
 * THE END OF THE STORY completes the lesson (LESSON_V2.md §1ter, 2026-11-19).
 *
 * A v2 lesson keeps its modules as DATA (its `lesson.config.js`), but its world marks only the modules it teaches on the
 * way (`game.onModule`, from the lesson's `world/story.js`); the others (preparation, the test, the synthesis…) have no
 * page any more. The progress layer says `completed` only when EVERY module of the config is done
 * (`progressQueue.js › snapshotLessonProgress`), so: when the world's story is finished (the last bridge paid, the End
 * screen — `save.finished`), every module of the config is marked done. A save that is already finished (a student who
 * ended the story before this rule) repairs his progress the next time the world opens.
 * Mastery is untouched: it comes from evidence only.
 */

/** A world save whose story is finished (the shape `WorldRuntime.save` writes). */
export const storyFinished = (save) => Boolean(save && save.v === 1 && save.finished);

/** Every module of the lesson's config, as the world marks them: the module NUMBER as a string. */
export function lessonModules(config) {
  return (config?.modules ?? [])
    .map((m) => (Number.isInteger(m?.number) ? m.number : Number.parseInt(m?.id, 10)))
    .filter(Number.isInteger)
    .map(String);
}

/**
 * One per mounted world: called with each save (and with the save found on load), it marks every module of the
 * config ONCE, the first time the save says the story is finished. `mark(n)` is the lesson's `onModule`.
 */
export function storyEndMarker(config, mark) {
  let done = false;
  return (save) => {
    if (done || !storyFinished(save)) return false;
    done = true;
    for (const n of lessonModules(config)) mark(n);
    return true;
  };
}
