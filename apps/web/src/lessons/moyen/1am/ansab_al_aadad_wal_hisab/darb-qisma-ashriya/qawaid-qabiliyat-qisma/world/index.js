/**
 * THE CONTENT of lesson `qawaid-qabiliyat-qisma` for its game world: everything the kit's screens and frames need from
 * the lesson, in ONE object (`lesson`). The world's shell hands it down with `<LessonProvider lesson={lesson}>`; a screen
 * of the kit reads it with `useLesson()` and never imports this folder. Named in the lesson's pack (`lesson.pack.js`).
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
   * The keys the lesson's own progress proves (the modules of its config): module 1 (the table of numbers) the units
   * digit and the sum of the digits, module 2 (المعارف) those two and « يقبل القسمة » by the remainder, module 3 (the
   * method for 4) the last two digits.
   */
  keysFromModules(done = []) {
    const has = (n) => done.some((m) => Number(m) === n);
    const held = new Set();
    if (has(1) || has(2)) KEYS.slice(0, 2).forEach((k) => held.add(k));
    if (has(2)) held.add(KEYS[3]);
    if (has(3)) held.add(KEYS[2]);
    return KEYS.filter((k) => held.has(k));
  },
  /** The story the world plays: its islands and gaps, and what happens on the way. */
  story: STORY,
  /** The forge of each rule (forges.js): keys 1–3 open on an experiment, the last one on the mirror alone. */
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
   * Which card of the knowledge map trains what was missed. The sitting serves the bank (sitting.js): what it leaves is a
   * rule KEY, or `ex:<id>` for a sheet that lost points (kit/bankSitting.js › weakKinds) — never a kind of exercise, so
   * `ofExercise` names none (the kit reads it before `ofKey`), and a sheet falls back to the lesson's first card.
   */
  cards: {
    ofKey: { 'raqm-alahad': 'ahad', 'majmu-arqam': 'majmu', 'raqmayn-akhirayn': 'akhirayn', 'baqi-sifr': 'baqi' },
    ofExercise: {},
    fallback: 'qabiliya',
  },
  /** « خريطة المعارف »: { graph, modules, positions }. */
  knowledge: KNOWLEDGE,
  text: TEXT,
};
