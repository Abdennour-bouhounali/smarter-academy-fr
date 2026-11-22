/**
 * THE CONTENT of lesson `natiqa-ghayr-natiqa` for its game world « قصر الساحات »: everything the kit's screens and frames
 * need from the lesson, in ONE object (`lesson`). The world's shell hands it down with `<LessonProvider lesson={lesson}>`;
 * a screen of the kit reads it with `useLesson()` and never imports this folder. Named in the lesson's pack
 * (`lesson.pack.js`).
 * No `run`: the lesson has no course of gates (lesson 1's « سباق المربّعات » already trained the squares; the decimal
 * squares of this lesson are met on the courts themselves, the platform's area written live as the rod grows).
 */
import { evidence, trainerEvidence } from './evidence';
import { FORGES } from './forges';
import { KEYS, journey } from './journey';
import { KNOWLEDGE } from './knowledge';
import { ladder, PRACTICE_MAP } from './practice';
import { sittings } from './sitting';
import { STORY } from './story';
import { TABLETS } from './tablets';
import { TEXT } from './text';
import { trainer } from './trainer';

export const lesson = {
  /** The rules of the lesson, in the order the story gives them. */
  keys: KEYS,
  /** The tablet of each rule: { icon, title, lines, math, notes }. */
  rules: TABLETS,
  /** The story the world plays: its terraces and courts, and what happens on the way. */
  story: STORY,
  /** The forge of each rule (written by the forges' agent). */
  forges: FORGES,
  /** « حلبة التدريب »: a level is a run of the kit's rail (`rootCourts/Game.js › startPractice`). */
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
   * the sheets; a sheet whose questions carry no key (P1, which no key's evidence names) opens `fallback`.
   */
  cards: {
    ofKey: { 'murabba-natiq': 'jidhr-natiq', 'la-kasr-yarkab': 'ghayr-natiq', 'al-mudawwar': 'mudawwar' },
    ofExercise: {},
    fallback: 'natiq',
  },
  /** « خريطة المعارف »: { graph, modules, positions }. */
  knowledge: KNOWLEDGE,
  text: TEXT,
};
