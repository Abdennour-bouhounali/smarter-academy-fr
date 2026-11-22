import MathText from '../../../../../common/components/MathText';
import { ACTIVITY, KNOWLEDGE, METHOD_COMMON_FACTOR, METHOD_IDENTITIES } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس 3 « تحليل عبارة جبرية » — SOURCE UNIQUE, construite
 * à partir du manuel (content/textbook.js). Une <KnowledgeBrick id="…"> dans
 * un module et la carte rendent le même objet.
 *
 *   module 1 (نشاط 3)  tahlil-taarif — l'encadré « عندما نكتب عبارة مجموع على
 *                      شكل جداء … », posé après la question 2 ;
 *   module 2 (معارف 3) khassiya-tawziiya — la propriété (CORRIGÉE) ;
 *                      tahlil-mutatabiqat — les trois متطابقات lues à l'envers ;
 *   module 3 (طرائق)   tariqat-amil-mushtarak, tariqat-mutatabiqat — les deux
 *                      encadrés « طريقة » des pp. 35 et 36.
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'tahlil-taarif', type: 'concepts', title: 'تحليل عبارة',
        memo: {
          rule: `ka+kb\\ \\to\\ ${R('k(a+b)')}`,
          hook: 'من مجموع إلى جداء',
          example: `8x+6=${R('2(4x+3)')}`,
          trap: 'الخلط بين التحليل والنشر: كل منهما عكس الآخر',
          exam: 'أكتب العبارة على شكل جداء ثم أنشرها للتأكّد',
          chip: `ka+kb\\to k(a+b)`,
          quiz: [
            { q: 'تحليل عبارة يعني:', options: ['كتابتها على شكل مجموع', 'كتابتها على شكل جداء', 'حساب قيمتها'], correct: 1 },
            { q: 'أيّ كتابة هي تحليل $4x+14$؟', options: ['$4(x+14)$', '$14(4x+1)$', '$2(2x+7)$'], correct: 2 },
          ],
        },
        predictPrompt: 'انطلقت من $(x - 1) + (x - 1)^2$ فوصلت إلى $x(x - 1)$ ، وفعلت مثل ذلك بالعبارتين الأخريين. بأيّ شكل كانت كل عبارة في البداية، وبأيّ شكل صارت في النهاية؟ اكتب بكلماتك ما الذي فعلته بالعبارات الثلاث.',
        summary: 'تحليل عبارة مجموع هو كتابتها على شكل جداء.',
        body: (
          <div className="space-y-2">
            <p><MathText>{ACTIVITY.closing}</MathText></p>
            <p><MathText>{KNOWLEDGE.definition}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{ACTIVITY.figure}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'khassiya-tawziiya', type: 'regles', title: 'استخراج عامل مشترك',
        memo: {
          rule: `ka+kb=${R('k')}(a+b)`,
          hook: 'العامل المشترك يخرج من القوس',
          example: `6x^2+4x=${R('2x')}(3x+2)`,
          trap: 'نسيان الواحد: قسمة الحدّ على نفسه تعطي واحدًا لا صفرًا',
          exam: 'أحدّد العامل المشترك الأكبر ثم أقسم كل حدّ عليه ثم أنشر للتحقّق',
          chip: `ka+kb=k(a+b)`,
          quiz: [
            { q: '$8x+6=$', options: ['$2(4x)$', '$2(4x+3)$', '$2(4x+6)$'], correct: 1 },
            { q: '$6x^2+4x=$', options: ['$2x(3x+4)$', '$2x(3x+2)$', '$2x(3x-2)$'], correct: 1 },
          ],
        },
        predictPrompt: 'في كرّاس إيمان: $3{,}5 \\times 1{,}7 + 3{,}5 \\times 0{,}3 = 3{,}5 \\times (1{,}7 + 0{,}3)$، وفي المثال: $6x^2 + 4x = 2x(3x + 2)$. اكتبها بالحروف: إذا تكرّر $k$ في الحدّين $ka$ و $kb$، كيف تكتب $ka + kb$ على شكل جداء؟ وكيف تكتب $ka - kb$؟',
        summary: 'الخاصية التوزيعية مقروءة من المجموع إلى الجداء: $ka + kb = k(a + b)$ و $ka - kb = k(a - b)$.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.distributive}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.examples[0]}</MathText></p>
          </div>
        ),
      },
      {
        id: 'tahlil-mutatabiqat', type: 'regles', title: 'التحليل بالمتطابقات الشهيرة',
        memo: {
          rule: `a^2+2ab+b^2=${R('(a+b)^2')}`,
          hook: 'اقرأ المتطابقة بالعكس',
          example: `x^2+6x+9=${R('(x+3)^2')}`,
          trap: 'تحليل مجموع مربّعين كأنّه مربّع مجموع',
          exam: 'أتعرّف على الشكل ثم أعيّن الحدّين ثم أكتب الجداء',
          chip: `a^2-b^2=(a+b)(a-b)`,
          quiz: [
            { q: '$x^2-4x+4=$', options: ['$(x+2)^2$', '$(x-2)^2$', '$(x-4)^2$'], correct: 1 },
            { q: '$x^2-16=$', options: ['$(x-4)^2$', '$(x-8)(x+8)$', '$(x-4)(x+4)$'], correct: 2 },
          ],
        },
        predictPrompt: 'في النشاط أغلقت الملعب المربّع $x^2 + 6x + 9 = (x + 3)^2$، وكتبت $x^2 - 4x + 4 = (x - 2)^2$ و $x^2 - 16 = (x - 4)(x + 4)$. اكتب الحالات الثلاث بالحرفين $a$ و $b$: كيف تكتب $a^2 + 2ab + b^2$ ، $a^2 - 2ab + b^2$ و $a^2 - b^2$ على شكل جداء؟',
        summary: '$a^2 + 2ab + b^2 = (a + b)^2$ ، $a^2 - 2ab + b^2 = (a - b)^2$ ، $a^2 - b^2 = (a + b)(a - b)$',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.identities}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.examples[2]}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqat-amil-mushtarak', type: 'methodes', title: 'طريقة: عامل مشترك',
        memo: {
          rule: `\\begin{aligned}k&=\\gcd(ka,kb)\\\\ka+kb&=${R('k')}(a+b)\\end{aligned}`,
          hook: 'اقسم كل حدّ على العامل',
          example: `7x^2-21x=${R('7x')}(x-3)`,
          trap: 'أخذ عامل مشترك غير الأكبر أو نسيان الإشارة',
          exam: 'أنشر الجواب فأعود إلى العبارة الأصلية',
          chip: `ka+kb=k(a+b)`,
          quiz: [
            { q: '$7x^2-21x=$', options: ['$7(x^2-3x)$', '$7x(x-21)$', '$7x(x-3)$'], correct: 2 },
            { q: '$(x-2)(x+4)-3(x-2)=$', options: ['$(x-2)(x+7)$', '$(x-2)(x+1)$', '$(x-2)(x-1)$'], correct: 1 },
          ],
        },
        predictPrompt: 'في الحلول الثلاثة ($A$ و $B$ و $C$) مرّ الحلّ بالخطوتين نفسيهما قبل أن يصل إلى الجداء. لو أعطيناك عبارة أخرى، مثل $7x^2 - 21x$، بماذا تبدأ ثم ماذا تفعل؟ اكتب الطريقة بكلماتك.',
        summary: 'نحدّد العامل المشترك $k$ بين الحدود ثم نطبق الخاصية التوزيعية $k \\times a + k \\times b = k \\times (a + b)$.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD_COMMON_FACTOR.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{METHOD_COMMON_FACTOR.solution[1]}</MathText></p>
          </div>
        ),
      },
      {
        id: 'tariqat-mutatabiqat', type: 'methodes', title: 'طريقة: متطابقة شهيرة',
        memo: {
          rule: `a^2\\pm2ab+b^2=${R('(a\\pm b)^2')}`,
          hook: 'تعرّف على الشكل ثم عيّن',
          example: `49x^2-14x+1=(${R('7x')}-1)^2`,
          trap: 'نسيان أنّ الحدّ الأوسط يجب أن يساوي ضعف الجداء',
          exam: 'أتحقّق بنشر الجواب',
          chip: `a^2-b^2=(a-b)(a+b)`,
          quiz: [
            { q: '$x^2-12x+36=$', options: ['$(x+6)^2$', '$(x-6)^2$', '$(x-12)^2$'], correct: 1 },
            { q: '$49x^2-14x+1=$', options: ['$(49x-1)^2$', '$(7x+1)^2$', '$(7x-1)^2$'], correct: 2 },
          ],
        },
        predictPrompt: 'في الحلول الثلاثة ($25 + 10x + x^2$ ، $49x^2 - 14x + 1$ ، $(4x - 1)^2 - (x - 4)^2$) تكرّر العمل نفسه. لو أعطيناك عبارة جديدة مثل $x^2 - 12x + 36$، ماذا تفعل أولًا، ثم ماذا، حتى تكتبها على شكل جداء؟ اكتب الطريقة في خطوات.',
        summary: 'نتعرّف على نوع المتطابقة (مربع مجموع، مربع فرق، جداء مجموع حدين وفرقهما)، نعيّن الحدين ثم نستعمل تحليلها.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD_IDENTITIES.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{METHOD_IDENTITIES.solution[0]}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
