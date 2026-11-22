import { useCallback, useEffect, useMemo, useState } from 'react';
import { useProgress } from '../hooks/useProgress';
import { resolveModuleStatus } from '../utils/moduleGate';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import { useClassroomMode } from '../classroom/ClassroomContext';
import { useContentAvailability } from '../../../context/ContentAvailabilityContext';
import { useLessonKnowledge } from '../knowledge';
import { scopedStorage } from '../../../utils/storage';
import {
  isMissionView, missionTools, missionStations, resumeStation, readMissionState, writeMissionState,
} from './missionModel';
import { readStars, totalStars, STARS_EVENT } from '../manipulations/rounds/roundsModel';

/**
 * Tout ce qu'un écran de mission lit, en un seul endroit : est-elle active, les outils gagnés, les stations (avec le
 * VERROU RÉEL de la leçon, celui du sommaire), la station de reprise, et l'état local (ouverture vue, points d'étape).
 * `config` : le LESSON_CONFIG. Sans `config.mission` ou hors regard élève, `on` est faux et rien d'autre ne compte.
 */
export function useMission(config) {
  const viewer = useLearningViewer();
  const classroom = useClassroomMode();
  const { completedModules, isModuleCompleted, currentModule } = useProgress(config?.id);
  const { isModuleClosed } = useContentAvailability();
  // les outils = ce que l'élève a ÉTABLI, jamais la carte ouverte (pilote 2026-11-08 : la carte peut tout montrer d'emblée)
  const { items: mapItems, learnedItems } = useLessonKnowledge();
  const items = learnedItems ?? mapItems;
  const [state, setState] = useState(() => readMissionState(scopedStorage, config?.id));

  const on = Boolean(config?.mission) && isMissionView(config?.studentView, viewer, classroom);
  // Les ÉTOILES des manches (LabRounds) : le total de la leçon, tenu à jour quand une manche est gagnée.
  const [stars, setStars] = useState(() => totalStars(readStars(scopedStorage, config?.id)));
  useEffect(() => {
    const refresh = () => setStars(totalStars(readStars(scopedStorage, config?.id)));
    window.addEventListener(STARS_EVENT, refresh);
    return () => window.removeEventListener(STARS_EVENT, refresh);
  }, [config?.id]);
  const mission = config?.mission ?? null;

  const update = useCallback((patch) => {
    setState((prev) => {
      const next = { ...prev, ...patch, answered: { ...prev.answered, ...(patch.answered ?? {}) }, seen: { ...prev.seen, ...(patch.seen ?? {}) } };
      writeMissionState(scopedStorage, config?.id, next);
      return next;
    });
  }, [config?.id]);

  // `completedModules` : avec `mission.toolsOwned`, une clé s'allume quand un de ses modules `usedIn` est terminé
  const tools = useMemo(() => missionTools(mission, items.map((it) => it.id), completedModules), [mission, items, completedModules]);

  const stations = useMemo(() => {
    if (!on) return [];
    const firstModuleNumber = Math.min(...config.modules.map((m) => Number(m.number)).filter(Number.isFinite));
    return missionStations(config, (module) => resolveModuleStatus({
      closed: isModuleClosed(config.id, module.number),
      freeNavigation: viewer.freeNavigation,
      sequentialUnlock: config.sequentialUnlock,
      isDone: isModuleCompleted(module.id) || isModuleCompleted(String(module.number)),
      isModuleCompleted,
      moduleNumber: module.number,
      currentModule,
      module,
      firstModuleNumber,
      previousStage: config.modules.find((m) => Number(m.number) === Number(module.number) - 1)?.stage,
    }));
    // `completedModules` : ce qui change quand un module se termine (isModuleCompleted le lit).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, config, completedModules, currentModule, isModuleClosed, viewer.freeNavigation]);

  return { on, mission, state, update, tools, stations, resume: resumeStation(stations), completedModules, stars };
}
