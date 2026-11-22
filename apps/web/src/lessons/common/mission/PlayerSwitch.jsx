import { useInMissionPlayer } from './missionPlayerContext';

/**
 * Rendre une chose DANS le lecteur de mission (l'élève) et une autre hors de lui (l'enseignant, le mode classe, les leçons
 * sans mission) : `<PlayerSwitch player={<LabRounds …/>} page={<ManipulationWorkspace …/>} />`. Un seul rendu à la fois.
 */
export default function PlayerSwitch({ player, page }) {
  return useInMissionPlayer() ? player : page;
}
