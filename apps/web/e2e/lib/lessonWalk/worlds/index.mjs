// The worlds a lesson walk knows beside the islands (`divisor-isles`, played by ../story.mjs and ../world.mjs as they
// were): a lesson whose pack names one of these worlds is walked by that world's own player. The islands' path never
// reaches this file's worlds.
import { ROOT_COURTS } from './rootCourts.mjs';

const WORLDS = { 'root-courts': ROOT_COURTS };

/** The world of a loaded lesson (`load.mjs › loadLesson`) when it is not the islands; null for the islands. */
export const worldOfLesson = (L) => WORLDS[L.entry?.pack?.world] ?? null;
