/**
 * Les exercices du درس « جمع وطرح كسرين » (module 4 أتمرّن) : six exercices de la plateforme, chacun reprend l'IDÉE d'un élément du manuel (`src`) avec d'AUTRES nombres et d'autres
 * contextes. Les erreurs sont corrigées, jamais comptées ; chaque clé est recalculée dans ./content.test.js (arithmétique indépendante, BigInt).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '2am_jam-tarh-kusur_P1',
  P2: '2am_jam-tarh-kusur_P2',
  P3: '2am_jam-tarh-kusur_P3',
};

export const EXERCISES = [
  {
    id: 'ex-1', source: src('act-4', 24, 'أنشطة', 4), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'لوّحة مستطيلة من $20$ مربّعًا متساويًا، لُوِّن منها $7$ مربّعات بالأزرق و $6$ مربّعات بالأصفر.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'الكسر الملوّن بالأزرق', options: ['$\\frac{7}{20}$', '$\\frac{7}{13}$', '$\\frac{20}{7}$'], correct: 0, correction: '$7$ مربّعات من $20$ : $\\frac{7}{20}$ .' },
        { label: 'الجزء الملوّن بالأزرق والأصفر معًا', options: ['$\\frac{13}{20}$', '$\\frac{13}{40}$', '$\\frac{42}{20}$'], correct: 0, correction: 'الأجزاء متساوية: نجمع البسطين ونحافظ على المقام: $\\frac{7+6}{20}=\\frac{13}{20}$ .' },
        { label: 'الجزء غير الملوّن', options: ['$\\frac{7}{20}$', '$\\frac{13}{20}$', '$\\frac{7}{40}$'], correct: 0, correction: '$1-\\frac{13}{20}=\\frac{20}{20}-\\frac{13}{20}=\\frac{7}{20}$ .' },
      ],
      explain: 'المربّعات كلّها من الحجم نفسه، فنجمع عددها ونبقي على العدد $20$ مقامًا.',
    },
    commonError: 'جمع المقامين أيضًا: $\\frac{7}{20}+\\frac{6}{20}=\\frac{13}{40}$ .',
  },
  {
    id: 'ex-2', source: src('act-4', 24, 'أنشطة', 4), alsoSource: [src('ex-29', 32, 'أوظّف تعلّماتي', 29)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'يصل سمير إلى مدرسته في رحلة تمرّ بمحطّتين: قطع $\\frac{5}{16}$ من الطريق بالحافلة و $\\frac{3}{8}$ منه بالقطار، والباقي سيرًا على الأقدام.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'العملية التي تعطي ما قطعه بالحافلة والقطار', options: ['جمع', 'طرح', 'ضرب'], correct: 0, correction: 'الجزءان متتابعان على الطريق نفسه: نجمعهما.' },
        { label: 'ما قطعه بالحافلة والقطار', options: ['$\\frac{11}{16}$', '$\\frac{8}{24}$', '$\\frac{11}{8}$'], correct: 0, correction: '$\\frac{3}{8}=\\frac{6}{16}$ لأنّ $16=8\\times 2$ ، ثم $\\frac{5}{16}+\\frac{6}{16}=\\frac{11}{16}$ .' },
        { label: 'ما قطعه سيرًا', options: ['$\\frac{5}{16}$', '$\\frac{11}{16}$', '$\\frac{5}{8}$'], correct: 0, correction: '$1-\\frac{11}{16}=\\frac{16}{16}-\\frac{11}{16}=\\frac{5}{16}$ .' },
      ],
      explain: 'كتبنا $\\frac{3}{8}$ بالمقام $16$ لأنّه مضاعف لـ $8$ ، ثم جمعنا البسطين وطرحنا الناتج من الكلّ.',
    },
    commonError: 'جمع البسطين والمقامين: $\\frac{5}{16}+\\frac{3}{8}=\\frac{8}{24}$ .',
  },
  {
    id: 'ex-3', source: src('ex-7', 30, 'أوظّف تعلّماتي', 7), alsoSource: [src('ex-8', 30, 'أوظّف تعلّماتي', 8), src('ex-9', 30, 'أوظّف تعلّماتي', 9), src('ex-10', 31, 'أوظّف تعلّماتي', 10), src('ex-11', 31, 'أوظّف تعلّماتي', 11), src('ex-13', 31, 'أوظّف تعلّماتي', 13)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'احسب كلًّا مما يلي واختزل الناتج إن أمكن.',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$\\frac{2}{7}+\\frac{9}{14}$', options: ['$\\frac{13}{14}$', '$\\frac{11}{21}$', '$\\frac{11}{14}$'], correct: 0, correction: '$\\frac{2}{7}=\\frac{4}{14}$ ثم $\\frac{4}{14}+\\frac{9}{14}=\\frac{13}{14}$ .' },
        { label: '$\\frac{5}{6}-\\frac{7}{12}$', options: ['$\\frac{1}{4}$', '$\\frac{2}{6}$', '$\\frac{3}{6}$'], correct: 0, correction: '$\\frac{10}{12}-\\frac{7}{12}=\\frac{3}{12}=\\frac{1}{4}$ .' },
        { label: '$\\frac{3}{4}-\\frac{5}{8}$', options: ['$\\frac{1}{8}$', '$\\frac{2}{4}$', '$\\frac{1}{4}$'], correct: 0, correction: '$\\frac{6}{8}-\\frac{5}{8}=\\frac{1}{8}$ .' },
        { label: '$\\frac{2{,}3}{5}+\\frac{1{,}7}{5}$', options: ['$\\frac{4}{5}$', '$\\frac{4}{10}$', '$\\frac{3{,}9}{5}$'], correct: 0, correction: 'للكسرين المقام نفسه: $\\frac{2{,}3+1{,}7}{5}=\\frac{4}{5}$ .' },
      ],
      explain: 'نوحّد المقام إذا كان أحدهما مضاعفًا للآخر، ثم نجمع أو نطرح البسطين فقط.',
    },
    commonError: 'جمع المقامين أو طرحهما مع البسطين.',
  },
  {
    id: 'ex-4', source: src('ex-14', 31, 'أوظّف تعلّماتي', 14), alsoSource: [src('deep-47', 35, 'أتعمّق', 47), src('self-6', 33, 'أؤكّد تعلّماتي', 6)], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'احسب كلًّا مما يلي.',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$1-\\frac{5}{8}$', options: ['$\\frac{3}{8}$', '$\\frac{4}{8}$', '$\\frac{5}{8}$'], correct: 0, correction: '$\\frac{8}{8}-\\frac{5}{8}=\\frac{3}{8}$ .' },
        { label: '$\\frac{7}{3}-2$', options: ['$\\frac{1}{3}$', '$\\frac{5}{3}$', '$\\frac{7}{1}$'], correct: 0, correction: '$2=\\frac{6}{3}$ ، و $\\frac{7}{3}-\\frac{6}{3}=\\frac{1}{3}$ .' },
        { label: '$3+\\frac{5}{12}$', options: ['$\\frac{41}{12}$', '$\\frac{8}{12}$', '$\\frac{15}{12}$'], correct: 0, correction: '$3=\\frac{36}{12}$ ، و $\\frac{36}{12}+\\frac{5}{12}=\\frac{41}{12}$ .' },
        { label: '$2-\\frac{1}{6}$', options: ['$\\frac{11}{6}$', '$\\frac{1}{6}$', '$\\frac{1}{3}$'], correct: 0, correction: '$2=\\frac{12}{6}$ ، و $\\frac{12}{6}-\\frac{1}{6}=\\frac{11}{6}$ .' },
      ],
      explain: 'نكتب العدد الطبيعي كسرًا مقامه مقام الكسر، ثم نطرح أو نجمع البسطين.',
    },
    commonError: 'جمع العدد الطبيعي إلى البسط وحده: $3+\\frac{5}{12}=\\frac{8}{12}$ .',
  },
  {
    id: 'ex-5', source: src('deep-37', 34, 'أتعمّق', 37), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'شربت سلمى بعد الركض $\\frac{1}{2}$ L من الماء ثم $\\frac{3}{4}$ L ، فلا يُهدَر الماء.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'الكمّية التي شربتها', options: ['$\\frac{5}{4}$ L', '$\\frac{4}{6}$ L', '$\\frac{4}{4}$ L'], correct: 0, correction: '$\\frac{1}{2}=\\frac{2}{4}$ ثم $\\frac{2}{4}+\\frac{3}{4}=\\frac{5}{4}$ .' },
        { label: '$\\frac{5}{4}$ مكتوبة عددًا طبيعيًا وكسرًا', options: ['$1+\\frac{1}{4}$', '$1+\\frac{5}{4}$', '$5+\\frac{1}{4}$'], correct: 0, correction: '$\\frac{5}{4}=\\frac{4}{4}+\\frac{1}{4}=1+\\frac{1}{4}$ .' },
        { label: 'هل شربت أكثر من لتر؟', options: ['نعم', 'لا'], correct: 0, correction: '$1+\\frac{1}{4}>1$ : شربت أكثر من لتر.' },
      ],
      explain: 'مجموع كسرين قد يتجاوز $1$ ، ونكتبه عددًا طبيعيًا وكسرًا.',
    },
    commonError: 'اعتبار المجموع أقلّ من $1$ لأنّ كلّ كسر أقلّ من $1$ .',
  },
  {
    id: 'ex-6', source: src('ex-31', 32, 'أوظّف تعلّماتي', 31), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'نضيف مقام كسر إلى بسطه فنحصل على كسر جديد.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'الكسر الجديد لـ $\\frac{3}{7}$', options: ['$\\frac{10}{7}$', '$\\frac{3}{14}$', '$\\frac{10}{14}$'], correct: 0, correction: 'نضيف $7$ إلى البسط: $\\frac{3+7}{7}=\\frac{10}{7}$ .' },
        { label: 'بكم يزيد الكسر الجديد عن $\\frac{3}{7}$ ؟', options: ['$1$', '$\\frac{1}{7}$', '$7$'], correct: 0, correction: '$\\frac{10}{7}-\\frac{3}{7}=\\frac{7}{7}=1$ .' },
        { label: 'الزيادة نفسها إذا بدأنا بـ $\\frac{5}{9}$', options: ['$1$', '$\\frac{9}{5}$', '$9$'], correct: 0, correction: '$\\frac{14}{9}-\\frac{5}{9}=\\frac{9}{9}=1$ : الزيادة $1$ دائمًا.' },
      ],
      explain: '$\\frac{a+b}{b}=\\frac{a}{b}+\\frac{b}{b}=\\frac{a}{b}+1$ : نضيف $1$ كاملة.',
    },
    commonError: 'ظنّ الزيادة كسرًا صغيرًا.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
