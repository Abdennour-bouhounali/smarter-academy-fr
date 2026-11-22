/**
 * Le contenu de « أدمج تعلّماتي — المساويات – المتباينات – المعادلات » (3AM, unité 5) — données pures. Le manuel (p. 70 : opener et تحدّي ; p. 84 : `integration` et
 * `evaluation`) est la RÉFÉRENCE ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : autres nombres, autre mise en scène). L'intégration du manuel
 * (deux cyclistes 50 / 45 km/h, 1 km d'écart) devient la poursuite de Tipaza (40 / 36 km/h, 2 km) du module 7 ; la وضعية للتقويم (sacs de farine et de sucre) devient les deux
 * camions de dattes et d'oranges du module 8 ; le تحدّي (15 750 DA) est la situation 1 (T inconnu, 24 800 DA distribués) ; aucune ligne n'envoie au manuel : `SourceTag` est muet.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » — sept affirmations de la plateforme : UNE ou deux par leçon de l'unité (المساويات والعمليات، المتباينات والعمليات، الحصر والتدوير، المعادلة من الدرجة الأولى).
 * Aucune ne donne les nombres des situations.
 */
export const PREP_ITEMS = [];

export const PREP_PLATFORM_ITEMS = [
  { skill: 'musawiyat', text: 'إذا كان $2x - 5 = 9$ فإنّ $2x = 14$ .', answer: true, why: 'نضيف $5$ إلى الطرفين معًا: $2x - 5 + 5 = 9 + 5$ ، أي $2x = 14$ .' },
  { skill: 'mutabayinat', text: 'إذا كان $a < b$ فإنّ $-2a < -2b$ .', answer: false, why: 'الضرب في عدد سالب يعكس اتجاه المتباينة: $-2a > -2b$ .' },
  { skill: 'mutabayinat', text: 'إذا كان $x \\le 4$ فإنّ $x - 6 \\le -2$ .', answer: true, why: 'طرح العدد نفسه من الطرفين يحفظ الاتجاه: $x - 6 \\le 4 - 6 = -2$ .' },
  { skill: 'hasr', text: 'مدوّر العدد $3{,}465$ إلى $0{,}01$ هو $3{,}46$ .', answer: false, why: 'الرقم الذي يلي الرتبة هو $5$ فنرفع: مدوّره $3{,}47$ .' },
  { skill: 'hasr', text: 'كل عدد مدوّره إلى $0{,}1$ هو $2{,}3$ يحقّق $2{,}25 \\le x < 2{,}35$ .', answer: true, why: 'التدوير إلى $0{,}1$ يبقي العدد على بعد نصف رتبة من $2{,}3$ : الحدّ الأدنى $2{,}25$ داخل الحصر والحدّ الأعلى $2{,}35$ خارجه.' },
  { skill: 'muadalat', text: 'العدد $3$ حلّ للمعادلة $5x - 4 = 2x + 5$ .', answer: true, why: 'نعوّض: $5 \\times 3 - 4 = 11$ و $2 \\times 3 + 5 = 11$ ، والطرفان متساويان.' },
  { skill: 'muadalat', text: 'حلّ المعادلة $3x + 7 = x - 1$ هو $4$ .', answer: false, why: '$3x - x = -1 - 7$ ، أي $2x = -8$ ، فـ $x = -4$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/**
 * La وضعية du module 7 — la poursuite de Tipaza : analyse COMPLÈTE (inconnue, traduction, équation, vérification, conclusion) puis trois décisions qui reprennent les autres
 * leçons de l'unité (la ligne d'arrivée, un arrondi à la minute, la borne de l'écart). Contrairement aux syntheses 1 et 2, cette analyse est résolue ici (le module 8 est une AUTRE
 * وضعية : les deux camions) ; l'élève la lit étape par étape puis l'applique à des variantes.
 */
export const SITUATION = {
  source: src('integration', 84, 'أدمج تعلّماتي — وضعية'),
  title: 'ملاحقة في سباق تيبازة',
  text: 'في سباق للدرّاجات بولاية تيبازة انطلق رضا بسرعة متوسطة $40\\ \\mathrm{km/h}$ خلف ياسين الذي يسبقه بمسافة $2\\ \\mathrm{km}$ ويسير بسرعة متوسطة $36\\ \\mathrm{km/h}$ . ما المدّة التي يحتاجها رضا ليلحق بياسين؟ وما المسافة التي يقطعها حينئذٍ؟',
  data: [
    { id: 'speedR', text: 'سرعة رضا 40 km/h', useful: true },
    { id: 'speedY', text: 'سرعة ياسين 36 km/h', useful: true },
    { id: 'gap', text: 'ياسين يسبق رضا بـ 2 km', useful: true },
    { id: 'place', text: 'السباق في ولاية تيبازة', useful: false },
    { id: 'shirt', text: 'قميص رضا أزرق', useful: false },
  ],
  analysis: [
    { label: 'المجهول', text: 'نسمّي $t$ مدّة اللحاق بالساعة: هي ما نبحث عنه، ويشترك فيها الدرّاجان لأنّهما يسيران معًا.' },
    { label: 'الترجمة', text: 'يقطع رضا $40t$ كيلومترًا، ويكون ياسين على بعد $36t + 2$ كيلومترًا من نقطة انطلاق رضا، أي ما قطعه $36t$ مضافًا إليه فارق الانطلاق $2$ .' },
    { label: 'المعادلة وحلّها', text: 'يلحق رضا بياسين حين يتساوى البعدان: $40t = 36t + 2$ ، فنطرح $36t$ من الطرفين: $4t = 2$ ، ثم نقسم على $4$ : $t = \\frac{1}{2}$ ساعة، أي $30$ دقيقة.' },
    { label: 'التحقّق', text: 'نعوّض: $40 \\times \\frac{1}{2} = 20$ و $36 \\times \\frac{1}{2} + 2 = 20$ . البعدان متساويان.' },
    { label: 'الخلاصة', text: 'يلحق رضا بياسين بعد $30$ دقيقة، وقد قطع $20\\ \\mathrm{km}$ .' },
  ],
};

/** La وضعية du module 8 : les deux camions — le texte de l'épreuve (la source est muette pour l'élève). */
export const TRUCKS = {
  source: src('evaluation', 84, 'وضعية للتقويم'),
  text: 'تحمل شاحنة $12$ صندوقًا من التمر و $40\\ \\mathrm{kg}$ من البرتقال، وتحمل شاحنة أخرى $8$ صناديق مماثلة و $140\\ \\mathrm{kg}$ من البرتقال. الشاحنتان تحملان الكتلة نفسها. نرمز بـ $x$ إلى كتلة الصندوق الواحد بالكيلوغرام.',
};

/** « حكاية » après l'analyse : l'ouverture historique de l'unité, réécrite (aucune date au-delà de ce que dit le texte d'origine). */
export const OPENER_STORY = {
  source: src('opener', 70, 'تمهيد'),
  text: 'المعادلات قديمة قدم الحضارات: استعملها المصريون القدماء قبل نحو أربعة آلاف سنة لتقسيم المحاصيل بين الناس، وعرفها البابليون والإغريق. ثم جاء علماء الحضارة الإسلامية فجعلوا لحلّها طريقة جبرية منظّمة: الخوارزمي في معادلات الدرجة الثانية، وعمر الخيّام في معادلات الدرجة الثالثة. أمّا ما نحلّه اليوم فمعادلات الدرجة الأولى، وهي أوّل الدرج.',
};

/** Les corrections des questions du module 7. */
export const REMARKS = {
  sumWrong: 'نجمع سرعتي الدرّاجين: $40t + 36t = 2$ .',
  sumWhy: 'الدرّاجان يسيران في الاتجاه نفسه، فلا نجمع ما قطعه كلّ منهما: نقارن بُعد رضا عن نقطة الانطلاق ببُعد ياسين عنها. الجمع يعطي $t = \\frac{1}{38}$ ساعة، وهي مدّة قصيرة لا تناسب الوضعية.',
  sumRight: 'نساوي بين بُعدين عن النقطة نفسها: $40t = 36t + 2$ .',
  finish: 'بعد $30$ دقيقة يكون رضا قد قطع $20\\ \\mathrm{km}$ ، وهذا أكبر من $15\\ \\mathrm{km}$ : يعبر خطّ الوصول قبل أن يلحق بياسين.',
  gapRound: 'الفارق $1{,}3\\ \\mathrm{km}$ يعطي $4t = 1{,}3$ ، فـ $t = 0{,}325$ ساعة، أي $0{,}325 \\times 60 = 19{,}5$ دقيقة. الرقم بعد الفاصلة هو $5$ فنرفع: $20$ دقيقة، لا $19$ .',
  gapDistance: 'في $0{,}325$ ساعة يقطع رضا $40 \\times 0{,}325 = 13\\ \\mathrm{km}$ ، وهو أقلّ من $15\\ \\mathrm{km}$ : يلحق بياسين قبل خطّ الوصول.',
  gapBound: 'مدّة اللحاق $\\frac{d}{4}$ ساعة، والمسافة المقطوعة $40 \\times \\frac{d}{4} = 10d$ . الشرط $10d \\le 15$ يعطي $d \\le 1{,}5\\ \\mathrm{km}$ .',
};

/**
 * Les cinq étapes du test (module 8), évaluées. Chaque distracteur est FAUX et porte l'erreur de l'unité qui le produit (vérifié dans content.test.js).
 *   E1 la traduction (MUADALA-TRANSLATE : les deux camions additionnés ; les deux colis échangés ; le coefficient et le terme permutés)
 *   E2 la résolution (MUADALA-SIGN-KEPT : 4x = 180 ; mauvaise division ; signe perdu)      E3 la charge commune (les oranges oubliées, comptées deux fois, ou de l'autre camion)
 *   E4 un nombre de caisses (arrondi vers le haut de 6,4 ; le quotient non arrondi ; 500 ÷ 25)    E5 l'encadrement d'une charge à partir d'une lecture arrondie (troncature ; borne haute incluse ; les 40 kg oubliés).
 */
export const FINAL = [
  { id: 'E1', skill: 'translate', text: 'المرحلة 1 — المعادلة التي تترجم أنّ الشاحنتين تحملان الكتلة نفسها هي ...',
    options: ['$12x + 40 = 8x + 140$', '$12x + 8x = 40 + 140$', '$12x + 140 = 8x + 40$', '$12 + 40x = 8 + 140x$'], correct: 0,
    explain: 'كتلة الأولى $12x + 40$ وكتلة الثانية $8x + 140$ ، والمعادلة تساوي بينهما. الخطأ الأوّل جمع الشاحنتين بدل المساواة بينهما، والثاني بدّل الأوزان 40 و 140 بين الشاحنتين، والثالث جعل الصناديق أعدادًا والأوزان معاملات.' },
  { id: 'E2', skill: 'solve', text: 'المرحلة 2 — حلّ المعادلة $12x + 40 = 8x + 140$ هو ...',
    options: ['$x = 25$', '$x = 45$', '$x = 22{,}5$', '$x = -25$'], correct: 0,
    explain: 'نطرح $8x$ و $40$ من الطرفين: $4x = 100$ ، ثم نقسم على $4$ : $x = 25$ . الخطأ الأوّل أضاف $40$ بدل أن يطرحها فوجد $4x = 180$ ، والثاني قسم $180$ على $8$ ، والثالث فقد إشارة الحلّ.' },
  { id: 'E3', skill: 'check', text: 'المرحلة 3 — كتلة حمولة كل شاحنة بالكيلوغرام هي ...',
    options: ['$340$', '$300$', '$380$', '$440$'], correct: 0,
    explain: 'نعوّض: $12 \\times 25 + 40 = 340$ و $8 \\times 25 + 140 = 340$ . الخطأ الأوّل نسي البرتقال، والثاني عدّه مرّتين، والثالث أضاف برتقال الشاحنة الأخرى.' },
  { id: 'E4', skill: 'bound', text: 'المرحلة 4 — تحمل الشاحنة الثانية $500\\ \\mathrm{kg}$ على الأكثر. أكبر عدد من الصناديق يمكن إضافته إليها هو ...',
    options: ['$6$', '$7$', '$6{,}4$', '$20$'], correct: 0,
    explain: 'الشرط $340 + 25k \\le 500$ يعطي $25k \\le 160$ ، أي $k \\le 6{,}4$ ، والعدد عدد صحيح من الصناديق: $6$ . الخطأ الأوّل رفع $6{,}4$ إلى $7$ فتتجاوز الحمولة $500\\ \\mathrm{kg}$ ، والثاني ترك القيمة غير صحيحة، والثالث قسم $500$ على $25$ دون خصم الحمولة الحالية.' },
  { id: 'E5', skill: 'round', text: 'المرحلة 5 — قاس عامل كتلة الصندوق بميزان يدوّر إلى $0{,}1\\ \\mathrm{kg}$ فقرأ $25{,}0$ . حصر $L$ ، حمولة الشاحنة الأولى، هو ...',
    options: ['$339{,}4 \\le L < 340{,}6$', '$340 \\le L < 341{,}2$', '$339{,}4 \\le L \\le 340{,}6$', '$299{,}4 \\le L < 300{,}6$'], correct: 0,
    explain: 'القراءة $25{,}0$ تعني $24{,}95 \\le x < 25{,}05$ ، فـ $12x + 40$ محصورة بين $12 \\times 24{,}95 + 40 = 339{,}4$ و $12 \\times 25{,}05 + 40 = 340{,}6$ (الحدّ الأعلى مستبعد). الخطأ الأوّل عدّ التدوير حذفًا للأرقام، والثاني أدخل الحدّ الأعلى، والثالث نسي الـ $40\\ \\mathrm{kg}$ .' },
];
