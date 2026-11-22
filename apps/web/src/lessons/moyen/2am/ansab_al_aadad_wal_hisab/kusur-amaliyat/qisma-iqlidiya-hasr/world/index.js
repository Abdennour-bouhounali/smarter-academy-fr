/**
 * THE CONTENT of lesson `qisma-iqlidiya-hasr` for its game world: everything the kit's screens and frames need from the
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
   * The keys the lesson's own progress proves (the story marks module 1 after the first key, 3 after the bracket, 2 after
   * the zero remainder): module 2 (the knowledge) all three, module 3 (bracketing a big quotient) the first two, module 1
   * (the activity) the first.
   */
  keysFromModules(done = []) {
    const has = (n) => done.some((m) => Number(m) === n);
    if (has(2)) return [...KEYS];
    if (has(3)) return KEYS.slice(0, 2);
    return has(1) ? KEYS.slice(0, 1) : [];
  },
  /** The story the world plays: its islands and gaps, and what happens on the way. */
  story: STORY,
  /** The forge of each rule: what the student predicts, the tiles of his rule, how the mirror tests and attacks it. */
  forges: FORGES,
  ladder,
  /** The practice hub: { root, positions, edges }. */
  practiceMap: PRACTICE_MAP,
  sittings,
  /** « تدرّب »: its questions, how they are judged, and which of their answers are evidence. */
  trainer: { ...trainer, evidenceOf: trainerEvidence },
  journey,
  evidence,
  /** Which card of the knowledge map trains what: a key, or a kind of exam exercise that was missed. */
  cards: {
    ofKey: { 'qisma-ay-adad': 'taqdir', 'hasr-hasil': 'hasr', 'inidam-baqi': 'inidam' },
    ofExercise: {
      division: 'taqdir',
      unknown: 'khata-baqi',
      bracket: 'hasr',
      situation: 'khata-lazim',
      zero: 'inidam',
    },
    fallback: 'taqdir',
  },
  /** « خريطة المعارف »: { graph, modules, positions }. */
  knowledge: KNOWLEDGE,
  text: TEXT,
};
