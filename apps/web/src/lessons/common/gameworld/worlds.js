/**
 * THE WORLDS THAT EXIST — code, one entry per world (a mechanic written once, for a unit), never one per lesson.
 * A lesson names its world in its pack (`lesson.pack.js › world.id`). Only `() => import()` here: this table is read by
 * the lesson route boundary (entry bundle) to start a world's download early, so it must stay a list of chunk names.
 */
export const WORLDS = {
  'divisor-isles': () => import('./divisorIsles/DivisorIsles'),
  'mission-isle': () => import('./missionIsle/MissionIsle'),
  'root-courts': () => import('./rootCourts/RootCourts'),
};
