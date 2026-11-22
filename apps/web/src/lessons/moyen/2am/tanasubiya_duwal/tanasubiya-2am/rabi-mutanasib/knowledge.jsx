import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « حساب الرابع المتناسب » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف
 * p. 74 et طريقة p. 75, réécrites). La reconnaissance d'un tableau et le coefficient sont des prérequis (`priorKnowledge`), mesurés par
 * « أستعدّ », jamais des items ici.
 */
const { fourth, routes, cross, remark, trap } = KNOWLEDGE;

/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'rabi', type: 'vocabulaire', title: 'الرابع المتناسب',
        memo: {
          rule: `\\dfrac{a}{b}=\\dfrac{c}{${R('d')}}`,
          hook: 'ثلاثة أعداد تعيّن الرابع',
          example: `\\dfrac{4}{520}=\\dfrac{6}{${R('780')}}`,
          trap: 'عدد واحد فقط يصلح: لا تقبل عددًا قريبًا منه',
          exam: 'سمِّه: الرابع المتناسب للأعداد الثلاثة',
          chip: `\\tfrac{a}{b}=\\tfrac{c}{${R('d')}}`,
          quiz: [
            { q: 'ثمن $2$ kg هو $300$ DA. ثمن $6$ kg :', options: ['$900$', '$304$', '$600$'], correct: 0 },
            { q: 'كم عددًا يصلح رابعًا متناسبًا لثلاثة أعداد معلومة؟', options: ['واحد فقط', 'اثنان', 'أعداد كثيرة'], correct: 0 },
          ],
        },
        predictPrompt: 'في لوحة الأسعار، ضبطتَ البطاقة الناقصة حتى تتوازن الموازين الثلاثة معًا. كم عددًا جعل الجدول تناسبيًا؟ وبماذا نسمّي هذا العدد؟',
        summary: 'ثلاثة أعداد معلومة في جدول تناسبية تعيّن العدد الرابع الذي ينقص، ولا يوجد إلاّ عدد واحد يصلح: هو الرابع المتناسب.',
        body: <p><MathText>{fourth.text}</MathText></p>,
      },
      {
        id: 'farq', type: 'regles', title: 'لا نضيف الفرق',
        memo: {
          rule: `d\\ne b+${R('(c-a)')}`,
          hook: 'نضرب، لا نضيف الفرق',
          example: `400+${R('4')}=404\\ne 600`,
          trap: 'إضافة 4 kg لا تعني إضافة 4 DA',
          exam: 'تحقّق من ثمن الوحدة في العمودين',
          chip: `d\\ne b+${R('(c-a)')}`,
          quiz: [
            { q: '$8$ kg بـ $400$ DA. ثمن $12$ kg :', options: ['$600$', '$404$', '$800$'], correct: 0 },
            { q: 'الجدول: $2$ مقابل $5$ ، و $4$ مقابل $7$ :', options: ['غير تناسبي', 'تناسبي', 'تناسبي لأنّ الفرق ثابت'], correct: 0 },
          ],
        },
        predictPrompt: 'ميزان الفرق أضاء عند 404 DA لكنّ الميزانين الآخرين لم يتوازنا. لماذا لا نقبل 404 DA ؟',
        summary: 'التناسبية تحافظ على ثمن الوحدة، لا على الفرق: إضافة الفرق نفسه إلى العددين تعطي جدولًا غير تناسبي.',
        body: (
          <div className="space-y-2">
            <p><MathText>{trap.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.addDiff.right}</MathText></p>
          </div>
        ),
      },
      {
        id: 'jidaan', type: 'regles', title: 'الجداءان المتصالبان',
        memo: {
          rule: `a\\times ${R('d')}=b\\times ${R('c')}`,
          hook: 'جداءا القطرين متساويان',
          example: `4\\times ${R('780')}=520\\times ${R('6')}`,
          trap: 'لا تضرب عددي العمود الواحد',
          exam: 'اكتب مساواة الجداءين قبل أيّ حساب',
          chip: `a${R('d')}=b${R('c')}`,
          quiz: [
            { q: 'في جدول تناسبية: $3$ مقابل $15$ ، و $5$ مقابل $25$ :', options: ['$3\\times 25=15\\times 5$', '$3\\times 15=5\\times 25$', '$3+25=15+5$'], correct: 0 },
            { q: 'الجدول: $2$ مقابل $7$ ، و $6$ مقابل $21$. الجداءان المتصالبان يساويان:', options: ['$42$', '$14$', '$126$'], correct: 0 },
          ],
        },
        predictPrompt: 'عند الثمن العادل، قارن جداء كتلة العمود الأوّل في ثمن العمود الثاني بجداء ثمن العمود الأوّل في كتلة العمود الثاني. ماذا تلاحظ؟',
        summary: 'في جدول تناسبية $a \\times d = b \\times c$ : الجداءان المتصالبان متساويان.',
        body: (
          <div className="space-y-2">
            <p><MathText>{cross.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{remark.text}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'turuq', type: 'methodes', title: 'طرق حساب الرابع المتناسب',
        memo: {
          rule: `d=${R('\\dfrac{b}{a}')}\\times c`,
          hook: 'الوحدة، المعامل، الجمع، الضرب',
          example: `${R('\\dfrac{650}{5}')}\\times 7=130\\times 7=910`,
          trap: 'كل الطرق تعطي العدد نفسه: إن اختلفت فهناك خطأ',
          exam: 'اكتب الطريق الذي اخترته في سطر واحد',
          chip: `${R('\\tfrac{b}{a}')}\\times c`,
          quiz: [
            { q: '$5$ kg بـ $650$ DA. ثمن $10$ kg :', options: ['$1300$', '$655$', '$650$'], correct: 0 },
            { q: 'ثمن $2$ kg هو $260$ DA وثمن $5$ kg هو $650$ DA. ثمن $7$ kg :', options: ['$910$', '$650\\times 260$', '$652$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تحسب ثمن 7 kg دون تحريك أيّ بطاقة، علمًا أنّ ثمن 5 kg معلوم؟ اكتب طريقتين مختلفتين.',
        summary: 'نصل إلى الرابع المتناسب نفسه بالمرور بالوحدة أو بمعامل التناسبية أو بالخاصية الجمعية أو الضربية.',
        body: <p><MathText>{routes.text}</MathText></p>,
      },
      {
        id: 'hisab-jidaan', type: 'regles', title: 'أحسب بالجداءين',
        memo: {
          rule: `${R('x')}=\\dfrac{b\\times c}{a}`,
          hook: 'المعلوم ÷ المقابل',
          example: `${R('c')}=\\dfrac{4\\times 900}{300}=12`,
          trap: 'اقسم على العدد المقابل للمجهول، لا على أيّ عدد',
          exam: 'اكتب المساواة، ثم القسمة، ثم النتيجة',
          chip: `${R('x')}=\\tfrac{bc}{a}`,
          quiz: [
            { q: '$5\\times x=2\\times 40$ ، إذن:', options: ['$x=16$', '$x=400$', '$x=37$'], correct: 0 },
            { q: '$3\\times x=6\\times 9$ ، إذن:', options: ['$x=18$', '$x=162$', '$x=2$'], correct: 0 },
          ],
        },
        predictPrompt: 'كتبتَ $4 \\times x = 300 \\times ...$ لتجد عدد الكيلوغرامات. كيف تحصل على $x$ من هذه المساواة؟',
        summary: 'نكتب مساواة الجداءين المتصالبين ثم نقسم الجداء المعلوم على العدد المقابل للمجهول.',
        body: <p><MathText>{'$a \\times x = b \\times c$ ، إذن $x = b \\times c \\div a$ : الجداء المعلوم هو جداء القطر الذي لا يحمل المجهول.'}</MathText></p>,
      },
    ],
    3: [
      {
        id: 'ikhtiyar', type: 'methodes', title: 'أختار الطريق',
        memo: {
          rule: `${R('\\times 2')}\\quad ${R('+')}\\quad ${R('\\div a')}\\quad ad=bc`,
          hook: 'انظر إلى الأعداد أوّلًا',
          example: `6=${R('2\\times 3')}:\\ 2\\times 450=900`,
          trap: 'لا تلجأ إلى الجداءين دائمًا: أحيانًا يكفي الضعف',
          exam: 'اذكر لماذا اخترت هذا الطريق',
          chip: `${R('\\times 2')}\\ ${R('+')}`,
          quiz: [
            { q: 'ثمن $4$ kg معلوم. أسرع طريق لثمن $8$ kg :', options: ['الضرب في $2$', 'الجداءان', 'المرور بالوحدة'], correct: 0 },
            { q: 'ثمنا $3$ kg و $5$ kg معلومان. ثمن $8$ kg :', options: ['مجموع الثمنين', 'جداء الثمنين', 'فرق الثمنين'], correct: 0 },
          ],
        },
        predictPrompt: 'أجرة 3 ساعات وأجرة 9 ساعات وأجرة 7 ساعات: هل حسبتها كلّها بالطريق نفسه؟ لماذا؟',
        summary: 'أنظر إلى الأعداد أوّلًا: ضعف أو نصف ← الخاصية الضربية؛ مجموع ← الجمعية؛ وحدة بسيطة ← المرور بالوحدة؛ وإلاّ الجداءان المتصالبان.',
        body: <ul className="list-disc ps-5 space-y-1 text-sm">{METHOD.choose.rule.slice(1).map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ul>,
      },
    ],
  },
};
