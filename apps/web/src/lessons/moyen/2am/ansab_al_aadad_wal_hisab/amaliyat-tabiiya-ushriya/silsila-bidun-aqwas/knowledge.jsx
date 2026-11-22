import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « سلسلة عمليات دون أقواس وأولوية العمليات » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 1 p. 10, réécrit). Le sens de
 * l'addition et de la soustraction (1AM, `mana-jam-tarh`, PUBLIÉE) est un prérequis (`priorKnowledge`), mesuré par « أستعدّ », jamais un item ici.
 */
const { addSub, mulDiv, priority, agreement } = KNOWLEDGE;

/**
 * `memo` — la FICHE DE MÉMOIRE de « 🔑 للتذكّر » (MemoCard) : `rule` la règle en grand (KaTeX \\; ce qui CHANGE en `R{…}`), `hook` le slogan, `example`, `trap`, `exam`, `chip`.
 */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'yasar-yamin-jam', type: 'regles', title: 'الجمع والطرح من اليسار نحو اليمين',
        memo: {
          rule: `${R('\\overrightarrow{a-b+c}')}`,
          hook: 'الجمع والطرح فقط: من اليسار نحو اليمين',
          example: `26-9+4=${R('17')}+4=21`,
          trap: 'لا تجمع العددين الأخيرين أوّلًا: $26-9+4\\neq 26-13$',
          exam: 'اكتب كلّ مرحلة في سطر، وابدأ دائمًا من أقصى اليسار',
          chip: `${R('\\overrightarrow{a-b+c}')}`,
          quiz: [
            { q: '$40 - 12 + 6 =$', options: ['$34$', '$22$', '$46$'], correct: 0 },
            { q: 'في سلسلة جمع وطرح فقط نحسب:', options: ['من اليسار نحو اليمين', 'الجمع أوّلًا', 'من اليمين نحو اليسار'], correct: 0 },
          ],
        },
        predictPrompt: 'في الرحلة: 26 تلميذًا، نزل 9، ثم صعد 4. عدّاد الركّاب قرأ 21 لا 13. في أيّ ترتيب حسبنا العمليتين، ولماذا؟ اكتب جوابك.',
        summary: KNOWLEDGE.addSub.text,
        body: <p><MathText>{addSub.text}</MathText></p>,
      },
      {
        id: 'yasar-yamin-darb', type: 'regles', title: 'الضرب والقسمة من اليسار نحو اليمين',
        memo: {
          rule: `${R('\\overrightarrow{a\\div b\\times c}')}`,
          hook: 'الضرب والقسمة وحدهما: من اليسار أيضًا',
          example: `150\\div 6\\times 4=${R('25')}\\times 4=100`,
          trap: 'لا تضرب أوّلًا: $150\\div 24=6{,}25$ أقلّ من ثمن تذكرة',
          exam: 'اقسم أوّلًا إذا كانت القسمة على اليسار',
          chip: `${R('\\overrightarrow{a\\div b\\times c}')}`,
          quiz: [
            { q: '$72 \\div 6 \\times 2 =$', options: ['$24$', '$6$', '$144$'], correct: 0 },
            { q: 'في $90 \\div 3 \\times 2$ نبدأ بـ:', options: ['$90 \\div 3$', '$3 \\times 2$', 'لا فرق'], correct: 0 },
          ],
        },
        predictPrompt: 'دفتر من 6 تذاكر بـ 150 DA : ثمن 4 تذاكر هو 100 DA . كيف حسبنا 150 ÷ 6 × 4 ، ولماذا لا نحسب 6 × 4 أوّلًا؟ اكتب جوابك.',
        summary: KNOWLEDGE.mulDiv.text,
        body: <p><MathText>{mulDiv.text}</MathText></p>,
      },
      {
        id: 'awlawiya', type: 'regles', title: 'الضرب والقسمة قبل الجمع والطرح',
        memo: {
          rule: `a+${R('b\\times c')}`,
          hook: 'الضرب والقسمة أوّلًا، ثم الجمع والطرح',
          example: `15+${R('3\\times 4')}=15+12=27`,
          trap: 'لا تجمع $15+3$ أوّلًا: الأفواج تصعد كتلة واحدة',
          exam: 'أحط الضرب والقسمة بخطّ ثم احسب ما بقي من اليسار',
          chip: `${R('\\times')}\\;${R('\\div')}\\succ +\\;-`,
          quiz: [
            { q: '$7 + 5 \\times 4 =$', options: ['$27$', '$48$', '$35$'], correct: 0 },
            { q: 'في $18 + 6 \\times 5 - 40 \\div 8$ نحسب أوّلًا:', options: ['$6 \\times 5$ و $40 \\div 8$', '$18 + 6$', '$5 - 40$'], correct: 0 },
          ],
        },
        predictPrompt: 'في العربة 15 تلميذًا جالسين، وفي المحطة صعدت 3 أفواج في كلّ فوج 4 تلاميذ، والعدّاد قرأ 27 . كيف تتكوّن 27 من 15 و 3 و 4 ؟ اكتب سلسلة العمليات بالترتيب الذي حسبته.',
        summary: KNOWLEDGE.priority.text,
        body: <p><MathText>{priority.text}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'qawaid-hisab', type: 'regles', title: 'قواعد حساب سلسلة دون أقواس', predict: false,
        memo: {
          rule: `${R('\\times\\;\\div')}\\succ +\\;-`,
          hook: 'أحيط الضرب والقسمة · ثم اليسار فاليمين',
          example: `18+6\\times5-40\\div8=18+30-5=43`,
          trap: 'الحساب كلّه من اليسار يتجاهل أسبقية الضرب',
          exam: 'اكتب كلّ مرحلة في سطر مستقلّ',
          chip: `\\times\\div\\succ +-`,
          quiz: [
            { q: '$42 + 15 - 9 =$', options: ['$48$', '$18$', '$66$'], correct: 0 },
            { q: '$18 + 6 \\times 5 - 40 \\div 8 =$', options: ['$43$', '$20$', '$100$'], correct: 0 },
          ],
        },
        summary: 'من اليسار في الجمع والطرح وحدهما، ومن اليسار في الضرب والقسمة وحدهما، والضرب والقسمة قبل الجمع والطرح.',
        body: <div className="space-y-2"><p><MathText>{addSub.text}</MathText></p><p><MathText>{mulDiv.text}</MathText></p><p><MathText>{priority.text}</MathText></p></div>,
      },
      {
        id: 'ittifaq', type: 'vocabulaire', title: 'اتّفاق تتبعه الآلة الحاسبة',
        memo: {
          rule: `${R('15+3\\times4')}=27`,
          hook: 'قراءة واحدة للسلسلة يتّفق عليها الجميع',
          example: `15+3\\times4=15+12=27`,
          trap: 'آلة حاسبة عادية قد تحسب من اليسار فقط: $27$ ليس ما تعرضه دائمًا',
          exam: 'اكتب الحساب بقواعد الدرس لا بما تعرضه آلة بسيطة',
          chip: `15+3\\times4=27`,
          quiz: [
            { q: 'لماذا نقرأ السلسلة بالقواعد نفسها؟', options: ['لنحصل جميعًا على العدد نفسه', 'لأنّ العدد يتغيّر كلّ مرّة', 'لأنّ الأستاذ يريد ذلك'], correct: 0 },
            { q: 'الآلة العلمية تعرض لـ $15 + 3 \\times 4$ :', options: ['$27$', '$72$', '$18$'], correct: 0 },
          ],
        },
        summary: 'القواعد اتّفاق، والآلة الحاسبة العلمية تتبعه.',
        body: <p><MathText>{agreement.text}</MathText></p>,
      },
    ],
    3: [
      {
        id: 'tariqa-marahil', type: 'methodes', title: 'نحسب سلسلة مرحلة بعد مرحلة',
        memo: {
          rule: `4{,}5+${R('2\\times8')}-${R('27\\div9')}`,
          hook: 'أحيط · أحسب · أكتب كلّ مرحلة في سطر',
          example: `4{,}5+2\\times8-27\\div9=4{,}5+16-3=17{,}5`,
          trap: 'لا تحسب مرحلتين في سطر واحد دون أن تكتبهما',
          exam: 'اكتب السلسلة ثم سطرًا لكلّ مرحلة حتى الناتج',
          chip: `\\times\\div\\to+-`,
          quiz: [
            { q: '$100 - 36 \\div 4 \\times 3 =$', options: ['$73$', '$48$', '$97$'], correct: 0 },
            { q: 'في $4{,}5 + 2 \\times 8 - 27 \\div 9$ العمليتان الأوليان:', options: ['$2 \\times 8$ و $27 \\div 9$', '$4{,}5 + 2$', '$8 - 27$'], correct: 0 },
          ],
        },
        predictPrompt: 'لحساب 4,5 + 2 × 8 − 27 ÷ 9 : أيّ العمليات تُحسب أوّلًا ثم ماذا؟ اكتب طريقتك.',
        summary: METHOD.priority.rule,
        body: <div className="space-y-2"><p><MathText>{METHOD.priority.rule}</MathText></p><p className="text-sm text-slate-600"><MathText>{METHOD.mulDivOnly.rule}</MathText></p></div>,
      },
      {
        id: 'tarjama-silsila', type: 'methodes', title: 'ترجمة وضعية بسلسلة عمليات',
        memo: {
          rule: `200${R('-')}3\\times45${R('-')}25=40`,
          hook: 'أروي الوضعية بترتيب الحدوث ثم أكتب سلسلتها',
          example: `200-3\\times45-25=200-135-25=40`,
          trap: 'ما يُدفع يُطرح: لا نجمعه مع المبلغ',
          exam: 'اكتب السلسلة أوّلًا ثم احسبها ثم أجب بجملة',
          chip: `200-3\\times45-25`,
          quiz: [
            { q: 'دفع سمير 200 DA ثمن 3 كراريس بـ 45 DA للكرّاس وقلم بـ 25 DA : الباقي معه؟', options: ['$200 - 3 \\times 45 - 25$', '$200 + 3 \\times 45 - 25$', '$3 \\times 45 + 25 - 200$'], correct: 0 },
            { q: 'تُكتب السلسلة بترتيب:', options: ['حدوث الوضعية', 'حجم الأعداد', 'عشوائي'], correct: 0 },
          ],
        },
        predictPrompt: 'اشترى سمير 3 كراريس بـ 45 DA للكرّاس وقلمًا بـ 25 DA ودفع 200 DA . اكتب سلسلة تعطي ما بقي معه.',
        summary: METHOD.translate.rule,
        body: <p><MathText>{METHOD.translate.rule}</MathText></p>,
      },
    ],
  },
};
