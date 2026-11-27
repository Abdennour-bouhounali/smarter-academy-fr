/**
 * WHAT IS ON SCREEN WHILE A LESSON ARRIVES — one component for every boundary a lesson crosses (the route boundary, the
 * classroom shell, the page frame). A student about to enter a game world sees the world's loading screen from his
 * click to the title, ONE screen that never changes look (`gameworld/WorldLoading`); everyone else keeps the neutral
 * page the lesson pages had. Light: it is in the entry bundle (BUNDLE_BOUNDARIES.md).
 */
import { useLearningViewer } from '../features/learning/learningViewer';
import { lessonPackFlags } from './registry';
import WorldLoading from './common/gameworld/WorldLoading';
import { opensWorldNow } from './lessonEntry';

/** « Essayer comme un élève »: a teacher's preview of the student's world (CLASS_SESSION.md §2). */
const isPreview = () =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('apercu') === 'eleve';

/** Will this lesson's home be its game world for whoever is looking? Same answer as `LessonIndex`, known before it loads. */
export function useOpensWorld(lessonId) {
  const viewer = useLearningViewer();
  if (!lessonPackFlags(lessonId).world) return false;
  // a student lands on his home of the lesson first: the world is one step further (`?monde=1`, lessonEntry.js)
  return viewer.freeNavigation ? isPreview() : opensWorldNow(new URLSearchParams(window.location.search));
}

export default function LessonWaiting({ lessonId, title }) {
  const world = useOpensWorld(lessonId);
  return world ? <WorldLoading lessonId={lessonId} title={title} /> : <div className="min-h-screen bg-slate-50" />;
}
