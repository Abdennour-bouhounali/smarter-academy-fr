/**
 * THE LESSON a game world is playing — one object, handed down once.
 *
 * A screen of the kit never imports a lesson: it reads the lesson's data here (`useLesson()`), and the world's shell
 * mounts `<LessonProvider lesson={…}>` around everything it renders. What the object holds is the lesson's pack
 * (its `world/index.js` today): its keys and their rule tablets, its practice ladder, its exam sittings, its road, its
 * evidence rule, and the sentences only it can write (the names of its levels, of its real-world worlds).
 */
import { createContext, useContext } from 'react';

const LessonContext = createContext(null);

export function LessonProvider({ lesson, children }) {
  return <LessonContext.Provider value={lesson}>{children}</LessonContext.Provider>;
}

export function useLesson() {
  const lesson = useContext(LessonContext);
  if (!lesson) throw new Error('useLesson: this screen is rendered outside a <LessonProvider>');
  return lesson;
}
