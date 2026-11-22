import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « مقارنة كسرين » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js). Les écritures fractionnaires égales (1AM ikhtizal), le quotient (1AM hasil-qisma-kasr)
 * et la mise sur même dénominateur (jam-tarh-kusur) ne sont PAS des items ici : ce sont des prérequis, rappelés par les « تذكّر » du module 2.
 */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const M = (s) => <MathText>{s}</MathText>;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'nafs-al-maqam', type: 'regles', title: 'نفس المقام',
        memo: {
          rule: `\\dfrac{a}{b}<\\dfrac{c}{b}\\iff a<c`,
          hook: 'علامات واحدة: أكثر علامات مملوءة أعلى',
          example: `\\dfrac{5}{8}<\\dfrac{${R('7')}}{8}`,
          trap: 'لا تقارن المقامين حين يتساوى المقام',
          exam: 'اكتب: المقام واحد و 5 < 7',
          chip: `\\tfrac{5}{8}<\\tfrac{7}{8}`,
          quiz: [
            { q: 'أيّ الكسرين أكبر: $\\frac{5}{8}$ أم $\\frac{7}{8}$ ؟', options: ['$\\frac{7}{8}$', '$\\frac{5}{8}$', 'متساويان'], correct: 0 },
            { q: 'قارن $\\frac{7{,}1}{6}$ و $\\frac{7}{6}$ :', options: ['$\\frac{7{,}1}{6}>\\frac{7}{6}$', '$\\frac{7{,}1}{6}<\\frac{7}{6}$', 'متساويان'], correct: 0 },
          ],
        },
        predictPrompt: 'في المهمة 1 كان في الأنبوبين ثماني علامات، وزيت الأيسر 5 علامات وزيت الأيمن 7. أيّهما أعلى ولماذا؟ اكتب ما لاحظته بكلماتك.',
        summary: 'حين تتساوى المقامات نقارن البسطين: أكبرهما هو الكسر الأكبر.',
        body: <p><MathText>{GUIDE.sameDen}</MathText></p>,
      },
      {
        id: 'tawhid-li-muqarana', type: 'methodes', title: 'توحيد المقامين للمقارنة',
        memo: {
          rule: `\\dfrac{a}{b}=\\dfrac{a\\times k}{b\\times k}`,
          hook: 'الليزر يقرأ الارتفاع نفسه في الأنبوبين',
          example: `\\dfrac{3}{4}=\\dfrac{3\\times 3}{4\\times 3}=\\dfrac{${R('9')}}{12}>\\dfrac{7}{12}`,
          trap: 'لا تغيّر المقام وحده: 3/4 ليس 3/12',
          exam: 'اكتب الكسر بمقام الآخر ثم قارن البسطين',
          chip: `\\tfrac{3}{4}=\\tfrac{9}{12}`,
          quiz: [
            { q: '$\\frac{3}{4}$ مكتوبًا بالاثني عشريات:', options: ['$\\frac{9}{12}$', '$\\frac{3}{12}$', '$\\frac{7}{12}$'], correct: 0 },
            { q: 'قارن $\\frac{3}{4}$ و $\\frac{7}{12}$ :', options: ['$\\frac{3}{4}>\\frac{7}{12}$', '$\\frac{3}{4}<\\frac{7}{12}$', 'متساويان'], correct: 0 },
          ],
        },
        predictPrompt: 'في المهمة 2 قطع الليزر الأنبوب الأيمن عند 9 من 12 حين لمس زيت الأيسر (3/4). ماذا تستنتج عن 3/4 و 9/12؟ وكيف تقارن 3/4 و 7/12؟ اكتب طريقتك.',
        summary: 'نكتب الكسر ذا المقام الأصغر بمقام الآخر (نضرب حدّيه في العدد نفسه) ثم نقارن البسطين.',
        body: <p><MathText>{GUIDE.multiple}</MathText></p>,
      },
      {
        id: 'nafs-al-bast', type: 'regles', title: 'نفس البسط',
        memo: {
          rule: `\\dfrac{a}{b}>\\dfrac{a}{d}\\iff b<d`,
          hook: 'علامات أصغر في الأنبوب الأكثر علامات',
          example: `\\dfrac{3}{5}>\\dfrac{3}{${R('8')}}`,
          trap: 'أكثر أجزاء لا تعني أكثر زيتًا',
          exam: 'اكتب: البسط واحد والأصغر مقامًا هو الأكبر',
          chip: `\\tfrac{3}{5}>\\tfrac{3}{8}`,
          quiz: [
            { q: 'أيّ الكسرين أكبر: $\\frac{7}{9}$ أم $\\frac{7}{12}$ ؟', options: ['$\\frac{7}{9}$', '$\\frac{7}{12}$', 'متساويان'], correct: 0 },
            { q: 'قارن $\\frac{3}{5}$ و $\\frac{3}{8}$ :', options: ['$\\frac{3}{5}>\\frac{3}{8}$', '$\\frac{3}{5}<\\frac{3}{8}$', 'متساويان'], correct: 0 },
          ],
        },
        predictPrompt: 'في المهمة 3 زيت كلّ خزّان 3 علامات، لكنّ الأيسر مدرّج بخمس علامات والأيمن بثمانٍ. أيّهما أعلى ولماذا؟ اكتب ما لاحظته.',
        summary: 'حين يتساوى البسط، الكسر الأكبر هو الذي له أصغر مقام.',
        body: <p><MathText>{GUIDE.sameNum}</MathText></p>,
      },
      {
        id: 'muqarana-bi-1', type: 'regles', title: 'المقارنة بالعدد واحد',
        memo: {
          rule: `\\dfrac{a}{b}<1\\iff a<b`,
          hook: 'خطّ الامتلاء هو 1',
          example: `\\dfrac{5}{6}<1<\\dfrac{${R('9')}}{8}`,
          trap: 'ليس كلّ كسر أصغر من 1',
          exam: 'قارن البسط بالمقام',
          chip: `\\tfrac{5}{6}<1<\\tfrac{9}{8}`,
          quiz: [
            { q: '$\\frac{11}{10}$ مقارنًا بـ $1$ :', options: ['أكبر من $1$', 'أصغر من $1$', 'يساوي $1$'], correct: 0 },
            { q: 'قارن $\\frac{7}{11}$ و $\\frac{4}{3}$ :', options: ['$\\frac{7}{11}<\\frac{4}{3}$', '$\\frac{7}{11}>\\frac{4}{3}$', 'متساويان'], correct: 0 },
          ],
        },
        predictPrompt: 'في المهمة 4 زيت أحد الخزّانين تجاوز خطّ الامتلاء 1. كيف عرفت ذلك من ورقته؟ وهل تقارن الخزّانين دون الليزر؟ اكتب ما لاحظته.',
        summary: 'الكسر أصغر من $1$ إن كان بسطه أصغر من مقامه، وأكبر من $1$ إن كان بسطه أكبر؛ ويمكن استعمال $1$ وسيطًا.',
        body: <p><MathText>{GUIDE.one}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'qawaid-muqarana', type: 'regles', title: 'قواعد المقارنة', predict: false,
        memo: {
          rule: `\\dfrac{a}{b}\\ ?\\ \\dfrac{c}{d}`,
          hook: 'أنظر أوّلًا: مقام؟ بسط؟ مضاعف؟ العدد 1؟',
          example: `\\dfrac{3}{5}=\\dfrac{12}{20}>\\dfrac{11}{20}`,
          trap: 'لا تقارن البسطين وحدهما حين تختلف المقامات',
          exam: 'اذكر الحالة ثم قارن',
          chip: `\\tfrac{3}{5}>\\tfrac{11}{20}`,
          quiz: [
            { q: 'قارن $\\frac{3}{5}$ و $\\frac{11}{20}$ :', options: ['$\\frac{3}{5}>\\frac{11}{20}$', '$\\frac{3}{5}<\\frac{11}{20}$', 'متساويان'], correct: 0 },
            { q: '$\\frac{11}{13}$ و $\\frac{13}{12}$ :', options: ['$\\frac{11}{13}<\\frac{13}{12}$', '$\\frac{11}{13}>\\frac{13}{12}$', 'متساويان'], correct: 0 },
          ],
        },
        summary: 'نفس المقام: قارن البسطين؛ نفس البسط: الأصغر مقامًا هو الأكبر؛ مقام مضاعف: وحّد المقامين؛ العدد 1 وسيط.',
        body: (
          <div className="space-y-2">
            {['sameDen', 'sameNum', 'multiple', 'one'].map((id) => (
              <div key={id}><p>{M(KNOWLEDGE[id].text)}</p><p className="text-sm text-slate-600">{M(KNOWLEDGE[id].example)}</p></div>
            ))}
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tartib-kusur', type: 'methodes', title: 'ترتيب كسور',
        memo: {
          rule: `\\dfrac{a}{D}<\\dfrac{b}{D}<\\dfrac{c}{D}`,
          hook: 'نفس المقام ثم نرتّب البسوط',
          example: `\\dfrac{7}{12}<\\dfrac{${R('8')}}{12}<\\dfrac{9}{12}<\\dfrac{10}{12}`,
          trap: 'لا ترتّب المقامات ولا تتّجه عكس الترتيب المطلوب',
          exam: 'اكتب الكسور بنفس المقام ثم رتّب البسوط',
          chip: `\\tfrac{7}{12}<\\tfrac{8}{12}`,
          quiz: [
            { q: 'الترتيب التصاعدي لـ $\\frac{3}{4}$ ، $\\frac{5}{8}$ ، $\\frac{1}{2}$ :', options: ['$\\frac{1}{2}<\\frac{5}{8}<\\frac{3}{4}$', '$\\frac{3}{4}<\\frac{5}{8}<\\frac{1}{2}$', '$\\frac{1}{2}<\\frac{3}{4}<\\frac{5}{8}$'], correct: 0 },
            { q: 'بالثمانيات $\\frac{3}{4}=$', options: ['$\\frac{6}{8}$', '$\\frac{3}{8}$', '$\\frac{4}{8}$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف ترتّب أربعة كسور مقاماتها 6 و12 و3 و4 من الأصغر إلى الأكبر؟ بأيّ مقام تكتبها كلّها؟ اكتب طريقتك.',
        summary: METHOD.rule,
        body: (<div className="space-y-2"><p>{M(KNOWLEDGE.multiple.text)}</p><p className="text-sm text-slate-600">{M(METHOD.solution[1])}</p></div>),
      },
      {
        id: 'tariqa-tawhid', type: 'methodes', title: 'اختيار الطريقة',
        memo: {
          rule: `\\dfrac{4{,}2}{5}=\\dfrac{8{,}4}{10}>\\dfrac{8{,}1}{10}`,
          hook: 'البسط العشري يُقارَن كالأعداد العادية',
          example: `\\dfrac{4{,}2}{5}=\\dfrac{4{,}2\\times 2}{5\\times 2}=\\dfrac{${R('8{,}4')}}{10}`,
          trap: 'لا تحذف الفاصلة من البسط',
          exam: 'اكتب الكسر بالمقام الآخر ثم قارن البسطين',
          chip: `\\tfrac{4{,}2}{5}>\\tfrac{8{,}1}{10}`,
          quiz: [
            { q: '$\\frac{4{,}2}{5}$ بمقام $10$ :', options: ['$\\frac{8{,}4}{10}$', '$\\frac{4{,}2}{10}$', '$\\frac{9{,}2}{10}$'], correct: 0 },
            { q: 'قارن $\\frac{9}{7}$ و $\\frac{8}{9}$ :', options: ['$\\frac{9}{7}>\\frac{8}{9}$', '$\\frac{9}{7}<\\frac{8}{9}$', 'متساويان'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تقارن 9/7 و 8/9 دون توحيد المقامين؟ وكيف تقارن كسرين بسطاهما عشريان؟ اكتب طريقتك.',
        summary: METHOD.rule,
        body: <p>{M(METHOD.solution[3])}</p>,
      },
    ],
  },
};
