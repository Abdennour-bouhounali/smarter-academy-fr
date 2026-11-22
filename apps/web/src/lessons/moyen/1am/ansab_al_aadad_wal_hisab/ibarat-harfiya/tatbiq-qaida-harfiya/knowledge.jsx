import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD_APPLY } from './content/textbook';

// La carte progressive de la leçon — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « تطبيق قاعدة حرفية » (1AM) — SOURCE UNIQUE (content/textbook.js : les mots de la plateforme, tirés de نشاط 2 et 4, des deux معارف de la p. 81 et de la page ICT du manuel ;
 * rien n'est copié au mot).
 */
/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'qaida-tatbiq', type: 'concepts', title: 'تطبيق قاعدة حرفية',
        memo: {
          rule: `5\\times ${R('12')}+20`,
          hook: 'القيمة تحلّ محلّ الحرف ثمّ أحسب',
          example: `2\\times(15+8)=46`,
          trap: 'لا أكتب العددين متجاورين : الناتج $60$ لا $512$',
          exam: 'اكتب القاعدة، ضع القيمة مكان كلّ حرف، ثمّ احسب بالأولويات',
          chip: `5\\times 12+20`,
          quiz: [
            { q: 'من أجل $n=7$ قيمة $4\\times n+3$ :', options: ['$31$', '$73$', '$14$'], correct: 0 },
            { q: 'عند التعويض نضع القيمة :', options: ['مكان الحرف', 'بجانب الحرف', 'مكان الإشارة'], correct: 0 },
          ],
        },
        predictPrompt: 'أدرتَ القرص على 12 ورقة. ماذا حلّ محلّ الحرف n على البطاقة؟ وماذا حسبت البطاقة بعد ذلك؟ ولماذا لم نجد 512؟ اكتب ما لاحظتَه.',
        summary: 'لنطبّق قاعدة حرفية نضع قيمة الحرف مكانه، ثمّ نحسب بالأولويات : 5 × n + 20 من أجل n = 12 هي 5 × 12 + 20 = 60 + 20 = 80.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.apply.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'kull-mawdi', type: 'regles', title: 'القيمة في كلّ موضع',
        memo: {
          rule: `5\\times ${R('10')}+20-${R('10')}`,
          hook: 'الحرف المكتوب مرّتين يأخذ قيمته مرّتين',
          example: `5\\times 10+20-10=60`,
          trap: 'لا أضع القيمة في الموضع الأوّل فقط',
          exam: 'عُدّ مرّات ظهور الحرف ثمّ ضع القيمة في كلّ مرّة',
          chip: `5n+20-n`,
          quiz: [
            { q: 'في $3\\times x+x$ من أجل $x=4$ نجد :', options: ['$3\\times 4+4=16$', '$3\\times 4+x=12+x$', '$3\\times 4=12$'], correct: 0 },
            { q: 'الحرف المكتوب مرّتين :', options: ['نضع قيمته في الموضعين', 'نضع قيمته في الأوّل فقط', 'لا نعوّضه'], correct: 0 },
          ],
        },
        predictPrompt: 'في القاعدة 5 × n + 20 − n كتب الحرف n مرّتين. أين نزل العدد 10 حين أدرتَ القرص؟ وماذا حدث لو بقي الحرف في الموضع الثاني؟ اكتب ما لاحظتَه.',
        summary: 'نضع قيمة الحرف في كلّ موضع يظهر فيه : في 5 × n + 20 − n من أجل n = 10 نجد 5 × 10 + 20 − 10 = 60.',
        body: (
          <div className="space-y-2">
            <p><MathText>{'نضع القيمة في كلّ موضع يظهر فيه الحرف: $5\\times n+20-n$ من أجل $n=10$ تصير $5\\times 10+20-10=60$ .'}</MathText></p>
          </div>
        ),
      },
      {
        id: 'awlawiya-qaida', type: 'regles', title: 'الأقواس والأولويات',
        memo: {
          rule: `2\\times(${R('a+b')})`,
          hook: 'ما بين القوسين أوّلًا ثمّ الضرب ثمّ الجمع والطرح',
          example: `2\\times(15+8)=2\\times 23=46`,
          trap: 'لا أحسب $2\\times 15+8=38$ : القوسان أوّلًا',
          exam: 'احسب ما بين القوسين ثمّ اضرب ثمّ اجمع أو اطرح',
          chip: `2\\times(15+8)`,
          quiz: [
            { q: '$2\\times(3+4)$ تساوي :', options: ['$14$', '$10$', '$24$'], correct: 0 },
            { q: 'أوّل ما نحسبه في $5-2\\times 3$ :', options: ['$2\\times 3$', '$5-2$', 'كلّ شيء معًا'], correct: 0 },
          ],
        },
        predictPrompt: 'في القاعدة P = 2 × (a + b) أدرتَ a على 15 و b على 8. ماذا حسبت البطاقة أوّلًا؟ وماذا نجد لو بدأنا بالضرب في 2 ؟ اكتب ما لاحظتَه.',
        summary: 'نحسب ما بين القوسين أوّلًا ثمّ الضرب ثمّ الجمع والطرح : 2 × (15 + 8) = 2 × 23 = 46 ، وليس 2 × 15 + 8 = 38.',
        body: (
          <div className="space-y-2">
            <p><MathText>{'من أجل $a=15$ و $b=8$ في $P=2\\times(a+b)$ نحسب ما بين القوسين أوّلًا: $15+8=23$ ثمّ $2\\times 23=46$ . وتبقى القيمة نفسها إذا بدّلنا $a$ و $b$ لأنّ $8+15=15+8$ .'}</MathText></p>
          </div>
        ),
      },
      {
        id: 'mithal-mudad', type: 'regles', title: 'المثال المضادّ',
        memo: {
          rule: `3+4=7\\neq ${R('3\\times 4=12')}`,
          hook: 'قيمتان واحدة تختلف عندهما الجهتان تُسقط القاعدة',
          example: `n=0:\\ 2\\times 0\\not>0`,
          trap: 'الأمثلة التي تصحّ فيها القاعدة لا تثبت صحّتها : $2+2=2\\times 2$',
          exam: 'ابحث عن قيمة واحدة تختلف عندها الجهتان : هذا مثال مضادّ',
          chip: `3+4\\neq 3\\times 4`,
          quiz: [
            { q: 'لإسقاط قاعدة عامة يكفي :', options: ['مثال مضادّ واحد', 'عشرة أمثلة صحيحة', 'مثال صحيح'], correct: 0 },
            { q: 'صحّت القاعدة من أجل $2$ و $2$ . هي :', options: ['غير مثبتة صحّتها', 'صحيحة دائمًا', 'خاطئة دائمًا'], correct: 0 },
          ],
        },
        predictPrompt: 'صحّت القاعدة a + b = a × b من أجل 2 و 2 ثمّ سقطت من أجل قيمتين أخريين. كم قيمة كانت كافية لإسقاطها؟ وهل أنقذتها القيمة 2 و 2 ؟ اكتب ما لاحظتَه.',
        summary: 'لنبيّن أنّ قاعدة ليست صحيحة دائمًا يكفي مثال مضادّ واحد تختلف عنده الجهتان : 3 + 4 = 7 بينما 3 × 4 = 12 ؛ أمّا الأمثلة التي تصحّ فيها القاعدة فلا تثبت صحّتها.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.counter.text}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'ibara-harfiya', type: 'concepts', title: 'العبارة الحرفية والاصطلاح',
        memo: {
          rule: `2\\times x=2x\\ ;\\ a\\times b=ab`,
          hook: 'الإشارة × تُحذف بين عدد وحرف وبين حرفين',
          example: `x=3:\\ 2x=2\\times 3=6`,
          trap: 'لا أقرأ $2x$ من أجل $x=3$ العدد $23$',
          exam: 'أعد إشارة الضرب عند التعويض ثمّ احسب',
          chip: `2x=2\\times x`,
          quiz: [
            { q: '$2x$ من أجل $x=3$ :', options: ['$6$', '$23$', '$5$'], correct: 0 },
            { q: 'نحذف إشارة الضرب في :', options: ['$3\\times a$', '$3\\times 4$', 'الحالتين'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف نكتب 2 × x بحذف إشارة الضرب؟ وماذا نقرأ حين نضع 3 مكان x ؟ ولماذا لا نحذف الإشارة في 2 × 3 ؟ اكتب ما تعرفه.',
        summary: 'العبارة الحرفية عبارة فيها حروف ترمز إلى أعداد ؛ نحذف إشارة الضرب بين عدد وحرف وبين حرفين (2x ، ab ، 3(x+2)) ولا نحذفها بين عددين : 2 × 3 = 6 لا 23.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.expr.definition}</MathText></p>
            <p><MathText>{KNOWLEDGE.conv.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.convNum.text}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqa-tatbiq', type: 'methodes', title: 'أطبّق قاعدة',
        memo: {
          rule: `3\\times(${R('4')}+2)-${R('5')}`,
          hook: 'أكتب ، أضع القيم ، أحسب ، أجيب',
          example: `3\\times 6-5=18-5=13`,
          trap: 'لا أنسى أنّ القوسين يُحسبان أوّلًا',
          exam: 'اكتب العبارة بالقيم ثمّ الأقواس ثمّ الضرب ثمّ الجمع أو الطرح ثمّ الجواب',
          chip: `3(x+2)-y`,
          quiz: [
            { q: 'الخطوة الأولى في الطريقة :', options: ['أضع القيم مكان الحروف', 'أحسب الطرح', 'أحذف الأقواس'], correct: 0 },
            { q: '$3\\times(4+2)-5$ تساوي :', options: ['$13$', '$17$', '$7$'], correct: 0 },
          ],
        },
        predictPrompt: 'لتحسب قيمة 3 × (x + 2) − y من أجل x = 4 و y = 5 : بماذا بدأتَ؟ وما الذي حسبته أوّلًا؟ وكيف جاء الجواب؟ اكتب الطريقة.',
        summary: 'أكتب العبارة بالقيم في كلّ موضع، أحسب بالأولويات (الأقواس، الضرب، الجمع والطرح) ثمّ أجيب : 3 × (4 + 2) − 5 = 3 × 6 − 5 = 18 − 5 = 13.',
        body: (
          <div className="space-y-2">
            {METHOD_APPLY.solution.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{METHOD_APPLY.rule}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
