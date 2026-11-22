/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (modules 1 à 6) — des situations COMPLÈTES de type امتحان autour des quatre leçons de l'unité 5 (المساويات والعمليات، المتباينات
 * والعمليات، حصر عدد عشري موجب، المعادلة من الدرجة الأولى), résolues pas à pas (GuidedProblem) AVANT l'analyse (module 7) et la situation évaluée (module 8). Le تحدّي du manuel
 * (15 750 DA, partager entre trois fils) est REDESSINÉ en situation 1 (T inconnu : 24 800 DA distribués) ; les situations 2 à 6 sont de la plateforme. Aucune notion nouvelle :
 * ni système de deux équations, ni produit nul, ni « حلّ une inéquation » (l'ensemble solution est de 4AM), ni arrondi négatif. Une réponse sous forme d'encadrement ou d'inégalité
 * se CHOISIT ; un nombre se SAISIT (virgule décimale) ; chaque nombre est recalculé dans ./problems.test.js (BigInt).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const SOURCE = addition('exam_style_problem');
const S1 = src('challenge', 70, 'تحدّي');

export const PROBLEMS = [
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — مكافأة النجاح',
    context: 'ترجمة توزيع مبلغ بمعادلة، حلّها، ثم تدوير النتيجة',
    emoji: '🏅',
    source: S1,
    tone: 'amber',
    illustration: { kind: 'tags', cards: [
      { title: 'الأعلى معدّلًا', icon: 'coin', lines: [{ label: 'يأخذ', value: 'T' }] },
      { title: 'الأدنى معدّلًا', icon: 'coin', lines: [{ label: 'يأخذ', value: 'ربع T' }] },
      { title: 'الثالث', icon: 'coin', lines: [{ label: 'يأخذ', value: 'ثلاثة أعشار T' }] },
    ], ariaLabel: 'ثلاث بطاقات: صاحب أعلى معدّل يأخذ مبلغًا مجهولًا T، وصاحب أدنى معدّل يأخذ ربعه، والولد الثالث يأخذ ثلاثة أعشاره' },
    statement: 'قرّر أبٌ مكافأة أبنائه الثلاثة على نجاحهم: يأخذ صاحب أعلى معدّل مبلغًا $T$ ، ويأخذ صاحب أدنى معدّل ربع هذا المبلغ، ويأخذ الولد الثالث ثلاثة أعشاره. وزّع الأب $24\\,800$ DA كلّها بين أبنائه الثلاثة.',
    data: [
      { id: 'top', text: 'الأعلى معدّلًا يأخذ المبلغ T', useful: true },
      { id: 'low', text: 'الأدنى معدّلًا يأخذ ربع T', useful: true },
      { id: 'third', text: 'الثالث يأخذ ثلاثة أعشار T', useful: true },
      { id: 'total', text: 'المجموع الموزّع 24800 DA', useful: true },
      { id: 'job', text: 'الأب موظّف في بلدية الحيّ', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حصّتا الولدين الآخرين',
        question: 'عبّر بدلالة $T$ عن حصّة صاحب أدنى معدّل وعن حصّة الولد الثالث.',
        asks: ['حصّة صاحب أدنى معدّل', 'حصّة الولد الثالث'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['musawiyat-amaliyat-3am'], prompt: 'ربع المبلغ $T$ هو:', options: ['$\\frac{T}{4}$', '$4T$', '$T - \\frac{1}{4}$'], correct: 0,
            explain: 'ربع الشيء هو قسمته على $4$ : $\\frac{T}{4}$ . الخطأ الثاني ضرب بدل القسمة، والثالث طرح الكسر من $T$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['musawiyat-amaliyat-3am'], prompt: 'ثلاثة أعشار المبلغ $T$ هي:', options: ['$\\frac{3T}{10}$', '$\\frac{3}{10} + T$', '$\\frac{10T}{3}$'], correct: 0,
            explain: 'ثلاثة أعشار $T$ هي $\\frac{3}{10} \\times T = \\frac{3T}{10}$ . الخطأ الثاني جمع بدل الضرب، والثالث قلب الكسر.' },
          { kind: 'solution', ask: 0, lines: ['صاحب أدنى معدّل يأخذ ربع المبلغ: $\\frac{T}{4}$ .', 'والولد الثالث يأخذ ثلاثة أعشاره: $\\frac{3T}{10}$ .'] },
        ],
      },
      {
        label: '2)', title: 'معادلة المبلغ الموزّع',
        question: 'اكتب معادلة تترجم أنّ ما وُزّع هو $24\\,800$ DA ، ثم بسّط معامل $T$ فيها.',
        asks: ['المعادلة', 'المعامل'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muadalat-darajat-ula-3am'], prompt: 'مجموع حصص الأبناء الثلاثة هو المبلغ الموزّع، فالمعادلة:',
            options: ['$T + \\frac{T}{4} + \\frac{3T}{10} = 24\\,800$', '$T = 24\\,800$', '$\\frac{T}{4} + \\frac{3T}{10} = 24\\,800$'], correct: 0, cols: 1,
            explain: 'المبلغ الموزّع هو مجموع الحصص الثلاث، ومنها حصّة الأعلى معدّلًا وهي $T$ . الخطأ الثاني يتجاهل حصّتي الآخرَين، والثالث ينسى حصّة الأعلى.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['muadalat-darajat-ula-3am'], prompt: 'نجمع معاملات $T$ : $1 + \\frac{1}{4} + \\frac{3}{10} =$', expected: 1.55, display: '1,55',
            explain: '$1 + 0{,}25 + 0{,}3 = 1{,}55$ ، فالمعادلة $1{,}55\\,T = 24\\,800$ .' },
          { kind: 'solution', ask: 0, lines: ['$T + \\frac{T}{4} + \\frac{3T}{10} = 24\\,800$ .', 'نجمع المعاملات: $\\left(1 + \\frac{1}{4} + \\frac{3}{10}\\right)T = 1{,}55\\,T = 24\\,800$ .'] },
        ],
      },
      {
        label: '3)', title: 'الحلّ والحصص',
        question: 'حلّ المعادلة $1{,}55\\,T = 24\\,800$ ، ثم احسب حصّتي الولدين الآخرين.',
        asks: ['المبلغ T', 'حصّة صاحب أدنى معدّل', 'حصّة الولد الثالث'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['muadalat-darajat-ula-3am'], prompt: 'نقسم الطرفين على $1{,}55$ : $T =$', expected: 16000, suffix: 'DA', explain: '$T = \\frac{24\\,800}{1{,}55} = 16\\,000$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['muadalat-darajat-ula-3am'], prompt: 'حصّة صاحب أدنى معدّل $\\frac{T}{4} =$', expected: 4000, suffix: 'DA', explain: '$16\\,000 \\div 4 = 4\\,000$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['muadalat-darajat-ula-3am'], prompt: 'حصّة الولد الثالث $\\frac{3T}{10} =$', expected: 4800, suffix: 'DA', explain: '$\\frac{3 \\times 16\\,000}{10} = 4\\,800$ .' },
          { kind: 'solution', ask: 0, lines: ['$T = 24\\,800 \\div 1{,}55 = 16\\,000$ DA .', 'حصّة صاحب أدنى معدّل $4\\,000$ DA وحصّة الولد الثالث $4\\,800$ DA .'] },
        ],
      },
      {
        label: '4)', title: 'التحقّق',
        question: 'تحقّق من الحلّ بحساب ما وُزّع.',
        asks: ['مجموع الحصص'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['muadalat-darajat-ula-3am'], prompt: '$16\\,000 + 4\\,000 + 4\\,800 =$', expected: 24800, suffix: 'DA', explain: 'نجد $24\\,800$ DA ، وهو المبلغ الموزّع: الحلّ مقبول.' },
          { kind: 'solution', ask: 0, lines: ['$16\\,000 + 4\\,000 + 4\\,800 = 24\\,800$ .', 'المجموع هو المبلغ الذي وزّعه الأب، فالحلّ صحيح.'] },
        ],
      },
      {
        label: '5)', title: 'لو كان المبلغ الموزّع أكبر',
        question: 'لو وزّع الأب $25\\,000$ DA بالكيفية نفسها، فما $T$ مدوّرًا إلى الدينار؟ وما حصره بين عددين متتاليين من الدنانير؟',
        asks: ['مدوّر T إلى الدينار', 'الحصر'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['muadalat-darajat-ula-3am', 'hasr-adad-ushri-3am'], prompt: '$T = \\frac{25\\,000}{1{,}55} = 16\\,129{,}03\\ldots$ ، مدوّره إلى الدينار:', expected: 16129, suffix: 'DA',
            explain: 'الرقم بعد الفاصلة $0$ فلا نرفع: المدوّر $16\\,129$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['hasr-adad-ushri-3am'], prompt: 'حصر $T$ بين عددين متتاليين من الدنانير:',
            options: ['$16\\,129 < T < 16\\,130$', '$16\\,128 < T < 16\\,129$', '$16\\,129 < T < 16\\,131$'], correct: 0, cols: 1,
            explain: '$16\\,129{,}03$ أكبر من $16\\,129$ وأصغر من $16\\,130$ . الخطأ الثاني ينزل إلى مجال لا يضمّه، والثالث واسع بوحدتين.' },
          { kind: 'solution', ask: 0, lines: ['$T = 25\\,000 \\div 1{,}55 = 16\\,129{,}03\\ldots$ .', 'المدوّر إلى الدينار $16\\,129$ ، والحصر $16\\,129 < T < 16\\,130$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — كراريس سلمى',
    context: 'خواص المساويات على معادلة بسيطة',
    emoji: '📓',
    source: SOURCE,
    tone: 'sky',
    illustration: { kind: 'tags', cards: [
      { title: 'الكراريس', icon: 'book', lines: [{ label: 'العدد', value: 4 }, { label: 'ثمن الواحد', value: 'x', unit: 'DA' }] },
      { title: 'الدفع', icon: 'coin', lines: [{ label: 'ورقة نقدية', value: 200, unit: 'DA' }, { label: 'أعاد البائع', value: 32, unit: 'DA' }] },
    ], ariaLabel: 'بطاقتان: أربعة كراريس ثمن الواحد منها x دينارًا، وورقة من مئتي دينار أعاد البائع منها اثنين وثلاثين دينارًا' },
    statement: 'اشترت سلمى $4$ كراريس لها الثمن نفسه $x$ (بالدينار)، ودفعت ورقة من $200$ DA فأعاد لها البائع $32$ DA ، فكتبت $4x + 32 = 200$ .',
    data: [
      { id: 'count', text: 'اشترت 4 كراريس بثمن واحد x', useful: true },
      { id: 'paid', text: 'دفعت ورقة من 200 DA', useful: true },
      { id: 'back', text: 'أعاد لها البائع 32 DA', useful: true },
      { id: 'shop', text: 'المكتبة قرب المتوسطة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'طرح 32 من الطرفين',
        question: 'اكتب المساواة الناتجة عن طرح $32$ من طرفي $4x + 32 = 200$ .',
        asks: ['المساواة الناتجة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['musawiyat-amaliyat-3am'], prompt: 'المساواة الناتجة هي:', options: ['$4x = 168$', '$4x = 232$', '$4x + 32 - 32 = 200$'], correct: 0,
            explain: 'نطرح $32$ من الطرفين معًا: $4x + 32 - 32 = 200 - 32$ ، أي $4x = 168$ . الخطأ الثاني أضاف $32$ ، والثالث طرحها من طرف واحد فكسر المساواة.' },
          { kind: 'solution', ask: 0, lines: ['نطرح $32$ من الطرفين: $4x + 32 - 32 = 200 - 32$ .', 'فنجد $4x = 168$ .'] },
        ],
      },
      {
        label: '2)', title: 'ثمن ثمانية كراريس دون حساب $x$',
        question: 'استنتج من $4x = 168$ ثمن $8$ كراريس دون حساب $x$ .',
        asks: ['ثمن 8 كراريس'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['musawiyat-amaliyat-3am'], prompt: 'للانتقال من $4x$ إلى $8x$ نضرب الطرفين في:', options: ['$2$', '$4$', '$8$'], correct: 0,
            explain: '$4 \\times 2 = 8$ ، فنضرب الطرفين في $2$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['musawiyat-amaliyat-3am'], prompt: '$8x = 2 \\times 168 =$', expected: 336, suffix: 'DA', explain: 'نضرب الطرفين في $2$ : $8x = 2 \\times 168 = 336$ .' },
          { kind: 'solution', ask: 0, lines: ['نضرب طرفي $4x = 168$ في $2$ : $8x = 336$ .', 'ثمن $8$ كراريس $336$ DA .'] },
        ],
      },
      {
        label: '3)', title: 'ثمن الكرّاس',
        question: 'احسب ثمن كرّاس واحد.',
        asks: ['ثمن الكرّاس'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['muadalat-darajat-ula-3am'], prompt: 'نقسم طرفي $4x = 168$ على $4$ : $x =$', expected: 42, suffix: 'DA', explain: '$x = \\frac{168}{4} = 42$ .' },
          { kind: 'solution', ask: 0, lines: ['نقسم الطرفين على $4$ : $x = \\frac{168}{4}$ .', 'ثمن الكرّاس $42$ DA .'] },
        ],
      },
      {
        label: '4)', title: 'التحقّق',
        question: 'تحقّق بالتعويض: ما قيمة الطرف الأيسر $4x + 32$ عندما $x = 42$ ؟',
        asks: ['قيمة الطرف الأيسر'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['muadalat-darajat-ula-3am'], prompt: '$4 \\times 42 + 32 =$', expected: 200, suffix: 'DA', explain: '$168 + 32 = 200$ ، وهو الطرف الأيمن: $42$ حلّ.' },
          { kind: 'solution', ask: 0, lines: ['$4 \\times 42 + 32 = 168 + 32 = 200$ .', 'الطرفان متساويان، فثمن الكرّاس $42$ DA .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — رفّ التوابل',
    context: 'قراءة ميزان مدوَّر، حصر الكتلة وحصر الجداء، ثم القرار',
    emoji: '⚖️',
    source: SOURCE,
    tone: 'emerald',
    illustration: { kind: 'stacks', rows: [{ icon: 'jar', count: 12, label: 'علبة توابل على الرفّ' }], ariaLabel: 'اثنتا عشرة علبة توابل متماثلة موضوعة على رفّ' },
    statement: 'يكتب ميزان العطّار الكتلة مدوّرة إلى $0{,}1\\ \\mathrm{kg}$ ، وقد قرأ على علبة توابل $0{,}8\\ \\mathrm{kg}$ . يحمل الرفّ $10{,}5\\ \\mathrm{kg}$ على الأكثر، وكل العلب متماثلة الكتلة $m$ .',
    data: [
      { id: 'read', text: 'قراءة الميزان 0,8 kg مدوّرة إلى 0,1', useful: true },
      { id: 'cap', text: 'الرفّ يحمل 10,5 kg على الأكثر', useful: true },
      { id: 'same', text: 'العلب متماثلة الكتلة m', useful: true },
      { id: 'spice', text: 'التوابل من نوع الكمّون', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حصر كتلة العلبة',
        question: 'ما حصر الكتلة $m$ لعلبة واحدة؟',
        asks: ['حصر m'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-adad-ushri-3am'], prompt: 'القراءة $0{,}8$ مدوّرة إلى $0{,}1$ ، فـ $m$ محصورة بين:',
            options: ['$0{,}75 \\le m < 0{,}85$', '$0{,}8 \\le m < 0{,}9$', '$0{,}75 \\le m \\le 0{,}85$'], correct: 0, cols: 1,
            explain: 'العدد $m$ على بعد نصف رتبة ($0{,}05$) من $0{,}8$ : الحدّ الأدنى $0{,}75$ (داخل) والحدّ الأعلى $0{,}85$ (خارج). الخطأ الثاني عدّ التدوير حذفًا للأرقام، والثالث أدخل الحدّ الأعلى.' },
          { kind: 'solution', ask: 0, lines: ['القراءة $0{,}8$ مدوّرة إلى $0{,}1$ ، فنأخذ نصف الرتبة $0{,}05$ من كل جهة.', 'فنجد $0{,}75 \\le m < 0{,}85$ .'] },
        ],
      },
      {
        label: '2)', title: 'حصر كتلة اثنتي عشرة علبة',
        question: 'احسب الحدّين الأدنى والأعلى لـ $12m$ .',
        asks: ['الحدّ الأدنى', 'الحدّ الأعلى'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mutabayinat-amaliyat-3am'], prompt: 'نضرب الحصر في $12$ : الحدّ الأدنى $12 \\times 0{,}75 =$', expected: 9, suffix: 'kg', explain: 'الضرب في عدد موجب يحفظ الاتجاه: $12 \\times 0{,}75 = 9$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['mutabayinat-amaliyat-3am'], prompt: 'والحدّ الأعلى $12 \\times 0{,}85 =$', expected: 10.2, display: '10,2', suffix: 'kg', explain: '$12 \\times 0{,}85 = 10{,}2$ ، فـ $9 \\le 12m < 10{,}2$ .' },
          { kind: 'solution', ask: 0, lines: ['نضرب أطراف $0{,}75 \\le m < 0{,}85$ في $12$ : الاتجاه محفوظ.', 'فنجد $9 \\le 12m < 10{,}2$ .'] },
        ],
      },
      {
        label: '3)', title: 'اثنتا عشرة علبة على الرفّ',
        question: 'هل يمكن وضع $12$ علبة على الرفّ بأمان؟',
        asks: ['القرار'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mutabayinat-amaliyat-3am'], prompt: 'القرار:',
            options: ['نعم، لأنّ $12m < 10{,}2 < 10{,}5$', 'لا، لأنّ $12m$ قد تقترب من $10{,}5$ فلا نضمن شيئًا', 'لا نستطيع الحكم لأنّ $m$ غير معروفة'], correct: 0, cols: 1,
            explain: 'حتى أكبر قيمة ممكنة للكتلة، $10{,}2$ ، لا تتجاوز $10{,}5$ . الخطأ الثاني حكم بلا مقارنة، والثالث تجاهل الحصر الذي يكفي للقرار.' },
          { kind: 'solution', ask: 0, lines: ['كتلة الـ $12$ علبة أصغر تمامًا من $10{,}2\\ \\mathrm{kg}$ ، وهي أصغر من $10{,}5\\ \\mathrm{kg}$ .', 'يمكن وضعها بأمان.'] },
        ],
      },
      {
        label: '4)', title: 'ثلاث عشرة علبة',
        question: 'احسب الحدّين الأدنى والأعلى لـ $13m$ ، ثم قرّر: هل يمكن وضع $13$ علبة؟',
        asks: ['الحدّ الأدنى', 'الحدّ الأعلى', 'القرار'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mutabayinat-amaliyat-3am'], prompt: 'الحدّ الأدنى $13 \\times 0{,}75 =$', expected: 9.75, display: '9,75', suffix: 'kg', explain: '$13 \\times 0{,}75 = 9{,}75$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['mutabayinat-amaliyat-3am'], prompt: 'الحدّ الأعلى $13 \\times 0{,}85 =$', expected: 11.05, display: '11,05', suffix: 'kg', explain: '$13 \\times 0{,}85 = 11{,}05$ ، فـ $9{,}75 \\le 13m < 11{,}05$ .' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['mutabayinat-amaliyat-3am'], prompt: 'القرار:',
            options: ['لا نستطيع الجزم: $9{,}75 < 10{,}5 < 11{,}05$ ، فقد تكون الكتلة أقلّ من $10{,}5$ أو أكبر منها', 'نعم، لأنّ $9{,}75 < 10{,}5$', 'لا، لأنّ $11{,}05 > 10{,}5$'], correct: 0, cols: 1,
            explain: 'العدد $10{,}5$ يقع داخل الحصر: بعض الكتل الممكنة تقبلها الرفّ وبعضها لا. الخطأ الثاني نظر إلى الحدّ الأدنى وحده، والثالث نظر إلى الحدّ الأعلى وحده.' },
          { kind: 'solution', ask: 0, lines: ['$13 \\times 0{,}75 = 9{,}75$ و $13 \\times 0{,}85 = 11{,}05$ ، فـ $9{,}75 \\le 13m < 11{,}05$ .', 'الحمل المسموح $10{,}5$ يقع داخل هذا الحصر: لا يمكن الجزم.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — سيارة الأجرة',
    context: 'ثمن رحلة: قيمة عبارة ثم معادلة ثم شرط',
    emoji: '🚕',
    source: SOURCE,
    tone: 'violet',
    illustration: { kind: 'route', from: 'الانطلاق', to: 'الوجهة', distance: 'd', unit: 'km', vehicles: [{ icon: 'car' }], ariaLabel: 'طريق تقطعه سيارة أجرة من نقطة الانطلاق إلى الوجهة على مسافة d كيلومترًا' },
    statement: 'ثمن رحلة بسيارة أجرة هو $50 + 30d$ دينارًا، حيث $d$ المسافة المقطوعة بالكيلومتر.',
    data: [
      { id: 'fixed', text: 'ثمن ثابت 50 DA', useful: true },
      { id: 'rate', text: '30 DA لكل كيلومتر', useful: true },
      { id: 'driver', text: 'السائق يقود منذ سنوات', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ثمن رحلة معلومة',
        question: 'احسب ثمن رحلة مسافتها $7\\ \\mathrm{km}$ .',
        asks: ['ثمن الرحلة'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['muadalat-darajat-ula-3am'], prompt: '$50 + 30 \\times 7 =$', expected: 260, suffix: 'DA', explain: '$50 + 210 = 260$ .' },
          { kind: 'solution', ask: 0, lines: ['نعوّض $d = 7$ : $50 + 30 \\times 7 = 50 + 210$ .', 'ثمن الرحلة $260$ DA .'] },
        ],
      },
      {
        label: '2)', title: 'مسافة معلومة الثمن',
        question: 'دفع أمين $410$ DA . اكتب معادلة تترجم ذلك وأوجد المسافة التي قطعها.',
        asks: ['المعادلة', 'المسافة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muadalat-darajat-ula-3am'], prompt: 'المعادلة:', options: ['$50 + 30d = 410$', '$50 \\times 30d = 410$', '$30 + 50d = 410$'], correct: 0,
            explain: 'الثمن $50 + 30d$ يساوي المدفوع $410$ . الخطأ الثاني ضرب الحدّين، والثالث بدّل الثابت والمعامل.' },
          { kind: 'numeric', role: 'compute', requires: ['muadalat-darajat-ula-3am'], prompt: 'نطرح $50$ من الطرفين: $30d =$', expected: 360, explain: '$410 - 50 = 360$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['muadalat-darajat-ula-3am'], prompt: 'نقسم على $30$ : $d =$', expected: 12, suffix: 'km', explain: '$d = \\frac{360}{30} = 12$ .' },
          { kind: 'solution', ask: 0, lines: ['$50 + 30d = 410$ ، فـ $30d = 410 - 50 = 360$ .', 'فنقسم على $30$ : $d = 12$ كيلومترًا.'] },
        ],
      },
      {
        label: '3)', title: 'شرط على المسافة',
        question: 'مع أمين $500$ DA على الأكثر. اكتب الشرط، ثم استنتج متباينة طرفها الأول $d$ .',
        asks: ['الشرط', 'المتباينة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muadalat-darajat-ula-3am'], prompt: 'الشرط:', options: ['$50 + 30d \\le 500$', '$50 + 30d \\ge 500$', '$50 + 30d = 500$'], correct: 0,
            explain: 'يدفع أمين $500$ على الأكثر، فالثمن أصغر من $500$ أو يساويه. الخطأ الثاني عكس الاتجاه، والثالث يفرض التساوي.' },
          { kind: 'numeric', role: 'compute', requires: ['mutabayinat-amaliyat-3am'], prompt: 'نطرح $50$ من الطرفين: $30d \\le$', expected: 450, explain: 'الطرح يحفظ الاتجاه: $30d \\le 450$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['mutabayinat-amaliyat-3am'], prompt: 'نقسم على $30 > 0$ فيبقى الاتجاه: $d \\le$', expected: 15, suffix: 'km', explain: '$d \\le \\frac{450}{30} = 15$ .' },
          { kind: 'solution', ask: 0, lines: ['الشرط $50 + 30d \\le 500$ ، فـ $30d \\le 450$ .', 'نقسم على $30$ (موجب): $d \\le 15$ كيلومترًا.'] },
        ],
      },
      {
        label: '4)', title: 'القرار',
        question: 'هل يكفيه المبلغ لرحلة $16\\ \\mathrm{km}$ ؟',
        asks: ['ثمن رحلة 16 km', 'القرار'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['muadalat-darajat-ula-3am'], prompt: '$50 + 30 \\times 16 =$', expected: 530, suffix: 'DA', explain: '$50 + 480 = 530$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['mutabayinat-amaliyat-3am'], prompt: 'القرار:', options: ['لا: $530 > 500$ ، وهو ما يوافق الشرط $d \\le 15$', 'نعم: $16 > 15$', 'نعم: $530 > 500$'], correct: 0, cols: 1,
            explain: 'ثمن $530$ أكبر من $500$ المتوفّرة، و $16 > 15$ خارج الشرط. الخياران الآخران يقرآن المقارنة بالاتجاه المعاكس.' },
          { kind: 'solution', ask: 0, lines: ['رحلة $16\\ \\mathrm{km}$ تكلّف $50 + 30 \\times 16 = 530$ DA .', 'وهو أكبر من $500$ : لا يكفي المبلغ.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — غرفة التبريد',
    context: 'حصر عبارة تآلفية وانعكاس الاتجاه عند الضرب في عدد سالب',
    emoji: '❄️',
    source: SOURCE,
    tone: 'indigo',
    illustration: { kind: 'scene', icon: 'bottle', bg: 'blue', chips: [{ label: 'الحدّ الأدنى للحرارة', value: '−22°', tone: 'blue' }, { label: 'الحدّ الأعلى للحرارة', value: '−18°', tone: 'slate' }], ariaLabel: 'غرفة تبريد تبقى حرارتها بين سالب اثنتين وعشرين وسالب ثماني عشرة درجة مئوية' },
    statement: 'تبقى حرارة غرفة تبريد $T$ (بالدرجة المئوية) بين $-22$ و $-18$ ، أي $-22 \\le T \\le -18$ . نعطي الحرارة بالفهرنهايت $F = 1{,}8T + 32$ ، و«مؤشّر البرودة» $I = -2T + 10$ .',
    data: [
      { id: 'range', text: 'الحرارة T بين −22 و −18', useful: true },
      { id: 'F', text: 'F = 1,8T + 32', useful: true },
      { id: 'I', text: 'I = −2T + 10', useful: true },
      { id: 'brand', text: 'ماركة جهاز التبريد', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الحرارة بالفهرنهايت',
        question: 'احصر $1{,}8T$ ثم احصر $F$ .',
        asks: ['حصر 1,8T', 'حصر F'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mutabayinat-amaliyat-3am'], prompt: 'نضرب $-22 \\le T \\le -18$ في $1{,}8$ (عدد موجب):',
            options: ['$-39{,}6 \\le 1{,}8T \\le -32{,}4$', '$-32{,}4 \\le 1{,}8T \\le -39{,}6$', '$-22 \\le 1{,}8T \\le -18$'], correct: 0, cols: 1,
            explain: '$1{,}8 \\times (-22) = -39{,}6$ و $1{,}8 \\times (-18) = -32{,}4$ ، والاتجاه محفوظ. الخطأ الثاني عكس الترتيب بلا سبب (الأصغر يبقى على اليسار)، والثالث نسي الضرب.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['mutabayinat-amaliyat-3am'], prompt: 'نضيف $32$ إلى الأطراف الثلاثة:',
            options: ['$-7{,}6 \\le F \\le -0{,}4$', '$-71{,}6 \\le F \\le -64{,}4$', '$-7{,}6 \\le F \\le 0{,}4$'], correct: 0, cols: 1,
            explain: '$-39{,}6 + 32 = -7{,}6$ و $-32{,}4 + 32 = -0{,}4$ . الخطأ الثاني طرح $32$ ، والثالث أخطأ في إشارة الحدّ الأعلى.' },
          { kind: 'solution', ask: 0, lines: ['$-39{,}6 \\le 1{,}8T \\le -32{,}4$ بالضرب في $1{,}8$ .', 'ثم نضيف $32$ : $-7{,}6 \\le F \\le -0{,}4$ .'] },
        ],
      },
      {
        label: '2)', title: 'مؤشّر البرودة',
        question: 'احصر $I = -2T + 10$ : ما أصغر قيمة له وما أكبر قيمة؟',
        asks: ['أصغر قيمة لـ I', 'أكبر قيمة لـ I'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['mutabayinat-amaliyat-3am'], prompt: 'الضرب في $-2$ (عدد سالب) على $-22 \\le T \\le -18$ يجعل:', options: ['$36 \\le -2T \\le 44$', '$44 \\le -2T \\le 36$', '$-44 \\le -2T \\le -36$'], correct: 0,
            explain: '$-2 \\times (-18) = 36$ و $-2 \\times (-22) = 44$ ، وينعكس الاتجاه: الأصغر صار $36$ . الخطأ الثاني نسي انعكاس الاتجاه، والثالث أخطأ في الإشارة.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mutabayinat-amaliyat-3am'], prompt: 'أصغر قيمة: $36 + 10 =$', expected: 46, explain: 'نضيف $10$ : $46 \\le I$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['mutabayinat-amaliyat-3am'], prompt: 'أكبر قيمة: $44 + 10 =$', expected: 54, explain: '$I \\le 54$ ، فـ $46 \\le I \\le 54$ .' },
          { kind: 'solution', ask: 0, lines: ['بالضرب في $-2$ ينعكس الاتجاه: $36 \\le -2T \\le 44$ .', 'ثم نضيف $10$ : $46 \\le I \\le 54$ .'] },
        ],
      },
      {
        label: '3)', title: 'حكم زميل',
        question: 'قال زميل: «كلّما انخفضت الحرارة $T$ انخفض المؤشّر $I$ ». هل هو محقّ؟',
        asks: ['الحكم'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mutabayinat-amaliyat-3am'], prompt: 'الحكم:',
            options: ['خطأ: الضرب في $-2$ يعكس الترتيب، فكلّما انخفضت $T$ ارتفع $I$ ($T = -22$ يعطي $I = 54$ و $T = -18$ يعطي $I = 46$)', 'صحيح: لأنّ $T$ تنخفض و $I$ مرتبطة بها', 'صحيح: لأنّ الضرب يحفظ الترتيب دائمًا'], correct: 0, cols: 1,
            explain: 'عند $T = -22$ نجد $I = 54$ ، وهو أكبر من $I = 46$ عند $T = -18$ : المؤشّر يرتفع حين تنخفض الحرارة.' },
          { kind: 'solution', ask: 0, lines: ['$T = -22$ يعطي $I = -2 \\times (-22) + 10 = 54$ ، و $T = -18$ يعطي $I = 46$ .', 'الحرارة الأدنى أعطت مؤشّرًا أكبر: ادّعاء الزميل خاطئ.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — أعمار العائلة',
    context: 'معادلة بمجهول في طرفيها، ثم الشرط الذي ينتج عنه',
    emoji: '⏳',
    source: SOURCE,
    tone: 'rose',
    illustration: { kind: 'timeline', icon: 'person', marks: [
      { label: 'اليوم: الأب', value: '41 سنة' },
      { label: 'اليوم: الابن', value: '9 سنوات' },
      { label: 'بعد n سنة', value: 'n' },
    ], ariaLabel: 'خط زمني: عمر الأب اليوم واحد وأربعون سنة وعمر ابنه تسع سنوات، وبعد n سنة يزيد عمر كل منهما بـ n' },
    statement: 'عمر الأب $41$ سنة وعمر ابنه $9$ سنوات. بعد $n$ سنة يصير عمرهما $41 + n$ و $9 + n$ .',
    data: [
      { id: 'father', text: 'عمر الأب اليوم 41 سنة', useful: true },
      { id: 'son', text: 'عمر الابن اليوم 9 سنوات', useful: true },
      { id: 'years', text: 'بعد n سنة يزيد عمر كل منهما بـ n', useful: true },
      { id: 'job', text: 'الابن يلعب كرة القدم', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'متى يكون الأب ثلاثة أمثال ابنه؟',
        question: 'اكتب معادلة تترجم: بعد $n$ سنة يكون عمر الأب ثلاثة أمثال عمر ابنه، ثم احسب $n$ .',
        asks: ['المعادلة', 'عدد السنوات n'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muadalat-darajat-ula-3am'], prompt: 'المعادلة:', options: ['$41 + n = 3(9 + n)$', '$41 + n = 3 \\times 9 + n$', '$41 = 3(9 + n)$'], correct: 0, cols: 1,
            explain: 'ثلاثة أمثال عمر الابن بعد $n$ سنة هو $3(9 + n)$ ، والضرب يشمل الحدّين. الخطأ الثاني نسي أنّ $3$ تضرب $n$ أيضًا، والثالث لم يضف $n$ إلى عمر الأب.' },
          { kind: 'numeric', role: 'compute', requires: ['muadalat-darajat-ula-3am'], prompt: 'نفكّ الجداء: $41 + n = 27 + 3n$ . نجمع الأعداد في طرف والمجهول في الآخر: $41 - 27 =$', expected: 14, explain: 'نطرح $n$ و $27$ من الطرفين: $41 - 27 = 3n - n$ ، أي $14 = 2n$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['muadalat-darajat-ula-3am'], prompt: 'من $14 = 2n$ نقسم على $2$ : $n =$', expected: 7, suffix: 'سنوات', explain: '$n = \\frac{14}{2} = 7$ .' },
          { kind: 'solution', ask: 0, lines: ['$41 + n = 3(9 + n)$ ، أي $41 + n = 27 + 3n$ .', 'فنجد $14 = 2n$ ، أي $n = 7$ سنوات.'] },
        ],
      },
      {
        label: '2)', title: 'التحقّق',
        question: 'تحقّق: ما عمر كل منهما بعد $7$ سنوات؟',
        asks: ['عمر الأب', 'عمر الابن'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['muadalat-darajat-ula-3am'], prompt: 'عمر الأب $41 + 7 =$', expected: 48, suffix: 'سنة', explain: '$41 + 7 = 48$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['muadalat-darajat-ula-3am'], prompt: 'عمر الابن $9 + 7 =$', expected: 16, suffix: 'سنة', explain: '$9 + 7 = 16$ ، و $3 \\times 16 = 48$ : عمر الأب ثلاثة أمثال عمر ابنه.' },
          { kind: 'solution', ask: 0, lines: ['بعد $7$ سنوات عمر الأب $48$ وعمر الابن $16$ .', '$3 \\times 16 = 48$ : الحلّ مقبول.'] },
        ],
      },
      {
        label: '3)', title: 'متى يصير الأب أقلّ من ضعف ابنه؟',
        question: 'اكتب الشرط على $n$ ليكون عمر الأب أقلّ من ضعف عمر ابنه، ثم عيّن أصغر عدد صحيح من السنوات يحقّقه.',
        asks: ['الشرط على n', 'أصغر عدد صحيح'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['muadalat-darajat-ula-3am'], prompt: 'نترجم الشرط:', options: ['$41 + n < 2(9 + n)$', '$41 + n > 2(9 + n)$', '$41 + n < 2 \\times 9 + n$'], correct: 0, cols: 1,
            explain: 'عمر الأب $41 + n$ أصغر من ضعف عمر ابنه $2(9 + n)$ . الخطأ الثاني عكس الاتجاه، والثالث نسي أنّ $2$ تضرب $n$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mutabayinat-amaliyat-3am'], prompt: 'نبسّط: $41 + n < 18 + 2n$ ، فنطرح $n$ و $18$ من الطرفين:', options: ['$23 < n$', '$n < 23$', '$23 < 3n$'], correct: 0,
            explain: 'الطرح يحفظ الاتجاه: $41 - 18 < 2n - n$ ، أي $23 < n$ . الخطأ الثاني عكس الاتجاه، والثالث جمع $n$ بدل طرحها.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['mutabayinat-amaliyat-3am'], prompt: 'أصغر عدد صحيح $n$ يحقّق $n > 23$ :', expected: 24, suffix: 'سنة', explain: 'العدد $23$ نفسه لا يحقّق «أكبر تمامًا من $23$ »، فأصغر عدد صحيح هو $24$ .' },
          { kind: 'solution', ask: 0, lines: ['$41 + n < 2(9 + n)$ ، أي $41 + n < 18 + 2n$ ، فـ $23 < n$ .', 'أصغر عدد صحيح من السنوات يحقّق ذلك هو $24$ .'] },
        ],
      },
      {
        label: '4)', title: 'عند ثلاث وعشرين سنة',
        question: 'احسب عمر الأب وضعف عمر الابن عندما $n = 23$ . ماذا تلاحظ؟',
        asks: ['عمر الأب', 'ضعف عمر الابن', 'الملاحظة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['muadalat-darajat-ula-3am'], prompt: 'عمر الأب $41 + 23 =$', expected: 64, suffix: 'سنة', explain: '$41 + 23 = 64$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['muadalat-darajat-ula-3am'], prompt: 'ضعف عمر الابن $2 \\times (9 + 23) =$', expected: 64, suffix: 'سنة', explain: '$2 \\times 32 = 64$ .' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['mutabayinat-amaliyat-3am'], prompt: 'نلاحظ أنّ:', options: ['العددين متساويان، فالمتباينة «أقلّ تمامًا» غير محقّقة عند $23$', 'عمر الأب أقلّ من ضعف ابنه عند $23$', 'عمر الأب أكبر من ضعف ابنه عند $23$'], correct: 0, cols: 1,
            explain: 'القيمتان $64$ و $64$ متساويتان، والمتباينة صارمة ($<$)، فلا يحقّقها $n = 23$ ؛ نبدأ من $n > 23$ .' },
          { kind: 'solution', ask: 0, lines: ['عند $n = 23$ : $41 + 23 = 64$ و $2 \\times (9 + 23) = 64$ .', 'العددان متساويان: «أقلّ تمامًا» تتحقّق ابتداءً من $n > 23$ .'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
