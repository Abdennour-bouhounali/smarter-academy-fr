/**
 * THE TABLETS of lesson `natiqa-ghayr-natiqa` — where each rule gets its NAME, after the student forged it (`forges.js`;
 * the screen `kit/Tablet.jsx`: `lines` through MathText, `notes` as plain text, `math` as formulas). Only here do
 * « عدد ناطق », « عدد غير ناطق » and « المدوَّر » appear first (`story.test.js` checks that no instruction, robot sentence or
 * level name of the practice says them). What lesson 1 named — the square root, √ — he owns from the first screen.
 * A tablet is at most two lines, two formulas and one note (defects.md B17); every number is the story's, computed.
 */
import { ltr } from '../../../../../../common/gameworld/kit/authoring/numbers';
import { read, rootOf, tex } from '../../../../../../common/gameworld/rootCourts/logic';
import { CALCULATOR, COURTS } from './story';
import { above, cut, middle, rounded, sq } from './math';

/** The rules of the lesson, in the order the story gives them — 🧩 ♾️ 🎯: ONE list, `journey.js › KEYS`. */
import { KEYS } from './journey';
export { KEYS };

const [K1, K2, K3] = KEYS;
/** An area as the irreducible fraction it is (« 5,76 » → 144/25), as a formula. */
const asFraction = (x) => {
  const r = read(x);
  return `\\dfrac{${r.n}}{${r.d}}`;
};
const C = COURTS.sortC; // 5,76: ridden by 2,4
const T = COURTS.marksA; // 19: the middle mark of a tenth leaves a band
const H = COURTS.marksB; // 66: the middle mark of a hundredth jams

export const TABLETS = {
  [K1]: {
    icon: '🧩',
    title: 'العدد الناطق',
    lines: [
      'كلّ عدد يُكتب كسرًا $\\dfrac{p}{q}$ حدّاه عددان طبيعيان ($q$ غير معدوم) نسمّيه عددًا ناطقًا: الأعداد العشريّة والكسور أعداد ناطقة.',
      `ضلع الساحة عدد ناطق حين تُكتب مساحتها كسرًا غير قابل للاختزال حدّاه مربّعان: $${tex(C)} = ${asFraction(C)}$، إذن $\\sqrt{${tex(C)}} = ${asFraction(rootOf(C))} = ${tex(rootOf(C))}$.`,
    ],
    math: ['\\sqrt{\\dfrac{a^2}{b^2}} = \\dfrac{a}{b}', `\\sqrt{${tex(COURTS.small)}} = ${tex(rootOf(COURTS.small))}`],
    notes: [
      `في سطح الفرز ركبت علامةٌ الساحاتِ ${COURTS.sortA} و ${COURTS.sortC} و ${COURTS.sortOut}، ولم تركب أيّ علامة الساحتين ${COURTS.sortB} و ${COURTS.sortD}.`,
    ],
  },
  [K2]: {
    icon: '♾️',
    title: 'العدد غير الناطق',
    lines: [
      `ضلع الساحة ${COURTS.two} موجود — إنّه جدارها — ولا كسر يكتبه: مهما اقترب كسر من الضلع، لا يصير مربّعه ${COURTS.two} أبدًا. نقول: $\\sqrt{${COURTS.two}}$ عدد غير ناطق.`,
      'إذا لم يكن العدد الموجب $a$ مربّع عدد ناطق، فإنّ $\\sqrt{a}$ عدد غير ناطق، ولا تعرض له الحاسبة إلّا قيمة مقرّبة.',
    ],
    math: [
      `\\sqrt{${COURTS.two}} \\approx ${tex(CALCULATOR)}`,
      `${tex(cut(COURTS.two, 2))} < \\sqrt{${COURTS.two}} < ${tex(above(COURTS.two, 2))}`,
    ],
    notes: [`كذلك ضلعا الساحتين ${COURTS.sortB} و ${COURTS.sortD}: لا علامة تركبهما، ولا كسر.`],
  },
  [K3]: {
    icon: '🎯',
    title: 'المدوَّر',
    lines: [
      'بين علامتين متجاورتين ينتهي الجدار: الصغرى قيمة مقرّبة بالنقصان، والكبرى قيمة مقرّبة بالزيادة. المدوَّر هو الأقرب منهما إلى الضلع.',
      'العلامة الوسطى تحكم: إن تركت منصّتها شريطًا فالمدوَّر هو الكبرى، وإن علقت فالمدوَّر هو الصغرى.',
    ],
    math: [
      `${tex(middle(T, 1))}^2 = ${tex(sq(middle(T, 1)))} < ${T} \\Rightarrow \\sqrt{${T}} \\approx ${tex(rounded(T, 1))}`,
      `${tex(middle(H, 2))}^2 = ${tex(sq(middle(H, 2)))} > ${H} \\Rightarrow \\sqrt{${H}} \\approx ${tex(rounded(H, 2))}`,
    ],
    notes: [
      `مدوَّر ${ltr(`√${T}`)} إلى ${ltr('0,1')} هو ${ltr(rounded(T, 1))}، وقيمته المقرّبة بالنقصان ${ltr(cut(T, 1))}: ليسا العدد نفسه دائمًا.`,
    ],
  },
};
