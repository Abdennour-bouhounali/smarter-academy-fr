import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD_SIMPLIFY, METHOD_RATIONALIZE, TILING } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** `R(x)` : ce qui CHANGE dans la règle d'une fiche `memo`, en rouge. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

/**
 * Les connaissances du درس 5 — SOURCE UNIQUE, construite à partir des deux
 * encadrés « طريقة » de la page 25 (content/textbook.js). Une
 * <KnowledgeBrick id="…"> dans un module et la carte rendent le même objet.
 *
 *   module 1  kitaba-a-jidhr-b  la première طريقة, nommée après le carré dallé
 *   module 2  tabsit-tawzii     la seconde طريقة (la خاصية التوزيعية)
 *   module 3  naqt-maqam        la طريقة « نسبة مقامها عدد غير ناطق »
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'kitaba-a-jidhr-b', type: 'methodes', title: 'أبسط كتابة لجذر: b أصغر ما يمكن',
        memo: {
          rule: `\\sqrt{n}=\\sqrt{${R('a^2')}\\times b}=${R('a')}\\sqrt{b}`,
          hook: 'أكبر مربّع يقسم العدد',
          example: `\\sqrt{54}=\\sqrt{${R('9')}\\times 6}=${R('3')}\\sqrt{6}`,
          trap: 'التوقف عند مربّع صغير فيبقى مربّع تحت الجذر',
          exam: 'ابحث عن أكبر مربّع كامل يقسم العدد قبل الكتابة',
          chip: `\\sqrt{a^2b}=${R('a')}\\sqrt{b}`,
          quiz: [
            { q: 'أبسط كتابة للعدد $\\sqrt{63}$ :', options: ['$3\\sqrt{7}$', '$7\\sqrt{3}$', '$9\\sqrt{7}$'], correct: 0 },
            { q: 'أبسط كتابة للعدد $\\sqrt{245}$ :', options: ['$7\\sqrt{5}$', '$5\\sqrt{7}$', '$49\\sqrt{5}$'], correct: 0 },
          ],
        },
        predictPrompt: 'على المربّع 32: مع بلاطتين على الضلع بقيت البلاطة 8 قابلة للتبليط من جديد، ومع 4 بلاطات على الضلع صارت البلاطة 2 لا تُبلَّط. لو أعطيناك عددًا آخر $n$، كيف تختار التبليط لتكتب $\\sqrt{n}$ على الشكل $a\\sqrt{b}$ حيث $b$ أصغر ما يمكن؟ اكتب الطريقة بكلماتك.',
        summary: 'لكتابة $\\sqrt{n}$ على الشكل $a\\sqrt{b}$ حيث $b$ أصغر ما يمكن، نبحث عن أكبر مربع $a^2$ يقسم $n$، فيكون $n = a^2 \\times b$.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.simplest}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{TILING.example}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'tabsit-tawzii', type: 'methodes', title: 'جمع جذور متشابهة بالخاصية التوزيعية',
        memo: {
          rule: `x\\sqrt{b}+y\\sqrt{b}=(x+y)${R('\\sqrt{b}')}`,
          hook: 'نجمع المعاملات والجذر ثابت',
          example: `3\\sqrt{2}+5\\sqrt{2}=${R('8')}\\sqrt{2}`,
          trap: 'جمع ما تحت الجذر بدل جمع المعاملات',
          exam: 'بسّط كل جذر أولًا ثم اجمع المعاملات',
          chip: `x\\sqrt{b}+y\\sqrt{b}=${R('(x+y)')}\\sqrt{b}`,
          quiz: [
            { q: '$4\\sqrt{3}+2\\sqrt{3}=$', options: ['$6\\sqrt{3}$', '$6\\sqrt{6}$', '$8\\sqrt{3}$'], correct: 0 },
            { q: '$\\sqrt{12}+\\sqrt{27}=$', options: ['$5\\sqrt{3}$', '$\\sqrt{39}$', '$5\\sqrt{6}$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المثال المحلول صارت $A = 2\\sqrt{2} - 9\\sqrt{2} + 10\\sqrt{2} - 7\\sqrt{2}$ ثم $A = -4\\sqrt{2}$. كيف تبسّط مجموعًا من الشكل $x\\sqrt{b} + y\\sqrt{b} + z\\sqrt{b}$؟ اكتب القاعدة بمساواة.',
        summary: '$x\\sqrt{b} + y\\sqrt{b} + z\\sqrt{b} = (x + y + z)\\sqrt{b}$',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.distributive}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{METHOD_SIMPLIFY.solution[1]}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'naqt-maqam', type: 'methodes', title: 'نسبة مقامها عدد ناطق',
        memo: {
          rule: `\\dfrac{a}{\\sqrt{b}}=\\dfrac{a${R('\\times\\sqrt{b}')}}{\\sqrt{b}${R('\\times\\sqrt{b}')}}=\\dfrac{a\\sqrt{b}}{b}`,
          hook: 'اضرب البسط والمقام معًا',
          example: `\\dfrac{6}{\\sqrt{3}}=\\dfrac{6${R('\\sqrt{3}')}}{3}=2\\sqrt{3}`,
          trap: 'الضرب في البسط وحده فتتغيّر قيمة النسبة',
          exam: 'اضرب البسط والمقام في العدد نفسه ثم اختزل',
          chip: `\\tfrac{a}{\\sqrt{b}}=\\tfrac{a${R('\\sqrt{b}')}}{b}`,
          quiz: [
            { q: '$\\dfrac{5}{\\sqrt{5}}=$', options: ['$\\sqrt{5}$', '$5\\sqrt{5}$', '$\\dfrac{1}{\\sqrt{5}}$'], correct: 0 },
            { q: '$\\dfrac{10}{\\sqrt{2}}=$', options: ['$5\\sqrt{2}$', '$10\\sqrt{2}$', '$\\dfrac{\\sqrt{2}}{10}$'], correct: 0 },
          ],
        },
        predictPrompt: 'رأيت أنّ $\\sqrt{11} \\times \\sqrt{11} = 11$، ثم كيف صار $\\dfrac{2}{\\sqrt{11}}$ نسبة مقامها 11. لو أعطيناك نسبة أخرى $\\dfrac{a}{\\sqrt{b}}$، ماذا تفعل بالبسط والمقام لتجعل مقامها عددًا ناطقًا؟ ولماذا لا تتغيّر قيمتها؟',
        summary: 'لتحويل $\\dfrac{a}{\\sqrt{b}}$ إلى نسبة مقامها عدد ناطق، نضرب البسط والمقام في $\\sqrt{b}$.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD_RATIONALIZE.method}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{METHOD_RATIONALIZE.solution[0]}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
