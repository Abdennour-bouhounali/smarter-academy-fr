import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';
import { buildModuleContext } from '../_unit/moduleContext';
import { useInMissionPlayer } from '../../../../../common/mission/missionPlayerContext';
import { isMissionView } from '../../../../../common/mission/missionModel';
import { useLearningViewer } from '../../../../../../features/learning/learningViewer';
import { useClassroomMode } from '../../../../../common/classroom/ClassroomContext';

export const { MODULE_CTX, getNavLinks } = buildModuleContext(LESSON_CONFIG, LESSON_BASE_PATH);

/**
 * « Le module est-il joué dans le lecteur de mission ? », décidé AU NIVEAU DU MODULE (prompt de l'unité 5 §12.2) : le contexte du lecteur
 * (`InMissionPlayerContext`) n'est posé que PLUS BAS (ContentModule › ModuleLayout › MissionPlayer) — au niveau du module `useInMissionPlayer()`
 * vaut toujours false. Même règle que ContentModule et PrerequisiteDiagnostic.
 */
export function useStudentPlayer() {
  const inPlayer = useInMissionPlayer();
  const viewer = useLearningViewer();
  const classroom = useClassroomMode();
  return inPlayer || isMissionView(LESSON_CONFIG.studentView, viewer, classroom);
}
