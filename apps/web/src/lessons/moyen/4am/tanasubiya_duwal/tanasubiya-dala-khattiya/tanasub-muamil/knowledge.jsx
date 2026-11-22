import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, ACTIVITY } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس 1 « التناسبية ومعامل التناسبية » — SOURCE UNIQUE. Le manuel n'a pas
 * d'encadré « معارف » de proportionnalité dans cette unité : chaque item est un RAPPEL déclaré de la
 * plateforme (content/textbook.js › KNOWLEDGE, `addition('prior_year_reminder')`).
 *
 *   module 1 (الرحلة)  jadwal-tanasub — nommé après les colonnes de l'élève (y ÷ x constant) ;
 *   module 2 (معارف)   muamil-tanasub, khawass-tanasub, rabi-mutanasib, mablagh-thabit, y-ax.
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'jadwal-tanasub', type: 'concepts', title: 'جدول التناسبية',
        memo: {
          rule: `\\dfrac{y}{x}=${R('a')}`,
          hook: 'نفس العدد يضرب السطر الأول',
          example: `\\dfrac{30}{2}=\\dfrac{75}{5}=${R('15')}`,
          trap: 'ازدياد الأعداد وحده لا يصنع جدول تناسبية',
          exam: 'احسب حاصل القسمة في كل عمود ثم قارن الحواصل',
          chip: `\\tfrac{y}{x}=${R('a')}`,
          quiz: [
            { q: 'سطر أول: $2$ و $4$ و $6$ وسطر ثانٍ: $6$ و $12$ و $18$. كل عدد في السطر الثاني يساوي مقابله مضروبًا في:', options: ['$3$', '$4$', '$6$'], correct: 0 },
            { q: 'في رحلات بـ 15DA للدقيقة، حاصل قسمة السعر على المدة هو:', options: ['$15$', '$\\frac{1}{15}$', '$30$'], correct: 0 },
          ],
        },
        predictPrompt: 'في جدول رحلاتك بـ 15 دج للدقيقة: دقيقتان بـ 30 دج، و 5 دقائق بـ 75 دج، و 10 دقائق بـ 150 دج. كيف تحصل على كل سعر من المدة المقابلة له؟ اكتب بكلماتك متى نقول إنّ جدولًا من سطرين «جدول تناسبية».',
        summary: 'في جدول تناسبية نحصل على كل عدد من السطر الثاني بضرب العدد المقابل له من السطر الأول في العدد نفسه، وهذا العدد هو معامل التناسبية.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.jadwal.definition}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.jadwal.example}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'muamil-tanasub', type: 'methodes', title: 'حساب معامل التناسبية',
        memo: {
          rule: `a=\\dfrac{${R('y')}}{${R('x')}}`,
          hook: 'اقسم السطر الثاني على الأول',
          example: `\\dfrac{40}{50}=\\dfrac{80}{100}=${R('0{,}8')}`,
          trap: 'لا تقسم الأول على الثاني فتقلب المعامل',
          exam: 'اكتب الحاصل في كل عمود ثم استنتج أنها متساوية',
          chip: `a=\\tfrac{${R('y')}}{${R('x')}}`,
          quiz: [
            { q: 'جدول: $x$ هو $5$ و $10$ و $y$ هو $20$ و $40$. معامل التناسبية:', options: ['$4$', '$\\frac{1}{4}$', '$15$'], correct: 0 },
            { q: 'في تخفيض العيد صار ثمن 50DA هو 40DA. المعامل:', options: ['$0{,}8$', '$1{,}25$', '$10$'], correct: 0 },
          ],
        },
        predictPrompt: 'في تخفيض العيد صار ثمن 50 دج 40 دج، و 100 دج صار 80 دج، و 200 دج صار 160 دج. أمامك جدول من سطرين لا تعرف هل هو جدول تناسبية: أيّ حساب تجريه في كل عمود لتقرّر؟ وكيف تجد عندئذ معامل التناسبية؟ اكتب الطريقة.',
        summary: 'نقسم كل عدد من السطر الثاني على العدد المقابل له من السطر الأول: إذا تساوت كل الحواصل فالجدول جدول تناسبية، والحاصل المشترك هو معامل التناسبية.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.muamil.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.muamil.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'khawass-tanasub', type: 'regles', title: 'خواص جدول التناسبية',
        memo: {
          rule: `k\\times x\\to ${R('k\\times y')}`,
          hook: 'جمع العمودين عمود وضرب العمود عمود',
          example: `2+5\\to ${R('30+75=105')}`,
          trap: 'اجمع الأول مع الأول والثاني مع الثاني',
          exam: 'اذكر الخاصية المستعملة قبل كل حساب',
          chip: `x_1+x_2\\to ${R('y_1+y_2')}`,
          quiz: [
            { q: 'دقيقتان بـ 30DA و 5 دقائق بـ 75DA في جدول تناسبية. سعر 7 دقائق:', options: ['$105$', '$37$', '$2250$'], correct: 0 },
            { q: 'في الجدول نفسه 10 دقائق بـ 150DA. سعر 30 دقيقة:', options: ['$450$', '$160$', '$300$'], correct: 0 },
          ],
        },
        summary: 'في جدول تناسبية مجموع عمودين عمود من الجدول، وضرب عمود في عدد يعطي عمودا من الجدول.',
        body: (
          <div className="space-y-2">
            {KNOWLEDGE.khawass.lines.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.khawass.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'rabi-mutanasib', type: 'methodes', title: 'الرابع المتناسب',
        memo: {
          rule: `y=x\\times ${R('a')}`,
          hook: 'اضرب في المعامل أو في الجداءين المتصالبين',
          example: `12\\times${R('15')}=180`,
          trap: 'لا نضيف فرق عمودين بدل الضرب',
          exam: 'اكتب المعامل أولًا ثم السطر الذي يعطي العدد الناقص',
          chip: `y_2=\\tfrac{y_1\\times x_2}{x_1}`,
          quiz: [
            { q: 'في جدول تناسبية: $2 \\to 30$. ما العدد المقابل لـ $12$ ؟', options: ['$180$', '$40$', '$360$'], correct: 0 },
            { q: 'إذا كان $\\frac{3}{6}=\\frac{5}{y}$ فإنّ $y =$', options: ['$10$', '$8$', '$30$'], correct: 0 },
          ],
        },
        predictPrompt: 'رحلة دقيقتين بالتروتينة كلّفت 30 دج. كيف تجد سعر رحلة مدتها 12 دقيقة دون أن تركبها؟ اكتب طريقة لإكمال عمود ناقص في جدول تناسبية، وإن وجدت طريقة ثانية فاكتبها أيضًا.',
        summary: 'نكمل عمودا ناقصا في جدول تناسبية بالضرب في معامل التناسبية، أو بتساوي الجداءين المتصالبين.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.rabi.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.rabi.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'mablagh-thabit', type: 'regles', title: 'مبلغ ثابت يكسر التناسبية',
        memo: {
          rule: `x=0\\Rightarrow y\\neq ${R('0')}`,
          hook: 'مبلغ ثابت يكسر التناسبية',
          example: `\\dfrac{60}{1}=60\\neq\\dfrac{100}{5}=${R('20')}`,
          trap: 'ازدياد السعر وحده لا يعني التناسبية',
          exam: 'أثبت عدم التناسبية بحاصلين مختلفين أو بعمود الصفر',
          chip: `x=0\\to y\\neq ${R('0')}`,
          quiz: [
            { q: 'صيغة: 50DA لفتح القفل + 10DA للدقيقة. سعر رحلة مدتها 0 دقيقة:', options: ['$50$', '$0$', '$10$'], correct: 0 },
            { q: 'صيغة يزداد سعرها دائمًا مع المدة. متى نحكم أنها ليست تناسبية؟', options: ['إذا اختلفت حواصل القسمة $y \\div x$', 'إذا ازداد السعر', 'إذا كانت المدة أكبر من 0'], correct: 0 },
          ],
        },
        predictPrompt: 'في الصيغة (ب) يزداد السعر كلما ازدادت المدة، لكن انظر إلى سعر 0 دقيقة (50 دج) وإلى حواصل القسمة 60 ، 35 ، 20 في الجدول. ماذا تستنتج عن وضعية فيها مبلغ يُدفع مهما كانت المدة؟ اكتب القاعدة.',
        summary: 'إذا أضيف مبلغ ثابت يُدفع في كل الحالات فالوضعية ليست تناسبية: من أجل الصفر لا يكون الناتج صفرا، وحواصل القسمة تتغيّر ولو ازداد الناتج.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.mablagh.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.mablagh.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'y-ax', type: 'memoriser', title: 'العلاقة بين السطرين',
        memo: {
          rule: `y=${R('a')}\\times x`,
          hook: 'السطر الثاني هو المعامل ضرب الأول',
          example: `y=${R('15')}\\times 12=180`,
          trap: 'لا تجمع المعامل مع المدة بل اضربه فيها',
          exam: 'اكتب العلاقة بمعاملها ثم عوّض المدة',
          chip: `y=${R('a')}x`,
          quiz: [
            { q: 'معامل جدول تناسبية هو 15. العدد المقابل لـ $x = 4$ :', options: ['$60$', '$19$', '$\\frac{4}{15}$'], correct: 0 },
            { q: 'معامل جدول تناسبية هو $0{,}8$. العدد المقابل لـ $150$ :', options: ['$120$', '$150{,}8$', '$187{,}5$'], correct: 0 },
          ],
        },
        predictPrompt: 'في رحلاتك كان $\\dfrac{y}{x} = 15$ في كل عمود، وفي تخفيض العيد كان المعامل $0{,}8$. في جدول تناسبية معامله $a$ ، اكتب بمساواة واحدة كيف تحصل على $y$ من $x$.',
        summary: 'في جدول تناسبية معامله a نحصل على y بضرب x في a ، ونكتب العلاقة بين السطرين: y يساوي a ضرب x.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.yax.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.yax.example}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{ACTIVITY.closing}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
