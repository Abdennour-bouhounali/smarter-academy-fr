/**
 * The per-student localStorage keys that must be scoped independently per
 * user (see storage.js's scopedStorage) — lesson progress, XP, the last
 * visited course, and the two offline sync queues. UI-only preferences
 * (course filter selections) are deliberately excluded: those stay global.
 */
export const LEGACY_PER_STUDENT_KEYS = [
  'smarter_global_xp',
  'smarter_last_course',
  'smarter_evidence_queue',
  'smarter_progress_queue',
];

const LEGACY_LESSON_KEY_RE = /^smarter_lesson_/;

/** Matches the dynamically-named `smarter_lesson_{lessonId}` legacy keys. */
export function isLegacyLessonKey(key) {
  return LEGACY_LESSON_KEY_RE.test(key);
}
