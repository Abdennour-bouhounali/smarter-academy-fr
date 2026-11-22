/**
 * Les exercices du MANUEL rattachés au درس « معنى الجمع والطرح » (couverture : extraction.json → destinations).
 * Chaque exercice garde son énoncé au mot près et déclare l'interaction qui le rend sans changer sa tâche
 * mathématique. Les réponses sont celles calculées dans docs/sources/1am/unit2/build-extraction.py.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '1am_mana-jam-tarh_P1',
  P2: '1am_mana-jam-tarh_P2',
  P3: '1am_mana-jam-tarh_P3',
};

export const EXERCISES = [
  {
    id: 'ex-1', source: src('ex-1', 30, 'أتمرّن', 1), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'إملأ الفراغ بالعبارة المناسبة',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'أ) $16{,}34 + 5{,}9$ هو ... 16,34 و 5,9', options: ['مجموع العددين', 'فرق العددين', 'حدّا المجموع'], correct: 0, correction: 'ناتج جمع عددين يُسمّى مجموع هذين العددين.' },
        { label: 'ب) $89{,}45 - 7$ هو ... 89,45 و 7', options: ['مجموع العددين', 'فرق العددين', 'حدّا الفرق'], correct: 1, correction: 'نتيجة طرح عددين تُسمّى فرق هذين العددين؛ 89,45 و 7 هما حدّا الفرق.' },
      ],
      explain: 'نسمّي النتيجة باسم العملية: مجموع بعد الجمع، فرق بعد الطرح؛ والأعداد التي نجمعها أو نطرحها هي الحدود.',
    },
    commonError: 'تسمية نتيجة الطرح «مجموعًا» لأنها نتيجة حساب.',
  },
  {
    id: 'ex-16', source: src('ex-16', 30, 'أتمرّن', 16), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'مثّل كل مساواة مما يأتي بشكل مناسب، ثمّ احسب العدد الناقص.',
    interaction: 'batch',
    question: {
      prompt: 'في المخطط، أين يقع العدد الناقص؟ ثم أيّ حساب يعطيه؟',
      rows: [
        { label: 'أ) $2{,}7 + \\square = 7{,}03$', options: ['$\\square = 7{,}03 - 2{,}7$', '$\\square = 7{,}03 + 2{,}7$', '$\\square = 2{,}7 - 7{,}03$'], correct: 0, correction: '7,03 هو الكلّ (تحت الخطّ)، و □ جزء: $\\square = 7{,}03 - 2{,}7 = 4{,}33$.' },
        { label: 'ب) $\\bigcirc + 5{,}35 = 7{,}91$', options: ['$\\bigcirc = 7{,}91 + 5{,}35$', '$\\bigcirc = 7{,}91 - 5{,}35$', '$\\bigcirc = 5{,}35 - 7{,}91$'], correct: 1, correction: '7,91 هو الكلّ، و ○ جزء: $\\bigcirc = 7{,}91 - 5{,}35 = 2{,}56$.' },
        { label: 'ج) $\\triangle - 245 = 45{,}3$', options: ['$\\triangle = 245 - 45{,}3$', '$\\triangle = 45{,}3 - 245$', '$\\triangle = 45{,}3 + 245$'], correct: 2, correction: '△ هو الكلّ: نطرح منه 245 فيبقى 45,3، إذن $\\triangle = 45{,}3 + 245 = 290{,}3$.' },
        { label: 'د) $43{,}2 = ? - 4{,}76$', options: ['$? = 43{,}2 + 4{,}76$', '$? = 43{,}2 - 4{,}76$', '$? = 4{,}76 - 43{,}2$'], correct: 0, correction: '؟ هو الكلّ: $? = 43{,}2 + 4{,}76 = 47{,}96$.' },
      ],
      explain: 'المجهول هو الكلّ ← نجمع الجزأين؛ المجهول جزء ← نطرح الجزء الآخر من الكلّ.',
    },
    answers: { a: '4,33', b: '2,56', c: '290,3', d: '47,96' },
    commonError: 'في ج) و د) رؤية علامة « − » فنطرح: لكنّ المجهول هو الكلّ الذي طُرح منه، فنجمع.',
  },
  {
    id: 'ex-17', source: src('ex-17', 30, 'أتمرّن', 17), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'طول شاحنة $10{,}50\\,\\mathrm{m}$ ، رُبطت إليها عربة طولها $7{,}80\\,\\mathrm{m}$ ، بذلك يزيد مجموع طوليهما بـ $2{,}70\\,\\mathrm{m}$ عن طول حافلة . ماهو طول الحافلة ؟',
    interaction: 'numeric',
    question: {
      prompt: 'طول الحافلة (بالمتر):', expected: 15.6, display: '15,6',
      explain: 'الشاحنة والعربة معًا $10{,}50 + 7{,}80 = 18{,}30\\,\\mathrm{m}$ ، وهو الأطول (« يزيد »): الحافلة جزء منه، إذن $18{,}30 - 2{,}70 = 15{,}60\\,\\mathrm{m}$.',
    },
    commonError: 'إضافة 2,70 لأنّ النصّ يقول « يزيد »: لكنّ الذي يزيد هو مجموع الطولين، والحافلة هي الأقصر.',
  },
  {
    id: 'deep-8', source: src('deep-8', 32, 'أتعمّق', 8), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'محيط حديقة العم أحمد $260\\,\\mathrm{m}$ ، قام بإحاطتها بسياج طوله $253{,}3\\,\\mathrm{m}$ ، حيث عرض باب المرآب $3{,}52\\,\\mathrm{m}$ . ماهو عرض مدخل الحديقة ؟',
    interaction: 'numeric',
    question: {
      prompt: 'عرض مدخل الحديقة (بالمتر):', expected: 3.18, display: '3,18',
      explain: 'المحيط هو الكلّ: السياج + باب المرآب + المدخل. $260 - 253{,}3 = 6{,}7$ ثم $6{,}7 - 3{,}52 = 3{,}18\\,\\mathrm{m}$.',
    },
    commonError: 'نسيان باب المرآب: $260 - 253{,}3 = 6{,}7$ هو عرض الفتحتين معًا لا عرض المدخل وحده.',
  },
];

/** « أقوّم تعلّماتي » (p. 31) — repris dans le إختبار أولي (module 8), aux nombres du manuel. */
export const SELF = {
  6: { source: src('self-6', 31, 'أقوّم تعلّماتي', 6), value: '5,4' },
  7: { source: src('self-7', 31, 'أقوّم تعلّماتي', 7), value: '5,25' },
  8: { source: src('self-8', 31, 'أقوّم تعلّماتي', 8), value: '1,66' },
};

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
