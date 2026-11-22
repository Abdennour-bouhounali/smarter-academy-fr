// A neutral lesson index for the class-session tests (the generated one is EMPTY until the first French lesson):
// a lesson of keys with its world, knowledge and board; a unit's last lesson (a world and a board, no knowledge); a lesson
// with a world and no board yet; a lesson without a pack. Used as the `vi.mock` of `lessons/lessonIndex.generated.json`.
const line = (id, pack) => ({
  id,
  level: 'college',
  grade: '3e',
  chapter: 'nombres_calculs',
  modules: [[1, 'm1']],
  ...(pack ? { pack } : {}),
});

export const LESSON_INDEX = {
  modulesFormat: '[number, slug]',
  lessons: [
    line('lecon-cles', { world: 'divisor-isles', knowledge: true, coach: true, board: true }),
    line('lecon-synthese', { world: 'mission-isle', board: true }),
    line('lecon-monde', { world: 'divisor-isles', knowledge: true }),
    line('lecon-simple'),
  ],
};
