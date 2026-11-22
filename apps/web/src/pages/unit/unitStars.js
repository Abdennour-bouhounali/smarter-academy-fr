// The stars a student keeps per lesson (scopedStorage): { [labId]: { [roundId]: 1..3 } }. Moved here from the deleted
// lab rounds model, its only reader left; the key is unchanged so a saved total survives.
export const starsKey = (lessonId) => `smarter_stars_${lessonId}`;

export function readStars(storage, lessonId) {
  try {
    const raw = JSON.parse(storage?.getItem(starsKey(lessonId)) ?? 'null');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

/** The lesson's total of stars. */
export function totalStars(all) {
  return Object.values(all ?? {}).reduce((sum, lab) => sum + Object.values(lab ?? {}).reduce((a, b) => a + (Number(b) || 0), 0), 0);
}
