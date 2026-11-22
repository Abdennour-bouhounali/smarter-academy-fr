/**
 * THE CONTENT of lesson `qawasim-adad-tabii` for its game world: everything the kit's screens and frames need from the
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
  /** The keys the lesson's own progress proves: module 1 is marked on the second tablet, module 2 on the last one. */
  keysFromModules(done = []) {
    const has = (n) => done.some((m) => Number(m) === n);
    if (has(2)) return [...KEYS];
    return has(1) ? KEYS.slice(0, 2) : [];
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
    ofKey: {
      'jidaa-aamilayn': 'jidaa',
      'qasim-rappel': 'rappel',
      'tariqa-qawasim': 'tariqa',
      'qawaid-qisma': 'qawaid',
    },
    ofExercise: { products: 'jidaa', method: 'tariqa', rules: 'qawaid', wall: 'ex105' },
    fallback: 'jidaa',
  },
  /** « خريطة المعارف »: { graph, modules, positions }. */
  knowledge: KNOWLEDGE,
  text: TEXT,
};
