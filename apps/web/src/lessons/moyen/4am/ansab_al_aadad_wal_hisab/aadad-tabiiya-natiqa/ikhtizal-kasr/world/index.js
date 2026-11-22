/**
 * THE CONTENT of lesson `ikhtizal-kasr` for its game world: everything the kit's screens and frames need from the
 * lesson, in ONE object (`lesson`). The world's shell hands it down with `<LessonProvider lesson={lesson}>`; a screen of
 * the kit reads it with `useLesson()` and never imports this folder. Named in the lesson's pack (`lesson.pack.js`).
 */
import { evidence, trainerEvidence } from './evidence';
import { FORGES } from './forges';
import { KEYS, journey } from './journey';
import { KNOWLEDGE } from './knowledge';
import { ladder, PRACTICE_MAP } from './practice';
import { sittings } from './sitting';
import { MODULE_KEYS, STORY, TABLETS } from './story';
import { TEXT } from './text';
import { trainer } from './trainer';

export const lesson = {
  /** The rules of the lesson, in the order the story gives them. */
  keys: KEYS,
  /** The tablet of each rule: { icon, title, lines, math, notes }. */
  rules: TABLETS,
  /** The keys the lesson's own progress proves: those the modules he completed teach (`MODULE_KEYS`). */
  keysFromModules(done = []) {
    const proved = new Set(done.flatMap((m) => MODULE_KEYS[Number(m)] ?? []));
    return KEYS.filter((k) => proved.has(k));
  },
  /** The story the world plays: its islands and bridges, and what happens on the way. */
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
   * `weakKinds`): the KEYS of the questions that lost points first — each has its card in `ofKey` — then `ex:<id>` for
   * the sheets, which name no kind of exercise: `ofExercise` is empty, and a sheet whose questions carry no key opens
   * `fallback` (the irreducible form by the PGCD: 94 of the bank's 149 questions ask it).
   */
  cards: {
    ofKey: {
      'ikhtizal-marahil': 'marahil',
      'ghayr-qabil': 'ghayr',
      'ikhtizal-pgcd': 'pgcd',
      'natija-mukhtazala': 'natija',
    },
    ofExercise: {},
    fallback: 'pgcd',
  },
  /** « خريطة المعارف »: { graph, modules, positions }. */
  knowledge: KNOWLEDGE,
  text: TEXT,
};
