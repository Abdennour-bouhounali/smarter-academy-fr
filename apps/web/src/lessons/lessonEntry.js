/**
 * WHERE A STUDENT LANDS IN A V2 LESSON (LESSON_V2.md §2): the lesson's address is HIS HOME of the lesson; its game world
 * is at the same address with `?monde=1`. One place says it, read by the home (`LessonIndex`), by the loading screen
 * (`LessonWaiting`) and by the links that go straight into the world.
 */
const WORLD_PARAM = 'monde';

export const worldPath = (basePath) => `${basePath}?${WORLD_PARAM}=1`;

/** Is this address the world itself? `params` is a URLSearchParams (the router's, or the window's). */
export const opensWorldNow = (params) => params.get(WORLD_PARAM) === '1';

/**
 * THE LESSON'S TOOLS, OPENED WITH NO WORLD (owner, 2026-11-26): « Espace d'entraînement », « Fiche de connaissances » and
 * « Mon labo » are at the lesson's address with `?outil=<tool>` — the 3D world is NOT loaded (`LessonIndex`,
 * `gameworld/LessonToolsLoader`). Closing one comes back to the home.
 */
const TOOLS = ['entrainement', 'fiche', 'labo'];
export const toolPath = (basePath, tool) => `${basePath}?outil=${tool}`;
export const toolAsked = (params) => (TOOLS.includes(params.get('outil')) ? params.get('outil') : null);

/** A game level is played IN the world: the tools send the student there, straight on that run (kit/LessonWorld.jsx). */
export const levelPath = (basePath, node, level) => `${worldPath(basePath)}&jouer=${node}:${level}`;
export const levelAsked = (params) => {
  const m = opensWorldNow(params) && /^(\d+):(\d+)$/.exec(params.get('jouer') ?? '');
  return m ? { node: Number(m[1]), level: Number(m[2]) } : null;
};
