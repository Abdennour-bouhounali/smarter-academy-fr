/**
 * THE CONTENT of lesson `qisma-iqlidiya-baqi` for its game world: everything the kit's screens and frames need from the
 * lesson, in ONE object (`lesson`). The world's shell hands it down with `<LessonProvider lesson={lesson}>`; a screen of
 * the kit reads it with `useLesson()` and never imports this folder. Named in the lesson's pack (`lesson.pack.js`).
 */
import { evidence, trainerEvidence } from './evidence';
import { FORGES } from './forges';
import { KEYS, journey } from './journey';
import { KNOWLEDGE } from './knowledge';
import { ladder, PRACTICE_MAP } from './practice';
import { sittings } from './sitting';
import { STORY, TABLETS } from './story';
import { TEXT } from './text';
import { trainer } from './trainer';

export const lesson = {
  /** The rules of the lesson, in the order the story gives them. */
  keys: KEYS,
  /** The tablet of each rule: { icon, title, lines, list?, math, notes }. */
  rules: TABLETS,
  /**
   * The keys the lesson's own progress proves, by the modules of its config the story marks (`story.js › afterKey`):
   * module 1 the first key, module 2 the first three, module 3 the first four, module 4 or 5 (the problems) all five.
   */
  keysFromModules(done = []) {
    const has = (n) => done.some((m) => Number(m) === n);
    if (has(4) || has(5)) return [...KEYS];
    if (has(3)) return KEYS.slice(0, 4);
    if (has(2)) return KEYS.slice(0, 3);
    return has(1) ? KEYS.slice(0, 1) : [];
  },
  /** The story the world plays: its islands and gaps, and what happens on the way. */
  story: STORY,
  /** The forge of each rule: how it is found, the tiles of his rule, how the mirror tests and attacks it. */
  forges: FORGES,
  ladder,
  /** The practice hub: { root, positions, edges }. */
  practiceMap: PRACTICE_MAP,
  sittings,
  /** « تدرّب »: its questions, how they are judged, and which of their answers are evidence. */
  trainer: { ...trainer, evidenceOf: trainerEvidence },
  journey,
  evidence,
  /** Which card of the knowledge map trains a key the last exam sitting left weak. */
  cards: {
    ofKey: {
      'majmuaat-kamila': 'kamila',
      'baqi-asghar': 'asghar',
      'musawat-qisma': 'musawat',
      'taqdir-hasil': 'taqdir',
      'baqi-fi-masala': 'masala',
    },
    // the sittings of this lesson serve its bank (`kit/bankSitting.js › weakKinds`): what a miss leaves is a KEY (read by
    // `ofKey`) or the mark of a sheet (« ex:<id> », which trains no card: `fallback`) — no kind of exercise names a card
    ofExercise: {},
    fallback: 'kamila',
  },
  /** « خريطة المعارف »: { graph, modules, positions }. */
  knowledge: KNOWLEDGE,
  text: TEXT,
};
