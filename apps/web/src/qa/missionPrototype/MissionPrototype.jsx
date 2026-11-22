/**
 * PROTOTYPE page (dev builds only, `/__qa/mission-1`, `/__qa/mission-2`): a mission of the integration lesson of 4AM unit 1, for the owner
 * to play (`docs/reports/INTEGRATION_LESSON_PLAN.md` §6, step 1). The mission is played IN THE 3D DEPOT of the world.
 * Until the integration lesson has its own pack, this page MOUNTS the world itself, with the pilot lesson's content as
 * its host — no lesson page in between (its account, its launch kit and its saved journey do not matter here: the world
 * opens on a save of its own, `qa-mission-1`, and as a preview: nothing is sent). The page names the situation in
 * `window.__qaMission` while it is on screen; every world built here starts the mission by itself.
 */
import MissionIsle from '../../lessons/common/gameworld/missionIsle/MissionIsle';
import DivisorIsles from '../../lessons/common/gameworld/divisorIsles/DivisorIsles';
import { lesson } from '../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii/world';
import { LESSON_CONFIG } from '../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii/lesson.config';
import { BEM_2020 } from '../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/wadiya-idmajiya-aadad/missions/bem2020';
import { BEM_2022 } from '../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/wadiya-idmajiya-aadad/missions/bem2022';

import { lesson as integration } from '../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/wadiya-idmajiya-aadad/world';
import { LESSON_CONFIG as INTEGRATION_CONFIG } from '../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/wadiya-idmajiya-aadad/lesson.config';

const MISSIONS = { 1: BEM_2022, 2: BEM_2020 };

/** `/__qa/missions`: the HOME of the integration lesson (its island, its three missions, its exam door, the recap), as a preview. */
export function MissionsHome() {
  if (typeof window !== 'undefined') window.__qaMission = null;
  return (
    <MissionIsle
      lesson={integration}
      config={{ ...INTEGRATION_CONFIG, id: 'qa-missions-home' }}
      basePath="/__qa/missions"
      exitTo="/"
      completedModules={[]}
      preview
    />
  );
}

export default function MissionPrototype({ n = 1 }) {
  // said BEFORE the world is built (during render) and never taken back: in dev React builds the world twice, and an
  // effect's cleanup here would run between the two. The world starts a mission only on a `/__qa/` address.
  if (typeof window !== 'undefined') window.__qaMission = MISSIONS[n];
  return (
    <DivisorIsles
      key={n}
      lesson={lesson}
      config={{ ...LESSON_CONFIG, id: `qa-mission-${n}` }}
      basePath={`/__qa/mission-${n}`}
      exitTo="/"
      completedModules={[]}
      preview
    />
  );
}
