import { useContentAvailability } from '../../context/ContentAvailabilityContext';
import { getLessonProgress } from '../../lessons/common/utils/progress/getLessonProgress';
import { getTotalModules } from '../../lessons/registry';

/**
 * L'ÉTAT d'une leçon dans le catalogue, lu une seule fois pour ses deux
 * dessins — la carte (`LessonCard`) et la ligne (`LessonRow`) : sans ce
 * point unique, la ligne finirait par ouvrir ce que la carte verrouille.
 *
 * Le catalogue vient du bundle ; la PUBLICATION, le palier et le droit
 * d'accès viennent du SERVEUR (`GET /content/availability`). Voir les
 * commentaires de LessonCard pour le sens de chaque axe.
 *
 * @returns {{ state: 'hidden'|'locked'|'open'|'soon', isPremiumLesson: boolean,
 *             progressPercent: number, publication: string|null }}
 */
export function useLessonTileState(lesson) {
  const { isLessonClosed, isLessonLocked, isLessonPremium, isLessonHiddenByClass, lessonStatus } = useContentAvailability();
  const isAvailable = lesson.status === 'available' && !isLessonClosed(lesson.id);
  const hiddenByTeacher = isAvailable && isLessonHiddenByClass(lesson.id);
  const isPremiumLesson = isLessonPremium(lesson.id);
  const isUnlocked = !isLessonLocked(lesson.id);
  const { progressPercent } = isAvailable
    ? getLessonProgress(lesson.id, getTotalModules(lesson.id))
    : { progressPercent: 0 };

  let state = 'soon';
  if (hiddenByTeacher) state = 'hidden';
  else if (isAvailable && !isUnlocked) state = 'locked';
  else if (isAvailable) state = 'open';

  return { state, isPremiumLesson, progressPercent, publication: lessonStatus(lesson.id) };
}
