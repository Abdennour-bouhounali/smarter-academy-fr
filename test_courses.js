import { courseLevels } from './src/data/coursesData.js';

courseLevels.forEach(level => {
  level.grades.forEach(grade => {
    grade.chapters.forEach(chap => {
      chap.lessons.forEach(lesson => {
        if (lesson.id.includes('racine') || lesson.id.includes('4e')) {
          console.log(`Grade: ${grade.name}, Chapter: ${chap.title}, Lesson: ${lesson.title}, ID: ${lesson.id}, TotalModules: ${lesson.totalModules}`);
        }
      });
    });
  });
});
