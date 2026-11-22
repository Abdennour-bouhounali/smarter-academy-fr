/**
 * Les exercices du درس « جداء كسرين » (module 4 أتمرّن) : six exercices de la plateforme, chacun reprend l'IDÉE d'un élément du manuel (`src`) avec d'AUTRES nombres et d'autres
 * contextes. Les erreurs sont corrigées, jamais comptées ; chaque clé est recalculée dans ./content.test.js (arithmétique indépendante, BigInt).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '2am_jida-kasrayn_P1',
  P2: '2am_jida-kasrayn_P2',
  P3: '2am_jida-kasrayn_P3',
};

export const EXERCISES = [
  {
    id: 'ex-1', source: src('act-5', 25, 'أنشطة', 5), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'لوح حلوى مستطيل بُعداه $11$ cm و $4$ cm ، قُسّم إلى $5\\times 3$ قطع متماثلة ($5$ قطع في الطول و $3$ في العرض).',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'طول قطعة واحدة (cm)', options: ['$\\frac{11}{5}$', '$\\frac{5}{11}$', '$11-5$'], correct: 0, correction: 'نقسم الطول $11$ على $5$ قطع: $\\frac{11}{5}$ cm .' },
        { label: 'عرض قطعة واحدة (cm)', options: ['$\\frac{4}{3}$', '$\\frac{3}{4}$', '$4-3$'], correct: 0, correction: 'نقسم العرض $4$ على $3$ قطع: $\\frac{4}{3}$ cm .' },
        { label: 'مساحة قطعة واحدة (cm²)، بجداء الطول في العرض', options: ['$\\frac{44}{15}$', '$\\frac{15}{44}$', '$\\frac{15}{15}$'], correct: 0, correction: '$\\frac{11}{5}\\times\\frac{4}{3}=\\frac{11\\times 4}{5\\times 3}=\\frac{44}{15}$ cm² .' },
        { label: 'مساحة اللوح كلّه $44$ cm² موزّعة على $15$ قطعة متماثلة: مساحة القطعة', options: ['$44\\div 15=\\frac{44}{15}$', '$44\\times 15$', '$\\frac{15}{44}$'], correct: 0, correction: 'الطريقة الثانية: $44\\div 15=\\frac{44}{15}$ ، وهي النتيجة نفسها.' },
      ],
      explain: 'مساحة القطعة هي الطول × العرض $=\\frac{11}{5}\\times\\frac{4}{3}$ ، وهي أيضًا مساحة اللوح مقسومة على عدد القطع.',
    },
    commonError: 'جمع الكسرين بدل ضربهما: $\\frac{11}{5}+\\frac{4}{3}$ .',
  },
  {
    id: 'ex-2', source: src('ex-15', 31, 'أوظّف تعلّماتي', 15), alsoSource: [src('ex-16', 31, 'أوظّف تعلّماتي', 16), src('ex-17', 31, 'أوظّف تعلّماتي', 17), src('ex-18', 31, 'أوظّف تعلّماتي', 18)], learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'احسب كلًّا مما يلي ثم أعط النتيجة على أبسط شكل.',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$\\frac{3}{7}\\times\\frac{5}{2}$', options: ['$\\frac{15}{14}$', '$\\frac{8}{9}$', '$\\frac{15}{9}$'], correct: 0, correction: '$\\frac{3\\times 5}{7\\times 2}=\\frac{15}{14}$ ، وهي مختزلة.' },
        { label: '$\\frac{9}{4}\\times\\frac{2}{3}$', options: ['$\\frac{3}{2}$', '$\\frac{9}{2}$', '$\\frac{11}{7}$'], correct: 0, correction: '$\\frac{18}{12}$ ثم نقسم الحدّين على $6$ : $\\frac{3}{2}$ .' },
        { label: '$\\frac{1}{6}\\times\\frac{30}{7}$', options: ['$\\frac{5}{7}$', '$\\frac{30}{7}$', '$\\frac{31}{13}$'], correct: 0, correction: '$\\frac{30}{42}$ ثم نقسم الحدّين على $6$ : $\\frac{5}{7}$ .' },
        { label: '$\\frac{7}{10}\\times\\frac{15}{14}$', options: ['$\\frac{3}{4}$', '$\\frac{7}{4}$', '$\\frac{22}{24}$'], correct: 0, correction: '$\\frac{105}{140}$ ثم نقسم الحدّين على $35$ : $\\frac{3}{4}$ .' },
      ],
      explain: 'نضرب البسطين والمقامين ثم نختزل بقسمة الحدّين على قاسمهما المشترك الأكبر.',
    },
    commonError: 'ترك الناتج دون اختزال، أو جمع البسطين والمقامين.',
  },
  {
    id: 'ex-3', source: src('ex-19', 31, 'أوظّف تعلّماتي', 19), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'من بين الجداءات الأربعة التالية ثلاثة تعطي العدد نفسه. احسب كلًّا منها ثم عيّن الدخيل.',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$\\frac{3}{2}\\times\\frac{4}{9}\\times 3$', options: ['$2$', '$\\frac{3}{2}$', '$3$'], correct: 0, correction: '$\\frac{3\\times 4\\times 3}{2\\times 9\\times 1}=\\frac{36}{18}=2$ .' },
        { label: '$\\frac{1}{4}\\times\\frac{8}{3}\\times 3$', options: ['$2$', '$\\frac{3}{2}$', '$\\frac{8}{12}$'], correct: 0, correction: '$\\frac{1\\times 8\\times 3}{4\\times 3\\times 1}=\\frac{24}{12}=2$ .' },
        { label: '$\\frac{5}{6}\\times\\frac{12}{5}$', options: ['$2$', '$\\frac{3}{2}$', '$\\frac{17}{11}$'], correct: 0, correction: '$\\frac{60}{30}=2$ .' },
        { label: '$\\frac{2}{5}\\times\\frac{5}{4}\\times 3$', options: ['$\\frac{3}{2}$', '$2$', '$3$'], correct: 0, correction: '$\\frac{2\\times 5\\times 3}{5\\times 4\\times 1}=\\frac{30}{20}=\\frac{3}{2}$ .' },
        { label: 'الجداء الدخيل (نتيجته تخالف الباقي)', options: ['الأوّل', 'الثاني', 'الثالث', 'الرابع'], correct: 3, correction: 'الثلاثة الأولى تساوي $2$ ، والرابع $\\frac{3}{2}$ : هو الدخيل.' },
      ],
      explain: 'لجداء ثلاثة عوامل نضرب البسوط معًا والمقامات معًا ثم نختزل.',
    },
    commonError: 'نسيان أنّ العدد الطبيعي مقامه $1$ .',
  },
  {
    id: 'ex-4', source: src('ex-26', 32, 'أوظّف تعلّماتي', 26), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'علبة هدايا على شكل متوازي مستطيلات أبعادها $\\frac{7}{2}$ dm و $\\frac{4}{3}$ dm و $\\frac{3}{7}$ dm .',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'مساحة القاعدة $\\frac{7}{2}\\times\\frac{4}{3}$ (dm²)', options: ['$\\frac{14}{3}$', '$\\frac{11}{5}$', '$\\frac{28}{5}$'], correct: 0, correction: '$\\frac{28}{6}=\\frac{14}{3}$ dm² .' },
        { label: 'الحجم (dm³)', options: ['$2$', '$\\frac{14}{9}$', '$\\frac{42}{3}$'], correct: 0, correction: '$\\frac{14}{3}\\times\\frac{3}{7}=\\frac{42}{21}=2$ dm³ .' },
        { label: 'هل الحجم عدد طبيعي؟', options: ['نعم', 'لا'], correct: 0, correction: 'نعم: $\\frac{42}{21}=2$ ، فالحجم $2$ dm³ أي لتران.' },
      ],
      explain: 'الحجم هو جداء الأبعاد الثلاثة: نضرب البسوط ونضرب المقامات ثم نختزل.',
    },
    commonError: 'جمع الأبعاد بدل ضربها.',
  },
  {
    id: 'ex-5', source: src('ex-27', 32, 'أوظّف تعلّماتي', 27), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'حقل مستطيل طوله $90$ m وعرضه $\\frac{4}{9}$ من طوله.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'عرض الحقل (m)', options: ['$40$', '$\\frac{4}{90}$', '$94$'], correct: 0, correction: '$\\frac{4}{9}\\times 90=\\frac{360}{9}=40$ m .' },
        { label: 'محيط الحقل (m)', options: ['$260$', '$130$', '$3600$'], correct: 0, correction: '$2\\times(90+40)=260$ m .' },
        { label: 'مساحة الحقل (m²)', options: ['$3600$', '$260$', '$130$'], correct: 0, correction: '$90\\times 40=3600$ m² .' },
      ],
      explain: '«$\\frac{4}{9}$ من الطول» تعني $\\frac{4}{9}\\times$ الطول.',
    },
    commonError: 'قسمة الطول على $\\frac{4}{9}$ بدل ضربه فيه.',
  },
  {
    id: 'ex-6', source: src('self-12', 33, 'أؤكّد تعلّماتي', 12), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'نصف وضعف وثلث: ترجم كلّ عبارة إلى جداء ثم احسبه.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'نصف $\\frac{10}{11}$', options: ['$\\frac{5}{11}$', '$\\frac{10}{22}\\times 2$', '$\\frac{20}{11}$'], correct: 0, correction: '$\\frac{1}{2}\\times\\frac{10}{11}=\\frac{10}{22}=\\frac{5}{11}$ .' },
        { label: 'ضعف $\\frac{5}{22}$', options: ['$\\frac{5}{11}$', '$\\frac{5}{44}$', '$\\frac{10}{44}\\times 2$'], correct: 0, correction: '$2\\times\\frac{5}{22}=\\frac{10}{22}=\\frac{5}{11}$ .' },
        { label: 'ثلث $\\frac{9}{14}$', options: ['$\\frac{3}{14}$', '$\\frac{27}{14}$', '$\\frac{9}{42}\\times 3$'], correct: 0, correction: '$\\frac{1}{3}\\times\\frac{9}{14}=\\frac{9}{42}=\\frac{3}{14}$ .' },
      ],
      explain: 'نصف عدد هو $\\frac{1}{2}\\times$ العدد، وثلثه $\\frac{1}{3}\\times$ العدد، وضعفه $2\\times$ العدد.',
    },
    commonError: 'قسمة البسط على $2$ دون المقام، أو الخلط بين النصف والضعف.',
  },
  {
    id: 'ex-7', source: src('deep-42', 35, 'أتعمّق', 42), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'قاعة عرض في دار الثقافة فيها $450$ مقعدًا، وقد شغل الحاضرون $\\frac{4}{9}$ منها يوم افتتاح معرض الكتاب.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'عدد المقاعد المشغولة', options: ['$200$', '$\\frac{4}{450}$', '$454$'], correct: 0, correction: '$\\frac{4}{9}\\times 450=\\frac{1800}{9}=200$ مقعدًا.' },
        { label: 'الجزء الذي بقي فارغًا من القاعة', options: ['$\\frac{5}{9}$', '$\\frac{4}{9}$', '$\\frac{9}{5}$'], correct: 0, correction: '$1-\\frac{4}{9}=\\frac{9}{9}-\\frac{4}{9}=\\frac{5}{9}$ .' },
        { label: 'عدد المقاعد الفارغة', options: ['$250$', '$200$', '$\\frac{5}{450}$'], correct: 0, correction: '$\\frac{5}{9}\\times 450=250$ ، وهو أيضًا $450-200$ .' },
      ],
      explain: '«$\\frac{4}{9}$ من $450$» تعني $\\frac{4}{9}\\times 450$ ؛ والباقي هو $1-\\frac{4}{9}$ من القاعة.',
    },
    commonError: 'قسمة العدد على البسط أو إهمال المقام.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
