/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (modules 1 à 6) — des situations COMPLÈTES de type امتحان autour des trois leçons de l'unité 4 de 2AM (إنتاج عبارة حرفية وحساب قيمتها وتبسيطها،
 * اختبار صحّة مساواة أو متباينة، حلّ معادلة), résolues pas à pas (GuidedProblem) AVANT l'analyse (module 7) et la situation évaluée (module 8). L'`integration` du manuel (le club) est REDESSINÉE
 * en situation 1 (le club d'informatique : 1200 + 150n contre 600 + 180n, l'égalité TESTÉE en n = 20) ; l'`evaluation` (la distance de freinage) en situation 2 (la règle des pointures : valeurs EXACTES) ;
 * l'activité `ict` (le tableur) en situation 6 (un programme de calcul « + 5, × 2, + 3 fois le nombre → 65 ») ; le تحدّي de l'unité (la rangée de cellules) en situation 5.
 * Les situations 3 et 4 sont de la plateforme. Aucune notion nouvelle ; x des DEUX côtés n'est jamais RÉSOLU (une égalité est TESTÉE ou lue dans un tableau) ; aucune valeur négative.
 * Les expressions et les équations se CHOISISSENT (le GuidedProblem saisit des nombres) ; chaque nombre est recalculé dans ./problems.test.js (BigInt).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const SOURCE = addition('exam_style_problem');
const S1 = src('integration', 68, 'أدمج تعلّماتي');
const S2 = src('evaluation', 68, 'وضعية للتقويم');
const S6 = src('ict', 69, 'أوظّف تكنولوجيات الإعلام والاتصال');

export const PROBLEMS = [
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — نادي الإعلام الآلي',
    context: 'صيغتان لاشتراك: عبارتان وجدول واختبار مساواة',
    emoji: '💻',
    source: S1,
    tone: 'sky',
    illustration: { kind: 'tags', cards: [
      { title: 'الصيغة A', icon: 'ticket', lines: [{ label: 'التسجيل', value: 1200, unit: 'DA' }, { label: 'الحصّة الواحدة', value: 150, unit: 'DA' }] },
      { title: 'الصيغة B', icon: 'ticket', lines: [{ label: 'التسجيل', value: 600, unit: 'DA' }, { label: 'الحصّة الواحدة', value: 180, unit: 'DA' }] },
    ], ariaLabel: 'بطاقتان: الصيغة A تسجيلها 1200 دينار وكلّ حصّة 150 دينارًا، والصيغة B تسجيلها 600 دينار وكلّ حصّة 180 دينارًا' },
    statement: 'يقترح نادي الإعلام الآلي صيغتين: الصيغة A: $1200\\,\\mathrm{DA}$ للتسجيل و $150\\,\\mathrm{DA}$ للحصّة الواحدة ؛ الصيغة B: $600\\,\\mathrm{DA}$ للتسجيل و $180\\,\\mathrm{DA}$ للحصّة الواحدة. نرمز بـ $n$ إلى عدد الحصص.',
    data: [
      { id: 'a', text: 'الصيغة ⁦A: 1200 DA + 150 DA⁩ للحصّة', useful: true },
      { id: 'b', text: 'الصيغة ⁦B: 600 DA + 180 DA⁩ للحصّة', useful: true },
      { id: 'n', text: '⁦n⁩ هو عدد الحصص', useful: true },
      { id: 'room', text: 'القاعة في الطابق الأوّل', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'عبارتا المبلغين',
        question: 'اكتب عبارة المبلغ في كلّ صيغة بدلالة $n$ .',
        asks: ['عبارتا الصيغتين'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ibara-harfiya-intaj-2am'], prompt: 'المبلغ في كلّ صيغة هو:',
            options: ['A: $1200+150n$ ؛ B: $600+180n$', 'A: $1350n$ ؛ B: $780n$', 'A: $150+1200n$ ؛ B: $180+600n$'], correct: 0, cols: 1,
            explain: 'التسجيل يُدفع مرّة واحدة، وعن كلّ حصّة نضرب سعرها في $n$ . الخطأ الثاني جمع التسجيل إلى سعر الحصّة، والثالث بدّل دور العددين.' },
          { kind: 'solution', ask: 0, lines: ['التسجيل مبلغ ثابت، والحصّة تُدفع $n$ مرّة.', 'A: $1200+150n$ ؛ B: $600+180n$ .'] },
        ],
      },
      {
        label: '2)', title: 'قيم العبارتين',
        question: 'احسب المبلغين من أجل $n=10$ ثمّ من أجل $n=25$ .',
        asks: ['المبلغان من أجل 10 حصص', 'المبلغان من أجل 25 حصّة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['ibara-harfiya-intaj-2am'], prompt: 'من أجل $n=10$ في الصيغة A: $1200+150\\times10 =$', expected: 2700, suffix: 'DA', explain: '$150\\times10=1500$ ثمّ $1200+1500=2700$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ibara-harfiya-intaj-2am'], prompt: 'من أجل $n=10$ في الصيغة B: $600+180\\times10 =$', expected: 2400, suffix: 'DA', explain: '$180\\times10=1800$ ثمّ $600+1800=2400$ ؛ في $10$ حصص الصيغة B أرخص.' },
          { kind: 'numeric', role: 'compute', requires: ['ibara-harfiya-intaj-2am'], prompt: 'من أجل $n=25$ في الصيغة A: $1200+150\\times25 =$', expected: 4950, suffix: 'DA', explain: '$150\\times25=3750$ ثمّ $1200+3750=4950$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ibara-harfiya-intaj-2am'], prompt: 'من أجل $n=25$ في الصيغة B: $600+180\\times25 =$', expected: 5100, suffix: 'DA', explain: '$180\\times25=4500$ ثمّ $600+4500=5100$ ؛ في $25$ حصّة صارت الصيغة A أرخص.' },
          { kind: 'solution', ask: 0, lines: ['$n=10$ : A $2700$ و B $2400$ ؛ $n=25$ : A $4950$ و B $5100$ .', 'الأرخص تغيّر بين $10$ و $25$ حصّة: نبحث عنه في الأسئلة التالية.'] },
        ],
      },
      {
        label: '3)', title: 'اختبار المساواة',
        question: 'اختبر المساواة $1200+150n=600+180n$ من أجل $n=20$ .',
        asks: ['حكم المساواة من أجل 20'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: 'الطرف الأوّل: $1200+150\\times20 =$', expected: 4200, explain: '$150\\times20=3000$ ثمّ $1200+3000=4200$ .' },
          { kind: 'numeric', role: 'compute', requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: 'الطرف الثاني: $600+180\\times20 =$', expected: 4200, explain: '$180\\times20=3600$ ثمّ $600+3600=4200$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: 'الطرفان متساويان، فالمساواة من أجل $n=20$ :',
            options: ['خاطئة لأنّ التسجيلين مختلفان', 'صحيحة: $4200=4200$ ', 'لا يمكن الحكم عليها'], correct: 1, cols: 1,
            explain: 'نعوّض في الطرفين معًا ونقارن: $4200=4200$ . الصيغتان متساويتان في الكلفة عند $20$ حصّة بالضبط.' },
          { kind: 'solution', ask: 0, lines: ['من أجل $n=20$ : $1200+150\\times20=4200$ و $600+180\\times20=4200$ .', 'المساواة صحيحة من أجل $n=20$ .'] },
        ],
      },
      {
        label: '4)', title: 'متى تكون B أرخص؟',
        question: 'من بين $15$ و $20$ و $25$ : ما القيم التي تجعل المتباينة $600+180n<1200+150n$ صحيحة؟',
        asks: ['القيم التي تجعل المتباينة صحيحة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: 'من أجل $n=15$ : $600+180\\times15 =$', expected: 3300, explain: '$180\\times15=2700$ ثمّ $600+2700=3300$ .' },
          { kind: 'numeric', role: 'compute', requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: 'ومن أجل $n=15$ : $1200+150\\times15 =$', expected: 3450, explain: '$150\\times15=2250$ ثمّ $1200+2250=3450$ ؛ و $3300<3450$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: 'نعرف أنّ المتباينة خاطئة من أجل $20$ ($4200<4200$) ومن أجل $25$ ($5100<4950$) . القيم الصحيحة هي:',
            options: ['$20$ فقط', '$15$ فقط', '$15$ و $20$'], correct: 1, cols: 3,
            explain: 'القيمة $15$ وحدها تعطي $3300<3450$ . عند $20$ تتساوى الطرفان فلا تصحّ العلاقة $<$ ، وعند $25$ تنقلب.' },
          { kind: 'solution', ask: 0, lines: ['$n=15$ : $3300<3450$ صحيحة ؛ $n=20$ : $4200<4200$ خاطئة ؛ $n=25$ : $5100<4950$ خاطئة.', 'القيمة الوحيدة هي $15$ .'] },
        ],
      },
      {
        label: '5)', title: 'نصيحة لتلميذ',
        question: 'أيّ صيغة تنصح بها تلميذًا يحضر $12$ حصّة؟',
        asks: ['الصيغة الأرخص لـ 12 حصّة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['ibara-harfiya-intaj-2am'], prompt: 'الصيغة A لـ $12$ حصّة: $1200+150\\times12 =$', expected: 3000, suffix: 'DA', explain: '$150\\times12=1800$ ثمّ $1200+1800=3000$ .' },
          { kind: 'numeric', role: 'compute', requires: ['ibara-harfiya-intaj-2am'], prompt: 'الصيغة B لـ $12$ حصّة: $600+180\\times12 =$', expected: 2760, suffix: 'DA', explain: '$180\\times12=2160$ ثمّ $600+2160=2760$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: 'الصيغة الأرخص هي:',
            options: ['A لأنّ سعر حصّتها أقلّ', 'B لأنّ $2760<3000$ ', 'متساويتان'], correct: 1, cols: 1,
            explain: 'نقارن المبلغين لا سعري الحصّة: $2760<3000$ . التسجيل الأقلّ في B يغلب فرق سعر الحصّة عند عدد قليل من الحصص.' },
          { kind: 'solution', ask: 0, lines: ['A: $1200+150\\times12=3000$ ؛ B: $600+180\\times12=2760$ .', 'ننصح بالصيغة B ، فهي أرخص بـ $240\\,\\mathrm{DA}$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — قاعدة مقاس الحذاء',
    context: 'صيغة بمبلغ ثابت: قيمتها ومجهولها وشرط عليها',
    emoji: '👟',
    source: S2,
    tone: 'amber',
    illustration: { kind: 'tags', cards: [
      { title: 'قاعدة الورشة', icon: 'shirt', lines: [{ label: 'مقاس الحذاء', value: 'P = 1,5 × L + 2' }, { label: 'طول القدم', value: 'L', unit: 'cm' }] },
    ], ariaLabel: 'بطاقة: قاعدة ورشة الأحذية، مقاس الحذاء P يساوي 1,5 ضرب طول القدم L بالسنتيمتر زائد 2' },
    statement: 'تعتمد ورشة أحذية قاعدة تقريبية: مقاس الحذاء $P=1{,}5\\times L+2$ ، حيث $L$ طول القدم بالسنتيمتر.',
    data: [
      { id: 'rule', text: 'القاعدة: ⁦P = 1,5 × L + 2⁩', useful: true },
      { id: 'l', text: '⁦L⁩ طول القدم بالسنتيمتر', useful: true },
      { id: 'shop', text: 'الورشة تقع في وسط المدينة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مقاس قدم معلومة',
        question: 'ما مقاس حذاء قدم طولها $24\\,\\mathrm{cm}$ ؟',
        asks: ['المقاس لقدم طولها 24 cm'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['ibara-harfiya-intaj-2am'], prompt: '$1{,}5\\times24 =$', expected: 36, explain: '$24+12=36$ ، لأنّ $1{,}5\\times24$ هو $24$ ونصف $24$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ibara-harfiya-intaj-2am'], prompt: 'المقاس: $36+2 =$', expected: 38, explain: '$P=1{,}5\\times24+2=38$ .' },
          { kind: 'solution', ask: 0, lines: ['نعوّض $L=24$ : $P=1{,}5\\times24+2$ .', '$P=36+2=38$ .'] },
        ],
      },
      {
        label: '2)', title: 'طول قدم من مقاس',
        question: 'ما طول قدم مقاس حذائها $41$ ؟',
        asks: ['طول القدم لمقاس 41'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['hall-mushkil-muadala-2am'], prompt: 'نكتب المعادلة ونلغي آخر عملية أُجريت على $L$ أوّلًا:',
            options: ['$1{,}5\\times L+2=41$ ثمّ $1{,}5\\times L=39$ ', '$1{,}5\\times L+2=41$ ثمّ $L+2=41\\div1{,}5$ ', '$1{,}5\\times L=41+2$'], correct: 0, cols: 1,
            explain: 'آخر عملية هي إضافة $2$ ، فنطرحها من $41$ أوّلًا فنجد $39$ . الثاني يقسم قبل الطرح، والثالث يضيف بدل أن يطرح.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-mushkil-muadala-2am'], prompt: '$L=39\\div1{,}5 =$', expected: 26, suffix: 'cm', explain: '$1{,}5\\times26=39$ . نتحقّق: $1{,}5\\times26+2=41$ .' },
          { kind: 'solution', ask: 0, lines: ['$1{,}5\\times L+2=41$ ، فـ $1{,}5\\times L=39$ .', '$L=39\\div1{,}5=26$ : طول القدم $26\\,\\mathrm{cm}$ .'] },
        ],
      },
      {
        label: '3)', title: 'هل يناسب الحذاء؟',
        question: 'يناسب حذاء مقاسه $40$ قدمًا إذا كانت $1{,}5\\times L+2\\le40$ . اختبر $L=25$ ثمّ $L=26$ .',
        asks: ['اختبار L = 25', 'اختبار L = 26'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: 'من أجل $L=25$ : $1{,}5\\times25 =$', expected: 37.5, display: '37,5', explain: '$25+12{,}5=37{,}5$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: 'من أجل $L=25$ نجد $37{,}5+2=39{,}5$ ، والمتباينة $39{,}5\\le40$ :',
            options: ['خاطئة', 'صحيحة، فالحذاء يناسب'], correct: 1, cols: 2,
            explain: '$39{,}5$ أصغر من $40$ ، فالمتباينة صحيحة.' },
          { kind: 'numeric', role: 'compute', requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: 'من أجل $L=26$ : $1{,}5\\times26+2 =$', expected: 41, explain: '$1{,}5\\times26=39$ ثمّ $39+2=41$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: 'المتباينة $41\\le40$ :',
            options: ['صحيحة', 'خاطئة، فالحذاء لا يناسب'], correct: 1, cols: 2,
            explain: '$41$ أكبر من $40$ ، فالمتباينة خاطئة.' },
          { kind: 'solution', ask: 0, lines: ['$L=25$ : $39{,}5\\le40$ صحيحة ؛ $L=26$ : $41\\le40$ خاطئة.', 'الحذاء ذو المقاس $40$ يناسب القدم $25\\,\\mathrm{cm}$ ولا يناسب القدم $26\\,\\mathrm{cm}$ .'] },
        ],
      },
      {
        label: '4)', title: 'مقاس مستحيل؟',
        question: 'هل يمكن أن يكون مقاس الحذاء $2$ ؟',
        asks: ['إمكان المقاس 2'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['hall-mushkil-muadala-2am'], prompt: 'من $1{,}5\\times L+2=2$ نجد $1{,}5\\times L=$', expected: 0, explain: 'نطرح $2$ من $2$ فنجد $0$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hall-mushkil-muadala-2am'], prompt: 'إذن $L=0$ ، وهذا يعني:',
            options: ['أنّ الحذاء مقاسه $2$ وطول قدمه $0$ ، فلا قدم له: غير ممكن', 'أنّ الحذاء يناسب قدمًا طولها $2\\,\\mathrm{cm}$ ', 'أنّ القاعدة خاطئة'], correct: 0, cols: 1,
            explain: 'طول القدم $0$ يعني أنّه لا توجد قدم، فلا يمكن أن يكون المقاس $2$ .' },
          { kind: 'solution', ask: 0, lines: ['$1{,}5\\times L+2=2$ تعطي $1{,}5\\times L=0$ ، أي $L=0$ .', 'قدم طولها $0$ غير موجودة: المقاس $2$ غير ممكن.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — حديقة بدلالة x',
    context: 'محيط ومساحة بدلالة x ثمّ معادلة',
    emoji: '🌳',
    source: SOURCE,
    tone: 'emerald',
    illustration: { kind: 'plan', shape: 'rect', fill: 'grass', w: 'x + 20', h: 'x', unit: 'm', ariaLabel: 'حديقة مستطيلة طولها x زائد 20 مترًا وعرضها x مترًا' },
    statement: 'حديقة مستطيلة طولها $x+20$ بالمتر وعرضها $x$ بالمتر. يريد البستاني سياجًا حولها طوله $160\\,\\mathrm{m}$ .',
    data: [
      { id: 'len', text: 'الطول ⁦x + 20⁩ بالمتر', useful: true },
      { id: 'wid', text: 'العرض ⁦x⁩ بالمتر', useful: true },
      { id: 'fence', text: 'طول السياج ⁦160 m⁩', useful: true },
      { id: 'tree', text: 'في الحديقة شجرة زيتون', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المحيط بدلالة x',
        question: 'اكتب محيط الحديقة بدلالة $x$ في أبسط شكل.',
        asks: ['المحيط مبسّطًا'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ibara-harfiya-intaj-2am'], prompt: 'المحيط $2(x+20)+2x$ يكتب مبسّطًا:',
            options: ['$4x+40$', '$4x+20$', '$2x+40$'], correct: 0, cols: 3,
            explain: '$2(x+20)=2x+40$ ثمّ نجمع $2x+2x=4x$ ونحتفظ بـ $40$ . الثاني ضرب $x$ فقط في $2$ ، والثالث نسي $2x$ الثانية.' },
          { kind: 'solution', ask: 0, lines: ['المحيط ضعف مجموع البعدين: $2(x+20)+2x$ .', '$2x+40+2x=4x+40$ .'] },
        ],
      },
      {
        label: '2)', title: 'قيمة x',
        question: 'يساوي المحيط $160\\,\\mathrm{m}$ : أوجد $x$ .',
        asks: ['قيمة x'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['hall-mushkil-muadala-2am'], prompt: 'من $4x+40=160$ نلغي $+40$ أوّلًا: $4x=160-40=$', expected: 120, explain: 'نطرح $40$ من $160$ فنجد $4x=120$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-mushkil-muadala-2am'], prompt: '$x=120\\div4 =$', expected: 30, explain: '$4\\times30=120$ . نتحقّق: $4\\times30+40=160$ .' },
          { kind: 'solution', ask: 0, lines: ['$4x+40=160$ ، فـ $4x=120$ .', '$x=120\\div4=30$ .'] },
        ],
      },
      {
        label: '3)', title: 'البعدان',
        question: 'ما بعدا الحديقة؟',
        asks: ['الطول', 'العرض'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ibara-harfiya-intaj-2am'], prompt: 'الطول: $x+20=30+20 =$', expected: 50, suffix: 'm', explain: '$30+20=50$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ibara-harfiya-intaj-2am'], prompt: 'العرض: $x =$', expected: 30, suffix: 'm', explain: 'العرض هو $x=30$ .' },
          { kind: 'solution', ask: 0, lines: ['الطول $x+20=30+20=50\\,\\mathrm{m}$ .', 'العرض $x=30\\,\\mathrm{m}$ .'] },
        ],
      },
      {
        label: '4)', title: 'مساحة الحديقة',
        question: 'ما مساحة الحديقة؟',
        asks: ['المساحة بالمتر المربّع'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ibara-harfiya-intaj-2am'], prompt: 'المساحة: $50\\times30 =$', expected: 1500, suffix: 'm²', explain: '$50\\times30=1500$ .' },
          { kind: 'solution', ask: 0, lines: ['مساحة المستطيل جداء بعديه: $50\\times30$ .', 'المساحة $1500\\,\\mathrm{m}^2$ .'] },
        ],
      },
      {
        label: '5)', title: 'تحقّق من المحيط',
        question: 'تحقّق من المحيط بالبعدين.',
        asks: ['تحقّق المحيط'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: '$2\\times50+2\\times30 =$', expected: 160, suffix: 'm', explain: '$100+60=160$ ، وهو طول السياج المعطى.' },
          { kind: 'solution', ask: 0, lines: ['$2\\times50+2\\times30=100+60=160$ .', 'نجد طول السياج المعطى $160\\,\\mathrm{m}$ : الحلّ صحيح.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — ورقة إجابات سارة',
    context: 'أحكم على حسابات زميلة وأصحّحها',
    emoji: '📝',
    source: SOURCE,
    tone: 'violet',
    illustration: { kind: 'tags', cards: [
      { title: 'ورقة سارة', icon: 'pen', lines: [{ label: 'عدد الإجابات', value: 5 }, { label: 'نقطة لكل إجابة صحيحة', value: 1 }] },
    ], ariaLabel: 'ورقة سارة: خمس إجابات تُمنح نقطة عن كل إجابة صحيحة' },
    statement: 'قدّمت سارة ورقة بخمس إجابات ($5$ إجابات) (a) إلى (e) مبيّنة في الجدول الآتي. يمنح الأستاذ نقطة واحدة ($1$) عن كل إجابة صحيحة.',
    table: { head: ['الإجابة', 'ما كتبته سارة'], rows: [
      ['(a)', '$3\\times a\\times a=3a^2$'],
      ['(b)', 'قيمة $4x^2$ من أجل $x=3$ هي $144$'],
      ['(c)', 'حلّ المعادلة $\\frac{7{,}2}{x}=0{,}9$ هو $6{,}48$'],
      ['(d)', 'المساواة $2x+5=4x-1$ صحيحة من أجل $x=3$'],
      ['(e)', 'العبارتان $x+6$ و $3x+2$ متساويتان لأنّهما تعطيان $8$ من أجل $x=2$'],
    ] },
    data: [
      { id: 'a', text: 'الإجابات الخمس (⁦a⁩) إلى (⁦e⁩)', useful: true },
      { id: 'mark', text: 'نقطة عن كل إجابة صحيحة', useful: true },
      { id: 'who', text: 'سارة تجلس في الصفّ الأوّل', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'صحيح أم خاطئ؟',
        question: 'احكم على كل إجابة من الإجابات الخمس.',
        asks: ['الحكم على الإجابات الخمس'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['ibara-harfiya-intaj-2am', 'hall-mushkil-muadala-2am', 'ikhtibar-musawat-mutabayina-2am'], prompt: 'اختر الحكم:',
            rows: [
              { label: '(a) $3\\times a\\times a=3a^2$', options: ['صحيح', 'خطأ'], correct: 0, correction: '$a\\times a=a^2$ ، فـ $3\\times a\\times a=3\\times a^2=3a^2$ .' },
              { label: '(b) قيمة $4x^2$ من أجل $x=3$ هي $144$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'الأسّ يخصّ $x$ وحده: $4\\times3\\times3=36$ . أمّا $144$ فهي $(4\\times3)^2$ .' },
              { label: '(c) حلّ $\\frac{7{,}2}{x}=0{,}9$ هو $6{,}48$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'المجهول قاسم: $x=7{,}2\\div0{,}9=8$ . والعدد $6{,}48$ هو الجداء $7{,}2\\times0{,}9$ .' },
              { label: '(d) $2x+5=4x-1$ صحيحة من أجل $x=3$', options: ['صحيح', 'خطأ'], correct: 0, correction: 'الطرف الأوّل $2\\times3+5=11$ والثاني $4\\times3-1=11$ .' },
              { label: '(e) $x+6$ و $3x+2$ متساويتان لأنّهما تعطيان $8$ من أجل $x=2$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'التساوي من أجل قيمة واحدة لا يكفي: من أجل $x=0$ نجد $6$ و $2$ .' },
            ] },
          { kind: 'solution', ask: 0, lines: ['(a) صحيح، (b) خطأ، (c) خطأ، (d) صحيح، (e) خطأ.', 'نتحقّق من كل واحدة: الأسّ، والعملية العكسية، وتعويض الطرفين، ومثال مضادّ.'] },
        ],
      },
      {
        label: '2)', title: 'تصحيح الخاطئة',
        question: 'ما القيمة الصحيحة في (b)؟ وما الحلّ الصحيح في (c)؟ وكيف نبيّن أنّ (e) خاطئة؟',
        asks: ['القيمة الصحيحة في (b)', 'الحلّ الصحيح في (c)', 'المثال المضادّ في (e)'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ibara-harfiya-intaj-2am'], prompt: 'قيمة $4x^2$ من أجل $x=3$ : $4\\times3\\times3 =$', expected: 36, explain: '$3\\times3=9$ ثمّ $4\\times9=36$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hall-mushkil-muadala-2am'], prompt: 'حلّ $\\frac{7{,}2}{x}=0{,}9$ : $x=7{,}2\\div0{,}9 =$', expected: 8, explain: '$0{,}9\\times8=7{,}2$ . نتحقّق: $7{,}2\\div8=0{,}9$ .' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: 'مثال مضادّ واحد يكفي، وهو:',
            options: ['$x=0$ : نجد $6$ و $2$ ، وهما مختلفان', '$x=2$ : نجد $8$ و $8$', '$x=1$ : نجد $7$ و $5$ ، فتساوتا'], correct: 0, cols: 1,
            explain: 'من أجل $x=0$ العبارتان $6$ و $2$ فهما غير متساويتين. الثاني هو القيمة التي استعملتها سارة، والثالث حساب صحيح لكنّ $7\\neq5$ لا يعني التساوي.' },
          { kind: 'solution', ask: 0, lines: ['(b) $4x^2=4\\times3\\times3=36$ ؛ (c) $x=7{,}2\\div0{,}9=8$ .', '(e) من أجل $x=0$ : $0+6=6$ و $3\\times0+2=2$ ، فالعبارتان غير متساويتين.'] },
        ],
      },
      {
        label: '3)', title: 'نقطة سارة',
        question: 'ما نقطة سارة من 5؟',
        asks: ['نقطة سارة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: 'عدد إجاباتها الصحيحة، وهي (a) و (d):', expected: 2, explain: 'نقطة عن كل إجابة صحيحة، والصحيحتان (a) و (d): $2$ من $5$ .' },
          { kind: 'solution', ask: 0, lines: ['الإجابتان (a) و (d) صحيحتان.', 'نقطة سارة: $2$ من $5$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — صفّ الخلايا',
    context: 'تعميم نمط بعبارة ثمّ معادلة',
    emoji: '🐝',
    source: SOURCE,
    tone: 'indigo',
    illustration: { kind: 'tags', cards: [
      { title: 'صفّ من الخلايا', icon: 'candle', lines: [{ label: 'خلية واحدة', value: 6, unit: 'أعواد' }, { label: 'خليتان متجاورتان', value: 11, unit: 'عودًا' }] },
    ], ariaLabel: 'صفّ من خلايا سداسية: الخلية الواحدة ستّة أعواد والخليتان المتلاصقتان إحدى عشر عودًا' },
    statement: 'في صفّ من خلايا سداسية متلاصقة تشترك كلّ خليتين متجاورتين في عود: الخلية الواحدة $6$ أعواد، والخليتان $11$ عودًا.',
    data: [
      { id: 'one', text: 'خلية واحدة: ⁦6⁩ أعواد', useful: true },
      { id: 'two', text: 'خليتان: ⁦11⁩ عودًا', useful: true },
      { id: 'share', text: 'كلّ خليتين متجاورتين تشتركان في عود', useful: true },
      { id: 'wax', text: 'الأعواد مصنوعة من الشمع', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'العبارة العامة',
        question: 'اكتب عدد الأعواد لصفّ من $n$ خلية.',
        asks: ['عدد الأعواد لـ n خلية'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ibara-harfiya-intaj-2am'], prompt: 'الخلية الأولى $6$ أعواد، وكلّ خلية جديدة تضيف $5$ فقط. العدد:',
            options: ['$6n$', '$5n+1$', '$5n$'], correct: 1, cols: 3,
            explain: 'الخلية الأولى $6=5+1$ ، وكلّ خلية جديدة $5$ : فالعدد $5n+1$ . اختبر $n=2$ : $5\\times2+1=11$ . الأوّل لا يحسب الاشتراك، والثالث ينسى العود الأوّل.' },
          { kind: 'solution', ask: 0, lines: ['$n=1$ : $6$ ؛ $n=2$ : $11$ ؛ كلّ خلية جديدة تضيف $5$ أعواد.', 'العدد $5n+1$ .'] },
        ],
      },
      {
        label: '2)', title: 'أربعون خلية',
        question: 'كم عودًا يلزم لصفّ من $40$ خلية؟',
        asks: ['عدد الأعواد لـ 40 خلية'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ibara-harfiya-intaj-2am'], prompt: '$5\\times40+1 =$', expected: 201, explain: '$5\\times40=200$ ثمّ $200+1=201$ .' },
          { kind: 'solution', ask: 0, lines: ['نعوّض $n=40$ في $5n+1$ .', '$5\\times40+1=201$ عودًا.'] },
        ],
      },
      {
        label: '3)', title: 'عدد خلايا ياسين',
        question: 'مع ياسين $151$ عودًا: كم خلية يصنع بها كلّها؟',
        asks: ['عدد الخلايا'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['hall-mushkil-muadala-2am'], prompt: 'من $5n+1=151$ نلغي $+1$ أوّلًا: $5n=151-1 =$', expected: 150, explain: 'نطرح $1$ من $151$ فنجد $5n=150$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-mushkil-muadala-2am'], prompt: '$n=150\\div5 =$', expected: 30, suffix: 'خلية', explain: '$5\\times30=150$ . نتحقّق: $5\\times30+1=151$ .' },
          { kind: 'solution', ask: 0, lines: ['$5n+1=151$ ، فـ $5n=150$ .', '$n=30$ : يصنع ياسين $30$ خلية.'] },
        ],
      },
      {
        label: '4)', title: 'هل تكفي 230 عودًا؟',
        question: 'هل تكفي $230$ عودًا لصفّ من $46$ خلية؟',
        asks: ['كفاية 230 عودًا'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['ibara-harfiya-intaj-2am'], prompt: 'الأعواد اللازمة لـ $46$ خلية: $5\\times46+1 =$', expected: 231, explain: '$5\\times46=230$ ثمّ $230+1=231$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: 'نختبر المتباينة $231\\le230$ :',
            options: ['صحيحة: تكفي', 'خاطئة: لا تكفي، ينقص عود واحد'], correct: 1, cols: 1,
            explain: '$231>230$ ، فالمتباينة خاطئة: ينقص عود واحد.' },
          { kind: 'solution', ask: 0, lines: ['$5\\times46+1=231$ ، و $231\\le230$ خاطئة.', 'لا تكفي $230$ عودًا: ينقص عود واحد.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — برنامج الحساب',
    context: 'برنامج حساب: عبارة وتبسيطها وجدول ومعادلة',
    emoji: '🧮',
    source: S6,
    tone: 'rose',
    illustration: { kind: 'tags', cards: [
      { title: 'برنامج هدى', icon: 'pen', lines: [{ label: 'أضف إلى العدد', value: 5 }, { label: 'اضرب الناتج في', value: 2 }, { label: 'ثمّ أضف ثلاثة أضعاف العدد' }] },
      { title: 'النتيجة', icon: 'pen', lines: [{ label: 'حصلت هدى على', value: 65 }] },
    ], ariaLabel: 'بطاقتان: برنامج حساب لهدى يضيف 5 إلى العدد المختار ثمّ يضرب في 2 ثمّ يضيف ثلاثة أضعاف العدد، والنتيجة 65' },
    statement: 'اختر عددًا $x$ ، أضف إليه $5$ ، اضرب الناتج في $2$ ، ثمّ أضف إلى النتيجة ثلاثة أضعاف العدد المختار. حصلت هدى على $65$ .',
    data: [
      { id: 'add', text: 'أضف ⁦5⁩ ثمّ اضرب في ⁦2⁩', useful: true },
      { id: 'triple', text: 'ثمّ أضف ثلاثة أضعاف العدد المختار', useful: true },
      { id: 'res', text: 'نتيجة هدى ⁦65⁩', useful: true },
      { id: 'age', text: 'هدى في السنة الثانية متوسط', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'عبارة البرنامج',
        question: 'اكتب نتيجة البرنامج بدلالة $x$ .',
        asks: ['عبارة البرنامج'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ibara-harfiya-intaj-2am'], prompt: 'النتيجة هي:',
            options: ['$2x+5+3x$', '$2(x+5)+3x$', '$2(x+5)\\times3x$'], correct: 1, cols: 1,
            explain: 'الضرب في $2$ يشمل المجموع $x+5$ كلّه فنضعه بين قوسين، ثمّ نجمع $3x$ . الأوّل ضاعف $x$ وحده، والثالث ضرب بدل أن يجمع.' },
          { kind: 'solution', ask: 0, lines: ['نضيف $5$ فنجد $x+5$ ، ونضرب في $2$ فنجد $2(x+5)$ .', 'ثمّ نضيف $3x$ : النتيجة $2(x+5)+3x$ .'] },
        ],
      },
      {
        label: '2)', title: 'تبسيط العبارة',
        question: 'بسّط العبارة $2(x+5)+3x$ .',
        asks: ['العبارة المبسّطة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['ibara-harfiya-intaj-2am'], prompt: 'بالتوزيع: $2(x+5)=$',
            options: ['$2x+10$', '$2x+5$', '$x+10$'], correct: 0, cols: 3,
            explain: 'نضرب $2$ في كلّ حدّ: $2\\times x=2x$ و $2\\times5=10$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ibara-harfiya-intaj-2am'], prompt: 'نجمع الحدود المتشابهة: $2x+10+3x=$',
            options: ['$5x+10$', '$5x+5$', '$6x+10$'], correct: 0, cols: 3,
            explain: '$2x+3x=(2+3)x=5x$ والعدد $10$ يبقى. الثاني نسي ضرب $5$ في $2$ ، والثالث ضرب $2$ في $3$ .' },
          { kind: 'solution', ask: 0, lines: ['$2(x+5)+3x=2x+10+3x$ .', '$=5x+10$ .'] },
        ],
      },
      {
        label: '3)', title: 'جدول القيم',
        question: 'أكمل جدول قيم $5x+10$ من أجل $x=8$ ثمّ $10$ ثمّ $12$ .',
        asks: ['قيم العبارة من أجل 8 و 10 و 12'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['ibara-harfiya-intaj-2am'], prompt: 'من أجل $x=8$ : $5\\times8+10 =$', expected: 50, explain: '$5\\times8=40$ ثمّ $40+10=50$ .' },
          { kind: 'numeric', role: 'compute', requires: ['ibara-harfiya-intaj-2am'], prompt: 'من أجل $x=10$ : $5\\times10+10 =$', expected: 60, explain: '$50+10=60$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ibara-harfiya-intaj-2am'], prompt: 'من أجل $x=12$ : $5\\times12+10 =$', expected: 70, explain: '$60+10=70$ .' },
          { kind: 'solution', ask: 0, lines: ['$x=8,9,10,11,12$ تعطي $50,55,60,65,70$ .', 'القيمة $65$ تظهر عند $x=11$ .'] },
        ],
      },
      {
        label: '4)', title: 'العدد الذي اختارته هدى',
        question: 'ما العدد الذي اختارته هدى؟',
        asks: ['العدد المختار'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['hall-mushkil-muadala-2am'], prompt: 'من $5x+10=65$ نلغي $+10$ أوّلًا: $5x=65-10 =$', expected: 55, explain: 'نطرح $10$ من $65$ فنجد $5x=55$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-mushkil-muadala-2am'], prompt: '$x=55\\div5 =$', expected: 11, explain: '$5\\times11=55$ ، وهي القيمة التي رأيناها في الجدول.' },
          { kind: 'solution', ask: 0, lines: ['$5x+10=65$ ، فـ $5x=55$ .', '$x=11$ : اختارت هدى العدد $11$ .'] },
        ],
      },
      {
        label: '5)', title: 'التحقّق',
        question: 'تحقّق من النتيجة بتطبيق البرنامج على العدد $11$ .',
        asks: ['التحقّق'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ibara-harfiya-intaj-2am'], prompt: '$2\\times(11+5)+3\\times11 =$', expected: 65, explain: '$2\\times16=32$ و $3\\times11=33$ ، فالمجموع $65$ .' },
          { kind: 'solution', ask: 0, lines: ['$11+5=16$ ثمّ $2\\times16=32$ .', '$32+3\\times11=32+33=65$ : نجد نتيجة هدى.'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
