/**
 * THE CONTENT of lesson `jidhr-tarbii` for its game world « قصر الساحات »: everything the kit's screens and frames need
 * from the lesson, in ONE object (`lesson`). The world's shell hands it down with `<LessonProvider lesson={lesson}>`; a
 * screen of the kit reads it with `useLesson()` and never imports this folder. Named in the lesson's pack
 * (`lesson.pack.js`).
 * No `keysFromModules`: the lesson's old modules are not what proves a key of this world (they are to be deleted).
 */
import { evidence, trainerEvidence } from './evidence';
import { FORGES } from './forges';
import { KEYS, journey } from './journey';
import { KNOWLEDGE } from './knowledge';
import { ladder, PRACTICE_MAP } from './practice';
import { RUN } from './run';
import { sittings } from './sitting';
import { STORY } from './story';
import { TABLETS } from './tablets';
import { TEXT } from './text';
import { trainer } from './trainer';

export const lesson = {
  /** The rules of the lesson, in the order the story gives them. */
  keys: KEYS,
  /** The tablet of each rule: { icon, title, lines, list?, math, notes }. */
  rules: TABLETS,
  /** The story the world plays: its terraces and courts, and what happens on the way. */
  story: STORY,
  /** The forge of each rule: the experiment that finds it, the tiles of his rule, how the mirror tests and attacks it. */
  forges: FORGES,
  /** « سباق المربّعات »: the course of gates of the third terrace (the kit's rail of light). */
  run: RUN,
  /** « حلبة التدريب »: a level is a run of the same rail (`rootCourts/Game.js › startPractice`). */
  ladder,
  /** The practice hub: { root, positions, edges }. */
  practiceMap: PRACTICE_MAP,
  /** « الامتحان الأبيض »: the lesson's bank, as it is. */
  sittings,
  /** « تدرّب »: its questions, how they are judged, and which of their answers are evidence. */
  trainer: { ...trainer, evidenceOf: trainerEvidence },
  journey,
  evidence,
  /**
   * Which card of the knowledge map trains what a sitting missed. The sitting is the lesson's BANK (kit/bankSitting.js ›
   * `weakKinds`): the KEYS of the questions that lost points first — each has its card in `ofKey` — then `ex:<id>` for
   * the sheets, which name no kind of exercise: `ofExercise` is empty, and a sheet whose questions carry no key opens
   * `fallback` (the definition, which every other card of the lesson stands on).
   */
  cards: {
    ofKey: { 'dil-as-saha': 'jidhr', 'qima-madbuta': 'madbuta', 'dhahab-wa-iyab': 'dhahab' },
    ofExercise: {},
    fallback: 'jidhr',
  },
  /** « خريطة المعارف »: { graph, modules, positions }. */
  knowledge: KNOWLEDGE,
  text: TEXT,
};
