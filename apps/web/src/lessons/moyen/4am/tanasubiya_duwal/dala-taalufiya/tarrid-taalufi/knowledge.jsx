import MathText from '../../../../../common/components/MathText';
import { MODEL_RULE, IMAGE_RULE, EQUAL_RULE, CHEAPER_RULE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس 5 « حل مشكلات وترييض وضعيات بتوظيف الدالة التآلفية » — SOURCE UNIQUE.
 * Le manuel n'a ni معارف ni طرائق pour ce sujet : chaque texte est une formulation de la PLATEFORME
 * (`addition('knowledge_formalization')`, content/textbook.js), dans le vocabulaire du manuel, bâtie sur
 * نشاط 4 (p. 79).
 *
 *   module 1  namdhaja-taalufiya   coût = partie fixe b (une fois) + a par unité : f(x) = ax + b, دالة تآلفية
 *             sura-fi-wadiya       le coût de x unités = une image ; les unités pour un budget = l'antécédent
 *   module 2  tasawi-taqatu        coûts égaux ⇔ f(x) = g(x) ⇔ abscisse du point d'intersection
 *             sigha-afdal          la moins chère : f(x) < g(x), la droite du dessous ; elle dépend de x
 *   module 3  khutuwat-mufadala    les étapes : variable, coûts, résoudre / comparer, lire, répondre
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'namdhaja-taalufiya', type: 'concepts', title: 'تكلفة بجزء ثابت وجزء متغير: دالة تآلفية',
        memo: {
          rule: `f(x)=${R('a')}x+${R('b')}`,
          hook: 'ثابت مرّة وثمن الوحدة مرّات',
          example: `f(7)=${R('200')}\\times 7+${R('2000')}=3400`,
          trap: 'ضرب الجزء الثابت في عدد الوحدات',
          exam: 'اكتب الدالة التآلفية للتكلفة',
          chip: `${R('a')}x+${R('b')}`,
          quiz: [
            { q: 'اشتراك $500$ يُدفع مرّة واحدة و $50$ عن كل حصة. التكلفة بعد $x$ حصة:', options: ['$50x + 500$', '$500x + 50$', '$550x$'], correct: 0 },
            { q: '$f(x) = 120x + 800$ . التكلفة بعد $5$ حصص:', options: ['$1400$', '$4120$', '$920$'], correct: 0 },
          ],
        },
        predictPrompt: 'في فاتورة المناصر وضعتَ 2000 دج في خانة و 200 دج في خانة أخرى، ثم حرّكت عدد المقابلات $x$ . لو كانت تكلفة أخرى فيها مبلغ يُدفع مرّة واحدة ومبلغ يُدفع عن كل وحدة، كيف تكتب تكلفة $x$ وحدة؟ وأيّ نوع من الدوال تحصل عليه؟ اكتب القاعدة بكلماتك.',
        summary: 'عندما تتكوّن تكلفة من جزء ثابت b يُدفع مرّة واحدة وثمن a يُدفع عن كل وحدة، فإن تكلفة x وحدة هي ax + b: دالة تآلفية.',
        body: <p><MathText>{MODEL_RULE.text}</MathText></p>,
      },
      {
        id: 'sura-fi-wadiya', type: 'methodes', title: 'مبلغ عدد معلوم، وعدد الوحدات لمبلغ معلوم',
        memo: {
          rule: `f(${R('x_0')})=${R('y_0')}`,
          hook: 'الصورة للمبلغ والمعادلة للعدد',
          example: `f(${R('7')})=3400\\;;\\;f(${R('14')})=4800`,
          trap: 'عكس الصورة والعدد الذي صورته معلومة',
          exam: 'حلّ المعادلة لإيجاد عدد الوحدات',
          chip: `f(x)=y`,
          quiz: [
            { q: '$f(x) = 200x + 2000$ . عدد الوحدات التي مبلغها $3000$ :', options: ['$5$', '$15$', '$1000$'], correct: 0 },
            { q: '$f(x) = 200x + 2000$ . المبلغ لـ $10$ وحدات:', options: ['$4000$', '$2200$', '$22000$'], correct: 0 },
          ],
        },
        predictPrompt: 'أجبتَ عن سؤالين: كم يدفع المناصر لـ 7 مقابلات، وكم مقابلة تابع من دفع 4800 دج. بلغة الدالة $f$ ، ماذا حسبتَ في كل سؤال؟ وكيف تجد عدد الوحدات عندما يُعطى المبلغ؟ اكتب الطريقة.',
        summary: 'مبلغ عدد معلوم من الوحدات هو صورته، وعدد الوحدات لمبلغ معلوم هو العدد الذي صورته هذا المبلغ: نجده بحلّ معادلة.',
        body: <p><MathText>{IMAGE_RULE.text}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'tasawi-taqatu', type: 'regles', title: 'تساوي تكلفتين: معادلة ونقطة تقاطع',
        memo: {
          rule: `f(x)=g(x)\\Rightarrow x=${R('x_0')}`,
          hook: 'التساوي معادلة ونقطة تقاطع',
          example: `200x+2000=400x\\Rightarrow x=${R('10')}`,
          trap: 'مقارنة الجزأين الثابتين وحدهما',
          exam: 'اكتب المعادلة ثم حلّها',
          chip: `f(x)=g(x)`,
          quiz: [
            { q: '$150x + 1200 = 350x$ . عدد الحصص التي تتساوى عندها التكلفتان:', options: ['$6$', '$8$', '$2{,}4$'], correct: 0 },
            { q: 'فاصلة نقطة تقاطع تمثيلي $f$ و $g$ هي:', options: ['حلّ المعادلة $f(x) = g(x)$', 'حلّ المتراجحة $f(x) < g(x)$', 'العدد $f(0)$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المختبر وضعتَ علامة على التمثيل البياني، ثم وجدتَ بالحساب أنّ الاشتراك والتذكرة يكلّفان المبلغ نفسه من أجل 10 مقابلات. لو أعطيناك صيغتين أخريين $f$ و $g$ ، بأيّ حساب تجد عدد الوحدات الذي تتساوى عنده التكلفتان؟ وأين تراه على التمثيل البياني؟ اكتب القاعدة.',
        summary: 'تتساوى تكلفتا صيغتين عندما تتساوى صورتا x بالدالتين: حلّ هذه المعادلة هو فاصلة نقطة تقاطع المستقيمين.',
        body: <p><MathText>{EQUAL_RULE.text}</MathText></p>,
      },
      {
        id: 'sigha-afdal', type: 'regles', title: 'الصيغة الأرخص: متراجحة ومستقيم تحت الآخر',
        memo: {
          rule: `f(x)<g(x)\\Leftrightarrow x>${R('x_0')}`,
          hook: 'الأرخص هو المستقيم الأسفل',
          example: `200x+2000<400x\\Leftrightarrow x>${R('10')}`,
          trap: 'ظنّ أنّ الصيغة نفسها أرخص دائمًا',
          exam: 'اذكر الصيغة الأرخص قبل التقاطع وبعده',
          chip: `f(x)<g(x)`,
          quiz: [
            { q: '$f(x) = 200x + 2000$ و $g(x) = 400x$ . من أجل $x = 15$ الأرخص هي:', options: ['$f$', '$g$', 'تتساويان'], correct: 0 },
            { q: 'حلول المتراجحة $200x + 2000 < 400x$ :', options: ['$x > 10$', '$x < 10$', '$x > 2000$'], correct: 0 },
          ],
        },
        predictPrompt: 'من أجل 6 مقابلات كانت التذكرة أرخص، ومن أجل 15 مقابلة كان الاشتراك أرخص، ولوّنتَ محور الفواصل في المختبر. كيف تعرف، بالحساب وعلى التمثيل البياني، أيّ الصيغتين $f$ و $g$ أرخص من أجل عدد $x$ ؟ وهل الجواب نفسه لكل $x$ ؟ اكتب القاعدة.',
        summary: 'تكون صيغة أرخص من أخرى عندما تكون صورة x بدالتها أصغر: نحلّ متراجحة، وبيانيا مستقيمها تحت الآخر. الصيغة الأفضل تتعلّق بقيمة x.',
        body: <p><MathText>{CHEAPER_RULE.text}</MathText></p>,
      },
    ],
    3: [
      {
        id: 'khutuwat-mufadala', type: 'methodes', title: 'خطوات الترييض والمفاضلة بين صيغتين',
        memo: {
          rule: `f(x)=g(x)\\;\\to\\;f(x)<g(x)`,
          hook: 'المتغير فالدوال فالمعادلة فالمتراجحة فالجواب',
          example: `200x+2000=400x\\;\\to\\;x=${R('10')}`,
          trap: 'نسيان كتابة الجواب بجملة',
          exam: 'أجب بجملة في سياق الوضعية',
          chip: `f(x)=g(x)`,
          quiz: [
            { q: 'أول خطوة في المفاضلة بين صيغتين:', options: ['اختيار المتغيّر وكتابة تكلفة كل صيغة', 'حلّ المتراجحة مباشرة', 'كتابة الجواب'], correct: 0 },
            { q: 'بعد حلّ المعادلة والمتراجحة نختم بـ:', options: ['جملة تجيب عن السؤال في سياق الوضعية', 'رسم المستقيمين فقط', 'حلّ المعادلة مرّة ثانية'], correct: 0 },
          ],
        },
        predictPrompt: 'قرأتَ حلّ أمين لباقتي الأنترنت في خمسة أسطر. لو عُرضت عليك صيغتان أخريان (كراء، اشتراك، باقة…)، بأيّ خطوات تختار الأفضل منهما؟ اكتب الطريقة بكلماتك، خطوة بعد خطوة، دون أرقام هذا المثال.',
        summary: 'نختار المتغير، نعبّر عن كل تكلفة بدالة تآلفية، نحلّ معادلة التساوي ثم المتراجحة، نقرأ على التمثيل البياني، ونجيب بجملة في سياق الوضعية.',
        body: (
          <div className="space-y-1">
            <p className="font-bold"><MathText>{METHOD.rule[0]}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
