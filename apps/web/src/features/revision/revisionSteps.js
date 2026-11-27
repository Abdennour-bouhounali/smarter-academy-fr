/** The steps a reader ticked on a revision page: they stay in HIS browser, nothing is sent (REVISION_PAGE.md §3). */
const storageKey = (lessonId) => `sa:revision:${lessonId}:steps`;

export const readSteps = (lessonId) => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(lessonId)));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const writeSteps = (lessonId, steps) => {
  try {
    localStorage.setItem(storageKey(lessonId), JSON.stringify(steps));
  } catch {
    /* a private window: the ticks last as long as the page */
  }
};
