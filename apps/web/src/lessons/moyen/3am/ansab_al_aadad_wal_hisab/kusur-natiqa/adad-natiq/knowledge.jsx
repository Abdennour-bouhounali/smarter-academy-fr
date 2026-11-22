import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « العدد الناطق » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 5 p. 28, طريقة 10 p. 29, réécrits). La kitaba fractionnaire d'un quotient
 * (1AM, leçon `hasil-qisma-kasr`), le quotient de deux relatifs et sa règle du signe (3AM, leçon `qismat-nisbiyayn`) et l'ordre des relatifs (2AM) sont des prérequis (`priorKnowledge`), mesurés par « أستعدّ »,
 * jamais des items ici.
 */
const { definition, inclusions, standard } = KNOWLEDGE;

/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'adad-natiq', type: 'regles', title: 'العدد الناطق',
        memo: {
          rule: `\\dfrac{a}{b}\\ (b${R('\\neq0')})`,
          hook: 'حاصل قسمة عددين، والمقام غير معدوم',
          example: `-\\dfrac{7}{3}=\\dfrac{-7}{3}`,
          trap: 'ظنّ أنّ لكل عدد ناطق كتابة عشرية تامّة',
          exam: 'اكتب: ناطق لأنّه حاصل قسمة عددين مقامه غير معدوم',
          chip: `\\tfrac{a}{b},\\ b${R('\\neq0')}`,
          quiz: [
            { q: 'أيّ الأعداد التالية ناطق؟', options: ['$\\frac{-7}{3}$', '$\\frac{5}{0}$', '$\\frac{0}{0}$'], correct: 0 },
            { q: 'لماذا لا يُقبل المقام $0$ ؟', options: ['لأنّ القسمة على $0$ غير معرّفة', 'لأنّ الحاصل يساوي $0$ دائمًا', 'لأنّ المقام يجب أن يكون موجبًا'], correct: 0 },
          ],
        },
        predictPrompt: 'استقرّت $-\\frac{7}{3}$ بين $-3$ و $-2$ مكانًا دقيقًا، مع أنّ كتابتها العشرية $-2{,}333\\ldots$ لا تنتهي. أكمل: حاصل قسمة عدد نسبي على عدد نسبي غير معدوم هو … اكتب ملاحظتك.',
        summary: 'حاصل قسمة عدد نسبي على عدد نسبي غير معدوم عدد ناطق، له مكان على المستقيم.',
        body: <p><MathText>{definition.text}</MathText></p>,
      },
      {
        id: 'maqam-mujab', type: 'regles', title: 'الكتابة بمقام موجب',
        memo: {
          rule: `\\dfrac{a}{-b}=${R('-')}\\dfrac{a}{b}`,
          hook: 'انقل الإشارة من المقام إلى الكسر',
          example: `\\dfrac{6}{-8}=-\\dfrac{6}{8}=-\\dfrac{3}{4}`,
          trap: 'إسقاط الإشارة السالبة عند نقلها',
          exam: 'اكتب العدد بمقام موجب ثم اختزل',
          chip: `\\tfrac{a}{-b}=${R('-')}\\tfrac{a}{b}`,
          quiz: [
            { q: 'الكتابة المعيارية للعدد $\\frac{6}{-8}$ هي:', options: ['$-\\frac{3}{4}$', '$\\frac{3}{4}$', '$-\\frac{4}{3}$'], correct: 0 },
            { q: 'العدد $\\frac{-9}{-12}$ يساوي:', options: ['$\\frac{3}{4}$', '$-\\frac{3}{4}$', '$\\frac{4}{3}$'], correct: 0 },
          ],
        },
        predictPrompt: 'استقرّت البطاقتان $\\frac{6}{-8}$ و $\\frac{-3}{4}$ على الملقط نفسه عند $-\\frac{3}{4}$ . كيف نكتب كلّ عدد ناطق بكتابة واحدة معيارية؟ اكتب فكرتك.',
        summary: 'كل عدد ناطق يُكتب $\\frac{a}{b}$ أو $-\\frac{a}{b}$ بمقام موجب.',
        body: <p><MathText>{standard.text}</MathText></p>,
      },
      {
        id: 'tartib-natiqa', type: 'regles', title: 'ترتيب أعداد ناطقة',
        memo: {
          rule: `\\dfrac{a}{${R('D')}}<\\dfrac{c}{${R('D')}}\\iff a<c`,
          hook: 'وحّد المقام الموجب ثم قارن البسطين',
          example: `-\\dfrac{7}{4}=-\\dfrac{21}{12}<-\\dfrac{8}{12}=-\\dfrac{2}{3}`,
          trap: 'مقارنة المقامين بدل البسطين',
          exam: 'اكتب الأعداد بالمقام الموجب نفسه ثم رتّب',
          chip: `\\tfrac{a}{${R('D')}}<\\tfrac{c}{${R('D')}}`,
          quiz: [
            { q: 'أيّ العددين أصغر: $-\\frac{7}{4}$ أم $-\\frac{2}{3}$ ؟', options: ['$-\\frac{7}{4}$', '$-\\frac{2}{3}$', 'متساويان'], correct: 0 },
            { q: 'بالمقام $12$ يصبح العدد $\\frac{5}{6}$ :', options: ['$\\frac{10}{12}$', '$\\frac{5}{12}$', '$\\frac{6}{12}$'], correct: 0 },
          ],
        },
        predictPrompt: 'لترتيب $-\\frac{7}{4}$ و $-\\frac{2}{3}$ و $\\frac{5}{6}$ كتبنا الأعداد الثلاثة بالمقام $12$ . ماذا نفعل بعد ذلك؟ اكتب طريقتك.',
        summary: 'نكتب الأعداد بنفس المقام الموجب ثمّ نقارنها كأعداد نسبية.',
        body: <p><MathText>{METHOD.choose.rule}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'adad-natiq-shamil', type: 'regles', title: 'أعداد هي ناطقة',
        memo: {
          rule: `\\mathbb{N}\\subset\\mathbb{Z}\\subset\\mathbb{D}\\subset${R('\\mathbb{Q}')}`,
          hook: 'كل عدد نعرفه ناطق',
          example: `-1{,}8=-\\dfrac{18}{10}=-\\dfrac{9}{5}`,
          trap: 'ظنّ العدد العشري غير ناطق',
          exam: 'اكتب العدد على شكل حاصل قسمة عددين صحيحين',
          chip: `\\mathbb{D}\\subset${R('\\mathbb{Q}')}`,
          quiz: [
            { q: 'العدد $-1{,}8$ يساوي:', options: ['$-\\frac{9}{5}$', '$\\frac{9}{5}$', '$-\\frac{18}{5}$'], correct: 0 },
            { q: 'أيّ العبارات التالية صحيحة؟', options: ['كل عدد صحيح نسبي عدد ناطق', 'كل عدد ناطق عدد عشري', 'لا يوجد عدد ناطق سالب'], correct: 0 },
          ],
        },
        predictPrompt: 'هل $-3$ عدد ناطق؟ وهل $-1{,}8$ ؟ اكتب كلّ عدد منهما على شكل حاصل قسمة عددين نسبيين.',
        summary: 'كل عدد طبيعي وكل عدد صحيح نسبي وكل عدد عشري نسبي عدد ناطق.',
        body: <div className="space-y-2"><p><MathText>{inclusions.text}</MathText></p></div>,
      },
    ],
    3: [
      {
        id: 'tariqa-muqarana', type: 'methodes', title: 'مقام موجب مشترك',
        memo: {
          rule: `\\dfrac{a}{b}=\\dfrac{a${R('\\times k')}}{b${R('\\times k')}}`,
          hook: 'مقام موجب مشترك ثم قارن',
          example: `\\dfrac{-5}{6}=\\dfrac{-10}{12}\\ ,\\ \\dfrac{7}{-4}=\\dfrac{-21}{12}`,
          trap: 'نسيان جعل المقام موجبًا قبل المقارنة',
          exam: 'اكتب المقام المشترك ثم قارن البسطين',
          chip: `\\tfrac{a}{b}=\\tfrac{a${R('k')}}{b${R('k')}}`,
          quiz: [
            { q: 'أصغر مقام موجب مشترك للعددين $\\frac{-5}{6}$ و $\\frac{7}{-4}$ :', options: ['$12$', '$24$', '$10$'], correct: 0 },
            { q: 'العدد $\\frac{7}{-4}$ يساوي:', options: ['$-\\frac{21}{12}$', '$\\frac{21}{12}$', '$-\\frac{7}{12}$'], correct: 0 },
          ],
        },
        predictPrompt: 'لمقارنة $\\frac{-4{,}9}{6}$ و $\\frac{-3{,}5}{4}$ كتبناهما بالمقام $12$ . كيف وصلنا إليه، وماذا قارنّا بعد ذلك؟ اكتب طريقتك.',
        summary: METHOD.compare.rule,
        body: <div className="space-y-2"><p><MathText>{METHOD.compare.rule}</MathText></p><p className="text-sm text-slate-600"><MathText>{METHOD.place.rule}</MathText></p></div>,
      },
    ],
  },
};
