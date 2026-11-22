/**
 * THE CONTENT of « أدمج تعلّماتي » (unit 1) for its world « جزيرة المهمّات » (`gameworld/missionIsle`,
 * `docs/reports/INTEGRATION_LESSON_PLAN.md` §4): NOT a lesson of keys — three missions on the BEM's integration
 * situation, the unit's recap, and its bank as training exams. Named in the lesson's pack (`lesson.pack.js`).
 *   missions   the two situations played in the depot (data: `../missions/`), in order
 *   bank       mission 3: a sheet of the lesson's bank the world serves in exam form (the kit's sitting, its level 5:
 *              « الوضعيّة الإدماجيّة ») — its first try is evidence, re-judged by the server
 *   endless    the unit's endless game (`./endless.js`): rounds from 1AM content up to the unit's last lesson
 *   recap      the unit's lessons, in order: the island shows the rules of each (their worlds' tablets) — a rule the
 *              student has not forged keeps its name hidden
 */
import { createJourney } from '../../../../../../common/gameworld/kit/journey';
import { SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { BEM_2020 } from '../missions/bem2020';
import { BEM_2022 } from '../missions/bem2022';
import { endless } from './endless';
import { LEVELS, sittings } from './sitting';
import { TEXT } from './text';

/** No practice ladder here: the exam space is open from the first minute (the kit's road asks a ladder for it). */
const ladder = { nodes: [{ id: SUMMARY }], nodeOpen: () => true };

export const lesson = {
  /** No rule is forged in this lesson: its keys are the unit's, shown in the recap. */
  keys: [],
  rules: {},
  keysFromModules: () => [],
  missions: [BEM_2022, BEM_2020],
  bank: {
    id: 'bank-sheet',
    level: 5,
    title: 'المهمّة 3',
    sub: 'وضعية إدماجية من تمارين الوحدة، في ورقة امتحان: وحدك.',
  },
  recap: [
    { id: 'qasim-adad-tabii', title: 'قاسم لعدد طبيعي' },
    { id: 'qawasim-adad-tabii', title: 'قواسم عدد طبيعي' },
    { id: 'khawass-qawasim', title: 'خواص القواسم' },
    { id: 'qasim-mushtarak-akbar', title: 'القاسم المشترك الأكبر' },
    { id: 'bahth-pgcd', title: 'البحث عن القاسم المشترك الأكبر' },
    { id: 'tayin-pgcd', title: 'تعيين القاسم المشترك الأكبر' },
    { id: 'awwaliyan-fima-baynahuma', title: 'عددان أوّليان فيما بينهما' },
    { id: 'ikhtizal-kasr', title: 'اختزال كسر' },
  ],
  /** « سباق الأعداد »: the endless game of the unit, a door of the home — a game, never evidence. */
  endless,
  sittings,
  journey: createJourney({ keys: [], ladder, levels: LEVELS, stages: 3, cards: 0 }),
  /** Missions 1 and 2 are never evidence (plan §5); the sitting sends its own (`sittings.sheetOf`). */
  evidence: { payloadOf: () => null, verify: () => false },
  cards: { ofKey: {}, ofExercise: {}, fallback: null },
  text: TEXT,
};
