/**
 * Les exercices du MANUEL rattachés au درس 1 (couverture : extraction.json →
 * destinations). Chaque exercice garde son énoncé au mot près et déclare
 * l'interaction qui le rend sans changer sa tâche mathématique.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_qasim-adad-tabii_P1',
  P2: '4am_qasim-adad-tabii_P2',
  P3: '4am_qasim-adad-tabii_P3',
  P4: '4am_qasim-adad-tabii_P4',
};

export const EXERCISES = [
  {
    id: 'ex-1', source: src('ex-1', 14, 'أوظّف تعلّماتي', 1), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'اكتب المساواة التي تعبّر عن القسمة الإقليدية للعدد 1512 على العدد 21. حدّد عندئذ حاصل وباقي هذه القسمة.',
    interaction: 'choice',
    question: {
      prompt: 'أي مساواة تعبّر عن القسمة الإقليدية للعدد 1512 على 21؟',
      options: ['$1512 = 21 \\times 72 + 0$', '$1512 = 21 \\times 71 + 21$', '$1512 = 72 \\times 21 + 12$', '$1512 = 21 \\times 70 + 42$'],
      correct: 0, cols: 2,
      explain: 'حاصل القسمة 72 والباقي 0: إذن 21 قاسم للعدد 1512، و 1512 مضاعف للعدد 21.',
    },
    method: 'نجري القسمة الإقليدية ونتأكد أن الباقي أصغر من المقسوم عليه.',
    commonError: 'كتابة باقٍ أكبر من المقسوم عليه أو يساويه (21 أو 42) — عندئذ لا تكون الكتابة قسمة إقليدية.',
  },
  {
    id: 'ex-2', source: src('ex-2', 14, 'أوظّف تعلّماتي', 2), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'إليك الأعداد الطبيعية الآتية: 80 ، 120 ، 295 ، 132. من بين هذه الأعداد، ما هي الأعداد التي تقبل القسمة على 6؟',
    interaction: 'integerSet',
    question: { prompt: 'اكتب الأعداد التي تقبل القسمة على 6.', expected: [120, 132], explain: '$120 = 6 \\times 20$ و $132 = 6 \\times 22$؛ أما 80 و 295 فباقي قسمتهما على 6 ليس معدومًا.' },
    method: 'يقبل العدد القسمة على 6 إذا كان باقي قسمته على 6 معدومًا (أو: يقبل القسمة على 2 وعلى 3 معًا).',
    commonError: 'اختيار 80 لأنه زوجي: الزوجية لا تكفي، يلزم أيضًا قابلية القسمة على 3.',
  },
  {
    id: 'ex-5', source: src('ex-5', 14, 'أوظّف تعلّماتي', 5), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'أجب بصحيح أو خطأ.',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: '8 يقسم 4', answer: false, why: 'باقي قسمة 4 على 8 هو 4 (ليس معدومًا)؛ العكس صحيح: 4 يقسم 8.' },
        { text: '360 يقبل القسمة على 180', answer: true, why: '$360 = 180 \\times 2$.' },
        { text: '9 يقسم $2 \\times 3^{10} \\times 5 \\times 7$', answer: true, why: '$3^{10} = 9 \\times 3^{8}$، فالجداء مضاعف للعدد 9.' },
      ],
      explain: 'انتبه إلى اتجاه العبارة: «b يقسم a» تعني أن a هو الذي يقبل القسمة.',
    },
    commonError: 'الخلط بين «8 يقسم 4» و«4 يقسم 8».',
    needsReview: 'قراءة العبارة الأولى من الكتاب: «8 يقسم 4» (انظر extraction.json → discrepancies).',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
