/**
 * « L’échauffement » — the student's toolbox in the browser (phase 1: not synced, not evidence, not shown to a teacher).
 * Small on purpose: the lesson shell reads `launchDone` without loading the game.
 */
import { scopedStorage } from '../../../utils/storage';

const KEY = 'smarter_launch_kit';
export const loadKit = () => {
  try {
    return JSON.parse(scopedStorage.getItem(KEY) ?? 'null') ?? {};
  } catch {
    return {};
  }
};
export const saveKit = (store) => {
  try {
    scopedStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* the launch works without storage */
  }
};
/** Has this student already played the launch of this lesson? (then « Commencer » goes straight to the lesson) */
export const launchDone = (lessonCode) => Boolean(loadKit().lessons?.[lessonCode]);
