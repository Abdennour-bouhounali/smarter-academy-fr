/**
 * THE CONTENT of lesson `khawass-qawasim` for its game world: everything the kit's screens and frames need from the
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
   * The keys the lesson's own progress proves: module 1 (the three cases) the first key, module 2 (the properties) the
   * first three, module 3 (the proof) all four.
   */
  keysFromModules(done = []) {
    const has = (n) => done.some((m) => Number(m) === n);
    if (has(3)) return [...KEYS];
    if (has(2)) return KEYS.slice(0, 3);
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
  /**
   * Which card of the knowledge map trains what a sitting missed. The sitting is the lesson's BANK (kit/bankSitting.js ›
   * `weakKinds`): what it leaves is the KEYS of the questions that lost points, first — each has its card in `ofKey` —
   * then `ex:<id>` for the sheets, which name no kind of exercise: `ofExercise` is empty (the kit reads it before
   * `ofKey`, Spaces.jsx), and a sheet whose questions carry no key opens `fallback`.
   */
  cards: {
    ofKey: { 'jam-wal-farq': 'majmu', madaaf: 'mudaaf', 'baqi-qisma': 'baqi', burhan: 'burhan' },
    ofExercise: {},
    fallback: 'majmu',
  },
  /** « خريطة المعارف »: { graph, modules, positions }. */
  knowledge: KNOWLEDGE,
  text: TEXT,
};
