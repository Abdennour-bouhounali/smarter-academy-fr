import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « حاصل القسمة والكسر » (1AM) — SOURCE UNIQUE (content/textbook.js : معارف 1 p. 55 sans son dernier
 * exemple, طريقة de la plateforme).
 */
/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'kasr-hasil-qisma', type: 'regles', title: 'الكسر هو حاصل القسمة',
        memo: {
          rule: `a\\div b=${R('\\dfrac{a}{b}')}`,
          hook: 'الكعكات فوق، الأطفال تحت',
          example: `2\\div 3=${R('\\dfrac{2}{3}')}`,
          trap: 'لا تقلب الكسر: عدد الأطفال هو المقام',
          exam: 'اكتب الحاصل كسرًا بسطه المقسوم ومقامه المقسوم عليه',
          chip: `a\\div b=${R('\\tfrac{a}{b}')}`,
          quiz: [
            { q: 'حاصل قسمة $5$ على $6$ هو:', options: ['$\\frac{5}{6}$', '$\\frac{6}{5}$', '$5{,}6$'], correct: 0 },
            { q: '$7\\div 3$ يساوي:', options: ['$\\frac{7}{3}$', '$\\frac{3}{7}$', '$7{,}3$'], correct: 0 },
          ],
        },
        predictPrompt: 'في لوحتك: كل طفل يأخذ قطعًا من كل كعكة، وحصّته تُكتب بعدد القطع من عدد القطع في الكعكة. بأيّ كسر نكتب حاصل قسمة عدد الكعكات على عدد الأطفال؟ اكتب القاعدة بكلماتك.',
        summary: 'الكسر $\\frac{a}{b}$ ($b\\neq 0$) هو حاصل قسمة $a$ على $b$: $a\\div b=\\frac{a}{b}$ ؛ البسط هو المقسوم والمقام هو المقسوم عليه.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.definition}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.vocabulary}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'natija-darb', type: 'regles', title: 'الكسر مضروبًا في مقامه',
        memo: {
          rule: `b\\times\\dfrac{a}{b}=${R('a')}`,
          hook: 'الحصص معًا = كل الكعكات',
          example: `3\\times\\dfrac{2}{3}=${R('2')}`,
          trap: 'الناتج هو البسط وحده، لا كسر جديد',
          exam: 'اكتب الجداء ثم اختصر المقام مع العدد المضروب',
          chip: `b\\times\\tfrac{a}{b}=${R('a')}`,
          quiz: [
            { q: '$4\\times\\frac{3}{4}$ يساوي:', options: ['$3$', '$\\frac{12}{16}$', '$4$'], correct: 0 },
            { q: 'العدد الناقص في $6\\times\\ldots=5$ :', options: ['$\\frac{5}{6}$', '$\\frac{6}{5}$', '$30$'], correct: 0 },
          ],
        },
        predictPrompt: 'في لوحتك: $b$ أطفال يأخذون حصصًا متساوية تملأ $a$ كعكة بالضبط. ماذا يعطي ضرب حصّة الواحد في عدد الأطفال؟ اكتب النتيجة بكلماتك.',
        summary: 'الكسر $\\frac{a}{b}$ هو العدد الذي إذا ضُرب في $b$ أعطى $a$: $\\frac{a}{b}\\times b=a$ ؛ ومنه العدد الناقص في $b\\times\\ldots=a$ هو $\\frac{a}{b}$.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.result}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.example1}</MathText></p>
          </div>
        ),
      },
      {
        id: 'ashri-ghayr-ashri', type: 'concepts', title: 'حاصل قسمة عشري وغير عشري', predict: false,
        memo: {
          rule: `\\dfrac{3}{4}=${R('0{,}75')}\\quad\\dfrac{7}{3}\\approx${R('2{,}33')}`,
          hook: 'الكسر هو القيمة المضبوطة',
          example: `\\dfrac{2}{3}\\approx 0{,}67`,
          trap: '2,33 ليس 7 على 3: إنّه قيمة مقرّبة فقط',
          exam: 'إذا لم تنتهِ القسمة، اترك النتيجة كسرًا',
          chip: `\\tfrac{7}{3}\\approx${R('2{,}33')}`,
          quiz: [
            { q: 'أيّ كسر يساوي عددًا عشريًا بالضبط؟', options: ['$\\frac{3}{4}$', '$\\frac{2}{3}$', '$\\frac{7}{3}$'], correct: 0 },
            { q: 'القيمة المضبوطة لحاصل قسمة $2$ على $3$ :', options: ['$\\frac{2}{3}$', '$0{,}67$', '$0{,}6$'], correct: 0 },
          ],
        },
        summary: 'لا يكون الكسر عددًا عشريًا دائمًا: $\\frac{7}{3}$ ليس عشريًا لأنّ القسمة لا تنتهي، و $2{,}33$ قيمة مقرّبة، والكسر هو القيمة المضبوطة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.example2}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.notAlwaysDecimal}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqat-adad-naqis', type: 'methodes', title: 'طريقة إيجاد العدد الناقص',
        memo: {
          rule: `b\\times ${R('\\ldots')}=a\\ \\Rightarrow\\ ${R('\\dfrac{a}{b}')}`,
          hook: 'اقسم الناتج على المعلوم',
          example: `8\\times ${R('\\dfrac{13}{8}')}=13`,
          trap: 'لا تقسم المعلوم على الناتج: 8 على 13 خطأ',
          exam: 'اكتب العدد الناقص كسرًا ثم تحقّق بالضرب',
          chip: `b\\times\\ldots=a`,
          quiz: [
            { q: 'العدد الناقص في $8\\times\\ldots=13$ :', options: ['$\\frac{13}{8}$', '$\\frac{8}{13}$', '$5$'], correct: 0 },
            { q: 'العدد الناقص في $7\\times\\ldots=0{,}7$ :', options: ['$0{,}1$', '$10$', '$\\frac{7}{0{,}7}$'], correct: 0 },
          ],
        },
        predictPrompt: 'لإكمال $\\ldots\\times 8=13$ ، من أيّ قسمة تبدأ لتعرف العدد الناقص؟ اكتب الطريقة بكلماتك.',
        summary: 'لإيجاد العدد الناقص في $b\\times\\ldots=a$ نقسم الناتج $a$ على العدد المضروب $b$: العدد الناقص هو $\\frac{a}{b}$.',
        body: (
          <div className="space-y-2">
            {METHOD.solution.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
          </div>
        ),
      },
    ],
  },
};
