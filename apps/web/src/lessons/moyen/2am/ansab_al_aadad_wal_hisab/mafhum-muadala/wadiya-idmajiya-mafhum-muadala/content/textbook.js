/**
 * Le contenu de « أدمج تعلّماتي — مفهوم معادلة » (2AM, unité 4) — données pures. Le manuel (p. 68 : `integration` le club, `evaluation` la distance de freinage ; p. 69 : `ict` le tableur ;
 * p. 67 : `deep-58`, banc d'exercices) est la RÉFÉRENCE ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : autres nombres, autre mise en scène).
 * La situation finale est une sortie scolaire au musée (location du car 12000 DA, billet 200 DA par élève, caisse de la coopérative 18000 DA, coût final 20000 DA) ; aucune ligne n'envoie au manuel.
 * Frontière 2AM : x des DEUX côtés jamais résolu (une égalité n'est que TESTÉE) ; jamais d'opération sur les deux membres ; aucune valeur négative.
 */
import { addition } from '../../_unit/unitMeta.js';

/** « أستعدّ » — six affirmations de la plateforme, deux par leçon de l'unité (العبارة الحرفية، اختبار المساواة، حلّ المعادلة). */
export const PREP_ITEMS = [];

export const PREP_PLATFORM_ITEMS = [
  { skill: 'ibara', text: 'عدد الأعواد في صفّ من $n$ خلية سداسية متلاصقة، تشترك كلّ خليتين متجاورتين في عود، هو $6n$ .', answer: false,
    why: 'الخلية الأولى $6$ أعواد، وكلّ خلية جديدة تضيف $5$ أعواد فقط لأنّها تشترك في عود: العدد $5n+1$ . من أجل $n=2$ نجد $11$ لا $12$ .' },
  { skill: 'ibara', text: '$2a+5a-a=6a$ .', answer: true, why: 'الحدود من النوع نفسه: $(2+5-1)a=6a$ .' },
  { skill: 'qima', text: 'قيمة $3x^2$ من أجل $x=2$ هي $36$ .', answer: false,
    why: 'الأسّ $2$ يخصّ $x$ وحده: $3\\times2\\times2=12$ . أمّا $36$ فهي $(3\\times2)^2$ .' },
  { skill: 'ikhtibar', text: 'المساواة $4x+1=2x+7$ صحيحة من أجل $x=3$ .', answer: true, why: 'الطرف الأوّل $4\\times3+1=13$ والثاني $2\\times3+7=13$ ، فالطرفان متساويان.' },
  { skill: 'hall', text: 'حلّ المعادلة $\\frac{9}{x}=0{,}6$ هو $5{,}4$ .', answer: false,
    why: 'المجهول قاسم: $x=9\\div0{,}6=15$ ، ونتحقّق: $9\\div15=0{,}6$ . أمّا $5{,}4$ فهو الجداء $9\\times0{,}6$ .' },
  { skill: 'hall', text: 'حلّ المعادلة $3x+12=30$ هو $6$ .', answer: true, why: 'نلغي $+12$ أوّلًا: $3x=18$ ثمّ $x=6$ ، ونتحقّق: $3\\times6+12=30$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** « هل تعلم » de la fin du module 0 (un fait historique de la plateforme, sans aucun calcul). */
export const DID_YOU_KNOW = {
  source: addition('did_you_know'),
  text: 'استعمل الناس كلمات طويلة للتعبير عن التساوي، حتى جاء الرياضي الويلزي روبرت ريكورد سنة $1557$ فاختار شرطتين متوازيتين متساويتي الطول للدلالة عليه، لأنّه رأى أنّ شيئين لا يمكن أن يكونا أكثر تساويًا من شرطتين متوازيتين.',
};

/**
 * La وضعية des modules 7 et 8 : la sortie scolaire au musée. Un montant FIXE (la location du car), un montant PAR ÉLÈVE (le billet), une limite (la caisse : une inéquation), un coût final
 * (une équation). Les clés (19200, 25 et 30, 40, 500) vivent dans `FINAL` et dans le module 8 ; le module 7 n'en montre aucune.
 */
export const SITUATION = {
  source: addition('exam_style_problem'),
  title: 'الرحلة المدرسية',
  text: 'تنظّم متوسطة رحلة إلى متحف: كراء الحافلة $12000\\,\\mathrm{DA}$ ، وتذكرة الدخول $200\\,\\mathrm{DA}$ لكلّ تلميذ. عدد التلاميذ $x$ . في صندوق التعاونية $18000\\,\\mathrm{DA}$ . وفي النهاية بلغت التكلفة $20000\\,\\mathrm{DA}$ وقُسّمت بالتساوي على التلاميذ.',
  data: [
    { id: 'bus', text: 'كراء الحافلة ⁦12000 DA⁩', useful: true },
    { id: 'ticket', text: 'تذكرة الدخول ⁦200 DA⁩ لكلّ تلميذ', useful: true },
    { id: 'pupils', text: 'عدد التلاميذ ⁦x⁩', useful: true },
    { id: 'fund', text: 'صندوق التعاونية ⁦18000 DA⁩', useful: true },
    { id: 'final', text: 'التكلفة النهائية ⁦20000 DA⁩ تُقسَّم بالتساوي', useful: true },
    { id: 'museum', text: 'المتحف يفتح أبوابه صباحًا', useful: false },
    { id: 'color', text: 'الحافلة بيضاء اللون', useful: false },
  ],
  analysis: [
    { label: 'قراءة الوضعية وفهمها', text: 'مبلغ ثابت $12000\\,\\mathrm{DA}$ لا يتغيّر مع عدد التلاميذ، ومبلغ يتغيّر معه هو $200\\,\\mathrm{DA}$ عن كلّ تلميذ. الصندوق $18000\\,\\mathrm{DA}$ حدٌّ لا يجوز تجاوزه، والتكلفة النهائية $20000\\,\\mathrm{DA}$ مساواة.' },
    { label: 'تحليل التعليمة واختيار إستراتيجية حل مناسبة', text: 'نكتب التكلفة بدلالة $x$ ، ثمّ نحسب قيمتها من أجل قيمة معلومة. ونختبر المتباينة بين التكلفة والصندوق من أجل قيم معطاة. ولمعرفة عدد التلاميذ نحلّ معادلة من خطوتين: نلغي المبلغ الثابت أوّلًا ثمّ الضرب. وأخيرًا نتحقّق من نصيب كلّ تلميذ بمعادلة قسمة.' },
    { label: 'تنفيذ استراتيجية الحل', text: 'ننجز الحسابات بالترتيب، ونتحقّق من كلّ نتيجة بالتعويض في الوضعية، ثمّ نكتب الجواب بجملة واضحة.' },
  ],
};

/** Les corrections des questions du module 7 (reprises par la carte). La solution n'y figure pas. */
export const REMARKS = {
  fixedPer: 'المبلغ الثابت لا يتغيّر مع عدد التلاميذ، أمّا ما يُدفع عن كلّ تلميذ فيُضرب في عددهم: لذلك لا نخلط بينهما في العبارة.',
  testWhy: 'سؤال «هل تكفي الصندوق؟» يطلب اختبار متباينة من أجل قيم معطاة: نحسب التكلفة عند كلّ قيمة ونقارنها بمبلغ الصندوق.',
  twoStepWhy: 'لمعرفة عدد التلاميذ من تكلفة معلومة نحلّ معادلة من خطوتين: نلغي آخر عملية أُجريت (الإضافة) ثمّ نلغي الضرب بالقسمة.',
  trapWrong: 'نقسم التكلفة كلّها على سعر التذكرة: $20000\\div200$ .',
  trapWhy: 'هذه القسمة تنسى الحافلة: لو كان الناتج صحيحًا لكانت التكلفة $12000+200\\times100=32000$ ، وهي تختلف عن $20000$ .',
  trapRight: 'نطرح المبلغ الثابت أوّلًا ثمّ نقسم: العملية الأخيرة في العبارة نلغيها أوّلًا.',
  notSolvedHere: 'الحلّ نفسه في «وضعية الاختبار النهائي»: هنا فهمنا الوضعية واختطّينا الاستراتيجية فقط.',
};

/**
 * Les cinq étapes du test (module 8), évaluées. Chaque distracteur est FAUX et porte l'erreur qui le produit (vérifié dans content.test.js).
 *   E1 l'expression (ADDCOEF : fixe ajouté au coefficient ; ROLE : fixe et unitaire échangés ; produit des deux)
 *   E2 la valeur à 36 (FIXED : le car oublié ; ADDCOEF ; ROLE)
 *   E3 les valeurs qui vérifient 12000 + 200x ≤ 18000 (STRICT : ≤ lu <; 32 seul ; les trois)
 *   E4 le nombre d'élèves pour 20000 DA (FIXED : 20000 ÷ 200 ; SIGN : + 12000 annulé par une addition ; 12000 ÷ 200)
 *   E5 la vérification de « 500 DA chacun » par 20000 / x = 500 (MULTDIV ; FLIP ; SUBFORM).
 */
export const FINAL = [
  { id: 'E1', skill: 'expr', text: 'المرحلة 1 — عبارة تكلفة الرحلة بدلالة عدد التلاميذ $x$ هي ...',
    options: ['$12000+200x$', '$12200x$', '$200+12000x$', '$12000\\times200x$'], correct: 0,
    explain: 'مبلغ ثابت $12000$ ، ثمّ $200$ عن كلّ تلميذ: $200\\times x=200x$ ، فالتكلفة $12000+200x$ . الخطأ الأوّل جمع المبلغ الثابت إلى المعامل، والثاني بدّل دور العددين، والثالث ضرب المبلغين.' },
  { id: 'E2', skill: 'value', text: 'المرحلة 2 — تكلفة الرحلة من أجل $36$ تلميذًا هي ...',
    options: ['$12000+200\\times36=19200\\,\\mathrm{DA}$', '$200\\times36=7200\\,\\mathrm{DA}$', '$12200\\times36=439200\\,\\mathrm{DA}$', '$200+12000\\times36=432200\\,\\mathrm{DA}$'], correct: 0,
    explain: 'نعوّض $x=36$ ونحسب بالأولوية: $200\\times36=7200$ ثمّ $12000+7200=19200$ . الخطأ الأوّل نسي الحافلة، والثاني استعمل العبارة $12200x$ ، والثالث بدّل دور العددين.' },
  { id: 'E3', skill: 'test', text: 'المرحلة 3 — من بين $25$ ، $30$ ، $32$ : القيم التي تجعل المتباينة $12000+200x\\le18000$ صحيحة هي ...',
    options: ['$25$ و $30$', '$25$ فقط', '$32$ فقط', '$25$ و $30$ و $32$'], correct: 0,
    explain: 'من أجل $25$ : $17000\\le18000$ صحيحة ؛ من أجل $30$ : $18000\\le18000$ صحيحة لأنّ الرمز $\\le$ يقبل التساوي ؛ من أجل $32$ : $18400\\le18000$ خاطئة.' },
  { id: 'E4', skill: 'solve', text: 'المرحلة 4 — بلغت التكلفة $20000\\,\\mathrm{DA}$ : عدد التلاميذ هو ...',
    options: ['$x=40$ لأنّ $200x=8000$', '$x=100$', '$x=160$', '$x=60$'], correct: 0,
    explain: 'المعادلة $12000+200x=20000$ : نلغي الإضافة أوّلًا فنطرح $12000$ ، $200x=8000$ ، ثمّ $x=8000\\div200=40$ . الأخطاء: $20000\\div200$ ينسى الحافلة، و $(20000+12000)\\div200$ يلغي الطرح بإضافة، و $12000\\div200$ يقسم المبلغ الثابت.' },
  { id: 'E5', skill: 'check', text: 'المرحلة 5 — يقول المحاسب إنّ نصيب كلّ تلميذ $500\\,\\mathrm{DA}$ ، أي $\\frac{20000}{x}=500$ . التحقّق هو ...',
    options: ['صحيح: من أجل $x=40$ نجد $20000\\div40=500$', 'خاطئ: حلّ المعادلة $x=20000\\times500=10\\,000\\,000$', 'خاطئ: حلّ المعادلة $x=500\\div20000=0{,}025$', 'خاطئ: حلّ المعادلة $x=20000-500=19500$'], correct: 0,
    explain: 'في $\\frac{20000}{x}=500$ المجهول قاسم: $x=20000\\div500=40$ ، وهي القيمة السابقة. الأخطاء ضربت العددين، أو قلبت القسمة، أو طرحتهما.' },
];
