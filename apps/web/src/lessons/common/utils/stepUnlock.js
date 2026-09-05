/**
 * isStepLocked — bypasses a module's internal StepCard sequential locking
 * once the module itself has already been completed at least once.
 *
 * Before first completion: normal sequential progression — a module passes
 * its own `locked={!prevStepDone}` expression through unchanged.
 *
 * After the module is marked completed (useProgress's `completedModules`,
 * keyed by `moduleNumber.toString()` — the same key ModuleLayout writes),
 * every step becomes a free-navigation revision space: this always returns
 * `false`, regardless of which steps were (re)completed this visit.
 *
 * @param {boolean} alreadyCompleted  isModuleCompleted(moduleNumber.toString())
 * @param {boolean} sequentialLocked  the module's own `!prevStepDone` check
 * @returns {boolean}
 */
export function isStepLocked(alreadyCompleted, sequentialLocked) {
  return !alreadyCompleted && sequentialLocked;
}
