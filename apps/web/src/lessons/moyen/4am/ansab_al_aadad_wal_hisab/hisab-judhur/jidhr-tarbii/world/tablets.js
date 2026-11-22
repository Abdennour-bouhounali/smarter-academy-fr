/**
 * THE TABLETS of lesson `jidhr-tarbii` — where each rule gets its NAME, after the student forged it in its forge
 * (`forges.js`; the screen `kit/Tablet.jsx`: `lines` through MathText, `list` and `notes` as plain text, `math` as
 * formulas). Nothing here is shown before its forge is sealed: the sign √ and the words « الجذر التربيعي » appear first
 * on tablet 🔑 (`forges.test.js` checks that no forge, tile or experiment says them before).
 * A tablet is at most a method line, a short list and one note (defects.md B17); `math` at most two rows.
 */
import { ltr } from '../../../../../../common/gameworld/kit/authoring/numbers';
import { rootOf, tex } from '../../../../../../common/gameworld/rootCourts/logic';
import { CALCULATOR, COURTS } from './story';

/** The rules of the lesson, in the order the story gives them — 🔑 ✍️ 🔁: ONE list, `journey.js › KEYS` (the status script reads it there). */
import { KEYS } from './journey';
export { KEYS };

const [K1, K2, K3] = KEYS;
const PALM = COURTS.palm; // 36: ridden by 6
const SMALL = COURTS.small; // 16: where « four times the rod » rode by chance
const FIRST = COURTS.first; // 30: ridden by no number
/** The calculator's ten digits cut to two decimals: the longest rod of two decimals that still leaves a band. */
const [W, D] = CALCULATOR.split(',');
const BELOW = `${W},${D.slice(0, 2)}`;
const ABOVE = `${W},${String(Number(D.slice(0, 2)) + 1).padStart(2, '0')}`;
/** Nine steps to the left (the walk of the experiment of 🔁): its court, and the side that came out of it. */
const WALK = 9;

export const TABLETS = {
  [K1]: {
    icon: '🔑',
    title: 'الجذر التربيعي',
    lines: [
      'ضلع ساحة مساحتها $a$ هو العدد الموجب الذي مربّعه $a$. نسمّيه الجذر التربيعي للعدد $a$، ونكتبه $\\sqrt{a}$.',
      `مثل: $${rootOf(PALM)} \\times ${rootOf(PALM)} = ${PALM}$، إذن $\\sqrt{${PALM}} = ${rootOf(PALM)}$ — ويُقرأ « الجذر التربيعي للعدد ${PALM} ».`,
    ],
    math: [`\\sqrt{${PALM}} = ${rootOf(PALM)}`, `\\sqrt{${COURTS.wind}} = ${rootOf(COURTS.wind)}`],
    notes: [
      `أربعة أمثال المقياس صدفةٌ في الساحة ${SMALL} (${ltr(`4 × ${rootOf(SMALL)} = ${SMALL}`)})، وفي الساحة ${PALM} علقت منصّة المقياس ${Number(PALM) / 4}.`,
    ],
  },
  [K2]: {
    icon: '✍️',
    title: 'القيمة المضبوطة والقيمة المقرّبة',
    lines: [
      `لا عدد عشريّ تركب منصّته الساحة ${FIRST}، لكنّ ضلعها موجود: الجدار. نكتب طوله $\\sqrt{${FIRST}}$ — تلك قيمته المضبوطة، الكتابة الوحيدة الصحيحة تمامًا.`,
      `ما تعرضه الحاسبة، $${tex(CALCULATOR)}$، قيمة مقرّبة: منصّته تترك شريطًا لا تراه العين.`,
    ],
    list: [
      `قيمة مقرّبة إلى ${ltr('0,01')} بالنقصان: ${ltr(BELOW)} — منصّتها تترك شريطًا.`,
      `قيمة مقرّبة إلى ${ltr('0,01')} بالزيادة: ${ltr(ABOVE)} — منصّتها تعلق.`,
    ],
    math: [`${tex(BELOW)} < \\sqrt{${FIRST}} < ${tex(ABOVE)}`, `\\sqrt{${FIRST}} \\approx ${tex(BELOW)}`],
    notes: [`وحين يكون مربّع ما تعرضه الحاسبة هو المساحة تمامًا، فهو الطول نفسه: ${rootOf(PALM)} للساحة ${PALM}.`],
  },
  [K3]: {
    icon: '🔁',
    title: 'ذهاب وإياب',
    lines: [
      'لكلّ عدد موجب $a$: الساحة المبنيّة على $\\sqrt{a}$ مساحتها $a$، وضلع الساحة المبنيّة على مقياس طوله $a$ هو $a$.',
    ],
    math: ['(\\sqrt{a})^2 = a', '\\sqrt{a^2} = a'],
    notes: [
      `الضلع طول، والطول لا إشارة له: ${WALK} خطوات إلى اليسار تبني الساحة ${WALK * WALK}، وضلعها ${WALK} لا ${ltr(`-${WALK}`)}.`,
    ],
  },
};
