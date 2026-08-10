/**
 * Flattens the course hierarchy into a single ordered list of available lessons.
 * 
 * @param {Array} courseLevels - The full curriculum hierarchy from coursesData.js
 * @returns {Array} Flat list of lesson objects enriched with level, grade, and chapter.
 */
export function getFlatAvailableLessons(courseLevels) {
  const allAvailableLessons = [];
  courseLevels.forEach(lvl => {
    lvl.grades.forEach(gr => {
      gr.chapters.forEach(ch => {
        ch.lessons.forEach(l => {
          if (l.status === 'available') {
            allAvailableLessons.push({ lesson: l, chapter: ch, grade: gr, level: lvl });
          }
        });
      });
    });
  });
  return allAvailableLessons;
}

/**
 * Finds the next available lesson chronologically after a given lesson.
 * 
 * @param {Array} courseLevels - The full curriculum hierarchy.
 * @param {string} currentLessonId - The ID of the lesson just completed.
 * @returns {Object|null} The next lesson object or null if at the end.
 */
export function getNextLesson(courseLevels, currentLessonId) {
  const flatLessons = getFlatAvailableLessons(courseLevels);
  const currentIndex = flatLessons.findIndex(item => item.lesson.id === currentLessonId);
  
  if (currentIndex !== -1 && currentIndex + 1 < flatLessons.length) {
    return flatLessons[currentIndex + 1];
  }
  return null;
}
