import { useInMissionPlayer } from './missionPlayerContext';
import { isMissionView } from './missionModel';
import { getLoadedLessonConfig } from '../../registry';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import { useClassroomMode } from '../classroom';

/**
 * « Ce module est-il joué dans le lecteur de mission ? », décidé AU NIVEAU DU MODULE (2026-11-11). Le contexte du lecteur
 * (`InMissionPlayerContext`) n'est posé que PLUS BAS (ContentModule › ModuleLayout › MissionPlayer) : appelé dans le corps d'un module,
 * `useInMissionPlayer()` vaut toujours false, et les étapes construites là prenaient la version de la PAGE dans le lecteur.
 * Même règle que ContentModule (`play`) : une leçon avec `mission`, vue en mode mission par l'élève, hors navigation libre et hors وضع القسم.
 * `ctx` = le MODULE_CTX de la leçon ({ lessonId, studentView, … }).
 */
export function useModulePlayer(ctx) {
  const inPlayer = useInMissionPlayer();
  const viewer = useLearningViewer();
  const classroom = useClassroomMode();
  return inPlayer || (Boolean(getLoadedLessonConfig(ctx?.lessonId)?.mission) && isMissionView(ctx?.studentView, viewer, classroom));
}
