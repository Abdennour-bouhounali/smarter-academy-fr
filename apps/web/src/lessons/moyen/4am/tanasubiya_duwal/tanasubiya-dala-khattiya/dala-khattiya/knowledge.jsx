import MathText from '../../../../../common/components/MathText';
import { ACTIVITY, ACTIVITY_LINES, KNOWLEDGE, IMAGE_METHOD, METHOD, ZERO_NOTE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس 2 « مفهوم وتعيين الدالة الخطية » — SOURCE UNIQUE.
 * Une <KnowledgeBrick id="…"> dans un module et la carte rendent le même objet.
 *
 *   module 1 (نشاط 1)  dala-nashat — « نقول أنّنا عرّفنا دالة … » et « نسمي دالة f من الشكل f(x) = ax
 *                      … دالة خطية معاملها a » : la remise f(x) = 0,8x ;
 *   module 2 (معارف)   dala-khattiya (معارف 1), hisab-sura (la صورة, معارف 1 + un exemple),
 *                      jadwal-khattiya (معارف 2), tayin-dala (طرائق, et la condition m ≠ 0).
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'dala-nashat', type: 'concepts', title: 'دالة التخفيض',
        memo: {
          rule: `f(x)=${R('a')}x`,
          hook: 'كل سعر يُضرب في العدد نفسه',
          example: `f(x)=${R('0{,}8')}x\\;\\Rightarrow\\;f(50)=40`,
          trap: 'التخفيض ليس مبلغًا نطرحه بل عددًا نضرب فيه',
          exam: 'اكتب العبارة بالشكل المعطى ثم عيّن المعامل',
          chip: `f(x)=${R('a')}x`,
          quiz: [
            { q: 'تخفيض $20\\%$ على سعر $x$ يعطي السعر الجديد:', options: ['$0{,}8x$', '$x-20$', '$0{,}2x$'], correct: 0 },
            { q: 'الدالة $f(x)=3x$ معاملها:', options: ['$3$', '$x$', '$\\frac{1}{3}$'], correct: 0 },
          ],
        },
        predictPrompt: 'آلة التخفيض أخرجت 40 للسعر 50 و 96 للسعر 120، وعبارتها $f(x) = 0{,}8x$. لو غيّر التاجر نسبة التخفيض، ماذا يبقى من شكل هذه العبارة وماذا يتغيّر؟ اكتب بكلماتك ما يميّز هذا النوع من الدوال.',
        summary: 'الدالة f ترفق بكل سعر x قبل التخفيض السعر بعده f(x) = 0,8x؛ ونسمّي كل دالة من الشكل f(x) = ax، حيث a عدد معلوم، دالة خطية معاملها a.',
        body: (
          <div className="space-y-2">
            <p><MathText>{ACTIVITY.naming}</MathText></p>
            <p><MathText>{ACTIVITY_LINES.formula}</MathText></p>
            <p className="font-semibold"><MathText>{ACTIVITY.closing}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'dala-khattiya', type: 'concepts', title: 'الدالة الخطية',
        memo: {
          rule: `f:x\\longmapsto ${R('a')}x`,
          hook: 'ضرب في عدد ثابت لا غير',
          example: `f:x\\longmapsto ${R('80')}x`,
          trap: 'العبارة التي فيها جمع أو أُسّ ليست خطية',
          exam: 'اكتب أنّ الدالة خطية لأنها من الشكل المعروف',
          chip: `f(x)=${R('a')}x`,
          quiz: [
            { q: 'أيّ الدوال التالية خطية؟', options: ['$x\\longmapsto 5x$', '$x\\longmapsto 5x+1$', '$x\\longmapsto x^2$'], correct: 0 },
            { q: 'معامل الدالة $f:x\\longmapsto -3x$ هو:', options: ['$-3$', '$3$', '$x$'], correct: 0 },
          ],
        },
        // « أتوقّع القاعدة » : non. La définition reprend dala-nashat (module 1, rappelée juste au-dessus
        // de la brique) et l'encadré معارف 1 la pose juste avant ; ce qu'elle ajoute est la NOTATION
        // (f : x ⟼ ax, le mot صورة) — une convention : une prédiction ne ferait que recopier.
        predict: false,
        summary: 'a عدد معطى: الدالة الخطية f التي معاملها a ترفق بكل عدد x الجداء ax، ونكتب f(x) = ax ونرمز لها بـ f : x ⟼ ax.',
        body: (
          <div className="space-y-1.5">
            {KNOWLEDGE.linear.definition.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            {KNOWLEDGE.linear.examples.map((l) => <p key={l} className="text-sm text-slate-600"><MathText>{l}</MathText></p>)}
          </div>
        ),
      },
      {
        id: 'hisab-sura', type: 'methodes', title: 'صورة عدد',
        memo: {
          rule: `f(m)=${R('a')}\\times m`,
          hook: 'الصورة جداء المعامل في العدد',
          example: `f(x)=0{,}8x\\;\\Rightarrow\\;f(120)=0{,}8\\times${R('120')}=96`,
          trap: 'لا تجمع المعامل مع العدد ولا تقسم عليه',
          exam: 'اكتب الصورة جداءً ثم عوّض ثم احسب',
          chip: `f(m)=a\\times ${R('m')}`,
          quiz: [
            { q: 'إذا كان $f(x)=0{,}8x$ فصورة $120$ هي:', options: ['$96$', '$120{,}8$', '$150$'], correct: 0 },
            { q: 'إذا كان $f(x)=-3x$ فإنّ $f(2)=$', options: ['$-6$', '$6$', '$-1$'], correct: 0 },
          ],
        },
        // « أتوقّع القاعدة » : non. « العدد a × x يسمى صورة x » vient d'être lu dans l'encadré معارف 1
        // (étape 2 du module 2) et la brique le cite ; f(120) = 0,8 × 120 a été calculé au module 1.
        predict: false,
        summary: 'صورة العدد m بالدالة الخطية التي معاملها a هي الجداء a × m.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{IMAGE_METHOD.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{IMAGE_METHOD.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'jadwal-khattiya', type: 'regles', title: 'الدالة الخطية والتناسبية',
        memo: {
          rule: `\\dfrac{f(x)}{x}=${R('a')}`,
          hook: 'الجدول الخطي تناسبي ومعامله هو معامل الدالة',
          example: `\\dfrac{40}{50}=\\dfrac{80}{100}=${R('0{,}8')}`,
          trap: 'الفرق الثابت بين العمودين لا يعني أنّ الدالة خطية',
          exam: 'احسب حاصل القسمة في كل عمود ثم استنتج المعامل',
          chip: `\\tfrac{f(x)}{x}=${R('a')}`,
          quiz: [
            { q: 'جدول قيم الدالة $f(x)=4x$ عند $1, 2, 3$. السطر الثاني:', options: ['$4, 8, 12$', '$5, 6, 7$', '$3, 4, 5$'], correct: 0 },
            { q: 'جدول قيم دالة خطية هو دائمًا جدول:', options: ['تناسبية', 'فرقه ثابت', 'مجموعه ثابت'], correct: 0 },
          ],
        },
        summary: 'جدول قيم دالة خطية جدول تناسبية، ومعامل الدالة الخطية هو معامل التناسبية لهذا الجدول.',
        body: (
          <div className="space-y-1.5">
            {KNOWLEDGE.table.definition.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
          </div>
        ),
      },
      {
        id: 'tayin-dala', type: 'methodes', title: 'تعيين دالة خطية من عدد وصورته',
        memo: {
          rule: `a=\\dfrac{${R('n')}}{${R('m')}}\\qquad(m\\neq 0)`,
          hook: 'المعامل هو الصورة مقسومة على العدد',
          example: `g(-2)=6\\;\\Rightarrow\\;a=\\dfrac{6}{${R('-2')}}=-3`,
          trap: 'لا نعيّن المعامل من العدد صفر أبدًا',
          exam: 'اكتب المعادلة ثم حلّها ثم اكتب عبارة الدالة',
          chip: `a=\\tfrac{${R('n')}}{${R('m')}}`,
          quiz: [
            { q: 'دالة خطية $g$ حيث $g(4)=10$. معاملها:', options: ['$\\frac{5}{2}$', '$\\frac{2}{5}$', '$14$'], correct: 0 },
            { q: 'دالة خطية $g$ حيث $g(-2)=6$. معاملها:', options: ['$-3$', '$3$', '$-12$'], correct: 0 },
          ],
        },
        predictPrompt: 'في آلة التخفيض وجدت المعامل $0{,}8$ من سعر واحد وصورته (50 يصبح 40). لو علمت فقط أنّ دالة خطية $g$ تحقّق $g(-2) = 6$ ، كيف تجد معاملها؟ اكتب الطريقة: أيّ معادلة تحلّ وما مجهولها؟ وهل تكفي معرفة صورة العدد $0$ ؟',
        summary: 'لتعيين دالة خطية g علمًا أنّ g(m) = n، حيث m عدد غير معدوم، نحل المعادلة am = n ذات المجهول a.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{METHOD.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{ZERO_NOTE.text}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
