import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';
import { buildModuleContext } from '../_unit/moduleContext';
import { useInMissionPlayer } from '../../../../../common/mission/missionPlayerContext';
import { isMissionView } from '../../../../../common/mission/missionModel';
import { useLearningViewer } from '../../../../../../features/learning/learningViewer';
import { useClassroomMode } from '../../../../../common/classroom/ClassroomContext';

export const { MODULE_CTX, getNavLinks } = buildModuleContext(LESSON_CONFIG, LESSON_BASE_PATH);

/**
 * « Le module est-il joué dans le lecteur de mission ? », décidé AU NIVEAU DU MODULE. Le contexte du lecteur (`InMissionPlayerContext`) n'est posé
 * que PLUS BAS (ContentModule › ModuleLayout › MissionPlayer) : au niveau du module `useInMissionPlayer()` vaut toujours false, et les étapes
 * construites ici prenaient la version de la PAGE dans le lecteur (walk 2026-11-11). Même règle que ContentModule et PrerequisiteDiagnostic.
 */
export function useStudentPlayer() {
  const inPlayer = useInMissionPlayer();
  const viewer = useLearningViewer();
  const classroom = useClassroomMode();
  return inPlayer || isMissionView(LESSON_CONFIG.studentView, viewer, classroom);
}
