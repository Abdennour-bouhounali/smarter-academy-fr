import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « حصر عدد عشري موجب » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 3 p. 76 et طرائق p. 77,
 * réécrits). Le tadwir à l'unité, l'encadrement entre deux naturels, la division lue sur la calculatrice et la leçon sœur des inégalités sont des prérequis
 * (`priorKnowledge`), mesurés par « أستعدّ », jamais des items ici. 4AM l'emploie sans lien du réseau (racines, trigonométrie, statistique).
 */
const { chain, round, fromRound, quotient } = KNOWLEDGE;

/** `memo` : la fiche de « 🔑 للتذكّر » — ce qui CHANGE en `R(…)` (rouge). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'tadwir', type: 'regles', title: 'المدوّر',
        memo: {
          rule: `d\\ge5\\Rightarrow ${R('\\uparrow')}\\qquad d<5\\Rightarrow ${R('\\downarrow')}`,
          hook: 'الرقم التالي هو الحَكَم',
          example: `6{,}35${R('8')}\\,\\Rightarrow\\,6{,}36`,
          trap: 'التدوير ليس حذف الأرقام الزائدة',
          exam: 'اكتب الرقم الذي يلي الرتبة ثم قرّر الرفع أو الترك',
          chip: `d\\ge5\\Rightarrow ${R('\\uparrow')}`,
          quiz: [
            { q: 'مدوّر $3{,}68$ إلى $0{,}1$ هو:', options: ['$3{,}7$', '$3{,}6$', '$3{,}8$'], correct: 0 },
            { q: 'مدوّر $12{,}49$ إلى الوحدة هو:', options: ['$13$', '$12$', '$12{,}5$'], correct: 1 },
          ],
        },
        predictPrompt: 'اكتب بكلماتك كيف تختار الشاشة العدد الذي تكتبه.',
        summary: 'مدوّر عدد هو أقرب علامتين تحيطان به، وإذا كان في المنتصف تمامًا فالعليا.',
        body: (
          <div className="space-y-2">
            <p><MathText>{round.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{round.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'hasr-min-mudawwar', type: 'regles', title: 'الحصر من المدوّر',
        memo: {
          rule: `r-${R('\\tfrac{u}{2}')}\\le x<r+${R('\\tfrac{u}{2}')}`,
          hook: 'نصف الرتبة من الجهتين',
          example: `3{,}72\\pm0{,}005:\\,3{,}715\\le x<3{,}725`,
          trap: 'الطرف الأيمن غير مشمول: عنده تتغيّر القراءة',
          exam: 'اكتب الطرف الأيسر مشمولًا والطرف الأيمن غير مشمول',
          chip: `r\\pm${R('\\tfrac{u}{2}')}`,
          quiz: [
            { q: 'مدوّر $x$ إلى $0{,}1$ هو $3{,}6$ . إذن:', options: ['$3{,}6\\le x<3{,}7$', '$3{,}55\\le x\\le3{,}65$', '$3{,}55\\le x<3{,}65$'], correct: 2 },
            { q: 'مدوّر $x$ إلى الوحدة هو $9$ . إذن:', options: ['$8\\le x<9$', '$8{,}5\\le x<9{,}5$', '$8{,}5<x\\le9{,}5$'], correct: 1 },
          ],
        },
        predictPrompt: 'قرأت الشاشة عددًا بعد التدوير. ما كلّ الكتل التي تعطي هذه القراءة؟ اكتب أين تبدأ وأين تنتهي، وهل يدخل الطرفان.',
        summary: 'مدوّر x هو r إذا وفقط إذا r − نصف الرتبة ≤ x < r + نصف الرتبة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{fromRound.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{fromRound.example}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.halfOpen}</MathText></p>
          </div>
        ),
      },
      {
        id: 'qimatan-muqarraban', type: 'regles', title: 'القيمتان المقرّبتان',
        memo: {
          rule: `x_{-}\\le x<x_{+}=x_{-}+${R('u')}`,
          hook: 'علامتان متتاليتان حول العدد',
          example: `0{,}285<\\tfrac{2}{7}<0{,}286`,
          trap: 'ما تكتبه الآلة ليس القيمة الدقيقة للحاصل',
          exam: 'اكتب العلامتين المتتاليتين ثم سمِّ قيمتيه المقرّبتين',
          chip: `x_{-}<x<x_{+}`,
          quiz: [
            { q: 'القيمة المقرّبة إلى $0{,}01$ بالزيادة للعدد $6{,}358$ هي:', options: ['$6{,}35$', '$6{,}4$', '$6{,}36$'], correct: 2 },
            { q: 'من $0{,}285<\\frac{2}{7}<0{,}286$ ، القيمة المقرّبة بالنقصان هي:', options: ['$0{,}285$', '$0{,}286$', '$0{,}2857$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيس الفلفل لم يبلغه ميزان. ما اسم العلامة التي تسبقه والعلامة التي تليه؟ اكتب ما تلاحظه.',
        summary: 'العلامة التي تسبق العدد قيمته المقرّبة بالنقصان، والتي تليه قيمته المقرّبة بالزيادة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{chain.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{'مثلًا: $0{,}285<\\frac{2}{7}<0{,}286$ ، بالنقصان $0{,}285$ وبالزيادة $0{,}286$ .'}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'hasr-rutba', type: 'regles', title: 'الحصر إلى رتبة',
        memo: {
          rule: `x_{-}=\\lfloor x\\rfloor_k\\,,\\,x_{+}=x_{-}+${R('10^{-k}')}`,
          hook: 'رتبة أدقّ حصر أضيق',
          example: `6{,}35\\le 6{,}358<6{,}36`,
          trap: 'نضيف وحدة الرتبة وليس وحدة عادية',
          exam: 'اكتب الحصر ثم القيمتين المقرّبتين',
          chip: `x_{+}-x_{-}=${R('10^{-k}')}`,
          quiz: [
            { q: 'حصر $6{,}358$ إلى $0{,}1$ هو:', options: ['$6{,}3\\le x<6{,}31$', '$6{,}35\\le x<6{,}36$', '$6{,}3\\le x<6{,}4$'], correct: 2 },
            { q: 'كلّما انتقلنا إلى رتبة أدقّ فإنّ سعة الحصر:', options: ['تُضرب في عشرة', 'تُقسم على عشرة', 'لا تتغيّر'], correct: 1 },
          ],
        },
        predictPrompt: 'كيف تجد العلامتين اللتين يقع بينهما عدد عشري عند رتبة معيّنة؟ وماذا يحدث للحصر حين تنتقل إلى رتبة أدقّ؟',
        summary: 'نقطع العدد عند الرتبة للعلامة السفلى ونضيف وحدة من الرتبة للعليا؛ وكلّ رتبة أدقّ تضيّق الحصر عشر مرّات.',
        body: (
          <div className="space-y-2">
            <p><MathText>{chain.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{chain.example}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqa-hasr-rutba', type: 'methodes', title: 'أحصر عددًا إلى رتبة وأدوّره',
        memo: {
          rule: `\\lfloor x\\rfloor_k\\le x<\\lfloor x\\rfloor_k+${R('10^{-k}')}`,
          hook: 'اقطع ثم أضف وحدة الرتبة',
          example: `7{,}48\\le 7{,}4826<7{,}49`,
          trap: 'نقرأ الرقم الذي يلي الرتبة مباشرة',
          exam: 'اكتب الحصر ثم مدوّر العدد في كل رتبة',
          chip: `\\lfloor x\\rfloor_k+${R('10^{-k}')}`,
          quiz: [
            { q: 'حصر $7{,}4826$ إلى $0{,}01$ هو:', options: ['$7{,}49\\le x<7{,}50$', '$7{,}4\\le x<7{,}5$', '$7{,}48\\le x<7{,}49$'], correct: 2 },
            { q: 'مدوّر $7{,}4826$ إلى $0{,}001$ هو:', options: ['$7{,}483$', '$7{,}482$', '$7{,}48$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تحصر $7{,}4826$ إلى $0{,}01$ ثم تعيّن مدوّره؟ اكتب طريقتك.',
        summary: 'القطع للعلامة السفلى، وحدة من الرتبة للعليا، والرقم التالي للمدوّر.',
        body: <p><MathText>{METHOD.rank.rule}</MathText></p>,
      },
      {
        id: 'tariqa-hasr-mudawwar', type: 'methodes', title: 'أحصر عددًا علمت مدوّره',
        memo: {
          rule: `r-${R('\\tfrac{u}{2}')}\\le a<r+${R('\\tfrac{u}{2}')}`,
          hook: 'اطرح وأضف نصف الرتبة',
          example: `3{,}72\\pm0{,}005\\Rightarrow 3{,}715\\le a<3{,}725`,
          trap: 'نصف الرتبة ليس الرتبة كلّها',
          exam: 'اكتب الطرف الأيسر مشمولًا ثم الأيمن غير مشمول',
          chip: `r\\pm${R('\\tfrac{u}{2}')}`,
          quiz: [
            { q: 'مدوّر $a$ إلى $0{,}01$ هو $3{,}72$ . أيّ عدد يمكن أن يساوي $a$ ؟', options: ['$3{,}725$', '$3{,}714$', '$3{,}7249$'], correct: 2 },
            { q: 'نصف الرتبة $0{,}01$ هو:', options: ['$0{,}05$', '$0{,}005$', '$0{,}001$'], correct: 1 },
          ],
        },
        predictPrompt: 'مدوّر عدد إلى $0{,}01$ هو $3{,}72$ . كيف تحصره؟ وهل يدخل الطرف الأيمن؟ اكتب طريقتك.',
        summary: 'أطرح نصف الرتبة وأضيفه إلى المدوّر؛ الطرف الأيسر مشمول والأيمن غير مشمول.',
        body: <p><MathText>{METHOD.fromRound.rule}</MathText></p>,
      },
      {
        id: 'tariqa-hasil', type: 'methodes', title: 'أحصر حاصل قسمة وأدوّره',
        memo: {
          rule: `q_{-}=\\lfloor q\\rfloor_k<q<q_{-}+${R('10^{-k}')}`,
          hook: 'اقرأ الشاشة ثم أضف وحدة الرتبة',
          example: `3{,}141<\\tfrac{355}{113}<3{,}142`,
          trap: 'الشاشة لا تعطي الحاصل الدقيق إلا إذا كان عشريًّا',
          exam: 'اكتب العلامتين ثم الرقم التالي ثم المدوّر',
          chip: `q_{-}<q<q_{-}+${R('10^{-k}')}`,
          quiz: [
            { q: 'الآلة تعطي $355\\div113=3.14159292$ . حصر الحاصل إلى $0{,}001$ هو:', options: ['$3{,}14<q<3{,}15$', '$3{,}142<q<3{,}143$', '$3{,}141<q<3{,}142$'], correct: 2 },
            { q: 'مدوّر $3.14159292$ إلى $0{,}01$ هو:', options: ['$3{,}15$', '$3{,}14$', '$3{,}141$'], correct: 1 },
          ],
        },
        predictPrompt: 'قرأت على الآلة الحاسبة حاصل قسمة. كيف تحصره إلى رتبة وتعيّن مدوّره؟ اكتب طريقتك.',
        summary: 'أقرأ الشاشة حتى الرتبة للعلامة السفلى، وأضيف وحدة من الرتبة للعليا، ثم أنظر إلى الرقم التالي.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD.quotient.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{quotient.text}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
