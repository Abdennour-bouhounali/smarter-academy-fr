import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « توزيع الضرب على الجمع والطرح » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 4 p. 12 réécrit, طرائق 3 et 4 p. 13 réécrits).
 * Les parenthèses (`silsila-bi-aqwas`, PUBLIÉE) et l'aire du rectangle (1AM) sont des prérequis (`priorKnowledge`), mesurés par « أستعدّ » et rappelés avec lien au module 2, jamais un item ici.
 */
const { property, exampleSum, exampleDiff, names, common } = KNOWLEDGE;

/**
 * `memo` — la FICHE DE MÉMOIRE de « 🔑 للتذكّر » (MemoCard) : `rule` la règle en grand (KaTeX PUR : jamais d'arabe, même dans \\text ; ce qui CHANGE en `R{…}`), `hook` le slogan, `example`,
 * `trap`, `exam`, `chip`.
 */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'tawzi-jam', type: 'regles', title: 'ضرب عدد في مجموع',
        memo: {
          rule: `k\\times(a+b)=${R('k\\times a')}+${R('k\\times b')}`,
          hook: 'العدد يضرب كلّ حدّ من حدّي المجموع',
          example: `6\\times(3+2)=6\\times3+6\\times2=18+12=30`,
          trap: '$6\\times3+2=20$ لا $30$ : الحدّ الثاني نسي الضرب',
          exam: 'اكتب الجداءين ثم اجمعهما أو احسب بين القوسين وقارن',
          chip: `k\\times(a+b)`,
          quiz: [
            { q: '$5 \\times (6 + 4) =$', options: ['$5 \\times 6 + 5 \\times 4$', '$5 \\times 6 + 4$', '$5 + 6 \\times 4$'], correct: 0 },
            { q: '$8 \\times (4 + 5) =$', options: ['$72$', '$37$', '$36$'], correct: 0 },
          ],
        },
        predictPrompt: 'أخرجتَ 18 كرّاسًا و 12 قلمًا لتجهّز 6 حقائب فيها 3 كراريس وقلمان، فاتّفق العدّادان على 30. ماذا تقترح قاعدة لضرب عدد في مجموع؟ اكتب جوابك.',
        summary: property.text,
        body: <p><MathText>{property.text}</MathText></p>,
      },
      {
        id: 'tawzi-tarh', type: 'regles', title: 'ضرب عدد في فرق',
        memo: {
          rule: `k\\times(a-b)=${R('k\\times a')}-${R('k\\times b')}`,
          hook: 'الفرق كالمجموع: العدد يضرب الحدّين والإشارة تبقى',
          example: `7\\times(10-2)=7\\times10-7\\times2=70-14=56`,
          trap: '$7\\times10-2=68$ لا $56$ : التالف في كلّ حزمة لا في واحدة',
          exam: 'حافظ على الإشارة وتأكّد أنّ a أكبر من b',
          chip: `k\\times(a-b)`,
          quiz: [
            { q: '$6 \\times (9 - 4) =$', options: ['$6 \\times 9 - 6 \\times 4$', '$6 \\times 9 + 6 \\times 4$', '$6 \\times 9 - 4$'], correct: 0 },
            { q: '$7 \\times (10 - 2) =$', options: ['$56$', '$68$', '$84$'], correct: 0 },
          ],
        },
        predictPrompt: 'لـ 7 حقائب أخرجتَ 70 كرّاسًا ورميتَ 14 تالفًا فبقي 56. كيف تكتب ضرب 7 في (10 − 2)؟ اكتب جوابك.',
        summary: exampleDiff.text,
        body: <p><MathText>{exampleDiff.text}</MathText></p>,
      },
      {
        id: 'tahlil', type: 'regles', title: 'العامل المشترك يخرج',
        memo: {
          rule: `${R('k')}\\times a+${R('k')}\\times b=${R('k')}\\times(a+b)`,
          hook: 'من جداءين مجموعين إلى جداء واحد',
          example: `12\\times5+12\\times3=12\\times(5+3)=96`,
          trap: '$12\\times5+12\\times3\\ne12\\times5\\times3$ : لا نضرب العاملين',
          exam: 'ابحث عن العدد المكتوب في الجداءين ثم أخرجه',
          chip: `k\\times a+k\\times b`,
          quiz: [
            { q: '$7 \\times 13 + 7 \\times 17 =$', options: ['$7 \\times (13 + 17)$', '$7 \\times 13 \\times 17$', '$(7 + 7) \\times (13 + 17)$'], correct: 0 },
            { q: '$9 \\times 8 - 9 \\times 3 =$', options: ['$9 \\times (8 - 3)$', '$9 \\times (8 + 3)$', '$(9 - 9) \\times 5$'], correct: 0 },
          ],
        },
        predictPrompt: 'في 12 × 5 + 12 × 3 ما العدد المشترك بين الجداءين؟ وكيف تكتب المجموع جداءً واحدًا؟ اكتب جوابك.',
        summary: common.text,
        body: <p><MathText>{common.text}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'qaidat-tawzi', type: 'regles', title: 'خاصية توزيع الضرب والنشر والتحليل', predict: false,
        memo: {
          rule: `k\\times(a\\pm b)=k\\times a\\pm k\\times b`,
          hook: 'نشر: من جداء إلى مجموع · تحليل: من مجموع إلى جداء',
          example: `4\\times(9+6)=4\\times9+4\\times6=${R('60')}`,
          trap: 'في الفرق يشترط $a\\ge b$ ولا نغيّر الإشارة',
          exam: 'اذكر الخاصية بالكلمات ثم طبّقها على الأعداد',
          chip: `\\times(a\\pm b)`,
          quiz: [
            { q: 'الانتقال من $6 \\times (8 - 3)$ إلى $6 \\times 8 - 6 \\times 3$ يسمّى:', options: ['نشرًا', 'تحليلًا', 'تبسيطًا'], correct: 0 },
            { q: 'الانتقال من $9 \\times 7 + 9 \\times 3$ إلى $9 \\times (7 + 3)$ يسمّى:', options: ['تحليلًا', 'نشرًا', 'قسمةً'], correct: 0 },
          ],
        },
        summary: 'ضرب عدد في مجموع أو فرق هو ضربه في كلّ حدّ؛ النشر من جداء إلى مجموع أو فرق، والتحليل من مجموع أو فرق إلى جداء بإخراج العامل المشترك.',
        body: <div className="space-y-2"><p><MathText>{property.text}</MathText></p><p><MathText>{exampleSum.text}</MathText></p><p><MathText>{names.text}</MathText></p></div>,
      },
    ],
    3: [
      {
        id: 'tariqa-dhihni', type: 'methodes', title: 'أحسب ذهنيًا بالتوزيع',
        memo: {
          rule: `${R('25')}\\times(4{,}3+5{,}7)=25\\times10`,
          hook: 'عامل مشترك أو عدد قريب من عدد مدوّر',
          example: `99\\times7=(100-1)\\times7=700-7=693`,
          trap: '$99\\times7\\ne700-1$ : نطرح $1\\times7$ لا $1$',
          exam: 'اكتب العدد على شكل مدوّر ± صغير ثم وزّع',
          chip: `(100-1)\\times k`,
          quiz: [
            { q: '$45 \\times 11 =$', options: ['$45 \\times 10 + 45$', '$45 \\times 10 + 1$', '$45 \\times 12$'], correct: 0 },
            { q: '$3{,}5 \\times 101 =$', options: ['$353{,}5$', '$351$', '$350{,}5$'], correct: 0 },
          ],
        },
        predictPrompt: 'لحساب 99 × 7 ذهنيًا: كيف تكتب 99؟ وماذا تفعل بعد ذلك؟ اكتب الخطوات.',
        summary: METHOD.near.rule,
        body: <div className="space-y-2"><p><MathText>{METHOD.common.rule}</MathText></p><p><MathText>{METHOD.near.rule}</MathText></p></div>,
      },
      {
        id: 'tariqa-harf', type: 'methodes', title: 'أنشر عبارة فيها حرف',
        memo: {
          rule: `4\\times(x-3)=${R('4x')}-${R('12')}`,
          hook: 'العدد يضرب الحرف والعدد · 4×x تُكتب 4x',
          example: `x=5:\\ 4\\times(5-3)=8=4\\times5-12`,
          trap: '$4(x-3)\\ne4x-3$ : الحدّ 3 يُضرب أيضًا',
          exam: 'تحقّق بقيمة للحرف بالطريقتين',
          chip: `k(x\\pm b)=kx\\pm kb`,
          quiz: [
            { q: '$5 \\times (x - 4) =$', options: ['$5x - 20$', '$5x - 4$', '$x - 20$'], correct: 0 },
            { q: 'قيمة $3 \\times (x + 2)$ من أجل $x = 4$ هي:', options: ['$18$', '$14$', '$12$'], correct: 0 },
          ],
        },
        predictPrompt: 'لنشر 4 × (x − 3): ماذا يضرب العدد 4؟ وكيف تكتب 4 × x؟ اكتب جوابك.',
        summary: METHOD.letter.rule,
        body: <p><MathText>{METHOD.letter.rule}</MathText></p>,
      },
    ],
  },
};
