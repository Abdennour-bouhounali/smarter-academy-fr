/**
 * Les exercices du module 4 « أوظّف تعلّماتي » du درس 5 « حل مشكلات وترييض وضعيات بتوظيف الدالة التآلفية ».
 * Le manuel n'en propose AUCUN pour ce sujet (extraction : pas de تمارين dans les pages fournies) : ce
 * sont des exercices de la PLATEFORME, déclarés (`addition('interaction_generation')`), en contextes de
 * la vie d'un élève algérien (forfait Internet, salle de sport, location de vélo, cybercafé). Chaque
 * réponse est recalculée en commentaire.
 */
import { addition } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_tarrid-taalufi_P1',
  P2: '4am_tarrid-taalufi_P2',
};

const SRC = addition('interaction_generation');

export const EXERCISES = [
  {
    // 80x + 1000 = 1640 ⇔ 80x = 640 ⇔ x = 8
    id: 'data', source: SRC, learningPointId: LP.P1, difficulty: 'facile',
    statement: 'باقة أنترنت شهرية تستعملها ريم في الدراسة والمطالعة: 1000DA تُدفع مرّة واحدة في الشهر، ثم 80DA لكل 1Go إضافي. دفعت ريم هذا الشهر 1640DA. كم جيغا إضافية استهلكت؟',
    interaction: 'numeric',
    question: { expected: 8, display: '8', explain: '$f(x) = 80x + 1000$ . نحلّ $80x + 1000 = 1640$ : $80x = 640$ ومنه $x = 8$ ، أي 8Go إضافية.' },
    commonError: 'قسمة 1640 على 80 (20,5) دون طرح الجزء الثابت 1000DA.',
  },
  {
    // f(x) = 100x + 1500 ; g(x) = 250x ; 1500 = 150x ⇔ x = 10 ; 12 séances : 2700 contre 3000
    id: 'gym', source: SRC, learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'قاعة رياضة، تدعو روّادها إلى النظافة والنظام، تقترح صيغتين في الشهر. الصيغة الأولى: اشتراك 1500DA ثم 100DA للحصة. الصيغة الثانية: 250DA للحصة دون اشتراك. نسمّي $x$ عدد الحصص في الشهر.',
    interaction: 'batch',
    question: {
      prompt: 'نمذج ثم قارن.',
      rows: [
        { label: 'تكلفة الصيغة الأولى', options: ['$f(x) = 1500x + 100$', '$f(x) = 100x + 1500$', '$f(x) = 1600x$'], correct: 1, correction: 'الاشتراك يُدفع مرّة واحدة: $f(x) = 100x + 1500$ .' },
        { label: 'تتساوى الصيغتان من أجل', options: ['$x = 6$', '$x = 10$', '$x = 15$'], correct: 1, correction: '$100x + 1500 = 250x$ أي $1500 = 150x$ ومنه $x = 10$ .' },
        { label: 'لـ 12 حصة في الشهر الأفضل', options: ['الصيغة الأولى', 'الصيغة الثانية'], correct: 0, correction: '$f(12) = 2700$ و $g(12) = 3000$ : الصيغة الأولى أرخص بعد 10 حصص.' },
      ],
    },
    commonError: 'ضرب الاشتراك في عدد الحصص ($1500x + 100$): الاشتراك يُدفع مرّة واحدة.',
  },
  {
    // 150x + 300 = 250x ⇔ 300 = 100x ⇔ x = 3
    id: 'bike', source: SRC, learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'على الشاطئ، وهو يحافظ على نظافته، يكتري أنيس درّاجة. المحلّ A: رسم ثابت 300DA ثم 150DA للساعة. المحلّ B: 250DA للساعة. بعد كم ساعة كراء تتساوى التكلفتان؟',
    interaction: 'numeric',
    question: { expected: 3, display: '3', explain: '$150x + 300 = 250x$ أي $300 = 100x$ ومنه $x = 3$ : بعد 3 ساعات تتساوى التكلفتان (750DA).' },
  },
  {
    // 5 h : A 1050, B 1250 → A
    id: 'bike-2', source: SRC, learningPointId: LP.P2, difficulty: 'facile',
    statement: 'يريد أنيس كراء الدرّاجة 5 ساعات. أيّ محلّ يختار؟',
    interaction: 'choice',
    question: {
      options: ['المحلّ A', 'المحلّ B', 'المحلّان متساويان'],
      correct: 0, cols: 1,
      explain: '$150 \\times 5 + 300 = 1050$ و $250 \\times 5 = 1250$ : لأن $5 > 3$ فالمحلّ A أرخص.',
    },
    commonError: 'اختيار المحلّ B لأن لا رسم ثابت فيه: الرسم يُعوَّض بعد 3 ساعات.',
  },
  {
    // 20x = 5x + 300 ⇔ x = 20 ; 5x + 300 < 20x ⇔ 300 < 15x ⇔ x > 20
    id: 'cyber', source: SRC, learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'في مقهى أنترنت يقصده التلاميذ للبحث والمطالعة، تُطبع الصفحة بـ 20DA ، أو بـ 5DA للصفحة مع بطاقة ثمنها 300DA. متى تكون البطاقة أرخص؟',
    interaction: 'choice',
    question: {
      options: ['عندما $x < 20$', 'عندما $x > 20$', 'دائمًا', 'أبدًا'],
      correct: 1, cols: 2,
      explain: '$5x + 300 < 20x$ أي $300 < 15x$ ومنه $x > 20$ : البطاقة أرخص لأكثر من 20 صفحة.',
    },
    commonError: 'الظنّ أن الصيغة بـ 5DA للصفحة أرخص دائمًا: ننسى ثمن البطاقة 300DA.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
