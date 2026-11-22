/**
 * `code → status` from a `useLearningProfile(...)` profile (currentMastery nested grade → lesson → points). Empty
 * without a profile — never invented. The world colours the keys the student already holds with it.
 *
 * @param {{currentMastery?: object[]}|null|undefined} profile
 * @returns {Record<string, string>}
 */
export function masteryStatusByIdFromProfile(profile) {
  const out = {};
  for (const grade of profile?.currentMastery ?? []) {
    for (const lesson of grade?.lessons ?? []) {
      for (const row of lesson?.learningPoints ?? []) {
        const code = row?.code ?? row?.learningPointCode ?? row?.learning_point_code;
        if (code && typeof row.status === 'string') out[code] = row.status;
      }
    }
  }
  return out;
}
