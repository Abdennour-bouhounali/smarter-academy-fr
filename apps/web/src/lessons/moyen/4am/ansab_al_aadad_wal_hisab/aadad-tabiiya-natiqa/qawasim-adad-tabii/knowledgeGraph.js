/**
 * La carte PROGRESSIVE du درس 2 — قواسم عدد طبيعي.
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A ; référence :
 * qasim-adad-tabii/knowledgeGraph.js.
 *
 * Aucune mathématique n'est écrite ici sans source : la طريقة du manuel
 * (content/textbook.js : نشاط 2 p. 8, طرائق p. 11), les exercices et leurs
 * `commonError` (content/exercises.js), les questions des محاور. Les égalités
 * de 60 se CALCULENT à partir du nombre du manuel. Chaque nœud est gardé par
 * l'item de knowledge.jsx qui l'établit (`requires`).
 *
 * Deux items sont des AIDES par nature, et portent donc un type d'aide :
 *   qasim-rappel   « تذكير » du درس 1 → تذكّر (prerequisite) ;
 * les deux méthodes restent des طريقة, les règles de divisibilité un للحفظ
 * (le « memoriser » de la carte par strates).
 * Pas de « نصيحة » à part : l'accélération par les règles EST l'item للحفظ.
 *
 *                     [قواسم عدد طبيعي]                    مفهوم
 *                    نعيّنها بـ │
 *                       [جداء عاملين]                       طريقة
 *                 تذكّر ┌─────┴─────┐ مثال
 *          📌 [قاسم عدد طبيعي]      [قواسم 60]
 *                                    │ خطأ شائع
 *                                ⛔ [نسيان قاسم]
 *                 الجداءات تتكرّر ┆ (couloir central)
 *                       [طريقة الكتاب]                      طريقة
 *                  مثال ┌─────┴─────┐ نُسرّعها بـ
 *              [قواسم 105]          [قابلية القسمة]        للحفظ
 *              خطأ شائع │             │ خطأ شائع
 *              ⛔ [حتى النصف؟]    ⛔ [مضاعف لـ 9]
 *                        └──┬──┘ نستخلص
 *                    🎯 [قواسم تأتي أزواجًا]
 */
import { ACTIVITY, METHOD } from './content/textbook';
import { EX } from './content/exercises';

/** Les écritures n = d × e avec d ≤ e — le tableau de l'activité, calculé. */
const pairsOf = (n) => {
  const out = [];
  for (let d = 1; d * d <= n; d += 1) if (n % d === 0) out.push([d, n / d]);
  return out;
};
const n60 = ACTIVITY.numbers.main;
const pairs60 = pairsOf(n60);
const divisors60 = [...new Set([...pairs60.map(([d]) => d), ...pairs60.map(([, e]) => e).reverse()])];
const [lastD, lastE] = pairs60[pairs60.length - 1];

const ex3 = EX['ex-3'];
const ex6 = EX['ex-6'];
const stripLabel = (s) => s.replace(/^[أب]\)\s*/, '');

export const KNOWLEDGE_GRAPH = {
  root: 'qawasim',
  nodes: [
    {
      id: 'qawasim',
      kind: 'concept',
      lane: 'center',
      requires: 'jidaa-aamilayn',
      title: 'قواسم عدد طبيعي',
      subtitle: 'كلّها، دون أن ننسى أيّ واحد',
      // La question de l'activité 2 (أ puis ب).
      context: { text: stripLabel(ACTIVITY.questions[0]), note: stripLabel(ACTIVITY.questions[3]) },
      reveals: ['jidaa'],
    },
    {
      id: 'jidaa',
      kind: 'method',
      lane: 'center',
      requires: 'jidaa-aamilayn',
      notebook: true,
      title: 'جداء عاملين',
      subtitle: '$a = d \\times e$',
      reveals: ['rappel', 'ex60'],
    },
    {
      // 📌 تذكّر — l'item « تذكير » du module 1 : SI a = d × e, ALORS d et e
      // sont des قواسم — c'est la définition du درس 1 qui le dit.
      id: 'rappel',
      kind: 'prerequisite',
      lane: 'start',
      requires: 'qasim-rappel',
      notebook: true,
      title: 'قاسم عدد طبيعي',
      subtitle: '$a = b \\times q$',
      reveals: [],
    },
    {
      id: 'ex60',
      kind: 'example',
      lane: 'end',
      requires: 'jidaa-aamilayn',
      title: `قواسم ${n60}`,
      subtitle: `$${n60} = ${lastD} \\times ${lastE}$`,
      context: {
        formula: `$${n60} = ${pairs60.map(([d, e]) => `${d} \\times ${e}`).join(' = ')}$`,
        text: `قواسم العدد ${n60}: ${divisors60.join(' ، ')}.`,
      },
      reveals: ['khata-nisyan', 'tariqa'],
    },
    {
      // ⛔ خطأ شائع — l'exercice 3 : son `commonError`, son explication (six
      // جداءات → douze قواسم) et sa réponse.
      id: 'khata-nisyan',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'jidaa-aamilayn',
      title: 'نسيان قاسم',
      subtitle: '1 والعدد نفسه، والشريك',
      context: {
        parts: [
          { role: 'wrong', text: ex3.commonError },
          { role: 'why', text: ex3.question.explain },
          { role: 'right', text: `قواسم العدد 84: ${ex3.question.expected.join(' ، ')}.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'tariqa',
      kind: 'method',
      lane: 'center',
      requires: 'tariqa-qawasim',
      notebook: true,
      title: 'الطريقة المنظّمة',
      subtitle: '$d^2 \\leq a$',
      context: { text: METHOD.rule[0] },
      reveals: ['ex105', 'qawaid'],
    },
    {
      id: 'ex105',
      kind: 'example',
      lane: 'start',
      requires: 'tariqa-qawasim',
      title: 'قواسم 105',
      subtitle: '$10^2 \\leq 105 < 11^2$',
      context: { text: METHOD.solution[0], list: [METHOD.solution[2]], note: METHOD.solution[4] },
      reveals: ['khata-nisf'],
    },
    {
      // ⛔ خطأ شائع — Module 2, question 1 (et l'évaluation, E4) : le
      // distracteur « إلى 52، أي نصف 105 » et son explication.
      id: 'khata-nisf',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'tariqa-qawasim',
      title: 'حتى النصف؟',
      subtitle: 'نتوقّف عند 10، لا عند 52',
      context: {
        parts: [
          { role: 'wrong', text: 'نختبر قابلية قسمة 105 على الأعداد حتى 52، أي نصف 105.' },
          {
            role: 'why',
            text: 'إذا كان $105 = d \\times e$ مع $d \\leq e$ فإن $d^2 \\leq 105$: كل قاسم أكبر من 10 هو شريك قاسم أصغر.',
          },
          { role: 'right', text: METHOD.solution[0] },
        ],
      },
      reveals: [],
    },
    {
      id: 'qawaid',
      kind: 'retain',
      lane: 'end',
      requires: 'qawaid-qisma',
      notebook: true,
      title: 'قابلية القسمة',
      subtitle: '2 · 3 · 4 · 5 · 9',
      // La ligne du manuel, puis l'explication de la question 3 du module 2.
      context: {
        text: METHOD.rule[1].replace(/^•\s*/, ''),
        note: 'في 105: مجموع الأرقام 6: يقبل القسمة على 3 لا على 9؛ رقم الوحدات 5: يقبل القسمة على 5.',
      },
      reveals: ['khata-9'],
    },
    {
      // ⛔ خطأ شائع — l'exercice 6 : son `commonError`, son explication, sa réponse.
      id: 'khata-9',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'qawaid-qisma',
      title: 'مضاعف لـ 9، لا 9',
      subtitle: 'مجموع الأرقام',
      context: {
        parts: [
          { role: 'wrong', text: ex6.commonError },
          { role: 'why', text: ex6.question.explain },
          { role: 'right', text: ex6.question.options[ex6.question.correct] },
        ],
      },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — l'item « جداء عاملين » et la طريقة du manuel, réunis.
      id: 'khulasa',
      kind: 'takeaway',
      lane: 'center',
      requires: 'tariqa-qawasim',
      title: 'قواسم تأتي أزواجًا',
      subtitle: '$a = d \\times e$',
      context: {
        text: 'كل كتابة $a = d \\times e$ تعطي قاسمين للعدد $a$: $d$ و $e$. لذلك يكفي أن نختبر الأعداد التي مربع كل منها أصغر من $a$ أو يساويه.',
        note: 'ولا ننسى 1 والعدد نفسه: $a = 1 \\times a$.',
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'qawasim', to: 'jidaa', label: 'نعيّنها بـ' },
    { from: 'jidaa', to: 'rappel', label: 'تذكّر' },
    { from: 'jidaa', to: 'ex60', label: 'مثال' },
    { from: 'ex60', to: 'khata-nisyan', label: 'خطأ شائع' },
    // Module 2 : « مع 60 و 48 لاحظت أن الجداءات تتكرر بعد حدّ ما. الكتاب
    // يحوّل هذه الملاحظة إلى طريقة. »
    { from: 'ex60', to: 'tariqa', label: 'الجداءات تتكرّر' },
    { from: 'tariqa', to: 'ex105', label: 'مثال' },
    { from: 'ex105', to: 'khata-nisf', label: 'خطأ شائع' },
    // L'item : « قواعد قابلية القسمة تُسرّع الاختبار ».
    { from: 'tariqa', to: 'qawaid', label: 'نُسرّعها بـ' },
    { from: 'qawaid', to: 'khata-9', label: 'خطأ شائع' },
    { from: 'khata-nisf', to: 'khulasa', label: 'نستخلص' },
    { from: 'khata-9', to: 'khulasa', label: 'نستخلص' },
  ],
};
