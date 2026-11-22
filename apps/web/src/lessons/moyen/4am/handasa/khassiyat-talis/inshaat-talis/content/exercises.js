/**
 * Les exercices du MANUEL rattachés au درس 3 « إنشاءات هندسية وتطبيقات خاصية طالس » (extraction.json →
 * destinations : ex-17, ex-18, ex-19 p. 111 « وضع نقط على مستقيم », ex-21 p. 113 « أتعمّق »). Énoncés au mot
 * près. Une construction ne se corrige pas par mots-clés : chaque partie demande le RAISONNEMENT de la
 * construction (combien de marques, laquelle relier, où tombe le point, quel rapport en résulte) avec des
 * distracteurs FAUX (calculés ici ; la confusion qu'ils portent est dite en commentaire). Les réponses sont
 * celles de l'extraction (`answerSource: computed`).
 */
import { src } from '../../_unit/unitMeta.js';
import { withContext } from '../../../../../../common/textbook/exerciseParts.js';
import { LP } from './textbook.js';

const S111 = (n, part) => ({ ...src(`ex-${n}`, 111, 'وضع نقط على مستقيم', n), ...(part ? { part } : {}) });
const S113 = (part) => ({ ...src('ex-21', 113, 'أتعمّق', 21), ...(part ? { part } : {}) });

export const EXERCISES = [
  // تمرين 17 — AM/AB = 3/7, M sur [AB]
  {
    id: 'ex-17', source: S111(17), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'ارسم قطعة مستقيم [AB]. أنشئ، دون استعمال مسطرة مدرجة، النقطة M من [AB] حيث $\\dfrac{AM}{AB} = \\dfrac{3}{7}$ .',
    interaction: 'batch',
    question: {
      prompt: 'خطوات الإنشاء على نصف مستقيم [Ax) مساعد:',
      rows: [
        { label: 'عدد القطع المتقايسة التي نعيّنها بالمدور على [Ax)', options: ['$7$', '$3$', '$10$'], correct: 0,
          correction: 'AB يقابل 7 أجزاء متساوية و AM ثلاثة منها: 7 قطع (العدد 10 هو $3 + 7$ ، يصلح لو كان المطلوب $\\dfrac{MA}{MB} = \\dfrac{3}{7}$ ).' },
        { label: 'العلامة التي نصلها بالنقطة B', options: ['السابعة', 'الثالثة', 'العاشرة'], correct: 0,
          correction: 'نصل آخر علامة، السابعة، بـ B : المثلث الذي رؤوسه A والعلامة 7 و B.' },
        { label: 'الموازي الذي يعيّن M يشمل', options: ['العلامة الثالثة', 'العلامة الرابعة', 'العلامة السابعة'], correct: 0,
          correction: 'الموازي المارّ بالعلامة الثالثة: $\\dfrac{AM}{AB} = \\dfrac{3}{7}$ حسب خاصية طالس (الرابعة تعطي $\\dfrac{4}{7}$ ).' },
      ],
      explain: 'المسطرة غير مدرّجة: لا نقيس AB ، بل نحوّل المسألة إلى 7 قطع متقايسة على نصف مستقيم مساعد.',
    },
    method: 'نصف مستقيم [Ax) نعيّن عليه بالمدور 7 قطع متقايسة ، نصل النقطة السابعة بـ B ، والموازي له المار بالنقطة الثالثة يقطع [AB] في M.',
    commonError: 'تعيين 10 قطع ($3 + 7$) كأنّ النسبة $\\dfrac{MA}{MB}$ ، بينما $\\dfrac{AM}{AB} = \\dfrac{3}{7}$ تعني أن AB سبعة أجزاء.',
  },
  // تمرين 18 — AM/AB = 4/9, M sur (AB) hors de [AB]
  {
    id: 'ex-18', source: S111(18), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'ارسم مستقيما (AB). أنشئ، دون استعمال مسطرة مدرّجة، النقطة M من (AB) ولا تنتمي إلى [AB] حيث $\\dfrac{AM}{AB} = \\dfrac{4}{9}$ .',
    interaction: 'batch',
    question: {
      prompt: 'أين تقع M وكيف ننشئها؟',
      rows: [
        { label: 'تقع M على المستقيم (AB)', options: ['من الجهة الأخرى للنقطة A', 'بين A و B', 'بعد B'], correct: 0,
          correction: '$AM = \\dfrac{4}{9}AB$ أصغر من AB : لو كانت بعد B لكان $AM > AB$ ، وهي لا تنتمي إلى [AB]، فهي من الجهة الأخرى للنقطة A.' },
        { label: 'على [Ax) نعيّن قطعا متقايسة عددها', options: ['$9$', '$4$', '$13$'], correct: 0,
          correction: '9 قطع على [Ax) ونصل التاسعة بـ B (و 13 هو $4 + 9$ ).' },
        { label: 'النقطة التي يمر بها الموازي هي العلامة الرابعة على', options: ['نصف المستقيم المعاكس [Ax′)', 'نصف المستقيم [Ax) نفسه', 'المستقيم (AB)'], correct: 0,
          correction: 'العلامة الرابعة على [Ax′) المعاكس لـ [Ax) : الموازي المارّ بها يقطع (AB) في M من الجهة الأخرى للنقطة A (على [Ax) نفسه نحصل على النقطة من [AB]).' },
      ],
      explain: 'النسبة $\\dfrac{4}{9}$ نفسها تعطي نقطتين على (AB) بعدهما عن A يساوي $\\dfrac{4}{9}AB$ : واحدة على [AB] والثانية في الجهة المعاكسة.',
    },
    method: 'على نصف مستقيم [Ax) نعيّن 9 قطع متقايسة ونصل النقطة التاسعة بـ B ؛ على نصف المستقيم المعاكس [Ax′) نعيّن النقطة الرابعة ، والموازي المار بها يقطع (AB) في M من الجهة الأخرى للنقطة A.',
    commonError: 'إنشاء M على [AB] (العلامة الرابعة على [Ax) نفسه)، بينما المطلوب نقطة لا تنتمي إلى [AB].',
  },
  // تمرين 19 — PM/PN = 11/7 : deux points
  {
    id: 'ex-19', source: S111(19), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'ضع نقطتين متمايزتين M و N، أنشئ نقطة P من (MN) حيث $\\dfrac{PM}{PN} = \\dfrac{11}{7}$ .',
    interaction: 'batch',
    question: {
      prompt: 'بموازيين مدرّجين بنفس الوحدة يشملان M و N:',
      rows: [
        { label: 'إذا عيّنا 11 وحدة على موازي M و 7 على موازي N من جهتين مختلفتين فإن', options: ['$\\dfrac{MP}{MN} = \\dfrac{11}{18}$', '$\\dfrac{MP}{MN} = \\dfrac{11}{7}$', '$\\dfrac{MP}{MN} = \\dfrac{7}{18}$'], correct: 0,
          correction: 'P بين M و N : MN = 11 + 7 = 18 جزءًا و MP منها 11.' },
        { label: 'إذا عيّناهما من نفس الجهة فإن', options: ['$\\dfrac{MP}{MN} = \\dfrac{11}{4}$', '$\\dfrac{MP}{MN} = \\dfrac{11}{18}$', '$\\dfrac{MP}{MN} = \\dfrac{4}{11}$'], correct: 0,
          correction: 'P خارج [MN] : $\\dfrac{PM}{PN} = \\dfrac{11}{7}$ و $PM - PN = MN$ ، فـ MN أربعة أجزاء و MP أحد عشر: $\\dfrac{MP}{MN} = \\dfrac{11}{4}$ .' },
        { label: 'النقطة P الخارجية تقع', options: ['بعد N', 'قبل M', 'في منتصف [MN]'], correct: 0,
          correction: 'PM أكبر من PN : P أقرب إلى N ، فهي بعد N (لأن $\\dfrac{11}{4} > 1$ ).' },
      ],
      explain: 'كما في الطريقة: من جهتين مختلفتين نحصل على النقطة الداخلية، ومن نفس الجهة على النقطة الخارجية.',
    },
    method: 'موازيان مدرّجان بنفس الوحدة يشملان M و N : 11 وحدة من جهة و 7 من الجهة الأخرى تعطيان P بين M و N ؛ 11 و 7 من نفس الجهة تعطيان P خارج [MN] .',
    commonError: 'الاكتفاء بالنقطة الداخلية: النسبة $\\dfrac{11}{7}$ تتحقّق أيضًا في نقطة خارج [MN].',
  },
  // تمرين 21 (أتعمّق) — le triangle EFG rectangle en E, EF = 4, EG = 3
  {
    id: 'ex-21-1', source: S113('1'), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'أنشئ مثلثا EFG قائما في E حيث EF = 4cm و EG = 3cm. 1) احسب $\\mathcal{A}_1$ مساحة المثلث EFG. 2) أنشئ، دون استعمال مسطرة مدرجة، النقطة L من نصف المستقيم [FE) حيث L لا تنتمي إلى [FE] و $\\dfrac{EL}{EF} = \\dfrac{2}{3}$ ، والنقطة P من نصف المستقيم [GE) حيث P لا تنتمي إلى [GE] و $\\dfrac{EP}{EG} = \\dfrac{2}{3}$ ، واستنتج (GF)//(LP). 3) احسب القيمة المضبوطة لكل من الطول LP، وارتفاع المثلث ELP المتعلّق بالرأس E. 4) احسب القيمة المضبوطة لـ $\\mathcal{A}_2$ مساحة المثلث ELP، ثم تحقّق أنّ $\\mathcal{A}_2 = \\left(\\dfrac{2}{3}\\right)^2 \\mathcal{A}_1$ .',
    interaction: 'numeric',
    question: {
      prompt: '1) مساحة المثلث EFG بالسنتيمتر المربع: $\\mathcal{A}_1 =$',
      expected: 6, display: '6',
      explain: 'المثلث قائم في E : $\\mathcal{A}_1 = \\dfrac{EF \\times EG}{2} = \\dfrac{4 \\times 3}{2} = 6\\,\\mathrm{cm^2}$ .',
    },
  },
  {
    id: 'ex-21-2', source: S113('2'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'batch',
    question: {
      prompt: '2) إنشاء L و P ثم التوازي:',
      rows: [
        { label: 'الطول $EL$', options: ['$\\dfrac{8}{3}\\,\\mathrm{cm}$', '$6\\,\\mathrm{cm}$', '$\\dfrac{4}{3}\\,\\mathrm{cm}$'], correct: 0,
          correction: '$EL = \\dfrac{2}{3} \\times 4 = \\dfrac{8}{3}$ (نقسم [EF] إلى 3 قطع متقايسة وننقل قطعتين بعد E). ($6 = \\dfrac{3}{2} \\times 4$ نسبة مقلوبة.)' },
        { label: 'تقع L', options: ['على المستقيم (EF) بعد E (من الجهة الأخرى للنقطة F)', 'بين E و F', 'بعد F'], correct: 0,
          correction: 'L من نصف المستقيم [FE) ولا تنتمي إلى [FE] : هي بعد E.' },
        { label: 'الطول $EP$', options: ['$2\\,\\mathrm{cm}$', '$\\dfrac{9}{2}\\,\\mathrm{cm}$', '$1\\,\\mathrm{cm}$'], correct: 0,
          correction: '$EP = \\dfrac{2}{3} \\times 3 = 2$ .' },
        { label: '$(GF) // (LP)$ لأنّ', options: ['$\\dfrac{EL}{EF} = \\dfrac{EP}{EG}$ والنقط L و E و F ، P و E و G مرتبة بنفس الترتيب', 'L و P خارج المثلث', '$EL + EP = EF$'], correct: 0,
          correction: 'الخاصية العكسية لخاصية طالس: النسبتان تساويان $\\dfrac{2}{3}$ والنقط مرتبة بنفس الترتيب. (و $EL + EP = \\dfrac{8}{3} + 2 = \\dfrac{14}{3} \\neq 4$ .)' },
      ],
      explain: 'لإنشاء L دون مسطرة مدرّجة نقسم [EF] إلى 3 قطع متقايسة (نصف مستقيم مساعد وموازيات) وننقل قطعتين بالمدور على امتداد [FE) بعد E.',
    },
    commonError: 'وضع L بين E و F: L تنتمي إلى نصف المستقيم [FE) لكن لا تنتمي إلى [FE] .',
  },
  {
    id: 'ex-21-3a', source: S113('3'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'fraction',
    question: {
      prompt: '3) $FG = 5\\,\\mathrm{cm}$ (خاصية فيثاغورس). الطول LP بالسنتيمتر (كسر غير قابل للاختزال):',
      expected: '10/3',
      explain: '(LP)//(GF) : $\\dfrac{LP}{FG} = \\dfrac{EL}{EF} = \\dfrac{2}{3}$ ، و $FG = \\sqrt{4^2 + 3^2} = 5$ ، فـ $LP = \\dfrac{2}{3} \\times 5 = \\dfrac{10}{3}$ .',
    },
  },
  {
    id: 'ex-21-3b', source: S113('3'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'numeric',
    question: {
      prompt: '3) ارتفاع المثلث ELP المتعلّق بالرأس E (بالسنتيمتر، عدد عشري):',
      expected: 1.6, display: '1,6',
      explain: 'المثلث ELP قائم في E : $EL \\times EP = LP \\times h$ ، فـ $h = \\dfrac{\\frac{8}{3} \\times 2}{\\frac{10}{3}} = \\dfrac{16}{10} = 1{,}6$ .',
    },
  },
  {
    id: 'ex-21-4', source: S113('4'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'fraction',
    question: {
      prompt: '4) المساحة $\\mathcal{A}_2$ للمثلث ELP بالسنتيمتر المربع (كسر غير قابل للاختزال):',
      expected: '8/3',
      explain: '$\\mathcal{A}_2 = \\dfrac{EL \\times EP}{2} = \\dfrac{\\frac{8}{3} \\times 2}{2} = \\dfrac{8}{3}$ ، و $\\left(\\dfrac{2}{3}\\right)^2 \\times 6 = \\dfrac{4}{9} \\times 6 = \\dfrac{8}{3}$ : تحقّقنا.',
    },
    commonError: 'ضرب المساحة في $\\dfrac{2}{3}$ ($\\mathcal{A}_2 = 4$): المساحة تُضرب في مربع النسبة $\\left(\\dfrac{2}{3}\\right)^2$ .',
  },
];

/** Les parties d'un exercice (ex-21 en a quatre). */
// lecteur : les parties sans énoncé portent celui de la partie 1 (« pas d'aller-retour », common/textbook/exerciseParts.js)
export const partsOf = (n) => withContext(EXERCISES.filter((e) => e.id === `ex-${n}` || e.id.startsWith(`ex-${n}-`)));
